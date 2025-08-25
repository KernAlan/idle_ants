// src/entities/exploding/ElectricAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Exploding === 'undefined') IdleAnts.Entities.Exploding = {};

// Electric Ant - creates devastating electric explosion with lightning effects
IdleAnts.Entities.Exploding.ElectricAnt = class extends IdleAnts.Entities.Ant {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Get ant type configuration
        const antType = IdleAnts.Data.AntTypes.ELECTRIC_ANT;
        
        // Defensive check for missing ant type data
        if (!antType) {
            console.error('ElectricAnt: Unable to find ELECTRIC_ANT configuration in IdleAnts.Data.AntTypes');
        }
        
        // Use standard Ant pathing/movement
        super(texture, nestPosition, speedMultiplier);

        // Apply type stats/props
        this.antType = antType || {
            color: 0x00BFFF,
            glowColor: 0x87CEEB,
            damage: 1000,
            hp: 30,
            effect: 'electricExplosion',
            explosionRadius: 120
        };
        this.tint = this.antType.color;
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        this.explosionRadius = this.antType.explosionRadius || 120;
        this.effectType = this.antType.effect;
        this.hasExploded = false;
        
        // Electric-specific properties
        this.lightningBolts = [];
        this.electricCharge = 0;
        this.maxCharge = 100;
        this.chargeRate = 2;
        
        // Visual electric effects
        this.sparkCounter = 0;
        this.electricAura = null;
        this.staticElectricity = [];
        
        // Standard leg animation setup (like Gas Ant)
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.25;
        // Stabilize rotation behavior like other ants
        this.turnSpeed = 0.2;
    }
    
    // Override to create electric-specific body
    createBody() {
        const color = (this.antType && this.antType.color) || 0x00BFFF;

        // Layer container: glow behind, body details above
        this.bodyContainer = new PIXI.Container();

        // Back glow halo
        const glow = new PIXI.Graphics();
        for (let i = 0; i < 3; i++) {
            glow.beginFill(0x87CEEB, 0.12 - i * 0.03);
            glow.drawCircle(0, 2, 16 + i * 4);
            glow.endFill();
        }
        glow.alpha = 0.35;
        this.bodyGlow = glow;
        this.bodyContainer.addChild(glow);

        // Core body
        const body = new PIXI.Graphics();
        body.beginFill(color);
        // Abdomen
        body.drawEllipse(0, 8, 8, 11);
        body.endFill();
        // Thorax
        body.beginFill(color);
        body.drawEllipse(0, 0, 6, 8);
        body.endFill();
        // Head
        body.beginFill(color);
        body.drawEllipse(0, -8, 5, 6);
        body.endFill();

        // Electric antennae
        body.lineStyle(2, 0xFFFFFF);
        body.moveTo(-2, -12); body.lineTo(-5, -18);
        body.moveTo(2, -12);  body.lineTo(5, -18);

        // Conductors
        body.beginFill(0xFFFFFF, 0.8);
        body.drawCircle(-4, 0, 1.3);
        body.drawCircle(4, 0, 1.3);
        body.drawCircle(0, 8, 1.8);
        body.endFill();

        // Lightning chevrons
        body.lineStyle(1, 0xFFFFAA, 0.9);
        for (let i = -1; i <= 1; i++) {
            const y = -2 + (i * 3);
            body.moveTo(-3, y); body.lineTo(0, y - 1); body.lineTo(3, y);
        }

        // Specular sheen
        const sheen = new PIXI.Graphics();
        sheen.beginFill(0xFFFFFF, 0.12);
        sheen.drawEllipse(-2, 4, 4.5, 1.8);
        sheen.endFill();
        this.bodySheen = sheen;

        this.bodyContainer.addChild(body);
        this.bodyContainer.addChild(sheen);
        this.addChild(this.bodyContainer);
    }
    
    // Create type-specific elements (body and legs)
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
    }
    
    createLegs() {
        // Use standard exploding ant leg system
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        this.legs = [];
        const legPositions = [
            {x: -5, y: -8, side: 'left'},
            {x: 5, y: -8, side: 'right'},
            {x: -5, y: -2, side: 'left'},
            {x: 5, y: -2, side: 'right'},
            {x: -5, y: 4, side: 'left'},
            {x: 5, y: 4, side: 'right'}
        ];
        
        for (let i = 0; i < legPositions.length; i++) {
            const legPos = legPositions[i];
            const leg = new PIXI.Graphics();
            
            leg.position.set(legPos.x, legPos.y);
            leg.baseX = legPos.x;
            leg.baseY = legPos.y;
            leg.index = Math.floor(i / 2);
            leg.side = legPos.side;
            
            this.drawLeg(leg);
            this.legsContainer.addChild(leg);
            this.legs.push(leg);
        }
    }
    
    drawLeg(leg) {
        leg.clear();
        leg.lineStyle(1.5, 0x2A1B10);
        
        leg.moveTo(0, 0);
        if (leg.side === 'left') {
            leg.lineTo(-4, 2);
        } else {
            leg.lineTo(4, 2);
        }
    }
    
    // Override to create electric aura
    createDangerGlow() {
        // Create electric aura
        this.electricAura = new PIXI.Graphics();
        this.updateElectricAura();
        this.addChildAt(this.electricAura, 0);
    }
    
    updateElectricAura() {
        if (!this.electricAura) return;
        
        this.electricAura.clear();
        
        // Create pulsing electric aura based on charge level
        const chargePercent = this.electricCharge / this.maxCharge;
        const auraSize = 12 + (chargePercent * 8);
        const auraAlpha = 0.2 + (chargePercent * 0.4);
        
        // Multiple aura rings
        for (let i = 0; i < 3; i++) {
            const ringColor = i === 0 ? 0x00BFFF : (i === 1 ? 0x87CEEB : 0xFFFFFF);
            this.electricAura.beginFill(ringColor, auraAlpha - (i * 0.1));
            this.electricAura.drawCircle(0, 0, auraSize + (i * 3));
            this.electricAura.endFill();
        }
    }
    
    // Enhanced electric-themed animations
    performAnimation() {
        this.animateLegs();
        this.updateElectricCharge();
        this.createElectricSparks();
        this.updateStaticElectricity();
        this.animateElectricAura();
        this.createElectricTrail();
        this.updateElectricGlow();
        this.createArcHalo();
        this.createAntennaFlicker();
        
        // Enhanced electrical effects inspired by Fire Ant
        this.createElectricBurst();
        this.createLightningStorm();
        this.createElectricVortex();
        this.createPlasmaBall();
        this.createElectricWords();
    }
    
    updateElectricCharge() {
        // Build up electric charge over time
        if (this.electricCharge < this.maxCharge) {
            this.electricCharge += this.chargeRate;
        }
        
        // Update aura based on charge (removed speed modification to fix pathing)
        this.updateElectricAura();
    }
    
    createElectricSparks() {
        this.sparkCounter++;
        
        // Create sparks more frequently as charge builds
        const chargePercent = this.electricCharge / this.maxCharge;
        const sparkChance = 0.02 + (chargePercent * 0.08);
        
        if (Math.random() < sparkChance && !this.hasExploded) {
            this.createSpark();
        }
    }
    
    createSpark() {
        const spark = new PIXI.Graphics();
        
        // Random spark color
        const sparkColors = [0xFFFFFF, 0x00BFFF, 0x87CEEB, 0xFFFF00];
        const sparkColor = sparkColors[Math.floor(Math.random() * sparkColors.length)];
        
        spark.lineStyle(2, sparkColor, 0.8);
        
        // Create zigzag lightning pattern
        const startX = (Math.random() - 0.5) * 16;
        const startY = (Math.random() - 0.5) * 16;
        const endX = startX + (Math.random() - 0.5) * 20;
        const endY = startY + (Math.random() - 0.5) * 20;
        
        spark.moveTo(startX, startY);
        
        // Create jagged lightning bolt
        const segments = 3 + Math.floor(Math.random() * 3);
        for (let i = 1; i <= segments; i++) {
            const progress = i / segments;
            const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * 8;
            const y = startY + (endY - startY) * progress + (Math.random() - 0.5) * 8;
            spark.lineTo(x, y);
        }
        
        spark.x = this.x;
        spark.y = this.y;
        spark.life = 8 + Math.random() * 4;
        spark.maxLife = spark.life;
        
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(spark);
        } else if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(spark);
        }
        // Always track so we can fade and remove
        this.staticElectricity.push(spark);
    }
    
    updateStaticElectricity() {
        for (let i = this.staticElectricity.length - 1; i >= 0; i--) {
            const spark = this.staticElectricity[i];
            
            spark.life--;
            spark.alpha = spark.life / spark.maxLife;
            
            // Remove jittery movement - sparks stay in position relative to ant
            // (Removed the random movement that was affecting pathing)
            
            if (spark.life <= 0) {
                if (spark.parent) {
                    spark.parent.removeChild(spark);
                }
                this.staticElectricity.splice(i, 1);
            }
        }
    }
    
    animateElectricAura() {
        if (!this.electricAura) return;
        
        // Rotate and pulse the electric aura
        this.electricAura.rotation += 0.1;
        
        const chargePercent = this.electricCharge / this.maxCharge;
        const pulseFactor = 0.8 + Math.sin(this.sparkCounter * 0.3) * 0.2;
        this.electricAura.scale.set(pulseFactor * (1 + chargePercent * 0.3));
    }
    
    // Override explosion to create electric storm
    createExplosionEffect() {
        // Temporarily disabled explosion visuals
        return;
    }
    
    createLightningBolt(angle) {
        const bolt = new PIXI.Graphics();
        bolt.lineStyle(3, 0xFFFFFF, 0.9);
        
        let currentX = this.x;
        let currentY = this.y;
        
        // Create jagged lightning bolt
        for (let i = 0; i < 15; i++) {
            const distance = 8 + Math.random() * 12;
            const angleVariation = (Math.random() - 0.5) * 0.8;
            const finalAngle = angle + angleVariation;
            
            const newX = currentX + Math.cos(finalAngle) * distance;
            const newY = currentY + Math.sin(finalAngle) * distance;
            
            if (i === 0) {
                bolt.moveTo(currentX, currentY);
            }
            bolt.lineTo(newX, newY);
            
            currentX = newX;
            currentY = newY;
        }
        
        bolt.life = 20;
        bolt.maxLife = bolt.life;
        
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(bolt);
        } else if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(bolt);
        }
        this.lightningBolts.push(bolt);
    }
    
    createScreenFlash() {
        if (!IdleAnts.app || !IdleAnts.app.stage) return;
        
        const flash = new PIXI.Graphics();
        flash.beginFill(0xFFFFFF, 0.6);
        flash.drawRect(-1000, -1000, 2000, 2000);
        flash.endFill();
        
        IdleAnts.app.stage.addChild(flash); // Screen flash stays on stage (UI-wide)
        
        // Fade out quickly
        let alpha = 0.6;
        const fadeInterval = setInterval(() => {
            alpha -= 0.1;
            flash.alpha = alpha;
            
            if (alpha <= 0) {
                if (flash.parent) {
                    flash.parent.removeChild(flash);
                }
                clearInterval(fadeInterval);
            }
        }, 16);
    }
    
    // Override to add electric AOE + chain lightning damage
    dealExplosionDamage() {
        // Base AOE damage with falloff
        if (IdleAnts.app && IdleAnts.app.entityManager) {
            const enemiesBase = IdleAnts.app.entityManager.entities.enemies || [];
            for (const enemy of enemiesBase) {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this.explosionRadius) {
                    const mult = 1 - (distance / this.explosionRadius);
                    const dmg = Math.floor(this.attackDamage * mult);
                    if (dmg > 0 && typeof enemy.takeDamage === 'function') enemy.takeDamage(dmg);
                }
            }
        }

        // Add chain lightning effect
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return;
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        const hitEnemies = [];
        
        // Find enemies in range
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= this.explosionRadius) {
                hitEnemies.push({enemy, distance});
            }
        }
        
        // Sort by distance for chain lightning
        hitEnemies.sort((a, b) => a.distance - b.distance);
        
        // Apply chain lightning damage
        for (let i = 0; i < hitEnemies.length; i++) {
            const {enemy} = hitEnemies[i];
            
            // Each subsequent enemy takes less damage
            const chainMultiplier = Math.pow(0.8, i);
            const chainDamage = Math.floor(this.attackDamage * 0.5 * chainMultiplier);
            
            if (enemy.takeDamage && chainDamage > 0) {
                setTimeout(() => {
                    enemy.takeDamage(chainDamage);
                    
                    // Visual chain lightning effect
                    if (i > 0) {
                        this.createChainLightning(hitEnemies[i-1].enemy, enemy);
                    }
                }, i * 100);
            }
        }
    }
    
    createChainLightning(fromEnemy, toEnemy) {
        const chainBolt = new PIXI.Graphics();
        chainBolt.lineStyle(2, 0x87CEEB, 0.8);
        
        // Create lightning between enemies
        const segments = 5;
        for (let i = 0; i <= segments; i++) {
            const progress = i / segments;
            const x = fromEnemy.x + (toEnemy.x - fromEnemy.x) * progress + (Math.random() - 0.5) * 10;
            const y = fromEnemy.y + (toEnemy.y - fromEnemy.y) * progress + (Math.random() - 0.5) * 10;
            
            if (i === 0) {
                chainBolt.moveTo(x, y);
            } else {
                chainBolt.lineTo(x, y);
            }
        }
        
        chainBolt.life = 15;
        
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(chainBolt);
            this.lightningBolts.push(chainBolt);
        } else if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(chainBolt);
            this.lightningBolts.push(chainBolt);
        }
    }

    // Trigger electric explosion on death while pathing stays identical
    die() {
        if (!this.hasExploded) {
            this.hasExploded = true;
            this.createExplosionEffect(); // currently disabled visuals
            this.dealExplosionDamage();
        }
        super.die();
    }
    
    // Standard leg animation from AntBase
    animateLegs() {
        if (!this.legs) return;
        
        this.legPhase += this.legAnimationSpeed;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') {
                phase += Math.PI;
            }
            
            const legMovement = Math.sin(phase) * 2;
            
            leg.clear();
            leg.lineStyle(1.5, 0x2A1B10);
            leg.moveTo(0, 0);
            
            const bendFactor = Math.max(0, -Math.sin(phase)) * 0.8;
            
            if (leg.side === 'left') {
                const endX = -4 + legMovement;
                const endY = 2 + bendFactor;
                leg.lineTo(endX, endY);
            } else {
                const endX = 4 - legMovement;
                const endY = 2 + bendFactor;
                leg.lineTo(endX, endY);
            }
        }
    }

    createElectricTrail() {
        // Create electric discharge trails when moving
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0.5 && Math.random() < 0.3 && IdleAnts.app && IdleAnts.app.stage) {
            const trail = new PIXI.Graphics();
            
            // Electric blue colors
            const trailColors = [0x00BFFF, 0x87CEEB, 0xFFFFFF, 0x1E90FF];
            const color = trailColors[Math.floor(Math.random() * trailColors.length)];
            
            trail.lineStyle(2, color, 0.8);
            
            // Create zigzag electric trail
            const startX = this.x;
            const startY = this.y;
            const trailLength = 20 + Math.random() * 15;
            const angle = Math.atan2(this.vy, this.vx) + Math.PI; // Opposite direction
            
            let currentX = startX;
            let currentY = startY;
            
            trail.moveTo(currentX, currentY);
            
            // Create jagged trail
            const segments = 4 + Math.floor(Math.random() * 3);
            for (let i = 1; i <= segments; i++) {
                const progress = i / segments;
                const targetX = startX + Math.cos(angle) * trailLength * progress;
                const targetY = startY + Math.sin(angle) * trailLength * progress;
                
                // Add electric jitter
                const jitterX = (Math.random() - 0.5) * 8;
                const jitterY = (Math.random() - 0.5) * 8;
                
                currentX = targetX + jitterX;
                currentY = targetY + jitterY;
                
                trail.lineTo(currentX, currentY);
            }
            
            trail.life = 12 + Math.random() * 8;
            trail.initialLife = trail.life;
            
            if (IdleAnts.app && IdleAnts.app.worldContainer) {
                IdleAnts.app.worldContainer.addChild(trail);
            } else if (IdleAnts.app && IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(trail);
            }
            
            const animateTrail = () => {
                trail.life--;
                trail.alpha = (trail.life / trail.initialLife) * 0.8;
                
                // Add electric shimmer
                trail.tint = Math.random() < 0.5 ? 0xFFFFFF : color;
                
                if (trail.life <= 0) {
                    if (trail.parent) {
                        trail.parent.removeChild(trail);
                    }
                } else {
                    requestAnimationFrame(animateTrail);
                }
            };
            animateTrail();
        }
    }

    updateElectricGlow() {
        // Create intense electric glow that pulses with charge
        const time = Date.now() * 0.01;
        const chargePercent = this.electricCharge / this.maxCharge;
        const baseGlow = 0.6 + Math.sin(time) * 0.3;
        const glow = baseGlow + (chargePercent * 0.4);
        
        // Electric blue glow with white highlights
        const blue = Math.floor(255 * glow);
        const white = Math.floor(255 * Math.min(1, glow * 1.2));
        this.tint = (white << 16) | (white << 8) | blue;
        
        // Add screen flash effect when fully charged
        if (chargePercent >= 1.0 && Math.random() < 0.1) {
            this.createMiniFlash();
        }

        // Pulse the back glow and sheen
        if (this.bodyGlow) {
            const pulse = 0.95 + Math.sin(time * 1.1) * 0.05;
            this.bodyGlow.scale.set(pulse);
            this.bodyGlow.alpha = 0.3 + Math.sin(time * 0.8) * 0.1;
        }
        if (this.bodySheen) {
            this.bodySheen.alpha = 0.10 + (Math.cos(time * 1.4) + 1) * 0.05;
            this.bodySheen.x = Math.sin(time * 0.7) * 1.2;
        }
    }

    // Thin rotating arc ring around the ant (subtle)
    createArcHalo() {
        if (Math.random() < 0.02 && this.parent) {
            const halo = new PIXI.Graphics();
            halo.lineStyle(1, 0xE0FFFF, 0.6);
            for (let i = 0; i < 6; i++) {
                const start = (Math.PI * 2 / 6) * i + Math.random() * 0.2;
                halo.arc(0, 0, 12, start, start + Math.PI / 6);
            }
            halo.x = this.x; halo.y = this.y; halo.life = 20;
            this.parent.addChild(halo);
            const anim = () => {
                halo.life--; halo.rotation += 0.08; halo.alpha = halo.life / 20 * 0.6;
                if (halo.life <= 0) { if (halo.parent) halo.parent.removeChild(halo); } else { requestAnimationFrame(anim); }
            };
            anim();
        }
    }

    // Tiny white flickers near antenna tips
    createAntennaFlicker() {
        if (Math.random() < 0.06 && this.parent) {
            const f = new PIXI.Graphics();
            f.beginFill(0xFFFFFF, 0.9); f.drawRect(0, 0, 1, 1); f.endFill();
            f.x = this.x + (Math.random() < 0.5 ? -5 : 5);
            f.y = this.y - 18 + (Math.random() - 0.5) * 2;
            f.life = 10; this.parent.addChild(f);
            const anim = () => { f.life--; f.alpha = f.life / 10; if (f.life <= 0) { if (f.parent) f.parent.removeChild(f); } else { requestAnimationFrame(anim); } };
            anim();
        }
    }

    createMiniFlash() {
        // Small screen flash when fully charged
        if (!IdleAnts.app || !IdleAnts.app.stage) return;
        
        const flash = new PIXI.Graphics();
        flash.beginFill(0x87CEEB, 0.3);
        flash.drawCircle(this.x, this.y, 50 + Math.random() * 30);
        flash.endFill();
        
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(flash);
        } else if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(flash);
        }
        
        let life = 8;
        const animateFlash = () => {
            life--;
            flash.alpha = (life / 8) * 0.3;
            flash.scale.set(1 + (1 - life / 8) * 2);
            
            if (life <= 0) {
                if (flash.parent) {
                    flash.parent.removeChild(flash);
                }
            } else {
                requestAnimationFrame(animateFlash);
            }
        };
        animateFlash();
    }

    createElectricBurst() {
        // Electric micro-bursts similar to Fire Ant explosions
        if (Math.random() < 0.02 && this.parent) {
            const bursts = 2 + Math.floor(Math.random() * 3); // 2-4 bursts
            for (let i = 0; i < bursts; i++) {
                const burst = new PIXI.Graphics();
                const size = 3 + Math.random() * 5;
                const colors = [0x00BFFF, 0x87CEEB, 0xFFFFFF, 0x1E90FF];
                const color = colors[Math.floor(Math.random() * colors.length)];

                burst.beginFill(color, 0.8);
                
                // Draw star shape manually
                const points = 8;
                const outerRadius = size;
                const innerRadius = size * 0.5;
                
                for (let j = 0; j < points * 2; j++) {
                    const angle = (j * Math.PI) / points;
                    const radius = j % 2 === 0 ? outerRadius : innerRadius;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    if (j === 0) {
                        burst.moveTo(x, y);
                    } else {
                        burst.lineTo(x, y);
                    }
                }
                burst.closePath();
                burst.endFill();

                const angle = Math.random() * Math.PI * 2;
                const distance = 8 + Math.random() * 18;
                burst.x = this.x + Math.cos(angle) * distance;
                burst.y = this.y + Math.sin(angle) * distance;
                burst.life = 16;

                this.parent.addChild(burst);

                const animateBurst = () => {
                    burst.life--;
                    burst.rotation += 0.2;
                    burst.scale.set(1 + (1 - burst.life / 16) * 0.6);
                    burst.alpha = burst.life / 16;

                    if (burst.life <= 0) {
                        if (burst.parent) burst.parent.removeChild(burst);
                    } else {
                        requestAnimationFrame(animateBurst);
                    }
                };
                animateBurst();
            }
        }
    }

    createLightningStorm() {
        // Very rare lightning storm effect
        if (Math.random() < 0.008 && this.parent) {
            const storm = new PIXI.Graphics();
            
            // Create multiple lightning bolts radiating outward
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const color = [0xFFFFFF, 0x87CEEB, 0x00BFFF][i % 3];
                storm.lineStyle(1.5, color, 0.7);
                
                let x = 0, y = 0;
                storm.moveTo(x, y);
                
                // Create jagged lightning bolt
                for (let j = 1; j <= 8; j++) {
                    const distance = j * 4;
                    const jitter = (Math.random() - 0.5) * 6;
                    x = Math.cos(angle) * distance + jitter;
                    y = Math.sin(angle) * distance + jitter;
                    storm.lineTo(x, y);
                }
            }
            
            storm.x = this.x;
            storm.y = this.y;
            storm.life = 25;
            this.parent.addChild(storm);
            
            const animateStorm = () => {
                storm.life--;
                storm.alpha = storm.life / 25 * 0.7;
                storm.rotation += 0.05;
                
                if (storm.life <= 0) {
                    if (storm.parent) storm.parent.removeChild(storm);
                } else {
                    requestAnimationFrame(animateStorm);
                }
            };
            animateStorm();
        }
    }

    createElectricVortex() {
        // Smaller, less frequent electric vortex
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.0 && Math.random() < 0.015 && this.parent) {
            const vortex = new PIXI.Graphics();
            
            // Create spiral electric pattern
            for (let i = 0; i < 4; i++) {
                const color = [0x00BFFF, 0x87CEEB][i % 2];
                vortex.lineStyle(1, color, 0.6);
                
                for (let angle = 0; angle < Math.PI * 4; angle += 0.2) {
                    const radius = (angle / (Math.PI * 4)) * 15;
                    const x = Math.cos(angle + i * Math.PI / 2) * radius;
                    const y = Math.sin(angle + i * Math.PI / 2) * radius;
                    
                    if (angle === 0) {
                        vortex.moveTo(x, y);
                    } else {
                        vortex.lineTo(x, y);
                    }
                }
            }
            
            vortex.x = this.x;
            vortex.y = this.y + 10;
            vortex.life = 40;
            this.parent.addChild(vortex);
            
            const animateVortex = () => {
                vortex.life--;
                vortex.alpha = vortex.life / 40 * 0.6;
                vortex.rotation += 0.15;
                vortex.scale.set(1 + Math.sin(Date.now() * 0.01) * 0.1);
                
                if (vortex.life <= 0) {
                    if (vortex.parent) vortex.parent.removeChild(vortex);
                } else {
                    requestAnimationFrame(animateVortex);
                }
            };
            animateVortex();
        }
    }

    createPlasmaBall() {
        // Rare plasma ball effect
        if (Math.random() < 0.005 && this.parent) {
            const plasma = new PIXI.Graphics();
            
            // Create glowing plasma ball with electric arcs
            const colors = [0x00BFFF, 0x87CEEB, 0xFFFFFF];
            for (let i = 0; i < 3; i++) {
                plasma.beginFill(colors[i], 0.3 - i * 0.1);
                plasma.drawCircle(0, 0, 8 - i * 2);
                plasma.endFill();
            }
            
            // Add electric arcs around the plasma ball
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                plasma.lineStyle(1, 0xFFFFFF, 0.4);
                const startX = Math.cos(angle) * 8;
                const startY = Math.sin(angle) * 8;
                const endX = Math.cos(angle) * 12;
                const endY = Math.sin(angle) * 12;
                plasma.moveTo(startX, startY);
                plasma.lineTo(endX, endY);
            }
            
            plasma.x = this.x + (Math.random() - 0.5) * 30;
            plasma.y = this.y + (Math.random() - 0.5) * 20;
            plasma.life = 35;
            
            this.parent.addChild(plasma);
            
            const animatePlasma = () => {
                plasma.life--;
                plasma.alpha = plasma.life / 35 * 0.8;
                plasma.rotation += 0.1;
                plasma.scale.set(1 + Math.sin(plasma.life * 0.2) * 0.15);
                
                if (plasma.life <= 0) {
                    if (plasma.parent) plasma.parent.removeChild(plasma);
                } else {
                    requestAnimationFrame(animatePlasma);
                }
            };
            animatePlasma();
        }
    }

    createElectricWords() {
        // Rare electric text effect (easter egg)
        if (Math.random() < 0.001 && this.parent) {
            const words = ["ZAP!", "SHOCK!", "VOLT!", "SPARK!", "TESLA!", "BUZZ!"];
            const word = words[Math.floor(Math.random() * words.length)];
            
            // Create electric text effect
            const text = new PIXI.Graphics();
            text.beginFill(0x00BFFF, 0.9);
            
            // Simple letter shapes with electric effect
            for (let i = 0; i < word.length; i++) {
                text.drawRect(i * 8, 0, 6, 12);
                // Add electric highlights
                text.beginFill(0xFFFFFF, 0.6);
                text.drawRect(i * 8, 2, 6, 2);
                text.drawRect(i * 8 + 1, 0, 2, 12);
                text.endFill();
                text.beginFill(0x00BFFF, 0.9);
            }
            text.endFill();
            
            text.x = this.x + (Math.random() - 0.5) * 40;
            text.y = this.y - 25;
            text.vy = -2;
            text.life = 25;
            
            this.parent.addChild(text);
            
            const animateText = () => {
                text.y += text.vy;
                text.life--;
                text.alpha = text.life / 25;
                text.rotation += 0.02;
                
                // Add electric flicker
                if (Math.random() < 0.3) {
                    text.tint = 0xFFFFFF;
                } else {
                    text.tint = 0x00BFFF;
                }
                
                if (text.life <= 0) {
                    if (text.parent) text.parent.removeChild(text);
                } else {
                    requestAnimationFrame(animateText);
                }
            };
            animateText();
        }
    }

    // Override update to ensure stable movement
    update(nestPosition, foods) {
        if (this.hasExploded) return;
        
        // Call parent update normally
        return super.update(nestPosition, foods);
    }

    // Reduce jitter in target-seeking to match other ants
    moveTowardsTarget(target, jitter = 0.35) {
        // Use a much lower jitter for stable movement
        return super.moveTowardsTarget(target, 0.05);
    }
    
    // Clean up electric effects
    destroy() {
        // Clean up lightning bolts
        for (const bolt of this.lightningBolts) {
            if (bolt.parent) {
                bolt.parent.removeChild(bolt);
            }
        }
        this.lightningBolts = [];
        
        // Clean up static electricity
        for (const spark of this.staticElectricity) {
            if (spark.parent) {
                spark.parent.removeChild(spark);
            }
        }
        this.staticElectricity = [];
        
        if (super.destroy) {
            super.destroy();
        }
    }
};
