import React, { useState, useEffect } from 'react';
import { Octokit } from 'octokit';
import { Search, Filter, Brain, Star, Code, ExternalLink, Package, Cpu, Globe, Database, Lock, Settings, Terminal, Cloud, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import AIChat from '../components/AIChat';

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  topics: string[];
  stargazers_count: number;
  language: string;
  fork: boolean;
}

interface ExpandedNames {
  [key: number]: boolean;
}

const Products = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [allTechnologies, setAllTechnologies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [expandedNames, setExpandedNames] = useState<ExpandedNames>({});
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const toggleNameExpansion = (repoId: number) => {
    setExpandedNames(prev => ({
      ...prev,
      [repoId]: !prev[repoId]
    }));
  };

  const formatRepoName = (name: string) => {
    return name.replace(/-/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const truncateName = (name: string) => {
    const formattedName = formatRepoName(name);
    if (formattedName.length <= 20 || expandedNames[name]) return formattedName;
    return formattedName.substring(0, 20) + '...';
  };

  const getDefaultDescription = (repo: Repository) => {
    const descriptions: { [key: string]: string } = {
      "jcm tecnologia": "Hub de inovação especializado em desenvolvimento de software, IA e soluções tecnológicas. Interface moderna com recursos avançados de interação neural e processamento de dados.",
      "network scanner": "Scanner de rede avançado com análise em tempo real de dispositivos conectados, monitoramento de tráfego e visualização de dados em interface interativa.",
      "ultrasonic mapping": "Sistema de mapeamento ultrassônico para análise e visualização de ambientes em tempo real, utilizando tecnologia de ondas sonoras para criar representações precisas.",
      "neural interface": "Interface neural inteligente com processamento de linguagem natural, análise comportamental e sistema de resposta adaptativo baseado em IA.",
      "multi chat api": "Sistema de chat multicanal com suporte a múltiplas APIs de IA, permitindo interações simultâneas e processamento de linguagem natural avançado.",
      "terminal interface": "Interface de terminal interativa com suporte a comandos personalizados, emulação de ambiente Linux e recursos de automação.",
      "ai assistant": "Assistente de IA avançado com capacidades de processamento de linguagem natural, análise contextual e integração com múltiplas fontes de dados.",
      "system monitor": "Monitor de sistema em tempo real com análise de recursos, visualização de métricas e alertas inteligentes.",
      "audio analyzer": "Analisador de áudio em tempo real com processamento de sinais, visualização de forma de onda e análise espectral.",
      "data manager": "Gerenciador de dados com recursos avançados de análise, visualização e processamento de informações em tempo real."
    };

    const normalizedName = repo.name.toLowerCase();
    return descriptions[normalizedName] || repo.description || "Sistema avançado com integração de tecnologias modernas para processamento e análise de dados em tempo real.";
  };

  const getLanguageColor = (language: string) => {
    switch (language?.toLowerCase()) {
      case 'javascript': return 'text-yellow-400';
      case 'typescript': return 'text-blue-400';
      case 'python': return 'text-green-400';
      case 'java': return 'text-orange-400';
      case 'c++': return 'text-pink-400';
      case 'php': return 'text-purple-400';
      case 'ruby': return 'text-red-400';
      case 'sql': return 'text-cyan-400';
      case 'go': return 'text-teal-400';
      default: return 'text-gray-400';
    }
  };

  const getLanguageIcon = (language: string) => {
    switch (language?.toLowerCase()) {
      case 'javascript': return Terminal;
      case 'typescript': return Code;
      case 'python': return Brain;
      case 'java': return Cpu;
      case 'c++': return Settings;
      case 'php': return Globe;
      case 'ruby': return Package;
      case 'sql': return Database;
      case 'go': return Cloud;
      default: return Code;
    }
  };

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const octokit = new Octokit();
        const response = await octokit.request('GET /users/juliocamposmachado/repos', {
          username: 'AstridNielsen-lab',
          sort: 'updated',
          per_page: 100,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        const repos = response.data
          .filter(repo => !repo.fork)
          .map(repo => ({
            id: repo.id,
            name: repo.name,
            description: repo.description || 'Sem descrição disponível',
            html_url: repo.html_url,
            homepage: repo.homepage || repo.html_url,
            topics: repo.topics,
            stargazers_count: repo.stargazers_count,
            language: repo.language || 'Não especificada',
            fork: repo.fork
          }));

        // Collect all unique technologies from languages and topics
        const technologies = new Set<string>();
        repos.forEach(repo => {
          if (repo.language) technologies.add(repo.language);
          repo.topics.forEach(topic => {
            // Only add technology-related topics
            if (isTechnologyTopic(topic)) {
              technologies.add(formatTechnologyName(topic));
            }
          });
        });

        setAllTechnologies(Array.from(technologies).sort());
        setRepositories(repos);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  // Helper function to identify technology-related topics
  const isTechnologyTopic = (topic: string): boolean => {
    const techKeywords = [
      'react', 'vue', 'angular', 'node', 'javascript', 'typescript',
      'python', 'java', 'cpp', 'ruby', 'php', 'go', 'rust',
      'mongodb', 'postgresql', 'mysql', 'redis', 'graphql',
      'docker', 'kubernetes', 'aws', 'azure', 'firebase',
      'machine-learning', 'ai', 'tensorflow', 'pytorch',
      'web', 'api', 'rest', 'graphql', 'websocket',
      'frontend', 'backend', 'fullstack', 'mobile',
      'android', 'ios', 'react-native', 'flutter'
    ];
    return techKeywords.includes(topic.toLowerCase());
  };

  // Helper function to format technology names
  const formatTechnologyName = (tech: string): string => {
    const specialCases: { [key: string]: string } = {
      'cpp': 'C++',
      'nodejs': 'Node.js',
      'nextjs': 'Next.js',
      'reactjs': 'React',
      'vuejs': 'Vue',
      'postgresql': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'graphql': 'GraphQL',
      'typescript': 'TypeScript',
      'javascript': 'JavaScript'
    };

    if (specialCases[tech.toLowerCase()]) {
      return specialCases[tech.toLowerCase()];
    }

    return tech
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredRepositories = repositories.filter(repo => {
    const matchesTech = selectedTechnologies.length === 0 || 
      selectedTechnologies.some(tech => {
        const normalizedTech = tech.toLowerCase();
        return repo.language?.toLowerCase() === normalizedTech ||
          repo.topics.some(topic => topic.toLowerCase() === normalizedTech);
      });

    const matchesSearch = searchTerm === '' ||
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTech && matchesSearch;
  });

  const playHoverSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.3;
    audio.play();
  };

  const playClickSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.volume = 0.3;
    audio.play();
  };

  const handleButtonPress = (buttonId: string) => {
    setActiveButton(buttonId);
    setTimeout(() => setActiveButton(null), 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="cyber-spinner">
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dark py-16 relative overflow-hidden">
      <div className="absolute inset-0 hex-grid opacity-30" />
      <div className="absolute inset-0 data-lines" />
      <div className="absolute inset-0 bg-grid-pattern" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mb-12 relative">
          <div className="absolute -left-4 -top-4 w-20 h-20 border-l-2 border-t-2 border-primary opacity-50" />
          <div className="absolute -right-4 -top-4 w-20 h-20 border-r-2 border-t-2 border-primary opacity-50" />
          <h1 className="text-4xl font-bold text-center text-primary text-glow mb-2">Meus Projetos</h1>
          <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent box-glow" />
        </div>

        <div className="mb-12 hud-border rounded-lg p-6 scanner">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface/50 border border-primary/30 rounded-lg focus:outline-none focus:border-primary text-primary placeholder-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-primary h-5 w-5" />
              <span className="text-primary font-medium">Tecnologias:</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {allTechnologies.map(tech => (
              <button
                key={tech}
                onClick={() => {
                  playClickSound();
                  handleButtonPress(`tech-${tech}`);
                  setSelectedTechnologies(prev =>
                    prev.includes(tech)
                      ? prev.filter(t => t !== tech)
                      : [...prev, tech]
                  );
                }}
                onMouseEnter={playHoverSound}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform active:scale-95 ${
                  activeButton === `tech-${tech}` ? 'scale-95' : ''
                } ${
                  selectedTechnologies.includes(tech)
                    ? 'bg-primary text-surface-dark box-glow shadow-lg'
                    : 'bg-surface/50 text-primary border border-primary/30 hover:border-primary hover:shadow-lg'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRepositories.map((repo) => {
            const LanguageIcon = getLanguageIcon(repo.language);
            const languageColor = getLanguageColor(repo.language);
            const isExpanded = expandedNames[repo.id];
            const needsExpansion = repo.name.length > 20;

            return (
              <div
                key={repo.id}
                className="hud-border rounded-lg overflow-hidden scanner group transform hover:scale-105 transition-all duration-300 flex flex-col"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 flex items-start">
                      <h3 className="text-xl font-bold text-primary text-glow glitch" data-text={truncateName(repo.name)}>
                        {truncateName(repo.name)}
                      </h3>
                      {needsExpansion && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            playClickSound();
                            handleButtonPress(`expand-${repo.id}`);
                            toggleNameExpansion(repo.id);
                          }}
                          className={`ml-2 text-primary hover:text-primary-dark transition-colors transform active:scale-95 ${
                            activeButton === `expand-${repo.id}` ? 'scale-95' : ''
                          }`}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 ml-2">
                      <span className="flex items-center text-yellow-400">
                        <Star className="h-4 w-4 mr-1" />
                        {repo.stargazers_count}
                      </span>
                      <span className={`flex items-center ${languageColor}`}>
                        <LanguageIcon className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-surface/30 rounded-full border border-primary/30 group-hover:border-primary transition-all duration-300">
                      <Package className={`h-8 w-8 ${languageColor} group-hover:scale-110 transition-transform`} />
                    </div>
                  </div>

                  <p className="text-primary/80 mb-4 flex-1">{getDefaultDescription(repo)}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {repo.topics.map((topic) => (
                      <span 
                        key={topic}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm border border-primary/30"
                      >
                        {formatTechnologyName(topic)}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={playHoverSound}
                      onClick={(e) => {
                        playClickSound();
                        handleButtonPress(`visit-${repo.id}`);
                      }}
                      className={`flex items-center justify-center space-x-2 bg-surface/50 text-primary p-3 rounded-lg hover:bg-primary hover:text-surface-dark transition-all duration-300 border border-primary/30 hover:border-primary group hover:box-glow transform active:scale-95 ${
                        activeButton === `visit-${repo.id}` ? 'scale-95' : ''
                      }`}
                    >
                      <ExternalLink className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>Visitar</span>
                    </a>
                    <button
                      onClick={() => {
                        playClickSound();
                        handleButtonPress(`chat-${repo.id}`);
                        setSelectedRepo(repo);
                        setShowChat(true);
                      }}
                      onMouseEnter={playHoverSound}
                      className={`flex items-center justify-center space-x-2 bg-surface/50 text-primary p-3 rounded-lg hover:bg-primary hover:text-surface-dark transition-all duration-300 border border-primary/30 hover:border-primary group hover:box-glow transform active:scale-95 ${
                        activeButton === `chat-${repo.id}` ? 'scale-95' : ''
                      }`}
                    >
                      <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>Orçamento</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showChat && selectedRepo && (
        <AIChat
          repository={selectedRepo}
          onClose={() => {
            setShowChat(false);
            setSelectedRepo(null);
          }}
          mode="product"
        />
      )}
    </div>
  );
};

export default Products;
