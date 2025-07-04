import { FaCheckCircle } from "react-icons/fa";
import TrabajoList from "./TrabajoM";

const TrabajosFinalizados = ({ trabajos, onDelete }) => {
  const finalizados = trabajos.filter(t => t.estado === "Finalizado");
  
  return (
    <TrabajoList
      trabajos={finalizados}
      onDelete={onDelete}
      title="Trabajos Finalizados"
      icon={<FaCheckCircle />}
      emptyMessage="No hay trabajos finalizados"
    />
  );
};

export default TrabajosFinalizados;