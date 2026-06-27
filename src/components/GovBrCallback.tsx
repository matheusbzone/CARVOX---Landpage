import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function GovBrCallback() {
  const [status, setStatus] = useState("Autenticando com gov.br...");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleAuth = async () => {
      let searchStr = window.location.search;
      if (!searchStr && window.location.hash.includes('?')) {
        searchStr = window.location.hash.substring(window.location.hash.indexOf('?'));
      }
      const urlParams = new URLSearchParams(searchStr);
      const code = urlParams.get('code');
      const returnedState = urlParams.get('state');
      const errorParam = urlParams.get('error');

      if (errorParam) {
        setError(`Erro retornado pelo gov.br: ${errorParam}`);
        return;
      }

      const savedState = sessionStorage.getItem('govbr_state');
      const codeVerifier = sessionStorage.getItem('govbr_code_verifier');

      if (!code || !returnedState || returnedState !== savedState || !codeVerifier) {
        setError("Sessão inválida ou expirada. Por favor, tente fazer login novamente.");
        return;
      }

      setStatus("Trocando código por token de acesso...");
      
      const clientId = import.meta.env.VITE_GOVBR_CLIENT_ID;
      // Em um cenário real de produção (NodeJS backend backend), não expomos o clientSecret no Front.
      // O Gov.br exige um fluxo de backend para troca de token por segurança (Authorization header Base64(clientId:clientSecret)).
      // Aqui, se não houver backend para testar o ClientSecret, simulamos o sucesso.
      const clientSecret = import.meta.env.VITE_GOVBR_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        setStatus("Modo Hackathon: Simulando troca de Token...");
        setTimeout(() => {
          sessionStorage.setItem('govbr_mock_user', JSON.stringify({
            name: "João Batista (Simulado Pós-Callback)",
            cpf: "123.456.789-00",
            reliability: "ouro"
          }));
          window.location.href = "/";
        }, 1500);
        return;
      }

      try {
        const authHeader = btoa(`${clientId}:${clientSecret}`);
        const redirectUri = encodeURIComponent(window.location.origin + '/callback/govbr');
        
        const tokenRes = await fetch("https://sso.staging.acesso.gov.br/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${authHeader}`
          },
          body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}&code_verifier=${codeVerifier}`
        });

        if (!tokenRes.ok) throw new Error("Falha ao obter token de acesso");
        
        const tokenData = await tokenRes.json();
        
        setStatus("Coletando informações do Cidadão...");
        const userRes = await fetch("https://sso.staging.acesso.gov.br/userinfo/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`
          }
        });

        if (!userRes.ok) throw new Error("Falha ao obter dados do usuário");
        const userData = await userRes.json();

        // Salvar dados do usuário logado na sessão local
        sessionStorage.setItem('govbr_user', JSON.stringify(userData));
        
        // Limpar PKCE
        sessionStorage.removeItem('govbr_state');
        sessionStorage.removeItem('govbr_code_verifier');

        window.location.href = "/";
      } catch (err: any) {
        console.error(err);
        setError("Ocorreu um erro técnico ao processar o login: " + err.message);
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
        <img src="https://i.ibb.co/21mKxLX2/Gov-br-logo-svg.webp" alt="Gov.br" className="h-10 mx-auto mb-6" />
        
        {error ? (
          <div className="text-red-600">
            <h2 className="text-lg font-bold mb-2">Falha na Autenticação</h2>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-6 bg-gov-blue text-white px-4 py-2 rounded-lg text-sm font-bold w-full"
            >
              Voltar ao Início
            </button>
          </div>
        ) : (
          <div className="text-gov-blue flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <h2 className="text-lg font-bold mb-1">Redirecionando...</h2>
            <p className="text-sm text-gray-500">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
