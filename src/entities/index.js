/**
 * Entities Barrel Import
 * Centralized loading for all entity classes
 * These modules register themselves to the global IdleAnts namespace
 */

// Base entities first (other entities depend on these)
import './AntBase.js';
import './Food.js';
import './Nest.js';

// Ant types
import './Ant.js';
import './FlyingAnt.js';
import './CarAnt.js';
import './FireAnt.js';
import './QueenAnt.js';
import './Larvae.js';

// Enemy entities
import './EnemyAnt.js';
import './AnteaterBoss.js';

console.log('[Entities] All entity classes loaded and registered to global namespace');