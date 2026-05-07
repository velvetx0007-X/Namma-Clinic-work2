const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['appointment', 'lab_result', 'consultation', 'ai_reminder', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        enum: ['in_app', 'email', 'sms', 'push'],
        default: 'in_app'
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'dismissed'],
        default: 'unread'
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // ID of appointment/lab test/etc
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        enum: ['Appointment', 'LabTest', 'Prescription']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
