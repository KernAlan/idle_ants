// src/entities/PhatAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// Phat Ant (renamed from Fat Ant) - large, slow ant that can carry multiple food items
IdleAnts.Entities.PhatAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Fat ants are slower but have more capacity
        super(texture, nestPosition, speedMultiplier, 0.5);
        
        // Get ant type configuration
        this.antType = IdleAnts.Data.AntTypes.FAT_ANT;
        
        // Defensive check for missing ant type data
        if (!this.antType) {
            console.error('PhatAnt: Unable to find FAT_ANT configuration in IdleAnts.Data.AntTypes');
            // Provide fallback values
            this.antType = {
                color: 0x8B4513,
                glowColor: 0xD2691E,
                damage: 25,
                hp: 500,
                capacity: 3
            };
        }
        
        // Apply properties from ant type
        this.tint = this.antType.color;
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        
        // Override capacity for multiple food carrying
        this.capacity = this.antType.capacity || 3;
        this.carriedFood = [];
        
        // Fat ant specific properties
        this.bellowCounter = 0;
        this.isWaddling = false;
        this.breathingCounter = 0;
        this.foodDigestionRate = 0.02; // Slowly convert carried food to energy
        
        // Combat properties
        this.attackCooldown = 120; // frames (slower attacks)
        this._attackTimer = 0;
        this.chargeAttackReady = false;
        this.chargeCooldown = 0;
        
        // Visual bulk effects
        this.bulkLevel = 1.0; // Increases with carried food
        this.jigglePhase = Math.random() * Math.PI * 2;
        
        this.updateHealthBar();
    }
    
    // Override base scale - Fat ants are much larger
    getBaseScale() {
        return (this.antType && this.antType.size) || (1.5 + Math.random() * 0.3);
    }
    
    // Create type-specific visual elements
    createTypeSpecificElements() {
        this.createFatBody();
        this.createLegs();
        this.createFoodStorage();
        this.createPhatExtras();
    }
    
    createFatBody() {
        this.bodyGraphics = new PIXI.Graphics();
        this.updateFatBody();
        this.addChild(this.bodyGraphics);
    }

    // Extra visual layers (sheen, outline, and a subtle gold chain) — visuals only
    createPhatExtras() {
        // Soft outline to improve readability
        this.outline = new PIXI.Graphics();
        this.outline.lineStyle(1.5, 0x5C3B1A, 0.6);
        this.outline.drawEllipse(0, 8, 11, 9);
        this.outline.drawEllipse(0, 0, 9, 7);
        this.outline.drawEllipse(0, -10, 6.5, 5.5);
        this.addChild(this.outline);

        // Sheen overlay on abdomen
        this.sheen = new PIXI.Graphics();
        this.sheen.beginFill(0xFFFFFF, 0.15);
        this.sheen.drawEllipse(-2, 4, 5, 2.2);
        this.sheen.endFill();
        this.addChild(this.sheen);

        // Simple gold chain around neck area
        this.chain = new PIXI.Container();
        const links = 7;
        for (let i = 0; i < links; i++) {
            const link = new PIXI.Graphics();
            link.beginFill(0xD4AF37, 0.85); // gold
            link.drawCircle(0, 0, 1.2);
            link.endFill();
            const t = (i / (links - 1)) * Math.PI;
            link.x = Math.cos(t) * 6;
            link.y = -7 + Math.sin(t) * 2;
            this.chain.addChild(link);
        }
        this.addChild(this.chain);
    }
    
    updateFatBody() {
        if (!this.bodyGraphics) return;
        
        this.bodyGraphics.clear();
        
        // Calculate bulk based on carried food
        const carriedCount = (this.carriedFood && Array.isArray(this.carriedFood)) ? this.carriedFood.length : 0;
        this.bulkLevel = 1.0 + (carriedCount / this.capacity) * 0.5;
        
        // Large brown fat ant body
        const bodyColor = (this.antType && this.antType.color) || 0x8B7355;
        this.bodyGraphics.beginFill(bodyColor);
        
        // Extra large abdomen that grows with food
        const abdomenSize = 10 * this.bulkLevel;
        this.bodyGraphics.drawEllipse(0, 8, abdomenSize, abdomenSize * 0.8);
        this.bodyGraphics.endFill();
        
        // Wide thorax
        this.bodyGraphics.beginFill(bodyColor);
        this.bodyGraphics.drawEllipse(0, 0, 8 * this.bulkLevel, 10);
        this.bodyGraphics.endFill();
        
        // Large head
        this.bodyGraphics.beginFill(bodyColor);
        this.bodyGraphics.drawEllipse(0, -10, 7, 8);
        this.bodyGraphics.endFill();
        
        // Strong mandibles for carrying food
        this.bodyGraphics.beginFill(0x654321, 0.9);
        this.bodyGraphics.drawEllipse(-5, -12, 3, 4);
        this.bodyGraphics.drawEllipse(5, -12, 3, 4);
        this.bodyGraphics.endFill();
        
        // Thick antennae
        this.bodyGraphics.lineStyle(2, 0x2A1B10);
        this.bodyGraphics.moveTo(-3, -15);
        this.bodyGraphics.lineTo(-5, -20);
        this.bodyGraphics.moveTo(3, -15);
        this.bodyGraphics.lineTo(5, -20);
        
        // Food storage indicators on sides
        for (let i = 0; i < carriedCount; i++) {
            const foodColor = (this.carriedFood && this.carriedFood[i] && this.carriedFood[i].color) ? this.carriedFood[i].color : 0xFFD700;
            this.bodyGraphics.beginFill(foodColor, 0.7);
            const angle = (i / this.capacity) * Math.PI * 2;
            const x = Math.cos(angle) * (abdomenSize - 2);
            const y = Math.sin(angle) * (abdomenSize * 0.6) + 8;
            this.bodyGraphics.drawCircle(x, y, 2);
            this.bodyGraphics.endFill();
        }
        
        // Belly stripes
        this.bodyGraphics.lineStyle(1, 0x654321);
        for (let i = 0; i < 4; i++) {
            const y = 4 + (i * 3);
            const width = (abdomenSize - 2) - (i * 1);
            this.bodyGraphics.moveTo(-width, y);
            this.bodyGraphics.lineTo(width, y);
        }
    }

    // Implement ant-specific animation using standard inheritance
    performAnimation() {
        this.animateLegs(); // Use standard leg animation inheritance
        this.animatePhatSheen();
        this.animatePhatChain();
        this.createPhatSparkle();
    }

    animateLegs() {
        if (!this.legs) return;
        
        this.legPhase += this.legAnimationSpeed;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') {
                phase += Math.PI;
            }
            
            const legMovement = Math.sin(phase) * 2;
            
            leg.clear();
            leg.lineStyle(1.5, 0x2A1B10);
            leg.moveTo(0, 0);
            
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

    animatePhatSheen() {
        if (!this.sheen) return;
        const t = Date.now() * 0.003;
        const oscillate = 0.9 + Math.sin(t) * 0.1;
        this.sheen.alpha = 0.12 + (Math.cos(t * 1.3) + 1) * 0.06;
        this.sheen.scale.set(oscillate, 1);
        this.sheen.x = Math.sin(t * 0.7) * 1.5;
    }

    animatePhatChain() {
        if (!this.chain) return;
        const t = Date.now() * 0.004;
        this.chain.rotation = Math.sin(t) * 0.05;
    }

    createPhatSparkle() {
        if (!this.parent) return;
        if (Math.random() < 0.03) {
            const sparkle = new PIXI.Graphics();
            sparkle.beginFill(0xFFF3B0, 0.9);
            sparkle.drawRect(0, 0, 1.2, 1.2);
            sparkle.endFill();
            sparkle.x = this.x + (Math.random() - 0.5) * 10;
            sparkle.y = this.y - 10 + (Math.random() - 0.5) * 4;
            sparkle.life = 18;
            this.parent.addChild(sparkle);
            const anim = () => {
                sparkle.life--;
                sparkle.alpha = sparkle.life / 18;
                sparkle.y -= 0.3;
                if (sparkle.life <= 0) {
                    if (sparkle.parent) sparkle.parent.removeChild(sparkle);
                } else { requestAnimationFrame(anim); }
            };
            anim();
        }
    }
    
    createLegs() {
        // Use standard ant leg system - reuse regular ant leg system
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
            
            this.drawLeg(leg);
            this.legsContainer.addChild(leg);
            this.legs.push(leg);
        }
        
        // Leg animation setup
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.2;
    }
    
    createFoodStorage() {
        // Visual food storage compartment
        this.foodStorageContainer = new PIXI.Container();
        this.addChild(this.foodStorageContainer);
    }
    
    drawLeg(leg) {
        leg.clear();
        leg.lineStyle(1.5, 0x2A1B10);
        
        leg.moveTo(0, 0);
        if (leg.side === 'left') {
            leg.lineTo(-4, 2);
        } else {
            leg.lineTo(4, 2);
        }
    }
    
    
    digestFood() {
        // Slowly convert some carried food into health/energy
        for (let i = this.carriedFood.length - 1; i >= 0; i--) {
            const food = this.carriedFood[i];
            if (food.digestProgress === undefined) {
                food.digestProgress = 0;
            }
            
            food.digestProgress += this.foodDigestionRate;
            
            // Fully digested food provides benefits
            if (food.digestProgress >= 1) {
                // Heal slightly
                this.hp = Math.min(this.maxHp, this.hp + (food.value * 2));
                this.updateHealthBar();
                
                // Remove digested food
                this.carriedFood.splice(i, 1);
                this.updateFatBody();
                
                // Create digestion effect
                this.createDigestionEffect();
            }
        }
    }
    
    createDigestionEffect() {
        const digest = new PIXI.Graphics();
        digest.beginFill(0x90EE90, 0.8);
        digest.drawCircle(0, 0, 2);
        digest.endFill();
        
        digest.x = this.x;
        digest.y = this.y;
        digest.vy = -1;
        digest.life = 20;
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(digest);
            
            const animateDigest = () => {
                digest.y += digest.vy;
                digest.life--;
                digest.alpha = digest.life / 20;
                
                if (digest.life <= 0) {
                    if (digest.parent) {
                        digest.parent.removeChild(digest);
                    }
                } else {
                    requestAnimationFrame(animateDigest);
                }
            };
            animateDigest();
        }
    }
    
    updateChargeAttack() {
        if (this.chargeCooldown > 0) {
            this.chargeCooldown--;
        } else {
            this.chargeAttackReady = true;
        }
    }
    
    // Override food collection to handle multiple items
    collectFood(food) {
        if (this.carriedFood.length >= this.capacity) return false;
        
        // Add food to carried items
        this.carriedFood.push({
            type: food.foodType,
            value: food.getValue(),
            color: food.foodType.color,
            digestProgress: 0
        });
        
        // Update visual appearance
        this.updateFatBody();
        
        return true;
    }
    
    // Override food delivery to handle multiple items
    deliverFood() {
        if (this.carriedFood.length === 0) return 0;
        
        let totalValue = 0;
        for (const food of this.carriedFood) {
            totalValue += food.value;
        }
        
        // Clear carried food
        this.carriedFood = [];
        this.updateFatBody();
        
        return totalValue;
    }
    
    // Find nearby enemies for charge attack
    findNearbyEnemies() {
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return [];
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        const nearbyEnemies = [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= 80) { // Large attack range
                nearbyEnemies.push(enemy);
            }
        }
        
        return nearbyEnemies;
    }
    
    // Charge attack - fat ant charges forward
    chargeAttack() {
        if (!this.chargeAttackReady || this._attackTimer > 0) return;
        
        const enemies = this.findNearbyEnemies();
        if (enemies.length === 0) return;
        
        // Start attack
        this._attackTimer = this.attackCooldown;
        this.chargeAttackReady = false;
        this.chargeCooldown = 300; // 5 second cooldown
        
        // Charge toward closest enemy
        const target = enemies[0];
        const angle = Math.atan2(target.y - this.y, target.x - this.x);
        
        // Apply charge momentum
        const chargeForce = 8;
        this.vx += Math.cos(angle) * chargeForce;
        this.vy += Math.sin(angle) * chargeForce;
        
        // Create charge effect
        this.createChargeEffect(angle);
        
        // Deal damage to all enemies in path
        for (const enemy of enemies) {
            if (enemy.takeDamage) {
                enemy.takeDamage(this.attackDamage);
            }
        }
    }
    
    createChargeEffect(angle) {
        // Charge dust trail
        for (let i = 0; i < 10; i++) {
            const dust = new PIXI.Graphics();
            dust.beginFill(0x8B7355, 0.8);
            dust.drawCircle(0, 0, 1 + Math.random() * 2);
            dust.endFill();
            
            dust.x = this.x - Math.cos(angle) * 10;
            dust.y = this.y - Math.sin(angle) * 10;
            
            const spread = (Math.random() - 0.5) * Math.PI / 3;
            const backwardAngle = angle + Math.PI + spread;
            const speed = 2 + Math.random() * 3;
            
            dust.vx = Math.cos(backwardAngle) * speed;
            dust.vy = Math.sin(backwardAngle) * speed;
            dust.life = 20 + Math.random() * 15;
            dust.maxLife = dust.life;
            
            if (IdleAnts.app && IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(dust);
                
                const animateChargeDust = () => {
                    dust.x += dust.vx;
                    dust.y += dust.vy;
                    dust.vx *= 0.95;
                    dust.vy *= 0.95;
                    dust.life--;
                    dust.alpha = dust.life / dust.maxLife;
                    
                    if (dust.life <= 0) {
                        if (dust.parent) {
                            dust.parent.removeChild(dust);
                        }
                    } else {
                        requestAnimationFrame(animateChargeDust);
                    }
                };
                animateChargeDust();
            }
        }
        
        // Screen shake from heavy charge
        if (IdleAnts.app && IdleAnts.app.cameraManager) {
            IdleAnts.app.cameraManager.shake(3, 150);
        }
    }
    
    // Override update method
    update(nestPosition, foods) {
        const actionResult = super.update(nestPosition, foods);
        
        // Update attack timer
        if (this._attackTimer > 0) {
            this._attackTimer--;
        }
        
        // Try charge attack
        if (this.chargeAttackReady) {
            this.chargeAttack();
        }
        return actionResult;
    }
    
    // Get debug info showing food carried
    getDebugInfo() {
        return {
            foodCarried: this.carriedFood.length,
            capacity: this.capacity,
            bulkLevel: this.bulkLevel.toFixed(2),
            chargeReady: this.chargeAttackReady
        };
    }
};
