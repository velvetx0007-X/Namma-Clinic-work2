const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const aiLabTestController = require('../controllers/aiLabTestController');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `lab_scan_${Date.now()}${path.extname(file.originalname)}`);
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
        cb(new Error("Only image and PDF files are allowed!"));
    }
});

router.post('/upload', upload.single('labTest'), aiLabTestController.uploadAndProcessLabTest);

module.exports = router;
