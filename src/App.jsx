import { useState } from "react";
import { resultados } from "./datosPermisos";
import { paises } from "./paises";
import TarjetaResultado from "./componentes/TarjetaResultado";
import Pregunta from "./componentes/Pregunta";

const preguntas = {
  inicio: { titulo: "¿El conductor posee permiso de conducción?", opciones: [{ valor: "tipoPermiso", texto: "Sí, posee permiso" }, { valor: "situacionSinPermiso", texto: "No dispone de un permiso válido" }] },
  situacionSinPermiso: { titulo: "¿Cuál es la situación administrativa o judicial del permiso?", descripcion: "Esta distinción es esencial. En la opción judicial, marca esa respuesta solo si la privación cautelar o la pena sigue vigente en el momento de la conducción. Si ya cumplió la pena pero no ha recuperado el permiso, selecciona «Otra causa / no está claro»: la Fiscalía ha fijado un criterio específico para ese supuesto en 2026.", opciones: [{ valor: "sinPermisoNunca", texto: "Nunca ha obtenido permiso de conducción" }, { valor: "sinPermisoPuntos", texto: "Tiene declarada la pérdida de vigencia por pérdida total de puntos" }, { valor: "sinPermisoPrivacion", texto: "Está privado del derecho a conducir por resolución judicial" }, { valor: "sinPermisoOtraSituacion", texto: "Otra causa / no está claro" }] },
  tipoPermiso: { titulo: "¿El permiso es español o extranjero?", opciones: [{ valor: "espanol", texto: "Español" }, { valor: "extranjero", texto: "Extranjero" }] },
  espanol: { titulo: "¿El permiso español está vigente?", opciones: [{ valor: "categoriaEspanol", texto: "Sí, está vigente" }, { valor: "espanolCaducado", texto: "No, está caducado" }] },
  extranjero: { titulo: "¿El permiso ha sido expedido en la UE o el EEE?", opciones: [{ valor: "ue", texto: "Sí" }, { valor: "noUE", texto: "No" }] },
  ue: { titulo: "¿El permiso de la UE o del EEE está en vigor?", opciones: [{ valor: "categoriaUE", texto: "Sí, está en vigor" }, { valor: "ueCaducado", texto: "No, está caducado" }] },
  categoriaEspanol: { titulo: "¿La categoría que figura en el permiso habilita para conducir el vehículo que utiliza?", descripcion: "Comprueba la clase del vehículo, las categorías autorizadas y sus fechas de vigencia. No basta con que el documento esté en vigor.", opciones: [{ valor: "categoriaCorrectaEspanol", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, la categoría no habilita" }] },
  categoriaUE: { titulo: "¿La categoría que figura en el permiso habilita para conducir el vehículo que utiliza?", descripcion: "Comprueba la equivalencia de categorías, las fechas de vigencia y las posibles restricciones del permiso extranjero.", opciones: [{ valor: "ueResidenciaDosAnos", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, la categoría no habilita" }] },
  ueResidenciaDosAnos: { titulo: "¿El titular lleva dos años o más de residencia normal en España?", descripcion: "Esta comprobación es relevante para determinados permisos de la UE o del EEE con periodos de vigencia muy largos o indefinidos.", opciones: [{ valor: "uePlazoLargo", texto: "Sí, lleva dos años o más" }, { valor: "ueRenovacionNo", texto: "No, lleva menos de dos años o no reside en España" }] },
  uePlazoLargo: { titulo: "¿El permiso tiene vigencia indefinida o un periodo superior al límite aplicable?", descripcion: "Límite: más de 15 años para el grupo 1 (motos y turismos) o más de 5 años para el grupo 2 (camiones y autobuses).", opciones: [{ valor: "ueRenovacionSi", texto: "Sí, supera el límite o es indefinido" }, { valor: "ueRenovacionNo", texto: "No, no supera ese límite" }] },
  noUE: { titulo: "¿El permiso de un tercer país está en vigor?", opciones: [{ valor: "terceroVigente", texto: "Sí, está en vigor" }, { valor: "terceroCaducado", texto: "No, está caducado" }] },
  terceroVigente: { titulo: "¿El titular es residente en España?", opciones: [{ valor: "residente", texto: "Sí" }, { valor: "paisTerceroNoResidente", texto: "No" }] },
  residente: { titulo: "¿Han transcurrido más de seis meses desde que adquirió la residencia normal en España?", opciones: [{ valor: "mas6meses", texto: "Sí" }, { valor: "categoriaTerceroMenos6", texto: "No" }] },
  categoriaTerceroNoResidente: { titulo: "¿La categoría del permiso habilita para el vehículo que conduce?", descripcion: "Comprueba la clase del vehículo, las categorías autorizadas, las restricciones y la vigencia del permiso.", opciones: [{ valor: "terceroNoResidenteEdad", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, no habilita" }] },
  categoriaTerceroMenos6: { titulo: "¿La categoría del permiso habilita para el vehículo que conduce?", descripcion: "Comprueba la clase del vehículo, las categorías autorizadas, las restricciones y la vigencia del permiso.", opciones: [{ valor: "terceroMenos6Edad", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, no habilita" }] },
  terceroNoResidenteEdad: { titulo: "¿El titular tiene la edad mínima exigida en España para esa categoría?", descripcion: "La edad exigida es la correspondiente al permiso español equivalente. Comprueba la edad del conductor y la categoría concreta.", opciones: [{ valor: "terceroNoResidenteFormato", texto: "Sí, cumple la edad mínima" }, { valor: "requisitoEdadNoCumplido", texto: "No, no cumple la edad mínima" }] },
  terceroNoResidentePlazo: { titulo: "¿Han transcurrido más de seis meses desde la entrada regular del titular en España?", descripcion: "Si no acredita residencia normal en España, el artículo 21.2.c) establece un plazo máximo de seis meses desde su entrada en territorio español en situación regular, sin perjuicio de reglas específicas de convenios.", opciones: [{ valor: "terceroNoResidenteCategoria", texto: "No, todavía no han transcurrido seis meses" }, { valor: "terceroNoResidentePlazoSuperado", texto: "Sí, han transcurrido más de seis meses" }] },
  terceroMenos6Edad: { titulo: "¿El titular tiene la edad mínima exigida en España para esa categoría?", descripcion: "La edad exigida es la correspondiente al permiso español equivalente. Comprueba la edad del conductor y la categoría concreta.", opciones: [{ valor: "terceroMenos6Formato", texto: "Sí, cumple la edad mínima" }, { valor: "requisitoEdadNoCumplido", texto: "No, no cumple la edad mínima" }] },
  terceroNoResidenteFormato: { titulo: "¿El documento cumple alguno de los formatos o reconocimientos admitidos en España?", descripcion: "Por ejemplo: permiso en castellano o con traducción oficial, modelo conforme a los convenios de Ginebra o Viena, permiso internacional válido acompañado del permiso nacional, o reconocimiento por convenio específico.", opciones: [{ valor: "terceroNoResidentePlazo", texto: "Sí, cumple uno de esos requisitos" }, { valor: "requisitoFormatoNoAcreditado", texto: "No / no puedo acreditarlo" }] },
  terceroMenos6Formato: { titulo: "¿El documento cumple alguno de los formatos o reconocimientos admitidos en España?", descripcion: "Por ejemplo: permiso en castellano o con traducción oficial, modelo conforme a los convenios de Ginebra o Viena, permiso internacional válido acompañado del permiso nacional, o reconocimiento por convenio específico.", opciones: [{ valor: "terceroMenos6Categoria", texto: "Sí, cumple uno de esos requisitos" }, { valor: "requisitoFormatoNoAcreditado", texto: "No / no puedo acreditarlo" }] },
  fechaFirmaConvenio: { titulo: "¿El permiso se obtuvo antes de la fecha de firma del convenio entre España y el país expedidor?", descripcion: "Algunos convenios permiten el canje si el permiso se obtuvo antes de la firma del acuerdo, aunque fuera después de adquirir la residencia en España. Comprueba la fecha exacta del convenio aplicable a ese país.", opciones: [{ valor: "convenioAnteriorFirma", texto: "Sí, antes de la firma del convenio" }, { valor: "profesionalTercero", texto: "No, después de la firma" }, { valor: "obtenidoDespuesNoAcreditado", texto: "No puedo acreditarlo" }] },
  profesionalTercero: { titulo: "¿Puede acogerse a la vía de canje para conductores profesionales?", descripcion: "Comprueba conjuntamente que el permiso esté comprendido en el artículo 21.1.a) o b), que acredita al menos seis meses contratado como conductor profesional por empresa legalmente establecida en España, que ha superado la prueba de circulación exigida y que no está privado, suspendido ni intervenido del derecho a conducir.", opciones: [{ valor: "profesionalPendiente", texto: "Sí, reúne y acredita todos los requisitos" }, { valor: "profesionalNoCanje", texto: "No / no reúne todos los requisitos" }] },
  fechaPermiso: {
    titulo: "¿Cuándo obtuvo el permiso extranjero respecto a la fecha en que adquirió la residencia legal en España?",
    descripcion: "La fecha de obtención puede determinar si el permiso es canjeable. Comprueba la documentación acreditativa, no solo la declaración del conductor.",
    opciones: [
      { valor: "obtenidoAntes", texto: "Antes de ser residente en España" },
      { valor: "obtenidoDespues", texto: "Después de ser residente en España" },
    ],
  },
};

function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [historial, setHistorial] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState("");
  const [busquedaPais, setBusquedaPais] = useState("");
  const [pilaNavegacion, setPilaNavegacion] = useState([]);

  const avanzar = (destino, texto) => {
    setPilaNavegacion((anterior) => [...anterior, { pantalla, historial, paisSeleccionado }]);
    if (texto) setHistorial((anterior) => [...anterior, texto]);
    setPantalla(destino);
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
    sinPermisoPrivacion: "PER020",
    sinPermisoOtraSituacion: "PER021",
    categoriaCorrectaEspanol: "PER002",
    categoriaCorrectaUE: "PER004",
    ueRenovacionNo: "PER004",
    ueRenovacionSi: "PER016",
    categoriaNoCoincide: "PER013",
    espanolCaducado: "PER003",
    ueVigente: "PER004",
    ueCaducado: "PER005",
    terceroNoResidenteCategoria: "PER006",
    terceroNoResidentePlazoSuperado: "PER017",
    requisitoEdadNoCumplido: "PER014",
    requisitoFormatoNoAcreditado: "PER015",
    terceroMenos6Categoria: "PER007",
    terceroCaducado: "PER011",
    conConvenio: "PER008",
    convenioAnteriorFirma: "PER008",
    obtenidoDespuesNoAcreditado: "PER010",
    sinConvenio: "PER009",
    profesionalPendiente: "PER018",
    obtenidoDespuesNoCanjeable: "PER010",
    coreaPosteriorResidencia: "PER012",
  };

  const resultado = resultados[resultadosPorPantalla[pantalla]];

  const seleccionarFechaObtencion = (destino, texto) => {
    const pais = paises.find((elemento) => elemento.nombre === paisSeleccionado);
    if (!pais) return;
    // Registrar una sola vez la respuesta elegida para evitar duplicados en el resultado.
    setPilaNavegacion((anterior) => [...anterior, { pantalla, historial, paisSeleccionado }]);
    setHistorial((anterior) => [...anterior, texto]);
    if (destino === "obtenidoAntes") {
      setPantalla(pais.convenio ? "conConvenio" : "profesionalTercero");
      return;
    }
    // La DGT contempla una excepción específica para permisos de Corea del Sur.
    if (pais.nombre.includes("Corea del Sur")) {
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
        <span className="cabecera-aplicacion__estado">VERSIÓN DE TRABAJO</span>
      </header>

      <div className="contenido-principal">
        <div className="titulo-pagina">
          <span className="etiqueta-seccion">MÓDULO 01 · CONDUCCIÓN</span>
          <h1>Consulta de permisos</h1>
          <p>Asistente guiado para comprobar las circunstancias del permiso de conducción.</p>
        </div>

        {resultado && <TarjetaResultado resultado={resultado} historial={historial} alReiniciar={reiniciar} />}

        {preguntas[pantalla] && (
          <Pregunta
            pasoActual={pilaNavegacion.length + 1}
            titulo={preguntas[pantalla].titulo}
            descripcion={preguntas[pantalla].descripcion}
            opciones={preguntas[pantalla].opciones}
            alSeleccionar={(destino, texto) => avanzar(destino, texto)}
            alVolver={pilaNavegacion.length ? retroceder : null}
          />
        )}

        {(pantalla === "mas6meses" || pantalla === "paisTerceroNoResidente") && (
          <section className="panel-pregunta">
            <span className="etiqueta-seccion">PASO {pilaNavegacion.length + 1} · PERMISO EXTRANJERO</span>
            <h2>Selecciona el país que expidió el permiso</h2>
            <p className="texto-secundario">La relación de países se basa en la información publicada por la DGT. El convenio no garantiza por sí solo que un permiso concreto sea canjeable. Si no aparece, selecciona «Otro país» y verifica el reconocimiento internacional aplicable.</p>
            <label className="etiqueta-campo" htmlFor="buscar-pais">Buscar país</label>
            <input id="buscar-pais" className="campo-busqueda-pais" type="search" placeholder="Escribe para localizar el país..." value={busquedaPais} onChange={(evento) => setBusquedaPais(evento.target.value)} />
            <label className="etiqueta-campo" htmlFor="pais-permiso">País de expedición</label>
            <select id="pais-permiso" className="selector-pais" value={paisSeleccionado} onChange={(evento) => setPaisSeleccionado(evento.target.value)}>
              <option value="">Selecciona un país...</option>
              {paises.filter((pais) => pais.nombre.toLocaleLowerCase("es").includes(busquedaPais.toLocaleLowerCase("es"))).map((pais) => <option key={pais.nombre} value={pais.nombre}>{pais.nombre}</option>)}
            </select>
            {busquedaPais && !paises.some((pais) => pais.nombre.toLocaleLowerCase("es").includes(busquedaPais.toLocaleLowerCase("es"))) && <p className="texto-secundario">No se encuentra ese país. Prueba con otro nombre o selecciona «Otro país» si no aparece en la lista.</p>}
            <div className="acciones-pregunta">
              <button className="boton boton--secundario" onClick={retroceder}>Volver</button>
              <button className="boton boton--principal" disabled={!paisSeleccionado} onClick={() => avanzar(pantalla === "paisTerceroNoResidente" ? "categoriaTerceroNoResidente" : "fechaPermiso", `País de expedición: ${paisSeleccionado}`)}>Continuar</button>
            </div>
          </section>
        )}

        {pantalla === "profesionalTercero" && (
          <Pregunta
            pasoActual={pilaNavegacion.length + 1}
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
          <Pregunta
            pasoActual={pilaNavegacion.length + 1}
            titulo={preguntas.fechaFirmaConvenio.titulo}
            descripcion={preguntas.fechaFirmaConvenio.descripcion}
            opciones={preguntas.fechaFirmaConvenio.opciones}
            alSeleccionar={(destino, texto) => avanzar(destino, texto)}
            alVolver={retroceder}
          />
        )}

        {pantalla === "fechaPermiso" && (
          <Pregunta
            pasoActual={pilaNavegacion.length + 1}
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
