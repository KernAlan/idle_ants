// src/effects/FoodSpawnEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.FoodSpawnEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFF99) {
        super(app, x, y);
        this.color = color;
    }
    
    create() {
        // Create a ripple effect when food is placed
        this.container = new PIXI.Graphics();
        this.container.lineStyle(2, this.color, 0.8);
        this.container.drawCircle(0, 0, 5);
        this.container.x = this.x;
        this.container.y = this.y;
        
        this.app.stage.addChild(this.container);
    }
    
    update(delta) {
        this.elapsed += delta;
        
        // Expand and fade the ripple
        this.container.scale.set(1 + this.elapsed * 2);
        this.container.alpha = 1 - this.elapsed;
        
        return this.elapsed < this.duration;
    }
} 