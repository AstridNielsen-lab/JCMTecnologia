import React from 'react';
import { BarChart3, LineChart, AudioWaveformIcon as WaveformIcon, Activity } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';
import Toolbox from '../components/Toolbox';

const Home = () => {
  return (
    <div className="min-h-screen bg-surface-dark relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hex-grid opacity-30" />
      <div className="absolute inset-0 data-lines" />
      <div className="absolute inset-0 bg-grid-pattern" />
      
      <div className="relative min-h-screen p-4 sm:p-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-4 h-full">
          {/* Left Column - Toolbox */}
          <div className="col-span-12 lg:col-span-4">
            <ErrorBoundary moduleName="Toolbox">
              <div className="hud-border scanner">
                <Toolbox />
              </div>
            </ErrorBoundary>
          </div>

          {/* Center Column - Waveform */}
          <div className="col-span-12 lg:col-span-4">
            <ErrorBoundary moduleName="Waveform Analysis">
              <div className="hud-border p-4 scanner">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-primary text-lg font-bold">Waveform Analysis</h3>
                  <WaveformIcon className="text-primary h-5 w-5" />
                </div>
                <div className="h-48 bg-surface/50 rounded-lg border border-primary/30 p-4">
                  <div className="h-full flex items-center justify-center">
                    <div className="w-full h-24 relative">
                      {[...Array(50)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute bottom-1/2 w-1 bg-primary"
                          style={{
                            left: `${(i / 50) * 100}%`,
                            height: `${Math.abs(Math.sin(i * 0.2)) * 100}%`,
                            transform: 'translateY(50%)',
                            opacity: 0.5 + Math.abs(Math.sin(i * 0.2)) * 0.5
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ErrorBoundary>
          </div>

          {/* Right Column - Distribution */}
          <div className="col-span-12 lg:col-span-4">
            <ErrorBoundary moduleName="Distribution Analysis">
              <div className="hud-border p-4 scanner">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-primary text-lg font-bold">Distribution Analysis</h3>
                  <BarChart3 className="text-primary h-5 w-5" />
                </div>
                <div className="h-48 bg-surface/50 rounded-lg border border-primary/30 p-4">
                  <div className="h-full flex items-end justify-between gap-1">
                    {[...Array(12)].map((_, i) => {
                      const height = 30 + Math.random() * 70;
                      return (
                        <div
                          key={i}
                          className="w-full bg-primary"
                          style={{
                            height: `${height}%`,
                            opacity: 0.5 + (height / 100) * 0.5
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;