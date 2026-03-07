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
    List,
    Users,
    Calendar,
    Clock,
    User,
    LogOut,
    Moon,
    Sun,
    Plus,
    UserPlus,
    CreditCard,
    Activity,
    Bell,
    Menu,
    X,
    ChevronRight,
    Heart,
    Stethoscope,
    ClipboardList,
    Settings,
    FileText,
    Save,
    CheckCircle,
    Search,
    Upload
} from 'lucide-react';
import AIPrescriptionUpload from '../components/AIPrescriptionUpload';
import PatientHistory from '../components/PatientHistory';
import './ReceptionistDashboard.css';

const ReceptionistDashboard = () => {
    const { user, updateUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [uploadFile, setUploadFile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [queue, setQueue] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [profileDetails, setProfileDetails] = useState({
        employeeCode: user.employeeCode || '',
        age: user.age || ''
    });

    // Prescription Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [selectedPatientForPrescription, setSelectedPatientForPrescription] = useState('');
    const [selectedDoctorForPrescription, setSelectedDoctorForPrescription] = useState('');
    const [prescriptionSearchTerm, setPrescriptionSearchTerm] = useState('');

    // New appointment state
    const [showNewAppointment, setShowNewAppointment] = useState(false);
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
    const [newAppointment, setNewAppointment] = useState({
        patientName: '',
        doctorName: '',
        appointmentDate: '',
        appointmentTime: '',
        type: 'consultation',
        chiefComplaint: ''
    });

    const [showQuickAddPatient, setShowQuickAddPatient] = useState(false);
    const [quickPatient, setQuickPatient] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        age: '',
        area: '',
        bloodGroup: ''
    });

    useEffect(() => {
        fetchAppointments();
        fetchPatients();
        fetchClinics();
        fetchPrescriptions();
        fetchLabTests();
        if (activeTab === 'queue') {
            fetchTodayQueue();
        }
    }, [activeTab]);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments');
            setAppointments(response.data.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients');
            setPatients(response.data.data);
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

    const fetchLabTests = async () => {
        try {
            const response = await api.get('/lab-tests');
            setLabTests(response.data.data);
        } catch (error) {
            console.error('Error fetching lab tests:', error);
        }
    };

    const fetchClinics = async () => {
        try {
            const response = await api.get('/clinics');
            // Filter only doctors
            setClinics(response.data.data.filter(c => c.userType === 'doctor'));
        } catch (error) {
            console.error('Error fetching clinics:', error);
        }
    };

    const fetchTodayQueue = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await api.get('/appointments');
            const todayAppts = response.data.data.filter(apt =>
                apt.appointmentDate.startsWith(today)
            );
            setQueue(todayAppts);
        } catch (error) {
            console.error('Error fetching queue:', error);
        }
        setLoading(false);
    };

    const bookAppointment = async () => {
        try {
            // Find IDs from names
            const selectedPatient = patients.find(p => p.name === newAppointment.patientName);
            const selectedDoctor = clinics.find(d => d.userName === newAppointment.doctorName);

            if (!selectedPatient || !selectedDoctor) {
                alert('Please select valid patient and doctor from the suggestions');
                return;
            }

            const appointmentData = {
                patientId: selectedPatient._id,
                doctorId: selectedDoctor._id,
                appointmentDate: newAppointment.appointmentDate,
                appointmentTime: newAppointment.appointmentTime,
                type: newAppointment.type.toLowerCase(),
                chiefComplaint: newAppointment.chiefComplaint
            };

            await api.post('/appointments', appointmentData);
            alert('Appointment booked successfully!');
            setNewAppointment({
                patientName: '',
                doctorName: '',
                appointmentDate: '',
                appointmentTime: '',
                type: 'consultation',
                chiefComplaint: ''
            });
            fetchAppointments();
            fetchTodayQueue(); // Added to update queue immediately
        } catch (error) {
            alert('Error booking appointment: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleApproveAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to approve this appointment?')) return;
        try {
            await api.put(`/appointments/${id}`, { status: 'scheduled' });
            alert('Appointment approved!');
            fetchAppointments();
            fetchTodayQueue();
        } catch (error) {
            alert('Error approving appointment: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRejectAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to reject this appointment?')) return;
        try {
            await api.put(`/appointments/${id}`, { status: 'cancelled' });
            alert('Appointment rejected.');
            fetchAppointments();
        } catch (error) {
            alert('Error rejecting appointment: ' + (error.response?.data?.message || error.message));
        }
    };

    const addQuickPatient = async () => {
        try {
            const response = await api.post('/patients', quickPatient);
            alert('Patient added successfully!');
            setPatients([response.data.data, ...patients]);
            // Automatically set this patient in the booking form
            setNewAppointment({ ...newAppointment, patientName: response.data.data.name });
            setQuickPatient({
                name: '',
                email: '',
                phoneNumber: '',
                age: '',
                area: '',
                bloodGroup: ''
            });
            setShowQuickAddPatient(false);
        } catch (error) {
            alert('Error adding patient: ' + (error.response?.data?.message || error.message));
        }
    };

    const handlePrescriptionUpload = async () => {
        if (!uploadFile || !selectedPatientForPrescription || !selectedDoctorForPrescription) {
            alert('Please select a patient, a doctor, and a file to upload.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('prescription', uploadFile);
        formData.append('patientId', selectedPatientForPrescription);
        formData.append('doctorId', selectedDoctorForPrescription);

        try {
            const res = await api.post('/ai-prescriptions/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Prescription uploaded and processed successfully!');
            setPrescriptions([res.data.data, ...prescriptions]);
            setUploadFile(null);
            setSelectedPatientForPrescription('');
            setSelectedDoctorForPrescription('');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload prescription: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsUploading(false);
        }
    };

    const handleLabTestUpload = async () => {
        if (!uploadFile || !selectedPatientForPrescription || !selectedDoctorForPrescription) {
            alert('Please select a patient, a doctor, and a file to upload.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('labTest', uploadFile);
        formData.append('patientId', selectedPatientForPrescription);
        formData.append('orderedBy', selectedDoctorForPrescription);

        try {
            const res = await api.post('/ai-lab-tests/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Lab Test uploaded and processed successfully!');
            setLabTests([res.data.data, ...labTests]);
            setUploadFile(null);
            setSelectedPatientForPrescription('');
            setSelectedDoctorForPrescription('');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload lab test: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const todayAppointments = appointments.filter(apt => {
        const today = new Date().toISOString().split('T')[0];
        return apt.appointmentDate.startsWith(today);
    });

    return (
        <div className="receptionist-dashboard">
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
                        className={activeTab === 'patients' ? 'active' : ''}
                        onClick={() => setActiveTab('patients')}
                    >
                        <Users size={18} />
                        <span>Patients</span>
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
                        className={activeTab === 'queue' ? 'active' : ''}
                        onClick={() => setActiveTab('queue')}
                    >
                        <List size={18} />
                        <span>Queue</span>
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
                        <span className="user-name">Receptionist {user.userName || user.name}</span>
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
                            <h1>Welcome, Receptionist {user.userName || user.name}! <Activity className="inline-icon" /></h1>
                            <p>Daily clinic operations and patient flow management</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Appointments</h3>
                                <p className="stat-number">{appointments.length}</p>
                                <div className="stat-footer">
                                    <Calendar size={14} /> <span>{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <h3>Registered Patients</h3>
                                <p className="stat-number">{patients.length}</p>
                                <div className="stat-footer">
                                    <Users size={14} /> <span>All-time total</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <h3>Active Queue</h3>
                                <p className="stat-number">{queue.length}</p>
                                <div className="stat-footer">
                                    <Clock size={14} /> <span>Waiting now</span>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="action-buttons">
                                <button onClick={() => setShowNewAppointment(true)} className="action-btn">
                                    <Plus />
                                    <span>New Appointment</span>
                                </button>
                                <button onClick={() => setShowQuickAddPatient(true)} className="action-btn">
                                    <UserPlus />
                                    <span>Register New Patient</span>
                                </button>
                                <button onClick={() => setActiveTab('queue')} className="action-btn">
                                    <List />
                                    <span>Manage Queue</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PRESCRIPTIONS TAB */}
                {activeTab === 'prescriptions' && (
                    <div className="content-section">
                        <h1>Prescription Management</h1>

                        {/* Upload Section */}
                        <div className="booking-section">
                            <h2>📤 Upload & Process New Prescription</h2>
                            <div className="form-row row-3-col">
                                <div className="form-group">
                                    <label>Select Patient</label>
                                    <select
                                        value={selectedPatientForPrescription}
                                        onChange={(e) => setSelectedPatientForPrescription(e.target.value)}
                                    >
                                        <option value="">-- Choose Patient --</option>
                                        {patients.map(p => (
                                            <option key={p._id} value={p._id}>{p.name} ({p.uhid || 'No ID'})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Select Doctor</label>
                                    <select
                                        value={selectedDoctorForPrescription}
                                        onChange={(e) => setSelectedDoctorForPrescription(e.target.value)}
                                    >
                                        <option value="">-- Choose Doctor --</option>
                                        {clinics.map(d => (
                                            <option key={d._id} value={d._id}>Dr. {d.userName} ({d.clinicName})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Prescription File (Image/PDF)</label>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setUploadFile(e.target.files[0])}
                                        className="file-input"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handlePrescriptionUpload}
                                className="btn-save"
                                disabled={isUploading}
                                style={{ opacity: isUploading ? 0.7 : 1 }}
                            >
                                {isUploading ? 'Processing with AI...' : 'Upload & Process'}
                            </button>
                        </div>

                        <h2>Rx Records</h2>

                        {/* Search Bar */}
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by Patient Name..."
                                value={prescriptionSearchTerm}
                                onChange={(e) => setPrescriptionSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="records-grid">
                            {prescriptions
                                .filter(p => p.patientId?.name?.toLowerCase().includes(prescriptionSearchTerm.toLowerCase()))
                                .map(p => (
                                    <div key={p._id} className="prescription-card">
                                        <h3 className="prescription-patient">{p.patientId?.name || 'Unknown Patient'}</h3>
                                        <p className="prescription-info"><strong>Dr:</strong> {p.doctorId?.userName || 'N/A'}</p>
                                        <p className="prescription-info"><strong>Date:</strong> {new Date(p.createdAt).toLocaleDateString()}</p>
                                        <div className="prescription-meds">
                                            <small><strong>Meds:</strong> {p.medications.map(m => m.drugName).join(', ')}</small>
                                        </div>
                                        <div className="card-actions-row" style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="status-readonly">Read Only</span>
                                            {p.digitalPrescriptionPdf && (
                                                <a
                                                    href={`http://localhost:5000/${p.digitalPrescriptionPdf}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="download-link"
                                                    style={{ color: 'var(--accent-primary)', fontSize: '20px', textDecoration: 'none' }}
                                                    title="Download PDF"
                                                >
                                                    📥
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                        {prescriptions.filter(p => p.patientId?.name?.toLowerCase().includes(prescriptionSearchTerm.toLowerCase())).length === 0 && (
                            <p className="no-data">
                                No prescription records found matching "{prescriptionSearchTerm}".
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'labTests' && (
                    <div className="content-section">
                        <h1>Lab Test Management</h1>

                        {/* Upload Section */}
                        <div className="booking-section">
                            <h2>📤 Upload & Process New Lab Report</h2>
                            <div className="form-row row-3-col">
                                <div className="form-group">
                                    <label>Select Patient</label>
                                    <select
                                        value={selectedPatientForPrescription}
                                        onChange={(e) => setSelectedPatientForPrescription(e.target.value)}
                                    >
                                        <option value="">-- Choose Patient --</option>
                                        {patients.map(p => (
                                            <option key={p._id} value={p._id}>{p.name} ({p.uhid || 'No ID'})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ordered By (Doctor)</label>
                                    <select
                                        value={selectedDoctorForPrescription}
                                        onChange={(e) => setSelectedDoctorForPrescription(e.target.value)}
                                    >
                                        <option value="">-- Choose Doctor --</option>
                                        {clinics.map(d => (
                                            <option key={d._id} value={d._id}>Dr. {d.userName} ({d.clinicName})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Lab Report File (Image/PDF)</label>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setUploadFile(e.target.files[0])}
                                        className="file-input"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleLabTestUpload}
                                className="btn-save"
                                disabled={isUploading}
                                style={{ opacity: isUploading ? 0.7 : 1 }}
                            >
                                {isUploading ? 'Processing with AI...' : 'Upload & Process'}
                            </button>
                        </div>

                        <h2>Lab Records</h2>
                        <div className="records-grid">
                            {labTests.map(t => (
                                <div key={t._id} className="prescription-card">
                                    <h3 className="prescription-patient">{t.testName}</h3>
                                    <p className="prescription-info"><strong>Patient:</strong> {t.patientId?.name || 'Unknown'}</p>
                                    <p className="prescription-info"><strong>Dr:</strong> {t.orderedBy?.userName || 'N/A'}</p>
                                    <p className="prescription-info"><strong>Date:</strong> {new Date(t.createdAt).toLocaleDateString()}</p>
                                    <div style={{ marginTop: '10px' }}>
                                        <span className={`status-badge status-${t.status}`}>
                                            {t.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {labTests.length === 0 && <p className="no-data">No lab records found.</p>}
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
                    <div className="content-section">
                        <div className="flex-between-center mb-20">
                            <h1><Calendar className="header-icon" /> Appointments</h1>
                            <button className="btn-primary" onClick={() => setShowNewAppointment(true)}>
                                <Plus size={18} />
                                <span>Book New Appointment</span>
                            </button>
                        </div>
                        <div className="records-grid">
                            {appointments.map((apt) => (
                                <div key={apt._id} className="appointment-card">
                                    <div className="apt-header">
                                        <h3>{apt.patientId?.name || 'Anonymous Patient'}</h3>
                                        <span className={`status-badge status-${apt.status}`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <div className="apt-body">
                                        <p><Clock size={14} /> <strong>Time:</strong> {apt.appointmentTime}</p>
                                        <p><Calendar size={14} /> <strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                                        <p><Stethoscope size={14} /> <strong>Type:</strong> {apt.type || 'General'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {appointments.length === 0 && (
                            <div className="no-data">
                                <Calendar size={48} opacity={0.3} />
                                <p>No appointments scheduled</p>
                            </div>
                        )}
                    </div>
                )}

                {/* PATIENTS TAB */}
                {activeTab === 'patients' && (
                    <div className="content-section">
                        <h1><Users className="header-icon" /> Manage Patient Records</h1>
                        <PatientHistory />
                    </div>
                )}

                {/* QUEUE TAB */}
                {activeTab === 'queue' && (
                    <div className="content-section">
                        <div className="section-header">
                            <List size={24} className="header-icon" />
                            <h1>Live Patient Queue</h1>
                        </div>
                        <div className="queue-grid">
                            {queue.map((q, idx) => (
                                <div key={q._id} className="queue-card">
                                    <div className="queue-number">#{idx + 1}</div>
                                    <div className="queue-details">
                                        <h3>{q.patientId?.name || 'Patient'}</h3>
                                        <span className="queue-time"><Clock size={12} /> {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="queue-status">
                                        <span className={`status-badge status-${q.status}`}>
                                            {q.status === 'waiting' ? <Clock size={12} /> : <CheckCircle size={12} />} {q.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {queue.length === 0 && (
                            <div className="no-data">
                                <Activity size={48} opacity={0.3} />
                                <p>Queue is empty for today</p>
                            </div>
                        )}
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="profile-content">
                        <div className="section-header">
                            <User size={24} className="header-icon" />
                            <h1>Receptionist Profile</h1>
                        </div>
                        <div className="profile-top-grid">
                            <div className="id-card-section">
                                <div className="section-header">
                                    <ClipboardList size={18} />
                                    <h3>Digital ID Card</h3>
                                </div>
                                <DigitalIDCard user={user} onEdit={handleEditCardClick} />
                            </div>
                            <div className="profile-details-section" ref={editRef}>
                                <div className="section-header">
                                    <Settings size={20} />
                                    <h2>Profile Settings</h2>
                                </div>

                                <div className="upload-photo-card">
                                    <h3><UserPlus size={16} /> Update Profile Photo</h3>
                                    <div className="upload-input-group">
                                        <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} />
                                    </div>
                                    <button
                                        className="btn-primary"
                                        onClick={async () => {
                                            if (!uploadFile) return;
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
                                        }}
                                    >
                                        <Plus size={18} />
                                        <span>Upload Photo</span>
                                    </button>
                                </div>

                                <div className="additional-fields-form">
                                    <h3><FileText size={18} /> Professional Details</h3>
                                    <div className="form-group">
                                        <label>Employee Code</label>
                                        <input
                                            type="text"
                                            value={profileDetails.employeeCode}
                                            onChange={(e) => setProfileDetails({ ...profileDetails, employeeCode: e.target.value })}
                                            placeholder="Enter Code"
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
                                    <button
                                        className="btn-primary"
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
                { label: 'AI Upload', onClick: () => setActiveTab('upload-prescription') },
                { label: 'Booking', onClick: () => setActiveTab('appointments') },
                { label: 'Patients', onClick: () => setActiveTab('patients') },
                { label: 'Queue', onClick: () => setActiveTab('queue') },
                { label: 'Profile', onClick: () => setActiveTab('profile') }
            ]} />
        </div >
    );
};

export default ReceptionistDashboard;
