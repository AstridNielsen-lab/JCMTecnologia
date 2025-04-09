import React, { useEffect, useRef, useState } from 'react';
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
  Radar,
  Power
} from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';
import UltrasonicMapping from '../components/UltrasonicMapping';
import NetworkScanner from '../components/NetworkScanner';
import Toolbox from '../components/Toolbox';

const Home = () => {
  const [showUltrasonic, setShowUltrasonic] = useState(false);
  const [showNetworkScanner, setShowNetworkScanner] = useState(false);
  
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
            <ErrorBoundary moduleName="Status do Sistema">
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
            </ErrorBoundary>

            {/* Toolbox */}
            <ErrorBoundary moduleName="Toolbox">
              <div className="hud-border scanner">
                <Toolbox />
              </div>
            </ErrorBoundary>

            {/* Network Scanner Toggle */}
            <ErrorBoundary moduleName="Scanner de Rede">
              <div className="hud-border p-4 scanner">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-primary text-lg font-bold">Network Scanner</h3>
                  <button
                    onClick={() => setShowNetworkScanner(!showNetworkScanner)}
                    className={`p-2 rounded-lg transition-colors ${
                      showNetworkScanner 
                        ? 'bg-red-500 text-white' 
                        : 'bg-primary text-surface-dark'
                    }`}
                  >
                    <Power className="h-5 w-5" />
                  </button>
                </div>
                {showNetworkScanner && <NetworkScanner />}
              </div>
            </ErrorBoundary>
          </div>

          {/* Center Column */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            {/* Ultrasonic Mapping Toggle */}
            <ErrorBoundary moduleName="Mapeamento Ultrassônico">
              <div className="hud-border p-4 scanner">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-primary text-lg font-bold">Ultrasonic Mapping</h3>
                  <button
                    onClick={() => setShowUltrasonic(!showUltrasonic)}
                    className={`p-2 rounded-lg transition-colors ${
                      showUltrasonic 
                        ? 'bg-red-500 text-white' 
                        : 'bg-primary text-surface-dark'
                    }`}
                  >
                    <Power className="h-5 w-5" />
                  </button>
                </div>
                {showUltrasonic && <UltrasonicMapping />}
              </div>
            </ErrorBoundary>

            {/* Data Visualization */}
            <div className="grid grid-cols-2 gap-4">
              <ErrorBoundary moduleName="Visualização de Dados">
                <div className="hud-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-primary text-lg font-bold">Data Analysis</h3>
                    <LineChart className="text-primary h-5 w-5" />
                  </div>
                  <div className="text-center p-4">
                    <p className="text-primary/70">Clique para ativar análise de dados</p>
                  </div>
                </div>
              </ErrorBoundary>

              <ErrorBoundary moduleName="Estatísticas">
                <div className="hud-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-primary text-lg font-bold">Statistics</h3>
                    <BarChart3 className="text-primary h-5 w-5" />
                  </div>
                  <div className="text-center p-4">
                    <p className="text-primary/70">Clique para ativar estatísticas</p>
                  </div>
                </div>
              </ErrorBoundary>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Component Status */}
            <ErrorBoundary moduleName="Status dos Componentes">
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
            </ErrorBoundary>

            {/* Quick Actions */}
            <ErrorBoundary moduleName="Ações Rápidas">
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
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;