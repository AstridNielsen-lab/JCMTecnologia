import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Mic, MicOff, Send, X, Volume2, VolumeX, DollarSign, Brain, Clock, ChevronDown, ChevronUp, Activity, Cpu } from 'lucide-react';

interface AIChatProps {
  repository?: {
    name: string;
    description: string;
    topics: string[];
  };
  onClose: () => void;
  mode?: 'neural' | 'product' | 'behavioral' | 'emotional' | 'cognitive';
  title?: string;
}

const API_KEY = "AIzaSyAV6k7MxnZWDe_APYW2XO8PV2QfjrcTtqE";
const genAI = new GoogleGenerativeAI(API_KEY);

const AIChat: React.FC<AIChatProps> = ({ repository, onClose, mode = 'product', title }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(mode === 'neural');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isNameExpanded, setIsNameExpanded] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getPromptByMode = () => {
    switch (mode) {
      case 'behavioral':
        return `
          Você é um especialista em análise comportamental com foco em psicologia e neurociência.
          
          Contexto:
          - Analise padrões de comportamento e suas origens psicológicas
          - Utilize teorias comportamentais (Behaviorismo, Cognitivismo, etc.)
          - Faça conexões com neurociência e processos cerebrais
          - Mantenha um tom profissional e científico
          - Evite diagnósticos, foque em compreensão e insights
          
          IMPORTANTE: Use apenas pontos e virgulas para pontuacao. Evite caracteres especiais.
          Mantenha as respostas com uma leitura natural e fluida.
        `;
      case 'emotional':
        return `
          Você é um especialista em análise emocional com foco em psicologia e inteligência emocional.
          
          Contexto:
          - Explore a profundidade e significado das emoções
          - Utilize conceitos de inteligência emocional
          - Faça conexões com teorias psicológicas sobre emoções
          - Mantenha um tom empático e acolhedor
          - Foque em autoconhecimento e desenvolvimento emocional
          
          IMPORTANTE: Use apenas pontos e virgulas para pontuacao. Evite caracteres especiais.
          Mantenha as respostas com uma leitura natural e fluida.
        `;
      case 'cognitive':
        return `
          Você é um especialista em análise cognitiva com foco em processos mentais e neuropsicologia.
          
          Contexto:
          - Analise padrões de pensamento e processos cognitivos
          - Utilize teorias da psicologia cognitiva
          - Faça conexões com neurociência cognitiva
          - Mantenha um tom analítico e educativo
          - Foque em compreensão e otimização dos processos mentais
          
          IMPORTANTE: Use apenas pontos e virgulas para pontuacao. Evite caracteres especiais.
          Mantenha as respostas com uma leitura natural e fluida.
        `;
      default:
        return repository ? getProductPrompt() : getNeuralPrompt();
    }
  };

  const getNeuralPrompt = () => `
    Voce e um assistente especializado em analise neural com foco em psicologia. psicanalise e filosofia.
    
    Contexto:
    Use conceitos de psicologia e psicanalise para analisar as falas do usuario.
    Faca conexoes com teorias filosoficas relevantes.
    Mantenha um tom profissional mas acolhedor.
    Cite pensadores e teorias quando relevante.
    Evite diagnosticos. foque em reflexoes e insights.
    
    Referencias principais:
    Freud. Inconsciente. mecanismos de defesa. interpretacao dos sonhos.
    Jung. Arquetipos. inconsciente coletivo. individuacao.
    Lacan. Linguagem. simbolico. real e imaginario.
    Nietzsche. Vontade de potencia. eterno retorno.
    Foucault. Relacoes de poder. subjetividade.
    Sartre. Liberdade. responsabilidade. ma fe.
    
    IMPORTANTE: Use apenas pontos e virgulas para pontuacao. Evite caracteres especiais.
    Mantenha as respostas com uma leitura natural e fluida.
  `;

  const getProductPrompt = () => `
    Voce e Julio Campos Machado. um desenvolvedor Full Stack experiente com vasta experiencia em diversas tecnologias.
    
    Contexto do Projeto:
    Nome: ${repository?.name}
    Descricao: ${repository?.description}
    Tecnologias: ${repository?.topics.join('. ')}
    
    Taxa fixa: $1000 USD por mes de desenvolvimento.
    
    Seu papel:
    Fornecer informacoes detalhadas sobre o projeto.
    Estimar orcamentos baseados nas tecnologias e complexidade.
    Sugerir prazos de desenvolvimento realistas.
    Explicar beneficios e funcionalidades.
    Responder duvidas tecnicas e de negocio.
    
    Ao estimar orcamentos:
    Considere a complexidade das tecnologias envolvidas.
    Calcule o custo total multiplicando $1000 pelo numero de meses necessarios.
    Forneca estimativas em meses e valor total em USD.
    Explique os fatores que influenciam o prazo.
    Seja especifico sobre as fases do desenvolvimento.
    
    Mantenha um tom profissional e consultivo. focando em:
    Valor agregado ao negocio.
    ROI potencial.
    Vantagens competitivas.
    Escalabilidade e manutencao.
    
    IMPORTANTE:
    Sempre se apresente como Julio Campos Machado.
    Mantenha um tom amigavel mas profissional.
    Use sua experiencia para justificar as estimativas.
    Seja especifico sobre as tecnologias e processos.
    SEMPRE mencione a taxa mensal de $1000 USD.
    Use apenas pontos e virgulas para pontuacao. Evite caracteres especiais.
    Mantenha as respostas com uma leitura natural e fluida.
  `;

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
          setInput('Erro no reconhecimento de voz. Por favor, tente novamente.');
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
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [getPromptByMode()],
          },
        ],
      });

      const result = await chat.sendMessage(messageText);
      const response = await result.response;
      const responseText = response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      
      if (mode !== 'product') {
        speakMessage(responseText);
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

  const getIcon = () => {
    switch (mode) {
      case 'behavioral':
        return Brain;
      case 'emotional':
        return Activity;
      case 'cognitive':
        return Cpu;
      case 'product':
        return DollarSign;
      default:
        return Brain;
    }
  };

  const Icon = getIcon();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-black border border-cyan-500/30 rounded-lg w-full max-w-2xl h-[90vh] sm:h-[600px] flex flex-col">
        <div className="p-3 sm:p-4 border-b border-cyan-500/30 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-semibold text-primary">
                {title || (repository ? `Consultoria de Projeto - ${repository.name}` : 'Análise Neural')}
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={isSpeaking ? stopSpeaking : () => {
                const lastAssistantMessage = messages.findLast(m => m.role === 'assistant');
                if (lastAssistantMessage) speakMessage(lastAssistantMessage.content);
              }}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                isSpeaking ? 'bg-red-500 text-white' : 'bg-primary/20 text-primary hover:bg-primary/30'
              }`}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
            <button onClick={onClose} className="text-primary hover:text-primary-dark transition-colors">
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-black/30"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary/20 text-white'
                    : 'bg-surface/50 text-primary border border-primary/30'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface/50 p-3 rounded-lg border border-primary/30">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-primary/30">
          <div className="flex space-x-2">
            {mode !== 'product' && (
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
                  isRecording ? 'bg-red-500 text-white' : 'bg-primary/20 text-primary hover:bg-primary/30'
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
              placeholder={mode === 'product' ? "Faça uma pergunta sobre o projeto..." : "Compartilhe seus pensamentos..."}
              className="flex-1 bg-black/50 border border-primary/30 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-primary placeholder-primary/50 focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || input === 'Ouvindo... Fale agora'}
              className="bg-primary text-black p-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-all duration-200"
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