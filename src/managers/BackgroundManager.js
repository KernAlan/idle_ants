// src/managers/BackgroundManager.js
//
// Builds the visual world beneath the entities: the tiled ground, large-scale
// terrain shading, scattered static props, and the screen-space lighting pass
// (vignette + warm key light) that sits over everything.
IdleAnts.Managers.BackgroundManager = class {
    // How many of each prop to scatter per million square pixels of map, so
    // density stays consistent if the map size ever changes.
    static DECOR_DENSITY = {
        decorGrassTuft: 150,
        decorClover: 46,
        decorLeaf: 26,
        decorPebble: 28,
        decorTwig: 16,
        decorFlower: 24,
        decorMushroom: 4,
        decorRock: 7
    };

    // Props are tinted within a narrow range so the map reads as one biome
    // rather than a bag of assorted stickers.
    static DECOR_TINTS = {
        decorGrassTuft: [0x86c96f, 0xa2dc86, 0x669f52, 0x74b45e],
        decorClover: [0xa8d98a, 0x93c478, 0xc0e8a4],
        decorLeaf: [0xd4c07a, 0xb8d47a, 0xe0a05a, 0xc98a4a],
        decorPebble: [0xffffff, 0xd8d0c0, 0xc0c8d0],
        decorTwig: [0xffffff, 0xd8c0a0],
        decorFlower: [0xffffff, 0xffd6e8, 0xd6e4ff, 0xfff0b0, 0xe8d6ff],
        decorMushroom: [0xffffff, 0xffd0a0, 0xe0e0ff],
        decorRock: [0xffffff, 0xc8c4bc]
    };

    constructor(app, assetManager, worldContainer) {
        this.app = app;
        this.assetManager = assetManager;
        this.worldContainer = worldContainer;
    }

    createBackground(width, height) {
        const mapWidth = width || this.app.screen.width;
        const mapHeight = height || this.app.screen.height;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        this.createGround(mapWidth, mapHeight);
        this.createTerrainShading(mapWidth, mapHeight);
        this.createDecor(mapWidth, mapHeight);

        // Border only; the interior grid is left off to avoid visible seams.
        this.createMapBorder(mapWidth, mapHeight, false);

        this.createLighting();
        window.addEventListener('resize', () => this.resizeLighting());
    }

    createGround(mapWidth, mapHeight) {
        const groundTexture = this.assetManager.getTexture('ground');

        groundTexture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        // Linear filtering plus mipmaps: the ground is often viewed zoomed out,
        // where unmipmapped noise aliases into a shimmering mess.
        groundTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        groundTexture.baseTexture.mipmap = PIXI.MIPMAP_MODES.ON;

        this.background = new PIXI.TilingSprite(groundTexture, mapWidth, mapHeight);
        this.background.tileScale.set(1, 1);
        this.background.anchor.set(0, 0);
        this.background.position.set(0, 0);

        this.worldContainer.addChildAt(this.background, 0);
    }

    /**
     * Large, soft blotches of light and shade over the tiled ground. This is
     * what hides the tiling repetition: the eye follows these low-frequency
     * shapes instead of the 512px grid underneath.
     */
    createTerrainShading(mapWidth, mapHeight) {
        const G = IdleAnts.Graphics;
        const rand = G.rng(20260729);
        const shading = new PIXI.Container();

        const blotch = (count, color, blend, minR, maxR, minA, maxA) => {
            for (let i = 0; i < count; i++) {
                const sprite = new PIXI.Sprite(G.glowTexture());
                sprite.anchor.set(0.5);
                const r = G.range(rand, minR, maxR);
                sprite.width = r * 2;
                sprite.height = r * 2 * G.range(rand, 0.55, 1);
                sprite.rotation = rand() * Math.PI;
                sprite.position.set(rand() * mapWidth, rand() * mapHeight);
                sprite.tint = color;
                sprite.alpha = G.range(rand, minA, maxA);
                sprite.blendMode = blend;
                shading.addChild(sprite);
            }
        };

        // Cool shaded hollows, then warm sunlit rises on top. Kept subtle: any
        // stronger and the brown ones read as mud smears rather than terrain.
        blotch(30, 0x12351a, PIXI.BLEND_MODES.MULTIPLY, 200, 520, 0.18, 0.34);
        blotch(10, 0x7a6540, PIXI.BLEND_MODES.MULTIPLY, 120, 260, 0.06, 0.12);
        blotch(28, 0xfff3c4, PIXI.BLEND_MODES.SCREEN, 200, 480, 0.09, 0.2);

        this.terrainShading = shading;
        this.worldContainer.addChildAt(shading, 1);
    }

    createDecor(mapWidth, mapHeight) {
        const G = IdleAnts.Graphics;
        const rand = G.rng(31415926);
        const decor = new PIXI.Container();

        // The nest sits at map centre; keep its surroundings clear so props
        // never obscure the colony or the ants streaming in and out.
        const nest = { x: mapWidth / 2, y: mapHeight / 2, clear: 130 };
        const areaFactor = (mapWidth * mapHeight) / 1e6;

        const entries = Object.entries(IdleAnts.Managers.BackgroundManager.DECOR_DENSITY);
        for (const [name, density] of entries) {
            const texture = this.assetManager.getTexture(name);
            if (!texture) continue;

            const tints = IdleAnts.Managers.BackgroundManager.DECOR_TINTS[name] || [0xffffff];
            const count = Math.round(density * areaFactor);

            for (let i = 0; i < count; i++) {
                const x = G.range(rand, 20, mapWidth - 20);
                const y = G.range(rand, 20, mapHeight - 20);
                if (Math.hypot(x - nest.x, y - nest.y) < nest.clear) continue;

                const sprite = new PIXI.Sprite(texture);
                sprite.anchor.set(0.5, 0.5);
                sprite.position.set(x, y);
                sprite.scale.set(G.range(rand, 0.6, 1.35));
                // Flat ground litter can point anywhere; things that "grow"
                // stay upright and only wobble a little.
                const flat = name === 'decorLeaf' || name === 'decorTwig' ||
                             name === 'decorPebble' || name === 'decorRock' ||
                             name === 'decorClover';
                sprite.rotation = flat ? rand() * Math.PI * 2 : G.range(rand, -0.22, 0.22);
                if (rand() > 0.5) sprite.scale.x *= -1;
                sprite.tint = G.pick(rand, tints);
                sprite.alpha = G.range(rand, 0.82, 1);
                decor.addChild(sprite);
            }
        }

        // Depth cue: draw props further "back" (higher on screen) first so
        // nearer ones overlap them.
        decor.children.sort((a, b) => a.y - b.y);

        this.decor = decor;
        this.worldContainer.addChildAt(decor, 2);
    }

    createMapBorder(width, height, interiorGrid = true) {
        const border = new PIXI.Graphics();

        // Darkened, softening band just inside the edge so the map fades out
        // instead of ending at a hard line.
        for (let i = 0; i < 5; i++) {
            const inset = i * 9;
            border.lineStyle(10, 0x12240f, 0.1 + i * 0.06);
            border.drawRect(inset, inset, width - inset * 2, height - inset * 2);
        }

        // Crisp outer frame.
        border.lineStyle(4, 0x1b2b14, 0.85);
        border.drawRect(0, 0, width, height);

        if (interiorGrid) {
            border.lineStyle(1, 0x333333, 0.3);
            for (let x = 500; x < width; x += 500) {
                border.moveTo(x, 0);
                border.lineTo(x, height);
            }
            for (let y = 500; y < height; y += 500) {
                border.moveTo(0, y);
                border.lineTo(width, y);
            }
        }

        this.worldContainer.addChild(border);
    }

    /**
     * Screen-space finishing pass. Two parts:
     *  - a colour grade on the world (slight contrast + saturation lift)
     *  - a vignette and warm key-light gradient drawn over the world but under
     *    the minimap and UI layers.
     */
    createLighting() {
        const grade = new PIXI.ColorMatrixFilter();
        grade.saturate(0.12, true);
        grade.contrast(0.09, true);
        grade.brightness(1.02, true);
        this.worldContainer.filters = [grade];
        // Without an explicit filter area PIXI would allocate a render target
        // covering the entire 3000x2000 world instead of just the viewport.
        this.worldContainer.filterArea = this.app.screen;

        this.lightingContainer = new PIXI.Container();
        // Purely decorative, and it covers the screen - never let it eat clicks.
        this.lightingContainer.eventMode = 'none';
        this.lightingContainer.interactiveChildren = false;

        this.vignette = new PIXI.Sprite(this.vignetteTexture());
        this.lightingContainer.addChild(this.vignette);

        this.keyLight = new PIXI.Sprite(this.keyLightTexture());
        this.keyLight.blendMode = PIXI.BLEND_MODES.ADD;
        this.keyLight.alpha = 0.16;
        this.lightingContainer.addChild(this.keyLight);

        // Insert directly above the world so the minimap and title screen,
        // which are added to the stage later, stay on top.
        const worldIndex = this.app.stage.getChildIndex(this.worldContainer);
        this.app.stage.addChildAt(this.lightingContainer, worldIndex + 1);

        this.resizeLighting();
    }

    vignetteTexture() {
        // Painted once at a fixed size and stretched: a vignette is smooth by
        // nature, so the resampling is invisible.
        return IdleAnts.Graphics.canvasTexture(256, 256, (ctx) => {
            const g = ctx.createRadialGradient(128, 128, 40, 128, 128, 168);
            g.addColorStop(0, 'rgba(0,0,0,0)');
            g.addColorStop(0.55, 'rgba(6,14,4,0.10)');
            g.addColorStop(0.8, 'rgba(6,14,4,0.28)');
            g.addColorStop(1, 'rgba(4,10,3,0.52)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 256, 256);
        });
    }

    keyLightTexture() {
        // Warm light falling from the upper left, matching prop/entity shading.
        return IdleAnts.Graphics.canvasTexture(256, 256, (ctx) => {
            const g = ctx.createRadialGradient(70, 50, 0, 70, 50, 260);
            g.addColorStop(0, 'rgba(255,240,190,0.85)');
            g.addColorStop(0.45, 'rgba(255,232,170,0.30)');
            g.addColorStop(1, 'rgba(255,220,150,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 256, 256);
        });
    }

    resizeLighting() {
        if (!this.lightingContainer) return;
        const w = this.app.screen.width;
        const h = this.app.screen.height;
        this.vignette.width = w;
        this.vignette.height = h;
        this.keyLight.width = w;
        this.keyLight.height = h;
        this.worldContainer.filterArea = this.app.screen;
    }
};
