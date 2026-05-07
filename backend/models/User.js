const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['patient', 'clinic', 'doctor', 'nurse', 'receptionist', 'admin'],
        default: 'patient'
    },
    // Role-specific fields
    clinicName: { type: String, trim: true },
    clinicAddress: { type: String, trim: true },
    specialization: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    clinicCode: { type: String, trim: true }, // For associating staff with clinics
    
    pin: {
        type: String,
        select: false,
        minlength: [4, 'PIN must be at least 4 digits']
    },
    subscriptionStatus: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    aiMonitoringEnabled: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Hash password and pin before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password') && !this.isModified('pin')) return;
    
    try {
        const salt = await bcrypt.genSalt(12);
        
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, salt);
        }
        
        if (this.isModified('pin')) {
            this.pin = await bcrypt.hash(this.pin, salt);
        }
    } catch (err) {
        throw err;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Compare PIN method
userSchema.methods.comparePin = async function(candidatePin) {
    if (!this.pin) return false;
    return await bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model('User', userSchema);
