const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
    validateSignup, 
    validateLogin, 
    validateOTP, 
    validateEmailOTPRequest, 
    validatePhoneOTPRequest,
    validateForgotPassword,
    validateReset
} = require('../middleware/validator');
const { otpLimiter, loginLimiter } = require('../middleware/rateLimiter');

// OTP Routes
router.post('/send-email-otp', otpLimiter, validateEmailOTPRequest, authController.requestEmailOTP);
router.post('/send-phone-otp', otpLimiter, validatePhoneOTPRequest, authController.requestPhoneOTP);
router.post('/verify-otp', validateOTP, authController.verifyOTP);

// Auth Routes
router.post('/signup', validateSignup, authController.signup);
router.post('/login', loginLimiter, validateLogin, authController.login);

// Password/PIN Reset Routes
router.post('/forgot-password', otpLimiter, validateForgotPassword, authController.forgotPasswordRequest);
router.post('/reset-credentials', validateReset, authController.resetCredentials);

module.exports = router;
