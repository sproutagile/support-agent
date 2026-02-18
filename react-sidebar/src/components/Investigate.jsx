import React from 'react';

const Investigate = ({ onCopy }) => {
    const tickets = [
        { key: 'EAB-1234', summary: 'SSO login fails after password reset', match: '92%', status: 'Resolved', p: 'P2', workaround: 'Clear browser cache and re-authenticate via IdP portal. If persistent, re-sync user attributes.' },
        { key: 'EAB-1180', summary: 'SSO attribute mismatch causing auth loop', match: '85%', status: 'Resolved', p: 'P1', workaround: 'Verify SAML attributes mapping in Azure AD. Check NameID format matches expected value.' },
        { key: 'EAB-1156', summary: 'User unable to access after SSO migration', match: '78%', status: 'In Progress', p: 'P2', workaround: null }
    ];

    const trends = [
        { rank: 1, name: 'SSO Authentication Issues', count: '17 tickets', pct: 85, color: 'green' },
        { rank: 2, name: 'Data Sync Failures', count: '12 tickets', pct: 60, color: 'blue' },
        { rank: 3, name: 'Biometric Integration Errors', count: '8 tickets', pct: 40, color: 'orange' },
        { rank: 4, name: 'HR-PR Linking Issues', count: '6 tickets', pct: 30, color: 'purple' },
        { rank: 5, name: 'Account Provisioning Delays', count: '4 tickets', pct: 20, color: 'gray' }
    ];

    return (
        <div className="sp-panel sp-panel--active" style={{ padding: '16px' }}>
            {/* Search */}
            <div className="sp-search-bar">
                <svg className="sp-search-bar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input className="sp-search-bar__input" type="text" placeholder="Search related tickets, keywords, or paste a ticket key..." />
            </div>

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

            {/* Related Tickets */}
            <div className="sp-section-header">
                <h3 className="sp-section-title">Related Tickets</h3>
                <span className="sp-badge sp-badge--neutral">{tickets.length} found</span>
            </div>

            <div className="sp-ticket-list">
                {tickets.map(t => (
                    <div key={t.key} className="sp-ticket-card">
                        <div className="sp-ticket-card__header">
                            <div className="sp-ticket-card__key-row">
                                <span className="sp-badge sp-badge--primary">{t.key}</span>
                                <span className="sp-similarity-badge">{t.match} match</span>
                            </div>
                            <div className="sp-ticket-card__meta">
                                <span className={`sp-badge ${t.status === 'Resolved' ? 'sp-badge--success' : 'sp-badge--info'}`}>{t.status}</span>
                                <span className="sp-badge sp-badge--warning-outline">{t.p}</span>
                            </div>
                        </div>
                        <p className="sp-ticket-card__summary">{t.summary}</p>
                        {t.workaround ? (
                            <div className="sp-ticket-card__workaround">
                                <div className="sp-workaround-header">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    <span>Workaround Available</span>
                                </div>
                                <p className="sp-workaround-text">{t.workaround}</p>
                                <button className="sp-btn sp-btn--ghost sp-btn--sm" onClick={() => onCopy(t.workaround)}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    Copy
                                </button>
                            </div>
                        ) : (
                            <div className="sp-ticket-card__no-workaround">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                <span>No workaround yet — investigation in progress</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

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
