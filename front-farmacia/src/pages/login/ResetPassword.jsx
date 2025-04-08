import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { requestPasswordReset } from "../../service/api";
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";
import ImagenesApp from "../../assets/ImagenesApp";
import InputText from "../../components/inputs/InputText"; // ✅ Importamos el componente
import "./ResetPassword.css";

const initialValues = {
  email: "",
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Correo electrónico inválido")
    .required("El correo electrónico es requerido"),
});

function ResetPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await requestPasswordReset(values.email);
      if (response.success) {
        setMessage("Se ha enviado un enlace de recuperación a tu correo electrónico");
        setError("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al solicitar recuperación de contraseña");
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-form">
        <h2>Recuperar contraseña</h2>
        <img className="logo-fesa" src={ImagenesApp.logo} alt="Logo" height="80px" />

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <InputText
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                required
              />

              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <ButtonPrimary type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar enlace"}
              </ButtonPrimary>

              <div className="back-to-login">
                <button type="button" onClick={() => navigate("/")} className="btn-link">
                  Volver al inicio de sesión
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default ResetPassword;
