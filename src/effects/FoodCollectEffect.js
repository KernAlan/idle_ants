// src/effects/FoodCollectEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.FoodCollectEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFF99) {
        super(app, x, y);
        this.color = color;
    }
    
    create() {
        // Small sparkle effect when food is collected
        this.container = new PIXI.Graphics();
        this.container.beginFill(this.color, 0.8);
        
        // Create a star shape
        const points = [];
        const outerRadius = 5;
        const innerRadius = 2;
        const totalPoints = 5;
        
        for (let i = 0; i < totalPoints * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (totalPoints * 2)) * Math.PI * 2;
            points.push(
                radius * Math.cos(angle),
                radius * Math.sin(angle)
            );
        }
        
        this.container.drawPolygon(points);
        this.container.endFill();
        this.container.x = this.x;
        this.container.y = this.y;
        
        this.app.stage.addChild(this.container);
    }
    
    update(delta) {
        this.elapsed += delta;
        
        // Fade out and rotate the sparkle
        this.container.alpha = 1 - this.elapsed;
        this.container.rotation += 0.2;
        this.container.scale.set(1 + this.elapsed);
        
        return this.elapsed < this.duration;
    }
} 