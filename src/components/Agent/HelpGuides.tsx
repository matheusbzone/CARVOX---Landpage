import { BookOpen, FileWarning, HelpCircle, ShieldAlert } from "lucide-react";

interface HelpGuidesProps {
  onSelectQuestion: (question: string) => void;
  isActive: boolean;
}

export function HelpGuides({ onSelectQuestion, isActive }: HelpGuidesProps) {
  const commonQuestions = [
    {
      title: "Reserva Legal com pendência",
      desc: "O que fazer quando acusa pendência de Reserva Legal?",
      prompt: "Meu CAR está com pendência de Reserva Legal. O que isso significa e quais documentos preciso para corrigir?",
    },
    {
      title: "Diferença APP vs Reserva Legal",
      desc: "Qual a diferença prática no Código Florestal?",
      prompt: "Explique de forma simples para um produtor rural a diferença entre Área de Preservação Permanente (APP) e Reserva Legal.",
    },
    {
      title: "Sobreposição de áreas",
      desc: "Como resolver cruzamento de limites de terra?",
      prompt: "Recebi um aviso de sobreposição de área no meu CAR com um vizinho. Como posso resolver isso de forma amigável e técnica?",
    },
    {
      title: "Como retificar o CAR",
      desc: "Passo a passo para enviar correções",
      prompt: "Quais são os passos gerais para fazer a retificação do Cadastro Ambiental Rural (CAR) após receber uma notificação?",
    },
    {
      title: "Documentação do Imóvel",
      desc: "O que é exigido para regularização?",
      prompt: "Quais são os documentos básicos exigidos para fazer a inscrição e regularização ambiental de um imóvel rural no CAR?",
    },
    {
      title: "Como funciona o PRA",
      desc: "Programa de Regularização Ambiental",
      prompt: "O que é o PRA (Programa de Regularização Ambiental) e como o produtor rural se beneficia dele para regularizar passivos?",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Disclaimer Card */}
      <div className="bg-[#1C150B] border border-amber-500/25 rounded-xl p-4 flex gap-3 text-amber-200/90 text-xs shadow-lg shadow-black/20">
        <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold font-sans">Orientação Informativa e Educativa</p>
          <p className="font-sans leading-relaxed text-gray-300">
            As respostas fornecidas pelo AgroCAR IA são simulações informativas baseadas na legislação ambiental brasileira (Lei nº 12.651/2012). Elas <strong>não substituem</strong> pareceres jurídicos de advogados, laudos técnicos de engenheiros responsáveis ou decisões de órgãos ambientais oficiais (como IBAMA, SEMA, etc.).
          </p>
        </div>
      </div>

      {/* Topics header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[#66BB6A] font-sans font-medium text-sm">
          <HelpCircle size={18} />
          <span>Perguntas Frequentes do Produtor</span>
        </div>
        <p className="text-xs text-gray-400 font-sans leading-relaxed">
          {isActive
            ? "Toque em uma pergunta abaixo para enviá-la ao AgroCAR IA diretamente por texto:"
            : "Inicie o atendimento por voz no botão abaixo ou clique em um tema para ler ideias de como iniciar a conversa:"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {commonQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuestion(q.prompt)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-300 text-xs flex flex-col justify-between ${
                isActive
                  ? "bg-[#1E1E1E] border-white/10 hover:border-[#66BB6A] text-white hover:shadow-[0_0_15px_rgba(102,187,106,0.15)] cursor-pointer"
                  : "bg-[#151515] border-white/5 opacity-65 hover:opacity-100 text-gray-300 hover:border-white/10 cursor-pointer"
              }`}
            >
              <div className="font-sans font-medium text-[#66BB6A] mb-1 flex items-center gap-1.5">
                <BookOpen size={13} className="shrink-0" />
                <span>{q.title}</span>
              </div>
              <p className="font-sans text-gray-400 leading-relaxed">{q.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Guidelines Accordion */}
      <div className="bg-[#1B5E20]/15 rounded-xl p-4 border border-[#2E7D32]/30 space-y-3">
        <div className="flex items-center gap-2 text-[#66BB6A] font-semibold text-xs uppercase tracking-wider font-sans">
          <FileWarning size={14} />
          <span>Legislação & Práticas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-gray-300 font-sans leading-relaxed">
          <div className="bg-[#121212]/50 p-2.5 rounded-lg border border-white/5">
            <span className="font-semibold block text-[#66BB6A] mb-1">Inscrição no CAR</span>
            Obrigatoriedade nacional para todos os imóveis rurais. Base para monitoramento de desmatamento ilegal e planejamento.
          </div>
          <div className="bg-[#121212]/50 p-2.5 rounded-lg border border-white/5">
            <span className="font-semibold block text-[#66BB6A] mb-1">Código Florestal (12.651)</span>
            Regula a porcentagem exigida de vegetação nativa mantida (Reserva Legal) e a proteção das beiras de rio (APP).
          </div>
        </div>
      </div>
    </div>
  );
}
