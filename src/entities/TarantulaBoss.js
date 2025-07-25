// Tarantula Boss - Venomous Spider Miniboss
IdleAnts.Entities.TarantulaBoss = class extends PIXI.Container {
    constructor(textures, mapBounds) {
        super();

        // --- Core Entity Properties ---
        this.mapBounds = mapBounds;
        this.speed = 10; // 5x regular enemy speed (regular enemies: ~1.5, this: 8)
        this.vx = 0; this.vy = 0;
        this.maxHp = 8000; // Decreased from 12000
        this.hp = this.maxHp;
        this.attackDamage = 200;
        this.attackRange = 120;
        this.attackCooldown = 90;
        this._attackTimer = 0;
        this.perceptionRange = 1200;
        this.targetAnt = null;
        this.lastAttacker = null;
        this.foodValue = 4000;
        this.enemyName = "Tarantula";
        this.isDead = false;
        
        // Unique Tarantula properties
        this.poisonDamage = 50;
        this.poisonDuration = 180; // 3 seconds of poison
        
        // Simple dart behavior
        this.dartTimer = 0;
        this.dartCooldown = 120; // 2 seconds between darts
        this.isDarting = false;
        this.dartTarget = { x: 0, y: 0 };
        this.dartSpeed = 8;
        
        // Position boss at center
        this.x = mapBounds.width * 0.5; // Center spawn
        this.y = 200;
        
        // --- Build the Spider Body First (BEHIND legs) ---
        this.body = new PIXI.Sprite(textures.body);
        this.body.anchor.set(0.5, 0.5);
        this.body.scale.set(2.0); // Smaller, more proportional
        this.addChild(this.body);
        
        // --- Create Spider Legs (8 legs, positioned correctly) ---
        this.legs = [];
        
        // Define proper spider leg positions and angles
        const legData = [
            // LEFT SIDE (4 legs)
            { x: -25, y: -10, angle: Math.PI * 0.8, id: 'L1' },   // Left front
            { x: -28, y: -2, angle: Math.PI * 0.9, id: 'L2' },    // Left mid-front  
            { x: -28, y: 8, angle: Math.PI * 1.1, id: 'L3' },     // Left mid-back
            { x: -25, y: 18, angle: Math.PI * 1.2, id: 'L4' },    // Left back
            
            // RIGHT SIDE (4 legs) 
            { x: 25, y: -10, angle: Math.PI * 0.2, id: 'R1' },    // Right front
            { x: 28, y: -2, angle: Math.PI * 0.1, id: 'R2' },     // Right mid-front
            { x: 28, y: 8, angle: -Math.PI * 0.1, id: 'R3' },     // Right mid-back  
            { x: 25, y: 18, angle: -Math.PI * 0.2, id: 'R4' }     // Right back
        ];
        
        legData.forEach((legInfo, i) => {
            // Create a single leg as one graphics object
            const leg = new PIXI.Graphics();
            
            // Draw the complete leg with multiple segments
            this.drawSpiderLeg(leg, legInfo.angle);
            
            // Position the leg at the body attachment point
            leg.position.set(legInfo.x, legInfo.y);
            
            this.legs.push({
                graphics: leg,
                baseAngle: legInfo.angle,
                attachX: legInfo.x,
                attachY: legInfo.y,
                side: legInfo.id.startsWith('L') ? 'left' : 'right',
                legNumber: i
            });
            
            this.addChild(leg);
        });
        
        // --- Add Head/Face on TOP of body ---
        this.head = new PIXI.Sprite(textures.head);
        this.head.anchor.set(0.5, 0.5);
        this.head.position.set(0, -8);
        this.head.scale.set(1.5);
        this.addChild(this.head);
        
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
                position: fixed; background: rgba(44, 24, 16, 0.95); color: white;
                padding: 8px 12px; border-radius: 4px; font-size: 14px;
                pointer-events: none; z-index: 10000; border: 1px solid rgba(139, 69, 19, 0.7);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
            `;
            document.body.appendChild(this.tooltip);
        }
        
        this.tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px; color: #8B4513;">${this.enemyName}</div>
            <div style="font-size: 12px; color: #ccc;">HP: ${this.hp}/${this.maxHp}</div>
            <div style="font-size: 12px; color: #654321;">Venomous Bite</div>
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
        this.healthBarFg.beginFill(0x2C1810); // Dark spider brown
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
        
        // Tarantula becomes more aggressive when damaged
        if (this.hp < this.maxHp * 0.5) {
            this.territoryMode = true;
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
        
        // Clean up when tarantula dies (no web traps to remove)
        
        if (this.parent) this.parent.removeChild(this);
        this.isDead = true;
        if (this.healthBarContainer && this.healthBarContainer.parent) {
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
        }

        if (IdleAnts.game && typeof IdleAnts.game.onBossDefeated === 'function') {
            IdleAnts.game.onBossDefeated('tarantula');
        }
    }

    
    // Apply poison effect to target
    applyPoison(target) {
        if (!target.poisonTimer) {
            target.poisonTimer = this.poisonDuration;
            target.poisonDamage = this.poisonDamage;
            target.isPoisoned = true;
            
            // Visual poison effect
            if (target.tint !== undefined) {
                target.originalTint = target.tint;
                target.tint = 0x90EE90; // Light green poison tint
            }
            
            console.log(`${this.enemyName} poisoned target for ${this.poisonDuration} frames`);
        }
    }
    
    // Create visual effect for attack
    createAttackEffect() {
        // Create impact particles
        for (let i = 0; i < 8; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0x8B4513);
            particle.drawCircle(0, 0, 2 + Math.random() * 3);
            particle.endFill();
            
            const angle = (i / 8) * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.life = 30;
            
            particle.x = this.x;
            particle.y = this.y + 10;
            
            if (this.parent) {
                this.parent.addChild(particle);
                
                // Animate particle
                const animateParticle = () => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.alpha -= 1/30;
                    particle.life--;
                    
                    if (particle.life <= 0) {
                        if (particle.parent) {
                            particle.parent.removeChild(particle);
                        }
                    } else {
                        requestAnimationFrame(animateParticle);
                    }
                };
                animateParticle();
            }
        }
        
        // No screen shake to avoid camera conflicts during boss fights
    }
    
    // Draw a realistic spider leg with proper segments
    drawSpiderLeg(graphics, baseAngle) {
        graphics.clear();
        
        // Leg segments with realistic proportions - MUCH THICKER
        const segments = [
            { length: 20, thickness: 12, color: 0x4A2C17 },  // Coxa (very thick base)
            { length: 15, thickness: 10, color: 0x3E2117 },  // Trochanter  
            { length: 35, thickness: 9, color: 0x2C1810 },   // Femur (longest, thick)
            { length: 30, thickness: 8, color: 0x2C1810 },   // Patella
            { length: 25, thickness: 7, color: 0x1A0F08 },   // Tibia
            { length: 15, thickness: 6, color: 0x1A0F08 }    // Tarsus (foot)
        ];
        
        let currentX = 0;
        let currentY = 0;
        let currentAngle = baseAngle;
        
        segments.forEach((segment, index) => {
            // Calculate end point
            const endX = currentX + Math.cos(currentAngle) * segment.length;
            const endY = currentY + Math.sin(currentAngle) * segment.length;
            
            // Draw segment as thick line
            graphics.lineStyle(segment.thickness, segment.color);
            graphics.moveTo(currentX, currentY);
            graphics.lineTo(endX, endY);
            
            // Add darker outline for definition
            graphics.lineStyle(segment.thickness + 2, 0x1A0F08, 0.3);
            graphics.moveTo(currentX, currentY);
            graphics.lineTo(endX, endY);
            
            // Redraw the main segment on top
            graphics.lineStyle(segment.thickness, segment.color);
            graphics.moveTo(currentX, currentY);
            graphics.lineTo(endX, endY);
            
            // Add joint between segments (except last one)
            if (index < segments.length - 1) {
                graphics.beginFill(segment.color);
                graphics.drawCircle(endX, endY, segment.thickness * 0.8);
                graphics.endFill();
                
                // Joint outline
                graphics.lineStyle(2, 0x1A0F08);
                graphics.drawCircle(endX, endY, segment.thickness * 0.8);
            }
            
            // Move to next segment
            currentX = endX;
            currentY = endY;
            
            // Adjust angle for natural leg bend
            if (index === 1) currentAngle += 0.3; // Bend at trochanter
            if (index === 3) currentAngle -= 0.4; // Bend at patella
            if (index === 4) currentAngle += 0.2; // Slight bend at tibia
        });
        
        // Add larger foot/claw at the end
        graphics.beginFill(0x000000);
        graphics.drawCircle(currentX, currentY, 5);
        graphics.endFill();
        
        // Draw more prominent claws
        graphics.lineStyle(2, 0x000000);
        const clawAngle1 = currentAngle + 0.5;
        const clawAngle2 = currentAngle - 0.5;
        graphics.moveTo(currentX, currentY);
        graphics.lineTo(currentX + Math.cos(clawAngle1) * 6, currentY + Math.sin(clawAngle1) * 6);
        graphics.moveTo(currentX, currentY);
        graphics.lineTo(currentX + Math.cos(clawAngle2) * 6, currentY + Math.sin(clawAngle2) * 6);
    }

    attack(target) {
        if (this._attackTimer === 0) {
            target.takeDamage(this.attackDamage, this);
            this._attackTimer = this.attackCooldown;

            // Trigger attack animation
            this.isAttacking = true;
            this.animationTimer = 0;
            
            // Tarantula has chance to poison target when attacking
            if (Math.random() < 0.4) {
                this.applyPoison(target);
            }
        }
    }

    update(ants) {
        // Handle attack animation
        if (this.isAttacking) {
            this.animationTimer++;
            const duration = 30;
            
            if (this.animationTimer < duration * 0.5) {
                const progress = this.animationTimer / (duration * 0.5);
                this.head.rotation = -0.3 * progress;
                this.body.scale.set(2.0 + 0.1 * progress);
            } else if (this.animationTimer < duration) {
                const progress = (this.animationTimer - duration * 0.5) / (duration * 0.5);
                this.head.rotation = -0.3 + 0.5 * progress;
                this.body.scale.set(2.1 - 0.1 * progress);
                
                if (this.animationTimer === Math.floor(duration * 0.7)) {
                    this.createAttackEffect();
                }
            } else {
                this.isAttacking = false;
                this.head.rotation = 0;
                this.body.scale.set(2.0);
            }
        } else {
            // Idle animation
            this.animationTimer++;
            const breathe = 0.02 * Math.sin(this.animationTimer * 0.05);
            this.body.rotation = breathe;
            
            // Simple leg animation
            this.legs.forEach((leg, i) => {
                const isMoving = Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1;
                if (isMoving) {
                    const walkCycle = Math.sin(this.animationTimer * 0.3 + i * Math.PI / 4);
                    leg.graphics.rotation = walkCycle * 0.15;
                } else {
                    leg.graphics.rotation = breathe * 0.1;
                }
            });
        }

        // Simple targeting - find nearest ant/queen within range
        let target = null;
        let minDist = this.perceptionRange;
        
        // Check ants
        ants.forEach(ant => {
            if (ant.isDead) return;
            const dx = ant.x - this.x;
            const dy = ant.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                target = ant;
                minDist = dist;
            }
        });
        
        // Check queen
        if (IdleAnts.app?.entityManager?.entities?.queen && !IdleAnts.app.entityManager.entities.queen.isDead) {
            const queen = IdleAnts.app.entityManager.entities.queen;
            const dx = queen.x - this.x;
            const dy = queen.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                target = queen;
                minDist = dist;
            }
        }
        
        this.targetAnt = target;

        if (this.targetAnt) {
            const dx = this.targetAnt.x - this.x;
            const dy = this.targetAnt.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Check if swarmed (3+ ants within 80 pixels) and should dart away
            const nearbyAnts = ants.filter(ant => {
                if (ant.isDead) return false;
                const antDx = ant.x - this.x;
                const antDy = ant.y - this.y;
                return Math.sqrt(antDx * antDx + antDy * antDy) < 80;
            }).length;
            
            if (!this.isDarting && nearbyAnts >= 3 && Math.random() < 0.4) {
                // Start darting away from swarm
                this.startDart();
            }
            
            if (this.isDarting) {
                // Continue darting
                this.handleDart();
            } else if (dist > this.attackRange) {
                // Move toward target
                this.vx = (dx / dist) * this.speed;
                this.vy = (dy / dist) * this.speed;
                this.x += this.vx;
                this.y += this.vy;
            } else {
                // Attack
                this.vx = 0;
                this.vy = 0;
                if (this._attackTimer === 0) {
                    this.attack(this.targetAnt);
                }
            }
        } else {
            // No target - random movement
            if (!this.isDarting && Math.random() < 0.02) {
                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * this.speed * 0.3;
                this.vy = Math.sin(angle) * this.speed * 0.3;
            }
            this.x += this.vx;
            this.y += this.vy;
        }
        
        // Update dart timer
        this.dartTimer++;

        // Boundaries
        if (this.x < 40) { this.x = 40; this.vx = Math.abs(this.vx); }
        if (this.x > this.mapBounds.width - 40) { this.x = this.mapBounds.width - 40; this.vx = -Math.abs(this.vx); }
        if (this.y < 40) { this.y = 40; this.vy = Math.abs(this.vy); }
        if (this.y > this.mapBounds.height - 40) { this.y = this.mapBounds.height - 40; this.vy = -Math.abs(this.vy); }

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
    
    // Simple dart behavior when swarmed
    startDart() {
        if (this.dartTimer < this.dartCooldown) return; // On cooldown
        
        this.isDarting = true;
        this.dartTimer = 0;
        
        // Pick a random direction to dart to
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 50; // 100-150 pixels away
        
        this.dartTarget.x = Math.max(60, Math.min(this.mapBounds.width - 60, 
            this.x + Math.cos(angle) * distance));
        this.dartTarget.y = Math.max(60, Math.min(this.mapBounds.height - 60, 
            this.y + Math.sin(angle) * distance));
    }
    
    // Handle darting movement
    handleDart() {
        const dx = this.dartTarget.x - this.x;
        const dy = this.dartTarget.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 10) {
            // Continue darting
            this.vx = (dx / dist) * this.dartSpeed;
            this.vy = (dy / dist) * this.dartSpeed;
            this.x += this.vx;
            this.y += this.vy;
        } else {
            // Dart complete
            this.isDarting = false;
        }
    }
};