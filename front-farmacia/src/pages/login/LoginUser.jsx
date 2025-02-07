import React, { useState, useCallback, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import './LoginUser.css';
import { loginUser } from '../../service/api';
import { saveToken, saveUser } from './authFuntions';
import ImagenesApp from '../../assets/ImagenesApp';
import { ButtonPrimary } from '../../components/buttons/ButtonPrimary';

const InputText = lazy(() => import('../../components/inputs/InputText'));

const initialValues = {
  email: '',
  password: '',
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Correo electrónico inválido')
    .required('El correo electrónico es requerido'),
  password: Yup.string().required('La contraseña es requerida'),
});

function LoginUser() {
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (values, { setSubmitting }) => {
    setLoginError(''); // Limpiar errores previos
    try {
      const result = await loginUser(values);
console.log(result);
      if (result && result.data && result.data.access_token) {
        saveToken(result.data.access_token);

        const user = {
          username: result.data.username || '',
          roles: result.data.roles || [],
          photo: result.data.photo || '',
          full_name: result.data.full_name || '',
        };

        saveUser(user);
        navigate('/home');
      } else {
        setLoginError('Credenciales incorrectas. Por favor, intente de nuevo.');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setLoginError('Error en el servidor. Intente más tarde.');
    } finally {
      setSubmitting(false);
    }
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Inicia sesión</h2>
        <img className="logo-fesa" src={ImagenesApp.logo} alt="Logo" height="80px" />

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Suspense fallback={<div>Cargando campo...</div>}>
                <InputText label="Correo electrónico" name="email" type="text" required />
                <InputText label="Contraseña" name="password" type="password" required />
              </Suspense>

              {loginError && <span className="error-message">{loginError}</span>}

              <Link to="/reset">¿Olvidaste la contraseña?</Link>
              <ButtonPrimary type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </ButtonPrimary>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default React.memo(LoginUser);
