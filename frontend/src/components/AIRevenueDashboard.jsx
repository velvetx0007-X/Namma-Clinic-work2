import React, { useState, useEffect } from 'react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
    PieChart, Pie, Cell
} from 'recharts';
import { 
    TrendingUp, DollarSign, Calendar, Filter, Download, 
    ChevronRight, ArrowUpRight, ArrowDownRight, Activity,
    Shield, Users, Clock, Sparkles, Brain, Zap, AlertCircle,
    ChevronDown, MapPin, Search
} from 'lucide-react';
import api from '../api/axiosInstance';
import logo from '../assets/logo.jpg';
import './AIRevenueDashboard.css';

const AIRevenueDashboard = ({ doctorId = null, clinicId = null }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [filters, setFilters] = useState({
        branch: 'All Branches',
        department: 'All Departments'
    });

    useEffect(() => {
        fetchAIAnalytics();
    }, [doctorId, clinicId, period, dateRange]);

    const fetchAIAnalytics = async () => {
        setLoading(true);
        try {
            let url = '/analytics/revenue-ai';
            const params = [`period=${period}`];
            if (doctorId) params.push(`doctorId=${doctorId}`);
            if (clinicId) params.push(`clinicId=${clinicId}`);
            if (dateRange.start) params.push(`startDate=${dateRange.start}`);
            if (dateRange.end) params.push(`endDate=${dateRange.end}`);
            
            if (params.length > 0) url += `?${params.join('&')}`;

            const res = await api.get(url);
            if (res.data.success) {
                setAnalytics(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching AI analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    if (loading || !analytics) {
        return (
            <div className="ai-revenue-loading">
                <div className="ai-loader">
                    <div className="pulse-circle"></div>
                    <Brain className="brain-pulse" size={48} />
                    <p>AI Engine syncing clinical performance...</p>
                </div>
            </div>
        );
    }

    const { summary, appointments, predictions, aiInsights, charts } = analytics;
    const COLORS = ['#1E88E5', '#E53935', '#43A047', '#FB8C00', '#8E24AA'];

    return (
        <div className="ai-revenue-dashboard-refined">
            {/* TOP HEADER & LOGO SECTION */}
            <div className="refined-rev-header">
                <div className="header-brand-main">
                    <img src={logo} alt="NAMMA CLINIC Logo" className="branding-logo" />
                    <div className="branding-text">
                        <span className="brand-primary">NAMMA CLINIC</span>
                        <span className="brand-tagline">AI Revenue Intelligence Platform</span>
                    </div>
                </div>

                <div className="refined-filters">
                    <div className="filter-pill">
                        <MapPin size={14} />
                        <select value={filters.branch} onChange={(e) => setFilters({...filters, branch: e.target.value})}>
                            <option>All Branches</option>
                            <option>Main Clinic</option>
                        </select>
                    </div>
                    <div className="filter-pill">
                        <Shield size={14} />
                        <select value={filters.department} onChange={(e) => setFilters({...filters, department: e.target.value})}>
                            <option>All Departments</option>
                            <option>General Medicine</option>
                        </select>
                    </div>
                    <div className="date-range-picker">
                        <input 
                            type="date" 
                            value={dateRange.start} 
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        />
                        <span>to</span>
                        <input 
                            type="date" 
                            value={dateRange.end} 
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        />
                    </div>
                    <button className="btn-export-refined">
                        <Download size={16} />
                    </button>
                </div>
            </div>

            {/* MAIN DASHBOARD CONTENT */}
            <div className="refined-rev-content">
                {/* TOP STATS CARDS */}
                <div className="stats-cards-track">
                    <div className="refined-card stat-item">
                        <div className="s-icon blue"><DollarSign size={22} /></div>
                        <div className="s-data">
                            <p>Monthly Revenue</p>
                            <h2>{formatCurrency(summary.totalRevenue)}</h2>
                            <span className="up"><TrendingUp size={12} /> 10.0% vs Last Month</span>
                        </div>
                    </div>
                    <div className="refined-card stat-item">
                        <div className="s-icon purple"><TrendingUp size={22} /></div>
                        <div className="s-data">
                            <p>Revenue Growth</p>
                            <h2>+10.0%</h2>
                            <span className="neutral">₹34,800 Increase</span>
                        </div>
                    </div>
                    <div className="refined-card stat-item">
                        <div className="s-icon indigo"><Shield size={22} /></div>
                        <div className="s-data">
                            <p>Total Billing</p>
                            <h2>{formatCurrency(summary.totalBilling)}</h2>
                            <span className="normal">9.8% Efficiency</span>
                        </div>
                    </div>
                    <div className="refined-card stat-item">
                        <div className="s-icon green"><Users size={22} /></div>
                        <div className="s-data">
                            <p>Total Patients</p>
                            <h2>{summary.totalPatients}</h2>
                            <span className="info">New: 120 | Ret: 591</span>
                        </div>
                    </div>
                </div>

                {/* MIDDLE SECTION - CHARTS AND INSIGHTS */}
                <div className="analytics-layout-grid">
                    {/* LEFT COLUMN: Main Charts */}
                    <div className="analytics-main-col">
                        <div className="grid-sub-row">
                            {/* Service Donut */}
                            <div className="refined-glass-card donut-card">
                                <div className="card-top-flex">
                                    <h3>Revenue by Service</h3>
                                    <div className="card-badge">LIVE</div>
                                </div>
                                <div className="donut-viz">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={charts.revenueByService}
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {charts.revenueByService.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v) => formatCurrency(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="donut-center-text">
                                        <h4>{formatCurrency(summary.totalRevenue)}</h4>
                                        <p>TOTAL RECORDED</p>
                                    </div>
                                </div>
                                <div className="donut-legend-grid">
                                    {charts.revenueByService.map((item, i) => (
                                        <div key={i} className="legend-p">
                                            <div className="dot" style={{backgroundColor: COLORS[i%5]}}></div>
                                            <span>{item.name}</span>
                                            <strong>{item.percentage}%</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary Mini Cards */}
                            <div className="mini-summaries">
                                <div className="refined-mini billing">
                                    <div className="mini-h flex justify-between">
                                        <h4>Billing Summary</h4>
                                        <Activity size={14} className="opacity-50" />
                                    </div>
                                    <div className="mini-b">
                                        <div className="m-chunk"><span>9,887</span><label>Bills</label></div>
                                        <div className="m-chunk"><span>{formatCurrency(summary.totalRevenue)}</span><label>Paid</label></div>
                                        <div className="m-chunk red"><span>{formatCurrency(summary.pendingRevenue)}</span><label>Unpaid</label></div>
                                    </div>
                                </div>
                                <div className="refined-mini appts">
                                    <div className="mini-h flex justify-between">
                                        <h4>Appointments</h4>
                                        <Calendar size={14} className="opacity-50" />
                                    </div>
                                    <div className="mini-b">
                                        <div className="m-chunk"><span>{appointments.total}</span><label>Total</label></div>
                                        <div className="m-chunk green"><span>{appointments.completed}</span><label>Done</label></div>
                                        <div className="m-chunk red"><span>{appointments.cancelled}</span><label>Lost</label></div>
                                    </div>
                                </div>
                                <div className="refined-mini performance">
                                    <h4>Top Performers</h4>
                                    <div className="perf-mini-list">
                                        {charts.doctorPerformance.map((d, i) => (
                                            <div key={i} className="perf-mini-row">
                                                <div className="p-name">{d.name}</div>
                                                <div className="p-meter"><div style={{width: '70%', background: COLORS[i%5]}}></div></div>
                                                <div className="p-val">{formatCurrency(d.revenue)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trend Chart with Dropdown */}
                        <div className="refined-glass-card trend-card mt-8">
                            <div className="trend-header">
                                <div className="trend-title">
                                    <h3>Revenue Income Trend</h3>
                                    <p>AI-processed cash inflow over time</p>
                                </div>
                                <div className="trend-actions">
                                    <div className="period-dropdown">
                                        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                                            <option value="day">Day View</option>
                                            <option value="week">Weekly View</option>
                                            <option value="month">Monthly View</option>
                                            <option value="year">Yearly View</option>
                                        </select>
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            </div>
                            <div className="trend-viz mt-6">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={charts.trendData}>
                                        <defs>
                                            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => `₹${v/1000}k`} />
                                        <Tooltip formatter={(v) => formatCurrency(v)} />
                                        <Area type="monotone" dataKey="value" stroke="#1E88E5" strokeWidth={3} fill="url(#trendGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: AI Insights */}
                    <div className="analytics-side-col">
                        <div className="ai-premium-insight-card">
                            <div className="ai-inc-header">
                                <Brain size={20} className="text-blue-600" />
                                <h3>AI Revenue Insights</h3>
                            </div>
                            
                            <div className="insight-blocks mt-6">
                                <div className="i-block blue">
                                    <Zap size={16} />
                                    <div className="i-tx">
                                        <label>Top Category</label>
                                        <strong>{aiInsights.topDepartment}</strong>
                                    </div>
                                </div>
                                <div className="i-block purple">
                                    <Clock size={16} />
                                    <div className="i-tx">
                                        <label>Peak Hours</label>
                                        <strong>{aiInsights.peakHours}</strong>
                                    </div>
                                </div>
                                <div className="i-block green">
                                    <TrendingUp size={16} />
                                    <div className="i-tx">
                                        <label>Next Month Goal</label>
                                        <strong>↑ 8% Growth Forecast</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="ai-predictions-row mt-8">
                                <div className="pred-mini">
                                    <label>AI Forecast</label>
                                    <h4>{predictions.nextMonthAppointments}</h4>
                                    <p>Appts next month</p>
                                </div>
                                <div className="pred-mini highlight">
                                    <label>Expected Income</label>
                                    <h4>{formatCurrency(predictions.expectedRevenue)}</h4>
                                    <p>Est. cash flow</p>
                                </div>
                            </div>

                            <div className="ai-mitigation mt-8">
                                <div className="mit-h flex justify-between">
                                    <span>Cancellation Risk</span>
                                    <span className={`risk-pill ${aiInsights.cancellationRisk.toLowerCase()}`}>{aiInsights.cancellationRisk}</span>
                                </div>
                                <ul className="mit-list mt-4">
                                    {aiInsights.recommendations.map((rec, i) => (
                                        <li key={i}><AlertCircle size={12} /> {rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="heatmap-glass-card mt-8">
                            <h3>AI Patient Inflow (Heatmap)</h3>
                            <div className="heatmap-viz-grid mt-6">
                                <div className="h-labels-top">
                                    <div className="empty"></div>
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <span key={d}>{d}</span>)}
                                </div>
                                <div className="h-data-body">
                                    {['Morning', 'Afternoon', 'Evening'].map(slot => (
                                        <div key={slot} className="h-row">
                                            <span className="r-label">{slot.slice(0, 3)}</span>
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                                const val = charts.heatmap.find(h => h.day === day && h.slot === slot)?.value || 0;
                                                return <div key={day} className="h-box" style={{opacity: val/100, backgroundColor: '#1E88E5'}}></div>
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIRevenueDashboard;
