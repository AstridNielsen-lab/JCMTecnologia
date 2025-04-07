import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Radar, Waves, Box, Maximize2, Send, ArrowDownLeft } from 'lucide-react';

const API_KEY = "AIzaSyCqsdGmlJfpYAzpu8uph1VAjI51XbB5iV0";
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

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const addSoundLog = (log: SoundLog) => {
    setSoundLogs(prev => [...prev.slice(-99), log]);
  };

  const emitUltrasonicPulse = () => {
    if (!audioContextRef.current) return;

    const frequency = 20000;
    const oscillator = audioContextRef.current.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);

    const gainNode = audioContextRef.current.createGain();
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.001);
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.002);

    oscillator.connect(gainNode);
    gainNode.connect(analyserRef.current!);
    analyserRef.current!.connect(audioContextRef.current.destination);

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.002);

    addSoundLog({
      type: 'sent',
      timestamp: Date.now(),
      frequency,
      angle: currentAngle
    });
  };

  const analyzeEchos = async () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const avgIntensity = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    const estimatedDistance = Math.round((1 - avgIntensity / 255) * 10 * 100) / 100;

    addSoundLog({
      type: 'received',
      timestamp: Date.now(),
      intensity: avgIntensity,
      distance: estimatedDistance,
      angle: currentAngle
    });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `
      Analyze this ultrasonic mapping data:
      - Average signal intensity: ${avgIntensity}
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
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());

      setMappingData({
        distance: estimatedDistance,
        intensity: avgIntensity,
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

          analysis.objects.forEach(obj => {
            const objAngle = (obj.angle * Math.PI) / 180;
            const objRadius = (obj.distance / 10) * radius;
            const x = centerX + Math.cos(objAngle) * objRadius;
            const y = centerY + Math.sin(objAngle) * objRadius;

            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
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
    
    // Clear points canvas
    if (pointsCanvasRef.current) {
      const ctx = pointsCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, pointsCanvasRef.current.width, pointsCanvasRef.current.height);
      }
    }

    const scan = () => {
      if (!isScanning) return;
      
      emitUltrasonicPulse();
      setCurrentAngle(prev => (prev + 2) % 360);
      
      setTimeout(async () => {
        await analyzeEchos();
        animationFrameRef.current = requestAnimationFrame(scan);
      }, 50);
    };
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

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Draw radar circles
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * (i / 4), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.stroke();
    }

    // Draw radar lines
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.stroke();
    }

    // Draw scanning line
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
    ctx.lineWidth = 1;

    // Draw detected objects
    mappingData.objects.forEach(obj => {
      const objAngle = (obj.angle * Math.PI) / 180;
      const objRadius = (obj.distance / 10) * radius;
      const x = centerX + Math.cos(objAngle) * objRadius;
      const y = centerY + Math.sin(objAngle) * objRadius;

      // Draw object point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00E5FF';
      ctx.fill();

      // Draw ripple effect
      ctx.beginPath();
      ctx.arc(x, y, 8 + Math.sin(Date.now() / 500) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.stroke();

      // Draw object label
      ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
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