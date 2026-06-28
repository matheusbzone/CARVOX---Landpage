import React, { useState, useRef } from "react";
import { Upload, FileCheck, CheckCircle2, AlertCircle, Download, FileUp, Loader2 } from "lucide-react";
import { Property } from "../types";

interface SubmitCARProps {
  onAddProperty: (newProperty: Property) => void;
}

export default function SubmitCAR({ onAddProperty }: SubmitCARProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [receiptProtocol, setReceiptProtocol] = useState("");
  const [generatedProperty, setGeneratedProperty] = useState<Property | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    // We can accept .car or any file for simplicity, but alert if not .car
    if (!selectedFile.name.endsWith(".car") && !selectedFile.name.endsWith(".xml")) {
      alert("Atenção: Os arquivos de declaração gerados no Módulo Off-line possuem a extensão '.car'. Carregue de preferência este formato, mas prosseguiremos com a simulação para fins de demonstração.");
    }
    setFile(selectedFile);
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsProcessing(true);

    // Simulate standard federal gateway checks
    setTimeout(() => {
      setIsProcessing(false);
      
      // Generate a mock protocol matching official state patterns
      const states = ["SP", "MG", "MT", "PA", "BA", "GO", "RS"];
      const randomState = states[Math.floor(Math.random() * states.length)];
      const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
      const protocol = `BR-${randomState}-31${randomHex()}-${randomHex()}-${randomHex()}`;

      // Instantiate a new Property to register in database
      const propName = file.name.replace(".car", "").replace(/[-_]/g, " ");
      const finalPropName = propName.charAt(0).toUpperCase() + propName.slice(1);
      
      const newProp: Property = {
        id: `prop-upload-${Date.now()}`,
        protocol: protocol,
        name: finalPropName || "Fazenda Importada",
        city: "Cachoeira do Sul",
        state: randomState,
        zipCode: "96500-000",
        areaHa: 245.8,
        ownerName: "Produtor Declarado",
        ownerCpf: "000.111.222-33",
        status: "Ativo",
        submissionDate: new Date().toLocaleDateString("pt-BR"),
        appAreaHa: 19.4,
        legalReserveHa: 49.16,
        vegetationAreaHa: 81.2,
        notifications: [],
      };

      onAddProperty(newProp);
      setGeneratedProperty(newProp);
      setReceiptProtocol(protocol);
      setSubmissionSuccess(true);
    }, 2500); // 2.5s realistic validation delays
  };

  const resetUploader = () => {
    setFile(null);
    setSubmissionSuccess(false);
    setReceiptProtocol("");
    setGeneratedProperty(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <span className="text-gov-blue text-xs font-bold uppercase tracking-widest font-mono">
          SICAR - Envio de Declarações
        </span>
        <h2 className="text-xl md:text-2xl font-black font-heading text-slate-800 mt-1 uppercase">
          Envie seu CAR
        </h2>
      </div>

      {submissionSuccess ? (
        <div className="space-y-6 max-w-xl mx-auto">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Recibo de Inscrição Homologado!</h3>
              <p className="text-xs text-gray-500 mt-1">
                O arquivo de declaração foi carregado com sucesso na base nacional do SICAR.
              </p>
            </div>

            <div className="border-t border-dashed border-emerald-200 pt-4 mt-2 grid grid-cols-2 gap-4 text-left text-xs text-slate-700">
              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider">Protocolo Consolidado</span>
                <span className="font-mono font-bold text-slate-800">{receiptProtocol}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider">Arquivo Processado</span>
                <span className="font-mono truncate block text-slate-800">{file?.name}</span>
              </div>
            </div>
          </div>

          {/* Official enrollment receipt mock look */}
          <div className="border border-slate-300 rounded-lg p-6 bg-slate-50/50 shadow-inner font-sans space-y-4 relative overflow-hidden">
            <div className="absolute right-6 top-6 bg-slate-200/50 p-2.5 rounded border border-gray-300">
              {/* Simulated QR Code */}
              <div className="w-14 h-14 bg-slate-800 flex flex-wrap p-1">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 ${i % 3 === 0 || i % 7 === 1 ? "bg-white" : "bg-black"}`} />
                ))}
              </div>
            </div>

            <div className="text-center pb-3 border-b border-gray-200 max-w-[70%]">
              <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Ministério do Meio Ambiente</h4>
              <p className="text-[9px] text-gray-400 uppercase font-bold mt-0.5">Serviço Florestal Brasileiro - SICAR</p>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Recibo de Inscrição de Imóvel Rural</h3>
              <div><strong>Imóvel:</strong> {generatedProperty?.name}</div>
              <div><strong>Hectares:</strong> {generatedProperty?.areaHa} ha</div>
              <div><strong>Data de Envio:</strong> {generatedProperty?.submissionDate}</div>
              <div><strong>Situação:</strong> <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Homologado</span></div>
            </div>

            {/* Simulated barcode */}
            <div className="border-t border-gray-200 pt-4 flex flex-col items-center">
              <div className="flex h-8 w-60 bg-white border border-gray-200 px-2 justify-between items-stretch">
                {Array.from({ length: 45 }).map((_, i) => (
                  <div key={i} className="bg-black" style={{ width: `${i % 4 === 0 ? "3px" : i % 5 === 2 ? "1px" : "2px"}` }} />
                ))}
              </div>
              <span className="font-mono text-[9px] text-gray-400 mt-1">{receiptProtocol.replace(/-/g, " ")}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <button
              onClick={resetUploader}
              className="px-4 py-2 text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 rounded"
            >
              Enviar Outro Cadastro
            </button>
            <button
              onClick={() => alert("Recibo de Inscrição baixado com sucesso em PDF!")}
              className="px-4 py-2 text-xs font-bold text-white bg-gov-blue hover:bg-gov-blue-dark rounded flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Recibo (.PDF)</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm text-gray-600 leading-normal">
            Se você já preencheu todas as declarações no Módulo de Cadastro Rural Off-line e exportou o arquivo final criptografado <strong>(.car)</strong>, carregue-o na caixa abaixo para homologar a inscrição oficial do seu imóvel.
          </p>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerUploadClick}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-gov-blue bg-blue-50/40"
                : "border-slate-200 hover:border-gov-blue bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".car,.xml"
              className="hidden"
            />

            {file ? (
              <div className="space-y-4 max-w-sm mx-auto">
                <div className="w-14 h-14 bg-blue-100 text-gov-blue rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <FileUp className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm truncate">{file.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">
                    Tamanho: {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Remover arquivo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    Arraste o arquivo .car aqui ou <span className="text-gov-blue hover:underline">clique para selecionar</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                    Apenas arquivos gerados pelo Módulo CAR (.car)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!file || isProcessing}
              className="px-6 py-2.5 text-xs font-extrabold text-white bg-gov-blue hover:bg-gov-blue-dark rounded disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 transition-opacity"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando e enviando...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Homologar Inscrição Rural</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
