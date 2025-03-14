// src/effects/SpawnEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.SpawnEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFFFF) {
        super(app, x, y);
        this.color = color;
        this.duration = 0.5; // Half-second duration for spawn effect
    }
    
    create() {
        // Create a starburst effect when an ant spawns
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Create several particles that expand outward
        for (let i = 0; i < 8; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(this.color);
            particle.drawCircle(0, 0, 2);
            particle.endFill();
            
            const angle = (i / 8) * Math.PI * 2;
            particle.vx = Math.cos(angle) * 2;
            particle.vy = Math.sin(angle) * 2;
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
            particle.alpha -= 0.05;
            
            if (particle.alpha <= 0) {
                particle.alpha = 0;
            }
        }
        
        // Return whether the effect is still active
        return this.active;
    }
} 