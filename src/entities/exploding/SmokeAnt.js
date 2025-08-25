// src/entities/exploding/SmokeAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Exploding === 'undefined') IdleAnts.Entities.Exploding = {};

// Smoke Ant - explodes in a concealing cloud of smoke on death
IdleAnts.Entities.Exploding.SmokeAnt = class extends IdleAnts.Entities.Ant {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Get ant type configuration
        const antType = IdleAnts.Data.AntTypes.SMOKE_ANT;
        
        // Defensive check for missing ant type data
        if (!antType) {
            console.error('SmokeAnt: Unable to find SMOKE_ANT configuration in IdleAnts.Data.AntTypes');
        }
        
        // Use standard Ant pathing/movement
        super(texture, nestPosition, speedMultiplier);

        // Apply Smoke Ant type stats/props
        this.antType = antType || {
            color: 0x696969,
            glowColor: 0xA9A9A9,
            damage: 240,
            hp: 50,
            effect: 'smokeExplosion',
            explosionRadius: 80
        };
        this.tint = this.antType.color;
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        this.explosionRadius = this.antType.explosionRadius || 80;
        this.effectType = this.antType.effect;
        this.hasExploded = false;
        
        // Smoke-specific properties
        this.smokeCloudDuration = 240; // 4 seconds
        this.smokeCloudRadius = 80;
        this.smokeOpacity = 0.8;
        
        // Visual smoke emission
        this.smokeParticles = [];
        this.smokeEmissionRate = 0.1;

        // Use AntBase defaults for movement/pathing (no custom overrides)
    }
    
    // Use custom body plus standard legs
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
    }
    
    // Override to create smoke-specific body
    createBody() {
        const color = (this.antType && this.antType.color) || 0x696969;

        // Layered container: soft glow, body, sheen
        this.bodyContainer = new PIXI.Container();

        // Back glow
        const glow = new PIXI.Graphics();
        for (let i = 0; i < 3; i++) {
            glow.beginFill(0xA9A9A9, 0.10 - i * 0.02);
            glow.drawCircle(0, 2, 16 + i * 4);
            glow.endFill();
        }
        glow.alpha = 0.28; this.bodyGlow = glow; this.bodyContainer.addChild(glow);

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

        // Antennae
        body.lineStyle(1, 0x2A1B10);
        body.moveTo(-2, -12); body.lineTo(-4, -16);
        body.moveTo(2, -12);  body.lineTo(4, -16);

        // Vents
        for (let i = 0; i < 4; i++) {
            body.beginFill(0x555555, 0.6);
            body.drawCircle(-3 + (i * 2), 6 + (i % 2), 1);
            body.endFill();
        }

        // Sheen
        const sheen = new PIXI.Graphics();
        sheen.beginFill(0xFFFFFF, 0.08);
        sheen.drawEllipse(-2, 4, 4.5, 1.6);
        sheen.endFill();
        this.bodySheen = sheen;

        this.bodyContainer.addChild(body);
        this.bodyContainer.addChild(sheen);
        this.addChild(this.bodyContainer);
    }
    
    // Tasteful smoke aesthetics (no gameplay/physics changes)
    performAnimation() {
        this.animateLegs();
        this.emitSmokeParticles();
        this.updateSmokeParticles();
        this.createSmokeTrails();
        this.animateSmokeVents();
        this.updateSmokeGlow();
        // Subtle extras
        this.createSoftSwirl();
        this.createAshSparkles();
    }

    // Movement/pathing: inherit AntBase behavior

    // Seeking/collection: inherit AntBase behavior
    
    emitSmokeParticles() {
        // Emit smoke particles while alive
        if (Math.random() < this.smokeEmissionRate && !this.hasExploded) {
            this.createSmokeParticle();
        }
    }
    
    createSmokeParticle() {
        const particle = new PIXI.Graphics();
        particle.beginFill(0x666666, 0.4);
        particle.drawCircle(0, 0, 1 + Math.random() * 2);
        particle.endFill();
        
        // Position randomly around the ant
        particle.x = this.x + (Math.random() - 0.5) * 12;
        particle.y = this.y + 8 + Math.random() * 4;
        
        // Add velocity
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = -0.5 - Math.random() * 0.5;
        particle.life = 30 + Math.random() * 30;
        particle.maxLife = particle.life;
        
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(particle);
            this.smokeParticles.push(particle);
        } else if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(particle);
            this.smokeParticles.push(particle);
        }
    }
    
    updateSmokeParticles() {
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const particle = this.smokeParticles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Slow down over time
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Fade and expand
            particle.life--;
            const lifePercent = particle.life / particle.maxLife;
            particle.alpha = lifePercent * 0.4;
            particle.scale.set(1 + (1 - lifePercent) * 2);
            
            // Remove when dead
            if (particle.life <= 0) {
                if (particle.parent) {
                    particle.parent.removeChild(particle);
                }
                this.smokeParticles.splice(i, 1);
            }
        }
    }
    
    // Override explosion to create smoke cloud effect
    createExplosionEffect() {
        // Temporarily disabled explosion visuals
        return;
    }
    
    createExplosionSmokeParticle() {
        const particle = new PIXI.Graphics();
        particle.beginFill(((this.antType && this.antType.color) || 0x696969), 0.6);
        particle.drawCircle(0, 0, 3 + Math.random() * 5);
        particle.endFill();
        
        // Start at explosion center
        particle.x = this.x;
        particle.y = this.y;
        
        // Random direction and speed
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particle.life = 60 + Math.random() * 60;
        particle.maxLife = particle.life;
        
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(particle);
            this.smokeParticles.push(particle);
        } else if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(particle);
            this.smokeParticles.push(particle);
        }

        
    }
    
    // Override to add smoke cloud concealment effect and AOE damage
    dealExplosionDamage() {
        // AOE damage decreasing with distance
        if (IdleAnts.app && IdleAnts.app.entityManager) {
            const enemies = IdleAnts.app.entityManager.entities.enemies || [];
            for (const enemy of enemies) {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this.explosionRadius) {
                    const damageMultiplier = 1 - (distance / this.explosionRadius);
                    const finalDamage = Math.floor(this.attackDamage * damageMultiplier);
                    if (finalDamage > 0 && typeof enemy.takeDamage === 'function') {
                        enemy.takeDamage(finalDamage);
                    }
                }
            }
        }

        // Create concealment effect that blinds nearby enemies
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return;
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= this.explosionRadius) {
                // Apply concealment effect (reduce enemy accuracy/vision)
                if (enemy.applyStatusEffect) {
                    enemy.applyStatusEffect('concealed', this.smokeCloudDuration);
                } else {
                    // Fallback: slow down enemy
                    if (enemy.speed) {
                        enemy.speed *= 0.5;
                        setTimeout(() => {
                            if (enemy.speed) {
                                enemy.speed *= 2; // Restore speed
                            }
                        }, this.smokeCloudDuration * (1000/60)); // Convert frames to ms
                    }
                }
            }
        }
    }
    
    // Standard leg animation from AntBase
    animateLegs() {
        if (!this.legs || !this.legsContainer) return;
        
        this.legPhase = (this.legPhase || 0) + 0.25;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const animationRate = Math.max(0.1, speed * 0.35);

        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') phase += Math.PI;

            const legMovement = Math.sin(phase * animationRate) * 2;
            leg.clear();
            leg.lineStyle(1.5, 0x2A1B10);
            leg.moveTo(0, 0);

            const bendFactor = Math.max(0, -Math.sin(phase));
            const midX = (leg.side === 'left' ? -4 : 4) - bendFactor * 2 * (leg.side === 'left' ? 1 : -1);
            const midY = legMovement - 2 - bendFactor * 2;
            const endX = (leg.side === 'left' ? -8 : 8);
            leg.lineTo(midX, midY);
            leg.lineTo(endX, -5 + legMovement);
        }
    }

    createSmokeTrails() {
        // Create dense smoke trails when moving
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0.5 && Math.random() < 0.4 && IdleAnts.app) {
            const trail = new PIXI.Graphics();
            
            // Random smoke colors from dark to light gray
            const smokeColors = [0x333333, 0x555555, 0x777777, 0x999999];
            const color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
            
            trail.beginFill(color, 0.6);
            trail.drawEllipse(0, 0, 3 + Math.random() * 4, 2 + Math.random() * 3);
            trail.endFill();
            
            // Position behind the ant
            const trailDistance = 15 + Math.random() * 10;
            const angle = Math.atan2(this.vy, this.vx) + Math.PI; // Opposite direction
            trail.x = this.x + Math.cos(angle) * trailDistance;
            trail.y = this.y + Math.sin(angle) * trailDistance;
            
            trail.life = 25 + Math.random() * 20;
            trail.initialLife = trail.life;
            trail.vy = -0.3 - Math.random() * 0.4; // Rise upward
            trail.vx = (Math.random() - 0.5) * 1.5; // Horizontal drift
            trail.rotationSpeed = (Math.random() - 0.5) * 0.05;
            
            if (IdleAnts.app.worldContainer) {
                IdleAnts.app.worldContainer.addChild(trail);
            } else if (IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(trail);
            }
            
            const animateTrail = () => {
                trail.x += trail.vx;
                trail.y += trail.vy;
                trail.rotation += trail.rotationSpeed;
                trail.life--;
                trail.alpha = (trail.life / trail.initialLife) * 0.6;
                trail.scale.set(1 + (1 - trail.life / trail.initialLife) * 2);
                
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

    // Ensure explosion triggers on death but movement/pathing stays identical
    die() {
        if (!this.hasExploded) {
            this.hasExploded = true;
            this.createExplosionEffect();
            this.dealExplosionDamage();
        }
        super.die();
    }

    // Stuck detection: inherit AntBase behavior

    animateSmokeVents() {
        // Make the smoke vents on the back pulse and emit smoke
        const time = Date.now() * 0.01;
        
        // Create additional smoke from vents
        if (Math.random() < 0.25 && IdleAnts.app) {
            const ventSmoke = new PIXI.Graphics();
            ventSmoke.beginFill(0x666666, 0.5);
            ventSmoke.drawCircle(0, 0, 1 + Math.random() * 1.5);
            ventSmoke.endFill();
            
            // Position at one of the smoke vents
            const ventIndex = Math.floor(Math.random() * 4);
            const ventX = this.x + (-3 + (ventIndex * 2));
            const ventY = this.y + (6 + (ventIndex % 2));
            
            ventSmoke.x = ventX;
            ventSmoke.y = ventY;
            ventSmoke.vy = -1 - Math.random() * 0.5;
            ventSmoke.vx = (Math.random() - 0.5) * 0.5;
            ventSmoke.life = 20 + Math.random() * 15;
            ventSmoke.initialLife = ventSmoke.life;
            
            if (IdleAnts.app.worldContainer) {
                IdleAnts.app.worldContainer.addChild(ventSmoke);
            } else if (IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(ventSmoke);
            }
            
            const animateVentSmoke = () => {
                ventSmoke.x += ventSmoke.vx;
                ventSmoke.y += ventSmoke.vy;
                ventSmoke.life--;
                ventSmoke.alpha = (ventSmoke.life / ventSmoke.initialLife) * 0.5;
                ventSmoke.scale.set(1 + (1 - ventSmoke.life / ventSmoke.initialLife) * 1.5);
                
                if (ventSmoke.life <= 0) {
                    if (ventSmoke.parent) {
                        ventSmoke.parent.removeChild(ventSmoke);
                    }
                } else {
                    requestAnimationFrame(animateVentSmoke);
                }
            };
            animateVentSmoke();
        }
    }

    updateSmokeGlow() {
        // Create a subtle gray glow that pulses
        const time = Date.now() * 0.005;
        const glow = Math.sin(time) * 0.2 + 0.8;
        const gray = Math.floor(150 * glow);
        this.tint = (gray << 16) | (gray << 8) | gray;

        // Pulse any back-glow/sheens if present
        if (this.bodyGlow) {
            const pulse = 0.95 + Math.sin(time * 0.8) * 0.05;
            this.bodyGlow.scale.set(pulse);
            this.bodyGlow.alpha = 0.28 + Math.sin(time * 0.6) * 0.08;
        }
        if (this.bodySheen) {
            this.bodySheen.alpha = 0.08 + (Math.cos(time * 1.1) + 1) * 0.04;
        }
    }

    // Gentle rotating rings to suggest eddies of smoke
    createSoftSwirl() {
        if (Math.random() < 0.02 && this.parent) {
            const swirl = new PIXI.Graphics();
            swirl.lineStyle(1, 0x777777, 0.4);
            for (let i = 0; i < 4; i++) {
                swirl.drawCircle(0, 0, 8 + i * 3);
            }
            swirl.x = this.x; swirl.y = this.y; swirl.life = 28;
            this.parent.addChild(swirl);
            const anim = () => {
                swirl.life--; swirl.rotation += 0.04; swirl.alpha = swirl.life / 28 * 0.4;
                if (swirl.life <= 0) { if (swirl.parent) swirl.parent.removeChild(swirl); } else { requestAnimationFrame(anim); }
            };
            anim();
        }
    }

    // Tiny ash-like sparkles drifting up
    createAshSparkles() {
        if (Math.random() < 0.06 && this.parent) {
            const ash = new PIXI.Graphics();
            ash.beginFill(0xAAAAAA, 0.7); ash.drawRect(0, 0, 1, 1); ash.endFill();
            ash.x = this.x + (Math.random() - 0.5) * 10;
            ash.y = this.y + 6 + (Math.random() - 0.5) * 4;
            ash.vy = -0.4; ash.life = 18; this.parent.addChild(ash);
            const anim = () => {
                ash.life--; ash.y += ash.vy; ash.alpha = ash.life / 18;
                if (ash.life <= 0) { if (ash.parent) ash.parent.removeChild(ash); } else { requestAnimationFrame(anim); }
            };
            anim();
        }
    }

    createSmokeNuke() {
        // MUSHROOM CLOUD EXPLOSION!
        if (Math.random() < 0.003 && IdleAnts.app && IdleAnts.app.stage) {
            const nuke = new PIXI.Graphics();
            
            // Mushroom cloud
            nuke.beginFill(0x555555, 0.8);
            nuke.drawCircle(0, -30, 25); // Top cap
            nuke.drawRect(-8, -20, 16, 40); // Stem
            nuke.drawCircle(0, 20, 15); // Base
            nuke.endFill();
            
            // Explosion rings
            for (let i = 0; i < 5; i++) {
                nuke.lineStyle(3, 0x888888, 0.6);
                nuke.drawCircle(0, 0, 20 + i * 15);
            }
            
            nuke.x = this.x;
            nuke.y = this.y;
            nuke.life = 180;
            nuke.scale.set(0.1);
            
            IdleAnts.app.stage.addChild(nuke);
            
            const animateNuke = () => {
                nuke.life--;
                const progress = 1 - nuke.life / 180;
                nuke.scale.set(0.1 + progress * 2);
                nuke.alpha = 1 - progress * 0.5;
                nuke.y = this.y - progress * 50;
                
                if (nuke.life <= 0) {
                    if (nuke.parent) nuke.parent.removeChild(nuke);
                } else {
                    requestAnimationFrame(animateNuke);
                }
            };
            animateNuke();
        }
    }

    createSmokeMonster() {
        // SMOKE CREATURE!
        if (Math.random() < 0.004 && IdleAnts.app && IdleAnts.app.stage) {
            const monster = new PIXI.Graphics();
            
            // Monster body
            monster.beginFill(0x333333, 0.7);
            monster.drawEllipse(0, 0, 20, 30);
            monster.endFill();
            
            // Monster head
            monster.beginFill(0x444444, 0.8);
            monster.drawCircle(0, -25, 15);
            monster.endFill();
            
            // Scary eyes
            monster.beginFill(0xFF0000);
            monster.drawCircle(-5, -27, 3);
            monster.drawCircle(5, -27, 3);
            monster.endFill();
            
            // Monster arms
            monster.beginFill(0x555555, 0.6);
            monster.drawEllipse(-25, -10, 8, 20);
            monster.drawEllipse(25, -10, 8, 20);
            monster.endFill();
            
            monster.x = this.x + (Math.random() - 0.5) * 60;
            monster.y = this.y - 20;
            monster.life = 150;
            monster.wavePhase = 0;
            
            IdleAnts.app.stage.addChild(monster);
            
            const animateMonster = () => {
                monster.life--;
                monster.wavePhase += 0.2;
                monster.scale.set(1 + Math.sin(monster.wavePhase) * 0.2);
                monster.rotation = Math.sin(monster.wavePhase * 0.5) * 0.1;
                monster.alpha = monster.life / 150 * 0.7;
                
                if (monster.life <= 0) {
                    if (monster.parent) monster.parent.removeChild(monster);
                } else {
                    requestAnimationFrame(animateMonster);
                }
            };
            animateMonster();
        }
    }

    createSmokePortal() {
        // INTERDIMENSIONAL SMOKE PORTAL!
        if (Math.random() < 0.002 && IdleAnts.app && IdleAnts.app.stage) {
            const portal = new PIXI.Graphics();
            
            // Portal rings
            for (let i = 0; i < 8; i++) {
                const radius = 5 + i * 4;
                const color = i % 2 === 0 ? 0x666666 : 0x999999;
                portal.lineStyle(2, color, 0.8 - i * 0.08);
                portal.drawCircle(0, 0, radius);
            }
            
            portal.x = this.x;
            portal.y = this.y;
            portal.life = 200;
            portal.spinSpeed = 0.1;
            
            IdleAnts.app.stage.addChild(portal);
            
            // Spawn smoke creatures from portal
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const creature = new PIXI.Graphics();
                    creature.beginFill(0x777777, 0.6);
                    creature.drawCircle(0, 0, 4 + Math.random() * 6);
                    creature.endFill();
                    
                    const angle = Math.random() * Math.PI * 2;
                    creature.x = this.x;
                    creature.y = this.y;
                    creature.vx = Math.cos(angle) * 3;
                    creature.vy = Math.sin(angle) * 3;
                    creature.life = 80;
                    
                    IdleAnts.app.stage.addChild(creature);
                    
                    const animateCreature = () => {
                        creature.x += creature.vx;
                        creature.y += creature.vy;
                        creature.life--;
                        creature.alpha = creature.life / 80 * 0.6;
                        
                        if (creature.life <= 0) {
                            if (creature.parent) creature.parent.removeChild(creature);
                        } else {
                            requestAnimationFrame(animateCreature);
                        }
                    };
                    animateCreature();
                }, i * 200);
            }
            
            const animatePortal = () => {
                portal.life--;
                portal.rotation += portal.spinSpeed;
                portal.alpha = portal.life / 200 * 0.8;
                
                if (portal.life <= 0) {
                    if (portal.parent) portal.parent.removeChild(portal);
                } else {
                    requestAnimationFrame(animatePortal);
                }
            };
            animatePortal();
        }
    }

    createSmokeStorm() {
        // MASSIVE SMOKE STORM!
        if (Math.random() < 0.005 && IdleAnts.app && IdleAnts.app.stage) {
            for (let i = 0; i < 20; i++) {
                const storm = new PIXI.Graphics();
                storm.beginFill(0x666666, 0.5);
                storm.drawEllipse(0, 0, 8 + Math.random() * 12, 4 + Math.random() * 8);
                storm.endFill();
                
                const angle = Math.random() * Math.PI * 2;
                const distance = 30 + Math.random() * 80;
                storm.x = this.x + Math.cos(angle) * distance;
                storm.y = this.y + Math.sin(angle) * distance;
                storm.vx = (Math.random() - 0.5) * 4;
                storm.vy = (Math.random() - 0.5) * 4;
                storm.life = 120;
                storm.spin = (Math.random() - 0.5) * 0.1;
                
                IdleAnts.app.stage.addChild(storm);
                
                const animateStorm = () => {
                    storm.x += storm.vx;
                    storm.y += storm.vy;
                    storm.rotation += storm.spin;
                    storm.life--;
                    storm.alpha = storm.life / 120 * 0.5;
                    storm.scale.set(1 + (1 - storm.life / 120) * 2);
                    
                    if (storm.life <= 0) {
                        if (storm.parent) storm.parent.removeChild(storm);
                    } else {
                        requestAnimationFrame(animateStorm);
                    }
                };
                animateStorm();
            }
        }
    }

    createSmokeFace() {
        // SPOOKY SMOKE FACE!
        if (Math.random() < 0.006 && IdleAnts.app && IdleAnts.app.stage) {
            const face = new PIXI.Graphics();
            
            // Face outline
            face.lineStyle(3, 0x777777, 0.8);
            face.drawCircle(0, 0, 20);
            
            // Eyes
            face.beginFill(0xFF0000);
            face.drawCircle(-7, -5, 3);
            face.drawCircle(7, -5, 3);
            face.endFill();
            
            // Mouth
            face.lineStyle(3, 0xFF0000, 0.8);
            face.moveTo(-8, 8);
            face.bezierCurveTo(-4, 15, 4, 15, 8, 8);
            
            face.x = this.x + (Math.random() - 0.5) * 50;
            face.y = this.y - 30;
            face.life = 100;
            face.bob = 0;
            
            IdleAnts.app.stage.addChild(face);
            
            const animateFace = () => {
                face.life--;
                face.bob += 0.1;
                face.y = this.y - 30 + Math.sin(face.bob) * 5;
                face.alpha = face.life / 100 * 0.8;
                
                if (face.life <= 0) {
                    if (face.parent) face.parent.removeChild(face);
                } else {
                    requestAnimationFrame(animateFace);
                }
            };
            animateFace();
        }
    }

    createSmokeWords() {
        // FLOATING SMOKE WORDS!
        if (Math.random() < 0.01 && IdleAnts.app && IdleAnts.app.stage) {
            const words = ["SMOKE!", "TOXIC!", "CHOKE!", "CLOUD!", "PUFF!", "SMOG!"];
            const word = words[Math.floor(Math.random() * words.length)];
            
            const text = new PIXI.Graphics();
            text.beginFill(0x888888);
            
            // Create smoky letter blocks
            for (let i = 0; i < word.length; i++) {
                const x = i * 12;
                text.drawRect(x, 0, 10, 18);
                if (Math.random() < 0.8) text.drawRect(x, 9, 10, 4);
                if (Math.random() < 0.6) text.drawRect(x + 2, 0, 6, 18);
            }
            text.endFill();
            
            text.x = this.x - word.length * 6;
            text.y = this.y - 40;
            text.vy = -1;
            text.life = 90;
            text.scale.set(0.6);
            
            IdleAnts.app.stage.addChild(text);
            
            const animateText = () => {
                text.y += text.vy;
                text.life--;
                text.alpha = text.life / 90 * 0.8;
                text.rotation += 0.01;
                
                if (text.life <= 0) {
                    if (text.parent) text.parent.removeChild(text);
                } else {
                    requestAnimationFrame(animateText);
                }
            };
            animateText();
        }
    }

    createSmokeFactory() {
        // SMOKE FACTORY!
        if (Math.random() < 0.001 && IdleAnts.app && IdleAnts.app.stage) {
            const factory = new PIXI.Graphics();
            
            // Factory building
            factory.beginFill(0x666666);
            factory.drawRect(-20, 0, 40, 25);
            factory.endFill();
            
            // Smokestacks
            factory.beginFill(0x444444);
            factory.drawRect(-15, -20, 6, 20);
            factory.drawRect(-5, -25, 6, 25);
            factory.drawRect(5, -20, 6, 20);
            factory.drawRect(15, -15, 6, 15);
            factory.endFill();
            
            factory.x = this.x;
            factory.y = this.y + 30;
            factory.life = 250;
            
            IdleAnts.app.stage.addChild(factory);
            
            // Emit smoke from stacks
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    const stacks = [-12, -2, 8, 18];
                    const heights = [-20, -25, -20, -15];
                    
                    stacks.forEach((stackX, idx) => {
                        const smoke = new PIXI.Graphics();
                        smoke.beginFill(0x777777, 0.6);
                        smoke.drawCircle(0, 0, 3 + Math.random() * 4);
                        smoke.endFill();
                        
                        smoke.x = this.x + stackX;
                        smoke.y = this.y + 30 + heights[idx];
                        smoke.vy = -2 - Math.random();
                        smoke.vx = (Math.random() - 0.5) * 2;
                        smoke.life = 60;
                        
                        IdleAnts.app.stage.addChild(smoke);
                        
                        const animateFactorySmoke = () => {
                            smoke.x += smoke.vx;
                            smoke.y += smoke.vy;
                            smoke.life--;
                            smoke.alpha = smoke.life / 60 * 0.6;
                            smoke.scale.set(1 + (1 - smoke.life / 60) * 1.5);
                            
                            if (smoke.life <= 0) {
                                if (smoke.parent) smoke.parent.removeChild(smoke);
                            } else {
                                requestAnimationFrame(animateFactorySmoke);
                            }
                        };
                        animateFactorySmoke();
                    });
                }, i * 100);
            }
            
            const animateFactory = () => {
                factory.life--;
                factory.alpha = factory.life / 250;
                
                if (factory.life <= 0) {
                    if (factory.parent) factory.parent.removeChild(factory);
                } else {
                    requestAnimationFrame(animateFactory);
                }
            };
            animateFactory();
        }
    }

    createSmokeDragons() {
        // SMOKE DRAGONS!
        if (Math.random() < 0.003 && IdleAnts.app && IdleAnts.app.stage) {
            const dragon = new PIXI.Graphics();
            
            // Dragon head
            dragon.beginFill(0x555555, 0.8);
            dragon.drawEllipse(0, 0, 12, 8);
            dragon.endFill();
            
            // Dragon body segments
            for (let i = 1; i < 6; i++) {
                dragon.beginFill(0x666666, 0.7 - i * 0.1);
                dragon.drawEllipse(-i * 8, Math.sin(i) * 4, 8 - i, 6 - i);
                dragon.endFill();
            }
            
            // Wings
            dragon.beginFill(0x777777, 0.5);
            dragon.drawEllipse(-5, -8, 8, 12);
            dragon.drawEllipse(5, -8, 8, 12);
            dragon.endFill();
            
            dragon.x = this.x + 50;
            dragon.y = this.y - 30;
            dragon.vx = -2;
            dragon.vy = Math.sin(Date.now() * 0.01) * 0.5;
            dragon.life = 120;
            dragon.wingPhase = 0;
            
            IdleAnts.app.stage.addChild(dragon);
            
            const animateDragon = () => {
                dragon.x += dragon.vx;
                dragon.y += dragon.vy;
                dragon.wingPhase += 0.3;
                dragon.life--;
                dragon.alpha = dragon.life / 120 * 0.8;
                
                // Wing flapping
                dragon.rotation = Math.sin(dragon.wingPhase) * 0.1;
                
                if (dragon.life <= 0) {
                    if (dragon.parent) dragon.parent.removeChild(dragon);
                } else {
                    requestAnimationFrame(animateDragon);
                }
            };
            animateDragon();
        }
    }

    createSmokeVolcano() {
        // SMOKE VOLCANO!
        if (Math.random() < 0.001 && IdleAnts.app && IdleAnts.app.stage) {
            const volcano = new PIXI.Graphics();
            
            // Volcano shape
            volcano.beginFill(0x8B4513);
            volcano.moveTo(0, -30);
            volcano.lineTo(-25, 20);
            volcano.lineTo(25, 20);
            volcano.closePath();
            volcano.endFill();
            
            // Crater
            volcano.beginFill(0xFF4500);
            volcano.drawEllipse(0, -30, 8, 4);
            volcano.endFill();
            
            volcano.x = this.x;
            volcano.y = this.y + 40;
            volcano.life = 300;
            
            IdleAnts.app.stage.addChild(volcano);
            
            // Erupt smoke
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const eruption = new PIXI.Graphics();
                    eruption.beginFill(0x666666, 0.7);
                    eruption.drawCircle(0, 0, 4 + Math.random() * 8);
                    eruption.endFill();
                    
                    eruption.x = this.x + (Math.random() - 0.5) * 16;
                    eruption.y = this.y + 10;
                    eruption.vy = -3 - Math.random() * 4;
                    eruption.vx = (Math.random() - 0.5) * 3;
                    eruption.life = 80;
                    
                    IdleAnts.app.stage.addChild(eruption);
                    
                    const animateEruption = () => {
                        eruption.x += eruption.vx;
                        eruption.y += eruption.vy;
                        eruption.life--;
                        eruption.alpha = eruption.life / 80 * 0.7;
                        eruption.scale.set(1 + (1 - eruption.life / 80) * 2);
                        
                        if (eruption.life <= 0) {
                            if (eruption.parent) eruption.parent.removeChild(eruption);
                        } else {
                            requestAnimationFrame(animateEruption);
                        }
                    };
                    animateEruption();
                }, i * 60);
            }
            
            const animateVolcano = () => {
                volcano.life--;
                volcano.alpha = volcano.life / 300;
                
                if (volcano.life <= 0) {
                    if (volcano.parent) volcano.parent.removeChild(volcano);
                } else {
                    requestAnimationFrame(animateVolcano);
                }
            };
            animateVolcano();
        }
    }

    // Clean up smoke particles when ant is removed
    destroy() {
        // Clean up remaining smoke particles
        for (const particle of this.smokeParticles) {
            if (particle.parent) {
                particle.parent.removeChild(particle);
            }
        }
        this.smokeParticles = [];
        
        // Call parent cleanup if it exists
        if (super.destroy) {
            super.destroy();
        }
    }
};
