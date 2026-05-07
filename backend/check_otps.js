const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

async function checkOTPs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        
        console.log('--- RECENT OTPS ---');
        const otps = await db.collection('otps').find({}).sort({ createdAt: -1 }).limit(10).toArray();
        otps.forEach(o => {
            console.log(`Identifier: "${o.identifier}", OTP: "${o.otp}", Type: ${o.type}, Verified: ${o.isVerified}, ExpiresAt: ${o.expiresAt}, CreatedAt: ${o.createdAt}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkOTPs();
