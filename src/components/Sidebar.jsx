import React from 'react';
import './Sidebar.css';

const MODULES = [
    {
        id: 'travel-safe',
        label: 'Travel Safe',
        desc: 'Scam alerts & emergency contacts',
        accentColor: '#16a34a',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        ),
    },
    {
        id: 'trip-mint',
        label: 'TripMint AI',
        desc: 'AI Travel Assistant ✨',
        accentColor: '#14b8a6', // Teal 500
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8" y2="16" />
                <line x1="16" y1="16" x2="16" y2="16" />
            </svg>
        ),
    },
    {
        id: 'plan-my-trip',
        label: 'Plan My Trip',
        desc: 'Generate a personalised trip plan',
        accentColor: '#2563eb',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        id: 'maps-module',
        label: 'Maps & Places',
        desc: 'Find locations & directions',
        accentColor: '#f59e0b',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        ),
    },
];

/**
 * Unified right-side slide-in drawer.
 * On mobile it shows nav links + modules. On desktop only modules.
 *
 * Props:
 *   open (bool)              - whether drawer is visible
 *   onClose (fn)             - close the drawer
 *   onHome (fn)              - navigate home
 *   onStateClick (fn)        - navigate to a state
 *   onFaresClick (fn)        - navigate to fares
 *   onTravelSafeClick (fn)   - open Travel Safe full page
 *   onTripMintClick (fn)     - open TripMint chatbot full page
 *   onPlanMyTripClick (fn)   - open Plan My Trip full page
 *   onMapsClick (fn)         - open Maps module full page
 */
const Sidebar = ({ open, onClose, onHome, onStateClick, onFaresClick, onTravelSafeClick, onTripMintClick, onPlanMyTripClick, onMapsClick }) => {
    const handleNav = (fn) => {
        onClose();
        fn?.();
    };

    const handleModuleClick = (moduleId) => {
        onClose();
        if (moduleId === 'travel-safe') onTravelSafeClick?.();
        if (moduleId === 'trip-mint') onTripMintClick?.();
        if (moduleId === 'plan-my-trip') onPlanMyTripClick?.();
        if (moduleId === 'maps-module') onMapsClick?.();
    };

    return (
        <>
            {/* Dark overlay — tap to close */}
            <div
                className={`sb-overlay ${open ? 'visible' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <aside className={`sb-drawer ${open ? 'open' : ''}`} aria-label="Navigation panel">

                {/* Header */}
                <div className="sb-header">
                    <div className="sb-header-left">
                        <span className="sb-logo-dot" />
                        <span className="sb-header-title">Menu</span>
                    </div>
                    <button className="sb-close-btn" onClick={onClose} aria-label="Close panel">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* ── Navigation links (visible only on mobile, hidden on desktop via CSS) ── */}
                <nav className="sb-nav-links" aria-label="Main navigation">
                    <p className="sb-section-label">Navigate</p>
                    {[
                        { label: 'Home', fn: onHome, icon: '🏠' },
                        { label: 'Rajasthan', fn: () => onStateClick?.('rajasthan'), icon: '🏜️' },
                        { label: 'Himachal Pradesh', fn: () => onStateClick?.('himachal'), icon: '🏔️' },
                        { label: 'Uttarakhand', fn: () => onStateClick?.('uttarakhand'), icon: '🌿' },
                        { label: '✈ Fares & Routes', fn: () => onFaresClick?.('flight'), icon: null, accent: true },
                    ].map(({ label, fn, icon, accent }) => (
                        <button
                            key={label}
                            className={`sb-nav-item ${accent ? 'sb-nav-item--accent' : ''}`}
                            onClick={() => handleNav(fn)}
                        >
                            {icon && <span className="sb-nav-item-icon">{icon}</span>}
                            <span className="sb-nav-item-label">{label}</span>
                            <svg className="sb-item-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    ))}
                </nav>

                {/* ── Safety Modules ── */}
                <p className="sb-section-label">Safety</p>
                <nav className="sb-nav">
                    {MODULES.map(mod => (
                        <button
                            key={mod.id}
                            className="sb-item"
                            onClick={() => handleModuleClick(mod.id)}
                        >
                            <span className="sb-item-icon" style={{ color: mod.accentColor }}>
                                {mod.icon}
                            </span>
                            <span className="sb-item-body">
                                <span className="sb-item-label">{mod.label}</span>
                                <span className="sb-item-desc">{mod.desc}</span>
                            </span>
                            <svg className="sb-item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sb-footer">
                    <p className="sb-footer-text">More features coming soon</p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
