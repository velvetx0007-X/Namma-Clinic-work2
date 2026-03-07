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
    Upload,
    Thermometer,
    Droplets,
    Scale,
    Ruler,
    Heart,
    Search, // Added from new list
    Clipboard, // Added from new list
    Droplet, // Added from new list (Droplets was already there, keeping both for now)
    Zap, // Added from new list
    Wind // Added from new list
} from 'lucide-react';
import AIPrescriptionUpload from '../components/AIPrescriptionUpload';
import PatientHistory from '../components/PatientHistory';
import './NurseDashboard.css';

const NurseDashboard = () => {
    const { user, updateUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [uploadFile, setUploadFile] = useState(null);
    const [profileDetails, setProfileDetails] = useState({
        nuid: user.nuid || '',
        age: user.age || ''
    });
    const [appointments, setAppointments] = useState([]);
    const [selectedPatientVitals, setSelectedPatientVitals] = useState(null);
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
    const [loading, setLoading] = useState(false);
    const [labSamples, setLabSamples] = useState([]);

    // Vitals state
    const [vitals, setVitals] = useState({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        pulseRate: '',
        temperature: '',
        oxygenLevel: '',
        weight: '',
        height: '',
        notes: ''
    });

    const [prescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        fetchAppointments();
        fetchPrescriptions();
        if (activeTab === 'patientRecords') {
            fetchLabSamples();
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

    const fetchPrescriptions = async () => {
        try {
            const response = await api.get('/prescriptions');
            setPrescriptions(response.data.data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        }
    };

    const fetchLabSamples = async () => {
        setLoading(true);
        try {
            const response = await api.get('/lab-tests');
            const pending = response.data.data.filter(test => test.status === 'ordered');
            setLabSamples(pending);
        } catch (error) {
            console.error('Error fetching lab tests:', error);
        }
        setLoading(false);
    };

    const recordVitals = async () => {
        if (!selectedPatientVitals) {
            alert('Please select a patient first');
            return;
        }

        try {
            await api.post('/vitals', {
                patientId: selectedPatientVitals,
                ...vitals
            });
            alert('Vitals recorded successfully!');
            setVitals({
                bloodPressureSystolic: '',
                bloodPressureDiastolic: '',
                pulseRate: '',
                temperature: '',
                oxygenLevel: '',
                weight: '',
                height: '',
                notes: ''
            });
        } catch (error) {
            alert('Error recording vitals: ' + error.message);
        }
    };

    const collectSample = async (testId) => {
        try {
            await api.patch(`/lab-tests/${testId}/collect-sample`);
            alert('Sample collected successfully!');
            fetchLabSamples();
        } catch (error) {
            alert('Error collecting sample: ' + error.message);
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
        <div className="nurse-dashboard">
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
                        className={activeTab === 'records' ? 'active' : ''}
                        onClick={() => setActiveTab('records')}
                    >
                        <Users size={18} />
                        <span>Patient Records</span>
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
                        className={activeTab === 'followups' ? 'active' : ''}
                        onClick={() => setActiveTab('followups')}
                    >
                        <ClipboardList size={18} />
                        <span>Follow Ups</span>
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
                        <span className="user-name">Nurse {user.userName || user.name}</span>
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
                            <h1>Welcome, Nurse {user.userName || user.name}! <Activity className="inline-icon" /></h1>
                            <p>Daily nursing overview and patient care</p>
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
                                <h3>Pending Lab Samples</h3>
                                <p className="stat-number">{labSamples.filter(s => s.status === 'pending').length}</p>
                                <div className="stat-footer">
                                    <Droplets size={14} /> <span>Urgent collections</span>
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
                                <button onClick={() => setActiveTab('records')} className="action-btn">
                                    <Users />
                                    <span>Manage Patient Records</span>
                                </button>
                                <button onClick={() => setActiveTab('prescriptions')} className="action-btn">
                                    <Pill />
                                    <span>Prescription Logs</span>
                                </button>
                                <button onClick={() => setActiveTab('followups')} className="action-btn">
                                    <ClipboardList />
                                    <span>Follow Up Schedule</span>
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

                {/* PATIENT RECORDS TAB */}
                {activeTab === 'records' && (
                    <div className="content-section">
                        <h1><Users className="header-icon" /> Manage Patient Records</h1>
                        <PatientHistory />
                        
                        <div className="mt-10 pt-10 border-t border-gray-100">
                            <div className="section-header">
                                <Users size={24} className="header-icon" />
                                <h1>Record Patient Vitals</h1>
                            </div>

                            <div className="vitals-section">
                                <div className="vitals-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label><User size={14} /> Patient ID</label>
                                            <input
                                                type="text"
                                                placeholder="Enter patient ID"
                                                value={selectedPatientVitals || ''}
                                                onChange={(e) => setSelectedPatientVitals(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                    <div className="form-group">
                                        <label><Heart size={14} /> Blood Pressure (Systolic)</label>
                                        <input
                                            type="number"
                                            placeholder="mmHg"
                                            value={vitals.bloodPressureSystolic}
                                            onChange={(e) => setVitals({ ...vitals, bloodPressureSystolic: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Heart size={14} /> Blood Pressure (Diastolic)</label>
                                        <input
                                            type="number"
                                            placeholder="mmHg"
                                            value={vitals.bloodPressureDiastolic}
                                            onChange={(e) => setVitals({ ...vitals, bloodPressureDiastolic: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Activity size={14} /> Pulse Rate</label>
                                        <input
                                            type="number"
                                            placeholder="bpm"
                                            value={vitals.pulseRate}
                                            onChange={(e) => setVitals({ ...vitals, pulseRate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Thermometer size={14} /> Temperature (°C)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="°C"
                                            value={vitals.temperature}
                                            onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label><Droplets size={14} /> Oxygen Level (%)</label>
                                        <input
                                            type="number"
                                            placeholder="%"
                                            value={vitals.oxygenLevel}
                                            onChange={(e) => setVitals({ ...vitals, oxygenLevel: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Scale size={14} /> Weight (kg)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="kg"
                                            value={vitals.weight}
                                            onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Ruler size={14} /> Height (cm)</label>
                                        <input
                                            type="number"
                                            placeholder="cm"
                                            value={vitals.height}
                                            onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button onClick={recordVitals} className="btn-save">
                                    <Save size={18} />
                                    <span>Save Patient Vitals</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lab-samples-section">
                            <div className="section-header">
                                <Droplets size={20} />
                                <h2>Pending Lab Samples</h2>
                            </div>
                            {loading ? (
                                <div className="loading-state">
                                    <Clock className="animate-spin" size={32} />
                                    <p>Loading samples...</p>
                                </div>
                            ) : labSamples.length === 0 ? (
                                <div className="no-data">
                                    <Droplets size={48} opacity={0.3} />
                                    <p>No lab samples pending collection</p>
                                </div>
                            ) : (
                                <div className="samples-grid">
                                    {labSamples.map((test) => (
                                        <div key={test._id} className="sample-card">
                                            <div className="sample-header">
                                                <h3>{test.testName || 'Laboratory Test'}</h3>
                                                <span className={`status-badge status-${test.status}`}>
                                                    {test.status}
                                                </span>
                                            </div>
                                            <div className="sample-body">
                                                <p><User size={14} /> <strong>Patient:</strong> {test.patientId?.name || 'N/A'}</p>
                                                <p><Stethoscope size={14} /> <strong>Sample:</strong> {test.sampleType || 'N/A'}</p>
                                                <p><Clock size={14} /> <strong>Requested:</strong> {new Date(test.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={() => collectSample(test._id)} className="btn-collect">
                                                <Droplets size={18} />
                                                <span>Collect Sample</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* FOLLOW-UPS TAB */}
                {activeTab === 'followups' && (
                    <div className="followups-content">
                        <h1><Calendar className="header-icon" /> Patient Follow-ups</h1>
                        <div className="placeholder-section">
                            <History size={48} className="placeholder-icon" />
                            <p>Follow-up management feature coming soon</p>
                            <small>Track post-consultation care and patient recovery with automated reminders</small>
                        </div>
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="profile-content">
                        <h1><User className="header-icon" /> Nursing Professional Profile</h1>
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
                                        <label>NUID</label>
                                        <input
                                            type="text"
                                            value={profileDetails.nuid}
                                            onChange={(e) => setProfileDetails({ ...profileDetails, nuid: e.target.value })}
                                            placeholder="Enter NUID"
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
                                        className="btn-primary mt-10"
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
                { label: 'Records', onClick: () => setActiveTab('records') },
                { label: 'Lab Tests', onClick: () => setActiveTab('labtests') },
                { label: 'Profile', onClick: () => setActiveTab('profile') }
            ]} />
        </div>
    );
};

export default NurseDashboard;
