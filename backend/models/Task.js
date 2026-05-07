const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    type: {
        type: String,
        enum: ['Medication', 'Appointment', 'Lab Test', 'General Message'],
        default: 'General Message'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'acknowledged', 'completed'],
        default: 'pending'
    },
    dueDate: {
        type: Date
    },
    aiSuggestion: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed // For extra context like prescription ID, etc.
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
