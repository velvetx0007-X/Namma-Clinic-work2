import React from 'react';
import './FloatingLabelInput.css';

const FloatingLabelInput = ({ label, id, type = 'text', value, onChange, required = false, placeholder = " ", ...props }) => {
    return (
        <div className="floating-group">
            <input
                type={type}
                id={id}
                name={id}
                className="floating-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                {...props}
            />
            <label htmlFor={id} className="floating-label">{label}</label>
        </div>
    );
};

export default FloatingLabelInput;
