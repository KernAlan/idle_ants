// assets/GraphicsUtils.js
//
// Shared low-level drawing helpers used by the procedural art:
// deterministic randomness, seamless value noise, canvas-painted textures and
// cached soft shadow / glow sprites. Keeping these in one place means the world
// looks identical every load and every entity gets the same lighting language.
(function() {
    IdleAnts.Graphics = IdleAnts.Graphics || {};
    const G = IdleAnts.Graphics;

    // --- Deterministic randomness -----------------------------------------

    /**
     * mulberry32 - small, fast, well-distributed seeded PRNG.
     * @param {number} seed
     * @returns {function(): number} generator returning floats in [0, 1)
     */
    G.rng = function(seed) {
        let a = seed >>> 0;
        return function() {
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };

    /** Random float in [min, max). */
    G.range = (rand, min, max) => min + rand() * (max - min);

    /** Random element of an array. */
    G.pick = (rand, arr) => arr[Math.floor(rand() * arr.length) % arr.length];

    // --- Colour helpers ---------------------------------------------------

    /** Blend two packed 0xRRGGBB colours. t=0 gives a, t=1 gives b. */
    G.mix = function(a, b, t) {
        const ar = (a >> 16) & 0xFF, ag = (a >> 8) & 0xFF, ab = a & 0xFF;
        const br = (b >> 16) & 0xFF, bg = (b >> 8) & 0xFF, bb = b & 0xFF;
        const r = Math.round(ar + (br - ar) * t);
        const g = Math.round(ag + (bg - ag) * t);
        const bl = Math.round(ab + (bb - ab) * t);
        return (r << 16) | (g << 8) | bl;
    };

    /** Multiply a colour's brightness, clamped. amount > 1 lightens. */
    G.shade = function(color, amount) {
        const r = Math.max(0, Math.min(255, Math.round(((color >> 16) & 0xFF) * amount)));
        const g = Math.max(0, Math.min(255, Math.round(((color >> 8) & 0xFF) * amount)));
        const b = Math.max(0, Math.min(255, Math.round((color & 0xFF) * amount)));
        return (r << 16) | (g << 8) | b;
    };

    /** '#rrggbb' string for canvas APIs. */
    G.css = (color) => '#' + color.toString(16).padStart(6, '0');

    // --- Seamless value noise ---------------------------------------------

    /**
     * Tileable 2D value noise. The lattice wraps at `period`, so sampling
     * x/y over [0, size) with period dividing size produces a texture that
     * tiles without a visible seam.
     */
    G.makeNoise = function(seed, period) {
        const rand = G.rng(seed);
        const lattice = new Float32Array(period * period);
        for (let i = 0; i < lattice.length; i++) lattice[i] = rand();

        const at = (ix, iy) => lattice[(((iy % period) + period) % period) * period + (((ix % period) + period) % period)];
        // Smoothstep for C1-continuous interpolation between lattice points.
        const fade = (t) => t * t * (3 - 2 * t);

        return function(x, y) {
            const x0 = Math.floor(x), y0 = Math.floor(y);
            const fx = fade(x - x0), fy = fade(y - y0);
            const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx;
            const bot = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
            return top + (bot - top) * fy;
        };
    };

    /**
     * Sum several octaves of tileable noise into a single [0,1] sampler.
     * Every octave's period divides `size`, preserving seamlessness.
     */
    G.makeFractalNoise = function(seed, size, octaves = 4, basePeriod = 4) {
        const layers = [];
        let period = basePeriod;
        let amp = 1;
        let total = 0;
        for (let o = 0; o < octaves && period <= size; o++) {
            layers.push({ noise: G.makeNoise(seed + o * 7919, period), scale: period / size, amp });
            total += amp;
            period *= 2;
            amp *= 0.5;
        }
        return function(x, y) {
            let v = 0;
            for (const l of layers) v += l.noise(x * l.scale, y * l.scale) * l.amp;
            return v / total;
        };
    };

    // --- Canvas-backed textures -------------------------------------------

    /**
     * Paint a texture with the 2D canvas API. Per-pixel work (noise, grain,
     * gradients) is far cheaper and far better looking here than as thousands
     * of PIXI.Graphics primitives.
     * @param {number} width
     * @param {number} height
     * @param {function(CanvasRenderingContext2D, HTMLCanvasElement): void} paint
     */
    G.canvasTexture = function(width, height, paint) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        paint(canvas.getContext('2d'), canvas);
        return PIXI.Texture.from(canvas);
    };

    // --- Cached lighting sprites ------------------------------------------

    G._shadowTexture = null;

    /**
     * A soft round shadow blob (white, so it can be tinted). Cached and shared
     * by every entity - one texture, many cheap sprites.
     */
    G.shadowTexture = function() {
        if (!G._shadowTexture) {
            const size = 128;
            G._shadowTexture = G.canvasTexture(size, size, (ctx) => {
                const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
                // Falls off faster than linear so the core reads as contact shadow
                g.addColorStop(0, 'rgba(255,255,255,1)');
                g.addColorStop(0.45, 'rgba(255,255,255,0.72)');
                g.addColorStop(0.75, 'rgba(255,255,255,0.22)');
                g.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, size, size);
            });
        }
        return G._shadowTexture;
    };

    /**
     * Contact shadow sprite for an entity.
     * @param {number} radiusX horizontal radius in local units
     * @param {number} radiusY vertical radius in local units
     * @param {number} alpha
     */
    G.softShadow = function(radiusX, radiusY, alpha = 0.28) {
        const shadow = new PIXI.Sprite(G.shadowTexture());
        shadow.anchor.set(0.5);
        shadow.width = radiusX * 2;
        shadow.height = radiusY * 2;
        shadow.tint = 0x101c08; // Slightly green-black: shadow on grass, not on white
        shadow.alpha = alpha;
        return shadow;
    };

    G._glowTexture = null;

    /** A soft white radial glow, tint it to taste. */
    G.glowTexture = function() {
        if (!G._glowTexture) {
            const size = 128;
            G._glowTexture = G.canvasTexture(size, size, (ctx) => {
                const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
                g.addColorStop(0, 'rgba(255,255,255,0.95)');
                g.addColorStop(0.3, 'rgba(255,255,255,0.45)');
                g.addColorStop(0.65, 'rgba(255,255,255,0.13)');
                g.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, size, size);
            });
        }
        return G._glowTexture;
    };

    /** Additive glow sprite of the given colour and radius. */
    G.glow = function(radius, color = 0xFFF0B0, alpha = 0.5) {
        const glow = new PIXI.Sprite(G.glowTexture());
        glow.anchor.set(0.5);
        glow.width = glow.height = radius * 2;
        glow.tint = color;
        glow.alpha = alpha;
        glow.blendMode = PIXI.BLEND_MODES.ADD;
        return glow;
    };
})();
