if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// Powerful end-game boss: the Anteater
IdleAnts.Entities.AnteaterBoss = class extends IdleAnts.Entities.Enemy {
    constructor(texture, mapBounds) {
        super(texture, mapBounds);
        // Override base stats for a formidable fight
        this.maxHp = 5000;
        this.hp = this.maxHp;
        this.speed = 0.8; // slow but deadly
        this.attackDamage = 20;
        this.attackRange = 30;
        this.perceptionRange = 450;
        this.enemyName = "Anteater";
        // Large sprite
        this.scale.set(3);
        this.updateHealthBar();
    }

    takeDamage(dmg, attacker) {
        super.takeDamage(dmg, attacker);
        // Notify UI of boss HP updates
        if (IdleAnts.game && IdleAnts.game.uiManager) {
            IdleAnts.game.uiManager.updateBossHealth(this.hp, this.maxHp);
        }
    }

    die() {
        super.die();
        // Let the game know the boss has been defeated
        if (IdleAnts.game && typeof IdleAnts.game.onBossDefeated === 'function') {
            IdleAnts.game.onBossDefeated();
        }
    }
};