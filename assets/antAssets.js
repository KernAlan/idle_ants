// assets/antAssets.js
(function() {
    // Get a reference to the AssetDefinition class
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;
    
    // Register ant asset
    AssetDefinition.register('ant', function(app) {
        const antGraphics = AssetDefinition.createGraphics();
        
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
        
        return antGraphics;
    });
})(); 