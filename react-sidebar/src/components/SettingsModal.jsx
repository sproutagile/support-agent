import React from 'react';

const SettingsModal = ({ show, onClose, onSave }) => {
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
                        <label className="sp-label">Jira Instance URL</label>
                        <input className="sp-input" type="text" placeholder="https://..." />
                    </div>
                    <div className="sp-settings-panel__footer">
                        <button className="sp-btn sp-btn--ghost" onClick={onClose}>Cancel</button>
                        <button className="sp-btn sp-btn--primary" onClick={onSave}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
