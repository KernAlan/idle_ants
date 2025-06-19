// src/entities/EnemyAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// EnemyAnt now extends regular Ant to reuse legs/animations
IdleAnts.Entities.EnemyAnt = class extends IdleAnts.Entities.Ant {
    constructor(texture, nestPosition, mapBounds){
        super(texture, nestPosition, 1); // speedMultiplier 1

        // place at random spot in map
        this.x = Math.random()*mapBounds.width;
        this.y = Math.random()*mapBounds.height;

        // Replace default ant graphics with a wooly bear mammoth made from PIXI graphics
        this.texture = PIXI.Texture.EMPTY; // hide original sprite texture
        this.removeChildren();
        this.createMammothBody();
        this.scale.set(1.5);

        // Combat stats
        this.attackDamage = 4;
        this.attackCooldown = 30;
        this._attackTimer = 0;
        this.perceptionRange = 160;
        this.targetAnt = null;

        // Disable cargo/food behaviour: start in SEEKING_FOOD but overridden update ensures custom logic
    }

    update(nestPos, foods, playerAnts){
        // Custom AI: chase nearest player ant
        if(!this.targetAnt || this.targetAnt.isDead){
            let nearest=null,distSq=Infinity;
            playerAnts.forEach(a=>{
                const dx=a.x-this.x, dy=a.y-this.y, d=dx*dx+dy*dy;
                if(d<distSq && d<=this.perceptionRange*this.perceptionRange){nearest=a;distSq=d;}
            });
            this.targetAnt = nearest;
        }

        // Movement toward target or random wander
        if(this.targetAnt){
            const dx=this.targetAnt.x-this.x, dy=this.targetAnt.y-this.y;
            const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist>0){
                const spd= this.speed; // from AntBase
                this.vx = (dx/dist)*spd;
                this.vy = (dy/dist)*spd;
            }
        } else if(Math.random()<0.02){
            const ang=Math.random()*Math.PI*2;
            this.vx=Math.cos(ang)*this.speed;
            this.vy=Math.sin(ang)*this.speed;
        }

        // Apply movement
        this.x += this.vx; this.y += this.vy;

        // Attack when close
        if(this._attackTimer>0) this._attackTimer--;
        if(this.targetAnt){
            const dx=this.targetAnt.x-this.x, dy=this.targetAnt.y-this.y;
            const inRange = Math.hypot(dx,dy) <= 15;
            if(inRange){
                this.vx = this.vy = 0;
                if(this._attackTimer===0){
                    this.targetAnt.takeDamage(this.attackDamage);
                    this._attackTimer=this.attackCooldown;
                }
            }
        }

        // Run base animations/health timers
        super.update(nestPos, foods);
    }

    createMammothBody(){
        /* Draw a simple cartoon woolly mammoth using PIXI.Graphics.              
           The design: large brown ellipse for body, smaller ellipse for head,    
           darker legs, curved tusks, and a trunk.                                */
        const mammoth = new PIXI.Graphics();
        // Body
        mammoth.beginFill(0x8B4513); // SaddleBrown
        mammoth.drawEllipse(0, 0, 20, 14);
        mammoth.endFill();

        // Head
        mammoth.beginFill(0x8B4513);
        mammoth.drawCircle(0, -16, 9);
        mammoth.endFill();

        // Legs (simple rectangles)
        mammoth.beginFill(0x5D3311);
        for(let i=-1;i<=1;i+=2){
            mammoth.drawRect(i*8-3,8,6,10); // front legs
            mammoth.drawRect(i*6-3,8,6,10); // back legs slightly inside
        }
        mammoth.endFill();

        // Trunk
        mammoth.beginFill(0x5D3311);
        mammoth.drawRect(-2, -8, 4, 14);
        mammoth.endFill();

        // Tusks (white curves)
        mammoth.lineStyle(2,0xFFFFFF);
        mammoth.moveTo(-4,-4);
        mammoth.quadraticCurveTo(-14,0,-6,6);
        mammoth.moveTo(4,-4);
        mammoth.quadraticCurveTo(14,0,6,6);

        // Eyes
        mammoth.beginFill(0x000000);
        mammoth.drawCircle(-3,-18,1.5);
        mammoth.drawCircle(3,-18,1.5);
        mammoth.endFill();

        this.addChild(mammoth);
    }
}; 