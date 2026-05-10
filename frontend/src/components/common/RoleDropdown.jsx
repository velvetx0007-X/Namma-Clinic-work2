import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import './RoleDropdown.css';

const roles = [
    { id: 'patient', label: 'Patient', icon: '🩺' },
    { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
    { id: 'receptionist', label: 'Receptionist', icon: '📋' },
    { id: 'admin', label: 'Admin', icon: '🔐' },
    { id: 'clinic', label: 'Clinic', icon: '🏥', isFeature: true },
    { id: 'nurse', label: 'Nurse', icon: '💉', isFeature: true },
];

const RoleDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const selectedRole = roles.find(r => r.id === value) || roles[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Accessibility: handle keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="role-dropdown-container" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`role-dropdown-trigger ${isOpen ? 'role-dropdown-trigger--open' : ''}`}
            >
                <div className="role-dropdown-selected">
                    <span className="role-dropdown-icon">{selectedRole.icon}</span>
                    <span className="role-dropdown-text">{selectedRole.label}</span>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`role-dropdown-chevron ${isOpen ? 'role-dropdown-chevron--active' : ''}`} 
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="role-dropdown-menu"
                        role="listbox"
                    >
                        {roles.map((role) => {
                            const isSelected = value === role.id;
                            return (
                                <li
                                    key={role.id}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                        onChange(role.id);
                                        setIsOpen(false);
                                    }}
                                    className={`role-dropdown-item ${isSelected ? 'role-dropdown-item--selected' : ''}`}
                                >
                                    <div className="role-dropdown-item-content">
                                        <span className="role-dropdown-icon">{role.icon}</span>
                                        <span className="role-dropdown-label">{role.label}</span>
                                        {role.isFeature && (
                                            <span className="role-feature-badge">Feature</span>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <Check size={14} className="role-dropdown-check" />
                                    )}
                                </li>
                            );
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoleDropdown;
