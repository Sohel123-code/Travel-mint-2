import React, { useState, useRef, useEffect, useCallback } from 'react';
import Groq from 'groq-sdk';
import './TripMint.css';

/* ───── Groq client ───── */
const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY4,
    dangerouslyAllowBrowser: true,
});

/* ───── System Prompt ───── */
const SYSTEM_PROMPT = `You are Mint, the professional AI travel assistant for TripMint — a travel platform specialising in three Indian states: Rajasthan, Himachal Pradesh, and Uttarakhand.

Your personality: professional, highly informative, concise, and helpful. Do not use emojis in your responses.

You can help users with:

TRAVEL INFORMATION
- Flights: prices, routes, airlines, duration, best booking sites (MakeMyTrip, Cleartrip, Indigo, Air India)
- Trains: routes, prices, train names (Shatabdi, Rajdhani, etc.), IRCTC tips
- Buses: state buses (RSRTC, HRTC, UPSRTC), private operators, prices
- Travel duration between cities

ACCOMMODATION
- Hotels in major cities (Jaipur, Udaipur, Jodhpur, Manali, Shimla, Dharamshala, Rishikesh, Mussoorie, Nainital, Haridwar)
- Budget (₹800–₹2000/night), Mid-range (₹2000–₹6000/night), Luxury (₹6000+/night)
- Hotel ratings, amenities, booking tips
- Homestays, guesthouses, boutique hotels

DESTINATION INFORMATION
- Rajasthan: Jaipur (Amber Fort, Hawa Mahal, City Palace), Udaipur (City Palace, Pichola Lake), Jodhpur (Mehrangarh Fort), Jaisalmer (Sam Sand Dunes, Golden Fort), Pushkar, Ranthambore
- Himachal Pradesh: Manali (Rohtang Pass, Solang Valley), Shimla (Mall Road, Kufri), Dharamshala/McLeod Ganj, Spiti Valley, Kasol, Bir Billing
- Uttarakhand: Rishikesh (rafting, yoga, Lakshman Jhula), Haridwar (Ganga Aarti), Mussoorie (Gun Hill, Kempty Falls), Nainital (Naini Lake), Jim Corbett, Auli (skiing)

TRIP PLANNING
- 3-day, 5-day, 7-day itineraries for any destination
- Weekend trip suggestions (from Delhi, Mumbai, Chandigarh, etc.)
- Itinerary combining multiple destinations
- Monsoon vs winter vs summer travel advice

COST ESTIMATION (in Indian Rupees ₹)
- Budget traveller: ₹1500–₹2500/day
- Mid-range: ₹3000–₹6000/day
- Luxury: ₹8000+/day
- Typical flight costs, hotel prices, activity costs, food costs

LOCAL INFORMATION
- Rajasthan: Dal Baati Churma, Laal Maas, Gatte ki Sabzi, Pyaaz Kachori
- Himachal: Siddu, Dham, Tudkiya Bhath, Babru
- Uttarakhand: Kafuli, Chainsoo, Bhang ki Chutney, Bhaang ki Khichdi
- Shopping: Jaipur gems & textiles, Manali shawls & handicrafts, Rishikesh yoga gear
- Nightlife and entertainment venues

TRAVEL UTILITIES
- Weather by season for each destination
- Best time to visit each state
- Currency tips (India uses INR ₹)
- Distance between cities
- Road trip routes and driving tips

BOOKING SUPPORT
- Help with booking on MakeMyTrip, Yatra, IRCTC, Booking.com
- Cancellation policies
- Travel insurance advice

GENERAL TRAVEL
- Visa information (India e-visa for foreigners)
- Safety tips for solo travellers, women travellers
- Packing lists by season
- Important emergency contacts (Police: 100, Ambulance: 108, Tourist Helpline: 1363)

If users ask about topics outside India or outside travel, politely redirect them to travel topics you can help with.

Always give practical, specific answers with approximate costs in INR (₹). Keep responses professional, well-structured, and strictly text-based without emojis.`;

/* ───── Quick action chips ───── */
const QUICK_ACTIONS = [
    { label: 'Flights', msg: 'What are the cheapest flight options to Rajasthan, Himachal Pradesh, or Uttarakhand?' },
    { label: 'Hotels', msg: 'Suggest some good hotels in Manali for a family trip with budget options.' },
    { label: 'Itinerary', msg: 'Create a 5-day itinerary for Rajasthan covering the major highlights.' },
    { label: 'Weather', msg: 'What is the best time to visit Himachal Pradesh? What is the weather like?' },
    { label: 'Budget', msg: 'What is the estimated budget for a 5-day trip to Uttarakhand including travel, stay and food?' },
    { label: 'Top Places', msg: 'What are the top tourist attractions in Uttarakhand I should not miss?' },
    { label: 'Trains', msg: 'What trains go from Delhi to Jaipur? How long does it take and what are the fares?' },
    { label: 'Food', msg: 'What are the must-try local foods and best restaurants in Jaipur, Rajasthan?' },
];

/* ───── Typing indicator ───── */
const TypingIndicator = () => (
    <div className="tm-msg tm-msg--bot">
        <div className="tm-avatar">TM</div>
        <div className="tm-bubble tm-bubble--bot tm-typing">
            <span /><span /><span />
        </div>
    </div>
);

/* ───── Single message bubble ───── */
const Message = ({ msg }) => (
    <div className={`tm-msg ${msg.role === 'user' ? 'tm-msg--user' : 'tm-msg--bot'}`}>
        {msg.role === 'assistant' && <div className="tm-avatar">TM</div>}
        <div className={`tm-bubble ${msg.role === 'user' ? 'tm-bubble--user' : 'tm-bubble--bot'}`}>
            <p className="tm-text">{msg.content}</p>
        </div>
        {msg.role === 'user' && <div className="tm-avatar tm-avatar--user">U</div>}
    </div>
);

/* ───── Main Component ───── */
const TripMint = ({ onBack }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Welcome to TripMint. I am Mint, your professional travel assistant. I specialise in Rajasthan, Himachal Pradesh, and Uttarakhand.\n\nI can assist you with flights, hotels, itineraries, weather, budgets, restaurants, and more.\n\nHow may I help you today?",
            id: 0,
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chipsUsed, setChipsUsed] = useState(false);
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);
    const idRef = useRef(1);

    /* Auto-scroll to bottom */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    /* Auto-resize textarea */
    const handleInputChange = (e) => {
        setInput(e.target.value);
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 140) + 'px';
    };

    const sendMessage = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        const userMsg = { role: 'user', content: trimmed, id: idRef.current++ };
        const historyForApi = [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: trimmed },
        ];

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setChipsUsed(true);
        setLoading(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const completion = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...historyForApi,
                ],
                max_tokens: 1024,
                temperature: 0.7,
            });

            const reply = completion.choices[0]?.message?.content || 'Sorry, I could not get a response. Please try again.';
            setMessages(prev => [...prev, { role: 'assistant', content: reply, id: idRef.current++ }]);
        } catch (err) {
            console.error('Groq error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'An error occurred while connecting to the assistant. Please check your internet connection and try again.',
                id: idRef.current++,
            }]);
        } finally {
            setLoading(false);
        }
    }, [messages, loading]);

    const handleSend = () => sendMessage(input);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChip = (msg) => {
        sendMessage(msg);
    };

    return (
        <div className="tm-root">
            {/* ── Header ── */}
            <header className="tm-header">
                <button className="tm-back-btn" onClick={onBack} aria-label="Go back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div className="tm-header-info">
                    <div className="tm-header-avatar">TM</div>
                    <div>
                        <h1 className="tm-header-title">TripMint</h1>
                        <p className="tm-header-sub">Official AI Travel Assistant</p>
                    </div>
                </div>
                <div className="tm-header-status">
                    <span className="tm-online-dot" />
                    <span className="tm-online-label">Online</span>
                </div>
            </header>

            {/* ── Chat area ── */}
            <div className="tm-chat-area">
                {messages.map(msg => <Message key={msg.id} msg={msg} />)}
                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>

            {/* ── Quick action chips ── */}
            {!chipsUsed && (
                <div className="tm-chips-wrap">
                    <p className="tm-chips-label">Quick questions</p>
                    <div className="tm-chips">
                        {QUICK_ACTIONS.map(chip => (
                            <button
                                key={chip.label}
                                className="tm-chip"
                                onClick={() => handleChip(chip.msg)}
                                disabled={loading}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Input toolbar ── */}
            <div className="tm-input-bar">
                <textarea
                    ref={textareaRef}
                    className="tm-input"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Minty about flights, hotels, itineraries…"
                    rows={1}
                    disabled={loading}
                    aria-label="Chat input"
                />
                <button
                    className={`tm-send-btn ${loading ? 'tm-send-btn--loading' : ''}`}
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                >
                    {loading ? (
                        <svg className="tm-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TripMint;
