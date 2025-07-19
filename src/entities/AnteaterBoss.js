if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// Powerful end-game boss: the Anteater
IdleAnts.Entities.AnteaterBoss = class extends PIXI.Container {
    constructor(textures, mapBounds) {
        super();

        // --- Core Entity Properties (from Enemy.js) ---
        this.mapBounds = mapBounds;
        this.speed = 0.8;
        this.vx = 0; this.vy = 0;
        this.maxHp = 20000;
        this.hp = this.maxHp;
        this.attackDamage = 200;
        this.attackRange = 100; // Increased range
        this.attackCooldown = 50;
        this._attackTimer = 0;
        this.perceptionRange = 450;
        this.targetAnt = null;
        this.lastAttacker = null;
        this.foodValue = 5000;
        this.enemyName = "Anteater";
        this.isDead = false;
        
        // Position boss at the actual top of the map for dramatic invasion entrance
        this.x = mapBounds.width / 2; // Center horizontally
        this.y = 150; // Near the top of the map for true invasion from north
        
        // --- Build the Animated Sprite ---
        this.body = new PIXI.Sprite(textures.body);
        this.body.anchor.set(0.5, 0.5);

        this.leg_br = new PIXI.Sprite(textures.back_leg); // back-right
        this.leg_bl = new PIXI.Sprite(textures.back_leg); // back-left
        this.leg_fr = new PIXI.Sprite(textures.front_leg); // front-right
        this.leg_fl = new PIXI.Sprite(textures.front_leg); // front-left

        this.legs = [this.leg_br, this.leg_bl, this.leg_fr, this.leg_fl];
        
        this.leg_fl.position.set(-15 * 2.5, 15 * 2.5);
        this.leg_fr.position.set(-15 * 2.5, -15 * 2.5);
        this.leg_bl.position.set(20 * 2.5, 12 * 2.5);
        this.leg_br.position.set(20 * 2.5, -12 * 2.5);

        this.legs.forEach(leg => {
            leg.anchor.set(0.5, 0.2); // Pivot near the top
            this.addChild(leg);
        });
        
        this.addChild(this.body); // Body on top

        // --- Health Bar & Interactivity ---
        this.createHealthBar();
        this.healthBarTimer = 0;
        this.interactive = true;
        this.buttonMode = true;
        this.setupTooltip();

        // Animation state
        this.animationTimer = 0;
        this.isAttacking = false;
    }

    // --- Inherited/Adapted Methods from Enemy.js ---
    setupTooltip() {
        this.on('pointerover', () => {
            this.showTooltip();
        });
        
        this.on('pointerout', () => {
            this.hideTooltip();
        });
    }
    
    showTooltip() {
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'enemy-tooltip';
            this.tooltip.style.cssText = `
                position: fixed; background: rgba(0, 0, 0, 0.8); color: white;
                padding: 8px 12px; border-radius: 4px; font-size: 14px;
                pointer-events: none; z-index: 10000; border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(this.tooltip);
        }
        
        this.tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">${this.enemyName}</div>
            <div style="font-size: 12px; color: #ccc;">HP: ${this.hp}/${this.maxHp}</div>
            <div style="font-size: 12px; color: #ffeb3b;">Food Reward: ${Math.floor(this.foodValue)}</div>
        `;
        
        this.tooltip.style.display = 'block';
        this.updateTooltipPosition();
    }
    
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    }
    
    updateTooltipPosition() {
        if (this.tooltip && this.tooltip.style.display === 'block') {
            const screenPos = this.toGlobal(new PIXI.Point(0, 0));
            this.tooltip.style.left = (screenPos.x + 20) + 'px';
            this.tooltip.style.top = (screenPos.y - 40) + 'px';
        }
    }

    createHealthBar() {
        this.healthBarContainer = new PIXI.Container();
        IdleAnts.app.worldContainer.addChild(this.healthBarContainer);

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
    }

    takeDamage(dmg, attacker = null){
        this.hp -= dmg;
        if (IdleAnts.game && IdleAnts.game.uiManager) {
            IdleAnts.game.uiManager.updateBossHealth(this.hp, this.maxHp);
        }
        
        if (attacker) {
            this.lastAttacker = attacker;
        }
        
        if(this.hp<=0) this.die();
    }

    die(){
        if (this.lastAttacker && IdleAnts.app && IdleAnts.app.resourceManager) {
            IdleAnts.app.resourceManager.addFood(this.foodValue);
        }
        
        if (this.tooltip) {
            document.body.removeChild(this.tooltip);
            this.tooltip = null;
        }
        
        if(this.parent) this.parent.removeChild(this);
        this.isDead=true;
        if(this.healthBarContainer && this.healthBarContainer.parent){
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
        }

        if (IdleAnts.game && typeof IdleAnts.game.onBossDefeated === 'function') {
            IdleAnts.game.onBossDefeated();
        }
    }
    // --- MAIN UPDATE & ANIMATION LOGIC ---
    attack(target) {
        // Custom attack logic for the boss
        if (this._attackTimer === 0) {
            target.takeDamage(this.attackDamage, this);
            this._attackTimer = this.attackCooldown;

            // Trigger slam animation
            this.isAttacking = true;
            this.animationTimer = 0; // Reset timer for attack animation
        }
    }

    update(ants) {
        // Handle attack animation
        if (this.isAttacking) {
            this.animationTimer++;
            const duration = 30; // 0.5s slam
            
            if (this.animationTimer < duration / 2) {
                // Rear back
                this.rotation = -0.3 * (this.animationTimer / (duration / 2));
            } else if (this.animationTimer < duration) {
                // Slam down
                this.rotation = -0.3 + 0.4 * ((this.animationTimer - duration / 2) / (duration / 2));
            } else {
                // End attack animation
                this.isAttacking = false;
                this.rotation = 0;
            }
        } else {
            // Walk or Idle animation
            this.animationTimer++;
            const isMoving = Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1;

            if (isMoving) {
                // Walk Cycle
                const swing = 0.4 * Math.sin(this.animationTimer * 0.2);
                this.leg_fl.rotation = swing;
                this.leg_br.rotation = swing;
                this.leg_fr.rotation = -swing;
                this.leg_bl.rotation = -swing;
                
                this.body.rotation = 0.03 * Math.sin(this.animationTimer * 0.2);
                this.body.y = 2 * Math.sin(this.animationTimer * 0.4);
            } else {
                // Idle Animation
                const breathe = 0.05 * Math.sin(this.animationTimer * 0.05);
                this.body.rotation = breathe;
                this.legs.forEach(leg => leg.rotation = 0);
                this.body.y = 0;
            }
        }

        // --- Standard Enemy Logic (copied from Enemy.js and adapted) ---
        if(!this.targetAnt || this.targetAnt.isDead){
            this.targetAnt=null;
            let nearest=null,distSq=Infinity;
            ants.forEach(a=>{
                const dx=a.x-this.x; const dy=a.y-this.y; const d=dx*dx+dy*dy;
                if(d<distSq && Math.sqrt(d)<=this.perceptionRange){nearest=a;distSq=d;}
            });
            if(nearest) this.targetAnt=nearest;
        }

        if(this.targetAnt && !this.targetAnt.isDead){
            const dx=this.targetAnt.x-this.x;
            const dy=this.targetAnt.y-this.y;
            const dist=Math.sqrt(dx*dx+dy*dy);
            
            if (dist > this.attackRange) {
                this.vx = (dx/dist)*this.speed;
                this.vy = (dy/dist)*this.speed;
                this.x += this.vx;
                this.y += this.vy;
            } else {
                this.vx = 0;
                this.vy = 0;
                if(dist<=this.attackRange){
                    // stop moving while attacking
                    this.vx = this.vy = 0;
                    if(this._attackTimer===0){
                        this.attack(this.targetAnt);
                    }
                }
            }
        } else {
            // Wander logic
            if(Math.random()<0.02){
                const ang=Math.random()*Math.PI*2;
                this.vx=Math.cos(ang)*this.speed;
                this.vy=Math.sin(ang)*this.speed;
            }
            this.x+=this.vx;
            this.y+=this.vy;
        }

        // Boundaries
        if(this.x<0||this.x>this.mapBounds.width) this.vx*=-1;
        if(this.y<0||this.y>this.mapBounds.height) this.vy*=-1;

        // Cooldown timer
        if(this._attackTimer>0) this._attackTimer--;

        // Health bar update
        if(this.healthBarTimer>0){
            this.healthBarTimer--; if(this.healthBarTimer===0){this.healthBarContainer.visible=false;}
        }
        if(this.healthBarContainer){
            this.healthBarContainer.x = this.x;
            this.healthBarContainer.y = this.y - 20;
        }
        this.updateTooltipPosition();
    }
};