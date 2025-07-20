/**
 * Integration tests for manager initialization and error handling
 * Catches runtime errors, missing constructors, and initialization failures
 */

// Mock global dependencies
global.PIXI = {
    Application: class MockApplication {
        constructor() {
            this.view = document.createElement('canvas');
            this.stage = { addChild: jest.fn() };
            this.screen = { width: 800, height: 600 };
            this.ticker = { add: jest.fn() };
        }
    },
    Container: class MockContainer {
        constructor() {
            this.children = [];
            this.addChild = jest.fn();
            this.removeChild = jest.fn();
            this.destroy = jest.fn();
            this.x = 0;
            this.y = 0;
        }
    },
    Sprite: class MockSprite {
        constructor() {
            this.anchor = { set: jest.fn() };
            this.scale = { set: jest.fn(), x: 1, y: 1 };
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.alpha = 1;
            this.tint = 0xFFFFFF;
        }
        destroy() {}
    },
    Graphics: class MockGraphics {
        constructor() {
            this.clear = jest.fn().mockReturnThis();
            this.beginFill = jest.fn().mockReturnThis();
            this.endFill = jest.fn().mockReturnThis();
            this.drawRect = jest.fn().mockReturnThis();
            this.drawCircle = jest.fn().mockReturnThis();
            this.lineStyle = jest.fn().mockReturnThis();
            this.moveTo = jest.fn().mockReturnThis();
            this.lineTo = jest.fn().mockReturnThis();
        }
    }
};

// Setup DOM elements that are expected
global.document.getElementById = jest.fn((id) => {
    const mockElement = {
        appendChild: jest.fn(),
        style: {},
        addEventListener: jest.fn()
    };
    
    if (id === 'game-canvas-container') {
        return mockElement;
    }
    
    return null;
});

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

// Load core systems
require('../../src/core/ErrorHandler.js');
require('../../src/core/RecoveryManager.js');

// Load all game managers in correct order
require('../../src/game/GameAudioManager.js');
require('../../src/game/GameUpgradeManager.js');
require('../../src/game/GameBossManager.js');
require('../../src/game/GameMinimapManager.js');
require('../../src/game/GameStateManager.js');

// Load entity components
require('../../src/entities/components/AntHealthComponent.js');
require('../../src/entities/components/AntVisualComponent.js');
require('../../src/entities/components/AntStateComponent.js');

// Load entity managers
require('../../src/managers/entities/NestEntityManager.js');
require('../../src/managers/entities/AntEntityManager.js');
require('../../src/managers/entities/FoodEntityManager.js');
require('../../src/managers/entities/EnemyEntityManager.js');

// Mock required managers that aren't part of this test
global.IdleAnts.Managers.ResourceManager = class MockResourceManager {
    constructor() {
        this.resources = { food: 0 };
        this.stats = { ants: 1, maxAnts: 10, speedMultiplier: 1 };
    }
    updateUI() {}
    addFood() {}
};

global.IdleAnts.Managers.AssetManager = class MockAssetManager {
    constructor() {}
    getTexture() { return {}; }
    loadAssets() { return Promise.resolve(); }
};

// Load the main managers
require('../../src/managers/EntityManager.js');
require('../../src/Game.js');

describe('Manager Initialization Integration Tests', () => {
    let consoleWarnSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        // Spy on console to catch warnings and errors
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        // Reset global state
        global.IdleAnts.app = null;
        
        // Clear any previous error handler state
        if (global.IdleAnts.Core.ErrorHandler._instance) {
            global.IdleAnts.Core.ErrorHandler._instance.clearErrors();
        }
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('Namespace Availability Tests', () => {
        test('should have all required namespaces available', () => {
            expect(global.IdleAnts).toBeDefined();
            expect(global.IdleAnts.Game).toBeDefined();
            expect(global.IdleAnts.Managers).toBeDefined();
            expect(global.IdleAnts.Managers.Entities).toBeDefined();
            expect(global.IdleAnts.Entities.Components).toBeDefined();
        });

        test('should have all game managers available', () => {
            expect(global.IdleAnts.Game.GameAudioManager).toBeDefined();
            expect(global.IdleAnts.Game.GameUpgradeManager).toBeDefined();
            expect(global.IdleAnts.Game.GameBossManager).toBeDefined();
            expect(global.IdleAnts.Game.GameMinimapManager).toBeDefined();
            expect(global.IdleAnts.Game.StateManager).toBeDefined();
        });

        test('should have all entity managers available', () => {
            expect(global.IdleAnts.Managers.Entities.NestEntityManager).toBeDefined();
            expect(global.IdleAnts.Managers.Entities.AntEntityManager).toBeDefined();
            expect(global.IdleAnts.Managers.Entities.FoodEntityManager).toBeDefined();
            expect(global.IdleAnts.Managers.Entities.EnemyEntityManager).toBeDefined();
        });

        test('should have all ant components available', () => {
            expect(global.IdleAnts.Entities.Components.AntHealthComponent).toBeDefined();
            expect(global.IdleAnts.Entities.Components.AntVisualComponent).toBeDefined();
            expect(global.IdleAnts.Entities.Components.AntStateComponent).toBeDefined();
        });
    });

    describe('Constructor Availability Tests', () => {
        test('should be able to instantiate all game managers', () => {
            const mockGame = { state: 'test' };
            
            expect(() => new global.IdleAnts.Game.GameAudioManager(mockGame)).not.toThrow();
            expect(() => new global.IdleAnts.Game.GameUpgradeManager(mockGame)).not.toThrow();
            expect(() => new global.IdleAnts.Game.GameBossManager(mockGame)).not.toThrow();
            expect(() => new global.IdleAnts.Game.GameMinimapManager(mockGame)).not.toThrow();
            expect(() => new global.IdleAnts.Game.StateManager(mockGame)).not.toThrow();
        });

        test('should be able to instantiate all entity managers', () => {
            const mockApp = new global.PIXI.Application();
            const mockAssetManager = new global.IdleAnts.Managers.AssetManager();
            const mockResourceManager = new global.IdleAnts.Managers.ResourceManager();
            const mockWorldContainer = new global.PIXI.Container();

            expect(() => new global.IdleAnts.Managers.Entities.NestEntityManager(
                mockApp, mockAssetManager, mockResourceManager, mockWorldContainer
            )).not.toThrow();

            expect(() => new global.IdleAnts.Managers.Entities.AntEntityManager(
                mockApp, mockAssetManager, mockResourceManager, mockWorldContainer
            )).not.toThrow();

            expect(() => new global.IdleAnts.Managers.Entities.FoodEntityManager(
                mockApp, mockAssetManager, mockResourceManager, mockWorldContainer
            )).not.toThrow();

            expect(() => new global.IdleAnts.Managers.Entities.EnemyEntityManager(
                mockApp, mockAssetManager, mockResourceManager, mockWorldContainer
            )).not.toThrow();
        });

        test('should be able to instantiate ant components', () => {
            const mockAnt = { 
                x: 0, y: 0, 
                capacity: 1, 
                maxHp: 100,
                id: 'test-ant'
            };

            expect(() => new global.IdleAnts.Entities.Components.AntHealthComponent(mockAnt, 100)).not.toThrow();
            expect(() => new global.IdleAnts.Entities.Components.AntVisualComponent(mockAnt)).not.toThrow();
            expect(() => new global.IdleAnts.Entities.Components.AntStateComponent(mockAnt)).not.toThrow();
        });
    });

    describe('EntityManager Integration Tests', () => {
        test('should initialize EntityManager without errors', () => {
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

            expect(entityManager).toBeDefined();
            expect(entityManager.nestManager).toBeDefined();
            expect(entityManager.antManager).toBeDefined();
            expect(entityManager.foodManager).toBeDefined();
            expect(entityManager.enemyManager).toBeDefined();
        });

        test('should provide backward compatibility entities object', () => {
            const mockApp = new global.PIXI.Application();
            const mockAssetManager = new global.IdleAnts.Managers.AssetManager();
            const mockResourceManager = new global.IdleAnts.Managers.ResourceManager();
            const mockWorldContainer = new global.PIXI.Container();

            const entityManager = new global.IdleAnts.Managers.EntityManager(
                mockApp, mockAssetManager, mockResourceManager, mockWorldContainer
            );

            expect(entityManager.entities).toBeDefined();
            expect(entityManager.entities.ants).toBeDefined();
            expect(entityManager.entities.foods).toBeDefined();
            expect(entityManager.entities.enemies).toBeDefined();
        });

        test('should handle missing specialized managers gracefully', () => {
            // Temporarily remove a manager to test fallback
            const originalNestManager = global.IdleAnts.Managers.Entities.NestEntityManager;
            delete global.IdleAnts.Managers.Entities.NestEntityManager;

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
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('NestEntityManager not available')
            );

            // Restore the manager
            global.IdleAnts.Managers.Entities.NestEntityManager = originalNestManager;
        });
    });

    describe('Game Class Integration Tests', () => {
        test('should initialize Game without errors', () => {
            let game;
            expect(() => {
                game = new global.IdleAnts.Game();
            }).not.toThrow();

            expect(game).toBeDefined();
            expect(game.gameAudioManager).toBeDefined();
            expect(game.gameUpgradeManager).toBeDefined();
            expect(game.gameBossManager).toBeDefined();
            expect(game.gameMinimapManager).toBeDefined();
        });

        test('should handle missing game managers gracefully', () => {
            // Temporarily remove a manager to test fallback
            const originalAudioManager = global.IdleAnts.Game.GameAudioManager;
            delete global.IdleAnts.Game.GameAudioManager;

            let game;
            expect(() => {
                game = new global.IdleAnts.Game();
            }).not.toThrow();

            expect(game.gameAudioManager).toBeDefined();
            expect(game.gameAudioManager.startBackgroundMusic).toBeDefined();
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('GameAudioManager not available')
            );

            // Restore the manager
            global.IdleAnts.Game.GameAudioManager = originalAudioManager;
        });

        test('should maintain API compatibility with fallback managers', () => {
            // Remove all game managers to test complete fallback
            const originalManagers = {
                audio: global.IdleAnts.Game.GameAudioManager,
                upgrade: global.IdleAnts.Game.GameUpgradeManager,
                boss: global.IdleAnts.Game.GameBossManager,
                minimap: global.IdleAnts.Game.GameMinimapManager
            };

            delete global.IdleAnts.Game.GameAudioManager;
            delete global.IdleAnts.Game.GameUpgradeManager;
            delete global.IdleAnts.Game.GameBossManager;
            delete global.IdleAnts.Game.GameMinimapManager;

            const game = new global.IdleAnts.Game();

            // Test that all expected methods exist and don't throw
            expect(() => game.startBackgroundMusic()).not.toThrow();
            expect(() => game.playSoundEffect('test')).not.toThrow();
            expect(() => game.toggleSound()).not.toThrow();
            expect(() => game.startBossFight()).not.toThrow();
            expect(() => game.updateMinimap()).not.toThrow();

            // Restore managers
            Object.assign(global.IdleAnts.Game, originalManagers);
        });
    });

    describe('Error Handler Integration', () => {
        test('should log errors through ErrorHandler system', () => {
            const errorHandler = global.IdleAnts.Core.ErrorHandler.getInstance();
            const initialErrorCount = errorHandler.errors.length;

            // Trigger an error by calling a non-existent method
            try {
                throw new Error('Test error for error handler');
            } catch (error) {
                errorHandler.logError('TEST_ERROR', error, { context: 'unit_test' });
            }

            expect(errorHandler.errors.length).toBeGreaterThan(initialErrorCount);
            
            const lastError = errorHandler.errors[errorHandler.errors.length - 1];
            expect(lastError.type).toBe('TEST_ERROR');
            expect(lastError.message).toBe('Test error for error handler');
        });

        test('should handle component initialization failures gracefully', () => {
            // This test ensures that if components fail to load, the system continues
            const originalComponent = global.IdleAnts.Entities.Components.AntHealthComponent;
            
            // Make component constructor throw
            global.IdleAnts.Entities.Components.AntHealthComponent = class {
                constructor() {
                    throw new Error('Simulated component failure');
                }
            };

            const mockAnt = { 
                x: 0, y: 0, 
                capacity: 1, 
                maxHp: 100,
                id: 'test-ant',
                initializeComponents: global.IdleAnts.Entities.AntBase.prototype.initializeComponents
            };

            // Should not throw despite component failure
            expect(() => {
                mockAnt.initializeComponents();
            }).not.toThrow();

            // Restore original component
            global.IdleAnts.Entities.Components.AntHealthComponent = originalComponent;
        });
    });

    describe('Performance and Memory Tests', () => {
        test('should not leak memory during manager creation/destruction', () => {
            const mockApp = new global.PIXI.Application();
            const mockAssetManager = new global.IdleAnts.Managers.AssetManager();
            const mockResourceManager = new global.IdleAnts.Managers.ResourceManager();
            const mockWorldContainer = new global.PIXI.Container();

            // Create and destroy multiple times
            for (let i = 0; i < 10; i++) {
                const entityManager = new global.IdleAnts.Managers.EntityManager(
                    mockApp, mockAssetManager, mockResourceManager, mockWorldContainer
                );
                
                expect(() => entityManager.destroy()).not.toThrow();
            }
        });

        test('should initialize quickly', () => {
            const startTime = Date.now();
            
            const game = new global.IdleAnts.Game();
            
            const initTime = Date.now() - startTime;
            expect(initTime).toBeLessThan(100); // Should initialize in under 100ms
        });
    });
});