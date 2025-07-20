// Logger setup
const logger = IdleAnts.Logger?.create('AudioManager') || console;

IdleAnts.AudioManager = (function() {
    // Private audio context and sounds storage
    let audioContext = null;
    let sounds = {};
    let bgmTrack = null;
    let isMuted = false;
    let loadedSounds = 0;
    let totalSounds = 0;
    
    // Initialize audio context
    function init() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            
            // Load all audio assets from HTML elements
            loadAudioAssets();
            
            logger.debug('Audio Manager initialized');
            return true;
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
            return false;
        }
    }
    
    // Get audio element from HTML by ID
    function getAudioElement(id) {
        return document.getElementById(id);
    }
    
    // Load all audio assets from HTML elements
    function loadAudioAssets() {
        try {
            // Count total sounds to load
            totalSounds = 0;
            
            // Load BGM tracks from HTML elements
            if (IdleAnts.AudioAssets && IdleAnts.AudioAssets.BGM) {
                for (const key in IdleAnts.AudioAssets.BGM) {
                    const asset = IdleAnts.AudioAssets.BGM[key];
                    totalSounds++;
                    
                    // Get the audio element from HTML
                    const audioElement = getAudioElement(asset.id);
                    
                    if (audioElement) {
                        sounds[asset.id] = {
                            id: asset.id,
                            isMusic: true,
                            audio: audioElement,
                            volume: asset.volume || 0.5,
                            loop: true
                        };
                        
                        // Set volume and loop properties
                        audioElement.loop = true;
                        audioElement.volume = asset.volume || 0.5;
                        
                        logger.debug(`Audio loaded from HTML: ${asset.id}`);
                        loadedSounds++;
                    } else {
                        console.warn(`Audio element with ID ${asset.id} not found in HTML`);
                    }
                }
            }
            
            // Load SFX from HTML elements
            if (IdleAnts.AudioAssets && IdleAnts.AudioAssets.SFX) {
                for (const key in IdleAnts.AudioAssets.SFX) {
                    const asset = IdleAnts.AudioAssets.SFX[key];
                    totalSounds++;
                    
                    // Get the audio element from HTML
                    const audioElement = getAudioElement(asset.id);
                    
                    if (audioElement) {
                        sounds[asset.id] = {
                            id: asset.id,
                            isMusic: false,
                            audio: audioElement,
                            volume: asset.volume || 0.3,
                            loop: false
                        };
                        
                        // Set volume
                        audioElement.volume = asset.volume || 0.3;
                        
                        logger.debug(`Audio loaded from HTML: ${asset.id}`);
                        loadedSounds++;
                    } else {
                        console.warn(`Audio element with ID ${asset.id} not found in HTML`);
                    }
                }
            }
            
            logger.debug(`Loaded ${loadedSounds}/${totalSounds} audio files from HTML`);
        } catch (error) {
            console.error('Error loading audio assets:', error);
        }
    }
    
    // Play a sound effect once
    function playSFX(id) {
        if (isMuted || !sounds[id]) return;
        
        try {
            const sound = sounds[id];
            if (sound.isMusic) return; // Don't play BGM with this method
            
            // Stop and reset the sound if it's already playing
            sound.audio.pause();
            sound.audio.currentTime = 0;
            
            // Set volume
            sound.audio.volume = sound.volume;
            
            // Play the sound
            sound.audio.play().catch(e => {
                console.warn(`Failed to play sound ${id}:`, e);
                // This usually happens due to browser policy requiring user interaction
                // before audio can play. We'll ignore this error.
            });
        } catch (error) {
            console.error(`Error playing sound ${id}:`, error);
        }
    }
    
    // Play background music with looping
    function playBGM(id) {
        if (!sounds[id]) return;
        
        try {
            // Stop current BGM if playing
            stopBGM();
            
            const sound = sounds[id];
            if (!sound.isMusic) return; // Don't play SFX with this method
            
            bgmTrack = id;
            
            // Set loop and volume
            sound.audio.loop = true;
            sound.audio.volume = isMuted ? 0 : sound.volume;
            
            // Play the BGM
            sound.audio.play().catch(e => {
                console.warn(`Failed to play BGM ${id}:`, e);
                // This usually happens due to browser policy requiring user interaction
                // before audio can play. We'll handle this with a resumeAudioContext function
            });
        } catch (error) {
            console.error(`Error playing BGM ${id}:`, error);
        }
    }
    
    // Stop the currently playing background music
    function stopBGM() {
        if (bgmTrack && sounds[bgmTrack]) {
            try {
                sounds[bgmTrack].audio.pause();
                sounds[bgmTrack].audio.currentTime = 0;
            } catch (error) {
                console.error(`Error stopping BGM:`, error);
            }
            bgmTrack = null;
        }
    }
    
    // Toggle mute state for all audio
    function toggleMute() {
        isMuted = !isMuted;
        
        // Update all current sounds
        for (const id in sounds) {
            try {
                sounds[id].audio.volume = isMuted ? 0 : sounds[id].volume;
            } catch (error) {
                console.error(`Error toggling mute for ${id}:`, error);
            }
        }
        
        return isMuted;
    }
    
    // Set volume for a specific sound
    function setVolume(id, volume) {
        if (sounds[id]) {
            try {
                sounds[id].volume = volume;
                sounds[id].audio.volume = isMuted ? 0 : volume;
            } catch (error) {
                console.error(`Error setting volume for ${id}:`, error);
            }
        }
    }
    
    // Resume audio context (needed for browsers that suspend it until user interaction)
    function resumeAudioContext() {
        try {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            // Also try to play BGM if it was set but not playing
            if (bgmTrack && sounds[bgmTrack]) {
                sounds[bgmTrack].audio.play().catch(() => {
                    // Ignore errors - this will be resolved when user interacts
                });
            }
        } catch (error) {
            console.error('Error resuming audio context:', error);
        }
    }
    
    // Public API
    return {
        init: init,
        playSFX: playSFX,
        playBGM: playBGM,
        stopBGM: stopBGM,
        toggleMute: toggleMute,
        setVolume: setVolume,
        resumeAudioContext: resumeAudioContext
    };
})(); 