export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface FaqItem {
  id: string;
  category: "Geral" | "Inscrição" | "Reserva Legal" | "Retificação" | "Módulo";
  question: string;
  answer: string;
}

export interface Property {
  id: string;
  protocol: string;
  name: string;
  city: string;
  state: string;
  zipCode: string;
  areaHa: number;
  ownerName: string;
  ownerCpf: string;
  status: "Ativo" | "Pendente" | "Retificado" | "Em Análise";
  submissionDate: string;
  appAreaHa: number;
  legalReserveHa: number;
  vegetationAreaHa: number;
  justification?: string;
  notifications: string[];
}

export interface PropertyCoords {
  x: number;
  y: number;
  type: "boundary" | "app" | "legal_reserve";
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface TranscriptLine {
  id: string;
  sender: "user" | "agent" | "system";
  text: string;
  timestamp: Date;
}

export interface AudioVisualizerProps {
  isActive: boolean;
  isMuted: boolean;
  status: ConnectionStatus;
  mode: "listening" | "responding" | "idle";
  volume: number;
  agentVolume: number;
}
