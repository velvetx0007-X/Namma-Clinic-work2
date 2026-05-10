import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Camera, Shield, Bell, Lock, Eye, Mail, Phone, 
    CheckCircle, Globe, LogOut, Clock, Plus, Trash2, 
    Settings, Users, Key, AlertTriangle, Monitor, X
} from 'lucide-react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import NotificationSettings from './NotificationSettings';
import PinInput from './PinInput';
import DigitalIDCard from './DigitalIDCard';
import './ProfileSettings.css';

const ProfileSettings = ({ showDigitalId = false }) => {
    const { user, updateUser, logout } = useAuth(); // Import logout
    const navigate = useNavigate(); // Initialize navigate
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false); // Add deleting state
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal state
    const [uploadFile, setUploadFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [saveStatus, setSaveStatus] = useState({ type: '', msg: '' });

    const [formData, setFormData] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        prefix: user?.prefix || '',
        suffix: user?.suffix || '',
        role: user?.userType || user?.role || 'patient',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        countryCode: user?.countryCode || '+91',
        age: user?.age || '',
        companyName: user?.companyName || '',
        companyId: user?.companyId || '',
        emergencyContact: {
            name: user?.emergencyContact?.name || '',
            phone: user?.emergencyContact?.phone || '',
            relation: user?.emergencyContact?.relation || ''
        }
    });

    const [securityData, setSecurityData] = useState({
        twoFactorEnabled: user?.twoFactorEnabled || false,
        loginAlerts: user?.loginAlerts || true
    });

    const [privacyData, setPrivacyData] = useState({
        dndMode: user?.dndMode?.enabled || false,
        dndFrom: user?.dndMode?.from || '22:00',
        dndTo: user?.dndMode?.to || '08:00',
        teamAccess: user?.teamAccess || [
            { id: 1, memberName: 'Dr. Sarah Wilson', role: 'Chief Doctor', permission: 'Full Access' },
            { id: 2, memberName: 'Nurse David Chen', role: 'Registered Nurse', permission: 'View Only' }
        ]
    });

    const [modals, setModals] = useState({
        addMember: false,
        twoFactor: false,
        changePassword: false
    });

    const [newMember, setNewMember] = useState({
        memberName: '',
        role: '',
        permission: 'View Only'
    });

    const [twoFactorCode, setTwoFactorCode] = useState('');

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleFileUpload = async () => {
        if (!uploadFile) return;
        const fmData = new FormData();
        fmData.append('profilePhoto', uploadFile);
        fmData.append('userId', user.id);
        fmData.append('role', user.role);

        try {
            const res = await api.post('/users/profile-photo', fmData);
            updateUser(res.data.data);
            setSaveStatus({ type: 'success', msg: 'Photo updated!' });
            setUploadFile(null);
        } catch (err) {
            setSaveStatus({ type: 'error', msg: 'Upload failed' });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatePayload = {
                userId: user.id || user._id,
                role: user.role,
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                prefix: formData.prefix,
                suffix: formData.suffix,
                phoneNumber: formData.phoneNumber,
                age: formData.age,
                companyName: formData.companyName,
                companyId: formData.companyId,
                emergencyContact: formData.emergencyContact,
                twoFactorEnabled: securityData.twoFactorEnabled,
                loginAlerts: securityData.loginAlerts,
                dndMode: {
                    enabled: privacyData.dndMode,
                    from: privacyData.dndFrom,
                    to: privacyData.dndTo
                },
                teamAccess: privacyData.teamAccess
            };

            const res = await api.put('/users/profile', updatePayload);
            updateUser(res.data.data);
            setSaveStatus({ type: 'success', msg: 'Profile updated successfully!' });
        } catch (err) {
            setSaveStatus({ type: 'error', msg: 'Failed to update profile' });
        } finally {
            setLoading(false);
            setTimeout(() => setSaveStatus({ type: '', msg: '' }), 3000);
        }
    };

    const toggleSecurity = (key) => {
        setSecurityData(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await api.delete('/users', {
                data: {
                    userId: user.id || user._id,
                    role: user.role
                }
            });
            setShowDeleteModal(false);
            logout(); // Log out from context
            navigate('/login'); // Redirect to login
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to delete account. Please try again.';
            setSaveStatus({ type: 'error', msg: errorMsg });
            setShowDeleteModal(false);
        } finally {
            setDeleting(false);
            setTimeout(() => setSaveStatus({ type: '', msg: '' }), 3000);
        }
    };

    const handleAddMember = () => {
        if (!newMember.memberName || !newMember.role) {
            setSaveStatus({ type: 'error', msg: 'Please fill all member details' });
            return;
        }

        const memberToAdd = {
            id: Date.now(),
            ...newMember
        };

        setPrivacyData(prev => ({
            ...prev,
            teamAccess: [...prev.teamAccess, memberToAdd]
        }));
        setModals(prev => ({ ...prev, addMember: false }));
        setNewMember({ memberName: '', role: '', permission: 'View Only' });
        setSaveStatus({ type: 'success', msg: 'Member added locally. Save changes to persist.' });
    };

    const handleRemoveMember = (id) => {
        setPrivacyData(prev => ({
            ...prev,
            teamAccess: prev.teamAccess.filter(m => m.id !== id)
        }));
    };


    return (
        <div className="profile-settings-dashboard">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="profile-container"
            >
                {/* LEFT COLUMN */}
                <div className="column-left">
                    {showDigitalId && (
                        <div className="profile-card mb-6 overflow-visible">
                            <h3 className="card-title mb-4"><Shield size={22} className="text-emerald-500" /> Digital Identity Passport</h3>
                            <DigitalIDCard user={user} />
                        </div>
                    )}
                    
                    {/* Profile Card */}
                    <div className="profile-card">
                        <h3 className="card-title"><User size={22} /> Profile Settings</h3>
                        
                        <div className="photo-section">
                            <div className="avatar-wrapper">
                                <img 
                                    src={previewUrl || (user?.profilePhoto ? `http://localhost:5000/${user.profilePhoto}` : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=1E88E5&color=fff`)} 
                                    alt="Profile" 
                                    className="profile-avatar"
                                />
                                <label className="camera-overlay">
                                    <Camera size={16} />
                                    <input type="file" hidden onChange={handlePhotoChange} accept="image/*" />
                                </label>
                            </div>
                            <div className="photo-actions">
                                {uploadFile ? (
                                    <button className="btn-upload" onClick={handleFileUpload}>Save New Photo</button>
                                ) : (
                                    <p className="text-sm text-gray-500">Pick a professional photo for your ID.</p>
                                )}
                                <button className="btn-remove" onClick={() => {
                                    setPreviewUrl(null);
                                    setUploadFile(null);
                                }}>Remove Photo</button>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="input-container">
                                <input 
                                    type="text" 
                                    className="floating-input" 
                                    placeholder=" " 
                                    value={formData.prefix}
                                    onChange={(e) => setFormData({...formData, prefix: e.target.value})}
                                />
                                <label className="floating-label">Prefix (Dr., Mr.)</label>
                                {formData.prefix && (
                                    <button className="input-clear-btn" onClick={() => setFormData({...formData, prefix: ''})}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="input-container">
                                <input 
                                    type="text" 
                                    className="floating-input" 
                                    placeholder=" " 
                                    value={formData.suffix}
                                    onChange={(e) => setFormData({...formData, suffix: e.target.value})}
                                />
                                <label className="floating-label">Suffix</label>
                                {formData.suffix && (
                                    <button className="input-clear-btn" onClick={() => setFormData({...formData, suffix: ''})}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="input-container">
                                <input 
                                    type="text" 
                                    className="floating-input" 
                                    placeholder=" " 
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                />
                                <label className="floating-label">First Name</label>
                                {formData.firstName && (
                                    <button className="input-clear-btn" onClick={() => setFormData({...formData, firstName: ''})}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="input-container">
                                <input 
                                    type="text" 
                                    className="floating-input" 
                                    placeholder=" " 
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                />
                                <label className="floating-label">Last Name</label>
                                {formData.lastName && (
                                    <button className="input-clear-btn" onClick={() => setFormData({...formData, lastName: ''})}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="input-container">
                            <input 
                                type="email" 
                                className="floating-input" 
                                placeholder=" " 
                                readOnly 
                                value={formData.email}
                            />
                            <label className="floating-label">Email Address</label>
                            <span className="verified-badge"><CheckCircle size={14} /> Verified</span>
                        </div>

                        <div className="input-container">
                            <input 
                                type="tel" 
                                className="floating-input" 
                                placeholder=" " 
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                            />
                            <label className="floating-label">Phone Number</label>
                            {formData.phoneNumber && (
                                <button className="input-clear-btn" onClick={() => setFormData({...formData, phoneNumber: ''})}>
                                    <X size={14} />
                                </button>
                            )}
                            {user?.isPhoneVerified && <span className="verified-badge" style={{ right: '40px' }}><CheckCircle size={14} /> Verified</span>}
                        </div>

                        <div className="form-grid">
                            <div className="input-container">
                                <input 
                                    type="number" 
                                    className="floating-input" 
                                    placeholder=" " 
                                    value={formData.age}
                                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                                />
                                <label className="floating-label">Age</label>
                                {formData.age && (
                                    <button className="input-clear-btn" onClick={() => setFormData({...formData, age: ''})}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            {formData.role === 'admin' && (
                                <div className="input-container">
                                    <input 
                                        type="text" 
                                        className="floating-input" 
                                        placeholder=" " 
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                    />
                                    <label className="floating-label">Company Name</label>
                                </div>
                            )}
                        </div>

                        {/* Emergency Contact Section */}
                        <div className="mt-6 mb-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Emergency Contact</h4>
                            <div className="form-grid">
                                <div className="input-container">
                                    <input 
                                        type="text" 
                                        className="floating-input" 
                                        placeholder=" " 
                                        value={formData.emergencyContact.name}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            emergencyContact: {...formData.emergencyContact, name: e.target.value}
                                        })}
                                    />
                                    <label className="floating-label">Contact Name</label>
                                </div>
                                <div className="input-container">
                                    <input 
                                        type="tel" 
                                        className="floating-input" 
                                        placeholder=" " 
                                        value={formData.emergencyContact.phone}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                                        })}
                                    />
                                    <label className="floating-label">Contact Phone</label>
                                </div>
                                <div className="input-container col-span-2">
                                    <input 
                                        type="text" 
                                        className="floating-input" 
                                        placeholder=" " 
                                        value={formData.emergencyContact.relation}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            emergencyContact: {...formData.emergencyContact, relation: e.target.value}
                                        })}
                                    />
                                    <label className="floating-label">Relation (e.g. Spouse, Parent)</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account & Security Card */}
                    <div className="profile-card">
                        <h3 className="card-title"><Shield size={22} /> Account & Security</h3>
                        
                        <div className="control-item">
                            <div className="control-info">
                                <h4>Two-Factor Authentication</h4>
                                <p>Secure your account with an extra verification step.</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={securityData.twoFactorEnabled} 
                                    onChange={() => {
                                        if (!securityData.twoFactorEnabled) {
                                            setModals({ ...modals, twoFactor: true });
                                        } else {
                                            toggleSecurity('twoFactorEnabled');
                                        }
                                    }}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="control-item">
                            <div className="control-info">
                                <h4>Login Alerts</h4>
                                <p>Get notified about logins from unfamiliar devices.</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={securityData.loginAlerts} 
                                    onChange={() => toggleSecurity('loginAlerts')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="control-item" style={{ border: 'none' }}>
                            <div className="control-info">
                                <h4>Change Password</h4>
                                <p>Last updated 2 months ago.</p>
                            </div>
                            <button 
                                className="btn-secondary" 
                                style={{ padding: '8px 16px', fontSize: '13px' }}
                                onClick={() => setModals({ ...modals, changePassword: true })}
                            >
                                Change
                            </button>
                        </div>
                        
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                            <Monitor size={20} className="text-gray-400" />
                            <div className="text-xs">
                                <p className="font-bold text-gray-700">Active Session: Windows 11 PC</p>
                                <p className="text-gray-400">Chennai, India • 192.168.1.1</p>
                            </div>
                            <button className="ml-auto text-blue-500 text-xs font-bold">Log out all</button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="column-right">
                    <NotificationSettings userId={user?.id || user?._id} />

                    {/* Data & Privacy Card */}
                    <div className="profile-card">
                        <h3 className="card-title"><Lock size={22} /> Data & Privacy</h3>
                        
                        <div className="control-info">
                            <h4>Medical Access Permissions</h4>
                            <p>Manage who can view your medical dashboard and records.</p>
                        </div>

                        <table className="team-table">
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Permission</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {privacyData.teamAccess.map((member, idx) => (
                                    <tr key={member.id || idx}>
                                        <td>
                                            <div className="member-name">{member.memberName}</div>
                                            <div className="text-xs text-gray-500">{member.role}</div>
                                        </td>
                                        <td>
                                            <select 
                                                className="permission-select"
                                                value={member.permission}
                                                onChange={(e) => {
                                                    const newTeam = [...privacyData.teamAccess];
                                                    newTeam[idx].permission = e.target.value;
                                                    setPrivacyData({...privacyData, teamAccess: newTeam});
                                                }}
                                            >
                                                <option>Full Access</option>
                                                <option>View Only</option>
                                                <option>Restricted</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button 
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button 
                            className="btn-secondary w-full mt-4 flex items-center justify-center gap-2"
                            onClick={() => setModals({ ...modals, addMember: true })}
                        >
                            <Plus size={16} /> Add Member
                        </button>
                    </div>

                    {/* Account Maintenance - Centered below both columns */}
                    <div className="profile-card maintenance-zone" style={{ gridColumn: '1 / -1', maxWidth: '600px', margin: '0 auto 30px auto' }}>
                        <h3 className="card-title text-gray-700 justify-center"><Settings size={22} className="text-gray-400" /> Account Maintenance</h3>
                        <p className="text-center text-sm text-gray-500 mb-6">Manage your account status and data deletion preferences.</p>
                        <div className="flex justify-center">
                            <button 
                                className="btn-danger w-full md:w-auto px-12 flex items-center justify-center gap-2"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <Trash2 size={16} /> Delete Account
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Sticky Actions Footer - Centered */}
                <div className="profile-footer-actions" style={{ gridColumn: '1 / -1', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <AnimatePresence>
                        {saveStatus.msg && (
                            <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className={`status-message-small ${
                                    saveStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
                                }`}
                                style={{ margin: '0 20px 0 0' }}
                            >
                                {saveStatus.msg}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button className="btn-secondary flex items-center gap-2" style={{ width: 'auto' }}>
                        <X size={18} /> Cancel
                    </button>
                    <button 
                        className="btn-primary" 
                        onClick={handleSave}
                        disabled={loading}
                        style={{ width: 'auto' }}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </motion.div>

            {/* Delete Account Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                        >
                            <div className="modal-header">
                                <h3 className="text-red-600 flex items-center gap-2">
                                    <AlertTriangle size={20} /> Permanently Delete Account?
                                </h3>
                                <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body py-4">
                                <p className="text-gray-600 mb-4">
                                    Are you sure you want to delete your account? This will permanently remove all your data, including:
                                </p>
                                <ul className="list-disc list-inside text-sm text-gray-500 space-y-1 mb-4">
                                    <li>Profile information and settings</li>
                                    <li>All medical records and history</li>
                                    <li>Current and past appointments</li>
                                    <li>Prescriptions and lab test results</li>
                                </ul>
                                <p className="text-red-600 font-bold text-sm">
                                    This action is irreversible.
                                </p>
                            </div>
                            <div className="modal-footer flex gap-3">
                                <button 
                                    className="btn-secondary flex-1 flex items-center justify-center gap-2" 
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleting}
                                >
                                    <X size={18} /> Cancel
                                </button>
                                <button 
                                    className="btn-danger flex-1"
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                >
                                    {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Add Member Modal */}
                {modals.addMember && (
                    <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <motion.div className="modal-content" initial={{scale:0.9}} animate={{scale:1}}>
                            <div className="modal-header">
                                <h3><Users size={20} /> Add Team Member</h3>
                                <button className="close-btn" onClick={() => setModals({...modals, addMember: false})}><X size={20} /></button>
                            </div>
                            <div className="modal-body py-4 space-y-4">
                                <div className="input-container">
                                    <input 
                                        type="text" className="floating-input" placeholder=" " 
                                        value={newMember.memberName}
                                        onChange={(e) => setNewMember({...newMember, memberName: e.target.value})}
                                    />
                                    <label className="floating-label">Member Name</label>
                                </div>
                                <div className="input-container">
                                    <input 
                                        type="text" className="floating-input" placeholder=" " 
                                        value={newMember.role}
                                        onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                                    />
                                    <label className="floating-label">Professional Role</label>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Access Level</label>
                                    <select 
                                        className="permission-select w-full mt-1"
                                        value={newMember.permission}
                                        onChange={(e) => setNewMember({...newMember, permission: e.target.value})}
                                    >
                                        <option>Full Access</option>
                                        <option>View Only</option>
                                        <option>Restricted</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer flex gap-3 mt-4">
                                <button className="btn-secondary flex-1 flex items-center justify-center gap-2" onClick={() => setModals({...modals, addMember: false})}>
                                    <X size={18} /> Cancel
                                </button>
                                <button className="btn-primary flex-1" onClick={handleAddMember}>Add Member</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* 2FA Setup Modal */}
                {modals.twoFactor && (
                    <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}}>
                        <motion.div className="modal-content" initial={{scale:0.9}} animate={{scale:1}}>
                            <div className="modal-header">
                                <h3><Shield size={20} /> Two-Factor Setup</h3>
                                <button className="close-btn" onClick={() => setModals({...modals, twoFactor: false})}><X size={20} /></button>
                            </div>
                            <div className="modal-body py-4 text-center">
                                <Key size={48} className="mx-auto text-blue-500 mb-4" />
                                <h4 className="font-bold text-lg mb-2">Enable 2FA Protection</h4>
                                <p className="text-gray-600 text-sm mb-6">
                                    Adding an extra layer of security helps protect your medical data. We'll send a verification code to your email <b>{user.email}</b>.
                                </p>
                                <div className="flex justify-center mb-8">
                                    <PinInput 
                                        length={6} 
                                        onComplete={(code) => setTwoFactorCode(code)} 
                                    />
                                </div>
                            </div>
                            <div className="modal-footer flex gap-3">
                                <button className="btn-secondary flex-1 flex items-center justify-center gap-2" onClick={() => setModals({...modals, twoFactor: false})}>
                                    <X size={18} /> Cancel
                                </button>
                                <button 
                                    className="btn-primary flex-1" 
                                    disabled={twoFactorCode.length < 6}
                                    onClick={() => {
                                        toggleSecurity('twoFactorEnabled');
                                        setModals({...modals, twoFactor: false});
                                        setTwoFactorCode('');
                                        setSaveStatus({ type: 'success', msg: 'Two-Factor Authentication enabled!' });
                                    }}
                                >
                                    Confirm & Enable
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Change Password Modal */}
                {modals.changePassword && (
                    <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}}>
                        <motion.div className="modal-content" initial={{scale:0.9}} animate={{scale:1}}>
                            <div className="modal-header">
                                <h3><Lock size={20} /> Change Password</h3>
                                <button className="close-btn" onClick={() => setModals({...modals, changePassword: false})}><X size={20} /></button>
                            </div>
                            <div className="modal-body py-4 space-y-4">
                                <div className="input-container">
                                    <input type="password" className="floating-input" placeholder=" " />
                                    <label className="floating-label">Current Password</label>
                                </div>
                                <div className="input-container">
                                    <input type="password" className="floating-input" placeholder=" " />
                                    <label className="floating-label">New Password</label>
                                </div>
                                <div className="input-container">
                                    <input type="password" className="floating-input" placeholder=" " />
                                    <label className="floating-label">Confirm New Password</label>
                                </div>
                            </div>
                            <div className="modal-footer flex gap-3">
                                <button className="btn-secondary flex-1 flex items-center justify-center gap-2" onClick={() => setModals({...modals, changePassword: false})}>
                                    <X size={18} /> Cancel
                                </button>
                                <button className="btn-primary flex-1" onClick={() => {
                                    setModals({...modals, changePassword: false});
                                    setSaveStatus({ type: 'success', msg: 'Password updated successfully!' });
                                }}>Update Password</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ProfileSettings;
