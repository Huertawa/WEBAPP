function clasificarOpcion(opcion) {
  if (opcion.tipo) return opcion.tipo;
  const valor = String(opcion.valor || "").toLowerCase();
  const texto = String(opcion.texto || "").toLocaleLowerCase("es");
  if (/noacreditado|pendiente|otra.?situacion|profesionalpendiente/.test(valor) || /no puedo acreditar|no está claro|no sé|por comprobar/.test(texto)) return "revisar";
  if (/nunca|privacion|caducado|nohabilita|no.coincide|nocanje|sinconvenio|nocumplido|plazosuperado|sinpermisopuntos|sinpermisoprivacion/.test(valor) || /nunca ha|no dispone|no está en vigor|no está vigente|no está caducado|no habilita|no cumple|no reúne|no se encuentra/.test(texto)) return "negativa";
  if (/todavía no|menos de|no supera|no reside/.test(texto)) return "positiva";
  if (/^sí[, ]|^sí$|cumple|adecuada|antes de/.test(texto)) return "positiva";
  if (/después de|en la fecha de firma|otra categoría/.test(texto)) return "informativa";
  if (/^no[, ]|^no$/.test(texto)) return "informativa";
  return "informativa";
}

const etiquetasOpcion = {
  positiva: "Cumple",
  negativa: "No cumple",
  revisar: "Comprobar",
  informativa: "Seleccionar",
};

export default function Pregunta({ titulo, descripcion, opciones, alSeleccionar, alVolver }) {
  return (
    <section className="panel-pregunta">
      <div className="pregunta__meta">
        <span className="etiqueta-seccion">ASISTENTE DE PERMISOS</span>
      </div>
      <h2>{titulo}</h2>
      {descripcion && <p className="texto-secundario pregunta__descripcion">{descripcion}</p>}
      <div className="pregunta__leyenda" aria-label="Significado de los colores">
        <span className="pregunta__leyenda-item pregunta__leyenda-item--positiva"><i /> Cumple / favorable</span>
        <span className="pregunta__leyenda-item pregunta__leyenda-item--negativa"><i /> No cumple</span>
        <span className="pregunta__leyenda-item pregunta__leyenda-item--revisar"><i /> Requiere comprobación</span>
      </div>
      <p className="pregunta__ayuda">Selecciona la opción que corresponda a los hechos comprobados.</p>
      <div className="opciones-pregunta">
        {opciones.map((opcion) => {
          const tipo = clasificarOpcion(opcion);
          return (
            <button
              type="button"
              className={`boton boton--opcion-color boton--opcion-color--${tipo}`}
              key={opcion.valor}
              onClick={() => alSeleccionar(opcion.valor, opcion.texto)}
            >
              <span className="opcion-pregunta__indicador" aria-hidden="true" />
              <span className="opcion-pregunta__contenido">
                <span className="opcion-pregunta__texto">{opcion.texto}</span>
                <small>{etiquetasOpcion[tipo]}</small>
              </span>
              <span className="opcion-pregunta__flecha" aria-hidden="true">›</span>
            </button>
          );
        })}
      </div>
      {alVolver && <button className="boton boton--secundario boton--volver" onClick={alVolver}>← Volver a la pregunta anterior</button>}
    </section>
  );
}
