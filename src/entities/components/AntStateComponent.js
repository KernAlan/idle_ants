/**
 * AntStateComponent - Handles ant state management and transitions
 * Extracted from AntBase.js to maintain Single Responsibility Principle
 */

// Ensure Components namespace exists
if (!IdleAnts.Entities.Components) {
    IdleAnts.Entities.Components = {};
}

IdleAnts.Entities.Components.AntStateComponent = class {
    constructor(ant) {
        this.ant = ant;
        
        // Define state constants
        this.States = {
            SPAWNING: 'spawning',
            SEEKING_FOOD: 'seekingFood', 
            COLLECTING_FOOD: 'collectingFood',
            RETURNING_TO_NEST: 'returningToNest',
            DELIVERING_FOOD: 'deliveringFood',
            FIGHTING: 'fighting',
            IDLE: 'idle'
        };
        
        // Initialize state
        this.currentState = this.States.SPAWNING;
        this.previousState = null;
        this.stateTimer = 0;
        this.stateTransitionCallback = null;
        
        // State-specific properties
        this.spawningTimer = 60; // 1 second at 60fps
        this.collectionTimer = 0;
        this.deliveryTimer = 0;
        this.fightTimer = 0;
        
        // Transition flags
        this.justCollectedFood = false;
        this.returningToNestTimeout = 0;
        this.maxReturningToNestTime = 600; // 10 seconds at 60fps
    }

    /**
     * Get current state
     * @returns {string} Current state
     */
    getState() {
        return this.currentState;
    }

    /**
     * Set state transition callback
     * @param {Function} callback - Callback function for state changes
     */
    setStateTransitionCallback(callback) {
        this.stateTransitionCallback = callback;
    }

    /**
     * Transition to a new state
     * @param {string} newState - New state to transition to
     * @param {Object} data - Optional data for the transition
     */
    setState(newState, data = {}) {
        if (this.currentState === newState) return;
        
        console.log(`[ANT ${this.ant.id || 'unknown'}] State: ${this.currentState} → ${newState}`);
        
        // Handle exit logic for current state
        this.exitState(this.currentState);
        
        // Update states
        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateTimer = 0;
        
        // Handle entry logic for new state
        this.enterState(newState, data);
        
        // Call transition callback if set
        if (this.stateTransitionCallback) {
            this.stateTransitionCallback(this.previousState, newState, data);
        }
    }

    /**
     * Handle entering a new state
     * @param {string} state - State being entered
     * @param {Object} data - Optional data for the state
     */
    enterState(state, data = {}) {
        switch (state) {
            case this.States.SPAWNING:
                this.spawningTimer = 60;
                this.ant.alpha = 0.1;
                break;
                
            case this.States.SEEKING_FOOD:
                this.ant.targetFood = null;
                this.ant.isCollecting = false;
                break;
                
            case this.States.COLLECTING_FOOD:
                this.collectionTimer = 30; // 0.5 seconds
                this.ant.isCollecting = true;
                if (data.food) {
                    this.ant.collectionTarget = data.food;
                }
                break;
                
            case this.States.RETURNING_TO_NEST:
                this.returningToNestTimeout = 0;
                this.justCollectedFood = true;
                break;
                
            case this.States.DELIVERING_FOOD:
                this.deliveryTimer = 20; // ~0.33 seconds
                break;
                
            case this.States.FIGHTING:
                this.fightTimer = 0;
                if (data.enemy) {
                    this.ant.targetEnemy = data.enemy;
                }
                break;
                
            case this.States.IDLE:
                // Clear any active targets
                this.ant.targetFood = null;
                this.ant.targetEnemy = null;
                break;
        }
    }

    /**
     * Handle exiting a state
     * @param {string} state - State being exited
     */
    exitState(state) {
        switch (state) {
            case this.States.SPAWNING:
                this.ant.alpha = 1.0;
                break;
                
            case this.States.COLLECTING_FOOD:
                this.ant.isCollecting = false;
                this.ant.collectionTarget = null;
                break;
                
            case this.States.DELIVERING_FOOD:
                this.justCollectedFood = false;
                break;
                
            case this.States.FIGHTING:
                this.ant.targetEnemy = null;
                break;
        }
    }

    /**
     * Update state logic
     */
    update() {
        this.stateTimer++;
        
        switch (this.currentState) {
            case this.States.SPAWNING:
                this.updateSpawning();
                break;
                
            case this.States.SEEKING_FOOD:
                this.updateSeekingFood();
                break;
                
            case this.States.COLLECTING_FOOD:
                this.updateCollectingFood();
                break;
                
            case this.States.RETURNING_TO_NEST:
                this.updateReturningToNest();
                break;
                
            case this.States.DELIVERING_FOOD:
                this.updateDeliveringFood();
                break;
                
            case this.States.FIGHTING:
                this.updateFighting();
                break;
                
            case this.States.IDLE:
                this.updateIdle();
                break;
        }
    }

    /**
     * Update spawning state
     */
    updateSpawning() {
        this.spawningTimer--;
        
        // Fade in effect
        this.ant.alpha = Math.min(1.0, (60 - this.spawningTimer) / 60);
        
        if (this.spawningTimer <= 0) {
            this.setState(this.States.SEEKING_FOOD);
        }
    }

    /**
     * Update seeking food state
     */
    updateSeekingFood() {
        // Check if ant has capacity for more food
        if (this.ant.foodCollected >= this.ant.capacity) {
            this.setState(this.States.RETURNING_TO_NEST);
            return;
        }
        
        // Check for nearby enemies to fight
        if (this.checkForCombat()) {
            return; // State changed to fighting
        }
        
        // Continue seeking food - let movement component handle pathfinding
    }

    /**
     * Update collecting food state
     */
    updateCollectingFood() {
        this.collectionTimer--;
        
        if (this.collectionTimer <= 0) {
            // Food collection complete
            this.ant.foodCollected++;
            
            // Remove collected food from target
            if (this.ant.collectionTarget) {
                this.ant.collectionTarget.collected = true;
            }
            
            // Check if at capacity
            if (this.ant.foodCollected >= this.ant.capacity) {
                this.setState(this.States.RETURNING_TO_NEST);
            } else {
                this.setState(this.States.SEEKING_FOOD);
            }
        }
    }

    /**
     * Update returning to nest state
     */
    updateReturningToNest() {
        this.returningToNestTimeout++;
        
        // Check if ant reached nest
        const distanceToNest = Math.sqrt(
            Math.pow(this.ant.x - this.ant.nestPosition.x, 2) + 
            Math.pow(this.ant.y - this.ant.nestPosition.y, 2)
        );
        
        if (distanceToNest < this.ant.config.nestRadius) {
            this.setState(this.States.DELIVERING_FOOD);
        } else if (this.returningToNestTimeout > this.maxReturningToNestTime) {
            // Timeout prevention - force delivery
            console.warn(`[ANT ${this.ant.id}] Returning to nest timeout - forcing delivery`);
            this.setState(this.States.DELIVERING_FOOD);
        }
    }

    /**
     * Update delivering food state
     */
    updateDeliveringFood() {
        this.deliveryTimer--;
        
        if (this.deliveryTimer <= 0) {
            // Deliver all food
            const foodDelivered = this.ant.foodCollected;
            this.ant.foodCollected = 0;
            
            // Add food to resources
            if (IdleAnts.app && IdleAnts.app.resourceManager) {
                IdleAnts.app.resourceManager.addFood(foodDelivered);
            }
            
            // Create delivery effect
            if (this.ant.visualComponent) {
                this.ant.visualComponent.createDeliveryEffect();
            }
            
            this.setState(this.States.SEEKING_FOOD);
        }
    }

    /**
     * Update fighting state
     */
    updateFighting() {
        this.fightTimer++;
        
        // Check if enemy is still valid
        if (!this.ant.targetEnemy || this.ant.targetEnemy.isDead) {
            this.setState(this.States.SEEKING_FOOD);
            return;
        }
        
        // Combat logic every 30 frames (0.5 seconds)
        if (this.fightTimer % 30 === 0) {
            if (this.ant.targetEnemy.healthComponent) {
                this.ant.targetEnemy.healthComponent.takeDamage(10);
            }
        }
        
        // Check if enemy is defeated
        if (this.ant.targetEnemy.isDead) {
            this.setState(this.States.SEEKING_FOOD);
        }
    }

    /**
     * Update idle state
     */
    updateIdle() {
        // Return to seeking food after a short idle period
        if (this.stateTimer > 60) { // 1 second
            this.setState(this.States.SEEKING_FOOD);
        }
    }

    /**
     * Check for nearby enemies to engage in combat
     * @returns {boolean} True if combat was initiated
     */
    checkForCombat() {
        if (!IdleAnts.app || !IdleAnts.app.entityManager || !this.ant.canFight) {
            return false;
        }
        
        const enemies = IdleAnts.app.entityManager.entities.enemies;
        if (!enemies || enemies.length === 0) return false;
        
        const engageDistance = 50;
        
        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            
            const distance = Math.sqrt(
                Math.pow(this.ant.x - enemy.x, 2) + 
                Math.pow(this.ant.y - enemy.y, 2)
            );
            
            if (distance <= engageDistance) {
                this.setState(this.States.FIGHTING, { enemy: enemy });
                return true;
            }
        }
        
        return false;
    }

    /**
     * Force state change (for external triggers)
     * @param {string} state - State to force
     * @param {Object} data - Optional data
     */
    forceState(state, data = {}) {
        this.setState(state, data);
    }

    /**
     * Check if ant can transition to a specific state
     * @param {string} state - State to check
     * @returns {boolean} True if transition is allowed
     */
    canTransitionTo(state) {
        switch (state) {
            case this.States.COLLECTING_FOOD:
                return this.currentState === this.States.SEEKING_FOOD && 
                       this.ant.foodCollected < this.ant.capacity;
                       
            case this.States.RETURNING_TO_NEST:
                return this.ant.foodCollected > 0;
                
            case this.States.DELIVERING_FOOD:
                return this.currentState === this.States.RETURNING_TO_NEST;
                
            default:
                return true;
        }
    }

    /**
     * Get state duration in frames
     * @returns {number} Current state duration
     */
    getStateDuration() {
        return this.stateTimer;
    }

    /**
     * Get state information for debugging
     * @returns {Object} State information
     */
    getStateInfo() {
        return {
            current: this.currentState,
            previous: this.previousState,
            duration: this.stateTimer,
            canFight: this.ant.canFight || false,
            foodCollected: this.ant.foodCollected,
            capacity: this.ant.capacity
        };
    }

    /**
     * Destroy the state component
     */
    destroy() {
        this.stateTransitionCallback = null;
        this.ant = null;
    }
};