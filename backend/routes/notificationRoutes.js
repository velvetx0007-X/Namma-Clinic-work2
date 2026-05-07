const express = require('express');
const router = express.Router();
const NotificationPreference = require('../models/NotificationPreference');
const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const auth = require('../middleware/auth');

// Get notification preferences for a user
router.get('/:userId', async (req, res) => {
    try {
        let prefs = await NotificationPreference.findOne({ userId: req.params.userId });
        if (!prefs) {
            // Create default preferences if not found
            prefs = await NotificationPreference.create({ userId: req.params.userId });
        }
        res.json(prefs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update notification preferences
router.post('/update', async (req, res) => {
    const { userId, ...updates } = req.body;
    try {
        const prefs = await NotificationPreference.findOneAndUpdate(
            { userId },
            { $set: updates },
            { new: true, upsert: true }
        );
        res.json(prefs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Notification History Routes ---

// Get all notifications for a user
router.get('/history/:userId', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark notification as read
router.patch('/read/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { status: 'read' },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark all as read
router.patch('/read-all/:userId', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.params.userId, status: 'unread' },
            { status: 'read' }
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete/Clear notifications
router.delete('/clear/:userId', auth, async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.params.userId });
        res.json({ success: true, message: 'Notification history cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Subscribe to Web Push
router.post('/subscribe', auth, async (req, res) => {
    const { subscription, userAgent, deviceType } = req.body;
    
    try {
        await PushSubscription.findOneAndUpdate(
            { userId: req.user.id, 'subscription.endpoint': subscription.endpoint },
            { 
                subscription,
                userAgent,
                deviceType: deviceType || 'desktop'
            },
            { upsert: true, new: true }
        );
        res.status(201).json({ success: true, message: 'Subscribed to push notifications' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
