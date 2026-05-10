import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/Namma Clinic logo.jpeg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axiosInstance';
import ProfileSettings from '../components/ProfileSettings';
import Footer from '../components/Footer';
import AIPrescriptionUpload from '../components/AIPrescriptionUpload';
import PatientHistory from '../components/PatientHistory';
import { LogOut, Edit, Trash2, Heart, Activity, FileText, Upload, Plus, Pill, Search, Users, Star, MessageSquare, LayoutDashboard, Shield, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import DashboardGreeting from '../components/common/DashboardGreeting';
import StatCard from '../components/common/StatCard';
import AIRevenueDashboard from '../components/AIRevenueDashboard';
import AssignTaskButton from '../components/AssignTaskButton';

import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, updateUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [uploadFile, setUploadFile] = useState(null);
    const editRef = useRef(null);

    const handleEditCardClick = () => {
        if (editRef.current) {
            editRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            editRef.current.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            setTimeout(() => {
                if (editRef.current) editRef.current.style.backgroundColor = 'transparent';
            }, 2000);
        }
    };

    // Data states
    const [admins, setAdmins] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [receptionists, setReceptionists] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // Form state for creating new users
    const [newUser, setNewUser] = useState({
        userType: 'doctor', // Default
        userName: '',
        phoneNumber: '',
        email: '',
        password: '',
        clinicName: 'Namma Clinic Main',
        clinicRegistrationNumber: '',
        issuedArea: '',
        nmrNumber: '',
        nuid: '',
        employeeCode: '',
        age: '',
        address: '',
        lat: 13.0827,
        lng: 80.2707
    });

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [isPrescriptionFormVisible, setIsPrescriptionFormVisible] = useState(false);
    const [isVitalsFormVisible, setIsVitalsFormVisible] = useState(false);
    const [isLabTestFormVisible, setIsLabTestFormVisible] = useState(false);

    // AI Prescription Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [selectedPatientForPrescription, setSelectedPatientForPrescription] = useState('');
    const [selectedDoctorForPrescription, setSelectedDoctorForPrescription] = useState('');

    const [newPrescription, setNewPrescription] = useState({
        patientId: '',
        doctorId: '',
        medications: [{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        validUntil: ''
    });

    const [newVitals, setNewVitals] = useState({
        patientId: '',
        appointmentId: '', // Optional/linked if selected
        bloodPressure: '',
        pulse: '',
        temperature: '',
        oxygenLevel: '',
        weight: '',
        height: '',
        notes: ''
    });

    const [newLabTest, setNewLabTest] = useState({
        patientId: '',
        testName: '',
        testType: 'blood' // default
    });

    const [selectedClinicForAnalytics, setSelectedClinicForAnalytics] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [clinicsRes, appointmentsRes, patientsRes, prescriptionsRes, adminsRes, reviewsRes] = await Promise.all([
                api.get('/clinics'),
                api.get('/appointments'),
                api.get('/patients'),
                api.get('/prescriptions'),
                api.get('/admins'),
                api.get('/reviews/admin/all')
            ]);

            const allStaff = clinicsRes.data.data || [];

            setDoctors(allStaff.filter(s => s.userType === 'doctor'));
            setNurses(allStaff.filter(s => s.userType === 'nurse'));
            setReceptionists(allStaff.filter(s => s.userType === 'receptionist'));

            setAppointments(appointmentsRes.data.data || []);
            setPatients(patientsRes.data.data || []);
            setPrescriptions(prescriptionsRes.data.data || []);
            setAdmins(adminsRes.data.data || []);
            setReviews(reviewsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const handleCreatePrescription = async (e) => {
        e.preventDefault();
        try {
            await api.post('/prescriptions', newPrescription);
            alert('Prescription Record Added Successfully!');
            setIsPrescriptionFormVisible(false);
            setNewPrescription({
                patientId: '',
                doctorId: '',
                medications: [{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }],
                validUntil: ''
            });
            fetchData();
        } catch (error) {
            alert('Error creating prescription: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeletePrescription = async (id) => {
        if (!window.confirm('Are you sure you want to delete this prescription record?')) return;
        try {
            await api.delete(`/prescriptions/${id}`);
            alert('Prescription record deleted');
            fetchData();
        } catch (error) {
            alert('Error deleting prescription: ' + error.message);
        }
    };

    const handleAddMedication = () => {
        setNewPrescription({
            ...newPrescription,
            medications: [...newPrescription.medications, { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        });
    };


    const handleCreateVitals = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vitals', newVitals);
            alert('Vitals Recorded Successfully!');
            setIsVitalsFormVisible(false);
            setNewVitals({
                patientId: '',
                appointmentId: '',
                bloodPressure: '',
                pulse: '',
                temperature: '',
                oxygenLevel: '',
                weight: '',
                height: '',
                notes: ''
            });
        } catch (error) {
            alert('Error recording vitals: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCreateLabTest = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lab-tests', newLabTest);
            alert('Lab Test Ordered Successfully!');
            setIsLabTestFormVisible(false);
            setNewLabTest({
                patientId: '',
                testName: '',
                testType: 'blood'
            });
        } catch (error) {
            alert('Error ordering lab test: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleMedicationChange = (index, field, value) => {
        const updatedMeds = [...newPrescription.medications];
        updatedMeds[index][field] = value;
        setNewPrescription({ ...newPrescription, medications: updatedMeds });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // UPDATE USER
                let url = `/clinics/${editingUserId}`;
                const updateData = { ...newUser };
                delete updateData.password; // Don't update password unless explicitly changed (frontend logic simplified here)

                if (newUser.userType === 'admin') {
                    url = `/admins/${editingUserId}`;
                    // Map back to schema fields
                    updateData.name = newUser.userName;
                    updateData.companyName = newUser.clinicName;
                    updateData.companyId = newUser.clinicRegistrationNumber;
                } else if (newUser.userType === 'patient') {
                    url = `/patients/${editingUserId}`;
                    updateData.name = newUser.userName;
                } else if (['doctor', 'nurse', 'receptionist'].includes(newUser.userType)) {
                    url = `/clinics/${editingUserId}`;
                    updateData.location = {
                        lat: newUser.lat || 13.0827,
                        lng: newUser.lng || 80.2707
                    };
                    delete updateData.lat;
                    delete updateData.lng;
                }

                await api.put(url, updateData);
                alert(`${newUser.userType.toUpperCase()} updated successfully!`);

            } else {
                // CREATE USER logic (Hidden but kept for safety/logic integrity)
                if (newUser.userType === 'admin') {
                    await api.post('/auth/signup/admin', {
                        name: newUser.userName,
                        email: newUser.email,
                        password: newUser.password,
                        companyName: newUser.clinicName,
                        companyId: newUser.clinicRegistrationNumber
                    });
                } else if (newUser.userType === 'patient') {
                    await api.post('/auth/signup/patient', {
                        name: newUser.userName,
                        email: newUser.email,
                        password: newUser.password,
                        phoneNumber: newUser.phoneNumber,
                        area: newUser.area
                    });
                } else {
                    const clinicData = {
                        ...newUser,
                        location: {
                            lat: newUser.lat || 13.0827,
                            lng: newUser.lng || 80.2707
                        }
                    };
                    delete clinicData.lat;
                    delete clinicData.lng;
                    await api.post('/clinics', clinicData);
                }
                alert(`${newUser.userType.toUpperCase()} created successfully!`);
            }

            setIsFormVisible(false);
            setIsEditing(false);
            setEditingUserId(null);
            setNewUser({
                userType: 'doctor',
                userName: '',
                contactName: '',
                email: '',
                password: '',
                clinicName: 'Namma Clinic Main',
                clinicRegistrationNumber: '',
                nmrNumber: '',
                nuid: '',
                employeeCode: '',
                phoneNumber: '',
                area: '',
                address: '',
                lat: 13.0827,
                lng: 80.2707
            });
            fetchData();
        } catch (error) {
            alert(`Error ${isEditing ? 'updating' : 'creating'} user: ` + (error.response?.data?.message || error.message));
        }
    };

    const handleEditUser = (user, type) => {
        setIsEditing(true);
        setEditingUserId(user._id);
        setIsFormVisible(true);

        // Pre-fill form
        setNewUser({
            userType: type,
            userName: user.name || user.userName || '', // Handle different naming conventions
            contactName: user.contactName || '',
            email: user.email || '',
            password: '', // Leave blank to keep existing
            clinicName: user.clinicName || user.companyName || '',
            clinicRegistrationNumber: user.clinicRegistrationNumber || user.companyId || '',
            nmrNumber: user.nmrNumber || '',
            nuid: user.nuid || '',
            employeeCode: user.employeeCode || '',
            phoneNumber: user.phoneNumber || '',
            area: user.area || '',
            age: user.age || '',
            address: user.address || '',
            lat: user.location?.lat || 13.0827,
            lng: user.location?.lng || 80.2707
        });
    };

    const handleDeleteUser = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            let url = `/clinics/${id}`;
            if (type === 'admin') {
                url = `/admins/${id}`;
            } else if (type === 'patient') {
                url = `/patients/${id}`;
            }
            await api.delete(url);
            alert('User deleted successfully');
            fetchData();
        } catch (error) {
            alert('Error deleting user: ' + error.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderPrescriptionForm = () => (
        <div className="modal-overlay">
            <div className="modal-content large-modal">
                <div className="modal-header">
                    <h2>Add Prescription Record</h2>
                    <button onClick={() => setIsPrescriptionFormVisible(false)} className="close-btn">×</button>
                </div>
                <form onSubmit={handleCreatePrescription} className="create-user-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Select Patient</label>
                            <select
                                required
                                value={newPrescription.patientId}
                                onChange={(e) => setNewPrescription({ ...newPrescription, patientId: e.target.value })}
                            >
                                <option value="">-- Select Patient --</option>
                                {patients.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} (ID: {p._id.slice(-6)})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Prescribing Doctor</label>
                            <select
                                required
                                value={newPrescription.doctorId}
                                onChange={(e) => setNewPrescription({ ...newPrescription, doctorId: e.target.value })}
                            >
                                <option value="">-- Select Doctor --</option>
                                {doctors.map(d => (
                                    <option key={d._id} value={d._id}>Dr. {d.userName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="medications-section">
                        <h3>Medications</h3>
                        <div className="medication-grid-header">
                            <span>Drug Name</span>
                            <span>Dosage</span>
                            <span>Frequency</span>
                            <span>Duration</span>
                            <span>Instructions</span>
                            <span></span>
                        </div>
                        {newPrescription.medications.map((med, index) => (
                            <div key={index} className="medication-entry">
                                <input
                                    required
                                    type="text"
                                    placeholder="Drug Name"
                                    value={med.drugName}
                                    onChange={(e) => handleMedicationChange(index, 'drugName', e.target.value)}
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 500mg"
                                    value={med.dosage}
                                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 1-0-1"
                                    value={med.frequency}
                                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 5 days"
                                    value={med.duration}
                                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Instructions"
                                    value={med.instructions}
                                    onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                                />
                                {newPrescription.medications.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn-remove-med"
                                        onClick={() => {
                                            const updatedMeds = newPrescription.medications.filter((_, i) => i !== index);
                                            setNewPrescription({ ...newPrescription, medications: updatedMeds });
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddMedication} className="btn-add-med">
                            + Add Another Drug
                        </button>
                    </div>

                    <button type="submit" className="btn-save">Save Record</button>
                </form>
            </div>
        </div>
    );

    const renderUserForm = () => (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEditing ? `Edit ${newUser.userType.charAt(0).toUpperCase() + newUser.userType.slice(1)}` : 'Add New Staff Member'}</h2>
                    <button onClick={() => setIsFormVisible(false)} className="close-btn">×</button>
                </div>
                <form onSubmit={handleCreateUser} className="create-user-form">
                    <div className="form-group">
                        <label>Role Type</label>
                        <select
                            value={newUser.userType}
                            onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
                        >
                            <option value="doctor">Doctor</option>
                            <option value="nurse">Nurse</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="patient">Patient</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                required
                                type="text"
                                placeholder={newUser.userType === 'patient' ? "Patient Name" : "e.g. Dr. Jane Doe"}
                                value={newUser.userName}
                                onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                            />
                        </div>
                        {newUser.userType === 'patient' && (
                            <div className="form-group">
                                <label>Area / Location</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. New York"
                                    value={newUser.area}
                                    onChange={(e) => setNewUser({ ...newUser, area: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                required
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                required
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {newUser.userType !== 'patient' && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Department / Clinic Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newUser.clinicName}
                                        onChange={(e) => setNewUser({ ...newUser, clinicName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Registration / ID</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Unique ID"
                                        value={newUser.clinicRegistrationNumber}
                                        onChange={(e) => setNewUser({
                                            ...newUser,
                                            clinicRegistrationNumber: e.target.value
                                        })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Issued Area</label>
                                <input
                                    type="text"
                                    placeholder="Issued Area"
                                    value={newUser.issuedArea}
                                    onChange={(e) => setNewUser({ ...newUser, issuedArea: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            required
                            type="tel"
                            placeholder="Phone Number"
                            value={newUser.phoneNumber}
                            onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                        />
                    </div>


                    {newUser.userType === 'doctor' && (
                        <div className="form-group">
                            <label>NMR Number</label>
                            <input
                                required
                                type="text"
                                value={newUser.nmrNumber}
                                onChange={(e) => setNewUser({ ...newUser, nmrNumber: e.target.value })}
                            />
                        </div>
                    )}
                    {newUser.userType === 'nurse' && (
                        <div className="form-group">
                            <label>NUID</label>
                            <input
                                required
                                type="text"
                                value={newUser.nuid}
                                onChange={(e) => setNewUser({ ...newUser, nuid: e.target.value })}
                            />
                        </div>
                    )}
                    {newUser.userType === 'receptionist' && (
                        <div className="form-group">
                            <label>Employee Code</label>
                            <input
                                required
                                type="text"
                                value={newUser.employeeCode}
                                onChange={(e) => setNewUser({ ...newUser, employeeCode: e.target.value })}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Age</label>
                        <input
                            type="number"
                            placeholder="Enter Age"
                            value={newUser.age}
                            onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
                        />
                    </div>

                    {(newUser.userType === 'doctor' || newUser.userType === 'nurse' || newUser.userType === 'receptionist') && (
                        <>
                            <div className="form-group">
                                <label>Clinic Address</label>
                                <input
                                    type="text"
                                    placeholder="Full Address"
                                    value={newUser.address}
                                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={newUser.lat}
                                        onChange={(e) => setNewUser({ ...newUser, lat: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={newUser.lng}
                                        onChange={(e) => setNewUser({ ...newUser, lng: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn-save">
                        {isEditing ? 'Update User' : 'Create User'}
                    </button>
                </form>
            </div>
        </div>
    );

    const renderVitalsForm = () => (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Record Patient Vitals</h2>
                    <button onClick={() => setIsVitalsFormVisible(false)} className="close-btn">×</button>
                </div>
                <form onSubmit={handleCreateVitals} className="create-user-form">
                    <div className="form-group">
                        <label>Select Patient</label>
                        <select
                            required
                            value={newVitals.patientId}
                            onChange={(e) => setNewVitals({ ...newVitals, patientId: e.target.value })}
                        >
                            <option value="">-- Select Patient --</option>
                            {patients.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>BP (mmHg)</label>
                            <input
                                required
                                type="text"
                                placeholder="120/80"
                                value={newVitals.bloodPressure}
                                onChange={(e) => setNewVitals({ ...newVitals, bloodPressure: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Pulse (bpm)</label>
                            <input
                                required
                                type="number"
                                placeholder="72"
                                value={newVitals.pulse}
                                onChange={(e) => setNewVitals({ ...newVitals, pulse: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Temp (°F)</label>
                            <input
                                required
                                type="number"
                                step="0.1"
                                placeholder="98.6"
                                value={newVitals.temperature}
                                onChange={(e) => setNewVitals({ ...newVitals, temperature: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Oxygen (%)</label>
                            <input
                                required
                                type="number"
                                placeholder="98"
                                value={newVitals.oxygenLevel}
                                onChange={(e) => setNewVitals({ ...newVitals, oxygenLevel: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Weight (kg)</label>
                            <input
                                required
                                type="number"
                                step="0.1"
                                placeholder="70"
                                value={newVitals.weight}
                                onChange={(e) => setNewVitals({ ...newVitals, weight: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Height (cm)</label>
                            <input
                                required
                                type="number"
                                placeholder="170"
                                value={newVitals.height}
                                onChange={(e) => setNewVitals({ ...newVitals, height: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={newVitals.notes}
                            onChange={(e) => setNewVitals({ ...newVitals, notes: e.target.value })}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn-save">Save Vitals</button>
                </form>
            </div>
        </div>
    );

    const renderLabTestForm = () => (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Order Lab Test</h2>
                    <button onClick={() => setIsLabTestFormVisible(false)} className="close-btn">×</button>
                </div>
                <form onSubmit={handleCreateLabTest} className="create-user-form">
                    <div className="form-group">
                        <label>Select Patient</label>
                        <select
                            required
                            value={newLabTest.patientId}
                            onChange={(e) => setNewLabTest({ ...newLabTest, patientId: e.target.value })}
                        >
                            <option value="">-- Select Patient --</option>
                            {patients.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Test Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. CBC, Lipid Profile"
                            value={newLabTest.testName}
                            onChange={(e) => setNewLabTest({ ...newLabTest, testName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Test Type</label>
                        <select
                            value={newLabTest.testType}
                            onChange={(e) => setNewLabTest({ ...newLabTest, testType: e.target.value })}
                        >
                            <option value="blood">Blood Test</option>
                            <option value="urine">Urine Test</option>
                            <option value="scan">Scan / X-Ray</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-save">Order Test</button>
                </form>
            </div>
        </div>
    );

    const sidebarLinks = [
        { id: 'home', label: 'Overview', icon: LayoutDashboard },
        { id: 'revenue', label: 'Revenue', icon: Activity },
        { id: 'admins', label: 'Admins', icon: Shield },
        { id: 'doctors', label: 'Doctors', icon: Activity },
        { id: 'nurses', label: 'Nurses', icon: Heart },
        { id: 'receptionists', label: 'Reception', icon: Users },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'upload-prescription', label: 'Upload AI Rx', icon: Upload },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'profile', label: 'Profile', icon: FileText }
    ];

    return (
        <DashboardLayout sidebarLinks={sidebarLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
                {isFormVisible && renderUserForm()}
                {isPrescriptionFormVisible && renderPrescriptionForm()}
                {isVitalsFormVisible && renderVitalsForm()}
                {isLabTestFormVisible && renderLabTestForm()}

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="home-content">
                        <DashboardGreeting user={user} role="admin" />

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard 
                                icon={FileText} 
                                number={prescriptions.length > 0 ? prescriptions.length : '1'} 
                                label="Active Records" 
                                subtextIcon={FileText} 
                                subtext={prescriptions.length > 0 ? 'Total prescriptions' : 'Sample Record'} 
                                colorClass="text-blue-500"
                            />
                            <StatCard 
                                icon={Activity} 
                                number={doctors.length + nurses.length > 0 ? doctors.length + nurses.length : '1'} 
                                label="Medical Staff" 
                                subtextIcon={Activity} 
                                subtext={doctors.length + nurses.length > 0 ? 'Doctors & Nurses' : 'Sample: Dr. Smith'} 
                                colorClass="text-emerald-500"
                            />
                            <StatCard 
                                icon={Users} 
                                number={patients.length > 0 ? patients.length : '1'} 
                                label="Total Patients" 
                                subtextIcon={Users} 
                                subtext={patients.length > 0 ? 'Registered patients' : 'Sample: Jane Doe'} 
                                colorClass="text-purple-500"
                            />
                            <StatCard 
                                icon={Shield} 
                                number={admins.length > 0 ? admins.length : '1'} 
                                label="System Admins" 
                                subtextIcon={Shield} 
                                subtext={admins.length > 0 ? 'Active admins' : 'System Root'} 
                                colorClass="text-red-500"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            <h2>Management Actions</h2>
                            <div className="action-buttons">
                                <button
                                    onClick={() => { setIsPrescriptionFormVisible(true); }}
                                    className="action-btn"
                                >
                                    📄 Add Prescription
                                </button>
                                <button
                                    onClick={() => { setIsVitalsFormVisible(true); }}
                                    className="action-btn"
                                >
                                    🩺 Add Vitals
                                </button>
                                <button
                                    onClick={() => { setIsLabTestFormVisible(true); }}
                                    className="action-btn"
                                >
                                    🔬 Order Lab Test
                                </button>
                                <button
                                    onClick={() => { setNewUser({ ...newUser, userType: 'doctor' }); setIsFormVisible(true); }}
                                    className="action-btn"
                                >
                                    👨‍⚕️ Add Doctor
                                </button>
                                <button
                                    onClick={() => { setNewUser({ ...newUser, userType: 'nurse' }); setIsFormVisible(true); }}
                                    className="action-btn"
                                >
                                    👩‍⚕️ Add Nurse
                                </button>
                                <button
                                    onClick={() => { setNewUser({ ...newUser, userType: 'receptionist' }); setIsFormVisible(true); }}
                                    className="action-btn"
                                >
                                    📝 Add Receptionist
                                </button>
                                <AssignTaskButton />
                            </div>
                        </div>
                    </div>
                )}

                {/* REVENUE TAB */}
                {activeTab === 'revenue' && (
                    <div className="content-section">
                        <AIRevenueDashboard clinicId={selectedClinicForAnalytics} />
                    </div>
                )}

                {/* PRESCRIPTIONS TAB */}
                {activeTab === 'prescriptions' && (
                    <div className="content-section">
                        <h1>Prescription Records</h1>
                        <div className="section-header">
                            <button
                                onClick={() => setIsPrescriptionFormVisible(true)}
                                className="btn-save"
                            >
                                + Add Data Entry
                            </button>
                        </div>

                        {/* Upload Section */}
                        <div className="booking-section">
                            <h2>📤 Upload & Process Scanned Prescription (AI-Powered)</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Select Patient</label>
                                    <select
                                        value={selectedPatientForPrescription}
                                        onChange={(e) => setSelectedPatientForPrescription(e.target.value)}
                                    >
                                        <option value="">-- Choose Patient --</option>
                                        {patients.map(p => (
                                            <option key={p._id} value={p._id}>{p.name} ({p.uhid || 'ID: ' + p._id.slice(-4)})</option>
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
                                        {doctors.map(d => (
                                            <option key={d._id} value={d._id}>Dr. {d.userName} ({d.clinicName})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Prescription File (Image/PDF)</label>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="file-input-minimal"
                                        onChange={(e) => setUploadFile(e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handlePrescriptionUpload}
                                className={`btn-save ${isUploading ? 'loading' : ''}`}
                                disabled={isUploading}
                            >
                                {isUploading ? 'Processing with AI...' : 'Upload & Process'}
                            </button>
                        </div>
                        <div className="users-grid">
                            {prescriptions.map(p => (
                                <div key={p._id} className="user-card rx-card">
                                    <h3>{p.patientId?.name || 'Unknown Patient'}</h3>
                                    <p className="role-badge">Rx Record</p>
                                    <p><strong>Dr:</strong> {p.doctorId?.userName || 'N/A'}</p>
                                    <p><strong>Date:</strong> {new Date(p.createdAt).toLocaleDateString()}</p>
                                    <div className="meds-summary">
                                        <small><strong>Meds:</strong> {p.medications.map(m => m.drugName).join(', ')}</small>
                                    </div>
                                    <button
                                        onClick={() => handleDeletePrescription(p._id)}
                                        className="btn-delete"
                                    >
                                        Delete Record
                                    </button>
                                </div>
                            ))}
                        </div>
                        {prescriptions.length === 0 && <p className="no-data">No prescription records found.</p>}
                    </div>
                )}

                {/* ADMINS TAB */}
                {activeTab === 'admins' && (
                    <div className="content-section">
                        <h1>Manage Admins</h1>
                        <div className="users-grid">
                            {admins.map(admin => (
                                <div key={admin._id} className="user-card group dark-border">
                                    <h3>{admin.name}</h3>
                                    <p className="role-badge static-badge">Admin</p>
                                    <p><strong>Email:</strong> {admin.email}</p>
                                    <p><strong>Company:</strong> {admin.companyName}</p>
                                    <div className="card-actions-bottom mt-4 pt-3 border-t border-slate-100">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditUser(admin, 'admin')}
                                                className="flex-1 py-2 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(admin._id, 'admin')}
                                                className="flex-1 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {admins.length === 0 && <p className="no-data">No admins found.</p>}
                    </div>
                )}

                {/* USER MANAGEMENT TABS */}
                {['doctors', 'nurses', 'receptionists'].includes(activeTab) && (
                    <div className="content-section">
                        <h1>Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>

                        <div className="users-grid">
                            {(activeTab === 'doctors' ? doctors : activeTab === 'nurses' ? nurses : receptionists).map(staff => (
                                <div key={staff._id} className="user-card group">
                                    <h3>{staff.userName}</h3>
                                    <p className="role-badge">{staff.userType}</p>
                                    <p><strong>ID:</strong> {staff.clinicRegistrationNumber}</p>
                                    <p><strong>Email:</strong> {staff.email}</p>
                                    {staff.nmrNumber && <p><strong>NMR:</strong> {staff.nmrNumber}</p>}
                                    {staff.nuid && <p><strong>NUID:</strong> {staff.nuid}</p>}

                                    <div className="mt-4 pt-3 border-t border-slate-100 transition-opacity">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedClinicForAnalytics(staff._id);
                                                    setActiveTab('revenue');
                                                    window.scrollTo(0, 0);
                                                }}
                                                className="flex-1 py-2 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                                                title="Analytics"
                                            >
                                                <TrendingUp size={14} /> Analytics
                                            </button>
                                            <button
                                                onClick={() => handleEditUser(staff, staff.userType)}
                                                className="flex-1 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(staff._id, staff.userType)}
                                                className="flex-1 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {(activeTab === 'doctors' ? doctors : activeTab === 'nurses' ? nurses : receptionists).length === 0 && (
                            <p className="no-data">No {activeTab} found.</p>
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

                {/* PRESCRIPTION MANAGEMENT TAB */}
                {activeTab === 'prescriptions' && (
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h1><Pill className="header-icon" /> Prescription Records</h1>
                            <button className="btn-add-user" onClick={() => setIsPrescriptionFormVisible(true)}>
                                + Manual Prescription
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Date</th>
                                        <th>AI Processed</th>
                                        <th>Meds</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.map((p) => (
                                        <tr key={p._id}>
                                            <td>{p.patientId?.name || 'N/A'}</td>
                                            <td>Dr. {p.doctorId?.userName || 'N/A'}</td>
                                            <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                            <td>{p.isAIProcessed ? '✅ Yes' : '❌ No'}</td>
                                            <td>{p.medications?.length || 0} drugs</td>
                                            <td className="actions-cell">
                                                <button onClick={() => handleDeletePrescription(p._id)} className="btn-icon delete" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                                {p.digitalPrescriptionPdf && (
                                                    <a href={`http://localhost:5000/${p.digitalPrescriptionPdf}`} target="_blank" rel="noreferrer" className="btn-icon view" title="View PDF">
                                                        <FileText size={16} />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'upload-prescription' && (
                    <div className="dashboard-section">
                        <h1><Upload className="header-icon" /> AI Prescription Upload</h1>
                        <AIPrescriptionUpload onUploadSuccess={() => fetchData()} />
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h1>⭐ Patient Reviews Management</h1>
                        </div>
                        
                        <div className="analytics-summary grid grid-cols-1 md:grid-cols-4 gap-4 mb-30">
                            <div className="stat-card p-20 bg-white rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-10">Total Reviews</h3>
                                <p className="text-3xl font-black text-slate-800">{reviews.length}</p>
                            </div>
                            <div className="stat-card p-20 bg-emerald-50 rounded-3xl shadow-sm border border-emerald-100">
                                <h3 className="text-emerald-800 text-xs font-bold uppercase mb-10">Positive</h3>
                                <p className="text-3xl font-black text-emerald-600">
                                    {reviews.filter(r => r.aiSentiment === 'positive').length}
                                </p>
                            </div>
                            <div className="stat-card p-20 bg-rose-50 rounded-3xl shadow-sm border border-rose-100">
                                <h3 className="text-rose-800 text-xs font-bold uppercase mb-10">Negative</h3>
                                <p className="text-3xl font-black text-rose-600">
                                    {reviews.filter(r => r.aiSentiment === 'negative').length}
                                </p>
                            </div>
                            <div className="stat-card p-20 bg-blue-50 rounded-3xl shadow-sm border border-blue-100">
                                <h3 className="text-blue-800 text-xs font-bold uppercase mb-10">Avg Rating</h3>
                                <p className="text-3xl font-black text-blue-600">
                                    {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0}
                                </p>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Clinic / Doctor</th>
                                        <th>Rating</th>
                                        <th>Comment</th>
                                        <th>AI Analysis</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <tr key={review._id}>
                                                <td className="font-bold">{review.patientId?.name}</td>
                                                <td>{review.clinicId?.clinicName} (Dr. {review.clinicId?.userName})</td>
                                                <td>
                                                    <div className="flex text-amber-400">
                                                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                                    </div>
                                                </td>
                                                <td className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={review.comment}>
                                                    {review.comment}
                                                </td>
                                                <td>
                                                    <div className="flex flex-col gap-5">
                                                        <span className={`text-[10px] font-bold uppercase px-8 py-2 rounded-full ${
                                                            review.aiSentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' : 
                                                            review.aiSentiment === 'negative' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {review.aiSentiment}
                                                        </span>
                                                        <div className="flex flex-wrap gap-5">
                                                            {review.aiKeywords?.slice(0, 2).map((k, i) => (
                                                                <span key={i} className="text-[9px] text-blue-500">#{k}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="text-center py-40">No reviews found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="profile-tab-container content-section">
                        <h1>👤 My Profile</h1>
                        <div className="profile-content-wrapper">
                            <ProfileSettings showDigitalId={false} />
                        </div>
                    </div>
                )}
                <Footer links={[
                    { label: 'Dashboard', onClick: () => setActiveTab('dashboard') },
                    { label: 'Users', onClick: () => setActiveTab('users') },
                    { label: 'Clinics', onClick: () => setActiveTab('clinics') },
                    { label: 'Doctors', onClick: () => setActiveTab('doctors') },
                    { label: 'Nurses', onClick: () => setActiveTab('nurses') },
                    { label: 'Receptionists', onClick: () => setActiveTab('receptionists') },
                    { label: 'Patients', onClick: () => setActiveTab('patients') },
                    { label: 'Appointments', onClick: () => setActiveTab('appointments') },
                    { label: 'Billing', onClick: () => setActiveTab('billing') },
                    { label: 'Vitals', onClick: () => setActiveTab('vitals') },
                    { label: 'Lab Tests', onClick: () => setActiveTab('labtests') },
                    { label: 'Reports', onClick: () => setActiveTab('reports') },
                    { label: 'Settings', onClick: () => setActiveTab('settings') }
                ]} />
        </DashboardLayout>
    );
};

export default AdminDashboard;
