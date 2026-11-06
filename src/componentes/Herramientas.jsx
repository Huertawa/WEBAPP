export default function Herramientas({ abrirSenales, volver }) {
  return <section className="herramientas-modulo">
    <div className="titulo-pagina"><span className="etiqueta-seccion">CENTRO DE CONSULTA</span><h1>Herramientas</h1><p>Material visual y conceptos útiles para el trabajo en carretera.</p></div>
    <button type="button" className="herramienta-acceso" onClick={abrirSenales}>
      <span className="herramienta-acceso__arte" aria-hidden="true"><svg viewBox="0 0 180 150"><path d="M90 8 166 138H14Z" fill="#f8f6ed" stroke="#d83d36" strokeWidth="9" strokeLinejoin="round"/><path d="M90 43 90 91M90 110V112" stroke="#27352e" strokeWidth="10" strokeLinecap="round"/></svg></span>
      <span className="herramienta-acceso__texto"><span className="modulo-acceso__numero">01 · CONSULTA VISUAL</span><strong>Señales</strong><span>Listado por categorías, nomenclatura oficial, imágenes y explicación de elementos de la carretera.</span><b>Abrir señales →</b></span>
    </button>
    <button type="button" className="boton boton--secundario" onClick={volver}>← Volver al inicio</button>
  </section>;
}
