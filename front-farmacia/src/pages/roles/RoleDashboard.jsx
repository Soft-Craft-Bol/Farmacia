import { useState, useEffect } from "react";
import { getRoles, getPermissions, getUsers } from "../../service/api";
import RoleList from "./RoleList";
import RoleForm from "./RoleForm";
import PermissionManager from "./PermissionManager";
import UserRoleAssignment from "./UserRoleAssignment";
import "./RoleDashboard.css";

const RoleDashboard = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("roles");
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesRes, permissionsRes, usersRes] = await Promise.all([
        getRoles(),
        getPermissions(),
        getUsers()
      ]);
      console.log(rolesRes)
      setRoles(rolesRes.data);
      setPermissions(permissionsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleRoleCreated = (newRole) => {
    setRoles([...roles, newRole]);
    setActiveTab("roles");
  };

  const handleRoleUpdated = (updatedRole) => {
    setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
    setSelectedRole(null);
  };

  const handleRoleDeleted = (id) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  return (
    <div className="role-dashboard">
      <h1>Gestión de Roles y Permisos</h1>
      
      <div className="tabs">
        <button 
          className={activeTab === "roles" ? "active" : ""} 
          onClick={() => setActiveTab("roles")}
        >
          Roles
        </button>
        <button 
          className={activeTab === "permissions" ? "active" : ""} 
          onClick={() => setActiveTab("permissions")}
        >
          Permisos
        </button>
        <button 
          className={activeTab === "assignments" ? "active" : ""} 
          onClick={() => setActiveTab("assignments")}
        >
          Asignaciones
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "roles" && (
          <>
            <button 
              className="btn-new" 
              onClick={() => setSelectedRole({ id: null, nombre: "", permisos: [] })}
            >
              + Nuevo Rol
            </button>
            
            {selectedRole ? (
              <RoleForm 
                role={selectedRole} 
                permissions={permissions} 
                onCancel={() => setSelectedRole(null)}
                onSuccess={selectedRole.id ? handleRoleUpdated : handleRoleCreated}
              />
            ) : (
              <RoleList 
                roles={roles} 
                onEdit={setSelectedRole} 
                onDelete={handleRoleDeleted}
              />
            )}
          </>
        )}

        {activeTab === "permissions" && (
          <PermissionManager 
            permissions={permissions} 
            onUpdate={loadData}
          />
        )}

        {activeTab === "assignments" && (
          <UserRoleAssignment 
            roles={roles} 
            users={users} 
            onUpdate={loadData}
          />
        )}
      </div>
    </div>
  );
};

export default RoleDashboard;