const nodemailer = require('nodemailer');
const twilio = require('twilio');
const webpush = require('web-push');
const NotificationPreference = require('../models/NotificationPreference');
const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const User = require('../models/User');

// Initialize Transports (Safely)
let twilioClient;
try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
} catch (err) { console.error('NotificationService: Twilio init failed'); }

let transporter;
try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
    }
} catch (err) { console.error('NotificationService: Nodemailer init failed'); }

// --- Web Push Setup (Placeholders for VAPID Keys) ---
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:support@nammaclinic.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

/**
 * Format phone number to E.164 (defaults to India +91 if 10 digits)
 */
const formatPhoneNumber = (number) => {
    if (!number) return number;
    let cleaned = number.toString().replace(/[^\d+]/g, '');
    if (cleaned.length === 10 && !cleaned.startsWith('+')) return `+91${cleaned}`;
    if (cleaned.startsWith('91') && cleaned.length === 12 && !cleaned.startsWith('+')) return `+${cleaned}`;
    if (cleaned && !cleaned.startsWith('+')) return `+${cleaned}`;
    return cleaned;
};

/**
 * Check if the user is currently in DND mode based on their time range
 */
const isWithinDND = (prefs) => {
    if (!prefs || !prefs.doNotDisturb) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startH, startM] = prefs.dndSettings.startTime.split(':').map(Number);
    const [endH, endM] = prefs.dndSettings.endTime.split(':').map(Number);
    
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;
    
    if (startTime < endTime) {
        return currentTime >= startTime && currentTime <= endTime;
    } else {
        // Range spans across midnight (e.g., 22:00 to 07:00)
        return currentTime >= startTime || currentTime <= endTime;
    }
};

/**
 * Enhanced notification dispatcher
 * @param {string} userIdOrEmail - ID or Email of the user
 * @param {Object} data - { subject, title, text, type, relatedId, onModel }
 * @param {boolean} isCritical - If true, bypasses DND
 */
const sendNotification = async (userIdOrEmail, data, isCritical = false) => {
    const { subject, title, text, type, relatedId, onModel } = data;
    
    try {
        let user;
        if (userIdOrEmail.includes('@')) {
            user = await User.findOne({ email: userIdOrEmail }).select('_id email phoneNumber');
        } else {
            user = await User.findById(userIdOrEmail).select('_id email phoneNumber');
        }

        if (!user) return { success: false, reason: 'USER_NOT_FOUND' };

        const userId = user._id;
        const prefs = await NotificationPreference.findOne({ userId });
        
        // 1. Check DND
        const dndActive = isWithinDND(prefs);
        if (dndActive && !isCritical) {
            console.log(`DND active for ${userId}. Notification queued/delayed.`);
            // In a production app, we would queue this for later. 
            // For now, we'll still save to history but skip direct alerts (SMS/Email/Push).
        }

        // 2. Map type to preference field
        const prefKeyMap = {
            'appointment': 'appointmentNotifications',
            'lab_result': 'labResults',
            'consultation': 'consultationUpdates',
            'ai_reminder': 'aiMonitoringEnabled' // Check user monitoring status
        };

        const results = { history: 'saved', email: null, sms: null, push: null };

        // 3. Always Save to In-App History
        try {
            await Notification.create({
                userId,
                type: type || 'system',
                title: title || subject || 'Notification',
                message: text,
                channel: 'in_app',
                status: 'unread',
                relatedId,
                onModel
            });
        } catch (e) { results.history = 'failed'; }

        // If DND is active and not critical, we stop here for direct channels
        if (dndActive && !isCritical) return { success: true, results, status: 'deferred_by_dnd' };

        // 4. Send Email
        if (prefs ? prefs.emailAlerts : true) {
            if (transporter) {
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                        to: user.email,
                        subject: subject || title,
                        text: text
                    });
                    results.email = 'sent';
                } catch (e) { results.email = 'failed'; }
            } else { results.email = 'simulated'; }
        }

        // 5. Send SMS
        if (prefs ? prefs.smsAlerts : true) {
            if (twilioClient && user.phoneNumber) {
                const formattedNumber = formatPhoneNumber(user.phoneNumber);
                try {
                    await twilioClient.messages.create({
                        body: text,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: formattedNumber
                    });
                    results.sms = 'sent';
                } catch (e) { 
                    console.error(`SMS Failed for ${formattedNumber}:`, e.message);
                    results.sms = 'failed'; 
                }
            } else { results.sms = 'simulated'; }
        }

        // 6. Send Push (Real Implementation)
        if (prefs?.pushNotifications) {
            try {
                const pushSubs = await PushSubscription.find({ userId });
                if (pushSubs.length > 0) {
                    const pushPayload = JSON.stringify({
                        title: title || subject || 'Namma Clinic',
                        body: text,
                        icon: '/logo192.png', // Assuming default logo path
                        data: {
                            url: '/dashboard', // Can be made dynamic
                            relatedId,
                            onModel
                        }
                    });

                    const pushPromises = pushSubs.map(sub => 
                        webpush.sendNotification(sub.subscription, pushPayload)
                            .catch(err => {
                                if (err.statusCode === 410 || err.statusCode === 404) {
                                    // Subscription expired or no longer valid
                                    return PushSubscription.deleteOne({ _id: sub._id });
                                }
                                throw err;
                            })
                    );
                    
                    await Promise.all(pushPromises);
                    results.push = 'sent';
                } else {
                    results.push = 'no_subscription';
                }
            } catch (e) { 
                console.error('Push send failed:', e.message);
                results.push = 'failed'; 
            }
        }

        // 7. Emit via Socket.io (Real-time In-App)
        try {
            const { io } = require('../server');
            if (io) {
                io.to(userId.toString()).emit('notification', {
                    title: title || subject || 'Namma Clinic',
                    message: text,
                    type: type || 'system',
                    relatedId,
                    onModel,
                    createdAt: new Date()
                });
                console.log(`📡 Emitted socket notification to user: ${userId}`);
            }
        } catch (e) {
            console.error('Socket emission failed:', e.message);
        }

        return { success: true, results };
    } catch (err) {
        console.error('NotificationService Error:', err);
        return { success: false, error: err.message };
    }
};

module.exports = { sendNotification };
