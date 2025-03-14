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