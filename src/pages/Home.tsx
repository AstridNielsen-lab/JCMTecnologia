import React from 'react';
import { ArrowRightIcon, StarIcon, GitForkIcon, Brain, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  stars: number;
  forks: number;
}

const featuredProjects: Project[] = [
  {
    id: 1,
    name: "AI Vision Pro",
    description: "Sistema avançado de visão computacional com IA para reconhecimento de padrões e análise de imagens em tempo real.",
    technologies: ["Python", "TensorFlow", "OpenCV"],
    stars: 128,
    forks: 45
  },
  {
    id: 2,
    name: "Smart IoT Hub",
    description: "Plataforma IoT para automação residencial e industrial, com integração de sensores e controle remoto via aplicativo.",
    technologies: ["Node.js", "MQTT", "React Native"],
    stars: 95,
    forks: 32
  },
  {
    id: 3,
    name: "BlockChain Secure",
    description: "Solução blockchain para segurança de dados e transações, com smart contracts e criptografia avançada.",
    technologies: ["Solidity", "Web3.js", "TypeScript"],
    stars: 156,
    forks: 67
  }
];

const Home = () => {
  return (
    <div className="bg-black text-white">
      {/* Hero Section with Cyberpunk Animation */}
      <div className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510906594845-bc082582c8cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2044&q=80')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-grid-white/10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="space-y-8 max-w-4xl">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient">
                JCM Tecnologia
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                Transformando o futuro através da inovação tecnológica.
                Soluções personalizadas para impulsionar seu negócio no mundo digital.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="group relative inline-flex items-center px-8 py-4 bg-transparent border-2 border-purple-500 rounded-lg overflow-hidden transition-all duration-300 hover:bg-purple-500/20"
              >
                <span className="relative z-10 flex items-center text-lg font-semibold">
                  Conheça Nossas Soluções
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <a
                href="https://github.com/AstridNielsen-lab"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Globe className="mr-2 h-5 w-5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 bg-black">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Por que escolher a JCM Tecnologia?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group p-8 rounded-2xl bg-gradient-to-b from-purple-900/50 to-transparent border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300">
                <div className="bg-gradient-to-r from-cyan-400 to-purple-600 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Inteligência Artificial</h3>
                <p className="text-gray-400">
                  Implementamos soluções avançadas de IA para otimizar processos e criar experiências únicas.
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl bg-gradient-to-b from-blue-900/50 to-transparent border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300">
                <div className="bg-gradient-to-r from-blue-400 to-indigo-600 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Tecnologia Web3</h3>
                <p className="text-gray-400">
                  Desenvolvimento de aplicações descentralizadas e soluções blockchain inovadoras.
                </p>
              </div>
              
              <div className="group p-8 rounded-2xl bg-gradient-to-b from-pink-900/50 to-transparent border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300">
                <div className="bg-gradient-to-r from-pink-400 to-red-600 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Segurança Digital</h3>
                <p className="text-gray-400">
                  Proteção avançada de dados e sistemas com as mais recentes tecnologias de segurança.
                </p>
              </div>
            </div>
          </div>

          {/* Featured Projects */}
          <div className="mt-32">
            <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Projetos em Destaque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-gradient-to-b from-purple-900/30 to-transparent p-6 rounded-2xl border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-grid-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-xl font-semibold mb-3 text-white">{project.name}</h3>
                  <p className="text-gray-400 mb-4 h-20 overflow-hidden">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-yellow-500">
                        <StarIcon className="h-4 w-4 mr-1" />
                        <span>{project.stars}</span>
                      </div>
                      <div className="flex items-center text-purple-400">
                        <GitForkIcon className="h-4 w-4 mr-1" />
                        <span>{project.forks}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/products?search=${encodeURIComponent(project.name)}`}
                    className="inline-block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Saiba Mais
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;