// src/effects/Trail.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.Trail = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFFFF, alpha = 0.2, isFlying = false, hasFood = false) {
        super(app, x, y);
        this.color = color;
        this.initialAlpha = alpha;
        this.isFlying = isFlying;
        this.hasFood = hasFood;
        
        // Trails last longer than other effects
        this.duration = isFlying ? 0.7 : 2.0; // Flying ant trails fade faster
        
        // Floating behavior for flying ant trails
        if (isFlying) {
            this.floatSpeed = Math.random() * 0.2 - 0.1;
        }
    }
    
    create() {
        // Create the trail graphic
        this.container = new PIXI.Graphics();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Draw based on trail type
        if (this.isFlying) {
            // Flying ant trail with glow
            this.container.beginFill(this.color, this.initialAlpha);
            this.container.drawCircle(0, 0, 2); // Slightly larger than regular ant trails
            this.container.endFill();
            
            // Add a subtle glow
            this.container.beginFill(this.color, this.initialAlpha * 0.3);
            this.container.drawCircle(0, 0, 4);
            this.container.endFill();
        } else {
            // Regular ant trail
            this.container.beginFill(this.color, this.initialAlpha);
            this.container.drawCircle(0, 0, 1.5);
            this.container.endFill();
        }
        
        this.app.stage.addChild(this.container);
    }
    
    update(delta) {
        // Call parent update to track elapsed time
        super.update(delta);
        
        // Apply floating effect for flying ant trails
        if (this.isFlying && this.floatSpeed) {
            this.container.y += this.floatSpeed;
        }
        
        // Calculate fade percentage - fade more rapidly in the second half of lifetime
        const fadeProgress = this.elapsed / this.duration;
        
        // Update alpha based on remaining time - non-linear fading for more natural look
        if (fadeProgress < 0.5) {
            // First half - maintain alpha
            this.container.alpha = this.initialAlpha;
        } else {
            // Second half - fade out
            const fadeRatio = (fadeProgress - 0.5) * 2; // 0 to 1 in second half
            this.container.alpha = this.initialAlpha * (1 - fadeRatio);
        }
        
        // Return whether the effect is still active
        return this.active;
    }
} 