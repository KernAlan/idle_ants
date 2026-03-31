// src/effects/EasterEggExplosionEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.EasterEggExplosionEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y) {
        super(app, x, y);
        this.duration = 5.0;
    }

    create() {
        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;

        // --- Initial golden burst particles ---
        this.burstParticles = [];
        const burstColors = [0xFFD700, 0xFFF8DC, 0xFFE34D, 0xDAA520, 0xFFFFFF];
        for (let i = 0; i < 40; i++) {
            const p = new PIXI.Graphics();
            const color = burstColors[i % burstColors.length];
            p.beginFill(color);
            p.drawCircle(0, 0, 1.5 + Math.random() * 2);
            p.endFill();
            const angle = (i / 40) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
            const speed = 3 + Math.random() * 5;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.rotSpeed = (Math.random() - 0.5) * 0.2;
            this.burstParticles.push(p);
            this.container.addChild(p);
        }

        // --- Golden shockwave ---
        this.shockwave = new PIXI.Graphics();
        this.container.addChild(this.shockwave);

        // --- Confetti system (falls from top of visible area) ---
        this.confetti = [];
        const confettiColors = [0xFF0000, 0xFF7700, 0xFFFF00, 0x00FF00, 0x00CCFF, 0x7744FF, 0xFF00FF, 0xFFD700, 0xFF69B4, 0x00FF88];
        for (let i = 0; i < 120; i++) {
            const c = new PIXI.Graphics();
            const color = confettiColors[i % confettiColors.length];
            c.beginFill(color);
            // Mix of rectangles and small squares for confetti look
            if (Math.random() > 0.5) {
                c.drawRect(-3, -1.5, 6, 3);
            } else {
                c.drawRect(-2, -2, 4, 4);
            }
            c.endFill();
            // Spread confetti across a wide area above the explosion point
            c.x = (Math.random() - 0.5) * 500;
            c.y = -200 - Math.random() * 300;
            c.vy = 1 + Math.random() * 2;
            c.vx = (Math.random() - 0.5) * 1.5;
            c.rotSpeed = (Math.random() - 0.5) * 0.15;
            c.wobblePhase = Math.random() * Math.PI * 2;
            c.wobbleSpeed = 2 + Math.random() * 3;
            c.alpha = 0; // starts invisible, fades in
            this.confetti.push(c);
            this.container.addChild(c);
        }

        // --- Big title text (screen-anchored via overlay) ---
        // We use a separate container added to the stage so it stays centered on screen
        this.overlay = new PIXI.Container();

        // Background dim flash
        this.dimFlash = new PIXI.Graphics();
        this.dimFlash.beginFill(0x000000, 0.5);
        this.dimFlash.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        this.dimFlash.endFill();
        this.dimFlash.alpha = 0;
        this.overlay.addChild(this.dimFlash);

        const cx = this.app.screen.width / 2;
        const cy = this.app.screen.height / 2;

        // Main title
        this.titleText = new PIXI.Text('AMBROSIA', {
            fontFamily: 'Arial Black, Arial',
            fontSize: 56,
            fill: [0xFFD700, 0xFFF8DC], // gold gradient
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 8,
            dropShadowDistance: 4,
            stroke: 0xB8860B,
            strokeThickness: 4,
            letterSpacing: 6
        });
        this.titleText.anchor.set(0.5);
        this.titleText.x = cx;
        this.titleText.y = cy - 30;
        this.titleText.alpha = 0;
        this.titleText.scale.set(0.01);
        this.overlay.addChild(this.titleText);

        // Subtitle
        this.subtitleText = new PIXI.Text('Food of the Gods, Unlocked!', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFF8DC,
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 4,
            dropShadowDistance: 2,
            stroke: 0x000000,
            strokeThickness: 2
        });
        this.subtitleText.anchor.set(0.5);
        this.subtitleText.x = cx;
        this.subtitleText.y = cy + 25;
        this.subtitleText.alpha = 0;
        this.subtitleText.scale.set(0.01);
        this.overlay.addChild(this.subtitleText);

        // Value callout
        this.valueText = new PIXI.Text('9,999 food per piece', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0x00FF88,
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 3,
            dropShadowDistance: 2
        });
        this.valueText.anchor.set(0.5);
        this.valueText.x = cx;
        this.valueText.y = cy + 60;
        this.valueText.alpha = 0;
        this.overlay.addChild(this.valueText);

        // Screen confetti (falls across the whole screen)
        this.screenConfetti = [];
        for (let i = 0; i < 80; i++) {
            const c = new PIXI.Graphics();
            const color = confettiColors[i % confettiColors.length];
            c.beginFill(color);
            if (Math.random() > 0.5) {
                c.drawRect(-3, -1.5, 6, 3);
            } else {
                c.drawRect(-2, -2, 4, 4);
            }
            c.endFill();
            c.x = Math.random() * this.app.screen.width;
            c.y = -10 - Math.random() * 200;
            c.vy = 2 + Math.random() * 3;
            c.vx = (Math.random() - 0.5) * 1;
            c.rotSpeed = (Math.random() - 0.5) * 0.2;
            c.wobblePhase = Math.random() * Math.PI * 2;
            c.wobbleSpeed = 2 + Math.random() * 3;
            c.alpha = 0;
            this.screenConfetti.push(c);
            this.overlay.addChild(c);
        }

        this.app.stage.addChild(this.container);
        this.app.stage.addChild(this.overlay);
    }

    update(delta) {
        super.update(delta);
        const t = this.elapsed;

        // --- Burst particles (0-1.2s) ---
        if (t < 1.2) {
            for (const p of this.burstParticles) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.06;
                p.rotation += p.rotSpeed;
                p.alpha = Math.max(0, 1 - (t / 1.2));
                p.scale.set(1 + t * 0.3);
            }
        } else {
            for (const p of this.burstParticles) p.alpha = 0;
        }

        // --- Shockwave (0-0.6s) ---
        if (t < 0.6) {
            const r = t * 400;
            this.shockwave.clear();
            this.shockwave.lineStyle(3, 0xFFD700, Math.max(0, 0.7 - t));
            this.shockwave.drawCircle(0, 0, r);
        } else {
            this.shockwave.alpha = 0;
        }

        // --- World confetti (0.3s onward) ---
        if (t > 0.3) {
            for (const c of this.confetti) {
                c.alpha = Math.min(1, (t - 0.3) * 3);
                c.y += c.vy;
                c.x += c.vx + Math.sin(c.wobblePhase) * 0.5;
                c.wobblePhase += 0.05 * c.wobbleSpeed;
                c.rotation += c.rotSpeed;
                // Fade out near the end
                if (t > this.duration - 1) {
                    c.alpha = Math.max(0, (this.duration - t));
                }
            }
        }

        // --- Screen overlay: dim flash (0.5-4.5s) ---
        if (t > 0.5 && t < 4.5) {
            const fadeIn = Math.min(1, (t - 0.5) * 3);
            const fadeOut = t > 3.5 ? Math.max(0, (4.5 - t)) : 1;
            this.dimFlash.alpha = 0.4 * fadeIn * fadeOut;
        } else {
            this.dimFlash.alpha = 0;
        }

        // --- Title text: big pop-in at 0.7s ---
        if (t > 0.7) {
            const tt = t - 0.7;
            this.titleText.alpha = Math.min(1, tt * 3);
            // Elastic bounce-in
            const scaleT = Math.min(1, tt * 2.5);
            const elastic = scaleT < 1
                ? 1 + Math.sin(scaleT * Math.PI * 1.5) * 0.25 * (1 - scaleT)
                : 1;
            this.titleText.scale.set(elastic);
            // Slow golden shimmer on title
            this.titleText.rotation = Math.sin(t * 3) * 0.02;
            // Fade out
            if (t > this.duration - 1) {
                this.titleText.alpha = Math.max(0, (this.duration - t));
            }
        }

        // --- Subtitle: appears at 1.2s ---
        if (t > 1.2) {
            const st = t - 1.2;
            this.subtitleText.alpha = Math.min(1, st * 3);
            const scaleS = Math.min(1, st * 3);
            const bounceS = scaleS < 1 ? (1 + Math.sin(scaleS * Math.PI) * 0.2) : 1;
            this.subtitleText.scale.set(bounceS);
            if (t > this.duration - 1) {
                this.subtitleText.alpha = Math.max(0, (this.duration - t));
            }
        }

        // --- Value text: appears at 1.8s ---
        if (t > 1.8) {
            const vt = t - 1.8;
            this.valueText.alpha = Math.min(1, vt * 3);
            this.valueText.scale.set(Math.min(1, vt * 4));
            if (t > this.duration - 1) {
                this.valueText.alpha = Math.max(0, (this.duration - t));
            }
        }

        // --- Screen confetti (0.6s onward) ---
        if (t > 0.6) {
            for (const c of this.screenConfetti) {
                c.alpha = Math.min(1, (t - 0.6) * 2);
                c.y += c.vy;
                c.x += c.vx + Math.sin(c.wobblePhase) * 0.4;
                c.wobblePhase += 0.05 * c.wobbleSpeed;
                c.rotation += c.rotSpeed;
                if (t > this.duration - 1) {
                    c.alpha = Math.max(0, (this.duration - t));
                }
            }
        }

        return this.active;
    }

    destroy() {
        // Clean up the overlay from stage
        if (this.overlay && this.overlay.parent) {
            this.overlay.parent.removeChild(this.overlay);
        }
        // Clean up main container
        super.destroy();
    }
};
