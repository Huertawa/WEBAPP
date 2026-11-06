import { useMemo, useState } from "react";

const BASE_BOE = "https://www.boe.es/datos/imagenes/disp/2003/306/";
const senales = [
  { grupo:"Advertencia de peligro", codigo:"P-1", nombre:"Intersección con prioridad", detalle:"Advierte de una intersección con una vía cuyos usuarios deben ceder el paso.", imagen:"23514_50101.png" },
  { grupo:"Advertencia de peligro", codigo:"P-3", nombre:"Semáforos", detalle:"Advierte de la proximidad de una intersección o tramo con semáforos.", imagen:"23514_50107.png" },
  { grupo:"Advertencia de peligro", codigo:"P-4", nombre:"Intersección con circulación giratoria", detalle:"Advierte de la proximidad de una glorieta o intersección de circulación giratoria.", imagen:"23514_50108.png" },
  { grupo:"Prioridad", codigo:"R-1", nombre:"Ceda el paso", detalle:"Obliga a ceder el paso en la próxima intersección a los vehículos de la vía a la que se aproxima.", imagen:"23514_50201.png" },
  { grupo:"Prioridad", codigo:"R-2", nombre:"Detención obligatoria (STOP)", detalle:"Obliga a detenerse ante la línea de detención o, si no existe, antes de la intersección y ceder el paso.", imagen:"23514_50202.png" },
  { grupo:"Prohibición de entrada", codigo:"R-100", nombre:"Circulación prohibida", detalle:"Prohíbe la circulación de toda clase de vehículos en ambos sentidos.", imagen:"23514_50301.png" },
  { grupo:"Prohibición de entrada", codigo:"R-101", nombre:"Entrada prohibida", detalle:"Prohíbe el acceso a los vehículos que se encuentren de frente a la señal.", imagen:"23514_50302.png" },
  { grupo:"Restricción de paso", codigo:"R-200", nombre:"Prohibición de pasar sin detenerse", detalle:"Indica la obligación de detenerse y cumplir la causa de la detención indicada o exigible.", imagen:"23514_50401.png" },
  { grupo:"Obligación", codigo:"R-400a", nombre:"Sentido obligatorio", detalle:"Obliga a seguir el sentido indicado por la flecha.", imagen:"23514_50601.png" },
  { grupo:"Fin de prohibición o restricción", codigo:"R-500", nombre:"Fin de prohibiciones", detalle:"Indica el lugar desde el que dejan de aplicarse las prohibiciones específicas anteriores.", imagen:"23514_50701.png" },
  { grupo:"Fin de prohibición o restricción", codigo:"R-501", nombre:"Fin de limitación de velocidad", detalle:"Indica el lugar desde el que deja de ser aplicable la limitación máxima de velocidad anterior.", imagen:"23514_50702.png" },
  { grupo:"Indicación general", codigo:"S-1", nombre:"Autopista", detalle:"Indica el principio de una autopista y las normas especiales de circulación que la rigen.", imagen:"23514_50801.png" },
  { grupo:"Indicación general", codigo:"S-2", nombre:"Fin de autopista", detalle:"Indica el final de una autopista.", imagen:"23514_50802.png" }
];

const conceptos = [
  { nombre:"Hito kilométrico", etiqueta:"REFERENCIA DE CARRETERA", texto:"Elemento situado junto a la vía que identifica la carretera y el punto kilométrico. Permite localizar un lugar concreto para comunicar incidencias, accidentes, averías o necesidades de conservación.", dibujo:"hito" },
  { nombre:"Bionda", etiqueta:"BARRERA DE SEGURIDAD", texto:"Sistema de contención metálico, normalmente formado por una banda ondulada de acero anclada a postes. Su función es reducir las consecuencias de una salida de vía o de determinados impactos, redirigiendo el vehículo.", dibujo:"bionda" },
  { nombre:"Calzada", etiqueta:"PARTE DE LA VÍA", texto:"Parte de la carretera destinada a la circulación de vehículos. Puede estar formada por uno o varios carriles. No incluye, por regla general, el arcén ni la mediana.", dibujo:"calzada" },
  { nombre:"Carril", etiqueta:"CIRCULACIÓN", texto:"Banda longitudinal en que puede estar subdividida la calzada, delimitada o no por marcas viales longitudinales, y con anchura suficiente para permitir la circulación de una fila de automóviles que no sean motocicletas.", dibujo:"carril" },
  { nombre:"Arcén", etiqueta:"ZONA LATERAL", texto:"Franja longitudinal afirmada contigua a la calzada, no destinada al uso ordinario de automóviles salvo en los supuestos previstos. Puede ser transitable o no y tener anchura variable.", dibujo:"arcen" },
  { nombre:"Mediana", etiqueta:"SEPARACIÓN DE CALZADAS", texto:"Franja longitudinal situada entre dos plataformas separadas, no destinada a la circulación. Separa físicamente sentidos o calzadas cuando la vía dispone de ella.", dibujo:"mediana" },
  { nombre:"Cuneta", etiqueta:"DRENAJE", texto:"Zanja longitudinal situada normalmente junto al borde de la carretera para recoger y evacuar el agua de lluvia y evitar que se acumule en la plataforma.", dibujo:"cuneta" },
  { nombre:"Camino vecinal", etiqueta:"VÍA DE ÁMBITO LOCAL", texto:"Vía de carácter local que suele comunicar núcleos pequeños, fincas o zonas rurales. La denominación no determina por sí sola su titularidad ni su régimen: hay que comprobar el inventario y la señalización aplicable.", dibujo:"camino" }
];

const grupos = ["Todos", ...new Set(senales.map((s) => s.grupo))];

function DibujoConcepto({ tipo }) {
  if (tipo === "hito") return <svg viewBox="0 0 260 150" role="img" aria-label="Ilustración de un hito kilométrico"><path d="M0 126H260" stroke="#718078" strokeWidth="3"/><path d="M82 126V38Q82 29 92 29H157Q167 29 167 39V126Z" fill="#f2eee2" stroke="#52665a" strokeWidth="3"/><rect x="91" y="44" width="67" height="28" rx="3" fill="#244d39"/><text x="124" y="63" fill="white" fontSize="15" fontWeight="bold" textAnchor="middle">PM-781</text><text x="124" y="101" fill="#263b30" fontSize="27" fontWeight="bold" textAnchor="middle">4</text><text x="124" y="116" fill="#52665a" fontSize="9" textAnchor="middle">PUNTO KM</text></svg>;
  if (tipo === "bionda") return <svg viewBox="0 0 260 150" role="img" aria-label="Ilustración de una bionda metálica"><path d="M0 125H260" stroke="#64756b" strokeWidth="3"/><path d="M10 60Q25 47 40 60T70 60T100 60T130 60T160 60T190 60T220 60T250 60" fill="none" stroke="#c2c9c5" strokeWidth="15"/><path d="M10 60Q25 47 40 60T70 60T100 60T130 60T160 60T190 60T220 60T250 60" fill="none" stroke="#68766f" strokeWidth="2"/>{[35,95,155,215].map(x=><path key={x} d={`M${x} 60V126`} stroke="#6f7b74" strokeWidth="7"/>)}</svg>;
  if (tipo === "calzada" || tipo === "carril" || tipo === "arcen" || tipo === "mediana") return <svg viewBox="0 0 260 150" role="img" aria-label={`Esquema de ${tipo}`}><rect x="20" y="22" width="220" height="106" rx="8" fill="#65716d"/><path d="M130 22V128" stroke="#fff" strokeWidth="3" strokeDasharray="12 9"/>{tipo==="arcen"&&<><rect x="20" y="22" width="27" height="106" fill="#c9c5ad"/><rect x="213" y="22" width="27" height="106" fill="#c9c5ad"/><text x="33" y="140" fill="currentColor" fontSize="9" textAnchor="middle">ARCÉN</text></>}{tipo==="mediana"&&<><rect x="121" y="22" width="18" height="106" fill="#9cab83"/><path d="M72 22V128M188 22V128" stroke="#fff" strokeWidth="2" strokeDasharray="10 8"/></>}{tipo==="carril"&&<text x="130" y="80" fill="white" fontSize="14" textAnchor="middle">CARRIL</text>}{tipo==="calzada"&&<text x="130" y="80" fill="white" fontSize="14" textAnchor="middle">CALZADA</text>}</svg>;
  if (tipo === "cuneta") return <svg viewBox="0 0 260 150" role="img" aria-label="Ilustración de una cuneta"><path d="M0 45H75L120 120H160L205 45H260" fill="none" stroke="#69766e" strokeWidth="10"/><path d="M112 105Q140 125 168 105" fill="none" stroke="#4b9ac0" strokeWidth="8"/><path d="M0 135H260" stroke="#69766e" strokeWidth="2"/></svg>;
  return <svg viewBox="0 0 260 150" role="img" aria-label="Ilustración de un camino vecinal"><path d="M70 150Q95 90 115 0H150Q175 90 200 150Z" fill="#b49a72"/><path d="M125 150 130 0" stroke="#eee0c5" strokeWidth="3" strokeDasharray="10 9"/><path d="M0 125Q45 90 80 90M180 90Q220 90 260 125" fill="none" stroke="#6c8b60" strokeWidth="12"/></svg>;
}

export default function Senales({ volver }) {
  const [grupo, setGrupo] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [pestana, setPestana] = useState("senales");
  const filtradas = useMemo(() => senales.filter((s) => (grupo === "Todos" || s.grupo === grupo) && `${s.codigo} ${s.nombre} ${s.detalle}`.toLowerCase().includes(busqueda.toLowerCase())), [grupo, busqueda]);
  return <section className="senales-modulo">
    <div className="senales-cabecera">
      <div><span className="etiqueta-seccion">MÓDULO 03 · HERRAMIENTAS</span><h1>Señales y elementos de la vía</h1><p>Consulta visual de señales de circulación y vocabulario habitual de carretera.</p></div>
      <button className="boton boton--secundario" onClick={volver}>← Herramientas</button>
    </div>
    <div className="senales-pestanas"><button className={pestana==="senales"?"activa":""} onClick={()=>setPestana("senales")}>Señales de tráfico</button><button className={pestana==="conceptos"?"activa":""} onClick={()=>setPestana("conceptos")}>Elementos de la vía</button></div>
    {pestana === "senales" ? <>
      <div className="senales-controles"><input type="search" value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar por código o nombre (ej. R-1, STOP…)" aria-label="Buscar señal"/><select value={grupo} onChange={e=>setGrupo(e.target.value)} aria-label="Filtrar por apartado">{grupos.map(g=><option key={g}>{g}</option>)}</select></div>
      <p className="senales-contador">{filtradas.length} señales en esta selección · Imágenes del catálogo oficial del BOE</p>
      <div className="senales-grid">{filtradas.map(s=><article className="senal-card" key={s.codigo}><div className="senal-card__imagen"><img src={BASE_BOE+s.imagen} alt={`Señal ${s.codigo}: ${s.nombre}`} loading="lazy" onError={e=>{e.currentTarget.style.display="none";e.currentTarget.parentElement.classList.add("sin-imagen");}}/><span className="senal-card__fallback">{s.codigo}</span></div><div className="senal-card__texto"><span>{s.grupo}</span><strong>{s.codigo} · {s.nombre}</strong><p>{s.detalle}</p></div></article>)}</div>
      <p className="senales-nota">Listado inicial de señales habituales, no un catálogo exhaustivo. La señalización oficial aplicable es la recogida en el Reglamento General de Circulación y sus modificaciones.</p>
    </> : <div className="conceptos-grid">{conceptos.map(c=><article className="concepto-card" key={c.nombre}><div className="concepto-card__dibujo"><DibujoConcepto tipo={c.dibujo}/></div><div className="concepto-card__texto"><span>{c.etiqueta}</span><h2>{c.nombre}</h2><p>{c.texto}</p></div></article>)}</div>}
    <div className="senales-fuentes"><strong>Fuente normativa e imágenes</strong><a href="https://www.boe.es/eli/es/rd/2003/11/21/1428/con" target="_blank" rel="noreferrer">Reglamento General de Circulación · Catálogo oficial de señales (BOE)</a></div>
  </section>;
}
