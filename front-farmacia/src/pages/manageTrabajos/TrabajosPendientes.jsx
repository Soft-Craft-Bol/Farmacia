import { FaClock } from "react-icons/fa";
import TrabajoList from "./TrabajoM";

const TrabajosPendientes = ({ trabajos, onDelete }) => {
  const pendientes = trabajos.filter(t => t.estado === "Pendiente");
  
  return (
    <TrabajoList
      trabajos={pendientes}
      onDelete={onDelete}
      title="Trabajos Pendientes"
      icon={<FaClock />}
      emptyMessage="No hay trabajos pendientes"
    />
  );
};

export default TrabajosPendientes;