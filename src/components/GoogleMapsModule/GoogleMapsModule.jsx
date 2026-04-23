import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GoogleMapsModule.css';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* ── Load Maps JS API script once (no extra libraries needed) ─── */
let _scriptPromise = null;

function loadGoogleMapsScript(apiKey) {
    if (_scriptPromise) return _scriptPromise;

    _scriptPromise = new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        // No `libraries=places` — we only need core Maps + Geocoding API
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Google Maps script failed to load'));
        document.head.appendChild(script);
    });

    return _scriptPromise;
}

/* ── Quick-search suggestions (static popular Indian destinations) */
const SUGGESTIONS = [
    'Rajasthan', 'Goa', 'Kerala', 'Himachal Pradesh', 'Uttarakhand',
    'Jaipur', 'Udaipur', 'Varanasi', 'Agra', 'Manali', 'Shimla',
    'Rishikesh', 'Munnar', 'Coorg', 'Ooty', 'Darjeeling',
];

/* ── Component ─────────────────────────────────────────────────── */
const GoogleMapsModule = ({ onBack }) => {
    const mapRef       = useRef(null);
    const mapInstance  = useRef(null);
    const markerRef    = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [status,      setStatus]      = useState('loading'); // loading | ready | error
    const [errorMsg,    setErrorMsg]    = useState('');
    const [searching,   setSearching]   = useState(false);
    const [filteredSug, setFilteredSug] = useState([]);
    const [showSug,     setShowSug]     = useState(false);

    /* ── Init map ── */
    const initMap = useCallback(() => {
        if (!mapRef.current) return;

        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: 20.5937, lng: 78.9629 }, // centre of India
            zoom: 5,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControlOptions: {
                position: window.google.maps.ControlPosition.RIGHT_CENTER,
            },
        });

        setStatus('ready');
    }, []);

    useEffect(() => {
        if (!API_KEY) {
            setStatus('error');
            setErrorMsg('VITE_GOOGLE_MAPS_API_KEY is missing in your .env file.');
            return;
        }

        loadGoogleMapsScript(API_KEY)
            .then(initMap)
            .catch((err) => {
                console.error(err);
                setStatus('error');
                setErrorMsg('Failed to load Google Maps. Check your API key and billing.');
            });
    }, [initMap]);

    /* ── Geocode and pan map to a place ── */
    const goToPlace = useCallback((query) => {
        if (!query.trim() || !mapInstance.current) return;

        setSearching(true);
        setShowSug(false);

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: `${query}, India` }, (results, geoStatus) => {
            setSearching(false);
            if (geoStatus === 'OK' && results[0]) {
                const location = results[0].geometry.location;

                // Drop/move marker
                if (markerRef.current) {
                    markerRef.current.setMap(null);
                }
                markerRef.current = new window.google.maps.Marker({
                    map: mapInstance.current,
                    position: location,
                    title: query,
                    animation: window.google.maps.Animation.DROP,
                });

                mapInstance.current.setCenter(location);
                mapInstance.current.setZoom(11);
            } else {
                alert(`"${query}" not found. Try a different name.`);
            }
        });
    }, []);

    /* ── Search bar handlers ── */
    const handleInputChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);

        if (val.trim().length > 0) {
            const matches = SUGGESTIONS.filter(s =>
                s.toLowerCase().includes(val.toLowerCase())
            );
            setFilteredSug(matches);
            setShowSug(matches.length > 0);
        } else {
            setShowSug(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (status === 'ready') goToPlace(searchQuery);
    };

    const handleSuggestionClick = (sug) => {
        setSearchQuery(sug);
        setShowSug(false);
        goToPlace(sug);
    };

    /* ── Quick-chips for popular spots ── */
    const QUICK_CHIPS = ['Rajasthan', 'Goa', 'Kerala', 'Himachal Pradesh', 'Uttarakhand'];

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
                        <h1 className="tm-header-title">Maps &amp; Places</h1>
                        <p className="tm-header-sub">Explore destinations across India</p>
                    </div>
                </div>
            </header>

            {/* ── Search Bar + Chips ── */}
            <div className="gm-search-wrapper">
                <div className="gm-search-outer">
                    <form className="gm-search-form" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="gm-search-input"
                            placeholder="Search places, states, cities…"
                            value={searchQuery}
                            onChange={handleInputChange}
                            onBlur={() => setTimeout(() => setShowSug(false), 150)}
                            onFocus={() => filteredSug.length > 0 && setShowSug(true)}
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            className="gm-search-btn"
                            aria-label="Search"
                            disabled={searching || status !== 'ready'}
                        >
                            {searching ? (
                                <div className="gm-btn-spinner" />
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            )}
                        </button>
                    </form>

                    {/* Autocomplete dropdown */}
                    {showSug && (
                        <ul className="gm-suggestions">
                            {filteredSug.map(sug => (
                                <li
                                    key={sug}
                                    className="gm-suggestion-item"
                                    onMouseDown={() => handleSuggestionClick(sug)}
                                >
                                    <span className="gm-sug-pin">📍</span> {sug}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Quick-access chips */}
                <div className="gm-chips">
                    {QUICK_CHIPS.map(chip => (
                        <button
                            key={chip}
                            className="gm-chip"
                            onClick={() => { setSearchQuery(chip); goToPlace(chip); }}
                            disabled={status !== 'ready'}
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Map ── */}
            <div className="gm-map-container">
                <div
                    ref={mapRef}
                    style={{ width: '100%', height: '100%', display: status === 'error' ? 'none' : 'block' }}
                />

                {status === 'loading' && (
                    <div className="gm-overlay">
                        <div className="gm-spinner" />
                        <p>Loading map…</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="gm-no-key">
                        <div className="gm-error-icon">🗺️</div>
                        <h3>Map Unavailable</h3>
                        <p>{errorMsg}</p>
                        <ul className="gm-error-tips">
                            <li>✅ Enable <strong>Maps JavaScript API</strong> in Google Cloud Console</li>
                            <li>✅ Enable <strong>Geocoding API</strong></li>
                            <li>✅ Ensure billing is active on your Google account</li>
                            <li>✅ Allow <code>localhost:5173</code> in API key HTTP referrers</li>
                            <li>✅ Wait ~5 min after saving key settings</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleMapsModule;
