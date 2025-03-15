// src/entities/FlyingAnt.js
IdleAnts.Entities.FlyingAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Call parent constructor with speed factor of 2.5 (flying ants are 2.5x faster)
        super(texture, nestPosition, speedMultiplier, 2.5);
        
        // Initialize wing animation variables
        this.wingPhase = Math.random() * Math.PI * 2;
        this.wingAnimationSpeed = 0.5; // Wings flap faster than legs move
        
        // Override stuck detection settings for flying ants (more sensitive)
        this.minMovementSpeed = this.speed * 0.2; // Higher minimum speed for flying ants
        this.stuckThreshold = 0.5; // Lower threshold - flying ants should move more
        
        // Flying ants have randomized turn rates
        this.turnSpeed = 0.1 + Math.random() * 0.8; // Randomized between 0.1 and 0.9
        
        // Initialize stuck prevention with shorter delay for flying ants since they move faster
        this.stuckPrevention = { active: false, delay: 5 }; // Shorter delay than regular ants
    }
    
    // Override base scale for flying ants
    getBaseScale() {
        return 0.9 + Math.random() * 0.2; // Flying ants are closer to regular ant size
    }
    
    // Implement type-specific visual elements
    createTypeSpecificElements() {
        // Create wings
        this.createWings();
    }
    
    createWings() {
        // Create wing container
        this.wingsContainer = new PIXI.Container();
        this.addChild(this.wingsContainer);
        
        // Create simpler wings - just two small ovals
        // Create left wing
        this.leftWing = new PIXI.Graphics();
        this.leftWing.beginFill(0xFFFFFF, 0.6); // More transparent white
        this.leftWing.drawEllipse(0, 0, 5, 3); // Smaller wings
        this.leftWing.endFill();
        this.leftWing.position.set(-6, -2);
        
        // Create right wing
        this.rightWing = new PIXI.Graphics();
        this.rightWing.beginFill(0xFFFFFF, 0.6);
        this.rightWing.drawEllipse(0, 0, 5, 3);
        this.rightWing.endFill();
        this.rightWing.position.set(6, -2);
        
        // Add wings to container
        this.wingsContainer.addChild(this.leftWing);
        this.wingsContainer.addChild(this.rightWing);
    }
    
    // Implement flying ant specific animation
    performAnimation() {
        this.animateWings();
    }
    
    animateWings() {
        // Update wing animation phase
        this.wingPhase += this.wingAnimationSpeed;
        
        // Calculate wing flap animation values
        const wingFlap = Math.sin(this.wingPhase) * 0.6 + 0.4;
        
        // Apply wing flap animation
        this.leftWing.scale.y = wingFlap;
        this.rightWing.scale.y = wingFlap;
        
        // Slight vertical movement to simulate flight
        const hoverOffset = Math.sin(this.wingPhase * 0.2) * 2;
        this.y += (hoverOffset - this.lastHoverOffset || 0) * 0.1;
        this.lastHoverOffset = hoverOffset;
    }
    
    // Override wander method for more erratic flying ant movement
    wander() {
        // Random movement when wandering, more frequent direction changes for flying ants
        if (Math.random() < 0.1) { // 10% chance for flying ants vs 5% for regular ants
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        }
        
        // Add a small random variation to prevent getting stuck
        this.vx += (Math.random() - 0.5) * this.speed * 0.2;
        this.vy += (Math.random() - 0.5) * this.speed * 0.2;
        
        // Ensure minimum movement speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < this.minMovementSpeed) {
            this.vx = (this.vx / speed) * this.minMovementSpeed;
            this.vy = (this.vy / speed) * this.minMovementSpeed;
        }
    }
    
    // Override boundary handling for flying ants - they bounce instead of wrap
    handleBoundaries(width, height) {
        // Bounce off the sides with some random variation
        if (this.x < 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx) * (0.8 + Math.random() * 0.4);
        } else if (this.x > width) {
            this.x = width;
            this.vx = -Math.abs(this.vx) * (0.8 + Math.random() * 0.4);
        }
        
        // Flying ants can go slightly higher than regular ants
        if (this.y < -20) {
            this.y = -20;
            this.vy = Math.abs(this.vy) * (0.8 + Math.random() * 0.4);
        } else if (this.y > height) {
            this.y = height;
            this.vy = -Math.abs(this.vy) * (0.8 + Math.random() * 0.4);
        }
    }
}; 