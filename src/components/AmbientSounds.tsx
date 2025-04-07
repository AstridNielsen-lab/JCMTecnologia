import React, { useEffect, useRef } from 'react';

const AmbientSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Create AudioContext
    audioContextRef.current = new AudioContext();
    const ctx = audioContextRef.current;

    // Create base oscillator for computer hum
    oscillatorRef.current = ctx.createOscillator();
    const oscillator = oscillatorRef.current;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(60, ctx.currentTime);

    // Create gain node for volume control
    gainNodeRef.current = ctx.createGain();
    const gainNode = gainNodeRef.current;
    gainNode.gain.setValueAtTime(0.02, ctx.currentTime);

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Start oscillator
    oscillator.start();

    // Create random valve sounds
    const createValveSound = () => {
      const valveOsc = ctx.createOscillator();
      const valveGain = ctx.createGain();
      
      valveOsc.type = 'square';
      valveOsc.frequency.setValueAtTime(Math.random() * 200 + 100, ctx.currentTime);
      
      valveGain.gain.setValueAtTime(0, ctx.currentTime);
      valveGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.1);
      valveGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      
      valveOsc.connect(valveGain);
      valveGain.connect(ctx.destination);
      
      valveOsc.start();
      valveOsc.stop(ctx.currentTime + 0.3);
    };

    // Create random computer processing sounds
    const createProcessingSound = () => {
      const procOsc = ctx.createOscillator();
      const procGain = ctx.createGain();
      
      procOsc.type = 'sawtooth';
      procOsc.frequency.setValueAtTime(Math.random() * 1000 + 500, ctx.currentTime);
      
      procGain.gain.setValueAtTime(0, ctx.currentTime);
      procGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      procGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      
      procOsc.connect(procGain);
      procGain.connect(ctx.destination);
      
      procOsc.start();
      procOsc.stop(ctx.currentTime + 0.1);
    };

    // Schedule random sounds
    const scheduleRandomSounds = () => {
      if (Math.random() > 0.5) {
        createValveSound();
      } else {
        createProcessingSound();
      }
      
      // Schedule next sound
      setTimeout(scheduleRandomSounds, Math.random() * 3000 + 1000);
    };

    scheduleRandomSounds();

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return null;
};

export default AmbientSounds;