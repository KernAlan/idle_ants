// src/entities/Nest.js
IdleAnts.Entities.Nest = class extends PIXI.Sprite {
    constructor(texture, x, y) {
        super(texture);
        
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    // Add update method to fix EntityManager error
    update() {
        // Currently no per-frame updates needed for the nest
        // This method exists to prevent errors in EntityManager
    }
    
    expand() {
        // Animate the nest scaling
        const originalScale = this.scale.x || 1;
        const targetScale = originalScale * 1.1;
        let progress = 0;
        
        const animateNest = () => {
            progress += 0.05;
            
            if (progress >= 1) {
                this.scale.set(targetScale);
                return;
            }
            
            // Apply easing
            const easedProgress = Math.sin(progress * Math.PI / 2);
            this.scale.set(originalScale + (targetScale - originalScale) * easedProgress);
            
            requestAnimationFrame(animateNest);
        };
        
        animateNest();
    }
} 