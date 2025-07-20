// assets/AssetDefinition.js - ES6 Module
/**
 * Base class for asset definitions
 * This provides a common interface and helper methods for creating assets
 */
class AssetDefinition {
    /**
     * Register an asset with the asset manager
     * @param {string} name - The name of the asset
     * @param {Function} definitionFn - Function that returns a PIXI.Graphics object
     */
    static register(name, definitionFn) {
        // Ensure the onInit array exists
        IdleAnts.onInit = IdleAnts.onInit || [];
        
        // Add a function to the onInit array that will register this asset
        IdleAnts.onInit.push(function(game) {
            game.assetManager.registerAssetDefinition(name, definitionFn);
        });
    }
    
    /**
     * Helper method to create a new PIXI.Graphics object
     * @returns {PIXI.Graphics} A new graphics object
     */
    static createGraphics() {
        return new PIXI.Graphics();
    }
    
    /**
     * Helper method to create a random color variation
     * @param {number} baseColor - The base color in hex format (e.g. 0xFF0000)
     * @param {number} variation - The amount of variation (0-1)
     * @returns {number} A new color with random variation
     */
    static randomColorVariation(baseColor, variation = 0.1) {
        // Extract RGB components
        const r = (baseColor >> 16) & 0xFF;
        const g = (baseColor >> 8) & 0xFF;
        const b = baseColor & 0xFF;
        
        // Apply random variation to each component
        const newR = Math.max(0, Math.min(255, r + Math.floor((Math.random() * 2 - 1) * variation * 255)));
        const newG = Math.max(0, Math.min(255, g + Math.floor((Math.random() * 2 - 1) * variation * 255)));
        const newB = Math.max(0, Math.min(255, b + Math.floor((Math.random() * 2 - 1) * variation * 255)));
        
        // Combine back into a single color
        return (newR << 16) | (newG << 8) | newB;
    }
}

// Register to global namespace for backward compatibility
IdleAnts.Assets = IdleAnts.Assets || {};
IdleAnts.Assets.AssetDefinition = AssetDefinition;

// Export for ES6 module system
export default AssetDefinition; 