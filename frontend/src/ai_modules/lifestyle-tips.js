import React, { useState } from 'react';
import '../components/AIHealthAssistant.css';

const LifestyleTips = ({ onClose }) => {
    const [tips, setTips] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGetTips = () => {
        setIsLoading(true);
        setTips(null);

        // Simulating AI generation
        setTimeout(() => {
            setTips([
                "Healthy Food: Include more leafy greens and protein in your diet.",
                "Hydration: Drink at least 8 glasses (2 liters) of water daily.",
                "Exercise/Yoga: Try 15 minutes of morning yoga or a 30-minute brisk walk.",
                "Sleep: Aim for 7-8 hours of uninterrupted sleep each night."
            ]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="ai-health-assistant-overlay">
            <div className="ai-health-assistant-modal">
                <div className="ai-chat-header">
                    <div className="header-info">
                        <span className="bot-icon">⚡</span>
                        <h3>Lifestyle Tips</h3>
                    </div>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="ai-chat-body" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '30px', marginTop: '20px' }}>
                        <span style={{ fontSize: '3rem' }}>🧘‍♂️🍏💧</span>
                        <p style={{ marginTop: '15px', color: '#555', fontSize: '1.1rem' }}>
                            Get your daily personalized health and wellness advice.
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleGetTips} 
                        disabled={isLoading}
                        style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, marginBottom: '20px' }}
                    >
                        {isLoading ? 'Generating Tips...' : 'Get Daily Tips'}
                    </button>

                    {tips && (
                        <div style={{ textAlign: 'left', background: '#e6f4ea', padding: '15px', borderRadius: '10px', border: '1px solid #b7e4c7' }}>
                            <h4 style={{ color: '#059669', marginBottom: '10px' }}>Your Daily Tips:</h4>
                            <ul style={{ paddingLeft: '20px', margin: 0, color: '#333' }}>
                                {tips.map((tip, index) => (
                                    <li key={index} style={{ marginBottom: '10px', lineHeight: '1.4' }}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LifestyleTips;
