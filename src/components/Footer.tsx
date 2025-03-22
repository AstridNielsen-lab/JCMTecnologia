import React from 'react';
import { GithubIcon, InstagramIcon, FacebookIcon, PhoneCall, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">JCM Tecnologia</h3>
            <p className="text-gray-400 mb-4">
              Hub de inovação especializado em desenvolvimento de software, IA e soluções tecnológicas.
              Mais de 187 projetos open-source disponíveis.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/AstridNielsen-lab" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <GithubIcon className="h-6 w-6" />
              </a>
              <a href="https://likelook.wixsite.com/solutions" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="https://likelook.wixsite.com/solutions" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FacebookIcon className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <a href="tel:+5511992946628" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <PhoneCall className="h-5 w-5" />
                <span>(11) 99294-6628</span>
              </a>
              <a href="mailto:juliocamposmachado@gmail.com" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
                <span>juliocamposmachado@gmail.com</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-semibold mb-4">Empresa</h4>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                <span>Like Look Solutions - Soluções Tecnológicas</span>
              </p>
              <a href="https://likelook.wixsite.com/solutions" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Visite nosso site
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} JCM Tecnologia. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;