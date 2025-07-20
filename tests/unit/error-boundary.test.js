/**
 * Error boundary and resilience tests
 * Ensures all error handling and fallback mechanisms work correctly
 */

// Mock environment setup
global.console.warn = jest.fn();
global.console.error = jest.fn();

// Set up basic PIXI mocks
global.PIXI = {
    Application: class MockApplication {
        constructor() {
            this.view = { style: {}, parentNode: { removeChild: jest.fn() } };
            this.stage = { addChild: jest.fn() };
            this.screen = { width: 800, height: 600 };
            this.ticker = { add: jest.fn() };
        }
    },
    Container: class MockContainer {
        constructor() {
            this.addChild = jest.fn();
            this.removeChild = jest.fn();
            this.destroy = jest.fn();
            this.visible = true;
            this.x = 0;
            this.y = 0;
        }
    },
    Graphics: class MockGraphics {
        constructor() {
            this.clear = jest.fn().mockReturnThis();
            this.beginFill = jest.fn().mockReturnThis();
            this.endFill = jest.fn().mockReturnThis();
            this.drawRect = jest.fn().mockReturnThis();
            this.drawCircle = jest.fn().mockReturnThis();
        }
    }
};

// Set up DOM mocks
global.document = {
    createElement: jest.fn(() => ({
        style: {},
        appendChild: jest.fn(),
        addEventListener: jest.fn()
    })),
    getElementById: jest.fn(() => ({
        appendChild: jest.fn(),
        style: {},
        addEventListener: jest.fn()
    })),
    body: {
        appendChild: jest.fn()
    },
    head: {
        appendChild: jest.fn()
    }
};

global.window = {
    location: { href: 'http://localhost' },
    navigator: { userAgent: 'test' },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    innerWidth: 1024,
    innerHeight: 768
};

// Set up IdleAnts namespace
global.IdleAnts = {
    Core: {},
    Entities: { Components: {} },
    Managers: { Entities: {} },
    Game: {},
    Data: {
        FoodTypes: {
            BASIC: { name: 'Basic', value: 1, scale: { min: 0.8, max: 1.2 } }
        }
    },
    Config: { debug: false }
};

// Load error handling system
require('../../src/core/ErrorHandler.js');

describe('Error Boundary and Resilience Tests', () => {
    let errorHandler;

    beforeEach(() => {
        // Clear console mocks
        global.console.warn.mockClear();
        global.console.error.mockClear();
        
        // Get fresh error handler instance
        errorHandler = global.IdleAnts.Core.ErrorHandler.getInstance();
        errorHandler.clearErrors();
    });

    describe('ErrorHandler Core Functionality', () => {
        test('should capture and log errors without throwing', () => {
            const testError = new Error('Test error');
            
            expect(() => {
                errorHandler.logError('TEST_ERROR', testError, { context: 'unit_test' });
            }).not.toThrow();
            
            expect(errorHandler.errors.length).toBeGreaterThan(0);
            const lastError = errorHandler.errors[errorHandler.errors.length - 1];
            expect(lastError.type).toBe('TEST_ERROR');
            expect(lastError.message).toBe('Test error');
        });

        test('should provide safe execution wrapper', () => {
            let executionCount = 0;
            
            const result = errorHandler.safeExecute(() => {
                executionCount++;
                return 'success';
            }, 'test_execution', 'fallback');
            
            expect(result).toBe('success');
            expect(executionCount).toBe(1);
        });

        test('should handle failing functions gracefully', () => {
            const result = errorHandler.safeExecute(() => {
                throw new Error('Function failed');
            }, 'test_execution', 'fallback_value');
            
            expect(result).toBe('fallback_value');
            expect(errorHandler.errors.length).toBeGreaterThan(0);
        });

        test('should support retry mechanism', () => {
            let attemptCount = 0;
            
            const wrappedFn = errorHandler.wrapFunction(() => {
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error('Temporary failure');
                }
                return 'success';
            }, 'retry_test', { maxRetries: 2, fallback: 'failed' });
            
            const result = wrappedFn();
            expect(result).toBe('success');
            expect(attemptCount).toBe(3);
        });

        test('should use fallback after max retries exceeded', () => {
            let attemptCount = 0;
            
            const wrappedFn = errorHandler.wrapFunction(() => {
                attemptCount++;
                throw new Error('Always fails');
            }, 'max_retry_test', { maxRetries: 2, fallback: 'fallback_used' });
            
            const result = wrappedFn();
            expect(result).toBe('fallback_used');
            expect(attemptCount).toBe(3); // Original + 2 retries
        });
    });

    describe('Manager Fallback Tests', () => {
        beforeEach(() => {
            // Load game managers
            require('../../src/game/GameAudioManager.js');
            require('../../src/game/GameUpgradeManager.js');
            require('../../src/game/GameBossManager.js');
            require('../../src/game/GameMinimapManager.js');
        });

        test('should handle missing game manager gracefully', () => {
            // Temporarily remove a manager
            const original = global.IdleAnts.Game.GameAudioManager;
            delete global.IdleAnts.Game.GameAudioManager;
            
            // Load Game.js which should handle missing manager
            require('../../src/Game.js');
            
            let game;
            expect(() => {
                game = new global.IdleAnts.Game();
            }).not.toThrow();
            
            expect(game.gameAudioManager).toBeDefined();
            expect(typeof game.gameAudioManager.startBackgroundMusic).toBe('function');
            expect(() => game.startBackgroundMusic()).not.toThrow();
            
            // Restore
            global.IdleAnts.Game.GameAudioManager = original;
        });

        test('should provide no-op fallbacks for all manager methods', () => {
            // Remove all game managers
            const originalManagers = {
                audio: global.IdleAnts.Game.GameAudioManager,
                upgrade: global.IdleAnts.Game.GameUpgradeManager,
                boss: global.IdleAnts.Game.GameBossManager,
                minimap: global.IdleAnts.Game.GameMinimapManager
            };
            
            Object.keys(originalManagers).forEach(key => {
                delete global.IdleAnts.Game[`Game${key.charAt(0).toUpperCase() + key.slice(1)}Manager`];
            });
            
            // Clear module cache to force reload
            delete require.cache[require.resolve('../../src/Game.js')];
            require('../../src/Game.js');
            
            const game = new global.IdleAnts.Game();
            
            // All methods should exist and not throw
            expect(() => game.startBackgroundMusic()).not.toThrow();
            expect(() => game.playSoundEffect('test')).not.toThrow();
            expect(() => game.toggleSound()).not.toThrow();
            expect(() => game.buyAnt()).not.toThrow();
            expect(() => game.startBossFight()).not.toThrow();
            expect(() => game.updateMinimap()).not.toThrow();
            
            // Restore managers
            Object.assign(global.IdleAnts.Game, {
                GameAudioManager: originalManagers.audio,
                GameUpgradeManager: originalManagers.upgrade,
                GameBossManager: originalManagers.boss,
                GameMinimapManager: originalManagers.minimap
            });
        });
    });

    describe('Component Error Handling Tests', () => {
        beforeEach(() => {
            // Load component files
            require('../../src/entities/components/AntHealthComponent.js');
            require('../../src/entities/components/AntVisualComponent.js');
            require('../../src/entities/components/AntStateComponent.js');
        });

        test('should handle component initialization failure', () => {
            // Make one component constructor fail
            const original = global.IdleAnts.Entities.Components.AntHealthComponent;
            global.IdleAnts.Entities.Components.AntHealthComponent = class {
                constructor() {
                    throw new Error('Component initialization failed');
                }
            };
            
            // Load AntBase which should handle component failure
            require('../../src/entities/AntBase.js');
            
            const mockTexture = {};
            const nestPosition = { x: 100, y: 100 };
            
            let ant;
            expect(() => {
                ant = new global.IdleAnts.Entities.AntBase(mockTexture, nestPosition);
            }).not.toThrow();
            
            expect(ant).toBeDefined();
            expect(global.console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Component initialization failed')
            );
            
            // Restore component
            global.IdleAnts.Entities.Components.AntHealthComponent = original;
        });

        test('should handle missing component gracefully', () => {
            // Remove a component
            const original = global.IdleAnts.Entities.Components.AntVisualComponent;
            delete global.IdleAnts.Entities.Components.AntVisualComponent;
            
            // Clear module cache and reload
            delete require.cache[require.resolve('../../src/entities/AntBase.js')];
            require('../../src/entities/AntBase.js');
            
            const mockTexture = {};
            const nestPosition = { x: 100, y: 100 };
            
            let ant;
            expect(() => {
                ant = new global.IdleAnts.Entities.AntBase(mockTexture, nestPosition);
            }).not.toThrow();
            
            expect(ant).toBeDefined();
            expect(ant.visualComponent).toBeUndefined();
            
            // Restore component
            global.IdleAnts.Entities.Components.AntVisualComponent = original;
        });
    });

    describe('Entity Manager Fallback Tests', () => {
        beforeEach(() => {
            // Mock required managers
            global.IdleAnts.Managers.ResourceManager = class {
                constructor() {
                    this.resources = { food: 0 };
                    this.stats = { ants: 1, speedMultiplier: 1 };
                }
            };
            
            global.IdleAnts.Managers.AssetManager = class {
                getTexture() { return {}; }
            };
        });

        test('should handle missing entity manager gracefully', () => {
            // Load entity managers except one
            require('../../src/managers/entities/AntEntityManager.js');
            require('../../src/managers/entities/FoodEntityManager.js');
            require('../../src/managers/entities/EnemyEntityManager.js');
            // Don't load NestEntityManager
            
            // Load main EntityManager
            require('../../src/managers/EntityManager.js');
            
            const mockApp = new global.PIXI.Application();
            const mockAssetManager = new global.IdleAnts.Managers.AssetManager();
            const mockResourceManager = new global.IdleAnts.Managers.ResourceManager();
            const mockWorldContainer = new global.PIXI.Container();
            
            let entityManager;
            expect(() => {
                entityManager = new global.IdleAnts.Managers.EntityManager(
                    mockApp, mockAssetManager, mockResourceManager, mockWorldContainer
                );
            }).not.toThrow();
            
            expect(entityManager.nestManager).toBeDefined();
            expect(entityManager.nestManager.getNestPosition).toBeDefined();
            expect(entityManager.nestManager.getNestPosition()).toEqual({ x: 1500, y: 1000 });
        });

        test('should maintain API compatibility with fallback managers', () => {
            // Don't load any entity managers to test complete fallback
            require('../../src/managers/EntityManager.js');
            
            const mockApp = new global.PIXI.Application();
            const mockAssetManager = new global.IdleAnts.Managers.AssetManager();
            const mockResourceManager = new global.IdleAnts.Managers.ResourceManager();
            const mockWorldContainer = new global.PIXI.Container();
            
            const entityManager = new global.IdleAnts.Managers.EntityManager(
                mockApp, mockAssetManager, mockResourceManager, mockWorldContainer
            );
            
            // All methods should exist and not throw
            expect(() => entityManager.createAnt()).not.toThrow();
            expect(() => entityManager.createFood(5)).not.toThrow();
            expect(() => entityManager.createBoss(100, 100)).not.toThrow();
            expect(() => entityManager.update()).not.toThrow();
            expect(() => entityManager.getAntCount()).not.toThrow();
            
            expect(entityManager.getAntCount()).toBe(0);
            expect(entityManager.entities).toBeDefined();
            expect(entityManager.entities.ants).toBeDefined();
        });
    });

    describe('Global Error Handling Tests', () => {
        test('should catch unhandled errors', () => {
            const originalOnError = global.window.onerror;
            
            // Simulate unhandled error
            const errorEvent = {
                error: new Error('Unhandled error'),
                message: 'Unhandled error',
                filename: 'test.js',
                lineno: 42,
                colno: 10
            };
            
            // Trigger error handler
            global.window.dispatchEvent = jest.fn();
            const errorHandler = global.IdleAnts.Core.ErrorHandler.getInstance();
            
            // Simulate the error event that would be caught by our handler
            errorHandler.logError('UNHANDLED_ERROR', errorEvent.error, {
                filename: errorEvent.filename,
                lineno: errorEvent.lineno,
                colno: errorEvent.colno
            });
            
            expect(errorHandler.errors.length).toBeGreaterThan(0);
            const lastError = errorHandler.errors[errorHandler.errors.length - 1];
            expect(lastError.type).toBe('UNHANDLED_ERROR');
        });

        test('should provide error statistics', () => {
            const errorHandler = global.IdleAnts.Core.ErrorHandler.getInstance();
            
            // Generate some test errors
            errorHandler.logError('TEST_ERROR_1', new Error('Error 1'), {}, 'ERROR');
            errorHandler.logError('TEST_ERROR_1', new Error('Error 2'), {}, 'ERROR');
            errorHandler.logError('TEST_ERROR_2', new Error('Error 3'), {}, 'WARN');
            
            const stats = errorHandler.getErrorStats();
            
            expect(stats.totalErrors).toBeGreaterThanOrEqual(3);
            expect(stats.errorsByType.TEST_ERROR_1).toBe(2);
            expect(stats.errorsByType.TEST_ERROR_2).toBe(1);
            expect(stats.errorsBySeverity.ERROR).toBe(2);
            expect(stats.errorsBySeverity.WARN).toBe(1);
        });

        test('should export errors for debugging', () => {
            const errorHandler = global.IdleAnts.Core.ErrorHandler.getInstance();
            
            errorHandler.logError('EXPORT_TEST', new Error('Export test error'), { test: true });
            
            const exported = errorHandler.exportErrors();
            expect(typeof exported).toBe('string');
            
            const parsed = JSON.parse(exported);
            expect(parsed.errors).toBeDefined();
            expect(parsed.stats).toBeDefined();
            expect(parsed.exportTime).toBeDefined();
        });
    });

    describe('Performance Under Error Conditions', () => {
        test('should maintain performance with many errors', () => {
            const errorHandler = global.IdleAnts.Core.ErrorHandler.getInstance();
            errorHandler.clearErrors();
            
            const startTime = Date.now();
            
            // Generate many errors quickly
            for (let i = 0; i < 1000; i++) {
                errorHandler.logError('PERF_TEST', new Error(`Error ${i}`), { index: i });
            }
            
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(1000); // Should handle 1000 errors in under 1 second
            
            // Should maintain reasonable memory usage
            expect(errorHandler.errors.length).toBeLessThanOrEqual(100); // Should limit history
        });

        test('should not block on error logging', () => {
            const errorHandler = global.IdleAnts.Core.ErrorHandler.getInstance();
            
            const start = Date.now();
            
            // Each error log should be very fast
            for (let i = 0; i < 100; i++) {
                const logStart = Date.now();
                errorHandler.logError('SPEED_TEST', new Error('Speed test'), {});
                const logDuration = Date.now() - logStart;
                expect(logDuration).toBeLessThan(10); // Each log should take less than 10ms
            }
            
            const total = Date.now() - start;
            expect(total).toBeLessThan(500); // 100 logs in under 500ms
        });
    });
});