import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, MessageSquare, Landmark, CheckCircle, HelpCircle, Loader2, RefreshCw } from "lucide-react";
import { Message } from "../types";

export default function ContactUs() {
  // Support Form State
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [isTicketSubmitted, setIsTicketSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");

  // Chatbot State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Sou o Assistente Virtual Oficial do Cadastro Ambiental Rural (CAR). Posso te ajudar a entender o que é o CAR, esclarecer dúvidas sobre Reserva Legal, Áreas de Preservação Permanente (APP), retificações e como usar o Módulo de Cadastro. Como posso te auxiliar hoje?",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomTicket = Math.floor(100000 + Math.random() * 900000).toString();
    setTicketNumber(`CAR-SUP-${randomTicket}`);
    setIsTicketSubmitted(true);
  };

  const resetSupportForm = () => {
    setSupportName("");
    setSupportEmail("");
    setSupportSubject("");
    setSupportMessage("");
    setIsTicketSubmitted(false);
  };

  // Submit chat message to the Express /api/chat proxy endpoint
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = userInput.trim();
    if (!cleanInput) return;

    // Create user message
    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: cleanInput,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setIsTyping(true);

    try {
      // Package the entire chat history for multi-turn context
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        throw new Error("API Key não configurada. Defina VITE_GEMINI_API_KEY no .env");
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      // Build the history properly
      const history = chatHistory.slice(0, -1);
      const currentMessage = chatHistory[chatHistory.length - 1].parts[0].text;

      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: "Você é o Assistente Virtual Oficial do Cadastro Ambiental Rural (CAR). Responda sempre em português do Brasil, de forma clara, educada e prestativa sobre regularização ambiental, APP, Reserva Legal, etc. Evite textos muito longos.",
        },
        history: history as any
      });

      const response = await chat.sendMessage({
        message: currentMessage
      });

      const assistantMsg: Message = {
        id: `msg-ast-${Date.now()}`,
        role: "assistant",
        content: response.text || "Desculpe, tive um contratempo interno ao gerar a resposta.",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content: "Desculpe, não consegui obter uma resposta do servidor de Inteligência Artificial no momento. Erro: " + err.message,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <span className="text-gov-blue text-xs font-bold uppercase tracking-widest font-mono">
          Canais de Atendimento ao Cidadão
        </span>
        <h2 className="text-xl md:text-2xl font-black font-heading text-slate-800 mt-1 uppercase">
          Entre em Contato
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Support Ticket Form (Left 5 Columns) */}
        <div className="lg:col-span-5 bg-slate-50/50 p-6 border border-slate-200 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Landmark className="w-4.5 h-4.5 text-gov-blue" /> Suporte Técnico por E-mail
            </h3>
            <p className="text-[11px] text-gray-500 mb-5 leading-normal">
              Caso possua pendências em cadastros específicos ou problemas ao exportar do Módulo Off-line, envie um chamado diretamente para nossa mesa de analistas estaduais.
            </p>

            {isTicketSubmitted ? (
              <div className="bg-white border border-gray-200 rounded-lg p-5 text-center space-y-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Protocolo Registrado!</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Seu chamado técnico foi enviado. Responderemos no e-mail informado em até 48 horas úteis.
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded font-mono text-xs font-bold text-slate-700 border select-all">
                  {ticketNumber}
                </div>
                <button
                  onClick={resetSupportForm}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded transition-all"
                >
                  Novo Chamado
                </button>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={supportName}
                    onChange={(e) => setSupportName(e.target.value)}
                    placeholder="Ex: Carlos Albuquerque"
                    className="w-full bg-white border border-slate-200 p-2 text-xs rounded focus:border-gov-blue focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">
                    E-mail para Retorno *
                  </label>
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="Ex: carlos@email.com"
                    className="w-full bg-white border border-slate-200 p-2 text-xs rounded focus:border-gov-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Assunto do Chamado *
                  </label>
                  <input
                    type="text"
                    required
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="Ex: Erro ao gerar .CAR no Módulo Java"
                    className="w-full bg-white border border-slate-200 p-2 text-xs rounded focus:border-gov-blue focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Mensagem Detalhada *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Descreva com detalhes o problema..."
                    className="w-full bg-white border border-slate-200 p-2 rounded focus:border-gov-blue focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gov-blue hover:bg-gov-blue-dark text-white font-extrabold rounded shadow transition-all uppercase tracking-wider text-[10px]"
                >
                  Registrar Chamado Técnico
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Gemini Chatbot Assistant (Right 7 Columns) */}
        <div className="lg:col-span-7 border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[520px] bg-[#f8fafc]">
          {/* Chat header */}
          <div className="bg-[#0C326F] text-white p-4 flex items-center justify-between border-b border-gray-200 shadow-sm shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-100 text-[#0C326F] rounded-full flex items-center justify-center border-2 border-white/40 shadow">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs md:text-sm tracking-tight leading-tight">Assistente Virtual do CAR</h4>
                <p className="text-[10px] text-blue-200 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online • Inteligência Artificial</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setMessages([messages[0]])}
              className="p-1.5 hover:bg-blue-800 text-blue-100 rounded transition-colors"
              title="Reiniciar Conversa"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3.5 text-xs md:text-sm shadow-sm whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gov-blue text-white rounded-br-none"
                      : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-lg rounded-bl-none p-3.5 text-xs shadow-sm flex items-center space-x-2 text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gov-blue" />
                  <span>Assistente está digitando...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Send Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
            <input
              type="text"
              required
              disabled={isTyping}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Pergunte sobre APP, Reserva Legal, prazos..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-gov-blue focus:bg-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isTyping || !userInput.trim()}
              className="p-2.5 bg-gov-blue hover:bg-gov-blue-dark text-white rounded flex items-center justify-center transition-colors disabled:opacity-40"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
