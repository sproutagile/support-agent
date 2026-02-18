import React from 'react';

const Toast = ({ message, visible }) => {
    if (!visible) return null;

    return (
        <div
            className="sp-toast"
            style={{
                position: 'fixed',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#1e293b',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                whiteSpace: 'nowrap',
            }}
        >
            {message}
        </div>
    );
};

export default Toast;
