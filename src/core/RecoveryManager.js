/**
 * RecoveryManager - Handles critical system recovery and fallback mechanisms
 * Provides automated recovery strategies for when core systems fail
 */

// Ensure Core namespace exists
if (!IdleAnts.Core) {
    IdleAnts.Core = {};
}

IdleAnts.Core.RecoveryManager = class {
    constructor() {
        this.errorHandler = IdleAnts.Core.ErrorHandler.getInstance();
        this.recoveryStrategies = new Map();
        this.systemHealth = new Map();
        this.lastRecoveryAttempts = new Map();
        this.recoveryLimits = new Map();
        this.isRecovering = false;
        
        // Default recovery limits
        this.defaultRecoveryLimit = 3;
        this.recoveryTimeout = 30000; // 30 seconds
        
        this.setupDefaultStrategies();
        this.setupHealthMonitoring();
    }

    /**
     * Set up default recovery strategies for core systems
     */
    setupDefaultStrategies() {
        // ResourceManager recovery
        this.registerRecoveryStrategy('ResourceManager', {
            priority: 'critical',
            timeout: 10000,
            maxAttempts: 3,
            strategy: this.recoverResourceManager.bind(this),
            validator: this.validateResourceManager.bind(this),
            fallback: this.createResourceManagerFallback.bind(this)
        });

        // EntityManager recovery
        this.registerRecoveryStrategy('EntityManager', {
            priority: 'critical',
            timeout: 15000,
            maxAttempts: 2,
            strategy: this.recoverEntityManager.bind(this),
            validator: this.validateEntityManager.bind(this),
            fallback: this.createEntityManagerFallback.bind(this)
        });

        // Game State recovery
        this.registerRecoveryStrategy('GameState', {
            priority: 'high',
            timeout: 5000,
            maxAttempts: 5,
            strategy: this.recoverGameState.bind(this),
            validator: this.validateGameState.bind(this),
            fallback: this.createGameStateFallback.bind(this)
        });

        // PIXI Application recovery
        this.registerRecoveryStrategy('PIXIApp', {
            priority: 'critical',
            timeout: 20000,
            maxAttempts: 1,
            strategy: this.recoverPIXIApp.bind(this),
            validator: this.validatePIXIApp.bind(this),
            fallback: this.createPIXIAppFallback.bind(this)
        });

        // Audio System recovery
        this.registerRecoveryStrategy('AudioSystem', {
            priority: 'low',
            timeout: 5000,
            maxAttempts: 2,
            strategy: this.recoverAudioSystem.bind(this),
            validator: this.validateAudioSystem.bind(this),
            fallback: this.createAudioSystemFallback.bind(this)
        });
    }

    /**
     * Set up health monitoring for critical systems
     */
    setupHealthMonitoring() {
        // Monitor systems every 10 seconds
        setInterval(() => {
            this.performHealthCheck();
        }, 10000);

        // Initial health check
        setTimeout(() => {
            this.performHealthCheck();
        }, 1000);
    }

    /**
     * Register a recovery strategy for a system
     * @param {string} systemName - Name of the system
     * @param {object} strategy - Recovery strategy configuration
     */
    registerRecoveryStrategy(systemName, strategy) {
        this.recoveryStrategies.set(systemName, {
            priority: strategy.priority || 'medium',
            timeout: strategy.timeout || 10000,
            maxAttempts: strategy.maxAttempts || this.defaultRecoveryLimit,
            strategy: strategy.strategy,
            validator: strategy.validator,
            fallback: strategy.fallback,
            lastSuccess: null,
            attemptCount: 0
        });

        this.systemHealth.set(systemName, {
            isHealthy: true,
            lastCheck: Date.now(),
            consecutiveFailures: 0,
            totalFailures: 0
        });
    }

    /**
     * Perform health check on all registered systems
     */
    performHealthCheck() {
        const failedSystems = [];

        for (const [systemName, strategy] of this.recoveryStrategies) {
            try {
                const isHealthy = strategy.validator();
                const health = this.systemHealth.get(systemName);

                if (isHealthy) {
                    health.isHealthy = true;
                    health.consecutiveFailures = 0;
                } else {
                    health.isHealthy = false;
                    health.consecutiveFailures++;
                    health.totalFailures++;
                    failedSystems.push(systemName);
                }

                health.lastCheck = Date.now();
            } catch (error) {
                this.errorHandler.logError('HEALTH_CHECK_ERROR', error, {
                    system: systemName
                });
                failedSystems.push(systemName);
            }
        }

        if (failedSystems.length > 0) {
            this.initiateRecovery(failedSystems);
        }
    }

    /**
     * Initiate recovery for failed systems
     * @param {Array} failedSystems - List of failed system names
     */
    async initiateRecovery(failedSystems) {
        if (this.isRecovering) {
            this.errorHandler.logError('RECOVERY_IN_PROGRESS', 
                new Error('Recovery already in progress'), 
                { failedSystems: failedSystems }, 
                'WARN');
            return;
        }

        this.isRecovering = true;
        this.errorHandler.logError('RECOVERY_INITIATED', 
            new Error('System recovery initiated'), 
            { failedSystems: failedSystems }, 
            'WARN');

        // Sort by priority (critical first)
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        failedSystems.sort((a, b) => {
            const priorityA = priorityOrder[this.recoveryStrategies.get(a).priority] || 99;
            const priorityB = priorityOrder[this.recoveryStrategies.get(b).priority] || 99;
            return priorityA - priorityB;
        });

        const recoveryResults = [];

        for (const systemName of failedSystems) {
            try {
                const result = await this.recoverSystem(systemName);
                recoveryResults.push({ system: systemName, success: result });
            } catch (error) {
                this.errorHandler.logError('SYSTEM_RECOVERY_ERROR', error, {
                    system: systemName
                });
                recoveryResults.push({ system: systemName, success: false, error: error.message });
            }
        }

        this.isRecovering = false;
        this.logRecoveryResults(recoveryResults);
    }

    /**
     * Recover a specific system
     * @param {string} systemName - Name of the system to recover
     * @returns {Promise<boolean>} True if recovery was successful
     */
    async recoverSystem(systemName) {
        const strategy = this.recoveryStrategies.get(systemName);
        if (!strategy) {
            throw new Error(`No recovery strategy found for ${systemName}`);
        }

        const lastAttempt = this.lastRecoveryAttempts.get(systemName) || 0;
        const timeSinceLastAttempt = Date.now() - lastAttempt;

        // Check if we're within the recovery timeout
        if (timeSinceLastAttempt < this.recoveryTimeout) {
            this.errorHandler.logError('RECOVERY_TIMEOUT', 
                new Error('Recovery attempted too recently'), 
                { 
                    system: systemName, 
                    timeSinceLastAttempt: timeSinceLastAttempt 
                }, 
                'WARN');
            return false;
        }

        // Check attempt limits
        if (strategy.attemptCount >= strategy.maxAttempts) {
            this.errorHandler.logError('RECOVERY_LIMIT_EXCEEDED', 
                new Error('Maximum recovery attempts exceeded'), 
                { 
                    system: systemName, 
                    attempts: strategy.attemptCount, 
                    maxAttempts: strategy.maxAttempts 
                }, 
                'ERROR');
            
            // Use fallback as last resort
            return this.useFallback(systemName);
        }

        this.lastRecoveryAttempts.set(systemName, Date.now());
        strategy.attemptCount++;

        try {
            this.errorHandler.logError('RECOVERY_ATTEMPT', 
                new Error('Attempting system recovery'), 
                { 
                    system: systemName, 
                    attempt: strategy.attemptCount 
                }, 
                'INFO');

            // Execute recovery strategy with timeout
            const recoveryPromise = strategy.strategy();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Recovery timeout')), strategy.timeout);
            });

            await Promise.race([recoveryPromise, timeoutPromise]);

            // Validate recovery
            const isRecovered = strategy.validator();
            if (isRecovered) {
                strategy.lastSuccess = Date.now();
                strategy.attemptCount = 0; // Reset on success
                
                this.errorHandler.logError('RECOVERY_SUCCESS', 
                    new Error('System recovery successful'), 
                    { system: systemName }, 
                    'INFO');
                
                return true;
            } else {
                throw new Error('Recovery validation failed');
            }

        } catch (error) {
            this.errorHandler.logError('RECOVERY_FAILED', error, {
                system: systemName,
                attempt: strategy.attemptCount
            });
            
            return false;
        }
    }

    /**
     * Use fallback for a system
     * @param {string} systemName - Name of the system
     * @returns {boolean} True if fallback was successful
     */
    useFallback(systemName) {
        const strategy = this.recoveryStrategies.get(systemName);
        if (!strategy || !strategy.fallback) {
            return false;
        }

        try {
            this.errorHandler.logError('USING_FALLBACK', 
                new Error('Using fallback system'), 
                { system: systemName }, 
                'WARN');

            strategy.fallback();
            return true;
        } catch (error) {
            this.errorHandler.logError('FALLBACK_FAILED', error, {
                system: systemName
            });
            return false;
        }
    }

    /**
     * Log recovery results
     * @param {Array} results - Recovery results
     */
    logRecoveryResults(results) {
        const successful = results.filter(r => r.success).length;
        const failed = results.length - successful;

        this.errorHandler.logError('RECOVERY_COMPLETE', 
            new Error('Recovery process completed'), 
            { 
                totalSystems: results.length,
                successful: successful,
                failed: failed,
                results: results
            }, 
            failed === 0 ? 'INFO' : 'WARN');
    }

    // ========== SYSTEM-SPECIFIC RECOVERY STRATEGIES ==========

    /**
     * Recover ResourceManager
     */
    async recoverResourceManager() {
        if (typeof IdleAnts !== 'undefined' && IdleAnts.app && IdleAnts.app.resourceManager) {
            // Try to reset the resource manager
            if (IdleAnts.app.resourceManager.forceReset) {
                IdleAnts.app.resourceManager.forceReset();
            } else {
                // Recreate resource manager
                IdleAnts.app.resourceManager = new IdleAnts.Managers.SafeResourceManager();
            }
        }
    }

    /**
     * Validate ResourceManager
     * @returns {boolean} True if healthy
     */
    validateResourceManager() {
        try {
            if (!IdleAnts.app || !IdleAnts.app.resourceManager) return false;
            
            const rm = IdleAnts.app.resourceManager;
            return rm.resources && 
                   typeof rm.resources.food === 'number' && 
                   rm.stats && 
                   typeof rm.stats.ants === 'number';
        } catch (error) {
            return false;
        }
    }

    /**
     * Create ResourceManager fallback
     */
    createResourceManagerFallback() {
        if (IdleAnts.app) {
            IdleAnts.app.resourceManager = {
                resources: { food: 0, displayFood: 0 },
                stats: { ants: 1, maxAnts: 10, foodPerSecond: 0 },
                addFood: (amount) => {},
                spendFood: (amount) => false,
                updateFoodPerSecond: () => {}
            };
        }
    }

    /**
     * Recover EntityManager
     */
    async recoverEntityManager() {
        if (typeof IdleAnts !== 'undefined' && IdleAnts.app && IdleAnts.app.entityManager) {
            if (IdleAnts.app.entityManager.forceCleanup) {
                IdleAnts.app.entityManager.forceCleanup();
            }
        }
    }

    /**
     * Validate EntityManager
     * @returns {boolean} True if healthy
     */
    validateEntityManager() {
        try {
            if (!IdleAnts.app || !IdleAnts.app.entityManager) return false;
            
            const em = IdleAnts.app.entityManager;
            return em.entities && 
                   Array.isArray(em.entities.ants) && 
                   Array.isArray(em.entities.foods);
        } catch (error) {
            return false;
        }
    }

    /**
     * Create EntityManager fallback
     */
    createEntityManagerFallback() {
        if (IdleAnts.app) {
            IdleAnts.app.entityManager = {
                entities: { ants: [], foods: [], enemies: [] },
                createNest: () => {},
                getNestPosition: () => null,
                getAntCount: () => 0,
                update: () => {}
            };
        }
    }

    /**
     * Recover Game State
     */
    async recoverGameState() {
        if (IdleAnts.app && IdleAnts.app.stateManager) {
            IdleAnts.app.stateManager.setState('PLAYING');
        } else if (IdleAnts.app) {
            IdleAnts.app.state = 'PLAYING';
        }
    }

    /**
     * Validate Game State
     * @returns {boolean} True if healthy
     */
    validateGameState() {
        try {
            if (!IdleAnts.app) return false;
            
            const state = IdleAnts.app.state || (IdleAnts.app.stateManager && IdleAnts.app.stateManager.getState());
            return typeof state === 'string' && state.length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Create Game State fallback
     */
    createGameStateFallback() {
        if (IdleAnts.app) {
            IdleAnts.app.state = 'PLAYING';
        }
    }

    /**
     * Recover PIXI Application
     */
    async recoverPIXIApp() {
        if (typeof PIXI !== 'undefined' && IdleAnts.app) {
            // Try to recreate the PIXI app
            const newApp = new PIXI.Application({
                background: '#78AB46',
                resizeTo: window
            });
            
            // Replace the canvas
            if (IdleAnts.app.app && IdleAnts.app.app.view) {
                const oldCanvas = IdleAnts.app.app.view;
                oldCanvas.parentNode.replaceChild(newApp.view, oldCanvas);
            }
            
            IdleAnts.app.app = newApp;
        }
    }

    /**
     * Validate PIXI Application
     * @returns {boolean} True if healthy
     */
    validatePIXIApp() {
        try {
            return IdleAnts.app && 
                   IdleAnts.app.app && 
                   IdleAnts.app.app.stage && 
                   IdleAnts.app.app.renderer;
        } catch (error) {
            return false;
        }
    }

    /**
     * Create PIXI Application fallback
     */
    createPIXIAppFallback() {
        // Create minimal canvas fallback
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.background = '#78AB46';
        
        const container = document.getElementById('game-canvas-container');
        if (container) {
            container.appendChild(canvas);
        }
    }

    /**
     * Recover Audio System
     */
    async recoverAudioSystem() {
        if (IdleAnts.app && IdleAnts.app.audioManager) {
            if (IdleAnts.app.audioManager.initialize) {
                IdleAnts.app.audioManager.initialize();
            }
        }
    }

    /**
     * Validate Audio System
     * @returns {boolean} True if healthy
     */
    validateAudioSystem() {
        // Audio is not critical, so we're more lenient
        return true;
    }

    /**
     * Create Audio System fallback
     */
    createAudioSystemFallback() {
        if (IdleAnts.app) {
            IdleAnts.app.audioManager = {
                playSound: () => {},
                stopSound: () => {},
                setVolume: () => {}
            };
        }
    }

    /**
     * Get system health report
     * @returns {object} Health report
     */
    getSystemHealthReport() {
        const report = {
            timestamp: new Date().toISOString(),
            overallHealth: 'healthy',
            systems: {},
            isRecovering: this.isRecovering,
            criticalFailures: 0
        };

        for (const [systemName, health] of this.systemHealth) {
            const strategy = this.recoveryStrategies.get(systemName);
            
            report.systems[systemName] = {
                isHealthy: health.isHealthy,
                priority: strategy.priority,
                consecutiveFailures: health.consecutiveFailures,
                totalFailures: health.totalFailures,
                lastCheck: health.lastCheck,
                recoveryAttempts: strategy.attemptCount,
                lastSuccessfulRecovery: strategy.lastSuccess
            };

            if (!health.isHealthy && strategy.priority === 'critical') {
                report.criticalFailures++;
                report.overallHealth = 'critical';
            } else if (!health.isHealthy && report.overallHealth === 'healthy') {
                report.overallHealth = 'degraded';
            }
        }

        return report;
    }

    /**
     * Force recovery of a specific system
     * @param {string} systemName - System to recover
     * @returns {Promise<boolean>} Recovery success
     */
    async forceRecovery(systemName) {
        if (!this.recoveryStrategies.has(systemName)) {
            throw new Error(`Unknown system: ${systemName}`);
        }

        // Reset attempt count to allow forced recovery
        const strategy = this.recoveryStrategies.get(systemName);
        strategy.attemptCount = 0;

        return await this.recoverSystem(systemName);
    }

    /**
     * Get singleton instance
     * @returns {IdleAnts.Core.RecoveryManager} Singleton instance
     */
    static getInstance() {
        if (!IdleAnts.Core.RecoveryManager._instance) {
            IdleAnts.Core.RecoveryManager._instance = new IdleAnts.Core.RecoveryManager();
        }
        return IdleAnts.Core.RecoveryManager._instance;
    }
};

// Initialize global recovery manager
if (typeof window !== 'undefined') {
    IdleAnts.Core.RecoveryManager.getInstance();
    
    // Add to global scope for easy access
    window.RecoveryManager = IdleAnts.Core.RecoveryManager.getInstance();
}