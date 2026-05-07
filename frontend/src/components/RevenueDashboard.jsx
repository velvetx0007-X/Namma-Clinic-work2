import React, { useState, useEffect } from 'react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
    TrendingUp, DollarSign, Calendar, Filter, Download, 
    ChevronRight, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import api from '../api/axiosInstance';
import './RevenueDashboard.css';

const RevenueDashboard = ({ doctorId = null }) => {
    const [revenueData, setRevenueData] = useState({
        daily: [],
        weekly: [],
        monthly: [],
        yearly: []
    });
    const [activePeriod, setActivePeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        growth: 0,
        avgTicket: 0,
        transactions: 0
    });

    useEffect(() => {
        fetchRevenueAnalytics();
    }, [doctorId]);

    const fetchRevenueAnalytics = async () => {
        setLoading(true);
        try {
            const url = doctorId 
                ? `/billing/reports/analytics?doctorId=${doctorId}` 
                : '/billing/reports/analytics';
            const res = await api.get(url);
            if (res.data.success) {
                setRevenueData(res.data.data);
                
                // Calculate some stats based on monthly data
                const monthly = res.data.data.monthly;
                if (monthly.length > 0) {
                    const currentMonth = monthly[monthly.length - 1].value;
                    const prevMonth = monthly.length > 1 ? monthly[monthly.length - 2].value : 0;
                    const total = monthly.reduce((sum, item) => sum + item.value, 0);
                    const growth = prevMonth ? ((currentMonth - prevMonth) / prevMonth * 100).toFixed(1) : 100;
                    
                    setStats({
                        total: total,
                        growth: growth,
                        avgTicket: (total / (monthly.length * 20)).toFixed(0), // Mock calc
                        transactions: monthly.length * 20 // Mock calc
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActiveData = () => {
        return revenueData[activePeriod] || [];
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    if (loading) {
        return (
            <div className="revenue-loading">
                <div className="loader"></div>
                <p>Analyzing financial data...</p>
            </div>
        );
    }

    return (
        <div className="revenue-dashboard">
            <div className="revenue-header">
                <div className="header-left">
                    <h1>Financial Insights</h1>
                    <p>Track your clinic's performance and revenue trends</p>
                </div>
                <div className="header-right">
                    <div className="period-selector">
                        {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
                            <button 
                                key={period}
                                className={`period-btn ${activePeriod === period ? 'active' : ''}`}
                                onClick={() => setActivePeriod(period)}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                    <button className="btn-export">
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card premium">
                    <div className="stat-icon-row">
                        <div className="icon-box-rev blue">
                            <DollarSign size={24} />
                        </div>
                        <span className={`growth-pill ${stats.growth >= 0 ? 'up' : 'down'}`}>
                            {stats.growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(stats.growth)}%
                        </span>
                    </div>
                    <div className="stat-main">
                        <p className="label">Total Revenue</p>
                        <h2 className="value">{formatCurrency(stats.total)}</h2>
                    </div>
                    <div className="stat-footer">
                        <TrendingUp size={14} />
                        <span>Increased productivity this period</span>
                    </div>
                </div>

                <div className="stat-card premium">
                    <div className="stat-icon-row">
                        <div className="icon-box-rev green">
                            <Activity size={24} />
                        </div>
                    </div>
                    <div className="stat-main">
                        <p className="label">Average per Consult</p>
                        <h2 className="value">{formatCurrency(stats.avgTicket)}</h2>
                    </div>
                    <div className="stat-footer">
                        <ChevronRight size={14} />
                        <span>Based on recent transactions</span>
                    </div>
                </div>

                <div className="stat-card premium">
                    <div className="stat-icon-row">
                        <div className="icon-box-rev purple">
                            <Calendar size={24} />
                        </div>
                    </div>
                    <div className="stat-main">
                        <p className="label">Total Transactions</p>
                        <h2 className="value">{stats.transactions}</h2>
                    </div>
                    <div className="stat-footer">
                        <span>Patient visits recorded</span>
                    </div>
                </div>
            </div>

            <div className="charts-container">
                <div className="main-chart-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            <h3>Revenue Overview</h3>
                            <p>Cash inflow visualization for {activePeriod} period</p>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item"><span className="dot blue"></span> Paid</div>
                            <div className="legend-item"><span className="dot light"></span> Forecast</div>
                        </div>
                    </div>
                    <div className="chart-wrapper-rev">
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={getActiveData()}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--action-primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--action-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1e293b', 
                                        border: 'none', 
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="var(--action-primary)" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="secondary-charts grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="chart-card">
                        <h3>Comparison View</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getActiveData().slice(-6)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="growth-card">
                        <h3>Goal Progress</h3>
                        <div className="progress-list">
                            {[
                                { label: 'Monthly Target', val: 85, color: '#3b82f6' },
                                { label: 'Patient Retention', val: 92, color: '#10b981' },
                                { label: 'Service Efficiency', val: 78, color: '#8b5cf6' }
                            ].map((item, i) => (
                                <div key={i} className="progress-item">
                                    <div className="progress-info">
                                        <span>{item.label}</span>
                                        <span>{item.val}%</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div 
                                            className="progress-bar-fill" 
                                            style={{ width: `${item.val}%`, backgroundColor: item.color }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueDashboard;
