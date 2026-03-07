const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Patient Schema Definition
const patientSchema = new mongoose.Schema({
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
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    area: {
        type: String,
        required: [true, 'Area is required'],
        trim: true
    },
    role: {
        type: String,
        default: 'patient'
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    uhid: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    bloodGroup: {
        type: String,
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
    address: {
        type: String,
        trim: true,
        default: ''
    },
    location: {
        lat: {
            type: Number,
            default: 13.0827
        },
        lng: {
            type: Number,
            default: 80.2707
        }
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    verificationOTP: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    dob: {
        type: Date
    },
    allergies: {
        type: String,
        trim: true,
        default: 'None reported'
    },
    medicalHistory: {
        type: String,
        trim: true,
        default: 'No history available'
    },
    emergencyContact: {
        name: {
            type: String,
            trim: true,
            default: ''
        },
        phone: {
            type: String,
            trim: true,
            default: ''
        },
        relationship: {
            type: String,
            trim: true,
            default: ''
        }
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Pre-save hook for UHID generation and hashing
patientSchema.pre('save', async function () {
    // Generate UHID if not provided
    if (!this.uhid) {
        this.uhid = 'UHID' + Math.floor(100000 + Math.random() * 900000);
    }

    // Hash password if modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // Hash PIN if modified
    if (this.isModified('pin')) {
        const salt = await bcrypt.genSalt(10);
        this.pin = await bcrypt.hash(this.pin, salt);
    }
});

// Method to compare password for login
patientSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare PIN
patientSchema.methods.comparePin = async function (candidatePin) {
    return await bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model('Patient', patientSchema);
