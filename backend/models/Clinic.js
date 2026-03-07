const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Clinic Schema Definition
const clinicSchema = new mongoose.Schema({
    clinicName: {
        type: String,
        required: [true, 'Clinic name is required'],
        trim: true
    },
    userName: {
        type: String,
        required: [true, 'User name is required'],
        trim: true
    },
    contactName: {
        type: String,
        required: false,
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
    phoneNumber: {
        type: String,
        trim: true,
        default: ''
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    clinicRegistrationNumber: {
        type: String,
        required: [true, 'Clinic registration number is required'],
        trim: true
    },
    issuedArea: {
        type: String,
        trim: true,
        default: ''
    },
    userType: {
        type: String,
        required: [true, 'User type is required'],
        enum: ['doctor', 'nurse', 'receptionist', 'admin'],
        lowercase: true
    },
    // Conditional fields based on userType
    nmrNumber: {
        type: String,
        trim: true,
        // Required only if userType is 'doctor'
        required: function () {
            return this.userType === 'doctor';
        }
    },
    nuid: {
        type: String,
        trim: true,
        // Required only if userType is 'nurse'
        required: function () {
            return this.userType === 'nurse';
        }
    },
    employeeCode: {
        type: String,
        trim: true,
        // Required only if userType is 'receptionist'
        required: false
    },
    role: {
        type: String,
        default: 'clinic'
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    specialization: {
        type: String,
        trim: true
    },
    age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [150, 'Please provide a valid age']
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    pincode: {
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
    pin: {
        type: String,
        required: [true, 'PIN is required'],
        minlength: [4, 'PIN must be 4 digits']
    }
}, {
    timestamps: true
});

// Hash password before saving
// Hash password and PIN before saving
clinicSchema.pre('save', async function () {
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
clinicSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare PIN
clinicSchema.methods.comparePin = async function (candidatePin) {
    return await bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model('Clinic', clinicSchema);
