import React, { useState, useEffect, useCallback } from 'react';
import { getCredentials } from '../services/jiraService';


const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metricsData, setMetricsData] = useState(null);
    const [period, setPeriod] = useState('30');
    const [priority, setPriority] = useState('all');
    const [isMock, setIsMock] = useState(false);

    const fetchMetrics = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const url = `http://localhost:5000/api/dashboard/metrics?period=${period}&priority=${encodeURIComponent(priority)}`;

            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch metrics');
            }

            const data = await response.json();
            setMetricsData(data);
            setIsMock(false);
        } catch (err) {
            console.error('[Dashboard] Fetch error:', err);
            setError(err.message);
            // Fallback to mock data for demo purposes if backend fails
            setMetricsData({
                velocity: 0,
                leadTime: 0,
                cycleTime: 0,
                resolved: 0,
                lastUpdated: new Date().toISOString()
            });
            setIsMock(true);
        } finally {
            setLoading(false);
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
                        <option value="P1 (Very Urgent)">P1 (Very Urgent)</option>
                        <option value="P2 (Urgent)">P2 (Urgent)</option>
                        <option value="P3 (Standard)">P3 (Standard)</option>
                        <option value="P4 (Low)">P4 (Low)</option>
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                    {isMock && (
                        <span className="sp-badge sp-badge--neutral-outline" style={{ fontSize: '10px', opacity: 0.7 }}>
                            Demo Mode
                        </span>
                    )}
                </div>
            </div>

            {error && !isMock && (
                <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '12px', marginBottom: '12px' }}>
                    <strong>Notice:</strong> {error}
                </div>
            )}

            {/* Metrics Grid */}
            <div className="sp-metrics-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '16px'
            }}>
                <div className="sp-metric-card">
                    <span className="sp-metric-card__label">Velocity</span>
                    <div className="sp-metric-card__value">{metricsData?.velocity || 0}</div>
                    <span className="sp-metric-card__note">issues / week</span>
                </div>
                <div className="sp-metric-card">
                    <span className="sp-metric-card__label">Resolved</span>
                    <div className="sp-metric-card__value" style={{ color: '#16a34a' }}>{metricsData?.resolved || 0}</div>
                    <span className="sp-metric-card__note">total in period</span>
                </div>
                <div className="sp-metric-card">
                    <span className="sp-metric-card__label">Lead Time</span>
                    <div className="sp-metric-card__value">{metricsData?.leadTime || 0}d</div>
                    <span className="sp-metric-card__note">avg creation to resolution</span>
                </div>
                <div className="sp-metric-card">
                    <span className="sp-metric-card__label">Cycle Time</span>
                    <div className="sp-metric-card__value">{metricsData?.cycleTime || 0}d</div>
                    <span className="sp-metric-card__note">avg work to resolution</span>
                </div>
            </div>

            {/* Trend Graph Section */}
            <div className="sp-card sp-card--compact">
                <div className="sp-card__header">
                    <h3 className="sp-card__title">Resolution Trend</h3>
                    <span className="sp-badge sp-badge--neutral">Historical View</span>
                </div>

                <div style={{ padding: '24px 12px 16px' }}>

                    {/* Bar Chart Container */}
                    {(!metricsData?.resolvedTrend || metricsData.resolvedTrend.length === 0) ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                            No trend data available
                        </div>
                    ) : (
                        <div style={{
                            height: '140px',
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '6px',
                            paddingBottom: '24px',
                            position: 'relative',
                            borderBottom: '1px solid #f1f5f9'
                        }}>
                            {metricsData.resolvedTrend.map((item, idx) => {
                                const maxVal = Math.max(...(metricsData.resolvedTrend.map(t => t.value)), 1);
                                const heightPercent = (item.value / maxVal) * 100;

                                return (
                                    <div key={idx} style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        height: '100%',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <div
                                            style={{
                                                width: '75%',
                                                height: `${heightPercent}%`,
                                                background: '#16a34a',
                                                borderRadius: '3px 3px 0 0',
                                                transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                                minHeight: item.value > 0 ? '4px' : '0',
                                                opacity: 0.85,
                                                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.15)'
                                            }}
                                            title={`${item.label}: ${item.value} resolved`}
                                        />
                                        <span style={{
                                            fontSize: '8px',
                                            color: '#64748b',
                                            position: 'absolute',
                                            bottom: '4px',
                                            whiteSpace: 'nowrap',
                                            fontWeight: '500',
                                            transform: 'scale(0.95)'
                                        }}>
                                            {item.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#94a3b8' }}>
                Last updated: {metricsData?.lastUpdated ? new Date(metricsData.lastUpdated).toLocaleTimeString() : 'N/A'}
            </div>
        </div>
    );
};

export default Dashboard;
