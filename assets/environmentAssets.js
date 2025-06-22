// assets/environmentAssets.js
(function() {
    // Get a reference to the AssetDefinition class
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;
    
    // Register nest asset
    AssetDefinition.register('nest', function(app) {
        const nestGraphics = AssetDefinition.createGraphics();
        
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
        
        return nestGraphics;
    });
    
    // Register ground asset
    AssetDefinition.register('ground', function(app) {
        const groundGraphics = AssetDefinition.createGraphics();
        
        // Create a grass texture that tiles perfectly
        const tileSize = 64;
        
        // Base grass color
        groundGraphics.beginFill(0x4CAF50);
        groundGraphics.drawRect(0, 0, tileSize, tileSize);
        groundGraphics.endFill();
        
        // Add grass variation using a pattern that repeats perfectly
        // Use mathematical patterns instead of random placement
        groundGraphics.beginFill(0x388E3C, 0.3); // Darker green spots
        
        // Create a repeating pattern of grass blades
        for (let x = 2; x < tileSize; x += 6) {
            for (let y = 2; y < tileSize; y += 8) {
                // Stagger every other row for more natural look
                const offsetX = (y % 16 === 2) ? 3 : 0;
                const grassX = (x + offsetX) % tileSize;
                
                // Draw small grass blade
                groundGraphics.drawRect(grassX, y, 1, 3);
                groundGraphics.drawRect(grassX + 1, y + 1, 1, 2);
            }
        }
        groundGraphics.endFill();
        
        // Add lighter highlights
        groundGraphics.beginFill(0x81C784, 0.4);
        for (let x = 4; x < tileSize; x += 8) {
            for (let y = 4; y < tileSize; y += 10) {
                const offsetX = (y % 20 === 4) ? 4 : 0;
                const grassX = (x + offsetX) % tileSize;
                
                // Smaller highlight blades
                groundGraphics.drawRect(grassX, y, 1, 2);
            }
        }
        groundGraphics.endFill();
        
        // Add very subtle texture dots
        groundGraphics.beginFill(0xA5D6A7, 0.2);
        for (let x = 8; x < tileSize; x += 12) {
            for (let y = 6; y < tileSize; y += 14) {
                groundGraphics.drawCircle(x, y, 1);
            }
        }
        groundGraphics.endFill();
        
        return groundGraphics;
    });
})(); 