/**
 * GameUpgradeManager - Handles all upgrade-related functionality
 * Extracted from Game.js to maintain Single Responsibility Principle
 */

// Ensure Game namespace exists
if (!IdleAnts.Game) {
    IdleAnts.Game = {};
}

IdleAnts.Game.GameUpgradeManager = class {
    constructor(game) {
        this.game = game;
    }

    /**
     * Buy a new ant
     */
    buyAnt() {
        const cost = this.game.resourceManager.getAntCost();
        const currentAnts = this.game.resourceManager.stats.ants;
        const maxAnts = this.game.resourceManager.stats.maxAnts;
        
        if (currentAnts >= maxAnts) {
            return false; // Cannot buy more ants, colony is at capacity
        }
        
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.ants++;
            
            // Create new ant in the entity manager
            this.game.entityManager.createAnt();
            
            // Check for achievements
            if (this.game.dailyChallengeManager) {
                this.game.dailyChallengeManager.updateProgress('antPurchase', 1);
            }
            
            // Update the UI
            this.game.resourceManager.updateUI();
            
            // Play sound effect
            if (IdleAnts.AudioAssets.SFX.ANT_SPAWN) {
                this.game.gameAudioManager.playSoundEffect(IdleAnts.AudioAssets.SFX.ANT_SPAWN.id);
            }
            
            return true;
        }
        return false;
    }

    /**
     * Unlock flying ants
     */
    unlockFlyingAnts() {
        const cost = 500;
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.flyingAntsUnlocked = true;
            this.game.resourceManager.stats.flyingAnts = 0;
            this.game.resourceManager.stats.maxFlyingAnts = 1;
            
            // Show flying ant UI elements
            const flyingAntStats = document.getElementById('flying-ant-stats');
            const buyFlyingAntBtn = document.getElementById('buy-flying-ant');
            const expandFlyingAntsBtn = document.getElementById('expand-flying-ants');
            const unlockFlyingAntsBtn = document.getElementById('unlock-flying-ants');
            
            if (flyingAntStats) flyingAntStats.classList.remove('hidden');
            if (buyFlyingAntBtn) buyFlyingAntBtn.classList.remove('hidden');
            if (expandFlyingAntsBtn) expandFlyingAntsBtn.classList.remove('hidden');
            if (unlockFlyingAntsBtn) unlockFlyingAntsBtn.style.display = 'none';
            
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Buy a flying ant
     */
    buyFlyingAnt() {
        const cost = this.game.resourceManager.getFlyingAntCost();
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.flyingAnts++;
            this.game.entityManager.createFlyingAnt();
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Expand flying ant capacity
     */
    expandFlyingAntCapacity() {
        const cost = this.game.resourceManager.getExpandFlyingAntCost();
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.maxFlyingAnts += 2;
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Upgrade food generation
     */
    upgradeFood() {
        const cost = this.game.resourceManager.getFoodUpgradeCost();
        
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.foodUpgrades++;
            
            // Calculate new food multiplier
            this.game.resourceManager.stats.foodMultiplier = 1 + (this.game.resourceManager.stats.foodUpgrades * 0.5);
            
            // Check for achievements
            if (this.game.achievementManager) {
                this.game.achievementManager.checkAchievement('food_upgrade_5', 
                    this.game.resourceManager.stats.foodUpgrades >= 5);
                this.game.achievementManager.checkAchievement('food_upgrade_10', 
                    this.game.resourceManager.stats.foodUpgrades >= 10);
            }
            
            // Check if we've upgraded food types
            const tierUpgraded = this.game.resourceManager.checkFoodTierUpgrade();
            if (tierUpgraded) {
                console.log(`Food tier upgraded! New tier: ${this.game.resourceManager.getCurrentFoodTier().name}`);
            }
            
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Expand colony capacity
     */
    expandColony() {
        const cost = this.game.resourceManager.getExpandCost();
        
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.maxAnts += 5;
            this.game.resourceManager.stats.expansions++;
            
            // Check for achievements
            if (this.game.achievementManager) {
                this.game.achievementManager.checkAchievement('expand_5', 
                    this.game.resourceManager.stats.expansions >= 5);
            }
            
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Upgrade ant speed
     */
    upgradeSpeed() {
        const cost = this.game.resourceManager.getSpeedUpgradeCost();
        
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.speedUpgrades++;
            this.game.resourceManager.stats.speedMultiplier = 1 + (this.game.resourceManager.stats.speedUpgrades * 0.25);
            
            // Check for achievements
            if (this.game.achievementManager) {
                this.game.achievementManager.checkAchievement('speed_upgrade_5', 
                    this.game.resourceManager.stats.speedUpgrades >= 5);
            }
            
            // Update daily challenge progress
            if (this.game.dailyChallengeManager) {
                this.game.dailyChallengeManager.updateProgress('upgrades_purchased', 1);
            }
            
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Upgrade ant strength
     */
    upgradeStrength() {
        const cost = this.game.resourceManager.getStrengthUpgradeCost();
        
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.strengthUpgrades++;
            this.game.resourceManager.stats.strengthMultiplier = 1 + (this.game.resourceManager.stats.strengthUpgrades * 0.3);
            
            // Check for achievements
            if (this.game.achievementManager) {
                this.game.achievementManager.checkAchievement('strength_upgrade_5', 
                    this.game.resourceManager.stats.strengthUpgrades >= 5);
            }
            
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Unlock autofeeder
     */
    unlockAutofeeder() {
        const cost = 500;
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.autofeederUnlocked = true;
            this.game.resourceManager.stats.autofeederLevel = 1;
            
            // Update UI
            const unlockBtn = document.getElementById('unlock-autofeeder');
            const upgradeBtn = document.getElementById('upgrade-autofeeder');
            if (unlockBtn) unlockBtn.style.display = 'none';
            if (upgradeBtn) upgradeBtn.classList.remove('hidden');
            
            this.game.resourceManager.updateUI();
            this.activateAutofeeder();
            return true;
        }
        return false;
    }

    /**
     * Upgrade autofeeder
     */
    upgradeAutofeeder() {
        const cost = this.game.resourceManager.getAutofeederUpgradeCost();
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.autofeederLevel++;
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Activate autofeeder functionality
     */
    activateAutofeeder() {
        if (this.game.entityManager && typeof this.game.entityManager.activateAutofeeder === 'function') {
            this.game.entityManager.activateAutofeeder();
        }
    }

    /**
     * Unlock queen ant
     */
    unlockQueen() {
        const cost = 1000;
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.queenUnlocked = true;
            this.game.resourceManager.stats.queenLevel = 0;
            
            // Update UI
            const unlockBtn = document.getElementById('unlock-queen');
            const buyBtn = document.getElementById('buy-queen');
            if (unlockBtn) unlockBtn.style.display = 'none';
            if (buyBtn) buyBtn.style.display = 'inline-block';
            
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Buy queen ant
     */
    buyQueen() {
        const cost = 2000;
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.queenLevel = 1;
            this.game.entityManager.createQueen();
            
            // Update UI
            const buyBtn = document.getElementById('buy-queen');
            if (buyBtn) buyBtn.style.display = 'none';
            
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Upgrade queen ant
     */
    upgradeQueen() {
        const cost = this.game.resourceManager.getQueenUpgradeCost();
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.queenLevel++;
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Unlock car ants
     */
    unlockCarAnts() {
        const cost = 10000;
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.carAntsUnlocked = true;
            this.game.resourceManager.stats.carAnts = 0;
            this.game.resourceManager.stats.maxCarAnts = 1;
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Buy car ant
     */
    buyCarAnt() {
        const cost = this.game.resourceManager.getCarAntCost();
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.carAnts++;
            this.game.entityManager.createCarAnt();
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Expand car ant capacity
     */
    expandCarAntCapacity() {
        const cost = this.game.resourceManager.getExpandCarAntCost();
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.maxCarAnts += 1;
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Unlock fire ants
     */
    unlockFireAnts() {
        const cost = 20000;
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.fireAntsUnlocked = true;
            this.game.resourceManager.stats.fireAnts = 0;
            this.game.resourceManager.stats.maxFireAnts = 1;
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Buy fire ant
     */
    buyFireAnt() {
        const cost = this.game.resourceManager.getFireAntCost();
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.fireAnts++;
            this.game.entityManager.createFireAnt();
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }

    /**
     * Expand fire ant capacity
     */
    expandFireAntCapacity() {
        const cost = this.game.resourceManager.getExpandFireAntCost();
        if (this.game.resourceManager.spendFood(cost)) {
            this.game.resourceManager.stats.maxFireAnts += 1;
            this.game.resourceManager.updateUI();
            return true;
        }
        return false;
    }
};

