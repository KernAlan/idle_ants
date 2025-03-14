// src/managers/AssetManager.js
IdleAnts.Managers.AssetManager = class {
    constructor(app) {
        this.app = app;
        this.textures = {};
        this.assetDefinitions = {};
    }
    
    /**
     * Register an asset definition that can be loaded later
     * @param {string} name - The name of the asset
     * @param {Function} definitionFn - Function that returns a PIXI.Graphics object
     */
    registerAssetDefinition(name, definitionFn) {
        this.assetDefinitions[name] = definitionFn;
    }
    
    /**
     * Load all registered asset definitions and convert them to textures
     */
    async loadAssets() {
        return new Promise(async (resolve) => {
            try {
                // First, load all asset definition modules
                await this.loadAssetDefinitions();
                
                // Then generate textures from all registered definitions
                for (const [name, definitionFn] of Object.entries(this.assetDefinitions)) {
                    const graphics = definitionFn(this.app);
                    this.textures[name] = this.app.renderer.generateTexture(graphics);
                }
                
                resolve();
            } catch (error) {
                console.error("Error loading assets:", error);
                resolve(); // Resolve anyway to prevent game from hanging
            }
        });
    }
    
    /**
     * Load all asset definition modules
     * This method should be extended if more asset types are added
     */
    async loadAssetDefinitions() {
        // Import all asset definition modules
        // These will call registerAssetDefinition with their definitions
        
        // Load creature assets
        await this.loadModule('../assets/antAssets.js');
        
        // Load food assets
        await this.loadModule('../assets/foodAssets.js');
        
        // Load environment assets
        await this.loadModule('../assets/environmentAssets.js');
    }
    
    /**
     * Helper method to load a module
     * @param {string} path - Path to the module
     */
    async loadModule(path) {
        try {
            // In a real module system, we would use import() or require()
            // For this implementation, we'll assume the modules are already loaded
            // and have registered themselves via the global IdleAnts object
            
            // This is a placeholder for actual module loading logic
            console.log(`Loading asset module: ${path}`);
        } catch (error) {
            console.error(`Failed to load asset module ${path}:`, error);
        }
    }
    
    /**
     * Get a texture by name
     * @param {string} name - The name of the texture to retrieve
     * @returns {PIXI.Texture} The requested texture
     */
    getTexture(name) {
        if (!this.textures[name]) {
            console.warn(`Texture '${name}' not found`);
        }
        return this.textures[name];
    }
} 