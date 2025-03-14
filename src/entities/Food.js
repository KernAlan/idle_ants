// src/entities/Food.js
IdleAnts.Entities.Food = class extends PIXI.Sprite {
    // Define food state constants
    static States = {
        SPAWNED: 'spawned',       // Just appeared, might have spawn animation
        AVAILABLE: 'available',    // Ready to be collected
        BEING_COLLECTED: 'beingCollected', // One or more ants are collecting
        DEPLETED: 'depleted'       // Ready to be removed from game
    };
    
    constructor(texture, position, foodType) {
        // Get the appropriate texture for the food type
        // Ensure we have a valid food type
        const foodType_ = foodType && typeof foodType === 'object' ? foodType : IdleAnts.Data.FoodTypes.BASIC;
        let textureToUse = texture;
        
        // If this is a cookie, use the cookie texture if available
        if (foodType_.id === 'cookie') {
            try {
                const cookieTexture = IdleAnts.app.assetManager.getTexture('cookieFood');
                if (cookieTexture) {
                    textureToUse = cookieTexture;
                }
            } catch (error) {
                console.warn("Cookie texture not available, using default texture");
            }
        }
        // If this is a watermelon, use the watermelon texture if available
        else if (foodType_.id === 'watermelon') {
            try {
                const watermelonTexture = IdleAnts.app.assetManager.getTexture('watermelonFood');
                if (watermelonTexture) {
                    textureToUse = watermelonTexture;
                }
            } catch (error) {
                console.warn("Watermelon texture not available, using default texture");
            }
        }
        
        super(textureToUse);
        
        // Store the food type
        this.foodType = foodType_;
        
        // Set position
        this.anchor.set(0.5);
        if (typeof position === 'object') {
            this.x = position.x || 0;
            this.y = position.y || 0;
            this.clickPlaced = position.clickPlaced || false;
        } else {
            this.x = 0;
            this.y = 0;
            this.clickPlaced = false;
        }
        
        // Apply food type-specific visual enhancements
        this.applyFoodTypeVisuals();
        
        // Add a glowing effect
        this.createGlow();
        
        // Add a shadow
        this.createShadow();
        
        // Add a slight pulsing animation
        this.glowPulse = true;
        this.glowCounter = Math.random() * Math.PI * 2; // Random start phase
        this.glowPulseSpeed = 1;
        
        // Track ants currently collecting this food item
        this.collectingAnts = [];
        
        // Track individual ant contributions
        this.antContributions = {};
        
        // Total food value available for collection
        this.remainingValue = this.foodType.value || 1;
        
        // Initialize state based on whether it was placed by click
        this.state = this.clickPlaced ? 
            IdleAnts.Entities.Food.States.SPAWNED : 
            IdleAnts.Entities.Food.States.AVAILABLE;
            
        // Spawn animation properties
        this.spawnTimer = this.clickPlaced ? 15 : 0;
        this.spawnScale = 0.1;
        
        // Apply initial state visual effects
        this.applyStateVisuals();
    }
    
    // State transition method
    transitionToState(newState) {
        // Handle exit actions for current state
        switch(this.state) {
            case IdleAnts.Entities.Food.States.SPAWNED:
                // No special exit actions
                break;
                
            case IdleAnts.Entities.Food.States.BEING_COLLECTED:
                // Reset collecting ants if transitioning away from collecting
                if (newState !== IdleAnts.Entities.Food.States.BEING_COLLECTED) {
                    this.collectingAnts = [];
                    this.antContributions = {};
                    this.updateGlowBasedOnAnts();
                }
                break;
        }
        
        // Set the new state
        this.state = newState;
        
        // Handle entry actions for new state
        switch(newState) {
            case IdleAnts.Entities.Food.States.AVAILABLE:
                // Reset glow to default
                this.updateGlowBasedOnAnts();
                break;
                
            case IdleAnts.Entities.Food.States.BEING_COLLECTED:
                // Enhance glow effect
                this.updateGlowBasedOnAnts();
                break;
                
            case IdleAnts.Entities.Food.States.DEPLETED:
                // Fade out effect
                if (this.glow) {
                    this.glow.alpha = 0.1;
                }
                this.alpha = 0.5;
                break;
        }
        
        // Apply visual changes based on the new state
        this.applyStateVisuals();
    }
    
    // Apply visual effects based on current state
    applyStateVisuals() {
        switch(this.state) {
            case IdleAnts.Entities.Food.States.SPAWNED:
                // Start small and scale up during spawn animation
                this.scale.set(this.spawnScale);
                if (this.glow) {
                    this.glow.alpha = 0.9;
                }
                break;
                
            case IdleAnts.Entities.Food.States.AVAILABLE:
                // Regular appearance
                this.alpha = 1.0;
                break;
                
            case IdleAnts.Entities.Food.States.BEING_COLLECTED:
                // Add visual feedback for collection
                if (this.glow) {
                    this.glow.alpha = 0.6;
                }
                break;
                
            case IdleAnts.Entities.Food.States.DEPLETED:
                // Faded appearance
                this.alpha = 0.5;
                break;
        }
    }
    
    // Main update method that delegates to state-specific updates
    update() {
        // State-specific updates
        switch(this.state) {
            case IdleAnts.Entities.Food.States.SPAWNED:
                this.updateSpawned();
                break;
                
            case IdleAnts.Entities.Food.States.AVAILABLE:
                this.updateAvailable();
                break;
                
            case IdleAnts.Entities.Food.States.BEING_COLLECTED:
                this.updateBeingCollected();
                break;
                
            case IdleAnts.Entities.Food.States.DEPLETED:
                this.updateDepleted();
                break;
        }
        
        // Update glow pulse for all states
        this.updateGlowPulse();
    }
    
    // Update for SPAWNED state
    updateSpawned() {
        // Handle spawn animation
        if (this.spawnTimer > 0) {
            this.spawnTimer--;
            
            // Gradually scale up during spawn
            const progress = 1 - (this.spawnTimer / 15);
            const targetScale = this.foodType.scale ? 
                (this.foodType.scale.min + Math.random() * (this.foodType.scale.max - this.foodType.scale.min)) : 
                1.0;
                
            this.spawnScale = 0.1 + (targetScale - 0.1) * progress;
            this.scale.set(this.spawnScale);
            
            // Adjust glow during spawn
            if (this.glow) {
                this.glow.alpha = 0.9 - (0.6 * progress);
                
                // Don't scale the glow during spawn - it will be handled by updateGlowPulse
                // Just ensure baseScale is set
                if (!this.glow.baseScale) {
                    this.glow.baseScale = 1.0;
                }
            }
        } else {
            // Spawn complete, transition to available
            this.transitionToState(IdleAnts.Entities.Food.States.AVAILABLE);
        }
    }
    
    // Update for AVAILABLE state
    updateAvailable() {
        // Check if any ants are collecting
        if (this.collectingAnts.length > 0) {
            this.transitionToState(IdleAnts.Entities.Food.States.BEING_COLLECTED);
        }
    }
    
    // Update for BEING_COLLECTED state
    updateBeingCollected() {
        // Update based on collecting ants
        if (this.collectingAnts.length === 0) {
            // No more ants collecting, transition back to available
            this.transitionToState(IdleAnts.Entities.Food.States.AVAILABLE);
        }
        
        // Check if value is fully depleted (this will be handled by EntityManager)
    }
    
    // Update for DEPLETED state
    updateDepleted() {
        // When depleted, the food is ready to be removed
        // Actual removal handled by EntityManager
        
        // Fade out effect
        this.alpha = Math.max(0, this.alpha - 0.05);
        if (this.glow) {
            this.glow.alpha = Math.max(0, this.glow.alpha - 0.05);
        }
    }
    
    // Helper method to update glow pulse effect
    updateGlowPulse() {
        // Update glow pulse
        if (this.glowPulse && this.glow) {
            this.glowCounter += 0.05 * (this.glowPulseSpeed || 1);
            const pulseFactor = 0.6 + Math.sin(this.glowCounter) * 0.4;
            
            // Apply pulse to the glow
            if (!this.glow.baseScale) {
                // Store the initial scale as the base scale
                this.glow.baseScale = 1.0;
            }
            
            // Scale the glow based on the pulse factor
            // We don't modify the actual scale.x/y values directly to avoid compounding scaling effects
            this.glow.scale.set(this.glow.baseScale * pulseFactor);
        }
    }
    
    // Add an ant to the list of ants collecting this food
    addCollectingAnt(ant) {
        // Only add if not already collecting
        if (!this.collectingAnts.includes(ant)) {
            this.collectingAnts.push(ant);
            this.antContributions[ant.id] = 0;
            
            // Update state if needed
            if (this.state === IdleAnts.Entities.Food.States.AVAILABLE) {
                this.transitionToState(IdleAnts.Entities.Food.States.BEING_COLLECTED);
            }
            
            // Make glow pulse faster when multiple ants are working
            this.updateGlowBasedOnAnts();
        }
    }
    
    // Remove an ant from the list of collecting ants
    removeCollectingAnt(ant) {
        const index = this.collectingAnts.indexOf(ant);
        if (index > -1) {
            this.collectingAnts.splice(index, 1);
            
            // Update state if no more ants are collecting
            if (this.collectingAnts.length === 0 && 
                this.state === IdleAnts.Entities.Food.States.BEING_COLLECTED) {
                this.transitionToState(IdleAnts.Entities.Food.States.AVAILABLE);
            }
            
            // Reset glow pulse if no ants are collecting
            this.updateGlowBasedOnAnts();
        }
    }
    
    // Return the number of ants currently collecting this food
    getCollectingAntCount() {
        return this.collectingAnts.length;
    }
    
    // Calculate collaborative collection time for ants
    getCollectionTimeForAnt(ant) {
        // Get base collection time
        const baseTime = this.foodType.collectionTime || 0;
        
        // If no delay for this food type, it's instant
        if (baseTime <= 0) return 0;
        
        // The more ants, the faster the collection (directly proportional)
        const antCount = this.getCollectingAntCount();
        
        // Calculate time with collaborative speedup - directly proportional to ant count
        let adjustedTime = baseTime / antCount;
        
        // Minimum collection time regardless of how many ants (prevents issues with too many ants)
        // Ensure at least 10% of base time or 0.05s, whichever is greater
        const minCollectionTime = Math.max(0.05, baseTime * 0.1);
        
        // Apply strength-based reduction to collection time (from original code)
        if (IdleAnts && IdleAnts.app && IdleAnts.app.resourceManager) {
            const strengthMultiplier = IdleAnts.app.resourceManager.stats.strengthMultiplier;
            const reductionFactor = Math.min(0.75, (strengthMultiplier - 1) * 0.25);
            adjustedTime = adjustedTime * (1 - reductionFactor);
        }
        
        // Return the greater of the calculated time or minimum time
        return Math.max(minCollectionTime, adjustedTime);
    }
    
    // Track an ant's contribution to collecting this food
    recordAntContribution(ant, amount) {
        if (this.antContributions[ant.id] !== undefined) {
            this.antContributions[ant.id] += amount;
        }
    }
    
    // Distribute food value among ants based on their contributions
    distributeValue() {
        const totalContribution = Object.values(this.antContributions).reduce((sum, val) => sum + val, 0);
        const results = {};
        
        // If no contributions recorded, return empty results
        if (totalContribution <= 0) return results;
        
        // Calculate value for each ant proportional to contribution
        for (const antId in this.antContributions) {
            const proportion = this.antContributions[antId] / totalContribution;
            const antValue = Math.max(1, Math.round(this.foodType.value * proportion));
            results[antId] = antValue;
        }
        
        return results;
    }
    
    // Update visual effects based on number of ants
    updateGlowBasedOnAnts() {
        const antCount = this.getCollectingAntCount();
        if (antCount > 0 && this.glow) {
            // Make glow pulse faster with more ants - directly proportional
            this.glowPulseSpeed = Math.min(5, antCount);
            this.glowPulse = true;
            
            // Make glow stronger with more ants - more intense with more ants
            // Increase alpha based on ant count, but cap at 0.9
            this.glow.alpha = Math.min(0.9, 0.3 + (antCount * 0.15));
            
            // Also increase the glow size with more ants
            // We'll adjust the baseScale which is used in updateGlowPulse
            const glowScale = Math.min(1.5, 1 + (antCount * 0.1));
            this.glow.baseScale = glowScale;
        } else if (this.glow) {
            // Reset to default values
            this.glowPulseSpeed = 1;
            this.glow.alpha = 0.3;
            this.glow.baseScale = 1.0;
        }
    }
    
    applyFoodTypeVisuals() {
        try {
            // Apply food type-specific scale
            if (this.foodType.scale && typeof this.foodType.scale.min !== 'undefined' && typeof this.foodType.scale.max !== 'undefined') {
                const scaleRange = this.foodType.scale;
                const scale = scaleRange.min + Math.random() * (scaleRange.max - scaleRange.min);
                this.scale.set(scale);
            } else {
                // Default scale if missing
                this.scale.set(1.0);
            }
            
            // Apply food type-specific tint
            if (this.foodType.color) {
                this.tint = this.foodType.color;
            }
            
            // Random rotation
            this.rotation = Math.random() * Math.PI * 2;
        } catch (error) {
            console.error("Error applying food visuals:", error);
            // Set reasonable defaults
            this.scale.set(1.0);
            this.tint = 0xFFFFFF;
        }
    }
    
    createGlow() {
        try {
            const glow = new PIXI.Graphics();
            const glowColor = this.foodType.glowColor || 0xFFFF99;
            const glowAlpha = this.foodType.glowAlpha || 0.3;
            
            // Calculate glow size based on food type scale
            let glowSize = 10; // Default size
            
            // If food type has scale defined, use the average of min and max for glow sizing
            if (this.foodType.scale && typeof this.foodType.scale.min !== 'undefined' && typeof this.foodType.scale.max !== 'undefined') {
                const avgScale = (this.foodType.scale.min + this.foodType.scale.max) / 2;
                glowSize = 10 * avgScale; // Scale the glow size proportionally
            }
            
            glow.beginFill(glowColor, glowAlpha);
            glow.drawCircle(0, 0, glowSize);
            glow.endFill();
            glow.alpha = 0.6;
            
            // Store a reference to the glow for easier access
            this.glow = glow;
            
            // Add the glow as the first child so it appears behind the food sprite
            this.addChildAt(glow, 0);
        } catch (error) {
            console.error("Error creating glow:", error);
            // Create a default glow as fallback
            const glow = new PIXI.Graphics();
            glow.beginFill(0xFFFF99, 0.3);
            glow.drawCircle(0, 0, 10);
            glow.endFill();
            glow.alpha = 0.6;
            
            // Store a reference to the glow
            this.glow = glow;
            
            // Add the glow as the first child
            this.addChildAt(glow, 0);
        }
    }
    
    createShadow() {
        try {
            const shadow = new PIXI.Graphics();
            const shadowColor = this.foodType.shadowColor || 0x000000;
            
            shadow.beginFill(shadowColor, 0.2);
            shadow.drawEllipse(0, 6, 6, 3);
            shadow.endFill();
            
            // Add the shadow as a child, but position it behind the sprite
            this.addChildAt(shadow, 0);
        } catch (error) {
            console.error("Error creating shadow:", error);
        }
    }
    
    // Get the value of this food
    getValue() {
        return this.foodType && this.foodType.value ? this.foodType.value : 1;
    }
    
    // Get the name of this food type
    getName() {
        return this.foodType && this.foodType.name ? this.foodType.name : 'Food';
    }
} 