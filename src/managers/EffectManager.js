// src/managers/EffectManager.js
IdleAnts.Managers.EffectManager = class {
    constructor(app) {
        this.app = app;
        this.effects = [];
        this.effectClasses = {
            'spawn': IdleAnts.Effects.SpawnEffect,
            'foodSpawn': IdleAnts.Effects.FoodSpawnEffect,
            'foodDrop': IdleAnts.Effects.FoodDropEffect,
            'foodCollect': IdleAnts.Effects.FoodCollectEffect
        };
    }
    
    // Generic method for creating any type of effect
    createEffect(type, x, y, color) {
        const EffectClass = this.effectClasses[type];
        if (!EffectClass) {
            console.warn(`Effect type "${type}" not found`);
            return;
        }
        
        const effect = new EffectClass(this.app, x, y, color);
        this.effects.push(effect);
        effect.play();
        return effect;
    }
    
    // Legacy methods for backward compatibility
    createSpawnEffect(x, y, color = 0xFFFFFF) {
        return this.createEffect('spawn', x, y, color);
    }
    
    createFoodSpawnEffect(x, y, color = 0xFFFF99) {
        return this.createEffect('foodSpawn', x, y, color);
    }
    
    createFoodDropEffect(x, y, color = 0xFFFF99) {
        return this.createEffect('foodDrop', x, y, color);
    }
    
    createFoodCollectEffect(x, y, color = 0xFFFF99) {
        return this.createEffect('foodCollect', x, y, color);
    }
} 