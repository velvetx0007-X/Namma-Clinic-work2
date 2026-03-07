import api from '../api/axiosInstance';

/**
 * Service to handle frontend interactions with the AI/ML backend.
 */
class MLService {
    /**
     * Upload and process a lab test document.
     * @param {File} file - The document file
     * @param {string} patientId - The patient's ID
     * @param {string} orderedBy - The clinic/doctor ID
     */
    async uploadLabTest(file, patientId, orderedBy) {
        const formData = new FormData();
        formData.append('labTest', file);
        formData.append('patientId', patientId);
        formData.append('orderedBy', orderedBy);

        const response = await api.post('/ai-lab-tests/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    /**
     * Upload and process a prescription document.
     * @param {File} file - The prescription file
     * @param {string} patientId - The patient's ID
     * @param {string} doctorId - The doctor's ID
     */
    async uploadPrescription(file, patientId, doctorId) {
        const formData = new FormData();
        formData.append('prescription', file);
        formData.append('patientId', patientId);
        formData.append('doctorId', doctorId);

        const response = await api.post('/ai-prescriptions/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    /**
     * Chat with the AI Health Assistant.
     * @param {string} message - User query
     * @param {Object} context - Optional user health context
     */
    async chat(message, context = {}) {
        const response = await api.post('/ai-health/chat', { message, context });
        return response.data;
    }
}

export default new MLService();
