// src/entities/special/DPSAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Special === 'undefined') IdleAnts.Entities.Special = {};

// DPS Ant - Ultra-fast attacks with devastating damage per second
IdleAnts.Entities.Special.DPSAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // DPS ants are very fast
        super(texture, nestPosition, speedMultiplier, 3.0);
        
        // Get ant type configuration
        this.antType = IdleAnts.Data.AntTypes.DPS_ANT;
        
        // Defensive check for missing ant type data
        if (!this.antType) {
            console.error('DPSAnt: Unable to find DPS_ANT configuration in IdleAnts.Data.AntTypes');
            // Provide fallback values
            this.antType = {
                color: 0xFF1493,
                glowColor: 0xFF69B4,
                damage: 370,
                hp: 5,
                attackSpeed: 5.0,
                ability: 'rapidFire'
            };
        }
        
        // Apply properties from ant type
        this.tint = (this.antType && this.antType.color) || 0xFF1493;
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        this.attackSpeed = this.antType.attackSpeed || 5.0;
        
        // Combat properties - much faster than normal
        this.attackCooldown = Math.floor(60 / this.attackSpeed); // ~12 frames for 5x speed
        this._attackTimer = 0;
        
        // Visual properties
        this.rapidFireCounter = 0;
        this.combatMode = false;
        this.afterimages = [];
        this.maxAfterimages = 5;
        
        // Attack burst properties
        this.burstAttacks = 0;
        this.maxBurstAttacks = 10;
        this.burstCooldown = 0;
        this.maxBurstCooldown = 120; // 2 seconds between bursts
        
        this.updateHealthBar();
    }
    
    // Override base scale - DPS ants are compact
    getBaseScale() {
        return 0.7 + Math.random() * 0.2;
    }
    
    // Create type-specific visual elements
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
        this.createEnergyAura();
    }
    
    createBody() {
        const body = new PIXI.Graphics();
        
        // Bright pink DPS ant body - streamlined for speed
        const color = (this.antType && this.antType.color) || 0xFF1493;
        body.beginFill(color);
        
        // Streamlined abdomen
        body.drawEllipse(0, 8, 6, 9);
        body.endFill();
        
        // Compact thorax
        body.beginFill(color);
        body.drawEllipse(0, 0, 5, 7);
        body.endFill();
        
        // Sharp head
        body.beginFill(color);
        body.drawEllipse(0, -8, 4, 5);
        body.endFill();
        
        // Sharp antennae
        body.lineStyle(1.5, 0x2A1B10);
        body.moveTo(-2, -12);
        body.lineTo(-3, -15);
        body.moveTo(2, -12);
        body.lineTo(3, -15);
        
        // Speed lines on the body
        body.lineStyle(1, 0xFFFFFF, 0.8);
        for (let i = 0; i < 4; i++) {
            const y = -6 + (i * 3);
            body.moveTo(-2, y);
            body.lineTo(2, y);
        }
        
        // Combat claws
        body.beginFill(0xFFFFFF, 0.9);
        body.drawEllipse(-3, -6, 1.5, 2);
        body.drawEllipse(3, -6, 1.5, 2);
        body.endFill();
        
        this.addChild(body);
    }
    
    createLegs() {
        // Fast-moving legs
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        this.legs = [];
        const legPositions = [
            {x: -3, y: -6, side: 'left'},
            {x: 3, y: -6, side: 'right'},
            {x: -3, y: 0, side: 'left'},
            {x: 3, y: 0, side: 'right'},
            {x: -3, y: 6, side: 'left'},
            {x: 3, y: 6, side: 'right'}
        ];
        
        for (let i = 0; i < legPositions.length; i++) {
            const legPos = legPositions[i];
            const leg = new PIXI.Graphics();
            
            leg.position.set(legPos.x, legPos.y);
            leg.baseX = legPos.x;
            leg.baseY = legPos.y;
            leg.index = Math.floor(i / 2);
            leg.side = legPos.side;
            
            this.drawLeg(leg);
            this.legsContainer.addChild(leg);
            this.legs.push(leg);
        }
        
        // Super fast leg animation
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.5; // Much faster than normal
    }
    
    createEnergyAura() {
        // High-energy aura
        this.energyAura = new PIXI.Graphics();
        this.updateEnergyAura();
        this.addChildAt(this.energyAura, 0);
    }
    
    updateEnergyAura() {
        if (!this.energyAura) return;
        
        this.energyAura.clear();
        
        // Create pulsing energy aura
        const intensity = this.combatMode ? 1.0 : 0.4;
        const auraSize = 8 + (intensity * 6);
        const auraAlpha = 0.3 + (intensity * 0.4);
        
        // Multiple energy rings
        const baseColor = (this.antType && this.antType.color) || 0xFF1493;
        const glowColor = (this.antType && this.antType.glowColor) || 0xFF69B4;
        for (let i = 0; i < 3; i++) {
            const ringColor = i === 0 ? baseColor : (i === 1 ? glowColor : 0xFFFFFF);
            this.energyAura.beginFill(ringColor, auraAlpha - (i * 0.1));
            this.energyAura.drawCircle(0, 0, auraSize + (i * 2));
            this.energyAura.endFill();
        }
    }
    
    drawLeg(leg) {
        leg.clear();
        leg.lineStyle(1.5, this.combatMode ? 0xFF1493 : 0x2A1B10);
        
        leg.moveTo(0, 0);
        if (leg.side === 'left') {
            leg.lineTo(-3, 1.5);
        } else {
            leg.lineTo(3, 1.5);
        }
    }
    
    // Use standard ant animation instead of custom behavior
    // performAnimation() {
    //     this.animateLegs();
    //     this.animateEnergyAura();
    //     this.updateAfterimages();
    //     this.updateCombatMode();
    // }
    
    animateLegs() {
        if (!this.legs) return;
        
        // Super fast leg animation when in combat
        const speedMultiplier = this.combatMode ? 3.0 : 1.0;
        this.legPhase += this.legAnimationSpeed * speedMultiplier;
        
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') {
                phase += Math.PI;
            }
            
            const legMovement = Math.sin(phase) * (this.combatMode ? 3 : 2);
            
            this.drawLeg(leg);
            
            const bendFactor = Math.max(0, -Math.sin(phase)) * 0.6;
            
            if (leg.side === 'left') {
                const endX = -3 + legMovement;
                const endY = 1.5 + bendFactor;
                leg.lineTo(endX, endY);
            } else {
                const endX = 3 - legMovement;
                const endY = 1.5 + bendFactor;
                leg.lineTo(endX, endY);
            }
        }
    }
    
    animateEnergyAura() {
        if (!this.energyAura) return;
        
        this.rapidFireCounter += 0.3;
        
        // Rapid pulsing in combat mode
        const pulseSpeed = this.combatMode ? 0.8 : 0.2;
        const pulseFactor = 0.7 + Math.sin(this.rapidFireCounter * pulseSpeed) * 0.3;
        
        this.energyAura.scale.set(pulseFactor);
        this.energyAura.rotation += this.combatMode ? 0.15 : 0.05;
        
        this.updateEnergyAura();
    }
    
    updateAfterimages() {
        // Create afterimage effect when moving fast or in combat
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        
        if ((speed > 2 || this.combatMode) && this.afterimages.length < this.maxAfterimages) {
            this.createAfterimage();
        }
        
        // Update existing afterimages
        for (let i = this.afterimages.length - 1; i >= 0; i--) {
            const afterimage = this.afterimages[i];
            afterimage.life--;
            afterimage.alpha = afterimage.life / afterimage.maxLife;
            
            if (afterimage.life <= 0) {
                if (afterimage.parent) {
                    afterimage.parent.removeChild(afterimage);
                }
                this.afterimages.splice(i, 1);
            }
        }
    }
    
    createAfterimage() {
        const afterimage = new PIXI.Graphics();
        const afterimageColor = (this.antType && this.antType.color) || 0xFF1493;
        afterimage.beginFill(afterimageColor, 0.5);
        afterimage.drawEllipse(0, 0, 4, 6);
        afterimage.endFill();
        
        afterimage.x = this.x;
        afterimage.y = this.y;
        afterimage.rotation = this.rotation;
        afterimage.life = 8;
        afterimage.maxLife = afterimage.life;
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(afterimage);
            this.afterimages.push(afterimage);
        }
    }
    
    updateCombatMode() {
        // Enter combat mode when enemies are nearby
        const enemies = this.findNearbyEnemies();
        const shouldBeInCombat = enemies.length > 0;
        
        if (shouldBeInCombat !== this.combatMode) {
            this.combatMode = shouldBeInCombat;
            
            if (this.combatMode) {
                this.enterCombatMode();
            } else {
                this.exitCombatMode();
            }
        }
    }
    
    enterCombatMode() {
        // Visual changes for combat mode
        this.tint = 0xFF69B4; // Brighter pink
        this.burstAttacks = 0;
        this.burstCooldown = 0;
    }
    
    exitCombatMode() {
        // Return to normal appearance
        this.tint = (this.antType && this.antType.color) || 0xFF1493;
    }
    
    // Find nearby enemies for rapid fire
    findNearbyEnemies() {
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return [];
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        const nearbyEnemies = [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= 35) { // Close combat range
                nearbyEnemies.push(enemy);
            }
        }
        
        return nearbyEnemies;
    }
    
    // Rapid fire attack system
    attack() {
        if (!this.combatMode) return;
        
        // Check burst cooldown
        if (this.burstCooldown > 0) {
            this.burstCooldown--;
            return;
        }
        
        // Check attack timer
        if (this._attackTimer > 0) return;
        
        const enemies = this.findNearbyEnemies();
        if (enemies.length === 0) return;
        
        // Start attack cooldown
        this._attackTimer = this.attackCooldown;
        
        // Perform rapid attack
        this.performRapidAttack(enemies);
        
        this.burstAttacks++;
        
        // Check if burst is complete
        if (this.burstAttacks >= this.maxBurstAttacks) {
            this.burstCooldown = this.maxBurstCooldown;
            this.burstAttacks = 0;
        }
    }
    
    performRapidAttack(enemies) {
        // Attack closest enemy
        const target = enemies[0];
        
        if (target.takeDamage) {
            target.takeDamage(this.attackDamage);
        }
        
        // Create rapid attack effect
        this.createRapidAttackEffect(target);
    }
    
    createRapidAttackEffect(target) {
        // Create rapid strike visual
        const strike = new PIXI.Graphics();
        strike.lineStyle(3, 0xFFFFFF, 0.9);
        strike.moveTo(this.x, this.y);
        strike.lineTo(target.x, target.y);
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(strike);
            
            // Flash effect
            let flashCount = 3;
            const flashInterval = setInterval(() => {
                strike.alpha = strike.alpha === 1 ? 0.3 : 1;
                flashCount--;
                
                if (flashCount <= 0) {
                    if (strike.parent) {
                        strike.parent.removeChild(strike);
                    }
                    clearInterval(flashInterval);
                }
            }, 50);
        }
        
        // Create impact effect at target
        this.createImpactEffect(target);
    }
    
    createImpactEffect(target) {
        const impact = new PIXI.Graphics();
        const impactColor = (this.antType && this.antType.glowColor) || 0xFF69B4;
        impact.beginFill(impactColor, 0.8);
        
        // Create star impact
        const points = 6;
        const outerRadius = 5;
        const innerRadius = 2;
        
        impact.moveTo(outerRadius, 0);
        for (let i = 1; i <= points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            impact.lineTo(x, y);
        }
        impact.endFill();
        
        impact.x = target.x;
        impact.y = target.y;
        impact.life = 10;
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(impact);
            
            const animateImpact = () => {
                impact.life--;
                impact.scale.set(1 + (1 - impact.life / 10) * 2);
                impact.alpha = impact.life / 10;
                
                if (impact.life <= 0) {
                    if (impact.parent) {
                        impact.parent.removeChild(impact);
                    }
                } else {
                    requestAnimationFrame(animateImpact);
                }
            };
            animateImpact();
        }
    }
    
    // Override update method
    update() {
        super.update();
        
        // Update attack timer
        if (this._attackTimer > 0) {
            this._attackTimer--;
        }
        
        // Perform attacks
        this.attack();
    }
    
    // Clean up afterimages when destroyed
    destroy() {
        for (const afterimage of this.afterimages) {
            if (afterimage.parent) {
                afterimage.parent.removeChild(afterimage);
            }
        }
        this.afterimages = [];
        
        if (super.destroy) {
            super.destroy();
        }
    }
};
