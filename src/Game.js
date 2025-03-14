// src/Game.js
IdleAnts.Game = class {
    constructor() {
        // Make app accessible globally for components that need it
        IdleAnts.app = this;
        
        // Create the PIXI application
        this.app = new PIXI.Application({
            background: '#78AB46', // Grass green background
            resizeTo: document.getElementById('game-canvas-container'),
        });
        document.getElementById('game-canvas-container').appendChild(this.app.view);
        
        // Initialize managers
        this.resourceManager = new IdleAnts.Managers.ResourceManager();
        this.assetManager = new IdleAnts.Managers.AssetManager(this.app);
        
        // Load assets before initializing other managers
        this.assetManager.loadAssets().then(() => {
            this.backgroundManager = new IdleAnts.Managers.BackgroundManager(this.app, this.assetManager);
            this.entityManager = new IdleAnts.Managers.EntityManager(this.app, this.assetManager, this.resourceManager);
            this.effectManager = new IdleAnts.Managers.EffectManager(this.app);
            
            // Set up effect manager reference
            this.entityManager.setEffectManager(this.effectManager);
            
            // UI Manager needs access to the game for buttons
            this.uiManager = new IdleAnts.Managers.UIManager(this.resourceManager, this, this.effectManager);
            
            this.setupGame();
            this.setupEventListeners();
            this.startGameLoop();
        });
    }
    
    setupGame() {
        // Set up the background
        this.backgroundManager.createBackground();
        
        // Set up game entities
        this.entityManager.setupEntities();
        
        // Initialize ant attributes
        this.entityManager.updateAntsSpeed();
        this.entityManager.updateAntsCapacity();
    }
    
    setupEventListeners() {
        // Set up canvas click for manual food placement
        this.app.view.addEventListener('click', (e) => {
            const rect = this.app.view.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Get the current food type based on food tier
            const currentFoodType = this.resourceManager.getCurrentFoodType();
            
            // Place food at the clicked location with the appropriate food type
            this.entityManager.addFood({ x, y, clickPlaced: true }, currentFoodType);
            this.uiManager.updateUI();
        });
        
        // Create and track hover effect
        this.hoverIndicator = new PIXI.Graphics();
        this.app.stage.addChild(this.hoverIndicator);
        
        // Track mouse movement for hover effect
        this.app.view.addEventListener('mousemove', (e) => {
            const rect = this.app.view.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.updateHoverIndicator(x, y);
        });
        
        // Remove hover effect when mouse leaves the canvas
        this.app.view.addEventListener('mouseleave', () => {
            this.hoverIndicator.clear();
        });
    }
    
    updateHoverIndicator(x, y) {
        // Clear previous drawing
        this.hoverIndicator.clear();
        
        // Get the current food type
        const currentFoodType = this.resourceManager.getCurrentFoodType();
        
        // Draw a subtle circular indicator where food would be placed
        this.hoverIndicator.lineStyle(1, 0xFFFFFF, 0.5);
        this.hoverIndicator.drawCircle(x, y, 15);
        this.hoverIndicator.endFill();
        
        // Add a pulsing inner circle using the food type's glow color
        const pulse = 0.5 + Math.sin(performance.now() / 200) * 0.3;
        this.hoverIndicator.lineStyle(1, currentFoodType.glowColor, pulse);
        this.hoverIndicator.drawCircle(x, y, 8);
        
        // Add a small dot at the center with the food type's color
        this.hoverIndicator.beginFill(currentFoodType.color, 0.7);
        this.hoverIndicator.drawCircle(x, y, 2);
        this.hoverIndicator.endFill();
    }
    
    startGameLoop() {
        // Ensure DOM is fully loaded before starting UI updates
        const ensureDOMLoaded = () => {
            if (document.readyState === 'loading') {
                // If the document is still loading, wait for it to finish
                document.addEventListener('DOMContentLoaded', () => {
                    console.log("DOM fully loaded, initializing game UI");
                    this.initializeGameUI();
                });
            } else {
                // DOM is already loaded, initialize UI immediately
                console.log("DOM already loaded, initializing game UI");
                this.initializeGameUI();
            }
        };
        
        // New method to handle UI initialization
        this.initializeGameUI = () => {
            // Update UI initially
            try {
                this.uiManager.updateUI();
            } catch (error) {
                console.error("Error initializing UI:", error);
            }
            
            // Start ticker
            this.app.ticker.add(() => this.gameLoop());
            
            // Set up idle resource generation
            setInterval(() => {
                this.resourceManager.addFood(this.resourceManager.stats.foodPerSecond);
                try {
                    this.uiManager.updateUI();
                } catch (error) {
                    console.error("Error updating UI in interval:", error);
                }
            }, 1000);
        };
        
        // Start the initialization process
        ensureDOMLoaded();
    }
    
    gameLoop() {
        // Smooth counter animations
        this.uiManager.animateCounters();
        
        // Move ants and update entities
        this.entityManager.update();
    }
    
    buyAnt() {
        const antCost = this.resourceManager.stats.antCost;
        if (this.resourceManager.canAfford(antCost) && 
            this.resourceManager.stats.ants < this.resourceManager.stats.maxAnts) {
            this.resourceManager.spendFood(antCost);
            this.resourceManager.stats.ants += 1;
            this.resourceManager.updateFoodPerSecond();
            this.resourceManager.stats.antCost = Math.floor(this.resourceManager.stats.antCost * 1.5);
            
            this.entityManager.createAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-ant', 'New ant added!');
        }
    }
    
    unlockFlyingAnts() {
        console.log("Game: unlockFlyingAnts called");
        
        // Try to unlock flying ants through the resource manager
        const success = this.resourceManager.unlockFlyingAnts();
        
        if (success) {
            console.log("Game: Flying ants unlocked successfully");
            
            // Update the UI
            this.uiManager.updateUI();
            
            // Show success effect
            this.uiManager.showUpgradeEffect('unlock-flying-ants', 'Flying ants unlocked!');
            
            // Show the previously hidden flying ant buttons
            const buyButton = document.getElementById('buy-flying-ant');
            const statsDisplay = document.getElementById('flying-ant-stats');
            const expandButton = document.getElementById('expand-flying-ants');
            
            console.log("UI Elements:", { 
                buyButton: buyButton, 
                statsDisplay: statsDisplay, 
                expandButton: expandButton 
            });
            
            if (buyButton) buyButton.classList.remove('hidden');
            if (statsDisplay) statsDisplay.classList.remove('hidden');
            if (expandButton) expandButton.classList.remove('hidden');
        } else {
            console.log("Game: Failed to unlock flying ants");
        }
        
        return success;
    }
    
    buyFlyingAnt() {
        if (this.resourceManager.buyFlyingAnt()) {
            this.entityManager.createFlyingAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-flying-ant', 'Flying ant added!');
        }
    }
    
    expandFlyingAntCapacity() {
        if (this.resourceManager.expandFlyingAntCapacity()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('expand-flying-ants', 'Flying ant capacity expanded!');
        }
    }
    
    upgradeFood() {
        const upgradeCost = this.resourceManager.stats.foodUpgradeCost;
        if (this.resourceManager.canAfford(upgradeCost)) {
            this.resourceManager.spendFood(upgradeCost);
            
            // Upgrade the food multiplier and per-click value
            this.resourceManager.stats.foodMultiplier += 0.5;
            this.resourceManager.stats.foodPerClick = Math.ceil(this.resourceManager.stats.foodPerClick * 1.5);
            this.resourceManager.stats.foodUpgradeCost = Math.floor(this.resourceManager.stats.foodUpgradeCost * 2);
            
            // Try to upgrade the food tier
            const tierUpgraded = this.resourceManager.upgradeFoodTier();
            
            // Update the UI
            this.uiManager.updateUI();
            
            // Show appropriate message based on whether tier was upgraded
            if (tierUpgraded) {
                const newFoodType = this.resourceManager.getCurrentFoodType();
                this.uiManager.showUpgradeEffect('upgrade-food', `Upgraded to ${newFoodType.name}s!`);
            } else {
                this.uiManager.showUpgradeEffect('upgrade-food', 'Food collection upgraded!');
            }
        }
    }
    
    expandColony() {
        const expandCost = this.resourceManager.stats.expandCost;
        if (this.resourceManager.canAfford(expandCost)) {
            this.resourceManager.spendFood(expandCost);
            this.resourceManager.stats.maxAnts += 5;
            this.resourceManager.stats.expandCost = Math.floor(this.resourceManager.stats.expandCost * 2);
            
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('expand-colony', 'Colony expanded!');
            
            // Visual effect - make the nest larger
            this.entityManager.expandNest();
        }
    }
    
    upgradeSpeed() {
        const speedUpgradeCost = this.resourceManager.stats.speedUpgradeCost;
        if (this.resourceManager.canAfford(speedUpgradeCost)) {
            this.resourceManager.spendFood(speedUpgradeCost);
            this.resourceManager.upgradeSpeedMultiplier(0.2); // Increase speed by 20% per upgrade
            this.resourceManager.updateSpeedUpgradeCost();
            
            // Update all ants with the new speed multiplier
            this.entityManager.updateAntsSpeed();
            
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('upgrade-speed', 'Ants move faster!');
        }
    }
    
    upgradeStrength() {
        const strengthUpgradeCost = this.resourceManager.stats.strengthUpgradeCost;
        if (this.resourceManager.canAfford(strengthUpgradeCost)) {
            this.resourceManager.spendFood(strengthUpgradeCost);
            this.resourceManager.upgradeStrengthMultiplier(0.2); // Increase strength by 20% per upgrade
            this.resourceManager.updateStrengthUpgradeCost();
            
            // Update all ants with the new capacity
            this.entityManager.updateAntsCapacity();
            
            this.uiManager.updateUI();
            
            // Calculate the current reduction percentage
            const strengthMultiplier = this.resourceManager.stats.strengthMultiplier;
            const reductionPercentage = Math.min(75, Math.round((strengthMultiplier - 1) * 25));
            
            // Update message to reflect both benefits of strength upgrade
            this.uiManager.showUpgradeEffect('upgrade-strength', 
                `Ants can carry more food and collect ${reductionPercentage}% faster!`);
        }
    }
}; 