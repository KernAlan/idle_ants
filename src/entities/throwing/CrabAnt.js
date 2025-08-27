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
    
    // Override leg creation for crab legs (positions only)
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
        
        // Crab leg animation timing (used by base animateLegs)
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
    
    // Override to use crab claw projectiles (self-animated Graphics)
    createProjectile(target, dx, dy, distance) {
        if (!IdleAnts.app || !target || this.clawInventory.length === 0) return;

        // Use a claw from inventory
        const claw = this.clawInventory.pop();

        const angle = Math.atan2(dy, dx);
        const speed = Math.max(5, Math.min(12, claw.speed || 8));

        // Visual claw projectile
        const proj = new PIXI.Graphics();
        proj.beginFill(0xDC143C, 0.95);
        proj.drawEllipse(0, 0, 3, 2);
        proj.endFill();
        proj.beginFill(0xB22222);
        proj.drawEllipse(-2, -1, 1, 1.5);
        proj.drawEllipse(-2, 1, 1, 1.5);
        proj.endFill();

        const parent = IdleAnts.app.worldContainer || IdleAnts.app.stage;
        parent.addChild(proj);

        proj.x = this.x; proj.y = this.y;
        proj.rotation = angle;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        let life = Math.max(18, Math.ceil(distance / speed));
        let damaged = false;

        // Throw flash
        this.createClawThrowEffect(angle);

        const dmgAmount = Math.floor((claw.damage || this.attackDamage) * (claw.sharpness || 1));

        const animate = () => {
            proj.x += vx;
            proj.y += vy;
            proj.rotation += 0.3;
            life--;

            // Hit check
            const hx = target.x - proj.x;
            const hy = target.y - proj.y;
            if (!damaged && (hx*hx + hy*hy) <= 10*10 && typeof target.takeDamage === 'function') {
                target.takeDamage(dmgAmount);
                damaged = true;
            }

            if (life <= 0 || damaged) {
                const fade = () => {
                    proj.alpha -= 0.15;
                    if (proj.alpha <= 0) {
                        if (proj.parent) proj.parent.removeChild(proj);
                    } else {
                        requestAnimationFrame(fade);
                    }
                };
                fade();
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();

        return proj;
    }
    
    createClawThrowEffect(angle) {
        // Quick muzzle flash at the claw to signal throw
        const flash = new PIXI.Graphics();
        flash.lineStyle(2, 0xFFFFFF, 0.9);
        flash.moveTo(0, 0);
        flash.lineTo(8, 0);
        flash.moveTo(0, 0);
        flash.lineTo(-6, 0);
        flash.x = this.x;
        flash.y = this.y;
        flash.rotation = angle;
        flash.alpha = 0.9;

        const parent = IdleAnts.app.worldContainer || IdleAnts.app.stage;
        parent.addChild(flash);

        let life = 8;
        const animate = () => {
            life--;
            flash.alpha = life / 8;
            if (life <= 0) {
                if (flash.parent) flash.parent.removeChild(flash);
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();
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
    
    // Use base leg animation for consistent rendering
    
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
