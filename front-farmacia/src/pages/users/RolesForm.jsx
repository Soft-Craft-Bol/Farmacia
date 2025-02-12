import { useState, useEffect } from "react";
import { getRoles, getUsers, assignRoleToUser, createRole, deleteRole, getPermissions } from "../../service/api";
import "./RolesForm.css";
import { IoCloseOutline } from "react-icons/io5";



const RolesForm = () => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [permisos, setPermisos] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [todosLosPermisos, setTodosLosPermisos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    cargarRoles();
    cargarUsuarios();
    cargarPermisos(); 
  }, []);
  const cargarPermisos = async () => {
    try {
      const response = await getPermissions();
      setTodosLosPermisos(response.data);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };

  const cargarUsuarios = async () => {
    try{
        const response = await getUsers();
        setUsuarios(response.data);
    }catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
  }

  const togglePermiso = (permiso) => {
    setPermisos((prevPermisos) =>
      prevPermisos.includes(permiso)
        ? prevPermisos.filter((p) => p !== permiso)
        : [...prevPermisos, permiso]
    );
  };
  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      alert("Debes seleccionar un usuario y un rol.");
      return;
    }

    try {
      await assignRoleToUser({ userId: selectedUser, roleId: selectedRole });
      alert("Rol asignado correctamente.");
      cargarUsuarios();
    } catch (error) {
      console.error("Error al asignar rol:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const permisosNumericos = permisos.map(p => parseInt(p, 10));
    //   await createRole({ nombre, codigo, permisos });
      await createRole({ nombre, permisos: permisosNumericos });
      alert("Rol creado correctamente");
      setNombre("");
      setCodigo("");
      setPermisos([]);
      cargarRoles(); 
    } catch (error) {
      console.error("Error al crear el rol:", error);
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      await deleteRole(id);
      alert("Rol eliminado correctamente");
      cargarRoles(); 
    } catch (error) {
      console.error("Error al eliminar el rol:", error);
    }
  };

  return (
    <div className="roles-form-container">
      <h2>Role</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre del Rol:</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <label>Permisos:</label>
        <select onChange={(e) => togglePermiso(e.target.value)}>
          <option>Selecciona un permiso</option>
          {todosLosPermisos.map((permiso) => (
            <option key={permiso.id} value={permiso.nombre}>{permiso.nombre}</option>
          ))}
        </select>

        <div className="permisos-container">
            <h3>Mis Permisos:</h3>
            {permisos.length === 0 ? (
                <p>No has seleccionado permisos aún.</p>
            ) : (
                permisos.map((permiso, index) => (
                <span key={index} className="permiso-item" onClick={() => togglePermiso(permiso)}>
                    {permiso} 
                    <IoCloseOutline size={20} color="red" />
                </span>
                ))
            )}
        </div>


        <button type="submit">Guardar Rol</button>
      </form>
    </div>
  );
};

export default RolesForm;
