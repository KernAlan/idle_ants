// Logger setup
const logger = IdleAnts.Logger?.create('Larvae') || console;

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
            logger.debug(`Added larvae to dedicated larvae container (z-index already set correctly in EntityManager)`);
        } else if (IdleAnts.app && IdleAnts.app.worldContainer) {
            // Fallback: add directly to world container
            IdleAnts.app.worldContainer.addChild(this.container);
            logger.debug(`Warning: Added larvae directly to world container (z-index may not be correct)`);
        }
    }
    
    createEggGraphic() {
        // Create realistic ant egg appearance
        
        // Subtle glow for visibility
        this.glow = new PIXI.Graphics();
        this.glow.beginFill(0xFFF8DC, 0.2); // Very subtle cream glow
        this.glow.drawCircle(0, 0, 12);
        this.glow.endFill();
        this.container.addChild(this.glow);
        
        // Main egg body - realistic ant egg colors
        this.egg = new PIXI.Graphics();
        this.egg.beginFill(0xFFFAF0); // Creamy white
        this.egg.drawEllipse(0, 0, 6, 9); // Smaller, more realistic proportions
        this.egg.endFill();
        
        // Add subtle gradient effect
        this.egg.beginFill(0xF5F5DC, 0.4); // Beige highlight
        this.egg.drawEllipse(-1, -2, 4, 6);
        this.egg.endFill();
        
        // Very thin, subtle border
        this.egg.lineStyle(0.8, 0xDDD8B8, 0.8); // Muted border
        this.egg.drawEllipse(0, 0, 6, 9);
        
        // Add texture dots for realism
        this.egg.lineStyle(0);
        this.egg.beginFill(0xEEE8CD, 0.3);
        for(let i = 0; i < 8; i++){
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 3;
            const y = Math.sin(angle) * 4.5;
            this.egg.drawCircle(x, y, 0.5);
        }
        this.egg.endFill();
        
        this.container.addChild(this.egg);
        
        // Animation parameters
        this.pulseTime = 0;
        this.developmentTime = 0;
    }
    
    update(delta = 1/60) {
        // If already hatched and ant created, return false to indicate this larvae should be removed
        if (this.isHatched && this.antCreated) {
            return false;
        }
        
        // Increment age in seconds
        // PIXI's ticker.deltaTime is in frames, so we convert to seconds
        // For a 60fps game, delta is typically 1, which means 1/60 of a second has passed
        this.age += delta / 60; // Convert delta to seconds
        
        // Update pulsing animation - keep it simple and subtle
        this.pulseTime += delta * 2;
        this.developmentTime += delta;
        
        // Calculate how close we are to hatching (0 to 1)
        const hatchProgress = this.age / this.hatchingTime;
        
        // Realistic egg development animation
        if(this.egg && this.glow){
            // Subtle pulse that gets more pronounced as hatching approaches
            const pulseIntensity = 0.05 + (hatchProgress * 0.1); // 5% to 15% pulse
            const pulse = 1 + Math.sin(this.pulseTime) * pulseIntensity;
            this.egg.scale.set(pulse);
            
            // Glow becomes more active as development progresses
            const glowIntensity = 0.1 + (hatchProgress * 0.3);
            this.glow.alpha = glowIntensity + Math.sin(this.pulseTime * 1.5) * 0.1;
            
            // Egg becomes slightly more opaque as development progresses
            this.egg.alpha = 0.9 + (hatchProgress * 0.1);
            
            // In final 20%, add slight movement to indicate life inside
            if(hatchProgress > 0.8){
                const wiggleIntensity = (hatchProgress - 0.8) * 5; // 0 to 1 for final 20%
                const wiggle = Math.sin(this.developmentTime * 8) * wiggleIntensity * 0.5;
                this.egg.rotation = wiggle * 0.1; // Very subtle rotation
                
                // Slight position shift
                this.egg.x = Math.sin(this.developmentTime * 6) * wiggleIntensity * 0.8;
                this.egg.y = Math.cos(this.developmentTime * 7) * wiggleIntensity * 0.6;
            }
            
            // In final 10%, show visible cracks
            if(hatchProgress > 0.9 && !this.cracksAdded){
                this.addCracks();
                this.cracksAdded = true;
            }
        }
        
        // Check if it's time to hatch
        if (!this.isHatched && this.age >= this.hatchingTime) {
            this.hatch();
        }
        
        // Return true to keep the larvae active until the ant is created
        return true;
    }
    
    hatch() {
        this.isHatched = true;
        
        // Check if the colony is at max capacity
        if (IdleAnts.app && IdleAnts.app.entityManager && 
            IdleAnts.app.resourceManager) {
            
            const currentAnts = IdleAnts.app.entityManager.entities.ants.length;
            const maxAnts = IdleAnts.app.resourceManager.stats.maxAnts;
            
            // If colony is at max capacity, postpone hatching and retry later
            if (currentAnts >= maxAnts) {
                logger.debug("Cannot hatch larvae now: colony at maximum capacity. Will retry in 10 seconds.");

                // Visual cue: small shake or pulse to indicate pending hatch
                if (IdleAnts.app.effectManager) {
                    IdleAnts.app.effectManager.createLarvaeEffect(this.x, this.y);
                }

                // Retry after 10 seconds (10000 ms)
                setTimeout(() => {
                    // Only retry if an ant still hasn't been created
                    if (!this.antCreated) {
                        this.isHatched = false; // allow hatch logic to run again
                        this.age = this.hatchingTime - 1; // re-attempt in roughly 1 second of game time
                    }
                }, 10000);
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
                        IdleAnts.app.entityManager.createAntFromLarvae(larvaeX, larvaeY);
                        
                        // Remove the larvae container after the ant is created
                        if (this.container && this.container.parent) {
                            this.container.parent.removeChild(this.container);
                            logger.debug(`Larvae container at (${this.x}, ${this.y}) removed after ant creation`);
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
                        logger.debug(`Larvae container at (${this.x}, ${this.y}) removed after ant creation (fallback)`);
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
                    logger.debug(`Larvae container at (${this.x}, ${this.y}) removed after ant creation (no effect manager)`);
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
    
    addCracks(){
        // Add visible cracks to the egg as it's about to hatch
        this.cracks = new PIXI.Graphics();
        this.cracks.lineStyle(1, 0x8B7355, 0.8);
        
        // Draw several crack lines
        this.cracks.moveTo(-2, -4);
        this.cracks.lineTo(1, -1);
        this.cracks.lineTo(-1, 2);
        
        this.cracks.moveTo(2, -3);
        this.cracks.lineTo(-1, 0);
        this.cracks.lineTo(2, 3);
        
        this.cracks.moveTo(-3, 1);
        this.cracks.lineTo(0, -2);
        
        this.container.addChild(this.cracks);
    }
}; 