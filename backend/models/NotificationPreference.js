const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: true },
    appointmentNotifications: { type: Boolean, default: true },
    labResults: { type: Boolean, default: true },
    consultationUpdates: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
    doNotDisturb: { type: Boolean, default: false },
    dndSettings: {
        startTime: { type: String, default: '22:00' },
        endTime: { type: String, default: '07:00' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
