// src/managers/UIManager.js
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
            // Score display elements (subtle)
            scoreDisplay: document.getElementById('score-display'),
            sessionTimer: document.getElementById('session-timer'),
            currentScore: document.getElementById('current-score'),
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
            // New ant types
            fatAntCount: document.getElementById('fat-ant-count'),
            fatAntMax: document.getElementById('fat-ant-max'),
            gasAntCount: document.getElementById('gas-ant-count'),
            gasAntMax: document.getElementById('gas-ant-max'),
            electricAntCount: document.getElementById('electric-ant-count'),
            electricAntMax: document.getElementById('electric-ant-max'),
            bananaThrowingAntCount: document.getElementById('banana-throwing-ant-count'),
            bananaThrowingAntMax: document.getElementById('banana-throwing-ant-max'),
            // Newly added ant type counts
            acidAntCount: document.getElementById('acid-ant-count'),
            acidAntMax: document.getElementById('acid-ant-max'),
            rainbowAntCount: document.getElementById('rainbow-ant-count'),
            rainbowAntMax: document.getElementById('rainbow-ant-max'),
            smokeAntCount: document.getElementById('smoke-ant-count'),
            smokeAntMax: document.getElementById('smoke-ant-max'),
            leafCutterAntCount: document.getElementById('leaf-cutter-ant-count'),
            leafCutterAntMax: document.getElementById('leaf-cutter-ant-max'),
            juiceAntCount: document.getElementById('juice-ant-count'),
            juiceAntMax: document.getElementById('juice-ant-max'),
            crabAntCount: document.getElementById('crab-ant-count'),
            crabAntMax: document.getElementById('crab-ant-max'),
            spiderAntCount: document.getElementById('spider-ant-count'),
            spiderAntMax: document.getElementById('spider-ant-max'),
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
            // New ant type costs
            fatAntUnlockCost: document.getElementById('fat-ant-unlock-cost'),
            fatAntCost: document.getElementById('fat-ant-cost'),
            gasAntUnlockCost: document.getElementById('gas-ant-unlock-cost'),
            gasAntCost: document.getElementById('gas-ant-cost'),
            electricAntUnlockCost: document.getElementById('electric-ant-unlock-cost'),
            electricAntCost: document.getElementById('electric-ant-cost'),
            bananaThrowingAntUnlockCost: document.getElementById('banana-throwing-ant-unlock-cost'),
            bananaThrowingAntCost: document.getElementById('banana-throwing-ant-cost'),
            // Newly added ant type costs
            acidAntUnlockCost: document.getElementById('acid-ant-unlock-cost'),
            acidAntCost: document.getElementById('acid-ant-cost'),
            rainbowAntUnlockCost: document.getElementById('rainbow-ant-unlock-cost'),
            rainbowAntCost: document.getElementById('rainbow-ant-cost'),
            smokeAntUnlockCost: document.getElementById('smoke-ant-unlock-cost'),
            smokeAntCost: document.getElementById('smoke-ant-cost'),
            leafCutterAntUnlockCost: document.getElementById('leaf-cutter-ant-unlock-cost'),
            leafCutterAntCost: document.getElementById('leaf-cutter-ant-cost'),
            juiceAntUnlockCost: document.getElementById('juice-ant-unlock-cost'),
            juiceAntCost: document.getElementById('juice-ant-cost'),
            crabAntUnlockCost: document.getElementById('crab-ant-unlock-cost'),
            crabAntCost: document.getElementById('crab-ant-cost'),
            spiderAntUnlockCost: document.getElementById('spider-ant-unlock-cost'),
            spiderAntCost: document.getElementById('spider-ant-cost'),
            autofeederCost: document.getElementById('autofeeder-cost'),
            autofeederUpgradeCost: document.getElementById('autofeeder-upgrade-cost'),
            autofeederLevel: document.getElementById('autofeeder-level'),
            upgradeQueenCost: document.getElementById('upgrade-queen-cost'),
            modalUpgradeQueenCost: document.getElementById('modal-upgrade-queen-cost'),
            queenLevel: document.getElementById('queen-level'),
            queenLevelDisplay: document.getElementById('queen-level-display'),
            modalQueenLevelDisplay: document.getElementById('modal-queen-level-display'),
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
        
        // Fire Ant buttons
        addSafeClickListener('unlock-fire-ants', () => this.game.unlockFireAnts());
        addSafeClickListener('buy-fire-ant', () => this.game.buyFireAnt());
        
        // New Ant Types - Selected key representatives
        // Fat Ant (Basic Combat)
        addSafeClickListener('unlock-fat-ants', () => this.game.unlockFatAnts());
        addSafeClickListener('buy-fat-ant', () => this.game.buyFatAnt());
        
        // Gas Ant (Basic Combat) 
        addSafeClickListener('unlock-gas-ants', () => this.game.unlockGasAnts());
        addSafeClickListener('buy-gas-ant', () => this.game.buyGasAnt());
        
        // Electric Ant (Exploding)
        addSafeClickListener('unlock-electric-ants', () => this.game.unlockElectricAnts());
        addSafeClickListener('buy-electric-ant', () => this.game.buyElectricAnt());
        
        // Banana Throwing Ant (Throwing)
        addSafeClickListener('unlock-banana-throwing-ants', () => this.game.unlockBananaThrowingAnts());
        addSafeClickListener('buy-banana-throwing-ant', () => this.game.buyBananaThrowingAnt());
        
        // DPS Ant (Special) 
        addSafeClickListener('unlock-dps-ants', () => this.game.unlockDpsAnts());
        addSafeClickListener('buy-dps-ant', () => this.game.buyDpsAnt());

        // Newly added ant type buttons
        addSafeClickListener('unlock-acid-ants', () => this.game.unlockAcidAnts());
        addSafeClickListener('buy-acid-ant', () => this.game.buyAcidAnt());

        addSafeClickListener('unlock-rainbow-ants', () => this.game.unlockRainbowAnts());
        addSafeClickListener('buy-rainbow-ant', () => this.game.buyRainbowAnt());

        addSafeClickListener('unlock-smoke-ants', () => this.game.unlockSmokeAnts());
        addSafeClickListener('buy-smoke-ant', () => this.game.buySmokeAnt());

        addSafeClickListener('unlock-leaf-cutter-ants', () => this.game.unlockLeafCutterAnts());
        addSafeClickListener('buy-leaf-cutter-ant', () => this.game.buyLeafCutterAnt());


        addSafeClickListener('unlock-juice-ants', () => this.game.unlockJuiceAnts());
        addSafeClickListener('buy-juice-ant', () => this.game.buyJuiceAnt());

        addSafeClickListener('unlock-crab-ants', () => this.game.unlockCrabAnts());
        addSafeClickListener('buy-crab-ant', () => this.game.buyCrabAnt());


        addSafeClickListener('unlock-spider-ants', () => this.game.unlockSpiderAnts());
        addSafeClickListener('buy-spider-ant', () => this.game.buySpiderAnt());

        // Ability buttons
        const abilityButtons = document.querySelectorAll('.ability-btn');
        abilityButtons.forEach(button => {
            const abilityId = button.dataset.ability;
            if (abilityId) {
                button.addEventListener('click', () => {
                    if (this.game && this.game.abilityManager) {
                        this.game.abilityManager.onAbilityClick(abilityId);
                    }
                });
            }
        });
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
            'Flying Ants': `${this.resourceManager.stats.flyingAnts}`,
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

            // Update live score display during gameplay
            this.updateLiveScore();
            
            // Update ant counts using cached elements
            updateCachedElementText(this.elements.antCount, this.resourceManager.stats.ants);
            updateCachedElementText(this.elements.antMax, this.resourceManager.stats.maxAnts);
            updateCachedElementText(this.elements.flyingAntCount, this.resourceManager.stats.flyingAnts);
            
            // Update Car Ant counts using cached elements
            updateCachedElementText(this.elements.carAntCount, this.resourceManager.stats.carAnts);
            updateCachedElementText(this.elements.carAntResourceCount, this.resourceManager.stats.carAnts);
            
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
            updateCachedElementText(this.elements.fireAntResourceCount, this.resourceManager.stats.fireAnts);
            
            // Update Fire Ant costs using cached elements
            updateCachedElementText(this.elements.fireAntUnlockCost, this.resourceManager.stats.fireAntUnlockCost);
            updateCachedElementText(this.elements.fireAntCost, this.resourceManager.stats.fireAntCost);

            // Update New Ant Types counts and costs using cached elements
            updateCachedElementText(this.elements.fatAntCount, this.resourceManager.stats.fatAnts);
            updateCachedElementText(this.elements.fatAntMax, this.resourceManager.stats.maxFatAnts);
            updateCachedElementText(this.elements.fatAntUnlockCost, this.resourceManager.stats.fatAntUnlockCost);
            updateCachedElementText(this.elements.fatAntCost, this.resourceManager.stats.fatAntCost);

            updateCachedElementText(this.elements.gasAntCount, this.resourceManager.stats.gasAnts);
            updateCachedElementText(this.elements.gasAntMax, this.resourceManager.stats.maxGasAnts);
            updateCachedElementText(this.elements.gasAntUnlockCost, this.resourceManager.stats.gasAntUnlockCost);
            updateCachedElementText(this.elements.gasAntCost, this.resourceManager.stats.gasAntCost);

            updateCachedElementText(this.elements.electricAntCount, this.resourceManager.stats.electricAnts);
            updateCachedElementText(this.elements.electricAntMax, this.resourceManager.stats.maxElectricAnts);
            updateCachedElementText(this.elements.electricAntUnlockCost, this.resourceManager.stats.electricAntUnlockCost);
            updateCachedElementText(this.elements.electricAntCost, this.resourceManager.stats.electricAntCost);

            updateCachedElementText(this.elements.bananaThrowingAntCount, this.resourceManager.stats.bananaThrowingAnts);
            updateCachedElementText(this.elements.bananaThrowingAntMax, this.resourceManager.stats.maxBananaThrowingAnts);
            updateCachedElementText(this.elements.bananaThrowingAntUnlockCost, this.resourceManager.stats.bananaThrowingAntUnlockCost);
            updateCachedElementText(this.elements.bananaThrowingAntCost, this.resourceManager.stats.bananaThrowingAntCost);


            // Newly added ant types counts and costs
            updateCachedElementText(this.elements.acidAntCount, this.resourceManager.stats.acidAnts);
            updateCachedElementText(this.elements.acidAntMax, this.resourceManager.stats.maxAcidAnts);
            updateCachedElementText(this.elements.acidAntUnlockCost, this.resourceManager.stats.acidAntUnlockCost);
            updateCachedElementText(this.elements.acidAntCost, this.resourceManager.stats.acidAntCost);

            updateCachedElementText(this.elements.rainbowAntCount, this.resourceManager.stats.rainbowAnts);
            updateCachedElementText(this.elements.rainbowAntMax, this.resourceManager.stats.maxRainbowAnts);
            updateCachedElementText(this.elements.rainbowAntUnlockCost, this.resourceManager.stats.rainbowAntUnlockCost);
            updateCachedElementText(this.elements.rainbowAntCost, this.resourceManager.stats.rainbowAntCost);

            updateCachedElementText(this.elements.smokeAntCount, this.resourceManager.stats.smokeAnts);
            updateCachedElementText(this.elements.smokeAntMax, this.resourceManager.stats.maxSmokeAnts);
            updateCachedElementText(this.elements.smokeAntUnlockCost, this.resourceManager.stats.smokeAntUnlockCost);
            updateCachedElementText(this.elements.smokeAntCost, this.resourceManager.stats.smokeAntCost);

            updateCachedElementText(this.elements.leafCutterAntCount, this.resourceManager.stats.leafCutterAnts);
            updateCachedElementText(this.elements.leafCutterAntMax, this.resourceManager.stats.maxLeafCutterAnts);
            updateCachedElementText(this.elements.leafCutterAntUnlockCost, this.resourceManager.stats.leafCutterAntUnlockCost);
            updateCachedElementText(this.elements.leafCutterAntCost, this.resourceManager.stats.leafCutterAntCost);


            updateCachedElementText(this.elements.juiceAntCount, this.resourceManager.stats.juiceAnts);
            updateCachedElementText(this.elements.juiceAntMax, this.resourceManager.stats.maxJuiceAnts);
            updateCachedElementText(this.elements.juiceAntUnlockCost, this.resourceManager.stats.juiceAntUnlockCost);
            updateCachedElementText(this.elements.juiceAntCost, this.resourceManager.stats.juiceAntCost);

            updateCachedElementText(this.elements.crabAntCount, this.resourceManager.stats.crabAnts);
            updateCachedElementText(this.elements.crabAntMax, this.resourceManager.stats.maxCrabAnts);
            updateCachedElementText(this.elements.crabAntUnlockCost, this.resourceManager.stats.crabAntUnlockCost);
            updateCachedElementText(this.elements.crabAntCost, this.resourceManager.stats.crabAntCost);


            updateCachedElementText(this.elements.spiderAntCount, this.resourceManager.stats.spiderAnts);
            updateCachedElementText(this.elements.spiderAntMax, this.resourceManager.stats.maxSpiderAnts);
            updateCachedElementText(this.elements.spiderAntUnlockCost, this.resourceManager.stats.spiderAntUnlockCost);
            updateCachedElementText(this.elements.spiderAntCost, this.resourceManager.stats.spiderAntCost);

        } catch (error) {
            console.error('Error updating UI resources:', error);
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
                    // At max tier, keep a cost span so modal sync shows MAX too
                    upgradeButton.innerHTML = `<i class="fas fa-arrow-up"></i> Food (<span id="food-upgrade-cost">MAX</span>)`;
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
                updateCachedElementText(this.elements.modalUpgradeQueenCost, this.resourceManager.stats.queenUpgradeCost);
                updateCachedElementText(this.elements.queenLevel, this.resourceManager.stats.queenUpgradeLevel);
                updateCachedElementText(this.elements.queenLevelDisplay, this.resourceManager.stats.queenUpgradeLevel);
                updateCachedElementText(this.elements.modalQueenLevelDisplay, this.resourceManager.stats.queenUpgradeLevel);
                
                // Keep the UI elements but don't update them based on upgrades
                // These will be replaced with HP in a future update
                const queenLevel = this.resourceManager.stats.queenUpgradeLevel;
                const larvaePerSpawn = 1 + queenLevel;
                updateCachedElementText(this.elements.queenLarvaeCapacity, `${larvaePerSpawn} per spawn`);
                updateCachedElementText(this.elements.queenLarvaeRate, '15-45s'); // Updated to reflect faster spawn rate
            }
        } catch (error) {
            console.error('Error updating UI:', error);
        }
        
        // Update button states
        this.updateButtonStates();

        // Update ability buttons (cooldowns and states)
        this.updateAbilityButtons();
    }

    // New method to handle button states separately
    updateButtonStates() {
        // Helper function to update button state (both original and modal versions)
        const updateButtonState = (id, shouldBeDisabled) => {
            // Update original button
            const button = document.getElementById(id);
            if (button) {
                button.disabled = shouldBeDisabled;
                if (shouldBeDisabled) {
                    button.classList.add('disabled');
                } else {
                    button.classList.remove('disabled');
                }
            }
            
            // Update modal button if it exists
            const modalButton = document.getElementById('modal-' + id);
            if (modalButton) {
                modalButton.disabled = shouldBeDisabled;
                if (shouldBeDisabled) {
                    modalButton.classList.add('disabled');
                } else {
                    modalButton.classList.remove('disabled');
                }
            }
        };
        
        // Helper function to show/hide element (both original and modal versions)
        const toggleElementVisibility = (id, show) => {
            // Update original element
            const element = document.getElementById(id);
            if (element) {
                element.style.display = show ? 'block' : 'none';
                if (show && element.tagName === 'BUTTON') element.classList.remove('hidden');
                else if (!show && element.tagName === 'BUTTON') element.classList.add('hidden');
            }
            
            // Update modal element if it exists
            const modalElement = document.getElementById('modal-' + id);
            if (modalElement) {
                modalElement.style.display = show ? 'block' : 'none';
                if (show && modalElement.tagName === 'BUTTON') modalElement.classList.remove('hidden');
                else if (!show && modalElement.tagName === 'BUTTON') modalElement.classList.add('hidden');
            }
        };
        
        // Regular ant buttons
        updateButtonState('buy-ant', !this.resourceManager.canBuyAnt());
        
        // Disable food upgrade if at max tier or unaffordable
        const atMaxFoodTier = !this.resourceManager.canUpgradeFoodTier();
        updateButtonState('upgrade-food', atMaxFoodTier || !this.resourceManager.canUpgradeFood());
        
        updateButtonState('upgrade-speed', !this.resourceManager.canAfford(this.resourceManager.stats.speedUpgradeCost));
        
        updateButtonState('upgrade-strength', !this.resourceManager.canUpgradeStrength());
        
        updateButtonState('expand-colony', !this.resourceManager.canAfford(this.resourceManager.stats.expandCost));
        
        // Update flying ant button states
        if (!this.resourceManager.stats.flyingAntsUnlocked) {
            updateButtonState('unlock-flying-ants', !this.resourceManager.canUnlockFlyingAnts());
        }
        
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
        
        // Only enable upgrade button if player can afford it AND queen is not at max level
        const canUpgradeQueen = this.resourceManager.canUpgradeQueen();
        const queenAtMaxLevel = this.resourceManager.stats.queenUpgradeLevel >= this.resourceManager.stats.maxQueenUpgradeLevel;
        
        updateButtonState('upgrade-queen', !canUpgradeQueen || queenAtMaxLevel);
        
        // Update button text when queen is at max level
        const upgradeQueenButton = document.getElementById('upgrade-queen');
        const modalUpgradeQueenButton = document.getElementById('modal-upgrade-queen');
        
        if (upgradeQueenButton && queenAtMaxLevel) {
            upgradeQueenButton.innerHTML = `<i class="fas fa-crown"></i>Queen Maxed 5/5`;
        }
        
        if (modalUpgradeQueenButton && queenAtMaxLevel) {
            modalUpgradeQueenButton.innerHTML = `
                <span><i class="fas fa-crown"></i>Queen Maxed 5/5</span>
                <span>MAX</span>
            `;
        }
        
        // Show/hide flying ant buttons based on unlock status
        const flyingAntsUnlocked = this.resourceManager.stats.flyingAntsUnlocked;
        
        toggleElementVisibility('unlock-flying-ants', !flyingAntsUnlocked);
        toggleElementVisibility('buy-flying-ant', flyingAntsUnlocked);
        
        
        // Update flying ant button states when unlocked
        if (flyingAntsUnlocked) {
            updateButtonState('buy-flying-ant', !this.resourceManager.canBuyFlyingAnt());
        }
        
        // Autofeeder Buttons & Stats
        const autofeederUnlocked = this.resourceManager.stats.autofeederUnlocked;
        
        toggleElementVisibility('unlock-autofeeder', !autofeederUnlocked);
        toggleElementVisibility('upgrade-autofeeder', autofeederUnlocked);
        
        if (!autofeederUnlocked) {
            updateButtonState('unlock-autofeeder', !this.resourceManager.canAfford(this.resourceManager.stats.autofeederCost));
        } else {
            updateButtonState('upgrade-autofeeder', !this.resourceManager.canUpgradeAutofeeder());
            
            // Update button text to show current food amount
            const upgradeAutofeederBtn = document.getElementById('upgrade-autofeeder');
            const modalUpgradeAutofeederBtn = document.getElementById('modal-upgrade-autofeeder');
            const foodAmount = this.resourceManager.getAutofeederFoodAmount();
            
            // Update button text if max level reached
            if (this.resourceManager.stats.autofeederLevel >= this.resourceManager.stats.maxAutofeederLevel) {
                const maxText = `<i class="fas fa-arrow-up"></i> Autofeeder Maxed (${foodAmount} food/cycle)`;
                if (upgradeAutofeederBtn) upgradeAutofeederBtn.innerHTML = maxText;
                if (modalUpgradeAutofeederBtn) modalUpgradeAutofeederBtn.innerHTML = `<span>${maxText}</span>`;
            } else {
                // Show current food amount in the button
                const upgradeText = `<i class="fas fa-arrow-up"></i> Upgrade Autofeeder <span id="autofeeder-level">${this.resourceManager.stats.autofeederLevel}</span>/10 (${foodAmount} food/cycle)`;
                const costText = `<span id="autofeeder-upgrade-cost">${this.resourceManager.stats.autofeederUpgradeCost}</span>`;
                
                if (upgradeAutofeederBtn) upgradeAutofeederBtn.innerHTML = `${upgradeText} (${costText} food)`;
                if (modalUpgradeAutofeederBtn) modalUpgradeAutofeederBtn.innerHTML = `<span>${upgradeText}</span><span>${this.resourceManager.stats.autofeederUpgradeCost}</span>`;
            }
        }

        // Car Ant Buttons & Stats
        const carAntsUnlocked = this.resourceManager.stats.carAntsUnlocked;
        
        toggleElementVisibility('unlock-car-ants', !carAntsUnlocked);
        toggleElementVisibility('buy-car-ant', carAntsUnlocked);

        if (carAntsUnlocked) {
            updateButtonState('buy-car-ant', !this.resourceManager.canBuyCarAnt());
        } else {
            updateButtonState('unlock-car-ants', !this.resourceManager.canUnlockCarAnts());
        }

        // Fire Ant Buttons & Stats
        const fireAntsUnlocked = this.resourceManager.stats.fireAntsUnlocked;
        toggleElementVisibility('unlock-fire-ants', !fireAntsUnlocked);
        toggleElementVisibility('buy-fire-ant', fireAntsUnlocked);

        if (fireAntsUnlocked) {
            updateButtonState('buy-fire-ant', !this.resourceManager.canBuyFireAnt());
        } else {
            updateButtonState('unlock-fire-ants', !this.resourceManager.canUnlockFireAnts());
        }

        // New Ant Types Button States
        // Fat Ant Buttons & Stats
        const fatAntsUnlocked = this.resourceManager.stats.fatAntsUnlocked;
        toggleElementVisibility('unlock-fat-ants', !fatAntsUnlocked);
        toggleElementVisibility('buy-fat-ant', fatAntsUnlocked);
        if (fatAntsUnlocked) {
            updateButtonState('buy-fat-ant', !this.resourceManager.canBuyFatAnt());
        } else {
            updateButtonState('unlock-fat-ants', !this.resourceManager.canUnlockFatAnts());
        }

        // Gas Ant Buttons & Stats
        const gasAntsUnlocked = this.resourceManager.stats.gasAntsUnlocked;
        toggleElementVisibility('unlock-gas-ants', !gasAntsUnlocked);
        toggleElementVisibility('buy-gas-ant', gasAntsUnlocked);
        if (gasAntsUnlocked) {
            updateButtonState('buy-gas-ant', !this.resourceManager.canBuyGasAnt());
        } else {
            updateButtonState('unlock-gas-ants', !this.resourceManager.canUnlockGasAnts());
        }

        // Electric Ant Buttons & Stats
        const electricAntsUnlocked = this.resourceManager.stats.electricAntsUnlocked;
        toggleElementVisibility('unlock-electric-ants', !electricAntsUnlocked);
        toggleElementVisibility('buy-electric-ant', electricAntsUnlocked);
        if (electricAntsUnlocked) {
            updateButtonState('buy-electric-ant', !this.resourceManager.canBuyElectricAnt());
        } else {
            updateButtonState('unlock-electric-ants', !this.resourceManager.canUnlockElectricAnts());
        }

        // Banana Throwing Ant Buttons & Stats
        const bananaThrowingAntsUnlocked = this.resourceManager.stats.bananaThrowingAntsUnlocked;
        toggleElementVisibility('unlock-banana-throwing-ants', !bananaThrowingAntsUnlocked);
        toggleElementVisibility('buy-banana-throwing-ant', bananaThrowingAntsUnlocked);
        if (bananaThrowingAntsUnlocked) {
            updateButtonState('buy-banana-throwing-ant', !this.resourceManager.canBuyBananaThrowingAnt());
        } else {
            updateButtonState('unlock-banana-throwing-ants', !this.resourceManager.canUnlockBananaThrowingAnts());
        }


        // Acid Ant
        const acidAntsUnlocked = this.resourceManager.stats.acidAntsUnlocked;
        toggleElementVisibility('unlock-acid-ants', !acidAntsUnlocked);
        toggleElementVisibility('buy-acid-ant', acidAntsUnlocked);
        updateButtonState(acidAntsUnlocked ? 'buy-acid-ant' : 'unlock-acid-ants',
            acidAntsUnlocked ? !this.resourceManager.canBuyAcidAnt() : !this.resourceManager.canUnlockAcidAnts());

        // Rainbow Ant
        const rainbowAntsUnlocked = this.resourceManager.stats.rainbowAntsUnlocked;
        toggleElementVisibility('unlock-rainbow-ants', !rainbowAntsUnlocked);
        toggleElementVisibility('buy-rainbow-ant', rainbowAntsUnlocked);
        updateButtonState(rainbowAntsUnlocked ? 'buy-rainbow-ant' : 'unlock-rainbow-ants',
            rainbowAntsUnlocked ? !this.resourceManager.canBuyRainbowAnt() : !this.resourceManager.canUnlockRainbowAnts());

        // Smoke Ant
        const smokeAntsUnlocked = this.resourceManager.stats.smokeAntsUnlocked;
        toggleElementVisibility('unlock-smoke-ants', !smokeAntsUnlocked);
        toggleElementVisibility('buy-smoke-ant', smokeAntsUnlocked);
        updateButtonState(smokeAntsUnlocked ? 'buy-smoke-ant' : 'unlock-smoke-ants',
            smokeAntsUnlocked ? !this.resourceManager.canBuySmokeAnt() : !this.resourceManager.canUnlockSmokeAnts());

        // Leaf Cutter Ant
        const leafCutterAntsUnlocked = this.resourceManager.stats.leafCutterAntsUnlocked;
        toggleElementVisibility('unlock-leaf-cutter-ants', !leafCutterAntsUnlocked);
        toggleElementVisibility('buy-leaf-cutter-ant', leafCutterAntsUnlocked);
        updateButtonState(leafCutterAntsUnlocked ? 'buy-leaf-cutter-ant' : 'unlock-leaf-cutter-ants',
            leafCutterAntsUnlocked ? !this.resourceManager.canBuyLeafCutterAnt() : !this.resourceManager.canUnlockLeafCutterAnts());


        // Juice Ant
        const juiceAntsUnlocked = this.resourceManager.stats.juiceAntsUnlocked;
        toggleElementVisibility('unlock-juice-ants', !juiceAntsUnlocked);
        toggleElementVisibility('buy-juice-ant', juiceAntsUnlocked);
        updateButtonState(juiceAntsUnlocked ? 'buy-juice-ant' : 'unlock-juice-ants',
            juiceAntsUnlocked ? !this.resourceManager.canBuyJuiceAnt() : !this.resourceManager.canUnlockJuiceAnts());

        // Crab Ant
        const crabAntsUnlocked = this.resourceManager.stats.crabAntsUnlocked;
        toggleElementVisibility('unlock-crab-ants', !crabAntsUnlocked);
        toggleElementVisibility('buy-crab-ant', crabAntsUnlocked);
        updateButtonState(crabAntsUnlocked ? 'buy-crab-ant' : 'unlock-crab-ants',
            crabAntsUnlocked ? !this.resourceManager.canBuyCrabAnt() : !this.resourceManager.canUnlockCrabAnts());


        // Spider Ant
        const spiderAntsUnlocked = this.resourceManager.stats.spiderAntsUnlocked;
        toggleElementVisibility('unlock-spider-ants', !spiderAntsUnlocked);
        toggleElementVisibility('buy-spider-ant', spiderAntsUnlocked);
        updateButtonState(spiderAntsUnlocked ? 'buy-spider-ant' : 'unlock-spider-ants',
            spiderAntsUnlocked ? !this.resourceManager.canBuySpiderAnt() : !this.resourceManager.canUnlockSpiderAnts());

        // Bomber Beetle
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

    /* ================= Boss UI ================= */

    // Update subtle score display during gameplay
    updateLiveScore() {
        // Only show score display during PLAYING state
        if (!this.game || this.game.state !== IdleAnts.Game.States.PLAYING) {
            if (this.elements.scoreDisplay) {
                this.elements.scoreDisplay.style.display = 'none';
            }
            return;
        }

        // Don't show score if session hasn't started yet
        if (!this.game.sessionStartTime) {
            if (this.elements.scoreDisplay) {
                this.elements.scoreDisplay.style.display = 'none';
            }
            return;
        }

        // Show score display
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.style.display = 'flex';
        }

        // Calculate session time
        const sessionTimeSeconds = Math.floor((Date.now() - this.game.sessionStartTime) / 1000);

        // Format time display (M:SS)
        const minutes = Math.floor(sessionTimeSeconds / 60);
        const seconds = sessionTimeSeconds % 60;
        const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Calculate current score (estimate)
        const gameData = {
            resourceManager: this.resourceManager,
            achievementManager: this.game.achievementManager,
            dailyChallengeManager: this.game.dailyChallengeManager,
            game: this.game
        };

        // Get leaderboard manager if available
        const leaderboardManager = this.game.leaderboardManager || this.game.victoryScreenManager?.leaderboardManager;

        let currentScore = 0;
        if (leaderboardManager) {
            currentScore = leaderboardManager.calculateScore(gameData);
        }

        // Update DOM elements (just timer and score)
        if (this.elements.sessionTimer) {
            this.elements.sessionTimer.textContent = timeDisplay;
        }
        if (this.elements.currentScore) {
            this.elements.currentScore.textContent = currentScore.toLocaleString();
        }
    }

    setupBossBar() {
        this.bossBarContainer = document.createElement('div');
        this.bossBarContainer.id = 'boss-bar-container';
        Object.assign(this.bossBarContainer.style, {
            position: 'fixed',
            bottom: '20px',
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
        this.loseScreen.innerHTML = `
            <h1>Colony Destroyed</h1>
            <p>The Queen has fallen and your colony is no more.</p>
            <p>The circle of life continues...</p>
            <button id="restart-game-btn" style="
                margin-top: 20px;
                padding: 15px 30px;
                font-size: 18px;
                background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%);
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            ">Start New Colony</button>
        `;
        document.body.appendChild(this.loseScreen);
        
        // Add restart functionality
        const restartBtn = document.getElementById('restart-game-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartGame();
            });
            
            // Add hover effect
            restartBtn.addEventListener('mouseenter', () => {
                restartBtn.style.transform = 'scale(1.05)';
                restartBtn.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
            });
            
            restartBtn.addEventListener('mouseleave', () => {
                restartBtn.style.transform = 'scale(1)';
                restartBtn.style.boxShadow = 'none';
            });
        }
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
    
    restartGame() {
        // Hide the lose screen
        this.loseScreen.style.display = 'none';
        
        // Trigger game restart
        if (IdleAnts.game && typeof IdleAnts.game.restartGame === 'function') {
            IdleAnts.game.restartGame();
        } else {
            // Fallback: reload the page
            window.location.reload();
        }
    }
    
    // Pause overlay methods
    showPauseOverlay() {
        if (!this.pauseOverlay) {
            this.createPauseOverlay();
        }
        this.pauseOverlay.style.display = 'flex';
    }
    
    hidePauseOverlay() {
        if (this.pauseOverlay) {
            this.pauseOverlay.style.display = 'none';
        }
    }
    
    createPauseOverlay() {
        this.pauseOverlay = document.createElement('div');
        this.pauseOverlay.id = 'pause-overlay';
        Object.assign(this.pauseOverlay.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            display: 'none',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            zIndex: 10000,
            fontSize: '2em'
        });
        
        this.pauseOverlay.innerHTML = `
            <h1>Game Paused</h1>
            <p>Press SPACE to continue</p>
        `;
        
        document.body.appendChild(this.pauseOverlay);
    }

    // Ability button update methods
    updateAbilityButtons() {
        if (!this.game || !this.game.abilityManager) return;

        // Show abilities bar during PLAYING, BOSS_INTRO, and BOSS_FIGHT states
        const abilitiesBar = document.getElementById('abilities-bar');
        if (abilitiesBar) {
            const showAbilities = this.game.state === IdleAnts.Game.States.PLAYING ||
                                 this.game.state === IdleAnts.Game.States.BOSS_INTRO ||
                                 this.game.state === IdleAnts.Game.States.BOSS_FIGHT;
            abilitiesBar.style.display = showAbilities ? 'flex' : 'none';
        }

        // Get current ability states
        const abilitiesState = this.game.abilityManager.getAbilitiesState();

        // Update each ability button
        Object.keys(abilitiesState).forEach(abilityId => {
            const ability = abilitiesState[abilityId];
            const button = document.getElementById(`ability-${abilityId}`);

            if (!button) return;

            // Update cooldown display
            const cooldownSpan = button.querySelector('.ability-cooldown');

            if (ability.ready) {
                // Ready to use
                button.classList.remove('on-cooldown');
                button.classList.remove('active');
                button.style.setProperty('--cooldown-percent', '0%');
                if (cooldownSpan) {
                    cooldownSpan.textContent = '';
                }
            } else {
                // On cooldown
                button.classList.add('on-cooldown');

                // Calculate cooldown progress
                const percent = (ability.remainingCooldown / ability.cooldown) * 100;
                button.style.setProperty('--cooldown-percent', `${percent}%`);

                // Display remaining seconds
                const seconds = Math.ceil(ability.remainingCooldown / 1000);
                if (cooldownSpan) {
                    cooldownSpan.textContent = `${seconds}s`;
                }
            }

            // Mark as active if ability effect is currently active
            if (ability.active) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Upgrade menu methods
    showUpgradeMenu() {
        // This could be implemented to show a specific upgrade modal
        // For now, we'll just ensure the game state is properly handled
        console.log('Show upgrade menu called');
    }
    
    closeUpgradeMenu() {
        // Close any open upgrade-related modals
        console.log('Close upgrade menu called');
    }
} 
