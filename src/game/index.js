/**
 * Game Modules Barrel Import
 * Centralized loading for all game-specific modules
 * These modules register themselves to the global IdleAnts namespace
 */

// Game managers (load in dependency order)
import './GameStateManager.js';
import './GameAudioManager.js';
import './GameUpgradeManager.js';
import './GameBossManager.js';
import './GameMinimapManager.js';
import './CinematicManager.js';
import './GameInputManager.js';

// Verify all game managers are properly loaded (with delay to ensure all are registered)
setTimeout(() => {
    const expectedManagers = ['GameAudioManager', 'GameUpgradeManager', 'GameBossManager', 'GameMinimapManager', 'StateManager', 'CinematicManager'];
    const missingManagers = expectedManagers.filter(manager => !IdleAnts.Game || !IdleAnts.Game[manager]);

    if (missingManagers.length > 0) {
        console.warn('[Game] Missing game managers:', missingManagers);
        console.warn('[Game] Available in IdleAnts.Game:', Object.keys(IdleAnts.Game || {}));
    }
}, 0);