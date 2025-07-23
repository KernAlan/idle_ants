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
        
        // Track the last ant that damaged this enemy
        this.lastAttacker = null;
        
        // Food value when defeated
        this.foodValue = 100 + Math.random() * 50; // 100-150 food per enemy
        
        // Enemy type name for tooltip
        this.enemyName = "Enemy";
        
        // Make enemy interactive for tooltips
        this.interactive = true;
        this.buttonMode = true;
        this.setupTooltip();
    }

    setupTooltip() {
        this.on('pointerover', () => {
            this.showTooltip();
        });
        
        this.on('pointerout', () => {
            this.hideTooltip();
        });
    }
    
    showTooltip() {
        // Create tooltip if it doesn't exist
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'enemy-tooltip';
            this.tooltip.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                pointer-events: none;
                z-index: 10000;
                border: 1px solid rgba(255, 255, 255, 0.3);
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
            const bounds = this.getBounds();
            const screenPos = this.toGlobal(new PIXI.Point(0, 0));
            
            this.tooltip.style.left = (screenPos.x + 20) + 'px';
            this.tooltip.style.top = (screenPos.y - 40) + 'px';
        }
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

    takeDamage(dmg, attacker = null){
        this.hp -= dmg;
        this.updateHealthBar();
        
        // Track the last attacker (the ant that dealt the damage)
        if (attacker) {
            this.lastAttacker = attacker;
        }
        
        if(this.hp<=0) this.die();
    }

    die(){
        // Reward food to the last attacker (the ant that dealt the killing blow)
        if (this.lastAttacker && IdleAnts.app && IdleAnts.app.resourceManager) {
            IdleAnts.app.resourceManager.addFood(this.foodValue);
            
            // Create a visual effect showing the food reward
            if (IdleAnts.app.effectManager) {
                IdleAnts.app.effectManager.createFoodRewardEffect(this.x, this.y, this.foodValue);
            }
        }
        
        // Clean up tooltip
        if (this.tooltip) {
            document.body.removeChild(this.tooltip);
            this.tooltip = null;
        }
        
        if(this.parent) this.parent.removeChild(this);
        this.isDead=true;
        if(this.healthBarContainer && this.healthBarContainer.parent){
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
        }
    }

    update(ants){
        // Acquire or validate target ant within perception range
        // Prioritize queen over regular ants
        if(!this.targetAnt || this.targetAnt.isDead){
            this.targetAnt=null;
            let nearest=null, distSq=Infinity;
            let queenTarget=null, queenDistSq=Infinity;
            
            // Check all potential targets (ants + queen)
            const allTargets = [...ants];
            
            // Add queen to target list if available
            if (IdleAnts.app && IdleAnts.app.entityManager && IdleAnts.app.entityManager.entities.queen && 
                !IdleAnts.app.entityManager.entities.queen.isDead) {
                allTargets.push(IdleAnts.app.entityManager.entities.queen);
            }
            
            allTargets.forEach(target => {
                const dx = target.x - this.x;
                const dy = target.y - this.y;
                const d = dx * dx + dy * dy;
                const dist = Math.sqrt(d);
                
                if (dist <= this.perceptionRange) {
                    // Prioritize queen if she's within range
                    if (target.isQueen) {
                        if (d < queenDistSq) {
                            queenTarget = target;
                            queenDistSq = d;
                        }
                    } else {
                        // Regular ant targeting
                        if (d < distSq) {
                            nearest = target;
                            distSq = d;
                        }
                    }
                }
            });
            
            // Prefer queen over regular ants if both are available
            this.targetAnt = queenTarget || nearest;
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
        
        // Update tooltip position if visible
        this.updateTooltipPosition();
    }
}; 