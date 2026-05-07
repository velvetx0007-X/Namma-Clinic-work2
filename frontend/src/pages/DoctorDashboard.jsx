import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/Namma Clinic logo.jpeg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axiosInstance';
import DigitalIDCard from '../components/DigitalIDCard';
import Footer from '../components/Footer';
import DashboardLayout from '../components/common/DashboardLayout';
import StatCard from '../components/common/StatCard';
import ProfileSettings from '../components/ProfileSettings';
import AIRevenueDashboard from '../components/AIRevenueDashboard';
import {
    LayoutDashboard,
    ClipboardList,
    Calendar,
    Activity,
    Users,
    User,
    LogOut,
    Moon,
    Sun,
    Plus,
    Save,
    Stethoscope,
    Pill,
    FileText,
    MapPin,
    Phone,
    Clock,
    UserPlus,
    History,
    FileSpreadsheet,
    Menu,
    X,
    CheckCircle,
    AlertCircle,
    Upload
} from 'lucide-react';
import AIPrescriptionUpload from '../components/AIPrescriptionUpload';
import PatientHistory from '../components/PatientHistory';
import AssignTaskButton from '../components/AssignTaskButton';

import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const { user, updateUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [selectedPatientId, setSelectedPatientId] = useState('');
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
    const [allPatients, setAllPatients] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Consultation state
    const [consultation, setConsultation] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
    });

    // Prescription state (for new prescriptions during consultation)
    const [prescription, setPrescription] = useState({
        medications: [{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        patientName: '',
        appointmentDate: '',
        appointmentTime: '',
        type: 'Consultation',
        chiefComplaint: ''
    });
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        age: '',
        gender: 'Male',
        bloodGroup: ''
    });

    useEffect(() => {
        fetchTodayAppointments();
        fetchAllPatients();
        fetchPrescriptions();
    }, []);

    const fetchTodayAppointments = async () => {
        try {
            const date = new Date();
            const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const response = await api.get('/appointments');
            const todayAppts = response.data.data.filter(apt =>
                apt.appointmentDate.startsWith(today) && apt.doctorId?._id === user.id
            );
            setTodayAppointments(todayAppts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setLoading(false);
        }
    };

    const fetchAllPatients = async () => {
        try {
            const response = await api.get('/patients');
            setAllPatients(response.data.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const fetchPrescriptions = async () => {
        try {
            const response = await api.get('/prescriptions');
            setPrescriptions(response.data.data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        }
    };

    const startConsultation = (appointment) => {
        setSelectedAppointment(appointment);
        setActiveTab('appointments');
    };

    const saveConsultation = async () => {
        if (!selectedAppointment) return;

        try {
            await api.post('/consultations', {
                appointmentId: selectedAppointment._id,
                patientId: selectedAppointment.patientId._id,
                doctorId: user.id,
                ...consultation
            });
            alert('Consultation saved successfully!');
            setConsultation({ subjective: '', objective: '', assessment: '', plan: '' });
        } catch (error) {
            alert('Error saving consultation: ' + error.message);
        }
    };

    const savePrescription = async () => {
        if (!selectedAppointment) return;

        try {
            await api.post('/prescriptions', {
                patientId: selectedAppointment.patientId._id,
                doctorId: user.id,
                appointmentId: selectedAppointment._id,
                medications: prescription.medications
            });
            alert('Prescription saved successfully!');
            fetchPrescriptions(); // Refresh list
            setPrescription({ medications: [{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
        } catch (error) {
            alert('Error saving prescription: ' + error.message);
        }
    };

    const addMedication = () => {
        setPrescription({
            ...prescription,
            medications: [...prescription.medications, { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        });
    };

    const updateMedication = (index, field, value) => {
        const updatedMedications = [...prescription.medications];
        updatedMedications[index][field] = value;
        setPrescription({ ...prescription, medications: updatedMedications });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            const patient = allPatients.find(p => p.name.toLowerCase() === bookingData.patientName.toLowerCase());
            if (!patient) {
                alert('Patient not found. Please register the patient first.');
                return;
            }

            const payload = {
                patientId: patient._id,
                doctorId: user.id,
                appointmentDate: bookingData.appointmentDate,
                appointmentTime: bookingData.appointmentTime,
                type: bookingData.type.toLowerCase(),
                chiefComplaint: bookingData.chiefComplaint,
                status: 'scheduled'
            };

            await api.post('/appointments', payload);
            alert('Appointment booked successfully!');
            setShowBookingModal(false);
            setBookingData({ patientName: '', appointmentDate: '', appointmentTime: '', type: 'Consultation', chiefComplaint: '' });
            fetchTodayAppointments();
        } catch (error) {
            alert('Failed to book appointment: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/patients', registerData);
            alert('Patient registered successfully!');
            fetchAllPatients();
            setBookingData({ ...bookingData, patientName: res.data.data.name });
            setShowRegisterModal(false);
            setShowBookingModal(true); // Open booking modal after registration
            setRegisterData({ name: '', email: '', phoneNumber: '', age: '', gender: 'Male', bloodGroup: '' });
        } catch (error) {
            alert('Failed to register patient: ' + (error.response?.data?.message || error.message));
        }
    };

    const sidebarLinks = [
        { id: 'home', label: 'Home', icon: LayoutDashboard },
        { id: 'revenue', label: 'Revenue', icon: Activity },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'upload-prescription', label: 'Upload AI Rx', icon: Upload },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'surgery', label: 'Surgery', icon: Stethoscope },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <DashboardLayout sidebarLinks={sidebarLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="dashboard-content">
                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="home-content">
                        <div className="welcome-banner mb-6">
                            <div className="welcome-text">
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    Welcome, Dr. {user.userName || user.name}! <Activity className="text-white opacity-80" size={24} />
                                </h1>
                                <p className="text-white opacity-90">Your medical practice dashboard for today</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard 
                                icon={Calendar} 
                                number={todayAppointments.length} 
                                label="Today's Appointments" 
                                subtextIcon={Calendar} 
                                subtext={new Date().toLocaleDateString()} 
                                colorClass="text-blue-500"
                            />
                            <StatCard 
                                icon={AlertCircle} 
                                number={todayAppointments.filter(apt => apt.status === 'scheduled').length} 
                                label="Pending Consultations" 
                                subtextIcon={AlertCircle} 
                                subtext="Needs attention" 
                                colorClass="text-orange-500"
                            />
                            <StatCard 
                                icon={CheckCircle} 
                                number={todayAppointments.filter(apt => apt.status === 'completed').length} 
                                label="Completed Today" 
                                subtextIcon={CheckCircle} 
                                subtext="Well done" 
                                colorClass="text-green-500"
                            />
                            <StatCard 
                                icon={Pill} 
                                number={prescriptions.length} 
                                label="Total Prescriptions" 
                                subtextIcon={Pill} 
                                subtext="All-time records" 
                                colorClass="text-purple-500"
                            />
                        </div>

                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="action-buttons">
                                <button onClick={() => setShowBookingModal(true)} className="action-btn">
                                    <Calendar />
                                    <span>New Appointment</span>
                                </button>
                                <AssignTaskButton />
                                <button onClick={() => setShowRegisterModal(true)} className="action-btn">
                                    <UserPlus />
                                    <span>Register New Patient</span>
                                </button>
                                <button onClick={() => setActiveTab('prescriptions')} className="action-btn">
                                    <ClipboardList />
                                    <span>View Prescriptions</span>
                                </button>
                                <button onClick={() => setActiveTab('patients')} className="action-btn">
                                    <Users />
                                    <span>Patient Records</span>
                                </button>
                            </div>
                        </div>

                    </div>
                )}

                {/* PRESCRIPTIONS TAB (Read Only) */}
                {activeTab === 'prescriptions' && (
                    <div className="content-section">
                        <h1><ClipboardList className="header-icon" /> Prescription Records</h1>
                        <div className="records-grid">
                            {prescriptions.map(p => (
                                <div key={p._id} className="prescription-card">
                                    <h3 className="prescription-patient">{p.patientId?.name || 'Unknown Patient'}</h3>
                                    <p className="prescription-info"><Stethoscope size={14} /> <strong>Dr:</strong> {p.doctorId?.userName || 'N/A'}</p>
                                    <p className="prescription-info"><Calendar size={14} /> <strong>Date:</strong> {new Date(p.createdAt).toLocaleDateString()}</p>
                                    <div className="prescription-meds">
                                        <small><Pill size={12} /> <strong>Meds:</strong> {p.medications.map(m => m.drugName).join(', ')}</small>
                                    </div>
                                    <span className="status-readonly">Read Only</span>
                                </div>
                            ))}
                        </div>
                        {prescriptions.length === 0 && (
                            <div className="no-data">
                                <FileText size={48} opacity={0.3} />
                                <p>No prescription records found.</p>
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

                {/* REVENUE TAB */}
                {activeTab === 'revenue' && (
                    <div className="content-section">
                        <AIRevenueDashboard doctorId={user.id} />
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
                        <ProfileSettings showDigitalId={true} />
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
