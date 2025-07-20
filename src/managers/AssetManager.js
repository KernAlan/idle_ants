// src/managers/AssetManager.js
IdleAnts.Managers.AssetManager = class {
    constructor(app) {
        this.app = app;
        this.textures = {};
        this.assetDefinitions = {}; // Reinstate this for AssetDefinition.register
    }

    /**
     * Register an asset definition that can be loaded later
     * @param {string} name - The name of the asset
     * @param {Function} definitionFn - Function that returns a PIXI.Graphics object
     */
    registerAssetDefinition(name, definitionFn) {
        this.assetDefinitions[name] = definitionFn;
    }

    async loadAssets() {
        try {
            // Placeholder for loading asset definition files if they do more than just declare objects
            // await this.loadAssetDefinitionFiles(); // e.g., antAssets.js, foodAssets.js

            // Process assets defined in IdleAnts.Assets.*
            if (IdleAnts.Assets) {
                for (const categoryKey in IdleAnts.Assets) { // e.g., "Ants", "Foods", "Environment"
                    if (Object.hasOwnProperty.call(IdleAnts.Assets, categoryKey)) {
                        const category = IdleAnts.Assets[categoryKey];
                        if (typeof category === 'object' && category !== null) {
                            for (const assetKey in category) { // e.g., "ANT", "FLYING_ANT", "CAR_ANT"
                                if (Object.hasOwnProperty.call(category, assetKey)) {
                                    const assetConfig = category[assetKey];
                                    if (assetConfig && assetConfig.id) {
                                        if (assetConfig.path) {
                                            // Load texture from path
                                            try {
                                                const texture = await PIXI.Assets.load(assetConfig.path);
                                                this.textures[assetConfig.id] = texture;
                                            } catch (error) {
                                                console.error(`AssetManager: Error loading texture for ${assetConfig.id} from ${assetConfig.path}:`, error);
                                            }
                                        } else if (assetConfig.generator && typeof assetConfig.generator === 'function') {
                                            // Generate texture from generator function
                                            try {
                                                const graphics = assetConfig.generator(this.app);
                                                if (graphics instanceof PIXI.Graphics) {
                                                    this.textures[assetConfig.id] = this.app.renderer.generateTexture(graphics);
                                                } else {
                                                    console.error(`AssetManager: Generator for ${assetConfig.id} did not return a PIXI.Graphics object.`);
                                                }
                                            } catch (error) {
                                                console.error(`AssetManager: Error generating texture for ${assetConfig.id}:`, error);
                                            }
                                        } else {
                                            // Only warn if this asset is not registered via AssetDefinition.register()
                                            if (!this.assetDefinitions || !this.assetDefinitions[assetConfig.id]) {
                                                console.warn(`AssetManager: Asset ${assetConfig.id} has no path or generator and is not registered via AssetDefinition.register().`);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Process assets registered via AssetDefinition.register (if any are still used this way)
            // This part remains similar to original logic if AssetDefinition.register is still in use for some assets
            if (this.assetDefinitions && Object.keys(this.assetDefinitions).length > 0) {
                for (const [name, definitionFn] of Object.entries(this.assetDefinitions)) {
                    try {
                        const graphics = definitionFn(this.app);
                        if (graphics instanceof PIXI.Graphics) {
                           this.textures[name] = this.app.renderer.generateTexture(graphics);
                        } else {
                            console.error(`AssetManager: Generator for registered asset ${name} did not return a PIXI.Graphics object.`);
                        }
                    } catch (error) {
                        console.error(`AssetManager: Error generating texture for registered asset ${name}:`, error);
                    }
                }
            } else {
                console.warn('AssetManager: No assets registered via AssetDefinition.register()');
            }
        } catch (error) {
            console.error("AssetManager: Critical error during asset loading:", error);
        }
        // No explicit resolve/reject needed if not returning a Promise directly from loadAssets
        // However, Game.js expects loadAssets to return a Promise.
        return Promise.resolve();
    }


    // loadAssetDefinitionFiles might be needed if antAssets.js, etc., have setup logic beyond simple object declaration
    // async loadAssetDefinitionFiles() {
    //     // Example:
    //     // await this.loadModule('../assets/antAssets.js');
    //     // await this.loadModule('../assets/foodAssets.js');
    //     // console.log("AssetManager: Asset definition files conceptually loaded.");
    // }

    // async loadModule(path) {
    //     // This remains a conceptual placeholder as direct script includes are used
    //     console.log(`AssetManager: Conceptually loading module: ${path}`);
    //     try {
    //         // If these files truly had self-executing registration logic, it would have run by now.
    //     } catch (error) {
    //         console.error(`AssetManager: Error conceptually loading module ${path}:`, error);
    //     }
    // }
    
    getTexture(name) {
        if (!this.textures[name]) {
            // Fallback for assets that might have been registered with AssetDefinition
            // and their ID in IdleAnts.Assets.Ants might be different from the key used in AssetDefinition.register
            // Check if 'name' itself is a key in this.assetDefinitions, then try to find its texture
            if (this.assetDefinitions[name] && this.textures[name]) {
                 return this.textures[name];
            }

            if (IdleAnts.Assets && IdleAnts.Assets.Ants && IdleAnts.Assets.Ants[name] && IdleAnts.Assets.Ants[name].id) {
                 const id = IdleAnts.Assets.Ants[name].id;
                 if (this.textures[id]) {
                    return this.textures[id];
                 }
            }
            // Try common variations if the direct name isn't found (e.g. 'ant' vs 'ANT')
            const nameLower = name.toLowerCase();
            const nameUpper = name.toUpperCase();
            if (this.textures[nameLower]) return this.textures[nameLower];
            if (this.textures[nameUpper]) return this.textures[nameUpper];
            
            console.warn(`AssetManager: Texture '${name}' not found.`);
            // To prevent crashes, return a placeholder texture or throw a more specific error.
            // For now, returning undefined which will likely lead to downstream errors if not handled.
            return undefined; 
        }
        return this.textures[name];
    }
} 