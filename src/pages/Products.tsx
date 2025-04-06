import React, { useState, useEffect } from 'react';
import { Octokit } from 'octokit';
import AIChat from '../components/AIChat';
import { Search, Filter, Globe, Github, MessageSquare } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  topics: string[];
  stargazers_count: number;
  language: string;
}

const Products = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [allTechnologies, setAllTechnologies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRepositories = async () => {
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

        const repos = response.data.map(repo => ({
          id: repo.id,
          name: repo.name,
          description: repo.description || 'Sem descrição disponível',
          html_url: repo.html_url,
          homepage: repo.homepage || 'https://likelook.wixsite.com/solutions',
          topics: repo.topics,
          stargazers_count: repo.stargazers_count,
          language: repo.language || 'Não especificada'
        }));

        const technologies = new Set<string>();
        repos.forEach(repo => {
          if (repo.language) technologies.add(repo.language);
          repo.topics.forEach(topic => technologies.add(topic));
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

  const filteredRepositories = repositories.filter(repo => {
    const matchesTech = selectedTechnologies.length === 0 || 
      selectedTechnologies.some(tech => 
        repo.topics.includes(tech.toLowerCase()) || 
        repo.language === tech
      );

    const matchesSearch = searchTerm === '' ||
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTech && matchesSearch;
  });

  const toggleTechnology = (tech: string) => {
    setSelectedTechnologies(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center cyberpunk-gradient">Projetos</h1>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-cyan-400 placeholder-cyan-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-cyan-400 h-5 w-5" />
              <span className="text-cyan-400 font-medium">Filtrar por:</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {allTechnologies.map(tech => (
              <button
                key={tech}
                onClick={() => toggleTechnology(tech)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedTechnologies.includes(tech)
                    ? 'bg-cyan-500 text-black'
                    : 'bg-black/50 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRepositories.map((repo) => (
            <div key={repo.id} className="bg-black/50 border border-cyan-500/30 rounded-lg overflow-hidden backdrop-blur-sm hover:border-cyan-400 transition-all duration-300">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-cyan-400">{repo.name}</h3>
                <p className="text-gray-400 mb-4 h-20 overflow-hidden">{repo.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {repo.topics.map((topic) => (
                    <span key={topic} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-sm border border-cyan-500/30">
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-yellow-400">⭐ {repo.stargazers_count}</span>
                  <span className="text-cyan-400">{repo.language}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-black/50 text-cyan-400 px-2 py-2 rounded-lg hover:bg-cyan-500 hover:text-black transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a
                    href={repo.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-black/50 text-cyan-400 px-2 py-2 rounded-lg hover:bg-cyan-500 hover:text-black transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                  <button
                    onClick={() => setSelectedRepo(repo)}
                    className="flex items-center justify-center bg-black/50 text-cyan-400 px-2 py-2 rounded-lg hover:bg-cyan-500 hover:text-black transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedRepo && (
        <AIChat 
          repository={selectedRepo}
          onClose={() => setSelectedRepo(null)}
        />
      )}
    </div>
  );
};

export default Products;