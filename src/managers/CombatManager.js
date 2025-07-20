// src/managers/CombatManager.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Managers === 'undefined') IdleAnts.Managers = {};

/**
 * CombatManager - Handles combat interactions between entities
 * Enhanced implementation for entity combat mechanics
 */
IdleAnts.Managers.CombatManager = class {
    constructor(entityManager) {
        this.entityManager = entityManager;
        
        // Combat entity tracking
        this.hostileEntities = [];
        this.allyEntities = [];
        this.combatPairs = new Map(); // Track active combat pairs
        
        // Combat settings
        this.combatRange = 50;
        this.combatCheckInterval = 30; // Check every 0.5 seconds at 60fps
        this.frameCounter = 0;
    }

    /**
     * Update combat system - called every frame
     */
    update() {
        this.frameCounter++;
        
        if (this.frameCounter % this.combatCheckInterval === 0) {
            this.updateEntityLists();
            this.processCombatInteractions();
        }
        
        this.updateActiveCombats();
    }

    /**
     * Update lists of hostile and ally entities
     */
    updateEntityLists() {
        this.hostileEntities = this.entityManager.entities.enemies || [];
        this.allyEntities = [
            ...(this.entityManager.entities.ants || []),
            ...(this.entityManager.entities.flyingAnts || []),
            ...(this.entityManager.entities.fireAnts || []),
            ...(this.entityManager.entities.carAnts || [])
        ];
    }

    /**
     * Process combat interactions between hostile and ally entities
     */
    processCombatInteractions() {
        for (const hostile of this.hostileEntities) {
            if (hostile.isDead || !hostile.canAttack) continue;
            
            const nearbyAllies = this.findNearbyEntities(hostile, this.allyEntities, this.combatRange);
            
            if (nearbyAllies.length > 0) {
                const target = this.selectBestTarget(hostile, nearbyAllies);
                if (target && !this.combatPairs.has(hostile.id)) {
                    this.initiateCombat(hostile, target);
                }
            }
        }
    }

    /**
     * Find entities within range of a given entity
     * @param {object} entity - Source entity
     * @param {Array} entityList - List of entities to check
     * @param {number} range - Search range
     * @returns {Array} Nearby entities
     */
    findNearbyEntities(entity, entityList, range) {
        return entityList.filter(other => {
            if (other === entity || other.isDead) return false;
            
            const dx = entity.x - other.x;
            const dy = entity.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance <= range;
        });
    }

    /**
     * Select the best target for an attacker
     * @param {object} attacker - Attacking entity
     * @param {Array} targets - Potential targets
     * @returns {object} Best target
     */
    selectBestTarget(attacker, targets) {
        let bestTarget = null;
        let closestDistance = Infinity;
        
        for (const target of targets) {
            const dx = attacker.x - target.x;
            const dy = attacker.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                bestTarget = target;
            }
        }
        
        return bestTarget;
    }

    /**
     * Initiate combat between two entities
     * @param {object} attacker - Attacking entity
     * @param {object} target - Target entity
     */
    initiateCombat(attacker, target) {
        const combatPair = {
            attacker: attacker,
            target: target,
            lastAttackTime: Date.now(),
            attackInterval: attacker.attackInterval || 1000 // Default 1 second
        };
        
        this.combatPairs.set(attacker.id, combatPair);
        
        // Set entities to fighting state
        if (attacker.behaviorComponent) {
            attacker.behaviorComponent.setState('FIGHTING');
        }
        if (target.behaviorComponent) {
            target.behaviorComponent.setState('FIGHTING');
        }
    }

    /**
     * Update active combat interactions
     */
    updateActiveCombats() {
        const currentTime = Date.now();
        const combatsToRemove = [];
        
        for (const [attackerId, combatPair] of this.combatPairs) {
            const { attacker, target, lastAttackTime, attackInterval } = combatPair;
            
            // Check if combat should end
            if (attacker.isDead || target.isDead) {
                combatsToRemove.push(attackerId);
                continue;
            }
            
            // Check if entities are still in range
            const dx = attacker.x - target.x;
            const dy = attacker.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.combatRange * 1.5) {
                combatsToRemove.push(attackerId);
                continue;
            }
            
            // Process attack if enough time has passed
            if (currentTime - lastAttackTime >= attackInterval) {
                this.executeAttack(attacker, target);
                combatPair.lastAttackTime = currentTime;
            }
        }
        
        // Remove ended combats
        combatsToRemove.forEach(id => {
            this.combatPairs.delete(id);
        });
    }

    /**
     * Execute an attack between two entities
     * @param {object} attacker - Attacking entity
     * @param {object} target - Target entity
     */
    executeAttack(attacker, target) {
        const damage = attacker.attackDamage || 1;
        this.registerAttack(attacker, target, damage);
    }

    /**
     * Register an attack and apply damage
     * @param {object} attacker - Attacking entity
     * @param {object} target - Target entity
     * @param {number} damage - Damage amount
     */
    registerAttack(attacker, target, damage) {
        if (!target || target.isDead) return;
        
        // Apply damage
        if (target.takeDamage) {
            target.takeDamage(damage);
        } else if (target.hp !== undefined) {
            target.hp -= damage;
            if (target.hp <= 0) {
                target.isDead = true;
            }
        }
        
        // Create combat effect
        if (this.entityManager.effectManager) {
            this.entityManager.effectManager.createCombatEffect(target.x, target.y, damage);
        }
        
        // Log combat event
        console.log(`${attacker.constructor.name} attacks ${target.constructor.name} for ${damage} damage`);
    }

    /**
     * End combat for a specific entity
     * @param {object} entity - Entity to end combat for
     */
    endCombat(entity) {
        if (this.combatPairs.has(entity.id)) {
            this.combatPairs.delete(entity.id);
        }
        
        // Reset entity state
        if (entity.behaviorComponent) {
            entity.behaviorComponent.setState('SEEKING_FOOD');
        }
    }

    /**
     * Check if an entity is currently in combat
     * @param {object} entity - Entity to check
     * @returns {boolean} True if in combat
     */
    isInCombat(entity) {
        return this.combatPairs.has(entity.id);
    }

    /**
     * Get combat statistics
     * @returns {object} Combat stats
     */
    getCombatStats() {
        return {
            activeCombats: this.combatPairs.size,
            hostileEntities: this.hostileEntities.length,
            allyEntities: this.allyEntities.length
        };
    }
}; 