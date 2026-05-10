const mongoose = require('mongoose');

const wellnessTaskSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    tasks: [{
        title: { type: String, required: true },
        description: { type: String },
        type: { 
            type: String, 
            enum: ['Yoga', 'Walking', 'Meditation', 'Stretching', 'Breathing', 'Sleep', 'Water', 'Posture', 'Eye Care', 'Diet'],
            required: true 
        },
        status: { 
            type: String, 
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending' 
        },
        startTime: { type: Date },
        endTime: { type: Date },
        duration: { type: Number, default: 0 }, // in minutes
        progress: { type: Number, default: 0 }  // 0 to 100
    }]
}, {
    timestamps: true
});

// Index for performance
wellnessTaskSchema.index({ patientId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WellnessTask', wellnessTaskSchema);
