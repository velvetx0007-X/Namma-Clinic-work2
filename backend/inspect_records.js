const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Patient = require('./models/Patient');

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({ phoneNumber: /6382715355/ });
        const patients = await Patient.find({ phoneNumber: /6382715355/ });
        
        console.log('--- USERS ---');
        users.forEach(u => console.log(u));
        
        console.log('\n--- PATIENTS ---');
        patients.forEach(p => console.log(p));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
