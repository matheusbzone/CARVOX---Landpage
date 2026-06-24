import { useEffect, useRef, useState } from "react";
import { ConnectionStatus, TranscriptLine } from "../types";
import { AudioPlayerQueue, float32ToInt16, arrayBufferToBase64 } from "../utils/audio";

export function useGeminiLive() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [mode, setMode] = useState<"idle" | "listening" | "responding">("idle");
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);
  const [micVolume, setMicVolume] = useState(0);
  const [agentVolume, setAgentVolume] = useState(0);

  // Refs for tracking active objects and preventing stale closures
  const wsRef = useRef<WebSocket | null>(null);
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

  // Keep isMutedRef in sync
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Handle clean-up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop and clear audio players
    if (playerQueueRef.current) {
      playerQueueRef.current.stop();
      playerQueueRef.current = null;
    }

    // Stop mic stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    // Disconnect processors
    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }

    // Close Audio Contexts
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

    // Initialize the transcripts log
    setTranscripts([
      {
        id: "init",
        sender: "system",
        text: "Iniciando atendimento de voz do AgroCAR IA...",
        timestamp: new Date(),
      },
    ]);

    // Reset transcript refs
    currentAgentTranscriptIdRef.current = null;
    currentAgentTextRef.current = "";
    currentUserTranscriptIdRef.current = null;
    currentUserTextRef.current = "";

    try {
      // 1. Ask for microphone permission and get stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // 2. Establish WebSocket connection with the backend
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // 3. Set up audio output context and queue
      const outCtx = new AudioContext({ sampleRate: 24000 });
      outputAudioCtxRef.current = outCtx;

      const agAnalyser = outCtx.createAnalyser();
      agAnalyser.fftSize = 128;
      agentAnalyserRef.current = agAnalyser;
      agAnalyser.connect(outCtx.destination);

      const queue = new AudioPlayerQueue();
      queue.init(outCtx, agAnalyser);
      playerQueueRef.current = queue;

      // 4. Set up audio input context (16kHz)
      const inCtx = new AudioContext({ sampleRate: 16000 });
      inputAudioCtxRef.current = inCtx;

      const micAnalyser = inCtx.createAnalyser();
      micAnalyser.fftSize = 128;
      micAnalyserRef.current = micAnalyser;

      const source = inCtx.createMediaStreamSource(stream);
      source.connect(micAnalyser);

      const processor = inCtx.createScriptProcessor(4096, 1, 1);
      micProcessorRef.current = processor;

      // Process mic input and convert to raw 16-bit PCM to send over WebSocket
      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) {
          setMicVolume(0);
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate input volume level (RMS)
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const vol = Math.min(100, Math.floor(rms * 300));
        setMicVolume(vol);

        // Convert Float32 to Int16 PCM, then base64
        const pcm16 = float32ToInt16(inputData);
        const base64Pcm = arrayBufferToBase64(pcm16.buffer);

        // Send to server
        ws.send(JSON.stringify({ audio: base64Pcm }));
      };

      // Connect microphone processor
      source.connect(processor);
      processor.connect(inCtx.destination);

      // 5. Setup WebSocket listeners
      ws.onopen = () => {
        console.log("WebSocket connected to backend");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle system status or errors
          if (data.type === "error") {
            setError(data.error);
            setStatus("error");
            addSystemMessage(`Erro: ${data.error}`);
            cleanup();
            return;
          }

          if (data.type === "status") {
            if (data.status === "connected") {
              setStatus("connected");
              addSystemMessage("Atendimento ativo. Pode começar a falar!");
              setMode("listening");
            } else if (data.status === "disconnected") {
              setStatus("disconnected");
              addSystemMessage("Atendimento encerrado pelo servidor.");
              cleanup();
            }
            return;
          }

          // Handle messages forwarded from Gemini
          if (data.type === "gemini_message" && data.message) {
            const geminiMsg = data.message;

            // Check for model output content (audio chunks and transcripts)
            const serverContent = geminiMsg.serverContent;
            
            // Handle Interruption
            if (serverContent?.interrupted) {
              console.log("Interruption detected! Clearing player queue.");
              if (playerQueueRef.current) {
                playerQueueRef.current.stop();
              }
              setMode("listening");
              setAgentVolume(0);
              
              // End current transcript line
              currentAgentTranscriptIdRef.current = null;
              currentAgentTextRef.current = "";
              
              addSystemMessage("Fala interrompida pelo produtor.");
              return;
            }

            const modelTurn = serverContent?.modelTurn;
            if (modelTurn) {
              setMode("responding");
              
              // Process parts of the model turn
              const parts = modelTurn.parts;
              if (parts) {
                parts.forEach((part: any) => {
                  // 1. Play audio
                  if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/")) {
                    if (playerQueueRef.current) {
                      playerQueueRef.current.playChunk(part.inlineData.data);
                    }
                  }

                  // 2. Transcription text if available (inside the model turn parts)
                  if (part.text) {
                    handleAgentTextChunk(part.text);
                  }
                });
              }
            }

            // End of model turn
            if (serverContent?.turnComplete) {
              setMode("listening");
              setAgentVolume(0);
              // Clear current agent transcript tracking ID so next turn starts a new line
              currentAgentTranscriptIdRef.current = null;
              currentAgentTextRef.current = "";
            }

            // Real-time transcriptions from Gemini Live if enabled
            // Agent speech transcription
            const outputTrans = geminiMsg.outputAudioTranscription;
            if (outputTrans && outputTrans.text) {
              handleAgentTextChunk(outputTrans.text);
            }

            // User speech transcription
            const inputTrans = geminiMsg.inputAudioTranscription;
            if (inputTrans && inputTrans.text) {
              handleUserTextChunk(inputTrans.text);
            }
          }
        } catch (e) {
          console.error("Erro ao analisar mensagem do servidor:", e);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed", event);
        if (status === "connecting") {
          setError("Não foi possível conectar ao servidor.");
          setStatus("error");
        } else {
          setStatus("disconnected");
        }
        addSystemMessage("Chamada encerrada.");
        cleanup();
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("Erro na conexão com o servidor de voz.");
        setStatus("error");
        cleanup();
      };

    } catch (err: any) {
      console.error("Falha ao iniciar áudio / conexão:", err);
      setError(err.message || "Permissão de microfone negada ou erro de rede.");
      setStatus("error");
      cleanup();
    }
  };

  // Agent transcription text assembler
  const handleAgentTextChunk = (text: string) => {
    if (!currentAgentTranscriptIdRef.current) {
      // Start a new line
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
      // Append to existing line
      const id = currentAgentTranscriptIdRef.current;
      currentAgentTextRef.current += text;
      const updatedText = currentAgentTextRef.current;

      setTranscripts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, text: updatedText } : item))
      );
    }
  };

  // User transcription text assembler
  const handleUserTextChunk = (text: string) => {
    if (!currentUserTranscriptIdRef.current) {
      // Start a new line
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
      // Append to existing line
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

  // Periodically read agent volume level from output analyser for graphics animation
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
        // Normalize to 0-100 scale
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
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Add manual user transcript line
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

      // Stop agent if responding (manual interruption)
      if (playerQueueRef.current && mode === "responding") {
        playerQueueRef.current.stop();
        setMode("listening");
        setAgentVolume(0);
        currentAgentTranscriptIdRef.current = null;
        currentAgentTextRef.current = "";
      }

      wsRef.current.send(JSON.stringify({ text }));
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
