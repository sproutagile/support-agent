import React from 'react';

const Tabs = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /> },
        { id: 'investigate', label: 'Investigate', icon: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></> },
        { id: 'ai', label: 'AI', icon: <><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" /><circle cx="9" cy="10" r="1" /><circle cx="15" cy="10" r="1" /><path d="M9.5 14a3.5 3.5 0 0 0 5 0" /></> },
        { id: 'faq', label: 'FAQ', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> }
    ];

    return (
        <nav className="sp-tabs">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`sp-tab ${activeTab === tab.id ? 'sp-tab--active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {tab.icon}
                    </svg>
                    {tab.label}
                </button>
            ))}
        </nav>
    );
};

export default Tabs;
