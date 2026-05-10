import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

import Footer from '../components/Footer';
import DashboardLayout from '../components/common/DashboardLayout';
import StatCard from '../components/common/StatCard';
import ProfileSettings from '../components/ProfileSettings';

import {
    LayoutDashboard,
    ClipboardList,
    Calendar,
    Activity,
    Users,
    User,
    Plus,
    Save,
    Stethoscope,
    Pill,
    FileText,
    Clock,
    UserPlus,
    X,
    CheckCircle,
    AlertCircle,
    Upload,
    Eye
} from 'lucide-react';
import AIPrescriptionUpload from '../components/AIPrescriptionUpload';
import PatientHistory from '../components/PatientHistory';
import AssignTaskButton from '../components/AssignTaskButton';
import DashboardGreeting from '../components/common/DashboardGreeting';
import AIPatientAnalysis from '../components/AIPatientAnalysis';

import './DoctorDashboard.css';

// Dashboard v2 - DashboardGreeting integrated

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('home');
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editPrescriptionData, setEditPrescriptionData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [consultation, setConsultation] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
    });

    const [prescription, setPrescription] = useState({
        medications: [{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        validUntil: ''
    });

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        patientName: '',
        appointmentDate: '',
        appointmentTime: '',
        type: 'Consultation',
        chiefComplaint: ''
    });

    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerData, setRegisterData] = useState({
        name: '',
        phoneNumber: '',
        age: '',
        gender: 'Male',
        email: '',
        bloodGroup: ''
    });

    useEffect(() => {
        fetchAppointments();
        fetchPrescriptions();
        fetchPatients();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/appointments');
            setAppointments(response.data.data || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
        setLoading(false);
    };

    const fetchPrescriptions = async () => {
        try {
            const response = await api.get('/prescriptions');
            setPrescriptions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients');
            setAllPatients(response.data.data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const todayAppointments = appointments.filter(apt => {
        const date = new Date();
        const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return apt.appointmentDate?.startsWith(today);
    });

    const startConsultation = (appointment) => {
        setSelectedAppointment(appointment);
        setConsultation({ subjective: '', objective: '', assessment: '', plan: '' });
        setPrescription({ medications: [{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }], validUntil: '' });
    };

    const saveConsultation = async () => {
        try {
            await api.put(`/appointments/${selectedAppointment._id}`, {
                status: 'completed',
                notes: `S: ${consultation.subjective}\nO: ${consultation.objective}\nA: ${consultation.assessment}\nP: ${consultation.plan}`
            });
            alert('Consultation saved successfully!');
            fetchAppointments();
        } catch (error) {
            alert('Error saving consultation: ' + error.message);
        }
    };

    const addMedication = () => {
        setPrescription(prev => ({
            ...prev,
            medications: [...prev.medications, { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        }));
    };

    const updateMedication = (index, field, value) => {
        const updated = [...prescription.medications];
        updated[index][field] = value;
        setPrescription(prev => ({ ...prev, medications: updated }));
    };

    const savePrescription = async () => {
        if (!selectedAppointment) return;
        try {
            await api.post('/prescriptions', {
                patientId: selectedAppointment.patientId?._id,
                doctorId: user.id,
                medications: prescription.medications,
                validUntil: prescription.validUntil
            });
            alert('Prescription saved successfully!');
            fetchPrescriptions();
        } catch (error) {
            alert('Error saving prescription: ' + error.message);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedPatient = allPatients.find(p => p.name === bookingData.patientName);
            if (!selectedPatient) {
                alert('Please select a valid patient from the list.');
                return;
            }
            await api.post('/appointments', {
                patientId: selectedPatient._id,
                doctorId: user.id,
                appointmentDate: bookingData.appointmentDate,
                appointmentTime: bookingData.appointmentTime,
                type: bookingData.type.toLowerCase(),
                chiefComplaint: bookingData.chiefComplaint
            });
            alert('Appointment booked successfully!');
            setShowBookingModal(false);
            setBookingData({ patientName: '', appointmentDate: '', appointmentTime: '', type: 'Consultation', chiefComplaint: '' });
            fetchAppointments();
        } catch (error) {
            alert('Error booking appointment: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/patients', registerData);
            alert('Patient registered successfully!');
            setShowRegisterModal(false);
            setRegisterData({ name: '', phoneNumber: '', age: '', gender: 'Male', email: '', bloodGroup: '' });
            fetchPatients();
        } catch (error) {
            alert('Error registering patient: ' + (error.response?.data?.message || error.message));
        }
    };

    const openPrescriptionDetail = (p) => {
        setSelectedPrescription(p);
        setIsEditing(false);
        setEditPrescriptionData({ ...p });
    };

    const handleUpdatePrescription = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.put(`/prescriptions/${selectedPrescription._id}`, {
                medications: editPrescriptionData.medications,
                notes: editPrescriptionData.notes,
                status: editPrescriptionData.status || 'active'
            });
            alert('Prescription updated successfully!');
            fetchPrescriptions();
            setSelectedPrescription(response.data.data);
            setIsEditing(false);
        } catch (error) {
            alert('Error updating prescription: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const addEditMedication = () => {
        setEditPrescriptionData(prev => ({
            ...prev,
            medications: [...prev.medications, { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        }));
    };

    const updateEditMedication = (index, field, value) => {
        const updated = [...editPrescriptionData.medications];
        updated[index][field] = value;
        setEditPrescriptionData(prev => ({ ...prev, medications: updated }));
    };

    const removeEditMedication = (index) => {
        const updated = editPrescriptionData.medications.filter((_, i) => i !== index);
        setEditPrescriptionData(prev => ({ ...prev, medications: updated }));
    };

    // handleLogout removed if unused

    const sidebarLinks = [
        { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
        { id: 'upload-prescription', label: 'Upload AI Rx', icon: Upload },

        { id: 'surgery', label: 'Surgery', icon: Stethoscope },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'profile', label: 'Profile', icon: User }
    ];

    return (
        <DashboardLayout sidebarLinks={sidebarLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="dashboard-content max-w-7xl mx-auto p-4 lg:p-8">
                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="home-content"
                    >
                        <DashboardGreeting user={user} role="doctor" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <StatCard 
                                icon={Calendar} 
                                number={todayAppointments.length} 
                                label="Today's Appointments" 
                                subtext={new Date().toLocaleDateString()} 
                                colorClass="text-blue-600"
                                className="premium-stat-card"
                            />
                            <StatCard 
                                icon={AlertCircle} 
                                number={todayAppointments.filter(apt => apt.status === 'scheduled').length} 
                                label="Pending Consultations" 
                                subtext="Awaiting attention" 
                                colorClass="text-orange-500"
                                className="premium-stat-card"
                            />
                            <StatCard 
                                icon={CheckCircle} 
                                number={todayAppointments.filter(apt => apt.status === 'completed').length} 
                                label="Completed Today" 
                                subtext="Productive session" 
                                colorClass="text-emerald-500"
                                className="premium-stat-card"
                            />
                            <StatCard 
                                icon={Pill} 
                                number={prescriptions.length} 
                                label="Total Prescriptions" 
                                subtext="Historical records" 
                                colorClass="text-indigo-600"
                                className="premium-stat-card"
                            />
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="visual-glass-card p-8 h-full">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Activity size={20} />
                                            </div>
                                            Today's Overview
                                        </h2>
                                        <button onClick={() => setActiveTab('appointments')} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all">View All</button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {todayAppointments.slice(0, 3).map((apt) => (
                                            <div key={apt._id} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                        {apt.patientId?.name?.charAt(0) || 'P'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{apt.patientId?.name || 'N/A'}</h4>
                                                        <p className="text-xs text-gray-500 font-medium">{apt.type} • {apt.appointmentTime}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => startConsultation(apt)} className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all">
                                                    Consult
                                                </button>
                                            </div>
                                        ))}
                                        {todayAppointments.length === 0 && (
                                            <div className="empty-visual-state">
                                                <div className="empty-visual-icon">
                                                    <Calendar size={32} />
                                                </div>
                                                <h3>All Clear for Today</h3>
                                                <p>You have no scheduled appointments for today. Take a moment to relax or catch up on records.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <div className="visual-dark-glass-card p-8 text-white h-full">
                                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Plus size={20} />
                                        </div>
                                        Quick Actions
                                    </h2>
                                    <div className="grid gap-4">
                                        <button onClick={() => setShowBookingModal(true)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <span className="block font-bold">New Appointment</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Schedule Visit</span>
                                            </div>
                                        </button>
                                        
                                        <button onClick={() => setShowRegisterModal(true)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                                <UserPlus size={20} />
                                            </div>
                                            <div>
                                                <span className="block font-bold">Register Patient</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">New Enrollment</span>
                                            </div>
                                        </button>

                                        <button onClick={() => setActiveTab('prescriptions')} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                                <ClipboardList size={20} />
                                            </div>
                                            <div>
                                                <span className="block font-bold">Prescriptions</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">View Records</span>
                                            </div>
                                        </button>

                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <AssignTaskButton dark={true} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AIPatientAnalysis />

                    </motion.div>
                )}

                {/* PRESCRIPTIONS TAB */}
                {activeTab === 'prescriptions' && (
                    <div className="content-section space-y-8">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                                    <ClipboardList className="text-blue-600" /> Clinical Rx Records
                                </h1>
                                <p className="text-slate-500 font-medium">Manage and review all patient prescriptions, digital records, and medical histories.</p>
                            </div>
                            <button 
                                onClick={() => setActiveTab('upload-prescription')}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                            >
                                <Plus size={20} /> Create New Rx
                            </button>
                        </div>

                        <div className="records-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {prescriptions.map(p => (
                                <motion.div 
                                    key={p._id} 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -5 }}
                                    className="prescription-card-premium bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all overflow-hidden cursor-pointer"
                                    onClick={() => openPrescriptionDetail(p)}
                                >
                                    <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-100">
                                                    {p.patientId?.name?.[0] || 'P'}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 text-base">{p.patientId?.name || 'N/A'}</h3>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                                p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {p.status || 'active'}
                                            </span>
                                        </div>

                                        <div className="med-preview-strip flex flex-wrap gap-1.5 mt-2">
                                            {p.medications?.slice(0, 2).map((m, i) => (
                                                <span key={i} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                    {m.drugName}
                                                </span>
                                            ))}
                                            {p.medications?.length > 2 && <span className="text-[10px] text-slate-400">+{p.medications.length - 2} more</span>}
                                        </div>
                                    </div>

                                    <div className="p-5 flex items-center justify-between bg-white">
                                        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                                            <Clock size={12} /> {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {p.digitalPrescriptionPdf && (
                                                <a 
                                                    href={`http://localhost:5000/${p.digitalPrescriptionPdf}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-2 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                    title="View PDF"
                                                >
                                                    <Eye size={16} />
                                                </a>
                                            )}
                                            <span className="text-xs font-black text-blue-600 hover:underline">Details →</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {prescriptions.length === 0 && (
                            <div className="no-data-card py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ClipboardList size={32} className="text-slate-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">No Records Found</h3>
                                <p className="text-slate-400 mb-8">Start by creating your first clinical prescription record.</p>
                                <button 
                                    onClick={() => setActiveTab('upload-prescription')}
                                    className="btn-primary-lux"
                                >
                                    Start Smart Prescription
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* AI UPLOAD TAB */}
                {activeTab === 'upload-prescription' && (
                    <div className="content-section">
                        <h1><Upload className="header-icon" /> AI Prescription Upload</h1>
                        <AIPrescriptionUpload onUploadSuccess={() => fetchPrescriptions()} />
                    </div>
                )}

                {/* APPOINTMENTS TAB */}
                {activeTab === 'appointments' && (
                    <div className="appointments-content">
                        <h1>Today's Appointments</h1>
                        {loading ? (
                            <div className="loading-state">
                                <Clock className="animate-spin" size={32} />
                                <p>Loading appointments...</p>
                            </div>
                        ) : todayAppointments.length === 0 ? (
                            <div className="no-data">
                                <Calendar size={48} opacity={0.3} />
                                <p>No appointments for today</p>
                            </div>
                        ) : (
                            <div className="appointments-grid">
                                {todayAppointments.map((appointment) => (
                                    <div key={appointment._id} className="appointment-card">
                                        <div className="apt-header">
                                            <h3>{appointment.patientId?.name || 'N/A'}</h3>
                                            <span className={`status-badge status-${appointment.status}`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                        <div className="apt-body">
                                            <p><Calendar size={14} /> <strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                                            <p><Clock size={14} /> <strong>Time:</strong> {appointment.appointmentTime}</p>
                                            <p><Activity size={14} /> <strong>Type:</strong> {appointment.type}</p>
                                            <p><FileText size={14} /> <strong>Complaint:</strong> {appointment.chiefComplaint || 'N/A'}</p>
                                        </div>
                                        <button
                                            onClick={() => startConsultation(appointment)}
                                            className="btn-primary"
                                        >
                                            <Stethoscope size={18} />
                                            <span>Start Consultation</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedAppointment && (
                            <div className="consultation-section mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">Consultation - {selectedAppointment.patientId?.name}</h2>
                                    <button onClick={() => setSelectedAppointment(null)} className="text-gray-500 hover:text-red-500"><X size={20} /></button>
                                </div>

                                <div className="consultation-form grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label className="block text-sm font-medium mb-2">Subjective (Patient's Complaint)</label>
                                        <textarea
                                            className="w-full p-3 border rounded-lg dark:bg-gray-900"
                                            value={consultation.subjective}
                                            onChange={(e) => setConsultation({ ...consultation, subjective: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium mb-2">Objective (Clinical Findings)</label>
                                        <textarea
                                            className="w-full p-3 border rounded-lg dark:bg-gray-900"
                                            value={consultation.objective}
                                            onChange={(e) => setConsultation({ ...consultation, objective: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium mb-2">Assessment (Diagnosis)</label>
                                        <textarea
                                            className="w-full p-3 border rounded-lg dark:bg-gray-900"
                                            value={consultation.assessment}
                                            onChange={(e) => setConsultation({ ...consultation, assessment: e.target.value })}
                                            rows="2"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium mb-2">Plan (Treatment Plan)</label>
                                        <textarea
                                            className="w-full p-3 border rounded-lg dark:bg-gray-900"
                                            value={consultation.plan}
                                            onChange={(e) => setConsultation({ ...consultation, plan: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                </div>
                                <button onClick={saveConsultation} className="btn-save mt-4 flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                    <Save size={18} />
                                    <span>Save Consultation</span>
                                </button>

                                <div className="prescription-form mt-10 border-t pt-8">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Pill className="text-blue-500" /> Create Prescription
                                    </h3>
                                    {prescription.medications.map((med, index) => (
                                        <div key={index} className="medication-row grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <input
                                                type="text"
                                                placeholder="Drug Name"
                                                className="p-2 border rounded dark:bg-gray-900"
                                                value={med.drugName}
                                                onChange={(e) => updateMedication(index, 'drugName', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Dosage"
                                                className="p-2 border rounded dark:bg-gray-900"
                                                value={med.dosage}
                                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Frequency"
                                                className="p-2 border rounded dark:bg-gray-900"
                                                value={med.frequency}
                                                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Duration"
                                                className="p-2 border rounded dark:bg-gray-900"
                                                value={med.duration}
                                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <div className="prescription-actions flex gap-4 mt-4">
                                        <button onClick={addMedication} className="btn-add flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                                            <Plus size={18} />
                                            <span>Add Medication</span>
                                        </button>
                                        <button onClick={savePrescription} className="btn-save flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                                            <Pill size={18} />
                                            <span>Save Prescription</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}



                {/* SURGERY TAB */}
                {activeTab === 'surgery' && (
                    <div className="surgery-content">
                        <h1><Stethoscope className="header-icon" /> Surgery Schedule</h1>
                        <div className="placeholder-section">
                            <Activity size={48} className="placeholder-icon" />
                            <p>Surgery scheduling feature coming soon</p>
                            <small>Manage pre-op, post-op, and surgery schedules with AI assistance</small>
                        </div>
                    </div>
                )}

                {/* PATIENTS TAB */}
                {activeTab === 'patients' && (
                    <div className="content-section">
                        <h1><Users className="header-icon" /> Namma Clinic Patient Records</h1>
                        <PatientHistory source="doctor" />
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="profile-tab-container">
                        <ProfileSettings showDigitalId={false} />
                    </div>
                )}
            </div>

            {showBookingModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Book New Appointment</h2>
                            <button onClick={() => setShowBookingModal(false)} className="close-btn"><X /></button>
                        </div>
                        <form onSubmit={handleBookingSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Patient Name</label>
                                <input
                                    list="patient-names"
                                    required
                                    value={bookingData.patientName}
                                    onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                                    placeholder="Search or Select Patient"
                                />
                                <datalist id="patient-names">
                                    {allPatients.map(p => <option key={p._id} value={p.name} />)}
                                </datalist>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={bookingData.appointmentDate}
                                        onChange={(e) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={bookingData.appointmentTime}
                                        onChange={(e) => setBookingData({ ...bookingData, appointmentTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Consultation Type</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={bookingData.type}
                                    onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                                >
                                    <option value="Consultation">Consultation</option>
                                    <option value="Follow-up">Follow-up</option>
                                    <option value="Surgery">Surgery</option>
                                    <option value="Emergency">Emergency</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Chief Complaint</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    value={bookingData.chiefComplaint}
                                    onChange={(e) => setBookingData({ ...bookingData, chiefComplaint: e.target.value })}
                                    placeholder="Briefly describe the patient's issue"
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Confirm Booking</button>
                        </form>
                    </div>
                </div>
            )}

            {showRegisterModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Register New Patient</h2>
                            <button onClick={() => setShowRegisterModal(false)} className="close-btn"><X /></button>
                        </div>
                        <form onSubmit={handleRegisterSubmit} className="modal-form">
                            <div className="form-row grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded"
                                        value={registerData.name}
                                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                        placeholder="Patient's Full Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full p-2 border rounded"
                                        value={registerData.phoneNumber}
                                        onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                                        placeholder="10-digit mobile"
                                    />
                                </div>
                            </div>
                            <div className="form-row grid grid-cols-2 gap-4 mt-4">
                                <div className="form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2 border rounded"
                                        value={registerData.age}
                                        onChange={(e) => setRegisterData({ ...registerData, age: e.target.value })}
                                        placeholder="Age"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={registerData.gender}
                                        onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group mt-4">
                                <label>Email (Optional)</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border rounded"
                                    value={registerData.email}
                                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="form-group mt-4">
                                <label>Blood Group</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={registerData.bloodGroup}
                                    onChange={(e) => setRegisterData({ ...registerData, bloodGroup: e.target.value })}
                                    placeholder="e.g. A+, O-"
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Register & Continue</button>
                        </form>
                    </div>
                </div>
            )}

            {/* PRESCRIPTION DETAIL MODAL */}
            {selectedPrescription && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h2>
                                {isEditing ? 'Edit Prescription' : 'Prescription Details'}
                            </h2>
                            <button onClick={() => setSelectedPrescription(null)} className="close-btn"><X /></button>
                        </div>
                        <div className="modal-body p-8 overflow-y-auto max-h-[80vh]">
                            {!isEditing ? (
                                <div className="prescription-detail-view">
                                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                                        <div className="info-group">
                                            <label className="text-xs uppercase tracking-widest text-gray-500 font-black">Patient</label>
                                            <p className="text-xl font-bold text-gray-900">{selectedPrescription.patientId?.name || 'N/A'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label className="text-xs uppercase tracking-widest text-gray-500 font-black">Doctor</label>
                                            <p className="text-xl font-bold text-gray-900">Dr. {selectedPrescription.doctorId?.userName || 'N/A'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label className="text-xs uppercase tracking-widest text-gray-500 font-black">Date</label>
                                            <p className="font-bold text-gray-700">{new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="info-group">
                                            <label className="text-xs uppercase tracking-widest text-gray-500 font-black">Status</label>
                                            <div>
                                                <span className={`status-badge status-${selectedPrescription.status || 'active'}`}>
                                                    {selectedPrescription.status || 'active'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* VITALS SECTION */}
                                    {selectedPrescription.vitals && (
                                        <div className="vitals-display-section mb-8 p-6 rounded-2xl bg-blue-50/30 border border-blue-100">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                                                <Activity size={18} /> Clinical Vitals
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {Object.entries(selectedPrescription.vitals).map(([key, value]) => (
                                                    value && (
                                                        <div key={key} className="vitals-card">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                                                            <p className="font-bold text-gray-800">{value}</p>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* SYMPTOMS & DIAGNOSIS */}
                                    {(selectedPrescription.symptoms || selectedPrescription.diagnosis) && (
                                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                                            {selectedPrescription.symptoms && (
                                                <div className="observation-card p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                    <label className="text-xs font-black uppercase text-gray-500 block mb-1">Symptoms</label>
                                                    <p className="text-gray-700">{selectedPrescription.symptoms}</p>
                                                </div>
                                            )}
                                            {selectedPrescription.diagnosis && (
                                                <div className="observation-card p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                    <label className="text-xs font-black uppercase text-gray-500 block mb-1">Diagnosis</label>
                                                    <p className="text-gray-700 font-bold">{selectedPrescription.diagnosis}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="meds-list-section mb-8">
                                        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                            <Pill className="text-blue-600" /> Medications
                                        </h3>
                                        <div className="grid gap-3">
                                            {selectedPrescription.medications.map((med, idx) => (
                                                <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-blue-700">{med.drugName}</h4>
                                                        <span className="text-xs font-black text-gray-400 uppercase">{med.duration}</span>
                                                    </div>
                                                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                                        <span><strong>Dosage:</strong> {med.dosage}</span>
                                                        <span><strong>Frequency:</strong> {med.frequency}</span>
                                                    </div>
                                                    {med.instructions && (
                                                        <p className="text-xs mt-2 text-gray-500 italic">"{med.instructions}"</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedPrescription.notes && (
                                        <div className="notes-section mb-8">
                                            <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                                                <FileText className="text-gray-400" /> Clinical Notes
                                            </h3>
                                            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-gray-700">
                                                {selectedPrescription.notes}
                                            </div>
                                        </div>
                                    )}

                                    {selectedPrescription.digitalPrescriptionPdf && (
                                        <div className="ai-rx-section mb-8">
                                            <a 
                                                href={`http://localhost:5000/${selectedPrescription.digitalPrescriptionPdf}`}
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold hover:bg-emerald-100 transition-all"
                                            >
                                                <FileText size={20} /> View Digital Prescription (PDF)
                                            </a>
                                        </div>
                                    )}

                                    <div className="modal-actions flex gap-4 mt-10 border-t pt-6">
                                        <button 
                                            onClick={() => setIsEditing(true)} 
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
                                        >
                                            <Plus size={18} /> Edit Prescription
                                        </button>
                                        <button 
                                            onClick={() => setSelectedPrescription(null)}
                                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdatePrescription} className="prescription-edit-form">
                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div className="form-group">
                                            <label className="text-xs uppercase tracking-widest text-gray-500 font-black mb-2 block">Prescription Status</label>
                                            <select 
                                                className="w-full p-3 border rounded-xl dark:bg-gray-900"
                                                value={editPrescriptionData.status || 'active'}
                                                onChange={(e) => setEditPrescriptionData({...editPrescriptionData, status: e.target.value})}
                                            >
                                                <option value="active">Active</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="meds-edit-section mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-black flex items-center gap-2">
                                                <Pill className="text-blue-600" /> Edit Medications
                                            </h3>
                                            <button 
                                                type="button" 
                                                onClick={addEditMedication}
                                                className="text-blue-600 font-bold flex items-center gap-1 text-sm hover:underline"
                                            >
                                                <Plus size={16} /> Add Drug
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {editPrescriptionData.medications.map((med, index) => (
                                                <div key={index} className="p-5 rounded-2xl border-2 border-gray-100 bg-gray-50/50 relative">
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeEditMedication(index)}
                                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="form-group">
                                                            <label className="text-[10px] font-black uppercase text-gray-400">Drug Name</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                className="w-full p-2 border-b-2 bg-transparent focus:border-blue-500 transition-all outline-none"
                                                                value={med.drugName}
                                                                onChange={(e) => updateEditMedication(index, 'drugName', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="text-[10px] font-black uppercase text-gray-400">Dosage</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 border-b-2 bg-transparent focus:border-blue-500 transition-all outline-none"
                                                                value={med.dosage}
                                                                onChange={(e) => updateEditMedication(index, 'dosage', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="text-[10px] font-black uppercase text-gray-400">Frequency</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 border-b-2 bg-transparent focus:border-blue-500 transition-all outline-none"
                                                                value={med.frequency}
                                                                onChange={(e) => updateEditMedication(index, 'frequency', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="text-[10px] font-black uppercase text-gray-400">Duration</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 border-b-2 bg-transparent focus:border-blue-500 transition-all outline-none"
                                                                value={med.duration}
                                                                onChange={(e) => updateEditMedication(index, 'duration', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="form-group md:col-span-2">
                                                            <label className="text-[10px] font-black uppercase text-gray-400">Instructions</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 border-b-2 bg-transparent focus:border-blue-500 transition-all outline-none"
                                                                value={med.instructions}
                                                                onChange={(e) => updateEditMedication(index, 'instructions', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group mb-8">
                                        <label className="text-xs uppercase tracking-widest text-gray-500 font-black mb-2 block">Clinical Notes</label>
                                        <textarea 
                                            className="w-full p-4 border-2 rounded-2xl focus:border-blue-500 outline-none transition-all dark:bg-gray-900"
                                            rows="4"
                                            value={editPrescriptionData.notes || ''}
                                            onChange={(e) => setEditPrescriptionData({...editPrescriptionData, notes: e.target.value})}
                                            placeholder="Enter additional findings or treatment notes..."
                                        />
                                    </div>

                                    <div className="modal-actions flex gap-4 mt-10 border-t pt-6">
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                                        >
                                            {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer links={[
                { label: 'Home', onClick: () => setActiveTab('home') },
                { label: 'AI Upload', onClick: () => setActiveTab('upload-prescription') },
                { label: 'Prescriptions', onClick: () => setActiveTab('prescriptions') },
                { label: 'Appointments', onClick: () => setActiveTab('appointments') },
                { label: 'Surgery', onClick: () => setActiveTab('surgery') },
                { label: 'Patients', onClick: () => setActiveTab('patients') },
                { label: 'Profile', onClick: () => setActiveTab('profile') }
            ]} />
        </DashboardLayout>
    );
};

export default DoctorDashboard;
