import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import DigitalIDCard from '../components/DigitalIDCard';
import Footer from '../components/Footer';
import DashboardLayout from '../components/common/DashboardLayout';
import DashboardGreeting from '../components/common/DashboardGreeting';
import StatCard from '../components/common/StatCard';
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
    History,
    FileSpreadsheet,
    AlertCircle,
    Upload,
    Thermometer,
    Droplets,
    Scale,
    Ruler,
    Heart
} from 'lucide-react';
import AIPrescriptionUpload from '../components/AIPrescriptionUpload';
import PatientHistory from '../components/PatientHistory';
import AssignTaskButton from '../components/AssignTaskButton';
import './NurseDashboard.css';

const NurseDashboard = () => {
    const { user, updateUser, logout } = useAuth();
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

    const handleUpdateProfile = async (e) => {
        try {
            const res = await api.put('/users/profile', {
                userId: user.id,
                role: 'clinic',
                ...profileDetails
            });
            updateUser(res.data.data);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const todayAppointments = appointments.filter(apt => {
        const date = new Date();
        const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return apt.appointmentDate.startsWith(today);
    });

    const sidebarLinks = [
        { id: 'home', label: 'Home', icon: LayoutDashboard },
        { id: 'records', label: 'Patient Records', icon: Users },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'upload-prescription', label: 'Upload AI Rx', icon: Upload },
        { id: 'followups', label: 'Follow Ups', icon: ClipboardList },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <DashboardLayout sidebarLinks={sidebarLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
            {/* HOME TAB */}
            {activeTab === 'home' && (
                <div className="home-content">
                    <DashboardGreeting user={user} role="nurse" />

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
                            icon={Droplets} 
                            number={labSamples.filter(s => s.status === 'ordered').length} 
                            label="Pending Lab Samples" 
                            subtextIcon={Droplets} 
                            subtext="Urgent collections" 
                            colorClass="text-red-500"
                        />
                        <StatCard 
                            icon={Pill} 
                            number={prescriptions.length} 
                            label="Total Prescriptions" 
                            subtextIcon={Pill} 
                            subtext="All-time records" 
                            colorClass="text-purple-500"
                        />
                        <StatCard 
                            icon={Activity} 
                            number="24" 
                            label="Vitals Recorded" 
                            subtextIcon={Activity} 
                            subtext="Patient updates" 
                            colorClass="text-green-500"
                        />
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
                                <AssignTaskButton />
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
                                        className="btn-primary"
                                        onClick={handleUpdateProfile}
                                    >
                                        <Save size={18} />
                                        <span>Save Professional Details</span>
                                    </button>
                                </div>

                                {/* Account Maintenance Section */}
                                <div className="account-maintenance-section">
                                    <div className="section-header danger-header">
                                        <AlertCircle size={18} />
                                        <h2>Account Maintenance</h2>
                                    </div>
                                    <div className="maintenance-card danger-zone">
                                        <div className="maintenance-info">
                                            <h3>Delete Your Account</h3>
                                            <p>This will permanently remove your medical profile, appointment history, and all associated records from our system. This action cannot be undone.</p>
                                        </div>
                                        <button className="btn-delete-account" onClick={handleDeleteAccount}>
                                            Delete My Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            <Footer links={[
                { label: 'Home', onClick: () => setActiveTab('home') },
                { label: 'AI Upload', onClick: () => setActiveTab('upload-prescription') },
                { label: 'Records', onClick: () => setActiveTab('records') },
                { label: 'Lab Tests', onClick: () => setActiveTab('labtests') },
                { label: 'Profile', onClick: () => setActiveTab('profile') }
            ]} />
        </DashboardLayout>
    );
};

export default NurseDashboard;
