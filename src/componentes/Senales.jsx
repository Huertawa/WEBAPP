import { useEffect, useMemo, useState } from "react";

const FUENTE_CATALOGO = "https://r.jina.ai/https://www.dentrotest.com/senales";
const BASE_IMAGENES = "https://www.dentrotest.com/senales";
const PARAMETRO_IMAGEN = "?dpl=dpl_FKt9Ju86Nyy2Yd4JFEhoujGYBfsq";

const MUESTRA = [
  { codigo:"P-1", nombre:"Intersección con prioridad", categoria:"Peligro", descripcion:"Peligro por la proximidad de una intersección con una vía, cuyos usuarios deben ceder el paso." },
  { codigo:"P-1a", nombre:"Intersección con prioridad sobre vía a la derecha", categoria:"Peligro", descripcion:"Peligro por la proximidad de una intersección con una vía a la derecha, cuyos usuarios deben ceder el paso." },
  { codigo:"P-1b", nombre:"Intersección con prioridad sobre vía a la izquierda", categoria:"Peligro", descripcion:"Peligro por la proximidad de una intersección con una vía a la izquierda, cuyos usuarios deben ceder el paso." },
  { codigo:"P-1c", nombre:"Intersección con prioridad sobre incorporación por la derecha", categoria:"Peligro", descripcion:"Peligro por la proximidad de una incorporación por la derecha de una vía, cuyos usuarios deben ceder el paso." },
  { codigo:"P-1d", nombre:"Intersección con prioridad sobre incorporación por la izquierda", categoria:"Peligro", descripcion:"Peligro por la proximidad de una incorporación por la izquierda de una vía, cuyos usuarios deben ceder el paso." },
  { codigo:"P-1e", nombre:"Tramo con accesos directos", categoria:"Peligro", descripcion:"Peligro por la proximidad de un tramo en el que existen varios accesos directos a la vía, debiendo ceder el paso los usuarios de dichos accesos directos." },
  { codigo:"P-2", nombre:"Intersección con prioridad de la derecha", categoria:"Peligro", descripcion:"Peligro por la proximidad de una intersección en la que rige la regla general de prioridad de paso." },
  { codigo:"P-3", nombre:"Semáforos", categoria:"Peligro", descripcion:"Peligro por la proximidad de una intersección aislada o tramo con la circulación regulada por semáforos." },
  { codigo:"P-4", nombre:"Glorieta", categoria:"Peligro", descripcion:"Peligro por la proximidad de una glorieta con circulación en el sentido indicado por las flechas." },
  { codigo:"P-5", nombre:"Puente móvil", categoria:"Peligro", descripcion:"Peligro ante la proximidad de un puente que puede ser levantado o girado, interrumpiéndose así temporalmente la circulación." },
  { codigo:"P-6", nombre:"Cruce de tranvía", categoria:"Peligro", descripcion:"Peligro por la proximidad de cruce con una línea de tranvía, que tiene prioridad de paso." },
  { codigo:"P-7", nombre:"Paso a nivel con barreras", categoria:"Peligro", descripcion:"Peligro por la proximidad de un paso a nivel provisto de barreras o semibarreras." },
  { codigo:"P-8", nombre:"Paso a nivel sin barreras", categoria:"Peligro", descripcion:"Peligro por la proximidad de un paso a nivel no provisto de barreras o semibarreras." },
  { codigo:"R-1", nombre:"Ceda el paso", categoria:"Prioridad", descripcion:"Obligación de ceder el paso en la próxima intersección." },
  { codigo:"R-2", nombre:"Detención obligatoria o stop", categoria:"Prioridad", descripcion:"Obligación de detener el vehículo ante la línea de detención o antes de la intersección y ceder el paso." },
  { codigo:"R-3", nombre:"Calzada con prioridad", categoria:"Prioridad", descripcion:"Indica prioridad en las intersecciones sobre los vehículos que circulan por otra calzada." },
  { codigo:"R-4", nombre:"Fin de prioridad", categoria:"Prioridad", descripcion:"Indica el lugar en que la calzada por la que se circula pierde su prioridad." },
  { codigo:"R-5", nombre:"Prioridad del sentido contrario", categoria:"Prioridad", descripcion:"Prohíbe entrar en un paso estrecho si ello obliga a detenerse a los vehículos que circulan en sentido contrario." },
  { codigo:"R-6", nombre:"Prioridad respecto al sentido contrario", categoria:"Prioridad", descripcion:"Indica prioridad en un próximo paso estrecho respecto a los vehículos que circulan en sentido contrario." },
  { codigo:"R-100", nombre:"Circulación prohibida", categoria:"Prohibición de Entrada", descripcion:"Prohibición de circulación de toda clase de vehículos en ambos sentidos." },
  { codigo:"R-101", nombre:"Entrada prohibida", categoria:"Prohibición de Entrada", descripcion:"Prohibición de acceso a toda clase de vehículos." },
  { codigo:"R-102", nombre:"Entrada prohibida a vehículos de motor", categoria:"Prohibición de Entrada", descripcion:"Prohibición de acceso a vehículos de motor." },
  { codigo:"R-103", nombre:"Entrada prohibida a vehículos de motor, excepto motocicletas de dos ruedas", categoria:"Prohibición de Entrada", descripcion:"Prohibición de acceso a vehículos de motor, con las excepciones indicadas en la señal." }
];

function extraerSenales(texto) {
  const lineas = texto.replace(/\r/g, "").split("\n");
  const resultado = [];
  let categoria = "Otras señales";
  let pendiente = null;

  const guardar = () => {
    if (pendiente?.codigo && pendiente?.nombre) {
      const descripcion = (pendiente.descripcion || pendiente.nombre).trim().replace(/\s+/g, " ");
      resultado.push({ codigo:pendiente.codigo, nombre:pendiente.nombre.trim(), descripcion, categoria });
    }
    pendiente = null;
  };

  for (const original of lineas) {
    const linea = original.trim();
    if (!linea) continue;

    const tituloCategoria = linea.match(/^##\s+(.+?)\s*$/);
    if (tituloCategoria && !/catálogo|tu práctica/i.test(tituloCategoria[1])) {
      guardar();
      categoria = tituloCategoria[1].replace(/[*_]/g, "").trim();
      continue;
    }

    const codigo = linea.replace(/^[-*]\s*/, "").replace(/[*`]/g, "").trim().match(/^([PRS]-[A-Za-z0-9]+)$/);
    if (codigo) {
      guardar();
      pendiente = { codigo:codigo[1], nombre:"", descripcion:"" };
      continue;
    }

    if (!pendiente) continue;
    const titulo = linea.match(/^###\s+(.+?)\s*$/);
    if (titulo && !pendiente.nombre) {
      pendiente.nombre = titulo[1].replace(/[*_]/g, "").trim();
      continue;
    }

    if (pendiente.nombre && !/^(!?\[|Image:|\[Image:|\*?\d+ señales)/i.test(linea) && !linea.startsWith("#")) {
      const limpia = linea.replace(/^>\s*/, "").replace(/[*_]/g, "").trim();
      if (limpia && !/^(P|R|S)-[A-Za-z0-9]+$/.test(limpia)) {
        pendiente.descripcion += (pendiente.descripcion ? " " : "") + limpia;
      }
    }
  }
  guardar();

  const unicas = new Map();
  for (const senal of resultado) if (!unicas.has(senal.codigo)) unicas.set(senal.codigo, senal);
  return [...unicas.values()];
}

const estilos = `
.senales-nativas{color:var(--texto,#f4f5f6);width:100%}
.senales-nativas *{box-sizing:border-box}
.senales-nativas .sn-cabecera{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:22px}
.senales-nativas .sn-kicker{font-size:11px;letter-spacing:1.5px;font-weight:800;color:#a8c85a}
.senales-nativas h1{font-size:clamp(25px,3vw,34px);margin:7px 0 8px;letter-spacing:-.7px}
.senales-nativas .sn-sub{margin:0;color:var(--texto-secundario,#aab0b6);max-width:760px;line-height:1.55}
.senales-nativas .sn-volver{border:1px solid var(--borde,#3a4148);background:transparent;color:inherit;border-radius:10px;padding:10px 14px;cursor:pointer;white-space:nowrap}
.senales-nativas .sn-panel{background:var(--superficie,#1d2329);border:1px solid var(--borde,#343c44);border-radius:15px;padding:16px;margin-bottom:18px}
.senales-nativas .sn-controles{display:grid;grid-template-columns:minmax(220px,1fr) minmax(190px,260px);gap:12px}
.senales-nativas .sn-controles input,.senales-nativas .sn-controles select{width:100%;min-width:0;background:var(--fondo,#151a1f);color:inherit;border:1px solid var(--borde,#424b54);border-radius:10px;padding:13px 14px;font:inherit;outline:none}
.senales-nativas .sn-controles input:focus,.senales-nativas .sn-controles select:focus{border-color:#a8c85a}
.senales-nativas .sn-resumen{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:16px 2px 12px;color:var(--texto-secundario,#aab0b6);font-size:13px}
.senales-nativas .sn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}
.senales-nativas .sn-card{padding:12px;border-radius:14px;border:1px solid var(--borde,#343c44);background:var(--superficie,#1d2329);cursor:pointer;text-align:left;color:inherit;transition:border-color .15s,transform .15s;min-width:0}
.senales-nativas .sn-card:hover{border-color:#a8c85a;transform:translateY(-2px)}
.senales-nativas .sn-img{height:145px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:10px;margin-bottom:12px}
.senales-nativas .sn-img img{width:100%;height:100%;object-fit:contain}
.senales-nativas .sn-code{display:inline-flex;padding:4px 8px;border-radius:6px;background:#a8c85a;color:#17200a;font-size:12px;font-weight:900;letter-spacing:.3px}
.senales-nativas .sn-card h3{font-size:14px;line-height:1.35;margin:9px 0 6px}
.senales-nativas .sn-cat{font-size:11px;color:var(--texto-secundario,#aab0b6);text-transform:uppercase;letter-spacing:.6px}
.senales-nativas .sn-detalle-fondo{position:fixed;inset:0;background:#000a;z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px}
.senales-nativas .sn-detalle{width:min(560px,100%);background:var(--superficie,#20262d);border:1px solid var(--borde,#454e57);border-radius:18px;padding:22px;box-shadow:0 20px 70px #0008}
.senales-nativas .sn-detalle-img{background:#fff;border-radius:12px;height:230px;padding:12px;display:flex;justify-content:center;align-items:center;margin:14px 0}
.senales-nativas .sn-detalle-img img{height:100%;max-width:100%;object-fit:contain}
.senales-nativas .sn-detalle h2{font-size:21px;margin:10px 0}
.senales-nativas .sn-detalle p{line-height:1.6;color:var(--texto-secundario,#c2c7cc)}
.senales-nativas .sn-cerrar{float:right;background:transparent;border:1px solid var(--borde,#454e57);color:inherit;border-radius:8px;padding:7px 11px;cursor:pointer}
.senales-nativas .sn-aviso{font-size:12px;color:var(--texto-secundario,#aab0b6);margin-top:18px;line-height:1.5}
.senales-nativas .sn-estado{font-size:13px;padding:12px 14px;border-radius:10px;margin:0 0 16px;background:var(--superficie,#1d2329);border:1px solid var(--borde,#343c44)}
@media(max-width:620px){.senales-nativas .sn-cabecera{flex-direction:column}.senales-nativas .sn-controles{grid-template-columns:1fr}.senales-nativas .sn-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.senales-nativas .sn-img{height:118px}.senales-nativas .sn-card{padding:9px}}
`;

export default function Senales({ volver }) {
  const [senales, setSenales] = useState(MUESTRA);
  const [estado, setEstado] = useState("Cargando el catálogo completo de señales…");
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();
    fetch(FUENTE_CATALOGO, { signal:controlador.signal, headers:{ Accept:"text/plain" } })
      .then(respuesta => {
        if (!respuesta.ok) throw new Error("No se ha podido consultar el catálogo de origen.");
        return respuesta.text();
      })
      .then(texto => {
        const catalogo = extraerSenales(texto);
        if (catalogo.length < 400) throw new Error(`El catálogo recibido está incompleto (${catalogo.length} fichas detectadas).`);
        setSenales(catalogo);
        setEstado(`Catálogo completo cargado: ${catalogo.length} señales.`);
      })
      .catch(error => {
        if (error.name === "AbortError") return;
        setEstado("No se ha podido descargar el catálogo completo. Se mantiene la muestra de prueba de 23 señales.");
      });
    return () => controlador.abort();
  }, []);

  const categorias = useMemo(() => ["Todas", ...new Set(senales.map(s=>s.categoria))], [senales]);
  const lista = useMemo(() => senales.filter((s) => {
    const q = busqueda.trim().toLocaleLowerCase("es");
    const coincide = !q || `${s.codigo} ${s.nombre} ${s.descripcion}`.toLocaleLowerCase("es").includes(q);
    return coincide && (categoria === "Todas" || s.categoria === categoria);
  }), [senales, busqueda, categoria]);
  const imagen = (codigo) => `${BASE_IMAGENES}/${encodeURIComponent(codigo)}.png${PARAMETRO_IMAGEN}`;

  return (
    <section className="senales-nativas">
      <style>{estilos}</style>
      <div className="sn-cabecera">
        <div>
          <span className="sn-kicker">MOTOLISTOS · HERRAMIENTAS</span>
          <h1>Señales de tráfico</h1>
          <p className="sn-sub">Consulta las señales por su código, nombre o significado. Selecciona una tarjeta para ampliar su imagen y leer la explicación.</p>
        </div>
        <button className="sn-volver" onClick={volver}>← Herramientas</button>
      </div>
      <div className="sn-panel">
        <div className="sn-controles">
          <input aria-label="Buscar señales" placeholder="Buscar por código, nombre o descripción…" value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
          <select aria-label="Filtrar por categoría" value={categoria} onChange={e=>setCategoria(e.target.value)}>
            {categorias.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="sn-estado" role="status">{estado}</div>
      <div className="sn-resumen"><strong>{lista.length} señales</strong><span>{categoria === "Todas" ? "Catálogo completo" : categoria}</span></div>
      <div className="sn-grid">
        {lista.map(s=><button type="button" className="sn-card" key={s.codigo} onClick={()=>setSeleccionada(s)}>
          <div className="sn-img"><img src={imagen(s.codigo)} alt={`Señal ${s.codigo}: ${s.nombre}`} loading="lazy" onError={e=>{e.currentTarget.style.visibility="hidden";}} /></div>
          <span className="sn-code">{s.codigo}</span>
          <h3>{s.nombre}</h3>
          <span className="sn-cat">{s.categoria}</span>
        </button>)}
      </div>
      {lista.length===0 && <div className="sn-panel">No hay señales que coincidan con la búsqueda.</div>}
      {seleccionada && <div className="sn-detalle-fondo" onClick={()=>setSeleccionada(null)}>
        <article className="sn-detalle" role="dialog" aria-modal="true" aria-label={`Ficha ${seleccionada.codigo}`} onClick={e=>e.stopPropagation()}>
          <button className="sn-cerrar" onClick={()=>setSeleccionada(null)}>Cerrar ✕</button>
          <span className="sn-kicker">{seleccionada.categoria}</span>
          <h2>{seleccionada.nombre}</h2>
          <span className="sn-code">{seleccionada.codigo}</span>
          <div className="sn-detalle-img"><img src={imagen(seleccionada.codigo)} alt={seleccionada.nombre} /></div>
          <p>{seleccionada.descripcion}</p>
        </article>
      </div>}
    </section>
  );
}
