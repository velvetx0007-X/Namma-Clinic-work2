require('dotenv').config();
const twilio = require('twilio');

async function testTwilioIsolated() {
    console.log('--- TWILIO ISOLATED TEST ---');
    console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID);
    console.log('From Phone:', process.env.TWILIO_PHONE_NUMBER);
    console.log('From WhatsApp:', process.env.TWILIO_WHATSAPP_NUMBER);

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
        console.error('❌ Invalid Account SID');
        process.exit(1);
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const to = '+916382715355'; // User's number
    const code = '123456';

    console.log('\nTrying SMS...');
    try {
        const smsRes = await client.messages.create({
            body: `Namma Clinic Test: ${code}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        console.log('✅ SMS SUCCESS:', smsRes.sid);
    } catch (err) {
        console.error('❌ SMS FAILED:', err.message);
    }

    console.log('\nTrying WhatsApp...');
    try {
        const waRes = await client.messages.create({
            body: `Namma Clinic Test WhatsApp: ${code}`,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${to}`
        });
        console.log('✅ WhatsApp SUCCESS:', waRes.sid);
    } catch (err) {
        console.error('❌ WhatsApp FAILED:', err.message);
    }
}

testTwilioIsolated();
