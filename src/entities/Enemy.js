// src/entities/Enemy.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

IdleAnts.Entities.Enemy = class extends PIXI.Sprite {
    constructor(texture, mapBounds) {
        super(texture);
        this.anchor.set(0.5);
        this.scale.set(0.8 + Math.random()*0.3);

        this.mapBounds = mapBounds;
        this.speed = 1 + Math.random();
        this.vx = 0; this.vy = 0;

        // Health
        this.maxHp = 40;
        this.hp = this.maxHp;
        this.createHealthBar();
        this.healthBarTimer = 0;

        // Combat
        this.attackDamage = 5;
        this.attackRange = 15;
        this.attackCooldown = 60;
        this._attackTimer = 0;

        // AI perception and chasing
        this.perceptionRange = 150;
        this.targetAnt = null;

        // Random start position
        this.x = Math.random()*mapBounds.width;
        this.y = Math.random()*mapBounds.height;
    }

    createHealthBar() {
        this.healthBarContainer = new PIXI.Container();
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(this.healthBarContainer);
        } else {
            this.addChild(this.healthBarContainer);
        }

        this.healthBarBg = new PIXI.Graphics();
        this.healthBarBg.beginFill(0x000000,0.6);
        this.healthBarBg.drawRect(-10,0,20,3);
        this.healthBarBg.endFill();
        this.healthBarContainer.addChild(this.healthBarBg);

        this.healthBarFg = new PIXI.Graphics();
        this.healthBarContainer.addChild(this.healthBarFg);
        this.updateHealthBar();
        this.healthBarContainer.visible=false;
    }

    updateHealthBar() {
        const ratio = Math.max(this.hp,0)/this.maxHp;
        this.healthBarFg.clear();
        this.healthBarFg.beginFill(0xFF0000);
        this.healthBarFg.drawRect(-10,0,20*ratio,3);
        this.healthBarFg.endFill();
        this.healthBarContainer.visible=true;
        this.healthBarTimer=1800;
        this.healthBarContainer.x = this.x;
        this.healthBarContainer.y = this.y - 20;
        this.healthBarContainer.rotation = 0;
    }

    takeDamage(dmg){
        this.hp -= dmg;
        this.updateHealthBar();
        if(this.hp<=0) this.die();
    }

    die(){
        if(this.parent) this.parent.removeChild(this);
        this.isDead=true;
        if(this.healthBarContainer && this.healthBarContainer.parent){
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
        }
    }

    update(ants){
        // Acquire or validate target ant within perception range
        if(!this.targetAnt || this.targetAnt.isDead){
            this.targetAnt=null;
            let nearest=null,distSq=Infinity;
            ants.forEach(a=>{
                const dx=a.x-this.x; const dy=a.y-this.y; const d=dx*dx+dy*dy;
                if(d<distSq && Math.sqrt(d)<=this.perceptionRange){nearest=a;distSq=d;}
            });
            if(nearest) this.targetAnt=nearest;
        }

        // If locked on, adjust direction towards target
        if(this.targetAnt && !this.targetAnt.isDead){
            const dx=this.targetAnt.x-this.x;
            const dy=this.targetAnt.y-this.y;
            const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist>0){
                this.vx = (dx/dist)*this.speed;
                this.vy = (dy/dist)*this.speed;
            }
        }

        // Simple wander
        if(!this.targetAnt && Math.random()<0.02){
            const ang=Math.random()*Math.PI*2;
            this.vx=Math.cos(ang)*this.speed;
            this.vy=Math.sin(ang)*this.speed;
        }
        this.x+=this.vx;
        this.y+=this.vy;
        // Boundaries
        if(this.x<0||this.x>this.mapBounds.width) this.vx*=-1;
        if(this.y<0||this.y>this.mapBounds.height) this.vy*=-1;

        // Attack nearest ant
        if(this._attackTimer>0) this._attackTimer--;
        if(this.targetAnt){
            const dx=this.targetAnt.x-this.x; const dy=this.targetAnt.y-this.y; const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<=this.attackRange){
                // stop moving while attacking
                this.vx = this.vy = 0;
                if(this._attackTimer===0){
                    this.targetAnt.takeDamage(this.attackDamage);
                    this._attackTimer=this.attackCooldown;
                }
            }
        }

        if(this.healthBarTimer>0){
            this.healthBarTimer--; if(this.healthBarTimer===0){this.healthBarContainer.visible=false;}
        }

        if(this.healthBarContainer){
            this.healthBarContainer.x = this.x;
            this.healthBarContainer.y = this.y - 20;
            this.healthBarContainer.rotation = 0;
        }
    }
}; 