import React, { useState } from 'react';
import Groq from 'groq-sdk';
import './PlanMyTrip.css';

/* ───── Groq client ───── */
const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_NEW_API_KEY,
    dangerouslyAllowBrowser: true, // Be cautious using this in production
});

/* ───── Constants ───── */
const DESTINATIONS = [
    { state: 'Rajasthan', cities: ['Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Pushkar', 'Ajmer', 'Bikaner'] },
    { state: 'Himachal Pradesh', cities: ['Manali', 'Shimla', 'Dharamshala', 'McLeod Ganj', 'Kasol', 'Dalhousie', 'Spiti', 'Bir Billing'] },
    { state: 'Uttarakhand', cities: ['Rishikesh', 'Haridwar', 'Mussoorie', 'Nainital', 'Jim Corbett', 'Auli', 'Kedarnath', 'Dehradun'] },
];

const INTERESTS = [
    'Adventure', 'Hill Stations', 'Historical Places', 'Temples',
    'Wildlife', 'Snow', 'Lakes', 'Photography', 'Shopping', 'Nightlife',
];

const STEPS = ['Trip Basics', 'Travelers & Budget', 'Preferences', 'Review'];

/* ───── Minimum realistic budgets (INR per person per day) ───── */
const MIN_BUDGET_PER_PERSON_DAY = {
    low: 1200,
    medium: 3000,
    luxury: 8000,
};

/* ───── Build system prompt ───── */
const buildSystemPrompt = () =>
    `You are an expert Indian travel planner with deep knowledge of all routes, trains, buses, hotels, and attractions across Rajasthan, Himachal Pradesh, and Uttarakhand.

When given trip inputs, you return a single valid JSON object — no markdown, no code fences, no explanation, ONLY raw JSON.

IMPORTANT RULES:
1. If the budget seems insufficient for the chosen accommodation/transport class, ADAPT the plan within the given budget — suggest cheaper alternatives and clearly note trade-offs in travel_tips.
2. Always recommend REAL, NAMED trains (e.g., "Shatabdi Express 12017", "Ajmer Shatabdi", "Kalka Mail", "Mandovi Express", "Rajdhani Express") with realistic departure/arrival times, durations, and accurate fares.
3. Calculate the budget breakdown ACCURATELY based on: number of travelers, number of days, hotel type, transport mode. Show per-person and total costs separately where helpful.
4. Day-wise itinerary must be practical — account for travel time, realistic driving distances, and rest days.
5. Hotel prices should be realistic INR rates: Budget: ₹600-1500/night, 3-Star: ₹2000-4500/night, 4-Star: ₹4500-8000/night, 5-Star: ₹8000-25000/night.
6. Train fares per person: Sleeper ₹150-400, AC 3-Tier ₹400-900, AC 2-Tier ₹700-1500, AC First ₹1500-4000.
7. Flight fares per person (economy): ₹3000-8000 depending on route.
8. If there is a CONFLICT (e.g., luxury hotel selected but budget is too low), set a field "budget_conflict": true and explain in travel_tips what was adjusted.

The JSON must follow this exact structure:
{
  "budget_conflict": false,
  "trip_overview": {
    "source_city": "",
    "destination_city": "",
    "total_days": 0,
    "total_travelers": 0,
    "total_distance_km": "",
    "estimated_total_cost": "",
    "estimated_per_person_cost": "",
    "best_time_to_visit": "",
    "weather_forecast": ""
  },
  "day_wise_itinerary": [
    { "day": 1, "title": "", "activities": [""] }
  ],
  "recommended_hotels": [
    { "hotel_name": "", "hotel_type": "", "price_per_night": "", "rating": "", "location": "" }
  ],
  "attractions": [
    { "attraction_name": "", "location": "", "ticket_price": "", "recommended_visit_time": "", "distance_from_hotel_km": "" }
  ],
  "transport_details": [
    { "transport_mode": "", "train_name_or_flight": "", "train_number": "", "departure_time": "", "arrival_time": "", "travel_duration": "", "cost_per_person": "", "booking_tip": "" }
  ],
  "restaurants": [
    { "restaurant_name": "", "cuisine_type": "", "must_try_dish": "", "avg_price_per_person": "" }
  ],
  "budget_breakdown": {
    "transport_cost_total": "",
    "hotel_cost_total": "",
    "food_cost_total": "",
    "attraction_cost_total": "",
    "miscellaneous_cost": "",
    "total_cost": "",
    "per_person_cost": ""
  },
  "travel_tips": [""],
  "emergency_contacts": {
    "nearest_hospital": "",
    "police_station": "",
    "tourist_helpline": "1363",
    "emergency_numbers": ["112", "100", "108"]
  }
}

Return ONLY the raw JSON object.`;

/* ───── Step 1: Trip Basics ───── */
const StepBasics = ({ form, setForm }) => {
    const dest = DESTINATIONS.find(d => d.state === form.destination_state);
    return (
        <div className="pmt-fields">
            <div className="pmt-field">
                <label className="pmt-label">Source City <span className="pmt-req">*</span></label>
                <input className="pmt-input" type="text"
                    placeholder="e.g. Delhi, Mumbai, Bengaluru, Chandigarh"
                    value={form.source_city}
                    onChange={e => setForm(f => ({ ...f, source_city: e.target.value }))} />
            </div>
            <div className="pmt-row-2">
                <div className="pmt-field">
                    <label className="pmt-label">Destination State <span className="pmt-req">*</span></label>
                    <select className="pmt-select" value={form.destination_state}
                        onChange={e => setForm(f => ({ ...f, destination_state: e.target.value, destination_city: '' }))}>
                        <option value="">Select state</option>
                        {DESTINATIONS.map(d => <option key={d.state} value={d.state}>{d.state}</option>)}
                    </select>
                </div>
                <div className="pmt-field">
                    <label className="pmt-label">Destination City <span className="pmt-req">*</span></label>
                    <select className="pmt-select" value={form.destination_city}
                        onChange={e => setForm(f => ({ ...f, destination_city: e.target.value }))}
                        disabled={!dest}>
                        <option value="">Select city</option>
                        {dest?.cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="pmt-row-2">
                <div className="pmt-field">
                    <label className="pmt-label">Start Date <span className="pmt-req">*</span></label>
                    <input className="pmt-input" type="date" value={form.start_date}
                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div className="pmt-field">
                    <label className="pmt-label">End Date <span className="pmt-req">*</span></label>
                    <input className="pmt-input" type="date" value={form.end_date}
                        min={form.start_date}
                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                </div>
            </div>
            {form.start_date && form.end_date && new Date(form.end_date) >= new Date(form.start_date) && (
                <div className="pmt-info-pill">
                    {Math.max(1, Math.round((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1)} days trip selected
                </div>
            )}
        </div>
    );
};

/* ───── Step 2: Travelers & Budget ───── */
const StepTravelers = ({ form, setForm }) => {
    const totalTravelers = (parseInt(form.adults) || 0) + (parseInt(form.children) || 0);
    const days = form.start_date && form.end_date
        ? Math.max(1, Math.round((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1)
        : 3;
    const budget = parseInt(form.total_budget) || 0;
    const minNeeded = form.budget_type
        ? (MIN_BUDGET_PER_PERSON_DAY[form.budget_type] || 0) * Math.max(1, totalTravelers) * days
        : 0;
    const budgetShortfall = form.budget_type && budget > 0 && budget < minNeeded;

    return (
        <div className="pmt-fields">
            <div className="pmt-row-2">
                <div className="pmt-field">
                    <label className="pmt-label">Adults <span className="pmt-req">*</span></label>
                    <input className="pmt-input" type="number" min="1" max="20"
                        value={form.adults}
                        onChange={e => setForm(f => ({ ...f, adults: e.target.value }))} />
                </div>
                <div className="pmt-field">
                    <label className="pmt-label">Children</label>
                    <input className="pmt-input" type="number" min="0" max="20"
                        value={form.children}
                        onChange={e => setForm(f => ({ ...f, children: e.target.value }))} />
                </div>
            </div>
            <div className="pmt-field">
                <label className="pmt-label">Travel Type <span className="pmt-req">*</span></label>
                <div className="pmt-chip-group">
                    {['Solo', 'Couple', 'Family', 'Friends'].map(t => (
                        <button key={t} type="button"
                            className={`pmt-chip ${form.travel_type === t.toLowerCase() ? 'pmt-chip--active' : ''}`}
                            onClick={() => setForm(f => ({ ...f, travel_type: t.toLowerCase() }))}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            <div className="pmt-row-2">
                <div className="pmt-field">
                    <label className="pmt-label">Total Budget (INR) <span className="pmt-req">*</span></label>
                    <div className="pmt-input-prefix-wrap">
                        <span className="pmt-input-prefix">₹</span>
                        <input className="pmt-input pmt-input--prefixed" type="number" min="1000"
                            placeholder="e.g. 50000"
                            value={form.total_budget}
                            onChange={e => setForm(f => ({ ...f, total_budget: e.target.value }))} />
                    </div>
                </div>
                <div className="pmt-field">
                    <label className="pmt-label">Budget Category <span className="pmt-req">*</span></label>
                    <select className="pmt-select" value={form.budget_type}
                        onChange={e => setForm(f => ({ ...f, budget_type: e.target.value }))}>
                        <option value="">Select</option>
                        <option value="low">Low / Budget (₹1,200/person/day)</option>
                        <option value="medium">Medium (₹3,000/person/day)</option>
                        <option value="luxury">Luxury (₹8,000+/person/day)</option>
                    </select>
                </div>
            </div>
            {budgetShortfall && (
                <div className="pmt-warn-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>
                        Your budget of <strong>₹{Number(form.total_budget).toLocaleString('en-IN')}</strong> may be lower than the estimated minimum of <strong>₹{minNeeded.toLocaleString('en-IN')}</strong> for a {form.budget_type} trip with {totalTravelers} traveler(s) over {days} days. The AI will adapt the plan to fit your actual budget.
                    </span>
                </div>
            )}
            {form.budget_type && budget > 0 && (
                <div className="pmt-info-pill">
                    Approx. ₹{Math.round(budget / Math.max(1, totalTravelers) / days).toLocaleString('en-IN')} per person per day
                </div>
            )}
        </div>
    );
};

/* ───── Step 3: Preferences ───── */
const StepPreferences = ({ form, setForm }) => {
    const toggleInterest = (interest) => {
        setForm(f => {
            const list = f.interests.includes(interest)
                ? f.interests.filter(i => i !== interest)
                : [...f.interests, interest];
            return { ...f, interests: list };
        });
    };

    /* Detect accommodation vs budget conflict */
    const days = form.start_date && form.end_date
        ? Math.max(1, Math.round((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1)
        : 3;
    const budget = parseInt(form.total_budget) || 0;
    const travelers = (parseInt(form.adults) || 1) + (parseInt(form.children) || 0);

    const hotelNightlyMin = { budget: 600, '3_star': 2000, '4_star': 4500, '5_star': 8000, resort: 6000 };
    const transportConflict =
        form.hotel_type && form.budget_type &&
        hotelNightlyMin[form.hotel_type] &&
        hotelNightlyMin[form.hotel_type] * travelers * days > budget * 0.6;

    return (
        <div className="pmt-fields">
            <div className="pmt-row-2">
                <div className="pmt-field">
                    <label className="pmt-label">Transport Mode <span className="pmt-req">*</span></label>
                    <select className="pmt-select" value={form.transport_mode}
                        onChange={e => setForm(f => ({ ...f, transport_mode: e.target.value }))}>
                        <option value="">Select</option>
                        <option value="flight">Flight</option>
                        <option value="train">Train</option>
                        <option value="bus">Bus</option>
                        <option value="car">Car / Road Trip</option>
                    </select>
                </div>
                <div className="pmt-field">
                    <label className="pmt-label">Transport Class</label>
                    <select className="pmt-select" value={form.transport_class}
                        onChange={e => setForm(f => ({ ...f, transport_class: e.target.value }))}>
                        <option value="">Any / Not Sure</option>
                        {form.transport_mode === 'flight' && <>
                            <option value="economy">Economy</option>
                            <option value="business">Business</option>
                        </>}
                        {form.transport_mode === 'train' && <>
                            <option value="sleeper">Sleeper (SL)</option>
                            <option value="ac_3">AC 3-Tier (3A)</option>
                            <option value="ac_2">AC 2-Tier (2A)</option>
                            <option value="ac_1">AC First Class (1A)</option>
                        </>}
                        {(form.transport_mode === 'bus') && <>
                            <option value="ordinary">Ordinary</option>
                            <option value="ac_bus">AC Bus</option>
                            <option value="volvo">Volvo / Luxury Bus</option>
                        </>}
                    </select>
                </div>
            </div>
            <div className="pmt-row-2">
                <div className="pmt-field">
                    <label className="pmt-label">Accommodation <span className="pmt-req">*</span></label>
                    <select className="pmt-select" value={form.hotel_type}
                        onChange={e => setForm(f => ({ ...f, hotel_type: e.target.value }))}>
                        <option value="">Select</option>
                        <option value="budget">Budget (₹600–1,500/night)</option>
                        <option value="3_star">3 Star (₹2,000–4,500/night)</option>
                        <option value="4_star">4 Star (₹4,500–8,000/night)</option>
                        <option value="5_star">5 Star (₹8,000–25,000/night)</option>
                        <option value="resort">Resort (₹6,000+/night)</option>
                    </select>
                </div>
                <div className="pmt-field">
                    <label className="pmt-label">Food Preference <span className="pmt-req">*</span></label>
                    <select className="pmt-select" value={form.food_type}
                        onChange={e => setForm(f => ({ ...f, food_type: e.target.value }))}>
                        <option value="">Select</option>
                        <option value="veg">Vegetarian</option>
                        <option value="non_veg">Non-Vegetarian</option>
                        <option value="both">Both</option>
                    </select>
                </div>
            </div>

            {transportConflict && (
                <div className="pmt-warn-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>
                        The accommodation type may exceed your stated budget. The AI will suggest the best-fit options within your budget and note any trade-offs.
                    </span>
                </div>
            )}

            <div className="pmt-field">
                <label className="pmt-label">Activity Level <span className="pmt-req">*</span></label>
                <div className="pmt-chip-group">
                    {[
                        { key: 'relaxed', label: 'Relaxed', hint: '1–2 places/day' },
                        { key: 'moderate', label: 'Moderate', hint: '3–4 places/day' },
                        { key: 'packed', label: 'Packed', hint: '5+ places/day' },
                    ].map(a => (
                        <button key={a.key} type="button"
                            className={`pmt-chip pmt-chip--lg ${form.activity_level === a.key ? 'pmt-chip--active' : ''}`}
                            onClick={() => setForm(f => ({ ...f, activity_level: a.key }))}>
                            <span className="pmt-chip-main">{a.label}</span>
                            <span className="pmt-chip-hint">{a.hint}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="pmt-field">
                <label className="pmt-label">Trip Interests <span className="pmt-label-hint">(Select all that apply)</span></label>
                <div className="pmt-chip-group pmt-chip-group--wrap">
                    {INTERESTS.map(interest => (
                        <button key={interest} type="button"
                            className={`pmt-chip ${form.interests.includes(interest) ? 'pmt-chip--active' : ''}`}
                            onClick={() => toggleInterest(interest)}>
                            {interest}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ───── Step 4: Review ───── */
const StepReview = ({ form }) => {
    const days = form.start_date && form.end_date
        ? Math.max(1, Math.round((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1)
        : '—';
    const totalTravelers = (parseInt(form.adults) || 0) + (parseInt(form.children) || 0);

    const rows = [
        ['From', form.source_city || '—'],
        ['To', [form.destination_city, form.destination_state].filter(Boolean).join(', ') || '—'],
        ['Dates', form.start_date && form.end_date ? `${form.start_date} to ${form.end_date} (${days} days)` : '—'],
        ['Travelers', `${form.adults} adult(s)${form.children > 0 ? `, ${form.children} child(ren)` : ''} — ${form.travel_type || '—'}`],
        ['Total Travelers', totalTravelers + ' person(s)'],
        ['Budget', form.total_budget ? `₹${Number(form.total_budget).toLocaleString('en-IN')} (${form.budget_type})` : '—'],
        ['Transport', [form.transport_mode, form.transport_class].filter(Boolean).join(' / ') || '—'],
        ['Accommodation', form.hotel_type?.replace('_', ' ') || '—'],
        ['Food', form.food_type || '—'],
        ['Activity Level', form.activity_level || '—'],
        ['Interests', form.interests.length ? form.interests.join(', ') : 'General sightseeing'],
    ];

    return (
        <div className="pmt-review">
            <p className="pmt-review-note">Review your details before generating the plan. The AI will adapt if any preferences conflict with the budget.</p>
            <div className="pmt-review-grid">
                {rows.map(([label, value]) => (
                    <div key={label} className="pmt-review-row">
                        <span className="pmt-review-key">{label}</span>
                        <span className="pmt-review-val">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ───── PDF/Print Download ───── */
const downloadPlanAsPDF = (plan, form) => {
    const days = form.start_date && form.end_date
        ? Math.max(1, Math.round((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1)
        : '—';

    const ov = plan.trip_overview || {};
    const bb = plan.budget_breakdown || {};

    const itineraryHTML = (plan.day_wise_itinerary || []).map(day => `
        <div class="day-block">
            <div class="day-header"><span class="day-badge">Day ${day.day}</span> ${day.title || ''}</div>
            <ul>${(day.activities || []).map(a => `<li>${a}</li>`).join('')}</ul>
        </div>
    `).join('');

    const hotelRows = (plan.recommended_hotels || []).map(h => `
        <tr><td>${h.hotel_name}</td><td>${h.hotel_type || ''}</td><td>${h.price_per_night || ''}</td><td>${h.rating || ''}</td><td>${h.location || ''}</td></tr>
    `).join('');

    const transportRows = (plan.transport_details || []).map(t => `
        <tr><td>${t.transport_mode || ''}</td><td>${t.train_name_or_flight || ''}</td><td>${t.departure_time || ''}</td><td>${t.arrival_time || ''}</td><td>${t.travel_duration || ''}</td><td>${t.cost_per_person || ''}</td></tr>
    `).join('');

    const attractionRows = (plan.attractions || []).map(a => `
        <tr><td>${a.attraction_name}</td><td>${a.location || ''}</td><td>${a.ticket_price || ''}</td><td>${a.recommended_visit_time || ''}</td></tr>
    `).join('');

    const tipsHTML = (plan.travel_tips || []).map(t => `<li>${t}</li>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Trip Plan — ${form.destination_city}, ${form.destination_state}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 12px; color: #1f2937; padding: 32px; line-height: 1.6; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
  .conflict-banner { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; color: #856404; }
  h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
  .overview-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 8px; }
  .ov-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; }
  .ov-key { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 2px; }
  .ov-val { font-size: 13px; font-weight: 600; color: #111827; }
  .day-block { margin-bottom: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
  .day-header { padding: 8px 12px; font-weight: 600; font-size: 13px; background: #f3f4f6; }
  .day-badge { background: #111827; color: #fff; border-radius: 20px; padding: 2px 8px; font-size: 11px; margin-right: 6px; }
  ul { padding: 10px 12px 10px 24px; }
  li { margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-bottom: 8px; }
  th { background: #f3f4f6; text-align: left; padding: 7px 10px; font-weight: 600; border: 1px solid #e5e7eb; }
  td { padding: 6px 10px; border: 1px solid #e5e7eb; vertical-align: top; }
  .budget-table td:last-child { font-weight: 600; }
  .budget-total { background: #f9fafb; font-weight: 700 !important; }
  .tips-list { columns: 2; }
  .emg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .emg-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 12px; font-size: 12px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<h1>Trip Plan — ${form.destination_city}, ${form.destination_state}</h1>
<p class="subtitle">${form.source_city} to ${form.destination_city} &bull; ${form.start_date} to ${form.end_date} (${days} days) &bull; ${(parseInt(form.adults) || 0) + (parseInt(form.children) || 0)} Traveler(s) &bull; ₹${Number(form.total_budget).toLocaleString('en-IN')} Budget</p>

${plan.budget_conflict ? `<div class="conflict-banner">Note: Your budget was adjusted. Some preferences may have been adapted to fit within your stated budget. See Travel Tips for details.</div>` : ''}

<h2>Trip Overview</h2>
<div class="overview-grid">
  ${[['From', ov.source_city], ['To', ov.destination_city], ['Duration', ov.total_days ? `${ov.total_days} Days` : '—'], ['Distance', ov.total_distance_km], ['Est. Total Cost', ov.estimated_total_cost], ['Per Person', ov.estimated_per_person_cost], ['Best Time', ov.best_time_to_visit], ['Weather', ov.weather_forecast]].filter(([, v]) => v).map(([k, v]) => `<div class="ov-card"><span class="ov-key">${k}</span><span class="ov-val">${v}</span></div>`).join('')}
</div>

<h2>Day-wise Itinerary</h2>
${itineraryHTML}

<h2>Recommended Hotels</h2>
<table>
  <tr><th>Hotel Name</th><th>Type</th><th>Price/Night</th><th>Rating</th><th>Location</th></tr>
  ${hotelRows}
</table>

<h2>Transport Details</h2>
<table>
  <tr><th>Mode</th><th>Train / Flight</th><th>Departure</th><th>Arrival</th><th>Duration</th><th>Cost/Person</th></tr>
  ${transportRows}
</table>

<h2>Top Attractions</h2>
<table>
  <tr><th>Attraction</th><th>Location</th><th>Entry Fee</th><th>Best Time</th></tr>
  ${attractionRows}
</table>

<h2>Budget Breakdown</h2>
<table class="budget-table">
  ${[['Transport (Total)', bb.transport_cost_total], ['Accommodation (Total)', bb.hotel_cost_total], ['Food (Total)', bb.food_cost_total], ['Attractions (Total)', bb.attraction_cost_total], ['Miscellaneous', bb.miscellaneous_cost]].filter(([, v]) => v).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
  ${bb.total_cost ? `<tr class="budget-total"><td><strong>Total Estimated Cost</strong></td><td><strong>${bb.total_cost}</strong></td></tr>` : ''}
  ${bb.per_person_cost ? `<tr class="budget-total"><td><strong>Per Person Cost</strong></td><td><strong>${bb.per_person_cost}</strong></td></tr>` : ''}
</table>

<h2>Travel Tips</h2>
<ul class="tips-list">${tipsHTML}</ul>

<h2>Emergency Contacts</h2>
<div class="emg-grid">
  ${[['Nearest Hospital', plan.emergency_contacts?.nearest_hospital], ['Police Station', plan.emergency_contacts?.police_station], ['Tourist Helpline', plan.emergency_contacts?.tourist_helpline || '1363'], ['Emergency Numbers', (plan.emergency_contacts?.emergency_numbers || []).join(', ')]].filter(([, v]) => v).map(([k, v]) => `<div class="emg-card"><strong>${k}</strong><br/>${v}</div>`).join('')}
</div>

<div class="footer">Generated by TravelMint &bull; Plan My Trip &bull; ${new Date().toLocaleDateString('en-IN')}</div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
};

/* ───── Plan Output ───── */
const PlanOutput = ({ plan, form, onReset }) => {
    const [openDay, setOpenDay] = useState(0);
    const ov = plan.trip_overview || {};
    const bb = plan.budget_breakdown || {};

    return (
        <div className="pmt-output">

            {/* Conflict banner */}
            {plan.budget_conflict && (
                <div className="pmt-conflict-banner">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>Budget adjustment applied — some preferences were adapted to fit your stated budget. See Travel Tips for details.</span>
                </div>
            )}

            {/* Action bar */}
            <div className="pmt-action-bar">
                <div className="pmt-action-title">
                    <strong>{ov.source_city || form.source_city}</strong>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    <strong>{ov.destination_city || form.destination_city}</strong>
                    {ov.total_days && <span className="pmt-action-days">{ov.total_days} Days</span>}
                </div>
                <div className="pmt-action-btns">
                    <button className="pmt-dl-btn" onClick={() => downloadPlanAsPDF(plan, form)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download PDF
                    </button>
                    <button className="pmt-reset-btn" onClick={onReset}>Plan Another Trip</button>
                </div>
            </div>

            {/* Trip Overview */}
            <section className="pmt-section">
                <div className="pmt-section-label">Trip Overview</div>
                <div className="pmt-overview-grid">
                    {[
                        ['From', ov.source_city],
                        ['To', ov.destination_city],
                        ['Duration', ov.total_days ? `${ov.total_days} Days` : null],
                        ['Travelers', ov.total_travelers ? `${ov.total_travelers} Person(s)` : null],
                        ['Distance', ov.total_distance_km],
                        ['Est. Total', ov.estimated_total_cost],
                        ['Per Person', ov.estimated_per_person_cost],
                        ['Best Time', ov.best_time_to_visit],
                        ['Weather', ov.weather_forecast],
                    ].filter(([, v]) => v).map(([label, value]) => (
                        <div key={label} className="pmt-overview-card">
                            <span className="pmt-overview-key">{label}</span>
                            <span className="pmt-overview-val">{value}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Day-wise Itinerary */}
            {plan.day_wise_itinerary?.length > 0 && (
                <section className="pmt-section">
                    <div className="pmt-section-label">Day-wise Itinerary</div>
                    <div className="pmt-itinerary">
                        {plan.day_wise_itinerary.map((day) => (
                            <div key={day.day} className={`pmt-day ${openDay === day.day ? 'pmt-day--open' : ''}`}>
                                <button className="pmt-day-header" onClick={() => setOpenDay(openDay === day.day ? null : day.day)}>
                                    <span className="pmt-day-num">Day {day.day}</span>
                                    <span className="pmt-day-title">{day.title || `Day ${day.day}`}</span>
                                    <svg className="pmt-day-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                                {openDay === day.day && (
                                    <ul className="pmt-day-activities">
                                        {(day.activities || []).map((act, i) => (
                                            <li key={i} className="pmt-day-activity">
                                                <span className="pmt-activity-dot" />
                                                {act}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Hotels */}
            {plan.recommended_hotels?.length > 0 && (
                <section className="pmt-section">
                    <div className="pmt-section-label">Recommended Hotels</div>
                    <div className="pmt-cards-grid">
                        {plan.recommended_hotels.map((h, i) => (
                            <div key={i} className="pmt-card">
                                <div className="pmt-card-top">
                                    <span className="pmt-card-title">{h.hotel_name}</span>
                                    {h.rating && <span className="pmt-badge">{h.rating}</span>}
                                </div>
                                {[['Type', h.hotel_type], ['Price/Night', h.price_per_night], ['Location', h.location]].filter(([, v]) => v).map(([k, v]) => (
                                    <div key={k} className="pmt-card-row"><span className="pmt-card-key">{k}</span><span className="pmt-card-val">{v}</span></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Attractions */}
            {plan.attractions?.length > 0 && (
                <section className="pmt-section">
                    <div className="pmt-section-label">Top Attractions</div>
                    <div className="pmt-cards-grid">
                        {plan.attractions.map((a, i) => (
                            <div key={i} className="pmt-card">
                                <div className="pmt-card-top"><span className="pmt-card-title">{a.attraction_name}</span></div>
                                {[['Location', a.location], ['Entry Fee', a.ticket_price], ['Best Time', a.recommended_visit_time], ['Distance', a.distance_from_hotel_km ? `${a.distance_from_hotel_km} km` : null]].filter(([, v]) => v).map(([k, v]) => (
                                    <div key={k} className="pmt-card-row"><span className="pmt-card-key">{k}</span><span className="pmt-card-val">{v}</span></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Transport */}
            {plan.transport_details?.length > 0 && (
                <section className="pmt-section">
                    <div className="pmt-section-label">Transport Details</div>
                    <div className="pmt-transport-list">
                        {plan.transport_details.map((t, i) => (
                            <div key={i} className="pmt-transport-card">
                                <div className="pmt-transport-left">
                                    <span className="pmt-transport-mode">{t.transport_mode}</span>
                                    {t.train_name_or_flight && <span className="pmt-transport-name">{t.train_name_or_flight}{t.train_number ? ` (${t.train_number})` : ''}</span>}
                                    {t.booking_tip && <span className="pmt-transport-tip">{t.booking_tip}</span>}
                                </div>
                                <div className="pmt-transport-right">
                                    {t.departure_time && <div className="pmt-transport-time"><span className="pmt-transport-time-label">Dep</span>{t.departure_time}</div>}
                                    {t.arrival_time && <div className="pmt-transport-time"><span className="pmt-transport-time-label">Arr</span>{t.arrival_time}</div>}
                                    {t.travel_duration && <div className="pmt-transport-dur">{t.travel_duration}</div>}
                                    {t.cost_per_person && <div className="pmt-transport-cost">{t.cost_per_person}/person</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Restaurants */}
            {plan.restaurants?.length > 0 && (
                <section className="pmt-section">
                    <div className="pmt-section-label">Recommended Restaurants</div>
                    <div className="pmt-cards-grid">
                        {plan.restaurants.map((r, i) => (
                            <div key={i} className="pmt-card">
                                <div className="pmt-card-top"><span className="pmt-card-title">{r.restaurant_name}</span></div>
                                {[['Cuisine', r.cuisine_type], ['Must Try', r.must_try_dish], ['Avg/Person', r.avg_price_per_person]].filter(([, v]) => v).map(([k, v]) => (
                                    <div key={k} className="pmt-card-row"><span className="pmt-card-key">{k}</span><span className="pmt-card-val">{v}</span></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Budget Breakdown */}
            {Object.values(bb).some(Boolean) && (
                <section className="pmt-section">
                    <div className="pmt-section-label">Budget Breakdown</div>
                    <div className="pmt-budget-table">
                        {[['Transport (All Travelers)', bb.transport_cost_total], ['Accommodation (All Travelers)', bb.hotel_cost_total], ['Food (All Travelers)', bb.food_cost_total], ['Attractions & Activities', bb.attraction_cost_total], ['Miscellaneous', bb.miscellaneous_cost]].filter(([, v]) => v).map(([k, v]) => (
                            <div key={k} className="pmt-budget-row"><span className="pmt-budget-key">{k}</span><span className="pmt-budget-val">{v}</span></div>
                        ))}
                        {bb.total_cost && (
                            <div className="pmt-budget-row pmt-budget-row--total">
                                <span className="pmt-budget-key">Total Estimated Cost</span>
                                <span className="pmt-budget-val">{bb.total_cost}</span>
                            </div>
                        )}
                        {bb.per_person_cost && (
                            <div className="pmt-budget-row pmt-budget-row--person">
                                <span className="pmt-budget-key">Per Person Cost</span>
                                <span className="pmt-budget-val">{bb.per_person_cost}</span>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Travel Tips */}
            {plan.travel_tips?.length > 0 && (
                <section className="pmt-section">
                    <div className="pmt-section-label">Travel Tips</div>
                    <ul className="pmt-tips-list">
                        {plan.travel_tips.map((tip, i) => (
                            <li key={i} className="pmt-tip-item"><span className="pmt-tip-dot" />{tip}</li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Emergency Contacts */}
            {plan.emergency_contacts && (
                <section className="pmt-section">
                    <div className="pmt-section-label">Emergency Contacts</div>
                    <div className="pmt-emg-grid">
                        {[
                            { label: 'Nearest Hospital', value: plan.emergency_contacts.nearest_hospital },
                            { label: 'Police Station', value: plan.emergency_contacts.police_station },
                            { label: 'Tourist Helpline', value: plan.emergency_contacts.tourist_helpline || '1363' },
                            { label: 'Emergency Numbers', value: (plan.emergency_contacts.emergency_numbers || []).join(', ') },
                        ].filter(i => i.value).map(item => (
                            <div key={item.label} className="pmt-emg-card">
                                <span className="pmt-emg-label">{item.label}</span>
                                <span className="pmt-emg-val">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Bottom action bar */}
            <div className="pmt-bottom-bar">
                <button className="pmt-dl-btn pmt-dl-btn--lg" onClick={() => downloadPlanAsPDF(plan, form)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Plan as PDF
                </button>
                <button className="pmt-reset-btn pmt-reset-btn--lg" onClick={onReset}>Plan Another Trip</button>
            </div>
        </div>
    );
};

/* ───── Validation ───── */
const validate = (step, form) => {
    if (step === 0) return form.source_city.trim() && form.destination_state && form.destination_city && form.start_date && form.end_date && new Date(form.end_date) >= new Date(form.start_date);
    if (step === 1) return form.adults && parseInt(form.adults) >= 1 && form.travel_type && form.total_budget && parseInt(form.total_budget) >= 1000 && form.budget_type;
    if (step === 2) return form.transport_mode && form.hotel_type && form.food_type && form.activity_level;
    return true;
};

/* ───── Initial State ───── */
const INIT = {
    source_city: '', destination_state: '', destination_city: '',
    start_date: '', end_date: '',
    adults: 1, children: 0, travel_type: '',
    total_budget: '', budget_type: '',
    transport_mode: '', transport_class: '',
    hotel_type: '', food_type: '', activity_level: '', interests: [],
};

/* ───── Main Component ───── */
const PlanMyTrip = ({ onBack }) => {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(INIT);
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState(null);
    const [error, setError] = useState('');

    const canProceed = validate(step, form);
    const next = () => { if (canProceed) { setStep(s => s + 1); window.scrollTo(0, 0); } };
    const prev = () => { setStep(s => s - 1); window.scrollTo(0, 0); };

    const handleGenerate = async () => {
        setLoading(true);
        setError('');

        const days = form.start_date && form.end_date
            ? Math.max(1, Math.round((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1)
            : 3;
        const totalTravelers = (parseInt(form.adults) || 1) + (parseInt(form.children) || 0);
        const perPersonPerDay = Math.round(parseInt(form.total_budget) / totalTravelers / days);

        const detectConflict = () => {
            const minDay = MIN_BUDGET_PER_PERSON_DAY[form.budget_type] || 0;
            return perPersonPerDay < minDay;
        };

        const userMessage = `Generate a detailed, accurate trip plan with the following requirements:

TRIP DETAILS:
- Source: ${form.source_city}
- Destination: ${form.destination_city}, ${form.destination_state}
- Start date: ${form.start_date}, End date: ${form.end_date} (${days} days total)
- Total travelers: ${totalTravelers} (${form.adults} adult(s), ${form.children} child(ren))
- Travel group type: ${form.travel_type}

BUDGET:
- Total budget: INR ${form.total_budget}
- Per person per day: approximately INR ${perPersonPerDay}
- Budget category: ${form.budget_type}
${detectConflict() ? `\n- IMPORTANT: The budget may not match the selected category. Adapt the plan to fit within INR ${form.total_budget} total. Use budget_conflict: true and explain adjustments in travel_tips.` : ''}

TRANSPORT PREFERENCES:
- Preferred mode: ${form.transport_mode}
- Class/tier: ${form.transport_class || 'any appropriate for budget'}
- Suggest specific REAL train names and numbers if train is selected (e.g., "Ajmer Shatabdi 12015", "Palace on Wheels")

ACCOMMODATION:
- Type requested: ${form.hotel_type}
- Adjust if budget doesn't support it

FOOD:
- Preference: ${form.food_type}
- Include local specialty restaurants

TRIP STYLE:
- Activity level: ${form.activity_level}
- Interests: ${form.interests.length ? form.interests.join(', ') : 'general sightseeing and local culture'}

REQUIREMENTS:
- Calculate ALL costs for ALL ${totalTravelers} travelers across ${days} days
- Include realistic train/bus timings and fares
- Suggest 3-4 hotels with realistic current prices
- Create a practical day-wise itinerary (account for travel time on Day 1 and Day ${days})
- Budget breakdown must add up to a total matching approximately INR ${form.total_budget}
- Include at least 5 specific travel tips relevant to ${form.destination_city}`;

        try {
            const completion = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: buildSystemPrompt() },
                    { role: 'user', content: userMessage },
                ],
                max_tokens: 4000,
                temperature: 0.5,
            });

            const raw = completion.choices[0]?.message?.content || '';
            // Extract JSON even if wrapped in markdown fences
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON in response');
            const parsed = JSON.parse(jsonMatch[0]);
            setPlan(parsed);
            window.scrollTo(0, 0);
        } catch (err) {
            console.error('Plan generation error:', err);
            setError('Unable to generate the trip plan. This may be due to a network issue or API limit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetAll = () => { setStep(0); setForm(INIT); setPlan(null); setError(''); window.scrollTo(0, 0); };

    return (
        <div className="pmt-root">
            {/* Header */}
            <header className="pmt-header">
                <button className="pmt-back-btn" onClick={plan ? resetAll : onBack} aria-label="Go back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div className="pmt-header-info">
                    <div className="pmt-header-avatar">PT</div>
                    <div>
                        <h1 className="pmt-header-title">Plan My Trip</h1>
                        <p className="pmt-header-sub">AI-Powered Trip Planner</p>
                    </div>
                </div>
                {!plan && !loading && (
                    <div className="pmt-header-step-badge">Step {step + 1} of {STEPS.length}</div>
                )}
            </header>

            {/* Body */}
            <div className="pmt-body">
                {plan ? (
                    <PlanOutput plan={plan} form={form} onReset={resetAll} />
                ) : loading ? (
                    <div className="pmt-generating">
                        <div className="pmt-spinner" />
                        <p className="pmt-generating-text">Generating your personalised trip plan...</p>
                        <p className="pmt-generating-sub">Analysing routes, trains, hotels, and costs for {form.destination_city}</p>
                    </div>
                ) : (
                    <>
                        {/* Progress */}
                        <div className="pmt-progress-wrap">
                            {STEPS.map((label, i) => (
                                <React.Fragment key={label}>
                                    <div className={`pmt-step-node ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
                                        <div className="pmt-step-circle">
                                            {i < step ? (
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            ) : i + 1}
                                        </div>
                                        <span className="pmt-step-label">{label}</span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={`pmt-step-connector ${i < step ? 'done' : ''}`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Form */}
                        <div className="pmt-form-card">
                            <h2 className="pmt-form-title">{STEPS[step]}</h2>
                            {step === 0 && <StepBasics form={form} setForm={setForm} />}
                            {step === 1 && <StepTravelers form={form} setForm={setForm} />}
                            {step === 2 && <StepPreferences form={form} setForm={setForm} />}
                            {step === 3 && <StepReview form={form} />}

                            {error && <p className="pmt-error">{error}</p>}

                            <div className="pmt-controls">
                                {step > 0 && <button className="pmt-btn pmt-btn--ghost" onClick={prev}>Back</button>}
                                {step < STEPS.length - 1 ? (
                                    <button className="pmt-btn pmt-btn--primary" onClick={next} disabled={!canProceed}>Continue</button>
                                ) : (
                                    <button className="pmt-btn pmt-btn--primary pmt-btn--generate" onClick={handleGenerate} disabled={loading}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                        Generate My Trip Plan
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PlanMyTrip;
