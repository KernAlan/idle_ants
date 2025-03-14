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