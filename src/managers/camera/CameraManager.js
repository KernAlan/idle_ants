// src/managers/camera/CameraManager.js
// Ensure IdleAnts and IdleAnts.Managers namespaces exist
if (typeof IdleAnts === 'undefined') {
    IdleAnts = {};
}
if (typeof IdleAnts.Managers === 'undefined') {
    IdleAnts.Managers = {};
}

IdleAnts.Managers.CameraManager = class {
    constructor(app, mapConfig, worldContainer, gameInstance) {
        this.app = app;
        this.mapConfig = mapConfig; // Contains .width, .height, .viewport, .zoom
        this.worldContainer = worldContainer;
        this.game = gameInstance; // For callbacks like game.updateMinimap(), game.updateHoverIndicator()

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
            this.worldContainer.position.set(
                -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
                -this.mapConfig.viewport.y * this.mapConfig.zoom.level
            );
        }
        return cameraMoved;
    }

    centerViewOnPosition(x, y) {
        const viewWidth = this.app.screen.width / this.mapConfig.zoom.level;
        const viewHeight = this.app.screen.height / this.mapConfig.zoom.level;
        
        this.mapConfig.viewport.x = Math.max(0, Math.min(x - (viewWidth / 2), this.mapConfig.width - viewWidth));
        this.mapConfig.viewport.y = Math.max(0, Math.min(y - (viewHeight / 2), this.mapConfig.height - viewHeight));
        
        this.worldContainer.position.set(
            -this.mapConfig.viewport.x * this.mapConfig.zoom.level,
            -this.mapConfig.viewport.y * this.mapConfig.zoom.level
        );
        
        if (this.game && typeof this.game.updateMinimap === 'function') {
            this.game.updateMinimap();
        }
    }

    centerCameraOnNest() {
        const nestX = this.mapConfig.width / 2;
        const nestY = this.mapConfig.height / 2;
        
        this.initializeZoomLevels(); 
        this.worldContainer.scale.set(this.mapConfig.zoom.level, this.mapConfig.zoom.level);

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
};
