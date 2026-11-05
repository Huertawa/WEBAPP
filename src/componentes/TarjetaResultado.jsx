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

  const textoInmovilizacion = resultado.inmovilizacion || "La falta de habilitación del conductor no permite aplicar automáticamente cualquier supuesto de inmovilización. El artículo 104.1.k de la Ley de Tráfico contempla específicamente conducir un vehículo que exige permiso de clase C o D careciendo de la autorización correspondiente. El artículo 104.1.a se refiere a la autorización administrativa del propio vehículo, no al permiso del conductor. Para otras clases, comprobar el supuesto legal concreto, impedir que continúe conduciendo si no está habilitado y valorar que se haga cargo otro conductor autorizado.";

  return (
    <section className={`tarjeta-resultado tarjeta-resultado--${estadoPendiente ? "pendiente" : puedeConducir ? "positivo" : "negativo"}`}>
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
            {puedeConducir !== true && <div><dt>Inmovilización</dt><dd>{textoInmovilizacion}</dd></div>}
            <div><dt>Observaciones</dt><dd>{observaciones || "—"}</dd></div>
          </dl>
        </div>
      </div>

      <div className="fuentes-juridicas">
        <h3>Fuentes oficiales para contrastar</h3>
        <ul>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2009-9481" target="_blank" rel="noreferrer">Reglamento General de Conductores · artículos 15, 21, 22 y 23</a></li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722" target="_blank" rel="noreferrer">Ley de Tráfico · artículos 59, 77, 104 y 105</a></li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444" target="_blank" rel="noreferrer">Código Penal · artículo 384</a></li>
          <li><a href="https://www.boe.es/buscar/doc.php?id=FIS-Q-2026-00001" target="_blank" rel="noreferrer">Fiscalía General del Estado · Consulta 1/2026</a></li>
          <li><a href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/permisos-extranjeros-y-de-fuerzas-y-cuerpos-de-seguridad/conducir-con-un-permiso-extranjero/" target="_blank" rel="noreferrer">DGT · Conducir con un permiso extranjero</a></li>
        </ul>
      </div>
      <p className="aviso-juridico">La información jurídica debe contrastarse con la normativa vigente y las circunstancias concretas del caso.</p>
      <button className="boton boton--principal" onClick={alReiniciar}>Iniciar nueva consulta</button>
    </section>
  );
}
