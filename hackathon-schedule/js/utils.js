/* js/utils.js */

/**
 * Parses the raw Google Sheets row array into a structured JSON object.
 * Based on the structure:
 * [0] Event ID, [1] Event Name, [2] Track, [3] Date, [4] Start Time,
 * [5] End Time, [6] Location, [7] Speaker, [8] Description, [9] Tags
 */
export function parseSheetData(values) {
    if (!values || values.length <= 1) return [];

    // Assuming first row is headers
    const headers = values[0];
    const rows = values.slice(1);

    return rows.map((row, index) => {
        // Only return if there is an Event Name (index 1)
        if (!row[1] || row[1].trim() === '') return null;

        return {
            id: row[0] || `evt-${index}`,
            name: row[1] || 'Untitled Event',
            track: row[2] || 'General',
            date: row[3] || '',
            startTime: row[4] || '',
            endTime: row[5] || '',
            location: row[6] || 'TBA',
            speaker: row[7] || '',
            description: row[8] || 'No description available.',
            tags: row[9] ? row[9].split(',').map(t => t.trim()) : []
        };
    }).filter(event => event !== null);
}

/**
 * Gets unique sorted dates from the events array.
 */
export function getUniqueDates(events) {
    const dates = new Set(events.map(e => e.date).filter(d => d !== ''));
    // Sort dates chronologically or just alphabetically based on format
    return Array.from(dates).sort((a, b) => new Date(a) - new Date(b));
}

/**
 * Gets unique tracks from the events array.
 */
export function getUniqueTracks(events) {
    const tracks = new Set(events.map(e => e.track).filter(t => t !== ''));
    return Array.from(tracks).sort();
}

/**
 * Generates a Google Calendar Event Link.
 * Format for dates needs to be YYYYMMDDTHHMMSSZ
 */
export function generateGoogleCalendarLink(event) {
    const formatTimeForGCal = (dateStr, timeStr) => {
        try {
            // Very basic parse, heavily depends on input format.
            // Ideally dates are YYYY-MM-DD and time is HH:MM PM
            // We use a simplified fallback here if parsing fails.
            const d = new Date(`${dateStr} ${timeStr}`);
            if (isNaN(d.getTime())) return null;

            return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
        } catch (e) {
            return null;
        }
    };

    const start = formatTimeForGCal(event.date, event.startTime);
    const end = formatTimeForGCal(event.date, event.endTime);

    // Fallback if date parsing fails
    if (!start) {
        return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(event.name)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    }

    const dates = end ? `${start}/${end}` : `${start}/${start}`;
    return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(event.name)}&dates=${dates}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
}

/**
 * Debounce function for search input.
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Parses event date and time strings into a Date object.
 */
export function parseEventDateTime(dateStr, timeStr) {
    if (!dateStr) return null;
    const dt = new Date(`${dateStr} ${timeStr || ''}`);
    return isNaN(dt.getTime()) ? null : dt;
}
