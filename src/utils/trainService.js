import { supabase } from './supabaseClient';

/**
 * Query the Supabase `trains` table.
 * Tries common column name conventions and falls back to mock data.
 */
export async function searchTrainsFromDB({ fromStation, toStation, date, travelClass }) {
    try {
        // First, probe the table to understand column names
        const { data: sample, error: sampleErr } = await supabase
            .from('trains')
            .select('*')
            .limit(1);

        if (sampleErr) throw new Error(sampleErr.message);

        if (!sample || sample.length === 0) {
            return generateMockTrains(fromStation, toStation, date, travelClass);
        }

        // Detect column names from first row
        const cols = Object.keys(sample[0]);
        const col = (candidates) => candidates.find(c => cols.includes(c)) || null;

        const fromCol = col(['from_station', 'from', 'source', 'origin', 'departure_station', 'from_city']);
        const toCol = col(['to_station', 'to', 'destination', 'arrival_station', 'to_city']);

        // Build query
        let query = supabase.from('trains').select('*');

        if (fromCol && fromStation) {
            query = query.ilike(fromCol, `%${fromStation}%`);
        }
        if (toCol && toStation) {
            query = query.ilike(toCol, `%${toStation}%`);
        }

        const { data, error } = await query.limit(20);
        if (error) throw new Error(error.message);

        if (!data || data.length === 0) {
            return generateMockTrains(fromStation, toStation, date, travelClass);
        }

        // Normalize to standard shape
        return data.map((row, i) => normalizeTrainRow(row, cols, i, fromStation, toStation, travelClass));

    } catch (err) {
        console.warn('Supabase trains error:', err.message, '— using demo data');
        return generateMockTrains(fromStation, toStation, date, travelClass);
    }
}

function normalizeTrainRow(row, cols, idx, from, to, travelClass) {
    const get = (...keys) => { for (const k of keys) if (row[k] !== undefined && row[k] !== null) return row[k]; return null; };

    return {
        id: get('id', 'train_id') ?? idx,
        trainNumber: String(get('train_number', 'number', 'train_no', 'code') ?? `TM${1000 + idx}`),
        trainName: get('train_name', 'name', 'title') ?? `Train ${1000 + idx}`,
        trainType: get('type', 'train_type', 'category') ?? 'EXP',
        fromStation: get('from_station', 'from', 'source', 'origin', 'from_city') ?? from,
        toStation: get('to_station', 'to', 'destination', 'to_city') ?? to,
        departure: get('departure_time', 'dep_time', 'departure', 'dep') ?? '07:00',
        arrival: get('arrival_time', 'arr_time', 'arrival', 'arr') ?? '14:00',
        duration: get('duration', 'travel_time', 'journey_time') ?? '7h 0m',
        distance: get('distance', 'dist', 'km') ?? null,
        fare: get('fare', 'price', 'cost', 'rate', `${travelClass?.toLowerCase()}_fare`, 'sl_fare', 'base_fare') ?? null,
        availability: get('availability', 'seats', 'available_seats', 'seat_count') ?? 'Available',
        runningDays: get('running_days', 'days', 'operates_on') ?? 'Mon-Sun',
        requestedClass: travelClass,
        isMock: false,
    };
}

// ─── Common Indian stations for suggestions ──────────────────────────────────
export const stationList = [
    { name: 'New Delhi', code: 'NDLS' },
    { name: 'Delhi Junction', code: 'DLI' },
    { name: 'Hazrat Nizamuddin', code: 'NZM' },
    { name: 'Mumbai Central', code: 'MMCT' },
    { name: 'Mumbai CST', code: 'CSTM' },
    { name: 'Bandra Terminus', code: 'BDTS' },
    { name: 'Bangalore City', code: 'SBC' },
    { name: 'Bangalore Cant', code: 'BNC' },
    { name: 'Yeshvantpur', code: 'YPR' },
    { name: 'Hyderabad Deccan', code: 'HYB' },
    { name: 'Secunderabad', code: 'SC' },
    { name: 'Chennai Central', code: 'MAS' },
    { name: 'Chennai Egmore', code: 'MS' },
    { name: 'Kolkata Howrah', code: 'HWH' },
    { name: 'Kolkata Sealdah', code: 'SDAH' },
    { name: 'Ahmedabad', code: 'ADI' },
    { name: 'Surat', code: 'ST' },
    { name: 'Vadodara', code: 'BRC' },
    { name: 'Pune Junction', code: 'PUNE' },
    { name: 'Nashik Road', code: 'NK' },
    { name: 'Jaipur Junction', code: 'JP' },
    { name: 'Jodhpur Junction', code: 'JU' },
    { name: 'Udaipur City', code: 'UDZ' },
    { name: 'Ajmer Junction', code: 'AII' },
    { name: 'Bikaner Junction', code: 'BKN' },
    { name: 'Lucknow', code: 'LKO' },
    { name: 'Lucknow NR', code: 'LJN' },
    { name: 'Kanpur Central', code: 'CNB' },
    { name: 'Agra Cantt', code: 'AGC' },
    { name: 'Mathura Junction', code: 'MTJ' },
    { name: 'Varanasi', code: 'BSB' },
    { name: 'Allahabad Junction', code: 'ALD' },
    { name: 'Meerut City', code: 'MTC' },
    { name: 'Ghaziabad', code: 'GZB' },
    { name: 'Amritsar Junction', code: 'ASR' },
    { name: 'Ludhiana Junction', code: 'LDH' },
    { name: 'Chandigarh', code: 'CDG' },
    { name: 'Jammu Tawi', code: 'JAT' },
    { name: 'Patna Junction', code: 'PNBE' },
    { name: 'Gaya Junction', code: 'GAYA' },
    { name: 'Dhanbad Junction', code: 'DHN' },
    { name: 'Ranchi', code: 'RNC' },
    { name: 'Bhubaneswar', code: 'BBS' },
    { name: 'Puri', code: 'PURI' },
    { name: 'Visakhapatnam', code: 'VSKP' },
    { name: 'Vijayawada', code: 'BZA' },
    { name: 'Tirupati', code: 'TPTY' },
    { name: 'Coimbatore', code: 'CBE' },
    { name: 'Madurai Junction', code: 'MDU' },
    { name: 'Trichy Junction', code: 'TPJ' },
    { name: 'Kochi Ernakulam', code: 'ERS' },
    { name: 'Thiruvananthapuram', code: 'TVC' },
    { name: 'Kozhikode', code: 'CLT' },
    { name: 'Goa Madgaon', code: 'MAO' },
    { name: 'Margao', code: 'MAO' },
    { name: 'Panaji (Thivim)', code: 'THVM' },
    { name: 'Mangalore Central', code: 'MAQ' },
    { name: 'Bhopal Junction', code: 'BPL' },
    { name: 'Indore Junction', code: 'INDB' },
    { name: 'Gwalior Junction', code: 'GWL' },
    { name: 'Nagpur Junction', code: 'NGP' },
    { name: 'Aurangabad', code: 'AWB' },
    { name: 'Raipur Junction', code: 'R' },
    { name: 'Bilaspur Junction', code: 'BSP' },
    { name: 'Guwahati', code: 'GHY' },
    { name: 'Siliguri Junction', code: 'SGUJ' },
    { name: 'Agartala', code: 'AGTL' },
    { name: 'Dehradun', code: 'DDN' },
    { name: 'Haridwar', code: 'HW' },
    { name: 'Shimla', code: 'SML' },
    { name: 'Jammu', code: 'JAT' },
];


export const trainClassOptions = [
    { code: 'SL', label: 'Sleeper (SL)' },
    { code: '3A', label: 'AC 3 Tier (3A)' },
    { code: '2A', label: 'AC 2 Tier (2A)' },
    { code: '1A', label: 'AC First Class (1A)' },
    { code: 'CC', label: 'Chair Car (CC)' },
    { code: 'EC', label: 'Exec Chair Car (EC)' },
    { code: '2S', label: 'Second Seating (2S)' },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_TRAINS = [
    { name: 'Rajdhani Express', type: 'RAJ', depH: 16, arrH: 8, dur: '16h 00m' },
    { name: 'Shatabdi Express', type: 'SHT', depH: 6, arrH: 14, dur: '8h 00m' },
    { name: 'Duronto Express', type: 'DUR', depH: 20, arrH: 8, dur: '12h 00m' },
    { name: 'Vande Bharat', type: 'VB', depH: 6, arrH: 12, dur: '6h 00m' },
    { name: 'Garib Rath', type: 'GR', depH: 22, arrH: 10, dur: '12h 00m' },
    { name: 'Humsafar Express', type: 'HSF', depH: 8, arrH: 20, dur: '12h 00m' },
    { name: 'Tejas Express', type: 'TEJ', depH: 5, arrH: 13, dur: '8h 00m' },
];
const FARES = { SL: 450, '3A': 1200, '2A': 1800, '1A': 3200, CC: 800, EC: 1500, '2S': 250 };

function pad(n) { return String(n).padStart(2, '0'); }
function generateMockTrains(from, to, date, cls) {
    return MOCK_TRAINS.map((t, i) => {
        const arr = (t.depH + parseInt(t.dur)) % 24;
        const fare = FARES[cls] ? FARES[cls] + (i * 80 - 150) : null;
        return {
            id: i,
            trainNumber: String(12301 + i * 7),
            trainName: t.name,
            trainType: t.type,
            fromStation: from || 'New Delhi',
            toStation: to || 'Mumbai Central',
            departure: `${pad(t.depH)}:00`,
            arrival: `${pad(t.arrH)}:00`,
            duration: t.dur,
            distance: String(1400 + i * 60),
            fare: fare ? `₹${fare}` : null,
            availability: i < 4 ? 'Available' : i === 4 ? 'RAC 12' : 'WL 23',
            runningDays: 'Daily',
            requestedClass: cls,
            isMock: true,
        };
    });
}
