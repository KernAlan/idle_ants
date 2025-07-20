/**
 * Managers Barrel Import
 * Centralized loading for all manager classes
 * These modules register themselves to the global IdleAnts namespace
 */

// Core managers (load in dependency order)
import './AssetManager.js';
import './ResourceManager.js';
import './AudioManager.js';
import './BackgroundManager.js';
import './EffectManager.js';
import './AchievementManager.js';
import './DailyChallengeManager.js';
import './NotificationManager.js';

// Specialized managers
import './camera/CameraManager.js';
import './input/InputManager.js';

// Entity managers (these depend on core managers)
import './entities/NestEntityManager.js';
import './entities/AntEntityManager.js';
import './entities/FoodEntityManager.js';
import './entities/EnemyEntityManager.js';

// Complex managers that depend on entity managers
import './EntityManager.js';
import './CombatManager.js';
import './UIManager.js';

// Safe managers for error recovery
import './SafeEntityManager.js';
import './SafeResourceManager.js';

console.log('[Managers] All manager classes loaded and registered to global namespace');