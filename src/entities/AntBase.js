// src/entities/AntBase.js - Refactored with Component-Based Architecture
// Delegates responsibilities to focused components for better SRP adherence

IdleAnts.Entities.AntBase = class extends PIXI.Sprite {
    // Define state constants for backward compatibility
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
        
        // Basic setup
        this.anchor.set(0.5);
        this.x = nestPosition.x;
        this.y = nestPosition.y;
        
        // Store nest position - deep copy to avoid reference issues
        this.nestPosition = { 
            x: nestPosition.x,
            y: nestPosition.y 
        };
        
        // Basic ant properties
        this.baseSpeed = (1 + Math.random() * 0.5) * 2.0;
        this.speedFactor = speedFactor;
        this.speed = this.baseSpeed * speedMultiplier * this.speedFactor;
        this.originalSpeed = this.speed;
        
        // Capacity and collection properties
        this.capacity = 1;
        this.foodCollected = 0;
        this.targetFood = null;
        this.targetEnemy = null;
        this.isCollecting = false;
        this.collectionTarget = null;
        
        // Movement properties
        this.vx = 0;
        this.vy = 0;
        this.momentum = 0.95;
        this.maxVelocity = this.speed * 1.5;
        
        // Visual properties
        this.baseScale = this.getBaseScale();
        this.scale.set(this.baseScale, this.baseScale);
        this.rotation = -Math.PI / 2; // Face right initially
        this.targetRotation = this.rotation;
        this.turnSpeed = 0.1 + Math.random() * 0.8;
        
        // Configuration
        this.config = {
            canStackFood: this.capacity > 1,
            minDistanceToDepositFood: 15,
            foodCollectionRadius: 10,
            nestRadius: 10,
            moveSpeedLoaded: this.speed * 0.8,
            turnSpeed: this.turnSpeed,
            stuckThreshold: 1.0,
            minMovementSpeed: this.speed * 0.1
        };
        
        // Initialize components with proper delegation
        this.initializeComponents();
        
        // Backward compatibility properties
        this.isDead = false;
        this.hp = 100;
        this.maxHp = 100;
        this.canFight = false; // Override in subclasses
        
        // Generate unique ID for debugging
        this.id = 'ant_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get base scale with variation
     * @returns {number} Base scale value
     */
    getBaseScale() {
        return 0.8 + Math.random() * 0.4;
    }

    /**
     * Initialize all components with proper dependency injection
     */
    initializeComponents() {
        try {
            // Initialize components in dependency order with safety checks
            if (IdleAnts.Entities.Components.AntVisualComponent) {
                this.visualComponent = new IdleAnts.Entities.Components.AntVisualComponent(this);
            }
            
            if (IdleAnts.Entities.Components.AntHealthComponent) {
                this.healthComponent = new IdleAnts.Entities.Components.AntHealthComponent(this, this.maxHp || 100);
            }
            
            if (IdleAnts.Entities.Components.AntStateComponent) {
                this.stateComponent = new IdleAnts.Entities.Components.AntStateComponent(this);
            }
            
            if (IdleAnts.Entities.Components.MovementComponent) {
                this.movementComponent = new IdleAnts.Entities.Components.MovementComponent(this);
            }
            
            if (IdleAnts.Entities.Components.BehaviorComponent) {
                this.behaviorComponent = new IdleAnts.Entities.Components.BehaviorComponent(this);
            }
            
            if (IdleAnts.Entities.Components.CollectionComponent) {
                this.collectionComponent = new IdleAnts.Entities.Components.CollectionComponent(this);
            }
            
            // Set up component communication
            this.setupComponentCommunication();
        } catch (error) {
            console.warn('[AntBase] Component initialization failed:', error);
            // Continue without components - use legacy behavior
        }
    }

    /**
     * Set up inter-component communication
     */
    setupComponentCommunication() {
        // State component notifies other components of state changes
        this.stateComponent.setStateTransitionCallback((fromState, toState, data) => {
            if (this.visualComponent) {
                this.visualComponent.animateForState(toState);
            }
            
            if (this.movementComponent) {
                if (typeof this.movementComponent.onStateChange === 'function') {
                    this.movementComponent.onStateChange(fromState, toState, data);
                } else {
                    console.error('[AntBase] movementComponent exists but onStateChange method missing', this.movementComponent);
                }
            }
            
            if (this.behaviorComponent) {
                this.behaviorComponent.onStateChange(fromState, toState, data);
            }
        });
    }

    // ===== DELEGATED METHODS TO COMPONENTS =====

    // State management delegated to StateComponent
    get state() {
        return this.stateComponent ? this.stateComponent.getState() : IdleAnts.Entities.AntBase.States.SPAWNING;
    }

    setState(newState, data = {}) {
        if (this.stateComponent) {
            this.stateComponent.setState(newState, data);
        }
    }

    // Health management delegated to HealthComponent
    takeDamage(damage) {
        if (this.healthComponent) {
            this.healthComponent.takeDamage(damage);
            this.isDead = this.healthComponent.isDead;
            this.hp = this.healthComponent.hp;
        }
    }

    heal(amount) {
        if (this.healthComponent) {
            this.healthComponent.heal(amount);
            this.hp = this.healthComponent.hp;
        }
    }

    die() {
        if (this.healthComponent) {
            this.healthComponent.die();
        }
        this.isDead = true;
    }

    // Visual effects delegated to VisualComponent
    setHighlight(highlight) {
        if (this.visualComponent) {
            this.visualComponent.setHighlight(highlight);
        }
    }

    createSpeedBoostEffect() {
        if (this.visualComponent) {
            this.visualComponent.createSpeedBoostEffect();
        }
    }

    // Movement delegated to MovementComponent
    moveTowards(target, threshold = 5) {
        if (this.movementComponent) {
            return this.movementComponent.moveTowards(target, threshold);
        }
        return false;
    }

    // Food collection delegated to CollectionComponent
    canCollectFood(food) {
        if (this.collectionComponent) {
            return this.collectionComponent.canCollectFood(food);
        }
        return false;
    }

    startCollectingFood(food) {
        if (this.collectionComponent) {
            this.collectionComponent.startCollecting(food);
        }
    }

    // Behavior delegated to BehaviorComponent
    findBestFood(foods) {
        if (this.behaviorComponent) {
            return this.behaviorComponent.findBestFood(foods);
        }
        return null;
    }

    // ===== CORE UPDATE METHOD =====

    /**
     * Main update method - coordinates all components
     * @param {Object} nestPosition - Current nest position
     * @param {Array} foods - Available food sources
     */
    update(nestPosition, foods) {
        // Update nest position if changed
        if (nestPosition) {
            this.nestPosition = nestPosition;
        }
        
        // Update all components in proper order
        if (this.stateComponent) {
            this.stateComponent.update();
        }
        
        if (this.healthComponent) {
            this.healthComponent.update();
        }
        
        if (this.behaviorComponent) {
            this.behaviorComponent.update(foods);
        }
        
        if (this.movementComponent) {
            this.movementComponent.update();
        }
        
        if (this.collectionComponent) {
            this.collectionComponent.update();
        }
        
        if (this.visualComponent) {
            this.visualComponent.update();
        }
        
        // Handle main state machine
        this.updateStateMachine(foods);
    }

    /**
     * Handle main state machine logic
     * @param {Array} foods - Available food sources
     */
    updateStateMachine(foods) {
        if (!this.stateComponent) return;
        
        const currentState = this.stateComponent.getState();
        
        switch (currentState) {
            case IdleAnts.Entities.AntBase.States.SEEKING_FOOD:
                this.handleSeekingFood(foods);
                break;
                
            case IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST:
                this.handleReturningToNest();
                break;
                
            case IdleAnts.Entities.AntBase.States.FIGHTING:
                this.handleFighting();
                break;
        }
    }

    /**
     * Handle seeking food state logic
     * @param {Array} foods - Available food sources
     */
    handleSeekingFood(foods) {
        if (!foods || foods.length === 0) return;
        
        // Find best food if we don't have a target
        if (!this.targetFood) {
            this.targetFood = this.findBestFood(foods);
        }
        
        // Move towards target food
        if (this.targetFood) {
            const reached = this.moveTowards(this.targetFood, this.config.foodCollectionRadius);
            
            if (reached && this.canCollectFood(this.targetFood)) {
                this.setState(IdleAnts.Entities.AntBase.States.COLLECTING_FOOD, { food: this.targetFood });
            }
        }
    }

    /**
     * Handle returning to nest state logic
     */
    handleReturningToNest() {
        const reached = this.moveTowards(this.nestPosition, this.config.nestRadius);
        
        if (reached) {
            this.setState(IdleAnts.Entities.AntBase.States.DELIVERING_FOOD);
        }
    }

    /**
     * Handle fighting state logic
     */
    handleFighting() {
        if (!this.targetEnemy || this.targetEnemy.isDead) {
            this.setState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
            return;
        }
        
        // Move towards enemy and attack
        const reached = this.moveTowards(this.targetEnemy, 20);
        
        if (reached && this.stateComponent.getStateDuration() % 30 === 0) {
            // Attack every 0.5 seconds
            if (this.targetEnemy.takeDamage) {
                this.targetEnemy.takeDamage(10);
            }
        }
    }

    // ===== UTILITY METHODS =====

    /**
     * Get distance to target
     * @param {Object} target - Target object with x, y properties
     * @returns {number} Distance to target
     */
    getDistanceTo(target) {
        return Math.sqrt(
            Math.pow(this.x - target.x, 2) + 
            Math.pow(this.y - target.y, 2)
        );
    }

    /**
     * Check if ant is at capacity
     * @returns {boolean} True if at capacity
     */
    isAtCapacity() {
        return this.foodCollected >= this.capacity;
    }

    /**
     * Get ant status for debugging
     * @returns {Object} Ant status information
     */
    getStatus() {
        return {
            id: this.id,
            state: this.state,
            position: { x: this.x, y: this.y },
            health: this.hp,
            foodCollected: this.foodCollected,
            capacity: this.capacity,
            targetFood: this.targetFood ? this.targetFood.id : null,
            targetEnemy: this.targetEnemy ? this.targetEnemy.id : null,
            components: {
                visual: !!this.visualComponent,
                health: !!this.healthComponent,
                state: !!this.stateComponent,
                movement: !!this.movementComponent,
                behavior: !!this.behaviorComponent,
                collection: !!this.collectionComponent
            }
        };
    }

    /**
     * Destroy the ant and all its components
     */
    destroy() {
        // Destroy all components
        if (this.visualComponent) {
            this.visualComponent.destroy();
        }
        
        if (this.healthComponent) {
            this.healthComponent.destroy();
        }
        
        if (this.movementComponent) {
            this.movementComponent.destroy();
        }
        
        if (this.behaviorComponent) {
            this.behaviorComponent.destroy();
        }
        
        if (this.collectionComponent) {
            this.collectionComponent.destroy();
        }
        
        if (this.stateComponent) {
            this.stateComponent.destroy();
        }
        
        // Clear references
        this.visualComponent = null;
        this.healthComponent = null;
        this.stateComponent = null;
        this.movementComponent = null;
        this.behaviorComponent = null;
        this.collectionComponent = null;
        
        // Call parent destroy
        super.destroy();
    }
};