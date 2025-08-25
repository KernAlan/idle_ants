// src/entities/BomberBeetle.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// Bomber Beetle - automatically saves the game when spawned
IdleAnts.Entities.BomberBeetle = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Bomber beetles are slower but sturdy
        super(texture, nestPosition, speedMultiplier, 0.6);
        
        // Get ant type configuration
        this.antType = IdleAnts.Data.AntTypes.BOMBER_BEETLE;
        
        // Defensive check for missing ant type data
        if (!this.antType) {
            console.error('BomberBeetle: Unable to find BOMBER_BEETLE configuration in IdleAnts.Data.AntTypes');
            // Provide fallback values
            this.antType = {
                color: 0x8B4513,
                glowColor: 0xD2691E,
                damage: 21,
                hp: 110,
                ability: 'autoSave'
            };
        }
        
        // Apply properties from ant type
        this.tint = this.antType.color;
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        
        // Bomber beetle specific properties
        this.autoSaveTriggered = false;
        this.bombShells = [];
        this.maxBombShells = 3;
        this.shellProductionRate = 0.01;
        
        // Bomber behavior
        this.bombingRuns = 0;
        this.bombingCooldown = 0;
        this.diveBombReady = false;
        
        // Visual properties
        this.shellGlintCounter = 0;
        this.engineNoise = 0;
        this.contrailParticles = [];
        
        // Combat properties
        this.attackCooldown = 90;
        this._attackTimer = 0;
        
        // Trigger auto-save on spawn
        this.triggerAutoSave();
        
        this.updateHealthBar();
    }
    
    // Override base scale
    getBaseScale() {
        return 1.1 + Math.random() * 0.2;
    }
    
    // Create type-specific visual elements
    createTypeSpecificElements() {
        this.createBeetleBody();
        this.createBeetleLegs();
        this.createBombBay();
        this.createEngines();
    }
    
    createBeetleBody() {
        const body = new PIXI.Graphics();
        
        // Brown bomber beetle body - aircraft-like
        const color = (this.antType && this.antType.color) || 0x8B4513;
        body.beginFill(color);
        
        // Elongated fuselage-like abdomen
        body.drawEllipse(0, 8, 8, 14);
        body.endFill();
        
        // Cockpit thorax
        body.beginFill(color);
        body.drawEllipse(0, -2, 7, 10);
        body.endFill();
        
        // Pilot head
        body.beginFill(color);
        body.drawEllipse(0, -10, 6, 7);
        body.endFill();
        
        // Bomber nose cone
        body.beginFill(0x654321);
        body.drawEllipse(0, -15, 4, 5);
        body.endFill();
        
        // Pilot goggles
        body.beginFill(0x000000, 0.8);
        body.drawCircle(-2, -10, 1.5);
        body.drawCircle(2, -10, 1.5);
        body.endFill();
        
        // Antennae (like radio antennae)
        body.lineStyle(1.5, 0x2A1B10);
        body.moveTo(-2, -15);
        body.lineTo(-4, -18);
        body.moveTo(2, -15);
        body.lineTo(4, -18);
        
        // Bomber identification stripes
        body.lineStyle(2, 0x654321);
        for (let i = 0; i < 3; i++) {
            const y = 2 + (i * 4);
            body.moveTo(-6, y);
            body.lineTo(6, y);
        }
        
        // Wing hardpoints for bombs
        body.beginFill(0x2F4F2F);
        body.drawRect(-10, -2, 2, 4);
        body.drawRect(8, -2, 2, 4);
        body.endFill();
        
        this.addChild(body);
    }
    
    createBeetleLegs() {
        // Bomber beetle has retractable landing gear legs
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        this.legs = [];
        const legPositions = [
            {x: -5, y: -6, side: 'left', type: 'front'},
            {x: 5, y: -6, side: 'right', type: 'front'},
            {x: -6, y: 6, side: 'left', type: 'main'},
            {x: 6, y: 6, side: 'right', type: 'main'},
            {x: 0, y: 16, side: 'center', type: 'tail'}
        ];
        
        for (let i = 0; i < legPositions.length; i++) {
            const legPos = legPositions[i];
            const leg = new PIXI.Graphics();
            
            leg.position.set(legPos.x, legPos.y);
            leg.baseX = legPos.x;
            leg.baseY = legPos.y;
            leg.index = i;
            leg.side = legPos.side;
            leg.type = legPos.type;
            
            this.drawLandingGear(leg);
            this.legsContainer.addChild(leg);
            this.legs.push(leg);
        }
        
        // Mechanical movement
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.1;
    }
    
    createBombBay() {
        // Visual bomb bay with shells
        this.bombBay = new PIXI.Container();
        
        // Initialize with some bomb shells
        for (let i = 0; i < 2; i++) {
            this.addBombShell();
        }
        
        this.addChild(this.bombBay);
    }
    
    createEngines() {
        // Engine exhaust ports
        this.engines = new PIXI.Graphics();
        this.engines.beginFill(0x2F2F2F);
        this.engines.drawCircle(-6, 18, 2);
        this.engines.drawCircle(6, 18, 2);
        this.engines.endFill();
        
        // Engine glow
        this.engines.beginFill(0xFF4500, 0.6);
        this.engines.drawCircle(-6, 18, 1);
        this.engines.drawCircle(6, 18, 1);
        this.engines.endFill();
        
        this.addChild(this.engines);
    }
    
    drawLandingGear(leg) {
        leg.clear();
        
        // Mechanical landing gear
        leg.lineStyle(2, 0x696969);
        leg.moveTo(0, 0);
        
        if (leg.type === 'front') {
            // Front gear - simple strut
            leg.lineTo(0, 4);
            leg.lineStyle(3, 0x2F2F2F);
            leg.drawCircle(0, 4, 1.5); // Wheel
        } else if (leg.type === 'main') {
            // Main gear - heavy duty
            leg.lineTo(leg.side === 'left' ? -2 : 2, 3);
            leg.lineTo(0, 6);
            leg.lineStyle(4, 0x2F2F2F);
            leg.drawCircle(0, 6, 2); // Larger wheel
        } else if (leg.type === 'tail') {
            // Tail wheel
            leg.lineTo(0, 3);
            leg.lineStyle(2, 0x2F2F2F);
            leg.drawCircle(0, 3, 1);
        }
    }
    
    addBombShell() {
        // Ensure bombShells is initialized
        if (!this.bombShells) {
            this.bombShells = [];
        }
        
        const maxShells = this.maxBombShells || 6;
        if (this.bombShells.length >= maxShells) return;
        
        const shell = new PIXI.Graphics();
        
        // Bomb shell
        shell.beginFill(0x2F4F2F, 0.9);
        shell.drawEllipse(0, 0, 2, 4);
        shell.endFill();
        
        // Fins
        shell.lineStyle(1, 0x696969);
        shell.moveTo(-1, 2);
        shell.lineTo(-2, 3);
        shell.moveTo(1, 2);
        shell.lineTo(2, 3);
        
        // Position in bomb bay
        const bayPosition = this.bombShells ? this.bombShells.length : 0;
        shell.x = -3 + (bayPosition * 3);
        shell.y = 8;
        
        this.bombBay.addChild(shell);
        this.bombShells.push(shell);
    }
    
    // Use standard ant animation instead of custom behavior
    // performAnimation() {
    //     this.animateLandingGear();
    //     this.animateEngines();
    //     this.animateShellProduction();
    //     this.updateBombingRuns();
    //     this.createContrail();
    // }
    
    animateLandingGear() {
        if (!this.legs) return;
        
        // Mechanical gear movement
        this.legPhase += this.legAnimationSpeed;
        
        // Landing gear extends/retracts based on speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const gearExtended = speed < 0.5;
        
        for (const leg of this.legs) {
            const targetAlpha = gearExtended ? 1.0 : 0.3;
            leg.alpha += (targetAlpha - leg.alpha) * 0.1;
        }
    }
    
    animateEngines() {
        this.engineNoise += 0.2;
        
        // Engine glow pulse
        if (this.engines) {
            const enginePulse = 0.6 + Math.sin(this.engineNoise) * 0.3;
            this.engines.alpha = enginePulse;
            
            // Engine sound visualization
            if (Math.random() < 0.1) {
                this.createEngineParticle();
            }
        }
    }
    
    createEngineParticle() {
        // Engine exhaust particles
        for (let engineX of [-6, 6]) {
            const exhaust = new PIXI.Graphics();
            exhaust.beginFill(0xFF4500, 0.8);
            exhaust.drawCircle(0, 0, 1 + Math.random());
            exhaust.endFill();
            
            exhaust.x = this.x + engineX;
            exhaust.y = this.y + 18;
            exhaust.vy = 2 + Math.random() * 2;
            exhaust.vx = (Math.random() - 0.5) * 1;
            exhaust.life = 15 + Math.random() * 10;
            exhaust.maxLife = exhaust.life;
            
            if (IdleAnts.app && IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(exhaust);
                
                const animateExhaust = () => {
                    exhaust.x += exhaust.vx;
                    exhaust.y += exhaust.vy;
                    exhaust.life--;
                    exhaust.alpha = exhaust.life / exhaust.maxLife;
                    exhaust.scale.set(1 + (1 - exhaust.life / exhaust.maxLife) * 0.5);
                    
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
    
    animateShellProduction() {
        // Produce bomb shells over time
        const maxShells = this.maxBombShells || 6;
        if (Math.random() < this.shellProductionRate && this.bombShells && this.bombShells.length < maxShells) {
            this.addBombShell();
        }
        
        // Shell glint animation
        this.shellGlintCounter += 0.15;
        if (!this.bombShells) this.bombShells = [];
        for (let i = 0; i < this.bombShells.length; i++) {
            const shell = this.bombShells[i];
            const glint = 0.9 + Math.sin(this.shellGlintCounter + i) * 0.1;
            shell.alpha = glint;
        }
    }
    
    updateBombingRuns() {
        if (this.bombingCooldown > 0) {
            this.bombingCooldown--;
        } else {
            this.diveBombReady = true;
        }
    }
    
    createContrail() {
        // Create bomber contrail when moving fast
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        
        if (speed > 1 && Math.random() < 0.2) {
            const contrail = new PIXI.Graphics();
            contrail.beginFill(0xFFFFFF, 0.4);
            contrail.drawCircle(0, 0, 1);
            contrail.endFill();
            
            contrail.x = this.x + (Math.random() - 0.5) * 4;
            contrail.y = this.y + 18;
            contrail.life = 40 + Math.random() * 20;
            contrail.maxLife = contrail.life;
            
            if (IdleAnts.app && IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(contrail);
                this.contrailParticles.push(contrail);
            }
        }
        
        // Update existing contrail
        for (let i = this.contrailParticles.length - 1; i >= 0; i--) {
            const contrail = this.contrailParticles[i];
            contrail.life--;
            contrail.alpha = contrail.life / contrail.maxLife * 0.4;
            contrail.scale.set(1 + (1 - contrail.life / contrail.maxLife) * 2);
            
            if (contrail.life <= 0) {
                if (contrail.parent) {
                    contrail.parent.removeChild(contrail);
                }
                this.contrailParticles.splice(i, 1);
            }
        }
    }
    
    // Auto-save functionality
    triggerAutoSave() {
        if (this.autoSaveTriggered) return;
        
        this.autoSaveTriggered = true;
        
        // Create auto-save notification
        this.createAutoSaveNotification();
        
        // Trigger actual save (if game has save system)
        if (IdleAnts.app && IdleAnts.app.saveGame) {
            setTimeout(() => {
                IdleAnts.app.saveGame();
            }, 1000);
        } else if (typeof localStorage !== 'undefined') {
            // Fallback save to localStorage
            setTimeout(() => {
                try {
                    const gameState = {
                        timestamp: Date.now(),
                        bomberBeetleSave: true,
                        // Add more game state as needed
                    };
                    localStorage.setItem('idle_ants_bomber_save', JSON.stringify(gameState));
                    console.log('Bomber Beetle auto-save completed!');
                } catch (error) {
                    console.warn('Auto-save failed:', error);
                }
            }, 1000);
        }
    }
    
    createAutoSaveNotification() {
        // Visual notification that auto-save was triggered
        const notification = new PIXI.Graphics();
        notification.beginFill(0x90EE90, 0.9);
        notification.drawRoundedRect(-25, -8, 50, 16, 4);
        notification.endFill();
        
        // Add save icon
        notification.lineStyle(2, 0x228B22);
        notification.drawRect(-5, -3, 6, 6);
        notification.drawRect(-3, -5, 2, 3);
        
        // Add text would go here in a real implementation
        
        notification.x = this.x;
        notification.y = this.y - 25;
        notification.life = 120; // 2 seconds
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(notification);
            
            const animateNotification = () => {
                notification.life--;
                notification.y -= 0.5;
                
                if (notification.life < 30) {
                    notification.alpha = notification.life / 30;
                }
                
                if (notification.life <= 0) {
                    if (notification.parent) {
                        notification.parent.removeChild(notification);
                    }
                } else {
                    requestAnimationFrame(animateNotification);
                }
            };
            animateNotification();
        }
    }
    
    // Find enemies for bombing run
    findBombingTargets() {
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return [];
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        const targets = [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= 100) {
                targets.push(enemy);
            }
        }
        
        return targets;
    }
    
    // Dive bombing attack
    diveBomb() {
        if (!this.diveBombReady || this._attackTimer > 0 || !this.bombShells || this.bombShells.length === 0) return;
        
        const targets = this.findBombingTargets();
        if (targets.length === 0) return;
        
        // Start bombing run
        this._attackTimer = this.attackCooldown;
        this.diveBombReady = false;
        this.bombingCooldown = 240; // 4 second cooldown
        this.bombingRuns++;
        
        // Drop bomb
        const bomb = this.bombShells.pop();
        this.bombBay.removeChild(bomb);
        
        // Create bombing effect
        this.createBombingEffect(targets[0]);
    }
    
    createBombingEffect(target) {
        // Falling bomb animation
        const bomb = new PIXI.Graphics();
        bomb.beginFill(0x2F4F2F);
        bomb.drawEllipse(0, 0, 2, 4);
        bomb.endFill();
        
        // Fins
        bomb.lineStyle(1, 0x696969);
        bomb.moveTo(-1, 2);
        bomb.lineTo(-2, 3);
        bomb.moveTo(1, 2);
        bomb.lineTo(2, 3);
        
        bomb.x = this.x;
        bomb.y = this.y;
        bomb.rotation = 0;
        bomb.target = target;
        
        if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(bomb);
            
            const animateBomb = () => {
                // Bomb falls toward target
                const dx = bomb.target.x - bomb.x;
                const dy = bomb.target.y - bomb.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 5) {
                    bomb.x += dx * 0.1;
                    bomb.y += dy * 0.1;
                    bomb.rotation += 0.1;
                    requestAnimationFrame(animateBomb);
                } else {
                    // Bomb hits target
                    this.createExplosion(bomb.x, bomb.y);
                    
                    // Damage target
                    if (bomb.target.takeDamage) {
                        bomb.target.takeDamage(this.attackDamage);
                    }
                    
                    if (bomb.parent) {
                        bomb.parent.removeChild(bomb);
                    }
                }
            };
            animateBomb();
        }
    }
    
    createExplosion(x, y) {
        // Bomb explosion effect
        for (let i = 0; i < 12; i++) {
            const fragment = new PIXI.Graphics();
            fragment.beginFill(0xFF4500, 0.9);
            fragment.drawCircle(0, 0, 1 + Math.random() * 2);
            fragment.endFill();
            
            fragment.x = x;
            fragment.y = y;
            
            const angle = (i / 12) * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            fragment.vx = Math.cos(angle) * speed;
            fragment.vy = Math.sin(angle) * speed;
            fragment.life = 20 + Math.random() * 15;
            fragment.maxLife = fragment.life;
            
            if (IdleAnts.app && IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(fragment);
                
                const animateFragment = () => {
                    fragment.x += fragment.vx;
                    fragment.y += fragment.vy;
                    fragment.vx *= 0.95;
                    fragment.vy *= 0.95;
                    fragment.life--;
                    fragment.alpha = fragment.life / fragment.maxLife;
                    
                    if (fragment.life <= 0) {
                        if (fragment.parent) {
                            fragment.parent.removeChild(fragment);
                        }
                    } else {
                        requestAnimationFrame(animateFragment);
                    }
                };
                animateFragment();
            }
        }
        
        // Screen shake
        if (IdleAnts.app && IdleAnts.app.cameraManager) {
            IdleAnts.app.cameraManager.shake(4, 200);
        }
    }
    
    // Override update method
    update(nestPosition, foods) {
        const actionResult = super.update(nestPosition, foods);
        
        // Update attack timer
        if (this._attackTimer > 0) {
            this._attackTimer--;
        }
        
        // Try dive bomb
        this.diveBomb();
        return actionResult;
    }
    
    // Clean up contrail when destroyed
    destroy() {
        for (const contrail of this.contrailParticles) {
            if (contrail.parent) {
                contrail.parent.removeChild(contrail);
            }
        }
        this.contrailParticles = [];
        
        if (super.destroy) {
            super.destroy();
        }
    }
    
    // Debug info
    getDebugInfo() {
        return {
            autoSaved: this.autoSaveTriggered,
            bombShells: this.bombShells ? this.bombShells.length : 0,
            bombingRuns: this.bombingRuns,
            diveBombReady: this.diveBombReady
        };
    }
};
