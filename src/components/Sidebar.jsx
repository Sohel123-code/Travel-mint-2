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
    // ── Add future modules below ─────────────────────────────────────────
    // { id: 'itinerary', label: 'Trip Planner', desc: 'Plan your itinerary', accentColor: '#2563eb', icon: <svg>...</svg> },
];

/**
 * Right-side slide-in drawer (module list only).
 * Props:
 *   open (bool)              - whether drawer is visible
 *   onClose (fn)             - close the drawer
 *   onTravelSafeClick (fn)   - open Travel Safe full page
 */
const Sidebar = ({ open, onClose, onTravelSafeClick }) => {
    const handleModuleClick = (moduleId) => {
        onClose();
        if (moduleId === 'travel-safe') onTravelSafeClick?.();
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

                {/* Section label */}
                <p className="sb-section-label">Safety</p>

                {/* Module list */}
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
