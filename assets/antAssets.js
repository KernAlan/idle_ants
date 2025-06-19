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

IdleAnts.Assets.Ants = {
    ANT: {
        id: 'ant',
        path: 'assets/textures/ant_spritesheet.png',
        isSpriteSheet: true,
        frames: 4, // Number of frames in the spritesheet
        frameWidth: 32, // Width of a single frame
        frameHeight: 32, // Height of a single frame
        animationSpeed: 0.15
    },
    FLYING_ANT: {
        id: 'flying_ant',
        path: 'assets/textures/flying_ant_spritesheet.png', // Placeholder - replace with actual path
        isSpriteSheet: true,
        frames: 4, // Example: 4 frames for flying animation
        frameWidth: 48, // Example width
        frameHeight: 48, // Example height
        animationSpeed: 0.2
    },
    QUEEN_ANT: {
        id: 'queen_ant',
        path: 'assets/textures/queen_ant.png', // Placeholder - replace with actual path
        scale: { x: 1.5, y: 1.5 },
        animationSpeed: 0.1 // Example, if animated
    },
    // Add new CarAnt placeholder texture
    CAR_ANT: {
        id: 'car_ant',
        type: 'graphic', // Signify that this asset is generated by a function
        generator: function(appInstance) {
            // This graphic will serve as the base texture for the CarAnt sprite.
            // CarAnt.js will add its detailed body and wheels as children to this base.
            const carChassisGraphics = IdleAnts.Assets.AssetDefinition.createGraphics();
            
            // A simple dark grey rectangle for the chassis.
            carChassisGraphics.beginFill(0x333333); // Dark grey color for chassis
            carChassisGraphics.drawRect(-15, -6, 30, 12); // Chassis dimensions (width: 30, height: 12)
            carChassisGraphics.endFill();
            
            // The AssetManager is expected to take this PIXI.Graphics object 
            // and generate a texture from it.
            return carChassisGraphics;
        },
        scale: { x: 1.0, y: 1.0 }, // Existing scale, CarAnt.js also handles its scale
        isSpriteSheet: false, // Correct, it's a single generated graphic
        frames: 1 // Correct
    }
};

// Function to generate ant egg texture if needed (example, might not be used if queen produces live ants)
IdleAnts.Assets.Ants.EGG = {
    id: 'ant_egg',
    type: 'graphic', // Special type to indicate procedurally generated graphic
    generator: (app) => {
        const eggGraphics = new PIXI.Graphics();
        eggGraphics.beginFill(0xFFFFE0); // Light yellow
        eggGraphics.drawEllipse(0, 0, 8, 12); // Egg shape
        eggGraphics.endFill();
        // You might want to render this to a texture once for performance if many eggs are shown
        // return app.renderer.generateTexture(eggGraphics); // AssetManager will handle texture generation
        return eggGraphics; // Return the PIXI.Graphics object directly
    }
}; 