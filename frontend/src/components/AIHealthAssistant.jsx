import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Bot, X, Send, Sparkles, AlertCircle, RefreshCw, Info, ShieldAlert } from 'lucide-react';
import './AIHealthAssistant.css';

const AIHealthAssistant = ({ onClose, context }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            data: {
                title: 'Hello! 👋',
                summary: 'I am your AI Health Assistant. I can guide you on food, exercise, warmup, and yoga.',
                recommendation: 'How can I help you today?',
                safetyNote: 'I am an AI, not a doctor. For serious issues, consult a professional.'
            }
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const { user, updateUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const messagesEndRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

    const handleSendMessage = async (retryInput = null) => {
        const messageText = retryInput || input;
        if (!messageText.trim()) return;

        if (!retryInput) {
            const userMessage = { role: 'user', text: messageText };
            setMessages(prev => [...prev, userMessage]);
            setInput('');
        }
        
        setIsLoading(true);

        try {
            const response = await api.post('/ai-health/chat', {
                message: messageText,
                context: `User: ${user.name}, Role: ${user.role}. Real-time Context: ${JSON.stringify(context || {})}`
            });

            let parsedReply;
            try {
                parsedReply = JSON.parse(response.data.reply);
            } catch (e) {
                // If backend didn't return JSON for some reason
                parsedReply = {
                    title: "Health Insight",
                    summary: "General health information",
                    recommendation: response.data.reply,
                    safetyNote: "Please consult a doctor for clinical advice."
                };
            }

            const aiMessage = { role: 'assistant', data: parsedReply };
            setMessages(prev => [...prev, aiMessage]);
            setRetryCount(0);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorData = {
                title: "Assistant Unavailable",
                summary: "AI Assistant is temporarily unavailable. Please try again.",
                recommendation: "Check your internet connection or try later.",
                safetyNote: "If you have a medical emergency, call 102/108 immediately.",
                isError: true
            };
            setMessages(prev => [...prev, { role: 'assistant', data: errorData }]);
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

    // Structured Card Component
    const StructuredCard = ({ data }) => {
        if (!data) return null;
        return (
            <div className={`ai-structured-card ${data.isError ? 'error-card' : ''}`}>
                <div className="card-header">
                    <Sparkles size={16} className="sparkle-icon" />
                    <h4>{data.title}</h4>
                </div>
                <div className="card-body">
                    <p className="summary"><strong>Summary:</strong> {data.summary}</p>
                    <div className="recommendation">
                        <Info size={14} className="info-icon" />
                        <p>{data.recommendation}</p>
                    </div>
                </div>
                <div className="card-footer">
                    <ShieldAlert size={14} className="safety-icon" />
                    <p className="safety">{data.safetyNote}</p>
                </div>
                {data.isError && (
                    <button className="retry-btn" onClick={() => handleSendMessage(messages[messages.length-1].text)}>
                        <RefreshCw size={14} /> Retry
                    </button>
                )}
            </div>
        );
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpgrade = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/subscriptions/upgrade', { userId: user._id });
            updateUser({ ...user, subscriptionStatus: 'premium' });
        } catch (error) {
            console.error('Error upgrading:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="ai-health-assistant-overlay">
            <div className="ai-health-assistant-modal">
                <div className="ai-chat-header">
                    <div className="header-info">
                        <div className="bot-icon-wrapper">
                            <Bot className="text-white" size={20} />
                        </div>
                        <h3>Namma Clinic <span>AI</span></h3>
                    </div>
                    {/* FIXED STATIC CLOSE BUTTON */}
                    <button onClick={onClose} className="global-close-btn-fixed" title="Close Assistant">
                        <X size={20} />
                    </button>
                </div>

                {/* AI Monitoring Opt-in Banner */}
                {!user.aiMonitoringEnabled && (
                    <div className="ai-monitoring-banner-premium">
                        <div className="banner-content">
                            <Sparkles className="text-amber-500" size={24} />
                            <div className="banner-text">
                                <h4>Proactive Health Monitoring</h4>
                                <p>Let AI monitor your vitals and remind you of meds.</p>
                            </div>
                        </div>
                        {user.subscriptionStatus === 'premium' ? (
                            <button onClick={handleEnableMonitoring} disabled={isSubmitting} className="enable-btn">
                                {isSubmitting ? '...' : 'Enable'}
                            </button>
                        ) : (
                            <button onClick={handleUpgrade} disabled={isSubmitting} className="upgrade-btn">
                                Upgrade
                            </button>
                        )}
                    </div>
                )}

                <div className="ai-chat-body">
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message-row ${msg.role}`}>
                            {msg.role === 'assistant' ? (
                                <StructuredCard data={msg.data} />
                            ) : (
                                <div className="user-bubble">{msg.text}</div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="chat-message-row assistant">
                            <div className="typing-indicator-lux">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="ai-chat-footer-lux">
                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="Type health query..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button 
                            className="send-btn" 
                            onClick={() => handleSendMessage()} 
                            disabled={isLoading || !input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIHealthAssistant;
