import React, { useState } from "react";
import { Search, Map, Eye, FileDown, ShieldAlert, BookOpen, Layers, CheckCircle } from "lucide-react";
import { Property } from "../types";

interface ConsultCARProps {
  properties: Property[];
}

export default function ConsultCAR({ properties }: ConsultCARProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setSelectedProperty(null);

    const cleanQuery = searchQuery.trim().toLowerCase();
    if (!cleanQuery) return;

    // Search by exact protocol match or owner CPF match
    const matches = properties.filter(p => 
      p.protocol.toLowerCase().includes(cleanQuery) || 
      p.ownerCpf.replace(/\D/g, "").includes(cleanQuery.replace(/\D/g, "")) ||
      p.name.toLowerCase().includes(cleanQuery) ||
      p.city.toLowerCase().includes(cleanQuery)
    );

    setSearchResults(matches);
    if (matches.length === 1) {
      setSelectedProperty(matches[0]);
    }
  };

  // Helper to obfuscate owner's name according to LGPD (Brazilian GDPR) guidelines
  const obfuscateName = (name: string) => {
    const parts = name.split(" ");
    return parts.map((p, i) => {
      if (i === 0) return p;
      if (p.length <= 2) return p;
      return p.charAt(0) + "•".repeat(p.length - 1);
    }).join(" ");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <span className="text-gov-blue text-xs font-bold uppercase tracking-widest font-mono">
          SICAR - Consulta Pública Nacional
        </span>
        <h2 className="text-xl md:text-2xl font-black font-heading text-slate-800 mt-1 uppercase">
          Consulte um CAR
        </h2>
      </div>

      <div className="space-y-6">
        <p className="text-sm text-gray-600 leading-normal">
          Pesquise a situação cadastral, áreas de reserva ecológica, e emita o demonstrativo simplificado de qualquer imóvel rural cadastrado no Brasil. Você pode buscar por <strong>Nome do Imóvel</strong>, <strong>Município</strong>, <strong>Protocolo</strong> ou <strong>CPF do Proprietário</strong>.
        </p>

        {/* Public Search Bar Form */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o protocolo, CPF, município ou nome do imóvel..."
              className="w-full bg-white border border-slate-200 p-2.5 text-xs md:text-sm pl-10 rounded focus:border-gov-blue focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            className="px-5 bg-gov-blue hover:bg-gov-blue-dark text-white text-xs font-bold rounded flex items-center justify-center space-x-1.5 shrink-0 transition-colors"
          >
            <span>Buscar</span>
          </button>
        </form>

        {/* Results Listings */}
        {hasSearched && !selectedProperty && searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Imóveis Localizados ({searchResults.length})</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
              {searchResults.map((prop) => (
                <div 
                  key={prop.id} 
                  onClick={() => setSelectedProperty(prop)}
                  className="p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{prop.name}</h5>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{prop.protocol}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{prop.city} - {prop.state} • {prop.areaHa} Hectares</p>
                  </div>
                  <button className="px-3 py-1.5 text-[10px] font-bold text-gov-blue bg-blue-50 hover:bg-blue-100 rounded flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Fallback */}
        {hasSearched && searchResults.length === 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start space-x-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <strong>Nenhum registro encontrado:</strong> Não localizamos imóveis rurais com os critérios fornecidos. Tente buscar por um dos CPFs ou protocolos padrão de teste do sistema:
              <ul className="list-disc pl-4 mt-2 font-mono text-[10px] text-amber-900 space-y-0.5">
                <li>CPF de teste: 123.456.789-00 (Retorna 2 imóveis cadastrados)</li>
                <li>Protocolo de teste: BR-SP-3501608-F43A-8C21</li>
              </ul>
            </div>
          </div>
        )}

        {/* Selected Property Public Report Detail */}
        {selectedProperty && (
          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-md bg-slate-50/50">
            {/* Header look of federal demonstrative */}
            <div className="bg-[#0C326F] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-200">SICAR - Demonstrativo Público</h3>
                <h4 className="text-sm md:text-base font-extrabold mt-0.5">{selectedProperty.name}</h4>
              </div>
              <button 
                onClick={() => alert("Demonstrativo do CAR em PDF gerado e baixado!")}
                className="px-3.5 py-1.5 bg-white text-gov-blue hover:bg-blue-50 text-[10px] font-bold rounded flex items-center space-x-1.5 transition-colors"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Emitir PDF</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informational matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
                <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                  <h5 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] border-b pb-1">Identificação</h5>
                  <div><strong>Protocolo:</strong> <span className="font-mono font-bold">{selectedProperty.protocol}</span></div>
                  <div><strong>Situação:</strong> <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase text-[9px]">{selectedProperty.status}</span></div>
                  <div><strong>Município/UF:</strong> {selectedProperty.city} - {selectedProperty.state}</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                  <h5 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] border-b pb-1">Proprietário (LGPD)</h5>
                  <div><strong>Nome Declarado:</strong> {obfuscateName(selectedProperty.ownerName)}</div>
                  <div><strong>CPF Titular:</strong> ***.***.{selectedProperty.ownerCpf.slice(-6, -3)}-**</div>
                  <div><strong>Data de Inscrição:</strong> {selectedProperty.submissionDate}</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                  <h5 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] border-b pb-1">Uso do Solo (Hectares)</h5>
                  <div><strong>Área Total:</strong> {selectedProperty.areaHa} ha</div>
                  <div><strong>APP Conservada:</strong> {selectedProperty.appAreaHa} ha</div>
                  <div><strong>Reserva Legal:</strong> {selectedProperty.legalReserveHa} ha</div>
                </div>
              </div>

              {/* Area breakdown visualization */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">Distribuição de Preservação Ambiental</h4>
                <p className="text-[11px] text-gray-500">
                  O gráfico abaixo ilustra a proporção de cobertura vegetal destinada à conservação ecológica (APP e Reserva Legal) versus áreas de produção.
                </p>

                {/* Progress bar visualizer representing pie percentages */}
                <div className="space-y-3">
                  {/* Visual Bar */}
                  <div className="w-full h-8 rounded-md overflow-hidden flex bg-slate-100 font-mono text-[10px] font-bold text-white shadow-inner">
                    {/* APP (Emerald Green) */}
                    <div 
                      className="bg-emerald-600 flex items-center justify-center cursor-help" 
                      style={{ width: `${(selectedProperty.appAreaHa / selectedProperty.areaHa * 100).toFixed(1)}%` }}
                      title={`APP: ${selectedProperty.appAreaHa} ha`}
                    >
                      {selectedProperty.appAreaHa > 0 && `${(selectedProperty.appAreaHa / selectedProperty.areaHa * 100).toFixed(0)}%`}
                    </div>
                    {/* Reserva Legal (Amber) */}
                    <div 
                      className="bg-amber-600 flex items-center justify-center cursor-help" 
                      style={{ width: `${(selectedProperty.legalReserveHa / selectedProperty.areaHa * 100).toFixed(1)}%` }}
                      title={`Reserva Legal: ${selectedProperty.legalReserveHa} ha`}
                    >
                      {selectedProperty.legalReserveHa > 0 && `${(selectedProperty.legalReserveHa / selectedProperty.areaHa * 100).toFixed(0)}%`}
                    </div>
                    {/* Rest of Area (Blue/Slate) */}
                    <div 
                      className="bg-slate-500 flex items-center justify-center cursor-help" 
                      style={{ width: `${((selectedProperty.areaHa - selectedProperty.appAreaHa - selectedProperty.legalReserveHa) / selectedProperty.areaHa * 100).toFixed(1)}%` }}
                      title={`Área Produtiva/Outros: ${(selectedProperty.areaHa - selectedProperty.appAreaHa - selectedProperty.legalReserveHa).toFixed(1)} ha`}
                    >
                      {`${(100 - (selectedProperty.appAreaHa / selectedProperty.areaHa * 100) - (selectedProperty.legalReserveHa / selectedProperty.areaHa * 100)).toFixed(0)}%`}
                    </div>
                  </div>

                  {/* Graph labels */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] font-semibold">
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 bg-emerald-600 rounded"></span>
                      <span className="text-slate-700">Área de APP ({selectedProperty.appAreaHa} ha)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 bg-amber-600 rounded"></span>
                      <span className="text-slate-700">Reserva Legal ({selectedProperty.legalReserveHa} ha)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 bg-slate-500 rounded"></span>
                      <span className="text-slate-700">Área Produtiva/Uso Consolidado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back button */}
            <div className="bg-slate-100 p-4 border-t border-gray-200 flex justify-between items-center text-xs">
              <span className="text-gray-400 font-semibold uppercase text-[9px]">SICAR Federal</span>
              <button
                onClick={() => setSelectedProperty(null)}
                className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded transition-colors font-bold text-[11px]"
              >
                Voltar à Lista de Resultados
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
