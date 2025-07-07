// src/effects/CelebrationEffect.js
IdleAnts.Effects.CelebrationEffect = class extends IdleAnts.Effects.Effect {
    constructor(x, y, type = 'default') {
        super(x, y, 2000); // 2 second duration
        this.type = type;
        this.particles = [];
        this.confetti = [];
        this.sparkles = [];
        this.stars = [];
        this.createCelebration();
    }
    
    createCelebration() {
        const colors = {
            'default': [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFEFA65, 0xF79F1F, 0xE56B6F],
            'ant_unlock': [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4],
            'upgrade': [0x45B7D1, 0x96CEB4, 0xFEFA65, 0xF79F1F],
            'achievement': [0xFF6B6B, 0xE56B6F, 0xF79F1F, 0xFEFA65, 0x4ECDC4]
        };
        
        const celebrationColors = colors[this.type] || colors.default;
        
        // Create confetti particles
        for (let i = 0; i < 30; i++) {
            this.confetti.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * 400,
                vy: (Math.random() - 0.5) * 400,
                color: celebrationColors[Math.floor(Math.random() * celebrationColors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 8 + 4,
                gravity: 200,
                life: 1.0
            });
        }
        
        // Create sparkles
        for (let i = 0; i < 20; i++) {
            this.sparkles.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                color: celebrationColors[Math.floor(Math.random() * celebrationColors.length)],
                size: Math.random() * 3 + 2,
                life: 1.0,
                twinkle: Math.random() * Math.PI * 2
            });
        }
        
        // Create stars
        for (let i = 0; i < 15; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100,
                scale: Math.random() * 0.5 + 0.5,
                color: celebrationColors[Math.floor(Math.random() * celebrationColors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                life: 1.0
            });
        }
        
        // Create burst particles
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * (Math.random() * 150 + 100),
                vy: Math.sin(angle) * (Math.random() * 150 + 100),
                color: celebrationColors[Math.floor(Math.random() * celebrationColors.length)],
                size: Math.random() * 4 + 2,
                life: 1.0,
                decay: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        const dt = deltaTime / 1000;
        
        // Update confetti
        this.confetti.forEach(particle => {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vy += particle.gravity * dt;
            particle.rotation += particle.rotationSpeed;
            particle.life -= dt * 0.5;
        });
        
        // Update sparkles
        this.sparkles.forEach(particle => {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life -= dt * 0.7;
            particle.twinkle += dt * 10;
        });
        
        // Update stars
        this.stars.forEach(star => {
            star.rotation += star.rotationSpeed;
            star.life -= dt * 0.3;
            star.scale *= 1.01;
        });
        
        // Update burst particles
        this.particles.forEach(particle => {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            particle.life -= dt * particle.decay;
        });
    }
    
    render(graphics) {
        // Draw confetti
        this.confetti.forEach(particle => {
            if (particle.life > 0) {
                graphics.beginFill(particle.color, particle.life * 0.8);
                graphics.drawRect(
                    this.x + particle.x - particle.size/2,
                    this.y + particle.y - particle.size/2,
                    particle.size,
                    particle.size
                );
                graphics.endFill();
            }
        });
        
        // Draw sparkles with twinkling effect
        this.sparkles.forEach(particle => {
            if (particle.life > 0) {
                const alpha = particle.life * (0.5 + Math.sin(particle.twinkle) * 0.5);
                graphics.beginFill(particle.color, alpha);
                graphics.drawCircle(
                    this.x + particle.x,
                    this.y + particle.y,
                    particle.size
                );
                graphics.endFill();
            }
        });
        
        // Draw stars
        this.stars.forEach(star => {
            if (star.life > 0) {
                graphics.beginFill(star.color, star.life * 0.9);
                const size = star.scale * 8;
                this.drawStar(graphics, this.x + star.x, this.y + star.y, 5, size, size/2, star.rotation);
                graphics.endFill();
            }
        });
        
        // Draw burst particles
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                graphics.beginFill(particle.color, particle.life * 0.7);
                graphics.drawCircle(
                    this.x + particle.x,
                    this.y + particle.y,
                    particle.size
                );
                graphics.endFill();
            }
        });
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
}