// src/entities/FlyingAnt.js
IdleAnts.Entities.FlyingAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Call parent constructor with speed factor of 2.5 (flying ants are 2.5x faster)
        super(texture, nestPosition, speedMultiplier, 2.5);
        
        // Initialize wing animation variables
        this.wingPhase = Math.random() * Math.PI * 2;
        this.wingAnimationSpeed = 0.5; // Wings flap faster than legs move
        
        // Add specific flying ant properties
        this.minMovementSpeed = this.speed * 0.2; // Minimum speed even when "stuck"
        this.stuckCheckCounter = 0;
        this.lastPosition = { x: this.x, y: this.y };
        this.stuckThreshold = 0.5; // Distance under which we consider the ant might be stuck
        
        // Flying ants turn more quickly and sharply
        this.turnSpeed = 0.15 + Math.random() * 0.05; // Faster turns with more randomization

        // Debug flag to track cookie collection attempts
        this.debugCookieAttempts = 0;
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
    
    // Override findAndCollectFood method to ensure flying ants can collect cookies
    findAndCollectFood(foods) {
        // If already in the process of collecting food, continue with that
        if (this.isCollecting) {
            return false;
        }

        // If ant has reached its carrying capacity or no foods available, just wander
        if (this.capacityWeight >= this.capacity || foods.length === 0) {
            this.wander();
            return false;
        }
        
        // Find the closest food, with debug logging for cookies
        let closestFood = null;
        let closestDistance = Infinity;
        let foundCookie = false;
        
        for (let i = 0; i < foods.length; i++) {
            const food = foods[i];
            const dx = food.x - this.x;
            const dy = food.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if this is a cookie
            if (food.foodType && food.foodType.id === 'cookie') {
                foundCookie = true;
            }
            
            // Only consider food if it will fit in remaining capacity
            const foodWeight = food.foodType ? food.foodType.weight : 1;
            if (this.capacityWeight + foodWeight <= this.capacity && distance < closestDistance) {
                closestDistance = distance;
                closestFood = food;
            }
        }
        
        // Update target to the closest food
        this.targetFood = closestFood;
        
        // If ant reaches food, start the collection process
        if (closestFood && closestDistance < 10) {
            
            // Get base collection time for this food type
            let collectionTime = this.targetFood.foodType ? this.targetFood.foodType.collectionTime : 0;
            
            if (collectionTime > 0) {
                // Apply strength-based reduction to collection time
                if (IdleAnts && IdleAnts.app && IdleAnts.app.resourceManager) {
                    const strengthMultiplier = IdleAnts.app.resourceManager.stats.strengthMultiplier;
                    const reductionFactor = Math.min(0.75, (strengthMultiplier - 1) * 0.25);
                    collectionTime = collectionTime * (1 - reductionFactor);
                }
                
                // Start collection process
                this.isCollecting = true;
                this.collectionTimer = 0;
                this.collectionTarget = this.targetFood;
                
                // Temporarily stop moving while collecting
                this.vx = 0;
                this.vy = 0;
                
                return false;
            } else {
                // If no delay for this food type, collect immediately
                return true;
            }
        }
        
        // If no food is in range, move towards the closest one
        if (closestFood) {
            this.moveTowardsTarget(closestFood);
        } else {
            this.wander(); // Wander randomly if no food is available
        }
        
        return false;
    }
    
    // Override pickUpFood to ensure flying ants can pick up all food types
    pickUpFood(foodType) {
        // Call the parent method to handle the actual pickup
        super.pickUpFood(foodType);
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
    
    // Override update to add stuck detection before normal update
    update(nestPosition, foods) {
        // Check if the ant is stuck
        this.checkIfStuck();
        
        // Call the regular update from parent
        return super.update(nestPosition, foods);
    }
    
    // Method to detect and resolve stuck flying ants
    checkIfStuck() {
        this.stuckCheckCounter++;
        
        // Check every 10 frames
        if (this.stuckCheckCounter >= 10) {
            const dx = this.x - this.lastPosition.x;
            const dy = this.y - this.lastPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If the ant hasn't moved much over the past 10 frames, it might be stuck
            if (distance < this.stuckThreshold) {
                // Add a small random adjustment to break out of potential stuck situations
                const angle = Math.random() * Math.PI * 2;
                const impulse = this.speed * 0.5;
                this.vx += Math.cos(angle) * impulse;
                this.vy += Math.sin(angle) * impulse;
                
                // Ensure the ant has at least a minimum speed
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed < this.minMovementSpeed) {
                    this.vx = (this.vx / speed) * this.minMovementSpeed;
                    this.vy = (this.vy / speed) * this.minMovementSpeed;
                }
            }
            
            // Save current position for next check
            this.lastPosition.x = this.x;
            this.lastPosition.y = this.y;
            this.stuckCheckCounter = 0;
        }
    }
    
    // Add a moveTowardsTarget method specifically for flying ants
    moveTowardsTarget(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If already very close, slow down
        if (distance < 30) {
            // Slow down as we approach the target
            const slowdownFactor = Math.max(0.2, distance / 30);
            this.vx = (dx / distance) * this.speed * slowdownFactor;
            this.vy = (dy / distance) * this.speed * slowdownFactor;
        } else {
            // Regular movement towards target with a bit of randomness for flying behavior
            this.vx = (dx / distance) * this.speed + (Math.random() - 0.5) * 0.5;
            this.vy = (dy / distance) * this.speed + (Math.random() - 0.5) * 0.5;
        }
        
        // Special case for cookies - be more precise when targeting cookies
        if (target.foodType && target.foodType.id === 'cookie') {
            // Less randomness for important targets like cookies
            this.vx = (dx / distance) * this.speed * 1.1; // Slight speed boost
            this.vy = (dy / distance) * this.speed * 1.1;
        }
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
        
        // The rotation is now handled by updateRotation() method in the parent class
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
    
    // Override the carrying speed modifier for flying ants
    applyCarryingSpeedModifier() {
        // No speed penalty when carrying food - maintain original speed
        this.speed = this.originalSpeed;
        
        // Update minimum movement speed based on current speed
        this.minMovementSpeed = this.speed * 0.2;
        
        // Also update the max velocity
        this.maxVelocity = this.speed * 1.5;
    }
}; 