// assets/antAssets.js
(function() {
    // Get a reference to the AssetDefinition class
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;
    
    // Register ant asset.
    //
    // Top-down worker ant, lit from the upper left. Painted in a mid-tone
    // chestnut rather than near-black: many ant subclasses recolour this same
    // texture with `sprite.tint`, which multiplies, so a dark base would crush
    // every variant into mud. Mid-tone base + dark outline keeps the silhouette
    // readable on grass and lets the tinted types actually show their colour.
    AssetDefinition.register('ant', function(app) {
        const g = AssetDefinition.createGraphics();

        const SHELL_DARK = 0x3A2213;   // Outline / deepest shadow
        const SHELL = 0x6B4326;        // Body midtone
        const SHELL_LIT = 0x8F5C31;    // Lit upper-left surface
        const SHELL_RIM = 0xC08B4E;    // Specular rim highlight
        const JOINT = 0x2E1A0E;        // Legs and antennae

        // --- Legs, drawn first so the body overlaps their roots -------------
        // Each leg is two segments with a knee, which reads as a real insect
        // leg instead of the straight spokes it replaces.
        const leg = (hipX, hipY, kneeX, kneeY, footX, footY) => {
            g.lineStyle(2.1, SHELL_DARK, 0.85); // Thicker dark pass = outline
            g.moveTo(hipX, hipY);
            g.lineTo(kneeX, kneeY);
            g.lineTo(footX, footY);
            g.lineStyle(1.1, JOINT);
            g.moveTo(hipX, hipY);
            g.lineTo(kneeX, kneeY);
            g.lineTo(footX, footY);
        };

        // Left side
        leg(-3, -8, -7.5, -11, -9.5, -6);
        leg(-3, -3, -8, -3.5, -10, 2);
        leg(-3, 2, -7.5, 4, -9, 9.5);
        // Right side
        leg(3, -8, 7.5, -11, 9.5, -6);
        leg(3, -3, 8, -3.5, 10, 2);
        leg(3, 2, 7.5, 4, 9, 9.5);

        // --- Gaster (abdomen) ----------------------------------------------
        g.beginFill(SHELL_DARK);
        g.drawEllipse(0, 8, 7.4, 10.4);
        g.endFill();
        g.beginFill(SHELL);
        g.drawEllipse(0, 7.8, 6.4, 9.4);
        g.endFill();
        // Lit surface, pushed toward the light source.
        g.beginFill(SHELL_LIT);
        g.drawEllipse(-1.1, 6.6, 4.8, 7.4);
        g.endFill();
        g.beginFill(SHELL_RIM, 0.75);
        g.drawEllipse(-1.9, 5.2, 2.6, 4.2);
        g.endFill();
        // Segment bands across the gaster.
        g.lineStyle(0.7, SHELL_DARK, 0.55);
        g.moveTo(-5.6, 5.2); g.quadraticCurveTo(0, 7.2, 5.6, 5.2);
        g.moveTo(-5.2, 9.4); g.quadraticCurveTo(0, 11.4, 5.2, 9.4);
        g.lineStyle(0);

        // --- Petiole (waist) ------------------------------------------------
        g.beginFill(SHELL_DARK);
        g.drawEllipse(0, 1.4, 2.4, 2.6);
        g.endFill();
        g.beginFill(SHELL);
        g.drawEllipse(-0.3, 1.2, 1.6, 1.9);
        g.endFill();

        // --- Thorax ---------------------------------------------------------
        g.beginFill(SHELL_DARK);
        g.drawEllipse(0, -4, 4.9, 6.6);
        g.endFill();
        g.beginFill(SHELL);
        g.drawEllipse(0, -4.2, 4, 5.7);
        g.endFill();
        g.beginFill(SHELL_LIT);
        g.drawEllipse(-0.9, -5, 2.9, 4.2);
        g.endFill();
        g.beginFill(SHELL_RIM, 0.7);
        g.drawEllipse(-1.4, -5.8, 1.5, 2.5);
        g.endFill();

        // --- Head -----------------------------------------------------------
        g.beginFill(SHELL_DARK);
        g.drawEllipse(0, -14, 5.4, 6.2);
        g.endFill();
        g.beginFill(SHELL);
        g.drawEllipse(0, -14.2, 4.5, 5.3);
        g.endFill();
        g.beginFill(SHELL_LIT);
        g.drawEllipse(-1, -15, 3.2, 3.8);
        g.endFill();
        g.beginFill(SHELL_RIM, 0.6);
        g.drawEllipse(-1.6, -15.8, 1.7, 2);
        g.endFill();

        // Compound eyes: dark sphere, cool bounce light, tiny specular dot.
        g.beginFill(0x120A05);
        g.drawEllipse(-3.1, -15.2, 1.6, 1.9);
        g.drawEllipse(3.1, -15.2, 1.6, 1.9);
        g.endFill();
        g.beginFill(0x4A3A2A, 0.8);
        g.drawEllipse(-3.1, -14.4, 1.1, 1.1);
        g.drawEllipse(3.1, -14.4, 1.1, 1.1);
        g.endFill();
        g.beginFill(0xFFFFFF, 0.9);
        g.drawEllipse(-3.6, -15.9, 0.6, 0.7);
        g.drawEllipse(2.6, -15.9, 0.6, 0.7);
        g.endFill();

        // Mandibles - curved and tapered, meeting in front of the head.
        g.lineStyle(1.7, SHELL_DARK);
        g.moveTo(-3.2, -18);
        g.quadraticCurveTo(-5.4, -20.4, -3.4, -22.2);
        g.moveTo(3.2, -18);
        g.quadraticCurveTo(5.4, -20.4, 3.4, -22.2);
        g.lineStyle(0.8, SHELL_LIT);
        g.moveTo(-3.4, -18.4);
        g.quadraticCurveTo(-5, -20.4, -3.5, -21.8);
        g.moveTo(3.4, -18.4);
        g.quadraticCurveTo(5, -20.4, 3.5, -21.8);

        // Antennae - elbowed, with a clubbed tip, dark outline then highlight.
        const antenna = (dir) => {
            g.lineStyle(1.7, SHELL_DARK, 0.9);
            g.moveTo(dir * 2.2, -17.4);
            g.quadraticCurveTo(dir * 6.4, -20.6, dir * 6.2, -24.6);
            g.lineStyle(0.9, JOINT);
            g.moveTo(dir * 2.2, -17.4);
            g.quadraticCurveTo(dir * 6.2, -20.6, dir * 6, -24.4);
            g.lineStyle(0);
            g.beginFill(SHELL_DARK);
            g.drawCircle(dir * 6, -24.8, 1.3);
            g.endFill();
            g.beginFill(SHELL_LIT);
            g.drawCircle(dir * 5.7, -25.1, 0.7);
            g.endFill();
        };
        antenna(-1);
        antenna(1);

        return g;
    });
    
    // Register queen ant asset.
    //
    // The queen is the colony's most important single sprite - losing her ends
    // the run - so she is built at a larger scale than a worker with a heavier
    // gaster, richer colour, and one clean crown. The previous version drew the
    // crown twice (once as a ring of circles, once as rectangles and points)
    // and repeated the mandibles and antennae, which read as a gold smear.
    AssetDefinition.register('queenAnt', function(app) {
        const g = AssetDefinition.createGraphics();
        const A = IdleAnts.Art;

        // Deeper, warmer chestnut than a worker - she reads as royalty even
        // before the crown is drawn.
        const SHELL_DARK = 0x3A1F0E;
        const SHELL = 0x7A4522;
        const SHELL_LIT = 0xA4632E;
        const JOINT = 0x2E180A;
        const GOLD = 0xE8B723;
        const GOLD_LIT = 0xFFE08A;
        const GOLD_DARK = 0x8A6410;

        // --- Legs, behind the body ---------------------------------------
        const leg = (hipX, hipY, kneeX, kneeY, footX, footY) => {
            A.limb(g, [[hipX, hipY], [kneeX, kneeY], [footX, footY]], 1.5, JOINT, { foot: true });
        };
        leg(-4, -9, -9, -12, -12, -6);
        leg(-4, -3, -10, -4, -13, 3);
        leg(-4, 3, -9, 5, -11, 12);
        leg(4, -9, 9, -12, 12, -6);
        leg(4, -3, 10, -4, 13, 3);
        leg(4, 3, 9, 5, 11, 12);

        // --- Gaster --------------------------------------------------------
        // Much larger than a worker's; an egg-laying queen is mostly abdomen.
        A.volume(g, { x: 0, y: 11, rx: 10, ry: 14, color: SHELL,
            outlineColor: SHELL_DARK, litColor: SHELL_LIT, outlineWidth: 1.1, rimAlpha: 0.6 });

        // Segment bands.
        g.lineStyle(0.9, SHELL_DARK, 0.5);
        g.moveTo(-8, 6);  g.quadraticCurveTo(0, 9, 8, 6);
        g.moveTo(-8, 12); g.quadraticCurveTo(0, 15, 8, 12);
        g.moveTo(-6, 18); g.quadraticCurveTo(0, 21, 6, 18);
        g.lineStyle(0);

        // Royal marking: a gold chevron down the gaster.
        g.beginFill(GOLD, 0.4);
        for (let i = 0; i < 2; i++) {
            const y = 7 + i * 7;
            g.drawPolygon([0, y, -4, y + 4, -2, y + 5.4, 0, y + 2.6, 2, y + 5.4, 4, y + 4]);
        }
        g.endFill();

        // --- Petiole -------------------------------------------------------
        A.volume(g, { x: 0, y: -0.5, rx: 3, ry: 3.2, color: SHELL,
            outlineColor: SHELL_DARK, litColor: SHELL_LIT, outlineWidth: 0.7 });

        // --- Thorax --------------------------------------------------------
        A.volume(g, { x: 0, y: -6.5, rx: 6.6, ry: 8.4, color: SHELL,
            outlineColor: SHELL_DARK, litColor: SHELL_LIT, outlineWidth: 1, rimAlpha: 0.6 });

        // --- Head ----------------------------------------------------------
        A.volume(g, { x: 0, y: -17, rx: 6.8, ry: 7.4, color: SHELL,
            outlineColor: SHELL_DARK, litColor: SHELL_LIT, outlineWidth: 1, rimAlpha: 0.6 });

        A.eye(g, -3.8, -18.2, 2.1, { squash: 1.25, innerColor: 0x7A4A1E });
        A.eye(g,  3.8, -18.2, 2.1, { squash: 1.25, innerColor: 0x7A4A1E });

        A.mandibles(g, 0, -22.5, { size: 6, color: JOINT, width: 1.9 });
        A.antenna(g, -3, -21, -1, { length: 13, spread: 0.62, width: 1.4, color: JOINT });
        A.antenna(g,  3, -21,  1, { length: 13, spread: 0.62, width: 1.4, color: JOINT });

        // --- Crown ---------------------------------------------------------
        // A single band with five points, drawn once, sitting on the crown of
        // the head. Shaded like everything else: dark base, gold face, lit top.
        const CROWN_Y = -24;
        const points = [];
        const spikes = 5;
        for (let i = 0; i < spikes; i++) {
            const t = i / (spikes - 1);
            const x = -7 + t * 14;
            // Centre spike tallest, tapering to the sides.
            const h = 6.5 - Math.abs(t - 0.5) * 6;
            points.push(x - 1.4, CROWN_Y, x, CROWN_Y - h, x + 1.4, CROWN_Y);
        }

        // Drop shadow under the crown.
        g.beginFill(GOLD_DARK, 0.55);
        g.drawPolygon(points.map((v, i) => i % 2 === 0 ? v : v + 1));
        g.drawRoundedRect(-7.6, CROWN_Y - 0.4, 15.2, 4.4, 1.4);
        g.endFill();

        g.beginFill(GOLD);
        g.drawPolygon(points);
        g.drawRoundedRect(-7.4, CROWN_Y - 1, 14.8, 4, 1.3);
        g.endFill();

        // Lit upper edge of the band.
        g.beginFill(GOLD_LIT, 0.85);
        g.drawRoundedRect(-7.4, CROWN_Y - 1, 14.8, 1.6, 0.8);
        g.endFill();
        // Highlight on the left face of each spike, matching the key light.
        g.beginFill(GOLD_LIT, 0.65);
        for (let i = 0; i < spikes; i++) {
            const t = i / (spikes - 1);
            const x = -7 + t * 14;
            const h = 6.5 - Math.abs(t - 0.5) * 6;
            g.drawPolygon([x - 1.2, CROWN_Y - 0.6, x, CROWN_Y - h, x - 0.2, CROWN_Y - h * 0.35]);
        }
        g.endFill();

        // Three jewels set into the band.
        const jewel = (x, color) => {
            g.beginFill(IdleAnts.Graphics.shade(color, 0.45));
            g.drawCircle(x, CROWN_Y + 1.2, 1.5);
            g.endFill();
            g.beginFill(color);
            g.drawCircle(x, CROWN_Y + 1, 1.2);
            g.endFill();
            g.beginFill(0xFFFFFF, 0.85);
            g.drawCircle(x - 0.4, CROWN_Y + 0.6, 0.45);
            g.endFill();
        };
        jewel(-3.6, 0x2E6BD8);
        jewel(0, 0xD82E3A);
        jewel(3.6, 0x2EB84A);

        return g;
    });

    // Register larvae asset - a plump, translucent grub rather than a flat
    // yellow pill. Kept the same overall footprint so nest layout is unchanged.
    AssetDefinition.register('larvae', function(app) {
        const g = AssetDefinition.createGraphics();

        // Warm halo so larvae stay findable among the dirt of the nest.
        g.beginFill(0xFFE066, 0.22);
        g.drawEllipse(0, 0, 10.5, 12);
        g.endFill();
        g.beginFill(0xFFE066, 0.18);
        g.drawEllipse(0, 0, 8, 9.6);
        g.endFill();

        // Body: a comma-shaped grub, fatter at the head end.
        g.beginFill(0xE8B84B);
        g.drawEllipse(0, 0.4, 5.8, 8.6);
        g.endFill();
        g.beginFill(0xF7DC94);
        g.drawEllipse(-0.7, -0.4, 5, 7.7);
        g.endFill();

        // Segment creases, curved so the grub looks rounded.
        g.lineStyle(1, 0xC79A34, 0.7);
        for (const y of [-4.4, -1.6, 1.2, 4]) {
            g.moveTo(-4.6, y);
            g.quadraticCurveTo(0, y + 1.4, 4.6, y);
        }
        g.lineStyle(0);

        // Sheen along the lit flank - the cue that sells "soft and damp".
        g.beginFill(0xFFF6D8, 0.75);
        g.drawEllipse(-2, -2.6, 1.6, 3.6);
        g.endFill();

        // Darker head cap with two dot eyes.
        g.beginFill(0xD8A63C);
        g.drawEllipse(0, -6.8, 3.4, 2.6);
        g.endFill();
        g.beginFill(0x6B4A16, 0.8);
        g.drawCircle(-1.2, -7.2, 0.6);
        g.drawCircle(1.2, -7.2, 0.6);
        g.endFill();

        return g;
    });

    // Register egg asset for larvae effect - pearlescent rather than plain white.
    AssetDefinition.register('egg', function(app) {
        const g = AssetDefinition.createGraphics();

        // Soft halo.
        g.beginFill(0xFFF6CC, 0.28);
        g.drawEllipse(0, 0, 9.8, 12);
        g.endFill();

        // Shell, slightly narrower at the top like a real egg.
        g.beginFill(0xD8D2BC);
        g.drawEllipse(0, 0, 7.2, 10);
        g.endFill();
        g.beginFill(0xFFFDF2);
        g.drawEllipse(-0.4, -0.5, 6.6, 9.3);
        g.endFill();

        // Warm bounce light along the shaded lower-right edge, which is what
        // makes a white oval read as a translucent shell.
        g.beginFill(0xF0E4C4, 0.7);
        g.drawEllipse(1.6, 2.4, 4.4, 6);
        g.endFill();
        g.beginFill(0xFFFFFF);
        g.drawEllipse(-1.2, -1.6, 4.4, 6.4);
        g.endFill();

        // Specular highlight.
        g.beginFill(0xFFFFFF, 0.95);
        g.drawEllipse(-2.4, -4, 1.6, 2.4);
        g.endFill();

        return g;
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