const User = require('../models/User');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const Admin = require('../models/Admin');
const OTP = require('../models/OTP');
const { sendOTP } = require('../services/otpService');
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.requestEmailOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email, isEmailVerified: true });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered and verified' });
        }

        const result = await sendOTP('email', email);
        res.status(200).json({ success: true, message: 'OTP sent to Email', ...result });
    } catch (err) {
        next(err);
    }
};

exports.requestPhoneOTP = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;

        const existingUser = await User.findOne({ phoneNumber, isPhoneVerified: true });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Phone number already registered and verified' });
        }

        const result = await sendOTP('phone', phoneNumber);
        res.status(200).json({ success: true, message: 'OTP sent to Phone', ...result });
    } catch (err) {
        next(err);
    }
};

exports.verifyOTP = async (req, res, next) => {
    try {
        const { identifier, type, otp } = req.body;

        const otpRecord = await OTP.findOne({ identifier, type, otp });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Mark as verified instead of deleting immediately
        otpRecord.isVerified = true;
        await otpRecord.save();

        res.status(200).json({
            success: true,
            message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully`
        });
    } catch (err) {
        next(err);
    }
};

exports.signup = async (req, res, next) => {
    try {
        const { 
            name, email, phoneNumber, password, role,
            clinicName, clinicAddress, specialization, licenseNumber, department, clinicCode, pin
        } = req.body;

        // Verify that email was verified within the last 10 minutes
        const emailVerified = await OTP.findOne({ identifier: email, type: 'email', isVerified: true });

        if (!emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email must be verified before account creation'
            });
        }

        // Check if a user with the same email already exists
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists. Please login instead.'
            });
        }

        // Check if a user with the same phone number already exists
        const existingPhoneUser = await User.findOne({ phoneNumber });
        if (existingPhoneUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this phone number already exists. Please login or use a different number.'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            phoneNumber,
            password,
            role: role || 'patient',
            pin, 
            clinicName,
            clinicAddress,
            specialization,
            licenseNumber,
            department,
            clinicCode,
            isEmailVerified: true,
            isPhoneVerified: true
        });

        // Clean up OTP record
        await OTP.deleteOne({ identifier: email, type: 'email' });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        // Handle MongoDB duplicate key error gracefully
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            const friendlyName = field === 'phoneNumber' ? 'phone number' : field;
            return res.status(400).json({
                success: false,
                message: `An account with this ${friendlyName} already exists. Please login or use a different ${friendlyName}.`
            });
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        let { identifier, email, phoneNumber, password, pin, role } = req.body;

        if (!role) {
            return res.status(400).json({ success: false, message: 'Role is required' });
        }

        // Normalize inputs
        let normalizedIdentifier = identifier ? identifier.trim() : null;
        let normalizedEmail = email ? email.trim().toLowerCase() : (normalizedIdentifier && normalizedIdentifier.includes('@') ? normalizedIdentifier.toLowerCase() : null);
        let normalizedPhone = phoneNumber ? phoneNumber.trim().replace(/[^\d+]/g, '') : (!normalizedEmail && normalizedIdentifier ? normalizedIdentifier.replace(/[^\d+]/g, '') : null);

        // Build query for roles
        const buildQuery = (emailVal, phoneVal) => {
            const q = { role };
            if (emailVal) {
                q.email = emailVal;
            } else if (phoneVal) {
                // Strip all prefixes for a "raw" 10-digit check if possible
                let rawPhone = phoneVal.replace(/^\+91|^91|^0/, '');
                if (rawPhone.length === 10) {
                    q.$or = [
                        { phoneNumber: rawPhone },
                        { phoneNumber: '+91' + rawPhone },
                        { phoneNumber: '91' + rawPhone }
                    ];
                } else {
                    q.phoneNumber = phoneVal;
                }
            }
            return q;
        };

        const query = buildQuery(normalizedEmail, normalizedPhone);
        console.log(`[AUTH] Login attempt for ${role} with query:`, JSON.stringify(query));

        // Find all potential matches (could be multiple due to split identity)
        let potentialUsers = await User.find(query).select('+password +pin');
        
        // Also check role-specific collections
        if (role === 'patient') {
            const patients = await Patient.find(query).select('+password +pin');
            potentialUsers = [...potentialUsers, ...patients];
        } else if (['clinic', 'doctor', 'nurse', 'receptionist'].includes(role)) {
            const clinics = await Clinic.find(query).select('+password +pin');
            potentialUsers = [...potentialUsers, ...clinics];
        } else if (role === 'admin') {
            const admins = await Admin.find(query).select('+password +pin');
            potentialUsers = [...potentialUsers, ...admins];
        }

        if (potentialUsers.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: normalizedEmail ? 'No account found with this email for this role' : 'No account found with this phone number for this role' 
            });
        }

        let authenticatedUser = null;

        // Try credentials against all potential matches
        for (const u of potentialUsers) {
            try {
                if (password) {
                    if (await u.comparePassword(password)) {
                        authenticatedUser = u;
                        break;
                    }
                } else if (pin) {
                    if (await u.comparePin(pin)) {
                        authenticatedUser = u;
                        break;
                    }
                }
            } catch (err) {
                console.error('[AUTH] Comparison error for user:', u._id, err.message);
            }
        }

        if (!authenticatedUser) {
            return res.status(401).json({ success: false, message: 'Incorrect password or PIN. Please try again.' });
        }

        const user = authenticatedUser;

        // Verification check
        // Note: Some collections might not have isEmailVerified field, so we check if it exists
        const isEmailVerified = user.isEmailVerified !== undefined ? user.isEmailVerified : true;
        const isPhoneVerified = user.isPhoneVerified !== undefined ? user.isPhoneVerified : true;

        if (!isEmailVerified && !isPhoneVerified) {
            return res.status(403).json({ success: false, message: 'Your account is not yet verified.' });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: { 
                id: user._id, 
                name: user.name || user.userName || user.clinicName, 
                email: user.email, 
                role: user.role,
                uhid: user.uhid // Return UHID for patients if available
            }
        });
    } catch (err) {
        console.error('[AUTH] Login error:', err);
        next(err);
    }
};

exports.forgotPasswordRequest = async (req, res, next) => {
    try {
        let { identifier, type } = req.body; // identifier: email or phone, type: 'email' or 'phone'
        
        let normalizedIdentifier = identifier ? identifier.trim() : null;
        let query = {};
        
        if (type === 'email') {
            query.email = normalizedIdentifier.toLowerCase();
        } else {
            // Phone normalization
            let phone = normalizedIdentifier.replace(/[^\d+]/g, '');
            let rawPhone = phone.replace(/^\+91|^91|^0/, '');
            if (rawPhone.length === 10) {
                query.$or = [
                    { phoneNumber: rawPhone },
                    { phoneNumber: '+91' + rawPhone },
                    { phoneNumber: '91' + rawPhone }
                ];
            } else {
                query.phoneNumber = phone;
            }
        }

        // Search across collections
        let user = await User.findOne(query);
        if (!user) user = await Patient.findOne(query);
        if (!user) user = await Clinic.findOne(query);
        if (!user) user = await Admin.findOne(query);

        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this identifier' });
        }

        // Use the actual identifier from the found user record for sending OTP
        const sendTo = type === 'email' ? user.email : user.phoneNumber;
        const result = await sendOTP(type, sendTo);
        
        res.status(200).json({ 
            success: true, 
            message: `Reset code sent via ${type}`, 
            ...result,
            identifier: sendTo // Send back normalized identifier for the reset step
        });
    } catch (err) {
        console.error('[AUTH] Forgot password error:', err);
        next(err);
    }
};

exports.resetCredentials = async (req, res, next) => {
    try {
        let { identifier, type, otp, newPassword, newPin } = req.body;

        const otpRecord = await OTP.findOne({ identifier, type, otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        }

        let normalizedIdentifier = identifier ? identifier.trim() : null;
        let query = {};
        if (type === 'email') {
            query.email = normalizedIdentifier.toLowerCase();
        } else {
            let phone = normalizedIdentifier.replace(/[^\d+]/g, '');
            let rawPhone = phone.replace(/^\+91|^91|^0/, '');
            if (rawPhone.length === 10) {
                query.$or = [
                    { phoneNumber: rawPhone },
                    { phoneNumber: '+91' + rawPhone },
                    { phoneNumber: '91' + rawPhone }
                ];
            } else {
                query.phoneNumber = phone;
            }
        }

        // Update across all matching records to keep identities in sync
        const collections = [User, Patient, Clinic, Admin];
        let updatedCount = 0;

        for (const model of collections) {
            const records = await model.find(query);
            for (const record of records) {
                if (newPassword) record.password = newPassword;
                if (newPin) record.pin = newPin;
                await record.save();
                updatedCount++;
            }
        }

        if (updatedCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found to update' });
        }

        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({ success: true, message: 'Credentials updated successfully' });
    } catch (err) {
        console.error('[AUTH] Reset credentials error:', err);
        next(err);
    }
};
