// src/managers/AssetManager.js
IdleAnts.Managers.AssetManager = class {
    constructor(app) {
        this.app = app;
        this.textures = {};
    }
    
    async loadAssets() {
        return new Promise((resolve) => {
            // Create ant texture - more detailed ant but without legs (they will be animated separately)
            const antGraphics = new PIXI.Graphics();
            
            // Ant body segments - dark brown with variations
            // Rear segment (abdomen)
            antGraphics.beginFill(0x3D2817);
            antGraphics.drawEllipse(0, 8, 7, 10);
            antGraphics.endFill();
            
            // Add texture detail to abdomen
            antGraphics.beginFill(0x2A1B10, 0.5);
            antGraphics.drawEllipse(0, 8, 5, 8);
            antGraphics.endFill();
            
            // Middle segment (thorax)
            antGraphics.beginFill(0x3D2817);
            antGraphics.drawEllipse(0, -2, 5, 7);
            antGraphics.endFill();
            
            // Ant head - darker
            antGraphics.beginFill(0x2A1B10);
            antGraphics.drawCircle(0, -14, 5);
            antGraphics.endFill();
            
            // Add eyes
            antGraphics.beginFill(0x000000);
            antGraphics.drawCircle(-2, -15, 1.2);
            antGraphics.drawCircle(2, -15, 1.2);
            antGraphics.endFill();
            
            // Highlight on eyes
            antGraphics.beginFill(0xFFFFFF, 0.6);
            antGraphics.drawCircle(-2.3, -15.3, 0.5);
            antGraphics.drawCircle(1.7, -15.3, 0.5);
            antGraphics.endFill();
            
            // Mandibles
            antGraphics.lineStyle(1, 0x2A1B10);
            antGraphics.moveTo(-3, -17);
            antGraphics.lineTo(-5, -19);
            antGraphics.moveTo(3, -17);
            antGraphics.lineTo(5, -19);
            
            // Antennae - more curved and natural
            antGraphics.lineStyle(1, 0x2A1B10);
            
            // Left antenna with curve
            antGraphics.moveTo(-2, -17);
            antGraphics.bezierCurveTo(
                -5, -22, // control point 1
                -8, -24, // control point 2
                -7, -26  // end point
            );
            
            // Right antenna with curve
            antGraphics.moveTo(2, -17);
            antGraphics.bezierCurveTo(
                5, -22, // control point 1
                8, -24, // control point 2
                7, -26  // end point
            );
            
            // Create food texture - more generic to support different food types
            const foodGraphics = new PIXI.Graphics();
            foodGraphics.beginFill(0xEAD2AC); // Light beige (base color)
            foodGraphics.drawCircle(0, 0, 5);
            foodGraphics.endFill();
            
            // Create cookie texture
            const cookieGraphics = new PIXI.Graphics();
            cookieGraphics.beginFill(0xC68E17); // Cookie brown
            cookieGraphics.drawCircle(0, 0, 7); // Slightly larger
            cookieGraphics.endFill();
            
            // Add chocolate chips
            cookieGraphics.beginFill(0x3D2817); // Dark brown
            cookieGraphics.drawCircle(-2, -1, 1.2);
            cookieGraphics.drawCircle(1, 2, 1.0);
            cookieGraphics.drawCircle(2, -2, 0.9);
            cookieGraphics.endFill();
            
            // Create nest texture - more detailed mound
            const nestGraphics = new PIXI.Graphics();
            // Main mound
            nestGraphics.beginFill(0x8B4513);
            nestGraphics.drawCircle(0, 0, 30);
            nestGraphics.endFill();
            
            // Entrance hole
            nestGraphics.beginFill(0x3D2817);
            nestGraphics.drawCircle(0, 0, 10);
            nestGraphics.endFill();
            
            // Add some texture to the mound with lighter spots
            nestGraphics.beginFill(0xA86032);
            nestGraphics.drawCircle(-15, -10, 8);
            nestGraphics.drawCircle(10, 15, 6);
            nestGraphics.drawCircle(15, -5, 5);
            nestGraphics.endFill();
            
            // Create ground texture - grass instead of dirt
            const groundGraphics = new PIXI.Graphics();
            
            // Draw a slightly larger rectangle to ensure coverage
            groundGraphics.beginFill(0x4CAF50); // Base grass green color
            // Add 1px padding to all sides to prevent edge artifacts
            groundGraphics.drawRect(-1, -1, 102, 102);
            groundGraphics.endFill();
            
            // Add some variation to make the grass look more natural
            groundGraphics.beginFill(0x388E3C, 0.4); // Darker green spots with transparency
            
            // Add shorter strokes of grass - using simple shapes instead of transforms
            for (let i = 0; i < 60; i++) {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const width = 1 + Math.random() * 2;
                const height = 3 + Math.random() * 5;
                
                groundGraphics.drawRect(x, y, width, height);
            }
            groundGraphics.endFill();
            
            // Add some lighter grass blades
            groundGraphics.beginFill(0x81C784, 0.6); // Lighter green highlights
            for (let i = 0; i < 40; i++) {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const width = 1 + Math.random() * 1.5;
                const height = 2 + Math.random() * 4;
                
                groundGraphics.drawRect(x, y, width, height);
            }
            groundGraphics.endFill();
            
            // Add some small highlights
            groundGraphics.beginFill(0xA5D6A7, 0.3); // Very light green for highlights
            for (let i = 0; i < 25; i++) {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                groundGraphics.drawCircle(x, y, 1 + Math.random() * 2);
            }
            groundGraphics.endFill();
            
            // Convert graphics to textures
            this.textures.ant = this.app.renderer.generateTexture(antGraphics);
            this.textures.food = this.app.renderer.generateTexture(foodGraphics);
            this.textures.cookieFood = this.app.renderer.generateTexture(cookieGraphics);
            this.textures.nest = this.app.renderer.generateTexture(nestGraphics);
            this.textures.ground = this.app.renderer.generateTexture(groundGraphics);
            
            resolve();
        });
    }
    
    getTexture(name) {
        return this.textures[name];
    }
} 