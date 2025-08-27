// src/entities/throwing/BananaThrowingAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Throwing === 'undefined') IdleAnts.Entities.Throwing = {};

// Banana Throwing Ant - hurls explosive bananas at distant enemies
IdleAnts.Entities.Throwing.BananaThrowingAnt = class extends IdleAnts.Entities.Throwing.ThrowingAntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Get ant type configuration
        const antType = IdleAnts.Data.AntTypes.BANANA_THROWING_ANT;
        
        // Defensive check for missing ant type data
        if (!antType) {
            console.error('BananaThrowingAnt: Unable to find BANANA_THROWING_ANT configuration in IdleAnts.Data.AntTypes');
        }
        
        // Banana throwing ants have normal speed but long range
        super(texture, nestPosition, speedMultiplier, 1.0, antType || {
            color: 0xFFFF00,
            glowColor: 0xFFFACD,
            damage: 550,
            hp: 5,
            range: 150,
            projectile: 'banana'
        });
        
        // Banana-specific properties
        this.bananaExplosionRadius = 35;
        this.bananasThrown = 0;
    }
    
    // Override to create banana-specific body
    createBody() {
        const body = new PIXI.Graphics();
        
        // Bright yellow banana ant body
        const color = (this.antType && this.antType.color) || 0xFFFF00;
        body.beginFill(color);
        
        // Abdomen - banana shaped
        body.drawEllipse(0, 8, 7, 12);
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
        body.lineStyle(1.5, 0x2A1B10);
        body.moveTo(-2, -12);
        body.lineTo(-4, -16);
        body.moveTo(2, -12);
        body.lineTo(4, -16);
        
        // Banana storage sacks
        body.beginFill(0xFFD700, 0.7);
        body.drawEllipse(-6, 4, 3, 5);
        body.drawEllipse(6, 4, 3, 5);
        body.endFill();
        
        // Banana peels as decorative elements
        // Removed decorative peel ellipses near legs to avoid visual overlap
        
        this.addChild(body);
    }
    
    // Minimal, self-cleaning banana projectile (visual + damage on hit)
    createProjectile(target, dx, dy, distance) {
        if (!IdleAnts.app || !target) return;

        const angle = Math.atan2(dy, dx);
        // Use shared archer kinematics for consistent feel
        const kin = (typeof this.computeShotKinematics === 'function')
            ? this.computeShotKinematics(distance)
            : { speed: 10, gravity: 0.18, loft: 1.2, life: Math.max(30, Math.ceil(distance / 10) + 30) };

        // Small banana shape (crescent-like), clear and readable
        const banana = new PIXI.Graphics();
        const yellow = (this.antType && this.antType.color) || 0xFFFF00;
        banana.lineStyle(2.5, 0x2A1B10, 1.0);
        banana.beginFill(yellow, 1.0);
        banana.drawEllipse(0, 0, 5.0, 12.0);
        banana.endFill();
        // Inner shading to suggest curvature
        banana.beginFill(0xE6C200, 0.98);
        banana.drawEllipse(-1.6, 1.1, 3.6, 9.8);
        banana.endFill();
        // Stem tip
        banana.beginFill(0x8B4513, 1.0);
        banana.drawCircle(0, -10.0, 1.5);
        banana.endFill();
        // Soft shadow for readability
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.3);
        shadow.drawEllipse(0, 0, 5.8, 13.5);
        shadow.endFill();
        shadow.alpha = 0.3;
        shadow.rotation = 0;
        shadow.x = 2; shadow.y = 2;
        
        const container = new PIXI.Container();
        container.addChild(shadow);
        container.addChild(banana);
        container.rotation = angle + Math.PI / 2;
        container.x = this.x; container.y = this.y;
        container.vx = Math.cos(angle) * kin.speed;
        // Add distance-based loft so arc is obvious
        container.vy = Math.sin(angle) * kin.speed - kin.loft;
        // Lifetime proportional to travel distance (plus linger later)
        container.life = Math.max(30, Math.min(300, kin.life));

        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(container);
        } else {
            IdleAnts.app.stage.addChild(container);
        }

        container.landed = false; // track landing/lingering state
        container.damaged = false; // ensure damage applies once

        const LINGER_FRAMES = 70; // ~1.17s at 60fps
        let trailTick = 0;
        
        // Brief muzzle flash for visibility
        if (IdleAnts.app.worldContainer) {
            const flash = new PIXI.Graphics();
            flash.beginFill(yellow, 0.8); flash.drawCircle(0, 0, 6); flash.endFill();
            flash.x = container.x; flash.y = container.y;
            IdleAnts.app.worldContainer.addChild(flash);
            let f = 8; const fadeF = () => { f--; flash.alpha = f / 8; if (f<=0) { if (flash.parent) flash.parent.removeChild(flash);} else { requestAnimationFrame(fadeF);} }; fadeF();
        }

        const animate = () => {
            if (!container.landed) {
                // Flight phase
                container.x += container.vx;
                container.y += container.vy;
                container.vy += kin.gravity; // gentle gravity for longer reach
                // Point banana along velocity vector (no continuous spin)
                container.rotation = Math.atan2(container.vy, container.vx) + Math.PI / 2;
                container.life--;

                // Add a small quick-fading trail for visibility
                if ((trailTick++ % 3) === 0 && IdleAnts.app && IdleAnts.app.worldContainer) {
                    const puff = new PIXI.Graphics();
                    puff.beginFill(yellow, 0.5);
                    puff.drawCircle(0, 0, 2.5);
                    puff.endFill();
                    puff.x = container.x; puff.y = container.y;
                    let life = 12; IdleAnts.app.worldContainer.addChild(puff);
                    const fade = () => {
                        life--; puff.alpha = life / 12; puff.scale.set(1 + (1 - life / 12) * 0.5);
                        if (life <= 0) { if (puff.parent) puff.parent.removeChild(puff); } else { requestAnimationFrame(fade); }
                    };
                    fade();
                }

                // Hit proximity check
                const dxh = (target.x - container.x);
                const dyh = (target.y - container.y);
                const hit = (dxh*dxh + dyh*dyh) <= 14*14;
                if (hit && typeof target.takeDamage === 'function' && !container.damaged) {
                    target.takeDamage(this.attackDamage);
                    container.damaged = true;
                }

                if (container.life <= 0 || hit) {
                    // Transition to linger phase
                    container.landed = true;
                    container.life = LINGER_FRAMES;
                    container.vx = 0; container.vy = 0;
                    // Slight squash for a grounded look
                    container.scale.set(1.0, 0.9);
                }
            } else {
                // Linger phase: fade out where it landed
                container.life--;
                container.alpha = container.life / LINGER_FRAMES;
            }

            if (container.life <= 0) {
                if (container.parent) container.parent.removeChild(container);
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();

        this.bananasThrown++;
        this.createThrowingEffect();
        return container;
    }
    
    createThrowingEffect() {
        // Create visual effect showing banana being thrown
        const throwEffect = new PIXI.Graphics();
        throwEffect.beginFill(((this.antType && this.antType.color) || 0xFFFF00), 0.8);
        throwEffect.drawEllipse(0, 0, 3, 6);
        throwEffect.endFill();
        
        throwEffect.x = this.x;
        throwEffect.y = this.y - 5;
        throwEffect.rotation = this.aimDirection;
        
        // Animate throw
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(throwEffect);
            
            let life = 10;
            const animateThrow = () => {
                throwEffect.x += Math.cos(this.aimDirection) * 4;
                throwEffect.y += Math.sin(this.aimDirection) * 4;
                throwEffect.rotation += 0.3;
                life--;
                throwEffect.alpha = life / 10;
                
                if (life <= 0) {
                    if (throwEffect.parent) {
                        throwEffect.parent.removeChild(throwEffect);
                    }
                } else {
                    requestAnimationFrame(animateThrow);
                }
            };
            animateThrow();
        }
    }
    
    // Override to add banana-specific visual feedback
    updateThrowingAnimation() {
        super.updateThrowingAnimation();
        
        if (this.isThrowingAnimation) {
            // Add banana glow during throw
            this.tint = 0xFFFF80; // Slightly brighter yellow
        } else {
            this.tint = (this.antType && this.antType.color) || 0xFFFF00;
        }
    }

    // Use base attack timing/aiming (projectile still custom via createProjectile)
    
    // Keep it tidy: no random spawns; just legs + subtle glow
    performAnimation() {
        // Use standardized throwing-ant leg animation
        super.animateLegs();
        this.updateBananaGlow();
    }
    
    // Use base leg animation for consistency

    createBananaScent() {
        // Enhanced banana aroma particles
        if (Math.random() < 0.2 && IdleAnts.app) {
            const scent = new PIXI.Graphics();
            scent.beginFill(0xFFFF99, 0.6);
            scent.drawCircle(0, 0, 1 + Math.random() * 2);
            scent.endFill();
            
            scent.x = this.x + (Math.random() - 0.5) * 12;
            scent.y = this.y + (Math.random() - 0.5) * 8;
            scent.vy = -0.5 - Math.random() * 0.3;
            scent.vx = (Math.random() - 0.5) * 0.5;
            scent.life = 25 + Math.random() * 10;
            scent.initialLife = scent.life;
            
            if (IdleAnts.app.worldContainer) {
                IdleAnts.app.worldContainer.addChild(scent);
            } else if (IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(scent);
            }
            
            const animateScent = () => {
                scent.x += scent.vx;
                scent.y += scent.vy;
                scent.life--;
                scent.alpha = (scent.life / scent.initialLife) * 0.6;
                scent.scale.set(1 + (1 - scent.life / scent.initialLife) * 0.8);
                
                if (scent.life <= 0) {
                    if (scent.parent) {
                        scent.parent.removeChild(scent);
                    }
                } else {
                    requestAnimationFrame(animateScent);
                }
            };
            animateScent();
        }
    }

    animateBananaStorage() {
        // Animate the banana storage sacks pulsing as they "refill"
        const time = Date.now() * 0.006;
        const pulse = Math.sin(time + this.bananasThrown * 0.1) * 0.15 + 0.85;
        
        // Scale animation based on how many bananas have been thrown
        const storageScale = pulse * (1 - (this.bananasThrown % 5) * 0.05);
        this.scale.set(this.getBaseScale() * storageScale);
    }

    createBananaPeels() {
        // Occasionally drop banana peels while moving
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0.5 && Math.random() < 0.05 && IdleAnts.app) {
            const peel = new PIXI.Graphics();
            
            // Create banana peel shape
            peel.beginFill(0xFFFF00, 0.9);
            peel.drawEllipse(0, 0, 3, 1.5);
            peel.endFill();
            
            // Add peel segments
            peel.beginFill(0xFFD700, 0.8);
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                const x = Math.cos(angle) * 2;
                const y = Math.sin(angle) * 1;
                peel.drawEllipse(x, y, 1, 2);
            }
            peel.endFill();
            
            peel.x = this.x + (Math.random() - 0.5) * 6;
            peel.y = this.y + (Math.random() - 0.5) * 6;
            peel.rotation = Math.random() * Math.PI * 2;
            peel.life = 60 + Math.random() * 30;
            peel.initialLife = peel.life;
            peel.rotationSpeed = (Math.random() - 0.5) * 0.1;
            
            if (IdleAnts.app.worldContainer) {
                IdleAnts.app.worldContainer.addChild(peel);
            } else if (IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(peel);
            }
            
            const animatePeel = () => {
                peel.rotation += peel.rotationSpeed;
                peel.life--;
                peel.alpha = Math.min(0.9, peel.life / peel.initialLife);
                
                // Fade out over last 20 frames
                if (peel.life < 20) {
                    peel.alpha = (peel.life / 20) * 0.9;
                }
                
                if (peel.life <= 0) {
                    if (peel.parent) {
                        peel.parent.removeChild(peel);
                    }
                } else {
                    requestAnimationFrame(animatePeel);
                }
            };
            animatePeel();
        }
    }

    updateBananaGlow() {
        // Banana-themed glow effect
        const time = Date.now() * 0.007;
        const glow = Math.sin(time) * 0.2 + 0.8;
        
        // Create yellow glow that pulses
        const yellow = Math.floor(255 * glow);
        const red = Math.floor(255 * glow * 0.9);
        this.tint = (red << 16) | (yellow << 8) | 0x00; // Yellow with slight orange tint
    }

    createBananaExplosion() {
        // MASSIVE BANANA EXPLOSIONS!
        if (Math.random() < 0.008 && IdleAnts.app && IdleAnts.app.stage) {
            for (let i = 0; i < 25; i++) {
                const banana = new PIXI.Graphics();
                banana.beginFill(0xFFFF00, 0.9);
                banana.drawEllipse(0, 0, 4 + Math.random() * 8, 12 + Math.random() * 8);
                banana.endFill();
                
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 8;
                banana.x = this.x;
                banana.y = this.y;
                banana.vx = Math.cos(angle) * speed;
                banana.vy = Math.sin(angle) * speed;
                banana.life = 45;
                banana.spin = (Math.random() - 0.5) * 0.4;
                
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(banana);
        } else if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(banana);
        }
                
                const animateBanana = () => {
                    banana.x += banana.vx;
                    banana.y += banana.vy;
                    banana.rotation += banana.spin;
                    banana.life--;
                    banana.alpha = banana.life / 45;
                    
                    if (banana.life <= 0) {
                        if (banana.parent) banana.parent.removeChild(banana);
                    } else {
                        requestAnimationFrame(animateBanana);
                    }
                };
                animateBanana();
            }
        }
    }

    createBananaCannon() {
        // BANANA CANNON SHOTS!
        if (Math.random() < 0.015 && IdleAnts.app && IdleAnts.app.stage) {
            const cannon = new PIXI.Graphics();
            cannon.beginFill(0x8B4513); // Brown cannon
            cannon.drawRect(-15, -3, 30, 6);
            cannon.endFill();
            cannon.beginFill(0x654321);
            cannon.drawCircle(-15, 0, 8);
            cannon.endFill();
            
            cannon.x = this.x;
            cannon.y = this.y - 10;
            cannon.life = 60;
            
            IdleAnts.app.stage.addChild(cannon);
            
            // Fire bananas from cannon
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const shot = new PIXI.Graphics();
                    shot.beginFill(0xFFFF00);
                    shot.drawEllipse(0, 0, 3, 8);
                    shot.endFill();
                    
                    shot.x = this.x + 30;
                    shot.y = this.y - 10;
                    shot.vx = 12 + Math.random() * 4;
                    shot.vy = (Math.random() - 0.5) * 6;
                    shot.life = 30;
                    
                    IdleAnts.app.stage.addChild(shot);
                    
                    const animateShot = () => {
                        shot.x += shot.vx;
                        shot.y += shot.vy;
                        shot.rotation += 0.3;
                        shot.life--;
                        shot.alpha = shot.life / 30;
                        
                        if (shot.life <= 0) {
                            if (shot.parent) shot.parent.removeChild(shot);
                        } else {
                            requestAnimationFrame(animateShot);
                        }
                    };
                    animateShot();
                }, i * 100);
            }
            
            const animateCannon = () => {
                cannon.life--;
                cannon.alpha = cannon.life / 60;
                
                if (cannon.life <= 0) {
                    if (cannon.parent) cannon.parent.removeChild(cannon);
                } else {
                    requestAnimationFrame(animateCannon);
                }
            };
            animateCannon();
        }
    }

    createBananaRain() {
        // BANANA RAIN FROM THE SKY!
        if (Math.random() < 0.005 && IdleAnts.app && IdleAnts.app.stage) {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const rainBanana = new PIXI.Graphics();
                    rainBanana.beginFill(0xFFFF00);
                    rainBanana.drawEllipse(0, 0, 3, 10);
                    rainBanana.endFill();
                    
                    rainBanana.x = this.x + (Math.random() - 0.5) * 200;
                    rainBanana.y = this.y - 100 - Math.random() * 50;
                    rainBanana.vy = 3 + Math.random() * 2;
                    rainBanana.vx = (Math.random() - 0.5) * 2;
                    rainBanana.life = 100;
                    rainBanana.spin = (Math.random() - 0.5) * 0.2;
                    
                    IdleAnts.app.stage.addChild(rainBanana);
                    
                    const animateRain = () => {
                        rainBanana.x += rainBanana.vx;
                        rainBanana.y += rainBanana.vy;
                        rainBanana.rotation += rainBanana.spin;
                        rainBanana.life--;
                        
                        if (rainBanana.life <= 0 || rainBanana.y > this.y + 100) {
                            if (rainBanana.parent) rainBanana.parent.removeChild(rainBanana);
                        } else {
                            requestAnimationFrame(animateRain);
                        }
                    };
                    animateRain();
                }, i * 50);
            }
        }
    }

    createBananaVortex() {
        // SPINNING BANANA VORTEX!
        if (Math.random() < 0.003 && IdleAnts.app && IdleAnts.app.stage) {
            for (let i = 0; i < 12; i++) {
                const vortexBanana = new PIXI.Graphics();
                vortexBanana.beginFill(0xFFFF00);
                vortexBanana.drawEllipse(0, 0, 2, 8);
                vortexBanana.endFill();
                
                const radius = 30 + i * 5;
                const angle = (i / 12) * Math.PI * 2;
                vortexBanana.x = this.x + Math.cos(angle) * radius;
                vortexBanana.y = this.y + Math.sin(angle) * radius;
                vortexBanana.life = 120;
                vortexBanana.baseAngle = angle;
                vortexBanana.baseRadius = radius;
                
                IdleAnts.app.stage.addChild(vortexBanana);
                
                const animateVortex = () => {
                    vortexBanana.life--;
                    vortexBanana.baseAngle += 0.15;
                    vortexBanana.x = this.x + Math.cos(vortexBanana.baseAngle) * vortexBanana.baseRadius;
                    vortexBanana.y = this.y + Math.sin(vortexBanana.baseAngle) * vortexBanana.baseRadius;
                    vortexBanana.rotation += 0.2;
                    vortexBanana.alpha = vortexBanana.life / 120;
                    
                    if (vortexBanana.life <= 0) {
                        if (vortexBanana.parent) vortexBanana.parent.removeChild(vortexBanana);
                    } else {
                        requestAnimationFrame(animateVortex);
                    }
                };
                animateVortex();
            }
        }
    }

    createBananaSplit() {
        // BANANA SPLIT DESSERT!
        if (Math.random() < 0.008 && IdleAnts.app && IdleAnts.app.stage) {
            const split = new PIXI.Graphics();
            
            // Bowl
            split.beginFill(0xFFFFFF);
            split.drawEllipse(0, 0, 20, 8);
            split.endFill();
            
            // Bananas
            split.beginFill(0xFFFF00);
            split.drawEllipse(-8, -3, 3, 12);
            split.drawEllipse(8, -3, 3, 12);
            split.endFill();
            
            // Ice cream scoops
            split.beginFill(0xFFB6C1); // Pink
            split.drawCircle(-5, -8, 4);
            split.beginFill(0xF5DEB3); // Vanilla
            split.drawCircle(0, -10, 4);
            split.beginFill(0x8B4513); // Chocolate
            split.drawCircle(5, -8, 4);
            split.endFill();
            
            // Cherry on top
            split.beginFill(0xFF0000);
            split.drawCircle(0, -14, 2);
            split.endFill();
            
            split.x = this.x + (Math.random() - 0.5) * 40;
            split.y = this.y + 20;
            split.life = 180;
            
            IdleAnts.app.stage.addChild(split);
            
            const animateSplit = () => {
                split.life--;
                split.alpha = split.life / 180;
                split.scale.set(1 + Math.sin(Date.now() * 0.01) * 0.1);
                
                if (split.life <= 0) {
                    if (split.parent) split.parent.removeChild(split);
                } else {
                    requestAnimationFrame(animateSplit);
                }
            };
            animateSplit();
        }
    }

    createBananaWords() {
        // FLOATING BANANA WORDS!
        if (Math.random() < 0.012 && IdleAnts.app && IdleAnts.app.stage) {
            const words = ["BANANA!", "YELLOW!", "POTASSIUM!", "SPLIT!", "PEEL!", "BUNCH!"];
            const word = words[Math.floor(Math.random() * words.length)];
            
            const text = new PIXI.Graphics();
            text.beginFill(0xFFFF00);
            
            // Create letter blocks
            for (let i = 0; i < word.length; i++) {
                const x = i * 10;
                text.drawRect(x, 0, 8, 15);
                if (Math.random() < 0.7) text.drawRect(x, 7, 8, 3);
                if (Math.random() < 0.5) text.drawRect(x + 2, 0, 4, 15);
            }
            text.endFill();
            
            text.x = this.x - word.length * 5;
            text.y = this.y - 30;
            text.vy = -1.5;
            text.life = 80;
            text.scale.set(0.5);
            
            IdleAnts.app.stage.addChild(text);
            
            const animateText = () => {
                text.y += text.vy;
                text.life--;
                text.alpha = text.life / 80;
                text.rotation += 0.02;
                
                if (text.life <= 0) {
                    if (text.parent) text.parent.removeChild(text);
                } else {
                    requestAnimationFrame(animateText);
                }
            };
            animateText();
        }
    }

    createBananaMonkey() {
        // BANANA MONKEY FRIEND!
        if (Math.random() < 0.002 && IdleAnts.app && IdleAnts.app.stage) {
            const monkey = new PIXI.Graphics();
            
            // Monkey body
            monkey.beginFill(0x8B4513);
            monkey.drawCircle(0, 0, 8);
            monkey.endFill();
            
            // Monkey head
            monkey.beginFill(0xD2691E);
            monkey.drawCircle(0, -12, 6);
            monkey.endFill();
            
            // Eyes
            monkey.beginFill(0x000000);
            monkey.drawCircle(-2, -13, 1);
            monkey.drawCircle(2, -13, 1);
            monkey.endFill();
            
            // Banana in hand
            monkey.beginFill(0xFFFF00);
            monkey.drawEllipse(8, -5, 2, 6);
            monkey.endFill();
            
            monkey.x = this.x + 40;
            monkey.y = this.y;
            monkey.life = 200;
            monkey.jumpPhase = 0;
            
            IdleAnts.app.stage.addChild(monkey);
            
            const animateMonkey = () => {
                monkey.life--;
                monkey.jumpPhase += 0.3;
                monkey.y = this.y + Math.sin(monkey.jumpPhase) * 8;
                monkey.rotation = Math.sin(monkey.jumpPhase * 0.5) * 0.2;
                monkey.alpha = monkey.life / 200;
                
                if (monkey.life <= 0) {
                    if (monkey.parent) monkey.parent.removeChild(monkey);
                } else {
                    requestAnimationFrame(animateMonkey);
                }
            };
            animateMonkey();
        }
    }

    createBananaDanceParty() {
        // BANANA DANCE PARTY!
        if (Math.random() < 0.001 && IdleAnts.app && IdleAnts.app.stage) {
            for (let i = 0; i < 6; i++) {
                const dancer = new PIXI.Graphics();
                dancer.beginFill(0xFFFF00);
                dancer.drawEllipse(0, 0, 4, 12);
                dancer.endFill();
                
                // Dance partner
                dancer.beginFill(0xFFD700);
                dancer.drawEllipse(0, -8, 3, 6);
                dancer.endFill();
                
                const angle = (i / 6) * Math.PI * 2;
                const radius = 25;
                dancer.x = this.x + Math.cos(angle) * radius;
                dancer.y = this.y + Math.sin(angle) * radius;
                dancer.life = 150;
                dancer.dancePhase = i * Math.PI / 3;
                
                IdleAnts.app.stage.addChild(dancer);
                
                const animateDancer = () => {
                    dancer.life--;
                    dancer.dancePhase += 0.4;
                    dancer.scale.set(1 + Math.sin(dancer.dancePhase) * 0.3);
                    dancer.rotation = Math.sin(dancer.dancePhase * 2) * 0.5;
                    dancer.alpha = dancer.life / 150;
                    
                    if (dancer.life <= 0) {
                        if (dancer.parent) dancer.parent.removeChild(dancer);
                    } else {
                        requestAnimationFrame(animateDancer);
                    }
                };
                animateDancer();
            }
        }
    }

    createBananaLauncher() {
        // MEGA BANANA LAUNCHER!
        if (Math.random() < 0.004 && IdleAnts.app && IdleAnts.app.stage) {
            const launcher = new PIXI.Graphics();
            
            // Launcher base
            launcher.beginFill(0x666666);
            launcher.drawRect(-12, 0, 24, 8);
            launcher.endFill();
            
            // Launcher barrel
            launcher.beginFill(0x888888);
            launcher.drawRect(-2, -20, 4, 20);
            launcher.endFill();
            
            launcher.x = this.x;
            launcher.y = this.y + 15;
            launcher.life = 80;
            
            IdleAnts.app.stage.addChild(launcher);
            
            // Launch multiple bananas
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const projectile = new PIXI.Graphics();
                    projectile.beginFill(0xFFFF00);
                    projectile.drawEllipse(0, 0, 3, 8);
                    projectile.endFill();
                    
                    projectile.x = this.x;
                    projectile.y = this.y;
                    const angle = -Math.PI/2 + (Math.random() - 0.5) * 0.8;
                    const speed = 8 + Math.random() * 4;
                    projectile.vx = Math.cos(angle) * speed;
                    projectile.vy = Math.sin(angle) * speed;
                    projectile.gravity = 0.2;
                    projectile.life = 60;
                    
                    IdleAnts.app.stage.addChild(projectile);
                    
                    const animateProjectile = () => {
                        projectile.x += projectile.vx;
                        projectile.y += projectile.vy;
                        projectile.vy += projectile.gravity;
                        projectile.rotation += 0.3;
                        projectile.life--;
                        
                        if (projectile.life <= 0) {
                            if (projectile.parent) projectile.parent.removeChild(projectile);
                        } else {
                            requestAnimationFrame(animateProjectile);
                        }
                    };
                    animateProjectile();
                }, i * 80);
            }
            
            const animateLauncher = () => {
                launcher.life--;
                launcher.alpha = launcher.life / 80;
                
                if (launcher.life <= 0) {
                    if (launcher.parent) launcher.parent.removeChild(launcher);
                } else {
                    requestAnimationFrame(animateLauncher);
                }
            };
            animateLauncher();
        }
    }
};
