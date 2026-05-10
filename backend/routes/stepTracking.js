const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StepTracking = require('../models/StepTracking');

// POST /api/step-tracking - Save/Update daily steps
router.post('/', auth, async (req, res) => {
    try {
        const { patientId, date, steps, distance, calories, fatLoss, height } = req.body;

        const existing = await StepTracking.findOne({ patientId, date });
        if (existing) {
            existing.steps = steps;
            existing.distance = distance;
            existing.calories = calories;
            existing.fatLoss = fatLoss;
            if (height) existing.height = height;
            await existing.save();
            return res.json({ success: true, data: existing });
        }

        const record = new StepTracking({ patientId, date, steps, distance, calories, fatLoss, height: height || 165 });
        await record.save();
        res.status(201).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/step-tracking/patient/:patientId - Get last 7 days
router.get('/patient/:patientId', auth, async (req, res) => {
    try {
        const records = await StepTracking.find({ patientId: req.params.patientId })
            .sort({ date: -1 })
            .limit(30);
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/step-tracking/patient/:patientId/today - Today's steps
router.get('/patient/:patientId/today', auth, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const record = await StepTracking.findOne({ patientId: req.params.patientId, date: today });
        res.json({ success: true, data: record || { steps: 0, distance: 0, calories: 0, fatLoss: 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
