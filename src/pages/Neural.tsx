import React, { useState, useEffect, useRef } from 'react';
import { Brain, Activity, Mic, MicOff, Send, Volume2, VolumeX, Search, Filter, MessageSquare, Cpu } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const API_KEY = "AIzaSyCqsdGmlJfpYAzpu8uph1VAjI51XbB5iV0";
const genAI = new GoogleGenerativeAI(API_KEY);

// Constants for speech detection
const SPEECH_PAUSE_THRESHOLD = 1500; // 1.5 seconds of silence to trigger send
const MIN_SPEECH_LENGTH = 3; // Minimum number of characters to consider as valid speech

// Sound effects URLs
const HOVER_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
const CLICK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';

const Neural = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize sound effects
    hoverSoundRef.current = new Audio(HOVER_SOUND);
    clickSoundRef.current = new Audio(CLICK_SOUND);
    
    // Preload sounds
    hoverSoundRef.current.load();
    clickSoundRef.current.load();
  }, []);

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

  // Speech recognition setup
  useEffect(() => {
    if (isRecording) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';
        recognitionRef.current = recognition;

        recognition.onstart = () => {
          setIsRecording(true);
          setInput('Ouvindo... Fale agora');
          setCurrentTranscript('');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join(' ');
          
          setCurrentTranscript(transcript);
          setInput(transcript);

          if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
          }
          pauseTimeoutRef.current = setTimeout(handleSpeechPause, SPEECH_PAUSE_THRESHOLD);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          setInput('Erro no reconhecimento de voz. Tente novamente.');
        };

        recognition.onend = () => {
          if (isRecording) {
            recognition.start();
          }
        };

        recognition.start();
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [isRecording]);

  const handleSpeechPause = async () => {
    if (currentTranscript.length >= MIN_SPEECH_LENGTH) {
      await handleSend(currentTranscript);
      setCurrentTranscript('');
    }
  };

  const speakMessage = (text: string) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
    
    const voices = speechSynthesis.getVoices();
    const portugueseVoice = voices.find(voice => voice.lang.includes('pt'));
    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    speechSynthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || messageText === 'Ouvindo... Fale agora') return;

    playClickSound();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setIsProcessing(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `
        Você é um assistente especializado em análise neural com foco em psicologia, psicanálise e filosofia.
        
        Contexto:
        - Use conceitos de psicologia e psicanálise para analisar as falas do usuário
        - Faça conexões com teorias filosóficas relevantes
        - Mantenha um tom profissional mas acolhedor
        - Cite pensadores e teorias quando relevante
        - Evite diagnósticos, foque em reflexões e insights
        
        IMPORTANTE: Use apenas pontos e virgulas para pontuacao. Evite caracteres especiais.
        Mantenha as respostas com uma leitura natural e fluida.

        Mensagem do usuário: ${messageText}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiMessage = response.text();
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
      speakMessage(aiMessage);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.' 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const categories = [
    'Psicologia',
    'Psicanálise',
    'Filosofia',
    'Comportamento',
    'Emoções',
    'Cognição'
  ];

  const analysisCards = [
    {
      title: 'Análise Comportamental',
      description: 'Compreenda padrões de comportamento e suas origens psicológicas',
      icon: Brain
    },
    {
      title: 'Insights Emocionais',
      description: 'Explore a profundidade das emoções e seus significados',
      icon: Activity
    },
    {
      title: 'Padrões Cognitivos',
      description: 'Identifique e analise padrões de pensamento',
      icon: Cpu
    }
  ];

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
          <h1 className="text-4xl font-bold text-center text-primary text-glow mb-2">Interface Neural</h1>
          <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent box-glow" />
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12 hud-border rounded-lg p-6 scanner">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar análises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface/50 border border-primary/30 rounded-lg focus:outline-none focus:border-primary text-primary placeholder-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-primary h-5 w-5" />
              <span className="text-primary font-medium">Filtrar por:</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(prev =>
                    prev.includes(category)
                      ? prev.filter(c => c !== category)
                      : [...prev, category]
                  );
                }}
                onMouseEnter={playHoverSound}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedCategory.includes(category)
                    ? 'bg-primary text-surface-dark box-glow'
                    : 'bg-surface/50 text-primary border border-primary/30 hover:border-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {analysisCards.map((card, index) => (
            <div
              key={index}
              className="hud-border rounded-lg overflow-hidden scanner group cursor-pointer"
              onClick={() => playClickSound()}
              onMouseEnter={playHoverSound}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-primary text-glow">
                    {card.title}
                  </h3>
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-primary/80 mb-4">{card.description}</p>
                <div className="h-1 w-full bg-primary/20 rounded">
                  <div className="h-full w-2/3 bg-primary rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Interface */}
        <div className="hud-border rounded-lg p-6 scanner">
          <div
            ref={chatContainerRef}
            className="mb-6 space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-surface/30"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary/20 border border-primary/30'
                    : 'bg-surface/50 border border-primary/30'
                }`}>
                  <p className="text-white">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-surface/50 p-4 rounded-lg border border-primary/30">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                playClickSound();
                setIsRecording(!isRecording);
              }}
              onMouseEnter={playHoverSound}
              className={`p-3 rounded-lg transition-colors ${
                isRecording ? 'bg-red-500 text-white' : 'bg-primary/20 text-primary hover:bg-primary/30'
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem ou use o microfone..."
              className="flex-1 bg-surface/50 border border-primary/30 rounded-lg px-4 py-2 text-white placeholder-primary/50 focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => handleSend()}
              onMouseEnter={playHoverSound}
              disabled={!input.trim() || input === 'Ouvindo... Fale agora'}
              className="bg-primary text-surface-dark p-3 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                playClickSound();
                isSpeaking ? stopSpeaking() : (() => {
                  const lastAssistantMessage = messages.findLast(m => m.role === 'assistant');
                  if (lastAssistantMessage) speakMessage(lastAssistantMessage.content);
                })();
              }}
              onMouseEnter={playHoverSound}
              className={`p-3 rounded-lg transition-colors ${
                isSpeaking ? 'bg-red-500 text-white' : 'bg-primary/20 text-primary hover:bg-primary/30'
              }`}
            >
              {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Neural;