import { useState } from "react";
import { resultados } from "./datosPermisos";
import { paises } from "./paises";
import { normativaPermisos } from "./normativaPermisos";
function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [historial, setHistorial] = useState([]);
const [paisSeleccionado, setPaisSeleccionado] = useState("");
  const reiniciar = () => {
    setPantalla("inicio");
    setHistorial([]);
  };

  const botonStyle = {
    padding: "12px 20px",
    margin: "5px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#1f4e79",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
  };

  const cardStyle = {
    backgroundColor: "#f5f5f5",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    marginTop: "20px",
  };

  const Resultado = ({
    codigo,
    puedeConducir,
    motivo,
    normativa,
    articulo,
    euros,
    puntos,
    actuacion,
    observaciones,
  }) => (
    <div style={cardStyle}>
      <h2>🚔 RESULTADO</h2>

      <div
        style={{
          backgroundColor: puedeConducir ? "#d4edda" : "#f8d7da",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "15px",
        }}
      >
        <strong>
          {puedeConducir
            ? "✅ PUEDE CONDUCIR"
            : "❌ NO PUEDE CONDUCIR"}
        </strong>
      </div>

      <h3>Consulta realizada</h3>

      <ul>
        {historial.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <hr />

      <p>
        <strong>Código:</strong> {codigo}
      </p>

      <p>
        <strong>Motivo:</strong> {motivo}
      </p>

      <p>
        <strong>Normativa:</strong> {normativa}
      </p>

      <p>
        <strong>Artículo:</strong> {articulo}
      </p>

      <p>
        <strong>Importe:</strong> {euros}
      </p>

      <p>
        <strong>Puntos:</strong> {puntos}
      </p>

      <p>
        <strong>Actuación:</strong> {actuacion}
      </p>

      <p>
        <strong>Observaciones:</strong> {observaciones}
      </p>

      <button style={botonStyle} onClick={reiniciar}>
        🔄 Nueva consulta
      </button>
    </div>
  );

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>🚔 Asistente de Permisos</h1>
<p>Países cargados: {paises.length}</p>
      {pantalla === "inicio" && (
        <>
          <h2>¿Posee permiso de conducción?</h2>

          <button
            style={botonStyle}
            onClick={() => {
              setHistorial([
                ...historial,
                "✅ Posee permiso de conducción",
              ]);
              setPantalla("tipoPermiso");
            }}
          >
            Sí
          </button>

          <button
            style={botonStyle}
            onClick={() => {
              setHistorial([
                ...historial,
                "❌ No posee permiso de conducción",
              ]);
              setPantalla("sinPermiso");
            }}
          >
            No
          </button>
        </>
      )}

      {pantalla === "sinPermiso" && (
        <Resultado {...resultados.PER001} />
      )}

      {pantalla === "tipoPermiso" && (
        <>
          <h2>¿El permiso es español o extranjero?</h2>

          <button
            style={botonStyle}
            onClick={() => {
              setHistorial([
                ...historial,
                "🇪🇸 Permiso español",
              ]);
              setPantalla("espanol");
            }}
          >
            Español
          </button>

          <button
            style={botonStyle}
            onClick={() => {
              setHistorial([
                ...historial,
                "🌍 Permiso extranjero",
              ]);
              setPantalla("extranjero");
            }}
          >
            Extranjero
          </button>
        </>
      )}

      {pantalla === "espanol" && (
        <>
          <h2>¿Está vigente?</h2>

          <button
            style={botonStyle}
            onClick={() => setPantalla("espanolValido")}
          >
            Sí
          </button>

          <button
            style={botonStyle}
            onClick={() => setPantalla("espanolCaducado")}
          >
            No
          </button>
        </>
      )}

      {pantalla === "espanolValido" && (
        <Resultado {...resultados.PER002} />
      )}

      {pantalla === "espanolCaducado" && (
        <Resultado {...resultados.PER003} />
      )}

      {pantalla === "extranjero" && (
        <>
          <h2>¿Pertenece a la UE / EEE?</h2>

          <button
            style={botonStyle}
            onClick={() => setPantalla("ue")}
          >
            Sí
          </button>

          <button
            style={botonStyle}
            onClick={() => setPantalla("noUE")}
          >
            No
          </button>
        </>
      )}

      {pantalla === "ue" && (
        <Resultado {...resultados.PER004} />
      )}

      {pantalla === "noUE" && (
        <>
          <h2>¿Es residente en España?</h2>

          <button
            style={botonStyle}
            onClick={() => setPantalla("residente")}
          >
            Sí
          </button>

          <button
            style={botonStyle}
            onClick={() => setPantalla("noResidente")}
          >
            No
          </button>
        </>
      )}

      {pantalla === "noResidente" && (
        <Resultado {...resultados.PER006} />
      )}

      {pantalla === "residente" && (
        <>
          <h2>¿Lleva más de 6 meses residiendo?</h2>

          <button
            style={botonStyle}
            onClick={() => setPantalla("mas6meses")}
          >
            Sí
          </button>

          <button
            style={botonStyle}
            onClick={() => setPantalla("menos6meses")}
          >
            No
          </button>
        </>
      )}

      {pantalla === "menos6meses" && (
        <Resultado {...resultados.PER007} />
      )}

      {pantalla === "mas6meses" && (
  <>
    <h2>🌍 Seleccione el país del permiso</h2>

    <select
      value={paisSeleccionado}
      onChange={(e) => setPaisSeleccionado(e.target.value)}
      style={{
        padding: "10px",
        fontSize: "16px",
        width: "300px",
        marginBottom: "20px",
      }}
    >
      <option value="">
        Seleccione país...
      </option>

      {paises.map((pais) => (
        <option
          key={pais.nombre}
          value={pais.nombre}
        >
          {pais.nombre}
        </option>
      ))}
    </select>

    <br />

    <button
      style={botonStyle}
      onClick={() => {
        const pais = paises.find(
          (p) => p.nombre === paisSeleccionado
        );

        if (!pais) return;

        if (pais.convenio) {
          setPantalla("conConvenio");
        } else {
          setPantalla("sinConvenio");
        }
      }}
    >
      Comprobar
    </button>
  </>
)}

      {pantalla === "conConvenio" && (
        <Resultado {...resultados.PER008} />
      )}

      {pantalla === "sinConvenio" && (
        <Resultado {...resultados.PER009} />
      )}
    </div>
  );
}

export default App;