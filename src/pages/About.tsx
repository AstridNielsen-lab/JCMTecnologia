import React from 'react';
import { Brain, Code, Database, Globe, Server, Shield, Terminal, Cpu } from 'lucide-react';

const About = () => {
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
          <h1 className="text-4xl font-bold text-center text-primary text-glow mb-2">Sobre Mim</h1>
          <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent box-glow" />
        </div>

        {/* Profile Section */}
        <div className="hud-border rounded-lg p-8 scanner mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Julio Campos Machado</h2>
              <p className="text-primary/80 mb-6">
                Desenvolvedor Full Stack Sênior com mais de 10 anos de experiência em desenvolvimento de software, 
                especializado em soluções tecnológicas inovadoras e arquitetura de sistemas complexos.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-purple-400" />
                  <span className="text-primary">Especialista em Inteligência Artificial e Machine Learning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Code className="h-5 w-5 text-blue-400" />
                  <span className="text-primary">Desenvolvimento Full Stack</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-green-400" />
                  <span className="text-primary">Arquitetura de Banco de Dados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-red-400" />
                  <span className="text-primary">Segurança e Criptografia</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-primary mb-4">Experiência Profissional</h3>
              <div className="space-y-4">
                <div className="border border-primary/30 rounded-lg p-4 hover:border-primary transition-all duration-300">
                  <h4 className="text-lg font-semibold text-primary">Desenvolvedor Full Stack Sênior</h4>
                  <p className="text-primary/70">Like Look Solutions • 2020 - Presente</p>
                  <p className="text-primary/80 mt-2">
                    Liderança técnica em projetos de desenvolvimento web, mobile e sistemas distribuídos.
                  </p>
                </div>
                <div className="border border-primary/30 rounded-lg p-4 hover:border-primary transition-all duration-300">
                  <h4 className="text-lg font-semibold text-primary">Arquiteto de Software</h4>
                  <p className="text-primary/70">Projetos Independentes • 2018 - 2020</p>
                  <p className="text-primary/80 mt-2">
                    Desenvolvimento de soluções personalizadas e consultoria em arquitetura de sistemas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="hud-border rounded-lg p-6 scanner">
            <div className="flex items-center space-x-3 mb-4">
              <Terminal className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-primary">Linguagens</h3>
            </div>
            <ul className="space-y-2 text-primary/80">
              <li>• Python (Django, Flask, FastAPI)</li>
              <li>• JavaScript/TypeScript (React, Node.js)</li>
              <li>• C++ (Desenvolvimento de Sistemas)</li>
              <li>• Java (Spring Boot, Android)</li>
              <li>• PHP (Laravel, WordPress)</li>
            </ul>
          </div>

          <div className="hud-border rounded-lg p-6 scanner">
            <div className="flex items-center space-x-3 mb-4">
              <Server className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-primary">Infraestrutura</h3>
            </div>
            <ul className="space-y-2 text-primary/80">
              <li>• AWS (EC2, S3, Lambda)</li>
              <li>• Docker & Kubernetes</li>
              <li>• CI/CD (Jenkins, GitHub Actions)</li>
              <li>• Linux & Shell Scripting</li>
              <li>• Monitoramento & Logging</li>
            </ul>
          </div>

          <div className="hud-border rounded-lg p-6 scanner">
            <div className="flex items-center space-x-3 mb-4">
              <Cpu className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-primary">Especialidades</h3>
            </div>
            <ul className="space-y-2 text-primary/80">
              <li>• Machine Learning & IA</li>
              <li>• Processamento de Dados</li>
              <li>• Segurança da Informação</li>
              <li>• Arquitetura de Microsserviços</li>
              <li>• Otimização de Performance</li>
            </ul>
          </div>
        </div>

        {/* Projects & Contributions */}
        <div className="hud-border rounded-lg p-8 scanner">
          <h3 className="text-2xl font-bold text-primary mb-6">Projetos & Contribuições</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xl font-semibold text-primary mb-4">Destaques</h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-primary font-medium">187+ Projetos Open Source</p>
                    <p className="text-primary/70">Contribuições ativas para a comunidade de desenvolvimento</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Brain className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-primary font-medium">Sistemas de IA</p>
                    <p className="text-primary/70">Desenvolvimento de soluções inteligentes para automação e análise</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-primary mb-4">Certificações</h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-primary font-medium">AWS Certified Solutions Architect</p>
                    <p className="text-primary/70">Especialista em arquitetura de nuvem</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Database className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-primary font-medium">MongoDB Certified Developer</p>
                    <p className="text-primary/70">Especialista em banco de dados NoSQL</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;