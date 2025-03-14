// src/managers/ResourceManager.js
IdleAnts.Managers.ResourceManager = class {
    constructor() {
        // Game resources
        this.resources = {
            food: 1000000, // Start with 1,000,000 food for debugging
            displayFood: 1000000 // For smooth animation
        };
        
        // Game stats
        this.stats = {
            ants: 1,
            maxAnts: 10,
            flyingAnts: 0,
            maxFlyingAnts: 0,  // Start with no flying ants allowed
            flyingAntsUnlocked: false,  // Flying ants need to be unlocked first
            foodPerClick: 1,
            foodPerSecond: 0,
            antCost: 10,
            flyingAntCost: 100,  // Flying ants are more expensive
            flyingAntUnlockCost: 500,  // Initial cost to unlock flying ants
            foodUpgradeCost: 50,
            expandCost: 100,
            foodMultiplier: 1,
            speedUpgradeCost: 75,
            speedMultiplier: 1,
            // New strength-related properties
            strengthUpgradeCost: 100,
            strengthMultiplier: 1,
            // Food tier properties
            foodTier: 1,  // Start with basic food (tier 1)
            maxFoodTier: 2 // Currently only 2 tiers implemented (basic and cookie)
        };
        
        // Map of food tier to food type
        this.foodTierMap = {
            1: IdleAnts.Data.FoodTypes.BASIC,
            2: IdleAnts.Data.FoodTypes.COOKIE
        };
    }
    
    // Food resource methods
    addFood(amount) {
        this.resources.food += amount;
    }
    
    spendFood(amount) {
        if (this.canAfford(amount)) {
            this.resources.food -= amount;
            return true;
        }
        return false;
    }
    
    canAfford(cost) {
        return this.resources.food >= cost;
    }
    
    // Stats update methods
    increaseAntCount() {
        this.stats.ants++;
        this.updateFoodPerSecond();
    }
    
    updateFoodPerSecond() {
        // Regular ants contribute 0.5 food per second, flying ants contribute 2 food per second
        this.stats.foodPerSecond = (this.stats.ants * 0.5) + (this.stats.flyingAnts * 2);
    }
    
    increaseMaxAnts(amount) {
        this.stats.maxAnts += amount;
    }
    
    updateAntCost() {
        this.stats.antCost = Math.floor(this.stats.antCost * 1.5);
    }
    
    updateFoodUpgradeCost() {
        this.stats.foodUpgradeCost = Math.floor(this.stats.foodUpgradeCost * 2);
    }
    
    updateExpandCost() {
        this.stats.expandCost = Math.floor(this.stats.expandCost * 2);
    }
    
    upgradeFoodMultiplier(amount) {
        this.stats.foodMultiplier += amount;
    }
    
    upgradeFoodPerClick() {
        this.stats.foodPerClick = Math.ceil(this.stats.foodPerClick * 1.5);
    }
    
    // New method to upgrade food tier
    upgradeFoodTier() {
        if (this.stats.foodTier < this.stats.maxFoodTier) {
            this.stats.foodTier++;
            return true;
        }
        return false;
    }
    
    // Get the current food type based on food tier
    getCurrentFoodType() {
        return this.foodTierMap[this.stats.foodTier] || IdleAnts.Data.FoodTypes.BASIC;
    }
    
    // Check if food can be upgraded further
    canUpgradeFoodTier() {
        return this.stats.foodTier < this.stats.maxFoodTier;
    }
    
    updateSpeedUpgradeCost() {
        this.stats.speedUpgradeCost = Math.floor(this.stats.speedUpgradeCost * 1.8);
    }
    
    upgradeSpeedMultiplier(amount) {
        this.stats.speedMultiplier += amount;
    }
    
    // Flying ant methods
    unlockFlyingAnts() {
        // Check if we can afford it and if flying ants aren't already unlocked
        if (this.resources.food >= this.stats.flyingAntUnlockCost && !this.stats.flyingAntsUnlocked) {
            // Deduct the food cost
            this.resources.food -= this.stats.flyingAntUnlockCost;
            
            // Set flying ants as unlocked
            this.stats.flyingAntsUnlocked = true;
            
            // Set initial max flying ants
            this.stats.maxFlyingAnts = 3;
            
            return true;
        }
        
        return false;
    }
    
    canBuyFlyingAnt() {
        return this.stats.flyingAntsUnlocked && 
               this.canAfford(this.stats.flyingAntCost) && 
               this.stats.flyingAnts < this.stats.maxFlyingAnts;
    }
    
    buyFlyingAnt() {
        if (this.canBuyFlyingAnt()) {
            this.spendFood(this.stats.flyingAntCost);
            this.stats.flyingAnts++;
            this.stats.flyingAntCost = Math.floor(this.stats.flyingAntCost * 1.8); // Flying ant cost increases faster
            this.updateFoodPerSecond();
            return true;
        }
        return false;
    }
    
    expandFlyingAntCapacity() {
        const expandFlyingCost = Math.floor(this.stats.expandCost * 1.5);
        if (this.stats.flyingAntsUnlocked && this.canAfford(expandFlyingCost)) {
            this.spendFood(expandFlyingCost);
            this.stats.maxFlyingAnts += 2; // Add fewer flying ants per upgrade
            return true;
        }
        return false;
    }
    
    // New strength-related methods
    updateStrengthUpgradeCost() {
        this.stats.strengthUpgradeCost = Math.floor(this.stats.strengthUpgradeCost * 1.8);
    }
    
    upgradeStrengthMultiplier(amount) {
        // Increase strength multiplier
        this.stats.strengthMultiplier += amount;
        
        // This value has dual effects:
        // 1. Increases the ants' carrying capacity
        // 2. Reduces collection time for heavy food types (calculated in AntBase.js)
    }
    
    canUpgradeStrength() {
        return this.canAfford(this.stats.strengthUpgradeCost);
    }
    
    upgradeStrength() {
        if (this.canUpgradeStrength()) {
            this.spendFood(this.stats.strengthUpgradeCost);
            this.upgradeStrengthMultiplier(0.2); // Increase strength by 0.2 per upgrade
            this.updateStrengthUpgradeCost();
            return true;
        }
        return false;
    }
} 