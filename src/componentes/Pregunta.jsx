export default function Pregunta({ titulo, descripcion, opciones, alSeleccionar, alVolver, pasoActual }) {
  return (
    <section className="panel-pregunta">
      <span className="etiqueta-seccion">{pasoActual ? `PASO ${pasoActual} · ` : ""}ASISTENTE DE PERMISOS</span>
      <h2>{titulo}</h2>
      {descripcion && <p className="texto-secundario">{descripcion}</p>}
      <div className="opciones-pregunta">
        {opciones.map((opcion) => (
          <button
            className={`boton ${opcion.secundaria ? "boton--secundario" : "boton--opcion"}`}
            key={opcion.valor}
            onClick={() => alSeleccionar(opcion.valor, opcion.texto)}
          >
            {opcion.texto}
          </button>
        ))}
      </div>
      {alVolver && <button className="boton boton--secundario boton--volver" onClick={alVolver}>← Volver a la pregunta anterior</button>}
    </section>
  );
}
