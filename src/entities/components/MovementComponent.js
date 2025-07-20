/**
 * MovementComponent - Handles ant movement behavior and physics
 * Extracted from AntBase.js for better maintainability
 */

// Ensure Components namespace exists
if (!IdleAnts.Entities.Components) {
    IdleAnts.Entities.Components = {};
}

IdleAnts.Entities.Components.MovementComponent = class {
    constructor(ant) {
        this.ant = ant;
        
        // Movement properties
        this.velocity = { x: 0, y: 0 };
        this.momentum = 0.95;
        this.maxVelocity = ant.speed * 1.5;
        this.steerForce = 0.05;
        this.separationRadius = 30;
        this.separationStrength = 0.02;
        
        // Trail system
        this.trail = [];
        this.maxTrailLength = 20;
        this.trailDecayRate = 0.95;
        
        // Movement state
        this.isMoving = false;
        this.lastPosition = { x: ant.x, y: ant.y };
        this.stuckCounter = 0;
        this.maxStuckFrames = 60; // 1 second at 60fps
    }

    /**
     * Update movement physics and position
     * @param {Array} nearbyAnts - Array of nearby ants for separation
     */
    update(nearbyAnts = []) {
        this.updateTrail();
        this.checkIfStuck();
        
        if (nearbyAnts.length > 0) {
            this.applySeparation(nearbyAnts);
        }
        
        this.applyMomentum();
        this.constrainVelocity();
        this.updatePosition();
    }

    /**
     * Move towards a target position
     * @param {object} target - Target position {x, y}
     * @param {number} arrivalThreshold - Distance at which to consider arrived
     * @returns {boolean} True if arrived at target
     */
    moveTowards(target, arrivalThreshold = 20) {
        if (!target) return false;

        const dx = target.x - this.ant.x;
        const dy = target.y - this.ant.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < arrivalThreshold) {
            this.velocity.x *= 0.8; // Slow down when arriving
            this.velocity.y *= 0.8;
            return true; // Arrived
        }

        // Calculate steering force
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        const desiredVelocityX = normalizedDx * this.ant.speed;
        const desiredVelocityY = normalizedDy * this.ant.speed;
        
        const steerX = (desiredVelocityX - this.velocity.x) * this.steerForce;
        const steerY = (desiredVelocityY - this.velocity.y) * this.steerForce;
        
        this.velocity.x += steerX;
        this.velocity.y += steerY;

        return false; // Not arrived yet
    }

    /**
     * Apply separation force to avoid other ants
     * @param {Array} nearbyAnts - Array of nearby ants
     */
    applySeparation(nearbyAnts) {
        let separationForceX = 0;
        let separationForceY = 0;
        let count = 0;

        for (const otherAnt of nearbyAnts) {
            if (otherAnt === this.ant) continue;

            const dx = this.ant.x - otherAnt.x;
            const dy = this.ant.y - otherAnt.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.separationRadius && distance > 0) {
                const normalizedDx = dx / distance;
                const normalizedDy = dy / distance;
                
                // Stronger separation for closer ants
                const strength = (this.separationRadius - distance) / this.separationRadius;
                
                separationForceX += normalizedDx * strength;
                separationForceY += normalizedDy * strength;
                count++;
            }
        }

        if (count > 0) {
            separationForceX /= count;
            separationForceY /= count;
            
            this.velocity.x += separationForceX * this.separationStrength;
            this.velocity.y += separationForceY * this.separationStrength;
        }
    }

    /**
     * Apply momentum to velocity
     */
    applyMomentum() {
        this.velocity.x *= this.momentum;
        this.velocity.y *= this.momentum;
    }

    /**
     * Constrain velocity to maximum limits
     */
    constrainVelocity() {
        const velocityMagnitude = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        
        if (velocityMagnitude > this.maxVelocity) {
            this.velocity.x = (this.velocity.x / velocityMagnitude) * this.maxVelocity;
            this.velocity.y = (this.velocity.y / velocityMagnitude) * this.maxVelocity;
        }
    }

    /**
     * Update ant position based on velocity
     */
    updatePosition() {
        this.lastPosition.x = this.ant.x;
        this.lastPosition.y = this.ant.y;
        
        this.ant.x += this.velocity.x;
        this.ant.y += this.velocity.y;
        
        // Update rotation to face movement direction
        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
            this.ant.rotation = Math.atan2(this.velocity.y, this.velocity.x);
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    }

    /**
     * Update trail system
     */
    updateTrail() {
        // Add current position to trail
        this.trail.push({ x: this.ant.x, y: this.ant.y, alpha: 1.0 });
        
        // Remove old trail points
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Decay trail alpha
        for (const point of this.trail) {
            point.alpha *= this.trailDecayRate;
        }
    }

    /**
     * Check if ant is stuck and apply unstuck logic
     */
    checkIfStuck() {
        const movementThreshold = 2;
        const dx = this.ant.x - this.lastPosition.x;
        const dy = this.ant.y - this.lastPosition.y;
        const movement = Math.sqrt(dx * dx + dy * dy);
        
        if (movement < movementThreshold && this.isMoving) {
            this.stuckCounter++;
            
            if (this.stuckCounter > this.maxStuckFrames) {
                this.unstick();
            }
        } else {
            this.stuckCounter = 0;
        }
    }

    /**
     * Apply random force to unstick ant
     */
    unstick() {
        const randomAngle = Math.random() * Math.PI * 2;
        const unstickForce = this.ant.speed * 0.5;
        
        this.velocity.x += Math.cos(randomAngle) * unstickForce;
        this.velocity.y += Math.sin(randomAngle) * unstickForce;
        
        this.stuckCounter = 0;
        console.log('Ant unstuck applied');
    }

    /**
     * Stop movement immediately
     */
    stop() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.isMoving = false;
    }

    /**
     * Get current velocity magnitude
     * @returns {number} Current speed
     */
    getCurrentSpeed() {
        return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    }

    /**
     * Check if ant is currently moving
     * @returns {boolean} True if moving
     */
    isCurrentlyMoving() {
        return this.isMoving && this.getCurrentSpeed() > 0.1;
    }

    /**
     * Get trail points for rendering
     * @returns {Array} Array of trail points with position and alpha
     */
    getTrail() {
        return this.trail.filter(point => point.alpha > 0.1);
    }

    /**
     * Set movement speed multiplier
     * @param {number} multiplier - Speed multiplier
     */
    setSpeedMultiplier(multiplier) {
        this.ant.speed = this.ant.originalSpeed * multiplier;
        this.maxVelocity = this.ant.speed * 1.5;
    }

    /**
     * Handle state changes from StateComponent
     * @param {string} fromState - Previous state
     * @param {string} toState - New state
     * @param {object} data - Additional state transition data
     */
    onStateChange(fromState, toState, data) {
        // Adjust movement behavior based on new state
        switch (toState) {
            case 'spawning':
                this.reset();
                break;
            case 'seekingFood':
                // No special movement changes needed
                break;
            case 'collectingFood':
                // Slow down when collecting
                this.setSpeedMultiplier(0.5);
                break;
            case 'returningToNest':
                // Loaded speed multiplier
                this.setSpeedMultiplier(0.8);
                break;
            case 'deliveringFood':
                // Slow down at nest
                this.setSpeedMultiplier(0.3);
                break;
            case 'fighting':
                // Stop movement during combat
                this.stop();
                break;
            default:
                // Reset to normal speed for unknown states
                this.setSpeedMultiplier(1.0);
                break;
        }
    }

    /**
     * Reset movement component
     */
    reset() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.trail = [];
        this.stuckCounter = 0;
        this.isMoving = false;
    }
};