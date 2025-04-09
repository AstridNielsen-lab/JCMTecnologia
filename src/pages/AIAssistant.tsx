import React, { useState } from 'react';
import { Bot, MessageSquare, Send, Key } from 'lucide-react';
import APIConfig from '../components/APIConfig';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('ai_assistant_api_key'));

  const handleSend = () => {
    if (!input.trim()) return;
    if (!apiKey) {
      setShowConfig(true);
      return;
    }

    // Adiciona mensagem do usuário
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // Simula resposta do assistente
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Esta é uma resposta simulada do assistente. Em um ambiente real, esta mensagem seria processada pela API configurada.'
    }]);
    
    setInput('');
  };

  const handleApiSave = (key: string) => {
    setApiKey(key);
  };

  return (
    <div className="min-h-screen bg-surface-dark py-16 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hex-grid opacity-30" />
      <div className="absolute inset-0 data-lines" />
      <div className="absolute inset-0 bg-grid-pattern" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">AI Assistant</h1>
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center space-x-2 bg-surface/50 text-primary px-4 py-2 rounded-lg hover:bg-surface/70 transition-all duration-300 border border-primary/30"
          >
            <Key className="h-5 w-5" />
            <span>Configurar API</span>
          </button>
        </div>

        {/* Chat Container */}
        <div className="bg-surface-dark border border-primary/30 rounded-lg overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-primary/70">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p>Comece uma conversa com o assistente</p>
                {!apiKey && (
                  <p className="text-sm mt-2">
                    Lembre-se de configurar sua chave de API primeiro
                  </p>
                )}
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
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
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-primary/30 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={apiKey ? "Digite sua mensagem..." : "Configure a API primeiro"}
                className="flex-1 bg-surface/50 border border-primary/30 rounded-lg px-4 py-2 text-white placeholder-primary/50 focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-primary text-surface-dark p-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-all duration-200"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration Modal */}
      {showConfig && (
        <APIConfig
          title="Configuração do AI Assistant"
          description="Para utilizar o AI Assistant, você precisa fornecer uma chave de API válida. Esta chave será armazenada localmente e usada para todas as requisições."
          apiKeyName="ai_assistant_api_key"
          onSave={handleApiSave}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
};

export default AIAssistant;