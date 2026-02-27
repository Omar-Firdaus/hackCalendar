// js/state.js
import { getUniqueDates, getUniqueTracks } from './utils.js';

class ScheduleState {
    constructor() {
        this.allEvents = [];
        this.filteredEvents = [];
        this.dates = [];
        this.tracks = [];
        this.filters = {
            date: null,
            track: 'all',
            search: ''
        };
        this.listeners = [];
    }

    setEvents(events) {
        this.allEvents = events;
        this.dates = getUniqueDates(events);
        this.tracks = getUniqueTracks(events);

        if (this.dates.length > 0 && !this.filters.date) {
            this.filters.date = this.dates[0];
        }

        this.applyFilters();
    }

    setFilter(key, value) {
        this.filters[key] = value;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredEvents = this.allEvents.filter(event => {
            // Filter by Date
            if (this.filters.date && event.date !== this.filters.date) return false;

            // Filter by Track
            if (this.filters.track !== 'all' && event.track !== this.filters.track) return false;

            // Filter by Search (Name or Speaker)
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const matchName = event.name.toLowerCase().includes(searchLower);
                const matchSpeaker = (event.speaker || '').toLowerCase().includes(searchLower);
                if (!matchName && !matchSpeaker) return false;
            }

            return true;
        });

        // Sort events by start time (assuming basic time string 10:00 AM format)
        // We will do a generic sort
        this.filteredEvents.sort((a, b) => {
            // Sort by Date then Start Time
            const timeA = new Date(`1970/01/01 ${a.startTime || '00:00'}`).getTime();
            const timeB = new Date(`1970/01/01 ${b.startTime || '00:00'}`).getTime();
            return timeA - timeB;
        });

        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this));
    }
}

export const state = new ScheduleState();
