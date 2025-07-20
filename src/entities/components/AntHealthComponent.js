/**
 * AntHealthComponent - Handles ant health, damage, and death mechanics
 * Extracted from AntBase.js to maintain Single Responsibility Principle
 */

// Ensure Components namespace exists
if (!IdleAnts.Entities.Components) {
    IdleAnts.Entities.Components = {};
}

IdleAnts.Entities.Components.AntHealthComponent = class {
    constructor(ant, maxHp = 100) {
        this.ant = ant;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.isDead = false;
        
        // Health bar display properties
        this.healthBarContainer = null;
        this.healthBarBackground = null;
        this.healthBar = null;
        this.healthBarTimer = 0;
        this.healthBarDisplayTime = 180; // 3 seconds at 60fps
        
        this.createHealthBar();
    }

    /**
     * Create health bar visual element
     */
    createHealthBar() {
        // Only create health bar for ants with less than max health
        if (!IdleAnts.app || !IdleAnts.app.worldContainer) return;
        
        this.healthBarContainer = new PIXI.Container();
        this.healthBarContainer.x = this.ant.x;
        this.healthBarContainer.y = this.ant.y - 25;
        this.healthBarContainer.visible = false;
        
        // Health bar background
        this.healthBarBackground = new PIXI.Graphics();
        this.healthBarBackground.beginFill(0x000000, 0.8);
        this.healthBarBackground.drawRect(-15, -3, 30, 6);
        this.healthBarBackground.endFill();
        this.healthBarContainer.addChild(this.healthBarBackground);
        
        // Health bar foreground
        this.healthBar = new PIXI.Graphics();
        this.updateHealthBarDisplay();
        this.healthBarContainer.addChild(this.healthBar);
        
        IdleAnts.app.worldContainer.addChild(this.healthBarContainer);
    }

    /**
     * Update health bar display
     */
    updateHealthBarDisplay() {
        if (!this.healthBar) return;
        
        this.healthBar.clear();
        
        const healthPercent = this.hp / this.maxHp;
        const barWidth = 28 * healthPercent;
        
        // Color based on health percentage
        let color = 0x00FF00; // Green
        if (healthPercent < 0.7) color = 0xFFFF00; // Yellow
        if (healthPercent < 0.3) color = 0xFF0000; // Red
        
        this.healthBar.beginFill(color);
        this.healthBar.drawRect(-14, -2, barWidth, 4);
        this.healthBar.endFill();
    }

    /**
     * Update health bar position and visibility
     */
    update() {
        if (this.healthBarContainer) {
            this.healthBarContainer.x = this.ant.x;
            this.healthBarContainer.y = this.ant.y - 25;
        }

        // Handle health bar timer
        if (this.healthBarTimer > 0) {
            this.healthBarTimer--;
            if (this.healthBarTimer === 0 && this.healthBarContainer) {
                this.healthBarContainer.visible = false;
            }
        }
    }

    /**
     * Take damage and update health
     * @param {number} damage - Amount of damage to take
     */
    takeDamage(damage) {
        if (this.isDead) return;
        
        this.hp = Math.max(0, this.hp - damage);
        this.updateHealthBarDisplay();
        
        // Show health bar when taking damage
        if (this.healthBarContainer) {
            this.healthBarContainer.visible = true;
            this.healthBarTimer = this.healthBarDisplayTime;
        }
        
        if (this.hp <= 0) {
            this.die();
        }
    }

    /**
     * Heal the ant
     * @param {number} amount - Amount to heal
     */
    heal(amount) {
        if (this.isDead) return;
        
        this.hp = Math.min(this.maxHp, this.hp + amount);
        this.updateHealthBarDisplay();
        
        // Show health bar when healing
        if (this.healthBarContainer && this.hp < this.maxHp) {
            this.healthBarContainer.visible = true;
            this.healthBarTimer = this.healthBarDisplayTime;
        }
    }

    /**
     * Handle ant death
     */
    die() {
        this.isDead = true;
        this.hp = 0;
        
        // Remove health bar
        if (this.healthBarContainer && this.healthBarContainer.parent) {
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
            this.healthBarContainer.destroy();
            this.healthBarContainer = null;
        }
        
        // Mark ant for removal
        this.ant.isDead = true;
        
        // Create death effect if available
        if (IdleAnts.app && IdleAnts.app.effectManager) {
            IdleAnts.app.effectManager.createDeathEffect(this.ant.x, this.ant.y);
        }
    }

    /**
     * Check if ant is alive
     * @returns {boolean} True if ant is alive
     */
    isAlive() {
        return !this.isDead && this.hp > 0;
    }

    /**
     * Get health percentage
     * @returns {number} Health percentage (0-1)
     */
    getHealthPercent() {
        return this.hp / this.maxHp;
    }

    /**
     * Reset health to maximum
     */
    resetHealth() {
        this.hp = this.maxHp;
        this.isDead = false;
        this.updateHealthBarDisplay();
    }

    /**
     * Destroy the health component
     */
    destroy() {
        if (this.healthBarContainer && this.healthBarContainer.parent) {
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
            this.healthBarContainer.destroy();
        }
        
        this.healthBarContainer = null;
        this.healthBarBackground = null;
        this.healthBar = null;
        this.ant = null;
    }
};