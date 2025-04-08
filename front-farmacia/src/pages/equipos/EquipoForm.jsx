import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { getEquipoById, createEquipo, updateEquipo, getAreas, getUsers } from '../../service/api';
import './EquipoForm.css';
import InputText from '../../components/inputs/InputText';
import Select from '../../components/select/Select';
import { ButtonPrimary } from '../../components/buttons/ButtonPrimary';
import { FaCircle, FaTimes, FaFileAlt } from 'react-icons/fa';

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
  });

  const [files, setFiles] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [preguntas, setPreguntas] = useState([]);
  const [nuevaPregunta, setNuevaPregunta] = useState('');
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
            fechaCompra: formatDate(data.fechaCompra), // Formatea la fecha
            fechaInicio: formatDate(data.fechaInicio),
            proveedor: data.proveedor || '',
            numeroOrden: data.numeroOrden || '',
            usuarioId: data.usuarioId || '',
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
            setPreguntas(data.componentes);
          }
        } catch (error) {
          console.error("Error al obtener el equipo:", error);
        }
      };
      fetchEquipo();
    }
  }, [id]);

  const agregarPregunta = () => {
    if (nuevaPregunta.trim() !== '') {
      setPreguntas([...preguntas, nuevaPregunta]);
      setNuevaPregunta('');
      setModalAbierto(false);
    }
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
    formData.append('componentes', JSON.stringify(preguntas));

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
    return d.toISOString().split('T')[0]; // Obtiene solo la parte de la fecha (yyyy-MM-dd)
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
            {/* Sección de imágenes */}
            <div className="image-upload-section">
              <h3>Imágenes del Equipo (Máximo 4)</h3>
              <div className="image-preview-container">
                {files.map((file, index) => {
                  // Determinar la fuente de la imagen
                  let imageSrc;

                  if (file.url) {
                    // Imagen existente del servidor
                    imageSrc = file.url.startsWith('http') ? file.url : `http://localhost:4000${file.url}`;
                  } else if (file.file) {
                    // Nueva imagen subida (File object)
                    imageSrc = URL.createObjectURL(file.file);
                  } else {
                    // Caso por defecto (no debería ocurrir)
                    imageSrc = '';
                  }

                  return (
                    <div key={index} className="image-preview-wrapper">
                      <img
                        src={imageSrc}
                        alt={`Vista previa ${index + 1}`}
                        className="image-preview"
                        onLoad={() => {
                          // Limpiar URLs creadas con createObjectURL cuando ya no se necesiten
                          if (!file.url && file.file) {
                            URL.revokeObjectURL(imageSrc);
                          }
                        }}
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
              </div>
            </div>

            {/* Componentes */}
            <button
              type="button"
              className="open-modal-btn"
              onClick={() => setModalAbierto(true)}
            >
              <FaCircle className="icon-plus" /> Agregar Componentes del equipo
            </button>

            <ul className="component-list">
              {preguntas.map((pregunta, index) => (
                <li key={index} className="component-item">
                  {pregunta}
                </li>
              ))}
            </ul>

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
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Agregar Componente</h3>
              <button
                className="modal-close-btn"
                onClick={() => setModalAbierto(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <input
                type="text"
                value={nuevaPregunta}
                onChange={(e) => setNuevaPregunta(e.target.value)}
                placeholder="Escribe el nombre del componente..."
                className="modal-input"
                onKeyPress={(e) => e.key === 'Enter' && agregarPregunta()}
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn modal-btn-cancel"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>
              <button
                className="btn modal-btn-confirm"
                onClick={agregarPregunta}
                disabled={!nuevaPregunta.trim()}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipoForm;