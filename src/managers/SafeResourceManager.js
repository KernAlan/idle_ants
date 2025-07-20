/**
 * SafeResourceManager - Error-resilient wrapper for ResourceManager
 * Provides comprehensive error handling and recovery mechanisms
 */

IdleAnts.Managers.SafeResourceManager = class {
    constructor() {
        this.errorHandler = IdleAnts.Core.ErrorHandler.getInstance();
        this.isHealthy = true;
        this.lastKnownGoodState = null;
        this.operationCount = 0;
        this.errorCount = 0;
        
        // Initialize the actual ResourceManager with error handling
        this.resourceManager = this.errorHandler.safeExecute(
            () => new IdleAnts.Managers.ResourceManager(),
            'ResourceManager_initialization',
            this.createFallbackResourceManager()
        );
        
        // Store initial state as baseline
        this.saveGoodState();
        
        // Validate initial state
        this.validateState('initialization');
    }

    /**
     * Create a fallback resource manager if initialization fails
     * @returns {object} Fallback resource manager
     */
    createFallbackResourceManager() {
        this.errorHandler.logError('RESOURCEMANAGER_FALLBACK', 
            new Error('Using fallback ResourceManager'), 
            { reason: 'initialization_failed' }, 
            'WARN');

        return {
            resources: { food: 0, displayFood: 0 },
            stats: {
                ants: 1,
                maxAnts: 10,
                flyingAnts: 0,
                maxFlyingAnts: 0,
                flyingAntsUnlocked: false,
                foodPerClick: 1,
                foodPerSecond: 0,
                antCost: 10,
                foodMultiplier: 1,
                speedMultiplier: 1,
                strengthMultiplier: 1
            },
            // Fallback methods
            addFood: (amount) => { this.resources.food = Math.max(0, this.resources.food + amount); },
            spendFood: (amount) => {
                if (this.resources.food >= amount) {
                    this.resources.food -= amount;
                    return true;
                }
                return false;
            },
            updateFoodPerSecond: () => { this.stats.foodPerSecond = this.stats.ants; }
        };
    }

    /**
     * Safely execute a method with error handling and recovery
     * @param {string} methodName - Name of the method to execute
     * @param {Array} args - Arguments to pass to the method
     * @param {*} defaultReturn - Default return value on error
     * @returns {*} Method result or default value
     */
    safeMethod(methodName, args = [], defaultReturn = null) {
        this.operationCount++;
        
        return this.errorHandler.wrapFunction(
            () => {
                // Validate state before operation
                if (!this.validateState(`before_${methodName}`)) {
                    this.attemptRecovery();
                }
                
                // Execute the method
                const result = this.resourceManager[methodName]?.apply(this.resourceManager, args);
                
                // Validate state after operation
                if (!this.validateState(`after_${methodName}`)) {
                    this.attemptRecovery();
                }
                
                // Save good state periodically
                if (this.operationCount % 10 === 0) {
                    this.saveGoodState();
                }
                
                return result;
            },
            `ResourceManager.${methodName}`,
            {
                fallback: defaultReturn,
                maxRetries: 2,
                rethrow: false
            }
        )();
    }

    /**
     * Validate the current state of the resource manager
     * @param {string} context - Context for validation
     * @returns {boolean} True if state is valid
     */
    validateState(context) {
        const validationSchema = {
            resources: {
                required: true,
                validator: (val) => val && typeof val === 'object' && 
                    typeof val.food === 'number' && val.food >= 0
            },
            stats: {
                required: true,
                validator: (val) => val && typeof val === 'object' && 
                    typeof val.ants === 'number' && val.ants >= 0 &&
                    typeof val.maxAnts === 'number' && val.maxAnts >= 0
            }
        };

        const isValid = this.errorHandler.validateObject(
            this.resourceManager, 
            validationSchema, 
            `ResourceManager_${context}`
        );

        if (!isValid) {
            this.isHealthy = false;
            this.errorCount++;
        } else {
            this.isHealthy = true;
        }

        return isValid;
    }

    /**
     * Save current state as known good state
     */
    saveGoodState() {
        try {
            this.lastKnownGoodState = {
                resources: { ...this.resourceManager.resources },
                stats: { ...this.resourceManager.stats },
                timestamp: Date.now()
            };
        } catch (error) {
            this.errorHandler.logError('SAVE_GOOD_STATE_ERROR', error, {
                context: 'ResourceManager.saveGoodState'
            });
        }
    }

    /**
     * Attempt to recover from corrupted state
     */
    attemptRecovery() {
        this.errorHandler.logError('RESOURCEMANAGER_RECOVERY_ATTEMPT', 
            new Error('Attempting recovery'), 
            { 
                errorCount: this.errorCount,
                hasGoodState: !!this.lastKnownGoodState 
            }, 
            'WARN');

        if (this.lastKnownGoodState) {
            try {
                // Restore from last known good state
                this.resourceManager.resources = { ...this.lastKnownGoodState.resources };
                this.resourceManager.stats = { ...this.lastKnownGoodState.stats };
                
                this.errorHandler.logError('RESOURCEMANAGER_RECOVERY_SUCCESS', 
                    new Error('Recovery successful'), 
                    { 
                        restoredFrom: this.lastKnownGoodState.timestamp 
                    }, 
                    'INFO');
                    
                this.isHealthy = true;
                return true;
            } catch (error) {
                this.errorHandler.logError('RESOURCEMANAGER_RECOVERY_FAILED', error, {
                    context: 'state_restoration'
                });
            }
        }

        // If recovery fails, create new fallback
        this.resourceManager = this.createFallbackResourceManager();
        return false;
    }

    /**
     * Get health status of the resource manager
     * @returns {object} Health information
     */
    getHealthStatus() {
        return {
            isHealthy: this.isHealthy,
            operationCount: this.operationCount,
            errorCount: this.errorCount,
            errorRate: this.operationCount > 0 ? this.errorCount / this.operationCount : 0,
            hasGoodState: !!this.lastKnownGoodState,
            lastGoodStateAge: this.lastKnownGoodState ? 
                Date.now() - this.lastKnownGoodState.timestamp : null
        };
    }

    // Proxied methods with error handling
    addFood(amount) {
        this.errorHandler.assert(
            typeof amount === 'number' && amount >= 0,
            'Invalid food amount',
            { amount: amount, type: typeof amount }
        );
        
        return this.safeMethod('addFood', [amount]);
    }

    spendFood(amount) {
        this.errorHandler.assert(
            typeof amount === 'number' && amount >= 0,
            'Invalid spend amount',
            { amount: amount, type: typeof amount }
        );
        
        return this.safeMethod('spendFood', [amount], false);
    }

    getAntCost() {
        return this.safeMethod('getAntCost', [], 10);
    }

    purchaseAnt() {
        return this.safeMethod('purchaseAnt', [], false);
    }

    getFoodUpgradeCost() {
        return this.safeMethod('getFoodUpgradeCost', [], 1000);
    }

    upgradeFoodMultiplier() {
        return this.safeMethod('upgradeFoodMultiplier', [], false);
    }

    getStrengthUpgradeCost() {
        return this.safeMethod('getStrengthUpgradeCost', [], 50);
    }

    upgradeStrengthMultiplier() {
        return this.safeMethod('upgradeStrengthMultiplier', [], false);
    }

    unlockFlyingAnts() {
        return this.safeMethod('unlockFlyingAnts', [], false);
    }

    purchaseFlyingAnt() {
        return this.safeMethod('purchaseFlyingAnt', [], false);
    }

    calculateFoodPerSecond() {
        return this.safeMethod('calculateFoodPerSecond', [], 0);
    }

    updateFoodPerSecond() {
        return this.safeMethod('updateFoodPerSecond', []);
    }

    // Property accessors with validation
    get resources() {
        if (!this.resourceManager.resources) {
            this.errorHandler.logError('MISSING_RESOURCES', 
                new Error('Resources object missing'), 
                { manager: !!this.resourceManager });
            return { food: 0, displayFood: 0 };
        }
        return this.resourceManager.resources;
    }

    get stats() {
        if (!this.resourceManager.stats) {
            this.errorHandler.logError('MISSING_STATS', 
                new Error('Stats object missing'), 
                { manager: !!this.resourceManager });
            return { ants: 1, maxAnts: 10, foodPerSecond: 0 };
        }
        return this.resourceManager.stats;
    }

    /**
     * Force a complete reset of the resource manager
     */
    forceReset() {
        this.errorHandler.logError('RESOURCEMANAGER_FORCE_RESET', 
            new Error('Force reset initiated'), 
            { 
                operationCount: this.operationCount,
                errorCount: this.errorCount 
            }, 
            'WARN');

        this.resourceManager = this.errorHandler.safeExecute(
            () => new IdleAnts.Managers.ResourceManager(),
            'ResourceManager_force_reset',
            this.createFallbackResourceManager()
        );

        this.operationCount = 0;
        this.errorCount = 0;
        this.isHealthy = true;
        this.saveGoodState();
    }

    /**
     * Export diagnostic information
     * @returns {object} Diagnostic data
     */
    exportDiagnostics() {
        return {
            health: this.getHealthStatus(),
            resourceState: this.errorHandler.safeExecute(
                () => ({ ...this.resourceManager.resources }),
                'export_resources',
                {}
            ),
            statsState: this.errorHandler.safeExecute(
                () => ({ ...this.resourceManager.stats }),
                'export_stats',
                {}
            ),
            lastGoodState: this.lastKnownGoodState,
            timestamp: new Date().toISOString()
        };
    }
};