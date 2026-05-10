import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Footprints, Flame, Map, TrendingUp, Calendar, Zap, Info, AlertCircle } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import api from '../api/axiosInstance';
import './StepTracker.css';

const StepTracker = ({ user }) => {
    const [steps, setSteps] = useState(0);
    const [distance, setDistance] = useState(0);
    const [calories, setCalories] = useState(0);
    const [fatLoss, setFatLoss] = useState(0);
    const [duration, setDuration] = useState(0);
    const [history, setHistory] = useState([]);
    const [isTracking, setIsTracking] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState('unknown');

    const trackingInterval = useRef(null);
    const lastStepTime = useRef(0);
    const stepThreshold = 12.0; 
    const minStepInterval = 300; 

    const calculateMetrics = (currentSteps) => {
        const height = user.height || 165;
        const strideLength = 0.415 * height;
        const distKm = (currentSteps * strideLength) / 100000;
        const cals = currentSteps * 0.04;
        const fat = cals / 7700;

        return {
            dist: distKm.toFixed(2),
            cals: cals.toFixed(0),
            fat: fat.toFixed(4)
        };
    };

    useEffect(() => {
        fetchTodayData();
        fetchHistory();
        return () => stopTracking();
    }, []);

    const fetchTodayData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await api.get(`/activity/daily-activity?date=${today}`);
            if (res.data.success && res.data.data.activity) {
                const act = res.data.data.activity;
                setSteps(act.steps || 0);
                setDistance(act.distance || 0);
                setCalories(act.calories || 0);
                setFatLoss(act.fatLoss || 0);
                setDuration(act.duration || 0);
            }
        } catch (err) {
            console.error('Error fetching today activity:', err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/step-tracking/patient/${user.id}`);
            if (res.data.success) {
                const formatted = res.data.data.reverse().slice(0, 7).map(d => ({
                    name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    steps: d.steps
                }));
                setHistory(formatted);
            }
        } catch (err) {
            console.error('Error fetching step history:', err);
        }
    };

    const saveActivity = async (currentSteps, currentDuration) => {
        const metrics = calculateMetrics(currentSteps);
        try {
            await api.post('/activity/update-steps', {
                date: new Date().toISOString().split('T')[0],
                steps: currentSteps,
                distance: metrics.dist,
                calories: metrics.cals,
                fatLoss: metrics.fat,
                duration: currentDuration
            });
        } catch (err) {
            console.error('Error saving activity:', err);
        }
    };

    const startTracking = async () => {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceMotionEvent.requestPermission();
                setPermissionStatus(permission);
                if (permission === 'granted') {
                    initTracking();
                }
            } catch (err) {
                setPermissionStatus('denied');
            }
        } else {
            initTracking();
        }
    };

    const initTracking = () => {
        window.addEventListener('devicemotion', handleMotion);
        setIsTracking(true);
        trackingInterval.current = setInterval(() => {
            setDuration(prev => {
                const next = prev + 1;
                if (next % 60 === 0) saveActivity(steps, next); // Sync every minute
                return next;
            });
        }, 1000);
    };

    const stopTracking = () => {
        window.removeEventListener('devicemotion', handleMotion);
        if (trackingInterval.current) clearInterval(trackingInterval.current);
        setIsTracking(false);
        saveActivity(steps, duration);
    };

    const handleMotion = (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        const delta = Math.abs(magnitude - 9.81); 

        const now = Date.now();
        if (delta > stepThreshold && (now - lastStepTime.current) > minStepInterval) {
            setSteps(prev => {
                const next = prev + 1;
                if (next % 20 === 0) saveActivity(next, duration); // Sync every 20 steps
                return next;
            });
            lastStepTime.current = now;
        }
    };

    const stepGoal = 10000;
    const progress = Math.min((steps / stepGoal) * 100, 100);

    return (
        <div className="step-tracker-card">
            <div className="tracker-header">
                <div className="header-info">
                    <h2 className="title-with-icon">
                        <div className="icon-box steps">
                            <Footprints className="w-5 h-5" />
                        </div>
                        Footstep Tracker
                    </h2>
                    <p className="subtitle">Real-time health activity monitoring</p>
                </div>
                <div className="tracker-actions">
                    {!isTracking ? (
                        <button className="btn-track start" onClick={startTracking}>
                            <Zap size={14} /> Start Tracking
                        </button>
                    ) : (
                        <button className="btn-track stop" onClick={stopTracking}>
                            Stop
                        </button>
                    )}
                </div>
            </div>

            <div className="tracker-grid">
                {/* Main Counter & Progress */}
                <div className="main-stats-section">
                    <div className="circular-progress-container">
                        <svg className="progress-svg" viewBox="0 0 100 100">
                            <circle className="progress-bg" cx="50" cy="50" r="45" />
                            <circle 
                                className="progress-bar" 
                                cx="50" cy="50" r="45" 
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * progress) / 100}
                            />
                        </svg>
                        <div className="steps-display">
                            <span className="current-steps">{steps.toLocaleString()}</span>
                            <span className="goal-text">Goal: {stepGoal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="quick-metrics">
                        <div className="metric-item">
                            <Map className="metric-icon dist" />
                            <div className="metric-data">
                                <span className="val">{distance}</span>
                                <span className="lbl">KM</span>
                            </div>
                        </div>
                        <div className="metric-item">
                            <Flame className="metric-icon cal" />
                            <div className="metric-data">
                                <span className="val">{calories}</span>
                                <span className="lbl">KCAL</span>
                            </div>
                        </div>
                        <div className="metric-item">
                            <TrendingUp className="metric-icon fat" />
                            <div className="metric-data">
                                <span className="val">{fatLoss}</span>
                                <span className="lbl">G FAT</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="analytics-section">
                    <div className="chart-container">
                        <div className="chart-header">
                            <Calendar size={14} />
                            <span>Weekly Activity</span>
                        </div>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
                                    {history.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.steps >= stepGoal ? '#10b981' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="info-tip">
                        <Info size={14} />
                        <span>Stride length calculated based on your height: {user.height || 165}cm</span>
                    </div>
                </div>
            </div>

            {permissionStatus === 'denied' && (
                <div className="permission-alert">
                    <AlertCircle size={14} />
                    <span>Motion sensors denied. Please enable them in browser settings.</span>
                </div>
            )}
        </div>
    );
};

export default StepTracker;
