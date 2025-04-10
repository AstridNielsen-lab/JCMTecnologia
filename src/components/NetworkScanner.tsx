import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Wifi, 
  Smartphone, 
  Laptop, 
  Monitor, 
  Server, 
  Printer, 
  Router, 
  HardDrive, 
  AlertCircle,
  Wifi as WifiIcon,
  WifiOff,
  Activity,
  Power,
  MessageSquare,
  X,
  Send,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyCqsdGmlJfpYAzpu8uph1VAjI51XbB5iV0";
const genAI = new GoogleGenerativeAI(API_KEY);

interface NetworkDevice {
  id: string;
  name: string;
  type: 'smartphone' | 'laptop' | 'desktop' | 'printer' | 'router' | 'server' | 'unknown';
  ipAddress: string;
  lastSeen: Date;
  status: 'online' | 'offline' | 'idle';
  signalStrength?: number;
  manufacturer?: string;
  responseTime?: number;
  isLocked?: boolean;
  isControlEnabled?: boolean;
}

interface NetworkStats {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  packetLoss: number;
  signalStrength: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const NetworkScanner = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    latency: 0,
    packetLoss: 0,
    signalStrength: 0
  });
  const [localIp, setLocalIp] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  const [activeConnections, setActiveConnections] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [showDeviceControl, setShowDeviceControl] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const getLocalIpAddress = async () => {
    try {
      const peerConnection = new RTCPeerConnection({ iceServers: [] });
      peerConnection.createDataChannel('');
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      return new Promise<string>((resolve) => {
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            const ipMatch = event.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
            if (ipMatch) {
              resolve(ipMatch[1]);
              peerConnection.close();
            }
          }
        };
      });
    } catch (error) {
      console.error('Error getting local IP:', error);
      return '192.168.1.100';
    }
  };

  const generateMockDevices = (baseIp: string): NetworkDevice[] => {
    const deviceTypes: NetworkDevice['type'][] = ['smartphone', 'laptop', 'desktop', 'printer', 'router', 'server'];
    const manufacturers = ['Apple', 'Samsung', 'Dell', 'HP', 'Cisco', 'Lenovo'];
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: `device-${i + 1}`,
      name: `Device-${i + 1}`,
      type: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
      ipAddress: baseIp.replace(/\d+$/, `${10 + i}`),
      lastSeen: new Date(),
      status: Math.random() > 0.2 ? 'online' : 'offline',
      signalStrength: Math.floor(Math.random() * 60 + 40),
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      responseTime: Math.floor(Math.random() * 100),
      isLocked: Math.random() > 0.7,
      isControlEnabled: true
    }));
  };

  const simulateNetworkStats = () => {
    setNetworkStats({
      downloadSpeed: Math.random() * 100 + 50,
      uploadSpeed: Math.random() * 50 + 25,
      latency: Math.random() * 50 + 10,
      packetLoss: Math.random() * 2,
      signalStrength: Math.random() * 40 + 60
    });
  };

  const scanNetwork = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setDevices([]);

    try {
      const localIp = await getLocalIpAddress();
      setLocalIp(localIp);
      
      const totalSteps = 10;
      const mockDevices = generateMockDevices(localIp);
      
      for (let i = 0; i < totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setScanProgress(((i + 1) / totalSteps) * 100);
        
        if (i >= 2) {
          const devicesSlice = mockDevices.slice(0, Math.ceil((i + 1) * mockDevices.length / totalSteps));
          setDevices(devicesSlice);
        }
        
        if (i % 3 === 0) {
          simulateNetworkStats();
        }
      }

      // Start periodic updates
      if (scanTimeoutRef.current) {
        clearInterval(scanTimeoutRef.current);
      }
      scanTimeoutRef.current = setInterval(() => {
        simulateNetworkStats();
        setDevices(prev => prev.map(device => ({
          ...device,
          signalStrength: Math.floor(Math.random() * 60 + 40),
          responseTime: Math.floor(Math.random() * 100),
          status: Math.random() > 0.1 ? 'online' : 'offline'
        })));
      }, 5000);

    } catch (error) {
      console.error('Error scanning network:', error);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  const handleDeviceControl = (device: NetworkDevice) => {
    setSelectedDevice(device);
    setShowDeviceControl(true);
    setChatMessages([
      {
        role: 'assistant',
        content: `Conectado ao dispositivo ${device.name} (${device.ipAddress}). Como posso ajudar?`,
        timestamp: new Date()
      }
    ]);
  };

  const processDeviceCommand = async (command: string) => {
    if (!selectedDevice) return;

    setIsProcessingCommand(true);
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: command,
      timestamp: new Date()
    }]);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `
        You are a network device control assistant. Respond to the following command for a ${selectedDevice.type} device:
        
        Device Info:
        - Name: ${selectedDevice.name}
        - Type: ${selectedDevice.type}
        - IP: ${selectedDevice.ipAddress}
        - Status: ${selectedDevice.status}
        - Manufacturer: ${selectedDevice.manufacturer}
        
        Command: ${command}
        
        Respond as if you're executing real network commands. Include:
        1. Command interpretation
        2. Action taken
        3. Result/status
        
        Keep responses technical but understandable.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Simulate device state changes based on commands
      if (command.toLowerCase().includes('lock')) {
        setDevices(prev => prev.map(d => 
          d.id === selectedDevice.id ? { ...d, isLocked: true } : d
        ));
      } else if (command.toLowerCase().includes('unlock')) {
        setDevices(prev => prev.map(d => 
          d.id === selectedDevice.id ? { ...d, isLocked: false } : d
        ));
      } else if (command.toLowerCase().includes('restart') || command.toLowerCase().includes('reboot')) {
        setDevices(prev => prev.map(d => 
          d.id === selectedDevice.id ? { ...d, status: 'offline' } : d
        ));
        setTimeout(() => {
          setDevices(prev => prev.map(d => 
            d.id === selectedDevice.id ? { ...d, status: 'online' } : d
          ));
        }, 3000);
      }

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: response.text(),
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error processing command:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Erro ao processar o comando. Por favor, tente novamente.',
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessingCommand(false);
    }
  };

  const handleSendCommand = () => {
    if (!chatInput.trim()) return;
    processDeviceCommand(chatInput.trim());
    setChatInput('');
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return Smartphone;
      case 'laptop': return Laptop;
      case 'desktop': return Monitor;
      case 'printer': return Printer;
      case 'router': return Router;
      case 'server': return Server;
      default: return HardDrive;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'idle': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearInterval(scanTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="hud-border p-6 scanner">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Wifi className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-primary">Network Scanner</h2>
            <p className="text-sm text-primary/70">Local IP: {localIp}</p>
          </div>
        </div>
        <button
          onClick={() => scanNetwork()}
          disabled={isScanning}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            isScanning
              ? 'bg-primary/50 text-surface-dark cursor-not-allowed'
              : 'bg-primary text-surface-dark hover:bg-primary-dark'
          }`}
        >
          {isScanning ? `Scanning... ${scanProgress.toFixed(1)}%` : 'Scan Network'}
        </button>
      </div>

      {/* Network Stats */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-2 lg:col-span-3 bg-surface/50 border border-primary/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary/70">Network Status</span>
            {networkStats.signalStrength > 70 ? (
              <WifiIcon className="h-5 w-5 text-green-400" />
            ) : networkStats.signalStrength > 30 ? (
              <WifiIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-400" />
            )}
          </div>
          <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${networkStats.signalStrength}%` }}
            />
          </div>
        </div>

        <div className="bg-surface/50 border border-primary/30 rounded-lg p-4">
          <p className="text-primary/70 text-sm">Active Connections</p>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <p className="text-primary text-lg font-medium">{activeConnections}</p>
          </div>
        </div>
      </div>

      {/* Devices Grid */}
      {isScanning ? (
        <div className="flex items-center justify-center h-48">
          <div className="cyber-spinner">
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-primary animate-spin" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.type);
            const statusColor = getStatusColor(device.status);

            return (
              <div
                key={device.id}
                className="bg-surface/50 border border-primary/30 rounded-lg p-4 hover:border-primary transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <DeviceIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary">{device.name}</h3>
                      <p className="text-sm text-primary/70">{device.type}</p>
                    </div>
                  </div>
                  <div className={`flex items-center ${statusColor}`}>
                    <span className="h-2 w-2 rounded-full bg-current mr-2" />
                    <span className="text-sm">{device.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary/70">IP Address</span>
                    <span className="text-primary">{device.ipAddress}</span>
                  </div>
                  {device.manufacturer && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary/70">Manufacturer</span>
                      <span className="text-primary">{device.manufacturer}</span>
                    </div>
                  )}
                  {device.responseTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary/70">Response Time</span>
                      <span className="text-primary">{device.responseTime} ms</span>
                    </div>
                  )}
                  {device.signalStrength && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-primary/70">Signal Strength</span>
                        <span className="text-primary">{device.signalStrength}%</span>
                      </div>
                      <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${device.signalStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-primary/70">Status:</span>
                    {device.isLocked ? (
                      <span className="flex items-center text-red-400">
                        <Lock className="h-4 w-4 mr-1" />
                        Locked
                      </span>
                    ) : (
                      <span className="flex items-center text-green-400">
                        <Unlock className="h-4 w-4 mr-1" />
                        Unlocked
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeviceControl(device)}
                    disabled={!device.isControlEnabled || device.status === 'offline'}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      device.isControlEnabled && device.status !== 'offline'
                        ? 'bg-primary text-surface-dark hover:bg-primary-dark'
                        : 'bg-surface/30 text-primary/50 cursor-not-allowed'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Controlar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {devices.length === 0 && !isScanning && (
        <div className="flex flex-col items-center justify-center h-48 text-primary/70">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>No devices found on the network</p>
          <p className="text-sm">Click "Scan Network" to search for devices</p>
        </div>
      )}

      {/* Device Control Chat Modal */}
      {showDeviceControl && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-dark border border-primary/30 rounded-lg w-full max-w-2xl">
            {/* Chat Header */}
            <div className="p-4 border-b border-primary/30 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {React.createElement(getDeviceIcon(selectedDevice.type), {
                    className: "h-5 w-5 text-primary"
                  })}
                </div>
                <div>
                  <h3 className="font-medium text-primary">{selectedDevice.name}</h3>
                  <p className="text-sm text-primary/70">{selectedDevice.ipAddress}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeviceControl(false)}
                className="text-primary hover:text-primary-dark transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent"
            >
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary/20 text-white'
                        : 'bg-surface/50 text-primary border border-primary/30'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isProcessingCommand && (
                <div className="flex justify-start">
                  <div className="bg-surface/50 p-3 rounded-lg border border-primary/30">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-primary/30">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
                  placeholder="Digite um comando para o dispositivo..."
                  className="flex-1 bg-surface/50 border border-primary/30 rounded-lg px-4 py-2 text-white placeholder-primary/50 focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSendCommand}
                  disabled={!chatInput.trim() || isProcessingCommand}
                  className="bg-primary text-surface-dark p-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-all duration-200"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-primary/50 mt-2">
                Comandos disponíveis: status, lock, unlock, restart, info
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkScanner;