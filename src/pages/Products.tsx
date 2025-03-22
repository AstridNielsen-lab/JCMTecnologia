import React, { useEffect, useState } from 'react';
import { Octokit } from 'octokit';
import AIChat from '../components/AIChat';

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  topics: string[];
}

const Products = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
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
        setRepos(response.data);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Nossos Produtos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {repos.map((repo) => (
            <div key={repo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{repo.name}</h3>
                <p className="text-gray-600 mb-4">{repo.description || 'No description available'}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {repo.topics.map((topic) => (
                    <span key={topic} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors text-center"
                  >
                    Ver no GitHub
                  </a>
                  <button
                    onClick={() => setSelectedRepo(repo)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Saiba Mais
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