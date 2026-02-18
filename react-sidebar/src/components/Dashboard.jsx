import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [backendStatus, setBackendStatus] = useState({ loading: true, data: null, error: null });

    useEffect(() => {
        const checkHealth = async () => {
            try {
                // Step 6: Fetching from local backend
                // Step 7: CORS is already enabled on backend to allow this
                const response = await fetch('http://localhost:5000/api/health');
                if (!response.ok) throw new Error('Backend response was not ok');
                const data = await response.json();

                // Step 8: Update state with data
                setBackendStatus({ loading: false, data: data, error: null });
            } catch (err) {
                console.error("Fetch error:", err);
                setBackendStatus({ loading: false, data: null, error: err.message });
            }
        };

        checkHealth();
    }, []);

    const metrics = [

        { label: 'Velocity', value: '12.5', change: '+8.7%', direction: 'up', note: 'vs last period' },
        { label: 'Lead Time', value: '4.2d', change: '-12.5%', direction: 'down', note: 'vs last period' },
        { label: 'Cycle Time', value: '2.8d', change: '-5.3%', direction: 'down', note: 'vs last period' }
    ];

    const trendData = [
        { week: 'Week 1', p1: 13, p2: 33, p3: 80, p4: 53 },
        { week: 'Week 2', p1: 7, p2: 53, p3: 67, p4: 40 },
        { week: 'Week 3', p1: 20, p2: 27, p3: 100, p4: 60 },
        { week: 'Week 4', p1: 7, p2: 40, p3: 73, p4: 47 }
    ];

    return (
        <div className="sp-panel sp-panel--active">
            {/* Backend Connection Status */}
            <div className="sp-toolbar" style={{ marginBottom: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ fontWeight: '600', color: '#64748b' }}>Backend Status:</span>
                    {backendStatus.loading ? (
                        <span className="sp-badge sp-badge--neutral">Connecting...</span>
                    ) : backendStatus.error ? (
                        <span className="sp-badge sp-badge--warning">Offline: {backendStatus.error}</span>
                    ) : (
                        <span className="sp-badge sp-badge--success">Connected: {backendStatus.data.message}</span>
                    )}
                </div>
            </div>

            {/* Date Range Selector */}
            <div className="sp-toolbar">

                <div className="sp-select-group">
                    <label className="sp-label">Period</label>
                    <select className="sp-select" defaultValue="30d">
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                </div>
                <div className="sp-select-group">
                    <label className="sp-label">Priority</label>
                    <select className="sp-select" defaultValue="all">
                        <option value="all">All Priorities</option>
                        <option value="P1">P1 — Critical</option>
                        <option value="P2">P2 — High</option>
                        <option value="P3">P3 — Medium</option>
                        <option value="P4">P4 — Hello</option>
                    </select>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="sp-metrics-grid">
                {metrics.map(m => (
                    <div key={m.label} className="sp-metric-card">
                        <div className="sp-metric-card__header">
                            <span className="sp-metric-card__label">{m.label}</span>
                        </div>
                        <div className="sp-metric-card__value">{m.value}</div>
                        <div className={`sp-metric-card__change ${m.direction === 'up' ? 'sp-metric-card__change--up' : 'sp-metric-card__change--down'}`}>
                            {m.change} {m.note}
                        </div>
                    </div>
                ))}
            </div>

            {/* Ticket Trend Chart */}
            <div className="sp-card">
                <div className="sp-card__header">
                    <h3 className="sp-card__title">Created Ticket Trend</h3>
                    <span className="sp-badge sp-badge--neutral">Per Priority</span>
                </div>
                <div className="sp-chart">
                    <div className="sp-bar-chart">
                        <div className="sp-bar-chart__y-axis">
                            <span>15</span><span>10</span><span>5</span><span>0</span>
                        </div>
                        <div className="sp-bar-chart__content">
                            {trendData.map(w => (
                                <div key={w.week} className="sp-bar-group">
                                    <div className="sp-bar-stack">
                                        <div className="sp-bar sp-bar--p1" style={{ height: `${w.p1}%` }}></div>
                                        <div className="sp-bar sp-bar--p2" style={{ height: `${w.p2}%` }}></div>
                                        <div className="sp-bar sp-bar--p3" style={{ height: `${w.p3}%` }}></div>
                                        <div className="sp-bar sp-bar--p4" style={{ height: `${w.p4}%` }}></div>
                                    </div>
                                    <span className="sp-bar-label">{w.week}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Resolution Cards */}
                <div className="sp-metrics-grid sp-metrics-grid--2col">
                    <div className="sp-card sp-card--compact">
                        <div className="sp-card__header">
                            <h3 className="sp-card__title">Resolved Tickets</h3>
                        </div>
                        <div className="sp-resolution-split">
                            <div className="sp-resolution-item">
                                <span className="sp-resolution-item__value">34</span>
                                <span className="sp-resolution-item__label">Internal Support</span>
                                <div className="sp-progress-bar">
                                    <div className="sp-progress-bar__fill sp-progress-bar__fill--green" style={{ width: '65%' }}></div>
                                </div>
                            </div>
                            <div className="sp-resolution-item">
                                <span className="sp-resolution-item__value">18</span>
                                <span className="sp-resolution-item__label">Delivery Teams</span>
                                <div className="sp-progress-bar">
                                    <div className="sp-progress-bar__fill sp-progress-bar__fill--blue" style={{ width: '35%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="sp-card sp-card--compact">
                        <div className="sp-card__header">
                            <h3 className="sp-card__title">Escalated Tickets</h3>
                        </div>
                        <div className="sp-escalation-stat">
                            <span className="sp-escalation-stat__value">7</span>
                            <span className="sp-escalation-stat__label">tickets escalated this period</span>
                            <div className="sp-escalation-stat__bar">
                                <div className="sp-progress-bar">
                                    <div className="sp-progress-bar__fill sp-progress-bar__fill--orange" style={{ width: '13%' }}></div>
                                </div>
                                <span className="sp-escalation-stat__pct">13.5% of total</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
