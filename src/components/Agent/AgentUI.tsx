import React, { useState, useEffect, useRef } from "react";
import { useGeminiLive } from "../../hooks/useGeminiLive";
import { AudioVisualizer } from "./AudioVisualizer";
import { HelpGuides } from "./HelpGuides";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  MessageSquare,
  Send,
  Clock,
  Wifi,
  Battery,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  Volume2,
  Trash2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AgentUIProps {
  onClose: () => void;
}

export default function AgentUI({ onClose }: AgentUIProps) {
  const {
    status,
    error,
    isMuted,
    mode,
    transcripts,
    micVolume,
    agentVolume,
    liveFormData,
    startSession,
    stopSession,
    toggleMute,
    sendTextMessage,
  } = useGeminiLive();

  // Local state
  const [textInput, setTextInput] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [phoneTime, setPhoneTime] = useState("");
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(true);

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Update phone time top bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setPhoneTime(
        now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  // Active call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "connected") {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Format seconds to mm:ss
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Scroll transcript to bottom when new items arrive
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcripts]);

  const handleSendText = () => {
    if (!textInput.trim()) return;
    sendTextMessage(textInput.trim());
    setTextInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendText();
    }
  };

  const selectSuggestedQuestion = (prompt: string) => {
    if (status === "connected") {
      sendTextMessage(prompt);
      if (!showKeyboard) setShowKeyboard(true);
    } else {
      // Guide the user to start the session first
      alert("Por favor, toque no botão verde para iniciar o atendimento antes de enviar perguntas.");
    }
  };
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col xl:flex-row items-center xl:justify-center p-4 sm:p-6 gap-6 sm:gap-8 select-none font-sans overflow-y-auto custom-scrollbar" onClick={onClose}>
      <button className="fixed top-6 right-6 text-white hover:text-red-400 z-[110] transition-colors bg-black/40 rounded-full p-1" onClick={onClose}>
        <X size={32} />
      </button>

      {/* PAINEL LATERAL: PRANCHETA DIGITAL (LIVE FORM DATA) */}
      <AnimatePresence>
        {status === "connected" && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex w-full max-w-[400px] shrink-0 bg-white/5 border border-white/10 rounded-[32px] p-6 flex-col gap-4 shadow-2xl backdrop-blur-lg mt-12 xl:mt-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-2 border-b border-white/10 pb-4 shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#2E7D32]/20 flex items-center justify-center border border-[#66BB6A]/30">
                <FileText size={20} className="text-[#66BB6A]" />
              </div>
              <div>
                <h3 className="text-white font-medium">Coleta de Dados</h3>
                <p className="text-white/50 text-xs">Atualização em tempo real</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {Object.keys(liveFormData).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 text-center gap-2">
                  <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-2">
                    <Mic size={24} className="text-white/20" />
                  </div>
                  <p className="text-sm">O agente está escutando...</p>
                  <p className="text-xs font-light">Fale sobre a sua propriedade para preencher os dados.</p>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {liveFormData.nomePropriedade && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 border border-white/10 p-3 rounded-2xl">
                        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Nome da Propriedade</p>
                        <p className="text-white text-sm font-medium">{liveFormData.nomePropriedade}</p>
                      </motion.div>
                    )}
                    {liveFormData.areaTotal && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 border border-white/10 p-3 rounded-2xl">
                        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Área Total</p>
                        <p className="text-white text-sm font-medium">{liveFormData.areaTotal}</p>
                      </motion.div>
                    )}
                    {liveFormData.usoSolo && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 border border-white/10 p-3 rounded-2xl">
                        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Uso do Solo</p>
                        <p className="text-white text-sm font-medium">{liveFormData.usoSolo}</p>
                      </motion.div>
                    )}
                    {liveFormData.possuiRio && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#2E7D32]/20 border border-[#66BB6A]/30 p-3 rounded-2xl">
                        <p className="text-[10px] text-[#66BB6A] uppercase tracking-wider mb-1">Recursos Hídricos (APP)</p>
                        <p className="text-white text-sm font-medium">{liveFormData.possuiRio}</p>
                      </motion.div>
                    )}
                    {liveFormData.reservaLegal && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 border border-white/10 p-3 rounded-2xl">
                        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Reserva Legal</p>
                        <p className="text-white text-sm font-medium">{liveFormData.reservaLegal}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* SIMULATED SMARTPHONE SCREEN (The core visual piece requested) */}
      <div id="phone-container" onClick={(e) => e.stopPropagation()} className="w-full max-w-[375px] bg-[#141414] text-white rounded-[44px] p-4 shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_30px_rgba(102,187,106,0.1)] relative border-[10px] border-neutral-800 overflow-hidden aspect-[9/19] flex flex-col justify-between min-h-[670px] max-h-[90vh]">

        {/* 1. Phone Top Status Bar */}
        <div className="flex justify-between items-center px-4 pt-1 pb-3 text-[11px] font-medium text-white/80 select-none relative z-10">
          <span>{phoneTime || "12:00"}</span>
          {/* Speaker notch */}
          <div className="w-24 h-4 bg-neutral-800 absolute top-0 left-1/2 transform -translate-x-1/2 rounded-b-xl" />
          <div className="flex items-center gap-1.5">
            <Wifi size={12} className="text-white/70" />
            <span className="text-[9px] bg-white/20 px-1 rounded font-semibold tracking-wider text-white/90">5G</span>
            <Battery size={13} className="text-white/70" />
          </div>
        </div>

        {/* 2. Phone Call Header */}
        <div className="text-center pt-2 space-y-1 relative z-10">
          <span className="inline-block px-2.5 py-0.5 bg-[#1B5E20]/30 text-[#66BB6A] rounded-full text-[9px] font-bold tracking-[0.15em] uppercase border border-[#2E7D32]/30">
            CARVOX
          </span>
          <h2 className="text-2xl font-light text-white tracking-tight flex items-center justify-center gap-2 mt-2">
            🌿 <span className="font-semibold">CARVOX</span> <span className="text-[#66BB6A]">IA</span>
          </h2>
          <p className="text-xs text-white/60 font-light">
            {status === "connected" ? "Linha de voz segura ativa" : "Especialista Ambiental"}
          </p>

          {/* Live Status Timer */}
          <div className="h-6 flex items-center justify-center mt-1">
            <AnimatePresence mode="wait">
              {status === "connected" ? (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex items-center gap-1.5 text-xs text-[#66BB6A] bg-[#2E7D32]/10 px-2.5 py-0.5 rounded-full font-mono border border-[#2E7D32]/20"
                >
                  <Clock size={12} className="animate-pulse" />
                  <span>{formatDuration(callDuration)}</span>
                </motion.div>
              ) : (
                <motion.span
                  key="status"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className={`text-xs font-light ${status === 'error' ? 'text-red-400 font-medium' : 'text-gray-400'}`}
                >
                  {status === "connecting" ? "Conectando..." : status === "error" ? "Falha na Conexão" : "Desconectado"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          {error && (
            <div className="text-[10px] text-red-400 mt-2 px-2 leading-tight bg-red-900/20 py-1 rounded border border-red-500/20">
              {error}
            </div>
          )}
        </div>

        {/* 3. Central Interactive Wave Visualization Area */}
        <div className="flex-grow flex items-center justify-center my-4">
          <AudioVisualizer
            isActive={status === "connected"}
            isMuted={isMuted}
            status={status}
            mode={mode}
            volume={micVolume}
            agentVolume={agentVolume}
          />
        </div>

        {/* 4. Mini Subtitle Overlay inside call */}
        {status === "connected" && transcripts.length > 0 && (
          <div className="mx-2 mb-3 bg-black/40 border border-white/5 rounded-2xl p-3 text-center min-h-[56px] flex items-center justify-center shadow-inner">
            <p className="text-xs text-white/90 line-clamp-2 leading-relaxed font-light italic">
              "{transcripts.filter(t => t.sender !== "system").slice(-1)[0]?.text || "Aguardando áudio..."}"
            </p>
          </div>
        )}

        {/* 5. Call Keypad Controls Footer */}
        <div className="space-y-4 pb-4 relative z-10">


          {/* Big central Start/Stop Phone Call Trigger */}
          <div className="flex justify-center">
            {status === "disconnected" || status === "error" ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startSession}
                className="w-20 h-20 rounded-full bg-[#2E7D32] flex items-center justify-center text-white shadow-[0_0_30px_rgba(46,125,50,0.3)] hover:bg-[#1B5E20] cursor-pointer transition-all duration-300 border border-[#66BB6A]/30"
              >
                <Phone size={28} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopSession}
                className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:bg-red-700 cursor-pointer transition-all duration-300 border border-red-500/30"
              >
                <PhoneOff size={28} />
              </motion.button>
            )}
          </div>

          {/* Little visual prompt helper */}
          <p className="text-center text-[9px] text-white/40 tracking-wide font-light">
            {status === "connected"
              ? "Toque no botão vermelho para desligar"
              : "Toque no botão verde para ligar e conversar"}
          </p>
        </div>

        {/* 6. Dynamic Keyboard Slide-in Input */}
        <AnimatePresence>
          {showKeyboard && status === "connected" && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 inset-x-0 bg-[#1e1e1e] border-t border-white/10 rounded-t-[32px] p-4 pb-6 space-y-3 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Enviar mensagem</span>
                <button
                  onClick={() => setShowKeyboard(false)}
                  className="text-white/40 hover:text-white text-[11px] px-2 py-0.5 hover:bg-white/5 rounded transition-colors"
                >
                  Fechar
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escreva uma pergunta..."
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66BB6A] placeholder-white/30"
                />
                <button
                  onClick={handleSendText}
                  className="bg-[#2E7D32] hover:bg-[#1B5E20] p-2 rounded-xl text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
