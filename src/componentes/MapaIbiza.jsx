import { useEffect, useRef, useState } from "react";

const SERVICIO = "https://ideib.caib.es/geoserveis/rest/services/public/GOIB_Xarxa_de_transports_IB/MapServer";
const EXTENSION_IBIZA = {
  xmin: 1.10, ymin: 38.78, xmax: 1.72, ymax: 39.18,
  spatialReference: { wkid: 4326 },
};

let leafletPromise;
function cargarLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (!leafletPromise) {
    leafletPromise = new Promise((resolve, reject) => {
      if (!document.querySelector('link[data-leaflet="true"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
        link.dataset.leaflet = "true";
        document.head.appendChild(link);
      }
      const existente = document.querySelector('script[data-leaflet="true"]');
      if (existente) {
        if (window.L) return resolve(window.L);
        existente.addEventListener("load", () => resolve(window.L), { once: true });
        existente.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.dataset.leaflet = "true";
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error("No se ha podido cargar el visor cartográfico."));
      document.head.appendChild(script);
    });
  }
  return leafletPromise;
}

async function descargarCapa(id, campos, filtro = "1=1") {
  const acumulado = [];
  let offset = 0;
  while (true) {
    const params = new URLSearchParams({
      where: filtro,
      outFields: campos,
      returnGeometry: "true",
      outSR: "4326",
      f: "geojson",
      geometry: JSON.stringify(EXTENSION_IBIZA),
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      resultOffset: String(offset),
      resultRecordCount: "2000",
    });
    const respuesta = await fetch(`${SERVICIO}/${id}/query?${params.toString()}`);
    if (!respuesta.ok) throw new Error("El servicio oficial de carreteras no responde.");
    const datos = await respuesta.json();
    if (datos.error) throw new Error(datos.error.message || "No se han podido consultar las carreteras.");
    const lote = datos.features || [];
    acumulado.push(...lote);
    if (lote.length < 2000) break;
    offset += lote.length;
    if (offset > 30000) break;
  }
  return acumulado;
}

// Prioriza el nombre real de la vía. DGC_VIA puede ser un identificador,
// no una denominación legible para mostrar en el mapa.
function nombreCarretera(p = {}) {
  return p.NOM_ALTERN || p.NOM || p.VIAL || p.DGC_VIA || "";
}

function escaparHTML(valor = "") {
  return String(valor).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

export default function MapaIbiza({ volver }) {
  const contenedorMapa = useRef(null);
  const mapaRef = useRef(null);
  const [estado, setEstado] = useState("Preparando mapa satelital…");
  const [error, setError] = useState("");
  const [mostrarPK, setMostrarPK] = useState(true);
  const [mostrarCarreteras, setMostrarCarreteras] = useState(true);
  const mostrarPKRef = useRef(mostrarPK);
  const mostrarCarreterasRef = useRef(mostrarCarreteras);
  mostrarPKRef.current = mostrarPK;
  mostrarCarreterasRef.current = mostrarCarreteras;

  useEffect(() => {
    let cancelado = false;
    let mapa;
    let grupoVias;
    let grupoEtiquetas;
    let grupoPK;

    async function iniciar() {
      try {
        const L = await cargarLeaflet();
        if (cancelado || !contenedorMapa.current) return;

        mapa = L.map(contenedorMapa.current, {
          zoomControl: true,
          preferCanvas: true,
          minZoom: 9,
          maxZoom: 18,
        }).setView([38.98, 1.43], 10);

        // Imagen satelital pública de Esri, sin etiquetas de pueblos ni POI.
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          maxZoom: 18,
          attribution: "Imágenes: Esri, Maxar, Earthstar Geographics y colaboradores",
          crossOrigin: true,
        }).addTo(mapa);

        grupoVias = L.geoJSON([], {
          style: (feature) => {
            const tipo = feature.properties?.TIPO_GE || "";
            const principal = tipo.includes("principal") || tipo === "Autopista";
            const camino = tipo === "Camí" || tipo === "Caminoi";
            return {
              color: camino ? "#f2d28a" : principal ? "#fff1a8" : "#ffffff",
              weight: camino ? 2.1 : principal ? 4 : 2.8,
              opacity: camino ? 0.78 : 0.95,
              lineCap: "round",
              lineJoin: "round",
            };
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            const nombre = nombreCarretera(p) || "Vía sin denominación";
            layer.bindPopup(`<strong>${escaparHTML(nombre)}</strong><br>${escaparHTML(p.TIPO_GE || "Vía")}`);
          },
        }).addTo(mapa);

        grupoEtiquetas = L.layerGroup().addTo(mapa);
        grupoPK = L.layerGroup().addTo(mapa);
        mapaRef.current = mapa;

        // Incluye carreteras y caminos de la red viaria oficial.
        const [vias, puntos] = await Promise.all([
          descargarCapa(
            3,
            "DGC_VIA,VIAL,NOM,NOM_ALTERN,TIPO_GE,MUNICIPI",
            "TIPO_GE IN ('Autopista','Carretera principal','Carretera principal desdoblada','Carretera secundaria','Carretera local','Camí','Caminoi')"
          ),
          descargarCapa(2, "VIAL,NUMERO,MUNICIPI,TIPUS_PORT,LAT,LON,ID_VIAL", "TIPUS_PORT = 'PK'"),
        ]);
        if (cancelado) return;

        grupoVias.addData({ type: "FeatureCollection", features: vias });

        // Etiquetas PK asociadas visualmente a la vía a la que pertenecen.
        puntos.forEach((feature) => {
          const coords = feature.geometry?.coordinates;
          if (!coords || coords.length < 2) return;
          const p = feature.properties || {};
          const numero = Number(p.NUMERO);
          if (!Number.isFinite(numero)) return;
          const etiqueta = String(numero).replace(/\.0$/, "");
          const vial = p.VIAL || "Vía sin nombre";
          const icon = L.divIcon({
            className: "motolistos-pk-icono",
            html: `<span class="motolistos-pk"><b>${escaparHTML(vial)}</b><span>PK ${escaparHTML(etiqueta)}</span></span>`,
            iconSize: [1, 1],
            iconAnchor: [0, 0],
          });
          const marker = L.marker([coords[1], coords[0]], {
            icon,
            keyboard: false,
            opacity: 0.98,
          });
          marker.bindPopup(`<strong>${escaparHTML(vial)}</strong><br>Punto kilométrico ${escaparHTML(etiqueta)}${p.MUNICIPI ? `<br>${escaparHTML(p.MUNICIPI)}` : ""}`);
          marker.addTo(grupoPK);
        });

        const actualizarEscala = () => {
          const zoom = mapa.getZoom();
          grupoEtiquetas.clearLayers();

          // Las etiquetas se limitan a vías con nombre y se repiten solo
          // cuando hay tramos suficientemente separados en el mapa.
          if (zoom >= 12 && mostrarCarreterasRef.current) {
            const anclasPorNombre = new Map();
            vias.forEach((feature) => {
              const p = feature.properties || {};
              const nombre = nombreCarretera(p);
              if (!nombre) return;
              const geometria = feature.geometry;
              if (!geometria) return;
              const lineas = geometria.type === "MultiLineString"
                ? geometria.coordinates
                : geometria.type === "LineString" ? [geometria.coordinates] : [];
              lineas.forEach((linea) => {
                if (!linea || linea.length < 2) return;
                const punto = linea[Math.floor(linea.length / 2)];
                if (!punto || punto.length < 2) return;
                const anteriores = anclasPorNombre.get(nombre) || [];
                const demasiadoCerca = anteriores.some((anterior) => {
                  const a = mapa.latLngToLayerPoint([anterior[1], anterior[0]]);
                  const b = mapa.latLngToLayerPoint([punto[1], punto[0]]);
                  return a.distanceTo(b) < (zoom >= 14 ? 260 : 420);
                });
                if (!demasiadoCerca && anteriores.length < 5) {
                  anteriores.push(punto);
                  anclasPorNombre.set(nombre, anteriores);
                }
              });
            });

            anclasPorNombre.forEach((anclas, nombre) => {
              anclas.forEach((punto) => {
                L.marker([punto[1], punto[0]], {
                  interactive: false,
                  keyboard: false,
                  icon: L.divIcon({
                    className: "motolistos-carretera-icono",
                    html: `<span class="motolistos-carretera-nombre">${escaparHTML(nombre)}</span>`,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0],
                  }),
                }).addTo(grupoEtiquetas);
              });
            });
          }

          if (zoom >= 15 && mostrarPKRef.current) {
            if (!mapa.hasLayer(grupoPK)) grupoPK.addTo(mapa);
          } else if (mapa.hasLayer(grupoPK)) {
            mapa.removeLayer(grupoPK);
          }
          if (mostrarCarreterasRef.current && !mapa.hasLayer(grupoVias)) grupoVias.addTo(mapa);
          if (!mostrarCarreterasRef.current && mapa.hasLayer(grupoVias)) mapa.removeLayer(grupoVias);
        };

        mapa.on("zoomend moveend", actualizarEscala);
        actualizarEscala();
        setEstado(`Mapa satelital listo · ${vias.length} tramos de vías y ${puntos.length} PK oficiales`);
      } catch (e) {
        if (!cancelado) {
          setError(e.message || "No se ha podido cargar la cartografía.");
          setEstado("No se ha podido completar la carga del mapa");
        }
      }
    }

    iniciar();
    return () => {
      cancelado = true;
      if (mapa) mapa.remove();
      mapaRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapaRef.current) mapaRef.current.fire("zoomend");
  }, [mostrarPK, mostrarCarreteras]);

  return (
    <section className="mapa-modulo">
      <div className="mapa-modulo__cabecera">
        <div>
          <span className="etiqueta-seccion">MÓDULO 02 · CARTOGRAFÍA</span>
          <h1>Mapa de carreteras</h1>
          <p>Cartografía satelital. Acércate para ver las carreteras, caminos vecinales y sus puntos kilométricos.</p>
        </div>
        <button type="button" className="boton boton--secundario mapa-modulo__volver" onClick={volver}>← Herramientas</button>
      </div>
      <div className="mapa-herramientas">
        <div className="mapa-capas" aria-label="Opciones del mapa">
          <label><input type="checkbox" checked={mostrarCarreteras} onChange={(e) => setMostrarCarreteras(e.target.checked)} /> Carreteras y caminos</label>
          <label><input type="checkbox" checked={mostrarPK} onChange={(e) => setMostrarPK(e.target.checked)} /> Puntos kilométricos</label>
          <span className="mapa-leyenda">Nombres desde zoom 12 · PK desde zoom 15</span>
        </div>
      </div>
      <div className="mapa-marco mapa-marco--satelital">
        <div ref={contenedorMapa} className="mapa-lienzo" aria-label="Mapa de carreteras con caminos y puntos kilométricos" />
        {error && <div className="mapa-error"><strong>No se pudo cargar toda la cartografía</strong><span>{error}</span><button type="button" onClick={() => window.location.reload()}>Reintentar</button></div>}
      </div>
      <div className="mapa-pie">
        <span>{estado}</span>
        <span>Red viaria y PK: cartografía oficial ICGIB / IDEIB</span>
      </div>
      <p className="mapa-aviso">La red viaria y los PK proceden de la cartografía oficial. Contrasta siempre la señalización y la referencia sobre el terreno.</p>
    </section>
  );
}
