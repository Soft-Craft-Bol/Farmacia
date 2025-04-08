import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputText from '../../components/inputs/InputText';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoles, addUser, updateUser, getUserById, getAreas } from '../../service/api';
import { FaCamera } from '../../hooks/icons';
import { Toaster, toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import './RegisterUser.css';
import Select from '../../components/select/Select';
import { ButtonPrimary } from '../../components/buttons/ButtonPrimary';
import { FaCirclePlus } from "react-icons/fa6";
import LinkButton from '../../components/buttons/LinkButton';
import { IoCloseOutline } from "react-icons/io5";

function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();

  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);

  const [initialValues, setInitialValues] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    email: '',
    password: '',
    confirmPassword: '',
    ci: '',
    profesion: '',
    foto: null,
  });

  const notify = useCallback((message, type = 'success') => {
    type === 'success' ? toast.success(message) : toast.error(message);
  }, []);

  const validationSchema = useMemo(() => Yup.object({
    nombre: Yup.string().required('Requerido'),
    apellido: Yup.string().required('Requerido'),
    usuario: Yup.string().required('Requerido'),
    email: Yup.string().email('Correo inválido').required('Requerido'),
    password: Yup.string()
      .min(6, 'Mínimo 6 caracteres')
      .when('editingUser', (editingUser, schema) => {
        return editingUser ? schema : schema.required('Requerido');
      }),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
      .when('editingUser', (editingUser, schema) => {
        return editingUser ? schema : schema.required('Requerido');
      }),
    ci: Yup.string().required('Requerido'),
    profesion: Yup.string().required('Requerido'),
    foto: Yup.mixed().nullable(),
  }), []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data.map((rol) => ({
          value: rol.id,
          label: rol.nombre,
        })));
      } catch (error) {
        notify('Error al obtener los roles.', 'error');
      }
    };

    const fetchAreas = async () => {
      try {
        const response = await getAreas();
        setAreas(response.data.map((area) => ({
          value: area.id,
          label: area.nombre,
        })));
      } catch (error) {
        notify('Error al obtener las áreas.', 'error');
      }
    };

    const fetchUser = async () => {
      try {
        const response = await getUserById(id);
        console.log(response.data);
        const userData = response.data;
        
        setEditingUser(userData);
        setInitialValues({
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          usuario: userData.usuario || '',
          email: userData.email || '',
          password: '',
          confirmPassword: '',
          ci: userData.ci || '',
          profesion: userData.profesion || '',
          foto: userData.foto || null,
        });
  
        // Set selected roles from user data
        if (userData.roles) {
          setSelectedRoles(userData.roles.map(role => role.id)); // Use role.id to set selected roles
        }
  
        // Set selected areas from user data
        if (userData.areas) {
          setSelectedAreas(userData.areas.map(area => area.id)); // Use area.id to set selected areas
        }
  
        if (userData.foto) {
          const baseUrl = 'http://localhost:5000/'; // or your production domain
          const imageUrl = userData.foto.startsWith('http') ? userData.foto : `${baseUrl}${userData.foto}`;
          setPhotoPreview(imageUrl);
        }
        
      } catch (error) {
        notify('Error al obtener los datos del usuario.', 'error');
        console.error("Error al obtener usuario:", error);
      }
    };
  

    fetchRoles();
    fetchAreas();
    if (id) fetchUser();
  }, [id, notify]);

  const handleSubmit = useCallback(async (values, { resetForm }) => {
    const formData = new FormData();
    
    // Agregar campos básicos
    Object.keys(values).forEach(key => {
        if (key !== 'foto' && values[key] !== null && values[key] !== undefined) {
            formData.append(key, values[key]);
        }
    });

    // Agregar roles y áreas
    selectedRoles.forEach(roleId => formData.append('roles[]', roleId));
    selectedAreas.forEach(areaId => formData.append('areas[]', areaId));

    // Agregar foto si es un archivo nuevo
    if (values.foto instanceof File) {
        formData.append('foto', values.foto);
    }

    try {
        if (editingUser) {
            await updateUser(editingUser.id, formData);  
            notify('Usuario actualizado exitosamente.');
        } else {
            await addUser(formData);  
            notify('Usuario agregado exitosamente.');
        }
        resetForm();
        navigate('/userManagement');
    } catch (error) {
        console.error("Error al procesar:", error);
        notify(error.response?.data?.message || 'Error al procesar la solicitud.', 'error');
    }
}, [editingUser, navigate, notify, selectedRoles, selectedAreas]);

  const handlePhotoChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    setFieldValue('foto', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId) 
        : [...prev, roleId]
    );
  };

  const toggleArea = (areaId) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId) 
        : [...prev, areaId]
    );
  };

  const [camposExtras, setCamposExtras] = useState([]);
  const [nuevoCampo, setNuevoCampo] = useState("");

  const agregarCampo = () => {
    if (nuevoCampo.trim() !== "") {
      setCamposExtras([...camposExtras, nuevoCampo]);
      setNuevoCampo("");
    }
  };

  return (
    <div className={`user-form-container ${theme}`}>
      <Toaster duration={2000} position="bottom-right" />
      <h2>{editingUser ? 'Editar Usuario' : 'Registrar Usuario'}</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ setFieldValue }) => (
          <Form className="form">
            <div className="form-grid">
              <div className="photo-upload-container">
                <div className="photo-preview">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile Preview" />
                  ) : (
                    <FaCamera className="camera-icon" />
                  )}
                </div>
                <label htmlFor="foto" className="photo-label">
                  {photoPreview ? 'Editar Foto' : 'Foto de perfil'}
                </label>
                <input
                  id="foto"
                  name="foto"
                  type="file"
                  accept="image/*"
                  onChange={(event) => handlePhotoChange(event, setFieldValue)}
                />
              </div>
              <div className="form-columns">
                <div className="form-column">
                  <InputText label="Nombre" name="nombre" required />
                  <InputText label="Apellido" name="apellido" required />
                  <InputText label="Usuario" name="usuario" required />
                  <InputText label="Cédula de Identidad" name="ci" required />
                  
                  {/* Selector de Roles */}
                  <div className="multi-select-container">
                    <label>Roles:</label>
                    <select onChange={(e) => toggleRole(parseInt(e.target.value))}>
                      <option value="">Seleccione un rol</option>
                      {roles.map((rol) => (
                        <option key={rol.value} value={rol.value}>
                          {rol.label}
                        </option>
                      ))}
                    </select>
                    <div className="selected-items-container">
                      <h4>Roles seleccionados:</h4>
                      {selectedRoles.length === 0 ? (
                        <p>No has seleccionado roles aún.</p>
                      ) : (
                        selectedRoles.map((roleId) => {
                          const role = roles.find(r => r.value === roleId);
                          return (
                            <span 
                              key={roleId} 
                              className="selected-item"
                              onClick={() => toggleRole(roleId)}
                            >
                              {role?.label || roleId}
                              <IoCloseOutline size={16} color="red" />
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-column">
                  <InputText
                    label="Contraseña"
                    name="password"
                    type="password"
                    required={!editingUser}
                  />
                  <InputText
                    label="Confirmar Contraseña"
                    name="confirmPassword"
                    type="password"
                    required={!editingUser}
                  />
                  <InputText label="Correo Electrónico" name="email" required />
                  <InputText label="Profesión" name="profesion" required />
                  
                  {/* Selector de Áreas */}
                  <div className="multi-select-container">
                    <label>Áreas:</label>
                    <select onChange={(e) => toggleArea(parseInt(e.target.value))}>
                      <option value="">Seleccione un área</option>
                      {areas.map((area) => (
                        <option key={area.value} value={area.value}>
                          {area.label}
                        </option>
                      ))}
                    </select>
                    <div className="selected-items-container">
                      <h4>Áreas seleccionadas:</h4>
                      {selectedAreas.length === 0 ? (
                        <p>No has seleccionado áreas aún.</p>
                      ) : (
                        selectedAreas.map((areaId) => {
                          const area = areas.find(a => a.value === areaId);
                          return (
                            <span 
                              key={areaId} 
                              className="selected-item"
                              onClick={() => toggleArea(areaId)}
                            >
                              {area?.label || areaId}
                              <IoCloseOutline size={16} color="red" />
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                  
                  <div className="buttons-container">
                    <LinkButton to="/roles" variant="secondary">Gestionar Roles</LinkButton>
                  </div>
                </div>
              </div>
              <div className="agregar-info-container">
                <input
                  type="text"
                  value={nuevoCampo}
                  onChange={(e) => setNuevoCampo(e.target.value)}
                  placeholder="Escribe información adicional..."
                  className="input-info"
                />
                <button type="button" className="open-modal-btn" onClick={agregarCampo}>
                  <FaCirclePlus className="icon-plus" />
                </button>
              </div>

              <ul className="component-list">
                {camposExtras.map((info, index) => (
                  <li key={index} className="component-item">
                    {info}
                  </li>
                ))}
              </ul>
            </div>
            <ButtonPrimary
              variant="primary"
              type="submit"
              style={{ marginTop: '20px', alignSelf: 'center' }}
            >
              {editingUser ? 'Actualizar' : 'Registrar'}
            </ButtonPrimary>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default UserForm;