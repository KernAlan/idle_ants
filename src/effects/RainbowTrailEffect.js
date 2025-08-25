// src/effects/RainbowTrailEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.RainbowTrailEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFF69B4, scale = 1.0, options = {}) {
        super(app, x, y);
        this.color = color;
        this.scale = scale;
        
        // Rainbow trail properties
        this.duration = options.duration || 10; // Short-lived
        this.trailPoints = options.trailPoints || [];
        this.rainbowColors = [
            0xFF0000, // Red
            0xFF8000, // Orange  
            0xFFFF00, // Yellow
            0x00FF00, // Green
            0x0080FF, // Blue
            0x8000FF, // Indigo
            0xFF00FF  // Violet
        ];
    }
    
    create() {
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Create rainbow trail from points
        this.createRainbowSegments();
        
        this.app.stage.addChild(this.container);
    }
    
    createRainbowSegments() {
        if (this.trailPoints.length < 2) return;
        
        for (let i = 1; i < this.trailPoints.length; i++) {
            const prevPoint = this.trailPoints[i - 1];
            const currentPoint = this.trailPoints[i];
            
            // Create segment between points
            const segment = new PIXI.Graphics();
            
            // Cycle through rainbow colors
            const colorIndex = i % this.rainbowColors.length;
            const segmentColor = this.rainbowColors[colorIndex];
            
            segment.lineStyle(3, segmentColor, 0.8);
            segment.moveTo(prevPoint.x - this.x, prevPoint.y - this.y);
            segment.lineTo(currentPoint.x - this.x, currentPoint.y - this.y);
            
            // Add sparkle effect
            const sparkle = new PIXI.Graphics();
            sparkle.beginFill(segmentColor, 0.6);
            sparkle.drawStar((currentPoint.x - this.x), (currentPoint.y - this.y), 4, 2, 1);
            sparkle.endFill();
            
            this.container.addChild(segment);
            this.container.addChild(sparkle);
        }
    }
    
    update(delta) {
        super.update(delta);
        
        // Fade out the trail
        this.container.alpha = Math.max(0, 1 - (this.elapsed / (this.duration * 0.016)));
        
        // Rotate sparkles
        for (const child of this.container.children) {
            if (child.rotation !== undefined) {
                child.rotation += 0.2;
            }
        }
        
        return this.active;
    }
};