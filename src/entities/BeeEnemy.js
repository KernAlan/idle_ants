// src/entities/BeeEnemy.js
if(typeof IdleAnts==='undefined') IdleAnts={};
if(typeof IdleAnts.Entities==='undefined') IdleAnts.Entities={};

// Flying bee enemy: moderate power, wanders and chases ants
IdleAnts.Entities.BeeEnemy = class extends IdleAnts.Entities.Enemy {
    constructor(texture,mapBounds){
        super(texture,mapBounds);
        this.texture = PIXI.Texture.EMPTY;
        this.createBody();
        this.createWings();
        this.scale.set(1.4);

        // Stats
        this.speed = 2.0;
        this.attackDamage = 8;
        this.maxHp = 80;
        this.hp = this.maxHp;
        this.updateHealthBar();

        // Flight bobbing
        this.bobPhase = Math.random()*Math.PI*2;

        // wing animation
        this.wingPhase = Math.random()*Math.PI*2;
        this.wingAnimationSpeed = 0.6;
    }

    createBody(){
        const g = new PIXI.Graphics();
        // Realistic bee colors
        const beeYellow = 0xFFD700;
        const beeBlack = 0x2C1810;
        const darkBrown = 0x8B4513;
        const fuzzyYellow = 0xFFF8DC;
        
        // Bee head - rounded but slightly flattened
        g.beginFill(beeBlack);
        g.drawEllipse(0, -14, 5, 6);
        g.endFill();
        
        // Fuzzy texture on head
        g.beginFill(darkBrown, 0.3);
        for(let i = 0; i < 8; i++){
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 3;
            const y = -14 + Math.sin(angle) * 4;
            g.drawCircle(x, y, 0.8);
        }
        g.endFill();
        
        // Thorax - fuzzy and robust
        g.beginFill(beeBlack);
        g.drawEllipse(0, -4, 6, 8);
        g.endFill();
        
        // Fuzzy thorax texture
        g.beginFill(fuzzyYellow, 0.4);
        for(let i = 0; i < 12; i++){
            const x = (Math.random() - 0.5) * 10;
            const y = -4 + (Math.random() - 0.5) * 12;
            g.drawCircle(x, y, 0.6);
        }
        g.endFill();
        
        // Abdomen with realistic bee stripes
        const abdomColors = [beeYellow, beeBlack, beeYellow, beeBlack, beeYellow];
        abdomColors.forEach((color, idx) => {
            g.beginFill(color);
            const y = 4 + idx * 3;
            const width = 5 - idx * 0.3; // tapers toward end
            g.drawEllipse(0, y, width, 2.5);
            g.endFill();
        });
        
        // Fuzzy abdomen texture
        g.beginFill(fuzzyYellow, 0.2);
        for(let i = 0; i < 6; i++){
            const x = (Math.random() - 0.5) * 8;
            const y = 6 + Math.random() * 8;
            g.drawCircle(x, y, 0.4);
        }
        g.endFill();
        
        // Large compound eyes
        g.beginFill(0x000000);
        g.drawEllipse(-4, -14, 2, 3);
        g.drawEllipse(4, -14, 2, 3);
        g.endFill();
        
        // Eye highlights
        g.beginFill(0xFFFFFF, 0.6);
        g.drawCircle(-4, -15, 0.8);
        g.drawCircle(4, -15, 0.8);
        g.endFill();
        
        // Antennae - elbowed like real bees
        const antennae = new PIXI.Graphics();
        antennae.lineStyle(1.5, beeBlack);
        // Left antenna
        antennae.moveTo(-2, -17);
        antennae.lineTo(-4, -22);
        antennae.lineTo(-6, -26);
        // Right antenna
        antennae.moveTo(2, -17);
        antennae.lineTo(4, -22);
        antennae.lineTo(6, -26);
        
        // Antenna segments
        antennae.lineStyle(2, beeBlack);
        antennae.drawCircle(-4, -22, 0.8);
        antennae.drawCircle(4, -22, 0.8);
        
        // Proboscis (feeding tube)
        g.beginFill(darkBrown);
        g.drawEllipse(0, -10, 0.8, 2);
        g.endFill();
        
        this.addChild(g);
        this.addChild(antennae);
    }

    createWings(){
        this.wingsContainer = new PIXI.Container();
        this.addChild(this.wingsContainer);

        this.leftWing = new PIXI.Graphics();
        this.leftWing.beginFill(0xFFFFFF,0.6);
        this.leftWing.drawEllipse(0,0,7,4);
        this.leftWing.endFill();
        this.leftWing.position.set(-8,-4);

        this.rightWing = new PIXI.Graphics();
        this.rightWing.beginFill(0xFFFFFF,0.6);
        this.rightWing.drawEllipse(0,0,7,4);
        this.rightWing.endFill();
        this.rightWing.position.set(8,-4);

        this.wingsContainer.addChild(this.leftWing);
        this.wingsContainer.addChild(this.rightWing);
    }

    update(ants){
        // slight vertical bob
        this.bobPhase += 0.25;
        this.y += Math.sin(this.bobPhase)*0.4;

        // Wing flap animation
        this.wingPhase += this.wingAnimationSpeed;
        const flap = Math.sin(this.wingPhase)*0.5 + 0.5;
        if(this.leftWing){
            this.leftWing.scale.y = flap;
            this.rightWing.scale.y = flap;
        }

        // Call base movement/AI after adjusting bobbing offset so collision is consistent
        super.update(ants);

        // Rotate sprite toward movement direction so bee faces travel vector
        const speedMag = Math.abs(this.vx) + Math.abs(this.vy);
        if(speedMag > 0.1){
            this.rotation = Math.atan2(this.vy, this.vx) + Math.PI/2;
        }

        // Wings now rotate with the bee because container inherits rotation
    }
}; 