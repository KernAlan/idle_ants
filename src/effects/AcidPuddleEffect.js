// src/effects/AcidPuddleEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.AcidPuddleEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFF00, scale = 1.0, options = {}) {
        super(app, x, y);
        this.color = color;
        this.scale = scale;
        
        // Acid puddle properties
        this.duration = options.duration || 600; // 10 seconds at 60fps
        this.radius = options.radius || 30;
        this.damage = options.damage || 3;
        this.acidColor = options.color || 0xFFFF00;
        this.glowColor = options.glowColor || 0xFFFACD;
        
        // Visual properties
        this.bubbles = [];
        this.maxBubbles = 12;
        this.bubbleSpawnRate = 0.2;
        
        // Damage tracking
        this.damageTimer = 0;
        this.damageInterval = 15; // Damage every 15 frames (1/4 second)
        
        // Animation properties
        this.waveCounter = 0;
        this.acidLevel = 1.0;
    }
    
    create() {
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Create acid puddle layers
        this.createAcidBase();
        this.createAcidSurface();
        this.createAcidGlow();
        
        // Create initial bubbles
        for (let i = 0; i < 5; i++) {
            this.createAcidBubble();
        }
        
        this.app.stage.addChild(this.container);
    }
    
    createAcidBase() {
        // Dark acid base
        this.acidBase = new PIXI.Graphics();
        this.acidBase.beginFill(0x8B8000, 0.8); // Dark yellow-green
        this.acidBase.drawEllipse(0, 0, this.radius, this.radius * 0.6);
        this.acidBase.endFill();
        
        this.container.addChild(this.acidBase);
    }
    
    createAcidSurface() {
        // Bright acid surface
        this.acidSurface = new PIXI.Graphics();
        this.updateAcidSurface();
        
        this.container.addChild(this.acidSurface);
    }
    
    updateAcidSurface() {
        if (!this.acidSurface) return;
        
        this.acidSurface.clear();
        this.acidSurface.beginFill(this.acidColor, 0.7);
        
        // Create wavy acid surface
        const segments = 16;
        const waveAmplitude = 2 + Math.sin(this.waveCounter) * 1;
        
        this.acidSurface.moveTo(this.radius, 0);
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const wave = Math.sin(this.waveCounter + angle * 3) * waveAmplitude;
            const currentRadius = (this.radius - 2) + wave;
            
            const x = Math.cos(angle) * currentRadius;
            const y = Math.sin(angle) * currentRadius * 0.6;
            
            this.acidSurface.lineTo(x, y);
        }
        
        this.acidSurface.endFill();
    }
    
    createAcidGlow() {
        // Acid glow effect
        this.acidGlow = new PIXI.Graphics();
        this.acidGlow.beginFill(this.glowColor, 0.3);
        this.acidGlow.drawCircle(0, 0, this.radius + 8);
        this.acidGlow.endFill();
        
        // Add behind other layers
        this.container.addChildAt(this.acidGlow, 0);
    }
    
    createAcidBubble() {
        if (this.bubbles.length >= this.maxBubbles) return;
        
        const bubble = new PIXI.Graphics();
        const bubbleSize = 1 + Math.random() * 3;
        const bubbleAlpha = 0.6 + Math.random() * 0.3;
        
        // Bubble with highlight
        bubble.beginFill(this.acidColor, bubbleAlpha);
        bubble.drawCircle(0, 0, bubbleSize);
        bubble.endFill();
        
        // Bubble highlight
        bubble.beginFill(0xFFFFFF, 0.4);
        bubble.drawCircle(-bubbleSize * 0.3, -bubbleSize * 0.3, bubbleSize * 0.4);
        bubble.endFill();
        
        // Random position within puddle
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (this.radius - bubbleSize);
        bubble.x = Math.cos(angle) * distance;
        bubble.y = Math.sin(angle) * distance * 0.6;
        
        // Bubble properties
        bubble.life = 30 + Math.random() * 60;
        bubble.maxLife = bubble.life;
        bubble.riseSpeed = 0.2 + Math.random() * 0.3;
        bubble.baseSize = bubbleSize;
        
        this.container.addChild(bubble);
        this.bubbles.push(bubble);
    }
    
    update(delta) {
        super.update(delta);
        
        // Update wave animation
        this.waveCounter += 0.1;
        this.updateAcidSurface();
        
        // Update acid level (gradually shrinks)
        const lifePercent = Math.max(0, 1 - (this.elapsed / (this.duration * 0.016)));
        this.acidLevel = lifePercent;
        
        // Update visual elements
        this.updateAcidGlow();
        this.updateBubbles();
        
        // Spawn new bubbles
        if (Math.random() < this.bubbleSpawnRate && this.acidLevel > 0.2) {
            this.createAcidBubble();
        }
        
        // Apply damage to enemies
        this.updateDamage();
        
        return this.active;
    }
    
    updateAcidGlow() {
        if (!this.acidGlow) return;
        
        // Pulse the glow
        const pulseFactor = 0.7 + Math.sin(this.waveCounter * 2) * 0.3;
        this.acidGlow.scale.set(pulseFactor * this.acidLevel);
        this.acidGlow.alpha = 0.3 * this.acidLevel;
    }
    
    updateBubbles() {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            
            // Bubble rises and grows
            bubble.y -= bubble.riseSpeed;
            bubble.life--;
            
            const lifePercent = bubble.life / bubble.maxLife;
            const growthFactor = 1 + (1 - lifePercent) * 0.5;
            bubble.scale.set(growthFactor);
            bubble.alpha = lifePercent * 0.8;
            
            // Pop bubble when it reaches surface or dies
            if (bubble.life <= 0 || bubble.y < -this.radius * 0.6) {
                this.popBubble(bubble);
                this.container.removeChild(bubble);
                this.bubbles.splice(i, 1);
            }
        }
    }
    
    popBubble(bubble) {
        // Create small splash effect when bubble pops
        for (let i = 0; i < 4; i++) {
            const splash = new PIXI.Graphics();
            splash.beginFill(this.acidColor, 0.6);
            splash.drawCircle(0, 0, 1);
            splash.endFill();
            
            splash.x = bubble.x;
            splash.y = bubble.y;
            
            const angle = (i / 4) * Math.PI * 2;
            splash.vx = Math.cos(angle) * 2;
            splash.vy = Math.sin(angle) * 2;
            splash.life = 15;
            
            this.container.addChild(splash);
            
            // Animate splash
            const animateSplash = () => {
                splash.x += splash.vx;
                splash.y += splash.vy;
                splash.vx *= 0.9;
                splash.vy *= 0.9;
                splash.life--;
                splash.alpha = splash.life / 15;
                
                if (splash.life <= 0) {
                    this.container.removeChild(splash);
                } else {
                    setTimeout(animateSplash, 16);
                }
            };
            setTimeout(animateSplash, 16);
        }
    }
    
    updateDamage() {
        this.damageTimer++;
        
        // Only apply damage at intervals
        if (this.damageTimer < this.damageInterval) return;
        this.damageTimer = 0;
        
        // Find enemies in acid puddle
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return;
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= this.radius) {
                // Apply acid damage
                if (enemy.takeDamage) {
                    enemy.takeDamage(this.damage);
                }
                
                // Create acid damage effect on enemy
                this.createAcidDamageEffect(enemy);
            }
        }
    }
    
    createAcidDamageEffect(enemy) {
        // Create acid damage visualization on enemy
        const acidSplatter = new PIXI.Graphics();
        acidSplatter.beginFill(this.acidColor, 0.7);
        acidSplatter.drawCircle(0, 0, 1.5);
        acidSplatter.endFill();
        
        acidSplatter.x = enemy.x + (Math.random() - 0.5) * 8;
        acidSplatter.y = enemy.y + (Math.random() - 0.5) * 8;
        acidSplatter.life = 20;
        
        if (this.app.stage) {
            this.app.stage.addChild(acidSplatter);
            
            // Animate acid splatter
            const updateSplatter = () => {
                acidSplatter.life--;
                acidSplatter.alpha = acidSplatter.life / 20;
                acidSplatter.scale.set(1 + (1 - acidSplatter.life / 20) * 0.5);
                
                if (acidSplatter.life <= 0) {
                    if (acidSplatter.parent) {
                        acidSplatter.parent.removeChild(acidSplatter);
                    }
                } else {
                    requestAnimationFrame(updateSplatter);
                }
            };
            updateSplatter();
        }
    }
    
    destroy() {
        // Clean up bubbles
        for (const bubble of this.bubbles) {
            if (bubble.parent) {
                bubble.parent.removeChild(bubble);
            }
        }
        this.bubbles = [];
        
        // Call parent destroy
        super.destroy();
    }
};