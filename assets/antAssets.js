// assets/antAssets.js
(function() {
    // Get a reference to the AssetDefinition class
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;
    
    // Register ant asset
    AssetDefinition.register('ant', function(app) {
        const antGraphics = AssetDefinition.createGraphics();
        
        // Create angled perspective ant (3/4 view) to match nest perspective
        
        // Rear segment (abdomen) - angled ellipse showing depth
        antGraphics.beginFill(0x2A1B10); // Dark brown base
        antGraphics.drawEllipse(0, 8, 7, 10); // Main abdomen shape
        antGraphics.endFill();
        
        // Abdomen highlight - shows the "top" surface at an angle
        antGraphics.beginFill(0x3D2817);
        antGraphics.drawEllipse(-1, 6, 6, 8); // Offset to show angled top
        antGraphics.endFill();
        
        // Abdomen bright highlight - the most visible "top" surface
        antGraphics.beginFill(0x5D4037);
        antGraphics.drawEllipse(-2, 5, 4, 6); // Further offset for depth
        antGraphics.endFill();
        
        // Middle segment (thorax) - angled perspective
        antGraphics.beginFill(0x2A1B10);
        antGraphics.drawEllipse(0, -2, 5, 7); // Base thorax
        antGraphics.endFill();
        
        // Thorax top surface
        antGraphics.beginFill(0x3D2817);
        antGraphics.drawEllipse(-1, -3, 4, 5); // Angled top
        antGraphics.endFill();
        
        // Thorax highlight
        antGraphics.beginFill(0x5D4037);
        antGraphics.drawEllipse(-1.5, -4, 3, 3); // Top highlight
        antGraphics.endFill();
        
        // Head - angled circular perspective (more oval when viewed at angle)
        antGraphics.beginFill(0x2A1B10);
        antGraphics.drawEllipse(0, -14, 5, 6); // Base head - elliptical due to angle
        antGraphics.endFill();
        
        // Head top surface
        antGraphics.beginFill(0x3D2817);
        antGraphics.drawEllipse(-1, -15, 4, 5); // Angled top surface
        antGraphics.endFill();
        
        // Head highlight
        antGraphics.beginFill(0x5D4037);
        antGraphics.drawEllipse(-1.5, -15.5, 3, 3); // Top highlight
        antGraphics.endFill();
        
        // Eyes - positioned for angled view (more visible on the "front" side)
        antGraphics.beginFill(0x000000);
        antGraphics.drawEllipse(-2.5, -15, 1.2, 1.5); // Left eye - more elliptical
        antGraphics.drawEllipse(1.5, -14.5, 1.2, 1.5); // Right eye - slightly different position
        antGraphics.endFill();
        
        // Eye highlights - angled perspective
        antGraphics.beginFill(0xFFFFFF, 0.8);
        antGraphics.drawEllipse(-2.7, -15.2, 0.5, 0.7); // Left eye highlight
        antGraphics.drawEllipse(1.3, -14.7, 0.5, 0.7); // Right eye highlight
        antGraphics.endFill();
        
        // Mandibles - angled outward from perspective
        antGraphics.lineStyle(1.2, 0x2A1B10);
        antGraphics.moveTo(-3, -17); // Left mandible
        antGraphics.lineTo(-5.5, -19.5);
        antGraphics.moveTo(2.5, -16.5); // Right mandible - different angle
        antGraphics.lineTo(5, -19);
        
        // Antennae - curved with angled perspective
        antGraphics.lineStyle(1, 0x2A1B10);
        
        // Left antenna - more visible from this angle
        antGraphics.moveTo(-2.5, -17);
        antGraphics.bezierCurveTo(-5.5, -21, -7.5, -23, -6.5, -25);
        
        // Right antenna - partially visible from angle
        antGraphics.moveTo(2, -16.5);
        antGraphics.bezierCurveTo(4.5, -20, 6.5, -22, 6, -24);
        
        // Antenna tips
        antGraphics.lineStyle(0);
        antGraphics.beginFill(0x3D2817);
        antGraphics.drawCircle(-6.5, -25, 1);
        antGraphics.drawCircle(6, -24, 1);
        antGraphics.endFill();
        
        // Legs - positioned for angled perspective (some more visible than others)
        antGraphics.lineStyle(1.5, 0x2A1B10);
        
        // Left side legs (more visible from this angle)
        antGraphics.moveTo(-4, -8); // Front leg
        antGraphics.lineTo(-8, -6);
        antGraphics.moveTo(-4, -2); // Middle leg
        antGraphics.lineTo(-8, 0);
        antGraphics.moveTo(-4, 4); // Rear leg
        antGraphics.lineTo(-8, 6);
        
        // Right side legs (partially visible from angle)
        antGraphics.moveTo(3, -7); // Front leg
        antGraphics.lineTo(6, -5);
        antGraphics.moveTo(3, -1); // Middle leg
        antGraphics.lineTo(6, 1);
        antGraphics.moveTo(3, 5); // Rear leg
        antGraphics.lineTo(6, 7);
        
        return antGraphics;
    });
    
    // Register queen ant asset
    AssetDefinition.register('queenAnt', function(app) {
                  const queenGraphics = AssetDefinition.createGraphics();
          
          // Create queen ant - bird's eye view, larger than regular ant
          
          // Rear segment (abdomen) - larger for queen
          queenGraphics.beginFill(0x2A1B10); // Dark brown base
          queenGraphics.drawCircle(0, 8, 10); // Larger abdomen
          queenGraphics.endFill();
          
          // Abdomen highlight
          queenGraphics.beginFill(0x3D2817);
          queenGraphics.drawCircle(0, 8, 8); // Inner highlight
          queenGraphics.endFill();
          
          // Royal pattern on abdomen
          queenGraphics.beginFill(0x8D6E63);
          queenGraphics.drawCircle(0, 8, 5); // Royal marking
          queenGraphics.endFill();
          
          // Middle segment (thorax) - larger
          queenGraphics.beginFill(0x2A1B10);
          queenGraphics.drawCircle(0, -2, 6); // Base thorax
          queenGraphics.endFill();
          
          // Thorax highlight
          queenGraphics.beginFill(0x3D2817);
          queenGraphics.drawCircle(0, -2, 4); // Inner highlight
          queenGraphics.endFill();
          
          // Head - larger for queen
          queenGraphics.beginFill(0x2A1B10);
          queenGraphics.drawCircle(0, -14, 7); // Base head
          queenGraphics.endFill();
          
          // Head highlight
          queenGraphics.beginFill(0x3D2817);
          queenGraphics.drawCircle(0, -14, 5); // Inner highlight
          queenGraphics.endFill();
          
          // Eyes - larger for queen
          queenGraphics.beginFill(0x000000);
          queenGraphics.drawCircle(-3, -14, 2); // Left eye
          queenGraphics.drawCircle(3, -14, 2); // Right eye
          queenGraphics.endFill();
          
          // Eye highlights
          queenGraphics.beginFill(0xFFFFFF, 0.8);
          queenGraphics.drawCircle(-3.5, -14.5, 0.8); // Left eye highlight
          queenGraphics.drawCircle(2.5, -14.5, 0.8); // Right eye highlight
          queenGraphics.endFill();
          
          // Mandibles - larger for queen
          queenGraphics.lineStyle(2, 0x2A1B10);
          queenGraphics.moveTo(-4, -18); // Left mandible
          queenGraphics.lineTo(-7, -21);
          queenGraphics.moveTo(4, -18); // Right mandible
          queenGraphics.lineTo(7, -21);
          
          // Antennae - longer for queen
          queenGraphics.lineStyle(1.5, 0x2A1B10);
          
          // Left antenna
          queenGraphics.moveTo(-3, -18);
          queenGraphics.bezierCurveTo(-7, -23, -9, -26, -8, -28);
          
          // Right antenna
          queenGraphics.moveTo(3, -18);
          queenGraphics.bezierCurveTo(7, -23, 9, -26, 8, -28);
          
          // Antenna tips - larger for queen
          queenGraphics.lineStyle(0);
          queenGraphics.beginFill(0x3D2817);
          queenGraphics.drawCircle(-8, -28, 1.5);
          queenGraphics.drawCircle(8, -28, 1.5);
          queenGraphics.endFill();
          
          // Crown - positioned for top-down view
          queenGraphics.beginFill(0xFFD700); // Gold color
          
          // Crown base - circular for top-down view
          queenGraphics.drawCircle(0, -22, 6); // Crown base
          queenGraphics.endFill();
          
          // Crown highlight
          queenGraphics.beginFill(0xFFE55C);
          queenGraphics.drawCircle(0, -22, 4); // Crown highlight
          queenGraphics.endFill();
          
          // Crown points - arranged in circle for top-down view
          queenGraphics.beginFill(0xFFD700);
          for(let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 7;
            const y = Math.sin(angle) * 7 - 22;
            queenGraphics.drawCircle(x, y, 1.5);
          }
          queenGraphics.endFill();
          
          // Jewels - arranged in center for top-down view
          // Red jewel (center)
          queenGraphics.beginFill(0xFF0000);
          queenGraphics.drawCircle(0, -22, 1.5);
          queenGraphics.endFill();
          queenGraphics.beginFill(0xFF6B6B);
          queenGraphics.drawCircle(0, -22, 0.8); // Highlight
          queenGraphics.endFill();
          
          // Blue jewels (sides)
          queenGraphics.beginFill(0x0000FF);
          queenGraphics.drawCircle(-2.5, -22, 1);
          queenGraphics.drawCircle(2.5, -22, 1);
          queenGraphics.endFill();
          
          // Green jewels (top/bottom)
          queenGraphics.beginFill(0x00FF00);
          queenGraphics.drawCircle(0, -24.5, 1);
          queenGraphics.drawCircle(0, -19.5, 1);
          queenGraphics.endFill();
          
          // Legs - symmetrical for bird's eye view, slightly longer for queen
          queenGraphics.lineStyle(2, 0x2A1B10);
          
          // Left side legs
          queenGraphics.moveTo(-6, -8); // Front leg
          queenGraphics.lineTo(-10, -10);
          queenGraphics.moveTo(-6, -2); // Middle leg
          queenGraphics.lineTo(-10, -2);
          queenGraphics.moveTo(-6, 4); // Rear leg
          queenGraphics.lineTo(-10, 6);
          
          // Right side legs
          queenGraphics.moveTo(6, -8); // Front leg
          queenGraphics.lineTo(10, -10);
          queenGraphics.moveTo(6, -2); // Middle leg
          queenGraphics.lineTo(10, -2);
          queenGraphics.moveTo(6, 4); // Rear leg
          queenGraphics.lineTo(10, 6);
        
        // Mandibles with depth - larger for queen
        queenGraphics.lineStyle(1.8, 0x1A0F0A);
        // Left mandible with shadow
        queenGraphics.moveTo(-4, -18);
        queenGraphics.lineTo(-7, -21);
        queenGraphics.lineStyle(1.5, 0x2A1B10);
        queenGraphics.moveTo(-3.7, -17.7);
        queenGraphics.lineTo(-6.7, -20.7);
        
        // Right mandible with shadow
        queenGraphics.lineStyle(1.8, 0x1A0F0A);
        queenGraphics.moveTo(4, -18);
        queenGraphics.lineTo(7, -21);
        queenGraphics.lineStyle(1.5, 0x2A1B10);
        queenGraphics.moveTo(3.7, -17.7);
        queenGraphics.lineTo(6.7, -20.7);
        
        // Antennae with 3D effect - longer for queen
        queenGraphics.lineStyle(1.8, 0x1A0F0A); // Shadow line
        
        // Left antenna shadow
        queenGraphics.moveTo(-2.7, -18);
        queenGraphics.bezierCurveTo(-6.5, -23, -9.5, -25, -8.5, -27);
        
        // Right antenna shadow  
        queenGraphics.moveTo(2.7, -18);
        queenGraphics.bezierCurveTo(6.5, -23, 9.5, -25, 8.5, -27);
        
        // Antenna highlights
        queenGraphics.lineStyle(1.5, 0x2A1B10);
        
        // Left antenna
        queenGraphics.moveTo(-2.5, -17.5);
        queenGraphics.bezierCurveTo(-6, -22.5, -9, -24.5, -8, -26.5);
        
        // Right antenna
        queenGraphics.moveTo(2.5, -17.5);
        queenGraphics.bezierCurveTo(6, -22.5, 9, -24.5, 8, -26.5);
        
        // Antenna tips (clubs) - larger for queen
        queenGraphics.lineStyle(0);
        queenGraphics.beginFill(0x2A1B10);
        queenGraphics.drawCircle(-8, -26.5, 1.5);
        queenGraphics.drawCircle(8, -26.5, 1.5);
        queenGraphics.endFill();
        
        // Antenna tip highlights
        queenGraphics.beginFill(0x3D2817);
        queenGraphics.drawCircle(-8.3, -26.8, 1);
        queenGraphics.drawCircle(7.7, -26.8, 1);
        queenGraphics.endFill();
        
        // Crown with 3D depth effect
        queenGraphics.lineStyle(0);
        
        // Crown shadow
        queenGraphics.beginFill(0xB8860B, 0.6); // Dark gold shadow
        queenGraphics.drawRect(-6.5, -21.5, 13, 3.5);
        queenGraphics.endFill();
        
        // Crown base with gradient effect
        queenGraphics.beginFill(0xFFD700); // Gold color
        queenGraphics.drawRect(-6, -22, 12, 3);
        queenGraphics.endFill();
        
        // Crown highlight
        queenGraphics.beginFill(0xFFE55C);
        queenGraphics.drawRect(-6, -22, 12, 1.5);
        queenGraphics.endFill();
        
        // Crown points with 3D effect
        // Shadow points
        queenGraphics.beginFill(0xB8860B);
        queenGraphics.moveTo(-6.5, -21.5);
        queenGraphics.lineTo(-4.5, -26.5);
        queenGraphics.lineTo(-2.5, -21.5);
        queenGraphics.lineTo(-0.5, -26.5);
        queenGraphics.lineTo(1.5, -21.5);
        queenGraphics.lineTo(3.5, -26.5);
        queenGraphics.lineTo(5.5, -21.5);
        queenGraphics.endFill();
        
        // Main crown points
        queenGraphics.beginFill(0xFFD700);
        queenGraphics.moveTo(-6, -22);
        queenGraphics.lineTo(-4, -26);
        queenGraphics.lineTo(-2, -22);
        queenGraphics.lineTo(0, -26);
        queenGraphics.lineTo(2, -22);
        queenGraphics.lineTo(4, -26);
        queenGraphics.lineTo(6, -22);
        queenGraphics.endFill();
        
        // Crown point highlights
        queenGraphics.beginFill(0xFFE55C);
        queenGraphics.moveTo(-6, -22);
        queenGraphics.lineTo(-4.5, -24);
        queenGraphics.lineTo(-3, -22);
        queenGraphics.moveTo(-1, -22);
        queenGraphics.lineTo(-0.5, -24);
        queenGraphics.lineTo(1, -22);
        queenGraphics.moveTo(3, -22);
        queenGraphics.lineTo(3.5, -24);
        queenGraphics.lineTo(5, -22);
        queenGraphics.endFill();
        
        // Jewels with 3D effect and shadows
        // Red jewel shadow
        queenGraphics.beginFill(0x8B0000, 0.6);
        queenGraphics.drawCircle(-2.7, -22.7, 1.2);
        queenGraphics.endFill();
        // Red jewel
        queenGraphics.beginFill(0xFF0000);
        queenGraphics.drawCircle(-3, -23, 1);
        queenGraphics.endFill();
        // Red jewel highlight
        queenGraphics.beginFill(0xFF6B6B);
        queenGraphics.drawCircle(-3.3, -23.3, 0.4);
        queenGraphics.endFill();
        
        // Blue jewel shadow
        queenGraphics.beginFill(0x000080, 0.6);
        queenGraphics.drawCircle(0.3, -22.7, 1.2);
        queenGraphics.endFill();
        // Blue jewel
        queenGraphics.beginFill(0x0000FF);
        queenGraphics.drawCircle(0, -23, 1);
        queenGraphics.endFill();
        // Blue jewel highlight
        queenGraphics.beginFill(0x6B6BFF);
        queenGraphics.drawCircle(-0.3, -23.3, 0.4);
        queenGraphics.endFill();
        
        // Green jewel shadow
        queenGraphics.beginFill(0x006400, 0.6);
        queenGraphics.drawCircle(3.3, -22.7, 1.2);
        queenGraphics.endFill();
        // Green jewel
        queenGraphics.beginFill(0x00FF00);
        queenGraphics.drawCircle(3, -23, 1);
        queenGraphics.endFill();
        // Green jewel highlight
        queenGraphics.beginFill(0x6BFF6B);
        queenGraphics.drawCircle(2.7, -23.3, 0.4);
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
        generator: function(app, assetManager) {
            const registeredGenerators = assetManager.assetDefinitions || {};
            if (registeredGenerators.ant) {
                return registeredGenerators.ant(app);
            }
            // Fallback if registration failed
            return IdleAnts.Assets.AssetDefinition.createGraphics();
        },
        animationSpeed: 0.15
    },
    FLYING_ANT: {
        id: 'flying_ant',
        generator: function(app, assetManager) {
            const registeredGenerators = assetManager.assetDefinitions || {};
            if (registeredGenerators.flying_ant) {
                return registeredGenerators.flying_ant(app);
            }
            return IdleAnts.Assets.AssetDefinition.createGraphics();
        },
        animationSpeed: 0.2
    },
    QUEEN_ANT: {
        id: 'queen_ant',
        generator: function(app, assetManager) {
            const registeredGenerators = assetManager.assetDefinitions || {};
            if (registeredGenerators.queen_ant) {
                return registeredGenerators.queen_ant(app);
            }
            return IdleAnts.Assets.AssetDefinition.createGraphics();
        },
        scale: { x: 1.5, y: 1.5 },
        animationSpeed: 0.1
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