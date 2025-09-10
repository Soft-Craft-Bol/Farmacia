import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { getEquipoById, createEquipo, updateEquipo, getAreas, getUsers } from '../../service/api';
import './EquipoForm.css';
import InputText from '../../components/inputs/InputText';
import Select from '../../components/select/Select';
import { ButtonPrimary } from '../../components/buttons/ButtonPrimary';
import { FaCircle, FaTimes, FaFileAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

// Esquema de validación para componentes
const componenteValidationSchema = Yup.object({
  etiquetaActivo: Yup.string().required('Campo requerido'),
  numeroSerie: Yup.string().required('Campo requerido'),
  modelo: Yup.string().required('Campo requerido'),
  estado: Yup.string().required('Campo requerido'),
  ubicacion: Yup.string().required('Campo requerido'),
  tipoMantenimiento: Yup.string().required('Campo requerido'),
  fechaCompra: Yup.date().required('Campo requerido').nullable(),
  fechaInicio: Yup.date().required('Campo requerido').nullable(),
  proveedor: Yup.string().required('Campo requerido'),
  numeroOrden: Yup.string().required('Campo requerido'),
  usuarioId: Yup.string().required('Selecciona un usuario'),
  periodoMantenimiento: Yup.number()
    .required('Campo requerido')
    .min(30, 'Mínimo 30 días')
    .max(365, 'Máximo 1 año'),
  tipoEquipo: Yup.string().required('Campo requerido'),
});

const EquipoForm = () => {
  const [initialValues, setInitialValues] = useState({
    etiquetaActivo: '',
    numeroSerie: '',
    modelo: '',
    estado: '',
    ubicacion: '',
    tipoMantenimiento: '',
    fechaCompra: '',
    fechaInicio: '',
    proveedor: '',
    numeroOrden: '',
    usuarioId: '',
    periodoMantenimiento: 180,
    tipoEquipo: '',
  });

  // Estado inicial para un componente
  const initialComponenteValues = {
    etiquetaActivo: '',
    numeroSerie: '',
    modelo: '',
    estado: '',
    ubicacion: '',
    tipoMantenimiento: '',
    fechaCompra: '',
    fechaInicio: '',
    proveedor: '',
    numeroOrden: '',
    usuarioId: '',
    periodoMantenimiento: 180,
    tipoEquipo: '',
    // Campos adicionales para relación con equipo padre
    esComponente: true,
    equipoPadreId: null
  };

  const [componenteValues, setComponenteValues] = useState(initialComponenteValues);
  const [componentes, setComponentes] = useState([]);
  const [componenteEditando, setComponenteEditando] = useState(null);
  const [files, setFiles] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const { data } = await getAreas();
        setAreas(data);
      } catch (error) {
        console.error("Error al obtener áreas:", error);
      }
    };

    fetchAreas();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchEquipo = async () => {
        try {
          const { data } = await getEquipoById(id);
          setInitialValues({
            etiquetaActivo: data.etiquetaActivo || '',
            numeroSerie: data.numeroSerie || '',
            modelo: data.modelo || '',
            estado: data.estado || '',
            ubicacion: data.ubicacion || '',
            tipoMantenimiento: data.tipoMantenimiento || '',
            fechaCompra: formatDate(data.fechaCompra),
            fechaInicio: formatDate(data.fechaInicio),
            proveedor: data.proveedor || '',
            numeroOrden: data.numeroOrden || '',
            usuarioId: data.usuarioId || '',
            periodoMantenimiento: data.periodoMantenimiento || 180,
            tipoEquipo: data.tipoEquipo || '',
          });

          if (data.imagenes && data.imagenes.length > 0) {
            setFiles(data.imagenes.map(img => ({
              file: null,
              url: img.url,
              isExisting: true
            })));
          }

          if (data.documentos && data.documentos.length > 0) {
            setDocumentFiles(data.documentos.map(doc => ({
              file: null,
              name: doc.filename,
              type: doc.type,
              isExisting: true
            })));
          }

          if (data.componentes) {
            setComponentes(data.componentes);
          }
        } catch (error) {
          console.error("Error al obtener el equipo:", error);
        }
      };
      fetchEquipo();
    }
  }, [id]);

  // Abrir modal para agregar/editar componente
  const abrirModalComponente = (componente = null) => {
    if (componente) {
      setComponenteEditando(componente.id || componente.tempId);
      setComponenteValues({
        ...componente,
        fechaCompra: formatDate(componente.fechaCompra),
        fechaInicio: formatDate(componente.fechaInicio),
        equipoPadreId: id || null
      });
    } else {
      setComponenteEditando(null);
      setComponenteValues({
        ...initialComponenteValues,
        equipoPadreId: id || null
      });
    }
    setModalAbierto(true);
  };

  // Guardar componente
  const guardarComponente = (valores) => {
    if (componenteEditando) {
      // Editar componente existente
      setComponentes(componentes.map(comp => 
        (comp.id === componenteEditando || comp.tempId === componenteEditando) 
          ? { ...valores, id: comp.id, tempId: comp.tempId } 
          : comp
      ));
    } else {
      // Agregar nuevo componente con ID temporal
      setComponentes([...componentes, { ...valores, tempId: Date.now() }]);
    }
    setModalAbierto(false);
  };

  // Eliminar componente
  const eliminarComponente = (index) => {
    setComponentes(componentes.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter(file => file.type.match('image.*'));

    const newFiles = [...files, ...imageFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false
    }))].slice(0, 4);
    setFiles(newFiles);
  };

  const handleDocumentChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const docFiles = selectedFiles.filter(file =>
      allowedTypes.some(type => file.type.includes(type))
    );

    const newDocs = [...documentFiles, ...docFiles.map(file => ({
      file,
      name: file.name,
      type: file.type,
      isExisting: false
    }))].slice(0, 4);
    setDocumentFiles(newDocs);
  };

  const removeImage = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const removeDocument = (index) => {
    const newDocs = documentFiles.filter((_, i) => i !== index);
    setDocumentFiles(newDocs);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();

    // Campos del formulario
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Componentes
    formData.append('componentes', JSON.stringify(componentes));

    // Imágenes
    files.forEach((fileObj) => {
      if (!fileObj.isExisting && fileObj.file) {
        formData.append(`imagenes`, fileObj.file);
      }
    });
    formData.append('existingImages', JSON.stringify(
      files.filter(f => f.isExisting)
    ));

    // Documentos
    documentFiles.forEach((docObj) => {
      if (!docObj.isExisting && docObj.file) {
        formData.append(`documentos`, docObj.file);
      }
    });
    formData.append('existingDocuments', JSON.stringify(
      documentFiles.filter(d => d.isExisting)
    ));

    try {
      if (id) {
        await updateEquipo(id, formData);
      } else {
        await createEquipo(formData);
      }
      navigate('/equipos');
    } catch (error) {
      console.error("Error al guardar el equipo:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const validationSchema = Yup.object({
    etiquetaActivo: Yup.string().required('Campo requerido'),
    numeroSerie: Yup.string().required('Campo requerido'),
    modelo: Yup.string().required('Campo requerido'),
    estado: Yup.string().required('Campo requerido'),
    ubicacion: Yup.string().required('Campo requerido'),
    tipoMantenimiento: Yup.string().required('Campo requerido'),
    fechaCompra: Yup.date().required('Campo requerido').nullable(),
    fechaInicio: Yup.date().required('Campo requerido').nullable(),
    proveedor: Yup.string().required('Campo requerido'),
    numeroOrden: Yup.string().required('Campo requerido'),
    usuarioId: Yup.string().required('Selecciona un usuario'),
    periodoMantenimiento: Yup.number()
      .required('Campo requerido')
      .min(30, 'Mínimo 30 días')
      .max(365, 'Máximo 1 año'),
    tipoEquipo: Yup.string().required('Campo requerido'),
  });

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFileAlt />;
    if (fileType.includes('pdf')) return <FaFileAlt color="#e74c3c" />;
    if (fileType.includes('word')) return <FaFileAlt color="#2c3e50" />;
    if (fileType.includes('excel')) return <FaFileAlt color="#27ae60" />;
    return <FaFileAlt />;
  };

  return (
    <div className="equipo-form-container">
      <h2>{id ? 'Editar Equipo' : 'Registrar Equipo'}</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="equipo-form">
            <div className="image-upload-section">
              <h3>Imágenes del Equipo (Máximo 4)</h3>
              <div className="image-preview-container">
                {files.map((file, index) => {
                  let imageSrc;

                  if (file.isExisting) {
                    imageSrc = file.url.startsWith('http') ? file.url : `http://localhost:4000${file.url}`;
                  } else {
                    imageSrc = URL.createObjectURL(file.file);
                  }

                  return (
                    <div key={index} className="image-preview-wrapper">
                      <img
                        src={imageSrc}
                        alt={`Vista previa ${index + 1}`}
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  );
                })}
                {files.length < 4 && (
                  <div className="image-upload-btn">
                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        multiple
                        style={{ display: 'none' }}
                      />
                      <div className="add-image-placeholder">
                        <FaCircle size={24} />
                        <span>Agregar imagen</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Campos del formulario */}
            <div className="form-columns">
              <div className="form-column">
                <InputText label="Etiqueta del Activo" name="etiquetaActivo" required />
                <InputText label="Número de Serie" name="numeroSerie" required />
                <InputText label="Modelo" name="modelo" required />
                <Select
                  label="Estado"
                  name="estado"
                  value={values.estado}
                  onChange={(e) => setFieldValue('estado', e.target.value)}
                  required
                >
                  <option value="">Selecciona un estado</option>
                  <option value="En uso">En uso</option>
                  <option value="Fuera de servicio">Fuera de servicio</option>
                  <option value="En reparación">En reparación</option>
                  <option value="En desuso">En desuso</option>
                </Select>
                <Select
                  label="Ubicación / Área"
                  name="ubicacion"
                  value={values.ubicacion}
                  onChange={(e) => setFieldValue('ubicacion', e.target.value)}
                  required
                >
                  <option value="">Selecciona un área</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.nombre}>
                      {area.nombre}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Tipo de Equipo"
                  name="tipoEquipo"
                  value={values.tipoEquipo}
                  onChange={(e) => setFieldValue('tipoEquipo', e.target.value)}
                  required
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="Informatico">Informatico</option>
                  <option value="Biomedico">Biomedico</option>
                </Select>
              </div>

              <div className="form-column">
                <Select
                  label="Tipo de Mantenimiento"
                  name="tipoMantenimiento"
                  value={values.tipoMantenimiento}
                  onChange={(e) => setFieldValue('tipoMantenimiento', e.target.value)}
                  required
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="Preventivo">Mantenimiento Interno</option>
                  <option value="Tercerizado">Mantenimiento Tercerizado</option>
                  <option value="Garantía">Mantenimiento por Garantía</option>
                </Select>
                <InputText label="Fecha de Adquisición" name="fechaCompra" type="date" required />
                <InputText label="Fecha de inicio de uso" name="fechaInicio" type="date" required />
                <InputText label="Proveedor" name="proveedor" required />
                <InputText label="Número de Orden" name="numeroOrden" required />
                <Select
                  label="Usuario Asignado"
                  name="usuarioId"
                  value={values.usuarioId}
                  onChange={(e) => setFieldValue('usuarioId', e.target.value)}
                  required
                >
                  <option value="">Selecciona un usuario</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nombre} {user.apellido || ''}
                    </option>
                  ))}
                </Select>
                <InputText
                  label="Período de Mantenimiento (días)"
                  name="periodoMantenimiento"
                  type="number"
                  required
                />
              </div>
            </div>

            {/* Sección de Componentes */}
            <div className="componentes-section">
              <h3>Componentes del Equipo</h3>
              <button
                type="button"
                className="open-modal-btn"
                onClick={() => abrirModalComponente()}
              >
                <FaPlus className="icon-plus" /> Agregar Componente
              </button>

              {componentes.length > 0 ? (
                <div className="componentes-list">
                  {componentes.map((componente, index) => (
                    <div key={index} className="componente-card">
                      <div className="componente-info">
                        <h4>{componente.etiquetaActivo} - {componente.modelo}</h4>
                        <p><strong>Serie:</strong> {componente.numeroSerie}</p>
                        <p><strong>Estado:</strong> {componente.estado}</p>
                        <p><strong>Ubicación:</strong> {componente.ubicacion}</p>
                      </div>
                      <div className="componente-actions">
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => abrirModalComponente(componente)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => eliminarComponente(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-components">No hay componentes agregados</p>
              )}
            </div>

            {/* Documentos */}
            <div className="documents-upload-section">
              <h3>Documentos del Equipo (Máximo 4)</h3>
              <div className="documents-list">
                {documentFiles.map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="document-icon">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="document-info">
                      <span className="document-name">
                        {doc.name || (doc.filename && doc.filename.length > 30
                          ? `${doc.filename.substring(0, 30)}...`
                          : doc.filename)}
                      </span>
                      <span className="document-size">
                        {doc.size ? `${Math.round(doc.size / 1024)} KB` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="remove-document-btn"
                      onClick={() => removeDocument(index)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
                {documentFiles.length < 4 && (
                  <div className="document-upload-btn">
                    <label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleDocumentChange}
                        multiple
                        style={{ display: 'none' }}
                      />
                      <div className="add-document-placeholder">
                        <FaCircle size={24} />
                        <span>Agregar documento</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <ButtonPrimary type="submit" variant="primary" disabled={isSubmitting}>
              {id ? 'Actualizar' : 'Registrar'}
            </ButtonPrimary>
          </Form>
        )}
      </Formik>

      {/* Modal para componentes */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-container large-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {componenteEditando ? 'Editar Componente' : 'Agregar Componente'}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setModalAbierto(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <Formik
                initialValues={componenteValues}
                validationSchema={componenteValidationSchema}
                onSubmit={guardarComponente}
                enableReinitialize
              >
                {({ isSubmitting, setFieldValue, values }) => (
                  <Form className="componente-form">
                    <div className="form-columns">
                      <div className="form-column">
                        <InputText label="Etiqueta del Activo" name="etiquetaActivo" required />
                        <InputText label="Número de Serie" name="numeroSerie" required />
                        <InputText label="Modelo" name="modelo" required />
                        <Select
                          label="Estado"
                          name="estado"
                          value={values.estado}
                          onChange={(e) => setFieldValue('estado', e.target.value)}
                          required
                        >
                          <option value="">Selecciona un estado</option>
                          <option value="En uso">En uso</option>
                          <option value="Fuera de servicio">Fuera de servicio</option>
                          <option value="En reparación">En reparación</option>
                          <option value="En desuso">En desuso</option>
                        </Select>
                        <Select
                          label="Ubicación / Área"
                          name="ubicacion"
                          value={values.ubicacion}
                          onChange={(e) => setFieldValue('ubicacion', e.target.value)}
                          required
                        >
                          <option value="">Selecciona un área</option>
                          {areas.map((area) => (
                            <option key={area.id} value={area.nombre}>
                              {area.nombre}
                            </option>
                          ))}
                        </Select>
                        <Select
                          label="Tipo de Equipo"
                          name="tipoEquipo"
                          value={values.tipoEquipo}
                          onChange={(e) => setFieldValue('tipoEquipo', e.target.value)}
                          required
                        >
                          <option value="">Selecciona un tipo</option>
                          <option value="Informatico">Informatico</option>
                          <option value="Biomedico">Biomedico</option>
                        </Select>
                      </div>

                      <div className="form-column">
                        <Select
                          label="Tipo de Mantenimiento"
                          name="tipoMantenimiento"
                          value={values.tipoMantenimiento}
                          onChange={(e) => setFieldValue('tipoMantenimiento', e.target.value)}
                          required
                        >
                          <option value="">Selecciona un tipo</option>
                          <option value="Preventivo">Mantenimiento Interno</option>
                          <option value="Tercerizado">Mantenimiento Tercerizado</option>
                          <option value="Garantía">Mantenimiento por Garantía</option>
                        </Select>
                        <InputText label="Fecha de Adquisición" name="fechaCompra" type="date" required />
                        <InputText label="Fecha de inicio de uso" name="fechaInicio" type="date" required />
                        <InputText label="Proveedor" name="proveedor" required />
                        <InputText label="Número de Orden" name="numeroOrden" required />
                        <Select
                          label="Usuario Asignado"
                          name="usuarioId"
                          value={values.usuarioId}
                          onChange={(e) => setFieldValue('usuarioId', e.target.value)}
                          required
                        >
                          <option value="">Selecciona un usuario</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.nombre} {user.apellido || ''}
                            </option>
                          ))}
                        </Select>
                        <InputText
                          label="Período de Mantenimiento (días)"
                          name="periodoMantenimiento"
                          type="number"
                          required
                        />
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn modal-btn-cancel"
                        onClick={() => setModalAbierto(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn modal-btn-confirm"
                        disabled={isSubmitting}
                      >
                        {componenteEditando ? 'Actualizar' : 'Agregar'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipoForm;