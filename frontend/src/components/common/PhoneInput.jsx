import React from 'react';
import './PhoneInput.css';

const PhoneInput = ({ label, id, value, onChange, countryCode, onCountryCodeChange, required = false }) => {
    return (
        <div className="phone-group">
            <div className="phone-input-container">
                <select 
                    className="country-dropdown" 
                    value={countryCode} 
                    onChange={onCountryCodeChange}
                >
                    <option value="+91">IN +91</option>
                    <option value="+1">US +1</option>
                    <option value="+44">UK +44</option>
                    <option value="+971">AE +971</option>
                </select>
                <input
                    type="tel"
                    id={id}
                    name={id}
                    className="phone-field"
                    placeholder=" "
                    value={value}
                    onChange={onChange}
                    required={required}
                />
                <label htmlFor={id} className="phone-label">{label}</label>
            </div>
        </div>
    );
};

export default PhoneInput;
