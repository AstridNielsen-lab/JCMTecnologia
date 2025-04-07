import React from 'react';
import {
  Wrench,
  MessageSquare,
  Store,
  Share2,
  Palette,
  FileText,
  Languages,
  Bot,
  ShoppingBag,
  Users,
  Globe
} from 'lucide-react';

const Toolbox = () => {
  const toolboxLinks = {
    creation: [
      { name: 'WhatsApp Web', url: 'https://web.whatsapp.com', icon: MessageSquare },
      { name: 'Canva', url: 'https://www.canva.com/projects', icon: Palette },
      { name: 'Google Docs', url: 'https://docs.google.com/document/u/0/', icon: FileText },
      { name: 'Google Translate', url: 'https://translate.google.com.br/', icon: Languages },
      { name: 'ChatGPT', url: 'https://chatgpt.com/', icon: Bot },
      { name: 'DeepSeek', url: 'https://chat.deepseek.com/', icon: Bot },
      { name: 'Copilot', url: 'https://copilot.microsoft.com/', icon: Bot },
    ],
    store: [
      { name: 'Adega Radio Tatuapé', url: 'https://www.ifood.com.br/delivery/sao-paulo-sp/adega-radio-tatuape-fm-24-horas-vila-regente-feijo/29aa6191-cf23-4569-a8c3-d7bd66d877b5', icon: ShoppingBag },
      { name: 'iFood Portal', url: 'https://portal.ifood.com.br/home', icon: Store },
      { name: 'GitHub', url: 'https://github.com/AstridNielsen-lab', icon: Globe },
    ],
    social: [
      { name: 'Twitter', url: 'https://x.com/JulioScouter', icon: Share2 },
      { name: 'Facebook', url: 'https://www.facebook.com/likelookadega/', icon: Users },
      { name: 'Instagram', url: 'https://www.instagram.com/radiotatuapefm/', icon: Share2 },
      { name: 'Threads', url: 'https://www.threads.net/@radiotatuapefm', icon: Share2 },
    ]
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-surface-dark border border-primary/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary text-lg font-bold">Toolbox</h3>
        <Wrench className="text-primary h-5 w-5" />
      </div>
      
      {/* Creation Tools */}
      <div className="mb-6">
        <h4 className="text-primary/80 text-sm font-medium mb-3">Creation Tools</h4>
        <div className="grid grid-cols-2 gap-2">
          {toolboxLinks.creation.map((link, index) => (
            <button
              key={index}
              onClick={() => handleLinkClick(link.url)}
              className="w-full flex items-center justify-center space-x-2 bg-surface/50 text-primary p-2 rounded-lg hover:bg-primary/20 transition-all duration-300 border border-primary/30 group cursor-pointer z-10"
            >
              <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs truncate">{link.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Store Links */}
      <div className="mb-6">
        <h4 className="text-primary/80 text-sm font-medium mb-3">Store</h4>
        <div className="grid grid-cols-2 gap-2">
          {toolboxLinks.store.map((link, index) => (
            <button
              key={index}
              onClick={() => handleLinkClick(link.url)}
              className="w-full flex items-center justify-center space-x-2 bg-surface/50 text-primary p-2 rounded-lg hover:bg-primary/20 transition-all duration-300 border border-primary/30 group cursor-pointer z-10"
            >
              <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs truncate">{link.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Social Media */}
      <div>
        <h4 className="text-primary/80 text-sm font-medium mb-3">Social Media</h4>
        <div className="grid grid-cols-2 gap-2">
          {toolboxLinks.social.map((link, index) => (
            <button
              key={index}
              onClick={() => handleLinkClick(link.url)}
              className="w-full flex items-center justify-center space-x-2 bg-surface/50 text-primary p-2 rounded-lg hover:bg-primary/20 transition-all duration-300 border border-primary/30 group cursor-pointer z-10"
            >
              <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs truncate">{link.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbox;