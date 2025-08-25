// src/entities/exploding/LeafCutterAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};
if (typeof IdleAnts.Entities.Exploding === 'undefined') IdleAnts.Entities.Exploding = {};

// Leaf Cutter Ant - explodes in a shower of sharp leaves
IdleAnts.Entities.Exploding.LeafCutterAnt = class extends IdleAnts.Entities.Ant {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Get ant type configuration
        const antType = IdleAnts.Data.AntTypes.LEAF_CUTTER_ANT;
        
        // Defensive check for missing ant type data
        if (!antType) {
            console.error('LeafCutterAnt: Unable to find LEAF_CUTTER_ANT configuration in IdleAnts.Data.AntTypes');
        }
        
        // Use standard Ant pathing/movement
        super(texture, nestPosition, speedMultiplier);

        // Apply type stats/props
        this.antType = antType || {
            color: 0x228B22,
            glowColor: 0x90EE90,
            damage: 370,
            hp: 20,
            effect: 'leafExplosion',
            explosionRadius: 90
        };
        this.tint = this.antType.color;
        this.maxHp = this.antType.hp;
        this.hp = this.maxHp;
        this.attackDamage = this.antType.damage;
        this.explosionRadius = this.antType.explosionRadius || 90;
        this.effectType = this.antType.effect;
        this.hasExploded = false;
        
        // Leaf-specific properties
        this.leafShards = [];
        this.leafStorage = [];
        this.maxLeafStorage = 8;
        this.leafGrowthCounter = 0;
    }
    
    // Override to create leaf-specific body
    createBody() {
        const color = (this.antType && this.antType.color) || 0x228B22;

        // Layer container: glow, body, sheen
        this.bodyContainer = new PIXI.Container();

        // Back glow halo (nature green)
        const glow = new PIXI.Graphics();
        for (let i = 0; i < 3; i++) {
            glow.beginFill(0x90EE90, 0.12 - i * 0.03);
            glow.drawCircle(0, 2, 16 + i * 4);
            glow.endFill();
        }
        glow.alpha = 0.32; this.bodyGlow = glow; this.bodyContainer.addChild(glow);

        const body = new PIXI.Graphics();
        body.beginFill(color);
        // Larger abdomen for leaf storage
        body.drawEllipse(0, 8, 8, 12);
        body.endFill();
        // Thorax
        body.beginFill(color); body.drawEllipse(0, 0, 7, 9); body.endFill();
        // Head
        body.beginFill(color); body.drawEllipse(0, -8, 6, 7); body.endFill();

        // Mandibles
        body.beginFill(0x654321, 0.9);
        body.drawEllipse(-4, -10, 2, 4);
        body.drawEllipse(4, -10, 2, 4);
        body.endFill();

        // Antennae
        body.lineStyle(2, 0x2A1B10);
        body.moveTo(-2, -12); body.lineTo(-4, -16);
        body.moveTo(2, -12);  body.lineTo(4, -16);

        // Subtle leaf storage compartments
        for (let i = 0; i < 3; i++) {
            const leafColor = i % 2 === 0 ? 0x228B22 : 0x32CD32;
            body.beginFill(leafColor, 0.65);
            body.drawEllipse(-4 + (i * 4), 6, 2, 4);
            body.endFill();
        }

        // Sheen
        const sheen = new PIXI.Graphics();
        sheen.beginFill(0xFFFFFF, 0.10);
        sheen.drawEllipse(-2, 4, 4.5, 1.8);
        sheen.endFill();
        this.bodySheen = sheen;

        this.bodyContainer.addChild(body);
        this.bodyContainer.addChild(sheen);
        this.addChild(this.bodyContainer);
    }
    
    // Provide body + standard legs like other ants
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
    }
    
    // Override to create leaf storage visual
    createDangerGlow() {
        // Create leaf aura instead of danger glow
        this.leafAura = new PIXI.Graphics();
        this.updateLeafAura();
        this.addChildAt(this.leafAura, 0);
        
        // Initialize leaf storage
        this.createInitialLeaves();
    }
    
    updateLeafAura() {
        if (!this.leafAura) return;
        
        this.leafAura.clear();
        
        // Green nature aura
        const leafCount = (this.leafStorage && this.leafStorage.length) || 0;
        const maxStorage = this.maxLeafStorage || 8;
        const auraIntensity = Math.min(1.0, leafCount / maxStorage);
        
        const glowColor = (this.antType && this.antType.glowColor) || 0x90EE90;
        this.leafAura.beginFill(glowColor, 0.2 + (auraIntensity * 0.2));
        this.leafAura.drawCircle(0, 0, 15 + (leafCount * 2));
        this.leafAura.endFill();
    }

    animateLeafAura() {
        if (!this.leafAura) return;
        const t = Date.now() * 0.003;
        const pulse = 0.95 + Math.sin(t) * 0.05;
        this.leafAura.scale.set(pulse);
        this.leafAura.alpha = Math.max(0.15, this.leafAura.alpha || 0.25);
    }
    
    createInitialLeaves() {
        // Start with some leaves in storage
        for (let i = 0; i < 4; i++) {
            this.addLeafToStorage();
        }
    }
    
    addLeafToStorage() {
        // Ensure leafStorage is initialized
        if (!this.leafStorage) {
            this.leafStorage = [];
        }
        
        const maxStorage = this.maxLeafStorage || 8;
        if (this.leafStorage.length >= maxStorage) return;
        
        const leaf = new PIXI.Graphics();
        
        // Create leaf shape
        leaf.beginFill(0x228B22, 0.8);
        
        // Draw leaf shape with multiple points
        leaf.moveTo(0, -3);
        leaf.lineTo(-2, -1);
        leaf.lineTo(-3, 1);
        leaf.lineTo(-1, 3);
        leaf.lineTo(0, 2);
        leaf.lineTo(1, 3);
        leaf.lineTo(3, 1);
        leaf.lineTo(2, -1);
        leaf.lineTo(0, -3);
        leaf.endFill();
        
        // Leaf vein
        leaf.lineStyle(1, 0x006400);
        leaf.moveTo(0, -2);
        leaf.lineTo(0, 2);
        
        // Position on ant's back
        const angle = (this.leafStorage.length / maxStorage) * Math.PI * 2;
        leaf.x = Math.cos(angle) * 6;
        leaf.y = 8 + Math.sin(angle) * 3;
        leaf.rotation = angle + Math.PI / 2;
        leaf.scale.set(0.7);
        
        this.addChild(leaf);
        this.leafStorage.push(leaf);
        
        this.updateLeafAura();
    }
    
    // Use Ant standard animation + leaf visuals
    performAnimation() {
        // Keep base movement look
        this.animateLegs();
        // Visual-only idle animations
        this.animateStoredLeaves();
        this.animateLeafAura();
        this.createLeafMotes();
        this.createNatureSwirl();
        // Pulse body glow/sheens
        const time = Date.now() * 0.006;
        if (this.bodyGlow) {
            const p = 0.97 + Math.sin(time) * 0.03; this.bodyGlow.scale.set(p);
        }
        if (this.bodySheen) {
            this.bodySheen.alpha = 0.08 + (Math.cos(time * 1.1) + 1) * 0.04;
        }
    }

    createLeafMotes() {
        if (Math.random() < 0.06 && this.parent) {
            const mote = new PIXI.Graphics();
            mote.beginFill(0x98FB98, 0.8); mote.drawRect(0, 0, 1, 1); mote.endFill();
            mote.x = this.x + (Math.random() - 0.5) * 12;
            mote.y = this.y + 6 + (Math.random() - 0.5) * 6;
            mote.vy = -0.4; mote.life = 18; this.parent.addChild(mote);
            const anim = () => { mote.life--; mote.y += mote.vy; mote.alpha = mote.life / 18; if (mote.life <= 0) { if (mote.parent) mote.parent.removeChild(mote); } else { requestAnimationFrame(anim); } };
            anim();
        }
    }

    createNatureSwirl() {
        if (Math.random() < 0.02 && this.parent) {
            const swirl = new PIXI.Graphics();
            swirl.lineStyle(1, 0x90EE90, 0.5);
            for (let i = 0; i < 4; i++) swirl.drawCircle(0, 0, 8 + i * 3);
            swirl.x = this.x; swirl.y = this.y; swirl.life = 24; this.parent.addChild(swirl);
            const anim = () => { swirl.life--; swirl.rotation += 0.04; swirl.alpha = swirl.life / 24 * 0.5; if (swirl.life <= 0) { if (swirl.parent) swirl.parent.removeChild(swirl); } else { requestAnimationFrame(anim); } };
            anim();
        }
    }
    
    growLeaves() {
        this.leafGrowthCounter++;
        
        // Grow new leaves over time
        const maxStorage = this.maxLeafStorage || 8;
        if (this.leafGrowthCounter % 60 === 0 && this.leafStorage && this.leafStorage.length < maxStorage) {
            this.addLeafToStorage();
        }
    }
    
    animateStoredLeaves() {
        // Gentle swaying of stored leaves
        if (!this.leafStorage) this.leafStorage = [];
        for (let i = 0; i < this.leafStorage.length; i++) {
            const leaf = this.leafStorage[i];
            if (leaf) {
                const sway = Math.sin(this.leafGrowthCounter * 0.05 + i) * 0.1;
                const maxStorage = this.maxLeafStorage || 8;
                leaf.rotation = (i / maxStorage) * Math.PI * 2 + Math.PI / 2 + sway;
            }
        }
    }
    
    // Override explosion to create leaf storm
    createExplosionEffect() {
        // Temporarily disabled explosion visuals to avoid residue
        return;
    }
    
    launchLeafShard(index, total) {
        const shard = new PIXI.Graphics();
        
        // Create sharp leaf shard
        shard.beginFill(0x228B22, 0.9);
        shard.moveTo(0, -4);
        shard.lineTo(-1.5, -1);
        shard.lineTo(-2, 2);
        shard.lineTo(0, 4);
        shard.lineTo(2, 2);
        shard.lineTo(1.5, -1);
        shard.lineTo(0, -4);
        shard.endFill();
        
        // Sharp edges
        shard.lineStyle(1, 0x006400);
        shard.moveTo(0, -4);
        shard.lineTo(0, 4);
        
        shard.x = this.x;
        shard.y = this.y;
        
        // Random direction with slight spread
        const baseAngle = (index / total) * Math.PI * 2;
        const angleVariation = (Math.random() - 0.5) * 0.5;
        const angle = baseAngle + angleVariation;
        
        const speed = 4 + Math.random() * 3;
        shard.vx = Math.cos(angle) * speed;
        shard.vy = Math.sin(angle) * speed;
        shard.rotation = angle;
        shard.rotationSpeed = (Math.random() - 0.5) * 0.3;
        
        shard.life = 40 + Math.random() * 20;
        shard.maxLife = shard.life;
        shard.damage = Math.floor(this.attackDamage * 0.3);
        
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(shard);
            this.leafShards.push(shard);
        } else if (IdleAnts.app && IdleAnts.app.stage) {
            IdleAnts.app.stage.addChild(shard);
            this.leafShards.push(shard);
        }
    }
    
    // Override update to handle leaf shard physics
    update(nestPosition, foods) {
        const actionResult = super.update(nestPosition, foods);
        this.updateLeafShards();
        return actionResult;
    }

    // Explosion/leaf storm on death, with Ant pathing retained
    die() {
        if (!this.hasExploded) {
            this.hasExploded = true;
            // Damage nearby enemies
            this.dealExplosionDamage();
            // Create leaf burst projectiles
            this.createLeafBurst();
            // Optional visuals
            this.createExplosionEffect();
        }
        super.die();
    }

    dealExplosionDamage() {
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return;
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        for (const enemy of enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= this.explosionRadius) {
                const damageMultiplier = 1 - (distance / this.explosionRadius);
                const finalDamage = Math.floor(this.attackDamage * damageMultiplier);
                if (finalDamage > 0 && typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(finalDamage);
                }
            }
        }
    }

    createLeafBurst() {
        const total = 14;
        for (let i = 0; i < total; i++) {
            this.launchLeafShard(i, total);
        }
    }
    
    updateLeafShards() {
        for (let i = this.leafShards.length - 1; i >= 0; i--) {
            const shard = this.leafShards[i];
            
            // Update position
            shard.x += shard.vx;
            shard.y += shard.vy;
            
            // Apply gravity and air resistance
            shard.vy += 0.1; // Gravity
            shard.vx *= 0.98;
            shard.vy *= 0.98;
            
            // Rotation
            shard.rotation += shard.rotationSpeed;
            
            // Fade and shrink
            shard.life--;
            const lifePercent = shard.life / shard.maxLife;
            shard.alpha = lifePercent;
            
            // Check collision with enemies
            this.checkLeafShardCollision(shard);
            
            // Remove dead shards
            if (shard.life <= 0) {
                if (shard.parent) {
                    shard.parent.removeChild(shard);
                }
                this.leafShards.splice(i, 1);
            }
        }
    }
    
    checkLeafShardCollision(shard) {
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return;
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - shard.x, 2) + Math.pow(enemy.y - shard.y, 2)
            );
            
            if (distance <= 8) {
                // Hit enemy
                if (enemy.takeDamage) {
                    enemy.takeDamage(shard.damage);
                }
                
                // Create hit effect
                this.createLeafHitEffect(shard.x, shard.y);
                
                // Remove shard
                if (shard.parent) {
                    shard.parent.removeChild(shard);
                }
                const index = this.leafShards.indexOf(shard);
                if (index > -1) {
                    this.leafShards.splice(index, 1);
                }
                break;
            }
        }
    }
    
    createLeafHitEffect(x, y) {
        // Small leaf particles on hit
        for (let i = 0; i < 5; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0x90EE90, 0.8);
            particle.drawCircle(0, 0, 1 + Math.random());
            particle.endFill();
            
            particle.x = x;
            particle.y = y;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.life = 15;
            
            if (IdleAnts.app && IdleAnts.app.stage) {
                IdleAnts.app.stage.addChild(particle);
                
                const animateParticle = () => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vx *= 0.95;
                    particle.vy *= 0.95;
                    particle.life--;
                    particle.alpha = particle.life / 15;
                    
                    if (particle.life <= 0) {
                        if (particle.parent) {
                            particle.parent.removeChild(particle);
                        }
                    } else {
                        requestAnimationFrame(animateParticle);
                    }
                };
                animateParticle();
            }
        }
    }
    
    // Clean up leaf shards
    destroy() {
        // Clean up leaf storage
        for (const leaf of this.leafStorage) {
            if (leaf.parent) {
                leaf.parent.removeChild(leaf);
            }
        }
        this.leafStorage = [];
        
        // Clean up flying shards
        for (const shard of this.leafShards) {
            if (shard.parent) {
                shard.parent.removeChild(shard);
            }
        }
        this.leafShards = [];
        
        if (super.destroy) {
            super.destroy();
        }
    }
};
