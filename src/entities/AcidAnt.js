// src/entities/AcidAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// Acid Ant - leaves acid puddles that damage enemies over time
IdleAnts.Entities.AcidAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Acid ants have normal speed
        super(texture, nestPosition, speedMultiplier, 1.0);
        
        // Get ant type configuration
        this.antType = IdleAnts.Data.AntTypes.ACID_ANT;
        
        // Defensive check for missing ant type data
        if (!this.antType) {
            console.error('AcidAnt: Unable to find ACID_ANT configuration in IdleAnts.Data.AntTypes');
            // Provide fallback values
            this.antType = {
                color: 0xFFFF00,
                glowColor: 0xFFFACD,
                damage: 40,
                hp: 250,
                effect: 'acidPuddle'
            };
        }
        
        // Apply properties from ant type
        this.tint = this.antType.color;
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        
        // Combat properties
        this.attackCooldown = 80; // frames
        this._attackTimer = 0;
        
        // Acid puddle properties
        this.acidPuddleDuration = 600; // 10 seconds
        this.acidPuddleRadius = 30;
        this.acidPuddleDamage = 3; // DOT damage per frame
        
        // Visual properties
        this.acidDripCounter = 0;
        this.acidTrail = [];
        
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
        this.createAcidSacs();
    }
    
    createBody() {
        const color = (this.antType && this.antType.color) || 0xFFFF00;

        // Container to manage layers
        this.bodyContainer = new PIXI.Container();

        // Back glow halo (soft acid radiance)
        const glow = new PIXI.Graphics();
        for (let i = 0; i < 3; i++) {
            glow.beginFill(0xFFFACD, 0.12 - i * 0.03);
            glow.drawCircle(0, 2, 16 + i * 4);
            glow.endFill();
        }
        glow.alpha = 0.35;
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

        // Hazard chevrons on abdomen
        body.lineStyle(1, 0xB8860B, 0.7);
        for (let i = -2; i <= 2; i++) {
            const y = 6 + i * 2;
            body.moveTo(-5, y);
            body.lineTo(-2, y - 1);
            body.moveTo(2, y - 1);
            body.lineTo(5, y);
        }

        // Antennae
        body.lineStyle(1, 0x2A1B10);
        body.moveTo(-2, -12); body.lineTo(-4, -16);
        body.moveTo(2, -12);  body.lineTo(4, -16);

        // Eyes with small highlight
        body.beginFill(0x222222, 0.9); body.drawCircle(-2, -9, 0.8); body.drawCircle(2, -9, 0.8); body.endFill();
        body.beginFill(0xFFFFFF, 0.9); body.drawCircle(-1.7, -9.2, 0.2); body.drawCircle(1.7, -9.2, 0.2); body.endFill();

        this.bodyContainer.addChild(body);

        // Subtle specular sheen on abdomen
        const sheen = new PIXI.Graphics();
        sheen.beginFill(0xFFFFFF, 0.12);
        sheen.drawEllipse(-2, 4, 4.5, 1.8);
        sheen.endFill();
        this.bodySheen = sheen;
        this.bodyContainer.addChild(sheen);

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
    
    createAcidSacs() {
        // Create acid storage sacs on the abdomen
        this.acidSacs = new PIXI.Container();
        
        // Create 2 visible acid sacs
        for (let i = 0; i < 2; i++) {
            const sac = new PIXI.Graphics();
            const glowColor = (this.antType && this.antType.glowColor) || 0xFFFACD;
            sac.beginFill(glowColor, 0.7);
            sac.drawCircle(0, 0, 2.5);
            sac.endFill();
            
            // Position sacs on sides of abdomen
            sac.x = (i === 0) ? -5 : 5;
            sac.y = 8;
            
            this.acidSacs.addChild(sac);
        }
        
        this.addChild(this.acidSacs);
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
    
    // Enhanced acid-themed animations
    performAnimation() {
        this.animateLegs();
        this.animateAcidSacs();
        this.createAcidDrips();
        this.createAcidBubbles();
        this.createCorrosiveAura();
        this.updateAcidGlow();
        this.createAcidTrail();
        this.createPittingSpecks();
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
    
    animateAcidSacs() {
        if (!this.acidSacs) return;
        
        this.acidDripCounter += 0.15;
        
        // Make acid sacs pulse
        for (let i = 0; i < this.acidSacs.children.length; i++) {
            const sac = this.acidSacs.children[i];
            const phase = this.acidDripCounter + (i * Math.PI);
            const pulseFactor = 0.8 + Math.sin(phase) * 0.2;
            
            sac.scale.set(pulseFactor);
            sac.alpha = 0.5 + Math.sin(phase) * 0.3;
        }
    }
    
    createAcidDrips() {
        // Occasionally create small acid drip effects while moving
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        
        if (speed > 0.5 && Math.random() < 0.02) {
            this.createSmallAcidDroplet();
        }
    }
    
    createSmallAcidDroplet() {
        if (!IdleAnts.app || !IdleAnts.app.effectManager) return;
        
        // Create a small acid droplet effect
        IdleAnts.app.effectManager.createEffect(
            'acidDrip',
            this.x + (Math.random() - 0.5) * 10,
            this.y + 8,
            this.antType.color,
            0.3,
            {
                duration: 60,
                fadeOut: true
            }
        );
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
            
            if (distance <= 45) { // Close combat range
                nearbyEnemies.push(enemy);
            }
        }
        
        return nearbyEnemies;
    }
    
    // Attack by spitting acid and creating puddles
    attack() {
        if (this._attackTimer > 0) return;
        
        const enemies = this.findNearbyEnemies();
        if (enemies.length === 0) return;
        
        // Start attack cooldown
        this._attackTimer = this.attackCooldown;
        
        // Create acid puddle at current location
        this.createAcidPuddle();
        
        // Deal immediate damage to nearby enemies
        for (const enemy of enemies) {
            if (enemy.takeDamage) {
                enemy.takeDamage(this.attackDamage);
            }
        }
    }
    
    createAcidPuddle() {
        if (!IdleAnts.app || !IdleAnts.app.effectManager) return;
        
        // Create persistent acid puddle effect
        IdleAnts.app.effectManager.createEffect(
            'acidPuddle',
            this.x,
            this.y,
            this.antType.color,
            1.0,
            {
                duration: this.acidPuddleDuration,
                radius: this.acidPuddleRadius,
                damage: this.acidPuddleDamage,
                color: this.antType.color,
                glowColor: this.antType.glowColor
            }
        );
    }
    
    createAcidBubbles() {
        // Create bubbling acid effects around the ant
        if (Math.random() < 0.2 && IdleAnts.app && IdleAnts.app.stage) {
            const bubble = new PIXI.Graphics();
            
            // Acidic yellow-green colors
            const acidColors = [0xFFFF00, 0xFFFF80, 0xFFD700, 0xADFF2F];
            const color = acidColors[Math.floor(Math.random() * acidColors.length)];
            
            bubble.beginFill(color, 0.7);
            bubble.drawCircle(0, 0, 1 + Math.random() * 2);
            bubble.endFill();
            
            // Position around the ant
            bubble.x = this.x + (Math.random() - 0.5) * 15;
            bubble.y = this.y + 8 + Math.random() * 5;
            
            bubble.vy = -0.3 - Math.random() * 0.4; // Rise upward like bubbles
            bubble.vx = (Math.random() - 0.5) * 0.5;
            bubble.life = 30 + Math.random() * 15;
            bubble.initialLife = bubble.life;
            bubble.popChance = 0.02;
            
            IdleAnts.app.stage.addChild(bubble);
            
            const animateBubble = () => {
                // BUGFIX: Check if bubble still has a parent before continuing animation
                if (!bubble.parent) {
                    return; // Stop animation if parent was removed
                }

                bubble.x += bubble.vx;
                bubble.y += bubble.vy;
                bubble.life--;
                bubble.alpha = (bubble.life / bubble.initialLife) * 0.7;

                // Chance to "pop" with a small effect
                if (Math.random() < bubble.popChance) {
                    bubble.scale.set(bubble.scale.x * 1.5);
                    bubble.alpha *= 0.5;
                    bubble.life = Math.min(bubble.life, 5);
                }

                if (bubble.life <= 0) {
                    if (bubble.parent) {
                        bubble.parent.removeChild(bubble);
                    }
                } else {
                    requestAnimationFrame(animateBubble);
                }
            };
            requestAnimationFrame(animateBubble); // BUGFIX: Use requestAnimationFrame for consistency
        }
    }

    createCorrosiveAura() {
        // Create corrosive warning aura
        if (Math.random() < 0.08 && IdleAnts.app && IdleAnts.app.stage) {
            const aura = new PIXI.Graphics();
            
            // Create acid warning effect
            aura.lineStyle(2, 0xFFFF00, 0.5);
            aura.drawCircle(this.x, this.y, 20);
            aura.lineStyle(1, 0xFFA500, 0.3);
            aura.drawCircle(this.x, this.y, 25);
            
            aura.life = 25 + Math.random() * 15;
            aura.initialLife = aura.life;
            
            IdleAnts.app.stage.addChild(aura);
            
            const animateAura = () => {
                // BUGFIX: Check if aura still has a parent before continuing animation
                if (!aura.parent) {
                    return; // Stop animation if parent was removed
                }

                aura.life--;
                aura.alpha = (aura.life / aura.initialLife) * 0.5;
                aura.rotation += 0.05;

                if (aura.life <= 0) {
                    if (aura.parent) {
                        aura.parent.removeChild(aura);
                    }
                } else {
                    requestAnimationFrame(animateAura);
                }
            };
            requestAnimationFrame(animateAura); // BUGFIX: Use requestAnimationFrame for consistency
        }
    }

    updateAcidGlow() {
        // Pulsing acid-yellow tint and back glow
        const time = Date.now() * 0.008;
        const glow = Math.sin(time) * 0.35 + 0.65;
        const yellow = Math.floor(255 * glow);
        const red = Math.floor(yellow * 0.7);
        this.tint = (red << 16) | (yellow << 8) | 0x00;

        if (this.bodyGlow) {
            const pulse = 0.95 + Math.sin(time * 0.9) * 0.05;
            this.bodyGlow.scale.set(pulse);
            this.bodyGlow.alpha = 0.3 + Math.sin(time * 0.6) * 0.1;
        }
        if (this.bodySheen) {
            this.bodySheen.alpha = 0.10 + (Math.cos(time * 1.2) + 1) * 0.05;
            this.bodySheen.x = Math.sin(time * 0.6) * 1.2;
        }
    }

    // Small, short-lived acid footprints behind the ant
    createAcidTrail() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0.6 && Math.random() < 0.10 && this.parent) {
            const drop = new PIXI.Graphics();
            const colors = [0xFFF68F, 0xFFFACD, 0xFFFF66];
            const color = colors[Math.floor(Math.random() * colors.length)];
            drop.beginFill(color, 0.5);
            drop.drawEllipse(0, 0, 2 + Math.random() * 2, 1 + Math.random() * 1.5);
            drop.endFill();

            const angle = Math.atan2(this.vy, this.vx) + Math.PI;
            const dist = 8 + Math.random() * 6;
            drop.x = this.x + Math.cos(angle) * dist;
            drop.y = this.y + Math.sin(angle) * dist + 6;

            drop.life = 26; drop.initialLife = 26;
            drop.vy = 0; drop.vx = (Math.random() - 0.5) * 0.3;

            this.parent.addChild(drop);
            const animate = () => {
                // BUGFIX: Check if drop still has a parent before continuing animation
                if (!drop.parent) {
                    return; // Stop animation if parent was removed
                }

                drop.x += drop.vx;
                drop.life--;
                drop.alpha = drop.life / drop.initialLife * 0.5;
                drop.scale.set(1 + (1 - drop.life / drop.initialLife) * 0.4);
                if (drop.life <= 0) {
                    if (drop.parent) drop.parent.removeChild(drop);
                } else { requestAnimationFrame(animate); }
            };
            requestAnimationFrame(animate); // BUGFIX: Use requestAnimationFrame for consistency
        }
    }

    // Tiny pitting specks to suggest corrosion
    createPittingSpecks() {
        if (Math.random() < 0.06 && this.parent) {
            const speck = new PIXI.Graphics();
            speck.beginFill(0xBDB76B, 0.9);
            speck.drawRect(0, 0, 1, 1);
            speck.endFill();
            speck.x = this.x + (Math.random() - 0.5) * 10;
            speck.y = this.y + 4 + (Math.random() - 0.5) * 4;
            speck.life = 18;
            this.parent.addChild(speck);
            const animate = () => {
                // BUGFIX: Check if speck still has a parent before continuing animation
                if (!speck.parent) {
                    return; // Stop animation if parent was removed
                }

                speck.life--;
                speck.alpha = speck.life / 18;
                if (speck.life <= 0) {
                    if (speck.parent) speck.parent.removeChild(speck);
                } else { requestAnimationFrame(animate); }
            };
            requestAnimationFrame(animate); // BUGFIX: Use requestAnimationFrame for consistency
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
