// src/entities/FrogEnemy.js
IdleAnts.Entities.FrogEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture, mapBounds) {
        super(texture, mapBounds);
        
        // Hide just the base texture, not the entire sprite
        this.texture = PIXI.Texture.EMPTY; // Use empty/transparent texture instead
        
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
        
        // Main body (frog sitting position - wide and low)
        const body = new PIXI.Graphics();
        body.beginFill(0x228B22); // Forest green
        body.drawEllipse(0, 2, 8, 5); // Wide, low body
        body.endFill();
        
        // Body shading
        body.beginFill(0x1F5F1F, 0.3); // Darker green shadow
        body.drawEllipse(1, 3, 6, 3);
        body.endFill();
        
        // Belly
        body.beginFill(0xF0F8E8); // Light cream belly
        body.drawEllipse(0, 3, 5, 3);
        body.endFill();
        
        this.addChild(body);
        
        // Head (connected to body, not separate)
        const head = new PIXI.Graphics();
        head.beginFill(0x228B22); // Same green as body
        head.drawEllipse(0, -2, 6, 4); // Wide head
        head.endFill();
        
        // Head highlight
        head.beginFill(0x32CD32, 0.6);
        head.drawEllipse(-1, -3, 4, 2.5);
        head.endFill();
        
        this.addChild(head);
        
        // Mouth line
        const mouth = new PIXI.Graphics();
        mouth.lineStyle(1, 0x1F5F1F);
        mouth.moveTo(-3, 1);
        mouth.lineTo(3, 1);
        this.addChild(mouth);
        
        // Eyes (on top of head like real frogs)
        const leftEye = new PIXI.Graphics();
        leftEye.beginFill(0x000000); // Black base
        leftEye.drawCircle(-2, -4, 1.5);
        leftEye.endFill();
        leftEye.beginFill(0xFFD700); // Gold iris
        leftEye.drawCircle(-2, -4, 1);
        leftEye.endFill();
        leftEye.beginFill(0x000000); // Black pupil
        leftEye.drawCircle(-2, -4, 0.4);
        leftEye.endFill();
        leftEye.beginFill(0xFFFFFF, 0.8); // White highlight
        leftEye.drawCircle(-2.3, -4.3, 0.2);
        leftEye.endFill();
        
        const rightEye = new PIXI.Graphics();
        rightEye.beginFill(0x000000);
        rightEye.drawCircle(2, -4, 1.5);
        rightEye.endFill();
        rightEye.beginFill(0xFFD700);
        rightEye.drawCircle(2, -4, 1);
        rightEye.endFill();
        rightEye.beginFill(0x000000);
        rightEye.drawCircle(2, -4, 0.4);
        rightEye.endFill();
        rightEye.beginFill(0xFFFFFF, 0.8);
        rightEye.drawCircle(1.7, -4.3, 0.2);
        rightEye.endFill();
        
        this.addChild(leftEye);
        this.addChild(rightEye);
        
        // Front legs (small, positioned at front of body)
        const leftFrontLeg = new PIXI.Graphics();
        leftFrontLeg.beginFill(0x228B22);
        leftFrontLeg.drawEllipse(-5, 1, 1.5, 2); // Small front leg
        leftFrontLeg.endFill();
        leftFrontLeg.beginFill(0x1F5F1F);
        leftFrontLeg.drawCircle(-5, 2.5, 0.8); // Front foot
        leftFrontLeg.endFill();
        
        const rightFrontLeg = new PIXI.Graphics();
        rightFrontLeg.beginFill(0x228B22);
        rightFrontLeg.drawEllipse(5, 1, 1.5, 2);
        rightFrontLeg.endFill();
        rightFrontLeg.beginFill(0x1F5F1F);
        rightFrontLeg.drawCircle(5, 2.5, 0.8);
        rightFrontLeg.endFill();
        
        this.addChild(leftFrontLeg);
        this.addChild(rightFrontLeg);
        
        // Back legs (large, folded for sitting position)
        const leftBackLeg = new PIXI.Graphics();
        leftBackLeg.beginFill(0x228B22);
        // Thigh (horizontal when sitting)
        leftBackLeg.drawEllipse(-6, 4, 3, 1.5);
        leftBackLeg.endFill();
        leftBackLeg.beginFill(0x228B22);
        // Lower leg (folded back)
        leftBackLeg.drawEllipse(-8, 5, 2, 1);
        leftBackLeg.endFill();
        leftBackLeg.beginFill(0x1F5F1F);
        // Large webbed foot
        leftBackLeg.drawEllipse(-9, 6, 2.5, 1);
        leftBackLeg.endFill();
        // Webbing lines
        leftBackLeg.lineStyle(0.5, 0x0F3F0F);
        leftBackLeg.moveTo(-10.5, 6);
        leftBackLeg.lineTo(-7.5, 6);
        leftBackLeg.moveTo(-10, 5.5);
        leftBackLeg.lineTo(-8, 6.5);
        
        const rightBackLeg = new PIXI.Graphics();
        rightBackLeg.beginFill(0x228B22);
        rightBackLeg.drawEllipse(6, 4, 3, 1.5);
        rightBackLeg.endFill();
        rightBackLeg.beginFill(0x228B22);
        rightBackLeg.drawEllipse(8, 5, 2, 1);
        rightBackLeg.endFill();
        rightBackLeg.beginFill(0x1F5F1F);
        rightBackLeg.drawEllipse(9, 6, 2.5, 1);
        rightBackLeg.endFill();
        // Webbing lines
        rightBackLeg.lineStyle(0.5, 0x0F3F0F);
        rightBackLeg.moveTo(7.5, 6);
        rightBackLeg.lineTo(10.5, 6);
        rightBackLeg.moveTo(8, 6.5);
        rightBackLeg.lineTo(10, 5.5);
        
        this.addChild(leftBackLeg);
        this.addChild(rightBackLeg);
        
        // Add some spots for frog pattern
        const spots = new PIXI.Graphics();
        spots.beginFill(0x1F5F1F, 0.4);
        spots.drawCircle(-2, 0, 0.8);
        spots.drawCircle(3, 1, 0.6);
        spots.drawCircle(-1, 3, 0.5);
        spots.drawCircle(2, -1, 0.4);
        spots.endFill();
        this.addChild(spots);
        
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