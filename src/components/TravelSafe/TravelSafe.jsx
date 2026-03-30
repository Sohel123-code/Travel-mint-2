import React, { useState, useEffect } from 'react';
import ScamDetail from '../ScamDetail/ScamDetail';
import './TravelSafe.css';

/* ── Static data ───────────────────────────────────────────────── */
const STATES = [
    { id: 'rajasthan', label: 'Rajasthan', subtitle: 'The Land of Kings', file: '/data/scam_rajasthan.csv' },
    { id: 'himachal', label: 'Himachal Pradesh', subtitle: 'The Abode of Snow', file: '/data/scam_himachal.csv' },
    { id: 'uttarakhand', label: 'Uttarakhand', subtitle: 'The Land of Gods', file: '/data/scam_uttarakhand.csv' },
];

const RISK_COLOR = {
    High: { bg: '#fff5f5', border: '#fecaca', dot: '#dc2626', text: '#991b1b' },
    Medium: { bg: '#fffbeb', border: '#fde68a', dot: '#d97706', text: '#92400e' },
    Low: { bg: '#f0fdf4', border: '#bbf7d0', dot: '#16a34a', text: '#166534' },
};

const EMERGENCY = [
    {
        key: 'police',
        label: 'Police',
        number: '100',
        desc: 'Law & order emergency',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
    },
    {
        key: 'ambulance',
        label: 'Ambulance',
        number: '102',
        desc: 'Medical emergency',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
        ),
    },
    {
        key: 'fire',
        label: 'Fire Brigade',
        number: '101',
        desc: 'Fire & rescue services',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
        ),
    },
];

/* ── CSV parser ────────────────────────────────────────────────── */
const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        // handle values that may contain commas inside quotes
        const values = [];
        let current = '';
        let inQuotes = false;
        for (const ch of line) {
            if (ch === '"') { inQuotes = !inQuotes; }
            else if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
            else { current += ch; }
        }
        values.push(current.trim());
        return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
    });
};

/* ── Component ─────────────────────────────────────────────────── */
const TravelSafe = ({ initialStateId, onBack }) => {
    const defaultTab = STATES.find(s => s.id === initialStateId)?.id || STATES[0].id;
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [scams, setScams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cityFilter, setCityFilter] = useState('All');
    const [selectedScam, setSelectedScam] = useState(null);

    useEffect(() => { loadCSV(activeTab); }, [activeTab]);

    const loadCSV = async (stateId) => {
        setLoading(true);
        setError(null);
        setScams([]);
        setCityFilter('All');

        const stateInfo = STATES.find(s => s.id === stateId);
        const baseUrl = import.meta.env.BASE_URL || '/';
        const filePath = `${baseUrl}${stateInfo.file.startsWith('/') ? stateInfo.file.slice(1) : stateInfo.file}`;
        
        try {
            const res = await fetch(filePath);
            if (!res.ok) throw new Error(`Failed to load ${filePath}`);
            const text = await res.text();
            const rows = parseCSV(text);
            setScams(rows);
        } catch (e) {
            console.error('CSV load error:', e);
            setError('Could not load scam data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const activeState = STATES.find(s => s.id === activeTab);

    /* ── If a scam is selected, show the detail page ── */
    if (selectedScam) {
        return (
            <ScamDetail
                scam={selectedScam}
                onBack={() => { setSelectedScam(null); window.scrollTo(0, 0); }}
            />
        );
    }

    // Unique cities for filter chips
    const cities = ['All', ...Array.from(new Set(scams.map(s => s.city))).sort()];

    const filtered = cityFilter === 'All'
        ? scams
        : scams.filter(s => s.city === cityFilter);

    return (
        <div className="ts-page">

            {/* ══ Nav strip ══ */}
            <div className="ts-nav-strip">
                <div className="container ts-nav-inner">
                    <button className="ts-back-btn" onClick={onBack}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back
                    </button>
                    <div className="ts-nav-brand">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                        Travel Safe
                    </div>
                </div>
            </div>

            {/* ══ Hero ══ */}
            <section className="ts-hero">
                <div className="ts-hero-overlay" />
                <div className="container ts-hero-content">
                    <p className="ts-hero-label animate-fade-up">Safety First</p>
                    <h1 className="ts-hero-title animate-fade-up">
                        Travel Safe<br />
                        <span className="ts-hero-italic">Know Before You Go</span>
                    </h1>
                    <p className="ts-hero-sub animate-fade-up">
                        Stay informed about common scams and keep emergency numbers close. Travel smart across India.
                    </p>
                </div>
            </section>

            <div className="ts-main container">

                {/* ── Emergency Contacts ── */}
                <section className="ts-section">
                    <div className="ts-section-label-row">
                        <span className="ts-overline">Always Ready</span>
                    </div>
                    <h2 className="ts-section-heading">Emergency Contacts</h2>
                    <p className="ts-section-desc">Tap any card to call directly. Available 24/7 across India.</p>

                    <div className="ts-emg-grid">
                        {EMERGENCY.map(e => (
                            <button
                                key={e.key}
                                className="ts-emg-card"
                                onClick={() => { window.location.href = `tel:${e.number}`; }}
                            >
                                <div className="ts-emg-icon">{e.icon}</div>
                                <div className="ts-emg-body">
                                    <span className="ts-emg-label">{e.label}</span>
                                    <span className="ts-emg-desc">{e.desc}</span>
                                </div>
                                <div className="ts-emg-right">
                                    <span className="ts-emg-number">{e.number}</span>
                                    <span className="ts-emg-call">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l1.28-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        Call Now
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <div className="ts-divider" />

                {/* ── Scam Alerts ── */}
                <section className="ts-section ts-section-scams">
                    <div className="ts-section-label-row">
                        <span className="ts-overline">Stay Aware</span>
                    </div>
                    <h2 className="ts-section-heading">Scam Alerts by Region</h2>
                    <p className="ts-section-desc">
                        Select a destination to view reported scams and how to protect yourself.
                    </p>

                    {/* State Tabs */}
                    <div className="ts-tabs">
                        {STATES.map(s => (
                            <button
                                key={s.id}
                                className={`ts-tab ${activeTab === s.id ? 'ts-tab--active' : ''}`}
                                onClick={() => setActiveTab(s.id)}
                            >
                                <span className="ts-tab-label">{s.label}</span>
                                <span className="ts-tab-sub">{s.subtitle}</span>
                            </button>
                        ))}
                    </div>

                    {/* City filter chips */}
                    {!loading && !error && scams.length > 0 && (
                        <div className="ts-city-filters">
                            {cities.map(city => (
                                <button
                                    key={city}
                                    className={`ts-city-chip ${cityFilter === city ? 'ts-city-chip--active' : ''}`}
                                    onClick={() => setCityFilter(city)}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Scam count badge */}
                    {!loading && !error && filtered.length > 0 && (
                        <p className="ts-count-badge">
                            Showing <strong>{filtered.length}</strong> scam{filtered.length !== 1 ? 's' : ''} in <strong>{cityFilter === 'All' ? activeState?.label : cityFilter}</strong>
                        </p>
                    )}

                    {/* Cards */}
                    <div className="ts-scams-area" aria-live="polite">
                        {loading ? (
                            <div className="ts-status">
                                <div className="ts-spinner" />
                                <p>Loading scam data for {activeState?.label}…</p>
                            </div>
                        ) : error ? (
                            <div className="ts-status ts-status--error">
                                <p>{error}</p>
                                <button className="btn-explore" style={{ marginTop: '1rem' }} onClick={() => loadCSV(activeTab)}>Retry</button>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="ts-status">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <p>No scams found for the selected filter.</p>
                            </div>
                        ) : (
                            <div className="ts-scam-grid">
                                {filtered.map((scam, i) => {
                                    const risk = RISK_COLOR[scam.risk_level] || RISK_COLOR.Medium;
                                    return (
                                        <div
                                            key={scam.id ?? i}
                                            className="ts-scam-card ts-scam-card--clickable animate-fade-up"
                                            style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }}
                                            onClick={() => { setSelectedScam(scam); window.scrollTo(0, 0); }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={e => e.key === 'Enter' && (setSelectedScam(scam), window.scrollTo(0, 0))}
                                        >
                                            <div className="ts-scam-accent-bar" />
                                            <div className="ts-scam-body">
                                                {/* Top row: city + risk badge */}
                                                <div className="ts-scam-meta">
                                                    <span className="ts-scam-city">📍 {scam.city}</span>
                                                    <span
                                                        className="ts-risk-badge"
                                                        style={{ background: risk.bg, border: `1px solid ${risk.border}`, color: risk.text }}
                                                    >
                                                        <span className="ts-risk-dot" style={{ background: risk.dot }} />
                                                        {scam.risk_level} Risk
                                                    </span>
                                                </div>

                                                <p className="ts-scam-overline">{scam.scam_type}</p>
                                                <h3 className="ts-scam-title">{scam.description}</h3>

                                                <div className="ts-scam-footer">
                                                    <span className="ts-scam-year">Reported {scam.reported_year}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <footer className="footer">
                <div className="container">
                    <p>&copy; 2024 Travel Mint. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default TravelSafe;
