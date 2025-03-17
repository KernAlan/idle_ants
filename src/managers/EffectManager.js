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