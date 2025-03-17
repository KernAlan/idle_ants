// src/entities/Larvae.js
IdleAnts.Entities = IdleAnts.Entities || {};

IdleAnts.Entities.Larvae = class {
    constructor(x, y) {
        // Position of the larvae
        this.x = x;
        this.y = y;
        
        // Create a container for the larvae
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Set hatching time to exactly 30 seconds
        this.hatchingTime = 30; // 30 seconds
        this.age = 0; // Age in seconds
        this.isHatched = false;
        this.antCreated = false; // Flag to track if an ant has been created from this larvae
        
        // Create the visual representation
        this.createVisuals();
        
        console.log(`Created larvae at (${x}, ${y}) with hatching time ${this.hatchingTime} seconds`);
    }
    
    createVisuals() {
        // Try to use the asset textures if available
        if (IdleAnts.app && IdleAnts.app.assetManager) {
            try {
                // Create egg sprite from asset
                const eggTexture = IdleAnts.app.assetManager.getTexture('egg');
                if (eggTexture) {
                    this.egg = new PIXI.Sprite(eggTexture);
                    this.egg.anchor.set(0.5);
                    this.container.addChild(this.egg);
                    
                    // Add a pulsing animation
                    this.pulseTime = 0;
                } else {
                    this.createEggGraphic();
                }
            } catch (error) {
                console.error("Error loading egg texture:", error);
                this.createEggGraphic();
            }
        } else {
            // Fallback to creating graphics directly
            this.createEggGraphic();
        }
        
        // Add to the dedicated larvae container in EntityManager
        if (IdleAnts.app && IdleAnts.app.entityManager && IdleAnts.app.entityManager.entitiesContainers.larvae) {
            // Add to the dedicated larvae container
            IdleAnts.app.entityManager.entitiesContainers.larvae.addChild(this.container);
            console.log(`Added larvae to dedicated larvae container (z-index already set correctly in EntityManager)`);
        } else if (IdleAnts.app && IdleAnts.app.worldContainer) {
            // Fallback: add directly to world container
            IdleAnts.app.worldContainer.addChild(this.container);
            console.log(`Warning: Added larvae directly to world container (z-index may not be correct)`);
        }
    }
    
    createEggGraphic() {
        // Create a glow behind the egg
        this.glow = new PIXI.Graphics();
        this.glow.beginFill(0xFFFF00, 0.3);
        this.glow.drawCircle(0, 0, 15);
        this.glow.endFill();
        this.container.addChild(this.glow);
        
        // Create the egg
        this.egg = new PIXI.Graphics();
        this.egg.beginFill(0xFFFFF0);
        this.egg.drawEllipse(0, 0, 8, 12);
        this.egg.endFill();
        
        // Add a border
        this.egg.lineStyle(2, 0xAA9900);
        this.egg.drawEllipse(0, 0, 8, 12);
        
        this.container.addChild(this.egg);
        
        // Add a pulsing animation
        this.pulseTime = 0;
    }
    
    update(delta = 1/60) {
        // If already hatched and ant created, return false to indicate this larvae should be removed
        if (this.isHatched && this.antCreated) {
            console.log(`Larvae at (${this.x}, ${this.y}) is being removed after ant creation`);
            return false;
        }
        
        // Increment age in seconds
        // PIXI's ticker.deltaTime is in frames, so we convert to seconds
        // For a 60fps game, delta is typically 1, which means 1/60 of a second has passed
        this.age += delta / 60; // Convert delta to seconds
        
        // Log age every 5 seconds for debugging
        if (Math.floor(this.age * 10) % 50 === 0) { // Every ~5 seconds
            console.log(`Larvae at (${this.x}, ${this.y}) age: ${this.age.toFixed(2)} seconds, delta: ${delta}`);
        }
        
        // Update pulsing animation - keep it simple and subtle
        this.pulseTime += delta * 2;
        
        // Simple, consistent pulse that doesn't change or flicker
        const pulse = 1 + Math.sin(this.pulseTime) * 0.1; // Subtle 10% pulse
        this.container.scale.set(pulse);
        
        // Calculate how close we are to hatching (0 to 1)
        const hatchProgress = this.age / this.hatchingTime;
        
        // Log progress at key percentages
        if (
            (Math.abs(hatchProgress - 0.25) < 0.01) ||
            (Math.abs(hatchProgress - 0.50) < 0.01) ||
            (Math.abs(hatchProgress - 0.75) < 0.01) ||
            (Math.abs(hatchProgress - 0.90) < 0.01) ||
            (Math.abs(hatchProgress - 0.95) < 0.01) ||
            (Math.abs(hatchProgress - 0.99) < 0.01)
        ) {
            console.log(`Larvae at (${this.x}, ${this.y}) is ${Math.floor(hatchProgress * 100)}% ready to hatch (age: ${this.age.toFixed(2)} seconds)`);
        }
        
        // Check if it's time to hatch
        if (!this.isHatched && this.age >= this.hatchingTime) {
            console.log(`Larvae at (${this.x}, ${this.y}) reached hatching time: ${this.age.toFixed(2)} seconds`);
            this.hatch();
        }
        
        // Return true to keep the larvae active until the ant is created
        return true;
    }
    
    hatch() {
        this.isHatched = true;
        console.log(`Larvae at (${this.x}, ${this.y}) is hatching after ${this.age.toFixed(2)} seconds`);
        
        // Check if the colony is at max capacity
        if (IdleAnts.app && IdleAnts.app.entityManager && 
            IdleAnts.app.resourceManager) {
            
            const currentAnts = IdleAnts.app.entityManager.entities.ants.length;
            const maxAnts = IdleAnts.app.resourceManager.stats.maxAnts;
            
            // If colony is at max capacity, don't create a new ant
            if (currentAnts >= maxAnts) {
                console.log("Cannot hatch larvae: colony at maximum capacity");
                
                // Still show the hatching effect
                if (IdleAnts.app.effectManager) {
                    IdleAnts.app.effectManager.createSpawnEffect(this.x, this.y);
                }
                
                // Remove the larvae container
                if (this.container && this.container.parent) {
                    this.container.parent.removeChild(this.container);
                    console.log(`Larvae container removed due to colony at max capacity`);
                }
                
                return;
            }
        }
        
        // Store position for later use
        const larvaeX = this.x;
        const larvaeY = this.y;
        
        // Create hatching effect
        if (IdleAnts.app && IdleAnts.app.effectManager) {
            try {
                // Create larvae effect at this position
                const larvaeEffect = IdleAnts.app.effectManager.createLarvaeEffect(this.x, this.y);
                
                // Also create a spawn effect
                IdleAnts.app.effectManager.createSpawnEffect(this.x, this.y);
                
                // Wait for the effect duration before creating the ant
                // This ensures the visual effect and game logic are aligned
                setTimeout(() => {
                    // Create the ant after the effect completes, but only if one hasn't been created yet
                    if (!this.antCreated && IdleAnts.app && IdleAnts.app.entityManager) {
                        this.antCreated = true; // Mark that we've created an ant
                        console.log(`Larvae at (${this.x}, ${this.y}) is creating an ant after effect completed`);
                        IdleAnts.app.entityManager.createAntFromLarvae(larvaeX, larvaeY);
                        console.log(`Creating ant from larvae at (${larvaeX}, ${larvaeY}) after effect completed`);
                        
                        // Remove the larvae container after the ant is created
                        if (this.container && this.container.parent) {
                            this.container.parent.removeChild(this.container);
                            console.log(`Larvae container at (${this.x}, ${this.y}) removed after ant creation`);
                        }
                    }
                }, 7000); // Match the 7-second duration of the LarvaeEffect (extended from 2 seconds)
            } catch (error) {
                console.error("Error creating hatching effect:", error);
                // Fallback: create ant immediately if effect fails, but only if one hasn't been created yet
                if (!this.antCreated && IdleAnts.app && IdleAnts.app.entityManager) {
                    this.antCreated = true; // Mark that we've created an ant
                    IdleAnts.app.entityManager.createAntFromLarvae(this.x, this.y);
                    
                    // Remove the larvae container after the ant is created
                    if (this.container && this.container.parent) {
                        this.container.parent.removeChild(this.container);
                        console.log(`Larvae container at (${this.x}, ${this.y}) removed after ant creation (fallback)`);
                    }
                }
            }
        } else {
            // Fallback: create ant immediately if no effect manager, but only if one hasn't been created yet
            if (!this.antCreated && IdleAnts.app && IdleAnts.app.entityManager) {
                this.antCreated = true; // Mark that we've created an ant
                IdleAnts.app.entityManager.createAntFromLarvae(this.x, this.y);
                
                // Remove the larvae container after the ant is created
                if (this.container && this.container.parent) {
                    this.container.parent.removeChild(this.container);
                    console.log(`Larvae container at (${this.x}, ${this.y}) removed after ant creation (no effect manager)`);
                }
            }
        }
        
        // DO NOT remove the larvae container here - it will be removed after the ant is created
    }
    
    destroy() {
        // Remove from stage
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
        }
    }
}; 