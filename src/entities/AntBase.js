// src/entities/AntBase.js
IdleAnts.Entities.AntBase = class extends PIXI.Sprite {
    constructor(texture, nestPosition, speedMultiplier = 1, speedFactor = 1) {
        super(texture);
        
        this.anchor.set(0.5);
        this.x = nestPosition.x;
        this.y = nestPosition.y;
        
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
        
        // Random starting velocity
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        
        // The sprite is drawn facing up, but we need it to face right for proper rotation
        this.rotation = -Math.PI / 2;
        
        // Smooth rotation properties
        this.targetRotation = this.rotation;
        this.turnSpeed = 0.1; // How quickly the ant turns (0-1, where 1 is instant)
        
        // Create ant-specific visual elements
        this.createVisualElements();
        
        // Add properties for food collection state
        this.isCollecting = false;
        this.collectionTimer = 0;
        this.collectionTarget = null;
        this.capacityWeight = 0; // Track weight-based capacity used
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
    
    update(nestPosition, foods) {
        // Perform ant-specific animations
        this.performAnimation();
        
        // Update isAtFullCapacity flag based on current capacity weight
        this.isAtFullCapacity = this.capacityWeight >= this.capacity;
        
        // Handle food collection timer if currently collecting
        if (this.isCollecting && this.collectionTarget) {
            this.collectionTimer += 0.016; // Approximate for 60 fps
            
            // Generate eating animation/particles
            this.createEatingEffect();
            
            // Check if collection is complete
            const collectionTime = this.collectionTarget.foodType ? this.collectionTarget.foodType.collectionTime : 0;
            if (this.collectionTimer >= collectionTime) {
                this.isCollecting = false;
                this.collectionTimer = 0;
                
                // Signal to collect the food
                return true;
            }
            
            // Still collecting, don't move
            return false;
        }
        
        // Only return to nest if both conditions are met:
        // 1. Has collected some food, AND
        // 2. Is at full capacity OR there are no more foods that will fit in remaining capacity
        if (this.foodCollected > 0 && (this.isAtFullCapacity || !this.canCollectMoreFood(foods))) {
            this.moveToNest(nestPosition);
            
            // Check if we reached the nest
            if (this.isAtNest(nestPosition)) {
                return true; // Signal to deliver food
            }
        } 
        // Otherwise, look for food
        else {
            const foundFood = this.findAndCollectFood(foods);
            
            // If we found food, signal to collect it
            if (foundFood) {
                return foundFood; // Signal to collect food
            }
        }
        
        // Apply momentum (slight damping of velocity)
        this.vx *= this.momentum;
        this.vy *= this.momentum;
        
        // Cap velocity to prevent ants from going too fast
        this.capVelocity();
        
        // Update rotation smoothly
        this.updateRotation();
        
        // Apply movement
        this.x += this.vx;
        this.y += this.vy;
        
        return false; // No special action needed
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
        
        // If very close to nest, just stop
        if (distance < 1) {
            this.vx = 0;
            this.vy = 0;
            return;
        }
        
        // Simple normalized movement towards nest
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
        
        // The rotation is now handled by updateRotation() method
    }
    
    isAtNest(nestPosition) {
        const dx = nestPosition.x - this.x;
        const dy = nestPosition.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 10;
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
        if (this.isCollecting) {
            return false;
        }

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
                // Higher strength = faster collection (up to 75% reduction at max strength)
                if (IdleAnts && IdleAnts.app && IdleAnts.app.resourceManager) {
                    const strengthMultiplier = IdleAnts.app.resourceManager.stats.strengthMultiplier;
                    // Calculate a reduction factor: each 0.2 strength increment reduces time by 5%
                    // The formula makes it so that base strength of 1.0 has no reduction (1.0 * 0.25 = 0.25, 1 - 0.25 = 0.75)
                    // Max reduction is 75% (collectionTime * 0.25)
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
    
    // Template method for handling boundaries - can be customized by subclasses
    handleBoundaries(width, height) {
        // Default boundary handling: wrap around
        const padding = 20;
        if (this.x < -padding) this.x = width + padding;
        if (this.x > width + padding) this.x = -padding;
        if (this.y < -padding) this.y = height + padding;
        if (this.y > height + padding) this.y = -padding;
    }
    
    // Template method for picking up food - can be customized by subclasses
    pickUpFood(foodType) {
        // Store the collected food type
        if (!this.collectedFoodTypes) {
            this.collectedFoodTypes = [];
        }
        
        // Get the food weight
        const weight = foodType ? foodType.weight : 1;
        
        // Add this food type to the collection
        this.collectedFoodTypes.push(foodType || IdleAnts.Data.FoodTypes.BASIC);
        
        // Increment the food collected counter
        this.foodCollected++;
        
        // Add the weight to the capacity weight
        this.capacityWeight += weight;
        
        // Set isAtFullCapacity to true ONLY if we've reached capacity
        if (this.capacityWeight >= this.capacity) {
            this.isAtFullCapacity = true;
        } else {
            // Explicitly ensure it's false if not at capacity
            this.isAtFullCapacity = false;
        }
        
        // Reset collection state
        this.isCollecting = false;
        this.collectionTimer = 0;
        this.collectionTarget = null;
        
        // Clear the current target food as it's been collected
        this.targetFood = null;
        
        // Show the food indicator
        this.foodIndicator.visible = true;
        
        // Clear any existing extra food indicators
        while (this.foodIndicator.children.length > 1) {
            this.foodIndicator.removeChildAt(1);
        }
        
        // Add food pieces based on how many we've collected
        for (let i = 0; i < this.collectedFoodTypes.length; i++) {
            // Skip the first one if it already exists
            if (i === 0 && this.foodIndicator.children.length > 0) continue;
            
            // Get the food type for this piece
            const currentFoodType = this.collectedFoodTypes[i];
            
            const foodPiece = new PIXI.Graphics();
            foodPiece.beginFill(currentFoodType.color); // Use food type color
            foodPiece.drawCircle(0, 0, i === 0 ? 3 : 2);
            foodPiece.endFill();
            
            // Add some detail
            foodPiece.beginFill(currentFoodType.shadowColor); // Use food type shadow color
            foodPiece.drawCircle(i === 0 ? 0.5 : 0.3, i === 0 ? 0.5 : 0.3, i === 0 ? 1.5 : 1);
            foodPiece.endFill();
            
            // Position the food pieces in a small stack
            if (i === 0) {
                foodPiece.x = 0;
                foodPiece.y = 0;
            } else {
                foodPiece.x = (Math.random() - 0.5) * 3;
                foodPiece.y = -3 - (i * 2);
            }
            
            this.foodIndicator.addChild(foodPiece);
        }
        
        // Apply speed reduction when carrying food
        this.applyCarryingSpeedModifier();
    }
    
    // Template method for applying speed modifier when carrying food
    applyCarryingSpeedModifier() {
        // No speed penalty when carrying food - maintain original speed
        this.speed = this.originalSpeed;
        
        // Also update the max velocity
        this.maxVelocity = this.speed * 1.5;
    }
    
    // Template method for dropping food - can be customized by subclasses
    dropFood() {
        this.isAtFullCapacity = false;
        // Hide the food indicator
        this.foodIndicator.visible = false;
        
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
            // Backward compatibility: if no food types stored, use base value (1)
            totalValue = this.foodCollected;
        }
        
        // Reset food counters
        const collectedCount = this.foodCollected;
        this.foodCollected = 0;
        this.capacityWeight = 0; // Reset the capacity weight
        
        // Restore original speed
        this.speed = this.originalSpeed;
        // Also update the max velocity
        this.maxVelocity = this.speed * 1.5;
        
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
            this.applyCarryingSpeedModifier();
        } else {
            this.speed = this.originalSpeed;
            this.maxVelocity = this.speed * 1.5;
        }
    }
    
    // Method to increase ant's capacity
    increaseCapacity() {
        // Increment capacity by 1
        this.capacity++;
        
        // If the ant is already carrying food, update isAtFullCapacity based on new capacity
        if (this.foodCollected > 0) {
            // If we haven't reached capacity with the new strength, allow collecting more food
            if (this.foodCollected < this.capacity) {
                this.isAtFullCapacity = false;
            }
        }
    }
    
    // New method to update rotation smoothly
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
            
            // Apply gradual rotation
            this.rotation += angleDiff * this.turnSpeed;
        }
    }
    
    // Add a helper method to check if any more food can be collected
    canCollectMoreFood(foods) {
        if (foods.length === 0) return false;
        
        // Check if any available food will fit in the remaining capacity
        for (let i = 0; i < foods.length; i++) {
            const foodWeight = foods[i].foodType ? foods[i].foodType.weight : 1;
            if (this.capacityWeight + foodWeight <= this.capacity) {
                return true;
            }
        }
        
        return false;
    }
    
    // Add a method to create eating effects while collecting heavy food
    createEatingEffect() {
        // Only create effects occasionally
        if (Math.random() < 0.1) {
            // Create small particles around the ant to indicate "eating"
            if (this.collectionTarget && IdleAnts.app.effectManager) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 5 + Math.random() * 3;
                const x = this.x + Math.cos(angle) * distance;
                const y = this.y + Math.sin(angle) * distance;
                
                // Use food type color for the particle effect
                const color = this.collectionTarget.foodType ? this.collectionTarget.foodType.glowColor : 0xFFFF99;
                IdleAnts.app.effectManager.createFoodCollectEffect(x, y, color);
            }
        }
    }
}; 