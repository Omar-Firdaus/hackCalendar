// js/api.js
import { SHEET_ID, API_KEY, SHEET_RANGE } from './config.js';
import { parseSheetData } from './utils.js';

/**
 * Fetches data from the Google Sheets API.
 * @returns {Promise<Array>} Array of parsed event objects.
 */
export async function fetchSchedule() {
    if (!SHEET_ID || SHEET_ID === 'YOUR_SHEET_ID_HERE' || !API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('API Key or Sheet ID missing. Loading mock data for demonstration.');
        const mockNow = new Date();
        const ymd = mockNow.toISOString().split('T')[0];

        // Generate dynamic mock times around "now" to test "Live" feature
        const h = mockNow.getHours();
        const mStr = mockNow.getMinutes().toString().padStart(2, '0');
        const nextHour = (h + 1) % 24;
        const prevHour = (h - 1 < 0) ? 23 : h - 1;

        return [
            { id: 'evt-1', name: 'Opening Ceremony', track: 'General', date: ymd, startTime: `${prevHour}:00`, endTime: `${h}:00`, location: 'Main Stage', speaker: 'Team', description: 'Welcome to the Hackathon!', tags: ['Welcome'] },
            { id: 'evt-2', name: 'Live Coding Session', track: 'Engineering', date: ymd, startTime: `${h}:00`, endTime: `${nextHour}:00`, location: 'Room A', speaker: 'Jane Doe', description: 'This event is currently happening.', tags: ['Code', 'Live'] },
            { id: 'evt-3', name: 'Design System Workshop', track: 'Design', date: ymd, startTime: `${nextHour}:${mStr}`, endTime: `${(nextHour + 1) % 24}:${mStr}`, location: 'Room B', speaker: 'John Smith', description: 'Learn Figma basics.', tags: ['UX', 'UI'] },
            { id: 'evt-4', name: 'Pitching 101', track: 'Business', date: ymd, startTime: `${(nextHour + 2) % 24}:00`, endTime: `${(nextHour + 3) % 24}:00`, location: 'Room C', speaker: 'Alice M.', description: 'How to pitch to investors.', tags: ['Pitch'] }
        ];
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || 'Failed to fetch schedule data.');
        }

        const data = await response.json();
        const values = data.values;

        if (!values || values.length === 0) {
            console.warn('No data found in the spreadsheet.');
            return [];
        }

        return parseSheetData(values);
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
}
