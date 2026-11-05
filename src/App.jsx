import { useState } from "react";
import { resultados } from "./datosPermisos";
import { paises } from "./paises";
import TarjetaResultado from "./componentes/TarjetaResultado";
import Pregunta from "./componentes/Pregunta";

const preguntas = {
  inicio: { titulo: "¿El conductor posee permiso de conducción?", opciones: [{ valor: "tipoPermiso", texto: "Sí, posee permiso" }, { valor: "sinPermiso", texto: "No posee permiso" }] },
  tipoPermiso: { titulo: "¿El permiso es español o extranjero?", opciones: [{ valor: "espanol", texto: "Español" }, { valor: "extranjero", texto: "Extranjero" }] },
  espanol: { titulo: "¿El permiso español está vigente?", opciones: [{ valor: "categoriaEspanol", texto: "Sí, está vigente" }, { valor: "espanolCaducado", texto: "No, está caducado" }] },
  extranjero: { titulo: "¿El permiso ha sido expedido en la UE o el EEE?", opciones: [{ valor: "ue", texto: "Sí" }, { valor: "noUE", texto: "No" }] },
  ue: { titulo: "¿El permiso de la UE o del EEE está en vigor?", opciones: [{ valor: "categoriaUE", texto: "Sí, está en vigor" }, { valor: "ueCaducado", texto: "No, está caducado" }] },
  categoriaEspanol: { titulo: "¿La categoría que figura en el permiso habilita para conducir el vehículo que utiliza?", descripcion: "Comprueba la clase del vehículo, las categorías autorizadas y sus fechas de vigencia. No basta con que el documento esté en vigor.", opciones: [{ valor: "categoriaCorrectaEspanol", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, la categoría no habilita" }] },
  categoriaUE: { titulo: "¿La categoría que figura en el permiso habilita para conducir el vehículo que utiliza?", descripcion: "Comprueba la equivalencia de categorías, las fechas de vigencia y las posibles restricciones del permiso extranjero.", opciones: [{ valor: "categoriaCorrectaUE", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, la categoría no habilita" }] },
  noUE: { titulo: "¿El permiso de un tercer país está en vigor?", opciones: [{ valor: "terceroVigente", texto: "Sí, está en vigor" }, { valor: "terceroCaducado", texto: "No, está caducado" }] },
  terceroVigente: { titulo: "¿El titular es residente en España?", opciones: [{ valor: "residente", texto: "Sí" }, { valor: "noResidente", texto: "No" }] },
  residente: { titulo: "¿Han transcurrido más de seis meses desde que adquirió la residencia normal en España?", opciones: [{ valor: "mas6meses", texto: "Sí" }, { valor: "categoriaTerceroMenos6", texto: "No" }] },
  categoriaTerceroNoResidente: { titulo: "¿La categoría del permiso habilita para el vehículo que conduce?", descripcion: "Comprueba la clase del vehículo, las categorías autorizadas, las restricciones y la vigencia del permiso.", opciones: [{ valor: "terceroNoResidenteCategoria", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, no habilita" }] },
  categoriaTerceroMenos6: { titulo: "¿La categoría del permiso habilita para el vehículo que conduce?", descripcion: "Comprueba la clase del vehículo, las categorías autorizadas, las restricciones y la vigencia del permiso.", opciones: [{ valor: "terceroMenos6Categoria", texto: "Sí, la categoría es adecuada" }, { valor: "categoriaNoCoincide", texto: "No, no habilita" }] },
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
    setPilaNavegacion([]);
  };

  const resultadosPorPantalla = {
    sinPermiso: "PER001",
    categoriaCorrectaEspanol: "PER002",
    categoriaCorrectaUE: "PER004",
    categoriaNoCoincide: "PER013",
    espanolCaducado: "PER003",
    ueVigente: "PER004",
    ueCaducado: "PER005",
    terceroNoResidenteCategoria: "PER006",
    terceroMenos6Categoria: "PER007",
    terceroCaducado: "PER011",
    conConvenio: "PER008",
    sinConvenio: "PER009",
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
      setPantalla(pais.convenio ? "conConvenio" : "sinConvenio");
      return;
    }
    // La DGT contempla una excepción específica para permisos de Corea del Sur.
    setPantalla(pais.nombre.includes("Corea del Sur") ? "coreaPosteriorResidencia" : "obtenidoDespuesNoCanjeable");
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
            titulo={preguntas[pantalla].titulo}
            descripcion={preguntas[pantalla].descripcion}
            opciones={preguntas[pantalla].opciones}
            alSeleccionar={(destino, texto) => avanzar(destino, texto)}
            alVolver={pilaNavegacion.length ? retroceder : null}
          />
        )}

        {pantalla === "mas6meses" && (
          <section className="panel-pregunta">
            <span className="etiqueta-seccion">PERMISO EXTRANJERO</span>
            <h2>Selecciona el país que expidió el permiso</h2>
            <p className="texto-secundario">La relación de países se basa en la información publicada por la DGT. El convenio no garantiza por sí solo que un permiso concreto sea canjeable.</p>
            <label className="etiqueta-campo" htmlFor="pais-permiso">País de expedición</label>
            <select id="pais-permiso" className="selector-pais" value={paisSeleccionado} onChange={(evento) => setPaisSeleccionado(evento.target.value)}>
              <option value="">Selecciona un país...</option>
              {paises.map((pais) => <option key={pais.nombre} value={pais.nombre}>{pais.nombre}</option>)}
            </select>
            <div className="acciones-pregunta">
              <button className="boton boton--secundario" onClick={retroceder}>Volver</button>
              <button className="boton boton--principal" disabled={!paisSeleccionado} onClick={() => avanzar("fechaPermiso", `País de expedición: ${paisSeleccionado}`)}>Continuar</button>
            </div>
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
