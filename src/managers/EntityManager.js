// src/managers/EntityManager.js - Refactored with Specialized Entity Managers
// Delegates responsibilities to focused entity managers for better SRP adherence

IdleAnts.Managers.EntityManager = class {
    constructor(app, assetManager, resourceManager, worldContainer) {
        this.app = app;
        this.assetManager = assetManager;
        this.resourceManager = resourceManager;
        this.worldContainer = worldContainer;
        this.effectManager = null;
        
        // Initialize specialized entity managers
        this.initializeEntityManagers();
        
        // Backward compatibility - create unified entity collections
        this.setupBackwardCompatibility();
        
        // Setup entities after managers are initialized
        this.setupEntities();
    }

    /**
     * Initialize all specialized entity managers
     */
    initializeEntityManagers() {
        try {
            // Initialize nest manager first (others depend on nest position)
            if (IdleAnts.Managers.Entities.NestEntityManager) {
                this.nestManager = new IdleAnts.Managers.Entities.NestEntityManager(
                    this.app, this.assetManager, this.resourceManager, this.worldContainer
                );
            } else {
                console.warn('[EntityManager] NestEntityManager not available - using fallback');
                this.nestManager = this.createFallbackNestManager();
            }
            
            if (IdleAnts.Managers.Entities.AntEntityManager) {
                this.antManager = new IdleAnts.Managers.Entities.AntEntityManager(
                    this.app, this.assetManager, this.resourceManager, this.worldContainer
                );
            } else {
                console.warn('[EntityManager] AntEntityManager not available - using fallback');
                this.antManager = this.createFallbackAntManager();
            }
            
            if (IdleAnts.Managers.Entities.FoodEntityManager) {
                this.foodManager = new IdleAnts.Managers.Entities.FoodEntityManager(
                    this.app, this.assetManager, this.resourceManager, this.worldContainer
                );
            } else {
                console.warn('[EntityManager] FoodEntityManager not available - using fallback');
                this.foodManager = this.createFallbackFoodManager();
            }
            
            if (IdleAnts.Managers.Entities.EnemyEntityManager) {
                this.enemyManager = new IdleAnts.Managers.Entities.EnemyEntityManager(
                    this.app, this.assetManager, this.resourceManager, this.worldContainer
                );
            } else {
                console.warn('[EntityManager] EnemyEntityManager not available - using fallback');
                this.enemyManager = this.createFallbackEnemyManager();
            }
            
            // Share nest position with other managers
            const nestPosition = this.nestManager.getNestPosition();
            if (this.antManager.setNestPosition) {
                this.antManager.setNestPosition(nestPosition);
            }
            if (this.enemyManager.setNestPosition) {
                this.enemyManager.setNestPosition(nestPosition);
            }
            
            // Set map configuration if available
            if (IdleAnts.app && IdleAnts.app.mapConfig) {
                if (this.nestManager.setMapConfig) this.nestManager.setMapConfig(IdleAnts.app.mapConfig);
                if (this.foodManager.setMapConfig) this.foodManager.setMapConfig(IdleAnts.app.mapConfig);
                if (this.enemyManager.setMapConfig) this.enemyManager.setMapConfig(IdleAnts.app.mapConfig);
            }
        } catch (error) {
            console.error('[EntityManager] Failed to initialize entity managers:', error);
            // Create minimal fallback managers
            this.nestManager = this.createFallbackNestManager();
            this.antManager = this.createFallbackAntManager();
            this.foodManager = this.createFallbackFoodManager();
            this.enemyManager = this.createFallbackEnemyManager();
        }
    }

    /**
     * Setup backward compatibility with unified entity collections
     */
    setupBackwardCompatibility() {
        // Create unified entities object for backward compatibility
        const self = this;
        this.entities = {
            get ants() { return self.antManager.entities.ants; },
            get flyingAnts() { return self.antManager.entities.flyingAnts; },
            get carAnts() { return self.antManager.entities.carAnts; },
            get fireAnts() { return self.antManager.entities.fireAnts; },
            get queen() { return self.antManager.entities.queen; },
            get larvae() { return self.antManager.entities.larvae; },
            get foods() { return self.foodManager.entities; },
            get enemies() { return self.enemyManager.entities; }
        };
        
        // Backward compatibility properties
        this.nest = this.nestManager.getNest();
        this.nestPosition = this.nestManager.getNestPosition();
    }

    /**
     * Set effect manager for all entity managers
     * @param {Object} effectManager - Effect manager instance
     */
    setEffectManager(effectManager) {
        this.effectManager = effectManager;
        
        this.nestManager.setEffectManager(effectManager);
        this.antManager.setEffectManager(effectManager);
        this.foodManager.setEffectManager(effectManager);
        this.enemyManager.setEffectManager(effectManager);
    }

    /**
     * Setup initial entities
     */
    setupEntities() {
        // Create initial food
        this.foodManager.createFood(5);
        
        // Create initial ant if stats indicate there should be one
        const initialAnts = this.resourceManager.stats.ants;
        for (let i = 0; i < initialAnts; i++) {
            this.createAnt();
        }
        
        console.log(`[EntityManager] Entity managers initialized with ${initialAnts} initial ants`);
    }

    // ===== DELEGATED METHODS TO SPECIALIZED MANAGERS =====

    // Nest methods delegated to NestManager
    createNest() {
        return this.nestManager.createNest();
    }

    getNestPosition() {
        return this.nestManager.getNestPosition();
    }

    moveNest(x, y) {
        this.nestManager.moveNest(x, y);
        
        // Update nest position for other managers
        const newPosition = this.nestManager.getNestPosition();
        this.antManager.setNestPosition(newPosition);
        this.enemyManager.setNestPosition(newPosition);
        
        // Update backward compatibility
        this.nestPosition = newPosition;
    }

    // Ant methods delegated to AntManager
    createAnt() {
        return this.antManager.createAnt();
    }

    createFlyingAnt() {
        return this.antManager.createFlyingAnt();
    }

    createCarAnt() {
        return this.antManager.createCarAnt();
    }

    createFireAnt() {
        return this.antManager.createFireAnt();
    }

    createQueen() {
        return this.antManager.createQueen();
    }

    createLarvae(count = 1) {
        return this.antManager.createLarvae(count);
    }

    getAntCount() {
        return this.antManager.getAntCount();
    }

    // Food methods delegated to FoodManager
    createFood(count = 1) {
        return this.foodManager.createFood(count);
    }

    addFood(position, foodType) {
        return this.foodManager.addFood(position, foodType);
    }

    addFoodAtPosition(x, y, foodType = null) {
        return this.foodManager.addFoodAtPosition(x, y, foodType);
    }

    // Enemy methods delegated to EnemyManager
    createBoss(x, y) {
        return this.enemyManager.createBoss(x, y);
    }

    spawnRandomEnemy() {
        return this.enemyManager.spawnRandomEnemy();
    }

    // ===== CORE UPDATE METHOD =====

    /**
     * Update all entity managers
     */
    update() {
        // Update nest first
        this.nestManager.update();
        
        // Get current food for ant updates
        const availableFood = this.foodManager.getAvailableFood();
        
        // Get all ants for enemy targeting
        const allAnts = [
            ...this.antManager.entities.ants,
            ...this.antManager.entities.flyingAnts,
            ...this.antManager.entities.carAnts,
            ...this.antManager.entities.fireAnts
        ];
        
        // Update entity managers
        this.antManager.update(availableFood);
        this.foodManager.update();
        this.enemyManager.update(allAnts);
        
        // Update backward compatibility references
        this.nest = this.nestManager.getNest();
        this.nestPosition = this.nestManager.getNestPosition();
    }

    // ===== LEGACY METHODS FOR BACKWARD COMPATIBILITY =====

    /**
     * Activate autofeeder (legacy method)
     */
    activateAutofeeder() {
        // Boost food spawning
        this.foodManager.boostSpawning(3, 1800); // 3x rate for 30 seconds
        console.log('[EntityManager] Autofeeder activated');
    }

    /**
     * Update larvae (legacy method - now handled by AntManager)
     */
    updateLarvae() {
        // This is now handled internally by antManager.update()
        // Kept for backward compatibility
    }

    /**
     * Resolve nest clustering (legacy method - now handled by AntManager)
     */
    resolveNestClustering() {
        // This is now handled internally by antManager.update()
        // Kept for backward compatibility
    }

    // ===== UTILITY METHODS =====

    /**
     * Get comprehensive entity statistics
     * @returns {Object} Entity statistics
     */
    getEntityStatistics() {
        return {
            nest: this.nestManager.getStatistics(),
            ants: this.antManager.getAntCounts(),
            food: this.foodManager.getStatistics(),
            enemies: this.enemyManager.getStatistics(),
            totals: {
                entities: this.antManager.getAntCount() + 
                         this.foodManager.getFoodCount() + 
                         this.enemyManager.getEnemyCount() + 
                         (this.nest ? 1 : 0)
            }
        };
    }

    /**
     * Get entities within radius of position
     * @param {Object} position - Center position {x, y}
     * @param {number} radius - Search radius
     * @returns {Object} Entities within radius by type
     */
    getEntitiesWithinRadius(position, radius) {
        return {
            ants: this.antManager.entities.ants.filter(ant => {
                const dx = ant.x - position.x;
                const dy = ant.y - position.y;
                return (dx * dx + dy * dy) <= radius * radius;
            }),
            food: this.foodManager.getFoodWithinRadius(position, radius),
            enemies: this.enemyManager.getEnemiesWithinRadius(position, radius)
        };
    }

    /**
     * Clear all entities
     */
    clearAllEntities() {
        this.antManager.destroy();
        this.foodManager.removeAllFood();
        this.enemyManager.removeAllEnemies();
        
        console.log('[EntityManager] All entities cleared');
    }

    /**
     * Reset entities to initial state
     */
    resetEntities() {
        this.clearAllEntities();
        this.setupEntities();
        
        console.log('[EntityManager] Entities reset to initial state');
    }

    /**
     * Get entity manager by type
     * @param {string} type - Manager type ('ant', 'food', 'enemy', 'nest')
     * @returns {Object|null} Specialized entity manager
     */
    getEntityManager(type) {
        switch (type) {
            case 'ant':
            case 'ants':
                return this.antManager;
            case 'food':
                return this.foodManager;
            case 'enemy':
            case 'enemies':
                return this.enemyManager;
            case 'nest':
                return this.nestManager;
            default:
                return null;
        }
    }

    // ===== FALLBACK MANAGER CREATION =====

    /**
     * Create fallback nest manager
     */
    createFallbackNestManager() {
        return {
            getNestPosition: () => ({ x: 1500, y: 1000 }),
            getNest: () => null,
            update: () => {},
            setEffectManager: () => {},
            setMapConfig: () => {},
            getStatistics: () => ({ exists: false }),
            destroy: () => {}
        };
    }

    /**
     * Create fallback ant manager
     */
    createFallbackAntManager() {
        return {
            entities: { ants: [], flyingAnts: [], carAnts: [], fireAnts: [], queen: null, larvae: [] },
            createAnt: () => {},
            createFlyingAnt: () => {},
            createCarAnt: () => {},
            createFireAnt: () => {},
            createQueen: () => {},
            createLarvae: () => {},
            getAntCount: () => 0,
            getAntCounts: () => ({ regular: 0, flying: 0, car: 0, fire: 0, queen: 0, larvae: 0, total: 0 }),
            update: () => {},
            setNestPosition: () => {},
            setEffectManager: () => {},
            destroy: () => {}
        };
    }

    /**
     * Create fallback food manager
     */
    createFallbackFoodManager() {
        return {
            entities: [],
            createFood: () => {},
            addFood: () => {},
            addFoodAtPosition: () => {},
            getAvailableFood: () => [],
            getFoodCount: () => 0,
            getFoodWithinRadius: () => [],
            getStatistics: () => ({ total: 0, available: 0 }),
            update: () => {},
            setMapConfig: () => {},
            setEffectManager: () => {},
            removeAllFood: () => {},
            destroy: () => {}
        };
    }

    /**
     * Create fallback enemy manager
     */
    createFallbackEnemyManager() {
        return {
            entities: [],
            createBoss: () => null,
            spawnRandomEnemy: () => {},
            getEnemyCount: () => 0,
            getEnemiesWithinRadius: () => [],
            getStatistics: () => ({ total: 0, alive: 0 }),
            update: () => {},
            setNestPosition: () => {},
            setMapConfig: () => {},
            setEffectManager: () => {},
            removeAllEnemies: () => {},
            destroy: () => {}
        };
    }

    /**
     * Destroy all entity managers and cleanup
     */
    destroy() {
        if (this.nestManager) {
            this.nestManager.destroy();
        }
        
        if (this.antManager) {
            this.antManager.destroy();
        }
        
        if (this.foodManager) {
            this.foodManager.destroy();
        }
        
        if (this.enemyManager) {
            this.enemyManager.destroy();
        }
        
        // Clear references
        this.nestManager = null;
        this.antManager = null;
        this.foodManager = null;
        this.enemyManager = null;
        this.entities = null;
        this.nest = null;
        this.nestPosition = null;
    }
};