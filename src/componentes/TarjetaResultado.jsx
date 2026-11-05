export default function TarjetaResultado({ resultado, historial, alReiniciar }) {
  const {
    nombre, puedeConducir, motivo, normativa, articulo, euros, puntos,
    actuacion, observaciones, denuncia,
  } = resultado;

  const estadoPendiente = puedeConducir === null || puedeConducir === undefined;
  const tituloEstado = estadoPendiente
    ? "Situación pendiente de comprobar"
    : puedeConducir ? "Puede conducir" : "No puede conducir";
  const etiquetaEstado = estadoPendiente
    ? "COMPROBACIÓN NECESARIA"
    : puedeConducir ? "AUTORIZADO" : "NO AUTORIZADO";
  const claseEstado = estadoPendiente
    ? "estado-conduccion--pendiente"
    : puedeConducir ? "estado-conduccion--positivo" : "estado-conduccion--negativo";

  const textoInmovilizacion = resultado.inmovilizacion
    || (puedeConducir === true
      ? "No procede por falta de habilitación: el resultado indica que puede conducir."
      : estadoPendiente
        ? "Pendiente de comprobar el supuesto legal concreto. No debe acordarse automáticamente."
        : "Valorar según el vehículo y el supuesto legal aplicable. El artículo 104.1.k de la Ley de Tráfico contempla específicamente vehículos que exigen permiso C o D conducidos sin la autorización correspondiente. No presupone la inmovilización automática en cualquier falta de permiso.");

  const importeVisible = denuncia?.importe || euros || "No procede / por determinar";
  const puntosVisibles = denuncia?.puntos || puntos || "Pendiente de verificar";

  return (
    <section className={`tarjeta-resultado tarjeta-resultado--${estadoPendiente ? "pendiente" : puedeConducir ? "positivo" : "negativo"}`}>
      <div className="tarjeta-resultado__cabecera">
        <span className="etiqueta-seccion">RESULTADO DE LA CONSULTA</span>
        <h2>{tituloEstado}</h2>
        {nombre && <p className="resultado-nombre">{nombre}</p>}
        <span className={`estado-conduccion ${claseEstado}`}>{etiquetaEstado}</span>
      </div>

      <div className="resumen-operativo">
        <article className="dato-destacado dato-destacado--articulo">
          <span>ARTÍCULO APLICABLE</span>
          <strong>{articulo || "Pendiente de verificar"}</strong>
        </article>
        <article className="dato-destacado dato-destacado--importe">
          <span>IMPORTE DE REFERENCIA</span>
          <strong>{importeVisible}</strong>
        </article>
        <article className="dato-destacado dato-destacado--puntos">
          <span>DETRACCIÓN DE PUNTOS</span>
          <strong>{puntosVisibles}</strong>
        </article>
        <article className="dato-destacado dato-destacado--inmovilizacion">
          <span>INMOVILIZACIÓN</span>
          <strong>{textoInmovilizacion}</strong>
        </article>
      </div>

      {denuncia ? (
        <section className="propuesta-denuncia">
          <div className="propuesta-denuncia__cabecera">
            <div>
              <span>PROPUESTA DE DENUNCIA</span>
              <p>Datos aplicables al supuesto identificado</p>
            </div>
            <strong>{denuncia.calificacion}</strong>
          </div>
          <div className="propuesta-denuncia__grid">
            <div><small>PRECEPTO INFRINGIDO</small><strong>{denuncia.preceptoInfringido}</strong></div>
            <div><small>PRECEPTO SANCIONADOR</small><strong>{denuncia.preceptoSancionador}</strong></div>
            <div><small>IMPORTE</small><strong>{denuncia.importe}</strong></div>
            <div><small>DETRACCIÓN</small><strong>{denuncia.puntos}</strong></div>
            <div className="propuesta-denuncia__codigo">
              <small>CODIFICACIÓN DE REFERENCIA</small>
              <strong>{denuncia.codificado}</strong>
            </div>
          </div>
          <p>{denuncia.fundamento}</p>
          <p className="propuesta-denuncia__aviso">Antes de extender el boletín, contrasta el código y la redacción exacta con el catálogo sancionador vigente y con los hechos acreditados.</p>
        </section>
      ) : !puedeConducir ? (
        <section className="sancion-pendiente">
          <strong>No se asigna automáticamente una denuncia</strong>
          <p>Con los datos disponibles no es seguro fijar todavía un importe, una detracción de puntos o un código de boletín. Primero hay que concretar la causa y descartar que los hechos tengan relevancia penal.</p>
        </section>
      ) : null}

      <section className="actuacion-destacada">
        <span>QUÉ HACER EN LA INTERVENCIÓN</span>
        <p>{actuacion || "Actuación pendiente de determinar."}</p>
      </section>

      <div className="tarjeta-resultado__contenido">
        <div className="bloque-datos">
          <h3>Datos comprobados en el cuestionario</h3>
          <ol className="historial-consulta">
            {historial.map((elemento, indice) => <li key={indice}>{elemento}</li>)}
          </ol>
        </div>
        <div className="bloque-datos">
          <h3>Fundamento jurídico</h3>
          <dl className="datos-juridicos">
            <div><dt>Motivo</dt><dd>{motivo || "Pendiente de verificar"}</dd></div>
            <div><dt>Normativa</dt><dd>{normativa || "Pendiente de verificar"}</dd></div>
            <div><dt>Observaciones</dt><dd>{observaciones || "—"}</dd></div>
          </dl>
        </div>
      </div>

      <div className="fuentes-juridicas">
        <h3>Fuentes oficiales para contrastar</h3>
        <ul>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2009-9481" target="_blank" rel="noreferrer">Reglamento General de Conductores</a></li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722" target="_blank" rel="noreferrer">Ley de Tráfico · texto consolidado</a></li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444" target="_blank" rel="noreferrer">Código Penal · artículo 384</a></li>
          <li><a href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/permisos-extranjeros-y-de-fuerzas-y-cuerpos-de-seguridad/conducir-con-un-permiso-extranjero/" target="_blank" rel="noreferrer">DGT · Conducir con un permiso extranjero</a></li>
        </ul>
      </div>
      <p className="aviso-juridico">Herramienta de apoyo. Comprueba siempre la vigencia normativa, la codificación y las circunstancias concretas antes de formular una denuncia.</p>
      <div className="acciones-resultado">
        <button className="boton boton--principal" onClick={alReiniciar}>Iniciar nueva consulta</button>
      </div>
    </section>
  );
}
