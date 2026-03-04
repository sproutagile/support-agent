import React, { useState } from 'react';
import { formatPriority } from '../utils/ticketUtils';

const Investigate = ({ onCopy }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            setLoading(true);
            setError(null);
            setHasSearched(true);

            try {
                console.log(`[Investigate] Searching for: ${searchTerm}`);
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/proxy/investigate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'search',
                        query: searchTerm,
                        ticketKey: searchTerm
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Error ${response.status}`);
                }

                const data = await response.json();
                console.log("[Investigate] RAW DATA from n8n:", JSON.stringify(data));

                let finalResults = [];

                // Extremely robust parsing to find all ticket-like objects in the response
                const findTickets = (obj) => {
                    if (Array.isArray(obj)) {
                        obj.forEach(findTickets);
                    } else if (obj && typeof obj === 'object') {
                        // Handle "columnar" structure: If Key is an array, transform it into array of objects
                        if (Array.isArray(obj.Key)) {
                            console.log("[Investigate] Detected columnar format, transforming...");
                            obj.Key.forEach((k, i) => {
                                const ticket = {};
                                Object.keys(obj).forEach(field => {
                                    ticket[field] = Array.isArray(obj[field]) ? obj[field][i] : obj[field];
                                });
                                finalResults.push(ticket);
                            });
                        } else if (obj.Key || obj.key) {
                            finalResults.push(obj);
                        } else {
                            // Recursively search in properties (like 'issues', 'relatedTickets', etc)
                            Object.values(obj).forEach(val => {
                                if (val && typeof val === 'object') findTickets(val);
                            });
                        }
                    }
                };

                findTickets(data);

                console.log(`[Investigate] Found ${finalResults.length} cases in response.`);
                setResults(finalResults);
            } catch (err) {
                console.error("[Investigate] Search failed:", err);
                setError(err.message);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="sp-panel sp-panel--active">
            {/* Search Input */}
            <div className="sp-search-bar" style={{ marginBottom: '24px' }}>
                <svg className="sp-search-bar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    className="sp-search-bar__input"
                    type="text"
                    placeholder="Search ticket library (e.g. EAB-123)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                    disabled={loading}
                    autoFocus
                />
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <div className="sp-loading-spinner" style={{ marginBottom: '12px' }}>Searching Library...</div>
                </div>
            )}

            {error && (
                <div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '12px', border: '1px solid #fecaca' }}>
                    <strong>Search Error:</strong> {error}
                </div>
            )}

            {/* Results List */}
            {!loading && !error && hasSearched && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                    No matching cases found in library.
                </div>
            )}

            <div className="sp-results-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {!loading && results.map((t, idx) => {
                    try {
                        const key = (typeof t.Key === 'string' ? t.Key : null) || (typeof t.key === 'string' ? t.key : null) || `Case-${idx}`;
                        const summary = (typeof t.Summary === 'string' ? t.Summary : null) || (typeof t.summary === 'string' ? t.summary : null) || '';
                        const status = (typeof t.Status === 'string' ? t.Status : null) || t.fields?.status?.name || 'Unknown';
                        const priority = (typeof t.Priority === 'string' ? t.Priority : null) || t.fields?.priority?.name || 'P3';
                        const workaround = (typeof t.Workaround === 'string' ? t.Workaround : null) || t.fields?.resolution?.description || "No workaround documented.";

                        return (
                            <div key={`${key}-${idx}`} className="sp-ticket-card" style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                {/* Head: Key & Summary */}
                                <div style={{ marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                                        {key}{summary ? `: ${summary}` : ''}
                                    </h3>
                                </div>

                                {/* Sub-header: Priority & Status side-by-side */}
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                    <span className="sp-badge sp-badge--warning-outline" style={{ fontSize: '11px', padding: '4px 10px' }}>
                                        {formatPriority(priority)}
                                    </span>
                                    <span className={`sp-badge ${status === 'Done' || status === 'Resolved' ? 'sp-badge--success' : 'sp-badge--info'}`} style={{ fontSize: '11px', padding: '4px 10px' }}>
                                        {status}
                                    </span>
                                </div>

                                {/* Main Body: Workaround Paragraph */}
                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#475569', margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {workaround}
                                    </p>
                                </div>
                            </div>
                        );
                    } catch (renderError) {
                        console.error("[Investigate] Render error for ticket:", t, renderError);
                        return null;
                    }
                })}
            </div>
        </div>
    );
};

export default Investigate;
