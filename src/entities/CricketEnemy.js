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
        const g = new PIXI.Graphics();
        // Realistic cricket colors
        const cricketBrown = 0x8B4513;
        const darkBrown = 0x654321;
        const lightBrown = 0xA0522D;
        const blackBrown = 0x2F1B14;
        
        // Cricket body - more elongated and realistic
        g.beginFill(cricketBrown);
        g.drawEllipse(0, 2, 5, 12); // longer, narrower body
        g.endFill();
        
        // Body segments
        g.lineStyle(0.8, darkBrown, 0.6);
        for(let i = 0; i < 4; i++){
            const y = -4 + i * 4;
            g.moveTo(-4, y);
            g.lineTo(4, y);
        }
        
        // Thorax
        g.lineStyle(0);
        g.beginFill(darkBrown);
        g.drawEllipse(0, -6, 4, 6);
        g.endFill();
        
        // Wing covers (tegmina) - crickets have prominent wings
        g.beginFill(lightBrown, 0.8);
        g.drawEllipse(-2, 0, 1.5, 8);
        g.drawEllipse(2, 0, 1.5, 8);
        g.endFill();
        
        // Wing texture
        g.lineStyle(0.5, darkBrown, 0.4);
        g.moveTo(-2, -4);
        g.lineTo(-2, 6);
        g.moveTo(2, -4);
        g.lineTo(2, 6);
        
        // Head - more realistic cricket head shape
        g.lineStyle(0);
        g.beginFill(lightBrown);
        g.drawEllipse(0, -12, 3.5, 5);
        g.endFill();
        
        // Large compound eyes - crickets have prominent eyes
        g.beginFill(0x000000);
        g.drawEllipse(-2.5, -12, 1.5, 2);
        g.drawEllipse(2.5, -12, 1.5, 2);
        g.endFill();
        
        // Eye highlights
        g.beginFill(0xFFFFFF, 0.6);
        g.drawCircle(-2.5, -12.5, 0.6);
        g.drawCircle(2.5, -12.5, 0.6);
        g.endFill();
        
        // Maxillary palps (mouth parts)
        g.beginFill(darkBrown);
        g.drawEllipse(0, -9, 1, 1.5);
        g.endFill();
        
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
        
        // Long antennae - cricket characteristic
        const antennae = new PIXI.Graphics();
        antennae.lineStyle(1.2, darkBrown);
        // Left antenna - long and curved
        antennae.moveTo(-1.5, -15);
        antennae.lineTo(-4, -22);
        antennae.lineTo(-7, -28);
        antennae.lineTo(-9, -35);
        // Right antenna - long and curved
        antennae.moveTo(1.5, -15);
        antennae.lineTo(4, -22);
        antennae.lineTo(7, -28);
        antennae.lineTo(9, -35);
        
        // Antenna segments
        antennae.lineStyle(0);
        antennae.beginFill(darkBrown);
        antennae.drawCircle(-4, -22, 0.4);
        antennae.drawCircle(-7, -28, 0.4);
        antennae.drawCircle(4, -22, 0.4);
        antennae.drawCircle(7, -28, 0.4);
        antennae.endFill();
        
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

        const legColor = 0x654321;
        const scale = 1.5; // cricket legs are proportionally long

        this.legs.forEach(leg => {
            const phase = this.legPhase + (leg.index * Math.PI/3) + (leg.side==='right' ? Math.PI : 0);
            const move = Math.sin(phase) * 2;
            const bend = Math.max(0, -Math.sin(phase) * 0.7);

            leg.clear();
            
            // Hind legs are much more powerful for jumping
            const thickness = leg.index === 2 ? 2.5 : 1.5;
            leg.lineStyle(thickness, legColor);
            leg.moveTo(0, 0);

            let midX, midY, endX, endY;
            if(leg.side === 'left'){
                midX = (leg.index === 2 ? -5 : -3) * scale - bend * 2;
                midY = move - 1 - bend * 2;
                endX = (leg.index === 2 ? -10 : -6) * scale; // hind legs much longer
                endY = (leg.index === 2 ? 12 : 4) * scale/2 + move;
            } else {
                midX = (leg.index === 2 ? 5 : 3) * scale + bend * 2;
                midY = move - 1 - bend * 2;
                endX = (leg.index === 2 ? 10 : 6) * scale;
                endY = (leg.index === 2 ? 12 : 4) * scale/2 + move;
            }
            
            // Draw femur
            leg.lineTo(midX, midY);
            
            // Draw tibia - thinner for front/mid, thick for hind
            leg.lineStyle(leg.index === 2 ? 2 : 1.2, legColor);
            leg.lineTo(endX, endY);
            
            // Add tarsal segments (feet)
            if(leg.index === 2){
                leg.lineStyle(1.5, 0x8B4513);
                const footX = endX + (leg.side === 'left' ? -1.5 : 1.5);
                const footY = endY + 1.5;
                leg.lineTo(footX, footY);
            }
        });
    }
}; 