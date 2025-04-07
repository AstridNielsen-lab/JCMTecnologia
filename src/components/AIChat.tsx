import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Mic, MicOff, Send, X, Volume2, VolumeX, DollarSign, Brain, Clock } from 'lucide-react';

interface AIChatProps {
  repository: {
    name: string;
    description: string;
    topics: string[];
  };
  onClose: () => void;
  mode?: 'neural' | 'product';
}

const API_KEY = "AIzaSyCqsdGmlJfpYAzpu8uph1VAjI51XbB5iV0";
const genAI = new GoogleGenerativeAI(API_KEY);

// More conservative rate limiting configuration
const RATE_LIMIT_DELAY = 5000; // 5 second delay between requests
const MAX_REQUESTS_PER_MINUTE = 1; // Maximum 1 request per minute
const REQUEST_WINDOW = 60000; // 1 minute in milliseconds
const MAX_RETRIES = 3; // Maximum number of retries for rate-limited requests
const INITIAL_RETRY_DELAY = 10000; // Initial retry delay of 10 seconds

const AIChat: React.FC<AIChatProps> = ({ repository, onClose, mode = 'product' }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, queued?: boolean }>>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(mode === 'neural');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [estimatedBudget, setEstimatedBudget] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number>(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestTimestampsRef = useRef<number[]>([]);
  const retryQueueRef = useRef<Array<{
    messageText: string,
    operation: () => Promise<void>,
    retryCount: number
  }>>([]);
  const processingQueueRef = useRef<boolean>(false);

  const getNeuralPrompt = () => `
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

  const getProductPrompt = () => `
    Você é um consultor especializado em tecnologia e desenvolvimento de software.
    
    Contexto do Projeto:
    Nome: ${repository.name}
    Descrição: ${repository.description}
    Tecnologias: ${repository.topics.join(', ')}
    
    Seu papel:
    - Fornecer informações detalhadas sobre o projeto
    - Estimar orçamentos baseados nas tecnologias e complexidade
    - Sugerir prazos de desenvolvimento
    - Explicar benefícios e funcionalidades
    - Responder dúvidas técnicas e de negócio
    
    Ao estimar orçamentos:
    - Considere a complexidade das tecnologias envolvidas
    - Inclua custos de desenvolvimento, testes e implantação
    - Forneça estimativas em ranges (mínimo - máximo)
    - Explique os fatores que influenciam o custo
    
    Mantenha um tom profissional e consultivo, focando em:
    - Valor agregado ao negócio
    - ROI potencial
    - Vantagens competitivas
    - Escalabilidade e manutenção
  `;

  const checkRateLimit = () => {
    const now = Date.now();
    requestTimestampsRef.current = requestTimestampsRef.current.filter(
      timestamp => now - timestamp < REQUEST_WINDOW
    );
    
    if (requestTimestampsRef.current.length >= MAX_REQUESTS_PER_MINUTE) {
      const oldestRequest = requestTimestampsRef.current[0];
      const timeUntilNextSlot = REQUEST_WINDOW - (now - oldestRequest);
      return timeUntilNextSlot > 0 ? timeUntilNextSlot : 0;
    }
    
    return 0;
  };

  const updateQueuePosition = () => {
    setQueuePosition(retryQueueRef.current.length);
  };

  const processRetryQueue = async () => {
    if (processingQueueRef.current || retryQueueRef.current.length === 0) return;
    
    processingQueueRef.current = true;
    setIsRateLimited(true);
    
    while (retryQueueRef.current.length > 0) {
      updateQueuePosition();
      
      const waitTime = checkRateLimit();
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      const nextRequest = retryQueueRef.current[0];
      if (nextRequest) {
        try {
          await nextRequest.operation();
          retryQueueRef.current.shift(); // Remove successful request from queue
        } catch (error) {
          console.error('Error processing queued request:', error);
          nextRequest.retryCount++;
          
          if (nextRequest.retryCount >= MAX_RETRIES) {
            retryQueueRef.current.shift(); // Remove failed request from queue
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: 'Desculpe, não foi possível processar sua mensagem devido aos limites da API. Por favor, tente novamente mais tarde.' 
            }]);
          } else {
            // Move to end of queue for retry
            retryQueueRef.current.push(retryQueueRef.current.shift()!);
          }
        }
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }
    
    processingQueueRef.current = false;
    setIsRateLimited(false);
    setQueuePosition(0);
  };

  const addToRetryQueue = (messageText: string, operation: () => Promise<void>) => {
    retryQueueRef.current.push({
      messageText,
      operation,
      retryCount: 0
    });
    
    // Add queued indicator to messages
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: messageText,
      queued: true 
    }]);
    
    updateQueuePosition();
    processRetryQueue();
  };

  const executeWithRetry = async (operation: () => Promise<any>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) => {
    try {
      const waitTime = checkRateLimit();
      if (waitTime > 0) {
        if (retries > 0) {
          setIsRateLimited(true);
          await new Promise(resolve => setTimeout(resolve, delay));
          setIsRateLimited(false);
          return executeWithRetry(operation, retries - 1, delay * 2);
        } else {
          return false; // Indicate rate limit failure
        }
      }

      requestTimestampsRef.current.push(Date.now());
      await operation();
      return true; // Indicate success
    } catch (error) {
      if (error.message?.includes('429') && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  useEffect(() => {
    if (mode === 'product') {
      generateInitialEstimate();
    }
  }, [repository]);

  const generateInitialEstimate = async () => {
    const generateEstimate = async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [getProductPrompt() + "\n\nGere uma estimativa de orçamento inicial baseada nas informações do projeto."],
          },
        ],
      });

      const result = await chat.sendMessage("Qual seria uma estimativa inicial de orçamento para este projeto?");
      const response = await result.response;
      const estimateText = response.text();
      setEstimatedBudget(estimateText);
    };

    try {
      const success = await executeWithRetry(generateEstimate);
      if (!success) {
        addToRetryQueue("estimate", generateEstimate);
      }
    } catch (error) {
      console.error('Error generating initial estimate:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, não foi possível gerar uma estimativa inicial no momento. Por favor, tente novamente mais tarde.' 
      }]);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (mode === 'neural') {
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
    }
  }, [mode]);

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
    setIsLoading(true);

    const sendMessage = async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [mode === 'neural' ? getNeuralPrompt() : getProductPrompt()],
          },
        ],
      });

      const result = await chat.sendMessage(messageText);
      const response = await result.response;
      const responseText = response.text();

      // Remove queued status if this was a queued message
      setMessages(prev => prev.map(msg => 
        msg.content === messageText && msg.queued 
          ? { ...msg, queued: false }
          : msg
      ));

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      if (mode === 'neural') {
        speakMessage(responseText);
      }
    };

    try {
      const success = await executeWithRetry(sendMessage);
      if (!success) {
        addToRetryQueue(messageText, sendMessage);
      } else {
        setMessages(prev => [...prev, { role: 'user', content: messageText }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em alguns momentos.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-black border border-cyan-500/30 rounded-lg w-full max-w-2xl h-[90vh] sm:h-[600px] flex flex-col">
        <div className="p-3 sm:p-4 border-b border-cyan-500/30 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center space-x-3">
            {mode === 'neural' ? (
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            ) : (
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
            )}
            <h3 className="text-lg sm:text-xl font-semibold text-cyan-400 truncate">
              {mode === 'neural' ? 'Análise Neural' : 'Consultoria de Projeto'} - {repository.name}
            </h3>
          </div>
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
            <p className="font-semibold text-cyan-400 text-sm sm:text-base">
              {mode === 'neural' ? 'Análise Neural:' : 'Detalhes do Projeto:'}
            </p>
            <p className="text-gray-300 text-sm sm:text-base">{repository.description}</p>
            <p className="mt-2 text-gray-300 text-sm sm:text-base">
              {mode === 'neural' ? 'Áreas:' : 'Tecnologias:'} {repository.topics.join(', ')}
            </p>
            {mode === 'product' && estimatedBudget && (
              <div className="mt-3 p-2 bg-green-900/20 rounded border border-green-500/30">
                <p className="text-green-400 text-sm font-semibold">Estimativa de Orçamento:</p>
                <p className="text-green-300 text-sm">{estimatedBudget}</p>
              </div>
            )}
          </div>

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${
                  message.role === 'user'
                    ? message.queued
                      ? 'bg-yellow-950/30 border border-yellow-500/30 text-yellow-100'
                      : 'bg-purple-950/30 border border-purple-500/30 text-purple-100'
                    : mode === 'neural'
                    ? 'bg-cyan-950/30 border border-cyan-500/30 text-cyan-100'
                    : 'bg-green-950/30 border border-green-500/30 text-green-100'
                }`}
              >
                {message.content}
                {message.queued && (
                  <div className="flex items-center mt-1 text-yellow-400 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Mensagem na fila...
                  </div>
                )}
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

          {isRateLimited && queuePosition > 0 && (
            <div className="flex justify-center">
              <div className="bg-yellow-950/30 p-2 rounded-lg border border-yellow-500/30 text-yellow-400 text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Aguardando limite de requisições... Posição na fila: {queuePosition}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-cyan-500/30">
          <div className="flex space-x-2">
            {mode === 'neural' && (
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
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={mode === 'neural' ? "Compartilhe seus pensamentos..." : "Faça uma pergunta sobre o projeto..."}
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