export default function Pregunta({ titulo, descripcion, opciones, alSeleccionar, alVolver }) {
  return (
    <section className="panel-pregunta">
      <div className="pregunta__meta">
        <span className="etiqueta-seccion">ASISTENTE DE PERMISOS</span>
      </div>
      <h2>{titulo}</h2>
      {descripcion && <p className="texto-secundario">{descripcion}</p>}
      <p className="pregunta__ayuda">Selecciona la opción que corresponda a los hechos comprobados.</p>
      <div className="opciones-pregunta">
        {opciones.map((opcion) => (
          <button
            type="button"
            className={`boton ${opcion.secundaria ? "boton--secundario" : "boton--opcion"}`}
            key={opcion.valor}
            onClick={() => alSeleccionar(opcion.valor, opcion.texto)}
          >
            <span className="opcion-pregunta__texto">{opcion.texto}</span>
            <span className="opcion-pregunta__flecha" aria-hidden="true">›</span>
          </button>
        ))}
      </div>
      {alVolver && <button className="boton boton--secundario boton--volver" onClick={alVolver}>← Volver a la pregunta anterior</button>}
    </section>
  );
}
