export default function TarjetaResultado({ resultado, historial, alReiniciar }) {
  const {
    codigo,
    puedeConducir,
    motivo,
    normativa,
    articulo,
    euros,
    puntos,
    actuacion,
    observaciones,
  } = resultado;

  const estadoPendiente = puedeConducir === null || puedeConducir === undefined;
  const tituloEstado = estadoPendiente
    ? "Validez pendiente de comprobar"
    : puedeConducir
      ? "Puede conducir"
      : "No puede conducir";
  const etiquetaEstado = estadoPendiente
    ? "COMPROBACIÓN NECESARIA"
    : puedeConducir
      ? "AUTORIZADO"
      : "NO AUTORIZADO";
  const claseEstado = estadoPendiente
    ? "estado-conduccion--pendiente"
    : puedeConducir
      ? "estado-conduccion--positivo"
      : "estado-conduccion--negativo";

  return (
    <section className="tarjeta-resultado">
      <div className="tarjeta-resultado__cabecera">
        <span className="etiqueta-seccion">RESULTADO DE LA CONSULTA</span>
        <h2>{tituloEstado}</h2>
        <span className={`estado-conduccion ${claseEstado}`}>
          {etiquetaEstado}
        </span>
      </div>

      <div className="tarjeta-resultado__contenido">
        <div className="bloque-datos">
          <h3>Datos de la consulta</h3>
          <ol className="historial-consulta">
            {historial.map((elemento, indice) => (
              <li key={indice}>{elemento}</li>
            ))}
          </ol>
        </div>

        <div className="bloque-datos">
          <h3>Fundamento y actuación</h3>
          <dl className="datos-juridicos">
            <div><dt>Código</dt><dd>{codigo || "Pendiente"}</dd></div>
            <div><dt>Motivo</dt><dd>{motivo || "Pendiente de verificar"}</dd></div>
            <div><dt>Normativa</dt><dd>{normativa || "Pendiente de verificar"}</dd></div>
            <div><dt>Artículo</dt><dd>{articulo || "Pendiente de verificar"}</dd></div>
            <div><dt>Importe</dt><dd>{euros || "Pendiente de verificar"}</dd></div>
            <div><dt>Puntos</dt><dd>{puntos || "Pendiente de verificar"}</dd></div>
            <div><dt>Actuación</dt><dd>{actuacion || "Pendiente de verificar"}</dd></div>
            <div><dt>Observaciones</dt><dd>{observaciones || "—"}</dd></div>
          </dl>
        </div>
      </div>

      <p className="aviso-juridico">La información jurídica debe contrastarse con la normativa vigente y las circunstancias concretas del caso.</p>
      <button className="boton boton--principal" onClick={alReiniciar}>Iniciar nueva consulta</button>
    </section>
  );
}
