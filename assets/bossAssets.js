// assets/bossAssets.js
(function() {
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;

    // --- Tarantula Assets ---
    // Tarantula: a heavy, hairy mygalomorph seen from above. The old sprite was
    // a flat brown polygon; this one is built from shaded volumes with a dense
    // bristle coat, which is the defining texture of the animal.
    AssetDefinition.register('tarantula_body', () => {
        const g = AssetDefinition.createGraphics();
        const A = IdleAnts.Art;

        const CARAPACE = 0x6B4423;
        const ABDOMEN = 0x4A2C17;
        const HAIR = 0x8A5A2E;
        const HAIR_TIP = 0xC98F4A;

        // ABDOMEN (opisthosoma) - the big hairy rear, drawn first so the
        // cephalothorax overlaps it at the waist.
        A.fuzz(g, { x: 0, y: 20, rx: 26, ry: 23, color: HAIR, count: 120, length: 5.5, width: 1.5, alpha: 0.8, sweep: 0.9, seed: 11 });
        A.fuzz(g, { x: 0, y: 20, rx: 24, ry: 21, color: HAIR_TIP, count: 70, length: 7.5, width: 1, alpha: 0.42, sweep: 1.1, seed: 12 });
        A.volume(g, { x: 0, y: 20, rx: 26, ry: 22, color: ABDOMEN, outlineWidth: 2, rimAlpha: 0.4 });

        // Urticating-hair patch: the bald, darker oval tarantulas kick hairs from.
        g.beginFill(0x2E1A0D, 0.55);
        g.drawPolygon(A.ellipsePath(0, 24, 11, 9, 0, 20));
        g.endFill();
        // Chevron markings running down the abdomen.
        g.beginFill(HAIR_TIP, 0.35);
        for (let i = 0; i < 3; i++) {
            const y = 12 + i * 7;
            const w = 9 - i * 1.6;
            g.drawPolygon([0, y, -w, y + 5, -w * 0.55, y + 6.5, 0, y + 3, w * 0.55, y + 6.5, w, y + 5]);
        }
        g.endFill();

        // PEDICEL (waist).
        g.beginFill(0x2C1810);
        g.drawPolygon(A.ellipsePath(0, 7, 5, 4, 0, 14));
        g.endFill();

        // CEPHALOTHORAX (prosoma) - a domed shield, harder than the abdomen, so
        // it gets a tighter, glossier highlight.
        A.fuzz(g, { x: 0, y: -6, rx: 20, ry: 15, color: HAIR, count: 90, length: 4, width: 1.3, alpha: 0.75, sweep: 0.9, seed: 13 });
        A.volume(g, { x: 0, y: -6, rx: 20, ry: 15, color: CARAPACE, outlineWidth: 1.8, rimAlpha: 0.6 });

        // Fovea (the central pit) and the radial grooves fanning out from it.
        g.lineStyle(2, 0x33200F, 0.8);
        g.moveTo(0, -10); g.lineTo(0, 0);
        g.lineStyle(1, 0x33200F, 0.45);
        for (let i = 0; i < 10; i++) {
            const a = (i / 10) * Math.PI * 2;
            g.moveTo(Math.cos(a) * 6, -6 + Math.sin(a) * 4.5);
            g.lineTo(Math.cos(a) * 17, -6 + Math.sin(a) * 12.5);
        }
        g.lineStyle(0);

        // Metallic sheen across the carapace.
        g.beginFill(0xE0A860, 0.22);
        g.drawPolygon(A.ellipsePath(-6, -11, 8, 5, -0.3, 18));
        g.endFill();

        return g;
    });

    AssetDefinition.register('tarantula_head', () => {
        const g = AssetDefinition.createGraphics();
        const A = IdleAnts.Art;

        // Face plate at the front of the carapace.
        A.volume(g, { x: 0, y: 0, rx: 16, ry: 12, color: 0x5A3A1C, outlineWidth: 1.2, rimAlpha: 0.5 });

        // The eight-eye cluster: two large principal eyes with six smaller ones
        // around them. That tight cluster is what makes this read as a spider
        // rather than a beetle.
        A.eye(g, -5, -2, 3, { squash: 1, color: 0x0C0804, innerColor: 0x6B2A1E, specAlpha: 0.95 });
        A.eye(g,  5, -2, 3, { squash: 1, color: 0x0C0804, innerColor: 0x6B2A1E, specAlpha: 0.95 });
        A.eye(g, -8.5, -6.5, 1.7, { squash: 1, color: 0x0C0804, innerColor: 0x4A1E14 });
        A.eye(g,  8.5, -6.5, 1.7, { squash: 1, color: 0x0C0804, innerColor: 0x4A1E14 });
        A.eye(g, -2.6, -6.8, 1.3, { squash: 1, color: 0x0C0804, innerColor: 0x4A1E14 });
        A.eye(g,  2.6, -6.8, 1.3, { squash: 1, color: 0x0C0804, innerColor: 0x4A1E14 });

        // CHELICERAE - the heavy fang bases, with bristles.
        for (const dir of [-1, 1]) {
            A.fuzz(g, { x: dir * 3.4, y: 6, rx: 4, ry: 6, color: 0x7A4E24, count: 14, length: 3, width: 0.9, alpha: 0.8, seed: 30 + dir });
            A.volume(g, { x: dir * 3.4, y: 6, rx: 4.2, ry: 6.4, color: 0x3E2413, outlineWidth: 0.9, rimAlpha: 0.55 });
        }

        // FANGS - curved, glossy and unmistakably sharp.
        for (const dir of [-1, 1]) {
            g.beginFill(0x140A04);
            g.drawPolygon([dir * 1.6, 10, dir * 5.6, 10.6, dir * 4.6, 17.5, dir * 2.6, 13.5]);
            g.endFill();
            g.beginFill(0x8A6A48, 0.7);
            g.drawPolygon([dir * 2.4, 11, dir * 4.6, 11.4, dir * 4.2, 16]);
            g.endFill();
        }

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