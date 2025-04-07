import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageSquare, Send, Code, RefreshCw, FileCode, Brain, X } from 'lucide-react';

const API_KEY = "AIzaSyCqsdGmlJfpYAzpu8uph1VAjI51XbB5iV0";
const genAI = new GoogleGenerativeAI(API_KEY);

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'improvement' | 'analysis' | 'implementation';
}

interface TechnologySuggestion {
  name: string;
  description: string;
  impact: string;
  implementation: string;
}

const TechChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<TechnologySuggestion[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const analyzeTechnologies = async () => {
    setIsAnalyzing(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const systemPrompt = `
        You are an AI technology consultant specialized in web development and system architecture.
        Analyze the current technology stack and suggest improvements:

        Current Stack:
        - React with TypeScript
        - Vite for build tooling
        - Tailwind CSS for styling
        - Lucide React for icons
        - Google's Gemini AI API
        - React Router for navigation
        - WebRTC for network features
        - Web Audio API for sound effects
        - Canvas API for visualizations

        Provide analysis and suggestions in this format:
        {
          "analysis": "Brief analysis of current stack",
          "suggestions": [
            {
              "name": "Technology name",
              "description": "What it does",
              "impact": "How it improves the system",
              "implementation": "Brief implementation steps"
            }
          ]
        }

        Focus on:
        1. Performance optimizations
        2. Modern web capabilities
        3. Enhanced user experience
        4. System reliability
        5. Code maintainability
      `;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());

      setMessages(prev => [
        ...prev,
        { role: 'system', content: analysis.analysis, type: 'analysis' }
      ]);

      setSuggestions(analysis.suggestions);

      analysis.suggestions.forEach(suggestion => {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `💡 Suggested Improvement: ${suggestion.name}\n\n${suggestion.description}\n\nImpact: ${suggestion.impact}`,
            type: 'improvement'
          }
        ]);
      });
    } catch (error) {
      console.error('Error analyzing technologies:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'system',
          content: 'Error analyzing technologies. Please try again later.',
          type: 'analysis'
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `
        As an AI technology consultant, help improve this web application.
        
        Context:
        - User message: ${userMessage}
        - Current technologies: React, TypeScript, Vite, Tailwind CSS, Gemini AI
        - Current features: Real-time chat, network scanning, neural interface
        
        Provide specific, actionable advice for implementing improvements.
        Focus on practical solutions that enhance:
        1. Performance
        2. User experience
        3. Code quality
        4. System architecture
        
        Format your response in clear, technical language with code examples where relevant.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiMessage = response.text();

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: aiMessage, type: 'implementation' }
      ]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error generating response. Please try again.',
          type: 'implementation'
        }
      ]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-primary text-surface-dark p-3 rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-surface-dark border border-primary/30 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-primary/30 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Tech Improvement AI</h3>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-primary hover:text-primary-dark transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary/20 text-white'
                        : message.role === 'system'
                        ? 'bg-purple-900/30 text-purple-100 border border-purple-500/30'
                        : message.type === 'improvement'
                        ? 'bg-green-900/30 text-green-100 border border-green-500/30'
                        : 'bg-surface/50 text-primary border border-primary/30'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}

              {isAnalyzing && (
                <div className="flex justify-center">
                  <div className="bg-surface/50 p-3 rounded-lg border border-primary/30">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                      <span className="text-primary">Analyzing technologies...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-primary/30">
              <div className="flex space-x-2">
                <button
                  onClick={analyzeTechnologies}
                  disabled={isAnalyzing}
                  className="bg-surface/50 text-primary p-2 rounded-lg hover:bg-surface/70 transition-colors border border-primary/30"
                >
                  <FileCode className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about improving the system..."
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
      )}
    </>
  );
};

export default TechChat;