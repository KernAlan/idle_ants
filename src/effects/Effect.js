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
    }
    
    create() {
        // To be implemented by subclasses
        // Should set up the PIXI objects and add them to the stage
    }
    
    update(delta) {
        // To be implemented by subclasses
        // Should update the effect for each animation frame
        this.elapsed += delta;
        return this.elapsed < this.duration;
    }
    
    destroy() {
        // Remove the effect from the stage
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
        }
    }
    
    play() {
        this.create();
        
        const animate = () => {
            const delta = 0.1; // Fixed delta for consistency
            
            // If update returns false, the effect is complete
            if (!this.update(delta)) {
                this.destroy();
                return;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
} 