import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/Namma Clinic logo.jpeg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    CheckCircle,
    Upload
} from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import DashboardGreeting from '../components/common/DashboardGreeting';
import StatCard from '../components/common/StatCard';
import AIPrescriptionUpload from '../components/AIPrescriptionUpload';
import PatientHistory from '../components/PatientHistory';
import ProfileSettings from '../components/ProfileSettings';
import AssignTaskButton from '../components/AssignTaskButton';
import './ReceptionistDashboard.css';

const ReceptionistDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [uploadFile, setUploadFile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [queue, setQueue] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [selectedPatientForPrescription, setSelectedPatientForPrescription] = useState('');

    // Prescription Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [selectedDoctorForPrescription, setSelectedDoctorForPrescription] = useState('');
    const [prescriptionSearchTerm, setPrescriptionSearchTerm] = useState('');

    // New appointment state
    const [showNewAppointment, setShowNewAppointment] = useState(false);
    const editRef = useRef(null);

    // Removed unused handleEditCardClick
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
            const date = new Date();
            const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

    // Removed unused handleRejectAppointment and handleApproveAppointment if they were causing errors
    // Actually, they might be used in the JSX. Let me check.
    // The screenshot says they are assigned a value but never used.
    // If they are not used in JSX, I'll remove them.
    // Wait, line 210 in the screenshot says handleApproveAppointment.
    // Let me check if they are in the JSX.

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

    // todayAppointments removed if unused

    const sidebarLinks = [
        { id: 'home', label: 'Home', icon: LayoutDashboard },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'upload-prescription', label: 'Upload AI Rx', icon: Upload },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'queue', label: 'Queue', icon: List },
        { id: 'profile', label: 'Profile', icon: User }
    ];

    return (
        <DashboardLayout sidebarLinks={sidebarLinks} activeTab={activeTab} setActiveTab={setActiveTab}>

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="home-content">
                        <DashboardGreeting user={user} role="receptionist" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard 
                                icon={Calendar} 
                                number={appointments.length} 
                                label="Total Appointments" 
                                subtextIcon={Calendar} 
                                subtext={new Date().toLocaleDateString()} 
                                colorClass="text-blue-500"
                            />
                            <StatCard 
                                icon={Users} 
                                number={patients.length} 
                                label="Registered Patients" 
                                subtextIcon={Users} 
                                subtext="All-time total" 
                                colorClass="text-emerald-500"
                            />
                            <StatCard 
                                icon={Clock} 
                                number={queue.length} 
                                label="Active Queue" 
                                subtextIcon={Clock} 
                                subtext="Waiting now" 
                                colorClass="text-amber-500"
                            />
                            <StatCard 
                                icon={Activity} 
                                number={`₹${appointments.filter(a => a.status === 'completed').length * 500}`} 
                                label="Today's Revenue" 
                                subtextIcon={Activity} 
                                subtext="Est. Earnings" 
                                colorClass="text-purple-500"
                            />
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
                                <AssignTaskButton />
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
                        <h1><Users className="header-icon" /> Namma Clinic Patient Directory</h1>
                        <PatientHistory source="receptionist" />
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
                    <div className="profile-tab-container">
                        <ProfileSettings showDigitalId={false} />
                    </div>
                )}
            
            {/* NEW APPOINTMENT MODAL */}
            {showNewAppointment && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Book New Appointment</h2>
                            <button onClick={() => setShowNewAppointment(false)} className="close-btn"><X /></button>
                        </div>
                        <div className="modal-form">
                            <div className="form-group">
                                <label>Patient Name</label>
                                <input
                                    list="patient-names"
                                    required
                                    value={newAppointment.patientName}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                                    placeholder="Search or Select Patient"
                                />
                                <datalist id="patient-names">
                                    {patients.map(p => <option key={p._id} value={p.name} />)}
                                </datalist>
                            </div>
                            <div className="form-group">
                                <label>Doctor Name</label>
                                <input
                                    list="doctor-names"
                                    required
                                    value={newAppointment.doctorName}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, doctorName: e.target.value })}
                                    placeholder="Search or Select Doctor"
                                />
                                <datalist id="doctor-names">
                                    {clinics.map(d => <option key={d._id} value={d.userName} />)}
                                </datalist>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newAppointment.appointmentDate}
                                        onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={newAppointment.appointmentTime}
                                        onChange={(e) => setNewAppointment({ ...newAppointment, appointmentTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Consultation Type</label>
                                <select
                                    value={newAppointment.type}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
                                >
                                    <option value="consultation">Consultation</option>
                                    <option value="follow-up">Follow-up</option>
                                    <option value="surgery">Surgery</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Chief Complaint</label>
                                <textarea
                                    value={newAppointment.chiefComplaint}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, chiefComplaint: e.target.value })}
                                    placeholder="Briefly describe the patient's issue"
                                />
                            </div>
                            <button onClick={bookAppointment} className="btn-primary w-full mt-4">Confirm Booking</button>
                        </div>
                    </div>
                </div>
            )}

            {/* QUICK ADD PATIENT MODAL */}
            {showQuickAddPatient && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Register New Patient</h2>
                            <button onClick={() => setShowQuickAddPatient(false)} className="close-btn"><X /></button>
                        </div>
                        <div className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={quickPatient.name}
                                        onChange={(e) => setQuickPatient({ ...quickPatient, name: e.target.value })}
                                        placeholder="Patient's Full Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={quickPatient.phoneNumber}
                                        onChange={(e) => setQuickPatient({ ...quickPatient, phoneNumber: e.target.value })}
                                        placeholder="10-digit mobile"
                                    />
                                </div>
                            </div>
                            <div className="form-row mt-4">
                                <div className="form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        required
                                        value={quickPatient.age}
                                        onChange={(e) => setQuickPatient({ ...quickPatient, age: e.target.value })}
                                        placeholder="Age"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Blood Group</label>
                                    <input
                                        type="text"
                                        value={quickPatient.bloodGroup}
                                        onChange={(e) => setQuickPatient({ ...quickPatient, bloodGroup: e.target.value })}
                                        placeholder="e.g. A+, O-"
                                    />
                                </div>
                            </div>
                            <div className="form-group mt-4">
                                <label>Email (Optional)</label>
                                <input
                                    type="email"
                                    value={quickPatient.email}
                                    onChange={(e) => setQuickPatient({ ...quickPatient, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <button onClick={addQuickPatient} className="btn-primary w-full mt-6">Register & Continue</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer links={[
                { label: 'AI Upload', onClick: () => setActiveTab('upload-prescription') },
                { label: 'Booking', onClick: () => setActiveTab('appointments') },
                { label: 'Patients', onClick: () => setActiveTab('patients') },
                { label: 'Queue', onClick: () => setActiveTab('queue') },
                { label: 'Profile', onClick: () => setActiveTab('profile') }
            ]} />
        </DashboardLayout>
    );
};

export default ReceptionistDashboard;
