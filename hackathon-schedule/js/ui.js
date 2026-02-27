// js/ui.js
import { generateGoogleCalendarLink } from './utils.js';

class UIManager {
    constructor() {
        this.timeline = document.getElementById('timeline');
        this.statusContainer = document.getElementById('statusContainer');
        this.trackFilter = document.getElementById('trackFilter');
        this.dateTabs = document.getElementById('dateTabs');

        // Modal elements
        this.modal = document.getElementById('eventModal');
        this.closeModalBtn = document.getElementById('closeModal');

        this.setupModalListeners();
    }

    showLoading() {
        this.statusContainer.style.display = 'flex';
        this.timeline.innerHTML = '';
        this.statusContainer.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading schedule...</p>
        `;
    }

    showError(message) {
        this.statusContainer.style.display = 'flex';
        this.timeline.innerHTML = '';
        this.statusContainer.innerHTML = `
            <div class="error-message">
                <strong>Error loading schedule:</strong><br/>
                ${message}
            </div>
            <p style="margin-top: 1rem; color: #64748b;">Please check your API key and Sheet ID in js/config.js.</p>
        `;
    }

    hideStatus() {
        this.statusContainer.style.display = 'none';
    }

    renderDateTabs(dates, activeDate, onTabClick) {
        this.dateTabs.innerHTML = '';
        dates.forEach(date => {
            const btn = document.createElement('button');
            btn.className = `date-tab ${date === activeDate ? 'active' : ''}`;
            const parsedDate = new Date(date);
            // Fallback to raw string if parsing fails, else format
            btn.textContent = isNaN(parsedDate) ? date : parsedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            btn.addEventListener('click', () => onTabClick(date));
            this.dateTabs.appendChild(btn);
        });
    }

    renderTrackOptions(tracks) {
        // Keep the "All Tracks" option
        const currentValue = this.trackFilter.value;
        this.trackFilter.innerHTML = '<option value="all">All Tracks</option>';

        tracks.forEach(track => {
            const option = document.createElement('option');
            option.value = track;
            option.textContent = track;
            this.trackFilter.appendChild(option);
        });

        // Restore previous selection if valid
        if (tracks.includes(currentValue)) {
            this.trackFilter.value = currentValue;
        }
    }

    renderEvents(events) {
        this.timeline.innerHTML = '';
        this.hideStatus();

        if (events.length === 0) {
            this.timeline.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No events found matching your criteria.</p>`;
            return;
        }

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.setAttribute('data-id', event.id);
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');

            card.innerHTML = `
                <div class="event-time-indicator">${event.startTime}</div>
                <div class="event-card-content">
                    <h3 class="event-title">${event.name}</h3>
                    <div class="event-meta" id="meta-${event.id}">
                        <span>${event.startTime} - ${event.endTime}</span>
                        ${event.location ? `<span>&bull; ${event.location}</span>` : ''}
                        ${event.speaker ? `<span>&bull; ${event.speaker}</span>` : ''}
                    </div>
                    <div class="tags-and-badges" id="badges-${event.id}">
                        <span class="track-badge">${event.track}</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => this.openModal(event));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openModal(event);
                }
            });

            this.timeline.appendChild(card);
        });
    }

    setupModalListeners() {
        this.closeModalBtn.addEventListener('click', () => this.closeModal());

        // Close on click outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal(event) {
        document.getElementById('modalTitle').textContent = event.name;
        document.getElementById('modalTrack').textContent = event.track;
        document.getElementById('modalTime').textContent = `${event.date} | ${event.startTime} - ${event.endTime}`;
        document.getElementById('modalLocation').textContent = event.location;
        document.getElementById('modalSpeaker').textContent = event.speaker || 'No Speaker designated';
        document.getElementById('modalDescription').textContent = event.description;

        const tagsContainer = document.getElementById('modalTags');
        tagsContainer.innerHTML = '';
        if (event.tags && event.tags.length > 0) {
            event.tags.forEach(tag => {
                if (!tag) return;
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });
        }

        const calendarBtn = document.getElementById('calendarBtn');
        calendarBtn.href = generateGoogleCalendarLink(event);

        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');

        // Focus trap or close button focus
        setTimeout(() => this.closeModalBtn.focus(), 100);
        document.body.style.overflow = 'hidden'; // prevent bg scrolling
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    updateLiveStatus(events, parseEventDateTime) {
        const now = new Date();
        const liveBanner = document.getElementById('liveBanner');
        let currentLiveEvents = [];
        let nextEvent = null;

        // Reset all cards
        document.querySelectorAll('.event-card').forEach(card => card.classList.remove('is-live'));
        document.querySelectorAll('.live-badge').forEach(badge => badge.remove());

        events.forEach(event => {
            const startStr = `${event.date} ${event.startTime}`;
            const endStr = `${event.date} ${event.endTime}`;

            // Try to parse dates, if they fail or are weird, we skip them dynamically
            const startTime = parseEventDateTime(event.date, event.startTime);
            const endTime = parseEventDateTime(event.date, event.endTime);

            if (!startTime || !endTime) return;

            if (now >= startTime && now <= endTime) {
                currentLiveEvents.push(event);
                const card = document.querySelector(`.event-card[data-id="${event.id}"]`);
                if (card) {
                    card.classList.add('is-live');
                    const badgesContainer = document.getElementById(`badges-${event.id}`);
                    if (badgesContainer && !badgesContainer.querySelector('.live-badge')) {
                        const badge = document.createElement('span');
                        badge.className = 'live-badge';
                        badge.textContent = 'Live Now';
                        badgesContainer.prepend(badge);
                    }
                }
            } else if (startTime > now) {
                if (!nextEvent || startTime < parseEventDateTime(nextEvent.date, nextEvent.startTime)) {
                    nextEvent = event;
                }
            }
        });

        // Update banner
        if (currentLiveEvents.length > 0) {
            liveBanner.style.display = 'flex';
            const names = currentLiveEvents.map(e => e.name).join(', ');
            liveBanner.innerHTML = `
                <div class="live-banner-content">
                    <div class="live-pulse"></div>
                    <div><strong>Live Now:</strong> ${names}</div>
                </div>
            `;
            if (nextEvent) {
                const diffTime = Math.abs(parseEventDateTime(nextEvent.date, nextEvent.startTime) - now);
                const diffMinutes = Math.floor(diffTime / (1000 * 60));
                if (diffMinutes <= 60) {
                    liveBanner.innerHTML += `<div class="countdown-timer">Next in ${diffMinutes}m</div>`;
                }
            }
        } else if (nextEvent) {
            const startTime = parseEventDateTime(nextEvent.date, nextEvent.startTime);
            const diffTime = startTime - now;
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

            liveBanner.style.display = 'flex';
            liveBanner.innerHTML = `
                <div class="live-banner-content">
                    <div><strong>Up Next:</strong> ${nextEvent.name}</div>
                </div>
                <div class="countdown-timer">Starts in ${diffHours > 0 ? `${diffHours}h ` : ''}${diffMinutes}m</div>
            `;
        } else {
            liveBanner.style.display = 'none';
        }
    }
}

export const ui = new UIManager();
