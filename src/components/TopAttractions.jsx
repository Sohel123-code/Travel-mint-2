import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { groq } from '../utils/groqClient';
import { Loader2, MapPin } from 'lucide-react';
import './TopAttractions.css';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY2;

const TopAttractions = ({ stateId, stateName, onAttractionClick }) => {
    const [attractions, setAttractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttractions = async () => {
            setLoading(true);
            try {
                // 1. Fetch from Supabase
                let tableName = stateId.toLowerCase();
                if (stateName === "Rajasthan") {
                    tableName = "rajasthan_tourism";
                } else if (stateName === "Himachal Pradesh") {
                    tableName = "himachal_pradesh_tourism";
                } else if (stateName === "Uttarakhand") {
                    tableName = "uttarakhand_tourism";
                }

                let { data, error: sbError } = await supabase
                    .from(tableName)
                    .select('*');

                if (sbError || !data || data.length === 0) {
                    // Try capitalized if lowercase fails
                    const capitalizedTable = stateId.charAt(0).toUpperCase() + stateId.slice(1);
                    const retry = await supabase.from(capitalizedTable).select('*');
                    if (!retry.error && retry.data) data = retry.data;
                    else throw sbError || retry.error;
                }

                if (!data || data.length === 0) {
                    setAttractions([]);
                    setLoading(false);
                    return;
                }

                // Rajasthan Images Mapping (from assets/rajasthan)
                const rajasthanImages = {
                    "Ajmer Sharif Dargah": "/assets/rajasthan/Ajmer Sharif Dargah.jpg",
                    "Amber Fort": "/assets/rajasthan/Amber Fort.avif",
                    "Bundi Palace": "/assets/rajasthan/Bundi Palace.jpg",
                    "Chittorgarh Fort": "/assets/rajasthan/Chittorgarh Fort.avif",
                    "City Palace Jaipur": "/assets/rajasthan/City Palace Jaipur.jpg",
                    "Dilwara Temples": "/assets/rajasthan/Dilwara Temples.jpg",
                    "Hawa Mahal": "/assets/rajasthan/Hawa Mahal.jpg",
                    "Jaisalmer Fort": "/assets/rajasthan/Jaisalmer Fort.jpg",
                    "Junagarh Fort": "/assets/rajasthan/Junagarh Fort.jpg",
                    "Kumbhalgarh Fort": "/assets/rajasthan/Kumbhalgarh Fort.jpg",
                    "Lake Pichola": "/assets/rajasthan/Lake Pichola.jpg",
                    "Mandawa Fort": "/assets/rajasthan/Mandawa Fort.jpg",
                    "Mehrangarh Fort": "/assets/rajasthan/Mehrangarh Fort.webp",
                    "Nakki Lake": "/assets/rajasthan/Nakki Lake.avif",
                    "Pushkar Lake": "/assets/rajasthan/Pushkar Lake.jpg",
                    "Ranakpur Jain Temple": "/assets/rajasthan/Ranakpur Jain Temple.jpg",
                    "Ranthambore National Park": "/assets/rajasthan/Ranthambore National Park.jpg",
                    "Sam Sand Dunes": "/assets/rajasthan/Sam Sand Dunes.jpeg",
                    "Sariska Tiger Reserve": "/assets/rajasthan/Sariska Tiger Reserve.jpg",
                    "Umaid Bhawan Palace": "/assets/rajasthan/Umaid Bhawan Palace.jpg"
                };

                // Himachal Pradesh local images
                const himachalImages = {
                    "Bir Billing": "/assets/himachal/Bir Billing.jpeg",
                    "Chail Palace": "/assets/himachal/Chail Palace.jpg",
                    "Dal Lake Dharamshala": "/assets/himachal/Dal Lake Dharamshala.jpg",
                    "Hadimba Temple": "/assets/himachal/Hadimba Temple.jpg",
                    "Jakhoo Temple": "/assets/himachal/Jakhoo Temple.jpg",
                    "Kasauli": "/assets/himachal/Kasauli.jpg",
                    "Kasol": "/assets/himachal/Kasol.jpg",
                    "Khajjiar": "/assets/himachal/Khajjiar.jpg",
                    "Kullu Valley": "/assets/himachal/Kullu Valley.jpg",
                    "Mall Road Shimla": "/assets/himachal/Mall Road Shimla.jpg",
                    "Manikaran Sahib": "/assets/himachal/Manikaran Sahib.jpg",
                    "McLeodganj": "/assets/himachal/McLeodganj.jpg",
                    "Narkanda": "/assets/himachal/Narkanda.avif",
                    "Palampur": "/assets/himachal/Palampur.jpg",
                    "Rohtang Pass": "/assets/himachal/Rohtang Pass.jpg",
                    "Sangla Valley": "/assets/himachal/Sangla Valley.jpg",
                    "Solang Valley": "/assets/himachal/Solang Valley.jpg",
                    "Spiti Valley": "/assets/himachal/Spiti Valley.jpg",
                    "Tirthan Valley": "/assets/himachal/Tirthan Valley.jpg",
                    "Triund Trek": "/assets/himachal/Triund Trek.avif",
                };

                // Uttarakhand local images
                const uttarakhandImages = {
                    "Almora": "/assets/uttarakand/Almora.jpg",
                    "Auli Ski Resort": "/assets/uttarakand/Auli Ski Resort.jpg",
                    "Badrinath Temple": "/assets/uttarakand/Badrinath Temple.jpg",
                    "Bhimtal Lake": "/assets/uttarakand/Bhimtal Lake.cms",
                    "Chopta": "/assets/uttarakand/Chopta.jpg",
                    "Gangotri Temple": "/assets/uttarakand/Gangotri Temple.jpg",
                    "Har Ki Pauri": "/assets/uttarakand/Har Ki Pauri.jpg",
                    "Harsil Valley": "/assets/uttarakand/Harsil Valley.webp",
                    "Jim Corbett National Park": "/assets/uttarakand/Jim Corbett National Park.jpg",
                    "Kedarnath Temple": "/assets/uttarakand/Kedarnath Temple.jpg",
                    "Kempty Falls": "/assets/uttarakand/Kempty Falls.jpg",
                    "Laxman Jhula": "/assets/uttarakand/Laxman Jhula.jpg",
                    "Mukteshwar": "/assets/uttarakand/Mukteshwar.cms",
                    "Munsiyari": "/assets/uttarakand/Munsiyari.cms",
                    "Naini Lake": "/assets/uttarakand/Naini Lake.jpg",
                    "Pithoragarh": "/assets/uttarakand/Pithoragarh.jpg",
                    "Ranikhet": "/assets/uttarakand/Ranikhet.jpg",
                    "Tehri Lake": "/assets/uttarakand/Tehri Lake.jpg",
                    "Valley of Flowers": "/assets/uttarakand/Valley of Flowers.jpg",
                    "Yamunotri Temple": "/assets/uttarakand/Yamunotri Temple.webp",
                };

                // 2. Fetch images and descriptions for each place
                const enrichedData = await Promise.all(data.map(async (item) => {
                    const place = item.Top_Attractions || item.place || item.name || "Unknown Location";
                    const normalizedPlace = place.trim();

                    let imageUrl = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop';
                    if (stateName === "Rajasthan" && rajasthanImages[normalizedPlace]) {
                        imageUrl = rajasthanImages[normalizedPlace];
                    } else if (stateName === "Himachal Pradesh" && himachalImages[normalizedPlace]) {
                        imageUrl = himachalImages[normalizedPlace];
                    } else if (stateName === "Uttarakhand" && uttarakhandImages[normalizedPlace]) {
                        imageUrl = uttarakhandImages[normalizedPlace];
                    } else {
                        try {
                            const searchQuery = `${normalizedPlace} ${stateName} landmark landscape`;
                            const imgRes = await fetch(
                                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
                                { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
                            );
                            const imgData = await imgRes.json();
                            if (imgData.results?.length > 0) {
                                // Request high quality regular size with specific width
                                imageUrl = `${imgData.results[0].urls.regular}&auto=format&fit=crop&q=85&w=800`;
                            }
                        } catch (e) { console.error("Unsplash error:", e); }
                    }

                    let description = item.description || "Discover the unique charm and history of this remarkable destination.";
                    if (!item.description) {
                        try {
                            const completion = await groq.chat.completions.create({
                                messages: [{ role: "user", content: `Write a compelling 20-word travel description for ${normalizedPlace} in ${stateName}, India. Focus on its uniqueness.` }],
                                model: "llama-3.3-70b-versatile",
                            });
                            description = completion.choices[0]?.message?.content || description;
                        } catch (e) { console.error("Groq error:", e); }
                    }

                    return { ...item, imageUrl, description, place: normalizedPlace };
                }));

                setAttractions(enrichedData);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setError("Failed to load attractions structure.");
            } finally {
                setLoading(false);
            }
        };

        if (stateId) fetchAttractions();
    }, [stateId, stateName]);

    if (loading) return <div className="attractions-status"><Loader2 className="animate-spin" /> Gathering the best spots...</div>;
    if (error) return <div className="attractions-status text-error">{error}</div>;

    return (
        <div className="top-attractions">
            <h3 className="attractions-heading">Top Attractions</h3>
            <div className="attractions-grid">
                {attractions.map((attr, idx) => (
                    <motion.div
                        key={idx}
                        className="attraction-card"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => onAttractionClick(attr)}
                    >
                        <div className="attraction-image-container">
                            <img src={attr.imageUrl} alt={attr.place} />
                        </div>
                        <div className="attraction-info">
                            <div className="attraction-header">
                                <MapPin size={16} className="pin-icon" />
                                <h4>{attr.place}</h4>
                            </div>
                            <p>{attr.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TopAttractions;
