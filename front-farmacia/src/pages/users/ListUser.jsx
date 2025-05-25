import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import Table from "../../components/table/Table";
import { FaEdit, MdDelete } from "../../hooks/icons";
import { getUsers, deleteUser, getRoles } from "../../service/api";
import { getUser } from "../login/authFuntions";
import { Toaster, toast } from "sonner";
import { Link } from "react-router-dom";
import LinkButton from "../../components/buttons/LinkButton";
import "./ListUser.css";
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";

const Modal = lazy(() => import("../../components/modal/Modal"));
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
const [detailsModalOpen, setDetailsModalOpen] = useState(false);
const handleRowClick = (user) => {
  setSelectedUser(user);
  setDetailsModalOpen(true);
};

  const currentUser = useMemo(() => getUser(), []);

  useEffect(() => {
    const fetchRoles = async () => {
      const response = await getRoles();
      setRoles(
        response.data.map((rol) => ({
          value: rol.id,
          label: rol.name,
        }))
      );
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getUsers();
      console.log(response);
      setUsers(response.data);
    };
    fetchUsers();
  }, []);


  const handleDeleteUser = useCallback(async () => {
    if (userToDelete.id === currentUser.id) {
      toast.error("No puedes eliminar tu propio usuario.");
      return;
    }
    try {
      await deleteUser(userToDelete.id);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id));
      toast.success("Usuario eliminado exitosamente.");
    } catch (error) {
      toast.error("Error al eliminar el usuario.");
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, currentUser]);

  const confirmDeleteUser = useCallback(
    (user) => {
      if (user.id === currentUser.id) {
        toast.error("No puedes eliminar tu propio usuario.");
        return;
      }
      setUserToDelete(user);
      setDeleteConfirmOpen(true);
    },
    [currentUser]
  );



  /* const isAdmin = useMemo(
    () => currentUser?.roles.includes("Administrador"),
    [currentUser]
  ); */

  // Memoizing column definitions to avoid unnecessary re-renders
  const columns = useMemo(
    () => [
      { header: "ID", accessor: "id" },
      {
        header: "",
        accessor: "photo",
        render: (row) => (
          <div className="user-photo">
            <img
              src={row.foto}
              alt={`${row.nombre} ${row.apellido}`}
              style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "50%",
                objectFit: "cover"
              }}
            />
          </div>
        ),
      },
      { header: "Nombre", accessor: "nombre" },
      { header: "Apellido", accessor: "apellido" },
      { header: "Profesion", accessor: "profesion" },
      { header: "Correo Electrónico", accessor: "email" },
      { header: "Tipo de Usuario", accessor: "usuario" },
      {
        header: "Acciones",
        render: (row) => (
          <div className="user-management-table-actions">
            <Link to={`/editUser/${row.id}`} className="user-management-edit-user">
              <FaEdit />
            </Link>
            <ButtonPrimary
              type="danger"
              onClick={() => confirmDeleteUser(row)}
              disabled={currentUser?.id === row.id}
            >
              <MdDelete />
            </ButtonPrimary>
          </div>
        ),
      },
    ].filter(Boolean),
    [ confirmDeleteUser, currentUser]
  );

  const filteredUsers = useMemo(() => {
    if (!filterText) return users;
    const lowercased = filterText.toLowerCase();
    return users.filter((user) =>
      `${user.nombre} ${user.apellido} ${user.email} ${user.usuario} ${user.profesion}`
        .toLowerCase()
        .includes(lowercased)
    );
  }, [filterText, users]);
  
  return (
    <div className="user-management-container">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      <div className="user-management-header">
        <h2 className="user-management-title">Gestión de Usuarios</h2>
         <LinkButton to={`/registerUser`}>Agregar Usuario</LinkButton>
      </div>
      <div className="user-management-search">
  <div className="search-input-wrapper">
    <span className="search-icon">🔍</span>
    <input
      type="text"
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
      placeholder="Buscar usuario..."
      className="search-input"
    />
    {filterText && (
      <button onClick={() => setFilterText("")} className="clear-button">
        ❌
      </button>
    )}
  </div>
</div>


<Table columns={columns} data={filteredUsers} onRowClick={handleRowClick} />



      <Suspense fallback={<div>Cargando modal...</div>}>
        {deleteConfirmOpen && (
          <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}>
        <h2>Confirmar Eliminación</h2>
        <p>¿Estás seguro de que deseas eliminar este usuario?</p>
        <div className="user-management-table-actions">
          <ButtonPrimary type="danger" onClick={handleDeleteUser}>
            Confirmar
          </ButtonPrimary>
          <ButtonPrimary type="secondary" onClick={() => setDeleteConfirmOpen(false)}>
            Cancelar
          </ButtonPrimary>
        </div>
      </Modal>
        )}
        {detailsModalOpen && selectedUser && (
  <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)}>
    <h2>Detalles del Usuario</h2>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <img
        src={selectedUser.foto}
        alt={`${selectedUser.nombre} ${selectedUser.apellido}`}
        style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
      />
      <p><strong>Nombre:</strong> {selectedUser.nombre} {selectedUser.apellido}</p>
      <p><strong>CI:</strong> {selectedUser.ci}</p>
      <p><strong>Email:</strong> {selectedUser.email}</p>
      <p><strong>Profesión:</strong> {selectedUser.profesion}</p>
      <p><strong>Usuario:</strong> {selectedUser.usuario}</p>
      <p><strong>Roles:</strong> {(selectedUser.roles || []).map(r => r.nombre).join(", ")}</p>
<p><strong>Áreas:</strong> {(selectedUser.areas || []).map(a => a.nombre).join(", ")}</p>


    </div>
    <div style={{ marginTop: "1rem" }}>
      <ButtonPrimary type="secondary" onClick={() => setDetailsModalOpen(false)}>Cerrar</ButtonPrimary>
    </div>
  </Modal>
)}

      </Suspense>
    </div>
  );
};

export default UserManagement;

