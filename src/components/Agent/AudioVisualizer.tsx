import { motion } from "motion/react";
import { AudioVisualizerProps } from "../../types";
import { Mic, PhoneCall, VolumeX, ShieldAlert } from "lucide-react";

export function AudioVisualizer({
  isActive,
  isMuted,
  status,
  mode,
  volume,
  agentVolume,
}: AudioVisualizerProps) {
  // Determine which volume to use for the visual wave
  const activeVolume = mode === "responding" ? agentVolume : isMuted ? 0 : volume;

  // Render different states of the connection
  if (status === "disconnected") {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-[#1B5E20]/25 flex items-center justify-center text-[#66BB6A] mb-4 border border-[#2E7D32]/30 shadow-[0_0_20px_rgba(46,125,50,0.15)]"
        >
          <PhoneCall size={36} className="text-[#66BB6A]" />
        </motion.div>
        <p className="text-gray-300 font-sans font-light text-sm tracking-wide">
          Toque no botão abaixo para iniciar o atendimento por voz.
        </p>
      </div>
    );
  }

  if (status === "connecting") {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
        <div className="relative w-24 h-24 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-full rounded-full border-4 border-[#66BB6A]/20 border-t-[#66BB6A]"
          />
          <div className="absolute inset-0 flex items-center justify-center text-[#66BB6A] font-sans font-bold text-xs tracking-wider">
            CARVOX
          </div>
        </div>
        <p className="text-[#66BB6A] font-sans font-medium animate-pulse text-sm">
          Estabelecendo conexão segura...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
        >
          <ShieldAlert size={36} />
        </motion.div>
        <p className="text-red-400 font-sans font-light text-sm">
          Ocorreu um erro na chamada.
        </p>
      </div>
    );
  }

  // Active state wave visualizer
  return (
    <div className="flex flex-col items-center justify-center p-6 h-64 relative">
      {/* State Badge */}
      <div className="absolute top-2 px-3 py-1 bg-[#1B5E20]/40 text-[#66BB6A] border border-[#2E7D32]/50 rounded-full text-[10px] font-sans font-bold tracking-[0.15em] uppercase">
        {isMuted ? "Mutado" : mode === "listening" ? "Ouvindo..." : mode === "responding" ? "Respondendo..." : "Analisando..."}
      </div>

      {/* Main Avatar Centerpiece */}
      <div className="relative flex items-center justify-center w-28 h-28 mb-6">
        {/* Pulsing Ripple circles based on active volume */}
        <motion.div
          animate={{
            scale: 1 + activeVolume / 100 * 0.8,
            opacity: mode === "responding" ? 0.25 : 0.15,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          className={`absolute inset-0 rounded-full ${
            mode === "responding" ? "bg-[#2E7D32]" : "bg-[#1B5E20]"
          } filter blur-[1px]`}
        />
        <motion.div
          animate={{
            scale: 1 + activeVolume / 100 * 0.4,
            opacity: mode === "responding" ? 0.45 : 0.35,
          }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className={`absolute w-4/5 h-4/5 rounded-full ${
            mode === "responding" ? "bg-[#1B5E20]" : "bg-[#2E7D32]"
          } filter blur-[1px]`}
        />

        {/* Inner static button/icon circle */}
        <div className="absolute w-3/5 h-3/5 rounded-full bg-[#1e1e1e] border border-white/10 shadow-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {isMuted ? (
            <VolumeX size={24} className="text-red-400 animate-pulse" />
          ) : mode === "responding" ? (
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <PhoneCall size={24} className="text-[#66BB6A] drop-shadow-[0_0_8px_rgba(102,187,106,0.5)]" />
            </motion.div>
          ) : (
            <Mic size={24} className="text-[#66BB6A] animate-pulse drop-shadow-[0_0_8px_rgba(102,187,106,0.4)]" />
          )}
        </div>
      </div>

      {/* Audio Wave Bars Reacting to Volume */}
      <div className="flex items-center gap-[6px] h-12 w-48 justify-center">
        {[...Array(12)].map((_, i) => {
          // Create some variety in wave response depending on bar position
          const factor = 1 - Math.abs(i - 5.5) / 6; // taller in the middle
          const calculatedHeight = Math.max(4, activeVolume * factor * 0.6);

          // Highlight center waves with a custom white glowing state (similar to wave-3 in reference)
          const isCenter = i === 5 || i === 6;
          const bgGradient = isCenter && activeVolume > 15
            ? "bg-white shadow-[0_0_15px_rgba(102,187,106,0.8)]"
            : "bg-gradient-to-b from-[#66BB6A] to-[#2E7D32]";

          return (
            <motion.div
              key={i}
              animate={{ height: calculatedHeight }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className={`w-[6px] rounded-full transition-colors duration-200 ${bgGradient}`}
              style={{
                height: `${calculatedHeight}px`,
                minHeight: "4px",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
