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
        
        // Use repeat wrapping and linear filtering for smooth tiling
        groundTexture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        groundTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        
        // Ensure the texture is properly set up for tiling
        if (groundTexture.baseTexture.resource) {
            groundTexture.baseTexture.resource.style = {
                ...groundTexture.baseTexture.resource.style,
                imageRendering: 'pixelated'
            };
        }
        
        // Use provided width/height for the larger map, or fallback to screen size
        const mapWidth = width || this.app.screen.width;
        const mapHeight = height || this.app.screen.height;
        
        this.background = new PIXI.TilingSprite(
            groundTexture,
            mapWidth,
            mapHeight
        );
        
        // Use exact integer scaling and positioning to prevent seams
        this.background.tileScale.set(1, 1);
        this.background.roundPixels = true;
        this.background.anchor.set(0, 0);
        this.background.position.set(0, 0);
        
        // Force pixel-perfect rendering
        this.background.filters = [];
        this.background.alpha = 1.0;
        
        // Add to world container instead of directly to stage
        this.worldContainer.addChildAt(this.background, 0);
        
        // Create border. Interior grid disabled by default to avoid visible seams
        this.createMapBorder(mapWidth, mapHeight, false);
        
        // Only update the viewport size when the window is resized, not the map size
        window.addEventListener('resize', () => {
            // Don't need to adjust the background size anymore as it stays fixed to the map size
            // Only the camera position might need adjustment if viewport is larger than world
        });
    }
    
    createMapBorder(width, height, interiorGrid = true) {
        // Create a border around the map to indicate its edges
        const border = new PIXI.Graphics();
        border.lineStyle(5, 0x333333, 0.8);
        border.drawRect(0, 0, width, height);
        
        if(interiorGrid){
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
        }
        
        this.worldContainer.addChild(border);
    }
    
    // Main update method called from game loop
    update() {
        // Background typically doesn't need updates per frame
        // This method is here to satisfy the game loop requirements
        // Future features like animated backgrounds could be added here
    }
}; 