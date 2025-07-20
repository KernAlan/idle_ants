/**
 * Comprehensive unit tests for ErrorHandler
 * Tests error catching, logging, recovery, and edge cases
 */

// Set up test environment with error handler
global.IdleAnts = {
    Core: {},
    Config: { debug: false }
};

// Mock console methods to test logging
const originalConsole = { ...console };
beforeEach(() => {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.debug = jest.fn();
});

afterEach(() => {
    Object.assign(console, originalConsole);
});

// Import the ErrorHandler
require('../../src/core/ErrorHandler.js');

describe('ErrorHandler Comprehensive Tests', () => {
    let errorHandler;

    beforeEach(() => {
        errorHandler = new IdleAnts.Core.ErrorHandler();
        errorHandler.clearErrors();
    });

    describe('Basic Error Logging', () => {
        test('should log simple error messages', () => {
            const errorId = errorHandler.logError('TEST_ERROR', 'Test message');
            
            expect(errorId).toBeDefined();
            expect(errorHandler.errors.length).toBe(1);
            expect(errorHandler.errors[0].message).toBe('Test message');
            expect(errorHandler.errors[0].type).toBe('TEST_ERROR');
        });

        test('should log Error objects with stack traces', () => {
            const error = new Error('Test error object');
            const errorId = errorHandler.logError('TEST_ERROR_OBJECT', error);
            
            expect(errorHandler.errors[0].stack).toBeDefined();
            expect(errorHandler.errors[0].message).toBe('Test error object');
        });

        test('should handle different severity levels', () => {
            errorHandler.logError('DEBUG_ERROR', 'Debug message', {}, 'DEBUG');
            errorHandler.logError('INFO_ERROR', 'Info message', {}, 'INFO');
            errorHandler.logError('WARN_ERROR', 'Warn message', {}, 'WARN');
            errorHandler.logError('ERROR_ERROR', 'Error message', {}, 'ERROR');
            
            expect(console.debug).toHaveBeenCalled();
            expect(console.info).toHaveBeenCalled();
            expect(console.warn).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalled();
        });

        test('should track error frequency', () => {
            errorHandler.logError('FREQUENT_ERROR', 'Same error');
            errorHandler.logError('FREQUENT_ERROR', 'Same error');
            errorHandler.logError('FREQUENT_ERROR', 'Same error');
            
            const stats = errorHandler.getErrorStats();
            expect(stats.mostFrequentErrors[0][1]).toBe(3);
        });
    });

    describe('Function Wrapping and Safe Execution', () => {
        test('should wrap functions and catch errors', () => {
            const faultyFunction = () => {
                throw new Error('Function failed');
            };
            
            const wrappedFunction = errorHandler.wrapFunction(
                faultyFunction, 
                'test_context'
            );
            
            const result = wrappedFunction();
            expect(result).toBeUndefined();
            expect(errorHandler.errors.length).toBe(1);
        });

        test('should provide fallback values', () => {
            const faultyFunction = () => {
                throw new Error('Function failed');
            };
            
            const wrappedFunction = errorHandler.wrapFunction(
                faultyFunction, 
                'test_context',
                { fallback: 'fallback_value' }
            );
            
            const result = wrappedFunction();
            expect(result).toBe('fallback_value');
        });

        test('should retry failed functions', () => {
            let attempts = 0;
            const faultyFunction = () => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Not ready yet');
                }
                return 'success';
            };
            
            const wrappedFunction = errorHandler.wrapFunction(
                faultyFunction, 
                'retry_test',
                { maxRetries: 2 }
            );
            
            const result = wrappedFunction();
            expect(result).toBe('success');
            expect(attempts).toBe(3);
        });

        test('should execute safe execution context', () => {
            const result1 = errorHandler.safeExecute(
                () => 'success',
                'safe_test',
                'default'
            );
            expect(result1).toBe('success');
            
            const result2 = errorHandler.safeExecute(
                () => { throw new Error('fail'); },
                'safe_test',
                'default'
            );
            expect(result2).toBe('default');
        });

        test('should handle async safe execution', async () => {
            const result1 = await errorHandler.safeExecuteAsync(
                async () => 'async_success',
                'async_test',
                'async_default'
            );
            expect(result1).toBe('async_success');
            
            const result2 = await errorHandler.safeExecuteAsync(
                async () => { throw new Error('async_fail'); },
                'async_test',
                'async_default'
            );
            expect(result2).toBe('async_default');
        });
    });

    describe('Validation and Assertions', () => {
        test('should validate assertions', () => {
            const result1 = errorHandler.assert(true, 'Should pass');
            expect(result1).toBe(true);
            expect(errorHandler.errors.length).toBe(0);
            
            const result2 = errorHandler.assert(false, 'Should fail');
            expect(result2).toBe(false);
            expect(errorHandler.errors.length).toBe(1);
            expect(errorHandler.errors[0].message).toBe('Should fail');
        });

        test('should validate objects against schema', () => {
            const schema = {
                name: (val) => typeof val === 'string',
                age: (val) => typeof val === 'number' && val >= 0,
                required: { required: true }
            };
            
            const validObject = { name: 'test', age: 25, required: true };
            const invalidObject = { name: 123, age: -1 };
            
            expect(errorHandler.validateObject(validObject, schema)).toBe(true);
            expect(errorHandler.validateObject(invalidObject, schema)).toBe(false);
            expect(errorHandler.errors.length).toBeGreaterThan(0);
        });

        test('should handle null/undefined in validation', () => {
            const schema = { test: (val) => val === 'valid' };
            
            expect(errorHandler.validateObject(null, schema)).toBe(false);
            expect(errorHandler.validateObject(undefined, schema)).toBe(false);
            expect(errorHandler.validateObject('not_object', schema)).toBe(false);
        });
    });

    describe('Error Recovery and Resilience', () => {
        test('should maintain error history within limits', () => {
            errorHandler.maxErrorHistory = 5;
            
            for (let i = 0; i < 10; i++) {
                errorHandler.logError('BULK_ERROR', `Error ${i}`);
            }
            
            expect(errorHandler.errors.length).toBe(5);
            expect(errorHandler.errors[0].message).toBe('Error 5'); // Should keep latest
        });

        test('should provide error statistics', () => {
            errorHandler.logError('TYPE_A', 'Error A1', {}, 'ERROR');
            errorHandler.logError('TYPE_A', 'Error A2', {}, 'WARN');
            errorHandler.logError('TYPE_B', 'Error B1', {}, 'ERROR');
            
            const stats = errorHandler.getErrorStats();
            
            expect(stats.totalErrors).toBe(3);
            expect(stats.errorsByType.TYPE_A).toBe(2);
            expect(stats.errorsByType.TYPE_B).toBe(1);
            expect(stats.errorsBySeverity.ERROR).toBe(2);
            expect(stats.errorsBySeverity.WARN).toBe(1);
        });

        test('should export error data for debugging', () => {
            errorHandler.logError('EXPORT_TEST', 'Test export');
            
            const exported = errorHandler.exportErrors();
            const data = JSON.parse(exported);
            
            expect(data.errors).toBeDefined();
            expect(data.stats).toBeDefined();
            expect(data.exportTime).toBeDefined();
            expect(data.errors.length).toBe(1);
        });

        test('should clear error history', () => {
            errorHandler.logError('CLEAR_TEST', 'Before clear');
            expect(errorHandler.errors.length).toBe(1);
            
            errorHandler.clearErrors();
            expect(errorHandler.errors.length).toBe(0);
            expect(errorHandler.errorCounts.size).toBe(0);
        });
    });

    describe('Listener System', () => {
        test('should notify listeners of errors', () => {
            const listener = jest.fn();
            errorHandler.addListener(listener);
            
            errorHandler.logError('LISTENER_TEST', 'Test message');
            
            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'LISTENER_TEST',
                    message: 'Test message'
                })
            );
        });

        test('should remove listeners', () => {
            const listener = jest.fn();
            errorHandler.addListener(listener);
            errorHandler.removeListener(listener);
            
            errorHandler.logError('REMOVED_LISTENER_TEST', 'Test message');
            
            expect(listener).not.toHaveBeenCalled();
        });

        test('should handle listener errors gracefully', () => {
            const faultyListener = jest.fn(() => {
                throw new Error('Listener failed');
            });
            
            errorHandler.addListener(faultyListener);
            
            // Should not throw even if listener fails
            expect(() => {
                errorHandler.logError('FAULTY_LISTENER_TEST', 'Test message');
            }).not.toThrow();
        });
    });

    describe('Edge Cases and Stress Tests', () => {
        test('should handle recursive errors without infinite loops', () => {
            const recursiveFunction = errorHandler.wrapFunction(
                () => {
                    // This would normally cause recursion
                    errorHandler.logError('RECURSIVE_ERROR', 'Recursive call');
                    throw new Error('Recursive error');
                },
                'recursive_test'
            );
            
            expect(() => recursiveFunction()).not.toThrow();
        });

        test('should handle very large error objects', () => {
            const largeContext = {
                data: new Array(1000).fill('large_data_chunk'),
                nested: {
                    deep: {
                        object: new Array(100).fill('nested_data')
                    }
                }
            };
            
            expect(() => {
                errorHandler.logError('LARGE_ERROR', 'Large context error', largeContext);
            }).not.toThrow();
            
            expect(errorHandler.errors.length).toBe(1);
        });

        test('should handle null and undefined values gracefully', () => {
            expect(() => {
                errorHandler.logError('NULL_TEST', null);
                errorHandler.logError('UNDEFINED_TEST', undefined);
                errorHandler.logError('EMPTY_TEST', '');
            }).not.toThrow();
            
            expect(errorHandler.errors.length).toBe(3);
        });

        test('should handle disabled error handler', () => {
            errorHandler.isEnabled = false;
            
            errorHandler.logError('DISABLED_TEST', 'Should not log');
            expect(errorHandler.errors.length).toBe(0);
            
            errorHandler.isEnabled = true;
        });

        test('should handle rapid error bursts', () => {
            const startTime = Date.now();
            
            for (let i = 0; i < 100; i++) {
                errorHandler.logError('BURST_TEST', `Burst error ${i}`);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete quickly (under 1 second for 100 errors)
            expect(duration).toBeLessThan(1000);
            expect(errorHandler.errors.length).toBe(100);
        });
    });

    describe('Integration with Game State', () => {
        test('should capture game state in error context', () => {
            // Mock game state
            global.IdleAnts.app = {
                state: 'PLAYING',
                frameCounter: 1234,
                resourceManager: {
                    resources: { food: 500 }
                },
                entityManager: {
                    getAntCount: () => 10
                }
            };
            
            errorHandler.logError('GAME_STATE_TEST', 'Test with game state');
            
            const error = errorHandler.errors[0];
            expect(error.gameState.state).toBe('PLAYING');
            expect(error.gameState.frameCounter).toBe(1234);
            expect(error.gameState.resourcesFood).toBe(500);
            expect(error.gameState.antCount).toBe(10);
            
            // Cleanup
            delete global.IdleAnts.app;
        });

        test('should handle missing game state gracefully', () => {
            delete global.IdleAnts.app;
            
            errorHandler.logError('NO_GAME_STATE_TEST', 'Test without game state');
            
            const error = errorHandler.errors[0];
            expect(error.gameState.state).toBe('unavailable');
        });
    });
});