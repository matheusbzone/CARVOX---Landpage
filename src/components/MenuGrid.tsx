import React from "react";
import { 
  Info, 
  Download, 
  Upload, 
  FileCheck, 
  UserSquare2, 
  Search, 
  HelpCircle, 
  Mail 
} from "lucide-react";

interface MenuGridProps {
  onSelectView: (view: string) => void;
  activeView: string;
}

export default function MenuGrid({ onSelectView, activeView }: MenuGridProps) {
  const menuItems = [
    {
      id: "sobre",
      title: "SOBRE O CAR",
      icon: Info,
      description: "Entenda o que é o Cadastro Ambiental Rural, sua base legal e finalidades.",
    },
    {
      id: "cadastro",
      title: "ACESSE O MÓDULO DE CADASTRO",
      icon: Download,
      description: "Baixe o aplicativo off-line ou preencha a declaração diretamente pela internet.",
    },
    {
      id: "envio",
      title: "ENVIE SEU CAR",
      icon: Upload,
      description: "Faça o envio do arquivo (.car) gerado no módulo de cadastro para o sistema federal.",
    },
    {
      id: "retificacao",
      title: "RETIFIQUE SEU CAR",
      icon: FileCheck,
      description: "Corrija ou atualize as informações declaradas do seu imóvel rural.",
    },
    {
      id: "proprietario",
      title: "CENTRAL DO PROPRIETÁRIO/POSSUIDOR",
      icon: UserSquare2,
      description: "Acesse a área logada para acompanhar notificações, retificar ou enviar documentos.",
    },
    {
      id: "consulta",
      title: "CONSULTE UM CAR",
      icon: Search,
      description: "Pesquise a situação de cadastros rurais e visualize demonstrativos públicos.",
    },
    {
      id: "faq",
      title: "TIRE SUAS DÚVIDAS",
      icon: HelpCircle,
      description: "Consulte perguntas frequentes sobre o preenchimento, legislação e prazos do CAR.",
    },
    {
      id: "contato",
      title: "ENTRE EM CONTATO",
      icon: Mail,
      description: "Fale com nosso suporte ou tire dúvidas em tempo real com o Assistente Virtual.",
    }
  ];

  return (
    <div className="w-full py-6">
      {/* Informational Browser Banner matching original screen */}
      <div className="bg-slate-100 border-l-4 border-gov-blue text-xs text-gray-600 p-4 mb-8 flex items-center space-x-3 rounded-r-md">
        <Info className="w-5 h-5 text-gov-blue shrink-0" />
        <span>
          Para melhor visualização, recomenda-se o uso nos navegadores: Google Chrome, Mozilla Firefox ou Microsoft Edge - versão atualizada.
        </span>
      </div>

      {/* 4-column Square Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center p-6 bg-white border rounded-lg text-center transition-all cursor-pointer aspect-square focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                isActive 
                  ? "border-gov-blue bg-blue-50/50 ring-2 ring-gov-blue/20" 
                  : "border-gray-200 hover:border-gov-blue hover:shadow-md hover:translate-y-[-2px]"
              }`}
              id={`card-${item.id}`}
            >
              <div className={`p-4 rounded-full mb-4 flex items-center justify-center ${
                isActive ? "bg-gov-blue text-white" : "bg-blue-50 text-gov-blue"
              }`}>
                <Icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-sm md:text-base font-bold font-heading text-slate-800 uppercase tracking-tight leading-tight px-2">
                {item.title}
              </h3>
              
              <p className="text-xs text-gray-500 mt-3 px-2 line-clamp-3 hidden sm:block">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
