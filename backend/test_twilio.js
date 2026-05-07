const mongoose = require('mongoose');
require('dotenv').config();
const { sendOTP } = require('./services/otpService');

async function testTwilio() {
    console.log('Connecting to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected.');
        
        console.log('Testing Twilio SMS/WhatsApp OTP...');
        const result = await sendOTP('phone', '+916382715355');
        console.log('Test completed. Check logs above for success/failure.');
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Test failed with error:', error.message);
        process.exit(1);
    }
}

testTwilio();
