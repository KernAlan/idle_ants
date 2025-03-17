// src/managers/UIManager.js
IdleAnts.Managers.UIManager = class {
    constructor(resourceManager, game, effectManager) {
        this.resourceManager = resourceManager;
        this.game = game;
        this.effectManager = effectManager;
        
        // Set up UI button click events
        this.setupEventListeners();
        
        // Initialize UI state
        this.isUICollapsed = false;
        
        // Show debug indicator if in debug mode
        this.updateDebugIndicator();
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
        
        // UI toggle button
        addSafeClickListener('ui-toggle', () => this.toggleUI());
        
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
        
        // Queen ant buttons
        addSafeClickListener('unlock-queen', () => this.game.unlockQueen());
        addSafeClickListener('buy-queen', () => this.game.buyQueen());
        addSafeClickListener('upgrade-queen', () => this.game.upgradeQueen());
        
        // Autofeeder buttons
        addSafeClickListener('unlock-autofeeder', () => this.game.unlockAutofeeder());
        addSafeClickListener('upgrade-autofeeder', () => this.game.upgradeAutofeeder());
    }
    
    // Add UI toggle functionality
    toggleUI() {
        const gameContainer = document.getElementById('game-container');
        const toggleButton = document.getElementById('ui-toggle');
        
        if (gameContainer && toggleButton) {
            this.isUICollapsed = !this.isUICollapsed;
            
            if (this.isUICollapsed) {
                gameContainer.classList.add('ui-collapsed');
                toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
                toggleButton.title = "Expand UI";
            } else {
                gameContainer.classList.remove('ui-collapsed');
                toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
                toggleButton.title = "Collapse UI";
            }
        }
    }
    
    updateDebugIndicator() {
        const debugIndicator = document.getElementById('debug-indicator');
        const debugConsole = document.getElementById('debug-console');
        
        if (debugIndicator) {
            debugIndicator.style.display = IdleAnts.Config.debug ? 'block' : 'none';
        }
        
        if (debugConsole) {
            debugConsole.style.display = IdleAnts.Config.debug ? 'block' : 'none';
        }
        
        // Update debug information if debug mode is enabled
        if (IdleAnts.Config.debug) {
            this.updateDebugInfo();
        }
    }
    
    updateDebugInfo() {
        const debugContent = document.getElementById('debug-content');
        if (!debugContent) return;
        
        // Gather debug information
        const debugInfo = {
            'Food': Math.floor(this.resourceManager.resources.food),
            'Ants': `${this.resourceManager.stats.ants}/${this.resourceManager.stats.maxAnts}`,
            'Flying Ants': `${this.resourceManager.stats.flyingAnts}/${this.resourceManager.stats.maxFlyingAnts}`,
            'Food/Sec': this.resourceManager.stats.foodPerSecond.toFixed(2),
            'Food Multiplier': this.resourceManager.stats.foodMultiplier.toFixed(2),
            'Speed Multiplier': this.resourceManager.stats.speedMultiplier.toFixed(2),
            'Strength Multiplier': this.resourceManager.stats.strengthMultiplier.toFixed(2),
            'Food Tier': this.resourceManager.stats.foodTier
        };
        
        // Format debug information as HTML
        let html = '';
        for (const [key, value] of Object.entries(debugInfo)) {
            html += `<div><span style="color: #aaa;">${key}:</span> ${value}</div>`;
        }
        
        debugContent.innerHTML = html;
    }
    
    updateUI() {
        // Show/hide debug indicator
        this.updateDebugIndicator();
        
        // Helper function to safely update element text content
        const updateElementText = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };
        
        try {
            // Update food counter directly for immediate feedback
            const foodCountElement = document.getElementById('food-count');
            if (foodCountElement) {
                foodCountElement.textContent = Math.floor(this.resourceManager.resources.food);
                // Also update the display food value to match the actual food value
                this.resourceManager.resources.displayFood = this.resourceManager.resources.food;
            }
            
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
            
            // Update autofeeder UI elements
            updateElementText('autofeeder-cost', this.resourceManager.stats.autofeederCost);
            updateElementText('autofeeder-upgrade-cost', this.resourceManager.stats.autofeederUpgradeCost);
            updateElementText('autofeeder-level', this.resourceManager.stats.autofeederLevel);
            
            // Update food per second
            updateElementText('food-per-second', this.resourceManager.stats.foodPerSecond.toFixed(1));
            
            // Update food type
            const currentFoodType = this.resourceManager.getCurrentFoodType();
            updateElementText('food-type', currentFoodType.name);
            
            // Update the upgrade food button text based on current food tier
            const upgradeButton = document.getElementById('upgrade-food');
            
            if (upgradeButton) {
                if (!this.resourceManager.canUpgradeFoodTier()) {
                    // At max tier, update button text to show that it's maxed out
                    upgradeButton.innerHTML = `<i class="fas fa-arrow-up"></i> Food (Max)`;
                } else {
                    // Show the cost to upgrade to the next tier
                    upgradeButton.innerHTML = `<i class="fas fa-arrow-up"></i> Food (<span id="food-upgrade-cost">${this.resourceManager.stats.foodUpgradeCost}</span>)`;
                }
            }
            
            // Update the strength button tooltip with current bonus
            const strengthButton = document.getElementById('upgrade-strength');
            if (strengthButton) {
                const strengthValue = this.resourceManager.stats.strengthMultiplier;
                const collectionSpeedBonus = Math.min(75, Math.round((strengthValue - 1) * 25));
                strengthButton.title = `Increases ant strength to carry more food items and reduces collection time for heavy food. Current strength: ${strengthValue}, speed bonus: -${collectionSpeedBonus}% collection time`;
            }
            
            // Update queen ant UI
            const queenStats = document.getElementById('queen-stats');
            const upgradeQueenButton = document.getElementById('upgrade-queen');
            
            if (queenStats && upgradeQueenButton) {
                // Always show queen stats and upgrade button
                queenStats.style.display = 'block';
                upgradeQueenButton.style.display = 'block';
                
                // Update queen stats
                updateElementText('upgrade-queen-cost', this.resourceManager.stats.queenUpgradeCost);
                updateElementText('queen-level', this.resourceManager.stats.queenUpgradeLevel);
                
                // Keep the UI elements but don't update them based on upgrades
                // These will be replaced with HP in a future update
                updateElementText('queen-larvae-capacity', 3); // Fixed value
                updateElementText('queen-larvae-rate', '60-120'); // Updated to 1-2 minutes
            }
            
            // Enable/disable buttons based on resources
            this.updateButtonStates();
            
        } catch (error) {
            console.error("Error in UIManager.updateUI:", error);
        }
    }
    
    // New method to handle button states separately
    updateButtonStates() {
        // Helper function to update button state
        const updateButtonState = (id, disabled) => {
            const button = document.getElementById(id);
            if (button) {
                button.disabled = disabled;
                if (disabled) {
                    button.classList.add('disabled');
                } else {
                    button.classList.remove('disabled');
                }
            }
        };
        
        // Update main button states
        updateButtonState('buy-ant', 
            !this.resourceManager.canBuyAnt()
        );
        
        updateButtonState('upgrade-food', 
            !this.resourceManager.canUpgradeFood()
        );
        
        updateButtonState('upgrade-speed', 
            !this.resourceManager.canAfford(this.resourceManager.stats.speedUpgradeCost)
        );
        
        updateButtonState('upgrade-strength', 
            !this.resourceManager.canAfford(this.resourceManager.stats.strengthUpgradeCost)
        );
        
        updateButtonState('expand-colony', 
            !this.resourceManager.canAfford(this.resourceManager.stats.expandCost)
        );
        
        // Update flying ant button states
        updateButtonState('unlock-flying-ants', 
            this.resourceManager.stats.flyingAntsUnlocked || 
            !this.resourceManager.canAfford(this.resourceManager.stats.flyingAntUnlockCost)
        );
        
        // Update queen ant button states
        // Hide unlock and buy buttons
        const unlockQueenButton = document.getElementById('unlock-queen');
        if (unlockQueenButton) {
            unlockQueenButton.style.display = 'none';
        }
        
        const buyQueenButton = document.getElementById('buy-queen');
        if (buyQueenButton) {
            buyQueenButton.style.display = 'none';
        }
        
        // Only enable upgrade button if player can afford it
        updateButtonState('upgrade-queen',
            !this.resourceManager.canUpgradeQueen()
        );
        
        // Show/hide flying ant buttons based on unlock status
        const flyingAntButtons = document.querySelectorAll('.special-btn');
        const flyingAntStats = document.getElementById('flying-ant-stats');
        
        if (this.resourceManager.stats.flyingAntsUnlocked) {
            flyingAntButtons.forEach(button => {
                if (button.id !== 'unlock-flying-ants') {
                    button.classList.remove('hidden');
                } else {
                    button.classList.add('hidden');
                }
            });
            
            if (flyingAntStats) {
                flyingAntStats.classList.remove('hidden');
            }
            
            // Update flying ant button states
            updateButtonState('buy-flying-ant', 
                !this.resourceManager.canBuyFlyingAnt()
            );
            
            updateButtonState('expand-flying-ants', 
                !this.resourceManager.canAfford(Math.floor(this.resourceManager.stats.expandCost * 1.5))
            );
        }
        
        // Update autofeeder button states
        updateButtonState('unlock-autofeeder',
            this.resourceManager.stats.autofeederUnlocked ||
            !this.resourceManager.canAfford(this.resourceManager.stats.autofeederCost)
        );
        
        // Show/hide autofeeder upgrade button based on unlock status
        const upgradeAutofeederBtn = document.getElementById('upgrade-autofeeder');
        if (upgradeAutofeederBtn) {
            if (this.resourceManager.stats.autofeederUnlocked) {
                upgradeAutofeederBtn.classList.remove('hidden');
                // Hide the unlock button once unlocked
                const unlockAutofeederBtn = document.getElementById('unlock-autofeeder');
                if (unlockAutofeederBtn) {
                    unlockAutofeederBtn.classList.add('hidden');
                }
                
                // Update upgrade button state
                updateButtonState('upgrade-autofeeder',
                    !this.resourceManager.canUpgradeAutofeeder()
                );
                
                // Update button text to show current food amount
                const foodAmount = this.resourceManager.getAutofeederFoodAmount();
                
                // Update button text if max level reached
                if (this.resourceManager.stats.autofeederLevel >= this.resourceManager.stats.maxAutofeederLevel) {
                    upgradeAutofeederBtn.innerHTML = `<i class="fas fa-arrow-up"></i> Autofeeder Maxed (${foodAmount} food/cycle)`;
                    upgradeAutofeederBtn.disabled = true;
                    upgradeAutofeederBtn.classList.add('disabled');
                } else {
                    // Show current food amount in the button
                    upgradeAutofeederBtn.innerHTML = `<i class="fas fa-arrow-up"></i> Upgrade Autofeeder <span id="autofeeder-level">${this.resourceManager.stats.autofeederLevel}</span>/10 (${foodAmount} food/cycle) (<span id="autofeeder-upgrade-cost">${this.resourceManager.stats.autofeederUpgradeCost}</span> food)`;
                }
            }
        }
    }
    
    animateCounters() {
        try {
            // Smoothly animate the food counter
            const diff = this.resourceManager.resources.food - this.resourceManager.resources.displayFood;
            
            if (Math.abs(diff) > 0.01) {
                // Increase animation speed for more responsive updates
                // Change from 0.1 to 0.5 (50% of the difference per frame)
                this.resourceManager.resources.displayFood += diff * 0.5;
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