// src/entities/GrasshopperEnemy.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

IdleAnts.Entities.GrasshopperEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        // Replace placeholder texture with empty so only graphics show
        this.texture = PIXI.Texture.EMPTY;
        // Add custom body graphics
        this.createBody();

        // Enemy name for tooltip
        this.enemyName = "Grasshopper";

        this.scale.set(2.0); // big
        this.speed = 2.0; // faster crawl speed
        this.attackDamage = 10;
        this.maxHp = 200;
        this.hp=this.maxHp;
        this.updateHealthBar();

        // Hopping behaviour
        this.hopCooldown = 180; // frames between hops (~3s)
        this.hopTimer = Math.floor(Math.random()*this.hopCooldown);
        this.hopSpeed = 20; // velocity applied during hop

        // Leg animation parameters
        this.legPhase = Math.random()*Math.PI*2;
        this.legAnimationSpeed = 0.1;
    }

    update(ants){
        // If we have a target ant from base logic, hop towards it
        if(this.targetAnt && !this.targetAnt.isDead){
            if(this.hopTimer>0){this.hopTimer--;}
            else{
                const dx=this.targetAnt.x-this.x;
                const dy=this.targetAnt.y-this.y;
                const dist=Math.sqrt(dx*dx+dy*dy);
                if(dist>0){
                    this.vx = (dx/dist)*this.hopSpeed;
                    this.vy = (dy/dist)*this.hopSpeed;
                }
                this.hopTimer=this.hopCooldown;
            }
        } else {
            // Random hop wander when no target
            if(this.hopTimer>0){this.hopTimer--;}
            else {
                const ang=Math.random()*Math.PI*2;
                this.vx=Math.cos(ang)*this.hopSpeed;
                this.vy=Math.sin(ang)*this.hopSpeed;
                this.hopTimer=this.hopCooldown;
            }
        }
        // Apply friction
        this.vx*=0.95; this.vy*=0.95;
        // Rotate sprite toward movement direction
        if(Math.abs(this.vx) + Math.abs(this.vy) > 0.1){
            this.rotation = Math.atan2(this.vy,this.vx) + Math.PI/2;
        }
        // animate legs each frame
        if(this.legs) this.animateLegs();
        super.update(ants);

        if(this.targetAnt && !this.targetAnt.isDead){
            const dx2=this.targetAnt.x-this.x;
            const dy2=this.targetAnt.y-this.y;
            const dist2=Math.sqrt(dx2*dx2+dy2*dy2);
            if(dist2<=this.attackRange){
                this.vx=this.vy=0;
                if(this._attackTimer===0){
                    this.targetAnt.takeDamage(this.attackDamage);
                    this._attackTimer=this.attackCooldown;
                }
            }
        }
    }

    createBody(){
        const A = IdleAnts.Art;

        this.createShadow(15, 11, 0.3);

        // Container for legs (drawn first so the body sits on top)
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);

        this.legs = [];
        const legBaseYs = [ -2, 2, 8 ]; // front, middle, hind

        legBaseYs.forEach((y, idx)=>{
            ['left','right'].forEach(side=>{
                const leg = new PIXI.Graphics();
                leg.position.set(side === 'left' ? -5 : 5, y);
                leg.index = idx;
                leg.side = side;
                this.legsContainer.addChild(leg);
                this.legs.push(leg);
            });
        });

        const body = new PIXI.Graphics();
        const GREEN = 0x6FA83A;
        const DARK = 0x3E6B22;
        const STRAW = 0xC2B268;

        // Long tapering abdomen built from overlapping segments.
        A.segmentedAbdomen(body, {
            x: 0, y: 2, length: 22, width: 6.2, count: 6,
            colors: [GREEN], taper: 0.75, outlineWidth: 0.6
        });

        // Wing cases (tegmina) laid over the abdomen at a slight splay.
        for (const dir of [-1, 1]) {
            A.volume(body, {
                x: dir * 3.1, y: 9, rx: 2.6, ry: 13, rot: dir * 0.09,
                color: STRAW, outlineWidth: 0.6, rimAlpha: 0.5
            });
            // Veining along the wing case.
            body.lineStyle(0.45, IdleAnts.Graphics.shade(STRAW, 0.6), 0.55);
            body.moveTo(dir * 3.1, -2);
            body.lineTo(dir * 3.4, 20);
            body.moveTo(dir * 2.1, 0);
            body.lineTo(dir * 2.4, 18);
            body.lineStyle(0);
        }

        // Pronotum (the saddle-shaped plate over the thorax) - a grasshopper's
        // most recognisable feature from above.
        A.volume(body, { x: 0, y: -3, rx: 5.6, ry: 8, color: DARK, outlineWidth: 0.8 });
        body.lineStyle(0.7, IdleAnts.Graphics.shade(DARK, 1.5), 0.6);
        body.moveTo(-4.6, -7); body.lineTo(-4.2, 3);
        body.moveTo(4.6, -7); body.lineTo(4.2, 3);
        body.moveTo(0, -10); body.lineTo(0, 3);
        body.lineStyle(0);

        // Head, angled forward the way a grasshopper's slopes.
        A.volume(body, { x: 0, y: -13.5, rx: 4.4, ry: 6.2, color: GREEN, outlineWidth: 0.8 });

        // The big oval compound eyes sit high and wide on the head.
        A.eye(body, -3.2, -15, 2, { squash: 1.5, innerColor: 0x8A6B2A, rot: -0.25 });
        A.eye(body,  3.2, -15, 2, { squash: 1.5, innerColor: 0x8A6B2A, rot:  0.25 });

        A.mandibles(body, 0, -18.5, { size: 4.5, color: 0x4A3A16 });

        // Long thread-like antennae.
        const antennae = new PIXI.Graphics();
        A.antenna(antennae, -2, -18, -1, { length: 22, spread: 0.42, width: 1.1, color: DARK, club: false });
        A.antenna(antennae,  2, -18,  1, { length: 22, spread: 0.42, width: 1.1, color: DARK, club: false });

        this.addChild(body);
        this.addChild(antennae);
    }

    animateLegs(){
        const A = IdleAnts.Art;
        this.legPhase += this.legAnimationSpeed;
        const speedMag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        this.legPhase += Math.max(0.05, speedMag*0.25);

        const GREEN = 0x6FA83A;
        const DARK = 0x4E7F28;
        const scale = 1.8;

        this.legs.forEach(leg=>{
            const phase = this.legPhase + (leg.index*Math.PI/3) + (leg.side==='right'?Math.PI:0);
            const move = Math.sin(phase)*2.5;
            const bend = Math.max(0, -Math.sin(phase));
            const dir = leg.side==='left' ? -1 : 1;
            const hind = leg.index === 2;

            leg.clear();

            if (hind) {
                // Hind leg: the huge jumping femur, a thin angled tibia, and a
                // foot - drawn as a proper Z rather than one straight line.
                const kneeX = dir * (7 + bend * 1.5);
                const kneeY = -6 + move * 0.4;
                A.volume(leg, {
                    x: dir * 3.6, y: -1 + move * 0.2,
                    rx: 3.1, ry: 7.4, rot: dir * 0.55,
                    color: GREEN, outlineWidth: 0.7, rimAlpha: 0.5
                });
                A.limb(leg, [
                    [kneeX, kneeY],
                    [dir * (12 + bend), 6 + move],
                    [dir * (9 + bend * 2), 15 + move]
                ], 1.8, DARK, { foot: true });
                // Spines along the tibia.
                leg.lineStyle(0.6, IdleAnts.Graphics.shade(DARK, 0.5), 0.8);
                for (let s = 1; s <= 3; s++) {
                    const t = s / 4;
                    const px = kneeX + (dir * (12 + bend) - kneeX) * t;
                    const py = kneeY + (6 + move - kneeY) * t;
                    leg.moveTo(px, py);
                    leg.lineTo(px + dir * 2, py - 1.5);
                }
                leg.lineStyle(0);
            } else {
                A.limb(leg, [
                    [0, 0],
                    [dir * (4 * scale + bend * 2), move - 2 - bend * 2],
                    [dir * 8 * scale, 6 * scale / 3 + move]
                ], 1.5, GREEN, { foot: true });
            }
        });
    }
};