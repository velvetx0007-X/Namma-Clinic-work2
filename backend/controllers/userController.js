const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const Admin = require('../models/Admin');
const User = require('../models/User'); // Import base User model
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const PatientRecord = require('../models/PatientRecord');
const Vitals = require('../models/Vitals');
const Consultation = require('../models/Consultation');
const Billing = require('../models/Billing');
const MedicationLog = require('../models/MedicationLog');
const LabTest = require('../models/LabTest');
const Communication = require('../models/Communication');
const Review = require('../models/Review');
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

exports.deleteAccount = async (req, res) => {
    try {
        const { userId, role } = req.body;
        
        // 1. Find the user in the base User collection first
        const basicUser = await User.findById(userId);
        if (!basicUser) {
            return res.status(404).json({ success: false, message: 'User not found in system' });
        }

        const userEmail = basicUser.email;
        const userPhone = basicUser.phoneNumber;
        const userRole = basicUser.role || role;

        // 2. Identify the role-specific model and find the detailed record
        // We search by email or phone to be sure we find the record if IDs differ
        const RoleModel = getModelByRole(userRole);
        let detailedUserId = null;

        if (RoleModel) {
            const orQuery = [{ email: userEmail }];
            if (userPhone) orQuery.push({ phoneNumber: userPhone });

            const detailedUser = await RoleModel.findOne({ $or: orQuery });
            if (detailedUser) {
                detailedUserId = detailedUser._id;
                
                // Delete profile photo if exists
                if (detailedUser.profilePhoto) {
                    const photoPath = path.join(__dirname, '..', detailedUser.profilePhoto);
                    if (fs.existsSync(photoPath)) {
                        fs.unlinkSync(photoPath);
                    }
                }
                
                // Delete the detailed role record
                await RoleModel.findByIdAndDelete(detailedUserId);
            }
        }

        // 3. Delete associated data
        // We use both userId (User collection) and detailedUserId (Role collection) if they differ
        const findQueries = [];
        if (userId) findQueries.push(userId);
        if (detailedUserId && detailedUserId.toString() !== userId.toString()) findQueries.push(detailedUserId);

        const deletePromises = [];

        // For each collection, we delete records associated with any of the identified IDs
        const commonModels = [
            { model: Appointment, fields: ['patientId', 'doctorId'] },
            { model: Prescription, fields: ['patientId', 'doctorId'] },
            { model: PatientRecord, fields: ['patientId', 'createdBy'] },
            { model: Vitals, fields: ['patientId'] },
            { model: Consultation, fields: ['patientId', 'doctorId'] },
            { model: Billing, fields: ['patientId', 'createdBy'] },
            { model: MedicationLog, fields: ['patientId', 'administeredBy'] },
            { model: LabTest, fields: ['patientId', 'orderedBy', 'sampleCollectedBy'] },
            { model: Review, fields: ['patientId', 'clinicId'] }
        ];

        commonModels.forEach(m => {
            const query = { $or: m.fields.map(f => ({ [f]: { $in: findQueries } })) };
            deletePromises.push(m.model.deleteMany(query));
        });

        // Communication handlers (sender or receiver)
        deletePromises.push(Communication.deleteMany({ 
            $or: [
                { senderId: { $in: findQueries } },
                { receiverId: { $in: findQueries } }
            ] 
        }));

        await Promise.all(deletePromises);

        // 4. Finally delete from the base User collection
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'Account and all associated records deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};



