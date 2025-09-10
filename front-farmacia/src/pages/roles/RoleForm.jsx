import { useState } from "react";
import { createRole, updateRole } from "../../service/api";
import "./RoleForm.css";

const RoleForm = ({ role, permissions, onCancel, onSuccess }) => {
  const [nombre, setNombre] = useState(role.nombre || "");
  const [selectedPermissions, setSelectedPermissions] = useState(
    role.permisos?.map(p => p.permission?.id) || []
  );

  const togglePermission = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const roleData = {
      nombre,
      permisos: selectedPermissions
    };

    try {
      const response = role.id
        ? await updateRole(role.id, roleData)
        : await createRole(roleData);
      
      onSuccess(response.data);
    } catch (error) {
      console.error("Error saving role:", error);
      alert("Error al guardar el rol");
    }
  };

  return (
    <div className="role-form">
      <h2>{role.id ? "Editar Rol" : "Nuevo Rol"}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del Rol:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Permisos:</label>
          <div className="permissions-grid">
            {permissions.map(perm => (
              <label key={perm.id} className="permission-item">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(perm.id)}
                  onChange={() => togglePermission(perm.id)}
                />
                {perm.nombre}
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit">
            {role.id ? "Actualizar" : "Crear"} Rol
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;