import React from 'react';

const Header = ({ onRefresh }) => {
    return (
        <header className="sp-header">
            <div className="sp-header__brand">
                <svg className="sp-header__logo" width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="6" fill="#16a34a" />
                    <path d="M8 14.5C8 11.5 10 9 14 8c4 1 6 3.5 6 6.5S18 21 14 22c-4-1-6-3.5-6-7.5z" fill="#fff" opacity="0.9" />
                    <circle cx="14" cy="11" r="2.5" fill="#fff" />
                </svg>
                <div>
                    <h1 className="sp-header__title">Sprout Support Agent</h1>
                    <span className="sp-header__subtitle">Sprout L4 Engineering</span>
                </div>

            </div>
            <div className="sp-header__actions">
                <button className="sp-icon-btn" onClick={onRefresh} title="Refresh data">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
