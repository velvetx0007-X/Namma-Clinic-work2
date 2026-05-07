const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

async function count() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        
        const collections = ['users', 'patients', 'clinics', 'admins'];
        for (const col of collections) {
            const count = await db.collection(col).countDocuments();
            console.log(`${col}: ${count}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
count();
