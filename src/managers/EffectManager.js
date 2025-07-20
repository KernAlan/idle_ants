// src/managers/EffectManager.js

// Logger setup
const logger = IdleAnts.Logger?.create('EffectManager') || console;
// Validation helpers
const validateObject = (obj, name) => {
    if (!obj) {
        logger.error(`${name} is null or undefined`);
        throw new Error(`${name} is required but was ${obj}`);
    }
    return obj;
};

const validateFunction = (fn, name) => {
    if (typeof fn !== 'function') {
        logger.error(`${name} is not a function`);
        throw new Error(`${name} must be a function but was ${typeof fn}`);
    }
    return fn;
};

const safeCall = (fn, context, ...args) => {
    try {
        return fn.apply(context, args);
    } catch (error) {
        logger.error('Safe call failed', error);
        throw error;
    }
};



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
            logger.warn(`Effect type "${type}" not found`);
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
    
    createFoodRewardEffect(x, y, amount) {
        // Create multiple food collect effects to show reward
        const numEffects = Math.min(8, Math.floor(amount / 20) + 1);
        
        for (let i = 0; i < numEffects; i++) {
            const angle = (i / numEffects) * Math.PI * 2;
            const radius = 10 + Math.random() * 15;
            const effectX = x + Math.cos(angle) * radius;
            const effectY = y + Math.sin(angle) * radius;
            
            // Use golden color for food rewards
            const color = 0xFFD700;
            
            // Create the effect with a slight delay for each one
            setTimeout(() => {
                this.createFoodCollectEffect(effectX, effectY, color, 1.5);
            }, i * 50);
        }
        
        // Create a text effect showing the amount
        this.createTextEffect(x, y - 20, `+${amount} Food`, 0xFFD700);
    }
    
    createTextEffect(x, y, text, color) {
        // Create a simple text effect that floats upward
        const textEffect = new PIXI.Text(text, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: color,
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 3,
            dropShadowAngle: Math.PI / 2,
            dropShadowDistance: 2
        });
        
        textEffect.x = x;
        textEffect.y = y;
        textEffect.anchor.set(0.5);
        textEffect.alpha = 1;
        
        // Add to the world container
        if (this.app.worldContainer) {
            this.app.worldContainertry { .addChild(textEffect); } catch(error) { logger.error("AddChild operation failed", error); }
        }
        
        // Animate the text effect
        let life = 0;
        const maxLife = 2; // 2 seconds
        
        const animate = () => {
            life += 0.016; // 60fps
            
            // Move upward
            textEffect.y -= 30 * 0.016;
            
            // Fade out
            textEffect.alpha = Math.max(0, 1 - (life / maxLife));
            
            if (life >= maxLife) {
                if (textEffect.parent) {
                    textEffect.parent.removeChild(textEffect);
                }
                return;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
} 