function clasificarOpcion(opcion) {
  if (opcion.tipo) return opcion.tipo;
  const valor = String(opcion.valor || "").toLowerCase();
  const texto = String(opcion.texto || "").toLocaleLowerCase("es");
  if (/noacreditado|pendiente|otra.?situacion|profesionalpendiente|suspendido|retirado|restringido|anulado|otra.?prohibicion|curso.no.acreditado/.test(valor) || /no puedo acreditar|no está claro|no sé|por comprobar/.test(texto)) return "revisar";
  if (/nunca|privacion|caducado|nohabilita|no.coincide|nocanje|origencanjenovalido|sinconvenio|nocumplido|plazosuperado|sinpermisopuntos|sinpermisoprivacion|sinpermisosuspensionadministrativa|suspensionadministrativa|restriccionesincumplidas|canjenoresidentenoposible|penacortacursopendiente|penacumplidasinnuevopermiso/.test(valor) || /nunca ha|no dispone|no está en vigor|no está vigente|no está caducado|no habilita|no cumple|no reúne|no se encuentra|no, está caducado|no, no lo ha superado/.test(texto)) return "negativa";
  if (/todavía no|menos de|no supera|no reside/.test(texto)) return "positiva";
  if (/^sí[, ]|^sí$|cumple|adecuada|antes de/.test(texto)) return "positiva";
  if (/después de|en la fecha de firma|otra categoría/.test(texto)) return "informativa";
  if (/^no[, ]|^no$/.test(texto)) return "informativa";
  return "informativa";
}

export default function Pregunta({ titulo, descripcion, opciones, alSeleccionar, alVolver, variante = "" }) {
  return (
    <section className={`panel-pregunta ${variante ? `panel-pregunta--${variante}` : ""}`}>
      <div className="pregunta__meta">
        <span className="etiqueta-seccion">ASISTENTE DE PERMISOS</span>
      </div>
      <h2>{titulo}</h2>
      {descripcion && (
        <details className="aclaracion-desplegable">
          <summary>Ver aclaración y qué debes comprobar</summary>
          <p className="texto-secundario pregunta__descripcion">{descripcion}</p>
        </details>
      )}
      <p className="pregunta__ayuda">Elige la opción que corresponda para continuar.</p>
      <div className="opciones-pregunta">
        {opciones.map((opcion) => {
          const tipo = clasificarOpcion(opcion);
          return (
            <button
              type="button"
              className={`boton boton--opcion-color boton--opcion-color--${tipo} ${variante === "tipo-permiso" ? `boton--tipo-permiso boton--tipo-permiso--${opcion.valor}` : ""}`}
              key={opcion.valor}
              onClick={() => alSeleccionar(opcion.valor, opcion.texto)}
            >
              {variante === "tipo-permiso" && opcion.valor === "espanol" && (
                <span className="tipo-permiso__bandera tipo-permiso__bandera--espana" aria-hidden="true"><span /></span>
              )}
              {variante === "tipo-permiso" && opcion.valor === "extranjero" && (
                <span className="tipo-permiso__banderas" aria-hidden="true">
                  <i className="tipo-permiso__bandera-pais tipo-permiso__bandera-pais--fr" />
                  <i className="tipo-permiso__bandera-pais tipo-permiso__bandera-pais--de" />
                  <i className="tipo-permiso__bandera-pais tipo-permiso__bandera-pais--it" />
                  <i className="tipo-permiso__bandera-pais tipo-permiso__bandera-pais--gb" />
                </span>
              )}
              <span className="opcion-pregunta__texto">{opcion.texto}</span>
              <span className="opcion-pregunta__flecha" aria-hidden="true">›</span>
            </button>
          );
        })}
      </div>
      {alVolver && <button className="boton boton--secundario boton--volver" onClick={alVolver}>← Volver a la pregunta anterior</button>}
    </section>
  );
}
