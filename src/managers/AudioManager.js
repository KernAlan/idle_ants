IdleAnts.AudioManager = (function() {
    // Private audio context and sounds storage
    let audioContext = null;
    let sounds = {};
    let bgmTrack = null;
    let isMuted = false;
    let loadedSounds = 0;
    let totalSounds = 0;
    
    // Music playlist system
    let currentPlaylist = null;
    let currentTrackIndex = 0;
    let playlistLooping = false;
    
    // Initialize audio context
    function init() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            
            // Load all audio assets from HTML elements
            loadAudioAssets();
            
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
                        audioElement.loop = false; // We'll handle looping manually for playlists
                        audioElement.volume = asset.volume || 0.5;
                        
                        // Add event listener for when track ends
                        audioElement.addEventListener('ended', handleTrackEnded);
                        
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
                        
                        loadedSounds++;
                    } else {
                        console.warn(`Audio element with ID ${asset.id} not found in HTML`);
                    }
                }
            }
            
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
    
    // Handle when a track ends - for playlist functionality
    function handleTrackEnded() {
        if (currentPlaylist && playlistLooping) {
            // Move to next track in playlist
            currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
            const nextTrackId = currentPlaylist[currentTrackIndex];
            playBGMInternal(nextTrackId, false); // Don't reset playlist
        } else if (bgmTrack && sounds[bgmTrack] && sounds[bgmTrack].loop !== false) {
            // Single track looping (only if loop is not explicitly false)
            sounds[bgmTrack].audio.currentTime = 0;
            sounds[bgmTrack].audio.play().catch(e => {
                console.warn(`Failed to loop track ${bgmTrack}:`, e);
            });
        }
    }
    
    // Start a music playlist that loops between tracks
    function startMusicPlaylist(trackIds) {
        if (!Array.isArray(trackIds) || trackIds.length === 0) {
            console.warn('Invalid playlist provided');
            return;
        }
        
        // Validate all tracks exist
        for (const trackId of trackIds) {
            if (!sounds[trackId] || !sounds[trackId].isMusic) {
                console.warn(`Invalid track in playlist: ${trackId}`);
                return;
            }
        }
        
        currentPlaylist = trackIds;
        currentTrackIndex = 0;
        playlistLooping = true;
        
        // Start playing the first track
        playBGMInternal(trackIds[0], false);
    }
    
    // Stop playlist and return to single track mode
    function stopMusicPlaylist() {
        currentPlaylist = null;
        currentTrackIndex = 0;
        playlistLooping = false;
        stopBGM();
    }
    
    // Internal BGM play function (used by both single track and playlist)
    function playBGMInternal(id, resetPlaylist = true) {
        if (!sounds[id]) return;
        
        try {
            // Stop current BGM if playing
            if (bgmTrack && sounds[bgmTrack]) {
                sounds[bgmTrack].audio.pause();
                sounds[bgmTrack].audio.currentTime = 0;
            }
            
            const sound = sounds[id];
            if (!sound.isMusic) return; // Don't play SFX with this method
            
            bgmTrack = id;
            
            if (resetPlaylist) {
                // Reset playlist when manually changing tracks
                currentPlaylist = null;
                playlistLooping = false;
                // Respect the loop setting from the asset definition
                sound.audio.loop = sound.loop !== undefined ? sound.loop : true;
            } else {
                sound.audio.loop = false; // Disable native looping for playlist tracks
            }
            
            // Set volume
            sound.audio.volume = isMuted ? 0 : sound.volume;
            
            // Play the BGM
            sound.audio.play().catch(e => {
                console.warn(`Failed to play BGM ${id}:`, e);
            });
        } catch (error) {
            console.error(`Error playing BGM ${id}:`, error);
        }
    }
    
    // Play background music with looping
    function playBGM(id) {
        playBGMInternal(id, true); // Reset playlist when manually changing tracks
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
        startMusicPlaylist: startMusicPlaylist,
        stopMusicPlaylist: stopMusicPlaylist,
        toggleMute: toggleMute,
        setVolume: setVolume,
        resumeAudioContext: resumeAudioContext
    };
})(); 