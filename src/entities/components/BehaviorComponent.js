/**
 * BehaviorComponent - Handles ant AI behavior and state machine
 * Extracted from AntBase.js for better maintainability
 */

// Ensure Components namespace exists
if (!IdleAnts.Entities.Components) {
    IdleAnts.Entities.Components = {};
}

IdleAnts.Entities.Components.BehaviorComponent = class {
    constructor(ant) {
        this.ant = ant;
        
        // Behavior state
        this.state = IdleAnts.Entities.AntBase.States.SPAWNING;
        this.previousState = null;
        this.stateTimer = 0;
        this.stateChangeListeners = [];
        
        // Behavior properties
        this.targetFood = null;
        this.lastFoodPickupPos = null;
        this.returningToNestTimeout = 0;
        this.maxReturningToNestTime = 600; // 10 seconds at 60fps
        
        // Decision making
        this.decisionCooldown = 0;
        this.maxDecisionCooldown = 30; // Half second at 60fps
        this.sightRange = 100;
        this.collectionRange = 20;
        
        // Performance tracking
        this.foodDelivered = 0;
        this.totalTripTime = 0;
        this.currentTripStartTime = 0;
    }

    /**
     * Handle state change notifications
     * @param {string} fromState - Previous state
     * @param {string} toState - New state  
     * @param {Object} data - Additional state change data
     */
    onStateChange(fromState, toState, data) {
        // Handle behavior changes when state transitions occur
        switch (toState) {
            case IdleAnts.Entities.AntBase.States.SPAWNING:
                this.targetFood = null;
                this.stateTimer = 0;
                break;
                
            case IdleAnts.Entities.AntBase.States.SEEKING_FOOD:
                this.targetFood = null;
                this.currentTripStartTime = Date.now();
                break;
                
            case IdleAnts.Entities.AntBase.States.COLLECTING_FOOD:
                // Set collection target if provided
                if (data && data.food) {
                    this.targetFood = data.food;
                }
                break;
                
            case IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST:
                this.returningToNestTimeout = 0;
                break;
                
            case IdleAnts.Entities.AntBase.States.DELIVERING_FOOD:
                // Track delivery metrics
                if (this.currentTripStartTime > 0) {
                    this.totalTripTime += Date.now() - this.currentTripStartTime;
                    this.foodDelivered++;
                }
                break;
                
            case IdleAnts.Entities.AntBase.States.FIGHTING:
                // Prepare for combat
                this.targetFood = null;
                break;
        }
        
        // Update internal state
        this.previousState = fromState;
        this.state = toState;
        this.stateTimer = 0;
    }

    /**
     * Update behavior state machine
     * @param {Array} availableFoods - Array of available food entities
     * @param {Array} nearbyAnts - Array of nearby ants
     */
    update(availableFoods = [], nearbyAnts = []) {
        this.stateTimer++;
        this.updateDecisionCooldown();
        
        switch (this.state) {
            case IdleAnts.Entities.AntBase.States.SPAWNING:
                this.handleSpawningState();
                break;
                
            case IdleAnts.Entities.AntBase.States.SEEKING_FOOD:
                this.handleSeekingFoodState(availableFoods);
                break;
                
            case IdleAnts.Entities.AntBase.States.COLLECTING_FOOD:
                this.handleCollectingFoodState();
                break;
                
            case IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST:
                this.handleReturningToNestState();
                break;
                
            case IdleAnts.Entities.AntBase.States.DELIVERING_FOOD:
                this.handleDeliveringFoodState();
                break;
                
            case IdleAnts.Entities.AntBase.States.FIGHTING:
                this.handleFightingState();
                break;
        }
    }

    /**
     * Handle spawning state
     */
    handleSpawningState() {
        if (this.stateTimer > 30) { // 0.5 seconds spawn time
            this.setState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
            this.startNewTrip();
        }
    }

    /**
     * Handle seeking food state
     * @param {Array} availableFoods - Available food entities
     */
    handleSeekingFoodState(availableFoods) {
        if (this.decisionCooldown <= 0) {
            this.findBestFood(availableFoods);
            this.decisionCooldown = this.maxDecisionCooldown;
        }
        
        if (this.targetFood) {
            const arrived = this.ant.movementComponent.moveTowards(this.targetFood, this.collectionRange);
            
            if (arrived) {
                this.setState(IdleAnts.Entities.AntBase.States.COLLECTING_FOOD);
            }
            
            // Check if target food is still valid
            if (this.targetFood.isConsumed || !availableFoods.includes(this.targetFood)) {
                this.targetFood = null;
            }
        } else {
            // No target food, wander around
            this.wanderBehavior();
        }
    }

    /**
     * Handle collecting food state
     */
    handleCollectingFoodState() {
        if (!this.targetFood || this.targetFood.isConsumed) {
            this.setState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
            return;
        }
        
        // Collect food
        if (this.ant.collectFood(this.targetFood)) {
            this.lastFoodPickupPos = { x: this.ant.x, y: this.ant.y };
            this.setState(IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST);
        }
    }

    /**
     * Handle returning to nest state
     */
    handleReturningToNestState() {
        this.returningToNestTimeout++;
        
        const arrived = this.ant.movementComponent.moveTowards(this.ant.nestPosition, 25);
        
        if (arrived || this.returningToNestTimeout > this.maxReturningToNestTime) {
            this.setState(IdleAnts.Entities.AntBase.States.DELIVERING_FOOD);
            this.returningToNestTimeout = 0;
        }
    }

    /**
     * Handle delivering food state
     */
    handleDeliveringFoodState() {
        if (this.ant.deliverFood()) {
            this.completeTrip();
            this.setState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
        }
    }

    /**
     * Handle fighting state
     */
    handleFightingState() {
        // Combat behavior will be implemented here
        // For now, return to seeking food after a short time
        if (this.stateTimer > 120) { // 2 seconds
            this.setState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
        }
    }

    /**
     * Find the best food target based on distance and ant efficiency
     * @param {Array} availableFoods - Available food entities
     */
    findBestFood(availableFoods) {
        if (availableFoods.length === 0) {
            this.targetFood = null;
            return;
        }
        
        let bestFood = null;
        let bestScore = -1;
        
        for (const food of availableFoods) {
            if (food.isConsumed) continue;
            
            const distance = this.getDistanceToFood(food);
            if (distance > this.sightRange) continue;
            
            // Calculate score based on distance and food value
            const distanceScore = 1 - (distance / this.sightRange);
            const valueScore = food.getValue ? food.getValue() / 10 : 1;
            const totalScore = distanceScore * 0.7 + valueScore * 0.3;
            
            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestFood = food;
            }
        }
        
        this.targetFood = bestFood;
    }

    /**
     * Get distance to a food entity
     * @param {object} food - Food entity
     * @returns {number} Distance to food
     */
    getDistanceToFood(food) {
        const dx = this.ant.x - food.x;
        const dy = this.ant.y - food.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Wander behavior when no target food is available
     */
    wanderBehavior() {
        if (this.stateTimer % 60 === 0) { // Change direction every second
            const wanderRadius = 200;
            const angle = Math.random() * Math.PI * 2;
            
            const wanderTarget = {
                x: this.ant.nestPosition.x + Math.cos(angle) * wanderRadius,
                y: this.ant.nestPosition.y + Math.sin(angle) * wanderRadius
            };
            
            this.ant.movementComponent.moveTowards(wanderTarget, 50);
        }
    }

    /**
     * Set behavior state
     * @param {string} newState - New state to transition to
     */
    setState(newState) {
        if (this.state === newState) return;
        
        const oldState = this.state;
        this.previousState = oldState;
        this.state = newState;
        this.stateTimer = 0;
        
        // Notify listeners
        this.notifyStateChange(newState, oldState);
        
        // Handle state-specific setup
        this.onStateEnter(newState, oldState);
    }

    /**
     * Handle state entry logic
     * @param {string} newState - State being entered
     * @param {string} oldState - State being exited
     */
    onStateEnter(newState, oldState) {
        switch (newState) {
            case IdleAnts.Entities.AntBase.States.SEEKING_FOOD:
                this.targetFood = null;
                break;
                
            case IdleAnts.Entities.AntBase.States.COLLECTING_FOOD:
                // Slow down for collection
                this.ant.movementComponent.setSpeedMultiplier(0.5);
                break;
                
            case IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST:
                // Speed up for return trip
                this.ant.movementComponent.setSpeedMultiplier(1.2);
                break;
                
            case IdleAnts.Entities.AntBase.States.DELIVERING_FOOD:
                // Normal speed for delivery
                this.ant.movementComponent.setSpeedMultiplier(1.0);
                break;
        }
    }

    /**
     * Add state change listener
     * @param {function} callback - Callback function
     */
    addStateChangeListener(callback) {
        this.stateChangeListeners.push(callback);
    }

    /**
     * Remove state change listener
     * @param {function} callback - Callback function to remove
     */
    removeStateChangeListener(callback) {
        const index = this.stateChangeListeners.indexOf(callback);
        if (index > -1) {
            this.stateChangeListeners.splice(index, 1);
        }
    }

    /**
     * Notify state change listeners
     * @param {string} newState - New state
     * @param {string} oldState - Previous state
     */
    notifyStateChange(newState, oldState) {
        this.stateChangeListeners.forEach(listener => {
            try {
                listener(this.ant, newState, oldState);
            } catch (error) {
                console.error('Error in behavior state change listener:', error);
            }
        });
    }

    /**
     * Update decision cooldown
     */
    updateDecisionCooldown() {
        if (this.decisionCooldown > 0) {
            this.decisionCooldown--;
        }
    }

    /**
     * Start a new trip (for performance tracking)
     */
    startNewTrip() {
        this.currentTripStartTime = Date.now();
    }

    /**
     * Complete current trip (for performance tracking)
     */
    completeTrip() {
        if (this.currentTripStartTime > 0) {
            const tripTime = Date.now() - this.currentTripStartTime;
            this.totalTripTime += tripTime;
            this.foodDelivered++;
            this.currentTripStartTime = 0;
        }
    }

    /**
     * Get current state
     * @returns {string} Current behavior state
     */
    getState() {
        return this.state;
    }

    /**
     * Check if in a specific state
     * @param {string} state - State to check
     * @returns {boolean} True if in specified state
     */
    isInState(state) {
        return this.state === state;
    }

    /**
     * Check if ant is carrying food
     * @returns {boolean} True if carrying food
     */
    isCarryingFood() {
        return this.ant.foodCollected > 0;
    }

    /**
     * Get performance metrics
     * @returns {object} Performance data
     */
    getPerformanceMetrics() {
        const avgTripTime = this.foodDelivered > 0 ? this.totalTripTime / this.foodDelivered : 0;
        
        return {
            foodDelivered: this.foodDelivered,
            averageTripTime: avgTripTime,
            efficiency: this.foodDelivered / (this.stateTimer / 60) // Food per second
        };
    }

    /**
     * Reset behavior component
     */
    reset() {
        this.state = IdleAnts.Entities.AntBase.States.SPAWNING;
        this.stateTimer = 0;
        this.targetFood = null;
        this.lastFoodPickupPos = null;
        this.returningToNestTimeout = 0;
        this.decisionCooldown = 0;
        this.foodDelivered = 0;
        this.totalTripTime = 0;
        this.currentTripStartTime = 0;
    }
};