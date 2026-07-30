// src/entities/BeeEnemy.js
if(typeof IdleAnts==='undefined') IdleAnts={};
if(typeof IdleAnts.Entities==='undefined') IdleAnts.Entities={};

// Flying bee enemy: moderate power, wanders and chases ants
IdleAnts.Entities.BeeEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        this.texture = PIXI.Texture.EMPTY;
        this.createBody();
        this.createWings();
        this.scale.set(1.4);

        // Enemy name for tooltip
        this.enemyName = "Bee";

        // Stats
        this.speed = 2.0;
        this.attackDamage = 8;
        this.maxHp = 80;
        this.hp = this.maxHp;
        this.updateHealthBar();

        // Flight bobbing
        this.bobPhase = Math.random()*Math.PI*2;

        // wing animation
        this.wingPhase = Math.random()*Math.PI*2;
        this.wingAnimationSpeed = 0.6;
    }

    createBody(){
        const A = IdleAnts.Art;
        const g = new PIXI.Graphics();

        const AMBER = 0xF0B429;
        const BAND = 0x2A1B0C;
        const FUZZ = 0xFFE9A8;

        // Bees hover, so their shadow sits further away and softer than a
        // ground-walking enemy's.
        this.createShadow(9, 7, 0.2);

        // Abdomen: one tapered amber volume with black bands painted over it.
        // Stacking alternating-colour segments (the obvious approach) does not
        // work - each segment's dark outline covers the band above it and the
        // whole thing muddies into brown.
        A.volume(g, { x: 0, y: 8, rx: 5.6, ry: 10, color: AMBER, outlineWidth: 0.8 });
        g.beginFill(BAND);
        for (let i = 0; i < 3; i++) {
            const by = 3.2 + i * 4.6;
            // Band width follows the abdomen's taper.
            const t = (by - 8) / 10;
            const w = 5.6 * Math.sqrt(Math.max(0.08, 1 - t * t));
            g.drawPolygon(A.ellipsePath(0, by, w, 1.5, 0, 18));
        }
        g.endFill();
        // Warm rim down the lit side of the abdomen.
        g.beginFill(0xFFE08A, 0.45);
        g.drawPolygon(A.ellipsePath(-2, 5, 1.6, 5, -0.1, 16));
        g.endFill();

        // Sting.
        g.beginFill(0x1A1005);
        g.drawPolygon([-1.1, 17, 1.1, 17, 0, 21.5]);
        g.endFill();

        // Thorax - the fuzziest part of a bee. The pile is short and warm; long
        // pale hairs turn the bee into a sunburst at gameplay scale.
        A.fuzz(g, { x: 0, y: -4, rx: 6, ry: 7.8, color: 0xD9A63E, count: 30, length: 1.9, width: 0.8, alpha: 0.75, seed: 21 });
        A.volume(g, { x: 0, y: -4, rx: 6, ry: 8, color: 0xA8781F, outlineWidth: 0.7 });
        // A pale collar of fluff where thorax meets head, as on a real bee.
        A.fuzz(g, { x: 0, y: -8, rx: 3.6, ry: 2.2, color: FUZZ, count: 14, length: 1.5, width: 0.7, alpha: 0.5, seed: 22 });

        // Head.
        A.volume(g, { x: 0, y: -14, rx: 4.6, ry: 5.6, color: 0x33220E, outlineWidth: 0.6 });

        // Bees' compound eyes wrap around the sides of the head.
        A.eye(g, -3.6, -14.4, 2, { squash: 1.5, innerColor: 0x6B4A1E, rot: -0.3 });
        A.eye(g,  3.6, -14.4, 2, { squash: 1.5, innerColor: 0x6B4A1E, rot:  0.3 });

        // Proboscis.
        g.beginFill(0x5A3A16);
        g.drawPolygon([-0.8, -17.5, 0.8, -17.5, 0, -21]);
        g.endFill();

        // Elbowed antennae.
        const antennae = new PIXI.Graphics();
        A.antenna(antennae, -2, -17, -1, { length: 11, spread: 0.7, width: 1.2, color: BAND });
        A.antenna(antennae,  2, -17,  1, { length: 11, spread: 0.7, width: 1.2, color: BAND });

        this.addChild(g);
        this.addChild(antennae);
    }

    createWings(){
        const A = IdleAnts.Art;
        this.wingsContainer = new PIXI.Container();
        this.addChild(this.wingsContainer);

        // Proper teardrop wings with veins, rather than plain white ellipses.
        const shape = (dir) => [
            0, 0,
            dir * 4, -3.2,
            dir * 10, -2.6,
            dir * 13, 0.4,
            dir * 9.5, 3.4,
            dir * 3.5, 3
        ];
        const veins = (dir) => [
            [dir * 1.5, -0.6, dir * 11, -1.4],
            [dir * 2, 0.8, dir * 10, 1.6],
            [dir * 5, -2.4, dir * 6, 2.4]
        ];

        this.leftWing = new PIXI.Graphics();
        A.wing(this.leftWing, shape(-1), { alpha: 0.4, veins: veins(-1), edgeAlpha: 0.6 });
        this.leftWing.position.set(-5, -5);

        this.rightWing = new PIXI.Graphics();
        A.wing(this.rightWing, shape(1), { alpha: 0.4, veins: veins(1), edgeAlpha: 0.6 });
        this.rightWing.position.set(5, -5);

        this.wingsContainer.addChild(this.leftWing);
        this.wingsContainer.addChild(this.rightWing);
    }

    update(ants){
        // slight vertical bob
        this.bobPhase += 0.25;
        this.y += Math.sin(this.bobPhase)*0.4;

        // Wing flap animation. Floored well above zero so the wings never
        // collapse to an invisible line at the bottom of the stroke - a blur of
        // motion reads better than a wing that disappears every other frame.
        this.wingPhase += this.wingAnimationSpeed;
        const flap = 0.45 + (Math.sin(this.wingPhase)*0.5 + 0.5) * 0.55;
        if(this.leftWing){
            this.leftWing.scale.y = flap;
            this.rightWing.scale.y = flap;
        }

        // Call base movement/AI after adjusting bobbing offset so collision is consistent
        super.update(ants);

        // Rotate sprite toward movement direction so bee faces travel vector
        const speedMag = Math.abs(this.vx) + Math.abs(this.vy);
        if(speedMag > 0.1){
            this.rotation = Math.atan2(this.vy, this.vx) + Math.PI/2;
        }

        // Wings now rotate with the bee because container inherits rotation
    }
}; 