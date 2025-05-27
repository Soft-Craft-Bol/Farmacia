import React, { useState } from "react";
import { useFormik } from "formik";
import { finalizarTrabajo, registrarHistorial } from "../../service/api";
import "./FinalizarTrabajoForm.css";

const FinalizarTrabajoForm = ({ trabajoId, tecnicoId, onSuccess, onError }) => {
    const [files, setFiles] = useState({
        documentos: [],
        imagenes: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formik = useFormik({
        initialValues: {
            observaciones: '',
            solucionAplicada: '',
            materialesUtilizados: '',
            horasTrabajadas: '',
            recomendaciones: ''
        },
        onSubmit: async (values) => {
            setIsSubmitting(true);

            try {
                const formData = new FormData();

                // Agregar campos de texto
                Object.entries(values).forEach(([key, value]) => {
                    formData.append(key, value);
                });

                // Agregar archivos
                files.documentos.forEach((file, index) => {
                    formData.append(`documentos`, file); // O puedes usar `documentos[${index}]` si prefieres
                });

                files.imagenes.forEach((file, index) => {
                    formData.append(`imagenes`, file); // O puedes usar `imagenes[${index}]` si prefieres
                });

                // Agregar IDs
                formData.append('trabajoId', trabajoId);
                formData.append('tecnicoId', tecnicoId);

                // Llamar al endpoint
                const response = await finalizarTrabajo(trabajoId, tecnicoId, formData);

                onSuccess(response.data);
            } catch (error) {
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

    return (
        <div className="finalizar-trabajo-container">
            <h2>Finalizar Trabajo #{trabajoId}</h2>

            <form onSubmit={formik.handleSubmit}>
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

                <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Finalizando...' : 'Finalizar Trabajo'}
                </button>
            </form>
        </div>
    );
};

export default FinalizarTrabajoForm;