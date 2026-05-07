const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Upgrade to Premium (Mock)
router.post('/upgrade', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { subscriptionStatus: 'premium' },
            { new: true }
        );
        res.json({
            success: true,
            message: 'Successfully upgraded to Premium!',
            subscriptionStatus: user.subscriptionStatus
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle AI Monitoring
router.post('/toggle-ai', auth, async (req, res) => {
    const { enabled } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { aiMonitoringEnabled: enabled },
            { new: true }
        );
        res.json({
            success: true,
            message: `AI Monitoring ${enabled ? 'enabled' : 'disabled'}`,
            aiMonitoringEnabled: user.aiMonitoringEnabled
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
