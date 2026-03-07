import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axiosInstance';
import DigitalIDCard from '../components/DigitalIDCard';
import ClinicMap from '../components/ClinicMap';
import Footer from '../components/Footer';
import AIHealthAssistant from '../components/AIHealthAssistant';
import SymptomChecker from '../ai_modules/symptom-checker';
import RecordInsights from '../ai_modules/record-insights';
import MedicationInfo from '../ai_modules/medication-info';
import LifestyleTips from '../ai_modules/lifestyle-tips';
import About from './About';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Heart, Activity, Calendar, FileText, Pill, Search, MapPin, Navigation, MessageSquare, MessageSquarePlus, CheckCircle, User, UserCheck, LogOut, Sparkles, Bot, Zap, Download, Clock, Star } from 'lucide-react';
import logo from '../assets/Namma Clinic logo.jpeg';
import {
    LineChart,
    Line,
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
import './PatientDashboard.css';

const PatientDashboard = () => {
    const { user, updateUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [myReviews, setMyReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState({ lat: 13.0827, lng: 80.2707 });
    const [loading, setLoading] = useState(true);
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
    const [showSymptomChecker, setShowSymptomChecker] = useState(false);
    const [showRecordInsights, setShowRecordInsights] = useState(false);
    const [showMedicationInfo, setShowMedicationInfo] = useState(false);
    const [showLifestyleTips, setShowLifestyleTips] = useState(false);

    // Mock data for graphs
    const healthTrendsData = [
        { name: 'Jan', bp: 120, hr: 72 },
        { name: 'Feb', bp: 122, hr: 75 },
        { name: 'Mar', bp: 118, hr: 70 },
        { name: 'Apr', bp: 125, hr: 78 },
        { name: 'May', bp: 121, hr: 74 },
        { name: 'Jun', bp: 119, hr: 71 },
    ];

    const appointmentTypeData = [
        { name: 'Checkup', value: 4 },
        { name: 'Follow-up', value: 3 },
        { name: 'Consultation', value: 2 },
        { name: 'Emergency', value: 1 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    useEffect(() => {
        fetchPatientData();
    }, []);

    const fetchPatientData = async () => {
        try {
            const [appointmentsRes, prescriptionsRes, labTestsRes, clinicsRes] = await Promise.all([
                api.get(`/appointments/patient/${user.id}`),
                api.get(`/prescriptions/patient/${user.id}`),
                api.get(`/lab-tests/patient/${user.id}`),
                api.get(`/clinics`)
            ]);

            setAppointments(appointmentsRes.data.data);
            setPrescriptions(prescriptionsRes.data.data);
            setLabTests(labTestsRes.data.data);
            // Filter only doctors
            setClinics(clinicsRes.data.data.filter(c => c.userType === 'doctor'));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching patient data:', error);
            setLoading(false);
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
            pdf.save(`${user.name}_Profile_HealthOne.pdf`);
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
        } else {
            aptDate.setHours(23, 59, 59, 999);
        }
        return aptDate >= new Date();
    };
    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchMyReviews();
        }
    }, [activeTab]);

    const fetchMyReviews = async () => {
        try {
            setLoadingReviews(true);
            const res = await api.get('/reviews/admin/all'); // We'll filter on frontend for simplicity or add a specific route
            const filtered = res.data.data.filter(r => r.patientId?._id === user.id);
            setMyReviews(filtered);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoadingReviews(false);
        }
    };
    const allUpcoming = appointments.filter(apt => isAppointmentUpcoming(apt) && apt.status !== 'cancelled').sort((a,b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    const upcomingAppointments = allUpcoming.slice(0, 3);
    const pastAppointments = appointments.filter(apt => !isAppointmentUpcoming(apt) || apt.status === 'cancelled').sort((a,b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    // Get active medications from recent prescriptions
    const activeMedications = prescriptions
        .slice(0, 2)
        .flatMap(p => p.medications)
        .slice(0, 5);

    // Get pending lab tests
    const pendingLabTests = labTests.filter(test =>
        test.status === 'ordered' || test.status === 'sample-collected'
    ).slice(0, 3);

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

    return (
        <div className="patient-dashboard">
            {/* Top Navigation Bar */}
            <nav className="top-navbar">
                <div className="navbar-brand">
                    <img src={logo} alt="Namma Clinic" className="navbar-logo" />
                    <div className="brand-text">
                        <h2>Namma Clinic</h2>
                    </div>
                </div>

                <div className="navbar-menu">
                    {[
                        { id: 'home', label: 'Dashboard' },
                        { id: 'clinics', label: 'Clinics' },
                        { id: 'appointments', label: 'Appointments' },
                        { id: 'prescriptions', label: 'Prescriptions' },
                        { id: 'labTests', label: 'Records' },
                        { id: 'reviews', label: 'My Reviews' },
                        { id: 'profile', label: 'Profile' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={activeTab === tab.id ? 'active' : ''}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="navbar-actions">
                    <button onClick={toggleTheme} className="theme-toggle">
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <div className="user-profile" onClick={() => setActiveTab('profile')}>
                        <img
                            src={user.profilePhoto ? `http://localhost:5000/${user.profilePhoto}` : `https://ui-avatars.com/api/?name=${user.userName || user.name}&background=10b981&color=fff`}
                            alt="Profile"
                        />
                        <span className="user-name-text">{user.userName || user.name}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-icon-btn">
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="dashboard-main">

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="home-content space-y-8"
                    >
                        {/* Welcome Banner */}
                        <motion.div variants={itemVariants} className="welcome-banner">
                            <div className="banner-glow"></div>
                            <div className="banner-content">
                                <div className="banner-text">
                                    <h1>Welcome back, {user.name}! 👋</h1>
                                    <p>Manage your health and stay on track with your upcoming schedule.</p>
                                </div>
                                <div className="banner-actions">
                                    <button
                                        onClick={() => setActiveTab('labTests')}
                                        className="btn-banner-outline"
                                    >
                                        View Records
                                    </button>
                                    <button
                                        onClick={() => navigate('/reviews')}
                                        className="btn-banner-white"
                                    >
                                        Give Feedback
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3-Column Layout */}
                        <div className="home-grid grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Left: Task Reminders */}
                            <motion.div variants={itemVariants} className="task-reminders">
                                <div className="section-title-row">
                                    <h2 className="title-with-icon">
                                        <div className="icon-box">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        Task Reminders
                                    </h2>
                                    <span className="box-pill">TODAY</span>
                                </div>

                                <div className="reminder-groups-container">
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
                                                        key={index}
                                                        className="reminder-item-card"
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
                                                {upcomingAppointments.map((apt) => (
                                                    <motion.div
                                                        whileHover={{ y: -2 }}
                                                        key={apt._id}
                                                        className="reminder-item-card"
                                                    >
                                                        <div className="date-icon-small">
                                                            <span className="month">{new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                                                            <span className="day">{new Date(apt.appointmentDate).getDate()}</span>
                                                        </div>
                                                        <div className="item-info">
                                                            <div className="item-main-text">Dr. {apt.doctorId?.userName}</div>
                                                            <div className="item-sub-text">{apt.appointmentTime}</div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-state">
                                                <p>No appointments scheduled</p>
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
                                                {pendingLabTests.map((test) => (
                                                    <motion.div
                                                        whileHover={{ y: -2 }}
                                                        key={test._id}
                                                        className="reminder-item-card"
                                                    >
                                                        <div className="item-main-text">{test.testName}</div>
                                                        <span className={`status-tag ${test.status}`}>
                                                            {test.status === 'completed' ? '✓ ' : '◴ '}
                                                            {test.status}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-state">
                                                <p>No pending lab tests</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right: Health Analytics */}
                            <motion.div variants={itemVariants} className="health-analytics">
                                <h2 className="title-with-icon">
                                    <div className="icon-box">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    Health Analytics
                                </h2>

                                <div className="analytics-card">
                                    <div className="stats-grid">
                                        <div className="premium-card">
                                            <div className="score-area">
                                                <p className="score-label">Health Score</p>
                                                <h2 className="score-value">8.5<span className="out-of">/10</span></h2>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div className="progress-fill health-progress-fill"></div>
                                            </div>
                                        </div>
                                        {[
                                            { label: 'Upcoming', value: appointments.length > 0 ? appointments.filter(a => a.status === 'scheduled' || a.status === 'pending').length : '1', sub: appointments.length > 0 ? 'Appointments' : 'Sample: Initial Check', icon: '📅' },
                                            { label: 'Records', value: prescriptions.length + labTests.length > 0 ? prescriptions.length + labTests.length : '1', sub: prescriptions.length + labTests.length > 0 ? 'Total Files' : 'Sample Record', icon: '📂' },
                                            { label: 'Status', value: 'Stable', sub: 'Last check today', icon: '📈' }
                                        ].map((stat, i) => (
                                            <div key={i} className="stat-box">
                                                <div className="stat-header-row">
                                                    <span className="stat-icon-large">{stat.icon}</span>
                                                    <span className="stat-label-text">{stat.label}</span>
                                                </div>
                                                <h2 className="stat-value-text">{stat.value}</h2>
                                                <p className="stat-sub-text">{stat.sub}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h3 className="chart-title">Activity Trends (Last 6 Months)</h3>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <LineChart data={healthTrendsData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#064e3b" : "#d1fae5"} vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '24px',
                                                    border: 'none',
                                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                                                    padding: '12px'
                                                }}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '12px', fontWeight: '900' }} />
                                            <Line type="monotone" dataKey="bp" stroke="#10b981" strokeWidth={6} dot={{ r: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} name="Blood Pressure" strokeDasharray="" />
                                            <Line type="monotone" dataKey="hr" stroke="#059669" strokeWidth={6} dot={{ r: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} name="Heart Rate" strokeDasharray="10 10" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>

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
                                                if (feature.title === 'Symptom Checker') setShowSymptomChecker(true);
                                                if (feature.title === 'Record Insights') setShowRecordInsights(true);
                                                if (feature.title === 'Medication Info') setShowMedicationInfo(true);
                                                if (feature.title === 'Lifestyle Tips') setShowLifestyleTips(true);
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
                        {showChat && <AIHealthAssistant onClose={() => setShowChat(false)} />}
                        {showSymptomChecker && <SymptomChecker onClose={() => setShowSymptomChecker(false)} />}
                        {showRecordInsights && <RecordInsights onClose={() => setShowRecordInsights(false)} />}
                        {showMedicationInfo && <MedicationInfo onClose={() => setShowMedicationInfo(false)} />}
                        {showLifestyleTips && <LifestyleTips onClose={() => setShowLifestyleTips(false)} />}
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
                {
                    activeTab === 'appointments' && (
                        <div className="appointments-content">
                            <div className="flex-between-center mb-20">
                                <h1>📅 My Appointments</h1>
                                <button className="book-btn" onClick={() => setShowBookingModal(true)}>
                                    + Book New Appointment
                                </button>
                            </div>

                            {uploadMessage.text && (
                                <div className={`message-alert ${uploadMessage.type} mb-20`}>
                                    {uploadMessage.text}
                                </div>
                            )}

                            <div className="appointments-section">
                                <h2>Upcoming Appointments</h2>
                                {allUpcoming.length > 0 ? (
                                    <div className="appointments-grid">
                                        {allUpcoming.map((apt) => (
                                            <div key={apt._id} className="appointment-card">
                                                <div className="apt-header">
                                                    <h3>{new Date(apt.appointmentDate).toLocaleDateString()}</h3>
                                                    <span className={`status-badge status-${apt.status}`}>
                                                        {apt.status === 'pending' ? '⏳ Pending Confirmation' : apt.status}
                                                    </span>
                                                </div>
                                                <p><strong>Time:</strong> {apt.appointmentTime}</p>
                                                <p><strong>Doctor:</strong> Dr. {apt.doctorId?.userName || 'N/A'}</p>
                                                <p><strong>Type:</strong> {apt.type}</p>
                                                {apt.chiefComplaint && <p><strong>Reason:</strong> {apt.chiefComplaint}</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data">No upcoming appointments</p>
                                )}
                            </div>

                            <div className="appointments-section mt-10">
                                <h2>Appointment History</h2>
                                {pastAppointments.length > 0 ? (
                                    <div className="appointments-grid opacity-75">
                                        {pastAppointments
                                            .slice(0, 6)
                                            .map((apt) => (
                                                <div key={apt._id} className="appointment-card">
                                                    <div className="apt-header">
                                                        <h3>{new Date(apt.appointmentDate).toLocaleDateString()}</h3>
                                                        <span className={`status-badge status-${apt.status}`}>
                                                            {apt.status}
                                                        </span>
                                                    </div>
                                                    <p><strong>Doctor:</strong> Dr. {apt.doctorId?.userName || 'N/A'}</p>
                                                    <p><strong>Type:</strong> {apt.type}</p>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="no-data">No past appointments</p>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* PRESCRIPTIONS TAB */}
                {
                    activeTab === 'prescriptions' && (
                        <div className="prescriptions-content">
                            <h1>💊 My Prescriptions</h1>

                            <div className="prescriptions-list">
                                {prescriptions.length > 0 ? (
                                    prescriptions.map((prescription) => (
                                        <div key={prescription._id} className="prescription-card">
                                            <div className="prescription-header">
                                                <h3>Prescription</h3>
                                                <span className="prescription-date">
                                                    {new Date(prescription.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="prescription-details">
                                                <div className="detail-row">
                                                    <strong>Prescribed By:</strong> Dr. {prescription.doctorId?.userName || 'Unknown'}
                                                    {prescription.doctorId?.clinicName && <span> ({prescription.doctorId.clinicName})</span>}
                                                </div>
                                                <div className="detail-row">
                                                    <strong>Status:</strong>
                                                    <span className={`status-badge status-${prescription.status}`}>
                                                        {prescription.status}
                                                    </span>
                                                </div>
                                                {prescription.isAIProcessed && (
                                                    <div className="ai-details mt-10">
                                                        <div className="ai-badge-label mb-5">
                                                            <Bot size={14} /> AI Processed Prescription
                                                        </div>
                                                        {prescription.aiExtractedData?.reason && (
                                                            <p className="prescription-info"><Activity size={14} /> <strong>Reason:</strong> {prescription.aiExtractedData.reason}</p>
                                                        )}
                                                        {prescription.aiExtractedData?.time && (
                                                            <p className="prescription-info"><Clock size={14} /> <strong>Time:</strong> {prescription.aiExtractedData.time}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="prescription-actions">
                                                {prescription.digitalPrescriptionPdf ? (
                                                    <>
                                                        <a
                                                            href={`http://localhost:5000/${prescription.digitalPrescriptionPdf}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn-prescription btn-prescription-primary"
                                                        >
                                                            <Download size={18} /> Download PDF
                                                        </a>
                                                        {prescription.isAIProcessed && prescription.originalFile && (
                                                            <a
                                                                href={`http://localhost:5000/${prescription.originalFile}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn-prescription btn-prescription-outline"
                                                            >
                                                                <FileText size={18} /> View Original
                                                            </a>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="ai-badge-label status-pending-text">
                                                        <Clock size={16} /> PDF generation in progress...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data">No prescriptions found</p>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* LAB TESTS TAB */}
                {
                    activeTab === 'labTests' && (
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
                    )
                }

                {/* REVIEWS TAB */}
                {activeTab === 'reviews' && (
                    <div className="reviews-content">
                        <div className="flex-between-center mb-30">
                            <h1>⭐ My Reviews & Feedback</h1>
                            <button className="book-btn" onClick={() => navigate('/reviews')}>
                                + Write New Review
                            </button>
                        </div>

                        {loadingReviews ? (
                            <div className="loading-spinner">Loading reviews...</div>
                        ) : myReviews.length > 0 ? (
                            <div className="reviews-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                                {myReviews.map((review) => (
                                    <div key={review._id} className="appointment-card mb-15 p-6 bg-white rounded-3xl shadow-lg border border-slate-100">
                                        <div className="flex-between-center mb-10">
                                            <div>
                                                <h3 className="text-emerald-700 font-bold">{review.clinicId?.clinicName}</h3>
                                                <p className="text-sm opacity-60">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex text-amber-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="italic text-slate-600 mb-15">"{review.comment}"</p>
                                        
                                        <div className="ai-analysis-tag p-10 bg-emerald-50 rounded-xl flex items-center gap-10">
                                            <div className={`sentiment-dot w-3 h-3 rounded-full ${
                                                review.aiSentiment === 'positive' ? 'bg-emerald-500' : 
                                                review.aiSentiment === 'negative' ? 'bg-rose-500' : 'bg-slate-400'
                                            }`}></div>
                                            <span className="text-xs font-bold text-emerald-700 uppercase">AI {review.aiSentiment}</span>
                                            <div className="flex flex-wrap gap-5">
                                                {review.aiKeywords?.map((kw, i) => (
                                                    <span key={i} className="text-[10px] bg-white px-3 py-1 rounded-full border border-emerald-100 text-emerald-600">#{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-card text-center py-40 bg-white rounded-3xl">
                                <MessageSquare size={48} className="mx-auto text-slate-200 mb-10" />
                                <p className="text-slate-400">You haven't submitted any reviews yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {
                    activeTab === 'profile' && (
                        <div className="profile-content">
                            <h1>👤 My Profile</h1>
                            <div className="profile-top-grid">
                                {/* DIGITAL ID CARD SECTION */}
                                <div className="id-card-section">
                                    <h2>💳 Digital ID Card</h2>
                                    <DigitalIDCard user={user} onEdit={handleEditCardClick} />
                                </div>

                                {/* PHOTO & BASIC EDIT SECTION */}
                                <div className="profile-edit-section" ref={editRef}>
                                    <h2>⚙️ Profile Settings</h2>
                                    <div className="profile-card-container">
                                        <h3 className="profile-photo-header">Update Profile Photo</h3>
                                        <div className="photo-upload-container">
                                            <div className="current-photo">
                                                <img
                                                    src={user.profilePhoto ? `http://localhost:5000/${user.profilePhoto}` : `https://ui-avatars.com/api/?name=${user.name}`}
                                                    alt="Current Profile"
                                                />
                                            </div>
                                            <div className="upload-controls">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                                    className="mb-10 d-block"
                                                />
                                                <button
                                                    className="upload-submit-btn"
                                                    onClick={async () => {
                                                        if (!uploadFile) return;
                                                        const formData = new FormData();
                                                        formData.append('profilePhoto', uploadFile);
                                                        formData.append('userId', user.id);
                                                        formData.append('role', 'patient');

                                                        try {
                                                            const res = await api.post('/users/profile-photo', formData);
                                                            updateUser(res.data.data);
                                                            alert('Photo updated successfully!');
                                                            setUploadFile(null);
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert('Upload failed');
                                                        }
                                                    }}
                                                >
                                                    Upload New Photo
                                                </button>
                                            </div>
                                        </div>

                                        <div className="additional-fields">
                                            <div className="form-group">
                                                <label>Blood Group</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. O+ve"
                                                    className="profile-input"
                                                    value={profileDetails.bloodGroup}
                                                    onChange={(e) => setProfileDetails({ ...profileDetails, bloodGroup: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>UHID (if any)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Unique Health ID"
                                                    className="profile-input"
                                                    value={profileDetails.uhid}
                                                    onChange={(e) => setProfileDetails({ ...profileDetails, uhid: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Age</label>
                                                <input
                                                    type="number"
                                                    placeholder="Enter Age"
                                                    className="profile-input"
                                                    value={profileDetails.age}
                                                    onChange={(e) => setProfileDetails({ ...profileDetails, age: e.target.value })}
                                                />
                                            </div>
                                            <button
                                                className="btn-save-section"
                                                onClick={async () => {
                                                    try {
                                                        const res = await api.put(`/users/profile`, {
                                                            userId: user.id,
                                                            role: 'patient',
                                                            ...profileDetails
                                                        });
                                                        updateUser(res.data.data);
                                                        alert('Profile details updated!');
                                                    } catch (err) {
                                                        console.error('Update error:', err);
                                                        alert('Update failed');
                                                    }
                                                }}
                                            >
                                                Save Profile Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-sections">
                                {/* Personal Information */}
                                <div className="profile-section">
                                    <div className="profile-section-header">
                                        <h2>👤 Personal Information</h2>
                                        <button
                                            className="btn-edit-toggle"
                                            onClick={() => setEditModes({ ...editModes, personal: !editModes.personal })}
                                        >
                                            {editModes.personal ? '❌' : '✏️'}
                                        </button>
                                    </div>

                                    {editModes.personal ? (
                                        <div className="profile-grid">
                                            <div className="form-group">
                                                <label>Date of Birth</label>
                                                <input type="date" className="profile-input" value={profileDetails.dob} onChange={(e) => setProfileDetails({ ...profileDetails, dob: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label>Blood Group</label>
                                                <input type="text" className="profile-input" value={profileDetails.bloodGroup} onChange={(e) => setProfileDetails({ ...profileDetails, bloodGroup: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label>Age</label>
                                                <input type="number" className="profile-input" value={profileDetails.age} onChange={(e) => setProfileDetails({ ...profileDetails, age: e.target.value })} />
                                            </div>
                                            <button className="btn-save-section" onClick={() => saveSection('personal')}>Save Personal Info</button>
                                        </div>
                                    ) : (
                                        <div className="profile-grid">
                                            <div className="profile-field">
                                                <label>Full Name</label>
                                                <p>{user.name}</p>
                                            </div>
                                            <div className="profile-field">
                                                <label>Email</label>
                                                <p>{user.email}</p>
                                            </div>
                                            <div className="profile-field">
                                                <label>Phone Number</label>
                                                <p>{user.phoneNumber || 'Not provided'}</p>
                                            </div>
                                            <div className="profile-field">
                                                <label>Date of Birth</label>
                                                <p>{user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}</p>
                                            </div>
                                            <div className="profile-field">
                                                <label>Age</label>
                                                <p>{user.age || 'Not provided'}</p>
                                            </div>
                                            <div className="profile-field">
                                                <label>Blood Group</label>
                                                <p>{user.bloodGroup || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Medical Information */}
                                <div className="profile-section">
                                    <div className="profile-section-header">
                                        <h2>🏥 Medical Information</h2>
                                        <button
                                            className="btn-edit-toggle"
                                            onClick={() => setEditModes({ ...editModes, medical: !editModes.medical })}
                                        >
                                            {editModes.medical ? '❌' : '✏️'}
                                        </button>
                                    </div>

                                    {editModes.medical ? (
                                        <div className="form-group">
                                            <div>
                                                <label>Allergies</label>
                                                <textarea className="profile-input min-h-100" value={profileDetails.allergies} onChange={(e) => setProfileDetails({ ...profileDetails, allergies: e.target.value })} />
                                            </div>
                                            <div>
                                                <label>Medical History</label>
                                                <textarea className="profile-input min-h-100" value={profileDetails.medicalHistory} onChange={(e) => setProfileDetails({ ...profileDetails, medicalHistory: e.target.value })} />
                                            </div>
                                            <button className="btn-save-section" onClick={() => saveSection('medical')}>Save Medical Info</button>
                                        </div>
                                    ) : (
                                        <div className="profile-grid">
                                            <div className="profile-field">
                                                <label>Allergies</label>
                                                <p>{user.allergies || 'None reported'}</p>
                                            </div>
                                            <div className="profile-field">
                                                <label>Medical History</label>
                                                <p>{user.medicalHistory || 'No history available'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Emergency Contact */}
                                <div className="profile-section">
                                    <div className="profile-section-header">
                                        <h2>🚨 Emergency Contact</h2>
                                        <button
                                            className="btn-edit-toggle"
                                            onClick={() => setEditModes({ ...editModes, emergency: !editModes.emergency })}
                                        >
                                            {editModes.emergency ? '❌' : '✏️'}
                                        </button>
                                    </div>

                                    {editModes.emergency ? (
                                        <div className="profile-grid">
                                            <div className="form-group">
                                                <label>Contact Name</label>
                                                <input type="text" className="profile-input" value={profileDetails.emergencyContact.name} onChange={(e) => setProfileDetails({ ...profileDetails, emergencyContact: { ...profileDetails.emergencyContact, name: e.target.value } })} />
                                            </div>
                                            <div className="form-group">
                                                <label>Contact Phone</label>
                                                <input type="tel" className="profile-input" value={profileDetails.emergencyContact.phone} onChange={(e) => setProfileDetails({ ...profileDetails, emergencyContact: { ...profileDetails.emergencyContact, phone: e.target.value } })} />
                                            </div>
                                            <div className="form-group">
                                                <label>Relationship</label>
                                                <input type="text" className="profile-input" value={profileDetails.emergencyContact.relationship} onChange={(e) => setProfileDetails({ ...profileDetails, emergencyContact: { ...profileDetails.emergencyContact, relationship: e.target.value } })} />
                                            </div>
                                            <button className="btn-save-section" onClick={() => saveSection('emergency')}>Save Emergency Contact</button>
                                        </div>
                                    ) : (
                                        <div className="profile-grid">
                                            <div className="profile-field">
                                                <label>Contact Name</label>
                                                <p>{user.emergencyContact?.name || 'Not provided'}</p>
                                            </div>
                                            <div className="profile-field">
                                                <label>Contact Phone</label>
                                                <p>{user.emergencyContact?.phone || 'Not provided'}</p>
                                            </div>
                                            <div className="profile-field">
                                                <label>Relationship</label>
                                                <p>{user.emergencyContact?.relationship || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Address Section */}
                                <div className="profile-section">
                                    <div className="profile-section-header">
                                        <h2>📍 Address</h2>
                                        <button
                                            className="btn-edit-toggle"
                                            onClick={() => setEditModes({ ...editModes, address: !editModes.address })}
                                        >
                                            {editModes.address ? '❌' : '✏️'}
                                        </button>
                                    </div>

                                    {editModes.address ? (
                                        <div className="form-group">
                                            <div>
                                                <label>Area</label>
                                                <input type="text" className="profile-input" value={profileDetails.area} onChange={(e) => setProfileDetails({ ...profileDetails, area: e.target.value })} />
                                            </div>
                                            <div>
                                                <label>Full Address</label>
                                                <textarea className="profile-input min-h-80" value={profileDetails.address} onChange={(e) => setProfileDetails({ ...profileDetails, address: e.target.value })} />
                                            </div>
                                            <button className="btn-save-section" onClick={() => saveSection('address')}>Save Address</button>
                                        </div>
                                    ) : (
                                        <div className="profile-field">
                                            <p>{user.address || user.area || 'Not provided'}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Download PDF Button */}
                                <div className="profile-actions-center">
                                    <button
                                        onClick={downloadProfilePDF}
                                        className="btn-download-profile"
                                    >
                                        <FileText size={20} /> Download All Details (PDF)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
                {activeTab === 'about' && <About />}
            </div >



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
                                            min={new Date().toISOString().split('T')[0]}
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
        </div >
    );
};

export default PatientDashboard;

