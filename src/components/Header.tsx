import React from "react";
import { Search, Globe, Eye, Info, Landmark, HelpCircle, ArrowLeft } from "lucide-react";

interface HeaderProps {
  onGoHome: () => void;
  currentView: string;
}

export default function Header({ onGoHome, currentView }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      {/* gov.br official black/blue top utility bar */}
      <div className="w-full bg-[#0C326F] text-white py-3 px-4 md:px-10 flex flex-wrap justify-between items-center text-xs font-semibold">
        <div className="flex items-center space-x-6">
          <button 
            onClick={onGoHome}
            className="flex items-center space-x-1 hover:opacity-80 transition-opacity focus:outline-none"
            aria-label="gov.br"
          >
            <img 
              src="https://i.ibb.co/21mKxLX2/Gov-br-logo-svg.webp" 
              alt="Logo gov.br" 
              className="h-8 md:h-10 object-contain"
            />
          </button>
          
          <nav className="hidden lg:flex items-center space-x-4 text-[11px] text-gray-200">
            <a href="#acesso-info" className="hover:underline flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Acesso à Informação
            </a>
            <a href="#part-social" className="hover:underline flex items-center gap-1">
              Participação Social
            </a>
            <a href="#legislacao" className="hover:underline flex items-center gap-1">
              Legislação
            </a>
            <a href="#orgaos" className="hover:underline flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5" /> Órgãos do Governo
            </a>
          </nav>
        </div>

        <div className="flex items-center space-x-4 text-gray-200 mt-1 sm:mt-0">
          <button className="hover:text-white flex items-center gap-1" title="Acessibilidade">
            <Eye className="w-4 h-4" />
            <span className="hidden md:inline">Acessibilidade</span>
          </button>
          <button className="hover:text-white" title="Idioma">
            <Globe className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-blue-500 hidden md:block"></div>
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Buscar no portal..." 
              className="bg-blue-900/30 text-white placeholder-gray-300 text-xs rounded-md pl-3 pr-8 py-1 focus:outline-none focus:ring-1 focus:ring-white border border-transparent focus:border-white w-48"
            />
            <Search className="w-3.5 h-3.5 text-gray-300 absolute right-2.5 top-1.5" />
          </div>
        </div>
      </div>

      {/* Main CAR Branding Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4 cursor-pointer" onClick={onGoHome}>
          {/* Logo with abstract environment icon */}
          <div className="bg-gov-blue text-white p-3 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8L18 20H6L12 8Z" fill="currentColor" opacity="0.3"/>
              <circle cx="12" cy="14" r="2" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black font-heading text-gov-blue tracking-tight uppercase">
              CAR
            </h1>
            <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider font-sans">
              Cadastro Ambiental Rural
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {currentView !== "home" && (
            <button
              onClick={onGoHome}
              className="flex items-center space-x-2 text-xs font-bold text-gov-blue bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </button>
          )}
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md px-3 py-1.5 flex items-center space-x-2 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sistema Nacional de Cadastro Ambiental Rural</span>
          </div>
        </div>
      </div>
    </header>
  );
}
