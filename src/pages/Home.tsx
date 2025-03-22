import React, { useEffect, useState } from 'react';
import { ArrowRightIcon, StarIcon, GitForkIcon, Cpu, Code, Zap } from 'lucide-react';
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
    <div>
      <div className="relative h-[600px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
            alt="JCM Tecnologia - Tecnologia Avançada"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black to-purple-900 opacity-80"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full text-white">
            <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              JCM Tecnologia
            </h1>
            <p className="text-2xl mb-8 max-w-2xl text-gray-300">
              Transformando o futuro através da inovação tecnológica.
              Soluções personalizadas para impulsionar seu negócio.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 w-fit"
            >
              Conheça Nossas Soluções
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Por que escolher a JCM Tecnologia?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Cpu className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Tecnologia Avançada</h3>
                <p className="text-gray-600">
                  Utilizamos as mais recentes tecnologias e metodologias para desenvolver soluções inovadoras.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Code className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Desenvolvimento Expert</h3>
                <p className="text-gray-600">
                  Equipe especializada liderada por Julio Campos Machado, com vasta experiência em desenvolvimento.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2">
                <div className="bg-pink-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Soluções Personalizadas</h3>
                <p className="text-gray-600">
                  Desenvolvemos soluções sob medida para atender às necessidades específicas do seu negócio.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-20">
            <h2 className="text-4xl font-bold mb-12">Projetos em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <div key={project.id} className="bg-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2">
                  <h3 className="text-xl font-semibold mb-3">{project.name}</h3>
                  <p className="text-gray-600 mb-4 h-20 overflow-hidden">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{project.stars}</span>
                      </div>
                      <div className="flex items-center">
                        <GitForkIcon className="h-4 w-4 text-purple-500 mr-1" />
                        <span>{project.forks}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/products"
                    className="inline-block w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
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