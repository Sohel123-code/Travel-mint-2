import React, { useState, useEffect } from 'react';
import { groq } from '../../utils/groqClient';
import './ScamDetail.css';

/* ── Groq prompt ─────────────────────────────────────────────── */
const buildPrompt = (scam) => `
You are a travel safety expert helping Indian tourists stay safe.

A traveler has encountered this scam in ${scam.city}, ${scam.state}:
- Scam Type: ${scam.scam_type}
- Description: ${scam.description}
- Risk Level: ${scam.risk_level}
- Reported Year: ${scam.reported_year}

Provide a detailed, practical safety guide in the following EXACT JSON format (respond with ONLY the JSON, no markdown code fences):

{
  "overview": "2-3 sentence explanation of how this scam works in detail",
  "warning_signs": ["sign 1", "sign 2", "sign 3", "sign 4", "sign 5"],
  "prevention_tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"],
  "what_to_do_if_targeted": ["step 1", "step 2", "step 3", "step 4"],
  "what_to_do_if_victim": ["step 1", "step 2", "step 3", "step 4"],
  "local_authorities": "Specific authority or hotline to contact in ${scam.city} or ${scam.state}",
  "traveler_tip": "One memorable, punchy safety mantra for this specific scam"
}
`;

/* ── Risk config ─────────────────────────────────────────────── */
const RISK = {
    High: { label: 'High Risk', color: '#dc2626', bg: '#fff5f5', border: '#fecaca', icon: '🔴' },
    Medium: { label: 'Medium Risk', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '🟡' },
    Low: { label: 'Low Risk', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '🟢' },
};

/* ── Numbered info section ───────────────────────────────────── */
const InfoSection = ({ icon, title, items, accentColor, borderColor }) => (
    <div className="sd-info-card">
        <div className="sd-info-header" style={{ borderLeftColor: accentColor }}>
            <span className="sd-info-icon">{icon}</span>
            <h3 className="sd-info-title">{title}</h3>
        </div>
        <ol className="sd-info-list">
            {items.map((item, i) => (
                <li key={i} className="sd-info-item">
                    <span className="sd-item-num" style={{ color: accentColor, borderColor: borderColor }}>
                        {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="sd-item-text">{item}</span>
                </li>
            ))}
        </ol>
    </div>
);

/* ── Main Component ──────────────────────────────────────────── */
const ScamDetail = ({ scam, onBack }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [phase, setPhase] = useState(0); // 0=idle 1=thinking 2=writing

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchGroqData();
    }, []);

    // Cycle loading phases for better UX
    useEffect(() => {
        if (!loading) return;
        const t1 = setTimeout(() => setPhase(1), 800);
        const t2 = setTimeout(() => setPhase(2), 2500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [loading]);

    const fetchGroqData = async () => {
        setLoading(true);
        setError(null);
        setPhase(0);
        try {
            const completion = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: buildPrompt(scam) }],
                temperature: 0.7,
                max_tokens: 1400,
            });
            const raw = completion.choices[0]?.message?.content?.trim();
            const jsonStr = raw
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '');
            setData(JSON.parse(jsonStr));
        } catch (e) {
            console.error('Groq error:', e);
            setError('Unable to generate scam analysis. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const risk = RISK[scam.risk_level] || RISK.Medium;

    const LOAD_PHASES = [
        { label: 'Connecting to Groq AI…', sub: 'Establishing secure connection' },
        { label: 'Analysing scam pattern…', sub: 'Reviewing reported cases from ' + scam.city },
        { label: 'Compiling safety guide…', sub: 'Writing prevention tips & expert advice' },
    ];
    const currentPhase = LOAD_PHASES[Math.min(phase, 2)];

    return (
        <div className="sd-page">

            {/* ══ Topbar ══ */}
            <div className="sd-topbar">
                <div className="container sd-topbar-inner">
                    <button className="sd-back-btn" onClick={onBack}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to Scams
                    </button>
                    <div className="sd-nav-brand">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                        Travel Safe
                    </div>
                </div>
            </div>

            {/* ══ Hero Header ══ */}
            <header className="sd-header">
                <div className="sd-header-glow" />
                <div className="container sd-header-inner">

                    {/* Breadcrumb */}
                    <nav className="sd-breadcrumb" aria-label="breadcrumb">
                        <span>Travel Safe</span>
                        <span className="sd-bc-sep">›</span>
                        <span>{scam.state}</span>
                        <span className="sd-bc-sep">›</span>
                        <span className="sd-bc-active">{scam.scam_type}</span>
                    </nav>

                    {/* Compact info bar */}
                    <div className="sd-info-bar">
                        <span className="sd-risk-pill" style={{ background: risk.bg, borderColor: risk.border, color: risk.color }}>
                            <span className="sd-risk-dot" style={{ background: risk.color }} />
                            {risk.label}
                        </span>
                        <span className="sd-info-sep" />
                        <span className="sd-meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                            {scam.city}, {scam.state}
                        </span>
                        <span className="sd-info-sep" />
                        <span className="sd-meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Reported {scam.reported_year}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="sd-title">{scam.scam_type}</h1>
                    <p className="sd-subtitle">{scam.description}</p>

                    {/* AI badge */}
                    <div className="sd-ai-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        AI-Powered Safety Analysis · Groq
                    </div>
                </div>
            </header>

            {/* ══ Content ══ */}
            <main className="container sd-main">

                {loading ? (
                    /* ── Loading ── */
                    <div className="sd-loading">
                        <div className="sd-loading-ring">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        </div>
                        <div className="sd-loading-text">
                            <h3 className="sd-loading-title">{currentPhase.label}</h3>
                            <p className="sd-loading-sub">{currentPhase.sub}</p>
                        </div>
                        <div className="sd-loading-steps">
                            {LOAD_PHASES.map((p, i) => (
                                <div key={i} className={`sd-step ${i <= phase ? 'sd-step--done' : ''} ${i === phase ? 'sd-step--active' : ''}`}>
                                    <span className="sd-step-dot" />
                                    <span className="sd-step-label">{p.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                ) : error ? (
                    /* ── Error alert ── */
                    <div className="sd-alert">
                        <div className="sd-alert-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div className="sd-alert-body">
                            <p className="sd-alert-title">Unable to Load Analysis</p>
                            <p className="sd-alert-msg">{error}</p>
                        </div>
                        <button className="sd-alert-retry" onClick={fetchGroqData}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.95" />
                            </svg>
                            Retry
                        </button>
                    </div>

                ) : data ? (
                    <div className="sd-sections">

                        {/* ── Overview ── */}
                        <div className="sd-overview-card">
                            <div className="sd-overview-top">
                                <p className="sd-overline">How This Scam Works</p>
                                <div className="sd-groq-tag">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                    Groq AI
                                </div>
                            </div>
                            <p className="sd-overview-text">{data.overview}</p>

                            {data.traveler_tip && (
                                <>
                                    <div className="sd-section-divider" />
                                    <div className="sd-mantra">
                                        <div className="sd-mantra-left">
                                            <span className="sd-mantra-label">Safety Mantra</span>
                                            <p className="sd-mantra-text">"{data.traveler_tip}"</p>
                                        </div>
                                        <span className="sd-mantra-emoji">💡</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── 4-card info grid ── */}
                        <div className="sd-grid">
                            <InfoSection
                                icon="⚠️"
                                title="Warning Signs"
                                items={data.warning_signs || []}
                                accentColor="#d97706"
                                borderColor="#fde68a"
                            />
                            <InfoSection
                                icon="🛡️"
                                title="Prevention Tips"
                                items={data.prevention_tips || []}
                                accentColor="#16a34a"
                                borderColor="#bbf7d0"
                            />
                            <InfoSection
                                icon="🆘"
                                title="If You're Targeted"
                                items={data.what_to_do_if_targeted || []}
                                accentColor="#2563eb"
                                borderColor="#bfdbfe"
                            />
                            <InfoSection
                                icon="🚨"
                                title="If You're a Victim"
                                items={data.what_to_do_if_victim || []}
                                accentColor="#dc2626"
                                borderColor="#fecaca"
                            />
                        </div>

                        <div className="sd-bottom-divider" />

                        {/* ── Authorities ── */}
                        {data.local_authorities && (
                            <div className="sd-authority-card">
                                <div className="sd-authority-icon-wrap">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l1.28-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <div className="sd-authority-body">
                                    <p className="sd-overline">Who to Contact</p>
                                    <p className="sd-authority-text">{data.local_authorities}</p>
                                </div>
                            </div>
                        )}

                        {/* ── Emergency dial ── */}
                        <div className="sd-emg-section">
                            <p className="sd-overline" style={{ marginBottom: '1rem' }}>Quick Dial — Emergency Contacts</p>
                            <div className="sd-emergency-row">
                                {[
                                    { label: 'Police', num: '100', icon: '🛡️' },
                                    { label: 'Ambulance', num: '102', icon: '🚑' },
                                    { label: 'Fire Brigade', num: '101', icon: '🔥' },
                                    { label: 'Tourist Helpline', num: '1800111363', icon: '📞' },
                                ].map(({ label, num, icon }) => (
                                    <button
                                        key={label}
                                        className="sd-emg-btn"
                                        onClick={() => { window.location.href = `tel:${num}`; }}
                                    >
                                        <span className="sd-emg-icon">{icon}</span>
                                        <span className="sd-emg-num">{num}</span>
                                        <span className="sd-emg-label">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                ) : null}
            </main>

            <footer className="footer">
                <div className="container">
                    <p>&copy; 2024 Travel Mint. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default ScamDetail;
