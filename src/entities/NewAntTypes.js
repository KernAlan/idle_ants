// src/entities/NewAntTypes.js
// Integration file for all new ant types
// This file should be loaded after all base classes and individual ant files

if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// Registry of all new ant types for easy access
IdleAnts.Entities.NewAntRegistry = {
    // Basic Combat Ants
    GasAnt: IdleAnts.Entities.GasAnt,
    AcidAnt: IdleAnts.Entities.AcidAnt,
    RainbowAnt: IdleAnts.Entities.RainbowAnt,
    PhatAnt: IdleAnts.Entities.PhatAnt,
    
    // Exploding Ants (accessed through nested namespace)
    SmokeAnt: IdleAnts.Entities.Exploding?.SmokeAnt,
    ElectricAnt: IdleAnts.Entities.Exploding?.ElectricAnt,
    LeafCutterAnt: IdleAnts.Entities.Exploding?.LeafCutterAnt,
    
    // Throwing Ants
    BananaThrowingAnt: IdleAnts.Entities.Throwing?.BananaThrowingAnt,
    JuiceAnt: IdleAnts.Entities.Throwing?.JuiceAnt,
    CrabAnt: IdleAnts.Entities.Throwing?.CrabAnt,
    
    // Special Ants
    SpiderAnt: IdleAnts.Entities.Special?.SpiderAnt,
    
    // Other
};

// Helper function to create ant by type ID
IdleAnts.Entities.createAntByType = function(antTypeId, texture, nestPosition, speedMultiplier = 1) {
    // Map ant type IDs to their classes
    const antClassMap = {
        'fatAnt': IdleAnts.Entities.PhatAnt,
        'gasAnt': IdleAnts.Entities.GasAnt,
        'acidAnt': IdleAnts.Entities.AcidAnt,
        'rainbowAnt': IdleAnts.Entities.RainbowAnt,
        'smokeAnt': IdleAnts.Entities.Exploding?.SmokeAnt,
        'fireAntExplosive': IdleAnts.Entities.Exploding?.ElectricAnt, // Using Electric for Fire explosive
        'electricAnt': IdleAnts.Entities.Exploding?.ElectricAnt,
        'leafCutterAnt': IdleAnts.Entities.Exploding?.LeafCutterAnt,
        'bananaThrowingAnt': IdleAnts.Entities.Throwing?.BananaThrowingAnt,
        'juiceAnt': IdleAnts.Entities.Throwing?.JuiceAnt,
        'crabAnt': IdleAnts.Entities.Throwing?.CrabAnt,
        'spiderAnt': IdleAnts.Entities.Special?.SpiderAnt,
    };
    
    const AntClass = antClassMap[antTypeId];
    if (!AntClass) {
        console.warn(`Unknown ant type: ${antTypeId}`);
        return null;
    }
    
    try {
        return new AntClass(texture, nestPosition, speedMultiplier);
    } catch (error) {
        console.error(`Failed to create ant of type ${antTypeId}:`, error);
        return null;
    }
};

// Helper function to get all available ant types
IdleAnts.Entities.getAvailableAntTypes = function() {
    const availableTypes = [];
    
    for (const [typeId, AntClass] of Object.entries(IdleAnts.Entities.createAntByType.antClassMap || {})) {
        if (AntClass) {
            availableTypes.push({
                id: typeId,
                name: IdleAnts.Data.AntTypes[typeId.toUpperCase()]?.name || typeId,
                class: AntClass
            });
        }
    }
    
    return availableTypes;
};

// Validation function to check if all ant classes loaded properly
IdleAnts.Entities.validateNewAntTypes = function() {
    const issues = [];
    
    // Check base classes
    if (!IdleAnts.Entities.Exploding?.ExplodingAntBase) {
        issues.push('ExplodingAntBase not loaded');
    }
    if (!IdleAnts.Entities.Throwing?.ThrowingAntBase) {
        issues.push('ThrowingAntBase not loaded');
    }
    
    // Check individual ant classes
    for (const [name, AntClass] of Object.entries(IdleAnts.Entities.NewAntRegistry)) {
        if (!AntClass) {
            issues.push(`${name} not loaded`);
        }
    }
    
    // Check data definitions
    if (!IdleAnts.Data?.AntTypes) {
        issues.push('AntTypes data not loaded');
    }
    
    if (issues.length > 0) {
        console.warn('New Ant Types validation issues:', issues);
        return false;
    }
    
    console.log('All new ant types loaded successfully!');
    return true;
};

// Auto-validate when this file loads
if (typeof window !== 'undefined') {
    // Run validation after a short delay to ensure all files are loaded
    setTimeout(() => {
        IdleAnts.Entities.validateNewAntTypes();
    }, 100);
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IdleAnts.Entities.NewAntRegistry;
}
