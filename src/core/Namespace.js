// Namespace for our game
const IdleAnts = {
    Entities: {
        Components: {}
    },
    Managers: {},
    Game: {},
    Config: {
        debug: false // Global debug flag, set to false by default
    }
};

// Set debug mode based on environment or query parameter
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const debugParam = urlParams.get('debug');
    
    // Set debug mode
    IdleAnts.Config.debug = isLocalhost || debugParam === 'true';
    
    if (IdleAnts.Config.debug) {
        console.log('Debug mode enabled - running locally');
    }
})();

// Expose to global scope
window.IdleAnts = IdleAnts; 