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
  const [isRecording, setIsRecording] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
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
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        
        setInput(transcript);

        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        silenceTimeoutRef.current = setTimeout(() => {
          if (transcript.trim()) {
            handleSend(transcript.trim());
          }
        }, 1500);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        let errorMessage = 'Erro no reconhecimento de voz.';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Nenhuma fala detectada. Por favor, fale mais alto.';
            break;
          case 'audio-capture':
            errorMessage = 'Microfone não encontrado.';
            break;
          case 'not-allowed':
            errorMessage = 'Permissão do microfone negada.';
            break;
          case 'network':
            errorMessage = 'Erro de conexão.';
            break;
        }
        setInput(errorMessage);
      };

      recognition.onend = () => {
        if (isRecording) {
          recognition.start();
        }
      };

      recognition.start();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

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

    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
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

      const result = await chat.sendMessage(messageText);
      const response = await result.response;
      const responseText = response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      speakMessage(responseText);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua mensagem.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-black border border-cyan-500/30 rounded-lg w-full max-w-2xl h-[90vh] sm:h-[600px] flex flex-col">
        <div className="p-3 sm:p-4 border-b border-cyan-500/30 flex justify-between items-center rounded-t-lg">
          <h3 className="text-lg sm:text-xl font-semibold text-cyan-400 truncate">
            Análise Neural - {repository.name}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={isSpeaking ? stopSpeaking : () => {
                const lastAssistantMessage = messages.findLast(m => m.role === 'assistant');
                if (lastAssistantMessage) speakMessage(lastAssistantMessage.content);
              }}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                isSpeaking ? 'bg-red-500 text-white' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
              }`}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
            <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300 transition-colors">
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-black/30"
        >
          <div className="bg-cyan-950/30 p-3 sm:p-4 rounded-lg border border-cyan-500/30">
            <p className="font-semibold text-cyan-400 text-sm sm:text-base">Análise Neural:</p>
            <p className="text-gray-300 text-sm sm:text-base">{repository.description}</p>
            <p className="mt-2 text-gray-300 text-sm sm:text-base">Áreas: {repository.topics.join(', ')}</p>
          </div>

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${
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
              <div className="bg-cyan-950/30 p-2.5 sm:p-3 rounded-lg border border-cyan-500/30">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-cyan-500/30">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (isRecording) {
                  if (recognitionRef.current) {
                    recognitionRef.current.stop();
                  }
                  setIsRecording(false);
                } else {
                  if (recognitionRef.current) {
                    recognitionRef.current.start();
                  }
                  setIsRecording(true);
                }
              }}
              className={`p-2 rounded-full transition-colors ${
                isRecording ? 'bg-red-500 text-white' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
              }`}
            >
              {isRecording ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Compartilhe seus pensamentos..."
              className="flex-1 bg-black/50 border border-cyan-500/30 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-cyan-100 placeholder-cyan-600 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || input === 'Ouvindo... Fale agora'}
              className="bg-cyan-500 text-black p-2 rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-all duration-200"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;