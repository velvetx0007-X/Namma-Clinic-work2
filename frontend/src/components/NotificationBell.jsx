import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Info, AlertCircle, Calendar, Pill } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import './NotificationBell.css';

const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        // Fetch existing notifications
        fetchNotifications();

        // Initialize Socket.io
        socketRef.current = io('http://localhost:5000');
        
        socketRef.current.emit('join', user.id);

        socketRef.current.on('notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Play subtle sound or show browser toast if needed
            if (Notification.permission === 'granted') {
                new Notification(notification.title, { body: notification.message });
            }
        });

        // Request browser notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get(`/notifications/history/${user.id}`);
            const data = res.data;
            setNotifications(data);
            setUnreadCount(data.filter(n => n.status === 'unread').length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/read/${id}`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch(`/notifications/read-all/${user.id}`);
            setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'task': return <Calendar size={16} className="text-blue-500" />;
            case 'ai_reminder': return <Info size={16} className="text-purple-500" />;
            case 'lab_result': return <Check size={16} className="text-green-500" />;
            case 'appointment': return <Calendar size={16} className="text-emerald-500" />;
            default: return <Bell size={16} className="text-gray-500" />;
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button 
                className={`bell-button ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notifications-dropdown">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="mark-all-btn">Mark all as read</button>
                        )}
                    </div>
                    
                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notifications">
                                <Bell size={40} className="opacity-20" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div 
                                    key={n._id} 
                                    className={`notification-item ${n.status === 'unread' ? 'unread' : ''}`}
                                    onClick={() => n.status === 'unread' && markAsRead(n._id)}
                                >
                                    <div className="notification-icon">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="notification-content">
                                        <h4 className="notification-title">{n.title}</h4>
                                        <p className="notification-message">{n.message}</p>
                                        <span className="notification-time">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {n.status === 'unread' && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="dropdown-footer">
                        <button onClick={() => setIsOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
