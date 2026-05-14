const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/User');
const Patient = require('./models/Patient');

dotenv.config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to DB');
        
        const phoneNumber = '6382715355';
        const formattedPhone = '+916382715355';
        
        console.log(`Checking for phoneNumber: ${phoneNumber} or ${formattedPhone}`);

        const user = await User.findOne({ 
            $or: [{ phoneNumber: phoneNumber }, { phoneNumber: formattedPhone }] 
        }).select('+password +pin');
        
        if (user) {
            console.log('\n--- User found in User collection ---');
            console.log(JSON.stringify({
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
                hasPassword: !!user.password,
                hasPin: !!user.pin
            }, null, 2));
        } else {
            console.log('\nUser NOT found in User collection');
        }

        const patient = await Patient.findOne({ 
            $or: [{ phoneNumber: phoneNumber }, { phoneNumber: formattedPhone }] 
        }).select('+password +pin');
        
        if (patient) {
            console.log('\n--- Patient found in Patient collection ---');
            console.log(JSON.stringify({
                id: patient._id,
                name: patient.name,
                email: patient.email,
                phoneNumber: patient.phoneNumber,
                role: patient.role,
                isEmailVerified: patient.isEmailVerified,
                isPhoneVerified: patient.isPhoneVerified,
                hasPassword: !!patient.password,
                hasPin: !!patient.pin
            }, null, 2));
        } else {
            console.log('\nPatient NOT found in Patient collection');
        }

        if (!user && !patient) {
            console.log('\nNo user found with this number in either collection.');
            const allUsers = await User.find({}, 'name phoneNumber role').limit(5);
            console.log('\nRecent Users in DB:', allUsers);
        }

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
