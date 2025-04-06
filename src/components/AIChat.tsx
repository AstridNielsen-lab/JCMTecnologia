import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Mic, MicOff, Send, X, Volume2, VolumeX } from 'lucide-react';

interface AIChatProps {
  repository: {
    name: string;
    description: string;
    topics: string[];
  };
  onClose: () => void;
}

const API_KEY = "AIzaSyAuFi5KtPsMJI5IC8c5FjvYD5IbuBdwH_U";
const genAI = new GoogleGenerativeAI(API_KEY);

const AIChat: React.FC<AIChatProps> = ({ repository, onClose }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const systemPrompt = `
    Você é um assistente especializado em análise neural com foco em psicologia, psicanálise e filosofia.
    
    Contexto:
    - Use conceitos de psicologia e psicanálise para analisar as falas do usuário
    - Faça conexões com teorias filosóficas relevantes
    - Mantenha um tom profissional mas acolhedor
    - Cite pensadores e teorias quando relevante
    - Evite diagnósticos, foque em reflexões e insights
    
    Referências principais:
    - Freud: Inconsciente, mecanismos de defesa, interpretação dos sonhos
    - Jung: Arquétipos, inconsciente coletivo, individuação
    - Lacan: Linguagem, simbólico, real e imaginário
    - Nietzsche: Vontade de potência, eterno retorno
    - Foucault: Relações de poder, subjetividade
    - Sartre: Liberdade, responsabilidade, má-fé
    
    IMPORTANTE: Use apenas pontos e virgulas para pontuacao. Evite caracteres especiais.
    Mantenha as respostas com uma leitura natural e fluida.
  `;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setInput('Processando sua fala...');
        
        // In a real implementation, we would send the audio to a speech-to-text service
        // For now, we'll simulate the transcription
        setTimeout(() => {
          setInput('Como você se sente em relação a isso?');
          handleSend();
        }, 1500);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [systemPrompt],
          },
        ],
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
      speakMessage(text);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua mensagem.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-cyan-500/30 rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        <div className="p-4 border-b border-cyan-500/30 flex justify-between items-center rounded-t-lg">
          <h3 className="text-xl font-semibold text-cyan-400">Análise Neural - {repository.name}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={isSpeaking ? stopSpeaking : () => {
                const lastAssistantMessage = messages.findLast(m => m.role === 'assistant');
                if (lastAssistantMessage) speakMessage(lastAssistantMessage.content);
              }}
              className={`p-2 rounded-full transition-colors ${
                isSpeaking ? 'bg-red-500 text-white' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
              }`}
            >
              {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-black/30"
        >
          <div className="bg-cyan-950/30 p-4 rounded-lg border border-cyan-500/30">
            <p className="font-semibold text-cyan-400">Análise Neural:</p>
            <p className="text-gray-300">{repository.description}</p>
            <p className="mt-2 text-gray-300">Áreas: {repository.topics.join(', ')}</p>
          </div>

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-purple-950/30 border border-purple-500/30 text-purple-100'
                    : 'bg-cyan-950/30 border border-cyan-500/30 text-cyan-100'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-cyan-950/30 p-3 rounded-lg border border-cyan-500/30">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-cyan-500/30">
          <div className="flex space-x-2">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-full transition-colors ${
                isRecording ? 'bg-red-500 text-white' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Compartilhe seus pensamentos..."
              className="flex-1 bg-black/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-100 placeholder-cyan-600 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-cyan-500 text-black p-2 rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;