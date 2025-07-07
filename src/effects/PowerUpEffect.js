// src/effects/PowerUpEffect.js
IdleAnts.Effects.PowerUpEffect = class extends IdleAnts.Effects.Effect {
    constructor(x, y, type = 'speed_boost') {
        super(x, y, 3000); // 3 second duration
        this.type = type;
        this.scale = 0;
        this.targetScale = 1;
        this.pulseTime = 0;
        this.floatOffset = 0;
        this.particles = [];
        this.createPowerUpVisuals();
    }
    
    createPowerUpVisuals() {
        const configs = {
            'speed_boost': {
                color: 0x00FF00,
                glowColor: 0x88FF88,
                symbol: '⚡',
                particleCount: 15
            },
            'food_rain': {
                color: 0xFF6B6B,
                glowColor: 0xFFAAAA,
                symbol: '🍯',
                particleCount: 20
            },
            'double_ants': {
                color: 0x4ECDC4,
                glowColor: 0x88E8E8,
                symbol: '🐜',
                particleCount: 25
            },
            'golden_touch': {
                color: 0xFFD700,
                glowColor: 0xFFE55C,
                symbol: '✨',
                particleCount: 30
            },
            'super_strength': {
                color: 0xFF4500,
                glowColor: 0xFF8A50,
                symbol: '💪',
                particleCount: 20
            }
        };
        
        this.config = configs[this.type] || configs.speed_boost;
        
        // Create swirling particles
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                angle: (Math.PI * 2 * i) / this.config.particleCount,
                distance: Math.random() * 30 + 20,
                speed: Math.random() * 2 + 1,
                size: Math.random() * 3 + 2,
                life: 1.0,
                color: this.config.color
            });
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        const dt = deltaTime / 1000;
        
        // Animate scale (pop in effect)
        if (this.scale < this.targetScale) {
            this.scale += dt * 8;
            if (this.scale > this.targetScale) {
                this.scale = this.targetScale;
            }
        }
        
        // Pulse effect
        this.pulseTime += dt * 5;
        
        // Float effect
        this.floatOffset += dt * 2;
        
        // Update particles
        this.particles.forEach(particle => {
            particle.angle += particle.speed * dt;
            particle.distance += Math.sin(particle.angle * 3) * 0.5;
            particle.life -= dt * 0.3;
        });
        
        // Remove dead particles and add new ones
        this.particles = this.particles.filter(p => p.life > 0);
        
        // Add new particles to maintain count
        while (this.particles.length < this.config.particleCount) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                distance: Math.random() * 30 + 20,
                speed: Math.random() * 2 + 1,
                size: Math.random() * 3 + 2,
                life: 1.0,
                color: this.config.color
            });
        }
    }
    
    render(graphics) {
        const currentScale = this.scale * (1 + Math.sin(this.pulseTime) * 0.1);
        const yOffset = Math.sin(this.floatOffset) * 5;
        
        // Draw outer glow
        graphics.beginFill(this.config.glowColor, 0.3);
        graphics.drawCircle(this.x, this.y + yOffset, 40 * currentScale);
        graphics.endFill();
        
        // Draw main circle
        graphics.beginFill(this.config.color, 0.8);
        graphics.drawCircle(this.x, this.y + yOffset, 25 * currentScale);
        graphics.endFill();
        
        // Draw inner highlight
        graphics.beginFill(0xFFFFFF, 0.4);
        graphics.drawCircle(this.x - 5 * currentScale, this.y - 5 * currentScale + yOffset, 8 * currentScale);
        graphics.endFill();
        
        // Draw swirling particles
        this.particles.forEach(particle => {
            const px = this.x + Math.cos(particle.angle) * particle.distance * currentScale;
            const py = this.y + Math.sin(particle.angle) * particle.distance * currentScale + yOffset;
            
            graphics.beginFill(particle.color, particle.life * 0.6);
            graphics.drawCircle(px, py, particle.size * currentScale);
            graphics.endFill();
        });
        
        // Draw sparkles around the power-up
        for (let i = 0; i < 8; i++) {
            const sparkleAngle = (Math.PI * 2 * i) / 8 + this.pulseTime;
            const sparkleDistance = 50 + Math.sin(this.pulseTime * 2) * 10;
            const sparkleX = this.x + Math.cos(sparkleAngle) * sparkleDistance * currentScale;
            const sparkleY = this.y + Math.sin(sparkleAngle) * sparkleDistance * currentScale + yOffset;
            
            graphics.beginFill(0xFFFFFF, 0.8);
            this.drawStar(graphics, sparkleX, sparkleY, 4, 4 * currentScale, 2 * currentScale, sparkleAngle);
            graphics.endFill();
        }
    }
    
    drawStar(graphics, x, y, points, outerRadius, innerRadius, rotation) {
        graphics.moveTo(x, y);
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points + rotation;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                graphics.moveTo(px, py);
            } else {
                graphics.lineTo(px, py);
            }
        }
        
        graphics.closePath();
    }
    
    // Method to get power-up description for UI
    getDescription() {
        const descriptions = {
            'speed_boost': 'Speed Boost! Ants move super fast! ⚡',
            'food_rain': 'Food Rain! Yummy food everywhere! 🍯',
            'double_ants': 'Double Ants! Twice the workforce! 🐜',
            'golden_touch': 'Golden Touch! Everything is worth more! ✨',
            'super_strength': 'Super Strength! Ants are mighty! 💪'
        };
        
        return descriptions[this.type] || 'Special Power-Up!';
    }
}