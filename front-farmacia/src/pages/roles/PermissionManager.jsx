import { useState } from "react";
import { createPermission, deletePermission } from "../../service/api";
import "./PermissionManager.css";

const PermissionManager = ({ permissions, onUpdate }) => {
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newPermissionDesc, setNewPermissionDesc] = useState("");

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    try {
      await createPermission({
        nombre: newPermissionName,
        descripcion: newPermissionDesc
      });
      setNewPermissionName("");
      setNewPermissionDesc("");
      onUpdate();
    } catch (error) {
      console.error("Error creating permission:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este permiso?")) {
      try {
        await deletePermission(id);
        onUpdate();
      } catch (error) {
        console.error("Error deleting permission:", error);
        alert("No se puede eliminar: " + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <div className="permission-manager">
      <h2>Gestión de Permisos</h2>
      
      <div className="permission-creator">
        <h3>Crear Nuevo Permiso</h3>
        <form onSubmit={handleCreatePermission}>
          <input
            type="text"
            placeholder="Nombre del permiso"
            value={newPermissionName}
            onChange={(e) => setNewPermissionName(e.target.value)}
            required
          />
          <button type="submit">Crear Permiso</button>
        </form>
      </div>

      <div className="permission-list">
        <h3>Lista de Permisos</h3>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map(perm => (
              <tr key={perm.id}>
                <td>{perm.nombre}</td>
                <td>{perm.descripcion || "-"}</td>
                <td>
                  <button 
                    className="delete" 
                    onClick={() => handleDelete(perm.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionManager;