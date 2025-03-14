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
        
        return groundGraphics;
    });
})(); 