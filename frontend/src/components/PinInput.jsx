import React, { useState, useRef, useEffect } from 'react';
import './PinInput.css';

const PinInput = ({ length = 4, onComplete }) => {
    const [pin, setPin] = useState(new Array(length).fill(''));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newPin = [...pin];
        newPin[index] = element.value;
        setPin(newPin);

        // Focus next input
        if (element.value !== '' && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }

        // Trigger onComplete if all fields are filled
        if (newPin.every(digit => digit !== '')) {
            onComplete(newPin.join(''));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (pin[index] === '' && index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    return (
        <div className="pin-input-container">
            {pin.map((data, index) => (
                <input
                    className="pin-field"
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    ref={el => inputRefs.current[index] = el}
                    onChange={e => handleChange(e.target, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onFocus={e => e.target.select()}
                />
            ))}
        </div>
    );
};

export default PinInput;
