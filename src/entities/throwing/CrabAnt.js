// src/entities/throwing/CrabAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Throwing === 'undefined') IdleAnts.Entities.Throwing = {};

// Crab Ant - throws sharp crab claws with pinpoint accuracy
IdleAnts.Entities.Throwing.CrabAnt = class extends IdleAnts.Entities.Throwing.ThrowingAntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Get ant type configuration
        const antType = IdleAnts.Data.AntTypes.CRAB_ANT;
        
        // Defensive check for missing ant type data
        if (!antType) {
            console.error('CrabAnt: Unable to find CRAB_ANT configuration in IdleAnts.Data.AntTypes');
        }
        
        // Crab ants are slower but more precise
        super(texture, nestPosition, speedMultiplier, 0.8, antType || {
            color: 0xFF6347,
            glowColor: 0xFFB6C1,
            damage: 570,
            hp: 5,
            range: 100,
            projectile: 'claw'
        });
        
        // Crab-specific properties
        this.clawSharpness = 1.2; // Damage multiplier for critical hits
        this.clawInventory = [];
        this.maxClawInventory = 6;
        this.clawRegenerationRate = 0.5; // Claws per second
        this.lastClawRegen = 0;
        
        // Crab behavior
        this.sidewaysMovement = true;
        this.clawSnappingCounter = 0;
        this.threateningPose = false;
    }
    
    // Override to create crab-specific body
    createBody() {
        const body = new PIXI.Graphics();
        
        // Crab-like tomato red body (fallback if antType not set yet)
        const color = (this.antType && this.antType.color) || 0xFF6347;
        body.beginFill(color);
        
        // Wide, flat crab-like abdomen
        body.drawEllipse(0, 8, 10, 6);
        body.endFill();
        
        // Broad thorax
        body.beginFill(color);
        body.drawEllipse(0, 0, 8, 6);
        body.endFill();
        
        // Head with eye stalks
        body.beginFill(color);
        body.drawEllipse(0, -8, 6, 5);
        body.endFill();
        
        // Eye stalks instead of antennae
        body.beginFill(0x000000);
        body.drawCircle(-3, -14, 1.5);
        body.drawCircle(3, -14, 1.5);
        body.endFill();
        
        // Eye stalks
        body.lineStyle(2, color);
        body.moveTo(-2, -12);
        body.lineTo(-3, -14);
        body.moveTo(2, -12);
        body.lineTo(3, -14);
        
        // Large crab claws
        this.createClaws(body);
        
        // Shell pattern on back
        body.lineStyle(1, 0x8B0000);
        for (let i = 0; i < 4; i++) {
            const y = 4 + (i * 2);
            body.moveTo(-6, y);
            body.lineTo(6, y);
        }
        
        this.addChild(body);
    }
    
    createClaws(body) {
        // Left claw
        body.beginFill(0xDC143C, 0.9);
        body.drawEllipse(-10, -2, 4, 6);
        body.endFill();
        
        // Left claw pincers
        body.beginFill(0xB22222);
        body.drawEllipse(-12, -4, 2, 3);
        body.drawEllipse(-12, 0, 2, 3);
        body.endFill();
        
        // Right claw
        body.beginFill(0xDC143C, 0.9);
        body.drawEllipse(10, -2, 4, 6);
        body.endFill();
        
        // Right claw pincers
        body.beginFill(0xB22222);
        body.drawEllipse(12, -4, 2, 3);
        body.drawEllipse(12, 0, 2, 3);
        body.endFill();
        
        // Claw joints
        body.beginFill(0x8B0000);
        body.drawCircle(-8, -2, 1.5);
        body.drawCircle(8, -2, 1.5);
        body.endFill();
    }
    
    // Override leg creation for crab legs
    createLegs() {
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        this.legs = [];
        // Crab has 8 legs (4 pairs)
        const legPositions = [
            {x: -6, y: -4, side: 'left'},
            {x: 6, y: -4, side: 'right'},
            {x: -8, y: 2, side: 'left'},
            {x: 8, y: 2, side: 'right'},
            {x: -8, y: 8, side: 'left'},
            {x: 8, y: 8, side: 'right'},
            {x: -6, y: 14, side: 'left'},
            {x: 6, y: 14, side: 'right'}
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
        
        // Crab leg animation
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.15;
        
        // Initialize claw inventory
        this.initializeClawInventory();
    }
    
    // Removed custom crab leg drawing - use standard ant legs
    
    initializeClawInventory() {
        // Start with full claw inventory
        for (let i = 0; i < this.maxClawInventory; i++) {
            this.addClawToInventory();
        }
    }
    
    addClawToInventory() {
        if (this.clawInventory.length >= this.maxClawInventory) return;
        
        const claw = {
            sharpness: this.clawSharpness + (Math.random() * 0.3),
            damage: this.attackDamage,
            speed: 8 + Math.random() * 2
        };
        
        this.clawInventory.push(claw);
    }
    
    // Use standard ant animation instead of custom behavior
    // performAnimation() {
    //     super.performAnimation();
    //     this.animateClaws();
    //     this.regenerateClaws();
    //     this.updateSidewaysMovement();
    // }
    
    animateClaws() {
        this.clawSnappingCounter += 0.2;
        
        // Claw snapping animation when threatening
        if (this.threateningPose) {
            // This would animate the claw graphics snapping
            // For now, we'll create small effects
            if (Math.random() < 0.05) {
                this.createClawSnapEffect();
            }
        }
    }
    
    createClawSnapEffect() {
        const snap = new PIXI.Graphics();
        snap.lineStyle(2, 0xFFFFFF, 0.8);
        
        // Random claw (left or right)
        const isLeftClaw = Math.random() < 0.5;
        const clawX = isLeftClaw ? -10 : 10;
        const clawY = -2;
        
        // Snap lines
        snap.moveTo(clawX - 2, clawY - 2);
        snap.lineTo(clawX + 2, clawY + 2);
        snap.moveTo(clawX - 2, clawY + 2);
        snap.lineTo(clawX + 2, clawY - 2);
        
        snap.x = this.x;
        snap.y = this.y;
        snap.life = 8;
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(snap);
            
            const animateSnap = () => {
                snap.life--;
                snap.alpha = snap.life / 8;
                
                if (snap.life <= 0) {
                    if (snap.parent) {
                        snap.parent.removeChild(snap);
                    }
                } else {
                    requestAnimationFrame(animateSnap);
                }
            };
            animateSnap();
        }
    }
    
    regenerateClaws() {
        // Regenerate claws over time
        const now = Date.now();
        if (now - this.lastClawRegen > (1000 / this.clawRegenerationRate)) {
            this.addClawToInventory();
            this.lastClawRegen = now;
        }
    }
    
    updateSidewaysMovement() {
        // Crabs move sideways! Modify movement vector
        if (this.sidewaysMovement && (this.vx !== 0 || this.vy !== 0)) {
            // Rotate movement vector 90 degrees for sideways movement
            const tempVx = this.vx;
            this.vx = -this.vy * 0.8; // Reduce speed when moving sideways
            this.vy = tempVx * 0.8;
        }
    }
    
    // Override to use crab claw projectiles
    createProjectile(target, dx, dy, distance) {
        if (!IdleAnts.app || !IdleAnts.app.effectManager || this.clawInventory.length === 0) return;
        
        // Use a claw from inventory
        const claw = this.clawInventory.pop();
        
        // Calculate trajectory with high accuracy
        const angle = Math.atan2(dy, dx);
        
        // Create claw projectile
        const projectile = IdleAnts.app.effectManager.createEffect(
            'clawProjectile',
            this.x,
            this.y,
            this.antType.color,
            1.0,
            {
                target: target,
                damage: Math.floor(claw.damage * claw.sharpness),
                speed: claw.speed,
                angle: angle,
                distance: distance,
                sharpness: claw.sharpness,
                thrower: this,
                clawData: claw
            }
        );
        
        // Create claw throwing effect
        this.createClawThrowEffect(angle);
        
        return projectile;
    }
    
    createClawThrowEffect(angle) {
        // Create visual claw projectile
        const clawProjectile = new PIXI.Graphics();
        
        // Draw flying claw
        clawProjectile.beginFill(0xDC143C, 0.9);
        clawProjectile.drawEllipse(0, 0, 3, 2);
        clawProjectile.endFill();
        
        // Claw pincers
        clawProjectile.beginFill(0xB22222);
        clawProjectile.drawEllipse(-2, -1, 1, 1.5);
        clawProjectile.drawEllipse(-2, 1, 1, 1.5);
        clawProjectile.endFill();
        
        clawProjectile.x = this.x;
        clawProjectile.y = this.y;
        clawProjectile.rotation = angle;
        
        // Animate claw flight
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(clawProjectile);
            
            const speed = 6;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            let life = 30;
            
            const animateClaw = () => {
                clawProjectile.x += vx;
                clawProjectile.y += vy;
                clawProjectile.rotation += 0.3; // Spinning claw
                life--;
                
                if (life <= 0) {
                    if (clawProjectile.parent) {
                        clawProjectile.parent.removeChild(clawProjectile);
                    }
                } else {
                    requestAnimationFrame(animateClaw);
                }
            };
            animateClaw();
        }
    }
    
    // Override to enter threatening pose when enemies near
    findTarget() {
        const target = super.findTarget();
        
        if (target) {
            this.threateningPose = true;
            this.tint = 0xFF6B6B; // Slightly brighter red when threatening
        } else {
            this.threateningPose = false;
            this.tint = (this.antType && this.antType.color) || 0xFF6347;
        }
        
        return target;
    }
    
    // Override leg animation for crab walk
    animateLegs() {
        if (!this.legs) return;
        
        this.legPhase += this.legAnimationSpeed;
        
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            
            // Crab legs move in wave pattern
            let phase = this.legPhase + (leg.index * Math.PI / 4);
            if (leg.side === 'right') {
                phase += Math.PI / 2; // Offset right legs
            }
            
            const legMovement = Math.sin(phase) * 1.5;
            
            // Use standard leg drawing
            
            // Add movement animation
            const legLength = 5 + (leg.index * 0.5);
            const bendFactor = Math.max(0, -Math.sin(phase)) * 0.5;
            
            if (leg.side === 'left') {
                const endX = -legLength + legMovement;
                const endY = -1 + bendFactor;
                leg.lineTo(endX - 2, 1 + bendFactor);
            } else {
                const endX = legLength - legMovement;
                const endY = -1 + bendFactor;
                leg.lineTo(endX + 2, 1 + bendFactor);
            }
        }
    }
    
    // Override to prevent attacking when out of claws
    attemptAttack() {
        if (this.clawInventory.length === 0) {
            // No claws to throw
            this.isAiming = false;
            return;
        }
        
        super.attemptAttack();
    }
    
    // Show claw count in debug
    getDebugInfo() {
        return {
            claws: this.clawInventory.length,
            threatening: this.threateningPose,
            sidewaysMode: this.sidewaysMovement
        };
    }
};
