// src/entities/RainbowAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// Rainbow Ant - colorful ant that leaves a beautiful rainbow trail
IdleAnts.Entities.RainbowAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Rainbow ants are slightly faster
        super(texture, nestPosition, speedMultiplier, 1.2);
        
        // Get ant type configuration
        this.antType = IdleAnts.Data.AntTypes.RAINBOW_ANT;
        
        // Defensive check for missing ant type data
        if (!this.antType) {
            console.error('RainbowAnt: Unable to find RAINBOW_ANT configuration in IdleAnts.Data.AntTypes');
            // Provide fallback values
            this.antType = {
                color: 0xFF69B4,
                glowColor: 0xFFB6C1,
                damage: 49,
                hp: 200,
                effect: 'rainbowTrail'
            };
        }
        
        // Apply properties from ant type (color will be overridden)
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        
        // Rainbow color cycling properties
        this.colorCounter = Math.random() * Math.PI * 2; // Random start phase
        this.colorCycleSpeed = 0.1;
        this.rainbowColors = [
            0xFF0000, // Red
            0xFF8000, // Orange  
            0xFFFF00, // Yellow
            0x00FF00, // Green
            0x0080FF, // Blue
            0x8000FF, // Indigo
            0xFF00FF  // Violet
        ];
        this.currentColorIndex = 0;
        
        // Combat properties
        this.attackCooldown = 50; // frames (faster than normal)
        this._attackTimer = 0;
        
        // Rainbow trail properties
        this.trailPoints = [];
        this.maxTrailLength = 15;
        this.trailCreationCounter = 0;
        
        // Visual sparkle effects
        this.sparkleCounter = 0;
        this.sparkles = [];
        
        this.updateHealthBar();
    }
    
    // Override base scale - rainbow ants are slightly larger
    getBaseScale() {
        return 0.9 + Math.random() * 0.3;
    }
    
    // Create type-specific visual elements
    createTypeSpecificElements() {
        this.createBody();
        // Use standard leg creation from AntBase
        this.createRainbowGlow();
        this.createSparkleContainer();
    }
    
    createBody() {
        this.bodyGraphics = new PIXI.Graphics();
        this.updateBodyColor(); // Initial color
        this.addChild(this.bodyGraphics);
    }
    
    updateBodyColor() {
        if (!this.bodyGraphics) return;
        
        this.bodyGraphics.clear();
        
        // Get current rainbow color
        const currentColor = this.getCurrentRainbowColor() || 0xFF69B4;
        this.tint = currentColor;
        
        // Main body with current rainbow color
        this.bodyGraphics.beginFill(currentColor);
        
        // Abdomen
        this.bodyGraphics.drawEllipse(0, 8, 7, 10);
        this.bodyGraphics.endFill();
        
        // Thorax
        this.bodyGraphics.beginFill(currentColor);
        this.bodyGraphics.drawEllipse(0, 0, 6, 8);
        this.bodyGraphics.endFill();
        
        // Head
        this.bodyGraphics.beginFill(currentColor);
        this.bodyGraphics.drawEllipse(0, -8, 5, 6);
        this.bodyGraphics.endFill();
        
        // Antennae
        this.bodyGraphics.lineStyle(1, 0x2A1B10);
        this.bodyGraphics.moveTo(-2, -12);
        this.bodyGraphics.lineTo(-4, -16);
        this.bodyGraphics.moveTo(2, -12);
        this.bodyGraphics.lineTo(4, -16);
        
        // Rainbow stripes on abdomen
        const colors = this.rainbowColors || [0xFF0000, 0xFF8000, 0xFFFF00, 0x00FF00, 0x0080FF, 0x8000FF, 0xFF00FF];
        const colorIndex = this.currentColorIndex || 0;
        for (let i = 0; i < 3; i++) {
            const stripeColor = colors[(colorIndex + i + 1) % colors.length];
            this.bodyGraphics.beginFill(stripeColor, 0.6);
            this.bodyGraphics.drawEllipse(0, 6 + (i * 3), 5, 1.5);
            this.bodyGraphics.endFill();
        }
    }
    
    getCurrentRainbowColor() {
        // Ensure properties are initialized
        if (this.colorCounter === undefined) this.colorCounter = 0;
        if (this.colorCycleSpeed === undefined) this.colorCycleSpeed = 0.1;
        
        // Smoothly interpolate between rainbow colors
        this.colorCounter += this.colorCycleSpeed;
        
        // Ensure rainbowColors is available
        const colors = this.rainbowColors || [
            0xFF0000, // Red
            0xFF8000, // Orange  
            0xFFFF00, // Yellow
            0x00FF00, // Green
            0x0080FF, // Blue
            0x8000FF, // Indigo
            0xFF00FF  // Violet
        ];
        
        const colorIndex = Math.floor(this.colorCounter / (Math.PI / 3)) % colors.length;
        this.currentColorIndex = colorIndex;
        
        return colors[colorIndex];
    }
    
    // Removed custom leg creation - use standard AntBase legs
    
    createRainbowGlow() {
        // Multi-colored glow effect
        this.rainbowGlow = new PIXI.Container();
        
        // Create multiple glow rings with different colors
        const colors = this.rainbowColors || [0xFF0000, 0xFF8000, 0xFFFF00, 0x00FF00, 0x0080FF, 0x8000FF, 0xFF00FF];
        for (let i = 0; i < 3; i++) {
            const glowRing = new PIXI.Graphics();
            glowRing.beginFill(colors[i % colors.length], 0.2 - (i * 0.05));
            glowRing.drawCircle(0, 0, 12 + (i * 4));
            glowRing.endFill();
            
            this.rainbowGlow.addChild(glowRing);
        }
        
        // Add behind the ant
        this.addChildAt(this.rainbowGlow, 0);
    }
    
    createSparkleContainer() {
        this.sparkleContainer = new PIXI.Container();
        this.addChild(this.sparkleContainer);
    }
    
    // Use standard ant leg drawing - removed custom rainbow legs
    
    // Enhanced rainbow-themed animations
    performAnimation() {
        this.animateRainbowColors();
        this.animateLegs();
        this.animateRainbowGlow();
        this.createSparkles();
        this.updateRainbowTrail();
        this.createRainbowParticles();
        this.createPrismEffect();
    }
    
    animateRainbowColors() {
        // Update body color every few frames
        if (Math.floor(this.colorCounter * 10) % 2 === 0) {
            this.updateBodyColor();
        }
    }
    
    animateLegs() {
        if (!this.legs) return;
        
        this.legPhase += this.legAnimationSpeed;
        
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') {
                phase += Math.PI;
            }
            
            const legMovement = Math.sin(phase) * 2;
            
            // Update leg color
            this.drawLeg(leg);
            
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
    
    animateRainbowGlow() {
        if (!this.rainbowGlow) return;
        
        // Animate each glow ring with different colors and speeds
        for (let i = 0; i < this.rainbowGlow.children.length; i++) {
            const glowRing = this.rainbowGlow.children[i];
            const phase = this.colorCounter + (i * Math.PI / 2);
            const pulseFactor = 0.8 + Math.sin(phase) * 0.2;
            
            glowRing.scale.set(pulseFactor);
            glowRing.rotation += 0.02 + (i * 0.01);
            
            // Update glow color
            const colors = this.rainbowColors || [0xFF0000, 0xFF8000, 0xFFFF00, 0x00FF00, 0x0080FF, 0x8000FF, 0xFF00FF];
            const colorIndex = this.currentColorIndex || 0;
            const glowColor = colors[(colorIndex + i) % colors.length];
            glowRing.clear();
            glowRing.beginFill(glowColor, 0.2 - (i * 0.05));
            glowRing.drawCircle(0, 0, 12 + (i * 4));
            glowRing.endFill();
        }
    }
    
    createSparkles() {
        this.sparkleCounter++;
        
        // Create sparkles around the ant
        if (this.sparkleCounter % 10 === 0) {
            this.createSparkle();
        }
        
        // Update existing sparkles
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            const sparkle = this.sparkles[i];
            sparkle.alpha -= 0.05;
            sparkle.scale.x += 0.02;
            sparkle.scale.y += 0.02;
            
            if (sparkle.alpha <= 0) {
                this.sparkleContainer.removeChild(sparkle);
                this.sparkles.splice(i, 1);
            }
        }
    }
    
    createSparkle() {
        const sparkle = new PIXI.Graphics();
        const colors = this.rainbowColors || [0xFF0000, 0xFF8000, 0xFFFF00, 0x00FF00, 0x0080FF, 0x8000FF, 0xFF00FF];
        const sparkleColor = colors[Math.floor(Math.random() * colors.length)];
        
        sparkle.beginFill(sparkleColor);
        // Draw a simple diamond/star shape manually
        sparkle.moveTo(0, -3);
        sparkle.lineTo(2, 0);
        sparkle.lineTo(0, 3);
        sparkle.lineTo(-2, 0);
        sparkle.lineTo(0, -3);
        sparkle.endFill();
        
        // Random position around the ant
        sparkle.x = (Math.random() - 0.5) * 20;
        sparkle.y = (Math.random() - 0.5) * 20;
        sparkle.alpha = 1;
        sparkle.scale.set(0.5);
        
        this.sparkleContainer.addChild(sparkle);
        this.sparkles.push(sparkle);
    }
    
    updateRainbowTrail() {
        // Create rainbow trail points
        this.trailCreationCounter++;
        
        if (this.trailCreationCounter % 5 === 0) {
            // Add new trail point
            this.trailPoints.push({
                x: this.x,
                y: this.y,
                color: this.getCurrentRainbowColor(),
                life: 60 // frames to live
            });
            
            // Limit trail length
            if (this.trailPoints.length > this.maxTrailLength) {
                this.trailPoints.shift();
            }
        }
        
        // Update trail points
        for (let i = this.trailPoints.length - 1; i >= 0; i--) {
            this.trailPoints[i].life--;
            if (this.trailPoints[i].life <= 0) {
                this.trailPoints.splice(i, 1);
            }
        }
        
        // Create trail effect
        if (this.trailPoints.length > 1 && IdleAnts.app && IdleAnts.app.effectManager) {
            IdleAnts.app.effectManager.createEffect(
                'rainbowTrail',
                this.x,
                this.y,
                this.getCurrentRainbowColor(),
                0.5,
                {
                    trailPoints: this.trailPoints.slice(),
                    duration: 10
                }
            );
        }
    }
    
    // Find nearby enemies to attack
    findNearbyEnemies() {
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return [];
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        const nearbyEnemies = [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= 40) { // Close combat range
                nearbyEnemies.push(enemy);
            }
        }
        
        return nearbyEnemies;
    }
    
    // Attack with rainbow energy burst
    attack() {
        if (this._attackTimer > 0) return;
        
        const enemies = this.findNearbyEnemies();
        if (enemies.length === 0) return;
        
        // Start attack cooldown
        this._attackTimer = this.attackCooldown;
        
        // Create rainbow burst effect
        this.createRainbowBurst();
        
        // Deal damage to nearby enemies
        for (const enemy of enemies) {
            if (enemy.takeDamage) {
                enemy.takeDamage(this.attackDamage);
            }
        }
    }
    
    createRainbowBurst() {
        if (!IdleAnts.app || !IdleAnts.app.effectManager) return;
        
        // Create colorful burst effect
        IdleAnts.app.effectManager.createEffect(
            'rainbowBurst',
            this.x,
            this.y,
            this.getCurrentRainbowColor(),
            1.5,
            {
                colors: this.rainbowColors,
                duration: 30,
                radius: 50
            }
        );
    }
    
    createRainbowParticles() {
        // Create floating rainbow particles around the ant
        if (Math.random() < 0.15 && IdleAnts.app && IdleAnts.app.stage) {
            const particle = new PIXI.Graphics();
            
            // Random rainbow color
            const colors = this.rainbowColors || [0xFF0000, 0xFF8000, 0xFFFF00, 0x00FF00, 0x0080FF, 0x8000FF, 0xFF00FF];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.beginFill(color, 0.8);
            particle.drawCircle(0, 0, 1 + Math.random() * 2);
            particle.endFill();
            
            // Position around the ant
            const angle = Math.random() * Math.PI * 2;
            const distance = 10 + Math.random() * 15;
            particle.x = this.x + Math.cos(angle) * distance;
            particle.y = this.y + Math.sin(angle) * distance;
            
            // Add swirling motion
            particle.vx = Math.cos(angle + Math.PI/2) * 0.5;
            particle.vy = Math.sin(angle + Math.PI/2) * 0.5;
            particle.life = 30 + Math.random() * 20;
            particle.initialLife = particle.life;
            particle.orbitSpeed = 0.1 + Math.random() * 0.1;
            particle.orbitRadius = distance;
            particle.orbitAngle = angle;
            
            IdleAnts.app.stage.addChild(particle);
            
            const animateParticle = () => {
                // Orbital motion around ant
                particle.orbitAngle += particle.orbitSpeed;
                particle.x = this.x + Math.cos(particle.orbitAngle) * particle.orbitRadius;
                particle.y = this.y + Math.sin(particle.orbitAngle) * particle.orbitRadius;
                
                particle.life--;
                particle.alpha = (particle.life / particle.initialLife) * 0.8;
                particle.scale.set(1 + (1 - particle.life / particle.initialLife) * 0.5);
                
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

    createPrismEffect() {
        // Create light refraction effect like a prism
        if (Math.random() < 0.08 && IdleAnts.app && IdleAnts.app.stage) {
            const prism = new PIXI.Graphics();
            
            // Create spectrum lines
            const colors = this.rainbowColors || [0xFF0000, 0xFF8000, 0xFFFF00, 0x00FF00, 0x0080FF, 0x8000FF, 0xFF00FF];
            
            for (let i = 0; i < colors.length; i++) {
                prism.lineStyle(2, colors[i], 0.7);
                
                const startX = this.x + (Math.random() - 0.5) * 10;
                const startY = this.y + (Math.random() - 0.5) * 10;
                const angle = Math.random() * Math.PI * 2;
                const length = 20 + Math.random() * 15;
                
                // Slightly offset each color for prism effect
                const offsetAngle = angle + (i - 3) * 0.1;
                const endX = startX + Math.cos(offsetAngle) * length;
                const endY = startY + Math.sin(offsetAngle) * length;
                
                prism.moveTo(startX, startY);
                prism.lineTo(endX, endY);
            }
            
            prism.life = 20 + Math.random() * 15;
            prism.initialLife = prism.life;
            
            IdleAnts.app.stage.addChild(prism);
            
            const animatePrism = () => {
                prism.life--;
                prism.alpha = (prism.life / prism.initialLife) * 0.7;
                
                if (prism.life <= 0) {
                    if (prism.parent) {
                        prism.parent.removeChild(prism);
                    }
                } else {
                    requestAnimationFrame(animatePrism);
                }
            };
            animatePrism();
        }
    }

    // Override update method
    update(nestPosition, foods) {
        const actionResult = super.update(nestPosition, foods);
        
        // Update attack timer
        if (this._attackTimer > 0) {
            this._attackTimer--;
        }
        
        // Look for enemies and attack
        if (this._attackTimer <= 0) {
            this.attack();
        }
        return actionResult;
    }
};
