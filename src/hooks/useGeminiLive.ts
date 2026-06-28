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
  const [liveFormData, setLiveFormData] = useState<Record<string, any>>({});
  const [lastFunctionCall, setLastFunctionCall] = useState<string | null>(null);

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
      } catch (e) { }
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
    setLastFunctionCall(null);

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

      let userDataText = "";
      try {
        const userStr = sessionStorage.getItem('govbr_user') || sessionStorage.getItem('govbr_mock_user');
        if (userStr) {
          const u = JSON.parse(userStr);
          const cpf = u.cpf || u.sub || "Não informado";
          userDataText = `\nO NOME DO PRODUTOR RURAL COM QUEM VOCÊ ESTÁ FALANDO É: ${u.name}. Chame-o pelo nome! Ele já está logado via Gov.br.\nO CPF DELE É: ${cpf}\n`;
        }
      } catch (e) { }

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          systemInstruction: `Você é o CARVOX, um agente de voz inteligente e um consultor altamente especializado no Cadastro Ambiental Rural (CAR).
${userDataText}
REGRAS CRÍTICAS DE PREENCHIMENTO DO SISTEMA (OBRIGATÓRIO):
O sistema possui uma interface visual (cards) que SÓ ATUALIZA SE VOCÊ CHAMAR A FERRAMENTA "atualizar_formulario_ao_vivo".
Portanto, TODA VEZ que o produtor responder algo relacionado a:
- Nome da propriedade
- Uso do Solo (ex: soja, milho, gado)
- Área total (ex: hectares)
- Se possui rios/nascentes
- Reserva legal
VOCÊ DEVE IMEDIATAMENTE CHAMAR A FERRAMENTA "atualizar_formulario_ao_vivo". NÃO APENAS DIGA "ANOTADO". SE VOCÊ SÓ FALAR E NÃO CHAMAR A FERRAMENTA, O SISTEMA VAI FALHAR!
Sempre chame a ferramenta, depois fale "Anotado, preenchi aqui na sua tela."`,
          tools: [{
            functionDeclarations: [
              {
                name: "atualizar_formulario_ao_vivo",
                description: "OBRIGATÓRIO: Atualiza os cards na tela do usuário ao vivo. DEVE SER CHAMADA toda vez que o produtor fornecer um dado novo (ex: uso do solo, área).",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    nomePropriedade: { type: "STRING" },
                    usoSolo: { type: "STRING" },
                    areaTotal: { type: "STRING" },
                    possuiRio: { type: "STRING" },
                    reservaLegal: { type: "STRING" }
                  }
                }
              },
              {
                name: "salvar_car",
                description: "Salva os dados coletados no banco de dados.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    proprietario: { type: "OBJECT" },
                    imovel: { type: "OBJECT" },
                    areasAmbientais: { type: "OBJECT" }
                  }
                }
              }
            ]
          }],
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

              // Handle Tool Calls (Live API sends them at the top level, not inside parts)
              if (geminiMsg.toolCall && geminiMsg.toolCall.functionCalls) {
                geminiMsg.toolCall.functionCalls.forEach((funcCall: any) => {
                  setLastFunctionCall(funcCall.name);
                  
                  if (funcCall.name === "atualizar_formulario_ao_vivo") {
                    const args = funcCall.args || {};
                    console.log("ARGS RECEBIDOS DA IA:", args);
                    setLiveFormData(prev => ({ ...prev, ...args, _debugRawArgs: JSON.stringify(args) }));

                    if (sessionRef.current) {
                      sessionRef.current.sendToolResponse({
                        functionResponses: [
                          {
                            id: funcCall.id,
                            name: "atualizar_formulario_ao_vivo",
                            response: { result: "success" }
                          }
                        ]
                      });
                    }
                  } else if (funcCall.name === "salvar_car") {
                    const args = funcCall.args;
                    const callId = funcCall.id;
                    addSystemMessage("Salvando dados do CAR no Firebase...");
                    fetch('/api/saveCar', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(args)
                    }).then(res => res.json()).then(data => {
                      if (data.success) {
                        addSystemMessage("✅ Dados salvos com sucesso! ID: " + data.id);
                        if (sessionRef.current) {
                          sessionRef.current.sendToolResponse({
                            functionResponses: [
                              {
                                id: callId,
                                name: "salvar_car",
                                response: { result: "success" }
                              }
                            ]
                          });
                        }
                      } else {
                        addSystemMessage("Erro ao salvar: " + data.error);
                      }
                    }).catch(e => {
                      addSystemMessage("Falha de rede ao tentar salvar.");
                    });
                  }
                });
              }

              const outputTrans = geminiMsg.outputAudioTranscription;
              if (outputTrans && outputTrans.text) {
                handleAgentTextChunk(outputTrans.text);
              }

              const inputTrans = geminiMsg.inputAudioTranscription;
              if (inputTrans && inputTrans.text) {
                handleUserTextChunk(inputTrans.text);
              }
            } catch (e: any) {
              console.error("Erro ao analisar mensagem:", e);
              setError("Erro no agente: " + (e.message || String(e)));
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
        } catch (e) {
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
    liveFormData,
    lastFunctionCall,
    startSession,
    stopSession,
    toggleMute,
    sendTextMessage,
  };
}
