import React, { useState, useEffect } from 'react';
import { Mic, Camera, Shield, X } from 'lucide-react';

const PermissionsBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [permissions, setPermissions] = useState({
    microphone: false,
    camera: false
  });

  useEffect(() => {
    // Check if permissions have been requested before
    const hasRequestedPermissions = localStorage.getItem('permissionsRequested');
    if (!hasRequestedPermissions) {
      setShowBanner(true);
    }
  }, []);

  const requestPermissions = async () => {
    try {
      // Request microphone permission
      const micPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissions(prev => ({ ...prev, microphone: true }));
      micPermission.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone permission denied:', error);
    }

    try {
      // Request camera permission
      const camPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissions(prev => ({ ...prev, camera: true }));
      camPermission.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Camera permission denied:', error);
    }

    // Mark permissions as requested
    localStorage.setItem('permissionsRequested', 'true');
    localStorage.setItem('permissionsTimestamp', new Date().toISOString());
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('permissionsRequested', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bg-surface-dark/95 border-b border-primary/30 backdrop-blur-md z-40">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-primary font-medium mb-1">
                Permissões necessárias
              </p>
              <p className="text-primary/70 text-sm">
                Para uma melhor experiência, precisamos de acesso ao microfone e câmera.
                Suas permissões podem ser alteradas a qualquer momento nas configurações do navegador.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-surface/50 text-primary border border-primary/30 rounded-lg hover:bg-surface/70 transition-all duration-300 w-full sm:w-auto"
            >
              Agora não
            </button>
            <button
              onClick={requestPermissions}
              className="px-4 py-2 bg-primary text-surface-dark rounded-lg hover:bg-primary-dark transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <span>Permitir acesso</span>
              <div className="flex items-center gap-1">
                <Mic className="h-4 w-4" />
                <Camera className="h-4 w-4" />
              </div>
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

export default PermissionsBanner;