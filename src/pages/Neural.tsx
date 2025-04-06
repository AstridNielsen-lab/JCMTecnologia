import React, { useState, useEffect, useRef } from 'react';
import { Brain, Activity, Wand2, Mic, MicOff } from 'lucide-react';
import AIChat from '../components/AIChat';

interface LogEntry {
  type: 'user' | 'ai' | 'system';
  message: string;
  timestamp: number;
}

const Neural = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const neuralCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();
  const neuralAnimationFrameRef = useRef<number>();

  // Voice animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawVoiceWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;

      const bars = 30;
      const barWidth = canvas.width / bars;
      
      for (let i = 0; i < bars; i++) {
        const height = isProcessing || isRecording ? 
          Math.random() * canvas.height * 0.8 : 
          canvas.height * 0.1;
        
        ctx.fillStyle = `rgba(0, 255, 204, ${isProcessing || isRecording ? 0.8 : 0.3})`;
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
      ctx.strokeStyle = '#00ff00';
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setTranscribedText('Processando sua fala...');
        setShowAIChat(true);
        
        // In a real implementation, we would send the audio to a speech-to-text service
        // For now, we'll simulate the transcription
        setTimeout(() => {
          setTranscribedText('Análise neural iniciada com base em sua fala.');
          setLogs(prev => [...prev, {
            type: 'user',
            message: 'Análise neural iniciada através de comando de voz.',
            timestamp: Date.now()
          }]);
        }, 1500);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setLogs(prev => [...prev, {
        type: 'system',
        message: 'Gravação de voz iniciada. Por favor, fale sobre seus pensamentos ou sentimentos.',
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setLogs(prev => [...prev, {
        type: 'system',
        message: 'Erro ao acessar o microfone. Por favor, verifique as permissões.',
        timestamp: Date.now()
      }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const mockRepository = {
    name: "Análise Neural",
    description: "Sistema de análise neural baseado em psicologia, psicanálise e filosofia",
    topics: ["psychology", "philosophy", "neural-analysis"]
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            <h1 className="text-4xl font-bold cyberpunk-gradient">
              Interface Neural
            </h1>
            <p className="text-cyan-400 text-lg">
              Sistema avançado de análise neural com base em psicologia, psicanálise e filosofia.
              Utilize sua voz para compartilhar pensamentos e receber uma análise profunda.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-cyan-400">Análise Psicológica</h3>
                </div>
                <p className="text-gray-400">
                  Análise profunda baseada em conceitos de psicologia e psicanálise, explorando padrões de pensamento e comportamento.
                </p>
              </div>
              
              <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="h-6 w-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-purple-400">Insights Filosóficos</h3>
                </div>
                <p className="text-gray-400">
                  Conexões com conceitos filosóficos relevantes para compreensão mais profunda do ser.
                </p>
              </div>
            </div>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center space-x-2 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
              } text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105`}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5" />
                  <span>Parar Gravação</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  <span>Iniciar Análise Neural</span>
                </>
              )}
            </button>
          </div>

          {/* Neural Interface */}
          <div className="relative">
            <div className="cyber-interface">
              <div className="neural-header flex items-center space-x-4 mb-6">
                <Brain className="h-8 w-8 text-cyan-400 animate-pulse" />
                <div>
                  <h3 className="text-cyan-400 font-semibold">Sistema Neural</h3>
                  <p className="text-sm text-cyan-500">
                    Status: {isRecording ? 'Gravando' : isProcessing ? 'Processando' : 'Pronto'}
                  </p>
                </div>
              </div>

              <div className="chat-logs mb-6">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`log mb-2 p-2 rounded ${
                      log.type === 'ai' 
                        ? 'bg-cyan-950/30' 
                        : log.type === 'system'
                        ? 'bg-purple-950/30'
                        : 'bg-blue-950/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={
                        log.type === 'ai' 
                          ? 'text-cyan-400' 
                          : log.type === 'system'
                          ? 'text-purple-400'
                          : 'text-blue-400'
                      }>
                        {log.type === 'ai' ? 'IA' : log.type === 'system' ? 'Sistema' : 'Você'}:
                      </span>
                      <span className="text-gray-300">{log.message}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="voice-animation mb-4">
                <p className="text-sm text-cyan-500 mb-2">Análise de Voz</p>
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={60}
                  className="w-full bg-black/50 rounded border border-cyan-500/30"
                />
              </div>

              <div className="neural-monitor">
                <p className="text-sm text-cyan-500 mb-2">Monitor Neural</p>
                <canvas
                  ref={neuralCanvasRef}
                  width={280}
                  height={60}
                  className="w-full bg-black/50 rounded border border-cyan-500/30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAIChat && (
        <AIChat 
          repository={mockRepository}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );
};

export default Neural;