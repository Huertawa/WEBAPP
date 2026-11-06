export default function Herramientas({ abrirSenales, volver }) {
  return <section className="herramientas-modulo">
    <div className="titulo-pagina"><span className="etiqueta-seccion">CENTRO DE CONSULTA</span><h1>Herramientas</h1><p>Material visual y conceptos útiles para el trabajo en carretera.</p></div>
    <button type="button" className="herramienta-acceso" onClick={abrirSenales}>
      <span className="herramienta-acceso__arte" aria-hidden="true">
        <svg viewBox="0 0 240 170" role="img">
          <path d="M32 10 76 87H-12Z" transform="translate(23 0)" fill="#f5f2e8" stroke="#d9483b" strokeWidth="7" strokeLinejoin="round"/>
          <path d="M55 33 55 58M55 70v2" stroke="#29382f" strokeWidth="7" strokeLinecap="round"/>
          <circle cx="143" cy="43" r="32" fill="#f6f5ef" stroke="#d9483b" strokeWidth="7"/>
          <path d="M124 43h38M143 24v38" stroke="#27372e" strokeWidth="7" strokeLinecap="round"/>
          <circle cx="205" cy="43" r="25" fill="#2473bd" stroke="#e8f0e8" strokeWidth="4"/>
          <path d="M205 24v38m-13-13 13 13 13-13" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M92 145 109 91h25l17 54z" fill="#ef6b32" stroke="#f7f3e9" strokeWidth="5" strokeLinejoin="round"/>
          <path d="M101 119h40" stroke="white" strokeWidth="9"/>
          <path d="M155 135h77M161 126h65" stroke="#d7dcd5" strokeWidth="8" strokeLinecap="round"/>
          <path d="M165 120v27m24-27v27m24-27v27" stroke="#d7dcd5" strokeWidth="4"/>
          <rect x="15" y="111" width="48" height="35" rx="4" fill="#f3eee2" stroke="#d9483b" strokeWidth="5"/>
          <path d="m23 140 29-22" stroke="#d9483b" strokeWidth="8"/>
        </svg>
      </span>
      <span className="herramienta-acceso__texto"><span className="modulo-acceso__numero">01 · CONSULTA VISUAL</span><strong>Señales</strong><span>Catálogo oficial completo, señalización, balizamiento y elementos de carretera con fotografías.</span><b>Abrir señales →</b></span>
    </button>
    <button type="button" className="boton boton--secundario" onClick={volver}>← Volver al inicio</button>
  </section>;
}