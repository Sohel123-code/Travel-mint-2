const AVIATION_KEY = import.meta.env.VITE_AVIATION_STACK_API_KEY;

// Map of common Indian city names to IATA codes
export const indianAirports = [
    { city: 'Delhi', iata: 'DEL', name: 'Indira Gandhi International' },
    { city: 'Mumbai', iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International' },
    { city: 'Bangalore', iata: 'BLR', name: 'Kempegowda International' },
    { city: 'Hyderabad', iata: 'HYD', name: 'Rajiv Gandhi International' },
    { city: 'Chennai', iata: 'MAA', name: 'Chennai International' },
    { city: 'Kolkata', iata: 'CCU', name: 'Netaji Subhas Chandra Bose International' },
    { city: 'Ahmedabad', iata: 'AMD', name: 'Sardar Vallabhbhai Patel International' },
    { city: 'Pune', iata: 'PNQ', name: 'Pune Airport' },
    { city: 'Jaipur', iata: 'JAI', name: 'Jaipur International' },
    { city: 'Goa (Dabolim)', iata: 'GOA', name: 'Goa International (Dabolim)' },
    { city: 'Goa (Mopa)', iata: 'GOX', name: 'Manohar International Airport' },
    { city: 'Lucknow', iata: 'LKO', name: 'Chaudhary Charan Singh International' },
    { city: 'Kochi', iata: 'COK', name: 'Cochin International' },
    { city: 'Chandigarh', iata: 'IXC', name: 'Chandigarh Airport' },
    { city: 'Guwahati', iata: 'GAU', name: 'Lokpriya Gopinath Bordoloi International' },
    { city: 'Bhopal', iata: 'BHO', name: 'Raja Bhoj Airport' },
    { city: 'Varanasi', iata: 'VNS', name: 'Lal Bahadur Shastri International' },
    { city: 'Amritsar', iata: 'ATQ', name: 'Sri Guru Ram Dass Jee International' },
    { city: 'Coimbatore', iata: 'CJB', name: 'Coimbatore International' },
    { city: 'Indore', iata: 'IDR', name: 'Devi Ahilya Bai Holkar Airport' },
    { city: 'Nagpur', iata: 'NAG', name: 'Dr. Babasaheb Ambedkar International' },
    { city: 'Patna', iata: 'PAT', name: 'Jay Prakash Narayan International' },
    { city: 'Ranchi', iata: 'IXR', name: 'Birsa Munda Airport' },
    { city: 'Srinagar', iata: 'SXR', name: 'Sheikh ul-Alam International' },
    { city: 'Leh', iata: 'IXL', name: 'Kushok Bakula Rimpochee Airport' },
    { city: 'Dehradun', iata: 'DED', name: 'Jolly Grant Airport' },
    { city: 'Udaipur', iata: 'UDR', name: 'Maharana Pratap Airport' },
    { city: 'Jodhpur', iata: 'JDH', name: 'Jodhpur Airport' },
    { city: 'Mangalore', iata: 'IXE', name: 'Mangalore International' },
    { city: 'Thiruvananthapuram', iata: 'TRV', name: 'Trivandrum International' },
    { city: 'Visakhapatnam', iata: 'VTZ', name: 'Visakhapatnam Airport' },
    { city: 'Madurai', iata: 'IXM', name: 'Madurai Airport' },
    { city: 'Tirupati', iata: 'TIR', name: 'Tirupati Airport' },
    { city: 'Vijayawada', iata: 'VGA', name: 'Vijayawada Airport' },
    { city: 'Raipur', iata: 'RPR', name: 'Swami Vivekananda Airport' },
    { city: 'Bhubaneswar', iata: 'BBI', name: 'Biju Patnaik International' },
    { city: 'Hubli', iata: 'HBX', name: 'Hubli Airport' },
    { city: 'Mysore', iata: 'MYQ', name: 'Mysore Airport' },
    { city: 'Aurangabad', iata: 'IXU', name: 'Aurangabad Airport' },
    { city: 'Kolhapur', iata: 'KLH', name: 'Kolhapur Airport' },
    { city: 'Nashik', iata: 'ISK', name: 'Ozar Airport' },
    { city: 'Surat', iata: 'STV', name: 'Surat Airport' },
    { city: 'Vadodara', iata: 'BDQ', name: 'Vadodara Airport' },
    { city: 'Rajkot', iata: 'RAJ', name: 'Rajkot Airport' },
    { city: 'Bhavnagar', iata: 'BHU', name: 'Bhavnagar Airport' },
    { city: 'Jammu', iata: 'IXJ', name: 'Jammu Airport' },
    { city: 'Shimla', iata: 'SLV', name: 'Shimla Airport' },
    { city: 'Kullu', iata: 'KUU', name: 'Bhuntar Airport' },
    { city: 'Agra', iata: 'AGR', name: 'Agra Airport' },
    { city: 'Kanpur', iata: 'KNU', name: 'Kanpur Airport' },
    { city: 'Gorakhpur', iata: 'GOP', name: 'Gorakhpur Airport' },
    { city: 'Agartala', iata: 'IXA', name: 'Maharaja Bir Bikram Airport' },
    { city: 'Imphal', iata: 'IMF', name: 'Imphal Airport' },
    { city: 'Dibrugarh', iata: 'DIB', name: 'Dibrugarh Airport' },
    { city: 'Jorhat', iata: 'JRH', name: 'Jorhat Airport' },
];


// ─── Generate realistic mock flights ─────────────────────────────────────────
const AIRLINES = [
    { name: 'IndiGo', iata: '6E' },
    { name: 'Air India', iata: 'AI' },
    { name: 'SpiceJet', iata: 'SG' },
    { name: 'Vistara', iata: 'UK' },
    { name: 'Go First', iata: 'G8' },
    { name: 'AirAsia India', iata: 'I5' },
    { name: 'Akasa Air', iata: 'QP' },
    { name: 'Blue Dart', iata: 'BZ' },
];

const STATUSES = ['scheduled', 'active', 'active', 'scheduled', 'scheduled', 'landed'];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function padZ(n) { return String(n).padStart(2, '0'); }

function generateMockFlights(fromIata, toIata, date, count = 10) {
    const fromAp = indianAirports.find(a => a.iata === fromIata) || { city: fromIata, name: fromIata };
    const toAp = indianAirports.find(a => a.iata === toIata) || { city: toIata, name: toIata };

    return Array.from({ length: count }, (_, i) => {
        const airline = AIRLINES[i % AIRLINES.length];
        const flightNum = `${airline.iata}${randomInt(100, 999)}`;
        const depHour = randomInt(5, 22);
        const depMin = [0, 10, 15, 20, 25, 30, 40, 45, 50][randomInt(0, 8)];
        const durationH = randomInt(1, 3);
        const durationM = [0, 15, 30, 45][randomInt(0, 3)];
        const arrHour = (depHour + durationH + Math.floor((depMin + durationM) / 60)) % 24;
        const arrMin = (depMin + durationM) % 60;
        const status = STATUSES[randomInt(0, STATUSES.length - 1)];
        const delay = status === 'active' && randomInt(0, 3) === 0 ? randomInt(10, 45) : 0;
        const terminals = ['1', '2', '3', 'T1', 'T2', 'T3', 'D'];
        const gates = ['A1', 'B3', 'C7', 'D2', 'E5', 'F9', 'G4'];
        const aircraft = ['B738', 'A320', 'B777', 'A321', 'A319', 'B737', 'A330'][randomInt(0, 6)];

        return {
            id: `${flightNum}-${depHour}${depMin}`,
            airline: airline.name,
            airlineIata: airline.iata,
            flightNumber: flightNum,
            status,
            departure: {
                airport: fromAp.name || fromIata,
                iata: fromIata,
                scheduled: `${date}T${padZ(depHour)}:${padZ(depMin)}:00+05:30`,
                estimated: `${date}T${padZ(depHour)}:${padZ(depMin)}:00+05:30`,
                actual: status === 'landed' ? `${date}T${padZ(depHour)}:${padZ(depMin)}:00+05:30` : null,
                terminal: terminals[randomInt(0, terminals.length - 1)],
                gate: gates[randomInt(0, gates.length - 1)],
                delay,
            },
            arrival: {
                airport: toAp.name || toIata,
                iata: toIata,
                scheduled: `${date}T${padZ(arrHour)}:${padZ(arrMin)}:00+05:30`,
                estimated: `${date}T${padZ(arrHour)}:${padZ(arrMin)}:00+05:30`,
                terminal: terminals[randomInt(0, terminals.length - 1)],
                gate: gates[randomInt(0, gates.length - 1)],
            },
            aircraft,
            live: status === 'active' ? { altitude: randomInt(8000, 12000), speed_horizontal: randomInt(700, 900) } : null,
            isMock: true,
        };
    }).sort((a, b) => a.departure.scheduled.localeCompare(b.departure.scheduled));
}

// ─── Map raw API data ─────────────────────────────────────────────────────────
function mapApiFlights(flightList) {
    return flightList.map(flight => ({
        id: `${flight.flight?.iata || 'N/A'}-${flight.departure?.scheduled}`,
        airline: flight.airline?.name || 'Unknown Airline',
        airlineIata: flight.airline?.iata || '',
        flightNumber: flight.flight?.iata || flight.flight?.number || 'N/A',
        status: flight.flight_status || 'scheduled',
        departure: {
            airport: flight.departure?.airport || '',
            iata: flight.departure?.iata || '',
            scheduled: flight.departure?.scheduled,
            estimated: flight.departure?.estimated,
            actual: flight.departure?.actual,
            terminal: flight.departure?.terminal,
            gate: flight.departure?.gate,
            delay: flight.departure?.delay,
        },
        arrival: {
            airport: flight.arrival?.airport || '',
            iata: flight.arrival?.iata || '',
            scheduled: flight.arrival?.scheduled,
            estimated: flight.arrival?.estimated,
            terminal: flight.arrival?.terminal,
            gate: flight.arrival?.gate,
        },
        aircraft: flight.aircraft?.iata || null,
        live: flight.live || null,
        isMock: false,
    }));
}

/**
 * Search for flights between two airports on a given date.
 * Free plan: fetches general data and filters client-side. Falls back to realistic mock data.
 */
export async function searchFlights({ fromIata, toIata, date, limit = 15 }) {
    if (!AVIATION_KEY) {
        console.warn('No Aviation Stack key — using demo data');
        return generateMockFlights(fromIata, toIata, date, limit);
    }

    try {
        // Free plan: use HTTP (not HTTPS) and filter by dep_iata only (most supported param)
        // Also try without flight_date first if filtered date fails
        const params = new URLSearchParams({
            access_key: AVIATION_KEY,
            dep_iata: fromIata,
            arr_iata: toIata,
            limit: '100',
        });

        const url = `http://api.aviationstack.com/v1/flights?${params.toString()}`;
        const response = await fetch(url);

        if (response.status === 403) {
            // Free plan limitation — use mock data for demo
            console.warn('Aviation Stack 403 (free plan limitation) — using demo flight data');
            return generateMockFlights(fromIata, toIata, date, limit);
        }

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        if (data.error) {
            console.warn('Aviation Stack error:', data.error.message, '— using demo data');
            return generateMockFlights(fromIata, toIata, date, limit);
        }

        const flights = data.data || [];

        // Client-side filter by route
        const filtered = flights.filter(f => {
            const dep = (f.departure?.iata || '').toUpperCase();
            const arr = (f.arrival?.iata || '').toUpperCase();
            return dep === fromIata.toUpperCase() && arr === toIata.toUpperCase();
        });

        const mapped = mapApiFlights(filtered.length > 0 ? filtered : flights.slice(0, limit));

        // If we got data but nothing matched route, still show it with mock supplement
        if (mapped.length === 0) {
            return generateMockFlights(fromIata, toIata, date, limit);
        }

        return mapped.slice(0, limit);

    } catch (err) {
        console.warn('Aviation Stack fetch error:', err.message, '— using demo data');
        return generateMockFlights(fromIata, toIata, date, limit);
    }
}

// ─── Utilities ────────────────────────────────────────────────────────────────
export function formatFlightTime(isoString) {
    if (!isoString) return 'N/A';
    try {
        const d = new Date(isoString);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return 'N/A'; }
}

export function flightDuration(dep, arr) {
    if (!dep || !arr) return 'N/A';
    try {
        const diff = new Date(arr).getTime() - new Date(dep).getTime();
        if (diff <= 0) return 'N/A';
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        return `${h}h ${m}m`;
    } catch { return 'N/A'; }
}

export function statusColor(status) {
    const map = {
        active: '#22c55e',
        landed: '#3b82f6',
        scheduled: '#C6A75E',
        cancelled: '#ef4444',
        incident: '#f97316',
        diverted: '#a855f7',
    };
    return map[status] || '#C6A75E';
}
