// src/entities/WoollyBearEnemy.js
if(typeof IdleAnts==='undefined') IdleAnts={};
if(typeof IdleAnts.Entities==='undefined') IdleAnts.Entities={};

// Woolly Bear caterpillar enemy – slow crawler, modest damage
IdleAnts.Entities.WoollyBearEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        // override graphic: draw caterpillar body
        this.texture = PIXI.Texture.EMPTY;
        this.createBody();
        this.scale.set(1.0);
        this.speed = 0.5;
        this.attackDamage = 4;
        this.maxHp = 60;
        this.hp = this.maxHp;
        this.updateHealthBar();
    }

    createBody(){
        this.segments = [];
        const segmentCount = 8;
        const segmentRadius = 3;
        for(let i=0;i<segmentCount;i++){
            const seg = new PIXI.Graphics();
            const color = (i%2===0)? 0xFF8C00 : 0x000000;
            seg.beginFill(color);
            seg.drawCircle(0,0,segmentRadius);
            seg.endFill();
            seg.x = (i - segmentCount/2) * (segmentRadius*1.8);
            this.addChild(seg);
            this.segments.push(seg);
        }
        // head overlay (slightly larger black circle with eyes)
        this.head = new PIXI.Graphics();
        this.head.beginFill(0x000000);
        this.head.drawCircle(0,0,segmentRadius*1.2);
        this.head.endFill();
        // eyes
        this.head.beginFill(0xFFFFFF);
        this.head.drawCircle(-2,-1,1.2);
        this.head.drawCircle(2,-1,1.2);
        this.head.endFill();
        this.head.beginFill(0x000000);
        this.head.drawCircle(-2,-1,0.6);
        this.head.drawCircle(2,-1,0.6);
        this.head.endFill();
        // Position head at front
        this.head.x = -(segmentCount/2)*segmentRadius*1.6 - segmentRadius;
        this.addChild(this.head);
        this.segmentPhase = 0;
    }

    update(nestPos,foods,playerAnts){
        // Basic AI similar to former EnemyAnt: chase nearest ant
        if(!this.targetAnt || this.targetAnt.isDead){
            let nearest=null, distSq=Infinity;
            playerAnts.forEach(a=>{
                const dx=a.x-this.x, dy=a.y-this.y, d=dx*dx+dy*dy;
                if(d<distSq && d<=this.perceptionRange*this.perceptionRange){nearest=a;distSq=d;}
            });
            this.targetAnt = nearest;
        }

        if(this.targetAnt){
            const dx=this.targetAnt.x-this.x, dy=this.targetAnt.y-this.y;
            const dist=Math.hypot(dx,dy);
            if(dist>0){
                this.vx=(dx/dist)*this.speed;
                this.vy=(dy/dist)*this.speed;
            }
        } else if(Math.random()<0.02){
            const ang=Math.random()*Math.PI*2;
            this.vx=Math.cos(ang)*this.speed;
            this.vy=Math.sin(ang)*this.speed;
        }

        // move
        this.x+=this.vx; this.y+=this.vy;

        // Smooth rotation towards movement direction
        if(Math.abs(this.vx)+Math.abs(this.vy) > 0.1){
            // Graphic oriented with head toward -X, so add PI to face velocity
            this.rotation = Math.atan2(this.vy,this.vx)+Math.PI;
        }

        // Animate segment wiggle to simulate crawling
        if(this.segments){
            this.segmentPhase += 0.2;
            const amp = 1.5; // amplitude
            this.segments.forEach((seg,idx)=>{
                seg.y = Math.sin(this.segmentPhase + idx*0.6)*amp;
            });
            // head follows first segment y for coherence
            this.head.y = this.segments[0].y;
        }

        // Attack
        if(this._attackTimer>0) this._attackTimer--;
        if(this.targetAnt){
            if(Math.hypot(this.targetAnt.x-this.x, this.targetAnt.y-this.y) <= this.attackRange){
                this.vx=this.vy=0;
                if(this._attackTimer===0){
                    this.targetAnt.takeDamage(this.attackDamage);
                    this._attackTimer=this.attackCooldown;
                }
            }
        }

        // stay within bounds
        if(this.x<0||this.x>this.mapBounds.width) this.vx*=-1;
        if(this.y<0||this.y>this.mapBounds.height) this.vy*=-1;

        super.update(playerAnts);
    }
}; 