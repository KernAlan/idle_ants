/**
 * GameMinimapManager - Handles minimap functionality
 * Extracted from Game.js to maintain Single Responsibility Principle
 */

// Ensure Game namespace exists
if (!IdleAnts.Game) {
    IdleAnts.Game = {};
}

IdleAnts.Game.GameMinimapManager = class {
    constructor(game) {
        this.game = game;
        this.minimapContainer = null;
        this.minimapBackground = null;
        this.minimapScale = 0.05; // Scale factor for minimap
        this.minimapSize = { width: 200, height: 150 };
        this.minimapPosition = { x: 20, y: 20 }; // Top-left position
        
        this.setupMinimap();
    }

    /**
     * Set up the minimap
     */
    setupMinimap() {
        if (!this.game.minimapContainer) {
            this.game.minimapContainer = new PIXI.Container();
            this.game.app.stage.addChild(this.game.minimapContainer);
        }
        
        this.minimapContainer = this.game.minimapContainer;
        
        // Create minimap background
        this.minimapBackground = new PIXI.Graphics();
        this.minimapBackground.beginFill(0x2D5016); // Dark green background
        this.minimapBackground.drawRect(0, 0, this.minimapSize.width, this.minimapSize.height);
        this.minimapBackground.endFill();
        
        // Add border
        this.minimapBackground.lineStyle(2, 0xFFFFFF, 0.8);
        this.minimapBackground.drawRect(0, 0, this.minimapSize.width, this.minimapSize.height);
        
        this.minimapBackground.x = this.minimapPosition.x;
        this.minimapBackground.y = this.minimapPosition.y;
        
        this.minimapContainer.addChild(this.minimapBackground);
        
        // Create viewport indicator
        this.viewportIndicator = new PIXI.Graphics();
        this.minimapContainer.addChild(this.viewportIndicator);
        
        // Make minimap clickable for navigation
        this.minimapBackground.interactive = true;
        this.minimapBackground.buttonMode = true;
        this.minimapBackground.on('pointerdown', (event) => {
            this.onMinimapClick(event);
        });
    }

    /**
     * Handle minimap click for camera navigation
     * @param {Event} event - Click event
     */
    onMinimapClick(event) {
        if (this.game.cameraManager) {
            const localPos = event.data.getLocalPosition(this.minimapBackground);
            
            // Convert minimap coordinates to world coordinates
            const worldX = (localPos.x / this.minimapSize.width) * this.game.mapConfig.width;
            const worldY = (localPos.y / this.minimapSize.height) * this.game.mapConfig.height;
            
            // Pan camera to clicked position
            this.game.cameraManager.panTo(worldX, worldY, 1000);
        }
    }

    /**
     * Update minimap display
     */
    updateMinimap() {
        if (!this.minimapContainer || !this.viewportIndicator) return;
        
        // Clear previous viewport indicator
        this.viewportIndicator.clear();
        
        // Draw current viewport on minimap
        const viewportX = (-this.game.worldContainer.x / this.game.mapConfig.width) * this.minimapSize.width;
        const viewportY = (-this.game.worldContainer.y / this.game.mapConfig.height) * this.minimapSize.height;
        const viewportWidth = (this.game.app.screen.width / this.game.mapConfig.width) * this.minimapSize.width;
        const viewportHeight = (this.game.app.screen.height / this.game.mapConfig.height) * this.minimapSize.height;
        
        this.viewportIndicator.lineStyle(2, 0xFF0000, 0.8);
        this.viewportIndicator.drawRect(
            this.minimapPosition.x + viewportX,
            this.minimapPosition.y + viewportY,
            viewportWidth,
            viewportHeight
        );
        
        // Draw nest position
        if (this.game.entityManager.nest) {
            const nestX = (this.game.entityManager.nest.x / this.game.mapConfig.width) * this.minimapSize.width;
            const nestY = (this.game.entityManager.nest.y / this.game.mapConfig.height) * this.minimapSize.height;
            
            this.viewportIndicator.beginFill(0x8B4513); // Brown for nest
            this.viewportIndicator.drawCircle(
                this.minimapPosition.x + nestX,
                this.minimapPosition.y + nestY,
                4
            );
            this.viewportIndicator.endFill();
        }
        
        // Draw ants as small dots
        if (this.game.entityManager.entities.ants) {
            this.viewportIndicator.beginFill(0x00FF00); // Green for ants
            this.game.entityManager.entities.ants.forEach(ant => {
                const antX = (ant.x / this.game.mapConfig.width) * this.minimapSize.width;
                const antY = (ant.y / this.game.mapConfig.height) * this.minimapSize.height;
                this.viewportIndicator.drawCircle(
                    this.minimapPosition.x + antX,
                    this.minimapPosition.y + antY,
                    1
                );
            });
            this.viewportIndicator.endFill();
        }
        
        // Draw flying ants
        if (this.game.entityManager.entities.flyingAnts) {
            this.viewportIndicator.beginFill(0x00FFFF); // Cyan for flying ants
            this.game.entityManager.entities.flyingAnts.forEach(ant => {
                const antX = (ant.x / this.game.mapConfig.width) * this.minimapSize.width;
                const antY = (ant.y / this.game.mapConfig.height) * this.minimapSize.height;
                this.viewportIndicator.drawCircle(
                    this.minimapPosition.x + antX,
                    this.minimapPosition.y + antY,
                    1.5
                );
            });
            this.viewportIndicator.endFill();
        }
        
        // Draw car ants
        if (this.game.entityManager.entities.carAnts && this.game.entityManager.entities.carAnts.length > 0) {
            this.viewportIndicator.beginFill(0xFFFF00); // Yellow for car ants
            this.game.entityManager.entities.carAnts.forEach(ant => {
                const antX = (ant.x / this.game.mapConfig.width) * this.minimapSize.width;
                const antY = (ant.y / this.game.mapConfig.height) * this.minimapSize.height;
                this.viewportIndicator.drawCircle(
                    this.minimapPosition.x + antX,
                    this.minimapPosition.y + antY,
                    2
                );
            });
            this.viewportIndicator.endFill();
        }
        
        // Draw fire ants
        if (this.game.entityManager.entities.fireAnts) {
            this.viewportIndicator.beginFill(0xFF4500); // Orange-red for fire ants
            this.game.entityManager.entities.fireAnts.forEach(ant => {
                const antX = (ant.x / this.game.mapConfig.width) * this.minimapSize.width;
                const antY = (ant.y / this.game.mapConfig.height) * this.minimapSize.height;
                this.viewportIndicator.drawCircle(
                    this.minimapPosition.x + antX,
                    this.minimapPosition.y + antY,
                    1.5
                );
            });
            this.viewportIndicator.endFill();
        }
        
        // Draw food sources
        if (this.game.entityManager.entities.foods) {
            this.viewportIndicator.beginFill(0xFFA500); // Orange for food
            this.game.entityManager.entities.foods.forEach(food => {
                const foodX = (food.x / this.game.mapConfig.width) * this.minimapSize.width;
                const foodY = (food.y / this.game.mapConfig.height) * this.minimapSize.height;
                this.viewportIndicator.drawCircle(
                    this.minimapPosition.x + foodX,
                    this.minimapPosition.y + foodY,
                    1.5
                );
            });
            this.viewportIndicator.endFill();
        }
        
        // Draw enemies
        if (this.game.entityManager.entities.enemies) {
            this.viewportIndicator.beginFill(0xFF0000); // Red for enemies
            this.game.entityManager.entities.enemies.forEach(enemy => {
                const enemyX = (enemy.x / this.game.mapConfig.width) * this.minimapSize.width;
                const enemyY = (enemy.y / this.game.mapConfig.height) * this.minimapSize.height;
                this.viewportIndicator.drawCircle(
                    this.minimapPosition.x + enemyX,
                    this.minimapPosition.y + enemyY,
                    3
                );
            });
            this.viewportIndicator.endFill();
        }
    }

    /**
     * Show the minimap
     */
    show() {
        if (this.minimapContainer) {
            this.minimapContainer.visible = true;
        }
    }

    /**
     * Hide the minimap
     */
    hide() {
        if (this.minimapContainer) {
            this.minimapContainer.visible = false;
        }
    }

    /**
     * Toggle minimap visibility
     */
    toggle() {
        if (this.minimapContainer) {
            this.minimapContainer.visible = !this.minimapContainer.visible;
        }
    }

    /**
     * Resize minimap based on screen size
     */
    resize() {
        // Adjust minimap size for smaller screens
        if (this.game.app.screen.width < 800) {
            this.minimapSize.width = 150;
            this.minimapSize.height = 100;
        } else {
            this.minimapSize.width = 200;
            this.minimapSize.height = 150;
        }
        
        if (this.minimapBackground) {
            this.minimapBackground.clear();
            this.minimapBackground.beginFill(0x2D5016);
            this.minimapBackground.drawRect(0, 0, this.minimapSize.width, this.minimapSize.height);
            this.minimapBackground.endFill();
            this.minimapBackground.lineStyle(2, 0xFFFFFF, 0.8);
            this.minimapBackground.drawRect(0, 0, this.minimapSize.width, this.minimapSize.height);
        }
    }

    /**
     * Destroy the minimap
     */
    destroy() {
        if (this.minimapContainer) {
            this.minimapContainer.destroy({ children: true });
            this.minimapContainer = null;
        }
        this.minimapBackground = null;
        this.viewportIndicator = null;
    }
};



