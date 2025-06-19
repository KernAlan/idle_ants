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
        const segmentCount = 10; // more segments for realism
        const segmentRadius = 3.5;
        
        // Realistic woolly bear colors
        const rustBrown = 0x8B4513;
        const darkBrown = 0x654321;
        const blackBand = 0x2F1B14;
        const fuzzyOrange = 0xFF8C00;
        
        for(let i=0;i<segmentCount;i++){
            const seg = new PIXI.Graphics();
            
            // Realistic woolly bear pattern: black ends, rusty middle
            let baseColor;
            if(i < 2 || i >= segmentCount-2){
                baseColor = blackBand; // black ends
            } else {
                baseColor = rustBrown; // rusty brown middle
            }
            
            // Main segment body
            seg.beginFill(baseColor);
            seg.drawEllipse(0, 0, segmentRadius, segmentRadius*0.8); // slightly flattened
            seg.endFill();
            
            // Add fuzzy texture with small bristles
            seg.beginFill(fuzzyOrange, 0.6);
            for(let j = 0; j < 12; j++){
                const angle = (j / 12) * Math.PI * 2;
                const bristleX = Math.cos(angle) * (segmentRadius + 1);
                const bristleY = Math.sin(angle) * (segmentRadius*0.8 + 1);
                seg.drawCircle(bristleX, bristleY, 0.4);
            }
            seg.endFill();
            
            // Inner fuzzy texture
            const innerFuzz = (i < 2 || i >= segmentCount-2) ? 0x8B4513 : fuzzyOrange;
            seg.beginFill(innerFuzz, 0.4);
            for(let j = 0; j < 8; j++){
                const angle = (j / 8) * Math.PI * 2;
                const fuzzX = Math.cos(angle) * (segmentRadius * 0.6);
                const fuzzY = Math.sin(angle) * (segmentRadius * 0.5);
                seg.drawCircle(fuzzX, fuzzY, 0.3);
            }
            seg.endFill();
            
            // Segment lines for definition
            seg.lineStyle(0.8, darkBrown, 0.7);
            seg.drawEllipse(0, 0, segmentRadius*0.8, segmentRadius*0.6);
            
            seg.x = (i - segmentCount/2) * (segmentRadius*1.6);
            this.addChild(seg);
            this.segments.push(seg);
        }
        
        // Enhanced head with more detail
        this.head = new PIXI.Graphics();
        
        // Head capsule
        this.head.beginFill(blackBand);
        this.head.drawEllipse(0, 0, segmentRadius*1.3, segmentRadius);
        this.head.endFill();
        
        // Head texture/fuzz
        this.head.beginFill(darkBrown, 0.5);
        for(let i = 0; i < 8; i++){
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * segmentRadius;
            const y = Math.sin(angle) * segmentRadius * 0.7;
            this.head.drawCircle(x, y, 0.4);
        }
        this.head.endFill();
        
        // Large compound eyes (more prominent)
        this.head.beginFill(0x000000);
        this.head.drawEllipse(-2.5, -1, 1.8, 2.2);
        this.head.drawEllipse(2.5, -1, 1.8, 2.2);
        this.head.endFill();
        
        // Eye highlights
        this.head.beginFill(0xFFFFFF, 0.8);
        this.head.drawCircle(-2.5, -1.2, 0.8);
        this.head.drawCircle(2.5, -1.2, 0.8);
        this.head.endFill();
        
        // Pupils
        this.head.beginFill(0x000000);
        this.head.drawCircle(-2.5, -1, 0.4);
        this.head.drawCircle(2.5, -1, 0.4);
        this.head.endFill();
        
        // Mandibles/mouth
        this.head.beginFill(darkBrown);
        this.head.drawEllipse(0, 1.5, 1.5, 1);
        this.head.endFill();
        
        // Simple antennae
        this.head.lineStyle(1, darkBrown);
        this.head.moveTo(-1.5, -2);
        this.head.lineTo(-2.5, -4);
        this.head.moveTo(1.5, -2);
        this.head.lineTo(2.5, -4);
        
        // Prolegs (caterpillar feet) - small dots along bottom
        this.head.lineStyle(0);
        this.head.beginFill(darkBrown);
        for(let i = 0; i < 4; i++){
            const x = -1.5 + i;
            this.head.drawCircle(x, segmentRadius*0.8, 0.3);
        }
        this.head.endFill();
        
        // Position head at front
        this.head.x = -(segmentCount/2)*segmentRadius*1.6 - segmentRadius*1.2;
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
            this.segmentPhase += 0.15; // slower, more realistic
            const amp = 2; // slightly more pronounced
            const wavelength = 0.8; // tighter wave for caterpillar motion
            
            this.segments.forEach((seg,idx)=>{
                // Undulating wave motion - each segment follows the one in front
                const wave = Math.sin(this.segmentPhase + idx*wavelength)*amp;
                seg.y = wave;
                
                // Slight compression/extension effect for realism
                const compress = Math.cos(this.segmentPhase + idx*wavelength)*0.1 + 1;
                seg.scale.x = compress;
                
                // Rotate segments slightly to follow the wave
                const nextIdx = Math.min(idx + 1, this.segments.length - 1);
                const prevWave = Math.sin(this.segmentPhase + (idx-1)*wavelength)*amp;
                const nextWave = Math.sin(this.segmentPhase + nextIdx*wavelength)*amp;
                seg.rotation = (nextWave - prevWave) * 0.1;
            });
            
            // Head follows the motion more naturally
            if(this.segments.length > 0){
                this.head.y = this.segments[0].y * 0.8; // slightly less movement
                this.head.rotation = this.segments[0].rotation * 0.5;
            }
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