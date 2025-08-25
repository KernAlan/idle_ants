// src/entities/special/SpiderAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Special === 'undefined') IdleAnts.Entities.Special = {};

// Spider Ant - shoots webs to slow and trap enemies
IdleAnts.Entities.Special.SpiderAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Spider ants have normal speed
        super(texture, nestPosition, speedMultiplier, 1.0);
        
        // Get ant type configuration
        this.antType = IdleAnts.Data.AntTypes.SPIDER_ANT;
        
        // Defensive check for missing ant type data
        if (!this.antType) {
            console.error('SpiderAnt: Unable to find SPIDER_ANT configuration in IdleAnts.Data.AntTypes');
            // Provide fallback values
            this.antType = {
                color: 0x000000,
                glowColor: 0x800080,
                damage: 72,
                hp: 320,
                range: 200,
                ability: 'webShoot'
            };
        }
        
        // Apply properties from ant type
        this.tint = this.antType.color;
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        this.attackRange = this.antType.range || 200;
        
        // Spider-specific properties
        this.webShootCooldown = 90; // frames
        this._webShootTimer = 0;
        this.webStrands = [];
        this.maxWebStrands = 8;
        this.webStickiness = 0.8; // How much webs slow enemies
        this.webDuration = 600; // 10 seconds
        
        // Web production
        this.silkReserves = 100;
        this.maxSilkReserves = 100;
        this.silkProductionRate = 0.3;
        
        // Spider body parts
        this.spiderLegs = [];
        this.spinnerets = null;
        this.webSensors = [];
        
        // Hunting behavior
        this.huntingMode = false;
        this.preyTarget = null;
        this.webTrapRadius = 150;
        
        this.updateHealthBar();
    }
    
    // Override base scale - Spider ants are larger
    getBaseScale() {
        return 1.2 + Math.random() * 0.3;
    }
    
    // Create type-specific visual elements
    createTypeSpecificElements() {
        this.createSpiderBody();
        this.createSpiderLegs();
        this.createSpinnerets();
        this.createWebSensors();
    }
    
    createSpiderBody() {
        const body = new PIXI.Graphics();
        
        // Black spider ant body - more spider-like
        const color = (this.antType && this.antType.color) || 0x000000;
        const glow = (this.antType && this.antType.glowColor) || 0x800080;
        body.beginFill(color);
        
        // Large rounded abdomen
        body.drawCircle(0, 8, 10);
        body.endFill();
        
        // Cephalothorax (head+thorax combined)
        body.beginFill(color);
        body.drawEllipse(0, -2, 8, 12);
        body.endFill();
        
        // Spider markings on abdomen
        body.beginFill(glow, 0.8);
        body.drawEllipse(0, 8, 6, 8);
        body.endFill();
        
        // Web pattern on back
        body.lineStyle(1, 0xC0C0C0, 0.6);
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x1 = Math.cos(angle) * 4;
            const y1 = Math.sin(angle) * 4 + 8;
            const x2 = Math.cos(angle) * 8;
            const y2 = Math.sin(angle) * 8 + 8;
            body.moveTo(x1, y1);
            body.lineTo(x2, y2);
        }
        
        // Multiple eyes
        body.beginFill(0xFF0000, 0.9);
        body.drawCircle(-3, -8, 1.5);
        body.drawCircle(3, -8, 1.5);
        body.drawCircle(-1.5, -10, 1);
        body.drawCircle(1.5, -10, 1);
        body.endFill();
        
        // Fangs
        body.beginFill(0xFFFFFF);
        body.drawEllipse(-2, -6, 1, 3);
        body.drawEllipse(2, -6, 1, 3);
        body.endFill();
        
        this.addChild(body);
    }
    
    createSpiderLegs() {
        // Spider has 8 legs (4 pairs)
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        this.spiderLegs = [];
        const legPositions = [
            {x: -6, y: -8, side: 'left', pair: 1},
            {x: 6, y: -8, side: 'right', pair: 1},
            {x: -8, y: -2, side: 'left', pair: 2},
            {x: 8, y: -2, side: 'right', pair: 2},
            {x: -8, y: 4, side: 'left', pair: 3},
            {x: 8, y: 4, side: 'right', pair: 3},
            {x: -6, y: 10, side: 'left', pair: 4},
            {x: 6, y: 10, side: 'right', pair: 4}
        ];
        
        for (let i = 0; i < legPositions.length; i++) {
            const legPos = legPositions[i];
            const leg = new PIXI.Graphics();
            
            leg.position.set(legPos.x, legPos.y);
            leg.baseX = legPos.x;
            leg.baseY = legPos.y;
            leg.index = i;
            leg.side = legPos.side;
            leg.pair = legPos.pair;
            
            this.drawSpiderLeg(leg);
            this.legsContainer.addChild(leg);
            this.spiderLegs.push(leg);
        }
        
        // Spider leg animation
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.2;
    }
    
    createSpinnerets() {
        // Web shooting organs
        this.spinnerets = new PIXI.Graphics();
        this.spinnerets.beginFill(0x696969, 0.8);
        this.spinnerets.drawCircle(0, 15, 2);
        this.spinnerets.drawCircle(-2, 13, 1.5);
        this.spinnerets.drawCircle(2, 13, 1.5);
        this.spinnerets.endFill();
        
        this.addChild(this.spinnerets);
    }
    
    createWebSensors() {
        // Vibration sensors for detecting prey in webs
        this.webSensors = [];
        for (let i = 0; i < 6; i++) {
            const sensor = new PIXI.Graphics();
            const glowColor = (this.antType && this.antType.glowColor) || 0x800080;
            sensor.lineStyle(1, glowColor, 0.4);
            
            const angle = (i / 6) * Math.PI * 2;
            const sensorRange = 25;
            sensor.moveTo(0, 0);
            sensor.lineTo(Math.cos(angle) * sensorRange, Math.sin(angle) * sensorRange);
            
            sensor.x = this.x;
            sensor.y = this.y;
            sensor.alpha = 0;
            
            this.webSensors.push(sensor);
            this.addChild(sensor);
        }
    }
    
    drawSpiderLeg(leg) {
        leg.clear();
        const legColor = (this.antType && this.antType.color) || 0x000000;
        leg.lineStyle(2.5, legColor);
        
        // Spider legs are longer and jointed
        const legLength = 12 + (leg.pair * 2);
        const jointLength = legLength * 0.6;
        
        leg.moveTo(0, 0);
        
        if (leg.side === 'left') {
            // First segment
            leg.lineTo(-jointLength, -2);
            // Second segment
            leg.lineTo(-legLength, 2);
            // Foot
            const legColor = (this.antType && this.antType.color) || 0x000000;
            leg.lineStyle(1, legColor);
            leg.drawCircle(-legLength, 2, 1);
        } else {
            // First segment
            leg.lineTo(jointLength, -2);
            // Second segment
            leg.lineTo(legLength, 2);
            // Foot
            const legColor = (this.antType && this.antType.color) || 0x000000;
            leg.lineStyle(1, legColor);
            leg.drawCircle(legLength, 2, 1);
        }
    }
    
    // Use standard ant animation instead of custom behavior
    // performAnimation() {
    //     this.animateSpiderLegs();
    //     this.produceSilk();
    //     this.updateWebSensors();
    //     this.updateHuntingMode();
    //     this.maintainWebs();
    // }
    
    animateSpiderLegs() {
        if (!this.spiderLegs) return;
        
        this.legPhase += this.legAnimationSpeed;
        
        for (let i = 0; i < this.spiderLegs.length; i++) {
            const leg = this.spiderLegs[i];
            
            // Spider legs move in pairs, alternating sides
            let phase = this.legPhase + (leg.pair * Math.PI / 2);
            if (leg.side === 'right') {
                phase += Math.PI / 4;
            }
            
            const legMovement = Math.sin(phase) * 1.5;
            
            this.drawSpiderLeg(leg);
            
            // Add joint animation
            const legLength = 12 + (leg.pair * 2);
            const jointLength = legLength * 0.6;
            const jointBend = Math.sin(phase) * 0.5;
            
            if (leg.side === 'left') {
                leg.lineTo(-jointLength, -2 + jointBend + legMovement);
                leg.lineTo(-legLength, 2 + legMovement);
            } else {
                leg.lineTo(jointLength, -2 + jointBend + legMovement);
                leg.lineTo(legLength, 2 + legMovement);
            }
        }
    }
    
    produceSilk() {
        // Regenerate silk reserves
        if (this.silkReserves < this.maxSilkReserves) {
            this.silkReserves += this.silkProductionRate;
        }
        
        // Visual silk production
        if (Math.random() < 0.05 && this.silkReserves > 80) {
            this.createSilkParticle();
        }
    }
    
    createSilkParticle() {
        const silk = new PIXI.Graphics();
        silk.beginFill(0xC0C0C0, 0.6);
        silk.drawCircle(0, 0, 0.5 + Math.random() * 0.5);
        silk.endFill();
        
        silk.x = this.x + (Math.random() - 0.5) * 6;
        silk.y = this.y + 12 + Math.random() * 4;
        silk.vy = -0.2;
        silk.life = 30;
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(silk);
            
            const animateSilk = () => {
                silk.y += silk.vy;
                silk.life--;
                silk.alpha = silk.life / 30;
                
                if (silk.life <= 0) {
                    if (silk.parent) {
                        silk.parent.removeChild(silk);
                    }
                } else {
                    requestAnimationFrame(animateSilk);
                }
            };
            animateSilk();
        }
    }
    
    updateWebSensors() {
        // Activate sensors when prey is nearby
        const nearbyEnemies = this.findEnemiesInRange();
        const sensorActive = nearbyEnemies.length > 0;
        
        for (let i = 0; i < this.webSensors.length; i++) {
            const sensor = this.webSensors[i];
            if (sensorActive) {
                sensor.alpha = 0.3 + Math.sin(this.legPhase + i) * 0.2;
            } else {
                sensor.alpha = Math.max(0, sensor.alpha - 0.05);
            }
        }
    }
    
    updateHuntingMode() {
        const enemies = this.findEnemiesInRange();
        const shouldHunt = enemies.length > 0;
        
        if (shouldHunt !== this.huntingMode) {
            this.huntingMode = shouldHunt;
            
            if (this.huntingMode) {
                this.preyTarget = enemies[0]; // Target closest enemy
                this.tint = 0x2F2F2F; // Darker when hunting
            } else {
                this.preyTarget = null;
                this.tint = (this.antType && this.antType.color) || 0x000000;
            }
        }
    }
    
    maintainWebs() {
        // Remove expired web strands
        for (let i = this.webStrands.length - 1; i >= 0; i--) {
            const web = this.webStrands[i];
            web.duration--;
            
            if (web.duration <= 0) {
                if (web.visual && web.visual.parent) {
                    web.visual.parent.removeChild(web.visual);
                }
                this.webStrands.splice(i, 1);
            } else {
                // Update web visual
                if (web.visual) {
                    const fadePercent = web.duration / this.webDuration;
                    web.visual.alpha = fadePercent * 0.8;
                }
            }
        }
    }
    
    // Find enemies in web shooting range
    findEnemiesInRange() {
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return [];
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        const inRangeEnemies = [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= this.attackRange) {
                inRangeEnemies.push(enemy);
            }
        }
        
        // Sort by distance
        inRangeEnemies.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.x - this.x, 2) + Math.pow(a.y - this.y, 2));
            const distB = Math.sqrt(Math.pow(b.x - this.x, 2) + Math.pow(b.y - this.y, 2));
            return distA - distB;
        });
        
        return inRangeEnemies;
    }
    
    // Shoot web at target
    shootWeb() {
        if (this._webShootTimer > 0 || this.silkReserves < 20) return;
        
        const enemies = this.findEnemiesInRange();
        if (enemies.length === 0) return;
        
        const target = enemies[0];
        
        // Consume silk
        this.silkReserves -= 20;
        
        // Start cooldown
        this._webShootTimer = this.webShootCooldown;
        
        // Create web strand
        this.createWebStrand(target);
        
        // Visual web shooting effect
        this.createWebShootEffect(target);
    }
    
    createWebStrand(target) {
        if (this.webStrands.length >= this.maxWebStrands) {
            // Remove oldest web
            const oldWeb = this.webStrands.shift();
            if (oldWeb.visual && oldWeb.visual.parent) {
                oldWeb.visual.parent.removeChild(oldWeb.visual);
            }
        }
        
        // Create new web strand
        const web = {
            startX: this.x,
            startY: this.y,
            endX: target.x,
            endY: target.y,
            target: target,
            duration: this.webDuration,
            stickiness: this.webStickiness,
            visual: null
        };
        
        // Create visual web
        web.visual = this.createWebVisual(web);
        
        this.webStrands.push(web);
        
        // Apply web effect to target
        this.applyWebEffect(target, web);
    }
    
    createWebVisual(web) {
        const webGraphic = new PIXI.Graphics();
        webGraphic.lineStyle(2, 0xC0C0C0, 0.8);
        webGraphic.moveTo(web.startX, web.startY);
        webGraphic.lineTo(web.endX, web.endY);
        
        // Add web pattern
        const midX = (web.startX + web.endX) / 2;
        const midY = (web.startY + web.endY) / 2;
        
        // Cross strands
        webGraphic.lineStyle(1, 0xC0C0C0, 0.6);
        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * 8;
            const perpX = -(web.endY - web.startY) / 100;
            const perpY = (web.endX - web.startX) / 100;
            
            webGraphic.moveTo(midX + perpX * offset, midY + perpY * offset);
            webGraphic.lineTo(midX - perpX * offset, midY - perpY * offset);
        }
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(webGraphic);
        }
        
        return webGraphic;
    }
    
    createWebShootEffect(target) {
        // Web shooting animation
        const webLine = new PIXI.Graphics();
        webLine.lineStyle(3, 0xFFFFFF, 0.9);
        webLine.moveTo(this.x, this.y + 15);
        webLine.lineTo(target.x, target.y);
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(webLine);
            
            let life = 10;
            const animateWeb = () => {
                life--;
                webLine.alpha = life / 10;
                
                if (life <= 0) {
                    if (webLine.parent) {
                        webLine.parent.removeChild(webLine);
                    }
                } else {
                    requestAnimationFrame(animateWeb);
                }
            };
            animateWeb();
        }
    }
    
    applyWebEffect(target, web) {
        // Slow down the target
        if (!target.isWebbed) {
            target.isWebbed = true;
            target.originalSpeed = target.originalSpeed || target.speed || 1;
            
            if (target.speed !== undefined) {
                target.speed *= (1 - web.stickiness);
            }
            
            // Visual web effect on target
            target.tint = (target.tint || 0xFFFFFF) * 0.7 + 0x808080 * 0.3;
            
            // Deal damage over time while webbed
            const webDamageInterval = setInterval(() => {
                if (target.takeDamage && target.isWebbed) {
                    target.takeDamage(Math.floor(this.attackDamage * 0.1));
                } else {
                    clearInterval(webDamageInterval);
                }
            }, 1000); // 1 damage per second
            
            // Remove web effect after duration
            setTimeout(() => {
                if (target.isWebbed) {
                    target.isWebbed = false;
                    if (target.originalSpeed !== undefined) {
                        target.speed = target.originalSpeed;
                    }
                    target.tint = 0xFFFFFF;
                }
                clearInterval(webDamageInterval);
            }, web.duration * (1000/60)); // Convert frames to ms
        }
    }
    
    // Override update method
    update() {
        super.update();
        
        // Update web shoot timer
        if (this._webShootTimer > 0) {
            this._webShootTimer--;
        }
        
        // Shoot webs at enemies
        if (this.huntingMode && this._webShootTimer <= 0) {
            this.shootWeb();
        }
    }
    
    // Clean up webs when destroyed
    destroy() {
        // Clean up web strands
        for (const web of this.webStrands) {
            if (web.visual && web.visual.parent) {
                web.visual.parent.removeChild(web.visual);
            }
        }
        this.webStrands = [];
        
        if (super.destroy) {
            super.destroy();
        }
    }
};
