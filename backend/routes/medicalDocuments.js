const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const MedicalDocument = require('../models/MedicalDocument');
const Patient = require('../models/Patient');

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/medical_docs');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `doc_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, JPG, JPEG, PNG are allowed.'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// POST /api/medical-documents - Upload a document
router.post('/', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { patientId, documentType, title, notes, labTestName, labResult, labStatus } = req.body;

        // Fetch patient info
        let patientName = '';
        let phoneNumber = '';
        if (patientId) {
            const patient = await Patient.findById(patientId).select('name phoneNumber');
            if (patient) {
                patientName = patient.name;
                phoneNumber = patient.phoneNumber;
            }
        }

        const fileUrl = `/uploads/medical_docs/${req.file.filename}`;

        const doc = new MedicalDocument({
            patientId,
            patientName,
            phoneNumber,
            documentType: documentType || 'other',
            title: title || req.file.originalname,
            fileUrl,
            fileName: req.file.originalname,
            fileMimeType: req.file.mimetype,
            uploadedBy: req.user?.name || req.user?.userName || 'Unknown',
            uploadedByRole: req.user?.role || 'patient',
            uploadedById: req.user?.id,
            aiGenerated: false,
            editable: true,
            notes: notes || '',
            labTestName: labTestName || '',
            labResult: labResult || '',
            labStatus: labStatus || ''
        });

        await doc.save();

        res.status(201).json({ success: true, message: 'Document uploaded successfully', data: doc });
    } catch (error) {
        console.error('Medical doc upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/medical-documents/patient/:patientId - Get all docs for a patient
router.get('/patient/:patientId', auth, async (req, res) => {
    try {
        const docs = await MedicalDocument.find({ patientId: req.params.patientId })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: docs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/medical-documents - Get ALL docs (clinic/reception/admin)
router.get('/', auth, async (req, res) => {
    try {
        const docs = await MedicalDocument.find()
            .populate('patientId', 'name phoneNumber uhid')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: docs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/medical-documents/:id - Edit a document (clinic/admin)
router.put('/:id', auth, async (req, res) => {
    try {
        const { role } = req.user || {};
        const doc = await MedicalDocument.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

        // Patients can only edit their own
        if (role === 'patient' && doc.patientId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        // Receptionist has limited edit (notes only)
        if (role === 'receptionist') {
            doc.notes = req.body.notes || doc.notes;
        } else {
            const { title, notes, labTestName, labResult, labStatus, editable } = req.body;
            if (title !== undefined) doc.title = title;
            if (notes !== undefined) doc.notes = notes;
            if (labTestName !== undefined) doc.labTestName = labTestName;
            if (labResult !== undefined) doc.labResult = labResult;
            if (labStatus !== undefined) doc.labStatus = labStatus;
            if (editable !== undefined) doc.editable = editable;
        }
        await doc.save();
        res.json({ success: true, message: 'Document updated', data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/medical-documents/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await MedicalDocument.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

        // Delete file from disk
        const filePath = path.join(__dirname, '..', doc.fileUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await doc.deleteOne();
        res.json({ success: true, message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
