const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin Schema Definition
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    companyId: {
        type: String,
        required: [true, 'Company ID is required'],
        unique: true,
        trim: true
    },
    age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [150, 'Please provide a valid age']
    },
    pin: {
        type: String,
        required: [true, 'PIN is required'],
        minlength: [4, 'PIN must be 4 digits']
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    loginAlerts: {
        type: Boolean,
        default: true
    },
    notificationPreferences: {
        appointments: { type: Boolean, default: true },
        testResults: { type: Boolean, default: true },
        consultationUpdates: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true }
    },
    dndMode: {
        enabled: { type: Boolean, default: false },
        from: { type: String, default: '22:00' },
        to: { type: String, default: '08:00' }
    },
    teamAccess: [{
        memberName: String,
        role: String,
        permission: {
            type: String,
            enum: ['Full Access', 'View Only', 'Restricted'],
            default: 'View Only'
        }
    }]
}, {
    timestamps: true
});

// Hash password before saving
// Hash password and PIN before saving
adminSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified('pin')) {
        const salt = await bcrypt.genSalt(10);
        this.pin = await bcrypt.hash(this.pin, salt);
    }
});

// Method to compare password for login
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare PIN
adminSchema.methods.comparePin = async function (candidatePin) {
    return await bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model('Admin', adminSchema);
