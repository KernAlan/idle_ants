// assets/CreatureArt.js
//
// Shared drawing vocabulary for every creature in the game - ants, enemies and
// bosses alike. The point is consistency: one light direction, one way of
// building volume, one way of drawing a limb. Anything drawn with these helpers
// automatically matches everything else on screen.
//
// Convention: creatures are drawn facing UP (-Y), centred on the origin, and
// rotated at runtime by the entity.
(function() {
    IdleAnts.Art = IdleAnts.Art || {};
    const A = IdleAnts.Art;

    // Key light from the upper left, matching BackgroundManager's key light and
    // the contact shadows in GraphicsUtils.
    A.LIGHT = { x: -0.42, y: -0.58 };

    /**
     * Ellipse as a polygon point list. PIXI's drawEllipse cannot be rotated,
     * and almost every body part reads better on a slight angle.
     */
    A.ellipsePath = function(cx, cy, rx, ry, rot = 0, steps = 28) {
        const pts = [];
        const c = Math.cos(rot), s = Math.sin(rot);
        for (let i = 0; i < steps; i++) {
            const t = (i / steps) * Math.PI * 2;
            const x = Math.cos(t) * rx, y = Math.sin(t) * ry;
            pts.push(cx + x * c - y * s, cy + x * s + y * c);
        }
        return pts;
    };

    /**
     * The workhorse: a body segment with real volume.
     *
     * Four stacked passes - a slightly oversized dark silhouette (which doubles
     * as the outline), the base colour, a lit face pushed toward the light, and
     * a small specular rim. This is what turns the old flat fills into shapes
     * that look round.
     */
    A.volume = function(g, o) {
        const Gr = IdleAnts.Graphics;
        const { x = 0, y = 0, rx, ry, color, rot = 0 } = o;
        const steps = o.steps || 28;
        const outlineColor = o.outlineColor !== undefined ? o.outlineColor : Gr.shade(color, 0.4);
        const litColor = o.litColor !== undefined ? o.litColor : Gr.shade(color, 1.32);
        const rimColor = o.rimColor !== undefined ? o.rimColor : Gr.shade(color, 1.85);
        const ow = o.outlineWidth !== undefined ? o.outlineWidth : Math.max(0.7, Math.min(rx, ry) * 0.15);

        g.beginFill(outlineColor, o.outlineAlpha !== undefined ? o.outlineAlpha : 1);
        g.drawPolygon(A.ellipsePath(x, y, rx + ow, ry + ow, rot, steps));
        g.endFill();

        g.beginFill(color, o.alpha !== undefined ? o.alpha : 1);
        g.drawPolygon(A.ellipsePath(x, y, rx, ry, rot, steps));
        g.endFill();

        if (o.lit !== false) {
            g.beginFill(litColor, o.litAlpha !== undefined ? o.litAlpha : 1);
            g.drawPolygon(A.ellipsePath(
                x + A.LIGHT.x * rx * 0.30,
                y + A.LIGHT.y * ry * 0.30,
                rx * 0.70, ry * 0.70, rot, steps));
            g.endFill();

            g.beginFill(rimColor, o.rimAlpha !== undefined ? o.rimAlpha : 0.55);
            g.drawPolygon(A.ellipsePath(
                x + A.LIGHT.x * rx * 0.52,
                y + A.LIGHT.y * ry * 0.52,
                rx * 0.36, ry * 0.36, rot, steps));
            g.endFill();
        }
        return g;
    };

    /**
     * Jointed limb through a polyline of [x,y] points.
     *
     * Drawn as three passes - dark underlay (outline), body colour, then a thin
     * highlight offset toward the light - so legs read as tapered tubes rather
     * than the hairline sticks they replace.
     */
    A.limb = function(g, pts, width, color, o = {}) {
        const Gr = IdleAnts.Graphics;
        if (pts.length < 2) return g;
        const dark = o.outlineColor !== undefined ? o.outlineColor : Gr.shade(color, 0.42);
        const light = o.highlightColor !== undefined ? o.highlightColor : Gr.shade(color, 1.45);

        const stroke = (w, col, alpha, dx, dy) => {
            g.lineStyle({ width: w, color: col, alpha, cap: PIXI.LINE_CAP.ROUND, join: PIXI.LINE_JOIN.ROUND });
            g.moveTo(pts[0][0] + dx, pts[0][1] + dy);
            for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] + dx, pts[i][1] + dy);
        };

        stroke(width + Math.max(0.8, width * 0.5), dark, 1, 0, 0);
        stroke(width, color, 1, 0, 0);
        if (o.highlight !== false) {
            stroke(Math.max(0.35, width * 0.32), light, o.highlightAlpha !== undefined ? o.highlightAlpha : 0.7,
                A.LIGHT.x * width * 0.28, A.LIGHT.y * width * 0.28);
        }
        g.lineStyle(0);

        // Optional foot pad at the far end so limbs terminate rather than stop.
        if (o.foot) {
            const end = pts[pts.length - 1];
            g.beginFill(dark);
            g.drawCircle(end[0], end[1], width * 0.62);
            g.endFill();
        }
        return g;
    };

    /**
     * Compound eye: dark dome, coloured inner glow, hard specular dot.
     * The specular is what makes creatures look alive rather than painted.
     */
    A.eye = function(g, x, y, r, o = {}) {
        const base = o.color !== undefined ? o.color : 0x14100C;
        const inner = o.innerColor !== undefined ? o.innerColor : IdleAnts.Graphics.shade(base, 2.6);
        const ry = r * (o.squash !== undefined ? o.squash : 1.2);

        g.beginFill(o.rimColor !== undefined ? o.rimColor : 0x000000, 0.55);
        g.drawPolygon(A.ellipsePath(x, y, r * 1.18, ry * 1.18, o.rot || 0, 18));
        g.endFill();
        g.beginFill(base);
        g.drawPolygon(A.ellipsePath(x, y, r, ry, o.rot || 0, 18));
        g.endFill();
        g.beginFill(inner, 0.75);
        g.drawPolygon(A.ellipsePath(x, y + ry * 0.28, r * 0.62, ry * 0.55, o.rot || 0, 16));
        g.endFill();
        g.beginFill(0xFFFFFF, o.specAlpha !== undefined ? o.specAlpha : 0.92);
        g.drawPolygon(A.ellipsePath(x + A.LIGHT.x * r * 0.62, y + A.LIGHT.y * ry * 0.55, r * 0.34, ry * 0.28, 0, 12));
        g.endFill();
        return g;
    };

    /**
     * Membranous wing from a closed outline, with veins running its length.
     * Semi-transparent so the body reads through it.
     */
    A.wing = function(g, pts, o = {}) {
        const color = o.color !== undefined ? o.color : 0xE8F4FF;
        g.beginFill(color, o.alpha !== undefined ? o.alpha : 0.42);
        g.drawPolygon(pts);
        g.endFill();

        // Leading edge is thicker and more opaque on a real wing.
        g.lineStyle(o.edgeWidth || 1, o.edgeColor !== undefined ? o.edgeColor : 0xBFD4E6,
            o.edgeAlpha !== undefined ? o.edgeAlpha : 0.75);
        g.drawPolygon(pts);
        g.lineStyle(0);

        if (o.veins) {
            g.lineStyle(o.veinWidth || 0.5, o.veinColor !== undefined ? o.veinColor : 0xAFC6DA, 0.6);
            for (const v of o.veins) {
                g.moveTo(v[0], v[1]);
                g.lineTo(v[2], v[3]);
            }
            g.lineStyle(0);
        }
        return g;
    };

    /**
     * Tapered segmented abdomen - a stack of overlapping volumes shrinking
     * toward the tip, optionally alternating colours for stripes.
     */
    A.segmentedAbdomen = function(g, o) {
        const { x = 0, y = 0, length, width, count = 5 } = o;
        const colors = o.colors || [o.color];
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1 || 1);
            const sy = y + t * length;
            // Taper: widest a third of the way down, narrowing to the tip.
            const taper = 1 - Math.pow(Math.max(0, t - 0.3) / 0.7, 1.7) * (o.taper !== undefined ? o.taper : 0.7);
            A.volume(g, {
                x, y: sy,
                rx: width * taper,
                ry: (length / count) * (o.overlap !== undefined ? o.overlap : 0.95),
                color: colors[i % colors.length],
                outlineWidth: o.outlineWidth !== undefined ? o.outlineWidth : 0.7,
                rimAlpha: 0.4
            });
        }
        return g;
    };

    /**
     * Fuzzy pile for bees, caterpillars and anything that should look furry:
     * short hairs radiating from an ellipse's edge.
     */
    A.fuzz = function(g, o) {
        const { x = 0, y = 0, rx, ry, color, count = 40, length = 3, seed = 1 } = o;
        const rand = IdleAnts.Graphics.rng(seed);
        const G = IdleAnts.Graphics;
        const width = o.width || 0.7;
        const alpha = o.alpha !== undefined ? o.alpha : 0.85;

        // Hairs are swept tangentially and curved rather than pointing straight
        // out along the radius. Purely radial hairs read as a starburst as soon
        // as they get long - which is exactly what a boss-scale pelt needs.
        const sweep = o.sweep !== undefined ? o.sweep : 0.55;

        // Two passes: a darker under-layer and the lit hair on top, so the pelt
        // has depth instead of looking like a single wire brush.
        for (let pass = 0; pass < 2; pass++) {
            const passColor = pass === 0 ? G.shade(color, 0.55) : color;
            g.lineStyle({
                width: pass === 0 ? width * 1.4 : width,
                color: passColor,
                alpha: pass === 0 ? alpha * 0.6 : alpha,
                cap: PIXI.LINE_CAP.ROUND
            });
            const r2 = G.rng(seed + pass * 977);
            for (let i = 0; i < count; i++) {
                // Jittered angle so hairs clump naturally instead of sitting on
                // a perfectly even radial grid.
                const t = (i / count) * Math.PI * 2 + (r2() - 0.5) * (Math.PI * 2 / count) * 1.6;
                const ct = Math.cos(t), st = Math.sin(t);
                const ex = x + ct * rx;
                const ey = y + st * ry;
                const len = length * (0.45 + r2() * 0.9);
                // Tangent direction, used to sweep the tip sideways.
                const tanX = -st, tanY = ct;
                const lean = (r2() - 0.5) * 2 * sweep;
                const tipX = ex + ct * len + tanX * len * lean;
                const tipY = ey + st * len + tanY * len * lean;
                g.moveTo(ex, ey);
                g.quadraticCurveTo(
                    ex + ct * len * 0.55 + tanX * len * lean * 0.2,
                    ey + st * len * 0.55 + tanY * len * lean * 0.2,
                    tipX, tipY);
            }
        }
        g.lineStyle(0);
        return g;
    };

    /**
     * Curved, tapered antenna ending in a small club.
     */
    A.antenna = function(g, x, y, dir, o = {}) {
        const len = o.length || 20;
        const spread = o.spread !== undefined ? o.spread : 0.5;
        const color = o.color !== undefined ? o.color : 0x2E1A0E;
        const pts = [
            [x, y],
            [x + dir * len * spread * 0.5, y - len * 0.45],
            [x + dir * len * spread, y - len * 0.85],
            [x + dir * len * spread * 1.15, y - len]
        ];
        A.limb(g, pts, o.width || 1.2, color, { highlight: false });
        if (o.club !== false) {
            g.beginFill(IdleAnts.Graphics.shade(color, 0.7));
            g.drawCircle(pts[3][0], pts[3][1], (o.width || 1.2) * 1.1);
            g.endFill();
            g.beginFill(IdleAnts.Graphics.shade(color, 1.8), 0.8);
            g.drawCircle(pts[3][0] - 0.3, pts[3][1] - 0.3, (o.width || 1.2) * 0.55);
            g.endFill();
        }
        return g;
    };

    /**
     * Mandibles / pincers - a matched pair of curved, tapering claws.
     */
    A.mandibles = function(g, x, y, o = {}) {
        const size = o.size || 6;
        const color = o.color !== undefined ? o.color : 0x2A1A0E;
        const spread = o.spread !== undefined ? o.spread : 0.65;
        for (const dir of [-1, 1]) {
            A.limb(g, [
                [x + dir * size * 0.35, y],
                [x + dir * size * spread, y - size * 0.75],
                [x + dir * size * 0.32, y - size * 1.25]
            ], o.width || size * 0.28, color, { highlight: true });
        }
        return g;
    };
})();
