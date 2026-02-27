import React, { useState } from 'react';

const Investigate = ({ onCopy }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial mock data as fallback or empty state
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            setLoading(true);
            setError(null);
            setHasSearched(true);

            try {
                const { fetchTicketByKey, searchTickets } = await import('../services/jiraService');

                let data = [];
                const trimmedTerm = searchTerm.trim();

                // Case-insensitive regex to catch eab-123 as well as EAB-123
                if (/^[a-zA-Z]+-\d+$/.test(trimmedTerm)) {
                    try {
                        // fetchTicketByKey in services will now handle the .toUpperCase()
                        const ticket = await fetchTicketByKey(trimmedTerm);
                        if (ticket) {
                            data = [ticket];
                        }
                    } catch (err) {
                        console.warn('Fetch by key failed, trying search', err);
                    }
                }

                // If no data yet (or not a key), try JQL search
                if (data.length === 0) {
                    // Normalize the part that targets the key to uppercase for Jira JQL
                    const jql = `text ~ "${trimmedTerm}" OR key = "${trimmedTerm.toUpperCase()}" ORDER BY created DESC`;
                    const searchRes = await searchTickets(jql);
                    data = searchRes.issues || [];
                }

                setResults(data);
            } catch (err) {
                console.error("Search failed", err);
                setError(err.message);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }
    };

    const trends = [
        { rank: 1, name: 'SSO Authentication Issues', count: '17 tickets', pct: 85, color: 'green' },
        { rank: 2, name: 'Data Sync Failures', count: '12 tickets', pct: 60, color: 'blue' },
        { rank: 3, name: 'Biometric Integration Errors', count: '8 tickets', pct: 40, color: 'orange' },
        { rank: 4, name: 'HR-PR Linking Issues', count: '6 tickets', pct: 30, color: 'purple' },
        { rank: 5, name: 'Account Provisioning Delays', count: '4 tickets', pct: 20, color: 'gray' }
    ];

    return (
        <div className="sp-panel sp-panel--active">
            {/* Search */}
            <div className="sp-search-bar" style={{ marginBottom: '16px' }}>
                <svg className="sp-search-bar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    className="sp-search-bar__input"
                    type="text"
                    placeholder="Search ticket key (EAB-123) or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                />
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Searching Jira...</div>}

            {error && (
                <div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                    Error: {error}
                </div>
            )}

            {/* Escalation Advisor */}
            <div className="sp-advisor-card">
                <div className="sp-advisor-card__header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                    <span className="sp-advisor-card__title">Escalation Advisor</span>
                </div>
                <div className="sp-advisor-card__body">
                    <div className="sp-advisor-confidence">
                        <span className="sp-advisor-confidence__label">Dev Assignment Need:</span>
                        <span className="sp-badge sp-badge--warning">Medium</span>
                    </div>
                    <p className="sp-advisor-card__text">
                        2 similar tickets found with workarounds. Consider trying known resolution before escalating to dev.
                    </p>
                </div>
            </div>

            {/* Results */}
            {!loading && !error && hasSearched && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No tickets found.</div>
            )}

            {!loading && results.map(t => (
                <div key={t.key} className="sp-ticket-card" style={{ marginBottom: '12px' }}>
                    <div className="sp-ticket-card__header">
                        <div className="sp-ticket-card__key-row">
                            <span className="sp-badge sp-badge--primary">{t.key}</span>
                        </div>
                        <div className="sp-ticket-card__meta">
                            <span className={`sp-badge ${t.fields?.status?.name === 'Done' || t.fields?.status?.name === 'Resolved' ? 'sp-badge--success' : 'sp-badge--info'}`}>
                                {t.fields?.status?.name || 'Unknown'}
                            </span>
                            <span className="sp-badge sp-badge--warning-outline">{t.fields?.priority?.name || 'P?'}</span>
                        </div>
                    </div>
                    <p className="sp-ticket-card__summary">{t.fields?.summary}</p>

                    {/* Workaround / Resolution Check */}
                    {t.fields?.resolution ? (
                        <div className="sp-ticket-card__workaround">
                            <div className="sp-workaround-header">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span>Resolution</span>
                            </div>
                            <p className="sp-workaround-text">
                                {t.fields?.resolution?.description || "See Jira for details."}
                            </p>
                        </div>
                    ) : (
                        <div className="sp-ticket-card__no-workaround">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            <span>Open Ticket</span>
                        </div>
                    )}
                </div>
            ))}

            {/* Issue Trends */}
            <div className="sp-section-header" style={{ marginTop: '16px' }}>
                <h3 className="sp-section-title">Issue Trends (30 days)</h3>
            </div>
            <div className="sp-trends-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {trends.map(tr => (
                    <div key={tr.rank} className="sp-trend-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="sp-trend-item__rank" style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', width: '12px' }}>{tr.rank}</span>
                        <div className="sp-trend-item__content" style={{ flex: 1 }}>
                            <span className="sp-trend-item__name" style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block' }}>{tr.name}</span>
                            <div className="sp-progress-bar sp-progress-bar--sm">
                                <div className={`sp-progress-bar__fill sp-progress-bar__fill--${tr.color}`} style={{ width: `${tr.pct}%` }}></div>
                            </div>
                        </div>
                        <span className="sp-trend-item__count" style={{ fontSize: '11px', color: '#64748b' }}>{tr.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Investigate;

