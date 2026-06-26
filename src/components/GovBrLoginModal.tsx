import React, { useState } from 'react';
import { Eye, EyeOff, X, HelpCircle } from 'lucide-react';

interface GovBrLoginModalProps {
  onClose: () => void;
}

export default function GovBrLoginModal({ onClose }: GovBrLoginModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleCpfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cpf.length > 3) {
      setStep(2);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length > 0) {
      // Mock session keys for the callback to validate
      sessionStorage.setItem('govbr_state', 'mock_state');
      sessionStorage.setItem('govbr_code_verifier', 'mock_verifier');
      
      // Redirect to the callback route with mock query params
      window.location.href = "/callback/govbr?code=mock_code&state=mock_state";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header Gov.br */}
        <div className="bg-white px-6 pt-6 pb-4 flex justify-between items-start">
          <img src="https://i.ibb.co/21mKxLX2/Gov-br-logo-svg.webp" alt="Gov.br" className="h-8" />
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-800 mb-6 font-sans">
                Identifique-se no gov.br com:
              </h2>
              
              <div className="flex items-center space-x-2 text-sm text-gray-700 font-semibold mb-4 bg-blue-50/50 p-2 rounded border border-blue-100">
                <img src="https://i.ibb.co/6y4tWvJ/govbr-icon.png" alt="" className="w-5 h-5 opacity-70" onError={(e) => e.currentTarget.style.display='none'} />
                <span>Número do CPF</span>
              </div>

              <form onSubmit={handleCpfSubmit}>
                <div className="mb-6">
                  <label htmlFor="cpf" className="block text-sm text-gray-600 mb-1">
                    Digite seu CPF para criar ou acessar sua conta gov.br
                  </label>
                  <input
                    id="cpf"
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="Digite seu CPF"
                    className="w-full border-b-2 border-gray-300 pb-2 pt-2 text-lg focus:outline-none focus:border-gov-blue transition-colors font-sans"
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-3 rounded-full border border-gov-blue text-gov-blue font-bold text-sm hover:bg-blue-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 rounded-full bg-gov-blue text-white font-bold text-sm hover:bg-[#0a2756] transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </form>

              <div className="mt-6 space-y-4">
                <button className="flex items-center text-sm text-gov-blue font-semibold hover:underline w-full justify-between border-t border-gray-100 pt-4">
                  <span>Outras opções de identificação:</span>
                </button>
                <div className="space-y-3">
                  <button className="flex items-center w-full space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                    <div className="w-6 h-6 bg-green-100 text-green-700 rounded flex items-center justify-center font-bold text-xs">BR</div>
                    <span>Login com seu banco</span>
                    <span className="ml-auto text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">SUGERIDO</span>
                  </button>
                  <button className="flex items-center w-full space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded flex items-center justify-center font-bold text-xs">QR</div>
                    <span>Seu aplicativo gov.br</span>
                  </button>
                  <button className="flex items-center w-full space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                    <div className="w-6 h-6 bg-orange-100 text-orange-700 rounded flex items-center justify-center font-bold text-xs">CD</div>
                    <span>Seu certificado digital nuvem</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 font-sans">
                  Digite sua senha
                </h2>
                <button onClick={() => setStep(1)} className="text-sm font-semibold text-gov-blue hover:underline">
                  Alterar CPF
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 flex items-center justify-center gap-2">
                <img src="https://ui-avatars.com/api/?name=João+Batista&background=random&rounded=true" alt="User" className="w-8 h-8 rounded-full" />
                <div className="flex flex-col">
                   <span className="text-sm font-bold text-gray-800">João Batista (Simulado)</span>
                   <span className="text-xs text-gray-500">{cpf || "123.456.789-00"}</span>
                </div>
              </div>
              
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-6 relative">
                  <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="w-full border-b-2 border-gray-300 pb-2 pt-2 pr-10 text-lg focus:outline-none focus:border-gov-blue transition-colors font-sans"
                      autoFocus
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-3 text-gray-400 hover:text-gov-blue focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                   <a href="#" className="text-sm font-semibold text-gov-blue hover:underline">Esqueci minha senha</a>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-3 rounded-full border border-gov-blue text-gov-blue font-bold text-sm hover:bg-blue-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 rounded-full bg-gov-blue text-white font-bold text-sm hover:bg-[#0a2756] transition-colors"
                  >
                    Entrar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
