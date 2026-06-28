import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, ShieldCheck, Landmark, CheckCircle2, AlertTriangle, FileUp, LogOut, Check } from "lucide-react";
import { Property } from "../types";

interface OwnerCenterProps {
  properties: Property[];
  onUpdateProperty: (updatedProperty: Property) => void;
}

export default function OwnerCenter({ properties, onUpdateProperty }: OwnerCenterProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Resolution states
  const [resolvingPropId, setResolvingPropId] = useState<string | null>(null);
  const [uploadedDocName, setUploadedDocName] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Filter properties belonging to CPF: 123.456.789-00
  const ownerCpf = "123.456.789-00";
  const myProperties = properties.filter(p => p.ownerCpf === ownerCpf);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (cpf.replace(/\D/g, "") === "12345678900") {
      setIsLoggedIn(true);
    } else {
      alert("Acesso restrito. Para simular a área restrita do proprietário, por favor digite o CPF: 123.456.789-00");
    }
  };

  const startResolution = (propId: string) => {
    setResolvingPropId(propId);
    setUploadedDocName("");
  };

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingPropId) return;

    setIsResolving(true);
    setTimeout(() => {
      setIsResolving(false);
      
      // Retrieve the property and update status to Ativo since document is provided
      const propToUpdate = properties.find(p => p.id === resolvingPropId);
      if (propToUpdate) {
        const updated: Property = {
          ...propToUpdate,
          status: "Ativo",
          notifications: [] // clear notifications
        };
        onUpdateProperty(updated);
      }
      setResolvingPropId(null);
      alert("Comprovante de posse enviado com sucesso! A análise técnica foi concluída e a pendência foi regularizada.");
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCpf("");
    setPassword("");
    setResolvingPropId(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
        <div>
          <span className="text-gov-blue text-xs font-bold uppercase tracking-widest font-mono">
            Área Restrita do Cidadão
          </span>
          <h2 className="text-xl md:text-2xl font-black font-heading text-slate-800 mt-1 uppercase">
            Central do Proprietário / Possuidor
          </h2>
        </div>
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-1.5 rounded-md flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Sistema</span>
          </button>
        )}
      </div>

      {!isLoggedIn ? (
        /* Gov.br Login Container */
        <div className="max-w-md mx-auto my-4 border border-gray-200 shadow-lg rounded-xl overflow-hidden bg-white">
          {/* Official Gov.br Silver Header */}
          <div className="bg-[#f2f5f7] border-b border-gray-200 p-4 flex justify-between items-center">
            <span className="text-sm tracking-tighter bg-[#0C326F] text-white px-2.5 py-1 rounded font-black font-heading">
              gov.br
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" /> Identidade Digital Única
            </span>
          </div>

          <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-5">
            <div className="text-center pb-2">
              <h3 className="font-extrabold text-slate-800 text-sm md:text-base">Acesse sua conta gov.br</h3>
              <p className="text-xs text-gray-400 mt-1">Cidadãos cadastrados no SICAR</p>
            </div>

            {/* Simulated Account instructions */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-800 leading-normal">
              <strong>Simulação de Acesso:</strong> Para entrar na central e gerenciar notificações ambientais pendentes, insira o CPF do proprietário de teste: 
              <div className="font-mono font-bold mt-1 text-xs select-all text-blue-900">123.456.789-00</div>
            </div>

            {/* CPF Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                CPF do Proprietário *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-white border border-slate-200 p-2.5 text-xs md:text-sm pl-10 rounded focus:border-gov-blue focus:outline-none"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Senha de Acesso *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 p-2.5 text-xs md:text-sm pl-10 pr-10 rounded focus:border-gov-blue focus:outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1351B4] hover:bg-[#0C326F] text-white text-xs font-extrabold rounded-md shadow transition-colors flex items-center justify-center space-x-1.5 uppercase tracking-wider"
            >
              <span>Entrar com gov.br</span>
            </button>

            <div className="text-center pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              <a href="#recuperar" className="hover:underline">Esqueci minha senha</a>
              <a href="#cadastro-gov" className="hover:underline">Criar conta gov.br</a>
            </div>
          </form>
        </div>
      ) : (
        /* Logged In Dashboard Dashboard */
        <div className="space-y-8">
          {/* Welcome User Banner */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">José da Silva Santos</h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">CPF: 123.456.789-00 • Conta Ouro</p>
            </div>
            <div className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-md text-[11px] font-bold flex items-center space-x-1.5">
              <Check className="w-4 h-4" />
              <span>Assinatura Digital SICAR Pronta</span>
            </div>
          </div>

          {/* Properties Lists */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Meus Imóveis Cadastrados</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProperties.map((prop) => (
                <div key={prop.id} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:border-gov-blue transition-colors">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h5 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{prop.name}</h5>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                        prop.status === "Ativo"
                          ? "bg-emerald-100 text-emerald-800"
                          : prop.status === "Pendente"
                            ? "bg-red-100 text-red-800 animate-pulse"
                            : "bg-amber-100 text-amber-800"
                      }`}>
                        {prop.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-1 select-all">{prop.protocol}</div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded">
                      <div>
                        <span className="text-gray-400 block text-[9px] font-bold uppercase">Área Total</span>
                        <span className="font-bold">{prop.areaHa} ha</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] font-bold uppercase">APP</span>
                        <span className="font-bold">{prop.appAreaHa} ha</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] font-bold uppercase">Reserva Legal</span>
                        <span className="font-bold">{prop.legalReserveHa} ha</span>
                      </div>
                    </div>

                    {/* Pending Notifications check */}
                    {prop.notifications.length > 0 && (
                      <div className="mt-4 p-3.5 bg-red-50 border border-red-100 rounded-lg space-y-2">
                        <h6 className="text-[11px] font-bold text-red-800 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Pendência Detectada pelo Analista:
                        </h6>
                        <ul className="list-disc pl-4 space-y-1 text-[10px] text-red-700">
                          {prop.notifications.map((notif, idx) => (
                            <li key={idx}>{notif}</li>
                          ))}
                        </ul>
                        {resolvingPropId !== prop.id && (
                          <button
                            onClick={() => startResolution(prop.id)}
                            className="mt-2 w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded transition-colors uppercase tracking-wider"
                          >
                            Anexar Documentação Solicitada
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Attachment Form inside card */}
                  {resolvingPropId === prop.id && (
                    <form onSubmit={handleDocumentSubmit} className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                      <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Envio de Comprovação de Posse</div>
                      <div>
                        <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-1">
                          Selecione o documento comprobatório (Escritura ou Contrato)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            required
                            placeholder="Selecione ou digite o nome do arquivo"
                            value={uploadedDocName}
                            onChange={(e) => setUploadedDocName(e.target.value)}
                            className="w-full bg-white border border-gray-300 p-1.5 text-xs rounded focus:outline-none focus:border-gov-blue"
                          />
                          <button
                            type="button"
                            onClick={() => setUploadedDocName("escritura_imovel_recanto_verde_assinado.pdf")}
                            className="p-2 bg-white hover:bg-gray-100 border border-gray-300 rounded text-gray-500"
                            title="Simular anexo de arquivo"
                          >
                            <FileUp className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setResolvingPropId(null)}
                          className="px-2.5 py-1 text-[9px] font-semibold text-gray-500 bg-white border border-gray-300 rounded"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isResolving || !uploadedDocName}
                          className="px-3 py-1 bg-gov-blue hover:bg-gov-blue-dark text-white font-bold text-[9px] rounded transition-colors"
                        >
                          {isResolving ? "Enviando..." : "Enviar Documento"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
