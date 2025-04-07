import React, { useState, useRef, useEffect } from 'react';
import { Brain, Activity, Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
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

const Neural = () => {
  const [logs, setLogs] = useState<{ type: 'user' | 'ai' | 'system'; message: string; timestamp: number; }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpeechTime, setLastSpeechTime] = useState<number>(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const neuralCanvasRef = useRef<HTMLCanvasElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const animationFrameRef = useRef<number>();
  const neuralAnimationFrameRef = useRef<number>();
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Voice animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawVoiceWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = 'var(--primary)';
      ctx.lineWidth = 2;

      const bars = 30;
      const barWidth = canvas.width / bars;
      
      for (let i = 0; i < bars; i++) {
        const height = isProcessing || isRecording ? 
          Math.random() * canvas.height * 0.8 : 
          canvas.height * 0.1;
        
        ctx.fillStyle = `rgba(255, 23, 68, ${isProcessing || isRecording ? 0.8 : 0.3})`;
        ctx.fillRect(
          i * barWidth, 
          (canvas.height - height) / 2,
          barWidth - 2,
          height
        );
      }

      animationFrameRef.current = requestAnimationFrame(drawVoiceWave);
    };

    drawVoiceWave();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isProcessing, isRecording]);

  // Neural monitor animation
  useEffect(() => {
    const canvas = neuralCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x = 0;
    let y = canvas.height / 2;
    let phase = 0;

    const drawNeuralMonitor = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.strokeStyle = 'var(--primary)';
      ctx.lineWidth = 2;

      const amplitude = 20;
      const frequency = 0.1;
      
      if (x >= canvas.width) {
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      const newY = canvas.height / 2 + 
        Math.sin(phase) * amplitude * 
        (isProcessing || isRecording ? 2 : 1);

      ctx.moveTo(x - 1, y);
      ctx.lineTo(x, newY);
      ctx.stroke();

      x += 2;
      y = newY;
      phase += frequency;

      neuralAnimationFrameRef.current = requestAnimationFrame(drawNeuralMonitor);
    };

    drawNeuralMonitor();

    return () => {
      if (neuralAnimationFrameRef.current) {
        cancelAnimationFrame(neuralAnimationFrameRef.current);
      }
    };
  }, [isProcessing, isRecording]);

  const handleSpeechPause = async () => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    if (currentTranscript.length >= MIN_SPEECH_LENGTH) {
      setInput(currentTranscript);
      await handleSend(currentTranscript);
      setCurrentTranscript('');
    }
  };

  // Speech recognition setup with pause detection
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
          setLastSpeechTime(Date.now());

          // Reset the pause timeout
          if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
          }

          // Set a new pause timeout
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
        pauseTimeoutRef.current = null;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };
  }, [isRecording]);

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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-surface-dark py-6 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="space-y-6 sm:space-y-8">
            <h1 className="text-3xl sm:text-4xl font-bold cyberpunk-gradient">
              Interface Neural
            </h1>
            <p className="text-gray-300 text-base sm:text-lg">
              Sistema avançado de análise neural com base em psicologia, psicanálise e filosofia.
              Utilize sua voz para compartilhar pensamentos e receber uma análise profunda.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-surface/50 border border-primary/30 rounded-lg p-4 sm:p-6 hover:border-primary transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <h3 className="text-lg sm:text-xl font-semibold text-primary">Análise Psicológica</h3>
                </div>
                <p className="text-gray-400 text-sm sm:text-base">
                  Análise profunda baseada em conceitos de psicologia e psicanálise, explorando padrões de pensamento e comportamento.
                </p>
              </div>
              
              <div className="bg-surface/50 border border-primary/30 rounded-lg p-4 sm:p-6 hover:border-primary transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <h3 className="text-lg sm:text-xl font-semibold text-primary">Insights Filosóficos</h3>
                </div>
                <p className="text-gray-400 text-sm sm:text-base">
                  Conexões com conceitos filosóficos relevantes para compreensão mais profunda do ser.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <Brain className="h-5 w-5" />
              <span>{isChatExpanded ? 'Fechar Análise' : 'Iniciar Análise Neural'}</span>
            </button>

            {/* Chat Interface */}
            <div className={`transition-all duration-500 overflow-hidden ${
              isChatExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="cyber-interface mt-6">
                <div 
                  ref={chatContainerRef}
                  className="chat-logs mb-4 space-y-4"
                >
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary/20 border border-primary/30'
                          : 'bg-surface border border-primary/30'
                      }`}>
                        <p className="text-white">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-surface p-3 rounded-lg border border-primary/30">
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
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-2 rounded-full transition-colors ${
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
                    className="flex-1 bg-surface border border-primary/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || input === 'Ouvindo... Fale agora'}
                    className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-all duration-200"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                  <button
                    onClick={isSpeaking ? stopSpeaking : () => {
                      const lastAssistantMessage = messages.findLast(m => m.role === 'assistant');
                      if (lastAssistantMessage) speakMessage(lastAssistantMessage.content);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isSpeaking ? 'bg-red-500 text-white' : 'bg-primary/20 text-primary hover:bg-primary/30'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Neural Interface */}
          <div className="relative mt-6 lg:mt-0">
            <div className="cyber-interface">
              <div className="neural-header flex items-center space-x-4 mb-6">
                <Brain className="h-8 w-8 text-primary animate-pulse" />
                <div>
                  <h3 className="text-lg text-primary font-semibold">Sistema Neural</h3>
                  <p className="text-sm text-gray-400">
                    Status: {isRecording ? 'Gravando' : isProcessing ? 'Processando' : 'Pronto'}
                  </p>
                </div>
              </div>

              <div className="voice-animation mb-6">
                <p className="text-sm text-gray-400 mb-2">Análise de Voz</p>
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={60}
                  className="w-full bg-surface rounded border"
                />
              </div>

              <div className="neural-monitor">
                <p className="text-sm text-gray-400 mb-2">Monitor Neural</p>
                <canvas
                  ref={neuralCanvasRef}
                  width={280}
                  height={60}
                  className="w-full bg-surface rounded border"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Neural;