const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { sendContactEmail } = require('../controllers/contactController');

// Rate limiter for contact form: max 3 requests per hour per IP
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, 
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/contact
router.post('/', contactLimiter, sendContactEmail);

module.exports = router;
