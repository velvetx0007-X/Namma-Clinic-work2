const nodemailer = require('nodemailer');
const twilio = require('twilio');
const OTP = require('../models/OTP');

// Initialize Twilio safely
let twilioClient;
try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        console.log('✅ Twilio Client Initialized');
    } else {
        console.warn('⚠️ Twilio credentials missing or invalid. OTP will be LOGGED TO CONSOLE instead.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Twilio client:', error.message);
}

// Initialize Nodemailer safely
let transporter;
try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // Verify connection configuration
        transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Nodemailer Verification Error:', error.message);
                console.log('💡 [TIP] Check if "Less secure app access" or "App Password" is required for Gmail.');
            } else {
                console.log('✅ SMTP Server is ready to send emails');
            }
        });
    } else {
        console.warn('⚠️ SMTP credentials missing in .env. Email OTP will be logged to console instead.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Nodemailer transporter:', error.message);
}

/**
 * Format phone number to E.164 (defaults to India +91 if 10 digits)
 */
const formatPhoneNumber = (number) => {
    if (!number) return number;
    let cleaned = number.toString().replace(/[^\d+]/g, '');
    if (cleaned.length === 10 && !cleaned.startsWith('+')) return `+91${cleaned}`;
    if (cleaned.startsWith('91') && cleaned.length === 12 && !cleaned.startsWith('+')) return `+${cleaned}`;
    if (cleaned && !cleaned.startsWith('+')) return `+${cleaned}`;
    return cleaned;
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmailOTP = async (email, otp) => {
    if (!transporter) {
        console.warn(`📩 Simulated Email to ${email}: Code is ${otp}`);
        return Promise.resolve();
    }
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: '🔐 Your Namma Clinic Verification Code',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px; color: #333; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #E53935; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Namma Clinic</h1>
                    <p style="color: #1E88E5; font-weight: 700; text-transform: uppercase; font-size: 12px; margin-top: 5px; letter-spacing: 1px;">Clinical Excellence & Care</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 30px; border-radius: 16px; text-align: center;">
                    <p style="font-size: 16px; margin-bottom: 20px; color: #555;">Hello,</p>
                    <p style="font-size: 18px; color: #333; font-weight: 500;">Your verification code for Namma Clinic is:</p>
                    <div style="font-size: 42px; font-weight: 900; color: #1E88E5; margin: 25px 0; letter-spacing: 8px;">${otp}</div>
                    <p style="font-size: 14px; color: #757575;">This code is valid for <b>2 minutes</b>. Please do not share this with anyone.</p>
                </div>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 15px; font-style: italic; color: #43A047; font-weight: 600; text-align: center;">
                        "Your health is our heartbeat. Thank you for choosing Namma Clinic for your healthcare journey."
                    </p>
                    <p style="font-size: 13px; color: #9E9E9E; margin-top: 20px; text-align: center;">
                        <b>Disclaimer:</b> This is an automated clinical notification. If you did not request this code, please secure your account immediately.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`❌ SMTP Error sending to ${email}:`, error.message);
        console.log(`💡 [DEV] Use this OTP to proceed: ${otp}`);
        return Promise.resolve();
    }
};

const sendSMSOTP = async (phoneNumber, otp) => {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!twilioClient) {
        console.warn(`📱 Simulated SMS to ${formattedNumber}: Code is ${otp}`);
        return Promise.resolve();
    }
    return twilioClient.messages.create({
        body: `Namma Clinic: Your verification code is ${otp}. Valid for 2 mins. Your health is our priority!`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber
    });
};

const sendWhatsAppOTP = async (phoneNumber, otp) => {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!twilioClient) {
        console.warn(`💬 Simulated WhatsApp to ${formattedNumber}: Code is ${otp}`);
        return Promise.resolve();
    }
    
    // Ensure numbers are in E.164 and prefixed correctly for WhatsApp
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:') 
        ? process.env.TWILIO_WHATSAPP_NUMBER 
        : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
    
    const toNumber = formattedNumber.startsWith('whatsapp:') 
        ? formattedNumber 
        : `whatsapp:${formattedNumber}`;

    return twilioClient.messages.create({
        body: `🏥 Namma Clinic Verification\n\nYour code is: *${otp}*\nValid for 2 minutes.\n\nWe look forward to serving you!`,
        from: fromNumber,
        to: toNumber
    });
};

const sendOTP = async (type, identifier) => {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // reduced to 2 minutes

    // Store OTP in database
    console.log(`💾 Persisting ${type} OTP for ${identifier}...`);
    try {
        await OTP.findOneAndUpdate(
            { identifier, type },
            { otp, expiresAt, isVerified: false },
            { upsert: true, new: true, maxTimeMS: 5000 } // 5s timeout
        );
        console.log(`✅ OTP Persisted successfully.`);
    } catch (dbError) {
        console.error(`❌ Database Error persisting OTP:`, dbError.message);
        // We continue in dev so it's not fatal
    }

    let result;
    if (type === 'email') {
        result = await sendEmailOTP(identifier, otp);
    } else if (type === 'phone') {
        console.log(`📱 Sending Phone OTP to: ${identifier}`);
        // Send via both SMS and WhatsApp for phone
        const results = await Promise.allSettled([
            sendSMSOTP(identifier, otp),
            sendWhatsAppOTP(identifier, otp)
        ]);
        
        results.forEach((res, index) => {
            const channel = index === 0 ? 'SMS' : 'WhatsApp';
            if (res.status === 'rejected') {
                console.error(`❌ Twilio ${channel} Error:`, res.reason.message);
            } else {
                console.log(`✅ Twilio ${channel} sent successfully!`);
            }
        });
        result = results;
    }

    return { 
        success: true, 
        otp: process.env.NODE_ENV === 'development' ? otp : undefined 
    };
};

module.exports = {
    sendOTP,
    generateOTP
};
