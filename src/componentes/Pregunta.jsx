export default function Pregunta({ titulo, descripcion, opciones, alSeleccionar }) {
  return (
    <section className="panel-pregunta">
      <span className="etiqueta-seccion">ASISTENTE DE PERMISOS</span>
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
    </section>
  );
}
