// src/entities/CricketEnemy.js
if(typeof IdleAnts==='undefined') IdleAnts={};
if(typeof IdleAnts.Entities==='undefined') IdleAnts.Entities={};

// Fast-moving hopping cricket enemy
IdleAnts.Entities.CricketEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        // Use custom drawn body
        this.texture = PIXI.Texture.EMPTY;
        this.createBody();

        // Enemy name for tooltip
        this.enemyName = "Cricket";

        // Stats – faster, lower HP than grasshopper
        this.speed = 1.8;
        this.hopSpeed = 15;            // pixels per frame burst
        this.maxHp = 50;
        this.hp = this.maxHp;
        this.attackDamage = 5;
        this.updateHealthBar();

        // Hop behaviour
        this.hopCooldown = 120; // 2 s
        this.hopTimer = Math.floor(Math.random()*this.hopCooldown);
    }

    createBody(){
        const A = IdleAnts.Art;
        const g = new PIXI.Graphics();

        // Crickets are glossier and darker than grasshoppers - near-black
        // chestnut with a strong sheen, which is what distinguishes the two
        // silhouettes at a glance.
        const SHELL = 0x5A3A1E;
        const DARK = 0x33200F;

        this.createShadow(9, 7, 0.28);

        // Tapered abdomen.
        A.segmentedAbdomen(g, {
            x: 0, y: -2, length: 15, width: 4.8, count: 5,
            colors: [SHELL], taper: 0.7, outlineWidth: 0.5
        });

        // Glossy wing covers folded flat over the back, overlapping at centre.
        for (const dir of [-1, 1]) {
            A.volume(g, {
                x: dir * 1.9, y: 0, rx: 2.3, ry: 8.5, rot: dir * 0.07,
                color: 0x7A5228, outlineWidth: 0.5, rimAlpha: 0.7
            });
        }
        // The stridulation ridges crickets rub together to chirp.
        g.lineStyle(0.4, DARK, 0.6);
        for (let i = 0; i < 4; i++) {
            g.moveTo(-3.4, -4 + i * 3.4);
            g.lineTo(3.4, -4 + i * 3.4);
        }
        g.lineStyle(0);

        // Pronotum and head.
        A.volume(g, { x: 0, y: -7, rx: 4.2, ry: 5.4, color: DARK, outlineWidth: 0.6 });
        A.volume(g, { x: 0, y: -12.5, rx: 3.6, ry: 4.6, color: SHELL, outlineWidth: 0.6 });

        A.eye(g, -2.4, -13.4, 1.5, { squash: 1.3, innerColor: 0x6A4A18 });
        A.eye(g,  2.4, -13.4, 1.5, { squash: 1.3, innerColor: 0x6A4A18 });
        A.mandibles(g, 0, -15.8, { size: 3.4, color: 0x2A1A0A });

        // Create animated legs
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        this.legs = [];
        const legPositions = [-8, -2, 6]; // front, middle, hind
        
        legPositions.forEach((baseY, idx) => {
            // Left leg
            const leftLeg = new PIXI.Graphics();
            leftLeg.position.set(-4, baseY);
            leftLeg.index = idx;
            leftLeg.side = 'left';
            this.legsContainer.addChild(leftLeg);
            this.legs.push(leftLeg);
            
            // Right leg
            const rightLeg = new PIXI.Graphics();
            rightLeg.position.set(4, baseY);
            rightLeg.index = idx;
            rightLeg.side = 'right';
            this.legsContainer.addChild(rightLeg);
            this.legs.push(rightLeg);
        });
        
        // Crickets have famously long, whip-like antennae - longer than the
        // body, which is the fastest way to tell them from a grasshopper.
        const antennae = new PIXI.Graphics();
        A.antenna(antennae, -1.5, -15, -1, { length: 24, spread: 0.4, width: 1, color: DARK, club: false });
        A.antenna(antennae,  1.5, -15,  1, { length: 24, spread: 0.4, width: 1, color: DARK, club: false });

        this.addChild(g);
        this.addChild(antennae);
        
        // Animation parameters
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.2; // faster than other insects
    }

    update(ants){
        // Animate legs
        if(this.legs) this.animateLegs();
        
        // Target selection handled by base Enemy update later, but we need hopping motion first
        if(this.hopTimer>0){this.hopTimer--;}
        else{
            // Pick new direction – toward target ant if available else random
            let dx,dy;
            if(this.targetAnt && !this.targetAnt.isDead){
                dx=this.targetAnt.x-this.x; dy=this.targetAnt.y-this.y;
            } else {
                const ang=Math.random()*Math.PI*2; dx=Math.cos(ang); dy=Math.sin(ang);
            }
            const d=Math.hypot(dx,dy);
            if(d>0){
                this.vx=(dx/d)*this.hopSpeed;
                this.vy=(dy/d)*this.hopSpeed;
            }
            this.hopTimer=this.hopCooldown;
        }

        // Apply friction to gradually slow until next hop
        this.vx*=0.9; this.vy*=0.9;

        // Rotate toward movement
        if(Math.abs(this.vx)+Math.abs(this.vy)>0.1){
            this.rotation=Math.atan2(this.vy,this.vx)+Math.PI/2;
        }

        super.update(ants);
    }

    animateLegs(){
        this.legPhase += this.legAnimationSpeed;
        const speedMag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        const rate = Math.max(0.1, speedMag*0.3); // more responsive to speed
        this.legPhase += rate;

        const A = IdleAnts.Art;
        const LEG = 0x6B4520;
        const scale = 1.5; // cricket legs are proportionally long

        this.legs.forEach(leg => {
            const phase = this.legPhase + (leg.index * Math.PI/3) + (leg.side==='right' ? Math.PI : 0);
            const move = Math.sin(phase) * 2;
            const bend = Math.max(0, -Math.sin(phase) * 0.7);
            const dir = leg.side === 'left' ? -1 : 1;
            const hind = leg.index === 2;

            leg.clear();

            if (hind) {
                // Swollen jumping femur plus a long thin tibia.
                A.volume(leg, {
                    x: dir * 2.8, y: -1 + move * 0.2,
                    rx: 2.4, ry: 5.6, rot: dir * 0.5,
                    color: 0x7A5228, outlineWidth: 0.5, rimAlpha: 0.6
                });
                A.limb(leg, [
                    [dir * (5 + bend), -4 + move * 0.4],
                    [dir * (10 * scale), 6 * scale / 2 + move],
                    [dir * (8.5 * scale), 6 * scale / 2 + move + 3.5]
                ], 1.4, LEG, { foot: true });
            } else {
                A.limb(leg, [
                    [0, 0],
                    [dir * (3 * scale + bend * 2), move - 1 - bend * 2],
                    [dir * 6 * scale, 4 * scale / 2 + move]
                ], 1.2, LEG, { foot: true });
            }
        });
    }
};