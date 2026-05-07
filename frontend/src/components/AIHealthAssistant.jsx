import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './AIHealthAssistant.css';

const AIHealthAssistant = ({ onClose }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: 'Hello! I am your AI Health Assistant. How can I help you today? I can guide you on food, exercise, warmup, and yoga.'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const { user, updateUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/ai-health/chat', {
                message: input,
                context: "Patient asking for general health advice"
            });

            const aiMessage = { role: 'assistant', text: response.data.reply };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = { role: 'assistant', text: 'Sorry, I encountered an error. Please try again later.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Helper to format AI response (simple markdown to HTML)
    const formatText = (text) => {
        if (!text) return '';
        // Basic formatting for bullet points and bold text
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\n\n/g, '<br/><br/>'); // Paragraphs
        formatted = formatted.replace(/\n- /g, '<br/>• '); // Bullet points
        formatted = formatted.replace(/\n/g, '<br/>'); // Line breaks
        return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
    };

    const handleEnableMonitoring = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/subscriptions/toggle-ai', { 
                userId: user._id, 
                enabled: true 
            });
            updateUser({ ...user, aiMonitoringEnabled: true });
        } catch (error) {
            console.error('Error enabling AI monitoring:', error);
            alert('Failed to enable AI monitoring. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpgrade = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/subscriptions/upgrade', { userId: user._id });
            updateUser({ ...user, subscriptionStatus: 'premium' });
            alert('🎉 You are now a Premium Member! You can now enable Full AI Health Monitoring.');
        } catch (error) {
            console.error('Error upgrading:', error);
            alert('Failed to upgrade subscription.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="ai-health-assistant-overlay">
            <div className="ai-health-assistant-modal">
                <div className="ai-chat-header">
                    <div className="header-info">
                        <span className="bot-icon">🤖</span>
                        <h3>AI Health Assistant</h3>
                    </div>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                {/* AI Monitoring Opt-in Banner */}
                {!user.aiMonitoringEnabled && (
                    <div className="ai-monitoring-banner">
                        <div className="banner-content">
                            <span className="banner-icon">✨</span>
                            <div className="banner-text">
                                <h4>Full AI Health Monitoring</h4>
                                <p>Get personalized daily tips and medication reminders.</p>
                            </div>
                        </div>
                        {user.subscriptionStatus === 'premium' ? (
                            <button 
                                onClick={handleEnableMonitoring} 
                                disabled={isSubmitting}
                                className="banner-btn enable"
                            >
                                {isSubmitting ? 'Enabling...' : 'Enable Now'}
                            </button>
                        ) : (
                            <button 
                                onClick={handleUpgrade} 
                                disabled={isSubmitting}
                                className="banner-btn upgrade"
                            >
                                {isSubmitting ? 'Upgrading...' : 'Upgrade to Premium'}
                            </button>
                        )}
                    </div>
                )}

                <div className="ai-chat-body">
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.role}`}>
                            <div className="message-content">
                                {msg.role === 'assistant' ? formatText(msg.text) : msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="chat-message assistant">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="ai-chat-footer">
                    <input
                        type="text"
                        placeholder="Ask about diet, exercise, yoga..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIHealthAssistant;
