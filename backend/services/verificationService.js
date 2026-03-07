const crypto = require('crypto');

/**
 * Simulated OTP Service
 * In a real-world scenario, you would use Twilio, AWS SNS, or a similar service.
 */
const sendOTP = async (phoneNumber) => {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`[MOCK OTP SERVICE] Sending OTP ${otp} to ${phoneNumber}`);

    // In production, you would call the SMS API here
    return {
        success: true,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
    };
};

/**
 * Simulated Email Verification Service
 * In a real-world scenario, you would use Nodemailer with SendGrid, Mailgun, or AWS SES.
 */
const sendVerificationEmail = async (email) => {
    const token = crypto.randomBytes(32).toString('hex');

    console.log(`[MOCK EMAIL SERVICE] Sending verification link to ${email}`);
    console.log(`[MOCK EMAIL SERVICE] Link: http://localhost:5000/api/auth/verify-email?token=${token}`);

    return {
        success: true,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours expiry
    };
};

module.exports = {
    sendOTP,
    sendVerificationEmail
};
