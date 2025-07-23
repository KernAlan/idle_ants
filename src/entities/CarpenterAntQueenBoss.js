// Rival Carpenter Ant Queen - Territory War Miniboss
IdleAnts.Entities.CarpenterAntQueenBoss = class extends PIXI.Container {
    constructor(textures, mapBounds) {
        super();

        // --- Core Entity Properties ---
        this.mapBounds = mapBounds;
        this.speed = 10; // 5x regular enemy speed (regular enemies: ~1.5, this: 8)
        this.vx = 0; this.vy = 0;
        this.maxHp = 15000;
        this.hp = this.maxHp;
        this.attackDamage = 1000;
        this.attackRange = 90;
        this.attackCooldown = 60;
        this._attackTimer = 0;
        this.perceptionRange = 1500;
        this.targetAnt = null;
        this.lastAttacker = null;
        this.foodValue = 3500;
        this.enemyName = "Carpenter Queen";
        this.isDead = false;
        
        // Unique Carpenter Queen properties
        this.guardSpawnTimer = 0;
        this.guardSpawnCooldown = 300; // Spawn guards every 5 seconds
        this.maxGuards = 4;
        this.currentGuards = [];
        this.territoryRadius = 200;
        
        // Position boss
        this.x = mapBounds.width * 0.1; // Left side spawn
        this.y = 250;
        
        // --- Build the Animated Sprite ---
        this.body = new PIXI.Sprite(textures.body);
        this.body.anchor.set(0.5, 0.5);
        this.body.scale.set(2.5); // Large queen size
        
        this.head = new PIXI.Sprite(textures.head);
        this.head.anchor.set(0.5, 0.5);
        this.head.position.set(0, -20);
        this.head.scale.set(2.0);

        // Create segments for carpenter ant body
        this.segments = [];
        for (let i = 0; i < 3; i++) {
            const segment = new PIXI.Sprite(textures.body);
            segment.anchor.set(0.5, 0.5);
            segment.scale.set(1.8 - i * 0.2);
            segment.position.set(0, 15 + i * 12);
            this.segments.push(segment);
            this.addChild(segment);
        }
        
        this.addChild(this.body);
        this.addChild(this.head);

        // --- Health Bar & Interactivity ---
        this.createHealthBar();
        this.healthBarTimer = 0;
        this.interactive = true;
        this.buttonMode = true;
        this.setupTooltip();

        // Animation state
        this.animationTimer = 0;
        this.isAttacking = false;
        this.territoryMode = false;
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
                position: fixed; background: rgba(139, 69, 19, 0.9); color: white;
                padding: 8px 12px; border-radius: 4px; font-size: 14px;
                pointer-events: none; z-index: 10000; border: 1px solid rgba(210, 105, 30, 0.5);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(this.tooltip);
        }
        
        this.tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px; color: #D2691E;">${this.enemyName}</div>
            <div style="font-size: 12px; color: #ccc;">HP: ${this.hp}/${this.maxHp}</div>
            <div style="font-size: 12px; color: #A0522D;">Guards: ${this.currentGuards.length}/${this.maxGuards}</div>
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
        this.healthBarBg.beginFill(0x000000, 0.6);
        this.healthBarBg.drawRect(-15, 0, 30, 4);
        this.healthBarBg.endFill();
        this.healthBarContainer.addChild(this.healthBarBg);

        this.healthBarFg = new PIXI.Graphics();
        this.healthBarContainer.addChild(this.healthBarFg);
        this.updateHealthBar();
        this.healthBarContainer.visible = false;
    }

    updateHealthBar() {
        const ratio = Math.max(this.hp, 0) / this.maxHp;
        this.healthBarFg.clear();
        this.healthBarFg.beginFill(0x8B4513); // Carpenter brown
        this.healthBarFg.drawRect(-15, 0, 30 * ratio, 4);
        this.healthBarFg.endFill();
        this.healthBarContainer.visible = true;
        this.healthBarTimer = 1800;
        this.healthBarContainer.x = this.x;
        this.healthBarContainer.y = this.y - 25;
    }

    takeDamage(dmg, attacker = null) {
        this.hp -= dmg;
        if (IdleAnts.game && IdleAnts.game.uiManager) {
            IdleAnts.game.uiManager.updateBossHealth(this.hp, this.maxHp);
        }
        
        if (attacker) {
            this.lastAttacker = attacker;
        }
        
        // Carpenter Queen becomes more aggressive when damaged
        if (this.hp < this.maxHp * 0.5) {
            this.territoryMode = true;
            this.guardSpawnCooldown = 180; // Spawn guards faster when low HP
        }
        
        if (this.hp <= 0) this.die();
    }

    die() {
        if (this.lastAttacker && IdleAnts.app && IdleAnts.app.resourceManager) {
            IdleAnts.app.resourceManager.addFood(this.foodValue);
        }
        
        if (this.tooltip) {
            document.body.removeChild(this.tooltip);
            this.tooltip = null;
        }
        
        // Remove all guards when queen dies
        this.currentGuards.forEach(guard => {
            if (guard && guard.parent) {
                guard.parent.removeChild(guard);
            }
        });
        this.currentGuards = [];
        
        if (this.parent) this.parent.removeChild(this);
        this.isDead = true;
        if (this.healthBarContainer && this.healthBarContainer.parent) {
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
        }

        if (IdleAnts.game && typeof IdleAnts.game.onBossDefeated === 'function') {
            IdleAnts.game.onBossDefeated('carpenter_ant_queen');
        }
    }

    // Spawn carpenter ant guards
    spawnGuard() {
        if (this.currentGuards.length >= this.maxGuards) return;
        
        // Create a simple guard ant (using existing ant visual style)
        const guard = new PIXI.Container();
        const guardBody = new PIXI.Graphics();
        
        // Brown carpenter ant colors
        guardBody.beginFill(0x8B4513);
        guardBody.drawEllipse(0, 0, 8, 12);
        guardBody.endFill();
        
        // Add head
        guardBody.beginFill(0x654321);
        guardBody.drawCircle(0, -8, 6);
        guardBody.endFill();
        
        guard.addChild(guardBody);
        
        // Position guard near queen
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        guard.x = this.x + Math.cos(angle) * distance;
        guard.y = this.y + Math.sin(angle) * distance;
        
        // Guard properties
        guard.hp = 50;
        guard.maxHp = 50;
        guard.speed = 1.2;
        guard.attackDamage = 25;
        guard.attackRange = 30;
        guard.vx = 0;
        guard.vy = 0;
        guard.isGuard = true;
        guard.queen = this;
        
        this.currentGuards.push(guard);
        
        // Add to the game world
        if (this.parent) {
            this.parent.addChild(guard);
        }
        
        console.log(`Carpenter Queen spawned guard (${this.currentGuards.length}/${this.maxGuards})`);
    }

    attack(target) {
        if (this._attackTimer === 0) {
            target.takeDamage(this.attackDamage, this);
            this._attackTimer = this.attackCooldown;

            // Trigger attack animation
            this.isAttacking = true;
            this.animationTimer = 0;
            
            // Carpenter Queen has chance to spawn guard when attacking
            if (Math.random() < 0.3) {
                this.spawnGuard();
            }
        }
    }

    update(ants) {
        // Handle attack animation
        if (this.isAttacking) {
            this.animationTimer++;
            const duration = 40;
            
            if (this.animationTimer < duration / 2) {
                // Rear back
                this.head.rotation = -0.2 * (this.animationTimer / (duration / 2));
            } else if (this.animationTimer < duration) {
                // Strike forward
                this.head.rotation = -0.2 + 0.3 * ((this.animationTimer - duration / 2) / (duration / 2));
            } else {
                this.isAttacking = false;
                this.head.rotation = 0;
            }
        } else {
            // Idle animation
            this.animationTimer++;
            const breathe = 0.03 * Math.sin(this.animationTimer * 0.04);
            this.body.rotation = breathe;
            this.segments.forEach((segment, i) => {
                segment.rotation = breathe * (1 - i * 0.2);
            });
        }

        // Guard spawning logic
        this.guardSpawnTimer++;
        if (this.guardSpawnTimer >= this.guardSpawnCooldown) {
            this.spawnGuard();
            this.guardSpawnTimer = 0;
        }

        // Remove dead guards
        this.currentGuards = this.currentGuards.filter(guard => guard && guard.parent && guard.hp > 0);

        // Dynamic targeting AI logic - continuously poll for best target
        let nearestAnt = null, antDistSq = Infinity;
        let queenTarget = null, queenDistSq = Infinity;
        let attackingAnt = null, attackingDistSq = Infinity;
        
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

        if (this.targetAnt && !this.targetAnt.isDead) {
            const dx = this.targetAnt.x - this.x;
            const dy = this.targetAnt.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > this.attackRange) {
                // Move toward target but stay within territory if in territory mode
                this.vx = (dx / dist) * this.speed;
                this.vy = (dy / dist) * this.speed;
                
                if (this.territoryMode) {
                    // Limit movement within territory
                    const territoryCenter = { x: this.mapBounds.width * 0.1, y: 250 };
                    const centerDist = Math.sqrt((this.x - territoryCenter.x) ** 2 + (this.y - territoryCenter.y) ** 2);
                    if (centerDist > this.territoryRadius) {
                        const backToCenter = {
                            x: (territoryCenter.x - this.x) / centerDist,
                            y: (territoryCenter.y - this.y) / centerDist
                        };
                        this.vx = backToCenter.x * this.speed * 0.5;
                        this.vy = backToCenter.y * this.speed * 0.5;
                    }
                }
                
                this.x += this.vx;
                this.y += this.vy;
            } else {
                this.vx = 0;
                this.vy = 0;
                if (this._attackTimer === 0) {
                    this.attack(this.targetAnt);
                }
            }
        } else {
            // Territorial patrol behavior
            if (Math.random() < 0.02) {
                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * this.speed * 0.5;
                this.vy = Math.sin(angle) * this.speed * 0.5;
            }
            this.x += this.vx;
            this.y += this.vy;
        }

        // Boundaries
        if (this.x < 0 || this.x > this.mapBounds.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.mapBounds.height) this.vy *= -1;

        // Cooldown timer
        if (this._attackTimer > 0) this._attackTimer--;

        // Health bar update
        if (this.healthBarTimer > 0) {
            this.healthBarTimer--;
            if (this.healthBarTimer === 0) {
                this.healthBarContainer.visible = false;
            }
        }
        if (this.healthBarContainer) {
            this.healthBarContainer.x = this.x;
            this.healthBarContainer.y = this.y - 25;
        }
        this.updateTooltipPosition();
    }
};