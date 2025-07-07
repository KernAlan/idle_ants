// assets/foodAssets.js
(function() {
    // Get a reference to the AssetDefinition class
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;
    
    // Register basic food asset
    AssetDefinition.register('food', function(app) {
        const foodGraphics = AssetDefinition.createGraphics();
        foodGraphics.beginFill(0xEAD2AC); // Light beige (base color)
        foodGraphics.drawCircle(0, 0, 5);
        foodGraphics.endFill();
        
        return foodGraphics;
    });
    
    // Register cookie food asset
    AssetDefinition.register('cookieFood', function(app) {
        const cookieGraphics = AssetDefinition.createGraphics();
        cookieGraphics.beginFill(0xC68E17); // Cookie brown
        cookieGraphics.drawCircle(0, 0, 7); // Slightly larger
        cookieGraphics.endFill();
        
        // Add chocolate chips
        cookieGraphics.beginFill(0x3D2817); // Dark brown
        cookieGraphics.drawCircle(-2, -1, 1.2);
        cookieGraphics.drawCircle(1, 2, 1.0);
        cookieGraphics.drawCircle(2, -2, 0.9);
        cookieGraphics.endFill();
        
        return cookieGraphics;
    });
    
    // Register watermelon food asset
    AssetDefinition.register('watermelonFood', function(app) {
        const watermelonGraphics = AssetDefinition.createGraphics();
        
        // Define colors with vibrant values
        const colors = {
            rindOuter: 0x008800,    // Dark green for outer rind
            rindMain: 0x00FF00,     // Bright green for main rind
            rindInner: 0xFFFFFF,    // White for inner rind
            flesh: 0xFF0000,        // Bright red for flesh
            seed: 0x000000          // Black for seeds
        };
        
        // Size parameters
        const size = 15;            // Overall size control (MUCH smaller)
        
        // Draw the watermelon using a completely different approach
        
        // Draw the base semi-circle (outer rind)
        watermelonGraphics.lineStyle(0);
        watermelonGraphics.beginFill(colors.rindOuter);
        watermelonGraphics.arc(0, 0, size, Math.PI, 0);
        watermelonGraphics.lineTo(0, 0);
        watermelonGraphics.closePath();
        watermelonGraphics.endFill();
        
        // Draw the inner rind (bright green)
        watermelonGraphics.beginFill(colors.rindMain);
        watermelonGraphics.arc(0, 0, size * 0.9, Math.PI, 0);
        watermelonGraphics.lineTo(0, 0);
        watermelonGraphics.closePath();
        watermelonGraphics.endFill();
        
        // Draw the white inner edge
        watermelonGraphics.beginFill(colors.rindInner);
        watermelonGraphics.arc(0, 0, size * 0.75, Math.PI, 0);
        watermelonGraphics.lineTo(0, 0);
        watermelonGraphics.closePath();
        watermelonGraphics.endFill();
        
        // Draw the red flesh
        watermelonGraphics.beginFill(colors.flesh);
        watermelonGraphics.arc(0, 0, size * 0.7, Math.PI, 0);
        watermelonGraphics.lineTo(0, 0);
        watermelonGraphics.closePath();
        watermelonGraphics.endFill();
        
        // Draw seeds directly on the flesh
        watermelonGraphics.beginFill(colors.seed);
        
        // Draw seeds at specific positions within the flesh area
        const seedPositions = [
            {x: 0, y: size * 0.35},
            {x: -size * 0.2, y: size * 0.25},
            {x: size * 0.2, y: size * 0.25},
            {x: -size * 0.35, y: size * 0.15},
            {x: size * 0.35, y: size * 0.15},
            {x: -size * 0.1, y: size * 0.45},
            {x: size * 0.1, y: size * 0.45}
        ];
        
        // Draw each seed
        seedPositions.forEach(pos => {
            // Rotate the coordinate system to match the semi-circle orientation
            const rotatedX = pos.x;
            const rotatedY = -pos.y; // Flip y to match the semi-circle orientation
            
            // Draw the seed
            watermelonGraphics.drawEllipse(rotatedX, rotatedY, size * 0.06, size * 0.09);
        });
        
        watermelonGraphics.endFill();
        
        return watermelonGraphics;
    });

    // Register apple food asset
    AssetDefinition.register('appleFood', function(app) {
        const g = AssetDefinition.createGraphics();
        // Apple slice – simple red ellipse with a white inner highlight
        g.beginFill(0xFF4500); // Apple red skin
        g.drawEllipse(0, 0, 6, 8);
        g.endFill();

        // Inner flesh
        g.beginFill(0xFFF5F5); // Off-white flesh
        g.drawEllipse(0, 0, 4, 6);
        g.endFill();

        // Small seed hint
        g.beginFill(0x4B3621);
        g.drawCircle(0, 1, 0.6);
        g.endFill();
        return g;
    });

    // Register marshmallow food asset
    AssetDefinition.register('marshmallowFood', function(app) {
        const g = AssetDefinition.createGraphics();
        g.beginFill(0xFFF8DC); // Marshmallow color
        g.drawRoundedRect(-4, -4, 8, 8, 2);
        g.endFill();
        return g;
    });

    // Register mango food asset
    AssetDefinition.register('mangoFood', function(app) {
        const g = AssetDefinition.createGraphics();
        g.beginFill(0xFF8C00); // Mango orange
        g.drawEllipse(0, 0, 7, 9);
        g.endFill();
        return g;
    });

    // Register hot dog food asset
    AssetDefinition.register('hot_dogFood', function(app) {
        const g = AssetDefinition.createGraphics();
        // Bun
        g.beginFill(0xD2B48C); // Tan bun
        g.drawRoundedRect(-7, -3, 14, 6, 3);
        g.endFill();
        // Sausage
        g.beginFill(0xB22222); // Reddish sausage
        g.drawRoundedRect(-6, -2, 12, 4, 2);
        g.endFill();
        return g;
    });

    // Register donut food asset
    AssetDefinition.register('donutFood', function(app) {
        const g = AssetDefinition.createGraphics();
        // Outer ring (glaze)
        g.beginFill(0xDDA0DD); // Plum glaze
        g.drawCircle(0, 0, 8);
        g.endFill();
        // Inner hole
        g.beginFill(0xFFFFFF);
        g.drawCircle(0, 0, 3);
        g.endFill();
        return g;
    });

    // Register cake food asset
    AssetDefinition.register('cakeFood', function(app) {
        const g = AssetDefinition.createGraphics();
        // Cake slice triangle
        g.beginFill(0xFFB6C1); // Pink frosting
        g.moveTo(-6, 6);
        g.lineTo(6, 6);
        g.lineTo(0, -6);
        g.closePath();
        g.endFill();
        // Icing layer
        g.beginFill(0xFFFFFF);
        g.drawRect(-6, 3, 12, 1);
        g.endFill();
        // Cherry on top
        g.beginFill(0xFF0000);
        g.drawCircle(0, -4, 1.2);
        g.endFill();
        return g;
    });
})(); 