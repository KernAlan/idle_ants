// assets/decorAssets.js
//
// Static world props scattered across the map by BackgroundManager. They never
// move or update, so each is baked to a texture once and instanced as cheap
// sprites with per-instance rotation, scale and tint.
(function() {
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;

    // Every prop is lit from the upper-left, matching the entity shadows.
    const LIGHT = { x: -0.5, y: -0.7 };

    // Draw a curved blade/stalk with a darker outline underneath for definition.
    function blade(g, x, y, length, lean, width, color) {
        g.lineStyle(width + 0.7, IdleAnts.Graphics.shade(color, 0.55), 0.55);
        g.moveTo(x, y);
        g.quadraticCurveTo(x + lean * 0.35, y - length * 0.55, x + lean, y - length);
        g.lineStyle(width, color);
        g.moveTo(x, y);
        g.quadraticCurveTo(x + lean * 0.35, y - length * 0.55, x + lean, y - length);
    }

    AssetDefinition.register('decorGrassTuft', function() {
        const g = AssetDefinition.createGraphics();
        const rand = IdleAnts.Graphics.rng(7001);
        const G = IdleAnts.Graphics;

        // Ground contact shadow so the tuft doesn't look pasted on.
        g.beginFill(0x14300f, 0.22);
        g.drawEllipse(0.5, 1, 9, 3);
        g.endFill();

        const blades = 11;
        for (let i = 0; i < blades; i++) {
            const spread = (i / (blades - 1) - 0.5) * 2; // -1 .. 1
            const x = spread * 7;
            const length = G.range(rand, 9, 20) * (1 - Math.abs(spread) * 0.35);
            const lean = spread * G.range(rand, 5, 10);
            // Front blades are lighter, giving the tuft depth back-to-front.
            const base = i % 2 === 0 ? 0x4e9c3f : 0x2f6f2c;
            blade(g, x, 1, length, lean, G.range(rand, 1.1, 1.9), G.shade(base, G.range(rand, 0.9, 1.15)));
        }
        return g;
    });

    AssetDefinition.register('decorPebble', function() {
        const g = AssetDefinition.createGraphics();
        g.beginFill(0x101c08, 0.25);
        g.drawEllipse(1.5, 2.5, 8, 4);
        g.endFill();

        g.beginFill(0x6e6a63);
        g.drawEllipse(0, 0, 7.5, 5.5);
        g.endFill();
        // Lit face toward the light, shaded crescent away from it.
        g.beginFill(0x8d8a82);
        g.drawEllipse(LIGHT.x * 2, LIGHT.y * 2, 5.5, 3.8);
        g.endFill();
        g.beginFill(0xa8a49a);
        g.drawEllipse(LIGHT.x * 4, LIGHT.y * 4, 3, 1.9);
        g.endFill();
        g.beginFill(0x4c4842, 0.5);
        g.drawEllipse(2.2, 2.6, 4.5, 2.4);
        g.endFill();
        return g;
    });

    AssetDefinition.register('decorRock', function() {
        const g = AssetDefinition.createGraphics();
        const rand = IdleAnts.Graphics.rng(3311);
        const G = IdleAnts.Graphics;

        g.beginFill(0x101c08, 0.3);
        g.drawEllipse(3, 4, 19, 10);
        g.endFill();

        // Irregular boulder silhouette from a jittered radial polygon.
        const points = [];
        const sides = 9;
        for (let i = 0; i < sides; i++) {
            const a = (i / sides) * Math.PI * 2;
            const r = G.range(rand, 13, 18);
            points.push(Math.cos(a) * r, Math.sin(a) * r * 0.78);
        }
        g.beginFill(0x5f5b55);
        g.drawPolygon(points);
        g.endFill();

        // Facets: a lit top plane and a shadowed lower plane.
        g.beginFill(0x817d75);
        g.drawPolygon([-11, -3, -3, -10, 7, -8, 10, -1, 0, 3]);
        g.endFill();
        g.beginFill(0x9c988f);
        g.drawPolygon([-7, -4, -2, -8, 4, -6, 1, -1]);
        g.endFill();
        g.beginFill(0x413e3a, 0.6);
        g.drawPolygon([-10, 2, 2, 4, 12, 1, 8, 8, -5, 8]);
        g.endFill();

        // Moss on the shaded side.
        g.beginFill(0x3c6b2e, 0.5);
        g.drawEllipse(-8, 5, 5, 2.5);
        g.drawEllipse(6, 6, 3.5, 1.8);
        g.endFill();
        return g;
    });

    AssetDefinition.register('decorTwig', function() {
        const g = AssetDefinition.createGraphics();

        // Shadow offset from the twig itself so it reads as lying on the grass.
        g.lineStyle(3.5, 0x101c08, 0.22);
        g.moveTo(-18, 2.5);
        g.quadraticCurveTo(0, -1.5, 18, 3);

        g.lineStyle(2.6, 0x4a3524);
        g.moveTo(-18, 0);
        g.quadraticCurveTo(0, -4, 18, 0.5);
        g.lineStyle(1.1, 0x6b4d33);
        g.moveTo(-17, -0.7);
        g.quadraticCurveTo(0, -4.8, 17, -0.3);

        // Side branches
        g.lineStyle(1.8, 0x4a3524);
        g.moveTo(-6, -2.8);
        g.lineTo(-11, -8);
        g.moveTo(7, -2.2);
        g.lineTo(12, -7);
        g.lineStyle(1, 0x6b4d33);
        g.moveTo(-6, -3.4);
        g.lineTo(-10.6, -8.4);
        return g;
    });

    AssetDefinition.register('decorLeaf', function() {
        const g = AssetDefinition.createGraphics();

        g.beginFill(0x101c08, 0.2);
        g.drawEllipse(1.5, 2.5, 11, 6);
        g.endFill();

        // Two arcs meeting at the tip and stem give a proper leaf silhouette.
        g.beginFill(0x6f9a35);
        g.moveTo(-11, 0);
        g.quadraticCurveTo(0, -8, 11, 0);
        g.quadraticCurveTo(0, 8, -11, 0);
        g.endFill();

        // Lit upper half.
        g.beginFill(0x8bb544, 0.85);
        g.moveTo(-10, -0.6);
        g.quadraticCurveTo(0, -7.2, 10, -0.6);
        g.quadraticCurveTo(0, -2.5, -10, -0.6);
        g.endFill();

        // Midrib and veins.
        g.lineStyle(1, 0x4f7325);
        g.moveTo(-11, 0);
        g.lineTo(11, 0);
        g.lineStyle(0.6, 0x4f7325, 0.75);
        for (let i = -2; i <= 2; i++) {
            const x = i * 3.6;
            g.moveTo(x, 0);
            g.lineTo(x + 2.4, -3.4);
            g.moveTo(x, 0);
            g.lineTo(x + 2.4, 3.4);
        }

        // Stem
        g.lineStyle(1.2, 0x4a3524);
        g.moveTo(-11, 0);
        g.lineTo(-14.5, 1.5);
        return g;
    });

    AssetDefinition.register('decorFlower', function() {
        const g = AssetDefinition.createGraphics();

        // Stem and leaves, drawn first so petals sit on top.
        g.lineStyle(1.4, 0x3f7a30);
        g.moveTo(0, 12);
        g.quadraticCurveTo(-1.5, 5, 0, -1);
        g.lineStyle(0);
        g.beginFill(0x4b8f38);
        g.drawEllipse(-3.5, 6, 3.2, 1.6);
        g.drawEllipse(3, 9, 2.6, 1.3);
        g.endFill();

        // Five petals around the centre. White here; instances get tinted.
        g.beginFill(0xF2F2EC);
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            g.drawEllipse(Math.cos(a) * 3.6, Math.sin(a) * 3.6 - 1, 2.9, 2.4);
        }
        g.endFill();
        // Soft shading on the petals furthest from the light.
        g.beginFill(0xD8D6C6, 0.5);
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            g.drawEllipse(Math.cos(a) * 4.3, Math.sin(a) * 4.3 - 0.3, 2.1, 1.6);
        }
        g.endFill();

        // Pollen centre.
        g.beginFill(0xE8A83A);
        g.drawCircle(0, -1, 2.1);
        g.endFill();
        g.beginFill(0xFFD166);
        g.drawCircle(-0.6, -1.7, 1.2);
        g.endFill();
        return g;
    });

    AssetDefinition.register('decorClover', function() {
        const g = AssetDefinition.createGraphics();
        g.beginFill(0x101c08, 0.18);
        g.drawEllipse(1, 1.5, 8, 5);
        g.endFill();

        // Three heart-ish leaflets: a wide lobe pair plus a notch toward centre.
        for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
            const cx = Math.cos(a) * 4.5;
            const cy = Math.sin(a) * 4.5;
            g.beginFill(0x3f8a34);
            g.drawEllipse(cx, cy, 4, 3.4);
            g.endFill();
            g.beginFill(0x56a844, 0.8);
            g.drawEllipse(cx - 0.8, cy - 1, 2.6, 2);
            g.endFill();
        }
        g.beginFill(0x2c6425);
        g.drawCircle(0, 0, 1.4);
        g.endFill();
        return g;
    });

    AssetDefinition.register('decorMushroom', function() {
        const g = AssetDefinition.createGraphics();

        g.beginFill(0x101c08, 0.25);
        g.drawEllipse(2.5, 6, 8, 3);
        g.endFill();

        // Stalk
        g.beginFill(0xE8DCC0);
        g.drawRoundedRect(-2, -2, 4, 9, 1.6);
        g.endFill();
        g.beginFill(0xC9B994, 0.7);
        g.drawRoundedRect(0.5, -2, 1.6, 9, 0.8);
        g.endFill();

        // Cap
        g.beginFill(0xB03A2E);
        g.moveTo(-8, -1);
        g.quadraticCurveTo(0, -12, 8, -1);
        g.quadraticCurveTo(0, 2.5, -8, -1);
        g.endFill();
        g.beginFill(0xC9503C, 0.9);
        g.moveTo(-6.5, -2.5);
        g.quadraticCurveTo(-1, -10.5, 4, -3.5);
        g.quadraticCurveTo(-1, -6, -6.5, -2.5);
        g.endFill();

        // Spots
        g.beginFill(0xF6EDDC, 0.92);
        g.drawEllipse(-3.4, -4.6, 1.7, 1.2);
        g.drawEllipse(1.4, -6.4, 1.9, 1.3);
        g.drawEllipse(4.6, -3.2, 1.3, 0.9);
        g.drawEllipse(-0.6, -3, 1.1, 0.8);
        g.endFill();
        return g;
    });
})();
