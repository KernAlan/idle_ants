// src/entities/GasAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// Gas Ant - releases poisonous gas clouds when attacking
IdleAnts.Entities.GasAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Gas ants have normal speed
        super(texture, nestPosition, speedMultiplier, 1.0);
        
        // Get ant type configuration
        this.antType = IdleAnts.Data.AntTypes.GAS_ANT;
        
        // Defensive check for missing ant type data
        if (!this.antType) {
            console.error('GasAnt: Unable to find GAS_ANT configuration in IdleAnts.Data.AntTypes');
            // Provide fallback values
            this.antType = {
                color: 0x32CD32,
                glowColor: 0x90EE90,
                damage: 52,
                hp: 200,
                effect: 'gasCloud'
            };
        }
        
        // Apply properties from ant type
        this.tint = this.antType.color;
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        
        // Combat properties
        this.attackCooldown = 60; // frames
        this._attackTimer = 0;
        
        // Gas cloud properties
        this.gasCloudDuration = 300; // 5 seconds
        this.gasCloudRadius = 40;
        this.gasCloudDamage = 5; // DOT damage per frame
        
        // Visual properties
        this.gasEmissionCounter = 0;
        
        this.updateHealthBar();
    }
    
    // Override base scale
    getBaseScale() {
        return 0.8 + Math.random() * 0.3;
    }
    
    // Create type-specific visual elements
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
        this.createGasVents();
    }
    
    createBody() {
        const color = (this.antType && this.antType.color) || 0x00FF00;

        // Container to manage layering (glow behind, details above)
        this.bodyContainer = new PIXI.Container();

        // Soft back-glow: concentric circles for a gentle halo
        const glow = new PIXI.Graphics();
        for (let i = 0; i < 3; i++) {
            glow.beginFill(0x90EE90, 0.12 - i * 0.03);
            glow.drawCircle(0, 2, 18 + i * 4);
            glow.endFill();
        }
        glow.alpha = 0.4;
        this.bodyGlow = glow;
        this.bodyContainer.addChild(glow);

        // Core body
        const body = new PIXI.Graphics();
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

        // Subtle darker segmentation lines on abdomen
        body.lineStyle(1, 0x2E8B57, 0.6);
        for (let i = -2; i <= 2; i++) {
            body.drawEllipse(0, 8 + i * 2, 6.5, 9 - Math.abs(i));
        }

        // Small toxic spots on abdomen
        body.beginFill(0x7CFC00, 0.5);
        for (let i = 0; i < 3; i++) {
            body.drawCircle((i - 1) * 3, 6 + i, 1.2);
        }
        body.endFill();

        // Antennae
        body.lineStyle(1, 0x2A1B10, 0.9);
        body.moveTo(-2, -12); body.lineTo(-4, -16);
        body.moveTo(2, -12);  body.lineTo(4, -16);

        // Eyes with tiny highlights
        body.beginFill(0xF0FFF0, 0.9); body.drawCircle(-2, -10, 1.2); body.drawCircle(2, -10, 1.2); body.endFill();
        body.beginFill(0x103F10, 0.9); body.drawCircle(-2, -10, 0.5); body.drawCircle(2, -10, 0.5); body.endFill();
        body.beginFill(0xFFFFFF, 0.8); body.drawCircle(-1.6, -10.3, 0.2); body.drawCircle(1.6, -10.3, 0.2); body.endFill();

        this.bodyContainer.addChild(body);
        this.addChild(this.bodyContainer);
    }
    
    createLegs() {
        // Reuse regular ant leg system
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
        this.legAnimationSpeed = 0.25;
    }
    
    createGasVents() {
        // Create small vents on the abdomen that will emit gas
        this.gasVents = new PIXI.Container();
        
        // Create 3 small gas vents
        for (let i = 0; i < 3; i++) {
            const vent = new PIXI.Graphics();
            vent.beginFill(0x90EE90, 0.6); // Light green
            vent.drawCircle(0, 0, 1.5);
            vent.endFill();
            
            // Position vents along the abdomen
            vent.x = (i - 1) * 3;
            vent.y = 8 + (i * 2);
            
            this.gasVents.addChild(vent);
        }
        
        this.addChild(this.gasVents);
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
    
    // Enhanced gas-themed animations
    performAnimation() {
        this.animateLegs();
        this.animateGasVents();
        this.createGasParticles();
        this.createToxicAura();
        this.updateGasGlow();
        this.createGasTrail();
        this.createMiasmaSwirl();
        this.createSporeSparkles();
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
    
    animateGasVents() {
        if (!this.gasVents) return;
        
        this.gasEmissionCounter += 0.2;
        
        // Make vents pulse with gas emission
        for (let i = 0; i < this.gasVents.children.length; i++) {
            const vent = this.gasVents.children[i];
            const phase = this.gasEmissionCounter + (i * Math.PI / 2);
            const pulseFactor = 0.7 + Math.sin(phase) * 0.3;
            
            vent.scale.set(pulseFactor);
            vent.alpha = 0.4 + Math.sin(phase) * 0.3;
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
            
            if (distance <= 50) { // Close combat range
                nearbyEnemies.push(enemy);
            }
        }
        
        return nearbyEnemies;
    }
    
    // Attack with gas cloud emission
    attack() {
        if (this._attackTimer > 0) return;
        
        const enemies = this.findNearbyEnemies();
        if (enemies.length === 0) return;
        
        // Start attack cooldown
        this._attackTimer = this.attackCooldown;
        
        // Create gas cloud effect
        this.createGasCloud();
        
        // Deal immediate damage to nearby enemies
        for (const enemy of enemies) {
            if (enemy.takeDamage) {
                enemy.takeDamage(this.attackDamage);
            }
        }
    }
    
    createGasCloud() {
        if (!IdleAnts.app || !IdleAnts.app.effectManager) return;
        
        // Create visual gas cloud effect
        IdleAnts.app.effectManager.createEffect(
            'gasCloud',
            this.x,
            this.y,
            this.antType.glowColor,
            1.2,
            {
                duration: this.gasCloudDuration,
                radius: this.gasCloudRadius,
                damage: this.gasCloudDamage,
                color: this.antType.color
            }
        );
    }
    
    createGasParticles() {
        // Create visible gas particles around the ant
        if (Math.random() < 0.25 && IdleAnts.app && IdleAnts.app.stage) {
            const gas = new PIXI.Graphics();
            
            // Toxic green colors
            const gasColors = [0x32CD32, 0x90EE90, 0x7CFC00, 0x9ACD32];
            const color = gasColors[Math.floor(Math.random() * gasColors.length)];
            
            gas.beginFill(color, 0.6);
            gas.drawCircle(0, 0, 2 + Math.random() * 3);
            gas.endFill();
            
            // Position around the ant
            const angle = Math.random() * Math.PI * 2;
            const distance = 8 + Math.random() * 12;
            gas.x = this.x + Math.cos(angle) * distance;
            gas.y = this.y + Math.sin(angle) * distance;
            
            gas.vy = -0.5 - Math.random() * 0.5; // Rise upward
            gas.vx = (Math.random() - 0.5) * 1; // Horizontal drift
            gas.life = 40 + Math.random() * 20;
            gas.initialLife = gas.life;
            gas.rotationSpeed = (Math.random() - 0.5) * 0.05;
            
            IdleAnts.app.stage.addChild(gas);
            
            const animateGas = () => {
                gas.x += gas.vx;
                gas.y += gas.vy;
                gas.rotation += gas.rotationSpeed;
                gas.life--;
                gas.alpha = (gas.life / gas.initialLife) * 0.6;
                gas.scale.set(1 + (1 - gas.life / gas.initialLife) * 1.5);
                
                if (gas.life <= 0) {
                    if (gas.parent) {
                        gas.parent.removeChild(gas);
                    }
                } else {
                    requestAnimationFrame(animateGas);
                }
            };
            animateGas();
        }
    }

    createToxicAura() {
        // Create toxic aura warning effect
        if (Math.random() < 0.1 && IdleAnts.app && IdleAnts.app.stage) {
            const aura = new PIXI.Graphics();
            
            // Create toxic warning rings
            const colors = [0x32CD32, 0x90EE90, 0x7CFC00];
            for (let i = 0; i < 3; i++) {
                aura.lineStyle(2 - i, colors[i], 0.4 - i * 0.1);
                aura.drawCircle(this.x, this.y, 15 + i * 8);
            }
            
            aura.life = 20 + Math.random() * 15;
            aura.initialLife = aura.life;
            
            IdleAnts.app.stage.addChild(aura);
            
            const animateAura = () => {
                aura.life--;
                aura.alpha = (aura.life / aura.initialLife) * 0.4;
                aura.scale.set(1 + (1 - aura.life / aura.initialLife) * 0.5);
                
                if (aura.life <= 0) {
                    if (aura.parent) {
                        aura.parent.removeChild(aura);
                    }
                } else {
                    requestAnimationFrame(animateAura);
                }
            };
            animateAura();
        }
    }

    updateGasGlow() {
        // Create toxic green glow that pulses
        const time = Date.now() * 0.006;
        const glow = Math.sin(time) * 0.3 + 0.7;
        
        // Toxic green glow
        const green = Math.floor(255 * glow);
        const red = Math.floor(green * 0.5); // Less red for more green
        this.tint = (red << 16) | (green << 8) | 0x00;

        // Pulse the back glow subtly
        if (this.bodyGlow) {
            const pulse = 0.95 + Math.sin(time * 0.8) * 0.05;
            this.bodyGlow.scale.set(pulse);
            this.bodyGlow.alpha = 0.35 + Math.sin(time * 0.6) * 0.1;
        }
    }

    // Gentle, translucent gas trail when moving
    createGasTrail() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0.6 && Math.random() < 0.12 && this.parent) {
            const wisp = new PIXI.Graphics();
            const colors = [0x90EE90, 0x9ACD32, 0x7CFC00];
            const color = colors[Math.floor(Math.random() * colors.length)];

            wisp.beginFill(color, 0.35);
            wisp.drawEllipse(0, 0, 3 + Math.random() * 3, 2 + Math.random() * 2);
            wisp.endFill();

            const angle = Math.atan2(this.vy, this.vx) + Math.PI; // behind
            const dist = 10 + Math.random() * 6;
            wisp.x = this.x + Math.cos(angle) * dist;
            wisp.y = this.y + Math.sin(angle) * dist;

            wisp.vx = (Math.random() - 0.5) * 0.6;
            wisp.vy = -0.4 - Math.random() * 0.3;
            wisp.life = 28; wisp.initialLife = 28;

            this.parent.addChild(wisp);
            const animate = () => {
                wisp.x += wisp.vx;
                wisp.y += wisp.vy;
                wisp.life--;
                wisp.alpha = wisp.life / wisp.initialLife * 0.35;
                wisp.scale.set(1 + (1 - wisp.life / wisp.initialLife) * 0.6);
                if (wisp.life <= 0) {
                    if (wisp.parent) wisp.parent.removeChild(wisp);
                } else { requestAnimationFrame(animate); }
            };
            animate();
        }
    }

    // Slow, wispy swirl around the ant
    createMiasmaSwirl() {
        if (Math.random() < 0.02 && this.parent) {
            const swirl = new PIXI.Graphics();
            swirl.lineStyle(1, 0x98FB98, 0.5);
            for (let i = 0; i < 10; i++) {
                const r = 6 + i;
                swirl.drawCircle(0, 0, r);
            }
            swirl.x = this.x; swirl.y = this.y;
            swirl.life = 36; swirl.rotationSpeed = 0.03;
            this.parent.addChild(swirl);
            const animate = () => {
                swirl.rotation += swirl.rotationSpeed;
                swirl.life--;
                swirl.alpha = swirl.life / 36 * 0.5;
                if (swirl.life <= 0) {
                    if (swirl.parent) swirl.parent.removeChild(swirl);
                } else { requestAnimationFrame(animate); }
            };
            animate();
        }
    }

    // Tiny sparkles that hint at toxicity
    createSporeSparkles() {
        if (Math.random() < 0.08 && this.parent) {
            const sparkle = new PIXI.Graphics();
            sparkle.beginFill(0xCCFF99, 0.8);
            sparkle.drawRect(0, 0, 1.5, 1.5);
            sparkle.endFill();
            sparkle.x = this.x + (Math.random() - 0.5) * 12;
            sparkle.y = this.y + (Math.random() - 0.5) * 8;
            sparkle.life = 20;
            this.parent.addChild(sparkle);
            const animate = () => {
                sparkle.life--;
                sparkle.alpha = sparkle.life / 20;
                sparkle.y -= 0.4;
                if (sparkle.life <= 0) {
                    if (sparkle.parent) sparkle.parent.removeChild(sparkle);
                } else { requestAnimationFrame(animate); }
            };
            animate();
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
