import { FaSpinner } from "react-icons/fa";
import TrabajoList from "./TrabajoM";

const TrabajosEnProgreso = ({ trabajos, onDelete }) => {
  const enProgreso = trabajos.filter(t => t.estado === "En Progreso");
  
  return (
    <TrabajoList
      trabajos={enProgreso}
      onDelete={onDelete}
      title="Trabajos en Progreso"
      icon={<FaSpinner className="spin" />}
      emptyMessage="No hay trabajos en progreso"
    />
  );
};

export default TrabajosEnProgreso;