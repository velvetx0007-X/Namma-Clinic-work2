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
import ProfileSettings from '../components/ProfileSettings';
import AdvancedAIView from '../components/AdvancedAIView';
import NotificationCenter from '../components/NotificationCenter';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
    Heart, Activity, Calendar, FileText, Pill, Search, MapPin, Navigation, 
    MessageSquare, MessageSquarePlus, CheckCircle, User, UserCheck, LogOut, 
    Sparkles, Bot, Zap, Download, Clock, Star, Loader2, X, LayoutDashboard
} from 'lucide-react';
import logo from '../assets/Namma Clinic logo.jpeg';
import DashboardLayout from '../components/common/DashboardLayout';
import StatCard from '../components/common/StatCard';
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
            setTasks(tasksRes.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching patient data:', error);
            setLoading(false);
        }
    };

    const handleTaskUpdate = async (taskId, newStatus) => {
        try {
            const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
            if (res.data.success) {
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
                // Show success message if needed
            }
        } catch (error) {
            console.error('Error updating task:', error);
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
            const res = await api.get(`/reviews/patient/${user.id}`);
            setMyReviews(res.data.data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoadingReviews(false);
        }
    };
    // Categorize and aggregate tasks with official records
    const medicationTasksList = tasks.filter(t => t.type === 'Medication' && t.status !== 'completed');
    const activeMedications = [
        ...prescriptions.slice(0, 2).flatMap(p => p.medications).slice(0, 5).map(m => ({ ...m, source: 'prescription' })),
        ...medicationTasksList.map(t => ({ drugName: t.title, frequency: t.description, dosage: t.priority, source: 'task', _id: t._id }))
    ];

    const allUpcoming = appointments.filter(apt => isAppointmentUpcoming(apt) && apt.status !== 'cancelled').sort((a,b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
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
    const pastAppointments = appointments.filter(apt => !isAppointmentUpcoming(apt) || apt.status === 'cancelled').sort((a,b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    const labTasksList = tasks.filter(t => t.type === 'Lab Test' && t.status !== 'completed');
    const pendingLabTests = [
        ...labTests.filter(test => test.status === 'ordered' || test.status === 'sample-collected').slice(0, 3)
            .map(l => ({ ...l, source: 'official' })),
        ...labTasksList.map(t => ({ testName: t.title, status: t.status, source: 'task', _id: t._id }))
    ];
    
    const generalTasks = tasks.filter(t => (t.type === 'General Message' || !t.type) && t.status !== 'completed');

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
                        {/* Welcome Banner */}
                        <motion.div variants={itemVariants} className="welcome-banner">
                            <div className="banner-glow"></div>
                            <div className="banner-content">
                                <div className="banner-text">
                                    <h1 className="text-white">Welcome back, {user.name}! 👋</h1>
                                    <p className="text-white opacity-90">Manage your health and stay on track with your upcoming schedule.</p>
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

                        {/* 2-Column Layout */}
                        <div className="home-grid grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                            {/* Left: Task Reminders (Full width on medium, partial on large) */}
                            <motion.div variants={itemVariants} className="lg:col-span-12 task-reminders-unified">
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
                                                {upcomingAppointments.map((apt) => (
                                                    <motion.div
                                                        whileHover={{ y: -2 }}
                                                        key={apt._id}
                                                        className={`reminder-item-card ${apt.source === 'task' ? 'task-source' : ''}`}
                                                        onClick={() => apt.source === 'task' && handleTaskUpdate(apt._id, 'completed')}
                                                    >
                                                        <div className="date-icon-small">
                                                            <span className="month">{new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                                                            <span className="day">{new Date(apt.appointmentDate).getDate()}</span>
                                                        </div>
                                                        <div className="item-info">
                                                            <div className="item-main-text">{apt.title || `Dr. ${apt.doctorId?.userName}`}</div>
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
                                                        className={`reminder-item-card ${test.source === 'task' ? 'task-source' : ''}`}
                                                        onClick={() => test.source === 'task' && handleTaskUpdate(test._id, 'completed')}
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

                        {/* Health Metrics & Analytics (Relocated & Redesigned) */}
                        <motion.div variants={itemVariants} className="health-metrics-row grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Box 1: Health Score & Activity */}
                            <div className="lg:col-span-7 premium-analytics-card">
                                <div className="card-header-row">
                                    <h2 className="title-with-icon">
                                        <div className="icon-box">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        Health Analytics
                                    </h2>
                                    <div className="health-score-pill">
                                        <span className="label">Health Score</span>
                                        <span className="value">8.5<span className="out-of">/10</span></span>
                                    </div>
                                </div>

                                <div className="chart-wrapper">
                                    <div className="chart-header">
                                        <h3 className="chart-title">Activity Trends</h3>
                                        <span className="chart-period">Last 6 Months</span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <LineChart data={healthTrendsData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#064e3b" : "#f1f5f9"} vertical={false} />
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
                                            <Line type="monotone" dataKey="bp" stroke="var(--action-primary)" strokeWidth={4} dot={{ r: 4, fill: "var(--action-primary)", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8 }} name="Blood Pressure" />
                                            <Line type="monotone" dataKey="hr" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8 }} name="Heart Rate" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Box 2: Quick Stats */}
                            <div className="lg:col-span-5 stats-card-grid">
                                {[
                                    { label: 'Upcoming', value: appointments.length > 0 ? appointments.filter(a => a.status === 'scheduled' || a.status === 'pending').length : '1', sub: appointments.length > 0 ? 'Appointments' : 'Initial Check', icon: '📅', color: 'blue' },
                                    { label: 'Records', value: prescriptions.length + labTests.length > 0 ? prescriptions.length + labTests.length : '1', sub: 'Total Files', icon: '📂', color: 'emerald' },
                                    { label: 'Status', value: 'Stable', sub: 'Last check today', icon: '📈', color: 'amber' }
                                ].map((stat, i) => (
                                    <div key={i} className={`minimal-stat-card ${stat.color}`}>
                                        <div className="stat-icon-box">
                                            <span className="stat-icon">{stat.icon}</span>
                                        </div>
                                        <div className="stat-info">
                                            <p className="stat-label">{stat.label}</p>
                                            <h2 className="stat-value">{stat.value}</h2>
                                            <p className="stat-sub">{stat.sub}</p>
                                        </div>
                                    </div>
                                ))}
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
                        {showChat && <AIHealthAssistant onClose={() => setShowChat(false)} />}
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

