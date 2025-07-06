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
        // Container for legs (drawn first so body sits on top)
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);

        // Create legs similar to ant style but scaled up
        this.legs = [];
        const shellCol = 0x2E7D32;
        const legBaseYs = [ -2, 2, 8 ]; // front, middle, hind

        legBaseYs.forEach((y, idx)=>{
            // left leg
            const left = new PIXI.Graphics();
            left.lineStyle(1.8, shellCol);
            left.position.set(-5, y);
            left.index = idx;
            left.side = 'left';
            this.legsContainer.addChild(left);
            this.legs.push(left);

            // right leg
            const right = new PIXI.Graphics();
            right.lineStyle(1.8, shellCol);
            right.position.set(5, y);
            right.index = idx;
            right.side = 'right';
            this.legsContainer.addChild(right);
            this.legs.push(right);
        });

        const body = new PIXI.Graphics();
        // Realistic grasshopper colors
        const bodyGreen = 0x7CB342; // bright leaf green
        const darkGreen = 0x558B2F;
        const lightGreen = 0x9CCC65;
        const brownAccent = 0x8D6E63;
        
        // Long, segmented abdomen (grasshoppers have elongated bodies)
        body.beginFill(bodyGreen);
        body.drawEllipse(0, 12, 6, 20); // longer, narrower
        body.endFill();
        
        // Abdomen segments
        body.lineStyle(1, darkGreen, 0.6);
        for(let i = 0; i < 5; i++){
            const y = 2 + i * 4;
            body.moveTo(-5, y);
            body.lineTo(5, y);
        }
        
        // Thorax (prothorax + mesothorax)
        body.lineStyle(0);
        body.beginFill(darkGreen);
        body.drawEllipse(0, -2, 5, 8);
        body.endFill();
        
        // Wing covers (elytra) - grasshoppers have prominent wing covers
        body.beginFill(brownAccent, 0.8);
        body.drawEllipse(-3, 8, 2, 12);
        body.drawEllipse(3, 8, 2, 12);
        body.endFill();
        
        // Wing membrane hints
        body.beginFill(0xFFFFFF, 0.3);
        body.drawEllipse(-3, 10, 1.5, 8);
        body.drawEllipse(3, 10, 1.5, 8);
        body.endFill();
        
        // Head - more angular, realistic shape
        body.beginFill(bodyGreen);
        body.drawPolygon([
            -4, -12,  // left side
            -3, -18,  // left top
            0, -20,   // tip
            3, -18,   // right top
            4, -12,   // right side
            2, -8,    // right bottom
            -2, -8    // left bottom
        ]);
        body.endFill();
        
        // Large compound eyes (grasshoppers have very prominent eyes)
        body.beginFill(0x000000);
        body.drawEllipse(-3, -15, 2, 3); // larger, oval eyes
        body.drawEllipse(3, -15, 2, 3);
        body.endFill();
        
        // Eye highlights
        body.beginFill(0xFFFFFF, 0.4);
        body.drawCircle(-3, -16, 0.8);
        body.drawCircle(3, -16, 0.8);
        body.endFill();
        
        // Mandibles/mouth parts
        body.beginFill(brownAccent);
        body.drawEllipse(0, -10, 1, 2);
        body.endFill();
        
        // Long antennae (grasshoppers have thread-like antennae)
        const antennae = new PIXI.Graphics();
        antennae.lineStyle(1.2, darkGreen);
        // Left antenna - curved
        antennae.moveTo(-2, -18);
        antennae.lineTo(-4, -26);
        antennae.lineTo(-7, -32);
        antennae.lineTo(-8, -38);
        // Right antenna - curved
        antennae.moveTo(2, -18);
        antennae.lineTo(4, -26);
        antennae.lineTo(7, -32);
        antennae.lineTo(8, -38);
        
        // Thorax markings
        body.lineStyle(1, lightGreen, 0.7);
        body.moveTo(-4, -8);
        body.lineTo(4, -8);
        body.moveTo(-3, -4);
        body.lineTo(3, -4);

        // Add components in order
        this.addChild(body);
        this.addChild(antennae);
    }

    animateLegs(){
        this.legPhase += this.legAnimationSpeed;
        const speedMag = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        const rate = Math.max(0.05, speedMag*0.25);
        this.legPhase += rate;

        const shellCol = 0x2E7D32;
        const scale = 1.8;

        this.legs.forEach(leg=>{
            const phase = this.legPhase + (leg.index*Math.PI/3) + (leg.side==='right'?Math.PI:0);
            const move = Math.sin(phase)*2.5;
            const bend = Math.max(0, -Math.sin(phase));

            leg.clear();
            // Hind legs are much thicker and more prominent
            const thickness = leg.index === 2 ? 3 : 1.8;
            leg.lineStyle(thickness, shellCol);
            leg.moveTo(0,0);

            let midX, midY, endX, endY;
            if(leg.side==='left'){
                midX = (leg.index===2 ? -6 : -4)*scale - bend*2;
                midY = move - 2 - bend*2;
                endX = (leg.index===2 ? -14 : -8)*scale; // hind much longer
                endY = (leg.index===2 ? 18 : 6)*scale/3 + move;
            } else {
                midX = (leg.index===2 ? 6 : 4)*scale + bend*2;
                midY = move - 2 - bend*2;
                endX = (leg.index===2 ? 14 : 8)*scale;
                endY = (leg.index===2 ? 18 : 6)*scale/3 + move;
            }
            leg.lineTo(midX, midY);
            leg.lineTo(endX, endY);
            
            // Add femur (thigh) segment for hind legs
            if(leg.index === 2){
                leg.lineStyle(4, 0x689F38); // thicker, darker green femur
                const femurEndX = leg.side==='left' ? -3*scale : 3*scale;
                const femurEndY = 2 + move*0.5;
                leg.moveTo(0, 0);
                leg.lineTo(femurEndX, femurEndY);
            }
        });
    }
}; 