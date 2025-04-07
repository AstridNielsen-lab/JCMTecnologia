import React, { useEffect, useRef } from 'react';

const AmbientSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Create AudioContext
    audioContextRef.current = new AudioContext();
    const ctx = audioContextRef.current;

    // Create base oscillator for ambient hum
    oscillatorRef.current = ctx.createOscillator();
    const oscillator = oscillatorRef.current;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(80, ctx.currentTime);

    // Create gain node for volume control
    gainNodeRef.current = ctx.createGain();
    const gainNode = gainNodeRef.current;
    gainNode.gain.setValueAtTime(0.015, ctx.currentTime);

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Start oscillator
    oscillator.start();

    // Create droid beep sounds
    const createDroidBeep = () => {
      const beepOsc = ctx.createOscillator();
      const beepGain = ctx.createGain();
      
      // Random frequency between 2000-4000 Hz for beep sound
      const baseFreq = Math.random() * 2000 + 2000;
      
      beepOsc.type = 'sine';
      beepOsc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      beepOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, ctx.currentTime + 0.1);
      
      beepGain.gain.setValueAtTime(0, ctx.currentTime);
      beepGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.01);
      beepGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      
      beepOsc.connect(beepGain);
      beepGain.connect(ctx.destination);
      
      beepOsc.start();
      beepOsc.stop(ctx.currentTime + 0.1);
    };

    // Create mechanical servo sounds
    const createServoSound = () => {
      const servoOsc = ctx.createOscillator();
      const servoGain = ctx.createGain();
      
      // Random frequency between 100-300 Hz for servo sound
      const servoFreq = Math.random() * 200 + 100;
      
      servoOsc.type = 'sawtooth';
      servoOsc.frequency.setValueAtTime(servoFreq, ctx.currentTime);
      servoOsc.frequency.linearRampToValueAtTime(servoFreq * 1.5, ctx.currentTime + 0.05);
      servoOsc.frequency.linearRampToValueAtTime(servoFreq, ctx.currentTime + 0.1);
      
      servoGain.gain.setValueAtTime(0, ctx.currentTime);
      servoGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.01);
      servoGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      
      servoOsc.connect(servoGain);
      servoGain.connect(ctx.destination);
      
      servoOsc.start();
      servoOsc.stop(ctx.currentTime + 0.1);
    };

    // Create protocol droid voice-like sounds
    const createProtocolDroidSound = () => {
      const voiceOsc = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();
      
      // Random frequency between 300-600 Hz for voice-like sound
      const voiceFreq = Math.random() * 300 + 300;
      
      voiceOsc.type = 'square';
      voiceOsc.frequency.setValueAtTime(voiceFreq, ctx.currentTime);
      
      filterNode.type = 'bandpass';
      filterNode.frequency.setValueAtTime(1000, ctx.currentTime);
      filterNode.Q.setValueAtTime(10, ctx.currentTime);
      
      voiceGain.gain.setValueAtTime(0, ctx.currentTime);
      voiceGain.gain.linearRampToValueAtTime(0.008, ctx.currentTime + 0.05);
      voiceGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      
      voiceOsc.connect(filterNode);
      filterNode.connect(voiceGain);
      voiceGain.connect(ctx.destination);
      
      voiceOsc.start();
      voiceOsc.stop(ctx.currentTime + 0.2);
    };

    // Schedule random droid sounds
    const scheduleRandomSounds = () => {
      const soundType = Math.random();
      
      if (soundType < 0.4) {
        createDroidBeep();
      } else if (soundType < 0.7) {
        createServoSound();
      } else {
        createProtocolDroidSound();
      }
      
      // Schedule next sound with random interval
      const nextInterval = Math.random() * 2000 + 1000; // 1-3 seconds
      setTimeout(scheduleRandomSounds, nextInterval);
    };

    // Start sound scheduling
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