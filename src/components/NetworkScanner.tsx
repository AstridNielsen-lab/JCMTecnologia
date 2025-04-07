import React, { useState, useEffect, useCallback } from 'react';
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
  Activity
} from 'lucide-react';
import NetworkSpeed from 'network-speed';
import mdns from 'mdns-js';
import { ping } from 'ping';
import { getArpTable } from 'node-arp';

interface NetworkDevice {
  id: string;
  name: string;
  type: 'smartphone' | 'laptop' | 'desktop' | 'printer' | 'router' | 'server' | 'unknown';
  ipAddress: string;
  macAddress: string;
  lastSeen: Date;
  status: 'online' | 'offline' | 'idle';
  signalStrength?: number;
  manufacturer?: string;
  openPorts?: number[];
  responseTime?: number;
}

interface NetworkStats {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  packetLoss: number;
  signalStrength: number;
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

  // Get local IP address using WebRTC
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
      return '127.0.0.1';
    }
  };

  // Network speed test using the Network Information API and custom measurements
  const measureNetworkSpeed = async () => {
    try {
      const testNetworkSpeed = new NetworkSpeed();
      
      const downloadSpeed = await testNetworkSpeed.checkDownloadSpeed();
      const uploadSpeed = await testNetworkSpeed.checkUploadSpeed();
      
      // Get connection information
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType || 'unknown';
      const downlink = connection?.downlink || 0;
      const rtt = connection?.rtt || 0;

      // Measure packet loss
      const packetLoss = await measurePacketLoss();
      
      // Get WiFi signal strength if available
      const signalStrength = await getWifiSignalStrength();

      setNetworkStats({
        downloadSpeed: downloadSpeed.mbps,
        uploadSpeed: uploadSpeed.mbps,
        latency: rtt,
        packetLoss,
        signalStrength
      });
    } catch (error) {
      console.error('Error measuring network speed:', error);
    }
  };

  // Measure packet loss by sending ping requests
  const measurePacketLoss = async () => {
    try {
      const hosts = ['8.8.8.8', '1.1.1.1'];
      const results = await Promise.all(
        hosts.map(host => ping.promise.probe(host))
      );
      
      const packetLoss = results.reduce((acc, result) => 
        acc + (result.alive ? 0 : 100), 0) / results.length;
      
      return packetLoss;
    } catch (error) {
      console.error('Error measuring packet loss:', error);
      return 0;
    }
  };

  // Get WiFi signal strength
  const getWifiSignalStrength = async () => {
    try {
      if ('wifi' in navigator) {
        const wifi = (navigator as any).wifi;
        const status = await wifi.getStatus();
        return status.signalStrength;
      }
      return 0;
    } catch (error) {
      console.error('Error getting WiFi signal strength:', error);
      return 0;
    }
  };

  // Scan for network devices using various methods
  const scanNetwork = async () => {
    setIsScanning(true);
    setScanProgress(0);
    const discoveredDevices: NetworkDevice[] = [];

    try {
      // Get local network information
      const localIp = await getLocalIpAddress();
      setLocalIp(localIp);
      
      // Start mDNS discovery
      const browser = mdns.createBrowser();
      
      browser.on('ready', () => {
        browser.discover();
      });

      browser.on('update', (data) => {
        if (data.addresses && data.addresses.length > 0) {
          const device: NetworkDevice = {
            id: data.addresses[0],
            name: data.name || 'Unknown Device',
            type: determineDeviceType(data),
            ipAddress: data.addresses[0],
            macAddress: 'Discovering...',
            lastSeen: new Date(),
            status: 'online'
          };
          
          discoveredDevices.push(device);
          setDevices([...discoveredDevices]);
          setScanProgress((discoveredDevices.length / 254) * 100);
        }
      });

      // Scan IP range
      const baseIp = localIp.substring(0, localIp.lastIndexOf('.'));
      const promises = [];

      for (let i = 1; i <= 254; i++) {
        const ip = `${baseIp}.${i}`;
        promises.push(scanIp(ip, discoveredDevices));
      }

      await Promise.all(promises);

      // Get ARP table
      const arpTable = await getArpTable();
      
      // Update devices with MAC addresses and manufacturers
      const updatedDevices = discoveredDevices.map(device => {
        const arpEntry = arpTable.find(entry => entry.ip === device.ipAddress);
        if (arpEntry) {
          device.macAddress = arpEntry.mac;
          device.manufacturer = arpEntry.vendor;
        }
        return device;
      });

      setDevices(updatedDevices);
      browser.stop();
    } catch (error) {
      console.error('Error scanning network:', error);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  // Scan individual IP
  const scanIp = async (ip: string, discoveredDevices: NetworkDevice[]) => {
    try {
      const result = await ping.promise.probe(ip);
      
      if (result.alive) {
        const device: NetworkDevice = {
          id: ip,
          name: `Device at ${ip}`,
          type: 'unknown',
          ipAddress: ip,
          macAddress: 'Discovering...',
          lastSeen: new Date(),
          status: 'online',
          responseTime: result.time
        };
        
        discoveredDevices.push(device);
        setDevices([...discoveredDevices]);
        setScanProgress((discoveredDevices.length / 254) * 100);
      }
    } catch (error) {
      console.error(`Error scanning IP ${ip}:`, error);
    }
  };

  // Determine device type based on mDNS data
  const determineDeviceType = (data: any): NetworkDevice['type'] => {
    const services = data.type?.toLowerCase() || '';
    if (services.includes('printer')) return 'printer';
    if (services.includes('workstation')) return 'desktop';
    if (services.includes('mobile')) return 'smartphone';
    if (services.includes('laptop')) return 'laptop';
    if (services.includes('server')) return 'server';
    if (services.includes('router')) return 'router';
    return 'unknown';
  };

  // Monitor active connections
  const monitorConnections = useCallback(() => {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const activeRequests = entries.filter(
          entry => entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest'
        ).length;
        setActiveConnections(activeRequests);
      });
      
      observer.observe({ entryTypes: ['resource'] });
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Initial setup
    getLocalIpAddress().then(ip => setLocalIp(ip));
    measureNetworkSpeed();
    monitorConnections();

    // Set up periodic measurements
    const speedInterval = setInterval(measureNetworkSpeed, 5000);
    
    return () => {
      clearInterval(speedInterval);
    };
  }, [monitorConnections]);

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
          <p className="text-primary/70 text-sm">Download Speed</p>
          <p className="text-primary text-lg font-medium">
            {networkStats.downloadSpeed.toFixed(2)} Mbps
          </p>
        </div>

        <div className="bg-surface/50 border border-primary/30 rounded-lg p-4">
          <p className="text-primary/70 text-sm">Upload Speed</p>
          <p className="text-primary text-lg font-medium">
            {networkStats.uploadSpeed.toFixed(2)} Mbps
          </p>
        </div>

        <div className="bg-surface/50 border border-primary/30 rounded-lg p-4">
          <p className="text-primary/70 text-sm">Latency</p>
          <p className="text-primary text-lg font-medium">
            {networkStats.latency} ms
          </p>
        </div>

        <div className="bg-surface/50 border border-primary/30 rounded-lg p-4">
          <p className="text-primary/70 text-sm">Packet Loss</p>
          <p className="text-primary text-lg font-medium">
            {networkStats.packetLoss.toFixed(1)}%
          </p>
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
              <Wifi className="h-6 w-6 text-primary animate-pulse" />
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
                  <div className="flex justify-between text-sm">
                    <span className="text-primary/70">MAC Address</span>
                    <span className="text-primary">{device.macAddress}</span>
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
    </div>
  );
};

export default NetworkScanner;