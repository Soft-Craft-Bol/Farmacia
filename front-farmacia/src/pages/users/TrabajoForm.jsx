import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrabajo, getUsers, addUsersToTrabajo } from '../../service/api';
import { Toaster, toast } from 'sonner';
import './TrabajoForm.css';

const TrabajoForm = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [trabajoCreado, setTrabajoCreado] = useState(false);
  const [trabajoId, setTrabajoId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await createTrabajo({ nombre, descripcion });
//       console.log('Respuesta del backend:', response); // Depuración

//       if (response && response.data && response.data.id) {
//         toast.success('Trabajo creado con éxito');
//         setTrabajoCreado(true);
//         setTrabajoId(response.data.id);
//         console.log('ID del trabajo creado:', response.data.id); // Depuración
//         fetchUsers();
//       } else {
//         throw new Error('El ID del trabajo no fue retornado correctamente');
//       }
//     } catch (error) {
//       console.error('Error al crear el trabajo:', error); // Depuración
//       toast.error('Error al crear el trabajo');
//     }
//   };

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createTrabajo({ nombre, descripcion });
  
      console.log("Respuesta del backend:", response); // 🔍 Verifica la respuesta completa
  
      // Asegurar que response.data existe
      if (!response || !response.data) {
        throw new Error("La API no retornó datos válidos.");
      }
  
      console.log("Contenido de response.data:", response.data); // 🔍 Verifica los datos dentro de 'data'
  
      const trabajoIdRecibido = response.data.data.id;
  
      if (!trabajoIdRecibido) {
        throw new Error("El ID del trabajo no fue retornado correctamente");
      }
  
      setTrabajoId(trabajoIdRecibido);
      console.log("ID del trabajo asignado:", trabajoIdRecibido);
  
      toast.success("Trabajo creado con éxito");
      setTrabajoCreado(true);
      fetchUsers();
  
    } catch (error) {
      console.error("Error al crear el trabajo:", error);
      toast.error("Error al crear el trabajo");
    }
  };
  
  
  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Error al obtener los usuarios');
    }
  };

  const handleCheckboxChange = (userId, role) => {
    setSelectedUsers((prev) => {
      const userExists = prev.find((u) => u.userId === userId);
      if (userExists) {
        return prev.map((u) =>
          u.userId === userId ? { ...u, [role]: !u[role] } : u
        );
      } else {
        return [...prev, { userId, [role]: true }];
      }
    });
  };

  const handleAddUsers = async (e) => {
    e.preventDefault();
    console.log('ID del trabajo:', trabajoId); // Depuración
    console.log('Usuarios seleccionados:', selectedUsers); // Depuración

    if (!trabajoId) {
      toast.error('Error: ID del trabajo no definido');
      return;
    }

    try {
      await addUsersToTrabajo(trabajoId, selectedUsers);
      toast.success('Usuarios agregados al trabajo correctamente');
      navigate('/trabajos');
    } catch (error) {
      toast.error('Error al agregar usuarios al trabajo');
    }
  };

  return (
    <div className="trabajo-form-container">
      <Toaster duration={2000} position="bottom-right" />
      <h2>Crear Trabajo</h2>
      {!trabajoCreado ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </div>
          <button type="submit">Crear Trabajo</button>
        </form>
      ) : (
        <div className="add-users-container">
          <h3>Agregar Usuarios al Trabajo</h3>
          <form onSubmit={handleAddUsers}>
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
      )}
    </div>
  );
};

export default TrabajoForm;