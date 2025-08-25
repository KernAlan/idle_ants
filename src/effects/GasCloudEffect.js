// src/effects/GasCloudEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.GasCloudEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0x32CD32, scale = 1.0, options = {}) {
        super(app, x, y);
        this.color = color;
        this.scale = scale;
        
        // Gas cloud properties
        this.duration = options.duration || 300; // 5 seconds at 60fps
        this.radius = options.radius || 40;
        this.damage = options.damage || 5;
        this.gasColor = options.color || 0x32CD32;
        
        // Visual properties
        this.particles = [];
        this.maxParticles = 20;
        this.particleSpawnRate = 0.3;
        
        // Damage tracking
        this.damageTimer = 0;
        this.damageInterval = 20; // Damage every 20 frames (1/3 second)
    }
    
    create() {
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Create initial gas cloud base
        this.createGasBase();
        
        // Create initial particles
        for (let i = 0; i < 8; i++) {
            this.createGasParticle();
        }
        
        this.app.stage.addChild(this.container);
    }
    
    createGasBase() {
        // Create base gas cloud
        this.gasBase = new PIXI.Graphics();
        this.gasBase.beginFill(this.gasColor, 0.3);
        this.gasBase.drawCircle(0, 0, this.radius * 0.6);
        this.gasBase.endFill();
        
        this.container.addChild(this.gasBase);
    }
    
    createGasParticle() {
        if (this.particles.length >= this.maxParticles) return;
        
        const particle = new PIXI.Graphics();
        const particleSize = 2 + Math.random() * 4;
        const particleAlpha = 0.4 + Math.random() * 0.3;
        
        particle.beginFill(this.gasColor, particleAlpha);
        particle.drawCircle(0, 0, particleSize);
        particle.endFill();
        
        // Random position within gas cloud
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * this.radius * 0.5;
        particle.x = Math.cos(angle) * distance;
        particle.y = Math.sin(angle) * distance;
        
        // Movement properties
        particle.vx = (Math.random() - 0.5) * 1.0;
        particle.vy = (Math.random() - 0.5) * 1.0;
        particle.life = 60 + Math.random() * 60;
        particle.maxLife = particle.life;
        particle.baseAlpha = particleAlpha;
        
        this.container.addChild(particle);
        this.particles.push(particle);
    }
    
    update(delta) {
        super.update(delta);
        
        // Update gas base
        this.updateGasBase();
        
        // Update particles
        this.updateParticles();
        
        // Spawn new particles
        if (Math.random() < this.particleSpawnRate && this.elapsed < this.duration * 0.016) {
            this.createGasParticle();
        }
        
        // Apply damage to enemies
        this.updateDamage();
        
        return this.active;
    }
    
    updateGasBase() {
        if (!this.gasBase) return;
        
        // Pulse the base gas cloud
        const lifePercent = Math.max(0, 1 - (this.elapsed / (this.duration * 0.016)));
        const pulseFactor = 0.8 + Math.sin(this.elapsed * 8) * 0.2;
        
        this.gasBase.scale.set(pulseFactor * lifePercent);
        this.gasBase.alpha = 0.3 * lifePercent;
        this.gasBase.rotation += 0.02;
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Slow down gradually
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Update life and appearance
            particle.life--;
            const lifePercent = particle.life / particle.maxLife;
            particle.alpha = particle.baseAlpha * lifePercent;
            particle.scale.set(1 + (1 - lifePercent) * 1.5);
            
            // Remove dead particles
            if (particle.life <= 0 || particle.alpha <= 0.01) {
                this.container.removeChild(particle);
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateDamage() {
        this.damageTimer++;
        
        // Only apply damage at intervals
        if (this.damageTimer < this.damageInterval) return;
        this.damageTimer = 0;
        
        // Find enemies in gas cloud
        if (!IdleAnts.app || !IdleAnts.app.entityManager) return;
        
        const enemies = IdleAnts.app.entityManager.entities.enemies || [];
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance <= this.radius) {
                // Apply damage over time
                if (enemy.takeDamage) {
                    enemy.takeDamage(this.damage);
                }
                
                // Visual feedback
                this.createDamageIndicator(enemy);
            }
        }
    }
    
    createDamageIndicator(enemy) {
        // Create small damage indicator
        const indicator = new PIXI.Graphics();
        indicator.beginFill(0x90EE90, 0.8);
        indicator.drawCircle(0, 0, 2);
        indicator.endFill();
        
        indicator.x = enemy.x + (Math.random() - 0.5) * 10;
        indicator.y = enemy.y - 10;
        indicator.vy = -1;
        indicator.life = 30;
        
        if (this.app.stage) {
            this.app.stage.addChild(indicator);
            
            // Animate indicator
            const updateIndicator = () => {
                indicator.y += indicator.vy;
                indicator.life--;
                indicator.alpha = indicator.life / 30;
                
                if (indicator.life <= 0) {
                    if (indicator.parent) {
                        indicator.parent.removeChild(indicator);
                    }
                } else {
                    requestAnimationFrame(updateIndicator);
                }
            };
            updateIndicator();
        }
    }
    
    destroy() {
        // Clean up particles
        for (const particle of this.particles) {
            if (particle.parent) {
                particle.parent.removeChild(particle);
            }
        }
        this.particles = [];
        
        // Call parent destroy
        super.destroy();
    }
};