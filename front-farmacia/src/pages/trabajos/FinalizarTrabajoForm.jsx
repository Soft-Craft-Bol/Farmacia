import React, { useState } from "react";
import { useFormik } from "formik";
import { finalizarTrabajo, registrarHistorial, registerMantenimiento } from "../../service/api";
import "./FinalizarTrabajoForm.css";

const FinalizarTrabajoForm = ({ trabajoId, tecnicoId, onSuccess, onError }) => {
    const [files, setFiles] = useState({
        documentos: [],
        imagenes: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [equipoData, setEquipoData] = useState({
        equipoId: '',
        tipo: 'Preventivo',
        descripcion: '',
        horasUso: '',
        estadoActual: 'En uso normal'
    });
    const [showEquipoFields, setShowEquipoFields] = useState(false);

    const formik = useFormik({
        initialValues: {
            observaciones: '',
            solucionAplicada: '',
            materialesUtilizados: '',
            horasTrabajadas: '',
            recomendaciones: '',
            registrarMantenimiento: false
        },
        onSubmit: async (values) => {
            setIsSubmitting(true);

            try {
                // 1. Finalizar el trabajo
                const formData = new FormData();
                
                // Agregar campos de texto
                Object.entries(values).forEach(([key, value]) => {
                    formData.append(key, value);
                });

                // Agregar archivos
                files.documentos.forEach((file, index) => {
                    formData.append(`documentos`, file);
                });

                files.imagenes.forEach((file, index) => {
                    formData.append(`imagenes`, file);
                });

                // Agregar IDs
                formData.append('trabajoId', trabajoId);
                formData.append('tecnicoId', tecnicoId);

                const trabajoResponse = await finalizarTrabajo(trabajoId, tecnicoId, formData);

                // 2. Registrar mantenimiento si está habilitado
                if (values.registrarMantenimiento && equipoData.equipoId) {
                    const mantenimientoData = {
                        ...equipoData,
                        tecnicoId,
                        tecnicoNombre: "Técnico del sistema" // Puedes obtener el nombre real del usuario actual
                    };

                    await registerMantenimiento(mantenimientoData);
                }

                onSuccess(trabajoResponse.data);
            } catch (error) {
                console.error("Error en el proceso:", error);
                onError(error.response?.data || { message: 'Error al finalizar el trabajo' });
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    const handleFileChange = (e, fieldName) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => ({
            ...prev,
            [fieldName]: [...prev[fieldName], ...newFiles]
        }));
    };

    const removeFile = (fieldName, index) => {
        setFiles(prev => {
            const updatedFiles = [...prev[fieldName]];
            updatedFiles.splice(index, 1);
            return { ...prev, [fieldName]: updatedFiles };
        });
    };

    const handleEquipoDataChange = (e) => {
        const { name, value } = e.target;
        setEquipoData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleEquipoFields = () => {
        setShowEquipoFields(!showEquipoFields);
        formik.setFieldValue('registrarMantenimiento', !showEquipoFields);
    };

    return (
        <div className="finalizar-trabajo-container">
            <h2>Finalizar Trabajo #{trabajoId}</h2>

            <form onSubmit={formik.handleSubmit}>
                {/* Sección de finalización de trabajo */}
                <div className="form-section">
                    <h3>Información del Trabajo</h3>
                    
                    {/* Campo Observaciones */}
                    <div className="form-group">
                        <label htmlFor="observaciones">Observaciones</label>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            className="form-control"
                            onChange={formik.handleChange}
                            value={formik.values.observaciones}
                            required
                        />
                    </div>

                    {/* Campo Solución Aplicada */}
                    <div className="form-group">
                        <label htmlFor="solucionAplicada">Solución Aplicada</label>
                        <input
                            type="text"
                            id="solucionAplicada"
                            name="solucionAplicada"
                            className="form-control"
                            onChange={formik.handleChange}
                            value={formik.values.solucionAplicada}
                            required
                        />
                    </div>

                    {/* Campo Materiales Utilizados */}
                    <div className="form-group">
                        <label htmlFor="materialesUtilizados">Materiales Utilizados</label>
                        <input
                            type="text"
                            id="materialesUtilizados"
                            name="materialesUtilizados"
                            className="form-control"
                            onChange={formik.handleChange}
                            value={formik.values.materialesUtilizados}
                            required
                        />
                    </div>

                    {/* Campo Horas Trabajadas */}
                    <div className="form-group">
                        <label htmlFor="horasTrabajadas">Horas Trabajadas</label>
                        <input
                            type="number"
                            step="0.1"
                            id="horasTrabajadas"
                            name="horasTrabajadas"
                            className="form-control"
                            onChange={formik.handleChange}
                            value={formik.values.horasTrabajadas}
                            required
                        />
                    </div>

                    {/* Campo Recomendaciones */}
                    <div className="form-group">
                        <label htmlFor="recomendaciones">Recomendaciones</label>
                        <textarea
                            id="recomendaciones"
                            name="recomendaciones"
                            className="form-control"
                            onChange={formik.handleChange}
                            value={formik.values.recomendaciones}
                        />
                    </div>
                </div>

                {/* Subida de Documentos */}
                <div className="form-group">
                    <label>Documentos (PDF, DOC)</label>
                    <input
                        type="file"
                        className="form-control-file"
                        onChange={(e) => handleFileChange(e, 'documentos')}
                        accept=".pdf,.doc,.docx"
                        multiple
                    />
                    <div className="file-list">
                        {files.documentos.map((file, index) => (
                            <div key={index} className="file-item">
                                <span>{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFile('documentos', index)}
                                    className="btn-remove-file"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subida de Imágenes */}
                <div className="form-group">
                    <label>Imágenes (JPG, PNG)</label>
                    <input
                        type="file"
                        className="form-control-file"
                        onChange={(e) => handleFileChange(e, 'imagenes')}
                        accept=".jpg,.jpeg,.png"
                        multiple
                    />
                    <div className="file-list">
                        {files.imagenes.map((file, index) => (
                            <div key={index} className="file-item">
                                <span>{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFile('imagenes', index)}
                                    className="btn-remove-file"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Checkbox para registrar mantenimiento */}
                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={showEquipoFields}
                            onChange={toggleEquipoFields}
                        />
                        Registrar mantenimiento de equipo asociado
                    </label>
                </div>

                {/* Sección de registro de mantenimiento (condicional) */}
                {showEquipoFields && (
                    <div className="form-section equipo-section">
                        <h3>Información del Mantenimiento</h3>
                        
                        {/* Campo ID del Equipo */}
                        <div className="form-group">
                            <label htmlFor="equipoId">ID del Equipo</label>
                            <input
                                type="text"
                                id="equipoId"
                                name="equipoId"
                                className="form-control"
                                onChange={handleEquipoDataChange}
                                value={equipoData.equipoId}
                                required={showEquipoFields}
                            />
                        </div>

                        {/* Campo Tipo de Mantenimiento */}
                        <div className="form-group">
                            <label htmlFor="tipo">Tipo de Mantenimiento</label>
                            <select
                                id="tipo"
                                name="tipo"
                                className="form-control"
                                onChange={handleEquipoDataChange}
                                value={equipoData.tipo}
                                required={showEquipoFields}
                            >
                                <option value="Preventivo">Preventivo</option>
                                <option value="Correctivo">Correctivo</option>
                                <option value="Predictivo">Predictivo</option>
                                <option value="Garantía">Garantía</option>
                            </select>
                        </div>

                        {/* Campo Descripción */}
                        <div className="form-group">
                            <label htmlFor="descripcion">Descripción</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                className="form-control"
                                onChange={handleEquipoDataChange}
                                value={equipoData.descripcion}
                                required={showEquipoFields}
                            />
                        </div>

                        {/* Campo Horas de Uso */}
                        <div className="form-group">
                            <label htmlFor="horasUso">Horas de Uso</label>
                            <input
                                type="number"
                                id="horasUso"
                                name="horasUso"
                                className="form-control"
                                onChange={handleEquipoDataChange}
                                value={equipoData.horasUso}
                                required={showEquipoFields}
                            />
                        </div>

                        {/* Campo Estado Actual */}
                        <div className="form-group">
                            <label htmlFor="estadoActual">Estado Actual del Equipo</label>
                            <select
                                id="estadoActual"
                                name="estadoActual"
                                className="form-control"
                                onChange={handleEquipoDataChange}
                                value={equipoData.estadoActual}
                                required={showEquipoFields}
                            >
                                <option value="En uso normal">En uso normal</option>
                                <option value="En uso intensivo">En uso intensivo</option>
                                <option value="En desuso">En desuso</option>
                                <option value="En mantenimiento">En mantenimiento</option>
                                <option value="Dañado">Dañado</option>
                            </select>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Procesando...' : 'Finalizar y Registrar'}
                </button>
            </form>
        </div>
    );
};

export default FinalizarTrabajoForm;