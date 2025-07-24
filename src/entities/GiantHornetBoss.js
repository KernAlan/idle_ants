// Japanese Giant Hornet - Aerial Assault Miniboss
IdleAnts.Entities.GiantHornetBoss = class extends PIXI.Container {
    constructor(textures, mapBounds) {
        super();

        // --- Core Entity Properties ---
        this.mapBounds = mapBounds;
        this.speed = 1.8;
        this.vx = 0; this.vy = 0;
        this.maxHp = 3000;
        this.hp = this.maxHp;
        this.attackDamage = 120;
        this.attackRange = 150;
        this.attackCooldown = 45;
        this._attackTimer = 0;
        this.perceptionRange = 400; // Reduced range to focus on nearby threats
        this.targetAnt = null;
        this.lastAttacker = null;
        this.foodValue = 4000;
        this.enemyName = "Giant Hornet";
        this.isDead = false;
        
        // Unique Giant Hornet properties
        this.diveBombTimer = 0;
        this.diveBombCooldown = 240; // Dive bomb every 4 seconds
        this.isDiveBombing = false;
        this.diveBombTarget = null;
        this.diveBombSpeed = 4.0;
        this.flightHeight = 200; // Flies higher but can move down to attack
        this.hoverRadius = 150;
        this.poisonCloudTimer = 0;
        this.poisonCloudCooldown = 300; // Poison cloud every 5 seconds
        
        // Fast straight-line flight properties
        this.patrolTimer = 0;
        this.patrolTarget = { x: 0, y: 0 }; // Current patrol destination
        this.isPatrolling = true; // Whether moving to patrol point
        this.speed = 2.8; // Increased base speed for zooming
        this.maxSpeed = 4.5; // Maximum speed when zooming to targets
        this.isLanded = false; // Track if hornet has landed to attack
        this.landingTimer = 0;
        this.maxLandingTime = 180; // 3 seconds at 60fps - stay longer to attack
        
        // Random zoom-off behavior
        this.zoomOffChance = 0.08; // 8% chance to zoom off instead of attacking (much more aggressive)
        this.swarmEscapeChance = 0.12; // 12% chance to escape when swarmed
        this.isZoomingOff = false; // Track if currently zooming away
        this.zoomOffTimer = 0;
        this.zoomOffDuration = 120; // 2 seconds of zooming off
        this.lastSwarmCheck = 0; // Timer for swarm escape checks
        
        // Position boss (spawn from center, high up)
        this.x = mapBounds.width * 0.5;
        this.y = 150; // Start lower so it can reach the queen
        
        // --- Build Professional Hornet from Scratch ---
        this.createHornetBody();
        this.createWings();
        this.createHornetHead();
        this.createStinger();
        
        // Direction tracking for movement like flying ants
        this.facingDirection = 1; // 1 = right, -1 = left
        this.targetRotation = 0;
        this.turnSpeed = 0.1;

        // --- Health Bar & Interactivity ---
        this.createHealthBar();
        this.healthBarTimer = 0;
        this.interactive = true;
        this.buttonMode = true;
        this.setupTooltip();

        // Animation state
        this.animationTimer = 0;
        this.isAttacking = false;
        this.wingBeatPhase = 0;
        this.lastVx = 0; // Track last horizontal velocity for direction
    }
    
    createHornetBody() {
        this.bodyContainer = new PIXI.Container();
        this.addChild(this.bodyContainer);
        
        // MASSIVE MENACING HORNET - 2x larger
        
        // Create thorax (middle section) - muscular and robust
        this.thorax = new PIXI.Graphics();
        this.thorax.beginFill(0xFF8C00); // Deep orange
        this.thorax.drawEllipse(0, -8, 20, 14); // Much larger thorax
        this.thorax.endFill();
        
        // Thorax armor plating
        this.thorax.lineStyle(2, 0xCC6600, 1.0);
        this.thorax.drawEllipse(0, -8, 20, 14);
        this.thorax.moveTo(-15, -15);
        this.thorax.lineTo(15, -15);
        this.thorax.moveTo(-18, -4);
        this.thorax.lineTo(18, -4);
        this.thorax.moveTo(-16, 2);
        this.thorax.lineTo(16, 2);
        this.thorax.lineStyle(0);
        
        // Muscle definition
        this.thorax.beginFill(0xCC6600, 0.6);
        this.thorax.drawEllipse(-8, -6, 6, 4);
        this.thorax.drawEllipse(8, -6, 6, 4);
        this.thorax.endFill();
        
        // Create MASSIVE abdomen with interlocking yellow and black ovals like the bee
        this.abdomen = new PIXI.Graphics();
        
        // Interlocking yellow and black stripe pattern like bee enemy
        const hornetColors = [0xFFDD00, 0x000000, 0xFFDD00, 0x000000, 0xFFDD00, 0x000000, 0xFFDD00];
        hornetColors.forEach((color, idx) => {
            this.abdomen.beginFill(color);
            const y = 10 + idx * 6; // Larger spacing for bigger hornet
            const width = 25 - idx * 1.5; // tapers toward end like bee
            this.abdomen.drawEllipse(0, y, width, 5);
            this.abdomen.endFill();
        });
        
        // Larger wasp waist connection
        this.waist = new PIXI.Graphics();
        this.waist.beginFill(0xFF8C00);
        this.waist.drawEllipse(0, 5, 7, 6);
        this.waist.endFill();
        
        // Waist armor
        this.waist.lineStyle(2, 0xCC6600);
        this.waist.drawEllipse(0, 5, 7, 6);
        this.waist.lineStyle(0);
        
        this.bodyContainer.addChild(this.thorax);
        this.bodyContainer.addChild(this.waist);
        this.bodyContainer.addChild(this.abdomen);
    }
    
    createHornetHead() {
        this.head = new PIXI.Graphics();
        
        // MASSIVE menacing head - much larger and more intimidating
        this.head.beginFill(0xFF8C00); // Deep orange
        this.head.drawEllipse(0, -30, 16, 12); // Much larger head
        this.head.endFill();
        
        // Head armor plating
        this.head.lineStyle(2, 0xCC6600);
        this.head.drawEllipse(0, -30, 16, 12);
        this.head.moveTo(-12, -35);
        this.head.lineTo(12, -35);
        this.head.lineStyle(0);
        
        // HUGE compound eyes - absolutely terrifying
        this.head.beginFill(0x000000);
        this.head.drawEllipse(-10, -33, 7, 8); // Much larger left eye
        this.head.drawEllipse(10, -33, 7, 8);  // Much larger right eye
        this.head.endFill();
        
        // Compound eye texture
        this.head.beginFill(0x330000);
        // Left eye hexagonal pattern
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                this.head.drawCircle(-10 + i * 2 - 3, -35 + j * 2, 0.8);
            }
        }
        // Right eye hexagonal pattern
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                this.head.drawCircle(10 - i * 2 + 3, -35 + j * 2, 0.8);
            }
        }
        this.head.endFill();
        
        // Terrifying eye glow
        this.head.beginFill(0xFF0000, 0.9);
        this.head.drawEllipse(-10, -35, 4, 5);
        this.head.drawEllipse(10, -35, 4, 5);
        this.head.endFill();
        
        // Bright menacing highlights
        this.head.beginFill(0xFFFFFF);
        this.head.drawCircle(-10, -37, 1.5);
        this.head.drawCircle(10, -37, 1.5);
        this.head.endFill();
        
        // MASSIVE menacing mandibles - much larger and sharper
        this.head.beginFill(0x000000);
        // Left mandible - much larger
        this.head.moveTo(-8, -22);
        this.head.lineTo(-15, -15);
        this.head.lineTo(-12, -12);
        this.head.lineTo(-4, -18);
        this.head.closePath();
        // Right mandible - much larger
        this.head.moveTo(8, -22);
        this.head.lineTo(15, -15);
        this.head.lineTo(12, -12);
        this.head.lineTo(4, -18);
        this.head.closePath();
        this.head.endFill();
        
        // Mandible serrations for extra menace
        this.head.lineStyle(1, 0x444444);
        this.head.moveTo(-12, -16);
        this.head.lineTo(-10, -14);
        this.head.moveTo(-11, -15);
        this.head.lineTo(-9, -13);
        this.head.moveTo(12, -16);
        this.head.lineTo(10, -14);
        this.head.moveTo(11, -15);
        this.head.lineTo(9, -13);
        this.head.lineStyle(0);
        
        // Longer, more menacing antennae
        this.head.lineStyle(3, 0x000000);
        this.head.moveTo(-6, -40);
        this.head.lineTo(-12, -50);
        this.head.lineTo(-15, -58);
        this.head.moveTo(6, -40);
        this.head.lineTo(12, -50);
        this.head.lineTo(15, -58);
        this.head.lineStyle(0);
        
        // Antenna joints
        this.head.beginFill(0x333333);
        this.head.drawCircle(-12, -50, 2);
        this.head.drawCircle(12, -50, 2);
        this.head.endFill();
        
        this.bodyContainer.addChild(this.head);
    }
    
    createStinger() {
        this.stinger = new PIXI.Graphics();
        
        // Define hornet colors like the bee
        const hornetOrange = 0xFF8C00; // Deep orange instead of red
        const hornetBlack = 0x2C1810;  // Same black as bee for outlines
        const darkOrange = 0xCC6600;   // Darker orange for details
        
        // MASSIVE deadly stinger - much more menacing
        // Venom sac base
        this.stinger.beginFill(0xFF0000);
        this.stinger.drawEllipse(0, 55, 8, 6); // Much larger venom sac
        this.stinger.endFill();
        
        // Venom sac segments
        this.stinger.lineStyle(2, 0x990000);
        this.stinger.drawEllipse(0, 55, 8, 6);
        this.stinger.moveTo(-6, 52);
        this.stinger.lineTo(6, 52);
        this.stinger.moveTo(-6, 58);
        this.stinger.lineTo(6, 58);
        this.stinger.lineStyle(0);
        
        // Long, deadly stinger shaft with bee-style black
        this.stinger.beginFill(hornetBlack); // Use consistent hornet black
        this.stinger.moveTo(-2, 61);
        this.stinger.lineTo(-1, 72); // Much longer stinger
        this.stinger.lineTo(0, 75);  // Sharp deadly tip
        this.stinger.lineTo(1, 72);
        this.stinger.lineTo(2, 61);
        this.stinger.closePath();
        this.stinger.endFill();
        
        // Barbs for extra menace with consistent black
        this.stinger.beginFill(hornetBlack);
        // Left barbs
        this.stinger.moveTo(-1, 65);
        this.stinger.lineTo(-3, 67);
        this.stinger.lineTo(-2, 68);
        this.stinger.closePath();
        this.stinger.moveTo(-1, 69);
        this.stinger.lineTo(-3, 71);
        this.stinger.lineTo(-2, 72);
        this.stinger.closePath();
        // Right barbs
        this.stinger.moveTo(1, 65);
        this.stinger.lineTo(3, 67);
        this.stinger.lineTo(2, 68);
        this.stinger.closePath();
        this.stinger.moveTo(1, 69);
        this.stinger.lineTo(3, 71);
        this.stinger.lineTo(2, 72);
        this.stinger.closePath();
        this.stinger.endFill();
        
        // Venom dripping effect
        this.stinger.beginFill(0xFFFF00, 0.8);
        this.stinger.drawCircle(-3, 53, 1.5);
        this.stinger.drawCircle(3, 53, 1.5);
        this.stinger.drawCircle(0, 75, 1); // Venom drop at tip
        this.stinger.endFill();
        
        // Warning markings on venom sac with bee-style black
        this.stinger.beginFill(hornetBlack);
        this.stinger.drawCircle(-6, 53, 1);
        this.stinger.drawCircle(-3, 57, 1);
        this.stinger.drawCircle(3, 57, 1);
        this.stinger.drawCircle(6, 53, 1);
        this.stinger.endFill();
        
        this.bodyContainer.addChild(this.stinger);
    }
    
    createWings() {
        // Create wing container
        this.wingsContainer = new PIXI.Container();
        this.addChild(this.wingsContainer);
        
        // Create LARGE menacing hornet wings
        this.leftWing = new PIXI.Graphics();
        this.leftWing.beginFill(0xFFFFFF, 0.85);
        // Much larger hornet wing shape
        this.leftWing.moveTo(0, 0);
        this.leftWing.lineTo(-4, -3);
        this.leftWing.lineTo(-20, -5);
        this.leftWing.lineTo(-25, 0);
        this.leftWing.lineTo(-20, 5);
        this.leftWing.lineTo(-4, 3);
        this.leftWing.closePath();
        this.leftWing.endFill();
        this.leftWing.position.set(-15, -12); // Positioned for larger body
        
        this.rightWing = new PIXI.Graphics();
        this.rightWing.beginFill(0xFFFFFF, 0.85);
        this.rightWing.moveTo(0, 0);
        this.rightWing.lineTo(4, -3);
        this.rightWing.lineTo(20, -5);
        this.rightWing.lineTo(25, 0);
        this.rightWing.lineTo(20, 5);
        this.rightWing.lineTo(4, 3);
        this.rightWing.closePath();
        this.rightWing.endFill();
        this.rightWing.position.set(15, -12);
        
        // Add wing venation
        this.addWingVenation(this.leftWing);
        this.addWingVenation(this.rightWing);
        
        this.wingsContainer.addChild(this.leftWing);
        this.wingsContainer.addChild(this.rightWing);
    }
    
    addWingVenation(wing) {
        // Professional wing veins for larger wings
        wing.lineStyle(1.5, 0x555555, 0.7);
        
        // Main wing veins
        wing.moveTo(-2, 0);
        wing.lineTo(-20, 0);
        
        wing.moveTo(-4, -2);
        wing.lineTo(-18, -3);
        wing.moveTo(-4, 2);
        wing.lineTo(-18, 3);
        
        // Cross veins for wing structure
        wing.lineStyle(1, 0x666666, 0.6);
        wing.moveTo(-8, -3);
        wing.lineTo(-8, 3);
        wing.moveTo(-12, -3);
        wing.lineTo(-12, 3);
        wing.moveTo(-16, -2);
        wing.lineTo(-16, 2);
        
        // Wing tip reinforcement
        wing.lineStyle(1.2, 0x444444, 0.8);
        wing.moveTo(-18, -2);
        wing.lineTo(-22, 0);
        wing.lineTo(-18, 2);
        
        wing.lineStyle(0);
    }

    // --- Inherited/Adapted Methods from Enemy.js ---
    setupTooltip() {
        this.on('pointerover', () => {
            this.showTooltip();
        });
        
        this.on('pointerout', () => {
            this.hideTooltip();
        });
    }
    
    showTooltip() {
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'enemy-tooltip';
            this.tooltip.style.cssText = `
                position: fixed; background: rgba(255, 140, 0, 0.9); color: white;
                padding: 8px 12px; border-radius: 4px; font-size: 14px;
                pointer-events: none; z-index: 10000; border: 1px solid rgba(255, 165, 0, 0.5);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(this.tooltip);
        }
        
        this.tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px; color: #FFA500;">${this.enemyName}</div>
            <div style="font-size: 12px; color: #ccc;">HP: ${this.hp}/${this.maxHp}</div>
            <div style="font-size: 12px; color: #FF6347;">Dive Bomb: ${this.isDiveBombing ? 'ACTIVE' : 'Ready'}</div>
            <div style="font-size: 12px; color: #ffeb3b;">Food Reward: ${Math.floor(this.foodValue)}</div>
        `;
        
        this.tooltip.style.display = 'block';
        this.updateTooltipPosition();
    }
    
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    }
    
    updateTooltipPosition() {
        if (this.tooltip && this.tooltip.style.display === 'block') {
            const screenPos = this.toGlobal(new PIXI.Point(0, 0));
            this.tooltip.style.left = (screenPos.x + 20) + 'px';
            this.tooltip.style.top = (screenPos.y - 40) + 'px';
        }
    }

    createHealthBar() {
        this.healthBarContainer = new PIXI.Container();
        IdleAnts.app.worldContainer.addChild(this.healthBarContainer);

        this.healthBarBg = new PIXI.Graphics();
        this.healthBarBg.beginFill(0x000000, 0.6);
        this.healthBarBg.drawRect(-15, 0, 30, 4);
        this.healthBarBg.endFill();
        this.healthBarContainer.addChild(this.healthBarBg);

        this.healthBarFg = new PIXI.Graphics();
        this.healthBarContainer.addChild(this.healthBarFg);
        this.updateHealthBar();
        this.healthBarContainer.visible = false;
    }

    updateHealthBar() {
        const ratio = Math.max(this.hp, 0) / this.maxHp;
        this.healthBarFg.clear();
        this.healthBarFg.beginFill(0xFF8C00); // Orange hornet color
        this.healthBarFg.drawRect(-15, 0, 30 * ratio, 4);
        this.healthBarFg.endFill();
        this.healthBarContainer.visible = true;
        this.healthBarTimer = 1800;
        this.healthBarContainer.x = this.x;
        this.healthBarContainer.y = this.y - 35;
    }

    takeDamage(dmg, attacker = null) {
        this.hp -= dmg;
        if (IdleAnts.game && IdleAnts.game.uiManager) {
            IdleAnts.game.uiManager.updateBossHealth(this.hp, this.maxHp);
        }
        
        if (attacker) {
            this.lastAttacker = attacker;
        }
        
        // Giant Hornet becomes more aggressive and faster when damaged
        if (this.hp < this.maxHp * 0.5) {
            this.speed = 2.2;
            this.diveBombCooldown = 180; // Dive bomb more frequently
            this.poisonCloudCooldown = 240; // Poison clouds more frequently
        }
        
        if (this.hp <= 0) this.die();
    }

    die() {
        if (this.lastAttacker && IdleAnts.app && IdleAnts.app.resourceManager) {
            IdleAnts.app.resourceManager.addFood(this.foodValue);
        }
        
        if (this.tooltip) {
            document.body.removeChild(this.tooltip);
            this.tooltip = null;
        }
        
        if (this.parent) this.parent.removeChild(this);
        this.isDead = true;
        if (this.healthBarContainer && this.healthBarContainer.parent) {
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
        }

        if (IdleAnts.game && typeof IdleAnts.game.onBossDefeated === 'function') {
            IdleAnts.game.onBossDefeated('giant_hornet');
        }
    }

    // Dive bomb attack - targets a specific ant with high-speed charge
    startDiveBomb(target) {
        if (this.isDiveBombing || !target) return;
        
        this.isDiveBombing = true;
        this.diveBombTarget = target;
        this.diveBombTimer = 0;
        
        // Calculate dive bomb trajectory
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        this.vx = (dx / dist) * this.diveBombSpeed;
        this.vy = (dy / dist) * this.diveBombSpeed;
        
        console.log(`Giant Hornet initiating dive bomb attack!`);
    }

    // Create poison cloud effect (visual representation)
    createPoisonCloud() {
        const cloudEffect = new PIXI.Graphics();
        cloudEffect.beginFill(0x32CD32, 0.3);
        cloudEffect.drawCircle(0, 0, 60);
        cloudEffect.endFill();
        
        cloudEffect.x = this.x;
        cloudEffect.y = this.y;
        
        if (this.parent) {
            this.parent.addChild(cloudEffect);
        }
        
        // Animate poison cloud
        let cloudTimer = 0;
        const cloudDuration = 120; // 2 seconds
        const cloudUpdate = () => {
            cloudTimer++;
            cloudEffect.alpha = Math.max(0, 0.4 - (cloudTimer / cloudDuration) * 0.4);
            
            if (cloudTimer >= cloudDuration) {
                if (cloudEffect.parent) {
                    cloudEffect.parent.removeChild(cloudEffect);
                }
            }
        };
        
        // Add to game loop (simplified approach)
        const cloudInterval = setInterval(() => {
            cloudUpdate();
            if (cloudTimer >= cloudDuration) {
                clearInterval(cloudInterval);
            }
        }, 16); // ~60fps
        
        console.log(`Giant Hornet released poison cloud!`);
    }

    attack(target) {
        if (this._attackTimer === 0) {
            target.takeDamage(this.attackDamage, this);
            this._attackTimer = this.attackCooldown;

            // Trigger attack animation
            this.isAttacking = true;
            this.animationTimer = 0;
            
            // Giant Hornet has chance to create poison cloud when attacking
            if (Math.random() < 0.4) {
                this.createPoisonCloud();
            }
        }
    }

    update(ants) {
        // Update rotation based on velocity like FlyingAnt
        if (this.vx !== 0 || this.vy !== 0) {
            // Calculate desired rotation based on movement direction
            const desiredRotation = Math.atan2(this.vy, this.vx) + Math.PI / 2;
            this.targetRotation = desiredRotation;
            
            // Smoothly interpolate current rotation towards target rotation
            let angleDiff = this.targetRotation - this.rotation;
            
            // Normalize to [-PI, PI]
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // Apply gradual rotation
            this.rotation += angleDiff * this.turnSpeed;
        }
        
        // Handle realistic wing beat animation like FlyingAnt
        this.wingBeatPhase += 0.5; // Match FlyingAnt wing animation speed
        const wingFlap = Math.sin(this.wingBeatPhase) * 0.6 + 0.4; // Match FlyingAnt scale pattern
        
        // Apply wing flap animation to Y-scale (like FlyingAnt)
        if (this.leftWing && this.rightWing) {
            this.leftWing.scale.y = wingFlap;
            this.rightWing.scale.y = wingFlap;
            
            // Wing transparency for flapping effect
            this.leftWing.alpha = 0.8 + Math.abs(Math.sin(this.wingBeatPhase)) * 0.2;
            this.rightWing.alpha = 0.8 + Math.abs(Math.sin(this.wingBeatPhase)) * 0.2;
        }

        // Handle attack animation - more aggressive
        if (this.isAttacking) {
            this.animationTimer++;
            const duration = 25; // Faster attack
            
            if (this.animationTimer < duration * 0.3) {
                // Rear back and prepare
                const prep = this.animationTimer / (duration * 0.3);
                if (this.stinger) this.stinger.rotation = -0.4 * prep;
                if (this.bodyContainer) this.bodyContainer.scale.set(1.0 + 0.1 * prep);
            } else if (this.animationTimer < duration) {
                // Lightning strike forward
                const strike = (this.animationTimer - duration * 0.3) / (duration * 0.7);
                if (this.stinger) this.stinger.rotation = -0.4 + 0.8 * strike;
                if (this.bodyContainer) this.bodyContainer.scale.set(1.1 - 0.1 * strike);
            } else {
                this.isAttacking = false;
                if (this.stinger) this.stinger.rotation = 0;
                if (this.bodyContainer) this.bodyContainer.scale.set(1.0);
            }
        } else {
            // Different animation when landed vs flying
            this.animationTimer++;
            
            if (this.isLanded) {
                // Landed animation - more aggressive, less movement
                const landedBob = Math.sin(this.animationTimer * 0.15) * 0.8;
                if (this.bodyContainer) {
                    this.bodyContainer.y = landedBob * 0.1; // Much less movement when landed
                    this.bodyContainer.x = 0; // No side to side when landed
                }
            } else {
                // Flying animation - more dynamic during zigzag
                const hover = Math.sin(this.animationTimer * 0.08) * 1.5;
                const bob = Math.sin(this.animationTimer * 0.05) * 0.8;
                
                if (this.bodyContainer) {
                    this.bodyContainer.y = hover * 0.4; // More dramatic when flying
                    this.bodyContainer.x = bob * 0.4;
                }
            }
            
            // Leg movement during flight (only if legs exist)
            if (this.legs && this.legs.length > 0) {
                this.legs.forEach((leg, i) => {
                    const legSway = Math.sin(this.animationTimer * 0.1 + i * 0.5) * 0.05; // Much subtler
                    leg.graphics.rotation = legSway;
                });
            }
        }

        // Dive bomb logic
        this.diveBombTimer++;
        if (!this.isDiveBombing && this.diveBombTimer >= this.diveBombCooldown) {
            // Find target for dive bomb (prefer queen over regular ants)
            const allTargets = [...ants];
            
            // Add queen to target list if available
            if (IdleAnts.app && IdleAnts.app.entityManager && IdleAnts.app.entityManager.entities.queen && 
                !IdleAnts.app.entityManager.entities.queen.isDead) {
                allTargets.push(IdleAnts.app.entityManager.entities.queen);
            }
            
            if (allTargets.length > 0) {
                // Use same targeting priority as regular AI - prioritize nearby threats
                let attackingAnts = allTargets.filter(target => !target.isQueen && target.targetEnemy === this);
                let nearbyAnts = allTargets.filter(target => {
                    if (target.isQueen) return false;
                    const dx = target.x - this.x;
                    const dy = target.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    return dist <= 250; // Close range for dive bomb
                });
                let queenTarget = allTargets.find(target => target.isQueen);
                
                let target;
                if (attackingAnts.length > 0) {
                    // Prioritize ants attacking us
                    target = attackingAnts[Math.floor(Math.random() * attackingAnts.length)];
                } else if (nearbyAnts.length > 0) {
                    // Then nearby ants
                    target = nearbyAnts[Math.floor(Math.random() * nearbyAnts.length)];
                } else if (queenTarget) {
                    // Only target queen if no ant threats
                    target = queenTarget;
                } else {
                    // Random fallback
                    target = allTargets[Math.floor(Math.random() * allTargets.length)];
                }
                
                this.startDiveBomb(target);
            }
            this.diveBombTimer = 0;
        }

        // Handle dive bomb execution
        if (this.isDiveBombing) {
            this.x += this.vx;
            this.y += this.vy;
            
            // Check if dive bomb hit target or went too far
            if (this.diveBombTarget) {
                const dx = this.diveBombTarget.x - this.x;
                const dy = this.diveBombTarget.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 50) {
                    // Hit target - deal extra damage
                    this.diveBombTarget.takeDamage(this.attackDamage * 1.5, this);
                    this.isDiveBombing = false;
                    this.diveBombTarget = null;
                } else if (dist > 500) {
                    // Missed target - stop dive bomb
                    this.isDiveBombing = false;
                    this.diveBombTarget = null;
                }
            }
        } else {
            // Poison cloud logic
            this.poisonCloudTimer++;
            if (this.poisonCloudTimer >= this.poisonCloudCooldown) {
                this.createPoisonCloud();
                this.poisonCloudTimer = 0;
            }

            // Dynamic targeting AI logic - prioritize nearby threats over distant queen
            let nearestAnt = null, antDistSq = Infinity;
            let queenTarget = null, queenDistSq = Infinity;
            let attackingAnt = null, attackingDistSq = Infinity;
            let closeAnt = null, closeDistSq = Infinity; // Ants within close range
            
            // Check all potential targets (ants + queen)
            const allTargets = [...ants];
            
            // Add queen to target list if available
            if (IdleAnts.app && IdleAnts.app.entityManager && IdleAnts.app.entityManager.entities.queen && 
                !IdleAnts.app.entityManager.entities.queen.isDead) {
                allTargets.push(IdleAnts.app.entityManager.entities.queen);
            }
            
            allTargets.forEach(target => {
                if (target.isDead) return; // Skip dead targets
                
                const dx = target.x - this.x;
                const dy = target.y - this.y;
                const d = dx * dx + dy * dy;
                const dist = Math.sqrt(d);
                
                if (dist <= this.perceptionRange) {
                    if (target.isQueen) {
                        // Track queen as potential target
                        if (d < queenDistSq) {
                            queenTarget = target;
                            queenDistSq = d;
                        }
                    } else {
                        // Check if this ant is attacking us (has us as target)
                        const isAttackingUs = target.targetEnemy === this;
                        const isVeryClose = dist <= 200; // Close range threshold
                        
                        if (isAttackingUs && d < attackingDistSq) {
                            // Prioritize ants that are attacking us
                            attackingAnt = target;
                            attackingDistSq = d;
                        } else if (isVeryClose && d < closeDistSq) {
                            // Track closest ant within close range
                            closeAnt = target;
                            closeDistSq = d;
                        } else if (d < antDistSq) {
                            // Track nearest ant as fallback
                            nearestAnt = target;
                            antDistSq = d;
                        }
                    }
                }
            });
            
            // NEW Priority: 1) Ants attacking us, 2) Close ants, 3) Queen (only if no nearby threats), 4) Nearest ant
            
            // Always switch to attacking ants if they exist (highest priority)
            if (attackingAnt && attackingAnt !== this.targetAnt) {
                this.targetAnt = attackingAnt;
            }
            // PRIORITIZE QUEEN over close ants (more aggressive)
            else if (!attackingAnt && queenTarget && this.targetAnt !== queenTarget) {
                const queenDist = Math.sqrt(queenDistSq);
                const nearbyThreats = allTargets.filter(target => {
                    if (target.isQueen || target.isDead) return false;
                    const dx = target.x - this.x;
                    const dy = target.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    return dist <= 150; // Only count very close threats
                }).length;
                
                // AGGRESSIVELY go after queen - much longer range, more threats tolerated
                if (queenDist <= 500 && nearbyThreats <= 3) {
                    this.targetAnt = queenTarget;
                }
            }
            // If can't get queen, THEN target close ants
            else if (!attackingAnt && closeAnt && closeAnt !== this.targetAnt) {
                this.targetAnt = closeAnt;
            }
            // Fallback to nearest ant if no other threats
            else if (!attackingAnt && !closeAnt && !queenTarget && nearestAnt && this.targetAnt !== nearestAnt) {
                this.targetAnt = nearestAnt;
            }
            
            // Clear target if current target is dead or out of range
            if (this.targetAnt && (this.targetAnt.isDead || 
                Math.sqrt((this.targetAnt.x - this.x) ** 2 + (this.targetAnt.y - this.y) ** 2) > this.perceptionRange)) {
                this.targetAnt = null;
            }
            
            // Modified special case: Only pursue distant queen if no ants are around
            if (!this.targetAnt && allTargets.length === 1 && // Only queen exists, no ants
                IdleAnts.app && IdleAnts.app.entityManager && 
                IdleAnts.app.entityManager.entities.queen && !IdleAnts.app.entityManager.entities.queen.isDead) {
                this.targetAnt = IdleAnts.app.entityManager.entities.queen;
            }

            if (this.targetAnt && !this.targetAnt.isDead) {
                const dx = this.targetAnt.x - this.x;
                const dy = this.targetAnt.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > this.attackRange) {
                    // Check if hornet should randomly zoom off (NEVER when targeting queen)
                    if (!this.isZoomingOff && !this.targetAnt.isQueen && Math.random() < this.zoomOffChance) {
                        this.startZoomOff();
                    }
                    
                    if (this.isZoomingOff) {
                        // Continue zooming off behavior
                        this.handleZoomOff();
                    } else {
                        // Fast straight-line approach to target - ZOOM directly at them
                        const approachSpeed = this.maxSpeed; // Use maximum speed when targeting
                        this.vx = (dx / dist) * approachSpeed;
                        this.vy = (dy / dist) * approachSpeed;
                        
                        this.x += this.vx;
                        this.y += this.vy;
                        
                        // Keep within bounds during fast approach
                        if (this.y > this.mapBounds.height - 50) {
                            this.y = this.mapBounds.height - 50;
                            this.vy = 0;
                        } else if (this.y < 30) {
                            this.y = 30;
                            this.vy = 0;
                        }
                        if (this.x < 30) {
                            this.x = 30;
                            this.vx = 0;
                        } else if (this.x > this.mapBounds.width - 30) {
                            this.x = this.mapBounds.width - 30;
                            this.vx = 0;
                        }
                    }
                } else {
                    // Close to target - check for swarm escape or land and attack
                    this.lastSwarmCheck++;
                    
                    // Check if swarmed and should escape (every 30 frames) - only 20% chance
                    if (this.lastSwarmCheck >= 30 && this.shouldEscapeSwarm(allTargets) && Math.random() < this.swarmEscapeChance) {
                        this.startZoomOff();
                        this.lastSwarmCheck = 0;
                        return; // Exit early to start zoom-off
                    }
                    
                    if (!this.isLanded && !this.isZoomingOff) {
                        // Landing approach - dive down to target level
                        this.vx = (dx / dist) * this.speed * 0.3;
                        this.vy = (dy / dist) * this.speed * 1.5; // Faster vertical descent
                        
                        this.x += this.vx;
                        this.y += this.vy;
                        
                        // Check if close enough to "land"
                        if (dist < 30) {
                            this.isLanded = true;
                            this.landingTimer = 0;
                            this.vx = 0;
                            this.vy = 0;
                        }
                    } else {
                        // Landed - stay in position and attack
                        this.landingTimer++;
                        this.vx = 0;
                        this.vy = 0;
                        
                        if (this._attackTimer === 0) {
                            this.attack(this.targetAnt);
                        }
                        
                        // Check if should escape while landed (every 20 frames)
                        if (this.landingTimer % 20 === 0 && Math.random() < this.swarmEscapeChance && this.shouldEscapeSwarm(allTargets)) {
                            this.isLanded = false;
                            this.landingTimer = 0;
                            this.startZoomOff();
                            return;
                        }
                        
                        // Take off after landing time expires or target moves away
                        if (this.landingTimer >= this.maxLandingTime || dist > 60) {
                            this.isLanded = false;
                            this.landingTimer = 0;
                            // Give upward boost to take off
                            this.vy = -2;
                        }
                    }
                }
            } else {
                // Handle zoom-off behavior or patrol
                if (this.isZoomingOff) {
                    this.handleZoomOff();
                } else {
                    // Fast straight-line patrol behavior when no target
                    this.performFastPatrol();
                }
            }
        }

        // Boundaries
        if (this.x < 50 || this.x > this.mapBounds.width - 50) this.vx *= -1;
        if (this.y < 50 || this.y > this.mapBounds.height - 50) this.vy *= -1;

        // Cooldown timer
        if (this._attackTimer > 0) this._attackTimer--;

        // Health bar update
        if (this.healthBarTimer > 0) {
            this.healthBarTimer--;
            if (this.healthBarTimer === 0) {
                this.healthBarContainer.visible = false;
            }
        }
        if (this.healthBarContainer) {
            this.healthBarContainer.x = this.x;
            this.healthBarContainer.y = this.y - 35;
        }
        this.updateTooltipPosition();
    }
    
    // Draw realistic hornet legs
    drawHornetLeg(graphics, baseAngle) {
        graphics.clear();
        
        // Hornet legs are thinner than spider legs but still substantial
        const segments = [
            { length: 12, thickness: 4, color: 0xFF8C00 },  // Coxa
            { length: 8, thickness: 3, color: 0xCC6600 },   // Trochanter
            { length: 20, thickness: 3, color: 0xFF8C00 },  // Femur
            { length: 18, thickness: 2, color: 0xCC6600 },  // Tibia
            { length: 10, thickness: 2, color: 0x994400 }   // Tarsus
        ];
        
        let currentX = 0;
        let currentY = 0;
        let currentAngle = baseAngle;
        
        segments.forEach((segment, index) => {
            const endX = currentX + Math.cos(currentAngle) * segment.length;
            const endY = currentY + Math.sin(currentAngle) * segment.length;
            
            // Draw segment
            graphics.lineStyle(segment.thickness, segment.color);
            graphics.moveTo(currentX, currentY);
            graphics.lineTo(endX, endY);
            
            // Add joint
            if (index < segments.length - 1) {
                graphics.beginFill(segment.color);
                graphics.drawCircle(endX, endY, segment.thickness * 0.6);
                graphics.endFill();
            }
            
            currentX = endX;
            currentY = endY;
            
            // Natural leg bending
            if (index === 1) currentAngle += 0.2;
            if (index === 3) currentAngle -= 0.3;
        });
        
        // Foot with small claws
        graphics.beginFill(0x000000);
        graphics.drawCircle(currentX, currentY, 2);
        graphics.endFill();
        
        // Tiny claws
        graphics.lineStyle(1, 0x000000);
        const claw1 = currentAngle + 0.3;
        const claw2 = currentAngle - 0.3;
        graphics.moveTo(currentX, currentY);
        graphics.lineTo(currentX + Math.cos(claw1) * 3, currentY + Math.sin(claw1) * 3);
        graphics.moveTo(currentX, currentY);
        graphics.lineTo(currentX + Math.cos(claw2) * 3, currentY + Math.sin(claw2) * 3);
    }
    
    // Fast straight-line patrol method
    performFastPatrol() {
        this.patrolTimer++;
        
        // Check if we need a new patrol destination or have reached current one
        const dx = this.patrolTarget.x - this.x;
        const dy = this.patrolTarget.y - this.y;
        const distToTarget = Math.sqrt(dx * dx + dy * dy);
        
        // Generate new patrol target if we're close or haven't set one
        if (distToTarget < 50 || this.patrolTimer % 300 === 0) { // New target every 5 seconds or when close
            this.patrolTarget.x = 50 + Math.random() * (this.mapBounds.width - 100);
            this.patrolTarget.y = 50 + Math.random() * (this.mapBounds.height - 100);
        }
        
        // Fly straight toward patrol target at normal speed
        if (distToTarget > 10) {
            this.vx = (dx / distToTarget) * this.speed;
            this.vy = (dy / distToTarget) * this.speed;
        } else {
            // Slow down when very close to target
            this.vx *= 0.5;
            this.vy *= 0.5;
        }
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Keep within bounds during patrol
        if (this.y > this.mapBounds.height - 40) {
            this.y = this.mapBounds.height - 40;
            this.patrolTarget.y = this.mapBounds.height - 80; // Force new target away from edge
        } else if (this.y < 40) {
            this.y = 40;
            this.patrolTarget.y = 80; // Force new target away from edge
        }
        
        if (this.x < 40) {
            this.x = 40;
            this.patrolTarget.x = 80; // Force new target away from edge
        } else if (this.x > this.mapBounds.width - 40) {
            this.x = this.mapBounds.width - 40;
            this.patrolTarget.x = this.mapBounds.width - 80; // Force new target away from edge
        }
    }
    
    // Start random zoom-off behavior
    startZoomOff() {
        this.isZoomingOff = true;
        this.zoomOffTimer = 0;
        
        // Pick a random direction to zoom off in
        const angle = Math.random() * Math.PI * 2;
        const zoomDistance = 300 + Math.random() * 200; // Zoom 300-500 pixels away
        
        // Calculate zoom-off destination
        this.patrolTarget.x = Math.max(50, Math.min(this.mapBounds.width - 50, this.x + Math.cos(angle) * zoomDistance));
        this.patrolTarget.y = Math.max(50, Math.min(this.mapBounds.height - 50, this.y + Math.sin(angle) * zoomDistance));
        
        console.log('Hornet zooming off randomly!');
    }
    
    // Handle zoom-off behavior
    handleZoomOff() {
        this.zoomOffTimer++;
        
        // Zoom toward the random destination at max speed
        const dx = this.patrolTarget.x - this.x;
        const dy = this.patrolTarget.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 20 && this.zoomOffTimer < this.zoomOffDuration) {
            // Continue zooming off
            this.vx = (dx / dist) * this.maxSpeed;
            this.vy = (dy / dist) * this.maxSpeed;
            
            this.x += this.vx;
            this.y += this.vy;
        } else {
            // Zoom-off complete, return to normal behavior
            this.isZoomingOff = false;
            this.zoomOffTimer = 0;
            // Clear current target so hornet reassesses threats
            this.targetAnt = null;
        }
        
        // Keep within bounds during zoom-off
        if (this.y > this.mapBounds.height - 40) {
            this.y = this.mapBounds.height - 40;
            this.isZoomingOff = false; // Stop zoom-off if hitting boundary
        } else if (this.y < 40) {
            this.y = 40;
            this.isZoomingOff = false;
        }
        
        if (this.x < 40) {
            this.x = 40;
            this.isZoomingOff = false;
        } else if (this.x > this.mapBounds.width - 40) {
            this.x = this.mapBounds.width - 40;
            this.isZoomingOff = false;
        }
    }
    
    // Check if hornet should escape due to being swarmed
    shouldEscapeSwarm(allTargets) {
        // Count ants within threatening range
        const swarmRadius = 150; // Range to check for swarm
        let nearbyAnts = 0;
        let attackingAnts = 0;
        
        allTargets.forEach(target => {
            if (target.isQueen || target.isDead) return;
            
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist <= swarmRadius) {
                nearbyAnts++;
                if (target.targetEnemy === this) {
                    attackingAnts++;
                }
            }
        });
        
        // Escape if:
        // - 4+ ants nearby, OR
        // - 3+ ants attacking, OR  
        // - 2+ attacking ants AND taking damage (hp < 80%)
        const isOverwhelmed = nearbyAnts >= 4 || 
                             attackingAnts >= 3 || 
                             (attackingAnts >= 2 && this.hp < this.maxHp * 0.8);
        
        if (isOverwhelmed) {
            console.log(`Hornet escaping swarm! Nearby: ${nearbyAnts}, Attacking: ${attackingAnts}`);
        }
        
        return isOverwhelmed;
    }
};  ''