/**
 * Main Entry Point
 * Clean module loading and game initialization
 */

console.log('[Index.js] Starting Idle Ants game initialization...');

/**
 * Load all game modules using barrel exports
 * This is much cleaner than manual imports
 */
async function initializeGame() {
    try {
        console.log('[Init] Loading all game modules...');
        
        // Load everything through the main module loader
        await import('./modules.js');
        
        console.log('[Init] ✅ All modules loaded successfully');
        
        // Verify everything is ready
        if (!window.IdleAnts) {
            throw new Error('IdleAnts namespace not available');
        }
        
        if (!IdleAnts.GameClass) {
            throw new Error('IdleAnts.GameClass not available');
        }
        
        // Verify critical managers are loaded
        const requiredManagers = ['InputManager', 'EntityManager', 'ResourceManager', 'DailyChallengeManager'];
        const missingManagers = requiredManagers.filter(mgr => !IdleAnts.Managers || !IdleAnts.Managers[mgr]);
        
        if (missingManagers.length > 0) {
            console.error('[Init] Missing required managers:', missingManagers);
            console.log('[Init] Available managers:', IdleAnts.Managers ? Object.keys(IdleAnts.Managers) : 'none');
            throw new Error(`Required managers not loaded: ${missingManagers.join(', ')}`);
        }
        
        // Verify critical entities are loaded  
        const requiredEntities = ['Ant', 'AntBase', 'Food', 'Nest'];
        const missingEntities = requiredEntities.filter(ent => !IdleAnts.Entities || !IdleAnts.Entities[ent]);
        
        if (missingEntities.length > 0) {
            console.error('[Init] Missing required entities:', missingEntities);
            console.log('[Init] Available entities:', IdleAnts.Entities ? Object.keys(IdleAnts.Entities) : 'none');
            throw new Error(`Required entities not loaded: ${missingEntities.join(', ')}`);
        }
        
        // Initialize the game
        console.log('[Init] 🎮 Creating game instance...');
        const game = new IdleAnts.GameClass();
        
        // Make game globally accessible for debugging
        window.game = game;
        
        console.log('[Init] ✅ Game initialized successfully!');
        
    } catch (error) {
        console.error('[Init] ❌ Game initialization failed:', error);
        console.error('[Init] Error stack:', error.stack);
        
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            text-align: center;
            z-index: 9999;
        `;
        errorDiv.innerHTML = `
            <h3>Game Failed to Load</h3>
            <p>Please refresh the page and try again.</p>
            <p><small>Error: ${error.message}</small></p>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}