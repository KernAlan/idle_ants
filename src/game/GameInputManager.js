/**
 * GameInputManager - Handles all input events (mouse, keyboard, touch)
 * Extracted from Game.js to improve maintainability
 */

// Ensure Game namespace exists
if (!IdleAnts.Game) {
    IdleAnts.Game = {};
}

IdleAnts.Game.InputManager = class {
    constructor(game) {
        this.game = game;
        this.isMouseDown = false;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.dragThreshold = 5; // Minimum distance before considering it a drag
        
        // Mobile-specific properties
        this.isMobileDevice = game.isMobileDevice;
        this.touchStartTime = 0;
        this.lastTapTime = 0;
        this.doubleTapDelay = 300; // ms
        
        this.setupEventListeners();
    }

    /**
     * Set up all input event listeners
     */
    setupEventListeners() {
        const canvas = this.game.app.view;
        
        // Mouse events
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        canvas.addEventListener('wheel', this.onWheel.bind(this));
        canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));
        
        // Touch events for mobile
        if (this.isMobileDevice) {
            canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
            canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
            canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        }
        
        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Window events
        window.addEventListener('resize', this.onResize.bind(this));
    }

    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @returns {object} World coordinates {x, y}
     */
    screenToWorld(screenX, screenY) {
        const worldContainer = this.game.worldContainer;
        const scale = worldContainer.scale.x;
        
        return {
            x: (screenX - worldContainer.x) / scale,
            y: (screenY - worldContainer.y) / scale
        };
    }

    /**
     * Handle mouse down events
     * @param {MouseEvent} event - Mouse event
     */
    onMouseDown(event) {
        if (this.game.stateManager.isInAnyState(['BOSS_INTRO', 'BOSS_FIGHT'])) {
            return; // Ignore input during boss sequences
        }

        this.isMouseDown = true;
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        
        // Handle right-click for food placement (if in debug mode)
        if (event.button === 2 && IdleAnts.Config.debug) {
            this.handleFoodPlacement(event);
        }
    }

    /**
     * Handle mouse move events
     * @param {MouseEvent} event - Mouse event
     */
    onMouseMove(event) {
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        
        // Update last mouse position
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        
        // Handle camera dragging
        if (this.isMouseDown && !this.isDragging) {
            const dragDistance = Math.sqrt(
                Math.pow(event.clientX - this.dragStartX, 2) + 
                Math.pow(event.clientY - this.dragStartY, 2)
            );
            
            if (dragDistance > this.dragThreshold) {
                this.isDragging = true;
            }
        }
        
        if (this.isDragging) {
            this.handleCameraDrag(deltaX, deltaY);
        }
        
        // Update hover indicator
        this.updateHoverIndicator(event.clientX, event.clientY);
    }

    /**
     * Handle mouse up events
     * @param {MouseEvent} event - Mouse event
     */
    onMouseUp(event) {
        if (!this.isDragging && this.isMouseDown) {
            // This was a click, not a drag
            this.handleClick(event);
        }
        
        this.isMouseDown = false;
        this.isDragging = false;
    }

    /**
     * Handle mouse wheel events for zooming
     * @param {WheelEvent} event - Wheel event
     */
    onWheel(event) {
        event.preventDefault();
        
        if (this.game.stateManager.isInAnyState(['BOSS_INTRO', 'BOSS_FIGHT'])) {
            return; // Ignore zoom during boss sequences
        }
        
        const delta = event.deltaY > 0 ? -1 : 1;
        this.handleZoom(delta, event.clientX, event.clientY);
    }

    /**
     * Handle context menu (right-click)
     * @param {Event} event - Context menu event
     */
    onContextMenu(event) {
        event.preventDefault(); // Prevent context menu
    }

    /**
     * Handle touch start events
     * @param {TouchEvent} event - Touch event
     */
    onTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchStartTime = Date.now();
            
            // Handle potential double tap
            const currentTime = Date.now();
            if (currentTime - this.lastTapTime < this.doubleTapDelay) {
                this.handleDoubleTap(touch.clientX, touch.clientY);
            }
            this.lastTapTime = currentTime;
            
            // Treat as mouse down
            this.onMouseDown({
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0
            });
        }
    }

    /**
     * Handle touch move events
     * @param {TouchEvent} event - Touch event
     */
    onTouchMove(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.onMouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }

    /**
     * Handle touch end events
     * @param {TouchEvent} event - Touch event
     */
    onTouchEnd(event) {
        event.preventDefault();
        
        // Check if this was a quick tap (not a drag)
        const touchDuration = Date.now() - this.touchStartTime;
        if (touchDuration < 200 && !this.isDragging) {
            // This was a tap
            const touch = event.changedTouches[0];
            this.handleClick({
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0
            });
        }
        
        this.onMouseUp({});
    }

    /**
     * Handle keyboard down events
     * @param {KeyboardEvent} event - Keyboard event
     */
    onKeyDown(event) {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePause();
                break;
            case 'Escape':
                this.handleEscape();
                break;
            case 'KeyU':
                if (this.game.stateManager.isInState('PLAYING')) {
                    this.game.stateManager.setState('UPGRADING');
                }
                break;
        }
    }

    /**
     * Handle keyboard up events
     * @param {KeyboardEvent} event - Keyboard event
     */
    onKeyUp(event) {
        // Handle key up events if needed
    }

    /**
     * Handle window resize events
     * @param {Event} event - Resize event
     */
    onResize(event) {
        if (this.game.app && this.game.app.renderer) {
            this.game.app.renderer.resize(window.innerWidth, window.innerHeight);
        }
        
        // Update UI layout
        if (this.game.uiManager) {
            this.game.uiManager.handleResize();
        }
    }

    /**
     * Handle click events
     * @param {object} event - Click event data
     */
    handleClick(event) {
        if (this.game.stateManager.isInAnyState(['BOSS_INTRO', 'BOSS_FIGHT'])) {
            return; // Ignore clicks during boss sequences
        }
        
        const worldPos = this.screenToWorld(event.clientX, event.clientY);
        
        // Check if clicking on food to collect it
        if (this.game.entityManager) {
            const foods = this.game.entityManager.getAllFoods();
            for (const food of foods) {
                if (this.isPointInFood(worldPos, food)) {
                    this.handleFoodClick(food);
                    return;
                }
            }
        }
        
        // If not clicking on food, add food for manual collection
        this.handleManualFoodPlacement(worldPos);
    }

    /**
     * Handle double tap on mobile
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     */
    handleDoubleTap(x, y) {
        // Zoom in on double tap
        this.handleZoom(1, x, y);
    }

    /**
     * Handle camera dragging
     * @param {number} deltaX - X movement delta
     * @param {number} deltaY - Y movement delta
     */
    handleCameraDrag(deltaX, deltaY) {
        if (this.game.worldContainer) {
            this.game.worldContainer.x += deltaX;
            this.game.worldContainer.y += deltaY;
            
            // Apply camera bounds
            this.applyCameraBounds();
        }
    }

    /**
     * Handle zoom functionality
     * @param {number} direction - Zoom direction (1 for in, -1 for out)
     * @param {number} centerX - Screen X coordinate for zoom center
     * @param {number} centerY - Screen Y coordinate for zoom center
     */
    handleZoom(direction, centerX, centerY) {
        if (!this.game.worldContainer) return;
        
        const worldContainer = this.game.worldContainer;
        const zoomConfig = this.game.mapConfig.zoom;
        
        const oldScale = worldContainer.scale.x;
        const zoomFactor = 1 + (direction * zoomConfig.speed);
        let newScale = oldScale * zoomFactor;
        
        // Clamp zoom level
        newScale = Math.max(zoomConfig.min, Math.min(zoomConfig.max, newScale));
        
        if (newScale !== oldScale) {
            // Calculate zoom point in world coordinates
            const worldPoint = this.screenToWorld(centerX, centerY);
            
            // Apply new scale
            worldContainer.scale.set(newScale);
            
            // Adjust position to zoom towards the cursor
            const newWorldPoint = this.screenToWorld(centerX, centerY);
            worldContainer.x += (worldPoint.x - newWorldPoint.x) * newScale;
            worldContainer.y += (worldPoint.y - newWorldPoint.y) * newScale;
            
            this.applyCameraBounds();
        }
    }

    /**
     * Apply camera bounds to prevent moving outside the world
     */
    applyCameraBounds() {
        if (!this.game.worldContainer) return;
        
        const container = this.game.worldContainer;
        const mapConfig = this.game.mapConfig;
        const scale = container.scale.x;
        
        const maxX = 0;
        const minX = -(mapConfig.width * scale - window.innerWidth);
        const maxY = 0;
        const minY = -(mapConfig.height * scale - window.innerHeight);
        
        container.x = Math.max(minX, Math.min(maxX, container.x));
        container.y = Math.max(minY, Math.min(maxY, container.y));
    }

    /**
     * Update hover indicator position
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     */
    updateHoverIndicator(x, y) {
        this.game.lastMouseX = x;
        this.game.lastMouseY = y;
    }

    /**
     * Toggle game pause state
     */
    togglePause() {
        const currentState = this.game.stateManager.getState();
        
        if (currentState === 'PLAYING') {
            this.game.stateManager.setState('PAUSED');
        } else if (currentState === 'PAUSED') {
            this.game.stateManager.setState('PLAYING');
        }
    }

    /**
     * Handle escape key press
     */
    handleEscape() {
        const currentState = this.game.stateManager.getState();
        
        switch(currentState) {
            case 'UPGRADING':
                this.game.stateManager.setState('PLAYING');
                break;
            case 'PAUSED':
                this.game.stateManager.setState('PLAYING');
                break;
        }
    }

    /**
     * Handle food placement in debug mode
     * @param {object} event - Mouse event
     */
    handleFoodPlacement(event) {
        if (!IdleAnts.Config.debug) return;
        
        const worldPos = this.screenToWorld(event.clientX, event.clientY);
        
        if (this.game.entityManager) {
            this.game.entityManager.createFood(worldPos, 'apple');
        }
    }

    /**
     * Handle manual food placement for collection
     * @param {object} worldPos - World position {x, y}
     */
    handleManualFoodPlacement(worldPos) {
        if (this.game.resourceManager) {
            const foodGained = this.game.resourceManager.stats.foodPerClick * 
                              this.game.resourceManager.stats.foodMultiplier;
            this.game.resourceManager.addFood(foodGained);
        }
    }

    /**
     * Handle food click for collection
     * @param {object} food - Food entity
     */
    handleFoodClick(food) {
        if (this.game.entityManager && this.game.resourceManager) {
            const foodValue = food.getValue ? food.getValue() : 1;
            this.game.resourceManager.addFood(foodValue);
            this.game.entityManager.removeFood(food);
        }
    }

    /**
     * Check if a point is within a food entity
     * @param {object} point - Point {x, y}
     * @param {object} food - Food entity
     * @returns {boolean} True if point is in food
     */
    isPointInFood(point, food) {
        if (!food.sprite) return false;
        
        const bounds = food.sprite.getBounds();
        return point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
               point.y >= bounds.y && point.y <= bounds.y + bounds.height;
    }

    /**
     * Clean up event listeners
     */
    cleanup() {
        const canvas = this.game.app.view;
        
        // Remove mouse events
        canvas.removeEventListener('mousedown', this.onMouseDown);
        canvas.removeEventListener('mousemove', this.onMouseMove);
        canvas.removeEventListener('mouseup', this.onMouseUp);
        canvas.removeEventListener('wheel', this.onWheel);
        canvas.removeEventListener('contextmenu', this.onContextMenu);
        
        // Remove touch events
        if (this.isMobileDevice) {
            canvas.removeEventListener('touchstart', this.onTouchStart);
            canvas.removeEventListener('touchmove', this.onTouchMove);
            canvas.removeEventListener('touchend', this.onTouchEnd);
        }
        
        // Remove keyboard events
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        
        // Remove window events
        window.removeEventListener('resize', this.onResize);
    }
};