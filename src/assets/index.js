/**
 * Assets Barrel Import
 * Centralized loading for all asset definitions
 * These modules register themselves to the global IdleAnts namespace
 */

// Asset definitions (load in dependency order)
// Note: Assets are in the root assets/ directory, not src/assets/
import '../../assets/AssetDefinition.js';
import '../../assets/antAssets.js';
import '../../assets/foodAssets.js';
import '../../assets/environmentAssets.js';
import '../../assets/anteaterBossAsset.js';
import '../../assets/audioAssets.js';

console.log('[Assets] All asset definitions loaded and registered to global namespace');