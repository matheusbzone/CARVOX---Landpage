var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_http = __toESM(require("http"), 1);
var import_vite = require("vite");
var import_ws = require("ws");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
app.post("/api/chat", async (req, res) => {
  try {
    const { history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      const lastUserMessage = history[history.length - 1]?.content?.toLowerCase() || "";
      let answer = "Ol\xE1! Sou o Assistente Virtual do CAR. Para respostas totalmente inteligentes com IA, configure sua chave `GEMINI_API_KEY` nas Configura\xE7\xF5es do AI Studio.\n\nCom base em d\xFAvidas gerais sobre o Cadastro Ambiental Rural:\n\n";
      if (lastUserMessage.includes("o que \xE9") || lastUserMessage.includes("oque e") || lastUserMessage.includes("sobre")) {
        answer += "O Cadastro Ambiental Rural (CAR) \xE9 um registro p\xFAblico eletr\xF4nico nacional, obrigat\xF3rio para todos os im\xF3veis rurais, com a finalidade de integrar as informa\xE7\xF5es ambientais das propriedades e posses rurais, compondo base de dados para controle, monitoramento, planejamento ambiental e econ\xF4mico e combate ao desmatamento.";
      } else if (lastUserMessage.includes("retifica") || lastUserMessage.includes("corrigir")) {
        answer += "Para retificar o seu CAR, voc\xEA deve acessar a se\xE7\xE3o 'Retifique seu CAR' no nosso portal ou usar o m\xF3dulo de cadastro. Ser\xE1 necess\xE1rio informar o n\xFAmero do protocolo do recibo de inscri\xE7\xE3o original e preencher a retifica\xE7\xE3o com as corre\xE7\xF5es necess\xE1rias, justificando a altera\xE7\xE3o.";
      } else if (lastUserMessage.includes("prazo") || lastUserMessage.includes("obrigatorio")) {
        answer += "A inscri\xE7\xE3o no CAR \xE9 obrigat\xF3ria para todos os im\xF3veis rurais (propriedades ou posses). N\xE3o h\xE1 mais um prazo limite que penalize o produtor com multas autom\xE1ticas pela n\xE3o inscri\xE7\xE3o, mas o propriet\xE1rio que n\xE3o possuir o CAR perder\xE1 acesso a benef\xEDcios como cr\xE9dito agr\xEDcola, licenciamentos ambientais e regulariza\xE7\xE3o de \xC1reas de Preserva\xE7\xE3o Permanente (APP) e Reserva Legal.";
      } else if (lastUserMessage.includes("app") || lastUserMessage.includes("preserva\xE7\xE3o")) {
        answer += "\xC1rea de Preserva\xE7\xE3o Permanente (APP) \xE9 uma \xE1rea protegida, coberta ou n\xE3o por vegeta\xE7\xE3o nativa, com a fun\xE7\xE3o ambiental de preservar os recursos h\xEDdricos, a paisagem, a estabilidade geol\xF3gica e a biodiversidade, facilitar o fluxo g\xEAnico de fauna e flora, proteger o solo e assegurar o bem-estar das popula\xE7\xF5es humanas (ex: margens de rios, encostas de morros).";
      } else {
        answer += "Como posso te ajudar hoje? Voc\xEA pode me perguntar sobre: \n1. O que \xE9 o CAR?\n2. Como retificar um cadastro?\n3. O que s\xE3o APPs ou Reserva Legal?\n4. Prazos e obrigatoriedade.";
      }
      return res.json({ text: answer });
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: history.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      })),
      config: {
        systemInstruction: "Voc\xEA \xE9 o Assistente Virtual Oficial do Cadastro Ambiental Rural (CAR) do Brasil. Ajude o usu\xE1rio de forma profissional, prestativa e t\xE9cnica. Responda em portugu\xEAs brasileiro sobre o Cadastro Ambiental Rural, explicando conceitos como \xC1rea de Preserva\xE7\xE3o Permanente (APP), Reserva Legal, Uso Restrito, Consolida\xE7\xE3o de \xC1reas, e os passos para cadastrar ou retificar o im\xF3vel rural. Mantenha as respostas claras, concisas e bem formatadas com t\xF3picos quando apropriado."
      }
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor" });
  }
});
async function startServer() {
  const server = import_http.default.createServer(app);
  const wss = new import_ws.WebSocketServer({ noServer: true });
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
  wss.on("connection", async (clientWs) => {
    console.log("Client connected to WebSocket");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      clientWs.send(JSON.stringify({
        type: "error",
        error: "A chave API do Gemini (GEMINI_API_KEY) n\xE3o est\xE1 configurada. Por favor, adicione-a no painel Secrets do AI Studio."
      }));
      clientWs.close();
      return;
    }
    try {
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      clientWs.send(JSON.stringify({ type: "status", status: "connecting" }));
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [import_genai.Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
          },
          systemInstruction: `Voc\xEA \xE9 o CARVOX, um agente de voz inteligente, especialista em Cadastro Ambiental Rural (CAR), regulariza\xE7\xE3o ambiental de im\xF3veis rurais e legisla\xE7\xE3o ambiental aplicada ao agroneg\xF3cio brasileiro.

Seu objetivo \xE9 atender produtores rurais atrav\xE9s de conversa\xE7\xE3o por voz de forma muito clara, objetiva, pr\xE1tica e acolhedora, utilizando linguagem simples, acess\xEDvel e emp\xE1tica para produtores rurais.

Sempre explique conceitos complexos de forma did\xE1tica e simples.
Voc\xEA NUNCA deve utilizar linguagem excessivamente t\xE9cnica ou jur\xEDdica sem explic\xE1-la imediatamente de forma simples. Se o produtor perguntar algo confuso, explique pacientemente com exemplos do dia a dia no campo.

Suas Especialidades de Conhecimento:
1. Cadastro Ambiental Rural (CAR): Inscri\xE7\xE3o do CAR, Retifica\xE7\xE3o de CAR, Pend\xEAncias do CAR (como problemas de Reserva Legal ou APP), An\xE1lise do CAR, Situa\xE7\xE3o cadastral, Consulta de im\xF3veis rurais.
2. Regulariza\xE7\xE3o Ambiental: PRA (Programa de Regulariza\xE7\xE3o Ambiental), Recomposi\xE7\xE3o ambiental de \xE1reas degradadas, Regulariza\xE7\xE3o de passivos ambientais.
3. \xC1reas Ambientais: APP (\xC1rea de Preserva\xE7\xE3o Permanente, como margens de rios e nascentes), Reserva Legal (exig\xEAncia de porcentagem de vegeta\xE7\xE3o nativa dependendo do bioma, ex: 20% no Cerrado/Mata Atl\xE2ntica, 80% na Amaz\xF4nia Legal), \xC1reas Consolidadas (\xE1reas de uso antr\xF3pico consolidadas antes de 22 de julho de 2008), \xC1reas de Uso Restrito (pantanais, encostas declivosas).
4. Georreferenciamento e SIG: Arquivos de mapas (SHP, KML, KMZ), Coordenadas geogr\xE1ficas, Sobreposi\xE7\xE3o de \xE1reas (quando dois cadastros se cruzam ou invadem terras p\xFAblicas).
5. Legisla\xE7\xE3o: C\xF3digo Florestal Brasileiro (Lei n\xBA 12.651/2012) e no\xE7\xF5es b\xE1sicas de normas estaduais.
6. Apoio ao Produtor: Orienta\xE7\xE3o sobre documenta\xE7\xE3o (matr\xEDcula, CCIR, RG/CPF), explica\xE7\xE3o de notifica\xE7\xF5es recebidas de \xF3rg\xE3os ambientais, interpreta\xE7\xE3o de pend\xEAncias ambientais, e pr\xF3ximos passos pr\xE1ticos para regulariza\xE7\xE3o.

Limita\xE7\xF5es Importantes: Voc\xEA n\xE3o substitui advogados, engenheiros respons\xE1veis ou \xF3rg\xE3os ambientais oficiais (como \xF3rg\xE3os estaduais de meio ambiente). Quando houver necessidade de an\xE1lise jur\xEDdica, laudo de georreferenciamento complexo ou representa\xE7\xE3o perante o \xF3rg\xE3o, informe isso de forma transparente e amig\xE1vel ao usu\xE1rio, recomendando que ele consulte um profissional habilitado ou o \xF3rg\xE3o competente.

Exemplo de tom de voz:
Produtor: "Meu CAR est\xE1 com pend\xEAncia de Reserva Legal."
Resposta: "Isso significa que o sistema do governo identificou que pode estar faltando \xE1rea de mata nativa preservada na sua propriedade em rela\xE7\xE3o ao que a lei exige, ou que houve algum erro no desenho enviado. N\xE3o se preocupe! Posso te ajudar a entender quais documentos e passos voc\xEA precisa para conferir ou corrigir essa pend\xEAncia."

Responda sempre em Portugu\xEAs do Brasil (PT-BR) de forma amig\xE1vel, prestativa e objetiva (respostas curtas e conversacionais, adequadas para \xE1udio em tempo real).`,
          generationConfig: {
            temperature: 0.75
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
          onerror: (err) => {
            console.error("Gemini Live session error:", err);
            clientWs.send(JSON.stringify({ type: "error", error: err.message || "Erro de conex\xE3o com o Gemini Live" }));
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
    } catch (error) {
      console.error("Failed to establish Gemini Live connection:", error);
      clientWs.send(JSON.stringify({ type: "error", error: "Erro ao conectar ao Gemini Live: " + (error.message || error) }));
      clientWs.close();
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
