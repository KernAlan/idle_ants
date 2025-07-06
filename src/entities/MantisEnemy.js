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
        const g = new PIXI.Graphics();
        // Realistic mantis colors - browns and greens
        const mantisGreen = 0x4A7C59;
        const darkGreen = 0x2E4F3A;
        const lightGreen = 0x6B8E5A;
        const brownTone = 0x8B7355;
        const eyeColor = 0x1B5E20;
        
        g.lineStyle(0);
        
        // Long, narrow abdomen with realistic segmentation
        g.beginFill(mantisGreen);
        g.drawEllipse(0, 18, 5, 32); // very long and thin
        g.endFill();
        
        // Abdomen segments - mantises have distinct segments
        g.lineStyle(1, darkGreen, 0.7);
        for(let i = 0; i < 7; i++){
            const y = -4 + i * 6;
            g.moveTo(-4, y);
            g.lineTo(4, y);
        }
        
        // Wing covers (tegmina) - mantises have leathery forewings
        g.lineStyle(0);
        g.beginFill(brownTone, 0.9);
        g.drawEllipse(-2, 12, 1.5, 18);
        g.drawEllipse(2, 12, 1.5, 18);
        g.endFill();
        
        // Wing membrane hints
        g.beginFill(0xFFFFFF, 0.2);
        g.drawEllipse(-2, 14, 1, 14);
        g.drawEllipse(2, 14, 1, 14);
        g.endFill();
        
        // Prothorax (elongated neck segment) - key mantis feature
        g.beginFill(lightGreen);
        g.drawEllipse(0, -8, 4, 12);
        g.endFill();
        
        // Mesothorax and metathorax
        g.beginFill(mantisGreen);
        g.drawEllipse(0, 2, 5, 8);
        g.endFill();
        
        // Realistic triangular head with proper proportions
        g.beginFill(lightGreen);
        g.drawPolygon([
            -6, -18,   // left wide base
            -4, -26,   // left upper
            -2, -32,   // left top
            0, -34,    // apex
            2, -32,    // right top
            4, -26,    // right upper
            6, -18,    // right wide base
            3, -14,    // right neck
            -3, -14    // left neck
        ]);
        g.endFill();
        
        // Large compound eyes - mantises have excellent vision
        g.beginFill(eyeColor);
        g.drawEllipse(-4, -24, 2.5, 4); // large, prominent eyes
        g.drawEllipse(4, -24, 2.5, 4);
        g.endFill();
        
        // Eye highlights and pupils
        g.beginFill(0x000000);
        g.drawEllipse(-4, -24, 1.5, 2.5);
        g.drawEllipse(4, -24, 1.5, 2.5);
        g.endFill();
        
        g.beginFill(0xFFFFFF, 0.6);
        g.drawCircle(-4, -25, 0.8);
        g.drawCircle(4, -25, 0.8);
        g.endFill();
        
        // Ocelli (simple eyes) - three dots on top of head
        g.beginFill(0x000000);
        g.drawCircle(-1, -30, 0.5);
        g.drawCircle(0, -32, 0.5);
        g.drawCircle(1, -30, 0.5);
        g.endFill();
        
        // Mandibles and mouth parts
        g.beginFill(brownTone);
        g.drawEllipse(0, -16, 1.5, 3);
        g.endFill();
        
        // Neck markings
        g.lineStyle(1, darkGreen, 0.5);
        g.moveTo(-3, -16);
        g.lineTo(3, -16);
        g.moveTo(-2, -12);
        g.lineTo(2, -12);

        // Enhanced raptorial arms (praying mantis signature feature)
        const makeArm = (dir)=>{
            const s = dir; // -1 left, 1 right
            const arm = new PIXI.Graphics();
            
            // Coxa (base segment)
            arm.beginFill(lightGreen);
            arm.drawEllipse(s*2, -10, 2, 4);
            arm.endFill();
            
            // Femur (upper arm) - thick and powerful
            arm.beginFill(mantisGreen);
            arm.drawPolygon([
                s*1, -8,
                s*5, -10,
                s*12, -22,
                s*8, -20
            ]);
            arm.endFill();

            // Tibia (forearm) with spines
            arm.beginFill(darkGreen);
            arm.drawPolygon([
                s*12, -22,
                s*15, -28,
                s*20, -50,
                s*17, -48,
                s*13, -30
            ]);
            arm.endFill();

            // Spines on tibia
            arm.lineStyle(1.5, 0x1B5E20);
            for(let i = 0; i < 4; i++){
                const spineY = -25 - i * 6;
                arm.moveTo(s*15, spineY);
                arm.lineTo(s*18, spineY - 2);
            }
            
            // Tarsus (claw) - curved and sharp
            arm.lineStyle(0);
            arm.beginFill(0x8B4513); // brown claw
            arm.drawPolygon([
                s*20, -50,
                s*26, -62,
                s*22, -58,
                s*18, -52
            ]);
            arm.endFill();
            
            // Claw tip highlight
            arm.beginFill(0xFFFFFF, 0.3);
            arm.drawCircle(s*24, -60, 1);
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

        const shellCol = 0x2E7D32;
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
        antG.lineStyle(1.2, darkGreen);
        // Left antenna - curved and segmented
        antG.moveTo(-2, -32);
        antG.lineTo(-5, -42);
        antG.lineTo(-9, -50);
        antG.lineTo(-11, -58);
        // Right antenna - curved and segmented  
        antG.moveTo(2, -32);
        antG.lineTo(5, -42);
        antG.lineTo(9, -50);
        antG.lineTo(11, -58);
        
        // Antenna segments
        antG.lineStyle(2, darkGreen);
        antG.drawCircle(-3, -36, 0.5);
        antG.drawCircle(-7, -46, 0.5);
        antG.drawCircle(3, -36, 0.5);
        antG.drawCircle(7, -46, 0.5);
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

        const legColor = 0x4A7C59; // match body color
        const scale = 2.2; // longer, more elegant legs

        this.hindLegs.forEach((legObj,idx)=>{
            const legG = legObj.g;
            const side = legObj.side;
            const phase = this.legPhase + (idx*Math.PI); 
            const lift = Math.sin(phase)*2; // more subtle movement
            const bend = Math.max(0, -Math.sin(phase)*0.8); // less pronounced bend

            legG.clear();
            legG.lineStyle(2.5, legColor); // thicker legs
            legG.moveTo(0,0);

            // Mantis legs are longer and more graceful
            let midX, midY, endX, endY;
            if(side==='left'){
                midX = -8*scale - bend*3;
                midY = 8*scale/6 + lift - bend*3;
                endX = -16*scale; // much longer reach
                endY = 22*scale/6 + lift;
            } else {
                midX = 8*scale + bend*3;
                midY = 8*scale/6 + lift - bend*3;
                endX = 16*scale;
                endY = 22*scale/6 + lift;
            }
            
            // Draw femur (thigh)
            legG.lineStyle(3, legColor);
            legG.lineTo(midX, midY);
            
            // Draw tibia (shin) - thinner
            legG.lineStyle(2, 0x2E4F3A);
            legG.lineTo(endX, endY);
            
            // Add tarsus (foot) segments
            legG.lineStyle(1.5, 0x2E4F3A);
            const footX = endX + (side==='left' ? -2 : 2);
            const footY = endY + 2;
            legG.lineTo(footX, footY);
        });
    }
}; 