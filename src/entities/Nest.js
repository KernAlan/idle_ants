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
        // Main hill mound
        this.hillBody = new PIXI.Graphics();
        
        // Base of the hill - dark brown earth
        this.hillBody.beginFill(0x8B4513); // Saddle brown
        this.hillBody.drawEllipse(0, 5, 45, 25); // Wide base
        this.hillBody.endFill();
        
        // Middle layer - lighter brown
        this.hillBody.beginFill(0xA0522D); // Sienna
        this.hillBody.drawEllipse(0, 0, 35, 20);
        this.hillBody.endFill();
        
        // Top layer - sandy brown
        this.hillBody.beginFill(0xD2B48C); // Tan
        this.hillBody.drawEllipse(0, -5, 25, 15);
        this.hillBody.endFill();
        
        // Add texture with small dirt particles
        this.hillBody.lineStyle(0);
        this.hillBody.beginFill(0x654321, 0.6); // Dark brown particles
        for(let i = 0; i < 20; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 35;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance * 0.6; // Flatten vertically
            this.hillBody.drawCircle(x, y, 0.8 + Math.random() * 1.2);
        }
        this.hillBody.endFill();
        
        // Add small rocks and debris
        this.hillBody.beginFill(0x696969, 0.8); // Dim gray rocks
        for(let i = 0; i < 8; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 20;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance * 0.6;
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
        // Main entrance - large tunnel opening
        this.mainEntrance = new PIXI.Graphics();
        this.mainEntrance.beginFill(0x2F1B14); // Very dark brown - tunnel interior
        this.mainEntrance.drawEllipse(0, 8, 8, 5); // Main entrance hole
        this.mainEntrance.endFill();
        
        // Add depth shadow
        this.mainEntrance.beginFill(0x1A0F0A, 0.8); // Even darker shadow
        this.mainEntrance.drawEllipse(0, 10, 6, 3);
        this.mainEntrance.endFill();
        
        // Secondary entrance - smaller
        this.secondaryEntrance = new PIXI.Graphics();
        this.secondaryEntrance.beginFill(0x2F1B14);
        this.secondaryEntrance.drawEllipse(-15, 3, 4, 2.5);
        this.secondaryEntrance.endFill();
        
        // Third entrance - tiny
        this.thirdEntrance = new PIXI.Graphics();
        this.thirdEntrance.beginFill(0x2F1B14);
        this.thirdEntrance.drawEllipse(18, 6, 3, 2);
        this.thirdEntrance.endFill();
        
        this.addChild(this.mainEntrance);
        this.addChild(this.secondaryEntrance);
        this.addChild(this.thirdEntrance);
    }
    
    createVegetation() {
        // Add small grass tufts around the hill
        this.vegetation = new PIXI.Graphics();
        
        // Grass blades
        this.vegetation.lineStyle(1.5, 0x228B22, 0.8); // Forest green
        for(let i = 0; i < 12; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 35 + Math.random() * 15;
            const baseX = Math.cos(angle) * distance;
            const baseY = Math.sin(angle) * distance * 0.6 + 20;
            
            // Draw grass blade
            this.vegetation.moveTo(baseX, baseY);
            this.vegetation.lineTo(baseX + (Math.random() - 0.5) * 4, baseY - 8 - Math.random() * 6);
        }
        
        // Small flowers
        this.vegetation.lineStyle(0);
        this.vegetation.beginFill(0xFFD700, 0.9); // Gold flowers
        for(let i = 0; i < 4; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 10;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance * 0.6 + 18;
            this.vegetation.drawCircle(x, y, 1.2);
        }
        this.vegetation.endFill();
        
        // Tiny white flowers
        this.vegetation.beginFill(0xFFFAFA, 0.8);
        for(let i = 0; i < 3; i++){
            const angle = Math.random() * Math.PI * 2;
            const distance = 38 + Math.random() * 12;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance * 0.6 + 16;
            this.vegetation.drawCircle(x, y, 0.8);
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