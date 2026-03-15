import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchFlights, indianAirports, formatFlightTime, flightDuration, statusColor } from '../utils/flightService';
import { searchTrainsFromDB, stationList, trainClassOptions } from '../utils/trainService';
import './SearchPlatform.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const PAX_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
const CABIN_OPTIONS = [
    { value: 'economy', label: 'Economy' },
    { value: 'premium_economy', label: 'Premium Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First Class' },
];
const todayStr = () => new Date().toISOString().split('T')[0];

// ─── Filtered suggestions ─────────────────────────────────────────────────────
function filterAirports(q) {
    const ql = q.toLowerCase();
    return indianAirports.filter(a =>
        a.city.toLowerCase().includes(ql) ||
        a.iata.toLowerCase().includes(ql) ||
        a.name.toLowerCase().includes(ql)
    ).slice(0, 6);
}
function filterStations(q) {
    const ql = q.toLowerCase();
    return stationList.filter(s =>
        s.name.toLowerCase().includes(ql) || s.code.toLowerCase().includes(ql)
    ).slice(0, 6);
}

// ─── AutocompleteField ────────────────────────────────────────────────────────
function AutoField({ label, value, onChange, onSelect, suggestions, placeholder }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);
    return (
        <div className="bk-field" ref={ref}>
            <div className="bk-field-label">{label}</div>
            <input
                className="bk-input"
                type="text"
                value={value}
                placeholder={placeholder}
                autoComplete="off"
                spellCheck="false"
                onChange={e => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
            />
            {open && suggestions.length > 0 && (
                <ul className="bk-dropdown">
                    {suggestions.map((s, i) => (
                        <li key={i} className="bk-dd-item" onMouseDown={() => { onSelect(s); setOpen(false); }}>
                            <span className="bk-dd-code">{s.iata || s.code}</span>
                            <span className="bk-dd-text">
                                {s.city || s.name}
                                <span className="bk-dd-sub">{s.name}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ label, color }) {
    return (
        <span className="bk-status-badge" style={{ color, background: color + '14', borderColor: color + '30' }}>
            {label}
        </span>
    );
}

// ─── Flight Result Card ───────────────────────────────────────────────────────
function FlightCard({ flight, i }) {
    const dep = formatFlightTime(flight.departure.scheduled);
    const arr = formatFlightTime(flight.arrival.scheduled);
    const dur = flightDuration(flight.departure.scheduled, flight.arrival.scheduled);
    const sc = statusColor(flight.status);
    const status = (flight.status || 'scheduled');
    const bookUrl = `https://www.makemytrip.com/flight/search?itinerary=${flight.departure.iata}-${flight.arrival.iata}-${(flight.departure.scheduled || '').split('T')[0]}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E&lang=eng`;

    return (
        <motion.div className="bk-result-card"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}>

            <div className="bk-rc-header">
                <div className="bk-rc-carrier">
                    <div className="bk-rc-logo">
                        {flight.airlineIata && (
                            <img src={`https://content.airhex.com/content/logos/thumbnails_${flight.airlineIata}_40_40_r.png`}
                                alt="" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        )}
                        <div className="bk-rc-initials" style={{ display: flight.airlineIata ? 'none' : 'flex' }}>
                            {(flight.airline || 'FL').slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <div className="bk-rc-name">
                            {flight.airline}
                            {flight.isMock && <span className="bk-demo-chip">DEMO</span>}
                        </div>
                        <div className="bk-rc-num">{flight.flightNumber}</div>
                    </div>
                </div>
                <StatusBadge label={status.charAt(0).toUpperCase() + status.slice(1)} color={sc} />
            </div>

            <div className="bk-rc-route">
                <div className="bk-rc-pt">
                    <div className="bk-rc-time">{dep}</div>
                    <div className="bk-rc-iata">{flight.departure.iata}</div>
                    {flight.departure.terminal && <div className="bk-rc-sub">T{flight.departure.terminal}</div>}
                </div>
                <div className="bk-rc-mid">
                    <div className="bk-rc-dur">{dur}</div>
                    <div className="bk-rc-line">
                        <div className="bk-rc-dot" />
                        <div className="bk-rc-bar" />
                        <div className="bk-rc-plane-svg">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
                            </svg>
                        </div>
                        <div className="bk-rc-bar" />
                        <div className="bk-rc-dot" />
                    </div>
                    <div className="bk-rc-sub">Non-stop</div>
                </div>
                <div className="bk-rc-pt bk-rc-pt-r">
                    <div className="bk-rc-time">{arr}</div>
                    <div className="bk-rc-iata">{flight.arrival.iata}</div>
                    {flight.arrival.terminal && <div className="bk-rc-sub">T{flight.arrival.terminal}</div>}
                </div>
            </div>

            {flight.departure.delay > 0 && (
                <div className="bk-rc-delay">Delayed {flight.departure.delay} min</div>
            )}

            <div className="bk-rc-foot">
                <div className="bk-rc-tags">
                    {flight.aircraft && <span className="bk-tag">{flight.aircraft}</span>}
                    {flight.departure.gate && <span className="bk-tag">Gate {flight.departure.gate}</span>}
                </div>
                <a href={bookUrl} target="_blank" rel="noopener noreferrer" className="bk-book-btn">
                    Book Now
                </a>
            </div>
        </motion.div>
    );
}

// ─── Train Result Card ────────────────────────────────────────────────────────
function TrainCard({ train, i }) {
    const availColor = () => {
        const a = String(train.availability || '').toLowerCase();
        if (a.includes('avail')) return '#16a34a';
        if (a.includes('rac')) return '#d97706';
        if (a.includes('wl')) return '#dc2626';
        return '#6b7280';
    };
    return (
        <motion.div className="bk-result-card"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}>

            <div className="bk-rc-header">
                <div className="bk-rc-carrier">
                    <div className="bk-rc-logo bk-train-logo">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M12 2C8 2 4 2.5 4 6v9.5A2.5 2.5 0 006.5 18h.2l-1.45 1.45.71.71L7.91 18h8.18l1.95 1.95.71-.71L17.3 18h.2A2.5 2.5 0 0020 15.5V6c0-3.5-4-4-8-4zm-4.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM6 13V7h5v6H6zm7 0V7h5v6h-5z" />
                        </svg>
                    </div>
                    <div>
                        <div className="bk-rc-name">
                            {train.trainName}
                            {train.isMock && <span className="bk-demo-chip">DEMO</span>}
                        </div>
                        <div className="bk-rc-num">#{train.trainNumber} · {train.trainType}</div>
                    </div>
                </div>
                <StatusBadge label={String(train.availability || 'Check')} color={availColor()} />
            </div>

            <div className="bk-rc-route">
                <div className="bk-rc-pt">
                    <div className="bk-rc-time">{train.departure}</div>
                    <div className="bk-rc-iata">{String(train.fromStation).slice(0, 12)}</div>
                </div>
                <div className="bk-rc-mid">
                    <div className="bk-rc-dur">{train.duration}</div>
                    <div className="bk-rc-line">
                        <div className="bk-rc-dot" /><div className="bk-rc-bar" />
                        <div className="bk-rc-plane-svg" style={{ color: '#9ca3af' }}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M12 2C8 2 4 2.5 4 6v9.5A2.5 2.5 0 006.5 18h11A2.5 2.5 0 0020 15.5V6c0-3.5-4-4-8-4zM6 13V7h5v6H6zm7 0V7h5v6h-5z" />
                            </svg>
                        </div>
                        <div className="bk-rc-bar" /><div className="bk-rc-dot" />
                    </div>
                    {train.distance && <div className="bk-rc-sub">{train.distance} km</div>}
                </div>
                <div className="bk-rc-pt bk-rc-pt-r">
                    <div className="bk-rc-time">{train.arrival}</div>
                    <div className="bk-rc-iata">{String(train.toStation).slice(0, 12)}</div>
                </div>
            </div>

            <div className="bk-rc-foot">
                <div className="bk-rc-tags">
                    {train.requestedClass && <span className="bk-tag bk-tag-class">{train.requestedClass}</span>}
                    {train.fare && <span className="bk-tag bk-tag-fare">{train.fare}</span>}
                    <span className="bk-tag">{train.runningDays}</span>
                </div>
                <a href="https://www.irctc.co.in/nget/train-search" target="_blank" rel="noopener noreferrer" className="bk-book-btn bk-book-outline">
                    Book on IRCTC
                </a>
            </div>
        </motion.div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const SearchPlatform = ({ initialMode = 'flight', onBack }) => {
    const [mode, setMode] = useState(initialMode);

    const [fromAp, setFromAp] = useState(''); const [fromApO, setFromApO] = useState(null);
    const [toAp, setToAp] = useState(''); const [toApO, setToApO] = useState(null);
    const [fDate, setFDate] = useState(todayStr());
    const [pax, setPax] = useState(1);
    const [cabin, setCabin] = useState('economy');

    const [fromSt, setFromSt] = useState('');
    const [toSt, setToSt] = useState('');
    const [fromStO, setFromStO] = useState(null);
    const [toStO, setToStO] = useState(null);
    const [tDate, setTDate] = useState(todayStr());
    const [tClass, setTClass] = useState('SL');
    const [tPax, setTPax] = useState(1);

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const resultRef = useRef(null);

    const swap = () => {
        if (mode === 'flight') {
            [setFromAp, setToAp].forEach((fn, i) => fn([toAp, fromAp][i]));
            setFromApO(toApO); setToApO(fromApO);
        } else {
            [setFromSt, setToSt].forEach((fn, i) => fn([toSt, fromSt][i]));
            setFromStO(toStO); setToStO(fromStO);
        }
    };

    const runSearch = async () => {
        setError(''); setResults([]); setSearched(false);
        if (mode === 'flight') {
            if (!fromApO || !toApO) { setError('Please select departure and arrival airports from the suggestions.'); return; }
            setLoading(true);
            try {
                const d = await searchFlights({ fromIata: fromApO.iata, toIata: toApO.iata, date: fDate });
                setResults(d); setSearched(true);
                if (!d.length) setError('No flights found for this route. Try different dates.');
            } catch (e) { setError(e.message || 'Failed to load flights.'); }
            finally { setLoading(false); scroll(); }
        } else {
            if (!fromSt.trim() || !toSt.trim()) { setError('Please enter departure and arrival stations.'); return; }
            setLoading(true);
            try {
                const d = await searchTrainsFromDB({
                    fromStation: fromStO?.name || fromSt,
                    toStation: toStO?.name || toSt,
                    date: tDate, travelClass: tClass,
                });
                setResults(d); setSearched(true);
                if (!d.length) setError('No trains found. Try a different route.');
            } catch (e) { setError(e.message || 'Failed to load trains.'); }
            finally { setLoading(false); scroll(); }
        }
    };

    const scroll = () => setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    const switchMode = m => { setMode(m); setResults([]); setError(''); setSearched(false); };

    const apFrom = fromAp.length >= 1 ? filterAirports(fromAp) : [];
    const apTo = toAp.length >= 1 ? filterAirports(toAp) : [];
    const stFrom = fromSt.length >= 1 ? filterStations(fromSt) : [];
    const stTo = toSt.length >= 1 ? filterStations(toSt) : [];

    return (
        <div className="bk-page">

            {/* Top nav */}
            <div className="bk-topbar">
                <button className="bk-back" onClick={onBack}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back
                </button>
                <div className="bk-brand">
                    <span className="bk-brand-name">TravelMint</span>
                    <span className="bk-brand-divider" />
                    <span className="bk-brand-sub">Routes &amp; Fares</span>
                </div>
                <div className="bk-topbar-right" />
            </div>

            {/* Hero headline */}
            <div className="bk-hero">
                <h1 className="bk-headline">Book Flights &amp; Trains</h1>
                <p className="bk-tagline">Real-time schedules &nbsp;·&nbsp; Instant booking &nbsp;·&nbsp; Best fares</p>
            </div>

            {/* Mode pills */}
            <div className="bk-tabs-row">
                <button className={`bk-tab ${mode === 'flight' ? 'bk-tab-on' : ''}`} onClick={() => switchMode('flight')}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style={{ marginRight: 6 }}>
                        <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
                    </svg>
                    Flights
                </button>
                <button className={`bk-tab ${mode === 'train' ? 'bk-tab-on' : ''}`} onClick={() => switchMode('train')}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style={{ marginRight: 6 }}>
                        <path d="M12 2C8 2 4 2.5 4 6v9.5A2.5 2.5 0 006.5 18h.2l-1.45 1.45.71.71L7.91 18h8.18l1.95 1.95.71-.71L17.3 18h.2A2.5 2.5 0 0020 15.5V6c0-3.5-4-4-8-4zm-4.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM6 13V7h5v6H6zm7 0V7h5v6h-5z" />
                    </svg>
                    Trains
                </button>
            </div>

            {/* ── BOOKING BAR ── */}
            <AnimatePresence mode="wait">
                <motion.div key={mode} className="bk-bar-wrap"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

                    <div className="bk-bar">
                        {mode === 'flight' ? (
                            <>
                                <AutoField label="From" value={fromAp} suggestions={apFrom} placeholder="City or airport"
                                    onChange={v => { setFromAp(v); setFromApO(null); }}
                                    onSelect={s => { setFromApO(s); setFromAp(`${s.city} (${s.iata})`); }} />

                                <button className="bk-swap" onClick={swap} title="Swap origin and destination">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </button>

                                <AutoField label="To" value={toAp} suggestions={apTo} placeholder="City or airport"
                                    onChange={v => { setToAp(v); setToApO(null); }}
                                    onSelect={s => { setToApO(s); setToAp(`${s.city} (${s.iata})`); }} />

                                <div className="bk-divider" />

                                <div className="bk-field">
                                    <div className="bk-field-label">Departure</div>
                                    <input className="bk-input" type="date" value={fDate} min={todayStr()} onChange={e => setFDate(e.target.value)} />
                                </div>

                                <div className="bk-divider" />

                                <div className="bk-field bk-field-sm">
                                    <div className="bk-field-label">Passengers</div>
                                    <select className="bk-input bk-select" value={pax} onChange={e => setPax(+e.target.value)}>
                                        {PAX_OPTIONS.map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
                                    </select>
                                </div>

                                <div className="bk-divider" />

                                <div className="bk-field bk-field-sm">
                                    <div className="bk-field-label">Class</div>
                                    <select className="bk-input bk-select" value={cabin} onChange={e => setCabin(e.target.value)}>
                                        {CABIN_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <AutoField label="From Station" value={fromSt} suggestions={stFrom} placeholder="Station name or code"
                                    onChange={v => { setFromSt(v); setFromStO(null); }}
                                    onSelect={s => { setFromStO(s); setFromSt(`${s.name} (${s.code})`); }} />

                                <button className="bk-swap" onClick={swap} title="Swap stations">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </button>

                                <AutoField label="To Station" value={toSt} suggestions={stTo} placeholder="Station name or code"
                                    onChange={v => { setToSt(v); setToStO(null); }}
                                    onSelect={s => { setToStO(s); setToSt(`${s.name} (${s.code})`); }} />

                                <div className="bk-divider" />

                                <div className="bk-field">
                                    <div className="bk-field-label">Date of Journey</div>
                                    <input className="bk-input" type="date" value={tDate} min={todayStr()} onChange={e => setTDate(e.target.value)} />
                                </div>

                                <div className="bk-divider" />

                                <div className="bk-field bk-field-sm">
                                    <div className="bk-field-label">Class</div>
                                    <select className="bk-input bk-select" value={tClass} onChange={e => setTClass(e.target.value)}>
                                        {trainClassOptions.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                                    </select>
                                </div>

                                <div className="bk-divider" />

                                <div className="bk-field bk-field-sm">
                                    <div className="bk-field-label">Passengers</div>
                                    <select className="bk-input bk-select" value={tPax} onChange={e => setTPax(+e.target.value)}>
                                        {PAX_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Search button — part of bar on desktop */}
                        <button className="bk-search-btn" onClick={runSearch} disabled={loading}>
                            {loading ? <span className="bk-spinner" /> : 'Search'}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>


            {/* Error */}
            {error && (
                <motion.div className="bk-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                </motion.div>
            )}

            {/* Results */}
            <div ref={resultRef} className="bk-results-wrap">
                {searched && results.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                        <div className="bk-results-meta">
                            <div>
                                <div className="bk-results-count">{results.length} {mode === 'flight' ? 'Flights' : 'Trains'} found</div>
                                <div className="bk-results-route">
                                    {mode === 'flight'
                                        ? `${fromApO?.city || '?'} → ${toApO?.city || '?'} · ${fDate} · ${pax} passenger${pax > 1 ? 's' : ''} · ${cabin}`
                                        : `${fromStO?.name || fromSt} → ${toStO?.name || toSt} · ${tDate} · ${tClass}`}
                                </div>
                            </div>
                        </div>
                        <div className="bk-results-list">
                            {results.map((item, i) =>
                                mode === 'flight'
                                    ? <FlightCard key={item.id || i} flight={item} i={i} />
                                    : <TrainCard key={item.id || i} train={item} i={i} />
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SearchPlatform;
