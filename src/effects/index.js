/**
 * Effects Barrel Import
 * Centralized loading for all effect classes
 * These modules register themselves to the global IdleAnts namespace
 */

// Load effect classes (in dependency order)
import './Effect.js';
import './SpawnEffect.js';
import './FoodSpawnEffect.js';
import './FoodDropEffect.js';
import './FoodCollectEffect.js';
import './Trail.js';
import './LarvaeEffect.js';

console.log('[Effects] All effect classes loaded and registered to global namespace');