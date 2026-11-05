export default function TarjetaResultado({ resultado, historial, alReiniciar }) {
  const {
    nombre,
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
    ? "Situación pendiente de comprobar"
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

  const textoInmovilizacion = resultado.inmovilizacion
    || (puedeConducir === true
      ? "No procede por falta de habilitación: el resultado indica que puede conducir."
      : estadoPendiente
        ? "Pendiente de comprobar el supuesto legal concreto. No debe acordarse automáticamente."
        : "Valorar según el vehículo y el supuesto legal aplicable. El artículo 104.1.k de la Ley de Tráfico contempla específicamente vehículos que exigen permiso C o D conducidos sin la autorización correspondiente. No presupone la inmovilización automática en cualquier falta de permiso.");

  return (
    <section className={`tarjeta-resultado tarjeta-resultado--${estadoPendiente ? "pendiente" : puedeConducir ? "positivo" : "negativo"}`}>
      <div className="tarjeta-resultado__cabecera">
        <span className="etiqueta-seccion">RESULTADO DE LA CONSULTA</span>
        <h2>{tituloEstado}</h2>
        {nombre && <p className="resultado-nombre">{nombre}</p>}
        <span className={`estado-conduccion ${claseEstado}`}>
          {etiquetaEstado}
        </span>
      </div>

      <div className="resumen-operativo">
        <article className="dato-destacado dato-destacado--articulo">
          <span>ARTÍCULO APLICABLE</span>
          <strong>{articulo || "Pendiente de verificar"}</strong>
        </article>
        <article className="dato-destacado">
          <span>IMPORTE</span>
          <strong>{euros || "No procede / por determinar"}</strong>
        </article>
        <article className="dato-destacado">
          <span>PUNTOS</span>
          <strong>{puntos || "Pendiente de verificar"}</strong>
        </article>
        <article className="dato-destacado dato-destacado--inmovilizacion">
          <span>INMOVILIZACIÓN</span>
          <strong>{textoInmovilizacion}</strong>
        </article>
      </div>

      <section className="actuacion-destacada">
        <span>QUÉ HACER EN LA INTERVENCIÓN</span>
        <p>{actuacion || "Actuación pendiente de determinar."}</p>
      </section>

      <div className="tarjeta-resultado__contenido">
        <div className="bloque-datos">
          <h3>Datos comprobados en el cuestionario</h3>
          <ol className="historial-consulta">
            {historial.map((elemento, indice) => (
              <li key={indice}>{elemento}</li>
            ))}
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
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2009-9481" target="_blank" rel="noreferrer">Reglamento General de Conductores · artículos 15, 21, 22 y 23</a></li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722" target="_blank" rel="noreferrer">Ley de Tráfico · artículos 59, 77, 104 y 105</a></li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444" target="_blank" rel="noreferrer">Código Penal · artículo 384</a></li>
          <li><a href="https://www.boe.es/buscar/doc.php?id=FIS-Q-2026-00001" target="_blank" rel="noreferrer">Fiscalía General del Estado · Consulta 1/2026</a></li>
          <li><a href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/permisos-extranjeros-y-de-fuerzas-y-cuerpos-de-seguridad/conducir-con-un-permiso-extranjero/" target="_blank" rel="noreferrer">DGT · Conducir con un permiso extranjero</a></li>
        </ul>
      </div>
      <p className="aviso-juridico">La información jurídica debe contrastarse con la normativa vigente y las circunstancias concretas del caso.</p>
      <div className="acciones-resultado">
        <button className="boton boton--secundario" onClick={() => window.print()}>Imprimir / Guardar en PDF</button>
        <button className="boton boton--principal" onClick={alReiniciar}>Iniciar nueva consulta</button>
      </div>
    </section>
  );
}
