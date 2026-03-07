const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const Admin = require('../models/Admin');
const { sendOTP, sendVerificationEmail } = require('../services/verificationService');

// Helper function to generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role: role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
    );
};

// ==================== VERIFICATION ENDPOINTS ====================

// In-memory OTP store for signup (in production, use Redis)
const otpStore = new Map();

// Send OTP to phone number
router.post('/send-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        const result = await sendOTP(phoneNumber);

        // Store OTP temporarily since user isn't created yet
        otpStore.set(phoneNumber, {
            otp: result.otp,
            expiresAt: result.expiresAt
        });

        console.log(`[Dev] OTP for ${phoneNumber} is ${result.otp}`);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp: result.otp // In production, don't send OTP in response
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        if (!phoneNumber || !otp) {
            return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
        }

        // Check if OTP exists in temporary store
        const storedOtpData = otpStore.get(phoneNumber);

        let isValid = false;

        if (storedOtpData) {
            // New user signup flow
            if (storedOtpData.otp === String(otp) && storedOtpData.expiresAt > Date.now()) {
                isValid = true;
                otpStore.delete(phoneNumber); // Clean up
            }
        } else {
            // Existing user flow (password reset, etc.)
            const patient = await Patient.findOne({ phoneNumber });
            if (patient && patient.verificationOTP === String(otp) && patient.otpExpires > Date.now()) {
                isValid = true;
                await Patient.updateOne(
                    { _id: patient._id },
                    {
                        $set: {
                            isPhoneVerified: true,
                            verificationOTP: null,
                            otpExpires: null
                        }
                    }
                );
            }
        }

        if (isValid) {
            return res.status(200).json({ success: true, message: 'Phone verified successfully' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error verifying OTP', error: error.message });
    }
});

// Send Verification Email
router.post('/send-verify-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const result = await sendVerificationEmail(email);

        // Store verification token (use updateOne to avoid validation errors for incomplete records)
        await Patient.updateOne(
            { email },
            { $set: { emailVerificationToken: result.token } }
        );

        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully',
            token: result.token // In production, only send to email
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error sending verification email', error: error.message });
    }
});

// Verify Email
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        const patient = await Patient.findOne({ emailVerificationToken: token });
        if (!patient) {
            return res.status(400).json({ success: false, message: 'Invalid verification token' });
        }

        await Patient.updateOne(
            { _id: patient._id },
            {
                $set: {
                    isEmailVerified: true,
                    emailVerificationToken: null
                }
            }
        );

        res.status(200).send('<h1>Email Verified Successfully!</h1><p>You can now log in to Namma Clinic.</p>');
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error verifying email', error: error.message });
    }
});

// ==================== PATIENT SIGNUP ====================
router.post('/signup/patient', async (req, res) => {
    try {
        const { name, email, password, phoneNumber, area, pin, address, location } = req.body;

        // Validation
        if (!name || !email || !password || !phoneNumber || !area || !pin) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if patient already exists
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.status(400).json({
                success: false,
                message: 'Patient with this email already exists'
            });
        }

        // Create new patient
        const patientData = {
            name,
            email,
            password,
            phoneNumber,
            area,
            pin,
            address,
            location: location || { lat: 13.0827, lng: 80.2707 }
        };

        const patient = new Patient(patientData);
        await patient.save();

        // Generate token
        const token = generateToken(patient._id, 'patient');

        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            token,
            user: {
                id: patient._id,
                name: patient.name,
                email: patient.email,
                role: 'patient',
                location: patient.location
            }
        });
    } catch (error) {
        console.error('Patient signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering patient',
            error: error.message
        });
    }
});

// ==================== CLINIC SIGNUP ====================
router.post('/signup/clinic', async (req, res) => {
    try {
        const {
            clinicName,
            userName,
            phoneNumber,
            email,
            password,
            clinicRegistrationNumber,
            issuedArea,
            userType,
            nmrNumber,
            nuid,
            employeeCode,
            pin,
            address,
            pincode
        } = req.body;

        // Basic validation
        if (!clinicName || !userName || !phoneNumber || !email || !password ||
            !clinicRegistrationNumber || !userType || !pin) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate userType-specific fields
        if (userType === 'doctor' && !nmrNumber) {
            return res.status(400).json({
                success: false,
                message: 'NMR Number is required for doctors'
            });
        }

        if (userType === 'nurse' && !nuid) {
            return res.status(400).json({
                success: false,
                message: 'NUID is required for nurses'
            });
        }

        if (userType === 'receptionist' && !employeeCode) {
            return res.status(400).json({
                success: false,
                message: 'Employee Code is required for receptionists'
            });
        }

        // Check if clinic user already exists (by email only)
        const existingClinic = await Clinic.findOne({ email });

        if (existingClinic) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new clinic
        const clinicData = {
            clinicName,
            userName,
            phoneNumber,
            email,
            password,
            clinicRegistrationNumber,
            issuedArea,
            userType,
            pin,
            address,
            pincode
        };

        // Add conditional fields
        if (userType === 'doctor') clinicData.nmrNumber = nmrNumber;
        if (userType === 'nurse') clinicData.nuid = nuid;
        if (userType === 'receptionist') clinicData.employeeCode = employeeCode;

        const clinic = new Clinic(clinicData);
        await clinic.save();

        // Generate token
        const token = generateToken(clinic._id, 'clinic');

        res.status(201).json({
            success: true,
            message: 'Clinic registered successfully',
            token,
            user: {
                id: clinic._id,
                clinicName: clinic.clinicName,
                email: clinic.email,
                userType: clinic.userType,
                role: 'clinic'
            }
        });
    } catch (error) {
        console.error('Clinic signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering clinic',
            error: error.message
        });
    }
});

// ==================== ADMIN SIGNUP ====================
router.post('/signup/admin', async (req, res) => {
    try {
        const { name, email, password, companyName, companyId, pin } = req.body;

        // Validation
        if (!name || !email || !password || !companyName || !companyId || !pin) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ email }, { companyId }]
        });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email or company ID already exists'
            });
        }

        // Create new admin
        const admin = new Admin({
            name,
            email,
            password,
            companyName,
            companyId,
            pin
        });

        await admin.save();

        // Generate token
        const token = generateToken(admin._id, 'admin');

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                companyName: admin.companyName,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Admin signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering admin',
            error: error.message
        });
    }
});

// ==================== LOGIN (Universal for all user types) ====================
router.post('/login', async (req, res) => {
    try {
        const { email, password, role, pin } = req.body;

        // Validation
        if (!email || !role || (!password && !pin)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, role, and either password or PIN'
            });
        }

        let user;
        let Model;

        // Select the appropriate model based on role
        switch (role) {
            case 'patient':
                Model = Patient;
                break;
            case 'clinic':
                Model = Clinic;
                break;
            case 'admin':
                Model = Admin;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role specified'
                });
        }

        // Find user by email
        user = await Model.findOne({ email });

        console.log(`Login attempt: email=${email}, role=${role}, hasPassword=${!!password}, hasPin=${!!pin}`);

        if (!user) {
            console.log(`User not found: email=${email}, role=${role}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password or PIN
        let isValid = false;
        if (password) {
            isValid = await user.comparePassword(password);
            console.log(`Password check: isValid=${isValid}`);
        } else if (pin) {
            isValid = await user.comparePin(pin);
            console.log(`PIN check: isValid=${isValid}`);
        }

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id, role);

        // Prepare user data based on role
        let userData = {
            id: user._id,
            email: user.email,
            role: role
        };

        if (role === 'patient') {
            userData.name = user.name;
            userData.age = user.age;
        } else if (role === 'clinic') {
            userData.clinicName = user.clinicName;
            userData.userName = user.userName; // added userName
            userData.userType = user.userType;
            userData.age = user.age;
            if (user.userType === 'doctor') userData.nmrNumber = user.nmrNumber;
            if (user.userType === 'nurse') userData.nuid = user.nuid;
            if (user.userType === 'receptionist') userData.employeeCode = user.employeeCode;
        } else if (role === 'admin') {
            userData.name = user.name;
            userData.companyName = user.companyName;
            userData.age = user.age;
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
});

module.exports = router;
