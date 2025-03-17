// src/effects/LarvaeEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.LarvaeEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFF00, scale = 1.5) {
        super(app, x, y);
        this.duration = 7.0; // 7 seconds duration - extended from 2 seconds to 7 seconds
        this.color = color;
        this.scale = scale;
        console.log(`LarvaeEffect constructor at (${x}, ${y}) with scale ${scale}`);
    }
    
    create() {
        console.log(`Creating larvae effect at (${this.x}, ${this.y})`);
        
        // Create a container for the larvae effect
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Apply the scale from constructor
        this.container.scale.set(this.scale);
        
        // Try to use the asset textures if available
        if (IdleAnts.app && IdleAnts.app.assetManager) {
            try {
                // Create egg sprite from asset
                const eggTexture = IdleAnts.app.assetManager.getTexture('egg');
                if (eggTexture) {
                    this.egg = new PIXI.Sprite(eggTexture);
                    this.egg.anchor.set(0.5);
                    this.container.addChild(this.egg);
                    console.log("Using egg texture from assets");
                } else {
                    this.createEggGraphic();
                }
                
                // Create larvae sprite from asset
                const larvaeTexture = IdleAnts.app.assetManager.getTexture('larvae');
                if (larvaeTexture) {
                    this.larvae = new PIXI.Sprite(larvaeTexture);
                    this.larvae.anchor.set(0.5);
                    this.larvae.alpha = 0; // Start invisible
                    this.container.addChild(this.larvae);
                    console.log("Using larvae texture from assets");
                } else {
                    this.createLarvaeGraphic();
                }
            } catch (error) {
                console.error("Error loading asset textures:", error);
                this.createEggGraphic();
                this.createLarvaeGraphic();
            }
        } else {
            // Fallback to creating graphics directly
            this.createEggGraphic();
            this.createLarvaeGraphic();
        }
        
        // Create hatching particles
        this.createParticles();
        
        // Make sure we're adding to the world container if possible
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            console.log("Adding larvae effect to world container");
            IdleAnts.app.worldContainer.addChild(this.container);
            
            // Bring to front
            IdleAnts.app.worldContainer.setChildIndex(
                this.container, 
                IdleAnts.app.worldContainer.children.length - 1
            );
        } else {
            console.log("Adding larvae effect to app stage");
            this.app.stage.addChild(this.container);
        }
    }
    
    createEggGraphic() {
        // Create a bright glow behind everything
        this.glow = new PIXI.Graphics();
        this.glow.beginFill(0xFFFF00, 0.4); // Bright yellow glow
        this.glow.drawCircle(0, 0, 14); // Reduced from 20
        this.glow.endFill();
        this.container.addChild(this.glow);
        
        // Create a highlight circle behind the egg for better visibility
        this.highlight = new PIXI.Graphics();
        this.highlight.beginFill(0xFFFFAA, 0.5); // Light yellow glow, more opaque
        this.highlight.drawCircle(0, 0, 10.5); // Reduced from 15
        this.highlight.endFill();
        this.container.addChild(this.highlight);
        
        // Create the egg graphic
        this.egg = new PIXI.Graphics();
        this.egg.beginFill(0xFFFFF0); // Off-white color for egg
        this.egg.drawEllipse(0, 0, 5, 7); // Reduced from 7, 10
        this.egg.endFill();
        
        // Add a slight shadow to the egg
        this.egg.beginFill(0xEEEEDD, 0.3);
        this.egg.drawEllipse(0.7, 0.7, 4.2, 6.3); // Reduced from 1, 1, 6, 9
        this.egg.endFill();
        
        // Add a thicker border to the egg for better visibility
        this.egg.lineStyle(1.4, 0xAA9900); // Reduced from 2
        this.egg.drawEllipse(0, 0, 5, 7); // Reduced from 7, 10
        
        this.container.addChild(this.egg);
    }
    
    createLarvaeGraphic() {
        // Create the larvae
        this.larvae = new PIXI.Graphics();
        this.larvae.beginFill(0xFFFF00); // Bright yellow for larvae
        this.larvae.drawEllipse(0, 0, 3.5, 5); // Reduced from 5, 7
        this.larvae.endFill();
        
        // Add some segmentation to the larvae
        this.larvae.lineStyle(1, 0xAA9900); // Reduced from 1.5
        this.larvae.moveTo(-3.5, -2.1); // Reduced from -5, -3
        this.larvae.lineTo(3.5, -2.1); // Reduced from 5, -3
        this.larvae.moveTo(-3.5, 0); // Reduced from -5, 0
        this.larvae.lineTo(3.5, 0); // Reduced from 5, 0
        this.larvae.moveTo(-3.5, 2.1); // Reduced from -5, 3
        this.larvae.lineTo(3.5, 2.1); // Reduced from 5, 3
        
        // Add a thicker border to the larvae for better visibility
        this.larvae.lineStyle(1.4, 0xAA9900); // Reduced from 2
        this.larvae.drawEllipse(0, 0, 3.5, 5); // Reduced from 5, 7
        
        this.larvae.alpha = 0; // Start invisible
        this.container.addChild(this.larvae);
    }
    
    createParticles() {
        // Create hatching particles
        this.particles = [];
        const particleCount = 16; // Even more particles
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0xFFFF00); // Bright yellow
            particle.drawCircle(0, 0, 1.75); // Reduced from 2.5
            particle.endFill();
            
            const angle = (i / particleCount) * Math.PI * 2;
            particle.vx = Math.cos(angle) * 2.5; // Faster movement
            particle.vy = Math.sin(angle) * 2.5;
            particle.alpha = 0; // Start invisible
            particle.delay = i * 0.05; // Stagger the appearance
            
            this.container.addChild(particle);
            this.particles.push(particle);
        }
    }
    
    update(delta) {
        // Call the parent update method to track elapsed time
        super.update(delta);
        
        // Calculate progress (0 to 1)
        const progress = this.elapsed / this.duration;
        
        // Update glow if it exists
        if (this.glow) {
            this.glow.alpha = 0.4 + Math.sin(progress * Math.PI * 6) * 0.3;
            this.glow.scale.set(1 + Math.sin(progress * Math.PI * 3) * 0.2);
        }
        
        // Update highlight if it exists
        if (this.highlight) {
            this.highlight.alpha = 0.5 + Math.sin(progress * Math.PI * 4) * 0.3;
        }
        
        // First 60%: egg pulsates and starts to crack
        if (progress < 0.6) {
            // Normalize progress for this phase (0-1)
            const eggPhaseProgress = progress / 0.6;
            
            // Egg slightly expands and then contracts
            const eggScale = 1 + Math.sin(eggPhaseProgress * Math.PI) * 0.2;
            this.egg.scale.set(eggScale);
            
            // In the last part of this phase, start showing some particles
            if (eggPhaseProgress > 0.8) {
                // Calculate particle progress
                const particleProgress = (eggPhaseProgress - 0.8) * 5; // 0-1 for the last 20% of egg phase
                
                // Show a few particles
                for (let i = 0; i < Math.min(4, this.particles.length); i++) {
                    const particle = this.particles[i];
                    
                    // Fade in
                    particle.alpha = Math.min(1, particleProgress);
                    
                    // Move slightly
                    particle.x = particle.vx * particleProgress * 5;
                    particle.y = particle.vy * particleProgress * 5;
                }
            }
        } 
        // Next 20%: egg cracks and particles appear
        else if (progress < 0.8) {
            // Normalize progress for this phase (0-1)
            const crackPhaseProgress = (progress - 0.6) / 0.2;
            
            // Egg cracks more visibly
            const eggScale = 1 + Math.sin(crackPhaseProgress * Math.PI * 3) * 0.3;
            this.egg.scale.set(eggScale);
            
            // Update particles
            for (let i = 0; i < this.particles.length; i++) {
                const particle = this.particles[i];
                
                // Only start showing particles after their delay
                if (i / this.particles.length < crackPhaseProgress) {
                    // Calculate particle progress
                    const particleProgress = Math.min(1, (crackPhaseProgress - (i / this.particles.length)) * 3);
                    
                    // Fade in and then out
                    particle.alpha = Math.sin(particleProgress * Math.PI);
                    
                    // Move outward
                    particle.x = particle.vx * particleProgress * 12;
                    particle.y = particle.vy * particleProgress * 12;
                }
            }
        } 
        // Final 20%: egg fades out, larvae appears
        else {
            const finalPhaseProgress = (progress - 0.8) / 0.2; // 0 to 1 for final phase
            
            // Egg fades out
            this.egg.alpha = 1 - finalPhaseProgress;
            
            // Larvae fades in and grows slightly
            this.larvae.alpha = finalPhaseProgress;
            const larvaeScale = 0.8 + finalPhaseProgress * 0.8;
            this.larvae.scale.set(larvaeScale);
            
            // Add a more pronounced wiggle to the larvae
            this.larvae.rotation = Math.sin(finalPhaseProgress * Math.PI * 8) * 0.4;
            
            // Continue particle animation
            for (let i = 0; i < this.particles.length; i++) {
                const particle = this.particles[i];
                
                // Fade out any remaining particles
                particle.alpha = Math.max(0, 1 - finalPhaseProgress * 2);
                
                // Continue moving outward
                const particleDistance = 12 + finalPhaseProgress * 10;
                particle.x = particle.vx * particleDistance;
                particle.y = particle.vy * particleDistance;
            }
        }
        
        // Return whether the effect is still active
        return this.active;
    }
    
    destroy() {
        // Remove the effect from the stage
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
            console.log("Larvae effect removed from stage");
        }
        this.active = false;
    }
}; 