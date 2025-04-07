import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Radar, Waves, Box, Maximize2 } from 'lucide-react';

const API_KEY = "AIzaSyCqsdGmlJfpYAzpu8uph1VAjI51XbB5iV0";
const genAI = new GoogleGenerativeAI(API_KEY);

interface MappingData {
  distance: number;
  intensity: number;
  objects: string[];
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

const UltrasonicMapping = () => {
  const [mappingData, setMappingData] = useState<MappingData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const emitUltrasonicPulse = () => {
    if (!audioContextRef.current) return;

    // Create ultrasonic oscillator (20kHz)
    const oscillator = audioContextRef.current.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(20000, audioContextRef.current.currentTime);

    // Create gain node for pulse shaping
    const gainNode = audioContextRef.current.createGain();
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.001);
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.002);

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(analyserRef.current!);
    analyserRef.current!.connect(audioContextRef.current.destination);

    // Start and stop the pulse
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.002);
  };

  const analyzeEchos = async () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average intensity and estimate distance
    const avgIntensity = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    const estimatedDistance = Math.round((1 - avgIntensity / 255) * 10 * 100) / 100;

    // Use Gemini to analyze the frequency data
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `
      Analyze this ultrasonic mapping data:
      - Average signal intensity: ${avgIntensity}
      - Estimated distance: ${estimatedDistance}m
      - Frequency distribution: ${dataArray.slice(0, 10).join(', ')}...

      Based on this data:
      1. Identify potential objects in the environment
      2. Estimate room dimensions
      3. Describe the acoustic properties
      
      Format the response as JSON with the following structure:
      {
        "objects": ["object1", "object2"],
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
    } catch (error) {
      console.error('Error analyzing environment:', error);
    }
  };

  const startMapping = () => {
    setIsScanning(true);
    const scan = () => {
      if (!isScanning) return;
      
      emitUltrasonicPulse();
      setTimeout(async () => {
        await analyzeEchos();
        requestAnimationFrame(scan);
      }, 100);
    };
    scan();
  };

  const stopMapping = () => {
    setIsScanning(false);
  };

  const drawVisualization = () => {
    if (!canvasRef.current || !mappingData) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw room boundaries
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvasRef.current.width - 40, canvasRef.current.height - 40);

    // Draw detected objects
    mappingData.objects.forEach((_, index) => {
      const x = Math.random() * (canvasRef.current!.width - 80) + 40;
      const y = Math.random() * (canvasRef.current!.height - 80) + 40;
      
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00E5FF';
      ctx.fill();
      
      // Draw ripple effect
      ctx.beginPath();
      ctx.arc(x, y, 15 + Math.sin(Date.now() / 500) * 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#00E5FF50';
      ctx.stroke();
    });
  };

  useEffect(() => {
    if (mappingData) {
      const animationFrame = requestAnimationFrame(drawVisualization);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [mappingData]);

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
        <div className="border border-primary/30 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            className="w-full h-[200px] bg-surface-dark/50"
          />
        </div>

        <div className="space-y-4">
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
                      • {obj}
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