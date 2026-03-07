import React, { useState } from 'react';
import '../components/AIHealthAssistant.css';

const SymptomChecker = ({ onClose }) => {
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = () => {
        if (!symptoms.trim()) return;
        setIsLoading(true);
        setResult(null);

        // Simulating AI analysis
        setTimeout(() => {
            setResult({
                suggestions: [
                    "Drink more water to stay hydrated.",
                    "Eat nutritious food to boost your immune system.",
                    "Get enough rest to help your body heal.",
                    "Consider seeing a doctor if symptoms persist."
                ]
            });
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="ai-health-assistant-overlay">
            <div className="ai-health-assistant-modal">
                <div className="ai-chat-header">
                    <div className="header-info">
                        <span className="bot-icon">🤖</span>
                        <h3>Symptom Checker</h3>
                    </div>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="ai-chat-body" style={{ padding: '20px' }}>
                    <p style={{ marginBottom: '10px', color: '#555' }}>
                        Enter your symptoms to get basic health suggestions.
                    </p>
                    <textarea 
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="e.g., headache, fever, tired..."
                        style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', resize: 'none', marginBottom: '15px' }}
                    />
                    
                    <button 
                        onClick={handleAnalyze} 
                        disabled={isLoading || !symptoms.trim()}
                        style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: isLoading || !symptoms.trim() ? 'not-allowed' : 'pointer', opacity: isLoading || !symptoms.trim() ? 0.7 : 1 }}
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Symptoms'}
                    </button>

                    {result && (
                        <div style={{ marginTop: '20px', padding: '15px', background: '#e6f4ea', borderRadius: '10px', border: '1px solid #b7e4c7' }}>
                            <h4 style={{ color: '#059669', marginBottom: '10px' }}>Health Suggestions:</h4>
                            <ul style={{ paddingLeft: '20px', color: '#333' }}>
                                {result.suggestions.map((suggestion, index) => (
                                    <li key={index} style={{ marginBottom: '8px' }}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SymptomChecker;
