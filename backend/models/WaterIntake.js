const mongoose = require('mongoose');

const waterIntakeSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    amount: { type: Number, default: 0 },    // in liters
    goal: { type: Number, default: 2.5 }     // in liters
}, {
    timestamps: true
});

// Compound index for fast lookup
waterIntakeSchema.index({ patientId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WaterIntake', waterIntakeSchema);
