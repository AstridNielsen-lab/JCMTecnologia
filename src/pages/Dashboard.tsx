import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Network, 
  Radar, 
  MessageSquare, 
  Terminal, 
  Bot,
  Cpu,
  Waves,
  Shield,
  Database
} from 'lucide-react';

const tools = [
  {
    name: 'Neural Interface',
    description: 'Interface neural para análise comportamental e cognitiva',
    icon: Brain,
    path: '/neural',
    color: 'purple'
  },
  {
    name: 'Network Scanner',
    description: 'Scanner de rede com análise em tempo real',
    icon: Network,
    path: '/network-scanner',
    color: 'blue'
  },
  {
    name: 'Ultrasonic Mapping',
    description: 'Mapeamento ultrassônico do ambiente',
    icon: Radar,
    path: '/ultrasonic',
    color: 'cyan'
  },
  {
    name: 'Multi Chat API',
    description: 'Interface de chat com múltiplas APIs',
    icon: MessageSquare,
    path: '/multi-chat',
    color: 'green'
  },
  {
    name: 'Terminal Interface',
    description: 'Terminal interativo com comandos personalizados',
    icon: Terminal,
    path: '/terminal',
    color: 'yellow'
  },
  {
    name: 'AI Assistant',
    description: 'Assistente de IA para análise e suporte',
    icon: Bot,
    path: '/ai-assistant',
    color: 'red'
  },
  {
    name: 'System Monitor',
    description: 'Monitoramento de recursos do sistema',
    icon: Cpu,
    path: '/system-monitor',
    color: 'orange'
  },
  {
    name: 'Audio Analyzer',
    description: 'Análise e processamento de áudio em tempo real',
    icon: Waves,
    path: '/audio-analyzer',
    color: 'pink'
  },
  {
    name: 'Security Suite',
    description: 'Suite de ferramentas de segurança',
    icon: Shield,
    path: '/security',
    color: 'emerald'
  },
  {
    name: 'Data Manager',
    description: 'Gerenciamento e análise de dados',
    icon: Database,
    path: '/data-manager',
    color: 'indigo'
  }
];

const getColorClasses = (color: string) => {
  const baseClasses = "group-hover:scale-110 transition-transform";
  switch (color) {
    case 'purple': return `text-purple-400 ${baseClasses}`;
    case 'blue': return `text-blue-400 ${baseClasses}`;
    case 'cyan': return `text-cyan-400 ${baseClasses}`;
    case 'green': return `text-green-400 ${baseClasses}`;
    case 'yellow': return `text-yellow-400 ${baseClasses}`;
    case 'red': return `text-red-400 ${baseClasses}`;
    case 'orange': return `text-orange-400 ${baseClasses}`;
    case 'pink': return `text-pink-400 ${baseClasses}`;
    case 'emerald': return `text-emerald-400 ${baseClasses}`;
    case 'indigo': return `text-indigo-400 ${baseClasses}`;
    default: return `text-gray-400 ${baseClasses}`;
  }
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-surface-dark py-16 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hex-grid opacity-30" />
      <div className="absolute inset-0 data-lines" />
      <div className="absolute inset-0 bg-grid-pattern" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-12 relative">
          <div className="absolute -left-4 -top-4 w-20 h-20 border-l-2 border-t-2 border-primary opacity-50" />
          <div className="absolute -right-4 -top-4 w-20 h-20 border-r-2 border-t-2 border-primary opacity-50" />
          <h1 className="text-4xl font-bold text-center text-primary text-glow mb-2">Painel de Controle</h1>
          <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent box-glow" />
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <Link
              key={index}
              to={tool.path}
              className="group"
            >
              <div className="hud-border rounded-lg p-6 scanner h-full hover:border-primary transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-surface/50 rounded-lg border border-primary/30 group-hover:border-primary transition-all duration-300">
                    <tool.icon className={`h-6 w-6 ${getColorClasses(tool.color)}`} />
                  </div>
                  <h3 className="text-lg font-bold text-primary group-hover:text-glow transition-all duration-300">
                    {tool.name}
                  </h3>
                </div>
                <p className="text-primary/70 group-hover:text-primary transition-all duration-300">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;