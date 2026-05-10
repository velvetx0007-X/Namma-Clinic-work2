import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import AIPrescriptionUpload from '../components/AIPrescriptionUpload';
import PatientHistory from '../components/PatientHistory';
import Footer from '../components/Footer';
import ProfileSettings from '../components/ProfileSettings';
import { Upload, Users, User, Settings, Star, X } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import DashboardGreeting from '../components/common/DashboardGreeting';
import './AdminDashboard.css'; // Reusing AdminDashboard styles for consistency

const ClinicAdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('staff');
    const [staff, setStaff] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [error, setError] = useState('');

    // Form state for adding new staff
    const [newStaff, setNewStaff] = useState({
        userType: 'doctor',
        userName: '',
        contactName: '',
        email: '',
        password: '',
        pin: '',
        nmrNumber: '',
        nuid: '',
        employeeCode: '',
        phoneNumber: '',
        address: ''
    });
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        fetchClinicStaff();
        if (activeTab === 'reviews') {
            fetchClinicReviews();
        }
    }, [user, activeTab]);

    const fetchClinicReviews = async () => {
        try {
            setLoadingReviews(true);
            const res = await api.get(`/reviews/clinic/${user.id}`);
            setReviews(res.data.data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const fetchClinicStaff = async () => {
        try {
            setLoading(true);
            // Assuming user.clinicRegistrationNumber is available in the user object for Clinic Admins
            // If not, we might need to fetch it or rely on the backend to know which clinic based on the user ID
            // But based on the signup flow, it should be there.
            const registrationNumber = user.clinicRegistrationNumber || user.companyId;

            if (!registrationNumber) {
                setError("Clinic Registration Number not found for this admin.");
                setLoading(false);
                return;
            }

            const response = await api.get(`/clinics/staff/${registrationNumber}`);
            if (response.data.success) {
                setStaff(response.data.data);
            } else {
                setError('Failed to fetch staff.');
            }
        } catch (err) {
            console.error('Error fetching staff:', err);
            setError('Error loading staff data.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            const staffData = {
                ...newStaff,
                clinicName: user.clinicName, // Inherit from admin
                clinicRegistrationNumber: user.clinicRegistrationNumber, // Inherit
                location: user.location // Inherit location roughly
            };

            await api.post('/clinics', staffData);
            alert(`${newStaff.userType.toUpperCase()} created successfully!`);
            setIsFormVisible(false);
            setNewStaff({
                userType: 'doctor',
                userName: '',
                contactName: '',
                email: '',
                password: '',
                pin: '',
                nmrNumber: '',
                nuid: '',
                employeeCode: '',
                phoneNumber: '',
                address: ''
            });
            fetchClinicStaff();
        } catch (error) {
            alert('Error creating staff: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteStaff = async (id) => {
        if (!window.confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await api.delete(`/clinics/${id}`);
            alert('Staff member removed successfully');
            fetchClinicStaff();
        } catch (error) {
            alert('Error deleting staff: ' + error.message);
        }
    };



    const sidebarLinks = [
        { id: 'staff', label: 'Staff Management', icon: Users },
        { id: 'patients', label: 'Patient Records', icon: User },
        { id: 'upload-prescription', label: 'Upload AI Rx', icon: Upload },
        { id: 'reviews', label: 'Reviews & AI Analytics', icon: Star },
        { id: 'profile', label: 'Clinic Profile', icon: Settings }
    ];

    return (
        <DashboardLayout sidebarLinks={sidebarLinks} activeTab={activeTab} setActiveTab={setActiveTab}>
                {activeTab === 'staff' && (
                    <div className="dashboard-section">
                        <DashboardGreeting user={user} role="admin" />
                        <div className="section-header">
                            <h1>Manage Clinic Staff</h1>
                            <button className="btn-add-user" onClick={() => setIsFormVisible(true)}>
                                + Add New Staff
                            </button>
                        </div>

                        {loading ? (
                            <p>Loading staff...</p>
                        ) : error ? (
                            <p className="error-text">{error}</p>
                        ) : (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Details</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staff.length > 0 ? (
                                            staff.map((member) => (
                                                <tr key={member._id}>
                                                    <td>{member.userName}</td>
                                                    <td>
                                                        <span className={`role-badge role-${member.userType}`}>
                                                            {member.userType.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>{member.email}</td>
                                                    <td>{member.phoneNumber || 'N/A'}</td>
                                                    <td>
                                                        {member.userType === 'doctor' && `NMR: ${member.nmrNumber}`}
                                                        {member.userType === 'nurse' && `NUID: ${member.nuid}`}
                                                        {member.userType === 'receptionist' && `ID: ${member.employeeCode}`}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => handleDeleteStaff(member._id)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="no-data">No staff members found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'patients' && (
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h1><Users className="header-icon" /> Manage Patient Records</h1>
                        </div>
                        <PatientHistory />
                    </div>
                )}

                {activeTab === 'upload-prescription' && (
                    <div className="dashboard-section">
                        <h1><Upload className="header-icon" /> AI Prescription Upload</h1>
                        <AIPrescriptionUpload />
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h1>⭐ Patient Reviews & AI Insights</h1>
                        </div>

                        {loadingReviews ? (
                            <p>Loading analytics...</p>
                        ) : (
                            <div className="reviews-analytics-container">
                                <div className="analytics-summary grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="stat-card p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                                        <h3 className="text-emerald-800 font-bold mb-2">Total Reviews</h3>
                                        <p className="text-4xl font-black text-emerald-600">{reviews.length}</p>
                                    </div>
                                    <div className="stat-card p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                        <h3 className="text-blue-800 font-bold mb-2">Avg Rating</h3>
                                        <p className="text-4xl font-black text-blue-600">
                                            {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="stat-card p-6 bg-amber-50 rounded-3xl border border-amber-100">
                                        <h3 className="text-amber-800 font-bold mb-2">Sentiment Score</h3>
                                        <p className="text-4xl font-black text-amber-600">
                                            {reviews.length > 0 ? Math.round((reviews.filter(r => r.aiSentiment === 'positive').length / reviews.length) * 100) : 0}% Positive
                                        </p>
                                    </div>
                                </div>

                                <div className="reviews-list space-y-4">
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review._id} className="review-item p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                                                            {review.patientId?.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800">{review.patientId?.name}</h4>
                                                            <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex text-amber-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 mb-4">{review.comment}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        review.aiSentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' : 
                                                        review.aiSentiment === 'negative' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        AI Sentiment: {review.aiSentiment}
                                                    </span>
                                                    {review.aiKeywords?.map((kw, i) => (
                                                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-medium border border-blue-100">
                                                            #{kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                            <p className="text-slate-400">No reviews yet for your clinic.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <ProfileSettings />
                )}

                {/* Add Staff Modal */}
            {isFormVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New Staff Member</h2>
                            <button onClick={() => setIsFormVisible(false)} className="close-btn"><X /></button>
                        </div>
                        <form onSubmit={handleCreateStaff} className="create-user-form">
                            <div className="form-group">
                                <label>Role Type</label>
                                <select
                                    value={newStaff.userType}
                                    onChange={(e) => setNewStaff({ ...newStaff, userType: e.target.value })}
                                >
                                    <option value="doctor">Doctor</option>
                                    <option value="nurse">Nurse</option>
                                    <option value="receptionist">Receptionist</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Staff Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Dr. Jane Doe"
                                        value={newStaff.userName}
                                        onChange={(e) => setNewStaff({ ...newStaff, userName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact Person</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Primary Contact"
                                        value={newStaff.contactName}
                                        onChange={(e) => setNewStaff({ ...newStaff, contactName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={newStaff.email}
                                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        required
                                        type="password"
                                        value={newStaff.password}
                                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Set 4-Digit PIN</label>
                                <input
                                    required
                                    type="text"
                                    pattern="\d{4}"
                                    maxLength="4"
                                    placeholder="Enter 4-digit PIN"
                                    value={newStaff.pin}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^\d{0,4}$/.test(val)) {
                                            setNewStaff({ ...newStaff, pin: val });
                                        }
                                    }}
                                />
                            </div>

                            {newStaff.userType === 'doctor' && (
                                <div className="form-group">
                                    <label>NMR Number</label>
                                    <input
                                        required
                                        type="text"
                                        value={newStaff.nmrNumber}
                                        onChange={(e) => setNewStaff({ ...newStaff, nmrNumber: e.target.value })}
                                    />
                                </div>
                            )}
                            {newStaff.userType === 'nurse' && (
                                <div className="form-group">
                                    <label>NUID</label>
                                    <input
                                        required
                                        type="text"
                                        value={newStaff.nuid}
                                        onChange={(e) => setNewStaff({ ...newStaff, nuid: e.target.value })}
                                    />
                                </div>
                            )}
                            {newStaff.userType === 'receptionist' && (
                                <div className="form-group">
                                    <label>Employee Code</label>
                                    <input
                                        required
                                        type="text"
                                        value={newStaff.employeeCode}
                                        onChange={(e) => setNewStaff({ ...newStaff, employeeCode: e.target.value })}
                                    />
                                </div>
                            )}

                            <button type="submit" className="btn-save">Create Staff Member</button>
                        </form>
                    </div>
                </div>
            )}
            <Footer />
        </DashboardLayout>
    );
};

export default ClinicAdminDashboard;
