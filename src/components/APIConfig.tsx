import React, { useState, useEffect } from 'react';
import { Key, Save, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface APIConfigProps {
  title: string;
  description: string;
  apiKeyName: string;
  onSave: (apiKey: string) => void;
  onClose: () => void;
}

const APIConfig: React.FC<APIConfigProps> = ({
  title,
  description,
  apiKeyName,
  onSave,
  onClose
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if API key exists in localStorage
    const savedKey = localStorage.getItem(apiKeyName);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [apiKeyName]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(apiKeyName, apiKey.trim());
      onSave(apiKey.trim());
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface-dark border border-primary/30 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-primary/30 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-start space-x-2 mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-300">{description}</p>
            </div>
            
            <label className="block text-primary text-sm font-medium mb-2">
              Chave da API
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Digite sua chave de API aqui"
              className="w-full bg-surface/50 border border-primary/30 rounded-lg px-4 py-2 text-white placeholder-primary/50 focus:outline-none focus:border-primary"
            />
          </div>

          {showSuccess && (
            <div className="flex items-center space-x-2 text-green-400 mb-4">
              <CheckCircle className="h-5 w-5" />
              <span>Configuração salva com sucesso!</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="w-full flex items-center justify-center space-x-2 bg-primary text-surface-dark p-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-all duration-200"
          >
            <Save className="h-5 w-5" />
            <span>Salvar Configuração</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default APIConfig;