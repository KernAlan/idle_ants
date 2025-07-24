// Golden Ant - Ultimate reward for completing all daily challenges
IdleAnts.Entities.GoldenAnt = class extends IdleAnts.Entities.AntBase {
    constructor(x, y, texture) {
        // Create a nestPosition object for the parent constructor
        const nestPosition = { x: x, y: y };
        // Pass null texture to prevent base ant sprite from being created
        super(null, nestPosition, 1);
        
        // Golden Ant specific properties
        this.isGolden = true;
        this.antType = 'golden';
        
        // EXTREME STATS - Near invincible
        this.speed = 10.0; // 10x normal ant speed
        this.carryCapacity = 10; // Can carry 10 food items (still amazing)
        this.foodMultiplier = 10.0; // 10x food value multiplier (still great)
        // Remove custom collection time - let it use food's collection time
        
        // Combat stats - Near invincible
        this.maxHp = 10000;
        this.hp = this.maxHp;
        this.attackDamage = 500;
        this.attackRange = 80;
        this.attackCooldown = 10; // Very fast attacks
        this.defense = 0.95; // 95% damage reduction
        
        // Special abilities
        this.regenerationRate = 50; // Regenerate 50 HP per second
        this.auraRadius = 200; // Buff nearby ants
        this.auraStrength = 2.0; // 2x boost to nearby ants
        
        // Create a comically dazzling golden ant sprite
        this.createGoldenAntSprite();
        this.scale.set(1.3); // Make it bigger
        
        // Let the parent class handle capacity initialization properly
        // Just ensure it matches our carry capacity
        this.capacity = this.carryCapacity;
        
        // Ensure the golden ant has proper config (needed for food collection)
        this.config = this.config || {};
        this.config.foodCollectionRadius = this.config.foodCollectionRadius || 15;
        this.config.nestRadius = this.config.nestRadius || 25;
        this.config.minDistanceToDepositFood = this.config.minDistanceToDepositFood || 30;
        this.config.canStackFood = this.capacity > 1;
        
        // Particle effects
        this.sparkleTimer = 0;
        
        // State tracking
        this.isAttacking = false;
        this.regenerationTimer = 0;
    }
    
    createGoldenAntSprite() {
        // Create a new ABSOLUTELY GOLDEN ant graphics
        const goldenAnt = new PIXI.Graphics();
        
        // BODY - All golden, no black whatsoever!
        // Outer golden glow
        goldenAnt.beginFill(0xFFD700, 0.6);
        goldenAnt.drawEllipse(0, 0, 20, 14);
        goldenAnt.endFill();
        
        // Middle golden layer
        goldenAnt.beginFill(0xFFD700, 0.8);
        goldenAnt.drawEllipse(0, 0, 16, 10);
        goldenAnt.endFill();
        
        // Main golden body - BRIGHT GOLD
        goldenAnt.beginFill(0xFFD700);
        goldenAnt.drawEllipse(0, 0, 14, 8);
        goldenAnt.endFill();
        
        // Golden highlights - even brighter!
        goldenAnt.beginFill(0xFFFACD);
        goldenAnt.drawEllipse(-2, -1, 10, 5);
        goldenAnt.endFill();
        
        goldenAnt.beginFill(0xFFFFE0); // Light yellow highlight
        goldenAnt.drawEllipse(-3, -2, 6, 3);
        goldenAnt.endFill();
        
        goldenAnt.beginFill(0xFFFFFF, 0.9); // Bright white shine
        goldenAnt.drawEllipse(-4, -2, 4, 2);
        goldenAnt.endFill();
        
        // ABDOMEN - Golden rear section (no black butt!)
        goldenAnt.beginFill(0xFFD700, 0.5); // Golden glow
        goldenAnt.drawEllipse(0, 8, 12, 8);
        goldenAnt.endFill();
        
        goldenAnt.beginFill(0xFFD700); // Main golden abdomen
        goldenAnt.drawEllipse(0, 8, 10, 6);
        goldenAnt.endFill();
        
        goldenAnt.beginFill(0xFFFACD); // Golden highlight on abdomen
        goldenAnt.drawEllipse(-1, 7, 6, 3);
        goldenAnt.endFill();
        
        goldenAnt.beginFill(0xFFFFE0); // Light golden shine
        goldenAnt.drawEllipse(-2, 6, 3, 2);
        goldenAnt.endFill();
        
        // HEAD - Completely golden!
        goldenAnt.beginFill(0xFFD700, 0.5); // Golden glow
        goldenAnt.drawCircle(0, -10, 9);
        goldenAnt.endFill();
        
        goldenAnt.beginFill(0xFFD700); // Main golden head
        goldenAnt.drawCircle(0, -10, 7);
        goldenAnt.endFill();
        
        goldenAnt.beginFill(0xFFFACD); // Golden highlight
        goldenAnt.drawCircle(-1, -11, 4);
        goldenAnt.endFill();
        
        goldenAnt.beginFill(0xFFFFE0); // Lighter golden highlight
        goldenAnt.drawCircle(-2, -12, 2);
        goldenAnt.endFill();
        
        // CROWN - Pure gold and white!
        goldenAnt.beginFill(0xFFFFFF);
        goldenAnt.moveTo(-5, -14);
        goldenAnt.lineTo(-3, -20);
        goldenAnt.lineTo(0, -17);
        goldenAnt.lineTo(3, -20);
        goldenAnt.lineTo(5, -14);
        goldenAnt.lineTo(0, -13);
        goldenAnt.closePath();
        goldenAnt.endFill();
        
        // Crown base - golden
        goldenAnt.beginFill(0xFFD700);
        goldenAnt.drawRect(-5, -14, 10, 2);
        goldenAnt.endFill();
        
        // Crown gems - bright colors
        goldenAnt.beginFill(0xFF6B6B); // Bright red
        goldenAnt.drawCircle(-2, -17, 1.2);
        goldenAnt.beginFill(0x4ECDC4); // Bright teal  
        goldenAnt.drawCircle(2, -17, 1.2);
        goldenAnt.beginFill(0x45B7D1); // Bright blue
        goldenAnt.drawCircle(0, -16, 1.2);
        goldenAnt.endFill();
        
        // EYES - Golden with bright pupils (NO BLACK!)
        goldenAnt.beginFill(0xFFFFFF); // White base
        goldenAnt.drawCircle(-2.5, -10, 2);
        goldenAnt.drawCircle(2.5, -10, 2);
        goldenAnt.endFill();
        
        goldenAnt.beginFill(0xFFD700); // Golden pupils instead of black!
        goldenAnt.drawCircle(-2.5, -10, 1.2);
        goldenAnt.drawCircle(2.5, -10, 1.2);
        goldenAnt.endFill();
        
        goldenAnt.beginFill(0xFFFFE0); // Light golden shine
        goldenAnt.drawCircle(-2.5, -10, 0.6);
        goldenAnt.drawCircle(2.5, -10, 0.6);
        goldenAnt.endFill();
        
        // LEGS - THICK GOLDEN LEGS
        goldenAnt.lineStyle(4, 0xFFD700); // Thicker golden legs
        // Left legs
        goldenAnt.moveTo(-7, -2);
        goldenAnt.lineTo(-12, 3);
        goldenAnt.moveTo(-7, 0);
        goldenAnt.lineTo(-12, 5);
        goldenAnt.moveTo(-7, 2);
        goldenAnt.lineTo(-12, 7);
        
        // Right legs  
        goldenAnt.moveTo(7, -2);
        goldenAnt.lineTo(12, 3);
        goldenAnt.moveTo(7, 0);
        goldenAnt.lineTo(12, 5);
        goldenAnt.moveTo(7, 2);
        goldenAnt.lineTo(12, 7);
        
        // Add golden leg joints
        goldenAnt.beginFill(0xFFD700);
        [-7, 7].forEach(x => {
            [-2, 0, 2].forEach(y => {
                goldenAnt.drawCircle(x, y, 1.5);
            });
        });
        goldenAnt.endFill();
        
        // ANTENNAE - Golden with golden tips!
        goldenAnt.lineStyle(3, 0xFFD700); // Thicker golden antennae
        goldenAnt.moveTo(-2, -16);
        goldenAnt.lineTo(-5, -22);
        goldenAnt.moveTo(2, -16);
        goldenAnt.lineTo(5, -22);
        
        goldenAnt.beginFill(0xFFD700); // Golden tips
        goldenAnt.drawCircle(-5, -22, 2);
        goldenAnt.drawCircle(5, -22, 2);
        goldenAnt.endFill();
        
        goldenAnt.beginFill(0xFFFFFF); // White sparkle on tips
        goldenAnt.drawCircle(-5, -22, 1);
        goldenAnt.drawCircle(5, -22, 1);
        goldenAnt.endFill();
        
        // Store reference to golden graphics  
        this.goldenGraphics = goldenAnt;
        
        // Replace the original texture with our GOLDEN ant
        this.removeChildren();
        this.addChild(this.goldenGraphics);
        
        // Position the graphics at center (Graphics doesn't have anchor, so we center manually)
        this.goldenGraphics.x = 0;
        this.goldenGraphics.y = 0;
        this.goldenGraphics.pivot.set(0, 0); // Set pivot point to center the graphics
        
        // Create health bar (needed for proper ant behavior)
        this.createHealthBar();
        
        // Add pulsing effect
        this.pulseTimer = 0;
        this.dazzleTimer = 0;
        this.rainbowTimer = 0;
        this.scaleTimer = 0;
        this.rotationTimer = 0;
    }
    
    updateRidiculousDazzle() {
        // Multiple overlapping animation timers for maximum ridiculousness
        this.pulseTimer += 0.15;
        this.dazzleTimer += 0.2;
        this.rainbowTimer += 0.1;
        this.scaleTimer += 0.08;
        this.rotationTimer += 0.03;
        
        // PULSING BRIGHTNESS - Make it strobe like a disco ball
        const pulse1 = Math.sin(this.pulseTimer) * 0.3 + 0.7; // 0.4 to 1.0
        const pulse2 = Math.sin(this.pulseTimer * 2.5) * 0.2 + 0.8; // 0.6 to 1.0
        const pulse3 = Math.sin(this.pulseTimer * 4) * 0.1 + 0.9; // 0.8 to 1.0
        this.alpha = pulse1 * pulse2 * pulse3;
        
        // RAINBOW TINT CYCLING - Because why not?
        const r = Math.sin(this.rainbowTimer) * 0.3 + 0.7; // Keep it mostly golden
        const g = Math.sin(this.rainbowTimer + Math.PI * 0.33) * 0.3 + 0.7;
        const b = Math.sin(this.rainbowTimer + Math.PI * 0.66) * 0.2 + 0.2; // Less blue to stay golden
        const rainbowTint = (Math.floor(r * 255) << 16) + (Math.floor(g * 255) << 8) + Math.floor(b * 255);
        this.tint = rainbowTint;
        
        // SCALE PULSING - Make it grow and shrink dramatically
        const scaleBase = 1.3; // Base size
        const scalePulse1 = Math.sin(this.scaleTimer) * 0.2; // ±0.2
        const scalePulse2 = Math.sin(this.scaleTimer * 1.7) * 0.1; // ±0.1
        const scalePulse3 = Math.sin(this.scaleTimer * 3.2) * 0.05; // ±0.05
        const finalScale = scaleBase + scalePulse1 + scalePulse2 + scalePulse3;
        this.scale.set(finalScale);
        
        // SUBTLE ROTATION - Because it's so dazzling it's spinning
        this.rotation = Math.sin(this.rotationTimer) * 0.1; // ±0.1 radians (about ±6 degrees)
        
        // EXPLOSIVE SPARKLE BURSTS - More frequent and more dramatic
        if (this.sparkleTimer >= 15) { // Every 0.25 seconds instead of 0.5
            this.sparkleTimer = 0;
            this.createExplosiveSparkles();
        }
        
        // RANDOM FLASH EFFECTS - Sudden bright flashes
        if (Math.random() < 0.02) { // 2% chance per frame
            this.createDazzleFlash();
        }
    }
    
    createExplosiveSparkles() {
        if (!this.parent) return;
        
        // Create WAY more sparkles in multiple waves
        for (let wave = 0; wave < 3; wave++) {
            setTimeout(() => {
                for (let i = 0; i < 8; i++) { // 8 sparkles per wave
                    const sparkle = new PIXI.Graphics();
                    sparkle.beginFill(0xFFFFFF, 0.9);
                    // Bigger diamond sparkles
                    sparkle.moveTo(0, -5);
                    sparkle.lineTo(3, 0);
                    sparkle.lineTo(0, 5);
                    sparkle.lineTo(-3, 0);
                    sparkle.closePath();
                    sparkle.endFill();
                    
                    // Position in expanding circle
                    const angle = (i / 8) * Math.PI * 2 + wave * 0.5;
                    const distance = 20 + wave * 15 + Math.random() * 20;
                    sparkle.x = this.x + Math.cos(angle) * distance;
                    sparkle.y = this.y + Math.sin(angle) * distance;
                    sparkle.scale.set(0.8 + Math.random() * 0.4);
                    
                    // Random sparkle colors (mostly golden/white)
                    const colors = [0xFFFFFF, 0xFFD700, 0xFFFACD, 0xFFFFE0, 0xF0E68C];
                    sparkle.tint = colors[Math.floor(Math.random() * colors.length)];
                    
                    this.parent.addChild(sparkle);
                    
                    // Animate sparkle with spin and expansion
                    let sparkleLife = 0;
                    const animateSparkle = () => {
                        sparkleLife++;
                        sparkle.alpha = 1 - (sparkleLife / 40);
                        sparkle.scale.set((0.8 + sparkleLife / 80) * (1 + Math.random() * 0.2));
                        sparkle.rotation += 0.2 + Math.random() * 0.1;
                        
                        // Move outward
                        sparkle.x += Math.cos(angle) * 0.5;
                        sparkle.y += Math.sin(angle) * 0.5;
                        
                        if (sparkleLife >= 40) {
                            if (sparkle.parent) {
                                sparkle.parent.removeChild(sparkle);
                            }
                        } else {
                            requestAnimationFrame(animateSparkle);
                        }
                    };
                    animateSparkle();
                }
            }, wave * 100); // Stagger the waves
        }
    }
    
    createDazzleFlash() {
        if (!this.parent) return;
        
        // Create a massive flash effect
        const flash = new PIXI.Graphics();
        flash.beginFill(0xFFFFFF, 0.8);
        flash.drawCircle(0, 0, 60); // Huge flash
        flash.endFill();
        
        flash.x = this.x;
        flash.y = this.y;
        flash.blendMode = PIXI.BLEND_MODES.ADD; // Additive blending for extra brightness
        
        this.parent.addChild(flash);
        
        // Animate the flash
        let flashLife = 0;
        const animateFlash = () => {
            flashLife++;
            flash.alpha = 0.8 - (flashLife / 10);
            flash.scale.set(1 + flashLife / 20);
            
            if (flashLife >= 10) {
                if (flash.parent) {
                    flash.parent.removeChild(flash);
                }
            } else {
                requestAnimationFrame(animateFlash);
            }
        };
        animateFlash();
    }
    
    update(nestPosition, foods) {
        
        // Call base update first
        const baseUpdateResult = super.update(nestPosition, foods);
        
        // FIX: Handle instant collection for foods with collectionTime = 0
        if (this.state === 'collectingFood' && this.collectionTarget) {
            const expectedTime = this.collectionTarget.getCollectionTimeForAnt(this);
            if (expectedTime === 0 && this.collectionTimer > 0) {
                // Force completion for instant collection foods
                return true;
            }
        }
        
        // Regeneration
        this.regenerationTimer++;
        if (this.regenerationTimer >= 60) { // Once per second at 60fps
            this.regenerationTimer = 0;
            if (this.hp < this.maxHp) {
                this.hp = Math.min(this.maxHp, this.hp + this.regenerationRate);
                this.updateHealthBar();
                
                // Show healing effect
                this.createHealingEffect();
            }
        }
        
        // Sparkle effect
        this.sparkleTimer++;
        if (this.sparkleTimer >= 30) { // Every 0.5 seconds
            this.sparkleTimer = 0;
            this.createSparkleEffect();
        }
        
        // Apply aura to nearby ants
        this.applyAuraEffect();
        
        // COMICALLY OVER-THE-TOP DAZZLE ANIMATION!
        this.updateRidiculousDazzle();
        
        return baseUpdateResult;
    }
    
    takeDamage(damage, attacker) {
        // Apply defense reduction
        const actualDamage = damage * (1 - this.defense);
        
        // Call parent takeDamage with reduced damage
        super.takeDamage(actualDamage, attacker);
        
        // Create damage effect
        this.createDamageResistEffect();
    }
    
    applyAuraEffect() {
        // Get EntityManager reference from the global IdleAnts app
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return;
        
        // Get all ants
        const allAnts = IdleAnts.app.entityManager.entities.ants || [];
        
        allAnts.forEach(ant => {
            if (ant === this || ant.isDead) return;
            
            const dx = ant.x - this.x;
            const dy = ant.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist <= this.auraRadius) {
                // Apply buff to nearby ant
                if (!ant.goldenAuraBuff) {
                    ant.goldenAuraBuff = true;
                    ant.speed *= this.auraStrength;
                    ant.carryCapacity = Math.floor(ant.carryCapacity * this.auraStrength);
                    if (ant.attackDamage) {
                        ant.attackDamage *= this.auraStrength;
                    }
                    
                    // Visual effect on buffed ant
                    ant.tint = 0xFFE4B5; // Light gold tint
                }
            } else if (ant.goldenAuraBuff) {
                // Remove buff if out of range
                ant.goldenAuraBuff = false;
                ant.speed /= this.auraStrength;
                ant.carryCapacity = Math.floor(ant.carryCapacity / this.auraStrength);
                if (ant.attackDamage) {
                    ant.attackDamage /= this.auraStrength;
                }
                ant.tint = 0xFFFFFF; // Remove tint
            }
        });
    }
    
    createSparkleEffect() {
        if (!this.parent) return;
        
        for (let i = 0; i < 3; i++) {
            const sparkle = new PIXI.Graphics();
            sparkle.beginFill(0xFFFFFF, 0.8);
            // Draw a simple diamond shape instead of star
            sparkle.moveTo(0, -3);
            sparkle.lineTo(2, 0);
            sparkle.lineTo(0, 3);
            sparkle.lineTo(-2, 0);
            sparkle.closePath();
            sparkle.endFill();
            
            sparkle.x = this.x + (Math.random() - 0.5) * 30;
            sparkle.y = this.y + (Math.random() - 0.5) * 30;
            sparkle.scale.set(0.5);
            
            this.parent.addChild(sparkle);
            
            // Animate sparkle
            let sparkleLife = 0;
            const animateSparkle = () => {
                sparkleLife++;
                sparkle.alpha = 1 - (sparkleLife / 30);
                sparkle.scale.set(0.5 + sparkleLife / 60);
                sparkle.rotation += 0.1;
                
                if (sparkleLife >= 30) {
                    if (sparkle.parent) {
                        sparkle.parent.removeChild(sparkle);
                    }
                } else {
                    requestAnimationFrame(animateSparkle);
                }
            };
            animateSparkle();
        }
    }
    
    createHealingEffect() {
        if (!this.parent) return;
        
        const healEffect = new PIXI.Graphics();
        healEffect.lineStyle(2, 0x00FF00, 0.8);
        healEffect.drawCircle(0, 0, 20);
        healEffect.x = this.x;
        healEffect.y = this.y;
        
        this.parent.addChild(healEffect);
        
        // Animate healing ring
        let scale = 1;
        const animateHeal = () => {
            scale += 0.05;
            healEffect.scale.set(scale);
            healEffect.alpha = 2 - scale;
            
            if (scale >= 2) {
                if (healEffect.parent) {
                    healEffect.parent.removeChild(healEffect);
                }
            } else {
                requestAnimationFrame(animateHeal);
            }
        };
        animateHeal();
    }
    
    createDamageResistEffect() {
        if (!this.parent) return;
        
        const shield = new PIXI.Graphics();
        shield.lineStyle(3, 0xFFD700, 0.8);
        shield.drawCircle(0, 0, 25);
        shield.x = this.x;
        shield.y = this.y;
        
        this.parent.addChild(shield);
        
        // Quick flash effect
        setTimeout(() => {
            if (shield.parent) {
                shield.parent.removeChild(shield);
            }
        }, 200);
    }
    
    die() {
        // Remove aura effects from all ants
        if (IdleAnts.app && IdleAnts.app.entityManager) {
            const allAnts = IdleAnts.app.entityManager.entities.ants || [];
            allAnts.forEach(ant => {
                if (ant.goldenAuraBuff) {
                    ant.goldenAuraBuff = false;
                    ant.speed /= this.auraStrength;
                    ant.carryCapacity = Math.floor(ant.carryCapacity / this.auraStrength);
                    if (ant.attackDamage) {
                        ant.attackDamage /= this.auraStrength;
                    }
                    ant.tint = 0xFFFFFF;
                }
            });
        }
        
        // Create epic death effect
        this.createEpicDeathEffect();
        
        // Call parent die
        super.die();
    }
    
    createEpicDeathEffect() {
        if (!this.parent) return;
        
        // Create golden explosion
        for (let i = 0; i < 20; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0xFFD700);
            particle.drawCircle(0, 0, 3);
            particle.endFill();
            
            const angle = (i / 20) * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            particle.x = this.x;
            particle.y = this.y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            
            this.parent.addChild(particle);
            
            // Animate particle
            let life = 0;
            const animateParticle = () => {
                life++;
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.alpha = 1 - (life / 60);
                particle.scale.set(1 - life / 120);
                
                if (life >= 60) {
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
};