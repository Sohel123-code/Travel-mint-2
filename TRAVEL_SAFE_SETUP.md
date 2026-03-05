# Travel Safe Module - Setup Guide

## Overview
The Travel Safe module replaces the Voice Translator feature and provides:
- State-specific scam alerts from Supabase
- Emergency contact numbers (Police, Ambulance, Fire Brigade)
- Direct call functionality for emergency numbers

## Changes Made

### 1. Removed Voice Translator
- Deleted `api/translate-and-speak.js`
- Removed voice translator from Sidebar module list
- Server-side voice translation code remains but is unused by frontend

### 2. Added Travel Safe Module
- Created `src/components/TravelSafe.jsx` - Main component
- Created `src/components/TravelSafe.css` - Styling
- Updated `src/components/Sidebar.jsx` - Changed module from voice translator to Travel Safe
- Updated `src/App.jsx` - Integrated Travel Safe panel with state management
- Updated `src/App.css` - Added overlay styles for Travel Safe panel

## Database Schema

### Supabase Table: `scams`

Create this table in your Supabase project:

```sql
CREATE TABLE scams (
  id SERIAL PRIMARY KEY,
  state VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  prevention_tips TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add index for faster state queries
CREATE INDEX idx_scams_state ON scams(state);
```

### Sample Data

```sql
-- Rajasthan scams
INSERT INTO scams (state, title, description, prevention_tips) VALUES
('rajasthan', 'Fake Tour Guides', 'Unauthorized guides approach tourists near monuments offering cheap tours but take them to overpriced shops for commissions.', 'Only hire government-certified guides. Check their ID cards and badges.'),
('rajasthan', 'Gem Scam', 'Scammers convince tourists to buy gems at inflated prices, promising they can resell them for profit abroad.', 'Never buy gems or jewelry from street vendors. Purchase only from certified government emporiums.'),
('rajasthan', 'Camel Safari Overcharging', 'Tour operators quote low prices initially but add hidden charges for water, food, and accommodation.', 'Get everything in writing before booking. Clarify all inclusions and exclusions.');

-- Himachal Pradesh scams
INSERT INTO scams (state, title, description, prevention_tips) VALUES
('himachal', 'Taxi Meter Manipulation', 'Taxi drivers refuse to use meters or manipulate them to charge excessive fares.', 'Use app-based cabs or negotiate and fix the fare before starting the journey.'),
('himachal', 'Adventure Activity Scams', 'Unregistered operators offer paragliding and rafting at cheap rates without proper safety equipment.', 'Book only with registered operators. Check for safety certifications and equipment quality.'),
('himachal', 'Hotel Booking Fraud', 'Fake hotel booking websites or agents take advance payments and disappear.', 'Book through verified platforms. Verify hotel contact details independently before payment.');

-- Uttarakhand scams
INSERT INTO scams (state, title, description, prevention_tips) VALUES
('uttarakhand', 'Pilgrimage Package Fraud', 'Fake travel agents offer Char Dham packages at low prices but provide substandard services or disappear.', 'Book through registered travel agencies. Verify credentials with tourism department.'),
('uttarakhand', 'Pony/Porter Overcharging', 'Pony and porter services near temples charge exorbitant rates, especially for elderly tourists.', 'Check official rate cards displayed at starting points. Negotiate clearly before hiring.'),
('uttarakhand', 'Fake Ashram Donations', 'Scammers pose as ashram representatives collecting donations for fake charitable causes.', 'Donate directly at registered ashrams. Ask for official receipts and verify authenticity.');
```

## State ID Mapping

The component uses these state IDs (must match your Supabase data):
- `rajasthan` - Rajasthan
- `himachal` - Himachal Pradesh  
- `uttarakhand` - Uttarakhand

## Emergency Numbers

The module displays these emergency contacts with direct call functionality:
- Police: 100
- Ambulance: 102
- Fire Brigade: 101

## Usage

1. Click the menu icon in the navbar to open the Sidebar
2. Click "Travel Safe" module
3. The Travel Safe panel slides in from the right
4. If viewing a specific state, scam alerts for that state are displayed
5. Click emergency numbers to initiate a phone call
6. Click the X button to close the panel

## Environment Variables

Ensure these are set in your `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing

1. Start the development server: `npm run dev`
2. Navigate to a state (e.g., Rajasthan)
3. Open the Sidebar and click "Travel Safe"
4. Verify scam alerts load for the selected state
5. Test emergency call buttons (will open phone dialer on mobile)
