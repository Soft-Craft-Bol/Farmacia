import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { getEquipoById, createEquipo, updateEquipo } from '../../service/api';
import './EquipoForm.css';
import InputText from '../../components/inputs/InputText';
import Select from '../../components/select/Select';
import { ButtonPrimary } from '../../components/buttons/ButtonPrimary';

const EquipoForm = () => {
  const [initialValues, setInitialValues] = useState({
    etiquetaActivo: '',
    numeroSerie: '',
    modelo: '',
    estado: '',
    ubicacion: '',
    tipoMantenimiento: '',
    fechaCompra: '',
    proveedor: '',
    numeroOrden: '',
    fotoUrl: '',
  });
  const [file, setFile] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchEquipo = async () => {
        try {
          const { data } = await getEquipoById(id);
          setInitialValues({
            etiquetaActivo: data.etiquetaActivo,
            numeroSerie: data.numeroSerie,
            modelo: data.modelo,
            estado: data.estado,
            ubicacion: data.ubicacion,
            tipoMantenimiento: data.tipoMantenimiento,
            fechaCompra: data.fechaCompra,
            proveedor: data.proveedor,
            numeroOrden: data.numeroOrden,
            fotoUrl: data.fotoUrl,
          });
        } catch (error) {
          console.error("Error al obtener el equipo:", error);
        }
      };
      fetchEquipo();
    }
  }, [id]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('etiquetaActivo', values.etiquetaActivo);
    formData.append('numeroSerie', values.numeroSerie);
    formData.append('modelo', values.modelo);
    formData.append('estado', values.estado);
    formData.append('ubicacion', values.ubicacion);
    formData.append('tipoMantenimiento', values.tipoMantenimiento);
    formData.append('fechaCompra', values.fechaCompra);
    formData.append('proveedor', values.proveedor);
    formData.append('numeroOrden', values.numeroOrden);
    if (file) formData.append('foto', file);

    try {
      if (id) {
        await updateEquipo(id, formData);
        navigate('/equipos');
      } else {
        await createEquipo(formData);
        navigate('/equipos');
      }
    } catch (error) {
      console.error("Error al guardar el equipo:", error);
    }
  };

  const validationSchema = Yup.object({
    etiquetaActivo: Yup.string().required('Campo requerido'),
    numeroSerie: Yup.string().required('Campo requerido'),
    modelo: Yup.string().required('Campo requerido'),
    estado: Yup.string().required('Campo requerido'),
    ubicacion: Yup.string().required('Campo requerido'),
    tipoMantenimiento: Yup.string().required('Campo requerido'),
    fechaCompra: Yup.date().required('Campo requerido').nullable(),
    proveedor: Yup.string().required('Campo requerido'),
    numeroOrden: Yup.string().required('Campo requerido'),
  });

  return (
    <div className="equipo-form-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="equipo-form">
          <h2>{id ? 'Editar Equipo' : 'Registrar Equipo'}</h2>

          <InputText label="Etiqueta del Activo" name="etiquetaActivo" required />
          <InputText label="Número de Serie" name="numeroSerie" required />
          <InputText label="Modelo" name="modelo" required />
          <Select label="Estado" name="estado" required>
            <option value="">Selecciona un estado</option>
            <option value="En uso">En uso</option>
            <option value="Fuera de servicio">Fuera de servicio</option>
            <option value="En reparación">En reparación</option>
          </Select>
          <InputText label="Ubicación" name="ubicacion" required />
          <Select label="Tipo de Mantenimiento" name="tipoMantenimiento" required>
            <option value="">Selecciona un tipo</option>
            <option value="Preventivo">Preventivo</option>
            <option value="Correctivo">Correctivo</option>
          </Select>
          <InputText
            label="Fecha de Compra"
            name="fechaCompra"
            type="date"
            required
          />
          <InputText label="Proveedor" name="proveedor" required />
          <InputText label="Número de Orden" name="numeroOrden" required />

          <div className="file-upload">
            <label>Imagen del Equipo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {file && <img src={URL.createObjectURL(file)} alt="Vista previa" />}
            {initialValues.fotoUrl && !file && (
              <img src={initialValues.fotoUrl} alt="Imagen actual" />
            )}
          </div>

          <ButtonPrimary type="submit" variant="primary">
            {id ? 'Actualizar' : 'Registrar'}
          </ButtonPrimary>
        </Form>
      </Formik>
    </div>
  );
};

export default EquipoForm;
