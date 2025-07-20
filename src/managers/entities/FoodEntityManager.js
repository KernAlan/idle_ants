/**
 * FoodEntityManager - Handles all food-related entity management
 * Extracted from EntityManager.js to maintain Single Responsibility Principle
 */

// Ensure Managers namespace exists
if (!IdleAnts.Managers) {
    IdleAnts.Managers = {};
}

if (!IdleAnts.Managers.Entities) {
    IdleAnts.Managers.Entities = {};
}

IdleAnts.Managers.Entities.FoodEntityManager = class {
    constructor(app, assetManager, resourceManager, worldContainer) {
        this.app = app;
        this.assetManager = assetManager;
        this.resourceManager = resourceManager;
        this.worldContainer = worldContainer;
        this.effectManager = null;
        
        // Create food container
        this.container = new PIXI.Container();
        this.worldContainer.addChild(this.container);
        
        // Food collection
        this.entities = [];
        
        // Food spawn settings
        this.foodSpawnTimer = 0;
        this.foodSpawnInterval = 120; // 2 seconds at 60fps
        this.maxFoods = 20;
        this.mapConfig = null;
    }

    /**
     * Set effect manager reference
     * @param {Object} effectManager - Effect manager instance
     */
    setEffectManager(effectManager) {
        this.effectManager = effectManager;
    }

    /**
     * Set map configuration for food spawning bounds
     * @param {Object} mapConfig - Map configuration
     */
    setMapConfig(mapConfig) {
        this.mapConfig = mapConfig;
    }

    /**
     * Create food items
     * @param {number} count - Number of food items to create
     */
    createFood(count = 1) {
        for (let i = 0; i < count; i++) {
            this.spawnRandomFood();
        }
    }

    /**
     * Spawn a random food item at a random location
     */
    spawnRandomFood() {
        if (this.entities.length >= this.maxFoods) {
            return; // Don't spawn if at max capacity
        }

        // Get random food type
        const foodTypes = Object.values(IdleAnts.Data.FoodTypes);
        const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        
        if (!foodType || !foodType.scale || typeof foodType.scale.min === 'undefined') {
            console.error('[FoodEntityManager] Invalid food type:', foodType);
            return;
        }

        // Generate random position within map bounds
        const position = this.generateRandomFoodPosition();
        
        this.addFood(position, foodType);
    }

    /**
     * Generate random position for food spawn
     * @returns {Object} Position {x, y}
     */
    generateRandomFoodPosition() {
        const mapWidth = this.mapConfig ? this.mapConfig.width : 3000;
        const mapHeight = this.mapConfig ? this.mapConfig.height : 2000;
        
        // Add some margin from edges
        const margin = 100;
        
        return {
            x: margin + Math.random() * (mapWidth - 2 * margin),
            y: margin + Math.random() * (mapHeight - 2 * margin),
            clickPlaced: false
        };
    }

    /**
     * Add a food item at specific position
     * @param {Object} position - Position {x, y, clickPlaced}
     * @param {Object} foodType - Food type configuration
     */
    addFood(position, foodType) {
        // Get appropriate texture for food type
        const texture = this.assetManager.getTexture('food');
        if (!texture) {
            console.error('[FoodEntityManager] Food texture not found');
            return;
        }

        // Create food entity
        const food = new IdleAnts.Entities.Food(texture, position.x, position.y, foodType);
        
        this.entities.push(food);
        this.container.addChild(food);
        
        // Create spawn effect for clicked placement
        if (position.clickPlaced && this.effectManager) {
            this.effectManager.createFoodSpawnEffect(position.x, position.y, foodType.name);
        }
    }

    /**
     * Add food at clicked position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} foodType - Food type (optional, will use random if not provided)
     */
    addFoodAtPosition(x, y, foodType = null) {
        if (!foodType) {
            const foodTypes = Object.values(IdleAnts.Data.FoodTypes);
            foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        }
        
        this.addFood({ x, y, clickPlaced: true }, foodType);
    }

    /**
     * Update all food entities
     */
    update() {
        this.updateFoodSpawning();
        this.updateFoodEntities();
        this.cleanupCollectedFood();
    }

    /**
     * Update food spawning timer
     */
    updateFoodSpawning() {
        this.foodSpawnTimer++;
        
        if (this.foodSpawnTimer >= this.foodSpawnInterval) {
            this.foodSpawnTimer = 0;
            
            // Spawn food if below max capacity
            if (this.entities.length < this.maxFoods) {
                this.spawnRandomFood();
            }
        }
    }

    /**
     * Update individual food entities
     */
    updateFoodEntities() {
        for (const food of this.entities) {
            if (food.update) {
                food.update();
            }
        }
    }

    /**
     * Clean up collected food items
     */
    cleanupCollectedFood() {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const food = this.entities[i];
            
            if (food.collected || food.shouldRemove) {
                this.removeFood(i);
            }
        }
    }

    /**
     * Remove food at index
     * @param {number} index - Index of food to remove
     */
    removeFood(index) {
        const food = this.entities[index];
        if (food) {
            // Create collection effect
            if (this.effectManager && !food.shouldRemove) {
                this.effectManager.createFoodCollectEffect(food.x, food.y);
            }
            
            this.container.removeChild(food);
            food.destroy();
            this.entities.splice(index, 1);
        }
    }

    /**
     * Remove all food items
     */
    removeAllFood() {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.removeFood(i);
        }
    }

    /**
     * Get food within radius of position
     * @param {Object} position - Position {x, y}
     * @param {number} radius - Search radius
     * @returns {Array} Array of food entities within radius
     */
    getFoodWithinRadius(position, radius) {
        const radiusSq = radius * radius;
        
        return this.entities.filter(food => {
            if (food.collected) return false;
            
            const dx = food.x - position.x;
            const dy = food.y - position.y;
            const distSq = dx * dx + dy * dy;
            
            return distSq <= radiusSq;
        });
    }

    /**
     * Get closest food to position
     * @param {Object} position - Position {x, y}
     * @param {number} maxDistance - Maximum search distance (optional)
     * @returns {Object|null} Closest food entity or null
     */
    getClosestFood(position, maxDistance = Infinity) {
        let closestFood = null;
        let closestDistance = maxDistance;
        
        for (const food of this.entities) {
            if (food.collected) continue;
            
            const dx = food.x - position.x;
            const dy = food.y - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestFood = food;
            }
        }
        
        return closestFood;
    }

    /**
     * Get available (uncollected) food entities
     * @returns {Array} Array of available food entities
     */
    getAvailableFood() {
        return this.entities.filter(food => !food.collected);
    }

    /**
     * Get food count
     * @returns {number} Number of food entities
     */
    getFoodCount() {
        return this.entities.length;
    }

    /**
     * Get available food count
     * @returns {number} Number of uncollected food entities
     */
    getAvailableFoodCount() {
        return this.entities.filter(food => !food.collected).length;
    }

    /**
     * Set food spawn interval
     * @param {number} interval - Spawn interval in frames
     */
    setSpawnInterval(interval) {
        this.foodSpawnInterval = interval;
    }

    /**
     * Set maximum food count
     * @param {number} max - Maximum number of food entities
     */
    setMaxFoods(max) {
        this.maxFoods = max;
    }

    /**
     * Boost food spawning temporarily
     * @param {number} multiplier - Spawn rate multiplier
     * @param {number} duration - Duration in frames
     */
    boostSpawning(multiplier = 2, duration = 600) {
        const originalInterval = this.foodSpawnInterval;
        this.foodSpawnInterval = Math.floor(this.foodSpawnInterval / multiplier);
        
        setTimeout(() => {
            this.foodSpawnInterval = originalInterval;
        }, duration * (1000 / 60)); // Convert frames to milliseconds
    }

    /**
     * Get food statistics
     * @returns {Object} Food statistics
     */
    getStatistics() {
        const availableFood = this.getAvailableFood();
        const foodByType = {};
        
        for (const food of availableFood) {
            const typeName = food.foodType ? food.foodType.name : 'unknown';
            foodByType[typeName] = (foodByType[typeName] || 0) + 1;
        }
        
        return {
            total: this.entities.length,
            available: availableFood.length,
            collected: this.entities.length - availableFood.length,
            byType: foodByType,
            spawnTimer: this.foodSpawnTimer,
            spawnInterval: this.foodSpawnInterval,
            maxFoods: this.maxFoods
        };
    }

    /**
     * Destroy all food entities and cleanup
     */
    destroy() {
        // Destroy all food entities
        this.entities.forEach(food => food.destroy());
        this.entities = [];
        
        // Remove container
        if (this.container.parent) {
            this.container.parent.removeChild(this.container);
        }
        this.container.destroy();
        this.container = null;
    }
};