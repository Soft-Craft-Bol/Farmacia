import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { resetPassword } from "../../service/api";
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";
import ImagenesApp from "../../assets/ImagenesApp";
import InputText from "../../components/inputs/InputText"; // ✅ Importa tu componente
import "./NewPassword.css";

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("La contraseña es requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Las contraseñas deben coincidir")
    .required("Confirma tu contraseña"),
});

function NewPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await resetPassword(token, values.password);
      if (response.success) {
        setMessage("Contraseña actualizada correctamente");
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar la contraseña");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="new-password-container">
      <div className="new-password-form">
        <h2>Establecer nueva contraseña</h2>
        <img className="logo-fesa" src={ImagenesApp.logo} alt="Logo" height="80px" />

        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputText
                label="Nueva contraseña"
                name="password"
                type="password"
                placeholder="Ingresa tu nueva contraseña"
                required
              />

              <InputText
                label="Confirmar contraseña"
                name="confirmPassword"
                type="password"
                placeholder="Confirma tu nueva contraseña"
                required
              />

              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <ButtonPrimary type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
              </ButtonPrimary>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default NewPassword;
