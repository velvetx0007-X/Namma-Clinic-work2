const mongoose = require('mongoose');

const stepTrackingSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    steps: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },   // in km
    calories: { type: Number, default: 0 },
    fatLoss: { type: Number, default: 0 },    // in grams
    duration: { type: Number, default: 0 },   // in seconds
    height: { type: Number, default: 165 }    // in cm for stride calculation
}, {
    timestamps: true
});

// Compound index for fast lookup
stepTrackingSchema.index({ patientId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StepTracking', stepTrackingSchema);
