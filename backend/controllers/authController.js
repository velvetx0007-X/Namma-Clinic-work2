const User = require('../models/User');
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
        const { identifier, email, phoneNumber, password, pin, role } = req.body;

        // Support login by either email or phone number
        const query = { role };
        
        if (identifier) {
            // Check if identifier is an email
            if (identifier.includes('@')) {
                query.email = identifier.toLowerCase();
            } else {
                // Assume it's a phone number (strip whitespace, ensure consistency if needed)
                // If it doesn't start with +, and we expect country codes, this might need more logic
                // But for now, we'll search directly
                query.phoneNumber = identifier;
            }
        } else if (phoneNumber) {
            query.phoneNumber = phoneNumber;
        } else if (email) {
            query.email = email.toLowerCase();
        } else {
            return res.status(400).json({ success: false, message: 'Email or phone number is required' });
        }

        const user = await User.findOne(query).select('+password +pin');

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found or role mismatch' });
        }

        if (password) {
            if (!(await user.comparePassword(password))) {
                return res.status(401).json({ success: false, message: 'Invalid password' });
            }
        } else if (pin) {
            if (!(await user.comparePin(pin))) {
                return res.status(401).json({ success: false, message: 'Invalid PIN' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Password or PIN required' });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({ success: false, message: 'Account not verified' });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        next(err);
    }
};

exports.forgotPasswordRequest = async (req, res, next) => {
    try {
        const { identifier, type } = req.body; // identifier: email or phone, type: 'email' or 'phone'
        
        const query = type === 'email' ? { email: identifier } : { phoneNumber: identifier };
        const user = await User.findOne(query);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const result = await sendOTP(type, identifier);
        res.status(200).json({ success: true, message: `Reset code sent via ${type}`, ...result });
    } catch (err) {
        next(err);
    }
};

exports.resetCredentials = async (req, res, next) => {
    try {
        const { identifier, type, otp, newPassword, newPin } = req.body;

        const otpRecord = await OTP.findOne({ identifier, type, otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        }

        const query = type === 'email' ? { email: identifier } : { phoneNumber: identifier };
        const user = await User.findOne(query);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (newPassword) user.password = newPassword;
        if (newPin) user.pin = newPin;

        await user.save();
        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({ success: true, message: 'Credentials updated successfully' });
    } catch (err) {
        next(err);
    }
};
