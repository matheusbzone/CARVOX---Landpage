import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, CloudDownload, Map, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BannerCarouselProps {
  onNavigateToView: (view: string) => void;
}

export default function BannerCarousel({ onNavigateToView }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      id: 1,
      type: "offline-update",
      bgColor: "bg-emerald-50 border-emerald-200",
      content: (
        <div className="flex flex-col md:flex-row items-center justify-between w-full p-6 md:p-8 gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-300">
              <AlertTriangle className="w-10 h-10 md:w-16 md:h-16 text-amber-600 animate-bounce" />
            </div>
            <div>
              <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Aviso Importante
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 mt-2 font-heading tracking-tight leading-tight">
                Atenção!
              </h2>
              <p className="text-sm md:text-lg font-medium text-slate-600 mt-1">
                Atualização obrigatória no módulo de cadastro off-line disponível.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigateToView("cadastro")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm md:text-base px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-emerald-500 shrink-0"
          >
            Saiba mais!
          </button>
        </div>
      )
    },
    {
      id: 2,
      type: "pra-deadline",
      bgColor: "bg-blue-50 border-blue-200",
      content: (
        <div className="flex flex-col md:flex-row items-center justify-between w-full p-6 md:p-8 gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-300">
              <CloudDownload className="w-10 h-10 md:w-16 md:h-16 text-blue-600" />
            </div>
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Adesão ao PRA
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 mt-2 font-heading tracking-tight leading-tight">
                Regularização Ambiental
              </h2>
              <p className="text-sm md:text-lg font-medium text-slate-600 mt-1">
                Aproveite os benefícios da suspensão de multas aderindo ao Programa de Regularização Ambiental.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigateToView("proprietario")}
            className="bg-gov-blue hover:bg-gov-blue-dark text-white font-bold text-sm md:text-base px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-all shrink-0"
          >
            Regularizar Imóvel
          </button>
        </div>
      )
    },
    {
      id: 3,
      type: "public-transparency",
      bgColor: "bg-[#f8fafc] border-slate-200",
      content: (
        <div className="flex flex-col md:flex-row items-center justify-between w-full p-6 md:p-8 gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-300">
              <Map className="w-10 h-10 md:w-16 md:h-16 text-slate-600" />
            </div>
            <div>
              <span className="bg-slate-200 text-slate-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Consulta Pública
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 mt-2 font-heading tracking-tight leading-tight">
                Consulta Centralizada
              </h2>
              <p className="text-sm md:text-lg font-medium text-slate-600 mt-1">
                Pesquise e extraia demonstrativos e relatórios de imóveis rurais diretamente do mapa do Brasil.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigateToView("consulta")}
            className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-sm md:text-base px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-all shrink-0"
          >
            Consultar Mapa
          </button>
        </div>
      )
    }
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full py-8 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <h2 className="text-center text-lg md:text-xl font-bold text-gray-700 mb-6 font-sans">
          Seja Bem-vindo!
        </h2>

        {/* Carousel Container */}
        <div className="relative group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Slides display */}
          <div className="relative min-h-[220px] md:min-h-[160px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`w-full ${slides[currentIndex].bgColor}`}
              >
                {slides[currentIndex].content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Left arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full border border-gray-300 shadow-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full border border-gray-300 shadow-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center space-x-2.5 mt-4">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all focus:outline-none ${
                idx === currentIndex ? "bg-gov-blue w-6" : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Ir para o slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
