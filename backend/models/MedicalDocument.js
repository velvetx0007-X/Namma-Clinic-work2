const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    patientName: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    documentType: {
        type: String,
        enum: ['prescription', 'lab_report', 'scan_report', 'other', 'ai_prescription'],
        required: true
    },
    title: { type: String, trim: true, default: 'Untitled Document' },
    fileUrl: { type: String, required: true },
    fileName: { type: String, trim: true },
    fileMimeType: { type: String, trim: true },
    uploadedBy: { type: String, trim: true, default: 'patient' }, // 'patient', 'clinic', 'doctor', 'receptionist'
    uploadedByRole: {
        type: String,
        enum: ['patient', 'clinic', 'doctor', 'receptionist', 'admin'],
        default: 'patient'
    },
    uploadedById: { type: mongoose.Schema.Types.ObjectId },
    aiGenerated: { type: Boolean, default: false },
    editable: { type: Boolean, default: true },
    notes: { type: String, trim: true, default: '' },
    // For lab reports
    labTestName: { type: String, trim: true },
    labResult: { type: String, trim: true },
    labStatus: {
        type: String,
        enum: ['pending', 'completed', 'reviewed', ''],
        default: ''
    },
    // Linked prescription reference (optional)
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }
}, {
    timestamps: true
});

// Indexes for fast lookup
medicalDocumentSchema.index({ patientId: 1 });
medicalDocumentSchema.index({ phoneNumber: 1 });
medicalDocumentSchema.index({ documentType: 1 });
medicalDocumentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
