import { useEffect, useRef, useState } from "react";
import { ConnectionStatus, TranscriptLine } from "../types";
import { AudioPlayerQueue, float32ToInt16, arrayBufferToBase64 } from "../utils/audio";
import { GoogleGenAI, Modality } from "@google/genai";

export function useGeminiLive() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [mode, setMode] = useState<"idle" | "listening" | "responding">("idle");
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);
  const [micVolume, setMicVolume] = useState(0);
  const [agentVolume, setAgentVolume] = useState(0);

  // Refs for tracking active objects and preventing stale closures
  const sessionRef = useRef<any>(null); // To store ai.live.connect session
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const agentAnalyserRef = useRef<AnalyserNode | null>(null);
  const playerQueueRef = useRef<AudioPlayerQueue | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const isMutedRef = useRef(false);

  // Buffer to accumulate user and agent transcripts in real-time
  const currentAgentTranscriptIdRef = useRef<string | null>(null);
  const currentAgentTextRef = useRef<string>("");
  const currentUserTranscriptIdRef = useRef<string | null>(null);
  const currentUserTextRef = useRef<string>("");

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    // Close session
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {}
      sessionRef.current = null;
    }

    if (playerQueueRef.current) {
      playerQueueRef.current.stop();
      playerQueueRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      if (inputAudioCtxRef.current.state !== "closed") {
        inputAudioCtxRef.current.close();
      }
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      if (outputAudioCtxRef.current.state !== "closed") {
        outputAudioCtxRef.current.close();
      }
      outputAudioCtxRef.current = null;
    }

    setStatus("disconnected");
    setMode("idle");
    setMicVolume(0);
    setAgentVolume(0);
  };

  const addSystemMessage = (text: string) => {
    setTranscripts((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "system",
        text,
        timestamp: new Date(),
      },
    ]);
  };

  const startSession = async () => {
    cleanup();
    setStatus("connecting");
    setError(null);
    setMode("idle");

    setTranscripts([
      {
        id: "init",
        sender: "system",
        text: "Iniciando atendimento de voz do AgroCAR IA...",
        timestamp: new Date(),
      },
    ]);

    currentAgentTranscriptIdRef.current = null;
    currentAgentTextRef.current = "";
    currentUserTranscriptIdRef.current = null;
    currentUserTextRef.current = "";

    try {
      // 1. Get API Key
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        throw new Error("A chave API do Gemini (VITE_GEMINI_API_KEY) não está configurada no Vercel ou no arquivo .env.");
      }

      // 2. Microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // 3. Audio output
      const outCtx = new window.AudioContext({ sampleRate: 24000 });
      outputAudioCtxRef.current = outCtx;
      const agAnalyser = outCtx.createAnalyser();
      agAnalyser.fftSize = 128;
      agentAnalyserRef.current = agAnalyser;
      agAnalyser.connect(outCtx.destination);
      const queue = new AudioPlayerQueue();
      queue.init(outCtx, agAnalyser);
      playerQueueRef.current = queue;

      // 4. Connect to Gemini Live
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          systemInstruction: `Você é o CARVOX, um agente de voz inteligente e um parceiro do pequeno produtor rural. Especialista em Cadastro Ambiental Rural (CAR), regularização e legislação ambiental do agronegócio, você fala de igual para igual com quem vive no campo.

SEU COMPORTAMENTO COMO "CAMALEÃO REGIONAL":
Seu objetivo maior é gerar profunda confiança e conexão. Para isso, ESCUTE ATENTAMENTE o sotaque, as gírias e o dialeto do usuário (ex: sotaque e gírias paulistas do interior, nordestino, mineiro, gaúcho, etc.) e ADAPTE a sua própria fala e voz para espelhar de forma natural esse mesmo sotaque e dialeto. Fale usando o linguajar da região dele, crie empatia, seja "um deles", mas de forma orgânica, respeitosa e sem parecer forçado.

DIRETRIZES DE COMUNICAÇÃO:
1. Use uma linguagem EXTREMAMENTE simples e cotidiana do campo. Nunca fale "difícil".
2. Jamais use jargões técnicos ou jurídicos sem explicar com uma analogia simples. Ex: Se precisar falar "Reserva Legal", diga "é aquele pedaço de mato que a lei pede pra gente deixar quieto na terra".
3. Respostas curtas, muito diretas e em tom de bate-papo.
4. Seja paciente, acolhedor e transmita tranquilidade, pois muitos produtores têm medo de multas e burocracia.

Suas Especialidades de Conhecimento:
1. CAR: Inscrição, Retificação, Pendências, Consulta.
2. Regularização: PRA, Recomposição de áreas degradadas.
3. Áreas Ambientais: APP (margens de rios), Reserva Legal, Áreas Consolidadas.
4. Documentos: Matrícula, CCIR, notificações.

Limitações: Você não substitui advogados ou engenheiros. Se precisar de laudo ou defesa jurídica, oriente o produtor a procurar ajuda profissional de forma amigável.

Exemplo de Interação "Camaleão" (se o produtor falar com sotaque nordestino):
Produtor: "Ôxe, rapaz, chegou um papel aqui dizendo que meu CAR tá com pendência na reserva, eu tô é lascado!"
Sua Resposta: "Ôxe, se acalme, meu amigo! Tá lascado não! Isso só significa que o governo viu que pode tá faltando um pedaço da mata nativa lá na sua terra. Mas ó, tem jeito pra tudo. Vamos ver juntos o que precisa pra ajeitar isso, visse?"

Sempre fale em Português do Brasil (PT-BR) se adaptando perfeitamente ao sotaque e regionalismo do produtor.`,
          generationConfig: {
            temperature: 0.75,
          }
        },
        callbacks: {
          onmessage: (geminiMsg) => {
            try {
              // Check for model output content (audio chunks and transcripts)
              const serverContent = geminiMsg.serverContent;
              
              // Handle Interruption
              if (serverContent?.interrupted) {
                if (playerQueueRef.current) {
                  playerQueueRef.current.stop();
                }
                setMode("listening");
                setAgentVolume(0);
                
                currentAgentTranscriptIdRef.current = null;
                currentAgentTextRef.current = "";
                
                addSystemMessage("Fala interrompida pelo produtor.");
                return;
              }

              const modelTurn = serverContent?.modelTurn;
              if (modelTurn) {
                setMode("responding");
                
                const parts = modelTurn.parts;
                if (parts) {
                  parts.forEach((part: any) => {
                    if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/")) {
                      if (playerQueueRef.current) {
                        playerQueueRef.current.playChunk(part.inlineData.data);
                      }
                    }

                    if (part.text) {
                      handleAgentTextChunk(part.text);
                    }
                  });
                }
              }

              if (serverContent?.turnComplete) {
                setMode("listening");
                setAgentVolume(0);
                currentAgentTranscriptIdRef.current = null;
                currentAgentTextRef.current = "";
              }

              const outputTrans = geminiMsg.outputAudioTranscription;
              if (outputTrans && outputTrans.text) {
                handleAgentTextChunk(outputTrans.text);
              }

              const inputTrans = geminiMsg.inputAudioTranscription;
              if (inputTrans && inputTrans.text) {
                handleUserTextChunk(inputTrans.text);
              }
            } catch (e) {
              console.error("Erro ao analisar mensagem:", e);
            }
          },
          onclose: () => {
            console.log("Gemini Live session closed");
            if (status === "connecting") {
              setError("Não foi possível conectar ao servidor.");
              setStatus("error");
            } else {
              setStatus("disconnected");
            }
            addSystemMessage("Chamada encerrada.");
            cleanup();
          },
          onerror: (err: any) => {
            console.error("Gemini Live session error:", err);
            setError("Erro na conexão com o servidor de voz: " + err.message);
            setStatus("error");
            cleanup();
          }
        }
      });
      sessionRef.current = session;

      setStatus("connected");
      addSystemMessage("Atendimento ativo. Pode começar a falar!");
      setMode("listening");

      // 5. Setup Audio Input
      const inCtx = new window.AudioContext({ sampleRate: 16000 });
      inputAudioCtxRef.current = inCtx;
      const micAnalyser = inCtx.createAnalyser();
      micAnalyser.fftSize = 128;
      micAnalyserRef.current = micAnalyser;
      const source = inCtx.createMediaStreamSource(stream);
      source.connect(micAnalyser);
      const processor = inCtx.createScriptProcessor(4096, 1, 1);
      micProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || !sessionRef.current) {
          setMicVolume(0);
          return;
        }
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const vol = Math.min(100, Math.floor(rms * 300));
        setMicVolume(vol);

        const pcm16 = float32ToInt16(inputData);
        const base64Pcm = arrayBufferToBase64(pcm16.buffer);

        try {
          sessionRef.current.sendRealtimeInput({
            audio: {
              mimeType: "audio/pcm;rate=16000",
              data: base64Pcm
            }
          });
        } catch(e) {
          console.error("Error sending audio to Gemini", e);
        }
      };

      source.connect(processor);
      processor.connect(inCtx.destination);

    } catch (err: any) {
      console.error("Falha ao iniciar áudio / conexão:", err);
      setError(err.message || "Permissão de microfone negada ou erro de rede.");
      setStatus("error");
      cleanup();
    }
  };

  const handleAgentTextChunk = (text: string) => {
    if (!currentAgentTranscriptIdRef.current) {
      const id = Math.random().toString();
      currentAgentTranscriptIdRef.current = id;
      currentAgentTextRef.current = text;
      
      setTranscripts((prev) => [
        ...prev,
        {
          id,
          sender: "agent",
          text,
          timestamp: new Date(),
        },
      ]);
    } else {
      const id = currentAgentTranscriptIdRef.current;
      currentAgentTextRef.current += text;
      const updatedText = currentAgentTextRef.current;

      setTranscripts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, text: updatedText } : item))
      );
    }
  };

  const handleUserTextChunk = (text: string) => {
    if (!currentUserTranscriptIdRef.current) {
      const id = Math.random().toString();
      currentUserTranscriptIdRef.current = id;
      currentUserTextRef.current = text;
      
      setTranscripts((prev) => [
        ...prev,
        {
          id,
          sender: "user",
          text,
          timestamp: new Date(),
        },
      ]);
    } else {
      const id = currentUserTranscriptIdRef.current;
      currentUserTextRef.current += text;
      const updatedText = currentUserTextRef.current;

      setTranscripts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, text: updatedText } : item))
      );
    }
  };

  const stopSession = () => {
    addSystemMessage("Atendimento finalizado pelo produtor.");
    cleanup();
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  useEffect(() => {
    let animId: number;
    const updateAgentVolume = () => {
      if (agentAnalyserRef.current && mode === "responding") {
        const dataArray = new Uint8Array(agentAnalyserRef.current.frequencyBinCount);
        agentAnalyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalizedVol = Math.min(100, Math.floor((avg / 128) * 100));
        setAgentVolume(normalizedVol);
      } else {
        setAgentVolume(0);
      }
      animId = requestAnimationFrame(updateAgentVolume);
    };

    if (status === "connected") {
      animId = requestAnimationFrame(updateAgentVolume);
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [status, mode]);

  const sendTextMessage = (text: string) => {
    if (sessionRef.current) {
      const id = Math.random().toString();
      setTranscripts((prev) => [
        ...prev,
        {
          id,
          sender: "user",
          text,
          timestamp: new Date(),
        },
      ]);

      if (playerQueueRef.current && mode === "responding") {
        playerQueueRef.current.stop();
        setMode("listening");
        setAgentVolume(0);
        currentAgentTranscriptIdRef.current = null;
        currentAgentTextRef.current = "";
      }

      sessionRef.current.sendRealtimeInput({ text });
    }
  };

  return {
    status,
    error,
    isMuted,
    mode,
    transcripts,
    micVolume,
    agentVolume,
    startSession,
    stopSession,
    toggleMute,
    sendTextMessage,
  };
}
