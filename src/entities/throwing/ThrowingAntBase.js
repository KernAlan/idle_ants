// src/entities/throwing/ThrowingAntBase.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Throwing === 'undefined') IdleAnts.Entities.Throwing = {};

// Base class for all throwing ants - they attack at range with projectiles
IdleAnts.Entities.Throwing.ThrowingAntBase = class extends IdleAnts.Entities.AntBase {
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
            this.attackRange = antType.range || 100;
            this.projectileType = antType.projectile;
        }
        
        // Combat properties
        this.attackCooldown = 90; // frames (slower than melee)
        this._attackTimer = 0;
        this.currentTarget = null;
        
        // Throwing animation properties
        this.isThrowingAnimation = false;
        this.throwAnimationTimer = 0;
        this.throwAnimationDuration = 20; // frames
        
        // Aiming properties
        this.aimDirection = 0;
        this.isAiming = false;
        
        // Archer behavior configuration (AOE-like)
        this.archer = {
            standoffRatio: 0.85,     // preferred distance as ratio of attackRange
            pocketTolerance: 0.10,   // +/- tolerance around preferred
            strafeSpeed: 0.2,        // portion of speed to use for strafing
            strafeDuration: 30       // frames to keep a strafe direction
        };
        this._strafeDir = 0;         // -1, 0, +1
        this._strafeTimer = 0;       // frames remaining for current strafe direction

        this.updateHealthBar();
    }
    
    // Override base scale - throwing ants are slightly larger
    getBaseScale() {
        return 0.9 + Math.random() * 0.3;
    }
    
    // Create type-specific visual elements
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
        this.createAimingIndicator();
    }
    
    createBody() {
        const body = new PIXI.Graphics();
        
        // Main body with ant type color
        body.beginFill(this.antType?.color || 0xFFFF00);
        
        // Abdomen - slightly longer for throwing stance
        body.drawEllipse(0, 8, 7, 12);
        body.endFill();
        
        // Thorax
        body.beginFill(this.antType?.color || 0xFFFF00);
        body.drawEllipse(0, 0, 6, 8);
        body.endFill();
        
        // Head
        body.beginFill(this.antType?.color || 0xFFFF00);
        body.drawEllipse(0, -8, 5, 6);
        body.endFill();
        
        // Enhanced antennae for better targeting
        body.lineStyle(1.5, 0x2A1B10);
        body.moveTo(-2, -12);
        body.lineTo(-4, -16);
        body.moveTo(2, -12);
        body.lineTo(4, -16);
        
        // Throwing arm indicators (small circles on sides)
        body.beginFill(this.antType?.glowColor || 0xFFFF99, 0.6);
        body.drawCircle(-8, -2, 2); // Left arm
        body.drawCircle(8, -2, 2);  // Right arm
        body.endFill();
        
        this.addChild(body);
    }
    
    createLegs() {
        // Similar to exploding ants but with stance for throwing
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        this.legs = [];
        const legPositions = [
            {x: -4, y: -6, side: 'left'},
            {x: 4, y: -6, side: 'right'},
            {x: -5, y: 0, side: 'left'},
            {x: 5, y: 0, side: 'right'},
            {x: -4, y: 6, side: 'left'},
            {x: 4, y: 6, side: 'right'}
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
        this.legAnimationSpeed = 0.2;
    }
    
    createAimingIndicator() {
        // Create a subtle line that shows where the ant is aiming
        this.aimingLine = new PIXI.Graphics();
        this.aimingLine.alpha = 0;
        this.addChild(this.aimingLine);
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
    
    updateAiming() {
        if (!this.aimingLine) return;
        // Only show a short, faint indicator during throw wind-up
        if (this.isAiming && this.currentTarget) {
            const dx = this.currentTarget.x - this.x;
            const dy = this.currentTarget.y - this.y;
            const dir = Math.atan2(dy, dx);
            const len = Math.min(18, Math.max(10, this.attackRange * 0.08));

            this.aimingLine.alpha = 0.2;
            this.aimingLine.clear();
            this.aimingLine.lineStyle(1, this.antType?.glowColor || 0xFFFF99, 0.6);
            this.aimingLine.moveTo(0, 0);
            this.aimingLine.lineTo(Math.cos(dir) * len, Math.sin(dir) * len);

            // Keep stored aim direction in sync
            this.aimDirection = dir;
        } else {
            this.aimingLine.alpha = 0;
        }
    }
    
    updateThrowingAnimation() {
        if (this.isThrowingAnimation) {
            this.throwAnimationTimer--;
            
            // Add throwing motion to the body
            const progress = 1 - (this.throwAnimationTimer / this.throwAnimationDuration);
            const throwOffset = Math.sin(progress * Math.PI) * 3;
            
            // Slightly lean in the throwing direction
            this.rotation = this.targetRotation + Math.sin(progress * Math.PI) * 0.2;
            
            if (this.throwAnimationTimer <= 0) {
                this.isThrowingAnimation = false;
                this.rotation = this.targetRotation;
            }
        }
    }
    
    // Find and target nearby enemies
    findTarget() {
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return null;
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        let closestEnemy = null;
        let closestDistance = this.attackRange;
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
            }
        }
        
        return closestEnemy;
    }

    // Compute preferred archer distance and pocket bounds
    getPreferredDistances() {
        const preferred = Math.max(40, Math.min(this.attackRange * this.archer.standoffRatio, this.attackRange - 10));
        const low = preferred * (1 - this.archer.pocketTolerance);
        const high = preferred * (1 + this.archer.pocketTolerance);
        return { preferred, low, high };
    }

    // Update aiming helper visuals and store aim direction
    aimAt(dx, dy, distance) {
        this.isAiming = true;
        this.aimDirection = Math.atan2(dy, dx);
        if (this.updateAiming) this.updateAiming();
    }

    // Maintain AOE-archer-like standoff/kiting
    maintainArcherStandoff(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        const { low, high } = this.getPreferredDistances();

        // Aim visuals
        this.aimAt(dx, dy, dist);

        if (dist < low) {
            // Too close: kite away
            const nx = -dx / dist, ny = -dy / dist;
            this.vx = nx * this.speed;
            this.vy = ny * this.speed;
            this.applyMovement();
            return;
        }
        if (dist > high && dist < this.attackRange * 1.3) {
            // Step in a bit if within extended window
            const nx = dx / dist, ny = dy / dist;
            this.vx = nx * this.speed;
            this.vy = ny * this.speed;
            this.applyMovement();
            return;
        }

        // In the pocket: strafe sideways to feel alive
        if (this._strafeTimer <= 0) {
            this._strafeDir = Math.random() < 0.5 ? -1 : 1;
            this._strafeTimer = this.archer.strafeDuration;
        }
        const perp = this.aimDirection + Math.PI / 2;
        const s = this.archer.strafeSpeed * this.speed * this._strafeDir;
        this.vx += Math.cos(perp) * s;
        this.vy += Math.sin(perp) * s;
        this._strafeTimer--;
    }

    // Kinematics helper for arcing projectiles
    computeShotKinematics(distance) {
        const d = Math.min(800, Math.max(0, distance));
        const speed = Math.min(14, 8 + d / 60); // cap
        const gravity = 0.18;                   // gentle gravity gives readable arc
        const loft = Math.min(3.2, 0.8 + d / 120);
        const life = Math.max(30, Math.min(300, Math.ceil(d / speed) + 30));
        return { speed, gravity, loft, life };
    }
    
    // Attempt to attack
    attemptAttack() {
        if (this._attackTimer > 0 || this.isThrowingAnimation) return;
        
        const target = this.findTarget();
        if (!target) {
            this.currentTarget = null;
            this.isAiming = false;
            return;
        }
        
        this.currentTarget = target;
        this.isAiming = true;
        
        // Start attack cooldown
        this._attackTimer = this.attackCooldown;
        
        // Start throwing animation
        this.isThrowingAnimation = true;
        this.throwAnimationTimer = this.throwAnimationDuration;
        
        // Launch projectile after brief delay
        setTimeout(() => {
            this.launchProjectile(target);
        }, 200); // 200ms delay for wind-up
    }
    
    // Launch a projectile at the target
    launchProjectile(target) {
        if (!target || !IdleAnts.app) return;
        
        // Calculate projectile trajectory
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        // Create projectile (subclasses may use Graphics without effectManager)
        const projectile = this.createProjectile(target, dx, dy, distance);
        
        this.isAiming = false;
    }
    
    // Create projectile - to be overridden by subclasses
    createProjectile(target, dx, dy, distance) {
        // Base projectile implementation
        if (IdleAnts.app && IdleAnts.app.effectManager) {
            return IdleAnts.app.effectManager.createEffect(
                'projectile',
                this.x,
                this.y,
                this.antType?.glowColor || 0xFFFF99,
                1.0,
                {
                    target: target,
                    damage: this.attackDamage,
                    speed: 8,
                    type: this.projectileType || 'basic'
                }
            );
        }
    }
    
    // Override update to handle combat (forward nest and foods)
    update(nestPosition, foods) {
        // Preserve AntBase behavior (movement, state, and action signalling)
        const actionResult = super.update(nestPosition, foods);

        // Maintain archer behavior
        const target = this.findTarget();
        this.currentTarget = target || null;
        if (target) {
            this.maintainArcherStandoff(target);
        } else {
            this.isAiming = false;
            if (this.updateAiming) this.updateAiming();
            // Reset strafe when no target
            this._strafeTimer = 0; this._strafeDir = 0;
        }

        // Update attack timer and fire when ready
        if (this._attackTimer > 0) this._attackTimer--;
        if (this._attackTimer <= 0 && !this.isThrowingAnimation) {
            this.attemptAttack();
        }

        // Return AntBase action result so EntityManager can handle
        return actionResult;
    }
};
