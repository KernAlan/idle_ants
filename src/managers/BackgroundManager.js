// src/managers/BackgroundManager.js
IdleAnts.Managers.BackgroundManager = class {
    constructor(app, assetManager) {
        this.app = app;
        this.assetManager = assetManager;
    }
    
    createBackground() {
        // Create a tiled background with the ground texture
        const groundTexture = this.assetManager.getTexture('ground');
        
        // Ensure the texture has CLAMP wrapping to prevent artifacts at edges
        groundTexture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        
        this.background = new PIXI.TilingSprite(
            groundTexture,
            this.app.screen.width,
            this.app.screen.height
        );
        
        // Adjust tileScale to slightly overlap tiles and prevent green lines
        // A small increase ensures no gaps between tiles
        this.background.tileScale.set(1.01, 1.01);
        
        this.app.stage.addChildAt(this.background, 0);
        
        // Update the size when the window is resized
        window.addEventListener('resize', () => {
            this.background.width = this.app.screen.width;
            this.background.height = this.app.screen.height;
        });
    }
}; 