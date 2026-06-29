# 🌱 CARVOX - Inteligência Artificial para o Cadastro Ambiental Rural (CAR)

## 📌 Sobre o Projeto

O **CARVOX** é uma solução inovadora focada em democratizar o acesso à regularização ambiental para pequenos produtores rurais no Brasil. Desenvolvido para facilitar o preenchimento do **Cadastro Ambiental Rural (CAR)**, o CARVOX utiliza a API de voz em tempo real do Google (Gemini Live API) para atuar como um consultor ambiental virtual.

Em vez de preencher formulários complexos, o produtor rural simplesmente **conversa por voz** com a nossa IA. O Agente faz as perguntas necessárias, extrai os dados da conversa (hectares, uso do solo, presença de rios, áreas de preservação) e preenche os dados automaticamente na tela em tempo real usando o recurso de *Tool Calling* ao vivo.

No final da ligação, os dados são consolidadados e enviados com segurança para o nosso banco de dados SaaS no **Supabase**.

---

## 🚀 Principais Funcionalidades

- **Autenticação Facilitada (Simulação Gov.br):** Foco em acessibilidade digital. O produtor faz login simulado via Gov.br, trazendo seus dados (Nome, CPF) instantaneamente para o sistema.
- **Agente de Voz em Tempo Real (Gemini Live):** Uma chamada de voz fluida com a IA, sem atrasos. A IA atende como uma consultoria, com tom amigável e focado na realidade rural brasileira.
- **Preenchimento de Formulário (Live Function Calling):** À medida que o produtor responde (Ex: *"Tenho 20 hectares de soja e um rio passando"*), a IA aciona ferramentas que atualizam os cards de informação na tela em tempo real.
- **Integração com Supabase:** Estrutura robusta de banco de dados baseada em Multi-Tenancy (SaaS), conectando Produtores Rurais e Propriedades através de Vercel Serverless Functions (`/api/saveCar`).

---

## 💻 Como Acessar e Testar a Aplicação

A aplicação já está online e pronta para ser testada!

🔗 **Acesse o link de Produção:** [https://carvox-landpage.vercel.app](https://carvox-landpage.vercel.app)

### Passo a Passo para o Teste:
Para realizar o teste e iniciar o atendimento com a Inteligência Artificial, basta acessar o link acima e clicar no botão verde no canto inferior direito, conforme ilustrado na imagem abaixo:

<div align="center">
  <img src="https://i.ibb.co/Gf4TDyqC/Chat-GPT-Image-23-de-jun-de-2026-22-51-20-Photoroom.png" alt="Botão de Início" width="250px" />
</div>

3. **Conversando com a IA:** A IA (Carvox) vai se apresentar e começar a fazer perguntas sobre a sua propriedade (ex: Nome da propriedade, área total, se existe rio/nascente, o que você planta). 
4. **Mágica ao Vivo:** Responda as perguntas por voz. Observe que, enquanto a IA diz "Anotado", os cartões escuros na tela começam a se preencher automaticamente com os dados que você acabou de falar!
5. **Salvando os Dados:** No final, diga à IA: *"Pode salvar os meus dados, eu terminei"*. 
6. **Verificação final:** Acompanhe o aviso abaixo das legendas indicando: `"Salvando dados do CAR no Supabase..."` seguido por `"✅ Dados salvos com sucesso!"`. Isso significa que os dados foram armazenados de forma persistente no nosso Banco de Dados SaaS!

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React + TypeScript + Vite
- **Estilização:** TailwindCSS + Framer Motion (para animações)
- **Inteligência Artificial:** `@google/genai` (Gemini 2.0 Flash / Live API / Tool Calling)
- **Backend / API:** Vercel Serverless Functions (`/api`)
- **Banco de Dados:** PostgreSQL hospedado no [Supabase](https://supabase.com) (Storage e Relational Data)
- **Deploy:** Vercel

---
*Feito com 💚 para revolucionar o acesso do pequeno agricultor à sustentabilidade.*
