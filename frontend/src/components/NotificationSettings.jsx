import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Bell, Mail, MessageSquare, Calendar, FileText, UserPlus, Moon, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './NotificationSettings.css';

const NotificationSettings = ({ userId }) => {
    const [prefs, setPrefs] = useState({
        emailAlerts: true,
        smsAlerts: true,
        appointmentNotifications: true,
        labResults: true,
        consultationUpdates: true,
        pushNotifications: false,
        doNotDisturb: false,
        dndSettings: {
            startTime: '22:00',
            endTime: '07:00'
        }
    });
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        const fetchPrefs = async () => {
            try {
                const response = await api.get(`/notifications/${userId}`);
                setPrefs(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching notification preferences:', err);
                setLoading(false);
            }
        };
        if (userId) fetchPrefs();
    }, [userId]);

    const handleToggle = async (field) => {
        const updatedPrefs = { ...prefs, [field]: !prefs[field] };
        setPrefs(updatedPrefs);
        
        try {
            setSaveStatus('Saving...');
            await api.post('/notifications/update', {
                userId,
                ...updatedPrefs
            });
            setSaveStatus('Saved');
            setTimeout(() => setSaveStatus(''), 2000);

            // If Push is enabled, request permission and subscribe
            if (field === 'pushNotifications' && updatedPrefs.pushNotifications) {
                handlePushSubscription();
            }
        } catch (err) {
            console.error('Error updating notification preferences:', err);
            setSaveStatus('Error saving');
            // Revert on error
            setPrefs(prefs);
        }
    };

    const handleDNDChange = async (field, value) => {
        const updatedDND = { ...prefs.dndSettings, [field]: value };
        const updatedPrefs = { ...prefs, dndSettings: updatedDND };
        setPrefs(updatedPrefs);
        
        try {
            setSaveStatus('Saving...');
            await api.post('/notifications/update', {
                userId,
                ...updatedPrefs
            });
            setSaveStatus('Saved');
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (err) {
            console.error('Error updating DND settings:', err);
            setSaveStatus('Error saving');
        }
    };

    const handlePushSubscription = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert('Push notifications are not supported in this browser.');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('Permission denied for notifications.');
                setPrefs(prev => ({ ...prev, pushNotifications: false }));
                return;
            }

            // Register Service Worker if not already
            const registration = await navigator.serviceWorker.ready;
            
            // Get VAPID public key from backend or hardcoded here if simple
            // VAPID_PUBLIC_KEY="BI5tu8w..."
            const publicVapidKey = 'BI5tu8w7CwZlEX_ZBGPKpAb8JXBs_Lt-C'; // Placeholder - actual from .env if possible

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            await api.post('/notifications/subscribe', {
                subscription,
                userAgent: navigator.userAgent
            });

            console.log('Push Subscribed successfully');
        } catch (err) {
            console.error('Failed to subscribe to push:', err);
            setPrefs(prev => ({ ...prev, pushNotifications: false }));
        }
    };

    // Helper for VAPID key conversion
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    if (loading) return <div className="loading-spinner-small">Loading Settings...</div>;

    return (
        <div className="notification-settings-card">
            <div className="settings-header">
                <Bell className="header-icon" />
                <h2>Notification Settings</h2>
                {saveStatus && <span className="save-status">{saveStatus}</span>}
            </div>

            <div className="settings-body">
                {/* Email & SMS Section */}
                <div className="setting-item group-section">
                    <div className="setting-info">
                        <h3>Email & SMS Alerts</h3>
                        <p>Receive critical updates via direct message.</p>
                    </div>
                    <div className="setting-controls-row">
                        <label className="checkbox-container">
                            <input 
                                type="checkbox" 
                                checked={prefs.emailAlerts} 
                                onChange={() => handleToggle('emailAlerts')} 
                            />
                            <span className="checkmark"></span>
                            <span className="label-text">Email</span>
                        </label>
                        <label className="checkbox-container">
                            <input 
                                type="checkbox" 
                                checked={prefs.smsAlerts} 
                                onChange={() => handleToggle('smsAlerts')} 
                            />
                            <span className="checkmark"></span>
                            <span className="label-text">SMS</span>
                        </label>
                    </div>
                </div>

                <div className="divider"></div>

                {/* Toggles Section */}
                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Appointment Notifications</h3>
                        <p>Alerts for upcoming and rescheduled visits.</p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={prefs.appointmentNotifications} 
                            onChange={() => handleToggle('appointmentNotifications')} 
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                <div className="divider"></div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Lab Test Results</h3>
                        <p>Instant notification when reports are ready.</p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={prefs.labResults} 
                            onChange={() => handleToggle('labResults')} 
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                <div className="divider"></div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Consultation Updates</h3>
                        <p>Message alerts from your healthcare team.</p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={prefs.consultationUpdates} 
                            onChange={() => handleToggle('consultationUpdates')} 
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Push Notifications</h3>
                        <p>Receive instant alerts on your mobile or desktop.</p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={prefs.pushNotifications} 
                            onChange={() => handleToggle('pushNotifications')} 
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                <div className="divider margin-top-large"></div>

                {/* DND Section */}
                <div className="setting-item dnd-item">
                    <div className="setting-info">
                        <div className="dnd-header">
                            <Moon className="dnd-icon" size={18} />
                            <h3>Do Not Disturb (DND)</h3>
                        </div>
                        <p>Silence all notifications during specific hours.</p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={prefs.doNotDisturb} 
                            onChange={() => handleToggle('doNotDisturb')} 
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                {prefs.doNotDisturb && (
                    <motion.div 
                        className="dnd-time-range"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <div className="time-picker-group">
                            <div className="time-input">
                                <span>From</span>
                                <input 
                                    type="time" 
                                    value={prefs.dndSettings.startTime} 
                                    onChange={(e) => handleDNDChange('startTime', e.target.value)}
                                />
                            </div>
                            <div className="time-input">
                                <span>To</span>
                                <input 
                                    type="time" 
                                    value={prefs.dndSettings.endTime} 
                                    onChange={(e) => handleDNDChange('endTime', e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="dnd-hint">All non-critical alerts will be silent during this window.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default NotificationSettings;
