// src/effects/index.js
// Initialize the Effects namespace
IdleAnts.Effects = IdleAnts.Effects || {};

// Load effect classes
// The order matters as the base Effect class should be loaded first
// followed by the specific implementations that extend it

// Include the Trail effect in the list of effects
// This ensures it's properly loaded and available to the EffectManager

// The order of script loading in index.html should be:
// 1. src/effects/Effect.js (base class)
// 2. src/effects/SpawnEffect.js
// 3. src/effects/FoodSpawnEffect.js
// 4. src/effects/FoodDropEffect.js
// 5. src/effects/FoodCollectEffect.js
// 6. src/effects/Trail.js
// 7. src/effects/LarvaeEffect.js
// 8. src/effects/index.js (this file)

// Register all effect classes with the EffectManager
if (IdleAnts.Managers && IdleAnts.Managers.EffectManager) {
    // This will be called when the EffectManager is initialized
    IdleAnts.Managers.EffectManager.registerEffects = function(manager) {
        manager.effectClasses['larvae'] = IdleAnts.Effects.LarvaeEffect;
    };
} 