import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "./TrabajoForm.css";
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";
import { createTrabajo, getEquiposByUserId } from "../../service/api";
import InputText from "../../components/inputs/InputText";
import Select from "../../components/select/Select";
import { getUser } from "../login/authFuntions";

const TrabajoForm = () => {
  const [equipos, setEquipos] = useState([]);
  const [areaEquipo, setAreaEquipo] = useState("");
  const user = getUser();

  useEffect(() => {
    const fetchUserEquipos = async () => {
      try {
        const response = await getEquiposByUserId(user.idUser);
        setEquipos(response.data.equipos || []); // Asegúrate de acceder a response.data.equipos
      } catch (error) {
        console.error("Error fetching equipos:", error);
      }
    };
    fetchUserEquipos();
  }, [user.idUser]);

  const validationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es obligatorio"),
    descripcion: Yup.string(),
    fechaInicio: Yup.date().required("La fecha de inicio es obligatoria"),
    equipoId: Yup.string().required("El equipo es obligatorio"),
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
          equipoId: "",
          imagen: null,
          tipoEquipo: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          const formData = new FormData();
          formData.append("nombre", values.nombre);
          formData.append("descripcion", values.descripcion);
          formData.append("fechaInicio", values.fechaInicio);
          formData.append("equipoId", values.equipoId);
          formData.append("area", areaEquipo); // Enviamos el área del equipo
          formData.append("encargadoId", user.idUser); // Enviamos automáticamente el ID del usuario
          formData.append("imagen", values.imagen);
          formData.append("tipoEquipo", values.tipoEquipo);

          createTrabajo(formData)
            .then(() => {
              alert("Trabajo solicitado exitosamente");
              resetForm();
              setAreaEquipo("");
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
                  label="Equipo"
                  name="equipoId"
                  required
                  onChange={(e) => {
                    const equipoId = e.target.value;
                    setFieldValue("equipoId", equipoId);
                    
                    // Buscamos el equipo seleccionado para obtener su área (ubicación)
                    const equipoSeleccionado = equipos.find(e => e.id.toString() === equipoId);
                    setAreaEquipo(equipoSeleccionado?.ubicacion || "");
                  }}
                >
                  <option value="">Seleccione un equipo</option>
                  {equipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.etiquetaActivo}
                    </option>
                  ))}
                </Select>
              </div>
              
              {/* Columna derecha */}
              <div className="form-column">
              <Select
                  label="Tipo de Equipo"
                  name="tipoEquipo"
                  required
                  onChange={(e) => {
                    const tipo = e.target.value;
                    setFieldValue("tipoEquipo", tipo);
                  }}
                  >
                  <option value="">Seleccione un tipo de equipo</option>
                  <option value="Informatico">Informatico</option>
                  <option value="Biomedico">Biomedico</option>
                  </Select>

                <InputText 
                  label="Descripción" 
                  name="descripcion" 
                  type="text" 
                  placeholder="Describa el trabajo a realizar"
                  as="textarea"
                  rows={3}
                />
                
                {/* Mostramos el área del equipo seleccionado */}
                <div className="equipo-area-info">
                  <label>Área del equipo:</label>
                  <div className="area-value">
                    {areaEquipo || "Seleccione un equipo para ver su área"}
                  </div>
                </div>
                
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