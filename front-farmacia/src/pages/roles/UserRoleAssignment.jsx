import { useState } from "react";
import { assignRoleToUser, removeRoleFromUser, getUsersByRole } from "../../service/api";
import { useEffect } from "react";
import './UserRoleAssignment.css';

const UserRoleAssignment = ({ roles, users, onUpdate }) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [roleUsers, setRoleUsers] = useState([]);

  const handleAssign = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      await assignRoleToUser({
        userId: selectedUser,
        roleId: selectedRole
      });
      loadRoleUsers();
      alert("Rol asignado correctamente");
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };

  const handleRemove = async (assignmentId) => {
    try {
      await removeRoleFromUser({
        userId: selectedUser,
        roleId: selectedRole
      });
      loadRoleUsers();
    } catch (error) {
      console.error("Error removing role:", error);
    }
  };

  const loadRoleUsers = async () => {
    if (!selectedRole) return;
    try {
      const response = await getUsersByRole(selectedRole);
      setRoleUsers(response.data);
    } catch (error) {
      console.error("Error loading role users:", error);
    }
  };

  useEffect(() => {
    loadRoleUsers();
  }, [selectedRole]);

  return (
    <div className="user-role-assignment">
      <h2>Asignación de Roles a Usuarios</h2>
      
      <div className="assignment-form">
        <div className="form-group">
          <label>Seleccionar Rol:</label>
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">-- Seleccione un rol --</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.nombre}</option>
            ))}
          </select>
        </div>

        {selectedRole && (
          <>
            <div className="form-group">
              <label>Seleccionar Usuario:</label>
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">-- Seleccione un usuario --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nombre} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleAssign}
              disabled={!selectedUser}
            >
              Asignar Rol
            </button>
          </>
        )}
      </div>

      {selectedRole && (
        <div className="assigned-users">
          <h3>Usuarios con este rol</h3>
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roleUsers.length > 0 ? (
                roleUsers.map(assignment => (
                  <tr key={assignment.id}>
                    <td>{assignment.user?.nombre}</td>
                    <td>{assignment.user?.email}</td>
                    <td>
                      <button 
                        className="delete"
                        onClick={() => handleRemove(assignment.id)}
                      >
                        Quitar Rol
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No hay usuarios con este rol</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserRoleAssignment;