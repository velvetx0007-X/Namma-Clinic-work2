import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/Namma Clinic logo.jpeg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axiosInstance';
import DigitalIDCard from '../components/DigitalIDCard';
import Footer from '../components/Footer';
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

import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const { user, updateUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [profileDetails, setProfileDetails] = useState({
        nmrNumber: user.nmrNumber || '',
        specialization: user.specialization || '',
        age: user.age || '',
        address: user.address || '',
        phoneNumber: user.phoneNumber || ''
    });
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

    useEffect(() => {
        fetchTodayAppointments();
        fetchAllPatients();
        fetchPrescriptions();
    }, []);

    const fetchTodayAppointments = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
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

    return (
        <div className="doctor-dashboard">
            {/* Top Navigation Bar */}
            <nav className="top-navbar">
                <div className="navbar-brand">
                    <img src={logo} alt="Namma Clinic" className="navbar-logo" />
                    <h2>Namma Clinic</h2>
                </div>
                <div className="navbar-menu">
                    <button
                        className={activeTab === 'home' ? 'active' : ''}
                        onClick={() => setActiveTab('home')}
                    >
                        <LayoutDashboard size={18} />
                        <span>Home</span>
                    </button>
                    <button
                        className={activeTab === 'prescriptions' ? 'active' : ''}
                        onClick={() => setActiveTab('prescriptions')}
                    >
                        <Pill size={18} />
                        <span>Prescriptions</span>
                    </button>
                    <button
                        className={activeTab === 'upload-prescription' ? 'active' : ''}
                        onClick={() => setActiveTab('upload-prescription')}
                    >
                        <Upload size={18} />
                        <span>Upload AI Rx</span>
                    </button>
                    <button
                        className={activeTab === 'appointments' ? 'active' : ''}
                        onClick={() => setActiveTab('appointments')}
                    >
                        <Calendar size={18} />
                        <span>Appointments</span>
                    </button>
                    <button
                        className={activeTab === 'surgery' ? 'active' : ''}
                        onClick={() => setActiveTab('surgery')}
                    >
                        <Stethoscope size={18} />
                        <span>Surgery</span>
                    </button>
                    <button
                        className={activeTab === 'patients' ? 'active' : ''}
                        onClick={() => setActiveTab('patients')}
                    >
                        <Users size={18} />
                        <span>Patients</span>
                    </button>
                    <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} />
                        <span>Profile</span>
                    </button>
                </div>
                <div className="navbar-actions">
                    <button onClick={toggleTheme} className="theme-toggle">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div className="user-profile">
                        <img
                            src={user.profilePhoto ? `http://localhost:5000/${user.profilePhoto}` : `https://ui-avatars.com/api/?name=${user.userName || user.name}&background=10b981&color=fff`}
                            alt="Profile"
                            className="nav-profile-img"
                        />
                        <span className="user-name">Dr. {user.userName || user.name}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="dashboard-main">

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="home-content">
                        <div className="welcome-banner">
                            <div className="welcome-text">
                                <h1>Welcome, Dr. {user.userName || user.name}! <Activity className="inline-icon" /></h1>
                                <p>Your medical practice dashboard for today</p>
                            </div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Today's Appointments</h3>
                                <p className="stat-number">{todayAppointments.length}</p>
                                <div className="stat-footer">
                                    <Calendar size={14} /> <span>{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <h3>Pending Consultations</h3>
                                <p className="stat-number">
                                    {todayAppointments.filter(apt => apt.status === 'scheduled').length}
                                </p>
                                <div className="stat-footer">
                                    <AlertCircle size={14} /> <span>Needs attention</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <h3>Completed Today</h3>
                                <p className="stat-number">
                                    {todayAppointments.filter(apt => apt.status === 'completed').length}
                                </p>
                                <div className="stat-footer">
                                    <CheckCircle size={14} /> <span>Well done</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <h3>Total Prescriptions</h3>
                                <p className="stat-number">{prescriptions.length}</p>
                                <div className="stat-footer">
                                    <Pill size={14} /> <span>All-time records</span>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="action-buttons">
                                <button onClick={() => setActiveTab('prescriptions')} className="action-btn">
                                    <ClipboardList />
                                    <span>View Prescriptions</span>
                                </button>
                                <button onClick={() => setActiveTab('appointments')} className="action-btn">
                                    <Calendar />
                                    <span>View Appointments</span>
                                </button>
                                <button onClick={() => setActiveTab('patients')} className="action-btn">
                                    <Users />
                                    <span>Patient Records</span>
                                </button>
                                <button onClick={() => setActiveTab('surgery')} className="action-btn">
                                    <Stethoscope />
                                    <span>Surgery Schedule</span>
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
                        {/* ... rest of the existing appointments content ... */}
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
                            <div className="consultation-section">
                                <h2>Consultation - {selectedAppointment.patientId?.name}</h2>

                                <div className="consultation-form">
                                    <div className="form-group">
                                        <label>Subjective (Patient's Complaint)</label>
                                        <textarea
                                            value={consultation.subjective}
                                            onChange={(e) => setConsultation({ ...consultation, subjective: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Objective (Clinical Findings)</label>
                                        <textarea
                                            value={consultation.objective}
                                            onChange={(e) => setConsultation({ ...consultation, objective: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Assessment (Diagnosis)</label>
                                        <textarea
                                            value={consultation.assessment}
                                            onChange={(e) => setConsultation({ ...consultation, assessment: e.target.value })}
                                            rows="2"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Plan (Treatment Plan)</label>
                                        <textarea
                                            value={consultation.plan}
                                            onChange={(e) => setConsultation({ ...consultation, plan: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <button onClick={saveConsultation} className="btn-save">
                                        <Save size={18} />
                                        <span>Save Consultation</span>
                                    </button>
                                </div>

                                <div className="prescription-form">
                                    <h3>Create Prescription</h3>
                                    {prescription.medications.map((med, index) => (
                                        <div key={index} className="medication-row">
                                            <input
                                                type="text"
                                                placeholder="Drug Name"
                                                value={med.drugName}
                                                onChange={(e) => updateMedication(index, 'drugName', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Dosage"
                                                value={med.dosage}
                                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Frequency"
                                                value={med.frequency}
                                                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Duration"
                                                value={med.duration}
                                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <div className="prescription-actions">
                                        <button onClick={addMedication} className="btn-add">
                                            <Plus size={18} />
                                            <span>Add Medication</span>
                                        </button>
                                        <button onClick={savePrescription} className="btn-save">
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
                        <h1><Users className="header-icon" /> Manage Patient Records</h1>
                        <PatientHistory />
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="profile-content">
                        <h1><User className="header-icon" /> My Professional Profile</h1>
                        <div className="profile-top-grid">
                            <div className="id-card-section">
                                <div className="section-header">
                                    <FileSpreadsheet size={18} />
                                    <h3>Digital ID Card</h3>
                                </div>
                                <DigitalIDCard user={user} onEdit={handleEditCardClick} />
                            </div>
                            <div className="profile-details-section" ref={editRef}>
                                <div className="section-header">
                                    <UserPlus size={18} />
                                    <h2>Settings & Professional Details</h2>
                                </div>

                                <div className="upload-photo-card">
                                    <h3><UserPlus size={16} /> Profile Photo</h3>
                                    <div className="upload-input-group">
                                        <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} />
                                    </div>
                                    <button
                                        className="btn-primary"
                                        onClick={async () => {
                                            if (!uploadFile) return;
                                            setIsUploading(true);
                                            const formData = new FormData();
                                            formData.append('profilePhoto', uploadFile);
                                            formData.append('userId', user.id);
                                            formData.append('role', 'clinic');
                                            try {
                                                const res = await api.post('/users/profile-photo', formData);
                                                updateUser(res.data.data);
                                                alert('Uploaded successfully!');
                                                setUploadFile(null);
                                            } catch (err) { alert('Failed'); }
                                            finally { setIsUploading(false); }
                                        }}
                                        disabled={isUploading}
                                    >
                                        <Plus size={18} />
                                        <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                                    </button>
                                </div>

                                <div className="additional-fields-form">
                                    <h3><FileText size={18} /> Professional Details</h3>
                                    <div className="form-group">
                                        <label>NMR Number</label>
                                        <input
                                            type="text"
                                            value={profileDetails.nmrNumber}
                                            onChange={(e) => setProfileDetails({ ...profileDetails, nmrNumber: e.target.value })}
                                            placeholder="Enter NMR Number"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Specialization</label>
                                        <input
                                            type="text"
                                            value={profileDetails.specialization}
                                            onChange={(e) => setProfileDetails({ ...profileDetails, specialization: e.target.value })}
                                            placeholder="Specialist in..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input
                                            type="number"
                                            value={profileDetails.age}
                                            onChange={(e) => setProfileDetails({ ...profileDetails, age: e.target.value })}
                                            placeholder="Your age"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profileDetails.phoneNumber}
                                            onChange={(e) => setProfileDetails({ ...profileDetails, phoneNumber: e.target.value })}
                                            placeholder="Contact phone"
                                        />
                                    </div>
                                    <div className="form-group span-2">
                                        <label>Clinic Address / Location</label>
                                        <textarea
                                            value={profileDetails.address}
                                            onChange={(e) => setProfileDetails({ ...profileDetails, address: e.target.value })}
                                            placeholder="Full clinic address"
                                        />
                                    </div>
                                    <button
                                        className="btn-primary professional-save-btn"
                                        onClick={async () => {
                                            try {
                                                const res = await api.put('/users/profile', {
                                                    userId: user.id,
                                                    role: 'clinic',
                                                    ...profileDetails
                                                });
                                                updateUser(res.data.data);
                                                alert('Details saved!');
                                            } catch (err) { alert('Failed to save'); }
                                        }}
                                    >
                                        <Save size={18} />
                                        <span>Save Professional Details</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer links={[
                { label: 'Home', onClick: () => setActiveTab('home') },
                { label: 'AI Upload', onClick: () => setActiveTab('upload-prescription') },
                { label: 'Prescriptions', onClick: () => setActiveTab('prescriptions') },
                { label: 'Appointments', onClick: () => setActiveTab('appointments') },
                { label: 'Surgery', onClick: () => setActiveTab('surgery') },
                { label: 'Patients', onClick: () => setActiveTab('patients') },
                { label: 'Profile', onClick: () => setActiveTab('profile') }
            ]} />
        </div>
    );
};

export default DoctorDashboard;
