import React, { useState, useEffect, useCallback } from 'react';
import { getCredentials } from '../services/jiraService';

const MOCK_DATA = {
    velocity: { weeks: ['W7', 'W8', 'W9', 'W10'], counts: [12, 15, 14, 18] },
    leadTimeAvgDays: 4,
    cycleTimeAvgDays: 2,
    createdTrend: {
        dates: ['2026-02-12', '2026-02-13', '2026-02-14', '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23', '2026-02-24', '2026-02-25'],
        counts: [5, 8, 3, 2, 9, 12, 7, 10, 11, 4, 3, 14, 11, 15]
    },
    resolvedInternal: { total: 42 },
    resolvedDelivery: { total: 28 },
    escalated: { total: 5 },
    lastUpdated: new Date().toISOString()
};

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metricsData, setMetricsData] = useState(null);
    const [period, setPeriod] = useState('30d');
    const [priority, setPriority] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMock, setIsMock] = useState(false);

    const fetchMetrics = useCallback(async (isManualRefresh = false) => {
        setLoading(true);
        setError(null);
        if (isManualRefresh) setIsRefreshing(true);

        try {
            // Check credentials if we wanted to enforce them, but for "fully frontend" 
            // we will proceed to fetch and fallback if it fails.
            const creds = await getCredentials().catch(() => ({}));

            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            let url = `http://localhost:5000/api/metrics?startDate=${startDate}&endDate=${endDate}`;
            if (priority !== 'all') url += `&priority=${priority}`;
            if (isManualRefresh) url += `&refresh=true`;

            try {
                const response = await fetch(url, {
                    headers: {
                        'x-jira-domain': creds.domain || 'mock',
                        'x-jira-email': creds.email || 'mock@example.com',
                        'x-jira-token': creds.token || 'mock-token'
                    }
                });

                if (!response.ok) {
                    throw new Error('Backend responded with error');
                }

                const data = await response.json();
                setMetricsData(data);
                setIsMock(false);
            } catch (fetchErr) {
                console.warn('[Dashboard] Backend unavailable, using mock data:', fetchErr.message);
                setMetricsData(MOCK_DATA);
                setIsMock(true);
            }
        } catch (err) {
            console.error('[Dashboard] Logic error:', err);
            setMetricsData(MOCK_DATA);
            setIsMock(true);
        } finally {
            setLoading(false);
            if (isManualRefresh) {
                setTimeout(() => setIsRefreshing(false), 600);
            }
        }
    }, [period, priority]);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    if (loading && !metricsData) {
        return (
            <div className="sp-panel sp-panel--active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="sp-loading-spinner"></div>
                <p style={{ marginLeft: '12px', color: '#64748b' }}>Calculating metrics...</p>
            </div>
        );
    }

    return (
        <div className="sp-panel sp-panel--active" style={{ overflowY: 'auto' }}>
            {/* Filters & Refresh */}
            <div className="sp-toolbar" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', paddingBottom: '12px' }}>
                <div className="sp-select-group">
                    <label className="sp-label">Period</label>
                    <select className="sp-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                    </select>
                </div>
                <div className="sp-select-group">
                    <label className="sp-label">Priority</label>
                    <select className="sp-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="all">All Priorities</option>
                        <option value="P1">P1 — Critical</option>
                        <option value="P2">P2 — High</option>
                        <option value="P3">P3 — Medium</option>
                        <option value="P4">P4 — Low</option>
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: '8px' }}>
                    {isMock && (
                        <span className="sp-badge sp-badge--neutral-outline" style={{ fontSize: '10px', opacity: 0.7 }}>
                            Offline Mode
                        </span>
                    )}
                    <button
                        className="sp-icon-btn"
                        title="Refresh Data"
                        onClick={() => fetchMetrics(true)}
                        style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="sp-metrics-grid">
                <div className="sp-metric-card">
                    <span className="sp-metric-card__label">Velocity</span>
                    <div className="sp-metric-card__value">{metricsData?.velocity?.counts[metricsData?.velocity?.counts.length - 1] || 0}</div>
                    <span className="sp-metric-card__note">issues / week</span>
                </div>
                <div className="sp-metric-card">
                    <span className="sp-metric-card__label">Lead Time</span>
                    <div className="sp-metric-card__value">{metricsData?.leadTimeAvgDays || 0}d</div>
                    <span className="sp-metric-card__note">avg creation to resolution</span>
                </div>
                <div className="sp-metric-card">
                    <span className="sp-metric-card__label">Cycle Time</span>
                    <div className="sp-metric-card__value">{metricsData?.cycleTimeAvgDays || 0}d</div>
                    <span className="sp-metric-card__note">avg work to resolution</span>
                </div>
            </div>

            {/* Ticket Trend Chart (Simple Bar Visualization) */}
            <div className="sp-card" style={{ marginTop: '16px' }}>
                <div className="sp-card__header">
                    <h3 className="sp-card__title">Created Ticket Trend</h3>
                    <span className="sp-badge sp-badge--neutral">Daily Volume</span>
                </div>
                <div className="sp-chart" style={{ height: '140px' }}>
                    <div className="sp-bar-chart">
                        <div className="sp-bar-chart__content" style={{ alignItems: 'flex-end', height: '100px' }}>
                            {metricsData?.createdTrend?.counts.slice(-14).map((cnt, i) => (
                                <div key={i} className="sp-bar-group" style={{ flex: 1 }}>
                                    <div
                                        className="sp-bar sp-bar--p2"
                                        style={{ height: `${Math.min(100, (cnt / (Math.max(...metricsData.createdTrend.counts) || 1)) * 100)}%` }}
                                        title={`${metricsData.createdTrend.dates[i]}: ${cnt}`}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: '#94a3b8' }}>
                        <span>{metricsData?.createdTrend?.dates[0]}</span>
                        <span>{metricsData?.createdTrend?.dates[metricsData?.createdTrend?.dates.length - 1]}</span>
                    </div>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="sp-metrics-grid sp-metrics-grid--2col" style={{ marginTop: '16px' }}>
                <div className="sp-card sp-card--compact">
                    <div className="sp-card__header">
                        <h3 className="sp-card__title">Resolved (Internal)</h3>
                    </div>
                    <div className="sp-resolution-item">
                        <span className="sp-resolution-item__value" style={{ color: '#16a34a' }}>{metricsData?.resolvedInternal?.total || 0}</span>
                        <div className="sp-progress-bar">
                            <div className="sp-progress-bar__fill sp-progress-bar__fill--green" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
                <div className="sp-card sp-card--compact">
                    <div className="sp-card__header">
                        <h3 className="sp-card__title">Resolved (Delivery)</h3>
                    </div>
                    <div className="sp-resolution-item">
                        <span className="sp-resolution-item__value" style={{ color: '#2563eb' }}>{metricsData?.resolvedDelivery?.total || 0}</span>
                        <div className="sp-progress-bar">
                            <div className="sp-progress-bar__fill sp-progress-bar__fill--blue" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sp-card sp-card--compact" style={{ marginTop: '12px' }}>
                <div className="sp-card__header">
                    <h3 className="sp-card__title">Escalated Tickets</h3>
                </div>
                <div className="sp-escalation-stat">
                    <span className="sp-escalation-stat__value" style={{ color: '#f97316' }}>{metricsData?.escalated?.total || 0}</span>
                    <span className="sp-escalation-stat__label">requires active attention</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#94a3b8' }}>
                {isMock ? 'Demo Data' : 'Last updated'}: {new Date(metricsData?.lastUpdated).toLocaleTimeString()}
            </div>
        </div>
    );
};

export default Dashboard;
