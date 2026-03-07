const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const Admin = require('../models/Admin');
const path = require('path');
const fs = require('fs');

// Helper to get model based on role
const getModelByRole = (role) => {
    switch (role) {
        case 'patient': return Patient;
        case 'doctor':
        case 'nurse':
        case 'receptionist':
        case 'clinic': return Clinic;
        case 'admin': return Admin;
        default: return null;
    }
};

exports.updateProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a photo' });
        }

        const { userId, role } = req.body;
        const Model = getModelByRole(role);

        if (!Model) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await Model.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete old photo if it exists
        // req.file.path is something like 'uploads/profile_photos/profile_123.jpg'
        // user.profilePhoto stores the same format
        if (user.profilePhoto) {
            const oldPath = path.join(__dirname, '..', user.profilePhoto);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Store relative path for flexibility (e.g. uploads/profile_photos/...)
        const relativePath = req.file.path.replace(/\\/g, '/');
        user.profilePhoto = relativePath;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update profile photo error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfileDetails = async (req, res) => {
    try {
        const { userId, role, ...updateData } = req.body;
        const Model = getModelByRole(role);

        if (!Model) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await Model.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile details updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update profile details error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { userId, role } = req.params;
        const Model = getModelByRole(role);

        if (!Model) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await Model.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
