// src/entities/exploding/ExplodingAntBase.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Exploding === 'undefined') IdleAnts.Entities.Exploding = {};

// Base class for all exploding ants - they deal AOE damage on death
IdleAnts.Entities.Exploding.ExplodingAntBase = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1, speedFactor = 1, antType) {
        super(texture, nestPosition, speedMultiplier, speedFactor);
        
        // Store the ant type configuration
        this.antType = antType;
        
        // Apply ant type properties
        if (antType) {
            this.tint = antType.color;
            this.maxHp = antType.hp;
            this.hp = this.maxHp;
            this.attackDamage = antType.damage;
            this.explosionRadius = antType.explosionRadius || 80;
            this.effectType = antType.effect;
        }
        
        // Combat properties
        this.attackCooldown = 60; // frames
        this._attackTimer = 0;
        this.hasExploded = false;
        
        // Visual pulsing effect for danger
        this.pulseCounter = 0;
        this.pulseSpeed = 0.1;
        
        this.updateHealthBar();
    }
    
    // Override base scale for more dramatic appearance
    getBaseScale() {
        return 0.8 + Math.random() * 0.3;
    }
    
    // Create type-specific visual elements
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
        this.createDangerGlow();
    }
    
    createBody() {
        const body = new PIXI.Graphics();
        
        // Main body with ant type color
        body.beginFill(this.antType?.color || 0xFF0000);
        
        // Abdomen - slightly larger for exploding ants
        body.drawEllipse(0, 8, 8, 11);
        body.endFill();
        
        // Thorax
        body.beginFill(this.antType?.color || 0xFF0000);
        body.drawEllipse(0, 0, 6, 8);
        body.endFill();
        
        // Head
        body.beginFill(this.antType?.color || 0xFF0000);
        body.drawEllipse(0, -8, 5, 6);
        body.endFill();
        
        // Antennae
        body.lineStyle(1, 0x2A1B10);
        body.moveTo(-2, -12);
        body.lineTo(-4, -16);
        body.moveTo(2, -12);
        body.lineTo(4, -16);
        
        this.addChild(body);
    }
    
    createLegs() {
        // Reuse the regular ant leg system but make them slightly thicker
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
            
            // Use standard leg drawing
            this.legsContainer.addChild(leg);
            this.legs.push(leg);
        }
        
        // Leg animation setup
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.25;
    }
    
    createDangerGlow() {
        // Create a subtle pulsing glow to indicate danger
        this.dangerGlow = new PIXI.Graphics();
        this.dangerGlow.beginFill(this.antType?.glowColor || 0xFF6666, 0.3);
        this.dangerGlow.drawCircle(0, 0, 15);
        this.dangerGlow.endFill();
        
        // Add behind the ant
        this.addChildAt(this.dangerGlow, 0);
    }
    
    // Removed custom leg drawing - use standard ant legs
    
    // Use standard ant leg animation only
    performAnimation() {
        this.animateLegs();
    }
    
    // Standard ant leg animation
    animateLegs() {
        if (!this.legs) return;
        
        // Update leg animation phase
        this.legPhase += this.legAnimationSpeed;
        
        // Speed-based animation rate - faster movement = faster leg movement
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const animationRate = Math.max(0.1, speed * 0.3);
        
        // Animate each leg with symmetrical movement
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            
            // Alternating leg movement pattern - opposite sides move in opposite phases
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') {
                phase += Math.PI; // Opposite phase for right legs
            }
            
            // Apply leg animation - symmetrical movement
            const legMovement = Math.sin(phase) * 2; // Full movement for both sides
            
            // Redraw the leg with animation
            leg.clear();
            leg.lineStyle(1.5, 0x2A1B10);
            leg.moveTo(0, 0);
            
            // Symmetrical leg animation for bird's eye view
            const bendFactor = Math.max(0, -Math.sin(phase)) * 0.8;
            
            if (leg.side === 'left') {
                const endX = -4 + legMovement;
                const endY = 2 + bendFactor;
                leg.lineTo(endX, endY);
            } else {
                const endX = 4 - legMovement; // Mirror the movement for right side
                const endY = 2 + bendFactor;
                leg.lineTo(endX, endY);
            }
        }
    }
    
    animateDangerGlow() {
        if (!this.dangerGlow) return;
        
        // Pulse the danger glow faster as HP gets lower
        const healthPercent = this.hp / this.maxHp;
        const pulseSpeed = this.pulseSpeed * (2 - healthPercent); // Faster when lower HP
        
        this.pulseCounter += pulseSpeed;
        const pulseFactor = 0.7 + Math.sin(this.pulseCounter) * 0.3;
        
        this.dangerGlow.alpha = pulseFactor * 0.4;
        this.dangerGlow.scale.set(pulseFactor);
    }
    
    // Handle taking damage - explode when HP reaches 0
    takeDamage(damage) {
        if (this.hasExploded) return false;
        
        this.hp -= damage;
        this.updateHealthBar();
        
        // Trigger explosion on death
        if (this.hp <= 0 && !this.hasExploded) {
            this.explode();
            return true; // Ant died
        }
        
        return false;
    }
    
    // Main explosion method - to be overridden by subclasses
    explode() {
        if (this.hasExploded) return;
        
        this.hasExploded = true;
        
        // Create explosion effect
        this.createExplosionEffect();
        
        // Deal damage to nearby enemies
        this.dealExplosionDamage();
        
        // Mark for removal
        this.shouldBeRemoved = true;
    }
    
    createExplosionEffect() {
        // Base explosion effect - subclasses should override for unique effects
        if (IdleAnts.app && IdleAnts.app.effectManager) {
            IdleAnts.app.effectManager.createEffect(
                this.effectType || 'explosion',
                this.x,
                this.y,
                this.antType?.glowColor || 0xFF6666,
                1.5
            );
        }
    }
    
    dealExplosionDamage() {
        // Find and damage nearby enemies
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return;
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= this.explosionRadius) {
                // Damage decreases with distance
                const damageMultiplier = 1 - (distance / this.explosionRadius);
                const finalDamage = Math.floor(this.attackDamage * damageMultiplier);
                
                if (enemy.takeDamage) {
                    enemy.takeDamage(finalDamage);
                }
            }
        }
    }
    
    // Override update to handle explosion logic
    update() {
        if (this.hasExploded) return;
        
        // Call parent update
        super.update();
        
        // Update attack timer
        if (this._attackTimer > 0) {
            this._attackTimer--;
        }
    }
};