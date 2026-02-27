import React from 'react';

const SettingsModal = ({ show, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        domain: '',
        email: '',
        token: ''
    });

    React.useEffect(() => {
        if (show) {
            // Load credentials when modal opens
            import('../services/jiraService').then(({ getCredentials }) => {
                getCredentials().then(creds => {
                    setFormData(creds);
                });
            });
        }
    }, [show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        const { saveCredentials } = await import('../services/jiraService');
        await saveCredentials(formData.domain, formData.email, formData.token);
        onSave();
    };

    if (!show) return null;

    return (
        <div className="sp-settings-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="sp-settings-panel">
                <div className="sp-settings-panel__header">
                    <h3>Settings</h3>
                    <button className="sp-icon-btn sp-icon-btn--sm" onClick={onClose}>X</button>
                </div>
                <div className="sp-settings-panel__body">
                    <div className="sp-form-group">
                        <label className="sp-label">Jira Domain URL</label>
                        <input
                            className="sp-input"
                            type="text"
                            name="domain"
                            placeholder="https://your-domain.atlassian.net"
                            value={formData.domain}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="sp-form-group" style={{ marginTop: '12px' }}>
                        <label className="sp-label">Jira Email</label>
                        <input
                            className="sp-input"
                            type="text"
                            name="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="sp-form-group" style={{ marginTop: '12px' }}>
                        <label className="sp-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>API Token</span>
                            {formData.token && formData.token.length > 50 && (
                                <span style={{ color: '#dc2626', fontSize: '10px', fontWeight: 'bold' }}>⚠️ Token looks too long! (Session token?)</span>
                            )}
                        </label>
                        <input
                            className={`sp-input ${formData.token && formData.token.length > 50 ? 'sp-input--error' : ''}`}
                            type="password"
                            name="token"
                            placeholder="Paste your 24-char API token here"
                            value={formData.token}
                            onChange={handleChange}
                            style={formData.token && formData.token.length > 50 ? { borderColor: '#dc2626' } : {}}
                        />
                        <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                            1. Go to <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', textDecoration: 'underline' }}>Atlassian API Tokens</a><br />
                            2. Create a new token and paste it above.<br />
                            <span style={{ color: '#475569' }}>Note: Real API tokens are usually ~24 characters.</span>
                        </small>
                    </div>
                    <div className="sp-settings-panel__footer">
                        <button className="sp-btn sp-btn--ghost" onClick={onClose}>Cancel</button>
                        <button className="sp-btn sp-btn--primary" onClick={handleSave}>Save Settings</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
