const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// @route   GET /api/patients
// @desc    Get all patients
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   DELETE /api/patients/:id
// @desc    Delete a patient
router.delete('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        await patient.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Patient deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   PUT /api/patients/:id
// @desc    Update patient details
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        // Password handling should ideally be separate or hashed, but for simplicity we'll allow updating if provided
        // In a real app, use user.save() to trigger pre-save hooks for password hashing

        let patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Apply updates
        Object.keys(updates).forEach((key) => {
            patient[key] = updates[key];
        });

        await patient.save(); // Triggers password hashing if password changed

        res.json({ success: true, message: 'Patient updated successfully', data: patient });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/patients
// @desc    Create a new patient
router.post('/', async (req, res) => {
    try {
        const { name, email, phoneNumber, area, age, bloodGroup, uhid } = req.body;

        // Basic validation
        if (!name || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone number are required'
            });
        }

        // Check if patient already exists by phone or uhid
        const existingPatient = await Patient.findOne({
            $or: [
                { phoneNumber: phoneNumber },
                ...(uhid ? [{ uhid: uhid }] : [])
            ]
        });

        if (existingPatient) {
            return res.status(400).json({
                success: false,
                message: 'Patient with this phone number or UHID already exists'
            });
        }

        // Create patient with a default password (they can change it later)
        const password = Math.random().toString(36).slice(-8); // Random 8-char password

        const patient = new Patient({
            name,
            email: email || `${phoneNumber}@nammaclinic.com`, // Default email if not provided
            password,
            phoneNumber,
            area: area || 'N/A',
            age,
            bloodGroup,
            uhid
        });

        await patient.save();

        res.status(201).json({
            success: true,
            message: 'Patient created successfully',
            data: patient
        });
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   GET /api/patients/search/:phoneNumber
// @desc    Search for a patient by phone number
router.get('/search/:phoneNumber', async (req, res) => {
    try {
        const patient = await Patient.findOne({ phoneNumber: req.params.phoneNumber }).select('-password');
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        console.error('Error searching patient:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
