const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const aiPrescriptionController = require('../controllers/aiPrescriptionController');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `upload_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDFs are allowed'));
    }
});

// Route: Upload and process prescription
router.post('/upload', upload.single('prescription'), aiPrescriptionController.uploadAndProcess);

// Route: Manual prescription creation
router.post('/manual', aiPrescriptionController.createManual);

module.exports = router;
