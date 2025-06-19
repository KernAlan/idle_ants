// src/managers/BackgroundManager.js
IdleAnts.Managers.BackgroundManager = class {
    constructor(app, assetManager, worldContainer) {
        this.app = app;
        this.assetManager = assetManager;
        this.worldContainer = worldContainer;
    }
    
    createBackground(width, height) {
        // Create a tiled background with the ground texture
        const groundTexture = this.assetManager.getTexture('ground');
        
        // Use repeat wrapping and nearest-neighbour sampling so pixels line up exactly
        groundTexture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        groundTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        
        // Use provided width/height for the larger map, or fallback to screen size
        const mapWidth = width || this.app.screen.width;
        const mapHeight = height || this.app.screen.height;
        
        this.background = new PIXI.TilingSprite(
            groundTexture,
            mapWidth,
            mapHeight
        );
        
        // Exact 1:1 scale – NEAREST filtering + integer positioning avoids seams
        this.background.tileScale.set(1, 1);
        this.background.roundPixels = true;
        
        // Add to world container instead of directly to stage
        this.worldContainer.addChildAt(this.background, 0);
        
        // Create border to visually indicate map edges
        this.createMapBorder(mapWidth, mapHeight);
        
        // Only update the viewport size when the window is resized, not the map size
        window.addEventListener('resize', () => {
            // Don't need to adjust the background size anymore as it stays fixed to the map size
            // Only the camera position might need adjustment if viewport is larger than world
        });
    }
    
    createMapBorder(width, height) {
        // Create a border around the map to indicate its edges
        const border = new PIXI.Graphics();
        border.lineStyle(5, 0x333333, 0.8);
        border.drawRect(0, 0, width, height);
        
        // Add some grid lines to help with navigation and sense of space
        border.lineStyle(1, 0x333333, 0.3);
        
        // Add vertical grid lines every 500 pixels
        for (let x = 500; x < width; x += 500) {
            border.moveTo(x, 0);
            border.lineTo(x, height);
        }
        
        // Add horizontal grid lines every 500 pixels
        for (let y = 500; y < height; y += 500) {
            border.moveTo(0, y);
            border.lineTo(width, y);
        }
        
        this.worldContainer.addChild(border);
    }
}; 