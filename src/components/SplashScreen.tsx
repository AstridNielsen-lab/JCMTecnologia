import React, { useState, useEffect } from 'react';
import { Send, ArrowRight, Scale, Search, Filter, Brain, Mail, Github } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

// Sound effects URLs
const HOVER_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
const CLICK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const subscribed = localStorage.getItem('subscribed') === 'true';
    if (subscribed) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onComplete, 500);
      }, 2000);
    } else {
      setTimeout(() => {
        setShowSubscribe(true);
      }, 2000);
    }
  }, [onComplete]);

  const playHoverSound = () => {
    const audio = new Audio(HOVER_SOUND);
    audio.volume = 0.3;
    audio.play();
  };

  const playClickSound = () => {
    const audio = new Audio(CLICK_SOUND);
    audio.volume = 0.3;
    audio.play();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    
    try {
      const mailtoLink = `mailto:juliocamposmachado@gmail.com?subject=Nova Inscrição Newsletter&body=Novo inscrito: ${email}`;
      window.location.href = mailtoLink;
      
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
    playClickSound();
    setIsAnimating(false);
    setTimeout(onComplete, 500);
  };

  const categories = [
    'Tecnologia',
    'Inovação',
    'IA',
    'Desenvolvimento',
    'Design',
    'Automação'
  ];

  return (
    <div className={`fixed inset-0 bg-surface-dark flex items-center justify-center z-50 transition-opacity duration-500 ${
      !isAnimating ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0 hex-grid opacity-30" />
      <div className="absolute inset-0 data-lines" />
      <div className="absolute inset-0 bg-grid-pattern" />

      <div className="max-w-4xl w-full mx-4 relative">
        {/* Header */}
        <div className="mb-12 relative">
          <div className="absolute -left-4 -top-4 w-20 h-20 border-l-2 border-t-2 border-primary opacity-50" />
          <div className="absolute -right-4 -top-4 w-20 h-20 border-r-2 border-t-2 border-primary opacity-50" />
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-primary text-glow mb-2">JCM Tecnologia</h1>
          <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent box-glow" />
        </div>

        {!isSubscribed && showSubscribe ? (
          <div className="hud-border rounded-lg p-6 scanner bg-surface-dark/90 backdrop-blur">
            {/* Search and Filter Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu melhor e-mail"
                    className="w-full pl-10 pr-4 py-3 bg-surface/50 border border-primary/30 rounded-lg focus:outline-none focus:border-primary text-primary placeholder-primary/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-primary h-5 w-5" />
                  <span className="text-primary font-medium">Interesses:</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      playClickSound();
                      setSelectedCategories(prev =>
                        prev.includes(category)
                          ? prev.filter(c => c !== category)
                          : [...prev, category]
                      );
                    }}
                    onMouseEnter={playHoverSound}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedCategories.includes(category)
                        ? 'bg-primary text-surface-dark box-glow'
                        : 'bg-surface/50 text-primary border border-primary/30 hover:border-primary'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleSubmit}
                onMouseEnter={playHoverSound}
                className="flex items-center justify-center space-x-2 bg-primary text-surface-dark px-6 py-3 rounded-lg transition-all duration-300 hover:bg-primary-dark transform hover:scale-105"
              >
                <Mail className="h-5 w-5" />
                <span>Receber Novidades</span>
              </button>
              <button
                onClick={handleSkip}
                onMouseEnter={playHoverSound}
                className="flex items-center justify-center space-x-2 bg-surface/50 text-primary border border-primary/30 px-6 py-3 rounded-lg hover:bg-surface/70 transition-all duration-300"
              >
                <ArrowRight className="h-5 w-5" />
                <span>Entrar no Site</span>
              </button>
            </div>

            {/* Social Links */}
            <div className="mt-8 flex justify-center space-x-4">
              <a
                href="https://github.com/AstridNielsen-lab"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playHoverSound}
                onClick={playClickSound}
                className="text-primary hover:text-primary-dark transition-all duration-300 transform hover:scale-110"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="https://likelook.wixsite.com/solutions"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playHoverSound}
                onClick={playClickSound}
                className="text-primary hover:text-primary-dark transition-all duration-300 transform hover:scale-110"
              >
                <Brain className="h-6 w-6" />
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="cyber-spinner mx-auto mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <Scale className="text-primary h-8 w-8 animate-pulse" />
              </div>
            </div>
            {isSubscribed && (
              <p className="text-2xl text-primary text-glow">Obrigado por se inscrever!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;