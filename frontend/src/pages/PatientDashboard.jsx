import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axiosInstance';
import DigitalIDCard from '../components/DigitalIDCard';
import AppointmentHistory from '../components/AppointmentHistory';
import ClinicMap from '../components/ClinicMap';
import Footer from '../components/Footer';
import AIHealthAssistant from '../components/AIHealthAssistant';
import SymptomChecker from '../ai_modules/symptom-checker';
import RecordInsights from '../ai_modules/record-insights';
import MedicationInfo from '../ai_modules/medication-info';
import LifestyleTips from '../ai_modules/lifestyle-tips';
import About from './About';
import ProfileSettings from '../components/ProfileSettings';
import AdvancedAIView from '../components/AdvancedAIView';
import NotificationCenter from '../components/NotificationCenter';
import StepTracker from '../components/StepTracker';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
    Heart, Activity, Calendar, FileText, Pill, Search, MapPin, Navigation, 
    MessageSquare, MessageSquarePlus, CheckCircle, User, UserCheck, LogOut, 
    Sparkles, Bot, Zap, Download, Clock, Star, Loader2, X, LayoutDashboard,
    Footprints, Flame, TrendingUp, ChevronRight, Droplets, Moon, Wind, Bed, 
    Maximize, Baby, Target, Plus, History, Eye, Stethoscope
} from 'lucide-react';
import logo from '../assets/Namma Clinic logo.jpeg';
import DashboardLayout from '../components/common/DashboardLayout';
import StatCard from '../components/common/StatCard';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import DashboardGreeting from '../components/common/DashboardGreeting';

import './PatientDashboard.css';

// IST Utilities
const getISTDate = () => {
    return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date()).split('/').reverse().join('-');
};

const getISTTime = () => {
    return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).format(new Date());
};

const DEFAULT_WELLNESS_TASKS = [
    { title: 'Morning Yoga', type: 'Yoga', description: '15 mins light stretching', status: 'pending', progress: 0 },
    { title: 'Brisk Walk', type: 'Walking', description: '30 mins brisk walking', status: 'pending', progress: 0 },
    { title: 'Mindful Meditation', type: 'Meditation', description: '10 mins focus breathing', status: 'pending', progress: 0 },
    { title: 'Breathing Exercise', type: 'Breathing', description: 'Deep breathing for 5 mins', status: 'pending', progress: 0 },
    { title: 'Hydration Goal', type: 'Water', description: 'Drink 3L of water daily', status: 'pending', progress: 0 },
    { title: 'Sleep Routine', type: 'Sleep', description: '8 hours of restful sleep', status: 'pending', progress: 0 },
    { title: 'Body Stretching', type: 'Stretching', description: 'Full body stretching', status: 'pending', progress: 0 },
    { title: 'Child Care Activity', type: 'ChildCare', description: 'Child health monitoring', status: 'pending', progress: 0 },
    { title: 'Wellness Goals', type: 'Goals', description: 'Review weekly health progress', status: 'pending', progress: 0 }
];

const getTaskIcon = (type) => {
    switch (type) {
        case 'Yoga': return <Activity size={18} />;
        case 'Walking': return <Footprints size={18} />;
        case 'Meditation': return <Moon size={18} />;
        case 'Breathing': return <Wind size={18} />;
        case 'Water': return <Droplets size={18} />;
        case 'Sleep': return <Bed size={18} />;
        case 'Stretching': return <Maximize size={18} />;
        case 'ChildCare': return <Baby size={18} />;
        case 'Goals': return <Target size={18} />;
        default: return <Zap size={18} />;
    }
};

const PatientDashboard = () => {
    const { user, updateUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [myReviews, setMyReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [prescriptionSearch, setPrescriptionSearch] = useState('');
    const [prescriptionTypeFilter, setPrescriptionTypeFilter] = useState('all');
    const [labTests, setLabTests] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState({ lat: 13.0827, lng: 80.2707 });
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [profileDetails, setProfileDetails] = useState({
        bloodGroup: user.bloodGroup || '',
        uhid: user.uhid || '',
        age: user.age || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        allergies: user.allergies || 'None reported',
        medicalHistory: user.medicalHistory || 'No history available',
        emergencyContact: {
            name: user.emergencyContact?.name || '',
            phone: user.emergencyContact?.phone || '',
            relationship: user.emergencyContact?.relationship || ''
        },
        address: user.address || '',
        area: user.area || ''
    });

    const [editModes, setEditModes] = useState({
        personal: false,
        medical: false,
        emergency: false,
        address: false
    });
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        type: 'scheduled',
        chiefComplaint: ''
    });
    const editRef = useRef(null);

    const handleEditCardClick = () => {
        if (editRef.current) {
            editRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            editRef.current.classList.add('highlight');
            setTimeout(() => {
                if (editRef.current) editRef.current.classList.remove('highlight');
            }, 2000);
        }
    };
    const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
    const [showChat, setShowChat] = useState(false);
    const [selectedAIModule, setSelectedAIModule] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    const [showReviewDetail, setShowReviewDetail] = useState(false);
    
    // Advanced Review Form State
    const [reviewForm, setReviewForm] = useState({
        clinicId: '',
        rating: 5,
        communication: 5,
        treatment: 5,
        waitingTime: 5,
        recommend: true,
        issueResolved: true,
        comment: ''
    });

    const [dailyActivity, setDailyActivity] = useState({
        steps: 0, distance: 0, calories: 0, duration: 0, water: 0, waterGoal: 2.5
    });

    const healthTrendsData = [
        { name: 'Mon', bp: 120, hr: 72 },
        { name: 'Tue', bp: 122, hr: 75 },
        { name: 'Wed', bp: 118, hr: 70 },
        { name: 'Thu', bp: 125, hr: 78 },
        { name: 'Fri', bp: 121, hr: 74 },
        { name: 'Sat', bp: 119, hr: 71 },
        { name: 'Sun', bp: 120, hr: 73 },
    ];
    const [childProfiles, setChildProfiles] = useState([]);
    const [childSearchResults, setChildSearchResults] = useState([]);
    const [childSearchLoading, setChildSearchLoading] = useState(false);
    const [wellnessHistory, setWellnessHistory] = useState(() => {
        const saved = localStorage.getItem(`wellness_history_${user.id}`);
        return saved ? JSON.parse(saved) : {};
    });
    const [analyticsPeriod, setAnalyticsPeriod] = useState('daily');
    const [streakCount, setStreakCount] = useState(0);

    const handleChildSearch = async (query) => {
        if (!query.trim()) return;
        setChildSearchLoading(true);
        try {
            const res = await api.get(`/child-care/smart-search?query=${query}`);
            if (res.data.success) {
                setChildSearchResults(res.data.data);
            }
        } catch (err) {
            console.error('Error in child smart search:', err);
        } finally {
            setChildSearchLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientData();
        fetchDailyActivity();
        fetchChildProfiles();

        // Real-time polling for prescriptions to auto-sync from doctor
        const syncInterval = setInterval(async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/prescriptions/patient/${user.id}`);
                setPrescriptions(res.data.data);
            } catch (err) {
                console.error('Real-time sync error:', err);
            }
        }, 10000);

        return () => clearInterval(syncInterval);
    }, [user?.id]);

    useEffect(() => {
        const checkDailyReset = () => {
            const today = getISTDate();
            const lastReset = localStorage.getItem(`last_reset_${user.id}`);
            
            if (lastReset !== today) {
                localStorage.setItem(`last_reset_${user.id}`, today);
                // Daily reset logic - will be reflected on next fetch
                fetchDailyActivity();
            }
        };

        checkDailyReset();
        const interval = setInterval(checkDailyReset, 3600000); // Check every hour
        return () => clearInterval(interval);
    }, [user.id]);

    useEffect(() => {
        // Calculate Streak
        const dates = Object.keys(wellnessHistory).sort().reverse();
        let currentStreak = 0;
        let checkDate = new Date();
        
        for (let i = 0; i < dates.length; i++) {
            const dateStr = dates[i];
            const d = new Date(dateStr);
            
            // Check if this date has any completed tasks
            const hasCompleted = wellnessHistory[dateStr].length > 0;
            
            if (hasCompleted) {
                currentStreak++;
            } else {
                break;
            }
        }
        setStreakCount(currentStreak);
    }, [wellnessHistory]);

    const fetchChildProfiles = async () => {
        try {
            const res = await api.get('/child-care/my-children');
            if (res.data.success) {
                setChildProfiles(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching child profiles:', err);
        }
    };

    const medicationTasksList = tasks.filter(t => t.type === 'Medication' && t.status !== 'completed');
    const activeMedications = [
        ...(prescriptions || []).slice(0, 2).flatMap(p => p.medications || []).slice(0, 5).map(m => ({ ...m, source: 'prescription' })),
        ...medicationTasksList.map(t => ({ drugName: t.title, frequency: t.description, dosage: t.priority, source: 'task', _id: t._id }))
    ];

    const isAppointmentUpcoming = (apt) => {
        if (!apt.appointmentDate) return false;
        const aptDate = new Date(apt.appointmentDate);
        if (apt.appointmentTime) {
            const timeStr = apt.appointmentTime.trim();
            const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/i);
            if (timeMatch) {
                let hours = parseInt(timeMatch[1], 10);
                let mins = parseInt(timeMatch[2], 10);
                const meridiem = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
                if (meridiem === 'pm' && hours < 12) hours += 12;
                if (meridiem === 'am' && hours === 12) hours = 0;
                aptDate.setHours(hours, mins, 0, 0);
            }
        }
        return aptDate >= new Date();
    };

    const allUpcoming = (appointments || []).filter(apt => isAppointmentUpcoming(apt) && apt.status !== 'cancelled').sort((a,b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    const pastAppointments = (appointments || []).filter(apt => !isAppointmentUpcoming(apt) || apt.status === 'completed' || apt.status === 'cancelled').sort((a,b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
    const appointmentTasksList = tasks.filter(t => t.type === 'Appointment' && t.status !== 'completed');
    const upcomingAppointments = [
        ...allUpcoming.slice(0, 3).map(a => ({ ...a, source: 'official' })),
        ...appointmentTasksList.map(t => ({ 
            appointmentDate: t.dueDate || new Date(), 
            appointmentTime: 'Scheduled Task', 
            doctorId: { userName: 'Staff' }, 
            source: 'task',
            _id: t._id,
            title: t.title
        }))
    ];

    const labTasksList = tasks.filter(t => t.type === 'Lab Test' && t.status !== 'completed');
    const pendingLabTests = [
        ...(labTests || []).filter(test => test.status === 'ordered' || test.status === 'sample-collected').slice(0, 3)
            .map(l => ({ ...l, source: 'official' })),
        ...labTasksList.map(t => ({ testName: t.title, status: t.status, source: 'task', _id: t._id }))
    ];

    const generalTasks = tasks.filter(t => (t.type === 'General Message' || !t.type) && t.status !== 'completed');
    const wellnessTasksList = tasks.filter(t => DEFAULT_WELLNESS_TASKS.some(dt => dt.type === t.type));

    const getAIContext = () => {
        return {
            userName: user.name,
            uhid: user.uhid,
            medicalHistory: user.medicalHistory,
            dailyActivity: dailyActivity,
            recentVitals: { bp: 120, hr: 72 },
            activeMedications: activeMedications.map(m => m.drugName),
            upcomingAppointments: upcomingAppointments.length,
            pendingLabTests: pendingLabTests.length
        };
    };

    const fetchDailyActivity = async () => {
        try {
            const today = getISTDate();
            const res = await api.get(`/activity/daily-activity?date=${today}`);
            if (res.data.success) {
                const act = res.data.data.activity;
                const water = res.data.data.water;
                setDailyActivity({
                    steps: act.steps || 0,
                    distance: act.distance || 0,
                    calories: act.calories || 0,
                    duration: act.duration || 0,
                    water: water.amount || 0,
                    waterGoal: water.goal || 2.5
                });
                
                // Merge backend tasks with defaults
                const backendTasks = res.data.data.tasks || [];
                const mergedTasks = DEFAULT_WELLNESS_TASKS.map(defTask => {
                    const match = backendTasks.find(bt => bt.title === defTask.title || bt.type === defTask.type);
                    return match ? { ...defTask, ...match } : defTask;
                });
                setTasks(prev => {
                    const nonWellness = prev.filter(t => !DEFAULT_WELLNESS_TASKS.some(dt => dt.type === t.type));
                    return [...nonWellness, ...mergedTasks];
                });
            }
        } catch (err) {
            console.error('Error fetching activity:', err);
            // Fallback to defaults if fetch fails
            setTasks(prev => {
                const nonWellness = prev.filter(t => !DEFAULT_WELLNESS_TASKS.some(dt => dt.type === t.type));
                return [...nonWellness, ...DEFAULT_WELLNESS_TASKS];
            });
        }
    };

    const fetchPatientData = async () => {
        try {
            const [appointmentsRes, prescriptionsRes, labTestsRes, clinicsRes, tasksRes] = await Promise.all([
                api.get(`/appointments/patient/${user.id}`),
                api.get(`/prescriptions/patient/${user.id}`),
                api.get(`/lab-tests/patient/${user.id}`),
                api.get(`/clinics`),
                api.get(`/tasks/patient/${user.id}`)
            ]);

            setAppointments(appointmentsRes.data.data);
            setPrescriptions(prescriptionsRes.data.data);
            setLabTests(labTestsRes.data.data);
            // Filter only doctors
            setClinics(clinicsRes.data.data.filter(c => c.userType === 'doctor'));
            setTasks(prev => {
                const wellness = prev.filter(t => DEFAULT_WELLNESS_TASKS.some(dt => dt.type === t.type));
                const dbTasks = tasksRes.data.data || [];
                return [...wellness, ...dbTasks];
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching patient data:', error);
            setLoading(false);
        }
    };

    const fetchMyReviews = async () => {
        setLoadingReviews(true);
        try {
            const res = await api.get(`/reviews/patient/${user.id}`);
            if (res.data.success) {
                setMyReviews(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchMyReviews();
        }
    }, [activeTab]);

    const handleTaskUpdate = async (taskId, newStatus) => {
        try {
            const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
            if (res.data.success) {
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleWellnessTaskUpdate = async (task, actionType = 'toggle') => {
        try {
            const today = getISTDate();
            let newStatus = task.status;
            let newProgress = task.progress || 0;

            if (actionType === 'toggle') {
                if (task.status === 'pending') {
                    newStatus = 'in-progress';
                    newProgress = 50;
                } else if (task.status === 'in-progress') {
                    newStatus = 'completed';
                    newProgress = 100;
                } else {
                    newStatus = 'pending';
                    newProgress = 0;
                }
            }

            const res = await api.post('/activity/update-task', { 
                title: task.title, 
                type: task.type, 
                status: newStatus,
                progress: newProgress,
                date: today 
            });

            if (res.data.success) {
                const backendTasks = res.data.data;
                const mergedTasks = tasks.map(t => {
                    const match = backendTasks.find(bt => bt.title === t.title && bt.type === t.type);
                    return match ? { ...t, ...match } : (t.title === task.title ? { ...t, status: newStatus, progress: newProgress } : t);
                });
                setTasks(mergedTasks);

                if (newStatus === 'completed') {
                    // Update Calories
                    const calBonus = {
                        'Yoga': 150, 'Walking': 200, 'Meditation': 50, 'Breathing': 30, 'Stretching': 100
                    }[task.type] || 0;
                    
                    if (calBonus > 0) {
                        const newCals = dailyActivity.calories + calBonus;
                        setDailyActivity(prev => ({ ...prev, calories: newCals }));
                        await api.post('/activity/update-steps', { ...dailyActivity, calories: newCals, date: today });
                    }

                    // Update History
                    const historyUpdate = { ...wellnessHistory };
                    if (!historyUpdate[today]) historyUpdate[today] = [];
                    if (!historyUpdate[today].find(h => h.title === task.title)) {
                        historyUpdate[today].push({
                            title: task.title,
                            type: task.type,
                            completedAt: getISTTime(),
                            status: 'Completed',
                            progress: 100
                        });
                        setWellnessHistory(historyUpdate);
                        localStorage.setItem(`wellness_history_${user.id}`, JSON.stringify(historyUpdate));
                    }
                }
            }
        } catch (err) {
            console.error('Error updating wellness task:', err);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    const pulseRef = useRef(null);

    useEffect(() => {
        if (pulseRef.current) {
            gsap.to(pulseRef.current, {
                scale: 1.1,
                duration: 0.8,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        }
    }, [activeTab]);

    useEffect(() => {
        // Use stored user location as default if available
        if (user && user.location && user.location.lat && user.location.lng) {
            setUserLocation(user.location);
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.log('Geolocation error:', error)
            );
        }
    }, [user]);

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            const appointmentPayload = {
                patientId: user.id,
                doctorId: bookingData.doctorId,
                appointmentDate: bookingData.appointmentDate,
                appointmentTime: bookingData.appointmentTime,
                type: bookingData.type,
                chiefComplaint: bookingData.chiefComplaint
            };
            await api.post('/appointments', appointmentPayload);
            setUploadMessage({ type: 'success', text: 'Appointment request sent! Waiting for clinic confirmation.' });
            setShowBookingModal(false);
            setBookingData({
                doctorId: '',
                appointmentDate: '',
                appointmentTime: '',
                type: 'scheduled',
                chiefComplaint: ''
            });
            fetchPatientData(); // Refresh list
        } catch (error) {
            console.error('Error booking appointment:', error);
            setUploadMessage({ type: 'error', text: 'Failed to book appointment: ' + (error.response?.data?.message || 'Please try again.') });
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action is permanent and will remove all your data from the system.");
        if (confirmDelete) {
            try {
                await api.delete('/users', { data: { userId: user.id, role: user.role } });
                alert('Your account has been deleted successfully.');
                handleLogout();
            } catch (error) {
                alert('Failed to delete account: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const downloadProfilePDF = async () => {
        const element = document.querySelector('.profile-content');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: isDarkMode ? '#1a202c' : '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${user.name}_Profile_NammaClinic.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF');
        }
    };

    const saveSection = async (section) => {
        try {
            const res = await api.put('/users/profile', {
                userId: user.id,
                role: 'patient',
                ...profileDetails
            });
            updateUser(res.data.data);
            setEditModes({ ...editModes, [section]: false });
            alert(`${section.charAt(0).toUpperCase() + section.slice(1)} information updated!`);
        } catch (err) {
            console.error('Update error:', err);
            alert('Update failed');
        }
    };


    const handleProfileUpdate = async () => {
        try {
            const response = await api.put(`/users/${user.id}`, profileDetails);
            updateUser(response.data.data); // Update user context
            setUploadMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setUploadMessage({ type: 'error', text: 'Failed to update profile. ' + (error.response?.data?.message || '') });
        }
    };

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance.toFixed(2); // Return distance in km with 2 decimal places
    };

    // Geocode place name to coordinates using Nominatim API
    const geocodePlace = async (placeName) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    };

    // Handle search button click
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        // Try to geocode the search term as a place name
        const location = await geocodePlace(searchTerm);
        if (location) {
            setUserLocation(location);
        }
    };

    // Filter clinics based on search term and add distance information
    const filteredClinics = clinics
        .filter(clinic =>
            clinic.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clinic.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clinic.address?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(clinic => ({
            ...clinic,
            distance: clinic.location?.lat && clinic.location?.lng
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    clinic.location.lat,
                    clinic.location.lng
                )
                : null
        }))
        .sort((a, b) => {
            // Sort by distance (nearest first)
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return parseFloat(a.distance) - parseFloat(b.distance);
        });

    // Get directions URL for Google Maps
    const getDirectionsUrl = (clinic) => {
        if (!clinic.location?.lat || !clinic.location?.lng) return null;
        return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${clinic.location.lat},${clinic.location.lng}`;
    };



    const openBookingWithDoctor = (clinicId) => {
        setBookingData(prev => ({ ...prev, doctorId: clinicId }));
        setShowBookingModal(true);
    };

    const sidebarLinks = [
        { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'clinics', label: 'Clinics', icon: MapPin },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'labTests', label: 'Records', icon: FileText },
        { id: 'reviews', label: 'My Reviews', icon: Star },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <DashboardLayout sidebarLinks={sidebarLinks} activeTab={activeTab} setActiveTab={setActiveTab}>

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="home-content space-y-8"
                    >
                        <DashboardGreeting user={user} role="patient" />

                        {/* Real-Time Footstep Tracker */}
                        <motion.div variants={itemVariants}>
                            <StepTracker user={user} />
                        </motion.div>

                        {/* 2-Column Layout */}
                        <div className="home-grid grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                            {/* Left: Task Reminders (Full width on medium, partial on large) */}
                            <motion.div variants={itemVariants} className="lg:col-span-12 task-reminders-unified">
                                <div className="section-title-row">
                                    <h2 className="title-with-icon">
                                        <div className="icon-box tasks">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        Wellness & Task Reminders
                                    </h2>
                                    <span className="box-pill">TODAY</span>
                                </div>

                                <div className="reminder-groups-container">
                                    <div className="reminder-group">
                                        <div className="group-header">
                                            <Zap className="text-teal-500 w-4 h-4" />
                                            <h3>WELLNESS TASKS</h3>
                                        </div>
                                        <div className="wellness-tasks-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                {wellnessTasksList.length > 0 ? (wellnessTasksList.map((task, idx) => (
                                    <div key={idx} className={`wellness-task-card ${task.status}`}>
                                        <div className="task-icon-wrapper">
                                            {getTaskIcon(task.type)}
                                        </div>
                                        <div className="task-info">
                                            <h4>{task.title}</h4>
                                            <p>{task.description}</p>
                                            <div className="task-progress-mini">
                                                <div className="progress-track">
                                                    <div className="progress-fill" style={{ width: `${task.progress || 0}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="task-actions">
                                            {task.status !== 'completed' ? (
                                                <button 
                                                    className={`task-btn ${task.status === 'in-progress' ? 'complete' : 'start'}`}
                                                    onClick={() => handleWellnessTaskUpdate(task)}
                                                >
                                                    {task.status === 'in-progress' ? <CheckCircle size={14} /> : <Zap size={14} />}
                                                    {task.status === 'in-progress' ? 'Done' : 'Start'}
                                                </button>
                                            ) : (
                                                <span className="completed-badge"><CheckCircle size={14} /> Finished</span>
                                            )}
                                        </div>
                                    </div>
                                ))) : (
                                    <div className="empty-state p-4 text-center text-slate-500 w-full col-span-full">
                                        No wellness tasks found.
                                    </div>
                                )}
                                        </div>
                                    </div>

                                    <div className="reminder-group">
                                        <div className="group-header">
                                            <Pill className="text-teal-500 w-4 h-4" />
                                            <h3>MEDICATIONS</h3>
                                        </div>
                                        {activeMedications.length > 0 ? (
                                            <div className="items-list">
                                                {activeMedications.map((med, index) => (
                                                    <motion.div
                                                        whileHover={{ y: -2 }}
                                                        key={med._id || index}
                                                        className={`reminder-item-card ${med.source === 'task' ? 'task-source' : ''}`}
                                                        onClick={() => med.source === 'task' && handleTaskUpdate(med._id, 'completed')}
                                                    >
                                                        <div>
                                                            <div className="item-main-text">{med.drugName}</div>
                                                            <div className="item-sub-text">{med.frequency}</div>
                                                        </div>
                                                        <div className="item-badge">{med.dosage}</div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-state">
                                                <p>No active medications</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="reminder-group">
                                        <div className="group-header">
                                            <Calendar className="text-emerald-500 w-4 h-4" />
                                            <h3>APPOINTMENTS</h3>
                                        </div>
                                        {upcomingAppointments.length > 0 ? (
                                            <div className="items-list">
                                                {upcomingAppointments.slice(0, 3).map((apt) => (
                                                    <motion.div
                                                        whileHover={{ y: -2 }}
                                                        key={apt._id}
                                                        className={`reminder-item-card status-${apt.status?.toLowerCase()}`}
                                                    >
                                                        <div className="date-icon-small">
                                                            <span className="month">{new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                                                            <span className="day">{new Date(apt.appointmentDate).getDate()}</span>
                                                        </div>
                                                        <div className="item-info">
                                                            <div className="item-main-text">{apt.title || `Dr. ${apt.doctorId?.userName}`}</div>
                                                            <div className="item-sub-text">{apt.appointmentTime} | <span className="status-label">{apt.status}</span></div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                {upcomingAppointments.length > 3 && (
                                                    <button className="see-all-btn-lux" onClick={() => setActiveTab('appointments')}>
                                                        See All Appointments <ChevronRight size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="empty-state">
                                                <p>No appointments scheduled</p>
                                                <button className="book-now-link" onClick={() => setShowBookingModal(true)}>Book Now</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="reminder-group">
                                        <div className="group-header">
                                            <Activity className="text-emerald-500 w-4 h-4" />
                                            <h3>LAB TESTS</h3>
                                        </div>
                                        {pendingLabTests.length > 0 ? (
                                            <div className="items-list">
                                                {pendingLabTests.slice(0, 3).map((test) => (
                                                    <motion.div
                                                        whileHover={{ y: -2 }}
                                                        key={test._id}
                                                        className={`reminder-item-card status-${test.status?.toLowerCase()}`}
                                                    >
                                                        <div className="item-main-text">{test.testName}</div>
                                                        <span className={`status-tag ${test.status}`}>
                                                            {test.status === 'completed' ? '✓ ' : '◴ '}
                                                            {test.status}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                                {pendingLabTests.length > 3 && (
                                                    <button className="see-all-btn-lux" onClick={() => setActiveTab('records')}>
                                                        See All Lab Tests <ChevronRight size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="empty-state">
                                                <p>No pending lab tests</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="reminder-group">
                                        <div className="group-header">
                                            <MessageSquare className="text-blue-500 w-4 h-4" />
                                            <h3>GENERAL TASKS</h3>
                                        </div>
                                        {generalTasks.length > 0 ? (
                                            <div className="items-list">
                                                {generalTasks.map((task) => (
                                                    <motion.div
                                                        whileHover={{ y: -2 }}
                                                        key={task._id}
                                                        className={`reminder-item-card task-card-ext ${task.status}`}
                                                    >
                                                        <div className="item-content-flex">
                                                            <div className="item-info-main">
                                                                <div className="item-main-text flex items-center gap-2">
                                                                    {task.title}
                                                                    <span className={`priority-tag ${task.priority.toLowerCase()}`}>
                                                                        {task.priority}
                                                                    </span>
                                                                </div>
                                                                <div className="item-sub-text">{task.description}</div>
                                                                {task.aiSuggestion && (
                                                                    <div className="ai-insight-box">
                                                                        <Sparkles size={12} />
                                                                        <span>{task.aiSuggestion}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="task-actions">
                                                                {task.status === 'pending' && (
                                                                    <button 
                                                                        onClick={() => handleTaskUpdate(task._id, 'acknowledged')}
                                                                        className="task-btn ack"
                                                                        title="Acknowledge"
                                                                    >
                                                                        <CheckCircle size={14} />
                                                                        <span>Ack</span>
                                                                    </button>
                                                                )}
                                                                {task.status === 'acknowledged' && (
                                                                    <button 
                                                                        onClick={() => handleTaskUpdate(task._id, 'completed')}
                                                                        className="task-btn complete"
                                                                        title="Mark Completed"
                                                                    >
                                                                        <CheckCircle size={14} />
                                                                        <span>Done</span>
                                                                    </button>
                                                                )}
                                                                {task.status === 'completed' && (
                                                                    <div className="completed-badge">
                                                                        <UserCheck size={14} />
                                                                        <span>Completed</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-state">
                                                <p>No new messages or tasks</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                        </div>

                        {/* Real-Time Health Insights Grid */}
                        <motion.div variants={itemVariants} className="health-insights-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Today's Step Goal Card */}
                            <div className="insight-card steps-card">
                                <div className="card-bg-icon"><Footprints size={80} /></div>
                                <div className="insight-header">
                                    <div className="icon-circle"><Zap size={18} /></div>
                                    <span>Daily Activity</span>
                                </div>
                                <div className="insight-main">
                                    <h3>{dailyActivity.steps.toLocaleString()}</h3>
                                    <p>Steps Today</p>
                                </div>
                                <div className="insight-progress">
                                    <div className="progress-bar-bg">
                                        <div className="progress-fill" style={{ width: `${Math.min((dailyActivity.steps/10000)*100, 100)}%` }}></div>
                                    </div>
                                    <span>{Math.round((dailyActivity.steps/10000)*100)}% of Goal</span>
                                </div>
                            </div>

                            {/* Calories Burned */}
                            <div className="insight-card calories-card">
                                <div className="card-bg-icon"><Flame size={80} /></div>
                                <div className="insight-header">
                                    <div className="icon-circle"><Flame size={18} /></div>
                                    <span>Energy Spent</span>
                                </div>
                                <div className="insight-main">
                                    <h3>{dailyActivity.calories}</h3>
                                    <p>Kcal Burned</p>
                                </div>
                                <div className="insight-trend positive">
                                    <TrendingUp size={14} />
                                    <span>Real-time Active</span>
                                </div>
                            </div>

                            {/* Health Score */}
                            <div className="insight-card score-card">
                                <div className="card-bg-icon"><Heart size={80} /></div>
                                <div className="insight-header">
                                    <div className="icon-circle"><Activity size={18} /></div>
                                    <span>Overall Health</span>
                                </div>
                                <div className="insight-main">
                                    <h3>8.5</h3>
                                    <p>Health Score</p>
                                </div>
                                <div className="score-badge">OPTIMAL</div>
                            </div>

                            {/* Distance Covered */}
                            <div className="insight-card distance-card">
                                <div className="card-bg-icon"><Navigation size={80} /></div>
                                <div className="insight-header">
                                    <div className="icon-circle"><MapPin size={18} /></div>
                                    <span>Distance</span>
                                </div>
                                <div className="insight-main">
                                    <h3>{dailyActivity.distance}</h3>
                                    <p>Kilometers</p>
                                </div>
                                <div className="insight-subtext">{Math.round(dailyActivity.duration / 60)} mins active</div>
                            </div>
                        </motion.div>

                        {/* Today's Completed Activities Section */}
                        <motion.div variants={itemVariants} className="completed-activities-section">
                            <div className="section-header-lux">
                                <div className="title-group">
                                    <CheckCircle className="text-emerald-500" />
                                    <h2>Today's Completed Activities</h2>
                                </div>
                                <span className="streak-badge">
                                    <Flame size={16} /> {streakCount} Day Streak
                                </span>
                            </div>
                            
                            <div className="completed-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                {wellnessHistory[getISTDate()]?.length > 0 ? (
                                    wellnessHistory[getISTDate()].map((act, i) => (
                                        <div key={i} className="completed-activity-card">
                                            <div className="act-icon">{getTaskIcon(act.type)}</div>
                                            <div className="act-details">
                                                <h4>{act.title}</h4>
                                                <div className="act-meta">
                                                    <Clock size={10} /> {act.completedAt}
                                                </div>
                                                <div className="act-progress-pill">
                                                    <CheckCircle size={10} /> {act.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                        <p className="text-slate-400 font-medium">No activities completed yet today. Start your wellness journey!</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Wellness Analytics Dashboard */}
                        <motion.div variants={itemVariants} className="wellness-analytics-dashboard">
                            <div className="analytics-header">
                                <div className="title-group">
                                    <Activity className="text-blue-500" />
                                    <h2>Wellness Analytics</h2>
                                </div>
                                <div className="period-selector">
                                    {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
                                        <button 
                                            key={p} 
                                            className={`period-btn ${analyticsPeriod === p ? 'active' : ''}`}
                                            onClick={() => setAnalyticsPeriod(p)}
                                        >
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="analytics-grid grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                                <div className="lg:col-span-8 chart-card">
                                    <h3>Activity Progress Trends</h3>
                                    <div className="chart-wrapper h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={
                                                analyticsPeriod === 'daily' ? tasks.map(t => ({ name: t.title, value: t.progress || 0 })) :
                                                analyticsPeriod === 'weekly' ? Object.keys(wellnessHistory).slice(-7).map(d => ({ name: d.split('-').slice(1).join('/'), value: wellnessHistory[d].length * 11 })) :
                                                Object.keys(wellnessHistory).slice(-30).map(d => ({ name: d.split('-').slice(2), value: wellnessHistory[d].length * 11 }))
                                            }>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                <YAxis hide />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                />
                                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="lg:col-span-4 stats-summary-card">
                                    <div className="stat-row">
                                        <div className="stat-label">Total Completed</div>
                                        <div className="stat-value">{Object.values(wellnessHistory).flat().length}</div>
                                    </div>
                                    <div className="stat-row">
                                        <div className="stat-label">Daily Goal</div>
                                        <div className="stat-value">{tasks.filter(t => t.status === 'completed').length}/{tasks.length}</div>
                                    </div>
                                    <div className="stat-row">
                                        <div className="stat-label">Wellness Score</div>
                                        <div className="stat-value">{(tasks.filter(t => t.status === 'completed').length / tasks.length * 10).toFixed(1)}/10</div>
                                    </div>
                                    <div className="wellness-badge-display">
                                        <Star className="text-yellow-400 fill-yellow-400" size={40} />
                                        <span>Wellness Champion</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Secondary Analytics Row: Records & Charts */}
                        <div className="analytics-secondary-row grid grid-cols-1 lg:col-span-12 lg:grid-cols-12 gap-8">
                            {/* Medical Timeline & Recent Records */}
                            <div className="lg:col-span-8 medical-history-overview">
                                <div className="section-header-lux">
                                    <div className="title-group">
                                        <FileText className="text-blue-600" />
                                        <h2>Recent Medical Records</h2>
                                    </div>
                                    <button onClick={() => navigate('/patient/records')} className="view-all-link">View All Records</button>
                                </div>
                                
                                <div className="records-mini-list mt-4">
                                    {prescriptions.length > 0 ? (
                                        prescriptions.slice(0, 2).map((p, i) => (
                                            <div key={i} className="mini-record-item">
                                                <div className="record-icon rx"><Pill size={16} /></div>
                                                <div className="record-details">
                                                    <h4>Prescription: {p.medications?.[0]?.drugName || 'Consultation Record'}</h4>
                                                    <p>By Dr. {p.doctorId?.userName || 'Namma Clinic'} • {new Date(p.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <ChevronRight className="ml-auto text-slate-300" size={18} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-mini-record">No recent prescriptions</div>
                                    )}

                                    {labTests.length > 0 ? (
                                        labTests.slice(0, 2).map((l, i) => (
                                            <div key={i} className="mini-record-item">
                                                <div className="record-icon lab"><Activity size={16} /></div>
                                                <div className="record-details">
                                                    <h4>Lab Test: {l.testName}</h4>
                                                    <p>Status: <span className={l.status}>{l.status}</span> • {new Date(l.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <ChevronRight className="ml-auto text-slate-300" size={18} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-mini-record">No recent lab reports</div>
                                    )}
                                </div>

                                <div className="chart-container-lux mt-8">
                                    <h3>Weekly Vitals Activity</h3>
                                    <div className="chart-box" style={{ height: '220px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={healthTrendsData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <Tooltip 
                                                    cursor={{ fill: '#f8fafc' }}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                />
                                                <Bar dataKey="hr" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                                <Bar dataKey="bp" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Water & Appointment Summary */}
                            <div className="lg:col-span-4 side-summary-cards flex flex-col gap-6">
                                <div className="summary-mini-card appointment-summary">
                                    <div className="mini-header">
                                        <Calendar size={16} />
                                        <span>Next Appointment</span>
                                    </div>
                                    {appointments.find(a => a.status === 'scheduled') ? (
                                        <div className="next-apt-box">
                                            <h4>{new Date(appointments.find(a => a.status === 'scheduled').appointmentDate).toLocaleDateString()}</h4>
                                            <p>{appointments.find(a => a.status === 'scheduled').appointmentTime}</p>
                                            <span className="dr-tag">Dr. {appointments.find(a => a.status === 'scheduled').doctorId?.userName}</span>
                                        </div>
                                    ) : (
                                        <div className="empty-apt-state">No scheduled appointments</div>
                                    )}
                                </div>

                                <div className="summary-mini-card water-intake">
                                    <div className="mini-header">
                                        <Zap size={16} className="text-blue-500" />
                                        <span>Water Intake</span>
                                    </div>
                                    <div className="water-stats">
                                        <div className="water-main">
                                            <h3>{dailyActivity.water}<span>/{dailyActivity.waterGoal}L</span></h3>
                                            <p>Stay hydrated!</p>
                                        </div>
                                        <div className="water-drops flex gap-1 mt-2 mb-4">
                                            {[...Array(8)].map((_, i) => (
                                                <div key={i} className={`drop ${i < (dailyActivity.water / dailyActivity.waterGoal) * 8 ? 'active' : ''}`}></div>
                                            ))}
                                        </div>
                                        <button 
                                            className="add-water-btn-lux"
                                            onClick={async () => {
                                                try {
                                                    const today = new Date().toISOString().split('T')[0];
                                                    const res = await api.post('/activity/update-water', { amount: 0.25, date: today });
                                                    if (res.data.success) {
                                                        setDailyActivity(prev => ({ ...prev, water: res.data.data.amount }));
                                                    }
                                                } catch (err) {
                                                    console.error('Error updating water:', err);
                                                }
                                            }}
                                        >
                                            + Add 250ml
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 9: Child Growth & Parent Care */}
                        <motion.div variants={itemVariants} className="child-care-section mt-12 mb-8">
                            <div className="section-title-row">
                                <h2 className="title-with-icon">
                                    <div className="icon-box child-box">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    Child Growth & Parent Care
                                </h2>
                                <button className="add-child-btn-lux" onClick={() => navigate('/child-care')}>
                                    + Add Child Profile
                                </button>
                            </div>

                            <div className="child-care-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                {childProfiles.length > 0 ? (
                                    childProfiles.map((child, idx) => (
                                        <div key={idx} className="child-profile-card-premium">
                                            <div className="child-card-header">
                                                <div className="avatar-box">
                                                    {child.childName.charAt(0)}
                                                </div>
                                                <div className="child-meta">
                                                    <h4>{child.childName}</h4>
                                                    <span className="age-tag">{Math.floor((new Date() - new Date(child.childDob)) / (1000 * 60 * 60 * 24 * 365.25))}Y Old</span>
                                                </div>
                                            </div>
                                            <div className="growth-summary mt-4">
                                                <div className="growth-stat">
                                                    <span className="lbl">Height</span>
                                                    <span className="val">{child.growthRecords?.[child.growthRecords.length - 1]?.height || '--'} cm</span>
                                                </div>
                                                <div className="growth-stat">
                                                    <span className="lbl">Weight</span>
                                                    <span className="val">{child.growthRecords?.[child.growthRecords.length - 1]?.weight || '--'} kg</span>
                                                </div>
                                            </div>
                                            <button className="view-details-btn" onClick={() => navigate(`/child-care/${child._id}`)}>
                                                Growth Details <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-child-card col-span-1 lg:col-span-2">
                                        <div className="empty-icon-bg"><Bot size={32} /></div>
                                        <div className="empty-text">
                                            <h4>No Child Profiles</h4>
                                            <p>Track your children's growth and get nutrition advice.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="parent-smart-search-box">
                                    <div className="smart-header">
                                        <Sparkles size={16} />
                                        <span>Parent Smart Search</span>
                                    </div>
                                    <div className="search-input-wrapper">
                                        <Search size={16} />
                                        <input 
                                            type="text" 
                                            placeholder="Best foods for 2 year old..." 
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleChildSearch(e.target.value);
                                                }
                                            }}
                                        />
                                        {childSearchLoading && <Loader2 className="animate-spin" size={14} />}
                                    </div>
                                    <div className="search-results-mini mt-3">
                                        {childSearchResults.map((res, i) => (
                                            <div key={i} className="search-res-item bg-white/10 p-2 rounded-lg mb-2">
                                                <strong>{res.topic}:</strong> {res.advice}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="search-tips">
                                        <span>Try: "Vaccination schedule" or "Sleep guidance"</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* AI Health Assistant */}
                        <motion.div variants={itemVariants} className="ai-consultation-row">
                            <div className="ai-consultation-card">
                                <div className="consultation-blur-bg">
                                    <Sparkles size={120} />
                                </div>
                                <div className="consultation-header">
                                    <div className="consultation-icon-wrapper">
                                        <Bot className="text-white w-8 h-8" />
                                    </div>
                                    <div className="consultation-title-area">
                                        <h2>AI Health <span>Assistant</span></h2>
                                        <p>Get instant insights about your symptoms or medical records.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowChat(true)}
                                        className="btn-consultation"
                                    >
                                        Start Consultation
                                    </button>
                                </div>

                                <div className="consultation-features">
                                    {[
                                        { title: 'Symptom Checker', desc: 'AI-driven analysis', icon: <Activity size={20} /> },
                                        { title: 'Record Insights', desc: 'Summary of history', icon: <FileText size={20} /> },
                                        { title: 'Medication Info', desc: 'Dosage & side effects', icon: <Pill size={20} /> },
                                        { title: 'Lifestyle Tips', desc: 'Daily health advice', icon: <Zap size={20} /> }
                                    ].map((feature, i) => (
                                        <div 
                                            key={i} 
                                            className="feature-box"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                const modulePath = feature.title.toLowerCase().replace(/\s+/g, '-');
                                                navigate(`/ai-assistance/${modulePath}`);
                                            }}
                                        >
                                            <div className="feature-icon-wrapper">
                                                {feature.icon}
                                            </div>
                                            <div className="feature-text-area">
                                                <h4>{feature.title}</h4>
                                                <p>{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                        {showChat && <AIHealthAssistant onClose={() => setShowChat(false)} context={getAIContext()} />}
                    </motion.div>
                )}

                {/* CLINICS TAB */}
                {activeTab === 'clinics' && (
                    <div className="clinics-content">
                        <div className="map-cta-container p-8 bg-white rounded-3xl shadow-xl border border-emerald-100 text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Navigation className="text-emerald-600 w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Find Clinics Near You</h2>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                Use our new interactive map to find nearby medical clinics, get real-time distances, and step-by-step directions.
                            </p>
                            <a 
                                href="/find-clinic.html" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-emerald-200 hover:-translate-y-1"
                            >
                                <MapPin size={20} />
                                Open Interactive Map
                            </a>
                        </div>

                        {/* Clinic List */}
                        <div className="clinic-list-section mt-30">
                            <h2>📋 Nearby Clinics (Sorted by Distance)</h2>
                            {filteredClinics.length > 0 ? (
                                <div className="clinic-cards-grid">
                                    {filteredClinics.map((clinic, index) => {
                                        const isNearest = index === 0 && clinic.distance;
                                        const getDistanceClass = (distance) => {
                                            if (!distance) return '';
                                            const dist = parseFloat(distance);
                                            if (dist < 5) return 'dist-short';
                                            if (dist < 10) return 'dist-medium';
                                            return 'dist-long';
                                        };

                                        return (
                                            <div key={clinic._id} className="clinic-list-item bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-extrabold text-emerald-700 m-0 leading-tight">
                                                            {clinic.clinicName}
                                                        </h3>
                                                        {isNearest && (
                                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Nearest</span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-0.5 mb-3">
                                                        <h4 className="text-sm font-bold text-slate-700 m-0">Dr. {clinic.userName}</h4>
                                                        <p className="text-xs text-slate-500 font-medium">{clinic.specialization || 'General Clinic'}</p>
                                                    </div>

                                                    <div className="flex items-start gap-2 text-slate-400 mb-2">
                                                        <MapPin size={12} className="mt-1 flex-shrink-0" />
                                                        <p className="text-[12px] leading-relaxed font-medium m-0">
                                                            {clinic.address || clinic.clinicAddress || 'Address not available'}{clinic.pincode && `, ${clinic.pincode}`}
                                                        </p>
                                                    </div>

                                                    {clinic.distance && (
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50">
                                                            <Activity size={12} />
                                                            <span className="text-[11px] font-black uppercase tracking-wider">{clinic.distance} KM Away</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 md:self-stretch">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedClinic(clinic);
                                                            setBookingData({ ...bookingData, doctorId: clinic._id });
                                                            setShowBookingModal(true);
                                                        }}
                                                        className="flex-1 md:flex-initial h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-900/10"
                                                    >
                                                        <Calendar size={16} />
                                                        Book
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('/reviews', { state: { clinicId: clinic._id } })}
                                                        className="h-11 px-4 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-xl flex items-center justify-center transition-all shadow-sm font-bold text-xs"
                                                        title="Write Review"
                                                    >
                                                        <Star size={16} className="mr-1" /> Review
                                                    </button>
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.address || clinic.clinicAddress || ''} ${clinic.pincode || ''}`.trim() || 'Clinic')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="h-11 w-11 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl flex items-center justify-center transition-all shadow-sm"
                                                        title="Get Directions"
                                                    >
                                                        <Navigation size={18} />
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="no-data">No clinics found. Try searching for a different location.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* APPOINTMENTS TAB */}
                {activeTab === 'appointments' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="appointments-content p-8"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h1 className="text-3xl font-black text-slate-800">📅 Appointment Center</h1>
                                <p className="text-slate-500 font-medium">Manage your clinical visits and consultation history.</p>
                            </div>
                            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all" onClick={() => setShowBookingModal(true)}>
                                + Book New Appointment
                            </button>
                        </div>

                        {uploadMessage.text && (
                            <div className={`p-4 rounded-xl mb-8 flex items-center gap-3 ${uploadMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                <Activity size={18} />
                                <span className="font-bold">{uploadMessage.text}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Left: Upcoming */}
                            <div className="lg:col-span-4">
                                <div className="section-header-lux mb-6">
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <Clock className="text-blue-500" /> Upcoming
                                    </h2>
                                </div>
                                
                                <div className="space-y-4">
                                    {allUpcoming.length > 0 ? (
                                        allUpcoming.map((apt) => (
                                            <div key={apt._id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="date-box-mini">
                                                        <span className="font-black text-emerald-600">{new Date(apt.appointmentDate).getDate()}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${apt.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {apt.status}
                                                    </span>
                                                </div>
                                                <h4 className="font-black text-slate-800 mb-1">Dr. {apt.doctorId?.userName}</h4>
                                                <p className="text-sm font-bold text-slate-500 mb-4">{apt.appointmentTime}</p>
                                                <div className="flex gap-2">
                                                    <button className="flex-1 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors">Cancel</button>
                                                    <button className="flex-1 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-600 hover:text-white transition-colors">Reschedule</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                            <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
                                            <p className="text-slate-400 font-bold">No upcoming visits</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: History */}
                            <div className="lg:col-span-8">
                                <div className="section-header-lux mb-6">
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <History className="text-emerald-500" /> Visit History
                                    </h2>
                                </div>
                                <AppointmentHistory patientId={user.id} role="patient" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* PRESCRIPTIONS TAB */}
                {activeTab === 'prescriptions' && (
                    <div className="prescriptions-content-lux space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div className="title-area">
                                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
                                        <Pill size={28} />
                                    </div>
                                    My Prescription Records
                                </h1>
                                <p className="text-slate-500 font-medium mt-2 ml-14">Securely view, download, and manage your clinical Rx history.</p>
                            </div>
                            
                            <div className="filter-controls flex gap-3">
                                <div className="search-box-premium">
                                    <Search size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search by doctor or ID..." 
                                        value={prescriptionSearch}
                                        onChange={(e) => setPrescriptionSearch(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="filter-select-premium"
                                    value={prescriptionTypeFilter}
                                    onChange={(e) => setPrescriptionTypeFilter(e.target.value)}
                                >
                                    <option value="all">All Records</option>
                                    <option value="ai">AI Generated</option>
                                    <option value="manual">Manual Entry</option>
                                </select>
                            </div>
                        </div>

                        <div className="prescriptions-layout-grid">
                            {prescriptions.filter(p => p.status === 'completed').length > 0 ? (
                                <div className="prescriptions-grid-container px-2">
                                    {/* LATEST PRESCRIPTION HIGHLIGHT */}
                                    {prescriptions.filter(p => p.status === 'completed').filter(p => {
                                        const matchesSearch = !prescriptionSearch || 
                                            p.doctorId?.userName?.toLowerCase().includes(prescriptionSearch.toLowerCase()) ||
                                            p._id.toLowerCase().includes(prescriptionSearch.toLowerCase());
                                        const matchesType = prescriptionTypeFilter === 'all' || 
                                            (prescriptionTypeFilter === 'ai' ? p.isAIProcessed : !p.isAIProcessed);
                                        return matchesSearch && matchesType;
                                    }).length > 0 ? (
                                        <>
                                            {/* Latest Highlight */}
                                            {prescriptionSearch === '' && prescriptionTypeFilter === 'all' && (
                                                <div className="latest-rx-section mb-10">
                                                    <div className="section-label flex items-center gap-2 mb-4">
                                                        <Sparkles size={16} className="text-amber-500" />
                                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Most Recent Consultation</span>
                                                    </div>
                                                    <div className="latest-rx-card-premium bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                                                        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                                                            <FileText size={200} />
                                                        </div>
                                                        
                                                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                            <div className="col-span-2">
                                                                <div className="flex items-center gap-4 mb-6">
                                                                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                                        <Stethoscope size={32} />
                                                                    </div>
                                                                    <div>
                                                                        <h2 className="text-2xl font-black">Dr. {prescriptions.filter(p => p.status === 'completed')[0].doctorId?.userName || 'Clinical Staff'}</h2>
                                                                        <p className="text-blue-100 font-bold">{prescriptions.filter(p => p.status === 'completed')[0].doctorId?.clinicName || 'Namma Health Clinic'}</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                                                    <div className="stat-pill bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                                                                        <p className="text-[10px] font-black uppercase text-blue-200 mb-1">Date</p>
                                                                        <p className="font-bold">{new Date(prescriptions.filter(p => p.status === 'completed')[0].createdAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                    <div className="stat-pill bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                                                                        <p className="text-[10px] font-black uppercase text-blue-200 mb-1">Record ID</p>
                                                                        <p className="font-bold">RX-{prescriptions.filter(p => p.status === 'completed')[0]._id.slice(-8).toUpperCase()}</p>
                                                                    </div>
                                                                    <div className="stat-pill bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                                                                        <p className="text-[10px] font-black uppercase text-blue-200 mb-1">Source</p>
                                                                        <p className="font-bold flex items-center gap-1.5">
                                                                            {prescriptions.filter(p => p.status === 'completed')[0].isAIProcessed ? <Sparkles size={14} /> : <User size={14} />}
                                                                            {prescriptions.filter(p => p.status === 'completed')[0].isAIProcessed ? 'AI Smart' : 'Medical Staff'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="stat-pill bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                                                                        <p className="text-[10px] font-black uppercase text-blue-200 mb-1">Meds</p>
                                                                        <p className="font-bold">{prescriptions.filter(p => p.status === 'completed')[0].medications?.length || 0} Items</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="diagnosis-summary-box p-5 bg-white/5 rounded-3xl border border-white/5">
                                                                    <p className="text-xs font-bold text-blue-200 mb-2">Diagnosis & Clinical Observation</p>
                                                                    <p className="text-sm line-clamp-2 italic">"{prescriptions.filter(p => p.status === 'completed')[0].diagnosis || prescriptions.filter(p => p.status === 'completed')[0].clinicalNotes || 'Observation records maintained digitally.'}"</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex flex-col justify-center gap-4">
                                                                <a 
                                                                    href={prescriptions.filter(p => p.status === 'completed')[0].digitalPrescriptionPdf ? `http://localhost:5000/${prescriptions.filter(p => p.status === 'completed')[0].digitalPrescriptionPdf.replace(/\\/g, '/')}` : '#'}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="h-16 bg-white text-blue-600 rounded-3xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-900/20"
                                                                >
                                                                    <Eye size={24} /> View Digital Rx
                                                                </a>
                                                                <a 
                                                                    href={prescriptions.filter(p => p.status === 'completed')[0].digitalPrescriptionPdf ? `http://localhost:5000/${prescriptions.filter(p => p.status === 'completed')[0].digitalPrescriptionPdf.replace(/\\/g, '/')}` : '#'}
                                                                    download
                                                                    className="h-16 bg-blue-500/30 text-white border border-white/20 backdrop-blur-md rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-blue-500/40 transition-all"
                                                                >
                                                                    <Download size={24} /> Download PDF
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* HISTORY GRID */}
                                            <div className="history-section">
                                                <div className="section-label flex items-center gap-2 mb-6">
                                                    <History size={16} className="text-slate-400" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Previous Clinical History</span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {prescriptions
                                                        .filter(p => p.status === 'completed')
                                                        .filter(p => {
                                                            const matchesSearch = !prescriptionSearch || 
                                                                p.doctorId?.userName?.toLowerCase().includes(prescriptionSearch.toLowerCase()) ||
                                                                p._id.toLowerCase().includes(prescriptionSearch.toLowerCase());
                                                            const matchesType = prescriptionTypeFilter === 'all' || 
                                                                (prescriptionTypeFilter === 'ai' ? p.isAIProcessed : !p.isAIProcessed);
                                                            
                                                            if (prescriptionSearch === '' && prescriptionTypeFilter === 'all') {
                                                                const completedPxs = prescriptions.filter(px => px.status === 'completed');
                                                                return p._id !== completedPxs[0]?._id && matchesSearch && matchesType;
                                                            }
                                                            return matchesSearch && matchesType;
                                                        })
                                                        .map((p) => (
                                                            <motion.div 
                                                                key={p._id}
                                                                layout
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="rx-history-card-lux bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-blue-900/5 transition-all group"
                                                            >
                                                                <div className="flex justify-between items-start mb-6">
                                                                    <div className="p-3 bg-slate-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                        <FileText size={20} />
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RX ID</p>
                                                                        <p className="text-xs font-bold text-slate-700">#{p._id.slice(-8).toUpperCase()}</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="mb-6">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prescribed By</p>
                                                                    <h4 className="font-black text-slate-800 text-lg">Dr. {p.doctorId?.userName || 'Medical Staff'}</h4>
                                                                    <p className="text-sm font-medium text-slate-500">{new Date(p.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-2 mb-6">
                                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${p.isAIProcessed ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                                        {p.isAIProcessed ? 'AI Generated' : 'Hospital Entry'}
                                                                    </span>
                                                                    <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-slate-100">
                                                                        {p.medications?.length || 0} Medications
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className="flex gap-2">
                                                                    <a 
                                                                        href={p.digitalPrescriptionPdf ? `http://localhost:5000/${p.digitalPrescriptionPdf.replace(/\\/g, '/')}` : '#'}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="flex-1 h-11 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                                                                    >
                                                                        <Eye size={16} /> View
                                                                    </a>
                                                                    <a 
                                                                        href={p.digitalPrescriptionPdf ? `http://localhost:5000/${p.digitalPrescriptionPdf.replace(/\\/g, '/')}` : '#'}
                                                                        download
                                                                        className="w-11 h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100"
                                                                    >
                                                                        <Download size={18} />
                                                                    </a>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="empty-state-lux p-20 text-center col-span-full">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                                <Search size={40} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-800 mb-2">No matching records found</h3>
                                            <p className="text-slate-500 font-medium">Try adjusting your search or filters to find specific prescriptions.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="empty-state-lux p-20 text-center bg-white rounded-[40px] border border-slate-100 col-span-full">
                                    <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FileText size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-2">No Prescriptions Available</h3>
                                    <p className="text-slate-500 font-medium max-w-md mx-auto">Once your doctor uploads or generates a digital prescription, it will appear here automatically for you to view and download.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* LAB TESTS TAB */}
                {activeTab === 'labTests' && (
                    <div className="labtests-content">
                        <h1>🔬 Lab Test Results</h1>
                        <div className="lab-test-list-section">
                            {labTests.length > 0 ? (
                                <div className="lab-tests-grid">
                                    {labTests.map(test => (
                                        <div key={test._id} className="lab-test-card">
                                            <div className="lab-test-header">
                                                <h3>{test.testName}</h3>
                                                <span className={`status-badge status-${test.status}`}>{test.status}</span>
                                            </div>
                                            <div className="lab-test-info">
                                                <p><strong>Date:</strong> {new Date(test.createdAt).toLocaleDateString()}</p>
                                                <p><strong>Doctor:</strong> Dr. {test.orderedBy?.userName || 'N/A'}</p>
                                                <p><strong>Ref Number:</strong> {test.referenceNumber || 'N/A'}</p>
                                            </div>
                                            <div className="lab-test-actions">
                                                {test.digitalLabTestPdf ? (
                                                    <a
                                                        href={`http://localhost:5000/${test.digitalLabTestPdf}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-lab-test btn-lab-test-primary"
                                                    >
                                                        <Download size={18} /> Download PDF
                                                    </a>
                                                ) : (
                                                    <div className="ai-badge-label status-pending-text">
                                                        <Clock size={16} /> Report Processing...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">No lab tests records found.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'reviews' && (
                    <div className="reviews-content">
                        <div className="flex-between-center mb-30">
                            <div className="section-header-title">
                                <h1>⭐ My Reviews & Feedback</h1>
                                <p className="text-slate-500 text-sm">Manage and view your healthcare experiences</p>
                            </div>
                            <button className="btn-primary-compact flex items-center gap-1.5" onClick={() => navigate('/reviews')}>
                                <MessageSquarePlus size={16} />
                                Write New Review
                            </button>
                        </div>

                        {loadingReviews ? (
                            <div className="flex flex-col items-center py-20">
                                <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                                <p className="text-slate-500 font-medium">Loading your experiences...</p>
                            </div>
                        ) : myReviews.length > 0 ? (
                            <div className="reviews-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {myReviews.map((review) => (
                                    <motion.div 
                                        key={review._id} 
                                        whileHover={{ y: -5 }}
                                        onClick={() => {
                                            setSelectedReview(review);
                                            setShowReviewDetail(true);
                                        }}
                                        className="review-card-premium cursor-pointer"
                                    >
                                        <div className="card-top-info p-4 border-b border-slate-50">
                                            <div className="patient-mini-profile flex items-center gap-3 mb-4">
                                                <img 
                                                    src={user.profilePhoto ? `http://localhost:5000/${user.profilePhoto}` : `https://ui-avatars.com/api/?name=${user.name}&background=1E88E5&color=fff`} 
                                                    alt="Patient" 
                                                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-slate-800 leading-tight">{user.name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {user.uhid || 'P-10234'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="doctor-mini-info bg-slate-50 rounded-2xl p-3">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Reviewed Doctor</p>
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={review.clinicId?.profilePhoto ? `http://localhost:5000/${review.clinicId.profilePhoto}` : `https://ui-avatars.com/api/?name=Dr+${review.clinicId?.userName}&background=43A047&color=fff`} 
                                                        alt="Doctor" 
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                    <div>
                                                        <h5 className="text-xs font-bold text-slate-700">Dr. {review.clinicId?.userName}</h5>
                                                        <p className="text-[10px] text-emerald-600 font-medium">{review.clinicId?.specialization || 'General Physician'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-comment-preview p-4">
                                            <div className="flex text-amber-400 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={2.5} />
                                                ))}
                                            </div>
                                            <p className="text-sm text-slate-600 line-clamp-3 italic">"{review.comment}"</p>
                                        </div>

                                        <div className="card-footer-meta p-3 bg-slate-50/50 flex justify-between items-center rounded-b-3xl">
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            <div className={`sentiment-indicator-tag flex items-center gap-1.5 px-2 py-1 rounded-full ${
                                                review.aiSentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' : 
                                                review.aiSentiment === 'negative' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    review.aiSentiment === 'positive' ? 'bg-emerald-500' : 
                                                    review.aiSentiment === 'negative' ? 'bg-rose-500' : 'bg-slate-400'
                                                }`}></div>
                                                <span className="text-[9px] font-black uppercase">{review.aiSentiment}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-card text-center py-40 bg-white rounded-3xl shadow-sm border border-slate-100">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare size={32} className="text-slate-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No Reviews Yet</h3>
                                <p className="text-slate-400 max-w-xs mx-auto mb-8">You haven't shared your healthcare experience with any providers yet.</p>
                                <button className="btn-primary" onClick={() => navigate('/reviews')}>
                                    Submit Your First Review
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Advanced Review Detail Modal */}
                <AnimatePresence>
                    {showReviewDetail && selectedReview && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="modal-overlay"
                            onClick={() => setShowReviewDetail(false)}
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="modal-content-premium max-w-2xl w-full"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="modal-header-glass border-b border-slate-100 p-6 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                            <Star size={24} fill="currentColor" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Review Details</h2>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{new Date(selectedReview.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors" onClick={() => setShowReviewDetail(false)}>
                                        <X size={24} className="text-slate-400" />
                                    </button>
                                </div>

                                <div className="modal-scroll-area p-8 max-h-[70vh] overflow-y-auto">
                                    {/* Dual Profile Row */}
                                    <div className="grid grid-cols-2 gap-8 mb-10">
                                        <div className="patient-detail-box p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-widest">Feedback From</p>
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={user.profilePhoto ? `http://localhost:5000/${user.profilePhoto}` : `https://ui-avatars.com/api/?name=${user.name}&background=1E88E5&color=fff`} 
                                                    alt="Patient" 
                                                    className="w-14 h-14 rounded-full border-4 border-white shadow-md"
                                                />
                                                <div>
                                                    <h3 className="font-black text-slate-800">{user.name}</h3>
                                                    <p className="text-xs text-blue-600 font-bold uppercase">ID: {user.uhid || 'P-10234'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="doctor-detail-box p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                                            <p className="text-[10px] font-black text-emerald-400 uppercase mb-4 tracking-widest">Reviewed Doctor</p>
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={selectedReview.clinicId?.profilePhoto ? `http://localhost:5000/${selectedReview.clinicId.profilePhoto}` : `https://ui-avatars.com/api/?name=Dr+${selectedReview.clinicId?.userName}&background=43A047&color=fff`} 
                                                    alt="Doctor" 
                                                    className="w-14 h-14 rounded-full border-4 border-white shadow-md"
                                                />
                                                <div>
                                                    <h3 className="font-black text-slate-800">Dr. {selectedReview.clinicId?.userName}</h3>
                                                    <p className="text-xs text-emerald-600 font-bold uppercase">{selectedReview.clinicId?.specialization || 'General Physician'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="feedback-text-area mb-8 p-6 bg-slate-50 rounded-3xl relative">
                                        <Bot size={40} className="absolute -top-5 -right-5 text-blue-500/20" />
                                        <h4 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Conversation & Feedback</h4>
                                        <p className="text-lg text-slate-700 leading-relaxed font-medium italic">"{selectedReview.comment}"</p>
                                    </div>

                                    {/* Granular Ratings */}
                                    <div className="advanced-ratings-container grid grid-cols-2 gap-4 mb-8">
                                        {[
                                            { label: 'Doctor Communication', value: selectedReview.communication || selectedReview.rating, icon: <MessageSquare size={16} /> },
                                            { label: 'Treatment Quality', value: selectedReview.treatment || selectedReview.rating, icon: <Activity size={16} /> },
                                            { label: 'Waiting Time Efficiency', value: selectedReview.waitingTime || selectedReview.rating, icon: <Clock size={16} /> },
                                            { label: 'Overall Experience', value: selectedReview.rating, icon: <Sparkles size={16} /> }
                                        ].map((rat, i) => (
                                            <div key={i} className="rating-row-premium flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-blue-500">{rat.icon}</div>
                                                    <span className="text-xs font-bold text-slate-600">{rat.label}</span>
                                                </div>
                                                <div className="flex gap-0.5 text-amber-400">
                                                    {[...Array(5)].map((_, idx) => (
                                                        <Star key={idx} size={12} fill={idx < rat.value ? "currentColor" : "none"} strokeWidth={2.5} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Resolution & Recommendation */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`resolution-box flex items-center gap-3 p-4 rounded-2xl ${selectedReview.issueResolved !== false ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-rose-50 border border-rose-100 text-rose-700'}`}>
                                            <CheckCircle size={20} />
                                            <div>
                                                <p className="text-[10px] font-black uppercase opacity-60">Issue Status</p>
                                                <p className="text-sm font-bold">{selectedReview.issueResolved !== false ? 'Issue Resolved' : 'Unresolved'}</p>
                                            </div>
                                        </div>
                                        <div className={`recommend-box flex items-center gap-3 p-4 rounded-2xl ${selectedReview.recommend !== false ? 'bg-blue-50 border border-blue-100 text-blue-700' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>
                                            <Heart size={20} fill={selectedReview.recommend !== false ? "currentColor" : "none"} />
                                            <div>
                                                <p className="text-[10px] font-black uppercase opacity-60">Recommendation</p>
                                                <p className="text-sm font-bold">{selectedReview.recommend !== false ? 'Highly Recommended' : 'Neutral'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer-lux p-6 bg-slate-50 flex justify-between items-center rounded-b-3xl">
                                    <div className="flex items-center gap-2">
                                        <Zap size={16} className="text-amber-500" />
                                        <span className="text-xs font-bold text-slate-500 uppercase">Consultation Type: In-Clinic</span>
                                    </div>
                                    <button className="btn-banner-white" onClick={() => setShowReviewDetail(false)}>Close Review</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Assuming Navbar is rendered here or similar structure */}
                {/* This is a placeholder for where NotificationCenter would be added in a Navbar */}
                {/* <NotificationCenter /> */}
                {/* <button className="nav-icon-btn" onClick={toggleTheme}> */}
                {/*     {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} */}
                {/* </button> */}
                {/* <button className="nav-icon-btn" onClick={handleLogout}> */}
                {/*     <LogOut size={20} /> */}
                {/* </button> */}

                {
                    activeTab === 'profile' && (
                        <div className="profile-tab-container">
                            <ProfileSettings />
                            

                        </div>
                    )
                }
                {activeTab === 'about' && <About />}

            <Footer links={[
                { label: 'Home', onClick: () => setActiveTab('home') },
                { label: 'Clinics', onClick: () => setActiveTab('clinics') },
                { label: 'Appointments', onClick: () => setActiveTab('appointments') },
                { label: 'My Prescriptions', onClick: () => setActiveTab('prescriptions') },
                { label: 'My Lab Tests', onClick: () => setActiveTab('labTests') },
                { label: 'Profile', onClick: () => setActiveTab('profile') },
                { label: 'About', onClick: () => setActiveTab('about') }
            ]} />
            {/* Booking Modal */}
            {
                showBookingModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Book New Appointment</h2>
                                <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleBookAppointment} className="booking-form">
                                <div className="form-group">
                                    <label>Select Doctor*</label>
                                    <select
                                        required
                                        value={bookingData.doctorId}
                                        onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                                    >
                                        <option value="">-- Choose a Doctor --</option>
                                        {clinics.map(d => (
                                            <option key={d._id} value={d._id}>Dr. {d.userName} ({d.clinicName})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row grid-2-gap-15">
                                    <div className="form-group">
                                        <label>Appointment Date*</label>
                                        <input
                                            type="date"
                                            required
                                            min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
                                            value={bookingData.appointmentDate}
                                            onChange={(e) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Preferred Time*</label>
                                        <input
                                            type="time"
                                            required
                                            value={bookingData.appointmentTime}
                                            onChange={(e) => setBookingData({ ...bookingData, appointmentTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Type*</label>
                                    <select
                                        value={bookingData.type}
                                        onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                                    >
                                        <option value="scheduled">Scheduled Consultation</option>
                                        <option value="teleconsultation">Teleconsultation</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Chief Complaint / Notes</label>
                                    <textarea
                                        placeholder="Reason for appointment..."
                                        value={bookingData.chiefComplaint}
                                        onChange={(e) => setBookingData({ ...bookingData, chiefComplaint: e.target.value })}
                                        rows="3"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowBookingModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-submit">Confirm Booking Request</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </DashboardLayout>
    );
};

export default PatientDashboard;

