const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

const auth = require('../middleware/auth');

// Book new appointment
router.post('/', auth, async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, appointmentTime, type, chiefComplaint } = req.body;

        // If a patient is booking, use their ID and set status to pending
        // If a receptionist/admin is booking, use provided patientId and status scheduled
        const isPatient = req.user.userType === 'patient';

        const appointment = new Appointment({
            patientId: isPatient ? req.user.id : patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            type: type || 'scheduled',
            chiefComplaint,
            status: isPatient ? 'pending' : 'scheduled',
            assignedBy: req.user.id
        });

        await appointment.save();

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get doctor's appointments
router.get('/doctor/:doctorId', auth, async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.params.doctorId })
            .populate('patientId', 'name email phoneNumber uhid')
            .sort({ appointmentDate: 1, appointmentTime: 1 });

        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get today's appointments for a doctor
router.get('/doctor/:doctorId/today', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await Appointment.find({
            doctorId: req.params.doctorId,
            appointmentDate: { $gte: today, $lt: tomorrow }
        })
            .populate('patientId', 'name email phoneNumber area uhid')
            .sort({ appointmentTime: 1 });

        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get patient's appointments
router.get('/patient/:patientId', auth, async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.params.patientId })
            .populate('doctorId', 'userName clinicName')
            .sort({ appointmentDate: -1 });

        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update appointment status
router.put('/:id', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({ success: true, message: 'Appointment updated', data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cancel appointment
router.delete('/:id', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({ success: true, message: 'Appointment cancelled', data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all appointments (for receptionists/admins)
router.get('/', auth, async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'name email phoneNumber uhid')
            .populate('doctorId', 'userName clinicName')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
