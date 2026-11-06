import { useEffect, useRef, useState } from "react";

const SERVICIO = "https://ideib.caib.es/geoserveis/rest/services/public/GOIB_Xarxa_de_transports_IB/MapServer";
const EXTENSION_IBIZA = {
  xmin: 1.10, ymin: 38.78, xmax: 1.72, ymax: 39.18,
  spatialReference: { wkid: 4326 },
};

// Pueblos y núcleos principales: se muestran siempre, sin nombres de calles ni POI.
const PUEBLOS = [
  { nombre: "Eivissa", coords: [38.9089, 1.4329], principal: true },
  { nombre: "Sant Antoni", coords: [38.9807, 1.3031], principal: true },
  { nombre: "Santa Eulària", coords: [38.9848, 1.5341], principal: true },
  { nombre: "Sant Josep", coords: [38.9214, 1.2931], principal: true },
  { nombre: "Sant Joan", coords: [39.0781, 1.5135], principal: true },
  { nombre: "Sant Jordi", coords: [38.8722, 1.4230], principal: false },
  { nombre: "Jesús", coords: [38.9287, 1.4588], principal: false },
  { nombre: "Sant Rafel", coords: [38.9618, 1.3905], principal: false },
  { nombre: "Sant Miquel", coords: [39.0791, 1.4375], principal: false },
  { nombre: "Sant Carles", coords: [39.0332, 1.5664], principal: false },
  { nombre: "Sant Agustí", coords: [38.9418, 1.2788], principal: false },
  { nombre: "Cala de Bou", coords: [38.9674, 1.2862], principal: false },
];

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

function nombreCarretera(p = {}) {
  return p.DGC_VIA || p.VIAL || p.NOM_ALTERN || p.NOM || "Carretera";
}

function crearIconoPueblo(L, pueblo) {
  return L.divIcon({
    className: "motolistos-pueblo-icono",
    html: `<span class="motolistos-pueblo motolistos-pueblo--${pueblo.principal ? "principal" : "secundario"}">${pueblo.nombre}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function MapaIbiza({ volver }) {
  const contenedorMapa = useRef(null);
  const mapaRef = useRef(null);
  const capasRef = useRef({});
  const [estado, setEstado] = useState("Preparando mapa de Ibiza…");
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
    const limpiar = () => {
      if (mapa) mapa.remove();
      mapaRef.current = null;
      capasRef.current = {};
    };

    async function iniciar() {
      try {
        const L = await cargarLeaflet();
        if (cancelado || !contenedorMapa.current) return;

        mapa = L.map(contenedorMapa.current, {
          zoomControl: true,
          preferCanvas: true,
          minZoom: 9,
          maxZoom: 16,
        }).setView([38.98, 1.43], 10);

        // Fondo cartográfico gris claro de Esri: no necesita API key y evita
        // el servicio CARTO que estaba devolviendo "API key required".
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
          maxZoom: 16,
          attribution: 'Fuentes: Esri, HERE, Garmin y colaboradores de OpenStreetMap',
          crossOrigin: true,
        }).addTo(mapa);

        // Solo los pueblos y núcleos que interesan para orientarse por la isla.
        const grupoPueblos = L.layerGroup();
        PUEBLOS.forEach((pueblo) => {
          L.marker(pueblo.coords, {
            icon: crearIconoPueblo(L, pueblo),
            interactive: false,
            keyboard: false,
            zIndexOffset: 900,
          }).addTo(grupoPueblos);
        });
        grupoPueblos.addTo(mapa);

        grupoVias = L.geoJSON([], {
          style: (feature) => {
            const tipo = feature.properties?.TIPO_GE || "";
            const principal = tipo.includes("principal");
            return {
              color: principal ? "#d17b25" : "#bc9a64",
              weight: principal ? 4.2 : 2.6,
              opacity: 0.92,
              lineCap: "round",
              lineJoin: "round",
            };
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            const nombre = nombreCarretera(p);
            layer.bindPopup(`<strong>${nombre}</strong><br>${p.TIPO_GE || "Carretera"}`);
          },
        }).addTo(mapa);

        grupoEtiquetas = L.layerGroup().addTo(mapa);
        grupoPK = L.layerGroup().addTo(mapa);
        mapaRef.current = mapa;
        capasRef.current = { vias: grupoVias, etiquetas: grupoEtiquetas, pk: grupoPK };

        // Los trazados oficiales incluyen carreteras principales, secundarias y locales.
        const [vias, puntos] = await Promise.all([
          descargarCapa(3, "DGC_VIA,VIAL,NOM,NOM_ALTERN,TIPO_GE,MUNICIPI", "TIPO_GE IN ('Carretera principal','Carretera principal desdoblada','Carretera secundaria','Carretera local')"),
          descargarCapa(2, "VIAL,NUMERO,MUNICIPI,TIPUS_PORT,LAT,LON", "TIPUS_PORT = 'PK'"),
        ]);
        if (cancelado) return;

        grupoVias.addData({ type: "FeatureCollection", features: vias });
        grupoPK.clearLayers();
        puntos.forEach((feature) => {
          const coords = feature.geometry?.coordinates;
          if (!coords || coords.length < 2) return;
          const p = feature.properties || {};
          const numero = Number(p.NUMERO);
          const etiqueta = Number.isFinite(numero) ? String(numero).replace(/\.0$/, "") : String(p.NUMERO || "");
          const vial = p.VIAL || "Carretera";
          const icon = L.divIcon({
            className: "motolistos-pk-icono",
            html: `<span class="motolistos-pk">PK ${etiqueta}</span>`,
            iconSize: [1, 1],
            iconAnchor: [0, 0],
          });
          const marker = L.marker([coords[1], coords[0]], { icon, keyboard: false });
          marker.bindPopup(`<strong>${vial}</strong><br>Punto kilométrico ${etiqueta}${p.MUNICIPI ? `<br>${p.MUNICIPI}` : ""}`);
          marker.addTo(grupoPK);
        });

        const actualizarEscala = () => {
          const zoom = mapa.getZoom();
          grupoEtiquetas.clearLayers();
          if (zoom >= 12) {
            const nombresMostrados = new Set();
            vias.forEach((feature) => {
              const geometria = feature.geometry;
              if (!geometria) return;
              let lineas = geometria.type === "MultiLineString" ? geometria.coordinates : [geometria.coordinates];
              lineas.forEach((linea) => {
                if (!linea || linea.length < 2) return;
                const punto = linea[Math.floor(linea.length / 2)];
                const etiqueta = nombreCarretera(feature.properties || {});
                if (!etiqueta || etiqueta === "Carretera" || nombresMostrados.has(etiqueta)) return;
                nombresMostrados.add(etiqueta);
                L.marker([punto[1], punto[0]], {
                  interactive: false,
                  keyboard: false,
                  icon: L.divIcon({
                    className: "motolistos-carretera-icono",
                    html: `<span class="motolistos-carretera-nombre">${etiqueta}</span>`,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0],
                  }),
                }).addTo(grupoEtiquetas);
              });
            });
          }
          if (zoom >= 13 && mostrarPKRef.current) {
            if (!mapa.hasLayer(grupoPK)) grupoPK.addTo(mapa);
          } else if (mapa.hasLayer(grupoPK)) {
            mapa.removeLayer(grupoPK);
          }
          if (mostrarCarreterasRef.current && !mapa.hasLayer(grupoVias)) grupoVias.addTo(mapa);
          if (!mostrarCarreterasRef.current && mapa.hasLayer(grupoVias)) mapa.removeLayer(grupoVias);
        };
        mapa.on("zoomend", actualizarEscala);
        actualizarEscala();
        setEstado(`Mapa listo · ${vias.length} tramos de carretera y ${puntos.length} puntos kilométricos`);
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
      limpiar();
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
          <h1>Mapa de Ibiza</h1>
          <p>Vista limpia de la isla. Acércate para consultar carreteras y puntos kilométricos.</p>
        </div>
        <button type="button" className="boton boton--secundario mapa-modulo__volver" onClick={volver}>← Herramientas</button>
      </div>
      <div className="mapa-herramientas">
        <div className="mapa-capas" aria-label="Opciones del mapa">
          <label><input type="checkbox" checked={mostrarCarreteras} onChange={(e) => setMostrarCarreteras(e.target.checked)} /> Carreteras</label>
          <label><input type="checkbox" checked={mostrarPK} onChange={(e) => setMostrarPK(e.target.checked)} /> Puntos kilométricos</label>
          <span className="mapa-leyenda">Los PK aparecen al acercar el mapa</span>
        </div>
      </div>
      <div className="mapa-marco">
        <div ref={contenedorMapa} className="mapa-lienzo" aria-label="Mapa simplificado de Ibiza con pueblos, carreteras y puntos kilométricos" />
        {error && <div className="mapa-error"><strong>No se pudo cargar toda la cartografía</strong><span>{error}</span><button type="button" onClick={() => window.location.reload()}>Reintentar</button></div>}
      </div>
      <div className="mapa-pie">
        <span>{estado}</span>
        <span>Red viaria y PK: cartografía oficial ICGIB / IDEIB</span>
      </div>
      <p className="mapa-aviso">Los puntos kilométricos y trazados proceden de la cartografía oficial. Contrasta siempre la señalización y la referencia sobre el terreno.</p>
    </section>
  );
}
