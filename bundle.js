// Idle Ants - Bundled JavaScript
// Generated on: 2025-07-04T04:47:50.194Z


// ===== src/core/Namespace.js =====
// Namespace for our game
const IdleAnts = {
    Entities: {},
    Managers: {},
    Config: {
        debug: false // Global debug flag, set to false by default
    }
}; 

// ===== src/data/FoodTypes.js =====
// src/data/FoodTypes.js
IdleAnts.Data = IdleAnts.Data || {};

// Food types define the properties of different food items in the game
IdleAnts.Data.FoodTypes = {
    // Basic food type - standard seed/crumb
    BASIC: {
        id: 'basic',
        name: 'Seed',
        value: 1,              // Value when deposited at nest
        weight: 1,             // How much capacity it uses (1 = one slot)
        collectionTime: 0,     // Time in seconds needed to collect (0 = instant)
        rarity: 1,             // Higher values mean more rare
        scale: {min: 0.7, max: 1.3},  // Size variation
        color: 0xEAD2AC,       // Main color
        shadowColor: 0xD9BF93, // Shadow color
        glowColor: 0xFFFF99,   // Glow effect color
        glowAlpha: 0.3,        // Glow transparency
        description: 'Simple seeds that ants collect for food.'
    },
    
    // Cookie crumb - fun food type for kids
    COOKIE: {
        id: 'cookie',
        name: 'Cookie Crumb',
        value: 5,              // Worth 5x the basic food
        weight: 2,             // Takes up 2 capacity slots
        collectionTime: 1.5,   // Takes 1.5 seconds to collect
        rarity: 3,             // More rare than basic food
        scale: {min: 1.0, max: 1.8},  // Larger than basic food
        color: 0xC68E17,       // Cookie brown
        shadowColor: 0x8B5A00, // Darker brown shadow
        glowColor: 0xFFE0A3,   // Warm glow
        glowAlpha: 0.4,        // Slightly stronger glow
        description: 'Delicious cookie crumbs are a special treat for ants!'
    },
    
    // Watermelon piece - premium food source
    WATERMELON: {
        id: 'watermelon',
        name: 'Watermelon Piece',
        value: 25,             // Worth 5x the cookie (following the progression)
        weight: 4,             // Takes up 4 capacity slots (heavier than cookie)
        collectionTime: 3.0,   // Takes 3 seconds to collect (harder to gather)
        rarity: 5,             // More rare than cookies
        scale: {min: 1.5, max: 2.2},  // Larger than cookies
        color: 0xFF3B3F,       // Watermelon red
        shadowColor: 0x2EA12E, // Green shadow (rind)
        glowColor: 0xFF9999,   // Pinkish glow
        glowAlpha: 0.5,        // Stronger glow for premium food
        description: 'Sweet watermelon pieces are a rare and valuable food source!'
    }
};

// Helper functions for working with food types
IdleAnts.Data.FoodTypeUtils = {
    // Get a random food type based on rarity weights
    getRandomFoodType: function() {
        // Calculate total rarity for weighting
        let totalRarity = 0;
        let types = [];
        
        for (const key in IdleAnts.Data.FoodTypes) {
            const foodType = IdleAnts.Data.FoodTypes[key];
            // Invert rarity for weighting (higher rarity = lower chance)
            const weight = 1 / foodType.rarity;
            totalRarity += weight;
            types.push({
                type: foodType,
                weight: weight
            });
        }
        
        // Select a random food type based on weights
        let random = Math.random() * totalRarity;
        let currentSum = 0;
        
        for (let i = 0; i < types.length; i++) {
            currentSum += types[i].weight;
            if (random <= currentSum) {
                return types[i].type;
            }
        }
        
        // Fallback to basic food
        return IdleAnts.Data.FoodTypes.BASIC;
    }
}; 

// ===== src/effects/Effect.js =====
// src/effects/Effect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.Effect = class {
    constructor(app, x, y) {
        this.app = app;
        this.x = x;
        this.y = y;
        this.container = null;
        this.elapsed = 0;
        this.duration = 1.0; // Default duration in seconds
        this.active = true;   // Whether this effect is still active
    }
    
    create() {
        // To be implemented by subclasses
        // Should set up the PIXI objects and add them to the stage
    }
    
    update(delta) {
        // To be implemented by subclasses
        // Should update the effect for each animation frame
        this.elapsed += delta;
        this.active = this.elapsed < this.duration;
        return this.active;
    }
    
    destroy() {
        // Remove the effect from the stage
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
        }
        this.active = false;
    }
    
    play() {
        // Now just sets up the effect but doesn't start its own animation loop
        this.create();
    }
} 

// ===== src/effects/SpawnEffect.js =====
// src/effects/SpawnEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.SpawnEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFFFF) {
        super(app, x, y);
        this.color = color;
        
        // Determine if this is a flying ant spawn based on color
        this.isFlying = color === 0x00CCFF;
        
        // Flying ants have a longer spawn effect
        this.duration = this.isFlying ? 0.8 : 0.5;
    }
    
    create() {
        // Create a starburst effect when an ant spawns
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // More particles for flying ants
        const particleCount = this.isFlying ? 12 : 8;
        
        // Create several particles that expand outward
        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(this.color);
            
            // Larger particles for flying ants
            const particleSize = this.isFlying ? 3 : 2;
            particle.drawCircle(0, 0, particleSize);
            particle.endFill();
            
            const angle = (i / particleCount) * Math.PI * 2;
            
            // Flying ants have faster particles
            const speed = this.isFlying ? 3 : 2;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.alpha = 1;
            
            this.container.addChild(particle);
        }
        
        this.app.stage.addChild(this.container);
    }
    
    update(delta) {
        // Call the parent update method to track elapsed time
        super.update(delta);
        
        // Update each particle
        for (let i = 0; i < this.container.children.length; i++) {
            const particle = this.container.children[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Flying ants fade more slowly
            const fadeRate = this.isFlying ? 0.03 : 0.05;
            particle.alpha -= fadeRate;
            
            if (particle.alpha <= 0) {
                particle.alpha = 0;
            }
        }
        
        // Return whether the effect is still active
        return this.active;
    }
} 

// ===== src/effects/FoodSpawnEffect.js =====
// src/effects/FoodSpawnEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.FoodSpawnEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFF99) {
        super(app, x, y);
        this.color = color;
        this.duration = 1.0; // Standard duration for food spawn
    }
    
    create() {
        // Create a particle effect when food spawns in the world
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Create a ring of particles that expand outward
        for (let i = 0; i < 12; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(this.color);
            particle.drawCircle(0, 0, 1.5);
            particle.endFill();
            
            const angle = (i / 12) * Math.PI * 2;
            particle.vx = Math.cos(angle) * 1.5;
            particle.vy = Math.sin(angle) * 1.5;
            particle.alpha = 1;
            
            this.container.addChild(particle);
        }
        
        this.app.stage.addChild(this.container);
    }
    
    update(delta) {
        // Call the parent update method to track elapsed time
        super.update(delta);
        
        // Update each particle
        for (let i = 0; i < this.container.children.length; i++) {
            const particle = this.container.children[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Fade out particles
            particle.alpha -= 0.02;
            if (particle.alpha <= 0) {
                particle.alpha = 0;
            }
        }
        
        // Return whether the effect is still active
        return this.active;
    }
} 

// ===== src/effects/FoodDropEffect.js =====
// src/effects/FoodDropEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.FoodDropEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFF99) {
        super(app, x, y);
        this.color = color;
        this.duration = 0.8; // Slightly longer duration for food drop effect
    }
    
    create() {
        // Create a small particle effect when food is dropped at the nest
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Create food particles
        for (let i = 0; i < 5; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(this.color);
            particle.drawCircle(0, 0, 2);
            particle.endFill();
            
            // Random velocity upward
            particle.vx = (Math.random() - 0.5) * 2;
            particle.vy = -2 - Math.random() * 2;
            particle.gravity = 0.1;
            
            this.container.addChild(particle);
        }
        
        this.app.stage.addChild(this.container);
    }
    
    update(delta) {
        // Call the parent update method to track elapsed time
        super.update(delta);
        
        // Update each particle
        for (let i = 0; i < this.container.children.length; i++) {
            const particle = this.container.children[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity; // Apply gravity
            particle.alpha -= 0.03;
        }
        
        // Return whether the effect is still active
        return this.active;
    }
} 

// ===== src/effects/FoodCollectEffect.js =====
// src/effects/FoodCollectEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.FoodCollectEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFF99, scale = 1.0) {
        super(app, x, y);
        this.color = color;
        this.effectScale = scale;
        this.duration = 0.6; // Short duration for food collect effect
    }
    
    create() {
        // Create a particle effect when an ant collects food
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Create a small burst of particles
        const particleCount = Math.floor(4 * this.effectScale);
        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(this.color);
            particle.drawCircle(0, 0, 1.5 * this.effectScale);
            particle.endFill();
            
            // Random velocity in circular pattern
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            particle.vx = Math.cos(angle) * speed * this.effectScale;
            particle.vy = Math.sin(angle) * speed * this.effectScale;
            particle.alpha = 1;
            
            this.container.addChild(particle);
        }
        
        this.app.stage.addChild(this.container);
    }
    
    update(delta) {
        // Call the parent update method to track elapsed time
        super.update(delta);
        
        // Update each particle
        for (let i = 0; i < this.container.children.length; i++) {
            const particle = this.container.children[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Fade out particles
            particle.alpha -= 0.04;
            if (particle.alpha <= 0) {
                particle.alpha = 0;
            }
        }
        
        // Return whether the effect is still active
        return this.active;
    }
} 

// ===== src/effects/Trail.js =====
// src/effects/Trail.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.Trail = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFFFF, alpha = 0.2, isFlying = false, hasFood = false) {
        super(app, x, y);
        this.color = color;
        this.initialAlpha = alpha;
        this.isFlying = isFlying;
        this.hasFood = hasFood;
        
        // Trails last longer than other effects
        this.duration = isFlying ? 0.7 : 2.0; // Flying ant trails fade faster
        
        // Floating behavior for flying ant trails
        if (isFlying) {
            this.floatSpeed = Math.random() * 0.2 - 0.1;
        }
    }
    
    create() {
        // Create the trail graphic
        this.container = new PIXI.Graphics();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Draw based on trail type
        if (this.isFlying) {
            // Flying ant trail with glow
            this.container.beginFill(this.color, this.initialAlpha);
            this.container.drawCircle(0, 0, 2); // Slightly larger than regular ant trails
            this.container.endFill();
            
            // Add a subtle glow
            this.container.beginFill(this.color, this.initialAlpha * 0.3);
            this.container.drawCircle(0, 0, 4);
            this.container.endFill();
        } else {
            // Regular ant trail
            this.container.beginFill(this.color, this.initialAlpha);
            this.container.drawCircle(0, 0, 1.5);
            this.container.endFill();
        }
        
        this.app.stage.addChild(this.container);
    }
    
    update(delta) {
        // Call parent update to track elapsed time
        super.update(delta);
        
        // Apply floating effect for flying ant trails
        if (this.isFlying && this.floatSpeed) {
            this.container.y += this.floatSpeed;
        }
        
        // Calculate fade percentage - fade more rapidly in the second half of lifetime
        const fadeProgress = this.elapsed / this.duration;
        
        // Update alpha based on remaining time - non-linear fading for more natural look
        if (fadeProgress < 0.5) {
            // First half - maintain alpha
            this.container.alpha = this.initialAlpha;
        } else {
            // Second half - fade out
            const fadeRatio = (fadeProgress - 0.5) * 2; // 0 to 1 in second half
            this.container.alpha = this.initialAlpha * (1 - fadeRatio);
        }
        
        // Return whether the effect is still active
        return this.active;
    }
} 

// ===== src/effects/LarvaeEffect.js =====
// src/effects/LarvaeEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.LarvaeEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFF00, scale = 1.5) {
        super(app, x, y);
        this.duration = 7.0; // 7 seconds duration - extended from 2 seconds to 7 seconds
        this.color = color;
        this.scale = scale;
        console.log(`LarvaeEffect constructor at (${x}, ${y}) with scale ${scale}`);
    }
    
    create() {
        console.log(`Creating larvae effect at (${this.x}, ${this.y})`);
        
        // Create a container for the larvae effect
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Apply the scale from constructor
        this.container.scale.set(this.scale);
        
        // Try to use the asset textures if available
        if (IdleAnts.app && IdleAnts.app.assetManager) {
            try {
                // Create egg sprite from asset
                const eggTexture = IdleAnts.app.assetManager.getTexture('egg');
                if (eggTexture) {
                    this.egg = new PIXI.Sprite(eggTexture);
                    this.egg.anchor.set(0.5);
                    this.container.addChild(this.egg);
                    console.log("Using egg texture from assets");
                } else {
                    this.createEggGraphic();
                }
                
                // Create larvae sprite from asset
                const larvaeTexture = IdleAnts.app.assetManager.getTexture('larvae');
                if (larvaeTexture) {
                    this.larvae = new PIXI.Sprite(larvaeTexture);
                    this.larvae.anchor.set(0.5);
                    this.larvae.alpha = 0; // Start invisible
                    this.container.addChild(this.larvae);
                    console.log("Using larvae texture from assets");
                } else {
                    this.createLarvaeGraphic();
                }
            } catch (error) {
                console.error("Error loading asset textures:", error);
                this.createEggGraphic();
                this.createLarvaeGraphic();
            }
        } else {
            // Fallback to creating graphics directly
            this.createEggGraphic();
            this.createLarvaeGraphic();
        }
        
        // Create hatching particles
        this.createParticles();
        
        // Make sure we're adding to the world container if possible
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            console.log("Adding larvae effect to world container");
            IdleAnts.app.worldContainer.addChild(this.container);
            
            // Bring to front
            IdleAnts.app.worldContainer.setChildIndex(
                this.container, 
                IdleAnts.app.worldContainer.children.length - 1
            );
        } else {
            console.log("Adding larvae effect to app stage");
            this.app.stage.addChild(this.container);
        }
    }
    
    createEggGraphic() {
        // Create realistic egg appearance for hatching effect
        this.glow = new PIXI.Graphics();
        this.glow.beginFill(0xFFF8DC, 0.3); // Subtle cream glow
        this.glow.drawCircle(0, 0, 12);
        this.glow.endFill();
        this.container.addChild(this.glow);
        
        // Main egg body
        this.egg = new PIXI.Graphics();
        this.egg.beginFill(0xFFFAF0); // Creamy white
        this.egg.drawEllipse(0, 0, 6, 9);
        this.egg.endFill();
        
        // Gradient highlight
        this.egg.beginFill(0xF5F5DC, 0.4);
        this.egg.drawEllipse(-1, -2, 4, 6);
        this.egg.endFill();
        
        // Subtle border
        this.egg.lineStyle(0.8, 0xDDD8B8, 0.8);
        this.egg.drawEllipse(0, 0, 6, 9);
        
        // Pre-cracked appearance for hatching
        this.egg.lineStyle(1.2, 0x8B7355, 0.9);
        this.egg.moveTo(-2, -4);
        this.egg.lineTo(1, -1);
        this.egg.lineTo(-1, 2);
        this.egg.moveTo(2, -3);
        this.egg.lineTo(-1, 0);
        this.egg.lineTo(2, 3);
        
        this.container.addChild(this.egg);
    }
    
    createLarvaeGraphic() {
        // Create realistic ant larvae
        this.larvae = new PIXI.Graphics();
        this.larvae.beginFill(0xFFFAF0); // Pale cream - realistic larvae color
        this.larvae.drawEllipse(0, 0, 4, 6); // Slightly larger than egg
        this.larvae.endFill();
        
        // Add subtle body segmentation
        this.larvae.lineStyle(0.8, 0xE6D7C3, 0.6);
        for(let i = 0; i < 3; i++){
            const y = -3 + i * 2;
            this.larvae.moveTo(-3, y);
            this.larvae.lineTo(3, y);
        }
        
        // Soft border
        this.larvae.lineStyle(0.8, 0xDDD8B8, 0.7);
        this.larvae.drawEllipse(0, 0, 4, 6);
        
        // Add tiny dark spots for realism
        this.larvae.lineStyle(0);
        this.larvae.beginFill(0xE6D7C3, 0.4);
        this.larvae.drawCircle(-1, -2, 0.4);
        this.larvae.drawCircle(1, 0, 0.4);
        this.larvae.drawCircle(-0.5, 2, 0.4);
        this.larvae.endFill();
        
        this.larvae.alpha = 0; // Start invisible
        this.container.addChild(this.larvae);
    }
    
    createParticles() {
        // Create hatching particles
        this.particles = [];
        const particleCount = 12; // Moderate amount
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0xF5F5DC); // Cream colored particles
            particle.drawCircle(0, 0, 1.2); // Small particles
            particle.endFill();
            
            const angle = (i / particleCount) * Math.PI * 2;
            particle.vx = Math.cos(angle) * 1.8; // Moderate movement
            particle.vy = Math.sin(angle) * 1.8;
            particle.alpha = 0; // Start invisible
            particle.delay = i * 0.08; // Stagger the appearance
            
            this.container.addChild(particle);
            this.particles.push(particle);
        }
    }
    
    update(delta) {
        // Call the parent update method to track elapsed time
        super.update(delta);
        
        // Calculate progress (0 to 1)
        const progress = this.elapsed / this.duration;
        
        // Update glow if it exists
        if (this.glow) {
            this.glow.alpha = 0.2 + Math.sin(progress * Math.PI * 4) * 0.2;
            this.glow.scale.set(1 + Math.sin(progress * Math.PI * 2) * 0.15);
        }
        
        // First 60%: egg pulsates and starts to crack
        if (progress < 0.6) {
            // Normalize progress for this phase (0-1)
            const eggPhaseProgress = progress / 0.6;
            
            // Egg slightly expands and then contracts
            const eggScale = 1 + Math.sin(eggPhaseProgress * Math.PI) * 0.2;
            this.egg.scale.set(eggScale);
            
            // In the last part of this phase, start showing some particles
            if (eggPhaseProgress > 0.8) {
                // Calculate particle progress
                const particleProgress = (eggPhaseProgress - 0.8) * 5;
                
                // Show initial particles
                for (let i = 0; i < Math.min(3, this.particles.length); i++) {
                    const particle = this.particles[i];
                    
                    particle.alpha = Math.min(1, particleProgress);
                    
                    particle.x = particle.vx * particleProgress * 3;
                    particle.y = particle.vy * particleProgress * 3;
                }
            }
        } 
        // Next 20%: egg cracks and particles appear
        else if (progress < 0.8) {
            // Normalize progress for this phase (0-1)
            const crackPhaseProgress = (progress - 0.6) / 0.2;
            
            // Egg cracks more visibly
            const eggScale = 1 + Math.sin(crackPhaseProgress * Math.PI * 4) * 0.25;
            this.egg.scale.set(eggScale);
            
            // Update particles
            for (let i = 0; i < this.particles.length; i++) {
                const particle = this.particles[i];
                
                // Only start showing particles after their delay
                if (i / this.particles.length < crackPhaseProgress) {
                    // Calculate particle progress
                    const particleProgress = Math.min(1, (crackPhaseProgress - (i / this.particles.length)) * 3);
                    
                    // Fade in and then out
                    particle.alpha = Math.sin(particleProgress * Math.PI);
                    
                    // Move outward
                    particle.x = particle.vx * particleProgress * 8;
                    particle.y = particle.vy * particleProgress * 8;
                }
            }
        } 
        // Final 20%: egg fades out, larvae appears
        else {
            const finalPhaseProgress = (progress - 0.8) / 0.2; // 0 to 1 for final phase
            
            // Egg fades out
            this.egg.alpha = 1 - finalPhaseProgress;
            
            // Larvae fades in and grows slightly
            this.larvae.alpha = finalPhaseProgress;
            const larvaeScale = 0.6 + finalPhaseProgress * 0.6; // Grows from small to normal
            this.larvae.scale.set(larvaeScale);
            
            // Subtle wiggle to show life
            this.larvae.rotation = Math.sin(finalPhaseProgress * Math.PI * 6) * 0.2;
            
            // Continue particle animation
            for (let i = 0; i < this.particles.length; i++) {
                const particle = this.particles[i];
                
                // Fade out any remaining particles
                particle.alpha = Math.max(0, 1 - finalPhaseProgress * 2);
                
                // Continue moving outward
                const particleDistance = 8 + finalPhaseProgress * 6;
                particle.x = particle.vx * particleDistance;
                particle.y = particle.vy * particleDistance;
            }
        }
        
        // Return whether the effect is still active
        return this.active;
    }
    
    destroy() {
        // Remove the effect from the stage
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
            console.log("Larvae effect removed from stage");
        }
        this.active = false;
    }
}; 

// ===== src/effects/index.js =====
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

// ===== assets/AssetDefinition.js =====
// assets/AssetDefinition.js
(function() {
    // Create a namespace for asset definitions if it doesn't exist
    IdleAnts.Assets = IdleAnts.Assets || {};
    
    /**
     * Base class for asset definitions
     * This provides a common interface and helper methods for creating assets
     */
    IdleAnts.Assets.AssetDefinition = class {
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
    };
})(); 

// ===== assets/antAssets.js =====
// assets/antAssets.js
(function() {
    // Get a reference to the AssetDefinition class
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;
    
    // Register ant asset
    AssetDefinition.register('ant', function(app) {
        const antGraphics = AssetDefinition.createGraphics();
        
        // Create angled perspective ant (3/4 view) to match nest perspective
        
        // Rear segment (abdomen) - angled ellipse showing depth
        antGraphics.beginFill(0x2A1B10); // Dark brown base
        antGraphics.drawEllipse(0, 8, 7, 10); // Main abdomen shape
        antGraphics.endFill();
        
        // Abdomen highlight - shows the "top" surface at an angle
        antGraphics.beginFill(0x3D2817);
        antGraphics.drawEllipse(-1, 6, 6, 8); // Offset to show angled top
        antGraphics.endFill();
        
        // Abdomen bright highlight - the most visible "top" surface
        antGraphics.beginFill(0x5D4037);
        antGraphics.drawEllipse(-2, 5, 4, 6); // Further offset for depth
        antGraphics.endFill();
        
        // Middle segment (thorax) - angled perspective
        antGraphics.beginFill(0x2A1B10);
        antGraphics.drawEllipse(0, -2, 5, 7); // Base thorax
        antGraphics.endFill();
        
        // Thorax top surface
        antGraphics.beginFill(0x3D2817);
        antGraphics.drawEllipse(-1, -3, 4, 5); // Angled top
        antGraphics.endFill();
        
        // Thorax highlight
        antGraphics.beginFill(0x5D4037);
        antGraphics.drawEllipse(-1.5, -4, 3, 3); // Top highlight
        antGraphics.endFill();
        
        // Head - angled circular perspective (more oval when viewed at angle)
        antGraphics.beginFill(0x2A1B10);
        antGraphics.drawEllipse(0, -14, 5, 6); // Base head - elliptical due to angle
        antGraphics.endFill();
        
        // Head top surface
        antGraphics.beginFill(0x3D2817);
        antGraphics.drawEllipse(-1, -15, 4, 5); // Angled top surface
        antGraphics.endFill();
        
        // Head highlight
        antGraphics.beginFill(0x5D4037);
        antGraphics.drawEllipse(-1.5, -15.5, 3, 3); // Top highlight
        antGraphics.endFill();
        
        // Eyes - positioned for angled view (more visible on the "front" side)
        antGraphics.beginFill(0x000000);
        antGraphics.drawEllipse(-2.5, -15, 1.2, 1.5); // Left eye - more elliptical
        antGraphics.drawEllipse(1.5, -14.5, 1.2, 1.5); // Right eye - slightly different position
        antGraphics.endFill();
        
        // Eye highlights - angled perspective
        antGraphics.beginFill(0xFFFFFF, 0.8);
        antGraphics.drawEllipse(-2.7, -15.2, 0.5, 0.7); // Left eye highlight
        antGraphics.drawEllipse(1.3, -14.7, 0.5, 0.7); // Right eye highlight
        antGraphics.endFill();
        
        // Mandibles - angled outward from perspective
        antGraphics.lineStyle(1.2, 0x2A1B10);
        antGraphics.moveTo(-3, -17); // Left mandible
        antGraphics.lineTo(-5.5, -19.5);
        antGraphics.moveTo(2.5, -16.5); // Right mandible - different angle
        antGraphics.lineTo(5, -19);
        
        // Antennae - curved with angled perspective
        antGraphics.lineStyle(1, 0x2A1B10);
        
        // Left antenna - more visible from this angle
        antGraphics.moveTo(-2.5, -17);
        antGraphics.bezierCurveTo(-5.5, -21, -7.5, -23, -6.5, -25);
        
        // Right antenna - partially visible from angle
        antGraphics.moveTo(2, -16.5);
        antGraphics.bezierCurveTo(4.5, -20, 6.5, -22, 6, -24);
        
        // Antenna tips
        antGraphics.lineStyle(0);
        antGraphics.beginFill(0x3D2817);
        antGraphics.drawCircle(-6.5, -25, 1);
        antGraphics.drawCircle(6, -24, 1);
        antGraphics.endFill();
        
        // Legs - positioned for angled perspective (some more visible than others)
        antGraphics.lineStyle(1.5, 0x2A1B10);
        
        // Left side legs (more visible from this angle)
        antGraphics.moveTo(-4, -8); // Front leg
        antGraphics.lineTo(-8, -6);
        antGraphics.moveTo(-4, -2); // Middle leg
        antGraphics.lineTo(-8, 0);
        antGraphics.moveTo(-4, 4); // Rear leg
        antGraphics.lineTo(-8, 6);
        
        // Right side legs (partially visible from angle)
        antGraphics.moveTo(3, -7); // Front leg
        antGraphics.lineTo(6, -5);
        antGraphics.moveTo(3, -1); // Middle leg
        antGraphics.lineTo(6, 1);
        antGraphics.moveTo(3, 5); // Rear leg
        antGraphics.lineTo(6, 7);
        
        return antGraphics;
    });
    
    // Register queen ant asset
    AssetDefinition.register('queenAnt', function(app) {
                  const queenGraphics = AssetDefinition.createGraphics();
          
          // Create queen ant - bird's eye view, larger than regular ant
          
          // Rear segment (abdomen) - larger for queen
          queenGraphics.beginFill(0x2A1B10); // Dark brown base
          queenGraphics.drawCircle(0, 8, 10); // Larger abdomen
          queenGraphics.endFill();
          
          // Abdomen highlight
          queenGraphics.beginFill(0x3D2817);
          queenGraphics.drawCircle(0, 8, 8); // Inner highlight
          queenGraphics.endFill();
          
          // Royal pattern on abdomen
          queenGraphics.beginFill(0x8D6E63);
          queenGraphics.drawCircle(0, 8, 5); // Royal marking
          queenGraphics.endFill();
          
          // Middle segment (thorax) - larger
          queenGraphics.beginFill(0x2A1B10);
          queenGraphics.drawCircle(0, -2, 6); // Base thorax
          queenGraphics.endFill();
          
          // Thorax highlight
          queenGraphics.beginFill(0x3D2817);
          queenGraphics.drawCircle(0, -2, 4); // Inner highlight
          queenGraphics.endFill();
          
          // Head - larger for queen
          queenGraphics.beginFill(0x2A1B10);
          queenGraphics.drawCircle(0, -14, 7); // Base head
          queenGraphics.endFill();
          
          // Head highlight
          queenGraphics.beginFill(0x3D2817);
          queenGraphics.drawCircle(0, -14, 5); // Inner highlight
          queenGraphics.endFill();
          
          // Eyes - larger for queen
          queenGraphics.beginFill(0x000000);
          queenGraphics.drawCircle(-3, -14, 2); // Left eye
          queenGraphics.drawCircle(3, -14, 2); // Right eye
          queenGraphics.endFill();
          
          // Eye highlights
          queenGraphics.beginFill(0xFFFFFF, 0.8);
          queenGraphics.drawCircle(-3.5, -14.5, 0.8); // Left eye highlight
          queenGraphics.drawCircle(2.5, -14.5, 0.8); // Right eye highlight
          queenGraphics.endFill();
          
          // Mandibles - larger for queen
          queenGraphics.lineStyle(2, 0x2A1B10);
          queenGraphics.moveTo(-4, -18); // Left mandible
          queenGraphics.lineTo(-7, -21);
          queenGraphics.moveTo(4, -18); // Right mandible
          queenGraphics.lineTo(7, -21);
          
          // Antennae - longer for queen
          queenGraphics.lineStyle(1.5, 0x2A1B10);
          
          // Left antenna
          queenGraphics.moveTo(-3, -18);
          queenGraphics.bezierCurveTo(-7, -23, -9, -26, -8, -28);
          
          // Right antenna
          queenGraphics.moveTo(3, -18);
          queenGraphics.bezierCurveTo(7, -23, 9, -26, 8, -28);
          
          // Antenna tips - larger for queen
          queenGraphics.lineStyle(0);
          queenGraphics.beginFill(0x3D2817);
          queenGraphics.drawCircle(-8, -28, 1.5);
          queenGraphics.drawCircle(8, -28, 1.5);
          queenGraphics.endFill();
          
          // Crown - positioned for top-down view
          queenGraphics.beginFill(0xFFD700); // Gold color
          
          // Crown base - circular for top-down view
          queenGraphics.drawCircle(0, -22, 6); // Crown base
          queenGraphics.endFill();
          
          // Crown highlight
          queenGraphics.beginFill(0xFFE55C);
          queenGraphics.drawCircle(0, -22, 4); // Crown highlight
          queenGraphics.endFill();
          
          // Crown points - arranged in circle for top-down view
          queenGraphics.beginFill(0xFFD700);
          for(let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 7;
            const y = Math.sin(angle) * 7 - 22;
            queenGraphics.drawCircle(x, y, 1.5);
          }
          queenGraphics.endFill();
          
          // Jewels - arranged in center for top-down view
          // Red jewel (center)
          queenGraphics.beginFill(0xFF0000);
          queenGraphics.drawCircle(0, -22, 1.5);
          queenGraphics.endFill();
          queenGraphics.beginFill(0xFF6B6B);
          queenGraphics.drawCircle(0, -22, 0.8); // Highlight
          queenGraphics.endFill();
          
          // Blue jewels (sides)
          queenGraphics.beginFill(0x0000FF);
          queenGraphics.drawCircle(-2.5, -22, 1);
          queenGraphics.drawCircle(2.5, -22, 1);
          queenGraphics.endFill();
          
          // Green jewels (top/bottom)
          queenGraphics.beginFill(0x00FF00);
          queenGraphics.drawCircle(0, -24.5, 1);
          queenGraphics.drawCircle(0, -19.5, 1);
          queenGraphics.endFill();
          
          // Legs - symmetrical for bird's eye view, slightly longer for queen
          queenGraphics.lineStyle(2, 0x2A1B10);
          
          // Left side legs
          queenGraphics.moveTo(-6, -8); // Front leg
          queenGraphics.lineTo(-10, -10);
          queenGraphics.moveTo(-6, -2); // Middle leg
          queenGraphics.lineTo(-10, -2);
          queenGraphics.moveTo(-6, 4); // Rear leg
          queenGraphics.lineTo(-10, 6);
          
          // Right side legs
          queenGraphics.moveTo(6, -8); // Front leg
          queenGraphics.lineTo(10, -10);
          queenGraphics.moveTo(6, -2); // Middle leg
          queenGraphics.lineTo(10, -2);
          queenGraphics.moveTo(6, 4); // Rear leg
          queenGraphics.lineTo(10, 6);
        
        // Mandibles with depth - larger for queen
        queenGraphics.lineStyle(1.8, 0x1A0F0A);
        // Left mandible with shadow
        queenGraphics.moveTo(-4, -18);
        queenGraphics.lineTo(-7, -21);
        queenGraphics.lineStyle(1.5, 0x2A1B10);
        queenGraphics.moveTo(-3.7, -17.7);
        queenGraphics.lineTo(-6.7, -20.7);
        
        // Right mandible with shadow
        queenGraphics.lineStyle(1.8, 0x1A0F0A);
        queenGraphics.moveTo(4, -18);
        queenGraphics.lineTo(7, -21);
        queenGraphics.lineStyle(1.5, 0x2A1B10);
        queenGraphics.moveTo(3.7, -17.7);
        queenGraphics.lineTo(6.7, -20.7);
        
        // Antennae with 3D effect - longer for queen
        queenGraphics.lineStyle(1.8, 0x1A0F0A); // Shadow line
        
        // Left antenna shadow
        queenGraphics.moveTo(-2.7, -18);
        queenGraphics.bezierCurveTo(-6.5, -23, -9.5, -25, -8.5, -27);
        
        // Right antenna shadow  
        queenGraphics.moveTo(2.7, -18);
        queenGraphics.bezierCurveTo(6.5, -23, 9.5, -25, 8.5, -27);
        
        // Antenna highlights
        queenGraphics.lineStyle(1.5, 0x2A1B10);
        
        // Left antenna
        queenGraphics.moveTo(-2.5, -17.5);
        queenGraphics.bezierCurveTo(-6, -22.5, -9, -24.5, -8, -26.5);
        
        // Right antenna
        queenGraphics.moveTo(2.5, -17.5);
        queenGraphics.bezierCurveTo(6, -22.5, 9, -24.5, 8, -26.5);
        
        // Antenna tips (clubs) - larger for queen
        queenGraphics.lineStyle(0);
        queenGraphics.beginFill(0x2A1B10);
        queenGraphics.drawCircle(-8, -26.5, 1.5);
        queenGraphics.drawCircle(8, -26.5, 1.5);
        queenGraphics.endFill();
        
        // Antenna tip highlights
        queenGraphics.beginFill(0x3D2817);
        queenGraphics.drawCircle(-8.3, -26.8, 1);
        queenGraphics.drawCircle(7.7, -26.8, 1);
        queenGraphics.endFill();
        
        // Crown with 3D depth effect
        queenGraphics.lineStyle(0);
        
        // Crown shadow
        queenGraphics.beginFill(0xB8860B, 0.6); // Dark gold shadow
        queenGraphics.drawRect(-6.5, -21.5, 13, 3.5);
        queenGraphics.endFill();
        
        // Crown base with gradient effect
        queenGraphics.beginFill(0xFFD700); // Gold color
        queenGraphics.drawRect(-6, -22, 12, 3);
        queenGraphics.endFill();
        
        // Crown highlight
        queenGraphics.beginFill(0xFFE55C);
        queenGraphics.drawRect(-6, -22, 12, 1.5);
        queenGraphics.endFill();
        
        // Crown points with 3D effect
        // Shadow points
        queenGraphics.beginFill(0xB8860B);
        queenGraphics.moveTo(-6.5, -21.5);
        queenGraphics.lineTo(-4.5, -26.5);
        queenGraphics.lineTo(-2.5, -21.5);
        queenGraphics.lineTo(-0.5, -26.5);
        queenGraphics.lineTo(1.5, -21.5);
        queenGraphics.lineTo(3.5, -26.5);
        queenGraphics.lineTo(5.5, -21.5);
        queenGraphics.endFill();
        
        // Main crown points
        queenGraphics.beginFill(0xFFD700);
        queenGraphics.moveTo(-6, -22);
        queenGraphics.lineTo(-4, -26);
        queenGraphics.lineTo(-2, -22);
        queenGraphics.lineTo(0, -26);
        queenGraphics.lineTo(2, -22);
        queenGraphics.lineTo(4, -26);
        queenGraphics.lineTo(6, -22);
        queenGraphics.endFill();
        
        // Crown point highlights
        queenGraphics.beginFill(0xFFE55C);
        queenGraphics.moveTo(-6, -22);
        queenGraphics.lineTo(-4.5, -24);
        queenGraphics.lineTo(-3, -22);
        queenGraphics.moveTo(-1, -22);
        queenGraphics.lineTo(-0.5, -24);
        queenGraphics.lineTo(1, -22);
        queenGraphics.moveTo(3, -22);
        queenGraphics.lineTo(3.5, -24);
        queenGraphics.lineTo(5, -22);
        queenGraphics.endFill();
        
        // Jewels with 3D effect and shadows
        // Red jewel shadow
        queenGraphics.beginFill(0x8B0000, 0.6);
        queenGraphics.drawCircle(-2.7, -22.7, 1.2);
        queenGraphics.endFill();
        // Red jewel
        queenGraphics.beginFill(0xFF0000);
        queenGraphics.drawCircle(-3, -23, 1);
        queenGraphics.endFill();
        // Red jewel highlight
        queenGraphics.beginFill(0xFF6B6B);
        queenGraphics.drawCircle(-3.3, -23.3, 0.4);
        queenGraphics.endFill();
        
        // Blue jewel shadow
        queenGraphics.beginFill(0x000080, 0.6);
        queenGraphics.drawCircle(0.3, -22.7, 1.2);
        queenGraphics.endFill();
        // Blue jewel
        queenGraphics.beginFill(0x0000FF);
        queenGraphics.drawCircle(0, -23, 1);
        queenGraphics.endFill();
        // Blue jewel highlight
        queenGraphics.beginFill(0x6B6BFF);
        queenGraphics.drawCircle(-0.3, -23.3, 0.4);
        queenGraphics.endFill();
        
        // Green jewel shadow
        queenGraphics.beginFill(0x006400, 0.6);
        queenGraphics.drawCircle(3.3, -22.7, 1.2);
        queenGraphics.endFill();
        // Green jewel
        queenGraphics.beginFill(0x00FF00);
        queenGraphics.drawCircle(3, -23, 1);
        queenGraphics.endFill();
        // Green jewel highlight
        queenGraphics.beginFill(0x6BFF6B);
        queenGraphics.drawCircle(2.7, -23.3, 0.4);
        queenGraphics.endFill();
        
        return queenGraphics;
    });
    
    // Register larvae asset for better visibility
    AssetDefinition.register('larvae', function(app) {
        const larvaeGraphics = AssetDefinition.createGraphics();
        
        // Create a bright glow background - reduced by 30%
        larvaeGraphics.beginFill(0xFFFF00, 0.4); // Bright yellow glow
        larvaeGraphics.drawCircle(0, 0, 10.5); // Reduced from 15
        larvaeGraphics.endFill();
        
        // Create the main larvae body - reduced by 30%
        larvaeGraphics.beginFill(0xFFFF00);
        larvaeGraphics.drawEllipse(0, 0, 5.6, 8.4); // Reduced from 8, 12
        larvaeGraphics.endFill();
        
        // Add segmentation to the larvae - reduced by 30%
        larvaeGraphics.lineStyle(1.4, 0xAA9900); // Reduced from 2
        larvaeGraphics.moveTo(-5.6, -4.2); // Reduced from -8, -6
        larvaeGraphics.lineTo(5.6, -4.2); // Reduced from 8, -6
        larvaeGraphics.moveTo(-5.6, 0); // Reduced from -8, 0
        larvaeGraphics.lineTo(5.6, 0); // Reduced from 8, 0
        larvaeGraphics.moveTo(-5.6, 4.2); // Reduced from -8, 6
        larvaeGraphics.lineTo(5.6, 4.2); // Reduced from 8, 6
        
        // Add a border - reduced by 30%
        larvaeGraphics.lineStyle(1.4, 0xAA9900); // Reduced from 2
        larvaeGraphics.drawEllipse(0, 0, 5.6, 8.4); // Reduced from 8, 12
        
        return larvaeGraphics;
    });
    
    // Register egg asset for larvae effect
    AssetDefinition.register('egg', function(app) {
        const eggGraphics = AssetDefinition.createGraphics();
        
        // Create a highlight behind the egg - reduced by 30%
        eggGraphics.beginFill(0xFFFFAA, 0.5);
        eggGraphics.drawCircle(0, 0, 8.4); // Reduced from 12
        eggGraphics.endFill();
        
        // Create the egg - reduced by 30%
        eggGraphics.beginFill(0xFFFFF0); // Off-white color
        eggGraphics.drawEllipse(0, 0, 7, 9.8); // Reduced from 10, 14
        eggGraphics.endFill();
        
        // Add a slight shadow - reduced by 30%
        eggGraphics.beginFill(0xEEEEDD, 0.3);
        eggGraphics.drawEllipse(0.7, 0.7, 6.3, 9.1); // Reduced from 1, 1, 9, 13
        eggGraphics.endFill();
        
        // Add a border - reduced thickness proportionally
        eggGraphics.lineStyle(1.4, 0xAA9900); // Reduced from 2
        eggGraphics.drawEllipse(0, 0, 7, 9.8); // Reduced from 10, 14
        
        return eggGraphics;
    });
})(); 

IdleAnts.Assets.Ants = {
    ANT: {
        id: 'ant',
        path: 'assets/textures/ant_spritesheet.png',
        isSpriteSheet: true,
        frames: 4, // Number of frames in the spritesheet
        frameWidth: 32, // Width of a single frame
        frameHeight: 32, // Height of a single frame
        animationSpeed: 0.15
    },
    FLYING_ANT: {
        id: 'flying_ant',
        path: 'assets/textures/flying_ant_spritesheet.png', // Placeholder - replace with actual path
        isSpriteSheet: true,
        frames: 4, // Example: 4 frames for flying animation
        frameWidth: 48, // Example width
        frameHeight: 48, // Example height
        animationSpeed: 0.2
    },
    QUEEN_ANT: {
        id: 'queen_ant',
        path: 'assets/textures/queen_ant.png', // Placeholder - replace with actual path
        scale: { x: 1.5, y: 1.5 },
        animationSpeed: 0.1 // Example, if animated
    },
    // Add new CarAnt placeholder texture
    CAR_ANT: {
        id: 'car_ant',
        type: 'graphic', // Signify that this asset is generated by a function
        generator: function(appInstance) {
            // This graphic will serve as the base texture for the CarAnt sprite.
            // CarAnt.js will add its detailed body and wheels as children to this base.
            const carChassisGraphics = IdleAnts.Assets.AssetDefinition.createGraphics();
            
            // A simple dark grey rectangle for the chassis.
            carChassisGraphics.beginFill(0x333333); // Dark grey color for chassis
            carChassisGraphics.drawRect(-15, -6, 30, 12); // Chassis dimensions (width: 30, height: 12)
            carChassisGraphics.endFill();
            
            // The AssetManager is expected to take this PIXI.Graphics object 
            // and generate a texture from it.
            return carChassisGraphics;
        },
        scale: { x: 1.0, y: 1.0 }, // Existing scale, CarAnt.js also handles its scale
        isSpriteSheet: false, // Correct, it's a single generated graphic
        frames: 1 // Correct
    }
};

// Function to generate ant egg texture if needed (example, might not be used if queen produces live ants)
IdleAnts.Assets.Ants.EGG = {
    id: 'ant_egg',
    type: 'graphic', // Special type to indicate procedurally generated graphic
    generator: (app) => {
        const eggGraphics = new PIXI.Graphics();
        eggGraphics.beginFill(0xFFFFE0); // Light yellow
        eggGraphics.drawEllipse(0, 0, 8, 12); // Egg shape
        eggGraphics.endFill();
        // You might want to render this to a texture once for performance if many eggs are shown
        // return app.renderer.generateTexture(eggGraphics); // AssetManager will handle texture generation
        return eggGraphics; // Return the PIXI.Graphics object directly
    }
}; 

// ===== assets/foodAssets.js =====
// assets/foodAssets.js
(function() {
    // Get a reference to the AssetDefinition class
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;
    
    // Register basic food asset
    AssetDefinition.register('food', function(app) {
        const foodGraphics = AssetDefinition.createGraphics();
        foodGraphics.beginFill(0xEAD2AC); // Light beige (base color)
        foodGraphics.drawCircle(0, 0, 5);
        foodGraphics.endFill();
        
        return foodGraphics;
    });
    
    // Register cookie food asset
    AssetDefinition.register('cookieFood', function(app) {
        const cookieGraphics = AssetDefinition.createGraphics();
        cookieGraphics.beginFill(0xC68E17); // Cookie brown
        cookieGraphics.drawCircle(0, 0, 7); // Slightly larger
        cookieGraphics.endFill();
        
        // Add chocolate chips
        cookieGraphics.beginFill(0x3D2817); // Dark brown
        cookieGraphics.drawCircle(-2, -1, 1.2);
        cookieGraphics.drawCircle(1, 2, 1.0);
        cookieGraphics.drawCircle(2, -2, 0.9);
        cookieGraphics.endFill();
        
        return cookieGraphics;
    });
    
    // Register watermelon food asset
    AssetDefinition.register('watermelonFood', function(app) {
        const watermelonGraphics = AssetDefinition.createGraphics();
        
        // Define colors with vibrant values
        const colors = {
            rindOuter: 0x008800,    // Dark green for outer rind
            rindMain: 0x00FF00,     // Bright green for main rind
            rindInner: 0xFFFFFF,    // White for inner rind
            flesh: 0xFF0000,        // Bright red for flesh
            seed: 0x000000          // Black for seeds
        };
        
        // Size parameters
        const size = 15;            // Overall size control (MUCH smaller)
        
        // Draw the watermelon using a completely different approach
        
        // Draw the base semi-circle (outer rind)
        watermelonGraphics.lineStyle(0);
        watermelonGraphics.beginFill(colors.rindOuter);
        watermelonGraphics.arc(0, 0, size, Math.PI, 0);
        watermelonGraphics.lineTo(0, 0);
        watermelonGraphics.closePath();
        watermelonGraphics.endFill();
        
        // Draw the inner rind (bright green)
        watermelonGraphics.beginFill(colors.rindMain);
        watermelonGraphics.arc(0, 0, size * 0.9, Math.PI, 0);
        watermelonGraphics.lineTo(0, 0);
        watermelonGraphics.closePath();
        watermelonGraphics.endFill();
        
        // Draw the white inner edge
        watermelonGraphics.beginFill(colors.rindInner);
        watermelonGraphics.arc(0, 0, size * 0.75, Math.PI, 0);
        watermelonGraphics.lineTo(0, 0);
        watermelonGraphics.closePath();
        watermelonGraphics.endFill();
        
        // Draw the red flesh
        watermelonGraphics.beginFill(colors.flesh);
        watermelonGraphics.arc(0, 0, size * 0.7, Math.PI, 0);
        watermelonGraphics.lineTo(0, 0);
        watermelonGraphics.closePath();
        watermelonGraphics.endFill();
        
        // Draw seeds directly on the flesh
        watermelonGraphics.beginFill(colors.seed);
        
        // Draw seeds at specific positions within the flesh area
        const seedPositions = [
            {x: 0, y: size * 0.35},
            {x: -size * 0.2, y: size * 0.25},
            {x: size * 0.2, y: size * 0.25},
            {x: -size * 0.35, y: size * 0.15},
            {x: size * 0.35, y: size * 0.15},
            {x: -size * 0.1, y: size * 0.45},
            {x: size * 0.1, y: size * 0.45}
        ];
        
        // Draw each seed
        seedPositions.forEach(pos => {
            // Rotate the coordinate system to match the semi-circle orientation
            const rotatedX = pos.x;
            const rotatedY = -pos.y; // Flip y to match the semi-circle orientation
            
            // Draw the seed
            watermelonGraphics.drawEllipse(rotatedX, rotatedY, size * 0.06, size * 0.09);
        });
        
        watermelonGraphics.endFill();
        
        return watermelonGraphics;
    });
})(); 

// ===== assets/environmentAssets.js =====
// assets/environmentAssets.js
(function() {
    // Get a reference to the AssetDefinition class
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;
    
    // Register nest asset
    AssetDefinition.register('nest', function(app) {
        const nestGraphics = AssetDefinition.createGraphics();
        
        // Main mound
        nestGraphics.beginFill(0x8B4513);
        nestGraphics.drawCircle(0, 0, 30);
        nestGraphics.endFill();
        
        // Entrance hole
        nestGraphics.beginFill(0x3D2817);
        nestGraphics.drawCircle(0, 0, 10);
        nestGraphics.endFill();
        
        // Add some texture to the mound with lighter spots
        nestGraphics.beginFill(0xA86032);
        nestGraphics.drawCircle(-15, -10, 8);
        nestGraphics.drawCircle(10, 15, 6);
        nestGraphics.drawCircle(15, -5, 5);
        nestGraphics.endFill();
        
        return nestGraphics;
    });
    
    // Register ground asset
    AssetDefinition.register('ground', function(app) {
        const groundGraphics = AssetDefinition.createGraphics();
        
        // Create a grass texture that tiles perfectly
        const tileSize = 64;
        
        // Base grass color
        groundGraphics.beginFill(0x4CAF50);
        groundGraphics.drawRect(0, 0, tileSize, tileSize);
        groundGraphics.endFill();
        
        // Add grass variation using a pattern that repeats perfectly
        // Use mathematical patterns instead of random placement
        groundGraphics.beginFill(0x388E3C, 0.3); // Darker green spots
        
        // Create a repeating pattern of grass blades
        for (let x = 2; x < tileSize; x += 6) {
            for (let y = 2; y < tileSize; y += 8) {
                // Stagger every other row for more natural look
                const offsetX = (y % 16 === 2) ? 3 : 0;
                const grassX = (x + offsetX) % tileSize;
                
                // Draw small grass blade
                groundGraphics.drawRect(grassX, y, 1, 3);
                groundGraphics.drawRect(grassX + 1, y + 1, 1, 2);
            }
        }
        groundGraphics.endFill();
        
        // Add lighter highlights
        groundGraphics.beginFill(0x81C784, 0.4);
        for (let x = 4; x < tileSize; x += 8) {
            for (let y = 4; y < tileSize; y += 10) {
                const offsetX = (y % 20 === 4) ? 4 : 0;
                const grassX = (x + offsetX) % tileSize;
                
                // Smaller highlight blades
                groundGraphics.drawRect(grassX, y, 1, 2);
            }
        }
        groundGraphics.endFill();
        
        // Add very subtle texture dots
        groundGraphics.beginFill(0xA5D6A7, 0.2);
        for (let x = 8; x < tileSize; x += 12) {
            for (let y = 6; y < tileSize; y += 14) {
                groundGraphics.drawCircle(x, y, 1);
            }
        }
        groundGraphics.endFill();
        
        return groundGraphics;
    });
})(); 

// ===== assets/audioAssets.js =====
// Audio assets for Idle Ants
IdleAnts.AudioAssets = {
    // Background music
    BGM: {
        MAIN_THEME: {
            id: 'bgm_main_theme',
            path: 'assets/audio/main_theme.mp3',
            loop: true,
            volume: 0.5
        },
        // Add more BGM tracks as needed
    },
    
    // Sound effects
    SFX: {
        ANT_SPAWN: {
            id: 'sfx_ant_spawn',
            path: 'assets/audio/ant_spawn.mp3',
            volume: 0.4
        }
        // Add more sound effects as needed
    }
}; 

// ===== src/managers/ResourceManager.js =====
// src/managers/ResourceManager.js
IdleAnts.Managers.ResourceManager = class {
    constructor() {
        // Log debug status for verification
        console.log('ResourceManager initializing with debug mode:', IdleAnts.Config.debug);
        
        // Game resources
        this.resources = {
            food: IdleAnts.Config.debug ? 1000000 : 0, // Use 1 million in debug mode, otherwise 0
            displayFood: IdleAnts.Config.debug ? 1000000 : 0 // For smooth animation
        };
        
        // Game stats
        this.stats = {
            ants: 1,
            maxAnts: 10,
            flyingAnts: 0,
            maxFlyingAnts: 0,  // Start with no flying ants allowed
            flyingAntsUnlocked: false,  // Flying ants need to be unlocked first
            foodPerClick: 1,
            foodPerSecond: 0,
            antCost: 10,
            flyingAntCost: 100,  // Flying ants are more expensive
            flyingAntUnlockCost: 500,  // Initial cost to unlock flying ants
            foodUpgradeCost: 1000, // Changed from 50 to 1000 as requested
            expandCost: 100,
            foodMultiplier: 1,
            speedUpgradeCost: 75,
            speedMultiplier: 1,
            // New strength-related properties
            strengthUpgradeCost: 50,
            strengthMultiplier: 1, // Now represents the actual carrying capacity
            // Food tier properties
            foodTier: 1,  // Start with basic food (tier 1)
            maxFoodTier: 3, // Now includes watermelon (tier 3)
            // Autofeeder properties
            autofeederUnlocked: false,
            autofeederLevel: 0,
            maxAutofeederLevel: 10,
            autofeederCost: 500, // Reduced from 1000 to 500
            autofeederUpgradeCost: 500, // Reduced from 1000 to 500
            autofeederBaseFoodAmount: 10, // Base amount of food to sprinkle
            autofeederInterval: 600, // Frames between autofeeder activations (10 seconds at 60fps)
            // Queen ant properties
            queenUnlocked: true,
            hasQueen: true,
            queenUnlockCost: 1000,
            queenCost: 2000,
            queenUpgradeLevel: 0,
            maxQueenUpgradeLevel: 5,
            queenUpgradeCost: 2000,
            queenLarvaeCapacity: 1,
            queenLarvaeProductionRate: 3600, // 60 seconds at 60fps (1 minute)

            // Car Ant properties
            carAnts: 0,
            maxCarAnts: 0, // Starts locked
            carAntsUnlocked: false,
            carAntUnlockCost: 10000, // Example: High cost to unlock
            carAntCost: 2500,       // Example: High cost per Car Ant
            carAntFoodPerSecond: 5, // Example: Car ants are very efficient
            // Fire Ant properties
            fireAnts: 0,
            maxFireAnts: 0,
            fireAntsUnlocked: false,
            fireAntUnlockCost: 20000,
            fireAntCost: 5000,
            fireAntFoodPerSecond: 8
        };
        
        // Map of food tier to food type
        this.foodTierMap = {
            1: IdleAnts.Data.FoodTypes.BASIC,
            2: IdleAnts.Data.FoodTypes.COOKIE,
            3: IdleAnts.Data.FoodTypes.WATERMELON
        };
        
        // Food collection rate tracking
        this.foodRateTracking = {
            recentCollections: [], // Array to store recent food collections
            trackingPeriod: 10, // Number of seconds to track for moving average
            actualFoodRate: 0, // Current calculated food collection rate
            lastFoodAmount: this.resources.food, // Last recorded food amount
            lastUpdateTime: Date.now() // Last time the rate was updated
        };
    }
    
    // Get the current food amount
    getFood() {
        return this.resources.food;
    }
    
    // Food resource methods
    addFood(amount) {
        this.resources.food += amount;
        
        // Track this food addition for rate calculation
        this.trackFoodCollection(amount);
    }
    
    // Track food collection for rate calculation
    trackFoodCollection(amount) {
        const now = Date.now();
        
        // Add this collection to the recent collections array
        this.foodRateTracking.recentCollections.push({
            amount: amount,
            timestamp: now
        });
        
        // Remove collections older than the tracking period
        const cutoffTime = now - (this.foodRateTracking.trackingPeriod * 1000);
        this.foodRateTracking.recentCollections = this.foodRateTracking.recentCollections.filter(
            collection => collection.timestamp >= cutoffTime
        );
        
        // Calculate the actual food rate based on recent collections
        this.updateActualFoodRate();
    }
    
    // Calculate the actual food collection rate based on recent collections
    updateActualFoodRate() {
        const now = Date.now();
        
        // If we have no recent collections, use the theoretical rate
        if (this.foodRateTracking.recentCollections.length === 0) {
            this.foodRateTracking.actualFoodRate = this.stats.foodPerSecond;
            return;
        }
        
        // Calculate total food collected in the tracking period
        const totalFood = this.foodRateTracking.recentCollections.reduce(
            (sum, collection) => sum + collection.amount, 0
        );
        
        // Get the oldest timestamp in our tracking window
        const oldestTimestamp = Math.min(
            ...this.foodRateTracking.recentCollections.map(c => c.timestamp)
        );
        
        // Calculate the time period in seconds
        const periodSeconds = (now - oldestTimestamp) / 1000;
        
        // Calculate the rate (food per second)
        if (periodSeconds > 0) {
            // Calculate the rate and apply some smoothing
            const newRate = totalFood / periodSeconds;
            
            // Apply smoothing to avoid jumpy values (80% new, 20% old)
            this.foodRateTracking.actualFoodRate = 
                (newRate * 0.8) + (this.foodRateTracking.actualFoodRate * 0.2);
        }
        
        // Update last update time
        this.foodRateTracking.lastUpdateTime = now;
    }
    
    // Get the actual food collection rate
    getActualFoodRate() {
        // Update the rate if it's been more than 1 second since last update
        const now = Date.now();
        if (now - this.foodRateTracking.lastUpdateTime > 1000) {
            this.updateActualFoodRate();
        }
        
        return this.foodRateTracking.actualFoodRate;
    }
    
    spendFood(amount) {
        if (this.canAfford(amount)) {
            this.resources.food -= amount;
            return true;
        }
        return false;
    }
    
    canAfford(cost) {
        return this.resources.food >= cost;
    }
    
    // Stats update methods
    increaseAntCount() {
        this.stats.ants++;
        this.updateFoodPerSecond();
    }
    
    // Add complementary method to decrease ant count when an ant dies
    decreaseAntCount() {
        if (this.stats.ants > 0) {
            this.stats.ants--;
            this.updateFoodPerSecond();
        }
    }
    
    // Method to check if an ant can be purchased
    canBuyAnt() {
        return this.canAfford(this.stats.antCost) && 
               this.stats.ants < this.stats.maxAnts;
    }
    
    updateFoodPerSecond() {
        // Regular ants contribute 0.5 food per second, flying ants contribute 2 food per second
        // Car ants contribute based on their stat
        this.stats.foodPerSecond = (this.stats.ants * 0.5) + 
                                   (this.stats.flyingAnts * 2) + 
                                   (this.stats.carAnts * this.stats.carAntFoodPerSecond) +
                                   (this.stats.fireAnts * this.stats.fireAntFoodPerSecond);
    }
    
    increaseMaxAnts(amount) {
        this.stats.maxAnts += amount;
    }
    
    updateAntCost() {
        const oldCost = this.stats.antCost;
        // Gentle incremental increase (≈15 %)
        this.stats.antCost = Math.floor(this.stats.antCost * 1.15);
        console.log(`Ant cost updated: ${oldCost} -> ${this.stats.antCost}`);
    }
    
    updateFoodUpgradeCost() {
        // Previously ×10 ‑ now ×2 for smoother progression
        this.stats.foodUpgradeCost = Math.floor(this.stats.foodUpgradeCost * 2);
    }
    
    updateExpandCost() {
        this.stats.expandCost = Math.floor(this.stats.expandCost * 1.3);
    }
    
    upgradeFoodMultiplier(amount) {
        this.stats.foodMultiplier += amount;
    }
    
    upgradeFoodPerClick() {
        this.stats.foodPerClick = Math.ceil(this.stats.foodPerClick * 1.5);
    }
    
    // New method to upgrade food tier
    upgradeFoodTier() {
        if (this.stats.foodTier < this.stats.maxFoodTier) {
            this.stats.foodTier++;
            return true;
        }
        return false;
    }
    
    // Get the current food type based on food tier
    getCurrentFoodType() {
        try {
            // Check if the food tier map has the current tier
            if (this.foodTierMap && this.foodTierMap[this.stats.foodTier]) {
                return this.foodTierMap[this.stats.foodTier];
            }
            
            // If the specific tier isn't found, try to get the BASIC food type
            if (IdleAnts.Data && IdleAnts.Data.FoodTypes && IdleAnts.Data.FoodTypes.BASIC) {
                console.warn("Food tier not found, using BASIC food type");
                return IdleAnts.Data.FoodTypes.BASIC;
            }
            
            // Last resort: create a minimal valid food type object
            console.error("No valid food types available, creating fallback");
            return {
                id: 'fallback',
                name: 'Food',
                value: 1,
                weight: 1,
                collectionTime: 0,
                rarity: 1,
                scale: {min: 0.7, max: 1.3},
                color: 0xEAD2AC,
                glowColor: 0xFFFF99,
                glowAlpha: 0.3,
                description: 'Simple food.'
            };
        } catch (error) {
            console.error("Error getting food type:", error);
            // If all else fails, return a minimal valid object
            return {
                id: 'error',
                name: 'Food',
                value: 1,
                scale: {min: 1, max: 1},
                color: 0xFFFFFF,
                glowColor: 0xFFFF99,
                glowAlpha: 0.3
            };
        }
    }
    
    // Check if food can be upgraded further
    canUpgradeFoodTier() {
        return this.stats.foodTier < this.stats.maxFoodTier;
    }
    
    // Method to check if food can be upgraded
    canUpgradeFood() {
        return this.canAfford(this.stats.foodUpgradeCost);
    }
    
    updateSpeedUpgradeCost() {
        this.stats.speedUpgradeCost = Math.floor(this.stats.speedUpgradeCost * 1.25);
    }
    
    upgradeSpeedMultiplier(amount) {
        this.stats.speedMultiplier += amount;
    }
    
    // Flying ant methods
    unlockFlyingAnts() {
        // Check if we can afford it and if flying ants aren't already unlocked
        if (this.resources.food >= this.stats.flyingAntUnlockCost && !this.stats.flyingAntsUnlocked) {
            // Deduct the food cost
            this.resources.food -= this.stats.flyingAntUnlockCost;
            
            // Set flying ants as unlocked
            this.stats.flyingAntsUnlocked = true;
            
            // Set initial max flying ants
            this.stats.maxFlyingAnts = 3;
            
            return true;
        }
        
        return false;
    }
    
    canBuyFlyingAnt() {
        return this.stats.flyingAntsUnlocked && 
               this.canAfford(this.stats.flyingAntCost) && 
               this.stats.flyingAnts < this.stats.maxFlyingAnts;
    }
    
    buyFlyingAnt() {
        if (this.canBuyFlyingAnt()) {
            this.spendFood(this.stats.flyingAntCost);
            this.stats.flyingAnts++;
            const oldCost = this.stats.flyingAntCost;
            this.stats.flyingAntCost = Math.floor(this.stats.flyingAntCost * 1.25);
            console.log(`Flying Ant cost updated: ${oldCost} -> ${this.stats.flyingAntCost}`);
            this.updateFoodPerSecond();
            return true;
        }
        return false;
    }
    
    expandFlyingAntCapacity() {
        const expandFlyingCost = Math.floor(this.stats.expandCost * 1.5);
        if (this.stats.flyingAntsUnlocked && this.canAfford(expandFlyingCost)) {
            this.spendFood(expandFlyingCost);
            this.stats.maxFlyingAnts += 2; // Add fewer flying ants per upgrade
            return true;
        }
        return false;
    }
    
    // New strength-related methods
    updateStrengthUpgradeCost() {
        this.stats.strengthUpgradeCost = Math.floor(this.stats.strengthUpgradeCost * 1.2);
    }
    
    upgradeStrengthMultiplier(amount) {
        // Directly increase strength multiplier by the integer amount
        this.stats.strengthMultiplier += amount;
        
        // This value now directly represents:
        // 1. The ants' carrying capacity (how many foods they can carry)
        // 2. Also affects collection time for heavy food types (calculated in Food.js)
    }
    
    canUpgradeStrength() {
        return this.canAfford(this.stats.strengthUpgradeCost);
    }
    
    upgradeStrength() {
        if (this.canUpgradeStrength()) {
            this.spendFood(this.stats.strengthUpgradeCost);
            this.upgradeStrengthMultiplier(1); // Increase strength by 1 per upgrade
            this.updateStrengthUpgradeCost();
            return true;
        }
        return false;
    }
    
    // Autofeeder methods
    canUnlockAutofeeder() {
        return !this.stats.autofeederUnlocked && this.canAfford(this.stats.autofeederCost);
    }
    
    unlockAutofeeder() {
        if (this.canUnlockAutofeeder()) {
            this.spendFood(this.stats.autofeederCost);
            this.stats.autofeederUnlocked = true;
            this.stats.autofeederLevel = 1;
            return true;
        }
        return false;
    }
    
    canUpgradeAutofeeder() {
        return this.stats.autofeederUnlocked && 
               this.stats.autofeederLevel < this.stats.maxAutofeederLevel && 
               this.canAfford(this.stats.autofeederUpgradeCost);
    }
    
    upgradeAutofeeder() {
        if (this.canUpgradeAutofeeder()) {
            this.spendFood(this.stats.autofeederUpgradeCost);
            this.stats.autofeederLevel++;
            this.updateAutofeederUpgradeCost();
            return true;
        }
        return false;
    }
    
    updateAutofeederUpgradeCost() {
        this.stats.autofeederUpgradeCost = Math.floor(this.stats.autofeederUpgradeCost * 1.3);
    }
    
    getAutofeederFoodAmount() {
        // Each level multiplies the amount by 1.2 (reduced from 1.5 for more balanced progression)
        return Math.floor(this.stats.autofeederBaseFoodAmount * Math.pow(1.2, this.stats.autofeederLevel - 1));
    }
    
    updateQueenUpgradeCost() {
        this.stats.queenUpgradeCost = Math.floor(this.stats.queenUpgradeCost * 1.4);
    }
    
    // Queen ant methods
    canUnlockQueen() {
        return !this.stats.queenUnlocked && this.canAfford(this.stats.queenUnlockCost);
    }
    
    unlockQueen() {
        if (!this.canUnlockQueen()) return false;
        
        this.spendFood(this.stats.queenUnlockCost);
        this.stats.queenUnlocked = true;
        this.stats.queenLarvaeCapacity += 1;
        return true;
    }
    
    canBuyQueen() {
        return this.stats.queenUnlocked && 
               !this.stats.hasQueen && 
               this.canAfford(this.stats.queenCost);
    }
    
    buyQueen() {
        if (!this.canBuyQueen()) return false;
        
        this.spendFood(this.stats.queenCost);
        this.stats.hasQueen = true;
        return true;
    }
    
    canUpgradeQueen() {
        return this.stats.hasQueen && 
               this.stats.queenUpgradeLevel < this.stats.maxQueenUpgradeLevel && 
               this.canAfford(this.stats.queenUpgradeCost);
    }
    
    upgradeQueen() {
        if (!this.canUpgradeQueen()) return false;
        
        this.spendFood(this.stats.queenUpgradeCost);
        this.stats.queenUpgradeLevel++;
        
        // Increase larvae capacity by 1 each level
        this.stats.queenLarvaeCapacity += 1;
        // Queen HP will be implemented later
        console.log(`Queen upgraded to level ${this.stats.queenUpgradeLevel}`);
        
        // Update upgrade cost
        this.updateQueenUpgradeCost();
        
        return true;
    }

    // Car Ant Methods
    canUnlockCarAnts() {
        return this.canAfford(this.stats.carAntUnlockCost) && !this.stats.carAntsUnlocked;
    }

    unlockCarAnts() {
        if (this.canUnlockCarAnts()) {
            this.spendFood(this.stats.carAntUnlockCost);
            this.stats.carAntsUnlocked = true;
            this.stats.maxCarAnts = 2; // Unlock a small initial capacity, e.g., 2
            console.log("Car Ants Unlocked!");
            // Potentially update UI or trigger game event here
            return true;
        }
        return false;
    }

    canBuyCarAnt() {
        return this.stats.carAntsUnlocked && 
               this.canAfford(this.stats.carAntCost) && 
               this.stats.carAnts < this.stats.maxCarAnts;
    }

    buyCarAnt() {
        if (this.canBuyCarAnt()) {
            this.spendFood(this.stats.carAntCost);
            this.stats.carAnts++;
            this.updateFoodPerSecond(); // Recalculate food per second
            this.updateCarAntCost();    // Increase cost for the next one
            console.log("Car Ant Purchased! Total Car Ants: " + this.stats.carAnts);
            return true;
        }
        return false;
    }

    updateCarAntCost() {
        this.stats.carAntCost = Math.floor(this.stats.carAntCost * 1.25);
    }

    // Method to expand Car Ant capacity (similar to flying ants)
    canExpandCarAntCapacity() {
        // Define a cost for expanding car ant capacity, e.g., based on current max or a fixed high cost
        // For simplicity, let's use a cost that scales with the number of car ants or a fixed high value
        const expandCarAntCapacityCost = this.stats.maxCarAnts > 0 ? this.stats.carAntCost * (this.stats.maxCarAnts + 1) * 0.5 : 5000;
        return this.stats.carAntsUnlocked && this.canAfford(expandCarAntCapacityCost);
    }

    expandCarAntCapacity() {
        const expandCarAntCapacityCost = this.stats.maxCarAnts > 0 ? this.stats.carAntCost * (this.stats.maxCarAnts + 1) * 0.5 : 5000;
        if (this.canExpandCarAntCapacity()) {
            this.spendFood(expandCarAntCapacityCost);
            this.stats.maxCarAnts += 1; // Increase max by 1 or a fixed amount
            console.log("Car Ant capacity expanded to: " + this.stats.maxCarAnts);
            return true;
        }
        return false;
    }

    // Fire Ant Methods
    canUnlockFireAnts() {
        return this.canAfford(this.stats.fireAntUnlockCost) && !this.stats.fireAntsUnlocked;
    }

    unlockFireAnts() {
        if (this.canUnlockFireAnts()) {
            this.spendFood(this.stats.fireAntUnlockCost);
            this.stats.fireAntsUnlocked = true;
            this.stats.maxFireAnts = 2; // initial capacity
            return true;
        }
        return false;
    }

    canBuyFireAnt() {
        return this.stats.fireAntsUnlocked &&
               this.canAfford(this.stats.fireAntCost) &&
               this.stats.fireAnts < this.stats.maxFireAnts;
    }

    buyFireAnt() {
        if (this.canBuyFireAnt()) {
            this.spendFood(this.stats.fireAntCost);
            this.stats.fireAnts++;
            this.updateFoodPerSecond();
            this.updateFireAntCost();
            return true;
        }
        return false;
    }

    updateFireAntCost() {
        this.stats.fireAntCost = Math.floor(this.stats.fireAntCost * 1.25);
    }

    canExpandFireAntCapacity() {
        const cost = this.stats.maxFireAnts > 0 ? this.stats.fireAntCost * (this.stats.maxFireAnts + 1) * 0.5 : 10000;
        return this.stats.fireAntsUnlocked && this.canAfford(cost);
    }

    expandFireAntCapacity() {
        const cost = this.stats.maxFireAnts > 0 ? this.stats.fireAntCost * (this.stats.maxFireAnts + 1) * 0.5 : 10000;
        if (this.canExpandFireAntCapacity()) {
            this.spendFood(cost);
            this.stats.maxFireAnts += 1;
            return true;
        }
        return false;
    }
} 

// ===== src/managers/AssetManager.js =====
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
        console.log("AssetManager: Starting asset loading...");
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
                                        console.log(`AssetManager: Processing asset ${assetConfig.id}`);
                                        if (assetConfig.path) {
                                            // Load texture from path
                                            try {
                                                console.log(`AssetManager: Loading texture for ${assetConfig.id} from ${assetConfig.path}`);
                                                const texture = await PIXI.Assets.load(assetConfig.path);
                                                this.textures[assetConfig.id] = texture;
                                                console.log(`AssetManager: Texture ${assetConfig.id} loaded successfully.`);
                                            } catch (error) {
                                                console.error(`AssetManager: Error loading texture for ${assetConfig.id} from ${assetConfig.path}:`, error);
                                            }
                                        } else if (assetConfig.generator && typeof assetConfig.generator === 'function') {
                                            // Generate texture from generator function
                                            try {
                                                console.log(`AssetManager: Generating texture for ${assetConfig.id}`);
                                                const graphics = assetConfig.generator(this.app);
                                                if (graphics instanceof PIXI.Graphics) {
                                                    this.textures[assetConfig.id] = this.app.renderer.generateTexture(graphics);
                                                    console.log(`AssetManager: Texture ${assetConfig.id} generated successfully.`);
                                                } else {
                                                    console.error(`AssetManager: Generator for ${assetConfig.id} did not return a PIXI.Graphics object.`);
                                                }
                                            } catch (error) {
                                                console.error(`AssetManager: Error generating texture for ${assetConfig.id}:`, error);
                                            }
                                        } else {
                                            console.warn(`AssetManager: Asset ${assetConfig.id} has no path or generator.`);
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
            if (this.assetDefinitions && Object.keys(this.assetDefinitions).length > 0) { // Check this.assetDefinitions
                for (const [name, definitionFn] of Object.entries(this.assetDefinitions)) { // Iterate over this.assetDefinitions
                    try {
                        console.log(`AssetManager: Generating texture for registered asset ${name}`);
                        const graphics = definitionFn(this.app);
                        if (graphics instanceof PIXI.Graphics) {
                           this.textures[name] = this.app.renderer.generateTexture(graphics);
                           console.log(`AssetManager: Texture for registered asset ${name} generated successfully.`);
                        } else {
                            console.error(`AssetManager: Generator for registered asset ${name} did not return a PIXI.Graphics object.`);
                        }
                    } catch (error) {
                        console.error(`AssetManager: Error generating texture for registered asset ${name}:`, error);
                    }
                }
            }
            
            console.log("AssetManager: Asset loading finished.");
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

// ===== src/managers/BackgroundManager.js =====
// src/managers/BackgroundManager.js
IdleAnts.Managers.BackgroundManager = class {
    constructor(app, assetManager, worldContainer) {
        this.app = app;
        this.assetManager = assetManager;
        this.worldContainer = worldContainer;
    }
    
    createBackground(width, height) {
        // Create a tiled background with the ground texture
        const groundTexture = this.assetManager.getTexture('ground');
        
        // Use repeat wrapping and linear filtering for smooth tiling
        groundTexture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        groundTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        
        // Ensure the texture is properly set up for tiling
        if (groundTexture.baseTexture.resource) {
            groundTexture.baseTexture.resource.style = {
                ...groundTexture.baseTexture.resource.style,
                imageRendering: 'pixelated'
            };
        }
        
        // Use provided width/height for the larger map, or fallback to screen size
        const mapWidth = width || this.app.screen.width;
        const mapHeight = height || this.app.screen.height;
        
        this.background = new PIXI.TilingSprite(
            groundTexture,
            mapWidth,
            mapHeight
        );
        
        // Use exact integer scaling and positioning to prevent seams
        this.background.tileScale.set(1, 1);
        this.background.roundPixels = true;
        this.background.anchor.set(0, 0);
        this.background.position.set(0, 0);
        
        // Force pixel-perfect rendering
        this.background.filters = [];
        this.background.alpha = 1.0;
        
        // Add to world container instead of directly to stage
        this.worldContainer.addChildAt(this.background, 0);
        
        // Create border. Interior grid disabled by default to avoid visible seams
        this.createMapBorder(mapWidth, mapHeight, false);
        
        // Only update the viewport size when the window is resized, not the map size
        window.addEventListener('resize', () => {
            // Don't need to adjust the background size anymore as it stays fixed to the map size
            // Only the camera position might need adjustment if viewport is larger than world
        });
    }
    
    createMapBorder(width, height, interiorGrid = true) {
        // Create a border around the map to indicate its edges
        const border = new PIXI.Graphics();
        border.lineStyle(5, 0x333333, 0.8);
        border.drawRect(0, 0, width, height);
        
        if(interiorGrid){
            border.lineStyle(1, 0x333333, 0.3);
            // Add vertical grid lines every 500 pixels
            for (let x = 500; x < width; x += 500) {
                border.moveTo(x, 0);
                border.lineTo(x, height);
            }
            // Add horizontal grid lines every 500 pixels
            for (let y = 500; y < height; y += 500) {
                border.moveTo(0, y);
                border.lineTo(width, y);
            }
        }
        
        this.worldContainer.addChild(border);
    }
}; 

// ===== src/managers/EffectManager.js =====
// src/managers/EffectManager.js
IdleAnts.Managers.EffectManager = class {
    constructor(app) {
        this.app = app;
        this.effects = [];
        this.effectClasses = {
            'spawn': IdleAnts.Effects.SpawnEffect,
            'foodSpawn': IdleAnts.Effects.FoodSpawnEffect,
            'foodDrop': IdleAnts.Effects.FoodDropEffect,
            'foodCollect': IdleAnts.Effects.FoodCollectEffect,
            'trail': IdleAnts.Effects.Trail,
            'larvae': IdleAnts.Effects.LarvaeEffect
        };
        
        // Call the static registerEffects method if it exists
        if (IdleAnts.Managers.EffectManager.registerEffects) {
            IdleAnts.Managers.EffectManager.registerEffects(this);
        }
    }
    
    // Generic method for creating any type of effect
    createEffect(type, x, y, color, scale) {
        const EffectClass = this.effectClasses[type];
        if (!EffectClass) {
            console.warn(`Effect type "${type}" not found`);
            return;
        }
        
        const effect = new EffectClass(this.app, x, y, color, scale);
        this.effects.push(effect);
        effect.play();
        return effect;
    }
    
    // Update method to handle all active effects
    update() {
        // Use a small fixed delta for consistent animation speed
        const delta = 0.016; // ~60fps
        
        // Update all effects and remove those that are complete
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            
            // Check if the effect has an update method
            if (typeof effect.update === 'function') {
                // If update returns false, the effect is complete
                const isActive = effect.update(delta);
                
                if (!isActive) {
                    // Clean up the effect if it has a destroy method
                    if (typeof effect.destroy === 'function') {
                        effect.destroy();
                    }
                    
                    // Remove from the array
                    this.effects.splice(i, 1);
                }
            }
        }
    }
    
    // Methods for creating trails
    createTrail(x, y, color, alpha, isFlying = false, hasFood = false) {
        // Create a trail effect with the specified properties
        const trail = new IdleAnts.Effects.Trail(this.app, x, y, color, alpha, isFlying, hasFood);
        this.effects.push(trail);
        trail.play();
        return trail;
    }
    
    createAntTrail(ant) {
        // Determine trail properties based on ant state
        const hasFood = ant.foodCollected > 0;
        const trailColor = hasFood ? 0xFFD700 : 0xFFFFFF; // Gold for food-carrying ants, white for others
        const trailAlpha = hasFood ? 0.25 : 0.15;
        const isFlying = ant.constructor.name.includes('Flying');
        
        return this.createTrail(ant.x, ant.y, trailColor, trailAlpha, isFlying, hasFood);
    }
    
    createFlyingAntTrail(flyingAnt) {
        // Determine trail properties for flying ants
        const hasFood = flyingAnt.foodCollected > 0;
        const trailColor = hasFood ? 0xFFD700 : 0xAAFFFF; // Gold for food-carrying, light blue otherwise
        const trailAlpha = hasFood ? 0.35 : 0.25;
        
        return this.createTrail(flyingAnt.x, flyingAnt.y, trailColor, trailAlpha, true, hasFood);
    }
    
    // Legacy methods for backward compatibility
    createSpawnEffect(x, y, isFlying = false) {
        // Use a special color for flying ants (light blue)
        const color = isFlying === true ? 0x00CCFF : 0xFFFFFF;
        return this.createEffect('spawn', x, y, color);
    }
    
    createFoodSpawnEffect(x, y, color = 0xFFFF99) {
        return this.createEffect('foodSpawn', x, y, color);
    }
    
    createFoodDropEffect(x, y, color = 0xFFFF99) {
        return this.createEffect('foodDrop', x, y, color);
    }
    
    createFoodCollectEffect(x, y, color = 0xFFFF99, scale = 1.0) {
        return this.createEffect('foodCollect', x, y, color, scale);
    }
    
    createLarvaeEffect(x, y, color = 0xFFFF00, scale = 1.5) {
        // Check if the LarvaeEffect class is registered
        if (!this.effectClasses['larvae'] && IdleAnts.Effects.LarvaeEffect) {
            this.effectClasses['larvae'] = IdleAnts.Effects.LarvaeEffect;
        }
        
        // Create the larvae effect
        return this.createEffect('larvae', x, y, color, scale);
    }
} 

// ===== src/managers/EntityManager.js =====
// src/managers/EntityManager.js
IdleAnts.Managers.EntityManager = class {
    constructor(app, assetManager, resourceManager, worldContainer) {
        this.app = app;
        this.assetManager = assetManager;
        this.resourceManager = resourceManager;
        this.worldContainer = worldContainer;
        this.effectManager = null; // Will be set after initialization
        
        // Create containers for game objects
        this.entitiesContainers = {
            ants: new PIXI.Container(),
            flyingAnts: new PIXI.Container(),
            food: new PIXI.Container(),
            nest: new PIXI.Container(),
            queen: new PIXI.Container(), // Container for queen ant
            larvae: new PIXI.Container(), // New container for larvae
            carAnts: new PIXI.Container(), // New container for Car Ants
            fireAnts: new PIXI.Container(), // Container for Fire Ants
            enemies: new PIXI.Container() // Container for Enemies
        };
        
        // Add containers to the world container instead of directly to the stage
        this.worldContainer.addChild(this.entitiesContainers.nest);
        this.worldContainer.addChild(this.entitiesContainers.food);
        this.worldContainer.addChild(this.entitiesContainers.larvae); // Add larvae container
        this.worldContainer.addChild(this.entitiesContainers.ants);
        this.worldContainer.addChild(this.entitiesContainers.flyingAnts);
        this.worldContainer.addChild(this.entitiesContainers.queen); // Add queen container
        this.worldContainer.addChild(this.entitiesContainers.carAnts); // Add Car Ants container
        this.worldContainer.addChild(this.entitiesContainers.fireAnts); // Add Fire Ants container
        this.worldContainer.addChild(this.entitiesContainers.enemies); // Enemies container
        
        // Entity collections
        this.entities = {
            ants: [],
            flyingAnts: [],
            foods: [],
            queen: null, // Reference to the queen ant
            larvae: [], // Array for larvae entities
            carAnts: [], // Array for Car Ant entities
            fireAnts: [], // Array for Fire Ant entities
            enemies: [] // Array for enemies
        };
        
        this.nest = null;
        this.nestPosition = null;
        
        // Trail settings
        this.trailInterval = 10;
        this.frameCounter = 0;
        
        // Food spawn timer settings
        this.foodSpawnCounter = 0;
        this.foodSpawnInterval = 180; // Spawn food every 180 frames (about 3 seconds at 60fps)
        
        // Autofeeder timer settings
        this.autofeederCounter = 0;
        
        // Map bounds - will be set during setup
        this.mapBounds = {
            width: 0,
            height: 0
        };
        
        this.enemySpawnCounter = 0;
        this.enemySpawnInterval = 600; // spawn every 10s
        
        // Enemy spawn level tracking for tiered spawning
        this.enemySpawnLevel = 0; // 0-based level (initial waves)
        this.enemyTiers = [
            ['WoollyBearEnemy', 'CricketEnemy'],                   // Level 0 – basic
            ['BeeEnemy'],                                  // Level 1 – after 10 ants
            ['GrasshopperEnemy'],                                       // Level 2 – 20 ants
            ['FrogEnemy'],                                          // Level 3 – 30 ants
            ['HerculesBeetleEnemy'],                               // Level 4 – 40 ants
            ['MantisEnemy'],                                          // Level 5 – 50 ants
        ];
        // Map enemy string names to classes for easy instantiation
        this.enemyClassMap = {
            CricketEnemy: IdleAnts.Entities.CricketEnemy,
            WoollyBearEnemy: IdleAnts.Entities.WoollyBearEnemy,
            GrasshopperEnemy: IdleAnts.Entities.GrasshopperEnemy,
            MantisEnemy: IdleAnts.Entities.MantisEnemy,
            BeeEnemy: IdleAnts.Entities.BeeEnemy,
            HerculesBeetleEnemy: IdleAnts.Entities.HerculesBeetleEnemy,
            FrogEnemy: IdleAnts.Entities.FrogEnemy
        };
    }
    
    setEffectManager(effectManager) {
        this.effectManager = effectManager;
    }
    
    setupEntities() {
        // Get map bounds from game
        if (IdleAnts.app && IdleAnts.app.mapConfig) {
            this.mapBounds.width = IdleAnts.app.mapConfig.width;
            this.mapBounds.height = IdleAnts.app.mapConfig.height;
        } else {
            // Fallback to screen size if mapConfig not available
            this.mapBounds.width = this.app.screen.width;
            this.mapBounds.height = this.app.screen.height;
        }
        
        // Create nest
        this.createNest();
        
        // Create queen ant (every player starts with one)
        this.createQueenAnt();
        
        // Create initial ants
        this.createAnt();
        
        // Create food sources
        this.createFood(20); // More food for a larger map
        
        // Create one of each enemy type at start
        this.spawnInitialEnemies();
        
        // Create initial larvae so the player sees one immediately
        this.createInitialLarvae();
    }
    
    createNest() {
        // Place nest at the center of the world map
        const nest = new IdleAnts.Entities.Nest(
            this.assetManager.getTexture('nest'),
            this.mapBounds.width / 2,
            this.mapBounds.height / 2
        );
        
        this.entitiesContainers.nest.addChild(nest);
        this.nest = nest;
        this.nestPosition = nest.getPosition();
    }
    
    createAnt() {
        // Create the ant with nestPosition as object reference
        const ant = new IdleAnts.Entities.Ant(
            this.assetManager.getTexture('ant'), 
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        
        // CRITICAL: Force position to be exactly at the nest
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        
        // Initialize capacity directly based on strength multiplier
        // strengthMultiplier now directly represents capacity
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.ants.addChild(ant);
        this.entities.ants.push(ant);
        
        // Add a spawning effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y);
        }
    }
    
    createFlyingAnt() {
        // Create the flying ant with nestPosition as object reference
        const flyingAnt = new IdleAnts.Entities.FlyingAnt(
            this.assetManager.getTexture('ant'),
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        
        // CRITICAL: Force position to be exactly at the nest
        flyingAnt.x = this.nestPosition.x;
        flyingAnt.y = this.nestPosition.y;
        
        // Initialize capacity directly based on strength multiplier
        // strengthMultiplier now directly represents capacity
        flyingAnt.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.flyingAnts.addChild(flyingAnt);
        this.entities.flyingAnts.push(flyingAnt);
        
        // Add a sparkly spawning effect for flying ants
        if (this.effectManager) {
            // Pass true as the isFlying parameter to create a special effect for flying ants
            this.effectManager.createSpawnEffect(flyingAnt.x, flyingAnt.y, true);
        }
    }
    
    createCarAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Car Ant. Nest may not have been initialized yet.");
            return null; // Return null or handle appropriately
        }
        const carAntTexture = this.assetManager.getTexture(IdleAnts.Assets.Ants.CAR_ANT.id);
        if (!carAntTexture) {
            console.error("EntityManager: Car Ant texture not found!");
            // Potentially use a fallback or skip creation
            return;
        }

        const carAnt = new IdleAnts.Entities.CarAnt(
            carAntTexture,
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier // Assuming car ants also benefit from global speed upgrades
        );

        carAnt.x = this.nestPosition.x;
        carAnt.y = this.nestPosition.y;
        
        // Car Ants could have a fixed high capacity or scale with strength.
        // For now, let them scale with strength like other ants.
        carAnt.capacity = this.resourceManager.stats.strengthMultiplier; 

        this.entitiesContainers.carAnts.addChild(carAnt);
        this.entities.carAnts.push(carAnt);

        if (this.effectManager) {
            // Using a generic spawn effect for now, could be customized for cars (e.g., tire screech, engine rev)
            this.effectManager.createSpawnEffect(carAnt.x, carAnt.y, false, { R: 255, G: 0, B: 0 }); // Red spawn effect
        }
        console.log("Car Ant created at:", carAnt.x, carAnt.y);
    }
    
    createFireAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Fire Ant.");
            return;
        }
        const fireAntTexture = this.assetManager.getTexture('ant'); // reuse regular ant texture
        const fireAnt = new IdleAnts.Entities.FireAnt(
            fireAntTexture,
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        fireAnt.x = this.nestPosition.x;
        fireAnt.y = this.nestPosition.y;

        this.entitiesContainers.fireAnts.addChild(fireAnt);
        this.entities.fireAnts.push(fireAnt);

        if (this.effectManager) {
            this.effectManager.createSpawnEffect(fireAnt.x, fireAnt.y, false, { R: 255, G: 69, B: 0 });
        }
    }
    
    createFood(count = 1) {
        for (let i = 0; i < count; i++) {
            // Create food at random positions across the map
            const position = {
                x: Math.random() * this.mapBounds.width,
                y: Math.random() * this.mapBounds.height
            };
            
            // Always use BASIC food type for random spawns
            let foodType;
            try {
                // Use the basic food type for random spawns
                foodType = IdleAnts.Data.FoodTypes.BASIC;
                
                // Verify that the food type has all required properties
                if (!foodType || !foodType.scale || typeof foodType.scale.min === 'undefined') {
                    console.warn("Invalid food type detected, falling back to basic food type");
                    foodType = IdleAnts.Data.FoodTypes.BASIC;
                }
            } catch (error) {
                console.error("Error getting food type:", error);
                foodType = IdleAnts.Data.FoodTypes.BASIC;
            }
            
            this.addFood(position, foodType);
        }
    }
    
    addFood(position, foodType) {
        // Ensure position is within map bounds
        const x = Math.max(20, Math.min(position.x, this.mapBounds.width - 20));
        const y = Math.max(20, Math.min(position.y, this.mapBounds.height - 20));
        
        // Ensure we have a valid food type with required properties
        const validFoodType = foodType && foodType.scale && typeof foodType.scale.min !== 'undefined' 
            ? foodType 
            : IdleAnts.Data.FoodTypes.BASIC;
        
        try {
            const food = new IdleAnts.Entities.Food(
                this.assetManager.getTexture('food'),
                { x, y, clickPlaced: position.clickPlaced || false },
                validFoodType
            );
            
            // Check if this food was placed by the player's click
            if (position.clickPlaced && this.effectManager) {
                this.effectManager.createFoodSpawnEffect(x, y, validFoodType.glowColor);
            }
            
            this.entitiesContainers.food.addChild(food);
            this.entities.foods.push(food);
        } catch (error) {
            console.error("Error creating food:", error);
        }
    }
    
    update() {
        // Increment frame counter
        this.frameCounter++;
        
        // Update nest
        if (this.nest) {
            this.nest.update();
        }
        
        // Update queen ant
        if (this.entities.queen) {
            this.entities.queen.update(this.nestPosition, this.entities.foods);
        }
        
        // Update larvae
        this.updateLarvae();
        
        // Update ants
        this.updateAnts();
        
        // Update flying ants
        this.updateFlyingAnts();
        
        // Update Car Ants
        this.updateCarAnts();
        
        // Update Fire Ants
        this.updateFireAnts();
        
        // Update food
        this.updateFood();
        
        // Handle food spawning
        this.handleFoodSpawning();
        
        // Handle autofeeder
        this.handleAutofeeder();
        
        // Update Enemies
        this.updateEnemies();
    }
    
    // New method to update larvae
    updateLarvae() {
        // Update each larvae and remove hatched ones
        for (let i = this.entities.larvae.length - 1; i >= 0; i--) {
            const larvae = this.entities.larvae[i];
            
            // Update the larvae and check if it's still active
            const isActive = larvae.update(this.app.ticker.deltaTime);
            
            // If the larvae is no longer active (hatched), remove it
            if (!isActive) {
                console.log(`EntityManager: Removing larvae at (${larvae.x}, ${larvae.y})`);
                this.entities.larvae.splice(i, 1);
            }
        }
    }
    
    // Method to detect and resolve clustering of ants at the nest
    resolveNestClustering() {
        // Only check every 30 frames to save performance (reduced frequency for better performance)
        if (this.frameCounter % 30 !== 0) return;
        
        const nestX = this.nestPosition.x;
        const nestY = this.nestPosition.y;
        const checkRadiusSq = 8 * 8; // Use squared radius for faster comparison
        const stuckThreshold = 3; // How many ants within radius is considered a cluster
        
        // First identify ants with food that need to deposit
        const antsWithFood = [];
        const antsWithoutFood = [];
        
        // Helper function to process both ant types
        const processAntType = (ants) => {
            for (const ant of ants) {
                const dx = ant.x - nestX;
                const dy = ant.y - nestY;
                const distSq = dx * dx + dy * dy; // Squared distance (faster than sqrt)
                
                if (distSq < checkRadiusSq) {
                    if (ant.foodCollected > 0) {
                        antsWithFood.push(ant);
                    } else {
                        antsWithoutFood.push(ant);
                    }
                }
            }
        };
        
        // Process both regular and flying ants
        processAntType(this.entities.ants);
        processAntType(this.entities.flyingAnts);
        
        // First priority: Give space to ants with food to deposit
        if (antsWithFood.length > 0) {
            // Prioritize ants with food - make ants without food move away
            for (const emptyAnt of antsWithoutFood) {
                // Move empty ants away from the nest to make room
                const angle = Math.random() * Math.PI * 2;
                const pushForce = emptyAnt.speed * 2; // Strong push
                emptyAnt.vx = Math.cos(angle) * pushForce;
                emptyAnt.vy = Math.sin(angle) * pushForce;
                
                // Offset position so they don't all gather at the same spot
                emptyAnt.x += Math.cos(angle) * 10;
                emptyAnt.y += Math.sin(angle) * 10;
            }
            
            // If too many ants with food are clustered, distribute them in a ring pattern
            if (antsWithFood.length >= stuckThreshold) {
                const nestRadius = 10; // Radius for forming a ring around nest
                const angleDelta = (2 * Math.PI) / antsWithFood.length;
                
                antsWithFood.forEach((ant, index) => {
                    // Place ants in a ring pattern around the nest
                    const angle = index * angleDelta;
                    const targetX = nestX + Math.cos(angle) * nestRadius;
                    const targetY = nestY + Math.sin(angle) * nestRadius;
                    
                    // Move ant to position on the ring
                    if (Math.random() < 0.5) { // Only adjust position 50% of the time
                        ant.x = targetX;
                        ant.y = targetY;
                        
                        // Adjust velocity to point toward nest for deposit
                        const dx = nestX - ant.x;
                        const dy = nestY - ant.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        ant.vx = (dx / dist) * ant.speed * 0.5;
                        ant.vy = (dy / dist) * ant.speed * 0.5;
                    }
                });
            }
        } else if (antsWithoutFood.length >= stuckThreshold * 2) {
            // If only ants without food are clustered, spread them out evenly
            // Use a wider spread pattern since they're leaving to look for food
            for (let i = 0; i < antsWithoutFood.length; i++) {
                const ant = antsWithoutFood[i];
                const angle = (i / antsWithoutFood.length) * Math.PI * 2;
                const pushForce = ant.speed * 1.5;
                
                ant.vx = Math.cos(angle) * pushForce;
                ant.vy = Math.sin(angle) * pushForce;
                
                // Offset position more dramatically
                ant.x += Math.cos(angle) * 12;
                ant.y += Math.sin(angle) * 12;
            }
        }
    }
    
    // Generic method to update any type of ant entities
    updateAntEntities(antEntities, shouldCreateTrail, isFlying = false) {
        // Only process enemy detection every 3 frames for performance
        const shouldCheckEnemies = this.frameCounter % 3 === 0;
        
        for (let i = 0; i < antEntities.length; i++) {
            const ant = antEntities[i];
            
            // Skip enemy detection if not needed this frame, unless ant is already targeting
            if (shouldCheckEnemies || ant.targetEnemy) {
                const perceptionSq = 250 * 250; // 250-px perception radius (squared)
                const engageDistSq = 20 * 20; // 20-px engage radius (squared)

                // Locate closest living enemy using squared distances
                let closestE = null,
                    closestESq = Infinity;
                for (const enemy of this.entities.enemies) {
                    if (enemy.isDead) continue;
                    const dx = enemy.x - ant.x,
                          dy = enemy.y - ant.y,
                          distSq = dx * dx + dy * dy;
                    if (distSq < closestESq) { closestESq = distSq; closestE = enemy; }
                }

                if (closestE && closestESq <= perceptionSq) {
                    ant.targetEnemy = closestE;

                    // Force ant into aggressive pursuit unless already in combat
                    if (ant.state !== IdleAnts.Entities.AntBase.States.FIGHTING) {
                        // Ensure we're in a movable state while chasing
                        if (ant.state !== IdleAnts.Entities.AntBase.States.SEEKING_FOOD) {
                            ant.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
                        }
                    }

                    if (closestESq > engageDistSq) {
                        // Move toward the enemy using squared distance comparison
                        const dist = Math.sqrt(closestESq); // Only calculate sqrt when needed
                        ant.vx = (closestE.x - ant.x) / dist * ant.speed;
                        ant.vy = (closestE.y - ant.y) / dist * ant.speed;
                    } else {
                        // Engage – freeze and switch to fighting if not already
                        ant.vx = ant.vy = 0;
                        if (ant.state !== IdleAnts.Entities.AntBase.States.FIGHTING) {
                            ant.transitionToState(IdleAnts.Entities.AntBase.States.FIGHTING);
                        }
                    }
                } else {
                    // No enemy in perception – clear any previous lock
                    ant.targetEnemy = null;
                }
            }
            
            // Update the ant with nest position and available foods
            const actionResult = ant.update(this.nestPosition, this.entities.foods);
            
            // Skip boundary checks for ants at the nest - allows ants to overlap at nest (optimized)
            const dx = ant.x - this.nestPosition.x;
            const dy = ant.y - this.nestPosition.y;
            const distToNestSq = dx * dx + dy * dy;
            
            const atNest = distToNestSq < 15 * 15; // Compare with squared distance
            
            // Only apply boundary handling if not at the nest
            if (!atNest) {
                ant.handleBoundaries(this.mapBounds.width, this.mapBounds.height);
            }
            
            // Create trail behind the ant if needed
            if (shouldCreateTrail && this.effectManager) {
                const trailChance = isFlying ? 0.3 : 1.0; // Flying ants leave fewer trails
                
                if (Math.random() < trailChance) {
                    if (isFlying) {
                        this.effectManager.createFlyingAntTrail(ant);
                    } else {
                        this.effectManager.createAntTrail(ant);
                    }
                }
            }
            
            // Check for food collection or delivery based on action result and state
            if (actionResult === true) {
                // Handle action based on ant's current state
                if (ant.state === IdleAnts.Entities.AntBase.States.COLLECTING_FOOD) {
                    // Ant has completed food collection
                    this.collectFood(ant);
                    
                    // Special effect for flying ants
                    if (isFlying && this.effectManager) {
                        this.effectManager.createFoodCollectEffect(ant.x, ant.y, 0xFFD700);
                    }
                    
                    // Log when food is collected
                    console.log(`Ant collected food: Capacity=${ant.capacity}, CurrentWeight=${ant.capacityWeight}`);
                    
                } else if (ant.state === IdleAnts.Entities.AntBase.States.DELIVERING_FOOD || 
                           ant.state === IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST) {
                    // Ant has returned to nest with food
                    this.deliverFood(ant);
                }
            }
            
            // Remove dead ants
            if(ant.isDead){
                // Update resource manager stats based on ant type
                if(this.resourceManager){
                    if(antEntities === this.entities.ants && typeof this.resourceManager.decreaseAntCount === 'function'){
                        this.resourceManager.decreaseAntCount();
                    } else if(antEntities === this.entities.flyingAnts){
                        this.resourceManager.stats.flyingAnts = Math.max(0, this.resourceManager.stats.flyingAnts - 1);
                    } else if(antEntities === this.entities.carAnts){
                        this.resourceManager.stats.carAnts = Math.max(0, this.resourceManager.stats.carAnts - 1);
                    } else if(antEntities === this.entities.fireAnts){
                        this.resourceManager.stats.fireAnts = Math.max(0, this.resourceManager.stats.fireAnts - 1);
                    }
                    // Recompute food per second since ant counts changed
                    this.resourceManager.updateFoodPerSecond();
                }
                // Remove from array and continue iteration
                antEntities.splice(i,1);
                i--;
                continue;
            }
        }
    }
    
    collectFood(ant) {
        // If the ant is still in the collecting state but hasn't finished the timer, just return
        if (ant.state === IdleAnts.Entities.AntBase.States.COLLECTING_FOOD && ant.collectionTimer < ant.collectionTarget.getCollectionTimeForAnt(ant)) {
            return;
        }
        
        console.log(`=== Ant collecting food, BEFORE: Capacity=${ant.capacity}, CurrentWeight=${ant.capacityWeight}, FoodCollected=${ant.foodCollected} ===`);
        
        // Get the target food
        if (!ant.collectionTarget) return;
        
        const foodItem = ant.collectionTarget;
        const isFlyingAnt = ant.constructor.name.includes('Flying');
        const isCookie = foodItem.foodType && foodItem.foodType.id === 'cookie';
        
        // Handle collection based on how many ants are collecting this food
        const collectingAntCount = foodItem.getCollectingAntCount();
        let foodValue = foodItem.foodType ? foodItem.foodType.value : 1;
        // Food weight is tracked but not used for capacity checks
        let foodWeight = 1; // Always count as 1 regardless of type
        
        console.log(`Food item: Type=${foodItem.foodType ? foodItem.foodType.id : 'unknown'}, Value=${foodValue}, Weight=${foodWeight}`);
        
        // Check if this is the last ant collecting or if the food should be completely consumed
        const shouldRemoveFood = collectingAntCount <= 1 || Math.random() < 0.95;
        
        if (shouldRemoveFood) {
            // This ant gets the full value of the food item
            
            // Create a particle effect
            if (this.effectManager) {
                // For cookies, create a special particle effect
                if (isCookie) {
                    // Use the existing createFoodCollectEffect with a gold color for cookies
                    const cookieColor = 0xFFD700; // Gold color for cookies
                    this.effectManager.createFoodCollectEffect(foodItem.x, foodItem.y, cookieColor, 1.5); // Larger effect for cookies
                    
                    // Add multiple particles for a more dramatic cookie effect
                    for (let i = 0; i < 5; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = 5 + Math.random() * 8;
                        const x = foodItem.x + Math.cos(angle) * distance;
                        const y = foodItem.y + Math.sin(angle) * distance;
                        this.effectManager.createFoodCollectEffect(x, y, cookieColor, 0.8);
                    }
                } else {
                    // For normal food, use the food type's glow color
                    const color = foodItem.foodType ? foodItem.foodType.glowColor : 0xFFFF99;
                    this.effectManager.createFoodCollectEffect(foodItem.x, foodItem.y, color);
                }
            }
            
            // Remove the food entity
            this.entitiesContainers.food.removeChild(foodItem);
            const foodIndex = this.entities.foods.indexOf(foodItem);
            if (foodIndex !== -1) {
                this.entities.foods.splice(foodIndex, 1);
            }
            
            // Add a new food source at a certain chance on harvest
            if (Math.random() < 0.8) {
                this.createFood();
            }
        } else {
            // Food is not being removed - this ant's share is determined proportionally
            // Get the ant's contribution percentage from the food item
            const valueDistribution = foodItem.distributeValue();
            
            // If this ant has a share, use a percentage of the total value
            if (valueDistribution[ant.id]) {
                foodValue = valueDistribution[ant.id];
            } else {
                // If somehow the ant isn't in the distribution, use a fallback value
                foodValue = Math.max(1, Math.floor(foodItem.foodType.value / collectingAntCount));
            }
            
            // Create a smaller particle effect for partial collection
            if (this.effectManager) {
                this.effectManager.createFoodCollectEffect(
                    ant.x, ant.y, 
                    foodItem.foodType.glowColor,
                    0.7  // Smaller effect for partial collection
                );
            }
        }
        
        // Call pickUpFood to update the ant's food state
        ant.pickUpFood(foodItem.foodType, foodValue);
        
        console.log(`=== Ant collecting food, AFTER: Capacity=${ant.capacity}, CurrentWeight=${ant.capacityWeight}, FoodCollected=${ant.foodCollected}, State=${ant.state} ===`);
    }
    
    deliverFood(ant) {
        // Drop food and add to resources based on ant's strength and food value
        const foodResult = ant.dropFood();
        const foodAmount = foodResult.totalValue * this.resourceManager.stats.foodMultiplier;
        
        // Add food to resources and track it for food rate calculation
        this.resourceManager.addFood(foodAmount);
        
        // For more responsive UI updates, also update the displayFood value directly
        // This makes the counter animation start from a value closer to the actual food amount
        this.resourceManager.resources.displayFood = this.resourceManager.resources.food;
        
        // Add food drop effect at nest
        if (this.effectManager) {
            // Use the last food type color for the effect, or default if none
            const effectColor = foodResult.lastFoodType ? foodResult.lastFoodType.glowColor : 0xFFFF99;
            this.effectManager.createFoodDropEffect(this.nestPosition.x, this.nestPosition.y, effectColor);
        }
        
        // Apply a random velocity to move away from nest and start searching for food
        const pushAngle = Math.random() * Math.PI * 2;
        const pushStrength = ant.speed * 0.8; // Strong enough push to leave nest area
        ant.vx = Math.cos(pushAngle) * pushStrength;
        ant.vy = Math.sin(pushAngle) * pushStrength;
        
        // Update the UI to reflect the new food amount
        if (IdleAnts.app && IdleAnts.app.uiManager) {
            IdleAnts.app.uiManager.updateUI();
        }
    }
    
    // Helper to find ants near a specific point or ant
    findNearbyAnts(targetAnt, radius) {
        const nearbyAnts = [];
        const checkAntType = (ants) => {
            for (const ant of ants) {
                if (ant !== targetAnt) { // Skip the target ant itself
                    const dx = ant.x - targetAnt.x;
                    const dy = ant.y - targetAnt.y;
                    const distSq = dx * dx + dy * dy;
                    
                    if (distSq < radius * radius) {
                        nearbyAnts.push(ant);
                    }
                }
            }
        };
        
        checkAntType(this.entities.ants);
        checkAntType(this.entities.flyingAnts);
        
        return nearbyAnts;
    }
    
    // Helper to gently spread apart crowded ants
    spreadAntsApart(ants) {
        if (ants.length <= 1) return;
        
        // Calculate center of the group
        let centerX = 0;
        let centerY = 0;
        
        for (const ant of ants) {
            centerX += ant.x;
            centerY += ant.y;
        }
        
        centerX /= ants.length;
        centerY /= ants.length;
        
        // Gently push ants away from center
        for (const ant of ants) {
            const dx = ant.x - centerX;
            const dy = ant.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 0.1) {
                // If ants are perfectly stacked, choose random directions
                const angle = Math.random() * Math.PI * 2;
                ant.vx += Math.cos(angle) * ant.speed * 0.3;
                ant.vy += Math.sin(angle) * ant.speed * 0.3;
            } else {
                // Push away from center
                const normalizedDx = dx / distance;
                const normalizedDy = dy / distance;
                
                ant.vx += normalizedDx * ant.speed * 0.3;
                ant.vy += normalizedDy * ant.speed * 0.3;
            }
        }
    }
    
    expandNest() {
        if (this.nest) {
            this.nest.expand();
        }
    }
    
    // Update all ants' speed when speed multiplier changes
    updateAntsSpeed() {
        const multiplier = this.resourceManager.stats.speedMultiplier;
        this.updateAntEntitiesSpeed(this.entities.ants, multiplier);
        this.updateAntEntitiesSpeed(this.entities.flyingAnts, multiplier);
        this.updateAntEntitiesSpeed(this.entities.carAnts, multiplier);
        this.updateAntEntitiesSpeed(this.entities.fireAnts, multiplier);
    }
    
    // Generic method to update speed for any ant type
    updateAntEntitiesSpeed(antEntities, multiplier) {
        antEntities.forEach(ant => {
            ant.updateSpeedMultiplier(multiplier);
        });
    }
    
    // Method to increase all ants' strength
    updateAntsCapacity() {
        this.updateAntEntitiesStrength(this.entities.ants);
        this.updateAntEntitiesStrength(this.entities.flyingAnts);
        this.updateAntEntitiesStrength(this.entities.carAnts);
        this.updateAntEntitiesStrength(this.entities.fireAnts);
    }
    
    updateAntEntitiesStrength(antEntities) {
        const currentStrength = this.resourceManager.stats.strengthMultiplier;
        for (let i = 0; i < antEntities.length; i++) {
            // Set the capacity directly to the strength value
            antEntities[i].capacity = currentStrength;
            
            // Ensure the canStackFood config is updated based on capacity
            antEntities[i].config.canStackFood = antEntities[i].capacity > 1;
            
            // Log capacity and canStackFood status
            console.log(`Updating ant strength: capacity=${antEntities[i].capacity}, canStackFood=${antEntities[i].config.canStackFood}`);
            
            // If the ant is already carrying food but not at full capacity with the new strength,
            // allow it to collect more food
            if (antEntities[i].foodCollected > 0 && antEntities[i].capacityWeight < currentStrength) {
                antEntities[i].isAtFullCapacity = false;
            }
        }
    }
    
    activateAutofeeder() {
        // Get the current food type based on the food tier
        const foodType = this.resourceManager.getCurrentFoodType();
        
        // Get the amount of food to sprinkle based on autofeeder level
        const foodAmount = this.resourceManager.getAutofeederFoodAmount();
        
        // Calculate a random position near the nest
        const nestRadius = 300; // Distance from nest to sprinkle food
        const randomAngle = Math.random() * Math.PI * 2; // Random angle around the nest
        
        // Calculate the center position for the food cluster
        const centerX = this.nestPosition.x + Math.cos(randomAngle) * nestRadius;
        const centerY = this.nestPosition.y + Math.sin(randomAngle) * nestRadius;
        
        // Sprinkle food in a cluster around the center position
        for (let i = 0; i < foodAmount; i++) {
            // Random offset from the center position (within a small radius)
            const offsetRadius = Math.random() * 100; // 100px radius for the food cluster
            const offsetAngle = Math.random() * Math.PI * 2;
            
            const foodX = centerX + Math.cos(offsetAngle) * offsetRadius;
            const foodY = centerY + Math.sin(offsetAngle) * offsetRadius;
            
            // Add the food with the current food type
            this.addFood({
                x: foodX,
                y: foodY,
                clickPlaced: true // Treat as click-placed to show spawn effect
            }, foodType);
        }
    }
    
    // New method to update the queen ant
    updateQueenAnt() {
        const queen = this.entities.queen;
        if (!queen) return;
        
        // Update queen with nest position and foods
        queen.update(this.nestPosition, this.entities.foods);
        
        // Handle boundaries
        queen.handleBoundaries(this.mapBounds.width, this.mapBounds.height);
    }
    
    // New method to create a queen ant
    createQueenAnt() {
        // Check if queen already exists
        if (this.entities.queen) {
            console.warn('Queen ant already exists');
            return;
        }
        
        // Create the queen ant with the queen ant texture
        const queen = new IdleAnts.Entities.QueenAnt(
            this.assetManager.getTexture('queenAnt'), // Use queen ant texture
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        
        // CRITICAL: Force position to be exactly at the nest
        queen.x = this.nestPosition.x;
        queen.y = this.nestPosition.y;
        
        // Add to container and store reference
        this.entitiesContainers.queen.addChild(queen);
        this.entities.queen = queen;
        
        // Create spawn effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(queen.x, queen.y);
        }
        
        // Update resource manager stats
        this.resourceManager.stats.hasQueen = true;
        
        return queen;
    }
    
    // New method to create an ant from larvae (without cost)
    createAntFromLarvae(x, y) {
        // Check if we can add more ants
        if (this.entities.ants.length >= this.resourceManager.stats.maxAnts) {
            console.log(`Cannot create more ants, colony at capacity (${this.entities.ants.length}/${this.resourceManager.stats.maxAnts})`);
            return;
        }
        
        console.log(`Creating ant from larvae. Colony size: ${this.entities.ants.length}/${this.resourceManager.stats.maxAnts}`);
        
        // Create the ant
        const ant = new IdleAnts.Entities.Ant(
            this.assetManager.getTexture('ant'),
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        
        // Use the larvae position if provided, otherwise use nest position
        if (x !== undefined && y !== undefined) {
            ant.x = x;
            ant.y = y;
            console.log(`Creating ant from larvae at position (${x}, ${y})`);
        } else {
            ant.x = this.nestPosition.x;
            ant.y = this.nestPosition.y;
            console.log('Creating ant from larvae at nest position');
        }
        
        // Add to container and array
        this.entitiesContainers.ants.addChild(ant);
        this.entities.ants.push(ant);
        
        // Create spawn effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y);
        }
        
        // Update resource manager stats
        this.resourceManager.increaseAntCount();
        
        // Decrement larvae count on queen
        if (this.entities.queen) {
            this.entities.queen.currentLarvae--;
            console.log(`Queen now has ${this.entities.queen.currentLarvae} larvae after ant creation`);
        }
        
        return ant;
    }
    
    // New method to create larvae
    createLarvae(x, y) {
        // Create a new larvae entity
        const larvae = new IdleAnts.Entities.Larvae(x, y);
        
        // Add to the larvae array
        this.entities.larvae.push(larvae);
        
        return larvae;
    }
    
    // Modified method to handle larvae production from queen
    produceLarvae(x, y) {
        // Create a larvae production effect for visual feedback
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(x, y);
        }
        
        // Create the actual larvae entity that will hatch after ~30 seconds
        this.createLarvae(x, y);
    }
    
    // Method to handle queen ant producing larvae
    produceQueenLarvae(capacity) {
        // Check if we have a queen
        if (!this.entities.queen) {
            console.log('No queen ant found to produce larvae');
            return;
        }
        
        // Get the queen's position
        const queenX = this.entities.queen.x;
        const queenY = this.entities.queen.y;
        
        // Create larvae effect around the queen
        if (this.effectManager) {
            this.effectManager.createLarvaeEffect(queenX, queenY);
        }
        
        // Determine larvae to produce – one per allowed capacity that is free
        const availableSlots = capacity - this.entities.queen.currentLarvae;
        if (availableSlots <= 0) return;
        const larvaeCount = 1; // always produce a single egg per cycle
        
        // Create larvae entity around the queen
        for (let i = 0; i < larvaeCount; i++) {
            // Calculate a random position near the queen
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 30; // 20-50 pixels from queen
            const larvaeX = queenX + Math.cos(angle) * distance;
            const larvaeY = queenY + Math.sin(angle) * distance;
            
            // Create the larvae
            this.produceLarvae(larvaeX, larvaeY);
        }
        
        // Update the queen's larvae count
        if (this.entities.queen) {
            this.entities.queen.currentLarvae += larvaeCount;
        }
    }
    
    // Method to update ants
    updateAnts() {
        // Update frame counter for trails
        const shouldCreateTrail = this.frameCounter % this.trailInterval === 0;
        
        // Check for and resolve any ant clustering at the nest
        this.resolveNestClustering();
        
        // Update each ant
        this.updateAntEntities(this.entities.ants, shouldCreateTrail);
    }
    
    // Method to update flying ants
    updateFlyingAnts() {
        // Update frame counter for trails
        const shouldCreateTrail = this.frameCounter % this.trailInterval === 0;
        
        // Update each flying ant
        this.updateAntEntities(this.entities.flyingAnts, shouldCreateTrail, true);
    }
    
    // New method to update Car Ants
    updateCarAnts() {
        // For CarAnts, trail might be different (e.g. tire tracks) or disabled.
        // Let's disable default ant trail for now.
        this.updateAntEntities(this.entities.carAnts, false, false); // No trail, not strictly flying for pathing
    }
    
    // Update Fire Ants
    updateFireAnts() {
        const shouldCreateTrail = this.frameCounter % this.trailInterval === 0;
        this.updateAntEntities(this.entities.fireAnts, shouldCreateTrail, false);
    }
    
    // Method to update food
    updateFood() {
        // Update food items
        this.entities.foods.forEach(food => {
            if (typeof food.update === 'function') {
                food.update();
            }
        });
    }
    
    // Method to handle food spawning
    handleFoodSpawning() {
        // Spawn food periodically
        this.foodSpawnCounter++;
        if (this.foodSpawnCounter >= this.foodSpawnInterval) {
            this.foodSpawnCounter = 0;
            
            // Spawn 1-3 food items at random
            const foodCount = 1 + Math.floor(Math.random() * 3);
            this.createFood(foodCount);
        }
    }
    
    // Method to handle autofeeder
    handleAutofeeder() {
        // Handle autofeeder if unlocked
        if (this.resourceManager.stats.autofeederUnlocked && this.resourceManager.stats.autofeederLevel > 0) {
            this.autofeederCounter++;
            
            // Activate autofeeder when counter reaches interval
            if (this.autofeederCounter >= this.resourceManager.stats.autofeederInterval) {
                this.activateAutofeeder();
                this.autofeederCounter = 0;
            }
        }
    }
    
    createEnemy(count = 1){
        const unlockedTypes = this.enemyTiers.slice(0, this.enemySpawnLevel + 1).flat();
        if(unlockedTypes.length === 0) return;

        for(let i = 0; i < count; i++){
            const tex = this.assetManager.getTexture('ant'); // placeholder texture
            // Randomly pick an unlocked enemy type
            const typeName = unlockedTypes[Math.floor(Math.random() * unlockedTypes.length)];
            const EnemyClass = this.enemyClassMap[typeName];
            if(!EnemyClass){ continue; }
            const enemy = new EnemyClass(tex, {width: this.mapBounds.width, height: this.mapBounds.height});
            this.entitiesContainers.enemies.addChild(enemy);
            this.entities.enemies.push(enemy);
        }
    }
    
    updateEnemies(){
        // Calculate total ants in colony
        const antTotal = this.entities.ants.length + this.entities.flyingAnts.length + this.entities.carAnts.length + this.entities.fireAnts.length;

        // ---------- NEW: Update spawn level based on colony size ----------
        const maxLevel = this.enemyTiers.length - 1;
        const newLevel = Math.min(Math.floor(antTotal / 10), maxLevel);
        if(newLevel > this.enemySpawnLevel){
            this.enemySpawnLevel = newLevel;
            // Notify player about new enemy tier
            if(typeof IdleAnts.notify === 'function'){
                const lvl = newLevel; // 1-based for players
                IdleAnts.notify(`Level ${lvl} unlocked! New creatures are appearing…`, 'warning');
            }
        }
        // ------------------------------------------------------------------

        // Update existing enemies
        const ants=[...this.entities.ants,...this.entities.flyingAnts,...this.entities.carAnts,...this.entities.fireAnts];
        for(let i=this.entities.enemies.length-1;i>=0;i--){
            const e=this.entities.enemies[i];
            if(e.isDead){this.entities.enemies.splice(i,1);continue;}
            if(e instanceof IdleAnts.Entities.WoollyBearEnemy){
                e.update(this.nestPosition,[],ants);
            } else {
                e.update(ants);
            }
        }
        // Dynamic enemy spawning based on colony size
        const baseInterval = 900; // 15s default for 0-10 ants
        const scaledInterval = Math.max(300, Math.floor(baseInterval / (1 + antTotal/10)));

        this.enemySpawnCounter++;
        if(this.enemySpawnCounter >= scaledInterval){
            const batch = 1 + Math.floor(antTotal / 20);
            this.createEnemy(batch);
            this.enemySpawnCounter = 0;
        }
    }

    // Spawn one of each enemy type for early variety
    spawnInitialEnemies(){
        // Spawn only initial tier enemies (woolly bear & cricket)
        const initialTypes = this.enemyTiers[0];
        const tex = this.assetManager.getTexture('ant');
        const bounds = {width:this.mapBounds.width,height:this.mapBounds.height};
        initialTypes.forEach(typeName => {
            const EnemyClass = this.enemyClassMap[typeName];
            if(!EnemyClass) return;
            const e = new EnemyClass(tex, bounds);
            this.entitiesContainers.enemies.addChild(e);
            this.entities.enemies.push(e);
        });
    }

    createInitialLarvae() {
        // Create a larvae near the nest position for immediate visual feedback
        if (this.nestPosition) {
            // Position the larvae slightly offset from the nest
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 20; // 30-50 pixels from nest
            const larvaeX = this.nestPosition.x + Math.cos(angle) * distance;
            const larvaeY = this.nestPosition.y + Math.sin(angle) * distance;
            
            // Create the larvae
            this.createLarvae(larvaeX, larvaeY);
            
            console.log(`Created initial larvae at (${larvaeX}, ${larvaeY}) near nest`);
        }
    }
} 

// ===== src/managers/AudioManager.js =====
IdleAnts.AudioManager = (function() {
    // Private audio context and sounds storage
    let audioContext = null;
    let sounds = {};
    let bgmTrack = null;
    let isMuted = false;
    let loadedSounds = 0;
    let totalSounds = 0;
    
    // Initialize audio context
    function init() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            
            // Load all audio assets from HTML elements
            loadAudioAssets();
            
            console.log('Audio Manager initialized');
            return true;
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
            return false;
        }
    }
    
    // Get audio element from HTML by ID
    function getAudioElement(id) {
        return document.getElementById(id);
    }
    
    // Load all audio assets from HTML elements
    function loadAudioAssets() {
        try {
            // Count total sounds to load
            totalSounds = 0;
            
            // Load BGM tracks from HTML elements
            if (IdleAnts.AudioAssets && IdleAnts.AudioAssets.BGM) {
                for (const key in IdleAnts.AudioAssets.BGM) {
                    const asset = IdleAnts.AudioAssets.BGM[key];
                    totalSounds++;
                    
                    // Get the audio element from HTML
                    const audioElement = getAudioElement(asset.id);
                    
                    if (audioElement) {
                        sounds[asset.id] = {
                            id: asset.id,
                            isMusic: true,
                            audio: audioElement,
                            volume: asset.volume || 0.5,
                            loop: true
                        };
                        
                        // Set volume and loop properties
                        audioElement.loop = true;
                        audioElement.volume = asset.volume || 0.5;
                        
                        console.log(`Audio loaded from HTML: ${asset.id}`);
                        loadedSounds++;
                    } else {
                        console.warn(`Audio element with ID ${asset.id} not found in HTML`);
                    }
                }
            }
            
            // Load SFX from HTML elements
            if (IdleAnts.AudioAssets && IdleAnts.AudioAssets.SFX) {
                for (const key in IdleAnts.AudioAssets.SFX) {
                    const asset = IdleAnts.AudioAssets.SFX[key];
                    totalSounds++;
                    
                    // Get the audio element from HTML
                    const audioElement = getAudioElement(asset.id);
                    
                    if (audioElement) {
                        sounds[asset.id] = {
                            id: asset.id,
                            isMusic: false,
                            audio: audioElement,
                            volume: asset.volume || 0.3,
                            loop: false
                        };
                        
                        // Set volume
                        audioElement.volume = asset.volume || 0.3;
                        
                        console.log(`Audio loaded from HTML: ${asset.id}`);
                        loadedSounds++;
                    } else {
                        console.warn(`Audio element with ID ${asset.id} not found in HTML`);
                    }
                }
            }
            
            console.log(`Loaded ${loadedSounds}/${totalSounds} audio files from HTML`);
        } catch (error) {
            console.error('Error loading audio assets:', error);
        }
    }
    
    // Play a sound effect once
    function playSFX(id) {
        if (isMuted || !sounds[id]) return;
        
        try {
            const sound = sounds[id];
            if (sound.isMusic) return; // Don't play BGM with this method
            
            // Stop and reset the sound if it's already playing
            sound.audio.pause();
            sound.audio.currentTime = 0;
            
            // Set volume
            sound.audio.volume = sound.volume;
            
            // Play the sound
            sound.audio.play().catch(e => {
                console.warn(`Failed to play sound ${id}:`, e);
                // This usually happens due to browser policy requiring user interaction
                // before audio can play. We'll ignore this error.
            });
        } catch (error) {
            console.error(`Error playing sound ${id}:`, error);
        }
    }
    
    // Play background music with looping
    function playBGM(id) {
        if (!sounds[id]) return;
        
        try {
            // Stop current BGM if playing
            stopBGM();
            
            const sound = sounds[id];
            if (!sound.isMusic) return; // Don't play SFX with this method
            
            bgmTrack = id;
            
            // Set loop and volume
            sound.audio.loop = true;
            sound.audio.volume = isMuted ? 0 : sound.volume;
            
            // Play the BGM
            sound.audio.play().catch(e => {
                console.warn(`Failed to play BGM ${id}:`, e);
                // This usually happens due to browser policy requiring user interaction
                // before audio can play. We'll handle this with a resumeAudioContext function
            });
        } catch (error) {
            console.error(`Error playing BGM ${id}:`, error);
        }
    }
    
    // Stop the currently playing background music
    function stopBGM() {
        if (bgmTrack && sounds[bgmTrack]) {
            try {
                sounds[bgmTrack].audio.pause();
                sounds[bgmTrack].audio.currentTime = 0;
            } catch (error) {
                console.error(`Error stopping BGM:`, error);
            }
            bgmTrack = null;
        }
    }
    
    // Toggle mute state for all audio
    function toggleMute() {
        isMuted = !isMuted;
        
        // Update all current sounds
        for (const id in sounds) {
            try {
                sounds[id].audio.volume = isMuted ? 0 : sounds[id].volume;
            } catch (error) {
                console.error(`Error toggling mute for ${id}:`, error);
            }
        }
        
        return isMuted;
    }
    
    // Set volume for a specific sound
    function setVolume(id, volume) {
        if (sounds[id]) {
            try {
                sounds[id].volume = volume;
                sounds[id].audio.volume = isMuted ? 0 : volume;
            } catch (error) {
                console.error(`Error setting volume for ${id}:`, error);
            }
        }
    }
    
    // Resume audio context (needed for browsers that suspend it until user interaction)
    function resumeAudioContext() {
        try {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            // Also try to play BGM if it was set but not playing
            if (bgmTrack && sounds[bgmTrack]) {
                sounds[bgmTrack].audio.play().catch(() => {
                    // Ignore errors - this will be resolved when user interacts
                });
            }
        } catch (error) {
            console.error('Error resuming audio context:', error);
        }
    }
    
    // Public API
    return {
        init: init,
        playSFX: playSFX,
        playBGM: playBGM,
        stopBGM: stopBGM,
        toggleMute: toggleMute,
        setVolume: setVolume,
        resumeAudioContext: resumeAudioContext
    };
})(); 

// ===== src/managers/UIManager.js =====
// src/managers/UIManager.js
IdleAnts.Managers.UIManager = class {
    constructor(resourceManager, game, effectManager) {
        this.resourceManager = resourceManager;
        this.game = game;
        this.effectManager = effectManager;
        
        // Cache DOM elements to avoid repeated getElementById calls
        this.cacheElements();
        
        // Set up UI button click events
        this.setupEventListeners();
        
        // Initialize UI state
        this.isUICollapsed = false;
        
        // Track previous food amount to detect food collection
        this.previousFoodAmount = 0;
        
        // Show debug indicator if in debug mode
        this.updateDebugIndicator();
    }
    
    cacheElements() {
        // Cache frequently accessed elements
        this.elements = {
            foodCount: document.getElementById('food-count'),
            antCount: document.getElementById('ant-count'),
            antMax: document.getElementById('ant-max'),
            flyingAntCount: document.getElementById('flying-ant-count'),
            flyingAntMax: document.getElementById('flying-ant-max'),
            carAntCount: document.getElementById('car-ant-count'),
            carAntMax: document.getElementById('car-ant-max'),
            carAntResourceCount: document.getElementById('car-ant-resource-count'),
            carAntResourceMax: document.getElementById('car-ant-resource-max'),
            fireAntCount: document.getElementById('fire-ant-count'),
            fireAntMax: document.getElementById('fire-ant-max'),
            fireAntResourceCount: document.getElementById('fire-ant-resource-count'),
            fireAntResourceMax: document.getElementById('fire-ant-resource-max'),
            foodPerSecondActual: document.getElementById('food-per-second-actual'),
            foodType: document.getElementById('food-type'),
            // Costs
            antCost: document.getElementById('ant-cost'),
            foodUpgradeCost: document.getElementById('food-upgrade-cost'),
            speedUpgradeCost: document.getElementById('speed-upgrade-cost'),
            strengthUpgradeCost: document.getElementById('strength-upgrade-cost'),
            expandCost: document.getElementById('expand-cost'),
            flyingAntUnlockCost: document.getElementById('flying-ant-unlock-cost'),
            flyingAntCost: document.getElementById('flying-ant-cost'),
            expandFlyingCost: document.getElementById('expand-flying-cost'),
            carAntUnlockCost: document.getElementById('car-ant-unlock-cost'),
            carAntCost: document.getElementById('car-ant-cost'),
            expandCarAntCost: document.getElementById('expand-car-ant-cost'),
            fireAntUnlockCost: document.getElementById('fire-ant-unlock-cost'),
            fireAntCost: document.getElementById('fire-ant-cost'),
            expandFireAntCost: document.getElementById('expand-fire-ant-cost'),
            autofeederCost: document.getElementById('autofeeder-cost'),
            autofeederUpgradeCost: document.getElementById('autofeeder-upgrade-cost'),
            autofeederLevel: document.getElementById('autofeeder-level'),
            upgradeQueenCost: document.getElementById('upgrade-queen-cost'),
            queenLevel: document.getElementById('queen-level'),
            queenLarvaeCapacity: document.getElementById('queen-larvae-capacity'),
            queenLarvaeRate: document.getElementById('queen-larvae-rate')
        };
    }
    
    setupEventListeners() {
        // Add null checks to all event listeners
        const addSafeClickListener = (id, callback) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', callback);
            } else {
                console.warn(`UIManager: Element with id '${id}' not found for event listener`);
            }
        };
        
        // UI toggle button
        addSafeClickListener('ui-toggle', () => this.toggleUI());
        
        // Main buttons
        addSafeClickListener('buy-ant', () => this.game.buyAnt());
        addSafeClickListener('upgrade-food', () => this.game.upgradeFood());
        addSafeClickListener('upgrade-speed', () => this.game.upgradeSpeed());
        addSafeClickListener('upgrade-strength', () => this.game.upgradeStrength());
        addSafeClickListener('expand-colony', () => this.game.expandColony());
        
        // Flying ant buttons
        addSafeClickListener('unlock-flying-ants', () => this.game.unlockFlyingAnts());
        addSafeClickListener('buy-flying-ant', () => this.game.buyFlyingAnt());
        addSafeClickListener('expand-flying-ants', () => this.game.expandFlyingAntCapacity());
        
        // Queen ant buttons
        addSafeClickListener('unlock-queen', () => this.game.unlockQueen());
        addSafeClickListener('buy-queen', () => this.game.buyQueen());
        addSafeClickListener('upgrade-queen', () => this.game.upgradeQueen());
        
        // Autofeeder buttons
        addSafeClickListener('unlock-autofeeder', () => this.game.unlockAutofeeder());
        addSafeClickListener('upgrade-autofeeder', () => this.game.upgradeAutofeeder());

        // Car Ant buttons
        addSafeClickListener('unlock-car-ants', () => this.game.unlockCarAnts());
        addSafeClickListener('buy-car-ant', () => this.game.buyCarAnt());
        addSafeClickListener('expand-car-ants', () => this.game.expandCarAntCapacity());
        
        // Fire Ant buttons
        addSafeClickListener('unlock-fire-ants', () => this.game.unlockFireAnts());
        addSafeClickListener('buy-fire-ant', () => this.game.buyFireAnt());
        addSafeClickListener('expand-fire-ants', () => this.game.expandFireAntCapacity());
    }
    
    // Add UI toggle functionality
    toggleUI() {
        const gameContainer = document.getElementById('game-container');
        const toggleButton = document.getElementById('ui-toggle');
        
        if (gameContainer && toggleButton) {
            this.isUICollapsed = !this.isUICollapsed;
            
            if (this.isUICollapsed) {
                gameContainer.classList.add('ui-collapsed');
                toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
                toggleButton.title = "Expand UI";
                
                // For mobile: adjust canvas size when UI is collapsed
                if (this.game && this.game.isMobileDevice) {
                    // Force a resize event to adjust the canvas size
                    window.dispatchEvent(new Event('resize'));
                }
            } else {
                gameContainer.classList.remove('ui-collapsed');
                toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
                toggleButton.title = "Collapse UI";
                
                // For mobile: adjust canvas size when UI is expanded
                if (this.game && this.game.isMobileDevice) {
                    // Force a resize event to adjust the canvas size
                    window.dispatchEvent(new Event('resize'));
                }
            }
        }
    }
    
    updateDebugIndicator() {
        const debugIndicator = document.getElementById('debug-indicator');
        const debugConsole = document.getElementById('debug-console');
        
        if (debugIndicator) {
            debugIndicator.style.display = IdleAnts.Config.debug ? 'block' : 'none';
        }
        
        if (debugConsole) {
            debugConsole.style.display = IdleAnts.Config.debug ? 'block' : 'none';
        }
        
        // Update debug information if debug mode is enabled
        if (IdleAnts.Config.debug) {
            this.updateDebugInfo();
        }
    }
    
    updateDebugInfo() {
        const debugContent = document.getElementById('debug-content');
        if (!debugContent) return;
        
        // Gather debug information
        const debugInfo = {
            'Food': Math.floor(this.resourceManager.resources.food),
            'Ants': `${this.resourceManager.stats.ants}/${this.resourceManager.stats.maxAnts}`,
            'Flying Ants': `${this.resourceManager.stats.flyingAnts}/${this.resourceManager.stats.maxFlyingAnts}`,
            'Food/Sec': this.resourceManager.stats.foodPerSecond.toFixed(2),
            'Food Multiplier': this.resourceManager.stats.foodMultiplier.toFixed(2),
            'Speed Multiplier': this.resourceManager.stats.speedMultiplier.toFixed(2),
            'Strength Multiplier': this.resourceManager.stats.strengthMultiplier.toFixed(2),
            'Food Tier': this.resourceManager.stats.foodTier
        };
        
        // Format debug information as HTML
        let html = '';
        for (const [key, value] of Object.entries(debugInfo)) {
            html += `<div><span style="color: #aaa;">${key}:</span> ${value}</div>`;
        }
        
        debugContent.innerHTML = html;
    }
    
    updateUI() {
        // Helper function to safely update cached element text content
        const updateCachedElementText = (element, value) => {
            if (element) {
                element.textContent = value;
            }
        };
        
        try {
            // Update food counter directly for immediate feedback
            if (this.elements.foodCount) {
                this.elements.foodCount.textContent = Math.floor(this.resourceManager.resources.food);
                // Also update the display food value to match the actual food value
                this.resourceManager.resources.displayFood = this.resourceManager.resources.food;
            }
            
            // Update ant counts using cached elements
            updateCachedElementText(this.elements.antCount, this.resourceManager.stats.ants);
            updateCachedElementText(this.elements.antMax, this.resourceManager.stats.maxAnts);
            updateCachedElementText(this.elements.flyingAntCount, this.resourceManager.stats.flyingAnts);
            updateCachedElementText(this.elements.flyingAntMax, this.resourceManager.stats.maxFlyingAnts);
            
            // Update Car Ant counts using cached elements
            updateCachedElementText(this.elements.carAntCount, this.resourceManager.stats.carAnts);
            updateCachedElementText(this.elements.carAntMax, this.resourceManager.stats.maxCarAnts);
            updateCachedElementText(this.elements.carAntResourceCount, this.resourceManager.stats.carAnts);
            updateCachedElementText(this.elements.carAntResourceMax, this.resourceManager.stats.maxCarAnts);
            
            // Update costs using cached elements
            updateCachedElementText(this.elements.antCost, this.resourceManager.stats.antCost);
            updateCachedElementText(this.elements.foodUpgradeCost, this.resourceManager.stats.foodUpgradeCost);
            updateCachedElementText(this.elements.speedUpgradeCost, this.resourceManager.stats.speedUpgradeCost);
            updateCachedElementText(this.elements.strengthUpgradeCost, this.resourceManager.stats.strengthUpgradeCost);
            updateCachedElementText(this.elements.expandCost, this.resourceManager.stats.expandCost);
            updateCachedElementText(this.elements.flyingAntUnlockCost, this.resourceManager.stats.flyingAntUnlockCost);
            updateCachedElementText(this.elements.flyingAntCost, this.resourceManager.stats.flyingAntCost);
            updateCachedElementText(this.elements.expandFlyingCost, Math.floor(this.resourceManager.stats.expandCost * 1.5));

            // Update Car Ant costs using cached elements
            updateCachedElementText(this.elements.carAntUnlockCost, this.resourceManager.stats.carAntUnlockCost);
            updateCachedElementText(this.elements.carAntCost, this.resourceManager.stats.carAntCost);
            // Assuming expand car ant cost is dynamic or needs a specific stat in ResourceManager
            // For now, let's use a placeholder or make it dependent on carAntCost like flying ants if similar logic applies
            const expandCarAntCapacityCost = this.resourceManager.stats.maxCarAnts > 0 ? this.resourceManager.stats.carAntCost * (this.resourceManager.stats.maxCarAnts + 1) * 0.5 : 5000;
            updateCachedElementText(this.elements.expandCarAntCost, Math.floor(expandCarAntCapacityCost));
            
            // Update autofeeder UI elements using cached elements
            updateCachedElementText(this.elements.autofeederCost, this.resourceManager.stats.autofeederCost);
            updateCachedElementText(this.elements.autofeederUpgradeCost, this.resourceManager.stats.autofeederUpgradeCost);
            updateCachedElementText(this.elements.autofeederLevel, this.resourceManager.stats.autofeederLevel);
            
            // Update actual food collection rate using cached elements
            const actualRate = this.resourceManager.getActualFoodRate();
            updateCachedElementText(this.elements.foodPerSecondActual, actualRate.toFixed(1));
            
            // Update food type using cached elements
            const currentFoodType = this.resourceManager.getCurrentFoodType();
            updateCachedElementText(this.elements.foodType, currentFoodType.name);

            // Update Fire Ant counts using cached elements
            updateCachedElementText(this.elements.fireAntCount, this.resourceManager.stats.fireAnts);
            updateCachedElementText(this.elements.fireAntMax, this.resourceManager.stats.maxFireAnts);
            updateCachedElementText(this.elements.fireAntResourceCount, this.resourceManager.stats.fireAnts);
            updateCachedElementText(this.elements.fireAntResourceMax, this.resourceManager.stats.maxFireAnts);
            
            // Update Fire Ant costs using cached elements
            updateCachedElementText(this.elements.fireAntUnlockCost, this.resourceManager.stats.fireAntUnlockCost);
            updateCachedElementText(this.elements.fireAntCost, this.resourceManager.stats.fireAntCost);
            const expandFireAntCapacityCost = this.resourceManager.stats.maxFireAnts > 0 ? this.resourceManager.stats.fireAntCost * (this.resourceManager.stats.maxFireAnts + 1) * 0.5 : 10000;
            updateCachedElementText(this.elements.expandFireAntCost, Math.floor(expandFireAntCapacityCost));
        } catch (error) {
            console.error('Error updating UI resources:', error);
        }
        
        // Update previous food amount without playing any sound
        this.previousFoodAmount = this.resourceManager.getFood();
        
        // Show/hide debug indicator
        this.updateDebugIndicator();
        
        // Update button states
        this.updateButtonStates();
        
        // Update additional UI elements
        try {
            // Update the upgrade food button text based on current food tier
            const upgradeButton = document.getElementById('upgrade-food');
            
            if (upgradeButton) {
                if (!this.resourceManager.canUpgradeFoodTier()) {
                    // At max tier, update button text to show that it's maxed out
                    upgradeButton.innerHTML = `<i class="fas fa-arrow-up"></i> Food (Max)`;
                } else {
                    // Show the cost to upgrade to the next tier
                    upgradeButton.innerHTML = `<i class="fas fa-arrow-up"></i> Food (<span id="food-upgrade-cost">${this.resourceManager.stats.foodUpgradeCost}</span>)`;
                }
            }
            
            // Update the strength button tooltip with current bonus
            const strengthButton = document.getElementById('upgrade-strength');
            if (strengthButton) {
                const strengthValue = this.resourceManager.stats.strengthMultiplier;
                const collectionSpeedBonus = Math.min(75, Math.round((strengthValue - 1) * 25));
                strengthButton.title = `Increases ant strength to carry more food items and reduces collection time for heavy food. Current strength: ${strengthValue}, speed bonus: -${collectionSpeedBonus}% collection time`;
            }
            
            // Update queen ant UI
            const queenStats = document.getElementById('queen-stats');
            const upgradeQueenButton = document.getElementById('upgrade-queen');
            
            if (queenStats && upgradeQueenButton) {
                // Always show queen stats and upgrade button
                queenStats.style.display = 'block';
                upgradeQueenButton.style.display = 'block';
                
                // Update queen stats using cached elements
                updateCachedElementText(this.elements.upgradeQueenCost, this.resourceManager.stats.queenUpgradeCost);
                updateCachedElementText(this.elements.queenLevel, this.resourceManager.stats.queenUpgradeLevel);
                
                // Keep the UI elements but don't update them based on upgrades
                // These will be replaced with HP in a future update
                const queenLevel = this.resourceManager.stats.queenUpgradeLevel;
                const larvaePerSpawn = 1 + queenLevel;
                updateCachedElementText(this.elements.queenLarvaeCapacity, `${larvaePerSpawn} per spawn`);
                updateCachedElementText(this.elements.queenLarvaeRate, '15-45s'); // Updated to reflect faster spawn rate
            }
        } catch (error) {
            console.error('Error updating UI:', error);
        }
        
        // Update button states
        this.updateButtonStates();
    }
    
    // New method to handle button states separately
    updateButtonStates() {
        // Helper function to update button state
        const updateButtonState = (id, disabled) => {
            const button = document.getElementById(id);
            if (button) {
                button.disabled = disabled;
                if (disabled) {
                    button.classList.add('disabled');
                } else {
                    button.classList.remove('disabled');
                }
            }
        };
        
        // Helper function to show/hide element
        const toggleElementVisibility = (id, show) => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = show ? 'block' : 'none';
                // If it's a button and we are showing it, also remove hidden class if present
                if (show && element.tagName === 'BUTTON') element.classList.remove('hidden');
                else if (!show && element.tagName === 'BUTTON') element.classList.add('hidden');
            }
        };
        
        // Regular ant buttons
        updateButtonState('buy-ant', !this.resourceManager.canBuyAnt());
        
        updateButtonState('upgrade-food', !this.resourceManager.canUpgradeFood());
        
        updateButtonState('upgrade-speed', !this.resourceManager.canAfford(this.resourceManager.stats.speedUpgradeCost));
        
        updateButtonState('upgrade-strength', !this.resourceManager.canAfford(this.resourceManager.stats.strengthUpgradeCost));
        
        updateButtonState('expand-colony', !this.resourceManager.canAfford(this.resourceManager.stats.expandCost));
        
        // Update flying ant button states
        updateButtonState('unlock-flying-ants', !this.resourceManager.stats.flyingAntsUnlocked && !this.resourceManager.canAfford(this.resourceManager.stats.flyingAntUnlockCost));
        
        // Update queen ant button states
        // Hide unlock and buy buttons
        const unlockQueenButton = document.getElementById('unlock-queen');
        if (unlockQueenButton) {
            unlockQueenButton.style.display = 'none';
        }
        
        const buyQueenButton = document.getElementById('buy-queen');
        if (buyQueenButton) {
            buyQueenButton.style.display = 'none';
        }
        
        // Only enable upgrade button if player can afford it
        updateButtonState('upgrade-queen', !this.resourceManager.canUpgradeQueen());
        
        // Show/hide flying ant buttons based on unlock status
        const flyingAntButtons = document.querySelectorAll('.special-btn');
        const flyingAntStats = document.getElementById('flying-ant-stats');
        
        toggleElementVisibility('buy-flying-ant', this.resourceManager.stats.flyingAntsUnlocked);
        toggleElementVisibility('expand-flying-ants', this.resourceManager.stats.flyingAntsUnlocked);
        toggleElementVisibility('flying-ant-stats', this.resourceManager.stats.flyingAntsUnlocked);
        // Also for the main resource display
        const flyingAntResourceStats = document.getElementById('flying-ant-resource-stats');
        if(flyingAntResourceStats) flyingAntResourceStats.classList.toggle('hidden', !this.resourceManager.stats.flyingAntsUnlocked && this.resourceManager.stats.maxFlyingAnts === 0);
        
        if (this.resourceManager.stats.flyingAntsUnlocked) {
            flyingAntButtons.forEach(button => {
                if (button.id !== 'unlock-flying-ants') {
                    button.classList.remove('hidden');
                } else {
                    button.classList.add('hidden');
                }
            });
            
            if (flyingAntStats) {
                flyingAntStats.classList.remove('hidden');
            }
            
            // Update flying ant button states
            updateButtonState('buy-flying-ant', !this.resourceManager.canBuyFlyingAnt());
            
            updateButtonState('expand-flying-ants', !this.resourceManager.canAfford(Math.floor(this.resourceManager.stats.expandCost * 1.5)));
        }
        
        // Update autofeeder button states
        updateButtonState('unlock-autofeeder', !this.resourceManager.stats.autofeederUnlocked && !this.resourceManager.canAfford(this.resourceManager.stats.autofeederCost));
        
        // Show/hide autofeeder upgrade button based on unlock status
        const upgradeAutofeederBtn = document.getElementById('upgrade-autofeeder');
        if (upgradeAutofeederBtn) {
            if (this.resourceManager.stats.autofeederUnlocked) {
                upgradeAutofeederBtn.classList.remove('hidden');
                // Hide the unlock button once unlocked
                const unlockAutofeederBtn = document.getElementById('unlock-autofeeder');
                if (unlockAutofeederBtn) {
                    unlockAutofeederBtn.classList.add('hidden');
                }
                
                // Update upgrade button state
                updateButtonState('upgrade-autofeeder', !this.resourceManager.canUpgradeAutofeeder());
                
                // Update button text to show current food amount
                const foodAmount = this.resourceManager.getAutofeederFoodAmount();
                
                // Update button text if max level reached
                if (this.resourceManager.stats.autofeederLevel >= this.resourceManager.stats.maxAutofeederLevel) {
                    upgradeAutofeederBtn.innerHTML = `<i class="fas fa-arrow-up"></i> Autofeeder Maxed (${foodAmount} food/cycle)`;
                    upgradeAutofeederBtn.disabled = true;
                    upgradeAutofeederBtn.classList.add('disabled');
                } else {
                    // Show current food amount in the button
                    upgradeAutofeederBtn.innerHTML = `<i class="fas fa-arrow-up"></i> Upgrade Autofeeder <span id="autofeeder-level">${this.resourceManager.stats.autofeederLevel}</span>/10 (${foodAmount} food/cycle) (<span id="autofeeder-upgrade-cost">${this.resourceManager.stats.autofeederUpgradeCost}</span> food)`;
                }
            }
        }

        // Car Ant Buttons & Stats
        const carAntsUnlocked = this.resourceManager.stats.carAntsUnlocked;
        toggleElementVisibility('unlock-car-ants', !carAntsUnlocked);
        toggleElementVisibility('buy-car-ant', carAntsUnlocked);
        toggleElementVisibility('expand-car-ants', carAntsUnlocked);
        toggleElementVisibility('car-ant-stats', carAntsUnlocked);
        // Main resource display for car ants
        const carAntResourceStats = document.getElementById('car-ant-resource-stats');
        if(carAntResourceStats) carAntResourceStats.classList.toggle('hidden', !carAntsUnlocked && this.resourceManager.stats.maxCarAnts === 0);

        if (carAntsUnlocked) {
            updateButtonState('buy-car-ant', !this.resourceManager.canBuyCarAnt());
            updateButtonState('expand-car-ants', !this.resourceManager.canExpandCarAntCapacity());
        } else {
            updateButtonState('unlock-car-ants', !this.resourceManager.canUnlockCarAnts());
        }

        // Fire Ant Buttons & Stats
        const fireAntsUnlocked = this.resourceManager.stats.fireAntsUnlocked;
        toggleElementVisibility('unlock-fire-ants', !fireAntsUnlocked);
        toggleElementVisibility('buy-fire-ant', fireAntsUnlocked);
        toggleElementVisibility('expand-fire-ants', fireAntsUnlocked);
        toggleElementVisibility('fire-ant-stats', fireAntsUnlocked);
        const fireAntResourceStats = document.getElementById('fire-ant-resource-stats');
        if (fireAntResourceStats) fireAntResourceStats.classList.toggle('hidden', !fireAntsUnlocked && this.resourceManager.stats.maxFireAnts === 0);

        if (fireAntsUnlocked) {
            updateButtonState('buy-fire-ant', !this.resourceManager.canBuyFireAnt());
            updateButtonState('expand-fire-ants', !this.resourceManager.canExpandFireAntCapacity());
        } else {
            updateButtonState('unlock-fire-ants', !this.resourceManager.canUnlockFireAnts());
        }
    }
    
    animateCounters() {
        try {
            // Smoothly animate the food counter using cached element
            const diff = this.resourceManager.resources.food - this.resourceManager.resources.displayFood;
            
            if (Math.abs(diff) > 0.01) {
                // Increase animation speed for more responsive updates
                // Change from 0.1 to 0.5 (50% of the difference per frame)
                this.resourceManager.resources.displayFood += diff * 0.5;
                if (this.elements.foodCount) {
                    this.elements.foodCount.textContent = Math.floor(this.resourceManager.resources.displayFood);
                }
            } else {
                this.resourceManager.resources.displayFood = this.resourceManager.resources.food;
                if (this.elements.foodCount) {
                    this.elements.foodCount.textContent = Math.floor(this.resourceManager.resources.food);
                }
            }
        } catch (error) {
            console.error("Error in UIManager.animateCounters:", error);
        }
    }
    
    showUpgradeEffect(buttonId, message) {
        try {
            // Find the button element
            const button = document.getElementById(buttonId);
            if (!button) {
                console.warn(`UIManager: Button with id '${buttonId}' not found for upgrade effect`);
                return;
            }
            
            // Get button position
            const buttonRect = button.getBoundingClientRect();
            
            // Create a floating message
            const messageEl = document.createElement('div');
            messageEl.className = 'upgrade-message';
            messageEl.textContent = message;
            
            // Position near the button
            messageEl.style.position = 'absolute';
            messageEl.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
            messageEl.style.top = `${buttonRect.top - 10}px`;
            messageEl.style.transform = 'translate(-50%, -100%)';
            messageEl.style.backgroundColor = 'rgba(255, 215, 0, 0.9)';
            messageEl.style.color = '#333';
            messageEl.style.padding = '5px 10px';
            messageEl.style.borderRadius = '20px';
            messageEl.style.fontWeight = 'bold';
            messageEl.style.zIndex = '100';
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'all 0.5s ease';
            
            document.body.appendChild(messageEl);
            
            // Animate the message
            setTimeout(() => {
                messageEl.style.opacity = '1';
                messageEl.style.top = `${buttonRect.top - 30}px`;
            }, 10);
            
            // Remove after animation
            setTimeout(() => {
                messageEl.style.opacity = '0';
                messageEl.style.top = `${buttonRect.top - 50}px`;
                
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        document.body.removeChild(messageEl);
                    }
                }, 500);
            }, 1500);
            
            // Add a flash effect to the button
            button.style.backgroundColor = '#FFD700';
            button.style.transform = 'scale(1.05)';
            
            setTimeout(() => {
                button.style.backgroundColor = '';
                button.style.transform = '';
            }, 300);
        } catch (error) {
            console.error("Error in UIManager.showUpgradeEffect:", error);
        }
    }
} 

// ===== src/managers/NotificationManager.js =====
// src/managers/NotificationManager.js
// A simple banner notification manager
IdleAnts.Managers.NotificationManager = class {
    constructor() {
        this._createBannerElement();
        this.hideTimeout = null;
    }

    /**
     * Shows a banner notification.
     * @param {string} message - The text to display.
     * @param {('info'|'success'|'warning'|'error')} [type='info'] - Visual style.
     * @param {number} [duration=3000] - How long to show (ms). Pass 0 to keep until manually hidden.
     */
    show(message, type = 'info', duration = 3000) {
        if (!this.bannerEl) return;

        // Reset classes and set new type
        this.bannerEl.className = `notification-banner ${type}`;
        this.bannerEl.textContent = message;

        // Trigger reflow then show
        void this.bannerEl.offsetWidth; // Force browser to recognize the class change
        this.bannerEl.classList.add('show');

        // Clear any existing timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        // Auto-hide if duration > 0
        if (duration > 0) {
            this.hideTimeout = setTimeout(() => this.hide(), duration);
        }
    }

    hide() {
        if (!this.bannerEl) return;
        this.bannerEl.classList.remove('show');
    }

    _createBannerElement() {
        // Prevent multiple banners if class instantiated multiple times
        let existing = document.getElementById('notification-banner');
        if (existing) {
            this.bannerEl = existing;
            return;
        }

        this.bannerEl = document.createElement('div');
        this.bannerEl.id = 'notification-banner';
        this.bannerEl.className = 'notification-banner';
        document.body.appendChild(this.bannerEl);
    }
};

// Instantiate a singleton and expose convenience helper
(function () {
    const instance = new IdleAnts.Managers.NotificationManager();
    IdleAnts.Managers.NotificationManager.instance = instance;

    // Global shortcut function
    IdleAnts.notify = function (message, type = 'info', duration = 3000) {
        instance.show(message, type, duration);
    };
})(); 

// ===== src/managers/camera/CameraManager.js =====
// src/managers/camera/CameraManager.js
// Ensure IdleAnts and IdleAnts.Managers namespaces exist
if (typeof IdleAnts === 'undefined') {
    IdleAnts = {};
}
if (typeof IdleAnts.Managers === 'undefined') {
    IdleAnts.Managers = {};
}

IdleAnts.Managers.CameraManager = class {
    constructor(app, mapConfig, worldContainer, gameInstance) {
        this.app = app;
        this.mapConfig = mapConfig; // Contains .width, .height, .viewport, .zoom
        this.worldContainer = worldContainer;
        this.game = gameInstance; // For callbacks like game.updateMinimap(), game.updateHoverIndicator()

        this.initializeZoomLevels();
    }

    initializeZoomLevels() {
        // Calculate the minimum zoom level based on map and viewport dimensions
        // This needs to run after app view is available
        if (this.app && this.app.view && this.app.view.width > 0 && this.app.view.height > 0 &&
            this.mapConfig && this.mapConfig.width > 0 && this.mapConfig.height > 0) {
            
            const minZoomX = this.app.view.width / this.mapConfig.width;
            const minZoomY = this.app.view.height / this.mapConfig.height;
            const dynamicMinZoom = Math.max(minZoomX, minZoomY);

            // Ensure zoom object and its properties exist with defaults if not already set
            this.mapConfig.zoom = this.mapConfig.zoom || {};
            this.mapConfig.zoom.min = Math.max(this.mapConfig.zoom.min || 0.25, dynamicMinZoom);
            this.mapConfig.zoom.level = Math.max(this.mapConfig.zoom.level || 1.0, dynamicMinZoom);
        } else {
            console.warn("CameraManager: PIXI app view dimensions or mapConfig dimensions not fully initialized for dynamic zoom calculation. Using default/existing zoom levels.");
            // Ensure zoom object and its properties exist with defaults if not already set
            this.mapConfig.zoom = this.mapConfig.zoom || {};
            this.mapConfig.zoom.min = this.mapConfig.zoom.min || 0.25;
            this.mapConfig.zoom.level = this.mapConfig.zoom.level || 1.0;
        }
    }

    updateCamera(keysPressed) {
        const speed = this.mapConfig.viewport.speed;
        let cameraMoved = false;
        
        // Adjust speed based on zoom level - faster movement when zoomed out
        const adjustedSpeed = speed / this.mapConfig.zoom.level;
        
        if (keysPressed.ArrowLeft || keysPressed.a) {
            this.mapConfig.viewport.x = Math.max(0, this.mapConfig.viewport.x - adjustedSpeed);
            cameraMoved = true;
        }
        if (keysPressed.ArrowRight || keysPressed.d) {
            const maxX = Math.max(0, this.mapConfig.width - (this.app.view.width / this.mapConfig.zoom.level));
            this.mapConfig.viewport.x = Math.min(maxX, this.mapConfig.viewport.x + adjustedSpeed);
            cameraMoved = true;
        }
        if (keysPressed.ArrowUp || keysPressed.w) {
            this.mapConfig.viewport.y = Math.max(0, this.mapConfig.viewport.y - adjustedSpeed);
            cameraMoved = true;
        }
        if (keysPressed.ArrowDown || keysPressed.s) {
            const maxY = Math.max(0, this.mapConfig.height - (this.app.view.height / this.mapConfig.zoom.level));
            this.mapConfig.viewport.y = Math.min(maxY, this.mapConfig.viewport.y + adjustedSpeed);
            cameraMoved = true;
        }
        
        if (cameraMoved) {
            this.worldContainer.position.set(
                -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
                -this.mapConfig.viewport.y * this.mapConfig.zoom.level
            );
        }
        return cameraMoved;
    }

    centerViewOnPosition(x, y) {
        const viewWidth = this.app.screen.width / this.mapConfig.zoom.level;
        const viewHeight = this.app.screen.height / this.mapConfig.zoom.level;
        
        this.mapConfig.viewport.x = Math.max(0, Math.min(x - (viewWidth / 2), this.mapConfig.width - viewWidth));
        this.mapConfig.viewport.y = Math.max(0, Math.min(y - (viewHeight / 2), this.mapConfig.height - viewHeight));
        
        this.worldContainer.position.set(
            -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
            -this.mapConfig.viewport.y * this.mapConfig.zoom.level
        );
        
        if (this.game && typeof this.game.updateMinimap === 'function') {
            this.game.updateMinimap();
        }
    }

    centerCameraOnNest() {
        const nestX = this.mapConfig.width / 2;
        const nestY = this.mapConfig.height / 2;
        
        this.initializeZoomLevels(); 
        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);

        this.centerViewOnPosition(nestX, nestY);
    }

    updateZoom(zoomDelta, mouseX, mouseY) {
        const oldZoom = this.mapConfig.zoom.level;
        
        // Recalculate dynamicMinZoom based on current view size and update mapConfig.zoom.min
        this.initializeZoomLevels(); 
        const effectiveMinZoom = this.mapConfig.zoom.min;
        
        this.mapConfig.zoom.level = Math.max(
            effectiveMinZoom,
            Math.min(this.mapConfig.zoom.level + zoomDelta, this.mapConfig.zoom.max)
        );
        
        if (oldZoom === this.mapConfig.zoom.level) return;
        
        const worldX = (mouseX / oldZoom) + this.mapConfig.viewport.x;
        const worldY = (mouseY / oldZoom) + this.mapConfig.viewport.y;
        
        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);
        
        this.mapConfig.viewport.x = worldX - (mouseX / this.mapConfig.zoom.level);
        this.mapConfig.viewport.y = worldY - (mouseY / this.mapConfig.zoom.level);
        
        const newWorldWidth = this.app.view.width / this.mapConfig.zoom.level;
        const newWorldHeight = this.app.view.height / this.mapConfig.zoom.level;
        
        this.mapConfig.viewport.x = Math.max(0, Math.min(
            this.mapConfig.viewport.x,
            this.mapConfig.width - newWorldWidth
        ));
        this.mapConfig.viewport.y = Math.max(0, Math.min(
            this.mapConfig.viewport.y,
            this.mapConfig.height - newWorldHeight
        ));
        
        this.worldContainer.position.set(
            -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
            -this.mapConfig.viewport.y * this.mapConfig.zoom.level
        );
        
        if (this.game && typeof this.game.updateMinimap === 'function') {
            this.game.updateMinimap();
        }
        if (this.game && typeof this.game.updateHoverIndicator === 'function' &&
            this.game.lastMouseX !== undefined && this.game.lastMouseY !== undefined) {
            // Ensure lastMouseX and lastMouseY are accessible from the game instance
            this.game.updateHoverIndicator(this.game.lastMouseX, this.game.lastMouseY);
        }
    }

    panViewport(screenDeltaX, screenDeltaY) {
        // screenDeltaX and screenDeltaY are the change in screen coordinates
        // Positive screenDeltaX means swipe right, so viewport should move left (decrease x)
        const worldDeltaX = screenDeltaX / this.mapConfig.zoom.level;
        const worldDeltaY = screenDeltaY / this.mapConfig.zoom.level;

        this.mapConfig.viewport.x = Math.max(0, Math.min(
            this.mapConfig.viewport.x - worldDeltaX, // Subtract worldDeltaX
            this.mapConfig.width - (this.app.view.width / this.mapConfig.zoom.level)
        ));
        
        this.mapConfig.viewport.y = Math.max(0, Math.min(
            this.mapConfig.viewport.y - worldDeltaY, // Subtract worldDeltaY
            this.mapConfig.height - (this.app.view.height / this.mapConfig.zoom.level)
        ));
        
        this.worldContainer.position.set(
            -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
            -this.mapConfig.viewport.y * this.mapConfig.zoom.level
        );
        
        if (this.game && typeof this.game.updateMinimap === 'function') {
            this.game.updateMinimap();
        }
    }

    handleResizeOrOrientationChange() {
        this.initializeZoomLevels();

        if (this.mapConfig.zoom.level < this.mapConfig.zoom.min) {
            this.mapConfig.zoom.level = this.mapConfig.zoom.min;
        }
        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);
        
        const newWorldWidth = this.app.view.width / this.mapConfig.zoom.level;
        const newWorldHeight = this.app.view.height / this.mapConfig.zoom.level;

        this.mapConfig.viewport.x = Math.max(0, Math.min(
            this.mapConfig.viewport.x,
            this.mapConfig.width - newWorldWidth
        ));
        this.mapConfig.viewport.y = Math.max(0, Math.min(
            this.mapConfig.viewport.y,
            this.mapConfig.height - newWorldHeight
        ));

        this.worldContainer.position.set(
            -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
            -this.mapConfig.viewport.y * this.mapConfig.zoom.level
        );
        
        if (this.game && typeof this.game.updateMinimap === 'function') {
            this.game.updateMinimap();
        }
        if (this.game && this.game.uiManager && typeof this.game.uiManager.updateUI === 'function') {
            this.game.uiManager.updateUI();
        }
    }
};


// ===== src/managers/input/InputManager.js =====
// Ensure IdleAnts and IdleAnts.Managers namespaces exist
if (typeof IdleAnts === 'undefined') {
    IdleAnts = {};
}
if (typeof IdleAnts.Managers === 'undefined') {
    IdleAnts.Managers = {};
}

IdleAnts.Managers.InputManager = class {
    constructor(app, gameInstance, cameraManager, resourceManager, entityManager, mapConfig) {
        this.app = app;
        this.game = gameInstance;
        this.cameraManager = cameraManager;
        this.resourceManager = resourceManager; // Needed for getting current food type
        this.entityManager = entityManager;   // Needed for adding food
        this.mapConfig = mapConfig;           // For coordinate conversions

        // Keyboard state
        this.keysPressed = {
            ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
            w: false, a: false, s: false, d: false
        };

        // Touch state
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        this.isPanning = false;
        this.lastPinchDistance = 0;
        this.isTouching = false;
        this.touchStartTime = 0;
        this.touchMoved = false;
        
        // Mobile-specific settings (copied from Game.js, consider centralizing later)
        this.mobileSettings = {
            tapDelay: this.game.isMobileDevice ? 100 : 0, 
            minSwipeDistance: 10,
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Canvas click for manual food placement (desktop)
        this.app.view.addEventListener('click', this.handleCanvasClick.bind(this));
        
        // Mouse move for hover effect
        this.app.view.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.app.view.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

        // Keyboard controls for map navigation and actions
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Make canvas focusable and focus on mousedown
        this.app.view.tabIndex = 1;
        this.app.view.addEventListener('mousedown', () => this.app.view.focus());

        // Wheel events for zoom
        this.app.view.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

        // Touch events
        this.app.view.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.app.view.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.app.view.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.app.view.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
    }

    handleCanvasClick(e) {
        if (this.game.state !== IdleAnts.Game.States.PLAYING || this.game.isMobileDevice) { // Mobile uses touchend for taps
            return;
        }
        
        const rect = this.app.view.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        const worldX = (screenX / this.mapConfig.zoom.level) + this.mapConfig.viewport.x;
        const worldY = (screenY / this.mapConfig.zoom.level) + this.mapConfig.viewport.y;
        
        const currentFoodType = this.resourceManager.getCurrentFoodType();
        this.entityManager.addFood({ x: worldX, y: worldY, clickPlaced: true }, currentFoodType);
        if (this.game.uiManager) this.game.uiManager.updateUI();
    }

    handleMouseMove(e) {
        const rect = this.app.view.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.game.lastMouseX = x; // Game class still responsible for hoverIndicator logic itself
        this.game.lastMouseY = y;
        
        // Game's updateHoverIndicator is called in its gameLoop, no need to call here directly
        // unless we want immediate response outside the loop, which might be complex.
        // For now, rely on Game's loop to pick up lastMouseX/Y.
    }

    handleMouseLeave() {
        // Game class will clear its hoverIndicator based on undefined lastMouseX/Y
        this.game.lastMouseX = undefined;
        this.game.lastMouseY = undefined;
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            this.game.togglePause();
            return;
        }
        
        if (this.game.state !== IdleAnts.Game.States.PLAYING) {
            return;
        }
        
        if (this.keysPressed.hasOwnProperty(e.key)) {
            e.preventDefault();
            this.keysPressed[e.key] = true;
        }
    }

    handleKeyUp(e) {
        if (this.keysPressed.hasOwnProperty(e.key)) {
            e.preventDefault();
            this.keysPressed[e.key] = false;
        }
    }

    handleWheel(e) {
        if (this.game.state !== IdleAnts.Game.States.PLAYING || !this.cameraManager) {
            return;
        }
        e.preventDefault();
        
        const rect = this.app.view.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomDelta = e.deltaY > 0 ? -this.mapConfig.zoom.speed : this.mapConfig.zoom.speed;
        this.cameraManager.updateZoom(zoomDelta, mouseX, mouseY);
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (this.game.state !== IdleAnts.Game.States.PLAYING) return;

        this.isTouching = true;
        this.touchStartTime = Date.now();
        this.touchMoved = false;

        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.app.view.getBoundingClientRect();
            this.touchStartX = touch.clientX - rect.left;
            this.touchStartY = touch.clientY - rect.top;
            this.lastTouchX = this.touchStartX;
            this.lastTouchY = this.touchStartY;

            // For hover indicator on touch (Game will handle drawing)
            this.game.lastMouseX = this.touchStartX;
            this.game.lastMouseY = this.touchStartY;

        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            this.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
            
            // Clear hover if it was active
            this.game.lastMouseX = undefined; 
            this.game.lastMouseY = undefined;
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (this.game.state !== IdleAnts.Game.States.PLAYING || !this.isTouching) return;

        this.touchMoved = true;

        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.app.view.getBoundingClientRect();
            const currentX = touch.clientX - rect.left;
            const currentY = touch.clientY - rect.top;

            const deltaX = currentX - this.lastTouchX;
            const deltaY = currentY - this.lastTouchY;

            if (!this.isPanning && (Math.abs(deltaX) > this.mobileSettings.minSwipeDistance || Math.abs(deltaY) > this.mobileSettings.minSwipeDistance)) {
                this.isPanning = true;
                 // Clear hover if panning starts
                this.game.lastMouseX = undefined;
                this.game.lastMouseY = undefined;
            }

            if (this.isPanning && this.cameraManager) {
                this.cameraManager.panViewport(deltaX, deltaY); // screenDeltaX, screenDeltaY
            } else {
                // Update hover if not panning
                this.game.lastMouseX = currentX;
                this.game.lastMouseY = currentY;
            }
            
            this.lastTouchX = currentX;
            this.lastTouchY = currentY;

        } else if (e.touches.length === 2 && this.cameraManager) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            const currentPinchDistance = Math.sqrt(dx * dx + dy * dy);
            const pinchDelta = currentPinchDistance - this.lastPinchDistance;

            if (Math.abs(pinchDelta) > 5) { // Threshold
                const zoomDelta = (pinchDelta / 100) * this.mapConfig.zoom.speed;
                const rect = this.app.view.getBoundingClientRect();
                const centerX = ((touch1.clientX + touch2.clientX) / 2) - rect.left;
                const centerY = ((touch1.clientY + touch2.clientY) / 2) - rect.top;
                this.cameraManager.updateZoom(zoomDelta, centerX, centerY);
                this.lastPinchDistance = currentPinchDistance;
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        if (this.game.state !== IdleAnts.Game.States.PLAYING) return;

        const touchDuration = Date.now() - this.touchStartTime;

        if (e.touches.length === 0) { // All touches ended
            if (!this.touchMoved && touchDuration < 300 && !this.isPanning) { // Tap
                // Use initial touch position for tap accuracy
                const worldX = (this.touchStartX / this.mapConfig.zoom.level) + this.mapConfig.viewport.x;
                const worldY = (this.touchStartY / this.mapConfig.zoom.level) + this.mapConfig.viewport.y;
                
                const currentFoodType = this.resourceManager.getCurrentFoodType();
                
                // Apply tap delay for mobile
                setTimeout(() => {
                    this.entityManager.addFood({ x: worldX, y: worldY, clickPlaced: true }, currentFoodType);
                    if (this.game.uiManager) this.game.uiManager.updateUI();
                }, this.mobileSettings.tapDelay);
            }
            
            this.isPanning = false;
            this.isTouching = false;
            this.touchMoved = false;
            
            // Clear hover indicator on touch end
            this.game.lastMouseX = undefined;
            this.game.lastMouseY = undefined;
        }
    }

    handleTouchCancel(e) {
        this.isPanning = false;
        this.isTouching = false;
        this.touchMoved = false;
        // Clear hover indicator
        this.game.lastMouseX = undefined;
        this.game.lastMouseY = undefined;
    }

    // This method would be called from the Game's gameLoop
    update() {
        if (this.game.state === IdleAnts.Game.States.PLAYING && this.cameraManager) {
            const cameraMoved = this.cameraManager.updateCamera(this.keysPressed); // Pass keysPressed
            if (cameraMoved && this.game.updateMinimap) { // If camera moved due to keys, update minimap
                this.game.updateMinimap();
            }
        }
    }
}; 

// ===== src/managers/CombatManager.js =====
// src/managers/CombatManager.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Managers === 'undefined') IdleAnts.Managers = {};

// Basic stub for upcoming combat mechanics
IdleAnts.Managers.CombatManager = class {
    constructor(entityManager) {
        this.entityManager = entityManager;
        // TODO: maintain lists of hostile/ally entities, handle combat resolution
    }

    update() {
        // Called every frame – will process combat interactions
    }

    registerAttack(attacker, target, damage) {
        // Future method to apply damage and handle effects
    }
}; 

// ===== src/entities/AntBase.js =====
// src/entities/AntBase.js
IdleAnts.Entities.AntBase = class extends PIXI.Sprite {
    // Define state constants
    static States = {
        SPAWNING: 'spawning',
        SEEKING_FOOD: 'seekingFood', 
        COLLECTING_FOOD: 'collectingFood',
        RETURNING_TO_NEST: 'returningToNest',
        DELIVERING_FOOD: 'deliveringFood',
        FIGHTING: 'fighting'
    };
    
    constructor(texture, nestPosition, speedMultiplier = 1, speedFactor = 1) {
        super(texture);
        
        this.anchor.set(0.5);
        
        // ABSOLUTELY CRITICAL: Ensure position starts at nest
        this.x = nestPosition.x;
        this.y = nestPosition.y;
        
        // Store nest position for reference - make a deep copy to avoid reference issues
        this.nestPosition = { 
            x: nestPosition.x,
            y: nestPosition.y 
        };
        
        // CRITICAL FIX: Initialize food pickup position tracking
        this.lastFoodPickupPos = null;
        
        // Add a timeout counter for returning to nest to prevent permanent stuck state
        this.returningToNestTimeout = 0;
        this.maxReturningToNestTime = 600; // 10 seconds at 60fps
        
        // Ant properties
        this.baseSpeed = (1 + Math.random() * 0.5) * 2.0;
        this.speedFactor = speedFactor; // Type-specific speed factor (1 for regular ants, 10 for flying ants, etc.)
        this.speed = this.baseSpeed * speedMultiplier * this.speedFactor;
        this.originalSpeed = this.speed;
        this.targetFood = null;
        this.isAtFullCapacity = false; // Renamed from hasFood
        
        // Simple capacity property - how many food items an ant can carry
        this.capacity = 1;
        this.foodCollected = 0; // Number of food items collected so far
        
        // Movement properties
        this.momentum = 0.95; // How much of current velocity is preserved (slight damping)
        this.maxVelocity = this.speed * 1.5; // Maximum velocity (to prevent excessive speed)
        
        // Set base scale with random variation
        this.baseScale = this.getBaseScale();
        this.scale.set(this.baseScale, this.baseScale);
        
        // CRITICAL: Ensure zero velocity at start
        this.vx = 0;
        this.vy = 0;
        
        // The sprite is drawn facing up, but we need it to face right for proper rotation
        this.rotation = -Math.PI / 2;
        
        // Smooth rotation properties
        this.targetRotation = this.rotation;
        this.turnSpeed = 0.1 + Math.random() * 0.8; // Randomized between 0.1 and 0.9
        
        // Create ant-specific visual elements
        this.createVisualElements();
        
        // Add properties for food collection state
        this.isCollecting = false;
        this.collectionTimer = 0;
        this.collectionTarget = null;
        this.capacityWeight = 0; // Track weight-based capacity used
        
        // Add stuck prevention properties
        this.stuckPrevention = { active: false, delay: 0 };
        
        // Add stuck detection properties - useful for all ant types
        this.minMovementSpeed = this.speed * 0.1; // Minimum speed even when "stuck"
        this.stuckCheckCounter = 0;
        this.lastPosition = { x: this.x, y: this.y };
        this.stuckThreshold = 1.0; // Distance under which we consider the ant might be stuck
        
        // Add flag for smooth transition when moving to nest
        this.justCollectedFood = false;
        this.transitionDelay = 0; // Will be set in update method
        
        // Configuration properties based on ant attributes
        this.config = {
            canStackFood: this.capacity > 1,
            minDistanceToDepositFood: 15, // Reduced from 50 to 15 to allow ants to deposit food more easily
            foodCollectionRadius: 10,     // How close ant needs to be to collect food
            nestRadius: 10,               // How close ant needs to be to nest
            moveSpeedLoaded: this.speed * 0.8,
            turnSpeed: 0.1 + Math.random() * 0.8, // Randomized between 0.1 and 0.9
            stuckThreshold: 1.0,
            minMovementSpeed: this.speed * 0.1
        };
        
        // State initialization
        this.state = IdleAnts.Entities.AntBase.States.SPAWNING;
        
        // Health properties
        this.maxHp = 50;
        this.hp = this.maxHp;
        this.createHealthBar();
        this.healthBarTimer = 0; // frames remaining to show health bar
        
        // Combat properties
        this.attackDamage = 5;
        this.attackCooldown = 30;
        this._attackTimer = 0;
        this.targetEnemy = null;
    }
    
    // Template method - subclasses can override to provide different scales
    getBaseScale() {
        return 0.8 + Math.random() * 0.4;
    }
    
    // Template method - subclasses will implement with their specific visual elements
    createVisualElements() {
        // Create common elements
        this.createShadow();
        
        // Create type-specific elements (implemented by subclasses)
        this.createTypeSpecificElements();
        
        // Create food indicator
        this.createFoodIndicator();
    }
    
    // Template method for subclasses to implement their specific visual elements
    createTypeSpecificElements() {
        // Implemented by subclasses
    }
    
    createShadow() {
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.2);
        shadow.drawEllipse(0, 0, 8, 4);
        shadow.endFill();
        shadow.y = 8; // Position under the ant
        this.addChild(shadow);
    }
    
    createFoodIndicator() {
        // Create a visual indicator for when the ant is carrying food
        this.foodIndicator = new PIXI.Container();
        
        // Draw a small piece of food
        const baseFood = new PIXI.Graphics();
        baseFood.beginFill(0xEAD2AC); // Light beige
        baseFood.drawCircle(0, 0, 3);
        baseFood.endFill();
        
        // Add some detail
        baseFood.beginFill(0xD9BF93); // Darker beige for shadow
        baseFood.drawCircle(0.5, 0.5, 1.5);
        baseFood.endFill();
        
        // Add the base food to the container
        this.foodIndicator.addChild(baseFood);
        
        // Position the food above the ant
        this.foodIndicator.x = 0;
        this.foodIndicator.y = -6;
        
        // Hide it initially
        this.foodIndicator.visible = false;
        
        // Add it to the ant
        this.addChild(this.foodIndicator);
    }
    
    createHealthBar() {
        // Create a separate container so the health bar is NOT affected by ant rotation
        this.healthBarContainer = new PIXI.Container();
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(this.healthBarContainer);
        } else {
            // Fallback: attach to ant, but this should rarely happen
            this.addChild(this.healthBarContainer);
        }
        this.healthBarContainer.visible = false;

        this.healthBarBg = new PIXI.Graphics();
        this.healthBarBg.beginFill(0x000000, 0.6);
        this.healthBarBg.drawRect(-10, 0, 20, 3);
        this.healthBarBg.endFill();
        this.healthBarContainer.addChild(this.healthBarBg);

        this.healthBarFg = new PIXI.Graphics();
        this.healthBarContainer.addChild(this.healthBarFg);
        this.updateHealthBar();
    }

    updateHealthBar() {
        const ratio = Math.max(this.hp,0) / this.maxHp;
        this.healthBarFg.clear();
        this.healthBarFg.beginFill(0x00FF00);
        this.healthBarFg.drawRect(-10, 0, 20 * ratio, 3);
        this.healthBarFg.endFill();
        this.healthBarContainer.visible = true;
        this.healthBarTimer = 1800; // 30 seconds at 60fps

        // Ensure bar is positioned just above the ant and always horizontal
        this.healthBarContainer.x = this.x;
        this.healthBarContainer.y = this.y - 20;
        this.healthBarContainer.rotation = 0;
    }

    takeDamage(dmg) {
        this.hp -= dmg;
        this.updateHealthBar();
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        if (this.parent) this.parent.removeChild(this);
        this.isDead = true;
        // Remove detached health bar
        if (this.healthBarContainer && this.healthBarContainer.parent) {
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
        }
    }
    
    update(nestPosition, foods) {
        // Keep health bar fixed above the sprite regardless of rotation
        if (this.healthBarContainer) {
            this.healthBarContainer.x = this.x;
            this.healthBarContainer.y = this.y - 20;
            this.healthBarContainer.rotation = 0;
        }
        // Handle health bar timer
        if(this.healthBarTimer>0){
            this.healthBarTimer--;
            if(this.healthBarTimer===0 && this.healthBarContainer){
                this.healthBarContainer.visible=false;
            }
        }
        // Check if the ant is stuck
        this.checkIfStuck();
        
        // Perform animations regardless of state
        this.performAnimation();
        
        // State-specific behavior
        switch (this.state) {
            case IdleAnts.Entities.AntBase.States.SPAWNING:
                return this.updateSpawning(nestPosition);
                
            case IdleAnts.Entities.AntBase.States.SEEKING_FOOD:
                return this.updateSeekingFood(foods);
                
            case IdleAnts.Entities.AntBase.States.COLLECTING_FOOD:
                return this.updateCollectingFood();
                
            case IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST:
                return this.updateReturningToNest(nestPosition);
                
            case IdleAnts.Entities.AntBase.States.DELIVERING_FOOD:
                return this.updateDeliveringFood();
                
            case IdleAnts.Entities.AntBase.States.FIGHTING:
                return this.updateFighting();
        }
        
        return false; // Default no action
    }
    
    // Handle spawning state - ant starts at nest and prepares to move
    updateSpawning(nestPosition) {
        // Set initial random direction
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * this.speed * 0.5;
        this.vy = Math.sin(angle) * this.speed * 0.5;
        
        // Immediately transition to seeking food
        this.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
        return false;
    }
    
    // Handle seeking food state - ant looks for closest food source
    updateSeekingFood(foods) {
        // PRIORITIZE ENEMY COMBAT OVER FOOD
        if (this.targetEnemy && !this.targetEnemy.isDead) {
            const dx = this.targetEnemy.x - this.x;
            const dy = this.targetEnemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const engageDist = 20;

            // If within engage range, switch to fighting state
            if (distance <= engageDist) {
                this.transitionToState(IdleAnts.Entities.AntBase.States.FIGHTING);
                return false;
            }

            // Otherwise move toward the enemy like we would toward food
            this.moveTowardsTarget(this.targetEnemy);
            this.applyMovement();
            return false;
        }
        
        // If ant can't carry more food, transition to returning to nest
        if (!this.canCarryMoreFood()) {
            this.transitionToState(IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST);
            return false;
        }
        
        // Handle stuck prevention delay
        if (this.stuckPrevention && this.stuckPrevention.active) {
            this.stuckPrevention.delay--;
            
            if (this.stuckPrevention.delay <= 0) {
                this.stuckPrevention.active = false;
            } else {
                this.wander();
                this.applyMovement();
                return false;
            }
        }
        
        // No food available, just wander
        if (foods.length === 0) {
            this.wander();
            this.applyMovement();
            return false;
        }
        
        // Find closest food
        let closestFood = null;
        let closestDistance = Infinity;
        
        for (let i = 0; i < foods.length; i++) {
            const food = foods[i];
            const dx = food.x - this.x;
            const dy = food.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Consider all food regardless of weight
            if (distance < closestDistance) {
                closestDistance = distance;
                closestFood = food;
            }
        }
        
        // Update target food
        this.targetFood = closestFood;
        
        // If reached food, start collecting
        if (closestFood && closestDistance < this.config.foodCollectionRadius) {
            // Prepare for collection
            this.collectionTarget = this.targetFood;
            this.collectionTimer = 0;
            
            // Register this ant with the food item
            if (this.id === undefined) {
                this.id = 'ant_' + Math.random().toString(36).substr(2, 9);
            }
            this.collectionTarget.addCollectingAnt(this);
            
            // Stop moving while collecting
            this.vx = 0;
            this.vy = 0;
            
            // Record position for pickup/deposit distance tracking
            this.lastFoodPickupPos = { x: this.x, y: this.y };
            
            // Transition to collecting state
            this.transitionToState(IdleAnts.Entities.AntBase.States.COLLECTING_FOOD);
            return false;
        }
        
        // No food in range, move towards closest food or wander
        if (closestFood) {
            this.moveTowardsTarget(closestFood);
        } else {
            this.wander();
        }
        
        this.applyMovement();
        return false;
    }
    
    // Handle collecting food state
    updateCollectingFood() {
        // Verify the food target still exists
        if (!this.collectionTarget || 
            (IdleAnts.app.entityManager && 
             !IdleAnts.app.entityManager.entities.foods.includes(this.collectionTarget))) {
            // Food is gone, return to seeking
            this.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
            return false;
        }
        
        // Continue collecting
        const contributionAmount = 0.016; // For 60fps
        this.collectionTarget.recordAntContribution(this, contributionAmount);
        
        // Get updated collection time
        const collectionTime = this.collectionTarget.getCollectionTimeForAnt(this);
        this.collectionTimer += 0.016;
        
        // Show eating animation
        this.createEatingEffect();
        
        // Check if collection is complete
        if (this.collectionTimer >= collectionTime) {
            // Collection complete, signal to collect food
            return true;
        }
        
        return false;
    }
    
    // Handle returning to nest state
    updateReturningToNest(nestPosition) {
        // Move towards nest
        this.moveToNest(nestPosition);
        
        // Increment timeout counter
        this.returningToNestTimeout++;
        
        // If ant has been stuck for too long, force deposit
        if (this.returningToNestTimeout > this.maxReturningToNestTime) {
            // Reset timeout
            this.returningToNestTimeout = 0;
            
            // Force transition to delivering state if we're close enough to the nest
            if (this.isAtNest(nestPosition)) {
                this.transitionToState(IdleAnts.Entities.AntBase.States.DELIVERING_FOOD);
                return true; // Signal to deliver food
            }
        }
        
        // Check if at nest and can deliver food
        if (this.foodCollected > 0 && this.isAtNest(nestPosition) && this.hasMovedFarEnoughFromPickup()) {
            // Reset timeout
            this.returningToNestTimeout = 0;
            
            // Transition to delivering state
            this.transitionToState(IdleAnts.Entities.AntBase.States.DELIVERING_FOOD);
            return true; // Signal to deliver food
        }
        
        this.applyMovement();
        return false;
    }
    
    // Handle delivering food state
    updateDeliveringFood() {
        // This state is mostly handled by EntityManager
        // It should transition back to seeking food once food is delivered
        // The return value true triggers the EntityManager to call deliverFood
        return true;
    }
    
    // Helper to apply movement with momentum and rotation
    applyMovement() {
        // Apply momentum
        this.vx *= this.momentum;
        this.vy *= this.momentum;
        
        // Cap velocity
        this.capVelocity();
        
        // Apply movement
        this.x += this.vx;
        this.y += this.vy;
        
        // Update rotation
        this.updateRotation();
    }
    
    // Limit velocity to prevent excessive speeds
    capVelocity() {
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > this.maxVelocity) {
            this.vx = (this.vx / currentSpeed) * this.maxVelocity;
            this.vy = (this.vy / currentSpeed) * this.maxVelocity;
        }
    }
    
    // Template method for ant-specific animations
    performAnimation() {
        // Implemented by subclasses
    }
    
    moveToNest(nestPosition) {
        const dx = nestPosition.x - this.x;
        const dy = nestPosition.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If very close to nest, just slow down instead of stopping completely
        if (distance < 10) {
            const slowdownFactor = distance / 10; // Gradually slow down approaching nest
            this.vx = (dx / distance) * this.speed * slowdownFactor;
            this.vy = (dy / distance) * this.speed * slowdownFactor;
            return;
        }
        
        // Simple normalized movement towards nest
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
    }
    
    isAtNest(nestPosition) {
        // If we're in a transition delay, don't consider at nest yet
        if (this.transitionDelay > 0) {
            return false;
        }
        
        const dx = nestPosition.x - this.x;
        const dy = nestPosition.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Use a slightly larger radius for ants carrying food to make it easier to deposit
        const effectiveRadius = this.foodCollected > 0 ? 
            this.config.nestRadius * 1.2 : // 20% larger radius when carrying food
            this.config.nestRadius;
        
        return distance < effectiveRadius;
    }
    
    // Add a new method for moving towards a target (food, etc.)
    moveTowardsTarget(target, jitter = 0.35) {
        // Create placeholders if not present
        if (!this._pathJitter) this._pathJitter = 0;
        if (!this._lastTarget) this._lastTarget = null;

        // If we've switched to a new target, roll a new jitter angle
        if (this._lastTarget !== target) {
            this._lastTarget = target;
            this._pathJitter = (Math.random() * 2 - 1) * jitter; // store offset once
        }

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) return;

        // Base angle plus stored jitter
        const baseAngle = Math.atan2(dy, dx);
        const angle = baseAngle + this._pathJitter;

        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }
    
    // Template method that can be customized by subclasses
    wander() {
        // Default wandering behavior
        if (Math.random() < 0.05) {
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        }
        
        // The rotation is now handled by updateRotation() method
    }
    
    findAndCollectFood(foods) {
        // If already in the process of collecting food, continue with that
        if (this.isCollecting && this.collectionTarget) {
            // Check if the food target still exists in the game world
            // If it doesn't exist anymore (was eaten by another ant), stop collecting
            if (IdleAnts.app.entityManager && 
                !IdleAnts.app.entityManager.entities.foods.includes(this.collectionTarget)) {
                // Food is gone, reset collection state
                this.isCollecting = false;
                this.collectionTimer = 0;
                this.collectionTarget = null;
                this.targetFood = null;
                return false;
            }
            
            // Food still exists, continue collecting
            // Calculate ant's current contribution based on elapsed time
            const contributionAmount = 0.016; // For 60fps, approximately how much time has passed
            
            // Record this ant's contribution to the food
            this.collectionTarget.recordAntContribution(this, contributionAmount);
            
            // Get updated collection time based on how many ants are collecting
            const collectionTime = this.collectionTarget.getCollectionTimeForAnt(this);
            
            this.collectionTimer += 0.016; // Approximate for 60 fps
            
            // Generate eating animation/particles
            this.createEatingEffect();
            
            // Check if collection is complete for this ant
            if (this.collectionTimer >= collectionTime) {
                this.isCollecting = false;
                this.collectionTimer = 0;
                
                // Signal to collect the food
                return true;
            }
            
            // Still collecting, do not move
            return false;
        }
        
        // First, ensure capacity flag is correctly set
        this.isAtFullCapacity = this.capacityWeight >= this.capacity;
        
        // If ant has reached its carrying capacity or no foods available, just wander
        if (this.capacityWeight >= this.capacity || foods.length === 0) {
            this.wander();
            return false;
        }
        
        // Find the closest food
        let closestFood = null;
        let closestDistance = Infinity;
        
        for (let i = 0; i < foods.length; i++) {
            const food = foods[i];
            const dx = food.x - this.x;
            const dy = food.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Consider all food regardless of weight
            if (distance < closestDistance) {
                closestDistance = distance;
                closestFood = food;
            }
        }
        
        // Update target to the closest food
        this.targetFood = closestFood;
        
        // If ant reaches food, start the collection process
        if (closestFood && closestDistance < 10) {
            // Start collection process
            this.isCollecting = true;
            this.collectionTimer = 0;
            this.collectionTarget = this.targetFood;
            
            // Register this ant with the food item
            if (this.id === undefined) {
                // Generate a unique ID for this ant if it doesn't have one
                this.id = 'ant_' + Math.random().toString(36).substr(2, 9);
            }
            this.collectionTarget.addCollectingAnt(this);
            
            // Temporarily stop moving while collecting
            this.vx = 0;
            this.vy = 0;
            
            // Remember the position where we picked up food for distance tracking
            this.lastFoodPickupPos = { x: this.x, y: this.y };
            
            return false;
        }
        
        // If no food is in range, move towards the closest one
        if (closestFood) {
            this.moveTowardsTarget(closestFood);
        } else {
            this.wander(); // Wander randomly if no food is available
        }
        
        return false;
    }
    
    // Template method for handling boundaries - can be customized by subclasses
    handleBoundaries(width, height) {
        // Default boundary handling: wrap around but with improved safety
        const padding = 20;
        
        // For regular ants, use wrap-around boundary behavior
        if (this.x < -padding) {
            this.x = width + padding;
        } else if (this.x > width + padding) {
            this.x = -padding;
        }
        
        if (this.y < -padding) {
            this.y = height + padding;
        } else if (this.y > height + padding) {
            this.y = -padding;
        }
    }
    
    // Template method for picking up food - can be customized by subclasses
    pickUpFood(foodType, foodValue) {
        // Store the current position where food was picked up
        this.lastFoodPickupPos = { x: this.x, y: this.y };
        
        // Update the collected food amount
        this.foodCollected += foodValue;
        
        // Track total weight for capacity considerations (but don't enforce it)
        this.capacityWeight += 1; // Always count as 1 regardless of food type
        
        // Show the food indicator
        this.foodIndicator.visible = true;
        
        // Apply type-specific visual
        this.updateFoodIndicator(foodType);
        
        // Apply slowdown when carrying food
        this.applyCarryingSlowdown();
        
        // Force ants to stay in seeking state unless they're at full capacity
        if (this.capacityWeight >= this.capacity) {
            // At full capacity, return to the nest
            this.transitionToState(IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST);
        } else {
            // Still under capacity, continue seeking food
            
            // Add some movement away from the pickup point to help the ant move to new food
            this.continueSeekingFood();
            
            this.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
        }
        
        // Return the amount of food collected for notifications
        return foodValue;
    }
    
    // New method to help ants continue seeking food after a pickup
    continueSeekingFood() {
        // After picking up food but not being at capacity, we want the ant to move 
        // away from the current food to find more
        
        // If we have a recorded pickup position, move away from it
        if (this.lastFoodPickupPos) {
            // Calculate direction away from pickup
            const dx = this.x - this.lastFoodPickupPos.x;
            const dy = this.y - this.lastFoodPickupPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0.1) {
                // Push in the direction away from the food pickup point
                // with a slight random factor to spread ants out
                const randomAngle = (Math.random() * 0.5 - 0.25) * Math.PI; // Random angle between -45 and 45 degrees
                const rotatedDx = dx * Math.cos(randomAngle) - dy * Math.sin(randomAngle);
                const rotatedDy = dx * Math.sin(randomAngle) + dy * Math.cos(randomAngle);
                
                const normalizedDist = Math.sqrt(rotatedDx * rotatedDx + rotatedDy * rotatedDy);
                this.vx = (rotatedDx / normalizedDist) * this.speed;
                this.vy = (rotatedDy / normalizedDist) * this.speed;
            } else {
                // If too close to pickup, move in a random direction
                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * this.speed;
                this.vy = Math.sin(angle) * this.speed;
            }
            
            // Slightly boost the velocity to ensure ant moves away properly
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed < this.speed * 0.8) {
                this.vx = (this.vx / currentSpeed) * this.speed * 0.8;
                this.vy = (this.vy / currentSpeed) * this.speed * 0.8;
            }
        }
    }
    
    // Helper method to update the food indicator based on food type
    updateFoodIndicator(foodType) {
        // Store the collected food type
        if (!this.collectedFoodTypes) {
            this.collectedFoodTypes = [];
        }
        
        // Add this food type to the collection
        this.collectedFoodTypes.push(foodType || IdleAnts.Data.FoodTypes.BASIC);
        
        // Reset collection state
        this.isCollecting = false;
        this.collectionTimer = 0;
        
        // Remove this ant from the collecting ants list on the food
        if (this.collectionTarget) {
            this.collectionTarget.removeCollectingAnt(this);
            this.collectionTarget = null;
        }
        
        // Only clear the target food if we're at full capacity
        // so the ant doesn't immediately turn back to the nest
        if (this.capacityWeight >= this.capacity) {
            this.targetFood = null;
        }
        
        // Clear any existing extra food indicators
        while (this.foodIndicator.children.length > 1) {
            this.foodIndicator.removeChildAt(1);
        }
        
        // Add visual indicator for each food type collected (up to the current strength)
        try {
            // The number of indicators to show (capped by capacity)
            const numIndicators = Math.min(this.collectedFoodTypes.length, this.capacity);
            
            for (let i = 0; i < numIndicators; i++) {
                const foodTypeIndex = Math.min(i, this.collectedFoodTypes.length - 1);
                const currentFoodType = this.collectedFoodTypes[foodTypeIndex];
                let indicatorColor = currentFoodType && currentFoodType.glowColor ? currentFoodType.glowColor : 0xFFFF99;
                
                const dotIndicator = new PIXI.Graphics();
                dotIndicator.beginFill(indicatorColor, 0.9);
                dotIndicator.drawCircle(0, 0, 2);
                dotIndicator.endFill();
                
                // Position in a circular pattern around the main food indicator
                // First indicator goes on top, others are arranged in a circle
                let angle, distance;
                if (i === 0 && numIndicators === 1) {
                    // Single item centered
                    angle = 0;
                    distance = 0;
                } else {
                    // Multiple items in a circle
                    angle = (i / numIndicators) * Math.PI * 2;
                    distance = 3;
                }
                
                dotIndicator.position.set(
                    Math.cos(angle) * distance,
                    Math.sin(angle) * distance
                );
                
                this.foodIndicator.addChild(dotIndicator);
            }
        } catch (error) {
            console.error("Error creating food indicator:", error);
        }
    }
    
    // Template method for applying speed modifier when carrying food
    applyCarryingSlowdown() {
        // No speed penalty when carrying food by default - maintain original speed
        this.speed = this.originalSpeed;
        
        // Also update the max velocity
        this.maxVelocity = this.speed * 1.5;
    }
    
    // Template method for dropping food - can be customized by subclasses
    dropFood() {
        // Calculate total value from all collected food types
        let totalValue = 0;
        let lastFoodType = null;
        
        if (this.collectedFoodTypes && this.collectedFoodTypes.length > 0) {
            // Sum up all the values
            for (let i = 0; i < this.collectedFoodTypes.length; i++) {
                const foodType = this.collectedFoodTypes[i];
                totalValue += foodType.value;
            }
            
            // Remember the last food type for visual effects
            lastFoodType = this.collectedFoodTypes[this.collectedFoodTypes.length - 1];
            
            // Clear the food types array
            this.collectedFoodTypes = [];
        } else {
            // Backward compatibility: if no food types stored, use base value
            totalValue = this.foodCollected;
        }
        
        // Reset food counters
        const collectedCount = this.foodCollected;
        this.foodCollected = 0;
        this.capacityWeight = 0;
        
        // Hide the food indicator
        this.foodIndicator.visible = false;
        
        // Restore original speed
        this.speed = this.originalSpeed;
        this.maxVelocity = this.speed * 1.5;
        
        // Reset velocity to prevent momentum carrying the ant away from the nest
        this.vx = 0;
        this.vy = 0;
        
        // Transition back to seeking food
        this.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
        
        // Return both the total value and the food count/type for effects
        return {
            totalValue: totalValue,
            count: collectedCount,
            lastFoodType: lastFoodType
        };
    }
    
    // Template method for updating speed multiplier - can be customized by subclasses
    updateSpeedMultiplier(multiplier) {
        this.originalSpeed = this.baseSpeed * multiplier * this.speedFactor;
        if (this.isAtFullCapacity) {
            this.applyCarryingSlowdown();
        } else {
            this.speed = this.originalSpeed;
            this.maxVelocity = this.speed * 1.5;
        }
    }
    
    // Method to increase ant's capacity
    increaseCapacity() {
        // Increment capacity by 1
        this.capacity++;
        
        // Update the configuration based on new capacity
        this.config.canStackFood = this.capacity > 1;
        
        // If the ant is already carrying food, update isAtFullCapacity based on new capacity
        if (this.foodCollected > 0) {
            // If we haven't reached capacity with the new capacity, allow collecting more food
            if (this.capacityWeight < this.capacity) {
                this.isAtFullCapacity = false;
            }
        }
    }
    
    // New method to update rotation smoothly with occasional sharp turns
    updateRotation() {
        if (this.vx !== 0 || this.vy !== 0) {
            // Calculate desired rotation based on movement direction
            // Add PI/2 because the sprite is facing up by default
            const desiredRotation = Math.atan2(this.vy, this.vx) + Math.PI / 2;
            
            // Normalize the target rotation to the shortest path
            this.targetRotation = desiredRotation;
            
            // Smoothly interpolate current rotation towards target rotation
            // Find the shortest angular distance
            let angleDiff = this.targetRotation - this.rotation;
            
            // Normalize to [-PI, PI]
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // Occasionally make sharp turns (5% chance)
            if (Math.random() < 0.05) {
                // Make a sharp turn by using a much higher turn speed (0.8-1.0)
                this.rotation += angleDiff * (0.8 + Math.random() * 0.2);
            } else {
                // Apply gradual rotation using the ant's normal turn speed
                this.rotation += angleDiff * this.turnSpeed;
            }
        }
    }
    
    // Add a helper method to check if any more food can be collected
    canCollectMoreFood(foods) {
        if (foods.length === 0) return false;
        
        // Simply check if we're at capacity
        return this.capacityWeight < this.capacity;
    }
    
    // Add a method to create eating effects while collecting heavy food
    createEatingEffect() {
        if (!this.collectionTarget) return;
        
        // Get the number of ants collecting this food
        const antCount = this.collectionTarget.getCollectingAntCount();
        
        // Increase effect frequency directly proportional to ant count
        // More ants = much more frequent effects to show increased collection speed
        const effectChance = Math.min(0.5, 0.1 * antCount);
        
        // Only create effects occasionally
        if (Math.random() < effectChance) {
            // Create small particles around the ant to indicate "eating"
            if (IdleAnts.app.effectManager) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 5 + Math.random() * 3;
                const x = this.x + Math.cos(angle) * distance;
                const y = this.y + Math.sin(angle) * distance;
                
                // Use food type color for the particle effect
                const color = this.collectionTarget.foodType ? this.collectionTarget.foodType.glowColor : 0xFFFF99;
                
                // Create smaller, faster eating effects
                const scale = 0.7;
                IdleAnts.app.effectManager.createFoodCollectEffect(x, y, color, scale);
                
                // If multiple ants, create a subtle connecting line to the food
                if (antCount > 1 && Math.random() < 0.2) {
                    this.createFoodConnectionLine();
                }
            }
        }
    }
    
    // Create a subtle line connecting the ant to the food
    createFoodConnectionLine() {
        if (!this.collectionTarget || !IdleAnts.app.effectManager) return;
        
        // Create a temporary graphics object
        const graphics = new PIXI.Graphics();
        
        // Use the food type color for the line
        const color = this.collectionTarget.foodType ? this.collectionTarget.foodType.glowColor : 0xFFFF99;
        
        // Draw a dashed line from ant to food
        const startX = this.x;
        const startY = this.y;
        const endX = this.collectionTarget.x;
        const endY = this.collectionTarget.y;
        
        // Draw with low alpha
        graphics.lineStyle(1, color, 0.3);
        
        // Create a dashed line effect
        const segments = 10;
        for (let i = 0; i < segments; i++) {
            if (i % 2 === 0) {
                const x1 = startX + (endX - startX) * (i / segments);
                const y1 = startY + (endY - startY) * (i / segments);
                const x2 = startX + (endX - startX) * ((i + 1) / segments);
                const y2 = startY + (endY - startY) * ((i + 1) / segments);
                
                graphics.moveTo(x1, y1);
                graphics.lineTo(x2, y2);
            }
        }
        
        // Add to the app stage
        IdleAnts.app.worldContainer.addChild(graphics);
        
        // Fade out and remove
        let alpha = 0.3;
        const fadeOut = () => {
            alpha -= 0.03;
            graphics.alpha = alpha;
            
            if (alpha <= 0) {
                IdleAnts.app.worldContainer.removeChild(graphics);
                return;
            }
            
            requestAnimationFrame(fadeOut);
        };
        
        fadeOut();
    }
    
    // Method to detect and resolve stuck ants
    checkIfStuck() {
        this.stuckCheckCounter++;
        
        // Check every 10 frames
        if (this.stuckCheckCounter >= 10) {
            const dx = this.x - this.lastPosition.x;
            const dy = this.y - this.lastPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If the ant hasn't moved much over the past 10 frames, it might be stuck
            if (distance < this.stuckThreshold) {
                // Add a small random adjustment to break out of potential stuck situations
                const angle = Math.random() * Math.PI * 2;
                const impulse = this.speed * 0.3;
                this.vx += Math.cos(angle) * impulse;
                this.vy += Math.sin(angle) * impulse;
                
                // Ensure the ant has at least a minimum speed
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed < this.minMovementSpeed) {
                    this.vx = (this.vx / speed) * this.minMovementSpeed;
                    this.vy = (this.vy / speed) * this.minMovementSpeed;
                }
            }
            
            // Save current position for next check
            this.lastPosition.x = this.x;
            this.lastPosition.y = this.y;
            this.stuckCheckCounter = 0;
        }
    }
    
    // State transition method
    transitionToState(newState) {
        // Debug logging for state transitions only when capacity is changing
        if (this.capacityWeight > 0) {
            console.log(`Ant state transition: ${this.state} -> ${newState}, Capacity=${this.capacity}, CurrentWeight=${this.capacityWeight}, FoodCollected=${this.foodCollected}`);
        }
        
        // Exit actions for current state
        switch (this.state) {
            case IdleAnts.Entities.AntBase.States.SPAWNING:
                // No special exit actions needed
                break;
                
            case IdleAnts.Entities.AntBase.States.COLLECTING_FOOD:
                // Clear collection variables
                this.isCollecting = false;
                this.collectionTimer = 0;
                
                // Remove this ant from the collecting ants list on the food
                if (this.collectionTarget) {
                    this.collectionTarget.removeCollectingAnt(this);
                    this.collectionTarget = null;
                }
                break;
                
            case IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST:
                // Reset the returning to nest timeout when leaving this state
                this.returningToNestTimeout = 0;
                break;
        }
        
        // Enter actions for new state
        switch (newState) {
            case IdleAnts.Entities.AntBase.States.SEEKING_FOOD:
                // Only reset targeting variables if we don't have any food OR we're returning from nest
                if (this.capacityWeight === 0 || this.state === IdleAnts.Entities.AntBase.States.DELIVERING_FOOD) {
                    this.targetFood = null;
                    this.collectionTarget = null;
                    
                    // When starting a new food search from the nest, add some random movement
                    if (this.state === IdleAnts.Entities.AntBase.States.DELIVERING_FOOD) {
                        const angle = Math.random() * Math.PI * 2;
                        const pushStrength = this.speed * 0.8;
                        this.vx = Math.cos(angle) * pushStrength;
                        this.vy = Math.sin(angle) * pushStrength;
                    }
                } else {
                    // After collecting food but still having capacity, 
                    // preserve momentum to continue searching in the same area
                    
                    // If velocity is too low, give a small push away from the last food position
                    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    if (currentSpeed < this.speed * 0.3 && this.lastFoodPickupPos) {
                        // Push away from the last food pickup position to search nearby
                        const dx = this.x - this.lastFoodPickupPos.x;
                        const dy = this.y - this.lastFoodPickupPos.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist > 0.1) {
                            // Push in the direction we were already moving away from the food
                            this.vx = (dx / dist) * this.speed * 0.5;
                            this.vy = (dy / dist) * this.speed * 0.5;
                        } else {
                            // If we're too close to the food, move in a random direction
                            const angle = Math.random() * Math.PI * 2;
                            this.vx = Math.cos(angle) * this.speed * 0.5;
                            this.vy = Math.sin(angle) * this.speed * 0.5;
                        }
                    }
                }
                break;
                
            case IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST:
                // Adjust speed when carrying food
                this.applyCarryingSlowdown();
                break;
                
            case IdleAnts.Entities.AntBase.States.DELIVERING_FOOD:
                // No need for velocity when delivering
                this.vx = 0;
                this.vy = 0;
                break;
                
            case IdleAnts.Entities.AntBase.States.FIGHTING:
                return this.updateFighting();
        }
        
        // Set the new state
        this.state = newState;
    }
    
    // Check if the ant is at full capacity
    isAtFullCapacity() {
        return this.capacityWeight >= this.capacity;
    }
    
    // Check if the ant can carry more food
    canCarryMoreFood() {
        // Always check capacity vs current weight
        return this.capacityWeight < this.capacity;
    }
    
    // Check if the ant has traveled far enough from pickup point
    hasMovedFarEnoughFromPickup() {
        // If no pickup position is recorded, allow deposit
        if (!this.lastFoodPickupPos) return true;
        
        // Calculate distance from pickup point
        const dx = this.x - this.lastFoodPickupPos.x;
        const dy = this.y - this.lastFoodPickupPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate distance from nest to pickup point
        const nestToPickupDx = this.nestPosition.x - this.lastFoodPickupPos.x;
        const nestToPickupDy = this.nestPosition.y - this.lastFoodPickupPos.y;
        const nestToPickupDistance = Math.sqrt(nestToPickupDx * nestToPickupDx + nestToPickupDy * nestToPickupDy);
        
        // If food was picked up very close to the nest (less than the minimum distance),
        // use a smaller threshold to prevent ants from getting stuck
        if (nestToPickupDistance < this.config.minDistanceToDepositFood) {
            // Use half the distance between nest and pickup as the minimum
            return distance >= (nestToPickupDistance / 2);
        }
        
        // Normal case - check against configured minimum distance
        return distance >= this.config.minDistanceToDepositFood;
    }
    
    updateFighting() {
        if(!this.targetEnemy || this.targetEnemy.isDead){
            this.targetEnemy = null;
            this.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
            return false;
        }
        // Freeze in place during combat
        this.vx = 0;
        this.vy = 0;
        // attack
        if(this._attackTimer>0){this._attackTimer--;}
        else{
            if(typeof this.targetEnemy.takeDamage==='function')
                this.targetEnemy.takeDamage(this.attackDamage);
            this._attackTimer=this.attackCooldown;
        }
        return false;
    }
}; 

// ===== src/entities/Ant.js =====
// src/entities/Ant.js
IdleAnts.Entities.Ant = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Call parent constructor with speed factor of 1 (regular ants)
        super(texture, nestPosition, speedMultiplier, 1);
        
        // CRITICAL: Ensure position is set directly at the nest
        this.x = nestPosition.x;
        this.y = nestPosition.y;
        
        // Leg animation variables
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.2;
        
        // Regular ants have randomized turn rates
        this.turnSpeed = 0.1 + Math.random() * 0.8; // Randomized between 0.1 and 0.9
    }
    
    // Implement type-specific visual elements
    createTypeSpecificElements() {
        // Create legs that can be animated
        this.createLegs();
    }
    
    createLegs() {
        // Create container for legs
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        // Create each pair of legs - positioned for bird's eye view
        this.legs = [];
        
        // Leg positions for bird's eye view - symmetrical
        const legPositions = [
            {x: -4, y: -8, side: 'left'},   // Left front leg
            {x: 4, y: -8, side: 'right'},   // Right front leg
            {x: -4, y: -2, side: 'left'},   // Left middle leg
            {x: 4, y: -2, side: 'right'},   // Right middle leg
            {x: -4, y: 4, side: 'left'},    // Left rear leg
            {x: 4, y: 4, side: 'right'}     // Right rear leg
        ];
        
        // Create each leg
        for (let i = 0; i < legPositions.length; i++) {
            const legPos = legPositions[i];
            const leg = new PIXI.Graphics();
            
            // Set leg properties
            leg.position.set(legPos.x, legPos.y);
            leg.baseX = legPos.x;
            leg.baseY = legPos.y;
            leg.index = Math.floor(i / 2); // 0, 0, 1, 1, 2, 2
            leg.side = legPos.side;
            
            // Draw initial leg
            this.drawLeg(leg);
            
            this.legsContainer.addChild(leg);
            this.legs.push(leg);
        }
    }
    
    drawLeg(leg) {
        leg.clear();
        leg.lineStyle(1.5, 0x2A1B10);
        
        // Draw leg extending outward from body - symmetrical for bird's eye view
        leg.moveTo(0, 0);
        if (leg.side === 'left') {
            leg.lineTo(-4, 2); // Left legs extend left and slightly down
        } else {
            leg.lineTo(4, 2); // Right legs extend right and slightly down
        }
    }
    
    // Implement ant-specific animation
    performAnimation() {
        this.animateLegs();
    }
    
    animateLegs() {
        // Update leg animation phase
        this.legPhase += this.legAnimationSpeed;
        
        // Speed-based animation rate - faster movement = faster leg movement
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const animationRate = Math.max(0.1, speed * 0.3);
        
        // Animate each leg with symmetrical movement
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            
            // Alternating leg movement pattern - opposite sides move in opposite phases
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') {
                phase += Math.PI; // Opposite phase for right legs
            }
            
            // Apply leg animation - symmetrical movement
            const legMovement = Math.sin(phase) * 2; // Full movement for both sides
            
            // Redraw the leg with animation
            leg.clear();
            leg.lineStyle(1.5, 0x2A1B10);
            leg.moveTo(0, 0);
            
            // Symmetrical leg animation for bird's eye view
            const bendFactor = Math.max(0, -Math.sin(phase)) * 0.8;
            
            if (leg.side === 'left') {
                const endX = -4 + legMovement;
                const endY = 2 + bendFactor;
                leg.lineTo(endX, endY);
            } else {
                const endX = 4 - legMovement; // Mirror the movement for right side
                const endY = 2 + bendFactor;
                leg.lineTo(endX, endY);
            }
        }
    }
}; 

// ===== src/entities/FlyingAnt.js =====
// src/entities/FlyingAnt.js
IdleAnts.Entities.FlyingAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Call parent constructor with speed factor of 2.5 (flying ants are 2.5x faster)
        super(texture, nestPosition, speedMultiplier, 2.5);
        
        // Initialize wing animation variables
        this.wingPhase = Math.random() * Math.PI * 2;
        this.wingAnimationSpeed = 0.5; // Wings flap faster than legs move
        
        // Override stuck detection settings for flying ants (more sensitive)
        this.minMovementSpeed = this.speed * 0.2; // Higher minimum speed for flying ants
        this.stuckThreshold = 0.5; // Lower threshold - flying ants should move more
        
        // Flying ants have randomized turn rates
        this.turnSpeed = 0.1 + Math.random() * 0.8; // Randomized between 0.1 and 0.9
        
        // Initialize stuck prevention with shorter delay for flying ants since they move faster
        this.stuckPrevention = { active: false, delay: 5 }; // Shorter delay than regular ants
    }
    
    // Override base scale for flying ants
    getBaseScale() {
        return 0.9 + Math.random() * 0.2; // Flying ants are closer to regular ant size
    }
    
    // Implement type-specific visual elements
    createTypeSpecificElements() {
        // Create wings
        this.createWings();
    }
    
    createWings() {
        // Create wing container
        this.wingsContainer = new PIXI.Container();
        this.addChild(this.wingsContainer);
        
        // Create simpler wings - just two small ovals
        // Create left wing
        this.leftWing = new PIXI.Graphics();
        this.leftWing.beginFill(0xFFFFFF, 0.6); // More transparent white
        this.leftWing.drawEllipse(0, 0, 5, 3); // Smaller wings
        this.leftWing.endFill();
        this.leftWing.position.set(-6, -2);
        
        // Create right wing
        this.rightWing = new PIXI.Graphics();
        this.rightWing.beginFill(0xFFFFFF, 0.6);
        this.rightWing.drawEllipse(0, 0, 5, 3);
        this.rightWing.endFill();
        this.rightWing.position.set(6, -2);
        
        // Add wings to container
        this.wingsContainer.addChild(this.leftWing);
        this.wingsContainer.addChild(this.rightWing);
    }
    
    // Implement flying ant specific animation
    performAnimation() {
        this.animateWings();
    }
    
    animateWings() {
        // Update wing animation phase
        this.wingPhase += this.wingAnimationSpeed;
        
        // Calculate wing flap animation values
        const wingFlap = Math.sin(this.wingPhase) * 0.6 + 0.4;
        
        // Apply wing flap animation
        this.leftWing.scale.y = wingFlap;
        this.rightWing.scale.y = wingFlap;
        
        // Slight vertical movement to simulate flight
        const hoverOffset = Math.sin(this.wingPhase * 0.2) * 2;
        this.y += (hoverOffset - this.lastHoverOffset || 0) * 0.1;
        this.lastHoverOffset = hoverOffset;
    }
    
    // Override wander method for more erratic flying ant movement
    wander() {
        // Random movement when wandering, more frequent direction changes for flying ants
        if (Math.random() < 0.1) { // 10% chance for flying ants vs 5% for regular ants
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        }
        
        // Add a small random variation to prevent getting stuck
        this.vx += (Math.random() - 0.5) * this.speed * 0.2;
        this.vy += (Math.random() - 0.5) * this.speed * 0.2;
        
        // Ensure minimum movement speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < this.minMovementSpeed) {
            this.vx = (this.vx / speed) * this.minMovementSpeed;
            this.vy = (this.vy / speed) * this.minMovementSpeed;
        }
    }
    
    // Override boundary handling for flying ants - they bounce instead of wrap
    handleBoundaries(width, height) {
        // Bounce off the sides with some random variation
        if (this.x < 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx) * (0.8 + Math.random() * 0.4);
        } else if (this.x > width) {
            this.x = width;
            this.vx = -Math.abs(this.vx) * (0.8 + Math.random() * 0.4);
        }
        
        // Flying ants can go slightly higher than regular ants
        if (this.y < -20) {
            this.y = -20;
            this.vy = Math.abs(this.vy) * (0.8 + Math.random() * 0.4);
        } else if (this.y > height) {
            this.y = height;
            this.vy = -Math.abs(this.vy) * (0.8 + Math.random() * 0.4);
        }
    }
}; 

// ===== src/entities/CarAnt.js =====
// src/entities/CarAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

IdleAnts.Entities.CarAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // CarAnts are super fast! Let's give them a high speedFactor.
        // Assuming FlyingAnts might be around 5-10, let's make this 15.
        super(texture, nestPosition, speedMultiplier, 5); // High speedFactor

        // CRITICAL: Ensure position is set directly at the nest
        this.x = nestPosition.x;
        this.y = nestPosition.y;

        // Car-specific properties
        this.wheelRotationSpeed = 0.5; // Radians per frame

        // Car ants might have a more fixed or different turn speed
        this.turnSpeed = 0.2; 
    }

    // Override to set a potentially different base scale for CarAnt
    getBaseScale() {
        return 0.9 + Math.random() * 0.2; // Slightly larger and less variable than default
    }

    createTypeSpecificElements() {
        // Create car body and wheels
        this.createCarBody();
        this.createWheels();
    }

    createCarBody() {
        this.carBody = new PIXI.Graphics();
        
        // Simple rectangular car body
        this.carBody.beginFill(0xFF0000); // Red color for the car
        this.carBody.drawRect(-15, -8, 30, 16); // Body size
        this.carBody.endFill();

        // Add a small "cabin"
        this.carBody.beginFill(0xCCCCCC); // Light grey for cabin
        this.carBody.drawRect(-8, -12, 16, 6); // Cabin on top
        this.carBody.endFill();
        
        this.addChild(this.carBody);
    }

    createWheels() {
        this.wheels = [];
        this.wheelsContainer = new PIXI.Container();
        this.addChild(this.wheelsContainer);

        const wheelRadius = 5;
        const wheelColor = 0x333333; // Dark grey for wheels

        // Wheel positions (relative to ant/car center)
        // [x, y]
        const wheelPositions = [
            [-10, 8], // Front-left
            [10, 8],  // Front-right
            [-10, -8], // Rear-left
            [10, -8]   // Rear-right
        ];

        wheelPositions.forEach(pos => {
            const wheel = new PIXI.Graphics();
            wheel.beginFill(wheelColor);
            wheel.drawCircle(0, 0, wheelRadius);
            wheel.endFill();

            // Add a small hubcap detail
            wheel.beginFill(0xAAAAAA);
            wheel.drawCircle(0, 0, wheelRadius * 0.4);
            wheel.endFill();

            wheel.position.set(pos[0], pos[1]);
            this.wheelsContainer.addChild(wheel);
            this.wheels.push(wheel);
        });
    }

    performAnimation() {
        this.animateWheels();
        this.createExhaustEffect(); // Add a little exhaust
    }

    animateWheels() {
        // Calculate current speed to modulate wheel animation speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const effectiveRotationSpeed = this.wheelRotationSpeed * (currentSpeed / this.speed); // Modulate by current speed vs max speed

        this.wheels.forEach(wheel => {
            wheel.rotation += effectiveRotationSpeed;
        });
    }

    createExhaustEffect() {
        // Occasionally create a small puff of "exhaust"
        if (Math.random() < 0.1 && IdleAnts.app.effectManager) { // 10% chance per frame
            const exhaustOffsetX = -18; // Relative to car center, towards the back
            const exhaustOffsetY = 0;

            // Rotate offset by car's rotation (this.rotation is body, ant faces right initially, PIXI up is 0)
            // Ant's visual rotation is this.rotation. Actual movement angle is Math.atan2(this.vy, this.vx)
            // For visual effect, align with the body. Sprite faces right.
            const angle = this.rotation - (Math.PI / 2); // Adjust because sprite is drawn facing up

            const worldExhaustX = this.x + (exhaustOffsetX * Math.cos(angle) - exhaustOffsetY * Math.sin(angle)) * this.scale.x;
            const worldExhaustY = this.y + (exhaustOffsetX * Math.sin(angle) + exhaustOffsetY * Math.cos(angle)) * this.scale.y;
            
            IdleAnts.app.effectManager.createEffect( // Using a generic effect for now
                worldExhaustX,
                worldExhaustY,
                [0xAAAAAA, 0x888888], // Greyish colors
                10, // particle count
                0.3, // minSize
                0.8, // maxSize
                0.5, // minDuration
                1.0, // maxDuration
                { x: -0.5, y: 0 }, // velocity (slightly backwards)
                0.1 // spread
            );
        }
    }

    // CarAnts might have different boundary handling, e.g., they don't just wrap around.
    // For now, uses AntBase's default. Can be overridden.
    // handleBoundaries(width, height) {
    //     super.handleBoundaries(width, height);
    // }
}; 

// ===== src/entities/QueenAnt.js =====
// src/entities/QueenAnt.js
IdleAnts.Entities.QueenAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Call parent constructor with speed factor of 0.3 (queen is much slower)
        super(texture, nestPosition, speedMultiplier, 0.3);
        
        // CRITICAL: Ensure position is set directly at the nest
        this.x = nestPosition.x;
        this.y = nestPosition.y;
        
        // Queen-specific properties
        this.isQueen = true;
        
        // Larvae production settings
        this.baseProductionRate = 30 * 60; // Base rate: 30 seconds at 60fps (0.5 minute) - FASTER!
        this.productionVariance = 15 * 60; // Variance: +/- 15 seconds (0.25 minute)
        this.setNextProductionTime(); // Initialize the first production time
        this.larvaeCounter = 0;
        this.larvaeCapacity = 3; // Maximum number of larvae that can be produced at once
        this.currentLarvae = 0;
        
        // Override stuck detection settings for queen (less sensitive)
        this.minMovementSpeed = this.speed * 0.1;
        this.stuckThreshold = 1.5;
        
        // Queen has slower turn rate
        this.turnSpeed = 0.05 + Math.random() * 0.1;
        
        // Scale the queen to be larger
        this.scale.set(1.5);
        
        // Override state to always be SPAWNING or near-nest state
        this.state = IdleAnts.Entities.AntBase.States.SPAWNING;
    }
    
    // Set a random production time for the next larvae
    setNextProductionTime() {
        // Random time between baseProductionRate ± productionVariance
        this.larvaeProductionRate = this.baseProductionRate + 
            Math.floor((Math.random() * 2 - 1) * this.productionVariance);
        
        // Ensure it's at least 1 minute (60 seconds = 3600 frames)
        this.larvaeProductionRate = Math.max(20 * 60, this.larvaeProductionRate); // Minimum 20 seconds
        
        // Log the next production time for debugging
        console.log(`Queen will produce next larvae in ${this.larvaeProductionRate/60} seconds (${this.larvaeProductionRate/3600} minutes)`);
    }
    
    // Override base scale for queen ant
    getBaseScale() {
        return 1.5; // Queen is larger than regular ants
    }
    
    // Implement type-specific visual elements
    createTypeSpecificElements() {
        // Create legs like regular ant
        this.createLegs();
    }
    
    createLegs() {
        // Create container for legs
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        // Create each pair of legs - these will be animated
        this.legs = [];
        
        // Leg positions (relative to ant center)
        const legPositions = [
            {x: 0, y: -8}, // Front legs
            {x: 0, y: -2}, // Middle legs
            {x: 0, y: 6}   // Rear legs
        ];
        
        // Create each pair of legs
        for (let i = 0; i < 3; i++) {
            // Left leg
            const leftLeg = new PIXI.Graphics();
            leftLeg.lineStyle(1.5, 0x2A1B10);
            leftLeg.moveTo(0, 0);
            leftLeg.lineTo(-8, -5);
            leftLeg.position.set(-5, legPositions[i].y);
            leftLeg.baseY = legPositions[i].y;
            leftLeg.index = i;
            leftLeg.side = 'left';
            
            // Right leg
            const rightLeg = new PIXI.Graphics();
            rightLeg.lineStyle(1.5, 0x2A1B10);
            rightLeg.moveTo(0, 0);
            rightLeg.lineTo(8, -5);
            rightLeg.position.set(5, legPositions[i].y);
            rightLeg.baseY = legPositions[i].y;
            rightLeg.index = i;
            rightLeg.side = 'right';
            
            this.legsContainer.addChild(leftLeg);
            this.legsContainer.addChild(rightLeg);
            
            this.legs.push(leftLeg, rightLeg);
        }
    }
    
    // Override update method to focus on larvae production and staying near nest
    update(nestPosition, foods) {
        // Store the nest position
        this.nestPosition = nestPosition;
        
        // Ensure health bar follows queen
        if (this.healthBarContainer) {
            this.healthBarContainer.x = this.x;
            this.healthBarContainer.y = this.y - 25;
            this.healthBarContainer.rotation = 0;
        }
        
        // Update movement
        this.updateMovement();
        
        // Update larvae production
        this.updateLarvaeProduction();
        
        // Update rotation based on movement direction
        this.updateRotation();
        
        // Perform animation
        this.performAnimation();
    }
    
    // Override to create queen-specific movement
    updateMovement() {
        // Calculate distance from nest
        const dx = this.x - this.nestPosition.x;
        const dy = this.y - this.nestPosition.y;
        const distanceFromNest = Math.sqrt(dx * dx + dy * dy);
        
        // Define the queen's territory - a ring around the nest
        const minDistance = 30; // Minimum distance from nest (inner ring)
        const maxDistance = 100; // Maximum distance from nest (outer ring)
        
        if (distanceFromNest > maxDistance) {
            // Too far from nest - move back toward nest
            const angleToNest = Math.atan2(this.nestPosition.y - this.y, this.nestPosition.x - this.x);
            this.vx = Math.cos(angleToNest) * this.speed * 1.5; // Faster return to territory
            this.vy = Math.sin(angleToNest) * this.speed * 1.5;
        } else if (distanceFromNest < minDistance) {
            // Too close to nest - move away from nest
            const angleFromNest = Math.atan2(this.y - this.nestPosition.y, this.x - this.nestPosition.x);
            this.vx = Math.cos(angleFromNest) * this.speed;
            this.vy = Math.sin(angleFromNest) * this.speed;
        } else {
            // Within the queen's territory - wander around
            this.wander();
            
            // Add a slight circular movement tendency to patrol around the nest
            const currentAngle = Math.atan2(dy, dx);
            const tangentialAngle = currentAngle + Math.PI / 2; // 90 degrees clockwise
            
            // Add a small tangential component to create a tendency to circle the nest
            this.vx += Math.cos(tangentialAngle) * this.speed * 0.1;
            this.vy += Math.sin(tangentialAngle) * this.speed * 0.1;
        }
        
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Apply momentum (damping)
        this.vx *= this.momentum;
        this.vy *= this.momentum;
    }
    
    updateLarvaeProduction() {
        // Sync capacity with global stats
        if (IdleAnts.app && IdleAnts.app.resourceManager) {
            this.larvaeCapacity = IdleAnts.app.resourceManager.stats.queenLarvaeCapacity;
        }
        
        // Check if the colony is at max capacity
        if (IdleAnts.app && IdleAnts.app.entityManager && 
            IdleAnts.app.resourceManager) {
            
            const currentAnts = IdleAnts.app.entityManager.entities.ants.length;
            const currentLarvae = IdleAnts.app.entityManager.entities.larvae.length;
            const maxAnts = IdleAnts.app.resourceManager.stats.maxAnts;
            
            // If colony is at or above max capacity accounting for existing larvae, don't produce
            if (currentAnts + currentLarvae >= maxAnts) {
                // Reset counter to avoid immediate production when space becomes available
                this.larvaeCounter = 0;
                return;
            }
        }
        
        // Increment larvae counter
        this.larvaeCounter++;
        
        // Check if it's time to produce larvae
        if (this.larvaeCounter >= this.larvaeProductionRate && this.currentLarvae < this.larvaeCapacity) {
            this.produceLarvae();
            this.larvaeCounter = 0;
            
            // Set a new random production time for the next larvae
            this.setNextProductionTime();
        }
    }
    
    produceLarvae() {
        // Double-check if the colony is at max capacity
        if (IdleAnts.app && IdleAnts.app.entityManager && 
            IdleAnts.app.resourceManager) {
            
            const currentAnts = IdleAnts.app.entityManager.entities.ants.length;
            const currentLarvae = IdleAnts.app.entityManager.entities.larvae.length;
            const maxAnts = IdleAnts.app.resourceManager.stats.maxAnts;
            
            // If colony is at max capacity, don't produce larvae
            if (currentAnts + currentLarvae >= maxAnts) {
                console.log("Cannot produce larvae: colony at maximum capacity");
                return;
            }
        }
        
        // Create a single larvae entity near the queen
        if (IdleAnts.app && IdleAnts.app.entityManager) {
            try {
                // Calculate how many larvae to spawn based on queen level
                const queenLevel = IdleAnts.app.resourceManager ? IdleAnts.app.resourceManager.stats.queenUpgradeLevel : 0;
                const larvaeToSpawn = 1 + queenLevel; // 1 at level 0, 2 at level 1, etc.
                
                console.log(`Queen level ${queenLevel} spawning ${larvaeToSpawn} larvae`);
                
                // Spawn multiple larvae based on queen level
                for(let i = 0; i < larvaeToSpawn; i++){
                    // Generate a random offset from the queen for each larvae
                    const angle = Math.random() * Math.PI * 2; // Random angle
                    const distance = 40 + Math.random() * 20; // Random distance between 40-60 pixels
                    const offsetX = Math.cos(angle) * distance;
                    const offsetY = Math.sin(angle) * distance;
                    
                    // Create a larvae entity at the offset position
                    IdleAnts.app.entityManager.produceLarvae(this.x + offsetX, this.y + offsetY);
                    
                    // Log for debugging
                    console.log(`Queen produced larvae ${i+1}/${larvaeToSpawn} at (${this.x + offsetX}, ${this.y + offsetY})`);
                }
                
                // Also create a special effect at the queen's position
                if (IdleAnts.app.effectManager) {
                    IdleAnts.app.effectManager.createSpawnEffect(this.x, this.y, false);
                }
                
                // Increment current larvae count by the number spawned
                this.currentLarvae += larvaeToSpawn;
                console.log(`Queen now has ${this.currentLarvae} larvae`);
            } catch (error) {
                console.error('Error creating larvae:', error);
            }
        }
    }
    
    // Implement queen-specific animation
    performAnimation() {
        this.animateLegs();
    }
    
    animateLegs() {
        // Update leg animation phase
        this.legPhase = (this.legPhase || 0) + 0.1; // Slower leg movement for queen
        
        // Speed-based animation rate - faster movement = faster leg movement
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const animationRate = Math.max(0.1, speed * 0.3);
        
        // Animate each leg
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            
            // Alternating leg movement pattern - opposite sides move in opposite phases
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') {
                phase += Math.PI; // Opposite phase for right legs
            }
            
            // Apply leg animation - a slight up and down movement
            const legMovement = Math.sin(phase) * 2;
            
            // For a walking motion, bend the legs when they're moving down
            if (leg.side === 'left') {
                leg.clear();
                leg.lineStyle(1.5, 0x2A1B10);
                leg.moveTo(0, 0);
                
                // Bend the leg differently based on the phase
                const bendFactor = Math.max(0, -Math.sin(phase));
                const midX = -4 - bendFactor * 2;
                const midY = legMovement - 2 - bendFactor * 2;
                leg.lineTo(midX, midY);
                leg.lineTo(-8, -5 + legMovement);
            } else {
                leg.clear();
                leg.lineStyle(1.5, 0x2A1B10);
                leg.moveTo(0, 0);
                
                // Bend the leg differently based on the phase
                const bendFactor = Math.max(0, -Math.sin(phase));
                const midX = 4 + bendFactor * 2;
                const midY = legMovement - 2 - bendFactor * 2;
                leg.lineTo(midX, midY);
                leg.lineTo(8, -5 + legMovement);
            }
        }
    }
    
    // Override wander method for more royal, deliberate movement
    wander() {
        // Queens move more deliberately with less random changes
        if (Math.random() < 0.01) { // 1% chance vs 5% for regular ants
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * this.speed * 0.5; // Slower wandering
            this.vy = Math.sin(angle) * this.speed * 0.5;
        }
        
        // Add a very small random variation to prevent getting stuck
        this.vx += (Math.random() - 0.5) * this.speed * 0.05;
        this.vy += (Math.random() - 0.5) * this.speed * 0.05;
    }
    
    // Override boundary handling for queen - stays closer to nest
    handleBoundaries(width, height) {
        // Standard boundary handling
        if (this.x < 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx);
        } else if (this.x > width) {
            this.x = width;
            this.vx = -Math.abs(this.vx);
        }
        
        if (this.y < 0) {
            this.y = 0;
            this.vy = Math.abs(this.vy);
        } else if (this.y > height) {
            this.y = height;
            this.vy = -Math.abs(this.vy);
        }
    }
    
    // Add method to handle rotation
    updateRotation() {
        // Only rotate if we're moving
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0.1) {
            // Calculate the angle of movement
            const targetAngle = Math.atan2(this.vy, this.vx) + Math.PI / 2; // Add 90 degrees because the ant sprite faces up
            
            // Initialize rotation if not set
            if (this.rotation === undefined) {
                this.rotation = targetAngle;
            }
            
            // Calculate the difference between current and target angle
            let angleDiff = targetAngle - this.rotation;
            
            // Normalize the angle difference to be between -PI and PI
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // Smooth rotation - interpolate towards the target angle
            // The lower the factor, the smoother (and slower) the rotation
            const rotationSpeed = 0.05; // Adjust this for smoother/slower rotation
            this.rotation += angleDiff * rotationSpeed;
        }
    }
}; 

// ===== src/entities/Larvae.js =====
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
            
            // If colony is at max capacity, postpone hatching and retry later
            if (currentAnts >= maxAnts) {
                console.log("Cannot hatch larvae now: colony at maximum capacity. Will retry in 10 seconds.");

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

// ===== src/entities/Food.js =====
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

// ===== src/entities/Nest.js =====
// src/entities/Nest.js
IdleAnts.Entities.Nest = class extends PIXI.Container {
    constructor(texture, x, y) {
        super();
        
        this.x = x;
        this.y = y;
        
        // Create the ant hill graphics
        this.createAntHill();
        
        // Animation properties
        this.animationTime = 0;
        this.baseScale = 1.0;
    }
    
    createAntHill() {
        // Main hill mound - bird's eye view
        this.hillBody = new PIXI.Graphics();
        
        // Outer ring - darkest brown (represents the excavated dirt ring)
        this.hillBody.beginFill(0x654321);
        this.hillBody.drawCircle(0, 0, 50); // Large outer circle
        this.hillBody.endFill();
        
        // Middle ring - medium brown
        this.hillBody.beginFill(0x8B4513);
        this.hillBody.drawCircle(0, 0, 35); // Medium circle
        this.hillBody.endFill();
        
        // Inner hill - lightest brown
        this.hillBody.beginFill(0xA0522D);
        this.hillBody.drawCircle(0, 0, 25); // Inner circle
        this.hillBody.endFill();
        
        // Central mound - raised center
        this.hillBody.beginFill(0xD2B48C);
        this.hillBody.drawCircle(0, 0, 15); // Central raised area
        this.hillBody.endFill();
        
        // Add texture with small dirt particles scattered around
        this.hillBody.lineStyle(0);
        this.hillBody.beginFill(0x5D4037, 0.6);
        for(let i = 0; i < 25; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 45; // Spread across the hill
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            this.hillBody.drawCircle(x, y, 1 + Math.random() * 2);
        }
        this.hillBody.endFill();
        
        // Add small rocks and debris
        this.hillBody.beginFill(0x696969, 0.8);
        for(let i = 0; i < 12; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 15 + Math.random() * 30;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            this.hillBody.drawCircle(x, y, 1.5 + Math.random() * 2);
        }
        this.hillBody.endFill();
        
        this.addChild(this.hillBody);
        
        // Create entrance tunnels
        this.createEntrances();
        
        // Add some grass around the hill
        this.createVegetation();
    }
    
    createEntrances() {
        // Main entrance - large tunnel opening in center
        this.mainEntrance = new PIXI.Graphics();
        this.mainEntrance.beginFill(0x2F1B14); // Very dark brown - tunnel interior
        this.mainEntrance.drawCircle(0, 0, 8); // Main entrance hole
        this.mainEntrance.endFill();
        
        // Add depth shadow
        this.mainEntrance.beginFill(0x1A0F0A, 0.8);
        this.mainEntrance.drawCircle(0, 0, 6); // Inner shadow
        this.mainEntrance.endFill();
        
        // Secondary entrances around the main one
        this.secondaryEntrance = new PIXI.Graphics();
        this.secondaryEntrance.beginFill(0x2F1B14);
        this.secondaryEntrance.drawCircle(-20, -10, 4); // Top-left entrance
        this.secondaryEntrance.drawCircle(18, 12, 3); // Bottom-right entrance
        this.secondaryEntrance.drawCircle(-8, 22, 3); // Bottom entrance
        this.secondaryEntrance.endFill();
        
        this.addChild(this.mainEntrance);
        this.addChild(this.secondaryEntrance);
    }
    
    createVegetation() {
        // Add small grass tufts around the hill - bird's eye view
        this.vegetation = new PIXI.Graphics();
        
        // Grass represented as small green circles/dots
        this.vegetation.lineStyle(0);
        this.vegetation.beginFill(0x228B22, 0.8);
        for(let i = 0; i < 15; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 45 + Math.random() * 15; // Around the outer edge
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            // Small grass clumps
            this.vegetation.drawCircle(x, y, 2 + Math.random() * 2);
            // Add smaller dots around for texture
            this.vegetation.drawCircle(x + Math.random() * 4 - 2, y + Math.random() * 4 - 2, 1);
        }
        this.vegetation.endFill();
        
        // Small flowers as tiny colored dots
        this.vegetation.beginFill(0xFFD700, 0.9); // Yellow flowers
        for(let i = 0; i < 6; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 10;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            this.vegetation.drawCircle(x, y, 1.5);
        }
        this.vegetation.endFill();
        
        // White flowers
        this.vegetation.beginFill(0xFFFAFA, 0.8);
        for(let i = 0; i < 4; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 48 + Math.random() * 12;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            this.vegetation.drawCircle(x, y, 1);
        }
        this.vegetation.endFill();
        
        this.addChild(this.vegetation);
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    update(delta = 1) {
        // Subtle breathing animation for the hill
        this.animationTime += delta * 0.02;
        const breathe = 1 + Math.sin(this.animationTime) * 0.008; // Very subtle 0.8% scale change
        this.scale.set(this.baseScale * breathe);
        
        // Occasionally make entrance tunnels "pulse" to show activity
        if(Math.random() < 0.002){ // Very rare
            this.pulseEntrance();
        }
    }
    
    pulseEntrance() {
        // Quick pulse animation for main entrance
        const originalAlpha = this.mainEntrance.alpha;
        this.mainEntrance.alpha = 0.7;
        
        // Restore after short time
        setTimeout(() => {
            if(this.mainEntrance) {
                this.mainEntrance.alpha = originalAlpha;
            }
        }, 150);
    }
    
    expand() {
        // Enhanced expansion animation
        const originalScale = this.baseScale;
        const targetScale = originalScale * 1.15; // Slightly larger expansion
        let progress = 0;
        
        const animateNest = () => {
            progress += 0.04; // Slower expansion
            
            if (progress >= 1) {
                this.baseScale = targetScale;
                this.scale.set(targetScale);
                
                // Add some particles when expansion completes
                this.createExpansionEffect();
                return;
            }
            
            // Smooth easing with slight bounce
            const easedProgress = Math.sin(progress * Math.PI / 2);
            const currentScale = originalScale + (targetScale - originalScale) * easedProgress;
            this.baseScale = currentScale;
            this.scale.set(currentScale);
            
            requestAnimationFrame(animateNest);
        };
        
        animateNest();
    }
    
    createExpansionEffect() {
        // Create small dirt particles flying out during expansion
        const particles = new PIXI.Graphics();
        
        for(let i = 0; i < 8; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 15;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particles.beginFill(0x8B4513, 0.8);
            particles.drawCircle(x, y, 1 + Math.random() * 1.5);
            particles.endFill();
        }
        
        this.addChild(particles);
        
        // Animate particles outward and fade
        let particleTime = 0;
        const animateParticles = () => {
            particleTime += 0.05;
            
            if(particleTime >= 1){
                this.removeChild(particles);
                return;
            }
            
            particles.alpha = 1 - particleTime;
            particles.scale.set(1 + particleTime * 0.5);
            
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }
} 

// ===== src/entities/FireAnt.js =====
// src/entities/FireAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// FireAnt – fast ground ant with fiery colouring
IdleAnts.Entities.FireAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Fire ants are 1.6× faster than regular ants
        super(texture, nestPosition, speedMultiplier, 1.3);

        // Bright red to visually distinguish Fire Ants
        this.tint = 0xFF0000;

        // Combat-related placeholders (future implementation)
        this.attackDamage = 6; // nerfed damage
        this.attackCooldown = 60; // frames
        this._attackTimer = 0;

        // Leg animation setup (reuse regular ant behaviour)
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.25;
    }

    // Override base scale slightly larger
    getBaseScale() {
        return 0.9 + Math.random() * 0.2;
    }

    // Create bright-red body overlay then legs
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
    }

    createBody() {
        const body = new PIXI.Graphics();

        // Abdomen
        body.beginFill(0xFF0000);
        body.drawEllipse(0, 8, 7, 10);
        body.endFill();

        // Thorax
        body.beginFill(0xD80000);
        body.drawEllipse(0, -2, 5, 7);
        body.endFill();

        // Head
        body.beginFill(0xB00000);
        body.drawCircle(0, -14, 5);
        body.endFill();

        // Simple eyes for contrast
        body.beginFill(0xFFFFFF);
        body.drawCircle(-2, -15, 1.2);
        body.drawCircle(2, -15, 1.2);
        body.endFill();

        this.addChild(body);
    }

    createLegs() {
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);

        this.legs = [];
        const legPositions = [ {x: 0, y: -8}, {x: 0, y: -2}, {x: 0, y: 6} ];

        for (let i = 0; i < 3; i++) {
            // Left leg
            const leftLeg = new PIXI.Graphics();
            leftLeg.lineStyle(1.5, 0x8B2500); // Darker orange
            leftLeg.moveTo(0, 0);
            leftLeg.lineTo(-8, -5);
            leftLeg.position.set(-5, legPositions[i].y);
            leftLeg.baseY = legPositions[i].y;
            leftLeg.index = i;
            leftLeg.side = 'left';

            // Right leg
            const rightLeg = new PIXI.Graphics();
            rightLeg.lineStyle(1.5, 0x8B2500);
            rightLeg.moveTo(0, 0);
            rightLeg.lineTo(8, -5);
            rightLeg.position.set(5, legPositions[i].y);
            rightLeg.baseY = legPositions[i].y;
            rightLeg.index = i;
            rightLeg.side = 'right';

            this.legsContainer.addChild(leftLeg);
            this.legsContainer.addChild(rightLeg);
            this.legs.push(leftLeg, rightLeg);
        }
    }

    performAnimation() {
        this.animateLegs();

        // Decrement attack timer if active (preparation for combat system)
        if (this._attackTimer > 0) this._attackTimer--;
    }

    animateLegs() {
        this.legPhase += this.legAnimationSpeed;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const animationRate = Math.max(0.1, speed * 0.35);

        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') phase += Math.PI;

            const legMovement = Math.sin(phase * animationRate) * 2;
            leg.clear();
            leg.lineStyle(1.5, 0x8B2500);
            leg.moveTo(0, 0);

            const bendFactor = Math.max(0, -Math.sin(phase));
            const midX = (leg.side === 'left' ? -4 : 4) - bendFactor * 2 * (leg.side === 'left' ? 1 : -1);
            const midY = legMovement - 2 - bendFactor * 2;
            const endX = (leg.side === 'left' ? -8 : 8);
            leg.lineTo(midX, midY);
            leg.lineTo(endX, -5 + legMovement);
        }
    }

    // Placeholder for future combat bite action
    bite(target) {
        if (this._attackTimer === 0) {
            // TODO: integrate with CombatManager to apply damage to target
            this._attackTimer = this.attackCooldown;
        }
    }
}; 

// ===== src/entities/Enemy.js =====
// src/entities/Enemy.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

IdleAnts.Entities.Enemy = class extends PIXI.Sprite {
    constructor(texture, mapBounds) {
        super(texture);
        this.anchor.set(0.5);
        this.scale.set(0.8 + Math.random()*0.3);

        this.mapBounds = mapBounds;
        this.speed = 1 + Math.random();
        this.vx = 0; this.vy = 0;

        // Health
        this.maxHp = 40;
        this.hp = this.maxHp;
        this.createHealthBar();
        this.healthBarTimer = 0;

        // Combat
        this.attackDamage = 5;
        this.attackRange = 15;
        this.attackCooldown = 60;
        this._attackTimer = 0;

        // AI perception and chasing
        this.perceptionRange = 150;
        this.targetAnt = null;

        // Random start position
        this.x = Math.random()*mapBounds.width;
        this.y = Math.random()*mapBounds.height;
    }

    createHealthBar() {
        this.healthBarContainer = new PIXI.Container();
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(this.healthBarContainer);
        } else {
            this.addChild(this.healthBarContainer);
        }

        this.healthBarBg = new PIXI.Graphics();
        this.healthBarBg.beginFill(0x000000,0.6);
        this.healthBarBg.drawRect(-10,0,20,3);
        this.healthBarBg.endFill();
        this.healthBarContainer.addChild(this.healthBarBg);

        this.healthBarFg = new PIXI.Graphics();
        this.healthBarContainer.addChild(this.healthBarFg);
        this.updateHealthBar();
        this.healthBarContainer.visible=false;
    }

    updateHealthBar() {
        const ratio = Math.max(this.hp,0)/this.maxHp;
        this.healthBarFg.clear();
        this.healthBarFg.beginFill(0xFF0000);
        this.healthBarFg.drawRect(-10,0,20*ratio,3);
        this.healthBarFg.endFill();
        this.healthBarContainer.visible=true;
        this.healthBarTimer=1800;
        this.healthBarContainer.x = this.x;
        this.healthBarContainer.y = this.y - 20;
        this.healthBarContainer.rotation = 0;
    }

    takeDamage(dmg){
        this.hp -= dmg;
        this.updateHealthBar();
        if(this.hp<=0) this.die();
    }

    die(){
        if(this.parent) this.parent.removeChild(this);
        this.isDead=true;
        if(this.healthBarContainer && this.healthBarContainer.parent){
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
        }
    }

    update(ants){
        // Acquire or validate target ant within perception range
        if(!this.targetAnt || this.targetAnt.isDead){
            this.targetAnt=null;
            let nearest=null,distSq=Infinity;
            ants.forEach(a=>{
                const dx=a.x-this.x; const dy=a.y-this.y; const d=dx*dx+dy*dy;
                if(d<distSq && Math.sqrt(d)<=this.perceptionRange){nearest=a;distSq=d;}
            });
            if(nearest) this.targetAnt=nearest;
        }

        // If locked on, adjust direction towards target
        if(this.targetAnt && !this.targetAnt.isDead){
            const dx=this.targetAnt.x-this.x;
            const dy=this.targetAnt.y-this.y;
            const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist>0){
                this.vx = (dx/dist)*this.speed;
                this.vy = (dy/dist)*this.speed;
            }
        }

        // Simple wander
        if(!this.targetAnt && Math.random()<0.02){
            const ang=Math.random()*Math.PI*2;
            this.vx=Math.cos(ang)*this.speed;
            this.vy=Math.sin(ang)*this.speed;
        }
        this.x+=this.vx;
        this.y+=this.vy;
        // Boundaries
        if(this.x<0||this.x>this.mapBounds.width) this.vx*=-1;
        if(this.y<0||this.y>this.mapBounds.height) this.vy*=-1;

        // Attack nearest ant
        if(this._attackTimer>0) this._attackTimer--;
        if(this.targetAnt){
            const dx=this.targetAnt.x-this.x; const dy=this.targetAnt.y-this.y; const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<=this.attackRange){
                // stop moving while attacking
                this.vx = this.vy = 0;
                if(this._attackTimer===0){
                    this.targetAnt.takeDamage(this.attackDamage);
                    this._attackTimer=this.attackCooldown;
                }
            }
        }

        if(this.healthBarTimer>0){
            this.healthBarTimer--; if(this.healthBarTimer===0){this.healthBarContainer.visible=false;}
        }

        if(this.healthBarContainer){
            this.healthBarContainer.x = this.x;
            this.healthBarContainer.y = this.y - 20;
            this.healthBarContainer.rotation = 0;
        }
    }
}; 

// ===== src/entities/GrasshopperEnemy.js =====
// src/entities/GrasshopperEnemy.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

IdleAnts.Entities.GrasshopperEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        // Replace placeholder texture with empty so only graphics show
        this.texture = PIXI.Texture.EMPTY;
        // Add custom body graphics
        this.createBody();

        this.scale.set(2.0); // big
        this.speed = 2.0; // faster crawl speed
        this.attackDamage = 10;
        this.maxHp = 200;
        this.hp=this.maxHp;
        this.updateHealthBar();

        // Hopping behaviour
        this.hopCooldown = 180; // frames between hops (~3s)
        this.hopTimer = Math.floor(Math.random()*this.hopCooldown);
        this.hopSpeed = 20; // velocity applied during hop

        // Leg animation parameters
        this.legPhase = Math.random()*Math.PI*2;
        this.legAnimationSpeed = 0.1;
    }

    update(ants){
        // If we have a target ant from base logic, hop towards it
        if(this.targetAnt && !this.targetAnt.isDead){
            if(this.hopTimer>0){this.hopTimer--;}
            else{
                const dx=this.targetAnt.x-this.x;
                const dy=this.targetAnt.y-this.y;
                const dist=Math.sqrt(dx*dx+dy*dy);
                if(dist>0){
                    this.vx = (dx/dist)*this.hopSpeed;
                    this.vy = (dy/dist)*this.hopSpeed;
                }
                this.hopTimer=this.hopCooldown;
            }
        } else {
            // Random hop wander when no target
            if(this.hopTimer>0){this.hopTimer--;}
            else {
                const ang=Math.random()*Math.PI*2;
                this.vx=Math.cos(ang)*this.hopSpeed;
                this.vy=Math.sin(ang)*this.hopSpeed;
                this.hopTimer=this.hopCooldown;
            }
        }
        // Apply friction
        this.vx*=0.95; this.vy*=0.95;
        // Rotate sprite toward movement direction
        if(Math.abs(this.vx) + Math.abs(this.vy) > 0.1){
            this.rotation = Math.atan2(this.vy,this.vx) + Math.PI/2;
        }
        // animate legs each frame
        if(this.legs) this.animateLegs();
        super.update(ants);

        if(this.targetAnt && !this.targetAnt.isDead){
            const dx2=this.targetAnt.x-this.x;
            const dy2=this.targetAnt.y-this.y;
            const dist2=Math.sqrt(dx2*dx2+dy2*dy2);
            if(dist2<=this.attackRange){
                this.vx=this.vy=0;
                if(this._attackTimer===0){
                    this.targetAnt.takeDamage(this.attackDamage);
                    this._attackTimer=this.attackCooldown;
                }
            }
        }
    }

    createBody(){
        // Container for legs (drawn first so body sits on top)
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);

        // Create legs similar to ant style but scaled up
        this.legs = [];
        const shellCol = 0x2E7D32;
        const legBaseYs = [ -2, 2, 8 ]; // front, middle, hind

        legBaseYs.forEach((y, idx)=>{
            // left leg
            const left = new PIXI.Graphics();
            left.lineStyle(1.8, shellCol);
            left.position.set(-5, y);
            left.index = idx;
            left.side = 'left';
            this.legsContainer.addChild(left);
            this.legs.push(left);

            // right leg
            const right = new PIXI.Graphics();
            right.lineStyle(1.8, shellCol);
            right.position.set(5, y);
            right.index = idx;
            right.side = 'right';
            this.legsContainer.addChild(right);
            this.legs.push(right);
        });

        const body = new PIXI.Graphics();
        // Realistic grasshopper colors
        const bodyGreen = 0x7CB342; // bright leaf green
        const darkGreen = 0x558B2F;
        const lightGreen = 0x9CCC65;
        const brownAccent = 0x8D6E63;
        
        // Long, segmented abdomen (grasshoppers have elongated bodies)
        body.beginFill(bodyGreen);
        body.drawEllipse(0, 12, 6, 20); // longer, narrower
        body.endFill();
        
        // Abdomen segments
        body.lineStyle(1, darkGreen, 0.6);
        for(let i = 0; i < 5; i++){
            const y = 2 + i * 4;
            body.moveTo(-5, y);
            body.lineTo(5, y);
        }
        
        // Thorax (prothorax + mesothorax)
        body.lineStyle(0);
        body.beginFill(darkGreen);
        body.drawEllipse(0, -2, 5, 8);
        body.endFill();
        
        // Wing covers (elytra) - grasshoppers have prominent wing covers
        body.beginFill(brownAccent, 0.8);
        body.drawEllipse(-3, 8, 2, 12);
        body.drawEllipse(3, 8, 2, 12);
        body.endFill();
        
        // Wing membrane hints
        body.beginFill(0xFFFFFF, 0.3);
        body.drawEllipse(-3, 10, 1.5, 8);
        body.drawEllipse(3, 10, 1.5, 8);
        body.endFill();
        
        // Head - more angular, realistic shape
        body.beginFill(bodyGreen);
        body.drawPolygon([
            -4, -12,  // left side
            -3, -18,  // left top
            0, -20,   // tip
            3, -18,   // right top
            4, -12,   // right side
            2, -8,    // right bottom
            -2, -8    // left bottom
        ]);
        body.endFill();
        
        // Large compound eyes (grasshoppers have very prominent eyes)
        body.beginFill(0x000000);
        body.drawEllipse(-3, -15, 2, 3); // larger, oval eyes
        body.drawEllipse(3, -15, 2, 3);
        body.endFill();
        
        // Eye highlights
        body.beginFill(0xFFFFFF, 0.4);
        body.drawCircle(-3, -16, 0.8);
        body.drawCircle(3, -16, 0.8);
        body.endFill();
        
        // Mandibles/mouth parts
        body.beginFill(brownAccent);
        body.drawEllipse(0, -10, 1, 2);
        body.endFill();
        
        // Long antennae (grasshoppers have thread-like antennae)
        const antennae = new PIXI.Graphics();
        antennae.lineStyle(1.2, darkGreen);
        // Left antenna - curved
        antennae.moveTo(-2, -18);
        antennae.lineTo(-4, -26);
        antennae.lineTo(-7, -32);
        antennae.lineTo(-8, -38);
        // Right antenna - curved
        antennae.moveTo(2, -18);
        antennae.lineTo(4, -26);
        antennae.lineTo(7, -32);
        antennae.lineTo(8, -38);
        
        // Thorax markings
        body.lineStyle(1, lightGreen, 0.7);
        body.moveTo(-4, -8);
        body.lineTo(4, -8);
        body.moveTo(-3, -4);
        body.lineTo(3, -4);

        // Add components in order
        this.addChild(body);
        this.addChild(antennae);
    }

    animateLegs(){
        this.legPhase += this.legAnimationSpeed;
        const speedMag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        const rate = Math.max(0.05, speedMag*0.25);
        this.legPhase += rate;

        const shellCol = 0x2E7D32;
        const scale = 1.8;

        this.legs.forEach(leg=>{
            const phase = this.legPhase + (leg.index*Math.PI/3) + (leg.side==='right'?Math.PI:0);
            const move = Math.sin(phase)*2.5;
            const bend = Math.max(0, -Math.sin(phase));

            leg.clear();
            // Hind legs are much thicker and more prominent
            const thickness = leg.index === 2 ? 3 : 1.8;
            leg.lineStyle(thickness, shellCol);
            leg.moveTo(0,0);

            let midX, midY, endX, endY;
            if(leg.side==='left'){
                midX = (leg.index===2 ? -6 : -4)*scale - bend*2;
                midY = move - 2 - bend*2;
                endX = (leg.index===2 ? -14 : -8)*scale; // hind much longer
                endY = (leg.index===2 ? 18 : 6)*scale/3 + move;
            } else {
                midX = (leg.index===2 ? 6 : 4)*scale + bend*2;
                midY = move - 2 - bend*2;
                endX = (leg.index===2 ? 14 : 8)*scale;
                endY = (leg.index===2 ? 18 : 6)*scale/3 + move;
            }
            leg.lineTo(midX, midY);
            leg.lineTo(endX, endY);
            
            // Add femur (thigh) segment for hind legs
            if(leg.index === 2){
                leg.lineStyle(4, 0x689F38); // thicker, darker green femur
                const femurEndX = leg.side==='left' ? -3*scale : 3*scale;
                const femurEndY = 2 + move*0.5;
                leg.moveTo(0, 0);
                leg.lineTo(femurEndX, femurEndY);
            }
        });
    }
}; 

// ===== src/entities/WoollyBearEnemy.js =====
// src/entities/WoollyBearEnemy.js
if(typeof IdleAnts==='undefined') IdleAnts={};
if(typeof IdleAnts.Entities==='undefined') IdleAnts.Entities={};

// Woolly Bear caterpillar enemy – slow crawler, modest damage
IdleAnts.Entities.WoollyBearEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        // override graphic: draw caterpillar body
        this.texture = PIXI.Texture.EMPTY;
        this.createBody();
        this.scale.set(1.0);
        this.speed = 0.5;
        this.attackDamage = 4;
        this.maxHp = 60;
        this.hp = this.maxHp;
        this.updateHealthBar();
    }

    createBody(){
        this.segments = [];
        const segmentCount = 10; // more segments for realism
        const segmentRadius = 3.5;
        
        // Realistic woolly bear colors
        const rustBrown = 0x8B4513;
        const darkBrown = 0x654321;
        const blackBand = 0x2F1B14;
        const fuzzyOrange = 0xFF8C00;
        
        for(let i=0;i<segmentCount;i++){
            const seg = new PIXI.Graphics();
            
            // Realistic woolly bear pattern: black ends, rusty middle
            let baseColor;
            if(i < 2 || i >= segmentCount-2){
                baseColor = blackBand; // black ends
            } else {
                baseColor = rustBrown; // rusty brown middle
            }
            
            // Main segment body
            seg.beginFill(baseColor);
            seg.drawEllipse(0, 0, segmentRadius, segmentRadius*0.8); // slightly flattened
            seg.endFill();
            
            // Add fuzzy texture with small bristles
            seg.beginFill(fuzzyOrange, 0.6);
            for(let j = 0; j < 12; j++){
                const angle = (j / 12) * Math.PI * 2;
                const bristleX = Math.cos(angle) * (segmentRadius + 1);
                const bristleY = Math.sin(angle) * (segmentRadius*0.8 + 1);
                seg.drawCircle(bristleX, bristleY, 0.4);
            }
            seg.endFill();
            
            // Inner fuzzy texture
            const innerFuzz = (i < 2 || i >= segmentCount-2) ? 0x8B4513 : fuzzyOrange;
            seg.beginFill(innerFuzz, 0.4);
            for(let j = 0; j < 8; j++){
                const angle = (j / 8) * Math.PI * 2;
                const fuzzX = Math.cos(angle) * (segmentRadius * 0.6);
                const fuzzY = Math.sin(angle) * (segmentRadius * 0.5);
                seg.drawCircle(fuzzX, fuzzY, 0.3);
            }
            seg.endFill();
            
            // Segment lines for definition
            seg.lineStyle(0.8, darkBrown, 0.7);
            seg.drawEllipse(0, 0, segmentRadius*0.8, segmentRadius*0.6);
            
            seg.x = (i - segmentCount/2) * (segmentRadius*1.6);
            this.addChild(seg);
            this.segments.push(seg);
        }
        
        // Enhanced head with more detail
        this.head = new PIXI.Graphics();
        
        // Head capsule
        this.head.beginFill(blackBand);
        this.head.drawEllipse(0, 0, segmentRadius*1.3, segmentRadius);
        this.head.endFill();
        
        // Head texture/fuzz
        this.head.beginFill(darkBrown, 0.5);
        for(let i = 0; i < 8; i++){
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * segmentRadius;
            const y = Math.sin(angle) * segmentRadius * 0.7;
            this.head.drawCircle(x, y, 0.4);
        }
        this.head.endFill();
        
        // Large compound eyes (more prominent)
        this.head.beginFill(0x000000);
        this.head.drawEllipse(-2.5, -1, 1.8, 2.2);
        this.head.drawEllipse(2.5, -1, 1.8, 2.2);
        this.head.endFill();
        
        // Eye highlights
        this.head.beginFill(0xFFFFFF, 0.8);
        this.head.drawCircle(-2.5, -1.2, 0.8);
        this.head.drawCircle(2.5, -1.2, 0.8);
        this.head.endFill();
        
        // Pupils
        this.head.beginFill(0x000000);
        this.head.drawCircle(-2.5, -1, 0.4);
        this.head.drawCircle(2.5, -1, 0.4);
        this.head.endFill();
        
        // Mandibles/mouth
        this.head.beginFill(darkBrown);
        this.head.drawEllipse(0, 1.5, 1.5, 1);
        this.head.endFill();
        
        // Simple antennae
        this.head.lineStyle(1, darkBrown);
        this.head.moveTo(-1.5, -2);
        this.head.lineTo(-2.5, -4);
        this.head.moveTo(1.5, -2);
        this.head.lineTo(2.5, -4);
        
        // Prolegs (caterpillar feet) - small dots along bottom
        this.head.lineStyle(0);
        this.head.beginFill(darkBrown);
        for(let i = 0; i < 4; i++){
            const x = -1.5 + i;
            this.head.drawCircle(x, segmentRadius*0.8, 0.3);
        }
        this.head.endFill();
        
        // Position head at front
        this.head.x = -(segmentCount/2)*segmentRadius*1.6 - segmentRadius*1.2;
        this.addChild(this.head);
        
        this.segmentPhase = 0;
    }

    update(nestPos,foods,playerAnts){
        // Basic AI similar to former EnemyAnt: chase nearest ant
        if(!this.targetAnt || this.targetAnt.isDead){
            let nearest=null, distSq=Infinity;
            playerAnts.forEach(a=>{
                const dx=a.x-this.x, dy=a.y-this.y, d=dx*dx+dy*dy;
                if(d<distSq && d<=this.perceptionRange*this.perceptionRange){nearest=a;distSq=d;}
            });
            this.targetAnt = nearest;
        }

        if(this.targetAnt){
            const dx=this.targetAnt.x-this.x, dy=this.targetAnt.y-this.y;
            const dist=Math.hypot(dx,dy);
            if(dist>0){
                this.vx=(dx/dist)*this.speed;
                this.vy=(dy/dist)*this.speed;
            }
        } else if(Math.random()<0.02){
            const ang=Math.random()*Math.PI*2;
            this.vx=Math.cos(ang)*this.speed;
            this.vy=Math.sin(ang)*this.speed;
        }

        // move
        this.x+=this.vx; this.y+=this.vy;

        // Smooth rotation towards movement direction
        if(Math.abs(this.vx)+Math.abs(this.vy) > 0.1){
            // Graphic oriented with head toward -X, so add PI to face velocity
            this.rotation = Math.atan2(this.vy,this.vx)+Math.PI;
        }

        // Animate segment wiggle to simulate crawling
        if(this.segments){
            this.segmentPhase += 0.15; // slower, more realistic
            const amp = 2; // slightly more pronounced
            const wavelength = 0.8; // tighter wave for caterpillar motion
            
            this.segments.forEach((seg,idx)=>{
                // Undulating wave motion - each segment follows the one in front
                const wave = Math.sin(this.segmentPhase + idx*wavelength)*amp;
                seg.y = wave;
                
                // Slight compression/extension effect for realism
                const compress = Math.cos(this.segmentPhase + idx*wavelength)*0.1 + 1;
                seg.scale.x = compress;
                
                // Rotate segments slightly to follow the wave
                const nextIdx = Math.min(idx + 1, this.segments.length - 1);
                const prevWave = Math.sin(this.segmentPhase + (idx-1)*wavelength)*amp;
                const nextWave = Math.sin(this.segmentPhase + nextIdx*wavelength)*amp;
                seg.rotation = (nextWave - prevWave) * 0.1;
            });
            
            // Head follows the motion more naturally
            if(this.segments.length > 0){
                this.head.y = this.segments[0].y * 0.8; // slightly less movement
                this.head.rotation = this.segments[0].rotation * 0.5;
            }
        }

        // Attack
        if(this._attackTimer>0) this._attackTimer--;
        if(this.targetAnt){
            if(Math.hypot(this.targetAnt.x-this.x, this.targetAnt.y-this.y) <= this.attackRange){
                this.vx=this.vy=0;
                if(this._attackTimer===0){
                    this.targetAnt.takeDamage(this.attackDamage);
                    this._attackTimer=this.attackCooldown;
                }
            }
        }

        // stay within bounds
        if(this.x<0||this.x>this.mapBounds.width) this.vx*=-1;
        if(this.y<0||this.y>this.mapBounds.height) this.vy*=-1;

        super.update(playerAnts);
    }
}; 

// ===== src/entities/CricketEnemy.js =====
// src/entities/CricketEnemy.js
if(typeof IdleAnts==='undefined') IdleAnts={};
if(typeof IdleAnts.Entities==='undefined') IdleAnts.Entities={};

// Fast-moving hopping cricket enemy
IdleAnts.Entities.CricketEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        // Use custom drawn body
        this.texture = PIXI.Texture.EMPTY;
        this.createBody();

        // Stats – faster, lower HP than grasshopper
        this.speed = 1.8;
        this.hopSpeed = 15;            // pixels per frame burst
        this.maxHp = 50;
        this.hp = this.maxHp;
        this.attackDamage = 5;
        this.updateHealthBar();

        // Hop behaviour
        this.hopCooldown = 120; // 2 s
        this.hopTimer = Math.floor(Math.random()*this.hopCooldown);
    }

    createBody(){
        const g = new PIXI.Graphics();
        // Realistic cricket colors
        const cricketBrown = 0x8B4513;
        const darkBrown = 0x654321;
        const lightBrown = 0xA0522D;
        const blackBrown = 0x2F1B14;
        
        // Cricket body - more elongated and realistic
        g.beginFill(cricketBrown);
        g.drawEllipse(0, 2, 5, 12); // longer, narrower body
        g.endFill();
        
        // Body segments
        g.lineStyle(0.8, darkBrown, 0.6);
        for(let i = 0; i < 4; i++){
            const y = -4 + i * 4;
            g.moveTo(-4, y);
            g.lineTo(4, y);
        }
        
        // Thorax
        g.lineStyle(0);
        g.beginFill(darkBrown);
        g.drawEllipse(0, -6, 4, 6);
        g.endFill();
        
        // Wing covers (tegmina) - crickets have prominent wings
        g.beginFill(lightBrown, 0.8);
        g.drawEllipse(-2, 0, 1.5, 8);
        g.drawEllipse(2, 0, 1.5, 8);
        g.endFill();
        
        // Wing texture
        g.lineStyle(0.5, darkBrown, 0.4);
        g.moveTo(-2, -4);
        g.lineTo(-2, 6);
        g.moveTo(2, -4);
        g.lineTo(2, 6);
        
        // Head - more realistic cricket head shape
        g.lineStyle(0);
        g.beginFill(lightBrown);
        g.drawEllipse(0, -12, 3.5, 5);
        g.endFill();
        
        // Large compound eyes - crickets have prominent eyes
        g.beginFill(0x000000);
        g.drawEllipse(-2.5, -12, 1.5, 2);
        g.drawEllipse(2.5, -12, 1.5, 2);
        g.endFill();
        
        // Eye highlights
        g.beginFill(0xFFFFFF, 0.6);
        g.drawCircle(-2.5, -12.5, 0.6);
        g.drawCircle(2.5, -12.5, 0.6);
        g.endFill();
        
        // Maxillary palps (mouth parts)
        g.beginFill(darkBrown);
        g.drawEllipse(0, -9, 1, 1.5);
        g.endFill();
        
        // Create animated legs
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        this.legs = [];
        const legPositions = [-8, -2, 6]; // front, middle, hind
        
        legPositions.forEach((baseY, idx) => {
            // Left leg
            const leftLeg = new PIXI.Graphics();
            leftLeg.position.set(-4, baseY);
            leftLeg.index = idx;
            leftLeg.side = 'left';
            this.legsContainer.addChild(leftLeg);
            this.legs.push(leftLeg);
            
            // Right leg
            const rightLeg = new PIXI.Graphics();
            rightLeg.position.set(4, baseY);
            rightLeg.index = idx;
            rightLeg.side = 'right';
            this.legsContainer.addChild(rightLeg);
            this.legs.push(rightLeg);
        });
        
        // Long antennae - cricket characteristic
        const antennae = new PIXI.Graphics();
        antennae.lineStyle(1.2, darkBrown);
        // Left antenna - long and curved
        antennae.moveTo(-1.5, -15);
        antennae.lineTo(-4, -22);
        antennae.lineTo(-7, -28);
        antennae.lineTo(-9, -35);
        // Right antenna - long and curved
        antennae.moveTo(1.5, -15);
        antennae.lineTo(4, -22);
        antennae.lineTo(7, -28);
        antennae.lineTo(9, -35);
        
        // Antenna segments
        antennae.lineStyle(0);
        antennae.beginFill(darkBrown);
        antennae.drawCircle(-4, -22, 0.4);
        antennae.drawCircle(-7, -28, 0.4);
        antennae.drawCircle(4, -22, 0.4);
        antennae.drawCircle(7, -28, 0.4);
        antennae.endFill();
        
        this.addChild(g);
        this.addChild(antennae);
        
        // Animation parameters
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.2; // faster than other insects
    }

    update(ants){
        // Animate legs
        if(this.legs) this.animateLegs();
        
        // Target selection handled by base Enemy update later, but we need hopping motion first
        if(this.hopTimer>0){this.hopTimer--;}
        else{
            // Pick new direction – toward target ant if available else random
            let dx,dy;
            if(this.targetAnt && !this.targetAnt.isDead){
                dx=this.targetAnt.x-this.x; dy=this.targetAnt.y-this.y;
            } else {
                const ang=Math.random()*Math.PI*2; dx=Math.cos(ang); dy=Math.sin(ang);
            }
            const d=Math.hypot(dx,dy);
            if(d>0){
                this.vx=(dx/d)*this.hopSpeed;
                this.vy=(dy/d)*this.hopSpeed;
            }
            this.hopTimer=this.hopCooldown;
        }

        // Apply friction to gradually slow until next hop
        this.vx*=0.9; this.vy*=0.9;

        // Rotate toward movement
        if(Math.abs(this.vx)+Math.abs(this.vy)>0.1){
            this.rotation=Math.atan2(this.vy,this.vx)+Math.PI/2;
        }

        super.update(ants);
    }

    animateLegs(){
        this.legPhase += this.legAnimationSpeed;
        const speedMag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        const rate = Math.max(0.1, speedMag*0.3); // more responsive to speed
        this.legPhase += rate;

        const legColor = 0x654321;
        const scale = 1.5; // cricket legs are proportionally long

        this.legs.forEach(leg => {
            const phase = this.legPhase + (leg.index * Math.PI/3) + (leg.side==='right' ? Math.PI : 0);
            const move = Math.sin(phase) * 2;
            const bend = Math.max(0, -Math.sin(phase) * 0.7);

            leg.clear();
            
            // Hind legs are much more powerful for jumping
            const thickness = leg.index === 2 ? 2.5 : 1.5;
            leg.lineStyle(thickness, legColor);
            leg.moveTo(0, 0);

            let midX, midY, endX, endY;
            if(leg.side === 'left'){
                midX = (leg.index === 2 ? -5 : -3) * scale - bend * 2;
                midY = move - 1 - bend * 2;
                endX = (leg.index === 2 ? -10 : -6) * scale; // hind legs much longer
                endY = (leg.index === 2 ? 12 : 4) * scale/2 + move;
            } else {
                midX = (leg.index === 2 ? 5 : 3) * scale + bend * 2;
                midY = move - 1 - bend * 2;
                endX = (leg.index === 2 ? 10 : 6) * scale;
                endY = (leg.index === 2 ? 12 : 4) * scale/2 + move;
            }
            
            // Draw femur
            leg.lineTo(midX, midY);
            
            // Draw tibia - thinner for front/mid, thick for hind
            leg.lineStyle(leg.index === 2 ? 2 : 1.2, legColor);
            leg.lineTo(endX, endY);
            
            // Add tarsal segments (feet)
            if(leg.index === 2){
                leg.lineStyle(1.5, 0x8B4513);
                const footX = endX + (leg.side === 'left' ? -1.5 : 1.5);
                const footY = endY + 1.5;
                leg.lineTo(footX, footY);
            }
        });
    }
}; 

// ===== src/entities/MantisEnemy.js =====
// src/entities/MantisEnemy.js
if(typeof IdleAnts==='undefined') IdleAnts={};
if(typeof IdleAnts.Entities==='undefined') IdleAnts.Entities={};

// Large, powerful praying mantis enemy
IdleAnts.Entities.MantisEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        this.texture = PIXI.Texture.EMPTY;
        this.createBody();
        this.scale.set(2.5); // Larger and more intimidating than grasshopper (which is 2.0)

        // Stats – slow but deadly
        this.speed = 1.0;
        this.dashSpeed = 5;
        this.attackDamage = 20;
        this.attackRange = 25;
        this.maxHp = 300;
        this.hp = this.maxHp;
        this.updateHealthBar();

        // Dash/cooldown for pounce
        this.dashCooldown = 240; // every 4 seconds
        this.dashTimer = Math.floor(Math.random()*this.dashCooldown);

        // Leg animation parameters
        this.legPhase = Math.random()*Math.PI*5;
        this.legAnimationSpeed = 0.03; // slower stride
    }

    createBody(){
        const g = new PIXI.Graphics();
        // Realistic mantis colors - browns and greens
        const mantisGreen = 0x4A7C59;
        const darkGreen = 0x2E4F3A;
        const lightGreen = 0x6B8E5A;
        const brownTone = 0x8B7355;
        const eyeColor = 0x1B5E20;
        
        g.lineStyle(0);
        
        // Long, narrow abdomen with realistic segmentation
        g.beginFill(mantisGreen);
        g.drawEllipse(0, 18, 5, 32); // very long and thin
        g.endFill();
        
        // Abdomen segments - mantises have distinct segments
        g.lineStyle(1, darkGreen, 0.7);
        for(let i = 0; i < 7; i++){
            const y = -4 + i * 6;
            g.moveTo(-4, y);
            g.lineTo(4, y);
        }
        
        // Wing covers (tegmina) - mantises have leathery forewings
        g.lineStyle(0);
        g.beginFill(brownTone, 0.9);
        g.drawEllipse(-2, 12, 1.5, 18);
        g.drawEllipse(2, 12, 1.5, 18);
        g.endFill();
        
        // Wing membrane hints
        g.beginFill(0xFFFFFF, 0.2);
        g.drawEllipse(-2, 14, 1, 14);
        g.drawEllipse(2, 14, 1, 14);
        g.endFill();
        
        // Prothorax (elongated neck segment) - key mantis feature
        g.beginFill(lightGreen);
        g.drawEllipse(0, -8, 4, 12);
        g.endFill();
        
        // Mesothorax and metathorax
        g.beginFill(mantisGreen);
        g.drawEllipse(0, 2, 5, 8);
        g.endFill();
        
        // Realistic triangular head with proper proportions
        g.beginFill(lightGreen);
        g.drawPolygon([
            -6, -18,   // left wide base
            -4, -26,   // left upper
            -2, -32,   // left top
            0, -34,    // apex
            2, -32,    // right top
            4, -26,    // right upper
            6, -18,    // right wide base
            3, -14,    // right neck
            -3, -14    // left neck
        ]);
        g.endFill();
        
        // Large compound eyes - mantises have excellent vision
        g.beginFill(eyeColor);
        g.drawEllipse(-4, -24, 2.5, 4); // large, prominent eyes
        g.drawEllipse(4, -24, 2.5, 4);
        g.endFill();
        
        // Eye highlights and pupils
        g.beginFill(0x000000);
        g.drawEllipse(-4, -24, 1.5, 2.5);
        g.drawEllipse(4, -24, 1.5, 2.5);
        g.endFill();
        
        g.beginFill(0xFFFFFF, 0.6);
        g.drawCircle(-4, -25, 0.8);
        g.drawCircle(4, -25, 0.8);
        g.endFill();
        
        // Ocelli (simple eyes) - three dots on top of head
        g.beginFill(0x000000);
        g.drawCircle(-1, -30, 0.5);
        g.drawCircle(0, -32, 0.5);
        g.drawCircle(1, -30, 0.5);
        g.endFill();
        
        // Mandibles and mouth parts
        g.beginFill(brownTone);
        g.drawEllipse(0, -16, 1.5, 3);
        g.endFill();
        
        // Neck markings
        g.lineStyle(1, darkGreen, 0.5);
        g.moveTo(-3, -16);
        g.lineTo(3, -16);
        g.moveTo(-2, -12);
        g.lineTo(2, -12);

        // Enhanced raptorial arms (praying mantis signature feature)
        const makeArm = (dir)=>{
            const s = dir; // -1 left, 1 right
            const arm = new PIXI.Graphics();
            
            // Coxa (base segment)
            arm.beginFill(lightGreen);
            arm.drawEllipse(s*2, -10, 2, 4);
            arm.endFill();
            
            // Femur (upper arm) - thick and powerful
            arm.beginFill(mantisGreen);
            arm.drawPolygon([
                s*1, -8,
                s*5, -10,
                s*12, -22,
                s*8, -20
            ]);
            arm.endFill();

            // Tibia (forearm) with spines
            arm.beginFill(darkGreen);
            arm.drawPolygon([
                s*12, -22,
                s*15, -28,
                s*20, -50,
                s*17, -48,
                s*13, -30
            ]);
            arm.endFill();

            // Spines on tibia
            arm.lineStyle(1.5, 0x1B5E20);
            for(let i = 0; i < 4; i++){
                const spineY = -25 - i * 6;
                arm.moveTo(s*15, spineY);
                arm.lineTo(s*18, spineY - 2);
            }
            
            // Tarsus (claw) - curved and sharp
            arm.lineStyle(0);
            arm.beginFill(0x8B4513); // brown claw
            arm.drawPolygon([
                s*20, -50,
                s*26, -62,
                s*22, -58,
                s*18, -52
            ]);
            arm.endFill();
            
            // Claw tip highlight
            arm.beginFill(0xFFFFFF, 0.3);
            arm.drawCircle(s*24, -60, 1);
            arm.endFill();

            return arm;
        };

        const armL = makeArm(-1);
        const armR = makeArm(1);

        /* draw body first, then arms so they render on top */
        this.addChild(g);
        this.addChild(armL);
        this.addChild(armR);

        // Hind legs will be animated — create container and leg graphics
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);

        const shellCol = 0x2E7D32;
        this.hindLegs = [];

        // left hind leg
        const leftLeg = new PIXI.Graphics();
        leftLeg.position.set(-3,8);
        this.legsContainer.addChild(leftLeg);
        this.hindLegs.push({g:leftLeg,side:'left'});

        // right hind leg
        const rightLeg = new PIXI.Graphics();
        rightLeg.position.set(3,8);
        this.legsContainer.addChild(rightLeg);
        this.hindLegs.push({g:rightLeg,side:'right'});

        // Long, thread-like antennae (mantis characteristic)
        const antG = new PIXI.Graphics();
        antG.lineStyle(1.2, darkGreen);
        // Left antenna - curved and segmented
        antG.moveTo(-2, -32);
        antG.lineTo(-5, -42);
        antG.lineTo(-9, -50);
        antG.lineTo(-11, -58);
        // Right antenna - curved and segmented  
        antG.moveTo(2, -32);
        antG.lineTo(5, -42);
        antG.lineTo(9, -50);
        antG.lineTo(11, -58);
        
        // Antenna segments
        antG.lineStyle(2, darkGreen);
        antG.drawCircle(-3, -36, 0.5);
        antG.drawCircle(-7, -46, 0.5);
        antG.drawCircle(3, -36, 0.5);
        antG.drawCircle(7, -46, 0.5);
        this.addChild(antG);
    }

    update(ants){
        // Animate hind legs
        if(this.hindLegs) this.animateLegs();

        if(this.dashTimer>0){this.dashTimer--;}
        else{
            // Dash toward closest ant if any
            if(this.targetAnt && !this.targetAnt.isDead){
                const dx=this.targetAnt.x-this.x, dy=this.targetAnt.y-this.y;
                const d=Math.hypot(dx,dy);
                if(d>0){
                    this.vx=(dx/d)*this.dashSpeed;
                    this.vy=(dy/d)*this.dashSpeed;
                }
            }
            this.dashTimer=this.dashCooldown;
        }

        // friction
        this.vx*=0.92; this.vy*=0.92;
        // rotate to movement
        if(Math.abs(this.vx)+Math.abs(this.vy)>0.1){
            this.rotation=Math.atan2(this.vy,this.vx)+Math.PI/2;
        }
        super.update(ants);
    }

    animateLegs(){
        this.legPhase += this.legAnimationSpeed;
        const speedMag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        const rate = Math.max(0.02, speedMag*0.12); // slower, more deliberate
        this.legPhase += rate;

        const legColor = 0x4A7C59; // match body color
        const scale = 2.2; // longer, more elegant legs

        this.hindLegs.forEach((legObj,idx)=>{
            const legG = legObj.g;
            const side = legObj.side;
            const phase = this.legPhase + (idx*Math.PI); 
            const lift = Math.sin(phase)*2; // more subtle movement
            const bend = Math.max(0, -Math.sin(phase)*0.8); // less pronounced bend

            legG.clear();
            legG.lineStyle(2.5, legColor); // thicker legs
            legG.moveTo(0,0);

            // Mantis legs are longer and more graceful
            let midX, midY, endX, endY;
            if(side==='left'){
                midX = -8*scale - bend*3;
                midY = 8*scale/6 + lift - bend*3;
                endX = -16*scale; // much longer reach
                endY = 22*scale/6 + lift;
            } else {
                midX = 8*scale + bend*3;
                midY = 8*scale/6 + lift - bend*3;
                endX = 16*scale;
                endY = 22*scale/6 + lift;
            }
            
            // Draw femur (thigh)
            legG.lineStyle(3, legColor);
            legG.lineTo(midX, midY);
            
            // Draw tibia (shin) - thinner
            legG.lineStyle(2, 0x2E4F3A);
            legG.lineTo(endX, endY);
            
            // Add tarsus (foot) segments
            legG.lineStyle(1.5, 0x2E4F3A);
            const footX = endX + (side==='left' ? -2 : 2);
            const footY = endY + 2;
            legG.lineTo(footX, footY);
        });
    }
}; 

// ===== src/entities/BeeEnemy.js =====
// src/entities/BeeEnemy.js
if(typeof IdleAnts==='undefined') IdleAnts={};
if(typeof IdleAnts.Entities==='undefined') IdleAnts.Entities={};

// Flying bee enemy: moderate power, wanders and chases ants
IdleAnts.Entities.BeeEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        this.texture = PIXI.Texture.EMPTY;
        this.createBody();
        this.createWings();
        this.scale.set(1.4);

        // Stats
        this.speed = 2.0;
        this.attackDamage = 8;
        this.maxHp = 80;
        this.hp = this.maxHp;
        this.updateHealthBar();

        // Flight bobbing
        this.bobPhase = Math.random()*Math.PI*2;

        // wing animation
        this.wingPhase = Math.random()*Math.PI*2;
        this.wingAnimationSpeed = 0.6;
    }

    createBody(){
        const g = new PIXI.Graphics();
        // Realistic bee colors
        const beeYellow = 0xFFD700;
        const beeBlack = 0x2C1810;
        const darkBrown = 0x8B4513;
        const fuzzyYellow = 0xFFF8DC;
        
        // Bee head - rounded but slightly flattened
        g.beginFill(beeBlack);
        g.drawEllipse(0, -14, 5, 6);
        g.endFill();
        
        // Fuzzy texture on head
        g.beginFill(darkBrown, 0.3);
        for(let i = 0; i < 8; i++){
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 3;
            const y = -14 + Math.sin(angle) * 4;
            g.drawCircle(x, y, 0.8);
        }
        g.endFill();
        
        // Thorax - fuzzy and robust
        g.beginFill(beeBlack);
        g.drawEllipse(0, -4, 6, 8);
        g.endFill();
        
        // Fuzzy thorax texture
        g.beginFill(fuzzyYellow, 0.4);
        for(let i = 0; i < 12; i++){
            const x = (Math.random() - 0.5) * 10;
            const y = -4 + (Math.random() - 0.5) * 12;
            g.drawCircle(x, y, 0.6);
        }
        g.endFill();
        
        // Abdomen with realistic bee stripes
        const abdomColors = [beeYellow, beeBlack, beeYellow, beeBlack, beeYellow];
        abdomColors.forEach((color, idx) => {
            g.beginFill(color);
            const y = 4 + idx * 3;
            const width = 5 - idx * 0.3; // tapers toward end
            g.drawEllipse(0, y, width, 2.5);
            g.endFill();
        });
        
        // Fuzzy abdomen texture
        g.beginFill(fuzzyYellow, 0.2);
        for(let i = 0; i < 6; i++){
            const x = (Math.random() - 0.5) * 8;
            const y = 6 + Math.random() * 8;
            g.drawCircle(x, y, 0.4);
        }
        g.endFill();
        
        // Large compound eyes
        g.beginFill(0x000000);
        g.drawEllipse(-4, -14, 2, 3);
        g.drawEllipse(4, -14, 2, 3);
        g.endFill();
        
        // Eye highlights
        g.beginFill(0xFFFFFF, 0.6);
        g.drawCircle(-4, -15, 0.8);
        g.drawCircle(4, -15, 0.8);
        g.endFill();
        
        // Antennae - elbowed like real bees
        const antennae = new PIXI.Graphics();
        antennae.lineStyle(1.5, beeBlack);
        // Left antenna
        antennae.moveTo(-2, -17);
        antennae.lineTo(-4, -22);
        antennae.lineTo(-6, -26);
        // Right antenna
        antennae.moveTo(2, -17);
        antennae.lineTo(4, -22);
        antennae.lineTo(6, -26);
        
        // Antenna segments
        antennae.lineStyle(2, beeBlack);
        antennae.drawCircle(-4, -22, 0.8);
        antennae.drawCircle(4, -22, 0.8);
        
        // Proboscis (feeding tube)
        g.beginFill(darkBrown);
        g.drawEllipse(0, -10, 0.8, 2);
        g.endFill();
        
        this.addChild(g);
        this.addChild(antennae);
    }

    createWings(){
        this.wingsContainer = new PIXI.Container();
        this.addChild(this.wingsContainer);

        this.leftWing = new PIXI.Graphics();
        this.leftWing.beginFill(0xFFFFFF,0.6);
        this.leftWing.drawEllipse(0,0,7,4);
        this.leftWing.endFill();
        this.leftWing.position.set(-8,-4);

        this.rightWing = new PIXI.Graphics();
        this.rightWing.beginFill(0xFFFFFF,0.6);
        this.rightWing.drawEllipse(0,0,7,4);
        this.rightWing.endFill();
        this.rightWing.position.set(8,-4);

        this.wingsContainer.addChild(this.leftWing);
        this.wingsContainer.addChild(this.rightWing);
    }

    update(ants){
        // slight vertical bob
        this.bobPhase += 0.25;
        this.y += Math.sin(this.bobPhase)*0.4;

        // Wing flap animation
        this.wingPhase += this.wingAnimationSpeed;
        const flap = Math.sin(this.wingPhase)*0.5 + 0.5;
        if(this.leftWing){
            this.leftWing.scale.y = flap;
            this.rightWing.scale.y = flap;
        }

        // Call base movement/AI after adjusting bobbing offset so collision is consistent
        super.update(ants);

        // Rotate sprite toward movement direction so bee faces travel vector
        const speedMag = Math.abs(this.vx) + Math.abs(this.vy);
        if(speedMag > 0.1){
            this.rotation = Math.atan2(this.vy, this.vx) + Math.PI/2;
        }

        // Wings now rotate with the bee because container inherits rotation
    }
}; 

// ===== src/entities/HerculesBeetleEnemy.js =====
// src/entities/HerculesBeetleEnemy.js
if(typeof IdleAnts==='undefined') IdleAnts={};
if(typeof IdleAnts.Entities==='undefined') IdleAnts.Entities={};

// Hercules beetle enemy – tanky powerhouse between grasshopper and mantis
IdleAnts.Entities.HerculesBeetleEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        this.texture = PIXI.Texture.EMPTY;
        this.createBody();
        this.scale.set(2.2); // bigger than grasshopper, smaller than mantis

        // Combat stats (between grasshopper and mantis)
        this.speed = 1.2;
        this.chargeSpeed = 12; // dash/charge speed
        this.attackDamage = 15;
        this.attackRange = 22;
        this.maxHp = 230;
        this.hp = this.maxHp;
        this.updateHealthBar();

        // charge behaviour timers
        this.chargeCooldown = 260; // ~4.3 seconds
        this.chargeTimer = Math.floor(Math.random()*this.chargeCooldown);

        // Leg animation parameters
        this.legPhase = Math.random()*Math.PI*2;
        this.legAnimationSpeed = 0.1; // slower gait than ants
    }

    createBody(){
        const g = new PIXI.Graphics();
        // Realistic hercules beetle colors with metallic sheen
        const shellCol = 0x2F1B14; // very dark brown/black
        const metallicSheen = 0x8B4513; // bronze highlights
        const hornCol = 0x1A0F0A; // almost black horns
        const lightBrown = 0x654321;
        
        // Elytra (wing covers) - characteristic beetle feature
        g.beginFill(shellCol);
        g.drawEllipse(0, 12, 8, 22); // main shell
        g.endFill();
        
        // Elytra seam line down the middle
        g.lineStyle(1, 0x000000, 0.8);
        g.moveTo(0, -2);
        g.lineTo(0, 28);
        
        // Elytra texture lines (beetle wing cover ridges)
        g.lineStyle(0.8, metallicSheen, 0.4);
        for(let i = -1; i <= 1; i += 2){
            g.moveTo(i * 3, 2);
            g.lineTo(i * 3, 26);
            g.moveTo(i * 6, 4);
            g.lineTo(i * 6, 24);
        }
        
        // Metallic highlights on elytra
        g.lineStyle(0);
        g.beginFill(metallicSheen, 0.3);
        g.drawEllipse(-2, 8, 2, 8);
        g.drawEllipse(2, 8, 2, 8);
        g.endFill();
        
        // Pronotum (thorax shield)
        g.beginFill(shellCol);
        g.drawEllipse(0, -6, 7, 10);
        g.endFill();
        
        // Pronotum markings and texture
        g.lineStyle(1, metallicSheen, 0.5);
        g.drawEllipse(0, -6, 5, 7); // inner outline
        g.moveTo(-4, -10);
        g.lineTo(4, -10);
        g.moveTo(-3, -2);
        g.lineTo(3, -2);
        
        // Head capsule - more angular for realism
        g.lineStyle(0);
        g.beginFill(lightBrown);
        g.drawPolygon([
            -5, -14,  // left side
            -4, -20,  // left upper
            0, -22,   // top center
            4, -20,   // right upper
            5, -14,   // right side
            3, -12,   // right lower
            -3, -12   // left lower
        ]);
        g.endFill();
        
        // Head texture
        g.beginFill(metallicSheen, 0.2);
        for(let i = 0; i < 6; i++){
            const x = (Math.random() - 0.5) * 6;
            const y = -17 + (Math.random() - 0.5) * 6;
            g.drawCircle(x, y, 0.5);
        }
        g.endFill();
        
        // Compound eyes - small but visible
        g.beginFill(0x000000);
        g.drawEllipse(-3, -18, 1.5, 2);
        g.drawEllipse(3, -18, 1.5, 2);
        g.endFill();
        
        // Eye highlights
        g.beginFill(0xFFFFFF, 0.4);
        g.drawCircle(-3, -18, 0.6);
        g.drawCircle(3, -18, 0.6);
        g.endFill();
        
        // Mandibles (jaws)
        g.beginFill(hornCol);
        g.drawPolygon([
            -2, -14,
            -4, -16,
            -3, -12
        ]);
        g.drawPolygon([
            2, -14,
            4, -16,
            3, -12
        ]);
        g.endFill();
        
        // Enhanced twin horns - Hercules beetle's signature feature
        // Upper horn (larger, more detailed)
        const upperHorn = new PIXI.Graphics();
        upperHorn.beginFill(hornCol);
        upperHorn.drawPolygon([
            -4, -18,   // base left
             4, -18,   // base right
             8, -42,   // mid right
             0, -58,   // tip
            -8, -42    // mid left
        ]);
        upperHorn.endFill();
        
        // Horn ridges and texture
        upperHorn.lineStyle(1, metallicSheen, 0.6);
        upperHorn.moveTo(-2, -22);
        upperHorn.lineTo(0, -50);
        upperHorn.moveTo(2, -22);
        upperHorn.lineTo(0, -50);

        // Lower horn (smaller, more curved)
        const lowerHorn = new PIXI.Graphics();
        lowerHorn.beginFill(hornCol);
        lowerHorn.drawPolygon([
            -3, -18,   // base left
             3, -18,   // base right
             8,  6,    // downward mid
             0, 12,    // lower tip
            -8,  6     // mid left
        ]);
        lowerHorn.endFill();
        
        // Lower horn ridges
        lowerHorn.lineStyle(1, metallicSheen, 0.4);
        lowerHorn.moveTo(-1, -14);
        lowerHorn.lineTo(0, 8);
        lowerHorn.moveTo(1, -14);
        lowerHorn.lineTo(0, 8);

        // Short, club-like antennae (beetle characteristic)
        const antennae = new PIXI.Graphics();
        antennae.lineStyle(1.5, lightBrown);
        // Left antenna
        antennae.moveTo(-2, -20);
        antennae.lineTo(-4, -26);
        // Right antenna
        antennae.moveTo(2, -20);
        antennae.lineTo(4, -26);
        
        // Antenna clubs
        antennae.lineStyle(0);
        antennae.beginFill(lightBrown);
        antennae.drawEllipse(-4, -28, 1.5, 3);
        antennae.drawEllipse(4, -28, 1.5, 3);
        antennae.endFill();

        // Legs – create animated legs similar to ants but larger
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);

        this.legs = [];
        const legPositions = [ -6, 2, 12 ]; // Y positions for front, middle, hind

        legPositions.forEach((baseY, idx)=>{
            // left leg
            const leftLeg = new PIXI.Graphics();
            leftLeg.lineStyle(2, shellCol);
            leftLeg.position.set(-8, baseY);
            leftLeg.baseY = baseY;
            leftLeg.index = idx;
            leftLeg.side = 'left';
            this.legsContainer.addChild(leftLeg);
            this.legs.push(leftLeg);

            // right leg
            const rightLeg = new PIXI.Graphics();
            rightLeg.lineStyle(2, shellCol);
            rightLeg.position.set(8, baseY);
            rightLeg.baseY = baseY;
            rightLeg.index = idx;
            rightLeg.side = 'right';
            this.legsContainer.addChild(rightLeg);
            this.legs.push(rightLeg);
        });

        // Add all components
        this.addChild(g);
        this.addChild(antennae);
        this.addChild(upperHorn);
        this.addChild(lowerHorn);
    }

    update(ants){
        // Animate legs each frame
        if(this.legs) this.animateLegs();

        // Handle charge dash toward target ant
        if(this.chargeTimer>0){
            this.chargeTimer--; // cooldown counting down
        }else{
            if(this.targetAnt && !this.targetAnt.isDead){
                const dx=this.targetAnt.x-this.x;
                const dy=this.targetAnt.y-this.y;
                const d=Math.hypot(dx,dy);
                if(d>0){
                    this.vx=(dx/d)*this.chargeSpeed;
                    this.vy=(dy/d)*this.chargeSpeed;
                }
            }
            this.chargeTimer=this.chargeCooldown;
        }

        // Apply friction to movement
        this.vx*=0.93;
        this.vy*=0.93;

        // Rotate body toward movement direction
        if(Math.abs(this.vx)+Math.abs(this.vy)>0.1){
            this.rotation = Math.atan2(this.vy,this.vx) + Math.PI/2;
        }

        // call Enemy base update (handles targeting, combat, boundaries, etc.)
        super.update(ants);
    }

    animateLegs(){
        // Update leg phase
        this.legPhase += this.legAnimationSpeed;

        // Movement speed influence
        const speedMag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        const animationRate = Math.max(0.05, speedMag * 0.2);
        this.legPhase += animationRate;

        // For each leg graphic recreate shape
        this.legs.forEach(leg=>{
            const phase = this.legPhase + (leg.index * Math.PI / 3) + (leg.side==='right'?Math.PI:0);
            const legMove = Math.sin(phase) * 3; // amplitude
            const bendFactor = Math.max(0, -Math.sin(phase));

            leg.clear();
            leg.lineStyle(2, 0x4E342E);
            leg.moveTo(0,0);
            let midX, midY, endX, endY;
            const scale = 2; // bigger than ants
            if(leg.side==='left'){
                midX = -4*scale - bendFactor*3;
                midY = legMove - 2 - bendFactor*3;
                endX = -8*scale;
                endY = -5*scale/2 + legMove;
            } else {
                midX = 4*scale + bendFactor*3;
                midY = legMove - 2 - bendFactor*3;
                endX = 8*scale;
                endY = -5*scale/2 + legMove;
            }
            leg.lineTo(midX, midY);
            leg.lineTo(endX, endY);
        });
    }
}; 

// ===== src/entities/FrogEnemy.js =====
// src/entities/FrogEnemy.js
IdleAnts.Entities.FrogEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture, mapBounds) {
        super(texture, mapBounds);
        
        // Hide just the base texture, not the entire sprite
        this.texture = PIXI.Texture.EMPTY; // Use empty/transparent texture instead
        
        // Frog-specific properties
        this.scale.set(2.0); // Slightly bigger than cricket (1.5), smaller than grasshopper (2.0)
        this.tint = 0x228B22; // Forest green base color
        
        // Combat stats - stronger than cricket (15 HP, 6 dmg), weaker than grasshopper (30 HP, 10 dmg)
        this.maxHp = 300; // Between cricket (15) and grasshopper (30)
        this.hp = this.maxHp;
        this.damage = 5; // Between cricket (6) and grasshopper (10)
        this.attackSpeed = 75; // Moderate attack speed
        
        // Hopping 
        this.isHopping = false;
        this.hopCooldown = 0;
        this.hopDuration = 0;
        this.hopStartX = 0;
        this.hopStartY = 0;
        this.hopTargetX = 0;
        this.hopTargetY = 0;
        this.hopProgress = 0;
        this.hopHeight = 0;
        
        // Movement timing
        this.hopCooldownTime = 90 + Math.random() * 120; // 1.5-3.5 seconds between hops
        this.hopDurationTime = 20; // Faster hops (1/3 second)
        
        // Override base enemy movement
        this.speed = 0; // No continuous movement
        this.vx = 0;
        this.vy = 0;
        
        // Create frog appearance
        this.createFrogBody();
    }
    
    createFrogBody() {
        // Clear any existing graphics
        this.removeChildren();
        
        // Main body (frog sitting position - wide and low)
        const body = new PIXI.Graphics();
        body.beginFill(0x228B22); // Forest green
        body.drawEllipse(0, 2, 8, 5); // Wide, low body
        body.endFill();
        
        // Body shading
        body.beginFill(0x1F5F1F, 0.3); // Darker green shadow
        body.drawEllipse(1, 3, 6, 3);
        body.endFill();
        
        // Belly
        body.beginFill(0xF0F8E8); // Light cream belly
        body.drawEllipse(0, 3, 5, 3);
        body.endFill();
        
        this.addChild(body);
        
        // Head (connected to body, not separate)
        const head = new PIXI.Graphics();
        head.beginFill(0x228B22); // Same green as body
        head.drawEllipse(0, -2, 6, 4); // Wide head
        head.endFill();
        
        // Head highlight
        head.beginFill(0x32CD32, 0.6);
        head.drawEllipse(-1, -3, 4, 2.5);
        head.endFill();
        
        this.addChild(head);
        
        // Mouth line
        const mouth = new PIXI.Graphics();
        mouth.lineStyle(1, 0x1F5F1F);
        mouth.moveTo(-3, 1);
        mouth.lineTo(3, 1);
        this.addChild(mouth);
        
        // Eyes (on top of head like real frogs)
        const leftEye = new PIXI.Graphics();
        leftEye.beginFill(0x000000); // Black base
        leftEye.drawCircle(-2, -4, 1.5);
        leftEye.endFill();
        leftEye.beginFill(0xFFD700); // Gold iris
        leftEye.drawCircle(-2, -4, 1);
        leftEye.endFill();
        leftEye.beginFill(0x000000); // Black pupil
        leftEye.drawCircle(-2, -4, 0.4);
        leftEye.endFill();
        leftEye.beginFill(0xFFFFFF, 0.8); // White highlight
        leftEye.drawCircle(-2.3, -4.3, 0.2);
        leftEye.endFill();
        
        const rightEye = new PIXI.Graphics();
        rightEye.beginFill(0x000000);
        rightEye.drawCircle(2, -4, 1.5);
        rightEye.endFill();
        rightEye.beginFill(0xFFD700);
        rightEye.drawCircle(2, -4, 1);
        rightEye.endFill();
        rightEye.beginFill(0x000000);
        rightEye.drawCircle(2, -4, 0.4);
        rightEye.endFill();
        rightEye.beginFill(0xFFFFFF, 0.8);
        rightEye.drawCircle(1.7, -4.3, 0.2);
        rightEye.endFill();
        
        this.addChild(leftEye);
        this.addChild(rightEye);
        
        // Front legs (small, positioned at front of body)
        const leftFrontLeg = new PIXI.Graphics();
        leftFrontLeg.beginFill(0x228B22);
        leftFrontLeg.drawEllipse(-5, 1, 1.5, 2); // Small front leg
        leftFrontLeg.endFill();
        leftFrontLeg.beginFill(0x1F5F1F);
        leftFrontLeg.drawCircle(-5, 2.5, 0.8); // Front foot
        leftFrontLeg.endFill();
        
        const rightFrontLeg = new PIXI.Graphics();
        rightFrontLeg.beginFill(0x228B22);
        rightFrontLeg.drawEllipse(5, 1, 1.5, 2);
        rightFrontLeg.endFill();
        rightFrontLeg.beginFill(0x1F5F1F);
        rightFrontLeg.drawCircle(5, 2.5, 0.8);
        rightFrontLeg.endFill();
        
        this.addChild(leftFrontLeg);
        this.addChild(rightFrontLeg);
        
        // Back legs (large, folded for sitting position)
        const leftBackLeg = new PIXI.Graphics();
        leftBackLeg.beginFill(0x228B22);
        // Thigh (horizontal when sitting)
        leftBackLeg.drawEllipse(-6, 4, 3, 1.5);
        leftBackLeg.endFill();
        leftBackLeg.beginFill(0x228B22);
        // Lower leg (folded back)
        leftBackLeg.drawEllipse(-8, 5, 2, 1);
        leftBackLeg.endFill();
        leftBackLeg.beginFill(0x1F5F1F);
        // Large webbed foot
        leftBackLeg.drawEllipse(-9, 6, 2.5, 1);
        leftBackLeg.endFill();
        // Webbing lines
        leftBackLeg.lineStyle(0.5, 0x0F3F0F);
        leftBackLeg.moveTo(-10.5, 6);
        leftBackLeg.lineTo(-7.5, 6);
        leftBackLeg.moveTo(-10, 5.5);
        leftBackLeg.lineTo(-8, 6.5);
        
        const rightBackLeg = new PIXI.Graphics();
        rightBackLeg.beginFill(0x228B22);
        rightBackLeg.drawEllipse(6, 4, 3, 1.5);
        rightBackLeg.endFill();
        rightBackLeg.beginFill(0x228B22);
        rightBackLeg.drawEllipse(8, 5, 2, 1);
        rightBackLeg.endFill();
        rightBackLeg.beginFill(0x1F5F1F);
        rightBackLeg.drawEllipse(9, 6, 2.5, 1);
        rightBackLeg.endFill();
        // Webbing lines
        rightBackLeg.lineStyle(0.5, 0x0F3F0F);
        rightBackLeg.moveTo(7.5, 6);
        rightBackLeg.lineTo(10.5, 6);
        rightBackLeg.moveTo(8, 6.5);
        rightBackLeg.lineTo(10, 5.5);
        
        this.addChild(leftBackLeg);
        this.addChild(rightBackLeg);
        
        // Add some spots for frog pattern
        const spots = new PIXI.Graphics();
        spots.beginFill(0x1F5F1F, 0.4);
        spots.drawCircle(-2, 0, 0.8);
        spots.drawCircle(3, 1, 0.6);
        spots.drawCircle(-1, 3, 0.5);
        spots.drawCircle(2, -1, 0.4);
        spots.endFill();
        this.addChild(spots);
        
        // Store references for animation
        this.leftBackLeg = leftBackLeg;
        this.rightBackLeg = rightBackLeg;
        this.leftFrontLeg = leftFrontLeg;
        this.rightFrontLeg = rightFrontLeg;
        this.body = body;
        this.head = head;
        this.leftEye = leftEye;
        this.rightEye = rightEye;
    }
    
    update(ants) {
        // Handle health bar positioning and combat logic from base class
        // but skip the movement part
        
        // Acquire or validate target ant within perception range
        if(!this.targetAnt || this.targetAnt.isDead){
            this.targetAnt=null;
            let nearest=null,distSq=Infinity;
            ants.forEach(a=>{
                const dx=a.x-this.x; const dy=a.y-this.y; const d=dx*dx+dy*dy;
                if(d<distSq && Math.sqrt(d)<=this.perceptionRange){nearest=a;distSq=d;}
            });
            if(nearest) this.targetAnt=nearest;
        }

        // Attack nearest ant (but don't move toward them continuously)
        if(this._attackTimer>0) this._attackTimer--;
        if(this.targetAnt){
            const dx=this.targetAnt.x-this.x; const dy=this.targetAnt.y-this.y; const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<=this.attackRange){
                if(this._attackTimer===0){
                    this.targetAnt.takeDamage(this.attackDamage);
                    this._attackTimer=this.attackCooldown;
                }
            } else {
                // If target is far, try to hop toward them occasionally
                if(!this.isHopping && this.hopCooldown <= 30 && Math.random() < 0.3) {
                    this.hopTowardsTarget(this.targetAnt);
                }
            }
        }

        // Handle health bar
        if(this.healthBarTimer>0){
            this.healthBarTimer--; 
            if(this.healthBarTimer===0){
                this.healthBarContainer.visible=false;
            }
        }

        if(this.healthBarContainer){
            this.healthBarContainer.x = this.x;
            this.healthBarContainer.y = this.y - 20;
            this.healthBarContainer.rotation = 0;
        }
        
        // Handle frog-specific movement and animation
        this.updateHopping();
        this.animateLegs();
    }
    
    updateHopping() {
        if (this.isHopping) {
            // Continue current hop
            this.hopProgress += 1 / this.hopDurationTime;
            
            if (this.hopProgress >= 1) {
                // Hop complete
                this.isHopping = false;
                this.x = this.hopTargetX;
                this.y = this.hopTargetY;
                this.hopCooldown = this.hopCooldownTime;
                this.hopProgress = 0;
                
                // Reset body position
                if (this.body) {
                    this.body.y = 0;
                }
                if (this.head) {
                    this.head.y = 0;
                }
            } else {
                // Interpolate position during hop
                const t = this.hopProgress;
                const easeT = this.easeOutQuad(t); // Smooth hop animation
                
                this.x = this.hopStartX + (this.hopTargetX - this.hopStartX) * easeT;
                this.y = this.hopStartY + (this.hopTargetY - this.hopStartY) * easeT;
                
                // Add vertical hop motion (parabolic arc)
                const hopHeight = Math.sin(t * Math.PI) * this.hopHeight;
                if (this.body) {
                    this.body.y = -hopHeight;
                }
                if (this.head) {
                    this.head.y = -hopHeight;
                }
            }
        } else {
            // Check if it's time for next hop
            this.hopCooldown--;
            
            if (this.hopCooldown <= 0) {
                this.startHop();
            }
        }
    }
    
    startHop() {
        // Choose random direction and distance for hop
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 60; // 40-100 pixel hops
        
        this.hopStartX = this.x;
        this.hopStartY = this.y;
        this.hopTargetX = this.x + Math.cos(angle) * distance;
        this.hopTargetY = this.y + Math.sin(angle) * distance;
        
        // Keep within map bounds
        this.hopTargetX = Math.max(20, Math.min(this.mapBounds.width - 20, this.hopTargetX));
        this.hopTargetY = Math.max(20, Math.min(this.mapBounds.height - 20, this.hopTargetY));
        
        this.hopHeight = 15 + Math.random() * 10; // Variable hop height
        this.hopProgress = 0;
        this.isHopping = true;
        
        // Face the direction of the hop
        const dx = this.hopTargetX - this.hopStartX;
        if (dx !== 0) {
            this.scale.x = Math.abs(this.scale.x) * (dx > 0 ? 1 : -1);
        }
    }
    
    animateLegs() {
        if (!this.leftBackLeg || !this.rightBackLeg) return;
        
        if (this.isHopping) {
            // During hop, legs are extended
            const extension = Math.sin(this.hopProgress * Math.PI) * 3;
            this.leftBackLeg.rotation = -0.2 - extension * 0.1;
            this.rightBackLeg.rotation = 0.2 + extension * 0.1;
            
            if (this.leftFrontLeg && this.rightFrontLeg) {
                this.leftFrontLeg.rotation = 0.1;
                this.rightFrontLeg.rotation = -0.1;
            }
        } else {
            // When not hopping, legs are relaxed
            this.leftBackLeg.rotation = 0;
            this.rightBackLeg.rotation = 0;
            
            if (this.leftFrontLeg && this.rightFrontLeg) {
                this.leftFrontLeg.rotation = 0;
                this.rightFrontLeg.rotation = 0;
            }
        }
    }
    
    // Easing function for smooth hop animation
    easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }
    
    // Override movement to use hopping instead of continuous movement
    moveRandomly() {
        // Frog movement is handled by hopping system
        // This overrides the base enemy's continuous movement
    }
    
    // New method to hop toward a target
    hopTowardsTarget(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Hop distance (shorter when targeting)
            const hopDistance = Math.min(60, distance * 0.7);
            
            this.hopStartX = this.x;
            this.hopStartY = this.y;
            this.hopTargetX = this.x + (dx / distance) * hopDistance;
            this.hopTargetY = this.y + (dy / distance) * hopDistance;
            
            // Keep within map bounds
            this.hopTargetX = Math.max(20, Math.min(this.mapBounds.width - 20, this.hopTargetX));
            this.hopTargetY = Math.max(20, Math.min(this.mapBounds.height - 20, this.hopTargetY));
            
            this.hopHeight = 12 + Math.random() * 8;
            this.hopProgress = 0;
            this.isHopping = true;
            this.hopCooldown = this.hopCooldownTime; // Reset cooldown
            
            // Face the direction of the hop
            const finalDx = this.hopTargetX - this.hopStartX;
            if (finalDx !== 0) {
                this.scale.x = Math.abs(this.scale.x) * (finalDx > 0 ? 1 : -1);
            }
        }
    }
}; 

// ===== src/Game.js =====
// src/Game.js
IdleAnts.Game = class {
    // Define game state constants
    static States = {
        INITIALIZING: 'initializing', // Loading assets and setup
        PLAYING: 'playing',           // Main gameplay
        PAUSED: 'paused',             // Game paused
        UPGRADING: 'upgrading'        // Player is viewing/selecting upgrades
    };
    
    constructor() {
        // Make app accessible globally for components that need it
        IdleAnts.app = this;
        
        // Initialize game state
        this.state = IdleAnts.Game.States.INITIALIZING;
        
        // Detect if running on mobile device
        this.isMobileDevice = this.detectMobileDevice();
        
        // Map configuration
        this.mapConfig = {
            width: 3000,  // Larger world width
            height: 2000, // Larger world height
            viewport: {
                x: 0,      // Camera position X will be set after setup
                y: 0,      // Camera position Y will be set after setup
                speed: 10  // Camera movement speed
            },
            zoom: {
                level: 1.0,    // Initial zoom level (will be adjusted based on map size)
                min: 0.25,     // Minimum zoom (25% - zoomed out, but will be constrained)
                max: 2.0,      // Maximum zoom (200% - zoomed in)
                speed: 0.1     // Zoom speed per wheel tick
            }
        };

        // Frame counter for periodic updates
        this.frameCounter = 0;
        // lastMouseX and lastMouseY are still needed here for the hoverIndicator logic
        this.lastMouseX = undefined;
        this.lastMouseY = undefined;
        
        // Create the PIXI application
        this.app = new PIXI.Application({
            background: '#78AB46', // Grass green background
            resizeTo: document.getElementById('game-canvas-container'),
        });
        document.getElementById('game-canvas-container').appendChild(this.app.view);
        
        // Initialize managers
        this.resourceManager = new IdleAnts.Managers.ResourceManager();
        this.assetManager = new IdleAnts.Managers.AssetManager(this.app);
        
        // Create container for all game elements
        this.worldContainer = new PIXI.Container();
        this.app.stage.addChild(this.worldContainer);
        
        // Create minimap
        this.minimapContainer = new PIXI.Container();
        this.app.stage.addChild(this.minimapContainer);
        
        this.cameraManager = new IdleAnts.Managers.CameraManager(this.app, this.mapConfig, this.worldContainer, this);
        
        // Run any registered initialization functions
        this.runInitHooks();
        
        // Load assets before initializing other managers
        this.assetManager.loadAssets().then(() => {
            this.backgroundManager = new IdleAnts.Managers.BackgroundManager(this.app, this.assetManager, this.worldContainer);
            this.entityManager = new IdleAnts.Managers.EntityManager(this.app, this.assetManager, this.resourceManager, this.worldContainer);
            this.effectManager = new IdleAnts.Managers.EffectManager(this.app);
            
            // Initialize audio manager
            IdleAnts.AudioManager.init();
            
            // Set up effect manager reference
            this.entityManager.setEffectManager(this.effectManager);
            
            // UI Manager needs access to the game for buttons
            this.uiManager = new IdleAnts.Managers.UIManager(this.resourceManager, this, this.effectManager);

            // Initialize InputManager after other core managers it might depend on (like camera, entity, resource)
            this.inputManager = new IdleAnts.Managers.InputManager(this.app, this, this.cameraManager, this.resourceManager, this.entityManager, this.mapConfig);
            
            this.setupGame();
            this.setupEventListeners(); // This will be simplified
            this.startGameLoop();
            this.setupMinimap();
            this.updateMinimap();
            
            this.cameraManager.centerCameraOnNest();
            
            this.setupAudioResumeOnInteraction();
            this.startBackgroundMusic();
            this.transitionToState(IdleAnts.Game.States.PLAYING);
        });
    }
    
    // Setup audio resume on user interaction
    setupAudioResumeOnInteraction() {
        // List of events that count as user interaction
        const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
        
        // Helper function to attempt resuming audio context
        const resumeAudio = () => {
            if (IdleAnts.AudioManager) {
                IdleAnts.AudioManager.resumeAudioContext();
                
                // Re-start BGM if needed
                if (IdleAnts.AudioAssets && IdleAnts.AudioAssets.BGM && IdleAnts.AudioAssets.BGM.MAIN_THEME) {
                    IdleAnts.AudioManager.playBGM(IdleAnts.AudioAssets.BGM.MAIN_THEME.id);
                }
                
                // Remove event listeners after first successful interaction
                interactionEvents.forEach(event => {
                    document.removeEventListener(event, resumeAudio);
                });
                
                console.log('Audio resumed after user interaction');
            }
        };
        
        // Add event listeners
        interactionEvents.forEach(event => {
            document.addEventListener(event, resumeAudio, { once: false });
        });
    }
    
    // Start background music
    startBackgroundMusic() {
        // Play main theme BGM
        if (IdleAnts.AudioAssets.BGM.MAIN_THEME) {
            IdleAnts.AudioManager.playBGM(IdleAnts.AudioAssets.BGM.MAIN_THEME.id);
        }
    }
    
    // Play sound effects
    playSoundEffect(soundId) {
        if (soundId && IdleAnts.AudioManager) {
            IdleAnts.AudioManager.playSFX(soundId);
        }
    }
    
    // Toggle sound on/off
    toggleSound() {
        const isMuted = IdleAnts.AudioManager.toggleMute();
        
        // Update the UI button
        const soundButton = document.getElementById('toggle-sound');
        if (soundButton) {
            const icon = soundButton.querySelector('i');
            if (icon) {
                icon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
            }
            soundButton.innerHTML = icon ? icon.outerHTML : '';
            soundButton.innerHTML += isMuted ? 'Sound: OFF' : 'Sound: ON';
        }
        
        return isMuted;
    }
    
    // State transition method
    transitionToState(newState) {
        // Handle exit actions for current state
        switch(this.state) {
            case IdleAnts.Game.States.INITIALIZING:
                // No special exit actions
                break;
                
            case IdleAnts.Game.States.PAUSED:
                // Resume game logic
                break;
                
            case IdleAnts.Game.States.UPGRADING:
                // Close upgrade menu if it's open
                if (this.uiManager) {
                    this.uiManager.closeUpgradeMenu();
                }
                break;
        }
        
        // Set the new state
        this.state = newState;
        
        // Handle entry actions for new state
        switch(newState) {
            case IdleAnts.Game.States.PLAYING:
                // Ensure UI is updated
                if (this.uiManager) {
                    this.uiManager.updateUI();
                }
                break;
                
            case IdleAnts.Game.States.PAUSED:
                // Show pause overlay
                if (this.uiManager) {
                    this.uiManager.showPauseOverlay();
                }
                break;
                
            case IdleAnts.Game.States.UPGRADING:
                // Show upgrade menu
                if (this.uiManager) {
                    this.uiManager.showUpgradeMenu();
                }
                break;
        }
        
        // Notify any listeners of state change
        this.onStateChanged();
    }
    
    // Method to handle state change side effects
    onStateChanged() {
        // Update UI elements based on the new state
        if (this.uiManager) {
            this.uiManager.updateUI();
        }
        
        // Log state change for debugging
        console.log(`Game state changed to: ${this.state}`);
    }
    
    setupGame() {
        // Create background with map dimensions
        this.backgroundManager.createBackground(this.mapConfig.width, this.mapConfig.height);
        
        // Initialize world container scale based on zoom level (CameraManager handles this now mostly)
        // this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);
        if (this.cameraManager) this.cameraManager.initializeZoomLevels(); // Ensure zoom is set up
        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level); // Apply initial scale
        
        // Set up game entities
        this.entityManager.setupEntities();
        
        // Initialize ant attributes
        this.entityManager.updateAntsSpeed();
        this.entityManager.updateAntsCapacity();
        
        // Initialize UI by updating it
        this.uiManager.updateUI();
    }
    
    setupEventListeners() {
        // Most event listeners are now in InputManager.js
        // Keep window resize and orientation change here as they affect more than just input/camera directly.
        // Or, InputManager could call back to Game for these if preferred for full centralization.

        // Add event listener for window resize
        window.addEventListener('resize', () => {
            this.updateMinimap(); 
            if (this.cameraManager) {
                this.cameraManager.handleResizeOrOrientationChange();
            }
            if (this.uiManager) { // Also update UI on resize
                this.uiManager.updateUI();
            }
        });

        // Handle orientation change on mobile devices (moved from original setupEventListeners)
        if (this.isMobileDevice) {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    if (this.cameraManager) {
                        this.cameraManager.handleResizeOrOrientationChange();
                    }
                    this.updateMinimap();
                    if (this.uiManager) {
                        this.uiManager.updateUI();
                    }
                }, 300); 
            });
        }

        // Create and track hover effect (Graphics object setup)
        this.hoverIndicator = new PIXI.Graphics();
        this.app.stage.addChild(this.hoverIndicator);
        // Actual update of hoverIndicator position is handled by InputManager updating lastMouseX/Y,
        // and gameLoop calling updateHoverIndicator().

        // Add sound toggle button event listener (remains, as it's UI specific not general input)
        const soundToggleButton = document.getElementById('toggle-sound');
        if (soundToggleButton) {
            soundToggleButton.addEventListener('click', () => {
                this.toggleSound();
                IdleAnts.AudioManager.resumeAudioContext();
            });
        }
    }
    
    updateHoverIndicator(x, y) {
        // Clear previous drawing
        this.hoverIndicator.clear();
        
        // Get the current food type
        const currentFoodType = this.resourceManager.getCurrentFoodType();
        
        // Calculate world position by adding camera position
        const worldX = (x / this.mapConfig.zoom.level) + this.mapConfig.viewport.x;
        const worldY = (y / this.mapConfig.zoom.level) + this.mapConfig.viewport.y;
        
        // Draw a subtle circular indicator where food would be placed
        this.hoverIndicator.lineStyle(1, 0xFFFFFF, 0.5);
        this.hoverIndicator.drawCircle(x, y, 15);
        this.hoverIndicator.endFill();
        
        // Add a pulsing inner circle using the food type's glow color
        const pulse = 0.5 + Math.sin(performance.now() / 200) * 0.3;
        this.hoverIndicator.lineStyle(1, currentFoodType.glowColor, pulse);
        this.hoverIndicator.drawCircle(x, y, 8);
        
        // Add a small dot at the center with the food type's color
        this.hoverIndicator.beginFill(currentFoodType.color, 0.7);
        this.hoverIndicator.drawCircle(x, y, 2);
        this.hoverIndicator.endFill();
    }
    
    startGameLoop() {
        // Ensure DOM is fully loaded before starting UI updates
        const ensureDOMLoaded = () => {
            if (document.readyState === 'loading') {
                // If the document is still loading, wait for it to finish
                document.addEventListener('DOMContentLoaded', () => {
                    console.log("DOM fully loaded, initializing game UI");
                    this.initializeGameUI();
                });
            } else {
                // DOM is already loaded, initialize UI immediately
                console.log("DOM already loaded, initializing game UI");
                this.initializeGameUI();
            }
        };
        
        // New method to handle UI initialization
        this.initializeGameUI = () => {
            // Update UI initially
            try {
                this.uiManager.updateUI();
            } catch (error) {
                console.error("Error initializing UI:", error);
            }
            
            // Start ticker
            this.app.ticker.add(() => this.gameLoop());
            
            // Set up idle resource generation
            setInterval(() => {
                this.resourceManager.addFood(this.resourceManager.stats.foodPerSecond);
                // UI will be updated in gameLoop at optimized intervals
            }, 1000);
        };
        
        // Start the initialization process
        ensureDOMLoaded();
    }
    
    setupMinimap() {
        // Settings for the minimap
        const padding = 10;
        const size = 150;
        const scale = size / Math.max(this.mapConfig.width, this.mapConfig.height);
        
        // Create minimap background
        this.minimap = new PIXI.Graphics();
        this.minimap.beginFill(0x000000, 0.6);
        this.minimap.drawRect(0, 0, size, size * (this.mapConfig.height / this.mapConfig.width));
        this.minimap.endFill();
        
        // Position at bottom right of the screen
        this.minimap.position.set(
            this.app.screen.width - size - padding,
            this.app.screen.height - (size * (this.mapConfig.height / this.mapConfig.width)) - padding
        );
        
        // Add to the minimap container
        this.minimapContainer.addChild(this.minimap);
        
        // Create visuals for nest, ants, and food
        this.minimapVisuals = new PIXI.Graphics();
        this.minimap.addChild(this.minimapVisuals);
        
        // Create viewport indicator
        this.minimapViewport = new PIXI.Graphics();
        this.minimap.addChild(this.minimapViewport);
        
        // Add click event to minimap for quick navigation
        this.minimap.interactive = true;
        this.minimap.buttonMode = true;
        this.minimap.on('pointerdown', (event) => {
            const minimapBounds = this.minimap.getBounds();
            const clickX = event.data.global.x - minimapBounds.x;
            const clickY = event.data.global.y - minimapBounds.y;
            
            // Calculate where in the world map this corresponds to
            const worldX = (clickX / size) * this.mapConfig.width;
            const worldY = (clickY / size) * this.mapConfig.height;
            
            // Center the view on this location
            if (this.cameraManager) {
                this.cameraManager.centerViewOnPosition(worldX, worldY);
            }
        });
        
        // Remove navigation helper - will be added by user later
        // this.addNavigationHelper();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.minimap.position.set(
                this.app.screen.width - size - padding,
                this.app.screen.height - (size * (this.mapConfig.height / this.mapConfig.width)) - padding
            );
            
            // Update navigation helper position - not needed now
            // this.updateNavigationHelperPosition();
        });
    }
    
    updateMinimap() {
        if (!this.minimapVisuals || !this.minimapViewport) return;
        
        // Clear existing graphics
        this.minimapVisuals.clear();
        this.minimapViewport.clear();
        
        // Calculate scale ratio between minimap and world
        const minimapWidth = this.minimap.width;
        const minimapHeight = this.minimap.height;
        const scaleX = minimapWidth / this.mapConfig.width;
        const scaleY = minimapHeight / this.mapConfig.height;
        
        // Draw nest
        if (this.entityManager.nest) {
            const nestPos = this.entityManager.nestPosition;
            this.minimapVisuals.beginFill(0x8B4513);
            this.minimapVisuals.drawCircle(
                nestPos.x * scaleX,
                nestPos.y * scaleY,
                5
            );
            this.minimapVisuals.endFill();
        }
        
        // Draw ants as tiny dots
        this.minimapVisuals.beginFill(0xFFFFFF);
        this.entityManager.entities.ants.forEach(ant => {
            this.minimapVisuals.drawCircle(ant.x * scaleX, ant.y * scaleY, 1);
        });
        this.entityManager.entities.flyingAnts.forEach(ant => {
            this.minimapVisuals.drawCircle(ant.x * scaleX, ant.y * scaleY, 1);
        });
        this.minimapVisuals.endFill();
        
        // Draw Car Ants as red dots (or another distinct color)
        if (this.entityManager.entities.carAnts && this.entityManager.entities.carAnts.length > 0) {
            this.minimapVisuals.beginFill(0xFF0000); // Red for Car Ants
            this.entityManager.entities.carAnts.forEach(carAnt => {
                this.minimapVisuals.drawCircle(carAnt.x * scaleX, carAnt.y * scaleY, 1.5); // Slightly larger dot for Car Ants
            });
            this.minimapVisuals.endFill();
        }
        
        // Draw food as green dots
        this.minimapVisuals.beginFill(0x00FF00);
        this.entityManager.entities.foods.forEach(food => {
            this.minimapVisuals.drawCircle(food.x * scaleX, food.y * scaleY, 2);
        });
        this.minimapVisuals.endFill();
        
        // Draw viewport indicator - adjusted for zoom level
        this.minimapViewport.lineStyle(1, 0xFFFFFF, 0.8);
        
        // Calculate the visible area based on zoom level
        const visibleWidth = (this.app.screen.width / this.mapConfig.zoom.level);
        const visibleHeight = (this.app.screen.height / this.mapConfig.zoom.level);
        
        this.minimapViewport.drawRect(
            this.mapConfig.viewport.x * scaleX,
            this.mapConfig.viewport.y * scaleY,
            visibleWidth * scaleX,
            visibleHeight * scaleY
        );
    }
    
    gameLoop() {
        // Only update game logic when in PLAYING state
        if (this.state !== IdleAnts.Game.States.PLAYING) {
            // Still update hover indicator if paused or upgrading, but not if initializing
            if (this.state !== IdleAnts.Game.States.INITIALIZING && this.lastMouseX !== undefined && this.lastMouseY !== undefined) {
                this.updateHoverIndicator(this.lastMouseX, this.lastMouseY);
            }
            return;
        }
        
        // Update frame counter
        this.frameCounter++;
        
        // Update input manager (which internally updates camera based on keys)
        if (this.inputManager) {
            this.inputManager.update(); 
        }
        
        // Update entities
        this.entityManager.update();
        
        // Update effects
        this.effectManager.update();
        
        // Update UI every 60 frames (approximately once per second at 60fps)
        // This is frequent enough for smooth updates but not too frequent to cause performance issues
        if (this.frameCounter % 60 === 0) {
            this.uiManager.updateUI();
        }
        
        // Update minimap less frequently for better performance
        if (this.frameCounter % 120 === 0) {
            this.updateMinimap();
        }
        
        // Update food collection rate more frequently for accuracy
        if (this.frameCounter % 10 === 0) {
            // Force an update of the actual food rate
            this.resourceManager.updateActualFoodRate();
            
            // Update just the food rate display without updating the entire UI
            const actualRate = this.resourceManager.getActualFoodRate();
            const actualRateElement = document.getElementById('food-per-second-actual');
            if (actualRateElement) {
                actualRateElement.textContent = actualRate.toFixed(1);
            }
        }
        
        // Check for autofeeder activation
        if (this.resourceManager.stats.autofeederUnlocked && 
            this.resourceManager.stats.autofeederLevel > 0 &&
            this.frameCounter % this.resourceManager.stats.autofeederInterval === 0) {
            this.activateAutofeeder();
        }
        
        // Always update hover indicator if mouse/touch is over canvas and game is not initializing
        if (this.state !== IdleAnts.Game.States.INITIALIZING && this.lastMouseX !== undefined && this.lastMouseY !== undefined) {
            this.updateHoverIndicator(this.lastMouseX, this.lastMouseY);
        }
    }
    
    // Toggle pause state
    togglePause() {
        if (this.state === IdleAnts.Game.States.PAUSED) {
            this.transitionToState(IdleAnts.Game.States.PLAYING);
        } else if (this.state === IdleAnts.Game.States.PLAYING) {
            this.transitionToState(IdleAnts.Game.States.PAUSED);
        }
    }
    
    // Show upgrade menu
    showUpgrades() {
        if (this.state === IdleAnts.Game.States.PLAYING) {
            this.transitionToState(IdleAnts.Game.States.UPGRADING);
        }
    }
    
    // Close upgrade menu and return to playing
    closeUpgrades() {
        if (this.state === IdleAnts.Game.States.UPGRADING) {
            this.transitionToState(IdleAnts.Game.States.PLAYING);
        }
    }
    
    // Upgrade and purchase methods act as coordinators between managers
    buyAnt() {
        const antCost = this.resourceManager.stats.antCost;
        if (this.resourceManager.canAfford(antCost) && 
            this.resourceManager.stats.ants < this.resourceManager.stats.maxAnts) {
            
            // Handle resource management
            this.resourceManager.spendFood(antCost);
            this.resourceManager.stats.ants += 1;
            this.resourceManager.updateFoodPerSecond();
            this.resourceManager.updateAntCost();
            
            // Delegate entity creation to EntityManager
            this.entityManager.createAnt();
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-ant', 'New ant added!');

            // After successfully buying an ant, play the sound effect
            if (IdleAnts.AudioAssets.SFX.ANT_SPAWN) {
                this.playSoundEffect(IdleAnts.AudioAssets.SFX.ANT_SPAWN.id);
            }
        }
    }
    
    unlockFlyingAnts() {
        console.log("Game: unlockFlyingAnts called");
        
        // Try to unlock flying ants through the resource manager
        const success = this.resourceManager.unlockFlyingAnts();
        
        if (success) {
            console.log("Game: Flying ants unlocked successfully");
            
            // Update the UI
            this.uiManager.updateUI();
            
            // Show success effect
            this.uiManager.showUpgradeEffect('unlock-flying-ants', 'Flying ants unlocked!');
            
            // Show the previously hidden flying ant buttons
            const buyButton = document.getElementById('buy-flying-ant');
            const statsDisplay = document.getElementById('flying-ant-stats');
            const expandButton = document.getElementById('expand-flying-ants');
            
            console.log("UI Elements:", { 
                buyButton: buyButton, 
                statsDisplay: statsDisplay, 
                expandButton: expandButton 
            });
            
            if (buyButton) buyButton.classList.remove('hidden');
            if (statsDisplay) statsDisplay.classList.remove('hidden');
            if (expandButton) expandButton.classList.remove('hidden');
        } else {
            console.log("Game: Failed to unlock flying ants");
        }
        
        return success;
    }
    
    buyFlyingAnt() {
        if (this.resourceManager.buyFlyingAnt()) {
            // Delegate entity creation to EntityManager
            this.entityManager.createFlyingAnt();
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-flying-ant', 'Flying ant added!');
        }
    }
    
    expandFlyingAntCapacity() {
        if (this.resourceManager.expandFlyingAntCapacity()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('expand-flying-ants', 'Flying ant capacity expanded!');
        }
    }
    
    upgradeFood() {
        const upgradeCost = this.resourceManager.stats.foodUpgradeCost;
        if (this.resourceManager.canAfford(upgradeCost)) {
            this.resourceManager.spendFood(upgradeCost);
            
            // Upgrade the food multiplier and per-click value
            this.resourceManager.stats.foodMultiplier += 0.5;
            this.resourceManager.stats.foodPerClick = Math.ceil(this.resourceManager.stats.foodPerClick * 1.5);
            this.resourceManager.updateFoodUpgradeCost();
            
            // Try to upgrade the food tier
            const tierUpgraded = this.resourceManager.upgradeFoodTier();
            
            // Update the UI
            this.uiManager.updateUI();
            
            // Show appropriate message based on whether tier was upgraded
            if (tierUpgraded) {
                const newFoodType = this.resourceManager.getCurrentFoodType();
                this.uiManager.showUpgradeEffect('upgrade-food', `Upgraded to ${newFoodType.name}s!`);
            } else {
                this.uiManager.showUpgradeEffect('upgrade-food', 'Food collection upgraded!');
            }
        }
    }
    
    expandColony() {
        const expandCost = this.resourceManager.stats.expandCost;
        if (this.resourceManager.canAfford(expandCost)) {
            // Handle resource management
            this.resourceManager.spendFood(expandCost);
            this.resourceManager.stats.maxAnts += 5;
            this.resourceManager.stats.expandCost = Math.floor(this.resourceManager.stats.expandCost * 1.3);
            
            // Delegate nest expansion to EntityManager
            this.entityManager.expandNest();
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('expand-colony', 'Colony expanded!');
        }
    }
    
    upgradeSpeed() {
        const speedUpgradeCost = this.resourceManager.stats.speedUpgradeCost;
        if (this.resourceManager.canAfford(speedUpgradeCost)) {
            // Handle resource management
            this.resourceManager.spendFood(speedUpgradeCost);
            this.resourceManager.upgradeSpeedMultiplier(0.2); // Increase speed by 20% per upgrade
            this.resourceManager.updateSpeedUpgradeCost();
            
            // Delegate entity updates to EntityManager
            this.entityManager.updateAntsSpeed();
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('upgrade-speed', 'Ants move faster!');
        }
    }
    
    upgradeStrength() {
        const strengthUpgradeCost = this.resourceManager.stats.strengthUpgradeCost;
        if (this.resourceManager.canAfford(strengthUpgradeCost)) {
            // Handle resource management
            this.resourceManager.spendFood(strengthUpgradeCost);
            this.resourceManager.upgradeStrengthMultiplier(1); // Increase strength by 1 per upgrade
            this.resourceManager.updateStrengthUpgradeCost();
            
            // Delegate entity updates to EntityManager
            this.entityManager.updateAntsCapacity();
            
            // Update UI
            this.uiManager.updateUI();
            
            // Get the current strength value
            const strengthValue = this.resourceManager.stats.strengthMultiplier;
            // Calculate the collection speed bonus (keeping the same formula)
            const reductionPercentage = Math.min(75, Math.round((strengthValue - 1) * 25));
            
            // Update message to reflect both benefits of strength upgrade
            this.uiManager.showUpgradeEffect('upgrade-strength', 
                `Ants now have strength ${strengthValue} and collect ${reductionPercentage}% faster!`);
        }
    }
    
    // Queen now handles her own larvae production internally; no external call needed

    detectMobileDevice() {
        // Check if device is mobile based on user agent
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Regular expressions for mobile devices
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        
        // Check if touch events are supported
        const hasTouchEvents = 'ontouchstart' in window || 
                              navigator.maxTouchPoints > 0 || 
                              navigator.msMaxTouchPoints > 0;
        
        // Return true if user agent matches mobile pattern or has touch events
        const isMobile = mobileRegex.test(userAgent) || hasTouchEvents;
        
        console.log('Mobile device detected:', isMobile);
        
        // Apply mobile-specific settings if on mobile
        if (isMobile) {
            // Adjust game settings for mobile
            this.adjustSettingsForMobile();
        }
        
        return isMobile;
    }

    adjustSettingsForMobile() {
        // Adjust game settings for better mobile experience
        
        // Increase UI button sizes for touch
        const buttons = document.querySelectorAll('.upgrade-btn');
        buttons.forEach(button => {
            button.style.minHeight = '44px'; // Minimum touch target size
        });
        
        // Adjust zoom speed for pinch gestures
        if (!this.mapConfig) {
            // Create mapConfig if it doesn't exist yet
            this.mapConfig = {
                zoom: { speed: 0.1 }
            };
        } else if (!this.mapConfig.zoom) {
            this.mapConfig.zoom = { speed: 0.1 };
        } else {
            // Adjust zoom speed to be more responsive on mobile
            this.mapConfig.zoom.speed = 0.1;
        }
        
        // Add a small delay to food placement to avoid accidental taps
        this.mobileSettings = {
            tapDelay: 100, // ms
            minSwipeDistance: 10, // px
        };
        
        // Add viewport meta tag programmatically if not already present
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        
        // iOS-specific fixes
        
        // Fix for iOS Safari 100vh issue (viewport height calculation)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
            // Apply fix for iOS Safari viewport height
            document.documentElement.style.height = '100%';
            document.body.style.height = '100%';
            
            // Fix for iOS Safari bounce effect
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            // Adjust UI container for iOS notch if present
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.style.paddingTop = 'env(safe-area-inset-top)';
                gameContainer.style.paddingBottom = 'env(safe-area-inset-bottom)';
            }
            
            // Make UI toggle button easier to tap on iOS
            const uiToggle = document.getElementById('ui-toggle');
            if (uiToggle) {
                uiToggle.style.width = '44px';
                uiToggle.style.height = '44px';
                uiToggle.style.fontSize = '18px';
            }
        }
        
        // Disable long-press context menu on mobile
        window.addEventListener('contextmenu', (e) => {
            if (this.isMobileDevice) {
                e.preventDefault();
            }
        }, false);
        
        // Disable double-tap to zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd < 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, {passive: false});
    }

    /**
     * Run any registered initialization hooks
     */
    runInitHooks() {
        // Check if there are any registered initialization functions
        if (Array.isArray(IdleAnts.onInit)) {
            console.log(`Running ${IdleAnts.onInit.length} initialization hooks`);
            // Run each initialization function with this game instance as the argument
            IdleAnts.onInit.forEach(initFn => {
                try {
                    initFn(this);
                } catch (error) {
                    console.error('Error in initialization hook:', error);
                }
            });
        }
    }

    unlockAutofeeder() {
        if (this.resourceManager.unlockAutofeeder()) {
            // Show upgrade effect
            this.uiManager.showUpgradeEffect('unlock-autofeeder', 'Autofeeder Unlocked!');
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.updateButtonStates();
            
            return true;
        }
        return false;
    }
    
    upgradeAutofeeder() {
        if (this.resourceManager.upgradeAutofeeder()) {
            // Show upgrade effect
            this.uiManager.showUpgradeEffect('upgrade-autofeeder', `Autofeeder Level ${this.resourceManager.stats.autofeederLevel}!`);
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.updateButtonStates();
            
            return true;
        }
        return false;
    }
    
    // Delegates autofeeder activation to EntityManager
    activateAutofeeder() {
        if (this.entityManager && typeof this.entityManager.activateAutofeeder === 'function') {
            this.entityManager.activateAutofeeder();
        }
    }
    
    // Queen ant methods
    unlockQueen() {
        if (this.resourceManager.unlockQueen()) {
            // Show unlock effect
            this.uiManager.showUpgradeEffect('unlock-queen', 'Queen Ant Unlocked!');
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.updateButtonStates();
            
            return true;
        }
        return false;
    }
    
    buyQueen() {
        if (this.resourceManager.buyQueen()) {
            // Show purchase effect
            this.uiManager.showUpgradeEffect('buy-queen', 'Queen Ant Purchased!');
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.updateButtonStates();
            
            return true;
        }
        return false;
    }
    
    upgradeQueen() {
        if (this.resourceManager.upgradeQueen()) {
            // Show upgrade effect
            this.uiManager.showUpgradeEffect('upgrade-queen', `Queen Level ${this.resourceManager.stats.queenUpgradeLevel}!`);
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.updateButtonStates();
            
            return true;
        }
        return false;
    }

    // Car Ant Game Logic Methods
    unlockCarAnts() {
        if (this.resourceManager.unlockCarAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-car-ants', 'Car Ants Unlocked! Bay available.');
            return true;
        }
        return false;
    }

    buyCarAnt() {
        if (this.resourceManager.buyCarAnt()) {
            this.entityManager.createCarAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-car-ant', 'Car Ant built!');
            // Potentially play a car sound effect
            // if (IdleAnts.AudioAssets.SFX.CAR_ANT_SPAWN) {
            //     this.playSoundEffect(IdleAnts.AudioAssets.SFX.CAR_ANT_SPAWN.id);
            // }
            return true;
        }
        return false;
    }

    expandCarAntCapacity() {
        if (this.resourceManager.expandCarAntCapacity()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('expand-car-ants', 'Car Ant Bay Expanded!');
            return true;
        }
        return false;
    }

    // Fire Ant Game Logic Methods
    unlockFireAnts() {
        if (this.resourceManager.unlockFireAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-fire-ants', 'Fire Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyFireAnt() {
        if (this.resourceManager.buyFireAnt()) {
            this.entityManager.createFireAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-fire-ant', 'Fire Ant added!');
            return true;
        }
        return false;
    }

    expandFireAntCapacity() {
        if (this.resourceManager.expandFireAntCapacity()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('expand-fire-ants', 'Fire Ant capacity expanded!');
            return true;
        }
        return false;
    }
}; 

// ===== src/index.js =====
// Initialize the game when page loads
window.addEventListener('load', () => {
    // Debug mode is now set in the HTML before any scripts are loaded
    const game = new IdleAnts.Game();
}); 
