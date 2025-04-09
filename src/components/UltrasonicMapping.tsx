import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Radar, Waves, Box, Maximize2, Send, ArrowDownLeft } from 'lucide-react';

const API_KEY = "SUA API AQUI";
const genAI = new GoogleGenerativeAI(API_KEY);

interface MappingData {
  distance: number;
  intensity: number;
  objects: Array<{
    angle: number;
    distance: number;
    type: string;
  }>;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

interface SoundLog {
  type: 'sent' | 'received';
  timestamp: number;
  frequency?: number;
  intensity?: number;
  distance?: number;
  angle: number;
}

const UltrasonicMapping = () => {
  const [mappingData, setMappingData] = useState<MappingData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [soundLogs, setSoundLogs] = useState<SoundLog[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorStartedRef = useRef<boolean>(false);

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;

    // Create initial oscillator and gain nodes
    oscillatorRef.current = audioContextRef.current.createOscillator();
    gainNodeRef.current = audioContextRef.current.createGain();
    
    // Connect nodes
    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    // Set initial gain to 0
    gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);

    // Start the oscillator immediately and track its state
    oscillatorRef.current.start();
    oscillatorStartedRef.current = true;

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Only stop the oscillator if it was started
      if (oscillatorRef.current && oscillatorStartedRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (error) {
          console.warn('Error stopping oscillator:', error);
        }
      }
    };
  }, []);

  const addSoundLog = (log: SoundLog) => {
    setSoundLogs(prev => [...prev.slice(-99), log]);
  };

  const emitUltrasonicPulse = () => {
    if (!audioContextRef.current || !oscillatorRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Create new oscillator for each pulse
    const pulseOsc = ctx.createOscillator();
    const pulseGain = ctx.createGain();

    // Configure oscillator
    pulseOsc.type = 'sine';
    pulseOsc.frequency.setValueAtTime(20000, now);
    pulseOsc.connect(pulseGain);
    pulseGain.connect(ctx.destination);

    // Configure gain envelope
    pulseGain.gain.setValueAtTime(0, now);
    pulseGain.gain.linearRampToValueAtTime(0.1, now + 0.001);
    pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    // Start and stop the pulse
    pulseOsc.start(now);
    pulseOsc.stop(now + 0.1);

    // Add sound effect for feedback
    const feedbackOsc = ctx.createOscillator();
    const feedbackGain = ctx.createGain();
    
    feedbackOsc.type = 'sine';
    feedbackOsc.frequency.setValueAtTime(440, now);
    feedbackOsc.connect(feedbackGain);
    feedbackGain.connect(ctx.destination);

    feedbackGain.gain.setValueAtTime(0, now);
    feedbackGain.gain.linearRampToValueAtTime(0.05, now + 0.001);
    feedbackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    feedbackOsc.start(now);
    feedbackOsc.stop(now + 0.05);

    addSoundLog({
      type: 'sent',
      timestamp: Date.now(),
      frequency: 20000,
      angle: currentAngle
    });
  };

  const analyzeEchos = async () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average intensity with weighted high frequencies
    const highFreqWeights = dataArray.slice(Math.floor(bufferLength * 0.7));
    const avgIntensity = highFreqWeights.reduce((a, b) => a + b, 0) / highFreqWeights.length;
    
    // Add random variation for more realistic readings
    const noise = (Math.random() - 0.5) * 10;
    const adjustedIntensity = Math.max(0, Math.min(255, avgIntensity + noise));
    
    // Calculate distance using inverse square law with some randomization
    const maxDistance = 10; // meters
    const minIntensity = 20;
    const distanceNoise = (Math.random() - 0.5) * 0.5;
    const estimatedDistance = Math.min(
      maxDistance,
      Math.max(0.1, (1 - (adjustedIntensity - minIntensity) / (255 - minIntensity)) * maxDistance + distanceNoise)
    );

    addSoundLog({
      type: 'received',
      timestamp: Date.now(),
      intensity: adjustedIntensity,
      distance: estimatedDistance,
      angle: currentAngle
    });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `
      Analyze this ultrasonic mapping data:
      - Average signal intensity: ${adjustedIntensity}
      - Estimated distance: ${estimatedDistance}m
      - Current angle: ${currentAngle}°
      - Frequency distribution: ${dataArray.slice(0, 10).join(', ')}...

      Based on this data, identify objects in the environment and their positions.
      Format the response as JSON with the following structure:
      {
        "objects": [
          {
            "angle": number,
            "distance": number,
            "type": "string"
          }
        ],
        "dimensions": {
          "width": number,
          "height": number,
          "depth": number
        }
      }

      Consider:
      - Objects closer to the sensor have stronger reflections
      - Sharp changes in intensity might indicate edges or corners
      - Similar readings across adjacent angles suggest flat surfaces
      - Scattered readings might indicate irregular objects
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());

      setMappingData({
        distance: estimatedDistance,
        intensity: adjustedIntensity,
        objects: analysis.objects,
        dimensions: analysis.dimensions
      });

      // Draw point on the points canvas
      if (pointsCanvasRef.current) {
        const ctx = pointsCanvasRef.current.getContext('2d');
        if (ctx) {
          const width = pointsCanvasRef.current.width;
          const height = pointsCanvasRef.current.height;
          const centerX = width / 2;
          const centerY = height / 2;
          const radius = Math.min(width, height) / 2 - 20;

          // Draw detected objects with glow effect
          analysis.objects.forEach(obj => {
            const objAngle = (obj.angle * Math.PI) / 180;
            const objRadius = (obj.distance / 10) * radius;
            const x = centerX + Math.cos(objAngle) * objRadius;
            const y = centerY + Math.sin(objAngle) * objRadius;

            // Draw glow
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 10);
            gradient.addColorStop(0, 'rgba(0, 229, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
            
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw point
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#00E5FF';
            ctx.fill();
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing environment:', error);
    }
  };

  const startMapping = () => {
    setIsScanning(true);
    setSoundLogs([]);
    
    // Clear points canvas with fade effect
    if (pointsCanvasRef.current) {
      const ctx = pointsCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, pointsCanvasRef.current.width, pointsCanvasRef.current.height);
      }
    }

    // Start the scanning process
    const scan = () => {
      if (!isScanning) return;
      
      emitUltrasonicPulse();
      
      // Update angle with smooth acceleration
      setCurrentAngle(prev => {
        const speed = Math.sin((prev % 90) * Math.PI / 180) * 2 + 1;
        return (prev + speed) % 360;
      });
      
      setTimeout(async () => {
        await analyzeEchos();
        animationFrameRef.current = requestAnimationFrame(scan);
      }, 50);
    };

    // Initialize audio context if needed
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    scan();
  };

  const stopMapping = () => {
    setIsScanning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const drawRadar = () => {
    if (!canvasRef.current || !mappingData) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Apply motion blur effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Draw radar circles with gradient
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * (i / 4), 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * ((i - 1) / 4),
        centerX, centerY, radius * (i / 4)
      );
      gradient.addColorStop(0, 'rgba(0, 229, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 229, 255, 0.3)');
      ctx.strokeStyle = gradient;
      ctx.stroke();
    }

    // Draw radar lines with gradient
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const gradient = ctx.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      gradient.addColorStop(0, 'rgba(0, 229, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 229, 255, 0.1)');
      ctx.strokeStyle = gradient;
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.stroke();
    }

    // Draw scanning line with glow effect
    const scanAngle = (currentAngle * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(scanAngle) * radius,
      centerY + Math.sin(scanAngle) * radius
    );
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;

    // Draw detected objects with animations
    mappingData.objects.forEach(obj => {
      const objAngle = (obj.angle * Math.PI) / 180;
      const objRadius = (obj.distance / 10) * radius;
      const x = centerX + Math.cos(objAngle) * objRadius;
      const y = centerY + Math.sin(objAngle) * objRadius;

      // Draw ripple effect
      const time = Date.now() / 1000;
      const rippleSize = 5 + Math.sin(time * 2) * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, rippleSize, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.stroke();

      // Draw object point with glow
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw object label with fade effect
      const labelOpacity = 0.6 + Math.sin(time * 3) * 0.2;
      ctx.fillStyle = `rgba(0, 229, 255, ${labelOpacity})`;
      ctx.font = '10px monospace';
      ctx.fillText(obj.type, x + 10, y);
    });

    animationFrameRef.current = requestAnimationFrame(drawRadar);
  };

  useEffect(() => {
    if (isScanning) {
      drawRadar();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning, mappingData, currentAngle]);

  return (
    <div className="hud-border p-4 scanner">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <Radar className="h-5 w-5" />
          Mapeamento Ultrassônico
        </h3>
        <button
          onClick={isScanning ? stopMapping : startMapping}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            isScanning
              ? 'bg-red-500 text-white'
              : 'bg-primary text-surface-dark'
          }`}
        >
          {isScanning ? 'Parar Scan' : 'Iniciar Scan'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="border border-primary/30 rounded-lg p-4 bg-black/50">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full h-full"
            />
          </div>
          <div className="border border-primary/30 rounded-lg p-4 bg-black/50">
            <canvas
              ref={pointsCanvasRef}
              width={400}
              height={400}
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Sound Logs */}
          <div className="border border-primary/30 rounded-lg p-4 bg-black/50 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
            <h4 className="text-primary font-medium mb-2">Logs de Som:</h4>
            <div className="space-y-1">
              {soundLogs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 text-xs ${
                    log.type === 'sent' ? 'text-yellow-400' : 'text-green-400'
                  }`}
                >
                  <span className="mt-1">
                    {log.type === 'sent' ? <Send className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                  </span>
                  <div>
                    <span className="opacity-50">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    {log.type === 'sent' ? (
                      <p>Pulso enviado: {log.frequency}Hz a {log.angle}°</p>
                    ) : (
                      <p>Eco recebido: {log.intensity?.toFixed(2)} intensidade, {log.distance}m a {log.angle}°</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          {mappingData && (
            <>
              <div className="flex items-center gap-2 text-primary">
                <Waves className="h-5 w-5" />
                <span>Intensidade: {Math.round(mappingData.intensity)}%</span>
              </div>
              
              <div className="flex items-center gap-2 text-primary">
                <Box className="h-5 w-5" />
                <span>Objetos Detectados: {mappingData.objects.length}</span>
              </div>
              
              <div className="flex items-center gap-2 text-primary">
                <Maximize2 className="h-5 w-5" />
                <span>
                  Dimensões: {mappingData.dimensions.width}m x {mappingData.dimensions.height}m x {mappingData.dimensions.depth}m
                </span>
              </div>

              <div className="mt-4">
                <h4 className="text-primary font-medium mb-2">Objetos:</h4>
                <ul className="space-y-1">
                  {mappingData.objects.map((obj, index) => (
                    <li key={index} className="text-primary/80 text-sm">
                      • {obj.type} ({obj.distance}m a {obj.angle}°)
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {isScanning && !mappingData && (
            <div className="flex items-center justify-center h-full">
              <div className="cyber-spinner">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Radar className="h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UltrasonicMapping;