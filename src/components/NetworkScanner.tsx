import React, { useState } from 'react';
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
  WifiOff,
  Activity,
  Power,
  MessageSquare,
  X,
  Send,
  Lock,
  Unlock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Zap,
  Shield,
  Signal,
  Radio,
  Bluetooth,
  Radar,
  Waves,
  Cpu,
  Network,
  Brain
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyAV6k7MxnZWDe_APYW2XO8PV2QfjrcTtqE";
const genAI = new GoogleGenerativeAI(API_KEY);

interface ScannerCard {
  id: string;
  title: string;
  description: string;
  icon: React.FC<any>;
  color: string;
  authorized: boolean;
  active: boolean;
  type: 'network' | 'device' | 'security' | 'wireless';
}

const NetworkScanner = () => {
  const [scannerCards, setScannerCards] = useState<ScannerCard[]>([
    {
      id: 'wifi-analyzer',
      title: 'WiFi Analyzer',
      description: 'Analisa redes WiFi próximas, força de sinal e canais',
      icon: Wifi,
      color: 'cyan',
      authorized: false,
      active: false,
      type: 'wireless'
    },
    {
      id: 'bluetooth-scanner',
      title: 'Bluetooth Scanner',
      description: 'Detecta dispositivos Bluetooth e analisa conexões',
      icon: Bluetooth,
      color: 'blue',
      authorized: false,
      active: false,
      type: 'wireless'
    },
    {
      id: 'device-discovery',
      title: 'Device Discovery',
      description: 'Identifica dispositivos conectados à rede',
      icon: Radar,
      color: 'purple',
      authorized: false,
      active: false,
      type: 'device'
    },
    {
      id: 'port-scanner',
      title: 'Port Scanner',
      description: 'Analisa portas abertas e serviços em execução',
      icon: Radio,
      color: 'red',
      authorized: false,
      active: false,
      type: 'network'
    },
    {
      id: 'traffic-analyzer',
      title: 'Traffic Analyzer',
      description: 'Monitora e analisa o tráfego de rede',
      icon: Activity,
      color: 'green',
      authorized: false,
      active: false,
      type: 'network'
    },
    {
      id: 'security-audit',
      title: 'Security Audit',
      description: 'Verifica vulnerabilidades e riscos de segurança',
      icon: Shield,
      color: 'yellow',
      authorized: false,
      active: false,
      type: 'security'
    },
    {
      id: 'signal-mapper',
      title: 'Signal Mapper',
      description: 'Mapeia a cobertura de sinal wireless',
      icon: Signal,
      color: 'orange',
      authorized: false,
      active: false,
      type: 'wireless'
    },
    {
      id: 'packet-analyzer',
      title: 'Packet Analyzer',
      description: 'Analisa pacotes de dados em tempo real',
      icon: Waves,
      color: 'pink',
      authorized: false,
      active: false,
      type: 'network'
    },
    {
      id: 'device-profiler',
      title: 'Device Profiler',
      description: 'Cria perfis detalhados dos dispositivos',
      icon: Cpu,
      color: 'indigo',
      authorized: false,
      active: false,
      type: 'device'
    },
    {
      id: 'network-mapper',
      title: 'Network Mapper',
      description: 'Mapeia a topologia da rede',
      icon: Network,
      color: 'emerald',
      authorized: false,
      active: false,
      type: 'network'
    }
  ]);

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [showAIReport, setShowAIReport] = useState(false);
  const [aiReport, setAIReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const toggleCardExpand = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const toggleAuthorization = (cardId: string) => {
    setScannerCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, authorized: !card.authorized } : card
    ));
  };

  const toggleScanner = async (cardId: string) => {
    setScannerCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, active: !card.active } : card
    ));

    const card = scannerCards.find(c => c.id === cardId);
    if (card && !card.active) {
      await generateAIReport(card);
    }
  };

  const generateAIReport = async (card: ScannerCard) => {
    setIsGeneratingReport(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `
        Analyze network scanning data for ${card.title}:
        
        Scanner Type: ${card.type}
        Status: Active
        Time: ${new Date().toLocaleTimeString()}
        
        Generate a detailed technical report including:
        1. Current network status
        2. Potential security risks
        3. Performance metrics
        4. Recommendations
        
        Format the response in a clear, technical style suitable for network administrators.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAIReport(response.text());
      setShowAIReport(true);
    } catch (error) {
      console.error('Error generating AI report:', error);
      setAIReport('Error generating report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getStatusColor = (card: ScannerCard) => {
    if (!card.authorized) return 'text-gray-400';
    if (card.active) return 'text-green-400';
    return 'text-yellow-400';
  };

  const getStatusText = (card: ScannerCard) => {
    if (!card.authorized) return 'Não Autorizado';
    if (card.active) return 'Ativo';
    return 'Pronto';
  };

  return (
    <div className="min-h-screen bg-surface-dark py-16 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hex-grid opacity-30" />
      <div className="absolute inset-0 data-lines" />
      <div className="absolute inset-0 bg-grid-pattern" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-12 relative">
          <div className="absolute -left-4 -top-4 w-20 h-20 border-l-2 border-t-2 border-primary opacity-50" />
          <div className="absolute -right-4 -top-4 w-20 h-20 border-r-2 border-t-2 border-primary opacity-50" />
          <h1 className="text-4xl font-bold text-center text-primary text-glow mb-2">Network Scanner</h1>
          <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent box-glow" />
        </div>

        {/* Scanner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scannerCards.map(card => (
            <div 
              key={card.id}
              className="hud-border rounded-lg overflow-hidden scanner group transform hover:scale-105 transition-all duration-300"
            >
              <div className="p-6">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-primary text-glow">
                    {card.title}
                  </h3>
                  <div className={`flex items-center ${getStatusColor(card)}`}>
                    <span className="h-2 w-2 rounded-full bg-current mr-2" />
                    <span className="text-sm">{getStatusText(card)}</span>
                  </div>
                </div>

                {/* Card Icon */}
                <div className="flex justify-center mb-4">
                  <div className={`p-4 bg-surface/30 rounded-full border border-${card.color}-500/30 group-hover:border-${card.color}-500 transition-all duration-300`}>
                    <card.icon className={`h-8 w-8 text-${card.color}-400 group-hover:scale-110 transition-transform`} />
                  </div>
                </div>

                {/* Card Description */}
                <p className="text-primary/80 mb-6">{card.description}</p>

                {/* Authorization Button */}
                {!card.authorized ? (
                  <button
                    onClick={() => toggleAuthorization(card.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-surface/50 text-primary p-3 rounded-lg hover:bg-primary hover:text-surface-dark transition-all duration-300 border border-primary/30 group"
                  >
                    <Lock className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>Autorizar Scanner</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => toggleScanner(card.id)}
                      className={`w-full flex items-center justify-center space-x-2 ${
                        card.active
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-primary text-surface-dark hover:bg-primary-dark'
                      } p-3 rounded-lg transition-all duration-300`}
                    >
                      <Power className="h-5 w-5" />
                      <span>{card.active ? 'Parar Scanner' : 'Iniciar Scanner'}</span>
                    </button>

                    <button
                      onClick={() => toggleAuthorization(card.id)}
                      className="w-full flex items-center justify-center space-x-2 bg-surface/50 text-primary/70 p-2 rounded-lg hover:bg-surface/70 transition-all duration-300 border border-primary/30 text-sm"
                    >
                      <Unlock className="h-4 w-4" />
                      <span>Revogar Autorização</span>
                    </button>
                  </div>
                )}

                {/* Active Scanner Content */}
                {card.active && (
                  <div className="mt-4 pt-4 border-t border-primary/30">
                    <div className="flex items-center justify-center">
                      <div className="cyber-spinner">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-primary/70 mt-2">Scanner em execução...</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Report Modal */}
        {showAIReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-dark border border-primary/30 rounded-lg w-full max-w-2xl">
              <div className="p-4 border-b border-primary/30 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">AI Analysis Report</h3>
                </div>
                <button
                  onClick={() => setShowAIReport(false)}
                  className="text-primary hover:text-primary-dark transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {isGeneratingReport ? (
                  <div className="flex items-center justify-center">
                    <div className="cyber-spinner">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert">
                    <pre className="whitespace-pre-wrap text-primary/80">{aiReport}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkScanner;
