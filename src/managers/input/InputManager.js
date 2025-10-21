// Ensure IdleAnts and IdleAnts.Managers namespaces exist
if (typeof IdleAnts === 'undefined') {
    IdleAnts = {};
}
if (typeof IdleAnts.Managers === 'undefined') {
    IdleAnts.Managers = {};
}

IdleAnts.Managers.InputManager = class {
    constructor(app, gameInstance, cameraManager, resourceManager, entityManager, mapConfig) {
        this.app = app;
        this.game = gameInstance;
        this.cameraManager = cameraManager;
        this.resourceManager = resourceManager; // Needed for getting current food type
        this.entityManager = entityManager;   // Needed for adding food
        this.mapConfig = mapConfig;           // For coordinate conversions

        // Keyboard state
        this.keysPressed = {
            ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
            w: false, a: false, s: false, d: false
        };

        // Touch state
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        this.isPanning = false;
        this.lastPinchDistance = 0;
        this.isTouching = false;
        this.touchStartTime = 0;
        this.touchMoved = false;
        
        // Mobile-specific settings (copied from Game.js, consider centralizing later)
        this.mobileSettings = {
            tapDelay: this.game.isMobileDevice ? 100 : 0, 
            minSwipeDistance: 10,
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Canvas click for manual food placement (desktop)
        this.app.view.addEventListener('click', this.handleCanvasClick.bind(this));
        
        // Mouse move for hover effect
        this.app.view.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.app.view.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

        // Keyboard controls for map navigation and actions
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Make canvas focusable and focus on mousedown
        this.app.view.tabIndex = 1;
        this.app.view.addEventListener('mousedown', () => this.app.view.focus());

        // Wheel events for zoom
        this.app.view.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

        // Touch events
        this.app.view.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.app.view.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.app.view.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.app.view.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
    }

    handleCanvasClick(e) {
        if ((this.game.state !== IdleAnts.Game.States.PLAYING && this.game.state !== IdleAnts.Game.States.BOSS_FIGHT) || this.game.isMobileDevice) { // Mobile uses touchend for taps
            return;
        }
        
        const rect = this.app.view.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        const worldX = (screenX / this.mapConfig.zoom.level) + this.mapConfig.viewport.x;
        const worldY = (screenY / this.mapConfig.zoom.level) + this.mapConfig.viewport.y;
        
        const currentFoodType = this.resourceManager.getCurrentFoodType();
        this.entityManager.addFood({ x: worldX, y: worldY, clickPlaced: true }, currentFoodType);
        
        // Food clicks are now tracked automatically through addFood
        
        if (this.game.uiManager) this.game.uiManager.updateUI();
    }

    handleMouseMove(e) {
        const rect = this.app.view.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.game.lastMouseX = x; // Game class still responsible for hoverIndicator logic itself
        this.game.lastMouseY = y;
        
        // Game's updateHoverIndicator is called in its gameLoop, no need to call here directly
        // unless we want immediate response outside the loop, which might be complex.
        // For now, rely on Game's loop to pick up lastMouseX/Y.
    }

    handleMouseLeave() {
        // Game class will clear its hoverIndicator based on undefined lastMouseX/Y
        this.game.lastMouseX = undefined;
        this.game.lastMouseY = undefined;
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            this.game.togglePause();
            return;
        }

        // Ability shortcuts (1-6 keys) - during PLAYING, BOSS_INTRO, and BOSS_FIGHT states
        const allowAbilities = this.game.state === IdleAnts.Game.States.PLAYING ||
                              this.game.state === IdleAnts.Game.States.BOSS_INTRO ||
                              this.game.state === IdleAnts.Game.States.BOSS_FIGHT;

        if (allowAbilities && this.game.abilityManager) {
            const abilityMap = {
                '1': 'foodRain',
                '2': 'speedSurge',
                '3': 'antFrenzy',
                '4': 'berserkerMode',
                '5': 'cloneArmy',
                '6': 'meteorShower'
            };

            const abilityId = abilityMap[e.key];
            if (abilityId) {
                e.preventDefault();
                this.game.abilityManager.useAbility(abilityId);
                return;
            }
        }

        // Allow camera controls during PLAYING, BOSS_INTRO, and BOSS_FIGHT states
        const allowCameraControls = this.game.state === IdleAnts.Game.States.PLAYING ||
                                   this.game.state === IdleAnts.Game.States.BOSS_INTRO ||
                                   this.game.state === IdleAnts.Game.States.BOSS_FIGHT;

        if (!allowCameraControls) {
            return;
        }

        if (this.keysPressed.hasOwnProperty(e.key)) {
            e.preventDefault();
            this.keysPressed[e.key] = true;
        }
    }

    handleKeyUp(e) {
        if (this.keysPressed.hasOwnProperty(e.key)) {
            e.preventDefault();
            this.keysPressed[e.key] = false;
        }
    }

    handleWheel(e) {
        // Allow zoom controls during PLAYING, BOSS_INTRO, and BOSS_FIGHT states
        const allowCameraControls = this.game.state === IdleAnts.Game.States.PLAYING || 
                                   this.game.state === IdleAnts.Game.States.BOSS_INTRO || 
                                   this.game.state === IdleAnts.Game.States.BOSS_FIGHT;
                                   
        if (!allowCameraControls || !this.cameraManager) {
            return;
        }
        e.preventDefault();
        
        const rect = this.app.view.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomDelta = e.deltaY > 0 ? -this.mapConfig.zoom.speed : this.mapConfig.zoom.speed;
        this.cameraManager.updateZoom(zoomDelta, mouseX, mouseY);
    }

    handleTouchStart(e) {
        e.preventDefault();
        
        // Allow touch controls during PLAYING, BOSS_INTRO, and BOSS_FIGHT states
        const allowCameraControls = this.game.state === IdleAnts.Game.States.PLAYING || 
                                   this.game.state === IdleAnts.Game.States.BOSS_INTRO || 
                                   this.game.state === IdleAnts.Game.States.BOSS_FIGHT;
                                   
        if (!allowCameraControls) return;

        this.isTouching = true;
        this.touchStartTime = Date.now();
        this.touchMoved = false;

        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.app.view.getBoundingClientRect();
            this.touchStartX = touch.clientX - rect.left;
            this.touchStartY = touch.clientY - rect.top;
            this.lastTouchX = this.touchStartX;
            this.lastTouchY = this.touchStartY;

            // For hover indicator on touch (Game will handle drawing)
            this.game.lastMouseX = this.touchStartX;
            this.game.lastMouseY = this.touchStartY;

        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            this.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
            
            // Clear hover if it was active
            this.game.lastMouseX = undefined; 
            this.game.lastMouseY = undefined;
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        
        // Allow touch controls during PLAYING, BOSS_INTRO, and BOSS_FIGHT states
        const allowCameraControls = this.game.state === IdleAnts.Game.States.PLAYING || 
                                   this.game.state === IdleAnts.Game.States.BOSS_INTRO || 
                                   this.game.state === IdleAnts.Game.States.BOSS_FIGHT;
                                   
        if (!allowCameraControls || !this.isTouching) return;

        this.touchMoved = true;

        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.app.view.getBoundingClientRect();
            const currentX = touch.clientX - rect.left;
            const currentY = touch.clientY - rect.top;

            const deltaX = currentX - this.lastTouchX;
            const deltaY = currentY - this.lastTouchY;

            if (!this.isPanning && (Math.abs(deltaX) > this.mobileSettings.minSwipeDistance || Math.abs(deltaY) > this.mobileSettings.minSwipeDistance)) {
                this.isPanning = true;
                 // Clear hover if panning starts
                this.game.lastMouseX = undefined;
                this.game.lastMouseY = undefined;
            }

            if (this.isPanning && this.cameraManager) {
                this.cameraManager.panViewport(deltaX, deltaY); // screenDeltaX, screenDeltaY
            } else {
                // Update hover if not panning
                this.game.lastMouseX = currentX;
                this.game.lastMouseY = currentY;
            }
            
            this.lastTouchX = currentX;
            this.lastTouchY = currentY;

        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            const currentPinchDistance = Math.sqrt(dx * dx + dy * dy);
            const pinchDelta = currentPinchDistance - this.lastPinchDistance;

            if (Math.abs(pinchDelta) > 5) { // Threshold
                const zoomDelta = (pinchDelta / 100) * this.mapConfig.zoom.speed;
                const rect = this.app.view.getBoundingClientRect();
                const centerX = ((touch1.clientX + touch2.clientX) / 2) - rect.left;
                const centerY = ((touch1.clientY + touch2.clientY) / 2) - rect.top;
                this.cameraManager.updateZoom(zoomDelta, centerX, centerY);
                this.lastPinchDistance = currentPinchDistance;
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        
        // Allow touch controls during PLAYING, BOSS_INTRO, and BOSS_FIGHT states
        const allowCameraControls = this.game.state === IdleAnts.Game.States.PLAYING || 
                                   this.game.state === IdleAnts.Game.States.BOSS_INTRO || 
                                   this.game.state === IdleAnts.Game.States.BOSS_FIGHT;
                                   
        if (!allowCameraControls) return;

        const touchDuration = Date.now() - this.touchStartTime;

        if (e.touches.length === 0) { // All touches ended
            // Only allow food placement during PLAYING state
            if ((this.game.state === IdleAnts.Game.States.PLAYING || this.game.state === IdleAnts.Game.States.BOSS_FIGHT) && !this.touchMoved && touchDuration < 300 && !this.isPanning) { // Tap
                // Use initial touch position for tap accuracy
                const worldX = (this.touchStartX / this.mapConfig.zoom.level) + this.mapConfig.viewport.x;
                const worldY = (this.touchStartY / this.mapConfig.zoom.level) + this.mapConfig.viewport.y;
                
                const currentFoodType = this.resourceManager.getCurrentFoodType();
                
                // Apply tap delay for mobile
                setTimeout(() => {
                    this.entityManager.addFood({ x: worldX, y: worldY, clickPlaced: true }, currentFoodType);
                    
                    // Food clicks are now tracked automatically through addFood
                    
                    if (this.game.uiManager) this.game.uiManager.updateUI();
                }, this.mobileSettings.tapDelay);
            }
            
            this.isPanning = false;
            this.isTouching = false;
            this.touchMoved = false;
            
            // Clear hover indicator on touch end
            this.game.lastMouseX = undefined;
            this.game.lastMouseY = undefined;
        }
    }

    handleTouchCancel(e) {
        this.isPanning = false;
        this.isTouching = false;
        this.touchMoved = false;
        // Clear hover indicator
        this.game.lastMouseX = undefined;
        this.game.lastMouseY = undefined;
    }

    // This method would be called from the Game's gameLoop
    update() {
        // Allow camera controls during PLAYING, BOSS_INTRO, and BOSS_FIGHT states
        const allowCameraControls = this.game.state === IdleAnts.Game.States.PLAYING || 
                                   this.game.state === IdleAnts.Game.States.BOSS_INTRO || 
                                   this.game.state === IdleAnts.Game.States.BOSS_FIGHT;
                                   
        if (allowCameraControls && this.cameraManager) {
            const cameraMoved = this.cameraManager.updateCamera(this.keysPressed); // Pass keysPressed
            if (cameraMoved && this.game.updateMinimap) { // If camera moved due to keys, update minimap
                this.game.updateMinimap();
            }
        }
    }
}; 