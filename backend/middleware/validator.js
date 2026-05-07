const { body, validationResult } = require('express-validator');

const validateSignup = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateLogin = [
    body('identifier').notEmpty().withMessage('Email or Phone number is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('password').optional().notEmpty().withMessage('Password must not be empty'),
    body('pin').optional().isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        if (!req.body.password && !req.body.pin) {
            return res.status(400).json({ success: false, message: 'Password or PIN is required' });
        }
        next();
    }
];

const validateEmailOTPRequest = [
    body('email').isEmail().withMessage('Invalid email address'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validatePhoneOTPRequest = [
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateOTP = [
    body('identifier').notEmpty().withMessage('Identifier is required'),
    body('type').isIn(['email', 'phone']).withMessage('Invalid verification type'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateForgotPassword = [
    body('identifier').notEmpty().withMessage('Identifier is required'),
    body('type').isIn(['email', 'phone']).withMessage('Invalid type'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateReset = [
    body('identifier').notEmpty().withMessage('Identifier is required'),
    body('type').isIn(['email', 'phone']).withMessage('Invalid type'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('newPin').optional().isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        if (!req.body.newPassword && !req.body.newPin) {
            return res.status(400).json({ success: false, message: 'New Password or PIN is required' });
        }
        next();
    }
];

module.exports = {
    validateSignup,
    validateLogin,
    validateOTP,
    validateEmailOTPRequest,
    validatePhoneOTPRequest,
    validateForgotPassword,
    validateReset
};
