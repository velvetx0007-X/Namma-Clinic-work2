import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Building2, Stethoscope, Syringe, ClipboardList, ShieldCheck, Check } from 'lucide-react';
import './RoleSelector.css';

const roles = [
    {
        id: 'patient',
        label: 'Patient',
        icon: Heart,
        color: '#E53935',
        bg: '#FFEBEE',
        desc: 'Book appointments & track health'
    },
    {
        id: 'clinic',
        label: 'Clinic',
        icon: Building2,
        color: '#1E88E5',
        bg: '#E3F2FD',
        desc: 'Manage your clinic operations'
    },
    {
        id: 'doctor',
        label: 'Doctor',
        icon: Stethoscope,
        color: '#00897B',
        bg: '#E0F2F1',
        desc: 'Consultations & patient care'
    },
    {
        id: 'nurse',
        label: 'Nurse',
        icon: Syringe,
        color: '#7B1FA2',
        bg: '#F3E5F5',
        desc: 'Patient support & vitals'
    },
    {
        id: 'receptionist',
        label: 'Receptionist',
        icon: ClipboardList,
        color: '#F57C00',
        bg: '#FFF3E0',
        desc: 'Scheduling & front desk'
    },
    {
        id: 'admin',
        label: 'Admin',
        icon: ShieldCheck,
        color: '#455A64',
        bg: '#ECEFF1',
        desc: 'Full system administration'
    }
];

const RoleSelector = ({ selectedRole, onRoleChange }) => {
    return (
        <div className="role-selector">
            <p className="role-selector-label">I AM A</p>
            <div className="role-cards-grid">
                {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;

                    return (
                        <motion.button
                            key={role.id}
                            type="button"
                            className={`role-card ${isSelected ? 'role-card--selected' : ''}`}
                            style={{
                                '--role-color': role.color,
                                '--role-bg': role.bg
                            }}
                            onClick={() => onRoleChange(role.id)}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            layout
                        >
                            <div className="role-card__icon-wrap">
                                <Icon size={20} strokeWidth={2.2} />
                            </div>
                            <div className="role-card__info">
                                <span className="role-card__name">{role.label}</span>
                                <span className="role-card__desc">{role.desc}</span>
                            </div>
                            {isSelected && (
                                <motion.div
                                    className="role-card__check"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                >
                                    <Check size={12} strokeWidth={3} />
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default RoleSelector;
