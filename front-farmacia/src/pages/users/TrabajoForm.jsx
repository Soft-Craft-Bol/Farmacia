import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "./TrabajoForm.css"; // Asegúrate de actualizar este CSS
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";
import { getUsers, getAreaById, createTrabajo } from "../../service/api";
import InputText from "../../components/inputs/InputText";
import Select from "../../components/select/Select";

const TrabajoForm = () => {
  const [users, setUsers] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    getUsers()
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const validationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es obligatorio"),
    descripcion: Yup.string(),
    fechaInicio: Yup.date().required("La fecha de inicio es obligatoria"),
    encargadoId: Yup.string().required("El encargado es obligatorio"),
    area: Yup.string().required("El área es obligatoria"),
    imagen: Yup.mixed().required("La imagen es obligatoria").nullable(),
  });

  return (
    <div className="trabajo-form-container">
      <div className="form-header">
        <h2 className="form-title">Solicitar Nuevo Trabajo</h2>
        <p className="form-subtitle">Complete todos los campos requeridos</p>
      </div>
      
      <Formik
        initialValues={{
          nombre: "",
          descripcion: "",
          fechaInicio: new Date().toISOString().split("T")[0],
          area: "",
          encargadoId: "",
          imagen: null,
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          const formData = new FormData();
          formData.append("nombre", values.nombre);
          formData.append("descripcion", values.descripcion);
          formData.append("fechaInicio", values.fechaInicio);
          formData.append("area", values.area);
          formData.append("encargadoId", values.encargadoId);
          formData.append("imagen", values.imagen);

          createTrabajo(formData)
            .then(() => {
              alert("Trabajo solicitado exitosamente");
              resetForm();
              setAreas([]);
            })
            .catch((error) => {
              console.error("Error al solicitar el trabajo:", error);
              alert("Hubo un error al solicitar el trabajo");
            })
            .finally(() => setSubmitting(false));
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="trabajo-form">
            <div className="form-grid">
              {/* Columna izquierda */}
              <div className="form-column">
                <InputText 
                  label="Nombre" 
                  name="nombre" 
                  required 
                  placeholder="Ingrese el nombre del trabajo"
                />
                
                <InputText 
                  label="Fecha de Inicio" 
                  name="fechaInicio" 
                  type="date" 
                  required 
                />
                
                <Select
                  label="Encargado"
                  name="encargadoId"
                  required
                  onChange={(e) => {
                    const selectedUserId = e.target.value;
                    setFieldValue("encargadoId", selectedUserId);
                    setFieldValue("area", "");
                    if (selectedUserId) {
                      getAreaById(selectedUserId)
                        .then((res) => setAreas(res.data))
                        .catch((err) => {
                          console.error("Error al obtener áreas:", err);
                          setAreas([]);
                        });
                    } else {
                      setAreas([]);
                    }
                  }}
                >
                  <option value="">Seleccione un encargado</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nombre}
                    </option>
                  ))}
                </Select>
              </div>
              
              {/* Columna derecha */}
              <div className="form-column">
                <InputText 
                  label="Descripción" 
                  name="descripcion" 
                  type="text" 
                  placeholder="Describa el trabajo a realizar"
                  as="textarea"
                  rows={3}
                />
                
                <Select 
                  label="Área" 
                  name="area" 
                  required
                  disabled={!values.encargadoId}
                >
                  <option value="">Seleccione un área</option>
                  {areas.length > 0 ? (
                    areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))
                  ) : (
                    <option disabled>Seleccione un encargado primero</option>
                  )}
                </Select>
                
                <div className="file-upload-container">
                  <label className="file-upload-label">
                    <span>Subir Imagen</span>
                    <input
                      id="imagen"
                      name="imagen"
                      type="file"
                      className="file-upload-input"
                      onChange={(event) =>
                        setFieldValue("imagen", event.currentTarget.files[0])
                      }
                    />
                    <div className="file-upload-button">
                      {values.imagen ? values.imagen.name : "Seleccionar archivo"}
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <ButtonPrimary type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Solicitando..." : "Solicitar Trabajo"}
              </ButtonPrimary>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TrabajoForm;