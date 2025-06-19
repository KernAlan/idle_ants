// src/entities/AntBase.js
IdleAnts.Entities.AntBase = class extends PIXI.Sprite {
    // Define state constants
    static States = {
        SPAWNING: 'spawning',
        SEEKING_FOOD: 'seekingFood', 
        COLLECTING_FOOD: 'collectingFood',
        RETURNING_TO_NEST: 'returningToNest',
        DELIVERING_FOOD: 'deliveringFood',
        FIGHTING: 'fighting'
    };
    
    constructor(texture, nestPosition, speedMultiplier = 1, speedFactor = 1) {
        super(texture);
        
        this.anchor.set(0.5);
        
        // ABSOLUTELY CRITICAL: Ensure position starts at nest
        this.x = nestPosition.x;
        this.y = nestPosition.y;
        
        // Store nest position for reference - make a deep copy to avoid reference issues
        this.nestPosition = { 
            x: nestPosition.x,
            y: nestPosition.y 
        };
        
        // CRITICAL FIX: Initialize food pickup position tracking
        this.lastFoodPickupPos = null;
        
        // Add a timeout counter for returning to nest to prevent permanent stuck state
        this.returningToNestTimeout = 0;
        this.maxReturningToNestTime = 600; // 10 seconds at 60fps
        
        // Ant properties
        this.baseSpeed = (1 + Math.random() * 0.5) * 2.0;
        this.speedFactor = speedFactor; // Type-specific speed factor (1 for regular ants, 10 for flying ants, etc.)
        this.speed = this.baseSpeed * speedMultiplier * this.speedFactor;
        this.originalSpeed = this.speed;
        this.targetFood = null;
        this.isAtFullCapacity = false; // Renamed from hasFood
        
        // Simple capacity property - how many food items an ant can carry
        this.capacity = 1;
        this.foodCollected = 0; // Number of food items collected so far
        
        // Movement properties
        this.momentum = 0.95; // How much of current velocity is preserved (slight damping)
        this.maxVelocity = this.speed * 1.5; // Maximum velocity (to prevent excessive speed)
        
        // Set base scale with random variation
        this.baseScale = this.getBaseScale();
        this.scale.set(this.baseScale, this.baseScale);
        
        // CRITICAL: Ensure zero velocity at start
        this.vx = 0;
        this.vy = 0;
        
        // The sprite is drawn facing up, but we need it to face right for proper rotation
        this.rotation = -Math.PI / 2;
        
        // Smooth rotation properties
        this.targetRotation = this.rotation;
        this.turnSpeed = 0.1 + Math.random() * 0.8; // Randomized between 0.1 and 0.9
        
        // Create ant-specific visual elements
        this.createVisualElements();
        
        // Add properties for food collection state
        this.isCollecting = false;
        this.collectionTimer = 0;
        this.collectionTarget = null;
        this.capacityWeight = 0; // Track weight-based capacity used
        
        // Add stuck prevention properties
        this.stuckPrevention = { active: false, delay: 0 };
        
        // Add stuck detection properties - useful for all ant types
        this.minMovementSpeed = this.speed * 0.1; // Minimum speed even when "stuck"
        this.stuckCheckCounter = 0;
        this.lastPosition = { x: this.x, y: this.y };
        this.stuckThreshold = 1.0; // Distance under which we consider the ant might be stuck
        
        // Add flag for smooth transition when moving to nest
        this.justCollectedFood = false;
        this.transitionDelay = 0; // Will be set in update method
        
        // Configuration properties based on ant attributes
        this.config = {
            canStackFood: this.capacity > 1,
            minDistanceToDepositFood: 15, // Reduced from 50 to 15 to allow ants to deposit food more easily
            foodCollectionRadius: 10,     // How close ant needs to be to collect food
            nestRadius: 10,               // How close ant needs to be to nest
            moveSpeedLoaded: this.speed * 0.8,
            turnSpeed: 0.1 + Math.random() * 0.8, // Randomized between 0.1 and 0.9
            stuckThreshold: 1.0,
            minMovementSpeed: this.speed * 0.1
        };
        
        // State initialization
        this.state = IdleAnts.Entities.AntBase.States.SPAWNING;
        
        // Health properties
        this.maxHp = 50;
        this.hp = this.maxHp;
        this.createHealthBar();
        this.healthBarTimer = 0; // frames remaining to show health bar
        
        // Combat properties
        this.attackDamage = 5;
        this.attackCooldown = 30;
        this._attackTimer = 0;
        this.targetEnemy = null;
    }
    
    // Template method - subclasses can override to provide different scales
    getBaseScale() {
        return 0.8 + Math.random() * 0.4;
    }
    
    // Template method - subclasses will implement with their specific visual elements
    createVisualElements() {
        // Create common elements
        this.createShadow();
        
        // Create type-specific elements (implemented by subclasses)
        this.createTypeSpecificElements();
        
        // Create food indicator
        this.createFoodIndicator();
    }
    
    // Template method for subclasses to implement their specific visual elements
    createTypeSpecificElements() {
        // Implemented by subclasses
    }
    
    createShadow() {
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.2);
        shadow.drawEllipse(0, 0, 8, 4);
        shadow.endFill();
        shadow.y = 8; // Position under the ant
        this.addChild(shadow);
    }
    
    createFoodIndicator() {
        // Create a visual indicator for when the ant is carrying food
        this.foodIndicator = new PIXI.Container();
        
        // Draw a small piece of food
        const baseFood = new PIXI.Graphics();
        baseFood.beginFill(0xEAD2AC); // Light beige
        baseFood.drawCircle(0, 0, 3);
        baseFood.endFill();
        
        // Add some detail
        baseFood.beginFill(0xD9BF93); // Darker beige for shadow
        baseFood.drawCircle(0.5, 0.5, 1.5);
        baseFood.endFill();
        
        // Add the base food to the container
        this.foodIndicator.addChild(baseFood);
        
        // Position the food above the ant
        this.foodIndicator.x = 0;
        this.foodIndicator.y = -6;
        
        // Hide it initially
        this.foodIndicator.visible = false;
        
        // Add it to the ant
        this.addChild(this.foodIndicator);
    }
    
    createHealthBar() {
        // Create a separate container so the health bar is NOT affected by ant rotation
        this.healthBarContainer = new PIXI.Container();
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(this.healthBarContainer);
        } else {
            // Fallback: attach to ant, but this should rarely happen
            this.addChild(this.healthBarContainer);
        }
        this.healthBarContainer.visible = false;

        this.healthBarBg = new PIXI.Graphics();
        this.healthBarBg.beginFill(0x000000, 0.6);
        this.healthBarBg.drawRect(-10, 0, 20, 3);
        this.healthBarBg.endFill();
        this.healthBarContainer.addChild(this.healthBarBg);

        this.healthBarFg = new PIXI.Graphics();
        this.healthBarContainer.addChild(this.healthBarFg);
        this.updateHealthBar();
    }

    updateHealthBar() {
        const ratio = Math.max(this.hp,0) / this.maxHp;
        this.healthBarFg.clear();
        this.healthBarFg.beginFill(0x00FF00);
        this.healthBarFg.drawRect(-10, 0, 20 * ratio, 3);
        this.healthBarFg.endFill();
        this.healthBarContainer.visible = true;
        this.healthBarTimer = 1800; // 30 seconds at 60fps

        // Ensure bar is positioned just above the ant and always horizontal
        this.healthBarContainer.x = this.x;
        this.healthBarContainer.y = this.y - 20;
        this.healthBarContainer.rotation = 0;
    }

    takeDamage(dmg) {
        this.hp -= dmg;
        this.updateHealthBar();
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        if (this.parent) this.parent.removeChild(this);
        this.isDead = true;
        // Remove detached health bar
        if (this.healthBarContainer && this.healthBarContainer.parent) {
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
        }
    }
    
    update(nestPosition, foods) {
        // Keep health bar fixed above the sprite regardless of rotation
        if (this.healthBarContainer) {
            this.healthBarContainer.x = this.x;
            this.healthBarContainer.y = this.y - 20;
            this.healthBarContainer.rotation = 0;
        }
        // Handle health bar timer
        if(this.healthBarTimer>0){
            this.healthBarTimer--;
            if(this.healthBarTimer===0 && this.healthBarContainer){
                this.healthBarContainer.visible=false;
            }
        }
        // Check if the ant is stuck
        this.checkIfStuck();
        
        // Perform animations regardless of state
        this.performAnimation();
        
        // State-specific behavior
        switch (this.state) {
            case IdleAnts.Entities.AntBase.States.SPAWNING:
                return this.updateSpawning(nestPosition);
                
            case IdleAnts.Entities.AntBase.States.SEEKING_FOOD:
                return this.updateSeekingFood(foods);
                
            case IdleAnts.Entities.AntBase.States.COLLECTING_FOOD:
                return this.updateCollectingFood();
                
            case IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST:
                return this.updateReturningToNest(nestPosition);
                
            case IdleAnts.Entities.AntBase.States.DELIVERING_FOOD:
                return this.updateDeliveringFood();
                
            case IdleAnts.Entities.AntBase.States.FIGHTING:
                return this.updateFighting();
        }
        
        return false; // Default no action
    }
    
    // Handle spawning state - ant starts at nest and prepares to move
    updateSpawning(nestPosition) {
        // Set initial random direction
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * this.speed * 0.5;
        this.vy = Math.sin(angle) * this.speed * 0.5;
        
        // Immediately transition to seeking food
        this.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
        return false;
    }
    
    // Handle seeking food state - ant looks for closest food source
    updateSeekingFood(foods) {
        // PRIORITIZE ENEMY COMBAT OVER FOOD
        if (this.targetEnemy && !this.targetEnemy.isDead) {
            const dx = this.targetEnemy.x - this.x;
            const dy = this.targetEnemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const engageDist = 20;

            // If within engage range, switch to fighting state
            if (distance <= engageDist) {
                this.transitionToState(IdleAnts.Entities.AntBase.States.FIGHTING);
                return false;
            }

            // Otherwise move toward the enemy like we would toward food
            this.moveTowardsTarget(this.targetEnemy);
            this.applyMovement();
            return false;
        }
        
        // If ant can't carry more food, transition to returning to nest
        if (!this.canCarryMoreFood()) {
            this.transitionToState(IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST);
            return false;
        }
        
        // Handle stuck prevention delay
        if (this.stuckPrevention && this.stuckPrevention.active) {
            this.stuckPrevention.delay--;
            
            if (this.stuckPrevention.delay <= 0) {
                this.stuckPrevention.active = false;
            } else {
                this.wander();
                this.applyMovement();
                return false;
            }
        }
        
        // No food available, just wander
        if (foods.length === 0) {
            this.wander();
            this.applyMovement();
            return false;
        }
        
        // Find closest food
        let closestFood = null;
        let closestDistance = Infinity;
        
        for (let i = 0; i < foods.length; i++) {
            const food = foods[i];
            const dx = food.x - this.x;
            const dy = food.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Consider all food regardless of weight
            if (distance < closestDistance) {
                closestDistance = distance;
                closestFood = food;
            }
        }
        
        // Update target food
        this.targetFood = closestFood;
        
        // If reached food, start collecting
        if (closestFood && closestDistance < this.config.foodCollectionRadius) {
            // Prepare for collection
            this.collectionTarget = this.targetFood;
            this.collectionTimer = 0;
            
            // Register this ant with the food item
            if (this.id === undefined) {
                this.id = 'ant_' + Math.random().toString(36).substr(2, 9);
            }
            this.collectionTarget.addCollectingAnt(this);
            
            // Stop moving while collecting
            this.vx = 0;
            this.vy = 0;
            
            // Record position for pickup/deposit distance tracking
            this.lastFoodPickupPos = { x: this.x, y: this.y };
            
            // Transition to collecting state
            this.transitionToState(IdleAnts.Entities.AntBase.States.COLLECTING_FOOD);
            return false;
        }
        
        // No food in range, move towards closest food or wander
        if (closestFood) {
            this.moveTowardsTarget(closestFood);
        } else {
            this.wander();
        }
        
        this.applyMovement();
        return false;
    }
    
    // Handle collecting food state
    updateCollectingFood() {
        // Verify the food target still exists
        if (!this.collectionTarget || 
            (IdleAnts.app.entityManager && 
             !IdleAnts.app.entityManager.entities.foods.includes(this.collectionTarget))) {
            // Food is gone, return to seeking
            this.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
            return false;
        }
        
        // Continue collecting
        const contributionAmount = 0.016; // For 60fps
        this.collectionTarget.recordAntContribution(this, contributionAmount);
        
        // Get updated collection time
        const collectionTime = this.collectionTarget.getCollectionTimeForAnt(this);
        this.collectionTimer += 0.016;
        
        // Show eating animation
        this.createEatingEffect();
        
        // Check if collection is complete
        if (this.collectionTimer >= collectionTime) {
            // Collection complete, signal to collect food
            return true;
        }
        
        return false;
    }
    
    // Handle returning to nest state
    updateReturningToNest(nestPosition) {
        // Move towards nest
        this.moveToNest(nestPosition);
        
        // Increment timeout counter
        this.returningToNestTimeout++;
        
        // If ant has been stuck for too long, force deposit
        if (this.returningToNestTimeout > this.maxReturningToNestTime) {
            // Reset timeout
            this.returningToNestTimeout = 0;
            
            // Force transition to delivering state if we're close enough to the nest
            if (this.isAtNest(nestPosition)) {
                this.transitionToState(IdleAnts.Entities.AntBase.States.DELIVERING_FOOD);
                return true; // Signal to deliver food
            }
        }
        
        // Check if at nest and can deliver food
        if (this.foodCollected > 0 && this.isAtNest(nestPosition) && this.hasMovedFarEnoughFromPickup()) {
            // Reset timeout
            this.returningToNestTimeout = 0;
            
            // Transition to delivering state
            this.transitionToState(IdleAnts.Entities.AntBase.States.DELIVERING_FOOD);
            return true; // Signal to deliver food
        }
        
        this.applyMovement();
        return false;
    }
    
    // Handle delivering food state
    updateDeliveringFood() {
        // This state is mostly handled by EntityManager
        // It should transition back to seeking food once food is delivered
        // The return value true triggers the EntityManager to call deliverFood
        return true;
    }
    
    // Helper to apply movement with momentum and rotation
    applyMovement() {
        // Apply momentum
        this.vx *= this.momentum;
        this.vy *= this.momentum;
        
        // Cap velocity
        this.capVelocity();
        
        // Apply movement
        this.x += this.vx;
        this.y += this.vy;
        
        // Update rotation
        this.updateRotation();
    }
    
    // Limit velocity to prevent excessive speeds
    capVelocity() {
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > this.maxVelocity) {
            this.vx = (this.vx / currentSpeed) * this.maxVelocity;
            this.vy = (this.vy / currentSpeed) * this.maxVelocity;
        }
    }
    
    // Template method for ant-specific animations
    performAnimation() {
        // Implemented by subclasses
    }
    
    moveToNest(nestPosition) {
        const dx = nestPosition.x - this.x;
        const dy = nestPosition.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If very close to nest, just slow down instead of stopping completely
        if (distance < 10) {
            const slowdownFactor = distance / 10; // Gradually slow down approaching nest
            this.vx = (dx / distance) * this.speed * slowdownFactor;
            this.vy = (dy / distance) * this.speed * slowdownFactor;
            return;
        }
        
        // Simple normalized movement towards nest
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
    }
    
    isAtNest(nestPosition) {
        // If we're in a transition delay, don't consider at nest yet
        if (this.transitionDelay > 0) {
            return false;
        }
        
        const dx = nestPosition.x - this.x;
        const dy = nestPosition.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Use a slightly larger radius for ants carrying food to make it easier to deposit
        const effectiveRadius = this.foodCollected > 0 ? 
            this.config.nestRadius * 1.2 : // 20% larger radius when carrying food
            this.config.nestRadius;
        
        return distance < effectiveRadius;
    }
    
    // Add a new method for moving towards a target (food, etc.)
    moveTowardsTarget(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Simple normalized movement towards target
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
    }
    
    // Template method that can be customized by subclasses
    wander() {
        // Default wandering behavior
        if (Math.random() < 0.05) {
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        }
        
        // The rotation is now handled by updateRotation() method
    }
    
    findAndCollectFood(foods) {
        // If already in the process of collecting food, continue with that
        if (this.isCollecting && this.collectionTarget) {
            // Check if the food target still exists in the game world
            // If it doesn't exist anymore (was eaten by another ant), stop collecting
            if (IdleAnts.app.entityManager && 
                !IdleAnts.app.entityManager.entities.foods.includes(this.collectionTarget)) {
                // Food is gone, reset collection state
                this.isCollecting = false;
                this.collectionTimer = 0;
                this.collectionTarget = null;
                this.targetFood = null;
                return false;
            }
            
            // Food still exists, continue collecting
            // Calculate ant's current contribution based on elapsed time
            const contributionAmount = 0.016; // For 60fps, approximately how much time has passed
            
            // Record this ant's contribution to the food
            this.collectionTarget.recordAntContribution(this, contributionAmount);
            
            // Get updated collection time based on how many ants are collecting
            const collectionTime = this.collectionTarget.getCollectionTimeForAnt(this);
            
            this.collectionTimer += 0.016; // Approximate for 60 fps
            
            // Generate eating animation/particles
            this.createEatingEffect();
            
            // Check if collection is complete for this ant
            if (this.collectionTimer >= collectionTime) {
                this.isCollecting = false;
                this.collectionTimer = 0;
                
                // Signal to collect the food
                return true;
            }
            
            // Still collecting, do not move
            return false;
        }
        
        // First, ensure capacity flag is correctly set
        this.isAtFullCapacity = this.capacityWeight >= this.capacity;
        
        // If ant has reached its carrying capacity or no foods available, just wander
        if (this.capacityWeight >= this.capacity || foods.length === 0) {
            this.wander();
            return false;
        }
        
        // Find the closest food
        let closestFood = null;
        let closestDistance = Infinity;
        
        for (let i = 0; i < foods.length; i++) {
            const food = foods[i];
            const dx = food.x - this.x;
            const dy = food.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Consider all food regardless of weight
            if (distance < closestDistance) {
                closestDistance = distance;
                closestFood = food;
            }
        }
        
        // Update target to the closest food
        this.targetFood = closestFood;
        
        // If ant reaches food, start the collection process
        if (closestFood && closestDistance < 10) {
            // Start collection process
            this.isCollecting = true;
            this.collectionTimer = 0;
            this.collectionTarget = this.targetFood;
            
            // Register this ant with the food item
            if (this.id === undefined) {
                // Generate a unique ID for this ant if it doesn't have one
                this.id = 'ant_' + Math.random().toString(36).substr(2, 9);
            }
            this.collectionTarget.addCollectingAnt(this);
            
            // Temporarily stop moving while collecting
            this.vx = 0;
            this.vy = 0;
            
            // Remember the position where we picked up food for distance tracking
            this.lastFoodPickupPos = { x: this.x, y: this.y };
            
            return false;
        }
        
        // If no food is in range, move towards the closest one
        if (closestFood) {
            this.moveTowardsTarget(closestFood);
        } else {
            this.wander(); // Wander randomly if no food is available
        }
        
        return false;
    }
    
    // Template method for handling boundaries - can be customized by subclasses
    handleBoundaries(width, height) {
        // Default boundary handling: wrap around but with improved safety
        const padding = 20;
        
        // For regular ants, use wrap-around boundary behavior
        if (this.x < -padding) {
            this.x = width + padding;
        } else if (this.x > width + padding) {
            this.x = -padding;
        }
        
        if (this.y < -padding) {
            this.y = height + padding;
        } else if (this.y > height + padding) {
            this.y = -padding;
        }
    }
    
    // Template method for picking up food - can be customized by subclasses
    pickUpFood(foodType, foodValue) {
        // Store the current position where food was picked up
        this.lastFoodPickupPos = { x: this.x, y: this.y };
        
        // Update the collected food amount
        this.foodCollected += foodValue;
        
        // Track total weight for capacity considerations (but don't enforce it)
        this.capacityWeight += 1; // Always count as 1 regardless of food type
        
        // Show the food indicator
        this.foodIndicator.visible = true;
        
        // Apply type-specific visual
        this.updateFoodIndicator(foodType);
        
        // Apply slowdown when carrying food
        this.applyCarryingSlowdown();
        
        // Force ants to stay in seeking state unless they're at full capacity
        if (this.capacityWeight >= this.capacity) {
            // At full capacity, return to the nest
            this.transitionToState(IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST);
        } else {
            // Still under capacity, continue seeking food
            
            // Add some movement away from the pickup point to help the ant move to new food
            this.continueSeekingFood();
            
            this.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
        }
        
        // Return the amount of food collected for notifications
        return foodValue;
    }
    
    // New method to help ants continue seeking food after a pickup
    continueSeekingFood() {
        // After picking up food but not being at capacity, we want the ant to move 
        // away from the current food to find more
        
        // If we have a recorded pickup position, move away from it
        if (this.lastFoodPickupPos) {
            // Calculate direction away from pickup
            const dx = this.x - this.lastFoodPickupPos.x;
            const dy = this.y - this.lastFoodPickupPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0.1) {
                // Push in the direction away from the food pickup point
                // with a slight random factor to spread ants out
                const randomAngle = (Math.random() * 0.5 - 0.25) * Math.PI; // Random angle between -45 and 45 degrees
                const rotatedDx = dx * Math.cos(randomAngle) - dy * Math.sin(randomAngle);
                const rotatedDy = dx * Math.sin(randomAngle) + dy * Math.cos(randomAngle);
                
                const normalizedDist = Math.sqrt(rotatedDx * rotatedDx + rotatedDy * rotatedDy);
                this.vx = (rotatedDx / normalizedDist) * this.speed;
                this.vy = (rotatedDy / normalizedDist) * this.speed;
            } else {
                // If too close to pickup, move in a random direction
                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * this.speed;
                this.vy = Math.sin(angle) * this.speed;
            }
            
            // Slightly boost the velocity to ensure ant moves away properly
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed < this.speed * 0.8) {
                this.vx = (this.vx / currentSpeed) * this.speed * 0.8;
                this.vy = (this.vy / currentSpeed) * this.speed * 0.8;
            }
        }
    }
    
    // Helper method to update the food indicator based on food type
    updateFoodIndicator(foodType) {
        // Store the collected food type
        if (!this.collectedFoodTypes) {
            this.collectedFoodTypes = [];
        }
        
        // Add this food type to the collection
        this.collectedFoodTypes.push(foodType || IdleAnts.Data.FoodTypes.BASIC);
        
        // Reset collection state
        this.isCollecting = false;
        this.collectionTimer = 0;
        
        // Remove this ant from the collecting ants list on the food
        if (this.collectionTarget) {
            this.collectionTarget.removeCollectingAnt(this);
            this.collectionTarget = null;
        }
        
        // Only clear the target food if we're at full capacity
        // so the ant doesn't immediately turn back to the nest
        if (this.capacityWeight >= this.capacity) {
            this.targetFood = null;
        }
        
        // Clear any existing extra food indicators
        while (this.foodIndicator.children.length > 1) {
            this.foodIndicator.removeChildAt(1);
        }
        
        // Add visual indicator for each food type collected (up to the current strength)
        try {
            // The number of indicators to show (capped by capacity)
            const numIndicators = Math.min(this.collectedFoodTypes.length, this.capacity);
            
            for (let i = 0; i < numIndicators; i++) {
                const foodTypeIndex = Math.min(i, this.collectedFoodTypes.length - 1);
                const currentFoodType = this.collectedFoodTypes[foodTypeIndex];
                let indicatorColor = currentFoodType && currentFoodType.glowColor ? currentFoodType.glowColor : 0xFFFF99;
                
                const dotIndicator = new PIXI.Graphics();
                dotIndicator.beginFill(indicatorColor, 0.9);
                dotIndicator.drawCircle(0, 0, 2);
                dotIndicator.endFill();
                
                // Position in a circular pattern around the main food indicator
                // First indicator goes on top, others are arranged in a circle
                let angle, distance;
                if (i === 0 && numIndicators === 1) {
                    // Single item centered
                    angle = 0;
                    distance = 0;
                } else {
                    // Multiple items in a circle
                    angle = (i / numIndicators) * Math.PI * 2;
                    distance = 3;
                }
                
                dotIndicator.position.set(
                    Math.cos(angle) * distance,
                    Math.sin(angle) * distance
                );
                
                this.foodIndicator.addChild(dotIndicator);
            }
        } catch (error) {
            console.error("Error creating food indicator:", error);
        }
    }
    
    // Template method for applying speed modifier when carrying food
    applyCarryingSlowdown() {
        // No speed penalty when carrying food by default - maintain original speed
        this.speed = this.originalSpeed;
        
        // Also update the max velocity
        this.maxVelocity = this.speed * 1.5;
    }
    
    // Template method for dropping food - can be customized by subclasses
    dropFood() {
        // Calculate total value from all collected food types
        let totalValue = 0;
        let lastFoodType = null;
        
        if (this.collectedFoodTypes && this.collectedFoodTypes.length > 0) {
            // Sum up all the values
            for (let i = 0; i < this.collectedFoodTypes.length; i++) {
                const foodType = this.collectedFoodTypes[i];
                totalValue += foodType.value;
            }
            
            // Remember the last food type for visual effects
            lastFoodType = this.collectedFoodTypes[this.collectedFoodTypes.length - 1];
            
            // Clear the food types array
            this.collectedFoodTypes = [];
        } else {
            // Backward compatibility: if no food types stored, use base value
            totalValue = this.foodCollected;
        }
        
        // Reset food counters
        const collectedCount = this.foodCollected;
        this.foodCollected = 0;
        this.capacityWeight = 0;
        
        // Hide the food indicator
        this.foodIndicator.visible = false;
        
        // Restore original speed
        this.speed = this.originalSpeed;
        this.maxVelocity = this.speed * 1.5;
        
        // Reset velocity to prevent momentum carrying the ant away from the nest
        this.vx = 0;
        this.vy = 0;
        
        // Transition back to seeking food
        this.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
        
        // Return both the total value and the food count/type for effects
        return {
            totalValue: totalValue,
            count: collectedCount,
            lastFoodType: lastFoodType
        };
    }
    
    // Template method for updating speed multiplier - can be customized by subclasses
    updateSpeedMultiplier(multiplier) {
        this.originalSpeed = this.baseSpeed * multiplier * this.speedFactor;
        if (this.isAtFullCapacity) {
            this.applyCarryingSlowdown();
        } else {
            this.speed = this.originalSpeed;
            this.maxVelocity = this.speed * 1.5;
        }
    }
    
    // Method to increase ant's capacity
    increaseCapacity() {
        // Increment capacity by 1
        this.capacity++;
        
        // Update the configuration based on new capacity
        this.config.canStackFood = this.capacity > 1;
        
        // If the ant is already carrying food, update isAtFullCapacity based on new capacity
        if (this.foodCollected > 0) {
            // If we haven't reached capacity with the new capacity, allow collecting more food
            if (this.capacityWeight < this.capacity) {
                this.isAtFullCapacity = false;
            }
        }
    }
    
    // New method to update rotation smoothly with occasional sharp turns
    updateRotation() {
        if (this.vx !== 0 || this.vy !== 0) {
            // Calculate desired rotation based on movement direction
            // Add PI/2 because the sprite is facing up by default
            const desiredRotation = Math.atan2(this.vy, this.vx) + Math.PI / 2;
            
            // Normalize the target rotation to the shortest path
            this.targetRotation = desiredRotation;
            
            // Smoothly interpolate current rotation towards target rotation
            // Find the shortest angular distance
            let angleDiff = this.targetRotation - this.rotation;
            
            // Normalize to [-PI, PI]
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // Occasionally make sharp turns (5% chance)
            if (Math.random() < 0.05) {
                // Make a sharp turn by using a much higher turn speed (0.8-1.0)
                this.rotation += angleDiff * (0.8 + Math.random() * 0.2);
            } else {
                // Apply gradual rotation using the ant's normal turn speed
                this.rotation += angleDiff * this.turnSpeed;
            }
        }
    }
    
    // Add a helper method to check if any more food can be collected
    canCollectMoreFood(foods) {
        if (foods.length === 0) return false;
        
        // Simply check if we're at capacity
        return this.capacityWeight < this.capacity;
    }
    
    // Add a method to create eating effects while collecting heavy food
    createEatingEffect() {
        if (!this.collectionTarget) return;
        
        // Get the number of ants collecting this food
        const antCount = this.collectionTarget.getCollectingAntCount();
        
        // Increase effect frequency directly proportional to ant count
        // More ants = much more frequent effects to show increased collection speed
        const effectChance = Math.min(0.5, 0.1 * antCount);
        
        // Only create effects occasionally
        if (Math.random() < effectChance) {
            // Create small particles around the ant to indicate "eating"
            if (IdleAnts.app.effectManager) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 5 + Math.random() * 3;
                const x = this.x + Math.cos(angle) * distance;
                const y = this.y + Math.sin(angle) * distance;
                
                // Use food type color for the particle effect
                const color = this.collectionTarget.foodType ? this.collectionTarget.foodType.glowColor : 0xFFFF99;
                
                // Create smaller, faster eating effects
                const scale = 0.7;
                IdleAnts.app.effectManager.createFoodCollectEffect(x, y, color, scale);
                
                // If multiple ants, create a subtle connecting line to the food
                if (antCount > 1 && Math.random() < 0.2) {
                    this.createFoodConnectionLine();
                }
            }
        }
    }
    
    // Create a subtle line connecting the ant to the food
    createFoodConnectionLine() {
        if (!this.collectionTarget || !IdleAnts.app.effectManager) return;
        
        // Create a temporary graphics object
        const graphics = new PIXI.Graphics();
        
        // Use the food type color for the line
        const color = this.collectionTarget.foodType ? this.collectionTarget.foodType.glowColor : 0xFFFF99;
        
        // Draw a dashed line from ant to food
        const startX = this.x;
        const startY = this.y;
        const endX = this.collectionTarget.x;
        const endY = this.collectionTarget.y;
        
        // Draw with low alpha
        graphics.lineStyle(1, color, 0.3);
        
        // Create a dashed line effect
        const segments = 10;
        for (let i = 0; i < segments; i++) {
            if (i % 2 === 0) {
                const x1 = startX + (endX - startX) * (i / segments);
                const y1 = startY + (endY - startY) * (i / segments);
                const x2 = startX + (endX - startX) * ((i + 1) / segments);
                const y2 = startY + (endY - startY) * ((i + 1) / segments);
                
                graphics.moveTo(x1, y1);
                graphics.lineTo(x2, y2);
            }
        }
        
        // Add to the app stage
        IdleAnts.app.worldContainer.addChild(graphics);
        
        // Fade out and remove
        let alpha = 0.3;
        const fadeOut = () => {
            alpha -= 0.03;
            graphics.alpha = alpha;
            
            if (alpha <= 0) {
                IdleAnts.app.worldContainer.removeChild(graphics);
                return;
            }
            
            requestAnimationFrame(fadeOut);
        };
        
        fadeOut();
    }
    
    // Method to detect and resolve stuck ants
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
                const impulse = this.speed * 0.3;
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
    
    // State transition method
    transitionToState(newState) {
        // Debug logging for state transitions only when capacity is changing
        if (this.capacityWeight > 0) {
            console.log(`Ant state transition: ${this.state} -> ${newState}, Capacity=${this.capacity}, CurrentWeight=${this.capacityWeight}, FoodCollected=${this.foodCollected}`);
        }
        
        // Exit actions for current state
        switch (this.state) {
            case IdleAnts.Entities.AntBase.States.SPAWNING:
                // No special exit actions needed
                break;
                
            case IdleAnts.Entities.AntBase.States.COLLECTING_FOOD:
                // Clear collection variables
                this.isCollecting = false;
                this.collectionTimer = 0;
                
                // Remove this ant from the collecting ants list on the food
                if (this.collectionTarget) {
                    this.collectionTarget.removeCollectingAnt(this);
                    this.collectionTarget = null;
                }
                break;
                
            case IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST:
                // Reset the returning to nest timeout when leaving this state
                this.returningToNestTimeout = 0;
                break;
        }
        
        // Enter actions for new state
        switch (newState) {
            case IdleAnts.Entities.AntBase.States.SEEKING_FOOD:
                // Only reset targeting variables if we don't have any food OR we're returning from nest
                if (this.capacityWeight === 0 || this.state === IdleAnts.Entities.AntBase.States.DELIVERING_FOOD) {
                    this.targetFood = null;
                    this.collectionTarget = null;
                    
                    // When starting a new food search from the nest, add some random movement
                    if (this.state === IdleAnts.Entities.AntBase.States.DELIVERING_FOOD) {
                        const angle = Math.random() * Math.PI * 2;
                        const pushStrength = this.speed * 0.8;
                        this.vx = Math.cos(angle) * pushStrength;
                        this.vy = Math.sin(angle) * pushStrength;
                    }
                } else {
                    // After collecting food but still having capacity, 
                    // preserve momentum to continue searching in the same area
                    
                    // If velocity is too low, give a small push away from the last food position
                    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    if (currentSpeed < this.speed * 0.3 && this.lastFoodPickupPos) {
                        // Push away from the last food pickup position to search nearby
                        const dx = this.x - this.lastFoodPickupPos.x;
                        const dy = this.y - this.lastFoodPickupPos.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist > 0.1) {
                            // Push in the direction we were already moving away from the food
                            this.vx = (dx / dist) * this.speed * 0.5;
                            this.vy = (dy / dist) * this.speed * 0.5;
                        } else {
                            // If we're too close to the food, move in a random direction
                            const angle = Math.random() * Math.PI * 2;
                            this.vx = Math.cos(angle) * this.speed * 0.5;
                            this.vy = Math.sin(angle) * this.speed * 0.5;
                        }
                    }
                }
                break;
                
            case IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST:
                // Adjust speed when carrying food
                this.applyCarryingSlowdown();
                break;
                
            case IdleAnts.Entities.AntBase.States.DELIVERING_FOOD:
                // No need for velocity when delivering
                this.vx = 0;
                this.vy = 0;
                break;
                
            case IdleAnts.Entities.AntBase.States.FIGHTING:
                return this.updateFighting();
        }
        
        // Set the new state
        this.state = newState;
    }
    
    // Check if the ant is at full capacity
    isAtFullCapacity() {
        return this.capacityWeight >= this.capacity;
    }
    
    // Check if the ant can carry more food
    canCarryMoreFood() {
        // Always check capacity vs current weight
        return this.capacityWeight < this.capacity;
    }
    
    // Check if the ant has traveled far enough from pickup point
    hasMovedFarEnoughFromPickup() {
        // If no pickup position is recorded, allow deposit
        if (!this.lastFoodPickupPos) return true;
        
        // Calculate distance from pickup point
        const dx = this.x - this.lastFoodPickupPos.x;
        const dy = this.y - this.lastFoodPickupPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate distance from nest to pickup point
        const nestToPickupDx = this.nestPosition.x - this.lastFoodPickupPos.x;
        const nestToPickupDy = this.nestPosition.y - this.lastFoodPickupPos.y;
        const nestToPickupDistance = Math.sqrt(nestToPickupDx * nestToPickupDx + nestToPickupDy * nestToPickupDy);
        
        // If food was picked up very close to the nest (less than the minimum distance),
        // use a smaller threshold to prevent ants from getting stuck
        if (nestToPickupDistance < this.config.minDistanceToDepositFood) {
            // Use half the distance between nest and pickup as the minimum
            return distance >= (nestToPickupDistance / 2);
        }
        
        // Normal case - check against configured minimum distance
        return distance >= this.config.minDistanceToDepositFood;
    }
    
    updateFighting() {
        if(!this.targetEnemy || this.targetEnemy.isDead){
            this.targetEnemy = null;
            this.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
            return false;
        }
        // Freeze in place during combat
        this.vx = 0;
        this.vy = 0;
        // attack
        if(this._attackTimer>0){this._attackTimer--;}
        else{
            if(typeof this.targetEnemy.takeDamage==='function')
                this.targetEnemy.takeDamage(this.attackDamage);
            this._attackTimer=this.attackCooldown;
        }
        return false;
    }
}; 