/**
 * EnemyEntityManager - Handles all enemy-related entity management
 * Extracted from EntityManager.js to maintain Single Responsibility Principle
 */

// Ensure Managers namespace exists
if (!IdleAnts.Managers) {
    IdleAnts.Managers = {};
}

if (!IdleAnts.Managers.Entities) {
    IdleAnts.Managers.Entities = {};
}

IdleAnts.Managers.Entities.EnemyEntityManager = class {
    constructor(app, assetManager, resourceManager, worldContainer) {
        this.app = app;
        this.assetManager = assetManager;
        this.resourceManager = resourceManager;
        this.worldContainer = worldContainer;
        this.effectManager = null;
        
        // Create enemy container
        this.container = new PIXI.Container();
        this.worldContainer.addChild(this.container);
        
        // Enemy collection
        this.entities = [];
        
        // Enemy spawn settings
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1800; // 30 seconds at 60fps
        this.maxEnemies = 5;
        this.mapConfig = null;
        this.nestPosition = null;
        
        // Enemy types and their spawn weights
        this.enemyTypes = [
            { type: 'grasshopper', weight: 40, texture: 'grasshopper_enemy' },
            { type: 'cricket', weight: 30, texture: 'cricket_enemy' },
            { type: 'mantis', weight: 20, texture: 'mantis_enemy' },
            { type: 'beetle', weight: 8, texture: 'hercules_beetle_enemy' },
            { type: 'bee', weight: 2, texture: 'bee_enemy' }
        ];
    }

    /**
     * Set effect manager reference
     * @param {Object} effectManager - Effect manager instance
     */
    setEffectManager(effectManager) {
        this.effectManager = effectManager;
    }

    /**
     * Set map configuration for enemy spawning bounds
     * @param {Object} mapConfig - Map configuration
     */
    setMapConfig(mapConfig) {
        this.mapConfig = mapConfig;
    }

    /**
     * Set nest position for enemy targeting
     * @param {Object} position - Nest position {x, y}
     */
    setNestPosition(position) {
        this.nestPosition = position;
    }

    /**
     * Create a boss enemy
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object} Created boss entity
     */
    createBoss(x, y) {
        const bossTexture = this.assetManager.getTexture('anteater_boss');
        if (!bossTexture) {
            console.error('[EnemyEntityManager] Boss texture not found');
            return null;
        }

        const boss = new IdleAnts.Entities.AnteaterBoss(bossTexture, x, y);
        
        this.entities.push(boss);
        this.container.addChild(boss);
        
        // Create spawn effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(boss.x, boss.y, 'boss');
        }
        
        console.log('[EnemyEntityManager] Boss spawned at', x, y);
        return boss;
    }

    /**
     * Spawn a random enemy
     */
    spawnRandomEnemy() {
        if (this.entities.length >= this.maxEnemies) {
            return; // Don't spawn if at max capacity
        }

        const enemyType = this.selectRandomEnemyType();
        const position = this.generateRandomEnemyPosition();
        
        this.spawnEnemy(enemyType, position);
    }

    /**
     * Select random enemy type based on weights
     * @returns {Object} Selected enemy type
     */
    selectRandomEnemyType() {
        const totalWeight = this.enemyTypes.reduce((sum, type) => sum + type.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const enemyType of this.enemyTypes) {
            random -= enemyType.weight;
            if (random <= 0) {
                return enemyType;
            }
        }
        
        return this.enemyTypes[0]; // Fallback
    }

    /**
     * Generate random position for enemy spawn (away from nest)
     * @returns {Object} Position {x, y}
     */
    generateRandomEnemyPosition() {
        const mapWidth = this.mapConfig ? this.mapConfig.width : 3000;
        const mapHeight = this.mapConfig ? this.mapConfig.height : 2000;
        
        let position;
        let attempts = 0;
        const maxAttempts = 10;
        const minDistanceFromNest = 200;
        
        do {
            position = {
                x: 100 + Math.random() * (mapWidth - 200),
                y: 100 + Math.random() * (mapHeight - 200)
            };
            attempts++;
        } while (
            this.nestPosition && 
            this.getDistance(position, this.nestPosition) < minDistanceFromNest && 
            attempts < maxAttempts
        );
        
        return position;
    }

    /**
     * Spawn specific enemy type at position
     * @param {Object} enemyType - Enemy type configuration
     * @param {Object} position - Position {x, y}
     */
    spawnEnemy(enemyType, position) {
        const texture = this.assetManager.getTexture(enemyType.texture);
        if (!texture) {
            console.error(`[EnemyEntityManager] Enemy texture not found: ${enemyType.texture}`);
            return;
        }

        let enemy;
        
        // Create appropriate enemy based on type
        switch (enemyType.type) {
            case 'grasshopper':
                enemy = new IdleAnts.Entities.GrasshopperEnemy(texture, position.x, position.y);
                break;
            case 'cricket':
                enemy = new IdleAnts.Entities.CricketEnemy(texture, position.x, position.y);
                break;
            case 'mantis':
                enemy = new IdleAnts.Entities.MantisEnemy(texture, position.x, position.y);
                break;
            case 'beetle':
                enemy = new IdleAnts.Entities.HerculesBeetleEnemy(texture, position.x, position.y);
                break;
            case 'bee':
                enemy = new IdleAnts.Entities.BeeEnemy(texture, position.x, position.y);
                break;
            default:
                console.warn(`[EnemyEntityManager] Unknown enemy type: ${enemyType.type}`);
                enemy = new IdleAnts.Entities.Enemy(texture, position.x, position.y);
                break;
        }
        
        if (enemy) {
            this.entities.push(enemy);
            this.container.addChild(enemy);
            
            // Create spawn effect
            if (this.effectManager) {
                this.effectManager.createSpawnEffect(enemy.x, enemy.y, enemyType.type);
            }
        }
    }

    /**
     * Update all enemy entities
     * @param {Array} ants - Available ant targets
     */
    update(ants) {
        this.updateEnemySpawning();
        this.updateEnemyEntities(ants);
        this.cleanupDeadEnemies();
    }

    /**
     * Update enemy spawning timer
     */
    updateEnemySpawning() {
        this.enemySpawnTimer++;
        
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            
            // Spawn enemy if below max capacity
            if (this.entities.length < this.maxEnemies) {
                this.spawnRandomEnemy();
            }
        }
    }

    /**
     * Update individual enemy entities
     * @param {Array} ants - Available ant targets
     */
    updateEnemyEntities(ants) {
        for (const enemy of this.entities) {
            if (enemy.update) {
                enemy.update(this.nestPosition, ants);
            }
        }
    }

    /**
     * Clean up dead enemies
     */
    cleanupDeadEnemies() {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const enemy = this.entities[i];
            
            if (enemy.isDead || enemy.shouldRemove) {
                this.removeEnemy(i);
            }
        }
    }

    /**
     * Remove enemy at index
     * @param {number} index - Index of enemy to remove
     */
    removeEnemy(index) {
        const enemy = this.entities[index];
        if (enemy) {
            // Create death effect
            if (this.effectManager && enemy.isDead) {
                this.effectManager.createDeathEffect(enemy.x, enemy.y);
            }
            
            this.container.removeChild(enemy);
            enemy.destroy();
            this.entities.splice(index, 1);
        }
    }

    /**
     * Remove all enemies
     */
    removeAllEnemies() {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.removeEnemy(i);
        }
    }

    /**
     * Get enemies within radius of position
     * @param {Object} position - Position {x, y}
     * @param {number} radius - Search radius
     * @returns {Array} Array of enemy entities within radius
     */
    getEnemiesWithinRadius(position, radius) {
        const radiusSq = radius * radius;
        
        return this.entities.filter(enemy => {
            if (enemy.isDead) return false;
            
            const dx = enemy.x - position.x;
            const dy = enemy.y - position.y;
            const distSq = dx * dx + dy * dy;
            
            return distSq <= radiusSq;
        });
    }

    /**
     * Get closest enemy to position
     * @param {Object} position - Position {x, y}
     * @param {number} maxDistance - Maximum search distance (optional)
     * @returns {Object|null} Closest enemy entity or null
     */
    getClosestEnemy(position, maxDistance = Infinity) {
        let closestEnemy = null;
        let closestDistance = maxDistance;
        
        for (const enemy of this.entities) {
            if (enemy.isDead) continue;
            
            const distance = this.getDistance(position, enemy);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }
        
        return closestEnemy;
    }

    /**
     * Get distance between two points
     * @param {Object} point1 - First point {x, y}
     * @param {Object} point2 - Second point {x, y}
     * @returns {number} Distance between points
     */
    getDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get alive enemies
     * @returns {Array} Array of alive enemy entities
     */
    getAliveEnemies() {
        return this.entities.filter(enemy => !enemy.isDead);
    }

    /**
     * Get enemy count
     * @returns {number} Number of enemy entities
     */
    getEnemyCount() {
        return this.entities.length;
    }

    /**
     * Get alive enemy count
     * @returns {number} Number of alive enemy entities
     */
    getAliveEnemyCount() {
        return this.entities.filter(enemy => !enemy.isDead).length;
    }

    /**
     * Set enemy spawn interval
     * @param {number} interval - Spawn interval in frames
     */
    setSpawnInterval(interval) {
        this.enemySpawnInterval = interval;
    }

    /**
     * Set maximum enemy count
     * @param {number} max - Maximum number of enemy entities
     */
    setMaxEnemies(max) {
        this.maxEnemies = max;
    }

    /**
     * Add custom enemy type
     * @param {Object} enemyType - Enemy type configuration
     */
    addEnemyType(enemyType) {
        this.enemyTypes.push(enemyType);
    }

    /**
     * Get enemy statistics
     * @returns {Object} Enemy statistics
     */
    getStatistics() {
        const aliveEnemies = this.getAliveEnemies();
        const enemyByType = {};
        
        for (const enemy of aliveEnemies) {
            const typeName = enemy.enemyType || enemy.constructor.name;
            enemyByType[typeName] = (enemyByType[typeName] || 0) + 1;
        }
        
        return {
            total: this.entities.length,
            alive: aliveEnemies.length,
            dead: this.entities.length - aliveEnemies.length,
            byType: enemyByType,
            spawnTimer: this.enemySpawnTimer,
            spawnInterval: this.enemySpawnInterval,
            maxEnemies: this.maxEnemies
        };
    }

    /**
     * Destroy all enemy entities and cleanup
     */
    destroy() {
        // Destroy all enemy entities
        this.entities.forEach(enemy => enemy.destroy());
        this.entities = [];
        
        // Remove container
        if (this.container.parent) {
            this.container.parent.removeChild(this.container);
        }
        this.container.destroy();
        this.container = null;
    }
};