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