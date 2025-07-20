// Logger setup
const logger = IdleAnts.Logger?.create('CameraManager') || console;

// src/managers/camera/CameraManager.js
// Ensure IdleAnts and IdleAnts.Managers namespaces exist
if (typeof IdleAnts === 'undefined') {
    IdleAnts = {};
}
if (typeof IdleAnts.Managers === 'undefined') {
    IdleAnts.Managers = {};
}

IdleAnts.Managers.CameraManager = class {
    constructor(app, worldContainer, mapConfig, game) {
        this.app = app;
        this.worldContainer = worldContainer;
        this.mapConfig = mapConfig; // Contains .width, .height, .viewport, .zoom
        this.game = game; // For callbacks like game.updateMinimap(), game.updateHoverIndicator()

        // Camera state preservation for cinematics
        this.preservedCameraState = null;
        
        this.initializeZoomLevels();
    }

    initializeZoomLevels() {
        // Calculate the minimum zoom level based on map and viewport dimensions
        // This needs to run after app view is available
        if (this.app && this.app.view && this.app.view.width > 0 && this.app.view.height > 0 &&
            this.mapConfig && this.mapConfig.width > 0 && this.mapConfig.height > 0) {
            
            const minZoomX = this.app.view.width / this.mapConfig.width;
            const minZoomY = this.app.view.height / this.mapConfig.height;
            const dynamicMinZoom = Math.max(minZoomX, minZoomY);

            // Ensure zoom object and its properties exist with defaults if not already set
            this.mapConfig.zoom = this.mapConfig.zoom || {};
            this.mapConfig.zoom.min = Math.max(this.mapConfig.zoom.min || 0.25, dynamicMinZoom);
            this.mapConfig.zoom.level = Math.max(this.mapConfig.zoom.level || 1.0, dynamicMinZoom);
        } else {
            console.warn("CameraManager: PIXI app view dimensions or mapConfig dimensions not fully initialized for dynamic zoom calculation. Using default/existing zoom levels.");
            // Ensure zoom object and its properties exist with defaults if not already set
            this.mapConfig.zoom = this.mapConfig.zoom || {};
            this.mapConfig.zoom.min = this.mapConfig.zoom.min || 0.25;
            this.mapConfig.zoom.level = this.mapConfig.zoom.level || 1.0;
        }
    }

    updateCamera(keysPressed) {
        const speed = this.mapConfig.viewport.speed;
        let cameraMoved = false;
        
        // Adjust speed based on zoom level - faster movement when zoomed out
        const adjustedSpeed = speed / this.mapConfig.zoom.level;
        
        if (keysPressed.ArrowLeft || keysPressed.a) {
            this.mapConfig.viewport.x = Math.max(0, this.mapConfig.viewport.x - adjustedSpeed);
            cameraMoved = true;
        }
        if (keysPressed.ArrowRight || keysPressed.d) {
            const maxX = Math.max(0, this.mapConfig.width - (this.app.view.width / this.mapConfig.zoom.level));
            this.mapConfig.viewport.x = Math.min(maxX, this.mapConfig.viewport.x + adjustedSpeed);
            cameraMoved = true;
        }
        if (keysPressed.ArrowUp || keysPressed.w) {
            this.mapConfig.viewport.y = Math.max(0, this.mapConfig.viewport.y - adjustedSpeed);
            cameraMoved = true;
        }
        if (keysPressed.ArrowDown || keysPressed.s) {
            const maxY = Math.max(0, this.mapConfig.height - (this.app.view.height / this.mapConfig.zoom.level));
            this.mapConfig.viewport.y = Math.min(maxY, this.mapConfig.viewport.y + adjustedSpeed);
            cameraMoved = true;
        }
        
        if (cameraMoved) {
            if (this.worldContainer && this.worldContainer.position && typeof this.worldContainer.position.set === 'function') {
                this.worldContainer.position.set(
                    -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
                    -this.mapConfig.viewport.y * this.mapConfig.zoom.level
                );
            } else {
                console.error('[CAMERA] worldContainer.position is undefined in updateCamera');
            }
        }
        return cameraMoved;
    }

    centerViewOnPosition(x, y) {
        const viewWidth = this.app.screen.width / this.mapConfig.zoom.level;
        const viewHeight = this.app.screen.height / this.mapConfig.zoom.level;
        
        logger.debug(`[CAMERA] centerViewOnPosition called with center: (${x}, ${y})`);
        logger.debug(`[CAMERA] Screen dimensions: ${this.app.screen.width}x${this.app.screen.height}, zoom: ${this.mapConfig.zoom.level}`);
        logger.debug(`[CAMERA] View dimensions in world: ${viewWidth}x${viewHeight}`);
        
        const viewportX = Math.max(0, Math.min(x - (viewWidth / 2), this.mapConfig.width - viewWidth));
        const viewportY = Math.max(0, Math.min(y - (viewHeight / 2), this.mapConfig.height - viewHeight));
        
        logger.debug(`[CAMERA] Calculated viewport before assignment: (${viewportX}, ${viewportY})`);
        logger.debug(`[CAMERA] Viewport calculation: Y = max(0, min(${y} - ${viewHeight/2}, ${this.mapConfig.height} - ${viewHeight}))`);
        logger.debug(`[CAMERA] Viewport calculation: Y = max(0, min(${y - (viewHeight / 2)}, ${this.mapConfig.height - viewHeight}))`);
        
        this.mapConfig.viewport.x = viewportX;
        this.mapConfig.viewport.y = viewportY;
        
        // Safety check for worldContainer and position
        if (this.worldContainer && this.worldContainer.position && typeof this.worldContainer.position.set === 'function') {
            this.worldContainer.position.set(
                -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
                -this.mapConfig.viewport.y * this.mapConfig.zoom.level
            );
        } else {
            console.error('[CAMERA] worldContainer or position is undefined:', {
                worldContainer: !!this.worldContainer,
                position: this.worldContainer ? !!this.worldContainer.position : 'N/A',
                set: this.worldContainer && this.worldContainer.position ? typeof this.worldContainer.position.set : 'N/A'
            });
        }
        
        if (this.game && typeof this.game.updateMinimap === 'function') {
            this.game.updateMinimap();
        }
    }

    // Cinematic method: Position to show object in upper portion of screen
    cinematicShowObjectInUpperScreen(objectX, objectY, percentageFromTop = 0.4, zoom = null) {
        logger.debug(`[CAMERA] Cinematic: Showing object at (${objectX}, ${objectY}) in upper ${percentageFromTop * 100}% of screen`);
        
        // Set zoom if provided
        if (zoom !== null) {
            this.setZoom(zoom);
        }
        
        // Calculate screen dimensions in world coordinates
        const viewWidth = this.app.screen.width / this.mapConfig.zoom.level;
        const viewHeight = this.app.screen.height / this.mapConfig.zoom.level;
        
        // Calculate the desired screen position for the object
        const desiredScreenY = this.app.screen.height * percentageFromTop;
        const desiredWorldOffsetFromTop = desiredScreenY / this.mapConfig.zoom.level;
        
        // Calculate camera center needed to show object at desired position
        const cameraCenterX = objectX;
        let cameraCenterY = objectY - desiredWorldOffsetFromTop + (viewHeight / 2);
        
        // Check if this camera center would create a valid viewport
        const minValidCameraCenterY = viewHeight / 2; // Camera center minimum to avoid viewport Y = 0
        const maxValidCameraCenterY = this.mapConfig.height - (viewHeight / 2); // Can't center camera below this
        
        // Add a small buffer to ensure we never hit viewport Y = 0
        const safeMinCameraCenterY = minValidCameraCenterY + 10; // 10 pixel buffer from top edge
        
        if (cameraCenterY < safeMinCameraCenterY) {
            // Object is too close to top edge - adjust to show as much as possible
            cameraCenterY = safeMinCameraCenterY;
            const actualScreenY = (objectY - (cameraCenterY - viewHeight / 2)) * this.mapConfig.zoom.level;
            const actualPercentage = actualScreenY / this.app.screen.height;
            logger.debug(`[CAMERA] Boss too close to top edge - adjusted to show at ${(actualPercentage * 100).toFixed(1)}% instead of ${(percentageFromTop * 100)}%`);
            logger.debug(`[CAMERA] Used safe minimum camera Y: ${safeMinCameraCenterY} instead of ${minValidCameraCenterY}`);
        } else if (cameraCenterY > maxValidCameraCenterY) {
            // Object is too close to bottom edge - adjust to show as much as possible  
            cameraCenterY = maxValidCameraCenterY;
            const actualScreenY = (objectY - (cameraCenterY - viewHeight / 2)) * this.mapConfig.zoom.level;
            const actualPercentage = actualScreenY / this.app.screen.height;
            logger.debug(`[CAMERA] Boss too close to bottom edge - adjusted to show at ${(actualPercentage * 100).toFixed(1)}% instead of ${(percentageFromTop * 100)}%`);
        }
        
        logger.debug(`[CAMERA] Calculated camera center: (${cameraCenterX}, ${cameraCenterY})`);
        logger.debug(`[CAMERA] Valid camera Y range: ${minValidCameraCenterY} to ${maxValidCameraCenterY}`);
        
        // Use the existing centerViewOnPosition method (should not need clamping now)
        this.centerViewOnPosition(cameraCenterX, cameraCenterY);
        
        logger.debug(`[CAMERA] Final viewport: (${this.mapConfig.viewport.x}, ${this.mapConfig.viewport.y})`);
    }

    centerCameraOnNest() {
        const nestX = this.mapConfig.width / 2;
        const nestY = this.mapConfig.height / 2;
        
        this.initializeZoomLevels(); 
        this.setZoom(this.mapConfig.zoom.level); // Use proper zoom method instead of direct scale manipulation

        this.centerViewOnPosition(nestX, nestY);
    }

    updateZoom(zoomDelta, mouseX, mouseY) {
        const oldZoom = this.mapConfig.zoom.level;
        
        // Recalculate dynamicMinZoom based on current view size and update mapConfig.zoom.min
        this.initializeZoomLevels(); 
        const effectiveMinZoom = this.mapConfig.zoom.min;
        
        this.mapConfig.zoom.level = Math.max(
            effectiveMinZoom,
            Math.min(this.mapConfig.zoom.level + zoomDelta, this.mapConfig.zoom.max)
        );
        
        if (oldZoom === this.mapConfig.zoom.level) return;
        
        const worldX = (mouseX / oldZoom) + this.mapConfig.viewport.x;
        const worldY = (mouseY / oldZoom) + this.mapConfig.viewport.y;
        
        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);
        
        this.mapConfig.viewport.x = worldX - (mouseX / this.mapConfig.zoom.level);
        this.mapConfig.viewport.y = worldY - (mouseY / this.mapConfig.zoom.level);
        
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
        
        this.worldContainer.position.set(
            -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
            -this.mapConfig.viewport.y * this.mapConfig.zoom.level
        );
        
        if (this.game && typeof this.game.updateMinimap === 'function') {
            this.game.updateMinimap();
        }
        if (this.game && typeof this.game.updateHoverIndicator === 'function' &&
            this.game.lastMouseX !== undefined && this.game.lastMouseY !== undefined) {
            // Ensure lastMouseX and lastMouseY are accessible from the game instance
            this.game.updateHoverIndicator(this.game.lastMouseX, this.game.lastMouseY);
        }
    }

    panViewport(screenDeltaX, screenDeltaY) {
        // screenDeltaX and screenDeltaY are the change in screen coordinates
        // Positive screenDeltaX means swipe right, so viewport should move left (decrease x)
        const worldDeltaX = screenDeltaX / this.mapConfig.zoom.level;
        const worldDeltaY = screenDeltaY / this.mapConfig.zoom.level;

        this.mapConfig.viewport.x = Math.max(0, Math.min(
            this.mapConfig.viewport.x - worldDeltaX, // Subtract worldDeltaX
            this.mapConfig.width - (this.app.view.width / this.mapConfig.zoom.level)
        ));
        
        this.mapConfig.viewport.y = Math.max(0, Math.min(
            this.mapConfig.viewport.y - worldDeltaY, // Subtract worldDeltaY
            this.mapConfig.height - (this.app.view.height / this.mapConfig.zoom.level)
        ));
        
        this.worldContainer.position.set(
            -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
            -this.mapConfig.viewport.y * this.mapConfig.zoom.level
        );
        
        if (this.game && typeof this.game.updateMinimap === 'function') {
            this.game.updateMinimap();
        }
    }

    handleResizeOrOrientationChange() {
        this.initializeZoomLevels();

        if (this.mapConfig.zoom.level < this.mapConfig.zoom.min) {
            this.mapConfig.zoom.level = this.mapConfig.zoom.min;
        }
        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);
        
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

        this.worldContainer.position.set(
            -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
            -this.mapConfig.viewport.y * this.mapConfig.zoom.level
        );
        
        if (this.game && typeof this.game.updateMinimap === 'function') {
            this.game.updateMinimap();
        }
        if (this.game && this.game.uiManager && typeof this.game.uiManager.updateUI === 'function') {
            this.game.uiManager.updateUI();
        }
    }

    // Method to set the zoom level directly
    setZoom(newZoom) {
        // Use the same zoom constraints as updateZoom method
        this.initializeZoomLevels(); // Ensure zoom limits are current
        const effectiveMinZoom = this.mapConfig.zoom.min;
        
        newZoom = Math.max(effectiveMinZoom, Math.min(this.mapConfig.zoom.max, newZoom));
        this.mapConfig.zoom.level = newZoom;

        // Update world container scale with safety check
        if (this.worldContainer && this.worldContainer.scale && typeof this.worldContainer.scale.set === 'function') {
            this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);
        } else {
            console.error('[CAMERA] worldContainer.scale is undefined in setZoom');
        }
        
        // Update viewport position to maintain current view
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
        
        // Update world container position with safety check
        if (this.worldContainer && this.worldContainer.position && typeof this.worldContainer.position.set === 'function') {
            this.worldContainer.position.set(
                -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
                -this.mapConfig.viewport.y * this.mapConfig.zoom.level
            );
        } else {
            console.error('[CAMERA] worldContainer.position is undefined in setZoom');
        }
        
        // Update minimap if available
        if (this.game && typeof this.game.updateMinimap === 'function') {
            this.game.updateMinimap();
        }
    }

    // Camera state preservation for cinematics
    preserveCameraState() {
        this.preservedCameraState = {
            viewport: {
                x: this.mapConfig.viewport.x,
                y: this.mapConfig.viewport.y
            },
            zoom: this.mapConfig.zoom.level,
            worldPosition: {
                x: this.worldContainer.position.x,
                y: this.worldContainer.position.y
            }
        };
        logger.debug('[CAMERA] State preserved:', this.preservedCameraState);
    }
    
    restoreCameraState() {
        if (this.preservedCameraState) {
            // Restore exact state
            this.mapConfig.viewport.x = this.preservedCameraState.viewport.x;
            this.mapConfig.viewport.y = this.preservedCameraState.viewport.y;
            this.mapConfig.zoom.level = this.preservedCameraState.zoom;
            
            // Apply proper viewport clamping to ensure we don't show beyond map boundaries
            const viewWidth = this.app.screen.width / this.mapConfig.zoom.level;
            const viewHeight = this.app.screen.height / this.mapConfig.zoom.level;
            const maxViewportX = Math.max(0, this.mapConfig.width - viewWidth);
            const maxViewportY = Math.max(0, this.mapConfig.height - viewHeight);
            
            this.mapConfig.viewport.x = Math.max(0, Math.min(this.mapConfig.viewport.x, maxViewportX));
            this.mapConfig.viewport.y = Math.max(0, Math.min(this.mapConfig.viewport.y, maxViewportY));
            
            logger.debug(`[CAMERA] Viewport clamped to: (${this.mapConfig.viewport.x}, ${this.mapConfig.viewport.y}) within bounds (${maxViewportX}, ${maxViewportY})`);
            
            if (this.worldContainer && this.worldContainer.position && typeof this.worldContainer.position.set === 'function') {
                this.worldContainer.position.set(
                    -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
                    -this.mapConfig.viewport.y * this.mapConfig.zoom.level
                );
            } else {
                console.error('[CAMERA] worldContainer.position is undefined in restoreCameraState');
            }
            
            logger.debug('[CAMERA] State restored to:', this.preservedCameraState);
            
            // Update minimap if available
            if (this.game && typeof this.game.updateMinimap === 'function') {
                this.game.updateMinimap();
            }
            
            // Clear preserved state
            this.preservedCameraState = null;
        }
    }

    // Safe cinematic camera pan that uses the same coordinate system as WASD controls
    startCinematicPanTo(targetX, targetY, duration = 2000) {
        // Calculate where we want the viewport to be to center on the target
        const viewWidth = this.app.screen.width / this.mapConfig.zoom.level;
        const viewHeight = this.app.screen.height / this.mapConfig.zoom.level;
        
        const targetViewportX = Math.max(0, Math.min(targetX - (viewWidth / 2), this.mapConfig.width - viewWidth));
        const targetViewportY = Math.max(0, Math.min(targetY - (viewHeight / 2), this.mapConfig.height - viewHeight));
        
        // Store pan animation state
        this.cinematicPan = {
            startTime: Date.now(),
            duration: duration,
            startViewportX: this.mapConfig.viewport.x,
            startViewportY: this.mapConfig.viewport.y,
            targetViewportX: targetViewportX,
            targetViewportY: targetViewportY,
            active: true
        };
        
        logger.debug(`[CAMERA] Starting safe cinematic pan from (${this.mapConfig.viewport.x}, ${this.mapConfig.viewport.y}) to (${targetViewportX}, ${targetViewportY})`);
    }
    
    // Update cinematic pan animation - call this in game loop
    updateCinematicPan() {
        if (!this.cinematicPan || !this.cinematicPan.active) {
            return false;
        }
        
        const elapsed = Date.now() - this.cinematicPan.startTime;
        const progress = Math.min(elapsed / this.cinematicPan.duration, 1.0);
        
        // Use easing for smooth movement
        const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        
        // Interpolate viewport position
        this.mapConfig.viewport.x = this.cinematicPan.startViewportX + 
            (this.cinematicPan.targetViewportX - this.cinematicPan.startViewportX) * easeProgress;
        this.mapConfig.viewport.y = this.cinematicPan.startViewportY + 
            (this.cinematicPan.targetViewportY - this.cinematicPan.startViewportY) * easeProgress;
        
        // Update world container position using the same method as WASD controls
        if (this.worldContainer && this.worldContainer.position && typeof this.worldContainer.position.set === 'function') {
            this.worldContainer.position.set(
                -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
                -this.mapConfig.viewport.y * this.mapConfig.zoom.level
            );
        }
        
        // Check if animation is complete
        if (progress >= 1.0) {
            this.cinematicPan.active = false;
            logger.debug(`[CAMERA] Cinematic pan completed at viewport: (${this.mapConfig.viewport.x}, ${this.mapConfig.viewport.y})`);
            return false; // Animation finished
        }
        
        return true; // Animation continuing
    }

    // Adds a camera shake effect
    shake(duration = 400, strength = 20) {
        // --- Diagnostic guard to identify undefined chain ---
        if (!this.app || !this.app.stage) {
            console.error('[Camera-shake] this.app or this.app.stage missing', this.app);
            return;
        }
        if (!this.app.stage.scale) {
            console.error('[Camera-shake] this.app.stage.scale missing – stage:', this.app.stage);
            requestAnimationFrame(() => this.shake(duration, strength));
            return;
        }

        // If stage or scale not yet initialised, defer shake to next frame
        if (!this.app || !this.app.stage || !this.app.stage.scale) {
            requestAnimationFrame(() => this.shake(duration, strength));
            return;
        }

        const originalViewportX = this.mapConfig.viewport.x;
        const originalViewportY = this.mapConfig.viewport.y;
        let elapsed = 0;

        const shakeFn = (delta) => {
            if (!this.app || !this.app.stage || !this.app.stage.scale) return; // Defensive check

            elapsed += PIXI.Ticker.shared.elapsedMS;
            const progress = elapsed / duration;
            const currentStrength = strength * (1 - progress);

            this.mapConfig.viewport.x = originalViewportX + (Math.random() - 0.5) * currentStrength * 2;
            this.mapConfig.viewport.y = originalViewportY + (Math.random() - 0.5) * currentStrength * 2;

            // Update stage position to apply shake (use safe fallback scale 1)
            const scaleX = (this.app && this.app.stage && this.app.stage.scale) ? this.app.stage.scale.x : 1;
            const scaleY = (this.app && this.app.stage && this.app.stage.scale) ? this.app.stage.scale.y : 1;
            if (this.app && this.app.stage) {
                this.app.stage.x = -this.mapConfig.viewport.x * scaleX + this.app.screen.width / 2;
                this.app.stage.y = -this.mapConfig.viewport.y * scaleY + this.app.screen.height / 2;
            }

            if (elapsed >= duration) {
                // End shake: reset to original position and remove ticker listener
                this.mapConfig.viewport.x = originalViewportX;
                this.mapConfig.viewport.y = originalViewportY;
                if (this.app && this.app.stage) {
                    const sX = (this.app.stage.scale) ? this.app.stage.scale.x : 1;
                    const sY = (this.app.stage.scale) ? this.app.stage.scale.y : 1;
                    this.app.stage.x = -this.mapConfig.viewport.x * sX + this.app.screen.width / 2;
                    this.app.stage.y = -this.mapConfig.viewport.y * sY + this.app.screen.height / 2;
                }

                PIXI.Ticker.shared.remove(shakeFn);
            }
        };
        PIXI.Ticker.shared.add(shakeFn);
    }
};
