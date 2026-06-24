import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for Gemini Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { history } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      // Fallback helpful, technical answers if API key is not configured
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
