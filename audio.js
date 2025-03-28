// Audio manager for game sounds
const audioManager = {
    sounds: {},
    
    init: function() {
        // Create victory sound using the Web Audio API
        this.createVictorySound();
    },
    
    createVictorySound: function() {
        try {
            // Create an audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            
            // Create a victory sound using oscillators
            const victorySound = {
                play: () => {
                    // Reset the audio context if it was suspended
                    if (audioCtx.state === 'suspended') {
                        audioCtx.resume();
                    }
                    
                    // Create a sequence of notes for a victory fanfare
                    const notes = [
                        { frequency: 523.25, duration: 0.2 }, // C5
                        { frequency: 659.25, duration: 0.2 }, // E5
                        { frequency: 783.99, duration: 0.2 }, // G5
                        { frequency: 1046.50, duration: 0.5 }  // C6
                    ];
                    
                    // Play each note in sequence
                    let startTime = audioCtx.currentTime;
                    
                    notes.forEach(note => {
                        // Create oscillator
                        const oscillator = audioCtx.createOscillator();
                        oscillator.type = 'sine';
                        oscillator.frequency.value = note.frequency;
                        
                        // Create gain node for volume control
                        const gainNode = audioCtx.createGain();
                        gainNode.gain.value = 0.3; // Set volume
                        
                        // Connect nodes
                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);
                        
                        // Schedule note
                        oscillator.start(startTime);
                        oscillator.stop(startTime + note.duration);
                        
                        // Set up fade out
                        gainNode.gain.setValueAtTime(0.3, startTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
                        
                        // Update start time for next note
                        startTime += note.duration;
                    });
                }
            };
            
            this.sounds.victory = victorySound;
            
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
        }
    },
    
    play: function(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        } else {
            console.warn(`Sound ${soundName} not found`);
        }
    }
};
