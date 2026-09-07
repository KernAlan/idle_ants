// assets/environmentAssets.js
(function() {
    // Get a reference to the AssetDefinition class
    const AssetDefinition = IdleAnts.Assets.AssetDefinition;
    
    // Register nest asset
    AssetDefinition.register('nest', function(app) {
        const nestGraphics = AssetDefinition.createGraphics();
        
        // Main mound
        nestGraphics.beginFill(0x8B4513);
        nestGraphics.drawCircle(0, 0, 30);
        nestGraphics.endFill();
        
        // Entrance hole
        nestGraphics.beginFill(0x3D2817);
        nestGraphics.drawCircle(0, 0, 10);
        nestGraphics.endFill();
        
        // Add some texture to the mound with lighter spots
        nestGraphics.beginFill(0xA86032);
        nestGraphics.drawCircle(-15, -10, 8);
        nestGraphics.drawCircle(10, 15, 6);
        nestGraphics.drawCircle(15, -5, 5);
        nestGraphics.endFill();
        
        return nestGraphics;
    });
    
    // Register ground asset.
    //
    // Painted per-pixel on a canvas rather than assembled from PIXI primitives:
    // layered value noise gives real organic variation, and because every noise
    // octave's lattice wraps at a divisor of the tile size the result tiles
    // seamlessly across the whole 3000x2000 map.
    AssetDefinition.register('ground', function(app) {
        const G = IdleAnts.Graphics;
        const SIZE = 512;

        // Grass, from shadowed depths up to sun-bleached tips.
        const GRASS_DEEP = 0x659747;
        const GRASS_MID = 0x80ad55;
        const GRASS_LIT = 0xabc96c;
        // Bare earth showing through worn patches.
        const SOIL_DARK = 0xa38b55;
        const SOIL_LIT = 0xc6ae73;

        return G.canvasTexture(SIZE, SIZE, (ctx) => {
            // Broad tonal variation, fine mottling, and a separate mask that
            // decides where grass thins out to soil.
            const tone = G.makeFractalNoise(1337, SIZE, 5, 2);
            const mottle = G.makeFractalNoise(4242, SIZE, 3, 16);
            const wear = G.makeFractalNoise(9001, SIZE, 3, 2);

            const image = ctx.createImageData(SIZE, SIZE);
            const data = image.data;
            const grain = G.rng(555);

            for (let y = 0; y < SIZE; y++) {
                for (let x = 0; x < SIZE; x++) {
                    // Blend the three greens along the tonal gradient, then
                    // break it up with high-frequency mottling.
                    const t = tone(x, y) * 0.75 + mottle(x, y) * 0.25;
                    let color = t < 0.5
                        ? G.mix(GRASS_DEEP, GRASS_MID, t * 2)
                        : G.mix(GRASS_MID, GRASS_LIT, (t - 0.5) * 2);

                    // Worn earth patches: only the strongest part of the mask
                    // breaks through, and it fades in gradually at the edges.
                    const bare = wear(x, y);
                    if (bare > 0.62) {
                        const soilAmount = Math.min(1, (bare - 0.62) / 0.22);
                        const soil = G.mix(SOIL_DARK, SOIL_LIT, mottle(x, y));
                        color = G.mix(color, soil, soilAmount * 0.85);
                    }

                    // Per-pixel grain keeps large flat areas from looking like
                    // a gradient mesh when the camera is zoomed out.
                    const jitter = 0.98 + grain() * 0.04;
                    const i = (y * SIZE + x) * 4;
                    data[i] = Math.min(255, ((color >> 16) & 0xFF) * jitter);
                    data[i + 1] = Math.min(255, ((color >> 8) & 0xFF) * jitter);
                    data[i + 2] = Math.min(255, (color & 0xFF) * jitter);
                    data[i + 3] = 255;
                }
            }
            ctx.putImageData(image, 0, 0);

            // Grass blades on top of the noise base. Each blade is drawn in
            // every wrapped position it could straddle so none are cut at the
            // tile boundary.
            const rand = G.rng(24680);
            const strokeWrapped = (draw) => {
                for (const dx of [-SIZE, 0, SIZE]) {
                    for (const dy of [-SIZE, 0, SIZE]) {
                        ctx.save();
                        ctx.translate(dx, dy);
                        draw();
                        ctx.restore();
                    }
                }
            };

            ctx.lineCap = 'round';
            for (let i = 0; i < 480; i++) {
                const x = rand() * SIZE;
                const y = rand() * SIZE;
                // Skip blades that would sit in the middle of a soil patch.
                if (wear(x, y) > 0.70) continue;

                const length = G.range(rand, 3, 9);
                const lean = G.range(rand, -2.6, 2.6);
                const lit = rand() > 0.45;
                const blade = lit
                    ? G.shade(GRASS_LIT, G.range(rand, 1.0, 1.22))
                    : G.shade(GRASS_DEEP, G.range(rand, 0.85, 1.1));

                ctx.strokeStyle = G.css(blade);
                ctx.globalAlpha = lit ? G.range(rand, 0.30, 0.6) : G.range(rand, 0.35, 0.7);
                ctx.lineWidth = G.range(rand, 0.7, 1.5);
                strokeWrapped(() => {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.quadraticCurveTo(x + lean * 0.4, y - length * 0.6, x + lean, y - length);
                    ctx.stroke();
                });
            }

            // Grit: tiny pebbles and dried bits, mostly inside the bare patches.
            for (let i = 0; i < 220; i++) {
                const x = rand() * SIZE;
                const y = rand() * SIZE;
                const onSoil = wear(x, y) > 0.6;
                ctx.globalAlpha = onSoil ? G.range(rand, 0.25, 0.55) : G.range(rand, 0.08, 0.2);
                ctx.fillStyle = G.css(G.mix(0x6b6b60, 0x2b2117, rand()));
                // Sampled outside the wrapped draw so every copy is identical.
                const rx = G.range(rand, 0.5, 1.6);
                const ry = rx * G.range(rand, 0.6, 1);
                const tilt = rand() * Math.PI;
                strokeWrapped(() => {
                    ctx.beginPath();
                    ctx.ellipse(x, y, rx, ry, tilt, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
            ctx.globalAlpha = 1;
        });
    });
})();