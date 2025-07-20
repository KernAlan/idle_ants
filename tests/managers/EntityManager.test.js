/**
 * Unit tests for EntityManager
 * Tests entity creation, management, and lifecycle functionality
 */

// Set up test environment
global.IdleAnts = {
    Entities: {
        Components: {},
        Ant: function() { return { update: jest.fn(), isDead: false }; },
        FlyingAnt: function() { return { update: jest.fn(), isDead: false }; },
        Food: function() { return { update: jest.fn(), isConsumed: false }; },
        Nest: function() { return { x: 100, y: 100 }; },
        Queen: function() { return { update: jest.fn() }; }
    },
    Managers: {},
    Game: {},
    Config: {
        debug: false
    }
};

// Import the EntityManager
require('../../src/managers/EntityManager.js');

describe('EntityManager', () => {
    let entityManager;
    let mockApp;
    let mockAssetManager;
    let mockResourceManager;
    let mockWorldContainer;

    beforeEach(() => {
        // Create mock dependencies
        mockApp = {
            stage: {
                addChild: jest.fn(),
                removeChild: jest.fn()
            }
        };

        mockAssetManager = {
            getTexture: jest.fn().mockReturnValue({
                width: 32,
                height: 32
            })
        };

        mockResourceManager = {
            resources: { food: 0 },
            stats: {
                ants: 1,
                flyingAnts: 0,
                maxAnts: 10,
                maxFlyingAnts: 5,
                strengthMultiplier: 1,
                foodMultiplier: 1
            },
            addFood: jest.fn(),
            updateFoodPerSecond: jest.fn()
        };

        mockWorldContainer = {
            addChild: jest.fn(),
            removeChild: jest.fn(),
            children: []
        };

        // Mock PIXI Container
        const mockContainer = () => ({
            addChild: jest.fn(),
            removeChild: jest.fn(),
            children: [],
            x: 0,
            y: 0,
            width: 100,
            height: 100
        });

        PIXI.Container = jest.fn(mockContainer);

        entityManager = new IdleAnts.Managers.EntityManager(
            mockApp,
            mockAssetManager,
            mockResourceManager,
            mockWorldContainer
        );
    });

    describe('Initialization', () => {
        test('should create all required entity containers', () => {
            expect(entityManager.entitiesContainers.ants).toBeDefined();
            expect(entityManager.entitiesContainers.flyingAnts).toBeDefined();
            expect(entityManager.entitiesContainers.food).toBeDefined();
            expect(entityManager.entitiesContainers.nest).toBeDefined();
            expect(entityManager.entitiesContainers.queen).toBeDefined();
            expect(entityManager.entitiesContainers.larvae).toBeDefined();
            expect(entityManager.entitiesContainers.carAnts).toBeDefined();
            expect(entityManager.entitiesContainers.fireAnts).toBeDefined();
            expect(entityManager.entitiesContainers.enemies).toBeDefined();
        });

        test('should initialize empty entity collections', () => {
            expect(entityManager.entities.ants).toEqual([]);
            expect(entityManager.entities.flyingAnts).toEqual([]);
            expect(entityManager.entities.foods).toEqual([]);
            expect(entityManager.entities.larvae).toEqual([]);
            expect(entityManager.entities.carAnts).toEqual([]);
            expect(entityManager.entities.fireAnts).toEqual([]);
            expect(entityManager.entities.enemies).toEqual([]);
            expect(entityManager.entities.queen).toBeNull();
        });

        test('should add containers to world container', () => {
            expect(mockWorldContainer.addChild).toHaveBeenCalledTimes(8);
        });
    });

    describe('Nest Management', () => {
        test('should create nest at specified position', () => {
            const position = { x: 100, y: 200 };
            
            entityManager.createNest(position);
            
            expect(entityManager.nest).toBeDefined();
            expect(entityManager.nestPosition).toEqual(position);
        });

        test('should return nest position when requested', () => {
            const position = { x: 150, y: 250 };
            entityManager.createNest(position);
            
            const retrievedPosition = entityManager.getNestPosition();
            
            expect(retrievedPosition).toEqual(position);
        });

        test('should return null when no nest exists', () => {
            const position = entityManager.getNestPosition();
            
            expect(position).toBeNull();
        });
    });

    describe('Entity Creation', () => {
        beforeEach(() => {
            // Create nest for entity creation tests
            entityManager.createNest({ x: 100, y: 100 });
        });

        test('should create ant entity with proper initialization', () => {
            const initialCount = entityManager.entities.ants.length;
            
            entityManager.createAnt();
            
            expect(entityManager.entities.ants.length).toBe(initialCount + 1);
            expect(entityManager.entitiesContainers.ants.addChild).toHaveBeenCalled();
        });

        test('should create flying ant entity', () => {
            const initialCount = entityManager.entities.flyingAnts.length;
            
            entityManager.createFlyingAnt();
            
            expect(entityManager.entities.flyingAnts.length).toBe(initialCount + 1);
            expect(entityManager.entitiesContainers.flyingAnts.addChild).toHaveBeenCalled();
        });

        test('should create food at specified position', () => {
            const position = { x: 200, y: 300 };
            const foodType = 'apple';
            
            entityManager.createFood(position, foodType);
            
            expect(entityManager.entities.foods.length).toBe(1);
            expect(entityManager.entitiesContainers.food.addChild).toHaveBeenCalled();
        });

        test('should create queen ant', () => {
            entityManager.createQueen();
            
            expect(entityManager.entities.queen).toBeDefined();
            expect(entityManager.entitiesContainers.queen.addChild).toHaveBeenCalled();
        });
    });

    describe('Entity Removal', () => {
        beforeEach(() => {
            entityManager.createNest({ x: 100, y: 100 });
        });

        test('should remove ant entity correctly', () => {
            entityManager.createAnt();
            const ant = entityManager.entities.ants[0];
            const initialCount = entityManager.entities.ants.length;
            
            entityManager.removeAnt(ant);
            
            expect(entityManager.entities.ants.length).toBe(initialCount - 1);
            expect(entityManager.entitiesContainers.ants.removeChild).toHaveBeenCalled();
        });

        test('should remove food entity correctly', () => {
            const position = { x: 200, y: 300 };
            entityManager.createFood(position, 'apple');
            const food = entityManager.entities.foods[0];
            const initialCount = entityManager.entities.foods.length;
            
            entityManager.removeFood(food);
            
            expect(entityManager.entities.foods.length).toBe(initialCount - 1);
            expect(entityManager.entitiesContainers.food.removeChild).toHaveBeenCalled();
        });

        test('should handle removal of non-existent entity gracefully', () => {
            const fakeAnt = { id: 'fake-ant' };
            
            expect(() => {
                entityManager.removeAnt(fakeAnt);
            }).not.toThrow();
        });
    });

    describe('Entity Counting and Retrieval', () => {
        beforeEach(() => {
            entityManager.createNest({ x: 100, y: 100 });
        });

        test('should return correct ant count', () => {
            entityManager.createAnt();
            entityManager.createAnt();
            
            expect(entityManager.getAntCount()).toBe(2);
        });

        test('should return correct flying ant count', () => {
            entityManager.createFlyingAnt();
            
            expect(entityManager.getFlyingAntCount()).toBe(1);
        });

        test('should return all ants collection', () => {
            entityManager.createAnt();
            entityManager.createAnt();
            
            const ants = entityManager.getAllAnts();
            
            expect(ants).toBe(entityManager.entities.ants);
            expect(ants.length).toBe(2);
        });

        test('should return all foods collection', () => {
            entityManager.createFood({ x: 100, y: 100 }, 'apple');
            entityManager.createFood({ x: 200, y: 200 }, 'berry');
            
            const foods = entityManager.getAllFoods();
            
            expect(foods).toBe(entityManager.entities.foods);
            expect(foods.length).toBe(2);
        });
    });

    describe('Update and Lifecycle Management', () => {
        beforeEach(() => {
            entityManager.createNest({ x: 100, y: 100 });
        });

        test('should update all entities', () => {
            // Create entities with mock update methods
            const mockAnt = { update: jest.fn(), isDead: false };
            const mockFood = { update: jest.fn(), isConsumed: false };
            
            entityManager.entities.ants.push(mockAnt);
            entityManager.entities.foods.push(mockFood);
            
            entityManager.update();
            
            expect(mockAnt.update).toHaveBeenCalled();
            expect(mockFood.update).toHaveBeenCalled();
        });

        test('should remove dead entities during update', () => {
            const deadAnt = { update: jest.fn(), isDead: true, sprite: { parent: { removeChild: jest.fn() } } };
            const aliveAnt = { update: jest.fn(), isDead: false };
            
            entityManager.entities.ants.push(deadAnt, aliveAnt);
            
            entityManager.update();
            
            expect(entityManager.entities.ants.length).toBe(1);
            expect(entityManager.entities.ants[0]).toBe(aliveAnt);
        });

        test('should remove consumed food during update', () => {
            const consumedFood = { 
                update: jest.fn(), 
                isConsumed: true, 
                sprite: { parent: { removeChild: jest.fn() } } 
            };
            const availableFood = { update: jest.fn(), isConsumed: false };
            
            entityManager.entities.foods.push(consumedFood, availableFood);
            
            entityManager.update();
            
            expect(entityManager.entities.foods.length).toBe(1);
            expect(entityManager.entities.foods[0]).toBe(availableFood);
        });
    });

    describe('Cleanup and Memory Management', () => {
        test('should clean up all entities', () => {
            entityManager.createNest({ x: 100, y: 100 });
            entityManager.createAnt();
            entityManager.createFood({ x: 200, y: 200 }, 'apple');
            
            entityManager.cleanup();
            
            expect(entityManager.entities.ants.length).toBe(0);
            expect(entityManager.entities.foods.length).toBe(0);
        });

        test('should handle cleanup when no entities exist', () => {
            expect(() => {
                entityManager.cleanup();
            }).not.toThrow();
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle entity creation without nest gracefully', () => {
            expect(() => {
                entityManager.createAnt();
            }).not.toThrow();
        });

        test('should handle null parameters gracefully', () => {
            expect(() => {
                entityManager.removeAnt(null);
                entityManager.removeFood(null);
            }).not.toThrow();
        });

        test('should maintain entity array integrity after operations', () => {
            entityManager.createNest({ x: 100, y: 100 });
            
            // Perform various operations
            entityManager.createAnt();
            entityManager.createFood({ x: 200, y: 200 }, 'apple');
            entityManager.update();
            
            // Arrays should remain valid and contain expected types
            expect(Array.isArray(entityManager.entities.ants)).toBe(true);
            expect(Array.isArray(entityManager.entities.foods)).toBe(true);
            expect(entityManager.entities.ants.length).toBeGreaterThanOrEqual(0);
            expect(entityManager.entities.foods.length).toBeGreaterThanOrEqual(0);
        });
    });
});