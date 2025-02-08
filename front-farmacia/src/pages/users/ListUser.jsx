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

// Carga perezosa del componente Modal para mejorar el rendimiento
const Modal = lazy(() => import("../../components/modal/Modal"));

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [filterValues, setFilterValues] = useState({});
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
              src={row.photo || "ruta/de/foto/por/defecto.jpg"}
              alt={`${row.name} ${row.last_name}`}
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
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

  return (
    <div className="user-management-container">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      <div className="user-management-header">
        <h2 className="user-management-title">Gestión de Usuarios</h2>
         <LinkButton to={`/registerUser`}>Agregar Usuario</LinkButton>
      </div>

      <Table columns={columns} data={users} className="user-management-table" />

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
      </Suspense>
    </div>
  );
};

export default UserManagement;

