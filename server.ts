import express from "express";
import path from "path";
import http from "http";
import { createServer as createViteServer } from "vite";
import { WebSocketServer } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for Gemini Chat (Text-based Helper)
app.post("/api/chat", async (req, res) => {
  try {
    const { history } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      const lastUserMessage = history[history.length - 1]?.content?.toLowerCase() || "";
      let answer = "Olá! Sou o Assistente Virtual do CAR. Para respostas totalmente inteligentes com IA, configure sua chave `GEMINI_API_KEY` nas Configurações do AI Studio.\n\nCom base em dúvidas gerais sobre o Cadastro Ambiental Rural:\n\n";
      
      if (lastUserMessage.includes("o que é") || lastUserMessage.includes("oque e") || lastUserMessage.includes("sobre")) {
        answer += "O Cadastro Ambiental Rural (CAR) é um registro público eletrônico nacional, obrigatório para todos os imóveis rurais, com a finalidade de integrar as informações ambientais das propriedades e posses rurais, compondo base de dados para controle, monitoramento, planejamento ambiental e econômico e combate ao desmatamento.";
      } else if (lastUserMessage.includes("retifica") || lastUserMessage.includes("corrigir")) {
        answer += "Para retificar o seu CAR, você deve acessar a seção 'Retifique seu CAR' no nosso portal ou usar o módulo de cadastro. Será necessário informar o número do protocolo do recibo de inscrição original e preencher a retificação com as correções necessárias, justificando a alteração.";
      } else if (lastUserMessage.includes("prazo") || lastUserMessage.includes("obrigatorio")) {
        answer += "A inscrição no CAR é obrigatória para todos os imóveis rurais (propriedades ou posses). Não há mais um prazo limite que penalize o produtor com multas automáticas pela não inscrição, mas o proprietário que não possuir o CAR perderá acesso a benefícios como crédito agrícola, licenciamentos ambientais e regularização de Áreas de Preservação Permanente (APP) e Reserva Legal.";
      } else if (lastUserMessage.includes("app") || lastUserMessage.includes("preservação")) {
        answer += "Área de Preservação Permanente (APP) é uma área protegida, coberta ou não por vegetação nativa, com a função ambiental de preservar os recursos hídricos, a paisagem, a estabilidade geológica e a biodiversidade, facilitar o fluxo gênico de fauna e flora, proteger o solo e assegurar o bem-estar das populações humanas (ex: margens de rios, encostas de morros).";
      } else {
        answer += "Como posso te ajudar hoje? Você pode me perguntar sobre: \n1. O que é o CAR?\n2. Como retificar um cadastro?\n3. O que são APPs ou Reserva Legal?\n4. Prazos e obrigatoriedade.";
      }
      return res.json({ text: answer });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: history.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      })),
      config: {
        systemInstruction: "Você é o Assistente Virtual Oficial do Cadastro Ambiental Rural (CAR) do Brasil. Ajude o usuário de forma profissional, prestativa e técnica. Responda em português brasileiro sobre o Cadastro Ambiental Rural, explicando conceitos como Área de Preservação Permanente (APP), Reserva Legal, Uso Restrito, Consolidação de Áreas, e os passos para cadastrar ou retificar o imóvel rural. Mantenha as respostas claras, concisas e bem formatadas com tópicos quando apropriado."
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor" });
  }
});

// Start the server with Vite middleware or static serving
async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const { pathname } = new URL(request.url || "", `http://${request.headers.host}`);
    
    if (pathname === "/api/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Handle connections for Gemini Live
  wss.on("connection", async (clientWs) => {
    console.log("Client connected to WebSocket");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      clientWs.send(JSON.stringify({ 
        type: "error",
        error: "A chave API do Gemini (GEMINI_API_KEY) não está configurada. Por favor, adicione-a no painel Secrets do AI Studio." 
      }));
      clientWs.close();
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      clientWs.send(JSON.stringify({ type: "status", status: "connecting" }));

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          systemInstruction: `Você é o CARVOX, um agente de voz inteligente, especialista em Cadastro Ambiental Rural (CAR), regularização ambiental de imóveis rurais e legislação ambiental aplicada ao agronegócio brasileiro.

Seu objetivo é atender produtores rurais através de conversação por voz de forma muito clara, objetiva, prática e acolhedora, utilizando linguagem simples, acessível e empática para produtores rurais.

Sempre explique conceitos complexos de forma didática e simples.
Você NUNCA deve utilizar linguagem excessivamente técnica ou jurídica sem explicá-la imediatamente de forma simples. Se o produtor perguntar algo confuso, explique pacientemente com exemplos do dia a dia no campo.

Suas Especialidades de Conhecimento:
1. Cadastro Ambiental Rural (CAR): Inscrição do CAR, Retificação de CAR, Pendências do CAR (como problemas de Reserva Legal ou APP), Análise do CAR, Situação cadastral, Consulta de imóveis rurais.
2. Regularização Ambiental: PRA (Programa de Regularização Ambiental), Recomposição ambiental de áreas degradadas, Regularização de passivos ambientais.
3. Áreas Ambientais: APP (Área de Preservação Permanente, como margens de rios e nascentes), Reserva Legal (exigência de porcentagem de vegetação nativa dependendo do bioma, ex: 20% no Cerrado/Mata Atlântica, 80% na Amazônia Legal), Áreas Consolidadas (áreas de uso antrópico consolidadas antes de 22 de julho de 2008), Áreas de Uso Restrito (pantanais, encostas declivosas).
4. Georreferenciamento e SIG: Arquivos de mapas (SHP, KML, KMZ), Coordenadas geográficas, Sobreposição de áreas (quando dois cadastros se cruzam ou invadem terras públicas).
5. Legislação: Código Florestal Brasileiro (Lei nº 12.651/2012) e noções básicas de normas estaduais.
6. Apoio ao Produtor: Orientação sobre documentação (matrícula, CCIR, RG/CPF), explicação de notificações recebidas de órgãos ambientais, interpretação de pendências ambientais, e próximos passos práticos para regularização.

Limitações Importantes: Você não substitui advogados, engenheiros responsáveis ou órgãos ambientais oficiais (como órgãos estaduais de meio ambiente). Quando houver necessidade de análise jurídica, laudo de georreferenciamento complexo ou representação perante o órgão, informe isso de forma transparente e amigável ao usuário, recomendando que ele consulte um profissional habilitado ou o órgão competente.

Exemplo de tom de voz:
Produtor: "Meu CAR está com pendência de Reserva Legal."
Resposta: "Isso significa que o sistema do governo identificou que pode estar faltando área de mata nativa preservada na sua propriedade em relação ao que a lei exige, ou que houve algum erro no desenho enviado. Não se preocupe! Posso te ajudar a entender quais documentos e passos você precisa para conferir ou corrigir essa pendência."

Responda sempre em Português do Brasil (PT-BR) de forma amigável, prestativa e objetiva (respostas curtas e conversacionais, adequadas para áudio em tempo real).`,
          generationConfig: {
            temperature: 0.75,
          }
        },
        callbacks: {
          onmessage: (message) => {
            clientWs.send(JSON.stringify({
              type: "gemini_message",
              message
            }));
          },
          onclose: () => {
            console.log("Gemini Live session closed");
            clientWs.send(JSON.stringify({ type: "status", status: "disconnected" }));
          },
          onerror: (err: any) => {
            console.error("Gemini Live session error:", err);
            clientWs.send(JSON.stringify({ type: "error", error: err.message || "Erro de conexão com o Gemini Live" }));
          }
        }
      });

      clientWs.send(JSON.stringify({ type: "status", status: "connected" }));

      clientWs.on("message", (rawMessage) => {
        try {
          const parsed = JSON.parse(rawMessage.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: {
                data: parsed.audio,
                mimeType: "audio/pcm;rate=16000"
              }
            });
          } else if (parsed.text) {
            session.sendRealtimeInput({
              text: parsed.text
            });
          }
        } catch (e) {
          console.error("Error processing client ws message:", e);
        }
      });

      clientWs.on("close", () => {
        console.log("Client closed connection, closing Gemini session...");
        session.close();
      });

    } catch (error: any) {
      console.error("Failed to establish Gemini Live connection:", error);
      clientWs.send(JSON.stringify({ type: "error", error: "Erro ao conectar ao Gemini Live: " + (error.message || error) }));
      clientWs.close();
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
