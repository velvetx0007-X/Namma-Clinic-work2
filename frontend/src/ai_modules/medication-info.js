import React, { useState } from 'react';
import '../components/AIHealthAssistant.css';

const MedicationInfo = ({ onClose }) => {
    const [medicine, setMedicine] = useState('');
    const [info, setInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheck = () => {
        if (!medicine.trim()) return;
        setIsLoading(true);
        setInfo(null);

        // Simulating AI fetch
        setTimeout(() => {
            setInfo({
                dosage: "1 tablet morning and night",
                timing: "Take after food to avoid stomach upset",
                precautions: "Do not consume with alcohol",
                sideEffects: "May cause mild drowsiness or slight nausea"
            });
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="ai-health-assistant-overlay">
            <div className="ai-health-assistant-modal">
                <div className="ai-chat-header">
                    <div className="header-info">
                        <span className="bot-icon">💊</span>
                        <h3>Medication Info</h3>
                    </div>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="ai-chat-body" style={{ padding: '20px' }}>
                    <p style={{ marginBottom: '10px', color: '#555' }}>
                        Enter a medicine name to check dosage and side effects.
                    </p>
                    <input 
                        type="text"
                        value={medicine}
                        onChange={(e) => setMedicine(e.target.value)}
                        placeholder="e.g., Paracetamol, Amoxicillin..."
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', marginBottom: '15px' }}
                    />
                    
                    <button 
                        onClick={handleCheck} 
                        disabled={isLoading || !medicine.trim()}
                        style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: isLoading || !medicine.trim() ? 'not-allowed' : 'pointer', opacity: isLoading || !medicine.trim() ? 0.7 : 1 }}
                    >
                        {isLoading ? 'Checking...' : 'Check Medication'}
                    </button>

                    {info && (
                        <div style={{ marginTop: '20px', padding: '15px', background: '#e6f4ea', borderRadius: '10px', border: '1px solid #b7e4c7' }}>
                            <h4 style={{ color: '#059669', marginBottom: '10px' }}>Medication Details:</h4>
                            <div style={{ display: 'grid', gap: '10px', color: '#333' }}>
                                <div><strong>Recommended Dosage:</strong> <br/>{info.dosage}</div>
                                <div><strong>Timing:</strong> <br/>{info.timing}</div>
                                <div><strong>Precautions:</strong> <br/>{info.precautions}</div>
                                <div><strong>Possible Side Effects:</strong> <br/>{info.sideEffects}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicationInfo;
