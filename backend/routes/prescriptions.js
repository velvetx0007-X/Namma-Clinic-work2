const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const auth = require('../middleware/auth');
const { sendNotification } = require('../services/notificationService');
const Patient = require('../models/Patient');

// Create prescription
router.post('/', auth, async (req, res) => {
    try {
        const { patientId, doctorId, consultationId, medications, digitalSignature, validUntil } = req.body;

        // Determine doctorId:
        // - If Admin, use the provided doctorId
        // - If Doctor, use their own ID
        // - If Clinic, use their ID
        let finalDoctorId;
        if (req.user && req.user.role === 'admin') {
            if (!doctorId) {
                return res.status(400).json({ success: false, message: 'Doctor ID is required for Admin entry' });
            }
            finalDoctorId = doctorId;
        } else {
            // For Doctors/Clinics, use their own ID. 
            // If they are an admin and didn't provide a doctorId, this will still fail validation at schema level which is correct.
            finalDoctorId = doctorId || req.user?.id;
        }

        const prescription = new Prescription({
            patientId,
            doctorId: finalDoctorId,
            consultationId,
            medications,
            digitalSignature,
            validUntil
        });

        await prescription.save();

        // Send Notification
        try {
            const patient = await Patient.findById(patientId);
            if (patient) {
                await sendNotification(patient.userId || patient._id, {
                    title: 'New Prescription Uploaded',
                    text: `Hello ${patient.name}, a new prescription has been added to your records.`,
                    type: 'consultation', // Or 'prescription' if I add it to the model enum
                    relatedId: prescription._id,
                    onModel: 'Prescription'
                });
            }
        } catch (notifyErr) {
            console.error('Failed to send prescription notification:', notifyErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            data: prescription
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update prescription (Admin only or specific logic)
router.put('/:id', auth, async (req, res) => {
    try {
        const { generatePrescriptionPDFHelper } = require('../controllers/aiPrescriptionController');
        const updates = req.body;
        let prescription = await Prescription.findById(req.params.id)
            .populate('patientId')
            .populate('doctorId');

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        const isNowCompleted = updates.status === 'completed' && prescription.status !== 'completed';

        // Update fields
        if (updates.medications) prescription.medications = updates.medications;
        if (updates.notes) prescription.notes = updates.notes;
        if (updates.status) prescription.status = updates.status;

        // Auto-generate PDF on completion
        if (isNowCompleted || (updates.status === 'completed' && !prescription.digitalPrescriptionPdf)) {
            try {
                const pdfPath = await generatePrescriptionPDFHelper(
                    prescription.patientId,
                    prescription.doctorId,
                    prescription.medications,
                    {
                        clinicalNotes: prescription.clinicalNotes || prescription.notes,
                        vitals: prescription.vitals,
                        complaints: prescription.symptoms,
                        diagnosis: prescription.diagnosis
                    },
                    prescription.isAIProcessed
                );
                prescription.digitalPrescriptionPdf = pdfPath;
            } catch (err) {
                console.error("PDF generation error:", err);
            }
        }

        await prescription.save();

        res.json({ success: true, message: 'Prescription updated', data: prescription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete prescription (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        await prescription.deleteOne();

        res.json({ success: true, message: 'Prescription deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get ALL prescriptions (for Admin/Staff view)
router.get('/', auth, async (req, res) => {
    try {
        const prescriptions = await Prescription.find()
            .populate('patientId', 'name email')
            .populate('doctorId', 'userName clinicName')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: prescriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get patient prescriptions
router.get('/patient/:patientId', auth, async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patientId: req.params.patientId })
            .populate('doctorId', 'userName clinicName')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: prescriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get prescription by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('patientId', 'name email phoneNumber')
            .populate('doctorId', 'userName clinicName nmrNumber');

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        res.json({ success: true, data: prescription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Request refill
router.put('/:id/refill', auth, async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            { status: 'refill-requested' },
            { new: true }
        );

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        res.json({ success: true, message: 'Refill requested', data: prescription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
