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
    
    // Override createTypeSpecificElements to create golden ant parts
    createTypeSpecificElements() {
        // Create proper ant body with golden materials
        this.createGoldenBody();
        this.createGoldenHead();
        this.createGoldenLegs();
        this.createGoldenAntennae();
        this.createGoldenCrown();
        
        // Make it bigger than normal ants
        this.scale.set(1.3);
        
        // Add special golden effects
        this.pulseTimer = 0;
        this.dazzleTimer = 0;
        this.rainbowTimer = 0;
        this.scaleTimer = 0;
    }
    
    createGoldenBody() {
        // Create a Graphics object for the body (not a Container)
        const goldenBody = new PIXI.Graphics();
        
        // Copy EXACT ant structure from antAssets.js but in golden colors
        
        // Rear segment (abdomen) - angled ellipse showing depth (EXACTLY like regular ant)
        goldenBody.beginFill(0xFFD700); // Golden base instead of 0x2A1B10
        goldenBody.drawEllipse(0, 8, 7, 10); // EXACT same dimensions as regular ant
        goldenBody.endFill();
        
        // Abdomen highlight - shows the "top" surface at an angle (EXACTLY like regular ant)
        goldenBody.beginFill(0xFFFACD); // Golden highlight instead of 0x3D2817
        goldenBody.drawEllipse(-1, 6, 6, 8); // EXACT same offset to show angled top
        goldenBody.endFill();
        
        // Abdomen bright highlight - the most visible "top" surface (EXACTLY like regular ant)
        goldenBody.beginFill(0xFFFFE0); // Brightest golden highlight instead of 0x5D4037
        goldenBody.drawEllipse(-2, 5, 4, 6); // EXACT same further offset for depth
        goldenBody.endFill();
        
        // Middle segment (thorax) - angled perspective (EXACTLY like regular ant)
        goldenBody.beginFill(0xFFD700); // Golden base instead of 0x2A1B10
        goldenBody.drawEllipse(0, -2, 5, 7); // EXACT same base thorax dimensions
        goldenBody.endFill();
        
        // Thorax top surface (EXACTLY like regular ant)
        goldenBody.beginFill(0xFFFACD); // Golden highlight instead of 0x3D2817
        goldenBody.drawEllipse(-1, -3, 4, 5); // EXACT same angled top
        goldenBody.endFill();
        
        // Thorax highlight (EXACTLY like regular ant)
        goldenBody.beginFill(0xFFFFE0); // Bright golden highlight instead of 0x5D4037
        goldenBody.drawEllipse(-1.5, -4, 3, 3); // EXACT same top highlight
        goldenBody.endFill();
        
        // Store reference and add to ant
        this.goldenBody = goldenBody;
        this.addChild(this.goldenBody);
    }
    
    createGoldenHead() {
        // Create a Graphics object for the head
        const goldenHead = new PIXI.Graphics();
        
        // Head - angled circular perspective (EXACTLY like regular ant)
        goldenHead.beginFill(0xFFD700); // Golden base instead of 0x2A1B10
        goldenHead.drawEllipse(0, -14, 5, 6); // EXACT same dimensions - elliptical due to angle
        goldenHead.endFill();
        
        // Head top surface (EXACTLY like regular ant)
        goldenHead.beginFill(0xFFFACD); // Golden highlight instead of 0x3D2817
        goldenHead.drawEllipse(-1, -15, 4, 5); // EXACT same angled top surface
        goldenHead.endFill();
        
        // Head highlight (EXACTLY like regular ant)
        goldenHead.beginFill(0xFFFFE0); // Bright golden highlight instead of 0x5D4037
        goldenHead.drawEllipse(-1.5, -15.5, 3, 3); // EXACT same top highlight
        goldenHead.endFill();
        
        // Eyes - positioned for angled view (EXACTLY like regular ant)
        goldenHead.beginFill(0x000000); // Keep black eyes like regular ant
        goldenHead.drawEllipse(-2.5, -15, 1.2, 1.5); // EXACT same left eye - more elliptical
        goldenHead.drawEllipse(1.5, -14.5, 1.2, 1.5); // EXACT same right eye - slightly different position
        goldenHead.endFill();
        
        // Eye highlights - angled perspective (EXACTLY like regular ant)
        goldenHead.beginFill(0xFFFFFF, 0.8); // Keep white highlights like regular ant
        goldenHead.drawEllipse(-2.7, -15.2, 0.5, 0.7); // EXACT same left eye highlight
        goldenHead.drawEllipse(1.3, -14.7, 0.5, 0.7); // EXACT same right eye highlight
        goldenHead.endFill();
        
        // Mandibles - angled outward from perspective (EXACTLY like regular ant)
        goldenHead.lineStyle(1.2, 0xFFD700); // Golden mandibles instead of 0x2A1B10
        goldenHead.moveTo(-3, -17); // EXACT same left mandible position
        goldenHead.lineTo(-5.5, -19.5); // EXACT same left mandible end
        goldenHead.moveTo(2.5, -16.5); // EXACT same right mandible - different angle
        goldenHead.lineTo(5, -19); // EXACT same right mandible end
        
        // Store reference and add to ant
        this.goldenHead = goldenHead;
        this.addChild(this.goldenHead);
    }
    
    createGoldenLegs() {
        // Add legs to the body graphics object (EXACTLY like regular ant)
        this.goldenBody.lineStyle(1.5, 0xFFD700); // Golden legs instead of 0x2A1B10
        
        // Left side legs (more visible from this angle) - EXACT same positions as regular ant
        this.goldenBody.moveTo(-4, -8); // Front leg - EXACT same
        this.goldenBody.lineTo(-8, -6); // EXACT same end
        this.goldenBody.moveTo(-4, -2); // Middle leg - EXACT same
        this.goldenBody.lineTo(-8, 0); // EXACT same end
        this.goldenBody.moveTo(-4, 4); // Rear leg - EXACT same
        this.goldenBody.lineTo(-8, 6); // EXACT same end
        
        // Right side legs (partially visible from angle) - EXACT same positions as regular ant
        this.goldenBody.moveTo(3, -7); // Front leg - EXACT same
        this.goldenBody.lineTo(6, -5); // EXACT same end
        this.goldenBody.moveTo(3, -1); // Middle leg - EXACT same
        this.goldenBody.lineTo(6, 1); // EXACT same end
        this.goldenBody.moveTo(3, 5); // Rear leg - EXACT same
        this.goldenBody.lineTo(6, 7); // EXACT same end
    }
    
    createGoldenAntennae() {
        // Add antennae to the head graphics object (EXACTLY like regular ant)
        this.goldenHead.lineStyle(1, 0xFFD700); // Golden antennae instead of 0x2A1B10
        
        // Left antenna - more visible from this angle (EXACTLY like regular ant)
        this.goldenHead.moveTo(-2.5, -17); // EXACT same start position
        this.goldenHead.bezierCurveTo(-5.5, -21, -7.5, -23, -6.5, -25); // EXACT same curve
        
        // Right antenna - partially visible from angle (EXACTLY like regular ant)
        this.goldenHead.moveTo(2, -16.5); // EXACT same start position
        this.goldenHead.bezierCurveTo(4.5, -20, 6.5, -22, 6, -24); // EXACT same curve
        
        // Antenna tips (EXACTLY like regular ant)
        this.goldenHead.lineStyle(0);
        this.goldenHead.beginFill(0xFFFACD); // Golden tips instead of 0x3D2817
        this.goldenHead.drawCircle(-6.5, -25, 1); // EXACT same left tip
        this.goldenHead.drawCircle(6, -24, 1); // EXACT same right tip
        this.goldenHead.endFill();
    }
    
    createGoldenCrown() {
        // Create crown container
        this.crownContainer = new PIXI.Container();
        this.addChild(this.crownContainer);
        
        const crown = new PIXI.Graphics();
        
        // Crown shape - Pure gold and white!
        crown.beginFill(0xFFFFFF, 0.9);
        crown.moveTo(-4, -12);
        crown.lineTo(-2, -18);
        crown.lineTo(0, -15);
        crown.lineTo(2, -18);
        crown.lineTo(4, -12);
        crown.lineTo(0, -11);
        crown.closePath();
        crown.endFill();
        
        // Crown base - golden
        crown.beginFill(0xFFD700);
        crown.drawRect(-4, -12, 8, 1.5);
        crown.endFill();
        
        // Crown gems - bright colors
        crown.beginFill(0xFF6B6B); // Bright red
        crown.drawCircle(-1.5, -15, 0.8);
        crown.beginFill(0x4ECDC4); // Bright teal  
        crown.drawCircle(1.5, -15, 0.8);
        crown.beginFill(0x45B7D1); // Bright blue
        crown.drawCircle(0, -14, 0.8);
        crown.endFill();
        
        this.crownContainer.addChild(crown);
    }
    
    // Implement ant-specific animation like normal ants
    performAnimation() {
        this.animateGoldenLegs();
        this.updateGoldenDazzle();
    }
    
    animateGoldenLegs() {
        // Use the same leg animation system as normal ants
        this.legPhase += this.legAnimationSpeed;
        
        // Speed-based animation rate - faster movement = faster leg movement
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const animationRate = Math.max(0.1, speed * 0.3);
        
        // Animate each leg with symmetrical movement like normal ants
        if (this.legs) {
            for (let i = 0; i < this.legs.length; i++) {
                const leg = this.legs[i];
                
                // Alternating leg movement pattern - opposite sides move in opposite phases
                let phase = this.legPhase + (leg.index * Math.PI / 3);
                if (leg.side === 'right') {
                    phase += Math.PI; // Opposite phase for right legs
                }
                
                // Apply leg animation - symmetrical movement
                const legMovement = Math.sin(phase) * 3; // Slightly more movement for golden ant
                
                // Update leg position based on movement
                leg.position.x = leg.baseX + (leg.side === 'left' ? legMovement : -legMovement);
                leg.position.y = leg.baseY + Math.abs(legMovement) * 0.5;
                
                // Redraw the leg to update visual
                this.drawGoldenLeg(leg);
            }
        }
    }
    
    updateGoldenDazzle() {
        // Multiple overlapping animation timers for maximum ridiculousness
        this.pulseTimer += 0.15;
        this.dazzleTimer += 0.2;
        this.rainbowTimer += 0.1;
        this.scaleTimer += 0.08;
        
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
        
        // DON'T override rotation - let the parent class handle directional rotation
        
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
                        // BUGFIX: Check if sparkle still has a parent before continuing animation
                        if (!sparkle.parent) {
                            return; // Stop animation if parent was removed
                        }

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
                    requestAnimationFrame(animateSparkle); // BUGFIX: Use requestAnimationFrame for consistency
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
            // BUGFIX: Check if flash still has a parent before continuing animation
            if (!flash.parent) {
                return; // Stop animation if parent was removed
            }

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
        requestAnimationFrame(animateFlash); // BUGFIX: Use requestAnimationFrame for consistency
    }
    
    update(nestPosition, foods) {
        // Call base update first - this handles movement and rotation
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
        
        // Apply aura to nearby ants
        this.applyAuraEffect();
        
        // Golden ant specific animation (legs and subtle effects)
        this.performAnimation();
        
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
                // BUGFIX: Check if sparkle still has a parent before continuing animation
                if (!sparkle.parent) {
                    return; // Stop animation if parent was removed
                }

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
            requestAnimationFrame(animateSparkle); // BUGFIX: Use requestAnimationFrame for consistency
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
            // BUGFIX: Check if healEffect still has a parent before continuing animation
            if (!healEffect.parent) {
                return; // Stop animation if parent was removed
            }

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
        requestAnimationFrame(animateHeal); // BUGFIX: Use requestAnimationFrame for consistency
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
                // BUGFIX: Check if particle still has a parent before continuing animation
                if (!particle.parent) {
                    return; // Stop animation if parent was removed
                }

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
            requestAnimationFrame(animateParticle); // BUGFIX: Use requestAnimationFrame for consistency
        }
    }
};