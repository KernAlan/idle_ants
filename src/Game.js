// src/Game.js - Refactored Main Game Controller
// Delegates responsibilities to focused managers for better SRP adherence

// Check specifically for Game managers
const requiredManagers = ['GameAudioManager', 'GameUpgradeManager', 'GameBossManager', 'GameMinimapManager', 'StateManager'];
const missing = requiredManagers.filter(mgr => !IdleAnts.Game || !IdleAnts.Game[mgr]);
if (missing.length > 0) {
    console.warn('[Game.js] Missing Game managers:', missing);
}

// Define the Game class in a separate namespace to avoid conflicts
IdleAnts.GameClass = class {
    // Import States from StateManager for backward compatibility
    static States = (IdleAnts.Game && IdleAnts.Game.StateManager && IdleAnts.Game.StateManager.States) ? IdleAnts.Game.StateManager.States : {
        INITIALIZING: 'initializing',
        PLAYING: 'playing',
        PAUSED: 'paused',
        UPGRADING: 'upgrading',
        BOSS_INTRO: 'boss_intro',
        BOSS_FIGHT: 'boss_fight',
        WIN: 'win',
        LOSE: 'lose'
    };
    
    constructor() {
        // Make app accessible globally for components that need it
        IdleAnts.app = this;
        
        // Initialize game state
        this.state = IdleAnts.GameClass.States.INITIALIZING;
        
        // Initialize core properties
        this.frameCounter = 0;
        this.lastMouseX = undefined;
        this.lastMouseY = undefined;
        this.isMobileDevice = this.detectMobileDevice();
        
        // Map configuration
        this.mapConfig = {
            width: 3000,
            height: 2000,
            viewport: { x: 0, y: 0, speed: 10 },
            zoom: { level: 1.0, min: 0.25, max: 2.0, speed: 0.1 }
        };
        
        // Initialize PIXI application
        this.initializePIXI();
        
        // Initialize all game managers
        this.initializeManagers();
        
        // Load assets and complete setup
        this.loadAssetsAndCompleteSetup();
    }

    /**
     * Initialize PIXI application and core containers
     */
    initializePIXI() {
        this.app = new PIXI.Application({
            background: '#78AB46',
            resizeTo: document.getElementById('game-canvas-container'),
        });
        document.getElementById('game-canvas-container').appendChild(this.app.view);
        
        // Create main game containers
        this.worldContainer = new PIXI.Container();
        this.app.stage.addChild(this.worldContainer);
        
        this.minimapContainer = new PIXI.Container();
        this.app.stage.addChild(this.minimapContainer);
        
        // PIXI setup complete - entities will be added by entity managers
    }

    /**
     * Initialize all game managers with proper delegation
     */
    initializeManagers() {
        // Core managers
        this.resourceManager = new IdleAnts.Managers.ResourceManager();
        this.assetManager = new IdleAnts.Managers.AssetManager(this.app);
        this.cameraManager = new IdleAnts.Managers.CameraManager(this.app, this.worldContainer, this.mapConfig, this);
        
        // Execute asset registration functions
        if (IdleAnts.onInit && Array.isArray(IdleAnts.onInit)) {
            IdleAnts.onInit.forEach((initFn, index) => {
                try {
                    initFn(this);
                } catch (error) {
                    console.error(`[Game] Error executing asset registration function ${index + 1}:`, error);
                }
            });
        } else {
            console.warn('[Game] No asset registration functions found in IdleAnts.onInit');
        }
        
        // Game-specific managers (extracted from Game.js) with safety checks
        try {
            if (IdleAnts.Game && IdleAnts.Game.GameAudioManager) {
                this.gameAudioManager = new IdleAnts.Game.GameAudioManager(this);
            } else {
                console.warn('[Game] GameAudioManager not available');
                this.gameAudioManager = { 
                    startBackgroundMusic: () => {}, 
                    playSoundEffect: () => {}, 
                    toggleSound: () => {} 
                };
            }
            
            if (IdleAnts.Game && IdleAnts.Game.GameUpgradeManager) {
                this.gameUpgradeManager = new IdleAnts.Game.GameUpgradeManager(this);
            } else {
                console.warn('[Game] GameUpgradeManager not available');
                this.gameUpgradeManager = {
                    buyAnt: () => {
                        console.warn('GameUpgradeManager.buyAnt not available');
                        return false;
                    }
                };
            }
            
            if (IdleAnts.Game && IdleAnts.Game.GameBossManager) {
                this.gameBossManager = new IdleAnts.Game.GameBossManager(this);
            } else {
                console.warn('[Game] GameBossManager not available');
                this.gameBossManager = { 
                    startBossFight: () => {}, 
                    triggerBoss: false,
                    onBossDefeated: () => {},
                    onColonyWiped: () => {}
                };
            }
            
            if (IdleAnts.Game && IdleAnts.Game.GameMinimapManager) {
                this.gameMinimapManager = new IdleAnts.Game.GameMinimapManager(this);
            } else {
                console.warn('[Game] GameMinimapManager not available');
                this.gameMinimapManager = { updateMinimap: () => {}, resize: () => {} };
            }
        } catch (error) {
            console.error('[Game] Failed to initialize game managers:', error);
            // Create fallback managers
            this.gameAudioManager = { startBackgroundMusic: () => {}, playSoundEffect: () => {}, toggleSound: () => {} };
            this.gameUpgradeManager = {};
            this.gameBossManager = { startBossFight: () => {}, triggerBoss: false, onBossDefeated: () => {}, onColonyWiped: () => {} };
            this.gameMinimapManager = { updateMinimap: () => {}, resize: () => {} };
        }
        
        // State and input managers
        this.initializeStateManager();
        this.initializeCinematicManager();
        
        // Run initialization hooks
        this.runInitHooks();
    }

    /**
     * Initialize state manager with fallback
     */
    initializeStateManager() {
        if (IdleAnts.Game && IdleAnts.Game.StateManager) {
            this.stateManager = new IdleAnts.Game.StateManager(this);
        } else {
            console.warn('[Game] StateManager not available - using fallback');
            this.stateManager = { 
                getState: () => this.state,
                setState: (newState) => { this.state = newState; }
            };
        }
    }

    /**
     * Initialize cinematic manager with fallback
     */
    initializeCinematicManager() {
        if (IdleAnts.Game && IdleAnts.Game.CinematicManager) {
            this.cinematicManager = new IdleAnts.Game.CinematicManager(this);
        } else {
            console.warn('[Game] CinematicManager not available - using fallback');
            this.cinematicManager = null;
        }
    }

    /**
     * Load assets and complete game setup
     */
    loadAssetsAndCompleteSetup() {
        this.assetManager.loadAssets().then(() => {
            // Initialize remaining managers after assets are loaded
            this.backgroundManager = new IdleAnts.Managers.BackgroundManager(this.app, this.assetManager, this.worldContainer);
            this.entityManager = new IdleAnts.Managers.EntityManager(this.app, this.assetManager, this.resourceManager, this.worldContainer);
            this.effectManager = new IdleAnts.Managers.EffectManager(this.app);
            
            // Initialize AudioManager (module pattern, not constructor)
            if (IdleAnts.AudioManager) {
                this.audioManager = IdleAnts.AudioManager;
                this.audioManager.init();
            } else {
                console.warn('[Game] AudioManager not available');
                this.audioManager = {
                    init: () => {},
                    playSFX: () => {},
                    playBGM: () => {},
                    stopBGM: () => {},
                    toggleMute: () => {},
                    setVolume: () => {},
                    resumeAudioContext: () => {}
                };
            }
            
            // Initialize remaining managers
            this.uiManager = new IdleAnts.Managers.UIManager(this.resourceManager, this);
            this.achievementManager = new IdleAnts.Managers.AchievementManager(this.resourceManager, this.effectManager);
            this.dailyChallengeManager = new IdleAnts.Managers.DailyChallengeManager(this.resourceManager, this.achievementManager);
            this.notificationManager = new IdleAnts.Managers.NotificationManager();
            this.combatManager = new IdleAnts.Managers.CombatManager(this.entityManager, this);
            
            // Initialize input manager (use the proper WASD-capable InputManager)
            if (IdleAnts.Managers && IdleAnts.Managers.InputManager) {
                this.inputManager = new IdleAnts.Managers.InputManager(
                    this.app, this, this.cameraManager, this.resourceManager, this.entityManager, this.mapConfig
                );
            } else {
                console.warn('[Game] InputManager not available - using fallback');
                this.inputManager = { update: () => {} };
            }
            
            // Complete game setup
            this.setupGame();
            this.adjustSettingsForMobile();
            
            // Center camera on nest after everything is initialized
            setTimeout(() => {
                this.centerCameraOnNest();
            }, 100);
        });
    }

    // ===== CAMERA METHODS =====
    
    centerCameraOnNest() {
        // Get nest position from entity manager
        const nestPosition = this.entityManager?.nestManager?.getNestPosition();
        if (nestPosition && this.cameraManager) {
            this.cameraManager.centerViewOnPosition(nestPosition.x, nestPosition.y);
        } else {
            console.warn('[Game] Cannot center on nest - nest position or camera manager not available');
        }
    }

    // ===== DELEGATED METHODS TO SPECIFIC MANAGERS =====

    // Audio methods delegated to GameAudioManager
    startBackgroundMusic() {
        this.gameAudioManager.startBackgroundMusic();
    }

    playSoundEffect(soundId) {
        this.gameAudioManager.playSoundEffect(soundId);
    }

    toggleSound() {
        this.gameAudioManager.toggleSound();
    }

    // Upgrade methods delegated to GameUpgradeManager
    buyAnt() {
        return this.gameUpgradeManager.buyAnt();
    }

    unlockFlyingAnts() {
        return this.gameUpgradeManager.unlockFlyingAnts();
    }

    buyFlyingAnt() {
        return this.gameUpgradeManager.buyFlyingAnt();
    }

    expandFlyingAntCapacity() {
        return this.gameUpgradeManager.expandFlyingAntCapacity();
    }

    upgradeFood() {
        return this.gameUpgradeManager.upgradeFood();
    }

    expandColony() {
        return this.gameUpgradeManager.expandColony();
    }

    upgradeSpeed() {
        return this.gameUpgradeManager.upgradeSpeed();
    }

    upgradeStrength() {
        return this.gameUpgradeManager.upgradeStrength();
    }

    unlockAutofeeder() {
        return this.gameUpgradeManager.unlockAutofeeder();
    }

    upgradeAutofeeder() {
        return this.gameUpgradeManager.upgradeAutofeeder();
    }

    activateAutofeeder() {
        this.gameUpgradeManager.activateAutofeeder();
    }

    unlockQueen() {
        return this.gameUpgradeManager.unlockQueen();
    }

    buyQueen() {
        return this.gameUpgradeManager.buyQueen();
    }

    upgradeQueen() {
        return this.gameUpgradeManager.upgradeQueen();
    }

    unlockCarAnts() {
        return this.gameUpgradeManager.unlockCarAnts();
    }

    buyCarAnt() {
        return this.gameUpgradeManager.buyCarAnt();
    }

    expandCarAntCapacity() {
        return this.gameUpgradeManager.expandCarAntCapacity();
    }

    unlockFireAnts() {
        return this.gameUpgradeManager.unlockFireAnts();
    }

    buyFireAnt() {
        return this.gameUpgradeManager.buyFireAnt();
    }

    expandFireAntCapacity() {
        return this.gameUpgradeManager.expandFireAntCapacity();
    }

    // Boss methods delegated to GameBossManager
    startBossFight() {
        this.gameBossManager.startBossFight();
    }

    triggerBoss() {
        this.gameBossManager.triggerBoss();
    }

    onBossDefeated() {
        this.gameBossManager.onBossDefeated();
    }

    onColonyWiped() {
        this.gameBossManager.onColonyWiped();
    }

    // Minimap methods delegated to GameMinimapManager
    updateMinimap() {
        this.gameMinimapManager.updateMinimap();
    }

    // ===== CORE GAME METHODS =====

    /**
     * Transition to a new game state
     * @param {string} newState - New state to transition to
     */
    transitionToState(newState) {

        
        if (this.stateManager && this.stateManager.setState) {
            this.stateManager.setState(newState);
        } else {
            // Handle state transitions directly
            switch(this.state) {
                            case IdleAnts.Game.States.BOSS_INTRO:
            case IdleAnts.Game.States.BOSS_FIGHT:
                    // Stop boss music if transitioning away from boss states
                                    if (newState !== IdleAnts.Game.States.BOSS_INTRO &&
                newState !== IdleAnts.Game.States.BOSS_FIGHT &&
                newState !== IdleAnts.Game.States.WIN) {
                        this.gameAudioManager.playMainMusic();
                    }
                    
                    // Hide boss health bar
                    if (this.uiManager) {
                        this.uiManager.hideBossHealthBar();
                    }
                    break;
            }
        }

        // Handle new state setup
        switch(newState) {
            case IdleAnts.Game.States.WIN:
                if (this.uiManager) {
                    this.uiManager.showWinScreen();
                }
                break;
            case IdleAnts.Game.States.LOSE:
                if (this.uiManager) {
                    this.uiManager.showLoseScreen();
                }
                break;
            case IdleAnts.Game.States.BOSS_FIGHT:
                if (this.uiManager) {
                    this.uiManager.hideBossHealthBar();
                }
                
                // Close any modals
                if (this.dailyChallengeManager && this.dailyChallengeManager.closeModal) {
                    this.dailyChallengeManager.closeModal();
                }
                
                // Hide any overlay elements
                const overlay = document.querySelector('.overlay');
                if (overlay && overlay.style) {
                    overlay.style.display = 'none';
                }
                break;
        }
        
        this.state = newState;
        this.onStateChanged();
    }

    /**
     * Handle state change events
     */
    onStateChanged() {
        // Update UI based on new state
        if (this.uiManager) {
            this.uiManager.updateStateUI(this.state);
        }
    }

    /**
     * Set up the game after all managers are initialized
     */
    setupGame() {
        this.setupEventListeners();
        this.startGameLoop();
        
        // Transition to playing state
        this.transitionToState(IdleAnts.Game.States.PLAYING);
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Window resize handling
        window.addEventListener('resize', () => {
            if (this.cameraManager) {
                this.cameraManager.onResize();
            }
            if (this.uiManager) {
                this.uiManager.onResize();
            }
            if (this.gameMinimapManager) {
                this.gameMinimapManager.resize();
            }
        });

        // Mobile touch events
        if (this.isMobileDevice) {
            document.addEventListener('touchstart', (e) => {
                // Handle touch for camera movement
                if (this.cameraManager) {
                    this.cameraManager.handleTouchStart(e);
                }
                if (this.uiManager) {
                    this.uiManager.handleTouchStart(e);
                }
            });
        }

        // Sound toggle button
        const soundToggleButton = document.getElementById('toggle-sound');
        if (soundToggleButton) {
            soundToggleButton.addEventListener('click', () => {
                this.toggleSound();
            });
        }
    }

    /**
     * Update hover indicator
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     */
    updateHoverIndicator(x, y) {
        this.lastMouseX = x;
        this.lastMouseY = y;
        
        if (this.uiManager) {
            this.uiManager.updateHoverIndicator(x, y);
        }
    }

    /**
     * Start the main game loop
     */
    startGameLoop() {
        // Wait for document ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.app.ticker.add(() => this.gameLoop());
            });
        } else {
            this.app.ticker.add(() => this.gameLoop());
        }
    }

    /**
     * Main game loop
     */
    gameLoop() {
        this.frameCounter++;
        
        // Check if gameplay should be active
        const gameplayActive = this.state === IdleAnts.Game.States.PLAYING || 
                              this.state === IdleAnts.Game.States.BOSS_FIGHT;
        
        if (!gameplayActive) {
            // Update hover indicator even when paused
            if (this.state !== IdleAnts.Game.States.INITIALIZING && 
                this.lastMouseX !== undefined && this.lastMouseY !== undefined) {
                this.updateHoverIndicator(this.lastMouseX, this.lastMouseY);
            }
            return;
        }

        // Update managers
        if (this.inputManager) {
            this.inputManager.update();
        }

        if (this.cameraManager) {
            this.cameraManager.update();
        }

        // Update entity and effect managers
        this.entityManager.update();
        this.effectManager.update();
        this.backgroundManager.update();

        // Periodic updates
        if (this.frameCounter % 60 === 0) {
            this.resourceManager.updateFoodPerSecond();
            this.updateMinimap();
        }

        if (this.frameCounter % 120 === 0) {
            this.resourceManager.updateDisplayFood();
        }

        if (this.frameCounter % 10 === 0) {
            // Update food rate display
            this.resourceManager.updateUI();
            
            const actualRateElement = document.getElementById('food-per-second-actual');
            if (actualRateElement) {
                const actualRate = this.resourceManager.getActualFoodRate();
                actualRateElement.textContent = actualRate.toFixed(1);
            }
        }

        // Check for boss trigger
        if (this.gameBossManager.triggerBoss) {
            this.startBossFight();
            this.gameBossManager.triggerBoss = false;
        }

        // Update hover indicator
        if (this.lastMouseX !== undefined && this.lastMouseY !== undefined) {
            this.updateHoverIndicator(this.lastMouseX, this.lastMouseY);
        }
    }

    /**
     * Toggle game pause
     */
    togglePause() {
        if (this.state === IdleAnts.Game.States.PAUSED) {
            this.transitionToState(IdleAnts.Game.States.PLAYING);
        } else {
            this.transitionToState(IdleAnts.Game.States.PAUSED);
        }
    }

    /**
     * Show upgrades screen
     */
    showUpgrades() {
        if (this.state === IdleAnts.Game.States.PLAYING) {
            this.transitionToState(IdleAnts.Game.States.UPGRADING);
        }
    }

    /**
     * Close upgrades screen
     */
    closeUpgrades() {
        if (this.state === IdleAnts.Game.States.UPGRADING) {
            this.transitionToState(IdleAnts.Game.States.PLAYING);
        }
    }

    /**
     * Detect if running on mobile device
     * @returns {boolean} True if mobile device
     */
    detectMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Check for mobile user agents
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
        
        // Also check for touch support and screen size
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const smallScreen = window.innerWidth <= 768;
        
        const isMobileDevice = isMobile || (hasTouch && smallScreen);
        
        if (isMobileDevice) {
    
        }
        
        return isMobileDevice;
    }

    /**
     * Adjust settings for mobile devices
     */
    adjustSettingsForMobile() {
        if (!this.isMobileDevice) return;
        

        
        // Adjust map config for mobile
        if (!this.mapConfig) {
            console.warn('[MOBILE] mapConfig not found, skipping mobile adjustments');
            return;
        }
        
        // Reduce world size for better performance on mobile
        this.mapConfig.width = Math.min(this.mapConfig.width, 2000);
        this.mapConfig.height = Math.min(this.mapConfig.height, 1500);
        
        // Adjust zoom settings for mobile
        this.mapConfig.zoom.min = 0.5;
        this.mapConfig.zoom.max = 1.5;
        this.mapConfig.zoom.level = 0.8;
        
        // Set viewport meta tag for proper mobile scaling
        let viewportMeta = document.querySelector('meta[name=\"viewport\"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        
        // iOS specific adjustments
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
            // Prevent zoom on double tap
            document.addEventListener('touchend', (e) => {
                e.preventDefault();
            });
            
            // Adjust UI for iOS safe areas
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.style.paddingTop = 'env(safe-area-inset-top)';
                gameContainer.style.paddingBottom = 'env(safe-area-inset-bottom)';
            }
            
            const uiToggle = document.getElementById('ui-toggle');
            if (uiToggle) {
                uiToggle.style.top = 'calc(10px + env(safe-area-inset-top))';
            }
        }
        
        // Prevent double-tap zoom globally for mobile
        let lastTouchEnd = 0;
        if (this.isMobileDevice) {
            document.addEventListener('touchend', (event) => {
                const now = Date.now();
                if (now - lastTouchEnd < 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
        }
    }

    /**
     * Run initialization hooks
     */
    runInitHooks() {
        // Check if there are any registered hooks and run them
        if (typeof window !== 'undefined' && window.idleAntsInitHooks) {
            window.idleAntsInitHooks.forEach(hook => {
                try {
                    hook(this);
                } catch (error) {
                    console.error('Error running init hook:', error);
                }
            });
        }
    }
};

// Make States available in IdleAnts.Game namespace for backward compatibility
if (IdleAnts.Game) {
    IdleAnts.Game.States = IdleAnts.GameClass.States;
}



