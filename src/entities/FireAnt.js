// src/entities/FireAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// FireAnt – fast ground ant with fiery colouring
IdleAnts.Entities.FireAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Fire ants are 1.6× faster than regular ants
        super(texture, nestPosition, speedMultiplier, 1.3);

        // Bright red to visually distinguish Fire Ants
        this.tint = 0xFF0000;

        // Combat-related placeholders (future implementation)
        this.attackDamage = 20; // Reduced attack power (was 25, now 20% less)
        this.attackCooldown = 60; // frames
        this._attackTimer = 0;

        // Override HP calculation for doubled health again
        const baseHp = 300; // 2x the previous 150 HP
        const strengthMultiplier = IdleAnts.app && IdleAnts.app.resourceManager ? 
            IdleAnts.app.resourceManager.stats.strengthMultiplier : 1;
        this.maxHp = baseHp + (strengthMultiplier - 1) * 150; // Doubled HP scaling per strength level
        this.hp = this.maxHp;
        this.updateHealthBar();

        // Leg animation setup (reuse regular ant behaviour)
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.25;
    }

    // Override base scale slightly larger
    getBaseScale() {
        return 0.9 + Math.random() * 0.2;
    }

    // Create bright-red body overlay then legs
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
    }

    createBody() {
        const body = new PIXI.Graphics();

        // Abdomen
        body.beginFill(0xFF0000);
        body.drawEllipse(0, 8, 7, 10);
        body.endFill();

        // Thorax
        body.beginFill(0xD80000);
        body.drawEllipse(0, -2, 5, 7);
        body.endFill();

        // Head
        body.beginFill(0xB00000);
        body.drawCircle(0, -14, 5);
        body.endFill();

        // Simple eyes for contrast
        body.beginFill(0xFFFFFF);
        body.drawCircle(-2, -15, 1.2);
        body.drawCircle(2, -15, 1.2);
        body.endFill();

        this.addChild(body);
    }

    createLegs() {
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);

        this.legs = [];
        const legPositions = [ {x: 0, y: -8}, {x: 0, y: -2}, {x: 0, y: 6} ];

        for (let i = 0; i < 3; i++) {
            // Left leg
            const leftLeg = new PIXI.Graphics();
            leftLeg.lineStyle(1.5, 0x8B2500); // Darker orange
            leftLeg.moveTo(0, 0);
            leftLeg.lineTo(-8, -5);
            leftLeg.position.set(-5, legPositions[i].y);
            leftLeg.baseY = legPositions[i].y;
            leftLeg.index = i;
            leftLeg.side = 'left';

            // Right leg
            const rightLeg = new PIXI.Graphics();
            rightLeg.lineStyle(1.5, 0x8B2500);
            rightLeg.moveTo(0, 0);
            rightLeg.lineTo(8, -5);
            rightLeg.position.set(5, legPositions[i].y);
            rightLeg.baseY = legPositions[i].y;
            rightLeg.index = i;
            rightLeg.side = 'right';

            this.legsContainer.addChild(leftLeg);
            this.legsContainer.addChild(rightLeg);
            this.legs.push(leftLeg, rightLeg);
        }
    }

    performAnimation() {
        this.animateLegs();
        this.createFlameTrail();
        this.updateGlow();
        this.createSmokeParticles();
        this.createHeatWave();
        
        // Reduced-intensity flair effects
        this.createFlameExplosions();
        this.createFireTornado();
        this.createMoltenLavaTrail();
        this.createPhoenixTransformation();
        this.createInfernoAura();
        this.createFlameWords();

        // Decrement attack timer if active (preparation for combat system)
        if (this._attackTimer > 0) this._attackTimer--;
    }

    animateLegs() {
        this.legPhase += this.legAnimationSpeed;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const animationRate = Math.max(0.1, speed * 0.35);

        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') phase += Math.PI;

            const legMovement = Math.sin(phase * animationRate) * 2;
            leg.clear();
            leg.lineStyle(1.5, 0x8B2500);
            leg.moveTo(0, 0);

            const bendFactor = Math.max(0, -Math.sin(phase));
            const midX = (leg.side === 'left' ? -4 : 4) - bendFactor * 2 * (leg.side === 'left' ? 1 : -1);
            const midY = legMovement - 2 - bendFactor * 2;
            const endX = (leg.side === 'left' ? -8 : 8);
            leg.lineTo(midX, midY);
            leg.lineTo(endX, -5 + legMovement);
        }
    }

    // Placeholder for future combat bite action
    bite(target) {
        if (this._attackTimer === 0) {
            // TODO: integrate with CombatManager to apply damage to target
            this._attackTimer = this.attackCooldown;
        }
    }

    createFlameTrail() {
        // Create flame trail particles behind the ant when moving
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0.5 && Math.random() < 0.3 && this.parent) {
            const flame = new PIXI.Graphics();
            
            // Random flame colors
            const flameColors = [0xFF4500, 0xFF6347, 0xFF0000, 0xFFD700, 0xFFA500];
            const color = flameColors[Math.floor(Math.random() * flameColors.length)];
            
            flame.beginFill(color, 0.8);
            flame.drawEllipse(0, 0, 2 + Math.random() * 3, 4 + Math.random() * 4);
            flame.endFill();
            
            // Position behind the ant
            const trailDistance = 12 + Math.random() * 8;
            const angle = Math.atan2(this.vy, this.vx) + Math.PI; // Opposite direction
            flame.x = this.x + Math.cos(angle) * trailDistance;
            flame.y = this.y + Math.sin(angle) * trailDistance;
            
            flame.life = 15 + Math.random() * 10;
            flame.initialLife = flame.life;
            flame.vy = -0.5 - Math.random() * 0.5; // Rise upward
            flame.vx = (Math.random() - 0.5) * 2; // Slight horizontal drift
            
            this.parent.addChild(flame);
            
            const animateFlame = () => {
                flame.x += flame.vx;
                flame.y += flame.vy;
                flame.life--;
                flame.alpha = flame.life / flame.initialLife;
                flame.scale.set(1 + (1 - flame.life / flame.initialLife) * 0.5);
                
                if (flame.life <= 0) {
                    if (flame.parent) {
                        flame.parent.removeChild(flame);
                    }
                } else {
                    requestAnimationFrame(animateFlame);
                }
            };
            animateFlame();
        }
    }

    updateGlow() {
        // Pulsing glow effect
        const time = Date.now() * 0.005;
        const glowIntensity = 0.8 + Math.sin(time) * 0.2;
        
        // Create a subtle glow by adjusting tint brightness
        const baseRed = 0xFF;
        const pulsedRed = Math.min(255, baseRed * glowIntensity);
        this.tint = (pulsedRed << 16) | (0x20 << 8) | 0x00; // Pulsing red with hint of orange
    }

    createSmokeParticles() {
        // Occasional smoke puffs
        if (Math.random() < 0.08 && this.parent) {
            const smoke = new PIXI.Graphics();
            smoke.beginFill(0x555555, 0.6);
            smoke.drawCircle(0, 0, 1 + Math.random() * 2);
            smoke.endFill();
            
            smoke.x = this.x + (Math.random() - 0.5) * 10;
            smoke.y = this.y + (Math.random() - 0.5) * 8;
            smoke.vy = -1 - Math.random() * 0.5;
            smoke.vx = (Math.random() - 0.5) * 1;
            smoke.life = 25 + Math.random() * 15;
            smoke.initialLife = smoke.life;
            
            this.parent.addChild(smoke);
            
            const animateSmoke = () => {
                smoke.x += smoke.vx;
                smoke.y += smoke.vy;
                smoke.life--;
                smoke.alpha = (smoke.life / smoke.initialLife) * 0.6;
                smoke.scale.set(1 + (1 - smoke.life / smoke.initialLife) * 2);
                
                if (smoke.life <= 0) {
                    if (smoke.parent) {
                        smoke.parent.removeChild(smoke);
                    }
                } else {
                    requestAnimationFrame(animateSmoke);
                }
            };
            animateSmoke();
        }
    }

    createHeatWave() {
        // Heat wave distortion effect around the ant
        if (Math.random() < 0.15 && this.parent) {
            const heatWave = new PIXI.Graphics();
            heatWave.lineStyle(1, 0xFFAAAA, 0.4);
            
            // Create wavy heat lines
            const waveCount = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < waveCount; i++) {
                const startX = (Math.random() - 0.5) * 20;
                const startY = 10 + Math.random() * 10;
                heatWave.moveTo(startX, startY);
                
                // Create wavy line going upward
                for (let j = 1; j <= 8; j++) {
                    const waveX = startX + Math.sin(j * 0.8) * 3;
                    const waveY = startY - j * 2;
                    heatWave.lineTo(waveX, waveY);
                }
            }
            
            heatWave.x = this.x;
            heatWave.y = this.y;
            heatWave.life = 20;
            heatWave.initialLife = heatWave.life;
            
            this.parent.addChild(heatWave);
            
            const animateHeatWave = () => {
                heatWave.y -= 0.5;
                heatWave.life--;
                heatWave.alpha = heatWave.life / heatWave.initialLife * 0.4;
                
                if (heatWave.life <= 0) {
                    if (heatWave.parent) {
                        heatWave.parent.removeChild(heatWave);
                    }
                } else {
                    requestAnimationFrame(animateHeatWave);
                }
            };
            animateHeatWave();
        }
    }

    createFlameExplosions() {
        // Subtle micro-bursts: rarer, smaller, fewer
        if (Math.random() < 0.02 && this.parent) {
            const bursts = 3 + Math.floor(Math.random() * 2); // 3–4
            for (let i = 0; i < bursts; i++) {
                const explosion = new PIXI.Graphics();
                const size = 2 + Math.random() * 4;
                const colors = [0xFF4500, 0xFF6347, 0xFFA500];
                const color = colors[Math.floor(Math.random() * colors.length)];

                explosion.beginFill(color, 0.7);
                explosion.drawCircle(0, 0, size);
                explosion.endFill();

                const angle = Math.random() * Math.PI * 2;
                const distance = 6 + Math.random() * 16; // tighter radius
                explosion.x = this.x + Math.cos(angle) * distance;
                explosion.y = this.y + Math.sin(angle) * distance;
                explosion.life = 14;

                this.parent.addChild(explosion);

                const animateExplosion = () => {
                    explosion.life--;
                    explosion.scale.set(1 + (1 - explosion.life / 14) * 0.8);
                    explosion.alpha = explosion.life / 14;

                    if (explosion.life <= 0) {
                        if (explosion.parent) explosion.parent.removeChild(explosion);
                    } else {
                        requestAnimationFrame(animateExplosion);
                    }
                };
                animateExplosion();
            }
        }
    }

    createFireTornado() {
        // Very rare, smaller tornado
        if (Math.random() < 0.01 && this.parent) {
            const tornado = new PIXI.Graphics();
            for (let i = 0; i < 6; i++) {
                const height = i * 6;
                const radius = 2 + (6 - i) * 0.8;
                const color = [0xFF4500, 0xFFD700][i % 2];
                tornado.lineStyle(1, color, 0.6);
                tornado.drawCircle(0, -height, radius);
            }
            tornado.x = this.x;
            tornado.y = this.y;
            tornado.life = 30;
            tornado.spinSpeed = 0.2;
            this.parent.addChild(tornado);
            const animateTornado = () => {
                tornado.rotation += tornado.spinSpeed;
                tornado.life--;
                tornado.alpha = tornado.life / 30;
                if (tornado.life <= 0) {
                    if (tornado.parent) tornado.parent.removeChild(tornado);
                } else {
                    requestAnimationFrame(animateTornado);
                }
            };
            animateTornado();
        }
    }

    createMoltenLavaTrail() {
        // Smaller, less frequent puddles
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.2 && Math.random() < 0.02 && this.parent) {
            const lava = new PIXI.Graphics();
            lava.beginFill(0xFF4500, 0.6);
            lava.drawEllipse(0, 0, 5 + Math.random() * 6, 3 + Math.random() * 3);
            lava.endFill();
            for (let i = 0; i < 3; i++) {
                lava.beginFill(0xFFD700, 0.5);
                lava.drawCircle((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, 1 + Math.random());
                lava.endFill();
            }
            lava.x = this.x;
            lava.y = this.y + 8;
            lava.life = 60;
            this.parent.addChild(lava);
            const animateLava = () => {
                lava.life--;
                lava.alpha = lava.life / 60 * 0.6;
                lava.scale.set(1 + Math.sin(Date.now() * 0.01) * 0.05);
                if (lava.life <= 0) {
                    if (lava.parent) lava.parent.removeChild(lava);
                } else {
                    requestAnimationFrame(animateLava);
                }
            };
            animateLava();
        }
    }

    createPhoenixTransformation() {
        // Rare, shorter wings
        if (Math.random() < 0.003 && this.parent) {
            const wing1 = new PIXI.Graphics();
            const wing2 = new PIXI.Graphics();
            
            // Draw phoenix wings
            wing1.beginFill(0xFF4500, 0.7);
            wing1.moveTo(0, 0);
            wing1.lineTo(-20, -15);
            wing1.lineTo(-25, -5);
            wing1.lineTo(-15, 5);
            wing1.lineTo(0, 0);
            wing1.endFill();
            
            wing2.beginFill(0xFF4500, 0.7);
            wing2.moveTo(0, 0);
            wing2.lineTo(20, -15);
            wing2.lineTo(25, -5);
            wing2.lineTo(15, 5);
            wing2.lineTo(0, 0);
            wing2.endFill();
            
            wing1.x = this.x;
            wing1.y = this.y;
            wing2.x = this.x;
            wing2.y = this.y;
            
            wing1.life = wing2.life = 45;
            
            this.parent.addChild(wing1);
            this.parent.addChild(wing2);
            
            const animateWings = () => {
                wing1.life--;
                wing2.life--;
                
                // Gentle flapping
                const flap = Math.sin(Date.now() * 0.02) * 0.3;
                wing1.rotation = flap;
                wing2.rotation = -flap;
                
                wing1.alpha = wing2.alpha = wing1.life / 45 * 0.6;
                
                if (wing1.life <= 0) {
                    if (wing1.parent) wing1.parent.removeChild(wing1);
                    if (wing2.parent) wing2.parent.removeChild(wing2);
                } else {
                    requestAnimationFrame(animateWings);
                }
            };
            animateWings();
        }
    }


    createInfernoAura() {
        // Subtle rotating aura, much less frequent
        if (Math.random() < 0.02 && this.parent) {
            const aura = new PIXI.Graphics();
            
            // Fewer, thinner rings
            for (let i = 0; i < 3; i++) {
                const radius = 14 + i * 6;
                const color = [0xFF4500, 0xFFD700, 0xFF6347][i % 3];
                aura.lineStyle(1.5, color, 0.5 - i * 0.1);
                aura.drawCircle(0, 0, radius);
            }
            
            aura.x = this.x;
            aura.y = this.y;
            aura.life = 24;
            this.parent.addChild(aura);
            
            const animateAura = () => {
                aura.life--;
                aura.rotation += 0.06;
                aura.alpha = aura.life / 24 * 0.5;
                aura.scale.set(1 + (1 - aura.life / 24) * 0.8);
                
                if (aura.life <= 0) {
                    if (aura.parent) aura.parent.removeChild(aura);
                } else {
                    requestAnimationFrame(animateAura);
                }
            };
            animateAura();
        }
    }

    createFlameWords() {
        // Disable by default (kept as a rare easter egg)
        if (Math.random() < 0.001 && this.parent) {
            const words = ["HOT!", "FIRE!", "BURN!", "SIZZLE!", "INFERNO!", "BLAZE!"];
            const word = words[Math.floor(Math.random() * words.length)];
            
            // Create text effect (simplified as graphics since we don't have fonts)
            const text = new PIXI.Graphics();
            text.beginFill(0xFF4500, 0.8);
            
            // Simple letter shapes (just rectangles for simplicity)
            for (let i = 0; i < word.length; i++) {
                text.drawRect(i * 8, 0, 6, 12);
                if (Math.random() < 0.5) text.drawRect(i * 8, 6, 6, 2);
            }
            text.endFill();
            
            text.x = this.x + (Math.random() - 0.5) * 40;
            text.y = this.y - 20;
            text.vy = -1.5;
            text.life = 30;
            
            this.parent.addChild(text);
            
            const animateText = () => {
                text.y += text.vy;
                text.life--;
                text.alpha = text.life / 30;
                text.rotation += 0.03;
                
                if (text.life <= 0) {
                    if (text.parent) text.parent.removeChild(text);
                } else {
                    requestAnimationFrame(animateText);
                }
            };
            animateText();
        }
    }
}; 
