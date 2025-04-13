import React, { useState, useRef, useEffect } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [showAIReport, setShowAIReport] = useState(false);
  const [aiReport, setAIReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (cardId: string) => {
    if (!chatInput.trim()) return;

    const card = scannerCards.find(c => c.id === cardId);
    if (!card) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput
    };

    setChatMessages(prev => ({
      ...prev,
      [cardId]: [...(prev[cardId] || []), userMessage]
    }));
    setChatInput('');

    setIsAnalyzing(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `
        You are a specialized network analysis AI assistant for ${card.title}.
        Context: ${card.description}
        Type: ${card.type}
        User Question: ${chatInput}

        Provide a technical analysis and response focusing on:
        - Network security implications
        - Performance considerations
        - Best practices
        - Potential risks and mitigations

        Keep the response technical but clear.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.text()
      };

      setChatMessages(prev => ({
        ...prev,
        [cardId]: [...(prev[cardId] || []), aiMessage]
      }));
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
      };
      setChatMessages(prev => ({
        ...prev,
        [cardId]: [...(prev[cardId] || []), errorMessage]
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      <div className="absolute inset-0 hex-grid opacity-30" />
      <div className="absolute inset-0 data-lines" />
      <div className="absolute inset-0 bg-grid-pattern" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mb-12 relative">
          <div className="absolute -left-4 -top-4 w-20 h-20 border-l-2 border-t-2 border-primary opacity-50" />
          <div className="absolute -right-4 -top-4 w-20 h-20 border-r-2 border-t-2 border-primary opacity-50" />
          <h1 className="text-4xl font-bold text-center text-primary text-glow mb-2">Network Scanner</h1>
          <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent box-glow" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scannerCards.map(card => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hud-border rounded-lg overflow-hidden scanner group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-primary text-glow">
                    {card.title}
                  </h3>
                  <div className={`flex items-center ${getStatusColor(card)}`}>
                    <motion.span
                      animate={{
                        scale: card.active ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="h-2 w-2 rounded-full bg-current mr-2"
                    />
                    <span className="text-sm">{getStatusText(card)}</span>
                  </div>
                </div>

                <motion.div
                  className="flex justify-center mb-4"
                  animate={{
                    rotateY: card.active ? 360 : 0
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className={`p-4 bg-surface/30 rounded-full border border-${card.color}-500/30 group-hover:border-${card.color}-500 transition-all duration-300`}>
                    <card.icon className={`h-8 w-8 text-${card.color}-400 group-hover:scale-110 transition-transform`} />
                  </div>
                </motion.div>

                <p className="text-primary/80 mb-6">{card.description}</p>

                <button
                  onClick={() => setActiveChatId(activeChatId === card.id ? null : card.id)}
                  className="w-full flex items-center justify-center space-x-2 bg-surface/50 text-primary p-2 rounded-lg hover:bg-surface/70 transition-all duration-300 border border-primary/30 mb-4"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>AI Chat Assistant</span>
                </button>

                <AnimatePresence>
                  {activeChatId === card.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-primary/30 pt-4"
                    >
                      <div
                        ref={chatContainerRef}
                        className="h-48 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent"
                      >
                        {(chatMessages[card.id] || []).map((message, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-primary/20 text-white'
                                  : 'bg-surface/50 text-primary border border-primary/30'
                              }`}
                            >
                              {message.content}
                            </div>
                          </motion.div>
                        ))}
                        {isAnalyzing && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                          >
                            <div className="bg-surface/50 p-3 rounded-lg border border-primary/30">
                              <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(card.id)}
                          placeholder="Ask about network analysis..."
                          className="flex-1 bg-surface/50 border border-primary/30 rounded-lg px-3 py-2 text-white placeholder-primary/50 focus:outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => handleSendMessage(card.id)}
                          disabled={!chatInput.trim() || isAnalyzing}
                          className="bg-primary text-surface-dark p-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-all duration-200"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!card.authorized ? (
                  <button
                    onClick={() => toggleAuthorization(card.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-surface/50 text-primary p-3 rounded-lg hover:bg-primary hover:text-surface-dark transition-all duration-300 border border-primary/30 group mt-4"
                  >
                    <Lock className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>Autorizar Scanner</span>
                  </button>
                ) : (
                  <div className="space-y-4 mt-4">
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

                {card.active && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 pt-4 border-t border-primary/30"
                  >
                    <div className="flex items-center justify-center">
                      <div className="cyber-spinner">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-primary/70 mt-2">Scanner em execução...</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkScanner;
