const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const { sendNotification } = require('../services/notificationService');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

// Start consultation
router.post('/', auth, async (req, res) => {
    try {
        const { appointmentId, patientId, subjective, objective, assessment, plan, diagnosis } = req.body;

        // Update appointment status
        await Appointment.findByIdAndUpdate(appointmentId, { status: 'in-progress' });

        const consultation = new Consultation({
            appointmentId,
            patientId,
            doctorId: req.user?.id,
            subjective,
            objective,
            assessment,
            plan,
            diagnosis
        });

        await consultation.save();

        res.status(201).json({
            success: true,
            message: 'Consultation started',
            data: consultation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update consultation
router.put('/:id', auth, async (req, res) => {
    try {
        const consultation = await Consultation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Consultation not found' });
        }

        // If completed, update appointment status
        if (req.body.status === 'completed') {
            consultation.completedAt = new Date();
            await consultation.save();
            await Appointment.findByIdAndUpdate(consultation.appointmentId, { status: 'completed' });
        }

        // Send Notification
        try {
            const patient = await Patient.findById(consultation.patientId);
            if (patient) {
                await sendNotification(patient.userId || patient._id, {
                    title: 'Consultation Updated',
                    text: `Hello ${patient.name}, your consultation record has been updated by your provider.`,
                    type: 'consultation',
                    relatedId: consultation._id,
                    onModel: 'Consultation'
                });
            }
        } catch (notifyErr) {
            console.error('Failed to send consultation notification:', notifyErr.message);
        }

        res.json({ success: true, message: 'Consultation updated', data: consultation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get patient consultations
router.get('/patient/:patientId', auth, async (req, res) => {
    try {
        const consultations = await Consultation.find({ patientId: req.params.patientId })
            .populate('doctorId', 'userName clinicName')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: consultations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get consultation by appointment
router.get('/appointment/:appointmentId', auth, async (req, res) => {
    try {
        const consultation = await Consultation.findOne({ appointmentId: req.params.appointmentId })
            .populate('doctorId', 'userName clinicName')
            .populate('patientId', 'name email');

        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Consultation not found' });
        }

        res.json({ success: true, data: consultation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get consultations by logged-in doctor
router.get('/doctor', auth, async (req, res) => {
    try {
        const consultations = await Consultation.find({ doctorId: req.user.id })
            .populate('patientId', 'name uhid age gender bloodGroup phoneNumber')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: consultations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
