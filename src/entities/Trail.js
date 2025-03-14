// src/entities/Trail.js
IdleAnts.Entities.Trail = class extends PIXI.Graphics {
    // Define trail state constants
    static States = {
        ACTIVE: 'active',    // Newly created, fully visible
        FADING: 'fading',    // Gradually becoming transparent
        EXPIRED: 'expired'   // Ready for removal
    };
    
    constructor(x, y, color, alpha, lifetime, isFlying = false, hasFood = false) {
        super();
        
        // Set position
        this.x = x;
        this.y = y;
        
        // Store properties
        this.initialAlpha = alpha;
        this.baseColor = color;
        this.initialLifetime = lifetime;
        this.timeToLive = lifetime;
        this.isFlying = isFlying;
        this.hasFood = hasFood;
        
        // Floating behavior for flying ant trails
        if (isFlying) {
            this.floatSpeed = Math.random() * 0.2 - 0.1;
        }
        
        // State initialization
        this.state = IdleAnts.Entities.Trail.States.ACTIVE;
        this.fadingThreshold = Math.floor(lifetime * 0.7); // Start fading at 70% of lifetime
        
        // Draw the trail based on type
        this.drawTrail();
    }
    
    // State transition method
    transitionToState(newState) {
        // Set the new state
        this.state = newState;
        
        // Handle entry actions for the new state
        switch(newState) {
            case IdleAnts.Entities.Trail.States.FADING:
                // Start the fading animation
                break;
                
            case IdleAnts.Entities.Trail.States.EXPIRED:
                // Make sure the trail is fully transparent for removal
                this.alpha = 0;
                break;
        }
    }
    
    // Draw the trail particle based on type
    drawTrail() {
        this.clear();
        
        // Draw based on trail type
        if (this.isFlying) {
            // Flying ant trail with glow
            this.beginFill(this.baseColor, this.initialAlpha);
            this.drawCircle(0, 0, 2); // Slightly larger than regular ant trails
            this.endFill();
            
            // Add a subtle glow
            this.beginFill(this.baseColor, this.initialAlpha * 0.3);
            this.drawCircle(0, 0, 4);
            this.endFill();
        } else {
            // Regular ant trail
            this.beginFill(this.baseColor, this.initialAlpha);
            this.drawCircle(0, 0, 1.5);
            this.endFill();
        }
        
        // Set initial alpha
        this.alpha = this.initialAlpha;
    }
    
    // Update method - returns true if the trail should be removed
    update() {
        // Decrement lifetime counter
        this.timeToLive--;
        
        // Apply floating effect for flying ant trails
        if (this.isFlying && this.floatSpeed) {
            this.y += this.floatSpeed;
        }
        
        // State-specific updates
        switch(this.state) {
            case IdleAnts.Entities.Trail.States.ACTIVE:
                this.updateActive();
                break;
                
            case IdleAnts.Entities.Trail.States.FADING:
                this.updateFading();
                break;
                
            case IdleAnts.Entities.Trail.States.EXPIRED:
                return true; // Signal for removal
        }
        
        // Return false if the trail should continue to exist
        return false;
    }
    
    // Update for ACTIVE state
    updateActive() {
        // Check if it's time to start fading
        if (this.timeToLive <= this.fadingThreshold) {
            this.transitionToState(IdleAnts.Entities.Trail.States.FADING);
        }
    }
    
    // Update for FADING state
    updateFading() {
        // Calculate fade percentage
        const fadeProgress = this.timeToLive / this.fadingThreshold;
        
        // Update alpha based on remaining time
        this.alpha = fadeProgress * this.initialAlpha;
        
        // If fully faded, transition to expired
        if (this.timeToLive <= 0) {
            this.transitionToState(IdleAnts.Entities.Trail.States.EXPIRED);
        }
    }
}; 