// assets/bossAssets.js
(function() {
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;

    // --- Tarantula Assets ---
    AssetDefinition.register('tarantula_body', () => {
        const g = AssetDefinition.createGraphics();
        
        // CEPHALOTHORAX (front section) - more defined shape
        g.beginFill(0x4A2C17); // Medium dark brown
        // Draw a more shield-like shape for cephalothorax
        g.moveTo(0, -20);      // Top point
        g.lineTo(-18, -10);    // Top left
        g.lineTo(-20, 5);      // Bottom left
        g.lineTo(0, 8);        // Bottom center
        g.lineTo(20, 5);       // Bottom right
        g.lineTo(18, -10);     // Top right
        g.lineTo(0, -20);      // Back to top
        g.endFill();
        
        // Cephalothorax outline
        g.lineStyle(2, 0x2C1810);
        g.moveTo(0, -20);
        g.lineTo(-18, -10);
        g.lineTo(-20, 5);
        g.lineTo(0, 8);
        g.lineTo(20, 5);
        g.lineTo(18, -10);
        g.lineTo(0, -20);
        g.lineStyle(0);
        
        // ABDOMEN (back section) - round but not a perfect circle
        g.beginFill(0x3E2117);
        g.drawEllipse(0, 20, 26, 22); // Slightly oval
        g.endFill();
        
        // Abdomen outline
        g.lineStyle(2, 0x2C1810);
        g.drawEllipse(0, 20, 26, 22);
        g.lineStyle(0);
        
        // PEDICEL (waist connection) - thin connection between sections
        g.beginFill(0x2C1810);
        g.drawRect(-3, 6, 6, 6);
        g.endFill();
        
        // MARKINGS - more geometric and spider-like
        // Central fovea (groove) on cephalothorax
        g.lineStyle(2, 0x2C1810);
        g.moveTo(0, -15);
        g.lineTo(0, 0);
        g.lineStyle(0);
        
        // Radial pattern on cephalothorax
        g.lineStyle(1, 0x654321, 0.8);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const innerR = 8;
            const outerR = 15;
            g.moveTo(Math.cos(angle) * innerR, -8 + Math.sin(angle) * innerR);
            g.lineTo(Math.cos(angle) * outerR, -8 + Math.sin(angle) * outerR);
        }
        g.lineStyle(0);
        
        // Chevron pattern on abdomen
        g.beginFill(0x8B4513);
        // Central chevron
        g.moveTo(0, 12);
        g.lineTo(-4, 18);
        g.lineTo(-2, 20);
        g.lineTo(0, 16);
        g.lineTo(2, 20);
        g.lineTo(4, 18);
        g.lineTo(0, 12);
        g.endFill();
        
        // Side patterns
        g.beginFill(0x654321);
        // Left side
        g.drawEllipse(-10, 16, 3, 8);
        g.drawEllipse(-8, 24, 2, 6);
        // Right side  
        g.drawEllipse(10, 16, 3, 8);
        g.drawEllipse(8, 24, 2, 6);
        g.endFill();
        
        return g;
    });

    AssetDefinition.register('tarantula_head', () => {
        const g = AssetDefinition.createGraphics();
        
        // FACE area - smaller, more focused on features
        g.beginFill(0x4A2C17);
        g.drawEllipse(0, 0, 16, 12);
        g.endFill();
        
        // Face outline
        g.lineStyle(1, 0x2C1810);
        g.drawEllipse(0, 0, 16, 12);
        g.lineStyle(0);
        
        // EYES - simplified but clear arrangement
        g.beginFill(0x000000);
        // Main front eyes (large)
        g.drawCircle(-5, -2, 2.5);
        g.drawCircle(5, -2, 2.5);
        // Secondary eyes (smaller)
        g.drawCircle(-7, -5, 1.5);
        g.drawCircle(7, -5, 1.5);
        g.drawCircle(-2, -5, 1);
        g.drawCircle(2, -5, 1);
        g.endFill();
        
        // Eye shine on main eyes
        g.beginFill(0xFFFFFF);
        g.drawCircle(-5, -3, 0.8);
        g.drawCircle(5, -3, 0.8);
        g.endFill();
        
        // CHELICERAE - simplified but menacing
        g.beginFill(0x2C1810);
        g.drawEllipse(-2, 6, 4, 6);
        g.drawEllipse(2, 6, 4, 6);
        g.endFill();
        
        // FANGS - simple but sharp
        g.beginFill(0x000000);
        g.moveTo(-2, 9);
        g.lineTo(-1, 12);
        g.lineTo(-3, 12);
        g.lineTo(-2, 9);
        g.moveTo(2, 9);
        g.lineTo(3, 12);
        g.lineTo(1, 12);
        g.lineTo(2, 9);
        g.endFill();
        
        return g;
    });

    // --- Japanese Giant Hornet Assets ---
    AssetDefinition.register('giant_hornet_body', () => {
        const g = AssetDefinition.createGraphics();
        
        // === GIANT HORNET BODY - COMPLETE REDESIGN ===
        
        // THORAX (middle section) - muscular and powerful
        g.beginFill(0xFF6600); // Bright orange-red
        // Draw more angular, aggressive thorax shape
        g.moveTo(0, -25);     // Top point
        g.lineTo(-20, -15);   // Top left
        g.lineTo(-22, -5);    // Mid left
        g.lineTo(-18, 5);     // Bottom left  
        g.lineTo(0, 8);       // Bottom center
        g.lineTo(18, 5);      // Bottom right
        g.lineTo(22, -5);     // Mid right
        g.lineTo(20, -15);    // Top right
        g.lineTo(0, -25);     // Back to top
        g.endFill();
        
        // Thorax definition lines
        g.lineStyle(2, 0xCC3300);
        g.moveTo(0, -25);
        g.lineTo(-20, -15);
        g.lineTo(-22, -5);
        g.lineTo(-18, 5);
        g.lineTo(0, 8);
        g.lineTo(18, 5);
        g.lineTo(22, -5);
        g.lineTo(20, -15);
        g.lineTo(0, -25);
        g.lineStyle(0);
        
        // Thorax muscle definition
        g.lineStyle(1, 0xCC3300, 0.8);
        g.moveTo(-15, -20);
        g.lineTo(0, -5);
        g.lineTo(15, -20);
        g.moveTo(-12, -10);
        g.lineTo(12, -10);
        g.lineStyle(0);
        
        // ABDOMEN - classic hornet shape with aggressive stripes
        g.beginFill(0xFFDD00); // Bright warning yellow
        g.drawEllipse(0, 25, 28, 32);
        g.endFill();
        
        // Abdomen outline
        g.lineStyle(3, 0xCC6600);
        g.drawEllipse(0, 25, 28, 32);
        g.lineStyle(0);
        
        // MENACING BLACK STRIPES - more dramatic
        g.beginFill(0x000000);
        // Top stripe
        g.drawEllipse(0, 12, 26, 5);
        // Main stripe
        g.drawEllipse(0, 20, 28, 6);
        // Mid stripe
        g.drawEllipse(0, 28, 26, 5);
        // Bottom stripe
        g.drawEllipse(0, 36, 22, 4);
        // Tip stripe
        g.drawEllipse(0, 42, 16, 3);
        g.endFill();
        
        // Add orange highlights on stripes for depth
        g.beginFill(0xFF4500, 0.6);
        g.drawEllipse(0, 10, 24, 2);
        g.drawEllipse(0, 18, 26, 2);
        g.drawEllipse(0, 26, 24, 2);
        g.drawEllipse(0, 34, 20, 2);
        g.endFill();
        
        // WASP WAIST - more defined
        g.beginFill(0xFF4500);
        g.drawEllipse(0, 6, 8, 6);
        g.endFill();
        
        // Waist definition
        g.lineStyle(2, 0x990000);
        g.drawEllipse(0, 6, 8, 6);
        g.lineStyle(0);
        
        // === HEAD SECTION ===
        // Large, intimidating head
        g.beginFill(0xFF3300); // Aggressive red
        g.drawEllipse(0, -35, 24, 18);
        g.endFill();
        
        // Head armor plating effect
        g.lineStyle(2, 0x990000);
        g.drawEllipse(0, -35, 24, 18);
        g.lineStyle(0);
        
        // Head segments/plates
        g.lineStyle(1, 0x990000, 0.7);
        g.moveTo(-20, -35);
        g.lineTo(20, -35);
        g.moveTo(-15, -40);
        g.lineTo(15, -40);
        g.lineStyle(0);
        
        // MASSIVE COMPOUND EYES - very intimidating
        g.beginFill(0x000000);
        g.drawEllipse(-12, -38, 8, 10); // Left eye - larger
        g.drawEllipse(12, -38, 8, 10);  // Right eye - larger
        g.endFill();
        
        // Eye hexagonal pattern (compound eye texture)
        g.beginFill(0x330000);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                g.drawCircle(-12 + i * 2 - 2, -40 + j * 3, 0.8);
                g.drawCircle(12 - i * 2 + 2, -40 + j * 3, 0.8);
            }
        }
        g.endFill();
        
        // Menacing eye shine
        g.beginFill(0xFF0000, 0.8); // Red glow
        g.drawEllipse(-12, -40, 4, 5);
        g.drawEllipse(12, -40, 4, 5);
        g.endFill();
        
        // Bright highlight spots
        g.beginFill(0xFFFFFF);
        g.drawCircle(-12, -42, 1.5);
        g.drawCircle(12, -42, 1.5);
        g.endFill();
        
        // ANTENNAE - more threatening
        g.lineStyle(4, 0x000000);
        // Left antenna
        g.moveTo(-8, -45);
        g.lineTo(-15, -52);
        g.lineTo(-18, -60);
        g.lineTo(-20, -68);
        // Right antenna  
        g.moveTo(8, -45);
        g.lineTo(15, -52);
        g.lineTo(18, -60);
        g.lineTo(20, -68);
        g.lineStyle(0);
        
        // Antenna joints - more prominent
        g.beginFill(0x333333);
        g.drawCircle(-15, -52, 2);
        g.drawCircle(-18, -60, 2);
        g.drawCircle(15, -52, 2);
        g.drawCircle(18, -60, 2);
        g.endFill();
        
        // MANDIBLES - much more menacing
        g.beginFill(0x000000);
        // Left mandible - larger and sharper
        g.moveTo(-8, -28);
        g.lineTo(-15, -22);
        g.lineTo(-12, -18);
        g.lineTo(-5, -25);
        g.closePath();
        // Right mandible - larger and sharper
        g.moveTo(8, -28);
        g.lineTo(15, -22);
        g.lineTo(12, -18);
        g.lineTo(5, -25);
        g.closePath();
        g.endFill();
        
        // Mandible highlights for sharpness
        g.lineStyle(1, 0x444444);
        g.moveTo(-8, -26);
        g.lineTo(-13, -20);
        g.moveTo(8, -26);
        g.lineTo(13, -20);
        g.lineStyle(0);
        
        return g;
    });

    AssetDefinition.register('giant_hornet_wing', () => {
        const g = AssetDefinition.createGraphics();
        
        // === PROFESSIONAL HORNET WING ===
        
        // Wing base/attachment point
        g.beginFill(0xFF6600);
        g.drawEllipse(0, 0, 4, 6);
        g.endFill();
        
        // Main wing membrane - more realistic shape
        g.beginFill(0xFFFFFF, 0.85); // More opaque for visibility
        // Professional wing shape
        g.moveTo(2, -2);      // Wing base top
        g.lineTo(35, -12);    // Top leading edge
        g.lineTo(40, -5);     // Wing tip upper
        g.lineTo(42, 0);      // Sharp wing tip
        g.lineTo(40, 5);      // Wing tip lower
        g.lineTo(35, 10);     // Bottom trailing edge
        g.lineTo(8, 8);       // Back to base bottom
        g.lineTo(2, 2);       // Wing base bottom
        g.closePath();
        g.endFill();
        
        // Wing outline - more prominent
        g.lineStyle(2, 0x666666, 0.9);
        g.moveTo(2, -2);
        g.lineTo(35, -12);
        g.lineTo(40, -5);
        g.lineTo(42, 0);
        g.lineTo(40, 5);
        g.lineTo(35, 10);
        g.lineTo(8, 8);
        g.lineTo(2, 2);
        g.closePath();
        g.lineStyle(0);
        
        // DETAILED WING VENATION - much more visible
        g.lineStyle(2, 0x333333, 0.8);
        
        // Main structural veins
        g.moveTo(2, -1);
        g.lineTo(38, -8); // Leading edge vein
        
        g.moveTo(2, 0);
        g.lineTo(35, -2); // Main support vein
        
        g.moveTo(2, 1);
        g.lineTo(32, 6);  // Trailing edge vein
        
        g.lineStyle(1.5, 0x444444, 0.7);
        
        // Secondary veins
        g.moveTo(10, -4);
        g.lineTo(30, -8);
        
        g.moveTo(10, -1);
        g.lineTo(28, -1);
        
        g.moveTo(10, 2);
        g.lineTo(25, 4);
        
        g.moveTo(10, 5);
        g.lineTo(20, 7);
        
        // Cross veins for wing cells
        g.lineStyle(1, 0x555555, 0.6);
        
        // Vertical cross veins
        g.moveTo(12, -6);
        g.lineTo(12, 6);
        g.moveTo(20, -7);
        g.lineTo(20, 5);
        g.moveTo(28, -6);
        g.lineTo(28, 3);
        g.moveTo(35, -4);
        g.lineTo(35, 2);
        
        // Diagonal connecting veins
        g.moveTo(12, -3);
        g.lineTo(20, -4);
        g.moveTo(20, -1);
        g.lineTo(28, -1);
        g.moveTo(12, 1);
        g.lineTo(20, 2);
        g.moveTo(20, 3);
        g.lineTo(28, 2);
        
        g.lineStyle(0);
        
        // Wing shimmer effect
        g.beginFill(0xFFFFFF, 0.3);
        g.drawEllipse(15, -2, 8, 4);
        g.drawEllipse(25, 1, 6, 3);
        g.endFill();
        
        return g;
    });

    AssetDefinition.register('giant_hornet_stinger', () => {
        const g = AssetDefinition.createGraphics();
        
        // === DEADLY GIANT HORNET STINGER ===
        
        // VENOM SAC BASE - much larger and more menacing
        g.beginFill(0xFF0000); // Bright red for danger
        g.drawEllipse(-6, 0, 12, 8);
        g.endFill();
        
        // Venom sac ridges/segments
        g.lineStyle(2, 0x990000);
        g.drawEllipse(-6, 0, 12, 8);
        g.moveTo(-10, -2);
        g.lineTo(2, -2);
        g.moveTo(-10, 0);
        g.lineTo(2, 0);
        g.moveTo(-10, 2);
        g.lineTo(2, 2);
        g.lineStyle(0);
        
        // STINGER SHAFT - longer and more deadly
        g.beginFill(0x000000);
        g.moveTo(0, -3);
        g.lineTo(25, -2);
        g.lineTo(30, 0); // Very sharp tip
        g.lineTo(25, 2);
        g.lineTo(0, 3);
        g.closePath();
        g.endFill();
        
        // Stinger shaft outline
        g.lineStyle(1, 0x333333);
        g.moveTo(0, -3);
        g.lineTo(25, -2);
        g.lineTo(30, 0);
        g.lineTo(25, 2);
        g.lineTo(0, 3);
        g.closePath();
        g.lineStyle(0);
        
        // MULTIPLE BARBS - extremely dangerous
        g.beginFill(0x000000);
        // First set of barbs
        g.moveTo(10, -2);
        g.lineTo(13, -4);
        g.lineTo(12, -2);
        g.closePath();
        g.moveTo(10, 2);
        g.lineTo(13, 4);
        g.lineTo(12, 2);
        g.closePath();
        
        // Second set of barbs
        g.moveTo(16, -2);
        g.lineTo(19, -3);
        g.lineTo(18, -2);
        g.closePath();
        g.moveTo(16, 2);
        g.lineTo(19, 3);
        g.lineTo(18, 2);
        g.closePath();
        
        // Third set of barbs
        g.moveTo(22, -1);
        g.lineTo(24, -2);
        g.lineTo(23, -1);
        g.closePath();
        g.moveTo(22, 1);
        g.lineTo(24, 2);
        g.lineTo(23, 1);
        g.closePath();
        g.endFill();
        
        // VENOM CHAMBERS - visible poison
        g.beginFill(0xFFFF00, 0.8); // Bright yellow venom
        g.drawCircle(-7, -2, 2.5);
        g.drawCircle(-7, 2, 2.5);
        g.drawCircle(-3, 0, 2);
        g.endFill();
        
        // Venom flow lines
        g.lineStyle(1, 0xFFFF00, 0.6);
        g.moveTo(-4, -1);
        g.lineTo(8, -1);
        g.moveTo(-4, 1);
        g.lineTo(8, 1);
        g.lineStyle(0);
        
        // RAZOR SHARP TIP
        g.beginFill(0xCCCCCC);
        g.drawCircle(30, 0, 1);
        g.endFill();
        
        // Tip highlight
        g.beginFill(0xFFFFFF);
        g.drawCircle(30, 0, 0.5);
        g.endFill();
        
        // Warning markings on venom sac
        g.beginFill(0x000000);
        g.drawCircle(-8, -3, 1);
        g.drawCircle(-4, -3, 1);
        g.drawCircle(-8, 3, 1);
        g.drawCircle(-4, 3, 1);
        g.endFill();
        
        return g;
    });

})();