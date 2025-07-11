// src/Game.js
IdleAnts.Game = class {
    // Define game state constants
    static States = {
        INITIALIZING: 'initializing', // Loading assets and setup
        PLAYING: 'playing',           // Main gameplay
        PAUSED: 'paused',             // Game paused
        UPGRADING: 'upgrading'        // Player is viewing/selecting upgrades
    };
    
    constructor() {
        // Make app accessible globally for components that need it
        IdleAnts.app = this;
        
        // Initialize game state
        this.state = IdleAnts.Game.States.INITIALIZING;
        
        // Detect if running on mobile device
        this.isMobileDevice = this.detectMobileDevice();
        
        // Map configuration
        this.mapConfig = {
            width: 3000,  // Larger world width
            height: 2000, // Larger world height
            viewport: {
                x: 0,      // Camera position X will be set after setup
                y: 0,      // Camera position Y will be set after setup
                speed: 10  // Camera movement speed
            },
            zoom: {
                level: 1.0,    // Initial zoom level (will be adjusted based on map size)
                min: 0.25,     // Minimum zoom (25% - zoomed out, but will be constrained)
                max: 2.0,      // Maximum zoom (200% - zoomed in)
                speed: 0.1     // Zoom speed per wheel tick
            }
        };

        // Frame counter for periodic updates
        this.frameCounter = 0;
        // lastMouseX and lastMouseY are still needed here for the hoverIndicator logic
        this.lastMouseX = undefined;
        this.lastMouseY = undefined;
        
        // Create the PIXI application
        this.app = new PIXI.Application({
            background: '#78AB46', // Grass green background
            resizeTo: document.getElementById('game-canvas-container'),
        });
        document.getElementById('game-canvas-container').appendChild(this.app.view);
        
        // Initialize managers
        this.resourceManager = new IdleAnts.Managers.ResourceManager();
        this.assetManager = new IdleAnts.Managers.AssetManager(this.app);
        
        // Create container for all game elements
        this.worldContainer = new PIXI.Container();
        this.app.stage.addChild(this.worldContainer);
        
        // Create minimap
        this.minimapContainer = new PIXI.Container();
        this.app.stage.addChild(this.minimapContainer);
        
        this.cameraManager = new IdleAnts.Managers.CameraManager(this.app, this.mapConfig, this.worldContainer, this);
        
        // Run any registered initialization functions
        this.runInitHooks();
        
        // Load assets before initializing other managers
        this.assetManager.loadAssets().then(() => {
            this.backgroundManager = new IdleAnts.Managers.BackgroundManager(this.app, this.assetManager, this.worldContainer);
            this.entityManager = new IdleAnts.Managers.EntityManager(this.app, this.assetManager, this.resourceManager, this.worldContainer);
            this.effectManager = new IdleAnts.Managers.EffectManager(this.app);
            
            // Initialize audio manager
            IdleAnts.AudioManager.init();
            
            // Initialize achievement manager
            this.achievementManager = new IdleAnts.Managers.AchievementManager(this.resourceManager, this.effectManager);
            
            // Initialize daily challenge manager
            this.dailyChallengeManager = new IdleAnts.Managers.DailyChallengeManager(this.resourceManager, this.achievementManager);
            
            // Make it accessible globally for UI interactions
            IdleAnts.game = this;
            
            // Set up effect manager reference
            this.entityManager.setEffectManager(this.effectManager);
            
            // UI Manager needs access to the game for buttons
            this.uiManager = new IdleAnts.Managers.UIManager(this.resourceManager, this, this.effectManager);

            // Initialize InputManager after other core managers it might depend on (like camera, entity, resource)
            this.inputManager = new IdleAnts.Managers.InputManager(this.app, this, this.cameraManager, this.resourceManager, this.entityManager, this.mapConfig);
            
            this.setupGame();
            this.setupEventListeners(); // This will be simplified
            this.startGameLoop();
            this.setupMinimap();
            this.updateMinimap();
            
            this.cameraManager.centerCameraOnNest();
            
            this.setupAudioResumeOnInteraction();
            this.startBackgroundMusic();
            this.transitionToState(IdleAnts.Game.States.PLAYING);
        });
    }
    
    // Setup audio resume on user interaction
    setupAudioResumeOnInteraction() {
        // List of events that count as user interaction
        const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
        
        // Helper function to attempt resuming audio context
        const resumeAudio = () => {
            if (IdleAnts.AudioManager) {
                IdleAnts.AudioManager.resumeAudioContext();
                
                // Re-start BGM if needed
                if (IdleAnts.AudioAssets && IdleAnts.AudioAssets.BGM && IdleAnts.AudioAssets.BGM.MAIN_THEME) {
                    IdleAnts.AudioManager.playBGM(IdleAnts.AudioAssets.BGM.MAIN_THEME.id);
                }
                
                // Remove event listeners after first successful interaction
                interactionEvents.forEach(event => {
                    document.removeEventListener(event, resumeAudio);
                });
                
                console.log('Audio resumed after user interaction');
            }
        };
        
        // Add event listeners
        interactionEvents.forEach(event => {
            document.addEventListener(event, resumeAudio, { once: false });
        });
    }
    
    // Start background music
    startBackgroundMusic() {
        // Play main theme BGM
        if (IdleAnts.AudioAssets.BGM.MAIN_THEME) {
            IdleAnts.AudioManager.playBGM(IdleAnts.AudioAssets.BGM.MAIN_THEME.id);
        }
    }
    
    // Play sound effects
    playSoundEffect(soundId) {
        if (soundId && IdleAnts.AudioManager) {
            IdleAnts.AudioManager.playSFX(soundId);
        }
    }
    
    // Toggle sound on/off
    toggleSound() {
        const isMuted = IdleAnts.AudioManager.toggleMute();
        
        // Update the UI button
        const soundButton = document.getElementById('toggle-sound');
        if (soundButton) {
            const icon = soundButton.querySelector('i');
            if (icon) {
                icon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
            }
            soundButton.innerHTML = icon ? icon.outerHTML : '';
            soundButton.innerHTML += isMuted ? 'Sound: OFF' : 'Sound: ON';
        }
        
        return isMuted;
    }
    
    // State transition method
    transitionToState(newState) {
        // Handle exit actions for current state
        switch(this.state) {
            case IdleAnts.Game.States.INITIALIZING:
                // No special exit actions
                break;
                
            case IdleAnts.Game.States.PAUSED:
                // Resume game logic
                break;
                
            case IdleAnts.Game.States.UPGRADING:
                // Close upgrade menu if it's open
                if (this.uiManager) {
                    this.uiManager.closeUpgradeMenu();
                }
                break;
        }
        
        // Set the new state
        this.state = newState;
        
        // Handle entry actions for new state
        switch(newState) {
            case IdleAnts.Game.States.PLAYING:
                // Ensure UI is updated
                if (this.uiManager) {
                    this.uiManager.updateUI();
                }
                break;
                
            case IdleAnts.Game.States.PAUSED:
                // Show pause overlay
                if (this.uiManager) {
                    this.uiManager.showPauseOverlay();
                }
                break;
                
            case IdleAnts.Game.States.UPGRADING:
                // Show upgrade menu
                if (this.uiManager) {
                    this.uiManager.showUpgradeMenu();
                }
                break;
        }
        
        // Notify any listeners of state change
        this.onStateChanged();
    }
    
    // Method to handle state change side effects
    onStateChanged() {
        // Update UI elements based on the new state
        if (this.uiManager) {
            this.uiManager.updateUI();
        }
        
        // Log state change for debugging
        console.log(`Game state changed to: ${this.state}`);
    }
    
    setupGame() {
        // Create background with map dimensions
        this.backgroundManager.createBackground(this.mapConfig.width, this.mapConfig.height);
        
        // Initialize world container scale based on zoom level (CameraManager handles this now mostly)
        // this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);
        if (this.cameraManager) this.cameraManager.initializeZoomLevels(); // Ensure zoom is set up
        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level); // Apply initial scale
        
        // Set up game entities
        this.entityManager.setupEntities();
        
        // Initialize ant attributes
        this.entityManager.updateAntsSpeed();
        this.entityManager.updateAntsCapacity();
        
        // Initialize UI by updating it
        this.uiManager.updateUI();
    }
    
    setupEventListeners() {
        // Most event listeners are now in InputManager.js
        // Keep window resize and orientation change here as they affect more than just input/camera directly.
        // Or, InputManager could call back to Game for these if preferred for full centralization.

        // Add event listener for window resize
        window.addEventListener('resize', () => {
            this.updateMinimap(); 
            if (this.cameraManager) {
                this.cameraManager.handleResizeOrOrientationChange();
            }
            if (this.uiManager) { // Also update UI on resize
                this.uiManager.updateUI();
            }
        });

        // Handle orientation change on mobile devices (moved from original setupEventListeners)
        if (this.isMobileDevice) {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    if (this.cameraManager) {
                        this.cameraManager.handleResizeOrOrientationChange();
                    }
                    this.updateMinimap();
                    if (this.uiManager) {
                        this.uiManager.updateUI();
                    }
                }, 300); 
            });
        }

        // Create and track hover effect (Graphics object setup)
        this.hoverIndicator = new PIXI.Graphics();
        this.app.stage.addChild(this.hoverIndicator);
        // Actual update of hoverIndicator position is handled by InputManager updating lastMouseX/Y,
        // and gameLoop calling updateHoverIndicator().

        // Add sound toggle button event listener (remains, as it's UI specific not general input)
        const soundToggleButton = document.getElementById('toggle-sound');
        if (soundToggleButton) {
            soundToggleButton.addEventListener('click', () => {
                this.toggleSound();
                IdleAnts.AudioManager.resumeAudioContext();
            });
        }
    }
    
    updateHoverIndicator(x, y) {
        // Clear previous drawing
        this.hoverIndicator.clear();
        
        // Get the current food type
        const currentFoodType = this.resourceManager.getCurrentFoodType();
        
        // Calculate world position by adding camera position
        const worldX = (x / this.mapConfig.zoom.level) + this.mapConfig.viewport.x;
        const worldY = (y / this.mapConfig.zoom.level) + this.mapConfig.viewport.y;
        
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
                // UI will be updated in gameLoop at optimized intervals
            }, 1000);
        };
        
        // Start the initialization process
        ensureDOMLoaded();
    }
    
    setupMinimap() {
        // Settings for the minimap
        const padding = 10;
        const size = 150;
        const scale = size / Math.max(this.mapConfig.width, this.mapConfig.height);
        
        // Create minimap background
        this.minimap = new PIXI.Graphics();
        this.minimap.beginFill(0x000000, 0.6);
        this.minimap.drawRect(0, 0, size, size * (this.mapConfig.height / this.mapConfig.width));
        this.minimap.endFill();
        
        // Position at bottom right of the screen
        this.minimap.position.set(
            this.app.screen.width - size - padding,
            this.app.screen.height - (size * (this.mapConfig.height / this.mapConfig.width)) - padding
        );
        
        // Add to the minimap container
        this.minimapContainer.addChild(this.minimap);
        
        // Create visuals for nest, ants, and food
        this.minimapVisuals = new PIXI.Graphics();
        this.minimap.addChild(this.minimapVisuals);
        
        // Create viewport indicator
        this.minimapViewport = new PIXI.Graphics();
        this.minimap.addChild(this.minimapViewport);
        
        // Add click event to minimap for quick navigation
        this.minimap.interactive = true;
        this.minimap.buttonMode = true;
        this.minimap.on('pointerdown', (event) => {
            const minimapBounds = this.minimap.getBounds();
            const clickX = event.data.global.x - minimapBounds.x;
            const clickY = event.data.global.y - minimapBounds.y;
            
            // Calculate where in the world map this corresponds to
            const worldX = (clickX / size) * this.mapConfig.width;
            const worldY = (clickY / size) * this.mapConfig.height;
            
            // Center the view on this location
            if (this.cameraManager) {
                this.cameraManager.centerViewOnPosition(worldX, worldY);
            }
        });
        
        // Remove navigation helper - will be added by user later
        // this.addNavigationHelper();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.minimap.position.set(
                this.app.screen.width - size - padding,
                this.app.screen.height - (size * (this.mapConfig.height / this.mapConfig.width)) - padding
            );
            
            // Update navigation helper position - not needed now
            // this.updateNavigationHelperPosition();
        });
    }
    
    updateMinimap() {
        if (!this.minimapVisuals || !this.minimapViewport) return;
        
        // Clear existing graphics
        this.minimapVisuals.clear();
        this.minimapViewport.clear();
        
        // Calculate scale ratio between minimap and world
        const minimapWidth = this.minimap.width;
        const minimapHeight = this.minimap.height;
        const scaleX = minimapWidth / this.mapConfig.width;
        const scaleY = minimapHeight / this.mapConfig.height;
        
        // Draw nest
        if (this.entityManager.nest) {
            const nestPos = this.entityManager.nestPosition;
            this.minimapVisuals.beginFill(0x8B4513);
            this.minimapVisuals.drawCircle(
                nestPos.x * scaleX,
                nestPos.y * scaleY,
                5
            );
            this.minimapVisuals.endFill();
        }
        
        // Draw ants as tiny dots
        this.minimapVisuals.beginFill(0xFFFFFF);
        this.entityManager.entities.ants.forEach(ant => {
            this.minimapVisuals.drawCircle(ant.x * scaleX, ant.y * scaleY, 1);
        });
        this.entityManager.entities.flyingAnts.forEach(ant => {
            this.minimapVisuals.drawCircle(ant.x * scaleX, ant.y * scaleY, 1);
        });
        this.minimapVisuals.endFill();
        
        // Draw Car Ants as red dots (or another distinct color)
        if (this.entityManager.entities.carAnts && this.entityManager.entities.carAnts.length > 0) {
            this.minimapVisuals.beginFill(0xFF0000); // Red for Car Ants
            this.entityManager.entities.carAnts.forEach(carAnt => {
                this.minimapVisuals.drawCircle(carAnt.x * scaleX, carAnt.y * scaleY, 1.5); // Slightly larger dot for Car Ants
            });
            this.minimapVisuals.endFill();
        }
        
        // Draw food as green dots
        this.minimapVisuals.beginFill(0x00FF00);
        this.entityManager.entities.foods.forEach(food => {
            this.minimapVisuals.drawCircle(food.x * scaleX, food.y * scaleY, 2);
        });
        this.minimapVisuals.endFill();
        
        // Draw viewport indicator - adjusted for zoom level
        this.minimapViewport.lineStyle(1, 0xFFFFFF, 0.8);
        
        // Calculate the visible area based on zoom level
        const visibleWidth = (this.app.screen.width / this.mapConfig.zoom.level);
        const visibleHeight = (this.app.screen.height / this.mapConfig.zoom.level);
        
        this.minimapViewport.drawRect(
            this.mapConfig.viewport.x * scaleX,
            this.mapConfig.viewport.y * scaleY,
            visibleWidth * scaleX,
            visibleHeight * scaleY
        );
    }
    
    gameLoop() {
        // Only update game logic when in PLAYING state
        if (this.state !== IdleAnts.Game.States.PLAYING) {
            // Still update hover indicator if paused or upgrading, but not if initializing
            if (this.state !== IdleAnts.Game.States.INITIALIZING && this.lastMouseX !== undefined && this.lastMouseY !== undefined) {
                this.updateHoverIndicator(this.lastMouseX, this.lastMouseY);
            }
            return;
        }
        
        // Update frame counter
        this.frameCounter++;
        
        // Update input manager (which internally updates camera based on keys)
        if (this.inputManager) {
            this.inputManager.update(); 
        }
        
        // Update entities
        this.entityManager.update();
        
        // Update effects
        this.effectManager.update();
        
        // Update UI every 60 frames (approximately once per second at 60fps)
        // This is frequent enough for smooth updates but not too frequent to cause performance issues
        if (this.frameCounter % 60 === 0) {
            this.uiManager.updateUI();
        }
        
        // Update minimap less frequently for better performance
        if (this.frameCounter % 120 === 0) {
            this.updateMinimap();
        }
        
        // Update food collection rate more frequently for accuracy
        if (this.frameCounter % 10 === 0) {
            // Force an update of the actual food rate
            this.resourceManager.updateActualFoodRate();
            
            // Update just the food rate display without updating the entire UI
            const actualRate = this.resourceManager.getActualFoodRate();
            const actualRateElement = document.getElementById('food-per-second-actual');
            if (actualRateElement) {
                actualRateElement.textContent = actualRate.toFixed(1);
            }
        }
        
        // Check for autofeeder activation
        if (this.resourceManager.stats.autofeederUnlocked && 
            this.resourceManager.stats.autofeederLevel > 0 &&
            this.frameCounter % this.resourceManager.stats.autofeederInterval === 0) {
            this.activateAutofeeder();
        }
        
        // Always update hover indicator if mouse/touch is over canvas and game is not initializing
        if (this.state !== IdleAnts.Game.States.INITIALIZING && this.lastMouseX !== undefined && this.lastMouseY !== undefined) {
            this.updateHoverIndicator(this.lastMouseX, this.lastMouseY);
        }
    }
    
    // Toggle pause state
    togglePause() {
        if (this.state === IdleAnts.Game.States.PAUSED) {
            this.transitionToState(IdleAnts.Game.States.PLAYING);
        } else if (this.state === IdleAnts.Game.States.PLAYING) {
            this.transitionToState(IdleAnts.Game.States.PAUSED);
        }
    }
    
    // Show upgrade menu
    showUpgrades() {
        if (this.state === IdleAnts.Game.States.PLAYING) {
            this.transitionToState(IdleAnts.Game.States.UPGRADING);
        }
    }
    
    // Close upgrade menu and return to playing
    closeUpgrades() {
        if (this.state === IdleAnts.Game.States.UPGRADING) {
            this.transitionToState(IdleAnts.Game.States.PLAYING);
        }
    }
    
    // Upgrade and purchase methods act as coordinators between managers
    buyAnt() {
        const antCost = this.resourceManager.stats.antCost;
        if (this.resourceManager.canAfford(antCost) && 
            this.resourceManager.stats.ants < this.resourceManager.stats.maxAnts) {
            
            // Handle resource management
            this.resourceManager.spendFood(antCost);
            this.resourceManager.stats.ants += 1;
            this.resourceManager.updateFoodPerSecond();
            this.resourceManager.updateAntCost();
            
            // Delegate entity creation to EntityManager
            this.entityManager.createAnt();
            
            // Track daily challenge
            if (this.dailyChallengeManager) {
                this.dailyChallengeManager.trackAntPurchase();
            }
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-ant', 'New ant added!');

            // After successfully buying an ant, play the sound effect
            if (IdleAnts.AudioAssets.SFX.ANT_SPAWN) {
                this.playSoundEffect(IdleAnts.AudioAssets.SFX.ANT_SPAWN.id);
            }
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
            // Delegate entity creation to EntityManager
            this.entityManager.createFlyingAnt();
            
            // Update UI
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
            this.resourceManager.updateFoodUpgradeCost();
            
            // Try to upgrade the food tier
            const tierUpgraded = this.resourceManager.upgradeFoodTier();
            
            // Track achievement
            if (this.achievementManager) {
                this.achievementManager.trackUpgrade();
            }
            
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
            // Handle resource management
            this.resourceManager.spendFood(expandCost);
            this.resourceManager.stats.maxAnts += 5;
            this.resourceManager.stats.expandCost = Math.floor(this.resourceManager.stats.expandCost * 1.3);
            
            // Delegate nest expansion to EntityManager
            this.entityManager.expandNest();
            
            // Track achievements
            if (this.achievementManager) {
                this.achievementManager.trackUpgrade();
                this.achievementManager.checkAchievements(); // Check for expand colony achievement
            }
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('expand-colony', 'Colony expanded!');
        }
    }
    
    upgradeSpeed() {
        const speedUpgradeCost = this.resourceManager.stats.speedUpgradeCost;
        if (this.resourceManager.canAfford(speedUpgradeCost)) {
            // Handle resource management
            this.resourceManager.spendFood(speedUpgradeCost);
            this.resourceManager.upgradeSpeedMultiplier(0.2); // Increase speed by 20% per upgrade
            this.resourceManager.updateSpeedUpgradeCost();
            
            // Delegate entity updates to EntityManager
            this.entityManager.updateAntsSpeed();
            
            // Track achievements
            if (this.achievementManager) {
                this.achievementManager.trackUpgrade();
                this.achievementManager.trackSpeedUpgrade();
            }
            
            // Track daily challenge
            if (this.dailyChallengeManager) {
                this.dailyChallengeManager.trackSpeedUpgrade();
            }
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('upgrade-speed', 'Ants move faster!');
        }
    }
    
    upgradeStrength() {
        const strengthUpgradeCost = this.resourceManager.stats.strengthUpgradeCost;
        if (this.resourceManager.canAfford(strengthUpgradeCost)) {
            // Handle resource management
            this.resourceManager.spendFood(strengthUpgradeCost);
            this.resourceManager.upgradeStrengthMultiplier(1); // Increase strength by 1 per upgrade
            this.resourceManager.updateStrengthUpgradeCost();
            
            // Delegate entity updates to EntityManager
            this.entityManager.updateAntsCapacity();
            
            // Track achievements
            if (this.achievementManager) {
                this.achievementManager.trackUpgrade();
                this.achievementManager.trackStrengthUpgrade();
            }
            
            // Update UI
            this.uiManager.updateUI();
            
            // Get the current strength value
            const strengthValue = this.resourceManager.stats.strengthMultiplier;
            // Calculate the collection speed bonus (keeping the same formula)
            const reductionPercentage = Math.min(75, Math.round((strengthValue - 1) * 25));
            
            // Update message to reflect both benefits of strength upgrade
            this.uiManager.showUpgradeEffect('upgrade-strength', 
                `Ants now have strength ${strengthValue} and collect ${reductionPercentage}% faster!`);
        }
    }
    
    // Queen now handles her own larvae production internally; no external call needed

    detectMobileDevice() {
        // Check if device is mobile based on user agent
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Regular expressions for mobile devices
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        
        // Check if touch events are supported
        const hasTouchEvents = 'ontouchstart' in window || 
                              navigator.maxTouchPoints > 0 || 
                              navigator.msMaxTouchPoints > 0;
        
        // Return true if user agent matches mobile pattern or has touch events
        const isMobile = mobileRegex.test(userAgent) || hasTouchEvents;
        
        console.log('Mobile device detected:', isMobile);
        
        // Apply mobile-specific settings if on mobile
        if (isMobile) {
            // Adjust game settings for mobile
            this.adjustSettingsForMobile();
        }
        
        return isMobile;
    }

    adjustSettingsForMobile() {
        // Adjust game settings for better mobile experience
        
        // Increase UI button sizes for touch
        const buttons = document.querySelectorAll('.upgrade-btn');
        buttons.forEach(button => {
            button.style.minHeight = '44px'; // Minimum touch target size
        });
        
        // Adjust zoom speed for pinch gestures
        if (!this.mapConfig) {
            // Create mapConfig if it doesn't exist yet
            this.mapConfig = {
                zoom: { speed: 0.1 }
            };
        } else if (!this.mapConfig.zoom) {
            this.mapConfig.zoom = { speed: 0.1 };
        } else {
            // Adjust zoom speed to be more responsive on mobile
            this.mapConfig.zoom.speed = 0.1;
        }
        
        // Add a small delay to food placement to avoid accidental taps
        this.mobileSettings = {
            tapDelay: 100, // ms
            minSwipeDistance: 10, // px
        };
        
        // Add viewport meta tag programmatically if not already present
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        
        // iOS-specific fixes
        
        // Fix for iOS Safari 100vh issue (viewport height calculation)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
            // Apply fix for iOS Safari viewport height
            document.documentElement.style.height = '100%';
            document.body.style.height = '100%';
            
            // Fix for iOS Safari bounce effect
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            // Adjust UI container for iOS notch if present
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.style.paddingTop = 'env(safe-area-inset-top)';
                gameContainer.style.paddingBottom = 'env(safe-area-inset-bottom)';
            }
            
            // Make UI toggle button easier to tap on iOS
            const uiToggle = document.getElementById('ui-toggle');
            if (uiToggle) {
                uiToggle.style.width = '44px';
                uiToggle.style.height = '44px';
                uiToggle.style.fontSize = '18px';
            }
        }
        
        // Disable long-press context menu on mobile
        window.addEventListener('contextmenu', (e) => {
            if (this.isMobileDevice) {
                e.preventDefault();
            }
        }, false);
        
        // Disable double-tap to zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd < 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, {passive: false});
    }

    /**
     * Run any registered initialization hooks
     */
    runInitHooks() {
        // Check if there are any registered initialization functions
        if (Array.isArray(IdleAnts.onInit)) {
            console.log(`Running ${IdleAnts.onInit.length} initialization hooks`);
            // Run each initialization function with this game instance as the argument
            IdleAnts.onInit.forEach(initFn => {
                try {
                    initFn(this);
                } catch (error) {
                    console.error('Error in initialization hook:', error);
                }
            });
        }
    }

    unlockAutofeeder() {
        if (this.resourceManager.unlockAutofeeder()) {
            // Show upgrade effect
            this.uiManager.showUpgradeEffect('unlock-autofeeder', 'Autofeeder Unlocked!');
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.updateButtonStates();
            
            return true;
        }
        return false;
    }
    
    upgradeAutofeeder() {
        if (this.resourceManager.upgradeAutofeeder()) {
            // Show upgrade effect
            this.uiManager.showUpgradeEffect('upgrade-autofeeder', `Autofeeder Level ${this.resourceManager.stats.autofeederLevel}!`);
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.updateButtonStates();
            
            return true;
        }
        return false;
    }
    
    // Delegates autofeeder activation to EntityManager
    activateAutofeeder() {
        if (this.entityManager && typeof this.entityManager.activateAutofeeder === 'function') {
            this.entityManager.activateAutofeeder();
        }
    }
    
    // Queen ant methods
    unlockQueen() {
        if (this.resourceManager.unlockQueen()) {
            // Show unlock effect
            this.uiManager.showUpgradeEffect('unlock-queen', 'Queen Ant Unlocked!');
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.updateButtonStates();
            
            return true;
        }
        return false;
    }
    
    buyQueen() {
        if (this.resourceManager.buyQueen()) {
            // Show purchase effect
            this.uiManager.showUpgradeEffect('buy-queen', 'Queen Ant Purchased!');
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.updateButtonStates();
            
            return true;
        }
        return false;
    }
    
    upgradeQueen() {
        if (this.resourceManager.upgradeQueen()) {
            // Show upgrade effect
            this.uiManager.showUpgradeEffect('upgrade-queen', `Queen Level ${this.resourceManager.stats.queenUpgradeLevel}!`);
            
            // Update UI
            this.uiManager.updateUI();
            this.uiManager.updateButtonStates();
            
            return true;
        }
        return false;
    }

    // Car Ant Game Logic Methods
    unlockCarAnts() {
        if (this.resourceManager.unlockCarAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-car-ants', 'Car Ants Unlocked! Bay available.');
            return true;
        }
        return false;
    }

    buyCarAnt() {
        if (this.resourceManager.buyCarAnt()) {
            this.entityManager.createCarAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-car-ant', 'Car Ant built!');
            // Potentially play a car sound effect
            // if (IdleAnts.AudioAssets.SFX.CAR_ANT_SPAWN) {
            //     this.playSoundEffect(IdleAnts.AudioAssets.SFX.CAR_ANT_SPAWN.id);
            // }
            return true;
        }
        return false;
    }

    expandCarAntCapacity() {
        if (this.resourceManager.expandCarAntCapacity()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('expand-car-ants', 'Car Ant Bay Expanded!');
            return true;
        }
        return false;
    }

    // Fire Ant Game Logic Methods
    unlockFireAnts() {
        if (this.resourceManager.unlockFireAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-fire-ants', 'Fire Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyFireAnt() {
        if (this.resourceManager.buyFireAnt()) {
            this.entityManager.createFireAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-fire-ant', 'Fire Ant added!');
            return true;
        }
        return false;
    }

    expandFireAntCapacity() {
        if (this.resourceManager.expandFireAntCapacity()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('expand-fire-ants', 'Fire Ant capacity expanded!');
            return true;
        }
        return false;
    }
}; 