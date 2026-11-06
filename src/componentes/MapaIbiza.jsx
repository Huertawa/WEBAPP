import { useEffect, useMemo, useRef, useState } from "react";

const SERVICIO = "https://ideib.caib.es/geoserveis/rest/services/public/GOIB_Xarxa_de_transports_IB/MapServer";
const EXTENSION_IBIZA = { xmin: 1.10, ymin: 38.78, xmax: 1.72, ymax: 39.18, spatialReference: { wkid: 4326 } };

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
        existente.addEventListener("load", () => resolve(window.L), { once: true });
        existente.addEventListener("error", reject, { once: true });
        if (window.L) resolve(window.L);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.dataset.leaflet = "true";
      script.onload = () => resolve(window.L);
      script.onerror = () => {
        script.remove();
        const alternativa = document.createElement("script");
        alternativa.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        alternativa.async = true;
        alternativa.dataset.leaflet = "true";
        alternativa.onload = () => resolve(window.L);
        alternativa.onerror = () => reject(new Error("No se ha podido cargar Leaflet desde los servidores disponibles."));
        document.head.appendChild(alternativa);
      };
      document.head.appendChild(script);
    });
  }
  return leafletPromise;
}

function normalizar(texto) {
  return String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

async function descargarCapa(id, campos, filtro = "1=1") {
  const acumulado = [];
  const limite = 2000;
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
      resultRecordCount: String(limite),
    });
    const respuesta = await fetch(`${SERVICIO}/${id}/query?${params.toString()}`);
    if (!respuesta.ok) throw new Error("El servicio cartográfico no responde correctamente.");
    const datos = await respuesta.json();
    if (datos.error) throw new Error(datos.error.message || "Error al consultar la cartografía oficial.");
    const lote = datos.features || [];
    acumulado.push(...lote);
    if (lote.length < limite || datos.exceededTransferLimit === false) break;
    offset += lote.length;
    if (offset > 30000) break;
  }
  return acumulado;
}

function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[caracter]);
}

export default function MapaIbiza({ volver }) {
  const contenedorMapa = useRef(null);
  const mapaRef = useRef(null);
  const capasRef = useRef({});
  const [estado, setEstado] = useState("Cargando cartografía oficial…");
  const [error, setError] = useState("");
  const [carreteras, setCarreteras] = useState(true);
  const [caminos, setCaminos] = useState(true);
  const [mostrarPK, setMostrarPK] = useState(true);
  const mostrarPKRef = useRef(mostrarPK);
  mostrarPKRef.current = mostrarPK;
  const [busqueda, setBusqueda] = useState("");
  const [datosViales, setDatosViales] = useState([]);
  const [datosPK, setDatosPK] = useState([]);

  const sugerencias = useMemo(() => {
    const consulta = normalizar(busqueda);
    if (consulta.length < 2) return [];
    const listaPK = [];
    const listaVias = [];
    for (const feature of datosPK) {
      const p = feature.properties || {};
      const numero = Number(p.NUMERO);
      const vial = p.VIAL || p.NOM || "Vía";
      const texto = normalizar(vial + " PK " + numero + " " + (p.MUNICIPI || ""));
      if (texto.includes(consulta) || (Number.isFinite(numero) && consulta === String(numero))) {
        listaPK.push({ tipo: "pk", feature, nombre: vial + " · PK " + numero, subtitulo: p.MUNICIPI || "Punto kilométrico" });
      }
      if (listaPK.length >= 8) break;
    }
    for (const feature of datosViales) {
      const p = feature.properties || {};
      const nombre = p.VIAL || p.NOM || p.NOM_ALTERN || p.DGC_VIA || "Vía sin nombre";
      const texto = normalizar([p.VIAL, p.NOM, p.NOM_ALTERN, p.DGC_VIA, p.TIPO_GE, p.MUNICIPI].join(" "));
      if (texto.includes(consulta)) listaVias.push({ tipo: "via", feature, nombre, subtitulo: p.TIPO_GE || "Vía" });
      if (listaVias.length >= 7) break;
    }
    return [...listaPK, ...listaVias].slice(0, 10);
  }, [busqueda, datosViales, datosPK]);

  useEffect(() => {
    let cancelado = false;
    let mapa;
    async function iniciar() {
      try {
        const L = await cargarLeaflet();
        if (cancelado || !contenedorMapa.current) return;
        mapa = L.map(contenedorMapa.current, { zoomControl: true, preferCanvas: true }).setView([38.98, 1.43], 10);
        mapaRef.current = mapa;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        }).addTo(mapa);
        const grupoCarreteras = L.geoJSON([], {
          style: (feature) => ({
            color: feature.properties?.TIPO_GE === "Carretera principal" || feature.properties?.TIPO_GE === "Carretera principal desdoblada" ? "#d8a84e" : "#e7e5d7",
            weight: feature.properties?.TIPO_GE === "Carretera principal" ? 4 : 2.5,
            opacity: 0.95,
          }),
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(`<strong>${escaparHTML(p.VIAL || p.NOM || "Vía")}</strong><br>${escaparHTML(p.TIPO_GE || "Carretera")}<br>${escaparHTML(p.MUNICIPI || "")}`);
          },
        });
        const grupoCaminos = L.geoJSON([], {
          style: { color: "#9ebc9b", weight: 2, opacity: 0.88, dashArray: "5 4" },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(`<strong>${escaparHTML(p.VIAL || p.NOM || "Camino")}</strong><br>${escaparHTML(p.TIPO_GE || "Camino")}<br>${escaparHTML(p.MUNICIPI || "")}`);
          },
        });
        const grupoPK = L.layerGroup();
        capasRef.current = { carreteras: grupoCarreteras, caminos: grupoCaminos, pk: grupoPK };
        grupoCarreteras.addTo(mapa);
        grupoCaminos.addTo(mapa);
        grupoPK.addTo(mapa);
        if (mapa.getZoom() < 11) mapa.removeLayer(grupoPK);
        mapa.on("zoomend", () => {
          if (mapa.getZoom() >= 11 && mostrarPKRef.current) {
            if (!mapa.hasLayer(grupoPK)) grupoPK.addTo(mapa);
          } else if (mapa.hasLayer(grupoPK)) {
            mapa.removeLayer(grupoPK);
          }
        });

        // El mapa base se muestra aunque el servicio de carreteras falle.
        mapa.invalidateSize();
        setEstado("Mapa base cargado. Descargando cartografía oficial…");
        try {
          const [viales, puntos] = await Promise.all([
            descargarCapa(3, "OBJECTID,VIAL,NOM,NOM_ALTERN,DGC_VIA,TIPO_GE,MUNICIPI,ILLA,TIPOVEHIC,TITULAR"),
            descargarCapa(2, "OBJECTID,NUMERO,VIAL,NOM,MUNICIPI,NUCLI,TIPUS_PORT,ILLA", "TIPUS_PORT = 'PK'"),
          ]);
          if (cancelado) return;
          setDatosViales(viales);
          setDatosPK(puntos);
          const featuresCarretera = viales.filter((f) => !["Camí", "Caminoi"].includes(f.properties?.TIPO_GE));
          const featuresCamino = viales.filter((f) => ["Camí", "Caminoi"].includes(f.properties?.TIPO_GE));
          grupoCarreteras.addData(featuresCarretera);
          grupoCaminos.addData(featuresCamino);
          puntos.forEach((feature) => {
            const p = feature.properties || {};
            const coords = feature.geometry?.coordinates;
            if (!coords || coords.length < 2) return;
            const marker = L.circleMarker([coords[1], coords[0]], {
              radius: 4, color: "#fff", weight: 1.5, fillColor: "#c84d43", fillOpacity: 0.95,
            });
            marker.bindPopup(`<strong>${escaparHTML(p.VIAL || p.NOM || "Vía")}</strong><br><span class="pk-popup">PK ${escaparHTML(p.NUMERO)}</span><br>${escaparHTML(p.MUNICIPI || "")}`);
            marker.addTo(grupoPK);
            feature.__marker = marker;
          });
          mapa.invalidateSize();
          setEstado(`${featuresCarretera.length.toLocaleString("es-ES")} tramos de carretera · ${featuresCamino.length.toLocaleString("es-ES")} caminos · ${puntos.length.toLocaleString("es-ES")} PK oficiales`);
        } catch (falloCartografia) {
          if (!cancelado) {
            setError("El mapa base está disponible, pero el servidor de carreteras oficiales no responde: " + (falloCartografia.message || "error de conexión"));
            setEstado("Mapa base cargado · cartografía oficial temporalmente no disponible");
            mapa.invalidateSize();
          }
        }
      } catch (e) {
        if (!cancelado) {
          if (mapa) {
            mapa.invalidateSize();
            setError("El mapa base está disponible, pero no se ha podido descargar la cartografía oficial. " + (e.message || ""));
            setEstado("Mapa base disponible · cartografía oficial no disponible");
          } else {
            setError(e.message || "No se ha podido cargar el mapa.");
            setEstado("No se ha podido iniciar el mapa. Comprueba la conexión e inténtalo de nuevo.");
          }
        }
      }
    }
    iniciar();
    return () => {
      cancelado = true;
      if (mapa) mapa.remove();
      mapaRef.current = null;
      capasRef.current = {};
    };
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    const capas = capasRef.current;
    if (!mapa || !capas.carreteras) return;
    const alternar = (capa, visible) => {
      if (visible && !mapa.hasLayer(capa)) capa.addTo(mapa);
      if (!visible && mapa.hasLayer(capa)) mapa.removeLayer(capa);
    };
    alternar(capas.carreteras, carreteras);
    alternar(capas.caminos, caminos);
    if (mostrarPK && mapa.getZoom() >= 11) alternar(capas.pk, true);
    else alternar(capas.pk, false);
  }, [carreteras, caminos, mostrarPK]);

  function seleccionarResultado(item) {
    const mapa = mapaRef.current;
    const L = window.L;
    if (!mapa || !L) return;
    setBusqueda(item.nombre);
    if (item.tipo === "pk") {
      const marker = item.feature.__marker;
      const grupoPK = capasRef.current.pk;
      if (grupoPK && !mapa.hasLayer(grupoPK)) grupoPK.addTo(mapa);
      mostrarPKRef.current = true;
      setMostrarPK(true);
      if (marker) {
        mapa.once("zoomend", () => marker.openPopup());
        mapa.setView(marker.getLatLng(), 17);
      }
    } else {
      const capa = L.geoJSON(item.feature);
      const bounds = capa.getBounds();
      if (bounds.isValid()) mapa.fitBounds(bounds.pad(0.35), { maxZoom: 16 });
      capa.eachLayer((layer) => layer.bindPopup(`<strong>${escaparHTML(item.nombre)}</strong><br>${escaparHTML(item.subtitulo)}`).openPopup());
    }
  }

  function buscar(e) {
    e.preventDefault();
    if (sugerencias.length) seleccionarResultado(sugerencias[0]);
  }

  return (
    <section className="mapa-modulo">
      <div className="mapa-modulo__cabecera">
        <div>
          <span className="etiqueta-seccion">MÓDULO 02 · CARTOGRAFÍA</span>
          <h1>Mapa de Ibiza</h1>
          <p>Red viaria, caminos y puntos kilométricos de la cartografía oficial balear.</p>
        </div>
        <button type="button" className="boton boton--secundario mapa-modulo__volver" onClick={volver}>← Herramientas</button>
      </div>
      <div className="mapa-herramientas">
        <form className="mapa-buscador" onSubmit={buscar}>
          <span aria-hidden="true">⌕</span>
          <input value={busqueda} onChange={(e) => { setBusqueda(e.target.value); }} placeholder="Buscar carretera, camino o PK (ej. EI-300 o PK 4)" aria-label="Buscar carretera, camino o punto kilométrico" />
          <button type="submit" disabled={!sugerencias.length}>Buscar</button>
          {busqueda.length >= 2 && sugerencias.length > 0 && (
            <div className="mapa-sugerencias">
              {sugerencias.map((item, i) => (
                <button type="button" key={`${item.tipo}-${i}`} onClick={() => seleccionarResultado(item)}>
                  <strong>{item.nombre}</strong><span>{item.subtitulo}</span>
                </button>
              ))}
            </div>
          )}
        </form>
        <div className="mapa-capas" aria-label="Capas visibles">
          <label><input type="checkbox" checked={carreteras} onChange={(e) => setCarreteras(e.target.checked)} /> Carreteras</label>
          <label><input type="checkbox" checked={caminos} onChange={(e) => setCaminos(e.target.checked)} /> Caminos vecinales</label>
          <label><input type="checkbox" checked={mostrarPK} onChange={(e) => setMostrarPK(e.target.checked)} /> Puntos kilométricos</label>
        </div>
      </div>
      <div className="mapa-marco">
        <div ref={contenedorMapa} className="mapa-lienzo" aria-label="Mapa interactivo de Ibiza con carreteras, caminos y puntos kilométricos" />
        {error && <div className="mapa-error"><strong>No se pudo cargar el mapa</strong><span>{error}</span><button type="button" onClick={() => window.location.reload()}>Reintentar</button></div>}
      </div>
      <div className="mapa-pie">
        <span>{estado}</span>
        <span>Cartografía viaria: ICGIB / RT-VUIB · IDEIB</span>
      </div>
      <p className="mapa-aviso">Los caminos representados son los incluidos en el inventario cartográfico oficial disponible. La presencia y denominación de caminos privados o no inventariados puede no estar reflejada. Para actuaciones, contrasta siempre la señalización y la referencia kilométrica sobre el terreno.</p>
    </section>
  );
}
