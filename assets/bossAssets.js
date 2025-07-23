// assets/bossAssets.js
(function() {
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;

    // --- Carpenter Ant Queen Assets ---
    AssetDefinition.register('carpenter_ant_queen_body', () => {
        const g = AssetDefinition.createGraphics();
        // Main brown body with darker segments
        g.beginFill(0x8B4513); // SaddleBrown
        g.drawEllipse(0, 0, 30, 18);
        g.endFill();
        
        // Add darker stripes to make it look segmented
        g.beginFill(0x654321); // DarkBrown
        g.drawEllipse(-8, 0, 4, 16);
        g.drawEllipse(0, 0, 4, 16);
        g.drawEllipse(8, 0, 4, 16);
        g.endFill();
        
        // Add queen crown marking
        g.beginFill(0xDAA520); // GoldenRod
        g.drawCircle(0, -12, 3);
        g.endFill();
        
        return g;
    });

    AssetDefinition.register('carpenter_ant_queen_head', () => {
        const g = AssetDefinition.createGraphics();
        // Head
        g.beginFill(0xA0522D); // Sienna
        g.drawEllipse(0, 0, 16, 12);
        g.endFill();
        
        // Eyes
        g.beginFill(0x000000); // Black
        g.drawCircle(-6, -3, 2);
        g.drawCircle(6, -3, 2);
        g.endFill();
        
        // Mandibles
        g.beginFill(0x654321); // DarkBrown
        g.drawRect(-3, 8, 6, 4);
        g.endFill();
        
        // Antennae
        g.lineStyle(2, 0x654321);
        g.moveTo(-8, -8);
        g.lineTo(-12, -15);
        g.moveTo(8, -8);
        g.lineTo(12, -15);
        
        return g;
    });

    // --- Japanese Giant Hornet Assets ---
    AssetDefinition.register('giant_hornet_body', () => {
        const g = AssetDefinition.createGraphics();
        // Main yellow body with black stripes
        g.beginFill(0xFFD700); // Gold
        g.drawEllipse(0, 0, 25, 15);
        g.endFill();
        
        // Black stripes
        g.beginFill(0x000000); // Black
        g.drawRect(-20, -3, 40, 2);
        g.drawRect(-20, 3, 40, 2);
        g.drawRect(-20, 9, 40, 2);
        g.endFill();
        
        // Head section
        g.beginFill(0xFF8C00); // DarkOrange
        g.drawCircle(0, -20, 8);
        g.endFill();
        
        // Eyes
        g.beginFill(0x000000);
        g.drawCircle(-4, -22, 2);
        g.drawCircle(4, -22, 2);
        g.endFill();
        
        return g;
    });

    AssetDefinition.register('giant_hornet_wing', () => {
        const g = AssetDefinition.createGraphics();
        // Wing with veins
        g.beginFill(0xFFFFFF, 0.6); // Semi-transparent white
        g.drawEllipse(0, 0, 20, 8);
        g.endFill();
        
        // Wing veins
        g.lineStyle(1, 0x666666, 0.8);
        g.moveTo(-15, -4);
        g.lineTo(15, 4);
        g.moveTo(-15, 0);
        g.lineTo(15, 0);
        g.moveTo(-15, 4);
        g.lineTo(15, -4);
        
        return g;
    });

    AssetDefinition.register('giant_hornet_stinger', () => {
        const g = AssetDefinition.createGraphics();
        // Sharp black stinger
        g.beginFill(0x000000); // Black
        g.moveTo(0, -2);
        g.lineTo(12, 0);
        g.lineTo(0, 2);
        g.closePath();
        g.endFill();
        
        // Add some detail lines
        g.lineStyle(1, 0x333333);
        g.moveTo(2, -1);
        g.lineTo(10, 0);
        g.moveTo(2, 1);
        g.lineTo(10, 0);
        
        return g;
    });

})();