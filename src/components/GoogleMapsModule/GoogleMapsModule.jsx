import React, { useState } from 'react';
import './GoogleMapsModule.css';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const GoogleMapsModule = ({ onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuery, setActiveQuery] = useState('India');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setActiveQuery(searchQuery.trim());
        }
    };

    return (
        <div className="gm-root">
            {/* ── Header ── */}
            <header className="tm-header">
                <button className="tm-back-btn" onClick={onBack} aria-label="Go back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div className="tm-header-info">
                    <div className="tm-header-avatar map-avatar">🗺️</div>
                    <div>
                        <h1 className="tm-header-title">Maps & Places</h1>
                        <p className="tm-header-sub">Search destinations & nearby places</p>
                    </div>
                </div>
            </header>

            {/* ── Search Bar ── */}
            <div className="gm-search-wrapper">
                <form className="gm-search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="gm-search-input"
                        placeholder="Search for places, hotels, or restaurants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="gm-search-btn" aria-label="Search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </form>
            </div>

            {/* ── Map Iframe ── */}
            <div className="gm-map-container">
                {API_KEY ? (
                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(activeQuery)}`}
                    ></iframe>
                ) : (
                    <div className="gm-no-key">
                        <p>Google Maps API Key depends on `VITE_GOOGLE_MAPS_API_KEY` in .env</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleMapsModule;
