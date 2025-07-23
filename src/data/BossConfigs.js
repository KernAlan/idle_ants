// Boss configuration system for Idle Ants
if (typeof IdleAnts === 'undefined') {
    window.IdleAnts = {};
}
IdleAnts.Data = IdleAnts.Data || {};

IdleAnts.Data.BossConfigs = {
    // Existing Anteater Boss
    ANTEATER: {
        id: 'anteater',
        name: 'Anteater Boss',
        className: 'AnteaterBoss',
        defaultStats: {
            maxHp: 20000,
            attackDamage: 200,
            attackRange: 100,
            speed: 0.8,
            perceptionRange: 450,
            foodValue: 5000
        },
        textures: {
            body: 'anteater_boss_body',
            front_leg: 'anteater_boss_leg_front',
            back_leg: 'anteater_boss_leg_back'
        },
        audio: {
            theme: 'BOSS_THEME'
        },
        spawnPosition: {
            x: 'center', // Special value for map center
            y: 150
        },
        cinematic: {
            enabled: true,
            cameraPrePosition: true,
            dramaPause: true,
            arrivalText: "THE GREAT ANTEATER HAS ARRIVED",
            bossTitle: "◆ FINAL BOSS ◆",
            bossName: "THE GREAT ANTEATER",
            bossSubtitle: "Destroyer of Colonies",
            titleColor: "#FFD700",
            nameColor: "#FFFFFF",
            subtitleColor: "#FFA500"
        }
    },

    // Miniboss 1: Venomous Spider
    SPIDER: {
        id: 'spider',
        name: 'Venomous Spider',
        className: 'SpiderBoss',
        defaultStats: {
            maxHp: 8000,
            attackDamage: 120,
            attackRange: 80,
            speed: 1.4,
            perceptionRange: 400,
            foodValue: 2000
        },
        textures: {
            body: 'spider_boss_body',
            leg: 'spider_boss_leg'
        },
        audio: {
            theme: 'BOSS_THEME' // Reuse existing theme for now
        },
        spawnPosition: {
            x: 'left', // Spawn from different side
            y: 200
        },
        cinematic: {
            enabled: true,
            cameraPrePosition: true,
            dramaPause: true,
            arrivalText: "A VENOMOUS SPIDER APPROACHES",
            bossTitle: "◆ MINIBOSS ◆",
            bossName: "ARACHNO HUNTER",
            bossSubtitle: "Web Weaver of Death",
            titleColor: "#8B0000",
            nameColor: "#FF4500",
            subtitleColor: "#DC143C"
        }
    },

    // Miniboss 2: Armored Beetle
    BEETLE: {
        id: 'beetle',
        name: 'Armored Beetle',
        className: 'BeetleBoss',
        defaultStats: {
            maxHp: 12000,
            attackDamage: 180,
            attackRange: 60,
            speed: 0.8,
            perceptionRange: 350,
            foodValue: 3000
        },
        textures: {
            body: 'beetle_boss_body',
            shell: 'beetle_boss_shell'
        },
        audio: {
            theme: 'BOSS_THEME' // Reuse existing theme for now
        },
        spawnPosition: {
            x: 'right', // Spawn from different side
            y: 180
        },
        cinematic: {
            enabled: true,
            cameraPrePosition: true,
            dramaPause: true,
            arrivalText: "AN ARMORED BEETLE CHARGES IN",
            bossTitle: "◆ MINIBOSS ◆",
            bossName: "IRON SHELL CRUSHER",
            bossSubtitle: "Unstoppable Force",
            titleColor: "#4682B4",
            nameColor: "#1E90FF",
            subtitleColor: "#00BFFF"
        }
    },

    // Miniboss 3: Praying Mantis
    MANTIS: {
        id: 'mantis',
        name: 'Praying Mantis',
        className: 'MantisBoss',
        defaultStats: {
            maxHp: 10000,
            attackDamage: 250,
            attackRange: 120,
            speed: 1.0,
            perceptionRange: 500,
            foodValue: 2500
        },
        textures: {
            body: 'mantis_boss_body',
            arm: 'mantis_boss_arm'
        },
        audio: {
            theme: 'BOSS_THEME' // Reuse existing theme for now
        },
        spawnPosition: {
            x: 'center',
            y: 120
        },
        cinematic: {
            enabled: true,
            cameraPrePosition: true,
            dramaPause: true,
            arrivalText: "THE MANTIS STALKS ITS PREY",
            bossTitle: "◆ MINIBOSS ◆",
            bossName: "BLADE DANCER",
            bossSubtitle: "Silent Assassin",
            titleColor: "#228B22",
            nameColor: "#32CD32",
            subtitleColor: "#98FB98"
        }
    },

    // Miniboss 4: Rival Carpenter Ant Queen
    CARPENTER_ANT_QUEEN: {
        id: 'carpenter_ant_queen',
        name: 'Carpenter Ant Queen',
        className: 'CarpenterAntQueenBoss',
        defaultStats: {
            maxHp: 15000,
            attackDamage: 100,
            attackRange: 90,
            speed: 0.7,
            perceptionRange: 400,
            foodValue: 3500
        },
        textures: {
            body: 'carpenter_ant_queen_body',
            head: 'carpenter_ant_queen_head'
        },
        audio: {
            theme: 'MINIBOSS_THEME'
        },
        spawnPosition: {
            x: 'left',
            y: 250
        },
        cinematic: {
            enabled: true,
            cameraPrePosition: true,
            dramaPause: true,
            arrivalText: "A RIVAL QUEEN INVADES",
            bossTitle: "◆ MINIBOSS ◆",
            bossName: "CARPENTER MATRIARCH",
            bossSubtitle: "Her throne must be protected",
            titleColor: "#8B4513",
            nameColor: "#D2691E",
            subtitleColor: "#A0522D"
        }
    },

    // Miniboss 5: Japanese Giant Hornet
    GIANT_HORNET: {
        id: 'giant_hornet',
        name: 'Japanese Giant Hornet',
        className: 'GiantHornetBoss',
        defaultStats: {
            maxHp: 9000,
            attackDamage: 300,
            attackRange: 150,
            speed: 1.8,
            perceptionRange: 600,
            foodValue: 4000
        },
        textures: {
            body: 'giant_hornet_body',
            wing: 'giant_hornet_wing',
            stinger: 'giant_hornet_stinger'
        },
        audio: {
            theme: 'MINIBOSS_THEME'
        },
        spawnPosition: {
            x: 'right',
            y: 100
        },
        cinematic: {
            enabled: true,
            cameraPrePosition: true,
            dramaPause: true,
            arrivalText: "A GIANT HORNET DESCENDS",
            bossTitle: "◆ MINIBOSS ◆",
            bossName: "GIANT HORNET",
            bossSubtitle: "The Ants' Worst Nightmare",
            titleColor: "#FF8C00",
            nameColor: "#FFA500",
            subtitleColor: "#FFD700"
        }
    }
};

// Helper functions for boss configurations
IdleAnts.Data.BossConfigUtils = {
    // Get boss config by ID
    getBossConfig: function(bossId) {
        const config = IdleAnts.Data.BossConfigs[bossId.toUpperCase()];
        if (!config) {
            console.warn(`Boss config not found for: ${bossId}`);
            return null;
        }
        return JSON.parse(JSON.stringify(config)); // Return deep copy
    },

    // Apply stat multipliers to a boss config
    applyStatMultipliers: function(config, multipliers = {}) {
        if (!config || !config.defaultStats) return config;

        const modifiedConfig = JSON.parse(JSON.stringify(config));
        const stats = modifiedConfig.defaultStats;

        if (multipliers.hp) stats.maxHp = Math.floor(stats.maxHp * multipliers.hp);
        if (multipliers.damage) stats.attackDamage = Math.floor(stats.attackDamage * multipliers.damage);
        if (multipliers.speed) stats.speed *= multipliers.speed;
        if (multipliers.range) stats.attackRange = Math.floor(stats.attackRange * multipliers.range);
        if (multipliers.perception) stats.perceptionRange = Math.floor(stats.perceptionRange * multipliers.perception);
        if (multipliers.reward) stats.foodValue = Math.floor(stats.foodValue * multipliers.reward);

        return modifiedConfig;
    },

    // Calculate spawn position from config
    calculateSpawnPosition: function(config, mapBounds) {
        let x = config.spawnPosition.x;
        let y = config.spawnPosition.y;

        if (x === 'center') {
            x = mapBounds.width / 2;
        } else if (x === 'left') {
            x = mapBounds.width * 0.1;
        } else if (x === 'right') {
            x = mapBounds.width * 0.9;
        }

        if (y === 'center') {
            y = mapBounds.height / 2;
        } else if (y === 'top') {
            y = mapBounds.height * 0.1;
        } else if (y === 'bottom') {
            y = mapBounds.height * 0.9;
        }

        return { x, y };
    },

    // Get available boss types
    getAvailableBossTypes: function() {
        return Object.keys(IdleAnts.Data.BossConfigs);
    }
};