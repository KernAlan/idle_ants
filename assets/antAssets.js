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
    
    // Register queen ant asset
    AssetDefinition.register('queenAnt', function(app) {
        const queenGraphics = AssetDefinition.createGraphics();
        
        // Queen ant body segments - slightly darker and larger than regular ants
        // Rear segment (abdomen) - larger for the queen
        queenGraphics.beginFill(0x3D2817);
        queenGraphics.drawEllipse(0, 8, 9, 12); // Larger abdomen
        queenGraphics.endFill();
        
        // Add texture detail to abdomen
        queenGraphics.beginFill(0x2A1B10, 0.5);
        queenGraphics.drawEllipse(0, 8, 7, 10);
        queenGraphics.endFill();
        
        // Middle segment (thorax) - slightly larger
        queenGraphics.beginFill(0x3D2817);
        queenGraphics.drawEllipse(0, -2, 6, 8);
        queenGraphics.endFill();
        
        // Ant head - darker and slightly larger
        queenGraphics.beginFill(0x2A1B10);
        queenGraphics.drawCircle(0, -14, 6);
        queenGraphics.endFill();
        
        // Add eyes - slightly larger
        queenGraphics.beginFill(0x000000);
        queenGraphics.drawCircle(-2.5, -15, 1.5);
        queenGraphics.drawCircle(2.5, -15, 1.5);
        queenGraphics.endFill();
        
        // Highlight on eyes
        queenGraphics.beginFill(0xFFFFFF, 0.6);
        queenGraphics.drawCircle(-2.8, -15.3, 0.6);
        queenGraphics.drawCircle(2.2, -15.3, 0.6);
        queenGraphics.endFill();
        
        // Mandibles - slightly larger
        queenGraphics.lineStyle(1.2, 0x2A1B10);
        queenGraphics.moveTo(-3.5, -17);
        queenGraphics.lineTo(-6, -19);
        queenGraphics.moveTo(3.5, -17);
        queenGraphics.lineTo(6, -19);
        
        // Antennae - more curved and natural
        queenGraphics.lineStyle(1.2, 0x2A1B10);
        
        // Left antenna with curve
        queenGraphics.moveTo(-2.5, -17);
        queenGraphics.bezierCurveTo(
            -6, -22, // control point 1
            -9, -24, // control point 2
            -8, -26  // end point
        );
        
        // Right antenna with curve
        queenGraphics.moveTo(2.5, -17);
        queenGraphics.bezierCurveTo(
            6, -22, // control point 1
            9, -24, // control point 2
            8, -26  // end point
        );
        
        // Add crown
        queenGraphics.lineStyle(0);
        queenGraphics.beginFill(0xFFD700); // Gold color
        
        // Crown base
        queenGraphics.drawRect(-6, -22, 12, 3);
        
        // Crown points
        queenGraphics.moveTo(-6, -22);
        queenGraphics.lineTo(-4, -26);
        queenGraphics.lineTo(-2, -22);
        queenGraphics.lineTo(0, -26);
        queenGraphics.lineTo(2, -22);
        queenGraphics.lineTo(4, -26);
        queenGraphics.lineTo(6, -22);
        
        queenGraphics.endFill();
        
        // Add jewels to the crown
        queenGraphics.beginFill(0xFF0000); // Red jewel
        queenGraphics.drawCircle(-3, -23, 1);
        queenGraphics.endFill();
        
        queenGraphics.beginFill(0x0000FF); // Blue jewel
        queenGraphics.drawCircle(0, -23, 1);
        queenGraphics.endFill();
        
        queenGraphics.beginFill(0x00FF00); // Green jewel
        queenGraphics.drawCircle(3, -23, 1);
        queenGraphics.endFill();
        
        return queenGraphics;
    });
    
    // Register larvae asset for better visibility
    AssetDefinition.register('larvae', function(app) {
        const larvaeGraphics = AssetDefinition.createGraphics();
        
        // Create a bright glow background - reduced by 30%
        larvaeGraphics.beginFill(0xFFFF00, 0.4); // Bright yellow glow
        larvaeGraphics.drawCircle(0, 0, 10.5); // Reduced from 15
        larvaeGraphics.endFill();
        
        // Create the main larvae body - reduced by 30%
        larvaeGraphics.beginFill(0xFFFF00);
        larvaeGraphics.drawEllipse(0, 0, 5.6, 8.4); // Reduced from 8, 12
        larvaeGraphics.endFill();
        
        // Add segmentation to the larvae - reduced by 30%
        larvaeGraphics.lineStyle(1.4, 0xAA9900); // Reduced from 2
        larvaeGraphics.moveTo(-5.6, -4.2); // Reduced from -8, -6
        larvaeGraphics.lineTo(5.6, -4.2); // Reduced from 8, -6
        larvaeGraphics.moveTo(-5.6, 0); // Reduced from -8, 0
        larvaeGraphics.lineTo(5.6, 0); // Reduced from 8, 0
        larvaeGraphics.moveTo(-5.6, 4.2); // Reduced from -8, 6
        larvaeGraphics.lineTo(5.6, 4.2); // Reduced from 8, 6
        
        // Add a border - reduced by 30%
        larvaeGraphics.lineStyle(1.4, 0xAA9900); // Reduced from 2
        larvaeGraphics.drawEllipse(0, 0, 5.6, 8.4); // Reduced from 8, 12
        
        return larvaeGraphics;
    });
    
    // Register egg asset for larvae effect
    AssetDefinition.register('egg', function(app) {
        const eggGraphics = AssetDefinition.createGraphics();
        
        // Create a highlight behind the egg - reduced by 30%
        eggGraphics.beginFill(0xFFFFAA, 0.5);
        eggGraphics.drawCircle(0, 0, 8.4); // Reduced from 12
        eggGraphics.endFill();
        
        // Create the egg - reduced by 30%
        eggGraphics.beginFill(0xFFFFF0); // Off-white color
        eggGraphics.drawEllipse(0, 0, 7, 9.8); // Reduced from 10, 14
        eggGraphics.endFill();
        
        // Add a slight shadow - reduced by 30%
        eggGraphics.beginFill(0xEEEEDD, 0.3);
        eggGraphics.drawEllipse(0.7, 0.7, 6.3, 9.1); // Reduced from 1, 1, 9, 13
        eggGraphics.endFill();
        
        // Add a border - reduced thickness proportionally
        eggGraphics.lineStyle(1.4, 0xAA9900); // Reduced from 2
        eggGraphics.drawEllipse(0, 0, 7, 9.8); // Reduced from 10, 14
        
        return eggGraphics;
    });
})(); 