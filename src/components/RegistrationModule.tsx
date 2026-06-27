import React, { useState, useRef, useEffect } from "react";
import { Download, Monitor, Laptop, Terminal, ChevronRight, ChevronLeft, MapPin, CheckCircle, HelpCircle, Save, Layers, Play } from "lucide-react";
import { Property, PropertyCoords } from "../types";

interface RegistrationModuleProps {
  onAddProperty: (newProperty: Property) => void;
}

export default function RegistrationModule({ onAddProperty }: RegistrationModuleProps) {
  const [activeTab, setActiveTab] = useState<"offline" | "online">("offline");

  // Offline downloads state
  const [downloadingOS, setDownloadingOS] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Online wizard state
  const [step, setStep] = useState(1);
  const [propName, setPropName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("SP");
  const [zipCode, setZipCode] = useState("");
  const [areaHa, setAreaHa] = useState<number>(0);
    // Step 1: Imóvel
  const [nomePropriedade, setNomePropriedade] = useState("");
  const [cep, setCep] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("");
  const [tamanhoArea, setTamanhoArea] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("matricula");
  const [usoSolo, setUsoSolo] = useState("agricultura");

  // Step 2: Owner
  const [ownerName, setOwnerName] = useState("");
  const [ownerCpf, setOwnerCpf] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [isGovAuthed, setIsGovAuthed] = useState(false);

  // Step 3: Áreas Ambientais e Geo
  const [areaConsolidada, setAreaConsolidada] = useState("");
  const [vegetacaoNativa, setVegetacaoNativa] = useState("");
  const [coords, setCoords] = useState<PropertyCoords[]>([]);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [drawMode, setDrawMode] = useState<"boundary" | "app" | "legal_reserve">("boundary");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState("");

  useEffect(() => {
    try {
      const userStr = sessionStorage.getItem('govbr_user') || sessionStorage.getItem('govbr_mock_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.name) setOwnerName(u.name);
        if (u.cpf) setOwnerCpf(u.cpf);
        // Sometimes real API doesn't have CPF directly in 'cpf' but in 'sub'
        if (u.sub && !u.cpf) setOwnerCpf(u.sub); 
        setIsGovAuthed(true);
      }
    } catch(e) {}
  }, []);


  // Simulated download action
  const startDownload = (os: string) => {
    setDownloadingOS(os);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadingOS(null), 1500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Canvas drawing effect
  useEffect(() => {
    if (activeTab !== "online" || step !== 3) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background representing land plot satellite view
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Simulated satellite river or landscape feature
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.bezierCurveTo(120, 40, 200, 180, canvas.width, 140);
    ctx.stroke();

    ctx.fillStyle = "#60a5fa";
    ctx.font = "10px sans-serif";
    ctx.fillText("Rio Preservado (APP)", 10, 105);

    // Group coords by type
    const boundaryPoints = coords.filter(c => c.type === "boundary");
    const appPoints = coords.filter(c => c.type === "app");
    const reservePoints = coords.filter(c => c.type === "legal_reserve");

    // Helper to draw shape
    const drawPolygon = (points: PropertyCoords[], strokeColor: string, fillColor: string, label: string) => {
      if (points.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      if (points.length > 2) {
        ctx.closePath();
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Draw vertices
      points.forEach((pt, i) => {
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "9px sans-serif";
        ctx.fillText(String(i + 1), pt.x - 3, pt.y + 3);
      });
    };

    // Draw shapes
    drawPolygon(boundaryPoints, "#1e3a8a", "rgba(30, 58, 138, 0.15)", "Limite do Imóvel");
    drawPolygon(appPoints, "#047857", "rgba(4, 120, 87, 0.25)", "APP");
    drawPolygon(reservePoints, "#d97706", "rgba(217, 119, 6, 0.25)", "Reserva Legal");

  }, [coords, step, activeTab]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add coordinate
    const newPt: PropertyCoords = { x, y, type: drawMode };
    setCoords([...coords, newPt]);

    // Automatically increase estimated area size
    const boundaryPoints = [...coords, newPt].filter(c => c.type === "boundary");
    if (boundaryPoints.length >= 3) {
      // Very rough area estimation based on bounding box
      const xs = boundaryPoints.map(p => p.x);
      const ys = boundaryPoints.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const width = maxX - minX;
      const height = maxY - minY;
      const calculatedAreaHa = parseFloat(((width * height) * 0.45).toFixed(1));
      setAreaHa(calculatedAreaHa);
    }
  };

  const clearCanvas = () => {
    setCoords(coords.filter(c => c.type !== drawMode));
  };

  const clearAllCanvas = () => {
    setCoords([]);
    setAreaHa(0);
  };

  const submitOnlineForm = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate valid random protocol number matching original structure
    const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
    const protocolCode = `BR-${state}-${randomHex()}-${randomHex()}-${randomHex()}`;

    // Calculate APP and Legal Reserve proportions based on drawn points or standards (e.g. 20% standard)
    const finalArea = areaHa > 0 ? areaHa : 120.5;
    const appVal = parseFloat((finalArea * 0.08).toFixed(1));
    const legalReserveVal = parseFloat((finalArea * 0.2).toFixed(1));
    const vegVal = parseFloat((finalArea * 0.28).toFixed(1));

    const newProp: Property = {
      id: `prop-gen-${Date.now()}`,
      protocol: protocolCode,
      name: propName || "Fazenda Simulada",
      city: city || "Município Exemplo",
      state: state,
      zipCode: zipCode || "00000-000",
      areaHa: finalArea,
      ownerName: ownerName || "Produtor Declarante",
      ownerCpf: ownerCpf || "000.000.000-00",
      status: "Em Análise",
      submissionDate: new Date().toLocaleDateString("pt-BR"),
      appAreaHa: appVal,
      legalReserveHa: legalReserveVal,
      vegetationAreaHa: vegVal,
      notifications: [],
    };

    onAddProperty(newProp);
    setGeneratedProtocol(protocolCode);
    setIsSubmitted(true);
  };

  const resetWizard = () => {
    setStep(1);
    setPropName("");
    setCity("");
    setState("SP");
    setZipCode("");
    setAreaHa(0);
    setOwnerName("");
    setOwnerCpf("");
    setOwnerEmail("");
    setOwnerPhone("");
    setCoords([]);
    setIsSubmitted(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="border-b border-gray-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-gov-blue text-xs font-bold uppercase tracking-widest font-mono">
            Processo de Declaração
          </span>
          <h2 className="text-xl md:text-2xl font-black font-heading text-slate-800 mt-1 uppercase">
            Acesse o Módulo de Cadastro
          </h2>
        </div>
        
        {/* Toggle between offline and online */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("offline")}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
              activeTab === "offline"
                ? "bg-white text-gov-blue shadow-sm"
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            Módulo Off-line
          </button>
          <button
            onClick={() => setActiveTab("online")}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
              activeTab === "online"
                ? "bg-white text-gov-blue shadow-sm"
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            Módulo Web (Online)
          </button>
        </div>
      </div>

      {activeTab === "offline" ? (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            O Módulo de Cadastro Rural Off-line é a ferramenta oficial do Governo Federal desenvolvida para computadores. Ela permite mapear limites ecológicos de imóveis rurais em modo offline. O arquivo gerado (.car) deve ser posteriormente carregado no portal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Windows OS */}
            <div className="border border-slate-200 hover:border-gov-blue p-5 rounded-lg transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 text-slate-700 mb-3">
                  <Monitor className="w-8 h-8 text-gov-blue" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Versão Windows</h4>
                    <span className="text-[10px] text-gray-400">Windows 7, 10 ou 11 (64 bits)</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-normal">
                  Instalador oficial pré-empacotado com máquina virtual Java embarcada para máxima estabilidade operacional.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1 text-[10px] text-gray-400 font-mono">
                  <div>SHA256: 4f12...6bc8</div>
                  <div>Tamanho: 142 MB</div>
                </div>
              </div>
              
              <button
                onClick={() => startDownload("Windows")}
                disabled={downloadingOS !== null}
                className="mt-6 w-full py-2.5 px-4 bg-gov-blue text-white hover:bg-gov-blue-dark text-xs font-bold rounded-md flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingOS === "Windows" ? `Baixando ${downloadProgress}%` : "Baixar Instalador"}</span>
              </button>
            </div>

            {/* Linux OS */}
            <div className="border border-slate-200 hover:border-gov-blue p-5 rounded-lg transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 text-slate-700 mb-3">
                  <Terminal className="w-8 h-8 text-slate-700" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Versão Linux</h4>
                    <span className="text-[10px] text-gray-400">Ubuntu, Debian, Fedora (64 bits)</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-normal">
                  Arquivo executável `.sh` portátil. Requer ambiente gráfico e dependência de Java JRE 8 ou superior instalado.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1 text-[10px] text-gray-400 font-mono">
                  <div>SHA256: d912...2a91</div>
                  <div>Tamanho: 118 MB</div>
                </div>
              </div>
              
              <button
                onClick={() => startDownload("Linux")}
                disabled={downloadingOS !== null}
                className="mt-6 w-full py-2.5 px-4 bg-slate-700 text-white hover:bg-slate-800 text-xs font-bold rounded-md flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingOS === "Linux" ? `Baixando ${downloadProgress}%` : "Baixar Executável"}</span>
              </button>
            </div>

            {/* macOS OS */}
            <div className="border border-slate-200 hover:border-gov-blue p-5 rounded-lg transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 text-slate-700 mb-3">
                  <Laptop className="w-8 h-8 text-neutral-800" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Versão macOS</h4>
                    <span className="text-[10px] text-gray-400">macOS Catalina ou superior</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-normal">
                  Aplicativo compilado nativamente. Requer autorização prévia no painel de Segurança e Privacidade do macOS.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1 text-[10px] text-gray-400 font-mono">
                  <div>SHA256: fc54...34df</div>
                  <div>Tamanho: 135 MB</div>
                </div>
              </div>
              
              <button
                onClick={() => startDownload("macOS")}
                disabled={downloadingOS !== null}
                className="mt-6 w-full py-2.5 px-4 bg-slate-800 text-white hover:bg-black text-xs font-bold rounded-md flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingOS === "macOS" ? `Baixando ${downloadProgress}%` : "Baixar App (.dmg)"}</span>
              </button>
            </div>
          </div>

          {downloadingOS && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex justify-between items-center text-xs text-blue-800 font-bold mb-1">
                <span>Fazendo download do arquivo para {downloadingOS}...</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                <div className="bg-gov-blue h-full transition-all duration-200" style={{ width: `${downloadProgress}%` }}></div>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-xs text-gray-500 leading-relaxed">
            <strong>Instrução pós-instalação:</strong> Execute o módulo em sua máquina e selecione "Novo Cadastro". Ao final do preenchimento e mapeamento geográfico, utilize a opção "Exportar Declaração para Envio". Um arquivo criptografado com extensão <strong>.car</strong> será salvo em seu computador, o qual deverá ser enviado utilizando a aba <strong>"Envie seu CAR"</strong> no topo deste portal.
          </div>
        </div>
      ) : (
        /* Web Online Cadastro Wizard */
        <div>
          {isSubmitted ? (
            <div className="text-center py-10 space-y-6 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800">
                  Cadastro Enviado com Sucesso!
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  As informações foram inseridas no Sistema Nacional de Cadastro Ambiental Rural (SICAR).
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Protocolo Oficial Provisório
                </div>
                <div className="font-mono text-xs md:text-sm font-bold text-slate-800 bg-white p-2 rounded border border-gray-200 select-all">
                  {generatedProtocol}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Status atual: <span className="text-amber-600 font-semibold uppercase">Em Análise</span>
                </div>
              </div>

              <div className="flex space-x-3 justify-center">
                <button
                  onClick={resetWizard}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  Novo Cadastro
                </button>
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify({ protocol: generatedProtocol, name: propName, areaHa }))}`}
                  download={`${generatedProtocol.replace(/:/g, "_")}.car`}
                  className="px-4 py-2 text-xs font-bold text-white bg-gov-blue hover:bg-gov-blue-dark rounded-md flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Arquivo .CAR</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={submitOnlineForm} className="space-y-6">
              {/* Wizard progress steps */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 mb-6">
                {[
                  { n: 1, label: "Imóvel" },
                  { n: 2, label: "Proprietário" },
                  { n: 3, label: "Georreferenciamento" },
                  { n: 4, label: "Revisão" }
                ].map((s) => (
                  <div key={s.n} className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === s.n 
                        ? "bg-gov-blue text-white" 
                        : step > s.n 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-gray-200 text-gray-500"
                    }`}>
                      {s.n}
                    </span>
                    <span className={`text-[10px] md:text-xs font-semibold ${
                      step === s.n ? "text-slate-800" : "text-gray-400"
                    }`}>
                      {s.label}
                    </span>
                    {s.n < 4 && <ChevronRight className="w-3 h-3 text-gray-300 hidden md:block" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Property Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Dados Básicos do Imóvel Rural
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Nome da Propriedade *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={propName}
                        onChange={(e) => setPropName(e.target.value)}
                        placeholder="Ex: Fazenda Bela Vista"
                        className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Tipo de Documento
                      </label>
                      <select 
                        value={tipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none"
                      >
                        <option value="matricula">Matrícula</option>
                        <option value="posse">Posse / Recibo</option>
                        <option value="ccir">CCIR / Incra</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Uso Principal do Solo
                      </label>
                      <select 
                        value={usoSolo}
                        onChange={(e) => setUsoSolo(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none"
                      >
                        <option value="agricultura">Agricultura</option>
                        <option value="pecuaria">Pecuária</option>
                        <option value="floresta">Floresta Nativa</option>
                        <option value="misto">Misto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Área Total (Hectares) *
                      </label>
                      <input 
                        type="number" 
                        required
                        value={tamanhoArea}
                        onChange={(e) => setTamanhoArea(e.target.value)}
                        placeholder="Ex: 50"
                        className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        CEP do Imóvel *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="Ex: 12820-000"
                        className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Município *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ex: Ribeirão Preto"
                        className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Estado *
                      </label>
                      <select 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none"
                      >
                        {["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"].map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800 leading-normal">
                    Preencha os dados do imóvel com base nos documentos cartoriais ou escrituras oficiais para evitar divergências fiscais na futura análise ambiental.
                  </div>
                </div>
              )}

              {/* Step 2: Owner Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Identificação do Proprietário ou Possuidor
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Nome Completo do Declarante *</span>
                        {isGovAuthed && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> gov.br</span>}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Ex: João da Silva Ferreira"
                        disabled={isGovAuthed}
                        className={`w-full border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none ${isGovAuthed ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>CPF *</span>
                        {isGovAuthed && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> gov.br</span>}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={ownerCpf}
                        onChange={(e) => setOwnerCpf(e.target.value)}
                        placeholder="Ex: 123.456.789-00"
                        disabled={isGovAuthed}
                        className={`w-full border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none ${isGovAuthed ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        E-mail de Contato *
                      </label>
                      <input 
                        type="email" 
                        required
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="Ex: joao@email.com"
                        className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Telefone de Contato *
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="Ex: (11) 99999-9999"
                        className="w-full bg-white border border-slate-200 p-2 text-sm rounded focus:border-gov-blue focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Map vectorisation */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Vetorização Vetorial Georreferenciada
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Delimite as áreas do seu imóvel rural desenhando no mapa satélite interativo.
                      </p>
                    </div>

                    {/* Draw Mode selector */}
                    <div className="flex bg-slate-100 p-1 rounded border border-gray-200 gap-1 self-start">
                      <button
                        type="button"
                        onClick={() => setDrawMode("boundary")}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded ${
                          drawMode === "boundary" ? "bg-white text-blue-900 shadow-sm" : "text-gray-500"
                        }`}
                      >
                        Perímetro Imóvel
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawMode("app")}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded ${
                          drawMode === "app" ? "bg-white text-emerald-800 shadow-sm" : "text-gray-500"
                        }`}
                      >
                        APP (Ciliar)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawMode("legal_reserve")}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded ${
                          drawMode === "legal_reserve" ? "bg-white text-amber-800 shadow-sm" : "text-gray-500"
                        }`}
                      >
                        Reserva Legal
                      </button>
                    </div>
                  </div>

                  {/* Interative canvas */}
                  <div className="relative border border-slate-200 bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={320}
                      onClick={handleCanvasClick}
                      className="bg-white max-w-full cursor-crosshair border-b border-slate-200 shadow-inner"
                      title="Clique para adicionar vértices ecológicos"
                    />

                    {/* Canvas Controls */}
                    <div className="w-full bg-slate-50 p-3 flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Layers className="w-3.5 h-3.5 text-gov-blue" />
                          <span>Pontos marcados: {coords.filter(c => c.type === drawMode).length}</span>
                        </span>
                        {areaHa > 0 && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold text-[10px]">
                            Área Estimada: {areaHa} Hectares
                          </span>
                        )}
                      </div>
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="px-2.5 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-50 border border-red-200 rounded transition-colors"
                        >
                          Limpar {drawMode === "boundary" ? "Perímetro" : drawMode === "app" ? "APP" : "Reserva"}
                        </button>
                        <button
                          type="button"
                          onClick={clearAllCanvas}
                          className="px-2.5 py-1 text-[10px] font-semibold text-gray-500 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
                        >
                          Zerar Mapa
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Manual Area Input override */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-gray-500">
                      <strong>Dica:</strong> Você também pode informar ou ajustar manualmente o total de hectares calculado pelo desenho geográfico ao lado:
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={areaHa || ""}
                        onChange={(e) => setAreaHa(parseFloat(e.target.value) || 0)}
                        placeholder="Área (ha)"
                        className="w-28 bg-white border border-gray-300 rounded p-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-gov-blue"
                      />
                      <span className="text-xs font-bold text-slate-700 uppercase font-mono">HA</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Revision */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Revisão das Declarações Antes de Enviar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-lg border border-slate-200 text-xs text-slate-700">
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-slate-800 border-b pb-1 text-[11px] uppercase tracking-wider">Dados do Imóvel</h4>
                      <div><strong>Nome:</strong> {propName || "Não preenchido"}</div>
                      <div><strong>Município:</strong> {city || "Não preenchido"} - {state}</div>
                      <div><strong>CEP:</strong> {zipCode || "Não preenchido"}</div>
                      <div><strong>Área Total Declarada:</strong> {areaHa || "120.5"} Hectares</div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-slate-800 border-b pb-1 text-[11px] uppercase tracking-wider">Dados do Declarante</h4>
                      <div><strong>Nome completo:</strong> {ownerName || "Não preenchido"}</div>
                      <div><strong>CPF:</strong> {ownerCpf || "Não preenchido"}</div>
                      <div><strong>E-mail:</strong> {ownerEmail || "Não preenchido"}</div>
                      <div><strong>Telefone:</strong> {ownerPhone || "Não preenchido"}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-900 text-xs leading-normal">
                    <strong>Declaração de Veracidade:</strong> Ao enviar este cadastro, eu declaro sob as penas da lei que todas as informações geográficas e documentais informadas correspondem fielmente à realidade da posse/propriedade rural e são de minha integral responsabilidade jurídica.
                  </div>
                </div>
              )}

              {/* Wizard Nav Buttons */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-6">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && (!propName || !city || !zipCode)) {
                        alert("Por favor preencha os campos obrigatórios do imóvel.");
                        return;
                      }
                      if (step === 2 && (!ownerName || !ownerCpf || !ownerEmail)) {
                        alert("Por favor preencha os campos obrigatórios do proprietário.");
                        return;
                      }
                      setStep(step + 1);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-gov-blue hover:bg-gov-blue-dark rounded flex items-center space-x-1"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-md flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Concluir e Enviar</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
