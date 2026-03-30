import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Hotel, Loader2, Search, Building2, IndianRupee, Sparkles, CheckCircle, Star } from 'lucide-react';
import Groq from 'groq-sdk';
import './Hotels.css';

const Hotels = ({ stateId, stateName }) => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndEnrichHotels = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch basic data from JSON
                let jsonFileName = stateName.toLowerCase().replace(/\s+/g, '_') + '_hotels.json';
                const baseUrl = import.meta.env.BASE_URL || '/';
                let jsonPath = `${baseUrl}data/${jsonFileName}`;
                const res = await fetch(jsonPath);
                if (!res.ok) throw new Error("Failed to load hotels data source.");
                const data = await res.json();
                
                // Flatten hotels list from categories
                let allHotels = [];
                if (data && data.categories) {
                    Object.entries(data.categories).forEach(([category, list]) => {
                        list.forEach(hotel => {
                            allHotels.push({ 
                                ...hotel, 
                                category, 
                                star_rating: parseInt(category.split('_')[0]) || 5 
                            });
                        });
                    });
                }

                // 2. Enrich with Groq AI in bulk if key is available
                const apiKey = import.meta.env.VITE_GROQ_API_HOTELS_KEY;
                if (!apiKey || apiKey === "") {
                    console.warn("Groq API key missing. Using basic hotel data.");
                    setHotels(allHotels.map(h => ({
                        ...h,
                        about: "A premium heritage stay offering world-class hospitality and royal charm.",
                        cost: "₹15,000 - ₹45,000",
                        amenities: ["Heritage Suites", "Fine Dining", "Wellness Spa"]
                    })));
                    setLoading(false);
                    return;
                }

                const groq = new Groq({
                    apiKey: apiKey,
                    dangerouslyAllowBrowser: true,
                });

                const hotelListString = allHotels.map(h => `- ${h.name} (${h.city})`).join('\n');
                const prompt = `You are a luxury travel researcher. For the following premium hotels in ${stateName}, provide highly accurate and professional details:
                1. A concise description (15-20 words) highlighting its unique history or architecture.
                2. Realistic current average price range per night in INR (e.g., ₹20,000 - ₹50,000).
                3. Exactly 3 actual premium amenities available at the property.
                4. A precise address-based search string for Google Maps.
                5. An official star rating (integer: 3, 4, or 5) based on its luxury status.

                Return ONLY a valid JSON object with a "hotels" key containing an array of objects with keys: "name", "about", "cost", "amenities", "location_query", "star_rating".
                
                Hotels to process:
                ${hotelListString}`;

                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are a professional travel data architect. Always return valid, accurate JSON for luxury heritage hotels. Match hotel names exactly." },
                        { role: "user", content: prompt }
                    ],
                    model: "llama-3.3-70b-versatile",
                    response_format: { type: "json_object" },
                    temperature: 0.1
                });

                let enrichedHotels = allHotels;
                try {
                    const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{"hotels": []}');
                    const aiDataArray = aiResponse.hotels || aiResponse.results || [];

                    // 3. Merge AI data with basic data
                    enrichedHotels = allHotels.map(hotel => {
                        const aiInfo = aiDataArray.find(a => 
                            a.name && hotel.name && a.name.toLowerCase().includes(hotel.name.toLowerCase())
                        ) || {};
                        return {
                            ...hotel,
                            about: aiInfo.about || "Experience royal hospitality and world-class luxury at this premier destination.",
                            cost: aiInfo.cost || "₹15,000 - ₹35,000",
                            amenities: aiInfo.amenities || ["Heritage Suites", "Fine Dining", "Wellness Spa"],
                            location_query: hotel.map || aiInfo.location_query || `${hotel.name}, ${hotel.city}`,
                            star_rating: aiInfo.star_rating || 5
                        };
                    });
                } catch (jsonErr) {
                    console.error("AI JSON Parse Error:", jsonErr);
                    // Fallback to basic enriched data
                    enrichedHotels = allHotels.map(h => ({
                        ...h,
                        about: "Experience royal hospitality and world-class luxury at this premier destination.",
                        cost: "₹15,000 - ₹35,000",
                        amenities: ["Heritage Suites", "Fine Dining", "Wellness Spa"],
                        location_query: h.map || `${h.name}, ${h.city}`,
                        star_rating: 5
                    }));
                }

                setHotels(enrichedHotels);
            } catch (err) {
                console.error("Hotels Module Error:", err);
                setError("Something went wrong while loading the hotels. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchAndEnrichHotels();
    }, [stateId, stateName]);
    if (error) {
        return (
            <div className="hotels-error">
                <Building2 size={48} className="error-icon" />
                <h3>Module Unavailable</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn-retry">Retry Loading</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="hotels-loading">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <Loader2 size={48} className="loading-icon" />
                </motion.div>
                <h3 className="loading-text">Consulting local experts...</h3>
                <p>Gathering detailed costs and amenities for the finest stays.</p>
            </div>
        );
    }

    const categories = ['All', '5_star', '3_star', '2_star'];
    const categoryLabels = {
        'All': 'All Stays',
        '5_star': '5 Star',
        '3_star': '3 Star',
        '2_star': '2 Star'
    };
    
    let filteredHotels = selectedCategory === 'All' 
        ? hotels 
        : hotels.filter(h => h.category === selectedCategory);

    if (searchQuery) {
        filteredHotels = filteredHotels.filter(h => 
            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.about && h.about.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    return (
        <div className="hotels-module no-images">
            <header className="hotels-header">
                <div className="hotels-title-area">
                    <motion.h2 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hotels-title"
                    >
                        Luxury Accommodations
                    </motion.h2>
                    <p className="hotels-subtitle">Detailed insights into the most official and royal stays in {stateName}</p>
                </div>

                <div className="hotels-controls">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Find a palace or city..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="city-filters">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                className={`city-tab ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {categoryLabels[cat]}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <motion.div 
                className="hotels-list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={selectedCategory + searchQuery}
            >
                <AnimatePresence mode="popLayout">
                    {filteredHotels.map((hotel, index) => (
                        <motion.div 
                            key={`${hotel.name}-${index}`}
                            className="hotel-official-card"
                            variants={cardVariants}
                            whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                            layout
                        >
                            <div className="hotel-card-header">
                                <div className="hotel-main-info">
                                    <div className="hotel-name-row">
                                        <Building2 size={20} className="hotel-icon" />
                                        <h3>{hotel.name}</h3>
                                        <div className="hotel-stars">
                                            {[...Array(hotel.star_rating)].map((_, i) => (
                                                <Star key={i} size={14} fill="currentColor" className="star-icon" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hotel-meta">
                                        <div className="meta-item cost">
                                            <IndianRupee size={16} />
                                            <span>{hotel.cost} <small>/ night</small></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hotel-badge">
                                    <Sparkles size={14} />
                                    <span>Premium</span>
                                </div>
                            </div>
                            
                            <div className="hotel-card-body">
                                <div className="hotel-description">
                                    <p>{hotel.about}</p>
                                </div>
                                
                                <div className="hotel-amenities">
                                    {hotel.amenities && hotel.amenities.map((amenity, i) => (
                                        <div key={i} className="amenity-item">
                                            <CheckCircle size={12} className="check-icon" />
                                            <span>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="hotel-card-footer">
                                <a 
                                    href={hotel.map || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.location_query)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-official-prime"
                                    style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
                                >
                                    View on Map
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
            
            {filteredHotels.length === 0 && (
                <div className="no-results">
                    <p>No hotels found matching your search criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Hotels;
