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
        const G = IdleAnts.Graphics;

        // Soft cast shadow so the mound sits *on* the ground rather than
        // floating as a flat disc of brown. Kept tight to the mound's footprint
        // so it grounds the shape instead of ringing it with a dark halo.
        const cast = G.softShadow(56, 50, 0.26);
        cast.position.set(5, 7);
        this.addChild(cast);

        // Main hill mound - bird's eye view
        this.hillBody = new PIXI.Graphics();

        // The mound is built from many concentric rings interpolating from the
        // dark excavated rim up to the sunlit crest. Each ring is offset a
        // little toward the upper-left light, which turns a flat bullseye into
        // a shape that reads as a raised cone.
        const RIM = 0x6b4a28;
        const MID = 0xa9773c;
        const CREST = 0xe4c496;
        const RINGS = 24;
        for (let i = 0; i < RINGS; i++) {
            const t = i / (RINGS - 1);
            const radius = 52 - t * 38;
            // Reaches the crest colour early so the mound reads as a broad
            // sunlit dome; only the outermost band stays in shadow.
            const color = t < 0.3
                ? G.mix(RIM, MID, t / 0.3)
                : G.mix(MID, CREST, (t - 0.3) / 0.7);
            this.hillBody.beginFill(color);
            this.hillBody.drawEllipse(-t * 5, -t * 6, radius, radius * 0.94);
            this.hillBody.endFill();
        }

        // Shadowed lower-right flank - a thin crescent along the base only.
        this.hillBody.beginFill(0x4a3218, 0.2);
        this.hillBody.moveTo(-40, 22);
        this.hillBody.quadraticCurveTo(0, 54, 42, 18);
        this.hillBody.quadraticCurveTo(4, 40, -40, 22);
        this.hillBody.endFill();

        // Loose dirt granules over the whole mound, brighter on the lit side.
        this.hillBody.lineStyle(0);
        for (let i = 0; i < 90; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance * 0.94;
            // Grains facing the light get the highlight colour.
            const facingLight = (x < 0 && y < 0);
            this.hillBody.beginFill(facingLight ? 0xf6e0bc : 0x6b4a28, facingLight ? 0.5 : 0.3);
            this.hillBody.drawCircle(x, y, 0.8 + Math.random() * 1.8);
            this.hillBody.endFill();
        }

        // Small rocks and debris embedded in the dirt, each with a highlight.
        for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 15 + Math.random() * 32;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance * 0.94;
            const r = 1.5 + Math.random() * 2;
            this.hillBody.beginFill(0x5a564f, 0.9);
            this.hillBody.drawEllipse(x, y, r, r * 0.8);
            this.hillBody.endFill();
            this.hillBody.beginFill(0x9c988f, 0.9);
            this.hillBody.drawEllipse(x - r * 0.25, y - r * 0.3, r * 0.55, r * 0.4);
            this.hillBody.endFill();
        }

        // Rim light along the top-left edge of the mound.
        this.hillBody.lineStyle(3, 0xffeecb, 0.4);
        this.hillBody.arc(0, 0, 49, Math.PI * 0.9, Math.PI * 1.7);
        this.hillBody.lineStyle(0);

        this.addChild(this.hillBody);

        // Create entrance tunnels
        this.createEntrances();

        // Add some grass around the hill
        this.createVegetation();
        this.createColonyFlag();
    }
    
    // A tiny leaf pennant makes home easy to spot. Static vector art, with no
    // ticker or particles: it scales with the hill during nest upgrades.
    createColonyFlag() {
        const flag = new PIXI.Graphics();
        flag.lineStyle(4, 0x654332);
        flag.moveTo(32, -12);
        flag.lineTo(32, -65);
        flag.lineStyle(1.5, 0xffe4ac);
        flag.moveTo(31, -14);
        flag.lineTo(31, -65);
        flag.lineStyle(2, 0x395d3b);
        flag.beginFill(0xffce58);
        flag.moveTo(33, -64);
        flag.bezierCurveTo(46, -70, 53, -54, 68, -61);
        flag.lineTo(61, -48);
        flag.bezierCurveTo(49, -43, 43, -59, 33, -51);
        flag.closePath();
        flag.endFill();
        flag.lineStyle(0);
        flag.beginFill(0x517f47);
        flag.drawEllipse(46, -57, 5, 3);
        flag.endFill();
        flag.beginFill(0xffedb6);
        flag.drawCircle(32, -67, 3);
        flag.endFill();
        this.addChild(flag);
    }

    createEntrances() {
        const G = IdleAnts.Graphics;

        // Main entrance - a tunnel mouth, not a flat dark dot. A bright lip of
        // piled soil, then rings darkening toward the centre so the hole looks
        // like it actually goes down into the ground.
        this.mainEntrance = new PIXI.Graphics();

        this.mainEntrance.beginFill(0xe0bd90, 0.9);
        this.mainEntrance.drawEllipse(-1, -1.5, 12, 11);
        this.mainEntrance.endFill();
        this.mainEntrance.beginFill(0x9c6c38);
        this.mainEntrance.drawEllipse(0, 0, 10, 9.2);
        this.mainEntrance.endFill();

        const DEPTH_RINGS = 8;
        for (let i = 0; i < DEPTH_RINGS; i++) {
            const t = i / (DEPTH_RINGS - 1);
            const r = 8.6 - t * 6;
            // Shift each deeper ring down-right: the near wall of the shaft is
            // lit, the far wall falls into shadow.
            this.mainEntrance.beginFill(G.mix(0x5a3a1e, 0x0b0603, t));
            this.mainEntrance.drawEllipse(t * 1.6, t * 1.8, r, r * 0.92);
            this.mainEntrance.endFill();
        }

        // Secondary entrances - same treatment at smaller scale.
        this.secondaryEntrance = new PIXI.Graphics();
        for (const [x, y, r] of [[-20, -10, 4.5], [18, 12, 3.6], [-8, 22, 3.6]]) {
            this.secondaryEntrance.beginFill(0xd6b083, 0.75);
            this.secondaryEntrance.drawEllipse(x - 0.5, y - 0.8, r + 1.6, r + 1.3);
            this.secondaryEntrance.endFill();
            for (let i = 0; i < 4; i++) {
                const t = i / 3;
                this.secondaryEntrance.beginFill(G.mix(0x4e3218, 0x0b0603, t));
                this.secondaryEntrance.drawEllipse(x + t * 0.9, y + t, r - t * r * 0.55, (r - t * r * 0.55) * 0.9);
                this.secondaryEntrance.endFill();
            }
        }

        this.addChild(this.mainEntrance);
        this.addChild(this.secondaryEntrance);
    }
    
    createVegetation() {
        // A fringe of real grass blades and flowers around the mound, which
        // softens the transition from bare dirt to lawn.
        this.vegetation = new PIXI.Graphics();
        const G = IdleAnts.Graphics;

        for (let i = 0; i < 46; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 46 + Math.random() * 16;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance * 0.96;

            // Blades radiate outward from the mound, leaning away from it.
            const length = 5 + Math.random() * 9;
            const lean = Math.cos(angle) * 4;
            const lit = Math.random() > 0.5;
            const color = G.shade(lit ? 0x5aa84c : 0x2f6f2c, 0.9 + Math.random() * 0.25);

            this.vegetation.lineStyle(1.9, G.shade(color, 0.55), 0.5);
            this.vegetation.moveTo(x, y);
            this.vegetation.quadraticCurveTo(x + lean * 0.4, y - length * 0.6, x + lean, y - length);
            this.vegetation.lineStyle(1.1, color);
            this.vegetation.moveTo(x, y);
            this.vegetation.quadraticCurveTo(x + lean * 0.4, y - length * 0.6, x + lean, y - length);
        }
        this.vegetation.lineStyle(0);

        // Little five-petal flowers rather than plain dots.
        for (let i = 0; i < 9; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 48 + Math.random() * 14;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance * 0.96;
            const white = Math.random() > 0.45;
            const size = 1.8 + Math.random();

            this.vegetation.beginFill(white ? 0xF6F4E8 : 0xFFD86B);
            for (let p = 0; p < 5; p++) {
                const a = (p / 5) * Math.PI * 2;
                this.vegetation.drawCircle(x + Math.cos(a) * size, y + Math.sin(a) * size, size * 0.8);
            }
            this.vegetation.endFill();
            this.vegetation.beginFill(white ? 0xE8A83A : 0xB8862B);
            this.vegetation.drawCircle(x, y, size * 0.62);
            this.vegetation.endFill();
        }

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