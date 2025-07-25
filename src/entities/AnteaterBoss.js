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
        this.attackRange = 200; // Doubled range to match 2x size
        this.attackCooldown = 50;
        this._attackTimer = 0;
        this.perceptionRange = 900; // Doubled perception to match 2x size
        this.targetAnt = null;
        this.lastAttacker = null;
        this.foodValue = 5000;
        this.enemyName = "Anteater";
        this.isDead = false;
        
        // Position boss at the actual top of the map for dramatic invasion entrance
        this.x = mapBounds.width / 2; // Center horizontally
        this.y = 150; // Near the top of the map for true invasion from north
        
        // Make the Anteater MASSIVE - 2x bigger
        this.scale.set(2.0, 2.0);
        
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

        // --- Make the Anteater MORE REALISTIC ---
        // Add a shadow effect for depth
        this.createShadow();

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
    
    
    createShadow() {
        // Create a dark shadow beneath the anteater
        this.shadow = new PIXI.Graphics();
        this.shadow.beginFill(0x000000, 0.3);
        this.shadow.drawEllipse(0, 0, 60, 30);
        this.shadow.endFill();
        this.shadow.position.y = 40;
        this.addChildAt(this.shadow, 0); // Add shadow at bottom layer
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
        // Handle attack animation - nose whip
        if (this.isAttacking) {
            this.animationTimer++;
            const duration = 30; // 0.5s whip
            
            if (this.animationTimer < duration / 3) {
                // Draw back - slight backward rotation and scale preparation
                const progress = this.animationTimer / (duration / 3);
                this.rotation = -0.15 * progress;
                this.body.scale.x = 1 + 0.1 * progress; // Slight horizontal stretch back
            } else if (this.animationTimer < (duration * 2) / 3) {
                // Quick whip forward - emphasize the snout motion
                const progress = (this.animationTimer - duration / 3) / (duration / 3);
                this.rotation = -0.15 + 0.25 * progress; // Quick forward snap
                this.body.scale.x = 1.1 - 0.2 * progress; // Compress then extend
                this.body.scale.y = 1 - 0.05 * Math.sin(progress * Math.PI); // Slight vertical compression during whip
            } else {
                // Return to normal - settle back
                const progress = (this.animationTimer - (duration * 2) / 3) / (duration / 3);
                this.rotation = 0.1 - 0.1 * progress;
                this.body.scale.x = 0.9 + 0.1 * progress;
                this.body.scale.y = 0.95 + 0.05 * progress;
                
                if (this.animationTimer >= duration) {
                    // End attack animation
                    this.isAttacking = false;
                    this.rotation = 0;
                    this.body.scale.set(1, 1);
                }
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

        // --- Dynamic Enemy Logic (adapted for final boss) ---
        let nearestAnt=null, antDistSq=Infinity;
        let queenTarget=null, queenDistSq=Infinity;
        let attackingAnt=null, attackingDistSq=Infinity;
        
        // Check all potential targets (ants + queen)
        const allTargets = [...ants];
        
        // Add queen to target list if available
        if (IdleAnts.app && IdleAnts.app.entityManager && IdleAnts.app.entityManager.entities.queen && 
            !IdleAnts.app.entityManager.entities.queen.isDead) {
            allTargets.push(IdleAnts.app.entityManager.entities.queen);
        }
        
        allTargets.forEach(target => {
            if (target.isDead) return; // Skip dead targets
            
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = dx * dx + dy * dy;
            const dist = Math.sqrt(d);
            
            if (dist <= this.perceptionRange) {
                if (target.isQueen) {
                    // Track queen as potential target
                    if (d < queenDistSq) {
                        queenTarget = target;
                        queenDistSq = d;
                    }
                } else {
                    // Check if this ant is attacking us (has us as target)
                    const isAttackingUs = target.targetEnemy === this;
                    
                    if (isAttackingUs && d < attackingDistSq) {
                        // Prioritize ants that are attacking us
                        attackingAnt = target;
                        attackingDistSq = d;
                    } else if (d < antDistSq) {
                        // Track nearest ant as fallback
                        nearestAnt = target;
                        antDistSq = d;
                    }
                }
            }
        });
        
        // Priority: 1) Ants attacking us, 2) Queen (always pursue if available), 3) Nearest ant
        const bestTarget = attackingAnt || queenTarget || nearestAnt;
        
        // Always switch to attacking ants if they exist
        if (attackingAnt && attackingAnt !== this.targetAnt) {
            this.targetAnt = attackingAnt;
        }
        // If no attackers but queen is available, always target queen
        else if (!attackingAnt && queenTarget && this.targetAnt !== queenTarget) {
            this.targetAnt = queenTarget;
        }
        // Fallback to nearest ant only if no queen available
        else if (!attackingAnt && !queenTarget && nearestAnt && this.targetAnt !== nearestAnt) {
            this.targetAnt = nearestAnt;
        }
        
        // Clear target if current target is dead or out of range
        if (this.targetAnt && (this.targetAnt.isDead || 
            Math.sqrt((this.targetAnt.x - this.x) ** 2 + (this.targetAnt.y - this.y) ** 2) > this.perceptionRange)) {
            this.targetAnt = null;
        }
        
        // Special case: If we have no target but queen exists anywhere, pursue her
        if (!this.targetAnt && IdleAnts.app && IdleAnts.app.entityManager && 
            IdleAnts.app.entityManager.entities.queen && !IdleAnts.app.entityManager.entities.queen.isDead) {
            this.targetAnt = IdleAnts.app.entityManager.entities.queen;
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