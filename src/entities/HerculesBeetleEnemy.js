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
        const g = new PIXI.Graphics();
        // Realistic hercules beetle colors with metallic sheen
        const shellCol = 0x2F1B14; // very dark brown/black
        const metallicSheen = 0x8B4513; // bronze highlights
        const hornCol = 0x1A0F0A; // almost black horns
        const lightBrown = 0x654321;
        
        // Elytra (wing covers) - characteristic beetle feature
        g.beginFill(shellCol);
        g.drawEllipse(0, 12, 8, 22); // main shell
        g.endFill();
        
        // Elytra seam line down the middle
        g.lineStyle(1, 0x000000, 0.8);
        g.moveTo(0, -2);
        g.lineTo(0, 28);
        
        // Elytra texture lines (beetle wing cover ridges)
        g.lineStyle(0.8, metallicSheen, 0.4);
        for(let i = -1; i <= 1; i += 2){
            g.moveTo(i * 3, 2);
            g.lineTo(i * 3, 26);
            g.moveTo(i * 6, 4);
            g.lineTo(i * 6, 24);
        }
        
        // Metallic highlights on elytra
        g.lineStyle(0);
        g.beginFill(metallicSheen, 0.3);
        g.drawEllipse(-2, 8, 2, 8);
        g.drawEllipse(2, 8, 2, 8);
        g.endFill();
        
        // Pronotum (thorax shield)
        g.beginFill(shellCol);
        g.drawEllipse(0, -6, 7, 10);
        g.endFill();
        
        // Pronotum markings and texture
        g.lineStyle(1, metallicSheen, 0.5);
        g.drawEllipse(0, -6, 5, 7); // inner outline
        g.moveTo(-4, -10);
        g.lineTo(4, -10);
        g.moveTo(-3, -2);
        g.lineTo(3, -2);
        
        // Head capsule - more angular for realism
        g.lineStyle(0);
        g.beginFill(lightBrown);
        g.drawPolygon([
            -5, -14,  // left side
            -4, -20,  // left upper
            0, -22,   // top center
            4, -20,   // right upper
            5, -14,   // right side
            3, -12,   // right lower
            -3, -12   // left lower
        ]);
        g.endFill();
        
        // Head texture
        g.beginFill(metallicSheen, 0.2);
        for(let i = 0; i < 6; i++){
            const x = (Math.random() - 0.5) * 6;
            const y = -17 + (Math.random() - 0.5) * 6;
            g.drawCircle(x, y, 0.5);
        }
        g.endFill();
        
        // Compound eyes - small but visible
        g.beginFill(0x000000);
        g.drawEllipse(-3, -18, 1.5, 2);
        g.drawEllipse(3, -18, 1.5, 2);
        g.endFill();
        
        // Eye highlights
        g.beginFill(0xFFFFFF, 0.4);
        g.drawCircle(-3, -18, 0.6);
        g.drawCircle(3, -18, 0.6);
        g.endFill();
        
        // Mandibles (jaws)
        g.beginFill(hornCol);
        g.drawPolygon([
            -2, -14,
            -4, -16,
            -3, -12
        ]);
        g.drawPolygon([
            2, -14,
            4, -16,
            3, -12
        ]);
        g.endFill();
        
        // Enhanced twin horns - Hercules beetle's signature feature
        // Upper horn (larger, more detailed)
        const upperHorn = new PIXI.Graphics();
        upperHorn.beginFill(hornCol);
        upperHorn.drawPolygon([
            -4, -18,   // base left
             4, -18,   // base right
             8, -42,   // mid right
             0, -58,   // tip
            -8, -42    // mid left
        ]);
        upperHorn.endFill();
        
        // Horn ridges and texture
        upperHorn.lineStyle(1, metallicSheen, 0.6);
        upperHorn.moveTo(-2, -22);
        upperHorn.lineTo(0, -50);
        upperHorn.moveTo(2, -22);
        upperHorn.lineTo(0, -50);

        // Lower horn (smaller, more curved)
        const lowerHorn = new PIXI.Graphics();
        lowerHorn.beginFill(hornCol);
        lowerHorn.drawPolygon([
            -3, -18,   // base left
             3, -18,   // base right
             8,  6,    // downward mid
             0, 12,    // lower tip
            -8,  6     // mid left
        ]);
        lowerHorn.endFill();
        
        // Lower horn ridges
        lowerHorn.lineStyle(1, metallicSheen, 0.4);
        lowerHorn.moveTo(-1, -14);
        lowerHorn.lineTo(0, 8);
        lowerHorn.moveTo(1, -14);
        lowerHorn.lineTo(0, 8);

        // Short, club-like antennae (beetle characteristic)
        const antennae = new PIXI.Graphics();
        antennae.lineStyle(1.5, lightBrown);
        // Left antenna
        antennae.moveTo(-2, -20);
        antennae.lineTo(-4, -26);
        // Right antenna
        antennae.moveTo(2, -20);
        antennae.lineTo(4, -26);
        
        // Antenna clubs
        antennae.lineStyle(0);
        antennae.beginFill(lightBrown);
        antennae.drawEllipse(-4, -28, 1.5, 3);
        antennae.drawEllipse(4, -28, 1.5, 3);
        antennae.endFill();

        // Legs – create animated legs similar to ants but larger
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);

        this.legs = [];
        const legPositions = [ -6, 2, 12 ]; // Y positions for front, middle, hind

        legPositions.forEach((baseY, idx)=>{
            // left leg
            const leftLeg = new PIXI.Graphics();
            leftLeg.lineStyle(2, shellCol);
            leftLeg.position.set(-8, baseY);
            leftLeg.baseY = baseY;
            leftLeg.index = idx;
            leftLeg.side = 'left';
            this.legsContainer.addChild(leftLeg);
            this.legs.push(leftLeg);

            // right leg
            const rightLeg = new PIXI.Graphics();
            rightLeg.lineStyle(2, shellCol);
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
            leg.lineStyle(2, 0x4E342E);
            leg.moveTo(0,0);
            let midX, midY, endX, endY;
            const scale = 2; // bigger than ants
            if(leg.side==='left'){
                midX = -4*scale - bendFactor*3;
                midY = legMove - 2 - bendFactor*3;
                endX = -8*scale;
                endY = -5*scale/2 + legMove;
            } else {
                midX = 4*scale + bendFactor*3;
                midY = legMove - 2 - bendFactor*3;
                endX = 8*scale;
                endY = -5*scale/2 + legMove;
            }
            leg.lineTo(midX, midY);
            leg.lineTo(endX, endY);
        });
    }
}; 