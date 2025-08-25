// src/Game.js
IdleAnts.Game = class {
    // Define game state constants
    static States = {
        TITLE: 'title',               // Title screen
        INITIALIZING: 'initializing', // Loading assets and setup
        PLAYING: 'playing',           // Main gameplay
        PAUSED: 'paused',             // Game paused
        UPGRADING: 'upgrading',       // Player is viewing/selecting upgrades
        BOSS_INTRO: 'boss_intro',     // Cinematic intro sequence
        BOSS_FIGHT: 'boss_fight',     // Active boss combat
        WIN: 'win',                   // Player defeated the boss
        LOSE: 'lose'                  // Colony wiped out
    };
    
    constructor() {
        // Make app accessible globally for components that need it
        IdleAnts.app = this;
        
        // Initialize game state - start with title screen
        this.state = IdleAnts.Game.States.TITLE;
        
        // Track session start time for accurate play time in victory screen
        this.sessionStartTime = Date.now();
        
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
            background: 0x269c3f, // Matching green background
            width: window.innerWidth,
            height: window.innerHeight,
            resizeTo: window // Enable automatic resizing
        });
        
        const canvasContainer = document.getElementById('game-canvas-container');
        canvasContainer.appendChild(this.app.view);
        
        // Make sure the canvas is visible
        this.app.view.style.position = 'absolute';
        this.app.view.style.top = '0';
        this.app.view.style.left = '0';
        this.app.view.style.zIndex = '10';
        
        // Initialize managers
        this.resourceManager = new IdleAnts.Managers.ResourceManager();
        this.assetManager = new IdleAnts.Managers.AssetManager(this.app);
        
        // Create container for all game elements
        this.worldContainer = new PIXI.Container();
        this.app.stage.addChild(this.worldContainer);
        
        // Create minimap
        this.minimapContainer = new PIXI.Container();
        this.app.stage.addChild(this.minimapContainer);
        
        this.cameraManager = new IdleAnts.Managers.CameraManager(this.app, this.worldContainer, this.mapConfig, this);
        
        // Initialize leaderboard integration
        this.leaderboardIntegration = new GameLeaderboardIntegration(this);
        
        // Run any registered initialization functions
        this.runInitHooks();
        
        // Hide UI elements initially
        this.hideUIElements();
        
        // Show title screen first
        this.showTitleScreen();
        
        // Start the game loop so title screen animations work
        this.app.ticker.add(() => this.gameLoop());
        
        // Don't load game assets yet - wait for user to press key
    }
    
    showTitleScreen() {
        // Create title screen container
        this.titleContainer = new PIXI.Container();
        this.app.stage.addChild(this.titleContainer);
        
        // Load and display title background (responsive scaling for mobile)
        this.titleSprite = PIXI.Sprite.from('assets/backgrounds/adil_ants_title_screen.png');
        this.titleSprite.anchor.set(0.5); // Center the anchor point
        
        // Responsive scaling based on screen size
        const isMobile = window.innerWidth <= 768;
        const isPhone = window.innerWidth <= 480;
        let scale;
        
        if (isPhone) {
            // Calculate scale to fit within viewport with more padding for text
            const maxWidthScale = (this.app.screen.width * 0.8) / this.titleSprite.texture.width;
            const maxHeightScale = (this.app.screen.height * 0.35) / this.titleSprite.texture.height;
            scale = Math.min(maxWidthScale, maxHeightScale, 0.3);
        } else if (isMobile) {
            // Medium scale for tablets
            const maxWidthScale = (this.app.screen.width * 0.8) / this.titleSprite.texture.width;
            const maxHeightScale = (this.app.screen.height * 0.45) / this.titleSprite.texture.height;
            scale = Math.min(maxWidthScale, maxHeightScale, 0.4);
        } else {
            // Original scale for desktop
            scale = 0.6;
        }
        
        this.titleSprite.scale.set(scale);
        this.titleSprite.x = this.app.screen.width / 2;  // Center horizontally
        
        // Center vertically for all devices
        this.titleSprite.y = this.app.screen.height / 2;
        this.titleContainer.addChild(this.titleSprite);
        
        // Add "Press any key to start" text with responsive sizing
        let fontSize, strokeThickness, shadowBlur, shadowDistance;
        
        if (isPhone) {
            fontSize = 24; // Much smaller for phones
            strokeThickness = 2;
            shadowBlur = 4;
            shadowDistance = 2;
        } else if (isMobile) {
            fontSize = 32; // Medium for tablets
            strokeThickness = 3;
            shadowBlur = 6;
            shadowDistance = 3;
        } else {
            fontSize = 48; // Original for desktop
            strokeThickness = 4;
            shadowBlur = 8;
            shadowDistance = 4;
        }
        
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: fontSize,
            fontWeight: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: strokeThickness,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: shadowBlur,
            dropShadowDistance: shadowDistance,
            align: 'center'
        });
        
        const buttonText = isMobile ? 'Tap to start' : 'Press any key to start';
        this.titleText = new PIXI.Text(buttonText, textStyle);
        this.titleText.anchor.set(0.5);
        this.titleText.x = this.app.screen.width / 2;
        
        // Position text below the centered logo for all devices
        const logoBottom = this.titleSprite.y + (this.titleSprite.height * this.titleSprite.scale.y) / 2;
        const textMargin = isPhone ? 40 : isMobile ? 60 : 80;
        this.titleText.y = logoBottom + textMargin;
        
        this.titleContainer.addChild(this.titleText);
        
        // Add pulsing animation
        const pulse = () => {
            if (this.state === IdleAnts.Game.States.TITLE && this.titleText) {
                const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
                this.titleText.scale.set(scale);
                requestAnimationFrame(pulse);
            }
        };
        pulse();
        
        // Set up event listeners for any key press
        this.titleKeyHandler = () => {
            if (this.state === IdleAnts.Game.States.TITLE) {
                this.startGame();
            }
        };
        
        document.addEventListener('keydown', this.titleKeyHandler);
        document.addEventListener('click', this.titleKeyHandler);
    }
    
    startGame() {
        // Remove title screen
        this.app.stage.removeChild(this.titleContainer);
        document.removeEventListener('keydown', this.titleKeyHandler);
        document.removeEventListener('click', this.titleKeyHandler);
        
        // Add game-started class to enable UI interactions
        document.body.classList.add('game-started');
        
        // Show UI elements now
        this.showUIElements();
        
        // Change state to initializing and load game
        this.state = IdleAnts.Game.States.INITIALIZING;
        
        // Load assets and initialize game
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
            this.setupMinimap();
            this.updateMinimap();
            
            this.cameraManager.centerCameraOnNest();
            
            this.setupAudioResumeOnInteraction();
            this.startBackgroundMusic();
            this.transitionToState(IdleAnts.Game.States.PLAYING);
        });
    }
    
    hideUIElements() {
        // Hide the UI container only, not the whole game container
        const uiContainer = document.getElementById('ui-container');
        if (uiContainer) {
            uiContainer.style.display = 'none';
        }
        
    }
    
    showUIElements() {
        // Show the UI container
        const uiContainer = document.getElementById('ui-container');
        if (uiContainer) {
            uiContainer.style.display = 'flex';
        }
        
    }
    
    // Setup audio resume on user interaction
    setupAudioResumeOnInteraction() {
        // List of events that count as user interaction
        const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
        
        // Helper function to attempt resuming audio context (without restarting music)
        const resumeAudio = () => {
            if (IdleAnts.AudioManager) {
                IdleAnts.AudioManager.resumeAudioContext();
                
                // Remove event listeners after first successful interaction
                interactionEvents.forEach(event => {
                    document.removeEventListener(event, resumeAudio);
                });
            }
        };
        
        // Add event listeners
        interactionEvents.forEach(event => {
            document.addEventListener(event, resumeAudio, { once: false });
        });
    }
    
    // Start background music
    startBackgroundMusic() {
        // Create playlist with main theme and old main theme
        if (IdleAnts.AudioAssets.BGM.MAIN_THEME && IdleAnts.AudioAssets.BGM.OLD_MAIN_THEME) {
            const playlist = [
                IdleAnts.AudioAssets.BGM.MAIN_THEME.id,
                IdleAnts.AudioAssets.BGM.OLD_MAIN_THEME.id
            ];
            IdleAnts.AudioManager.startMusicPlaylist(playlist);
        } else if (IdleAnts.AudioAssets.BGM.MAIN_THEME) {
            // Fallback to single track if old theme not available
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
                // Resume game logic and hide pause overlay
                if (this.uiManager) {
                    this.uiManager.hidePauseOverlay();
                }
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
                
            case IdleAnts.Game.States.BOSS_INTRO:
            case IdleAnts.Game.States.BOSS_FIGHT:
                // Ensure all overlays are closed during boss sequences
                if (this.dailyChallengeManager && this.dailyChallengeManager.closeModal) {
                    this.dailyChallengeManager.closeModal();
                }
                // Hide any other potential overlays
                const overlays = document.querySelectorAll('.challenge-modal-backdrop, #win-screen, #lose-screen');
                overlays.forEach(overlay => {
                    if (overlay.style) {
                        overlay.style.display = 'none';
                    }
                    overlay.classList.remove('show');
                });
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

        // Add event listener for window resize with proper canvas handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle orientation change on mobile devices (moved from original setupEventListeners)
        if (this.isMobileDevice) {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.handleResize();
                }, 300); 
            });
        }

        // Handle fullscreen changes (important for fullscreen button functionality)
        document.addEventListener('fullscreenchange', () => {
            // Small delay to ensure fullscreen transition is complete
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });
        
        // Handle webkit fullscreen changes (Safari)
        document.addEventListener('webkitfullscreenchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });
        
        // Handle moz fullscreen changes (Firefox)
        document.addEventListener('mozfullscreenchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });
        
        // Handle visibility changes (console opening/closing, tab switching)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // When page becomes visible again, check if resize is needed
                setTimeout(() => {
                    this.handleResize();
                }, 50);
            }
        });

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
    
    /**
     * Comprehensive resize handler that prevents canvas stretching
     * and maintains proper aspect ratios across all scenarios
     */
    handleResize() {
        // Get current window dimensions
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        // Resize the PIXI application properly - this prevents stretching
        this.app.renderer.resize(newWidth, newHeight);
        
        // Update app screen dimensions for other components
        this.app.screen.width = newWidth;
        this.app.screen.height = newHeight;
        
        // Update camera manager for new viewport
        if (this.cameraManager) {
            this.cameraManager.handleResizeOrOrientationChange();
        }
        
        // Update minimap position and sizing
        this.updateMinimap();
        if (this.minimap) {
            const padding = 10;
            const size = 150;
            this.minimap.position.set(
                newWidth - size - padding,
                newHeight - (size * (this.mapConfig.height / this.mapConfig.width)) - padding
            );
        }
        
        // Update UI manager
        if (this.uiManager) {
            this.uiManager.updateUI();
        }
        
        // Update title screen positioning if active with responsive scaling
        if (this.state === IdleAnts.Game.States.TITLE && this.titleSprite) {
            // Recalculate scale for new dimensions
            const isMobile = newWidth <= 768;
            const isPhone = newWidth <= 480;
            let scale;
            
            if (isPhone) {
                // Calculate scale to fit within viewport with more padding for text
                const maxWidthScale = (newWidth * 0.8) / this.titleSprite.texture.width;
                const maxHeightScale = (newHeight * 0.35) / this.titleSprite.texture.height;
                scale = Math.min(maxWidthScale, maxHeightScale, 0.3);
            } else if (isMobile) {
                // Medium scale for tablets
                const maxWidthScale = (newWidth * 0.8) / this.titleSprite.texture.width;
                const maxHeightScale = (newHeight * 0.45) / this.titleSprite.texture.height;
                scale = Math.min(maxWidthScale, maxHeightScale, 0.4);
            } else {
                scale = 0.6;
            }
            
            this.titleSprite.scale.set(scale);
            this.titleSprite.x = newWidth / 2;
            
            // Center vertically for all devices
            this.titleSprite.y = newHeight / 2;
            
            // Also reposition the title text when screen resizes
            if (this.titleText) {
                this.titleText.x = newWidth / 2;
                
                // Position text below the centered logo for all devices
                const logoBottom = this.titleSprite.y + (this.titleSprite.height * this.titleSprite.scale.y) / 2;
                const textMargin = isPhone ? 40 : isMobile ? 60 : 80;
                this.titleText.y = logoBottom + textMargin;
            }
        }
        
        if (this.state === IdleAnts.Game.States.TITLE && this.titleText) {
            // Update text size and position for new dimensions
            const isMobile = newWidth <= 768;
            const isPhone = newWidth <= 480;
            
            let fontSize, bottomMargin;
            if (isPhone) {
                fontSize = 24;
                bottomMargin = 50;
            } else if (isMobile) {
                fontSize = 32;
                bottomMargin = 70;
            } else {
                fontSize = 48;
                bottomMargin = 100;
            }
            
            // Update text style
            this.titleText.style.fontSize = fontSize;
            this.titleText.text = isMobile ? 'Tap to start' : 'Press any key to start';
            this.titleText.x = newWidth / 2;
            this.titleText.y = newHeight - bottomMargin;
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
                    this.initializeGameUI();
                });
            } else {
                // DOM is already loaded, initialize UI immediately
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
        
        // Expose boss trigger globally for testing
        window.triggerBoss = () => {
            if (this.triggerBoss) {
                this.triggerBoss();
            }
        };
        
        // Expose flexible boss spawner globally for testing
        window.spawnBoss = (bossType, hpOrMultipliers, options) => {
            if (this.spawnBoss) {
                return this.spawnBoss(bossType, hpOrMultipliers, options);
            }
        };
        
        // Expose ant count check for debugging
        window.checkAnts = () => {
            if (this.entityManager) {
                const antTotal = this.entityManager.entities.ants.length + 
                               this.entityManager.entities.flyingAnts.length + 
                               this.entityManager.entities.carAnts.length + 
                               this.entityManager.entities.fireAnts.length;
                return antTotal;
            }
        };

        // Debug function to test queen damage
        window.damageQueen = (damage) => {
            if (this.entityManager && this.entityManager.entities.queen) {
                this.entityManager.entities.queen.takeDamage(damage || 10);
            }
        };
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
        
        // Minimap resize handling is now done in handleResize() method
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
        // Don't run game logic during title screen
        if (this.state === IdleAnts.Game.States.TITLE) {
            return;
        }
        
        // Only update full game logic during active gameplay or boss fight
        const gameplayActive = (this.state === IdleAnts.Game.States.PLAYING || this.state === IdleAnts.Game.States.BOSS_FIGHT);
        if (!gameplayActive) {
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
        
        // Update cinematic camera pan if active
        if (this.cameraManager) {
            this.cameraManager.updateCinematicPan();
        }
        
        // Update entities
        this.entityManager.update();
        
        // Update effects
        this.effectManager.update();
        
        // Update UI every 60 frames (approximately once per second at 60fps)
        // This is frequent enough for smooth updates but not too frequent to cause performance issues
        if (this.frameCounter % 60 === 0) {
            this.uiManager.updateUI();
            this.uiManager.updateButtonStates();
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

    /* ================= Boss Encounter Helpers ================= */

    /**
     * Flexible boss spawning wrapper function
     * @param {string} bossType - The type of boss to spawn ('anteater', 'spider', 'beetle', etc.)
     * @param {number|Object} hpOrMultipliers - Either HP value or multipliers object for boss stats
     * @param {Object} options - Additional options for boss spawning
     * 
     * Examples:
     * spawnBoss('anteater', 10000) // Spawn anteater with 10k HP
     * spawnBoss('anteater', {hp: 0.5, damage: 1.5}) // Spawn anteater with 50% HP, 150% damage
     * spawnBoss('spider', 15000, {noMusic: true, noCinematic: false})
     */
    spawnBoss(bossType, hpOrMultipliers = null, options = {}) {
        
        if (this.state !== IdleAnts.Game.States.PLAYING) {
            console.warn('Cannot spawn boss - not in playing state');
            return null;
        }

        // Get boss configuration
        const bossConfig = IdleAnts.Data.BossConfigUtils.getBossConfig(bossType);
        if (!bossConfig) {
            console.error(`Unknown boss type: ${bossType}`);
            return null;
        }

        // Process HP or multipliers
        let finalConfig = bossConfig;
        if (hpOrMultipliers !== null) {
            if (typeof hpOrMultipliers === 'number') {
                // Simple HP override
                finalConfig = JSON.parse(JSON.stringify(bossConfig));
                finalConfig.defaultStats.maxHp = hpOrMultipliers;
            } else if (typeof hpOrMultipliers === 'object') {
                // Multipliers object
                finalConfig = IdleAnts.Data.BossConfigUtils.applyStatMultipliers(bossConfig, hpOrMultipliers);
            }
        }

        // Store boss config for spawning process
        this.pendingBossConfig = finalConfig;
        this.pendingBossOptions = options;

        // Use cinematic unless disabled
        if (options.noCinematic === false || (finalConfig.cinematic && finalConfig.cinematic.enabled !== false)) {
            this.startBossFightWithConfig(finalConfig, options);
        } else {
            // Spawn immediately without cinematic
            this.spawnBossDirectly(finalConfig, options);
        }

        return finalConfig;
    }

    /**
     * Start boss fight with configuration (includes cinematic)
     */
    startBossFightWithConfig(bossConfig, options = {}) {
        
        // Calculate spawn position
        const spawnPos = IdleAnts.Data.BossConfigUtils.calculateSpawnPosition(bossConfig, this.mapConfig);
        
        // Pre-position camera to show boss entrance area BEFORE spawning boss
        if (this.cameraManager && bossConfig.cinematic.cameraPrePosition) {
            this.cameraManager.startCinematicPanTo(spawnPos.x, spawnPos.y, 1000);
            
            // Delay boss spawn until camera is in position
            setTimeout(() => {
                this.spawnBossAfterCameraPan();
            }, 1200);
        } else {
            // No camera manager or cinematic disabled, spawn immediately
            this.spawnBossAfterCameraPan();
        }
    }

    /**
     * Spawn boss directly without cinematic
     */
    spawnBossDirectly(bossConfig, options = {}) {
        
        this.pendingBossConfig = bossConfig;
        this.pendingBossOptions = options;
        
        // Ensure challenge modal is closed
        if (this.dailyChallengeManager && this.dailyChallengeManager.closeModal) {
            this.dailyChallengeManager.closeModal();
        }
        
        // Spawn the boss
        const boss = this.entityManager.spawnBossWithConfig(bossConfig);
        
        this.currentBoss = boss;
        
        // Start boss music unless disabled
        if (!options.noMusic && bossConfig.audio && bossConfig.audio.theme) {
            const themeKey = bossConfig.audio.theme;
            
            // Stop any current playlist first
            if (IdleAnts.AudioManager.stopMusicPlaylist) {
                IdleAnts.AudioManager.stopMusicPlaylist();
            }
            
            if (IdleAnts.AudioManager && IdleAnts.AudioAssets.BGM[themeKey]) {
                IdleAnts.AudioManager.playBGM(IdleAnts.AudioAssets.BGM[themeKey].id);
                
                // Fallback: direct HTML element access
                setTimeout(() => {
                    const audioElement = document.getElementById('bgm_anteater_boss');
                    if (audioElement && audioElement.paused) {
                        audioElement.volume = 0.6;
                        audioElement.loop = true;
                        audioElement.play().catch(e => {
                            console.error('[MUSIC] Direct boss audio play failed:', e);
                        });
                    }
                }, 100);
            } else {
                console.warn(`Boss theme not found: ${themeKey}, available themes:`, Object.keys(IdleAnts.AudioAssets?.BGM || {}));
            }
        }
        
        // Show boss health bar
        if (this.uiManager && boss) {
            this.uiManager.showBossHealthBar(boss.maxHp);
        }
        
        return boss;
    }

    // Triggered (manually for now) to begin the boss fight
    startBossFight() {
        if (this.state !== IdleAnts.Game.States.PLAYING) {
            console.warn('Cannot start boss fight - not in playing state');
            return;
        }
        
        // Pre-position camera to show boss entrance area BEFORE spawning boss
        if (this.cameraManager) {
            const bossSpawnX = this.mapConfig.width / 2;  // 1500 - center X
            const bossSpawnY = 150;                       // Near top of map
            
            this.cameraManager.startCinematicPanTo(bossSpawnX, bossSpawnY, 1000); // 1 second to get into position
            
            // Delay boss spawn until camera is in position
            setTimeout(() => {
                this.spawnBossAfterCameraPan();
            }, 1200); // Slight delay after camera pan completes
            
        } else {
            // No camera manager, spawn immediately
            this.spawnBossAfterCameraPan();
        }
    }
    
    spawnBossAfterCameraPan() {
        // Ensure challenge modal is closed during boss fight to prevent overlay issues
        if (this.dailyChallengeManager && this.dailyChallengeManager.closeModal) {
            this.dailyChallengeManager.closeModal();
        }
        
        // Use pending boss config if available, otherwise fall back to anteater
        const bossConfig = this.pendingBossConfig || IdleAnts.Data.BossConfigUtils.getBossConfig('anteater');
        const options = this.pendingBossOptions || {};
        
        // Spawn the boss
        const boss = this.entityManager.spawnBossWithConfig(bossConfig);
        
        this.currentBoss = boss;

        // Begin dramatic invasion cinematic
        this.playBossIntroCinematic(boss, bossConfig, options);
        
        // Clear pending config
        this.pendingBossConfig = null;
        this.pendingBossOptions = null;
    }
    
    // Manual boss trigger for testing (exposed globally)
    triggerBoss() {
        if (this.entityManager) {
            this.entityManager.resetBossTrigger();
            this.startBossFight();
        }
    }

    // Called by AnteaterBoss.die()
    onBossDefeated(bossType = 'anteater') {
        if (this.uiManager) {
            this.uiManager.hideBossHealthBar();
        }
        
        if (this.entityManager) {
            this.entityManager.boss = null;
        }
        
        // Track boss defeat for challenges
        if (this.dailyChallengeManager) {
            this.dailyChallengeManager.trackBossDefeat(bossType);
        }
        
        // Check if this is the final boss (anteater) or a miniboss
        if (bossType === 'anteater') {
            // Final boss defeated - trigger victory with leaderboard integration
            if (this.entityManager) {
                this.entityManager.bossDefeated = true;
                this.entityManager.bossTriggered = false;
            }
            
            // Play victory theme
            if (IdleAnts.AudioManager && IdleAnts.AudioAssets && IdleAnts.AudioAssets.BGM && IdleAnts.AudioAssets.BGM.VICTORY_THEME) {
                IdleAnts.AudioManager.playBGM(IdleAnts.AudioAssets.BGM.VICTORY_THEME.id);
            }
            
            // Show leaderboard victory sequence instead of simple win screen
            if (this.leaderboardIntegration) {
                this.leaderboardIntegration.handleVictory();
            } else if (this.uiManager) {
                // Fallback to original win screen if leaderboard system fails
                this.uiManager.showWinScreen();
            }
            
            this.transitionToState(IdleAnts.Game.States.WIN);
        } else {
            // Miniboss defeated - continue game, return to normal music
            if(typeof IdleAnts.notify === 'function'){
                IdleAnts.notify(`Miniboss defeated! The colony grows stronger!`, 'success');
            }
            
            // Resume normal background music playlist
            if (IdleAnts.AudioManager) {
                const playlist = ['bgm_main_theme', 'bgm_old_main_theme'];
                IdleAnts.AudioManager.startMusicPlaylist(playlist);
            }
            
            // Return to normal gameplay
            this.transitionToState(IdleAnts.Game.States.PLAYING);
        }
    }

    onQueenDeath() {
        
        // Stop all music
        if (IdleAnts.AudioManager) {
            IdleAnts.AudioManager.stopBGM();
        }
        
        // Play game over music
        if (IdleAnts.AudioManager && IdleAnts.AudioAssets && IdleAnts.AudioAssets.BGM && IdleAnts.AudioAssets.BGM.GAME_OVER_THEME) {
            IdleAnts.AudioManager.playBGM(IdleAnts.AudioAssets.BGM.GAME_OVER_THEME.id);
        }
        
        // Show lose screen
        if (this.uiManager) {
            this.uiManager.showLoseScreen();
        }
        
        // Transition to lose state
        this.transitionToState(IdleAnts.Game.States.LOSE);
    }

    onColonyWiped() {
        if (this.uiManager) {
            this.uiManager.showLoseScreen();
        }
        this.transitionToState(IdleAnts.Game.States.LOSE);
    }
    
    restartGame() {
        // Simple and reliable restart - just reload the page
        window.location.reload();
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
        // Try to unlock flying ants through the resource manager
        const success = this.resourceManager.unlockFlyingAnts();
        
        if (success) {
            // Update the UI
            this.uiManager.updateUI();
            
            // Show success effect
            this.uiManager.showUpgradeEffect('unlock-flying-ants', 'Flying ants unlocked!');
            
            // Track challenge progress
            if (this.dailyChallengeManager) {
                this.dailyChallengeManager.trackUnlock('flyingAnts');
            }
            
            // Show the previously hidden flying ant buttons
            const buyButton = document.getElementById('buy-flying-ant');
            const statsDisplay = document.getElementById('flying-ant-stats');
            const expandButton = document.getElementById('expand-flying-ants');
            
            if (buyButton) buyButton.classList.remove('hidden');
            if (statsDisplay) statsDisplay.classList.remove('hidden');
            if (expandButton) expandButton.classList.remove('hidden');
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
            
            // Track challenge progress
            if (this.dailyChallengeManager) {
                this.dailyChallengeManager.trackUpgrade();
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
        
        // Apply mobile-specific settings if on mobile
        if (isMobile) {
            // Adjust game settings for mobile
            this.adjustSettingsForMobile();
        }
        
        return isMobile;
    }

    adjustSettingsForMobile() {
        // Adjust game settings for better mobile experience
        
        // Add condensed class for ultra-small phones but keep UI expanded
        if (window.innerWidth <= 480) {
            // Add condensed class for ultra-small phones
            document.body.classList.add('phone-condensed');
            
            // UI now stays expanded by default on mobile for better accessibility
        }
        
        // Store mobile detection for title screen usage
        this.isMobile = window.innerWidth <= 768;
        this.isPhone = window.innerWidth <= 480;
        
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
            
            // Track challenge progress
            if (this.dailyChallengeManager) {
                this.dailyChallengeManager.trackUnlock('queen');
            }
            
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
            
            // Update modal content if colony modal is open
            const colonyModal = document.getElementById('colony-modal');
            if (colonyModal && colonyModal.classList.contains('show')) {
                // Sync modal values with main UI
                if (typeof updateModalContent === 'function') {
                    updateModalContent('colony-modal');
                }
            }
            
            return true;
        }
        return false;
    }

    // Car Ant Game Logic Methods
    unlockCarAnts() {
        if (this.resourceManager.unlockCarAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-car-ants', 'Car Ants Unlocked! Bay available.');
            
            // Track challenge progress
            if (this.dailyChallengeManager) {
                this.dailyChallengeManager.trackUnlock('carAnts');
            }
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


    // Fire Ant Game Logic Methods
    unlockFireAnts() {
        if (this.resourceManager.unlockFireAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-fire-ants', 'Fire Ants Unlocked!');
            
            // Track challenge progress
            if (this.dailyChallengeManager) {
                this.dailyChallengeManager.trackUnlock('fireAnts');
            }
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


    // ===============================================
    // NEW ANT TYPES PURCHASE METHODS
    // ===============================================

    // Phat Ant Methods (renamed from Fat)
    unlockFatAnts() {
        if (this.resourceManager.unlockFatAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-fat-ants', 'Phat Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyFatAnt() {
        if (this.resourceManager.buyFatAnt()) {
            this.entityManager.createFatAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-fat-ant', 'Phat Ant added!');
            return true;
        }
        return false;
    }

    // Gas Ant Methods
    unlockGasAnts() {
        if (this.resourceManager.unlockGasAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-gas-ants', 'Gas Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyGasAnt() {
        if (this.resourceManager.buyGasAnt()) {
            this.entityManager.createGasAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-gas-ant', 'Gas Ant added!');
            return true;
        }
        return false;
    }

    // Acid Ant Methods
    unlockAcidAnts() {
        if (this.resourceManager.unlockAcidAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-acid-ants', 'Acid Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyAcidAnt() {
        if (this.resourceManager.buyAcidAnt()) {
            this.entityManager.createAcidAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-acid-ant', 'Acid Ant added!');
            return true;
        }
        return false;
    }

    // Rainbow Ant Methods
    unlockRainbowAnts() {
        if (this.resourceManager.unlockRainbowAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-rainbow-ants', 'Rainbow Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyRainbowAnt() {
        if (this.resourceManager.buyRainbowAnt()) {
            this.entityManager.createRainbowAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-rainbow-ant', 'Rainbow Ant added!');
            return true;
        }
        return false;
    }

    // Smoke Ant Methods
    unlockSmokeAnts() {
        if (this.resourceManager.unlockSmokeAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-smoke-ants', 'Smoke Ants Unlocked!');
            return true;
        }
        return false;
    }

    buySmokeAnt() {
        if (this.resourceManager.buySmokeAnt()) {
            this.entityManager.createSmokeAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-smoke-ant', 'Smoke Ant added!');
            return true;
        }
        return false;
    }

    // Electric Ant Methods
    unlockElectricAnts() {
        if (this.resourceManager.unlockElectricAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-electric-ants', 'Electric Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyElectricAnt() {
        if (this.resourceManager.buyElectricAnt()) {
            this.entityManager.createElectricAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-electric-ant', 'Electric Ant added!');
            return true;
        }
        return false;
    }

    // Leaf Cutter Ant Methods
    unlockLeafCutterAnts() {
        if (this.resourceManager.unlockLeafCutterAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-leaf-cutter-ants', 'Leaf Cutter Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyLeafCutterAnt() {
        if (this.resourceManager.buyLeafCutterAnt()) {
            this.entityManager.createLeafCutterAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-leaf-cutter-ant', 'Leaf Cutter Ant added!');
            return true;
        }
        return false;
    }

    // Door Ant Methods
    unlockDoorAnts() {
        if (this.resourceManager.unlockDoorAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-door-ants', 'Door Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyDoorAnt() {
        if (this.resourceManager.buyDoorAnt()) {
            this.entityManager.createDoorAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-door-ant', 'Door Ant added!');
            return true;
        }
        return false;
    }

    // Banana Throwing Ant Methods
    unlockBananaThrowingAnts() {
        if (this.resourceManager.unlockBananaThrowingAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-banana-throwing-ants', 'Banana Throwing Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyBananaThrowingAnt() {
        if (this.resourceManager.buyBananaThrowingAnt()) {
            this.entityManager.createBananaThrowingAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-banana-throwing-ant', 'Banana Throwing Ant added!');
            return true;
        }
        return false;
    }

    // Juice Ant Methods
    unlockJuiceAnts() {
        if (this.resourceManager.unlockJuiceAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-juice-ants', 'Juice Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyJuiceAnt() {
        if (this.resourceManager.buyJuiceAnt()) {
            this.entityManager.createJuiceAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-juice-ant', 'Juice Ant added!');
            return true;
        }
        return false;
    }

    // Crab Ant Methods
    unlockCrabAnts() {
        if (this.resourceManager.unlockCrabAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-crab-ants', 'Crab Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyCrabAnt() {
        if (this.resourceManager.buyCrabAnt()) {
            this.entityManager.createCrabAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-crab-ant', 'Crab Ant added!');
            return true;
        }
        return false;
    }

    // Upside Down Ant Methods
    unlockUpsideDownAnts() {
        if (this.resourceManager.unlockUpsideDownAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-upside-down-ants', 'Upside Down Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyUpsideDownAnt() {
        if (this.resourceManager.buyUpsideDownAnt()) {
            this.entityManager.createUpsideDownAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-upside-down-ant', 'Upside Down Ant added!');
            return true;
        }
        return false;
    }

    // DPS Ant Methods
    unlockDpsAnts() {
        if (this.resourceManager.unlockDpsAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-dps-ants', 'DPS Ants Unlocked!');
            return true;
        }
        return false;
    }

    buyDpsAnt() {
        if (this.resourceManager.buyDpsAnt()) {
            this.entityManager.createDpsAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-dps-ant', 'DPS Ant added!');
            return true;
        }
        return false;
    }

    // Spider Ant Methods
    unlockSpiderAnts() {
        if (this.resourceManager.unlockSpiderAnts()) {
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('unlock-spider-ants', 'Spider Ants Unlocked!');
            return true;
        }
        return false;
    }

    buySpiderAnt() {
        if (this.resourceManager.buySpiderAnt()) {
            this.entityManager.createSpiderAnt();
            this.uiManager.updateUI();
            this.uiManager.showUpgradeEffect('buy-spider-ant', 'Spider Ant added!');
            return true;
        }
        return false;
    }


    /* ================= Cinematic Intro ================= */
    /**
     * Creates an improved Kingdom Rush-style boss entrance cinematic.
     * Boss spawns at top of map and descends toward the center nest.
     * Duration: ~6 seconds total
     */
    playBossIntroCinematic(boss, bossConfig = null, options = {}) {
        // Use provided config or default to anteater
        const config = bossConfig || IdleAnts.Data.BossConfigUtils.getBossConfig('anteater');
        this.transitionToState(IdleAnts.Game.States.BOSS_INTRO);

        // === PHASE 1: DRAMATIC CAMERA SETUP (0.5 seconds) ===
        
        // Stop current music for dramatic pause (unless disabled)
        if (IdleAnts.AudioManager && config.cinematic.dramaPause) {
            IdleAnts.AudioManager.stopBGM();
        }
        
        // Boss should be at the top of the map (where it was spawned)
        const bossStartX = boss.x; // Should be mapWidth/2 = 1500
        const bossStartY = boss.y; // Should be 100 (top of map)
        
        // FAILSAFE: Explicitly ensure boss is at the correct position
        const expectedBossX = this.mapConfig.width / 2;  // 1500
        const expectedBossY = 150; // Top of map for invasion

        if (Math.abs(boss.x - expectedBossX) > 1 || Math.abs(boss.y - expectedBossY) > 1) {
            console.warn(`[CINEMATIC] Boss position incorrect! Expected: (${expectedBossX}, ${expectedBossY}), Actual: (${boss.x}, ${boss.y})`);
            console.warn(`[CINEMATIC] Correcting boss position...`);
            boss.x = expectedBossX;
            boss.y = expectedBossY;
        }
        
        // Target is the nest at center of map where boss will move during cinematic
        const nestX = this.mapConfig.width / 2;  // 1500
        const nestY = this.mapConfig.height / 2; // 1000
        
        // Add a visual debug marker at boss position
        if (this.effectManager) {
            // Create a bright marker at boss position for debugging
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const radius = 50 + i * 10;
                const x = boss.x + Math.cos(angle) * radius;
                const y = boss.y + Math.sin(angle) * radius;
                this.effectManager.createSpawnEffect(x, y, false, {R: 255, G: 0, B: 255}); // Bright magenta
            }
        }
        
        // Boss starts INVISIBLE - will become visible when fall animation begins
        boss.alpha = 0; // Hide boss initially - no blinking in!
        
        // Camera should show the invasion area using safe pan method
        if (this.cameraManager) {
            // Camera is already positioned from the pre-pan - no additional movement needed
            // This prevents any coordinate system disruption during the cinematic
        }

        // === PHASE 2: WARNING BUILDUP (1.5 seconds) ===
        setTimeout(() => {
            // Subtle rumble
            if (this.cameraManager) {
                // DISABLE SHAKE - conflicts with worldContainer coordinate system
                // this.cameraManager.shake(800, 5);
            }
            
            const arrivalText = config.cinematic.arrivalText || "A BOSS HAS ARRIVED";
            this.showEpicWarningText(arrivalText);
            
            // Start boss music as soon as the boss arrival text shows
            
            // Stop any current playlist first
            if (IdleAnts.AudioManager && IdleAnts.AudioManager.stopMusicPlaylist) {
                IdleAnts.AudioManager.stopMusicPlaylist();
            }
            
            // Play boss theme (use config's audio theme)
            const audioTheme = config.audio?.theme || 'BOSS_THEME';
            const audioAsset = IdleAnts.AudioAssets?.BGM?.[audioTheme];
            if (IdleAnts.AudioManager && audioAsset) {
                IdleAnts.AudioManager.playBGM(audioAsset.id);
            } else {
                console.warn(`[MUSIC] Audio theme ${audioTheme} not found, falling back to BOSS_THEME`);
                if (IdleAnts.AudioManager && IdleAnts.AudioAssets?.BGM?.BOSS_THEME) {
                    IdleAnts.AudioManager.playBGM(IdleAnts.AudioAssets.BGM.BOSS_THEME.id);
                }
            }
            
            // Fallback: direct HTML element access
            setTimeout(() => {
                    const audioElement = document.getElementById(audioAsset?.id || 'bgm_anteater_boss');
                    if (audioElement && audioElement.paused) {
                        audioElement.volume = 0.6;
                        audioElement.loop = true;
                        audioElement.play().catch(e => {
                            console.error('[MUSIC] Direct boss audio play failed:', e);
                        });
                    }
                }, 100);
            
            // Warning sound
            if (IdleAnts.AudioManager) {
                IdleAnts.AudioManager.playSFX('sfx_ant_spawn');
            }
        }, 500);

        // === PHASE 3: BOSS BEGINS INVASION MARCH (3 seconds) ===
        setTimeout(() => {
            this.hideWarningText();
            
            // Create warning effects at boss current position
            if (this.effectManager) {
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = 80;
                    const x = boss.x + Math.cos(angle) * radius;
                    const y = boss.y + Math.sin(angle) * radius;
                    this.effectManager.createSpawnEffect(x, y, false, {R: 255, G: 200, B: 0});
                }
            }
            
            // DRAMATIC KINGDOM RUSH STYLE ENTRANCE - Boss falls from sky and crashes down!
            const entranceDuration = 2500; // 2.5 seconds of epic entrance
            const startTime = Date.now();
            const finalBossX = boss.x; // Where boss will land
            const finalBossY = boss.y; // Final landing position
            
            // Boss starts WAY above the map for dramatic fall
            const startHeight = -200; // Start 200 pixels above visible area
            boss.y = startHeight;
            // Boss stays invisible initially - will become visible when fall starts
            
            // Add dramatic shadow that grows as boss approaches
            let shadowScale = 0;
            
            const epicEntranceAnimation = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / entranceDuration, 1);
                
                // PRE-FALL BUILDUP: Create anticipation before boss becomes visible
                if (progress < 0.15) {
                    // Show warning signs in the sky before boss appears
                    if (Math.random() < 0.4) {
                        if (this.effectManager) {
                            // Dark clouds/warning effects high above
                            const warningX = finalBossX + (Math.random() - 0.5) * 150;
                            const warningY = startHeight + (Math.random() * 100);
                            this.effectManager.createSpawnEffect(warningX, warningY, false, {
                                R: 80 + Math.random() * 50,
                                G: 80 + Math.random() * 50,
                                B: 80 + Math.random() * 50 // Dark warning clouds
                            });
                        }
                    }
                    return requestAnimationFrame(epicEntranceAnimation);
                }
                
                // Boss becomes visible when fall animation actually starts
                if (boss.alpha === 0) {
                    boss.alpha = 1;
                }
                
                // Adjust progress for fall phase (starts after 0.15)
                const fallProgress = Math.max(0, (progress - 0.15) / 0.85);
                
                // Eased falling motion - slow start, fast finish, bounce at end
                let motionProgress;
                if (fallProgress < 0.8) {
                    // Accelerating fall (ease-in-cubic)
                    const fallPhase = fallProgress / 0.8;
                    motionProgress = fallPhase * fallPhase * fallPhase;
                } else {
                    // Slight bounce at impact
                    const bouncePhase = (fallProgress - 0.8) / 0.2;
                    const bounce = Math.sin(bouncePhase * Math.PI * 2) * 0.05; // Small bounce
                    motionProgress = 1 + bounce;
                }
                
                // Boss position during fall
                boss.y = startHeight + (finalBossY - startHeight) * motionProgress;
                
                // Add slight horizontal sway during fall for realism
                const swayAmount = 15 * (1 - fallProgress); // Less sway as it approaches ground
                boss.x = finalBossX + Math.sin(elapsed * 0.01) * swayAmount;
                
                // Growing shadow effect
                shadowScale = fallProgress * 1.2; // Shadow grows as boss approaches
                
                // Speed lines effect during fast fall phase
                if (fallProgress > 0.3 && fallProgress < 0.9 && Math.random() < 0.3) {
                    if (this.effectManager) {
                        // Create speed lines above and to sides of falling boss
                        for (let i = 0; i < 3; i++) {
                            const lineX = boss.x + (Math.random() - 0.5) * 80;
                            const lineY = boss.y - 40 - Math.random() * 60;
                            this.effectManager.createSpawnEffect(lineX, lineY, false, {
                                R: 200 + Math.random() * 55,
                                G: 200 + Math.random() * 55, 
                                B: 255 // White/blue speed lines
                            });
                        }
                    }
                }
                
                // Impact warning as boss approaches ground
                if (fallProgress > 0.7 && Math.random() < 0.2) {
                    if (this.effectManager) {
                        // Warning dust at impact zone
                        const impactX = finalBossX + (Math.random() - 0.5) * 100;
                        const impactY = finalBossY + 20 + Math.random() * 30;
                        this.effectManager.createSpawnEffect(impactX, impactY, false, {
                            R: 255,
                            G: 255 - Math.random() * 100,
                            B: 100 + Math.random() * 100
                        });
                    }
                }
                
                if (progress < 1) {
                    requestAnimationFrame(epicEntranceAnimation);
                } else {
                    // MASSIVE IMPACT! Boss has landed!
                    boss.x = finalBossX;
                    boss.y = finalBossY;
                    
                    // Create huge impact effects
                    if (this.effectManager) {
                        // Massive dust explosion on impact
                        for (let i = 0; i < 40; i++) {
                            const angle = (i / 40) * Math.PI * 2;
                            const distance = 60 + Math.random() * 120;
                            const impactX = finalBossX + Math.cos(angle) * distance;
                            const impactY = finalBossY + Math.sin(angle) * distance * 0.7; // Flatten explosion
                            this.effectManager.createSpawnEffect(impactX, impactY, false, {
                                R: 139 + Math.random() * 80,
                                G: 115 + Math.random() * 60,
                                B: 85 + Math.random() * 40
                            });
                        }
                        
                        // Secondary shockwave rings
                        for (let ring = 0; ring < 3; ring++) {
                            setTimeout(() => {
                                for (let i = 0; i < 12; i++) {
                                    const angle = (i / 12) * Math.PI * 2;
                                    const distance = 80 + ring * 40;
                                    const ringX = finalBossX + Math.cos(angle) * distance;
                                    const ringY = finalBossY + Math.sin(angle) * distance * 0.6;
                                    this.effectManager.createSpawnEffect(ringX, ringY, false, {
                                        R: 255 - ring * 50,
                                        G: 200 - ring * 40,
                                        B: 100 + ring * 30
                                    });
                                }
                            }, ring * 150);
                        }
                    }
                    
                    this.handleEpicBossInvasion(boss, boss.x, boss.y, config);
                }
            };
            
            requestAnimationFrame(epicEntranceAnimation);
            
        }, 2000);

        // === PHASE 4: EPIC ARRIVAL & MUSIC ===
        // This happens in handleEpicBossInvasion
    }

    showEpicWarningText(text, isBossName = false) {
        // Remove existing warning text
        this.hideWarningText();
        
        // Create epic warning text
        this.warningText = document.createElement('div');
        const fontSize = isBossName ? '64px' : '42px';
        const color = isBossName ? '#FF4444' : '#FFD700';
        
        this.warningText.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Impact', 'Arial Black', sans-serif;
            font-size: ${fontSize};
            font-weight: bold;
            color: ${color};
            text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.9);
            text-align: center;
            z-index: 6000;
            opacity: 0;
            animation: epicTextReveal 1.5s ease-out forwards;
            pointer-events: none;
        `;
        this.warningText.textContent = text;
        document.body.appendChild(this.warningText);
        
        // Add enhanced CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes epicTextReveal {
                0% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.3) rotateX(90deg); 
                }
                30% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1.3) rotateX(0deg); 
                }
                100% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1.0) rotateX(0deg); 
                }
            }
        `;
        document.head.appendChild(style);
    }

    hideWarningText() {
        if (this.warningText) {
            this.warningText.style.animation = 'none';
            this.warningText.style.opacity = '0';
            this.warningText.style.transform = 'translate(-50%, -50%) scale(0.8)';
            this.warningText.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (this.warningText && this.warningText.parentNode) {
                    this.warningText.parentNode.removeChild(this.warningText);
                }
                this.warningText = null;
            }, 300);
        }
    }

    handleEpicBossInvasion(boss, landingX, landingY, config = null) {
        // === MASSIVE SCREEN SHAKE FOR ARRIVAL ===
        if (this.cameraManager) {
            // DISABLE SHAKE - it uses app.stage positioning which conflicts with worldContainer system
            // this.cameraManager.shake(1200, 40); // Strong arrival shake
        }
        
        // === NEST AREA IMPACT EFFECTS ===
        if (this.effectManager) {
            // Large dust cloud around nest area
            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2;
                const distance = 80 + Math.random() * 100;
                const x = landingX + Math.cos(angle) * distance;
                const y = landingY + Math.sin(angle) * distance;
                
                this.effectManager.createSpawnEffect(x, y, false, {
                    R: 139 + Math.random() * 60,
                    G: 115 + Math.random() * 40,
                    B: 85 + Math.random() * 30
                });
            }
            
            // Warning effects around the nest to show danger
            for (let wave = 0; wave < 3; wave++) {
                setTimeout(() => {
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const distance = 50 + wave * 30;
                        const x = landingX + Math.cos(angle) * distance;
                        const y = landingY + Math.sin(angle) * distance;
                        
                        this.effectManager.createSpawnEffect(x, y, false, {
                            R: 255 - wave * 30,
                            G: 100 + wave * 20,
                            B: 100 + wave * 20
                        });
                    }
                }, wave * 200);
            }
        }
        
        // === DRAMATIC BOSS NAME REVEAL ===
        setTimeout(() => {
            this.hideWarningText();
            const bossConfig = config || this.pendingBossConfig || IdleAnts.Data.BossConfigUtils.getBossConfig('anteater');
            this.showFinalBossReveal(bossConfig);
            
            // Music already started when boss arrival text appeared
            
            // NO ZOOM ANIMATION - keep camera exactly where it is to prevent coordinate corruption
            // The camera is already properly positioned from the initial pan
            
        }, 600);
        
        // === END CINEMATIC ===
        setTimeout(() => {
            this.endEpicCinematic();
        }, 2500);
    }

    showFinalBossReveal(config = null) {
        // Use config or fallback to default values
        const cinematic = config?.cinematic || {};
        const bossTitle = cinematic.bossTitle || "◆ BOSS ◆";
        const bossName = cinematic.bossName || "UNKNOWN BOSS";
        const bossSubtitle = cinematic.bossSubtitle || "Threat to the Colony";
        const titleColor = cinematic.titleColor || "#FFD700";
        const nameColor = cinematic.nameColor || "#FFFFFF";
        const subtitleColor = cinematic.subtitleColor || "#FFA500";
        // Create the ultimate boss name display
        this.bossNameDisplay = document.createElement('div');
        this.bossNameDisplay.style.cssText = `
            position: fixed;
            top: 25%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Impact', 'Arial Black', sans-serif;
            font-size: 56px;
            font-weight: bold;
            color: #FF2222;
            text-shadow: 6px 6px 12px rgba(0, 0, 0, 0.9);
            text-align: center;
            z-index: 6000;
            opacity: 0;
            animation: ultimateBossReveal 2s ease-out forwards;
            pointer-events: none;
        `;
        this.bossNameDisplay.innerHTML = `
            <div style="font-size: 28px; color: ${titleColor}; margin-bottom: 8px; text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);">${bossTitle}</div>
            <div style="letter-spacing: 3px; color: ${nameColor};">${bossName}</div>
            <div style="font-size: 20px; color: ${subtitleColor}; margin-top: 8px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);">${bossSubtitle}</div>
        `;
        document.body.appendChild(this.bossNameDisplay);
        
        // Add ultimate reveal animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ultimateBossReveal {
                0% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(2.5) rotateY(180deg); 
                }
                50% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1.2) rotateY(0deg); 
                }
                100% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1.0) rotateY(0deg); 
                }
            }
        `;
        document.head.appendChild(style);
    }

    endEpicCinematic() {
        // Remove all cinematic text elements
        this.hideWarningText();
        
        if (this.bossNameDisplay) {
            this.bossNameDisplay.style.opacity = '0';
            this.bossNameDisplay.style.transform = 'translate(-50%, -50%) scale(0.8)';
            this.bossNameDisplay.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                if (this.bossNameDisplay && this.bossNameDisplay.parentNode) {
                    this.bossNameDisplay.parentNode.removeChild(this.bossNameDisplay);
                }
                this.bossNameDisplay = null;
            }, 500);
        }
        
        // Music already started when "Great Anteater" text appeared
        
        // Show boss health bar
        if (this.uiManager) {
            this.uiManager.showBossHealthBar(this.currentBoss.maxHp);
        }
        
        // IMPORTANT: Officially transition to boss fight state - camera controls should work normally now
        this.transitionToState(IdleAnts.Game.States.BOSS_FIGHT);
    }
} 
