// assets/anteaterBossAsset.js - ES6 Module
import AssetDefinition from './AssetDefinition.js';

// Register anteater boss assets
{

    // --- PRIVATE HELPER FUNCTIONS to draw parts ---
    function drawBody(g, scale, colors) {
        // Main body - gray-brown base
        g.beginFill(colors.bodyBase);
        g.drawEllipse(0, 0, 50 * scale, 20 * scale);
        g.endFill();
        
        // Light underside
        g.beginFill(colors.bodyLight);
        g.drawEllipse(0, 5 * scale, 48 * scale, 12 * scale);
        g.endFill();
        
        // THE SIGNATURE BLACK DIAGONAL STRIPE - this is key!
        g.beginFill(colors.blackStripe);
        // Create the diagonal band across the body
        g.drawEllipse(-5 * scale, -8 * scale, 35 * scale, 16 * scale);
        g.endFill();
        
        // White/cream chest area
        g.beginFill(colors.whiteChest);
        g.drawEllipse(-20 * scale, -2 * scale, 25 * scale, 10 * scale);
        g.endFill();
    }

    function drawHeadAndSnout(g, scale, colors) {
        // Head - same gray-brown as body
        g.beginFill(colors.headColor);
        g.drawEllipse(-42 * scale, -1 * scale, 24 * scale, 14 * scale);
        g.endFill();
        
        g.beginFill(colors.headLight);
        g.drawEllipse(-42 * scale, -4 * scale, 22 * scale, 10 * scale);
        g.endFill();

        // Long thin snout - dark gray/black
        g.beginFill(colors.snoutDark);
        g.drawEllipse(-70 * scale, 0, 32 * scale, 3.5 * scale);
        g.endFill();
        
        g.beginFill(colors.snoutMedium);
        g.drawEllipse(-68 * scale, -0.5 * scale, 28 * scale, 2.5 * scale);
        g.endFill();

        // Nostril at tip
        g.beginFill(colors.nostrilColor);
        g.drawCircle(-84 * scale, 0, 0.8 * scale);
        g.endFill();
    }
    
    function drawFeatures(g, scale, colors) {
        // Small dark eye
        g.beginFill(colors.eyeColor);
        g.drawCircle(-36 * scale, -5 * scale, 1.5 * scale);
        g.endFill();
        
        g.beginFill(colors.eyeHighlight);
        g.drawCircle(-35.5 * scale, -5.5 * scale, 0.5 * scale);
        g.endFill();

        // Small rounded ears
        g.beginFill(colors.earColor);
        g.drawEllipse(-30 * scale, -10 * scale, 5 * scale, 7 * scale);
        g.endFill();
        
        g.beginFill(colors.earInner);
        g.drawEllipse(-30 * scale, -9 * scale, 3 * scale, 4 * scale);
        g.endFill();
    }

    function drawTail(g, scale, colors) {
        // Large bushy black tail
        g.beginFill(colors.tailDark);
        g.drawEllipse(45 * scale, 0, 35 * scale, 22 * scale);
        g.endFill();
        
        // Tail shading
        g.beginFill(colors.tailMedium);
        g.drawEllipse(45 * scale, -3 * scale, 32 * scale, 18 * scale);
        g.endFill();
        
        // Tail texture
        g.beginFill(colors.tailTexture);
        g.drawEllipse(50 * scale, -2 * scale, 25 * scale, 14 * scale);
        g.endFill();
    }
    
    function drawFrontLeg(g, scale, colors) {
        // WHITE/CREAM front legs like in the reference
        g.beginFill(colors.legWhite);
        g.drawEllipse(0, -2 * scale, 9 * scale, 18 * scale);
        g.endFill();
        
        // Slight shading
        g.beginFill(colors.legShading);
        g.drawEllipse(-2 * scale, -1 * scale, 5 * scale, 14 * scale);
        g.endFill();
        
        // Paw
        g.beginFill(colors.pawColor);
        g.drawEllipse(0, 10 * scale, 10 * scale, 6 * scale);
        g.endFill();
        
        // Large curved claws - dark
        g.beginFill(colors.clawDark);
        // Main digging claw
        g.drawEllipse(0, 14 * scale, 3 * scale, 16 * scale);
        // Side claws
        g.drawEllipse(-3 * scale, 13 * scale, 2.5 * scale, 12 * scale);
        g.drawEllipse(3 * scale, 13 * scale, 2.5 * scale, 10 * scale);
        g.drawEllipse(-5.5 * scale, 12 * scale, 2 * scale, 8 * scale);
        g.endFill();
    }

    function drawBackLeg(g, scale, colors) {
        // WHITE/CREAM back legs
        g.beginFill(colors.legWhite);
        g.drawEllipse(0, -1 * scale, 7 * scale, 14 * scale);
        g.endFill();
        
        g.beginFill(colors.legShading);
        g.drawEllipse(-1 * scale, 0, 4 * scale, 10 * scale);
        g.endFill();
        
        // Paw
        g.beginFill(colors.pawColor);
        g.drawEllipse(0, 8 * scale, 6 * scale, 5 * scale);
        g.endFill();
        
        // Normal claws
        g.beginFill(colors.clawDark);
        g.drawEllipse(-1.5 * scale, 10 * scale, 1.5 * scale, 6 * scale);
        g.drawEllipse(1 * scale, 10 * scale, 1.5 * scale, 5 * scale);
        g.drawEllipse(3 * scale, 9 * scale, 1.2 * scale, 4 * scale);
        g.endFill();
    }

    // Accurate Giant Anteater colors based on the reference sprite
    const colorPalette = {
        // Body colors - grayish brown with the signature pattern
        bodyBase: 0x8B7355,
        bodyLight: 0xD2C4A8,
        blackStripe: 0x2C2C2C,  // The distinctive black diagonal stripe
        whiteChest: 0xF5F5DC,   // Cream/white chest area
        
        // Head and snout
        headColor: 0x8B7355,
        headLight: 0xA68B5B,
        snoutDark: 0x404040,
        snoutMedium: 0x606060,
        
        // Features
        eyeColor: 0x000000,
        eyeHighlight: 0xFFFFFF,
        nostrilColor: 0x000000,
        
        // Ears
        earColor: 0x6B5B3D,
        earInner: 0x8B7355,
        
        // Tail - dark/black
        tailDark: 0x1A1A1A,
        tailMedium: 0x2F2F2F,
        tailTexture: 0x404040,
        
        // Legs - WHITE/CREAM like in reference
        legWhite: 0xF5F5DC,
        legShading: 0xE8E8E8,
        pawColor: 0xD0D0D0,
        
        // Claws - dark
        clawDark: 0x2C2C2C
    };
    
    // --- ASSET REGISTRATIONS ---

    // 1. The Body (main sprite)
    AssetDefinition.register('anteater_boss_body', function(app) {
        const g = AssetDefinition.createGraphics();
        const scale = 2.5;
        drawBody(g, scale, colorPalette);
        drawHeadAndSnout(g, scale, colorPalette);
        drawFeatures(g, scale, colorPalette);
        drawTail(g, scale, colorPalette);
        return g;
    });

    // 2. The Front Leg
    AssetDefinition.register('anteater_boss_leg_front', function(app) {
        const g = AssetDefinition.createGraphics();
        const scale = 2.5;
        drawFrontLeg(g, scale, colorPalette);
        return g;
    });

    // 3. The Back Leg
    AssetDefinition.register('anteater_boss_leg_back', function(app) {
        const g = AssetDefinition.createGraphics();
        const scale = 2.5;
        drawBackLeg(g, scale, colorPalette);
        return g;
    });
}