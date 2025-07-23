// Japanese Giant Hornet - Aerial Assault Miniboss
IdleAnts.Entities.GiantHornetBoss = class extends PIXI.Container {
    constructor(textures, mapBounds) {
        super();

        // --- Core Entity Properties ---
        this.mapBounds = mapBounds;
        this.speed = 1.8;
        this.vx = 0; this.vy = 0;
        this.maxHp = 9000;
        this.hp = this.maxHp;
        this.attackDamage = 300;
        this.attackRange = 150;
        this.attackCooldown = 45;
        this._attackTimer = 0;
        this.perceptionRange = 600;
        this.targetAnt = null;
        this.lastAttacker = null;
        this.foodValue = 4000;
        this.enemyName = "Giant Hornet";
        this.isDead = false;
        
        // Unique Giant Hornet properties
        this.diveBombTimer = 0;
        this.diveBombCooldown = 240; // Dive bomb every 4 seconds
        this.isDiveBombing = false;
        this.diveBombTarget = null;
        this.diveBombSpeed = 4.0;
        this.flightHeight = 80; // Flies higher than ground units
        this.hoverRadius = 150;
        this.poisonCloudTimer = 0;
        this.poisonCloudCooldown = 300; // Poison cloud every 5 seconds
        
        // Position boss (spawn from right side, high up)
        this.x = mapBounds.width * 0.9;
        this.y = 100;
        
        // --- Build the Animated Sprite ---
        this.body = new PIXI.Sprite(textures.body);
        this.body.anchor.set(0.5, 0.5);
        this.body.scale.set(3.0); // Large hornet size
        
        // Create wings
        this.leftWing = new PIXI.Sprite(textures.wing);
        this.leftWing.anchor.set(0.5, 0.5);
        this.leftWing.position.set(-25, -10);
        this.leftWing.scale.set(2.0);
        
        this.rightWing = new PIXI.Sprite(textures.wing);
        this.rightWing.anchor.set(0.5, 0.5);
        this.rightWing.position.set(25, -10);
        this.rightWing.scale.set(-2.0, 2.0); // Flip horizontally
        
        // Create stinger
        this.stinger = new PIXI.Sprite(textures.stinger);
        this.stinger.anchor.set(0.5, 0.5);
        this.stinger.position.set(0, 30);
        this.stinger.scale.set(2.5);
        
        this.addChild(this.body);
        this.addChild(this.leftWing);
        this.addChild(this.rightWing);
        this.addChild(this.stinger);

        // --- Health Bar & Interactivity ---
        this.createHealthBar();
        this.healthBarTimer = 0;
        this.interactive = true;
        this.buttonMode = true;
        this.setupTooltip();

        // Animation state
        this.animationTimer = 0;
        this.isAttacking = false;
        this.wingBeatPhase = 0;
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
                position: fixed; background: rgba(255, 140, 0, 0.9); color: white;
                padding: 8px 12px; border-radius: 4px; font-size: 14px;
                pointer-events: none; z-index: 10000; border: 1px solid rgba(255, 165, 0, 0.5);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(this.tooltip);
        }
        
        this.tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px; color: #FFA500;">${this.enemyName}</div>
            <div style="font-size: 12px; color: #ccc;">HP: ${this.hp}/${this.maxHp}</div>
            <div style="font-size: 12px; color: #FF6347;">Dive Bomb: ${this.isDiveBombing ? 'ACTIVE' : 'Ready'}</div>
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
        this.healthBarFg.beginFill(0xFF8C00); // Orange hornet color
        this.healthBarFg.drawRect(-15, 0, 30 * ratio, 4);
        this.healthBarFg.endFill();
        this.healthBarContainer.visible = true;
        this.healthBarTimer = 1800;
        this.healthBarContainer.x = this.x;
        this.healthBarContainer.y = this.y - 35;
    }

    takeDamage(dmg, attacker = null) {
        this.hp -= dmg;
        if (IdleAnts.game && IdleAnts.game.uiManager) {
            IdleAnts.game.uiManager.updateBossHealth(this.hp, this.maxHp);
        }
        
        if (attacker) {
            this.lastAttacker = attacker;
        }
        
        // Giant Hornet becomes more aggressive and faster when damaged
        if (this.hp < this.maxHp * 0.5) {
            this.speed = 2.2;
            this.diveBombCooldown = 180; // Dive bomb more frequently
            this.poisonCloudCooldown = 240; // Poison clouds more frequently
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
        
        if (this.parent) this.parent.removeChild(this);
        this.isDead = true;
        if (this.healthBarContainer && this.healthBarContainer.parent) {
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
        }

        if (IdleAnts.game && typeof IdleAnts.game.onBossDefeated === 'function') {
            IdleAnts.game.onBossDefeated('giant_hornet');
        }
    }

    // Dive bomb attack - targets a specific ant with high-speed charge
    startDiveBomb(target) {
        if (this.isDiveBombing || !target) return;
        
        this.isDiveBombing = true;
        this.diveBombTarget = target;
        this.diveBombTimer = 0;
        
        // Calculate dive bomb trajectory
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        this.vx = (dx / dist) * this.diveBombSpeed;
        this.vy = (dy / dist) * this.diveBombSpeed;
        
        console.log(`Giant Hornet initiating dive bomb attack!`);
    }

    // Create poison cloud effect (visual representation)
    createPoisonCloud() {
        const cloudEffect = new PIXI.Graphics();
        cloudEffect.beginFill(0x32CD32, 0.3);
        cloudEffect.drawCircle(0, 0, 60);
        cloudEffect.endFill();
        
        cloudEffect.x = this.x;
        cloudEffect.y = this.y;
        
        if (this.parent) {
            this.parent.addChild(cloudEffect);
        }
        
        // Animate poison cloud
        let cloudTimer = 0;
        const cloudDuration = 120; // 2 seconds
        const cloudUpdate = () => {
            cloudTimer++;
            cloudEffect.alpha = Math.max(0, 0.4 - (cloudTimer / cloudDuration) * 0.4);
            
            if (cloudTimer >= cloudDuration) {
                if (cloudEffect.parent) {
                    cloudEffect.parent.removeChild(cloudEffect);
                }
            }
        };
        
        // Add to game loop (simplified approach)
        const cloudInterval = setInterval(() => {
            cloudUpdate();
            if (cloudTimer >= cloudDuration) {
                clearInterval(cloudInterval);
            }
        }, 16); // ~60fps
        
        console.log(`Giant Hornet released poison cloud!`);
    }

    attack(target) {
        if (this._attackTimer === 0) {
            target.takeDamage(this.attackDamage, this);
            this._attackTimer = this.attackCooldown;

            // Trigger attack animation
            this.isAttacking = true;
            this.animationTimer = 0;
            
            // Giant Hornet has chance to create poison cloud when attacking
            if (Math.random() < 0.4) {
                this.createPoisonCloud();
            }
        }
    }

    update(ants) {
        // Handle wing beat animation (constant for flight)
        this.wingBeatPhase += 0.3;
        const wingBeat = Math.sin(this.wingBeatPhase) * 0.2;
        this.leftWing.rotation = wingBeat;
        this.rightWing.rotation = -wingBeat;

        // Handle attack animation
        if (this.isAttacking) {
            this.animationTimer++;
            const duration = 30;
            
            if (this.animationTimer < duration / 2) {
                // Pull back stinger
                this.stinger.rotation = -0.3 * (this.animationTimer / (duration / 2));
            } else if (this.animationTimer < duration) {
                // Thrust stinger forward
                this.stinger.rotation = -0.3 + 0.5 * ((this.animationTimer - duration / 2) / (duration / 2));
            } else {
                this.isAttacking = false;
                this.stinger.rotation = 0;
            }
        } else {
            // Idle hovering animation
            this.animationTimer++;
            const hover = Math.sin(this.animationTimer * 0.05) * 5;
            this.body.y = hover;
        }

        // Dive bomb logic
        this.diveBombTimer++;
        if (!this.isDiveBombing && this.diveBombTimer >= this.diveBombCooldown) {
            // Find target for dive bomb
            if (ants.length > 0) {
                const randomAnt = ants[Math.floor(Math.random() * ants.length)];
                this.startDiveBomb(randomAnt);
            }
            this.diveBombTimer = 0;
        }

        // Handle dive bomb execution
        if (this.isDiveBombing) {
            this.x += this.vx;
            this.y += this.vy;
            
            // Check if dive bomb hit target or went too far
            if (this.diveBombTarget) {
                const dx = this.diveBombTarget.x - this.x;
                const dy = this.diveBombTarget.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 50) {
                    // Hit target - deal extra damage
                    this.diveBombTarget.takeDamage(this.attackDamage * 1.5, this);
                    this.isDiveBombing = false;
                    this.diveBombTarget = null;
                } else if (dist > 500) {
                    // Missed target - stop dive bomb
                    this.isDiveBombing = false;
                    this.diveBombTarget = null;
                }
            }
        } else {
            // Poison cloud logic
            this.poisonCloudTimer++;
            if (this.poisonCloudTimer >= this.poisonCloudCooldown) {
                this.createPoisonCloud();
                this.poisonCloudTimer = 0;
            }

            // Standard enemy AI logic when not dive bombing
            if (!this.targetAnt || this.targetAnt.isDead) {
                this.targetAnt = null;
                let nearest = null, distSq = Infinity;
                ants.forEach(ant => {
                    const dx = ant.x - this.x;
                    const dy = ant.y - this.y;
                    const d = dx * dx + dy * dy;
                    if (d < distSq && Math.sqrt(d) <= this.perceptionRange) {
                        nearest = ant;
                        distSq = d;
                    }
                });
                if (nearest) this.targetAnt = nearest;
            }

            if (this.targetAnt && !this.targetAnt.isDead) {
                const dx = this.targetAnt.x - this.x;
                const dy = this.targetAnt.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > this.attackRange) {
                    // Aerial movement - hover above target
                    this.vx = (dx / dist) * this.speed;
                    this.vy = (dy / dist) * this.speed * 0.5; // Less vertical movement
                    
                    this.x += this.vx;
                    this.y += this.vy;
                    
                    // Maintain flight height
                    if (this.y > this.flightHeight + 50) {
                        this.y -= 2;
                    } else if (this.y < this.flightHeight - 50) {
                        this.y += 2;
                    }
                } else {
                    this.vx = 0;
                    this.vy = 0;
                    if (this._attackTimer === 0) {
                        this.attack(this.targetAnt);
                    }
                }
            } else {
                // Aerial patrol behavior - figure-8 pattern
                if (Math.random() < 0.05) {
                    const angle = Math.random() * Math.PI * 2;
                    this.vx = Math.cos(angle) * this.speed * 0.7;
                    this.vy = Math.sin(angle) * this.speed * 0.3;
                }
                this.x += this.vx;
                this.y += this.vy;
                
                // Maintain flight height
                if (this.y > this.flightHeight + 30) {
                    this.vy -= 0.1;
                } else if (this.y < this.flightHeight - 30) {
                    this.vy += 0.1;
                }
            }
        }

        // Boundaries
        if (this.x < 50 || this.x > this.mapBounds.width - 50) this.vx *= -1;
        if (this.y < 50 || this.y > this.mapBounds.height - 50) this.vy *= -1;

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
            this.healthBarContainer.y = this.y - 35;
        }
        this.updateTooltipPosition();
    }
}; ''