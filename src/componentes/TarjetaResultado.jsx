import { useEffect, useState } from "react";

export default function TarjetaResultado({ resultado, historial, alReiniciar }) {
  const normalizarCodificacion = (valor) => String(valor ?? "").replace(/\b0+(\d+)\b/g, "$1");
  const [claseVehiculo, setClaseVehiculo] = useState("");
  useEffect(() => {
    setClaseVehiculo("");
  }, [resultado.codigo]);

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

  const inmovilizacion = (() => {
    if (resultado.inmovilizacion) {
      return { estado: "COMPROBAR SUPUESTO", detalle: resultado.inmovilizacion, tipo: "pendiente" };
    }
    if (puedeConducir === true) {
      return { estado: "NO PROCEDE", detalle: "El resultado confirma que el permiso habilita para conducir. No hay motivo de inmovilización por falta de autorización.", tipo: "no" };
    }
    if (["PER003", "PER005", "PER011"].includes(resultado.codigo)) {
      return { estado: "NO PROCEDE POR CADUCIDAD SOLA", detalle: "La caducidad del permiso no implica por sí misma inmovilizar el vehículo. La intervención del documento, cuando proceda conforme al artículo 12.4 RGC, es una medida distinta. Comprueba si existe otra causa legal independiente antes de adoptar una inmovilización.", tipo: "no" };
    }
    if (resultado.codigo === "PER013") {
      return { estado: "DEPENDE DEL VEHÍCULO", detalle: "Si conduce un vehículo que exige permiso C o D y carece de esa autorización, puede acordarse conforme al artículo 104.1.k de la Ley de Tráfico. Para otras categorías, no se aplica automáticamente este apartado.", tipo: "depende" };
    }
    return {
      estado: "NO ES AUTOMÁTICA",
      detalle: "La falta o invalidez del permiso no implica por sí sola inmovilizar. El artículo 104.1.k contempla específicamente vehículos que requieren permiso C o D y se conducen sin la autorización correspondiente. Comprueba la clase del vehículo y la causa concreta.",
      tipo: "depende"
    };
  })();

  const decisionInmovilizacion = claseVehiculo === "cd"
    ? { titulo: "PUEDE ACORDARSE", detalle: "Si el vehículo exige permiso C o D y el conductor carece de esa autorización, el artículo 104.1.k permite a los agentes inmovilizarlo. La medida se levanta cuando cese la causa." }
    : claseVehiculo === "otro"
      ? { titulo: "NO POR EL ART. 104.1.K", detalle: "Ese apartado se limita a vehículos que exigen permiso C o D. Comprueba si concurre otro motivo legal de inmovilización." }
      : null;

  const consecuenciaPenal = ({
    PER001: "ART. 384 CP · Nunca obtuvo permiso: debe acreditarse que jamás fue titular de permiso o licencia que habilite para conducir en ningún Estado. La pena prevista es prisión de 3 a 6 meses, multa de 12 a 24 meses o trabajos en beneficio de la comunidad de 31 a 90 días. Si no se acredita el tipo penal, la DGT contempla la posible vía administrativa muy grave (referencia general: 500 €, arts. 1.1 RGC y 77.k LTSV), que exige calificación propia.",
    PER019: "ART. 384, PÁRRAFO PRIMERO, CP · Pérdida total de puntos: debe existir resolución administrativa que declare la pérdida de vigencia precisamente por agotamiento de todos los puntos, con eficacia anterior a la conducción. Comprueba notificación y fecha de efectos. La pena prevista es prisión de 3 a 6 meses, multa de 12 a 24 meses o trabajos en beneficio de la comunidad de 31 a 90 días.",
    PER020: "ART. 384, PÁRRAFO SEGUNDO, CP · Privación judicial: la conducción debe producirse mientras siga vigente una privación cautelar o definitiva acordada por un órgano judicial. Comprueba resolución, alcance y fechas. La pena prevista es prisión de 3 a 6 meses, multa de 12 a 24 meses o trabajos en beneficio de la comunidad de 31 a 90 días."
  })[resultado.codigo] || "";
  const importeVisible = estadoPendiente
    ? euros || denuncia?.importe || "No procede / por determinar"
    : denuncia?.importe || euros || "No procede / por determinar";
  const puntosVisibles = estadoPendiente
    ? puntos || denuncia?.puntos || "Pendiente de verificar"
    : denuncia?.puntos || puntos || "Pendiente de verificar";
  const comprobacionesPorCaso = {
    PER002: ["Comprobar en el Registro de Conductores e Infractores que el permiso español figura vigente y sin suspensión o pérdida de vigencia.", "Contrastar que la categoría y las restricciones del permiso habilitan para el vehículo concreto.", "Verificar que no existe una privación judicial ni una medida administrativa que impida conducir."],
    PER004: ["Comprobar que el permiso UE/EEE está vigente en el Estado expedidor y no está suspendido, retirado o restringido.", "Contrastar categoría, fechas de validez y edad mínima exigida en España.", "Si el titular reside en España, revisar si resulta aplicable el artículo 15.4 RGC y la obligación de renovación."],
    PER006: ["Verificar la identidad, autenticidad y vigencia del permiso nacional extranjero.", "Comprobar que el titular cumple la edad mínima española y que la categoría habilita para el vehículo.", "Acreditar la entrada regular, el plazo de seis meses y que el formato o reconocimiento internacional es válido en España."],
    PER007: ["Acreditar cuándo adquirió la residencia normal en España y calcular correctamente los seis meses.", "Comprobar vigencia, edad mínima española, categoría y restricciones del permiso.", "Verificar que el documento cumple el artículo 21 RGC o el convenio internacional aplicable."],
    PER001: ["Consultar el Registro de Conductores e Infractores y comprobar si obtuvo permiso en España o en otro Estado.", "Descartar pérdida total de puntos y privación judicial: son supuestos diferenciados del artículo 384 CP.", "Identificar el vehículo y documentar los elementos del posible ilícito penal."],
    PER003: ["Comprobar la fecha de caducidad y descartar que exista una renovación o autorización provisional vigente.", "Intervenir inmediatamente el permiso caducado conforme al artículo 12.4 RGC y tramitar la denuncia como infracción grave: 200 € y 0 puntos.", "Impedir que el titular continúe conduciendo; distinguir la intervención del documento de la inmovilización del vehículo y permitir que se haga cargo otro conductor habilitado, si procede."],
    PER005: ["Comprobar la fecha de vigencia del permiso y si existe renovación o sustitución válida.", "Verificar restricciones, retirada o suspensión en el Estado expedidor y, si procede, el reconocimiento en España.", "No confundir caducidad documental con privación del derecho a conducir."],
    PER008: ["Confirmar la fecha de adquisición de residencia normal y el cómputo del plazo de seis meses.", "Consultar el convenio vigente con el país y comprobar que esa categoría concreta es canjeable.", "Verificar fecha de obtención, restricciones, vigencia y posibles excepciones profesionales."],
    PER009: ["Comprobar en la relación oficial de la DGT si existe convenio aplicable o reconocimiento específico.", "Verificar el modelo internacional del permiso, traducción y requisitos esenciales.", "Descartar la vía excepcional de canje profesional antes de cerrar la calificación."],
    PER010: ["Acreditar documentalmente las fechas de residencia y obtención del permiso.", "Comprobar la excepción específica de Corea del Sur y el convenio del país expedidor.", "Valorar la vía de canje profesional si reúne todos los requisitos legales."],
    PER012: ["Acreditar la fecha de adquisición de residencia normal y la fecha exacta de expedición del permiso surcoreano.", "Comprobar el texto vigente del convenio bilateral España–República de Corea y las condiciones de canje aplicables a esa categoría.", "Verificar vigencia, autenticidad, restricciones y si el titular dispone de un permiso español ya expedido; no dar por hecho que la excepción temporal autoriza automáticamente a conducir."],
    PER011: ["Verificar que el permiso extranjero está realmente caducado y no renovado.", "Comprobar el reconocimiento del documento y las reglas del país expedidor.", "Determinar la infracción concreta antes de asignar importe, puntos o código."],
    PER013: ["Identificar la clasificación técnica del vehículo y la categoría que exige.", "Comprobar categorías, fechas de vigencia, restricciones y códigos armonizados del permiso.", "Descartar autorización complementaria o supuesto penal antes de extender denuncia."],
    PER014: ["Acreditar la edad del conductor y la categoría extranjera concreta.", "Aplicar la edad mínima española del permiso equivalente y revisar excepciones.", "No fijar sanción ni puntos hasta determinar el encaje administrativo exacto."],
    PER015: ["Comprobar si el permiso está redactado en castellano o acompañado de traducción oficial.", "Verificar los modelos de Ginebra/Viena o permiso internacional acompañado del nacional.", "Consultar si existe convenio o reconocimiento específico para ese país."],
    PER016: ["Confirmar residencia normal en España durante al menos dos años.", "Identificar grupo 1 o grupo 2 y comprobar los límites de vigencia del artículo 15.4 RGC.", "Verificar que no se ha renovado o sustituido el permiso y que el supuesto encaja en la infracción grave."],
    PER017: ["Acreditar la fecha de entrada regular y la situación de residencia del titular.", "Comprobar vigencia, edad mínima, formato reconocido y condiciones del artículo 21 RGC.", "Consultar convenio y circunstancias concretas antes de concluir que el permiso carece de validez."],
    PER018: ["Comprobar que el permiso encaja en los modelos del artículo 21.1.a) o b).", "Acreditar al menos seis meses de contratación como conductor profesional y la relación laboral exigida.", "Verificar prueba de circulación, cotización y ausencia de privación, suspensión o intervención."],
    PER019: ["Obtener y comprobar la resolución de pérdida de vigencia por pérdida total de puntos.", "Verificar notificación, fecha de efectos y que la conducción fue posterior.", "Diferenciarlo de otras causas de pérdida de vigencia y aplicar el criterio penal vigente."],
    PER020: ["Comprobar la resolución judicial y si la privación era efectiva en el momento de conducir.", "Verificar alcance, fechas, carácter cautelar o firmeza e identidad del conductor.", "No confundir privación judicial con suspensión administrativa."],
    PER021: ["Consultar el registro y concretar la causa exacta de falta de validez.", "Diferenciar caducidad, suspensión, pérdida de vigencia, retirada judicial y permiso extranjero no reconocido.", "No aplicar automáticamente el artículo 384 CP ni asignar sanción sin identificar el supuesto."],
    PER022: ["Acreditar la fecha de expedición del permiso mediante documento oficial del país emisor.", "Acreditar la fecha de adquisición de residencia normal en España y, si existe convenio, consultar la fecha de firma.", "No calificar como 5B o 5E ni fijar multa o puntos hasta comprobar la susceptibilidad de canje."],
    PER023: ["Averiguar si el permiso fue expedido directamente o procede de un canje anterior.", "Identificar el país de origen del permiso inicial y comprobar el convenio aplicable.", "Mantener la calificación pendiente hasta completar esa verificación."],
    PER024: ["Comprobar que la pena de privación del derecho a conducir ya se ha cumplido y su duración exacta.", "Verificar si superó los dos años y si se dictó pérdida de vigencia al amparo del artículo 47.3 CP.", "Comprobar si ha obtenido el nuevo permiso conforme al artículo 73.1 LTSV y aplicar la Consulta 1/2026 FGE."],
    PER025: ["Identificar si la motocicleta exige A1, A2 o A y comprobar potencia y relación potencia/peso.", "Acreditar edad, antigüedad de la categoría y formación exigida para el acceso progresivo a A.", "Describir el requisito concreto incumplido y contrastar CON 001.1.5C."],
    PER026: ["Obtener la resolución administrativa de suspensión cautelar o prohibición de uso.", "Comprobar notificación, vigencia, alcance y fecha de efectos de la medida.", "Aplicar el artículo 39.3 RGC y 76.s LTSV; no confundir con privación judicial."],
    PER027: ["Acreditar la duración de la pena y que ya se ha cumplido.", "Comprobar que la condena fue igual o inferior a dos años.", "Verificar que no se ha superado el curso de reeducación exigido por el artículo 73.2 LTSV."],
    PER028: ["Acreditar que la pena de hasta dos años ya se ha cumplido.", "Comprobar el certificado de superación del curso de reeducación y sensibilización vial.", "Descartar cualquier otra suspensión, pérdida de vigencia o restricción que impida conducir."]
    ,PER029: ["Identificar el código armonizado o la restricción concreta que figura en el permiso.", "Comprobar que la restricción sigue vigente y no existe adaptación o autorización posterior.", "Describir el incumplimiento concreto y contrastar CON 012.6 opción 5A."]
  };
  const comprobaciones = resultado.comprobaciones || comprobacionesPorCaso[resultado.codigo] || [
    "Comprobar la identidad del conductor y la autenticidad del documento.",
    "Verificar en el Registro de Conductores e Infractores la situación administrativa actual.",
    "Contrastar la normativa y la codificación vigente antes de cerrar la intervención."
  ];


  return (
    <section className={`tarjeta-resultado tarjeta-resultado--${estadoPendiente ? "pendiente" : puedeConducir ? "positivo" : "negativo"}`}>
      <div className="tarjeta-resultado__cabecera">
        <span className="etiqueta-seccion">RESULTADO DE LA CONSULTA</span>
        <h2>{tituloEstado}</h2>
        {nombre && <p className="resultado-nombre">{nombre}</p>}
        <span className={`estado-conduccion ${claseEstado}`}>{etiquetaEstado}</span>
      </div>

      {(denuncia?.codificado || resultado.orientacionSancion?.codificado) && (
        <div className="propuesta-denuncia__codigo codificacion-principal">
          <small>{estadoPendiente ? "CODIFICACIÓN ORIENTATIVA · PENDIENTE DE COMPROBACIÓN" : "CODIFICACIÓN DE REFERENCIA"}</small>
          <strong>{normalizarCodificacion(denuncia?.codificado || resultado.orientacionSancion.codificado)}</strong>
        </div>
      )}

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
        <article className={`dato-destacado dato-destacado--inmovilizacion inmovilizacion--${inmovilizacion.tipo}`}>
          <span>INMOVILIZACIÓN DEL VEHÍCULO</span>
          <strong className="inmovilizacion__estado">{inmovilizacion.estado}</strong>
          <p className="inmovilizacion__detalle">{inmovilizacion.detalle}</p>
          {!estadoPendiente && puedeConducir === false && !["PER003", "PER005", "PER011"].includes(resultado.codigo) && (
            <div className="inmovilizacion__comprobacion">
              <p className="inmovilizacion__pregunta">¿Qué tipo de vehículo conduce?</p>
              <div className="inmovilizacion__opciones">
                <button type="button" className={`boton boton--opcion ${claseVehiculo === "cd" ? "seleccionado" : ""}`} aria-pressed={claseVehiculo === "cd"} onClick={() => setClaseVehiculo("cd")}>Requiere permiso C o D</button>
                <button type="button" className={`boton boton--secundario ${claseVehiculo === "otro" ? "seleccionado" : ""}`} aria-pressed={claseVehiculo === "otro"} onClick={() => setClaseVehiculo("otro")}>Otra categoría (A, B, etc.)</button>
              </div>
              {decisionInmovilizacion && (
                <div className={`inmovilizacion__decision ${claseVehiculo === "cd" ? "es-posible" : "no-aplica"}`}>
                  <strong>{decisionInmovilizacion.titulo}</strong>
                  <p>{decisionInmovilizacion.detalle}</p>
                </div>
              )}
            </div>
          )}
        </article>
      </div>



      {consecuenciaPenal && (
        <details className="aclaracion-desplegable aclaracion-desplegable--penal">
          <summary>Ver aclaración penal · artículo 384 del Código Penal</summary>
          <section className="consecuencia-penal">
            <strong>POSIBLE CONSECUENCIA PENAL · ART. 384 CP</strong>
            <p>{consecuenciaPenal}</p>
          </section>
        </details>
      )}

      {denuncia ? (
        <section className="propuesta-denuncia">
          <div className="propuesta-denuncia__cabecera">
            <div>
              <span>{estadoPendiente ? "ORIENTACIÓN DE DENUNCIA" : "PROPUESTA DE DENUNCIA"}</span>
              <p>{estadoPendiente ? "Encuadre y codificación condicionados a las comprobaciones pendientes" : "Datos de referencia para el supuesto identificado"}</p>
            </div>
            <strong>{denuncia.calificacion}</strong>
          </div>
          <div className="propuesta-denuncia__grid">
            <div><small>PRECEPTO INFRINGIDO</small><strong>{denuncia.preceptoInfringido}</strong></div>
            <div><small>PRECEPTO SANCIONADOR</small><strong>{denuncia.preceptoSancionador}</strong></div>
            <div><small>IMPORTE</small><strong>{denuncia.importe}</strong></div>
            <div><small>DETRACCIÓN</small><strong>{denuncia.puntos}</strong></div>
          </div>
          <details className="aclaracion-desplegable aclaracion-desplegable--compacta">
            <summary>Ver fundamento y advertencias de la denuncia</summary>
            <p>{denuncia.fundamento}</p>
            <p className="propuesta-denuncia__aviso">{estadoPendiente ? "No extender denuncia basándose únicamente en esta orientación: confirma primero la validez del permiso, el país, la categoría, el convenio y todos los requisitos del supuesto." : "Antes de extender el boletín, contrasta el código y la redacción exacta con el catálogo sancionador vigente y con los hechos acreditados."}</p>
          </details>
        </section>
      ) : resultado.orientacionSancion ? (
        <section className="orientacion-sancion">
          <div className="orientacion-sancion__cabecera">
            <span>ORIENTACIÓN SANCIONADORA</span>
            <strong>{resultado.orientacionSancion.calificacion}</strong>
          </div>
          <div className="propuesta-denuncia__grid">
            <div><small>IMPORTE ORIENTATIVO</small><strong>{resultado.orientacionSancion.importe}</strong></div>
            <div><small>PUNTOS</small><strong>{resultado.orientacionSancion.puntos}</strong></div>
            <div><small>PRECEPTO INFRINGIDO</small><strong>{resultado.orientacionSancion.preceptoInfringido}</strong></div>
            <div><small>PRECEPTO SANCIONADOR</small><strong>{resultado.orientacionSancion.preceptoSancionador}</strong></div>
          </div>
          <details className="aclaracion-desplegable aclaracion-desplegable--compacta">
            <summary>Ver fundamento y condiciones de esta orientación</summary>
            <p>{resultado.orientacionSancion.fundamento}</p>
            <p className="orientacion-sancion__aviso">Orientación condicionada: este resultado no confirma por sí solo la infracción ni sustituye la comprobación del país, convenio, permiso y circunstancias concretas.</p>
          </details>
        </section>
      ) : !puedeConducir ? (
        <details className="aclaracion-desplegable">
          <summary>No se asigna automáticamente una denuncia</summary>
          <section className="sancion-pendiente">
            <p>Con los datos disponibles no es seguro fijar todavía un importe, una detracción de puntos o un código de boletín. Primero hay que concretar la causa y descartar que los hechos tengan relevancia penal.</p>
          </section>
        </details>
      ) : null}

      <details className="aclaracion-desplegable">
        <summary>Ver comprobaciones de la intervención ({comprobaciones.length})</summary>
        <section className="lista-comprobacion">
          <div className="lista-comprobacion__cabecera">
            <span>CONTROL DE LA INTERVENCIÓN</span>
            <small>{comprobaciones.length} comprobaciones recomendadas</small>
          </div>
          <ol>
            {comprobaciones.map((item, indice) => <li key={indice}>{item}</li>)}
          </ol>
        </section>
      </details>

      <section className="actuacion-destacada">
        <span>QUÉ HACER EN LA INTERVENCIÓN</span>
        <p>{actuacion || "Actuación pendiente de determinar."}</p>
      </section>

      <details className="aclaracion-desplegable">
        <summary>Ver fundamento jurídico, motivo y observaciones</summary>
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
      </details>

      <details className="aclaracion-desplegable">
        <summary>Ver normativa y fuentes oficiales</summary>
        <div className="fuentes-juridicas">
          <h3>Fuentes oficiales para contrastar</h3>
        <p className="fuentes-juridicas__revision">Revisión de referencias: 06/11/2026. La DGT publica en SIPP la guía codificada extendida vigente desde el 01/10/2026. La codificación aparece una sola vez al inicio del resultado; si está pendiente, se identifica expresamente como orientativa. Contrasta siempre el precepto, opción, gravedad y puntos en la guía vigente antes de emitir el boletín.</p>
        <ul>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2009-9481" target="_blank" rel="noreferrer">Reglamento General de Conductores</a></li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722" target="_blank" rel="noreferrer">Ley de Tráfico · texto consolidado</a></li>
          <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444" target="_blank" rel="noreferrer">Código Penal · artículo 384</a></li>
          <li><a href="https://www.boe.es/buscar/doc.php?coleccion=fiscalia&id=FIS-Q-2026-00001" target="_blank" rel="noreferrer">Fiscalía General del Estado · Consulta 1/2026 (pérdida de vigencia judicial tras cumplir condena)</a></li>
          <li><a href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/permisos-extranjeros-y-de-fuerzas-y-cuerpos-de-seguridad/conducir-con-un-permiso-extranjero/" target="_blank" rel="noreferrer">DGT · Conducir con un permiso extranjero</a></li>
          <li><a href="https://sede-org.dgt.gob.es/es/multas/tramites-para-administraciones/sipp-notificacion-de-sanciones/" target="_blank" rel="noreferrer">DGT · SIPP: guía codificada extendida vigente desde 01/10/2026 y versiones anteriores</a></li>
          <li><a href="https://www.dgt.es/comunicacion/noticias/20250221-sin-los-papeles-en-regla/" target="_blank" rel="noreferrer">DGT · Sin los papeles en regla: sanciones por permisos caducados y extranjeros</a></li>
          <li><a href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/permisos-extranjeros-y-de-fuerzas-y-cuerpos-de-seguridad/canjes-de-permisos/paises-con-convenio-de-canjes/" target="_blank" rel="noreferrer">DGT · Países con convenio de canje (actualizado 26/06/2026)</a></li>
          <li><a href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/permisos-extranjeros-y-de-fuerzas-y-cuerpos-de-seguridad/canjes-de-permisos/canjes-de-permisos-extranjeros/canje-de-permisos-de-otros-paises/" target="_blank" rel="noreferrer">DGT · Requisitos de canje y permisos obtenidos mediante canje previo</a></li>
          <li><a href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/permisos-extranjeros-y-de-fuerzas-y-cuerpos-de-seguridad/canjes-de-permisos/canjes-de-permisos-extranjeros/canje-de-permisos-profesionales-de-paises-sin-convenio/index.html" target="_blank" rel="noreferrer">DGT · Canje profesional de países sin convenio</a></li>
          </ul>
        </div>
      </details>
      <p className="aviso-juridico">Herramienta de apoyo. Contrasta la normativa y las circunstancias antes de denunciar.</p>
      <div className="acciones-resultado">
        <button type="button" className="boton boton--principal" onClick={alReiniciar}>Iniciar nueva consulta</button>
      </div>
    </section>
  );
}
