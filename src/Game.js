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
        
        // Calculate the minimum zoom level based on map and viewport dimensions
        // We need to wait until the app is created to do this
        const minZoomX = this.app.view.width / this.mapConfig.width;
        const minZoomY = this.app.view.height / this.mapConfig.height;
        const dynamicMinZoom = Math.max(minZoomX, minZoomY);
        
        // Update the minimum zoom level and initial zoom level
        this.mapConfig.zoom.min = Math.max(this.mapConfig.zoom.min, dynamicMinZoom);
        this.mapConfig.zoom.level = Math.max(1.0, dynamicMinZoom);
        
        // Run any registered initialization functions
        this.runInitHooks();
        
        // Load assets before initializing other managers
        this.assetManager.loadAssets().then(() => {
            this.backgroundManager = new IdleAnts.Managers.BackgroundManager(this.app, this.assetManager, this.worldContainer);
            this.entityManager = new IdleAnts.Managers.EntityManager(this.app, this.assetManager, this.resourceManager, this.worldContainer);
            this.effectManager = new IdleAnts.Managers.EffectManager(this.app);
            
            // Initialize audio manager
            IdleAnts.AudioManager.init();
            
            // Set up effect manager reference
            this.entityManager.setEffectManager(this.effectManager);
            
            // UI Manager needs access to the game for buttons
            this.uiManager = new IdleAnts.Managers.UIManager(this.resourceManager, this, this.effectManager);
            
            this.setupGame();
            this.setupEventListeners();
            this.startGameLoop();
            this.setupMinimap();
            // Update minimap initially to render it on game start
            this.updateMinimap();
            
            // Center camera on nest after everything is set up
            this.centerCameraOnNest();
            
            // Setup audio resuming on user interaction
            this.setupAudioResumeOnInteraction();
            
            // Start playing background music
            this.startBackgroundMusic();
            
            // Transition to PLAYING state
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
        
        // Initialize world container scale based on zoom level
        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);
        
        // Set up game entities
        this.entityManager.setupEntities();
        
        // Initialize ant attributes
        this.entityManager.updateAntsSpeed();
        this.entityManager.updateAntsCapacity();
        
        // Initialize UI by updating it
        this.uiManager.updateUI();
    }
    
    setupEventListeners() {
        // Set up canvas click for manual food placement
        this.app.view.addEventListener('click', (e) => {
            // Only handle clicks when in PLAYING state
            if (this.state !== IdleAnts.Game.States.PLAYING) {
                return;
            }
            
            const rect = this.app.view.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            
            // Convert screen coordinates to world coordinates with zoom
            const worldX = (screenX / this.mapConfig.zoom.level) + this.mapConfig.viewport.x;
            const worldY = (screenY / this.mapConfig.zoom.level) + this.mapConfig.viewport.y;
            
            // Get the current food type based on food tier
            const currentFoodType = this.resourceManager.getCurrentFoodType();
            
            // Place food at the clicked location with the appropriate food type
            this.entityManager.addFood({ x: worldX, y: worldY, clickPlaced: true }, currentFoodType);
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
            
            // Store last mouse position for hover updates in game loop
            this.lastMouseX = x;
            this.lastMouseY = y;
            
            // Only show hover indicator in PLAYING state
            if (this.state === IdleAnts.Game.States.PLAYING) {
                this.updateHoverIndicator(x, y);
            } else {
                this.hoverIndicator.clear();
            }
        });
        
        // Remove hover effect when mouse leaves the canvas
        this.app.view.addEventListener('mouseleave', () => {
            this.hoverIndicator.clear();
            this.lastMouseX = undefined;
            this.lastMouseY = undefined;
        });

        // Setup keyboard controls for map navigation
        this.keysPressed = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            a: false,
            s: false,
            d: false
        };
        
        // Event listeners for keyboard controls
        const handleKeyDown = (e) => {
            // Handle Escape key for pause toggle
            if (e.key === 'Escape') {
                e.preventDefault();
                this.togglePause();
                return;
            }
            
            // Handle other keys only if game is in PLAYING state
            if (this.state !== IdleAnts.Game.States.PLAYING) {
                return;
            }
            
            if (this.keysPressed.hasOwnProperty(e.key)) {
                e.preventDefault(); // Prevent scrolling with arrow keys
                this.keysPressed[e.key] = true;
            }
        };
        
        const handleKeyUp = (e) => {
            if (this.keysPressed.hasOwnProperty(e.key)) {
                e.preventDefault();
                this.keysPressed[e.key] = false;
            }
        };
        
        // Add event listeners to document (more reliable than window)
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        
        // Make canvas focusable to help with key events
        this.app.view.tabIndex = 1;
        
        // Focus the canvas when clicked
        this.app.view.addEventListener('mousedown', () => {
            this.app.view.focus();
        });
        
        // Add event listener for window resize
        window.addEventListener('resize', () => {
            this.updateMinimap();
        });
        
        // Add event listener for wheel events (zoom)
        this.app.view.addEventListener('wheel', (e) => {
            // Only handle wheel events in PLAYING state
            if (this.state !== IdleAnts.Game.States.PLAYING) {
                return;
            }
            
            e.preventDefault(); // Prevent page scrolling
            
            // Get mouse position relative to canvas
            const rect = this.app.view.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Calculate zoom delta (negative for zoom in, positive for zoom out)
            const zoomDelta = e.deltaY > 0 ? -this.mapConfig.zoom.speed : this.mapConfig.zoom.speed;
            
            // Update zoom with mouse position as focal point
            this.updateZoom(zoomDelta, mouseX, mouseY);
        }, {passive: false});
        
        // Touch event handling for mobile devices
        
        // Variables to track touch state
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        this.isPanning = false;
        this.lastPinchDistance = 0;
        this.isTouching = false;
        this.touchStartTime = 0;
        this.touchMoved = false;
        
        // Handle touch start
        this.app.view.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default browser behavior
            
            // Only handle touch events in PLAYING state
            if (this.state !== IdleAnts.Game.States.PLAYING) {
                return;
            }
            
            this.isTouching = true;
            this.touchStartTime = Date.now();
            this.touchMoved = false;
            
            if (e.touches.length === 1) {
                // Single touch - prepare for panning
                const touch = e.touches[0];
                const rect = this.app.view.getBoundingClientRect();
                this.touchStartX = touch.clientX - rect.left;
                this.touchStartY = touch.clientY - rect.top;
                this.lastTouchX = this.touchStartX;
                this.lastTouchY = this.touchStartY;
                
                // Update hover indicator for touch position
                this.lastMouseX = this.touchStartX;
                this.lastMouseY = this.touchStartY;
                this.updateHoverIndicator(this.touchStartX, this.touchStartY);
                
            } else if (e.touches.length === 2) {
                // Two touches - prepare for pinch zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const rect = this.app.view.getBoundingClientRect();
                
                // Calculate distance between touches
                const dx = touch1.clientX - touch2.clientX;
                const dy = touch1.clientY - touch2.clientY;
                this.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
                
                // Clear hover indicator during pinch
                this.hoverIndicator.clear();
            }
        }, {passive: false});
        
        // Handle touch move
        this.app.view.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent default browser behavior
            
            // Only handle touch events in PLAYING state
            if (this.state !== IdleAnts.Game.States.PLAYING) {
                return;
            }
            
            this.touchMoved = true;
            
            if (e.touches.length === 1) {
                // Single touch - handle panning
                const touch = e.touches[0];
                const rect = this.app.view.getBoundingClientRect();
                const currentX = touch.clientX - rect.left;
                const currentY = touch.clientY - rect.top;
                
                // Calculate the distance moved
                const deltaX = currentX - this.lastTouchX;
                const deltaY = currentY - this.lastTouchY;
                
                // Only start panning after a small threshold to distinguish from taps
                if (!this.isPanning && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
                    this.isPanning = true;
                    // Clear hover indicator during panning
                    this.hoverIndicator.clear();
                }
                
                if (this.isPanning) {
                    // Move the camera based on touch movement
                    // Invert the delta because we want to move the world in the opposite direction
                    this.mapConfig.viewport.x = Math.max(0, Math.min(
                        this.mapConfig.viewport.x - (deltaX / this.mapConfig.zoom.level),
                        this.mapConfig.width - (this.app.view.width / this.mapConfig.zoom.level)
                    ));
                    
                    this.mapConfig.viewport.y = Math.max(0, Math.min(
                        this.mapConfig.viewport.y - (deltaY / this.mapConfig.zoom.level),
                        this.mapConfig.height - (this.app.view.height / this.mapConfig.zoom.level)
                    ));
                    
                    // Update world container position
                    this.worldContainer.position.set(
                        -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
                        -this.mapConfig.viewport.y * this.mapConfig.zoom.level
                    );
                    
                    // Update minimap
                    this.updateMinimap();
                } else {
                    // Update hover indicator for touch position
                    this.lastMouseX = currentX;
                    this.lastMouseY = currentY;
                    this.updateHoverIndicator(currentX, currentY);
                }
                
                // Update last touch position
                this.lastTouchX = currentX;
                this.lastTouchY = currentY;
                
            } else if (e.touches.length === 2) {
                // Two touches - handle pinch zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                // Calculate current distance between touches
                const dx = touch1.clientX - touch2.clientX;
                const dy = touch1.clientY - touch2.clientY;
                const currentPinchDistance = Math.sqrt(dx * dx + dy * dy);
                
                // Calculate zoom delta based on pinch distance change
                const pinchDelta = currentPinchDistance - this.lastPinchDistance;
                
                if (Math.abs(pinchDelta) > 5) { // Small threshold to avoid jitter
                    // Calculate zoom change - scale factor to make it feel natural
                    const zoomDelta = (pinchDelta / 100) * this.mapConfig.zoom.speed;
                    
                    // Calculate center point between the two touches
                    const rect = this.app.view.getBoundingClientRect();
                    const centerX = ((touch1.clientX + touch2.clientX) / 2) - rect.left;
                    const centerY = ((touch1.clientY + touch2.clientY) / 2) - rect.top;
                    
                    // Update zoom with center point as focal point
                    this.updateZoom(zoomDelta, centerX, centerY);
                    
                    // Update last pinch distance
                    this.lastPinchDistance = currentPinchDistance;
                }
            }
        }, {passive: false});
        
        // Handle touch end
        this.app.view.addEventListener('touchend', (e) => {
            e.preventDefault(); // Prevent default browser behavior
            
            // Only handle touch events in PLAYING state
            if (this.state !== IdleAnts.Game.States.PLAYING) {
                return;
            }
            
            // Check if this was a tap (short touch without much movement)
            const touchDuration = Date.now() - this.touchStartTime;
            
            if (e.touches.length === 0) {
                // All touches ended
                if (!this.touchMoved && touchDuration < 300) {
                    // This was a tap - place food after a small delay to avoid accidental taps
                    const tapDelay = this.isMobileDevice && this.mobileSettings ? this.mobileSettings.tapDelay : 0;
                    
                    setTimeout(() => {
                        const rect = this.app.view.getBoundingClientRect();
                        const worldX = (this.touchStartX / this.mapConfig.zoom.level) + this.mapConfig.viewport.x;
                        const worldY = (this.touchStartY / this.mapConfig.zoom.level) + this.mapConfig.viewport.y;
                        
                        // Get the current food type based on food tier
                        const currentFoodType = this.resourceManager.getCurrentFoodType();
                        
                        // Place food at the tapped location
                        this.entityManager.addFood({ x: worldX, y: worldY, clickPlaced: true }, currentFoodType);
                        this.uiManager.updateUI();
                    }, tapDelay);
                }
                
                // Reset touch state
                this.isPanning = false;
                this.isTouching = false;
                
                // Clear hover indicator
                this.hoverIndicator.clear();
            }
        }, {passive: false});
        
        // Handle touch cancel
        this.app.view.addEventListener('touchcancel', (e) => {
            // Reset touch state
            this.isPanning = false;
            this.isTouching = false;
            
            // Clear hover indicator
            this.hoverIndicator.clear();
        }, {passive: false});

        // Handle orientation change on mobile devices
        if (this.isMobileDevice) {
            window.addEventListener('orientationchange', () => {
                // Wait for the orientation change to complete
                setTimeout(() => {
                    // Recalculate minimum zoom level
                    const minZoomX = this.app.view.width / this.mapConfig.width;
                    const minZoomY = this.app.view.height / this.mapConfig.height;
                    const dynamicMinZoom = Math.max(minZoomX, minZoomY);
                    
                    // Update the minimum zoom level
                    this.mapConfig.zoom.min = Math.max(this.mapConfig.zoom.min, dynamicMinZoom);
                    
                    // Adjust current zoom level if needed
                    if (this.mapConfig.zoom.level < dynamicMinZoom) {
                        this.mapConfig.zoom.level = dynamicMinZoom;
                        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);
                    }
                    
                    // Update world container position
                    this.worldContainer.position.set(
                        -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
                        -this.mapConfig.viewport.y * this.mapConfig.zoom.level
                    );
                    
                    // Update minimap position and size
                    this.updateMinimap();
                    
                    // Update UI layout
                    if (this.uiManager) {
                        this.uiManager.updateUI();
                    }
                }, 300); // Small delay to ensure orientation change is complete
            });
        }

        // Add sound toggle button event listener
        const soundToggleButton = document.getElementById('toggle-sound');
        if (soundToggleButton) {
            soundToggleButton.addEventListener('click', () => {
                this.toggleSound();
                // Also try to resume AudioContext on this explicit interaction
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
    
    updateCamera() {
        const speed = this.mapConfig.viewport.speed;
        let cameraMoved = false;
        
        // Adjust speed based on zoom level - faster movement when zoomed out
        const adjustedSpeed = speed / this.mapConfig.zoom.level;
        
        // Check for key presses and move camera accordingly
        if (this.keysPressed.ArrowLeft || this.keysPressed.a) {
            this.mapConfig.viewport.x = Math.max(0, this.mapConfig.viewport.x - adjustedSpeed);
            cameraMoved = true;
        }
        if (this.keysPressed.ArrowRight || this.keysPressed.d) {
            const maxX = Math.max(0, this.mapConfig.width - (this.app.view.width / this.mapConfig.zoom.level));
            this.mapConfig.viewport.x = Math.min(maxX, this.mapConfig.viewport.x + adjustedSpeed);
            cameraMoved = true;
        }
        if (this.keysPressed.ArrowUp || this.keysPressed.w) {
            this.mapConfig.viewport.y = Math.max(0, this.mapConfig.viewport.y - adjustedSpeed);
            cameraMoved = true;
        }
        if (this.keysPressed.ArrowDown || this.keysPressed.s) {
            const maxY = Math.max(0, this.mapConfig.height - (this.app.view.height / this.mapConfig.zoom.level));
            this.mapConfig.viewport.y = Math.min(maxY, this.mapConfig.viewport.y + adjustedSpeed);
            cameraMoved = true;
        }
        
        // Update world container position if camera moved
        if (cameraMoved) {
            this.worldContainer.position.set(
                -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
                -this.mapConfig.viewport.y * this.mapConfig.zoom.level
            );
        }
        
        return cameraMoved;
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
            this.centerViewOnPosition(worldX, worldY);
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
    
    centerViewOnPosition(x, y) {
        // Calculate the center position for the view
        const halfWidth = this.app.screen.width / 2;
        const halfHeight = this.app.screen.height / 2;
        
        // Set the new camera position, centered on the given coordinates
        // Adjust for zoom level
        const viewWidth = this.app.screen.width / this.mapConfig.zoom.level;
        const viewHeight = this.app.screen.height / this.mapConfig.zoom.level;
        
        this.mapConfig.viewport.x = Math.max(0, Math.min(x - (viewWidth / 2), this.mapConfig.width - viewWidth));
        this.mapConfig.viewport.y = Math.max(0, Math.min(y - (viewHeight / 2), this.mapConfig.height - viewHeight));
        
        // Update world container position
        this.worldContainer.position.set(
            -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
            -this.mapConfig.viewport.y * this.mapConfig.zoom.level
        );
        
        // Update minimap after changing the view position
        this.updateMinimap();
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
            return;
        }
        
        // Update frame counter
        this.frameCounter++;
        
        // Update camera position based on keyboard input
        this.updateCamera();
        
        // Update entities
        this.entityManager.update();
        
        // Update effects
        this.effectManager.update();
        
        // Update UI every 30 frames (approximately twice per second at 60fps)
        // This is frequent enough for smooth updates but not too frequent to cause performance issues
        if (this.frameCounter % 30 === 0) {
            this.uiManager.updateUI();
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
        
        // Check for queen ant larvae production
        if (this.resourceManager.stats.hasQueen && 
            this.frameCounter % this.resourceManager.stats.queenLarvaeProductionRate === 0) {
            this.produceQueenLarvae();
        }
        
        // Always update hover indicator regardless of state
        if (this.lastMouseX !== undefined && this.lastMouseY !== undefined) {
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
            this.resourceManager.stats.expandCost = Math.floor(this.resourceManager.stats.expandCost * 2);
            
            // Delegate nest expansion to EntityManager
            this.entityManager.expandNest();
            
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
    
    centerCameraOnNest() {
        // Center the viewport on the nest (which is at the center of the map)
        const nestX = this.mapConfig.width / 2;
        const nestY = this.mapConfig.height / 2;
        
        // Calculate the minimum zoom level based on map and viewport dimensions
        const minZoomX = this.app.view.width / this.mapConfig.width;
        const minZoomY = this.app.view.height / this.mapConfig.height;
        const dynamicMinZoom = Math.max(minZoomX, minZoomY);
        
        // Reset zoom to default or minimum required level
        this.mapConfig.zoom.level = Math.max(dynamicMinZoom, 1.0);
        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);
        
        this.centerViewOnPosition(nestX, nestY);
        
        // Update minimap after centering on nest
        this.updateMinimap();
    }
    
    // Navigation helper methods kept for future use
    /*
    addNavigationHelper() {
        // Create a container for the navigation helper
        this.navHelper = new PIXI.Container();
        this.minimapContainer.addChild(this.navHelper);
        
        // Background panel
        const bg = new PIXI.Graphics();
        bg.beginFill(0x000000, 0.7);
        bg.drawRoundedRect(0, 0, 160, 80, 5);
        bg.endFill();
        this.navHelper.addChild(bg);
        
        // Create text instructions
        const title = new PIXI.Text('Map Navigation:', { 
            fontFamily: 'Arial', 
            fontSize: 14, 
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        title.position.set(10, 10);
        this.navHelper.addChild(title);
        
        const arrowKeys = new PIXI.Text('Arrow Keys / WASD: Move', { 
            fontFamily: 'Arial', 
            fontSize: 12, 
            fill: 0xFFFFFF 
        });
        arrowKeys.position.set(10, 30);
        this.navHelper.addChild(arrowKeys);
        
        const minimapText = new PIXI.Text('Click Minimap: Jump to location', { 
            fontFamily: 'Arial', 
            fontSize: 12, 
            fill: 0xFFFFFF 
        });
        minimapText.position.set(10, 50);
        this.navHelper.addChild(minimapText);
        
        // Position in top-left corner
        this.navHelper.position.set(10, 10);
        
        // Make it disappear after 10 seconds
        setTimeout(() => {
            // Create a fade out animation
            const fadeOut = () => {
                this.navHelper.alpha -= 0.02;
                if (this.navHelper.alpha > 0) {
                    requestAnimationFrame(fadeOut);
                }
            };
            fadeOut();
        }, 10000);
    }
    
    updateNavigationHelperPosition() {
        if (this.navHelper) {
            this.navHelper.position.set(10, 10);
        }
    }
    
    showNavigationNotification() {
        // Create a container for the notification
        const notification = new PIXI.Container();
        this.app.stage.addChild(notification);
        
        // Background with arrow key graphic
        const bg = new PIXI.Graphics();
        bg.beginFill(0x000000, 0.8);
        bg.drawRoundedRect(0, 0, 300, 140, 10);
        bg.endFill();
        notification.addChild(bg);
        
        // Title
        const title = new PIXI.Text('Map Navigation Controls', { 
            fontFamily: 'Arial', 
            fontSize: 16, 
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        title.position.set(20, 15);
        notification.addChild(title);
        
        // Instructions
        const instr1 = new PIXI.Text('Use Arrow Keys or WASD to move around', { 
            fontFamily: 'Arial', 
            fontSize: 14, 
            fill: 0xFFFFFF 
        });
        instr1.position.set(20, 45);
        notification.addChild(instr1);
        
        const instr2 = new PIXI.Text('Click on the minimap to jump to a location', { 
            fontFamily: 'Arial', 
            fontSize: 14, 
            fill: 0xFFFFFF 
        });
        instr2.position.set(20, 70);
        notification.addChild(instr2);
        
        // Draw arrow keys graphic
        const arrowKeys = new PIXI.Graphics();
        
        // Up arrow
        arrowKeys.beginFill(0x444444);
        arrowKeys.drawRoundedRect(50, 95, 30, 30, 5);
        arrowKeys.endFill();
        arrowKeys.beginFill(0xFFFFFF);
        arrowKeys.moveTo(65, 100);
        arrowKeys.lineTo(60, 110);
        arrowKeys.lineTo(70, 110);
        arrowKeys.lineTo(65, 100);
        arrowKeys.endFill();
        
        // Left arrow
        arrowKeys.beginFill(0x444444);
        arrowKeys.drawRoundedRect(15, 130, 30, 30, 5);
        arrowKeys.endFill();
        arrowKeys.beginFill(0xFFFFFF);
        arrowKeys.moveTo(20, 145);
        arrowKeys.lineTo(30, 140);
        arrowKeys.lineTo(30, 150);
        arrowKeys.lineTo(20, 145);
        arrowKeys.endFill();
        
        // Down arrow
        arrowKeys.beginFill(0x444444);
        arrowKeys.drawRoundedRect(50, 130, 30, 30, 5);
        arrowKeys.endFill();
        arrowKeys.beginFill(0xFFFFFF);
        arrowKeys.moveTo(65, 155);
        arrowKeys.lineTo(60, 145);
        arrowKeys.lineTo(70, 145);
        arrowKeys.lineTo(65, 155);
        arrowKeys.endFill();
        
        // Right arrow
        arrowKeys.beginFill(0x444444);
        arrowKeys.drawRoundedRect(85, 130, 30, 30, 5);
        arrowKeys.endFill();
        arrowKeys.beginFill(0xFFFFFF);
        arrowKeys.moveTo(110, 145);
        arrowKeys.lineTo(100, 140);
        arrowKeys.lineTo(100, 150);
        arrowKeys.lineTo(110, 145);
        arrowKeys.endFill();
        
        // WASD keys
        const wasdText = new PIXI.Text('WASD', { 
            fontFamily: 'Arial', 
            fontSize: 14, 
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        wasdText.position.set(140, 130);
        
        notification.addChild(arrowKeys);
        notification.addChild(wasdText);
        
        // Position in center of screen
        notification.position.set(
            (this.app.screen.width - notification.width) / 2,
            (this.app.screen.height - notification.height) / 2 - 50
        );
        
        // Add close button
        const closeBtn = new PIXI.Graphics();
        closeBtn.beginFill(0x880000);
        closeBtn.drawRoundedRect(0, 0, 20, 20, 3);
        closeBtn.endFill();
        closeBtn.lineStyle(2, 0xFFFFFF);
        closeBtn.moveTo(5, 5);
        closeBtn.lineTo(15, 15);
        closeBtn.moveTo(15, 5);
        closeBtn.lineTo(5, 15);
        closeBtn.position.set(notification.width - 25, 5);
        closeBtn.interactive = true;
        closeBtn.buttonMode = true;
        
        closeBtn.on('pointerdown', () => {
            this.app.stage.removeChild(notification);
        });
        
        notification.addChild(closeBtn);
        
        // Auto-hide after 12 seconds
        setTimeout(() => {
            if (notification.parent) {
                // Create a fade out animation
                const fadeOut = () => {
                    notification.alpha -= 0.02;
                    if (notification.alpha > 0) {
                        requestAnimationFrame(fadeOut);
                    } else {
                        this.app.stage.removeChild(notification);
                    }
                };
                fadeOut();
            }
        }, 12000);
    }
    */

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

    updateZoom(zoomDelta, mouseX, mouseY) {
        // Store old zoom level
        const oldZoom = this.mapConfig.zoom.level;
        
        // Calculate the minimum zoom level based on map and viewport dimensions
        // This ensures we can't zoom out beyond the map boundaries
        const minZoomX = this.app.view.width / this.mapConfig.width;
        const minZoomY = this.app.view.height / this.mapConfig.height;
        const dynamicMinZoom = Math.max(minZoomX, minZoomY);
        
        // Use the calculated minimum zoom or the configured minimum, whichever is larger
        const effectiveMinZoom = Math.max(this.mapConfig.zoom.min, dynamicMinZoom);
        
        // Apply zoom with constraints
        this.mapConfig.zoom.level = Math.max(
            effectiveMinZoom,
            Math.min(this.mapConfig.zoom.level + zoomDelta, this.mapConfig.zoom.max)
        );
        
        // If zoom didn't change, exit early
        if (oldZoom === this.mapConfig.zoom.level) return;
        
        // Get world position under mouse before zoom
        const worldX = (mouseX / oldZoom) + this.mapConfig.viewport.x;
        const worldY = (mouseY / oldZoom) + this.mapConfig.viewport.y;
        
        // Apply scale to world container
        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);
        
        // Adjust viewport to keep mouse position fixed during zoom
        this.mapConfig.viewport.x = worldX - (mouseX / this.mapConfig.zoom.level);
        this.mapConfig.viewport.y = worldY - (mouseY / this.mapConfig.zoom.level);
        
        // Constrain viewport to map boundaries
        const newWorldWidth = this.app.view.width / this.mapConfig.zoom.level;
        const newWorldHeight = this.app.view.height / this.mapConfig.zoom.level;
        
        this.mapConfig.viewport.x = Math.max(0, Math.min(
            this.mapConfig.viewport.x,
            this.mapConfig.width - newWorldWidth
        ));
        this.mapConfig.viewport.y = Math.max(0, Math.min(
            this.mapConfig.viewport.y,
            this.mapConfig.height - newWorldHeight
        ));
        
        // Update world container position
        this.worldContainer.position.set(
            -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
            -this.mapConfig.viewport.y * this.mapConfig.zoom.level
        );
        
        // Update minimap to reflect new zoom level
        this.updateMinimap();
        
        // Update hover indicator if mouse is over canvas
        if (this.lastMouseX !== undefined && this.lastMouseY !== undefined) {
            this.updateHoverIndicator(this.lastMouseX, this.lastMouseY);
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

    // Add the missing produceQueenLarvae function
    produceQueenLarvae() {
        // Check if we have a queen
        if (!this.resourceManager.stats.hasQueen) {
            return;
        }
        
        // Get the queen's larvae capacity
        const larvaeCapacity = this.resourceManager.stats.queenLarvaeCapacity;
        
        // Add larvae through the entity manager
        if (this.entityManager) {
            this.entityManager.produceQueenLarvae(larvaeCapacity);
        }
    }

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
}; 