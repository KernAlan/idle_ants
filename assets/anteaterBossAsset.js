// assets/anteaterBossAsset.js
//
// Giant anteater, viewed from above and facing -X. Drawn with the shared
// CreatureArt vocabulary so the final boss matches the lighting and outline
// language of every other sprite in the game.
(function() {
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;

    // Giant anteater colouring: grizzled grey-brown coat, a bold black
    // shoulder wedge edged in white, cream forelegs, and a huge black tail.
    const C = {
        coat: 0x8A7358,
        coatDark: 0x50412E,
        coatLight: 0xB8A183,
        stripe: 0x241F1A,
        stripeEdge: 0xF2EADA,
        snout: 0x4A423A,
        snoutTip: 0x2A241E,
        tail: 0x1E1A16,
        tailHair: 0x4A423A,
        legCream: 0xEDE4D2,
        claw: 0x1A1512
    };

    /**
     * Coarse fur along a body edge - the texture that stops a large mammal
     * reading as a smooth plastic blob at boss scale.
     */
    function fur(g, x, y, rx, ry, color, count, length, seed, alpha = 0.8) {
        IdleAnts.Art.fuzz(g, { x, y, rx, ry, color, count, length, width: 1.6, alpha, seed });
    }

    function drawBody(g, s) {
        const A = IdleAnts.Art;

        // Shaggy coat around the torso.
        fur(g, 0, 0, 50 * s, 20 * s, C.coatLight, 60, 7 * s, 3, 0.55);
        A.volume(g, { x: 0, y: 0, rx: 50 * s, ry: 20 * s, color: C.coat,
            outlineWidth: 2 * s, litColor: C.coatLight, rimAlpha: 0.35 });

        // The signature black shoulder wedge, edged in cream. On a real giant
        // anteater this runs diagonally from the chest up over the shoulder.
        // Drawn as a tapering band with soft ends rather than a hard-edged
        // pentagon, which read as a window cut into the body.
        // A narrow band running diagonally across the shoulder, with only a
        // hairline of cream on its upper edge. Earlier versions used a wide
        // cream border around a large black polygon, which read as a window
        // cut into the animal rather than as markings on fur.
        const band = [
            -34 * s, -8 * s, 2 * s, -17 * s, 22 * s, -7 * s,
            26 * s, 3 * s, 2 * s, 6 * s, -31 * s, 3 * s
        ];
        g.beginFill(C.stripeEdge, 0.55);
        g.drawPolygon(band.map((v, i) => i % 2 === 0 ? v : v - 2.2 * s));
        g.endFill();
        g.beginFill(C.stripe, 0.85);
        g.drawPolygon(band);
        g.endFill();

        // Fur strokes across the band, which keeps it reading as pelt.
        g.lineStyle(1.3 * s, 0x4E453A, 0.45);
        for (let i = 0; i < 11; i++) {
            const t = i / 10;
            g.moveTo((-32 + t * 56) * s, (-8 + t * 8) * s);
            g.lineTo((-28 + t * 54) * s, (-1 + t * 7) * s);
        }
        g.lineStyle(0);
        // Soft shadow under the band's lower edge so it sits on a round body.
        g.beginFill(0x3A3128, 0.3);
        g.drawPolygon([-31 * s, 3 * s, 2 * s, 6 * s, 26 * s, 3 * s, 24 * s, 8 * s, 0, 11 * s, -29 * s, 7 * s]);
        g.endFill();

        // Pale flank below the wedge.
        g.beginFill(C.coatLight, 0.5);
        g.drawPolygon(A.ellipsePath(-16 * s, 10 * s, 26 * s, 7 * s, 0.05, 22));
        g.endFill();
    }

    function drawHeadAndSnout(g, s) {
        const A = IdleAnts.Art;

        // The snout is the anteater's defining silhouette: a long, near-conical
        // tube, drawn before the head so the head overlaps its base.
        // Chunkier than a straight tube so it still reads as a snout when the
        // boss fills a fifth of the screen.
        g.beginFill(IdleAnts.Graphics.shade(C.snout, 0.5));
        g.drawPolygon([
            -36 * s, -9.5 * s, -92 * s, -4.4 * s,
            -92 * s, 4.4 * s, -36 * s, 9.5 * s
        ]);
        g.endFill();
        g.beginFill(C.snout);
        g.drawPolygon([
            -36 * s, -7.6 * s, -90 * s, -3.3 * s,
            -90 * s, 3.3 * s, -36 * s, 7.6 * s
        ]);
        g.endFill();
        // Lit ridge along the top of the snout.
        g.beginFill(0x847A6C, 0.75);
        g.drawPolygon([-38 * s, -6.4 * s, -89 * s, -2.8 * s, -89 * s, -0.6 * s, -38 * s, -2.4 * s]);
        g.endFill();
        // Shadowed underside.
        g.beginFill(0x2A241E, 0.4);
        g.drawPolygon([-38 * s, 3 * s, -89 * s, 1.2 * s, -89 * s, 3.1 * s, -38 * s, 7 * s]);
        g.endFill();

        // Nose pad and nostrils at the tip.
        g.beginFill(C.snoutTip);
        g.drawPolygon(A.ellipsePath(-91 * s, 0, 4.6 * s, 4 * s, 0, 14));
        g.endFill();
        g.beginFill(0x000000, 0.85);
        g.drawCircle(-92.5 * s, -1.6 * s, 1.1 * s);
        g.drawCircle(-92.5 * s, 1.6 * s, 1.1 * s);
        g.endFill();

        // The tongue, flicked out - an anteater eating ants is the whole joke
        // of this boss, so it is worth showing.
        g.lineStyle({ width: 2.2 * s, color: 0xC4626E, alpha: 0.95, cap: PIXI.LINE_CAP.ROUND });
        g.moveTo(-91 * s, 0);
        g.quadraticCurveTo(-104 * s, -3 * s, -114 * s, 2 * s);
        g.lineStyle({ width: 1 * s, color: 0xE894A0, alpha: 0.8, cap: PIXI.LINE_CAP.ROUND });
        g.moveTo(-92 * s, -0.6 * s);
        g.quadraticCurveTo(-104 * s, -3.8 * s, -113 * s, 1.4 * s);
        g.lineStyle(0);

        // Head, blending into the snout.
        fur(g, -42 * s, -1 * s, 24 * s, 14 * s, C.coatLight, 26, 4 * s, 5, 0.5);
        A.volume(g, { x: -42 * s, y: -1 * s, rx: 24 * s, ry: 14 * s, color: C.coat,
            outlineWidth: 1.6 * s, litColor: C.coatLight, rimAlpha: 0.4 });

        // Dark cheek stripe running back from the eye.
        g.beginFill(C.stripe, 0.5);
        g.drawPolygon([-52 * s, -4 * s, -30 * s, -8 * s, -26 * s, -4 * s, -50 * s, 0]);
        g.endFill();
    }

    function drawFeatures(g, s) {
        const A = IdleAnts.Art;

        // Anteaters have famously small eyes - keeping them small next to that
        // huge snout is what makes the proportions read correctly.
        A.eye(g, -46 * s, -5 * s, 2.2 * s, { squash: 1, color: 0x120E0A, innerColor: 0x6A4A26 });

        // Small rounded ear.
        A.volume(g, { x: -30 * s, y: -11 * s, rx: 5.5 * s, ry: 7 * s, rot: -0.3,
            color: C.coatDark, outlineWidth: 1.2 * s });
        g.beginFill(0x6B5A44, 0.8);
        g.drawPolygon(A.ellipsePath(-30 * s, -10.5 * s, 3 * s, 4 * s, -0.3, 14));
        g.endFill();
    }

    function drawTail(g, s) {
        const A = IdleAnts.Art;

        // The enormous banner tail. Dense, swept hair - short enough that the
        // strands merge into a coat rather than spiking out like an urchin.
        IdleAnts.Art.fuzz(g, { x: 46 * s, y: 0, rx: 34 * s, ry: 21 * s,
            color: C.tailHair, count: 150, length: 6 * s, width: 2.2, alpha: 0.8, sweep: 0.9, seed: 7 });
        IdleAnts.Art.fuzz(g, { x: 46 * s, y: 0, rx: 32 * s, ry: 19 * s,
            color: 0x6B6058, count: 90, length: 8.5 * s, width: 1.5, alpha: 0.4, sweep: 1.1, seed: 8 });
        A.volume(g, { x: 46 * s, y: 0, rx: 34 * s, ry: 22 * s, color: C.tail,
            outlineWidth: 2 * s, litColor: 0x3E3830, rimAlpha: 0.3 });

        // Hair strands drawn across the tail body to break up the mass.
        g.lineStyle(1.4 * s, 0x4A423A, 0.5);
        for (let i = 0; i < 14; i++) {
            const t = (i / 13) * 2 - 1;
            g.moveTo(22 * s, t * 16 * s);
            g.quadraticCurveTo(46 * s, t * 22 * s, 76 * s, t * 12 * s);
        }
        g.lineStyle(0);
    }

    function drawFrontLeg(g, s) {
        const A = IdleAnts.Art;

        // Cream foreleg with a dark band above the wrist, as on the real animal.
        A.volume(g, { x: 0, y: -2 * s, rx: 9 * s, ry: 18 * s, color: C.legCream,
            outlineWidth: 1.4 * s, litColor: 0xFFFFFF, rimAlpha: 0.5 });
        g.beginFill(C.stripe, 0.75);
        g.drawPolygon(A.ellipsePath(0, 7 * s, 8.6 * s, 3 * s, 0, 18));
        g.endFill();

        // Paw.
        A.volume(g, { x: 0, y: 11 * s, rx: 10 * s, ry: 6.5 * s, color: 0xC9BCA4,
            outlineWidth: 1.2 * s });

        // The huge digging claws - an anteater's actual weapon, and the reason
        // this boss is dangerous. Drawn as tapered curved sickles.
        const claw = (cx, len, wid, tilt) => {
            g.beginFill(C.claw);
            g.drawPolygon([
                cx - wid, 12 * s,
                cx + wid, 12 * s,
                cx + wid * 0.7 + tilt, 12 * s + len * 0.7,
                cx + tilt * 1.4, 12 * s + len
            ]);
            g.endFill();
            g.beginFill(0x6B6058, 0.6);
            g.drawPolygon([
                cx - wid * 0.5, 13 * s,
                cx + wid * 0.1, 13 * s,
                cx + tilt * 1.1, 12 * s + len * 0.85
            ]);
            g.endFill();
        };
        claw(0, 18 * s, 3 * s, 1 * s);
        claw(-4.5 * s, 14 * s, 2.4 * s, -1 * s);
        claw(4.5 * s, 12 * s, 2.2 * s, 2 * s);
        claw(-8 * s, 9 * s, 1.8 * s, -2 * s);
    }

    function drawBackLeg(g, s) {
        const A = IdleAnts.Art;

        A.volume(g, { x: 0, y: -1 * s, rx: 7 * s, ry: 14 * s, color: C.legCream,
            outlineWidth: 1.3 * s, litColor: 0xFFFFFF, rimAlpha: 0.5 });
        g.beginFill(C.stripe, 0.6);
        g.drawPolygon(A.ellipsePath(0, 6 * s, 6.6 * s, 2.4 * s, 0, 16));
        g.endFill();

        A.volume(g, { x: 0, y: 9 * s, rx: 6.5 * s, ry: 5 * s, color: 0xC9BCA4,
            outlineWidth: 1.1 * s });

        // Shorter hind claws.
        g.beginFill(C.claw);
        for (const [cx, len, wid] of [[-2 * s, 8 * s, 1.7 * s], [1 * s, 7 * s, 1.6 * s], [3.6 * s, 5.5 * s, 1.3 * s]]) {
            g.drawPolygon([cx - wid, 10 * s, cx + wid, 10 * s, cx, 10 * s + len]);
        }
        g.endFill();
    }

    // --- ASSET REGISTRATIONS ---

    AssetDefinition.register('anteater_boss_body', function(app) {
        const g = AssetDefinition.createGraphics();
        const scale = 2.5;
        // Tail first so the torso overlaps its root, then head over the torso.
        drawTail(g, scale);
        drawBody(g, scale);
        drawHeadAndSnout(g, scale);
        drawFeatures(g, scale);
        return g;
    });

    AssetDefinition.register('anteater_boss_leg_front', function(app) {
        const g = AssetDefinition.createGraphics();
        drawFrontLeg(g, 2.5);
        return g;
    });

    AssetDefinition.register('anteater_boss_leg_back', function(app) {
        const g = AssetDefinition.createGraphics();
        drawBackLeg(g, 2.5);
        return g;
    });
})();
