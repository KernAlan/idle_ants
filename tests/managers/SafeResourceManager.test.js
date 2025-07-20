/**
 * Comprehensive unit tests for SafeResourceManager
 * Tests error handling, recovery, and edge cases
 */

// Set up test environment with error handler and mocks
global.IdleAnts = {
    Core: {},
    Managers: {},
    Data: {
        FoodTypes: {
            BASIC: { name: 'Basic', value: 1 },
            APPLE: { name: 'Apple', value: 2 }
        }
    },
    Config: { debug: false }
};

// Import error handler first
require('../../src/core/ErrorHandler.js');

// Mock the original ResourceManager with various failure modes
global.IdleAnts.Managers.ResourceManager = class {
    constructor() {
        this.resources = { food: 0, displayFood: 0 };
        this.stats = { ants: 1, maxAnts: 10, foodPerSecond: 0 };
        this.shouldFail = false;
        this.failureMode = null;
    }

    addFood(amount) {
        if (this.shouldFail && this.failureMode === 'addFood') {
            throw new Error('Simulated addFood failure');
        }
        this.resources.food = Math.max(0, this.resources.food + amount);
    }

    spendFood(amount) {
        if (this.shouldFail && this.failureMode === 'spendFood') {
            throw new Error('Simulated spendFood failure');
        }
        if (this.resources.food >= amount) {
            this.resources.food -= amount;
            return true;
        }
        return false;
    }

    getAntCost() {
        if (this.shouldFail && this.failureMode === 'getAntCost') {
            throw new Error('Simulated getAntCost failure');
        }
        return Math.floor(this.stats.antCost * Math.pow(1.5, this.stats.ants - 1));
    }

    // Simulate corrupted state
    corruptState() {
        this.resources = null;
        this.stats = undefined;
    }
};

// Import the SafeResourceManager
require('../../src/managers/SafeResourceManager.js');

describe('SafeResourceManager Error Handling Tests', () => {
    let safeResourceManager;
    let errorHandler;

    beforeEach(() => {
        errorHandler = IdleAnts.Core.ErrorHandler.getInstance();
        errorHandler.clearErrors();
        safeResourceManager = new IdleAnts.Managers.SafeResourceManager();
    });

    describe('Initialization and Fallback', () => {
        test('should initialize successfully with valid ResourceManager', () => {
            expect(safeResourceManager.resourceManager).toBeDefined();
            expect(safeResourceManager.isHealthy).toBe(true);
            expect(safeResourceManager.resources).toBeDefined();
            expect(safeResourceManager.stats).toBeDefined();
        });

        test('should use fallback when initialization fails', () => {
            // Mock ResourceManager constructor to fail
            const originalRM = IdleAnts.Managers.ResourceManager;
            IdleAnts.Managers.ResourceManager = class {
                constructor() {
                    throw new Error('Initialization failed');
                }
            };

            const failedSafeRM = new IdleAnts.Managers.SafeResourceManager();
            
            expect(failedSafeRM.resourceManager).toBeDefined();
            expect(failedSafeRM.resources.food).toBe(0);
            expect(failedSafeRM.stats.ants).toBe(1);
            expect(errorHandler.errors.length).toBeGreaterThan(0);

            // Restore original
            IdleAnts.Managers.ResourceManager = originalRM;
        });

        test('should save and restore good state', () => {
            safeResourceManager.resourceManager.resources.food = 1000;
            safeResourceManager.saveGoodState();

            expect(safeResourceManager.lastKnownGoodState).toBeDefined();
            expect(safeResourceManager.lastKnownGoodState.resources.food).toBe(1000);
        });
    });

    describe('Method Error Handling', () => {
        test('should handle addFood errors gracefully', () => {
            safeResourceManager.resourceManager.shouldFail = true;
            safeResourceManager.resourceManager.failureMode = 'addFood';

            // Should not throw, should use fallback behavior
            expect(() => {
                safeResourceManager.addFood(100);
            }).not.toThrow();

            expect(errorHandler.errors.length).toBeGreaterThan(0);
            expect(errorHandler.errors.some(e => e.type === 'WRAPPED_FUNCTION_ERROR')).toBe(true);
        });

        test('should handle spendFood errors gracefully', () => {
            safeResourceManager.resourceManager.shouldFail = true;
            safeResourceManager.resourceManager.failureMode = 'spendFood';

            const result = safeResourceManager.spendFood(50);
            
            expect(result).toBe(false); // Fallback return value
            expect(errorHandler.errors.length).toBeGreaterThan(0);
        });

        test('should retry failed operations', () => {
            let attempts = 0;
            const originalAddFood = safeResourceManager.resourceManager.addFood;
            safeResourceManager.resourceManager.addFood = function(amount) {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Temporary failure');
                }
                return originalAddFood.call(this, amount);
            };

            safeResourceManager.addFood(100);
            
            expect(attempts).toBe(3); // Should retry twice then succeed
        });

        test('should validate input parameters', () => {
            // Invalid food amount
            safeResourceManager.addFood('invalid');
            safeResourceManager.addFood(-100);
            safeResourceManager.addFood(NaN);
            
            expect(errorHandler.errors.some(e => e.type === 'ASSERTION_FAILED')).toBe(true);
        });
    });

    describe('State Validation and Recovery', () => {
        test('should detect corrupted state', () => {
            safeResourceManager.resourceManager.corruptState();
            
            const isValid = safeResourceManager.validateState('corruption_test');
            
            expect(isValid).toBe(false);
            expect(safeResourceManager.isHealthy).toBe(false);
        });

        test('should attempt recovery from good state', () => {
            // Save a good state first
            safeResourceManager.resourceManager.resources.food = 500;
            safeResourceManager.saveGoodState();
            
            // Corrupt the state
            safeResourceManager.resourceManager.corruptState();
            
            // Attempt recovery
            const recovered = safeResourceManager.attemptRecovery();
            
            expect(recovered).toBe(true);
            expect(safeResourceManager.resourceManager.resources.food).toBe(500);
        });

        test('should create fallback when recovery fails', () => {
            // No good state saved
            safeResourceManager.lastKnownGoodState = null;
            safeResourceManager.resourceManager.corruptState();
            
            const recovered = safeResourceManager.attemptRecovery();
            
            expect(recovered).toBe(false);
            expect(safeResourceManager.resourceManager.resources).toBeDefined();
            expect(safeResourceManager.resourceManager.stats).toBeDefined();
        });

        test('should handle validation errors gracefully', () => {
            // Make validate throw an error
            const originalValidateObject = errorHandler.validateObject;
            errorHandler.validateObject = () => {
                throw new Error('Validation crashed');
            };

            const isValid = safeResourceManager.validateState('validation_crash_test');
            
            expect(isValid).toBe(false);
            expect(errorHandler.errors.some(e => e.message === 'Validation crashed')).toBe(true);

            // Restore original
            errorHandler.validateObject = originalValidateObject;
        });
    });

    describe('Property Access Safety', () => {
        test('should provide safe access to resources', () => {
            const resources = safeResourceManager.resources;
            expect(resources).toBeDefined();
            expect(resources.food).toBeDefined();
            expect(resources.displayFood).toBeDefined();
        });

        test('should provide fallback when resources are missing', () => {
            safeResourceManager.resourceManager.resources = null;
            
            const resources = safeResourceManager.resources;
            expect(resources.food).toBe(0);
            expect(resources.displayFood).toBe(0);
            expect(errorHandler.errors.some(e => e.type === 'MISSING_RESOURCES')).toBe(true);
        });

        test('should provide safe access to stats', () => {
            const stats = safeResourceManager.stats;
            expect(stats).toBeDefined();
            expect(stats.ants).toBeDefined();
            expect(stats.maxAnts).toBeDefined();
        });

        test('should provide fallback when stats are missing', () => {
            safeResourceManager.resourceManager.stats = undefined;
            
            const stats = safeResourceManager.stats;
            expect(stats.ants).toBe(1);
            expect(stats.maxAnts).toBe(10);
            expect(errorHandler.errors.some(e => e.type === 'MISSING_STATS')).toBe(true);
        });
    });

    describe('Health Monitoring', () => {
        test('should track operation and error counts', () => {
            const initialHealth = safeResourceManager.getHealthStatus();
            expect(initialHealth.operationCount).toBe(0);
            expect(initialHealth.errorCount).toBe(0);

            // Perform some operations
            safeResourceManager.addFood(100);
            safeResourceManager.spendFood(50);

            const updatedHealth = safeResourceManager.getHealthStatus();
            expect(updatedHealth.operationCount).toBeGreaterThan(0);
        });

        test('should calculate error rate correctly', () => {
            // Cause some errors
            safeResourceManager.resourceManager.shouldFail = true;
            safeResourceManager.resourceManager.failureMode = 'addFood';
            
            safeResourceManager.addFood(100);
            safeResourceManager.addFood(200);
            
            const health = safeResourceManager.getHealthStatus();
            expect(health.errorRate).toBeGreaterThan(0);
        });

        test('should export comprehensive diagnostics', () => {
            safeResourceManager.addFood(100);
            const diagnostics = safeResourceManager.exportDiagnostics();
            
            expect(diagnostics.health).toBeDefined();
            expect(diagnostics.resourceState).toBeDefined();
            expect(diagnostics.statsState).toBeDefined();
            expect(diagnostics.timestamp).toBeDefined();
        });
    });

    describe('Edge Cases and Stress Tests', () => {
        test('should handle rapid successive operations', () => {
            for (let i = 0; i < 100; i++) {
                safeResourceManager.addFood(i);
                safeResourceManager.spendFood(i / 2);
            }
            
            const health = safeResourceManager.getHealthStatus();
            expect(health.operationCount).toBe(200);
            expect(safeResourceManager.isHealthy).toBe(true);
        });

        test('should handle force reset', () => {
            // Corrupt state
            safeResourceManager.resourceManager.corruptState();
            safeResourceManager.isHealthy = false;
            safeResourceManager.errorCount = 50;
            
            safeResourceManager.forceReset();
            
            expect(safeResourceManager.isHealthy).toBe(true);
            expect(safeResourceManager.errorCount).toBe(0);
            expect(safeResourceManager.operationCount).toBe(0);
        });

        test('should handle null/undefined method calls', () => {
            delete safeResourceManager.resourceManager.addFood;
            
            expect(() => {
                safeResourceManager.addFood(100);
            }).not.toThrow();
        });

        test('should handle extreme values', () => {
            expect(() => {
                safeResourceManager.addFood(Infinity);
                safeResourceManager.addFood(-Infinity);
                safeResourceManager.addFood(NaN);
                safeResourceManager.spendFood(Number.MAX_SAFE_INTEGER);
            }).not.toThrow();
        });

        test('should maintain data integrity under stress', () => {
            const initialFood = safeResourceManager.resources.food;
            
            // Perform many operations with some failures
            safeResourceManager.resourceManager.shouldFail = true;
            
            for (let i = 0; i < 50; i++) {
                safeResourceManager.resourceManager.failureMode = i % 2 === 0 ? 'addFood' : null;
                safeResourceManager.addFood(10);
            }
            
            // Food should still be a valid number
            expect(typeof safeResourceManager.resources.food).toBe('number');
            expect(isFinite(safeResourceManager.resources.food)).toBe(true);
            expect(safeResourceManager.resources.food).toBeGreaterThanOrEqual(initialFood);
        });
    });

    describe('Error Boundary Integration', () => {
        test('should log errors to ErrorHandler', () => {
            safeResourceManager.resourceManager.shouldFail = true;
            safeResourceManager.resourceManager.failureMode = 'addFood';
            
            safeResourceManager.addFood(100);
            
            const errorStats = errorHandler.getErrorStats();
            expect(errorStats.totalErrors).toBeGreaterThan(0);
            expect(errorStats.errorsByType.WRAPPED_FUNCTION_ERROR).toBeGreaterThan(0);
        });

        test('should provide error context in logs', () => {
            safeResourceManager.resourceManager.shouldFail = true;
            safeResourceManager.resourceManager.failureMode = 'spendFood';
            
            safeResourceManager.spendFood(50);
            
            const lastError = errorHandler.errors[errorHandler.errors.length - 1];
            expect(lastError.context.context).toContain('ResourceManager.spendFood');
        });
    });
});