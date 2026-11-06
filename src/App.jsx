import { useState } from "react";
import { resultados } from "./datosPermisos";
import { paises } from "./paises";
import TarjetaResultado from "./componentes/TarjetaResultado";
import Pregunta from "./componentes/Pregunta";

const preguntas = {
  inicio: { titulo: "¿Ha obtenido alguna vez un permiso o licencia de conducción?", descripcion: "Cuenta también los permisos extranjeros y los que hayan caducado o perdido vigencia. No tener el documento físico no significa que nunca lo haya obtenido.", opciones: [{ valor: "situacionPermisoObtenido", texto: "Sí, ha obtenido un permiso alguna vez" }, { valor: "sinPermisoNunca", texto: "No, nunca ha obtenido permiso" }, { valor: "sinPermisoOtraSituacion", texto: "No puedo acreditarlo" }] },
  situacionPermisoObtenido: { titulo: "¿Existe alguna resolución o situación que haya dejado sin vigencia el permiso?", descripcion: "Si el permiso simplemente está caducado, continúa para identificar el país que lo expidió. Si hay pérdida total de puntos, suspensión cautelar o privación judicial, selecciona esa situación para aplicar el tratamiento correcto.", opciones: [{ valor: "tipoPermiso", texto: "No consta pérdida de vigencia, suspensión ni privación" }, { valor: "sinPermisoPuntos", texto: "Pérdida de vigencia por pérdida total de puntos" }, { valor: "sinPermisoPrivacion", texto: "Privación judicial del derecho a conducir" }, { valor: "sinPermisoSuspensionAdministrativa", texto: "Suspensión cautelar administrativa" }, { valor: "sinPermisoOtraSituacion", texto: "Otra causa o situación no acreditada" }] },
  comprobarPrivacionJudicial: { titulo: "¿La pena o medida judicial sigue vigente?", descripcion: "El artículo 384.2 CP se aplica cuando se conduce mientras sigue vigente la privación cautelar o la pena judicial. Si la pena ya se cumplió, hay que distinguir las condenas superiores a dos años —que exigen obtener un nuevo permiso— de las iguales o inferiores a dos años —que exigen superar el curso de reeducación—.", opciones: [{ valor: "privacionVigente", texto: "Sí, la privación sigue vigente" }, { valor: "penaCumplidaSinNuevoPermiso", texto: "Ya cumplió una pena superior a dos años y no ha obtenido un nuevo permiso" }, { valor: "penaHastaDosAniosCumplida", texto: "Ya cumplió una pena de hasta dos años" }, { valor: "privacionNoAcreditada", texto: "No puedo comprobar la resolución o las fechas" }] },
  comprobarCursoPostCondena: { titulo: "¿Ha superado el curso de reeducación y sensibilización vial?", descripcion: "Para condenas iguales o inferiores a dos años, el artículo 73.2 LTSV exige haber cumplido la pena y superado el curso para volver a conducir. Comprueba el certificado de aprovechamiento.", opciones: [{ valor: "penaCortaCursoSuperado", texto: "Sí, ha superado el curso" }, { valor: "penaCortaCursoPendiente", texto: "No, no lo ha superado" }, { valor: "cursoNoAcreditado", texto: "No puedo acreditarlo" }] },
  tipoPermiso: { titulo: "¿El permiso es español o extranjero?", descripcion: "Indica qué autoridad expidió el documento que presenta el conductor. Esta respuesta determina qué reglas de validez debemos comprobar.", opciones: [{ valor: "espanol", texto: "Español" }, { valor: "extranjero", texto: "Extranjero" }] },
  espanol: { titulo: "¿El permiso español está vigente?", descripcion: "Comprueba la fecha de validez que figura en el permiso o en el Registro de Conductores. No confundas un documento deteriorado con una autorización caducada.", opciones: [{ valor: "espanolSituacion", texto: "Sí, está vigente" }, { valor: "espanolCaducado", texto: "No, está caducado" }] },
  espanolSituacion: { titulo: "¿Consta una suspensión cautelar administrativa del permiso?", descripcion: "Comprueba el Registro de Conductores e Infractores y cualquier resolución administrativa. Una suspensión cautelar no es lo mismo que una privación judicial ni que la caducidad del documento.", opciones: [{ valor: "categoriaEspanol", texto: "No, no consta suspensión ni prohibición" }, { valor: "suspensionAdministrativa", texto: "Sí, está suspendido cautelarmente o prohibido su uso" }] },
  extranjero: { titulo: "¿El permiso ha sido expedido en la UE o el EEE?", descripcion: "UE: Estados miembros de la Unión Europea. EEE: además de la UE, Islandia, Liechtenstein y Noruega. Su régimen de reconocimiento es distinto al de los terceros países.", opciones: [{ valor: "ue", texto: "Sí" }, { valor: "noUE", texto: "No" }] },
  ue: { titulo: "¿El permiso de la UE o del EEE está en vigor y no está suspendido ni retirado?", descripcion: "Comprueba la fecha de validez y si existe alguna retirada, suspensión o restricción comunicada por el Estado que lo expidió.", opciones: [{ valor: "categoriaUE", texto: "Sí, está en vigor y habilita" }, { valor: "ueNoVigente", texto: "No, está caducado, suspendido o retirado" }] },
  ueNoVigente: { titulo: "¿Cuál es la causa de que el permiso UE/EEE no esté vigente?", descripcion: "La caducidad se trata de forma distinta según el titular tenga o no residencia normal en España. La suspensión o retirada por el Estado expedidor debe comprobarse separadamente y no se equipara automáticamente a la caducidad.", opciones: [{ valor: "ueCaducadoResidencia", texto: "Está caducado" }, { valor: "ueSuspendido", texto: "Está suspendido, retirado o restringido" }] },
  ueCaducadoResidencia: { titulo: "¿El titular tiene residencia normal en España?", descripcion: "Para los permisos UE/EEE, si el titular reside normalmente en España, se aplican las reglas españolas de vigencia del artículo 15.4 RGC. Si no reside, se aplica el régimen general de caducidad del artículo 12.4 RGC.", opciones: [{ valor: "ueCaducadoResidente", texto: "Sí, tiene residencia normal en España" }, { valor: "ueCaducadoNoResidente", texto: "No, no tiene residencia normal en España" }] },
  categoriaEspanol: { titulo: "¿La categoría que figura en el permiso habilita para conducir el vehículo que utiliza?", descripcion: "Comprueba la clase del vehículo, las categorías autorizadas y sus fechas de vigencia. No basta con que el documento esté en vigor.", opciones: [{ valor: "comprobarRestriccionesEspanol", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, la categoría no habilita" }] },
  comprobarRestriccionesEspanol: { titulo: "¿Cumple los códigos, restricciones o adaptaciones que figuran en el permiso?", descripcion: "Por ejemplo, obligación de usar gafas o lentes, vehículo adaptado o limitación a cambio automático. Comprueba los códigos que aparecen en el reverso del permiso.", opciones: [{ valor: "categoriaCorrectaEspanol", texto: "Sí, cumple las restricciones o no tiene ninguna" }, { valor: "restriccionesIncumplidas", texto: "No, incumple una restricción o adaptación" }] },
  categoriaUE: { titulo: "¿La categoría que figura en el permiso habilita para conducir el vehículo que utiliza?", descripcion: "Comprueba la equivalencia de categorías y las fechas de vigencia. Después revisaremos las restricciones y la edad mínima exigida en España.", opciones: [{ valor: "ueEdadMinima", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, la categoría no habilita" }] },
  ueEdadMinima: { titulo: "¿El titular tiene la edad mínima exigida en España para esa categoría?", descripcion: "Los permisos UE/EEE mantienen su validez en España, pero la edad mínima para conducir corresponde a la exigida para obtener el permiso español equivalente (artículo 15.1 RGC).", opciones: [{ valor: "comprobarRestriccionesUE", texto: "Sí, cumple la edad mínima" }, { valor: "requisitoEdadNoCumplido", texto: "No, no cumple la edad mínima" }] },
  comprobarRestriccionesUE: { titulo: "¿Cumple los códigos, restricciones o adaptaciones que figuran en el permiso?", descripcion: "Comprueba los códigos armonizados y las condiciones del permiso comunitario, como gafas, lentes, adaptaciones o limitaciones del vehículo.", opciones: [{ valor: "ueResidenciaDosAnos", texto: "Sí, cumple las restricciones o no tiene ninguna" }, { valor: "restriccionesIncumplidas", texto: "No, incumple una restricción o adaptación" }] },
  ueResidenciaDosAnos: { titulo: "¿El titular lleva dos años o más de residencia normal en España?", descripcion: "Esta comprobación es relevante para determinados permisos de la UE o del EEE con periodos de vigencia muy largos o indefinidos.", opciones: [{ valor: "uePlazoLargo", texto: "Sí, lleva dos años o más" }, { valor: "ueRenovacionNo", texto: "No, lleva menos de dos años o no reside en España" }] },
  uePlazoLargo: { titulo: "¿El permiso tiene vigencia indefinida o un periodo superior al límite aplicable?", descripcion: "Límite: más de 15 años para el grupo 1 (motos y turismos) o más de 5 años para el grupo 2 (camiones y autobuses).", opciones: [{ valor: "ueRenovacionSi", texto: "Sí, supera el límite o es indefinido" }, { valor: "ueRenovacionNo", texto: "No, no supera ese límite" }] },
  noUE: { titulo: "¿El permiso de un tercer país está en vigor?", descripcion: "Un tercer país es cualquier Estado que no pertenece a la UE ni al EEE. Comprueba que el permiso nacional original no esté caducado, suspendido o retirado.", opciones: [{ valor: "terceroVigente", texto: "Sí, está en vigor" }, { valor: "terceroNoVigente", texto: "No, no está en vigor" }] },
  terceroNoVigente: { titulo: "¿Por qué no está vigente el permiso extranjero?", descripcion: "La caducidad del documento y la suspensión o retirada de la autorización son situaciones distintas. Comprueba la causa exacta en el Estado expedidor.", opciones: [{ valor: "terceroCaducado", texto: "Ha caducado" }, { valor: "terceroSuspendido", texto: "Está suspendido, retirado o anulado" }] },
  terceroVigente: { titulo: "¿El titular tiene su residencia normal en España?", descripcion: "Para el Reglamento General de Conductores, residencia normal es, en general, permanecer en España al menos 185 días por año natural por vínculos personales o profesionales. Además, la permanencia debe ser regular y acreditable. No confundas residencia normal con una visita, el empadronamiento o tener un NIE.", opciones: [{ valor: "residente", texto: "Sí, tiene residencia normal en España" }, { valor: "paisTerceroNoResidente", texto: "No, está de visita o no la tiene acreditada" }] },
  residente: { titulo: "¿Han transcurrido más de seis meses desde que adquirió la residencia normal, debidamente acreditada, en España?", descripcion: "El plazo general del artículo 21.2.c) del Reglamento General de Conductores es de seis meses desde que se adquiere la residencia normal. Superarlo puede hacer que el permiso deje de ser válido en España, salvo reglas específicas o un canje ya realizado.", opciones: [{ valor: "mas6meses", texto: "Sí" }, { valor: "categoriaTerceroMenos6", texto: "No" }] },
  categoriaTerceroNoResidente: { titulo: "¿La categoría del permiso habilita para el vehículo que conduce?", descripcion: "Comprueba la clase del vehículo, las categorías autorizadas, las restricciones y la vigencia del permiso.", opciones: [{ valor: "terceroNoResidenteEdad", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, no habilita" }] },
  categoriaTerceroMenos6: { titulo: "¿La categoría del permiso habilita para el vehículo que conduce?", descripcion: "Comprueba la clase del vehículo, las categorías autorizadas, las restricciones y la vigencia del permiso.", opciones: [{ valor: "terceroMenos6Edad", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, no habilita" }] },
  terceroNoResidenteEdad: { titulo: "¿El titular tiene la edad mínima exigida en España para esa categoría?", descripcion: "La edad exigida es la correspondiente al permiso español equivalente. Comprueba la edad del conductor y la categoría concreta.", opciones: [{ valor: "terceroNoResidenteFormato", texto: "Sí, cumple la edad mínima" }, { valor: "requisitoEdadNoCumplido", texto: "No, no cumple la edad mínima" }] },
  terceroNoResidentePlazo: { titulo: "¿Han transcurrido más de seis meses desde la entrada regular del titular en España?", descripcion: "Si no acredita residencia normal en España, el artículo 21.2.c) establece un plazo máximo de seis meses desde su entrada en territorio español en situación regular, sin perjuicio de reglas específicas de convenios.", opciones: [{ valor: "terceroNoResidenteRestricciones", texto: "No, todavía no han transcurrido seis meses" }, { valor: "terceroNoResidentePlazoSuperado", texto: "Sí, han transcurrido más de seis meses" }] },
  terceroMenos6Edad: { titulo: "¿El titular tiene la edad mínima exigida en España para esa categoría?", descripcion: "La edad exigida es la correspondiente al permiso español equivalente. Comprueba la edad del conductor y la categoría concreta.", opciones: [{ valor: "terceroMenos6Formato", texto: "Sí, cumple la edad mínima" }, { valor: "requisitoEdadNoCumplido", texto: "No, no cumple la edad mínima" }] },
  terceroNoResidenteFormato: { titulo: "¿El documento cumple alguno de los formatos o reconocimientos admitidos en España?", descripcion: "Por ejemplo: permiso en castellano o con traducción oficial, modelo conforme a los convenios de Ginebra o Viena, permiso internacional válido acompañado del permiso nacional, o reconocimiento por convenio específico.", opciones: [{ valor: "terceroNoResidentePlazo", texto: "Sí, cumple uno de esos requisitos" }, { valor: "requisitoFormatoNoAcreditado", texto: "No / no puedo acreditarlo" }] },
  terceroMenos6Formato: { titulo: "¿El documento cumple alguno de los formatos o reconocimientos admitidos en España?", descripcion: "Por ejemplo: permiso en castellano o con traducción oficial, modelo conforme a los convenios de Ginebra o Viena, permiso internacional válido acompañado del permiso nacional, o reconocimiento por convenio específico.", opciones: [{ valor: "terceroMenos6Restricciones", texto: "Sí, cumple uno de esos requisitos" }, { valor: "requisitoFormatoNoAcreditado", texto: "No / no puedo acreditarlo" }] },
  comprobarEdadCategoria: { titulo: "¿Qué tipo de autorización o categoría está afectada por la edad mínima?", descripcion: "La opción 5C de la guía codificada contempla expresamente los permisos de motocicleta A1/A2/A cuando no se cumplen la edad o antigüedad mínimas o la formación exigida. No extiendas esa codificación a otras categorías por analogía.", opciones: [{ valor: "edadMotoA", texto: "Motocicleta A1, A2 o A: falta edad, antigüedad o formación" }, { valor: "edadOtraCategoria", texto: "Otra categoría o supuesto distinto" }] },
  terceroNoResidenteRestricciones: { titulo: "¿Cumple los códigos o restricciones que figuran en el permiso?", descripcion: "Comprueba las condiciones del permiso extranjero, por ejemplo obligación de gafas, lentes o adaptaciones del vehículo.", opciones: [{ valor: "terceroNoResidenteCategoria", texto: "Sí, las cumple o no tiene restricciones" }, { valor: "restriccionesIncumplidas", texto: "No, incumple una restricción o adaptación" }] },
  terceroMenos6Restricciones: { titulo: "¿Cumple los códigos o restricciones que figuran en el permiso?", descripcion: "Comprueba las condiciones del permiso extranjero, por ejemplo obligación de gafas, lentes o adaptaciones del vehículo.", opciones: [{ valor: "terceroMenos6Categoria", texto: "Sí, las cumple o no tiene restricciones" }, { valor: "restriccionesIncumplidas", texto: "No, incumple una restricción o adaptación" }] },
  convenioNoResidente: { titulo: "¿El convenio de ese país permite canjear esta categoría y se cumplen sus condiciones?", descripcion: "Comprueba la categoría, la fecha de obtención, la antigüedad del permiso y los requisitos específicos publicados por la DGT. La existencia de un convenio no significa que todas las categorías o situaciones estén cubiertas.", opciones: [{ valor: "canjeNoResidentePosible", texto: "Sí, el convenio permite el canje y cumple los requisitos" }, { valor: "canjeNoResidenteNoPosible", texto: "No, la categoría o los requisitos no están cubiertos" }, { valor: "canjeNoResidenteNoAcreditado", texto: "No puedo acreditarlo" }] },
  fechaFirmaConvenio: { titulo: "El permiso se obtuvo después de adquirir la residencia. ¿Se expidió antes o después de la firma del convenio?", descripcion: "Este dato es importante para saber si puede acogerse al canje. La DGT establece, con carácter general, que no se canjea el permiso obtenido después de la firma del convenio cuando el titular ya residía legalmente en España. La fecha de entrada en vigor que aparece arriba es un dato distinto: consulta también la fecha de firma indicada por la DGT para ese país.", opciones: [{ valor: "origenCanje", texto: "Antes de la firma del convenio" }, { valor: "profesionalTercero", texto: "En la fecha de firma o después" }, { valor: "obtenidoDespuesNoAcreditado", texto: "No puedo acreditar la fecha de expedición o de firma" }] },
  profesionalTercero: { titulo: "¿Puede acogerse a la vía excepcional de canje para conductores profesionales?", descripcion: "Esta vía no es un permiso automático para circular: permite solicitar un canje excepcional en determinados casos. Requisitos acumulativos: permiso incluido en el artículo 21.1.a) o b); al menos seis meses contratado como conductor profesional por empresa establecida en España, acreditados con afiliación y cotización a la Seguridad Social; superar una prueba de circulación de hasta 30 minutos; y no estar privado judicialmente ni tener el permiso suspendido o intervenido administrativamente. Si falta uno, no marques que cumple.", opciones: [{ valor: "profesionalPendiente", texto: "Sí, reúne y acredita todos los requisitos" }, { valor: "profesionalNoCanje", texto: "No / no reúne todos los requisitos" }] },
  origenCanje: {
    titulo: "¿De dónde procede originalmente el permiso que presenta?",
    descripcion: "La DGT no permite el canje cuando el permiso presentado se obtuvo previamente por canje de otro país con el que España no tiene convenio. Comprueba el país de expedición original y, si hubo canje, el permiso anterior y el país que lo expidió.",
    opciones: [
      { valor: "permisoDirectoConConvenio", texto: "Lo obtuvo directamente en ese país" },
      { valor: "permisoCanjeOrigenConConvenio", texto: "Procede de un canje de otro país con convenio con España" },
      { valor: "origenCanjeNoValido", texto: "Procede de un canje de un país sin convenio con España" },
      { valor: "origenCanjeNoAcreditado", texto: "No puedo acreditar el país de origen" },
    ],
  },
  fechaPermiso: {
    titulo: "¿Cuándo obtuvo el permiso extranjero respecto a la fecha en que adquirió la residencia normal en España?",
    descripcion: "Compara la fecha de expedición que figura en el permiso con la fecha en que adquirió la residencia normal en España. Si lo obtuvo antes de residir aquí, en principio cumple el requisito temporal general para solicitar el canje. Si lo obtuvo después, habrá que comprobar la fecha de firma del convenio: la DGT indica que, con carácter general, no se canjea si ya era residente y lo obtuvo después de la firma. La fecha de entrada en vigor es un dato distinto.",
    opciones: [
      { valor: "obtenidoAntes", texto: "Antes de adquirir la residencia en España" },
      { valor: "obtenidoDespues", texto: "Después de adquirir la residencia en España" },
      { valor: "obtenidoDespuesNoAcreditado", texto: "No puedo acreditar la fecha" },
    ],
  },
};

function normalizarBusqueda(valor) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [historial, setHistorial] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState("");
  const [busquedaPais, setBusquedaPais] = useState("");
  const [pilaNavegacion, setPilaNavegacion] = useState([]); // historial de navegación del asistente

  const avanzar = (destino, texto) => {
    setPilaNavegacion((anterior) => [...anterior, { pantalla, historial, paisSeleccionado }]);
    if (texto) setHistorial((anterior) => [...anterior, texto]);
    setPantalla(destino === "terceroNoResidentePlazoSuperado" ? (paisActual?.convenio ? "convenioNoResidente" : "profesionalTercero") : destino === "sinPermisoPrivacion" ? "comprobarPrivacionJudicial" : destino === "penaHastaDosAniosCumplida" ? "comprobarCursoPostCondena" : destino === "requisitoEdadNoCumplido" ? "comprobarEdadCategoria" : destino);
  };

  const retroceder = () => {
    const anterior = pilaNavegacion[pilaNavegacion.length - 1];
    if (!anterior) return;
    setPantalla(anterior.pantalla);
    setHistorial(anterior.historial);
    setPaisSeleccionado(anterior.paisSeleccionado);
    setPilaNavegacion((pila) => pila.slice(0, -1));
  };

  const reiniciar = () => {
    setPantalla("inicio");
    setHistorial([]);
    setPaisSeleccionado("");
    setBusquedaPais("");
    setPilaNavegacion([]);
  };

  const resultadosPorPantalla = {
    sinPermisoNunca: "PER001",
    sinPermisoPuntos: "PER019",

    sinPermisoOtraSituacion: "PER021",
    privacionVigente: "PER020",
    penaCumplidaSinNuevoPermiso: "PER024",
    penaCortaCursoPendiente: "PER027",
    penaCortaCursoSuperado: "PER028",
    cursoNoAcreditado: "PER021",
    privacionNoAcreditada: "PER021",
    sinPermisoSuspensionAdministrativa: "PER026",
    categoriaCorrectaEspanol: "PER002",
    restriccionesIncumplidas: "PER029",
    categoriaCorrectaUE: "PER004",
    ueRenovacionNo: "PER004",
    ueRenovacionSi: "PER016",
    categoriaNoCoincide: "PER013",
    espanolCaducado: "PER003",
    suspensionAdministrativa: "PER026",
    otraProhibicionUso: "PER021",
    ueVigente: "PER004",
    ueCaducadoNoResidente: "PER005",
    ueCaducadoResidente: "PER016",
    ueSuspendido: "PER021",
    terceroNoResidenteCategoria: "PER006",
    terceroNoResidentePlazoSuperado: "PER017",
    canjeNoResidentePosible: "PER008",
    canjeNoResidenteNoPosible: "PER010",
    canjeNoResidenteNoAcreditado: "PER017",
    edadMotoA: "PER025",
    edadOtraCategoria: "PER014",
    requisitoFormatoNoAcreditado: "PER015",
    terceroMenos6Categoria: "PER007",
    terceroCaducado: "PER011",
    terceroSuspendido: "PER021",
    conConvenio: "PER008",
    permisoDirectoConConvenio: "PER008",
    permisoCanjeOrigenConConvenio: "PER008",
    obtenidoDespuesNoAcreditado: "PER022",
    origenCanjeNoValido: "PER010",
    origenCanjeNoAcreditado: "PER023",
    sinConvenio: "PER009",
    profesionalPendiente: "PER018",
    obtenidoDespuesNoCanjeable: "PER010",
    coreaPosteriorResidencia: "PER012",
  };

  const resultado = resultados[resultadosPorPantalla[pantalla]];
  const paisesFiltrados = paises
    .filter((pais) => normalizarBusqueda(pais.nombre).includes(normalizarBusqueda(busquedaPais)))
    .sort((a, b) => {
      if (!a.bandera) return 1;
      if (!b.bandera) return -1;
      return a.nombre.localeCompare(b.nombre, "es");
    });
  const otroPais = paises.find((pais) => pais.nombre.includes("Otro país"));
  const paisActual = paises.find((pais) => pais.nombre === paisSeleccionado);

  const seleccionarFechaObtencion = (destino, texto) => {
    const pais = paises.find((elemento) => elemento.nombre === paisSeleccionado);
    if (!pais) return;
    setPilaNavegacion((anterior) => [...anterior, { pantalla, historial, paisSeleccionado }]);
    setHistorial((anterior) => [...anterior, texto]);
    if (destino === "obtenidoAntes") {
      setPantalla(pais.convenio ? "origenCanje" : "profesionalTercero");
      return;
    }
    if (destino === "obtenidoDespuesNoAcreditado") {
      setPantalla("obtenidoDespuesNoAcreditado");
      return;
    }
    if (pais.nombre === "Corea del Sur") {
      setPantalla("coreaPosteriorResidencia");
      return;
    }
    setPantalla(pais.convenio ? "fechaFirmaConvenio" : "profesionalTercero");
  };

  return (
    <main className="aplicacion">
      <header className="cabecera-aplicacion">
        <div className="marca">
          <span className="marca__simbolo">M</span>
          <div>
            <p className="marca__nombre">MOTOLISTOS</p>
            <span className="marca__descripcion">Herramienta de consulta de permisos</span>
          </div>
        </div>
        <div className="cabecera-aplicacion__acciones">
          <span className="cabecera-aplicacion__estado">VERSIÓN DE TRABAJO</span>
          {pantalla !== "inicio" && <button type="button" className="boton-inicio" onClick={reiniciar} aria-label="Volver al inicio y empezar una consulta nueva">⌂ <span>Inicio</span></button>}
        </div>
      </header>

      <div className="contenido-principal">
        <div className="titulo-pagina">
          <span className="etiqueta-seccion">MÓDULO 01 · CONDUCCIÓN</span>
          <h1>Consulta de permisos</h1>
          <p>Asistente guiado para comprobar las circunstancias del permiso de conducción.</p>
        </div>

        {resultado && <TarjetaResultado resultado={resultado} historial={historial} alReiniciar={reiniciar} />}

        {preguntas[pantalla] && pantalla !== "fechaPermiso" && pantalla !== "profesionalTercero" && pantalla !== "fechaFirmaConvenio" && pantalla !== "terceroVigente" && (
          <Pregunta
            titulo={preguntas[pantalla].titulo}
            descripcion={preguntas[pantalla].descripcion}
            opciones={preguntas[pantalla].opciones}
            variante={pantalla === "tipoPermiso" ? "tipo-permiso" : ""}
            alSeleccionar={(destino, texto) => avanzar(destino, texto)}
            alVolver={pilaNavegacion.length ? retroceder : null}
          />
        )}

        {pantalla === "terceroVigente" && (
          <>
          <details className="aclaracion-desplegable aclaracion-desplegable--amplia panel-residencia">
            <summary>Ver aclaración: residencia normal, situación regular y documentación</summary>
            <div className="panel-residencia__cabecera">
              <span>ACLARACIÓN JURÍDICA · RESIDENCIA NORMAL Y SITUACIÓN REGULAR</span>
              <h2>¿Desde cuándo se considera que reside legalmente en España?</h2>
            </div>
            <div className="panel-residencia__bloques">
              <article>
                <strong>1. Residencia normal: criterio de 185 días</strong>
                <p>El Reglamento General de Conductores considera residencia normal el lugar donde la persona permanece habitualmente al menos 185 días por cada año natural, atendiendo a sus vínculos personales y profesionales. La asistencia a una universidad o escuela, por sí sola, no traslada esa residencia.</p>
              </article>
              <article>
                <strong>2. Situación regular: no basta con estar empadronado</strong>
                <p>Para nacionales de terceros países, la Ley de Extranjería distingue entre estancia y residencia: la estancia ordinaria no supera 90 días, mientras que es residente quien es titular de una autorización para residir. Un NIE, el padrón, una solicitud pendiente o una estancia turística no acreditan por sí solos una autorización de residencia.</p>
              </article>
              <article>
                <strong>3. Fecha que debes comprobar en la intervención</strong>
                <p>Localiza la resolución o autorización de residencia y comprueba su fecha de efectos y vigencia, junto con la documentación que permita fijar cuándo se alcanzó la residencia normal. La fecha de expedición de la TIE o del empadronamiento no debe tomarse automáticamente como fecha inicial. El momento concreto depende del tipo de autorización y de la situación personal.</p>
              </article>
            </div>
            <article className="panel-residencia__bloque-ue">
              <strong>4. Ciudadanos UE/EEE: régimen diferente</strong>
              <p>Para permanecer más de tres meses, deben concurrir las condiciones del Real Decreto 240/2007 (por ejemplo, trabajar, disponer de recursos suficientes y seguro médico, o estudiar cumpliendo los requisitos) y solicitar la inscripción en el Registro Central de Extranjeros. Comprueba el certificado de registro y la situación material que da derecho a residir.</p>
            </article>
            <p className="panel-residencia__nota"><strong>Importante:</strong> el criterio de los 185 días y la exigencia de situación regular son requisitos distintos que deben analizarse conjuntamente. La fecha de efectos depende del título y del régimen aplicable; no la deduzcas solo del padrón o de la fecha de expedición física de una tarjeta.</p>
            <div className="panel-residencia__fuentes">
              <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2009-9481" target="_blank" rel="noreferrer">RGC · disposición adicional segunda (residencia normal)</a>
              <a href="https://boe.es/buscar/act.php?id=BOE-A-2000-544" target="_blank" rel="noreferrer">LO 4/2000 · artículos 29, 30 y 30 bis (estancia y residencia)</a>
              <a href="https://www.boe.es/eli/es/rd/2007/02/16/240/con" target="_blank" rel="noreferrer">RD 240/2007 · residencia de ciudadanos UE/EEE</a>
            </div>
          </details>
          <Pregunta
            titulo={preguntas.terceroVigente.titulo}
            descripcion={preguntas.terceroVigente.descripcion}
            opciones={preguntas.terceroVigente.opciones}
            alSeleccionar={(destino, texto) => avanzar(destino, texto)}
            alVolver={retroceder}
          />
          </>
        )}

        {(pantalla === "mas6meses" || pantalla === "paisTerceroNoResidente") && (
          <section className="panel-pregunta">
            <span className="etiqueta-seccion">ASISTENTE DE PERMISOS EXTRANJEROS</span>
            <h2>Selecciona el país que expidió el permiso</h2>
            <p className="texto-secundario">Busca y selecciona el país que expidió el permiso.</p>
            <details className="aclaracion-desplegable">
              <summary>Información sobre convenios y reconocimiento</summary>
              <p>La relación se basa en la información publicada por la DGT. Tener convenio no garantiza que cualquier permiso sea canjeable. Si el país no aparece, puede existir reconocimiento temporal por convenios internacionales aunque no haya convenio bilateral de canje.</p>
              <p className="enlace-ayuda-dgt"><a href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/permisos-extranjeros-y-de-fuerzas-y-cuerpos-de-seguridad/canjes-de-permisos/paises-con-convenio-de-canjes/" target="_blank" rel="noreferrer">Consultar listado oficial de países y condiciones de canje en la DGT</a></p>
            </details>
            <label className="etiqueta-campo" htmlFor="buscar-pais">Buscar país</label>
            <input id="buscar-pais" className="campo-busqueda-pais" type="search" placeholder="Escribe para localizar el país..." value={busquedaPais} onChange={(evento) => { const valor = evento.target.value; setBusquedaPais(valor); if (paisSeleccionado && !paises.some((pais) => pais.nombre === paisSeleccionado && normalizarBusqueda(pais.nombre).includes(normalizarBusqueda(valor)))) setPaisSeleccionado(""); }} />
            <label className="etiqueta-campo">País de expedición</label>
            <div className="lista-paises" role="group" aria-label="Seleccionar país de expedición">
              {paisesFiltrados.map((pais) => {
                const seleccionado = paisSeleccionado === pais.nombre;
                return <button type="button" key={pais.nombre} aria-pressed={seleccionado}
                  className={`opcion-pais ${seleccionado ? "opcion-pais--seleccionada" : ""}`}
                  onClick={() => setPaisSeleccionado(pais.nombre)}>
                  {pais.bandera
                    ? <>
                        <img className="opcion-pais__bandera" src={`https://flagcdn.com/w40/${pais.bandera}.png`} alt="" width="32" height="24" loading="lazy" decoding="async" onError={(evento) => { evento.currentTarget.style.display = "none"; if (evento.currentTarget.nextElementSibling) evento.currentTarget.nextElementSibling.style.display = "flex"; }} />
                        <span className="opcion-pais__bandera-fallback" aria-hidden="true">{pais.bandera.toUpperCase()}</span>
                      </>
                    : <span className="opcion-pais__sin-bandera" aria-hidden="true">OTRO</span>}
                  <span className="opcion-pais__nombre">{pais.nombre}</span>
                  <span className={`opcion-pais__estado ${pais.convenio ? "opcion-pais__estado--convenio" : ""}`}>{pais.convenio ? "Convenio DGT" : "Sin convenio"}</span>
                  {seleccionado && <span className="opcion-pais__marca" aria-hidden="true">✓</span>}
                </button>;
              })}
              {paisesFiltrados.length === 0 && <p className="lista-paises__vacio">No hay coincidencias. Prueba con otro nombre o selecciona «Otro país».</p>}
            </div>
            {paisSeleccionado && (() => {
              const pais = paises.find((elemento) => elemento.nombre === paisSeleccionado);
              if (!pais) return null;
              return (
                <details className="aclaracion-desplegable aclaracion-desplegable--pais">
                  <summary>{pais.convenio ? "Ver condiciones del convenio de canje" : "Ver qué implica no tener convenio bilateral"}</summary>
                  <div className="aviso-pais-seleccionado">
                    <strong>{pais.convenio ? "Convenio bilateral de canje identificado" : "Sin convenio bilateral de canje identificado"}</strong>
                    <p>{pais.convenio
                      ? "Existe un acuerdo que permite solicitar el canje por un permiso español equivalente si se cumplen sus condiciones. No autoriza automáticamente a conducir: hay que comprobar vigencia, residencia, fecha de obtención y firma del convenio, categoría y pruebas exigidas."
                      : "No aparece un convenio bilateral de canje en la lista de la DGT. Eso no significa que el permiso nunca pueda utilizarse: puede existir reconocimiento temporal por convenios internacionales si cumple el formato, traducción, vigencia, edad y demás requisitos del artículo 21. Poder conducir temporalmente y poder canjear son cosas distintas."}</p>
                  </div>
                </details>
              );
            })()}
            {busquedaPais && paisesFiltrados.length === 0 && <div className="pais-no-encontrado"><p className="texto-secundario">No se encuentra ese país en la lista de convenios bilaterales. Esto no significa necesariamente que el permiso no esté reconocido: comprueba también los convenios internacionales y el formato del documento.</p>{otroPais && <button type="button" className="boton boton--secundario" onClick={() => { setPaisSeleccionado(otroPais.nombre); setBusquedaPais(""); }}>Continuar con otro país</button>}</div>}
            <div className="acciones-pregunta">
              <button className="boton boton--secundario" onClick={retroceder}>Volver</button>
              <button className="boton boton--principal" disabled={!paisSeleccionado} onClick={() => {
                const pais = paises.find((elemento) => elemento.nombre === paisSeleccionado);
                const destino = pantalla === "paisTerceroNoResidente"
                  ? "categoriaTerceroNoResidente"
                  : pais?.convenio ? "fechaPermiso" : "profesionalTercero";
                avanzar(destino, `País de expedición: ${paisSeleccionado}`);
              }}>Continuar</button>
            </div>
          </section>
        )}

        {pantalla === "profesionalTercero" && (
          <Pregunta
            titulo={preguntas.profesionalTercero.titulo}
            descripcion={preguntas.profesionalTercero.descripcion}
            opciones={preguntas.profesionalTercero.opciones}
            alSeleccionar={(destino, texto) => {
              const pais = paises.find((elemento) => elemento.nombre === paisSeleccionado);
              const destinoFinal = destino === "profesionalNoCanje"
                ? (pais?.convenio ? "obtenidoDespuesNoCanjeable" : "sinConvenio")
                : destino;
              avanzar(destinoFinal, texto);
            }}
            alVolver={retroceder}
          />
        )}

        {pantalla === "fechaFirmaConvenio" && (
          <section className="comparacion-fecha-convenio">
            <div className="panel-fecha-convenio">
              <span className="panel-fecha-convenio__rotulo">ENTRADA EN VIGOR PUBLICADA POR LA DGT · {paisActual?.nombre || paisSeleccionado || "PAÍS NO IDENTIFICADO"}</span>
              <strong>{paisActual?.fechaEntradaVigor || "Fecha no disponible en la tabla oficial de la DGT"}</strong>
              <details className="aclaracion-desplegable aclaracion-desplegable--compacta">
                <summary>¿Qué fecha debo comparar?</summary>
                <p>Esta es la fecha de entrada en vigor, no necesariamente la fecha de firma. Para decidir si el permiso puede canjearse, comprueba la fecha de firma del convenio y compárala con la fecha de expedición del permiso.</p>
                {paisActual?.fechaModificacion && <small>Modificación del acuerdo publicada: {paisActual.fechaModificacion}. Comprueba si afecta a la categoría y al supuesto concreto.</small>}
                <small className="panel-fecha-convenio__aviso">No uses la fecha de entrada en vigor como sustituta de la fecha de firma. Consulta la ficha del país en la DGT antes de resolver.</small>
              </details>
            </div>
            <Pregunta
              titulo={preguntas.fechaFirmaConvenio.titulo}
              descripcion={preguntas.fechaFirmaConvenio.descripcion}
              opciones={preguntas.fechaFirmaConvenio.opciones}
              alSeleccionar={(destino, texto) => avanzar(destino, texto)}
              alVolver={pilaNavegacion.length ? retroceder : null}
            />
            <p className="enlace-ayuda-dgt enlace-ayuda-dgt--convenio">
              <a href="https://sede-pro.dgt.gob.es/es/permisos-de-conducir/canjes-de-permisos/canjes-de-permisos-extranjeros/" target="_blank" rel="noreferrer">Consultar en la DGT la fecha de firma y los requisitos de canje del país</a>
            </p>
          </section>
        )}

        {pantalla === "fechaPermiso" && (
          <Pregunta
            titulo={preguntas.fechaPermiso.titulo}
            descripcion={preguntas.fechaPermiso.descripcion}
            opciones={preguntas.fechaPermiso.opciones}
            alSeleccionar={seleccionarFechaObtencion}
            alVolver={retroceder}
          />
        )}
      </div>

      <footer className="pie-aplicacion">
        <span>MOTOLISTOS</span>
        <span>Herramienta de apoyo · Verificar siempre la normativa vigente</span>
      </footer>
    </main>
  );
}

export default App;
