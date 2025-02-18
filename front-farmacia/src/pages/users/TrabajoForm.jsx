import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "./TrabajoForm.css";
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";
import { getUsers, createTrabajo } from "../../service/api";
import InputText from "../../components/inputs/InputText";
import Select from "../../components/select/Select";

const TrabajoForm = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers()
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const validationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es obligatorio"),
    descripcion: Yup.string(),
    fechaInicio: Yup.date().required("La fecha de inicio es obligatoria"),
    fechaFin: Yup.date().nullable(),
    encargadoId: Yup.string().required("El encargado es obligatorio"),
  });

  return (
    <div className="trabajo-form-container">
      <h2 className="form-title">Registrar Nuevo Trabajo</h2>
      <Formik
        initialValues={{
          nombre: "",
          descripcion: "",
          fechaInicio: "",
          fechaFin: "",
          encargadoId: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          createTrabajo(values)
            .then(() => {
              alert("Trabajo registrado exitosamente");
              resetForm();
            })
            .catch((error) => {
              console.error("Error al registrar el trabajo:", error);
              alert("Hubo un error al registrar el trabajo");
            })
            .finally(() => setSubmitting(false));
        }}
      >
        {({ isSubmitting }) => (
          <Form className="trabajo-form">
            <InputText label="Nombre" name="nombre" required />
            <InputText label="Descripción" name="descripcion" type="area" />
            <InputText label="Fecha de Inicio" name="fechaInicio" type="date" required />
            <InputText label="Fecha de Fin" name="fechaFin" type="date" />
            <Select label = "Area" name = "area" required>
              <option>Seleccione una area</option>
              <option>Biomedica</option>
              <option>Informatica</option>
            </Select>
            <Select label="Encargado" name="encargadoId" required>
              <option value="">Seleccione un encargado</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre}
                </option>
              ))}
            </Select>
            <ButtonPrimary type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Trabajo"}
            </ButtonPrimary>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TrabajoForm;
