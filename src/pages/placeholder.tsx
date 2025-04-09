import React from 'react';
import { AlertTriangle } from 'lucide-react';

const PlaceholderPage = () => {
  return (
    <div className="min-h-screen bg-surface-dark py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <AlertTriangle className="h-16 w-16 text-yellow-400 mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Em Desenvolvimento</h2>
          <p className="text-primary/70 text-center">
            Esta funcionalidade está em desenvolvimento e estará disponível em breve.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;