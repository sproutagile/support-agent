import React from 'react';

const FAQ = ({ showSsoPanel, onToggleSsoPanel, openAccordion, onToggleAccordion }) => {
    return (
        <div className="sp-panel sp-panel--active">
            {/* Quick Tools */}
            <div className="sp-section-header">
                <h3 className="sp-section-title">Quick Tools</h3>
            </div>
            <div className="sp-tools-grid">
                <button className="sp-tool-card">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    <span className="sp-tool-card__label">CA Tool</span>
                    <span className="sp-tool-card__desc">Customer Advocacy</span>
                </button>
                <button className="sp-tool-card" onClick={onToggleSsoPanel}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <span className="sp-tool-card__label">SSO Investigation</span>
                    <span className="sp-tool-card__desc">Quick diagnostic</span>
                </button>
                <button className="sp-tool-card">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    <span className="sp-tool-card__label">Full Sync</span>
                    <span className="sp-tool-card__desc">Process checker</span>
                </button>
            </div>

            {/* SSO Quick Investigation Panel */}
            {showSsoPanel && (
                <div className="sp-card sp-card--highlighted">
                    <div className="sp-card__header">
                        <h3 className="sp-card__title">Quick SSO Investigation</h3>
                        <button className="sp-icon-btn sp-icon-btn--sm" onClick={onToggleSsoPanel}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div className="sp-checklist">
                        {['Check if SSO certificate has expired', 'Verify SAML attributes mapping', 'Check if user attributes were uploaded', 'Verify NameID format matches', 'Check Azure AD assignment'].map((item, idx) => (
                            <label key={idx} className="sp-checklist__item">
                                <input type="checkbox" className="sp-checkbox" />
                                <span>{item}</span>
                            </label>
                        ))}
                    </div>
                    <div className="sp-card__footer">
                        <span className="sp-text--muted" style={{ fontSize: '11px', color: '#64748b' }}>If issue persists, escalate to dev with logs.</span>
                    </div>
                </div>
            )}

            {/* FAQ Accordion */}
            <div className="sp-section-header" style={{ marginTop: '16px' }}>
                <h3 className="sp-section-title">Process FAQs</h3>
            </div>
            <div className="sp-accordion">
                {[
                    { id: 'faq-1', title: 'HR-PR Linking (with SSO)', icon: 'users', steps: ['Verify HR Module Setup', 'Link PR Employee Records', 'Configure SSO Integration', 'Test & Validate'] },
                    { id: 'faq-2', title: 'SSO Inquiries', icon: 'lock', steps: ['Identify SSO Provider', 'Common Issues Checklist', 'When to Escalate'] },
                    { id: 'faq-3', title: 'Biometric Troubleshooting', icon: 'monitor', text: 'Hardware failures, firmware upgrades, and SDK issues should be coordinated with the supplier.' },
                    { id: 'faq-4', title: 'New Account Setup (Prod/Sandbox)', icon: 'user-plus', steps: ['Gather Requirements', 'Provision Environment', 'Configure Modules', 'Handover'] }
                ].map(item => (
                    <div key={item.id} className={`sp-accordion__item ${openAccordion === item.id ? 'sp-accordion__item--open' : ''}`}>
                        <button className="sp-accordion__trigger" onClick={() => onToggleAccordion(item.id)}>
                            <div className="sp-accordion__trigger-content">
                                <span>{item.title}</span>
                            </div>
                            <svg className="sp-accordion__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        {openAccordion === item.id && (
                            <div className="sp-accordion__content" style={{ display: 'block', padding: '0 16px 16px' }}>
                                {item.steps ? (
                                    <div className="sp-faq-steps">
                                        {item.steps.map((step, idx) => (
                                            <div key={idx} className="sp-step" style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                                                <span className="sp-step__number" style={{ background: '#f1f5f9', color: '#64748b', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' }}>{idx + 1}</span>
                                                <div className="sp-step__content">
                                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{step}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{item.text}</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
