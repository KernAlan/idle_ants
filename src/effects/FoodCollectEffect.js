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