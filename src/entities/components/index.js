/**
 * Entity Components Barrel Import
 * Centralized loading for all entity component classes
 * These modules register themselves to the global IdleAnts namespace
 */

// Component classes (load in order of dependencies)
import './MovementComponent.js';
import './AntStateComponent.js';
import './AntVisualComponent.js';
import './AntHealthComponent.js';
import './BehaviorComponent.js';
import './CollectionComponent.js';

console.log('[Components] All entity component classes loaded and registered to global namespace');