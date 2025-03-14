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