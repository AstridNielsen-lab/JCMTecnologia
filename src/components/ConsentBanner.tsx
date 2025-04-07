import React, { useState, useEffect } from 'react';
import { Cookie, Shield, X } from 'lucide-react';

const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('consentTimestamp', new Date().toISOString());
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface-dark/95 border-t border-primary/30 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-primary font-medium mb-1">
                Nós valorizamos sua privacidade
              </p>
              <p className="text-primary/70 text-sm">
                Este site utiliza cookies e armazenamento local para melhorar sua experiência.
                Ao continuar navegando, você concorda com nossa política de privacidade e uso de dados.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-surface/50 text-primary border border-primary/30 rounded-lg hover:bg-surface/70 transition-all duration-300 w-full sm:w-auto"
            >
              Recusar
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-primary text-surface-dark rounded-lg hover:bg-primary-dark transition-all duration-300 w-full sm:w-auto"
            >
              Aceitar
            </button>
          </div>
          <button
            onClick={handleDecline}
            className="absolute top-2 right-2 text-primary/70 hover:text-primary sm:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;