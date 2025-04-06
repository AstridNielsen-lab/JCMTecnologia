import React, { useState, useEffect } from 'react';
import { Octokit } from 'octokit';
import AIChat from '../components/AIChat';
import { Search, Filter, ExternalLink, Globe } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  topics: string[];
  stargazers_count: number;
  language: string;
  example_links?: string[];
  website_url?: string;
  detected_technologies?: string[];
}

const Products = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [allTechnologies, setAllTechnologies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const extractLinks = (description: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return description.match(urlRegex) || [];
  };

  const detectTechnologies = (description: string): string[] => {
    const techKeywords = [
      'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Django', 'Flask',
      'JavaScript', 'TypeScript', 'PHP', 'Laravel', 'Ruby', 'Rails',
      'Java', 'Spring', 'C#', '.NET', 'Go', 'Rust', 'Swift',
      'Kotlin', 'Android', 'iOS', 'Docker', 'Kubernetes', 'AWS',
      'Azure', 'GraphQL', 'REST', 'MongoDB', 'PostgreSQL', 'MySQL',
      'Redis', 'WebSocket', 'WebRTC', 'TensorFlow', 'PyTorch',
      'Machine Learning', 'AI', 'Blockchain', 'Smart Contract',
      'Solidity', 'Web3', 'Unity', 'Game Development'
    ];

    const detected = new Set<string>();
    const descLower = description.toLowerCase();

    techKeywords.forEach(tech => {
      if (descLower.includes(tech.toLowerCase())) {
        detected.add(tech);
      }
    });

    return Array.from(detected);
  };

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

        const repos = response.data.map(repo => {
          const description = repo.description || 'Sem descrição disponível';
          const links = extractLinks(description);
          const website_url = repo.homepage || links[0];
          const detected_technologies = detectTechnologies(description);
          
          return {
            id: repo.id,
            name: repo.name,
            description: description,
            html_url: repo.html_url,
            topics: repo.topics,
            stargazers_count: repo.stargazers_count,
            language: repo.language || 'Não especificada',
            example_links: links,
            website_url,
            detected_technologies
          };
        });

        // Extract unique technologies from all sources
        const technologies = new Set<string>();
        repos.forEach(repo => {
          if (repo.language) technologies.add(repo.language);
          repo.topics.forEach(topic => technologies.add(topic));
          repo.detected_technologies?.forEach(tech => technologies.add(tech));
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
        repo.language === tech ||
        repo.detected_technologies?.includes(tech)
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-black">Projetos</h1>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-black h-5 w-5" />
              <span className="text-black font-medium">Filtrar por:</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {allTechnologies.map(tech => (
              <button
                key={tech}
                onClick={() => toggleTechnology(tech)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTechnologies.includes(tech)
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRepositories.map((repo) => (
            <div key={repo.id} className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-black">{repo.name}</h3>
                <p className="text-gray-600 mb-4 h-20 overflow-hidden">{repo.description}</p>
                
                {repo.example_links && repo.example_links.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Exemplos:</p>
                    <div className="space-y-2">
                      {repo.example_links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Demo {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    ...new Set([
                      ...repo.topics,
                      repo.language,
                      ...(repo.detected_technologies || [])
                    ])
                  ].filter(Boolean).map((tech) => (
                    <span key={tech} className="px-2 py-1 bg-gray-100 text-black rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">⭐ {repo.stargazers_count}</span>
                  <span className="text-gray-600">{repo.language}</span>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-center"
                    >
                      Ver no GitHub
                    </a>
                    <button
                      onClick={() => setSelectedRepo(repo)}
                      className="flex-1 border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Saiba Mais
                    </button>
                  </div>
                  
                  {repo.website_url && (
                    <a
                      href={repo.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 py-2 px-4 border border-blue-600 rounded-lg transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Ver Site</span>
                    </a>
                  )}
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