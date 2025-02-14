import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUsers, addUsersToTrabajo } from '../../service/api';
import { Toaster, toast } from 'sonner';
import './TrabajoAddUsers.css';

const TrabajoAddUsers = () => {
  const { trabajoId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response.data);
      } catch (error) {
        toast.error('Error al obtener los usuarios');
      }
    };

    fetchUsers();
  }, []);

  const handleCheckboxChange = (userId, role) => {
    setSelectedUsers((prev) => {
      const userExists = prev.find((u) => u.userId === userId);
      if (userExists) {
        // Si el usuario ya está seleccionado, actualiza su rol
        return prev.map((u) =>
          u.userId === userId ? { ...u, [role]: !u[role] } : u
        );
      } else {
        // Si el usuario no está seleccionado, agrégalo con el rol
        return [...prev, { userId, [role]: true }];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addUsersToTrabajo(trabajoId, selectedUsers);
      toast.success('Usuarios agregados al trabajo correctamente');
      navigate(`/trabajos/${trabajoId}/users`); // Redirigir a la lista de usuarios del trabajo
    } catch (error) {
      toast.error('Error al agregar usuarios al trabajo');
    }
  };

  return (
    <div className="trabajo-add-users-container">
      <Toaster duration={2000} position="bottom-right" />
      <h2>Agregar Usuarios al Trabajo</h2>
      <form onSubmit={handleSubmit}>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <label>
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleCheckboxChange(user.id, 'isAdmin', e.target.checked)
                  }
                />
                {user.nombre} ({user.email}) - Admin
              </label>
              <label>
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleCheckboxChange(user.id, 'isJefe', e.target.checked)
                  }
                />
                Jefe de Trabajo
              </label>
            </li>
          ))}
        </ul>
        <button type="submit">Agregar Usuarios</button>
      </form>
    </div>
  );
};

export default TrabajoAddUsers;