import React, { useState } from 'react';
import '../components/AIHealthAssistant.css';

const RecordInsights = ({ onClose }) => {
    const [recordText, setRecordText] = useState('');
    const [insights, setInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = () => {
        if (!recordText.trim()) return;
        setIsLoading(true);
        setInsights(null);

        // Simulating AI summarization
        setTimeout(() => {
            setInsights({
                conditions: "Stable condition, minor seasonal allergies observed.",
                treatments: "Prescribed antihistamines previously.",
                status: "Good overall health; continuous monitoring advised."
            });
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="ai-health-assistant-overlay">
            <div className="ai-health-assistant-modal">
                <div className="ai-chat-header">
                    <div className="header-info">
                        <span className="bot-icon">📄</span>
                        <h3>Record Insights</h3>
                    </div>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="ai-chat-body" style={{ padding: '20px' }}>
                    <p style={{ marginBottom: '10px', color: '#555' }}>
                        Paste your medical records or doctor's notes for a summary.
                    </p>
                    <textarea 
                        value={recordText}
                        onChange={(e) => setRecordText(e.target.value)}
                        placeholder="Paste record text here..."
                        style={{ width: '100%', height: '120px', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', resize: 'none', marginBottom: '15px' }}
                    />
                    
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !recordText.trim()}
                        style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: isLoading || !recordText.trim() ? 'not-allowed' : 'pointer', opacity: isLoading || !recordText.trim() ? 0.7 : 1 }}
                    >
                        {isLoading ? 'Generating...' : 'Generate Insights'}
                    </button>

                    {insights && (
                        <div style={{ marginTop: '20px', padding: '15px', background: '#e6f4ea', borderRadius: '10px', border: '1px solid #b7e4c7' }}>
                            <h4 style={{ color: '#059669', marginBottom: '10px' }}>Summary Insights:</h4>
                            <ul style={{ paddingLeft: '20px', color: '#333' }}>
                                <li style={{ marginBottom: '8px' }}><strong>Key Conditions:</strong> {insights.conditions}</li>
                                <li style={{ marginBottom: '8px' }}><strong>Past Treatments:</strong> {insights.treatments}</li>
                                <li style={{ marginBottom: '8px' }}><strong>General Health Status:</strong> {insights.status}</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordInsights;
