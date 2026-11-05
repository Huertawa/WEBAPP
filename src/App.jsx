import { useState } from "react";
import { resultados } from "./datosPermisos";
import { paises } from "./paises";
import TarjetaResultado from "./componentes/TarjetaResultado";
import Pregunta from "./componentes/Pregunta";

const preguntas = {
  inicio: {
    titulo: "¿El conductor posee permiso de conducción?",
    opciones: [{ valor: "tipoPermiso", texto: "Sí, posee permiso" }, { valor: "sinPermiso", texto: "No posee permiso" }],
  },
  tipoPermiso: {
    titulo: "¿El permiso es español o extranjero?",
    opciones: [{ valor: "espanol", texto: "Español" }, { valor: "extranjero", texto: "Extranjero" }],
  },
  espanol: {
    titulo: "¿El permiso español está vigente?",
    opciones: [{ valor: "espanolValido", texto: "Sí, está vigente" }, { valor: "espanolCaducado", texto: "No, está caducado" }],
  },
  extranjero: {
    titulo: "¿El permiso ha sido expedido en la UE o el EEE?",
    opciones: [{ valor: "ue", texto: "Sí" }, { valor: "noUE", texto: "No" }],
  },
  ue: {
    titulo: "¿El permiso de la UE o del EEE está en vigor?",
    opciones: [{ valor: "ueVigente", texto: "Sí, está en vigor" }, { valor: "ueCaducado", texto: "No, está caducado" }],
  },
  noUE: {
    titulo: "¿El permiso de un tercer país está en vigor?",
    opciones: [{ valor: "terceroVigente", texto: "Sí, está en vigor" }, { valor: "terceroCaducado", texto: "No, está caducado" }],
  },
  terceroVigente: {
    titulo: "¿El titular es residente en España?",
    opciones: [{ valor: "residente", texto: "Sí" }, { valor: "noResidente", texto: "No" }],
  },
  residente: {
    titulo: "¿Han transcurrido más de seis meses desde que adquirió la residencia normal en España?",
    opciones: [{ valor: "mas6meses", texto: "Sí" }, { valor: "menos6meses", texto: "No" }],
  },
};

function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [historial, setHistorial] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState("");

  const avanzar = (destino, texto) => {
    if (texto) setHistorial((anterior) => [...anterior, texto]);
    setPantalla(destino);
  };

  const reiniciar = () => {
    setPantalla("inicio");
    setHistorial([]);
    setPaisSeleccionado("");
  };

  const resultadosPorPantalla = {
    sinPermiso: "PER001",
    espanolValido: "PER002",
    espanolCaducado: "PER003",
    ueVigente: "PER004",
    ueCaducado: "PER005",
    noResidente: "PER006",
    menos6meses: "PER007",
    terceroCaducado: "PER011",
    conConvenio: "PER008",
    sinConvenio: "PER009",
  };

  const codigoResultado = resultadosPorPantalla[pantalla];
  const resultado = codigoResultado ? resultados[codigoResultado] : null;

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

        {resultado && (
          <TarjetaResultado resultado={resultado} historial={historial} alReiniciar={reiniciar} />
        )}

        {preguntas[pantalla] && (
          <Pregunta
            titulo={preguntas[pantalla].titulo}
            opciones={preguntas[pantalla].opciones}
            alSeleccionar={(destino, texto) => avanzar(destino, texto)}
          />
        )}

        {pantalla === "mas6meses" && (
          <section className="panel-pregunta">
            <span className="etiqueta-seccion">PERMISO EXTRANJERO</span>
            <h2>Selecciona el país que expidió el permiso</h2>
            <p className="texto-secundario">La relación de países disponible es provisional. El convenio no garantiza por sí solo que el permiso pueda canjearse: también deben comprobarse la fecha de obtención y los requisitos del acuerdo.</p>
            <label className="etiqueta-campo" htmlFor="pais-permiso">País de expedición</label>
            <select id="pais-permiso" className="selector-pais" value={paisSeleccionado} onChange={(evento) => setPaisSeleccionado(evento.target.value)}>
              <option value="">Selecciona un país...</option>
              {paises.map((pais) => <option key={pais.nombre} value={pais.nombre}>{pais.nombre}</option>)}
            </select>
            <button
              className="boton boton--principal"
              disabled={!paisSeleccionado}
              onClick={() => {
                const pais = paises.find((elemento) => elemento.nombre === paisSeleccionado);
                if (!pais) return;
                avanzar(pais.convenio ? "conConvenio" : "sinConvenio", `País de expedición: ${pais.nombre}`);
              }}
            >
              Continuar
            </button>
          </section>
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
