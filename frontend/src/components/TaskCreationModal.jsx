import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Loader2, Calendar, Target } from 'lucide-react';
import api from '../api/axiosInstance';
import './TaskCreationModal.css';

const TaskCreationModal = ({ isOpen, onClose, onTaskCreated }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [formData, setFormData] = useState({
        assignedTo: '',
        title: '',
        description: '',
        type: 'General Message',
        priority: 'Medium',
        dueDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchPatients();
        }
    }, [isOpen]);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/patients');
            setPatients(res.data.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const handleSuggest = async () => {
        if (!formData.description) return;
        setAiLoading(true);
        try {
            const res = await api.post('/tasks/suggest', { description: formData.description });
            if (res.data.success) {
                setFormData(prev => ({
                    ...prev,
                    type: res.data.data.type || prev.type,
                    priority: res.data.data.priority || prev.priority
                }));
            }
        } catch (error) {
            console.error('AI Suggestion failed:', error);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/tasks', formData);
            if (res.data.success) {
                onTaskCreated(res.data.data);
                onClose();
                // Reset form
                setFormData({
                    assignedTo: '',
                    title: '',
                    description: '',
                    type: 'General Message',
                    priority: 'Medium',
                    dueDate: ''
                });
            }
        } catch (error) {
            alert('Error creating task: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content task-modal">
                <div className="modal-header">
                    <div className="header-title">
                        <div className="icon-circle bg-blue-100 text-blue-600">
                            <Target size={20} />
                        </div>
                        <h2>Assign New Task</h2>
                    </div>
                    <button onClick={onClose} className="close-btn"><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-group">
                        <label>Select Patient</label>
                        <select 
                            required 
                            value={formData.assignedTo} 
                            onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                        >
                            <option value="">Choose a patient...</option>
                            {patients.map(p => (
                                <option key={p._id} value={p._id}>{p.name} (UHID: {p.uhid || 'N/A'})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Task Title</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g. Daily Medication Check" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label>Description</label>
                            <button 
                                type="button" 
                                className="ai-suggest-btn" 
                                onClick={handleSuggest}
                                disabled={aiLoading || !formData.description}
                            >
                                {aiLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                AI Suggest
                            </button>
                        </div>
                        <textarea 
                            required 
                            placeholder="Describe the task instructions here..." 
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="form-row grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>Task Type</label>
                            <select 
                                value={formData.type} 
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="Medication">Medication</option>
                                <option value="Appointment">Appointment</option>
                                <option value="Lab Test">Lab Test</option>
                                <option value="General Message">General Message</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select 
                                value={formData.priority} 
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Due Date (Optional)</label>
                        <div className="input-with-icon">
                            <Calendar size={18} className="input-icon" />
                            <input 
                                type="date" 
                                value={formData.dueDate}
                                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            Assign Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskCreationModal;
