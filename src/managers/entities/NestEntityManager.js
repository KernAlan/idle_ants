/**
 * NestEntityManager - Handles nest-related entity management
 * Extracted from EntityManager.js to maintain Single Responsibility Principle
 */

// Ensure Managers namespace exists
if (!IdleAnts.Managers) {
    IdleAnts.Managers = {};
}

if (!IdleAnts.Managers.Entities) {
    IdleAnts.Managers.Entities = {};
}

IdleAnts.Managers.Entities.NestEntityManager = class {
    constructor(app, assetManager, resourceManager, worldContainer) {
        this.app = app;
        this.assetManager = assetManager;
        this.resourceManager = resourceManager;
        this.worldContainer = worldContainer;
        this.effectManager = null;
        
        // Create nest container
        this.container = new PIXI.Container();
        this.worldContainer.addChild(this.container);
        
        // Nest entity
        this.nest = null;
        this.nestPosition = null;
        
        // Nest settings
        this.mapConfig = null;
        
        // Create the nest automatically
        this.createNest();
    }

    /**
     * Set effect manager reference
     * @param {Object} effectManager - Effect manager instance
     */
    setEffectManager(effectManager) {
        this.effectManager = effectManager;
    }

    /**
     * Set map configuration for nest positioning
     * @param {Object} mapConfig - Map configuration
     */
    setMapConfig(mapConfig) {
        this.mapConfig = mapConfig;
    }

    /**
     * Create the nest entity
     */
    createNest() {
        if (this.nest) {
            console.warn('[NestEntityManager] Nest already exists');
            return;
        }

        // Calculate nest position based on map config
        const nestX = this.mapConfig ? this.mapConfig.width / 2 : 1500;
        const nestY = this.mapConfig ? this.mapConfig.height / 2 : 1000;
        
        this.nestPosition = { x: nestX, y: nestY };

        // Get nest texture
        const nestTexture = this.assetManager.getTexture('nest');
        if (!nestTexture) {
            console.error('[NestEntityManager] Nest texture not found');
            return;
        }

        // Create nest entity
        this.nest = new IdleAnts.Entities.Nest(nestTexture, this.nestPosition.x, this.nestPosition.y);
        
        this.container.addChild(this.nest);
        
        // Create spawn effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(this.nest.x, this.nest.y, 'nest');
        }
        
        console.log('[NestEntityManager] Nest created at', this.nestPosition);
    }

    /**
     * Get nest position
     * @returns {Object|null} Nest position {x, y} or null if no nest
     */
    getNestPosition() {
        return this.nestPosition;
    }

    /**
     * Get nest entity
     * @returns {Object|null} Nest entity or null
     */
    getNest() {
        return this.nest;
    }

    /**
     * Move nest to new position
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    moveNest(x, y) {
        if (!this.nest) {
            console.warn('[NestEntityManager] Cannot move nest - no nest exists');
            return;
        }

        this.nest.x = x;
        this.nest.y = y;
        this.nestPosition = { x, y };
        
        // Create movement effect
        if (this.effectManager) {
            this.effectManager.createNestMoveEffect(x, y);
        }
        
        console.log('[NestEntityManager] Nest moved to', this.nestPosition);
    }

    /**
     * Update nest entity
     */
    update() {
        if (this.nest && this.nest.update) {
            this.nest.update();
        }
    }

    /**
     * Check if position is near nest
     * @param {Object} position - Position to check {x, y}
     * @param {number} radius - Check radius (default: 50)
     * @returns {boolean} True if position is near nest
     */
    isNearNest(position, radius = 50) {
        if (!this.nestPosition) return false;
        
        const dx = position.x - this.nestPosition.x;
        const dy = position.y - this.nestPosition.y;
        const distanceSq = dx * dx + dy * dy;
        
        return distanceSq <= radius * radius;
    }

    /**
     * Get distance to nest from position
     * @param {Object} position - Position {x, y}
     * @returns {number} Distance to nest (Infinity if no nest)
     */
    getDistanceToNest(position) {
        if (!this.nestPosition) return Infinity;
        
        const dx = position.x - this.nestPosition.x;
        const dy = position.y - this.nestPosition.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get direction to nest from position
     * @param {Object} position - Position {x, y}
     * @returns {Object|null} Direction vector {x, y} or null if no nest
     */
    getDirectionToNest(position) {
        if (!this.nestPosition) return null;
        
        const dx = this.nestPosition.x - position.x;
        const dy = this.nestPosition.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return { x: 0, y: 0 };
        
        return {
            x: dx / distance,
            y: dy / distance
        };
    }

    /**
     * Upgrade nest (visual effects, etc.)
     * @param {number} level - Upgrade level
     */
    upgradeNest(level) {
        if (!this.nest) return;
        
        // Visual upgrade effects
        if (this.effectManager) {
            this.effectManager.createNestUpgradeEffect(this.nest.x, this.nest.y, level);
        }
        
        // Scale nest based on upgrade level
        const baseScale = 1.0;
        const scaleIncrease = 0.1 * level;
        const newScale = Math.min(baseScale + scaleIncrease, 2.0); // Cap at 2x scale
        
        this.nest.scale.set(newScale);
        
        console.log(`[NestEntityManager] Nest upgraded to level ${level}, scale: ${newScale}`);
    }

    /**
     * Get nest health (if nest has health system)
     * @returns {Object} Health information {current, max, percentage}
     */
    getNestHealth() {
        if (!this.nest || !this.nest.healthComponent) {
            return { current: 100, max: 100, percentage: 1.0 };
        }
        
        return {
            current: this.nest.healthComponent.hp,
            max: this.nest.healthComponent.maxHp,
            percentage: this.nest.healthComponent.getHealthPercent()
        };
    }

    /**
     * Damage nest
     * @param {number} damage - Damage amount
     */
    damageNest(damage) {
        if (!this.nest || !this.nest.takeDamage) return;
        
        this.nest.takeDamage(damage);
        
        // Visual damage effect
        if (this.effectManager) {
            this.effectManager.createNestDamageEffect(this.nest.x, this.nest.y, damage);
        }
    }

    /**
     * Heal nest
     * @param {number} amount - Heal amount
     */
    healNest(amount) {
        if (!this.nest || !this.nest.heal) return;
        
        this.nest.heal(amount);
        
        // Visual heal effect
        if (this.effectManager) {
            this.effectManager.createNestHealEffect(this.nest.x, this.nest.y, amount);
        }
    }

    /**
     * Check if nest is destroyed
     * @returns {boolean} True if nest is destroyed
     */
    isNestDestroyed() {
        return !this.nest || this.nest.isDead || this.nest.isDestroyed;
    }

    /**
     * Respawn nest (if destroyed)
     */
    respawnNest() {
        if (this.nest && !this.isNestDestroyed()) {
            console.warn('[NestEntityManager] Cannot respawn nest - nest is not destroyed');
            return;
        }
        
        // Remove old nest if it exists
        if (this.nest) {
            this.container.removeChild(this.nest);
            this.nest.destroy();
        }
        
        // Create new nest
        this.nest = null;
        this.createNest();
    }

    /**
     * Get nest statistics
     * @returns {Object} Nest statistics
     */
    getStatistics() {
        if (!this.nest) {
            return {
                exists: false,
                position: null,
                health: null,
                isDestroyed: true
            };
        }
        
        return {
            exists: true,
            position: this.nestPosition,
            health: this.getNestHealth(),
            isDestroyed: this.isNestDestroyed(),
            scale: { x: this.nest.scale.x, y: this.nest.scale.y },
            upgradeLevel: this.nest.upgradeLevel || 0
        };
    }

    /**
     * Destroy nest and cleanup
     */
    destroy() {
        if (this.nest) {
            this.container.removeChild(this.nest);
            this.nest.destroy();
            this.nest = null;
        }
        
        this.nestPosition = null;
        
        // Remove container
        if (this.container.parent) {
            this.container.parent.removeChild(this.container);
        }
        this.container.destroy();
        this.container = null;
    }
};