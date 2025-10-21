// src/managers/ResourceManager.js
IdleAnts.Managers.ResourceManager = class {
    constructor() {
        // Log debug status for verification
        
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
            flyingAntsUnlocked: false,  // Flying ants need to be unlocked first
            foodPerClick: 1,
            foodPerSecond: 0,
            antCost: 10,
            flyingAntCost: 75,  // Rebalanced: Better mid-game option for 7-8 min runs (was 100)
            flyingAntUnlockCost: 500,  // Initial cost to unlock flying ants
            foodUpgradeCost: 1000, // Changed from 50 to 1000 as requested
            expandCost: 100,
            foodMultiplier: 1,
            speedUpgradeCost: 75,
            speedMultiplier: 1,
            // New strength-related properties
            strengthUpgradeCost: 150,
            strengthMultiplier: 1, // Now represents the actual carrying capacity
            // Food tier properties
            foodTier: 1,  // Start with basic food (tier 1)
            maxFoodTier: 16, // Now includes all new food types
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
            carAntsUnlocked: false,
            carAntUnlockCost: 10000, // High cost to unlock (mid-late game)
            carAntCost: 800,        // Rebalanced: Viable for 12-15 min runs (was 2500)
            carAntFoodPerSecond: 5, // Efficient but not overpowered
            // Fire Ant properties
            fireAnts: 0,
            fireAntsUnlocked: false,
            fireAntUnlockCost: 20000,
            fireAntCost: 350,  // Rebalanced: Viable for 10-min optimization runs (was 700)
            fireAntFoodPerSecond: 8,
            
            // New Ant Types - Basic Combat
            fatAnts: 0,
            fatAntsUnlocked: false,
            fatAntUnlockCost: 3000,
            fatAntCost: 4000,
            
            gasAnts: 0,
            gasAntsUnlocked: false,
            gasAntUnlockCost: 1500,
            gasAntCost: 2000,
            
            acidAnts: 0,
            acidAntsUnlocked: false,
            acidAntUnlockCost: 2000,
            acidAntCost: 3000,
            
            rainbowAnts: 0,
            rainbowAntsUnlocked: false,
            rainbowAntUnlockCost: 2500,
            rainbowAntCost: 3000,
            
            // New Ant Types - Exploding
            smokeAnts: 0,
            smokeAntsUnlocked: false,
            smokeAntUnlockCost: 1800,
            smokeAntCost: 2000,
            
            electricAnts: 0,
            electricAntsUnlocked: false,
            electricAntUnlockCost: 5000,
            electricAntCost: 7000,
            
            leafCutterAnts: 0,
            leafCutterAntsUnlocked: false,
            leafCutterAntUnlockCost: 6000,
            leafCutterAntCost: 8000,
            
            
            // New Ant Types - Throwing
            bananaThrowingAnts: 0,
            bananaThrowingAntsUnlocked: false,
            bananaThrowingAntUnlockCost: 12000,
            bananaThrowingAntCost: 15000,
            
            juiceAnts: 0,
            juiceAntsUnlocked: false,
            juiceAntUnlockCost: 9000,
            juiceAntCost: 12000,
            
            crabAnts: 0,
            crabAntsUnlocked: false,
            crabAntUnlockCost: 8000,
            crabAntCost: 10000,
            
            // New Ant Types - Special
            
            spiderAnts: 0,
            spiderAntsUnlocked: false,
            spiderAntUnlockCost: 20000,
            spiderAntCost: 25000,
            
            // Other
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
            9: IdleAnts.Data.FoodTypes.CAKE,
            10: IdleAnts.Data.FoodTypes.CANDY_CANE,
            11: IdleAnts.Data.FoodTypes.FRENCH_FRIES_NEW,
            12: IdleAnts.Data.FoodTypes.CHICKEN_NUGGETS_NEW,
            13: IdleAnts.Data.FoodTypes.BROWNIE,
            14: IdleAnts.Data.FoodTypes.COTTON_CANDY,
            15: IdleAnts.Data.FoodTypes.BANANA_POP,
            16: IdleAnts.Data.FoodTypes.CUPCAKE
        };
        
        // Food collection rate tracking
        this.foodRateTracking = {
            recentCollections: [], // Array to store recent food collections
            trackingPeriod: 10, // Number of seconds to track for moving average
            actualFoodRate: 0, // Current calculated food collection rate
            lastFoodAmount: this.resources.food, // Last recorded food amount
            lastUpdateTime: Date.now(), // Last time the rate was updated
            updateInterval: 3000 // Update rate calculation every 3 seconds (in milliseconds)
        };
    }
    
    // Get the current food amount
    getFood() {
        return this.resources.food;
    }
    
    // Food resource methods
    addFood(amount, foodType = null) {
        // Always round food amounts to whole numbers
        const roundedAmount = Math.round(amount);
        this.resources.food += roundedAmount;
        
        // Track this food addition for rate calculation
        this.trackFoodCollection(roundedAmount);
        
        // If foodType is provided, notify daily challenge manager
        if (foodType && typeof window !== 'undefined' && 
            window.IdleAnts && window.IdleAnts.game && 
            window.IdleAnts.game.dailyChallengeManager) {
            // Note: The DailyChallengeManager will handle its own food collection tracking
            // We don't need to duplicate the tracking here
        }
    }
    
    // Add food without affecting the food per second rate tracking (used for challenge rewards)
    addFoodSilent(amount) {
        // Always round food amounts to whole numbers
        const roundedAmount = Math.round(amount);
        this.resources.food += roundedAmount;
        // Note: Intentionally NOT calling trackFoodCollection to avoid affecting rate calculations
    }
    
    // Track food collection for rate calculation
    trackFoodCollection(amount) {
        const now = Date.now();
        
        // Filter out large amounts that are likely from rewards/cheats to avoid rate spikes
        // Only track amounts under 500 to ensure we're measuring actual gameplay collection rates
        if (amount < 500) {
            // Add this collection to the recent collections array
            this.foodRateTracking.recentCollections.push({
                amount: amount,
                timestamp: now
            });
        }
        
        // Remove collections older than the tracking period
        const cutoffTime = now - (this.foodRateTracking.trackingPeriod * 1000);
        this.foodRateTracking.recentCollections = this.foodRateTracking.recentCollections.filter(
            collection => collection.timestamp >= cutoffTime
        );
        
        // Only update the actual food rate every 3 seconds to avoid too frequent updates
        if (now - this.foodRateTracking.lastUpdateTime >= this.foodRateTracking.updateInterval) {
            this.updateActualFoodRate();
        }
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
        this.stats.antCost = Math.floor(this.stats.antCost * 1.1);
    }
    
    updateFoodUpgradeCost() {
        // Previously ×10 ‑ now ×2 for smoother progression
        this.stats.foodUpgradeCost = Math.floor(this.stats.foodUpgradeCost * 1.15);
    }
    
    updateExpandCost() {
        this.stats.expandCost = Math.floor(this.stats.expandCost * 1.15);
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
        this.stats.speedUpgradeCost = Math.floor(this.stats.speedUpgradeCost * 1.15);
    }
    
    upgradeSpeedMultiplier(amount) {
        this.stats.speedMultiplier += amount;
    }
    
    // Flying ant methods
    canUnlockFlyingAnts() {
        return this.canAfford(this.stats.flyingAntUnlockCost) && !this.stats.flyingAntsUnlocked;
    }

    unlockFlyingAnts() {
        // Check if we can afford it and if flying ants aren't already unlocked
        if (this.canUnlockFlyingAnts()) {
            // Deduct the food cost
            this.resources.food -= this.stats.flyingAntUnlockCost;
            
            // Set flying ants as unlocked
            this.stats.flyingAntsUnlocked = true;
            
            
            return true;
        }
        
        return false;
    }
    
    canBuyFlyingAnt() {
        return this.stats.flyingAntsUnlocked && 
               this.canAfford(this.stats.flyingAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }
    
    buyFlyingAnt() {
        if (this.canBuyFlyingAnt()) {
            this.spendFood(this.stats.flyingAntCost);
            this.stats.flyingAnts++;
            this.stats.ants++;
            const oldCost = this.stats.flyingAntCost;
            this.stats.flyingAntCost = Math.floor(this.stats.flyingAntCost * 1.15);
            this.updateFoodPerSecond();
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
        this.stats.autofeederUpgradeCost = Math.floor(this.stats.autofeederUpgradeCost * 1.15);
    }
    
    getAutofeederFoodAmount() {
        // Each level multiplies the amount by 1.2 (reduced from 1.5 for more balanced progression)
        return Math.floor(this.stats.autofeederBaseFoodAmount * Math.pow(1.2, this.stats.autofeederLevel - 1));
    }
    
    updateQueenUpgradeCost() {
        this.stats.queenUpgradeCost = Math.floor(this.stats.queenUpgradeCost * 1.1);
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
        
        // Update queen HP based on new level
        if (IdleAnts.app && IdleAnts.app.entityManager && IdleAnts.app.entityManager.entities.queen) {
            IdleAnts.app.entityManager.entities.queen.updateHPFromLevel();
        }
        
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
            // Potentially update UI or trigger game event here
            return true;
        }
        return false;
    }

    canBuyCarAnt() {
        return this.stats.carAntsUnlocked && 
               this.canAfford(this.stats.carAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buyCarAnt() {
        if (this.canBuyCarAnt()) {
            this.spendFood(this.stats.carAntCost);
            this.stats.carAnts++;
            this.stats.ants++;
            this.updateFoodPerSecond(); // Recalculate food per second
            this.updateCarAntCost();    // Increase cost for the next one
            return true;
        }
        return false;
    }

    updateCarAntCost() {
        this.stats.carAntCost = Math.floor(this.stats.carAntCost * 1.15);
    }


    // Fire Ant Methods
    canUnlockFireAnts() {
        return this.canAfford(this.stats.fireAntUnlockCost) && !this.stats.fireAntsUnlocked;
    }

    unlockFireAnts() {
        if (this.canUnlockFireAnts()) {
            this.spendFood(this.stats.fireAntUnlockCost);
            this.stats.fireAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuyFireAnt() {
        return this.stats.fireAntsUnlocked &&
               this.canAfford(this.stats.fireAntCost) &&
               this.stats.ants < this.stats.maxAnts;
    }

    buyFireAnt() {
        if (this.canBuyFireAnt()) {
            this.spendFood(this.stats.fireAntCost);
            this.stats.fireAnts++;
            this.stats.ants++;
            this.updateFoodPerSecond();
            this.updateFireAntCost();
            return true;
        }
        return false;
    }

    updateFireAntCost() {
        this.stats.fireAntCost = Math.floor(this.stats.fireAntCost * 1.15);
    }


    // ===============================================
    // NEW ANT TYPES PURCHASE METHODS
    // ===============================================

    // Fat Ant Methods
    canUnlockFatAnts() {
        return this.canAfford(this.stats.fatAntUnlockCost) && !this.stats.fatAntsUnlocked;
    }

    unlockFatAnts() {
        if (this.canUnlockFatAnts()) {
            this.spendFood(this.stats.fatAntUnlockCost);
            this.stats.fatAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuyFatAnt() {
        return this.stats.fatAntsUnlocked && 
               this.canAfford(this.stats.fatAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buyFatAnt() {
        if (this.canBuyFatAnt()) {
            this.spendFood(this.stats.fatAntCost);
            this.stats.fatAnts++;
            this.stats.ants++;
            this.stats.fatAntCost = Math.floor(this.stats.fatAntCost * 1.15);
            return true;
        }
        return false;
    }

    // Gas Ant Methods
    canUnlockGasAnts() {
        return this.canAfford(this.stats.gasAntUnlockCost) && !this.stats.gasAntsUnlocked;
    }

    unlockGasAnts() {
        if (this.canUnlockGasAnts()) {
            this.spendFood(this.stats.gasAntUnlockCost);
            this.stats.gasAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuyGasAnt() {
        return this.stats.gasAntsUnlocked && 
               this.canAfford(this.stats.gasAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buyGasAnt() {
        if (this.canBuyGasAnt()) {
            this.spendFood(this.stats.gasAntCost);
            this.stats.gasAnts++;
            this.stats.ants++;
            this.stats.gasAntCost = Math.floor(this.stats.gasAntCost * 1.15);
            return true;
        }
        return false;
    }

    // Acid Ant Methods
    canUnlockAcidAnts() {
        return this.canAfford(this.stats.acidAntUnlockCost) && !this.stats.acidAntsUnlocked;
    }

    unlockAcidAnts() {
        if (this.canUnlockAcidAnts()) {
            this.spendFood(this.stats.acidAntUnlockCost);
            this.stats.acidAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuyAcidAnt() {
        return this.stats.acidAntsUnlocked && 
               this.canAfford(this.stats.acidAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buyAcidAnt() {
        if (this.canBuyAcidAnt()) {
            this.spendFood(this.stats.acidAntCost);
            this.stats.acidAnts++;
            this.stats.ants++;
            this.stats.acidAntCost = Math.floor(this.stats.acidAntCost * 1.15);
            return true;
        }
        return false;
    }

    // Rainbow Ant Methods
    canUnlockRainbowAnts() {
        return this.canAfford(this.stats.rainbowAntUnlockCost) && !this.stats.rainbowAntsUnlocked;
    }

    unlockRainbowAnts() {
        if (this.canUnlockRainbowAnts()) {
            this.spendFood(this.stats.rainbowAntUnlockCost);
            this.stats.rainbowAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuyRainbowAnt() {
        return this.stats.rainbowAntsUnlocked && 
               this.canAfford(this.stats.rainbowAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buyRainbowAnt() {
        if (this.canBuyRainbowAnt()) {
            this.spendFood(this.stats.rainbowAntCost);
            this.stats.rainbowAnts++;
            this.stats.ants++;
            this.stats.rainbowAntCost = Math.floor(this.stats.rainbowAntCost * 1.15);
            return true;
        }
        return false;
    }

    // Smoke Ant Methods
    canUnlockSmokeAnts() {
        return this.canAfford(this.stats.smokeAntUnlockCost) && !this.stats.smokeAntsUnlocked;
    }

    unlockSmokeAnts() {
        if (this.canUnlockSmokeAnts()) {
            this.spendFood(this.stats.smokeAntUnlockCost);
            this.stats.smokeAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuySmokeAnt() {
        return this.stats.smokeAntsUnlocked && 
               this.canAfford(this.stats.smokeAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buySmokeAnt() {
        if (this.canBuySmokeAnt()) {
            this.spendFood(this.stats.smokeAntCost);
            this.stats.smokeAnts++;
            this.stats.ants++;
            this.stats.smokeAntCost = Math.floor(this.stats.smokeAntCost * 1.15);
            return true;
        }
        return false;
    }

    // Electric Ant Methods
    canUnlockElectricAnts() {
        return this.canAfford(this.stats.electricAntUnlockCost) && !this.stats.electricAntsUnlocked;
    }

    unlockElectricAnts() {
        if (this.canUnlockElectricAnts()) {
            this.spendFood(this.stats.electricAntUnlockCost);
            this.stats.electricAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuyElectricAnt() {
        return this.stats.electricAntsUnlocked && 
               this.canAfford(this.stats.electricAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buyElectricAnt() {
        if (this.canBuyElectricAnt()) {
            this.spendFood(this.stats.electricAntCost);
            this.stats.electricAnts++;
            this.stats.ants++;
            this.stats.electricAntCost = Math.floor(this.stats.electricAntCost * 1.15);
            return true;
        }
        return false;
    }

    // Leaf Cutter Ant Methods
    canUnlockLeafCutterAnts() {
        return this.canAfford(this.stats.leafCutterAntUnlockCost) && !this.stats.leafCutterAntsUnlocked;
    }

    unlockLeafCutterAnts() {
        if (this.canUnlockLeafCutterAnts()) {
            this.spendFood(this.stats.leafCutterAntUnlockCost);
            this.stats.leafCutterAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuyLeafCutterAnt() {
        return this.stats.leafCutterAntsUnlocked && 
               this.canAfford(this.stats.leafCutterAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buyLeafCutterAnt() {
        if (this.canBuyLeafCutterAnt()) {
            this.spendFood(this.stats.leafCutterAntCost);
            this.stats.leafCutterAnts++;
            this.stats.ants++;
            this.stats.leafCutterAntCost = Math.floor(this.stats.leafCutterAntCost * 1.15);
            return true;
        }
        return false;
    }


    // Banana Throwing Ant Methods
    canUnlockBananaThrowingAnts() {
        return this.canAfford(this.stats.bananaThrowingAntUnlockCost) && !this.stats.bananaThrowingAntsUnlocked;
    }

    unlockBananaThrowingAnts() {
        if (this.canUnlockBananaThrowingAnts()) {
            this.spendFood(this.stats.bananaThrowingAntUnlockCost);
            this.stats.bananaThrowingAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuyBananaThrowingAnt() {
        return this.stats.bananaThrowingAntsUnlocked && 
               this.canAfford(this.stats.bananaThrowingAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buyBananaThrowingAnt() {
        if (this.canBuyBananaThrowingAnt()) {
            this.spendFood(this.stats.bananaThrowingAntCost);
            this.stats.bananaThrowingAnts++;
            this.stats.ants++;
            this.stats.bananaThrowingAntCost = Math.floor(this.stats.bananaThrowingAntCost * 1.15);
            return true;
        }
        return false;
    }

    // Juice Ant Methods
    canUnlockJuiceAnts() {
        return this.canAfford(this.stats.juiceAntUnlockCost) && !this.stats.juiceAntsUnlocked;
    }

    unlockJuiceAnts() {
        if (this.canUnlockJuiceAnts()) {
            this.spendFood(this.stats.juiceAntUnlockCost);
            this.stats.juiceAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuyJuiceAnt() {
        return this.stats.juiceAntsUnlocked && 
               this.canAfford(this.stats.juiceAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buyJuiceAnt() {
        if (this.canBuyJuiceAnt()) {
            this.spendFood(this.stats.juiceAntCost);
            this.stats.juiceAnts++;
            this.stats.ants++;
            this.stats.juiceAntCost = Math.floor(this.stats.juiceAntCost * 1.15);
            return true;
        }
        return false;
    }

    // Crab Ant Methods
    canUnlockCrabAnts() {
        return this.canAfford(this.stats.crabAntUnlockCost) && !this.stats.crabAntsUnlocked;
    }

    unlockCrabAnts() {
        if (this.canUnlockCrabAnts()) {
            this.spendFood(this.stats.crabAntUnlockCost);
            this.stats.crabAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuyCrabAnt() {
        return this.stats.crabAntsUnlocked && 
               this.canAfford(this.stats.crabAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buyCrabAnt() {
        if (this.canBuyCrabAnt()) {
            this.spendFood(this.stats.crabAntCost);
            this.stats.crabAnts++;
            this.stats.ants++;
            this.stats.crabAntCost = Math.floor(this.stats.crabAntCost * 1.15);
            return true;
        }
        return false;
    }



    // Spider Ant Methods
    canUnlockSpiderAnts() {
        return this.canAfford(this.stats.spiderAntUnlockCost) && !this.stats.spiderAntsUnlocked;
    }

    unlockSpiderAnts() {
        if (this.canUnlockSpiderAnts()) {
            this.spendFood(this.stats.spiderAntUnlockCost);
            this.stats.spiderAntsUnlocked = true;
            return true;
        }
        return false;
    }

    canBuySpiderAnt() {
        return this.stats.spiderAntsUnlocked && 
               this.canAfford(this.stats.spiderAntCost) && 
               this.stats.ants < this.stats.maxAnts;
    }

    buySpiderAnt() {
        if (this.canBuySpiderAnt()) {
            this.spendFood(this.stats.spiderAntCost);
            this.stats.spiderAnts++;
            this.stats.ants++;
            this.stats.spiderAntCost = Math.floor(this.stats.spiderAntCost * 1.15);
            return true;
        }
        return false;
    }

    
    resetToDefaults() {
        // Reset resources
        this.resources = {
            food: IdleAnts.Config.debug ? 1000000 : 0,
            displayFood: IdleAnts.Config.debug ? 1000000 : 0
        };
        
        // Reset stats to initial values
        this.stats = {
            ants: 1,
            maxAnts: 10,
            flyingAnts: 0,
            maxFlyingAnts: 0,
            flyingAntsUnlocked: false,
            foodPerClick: 1,
            foodPerSecond: 0,
            antCost: 10,
            flyingAntCost: 100,
            flyingAntUnlockCost: 500,
            foodUpgradeCost: 1000,
            expandCost: 100,
            foodMultiplier: 1,
            speedUpgradeCost: 75,
            speedMultiplier: 1,
            strengthUpgradeCost: 150,
            strengthMultiplier: 1,
            foodTier: 1,
            maxFoodTier: 16,
            autofeederUnlocked: false,
            autofeederLevel: 0,
            maxAutofeederLevel: 10,
            autofeederCost: 500,
            autofeederUpgradeCost: 500,
            autofeederBaseFoodAmount: 10,
            autofeederInterval: 600,
            queenUnlocked: true,
            hasQueen: true,
            queenUnlockCost: 1000,
            queenCost: 2000,
            queenUpgradeLevel: 0,
            maxQueenUpgradeLevel: 5,
            queenUpgradeCost: 2000,
            queenLarvaeCapacity: 1,
            queenLarvaeRate: 60,
            carAntsUnlocked: false,
            carAnts: 0,
            maxCarAnts: 0,
            carAntCost: 2500,
            carAntUnlockCost: 10000,
            fireAntsUnlocked: false,
            fireAnts: 0,
            fireAntCost: 5000,
            fireAntUnlockCost: 20000
        };
        
        // Reset tracking arrays
        this.foodGainHistory = [];
        this.lastFoodUpdate = Date.now();
        
    }
} 