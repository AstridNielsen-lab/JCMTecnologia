import React, { useEffect, useState } from 'react';
import { ArrowRightIcon, StarIcon, GitForkIcon, Cpu, Code, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Octokit } from 'octokit';

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
}

const Home = () => {
  const [featuredRepos, setFeaturedRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedRepos = async () => {
      try {
        const octokit = new Octokit();
        const response = await octokit.request('GET /users/AstridNielsen-lab/repos', {
          username: 'AstridNielsen-lab',
          sort: 'updated',
          per_page: 100,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
        
        const sortedRepos = response.data
          .sort((a, b) => 
            (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count)
          )
          .slice(0, 3);
        
        setFeaturedRepos(sortedRepos);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRepos();
  }, []);

  return (
    <div>
      <div className="relative h-[600px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
            alt="DISPARAT TECHNO - Tecnologia Avançada"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black to-purple-900 opacity-80"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full text-white">
            <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              DISPARAT TECHNO
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
            <h2 className="text-4xl font-bold mb-4">Por que escolher a DISPARAT TECHNO?</h2>
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
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredRepos.map((repo) => (
                  <div key={repo.id} className="bg-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2">
                    <h3 className="text-xl font-semibold mb-3">{repo.name}</h3>
                    <p className="text-gray-600 mb-4 h-20 overflow-hidden">
                      {repo.description || 'No description available'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <span key={topic} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-medium">
                          {topic}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center">
                          <GitForkIcon className="h-4 w-4 text-purple-500 mr-1" />
                          <span>{repo.forks_count}</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                    >
                      Ver no GitHub
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;