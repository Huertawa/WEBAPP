import { useEffect, useState } from "react";

export default function TarjetaResultado({ resultado, historial, alReiniciar }) {
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

  const consecuenciaPenal = ["PER001", "PER019", "PER020"].includes(resultado.codigo)
    ? "El artículo 384 del Código Penal prevé prisión de 3 a 6 meses, multa de 12 a 24 meses o trabajos en beneficio de la comunidad de 31 a 90 días. No es una sanción administrativa: deben acreditarse todos los elementos del tipo penal."
    : "";
  const importeVisible = denuncia?.importe || euros || "No procede / por determinar";
  const puntosVisibles = denuncia?.puntos || puntos || "Pendiente de verificar";
  const comprobacionesPorCaso = {
    PER001: ["Consultar el Registro de Conductores e Infractores y comprobar si obtuvo permiso en España o en otro Estado.", "Descartar pérdida total de puntos y privación judicial: son supuestos diferenciados del artículo 384 CP.", "Identificar el vehículo y documentar los elementos del posible ilícito penal."],
    PER003: ["Verificar fecha de caducidad y que no exista renovación o prórroga vigente.", "Comprobar que se trata de caducidad y no de suspensión, pérdida de vigencia o privación judicial.", "Contrastar la codificación y los datos del permiso antes de formular el boletín."],
    PER005: ["Comprobar la fecha de vigencia del permiso y si existe renovación o sustitución válida.", "Verificar restricciones, retirada o suspensión en el Estado expedidor y, si procede, el reconocimiento en España.", "No confundir caducidad documental con privación del derecho a conducir."],
    PER008: ["Confirmar la fecha de adquisición de residencia normal y el cómputo del plazo de seis meses.", "Consultar el convenio vigente con el país y comprobar que esa categoría concreta es canjeable.", "Verificar fecha de obtención, restricciones, vigencia y posibles excepciones profesionales."],
    PER009: ["Comprobar en la relación oficial de la DGT si existe convenio aplicable o reconocimiento específico.", "Verificar el modelo internacional del permiso, traducción y requisitos esenciales.", "Descartar la vía excepcional de canje profesional antes de cerrar la calificación."],
    PER010: ["Acreditar documentalmente las fechas de residencia y obtención del permiso.", "Comprobar la excepción específica de Corea del Sur y el convenio del país expedidor.", "Valorar la vía de canje profesional si reúne todos los requisitos legales."],
    PER011: ["Verificar que el permiso extranjero está realmente caducado y no renovado.", "Comprobar el reconocimiento del documento y las reglas del país expedidor.", "Determinar la infracción concreta antes de asignar importe, puntos o código."],
    PER013: ["Identificar la clasificación técnica del vehículo y la categoría que exige.", "Comprobar categorías, fechas de vigencia, restricciones y códigos armonizados del permiso.", "Descartar autorización complementaria o supuesto penal antes de extender denuncia."],
    PER014: ["Acreditar la edad del conductor y la categoría extranjera concreta.", "Aplicar la edad mínima española del permiso equivalente y revisar excepciones.", "No fijar sanción ni puntos hasta determinar el encaje administrativo exacto."],
    PER015: ["Comprobar si el permiso está redactado en castellano o acompañado de traducción oficial.", "Verificar los modelos de Ginebra/Viena o permiso internacional acompañado del nacional.", "Consultar si existe convenio o reconocimiento específico para ese país."],
    PER016: ["Confirmar residencia normal en España durante al menos dos años.", "Identificar grupo 1 o grupo 2 y comprobar los límites de vigencia del artículo 15.4 RGC.", "Verificar que no se ha renovado o sustituido el permiso y que el supuesto encaja en la infracción grave."],
    PER017: ["Acreditar la fecha de entrada regular y la situación de residencia del titular.", "Comprobar vigencia, edad mínima, formato reconocido y condiciones del artículo 21 RGC.", "Consultar convenio y circunstancias concretas antes de concluir que el permiso carece de validez."],
    PER018: ["Comprobar que el permiso encaja en los modelos del artículo 21.1.a) o b).", "Acreditar al menos seis meses de contratación como conductor profesional y la relación laboral exigida.", "Verificar prueba de circulación, cotización y ausencia de privación, suspensión o intervención."],
    PER019: ["Obtener y comprobar la resolución de pérdida de vigencia por pérdida total de puntos.", "Verificar notificación, fecha de efectos y que la conducción fue posterior.", "Diferenciarlo de otras causas de pérdida de vigencia y aplicar el criterio penal vigente."],
    PER020: ["Comprobar la resolución judicial y si la privación era efectiva en el momento de conducir.", "Verificar alcance, fechas, carácter cautelar o firmeza e identidad del conductor.", "No confundir privación judicial con suspensión administrativa."],
    PER021: ["Consultar el registro y concretar la causa exacta de falta de validez.", "Diferenciar caducidad, suspensión, pérdida de vigencia, retirada judicial y permiso extranjero no reconocido.", "No aplicar automáticamente el artículo 384 CP ni asignar sanción sin identificar el supuesto."]
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
          <span>INMOVILIZACIÓN</span>
          <strong className="inmovilizacion__estado">{inmovilizacion.estado}</strong>
          <p className="inmovilizacion__detalle">{inmovilizacion.detalle}</p>
        </article>
      </div>

      {!estadoPendiente && puedeConducir === false && (
        <section className="comprobador-inmovilizacion">
          <div className="comprobador-inmovilizacion__cabecera">
            <span>COMPROBACIÓN RÁPIDA DE INMOVILIZACIÓN</span>
            <p>Selecciona qué tipo de vehículo está conduciendo. La consulta aplica el artículo 104.1.k de la Ley de Tráfico.</p>
          </div>
          <div className="comprobador-inmovilizacion__opciones">
            <button type="button" className={`boton boton--opcion ${claseVehiculo === "cd" ? "seleccionado" : ""}`} aria-pressed={claseVehiculo === "cd"} onClick={() => setClaseVehiculo("cd")}>Exige permiso C o D</button>
            <button type="button" className={`boton boton--secundario ${claseVehiculo === "otro" ? "seleccionado" : ""}`} aria-pressed={claseVehiculo === "otro"} onClick={() => setClaseVehiculo("otro")}>Otra categoría (A, B, etc.)</button>
          </div>
          {decisionInmovilizacion && (
            <div className={`comprobador-inmovilizacion__resultado ${claseVehiculo === "cd" ? "es-posible" : "no-aplica"}`}>
              <strong>{decisionInmovilizacion.titulo}</strong>
              <p>{decisionInmovilizacion.detalle}</p>
            </div>
          )}
        </section>
      )}

      {consecuenciaPenal && (
        <section className="consecuencia-penal">
          <strong>POSIBLE CONSECUENCIA PENAL · ART. 384 CP</strong>
          <p>{consecuenciaPenal}</p>
        </section>
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
            <div className="propuesta-denuncia__codigo">
              <small>CODIFICACIÓN DE REFERENCIA</small>
              <strong>{denuncia.codificado}</strong>
            </div>
          </div>
          <p>{denuncia.fundamento}</p>
          <p className="propuesta-denuncia__aviso">{estadoPendiente ? "No extender denuncia basándose únicamente en esta orientación: confirma primero la validez del permiso, el país, la categoría, el convenio y todos los requisitos del supuesto." : "Antes de extender el boletín, contrasta el código y la redacción exacta con el catálogo sancionador vigente y con los hechos acreditados."}</p>
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
            {resultado.orientacionSancion.codificado && <div className="propuesta-denuncia__codigo"><small>CODIFICACIÓN CONDICIONADA</small><strong>{resultado.orientacionSancion.codificado}</strong></div>}
          </div>
          <p>{resultado.orientacionSancion.fundamento}</p>
          <p className="orientacion-sancion__aviso">Orientación condicionada: este resultado no confirma por sí solo la infracción ni sustituye la comprobación del país, convenio, permiso y circunstancias concretas.</p>
        </section>
      ) : !puedeConducir ? (
        <section className="sancion-pendiente">
          <strong>No se asigna automáticamente una denuncia</strong>
          <p>Con los datos disponibles no es seguro fijar todavía un importe, una detracción de puntos o un código de boletín. Primero hay que concretar la causa y descartar que los hechos tengan relevancia penal.</p>
        </section>
      ) : null}

      <section className="lista-comprobacion">
        <div className="lista-comprobacion__cabecera">
          <span>CONTROL DE LA INTERVENCIÓN</span>
          <small>{comprobaciones.length} comprobaciones recomendadas</small>
        </div>
        <ol>
          {comprobaciones.map((item, indice) => <li key={indice}>{item}</li>)}
        </ol>
      </section>

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
          <li><a href="https://www.boe.es/buscar/doc.php?coleccion=fiscalia&id=FIS-Q-2026-00001" target="_blank" rel="noreferrer">Fiscalía General del Estado · Consulta 1/2026 (pérdida de vigencia judicial tras cumplir condena)</a></li>
          <li><a href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/permisos-extranjeros-y-de-fuerzas-y-cuerpos-de-seguridad/conducir-con-un-permiso-extranjero/" target="_blank" rel="noreferrer">DGT · Conducir con un permiso extranjero</a></li>
          <li><a href="https://sede.dgt.gob.es/.galleries/multas/ARCI/Guia-codificada-de-infracciones-actualizada-01-10-2026.xls" target="_blank" rel="noreferrer">DGT · Guía codificada de infracciones extendida (01/10/2026)</a></li>
          <li><a href="https://sede.dgt.gob.es/export/sites/dgt/.galleries/multas/ARCI/Guia-codificada-de-infracciones-ARCI-Vigente-a-partir-del-01-07-2025.pdf" target="_blank" rel="noreferrer">DGT · Guía codificada ARCI en PDF (01/07/2025)</a></li>
          <li><a href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/permisos-extranjeros-y-de-fuerzas-y-cuerpos-de-seguridad/canjes-de-permisos/paises-con-convenio-de-canjes/" target="_blank" rel="noreferrer">DGT · Países con convenio de canje (actualizado 26/06/2026)</a></li>
        </ul>
      </div>
      <p className="aviso-juridico">Herramienta de apoyo. Comprueba siempre la vigencia normativa, la codificación y las circunstancias concretas antes de formular una denuncia.</p>
      <div className="acciones-resultado">
        <button type="button" className="boton boton--principal" onClick={alReiniciar}>Iniciar nueva consulta</button>
      </div>
    </section>
  );
}
