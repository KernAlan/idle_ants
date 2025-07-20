// Logger setup
const logger = IdleAnts.Logger?.create('ResourceManager') || console;

// src/managers/ResourceManager.js
IdleAnts.Managers.ResourceManager = class {
    constructor() {
        // Log debug status for verification
        // logger.debug('ResourceManager initializing with debug mode:', IdleAnts.Config.debug);
        
        // Game resources
        this.resources = {
            food: IdleAnts.Config.debug ? 1000000 : 0, // Use 1 million in debug mode, otherwise 0
            displayFood: IdleAnts.Config.debug ? 1000000 : 0 // For smooth animation
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
            foodUpgradeCost: 1000, // Changed from 50 to 1000 as requested
            expandCost: 100,
            foodMultiplier: 1,
            speedUpgradeCost: 75,
            speedMultiplier: 1,
            // New strength-related properties
            strengthUpgradeCost: 50,
            strengthMultiplier: 1, // Now represents the actual carrying capacity
            // Food tier properties
            foodTier: 1,  // Start with basic food (tier 1)
            maxFoodTier: 9, // Now includes cake (tier 9)
            // Autofeeder properties
            autofeederUnlocked: false,
            autofeederLevel: 0,
            maxAutofeederLevel: 10,
            autofeederCost: 500, // Reduced from 1000 to 500
            autofeederUpgradeCost: 500, // Reduced from 1000 to 500
            autofeederBaseFoodAmount: 10, // Base amount of food to sprinkle
            autofeederInterval: 600, // Frames between autofeeder activations (10 seconds at 60fps)
            // Queen ant properties
            queenUnlocked: true,
            hasQueen: true,
            queenUnlockCost: 1000,
            queenCost: 2000,
            queenUpgradeLevel: 0,
            maxQueenUpgradeLevel: 5,
            queenUpgradeCost: 2000,
            queenLarvaeCapacity: 1,
            queenLarvaeProductionRate: 3600, // 60 seconds at 60fps (1 minute)

            // Car Ant properties
            carAnts: 0,
            maxCarAnts: 0, // Starts locked
            carAntsUnlocked: false,
            carAntUnlockCost: 10000, // Example: High cost to unlock
            carAntCost: 2500,       // Example: High cost per Car Ant
            carAntFoodPerSecond: 5, // Example: Car ants are very efficient
            // Fire Ant properties
            fireAnts: 0,
            maxFireAnts: 0,
            fireAntsUnlocked: false,
            fireAntUnlockCost: 20000,
            fireAntCost: 700,
            fireAntFoodPerSecond: 8
        };
        
        // Map of food tier to food type
        this.foodTierMap = {
            1: IdleAnts.Data.FoodTypes.BASIC,
            2: IdleAnts.Data.FoodTypes.APPLE,
            3: IdleAnts.Data.FoodTypes.COOKIE,
            4: IdleAnts.Data.FoodTypes.MARSHMALLOW,
            5: IdleAnts.Data.FoodTypes.MANGO,
            6: IdleAnts.Data.FoodTypes.HOT_DOG,
            7: IdleAnts.Data.FoodTypes.WATERMELON,
            8: IdleAnts.Data.FoodTypes.DONUT,
            9: IdleAnts.Data.FoodTypes.CAKE
        };
        
        // Food collection rate tracking
        this.foodRateTracking = {
            recentCollections: [], // Array to store recent food collections
            trackingPeriod: 10, // Number of seconds to track for moving average
            actualFoodRate: 0, // Current calculated food collection rate
            lastFoodAmount: this.resources.food, // Last recorded food amount
            lastUpdateTime: Date.now() // Last time the rate was updated
        };
    }
    
    // Get the current food amount
    getFood() {
        return this.resources.food;
    }
    
    // Food resource methods
    addFood(amount, foodType = null) {
        this.resources.food += amount;
        
        // Track this food addition for rate calculation
        this.trackFoodCollection(amount);
        
        // If foodType is provided, notify daily challenge manager
        if (foodType && typeof window !== 'undefined' && 
            window.IdleAnts && window.IdleAnts.game && 
            window.IdleAnts.game.dailyChallengeManager) {
            // Note: The DailyChallengeManager will handle its own food collection tracking
            // We don't need to duplicate the tracking here
        }
    }
    
    // Track food collection for rate calculation
    trackFoodCollection(amount) {
        const now = Date.now();
        
        // Add this collection to the recent collections array
        this.foodRateTracking.recentCollections.push({
            amount: amount,
            timestamp: now
        });
        
        // Remove collections older than the tracking period
        const cutoffTime = now - (this.foodRateTracking.trackingPeriod * 1000);
        this.foodRateTracking.recentCollections = this.foodRateTracking.recentCollections.filter(
            collection => collection.timestamp >= cutoffTime
        );
        
        // Calculate the actual food rate based on recent collections
        this.updateActualFoodRate();
    }
    
    // Calculate the actual food collection rate based on recent collections
    updateActualFoodRate() {
        const now = Date.now();
        
        // If we have no recent collections, use the theoretical rate
        if (this.foodRateTracking.recentCollections.length === 0) {
            this.foodRateTracking.actualFoodRate = this.stats.foodPerSecond;
            return;
        }
        
        // Calculate total food collected in the tracking period
        const totalFood = this.foodRateTracking.recentCollections.reduce(
            (sum, collection) => sum + collection.amount, 0
        );
        
        // Get the oldest timestamp in our tracking window
        const oldestTimestamp = Math.min(
            ...this.foodRateTracking.recentCollections.map(c => c.timestamp)
        );
        
        // Calculate the time period in seconds
        const periodSeconds = (now - oldestTimestamp) / 1000;
        
        // Calculate the rate (food per second)
        if (periodSeconds > 0) {
            // Calculate the rate and apply some smoothing
            const newRate = totalFood / periodSeconds;
            
            // Apply smoothing to avoid jumpy values (80% new, 20% old)
            this.foodRateTracking.actualFoodRate = 
                (newRate * 0.8) + (this.foodRateTracking.actualFoodRate * 0.2);
        }
        
        // Update last update time
        this.foodRateTracking.lastUpdateTime = now;
    }
    
    // Get the actual food collection rate
    getActualFoodRate() {
        // Update the rate if it's been more than 1 second since last update
        const now = Date.now();
        if (now - this.foodRateTracking.lastUpdateTime > 1000) {
            this.updateActualFoodRate();
        }
        
        return this.foodRateTracking.actualFoodRate;
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
    
    // Add complementary method to decrease ant count when an ant dies
    decreaseAntCount() {
        if (this.stats.ants > 0) {
            this.stats.ants--;
            this.updateFoodPerSecond();
        }
    }
    
    // Method to check if an ant can be purchased
    canBuyAnt() {
        return this.canAfford(this.stats.antCost) && 
               this.stats.ants < this.stats.maxAnts;
    }
    
    updateFoodPerSecond() {
        // Regular ants contribute 0.5 food per second, flying ants contribute 2 food per second
        // Car ants contribute based on their stat
        this.stats.foodPerSecond = (this.stats.ants * 0.5) + 
                                   (this.stats.flyingAnts * 2) + 
                                   (this.stats.carAnts * this.stats.carAntFoodPerSecond) +
                                   (this.stats.fireAnts * this.stats.fireAntFoodPerSecond);
    }
    
    increaseMaxAnts(amount) {
        this.stats.maxAnts += amount;
    }
    
    updateAntCost() {
        const oldCost = this.stats.antCost;
        // Gentle incremental increase (≈15 %)
        this.stats.antCost = Math.floor(this.stats.antCost * 1.15);
        // logger.debug(`Ant cost updated: ${oldCost} -> ${this.stats.antCost}`);
    }
    
    updateFoodUpgradeCost() {
        // Previously ×10 ‑ now ×2 for smoother progression
        this.stats.foodUpgradeCost = Math.floor(this.stats.foodUpgradeCost * 2);
    }
    
    updateExpandCost() {
        this.stats.expandCost = Math.floor(this.stats.expandCost * 1.3);
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
        try {
            // Check if the food tier map has the current tier
            if (this.foodTierMap && this.foodTierMap[this.stats.foodTier]) {
                return this.foodTierMap[this.stats.foodTier];
            }
            
            // If the specific tier isn't found, try to get the BASIC food type
            if (IdleAnts.Data && IdleAnts.Data.FoodTypes && IdleAnts.Data.FoodTypes.BASIC) {
                console.warn("Food tier not found, using BASIC food type");
                return IdleAnts.Data.FoodTypes.BASIC;
            }
            
            // Last resort: create a minimal valid food type object
            console.error("No valid food types available, creating fallback");
            return {
                id: 'fallback',
                name: 'Food',
                value: 1,
                weight: 1,
                collectionTime: 0,
                rarity: 1,
                scale: {min: 0.7, max: 1.3},
                color: 0xEAD2AC,
                glowColor: 0xFFFF99,
                glowAlpha: 0.3,
                description: 'Simple food.'
            };
        } catch (error) {
            console.error("Error getting food type:", error);
            // If all else fails, return a minimal valid object
            return {
                id: 'error',
                name: 'Food',
                value: 1,
                scale: {min: 1, max: 1},
                color: 0xFFFFFF,
                glowColor: 0xFFFF99,
                glowAlpha: 0.3
            };
        }
    }
    
    // Check if food can be upgraded further
    canUpgradeFoodTier() {
        return this.stats.foodTier < this.stats.maxFoodTier;
    }
    
    // Method to check if food can be upgraded
    canUpgradeFood() {
        return this.canAfford(this.stats.foodUpgradeCost);
    }
    
    updateSpeedUpgradeCost() {
        this.stats.speedUpgradeCost = Math.floor(this.stats.speedUpgradeCost * 1.25);
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
            const oldCost = this.stats.flyingAntCost;
            this.stats.flyingAntCost = Math.floor(this.stats.flyingAntCost * 1.25);
            // logger.debug(`Flying Ant cost updated: ${oldCost} -> ${this.stats.flyingAntCost}`);
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
        this.stats.strengthUpgradeCost = Math.floor(this.stats.strengthUpgradeCost * 1.2);
    }
    
    upgradeStrengthMultiplier(amount) {
        // Directly increase strength multiplier by the integer amount
        this.stats.strengthMultiplier += amount;
        
        // This value now directly represents:
        // 1. The ants' carrying capacity (how many foods they can carry)
        // 2. Also affects collection time for heavy food types (calculated in Food.js)
    }
    
    canUpgradeStrength() {
        return this.canAfford(this.stats.strengthUpgradeCost);
    }
    
    upgradeStrength() {
        if (this.canUpgradeStrength()) {
            this.spendFood(this.stats.strengthUpgradeCost);
            this.upgradeStrengthMultiplier(1); // Increase strength by 1 per upgrade
            this.updateStrengthUpgradeCost();
            return true;
        }
        return false;
    }
    
    // Autofeeder methods
    canUnlockAutofeeder() {
        return !this.stats.autofeederUnlocked && this.canAfford(this.stats.autofeederCost);
    }
    
    unlockAutofeeder() {
        if (this.canUnlockAutofeeder()) {
            this.spendFood(this.stats.autofeederCost);
            this.stats.autofeederUnlocked = true;
            this.stats.autofeederLevel = 1;
            return true;
        }
        return false;
    }
    
    canUpgradeAutofeeder() {
        return this.stats.autofeederUnlocked && 
               this.stats.autofeederLevel < this.stats.maxAutofeederLevel && 
               this.canAfford(this.stats.autofeederUpgradeCost);
    }
    
    upgradeAutofeeder() {
        if (this.canUpgradeAutofeeder()) {
            this.spendFood(this.stats.autofeederUpgradeCost);
            this.stats.autofeederLevel++;
            this.updateAutofeederUpgradeCost();
            return true;
        }
        return false;
    }
    
    updateAutofeederUpgradeCost() {
        this.stats.autofeederUpgradeCost = Math.floor(this.stats.autofeederUpgradeCost * 1.3);
    }
    
    getAutofeederFoodAmount() {
        // Each level multiplies the amount by 1.2 (reduced from 1.5 for more balanced progression)
        return Math.floor(this.stats.autofeederBaseFoodAmount * Math.pow(1.2, this.stats.autofeederLevel - 1));
    }
    
    updateQueenUpgradeCost() {
        this.stats.queenUpgradeCost = Math.floor(this.stats.queenUpgradeCost * 1.15);
    }
    
    // Queen ant methods
    canUnlockQueen() {
        return !this.stats.queenUnlocked && this.canAfford(this.stats.queenUnlockCost);
    }
    
    unlockQueen() {
        if (!this.canUnlockQueen()) return false;
        
        this.spendFood(this.stats.queenUnlockCost);
        this.stats.queenUnlocked = true;
        this.stats.queenLarvaeCapacity += 1;
        return true;
    }
    
    canBuyQueen() {
        return this.stats.queenUnlocked && 
               !this.stats.hasQueen && 
               this.canAfford(this.stats.queenCost);
    }
    
    buyQueen() {
        if (!this.canBuyQueen()) return false;
        
        this.spendFood(this.stats.queenCost);
        this.stats.hasQueen = true;
        return true;
    }
    
    canUpgradeQueen() {
        return this.stats.hasQueen && 
               this.stats.queenUpgradeLevel < this.stats.maxQueenUpgradeLevel && 
               this.canAfford(this.stats.queenUpgradeCost);
    }
    
    upgradeQueen() {
        if (!this.canUpgradeQueen()) return false;
        
        this.spendFood(this.stats.queenUpgradeCost);
        this.stats.queenUpgradeLevel++;
        
        // Increase larvae capacity by 1 each level
        this.stats.queenLarvaeCapacity += 1;
        // Queen HP will be implemented later
        // logger.debug(`Queen upgraded to level ${this.stats.queenUpgradeLevel}`);
        
        // Update upgrade cost
        this.updateQueenUpgradeCost();
        
        return true;
    }

    // Car Ant Methods
    canUnlockCarAnts() {
        return this.canAfford(this.stats.carAntUnlockCost) && !this.stats.carAntsUnlocked;
    }

    unlockCarAnts() {
        if (this.canUnlockCarAnts()) {
            this.spendFood(this.stats.carAntUnlockCost);
            this.stats.carAntsUnlocked = true;
            this.stats.maxCarAnts = 2; // Unlock a small initial capacity, e.g., 2
            // logger.debug("Car Ants Unlocked!");
            // Potentially update UI or trigger game event here
            return true;
        }
        return false;
    }

    canBuyCarAnt() {
        return this.stats.carAntsUnlocked && 
               this.canAfford(this.stats.carAntCost) && 
               this.stats.carAnts < this.stats.maxCarAnts;
    }

    buyCarAnt() {
        if (this.canBuyCarAnt()) {
            this.spendFood(this.stats.carAntCost);
            this.stats.carAnts++;
            this.updateFoodPerSecond(); // Recalculate food per second
            this.updateCarAntCost();    // Increase cost for the next one
            // logger.debug("Car Ant Purchased! Total Car Ants: " + this.stats.carAnts);
            return true;
        }
        return false;
    }

    updateCarAntCost() {
        this.stats.carAntCost = Math.floor(this.stats.carAntCost * 1.25);
    }

    // Method to expand Car Ant capacity (similar to flying ants)
    canExpandCarAntCapacity() {
        // Define a cost for expanding car ant capacity, e.g., based on current max or a fixed high cost
        // For simplicity, let's use a cost that scales with the number of car ants or a fixed high value
        const expandCarAntCapacityCost = this.stats.maxCarAnts > 0 ? this.stats.carAntCost * (this.stats.maxCarAnts + 1) * 0.5 : 5000;
        return this.stats.carAntsUnlocked && this.canAfford(expandCarAntCapacityCost);
    }

    expandCarAntCapacity() {
        const expandCarAntCapacityCost = this.stats.maxCarAnts > 0 ? this.stats.carAntCost * (this.stats.maxCarAnts + 1) * 0.5 : 5000;
        if (this.canExpandCarAntCapacity()) {
            this.spendFood(expandCarAntCapacityCost);
            this.stats.maxCarAnts += 1; // Increase max by 1 or a fixed amount
            // logger.debug("Car Ant capacity expanded to: " + this.stats.maxCarAnts);
            return true;
        }
        return false;
    }

    // Fire Ant Methods
    canUnlockFireAnts() {
        return this.canAfford(this.stats.fireAntUnlockCost) && !this.stats.fireAntsUnlocked;
    }

    unlockFireAnts() {
        if (this.canUnlockFireAnts()) {
            this.spendFood(this.stats.fireAntUnlockCost);
            this.stats.fireAntsUnlocked = true;
            this.stats.maxFireAnts = 2; // initial capacity
            return true;
        }
        return false;
    }

    canBuyFireAnt() {
        return this.stats.fireAntsUnlocked &&
               this.canAfford(this.stats.fireAntCost) &&
               this.stats.fireAnts < this.stats.maxFireAnts;
    }

    buyFireAnt() {
        if (this.canBuyFireAnt()) {
            this.spendFood(this.stats.fireAntCost);
            this.stats.fireAnts++;
            this.updateFoodPerSecond();
            this.updateFireAntCost();
            return true;
        }
        return false;
    }

    updateFireAntCost() {
        this.stats.fireAntCost = Math.floor(this.stats.fireAntCost * 1.25);
    }

    canExpandFireAntCapacity() {
        const cost = this.stats.maxFireAnts > 0 ? this.stats.fireAntCost * (this.stats.maxFireAnts + 1) * 0.5 : 10000;
        return this.stats.fireAntsUnlocked && this.canAfford(cost);
    }

    expandFireAntCapacity() {
        const cost = this.stats.maxFireAnts > 0 ? this.stats.fireAntCost * (this.stats.maxFireAnts + 1) * 0.5 : 10000;
        if (this.canExpandFireAntCapacity()) {
            this.spendFood(cost);
            this.stats.maxFireAnts += 1;
            return true;
        }
        return false;
    }
} 