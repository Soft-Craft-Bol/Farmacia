import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "./TrabajoForm.css";
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";
import { getUsers, getAreaById, createTrabajo } from "../../service/api";
import InputText from "../../components/inputs/InputText";
import Select from "../../components/select/Select";

const TrabajoForm = () => {
  const [users, setUsers] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    // Obtener los usuarios
    getUsers()
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));

    // Obtener las áreas asociadas al usuario actual
    const userId = 1; // Suponiendo que tienes el id del usuario
    getAreaById(userId)
      .then((response) => setAreas(response.data))  // Asignar todas las áreas
      .catch((error) => console.error("Error fetching areas:", error));
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
      <h2 className="form-title">Solicitar Nuevo Trabajo</h2>
      <Formik
        initialValues={{
          nombre: "",
          descripcion: "",
          fechaInicio: new Date().toISOString().split("T")[0], // Fecha actual
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
            })
            .catch((error) => {
              console.error("Error al solicitar el trabajo:", error);
              alert("Hubo un error al solicitar el trabajo");
            })
            .finally(() => setSubmitting(false));
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="trabajo-form">
            <InputText label="Nombre" name="nombre" required />
            <InputText label="Descripción" name="descripcion" type="text" />
            <InputText label="Fecha de Inicio" name="fechaInicio" type="date" required />
            
            <Select label="Encargado" name="encargadoId" required>
              <option value="">Seleccione un encargado</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre}
                </option>
              ))}
            </Select>

            <Select label="Área" name="area" required>
              <option value="">Seleccione un área</option>
              {areas.length > 0 ? (
                areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))
              ) : (
                <option>Cargando áreas...</option>
              )}
            </Select>

            <div className="file-upload">
              <label htmlFor="imagen">Subir Imagen</label>
              <input
                id="imagen"
                name="imagen"
                type="file"
                onChange={(event) => setFieldValue("imagen", event.currentTarget.files[0])}
              />
            </div>
            <ButtonPrimary type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Solicitando..." : "Solicitar Trabajo"}
            </ButtonPrimary>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TrabajoForm;
