import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { Bell, Check, Trash2, Calendar, FileText, Activity, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './NotificationCenter.css';

const NotificationCenter = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user?._id) {
            fetchNotifications();
            // Optional: Set up real-time polling or WebSocket here
            const interval = setInterval(fetchNotifications, 60000); // Poll every minute
            return () => clearInterval(interval);
        }
    }, [user?._id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get(`/notifications/history/${user._id}`);
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => n.status === 'unread').length);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/read/${id}`);
            setNotifications(notifications.map(n => 
                n._id === id ? { ...n, status: 'read' } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch(`/notifications/read-all/${user._id}`);
            setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const clearHistory = async () => {
        if (!window.confirm('Clear all notification history?')) return;
        try {
            await api.delete(`/notifications/clear/${user._id}`);
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error('Error clearing history:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'appointment': return <Calendar size={16} className="nt-icon appointment" />;
            case 'lab_result': return <FileText size={16} className="nt-icon lab" />;
            case 'consultation': return <Activity size={16} className="nt-icon consultation" />;
            case 'ai_reminder': return <Sparkles size={16} className="nt-icon ai" />;
            default: return <Bell size={16} className="nt-icon system" />;
        }
    };

    const handleNotificationClick = (n) => {
        if (n.status === 'unread') markAsRead(n._id);
        
        // Navigation logic based on type
        if (n.type === 'appointment') navigate('/dashboard?tab=appointments');
        if (n.type === 'lab_result') navigate('/dashboard?tab=labTests');
        if (n.type === 'ai_reminder') navigate('/dashboard?tab=home'); // Or specific ai tab
        
        setShowDropdown(false);
    };

    return (
        <div className="notification-center-container" ref={dropdownRef}>
            <button 
                className={`nav-icon-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <Bell size={24} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div 
                        className="notification-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    >
                        <div className="dropdown-header">
                            <h3>Notifications</h3>
                            <div className="header-actions">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="action-btn" title="Mark all as read">
                                        <Check size={16} />
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button onClick={clearHistory} className="action-btn delete" title="Clear history">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="empty-state">
                                    <Bell size={40} />
                                    <p>No new notifications</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div 
                                        key={n._id} 
                                        className={`notification-item ${n.status}`}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className="item-icon">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="item-content">
                                            <h4>{n.title}</h4>
                                            <p>{n.message}</p>
                                            <span className="item-time">
                                                <Clock size={12} />
                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {n.status === 'unread' && <div className="unread-dot" />}
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {notifications.length > 0 && (
                            <div className="dropdown-footer">
                                <button onClick={() => { setShowDropdown(false); navigate('/dashboard?tab=home'); }}>
                                    View All Activity
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
