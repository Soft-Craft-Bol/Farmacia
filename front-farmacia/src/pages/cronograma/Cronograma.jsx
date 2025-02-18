import React from "react";
import "./Cronograma.css"; 

const Cronograma = () => {
  // Definimos los meses que usaremos como cabecera.
  const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  
  // Aquí definimos la información de cada capacitación:
  // - `título` es el nombre del tema
  // - `responsable` es la persona encargada
  // - `mesesActivos` es un array con los meses (en texto) en los que se imparte
  const formaciones = [
    {
      título: "Introducción a la industria",
      responsable: "Paula",
      mesesActivos: ["ENE", "FEB"]
    },
    {
      título: "Seguridad y bienestar de los trabajadores",
      responsable: "Daniela",
      mesesActivos: ["FEB"]
    },
    {
      título: "Línea de producción y calidad",
      responsable: "Paula",
      mesesActivos: ["ENE", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO"]
    },
    {
      título: "Métricas y objetivos de campaña",
      responsable: "Sergio",
      mesesActivos: ["MAR", "ABR", "MAY"]
    },
    {
      título: "Plan de carrera",
      responsable: "Jorge",
      mesesActivos: ["ABR", "MAY", "JUN"]
    },
    {
      título: "Desarrollo personal, gestión y liderazgo",
      responsable: "Sara",
      mesesActivos: ["MAY", "JUN", "JUL", "NOV"]
    },
    {
      título: "Nuevos negocios",
      responsable: "Javier",
      mesesActivos: ["NOV", "DIC"]
    }
  ];

  return (
    <div className="cronograma-container">
      <table className="cronograma-tabla">
        <thead>
          <tr>
            <th style={{ width: "30%" }}>Cronograma de Formación</th>
            <th style={{ width: "15%" }}>Responsable</th>
            {/* Pintamos en el header los meses */}
            {meses.map((mes) => (
              <th key={mes}>{mes}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {formaciones.map((formacion, index) => (
            <tr key={index}>
              <td>{formacion.título}</td>
              <td>{formacion.responsable}</td>
              {meses.map((mes) => (
                <td
                  key={mes}
                  // Si el mes está en mesesActivos, lo coloreamos, si no, lo dejamos vacío
                  style={{
                    backgroundColor: formacion.mesesActivos.includes(mes)
                      ? "#FFC107" // cambia el color a tu gusto
                      : "transparent"
                  }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Cronograma;
