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
    
    // Register apple food asset
    AssetDefinition.register('appleFood', function(app) {
        const appleGraphics = AssetDefinition.createGraphics();
        
        // Draw the apple slice shape
        appleGraphics.beginFill(0xFF4500); // Red apple color
        appleGraphics.drawEllipse(0, 0, 8, 10); // Slightly oval shape
        appleGraphics.endFill();
        
        // Add apple skin highlight
        appleGraphics.beginFill(0xFF6347); // Lighter red highlight
        appleGraphics.drawEllipse(-2, -2, 4, 3);
        appleGraphics.endFill();
        
        // Add apple seed
        appleGraphics.beginFill(0x8B4513); // Brown seed
        appleGraphics.drawEllipse(1, 1, 1, 2);
        appleGraphics.endFill();
        
        return appleGraphics;
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
    
    // Register marshmallow food asset
    AssetDefinition.register('marshmallowFood', function(app) {
        const marshmallowGraphics = AssetDefinition.createGraphics();
        
        // Draw main marshmallow body
        marshmallowGraphics.beginFill(0xFFF8DC); // Cornsilk white
        marshmallowGraphics.drawRoundedRect(-6, -4, 12, 8, 3);
        marshmallowGraphics.endFill();
        
        // Add marshmallow highlights
        marshmallowGraphics.beginFill(0xFFFFFF); // Pure white highlights
        marshmallowGraphics.drawRoundedRect(-4, -3, 3, 2, 1);
        marshmallowGraphics.drawRoundedRect(1, 1, 2, 1, 0.5);
        marshmallowGraphics.endFill();
        
        // Add subtle texture lines
        marshmallowGraphics.lineStyle(0.5, 0xF0E68C, 0.5);
        marshmallowGraphics.moveTo(-5, -1);
        marshmallowGraphics.lineTo(5, -1);
        marshmallowGraphics.moveTo(-5, 1);
        marshmallowGraphics.lineTo(5, 1);
        marshmallowGraphics.lineStyle(0);
        
        return marshmallowGraphics;
    });
    
    // Register mango food asset
    AssetDefinition.register('mangoFood', function(app) {
        const mangoGraphics = AssetDefinition.createGraphics();
        
        // Draw mango base shape
        mangoGraphics.beginFill(0xFF8C00); // Dark orange
        mangoGraphics.drawEllipse(0, 0, 9, 12); // Oval mango shape
        mangoGraphics.endFill();
        
        // Add mango gradient effect
        mangoGraphics.beginFill(0xFFD700); // Golden yellow
        mangoGraphics.drawEllipse(-2, -3, 6, 4);
        mangoGraphics.endFill();
        
        // Add mango highlights
        mangoGraphics.beginFill(0xFFA500); // Orange highlights
        mangoGraphics.drawEllipse(2, 2, 3, 4);
        mangoGraphics.endFill();
        
        // Add fibrous texture lines
        mangoGraphics.lineStyle(0.5, 0xFF7F00, 0.6);
        mangoGraphics.moveTo(-4, -2);
        mangoGraphics.lineTo(4, 3);
        mangoGraphics.moveTo(-3, 0);
        mangoGraphics.lineTo(3, 5);
        mangoGraphics.lineStyle(0);
        
        return mangoGraphics;
    });
    
    // Register hot dog food asset
    AssetDefinition.register('hotDogFood', function(app) {
        const hotDogGraphics = AssetDefinition.createGraphics();
        
        // Draw hot dog sausage
        hotDogGraphics.beginFill(0xDC143C); // Crimson red
        hotDogGraphics.drawRoundedRect(-8, -3, 16, 6, 3);
        hotDogGraphics.endFill();
        
        // Add hot dog highlights
        hotDogGraphics.beginFill(0xFF69B4); // Hot pink highlights
        hotDogGraphics.drawRoundedRect(-6, -2, 4, 2, 1);
        hotDogGraphics.drawRoundedRect(2, 0, 3, 1, 0.5);
        hotDogGraphics.endFill();
        
        // Add grill marks
        hotDogGraphics.lineStyle(1, 0x8B0000, 0.8);
        hotDogGraphics.moveTo(-6, -1);
        hotDogGraphics.lineTo(6, -1);
        hotDogGraphics.moveTo(-6, 1);
        hotDogGraphics.lineTo(6, 1);
        hotDogGraphics.lineStyle(0);
        
        // Add small bun pieces
        hotDogGraphics.beginFill(0xF4A460); // Sandy brown bun
        hotDogGraphics.drawRoundedRect(-9, -4, 3, 2, 1);
        hotDogGraphics.drawRoundedRect(6, 2, 3, 2, 1);
        hotDogGraphics.endFill();
        
        return hotDogGraphics;
    });
    
    // Register donut food asset
    AssetDefinition.register('donutFood', function(app) {
        const donutGraphics = AssetDefinition.createGraphics();
        
        // Draw donut base
        donutGraphics.beginFill(0xDDA0DD); // Plum color (glazed)
        donutGraphics.drawCircle(0, 0, 10);
        donutGraphics.endFill();
        
        // Cut out center hole
        donutGraphics.beginHole();
        donutGraphics.drawCircle(0, 0, 4);
        donutGraphics.endHole();
        
        // Add glaze highlights
        donutGraphics.beginFill(0xFFFFFF); // White glaze highlights
        donutGraphics.drawEllipse(-3, -6, 4, 2);
        donutGraphics.drawEllipse(2, -4, 2, 1);
        donutGraphics.endFill();
        
        // Add colorful sprinkles
        const sprinkleColors = [0xFF1493, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF4500];
        sprinkleColors.forEach((color, index) => {
            donutGraphics.beginFill(color);
            const angle = (index * Math.PI * 2) / sprinkleColors.length;
            const x = Math.cos(angle) * 6;
            const y = Math.sin(angle) * 6;
            donutGraphics.drawRect(x - 0.5, y - 2, 1, 4);
            donutGraphics.endFill();
        });
        
        return donutGraphics;
    });
    
    // Register cake food asset
    AssetDefinition.register('cakeFood', function(app) {
        const cakeGraphics = AssetDefinition.createGraphics();
        
        // Draw cake base layer
        cakeGraphics.beginFill(0xF5DEB3); // Wheat color cake base
        cakeGraphics.drawRoundedRect(-8, -2, 16, 8, 1);
        cakeGraphics.endFill();
        
        // Draw frosting layer
        cakeGraphics.beginFill(0xFFB6C1); // Light pink frosting
        cakeGraphics.drawRoundedRect(-8, -6, 16, 6, 2);
        cakeGraphics.endFill();
        
        // Add frosting swirls
        cakeGraphics.beginFill(0xFF69B4); // Hot pink swirls
        cakeGraphics.drawEllipse(-4, -4, 3, 2);
        cakeGraphics.drawEllipse(2, -5, 2, 1);
        cakeGraphics.drawEllipse(0, -3, 2, 1);
        cakeGraphics.endFill();
        
        // Add decorative elements
        cakeGraphics.beginFill(0xFFFFFF); // White decorations
        cakeGraphics.drawCircle(-5, -4, 1);
        cakeGraphics.drawCircle(4, -3, 1);
        cakeGraphics.drawCircle(-1, -5, 0.8);
        cakeGraphics.endFill();
        
        // Add cherry on top
        cakeGraphics.beginFill(0xFF0000); // Red cherry
        cakeGraphics.drawCircle(0, -7, 1.5);
        cakeGraphics.endFill();
        
        // Add cherry stem
        cakeGraphics.lineStyle(1, 0x228B22, 1);
        cakeGraphics.moveTo(0, -8);
        cakeGraphics.lineTo(0, -9);
        cakeGraphics.lineStyle(0);
        
        return cakeGraphics;
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
})(); 