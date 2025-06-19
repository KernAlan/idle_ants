// src/entities/Nest.js
IdleAnts.Entities.Nest = class extends PIXI.Container {
    constructor(texture, x, y) {
        super();
        
        this.x = x;
        this.y = y;
        
        // Create the ant hill graphics
        this.createAntHill();
        
        // Animation properties
        this.animationTime = 0;
        this.baseScale = 1.0;
    }
    
    createAntHill() {
        // Main hill mound - bird's eye view
        this.hillBody = new PIXI.Graphics();
        
        // Outer ring - darkest brown (represents the excavated dirt ring)
        this.hillBody.beginFill(0x654321);
        this.hillBody.drawCircle(0, 0, 50); // Large outer circle
        this.hillBody.endFill();
        
        // Middle ring - medium brown
        this.hillBody.beginFill(0x8B4513);
        this.hillBody.drawCircle(0, 0, 35); // Medium circle
        this.hillBody.endFill();
        
        // Inner hill - lightest brown
        this.hillBody.beginFill(0xA0522D);
        this.hillBody.drawCircle(0, 0, 25); // Inner circle
        this.hillBody.endFill();
        
        // Central mound - raised center
        this.hillBody.beginFill(0xD2B48C);
        this.hillBody.drawCircle(0, 0, 15); // Central raised area
        this.hillBody.endFill();
        
        // Add texture with small dirt particles scattered around
        this.hillBody.lineStyle(0);
        this.hillBody.beginFill(0x5D4037, 0.6);
        for(let i = 0; i < 25; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 45; // Spread across the hill
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            this.hillBody.drawCircle(x, y, 1 + Math.random() * 2);
        }
        this.hillBody.endFill();
        
        // Add small rocks and debris
        this.hillBody.beginFill(0x696969, 0.8);
        for(let i = 0; i < 12; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 15 + Math.random() * 30;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            this.hillBody.drawCircle(x, y, 1.5 + Math.random() * 2);
        }
        this.hillBody.endFill();
        
        this.addChild(this.hillBody);
        
        // Create entrance tunnels
        this.createEntrances();
        
        // Add some grass around the hill
        this.createVegetation();
    }
    
    createEntrances() {
        // Main entrance - large tunnel opening in center
        this.mainEntrance = new PIXI.Graphics();
        this.mainEntrance.beginFill(0x2F1B14); // Very dark brown - tunnel interior
        this.mainEntrance.drawCircle(0, 0, 8); // Main entrance hole
        this.mainEntrance.endFill();
        
        // Add depth shadow
        this.mainEntrance.beginFill(0x1A0F0A, 0.8);
        this.mainEntrance.drawCircle(0, 0, 6); // Inner shadow
        this.mainEntrance.endFill();
        
        // Secondary entrances around the main one
        this.secondaryEntrance = new PIXI.Graphics();
        this.secondaryEntrance.beginFill(0x2F1B14);
        this.secondaryEntrance.drawCircle(-20, -10, 4); // Top-left entrance
        this.secondaryEntrance.drawCircle(18, 12, 3); // Bottom-right entrance
        this.secondaryEntrance.drawCircle(-8, 22, 3); // Bottom entrance
        this.secondaryEntrance.endFill();
        
        this.addChild(this.mainEntrance);
        this.addChild(this.secondaryEntrance);
    }
    
    createVegetation() {
        // Add small grass tufts around the hill - bird's eye view
        this.vegetation = new PIXI.Graphics();
        
        // Grass represented as small green circles/dots
        this.vegetation.lineStyle(0);
        this.vegetation.beginFill(0x228B22, 0.8);
        for(let i = 0; i < 15; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 45 + Math.random() * 15; // Around the outer edge
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            // Small grass clumps
            this.vegetation.drawCircle(x, y, 2 + Math.random() * 2);
            // Add smaller dots around for texture
            this.vegetation.drawCircle(x + Math.random() * 4 - 2, y + Math.random() * 4 - 2, 1);
        }
        this.vegetation.endFill();
        
        // Small flowers as tiny colored dots
        this.vegetation.beginFill(0xFFD700, 0.9); // Yellow flowers
        for(let i = 0; i < 6; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 10;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            this.vegetation.drawCircle(x, y, 1.5);
        }
        this.vegetation.endFill();
        
        // White flowers
        this.vegetation.beginFill(0xFFFAFA, 0.8);
        for(let i = 0; i < 4; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 48 + Math.random() * 12;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            this.vegetation.drawCircle(x, y, 1);
        }
        this.vegetation.endFill();
        
        this.addChild(this.vegetation);
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    update(delta = 1) {
        // Subtle breathing animation for the hill
        this.animationTime += delta * 0.02;
        const breathe = 1 + Math.sin(this.animationTime) * 0.008; // Very subtle 0.8% scale change
        this.scale.set(this.baseScale * breathe);
        
        // Occasionally make entrance tunnels "pulse" to show activity
        if(Math.random() < 0.002){ // Very rare
            this.pulseEntrance();
        }
    }
    
    pulseEntrance() {
        // Quick pulse animation for main entrance
        const originalAlpha = this.mainEntrance.alpha;
        this.mainEntrance.alpha = 0.7;
        
        // Restore after short time
        setTimeout(() => {
            if(this.mainEntrance) {
                this.mainEntrance.alpha = originalAlpha;
            }
        }, 150);
    }
    
    expand() {
        // Enhanced expansion animation
        const originalScale = this.baseScale;
        const targetScale = originalScale * 1.15; // Slightly larger expansion
        let progress = 0;
        
        const animateNest = () => {
            progress += 0.04; // Slower expansion
            
            if (progress >= 1) {
                this.baseScale = targetScale;
                this.scale.set(targetScale);
                
                // Add some particles when expansion completes
                this.createExpansionEffect();
                return;
            }
            
            // Smooth easing with slight bounce
            const easedProgress = Math.sin(progress * Math.PI / 2);
            const currentScale = originalScale + (targetScale - originalScale) * easedProgress;
            this.baseScale = currentScale;
            this.scale.set(currentScale);
            
            requestAnimationFrame(animateNest);
        };
        
        animateNest();
    }
    
    createExpansionEffect() {
        // Create small dirt particles flying out during expansion
        const particles = new PIXI.Graphics();
        
        for(let i = 0; i < 8; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 15;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particles.beginFill(0x8B4513, 0.8);
            particles.drawCircle(x, y, 1 + Math.random() * 1.5);
            particles.endFill();
        }
        
        this.addChild(particles);
        
        // Animate particles outward and fade
        let particleTime = 0;
        const animateParticles = () => {
            particleTime += 0.05;
            
            if(particleTime >= 1){
                this.removeChild(particles);
                return;
            }
            
            particles.alpha = 1 - particleTime;
            particles.scale.set(1 + particleTime * 0.5);
            
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }
} 