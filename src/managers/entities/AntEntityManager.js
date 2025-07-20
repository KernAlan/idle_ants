/**
 * AntEntityManager - Handles all ant-related entity management
 * Extracted from EntityManager.js to maintain Single Responsibility Principle
 */

// Ensure Managers namespace exists
if (!IdleAnts.Managers) {
    IdleAnts.Managers = {};
}

if (!IdleAnts.Managers.Entities) {
    IdleAnts.Managers.Entities = {};
}

IdleAnts.Managers.Entities.AntEntityManager = class {
    constructor(app, assetManager, resourceManager, worldContainer) {
        this.app = app;
        this.assetManager = assetManager;
        this.resourceManager = resourceManager;
        this.worldContainer = worldContainer;
        this.effectManager = null;
        
        // Create containers for different ant types
        this.containers = {
            ants: new PIXI.Container(),
            flyingAnts: new PIXI.Container(),
            carAnts: new PIXI.Container(),
            fireAnts: new PIXI.Container(),
            queen: new PIXI.Container(),
            larvae: new PIXI.Container()
        };
        
        // Add containers to world container
        this.worldContainer.addChild(this.containers.larvae);
        this.worldContainer.addChild(this.containers.ants);
        this.worldContainer.addChild(this.containers.flyingAnts);
        this.worldContainer.addChild(this.containers.queen);
        this.worldContainer.addChild(this.containers.carAnts);
        this.worldContainer.addChild(this.containers.fireAnts);
        
        // Entity collections
        this.entities = {
            ants: [],
            flyingAnts: [],
            carAnts: [],
            fireAnts: [],
            queen: null,
            larvae: []
        };
        
        this.nestPosition = null;
    }

    /**
     * Set effect manager reference
     * @param {Object} effectManager - Effect manager instance
     */
    setEffectManager(effectManager) {
        this.effectManager = effectManager;
    }

    /**
     * Set nest position
     * @param {Object} position - Nest position {x, y}
     */
    setNestPosition(position) {
        this.nestPosition = position;
    }

    /**
     * Create a new regular ant
     */
    createAnt() {
        if (!this.nestPosition) {
            console.warn('[AntEntityManager] Cannot create ant - no nest position set');
            return;
        }

        const antTexture = this.assetManager.getTexture('ant');
        if (!antTexture) {
            console.error('[AntEntityManager] Ant texture not found');
            return;
        }

        const speedMultiplier = this.resourceManager.stats.speedMultiplier || 1;
        const ant = new IdleAnts.Entities.Ant(antTexture, this.nestPosition, speedMultiplier);
        
        this.entities.ants.push(ant);
        this.containers.ants.addChild(ant);
        
        // Create spawn effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y, 'ant');
        }
    }

    /**
     * Create a new flying ant
     */
    createFlyingAnt() {
        if (!this.nestPosition) {
            console.warn('[AntEntityManager] Cannot create flying ant - no nest position set');
            return;
        }

        const flyingAntTexture = this.assetManager.getTexture('flying_ant');
        if (!flyingAntTexture) {
            console.error('[AntEntityManager] Flying ant texture not found');
            return;
        }

        const speedMultiplier = this.resourceManager.stats.speedMultiplier || 1;
        const flyingAnt = new IdleAnts.Entities.FlyingAnt(flyingAntTexture, this.nestPosition, speedMultiplier);
        
        this.entities.flyingAnts.push(flyingAnt);
        this.containers.flyingAnts.addChild(flyingAnt);
        
        // Create spawn effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(flyingAnt.x, flyingAnt.y, 'flying_ant');
        }
    }

    /**
     * Create a new car ant
     */
    createCarAnt() {
        if (!this.nestPosition) {
            console.warn('[AntEntityManager] Cannot create car ant - no nest position set');
            return;
        }

        const carAntTexture = this.assetManager.getTexture('car_ant');
        if (!carAntTexture) {
            console.error('[AntEntityManager] Car ant texture not found');
            return;
        }

        const speedMultiplier = this.resourceManager.stats.speedMultiplier || 1;
        const carAnt = new IdleAnts.Entities.CarAnt(carAntTexture, this.nestPosition, speedMultiplier);
        
        this.entities.carAnts.push(carAnt);
        this.containers.carAnts.addChild(carAnt);
        
        // Create spawn effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(carAnt.x, carAnt.y, 'car_ant');
        }
    }

    /**
     * Create a new fire ant
     */
    createFireAnt() {
        if (!this.nestPosition) {
            console.warn('[AntEntityManager] Cannot create fire ant - no nest position set');
            return;
        }

        const fireAntTexture = this.assetManager.getTexture('fire_ant');
        if (!fireAntTexture) {
            console.error('[AntEntityManager] Fire ant texture not found');
            return;
        }

        const speedMultiplier = this.resourceManager.stats.speedMultiplier || 1;
        const fireAnt = new IdleAnts.Entities.FireAnt(fireAntTexture, this.nestPosition, speedMultiplier);
        
        this.entities.fireAnts.push(fireAnt);
        this.containers.fireAnts.addChild(fireAnt);
        
        // Create spawn effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(fireAnt.x, fireAnt.y, 'fire_ant');
        }
    }

    /**
     * Create queen ant
     */
    createQueen() {
        if (!this.nestPosition) {
            console.warn('[AntEntityManager] Cannot create queen - no nest position set');
            return;
        }

        if (this.entities.queen) {
            console.warn('[AntEntityManager] Queen already exists');
            return;
        }

        const queenTexture = this.assetManager.getTexture('queen_ant');
        if (!queenTexture) {
            console.error('[AntEntityManager] Queen ant texture not found');
            return;
        }

        const queen = new IdleAnts.Entities.QueenAnt(queenTexture, this.nestPosition);
        
        this.entities.queen = queen;
        this.containers.queen.addChild(queen);
        
        // Create spawn effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(queen.x, queen.y, 'queen');
        }
    }

    /**
     * Create larvae
     * @param {number} count - Number of larvae to create
     */
    createLarvae(count = 1) {
        if (!this.nestPosition) {
            console.warn('[AntEntityManager] Cannot create larvae - no nest position set');
            return;
        }

        for (let i = 0; i < count; i++) {
            const larvaeTexture = this.assetManager.getTexture('larvae');
            if (!larvaeTexture) {
                console.error('[AntEntityManager] Larvae texture not found');
                continue;
            }

            // Position larvae around nest
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 30;
            const position = {
                x: this.nestPosition.x + Math.cos(angle) * distance,
                y: this.nestPosition.y + Math.sin(angle) * distance
            };

            const larvae = new IdleAnts.Entities.Larvae(larvaeTexture, position);
            
            this.entities.larvae.push(larvae);
            this.containers.larvae.addChild(larvae);
            
            // Create spawn effect
            if (this.effectManager) {
                this.effectManager.createLarvaeEffect(larvae.x, larvae.y);
            }
        }
    }

    /**
     * Update all ant entities
     * @param {Array} foods - Available food sources
     */
    update(foods) {
        this.updateAnts(foods);
        this.updateFlyingAnts(foods);
        this.updateCarAnts(foods);
        this.updateFireAnts(foods);
        this.updateQueen();
        this.updateLarvae();
        this.resolveNestClustering();
    }

    /**
     * Update regular ants
     * @param {Array} foods - Available food sources
     */
    updateAnts(foods) {
        for (let i = this.entities.ants.length - 1; i >= 0; i--) {
            const ant = this.entities.ants[i];
            
            if (ant.isDead) {
                this.removeAnt(i);
                continue;
            }
            
            ant.update(this.nestPosition, foods);
        }
    }

    /**
     * Update flying ants
     * @param {Array} foods - Available food sources
     */
    updateFlyingAnts(foods) {
        for (let i = this.entities.flyingAnts.length - 1; i >= 0; i--) {
            const ant = this.entities.flyingAnts[i];
            
            if (ant.isDead) {
                this.removeFlyingAnt(i);
                continue;
            }
            
            ant.update(this.nestPosition, foods);
        }
    }

    /**
     * Update car ants
     * @param {Array} foods - Available food sources
     */
    updateCarAnts(foods) {
        for (let i = this.entities.carAnts.length - 1; i >= 0; i--) {
            const ant = this.entities.carAnts[i];
            
            if (ant.isDead) {
                this.removeCarAnt(i);
                continue;
            }
            
            ant.update(this.nestPosition, foods);
        }
    }

    /**
     * Update fire ants
     * @param {Array} foods - Available food sources
     */
    updateFireAnts(foods) {
        for (let i = this.entities.fireAnts.length - 1; i >= 0; i--) {
            const ant = this.entities.fireAnts[i];
            
            if (ant.isDead) {
                this.removeFireAnt(i);
                continue;
            }
            
            ant.update(this.nestPosition, foods);
        }
    }

    /**
     * Update queen ant
     */
    updateQueen() {
        if (this.entities.queen && !this.entities.queen.isDead) {
            this.entities.queen.update(this.nestPosition);
            
            // Check if queen spawned larvae
            if (this.entities.queen.shouldSpawnLarvae && this.entities.queen.shouldSpawnLarvae()) {
                this.createLarvae(this.entities.queen.getLarvaeCount());
                this.entities.queen.resetSpawnTimer();
            }
        } else if (this.entities.queen && this.entities.queen.isDead) {
            this.removeQueen();
        }
    }

    /**
     * Update larvae
     */
    updateLarvae() {
        for (let i = this.entities.larvae.length - 1; i >= 0; i--) {
            const larvae = this.entities.larvae[i];
            const isActive = larvae.update();
            
            if (!isActive) {
                this.removeLarvae(i);
            }
        }
    }

    /**
     * Resolve nest clustering to prevent ants from crowding
     */
    resolveNestClustering() {
        if (!this.nestPosition) return;
        
        const checkRadius = 50;
        const checkRadiusSq = checkRadius * checkRadius;
        const pushForce = 0.5;
        
        // Get all ants near nest
        const allAnts = [
            ...this.entities.ants,
            ...this.entities.flyingAnts,
            ...this.entities.carAnts,
            ...this.entities.fireAnts
        ];
        
        const nearNestAnts = allAnts.filter(ant => {
            const dx = ant.x - this.nestPosition.x;
            const dy = ant.y - this.nestPosition.y;
            return (dx * dx + dy * dy) < checkRadiusSq;
        });
        
        // Apply separation force
        for (const ant of nearNestAnts) {
            for (const otherAnt of nearNestAnts) {
                if (ant === otherAnt) continue;
                
                const dx = ant.x - otherAnt.x;
                const dy = ant.y - otherAnt.y;
                const distSq = dx * dx + dy * dy;
                
                if (distSq < 400 && distSq > 0) { // Within 20 pixels
                    const dist = Math.sqrt(distSq);
                    const force = pushForce / dist;
                    
                    ant.x += (dx / dist) * force;
                    ant.y += (dy / dist) * force;
                }
            }
        }
    }

    /**
     * Remove ant at index
     * @param {number} index - Index of ant to remove
     */
    removeAnt(index) {
        const ant = this.entities.ants[index];
        if (ant) {
            this.containers.ants.removeChild(ant);
            ant.destroy();
            this.entities.ants.splice(index, 1);
        }
    }

    /**
     * Remove flying ant at index
     * @param {number} index - Index of flying ant to remove
     */
    removeFlyingAnt(index) {
        const ant = this.entities.flyingAnts[index];
        if (ant) {
            this.containers.flyingAnts.removeChild(ant);
            ant.destroy();
            this.entities.flyingAnts.splice(index, 1);
        }
    }

    /**
     * Remove car ant at index
     * @param {number} index - Index of car ant to remove
     */
    removeCarAnt(index) {
        const ant = this.entities.carAnts[index];
        if (ant) {
            this.containers.carAnts.removeChild(ant);
            ant.destroy();
            this.entities.carAnts.splice(index, 1);
        }
    }

    /**
     * Remove fire ant at index
     * @param {number} index - Index of fire ant to remove
     */
    removeFireAnt(index) {
        const ant = this.entities.fireAnts[index];
        if (ant) {
            this.containers.fireAnts.removeChild(ant);
            ant.destroy();
            this.entities.fireAnts.splice(index, 1);
        }
    }

    /**
     * Remove queen ant
     */
    removeQueen() {
        if (this.entities.queen) {
            this.containers.queen.removeChild(this.entities.queen);
            this.entities.queen.destroy();
            this.entities.queen = null;
        }
    }

    /**
     * Remove larvae at index
     * @param {number} index - Index of larvae to remove
     */
    removeLarvae(index) {
        const larvae = this.entities.larvae[index];
        if (larvae) {
            this.containers.larvae.removeChild(larvae);
            larvae.destroy();
            this.entities.larvae.splice(index, 1);
        }
    }

    /**
     * Get total ant count
     * @returns {number} Total number of ants
     */
    getAntCount() {
        return this.entities.ants.length + 
               this.entities.flyingAnts.length + 
               this.entities.carAnts.length + 
               this.entities.fireAnts.length;
    }

    /**
     * Get ant counts by type
     * @returns {Object} Ant counts by type
     */
    getAntCounts() {
        return {
            regular: this.entities.ants.length,
            flying: this.entities.flyingAnts.length,
            car: this.entities.carAnts.length,
            fire: this.entities.fireAnts.length,
            queen: this.entities.queen ? 1 : 0,
            larvae: this.entities.larvae.length,
            total: this.getAntCount()
        };
    }

    /**
     * Destroy all ant entities and cleanup
     */
    destroy() {
        // Destroy all ants
        this.entities.ants.forEach(ant => ant.destroy());
        this.entities.flyingAnts.forEach(ant => ant.destroy());
        this.entities.carAnts.forEach(ant => ant.destroy());
        this.entities.fireAnts.forEach(ant => ant.destroy());
        this.entities.larvae.forEach(larvae => larvae.destroy());
        
        if (this.entities.queen) {
            this.entities.queen.destroy();
        }
        
        // Clear arrays
        this.entities.ants = [];
        this.entities.flyingAnts = [];
        this.entities.carAnts = [];
        this.entities.fireAnts = [];
        this.entities.larvae = [];
        this.entities.queen = null;
        
        // Remove containers
        Object.values(this.containers).forEach(container => {
            if (container.parent) {
                container.parent.removeChild(container);
            }
            container.destroy();
        });
    }
};