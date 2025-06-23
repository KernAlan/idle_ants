// src/managers/NotificationManager.js
// A simple banner notification manager
IdleAnts.Managers.NotificationManager = class {
    constructor() {
        this._createBannerElement();
        this.hideTimeout = null;
    }

    /**
     * Shows a banner notification.
     * @param {string} message - The text to display.
     * @param {('info'|'success'|'warning'|'error')} [type='info'] - Visual style.
     * @param {number} [duration=3000] - How long to show (ms). Pass 0 to keep until manually hidden.
     */
    show(message, type = 'info', duration = 3000) {
        if (!this.bannerEl) return;

        // Reset classes and set new type
        this.bannerEl.className = `notification-banner ${type}`;
        this.bannerEl.textContent = message;

        // Trigger reflow then show
        void this.bannerEl.offsetWidth; // Force browser to recognize the class change
        this.bannerEl.classList.add('show');

        // Clear any existing timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        // Auto-hide if duration > 0
        if (duration > 0) {
            this.hideTimeout = setTimeout(() => this.hide(), duration);
        }
    }

    hide() {
        if (!this.bannerEl) return;
        this.bannerEl.classList.remove('show');
    }

    _createBannerElement() {
        // Prevent multiple banners if class instantiated multiple times
        let existing = document.getElementById('notification-banner');
        if (existing) {
            this.bannerEl = existing;
            return;
        }

        this.bannerEl = document.createElement('div');
        this.bannerEl.id = 'notification-banner';
        this.bannerEl.className = 'notification-banner';
        document.body.appendChild(this.bannerEl);
    }
};

// Instantiate a singleton and expose convenience helper
(function () {
    const instance = new IdleAnts.Managers.NotificationManager();
    IdleAnts.Managers.NotificationManager.instance = instance;

    // Global shortcut function
    IdleAnts.notify = function (message, type = 'info', duration = 3000) {
        instance.show(message, type, duration);
    };
})(); 