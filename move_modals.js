// Script to move modals outside UI container when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Moving modals outside UI container...');
    
    // Find all modals
    const modals = [
        'colony-modal',
        'upgrades-modal', 
        'automation-modal',
        'settings-modal'
    ];
    
    // Find the game container (parent of both ui-container and game-canvas-container)
    const gameContainer = document.getElementById('game-container');
    const gameCanvasContainer = document.getElementById('game-canvas-container');
    
    if (gameContainer && gameCanvasContainer) {
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                // Remove modal from its current location
                modal.parentNode.removeChild(modal);
                
                // Insert modal before game-canvas-container (outside ui-container)
                gameContainer.insertBefore(modal, gameCanvasContainer);
                console.log(`Moved ${modalId} outside UI container`);
            }
        });
        
        console.log('All modals moved successfully!');
    } else {
        console.error('Could not find game container structure');
    }
});