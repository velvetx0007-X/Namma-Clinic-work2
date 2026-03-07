const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const mlService = require('../services/mlService');

// Submit a review
router.post('/', async (req, res) => {
    try {
        const { patientId, clinicId, rating, comment } = req.body;
        
        // AI Analysis
        const aiAnalysis = await mlService.analyzeReview(comment);
        
        const newReview = new Review({
            patientId,
            clinicId,
            rating,
            comment,
            aiSentiment: aiAnalysis.sentiment,
            aiKeywords: aiAnalysis.keywords
        });

        await newReview.save();
        res.status(201).json({ success: true, data: newReview });
    } catch (error) {
        console.error("Submit Review Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get reviews for a specific clinic
router.get('/clinic/:clinicId', async (req, res) => {
    try {
        const reviews = await Review.find({ clinicId: req.params.clinicId })
            .populate('patientId', 'name profilePhoto')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all reviews (Admin only - simplified for now)
router.get('/admin/all', async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('patientId', 'name')
            .populate('clinicId', 'clinicName userName')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
