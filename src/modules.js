/**
 * Main Module Loader
 * Clean, organized import of all game modules using barrel exports
 */

// Load core systems first
import './core/Namespace.js';
import './core/Logger.js';
import './core/ErrorHandler.js';
import './core/RecoveryManager.js';

// Load all module groups using barrel exports
import './data/index.js';
import './assets/index.js';
import './effects/index.js';
import './entities/components/index.js';
import './entities/index.js';
import './managers/index.js';
import './game/index.js';

// Load the main Game class
import './Game.js';

// Verify that everything loaded correctly (after all imports)
setTimeout(() => {
    const requiredNamespaces = ['Entities', 'Managers', 'Game'];
    const missingNamespaces = requiredNamespaces.filter(ns => !IdleAnts[ns]);

    if (missingNamespaces.length > 0) {
        console.warn('[Modules] Missing required namespaces:', missingNamespaces);
        console.warn('[Modules] Available namespaces:', Object.keys(IdleAnts));
    }

    // Verify critical managers are loaded
    if (IdleAnts.Managers) {
        const requiredManagers = ['InputManager', 'EntityManager', 'ResourceManager', 'DailyChallengeManager'];
        const missingManagers = requiredManagers.filter(mgr => !IdleAnts.Managers[mgr]);
        
        if (missingManagers.length > 0) {
            console.warn('[Modules] Missing required managers:', missingManagers);
            console.warn('[Modules] Available managers:', Object.keys(IdleAnts.Managers));
        }
    }

    // Verify game managers are loaded
    if (IdleAnts.Game) {
        const requiredGameManagers = ['GameAudioManager', 'GameUpgradeManager', 'GameBossManager', 'GameMinimapManager', 'StateManager', 'CinematicManager'];
        const missingGameManagers = requiredGameManagers.filter(mgr => !IdleAnts.Game[mgr]);
        
        if (missingGameManagers.length > 0) {
            console.warn('[Modules] Missing required game managers:', missingGameManagers);
            console.warn('[Modules] Available game managers:', Object.keys(IdleAnts.Game));
        }
    }

    // Verify critical entities are loaded
    if (IdleAnts.Entities) {
        const requiredEntities = ['Ant', 'AntBase', 'Food', 'Nest'];
        const missingEntities = requiredEntities.filter(ent => !IdleAnts.Entities[ent]);
        
        if (missingEntities.length > 0) {
            console.warn('[Modules] Missing required entities:', missingEntities);
            console.warn('[Modules] Available entities:', Object.keys(IdleAnts.Entities));
        }
    }
}, 0);