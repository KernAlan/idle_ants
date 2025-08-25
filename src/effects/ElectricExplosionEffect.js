// src/effects/ElectricExplosionEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.ElectricExplosionEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0x00BFFF, scale = 1.0, options = {}) {
        super(app, x, y);
        this.color = color;
        this.scale = scale;
        
        // Electric explosion properties
        this.duration = options.duration || 90; // 1.5 seconds at 60fps
        this.radius = options.radius || 120;
        this.lightningBolts = options.lightningBolts || 12;
        this.chainLightning = options.chainLightning || false;
        this.chargeLevel = options.chargeLevel || 50;
        
        // Visual elements
        this.bolts = [];
        this.electricRings = [];
        this.sparkParticles = [];
    }
    
    create() {
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Create initial lightning bolts
        this.createLightningBolts();
        
        // Create electric rings
        this.createElectricRings();
        
        // Create spark particles
        this.createSparkParticles();
        
        this.app.stage.addChild(this.container);
    }
    
    createLightningBolts() {
        for (let i = 0; i < this.lightningBolts; i++) {
            const bolt = this.createLightningBolt(i);
            this.bolts.push(bolt);
            this.container.addChild(bolt);
        }
    }
    
    createLightningBolt(index) {
        const bolt = new PIXI.Graphics();
        
        // Random direction for each bolt
        const angle = (index / this.lightningBolts) * Math.PI * 2;
        const boltLength = this.radius * (0.5 + Math.random() * 0.5);
        
        // Electric colors
        const boltColors = [0xFFFFFF, 0x00BFFF, 0x87CEEB, 0xFFFF00];
        const boltColor = boltColors[Math.floor(Math.random() * boltColors.length)];
        
        bolt.lineStyle(3 + Math.random() * 2, boltColor, 0.9);
        
        // Create jagged lightning path
        let currentX = 0;
        let currentY = 0;
        bolt.moveTo(currentX, currentY);
        
        const segments = 8 + Math.floor(Math.random() * 6);
        for (let i = 1; i <= segments; i++) {
            const progress = i / segments;
            const targetX = Math.cos(angle) * boltLength * progress;
            const targetY = Math.sin(angle) * boltLength * progress;
            
            // Add jagged variation
            const jag = (Math.random() - 0.5) * 20;
            const jagAngle = angle + Math.PI / 2;
            const jagX = targetX + Math.cos(jagAngle) * jag;
            const jagY = targetY + Math.sin(jagAngle) * jag;
            
            bolt.lineTo(jagX, jagY);
            currentX = jagX;
            currentY = jagY;
        }
        
        bolt.life = this.duration;
        bolt.maxLife = bolt.life;
        bolt.flickerCounter = 0;
        
        return bolt;
    }
    
    createElectricRings() {
        // Create expanding electric rings
        for (let i = 0; i < 3; i++) {
            const ring = new PIXI.Graphics();
            
            ring.lineStyle(2 - i * 0.5, this.color, 0.7 - i * 0.2);
            ring.drawCircle(0, 0, 10 + i * 5);
            
            ring.life = this.duration - i * 10;
            ring.maxLife = ring.life;
            ring.baseRadius = 10 + i * 5;
            ring.expansionRate = 2 + i;
            
            this.electricRings.push(ring);
            this.container.addChild(ring);
        }
    }
    
    createSparkParticles() {
        // Create electric spark particles
        const particleCount = 20 + Math.floor(this.chargeLevel / 5);
        
        for (let i = 0; i < particleCount; i++) {
            const spark = new PIXI.Graphics();
            
            const sparkColors = [0xFFFFFF, 0x00BFFF, 0xFFFF00];
            const sparkColor = sparkColors[Math.floor(Math.random() * sparkColors.length)];
            
            // Draw a tiny star-like polygon (no drawStar API dependency)
            spark.beginFill(sparkColor, 0.9);
            this.drawStarPolygon(spark, 0, 0, 5, 2, 1);
            spark.endFill();
            
            // Random position within explosion radius
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.radius * 0.3;
            spark.x = Math.cos(angle) * distance;
            spark.y = Math.sin(angle) * distance;
            
            // Random velocity
            const vel = 2 + Math.random() * 4;
            spark.vx = Math.cos(angle) * vel;
            spark.vy = Math.sin(angle) * vel;
            
            spark.life = 30 + Math.random() * 30;
            spark.maxLife = spark.life;
            spark.rotationSpeed = (Math.random() - 0.5) * 0.3;
            
            this.sparkParticles.push(spark);
            this.container.addChild(spark);
        }
    }

    // Helper: draw a star polygon using moveTo/lineTo
    drawStarPolygon(g, cx, cy, points = 5, outerR = 2, innerR = 1) {
        const step = Math.PI / points;
        let angle = -Math.PI / 2; // start at top
        g.moveTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        for (let i = 0; i < points; i++) {
            angle += step;
            g.lineTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
            angle += step;
            g.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        }
    }
    
    update(delta) {
        super.update(delta);
        
        // Update lightning bolts
        this.updateLightningBolts();
        
        // Update electric rings
        this.updateElectricRings();
        
        // Update spark particles
        this.updateSparkParticles();
        
        // Create additional bolts during explosion
        if (this.elapsed < this.duration * 0.016 * 0.3 && Math.random() < 0.1) {
            const newBolt = this.createLightningBolt(Math.floor(Math.random() * 20));
            this.bolts.push(newBolt);
            this.container.addChild(newBolt);
        }
        
        return this.active;
    }
    
    updateLightningBolts() {
        for (let i = this.bolts.length - 1; i >= 0; i--) {
            const bolt = this.bolts[i];
            
            bolt.life--;
            bolt.flickerCounter += 0.5;
            
            // Flickering effect
            bolt.alpha = 0.5 + Math.sin(bolt.flickerCounter) * 0.5;
            
            // Fade out over time
            const lifePercent = bolt.life / bolt.maxLife;
            bolt.alpha *= lifePercent;
            
            // Remove dead bolts
            if (bolt.life <= 0) {
                this.container.removeChild(bolt);
                this.bolts.splice(i, 1);
            }
        }
    }
    
    updateElectricRings() {
        for (let i = this.electricRings.length - 1; i >= 0; i--) {
            const ring = this.electricRings[i];
            
            ring.life--;
            
            // Expand ring
            const lifePercent = 1 - (ring.life / ring.maxLife);
            const currentRadius = ring.baseRadius + (ring.expansionRate * lifePercent * 20);
            
            // Redraw ring at new size
            ring.clear();
            ring.lineStyle(2, this.color, ring.life / ring.maxLife * 0.7);
            ring.drawCircle(0, 0, currentRadius);
            
            // Remove dead rings
            if (ring.life <= 0) {
                this.container.removeChild(ring);
                this.electricRings.splice(i, 1);
            }
        }
    }
    
    updateSparkParticles() {
        for (let i = this.sparkParticles.length - 1; i >= 0; i--) {
            const spark = this.sparkParticles[i];
            
            // Update position
            spark.x += spark.vx;
            spark.y += spark.vy;
            
            // Apply drag
            spark.vx *= 0.98;
            spark.vy *= 0.98;
            
            // Rotate
            spark.rotation += spark.rotationSpeed;
            
            // Fade
            spark.life--;
            const lifePercent = spark.life / spark.maxLife;
            spark.alpha = lifePercent;
            spark.scale.set(0.5 + lifePercent * 0.5);
            
            // Remove dead sparks
            if (spark.life <= 0) {
                this.container.removeChild(spark);
                this.sparkParticles.splice(i, 1);
            }
        }
    }
    
    destroy() {
        // Clean up all elements
        this.bolts = [];
        this.electricRings = [];
        this.sparkParticles = [];
        
        super.destroy();
    }
};
