import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputText from "../../components/inputs/InputText";
import './formTeam.css';
import { ButtonPrimary } from "../../components/buttons/ButtonPrimary";

const FormTeam = () => {
  return (
    <Formik
      initialValues={{ activo: "", serie: "", modelo: "", ubicacion: "",proveedor:"" }}
      validationSchema={Yup.object({
        serie: Yup.string()
          .matches(/^[A-Za-z0-9-]+$/, "Número de serie inválido")
          .required("El número de serie es obligatorio"),
        ubicacion: Yup.string().required("El nombre del ubicacion es obligatorio"),
        activo: Yup.string().required("El activo es requerido"),
        modelo: Yup.string().required("El modelo es obligatorio"),
        proveedor: Yup.string().required("Proveedor requerido"),
      })}
      onSubmit={(values) => {
        console.log("Datos del Equipo:", values);
        alert("equipo registrado correctamente");
      }}
    >
      {({ handleSubmit }) => (
        <Form onSubmit={handleSubmit} className="team-form">
          <h2>Registrar Equipo</h2>
          <InputText 
            label="Etiqueta del activo:" 
            name="activo" 
            type="text" 
            placeholder="Ingrese el número de etiqueta"
            required 
          />
          <InputText 
            label="Número de Serie:" 
            name="serie" 
            type="text" 
            placeholder="Ingrese número de serie"
            required 
          />
            <InputText 
            label="Modelo:" 
            name="modelo" 
            type="text" 
            placeholder="Ingrese el modelo"
            required 
        />
          <InputText 
            label="Ubicación:" 
            name="ubicacion" 
            type="text" 
            placeholder="Ingrese la ubicación"
            required 
          />

            <InputText 
            label="Proveedor:" 
            name="proveedor" 
            type="text" 
            placeholder="Ingrese el proveedor"
            required 
          />
          
          <ButtonPrimary type="submit" variant="primary">
            Registrar Equipo
          </ButtonPrimary>
        </Form>
      )}
    </Formik>
  );
};

export default FormTeam;
