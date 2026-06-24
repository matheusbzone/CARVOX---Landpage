import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Search, Info } from "lucide-react";
import { FaqItem } from "../types";

interface FAQProps {
  faqs: FaqItem[];
}

export default function FAQ({ faqs }: FAQProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const categories = ["Todos", "Geral", "Inscrição", "Reserva Legal", "Retificação", "Módulo"];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "Todos" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <span className="text-gov-blue text-xs font-bold uppercase tracking-widest font-mono">
          SICAR - Central de Ajuda
        </span>
        <h2 className="text-xl md:text-2xl font-black font-heading text-slate-800 mt-1 uppercase">
          Perguntas Frequentes - FAQ
        </h2>
      </div>

      <div className="space-y-6">
        <p className="text-sm text-gray-600 leading-normal">
          Consulte respostas oficiais sobre as regras do Cadastro Ambiental Rural, prazos vigentes, regras estaduais de Reserva Legal e suporte ao preenchimento do módulo off-line.
        </p>

        {/* Search and Category filters layout */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite palavras-chave da sua dúvida..."
              className="w-full bg-white border border-slate-200 p-2.5 text-xs md:text-sm pl-10 rounded focus:border-gov-blue focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Horizontal Category Pill Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-gray-100 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setExpandedFaqId(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  selectedCategory === cat
                    ? "bg-gov-blue text-white shadow-sm"
                    : "text-gray-500 hover:text-slate-800 bg-slate-50 border border-slate-100 hover:border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filtered FAQs listings */}
        <div className="space-y-3.5 pt-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              
              return (
                <div 
                  key={faq.id}
                  className={`border rounded-lg overflow-hidden transition-colors ${
                    isExpanded ? "border-gov-blue bg-blue-50/10" : "border-slate-200 bg-white hover:bg-slate-50/40"
                  }`}
                >
                  {/* Clickable Question bar */}
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full text-left p-4 flex justify-between items-center gap-4 text-xs md:text-sm font-bold text-slate-800 hover:text-gov-blue transition-colors focus:outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <span className="bg-blue-100 text-gov-blue text-[9px] px-2 py-0.5 rounded uppercase font-extrabold font-mono tracking-wider">
                        {faq.category}
                      </span>
                      <span>{faq.question}</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>

                  {/* Expandable answer container */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-gray-400 text-center flex items-center justify-center space-x-2">
              <Info className="w-4 h-4" />
              <span>Nenhuma pergunta localizada com estes termos de busca.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
