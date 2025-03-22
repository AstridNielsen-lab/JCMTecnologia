import React from 'react';

const About = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1492551557933-34265f7af79e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
              alt="DISPARAT TECHNO Team"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-6">Sobre a DISPARAT TECHNO</h1>
            <div className="prose max-w-none">
              <p className="text-lg mb-4">
                A DISPARAT TECHNO é uma comunidade dedicada à inovação e desenvolvimento tecnológico.
                Nossa missão é criar soluções que impactam positivamente a vida das pessoas através
                da tecnologia.
              </p>
              <p className="text-lg mb-4">
                Trabalhamos com as mais recentes tecnologias e metodologias de desenvolvimento,
                sempre buscando excelência e qualidade em nossos produtos.
              </p>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Nossa Visão</h2>
              <p className="text-lg mb-4">
                Ser referência em inovação tecnológica, desenvolvendo soluções que transformam
                o futuro e inspiram novas gerações de desenvolvedores.
              </p>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Nossos Valores</h2>
              <ul className="list-disc list-inside text-lg mb-4">
                <li>Inovação constante</li>
                <li>Qualidade em primeiro lugar</li>
                <li>Colaboração e comunidade</li>
                <li>Transparência e código aberto</li>
                <li>Impacto social positivo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;