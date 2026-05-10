const mongoose = require('mongoose');

const childGrowthRecordSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    milestone: { type: String },
    notes: { type: String }
});

const childCareSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    childName: { type: String, required: true },
    childDob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String },
    growthRecords: [childGrowthRecordSchema],
    vaccinations: [{
        name: { type: String },
        dueDate: { type: Date },
        administeredDate: { type: Date },
        status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
    }],
    aiInsights: [{
        date: { type: Date, default: Date.now },
        topic: { type: String },
        suggestion: { type: String }
    }]
}, {
    timestamps: true
});

childCareSchema.index({ parentId: 1 });

module.exports = mongoose.model('ChildCare', childCareSchema);
