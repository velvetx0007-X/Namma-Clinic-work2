const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');

// Multer Config for Profile Photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile_photos/');
    },
    filename: (req, file, cb) => {
        cb(null, `profile_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png) are allowed'));
    },
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// Create profile_photos directory if it doesn't exist
const fs = require('fs');
const dir = './uploads/profile_photos';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Routes
router.post('/profile-photo', upload.single('profilePhoto'), userController.updateProfilePhoto);
router.put('/profile', userController.updateProfileDetails);
router.get('/profile/:role/:userId', userController.getProfile);

module.exports = router;
