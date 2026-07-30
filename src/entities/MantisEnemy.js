// src/entities/MantisEnemy.js
if(typeof IdleAnts==='undefined') IdleAnts={};
if(typeof IdleAnts.Entities==='undefined') IdleAnts.Entities={};

// Large, powerful praying mantis enemy
IdleAnts.Entities.MantisEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        this.texture = PIXI.Texture.EMPTY;
        this.createBody();
        this.scale.set(2.5); // Larger and more intimidating than grasshopper (which is 2.0)

        // Enemy name for tooltip
        this.enemyName = "Praying Mantis";

        // Stats – slow but deadly
        this.speed = 1.0;
        this.dashSpeed = 5;
        this.attackDamage = 20;
        this.attackRange = 25;
        this.maxHp = 300;
        this.hp = this.maxHp;
        this.updateHealthBar();

        // Dash/cooldown for pounce
        this.dashCooldown = 240; // every 4 seconds
        this.dashTimer = Math.floor(Math.random()*this.dashCooldown);

        // Leg animation parameters
        this.legPhase = Math.random()*Math.PI*5;
        this.legAnimationSpeed = 0.03; // slower stride
    }

    createBody(){
        const A = IdleAnts.Art;
        const Gr = IdleAnts.Graphics;
        const g = new PIXI.Graphics();

        // Saturated predatory greens. The old palette was so desaturated the
        // mantis read as a grey ghost against the grass.
        const GREEN = 0x4E8F3C;
        const DARK = 0x2A5722;
        const LIGHT = 0x76B84E;
        const TEGMEN = 0x8FA33F;

        this.createShadow(20, 30, 0.26);

        // Long tapering abdomen.
        A.segmentedAbdomen(g, {
            x: 0, y: 0, length: 40, width: 5.6, count: 8,
            colors: [GREEN], taper: 0.8, outlineWidth: 0.7
        });

        // Leathery forewings folded down the back, slightly splayed.
        for (const dir of [-1, 1]) {
            A.volume(g, {
                x: dir * 2.2, y: 14, rx: 2.6, ry: 19, rot: dir * 0.05,
                color: TEGMEN, outlineWidth: 0.6, rimAlpha: 0.45
            });
            g.lineStyle(0.5, Gr.shade(TEGMEN, 0.6), 0.5);
            g.moveTo(dir * 2.2, -3);
            g.lineTo(dir * 2.8, 31);
            g.lineStyle(0);
        }

        // Elongated prothorax - the mantis's defining "neck".
        A.volume(g, { x: 0, y: -8, rx: 3.8, ry: 13, color: LIGHT, outlineWidth: 0.8 });
        // Ridge down the centre of the prothorax.
        g.lineStyle(0.8, DARK, 0.55);
        g.moveTo(0, -19); g.lineTo(0, 3);
        g.lineStyle(0);

        A.volume(g, { x: 0, y: 3, rx: 5, ry: 7.5, color: GREEN, outlineWidth: 0.7 });

        // The iconic triangular head. Built as a shaded polygon: dark base
        // silhouette, green face, lit upper-left facet.
        const headOutline = [-7, -17, -5, -27, 0, -34, 5, -27, 7, -17, 3.5, -13, -3.5, -13];
        g.beginFill(Gr.shade(LIGHT, 0.42));
        g.drawPolygon(headOutline.map((v, i) => v * (i % 2 === 0 ? 1.1 : 1.06)));
        g.endFill();
        g.beginFill(LIGHT);
        g.drawPolygon(headOutline);
        g.endFill();
        g.beginFill(Gr.shade(LIGHT, 1.25), 0.9);
        g.drawPolygon([-5.4, -18, -3.6, -26, 0, -31.5, 0, -15]);
        g.endFill();

        // Huge angled compound eyes on the corners of the triangle - the single
        // most characterful feature of a mantis.
        A.eye(g, -4.6, -23, 2.8, { squash: 1.45, color: 0x1F3D14, innerColor: 0x7FBF4A, rot: -0.42, specAlpha: 0.95 });
        A.eye(g,  4.6, -23, 2.8, { squash: 1.45, color: 0x1F3D14, innerColor: 0x7FBF4A, rot:  0.42, specAlpha: 0.95 });

        // Three ocelli between the eyes.
        g.beginFill(0x14240D);
        g.drawCircle(-1.4, -29.5, 0.6);
        g.drawCircle(0, -31.5, 0.6);
        g.drawCircle(1.4, -29.5, 0.6);
        g.endFill();

        A.mandibles(g, 0, -15, { size: 4, color: 0x6B5A22 });

        // Raptorial arms - the folded, spined forelegs mantises strike with.
        const makeArm = (dir)=>{
            const s = dir; // -1 left, 1 right
            const arm = new PIXI.Graphics();

            // Coxa, then the thick femur angled up and out.
            A.volume(arm, { x: s * 2, y: -10, rx: 2.2, ry: 4, color: LIGHT, outlineWidth: 0.5 });
            A.volume(arm, { x: s * 6.5, y: -15.5, rx: 2.9, ry: 8, rot: s * -0.75, color: GREEN, outlineWidth: 0.7 });

            // Tibia folded back against the femur, ending in a hooked claw.
            A.limb(arm, [
                [s * 11, -21],
                [s * 16, -34],
                [s * 19.5, -49]
            ], 2.8, DARK, { highlight: true });

            // Grasping spines along the inner edge - what actually catches prey.
            arm.lineStyle({ width: 1.1, color: 0xD8E08A, alpha: 0.9, cap: PIXI.LINE_CAP.ROUND });
            for(let i = 0; i < 5; i++){
                const t = 0.12 + i * 0.19;
                const px = s * (11 + (19.5 - 11) * t);
                const py = -21 + (-49 + 21) * t;
                arm.moveTo(px, py);
                arm.lineTo(px - s * 3.2, py - 1.2);
            }
            arm.lineStyle(0);

            // Hooked tarsal claw.
            arm.beginFill(0x4A3A12);
            arm.drawPolygon([s*19.5, -49, s*26, -60, s*23, -61.5, s*17.5, -51]);
            arm.endFill();
            arm.beginFill(0xC9B96A, 0.75);
            arm.drawPolygon([s*20.5, -50, s*25, -58.5, s*23.5, -59.5, s*19, -51]);
            arm.endFill();

            return arm;
        };

        const armL = makeArm(-1);
        const armR = makeArm(1);

        /* draw body first, then arms so they render on top */
        this.addChild(g);
        this.addChild(armL);
        this.addChild(armR);

        // Hind legs will be animated — create container and leg graphics
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);

        this.hindLegs = [];

        // left hind leg
        const leftLeg = new PIXI.Graphics();
        leftLeg.position.set(-3,8);
        this.legsContainer.addChild(leftLeg);
        this.hindLegs.push({g:leftLeg,side:'left'});

        // right hind leg
        const rightLeg = new PIXI.Graphics();
        rightLeg.position.set(3,8);
        this.legsContainer.addChild(rightLeg);
        this.hindLegs.push({g:rightLeg,side:'right'});

        // Long, thread-like antennae (mantis characteristic)
        const antG = new PIXI.Graphics();
        A.antenna(antG, -2, -32, -1, { length: 27, spread: 0.42, width: 1.1, color: DARK, club: false });
        A.antenna(antG,  2, -32,  1, { length: 27, spread: 0.42, width: 1.1, color: DARK, club: false });
        this.addChild(antG);
    }

    update(ants){
        // Animate hind legs
        if(this.hindLegs) this.animateLegs();

        if(this.dashTimer>0){this.dashTimer--;}
        else{
            // Dash toward closest ant if any
            if(this.targetAnt && !this.targetAnt.isDead){
                const dx=this.targetAnt.x-this.x, dy=this.targetAnt.y-this.y;
                const d=Math.hypot(dx,dy);
                if(d>0){
                    this.vx=(dx/d)*this.dashSpeed;
                    this.vy=(dy/d)*this.dashSpeed;
                }
            }
            this.dashTimer=this.dashCooldown;
        }

        // friction
        this.vx*=0.92; this.vy*=0.92;
        // rotate to movement
        if(Math.abs(this.vx)+Math.abs(this.vy)>0.1){
            this.rotation=Math.atan2(this.vy,this.vx)+Math.PI/2;
        }
        super.update(ants);
    }

    animateLegs(){
        this.legPhase += this.legAnimationSpeed;
        const speedMag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        const rate = Math.max(0.02, speedMag*0.12); // slower, more deliberate
        this.legPhase += rate;

        const A = IdleAnts.Art;
        const GREEN = 0x4E8F3C;
        const scale = 2.2; // longer, more elegant legs

        this.hindLegs.forEach((legObj,idx)=>{
            const legG = legObj.g;
            const dir = legObj.side === 'left' ? -1 : 1;
            const phase = this.legPhase + (idx*Math.PI);
            const lift = Math.sin(phase)*2; // more subtle movement
            const bend = Math.max(0, -Math.sin(phase)*0.8); // less pronounced bend

            legG.clear();

            // Long, elegantly angled walking legs with a distinct knee, foot,
            // and a taper from femur to tarsus.
            A.limb(legG, [
                [0, 0],
                [dir * (8*scale + bend*3), 8*scale/6 + lift - bend*3],
                [dir * 16*scale, 22*scale/6 + lift],
                [dir * (16*scale + 2), 22*scale/6 + lift + 3]
            ], 2.2, GREEN, { foot: true });
        });
    }
};