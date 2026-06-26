import React from "react";
import { Youtube, Facebook, Instagram, Twitter, HeartHandshake } from "lucide-react";

interface FooterProps {
  onNavigateToView: (view: string) => void;
}

export default function Footer({ onNavigateToView }: FooterProps) {
  return (
    <footer className="w-full bg-[#eeeeee] border-t border-gray-300 mt-12 text-xs text-slate-700">
      {/* Upper footer links columns */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Col 1 */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#0C326F] uppercase tracking-wider text-[11px]">
            Informações Gerais
          </h4>
          <ul className="space-y-1.5 font-semibold text-gray-600">
            <li>
              <button onClick={() => onNavigateToView("home")} className="hover:underline hover:text-gov-blue">
                Página Inicial
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateToView("faq")} className="hover:underline hover:text-gov-blue">
                Ajuda / Dúvidas
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateToView("sobre")} className="hover:underline hover:text-gov-blue">
                Sobre o CAR
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateToView("faq")} className="hover:underline hover:text-gov-blue">
                Central de Conteúdo
              </button>
            </li>
          </ul>
        </div>

        {/* Col 2 */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#0C326F] uppercase tracking-wider text-[11px]">
            Ações Frequentes
          </h4>
          <ul className="space-y-1.5 font-semibold text-gray-600">
            <li>
              <button onClick={() => onNavigateToView("proprietario")} className="hover:underline hover:text-gov-blue">
                Central do Proprietário
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateToView("cadastro")} className="hover:underline hover:text-gov-blue">
                Baixar Módulo CAR
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateToView("envio")} className="hover:underline hover:text-gov-blue">
                Enviar .CAR
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateToView("retificacao")} className="hover:underline hover:text-gov-blue">
                Retificar um CAR
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[#0C326F] uppercase tracking-wider text-[11px]">
            Atendimento
          </h4>
          <ul className="space-y-1.5 font-semibold text-gray-600">
            <li>
              <button onClick={() => onNavigateToView("contato")} className="hover:underline hover:text-gov-blue">
                Assistente Virtual
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateToView("faq")} className="hover:underline hover:text-gov-blue">
                Perguntas Frequentes
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateToView("contato")} className="hover:underline hover:text-gov-blue">
                Contatos dos Órgãos
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Social */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-[#0C326F] uppercase tracking-wider text-[11px]">
            Redes Sociais
          </h4>
          <div className="flex space-x-3 text-slate-500">
            <a href="#facebook" className="hover:text-gov-blue bg-white p-2 rounded-full border border-gray-300 shadow-sm" title="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#twitter" className="hover:text-gov-blue bg-white p-2 rounded-full border border-gray-300 shadow-sm" title="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#instagram" className="hover:text-gov-blue bg-white p-2 rounded-full border border-gray-300 shadow-sm" title="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#youtube" className="hover:text-gov-blue bg-white p-2 rounded-full border border-gray-300 shadow-sm" title="YouTube">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
          <div className="pt-2">
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Secretaria Executiva</span>
            <span className="font-semibold text-slate-600">Serviço Florestal Brasileiro</span>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Federal Copyright bar */}
      <div className="w-full bg-[#e1e1e1] border-t border-gray-300 py-6 px-4 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center text-[10px] md:text-xs font-semibold text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-black text-[#0C326F] tracking-tighter">CAR</span>
            <div className="h-4 w-px bg-gray-400"></div>
            <span>Cadastro Ambiental Rural</span>
          </div>
          
          <div>
            © 2026 Cadastro Ambiental Rural - Serviço Florestal Brasileiro. Todos os direitos reservados.
          </div>

          <div className="flex flex-wrap gap-4 justify-center text-[10px] text-slate-600">
            <button 
              onClick={() => onNavigateToView("contato")}
              className="hover:underline font-bold text-gov-blue flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-300"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>FALAR COM CONSULTOR</span>
            </button>
            <a href="#privacidade" className="hover:underline">Privacidade</a>
            <a href="#termos" className="hover:underline">Termos de Uso</a>
            <a href="#mapasite" className="hover:underline">Mapa do Site</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
