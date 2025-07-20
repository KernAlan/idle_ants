// assets/enemyAssets.js - ES6 Module
import AssetDefinition from './AssetDefinition.js';

// Register enemy assets
{
    // Register cricket enemy asset
    AssetDefinition.register('cricket_enemy', function(app) {
        const cricketGraphics = AssetDefinition.createGraphics();
        
        // Cricket body - elongated oval
        cricketGraphics.beginFill(0x228B22); // Forest green
        cricketGraphics.drawEllipse(0, 0, 12, 6);
        cricketGraphics.endFill();
        
        // Cricket highlights
        cricketGraphics.beginFill(0x32CD32); // Lime green
        cricketGraphics.drawEllipse(-2, -1, 8, 4);
        cricketGraphics.endFill();
        
        // Cricket head
        cricketGraphics.beginFill(0x228B22);
        cricketGraphics.drawCircle(-10, 0, 4);
        cricketGraphics.endFill();
        
        // Cricket antennae
        cricketGraphics.lineStyle(1, 0x006400);
        cricketGraphics.moveTo(-12, -2);
        cricketGraphics.lineTo(-16, -6);
        cricketGraphics.moveTo(-12, 2);
        cricketGraphics.lineTo(-16, 6);
        cricketGraphics.lineStyle(0);
        
        // Cricket legs
        cricketGraphics.lineStyle(1.5, 0x006400);
        cricketGraphics.moveTo(-4, 4);
        cricketGraphics.lineTo(-6, 8);
        cricketGraphics.moveTo(0, 4);
        cricketGraphics.lineTo(-2, 8);
        cricketGraphics.moveTo(4, 4);
        cricketGraphics.lineTo(2, 8);
        cricketGraphics.moveTo(-4, -4);
        cricketGraphics.lineTo(-6, -8);
        cricketGraphics.moveTo(0, -4);
        cricketGraphics.lineTo(-2, -8);
        cricketGraphics.moveTo(4, -4);
        cricketGraphics.lineTo(2, -8);
        cricketGraphics.lineStyle(0);
        
        return cricketGraphics;
    });
    
    // Register grasshopper enemy asset
    AssetDefinition.register('grasshopper_enemy', function(app) {
        const grasshopperGraphics = AssetDefinition.createGraphics();
        
        // Grasshopper body
        grasshopperGraphics.beginFill(0x90EE90); // Light green
        grasshopperGraphics.drawEllipse(0, 0, 10, 5);
        grasshopperGraphics.endFill();
        
        // Grasshopper head
        grasshopperGraphics.beginFill(0x90EE90);
        grasshopperGraphics.drawCircle(-8, 0, 3);
        grasshopperGraphics.endFill();
        
        // Powerful hind legs
        grasshopperGraphics.lineStyle(2, 0x228B22);
        grasshopperGraphics.moveTo(6, 3);
        grasshopperGraphics.lineTo(12, 8);
        grasshopperGraphics.moveTo(6, -3);
        grasshopperGraphics.lineTo(12, -8);
        grasshopperGraphics.lineStyle(0);
        
        return grasshopperGraphics;
    });
    
    // Register woolly bear enemy asset
    AssetDefinition.register('woolly_bear_enemy', function(app) {
        const woollyBearGraphics = AssetDefinition.createGraphics();
        
        // Woolly bear body segments
        const segmentColors = [0x8B4513, 0xFF4500, 0x8B4513]; // Brown, orange, brown pattern
        for (let i = 0; i < 3; i++) {
            woollyBearGraphics.beginFill(segmentColors[i]);
            woollyBearGraphics.drawCircle(-4 + i * 4, 0, 3);
            woollyBearGraphics.endFill();
        }
        
        // Fuzzy texture
        woollyBearGraphics.beginFill(0x654321, 0.5);
        for (let i = 0; i < 3; i++) {
            woollyBearGraphics.drawCircle(-4 + i * 4, 0, 4);
        }
        woollyBearGraphics.endFill();
        
        return woollyBearGraphics;
    });
    
    // Register mantis enemy asset
    AssetDefinition.register('mantis_enemy', function(app) {
        const mantisGraphics = AssetDefinition.createGraphics();
        
        // Mantis body
        mantisGraphics.beginFill(0x9ACD32); // Yellow green
        mantisGraphics.drawEllipse(0, 0, 8, 3);
        mantisGraphics.endFill();
        
        // Mantis head
        mantisGraphics.beginFill(0x9ACD32);
        mantisGraphics.drawCircle(-6, 0, 2.5);
        mantisGraphics.endFill();
        
        // Praying arms
        mantisGraphics.lineStyle(2, 0x6B8E23);
        mantisGraphics.moveTo(-8, -2);
        mantisGraphics.lineTo(-12, -4);
        mantisGraphics.moveTo(-8, 2);
        mantisGraphics.lineTo(-12, 4);
        mantisGraphics.lineStyle(0);
        
        return mantisGraphics;
    });
    
    // Register bee enemy asset
    AssetDefinition.register('bee_enemy', function(app) {
        const beeGraphics = AssetDefinition.createGraphics();
        
        // Bee body with stripes
        beeGraphics.beginFill(0xFFD700); // Gold
        beeGraphics.drawEllipse(0, 0, 8, 4);
        beeGraphics.endFill();
        
        // Black stripes
        beeGraphics.beginFill(0x000000);
        beeGraphics.drawRect(-2, -4, 1, 8);
        beeGraphics.drawRect(2, -4, 1, 8);
        beeGraphics.endFill();
        
        // Wings
        beeGraphics.beginFill(0x87CEEB, 0.6);
        beeGraphics.drawEllipse(-4, -6, 6, 3);
        beeGraphics.drawEllipse(4, -6, 6, 3);
        beeGraphics.endFill();
        
        return beeGraphics;
    });
    
    // Register hercules beetle enemy asset
    AssetDefinition.register('hercules_beetle_enemy', function(app) {
        const beetleGraphics = AssetDefinition.createGraphics();
        
        // Beetle body
        beetleGraphics.beginFill(0x8B4513); // Saddle brown
        beetleGraphics.drawEllipse(0, 0, 12, 8);
        beetleGraphics.endFill();
        
        // Beetle head with horn
        beetleGraphics.beginFill(0x8B4513);
        beetleGraphics.drawCircle(-10, 0, 5);
        beetleGraphics.endFill();
        
        // Horn
        beetleGraphics.lineStyle(3, 0x654321);
        beetleGraphics.moveTo(-15, 0);
        beetleGraphics.lineTo(-20, -4);
        beetleGraphics.lineStyle(0);
        
        return beetleGraphics;
    });
    
    // Register frog enemy asset
    AssetDefinition.register('frog_enemy', function(app) {
        const frogGraphics = AssetDefinition.createGraphics();
        
        // Frog body
        frogGraphics.beginFill(0x228B22); // Forest green
        frogGraphics.drawEllipse(0, 0, 15, 12);
        frogGraphics.endFill();
        
        // Frog head
        frogGraphics.beginFill(0x228B22);
        frogGraphics.drawCircle(-12, 0, 8);
        frogGraphics.endFill();
        
        // Eyes
        frogGraphics.beginFill(0xFFD700);
        frogGraphics.drawCircle(-16, -4, 3);
        frogGraphics.drawCircle(-16, 4, 3);
        frogGraphics.endFill();
        
        // Pupils
        frogGraphics.beginFill(0x000000);
        frogGraphics.drawCircle(-16, -4, 1);
        frogGraphics.drawCircle(-16, 4, 1);
        frogGraphics.endFill();
        
        return frogGraphics;
    });
}