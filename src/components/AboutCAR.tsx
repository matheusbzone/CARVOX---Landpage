import React, { useState } from "react";
import { Scale, Milestone, TreePine, ShieldCheck, PlayCircle, BookOpen, Layers } from "lucide-react";

export default function AboutCAR() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "1. Inscrição e Envio",
      desc: "O proprietário realiza o georreferenciamento do imóvel no Módulo Off-line ou Web e envia a declaração no portal. É gerado o recibo de inscrição federal.",
      details: "A inscrição é o primeiro passo obrigatório e possibilita o acesso imediato ao crédito rural de forma prévia. O declarante deve apontar as benfeitorias, rios, matas ciliares (APP) e vegetação nativa do imóvel."
    },
    {
      title: "2. Análise do Cadastro",
      desc: "O órgão estadual ambiental realiza a validação das áreas declaradas usando imagens de satélite de alta resolução para verificar eventuais sobreposições ou inconsistências.",
      details: "Durante a análise, os técnicos estaduais cruzam as coordenadas com bases geográficas oficiais de terras indígenas, unidades de conservação e assentamentos para validar a legalidade ecológica do imóvel."
    },
    {
      title: "3. Regularização (PRA)",
      desc: "Se houver passivos ambientais (déficits de Reserva Legal ou APP), o produtor é convocado a aderir ao Programa de Regularização Ambiental (PRA) para recuperar as áreas.",
      details: "A adesão ao PRA suspende multas históricas de desmatamento e dá ao proprietário prazos de até 20 anos para recompor a vegetação nativa do seu imóvel rural, promovendo a sustentabilidade produtiva."
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <span className="text-gov-blue text-xs font-bold uppercase tracking-widest font-mono">
          Portal Informativo
        </span>
        <h2 className="text-xl md:text-2xl font-black font-heading text-slate-800 mt-1 uppercase">
          Sobre o CAR
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Core Description (Left column) */}
        <div className="lg:col-span-7 space-y-6 text-gray-600 text-sm leading-relaxed">
          <p className="text-base text-gray-700 font-medium">
            O <strong>Cadastro Ambiental Rural (CAR)</strong> é um registro público eletrônico de âmbito nacional, obrigatório para todos os imóveis rurais, instituído pelo Código Florestal Brasileiro (Lei nº 12.651, de 25 de maio de 2012).
          </p>
          <p>
            Sua finalidade principal é integrar as informações ambientais das propriedades e posses rurais, compondo uma poderosa base de dados georreferenciada para controle, monitoramento, planejamento ambiental e combate ao desmatamento ilegal em todo o território nacional.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="flex space-x-3 p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <Scale className="w-8 h-8 text-gov-blue shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">
                  Respeito à Legislação
                </h4>
                <p className="text-[11px] text-gray-500">
                  Instituído pela Lei Federal nº 12.651/12, garantindo a integridade ecológica do país.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <Layers className="w-8 h-8 text-emerald-700 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">
                  Mapeamento Preciso
                </h4>
                <p className="text-[11px] text-gray-500">
                  Utiliza vetorização geográfica e georreferenciamento para delimitar matas e rios de forma inequívoca.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5">
            <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" /> Benefícios do Cadastro Ativo
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-emerald-800">
              <li>Segurança jurídica para a exploração agropecuária no imóvel.</li>
              <li>Acesso a linhas de crédito agrícola facilitado com menores taxas de juros.</li>
              <li>Isenção de impostos para insumos de recuperação florestal.</li>
              <li>Suspensão de sanções e multas por desmatamento cometidos antes de 2008, condicionado à regularização.</li>
              <li>Simplificação do processo de licenciamento ambiental das atividades produtivas.</li>
            </ul>
          </div>
        </div>

        {/* Dynamic Pipeline Interactive Section (Right column) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Milestone className="w-5 h-5 text-gov-blue" /> Fluxo do Cadastro Rural
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Clique em cada etapa para entender o ciclo de vida do cadastro do imóvel rural do início à conformidade total.
          </p>

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-4 rounded-lg border transition-all focus:outline-none ${
                  activeStep === idx 
                    ? "bg-white border-gov-blue shadow-sm ring-1 ring-gov-blue/15" 
                    : "bg-white/60 border-slate-200 hover:bg-white"
                }`}
              >
                <h4 className={`text-xs font-bold uppercase tracking-wider ${
                  activeStep === idx ? "text-gov-blue" : "text-slate-700"
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {step.desc}
                </p>

                {activeStep === idx && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded">
                    <strong>Impacto Prático:</strong> {step.details}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-400 font-medium">
              Serviço Florestal Brasileiro (SFB) / Ministério do Meio Ambiente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
