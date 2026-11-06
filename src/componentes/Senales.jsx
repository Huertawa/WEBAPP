import {useState} from "react";

const CATALOGO_COMPLETO = "https://www.dentrotest.com/senales";
const CATALOGO_OFICIAL = "https://www.boe.es/eli/es/rd/2025/06/10/465/dof/spa/pdf";

export default function Senales({volver}) {
  const [cargaError, setCargaError] = useState(false);

  return (
    <section className="senales-modulo">
      <div className="senales-cabecera">
        <div>
          <span className="etiqueta-seccion">HERRAMIENTAS · CATÁLOGO</span>
          <h1>Señales de tráfico</h1>
          <p>Catálogo de 457 señales verticales, con fichas individuales, códigos, denominaciones, explicaciones e imágenes. Puedes buscar por código, nombre o categoría.</p>
        </div>
        <button className="boton boton--secundario" onClick={volver}>← Herramientas</button>
      </div>

      <div className="senales-catalogo-externo">
        {!cargaError ? (
          <iframe
            title="Catálogo completo de 457 señales verticales"
            src={CATALOGO_COMPLETO}
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            onError={() => setCargaError(true)}
            style={{display:"block",width:"100%",minHeight:"1100px",height:"calc(100vh - 210px)",border:"0",borderRadius:"14px",background:"#fff"}}
          />
        ) : (
          <div className="senales-error">
            <h2>No se ha podido cargar el catálogo integrado</h2>
            <p>Abre el catálogo completo en una pestaña nueva. Contiene las 457 fichas individuales con sus imágenes y buscador.</p>
            <a href={CATALOGO_COMPLETO} target="_blank" rel="noreferrer">Abrir las 457 señales ↗</a>
          </div>
        )}
      </div>

      <details className="senales-informacion-final">
        <summary>Fuentes y normativa</summary>
        <p>El catálogo de referencia normativa de señalización vigente se publicó mediante el Real Decreto 465/2025.</p>
        <a href={CATALOGO_OFICIAL} target="_blank" rel="noreferrer">Consultar catálogo oficial del BOE ↗</a>
        <p>Las fichas didácticas integradas incluyen código, nombre, descripción e imagen individual. La aplicación enlaza al catálogo completo para evitar duplicar o desactualizar sus registros.</p>
      </details>
    </section>
  );
}
