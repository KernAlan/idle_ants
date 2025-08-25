// src/entities/CarAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

IdleAnts.Entities.CarAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // CarAnts are super fast! Let's give them a high speedFactor.
        // Assuming FlyingAnts might be around 5-10, let's make this 15.
        super(texture, nestPosition, speedMultiplier, 5); // High speedFactor

        // CRITICAL: Ensure position is set directly at the nest
        this.x = nestPosition.x;
        this.y = nestPosition.y;

        // Car-specific properties
        this.wheelRotationSpeed = 0.5; // Radians per frame

        // Car ants might have a more fixed or different turn speed
        this.turnSpeed = 0.2;
        
        // Override combat stats - nearly as powerful as Fire Ants
        const baseHp = 250; // Slightly less than Fire Ant's 300 HP
        const strengthMultiplier = IdleAnts.app && IdleAnts.app.resourceManager ? 
            IdleAnts.app.resourceManager.stats.strengthMultiplier : 1;
        this.maxHp = baseHp + (strengthMultiplier - 1) * 125; // High HP scaling per strength level
        this.hp = this.maxHp;
        this.updateHealthBar();
        
        this.attackDamage = 20; // Slightly less than Fire Ant's 25 attack power 
    }

    // Override to set a potentially different base scale for CarAnt
    getBaseScale() {
        return 0.9 + Math.random() * 0.2; // Slightly larger and less variable than default
    }

    createTypeSpecificElements() {
        // Create car body and wheels
        this.createCarBody();
        this.createWheels();
    }

    createCarBody() {
        this.carBody = new PIXI.Graphics();
        
        // Simple rectangular car body
        this.carBody.beginFill(0xFF0000); // Red color for the car
        this.carBody.drawRect(-15, -8, 30, 16); // Body size
        this.carBody.endFill();

        // Add a small "cabin"
        this.carBody.beginFill(0xCCCCCC); // Light grey for cabin
        this.carBody.drawRect(-8, -12, 16, 6); // Cabin on top
        this.carBody.endFill();
        
        this.addChild(this.carBody);
    }

    createWheels() {
        this.wheels = [];
        this.wheelsContainer = new PIXI.Container();
        this.addChild(this.wheelsContainer);

        const wheelRadius = 5;
        const wheelColor = 0x333333; // Dark grey for wheels

        // Wheel positions (relative to ant/car center)
        // [x, y]
        const wheelPositions = [
            [-10, 8], // Front-left
            [10, 8],  // Front-right
            [-10, -8], // Rear-left
            [10, -8]   // Rear-right
        ];

        wheelPositions.forEach(pos => {
            const wheel = new PIXI.Graphics();
            wheel.beginFill(wheelColor);
            wheel.drawCircle(0, 0, wheelRadius);
            wheel.endFill();

            // Add a small hubcap detail
            wheel.beginFill(0xAAAAAA);
            wheel.drawCircle(0, 0, wheelRadius * 0.4);
            wheel.endFill();

            wheel.position.set(pos[0], pos[1]);
            this.wheelsContainer.addChild(wheel);
            this.wheels.push(wheel);
        });
    }

    performAnimation() {
        this.animateWheels();
        this.createExhaustEffect();
        this.updateChromeReflection();
        this.createSpeedLines();
        this.animateHubcaps();
        
        // INSANE CAR EFFECTS!
        this.createNitrousBoost();
        this.createTireScreech();
        this.createCarHornVisual();
        this.createBackfireExplosion();
        this.createRacingFlags();
        this.createSpeedBoostEffect();
        this.createFlyingCarParts();
        this.createCheckeredPattern();
        this.createEngineRevEffect();
    }

    animateWheels() {
        // Calculate current speed to modulate wheel animation speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const effectiveRotationSpeed = this.wheelRotationSpeed * (currentSpeed / this.speed); // Modulate by current speed vs max speed

        this.wheels.forEach(wheel => {
            wheel.rotation += effectiveRotationSpeed;
        });
    }

    createExhaustEffect() {
        // Enhanced exhaust with multiple puffs and varying colors
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const exhaustChance = speed > 1 ? 0.4 : 0.15; // More exhaust when moving fast
        
        if (Math.random() < exhaustChance && IdleAnts.app && IdleAnts.app.stage) {
            for (let i = 0; i < (speed > 2 ? 3 : 1); i++) {
                const exhaust = new PIXI.Graphics();
                
                // Varying exhaust colors from dark grey to light grey
                const exhaustColors = [0x333333, 0x555555, 0x777777, 0x999999];
                const color = exhaustColors[Math.floor(Math.random() * exhaustColors.length)];
                
                exhaust.beginFill(color, 0.7);
                exhaust.drawCircle(0, 0, 2 + Math.random() * 3);
                exhaust.endFill();
                
                // Position at rear of car
                const exhaustOffsetX = -18 - i * 3;
                const exhaustOffsetY = Math.random() * 4 - 2;
                const angle = this.rotation - (Math.PI / 2);
                
                exhaust.x = this.x + (exhaustOffsetX * Math.cos(angle) - exhaustOffsetY * Math.sin(angle)) * this.scale.x;
                exhaust.y = this.y + (exhaustOffsetX * Math.sin(angle) + exhaustOffsetY * Math.cos(angle)) * this.scale.y;
                
                exhaust.vx = Math.cos(angle + Math.PI) * (1 + Math.random()) + (Math.random() - 0.5) * 2;
                exhaust.vy = Math.sin(angle + Math.PI) * (1 + Math.random()) + (Math.random() - 0.5) * 2;
                exhaust.life = 20 + Math.random() * 15;
                exhaust.initialLife = exhaust.life;
                
                IdleAnts.app.stage.addChild(exhaust);
                
                const animateExhaust = () => {
                    exhaust.x += exhaust.vx;
                    exhaust.y += exhaust.vy;
                    exhaust.vx *= 0.98; // Friction
                    exhaust.vy *= 0.98;
                    exhaust.life--;
                    exhaust.alpha = (exhaust.life / exhaust.initialLife) * 0.7;
                    exhaust.scale.set(1 + (1 - exhaust.life / exhaust.initialLife) * 1.5);
                    
                    if (exhaust.life <= 0) {
                        if (exhaust.parent) {
                            exhaust.parent.removeChild(exhaust);
                        }
                    } else {
                        requestAnimationFrame(animateExhaust);
                    }
                };
                animateExhaust();
            }
        }
    }

    updateChromeReflection() {
        // Animated chrome reflection on the car body
        const time = Date.now() * 0.008;
        const reflection = Math.sin(time) * 0.3 + 0.7;
        
        if (this.carBody) {
            // Create a shimmering chrome effect by adjusting tint
            const shimmer = Math.floor(255 * reflection);
            this.carBody.tint = (shimmer << 16) | (shimmer << 8) | shimmer;
        }
    }

    createSpeedLines() {
        // Speed lines when moving fast
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 2 && Math.random() < 0.3 && IdleAnts.app && IdleAnts.app.stage) {
            const speedLine = new PIXI.Graphics();
            speedLine.lineStyle(1, 0xCCCCCC, 0.8);
            
            // Create line opposite to movement direction
            const angle = Math.atan2(this.vy, this.vx) + Math.PI;
            const lineLength = 15 + speed * 3;
            
            speedLine.moveTo(0, 0);
            speedLine.lineTo(Math.cos(angle) * lineLength, Math.sin(angle) * lineLength);
            
            // Position slightly behind and to sides of car
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 12;
            speedLine.x = this.x + offsetX;
            speedLine.y = this.y + offsetY;
            
            speedLine.life = 8;
            speedLine.initialLife = speedLine.life;
            
            IdleAnts.app.stage.addChild(speedLine);
            
            const animateSpeedLine = () => {
                speedLine.life--;
                speedLine.alpha = speedLine.life / speedLine.initialLife * 0.8;
                
                if (speedLine.life <= 0) {
                    if (speedLine.parent) {
                        speedLine.parent.removeChild(speedLine);
                    }
                } else {
                    requestAnimationFrame(animateSpeedLine);
                }
            };
            animateSpeedLine();
        }
    }

    animateHubcaps() {
        // Make hubcaps shine and rotate independently
        const time = Date.now() * 0.01;
        
        this.wheels.forEach((wheel, index) => {
            if (wheel.children && wheel.children[0]) { // The hubcap is the second child
                const hubcap = wheel.children[0];
                
                // Shine effect
                const shine = Math.sin(time + index) * 0.4 + 0.6;
                const shineColor = Math.floor(255 * shine);
                hubcap.tint = (shineColor << 16) | (shineColor << 8) | shineColor;
                
                // Independent rotation for hubcaps
                hubcap.rotation += 0.2;
            }
        });
    }

    createNitrousBoost() {
        // NITROUS FLAMES!
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 3 && Math.random() < 0.1 && IdleAnts.app && IdleAnts.app.stage) {
            for (let i = 0; i < 8; i++) {
                const flame = new PIXI.Graphics();
                const colors = [0x0080FF, 0x00BFFF, 0xFFFFFF, 0x87CEEB];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                flame.beginFill(color, 0.9);
                flame.drawEllipse(0, 0, 4 + Math.random() * 6, 2 + Math.random() * 4);
                flame.endFill();
                
                // Position at rear with spread
                const angle = this.rotation - (Math.PI / 2);
                const rearX = this.x + Math.cos(angle + Math.PI) * (20 + i * 3);
                const rearY = this.y + Math.sin(angle + Math.PI) * (20 + i * 3);
                
                flame.x = rearX + (Math.random() - 0.5) * 8;
                flame.y = rearY + (Math.random() - 0.5) * 8;
                flame.life = 15;
                
                IdleAnts.app.stage.addChild(flame);
                
                const animateFlame = () => {
                    flame.life--;
                    flame.alpha = flame.life / 15;
                    flame.scale.set(1 + (1 - flame.life / 15) * 2);
                    
                    if (flame.life <= 0) {
                        if (flame.parent) flame.parent.removeChild(flame);
                    } else {
                        requestAnimationFrame(animateFlame);
                    }
                };
                animateFlame();
            }
        }
    }

    createTireScreech() {
        // TIRE SKID MARKS!
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 2 && Math.random() < 0.15 && IdleAnts.app && IdleAnts.app.stage) {
            const skid = new PIXI.Graphics();
            skid.lineStyle(3, 0x333333, 0.8);
            
            const startX = this.x;
            const startY = this.y;
            const angle = Math.atan2(this.vy, this.vx) + Math.PI;
            
            // Draw multiple skid lines
            for (let i = 0; i < 4; i++) {
                const offsetX = (i - 1.5) * 4;
                const offsetY = 0;
                const lineLength = 20 + Math.random() * 15;
                
                skid.moveTo(startX + offsetX, startY + offsetY);
                skid.lineTo(
                    startX + offsetX + Math.cos(angle) * lineLength,
                    startY + offsetY + Math.sin(angle) * lineLength
                );
            }
            
            skid.life = 180; // Last longer
            IdleAnts.app.stage.addChild(skid);
            
            const animateSkid = () => {
                skid.life--;
                skid.alpha = skid.life / 180 * 0.8;
                
                if (skid.life <= 0) {
                    if (skid.parent) skid.parent.removeChild(skid);
                } else {
                    requestAnimationFrame(animateSkid);
                }
            };
            animateSkid();
        }
    }

    createCarHornVisual() {
        // VISUAL HORN SOUNDS!
        if (Math.random() < 0.01 && IdleAnts.app && IdleAnts.app.stage) {
            const horn = new PIXI.Graphics();
            
            // Draw "BEEP!" visually
            horn.beginFill(0xFFFF00);
            // B
            horn.drawRect(0, 0, 8, 20);
            horn.drawRect(8, 0, 6, 8);
            horn.drawRect(8, 12, 6, 8);
            // E
            horn.drawRect(20, 0, 8, 20);
            horn.drawRect(28, 0, 6, 6);
            horn.drawRect(28, 8, 4, 4);
            horn.drawRect(28, 14, 6, 6);
            // E
            horn.drawRect(40, 0, 8, 20);
            horn.drawRect(48, 0, 6, 6);
            horn.drawRect(48, 8, 4, 4);
            horn.drawRect(48, 14, 6, 6);
            // P
            horn.drawRect(60, 0, 8, 20);
            horn.drawRect(68, 0, 6, 10);
            // !
            horn.drawRect(80, 0, 4, 14);
            horn.drawRect(80, 16, 4, 4);
            horn.endFill();
            
            horn.x = this.x - 40;
            horn.y = this.y - 30;
            horn.scale.set(0.3);
            horn.life = 30;
            
            IdleAnts.app.stage.addChild(horn);
            
            const animateHorn = () => {
                horn.life--;
                horn.y -= 1;
                horn.alpha = horn.life / 30;
                horn.scale.set(0.3 + (1 - horn.life / 30) * 0.2);
                
                if (horn.life <= 0) {
                    if (horn.parent) horn.parent.removeChild(horn);
                } else {
                    requestAnimationFrame(animateHorn);
                }
            };
            animateHorn();
        }
    }

    createBackfireExplosion() {
        // MASSIVE BACKFIRE EXPLOSIONS!
        if (Math.random() < 0.005 && IdleAnts.app && IdleAnts.app.stage) {
            for (let i = 0; i < 15; i++) {
                const explosion = new PIXI.Graphics();
                const colors = [0xFF4500, 0xFFD700, 0xFF6347, 0xFFA500, 0xFF8C00];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                explosion.beginFill(color, 0.8);
                explosion.drawCircle(0, 0, 8 + Math.random() * 12);
                explosion.endFill();
                
                // Position at rear exhaust
                const angle = this.rotation - (Math.PI / 2);
                const exhaustX = this.x + Math.cos(angle + Math.PI) * 25;
                const exhaustY = this.y + Math.sin(angle + Math.PI) * 25;
                
                explosion.x = exhaustX + (Math.random() - 0.5) * 20;
                explosion.y = exhaustY + (Math.random() - 0.5) * 20;
                explosion.life = 25;
                
                IdleAnts.app.stage.addChild(explosion);
                
                const animateExplosion = () => {
                    explosion.life--;
                    explosion.scale.set(explosion.life / 25 * 2);
                    explosion.alpha = explosion.life / 25;
                    
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

    createRacingFlags() {
        // RACING FLAGS!
        if (Math.random() < 0.008 && IdleAnts.app && IdleAnts.app.stage) {
            const flag = new PIXI.Graphics();
            
            // Checkered flag pattern
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 6; j++) {
                    const color = (i + j) % 2 === 0 ? 0x000000 : 0xFFFFFF;
                    flag.beginFill(color);
                    flag.drawRect(j * 4, i * 4, 4, 4);
                    flag.endFill();
                }
            }
            
            flag.x = this.x + (Math.random() - 0.5) * 50;
            flag.y = this.y - 30;
            flag.life = 60;
            flag.wave = 0;
            
            IdleAnts.app.stage.addChild(flag);
            
            const animateFlag = () => {
                flag.life--;
                flag.wave += 0.2;
                flag.skew.x = Math.sin(flag.wave) * 0.2;
                flag.alpha = flag.life / 60;
                
                if (flag.life <= 0) {
                    if (flag.parent) flag.parent.removeChild(flag);
                } else {
                    requestAnimationFrame(animateFlag);
                }
            };
            animateFlag();
        }
    }

    createSpeedBoostEffect() {
        // SPEED BOOST AURA!
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 4 && Math.random() < 0.2 && IdleAnts.app && IdleAnts.app.stage) {
            const boost = new PIXI.Graphics();
            
            // Draw speed rings
            for (let i = 0; i < 5; i++) {
                const radius = 15 + i * 5;
                const color = [0x00BFFF, 0x87CEEB, 0xFFFFFF][i % 3];
                boost.lineStyle(2, color, 0.6 - i * 0.1);
                boost.drawCircle(this.x, this.y, radius);
            }
            
            boost.life = 20;
            IdleAnts.app.stage.addChild(boost);
            
            const animateBoost = () => {
                boost.life--;
                boost.scale.set(1 + (1 - boost.life / 20) * 3);
                boost.alpha = boost.life / 20 * 0.6;
                
                if (boost.life <= 0) {
                    if (boost.parent) boost.parent.removeChild(boost);
                } else {
                    requestAnimationFrame(animateBoost);
                }
            };
            animateBoost();
        }
    }

    createFlyingCarParts() {
        // CAR PARTS FLYING OFF!
        if (Math.random() < 0.003 && IdleAnts.app && IdleAnts.app.stage) {
            const parts = ['BOLT!', 'SCREW!', 'NUT!', 'PART!'];
            const part = parts[Math.floor(Math.random() * parts.length)];
            
            const partGraphic = new PIXI.Graphics();
            partGraphic.beginFill(0x888888);
            
            // Simple part shape
            for (let i = 0; i < part.length; i++) {
                partGraphic.drawRect(i * 6, 0, 5, 10);
            }
            partGraphic.endFill();
            
            partGraphic.x = this.x + (Math.random() - 0.5) * 20;
            partGraphic.y = this.y + (Math.random() - 0.5) * 20;
            partGraphic.vx = (Math.random() - 0.5) * 8;
            partGraphic.vy = -Math.random() * 5 - 2;
            partGraphic.life = 90;
            partGraphic.gravity = 0.1;
            
            IdleAnts.app.stage.addChild(partGraphic);
            
            const animatePart = () => {
                partGraphic.x += partGraphic.vx;
                partGraphic.y += partGraphic.vy;
                partGraphic.vy += partGraphic.gravity;
                partGraphic.rotation += 0.1;
                partGraphic.life--;
                partGraphic.alpha = partGraphic.life / 90;
                
                if (partGraphic.life <= 0) {
                    if (partGraphic.parent) partGraphic.parent.removeChild(partGraphic);
                } else {
                    requestAnimationFrame(animatePart);
                }
            };
            animatePart();
        }
    }

    createCheckeredPattern() {
        // CHECKERED RACING PATTERN!
        if (Math.random() < 0.02 && IdleAnts.app && IdleAnts.app.stage) {
            const pattern = new PIXI.Graphics();
            
            for (let i = 0; i < 8; i++) {
                const color = i % 2 === 0 ? 0x000000 : 0xFFFFFF;
                pattern.beginFill(color);
                pattern.drawRect(i * 8, 0, 8, 8);
                pattern.endFill();
            }
            
            pattern.x = this.x - 32;
            pattern.y = this.y + 20;
            pattern.life = 40;
            
            IdleAnts.app.stage.addChild(pattern);
            
            const animatePattern = () => {
                pattern.life--;
                pattern.alpha = pattern.life / 40;
                pattern.y += 0.5;
                
                if (pattern.life <= 0) {
                    if (pattern.parent) pattern.parent.removeChild(pattern);
                } else {
                    requestAnimationFrame(animatePattern);
                }
            };
            animatePattern();
        }
    }

    createEngineRevEffect() {
        // ENGINE REV VISUAL!
        if (Math.random() < 0.02 && IdleAnts.app && IdleAnts.app.stage) {
            const rev = new PIXI.Graphics();
            
            // Draw "VROOM!" text effect
            rev.beginFill(0xFF4500);
            // V
            rev.drawRect(0, 0, 4, 20);
            rev.drawRect(8, 0, 4, 20);
            rev.drawRect(4, 16, 4, 4);
            // R
            rev.drawRect(16, 0, 4, 20);
            rev.drawRect(20, 0, 8, 8);
            rev.drawRect(20, 12, 8, 8);
            // O
            rev.drawRect(32, 0, 4, 20);
            rev.drawRect(36, 0, 8, 4);
            rev.drawRect(36, 16, 8, 4);
            rev.drawRect(44, 0, 4, 20);
            // O
            rev.drawRect(52, 0, 4, 20);
            rev.drawRect(56, 0, 8, 4);
            rev.drawRect(56, 16, 8, 4);
            rev.drawRect(64, 0, 4, 20);
            // M
            rev.drawRect(72, 0, 4, 20);
            rev.drawRect(76, 0, 4, 8);
            rev.drawRect(80, 0, 4, 20);
            // !
            rev.drawRect(88, 0, 4, 16);
            rev.drawRect(88, 18, 4, 2);
            rev.endFill();
            
            rev.x = this.x - 45;
            rev.y = this.y - 25;
            rev.scale.set(0.3);
            rev.life = 40;
            
            IdleAnts.app.stage.addChild(rev);
            
            const animateRev = () => {
                rev.life--;
                rev.y -= 0.5;
                rev.alpha = rev.life / 40;
                rev.scale.set(0.3 + (1 - rev.life / 40) * 0.2);
                
                if (rev.life <= 0) {
                    if (rev.parent) rev.parent.removeChild(rev);
                } else {
                    requestAnimationFrame(animateRev);
                }
            };
            animateRev();
        }
    }

    // CarAnts might have different boundary handling, e.g., they don't just wrap around.
    // For now, uses AntBase's default. Can be overridden.
    // handleBoundaries(width, height) {
    //     super.handleBoundaries(width, height);
    // }
}; 