// src/entities/special/UpsideDownAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Special === 'undefined') IdleAnts.Entities.Special = {};

// Upside Down Ant - walks on the ceiling, confusing enemies below
IdleAnts.Entities.Special.UpsideDownAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Upside down ants are faster to compensate for their unique movement
        super(texture, nestPosition, speedMultiplier, 1.5);
        
        // Get ant type configuration
        this.antType = IdleAnts.Data.AntTypes.UPSIDE_DOWN_ANT;
        
        // Defensive check for missing ant type data
        if (!this.antType) {
            console.error('UpsideDownAnt: Unable to find UPSIDE_DOWN_ANT configuration in IdleAnts.Data.AntTypes');
            // Provide fallback values
            this.antType = {
                color: 0x9370DB,
                glowColor: 0xDDA0DD,
                damage: 65,
                hp: 5,
                ability: 'ceilingWalk'
            };
        }
        
        // Apply properties from ant type
        this.tint = this.antType.color;
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        
        // Upside down specific properties
        this.isUpsideDown = true;
        this.ceilingHeight = -50; // How high above ground the "ceiling" is
        this.confusionRadius = 60;
        this.confusionEffect = 0.3; // How much to confuse enemies
        
        // Visual properties
        this.disorientationCounter = 0;
        this.antigravityParticles = [];
        this.ceilingTrail = [];
        
        // Combat properties
        this.attackCooldown = 70;
        this._attackTimer = 0;
        this.dropAttackReady = false;
        this.dropAttackCooldown = 0;
        
        // Removed upside down positioning - use normal ant behavior
        // this.scale.y = -1; // Flip vertically
        // this.y += this.ceilingHeight; // Move to ceiling level
        
        this.updateHealthBar();
    }
    
    // Override base scale
    getBaseScale() {
        return 0.8 + Math.random() * 0.2;
    }
    
    // Create type-specific visual elements
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
        this.createAntigravityField();
    }
    
    createBody() {
        const body = new PIXI.Graphics();
        
        // Purple upside down ant body
        const color = (this.antType && this.antType.color) || 0x9370DB;
        body.beginFill(color);
        
        // Abdomen
        body.drawEllipse(0, 8, 7, 10);
        body.endFill();
        
        // Thorax
        body.beginFill(color);
        body.drawEllipse(0, 0, 6, 8);
        body.endFill();
        
        // Head
        body.beginFill(color);
        body.drawEllipse(0, -8, 5, 6);
        body.endFill();
        
        // Special upside-down antennae (pointing up when flipped)
        body.lineStyle(1.5, 0x2A1B10);
        body.moveTo(-2, -12);
        body.lineTo(-4, -16);
        body.moveTo(2, -12);
        body.lineTo(4, -16);
        
        // Antigravity organs (glowing spots)
        body.beginFill(((this.antType && this.antType.glowColor) || 0xDDA0DD), 0.8);
        body.drawCircle(-3, 2, 2);
        body.drawCircle(3, 2, 2);
        body.drawCircle(0, 8, 1.5);
        body.endFill();
        
        // Disorientation markings
        body.lineStyle(1, 0xFFFFFF, 0.6);
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const x1 = Math.cos(angle) * 4;
            const y1 = Math.sin(angle) * 4;
            const x2 = Math.cos(angle + Math.PI) * 2;
            const y2 = Math.sin(angle + Math.PI) * 2;
            body.moveTo(x1, y1);
            body.lineTo(x2, y2);
        }
        
        this.addChild(body);
    }
    
    createLegs() {
        // Upside down legs that appear to grip the ceiling
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        this.legs = [];
        const legPositions = [
            {x: -4, y: -8, side: 'left'},
            {x: 4, y: -8, side: 'right'},
            {x: -4, y: -2, side: 'left'},
            {x: 4, y: -2, side: 'right'},
            {x: -4, y: 4, side: 'left'},
            {x: 4, y: 4, side: 'right'}
        ];
        
        for (let i = 0; i < legPositions.length; i++) {
            const legPos = legPositions[i];
            const leg = new PIXI.Graphics();
            
            leg.position.set(legPos.x, legPos.y);
            leg.baseX = legPos.x;
            leg.baseY = legPos.y;
            leg.index = Math.floor(i / 2);
            leg.side = legPos.side;
            
            this.drawUpsideDownLeg(leg);
            this.legsContainer.addChild(leg);
            this.legs.push(leg);
        }
        
        // Disorienting leg animation
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.3;
    }
    
    createAntigravityField() {
        // Visual field showing antigravity effect
        this.antigravityField = new PIXI.Graphics();
        this.updateAntigravityField();
        this.addChildAt(this.antigravityField, 0);
    }
    
    updateAntigravityField() {
        if (!this.antigravityField) return;
        
        this.antigravityField.clear();
        
        // Swirling antigravity field
        const glowColor = (this.antType && this.antType.glowColor) || 0xDDA0DD;
        this.antigravityField.lineStyle(2, glowColor, 0.4);
        
        const fieldRadius = 12;
        for (let i = 0; i < 3; i++) {
            const spiralRadius = fieldRadius - (i * 3);
            this.antigravityField.moveTo(spiralRadius, 0);
            
            for (let angle = 0; angle < Math.PI * 4; angle += 0.2) {
                const spiralFactor = 1 - (angle / (Math.PI * 4));
                const currentRadius = spiralRadius * spiralFactor;
                const x = Math.cos(angle + this.disorientationCounter) * currentRadius;
                const y = Math.sin(angle + this.disorientationCounter) * currentRadius;
                this.antigravityField.lineTo(x, y);
            }
        }
    }
    
    drawUpsideDownLeg(leg) {
        leg.clear();
        
        // Legs appear to grip ceiling surface
        const legColor = (this.antType && this.antType.color) || 0x9370DB;
        leg.lineStyle(1.5, legColor);
        leg.moveTo(0, 0);
        
        // Legs curve upward to grip ceiling
        if (leg.side === 'left') {
            leg.lineTo(-4, -3); // Up instead of down
        } else {
            leg.lineTo(4, -3);
        }
        
        // Add grip indicators
        leg.lineStyle(1, 0xFFFFFF, 0.6);
        if (leg.side === 'left') {
            leg.moveTo(-4, -3);
            leg.lineTo(-5, -2);
            leg.lineTo(-3, -2);
        } else {
            leg.moveTo(4, -3);
            leg.lineTo(5, -2);
            leg.lineTo(3, -2);
        }
    }
    
    // Use standard ant animation instead of custom behavior
    // performAnimation() {
    //     this.animateLegs();
    //     this.animateAntigravity();
    //     this.createConfusionEffect();
    //     // Removed ceiling positioning - use normal ant behavior
    //     // this.maintainCeilingPosition();
    //     this.updateDropAttack();
    // }
    
    animateLegs() {
        if (!this.legs) return;
        
        // Disorienting leg animation - different pattern
        this.legPhase += this.legAnimationSpeed;
        
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            
            // Reverse leg movement pattern
            let phase = -this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'left') {
                phase += Math.PI; // Opposite of normal ants
            }
            
            const legMovement = Math.sin(phase) * 2;
            
            this.drawUpsideDownLeg(leg);
            
            // Add animated grip movement
            const gripMovement = Math.cos(phase) * 0.5;
            if (leg.side === 'left') {
                leg.lineTo(-5 + gripMovement, -2);
                leg.lineTo(-3 + gripMovement, -2);
            } else {
                leg.lineTo(5 - gripMovement, -2);
                leg.lineTo(3 - gripMovement, -2);
            }
        }
    }
    
    animateAntigravity() {
        this.disorientationCounter += 0.15;
        this.updateAntigravityField();
        
        // Create floating particles
        if (Math.random() < 0.1) {
            this.createAntigravityParticle();
        }
        
        // Update existing particles
        for (let i = this.antigravityParticles.length - 1; i >= 0; i--) {
            const particle = this.antigravityParticles[i];
            
            // Particles float upward
            particle.y -= 0.5;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            particle.scale.set(0.5 + (1 - particle.life / particle.maxLife) * 0.5);
            
            if (particle.life <= 0) {
                if (particle.parent) {
                    particle.parent.removeChild(particle);
                }
                this.antigravityParticles.splice(i, 1);
            }
        }
    }
    
    createAntigravityParticle() {
        const particle = new PIXI.Graphics();
        const particleColor = (this.antType && this.antType.glowColor) || 0xDDA0DD;
        particle.beginFill(particleColor, 0.6);
        particle.drawCircle(0, 0, 1.5);
        particle.endFill();
        
        particle.x = this.x + (Math.random() - 0.5) * 16;
        particle.y = this.y + (Math.random() - 0.5) * 8;
        particle.life = 40 + Math.random() * 20;
        particle.maxLife = particle.life;
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(particle);
            this.antigravityParticles.push(particle);
        }
    }
    
    createConfusionEffect() {
        // Create confusion effect on nearby enemies
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return;
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= this.confusionRadius) {
                this.applyConfusionToEnemy(enemy);
            }
        }
    }
    
    applyConfusionToEnemy(enemy) {
        // Make enemy confused (random movement)
        if (!enemy.isConfused) {
            enemy.isConfused = true;
            enemy.originalAI = enemy.update;
            
            // Replace enemy's update function with confused behavior
            enemy.update = () => {
                if (enemy.originalAI) {
                    enemy.originalAI.call(enemy);
                }
                
                // Add random confused movement
                if (Math.random() < this.confusionEffect) {
                    const randomAngle = Math.random() * Math.PI * 2;
                    const confusionForce = 1;
                    
                    if (enemy.vx !== undefined) {
                        enemy.vx += Math.cos(randomAngle) * confusionForce;
                    }
                    if (enemy.vy !== undefined) {
                        enemy.vy += Math.sin(randomAngle) * confusionForce;
                    }
                }
            };
            
            // Remove confusion after duration
            setTimeout(() => {
                if (enemy.originalAI) {
                    enemy.update = enemy.originalAI;
                    enemy.isConfused = false;
                }
            }, 2000);
        }
        
        // Visual confusion effect
        this.createConfusionVisual(enemy);
    }
    
    createConfusionVisual(enemy) {
        // Swirling confusion stars around enemy
        if (Math.random() < 0.1) {
            const confusionStar = new PIXI.Graphics();
            confusionStar.beginFill(0xFFFF00, 0.8);
            
            // Draw star
            const points = 5;
            const outerRadius = 3;
            const innerRadius = 1.5;
            
            confusionStar.moveTo(outerRadius, 0);
            for (let i = 1; i <= points * 2; i++) {
                const angle = (i * Math.PI) / points;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                confusionStar.lineTo(x, y);
            }
            confusionStar.endFill();
            
            confusionStar.x = enemy.x + (Math.random() - 0.5) * 20;
            confusionStar.y = enemy.y - 10 + (Math.random() - 0.5) * 10;
            confusionStar.life = 30;
            confusionStar.rotationSpeed = 0.2;
            
            if (IdleAnts.app && IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(confusionStar);
                
                const animateConfusion = () => {
                    confusionStar.rotation += confusionStar.rotationSpeed;
                    confusionStar.y -= 0.5;
                    confusionStar.life--;
                    confusionStar.alpha = confusionStar.life / 30;
                    
                    if (confusionStar.life <= 0) {
                        if (confusionStar.parent) {
                            confusionStar.parent.removeChild(confusionStar);
                        }
                    } else {
                        requestAnimationFrame(animateConfusion);
                    }
                };
                animateConfusion();
            }
        }
    }
    
    maintainCeilingPosition() {
        // Keep ant at ceiling height
        const groundY = this.nestPosition.y; // Original ground level
        const targetY = groundY + this.ceilingHeight;
        
        // Gradually adjust to ceiling if needed
        if (Math.abs(this.y - targetY) > 5) {
            this.y += (targetY - this.y) * 0.1;
        }
    }
    
    updateDropAttack() {
        // Update drop attack cooldown
        if (this.dropAttackCooldown > 0) {
            this.dropAttackCooldown--;
        } else {
            this.dropAttackReady = true;
        }
    }
    
    // Find enemies below for drop attack
    findEnemiesBelow() {
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return [];
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        const enemiesBelow = [];
        
        for (const enemy of enemies) {
            const horizontalDistance = Math.abs(enemy.x - this.x);
            const isBelow = enemy.y > this.y; // Enemy is below ceiling
            
            if (horizontalDistance <= 30 && isBelow) {
                enemiesBelow.push(enemy);
            }
        }
        
        return enemiesBelow;
    }
    
    // Drop attack from ceiling
    dropAttack() {
        if (!this.dropAttackReady || this._attackTimer > 0) return;
        
        const enemiesBelow = this.findEnemiesBelow();
        if (enemiesBelow.length === 0) return;
        
        // Start attack
        this._attackTimer = this.attackCooldown;
        this.dropAttackReady = false;
        this.dropAttackCooldown = 180; // 3 seconds
        
        // Create drop attack effect
        this.createDropAttackEffect(enemiesBelow);
        
        // Deal damage to enemies below
        for (const enemy of enemiesBelow) {
            if (enemy.takeDamage) {
                enemy.takeDamage(this.attackDamage);
            }
        }
    }
    
    createDropAttackEffect(enemies) {
        // Create falling attack visual
        for (const enemy of enemies) {
            const dropStrike = new PIXI.Graphics();
            dropStrike.lineStyle(3, this.antType.glowColor, 0.9);
            dropStrike.moveTo(this.x, this.y);
            dropStrike.lineTo(enemy.x, enemy.y);
            
            if (IdleAnts.app && IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(dropStrike);
                
                let life = 15;
                const animateStrike = () => {
                    life--;
                    dropStrike.alpha = life / 15;
                    
                    if (life <= 0) {
                        if (dropStrike.parent) {
                            dropStrike.parent.removeChild(dropStrike);
                        }
                    } else {
                        requestAnimationFrame(animateStrike);
                    }
                };
                animateStrike();
            }
        }
    }
    
    // Override update method
    update() {
        super.update();
        
        // Update attack timer
        if (this._attackTimer > 0) {
            this._attackTimer--;
        }
        
        // Try drop attack
        this.dropAttack();
    }
    
    // Clean up particles when destroyed
    destroy() {
        // Clean up antigravity particles
        for (const particle of this.antigravityParticles) {
            if (particle.parent) {
                particle.parent.removeChild(particle);
            }
        }
        this.antigravityParticles = [];
        
        if (super.destroy) {
            super.destroy();
        }
    }
};
