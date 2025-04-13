import React, { useState, useEffect, useRef } from 'react';
import { Brain, Activity, Mic, MicOff, Volume2, VolumeX, Shield, Cpu, Heart, Lightbulb, Zap, Puzzle, Eye, Network, MessageSquare } from 'lucide-react';
import AIChat from '../components/AIChat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Permissions {
  microphone: boolean;
  speechSynthesis: boolean;
}

const Neural = () => {
  const [showBehavioralChat, setShowBehavioralChat] = useState(false);
  const [showEmotionalChat, setShowEmotionalChat] = useState(false);
  const [showCognitiveChat, setShowCognitiveChat] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [permissions, setPermissions] = useState<Permissions>({
    microphone: false,
    speechSynthesis: false
  });

  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  // Sound effects URLs
  const HOVER_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
  const CLICK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';

  useEffect(() => {
    // Check if permissions have been granted before
    const hasGrantedPermissions = localStorage.getItem('neuralPermissionsGranted');
    if (!hasGrantedPermissions) {
      setShowPermissionsDialog(true);
    } else {
      checkPermissions();
    }

    // Initialize sound effects
    hoverSoundRef.current = new Audio(HOVER_SOUND);
    clickSoundRef.current = new Audio(CLICK_SOUND);
    
    // Preload sounds
    hoverSoundRef.current.load();
    clickSoundRef.current.load();
  }, []);

  const checkPermissions = async () => {
    try {
      // Check microphone permission
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, microphone: true }));
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissions(prev => ({ ...prev, microphone: false }));
    }

    // Check speech synthesis
    if ('speechSynthesis' in window) {
      setPermissions(prev => ({ ...prev, speechSynthesis: true }));
    }
  };

  const handleRequestPermissions = async () => {
    try {
      // Request microphone permission
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, microphone: true }));

      // Speech synthesis doesn't need explicit permission
      if ('speechSynthesis' in window) {
        setPermissions(prev => ({ ...prev, speechSynthesis: true }));
      }

      localStorage.setItem('neuralPermissionsGranted', 'true');
      setShowPermissionsDialog(false);
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const playHoverSound = () => {
    if (hoverSoundRef.current) {
      hoverSoundRef.current.currentTime = 0;
      hoverSoundRef.current.play();
    }
  };

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play();
    }
  };

  const analysisCards = [
    {
      title: 'Análise Comportamental',
      description: 'Compreenda padrões de comportamento e suas origens psicológicas',
      icon: Brain,
      color: 'purple',
      onClick: () => setShowBehavioralChat(true)
    },
    {
      title: 'Insights Emocionais',
      description: 'Explore a profundidade das emoções e seus significados',
      icon: Heart,
      color: 'red',
      onClick: () => setShowEmotionalChat(true)
    },
    {
      title: 'Padrões Cognitivos',
      description: 'Identifique e analise padrões de pensamento',
      icon: Cpu,
      color: 'blue',
      onClick: () => setShowCognitiveChat(true)
    },
    {
      title: 'Análise Criativa',
      description: 'Explore potenciais criativos e processos imaginativos',
      icon: Lightbulb,
      color: 'yellow',
      onClick: () => setShowCognitiveChat(true)
    },
    {
      title: 'Energia Mental',
      description: 'Avalie níveis de energia e estados mentais',
      icon: Zap,
      color: 'orange',
      onClick: () => setShowCognitiveChat(true)
    },
    {
      title: 'Resolução de Problemas',
      description: 'Analise abordagens para solução de desafios',
      icon: Puzzle,
      color: 'green',
      onClick: () => setShowCognitiveChat(true)
    },
    {
      title: 'Percepção Visual',
      description: 'Explore padrões de percepção e processamento visual',
      icon: Eye,
      color: 'teal',
      onClick: () => setShowCognitiveChat(true)
    },
    {
      title: 'Conexões Neurais',
      description: 'Mapeie conexões e redes de pensamento',
      icon: Network,
      color: 'cyan',
      onClick: () => setShowCognitiveChat(true)
    },
    {
      title: 'Comunicação Neural',
      description: 'Analise padrões de comunicação e expressão',
      icon: MessageSquare,
      color: 'indigo',
      onClick: () => setShowCognitiveChat(true)
    }
  ];

  return (
    <div className="min-h-screen bg-surface-dark py-16 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hex-grid opacity-30" />
      <div className="absolute inset-0 data-lines" />
      <div className="absolute inset-0 bg-grid-pattern" />

      {/* Permissions Dialog */}
      {showPermissionsDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-dark border border-primary/30 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-primary">Permissões Necessárias</h3>
            </div>
            
            <p className="text-primary/80 mb-6">
              Para uma melhor experiência, precisamos das seguintes permissões:
            </p>

            <ul className="space-y-4 mb-6">
              <li className="flex items-center space-x-3">
                <Mic className="h-5 w-5 text-primary" />
                <span className="text-primary">Acesso ao microfone para entrada de voz</span>
              </li>
              <li className="flex items-center space-x-3">
                <Volume2 className="h-5 w-5 text-primary" />
                <span className="text-primary">Síntese de voz para respostas faladas</span>
              </li>
            </ul>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPermissionsDialog(false)}
                className="px-4 py-2 text-primary border border-primary/30 rounded-lg hover:bg-primary/10"
              >
                Depois
              </button>
              <button
                onClick={handleRequestPermissions}
                className="px-4 py-2 bg-primary text-surface-dark rounded-lg hover:bg-primary-dark"
              >
                Permitir Acesso
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-12 relative">
          <div className="absolute -left-4 -top-4 w-20 h-20 border-l-2 border-t-2 border-primary opacity-50" />
          <div className="absolute -right-4 -top-4 w-20 h-20 border-r-2 border-t-2 border-primary opacity-50" />
          <h1 className="text-4xl font-bold text-center text-primary text-glow mb-2">Interface Neural</h1>
          <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent box-glow" />
        </div>

        {/* Analysis Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {analysisCards.map((card, index) => (
            <div
              key={index}
              className="hud-border rounded-lg overflow-hidden scanner group cursor-pointer transform hover:scale-105 transition-all duration-300"
              onClick={() => {
                playClickSound();
                card.onClick();
              }}
              onMouseEnter={playHoverSound}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-primary text-glow">
                    {card.title}
                  </h3>
                  <card.icon className={`h-6 w-6 text-${card.color}-400`} />
                </div>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-surface/30 rounded-full border border-primary/30 group-hover:border-primary transition-all duration-300">
                    <card.icon className={`h-8 w-8 text-${card.color}-400 group-hover:scale-110 transition-transform`} />
                  </div>
                </div>
                <p className="text-primary/80">{card.description}</p>
                <div className="mt-4 h-1 w-full bg-primary/20 rounded">
                  <div className="h-full w-2/3 bg-primary rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Interfaces */}
        {showBehavioralChat && (
          <AIChat
            mode="behavioral"
            title="Análise Comportamental"
            onClose={() => setShowBehavioralChat(false)}
          />
        )}

        {showEmotionalChat && (
          <AIChat
            mode="emotional"
            title="Insights Emocionais"
            onClose={() => setShowEmotionalChat(false)}
          />
        )}

        {showCognitiveChat && (
          <AIChat
            mode="cognitive"
            title="Padrões Cognitivos"
            onClose={() => setShowCognitiveChat(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Neural;
