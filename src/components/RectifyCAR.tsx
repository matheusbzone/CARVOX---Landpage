import React, { useState } from "react";
import { Search, PenTool, CheckCircle, FileWarning, HelpCircle, Save } from "lucide-react";
import { Property } from "../types";

interface RectifyCARProps {
  properties: Property[];
  onUpdateProperty: (updatedProperty: Property) => void;
}

export default function RectifyCAR({ properties, onUpdateProperty }: RectifyCARProps) {
  const [searchProtocol, setSearchProtocol] = useState("");
  const [foundProperty, setFoundProperty] = useState<Property | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Edit fields
  const [editedName, setEditedName] = useState("");
  const [editedArea, setEditedArea] = useState(0);
  const [editedApp, setEditedApp] = useState(0);
  const [editedReserve, setEditedReserve] = useState(0);
  const [justification, setJustification] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    
    const cleanSearch = searchProtocol.trim().toUpperCase();
    const match = properties.find(p => p.protocol.toUpperCase() === cleanSearch);

    if (match) {
      setFoundProperty(match);
      setEditedName(match.name);
      setEditedArea(match.areaHa);
      setEditedApp(match.appAreaHa);
      setEditedReserve(match.legalReserveHa);
      setJustification(match.justification || "");
    } else {
      setFoundProperty(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundProperty) return;

    if (!justification.trim()) {
      alert("Por favor insira uma justificativa oficial para esta retificação.");
      return;
    }

    const updated: Property = {
      ...foundProperty,
      name: editedName,
      areaHa: editedArea,
      appAreaHa: editedApp,
      legalReserveHa: editedReserve,
      justification: justification,
      status: "Retificado",
      submissionDate: new Date().toLocaleDateString("pt-BR") // Updated date
    };

    onUpdateProperty(updated);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setSearchProtocol("");
    setFoundProperty(null);
    setHasSearched(false);
    setIsSuccess(false);
    setJustification("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <span className="text-gov-blue text-xs font-bold uppercase tracking-widest font-mono">
          Retificação de Declarações
        </span>
        <h2 className="text-xl md:text-2xl font-black font-heading text-slate-800 mt-1 uppercase">
          Retifique seu CAR
        </h2>
      </div>

      {isSuccess ? (
        <div className="text-center py-10 space-y-6 max-w-md mx-auto">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Retificação Registrada!</h3>
            <p className="text-xs text-gray-500 mt-2">
              As alterações do imóvel foram homologadas no SICAR. O protocolo original foi mantido e o status foi atualizado para <strong>Retificado</strong>.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 text-xs font-bold text-white bg-gov-blue hover:bg-gov-blue-dark rounded transition-colors"
          >
            Fazer Nova Retificação
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Se houver necessidade de corrigir perímetros, titularidades de posse, ou cumprir determinações de órgãos estaduais, você deve retificar a declaração. Informe o número do recibo de inscrição original (protocolo) abaixo.
          </p>

          {!foundProperty && (
            <form onSubmit={handleSearch} className="max-w-md space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Número do Protocolo do CAR *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={searchProtocol}
                    onChange={(e) => setSearchProtocol(e.target.value)}
                    placeholder="Ex: BR-SP-3501608-F43A-8C21"
                    className="w-full bg-white border border-slate-200 p-2.5 text-xs md:text-sm font-semibold font-mono rounded pr-12 focus:border-gov-blue focus:outline-none uppercase"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3.5 bg-gov-blue text-white hover:bg-gov-blue-dark rounded flex items-center justify-center transition-colors"
                    title="Buscar cadastro"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {hasSearched && !foundProperty && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 text-red-800 text-xs">
                  <FileWarning className="w-5 h-5 shrink-0" />
                  <div>
                    <strong>Cadastro não localizado:</strong> Certifique-se de preencher o protocolo exatamente como consta em seu recibo. Exemplos válidos carregados no sistema:
                    <ul className="list-disc pl-4 mt-1 font-mono text-[10px] text-red-900 space-y-0.5">
                      <li>BR-SP-3501608-F43A-8C21</li>
                      <li>BR-MG-3118607-D832-2A1F</li>
                      <li>BR-PA-1501402-B12D-9E8F</li>
                    </ul>
                  </div>
                </div>
              )}
            </form>
          )}

          {foundProperty && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider">Imóvel Encontrado</span>
                  <span className="font-bold text-slate-800 text-sm">{foundProperty.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider">Protocolo de Registro</span>
                  <span className="font-mono font-bold text-slate-700">{foundProperty.protocol}</span>
                </div>
              </div>

              {/* Editing Fields Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome da Propriedade *
                  </label>
                  <input
                    type="text"
                    required
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Área Total do Imóvel (ha) *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={editedArea}
                    onChange={(e) => setEditedArea(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Área de APP (ha) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={editedApp}
                    onChange={(e) => setEditedApp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none text-emerald-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Área de Reserva Legal (ha) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={editedReserve}
                    onChange={(e) => setEditedReserve(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none text-amber-800 font-semibold"
                  />
                </div>
              </div>

              {/* Justification Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Justificativa Legal para Retificação *
                </label>
                <textarea
                  required
                  rows={4}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Ex: Correção das limites da Reserva Legal após vistoria de campo e ajuste de coordenadas com GPS de precisão."
                  className="w-full bg-white border border-slate-200 p-3 text-xs md:text-sm rounded focus:border-gov-blue focus:outline-none placeholder-gray-400"
                />
              </div>

              <div className="flex space-x-3 justify-end border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gov-blue text-white hover:bg-gov-blue-dark text-xs font-extrabold rounded shadow-md flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Retificação</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
