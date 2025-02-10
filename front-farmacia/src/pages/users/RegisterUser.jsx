import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputText from '../../components/inputs/InputText';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoles, addUser, updateUser, getUserById } from '../../service/api';
import { FaCamera } from '../../hooks/icons';
import { Toaster, toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import './RegisterUser.css';
import Select from '../../components/select/Select';
import { ButtonPrimary } from '../../components/buttons/ButtonPrimary';

function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();

  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

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
    areaId: 1, // Asumiendo que el área por defecto es 1
    role: '', // Cambiado para aceptar un solo rol
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
      .when('editingUser', {
        is: false,
        then: Yup.string().required('Requerido'),
      }),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
      .when('editingUser', {
        is: false,
        then: Yup.string().required('Requerido'),
      }),
    ci: Yup.string().required('Requerido'),
    profesion: Yup.string().required('Requerido'),
    role: Yup.string().required('Requerido'), // Cambiado para ser un solo rol
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

    const fetchUser = async () => {
      try {
        const response = await getUserById(id);
        setEditingUser(response.data);
        setInitialValues({
          nombre: response.data.nombre || '',
          apellido: response.data.apellido || '',
          usuario: response.data.usuario || '',
          email: response.data.email || '',
          password: '',
          confirmPassword: '',
          ci: response.data.ci || '',
          profesion: response.data.profesion || '',
          foto: response.data.foto || null,
          areaId: response.data.areaId || 1,
          role: response.data.roleIds[0] || '', // Asumiendo que es un solo rol
        });

        if (response.data.foto) setPhotoPreview(response.data.foto);
      } catch (error) {
        notify('Error al obtener los datos del usuario.', 'error');
      }
    };

    fetchRoles();
    if (id) fetchUser();
  }, [id, notify]);

  const handleSubmit = useCallback(async (values, { resetForm }) => {
    const formData = new FormData();
    
    Object.keys(values).forEach((key) => {
      if (values[key] !== null) formData.append(key, values[key]);
    });
  
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
      notify('Error al procesar la solicitud.', 'error');
    }
  }, [editingUser, navigate, notify]);

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
                  <Select label="Roles" name="role" required>  
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.value} value={rol.value}>
                        {rol.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
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
