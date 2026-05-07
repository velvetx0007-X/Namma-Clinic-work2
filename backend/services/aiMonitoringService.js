const cron = require('node-cron');
const User = require('../models/User');
const { sendNotification } = require('./notificationService');

/**
 * AI Monitoring Service
 * Periodically checks for users with AI monitoring enabled and sends reminders
 */
const startAIWatcher = () => {
    console.log('🤖 AI Health Watcher started...');

    // Runs every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('⏰ Running daily AI Health Reminders...');
        try {
            const users = await User.find({ 
                aiMonitoringEnabled: true,
                subscriptionStatus: 'premium'
            });

            for (const user of users) {
                await sendNotification(user._id, {
                    title: 'Daily Health Tip',
                    text: `Good morning! Remember to stay hydrated and take a 5-minute walk today. Your AI Health Assistant is watching!`,
                    type: 'ai_reminder'
                }, false);
            }
        } catch (err) {
            console.error('AI Watcher Error:', err);
        }
    });

    // Runs every 4 hours for medication check-ins (simulated)
    cron.schedule('0 */4 * * *', async () => {
        // ... (existing logic)
    });

    // Evening Yoga Reminder (6:00 PM)
    cron.schedule('0 18 * * *', async () => {
        console.log('🧘 Running evening Yoga reminders...');
        try {
            const users = await User.find({ aiMonitoringEnabled: true });
            for (const user of users) {
                await sendNotification(user._id, {
                    title: 'Evening Yoga Session',
                    text: 'It\'s time for your calming evening yoga. Try the "Child\'s Pose" for 2 minutes to reduce stress before dinner.',
                    type: 'ai_reminder'
                }, false);
            }
        } catch (err) {
            console.error('Yoga Reminder Error:', err);
        }
    });
};

module.exports = { startAIWatcher };
