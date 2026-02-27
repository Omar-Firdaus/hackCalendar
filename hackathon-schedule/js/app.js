// js/app.js
import { fetchSchedule } from './api.js';
import { state } from './state.js';
import { ui } from './ui.js';
import { debounce, parseEventDateTime } from './utils.js';

let liveInterval;

// Setup Event Listeners matching DOM elements to State
function setupFilterListeners() {
    const searchInput = document.getElementById('searchInput');
    const trackFilter = document.getElementById('trackFilter');

    // Debounce search to prevent excessive re-renders
    searchInput.addEventListener('input', debounce((e) => {
        state.setFilter('search', e.target.value);
    }, 300));

    trackFilter.addEventListener('change', (e) => {
        state.setFilter('track', e.target.value);
    });
}

// Function triggered when state changes
function onStateChange(currentState) {
    ui.renderDateTabs(currentState.dates, currentState.filters.date, (newDate) => {
        state.setFilter('date', newDate);
    });

    // We only want to populate Track options once based on all events
    // but doing it on state change is fine if we only do it initially.
    // Small optimization: only render tracks once if needed, or re-render
    ui.renderTrackOptions(currentState.tracks);

    ui.renderEvents(currentState.filteredEvents);

    // Update live status immediately on render
    ui.updateLiveStatus(currentState.allEvents, parseEventDateTime);
}

// Initialization function
async function init() {
    ui.showLoading();
    setupFilterListeners();

    // Subscribe UI to state updates
    state.subscribe(onStateChange);

    try {
        const events = await fetchSchedule();

        // If data is fetched successfully, populate state
        state.setEvents(events);

        // Start interval for live updates
        if (liveInterval) clearInterval(liveInterval);
        liveInterval = setInterval(() => {
            ui.updateLiveStatus(state.allEvents, parseEventDateTime);
        }, 60000); // Check every minute
    } catch (error) {
        ui.showError(error.message);
    }
}

// Run init when DOM is fully loaded just in case
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
