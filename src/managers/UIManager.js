// src/managers/UIManager.js

// Logger setup
const logger = IdleAnts.Logger?.create('UIManager') || console;
// Validation helpers
const validateObject = (obj, name) => {
    if (!obj) {
        logger.error(`${name} is null or undefined`);
        throw new Error(`${name} is required but was ${obj}`);
    }
    return obj;
};

const validateFunction = (fn, name) => {
    if (typeof fn !== 'function') {
        logger.error(`${name} is not a function`);
        throw new Error(`${name} must be a function but was ${typeof fn}`);
    }
    return fn;
};

const safeCall = (fn, context, ...args) => {
    try {
        return fn.apply(context, args);
    } catch (error) {
        logger.error('Safe call failed', error);
        throw error;
    }
};



IdleAnts.Managers.UIManager = class {
    constructor(resourceManager, game, effectManager) {
        this.resourceManager = resourceManager;
        this.game = game;
        this.effectManager = effectManager;
        
        // Cache DOM elements to avoid repeated getElementById calls
        this.cacheElements();
        
        // Set up UI button click events
        this.setupEventListeners();
        
        // Initialize UI state
        this.isUICollapsed = false;
        
        // Track previous food amount to detect food collection
        this.previousFoodAmount = 0;
        
        // Show debug indicator if in debug mode
        this.updateDebugIndicator();

        // Boss health bar & end screens
        this.setupBossBar();
        this.setupEndScreens();
    }
    
    cacheElements() {
        // Cache frequently accessed elements
        this.elements = {
            foodCount: document.getElementById('food-count'),
            antCount: document.getElementById('ant-count'),
            antMax: document.getElementById('ant-max'),
            flyingAntCount: document.getElementById('flying-ant-count'),
            flyingAntMax: document.getElementById('flying-ant-max'),
            carAntCount: document.getElementById('car-ant-count'),
            carAntMax: document.getElementById('car-ant-max'),
            carAntResourceCount: document.getElementById('car-ant-resource-count'),
            carAntResourceMax: document.getElementById('car-ant-resource-max'),
            fireAntCount: document.getElementById('fire-ant-count'),
            fireAntMax: document.getElementById('fire-ant-max'),
            fireAntResourceCount: document.getElementById('fire-ant-resource-count'),
            fireAntResourceMax: document.getElementById('fire-ant-resource-max'),
            foodPerSecondActual: document.getElementById('food-per-second-actual'),
            foodType: document.getElementById('food-type'),
            // Costs
            antCost: document.getElementById('ant-cost'),
            foodUpgradeCost: document.getElementById('food-upgrade-cost'),
            speedUpgradeCost: document.getElementById('speed-upgrade-cost'),
            strengthUpgradeCost: document.getElementById('strength-upgrade-cost'),
            expandCost: document.getElementById('expand-cost'),
            flyingAntUnlockCost: document.getElementById('flying-ant-unlock-cost'),
            flyingAntCost: document.getElementById('flying-ant-cost'),
            expandFlyingCost: document.getElementById('expand-flying-cost'),
            carAntUnlockCost: document.getElementById('car-ant-unlock-cost'),
            carAntCost: document.getElementById('car-ant-cost'),
            expandCarAntCost: document.getElementById('expand-car-ant-cost'),
            fireAntUnlockCost: document.getElementById('fire-ant-unlock-cost'),
            fireAntCost: document.getElementById('fire-ant-cost'),
            expandFireAntCost: document.getElementById('expand-fire-ant-cost'),
            autofeederCost: document.getElementById('autofeeder-cost'),
            autofeederUpgradeCost: document.getElementById('autofeeder-upgrade-cost'),
            autofeederLevel: document.getElementById('autofeeder-level'),
            upgradeQueenCost: document.getElementById('upgrade-queen-cost'),
            queenLevel: document.getElementById('queen-level'),
            queenLarvaeCapacity: document.getElementById('queen-larvae-capacity'),
            queenLarvaeRate: document.getElementById('queen-larvae-rate')
        };
    }
    
    setupEventListeners() {
        // Add null checks to all event listeners
        const addSafeClickListener = (id, callback) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', callback);
            } else {
                logger.warn(`UIManager: Element with id '${id}' not found for event listener`);
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

        // Car Ant buttons
        addSafeClickListener('unlock-car-ants', () => this.game.unlockCarAnts());
        addSafeClickListener('buy-car-ant', () => this.game.buyCarAnt());
        addSafeClickListener('expand-car-ants', () => this.game.expandCarAntCapacity());
        
        // Fire Ant buttons
        addSafeClickListener('unlock-fire-ants', () => this.game.unlockFireAnts());
        addSafeClickListener('buy-fire-ant', () => this.game.buyFireAnt());
        addSafeClickListener('expand-fire-ants', () => this.game.expandFireAntCapacity());
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
                
                // For mobile: adjust canvas size when UI is collapsed
                if (this.game && this.game.isMobileDevice) {
                    // Force a resize event to adjust the canvas size
                    window.dispatchEvent(new Event('resize'));
                }
            } else {
                gameContainer.classList.remove('ui-collapsed');
                toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
                toggleButton.title = "Collapse UI";
                
                // For mobile: adjust canvas size when UI is expanded
                if (this.game && this.game.isMobileDevice) {
                    // Force a resize event to adjust the canvas size
                    window.dispatchEvent(new Event('resize'));
                }
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
        // Helper function to safely update cached element text content
        const updateCachedElementText = (element, value) => {
            if (element) {
                element.textContent = value;
            }
        };
        
        try {
            // Update food counter directly for immediate feedback
            if (this.elements.foodCount) {
                this.elements.foodCount.textContent = Math.floor(this.resourceManager.resources.food);
                // Also update the display food value to match the actual food value
                this.resourceManager.resources.displayFood = this.resourceManager.resources.food;
            }
            
            // Update ant counts using cached elements
            updateCachedElementText(this.elements.antCount, this.resourceManager.stats.ants);
            updateCachedElementText(this.elements.antMax, this.resourceManager.stats.maxAnts);
            updateCachedElementText(this.elements.flyingAntCount, this.resourceManager.stats.flyingAnts);
            updateCachedElementText(this.elements.flyingAntMax, this.resourceManager.stats.maxFlyingAnts);
            
            // Update Car Ant counts using cached elements
            updateCachedElementText(this.elements.carAntCount, this.resourceManager.stats.carAnts);
            updateCachedElementText(this.elements.carAntMax, this.resourceManager.stats.maxCarAnts);
            updateCachedElementText(this.elements.carAntResourceCount, this.resourceManager.stats.carAnts);
            updateCachedElementText(this.elements.carAntResourceMax, this.resourceManager.stats.maxCarAnts);
            
            // Update costs using cached elements
            updateCachedElementText(this.elements.antCost, this.resourceManager.stats.antCost);
            updateCachedElementText(this.elements.foodUpgradeCost, this.resourceManager.stats.foodUpgradeCost);
            updateCachedElementText(this.elements.speedUpgradeCost, this.resourceManager.stats.speedUpgradeCost);
            updateCachedElementText(this.elements.strengthUpgradeCost, this.resourceManager.stats.strengthUpgradeCost);
            updateCachedElementText(this.elements.expandCost, this.resourceManager.stats.expandCost);
            updateCachedElementText(this.elements.flyingAntUnlockCost, this.resourceManager.stats.flyingAntUnlockCost);
            updateCachedElementText(this.elements.flyingAntCost, this.resourceManager.stats.flyingAntCost);
            updateCachedElementText(this.elements.expandFlyingCost, Math.floor(this.resourceManager.stats.expandCost * 1.5));

            // Update Car Ant costs using cached elements
            updateCachedElementText(this.elements.carAntUnlockCost, this.resourceManager.stats.carAntUnlockCost);
            updateCachedElementText(this.elements.carAntCost, this.resourceManager.stats.carAntCost);
            // Assuming expand car ant cost is dynamic or needs a specific stat in ResourceManager
            // For now, let's use a placeholder or make it dependent on carAntCost like flying ants if similar logic applies
            const expandCarAntCapacityCost = this.resourceManager.stats.maxCarAnts > 0 ? this.resourceManager.stats.carAntCost * (this.resourceManager.stats.maxCarAnts + 1) * 0.5 : 5000;
            updateCachedElementText(this.elements.expandCarAntCost, Math.floor(expandCarAntCapacityCost));
            
            // Update autofeeder UI elements using cached elements
            updateCachedElementText(this.elements.autofeederCost, this.resourceManager.stats.autofeederCost);
            updateCachedElementText(this.elements.autofeederUpgradeCost, this.resourceManager.stats.autofeederUpgradeCost);
            updateCachedElementText(this.elements.autofeederLevel, this.resourceManager.stats.autofeederLevel);
            
            // Update actual food collection rate using cached elements
            const actualRate = this.resourceManager.getActualFoodRate();
            updateCachedElementText(this.elements.foodPerSecondActual, actualRate.toFixed(1));
            
            // Update food type using cached elements
            const currentFoodType = this.resourceManager.getCurrentFoodType();
            updateCachedElementText(this.elements.foodType, currentFoodType.name);

            // Update Fire Ant counts using cached elements
            updateCachedElementText(this.elements.fireAntCount, this.resourceManager.stats.fireAnts);
            updateCachedElementText(this.elements.fireAntMax, this.resourceManager.stats.maxFireAnts);
            updateCachedElementText(this.elements.fireAntResourceCount, this.resourceManager.stats.fireAnts);
            updateCachedElementText(this.elements.fireAntResourceMax, this.resourceManager.stats.maxFireAnts);
            
            // Update Fire Ant costs using cached elements
            updateCachedElementText(this.elements.fireAntUnlockCost, this.resourceManager.stats.fireAntUnlockCost);
            updateCachedElementText(this.elements.fireAntCost, this.resourceManager.stats.fireAntCost);
            const expandFireAntCapacityCost = this.resourceManager.stats.maxFireAnts > 0 ? this.resourceManager.stats.fireAntCost * (this.resourceManager.stats.maxFireAnts + 1) * 0.5 : 10000;
            updateCachedElementText(this.elements.expandFireAntCost, Math.floor(expandFireAntCapacityCost));
        } catch (error) {
            logger.error('Error updating UI resources:', error);
        }
        
        // Update previous food amount without playing any sound
        this.previousFoodAmount = this.resourceManager.getFood();
        
        // Show/hide debug indicator
        this.updateDebugIndicator();
        
        // Update button states
        this.updateButtonStates();
        
        // Update additional UI elements
        try {
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
                
                // Update queen stats using cached elements
                updateCachedElementText(this.elements.upgradeQueenCost, this.resourceManager.stats.queenUpgradeCost);
                updateCachedElementText(this.elements.queenLevel, this.resourceManager.stats.queenUpgradeLevel);
                
                // Keep the UI elements but don't update them based on upgrades
                // These will be replaced with HP in a future update
                const queenLevel = this.resourceManager.stats.queenUpgradeLevel;
                const larvaePerSpawn = 1 + queenLevel;
                updateCachedElementText(this.elements.queenLarvaeCapacity, `${larvaePerSpawn} per spawn`);
                updateCachedElementText(this.elements.queenLarvaeRate, '15-45s'); // Updated to reflect faster spawn rate
            }
        } catch (error) {
            logger.error('Error updating UI:', error);
        }
        
        // Update button states
        this.updateButtonStates();
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
        
        // Helper function to show/hide element
        const toggleElementVisibility = (id, show) => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = show ? 'block' : 'none';
                // If it's a button and we are showing it, also remove hidden class if present
                if (show && element.tagName === 'BUTTON') element.classList.remove('hidden');
                else if (!show && element.tagName === 'BUTTON') element.classList.add('hidden');
            }
        };
        
        // Regular ant buttons
        updateButtonState('buy-ant', !this.resourceManager.canBuyAnt());
        
        updateButtonState('upgrade-food', !this.resourceManager.canUpgradeFood());
        
        updateButtonState('upgrade-speed', !this.resourceManager.canAfford(this.resourceManager.stats.speedUpgradeCost));
        
        updateButtonState('upgrade-strength', !this.resourceManager.canAfford(this.resourceManager.stats.strengthUpgradeCost));
        
        updateButtonState('expand-colony', !this.resourceManager.canAfford(this.resourceManager.stats.expandCost));
        
        // Update flying ant button states
        updateButtonState('unlock-flying-ants', !this.resourceManager.stats.flyingAntsUnlocked && !this.resourceManager.canAfford(this.resourceManager.stats.flyingAntUnlockCost));
        
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
        updateButtonState('upgrade-queen', !this.resourceManager.canUpgradeQueen());
        
        // Show/hide flying ant buttons based on unlock status
        const flyingAntButtons = document.querySelectorAll('.special-btn');
        const flyingAntStats = document.getElementById('flying-ant-stats');
        
        toggleElementVisibility('buy-flying-ant', this.resourceManager.stats.flyingAntsUnlocked);
        toggleElementVisibility('expand-flying-ants', this.resourceManager.stats.flyingAntsUnlocked);
        toggleElementVisibility('flying-ant-stats', this.resourceManager.stats.flyingAntsUnlocked);
        // Also for the main resource display
        const flyingAntResourceStats = document.getElementById('flying-ant-resource-stats');
        if(flyingAntResourceStats) flyingAntResourceStats.classList.toggle('hidden', !this.resourceManager.stats.flyingAntsUnlocked && this.resourceManager.stats.maxFlyingAnts === 0);
        
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
            updateButtonState('buy-flying-ant', !this.resourceManager.canBuyFlyingAnt());
            
            updateButtonState('expand-flying-ants', !this.resourceManager.canAfford(Math.floor(this.resourceManager.stats.expandCost * 1.5)));
        }
        
        // Update autofeeder button states
        updateButtonState('unlock-autofeeder', !this.resourceManager.stats.autofeederUnlocked && !this.resourceManager.canAfford(this.resourceManager.stats.autofeederCost));
        
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
                updateButtonState('upgrade-autofeeder', !this.resourceManager.canUpgradeAutofeeder());
                
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

        // Car Ant Buttons & Stats
        const carAntsUnlocked = this.resourceManager.stats.carAntsUnlocked;
        toggleElementVisibility('unlock-car-ants', !carAntsUnlocked);
        toggleElementVisibility('buy-car-ant', carAntsUnlocked);
        toggleElementVisibility('expand-car-ants', carAntsUnlocked);
        toggleElementVisibility('car-ant-stats', carAntsUnlocked);
        // Main resource display for car ants
        const carAntResourceStats = document.getElementById('car-ant-resource-stats');
        if(carAntResourceStats) carAntResourceStats.classList.toggle('hidden', !carAntsUnlocked && this.resourceManager.stats.maxCarAnts === 0);

        if (carAntsUnlocked) {
            updateButtonState('buy-car-ant', !this.resourceManager.canBuyCarAnt());
            updateButtonState('expand-car-ants', !this.resourceManager.canExpandCarAntCapacity());
        } else {
            updateButtonState('unlock-car-ants', !this.resourceManager.canUnlockCarAnts());
        }

        // Fire Ant Buttons & Stats
        const fireAntsUnlocked = this.resourceManager.stats.fireAntsUnlocked;
        toggleElementVisibility('unlock-fire-ants', !fireAntsUnlocked);
        toggleElementVisibility('buy-fire-ant', fireAntsUnlocked);
        toggleElementVisibility('expand-fire-ants', fireAntsUnlocked);
        toggleElementVisibility('fire-ant-stats', fireAntsUnlocked);
        const fireAntResourceStats = document.getElementById('fire-ant-resource-stats');
        if (fireAntResourceStats) fireAntResourceStats.classList.toggle('hidden', !fireAntsUnlocked && this.resourceManager.stats.maxFireAnts === 0);

        if (fireAntsUnlocked) {
            updateButtonState('buy-fire-ant', !this.resourceManager.canBuyFireAnt());
            updateButtonState('expand-fire-ants', !this.resourceManager.canExpandFireAntCapacity());
        } else {
            updateButtonState('unlock-fire-ants', !this.resourceManager.canUnlockFireAnts());
        }
    }
    
    animateCounters() {
        try {
            // Smoothly animate the food counter using cached element
            const diff = this.resourceManager.resources.food - this.resourceManager.resources.displayFood;
            
            if (Math.abs(diff) > 0.01) {
                // Increase animation speed for more responsive updates
                // Change from 0.1 to 0.5 (50% of the difference per frame)
                this.resourceManager.resources.displayFood += diff * 0.5;
                if (this.elements.foodCount) {
                    this.elements.foodCount.textContent = Math.floor(this.resourceManager.resources.displayFood);
                }
            } else {
                this.resourceManager.resources.displayFood = this.resourceManager.resources.food;
                if (this.elements.foodCount) {
                    this.elements.foodCount.textContent = Math.floor(this.resourceManager.resources.food);
                }
            }
        } catch (error) {
            logger.error("Error in UIManager.animateCounters:", error);
        }
    }
    
    showUpgradeEffect(buttonId, message) {
        try {
            // Find the button element
            const button = document.getElementById(buttonId);
            if (!button) {
                logger.warn(`UIManager: Button with id '${buttonId}' not found for upgrade effect`);
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
            logger.error("Error in UIManager.showUpgradeEffect:", error);
        }
    }

    /* ================= Boss UI ================= */

    setupBossBar() {
        this.bossBarContainer = document.createElement('div');
        this.bossBarContainer.id = 'boss-bar-container';
        Object.assign(this.bossBarContainer.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '26px',
            background: 'rgba(0,0,0,0.6)',
            border: '2px solid #fff',
            zIndex: 9999,
            display: 'none'
        });
        this.bossBarFill = document.createElement('div');
        Object.assign(this.bossBarFill.style, {
            background: '#f44336',
            width: '100%',
            height: '100%'
        });
        this.bossBarContainer.appendChild(this.bossBarFill);
        document.body.appendChild(this.bossBarContainer);
        this.bossMaxHp = 1;
    }

    showBossHealthBar(maxHp) {
        this.bossMaxHp = maxHp;
        this.updateBossHealth(maxHp, maxHp);
        this.bossBarContainer.style.display = 'block';
    }

    updateBossHealth(hp, maxHp) {
        const ratio = Math.max(0, hp) / (maxHp || this.bossMaxHp);
        this.bossBarFill.style.width = (ratio * 100) + '%';
    }

    hideBossHealthBar() {
        this.bossBarContainer.style.display = 'none';
    }

    /* ================= End Screens ================= */

    setupEndScreens() {
        // Victory
        this.winScreen = document.createElement('div');
        this.winScreen.id = 'win-screen';
        this.applyEndScreenStyle(this.winScreen);
        this.winScreen.innerHTML = '<h1>Victory!</h1><p>The Anteater has been defeated! Your colony has survived the ultimate test.</p>';
        document.body.appendChild(this.winScreen);

        // Defeat
        this.loseScreen = document.createElement('div');
        this.loseScreen.id = 'lose-screen';
        this.applyEndScreenStyle(this.loseScreen);
        this.loseScreen.innerHTML = '<h1>Colony Destroyed</h1><p>Your ants have been eaten.</p>';
        document.body.appendChild(this.loseScreen);
    }

    applyEndScreenStyle(screenDiv) {
        Object.assign(screenDiv.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            display: 'none',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            zIndex: 10000,
            fontSize: '2em'
        });
        screenDiv.style.display = 'flex'; // for flexbox layout but hidden initially
        screenDiv.style.display = 'none';
    }

    showWinScreen() { this.winScreen.style.display = 'flex'; }
    showLoseScreen() { this.loseScreen.style.display = 'flex'; }
} 