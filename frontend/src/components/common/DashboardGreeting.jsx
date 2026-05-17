import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Sun, Moon, Cloud, Sunrise, Activity, Calendar,
    HeartPulse, CheckCircle2, Star, Sparkles,
    TrendingUp, Clock, Zap
} from 'lucide-react';
import './DashboardGreeting.css';

const DashboardGreeting = ({ user, role }) => {
    const [greeting, setGreeting] = useState('');
    const [Icon, setIcon] = useState(Sun);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                setGreeting('Good Morning');
                setIcon(Sunrise);
            } else if (hour >= 12 && hour < 17) {
                setGreeting('Good Afternoon');
                setIcon(Sun);
            } else if (hour >= 17 && hour < 21) {
                setGreeting('Good Evening');
                setIcon(Cloud);
            } else {
                setGreeting('Good Night');
                setIcon(Moon);
            }
        };

        updateGreeting();
        const timer = setInterval(() => setDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const healthMessages = [
        "Your dedication saves lives every day.",
        "Small steps in health lead to big leaps in life.",
        "Providing care with compassion and technology.",
        "Healthy patients, happy clinic, successful practice.",
        "Innovation in healthcare starts with you."
    ];

    const randomMessage = healthMessages[Math.floor(Math.random() * healthMessages.length)];

    const getRoleWidgets = () => {
        switch (role) {
            case 'doctor':
                return [];
            case 'patient':
                return [
                    { label: 'Upcoming Visits', value: '2',       icon: Calendar,   color: '#4F46E5', bg: 'rgba(79,70,229,0.08)',   border: 'rgba(79,70,229,0.18)'  }
                ];
            case 'admin':
            case 'clinic_admin':
                return [
                    { label: 'System Health', value: '99.9%', icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)' }
                ];
            default:
                return [
                    { label: 'Tasks Pending', value: '5',   icon: Star, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)'  },

                ];
        }
    };

    const widgets = getRoleWidgets();

    const displayName =
        role === 'doctor'       ? `Dr. ${user.userName || user.name}` :
        role === 'admin'        ? `Admin ${user.userName || user.name}` :
        role === 'receptionist' ? `${user.userName || user.name}` :
        role === 'nurse'        ? `Nurse ${user.userName || user.name}` :
        (user.userName || user.name);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: 'relative',
                overflow: 'hidden',
                padding: 'clamp(1.5rem, 3vw, 2.5rem)',
                borderRadius: '1.75rem',
                background: 'linear-gradient(135deg, #F8F7FF 0%, #EEF2FF 50%, #F0FDF4 100%)',
                border: '1px solid rgba(99, 102, 241, 0.14)',
                boxShadow: '0 4px 24px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                marginBottom: '2rem',
            }}
            className="dg-font-inter"
        >
            {/* Subtle noise overlay */}
            <div
                className="dg-noise-texture"
                style={{ position: 'absolute', inset: 0, opacity: 0.025, mixBlendMode: 'multiply', pointerEvents: 'none' }}
            />

            {/* Ambient orbs */}
            <div className="dg-orb-violet" />
            <div className="dg-orb-cyan" />
            <div className="dg-orb-green" />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>

                {/* ── LEFT: Greeting ── */}
                <div style={{ flex: '1 1 260px', minWidth: 0 }}>

                    {/* Badge row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.625rem', marginBottom: '1.1rem' }}>
                        <motion.div
                            animate={{ rotate: [0, 12, -12, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                            style={{
                                background: 'rgba(79,70,229,0.08)',
                                border: '1px solid rgba(79,70,229,0.15)',
                                borderRadius: '0.75rem',
                                padding: '0.45rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Icon size={17} color="#4F46E5" />
                        </motion.div>


                    </div>

                    {/* Headline */}
                    <h1
                        className="dg-font-satoshi"
                        style={{
                            fontSize: 'clamp(1.6rem, 3.5vw, 2.75rem)',
                            fontWeight: 700,
                            lineHeight: 1.15,
                            marginBottom: '0.85rem',
                            color: '#1E1B4B',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        {greeting},{' '}
                        <span className="dg-text-gradient">{displayName}</span>
                    </h1>

                    {/* Motivational quote */}
                    <p style={{
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        color: '#6B7280',
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        lineHeight: 1.7,
                        maxWidth: '40ch'
                    }}>
                        <Sparkles size={14} color="#7C3AED" style={{ flexShrink: 0, opacity: 0.7 }} />
                        {randomMessage}
                    </p>
                </div>

                {/* ── RIGHT: Widgets ── */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'stretch' }}>

                    {/* Date / Time widget */}
                    <div
                        className="dg-premium-glass"
                        style={{ padding: '0.9rem 1.1rem', borderRadius: '1.1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: '155px', position: 'relative', overflow: 'hidden' }}
                    >
                        <div className="dg-widget-inner-glow" />
                        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '0.65rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                            <Clock size={16} color="#4F46E5" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.2rem' }}>Today</span>
                            <span className="dg-font-satoshi" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E1B4B', whiteSpace: 'nowrap' }}>
                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.1rem' }}>
                                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    {/* Dynamic role widgets */}
                    {widgets.map((widget, idx) => (
                        <div
                            key={idx}
                            className="dg-premium-glass"
                            style={{ padding: '0.9rem 1.1rem', borderRadius: '1.1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: '155px', position: 'relative', overflow: 'hidden' }}
                        >
                            <div className="dg-widget-inner-glow" />
                            <div style={{
                                background: widget.bg,
                                border: `1px solid ${widget.border}`,
                                borderRadius: '0.65rem',
                                padding: '0.45rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, position: 'relative', zIndex: 1
                            }}>
                                <widget.icon size={16} color={widget.color} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.2rem', whiteSpace: 'nowrap' }}>
                                    {widget.label}
                                </span>
                                <span className="dg-font-satoshi" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E1B4B', letterSpacing: '-0.02em' }}>
                                    {widget.value}
                                </span>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </motion.div>
    );
};

export default DashboardGreeting;
