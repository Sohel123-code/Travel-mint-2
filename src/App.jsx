import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StateSection from './components/StateSection';
import StateDetail from './components/StateDetail';
import RoutesAndFares from './components/RoutesAndFares';
import SearchPlatform from './components/SearchPlatform';
import Sidebar from './components/Sidebar';
import TravelSafe from './components/TravelSafe';
import TripMint from './components/TripMint';
import PlanMyTrip from './components/PlanMyTrip';
import './App.css';

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

function App() {
    const [selectedState, setSelectedState] = useState(null);
    const [showSearchPlatform, setShowSearchPlatform] = useState(false);
    const [showTravelSafe, setShowTravelSafe] = useState(false);
    const [showTripMint, setShowTripMint] = useState(false);
    const [showPlanMyTrip, setShowPlanMyTrip] = useState(false);
    const [searchMode, setSearchMode] = useState('flight');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [states, setStates] = useState([
        {
            id: 'rajasthan', title: 'Rajasthan', subtitle: 'The Land of Kings',
            description: 'Experience the regal splendor of Indias desert jewel. From the golden sands of the Thar to the majestic forts and palaces that whisper tales of valor and royalty.',
            image: 'https://images.unsplash.com/photo-1599661046289-e318878433ca?q=80&w=2000&auto=format&fit=crop',
            query: 'scenic Amber Fort Jaipur luxury architecture', color: '#C6A75E',
        },
        {
            id: 'himachal', title: 'Himachal Pradesh', subtitle: 'The Abode of Snow',
            description: 'Nestled in the lap of the Himalayas, Himachal offers a serene escape into lush valleys, snow-capped peaks, and crystalline rivers.',
            image: 'https://images.unsplash.com/photo-1626621341517-bbf3d926b12d?q=80&w=2000&auto=format&fit=crop',
            query: 'scenic Manali mountains snow nature luxury landscape', color: '#2C2C34',
        },
        {
            id: 'uttarakhand', title: 'Uttarakhand', subtitle: 'The Land of Gods',
            description: 'A spiritual and natural sanctuary where high altitude mountains meet emerald waters. Discover the tranquility of the Himalayas in its purest form.',
            image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=2000&auto=format&fit=crop',
            query: 'scenic Rishikesh mountains Ganga river nature landscape', color: '#C6A75E',
        },
    ]);

    useEffect(() => {
        if (!ACCESS_KEY) return;
        const fetchImages = async () => {
            try {
                const updated = await Promise.all(states.map(async (state) => {
                    const res = await fetch(
                        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(state.query)}&orientation=landscape&per_page=1`,
                        { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }
                    );
                    const data = await res.json();
                    if (data.results?.length > 0) return { ...state, image: data.results[0].urls.regular };
                    return state;
                }));
                setStates(updated);
            } catch (e) { console.error('Unsplash:', e); }
        };
        fetchImages();
    }, []);

    /* ── Navigation ── */
    const goHome = () => { setSelectedState(null); setShowSearchPlatform(false); setShowTravelSafe(false); setShowTripMint(false); setShowPlanMyTrip(false); };
    const openSearch = (mode) => { setSearchMode(mode || 'flight'); setShowSearchPlatform(true); setShowTravelSafe(false); setShowTripMint(false); setShowPlanMyTrip(false); window.scrollTo(0, 0); };
    const openState = (id) => { setSelectedState(id); setShowSearchPlatform(false); setShowTravelSafe(false); setShowTripMint(false); setShowPlanMyTrip(false); window.scrollTo(0, 0); };
    const openTravelSafe = () => { setShowTravelSafe(true); setShowSearchPlatform(false); setShowTripMint(false); setShowPlanMyTrip(false); setSidebarOpen(false); window.scrollTo(0, 0); };
    const openTripMint = () => { setShowTripMint(true); setShowSearchPlatform(false); setShowTravelSafe(false); setShowPlanMyTrip(false); setSidebarOpen(false); window.scrollTo(0, 0); };
    const openPlanMyTrip = () => { setShowPlanMyTrip(true); setShowSearchPlatform(false); setShowTravelSafe(false); setShowTripMint(false); setSidebarOpen(false); window.scrollTo(0, 0); };

    const currentState = states.find(s => s.id === selectedState);
    const isFullscreen = showSearchPlatform || showTravelSafe || showTripMint || showPlanMyTrip;

    return (
        <div className="app">

            {/* ── Right-side Sidebar ── */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onHome={goHome}
                onStateClick={openState}
                onFaresClick={openSearch}
                onTravelSafeClick={openTravelSafe}
                onTripMintClick={openTripMint}
                onPlanMyTripClick={openPlanMyTrip}
            />

            {/* ── Navbar (hidden on fullscreen pages) ── */}
            {!isFullscreen && (
                <Navbar
                    onHome={goHome}
                    onStateClick={openState}
                    onFaresClick={openSearch}
                    onSidebarOpen={() => setSidebarOpen(true)}
                />
            )}

            {/* ── Page Routing ── */}
            {showPlanMyTrip ? (
                <PlanMyTrip onBack={() => { setShowPlanMyTrip(false); window.scrollTo(0, 0); }} />
            ) : showTripMint ? (
                <TripMint onBack={() => { setShowTripMint(false); window.scrollTo(0, 0); }} />
            ) : showTravelSafe ? (
                <TravelSafe
                    initialStateId={selectedState}
                    onBack={() => { setShowTravelSafe(false); window.scrollTo(0, 0); }}
                />
            ) : isFullscreen ? (
                <SearchPlatform initialMode={searchMode} onBack={() => { setShowSearchPlatform(false); window.scrollTo(0, 0); }} />
            ) : !selectedState ? (
                <>
                    <Hero />
                    <main>
                        {states.map((state, index) => (
                            <StateSection
                                key={state.id}
                                state={state}
                                reverse={index % 2 !== 0}
                                onDiscoverMore={() => openState(state.id)}
                            />
                        ))}
                    </main>
                    <RoutesAndFares onOpenSearch={openSearch} />
                    <footer className="footer">
                        <div className="container">
                            <p>&copy; 2024 Travel Mint. All rights reserved.</p>
                        </div>
                    </footer>
                </>
            ) : (
                <>
                    <StateDetail state={currentState} onBack={goHome} />
                    <footer className="footer">
                        <div className="container">
                            <p>&copy; 2024 Travel Mint. All rights reserved.</p>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
}

export default App;
