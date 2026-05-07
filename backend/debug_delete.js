const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
const User = require('./models/User');
const Patient = require('./models/Patient');
const Clinic = require('./models/Clinic');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const PatientRecord = require('./models/PatientRecord');
const Vitals = require('./models/Vitals');
const Consultation = require('./models/Consultation');
const Billing = require('./models/Billing');
const MedicationLog = require('./models/MedicationLog');
const LabTest = require('./models/LabTest');
const Communication = require('./models/Communication');
const Review = require('./models/Review');

async function debugDelete(userId, role) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Model = role === 'patient' ? Patient : Clinic;
        const userDetails = await Model.findById(userId);
        
        if (!userDetails) {
            console.error('User not found in role-specific collection');
            return;
        }
        console.log('User found:', userDetails.email);

        const tasks = [
            { name: 'Appointment', query: role === 'patient' ? { patientId: userId } : { doctorId: userId }, model: Appointment },
            { name: 'Prescription', query: role === 'patient' ? { patientId: userId } : { doctorId: userId }, model: Prescription },
            { name: 'PatientRecord', query: role === 'patient' ? { patientId: userId } : { createdBy: userId }, model: PatientRecord },
            { name: 'Vitals', query: { patientId: userId }, model: Vitals },
            { name: 'Consultation', query: role === 'patient' ? { patientId: userId } : { doctorId: userId }, model: Consultation },
            { name: 'Billing', query: role === 'patient' ? { patientId: userId } : { createdBy: userId }, model: Billing },
            { name: 'MedicationLog', query: role === 'patient' ? { patientId: userId } : { administeredBy: userId }, model: MedicationLog },
            { name: 'LabTest', query: role === 'patient' ? { patientId: userId } : { orderedBy: userId }, model: LabTest },
            { name: 'Communication', query: { $or: [{ senderId: userId }, { receiverId: userId }] }, model: Communication },
            { name: 'Review', query: role === 'patient' ? { patientId: userId } : { clinicId: userId }, model: Review }
        ];

        for (const task of tasks) {
            try {
                const count = await task.model.countDocuments(task.query);
                console.log(`[PASS] ${task.name}: Found ${count} records to delete.`);
            } catch (err) {
                console.error(`[FAIL] ${task.name}: Error during count/query - ${err.message}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
}

// Usage: node debug_delete.js <userId> <role>
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Please provide userId and role');
    process.exit(1);
}
debugDelete(args[0], args[1]);
