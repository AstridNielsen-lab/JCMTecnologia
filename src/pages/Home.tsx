import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Globe, 
  Shield, 
  Activity, 
  Target, 
  Cpu,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  LineChart,
  PieChart,
  Radar
} from 'lucide-react';
import UltrasonicMapping from '../components/UltrasonicMapping';
import NetworkScanner from '../components/NetworkScanner';
import Toolbox from '../components/Toolbox';

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radarRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const histogramRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Radar Animation
    const radarCanvas = radarRef.current;
    if (!radarCanvas) return;
    const radarCtx = radarCanvas.getContext('2d');
    if (!radarCtx) return;

    let radarAngle = 0;
    const points = Array.from({ length: 6 }, () => ({
      x: Math.random() * radarCanvas.width,
      y: Math.random() * radarCanvas.height
    }));

    const drawRadar = () => {
      radarCtx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
      
      // Draw connecting lines
      radarCtx.beginPath();
      radarCtx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
      points.forEach((point, i) => {
        const nextPoint = points[(i + 1) % points.length];
        radarCtx.moveTo(point.x, point.y);
        radarCtx.lineTo(nextPoint.x, nextPoint.y);
      });
      radarCtx.stroke();

      // Draw scanning line
      radarCtx.beginPath();
      radarCtx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
      radarCtx.moveTo(radarCanvas.width / 2, radarCanvas.height / 2);
      radarCtx.lineTo(
        radarCanvas.width / 2 + Math.cos(radarAngle) * radarCanvas.width,
        radarCanvas.height / 2 + Math.sin(radarAngle) * radarCanvas.height
      );
      radarCtx.stroke();

      // Draw points
      points.forEach(point => {
        radarCtx.beginPath();
        radarCtx.fillStyle = 'rgba(0, 229, 255, 0.8)';
        radarCtx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        radarCtx.fill();
      });

      radarAngle += 0.02;
      requestAnimationFrame(drawRadar);
    };

    drawRadar();

    // Waveform Animation
    const waveformCanvas = waveformRef.current;
    if (!waveformCanvas) return;
    const waveformCtx = waveformCanvas.getContext('2d');
    if (!waveformCtx) return;

    let time = 0;
    const drawWaveform = () => {
      waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
      waveformCtx.beginPath();
      waveformCtx.strokeStyle = 'rgba(0, 229, 255, 0.8)';

      for (let x = 0; x < waveformCanvas.width; x++) {
        const y = waveformCanvas.height / 2 +
          Math.sin(x * 0.02 + time) * 30 +
          Math.sin(x * 0.01 + time * 0.5) * 20;
        
        if (x === 0) {
          waveformCtx.moveTo(x, y);
        } else {
          waveformCtx.lineTo(x, y);
        }
      }

      waveformCtx.stroke();
      time += 0.05;
      requestAnimationFrame(drawWaveform);
    };

    drawWaveform();

    // Histogram Animation
    const histogramCanvas = histogramRef.current;
    if (!histogramCanvas) return;
    const histogramCtx = histogramCanvas.getContext('2d');
    if (!histogramCtx) return;

    const bars = 20;
    const values = Array.from({ length: bars }, () => Math.random());

    const drawHistogram = () => {
      histogramCtx.clearRect(0, 0, histogramCanvas.width, histogramCanvas.height);
      
      const barWidth = histogramCanvas.width / bars;
      values.forEach((value, i) => {
        values[i] += (Math.random() - 0.5) * 0.1;
        values[i] = Math.max(0, Math.min(1, values[i]));
        
        const height = values[i] * histogramCanvas.height;
        histogramCtx.fillStyle = `rgba(0, 229, 255, ${0.3 + values[i] * 0.5})`;
        histogramCtx.fillRect(
          i * barWidth,
          histogramCanvas.height - height,
          barWidth - 1,
          height
        );
      });

      requestAnimationFrame(drawHistogram);
    };

    drawHistogram();

    return () => {
      // Cleanup animations if needed
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface-dark relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hex-grid opacity-30" />
      <div className="absolute inset-0 data-lines" />
      <div className="absolute inset-0 bg-grid-pattern" />
      
      <div className="relative min-h-screen p-4 sm:p-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-4 h-full">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* System Status */}
            <div className="hud-border p-4 scanner">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-primary text-lg font-bold">System Status</h3>
                <Activity className="text-primary h-5 w-5" />
              </div>
              <div className="space-y-2">
                {['CPU', 'Memory', 'Network', 'Storage'].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-primary/80 text-sm">{item}</span>
                    <div className="w-32 h-2 bg-primary/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${Math.random() * 60 + 40}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toolbox */}
            <div className="hud-border scanner">
              <Toolbox />
            </div>

            <NetworkScanner />
          </div>

          {/* Center Column */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            <UltrasonicMapping />

            {/* Main Display */}
            <div className="hud-border p-4 min-h-[400px] relative scanner">
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Target className="text-primary h-5 w-5" />
                  <span className="text-primary text-sm">Target 57.15.22</span>
                </div>
                <div className="flex items-center space-x-4">
                  <ChevronLeft className="text-primary h-5 w-5" />
                  <Globe className="text-primary h-5 w-5" />
                  <ChevronRight className="text-primary h-5 w-5" />
                </div>
                <Maximize2 className="text-primary h-5 w-5" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-[spin_4s_linear_infinite]" />
                  <div className="absolute inset-2 border-2 border-primary/40 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
                  <div className="absolute inset-4 border-2 border-primary/50 rounded-full animate-[spin_8s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="text-primary h-8 w-8 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-center">
                  <span className="text-primary text-sm">Location 55.48.42</span>
                  <div className="h-1 w-full bg-primary/20 mt-2">
                    <div className="h-full w-1/2 bg-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Data Visualization */}
            <div className="grid grid-cols-2 gap-4">
              <div className="hud-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-primary text-lg font-bold">Waveform</h3>
                  <LineChart className="text-primary h-5 w-5" />
                </div>
                <canvas
                  ref={waveformRef}
                  width={300}
                  height={150}
                  className="w-full h-[150px] rounded border border-primary/30"
                />
              </div>
              <div className="hud-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-primary text-lg font-bold">Distribution</h3>
                  <BarChart3 className="text-primary h-5 w-5" />
                </div>
                <canvas
                  ref={histogramRef}
                  width={300}
                  height={150}
                  className="w-full h-[150px] rounded border border-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Component Status */}
            <div className="hud-border p-4 scanner">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-primary text-lg font-bold">Components</h3>
                <PieChart className="text-primary h-5 w-5" />
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Core Module', status: 'Online', value: 92 },
                  { name: 'Neural Net', status: 'Active', value: 87 },
                  { name: 'Data Stream', status: 'Stable', value: 95 },
                  { name: 'Security', status: 'Optimal', value: 98 }
                ].map((component, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-primary/80">{component.name}</span>
                      <span className="text-primary">{component.status}</span>
                    </div>
                    <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${component.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hud-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-primary text-lg font-bold">Quick Actions</h3>
                <Shield className="text-primary h-5 w-5" />
              </div>
              <div className="space-y-2">
                <Link
                  to="/neural"
                  className="block w-full p-2 border border-primary/30 rounded text-primary hover:bg-primary/10 transition-colors text-sm text-center"
                >
                  Neural Interface
                </Link>
                <Link
                  to="/products"
                  className="block w-full p-2 border border-primary/30 rounded text-primary hover:bg-primary/10 transition-colors text-sm text-center"
                >
                  View Projects
                </Link>
                <Link
                  to="/about"
                  className="block w-full p-2 border border-primary/30 rounded text-primary hover:bg-primary/10 transition-colors text-sm text-center"
                >
                  System Info
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;