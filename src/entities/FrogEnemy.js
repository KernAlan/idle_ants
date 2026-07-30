// src/entities/FrogEnemy.js
IdleAnts.Entities.FrogEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture, mapBounds) {
        super(texture, mapBounds);
        
        // Hide just the base texture, not the entire sprite
        this.texture = PIXI.Texture.EMPTY; // Use empty/transparent texture instead
        
        // Enemy name for tooltip
        this.enemyName = "Frog";
        
        // Frog-specific properties
        this.scale.set(2.0); // Slightly bigger than cricket (1.5), smaller than grasshopper (2.0)
        this.tint = 0x228B22; // Forest green base color
        
        // Combat stats - stronger than cricket (15 HP, 6 dmg), weaker than grasshopper (30 HP, 10 dmg)
        this.maxHp = 300; // Between cricket (15) and grasshopper (30)
        this.hp = this.maxHp;
        this.damage = 5; // Between cricket (6) and grasshopper (10)
        this.attackSpeed = 75; // Moderate attack speed
        
        // Hopping 
        this.isHopping = false;
        this.hopCooldown = 0;
        this.hopDuration = 0;
        this.hopStartX = 0;
        this.hopStartY = 0;
        this.hopTargetX = 0;
        this.hopTargetY = 0;
        this.hopProgress = 0;
        this.hopHeight = 0;
        
        // Movement timing
        this.hopCooldownTime = 90 + Math.random() * 120; // 1.5-3.5 seconds between hops
        this.hopDurationTime = 20; // Faster hops (1/3 second)
        
        // Override base enemy movement
        this.speed = 0; // No continuous movement
        this.vx = 0;
        this.vy = 0;
        
        // Create frog appearance
        this.createFrogBody();
    }
    
    createFrogBody() {
        // Clear any existing graphics
        this.removeChildren();

        const A = IdleAnts.Art;
        const Gr = IdleAnts.Graphics;

        // Damp, mottled amphibian greens - a frog should look wet, which means
        // strong speculars and a pale underbelly rather than flat forest green.
        const SKIN = 0x4F8F32;
        const SKIN_DARK = 0x27501C;
        const BELLY = 0xE4EFC4;

        this.createShadow(11, 8, 0.3);

        // Squat, wide body seen from above.
        const body = new PIXI.Graphics();
        A.volume(body, { x: 0, y: 2, rx: 8.5, ry: 6, color: SKIN, outlineWidth: 0.8 });
        // Pale throat/belly showing at the front edge.
        body.beginFill(BELLY, 0.55);
        body.drawPolygon(A.ellipsePath(0, 3.6, 4.6, 2.8, 0, 20));
        body.endFill();

        // Mottled dorsal blotches - the classic frog pattern.
        const rand = Gr.rng(404);
        body.beginFill(SKIN_DARK, 0.5);
        for (let i = 0; i < 9; i++) {
            const a = rand() * Math.PI * 2;
            const r = Math.sqrt(rand());
            body.drawPolygon(A.ellipsePath(
                Math.cos(a) * r * 6.4, 2 + Math.sin(a) * r * 4.4,
                0.9 + rand() * 1.5, 0.7 + rand() * 1.1, rand() * 3, 10));
        }
        body.endFill();

        // Wet sheen down the back.
        body.beginFill(0xFFFFFF, 0.2);
        body.drawPolygon(A.ellipsePath(-2.8, -0.4, 2.4, 3.4, -0.25, 18));
        body.endFill();
        this.addChild(body);

        // Head, blending into the body.
        const head = new PIXI.Graphics();
        A.volume(head, { x: 0, y: -3, rx: 6.4, ry: 4.8, color: SKIN, outlineWidth: 0.7 });
        head.beginFill(0xFFFFFF, 0.18);
        head.drawPolygon(A.ellipsePath(-2, -4.4, 2.2, 1.6, -0.2, 14));
        head.endFill();
        this.addChild(head);

        // Wide mouth line.
        const mouth = new PIXI.Graphics();
        mouth.lineStyle(1, SKIN_DARK, 0.85);
        mouth.moveTo(-4.4, -5.6);
        mouth.quadraticCurveTo(0, -7.6, 4.4, -5.6);
        this.addChild(mouth);

        // Bulging eyes that sit proud of the skull - a frog's whole character.
        const frogEye = (dir) => {
            const e = new PIXI.Graphics();
            // Domed eyelid mound.
            A.volume(e, { x: dir * 2.8, y: -4.6, rx: 2.6, ry: 2.4, color: SKIN, outlineWidth: 0.6 });
            // Gold iris with a slit pupil.
            e.beginFill(0x1A1206);
            e.drawCircle(dir * 2.8, -4.8, 1.75);
            e.endFill();
            e.beginFill(0xE8B321);
            e.drawCircle(dir * 2.8, -4.8, 1.35);
            e.endFill();
            e.beginFill(0xF7DE7A, 0.85);
            e.drawCircle(dir * 2.8, -4.4, 0.9);
            e.endFill();
            e.beginFill(0x120C04);
            e.drawPolygon(A.ellipsePath(dir * 2.8, -4.8, 0.42, 1.15, 0, 12));
            e.endFill();
            e.beginFill(0xFFFFFF, 0.95);
            e.drawCircle(dir * 2.8 - 0.7, -5.5, 0.5);
            e.endFill();
            return e;
        };
        const leftEye = frogEye(-1);
        const rightEye = frogEye(1);
        this.addChild(leftEye);
        this.addChild(rightEye);

        // Front legs - short, tucked under the chin.
        const frontLeg = (dir) => {
            const l = new PIXI.Graphics();
            A.limb(l, [[dir * 4.5, -1.5], [dir * 6.5, 1], [dir * 6, 4]], 1.8, SKIN);
            // Splayed toes.
            l.lineStyle({ width: 0.9, color: SKIN_DARK, alpha: 0.9, cap: PIXI.LINE_CAP.ROUND });
            for (let t = -1; t <= 1; t++) {
                l.moveTo(dir * 6, 4);
                l.lineTo(dir * 6 + t * 1.6, 6.4);
            }
            l.lineStyle(0);
            return l;
        };
        const leftFrontLeg = frontLeg(-1);
        const rightFrontLeg = frontLeg(1);
        this.addChild(leftFrontLeg);
        this.addChild(rightFrontLeg);

        // Back legs - big folded thighs with webbed feet, the source of the hop.
        const backLeg = (dir) => {
            const l = new PIXI.Graphics();
            A.volume(l, { x: dir * 7, y: 3.5, rx: 4.2, ry: 2.6, rot: dir * 0.3, color: SKIN, outlineWidth: 0.6 });
            A.limb(l, [[dir * 9, 4.5], [dir * 10.5, 7.5]], 1.8, SKIN);
            // Webbed foot as a filled fan.
            l.beginFill(Gr.shade(SKIN, 0.75));
            l.drawPolygon([
                dir * 10.5, 7.5,
                dir * 13.5, 10.5,
                dir * 10.5, 12,
                dir * 7.5, 10.5
            ]);
            l.endFill();
            l.lineStyle(0.5, SKIN_DARK, 0.8);
            l.moveTo(dir * 10.5, 7.5); l.lineTo(dir * 10.5, 12);
            l.moveTo(dir * 10.5, 7.5); l.lineTo(dir * 12.5, 11);
            l.moveTo(dir * 10.5, 7.5); l.lineTo(dir * 8.5, 11);
            l.lineStyle(0);
            return l;
        };
        const leftBackLeg = backLeg(-1);
        const rightBackLeg = backLeg(1);
        this.addChild(leftBackLeg);
        this.addChild(rightBackLeg);

        // Store references for animation
        this.leftBackLeg = leftBackLeg;
        this.rightBackLeg = rightBackLeg;
        this.leftFrontLeg = leftFrontLeg;
        this.rightFrontLeg = rightFrontLeg;
        this.body = body;
        this.head = head;
        this.leftEye = leftEye;
        this.rightEye = rightEye;
    }
    
    update(ants) {
        // Handle health bar positioning and combat logic from base class
        // but skip the movement part
        
        // Acquire or validate target ant within perception range
        if(!this.targetAnt || this.targetAnt.isDead){
            this.targetAnt=null;
            let nearest=null,distSq=Infinity;
            ants.forEach(a=>{
                const dx=a.x-this.x; const dy=a.y-this.y; const d=dx*dx+dy*dy;
                if(d<distSq && Math.sqrt(d)<=this.perceptionRange){nearest=a;distSq=d;}
            });
            if(nearest) this.targetAnt=nearest;
        }

        // Attack nearest ant (but don't move toward them continuously)
        if(this._attackTimer>0) this._attackTimer--;
        if(this.targetAnt){
            const dx=this.targetAnt.x-this.x; const dy=this.targetAnt.y-this.y; const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<=this.attackRange){
                if(this._attackTimer===0){
                    this.targetAnt.takeDamage(this.attackDamage);
                    this._attackTimer=this.attackCooldown;
                }
            } else {
                // If target is far, try to hop toward them occasionally
                if(!this.isHopping && this.hopCooldown <= 30 && Math.random() < 0.3) {
                    this.hopTowardsTarget(this.targetAnt);
                }
            }
        }

        // Handle health bar
        if(this.healthBarTimer>0){
            this.healthBarTimer--; 
            if(this.healthBarTimer===0){
                this.healthBarContainer.visible=false;
            }
        }

        if(this.healthBarContainer){
            this.healthBarContainer.x = this.x;
            this.healthBarContainer.y = this.y - 20;
            this.healthBarContainer.rotation = 0;
        }
        
        // Handle frog-specific movement and animation
        this.updateHopping();
        this.animateLegs();
    }
    
    updateHopping() {
        if (this.isHopping) {
            // Continue current hop
            this.hopProgress += 1 / this.hopDurationTime;
            
            if (this.hopProgress >= 1) {
                // Hop complete
                this.isHopping = false;
                this.x = this.hopTargetX;
                this.y = this.hopTargetY;
                this.hopCooldown = this.hopCooldownTime;
                this.hopProgress = 0;
                
                // Reset body position
                if (this.body) {
                    this.body.y = 0;
                }
                if (this.head) {
                    this.head.y = 0;
                }
            } else {
                // Interpolate position during hop
                const t = this.hopProgress;
                const easeT = this.easeOutQuad(t); // Smooth hop animation
                
                this.x = this.hopStartX + (this.hopTargetX - this.hopStartX) * easeT;
                this.y = this.hopStartY + (this.hopTargetY - this.hopStartY) * easeT;
                
                // Add vertical hop motion (parabolic arc)
                const hopHeight = Math.sin(t * Math.PI) * this.hopHeight;
                if (this.body) {
                    this.body.y = -hopHeight;
                }
                if (this.head) {
                    this.head.y = -hopHeight;
                }
            }
        } else {
            // Check if it's time for next hop
            this.hopCooldown--;
            
            if (this.hopCooldown <= 0) {
                this.startHop();
            }
        }
    }
    
    startHop() {
        // Choose random direction and distance for hop
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 60; // 40-100 pixel hops
        
        this.hopStartX = this.x;
        this.hopStartY = this.y;
        this.hopTargetX = this.x + Math.cos(angle) * distance;
        this.hopTargetY = this.y + Math.sin(angle) * distance;
        
        // Keep within map bounds
        this.hopTargetX = Math.max(20, Math.min(this.mapBounds.width - 20, this.hopTargetX));
        this.hopTargetY = Math.max(20, Math.min(this.mapBounds.height - 20, this.hopTargetY));
        
        this.hopHeight = 15 + Math.random() * 10; // Variable hop height
        this.hopProgress = 0;
        this.isHopping = true;
        
        // Face the direction of the hop
        const dx = this.hopTargetX - this.hopStartX;
        if (dx !== 0) {
            this.scale.x = Math.abs(this.scale.x) * (dx > 0 ? 1 : -1);
        }
    }
    
    animateLegs() {
        if (!this.leftBackLeg || !this.rightBackLeg) return;
        
        if (this.isHopping) {
            // During hop, legs are extended
            const extension = Math.sin(this.hopProgress * Math.PI) * 3;
            this.leftBackLeg.rotation = -0.2 - extension * 0.1;
            this.rightBackLeg.rotation = 0.2 + extension * 0.1;
            
            if (this.leftFrontLeg && this.rightFrontLeg) {
                this.leftFrontLeg.rotation = 0.1;
                this.rightFrontLeg.rotation = -0.1;
            }
        } else {
            // When not hopping, legs are relaxed
            this.leftBackLeg.rotation = 0;
            this.rightBackLeg.rotation = 0;
            
            if (this.leftFrontLeg && this.rightFrontLeg) {
                this.leftFrontLeg.rotation = 0;
                this.rightFrontLeg.rotation = 0;
            }
        }
    }
    
    // Easing function for smooth hop animation
    easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }
    
    // Override movement to use hopping instead of continuous movement
    moveRandomly() {
        // Frog movement is handled by hopping system
        // This overrides the base enemy's continuous movement
    }
    
    // New method to hop toward a target
    hopTowardsTarget(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Hop distance (shorter when targeting)
            const hopDistance = Math.min(60, distance * 0.7);
            
            this.hopStartX = this.x;
            this.hopStartY = this.y;
            this.hopTargetX = this.x + (dx / distance) * hopDistance;
            this.hopTargetY = this.y + (dy / distance) * hopDistance;
            
            // Keep within map bounds
            this.hopTargetX = Math.max(20, Math.min(this.mapBounds.width - 20, this.hopTargetX));
            this.hopTargetY = Math.max(20, Math.min(this.mapBounds.height - 20, this.hopTargetY));
            
            this.hopHeight = 12 + Math.random() * 8;
            this.hopProgress = 0;
            this.isHopping = true;
            this.hopCooldown = this.hopCooldownTime; // Reset cooldown
            
            // Face the direction of the hop
            const finalDx = this.hopTargetX - this.hopStartX;
            if (finalDx !== 0) {
                this.scale.x = Math.abs(this.scale.x) * (finalDx > 0 ? 1 : -1);
            }
        }
    }
}; 