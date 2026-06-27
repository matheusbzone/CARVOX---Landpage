import React, { useState } from 'react';
import { generateRandomString, generateCodeChallenge } from '../utils/pkce';

export default function GovBrLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const clientId = import.meta.env.VITE_GOVBR_CLIENT_ID;
      
      if (!clientId) {
        // Modo Hackathon: Redirecionar para a página cheia que simula o gov.br usando Hash Routing para evitar 404 no Vercel
        window.location.href = '/#/simulacao-govbr';
        return;
      }

      // OAuth2 PKCE Variables
      const codeVerifier = generateRandomString(64);
      const state = generateRandomString(32);
      const nonce = generateRandomString(32);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Armazenar para verificar no callback
      sessionStorage.setItem('govbr_code_verifier', codeVerifier);
      sessionStorage.setItem('govbr_state', state);

      const redirectUri = encodeURIComponent(window.location.origin + '/callback/govbr');
      
      const authUrl = `https://sso.staging.acesso.gov.br/authorize?response_type=code&client_id=${clientId}&scope=openid+email+profile+govbr_confiabilidades+govbr_confiabilidades_idtoken&redirect_uri=${redirectUri}&nonce=${nonce}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

      window.location.href = authUrl;
    } catch (error) {
      console.error("Erro ao iniciar login gov.br", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="flex items-center justify-center space-x-3 w-full max-w-sm bg-white hover:bg-gray-50 border-2 border-[#1351b4] rounded-full py-3 px-6 transition-all shadow-sm group disabled:opacity-50"
    >
      <img src="https://i.ibb.co/21mKxLX2/Gov-br-logo-svg.webp" alt="Gov.br" className="h-6" />
      <span className="text-[#1351b4] font-bold text-sm uppercase tracking-wide group-hover:text-blue-800">
        {isLoading ? "Conectando..." : "Entrar com gov.br"}
      </span>
    </button>
  );
}
