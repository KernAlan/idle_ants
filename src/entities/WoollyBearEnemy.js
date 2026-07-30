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
        
        // Enemy name for tooltip
        this.enemyName = "Woolly Bear Caterpillar";
        
        this.scale.set(1.0);
        this.speed = 0.5;
        this.attackDamage = 4;
        this.maxHp = 60;
        this.hp = this.maxHp;
        this.updateHealthBar();
    }

    createBody(){
        const A = IdleAnts.Art;
        this.segments = [];
        const segmentCount = 10; // more segments for realism
        const segmentRadius = 3.5;

        // The real Isabella tiger moth caterpillar: black at both ends, a rusty
        // band across the middle, and a dense bristle coat over the whole thing.
        const RUST = 0xB05A16;
        const BLACK = 0x241708;
        const BRISTLE_RUST = 0xE08A2E;
        const BRISTLE_BLACK = 0x4A3520;

        // The body is oriented along X (head toward -X), so the contact shadow
        // is wider than it is tall.
        this.createShadow(segmentCount * segmentRadius * 0.85, segmentRadius * 1.6, 0.26);

        for(let i=0;i<segmentCount;i++){
            const seg = new PIXI.Graphics();
            const isEnd = i < 2 || i >= segmentCount-2;
            const baseColor = isEnd ? BLACK : RUST;

            // Bristles first, radiating outward from behind the segment so the
            // body reads as a fuzzy coat rather than a string of beads.
            A.fuzz(seg, {
                x: 0, y: 0,
                rx: segmentRadius * 0.9, ry: segmentRadius * 0.75,
                color: isEnd ? BRISTLE_BLACK : BRISTLE_RUST,
                count: 22, length: segmentRadius * 1.5, width: 0.85,
                alpha: 0.9, seed: 100 + i
            });
            // A second, longer and sparser layer gives the coat depth.
            A.fuzz(seg, {
                x: 0, y: 0,
                rx: segmentRadius * 0.7, ry: segmentRadius * 0.55,
                color: isEnd ? 0x6B5237 : 0xF2A84E,
                count: 12, length: segmentRadius * 2.1, width: 0.6,
                alpha: 0.55, seed: 500 + i
            });

            A.volume(seg, {
                x: 0, y: 0, rx: segmentRadius, ry: segmentRadius * 0.82,
                color: baseColor, outlineWidth: 0.5, rimAlpha: 0.45
            });

            seg.x = (i - segmentCount/2) * (segmentRadius*1.6);
            this.addChild(seg);
            this.segments.push(seg);
        }

        // Head capsule - glossy black, distinct from the fuzzy body.
        this.head = new PIXI.Graphics();
        A.fuzz(this.head, {
            x: 0, y: 0, rx: segmentRadius * 1.1, ry: segmentRadius * 0.85,
            color: BRISTLE_BLACK, count: 16, length: segmentRadius * 1.3, width: 0.8, seed: 7
        });
        A.volume(this.head, {
            x: 0, y: 0, rx: segmentRadius * 1.25, ry: segmentRadius,
            color: 0x322110, outlineWidth: 0.6, rimAlpha: 0.75
        });

        // Eyes sit on the side of the head capsule; the body points along -X,
        // so they are offset along Y rather than X.
        A.eye(this.head, -1.2, -2.2, 1.1, { squash: 1, innerColor: 0x8A5A1E });
        A.eye(this.head, -1.2,  2.2, 1.1, { squash: 1, innerColor: 0x8A5A1E });

        // Mandibles at the front of the head (-X).
        this.head.beginFill(0x5A3A18);
        this.head.drawPolygon(A.ellipsePath(-3.4, 0, 1.4, 1.9, 0, 14));
        this.head.endFill();
        this.head.beginFill(0x8A6030, 0.8);
        this.head.drawPolygon(A.ellipsePath(-3.7, -0.5, 0.7, 1, 0, 10));
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