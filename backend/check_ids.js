const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

async function checkIds() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        
        console.log('--- USERS ---');
        const users = await db.collection('users').find({}).limit(5).toArray();
        users.forEach(u => console.log(`ID: ${u._id}, Name: ${u.name}, Role: ${u.role}, Email: ${u.email}`));

        console.log('--- CLINICS ---');
        const clinics = await db.collection('clinics').find({}).limit(5).toArray();
        clinics.forEach(c => console.log(`ID: ${c._id}, Name: ${c.clinicName}, Email: ${c.email}`));

        console.log('--- PATIENTS ---');
        const patients = await db.collection('patients').find({}).limit(5).toArray();
        patients.forEach(p => console.log(`ID: ${p._id}, Name: ${p.name}, Email: ${p.email}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkIds();
