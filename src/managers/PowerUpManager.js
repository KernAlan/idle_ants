// src/managers/PowerUpManager.js
IdleAnts.Managers.PowerUpManager = class {
    constructor(game, effectManager, resourceManager) {
        this.game = game;
        this.effectManager = effectManager;
        this.resourceManager = resourceManager;
        this.activePowerUps = [];
        this.powerUpSpawns = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 45000; // 45 seconds base interval
        this.activePowerUpEffects = {};
        this.kidsNotificationManager = null;
        
        this.powerUpTypes = {
            'speed_boost': {
                name: 'Speed Boost',
                description: 'Ants move super fast!',
                duration: 30000, // 30 seconds
                rarity: 0.3,
                effect: this.applySpeedBoost.bind(this)
            },
            'food_rain': {
                name: 'Food Rain',
                description: 'Lots of food appears!',
                duration: 15000, // 15 seconds
                rarity: 0.25,
                effect: this.applyFoodRain.bind(this)
            },
            'double_ants': {
                name: 'Double Ants',
                description: 'Twice the ant power!',
                duration: 45000, // 45 seconds
                rarity: 0.15,
                effect: this.applyDoubleAnts.bind(this)
            },
            'golden_touch': {
                name: 'Golden Touch',
                description: 'Everything is worth more!',
                duration: 60000, // 60 seconds
                rarity: 0.2,
                effect: this.applyGoldenTouch.bind(this)
            },
            'super_strength': {
                name: 'Super Strength',
                description: 'Ants are super strong!',
                duration: 30000, // 30 seconds
                rarity: 0.1,
                effect: this.applySuperStrength.bind(this)
            }
        };
    }
    
    setKidsNotificationManager(kidsNotificationManager) {
        this.kidsNotificationManager = kidsNotificationManager;
    }
    
    update(deltaTime) {
        // Check if it's time to spawn a power-up
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnRandomPowerUp();
            this.lastSpawnTime = currentTime;
            
            // Randomize next spawn time (30-60 seconds)
            this.spawnInterval = Math.random() * 30000 + 30000;
        }
        
        // Update power-up spawn effects
        this.powerUpSpawns = this.powerUpSpawns.filter(spawn => {
            spawn.update(deltaTime);
            return !spawn.isFinished();
        });
        
        // Check for expired power-ups
        this.checkExpiredPowerUps();
    }
    
    spawnRandomPowerUp() {
        // Don't spawn too many power-ups at once
        if (this.powerUpSpawns.length >= 3) {
            return;
        }
        
        // Choose a random power-up type based on rarity
        const powerUpType = this.selectRandomPowerUpType();
        
        // Choose random position in the game world
        const x = Math.random() * this.game.mapConfig.width;
        const y = Math.random() * this.game.mapConfig.height;
        
        // Create power-up spawn effect
        const powerUpEffect = new IdleAnts.Effects.PowerUpEffect(x, y, powerUpType);
        this.powerUpSpawns.push(powerUpEffect);
        
        // Add visual effect to the world
        if (this.effectManager) {
            this.effectManager.addEffect('powerup', x, y, powerUpType);
        }
        
        // Make the power-up clickable
        this.createClickablePowerUp(x, y, powerUpType);
    }
    
    selectRandomPowerUpType() {
        const types = Object.keys(this.powerUpTypes);
        const rarities = types.map(type => this.powerUpTypes[type].rarity);
        
        // Weighted random selection
        const totalRarity = rarities.reduce((sum, rarity) => sum + rarity, 0);
        let random = Math.random() * totalRarity;
        
        for (let i = 0; i < types.length; i++) {
            random -= rarities[i];
            if (random <= 0) {
                return types[i];
            }
        }
        
        return types[0]; // Fallback
    }
    
    createClickablePowerUp(x, y, powerUpType) {
        // Create a clickable area for the power-up
        const powerUpSprite = new PIXI.Graphics();
        powerUpSprite.beginFill(0xFFFFFF, 0.01); // Nearly transparent
        powerUpSprite.drawCircle(0, 0, 40);
        powerUpSprite.endFill();
        powerUpSprite.x = x;
        powerUpSprite.y = y;
        powerUpSprite.interactive = true;
        powerUpSprite.buttonMode = true;
        
        // Add click event
        powerUpSprite.on('pointerdown', () => {
            this.collectPowerUp(powerUpType, x, y);
            this.game.worldContainer.removeChild(powerUpSprite);
        });
        
        this.game.worldContainer.addChild(powerUpSprite);
        
        // Auto-remove after 30 seconds if not collected
        setTimeout(() => {
            if (powerUpSprite.parent) {
                powerUpSprite.parent.removeChild(powerUpSprite);
            }
        }, 30000);
    }
    
    collectPowerUp(powerUpType, x, y) {
        const powerUp = this.powerUpTypes[powerUpType];
        if (!powerUp) return;
        
        // Apply the power-up effect
        this.activatePowerUp(powerUpType);
        
        // Show celebration effect
        if (this.effectManager) {
            this.effectManager.addEffect('celebration', x, y, 'powerup');
        }
        
        // Show notification
        if (this.kidsNotificationManager) {
            this.kidsNotificationManager.showPowerUp(powerUpType);
        }
        
        // Play sound effect
        if (this.game.playSoundEffect) {
            this.game.playSoundEffect('powerup_collect');
        }
    }
    
    activatePowerUp(powerUpType) {
        const powerUp = this.powerUpTypes[powerUpType];
        if (!powerUp) return;
        
        // Apply the effect
        powerUp.effect();
        
        // Track active power-up
        this.activePowerUps.push({
            type: powerUpType,
            startTime: Date.now(),
            duration: powerUp.duration
        });
    }
    
    checkExpiredPowerUps() {
        const currentTime = Date.now();
        
        this.activePowerUps = this.activePowerUps.filter(powerUp => {
            const elapsed = currentTime - powerUp.startTime;
            
            if (elapsed >= powerUp.duration) {
                this.deactivatePowerUp(powerUp.type);
                return false;
            }
            
            return true;
        });
    }
    
    deactivatePowerUp(powerUpType) {
        // Remove power-up effects
        if (this.activePowerUpEffects[powerUpType]) {
            delete this.activePowerUpEffects[powerUpType];
        }
        
        // Reset any modified values
        this.resetPowerUpEffects(powerUpType);
    }
    
    resetPowerUpEffects(powerUpType) {
        // Reset effects based on power-up type
        switch (powerUpType) {
            case 'speed_boost':
                // Speed boost is handled in ant update loops
                break;
            case 'double_ants':
                // Double ants effect is handled in resource calculation
                break;
            case 'golden_touch':
                // Golden touch is handled in food collection
                break;
            case 'super_strength':
                // Super strength is handled in ant carrying capacity
                break;
        }
    }
    
    applySpeedBoost() {
        this.activePowerUpEffects['speed_boost'] = {
            multiplier: 3.0,
            startTime: Date.now()
        };
    }
    
    applyFoodRain() {
        // Spawn lots of food all over the map
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.game.mapConfig.width;
            const y = Math.random() * this.game.mapConfig.height;
            
            // Add food with sparkly effect
            if (this.game.entityManager) {
                this.game.entityManager.spawnFood(x, y, 'random');
            }
            
            // Add sparkle effect
            if (this.effectManager) {
                this.effectManager.addEffect('food_spawn', x, y);
            }
        }
    }
    
    applyDoubleAnts() {
        this.activePowerUpEffects['double_ants'] = {
            multiplier: 2.0,
            startTime: Date.now()
        };
    }
    
    applyGoldenTouch() {
        this.activePowerUpEffects['golden_touch'] = {
            multiplier: 3.0,
            startTime: Date.now()
        };
    }
    
    applySuperStrength() {
        this.activePowerUpEffects['super_strength'] = {
            multiplier: 2.0,
            startTime: Date.now()
        };
    }
    
    // Helper methods for other systems to check active power-ups
    hasActivePowerUp(powerUpType) {
        return this.activePowerUpEffects[powerUpType] !== undefined;
    }
    
    getSpeedMultiplier() {
        return this.activePowerUpEffects['speed_boost']?.multiplier || 1.0;
    }
    
    getAntsMultiplier() {
        return this.activePowerUpEffects['double_ants']?.multiplier || 1.0;
    }
    
    getFoodMultiplier() {
        return this.activePowerUpEffects['golden_touch']?.multiplier || 1.0;
    }
    
    getStrengthMultiplier() {
        return this.activePowerUpEffects['super_strength']?.multiplier || 1.0;
    }
    
    render(graphics) {
        // Render power-up spawn effects
        this.powerUpSpawns.forEach(spawn => {
            spawn.render(graphics);
        });
    }
    
    // Special events for extra excitement
    triggerSpecialEvent() {
        const events = [
            'mega_food_rain',
            'ant_parade',
            'rainbow_boost',
            'treasure_hunt'
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        this.executeSpecialEvent(event);
    }
    
    executeSpecialEvent(eventType) {
        switch (eventType) {
            case 'mega_food_rain':
                // Spawn 50 food items with rainbow effects
                for (let i = 0; i < 50; i++) {
                    setTimeout(() => {
                        const x = Math.random() * this.game.mapConfig.width;
                        const y = Math.random() * this.game.mapConfig.height;
                        if (this.game.entityManager) {
                            this.game.entityManager.spawnFood(x, y, 'random');
                        }
                        if (this.effectManager) {
                            this.effectManager.addEffect('celebration', x, y, 'default');
                        }
                    }, i * 100);
                }
                
                if (this.kidsNotificationManager) {
                    this.kidsNotificationManager.showNotification("🌈 MEGA FOOD RAIN! 🌈", 'achievement', 5000);
                }
                break;
                
            case 'ant_parade':
                // All ants move in formation for fun
                if (this.kidsNotificationManager) {
                    this.kidsNotificationManager.showNotification("🎪 Ant Parade! Look at them go! 🎪", 'milestone', 4000);
                }
                break;
                
            case 'rainbow_boost':
                // Activate multiple power-ups at once
                this.activatePowerUp('speed_boost');
                this.activatePowerUp('golden_touch');
                if (this.kidsNotificationManager) {
                    this.kidsNotificationManager.showNotification("🌈 Rainbow Power! Multiple boosts! 🌈", 'achievement', 5000);
                }
                break;
                
            case 'treasure_hunt':
                // Spawn a special treasure that gives lots of food
                const treasureX = Math.random() * this.game.mapConfig.width;
                const treasureY = Math.random() * this.game.mapConfig.height;
                
                if (this.kidsNotificationManager) {
                    this.kidsNotificationManager.showNotification("🏆 Treasure Hunt! Find the special treasure! 🏆", 'milestone', 6000);
                }
                break;
        }
    }
}