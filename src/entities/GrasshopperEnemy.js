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

        this.scale.set(2.0); // big
        this.speed = 1.0; // faster crawl speed
        this.attackDamage = 15;
        this.maxHp = 120;
        this.hp=this.maxHp;
        this.updateHealthBar();

        // Hopping behaviour
        this.hopCooldown = 180; // frames between hops (~3s)
        this.hopTimer = Math.floor(Math.random()*this.hopCooldown);
        this.hopSpeed = 3; // velocity applied during hop
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
        const body = new PIXI.Graphics();
        // Abdomen
        body.beginFill(0x4CAF50); // green
        body.drawEllipse(0, 6, 8, 10);
        body.endFill();

        // Thorax
        body.beginFill(0x43A047);
        body.drawEllipse(0, -4, 6, 8);
        body.endFill();

        // Head
        body.beginFill(0x388E3C);
        body.drawCircle(0, -14, 5);
        body.endFill();

        // Eyes
        body.beginFill(0x000000);
        body.drawCircle(-2, -15, 1.5);
        body.drawCircle(2, -15, 1.5);
        body.endFill();

        // Hind legs (big)
        body.lineStyle(2, 0x2E7D32);
        body.moveTo(-4, 4);
        body.lineTo(-12, 12);
        body.lineTo(-14, 18);

        body.moveTo(4, 4);
        body.lineTo(12, 12);
        body.lineTo(14, 18);

        // Forelegs
        body.lineStyle(1.5,0x33691E);
        body.moveTo(-3,-2);
        body.lineTo(-10,2);
        body.moveTo(3,-2);
        body.lineTo(10,2);

        // Antennae
        body.lineStyle(1,0x1B5E20);
        body.moveTo(-1,-17);
        body.lineTo(-6,-24);
        body.moveTo(1,-17);
        body.lineTo(6,-24);

        // Segment lines on abdomen
        body.lineStyle(1,0x2E7D32,0.4);
        for(let i=1;i<=2;i++){
            body.moveTo(-6,6+i*3);
            body.lineTo(6,6+i*3);
        }

        this.addChild(body);
    }
}; 