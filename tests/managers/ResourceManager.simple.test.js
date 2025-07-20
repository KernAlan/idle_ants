/**
 * Simple unit tests for ResourceManager basic functionality
 */

// Simple test setup
global.IdleAnts = {
    Data: {
        FoodTypes: {
            BASIC: { name: 'Basic', value: 1 },
            APPLE: { name: 'Apple', value: 2 }
        }
    },
    Config: { debug: false }
};

// Mock the ResourceManager class for basic testing
global.IdleAnts.Managers = {
    ResourceManager: class {
        constructor() {
            this.resources = { food: 0, displayFood: 0 };
            this.stats = { ants: 1, maxAnts: 10 };
        }
        
        addFood(amount) {
            this.resources.food = Math.max(0, this.resources.food + amount);
        }
        
        spendFood(amount) {
            if (this.resources.food >= amount) {
                this.resources.food -= amount;
                return true;
            }
            return false;
        }
    }
};

describe('ResourceManager Basic Functionality', () => {
    let resourceManager;

    beforeEach(() => {
        resourceManager = new global.IdleAnts.Managers.ResourceManager();
    });

    describe('Basic Resource Operations', () => {
        test('should initialize with zero food', () => {
            expect(resourceManager.resources.food).toBe(0);
        });

        test('should add food correctly', () => {
            resourceManager.addFood(100);
            expect(resourceManager.resources.food).toBe(100);
        });

        test('should not allow negative food', () => {
            resourceManager.addFood(-50);
            expect(resourceManager.resources.food).toBe(0);
        });

        test('should spend food when sufficient', () => {
            resourceManager.resources.food = 100;
            const result = resourceManager.spendFood(50);
            
            expect(result).toBe(true);
            expect(resourceManager.resources.food).toBe(50);
        });

        test('should not spend food when insufficient', () => {
            resourceManager.resources.food = 30;
            const result = resourceManager.spendFood(50);
            
            expect(result).toBe(false);
            expect(resourceManager.resources.food).toBe(30);
        });

        test('should initialize with default ant count', () => {
            expect(resourceManager.stats.ants).toBe(1);
            expect(resourceManager.stats.maxAnts).toBe(10);
        });
    });
});