import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Settings, Power, PowerOff, Save } from 'lucide-react';

interface ChatConfig {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  isEnabled: boolean;
}

interface Message {
  id: string;
  chatId: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: number;
}

const MultiChatAPI: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [chatConfigs, setChatConfigs] = useState<ChatConfig[]>([
    { id: '1', name: 'Chat 01', apiUrl: '', apiKey: '', isEnabled: true },
    { id: '2', name: 'Chat 02', apiUrl: '', apiKey: '', isEnabled: true },
    { id: '3', name: 'Chat 03', apiUrl: '', apiKey: '', isEnabled: true },
    { id: '4', name: 'Chat 04', apiUrl: '', apiKey: '', isEnabled: true }
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeChat, setActiveChat] = useState<string>('1');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempConfigs, setTempConfigs] = useState<ChatConfig[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Load configs from localStorage on mount
  useEffect(() => {
    const savedConfigs = localStorage.getItem('chatConfigs');
    if (savedConfigs) {
      setChatConfigs(JSON.parse(savedConfigs));
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentChat = chatConfigs.find(c => c.id === activeChat);
    if (!currentChat || !currentChat.apiUrl || !currentChat.apiKey || !currentChat.isEnabled) {
      alert(currentChat?.isEnabled ? 'Configure a API e URL primeiro' : 'Este chat está desativado');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      chatId: activeChat,
      content: input,
      type: 'user',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Make API request
      const response = await fetch(currentChat.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentChat.apiKey}`
        },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      // Add API response
      const apiMessage: Message = {
        id: (Date.now() + 1).toString(),
        chatId: activeChat,
        content: data.response || 'Sem resposta da API',
        type: 'assistant',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, apiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        chatId: activeChat,
        content: 'Erro: Falha ao obter resposta da API',
        type: 'assistant',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const toggleChatPower = (id: string) => {
    setChatConfigs(prev => {
      const newConfigs = prev.map(c => 
        c.id === id ? { ...c, isEnabled: !c.isEnabled } : c
      );
      localStorage.setItem('chatConfigs', JSON.stringify(newConfigs));
      return newConfigs;
    });

    // If disabling the active chat, switch to the first enabled chat
    if (id === activeChat) {
      const firstEnabledChat = chatConfigs.find(c => c.id !== id && c.isEnabled);
      if (firstEnabledChat) {
        setActiveChat(firstEnabledChat.id);
      }
    }
  };

  const openConfig = () => {
    setTempConfigs([...chatConfigs]);
    setIsConfiguring(true);
  };

  const saveConfig = () => {
    setChatConfigs(tempConfigs);
    setIsConfiguring(false);
    localStorage.setItem('chatConfigs', JSON.stringify(tempConfigs));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-surface-dark border border-primary/30 rounded-lg w-full max-w-2xl h-[90vh] sm:h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-primary/30 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-primary">Multi Chat API</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={openConfig}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Configuration Modal */}
        {isConfiguring && (
          <div className="absolute inset-0 bg-surface-dark border border-primary/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-primary font-bold">Configuração da API</h4>
              <button
                onClick={() => setIsConfiguring(false)}
                className="text-primary hover:text-primary-dark transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {tempConfigs.map((config) => (
                <div 
                  key={config.id} 
                  className={`space-y-2 p-3 border rounded-lg transition-colors ${
                    config.isEnabled 
                      ? 'border-primary/30 bg-surface/50' 
                      : 'border-gray-700 bg-surface/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${config.isEnabled ? 'text-primary' : 'text-gray-500'}`}>
                      {config.name}
                    </span>
                    <button
                      onClick={() => setTempConfigs(prev =>
                        prev.map(c => c.id === config.id ? { ...c, isEnabled: !c.isEnabled } : c)
                      )}
                      className={`transition-colors ${
                        config.isEnabled 
                          ? 'text-green-500 hover:text-green-400' 
                          : 'text-red-500 hover:text-red-400'
                      }`}
                    >
                      {config.isEnabled ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="URL da API"
                    value={config.apiUrl}
                    onChange={(e) => setTempConfigs(prev =>
                      prev.map(c => c.id === config.id ? { ...c, apiUrl: e.target.value } : c)
                    )}
                    disabled={!config.isEnabled}
                    className={`w-full border rounded px-3 py-2 placeholder-primary/50 ${
                      config.isEnabled
                        ? 'bg-surface/50 border-primary/30 text-primary'
                        : 'bg-surface/20 border-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                  <input
                    type="password"
                    placeholder="Chave da API"
                    value={config.apiKey}
                    onChange={(e) => setTempConfigs(prev =>
                      prev.map(c => c.id === config.id ? { ...c, apiKey: e.target.value } : c)
                    )}
                    disabled={!config.isEnabled}
                    className={`w-full border rounded px-3 py-2 placeholder-primary/50 ${
                      config.isEnabled
                        ? 'bg-surface/50 border-primary/30 text-primary'
                        : 'bg-surface/20 border-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={saveConfig}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-surface-dark rounded hover:bg-primary-dark transition-colors"
              >
                <Save className="h-4 w-4" />
                Salvar Configuração
              </button>
            </div>
          </div>
        )}

        {/* Chat Tabs */}
        <div className="flex border-b border-primary/30">
          {chatConfigs.map((config) => (
            <div key={config.id} className="flex-1 flex items-center">
              <button
                onClick={() => config.isEnabled && setActiveChat(config.id)}
                className={`flex-1 p-2 text-sm font-medium transition-colors ${
                  activeChat === config.id && config.isEnabled
                    ? 'bg-primary text-surface-dark'
                    : config.isEnabled
                    ? 'text-primary hover:bg-primary/10'
                    : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                {config.name}
              </button>
              <button
                onClick={() => toggleChatPower(config.id)}
                className={`p-2 transition-colors ${
                  config.isEnabled
                    ? 'text-green-500 hover:text-green-400'
                    : 'text-red-500 hover:text-red-400'
                }`}
              >
                {config.isEnabled ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent"
        >
          {messages
            .filter(m => m.chatId === activeChat)
            .map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary/20 text-white'
                      : 'bg-surface/50 text-primary border border-primary/30'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-primary/30">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                chatConfigs.find(c => c.id === activeChat)?.isEnabled
                  ? "Digite sua mensagem..."
                  : "Este chat está desativado"
              }
              disabled={!chatConfigs.find(c => c.id === activeChat)?.isEnabled}
              className={`flex-1 border rounded px-4 py-2 placeholder-primary/50 ${
                chatConfigs.find(c => c.id === activeChat)?.isEnabled
                  ? 'bg-surface/50 border-primary/30 text-white'
                  : 'bg-surface/20 border-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !chatConfigs.find(c => c.id === activeChat)?.isEnabled}
              className="bg-primary text-surface-dark p-2 rounded hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiChatAPI;