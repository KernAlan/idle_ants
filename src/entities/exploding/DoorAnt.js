// src/entities/exploding/DoorAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Exploding === 'undefined') IdleAnts.Entities.Exploding = {};

// Door Ant - slams shut like a door, crushing nearby enemies
IdleAnts.Entities.Exploding.DoorAnt = class extends IdleAnts.Entities.Ant {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Get ant type configuration
        const antType = IdleAnts.Data.AntTypes.DOOR_ANT;
        
        // Defensive check for missing ant type data
        if (!antType) {
            console.error('DoorAnt: Unable to find DOOR_ANT configuration in IdleAnts.Data.AntTypes');
        }
        
        // Use standard Ant movement/pathing
        super(texture, nestPosition, speedMultiplier);

        // Apply Door Ant type stats/props
        this.antType = antType || {
            color: 0x8B4513,
            glowColor: 0xD2691E,
            damage: 570,
            hp: 10,
            effect: 'doorSlam',
            explosionRadius: 60
        };
        this.tint = this.antType.color;
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        this.explosionRadius = this.antType.explosionRadius || 60;
        this.effectType = this.antType.effect;
        this.hasExploded = false;
        
        // Door-specific properties
        this.doorState = 'closed'; // closed, opening, open, slamming
        this.doorAngle = 0;
        this.targetDoorAngle = 0;
        this.doorSpeed = 0.1;
        this.hingePivot = { x: -8, y: 0 };
        
        // Door slam properties
        this.slamForce = 2.5;
        this.hingeCreakCounter = 0;
    }
    
    // Override to create door-specific body
    createBody() {
        const color = (this.antType && this.antType.color) || 0x8B4513;

        // Layered container: caution glow, body, sheen/glint
        this.bodyContainer = new PIXI.Container();

        // Back caution glow (warm orange)
        const glow = new PIXI.Graphics();
        for (let i = 0; i < 3; i++) {
            glow.beginFill(0xD2691E, 0.10 - i * 0.02);
            glow.drawCircle(0, 8, 18 + i * 4);
            glow.endFill();
        }
        glow.alpha = 0.28; this.bodyGlow = glow; this.bodyContainer.addChild(glow);

        const body = new PIXI.Graphics();
        // Door-like rectangular abdomen
        body.beginFill(color); body.drawRect(-8, 4, 16, 12); body.endFill();
        // Door frame thorax
        body.beginFill(0x654321); body.drawRect(-6, -4, 12, 8); body.endFill();
        // Head
        body.beginFill(color); body.drawEllipse(0, -8, 5, 6); body.endFill();

        // Subtle wood grain lines
        body.lineStyle(1, 0x5C3B1A, 0.4);
        for (let i = -6; i <= 6; i += 3) {
            body.moveTo(i, 4); body.lineTo(i + (Math.random() - 0.5), 16);
        }

        // Hinges
        body.beginFill(0x2F4F2F, 0.9);
        body.drawRect(-9, 2, 2, 4); body.drawRect(-9, 8, 2, 4); body.drawRect(-9, 14, 2, 4); body.endFill();

        // Handle + glint
        body.beginFill(0xFFD700); body.drawCircle(6, 10, 2); body.endFill();
        const glint = new PIXI.Graphics();
        glint.beginFill(0xFFFFFF, 0.6); glint.drawRect(7, 9, 0.8, 0.8); glint.endFill();

        // Panels
        body.lineStyle(1, 0x654321); body.drawRect(-6, 6, 10, 4); body.drawRect(-6, 12, 10, 4);

        // Antennae
        body.lineStyle(1.5, 0x2A1B10); body.moveTo(-2, -12); body.lineTo(-4, -16); body.moveTo(2, -12); body.lineTo(4, -16);

        this.bodyContainer.addChild(body);
        this.bodyContainer.addChild(glint);
        this.addChild(this.bodyContainer);
    }
    
    // Provide custom visuals + standard legs
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
        this.createDangerGlow();
    }

    // Override to create door visual elements
    createDangerGlow() {
        // Create warning signs around the door
        this.warningGlow = new PIXI.Graphics();
        this.updateWarningGlow();
        this.addChildAt(this.warningGlow, 0);
        
        // Create door shadow
        this.createDoorShadow();
    }
    
    createDoorShadow() {
        this.doorShadow = new PIXI.Graphics();
        this.doorShadow.beginFill(0x000000, 0.3);
        this.doorShadow.drawEllipse(0, 18, 12, 4);
        this.doorShadow.endFill();
        this.addChildAt(this.doorShadow, 0);
    }
    
    updateWarningGlow() {
        if (!this.warningGlow) return;
        
        this.warningGlow.clear();
        
        // Warning glow that intensifies when door is about to slam
        const glowIntensity = this.doorState === 'open' ? 0.8 : 0.3;
        const glowSize = 18 + (glowIntensity * 10);
        
        this.warningGlow.beginFill(0xFF4500, 0.2 + (glowIntensity * 0.3));
        this.warningGlow.drawCircle(0, 8, glowSize);
        this.warningGlow.endFill();
        
        // Danger stripes when about to slam
        if (this.doorState === 'open') {
            this.warningGlow.lineStyle(2, 0xFF0000, 0.6);
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const x1 = Math.cos(angle) * 12;
                const y1 = Math.sin(angle) * 12 + 8;
                const x2 = Math.cos(angle) * 20;
                const y2 = Math.sin(angle) * 20 + 8;
                this.warningGlow.moveTo(x1, y1);
                this.warningGlow.lineTo(x2, y2);
            }
        }
    }

    // Mild aesthetic animation loop only
    performAnimation() {
        this.animateLegs();
        this.animateDangerGlow();
        this.animateCautionGlow();
        this.createHingeDustMotes();
        this.animateHandleGlint();
        // Pulse body back-glow subtly
        const t = Date.now() * 0.006;
        if (this.bodyGlow) { const p = 0.97 + Math.sin(t) * 0.03; this.bodyGlow.scale.set(p); }
    }

    animateCautionGlow() {
        if (!this.warningGlow) return;
        this.warningGlow.rotation += 0.02;
        this.warningGlow.alpha = 0.25 + (this.doorState === 'open' ? 0.15 : 0.05);
    }

    createHingeDustMotes() {
        if ((this.doorState === 'opening' || this.doorState === 'slamming') && Math.random() < 0.08 && this.parent) {
            const mote = new PIXI.Graphics();
            mote.beginFill(0xD2B48C, 0.8); mote.drawRect(0, 0, 1, 1); mote.endFill();
            mote.x = this.x + this.hingePivot.x + (Math.random() - 0.5) * 2;
            mote.y = this.y + this.hingePivot.y + (Math.random() - 0.5) * 2;
            mote.vy = -0.4; mote.life = 16; this.parent.addChild(mote);
            const anim = () => { mote.life--; mote.y += mote.vy; mote.alpha = mote.life / 16; if (mote.life <= 0) { if (mote.parent) mote.parent.removeChild(mote); } else { requestAnimationFrame(anim); } };
            anim();
        }
    }

    animateHandleGlint() {
        if (!this.bodyContainer) return;
        // Slight shimmer by toggling glint alpha
        if (this.bodyContainer.children.length > 1) {
            const glint = this.bodyContainer.children[this.bodyContainer.children.length - 1];
            const t = Date.now() * 0.01;
            glint.alpha = 0.4 + (Math.sin(t) + 1) * 0.3;
        }
    }
    
    // Use ExplodingAntBase standard animation
    
    updateDoorState() {
        // Check for nearby enemies to trigger door opening
        const enemies = this.findNearbyEnemies(60); // Larger detection range
        
        if (enemies.length > 0 && this.doorState === 'closed') {
            this.openDoor();
        } else if (enemies.length === 0 && this.doorState === 'open') {
            // Stay open for a moment, then close
            setTimeout(() => {
                if (this.doorState === 'open') {
                    this.closeDoor();
                }
            }, 1000);
        }
    }
    
    openDoor() {
        if (this.doorState !== 'closed') return;
        
        this.doorState = 'opening';
        this.targetDoorAngle = Math.PI * 0.7; // Open 126 degrees
        this.updateWarningGlow();
    }
    
    closeDoor() {
        if (this.doorState !== 'open') return;
        
        this.doorState = 'slamming';
        this.targetDoorAngle = 0;
        this.doorSpeed = 0.3; // Much faster closing
        this.updateWarningGlow();
    }
    
    animateDoor() {
        // Smooth door rotation animation
        const angleDiff = this.targetDoorAngle - this.doorAngle;
        
        if (Math.abs(angleDiff) > 0.05) {
            this.doorAngle += angleDiff * this.doorSpeed;
            
            // Apply door rotation (pivot around hinge)
            this.updateDoorVisuals();
        } else {
            // Door reached target position
            if (this.doorState === 'opening') {
                this.doorState = 'open';
                this.doorSpeed = 0.1; // Reset to normal speed
            } else if (this.doorState === 'slamming') {
                this.doorState = 'closed';
                this.doorSpeed = 0.1; // Reset to normal speed
                this.createSlamEffect();
            }
        }
    }
    
    updateDoorVisuals() {
        // Create visual effect of door opening/closing
        // This would ideally rotate the door graphic around the hinge point
        this.rotation = this.doorAngle * 0.1; // Subtle rotation effect
        
        // Scale effect to simulate 3D door swing
        const openPercent = Math.abs(this.doorAngle) / (Math.PI * 0.7);
        this.scale.x = 1 - (openPercent * 0.2);
    }
    
    createHingeCreaks() {
        this.hingeCreakCounter++;
        
        // Create creak particles when door moves
        if ((this.doorState === 'opening' || this.doorState === 'slamming') && 
            this.hingeCreakCounter % 10 === 0) {
            this.createCreakParticle();
        }
    }
    
    createCreakParticle() {
        const creak = new PIXI.Graphics();
        creak.beginFill(0x8B4513, 0.6);
        creak.drawCircle(0, 0, 1);
        creak.endFill();
        
        creak.x = this.x + this.hingePivot.x;
        creak.y = this.y + this.hingePivot.y;
        creak.vy = -0.5;
        creak.life = 20;
        
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(creak);
        } else if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(creak);
        
        const animateCreak = () => {
                creak.y += creak.vy;
                creak.life--;
                creak.alpha = creak.life / 20;
                
                if (creak.life <= 0) {
                    if (creak.parent) {
                        creak.parent.removeChild(creak);
                    }
                } else {
                    requestAnimationFrame(animateCreak);
                }
            };
            animateCreak();
        }
    }
    
    createSlamEffect() {
        // Create dust cloud from door slam
        for (let i = 0; i < 8; i++) {
            const dust = new PIXI.Graphics();
            dust.beginFill(0x8B7355, 0.7);
            dust.drawCircle(0, 0, 2 + Math.random() * 2);
            dust.endFill();
            
            dust.x = this.x + (Math.random() - 0.5) * 20;
            dust.y = this.y + 10 + Math.random() * 8;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            dust.vx = Math.cos(angle) * speed;
            dust.vy = Math.sin(angle) * speed - 1;
            dust.life = 30 + Math.random() * 20;
            dust.maxLife = dust.life;
            
            if (IdleAnts.app && IdleAnts.app.worldContainer) {
                IdleAnts.app.worldContainer.addChild(dust);
            } else if (IdleAnts.app && IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(dust);
            
                const animateDust = () => {
                    dust.x += dust.vx;
                    dust.y += dust.vy;
                    dust.vx *= 0.98;
                    dust.vy *= 0.98;
                    dust.life--;
                    dust.alpha = dust.life / dust.maxLife;
                    dust.scale.set(1 + (1 - dust.life / dust.maxLife) * 0.5);
                    
                    if (dust.life <= 0) {
                        if (dust.parent) {
                            dust.parent.removeChild(dust);
                        }
                    } else {
                        requestAnimationFrame(animateDust);
                    }
                };
                animateDust();
            }
        }
        
        // Screen shake effect
        if (IdleAnts.app && IdleAnts.app.cameraManager) {
            IdleAnts.app.cameraManager.shake(5, 200);
        }
    }
    
    findNearbyEnemies(range = 40) {
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return [];
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        const nearbyEnemies = [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= range) {
                nearbyEnemies.push(enemy);
            }
        }
        
        return nearbyEnemies;
    }
    
    // Override explosion to create door slam effect
    createExplosionEffect() {
        // Temporarily disabled explosion visuals
        return;
    }
    
    createSlamWave(waveIndex) {
        const wave = new PIXI.Graphics();
        wave.lineStyle(3 - waveIndex, 0x8B4513, 0.8 - (waveIndex * 0.2));
        wave.drawCircle(0, 0, 20 + (waveIndex * 15));
        
        wave.x = this.x;
        wave.y = this.y;
        wave.life = 20;
        wave.maxLife = wave.life;
        
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(wave);
        } else if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(wave);
            
            const animateWave = () => {
                wave.life--;
                const lifePercent = wave.life / wave.maxLife;
                wave.alpha = lifePercent;
                wave.scale.set(1 + (1 - lifePercent) * 2);
                
                if (wave.life <= 0) {
                    if (wave.parent) {
                        wave.parent.removeChild(wave);
                    }
                } else {
                    requestAnimationFrame(animateWave);
                }
            };
            animateWave();
        }
    }
    
    // Override to add crushing damage
    dealExplosionDamage() {
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return;
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        for (const enemy of enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= this.explosionRadius) {
                // Base AOE damage falloff
                const damageMultiplier = 1 - (distance / this.explosionRadius);
                const finalDamage = Math.floor(this.attackDamage * damageMultiplier);
                if (finalDamage > 0 && typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(finalDamage);
                }
                // Bonus crush + knockback for closer range
                if (distance <= this.explosionRadius * 0.7) {
                    const crushDamage = Math.floor(this.attackDamage * 0.5);
                    if (crushDamage > 0 && typeof enemy.takeDamage === 'function') {
                        enemy.takeDamage(crushDamage);
                    }
                    if (enemy.vx !== undefined && enemy.vy !== undefined) {
                        const knockbackAngle = Math.atan2(dy, dx);
                        const knockbackForce = this.slamForce;
                        enemy.vx += Math.cos(knockbackAngle) * knockbackForce;
                        enemy.vy += Math.sin(knockbackAngle) * knockbackForce;
                    }
                }
            }
        }
    }

    // Trigger slam/explosion on death while keeping Ant movement
    die() {
        if (!this.hasExploded) {
            this.hasExploded = true;
            this.dealExplosionDamage();
            // Create multiple slam waves for feedback
            for (let i = 0; i < 2; i++) this.createSlamWave(i);
            this.createSlamEffect();
            this.createExplosionEffect(); // currently no-op to avoid residue
        }
        super.die();
    }
};
