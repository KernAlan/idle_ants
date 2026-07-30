// src/entities/HerculesBeetleEnemy.js
if(typeof IdleAnts==='undefined') IdleAnts={};
if(typeof IdleAnts.Entities==='undefined') IdleAnts.Entities={};

// Hercules beetle enemy – tanky powerhouse between grasshopper and mantis
IdleAnts.Entities.HerculesBeetleEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        this.texture = PIXI.Texture.EMPTY;
        this.createBody();
        
        // Enemy name for tooltip
        this.enemyName = "Hercules Beetle";
        
        this.scale.set(2.2); // bigger than grasshopper, smaller than mantis

        // Combat stats (between grasshopper and mantis)
        this.speed = 1.2;
        this.chargeSpeed = 12; // dash/charge speed
        this.attackDamage = 15;
        this.attackRange = 22;
        this.maxHp = 230;
        this.hp = this.maxHp;
        this.updateHealthBar();

        // charge behaviour timers
        this.chargeCooldown = 260; // ~4.3 seconds
        this.chargeTimer = Math.floor(Math.random()*this.chargeCooldown);

        // Leg animation parameters
        this.legPhase = Math.random()*Math.PI*2;
        this.legAnimationSpeed = 0.1; // slower gait than ants
    }

    createBody(){
        const A = IdleAnts.Art;
        const Gr = IdleAnts.Graphics;
        const g = new PIXI.Graphics();

        // Hercules beetles are olive-bronze with a hard gloss, not the flat
        // near-black the old sprite used - the sheen is the whole character.
        const SHELL = 0x6B5A2A;
        const SHELL_DARK = 0x2A2110;
        const HORN = 0x241A0C;
        const HEAD = 0x3E3116;
        const SHEEN = 0xD8C87A;

        this.createShadow(20, 26, 0.34);

        // Elytra (wing covers) - one big glossy dome.
        A.volume(g, { x: 0, y: 12, rx: 8.5, ry: 22, color: SHELL, outlineWidth: 1.1, rimAlpha: 0.7 });

        // Seam down the middle and the longitudinal ridges.
        g.lineStyle(1.2, SHELL_DARK, 0.9);
        g.moveTo(0, -8); g.lineTo(0, 32);
        g.lineStyle(0.7, Gr.shade(SHELL, 0.65), 0.6);
        for (const i of [-1, 1]) {
            g.moveTo(i * 3.2, 0); g.lineTo(i * 3.4, 28);
            g.moveTo(i * 6, 3); g.lineTo(i * 6.2, 24);
        }
        g.lineStyle(0);

        // Hard specular streak - what makes chitin look lacquered.
        g.beginFill(SHEEN, 0.35);
        g.drawPolygon(A.ellipsePath(-3.4, 5, 2.2, 9, -0.06, 20));
        g.endFill();
        g.beginFill(0xFFFFFF, 0.22);
        g.drawPolygon(A.ellipsePath(-3.8, 2, 1.1, 5.2, -0.06, 16));
        g.endFill();

        // Black speckling, characteristic of the species.
        const rand = Gr.rng(88);
        g.beginFill(SHELL_DARK, 0.55);
        for (let i = 0; i < 14; i++) {
            const a = rand() * Math.PI * 2;
            const r = Math.sqrt(rand());
            g.drawCircle(Math.cos(a) * r * 7, 12 + Math.sin(a) * r * 19, 0.7 + rand() * 1.3);
        }
        g.endFill();

        // Pronotum (thorax shield).
        A.volume(g, { x: 0, y: -6, rx: 7.2, ry: 10, color: Gr.shade(SHELL, 0.8), outlineWidth: 1 });

        // Head capsule.
        A.volume(g, { x: 0, y: -16, rx: 4.8, ry: 5.6, color: HEAD, outlineWidth: 0.8 });
        A.eye(g, -3.2, -17.5, 1.4, { squash: 1.3, innerColor: 0x7A6428 });
        A.eye(g,  3.2, -17.5, 1.4, { squash: 1.3, innerColor: 0x7A6428 });

        // Twin horns - the signature. Built as shaded polygons with a lit
        // upper-left facet and a ridged spine, so they read as solid chitin.
        const horn = (pts, litPts) => {
            const h = new PIXI.Graphics();
            h.beginFill(Gr.shade(HORN, 0.5));
            h.drawPolygon(pts.map((v, i) => i % 2 === 0 ? v * 1.14 : v * 1.03));
            h.endFill();
            h.beginFill(HORN);
            h.drawPolygon(pts);
            h.endFill();
            h.beginFill(Gr.shade(HORN, 2.6), 0.75);
            h.drawPolygon(litPts);
            h.endFill();
            h.beginFill(SHEEN, 0.3);
            h.drawPolygon(litPts.map((v, i) => i % 2 === 0 ? v * 0.45 : v));
            h.endFill();
            return h;
        };

        // The two horns form forward-facing pincers, which is what a Hercules
        // beetle actually looks like from above. Both sweep FORWARD (-Y) with a
        // gap between them; drawing one of them sweeping back over the elytra
        // just hid the shell.
        //
        // Thoracic horn: the long upper one, curving in toward the centreline.
        const upperHorn = horn(
            [-4.6, -18, 3.2, -19, 4.2, -30, 1.4, -40, -1.6, -45, -1.4, -37, -6.2, -28],
            [-3.6, -20, -1.2, -21, -1.4, -40, -3, -29]
        );
        // Serrations along the inner (gripping) edge.
        upperHorn.lineStyle(0.9, Gr.shade(HORN, 2.2), 0.55);
        for (let i = 0; i < 3; i++) {
            const t = 0.25 + i * 0.22;
            upperHorn.moveTo(3.2 - t * 3, -20 - t * 22);
            upperHorn.lineTo(1.4 - t * 2.6, -21 - t * 22);
        }
        upperHorn.lineStyle(0);

        // Cephalic horn: shorter, below the thoracic one, curving up to meet it
        // so the pair reads as a working set of jaws.
        const lowerHorn = horn(
            [-3, -15, 3.6, -15, 6.4, -24, 5.6, -33, 3.4, -30, 2.4, -23, -2.4, -20],
            [-2.2, -16, 0.4, -16, 3.6, -30, 1.4, -22]
        );

        // Short club-tipped antennae.
        const antennae = new PIXI.Graphics();
        A.antenna(antennae, -3, -18.5, -1, { length: 8, spread: 0.8, width: 1.3, color: HEAD });
        A.antenna(antennae,  3, -18.5,  1, { length: 8, spread: 0.8, width: 1.3, color: HEAD });

        // Legs – create animated legs similar to ants but larger
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);

        this.legs = [];
        const legPositions = [ -6, 2, 12 ]; // Y positions for front, middle, hind

        legPositions.forEach((baseY, idx)=>{
            // left leg
            // No initial lineStyle: animateLegs() clears and redraws these
            // every frame with its own styling.
            const leftLeg = new PIXI.Graphics();
            leftLeg.position.set(-8, baseY);
            leftLeg.baseY = baseY;
            leftLeg.index = idx;
            leftLeg.side = 'left';
            this.legsContainer.addChild(leftLeg);
            this.legs.push(leftLeg);

            // right leg
            const rightLeg = new PIXI.Graphics();
            rightLeg.position.set(8, baseY);
            rightLeg.baseY = baseY;
            rightLeg.index = idx;
            rightLeg.side = 'right';
            this.legsContainer.addChild(rightLeg);
            this.legs.push(rightLeg);
        });

        // Add all components
        this.addChild(g);
        this.addChild(antennae);
        this.addChild(upperHorn);
        this.addChild(lowerHorn);
    }

    update(ants){
        // Animate legs each frame
        if(this.legs) this.animateLegs();

        // Handle charge dash toward target ant
        if(this.chargeTimer>0){
            this.chargeTimer--; // cooldown counting down
        }else{
            if(this.targetAnt && !this.targetAnt.isDead){
                const dx=this.targetAnt.x-this.x;
                const dy=this.targetAnt.y-this.y;
                const d=Math.hypot(dx,dy);
                if(d>0){
                    this.vx=(dx/d)*this.chargeSpeed;
                    this.vy=(dy/d)*this.chargeSpeed;
                }
            }
            this.chargeTimer=this.chargeCooldown;
        }

        // Apply friction to movement
        this.vx*=0.93;
        this.vy*=0.93;

        // Rotate body toward movement direction
        if(Math.abs(this.vx)+Math.abs(this.vy)>0.1){
            this.rotation = Math.atan2(this.vy,this.vx) + Math.PI/2;
        }

        // call Enemy base update (handles targeting, combat, boundaries, etc.)
        super.update(ants);
    }

    animateLegs(){
        // Update leg phase
        this.legPhase += this.legAnimationSpeed;

        // Movement speed influence
        const speedMag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        const animationRate = Math.max(0.05, speedMag * 0.2);
        this.legPhase += animationRate;

        // For each leg graphic recreate shape
        this.legs.forEach(leg=>{
            const phase = this.legPhase + (leg.index * Math.PI / 3) + (leg.side==='right'?Math.PI:0);
            const legMove = Math.sin(phase) * 3; // amplitude
            const bendFactor = Math.max(0, -Math.sin(phase));

            leg.clear();
            const scale = 2; // bigger than ants
            const dir = leg.side === 'left' ? -1 : 1;

            // Thick, powerful beetle legs with a spined tibia.
            IdleAnts.Art.limb(leg, [
                [0, 0],
                [dir * (4*scale + bendFactor*3), legMove - 2 - bendFactor*3],
                [dir * 8*scale, -5*scale/2 + legMove]
            ], 2.6, 0x4A3A18, { foot: true });

            leg.lineStyle(0.9, 0x1E1608, 0.8);
            for (let s = 1; s <= 2; s++) {
                const t = s / 3;
                const px = dir * (4*scale + bendFactor*3) * (1 - t) + dir * 8*scale * t;
                const py = (legMove - 2 - bendFactor*3) * (1 - t) + (-5*scale/2 + legMove) * t;
                leg.moveTo(px, py);
                leg.lineTo(px + dir * 2.4, py + 1.8);
            }
            leg.lineStyle(0);
        });
    }
}; 