/**
 * SafeEntityManager - Error-resilient wrapper for EntityManager
 * Provides comprehensive error handling and entity lifecycle management
 */

IdleAnts.Managers.SafeEntityManager = class {
    constructor(app, assetManager, resourceManager, worldContainer) {
        this.errorHandler = IdleAnts.Core.ErrorHandler.getInstance();
        this.isHealthy = true;
        this.entityCounts = {
            ants: 0,
            flyingAnts: 0,
            foods: 0,
            enemies: 0
        };
        this.maxEntityLimits = {
            ants: 1000,
            flyingAnts: 500,
            foods: 2000,
            enemies: 100
        };
        this.corruptedEntities = new Set();
        this.operationCount = 0;
        this.errorCount = 0;

        // Initialize the actual EntityManager with error handling
        this.entityManager = this.errorHandler.safeExecute(
            () => new IdleAnts.Managers.EntityManager(app, assetManager, resourceManager, worldContainer),
            'EntityManager_initialization',
            this.createFallbackEntityManager(app, assetManager, resourceManager, worldContainer)
        );

        // Set up entity validation and cleanup
        this.setupEntityValidation();
    }

    /**
     * Create a fallback entity manager if initialization fails
     * @param {*} app - PIXI application
     * @param {*} assetManager - Asset manager
     * @param {*} resourceManager - Resource manager
     * @param {*} worldContainer - World container
     * @returns {object} Fallback entity manager
     */
    createFallbackEntityManager(app, assetManager, resourceManager, worldContainer) {
        this.errorHandler.logError('ENTITYMANAGER_FALLBACK', 
            new Error('Using fallback EntityManager'), 
            { reason: 'initialization_failed' }, 
            'WARN');

        return {
            entities: {
                ants: [],
                flyingAnts: [],
                foods: [],
                enemies: [],
                queen: null
            },
            nest: null,
            nestPosition: null,
            // Fallback methods
            createNest: (position) => {
                this.nest = { x: position.x, y: position.y };
                this.nestPosition = position;
            },
            getNestPosition: () => this.nestPosition,
            getAntCount: () => this.entities.ants.length,
            getAllAnts: () => this.entities.ants,
            getAllFoods: () => this.entities.foods,
            update: () => { /* Safe no-op */ },
            cleanup: () => { 
                this.entities.ants = [];
                this.entities.flyingAnts = [];
                this.entities.foods = [];
                this.entities.enemies = [];
            }
        };
    }

    /**
     * Set up entity validation and monitoring
     */
    setupEntityValidation() {
        // Regular validation interval
        this.validationInterval = setInterval(() => {
            this.validateAllEntities();
            this.cleanupCorruptedEntities();
        }, 5000); // Every 5 seconds
    }

    /**
     * Safely execute a method with comprehensive error handling
     * @param {string} methodName - Name of the method to execute
     * @param {Array} args - Arguments to pass to the method
     * @param {*} defaultReturn - Default return value on error
     * @returns {*} Method result or default value
     */
    safeMethod(methodName, args = [], defaultReturn = null) {
        this.operationCount++;
        
        return this.errorHandler.wrapFunction(
            () => {
                // Pre-operation validation
                this.validateEntityCounts();
                
                // Execute the method
                const result = this.entityManager[methodName]?.apply(this.entityManager, args);
                
                // Post-operation validation
                this.updateEntityCounts();
                
                return result;
            },
            `EntityManager.${methodName}`,
            {
                fallback: defaultReturn,
                maxRetries: 1,
                rethrow: false
            }
        )();
    }

    /**
     * Validate all entities for corruption or invalid state
     */
    validateAllEntities() {
        const entityTypes = ['ants', 'flyingAnts', 'foods', 'enemies'];
        
        entityTypes.forEach(type => {
            const entities = this.entityManager.entities[type] || [];
            entities.forEach((entity, index) => {
                if (!this.validateEntity(entity, type, index)) {
                    this.corruptedEntities.add(`${type}_${index}`);
                }
            });
        });
    }

    /**
     * Validate a single entity
     * @param {object} entity - Entity to validate
     * @param {string} type - Entity type
     * @param {number} index - Entity index
     * @returns {boolean} True if entity is valid
     */
    validateEntity(entity, type, index) {
        try {
            // Basic existence check
            if (!entity || typeof entity !== 'object') {
                this.errorHandler.logError('INVALID_ENTITY', 
                    new Error(`Invalid entity at ${type}[${index}]`), 
                    { type: type, index: index, entity: !!entity });
                return false;
            }

            // Type-specific validation
            switch (type) {
                case 'ants':
                case 'flyingAnts':
                    return this.validateAntEntity(entity, type, index);
                case 'foods':
                    return this.validateFoodEntity(entity, type, index);
                case 'enemies':
                    return this.validateEnemyEntity(entity, type, index);
                default:
                    return true;
            }
        } catch (error) {
            this.errorHandler.logError('ENTITY_VALIDATION_ERROR', error, {
                type: type,
                index: index
            });
            return false;
        }
    }

    /**
     * Validate ant entity
     * @param {object} entity - Ant entity
     * @param {string} type - Entity type
     * @param {number} index - Entity index
     * @returns {boolean} True if valid
     */
    validateAntEntity(entity, type, index) {
        const requiredProps = ['x', 'y', 'speed'];
        const numericProps = ['x', 'y', 'speed'];
        
        for (const prop of requiredProps) {
            if (!(prop in entity)) {
                this.errorHandler.logError('MISSING_ANT_PROPERTY', 
                    new Error(`Missing property ${prop}`), 
                    { type: type, index: index, property: prop });
                return false;
            }
        }

        for (const prop of numericProps) {
            if (typeof entity[prop] !== 'number' || !isFinite(entity[prop])) {
                this.errorHandler.logError('INVALID_ANT_PROPERTY', 
                    new Error(`Invalid numeric property ${prop}`), 
                    { 
                        type: type, 
                        index: index, 
                        property: prop, 
                        value: entity[prop],
                        valueType: typeof entity[prop]
                    });
                return false;
            }
        }

        // Check for reasonable bounds
        if (Math.abs(entity.x) > 10000 || Math.abs(entity.y) > 10000) {
            this.errorHandler.logError('ANT_OUT_OF_BOUNDS', 
                new Error('Ant position out of reasonable bounds'), 
                { type: type, index: index, x: entity.x, y: entity.y });
            return false;
        }

        return true;
    }

    /**
     * Validate food entity
     * @param {object} entity - Food entity
     * @param {string} type - Entity type
     * @param {number} index - Entity index
     * @returns {boolean} True if valid
     */
    validateFoodEntity(entity, type, index) {
        const requiredProps = ['x', 'y'];
        
        for (const prop of requiredProps) {
            if (!(prop in entity) || typeof entity[prop] !== 'number' || !isFinite(entity[prop])) {
                this.errorHandler.logError('INVALID_FOOD_PROPERTY', 
                    new Error(`Invalid food property ${prop}`), 
                    { type: type, index: index, property: prop, value: entity[prop] });
                return false;
            }
        }

        // Check if food is consumed but still in array
        if (entity.isConsumed === true) {
            this.errorHandler.logError('CONSUMED_FOOD_IN_ARRAY', 
                new Error('Consumed food still in active array'), 
                { type: type, index: index });
            return false;
        }

        return true;
    }

    /**
     * Validate enemy entity
     * @param {object} entity - Enemy entity
     * @param {string} type - Entity type
     * @param {number} index - Entity index
     * @returns {boolean} True if valid
     */
    validateEnemyEntity(entity, type, index) {
        const requiredProps = ['x', 'y', 'hp'];
        
        for (const prop of requiredProps) {
            if (!(prop in entity) || typeof entity[prop] !== 'number' || !isFinite(entity[prop])) {
                this.errorHandler.logError('INVALID_ENEMY_PROPERTY', 
                    new Error(`Invalid enemy property ${prop}`), 
                    { type: type, index: index, property: prop, value: entity[prop] });
                return false;
            }
        }

        // Check if enemy is dead but still in array
        if (entity.isDead === true && entity.hp <= 0) {
            this.errorHandler.logError('DEAD_ENEMY_IN_ARRAY', 
                new Error('Dead enemy still in active array'), 
                { type: type, index: index, hp: entity.hp });
            return false;
        }

        return true;
    }

    /**
     * Clean up corrupted entities
     */
    cleanupCorruptedEntities() {
        if (this.corruptedEntities.size === 0) return;

        this.errorHandler.logError('CLEANING_CORRUPTED_ENTITIES', 
            new Error('Cleaning up corrupted entities'), 
            { count: this.corruptedEntities.size }, 
            'WARN');

        const entityTypes = ['ants', 'flyingAnts', 'foods', 'enemies'];
        
        entityTypes.forEach(type => {
            const entities = this.entityManager.entities[type] || [];
            
            // Remove corrupted entities (iterate backwards to maintain indices)
            for (let i = entities.length - 1; i >= 0; i--) {
                const entityKey = `${type}_${i}`;
                if (this.corruptedEntities.has(entityKey)) {
                    try {
                        // Remove from display if it has a sprite
                        const entity = entities[i];
                        if (entity && entity.sprite && entity.sprite.parent) {
                            entity.sprite.parent.removeChild(entity.sprite);
                        }
                        
                        // Remove from array
                        entities.splice(i, 1);
                        this.corruptedEntities.delete(entityKey);
                        
                    } catch (error) {
                        this.errorHandler.logError('ENTITY_CLEANUP_ERROR', error, {
                            type: type,
                            index: i
                        });
                    }
                }
            }
        });

        this.corruptedEntities.clear();
        this.updateEntityCounts();
    }

    /**
     * Validate entity counts are within reasonable limits
     */
    validateEntityCounts() {
        Object.keys(this.maxEntityLimits).forEach(type => {
            const entities = this.entityManager.entities[type] || [];
            const count = Array.isArray(entities) ? entities.length : 0;
            
            if (count > this.maxEntityLimits[type]) {
                this.errorHandler.logError('ENTITY_LIMIT_EXCEEDED', 
                    new Error(`Too many ${type} entities`), 
                    { 
                        type: type, 
                        count: count, 
                        limit: this.maxEntityLimits[type] 
                    }, 
                    'WARN');
                
                // Emergency cleanup - remove excess entities
                const excess = count - this.maxEntityLimits[type];
                entities.splice(-excess, excess);
            }
        });
    }

    /**
     * Update entity counts for monitoring
     */
    updateEntityCounts() {
        Object.keys(this.entityCounts).forEach(type => {
            const entities = this.entityManager.entities[type] || [];
            this.entityCounts[type] = Array.isArray(entities) ? entities.length : 0;
        });
    }

    /**
     * Get health status of the entity manager
     * @returns {object} Health information
     */
    getHealthStatus() {
        return {
            isHealthy: this.isHealthy,
            operationCount: this.operationCount,
            errorCount: this.errorCount,
            errorRate: this.operationCount > 0 ? this.errorCount / this.operationCount : 0,
            entityCounts: { ...this.entityCounts },
            corruptedEntities: this.corruptedEntities.size,
            maxLimits: { ...this.maxEntityLimits }
        };
    }

    // Proxied methods with error handling
    createNest(position) {
        this.errorHandler.assert(
            position && typeof position.x === 'number' && typeof position.y === 'number',
            'Invalid nest position',
            { position: position }
        );
        
        return this.safeMethod('createNest', [position]);
    }

    createAnt() {
        return this.safeMethod('createAnt', []);
    }

    createFlyingAnt() {
        return this.safeMethod('createFlyingAnt', []);
    }

    createFood(position, type) {
        this.errorHandler.assert(
            position && typeof position.x === 'number' && typeof position.y === 'number',
            'Invalid food position',
            { position: position, type: type }
        );
        
        return this.safeMethod('createFood', [position, type]);
    }

    update() {
        return this.safeMethod('update', []);
    }

    getNestPosition() {
        return this.safeMethod('getNestPosition', [], null);
    }

    getAntCount() {
        return this.safeMethod('getAntCount', [], 0);
    }

    getAllAnts() {
        return this.safeMethod('getAllAnts', [], []);
    }

    getAllFoods() {
        return this.safeMethod('getAllFoods', [], []);
    }

    // Property accessors with validation
    get entities() {
        if (!this.entityManager.entities) {
            this.errorHandler.logError('MISSING_ENTITIES', 
                new Error('Entities object missing'));
            return {
                ants: [],
                flyingAnts: [],
                foods: [],
                enemies: [],
                queen: null
            };
        }
        return this.entityManager.entities;
    }

    /**
     * Force cleanup of all entities
     */
    forceCleanup() {
        this.errorHandler.logError('ENTITYMANAGER_FORCE_CLEANUP', 
            new Error('Force cleanup initiated'), 
            { entityCounts: this.entityCounts }, 
            'WARN');

        return this.safeMethod('cleanup', []);
    }

    /**
     * Export diagnostic information
     * @returns {object} Diagnostic data
     */
    exportDiagnostics() {
        return {
            health: this.getHealthStatus(),
            entityCounts: { ...this.entityCounts },
            corruptedEntities: Array.from(this.corruptedEntities),
            nestPosition: this.errorHandler.safeExecute(
                () => this.entityManager.getNestPosition(),
                'export_nest_position',
                null
            ),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Cleanup when shutting down
     */
    destroy() {
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
        }
        this.forceCleanup();
    }
};