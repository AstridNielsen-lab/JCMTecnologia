import React, { useState, useEffect } from 'react';
import { Octokit } from 'octokit';
import { Search, Filter, Globe, Github, MessageSquare, Cpu, GitFork, Star, ExternalLink } from 'lucide-react';

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
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="cyber-spinner">
          <div className="absolute inset-0 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-center text-primary text-glow mb-2">Projetos</h1>
          <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent box-glow" />
        </div>

        {/* Search and Filter Section */}
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
              <span className="text-primary font-medium">Filtrar por:</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {allTechnologies.map(tech => (
              <button
                key={tech}
                onClick={() => toggleTechnology(tech)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedTechnologies.includes(tech)
                    ? 'bg-primary text-surface-dark box-glow'
                    : 'bg-surface/50 text-primary border border-primary/30 hover:border-primary'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRepositories.map((repo) => (
            <div 
              key={repo.id} 
              className="hud-border rounded-lg overflow-hidden scanner group"
            >
              <div className="p-6">
                {/* Project Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-primary text-glow glitch" data-text={repo.name}>
                    {repo.name}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center text-accent">
                      <Star className="h-4 w-4 mr-1" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center text-primary">
                      <GitFork className="h-4 w-4 mr-1" />
                      {repo.language}
                    </span>
                  </div>
                </div>

                {/* Project Description */}
                <p className="text-primary/80 mb-4 h-20 overflow-hidden">{repo.description}</p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {repo.topics.map((topic) => (
                    <span 
                      key={topic}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm border border-primary/30"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-surface/50 text-primary p-3 rounded-lg hover:bg-primary hover:text-surface-dark transition-all duration-300 border border-primary/30 hover:border-primary group hover:box-glow"
                  >
                    <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href={repo.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-surface/50 text-primary p-3 rounded-lg hover:bg-primary hover:text-surface-dark transition-all duration-300 border border-primary/30 hover:border-primary group hover:box-glow"
                  >
                    <ExternalLink className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;