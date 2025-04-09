import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { 
  Bot, 
  Link as LinkIcon, 
  Unlink, 
  Send, 
  Plus, 
  Trash2, 
  Settings, 
  Globe,
  MessageSquare,
  Save,
  Download
} from 'lucide-react';

interface AIConfig {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  isActive: boolean;
}

interface Message {
  id: string;
  aiId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
}

interface Connection {
  sourceId: string;
  targetId: string;
}

interface CollaborationChat {
  id: string;
  messages: Message[];
  sourceAI: string;
  targetAI: string;
}

const MultiAIChat: React.FC = () => {
  const [aiConfigs, setAIConfigs] = useState<AIConfig[]>(() => {
    const saved = localStorage.getItem('aiConfigs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [collaborationChats, setCollaborationChats] = useState<CollaborationChat[]>([]);
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [showConfig, setShowConfig] = useState<string | null>(null);
  
  const chatContainersRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    localStorage.setItem('aiConfigs', JSON.stringify(aiConfigs));
  }, [aiConfigs]);

  const addAIConfig = () => {
    if (aiConfigs.length >= 4) return;
    
    const newConfig: AIConfig = {
      id: uuidv4(),
      name: `AI ${aiConfigs.length + 1}`,
      apiUrl: '',
      apiKey: '',
      isActive: false
    };
    
    setAIConfigs([...aiConfigs, newConfig]);
    setMessages(prev => ({ ...prev, [newConfig.id]: [] }));
    setInputs(prev => ({ ...prev, [newConfig.id]: '' }));
  };

  const removeAIConfig = (id: string) => {
    setAIConfigs(aiConfigs.filter(config => config.id !== id));
    setConnections(connections.filter(conn => conn.sourceId !== id && conn.targetId !== id));
    
    const newMessages = { ...messages };
    delete newMessages[id];
    setMessages(newMessages);
    
    const newInputs = { ...inputs };
    delete newInputs[id];
    setInputs(newInputs);
  };

  const updateAIConfig = (id: string, updates: Partial<AIConfig>) => {
    setAIConfigs(aiConfigs.map(config => 
      config.id === id ? { ...config, ...updates } : config
    ));
  };

  const toggleConnection = (sourceId: string, targetId: string) => {
    const existingConnection = connections.find(
      conn => conn.sourceId === sourceId && conn.targetId === targetId
    );

    if (existingConnection) {
      setConnections(connections.filter(conn => 
        !(conn.sourceId === sourceId && conn.targetId === targetId)
      ));
      setCollaborationChats(collaborationChats.filter(chat =>
        !(chat.sourceAI === sourceId && chat.targetAI === targetId)
      ));
    } else {
      const newConnection = { sourceId, targetId };
      setConnections([...connections, newConnection]);
      setCollaborationChats([...collaborationChats, {
        id: uuidv4(),
        messages: [],
        sourceAI: sourceId,
        targetAI: targetId
      }]);
    }
  };

  const sendMessage = async (aiId: string, message: string) => {
    if (!message.trim()) return;

    const config = aiConfigs.find(c => c.id === aiId);
    if (!config || !config.isActive) return;

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      aiId,
      content: message,
      role: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => ({
      ...prev,
      [aiId]: [...(prev[aiId] || []), userMessage]
    }));
    setInputs(prev => ({ ...prev, [aiId]: '' }));

    try {
      // Send request to AI API
      const response = await axios.post(config.apiUrl, {
        contents: [{ parts: [{ text: message }] }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      // Add AI response
      const aiResponse: Message = {
        id: uuidv4(),
        aiId,
        content: response.data.candidates[0].content.parts[0].text,
        role: 'assistant',
        timestamp: Date.now()
      };

      setMessages(prev => ({
        ...prev,
        [aiId]: [...(prev[aiId] || []), aiResponse]
      }));

      // Handle AI collaboration
      const aiConnections = connections.filter(conn => conn.sourceId === aiId);
      for (const connection of aiConnections) {
        const collaborationMessage = `Please review and enhance this response: "${aiResponse.content}"`;
        await sendCollaborationMessage(connection.sourceId, connection.targetId, collaborationMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        aiId,
        content: 'Error: Failed to get response from AI',
        role: 'system',
        timestamp: Date.now()
      };

      setMessages(prev => ({
        ...prev,
        [aiId]: [...(prev[aiId] || []), errorMessage]
      }));
    }
  };

  const sendCollaborationMessage = async (sourceId: string, targetId: string, message: string) => {
    const targetConfig = aiConfigs.find(c => c.id === targetId);
    if (!targetConfig || !targetConfig.isActive) return;

    const collaborationChat = collaborationChats.find(
      chat => chat.sourceAI === sourceId && chat.targetAI === targetId
    );

    if (!collaborationChat) return;

    try {
      const response = await axios.post(targetConfig.apiUrl, {
        contents: [{ parts: [{ text: message }] }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${targetConfig.apiKey}`
        }
      });

      const newMessage: Message = {
        id: uuidv4(),
        aiId: targetId,
        content: response.data.candidates[0].content.parts[0].text,
        role: 'assistant',
        timestamp: Date.now()
      };

      setCollaborationChats(prev => prev.map(chat => 
        chat.id === collaborationChat.id
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      ));
    } catch (error) {
      console.error('Error in AI collaboration:', error);
    }
  };

  const exportChat = (aiId: string) => {
    const chatMessages = messages[aiId];
    if (!chatMessages) return;

    const exportData = {
      config: aiConfigs.find(c => c.id === aiId),
      messages: chatMessages,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${aiId}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="hud-border p-6 scanner">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Bot className="h-6 w-6" />
          Multi-AI Interface
        </h2>
        <button
          onClick={addAIConfig}
          disabled={aiConfigs.length >= 4}
          className="bg-primary text-surface-dark px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add AI
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aiConfigs.map(config => (
          <div key={config.id} className="border border-primary/30 rounded-lg p-4 bg-surface/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot className={`h-5 w-5 ${config.isActive ? 'text-green-400' : 'text-primary/50'}`} />
                <h3 className="text-lg font-semibold text-primary">{config.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfig(showConfig === config.id ? null : config.id)}
                  className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeAIConfig(config.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showConfig === config.id && (
              <div className="mb-4 space-y-3 border border-primary/30 rounded-lg p-3 bg-surface/30">
                <div>
                  <label className="text-primary/70 text-sm block mb-1">Name</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={e => updateAIConfig(config.id, { name: e.target.value })}
                    className="w-full bg-surface/50 border border-primary/30 rounded px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="text-primary/70 text-sm block mb-1">API URL</label>
                  <input
                    type="text"
                    value={config.apiUrl}
                    onChange={e => updateAIConfig(config.id, { apiUrl: e.target.value })}
                    className="w-full bg-surface/50 border border-primary/30 rounded px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="text-primary/70 text-sm block mb-1">API Key</label>
                  <input
                    type="password"
                    value={config.apiKey}
                    onChange={e => updateAIConfig(config.id, { apiKey: e.target.value })}
                    className="w-full bg-surface/50 border border-primary/30 rounded px-3 py-2 text-primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-primary/70 text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.isActive}
                      onChange={e => updateAIConfig(config.id, { isActive: e.target.checked })}
                      className="rounded border-primary/30"
                    />
                    Active
                  </label>
                  <button
                    onClick={() => exportChat(config.id)}
                    className="text-primary hover:text-primary-dark transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4 flex flex-wrap gap-2">
              {aiConfigs
                .filter(other => other.id !== config.id)
                .map(other => {
                  const isConnected = connections.some(
                    conn => conn.sourceId === config.id && conn.targetId === other.id
                  );
                  return (
                    <button
                      key={other.id}
                      onClick={() => toggleConnection(config.id, other.id)}
                      className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                        isConnected
                          ? 'bg-primary text-surface-dark'
                          : 'bg-surface/50 text-primary border border-primary/30'
                      }`}
                    >
                      {isConnected ? (
                        <Unlink className="h-3 w-3" />
                      ) : (
                        <LinkIcon className="h-3 w-3" />
                      )}
                      {other.name}
                    </button>
                  );
                })}
            </div>

            <div
              ref={el => chatContainersRef.current[config.id] = el}
              className="h-[300px] mb-4 overflow-y-auto border border-primary/30 rounded-lg p-3 space-y-3 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent"
            >
              {messages[config.id]?.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary/20 text-white'
                        : message.role === 'system'
                        ? 'bg-red-500/20 text-red-100'
                        : 'bg-surface/50 text-primary border border-primary/30'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputs[config.id] || ''}
                onChange={e => setInputs(prev => ({ ...prev, [config.id]: e.target.value }))}
                onKeyPress={e => e.key === 'Enter' && sendMessage(config.id, inputs[config.id] || '')}
                placeholder={config.isActive ? 'Type a message...' : 'Configure API to start...'}
                disabled={!config.isActive}
                className="flex-1 bg-surface/50 border border-primary/30 rounded-lg px-4 py-2 text-white placeholder-primary/50 focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(config.id, inputs[config.id] || '')}
                disabled={!config.isActive || !inputs[config.id]?.trim()}
                className="bg-primary text-surface-dark p-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-all duration-200"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Collaboration Chats */}
      {collaborationChats.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Collaborations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collaborationChats.map(chat => {
              const sourceAI = aiConfigs.find(c => c.id === chat.sourceAI);
              const targetAI = aiConfigs.find(c => c.id === chat.targetAI);
              return (
                <div key={chat.id} className="border border-primary/30 rounded-lg p-4 bg-surface/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-primary flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {sourceAI?.name} ↔ {targetAI?.name}
                    </h4>
                  </div>
                  <div className="h-[200px] overflow-y-auto border border-primary/30 rounded-lg p-3 space-y-3 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                    {chat.messages.map(message => (
                      <div key={message.id} className="text-sm text-primary/80">
                        {message.content}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiAIChat;