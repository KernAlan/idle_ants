// src/entities/throwing/JuiceAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Throwing === 'undefined') IdleAnts.Entities.Throwing = {};

// Juice Ant - splashes enemies with sticky fruit juice
IdleAnts.Entities.Throwing.JuiceAnt = class extends IdleAnts.Entities.Throwing.ThrowingAntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Get ant type configuration
        const antType = IdleAnts.Data.AntTypes.JUICE_ANT;
        
        // Defensive check for missing ant type data
        if (!antType) {
            console.error('JuiceAnt: Unable to find JUICE_ANT configuration in IdleAnts.Data.AntTypes');
        }
        
        // Juice ants are slightly faster than banana throwers
        super(texture, nestPosition, speedMultiplier, 1.2, antType || {
            color: 0xFF4500,
            glowColor: 0xFFA500,
            damage: 555,
            hp: 5,
            range: 120,
            projectile: 'juice'
        });
        
        // Juice-specific properties
        this.juiceSplashRadius = 25;
        this.juiceStickiness = 0.6; // Slows enemies
        this.juiceColors = [0xFF4500, 0xFF8C00, 0xFFA500, 0xFFD700]; // Orange spectrum
        this.currentJuiceColor = this.juiceColors[0];
        this.juiceReserves = 100;
        this.maxJuiceReserves = 100;
    }
    
    // Override to create juice-specific body
    createBody() {
        const body = new PIXI.Graphics();
        
        // Orange juice ant body (fallback if antType not set yet)
        const color = (this.antType && this.antType.color) || 0xFF4500;
        body.beginFill(color);
        
        // Rounded abdomen for juice storage
        body.drawCircle(0, 8, 8);
        body.endFill();
        
        // Thorax
        body.beginFill(color);
        body.drawEllipse(0, 0, 6, 8);
        body.endFill();
        
        // Head
        body.beginFill(color);
        body.drawEllipse(0, -8, 5, 6);
        body.endFill();
        
        // Juice dispensing nozzle (proboscis)
        body.beginFill(0xFFD700, 0.8);
        body.drawEllipse(0, -12, 2, 4);
        body.endFill();
        
        // Antennae
        body.lineStyle(1.5, 0x2A1B10);
        body.moveTo(-2, -12);
        body.lineTo(-4, -16);
        body.moveTo(2, -12);
        body.lineTo(4, -16);
        
        // Juice storage tanks
        const juiceLevel = this.juiceReserves / this.maxJuiceReserves;
        const colors = this.juiceColors || [0xFF4500, 0xFF8C00, 0xFFA500, 0xFFD700];
        for (let i = 0; i < 3; i++) {
            const tankColor = colors[i % colors.length];
            body.beginFill(tankColor, 0.7 * juiceLevel);
            body.drawCircle(-4 + (i * 4), 8, 2.5);
            body.endFill();
        }
        
        // Juice level indicator
        body.lineStyle(1, 0x8B4513);
        const indicatorHeight = juiceLevel * 8;
        body.moveTo(-8, 12);
        body.lineTo(-8, 12 - indicatorHeight);
        
        this.addChild(body);
    }
    
    // Use standard ant animation instead of custom behavior
    // performAnimation() {
    //     super.performAnimation();
    //     this.refillJuice();
    //     this.cycleJuiceColors();
    //     this.createJuiceDrips();
    // }
    
    refillJuice() {
        // Gradually refill juice reserves
        if (this.juiceReserves < this.maxJuiceReserves) {
            this.juiceReserves += 0.2;
            
            // Update body visuals when reserves change
            if (Math.floor(this.juiceReserves) % 10 === 0) {
                this.updateJuiceTanks();
            }
        }
    }
    
    updateJuiceTanks() {
        // This would update the visual juice levels in the tanks
        // For now, we'll recreate the body periodically
        if (Math.random() < 0.01) {
            this.removeChild(this.children[0]); // Remove old body
            this.createBody();
        }
    }
    
    cycleJuiceColors() {
        // Slowly cycle through different juice colors
        const colorIndex = Math.floor(Date.now() / 2000) % this.juiceColors.length;
        this.currentJuiceColor = this.juiceColors[colorIndex];
    }
    
    createJuiceDrips() {
        // Occasionally drip juice
        if (Math.random() < 0.03 && this.juiceReserves > 10) {
            this.createJuiceDrip();
        }
    }
    
    createJuiceDrip() {
        const drip = new PIXI.Graphics();
        drip.beginFill(this.currentJuiceColor, 0.8);
        drip.drawCircle(0, 0, 1.5);
        drip.endFill();
        
        drip.x = this.x + (Math.random() - 0.5) * 6;
        drip.y = this.y + 8;
        drip.vy = 1 + Math.random();
        drip.life = 30;
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(drip);
            
            const animateDrip = () => {
                drip.y += drip.vy;
                drip.life--;
                drip.alpha = drip.life / 30;
                
                if (drip.life <= 0) {
                    if (drip.parent) {
                        drip.parent.removeChild(drip);
                    }
                } else {
                    requestAnimationFrame(animateDrip);
                }
            };
            animateDrip();
        }
    }
    
    // Override to create juice projectile
    createProjectile(target, dx, dy, distance) {
        if (!IdleAnts.app || !IdleAnts.app.effectManager || this.juiceReserves < 10) return;
        
        // Consume juice reserves
        this.juiceReserves -= 10;
        
        // Calculate projectile trajectory
        const angle = Math.atan2(dy, dx);
        const speed = 7;
        
        // Create juice splash projectile
        const projectile = IdleAnts.app.effectManager.createEffect(
            'juiceSplash',
            this.x,
            this.y,
            this.currentJuiceColor,
            1.2,
            {
                target: target,
                damage: this.attackDamage,
                speed: speed,
                angle: angle,
                distance: distance,
                splashRadius: this.juiceSplashRadius,
                stickiness: this.juiceStickiness,
                juiceColor: this.currentJuiceColor,
                thrower: this
            }
        );
        
        // Create throwing animation
        this.createJuiceThrowEffect();
        
        return projectile;
    }
    
    createJuiceThrowEffect() {
        // Create visual stream of juice being thrown
        const stream = new PIXI.Graphics();
        stream.lineStyle(3, this.currentJuiceColor, 0.8);
        
        // Create juice stream arc
        const streamLength = 20;
        for (let i = 0; i <= 10; i++) {
            const progress = i / 10;
            const x = Math.cos(this.aimDirection) * streamLength * progress;
            const y = Math.sin(this.aimDirection) * streamLength * progress - (progress * progress * 5);
            
            if (i === 0) {
                stream.moveTo(x, y);
            } else {
                stream.lineTo(x, y);
            }
        }
        
        stream.x = this.x;
        stream.y = this.y - 5;
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(stream);
            
            let life = 15;
            const animateStream = () => {
                life--;
                stream.alpha = life / 15;
                
                if (life <= 0) {
                    if (stream.parent) {
                        stream.parent.removeChild(stream);
                    }
                } else {
                    requestAnimationFrame(animateStream);
                }
            };
            animateStream();
        }
    }
    
    // Override to show juice level in combat
    updateThrowingAnimation() {
        super.updateThrowingAnimation();
        
        if (this.isThrowingAnimation) {
            // Show juice dispensing effect
            this.tint = 0xFFB347; // Peach color
        } else {
            this.tint = (this.antType && this.antType.color) || 0xFF4500;
        }
        
        // Change color based on juice reserves
        const reservePercent = this.juiceReserves / this.maxJuiceReserves;
        if (reservePercent < 0.3) {
            this.tint = 0xDEB887; // Tan when low on juice
        }
    }
    
    // Override to prevent attacking when out of juice
    attemptAttack() {
        if (this.juiceReserves < 10) {
            // Not enough juice to attack
            this.isAiming = false;
            return;
        }
        
        super.attemptAttack();
    }
    
    // Add juice splash effect on successful hit
    onProjectileHit(target, projectileData) {
        if (!target || !projectileData) return;
        
        // Create juice splash effect at target
        this.createJuiceSplashEffect(target, projectileData);
        
        // Apply stickiness effect to target
        this.applyJuiceStickinessEffect(target);
    }
    
    createJuiceSplashEffect(target, projectileData) {
        // Create juice splash particles
        for (let i = 0; i < 12; i++) {
            const splash = new PIXI.Graphics();
            splash.beginFill(projectileData.juiceColor, 0.7);
            splash.drawCircle(0, 0, 1 + Math.random() * 2);
            splash.endFill();
            
            splash.x = target.x;
            splash.y = target.y;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            splash.vx = Math.cos(angle) * speed;
            splash.vy = Math.sin(angle) * speed;
            splash.life = 20 + Math.random() * 15;
            splash.maxLife = splash.life;
            
            if (IdleAnts.app && IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(splash);
                
                const animateSplash = () => {
                    splash.x += splash.vx;
                    splash.y += splash.vy;
                    splash.vx *= 0.95;
                    splash.vy *= 0.95;
                    splash.life--;
                    splash.alpha = splash.life / splash.maxLife;
                    
                    if (splash.life <= 0) {
                        if (splash.parent) {
                            splash.parent.removeChild(splash);
                        }
                    } else {
                        requestAnimationFrame(animateSplash);
                    }
                };
                animateSplash();
            }
        }
    }
    
    applyJuiceStickinessEffect(target) {
        // Make target sticky (reduce movement speed)
        if (target.speed !== undefined) {
            target.originalSpeed = target.originalSpeed || target.speed;
            target.speed *= (1 - this.juiceStickiness);
            
            // Create sticky visual effect
            target.tint = (target.tint || 0xFFFFFF) * 0.8 + this.currentJuiceColor * 0.2;
            
            // Remove stickiness after duration
            setTimeout(() => {
                if (target.originalSpeed !== undefined) {
                    target.speed = target.originalSpeed;
                    target.tint = 0xFFFFFF;
                }
            }, 3000); // 3 seconds of stickiness
        }
    }
};
