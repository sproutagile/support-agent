import React, { useEffect, useRef } from 'react';

const AIChat = ({ messages, isTyping, inputValue, onInputChange, onSendMessage }) => {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    return (
        <div className="sp-panel sp-panel--active" style={{ display: 'flex', height: '100%', padding: 0 }}>
            <div className="sp-ai-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

                {/* Chat Messages */}
                <div className="sp-ai-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`sp-ai-msg ${msg.role === 'user' ? 'sp-ai-msg--user' : 'sp-ai-msg--assistant'}`} style={{ display: 'flex', gap: '8px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            {msg.role === 'assistant' && (
                                <div className="sp-ai-msg__avatar" style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" /></svg>
                                </div>
                            )}
                            <div className="sp-ai-msg__content" style={{ maxWidth: '85%', background: msg.role === 'user' ? '#16a34a' : 'white', color: msg.role === 'user' ? 'white' : '#334155', padding: '12px', borderRadius: '12px', border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none' }}>
                                {msg.role === 'assistant' && <div className="sp-ai-msg__name" style={{ fontSize: '11px', fontWeight: '600', color: '#8b5cf6', marginBottom: '4px' }}>Sprout AI</div>}
                                {msg.type === 'html' ? (
                                    <div className="sp-ai-msg__text" style={{ fontSize: '13px', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: msg.content }} />
                                ) : msg.type === 'analysis' ? (
                                    <div className="sp-ai-msg__text">
                                        <div className="sp-ai-analysis">
                                            {msg.analysis.sections.map((sec, sIdx) => (
                                                <div key={sIdx} className="sp-ai-analysis__section" style={{ borderBottom: sIdx < msg.analysis.sections.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: '12px', marginBottom: '12px' }}>
                                                    <div className="sp-ai-analysis__header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                                                        {sec.title === 'Root Cause Analysis' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>}
                                                        {sec.title === 'Suggested Workarounds' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
                                                        {sec.title === 'Escalation Recommendation' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
                                                        <span>{sec.title}</span>
                                                        {sec.confidence && <span className="sp-ai-confidence sp-ai-confidence--high" style={{ fontSize: '10px', background: '#f0fdf4', color: '#166534', padding: '1px 6px', borderRadius: '100px', marginLeft: 'auto' }}>{sec.confidence}</span>}
                                                    </div>
                                                    <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 8px 0' }}>{sec.content}</p>
                                                    {sec.evidence && (
                                                        <div className="sp-ai-evidence" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Evidence:</span>
                                                            {sec.evidence.map(e => <span key={e} className="sp-badge sp-badge--primary">{e}</span>)}
                                                        </div>
                                                    )}
                                                    {sec.items && (
                                                        <ol className="sp-ai-workaround-list" style={{ paddingLeft: '20px', margin: '8px 0 0 0' }}>
                                                            {sec.items.map((item, iIdx) => (
                                                                <li key={iIdx} style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                                                                    <strong>{item.title}</strong> — {item.desc}
                                                                    {item.status && <span style={{ display: 'block', fontSize: '11px', color: '#166534', fontWeight: '500' }}>{item.status}</span>}
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    )}
                                                    {sec.recommendation && (
                                                        <div className="sp-ai-escalation" style={{ background: '#f0fdf4', padding: '8px', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                                                            <span className="sp-badge sp-badge--success" style={{ marginBottom: '4px' }}>{sec.recommendation.tag}</span>
                                                            <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>{sec.recommendation.text}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="sp-ai-msg__text" style={{ fontSize: '13px', lineHeight: '1.5' }}>{msg.content}</div>
                                )}

                                {msg.role === 'assistant' && idx === 0 && (
                                    <div className="sp-ai-quick-actions" style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        <button className="sp-ai-quick-btn" style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '100px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }} onClick={() => onSendMessage('Analyze current ticket')}>Analyze ticket</button>
                                        <button className="sp-ai-quick-btn" style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '100px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }} onClick={() => onSendMessage('Root cause analysis')}>Root cause</button>
                                        <button className="sp-ai-quick-btn" style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '100px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }} onClick={() => onSendMessage('Workaround summary')}>Workarounds</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="sp-ai-msg sp-ai-msg--assistant" style={{ display: 'flex', gap: '8px' }}>
                            <div className="sp-ai-msg__avatar" style={{ width: '28px', height: '28px', background: '#e2e8f0', borderRadius: '6px', flexShrink: 0 }}></div>
                            <div className="sp-ai-msg__content" style={{ padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                <div className="sp-ai-typing" style={{ display: 'flex', gap: '4px' }}>
                                    <div className="sp-ai-typing__dot" style={{ width: '6px', height: '6px', background: '#cbd5e1', borderRadius: '50%' }}></div>
                                    <div className="sp-ai-typing__dot" style={{ width: '6px', height: '6px', background: '#cbd5e1', borderRadius: '50%' }}></div>
                                    <div className="sp-ai-typing__dot" style={{ width: '6px', height: '6px', background: '#cbd5e1', borderRadius: '50%' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="sp-ai-input-area" style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
                    <div className="sp-ai-input-wrapper" style={{ display: 'flex', gap: '8px' }}>
                        <input
                            className="sp-ai-input"
                            type="text"
                            placeholder="Ask about a ticket..."
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            value={inputValue}
                            onChange={(e) => onInputChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSendMessage(inputValue)}
                        />
                        <button
                            className="sp-ai-send-btn"
                            style={{ background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', cursor: 'pointer' }}
                            onClick={() => onSendMessage(inputValue)}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
