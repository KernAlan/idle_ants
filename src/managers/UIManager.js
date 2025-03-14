// src/managers/UIManager.js
IdleAnts.Managers.UIManager = class {
    constructor(resourceManager, game, effectManager) {
        this.resourceManager = resourceManager;
        this.game = game;
        this.effectManager = effectManager;
        
        // Set up UI button click events
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add null checks to all event listeners
        const addSafeClickListener = (id, callback) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', callback);
            } else {
                console.warn(`UIManager: Element with id '${id}' not found for event listener`);
            }
        };
        
        // Main buttons
        addSafeClickListener('buy-ant', () => this.game.buyAnt());
        addSafeClickListener('upgrade-food', () => this.game.upgradeFood());
        addSafeClickListener('upgrade-speed', () => this.game.upgradeSpeed());
        addSafeClickListener('upgrade-strength', () => this.game.upgradeStrength());
        addSafeClickListener('expand-colony', () => this.game.expandColony());
        
        // Flying ant buttons
        addSafeClickListener('unlock-flying-ants', () => this.game.unlockFlyingAnts());
        addSafeClickListener('buy-flying-ant', () => this.game.buyFlyingAnt());
        addSafeClickListener('expand-flying-ants', () => this.game.expandFlyingAntCapacity());
    }
    
    updateUI() {
        // Helper function to safely update element text content
        const updateElementText = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };
        
        try {
            // Update ant counts
            updateElementText('ant-count', this.resourceManager.stats.ants);
            updateElementText('ant-max', this.resourceManager.stats.maxAnts);
            updateElementText('flying-ant-count', this.resourceManager.stats.flyingAnts);
            updateElementText('flying-ant-max', this.resourceManager.stats.maxFlyingAnts);
            
            // Update costs
            updateElementText('ant-cost', this.resourceManager.stats.antCost);
            updateElementText('food-upgrade-cost', this.resourceManager.stats.foodUpgradeCost);
            updateElementText('speed-upgrade-cost', this.resourceManager.stats.speedUpgradeCost);
            updateElementText('strength-upgrade-cost', this.resourceManager.stats.strengthUpgradeCost);
            updateElementText('expand-cost', this.resourceManager.stats.expandCost);
            updateElementText('flying-ant-unlock-cost', this.resourceManager.stats.flyingAntUnlockCost);
            updateElementText('flying-ant-cost', this.resourceManager.stats.flyingAntCost);
            updateElementText('expand-flying-cost', Math.floor(this.resourceManager.stats.expandCost * 1.5));
            
            // Update food per second
            updateElementText('food-per-second', this.resourceManager.stats.foodPerSecond.toFixed(1));
            
            // Update the upgrade food button text based on current food tier
            const upgradeButton = document.getElementById('upgrade-food');
            const currentFoodType = this.resourceManager.getCurrentFoodType();
            
            if (upgradeButton) {
                if (!this.resourceManager.canUpgradeFoodTier()) {
                    // At max tier, update button text to show that it's maxed out
                    upgradeButton.innerHTML = `<i class="fas fa-arrow-up"></i> Food Upgraded (Max)`;
                } else {
                    // Show the cost to upgrade to the next tier
                    upgradeButton.innerHTML = `<i class="fas fa-arrow-up"></i> Upgrade Food (<span id="food-upgrade-cost">${this.resourceManager.stats.foodUpgradeCost}</span> food)`;
                }
            }
            
            // Display current food type and strength bonus
            const foodPerClickEl = document.getElementById('food-rate');
            if (foodPerClickEl) {
                const strengthValue = this.resourceManager.stats.strengthMultiplier;
                const collectionSpeedBonus = Math.min(75, Math.round((strengthValue - 1) * 25));
                
                foodPerClickEl.innerHTML = `Per Second: <span id="food-per-second">${this.resourceManager.stats.foodPerSecond.toFixed(1)}</span> | ` + 
                                         `Food Type: ${currentFoodType.name} | ` +
                                         `Ant Strength: ${strengthValue} | ` +
                                         `Collection Speed: +${collectionSpeedBonus}%`;
            }
            
            // Update the strength button tooltip with current bonus
            const strengthButton = document.getElementById('upgrade-strength');
            if (strengthButton) {
                const strengthValue = this.resourceManager.stats.strengthMultiplier;
                const collectionSpeedBonus = Math.min(75, Math.round((strengthValue - 1) * 25));
                strengthButton.title = `Increases ant strength to carry more food items and reduces collection time for heavy food. Current strength: ${strengthValue}, speed bonus: -${collectionSpeedBonus}% collection time`;
            }
            
            // Enable/disable buttons based on resources
            this.updateButtonStates();
            
        } catch (error) {
            console.error("Error in UIManager.updateUI:", error);
        }
    }
    
    // New method to handle button states separately
    updateButtonStates() {
        // Helper function to safely update button disabled state
        const updateButtonState = (id, shouldBeDisabled) => {
            const button = document.getElementById(id);
            if (button) {
                button.disabled = shouldBeDisabled;
            }
        };
        
        // Main buttons
        updateButtonState('buy-ant', 
            this.resourceManager.resources.food < this.resourceManager.stats.antCost || 
            this.resourceManager.stats.ants >= this.resourceManager.stats.maxAnts);
            
        updateButtonState('upgrade-food',
            this.resourceManager.resources.food < this.resourceManager.stats.foodUpgradeCost ||
            !this.resourceManager.canUpgradeFoodTier());
            
        updateButtonState('upgrade-speed',
            this.resourceManager.resources.food < this.resourceManager.stats.speedUpgradeCost);
            
        updateButtonState('upgrade-strength',
            this.resourceManager.resources.food < this.resourceManager.stats.strengthUpgradeCost);
            
        updateButtonState('expand-colony',
            this.resourceManager.resources.food < this.resourceManager.stats.expandCost);
        
        // Flying ant buttons
        const unlockButton = document.getElementById('unlock-flying-ants');
        const buyFlyingAntButton = document.getElementById('buy-flying-ant');
        const expandFlyingAntsButton = document.getElementById('expand-flying-ants');
        const flyingAntStats = document.getElementById('flying-ant-stats');
        
        // Update unlock button state
        if (unlockButton) {
            unlockButton.disabled = 
                this.resourceManager.resources.food < this.resourceManager.stats.flyingAntUnlockCost || 
                this.resourceManager.stats.flyingAntsUnlocked;
                
            // Hide unlock button if already unlocked
            if (this.resourceManager.stats.flyingAntsUnlocked) {
                unlockButton.classList.add('hidden');
                
                // Ensure flying ant elements are visible
                if (buyFlyingAntButton) buyFlyingAntButton.classList.remove('hidden');
                if (flyingAntStats) flyingAntStats.classList.remove('hidden');
                if (expandFlyingAntsButton) expandFlyingAntsButton.classList.remove('hidden');
            }
        }
        
        // Update buy flying ant button state
        if (buyFlyingAntButton) {
            buyFlyingAntButton.disabled = 
                !this.resourceManager.stats.flyingAntsUnlocked || 
                this.resourceManager.resources.food < this.resourceManager.stats.flyingAntCost || 
                this.resourceManager.stats.flyingAnts >= this.resourceManager.stats.maxFlyingAnts;
        }
        
        // Update expand flying ants button state
        if (expandFlyingAntsButton) {
            expandFlyingAntsButton.disabled = 
                !this.resourceManager.stats.flyingAntsUnlocked || 
                this.resourceManager.resources.food < Math.floor(this.resourceManager.stats.expandCost * 1.5);
        }
    }
    
    animateCounters() {
        try {
            // Smoothly animate the food counter
            const diff = this.resourceManager.resources.food - this.resourceManager.resources.displayFood;
            
            if (Math.abs(diff) > 0.01) {
                this.resourceManager.resources.displayFood += diff * 0.1;
                const foodCountElement = document.getElementById('food-count');
                if (foodCountElement) {
                    foodCountElement.textContent = Math.floor(this.resourceManager.resources.displayFood);
                }
            } else {
                this.resourceManager.resources.displayFood = this.resourceManager.resources.food;
                const foodCountElement = document.getElementById('food-count');
                if (foodCountElement) {
                    foodCountElement.textContent = Math.floor(this.resourceManager.resources.food);
                }
            }
        } catch (error) {
            console.error("Error in UIManager.animateCounters:", error);
        }
    }
    
    showUpgradeEffect(buttonId, message) {
        try {
            // Find the button element
            const button = document.getElementById(buttonId);
            if (!button) {
                console.warn(`UIManager: Button with id '${buttonId}' not found for upgrade effect`);
                return;
            }
            
            // Get button position
            const buttonRect = button.getBoundingClientRect();
            
            // Create a floating message
            const messageEl = document.createElement('div');
            messageEl.className = 'upgrade-message';
            messageEl.textContent = message;
            
            // Position near the button
            messageEl.style.position = 'absolute';
            messageEl.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
            messageEl.style.top = `${buttonRect.top - 10}px`;
            messageEl.style.transform = 'translate(-50%, -100%)';
            messageEl.style.backgroundColor = 'rgba(255, 215, 0, 0.9)';
            messageEl.style.color = '#333';
            messageEl.style.padding = '5px 10px';
            messageEl.style.borderRadius = '20px';
            messageEl.style.fontWeight = 'bold';
            messageEl.style.zIndex = '100';
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'all 0.5s ease';
            
            document.body.appendChild(messageEl);
            
            // Animate the message
            setTimeout(() => {
                messageEl.style.opacity = '1';
                messageEl.style.top = `${buttonRect.top - 30}px`;
            }, 10);
            
            // Remove after animation
            setTimeout(() => {
                messageEl.style.opacity = '0';
                messageEl.style.top = `${buttonRect.top - 50}px`;
                
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        document.body.removeChild(messageEl);
                    }
                }, 500);
            }, 1500);
            
            // Add a flash effect to the button
            button.style.backgroundColor = '#FFD700';
            button.style.transform = 'scale(1.05)';
            
            setTimeout(() => {
                button.style.backgroundColor = '';
                button.style.transform = '';
            }, 300);
        } catch (error) {
            console.error("Error in UIManager.showUpgradeEffect:", error);
        }
    }
} 