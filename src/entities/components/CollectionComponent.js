/**
 * CollectionComponent - Handles food collection and carrying capacity
 * Extracted from AntBase.js for better maintainability
 */

// Ensure Components namespace exists
if (!IdleAnts.Entities.Components) {
    IdleAnts.Entities.Components = {};
}

IdleAnts.Entities.Components.CollectionComponent = class {
    constructor(ant, capacity = 1) {
        this.ant = ant;
        
        // Collection properties
        this.capacity = capacity;
        this.foodCollected = 0;
        this.collectedFoodTypes = [];
        this.collectionMultiplier = 1;
        
        // Collection state
        this.isAtFullCapacity = false;
        this.collectionCooldown = 0;
        this.maxCollectionCooldown = 10; // Frames between collections
        
        // Collection effects
        this.collectionEffects = [];
        this.shouldShowPickupEffect = true;
        this.shouldShowDropEffect = true;
    }

    /**
     * Update collection component
     */
    update() {
        this.updateCollectionCooldown();
        this.updateCapacityStatus();
        this.updateCollectionEffects();
    }

    /**
     * Attempt to collect food from a food entity
     * @param {object} food - Food entity to collect from
     * @returns {boolean} True if food was collected
     */
    collectFood(food) {
        if (!this.canCollectFood(food)) {
            return false;
        }
        
        if (this.collectionCooldown > 0) {
            return false;
        }
        
        // Calculate food amount to collect
        const foodValue = this.calculateFoodValue(food);
        const amountToCollect = Math.min(foodValue, this.capacity - this.foodCollected);
        
        if (amountToCollect <= 0) {
            return false;
        }
        
        // Collect the food
        this.foodCollected += amountToCollect;
        this.collectedFoodTypes.push({
            type: food.type || 'unknown',
            value: amountToCollect,
            timestamp: Date.now()
        });
        
        // Update food entity
        if (food.reduceAmount) {
            food.reduceAmount(amountToCollect);
        } else {
            food.isConsumed = true;
        }
        
        // Set collection cooldown
        this.collectionCooldown = this.maxCollectionCooldown;
        
        // Show collection effect
        if (this.shouldShowPickupEffect) {
            this.showPickupEffect(food);
        }
        
        // Notify collection
        this.onFoodCollected(food, amountToCollect);
        
        return true;
    }

    /**
     * Deliver all collected food
     * @returns {boolean} True if food was delivered
     */
    deliverFood() {
        if (this.foodCollected <= 0) {
            return false;
        }
        
        const totalDelivered = this.foodCollected;
        const foodTypes = [...this.collectedFoodTypes];
        
        // Add food to resource manager
        if (this.ant.resourceManager) {
            const multipliedAmount = totalDelivered * this.collectionMultiplier;
            this.ant.resourceManager.addFood(multipliedAmount);
        }
        
        // Show delivery effect
        if (this.shouldShowDropEffect) {
            this.showDeliveryEffect(totalDelivered);
        }
        
        // Reset collection state
        this.resetCollection();
        
        // Notify delivery
        this.onFoodDelivered(totalDelivered, foodTypes);
        
        return true;
    }

    /**
     * Check if food can be collected
     * @param {object} food - Food entity
     * @returns {boolean} True if food can be collected
     */
    canCollectFood(food) {
        if (!food || food.isConsumed) {
            return false;
        }
        
        if (this.isAtFullCapacity) {
            return false;
        }
        
        if (this.collectionCooldown > 0) {
            return false;
        }
        
        return true;
    }

    /**
     * Calculate the value of food to collect
     * @param {object} food - Food entity
     * @returns {number} Food value
     */
    calculateFoodValue(food) {
        let baseValue = 1;
        
        if (food.getValue) {
            baseValue = food.getValue();
        } else if (food.value) {
            baseValue = food.value;
        }
        
        // Apply any collection bonuses
        return Math.floor(baseValue * this.collectionMultiplier);
    }

    /**
     * Update collection cooldown
     */
    updateCollectionCooldown() {
        if (this.collectionCooldown > 0) {
            this.collectionCooldown--;
        }
    }

    /**
     * Update capacity status
     */
    updateCapacityStatus() {
        this.isAtFullCapacity = this.foodCollected >= this.capacity;
        
        // Update ant visual state based on capacity
        if (this.ant.updateCarryingVisual) {
            this.ant.updateCarryingVisual(this.foodCollected, this.capacity);
        }
    }

    /**
     * Update collection effects
     */
    updateCollectionEffects() {
        this.collectionEffects = this.collectionEffects.filter(effect => {
            if (effect.update) {
                return effect.update();
            }
            return false;
        });
    }

    /**
     * Show pickup effect
     * @param {object} food - Food that was picked up
     */
    showPickupEffect(food) {
        if (this.ant.effectManager) {
            this.ant.effectManager.createFoodCollectEffect(this.ant.x, this.ant.y, food.type);
        }
        
        // Create local pickup effect
        const effect = {
            x: this.ant.x,
            y: this.ant.y,
            scale: 1.0,
            alpha: 1.0,
            timer: 30,
            update: function() {
                this.timer--;
                this.scale += 0.05;
                this.alpha -= 0.033;
                return this.timer > 0;
            }
        };
        
        this.collectionEffects.push(effect);
    }

    /**
     * Show delivery effect
     * @param {number} amount - Amount of food delivered
     */
    showDeliveryEffect(amount) {
        if (this.ant.effectManager) {
            this.ant.effectManager.createFoodDropEffect(this.ant.x, this.ant.y, amount);
        }
        
        // Create local delivery effect
        const effect = {
            x: this.ant.x,
            y: this.ant.y,
            amount: amount,
            scale: 0.5,
            alpha: 1.0,
            timer: 60,
            update: function() {
                this.timer--;
                this.scale += 0.02;
                this.alpha -= 0.016;
                return this.timer > 0;
            }
        };
        
        this.collectionEffects.push(effect);
    }

    /**
     * Reset collection state
     */
    resetCollection() {
        this.foodCollected = 0;
        this.collectedFoodTypes = [];
        this.isAtFullCapacity = false;
    }

    /**
     * Increase collection capacity
     * @param {number} amount - Amount to increase capacity by
     */
    increaseCapacity(amount) {
        this.capacity += amount;
        this.updateCapacityStatus();
    }

    /**
     * Set collection multiplier
     * @param {number} multiplier - Collection multiplier
     */
    setCollectionMultiplier(multiplier) {
        this.collectionMultiplier = Math.max(0.1, multiplier);
    }

    /**
     * Get collection efficiency
     * @returns {number} Current collection efficiency (0-1)
     */
    getCollectionEfficiency() {
        return this.foodCollected / this.capacity;
    }

    /**
     * Get remaining capacity
     * @returns {number} Remaining collection capacity
     */
    getRemainingCapacity() {
        return this.capacity - this.foodCollected;
    }

    /**
     * Check if ant is carrying food
     * @returns {boolean} True if carrying food
     */
    isCarryingFood() {
        return this.foodCollected > 0;
    }

    /**
     * Get collected food summary
     * @returns {object} Summary of collected food
     */
    getCollectedFoodSummary() {
        const summary = {};
        
        for (const food of this.collectedFoodTypes) {
            if (summary[food.type]) {
                summary[food.type] += food.value;
            } else {
                summary[food.type] = food.value;
            }
        }
        
        return {
            totalAmount: this.foodCollected,
            types: summary,
            capacity: this.capacity,
            efficiency: this.getCollectionEfficiency()
        };
    }

    /**
     * Event handler for food collection
     * @param {object} food - Food that was collected
     * @param {number} amount - Amount collected
     */
    onFoodCollected(food, amount) {
        // Override in subclasses or add listeners
        if (this.ant.onFoodCollected) {
            this.ant.onFoodCollected(food, amount);
        }
    }

    /**
     * Event handler for food delivery
     * @param {number} totalAmount - Total amount delivered
     * @param {Array} foodTypes - Types of food delivered
     */
    onFoodDelivered(totalAmount, foodTypes) {
        // Override in subclasses or add listeners
        if (this.ant.onFoodDelivered) {
            this.ant.onFoodDelivered(totalAmount, foodTypes);
        }
    }

    /**
     * Get collection effects for rendering
     * @returns {Array} Array of active collection effects
     */
    getCollectionEffects() {
        return this.collectionEffects;
    }

    /**
     * Force drop all food (for emergency situations)
     */
    dropAllFood() {
        if (this.foodCollected > 0) {
            this.showDeliveryEffect(this.foodCollected);
            this.resetCollection();
        }
    }

    /**
     * Clean up collection component
     */
    cleanup() {
        this.collectionEffects = [];
        this.resetCollection();
    }
};