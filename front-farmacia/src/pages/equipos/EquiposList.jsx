import React, { useEffect, useState } from "react";
import { getEquipos, deleteEquipo } from "../../service/api";
import EquiposTable from "../../components/table/EquiposTable ";

const EquiposList = () => {
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await getEquipos();
        setEquipos(response.data);
      } catch (error) {
        console.error("Error al obtener los equipos:", error);
      }
    };

    fetchEquipos();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteEquipo(id);
      setEquipos(equipos.filter((equipo) => equipo.id !== id));
    } catch (error) {
      console.error("Error al eliminar el equipo:", error);
    }
  };

  return (
    <div className="equipos-list-container">
      <EquiposTable 
        data={equipos} 
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default EquiposList;