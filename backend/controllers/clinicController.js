const Clinic = require('../models/Clinic');

// Get all staff members for a specific clinic (based on registration number)
exports.getClinicStaff = async (req, res) => {
    try {
        const { clinicRegistrationNumber } = req.params;

        if (!clinicRegistrationNumber) {
            return res.status(400).json({ success: false, message: 'Clinic registration number is required' });
        }

        // Find all users (doctors, nurses, receptionists) with the same clinic registration number
        // Exclude the requester if needed, or include them.
        // We probably want to exclude 'admin' roles from the "staff" list if the admin is viewing it,
        // or just show everyone. Let's show everyone except the current user (if we had the ID).
        // For now, just return everyone with that reg number.

        const staff = await Clinic.find({
            clinicRegistrationNumber,
            userType: { $in: ['doctor', 'nurse', 'receptionist'] }
        }).select('-password -pin');

        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (error) {
        console.error('Get clinic staff error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update access/permissions (placeholder for now if needed later)
exports.updateStaffAccess = async (req, res) => {
    // Logic to enable/disable access or update details
    res.status(501).json({ message: 'Not implemented yet' });
};
