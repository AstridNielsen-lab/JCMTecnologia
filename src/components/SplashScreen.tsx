import React, { useState, useEffect } from 'react';
import { Send, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Check if user has already subscribed
    const subscribed = localStorage.getItem('subscribed') === 'true';
    if (subscribed) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onComplete, 500);
      }, 2000);
    }
  }, [onComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Send email to your email address
      const mailtoLink = `mailto:juliocamposmachado@gmail.com?subject=Nova Inscrição Newsletter&body=Novo inscrito: ${email}`;
      window.location.href = mailtoLink;
      
      // Save subscription status
      localStorage.setItem('subscribed', 'true');
      localStorage.setItem('userEmail', email);
      
      setIsSubscribed(true);
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onComplete, 500);
      }, 2000);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleSkip = () => {
    setIsAnimating(false);
    setTimeout(onComplete, 500);
  };

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-opacity duration-500 ${
        !isAnimating ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">JCM Tecnologia</h1>
          <div className="h-px w-24 bg-gray-700 mx-auto mb-4"></div>
          <p className="text-xl text-gray-400 font-light">Julio Campos Machado</p>
          <p className="text-md text-gray-500 mt-1">Dev Full Stack</p>
        </div>
        
        {!isSubscribed ? (
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Receber Novidades</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
            
            <button
              onClick={handleSkip}
              className="w-full bg-transparent border border-gray-700 text-gray-400 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Entrar no Site</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-2xl text-white mb-4">Obrigado por se inscrever!</p>
            <div className="animate-pulse">
              <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;