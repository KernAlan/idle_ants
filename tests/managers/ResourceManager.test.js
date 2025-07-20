/**
 * Unit tests for ResourceManager
 * Tests core game resource management functionality
 */

// Set up test environment
global.IdleAnts = {
    Entities: {
        Components: {}
    },
    Managers: {},
    Game: {},
    Data: {
        FoodTypes: {
            BASIC: { name: 'Basic', value: 1 },
            APPLE: { name: 'Apple', value: 2 },
            COOKIE: { name: 'Cookie', value: 3 },
            MARSHMALLOW: { name: 'Marshmallow', value: 4 },
            HAMBURGER: { name: 'Hamburger', value: 5 },
            PIZZA: { name: 'Pizza', value: 6 },
            DONUT: { name: 'Donut', value: 7 },
            SANDWICH: { name: 'Sandwich', value: 8 },
            CAKE: { name: 'Cake', value: 9 }
        }
    },
    Config: {
        debug: false
    }
};

// Import the ResourceManager
require('../../src/managers/ResourceManager.js');

describe('ResourceManager', () => {
    let resourceManager;

    beforeEach(() => {
        // Reset config for consistent testing
        IdleAnts.Config = {
            debug: false
        };
        resourceManager = new IdleAnts.Managers.ResourceManager();
    });

    describe('Initialization', () => {
        test('should initialize with default values in non-debug mode', () => {
            expect(resourceManager.resources.food).toBe(0);
            expect(resourceManager.resources.displayFood).toBe(0);
            expect(resourceManager.stats.ants).toBe(1);
            expect(resourceManager.stats.maxAnts).toBe(10);
        });

        test('should initialize with debug values in debug mode', () => {
            IdleAnts.Config.debug = true;
            const debugResourceManager = new IdleAnts.Managers.ResourceManager();
            
            expect(debugResourceManager.resources.food).toBe(1000000);
            expect(debugResourceManager.resources.displayFood).toBe(1000000);
        });

        test('should initialize with locked flying ants', () => {
            expect(resourceManager.stats.flyingAnts).toBe(0);
            expect(resourceManager.stats.maxFlyingAnts).toBe(0);
            expect(resourceManager.stats.flyingAntsUnlocked).toBe(false);
        });
    });

    describe('Resource Management', () => {
        test('should add food correctly', () => {
            const initialFood = resourceManager.resources.food;
            resourceManager.addFood(100);
            
            expect(resourceManager.resources.food).toBe(initialFood + 100);
        });

        test('should not allow negative food values', () => {
            resourceManager.resources.food = 50;
            resourceManager.addFood(-100);
            
            expect(resourceManager.resources.food).toBe(0);
        });

        test('should spend food correctly when sufficient funds available', () => {
            resourceManager.resources.food = 100;
            const result = resourceManager.spendFood(50);
            
            expect(result).toBe(true);
            expect(resourceManager.resources.food).toBe(50);
        });

        test('should not spend food when insufficient funds', () => {
            resourceManager.resources.food = 30;
            const result = resourceManager.spendFood(50);
            
            expect(result).toBe(false);
            expect(resourceManager.resources.food).toBe(30);
        });
    });

    describe('Ant Management', () => {
        test('should calculate ant cost correctly', () => {
            const baseCost = resourceManager.stats.antCost;
            const expectedCost = Math.floor(baseCost * Math.pow(1.5, resourceManager.stats.ants - 1));
            
            expect(resourceManager.getAntCost()).toBe(expectedCost);
        });

        test('should purchase ant when sufficient food available', () => {
            resourceManager.resources.food = 1000;
            const initialAnts = resourceManager.stats.ants;
            const antCost = resourceManager.getAntCost();
            
            const result = resourceManager.purchaseAnt();
            
            expect(result).toBe(true);
            expect(resourceManager.stats.ants).toBe(initialAnts + 1);
            expect(resourceManager.resources.food).toBe(1000 - antCost);
        });

        test('should not purchase ant when insufficient food', () => {
            resourceManager.resources.food = 5;
            const initialAnts = resourceManager.stats.ants;
            
            const result = resourceManager.purchaseAnt();
            
            expect(result).toBe(false);
            expect(resourceManager.stats.ants).toBe(initialAnts);
        });

        test('should not exceed max ants limit', () => {
            resourceManager.resources.food = 100000;
            resourceManager.stats.ants = resourceManager.stats.maxAnts;
            
            const result = resourceManager.purchaseAnt();
            
            expect(result).toBe(false);
            expect(resourceManager.stats.ants).toBe(resourceManager.stats.maxAnts);
        });
    });

    describe('Upgrade System', () => {
        test('should calculate food upgrade cost correctly', () => {
            const level = resourceManager.stats.foodMultiplier;
            const expectedCost = Math.floor(resourceManager.stats.foodUpgradeCost * Math.pow(2, level - 1));
            
            expect(resourceManager.getFoodUpgradeCost()).toBe(expectedCost);
        });

        test('should upgrade food multiplier when sufficient funds', () => {
            resourceManager.resources.food = 2000;
            const initialMultiplier = resourceManager.stats.foodMultiplier;
            const upgradeCost = resourceManager.getFoodUpgradeCost();
            
            const result = resourceManager.upgradeFoodMultiplier();
            
            expect(result).toBe(true);
            expect(resourceManager.stats.foodMultiplier).toBe(initialMultiplier + 1);
            expect(resourceManager.resources.food).toBe(2000 - upgradeCost);
        });

        test('should calculate strength upgrade cost correctly', () => {
            const level = resourceManager.stats.strengthMultiplier;
            const expectedCost = Math.floor(resourceManager.stats.strengthUpgradeCost * Math.pow(1.5, level - 1));
            
            expect(resourceManager.getStrengthUpgradeCost()).toBe(expectedCost);
        });
    });

    describe('Flying Ants System', () => {
        test('should unlock flying ants when sufficient food', () => {
            resourceManager.resources.food = 1000;
            
            const result = resourceManager.unlockFlyingAnts();
            
            expect(result).toBe(true);
            expect(resourceManager.stats.flyingAntsUnlocked).toBe(true);
            expect(resourceManager.resources.food).toBe(500);
        });

        test('should not unlock flying ants when insufficient food', () => {
            resourceManager.resources.food = 100;
            
            const result = resourceManager.unlockFlyingAnts();
            
            expect(result).toBe(false);
            expect(resourceManager.stats.flyingAntsUnlocked).toBe(false);
        });

        test('should purchase flying ant when unlocked and sufficient funds', () => {
            resourceManager.resources.food = 1000;
            resourceManager.stats.flyingAntsUnlocked = true;
            resourceManager.stats.maxFlyingAnts = 5;
            
            const result = resourceManager.purchaseFlyingAnt();
            
            expect(result).toBe(true);
            expect(resourceManager.stats.flyingAnts).toBe(1);
        });
    });

    describe('Food Production Calculation', () => {
        test('should calculate food per second correctly', () => {
            resourceManager.stats.ants = 5;
            resourceManager.stats.flyingAnts = 2;
            resourceManager.stats.foodMultiplier = 2;
            resourceManager.stats.strengthMultiplier = 3;
            
            const expectedFPS = (5 * 2 * 3) + (2 * 4 * 3); // Regular ants + flying ants
            
            expect(resourceManager.calculateFoodPerSecond()).toBe(expectedFPS);
        });

        test('should update food per second stat', () => {
            resourceManager.stats.ants = 3;
            resourceManager.updateFoodPerSecond();
            
            expect(resourceManager.stats.foodPerSecond).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle zero food correctly', () => {
            resourceManager.resources.food = 0;
            
            expect(resourceManager.spendFood(10)).toBe(false);
            expect(resourceManager.purchaseAnt()).toBe(false);
            expect(resourceManager.upgradeFoodMultiplier()).toBe(false);
        });

        test('should handle maximum values correctly', () => {
            resourceManager.stats.ants = resourceManager.stats.maxAnts;
            resourceManager.stats.flyingAnts = resourceManager.stats.maxFlyingAnts;
            
            expect(resourceManager.purchaseAnt()).toBe(false);
        });

        test('should maintain data integrity after multiple operations', () => {
            const initialFood = 10000;
            resourceManager.resources.food = initialFood;
            
            // Perform multiple operations
            resourceManager.purchaseAnt();
            resourceManager.upgradeFoodMultiplier();
            resourceManager.addFood(500);
            
            // Food should be non-negative and calculations should be consistent
            expect(resourceManager.resources.food).toBeGreaterThanOrEqual(0);
            expect(typeof resourceManager.resources.food).toBe('number');
            expect(resourceManager.stats.ants).toBeGreaterThanOrEqual(1);
        });
    });
});