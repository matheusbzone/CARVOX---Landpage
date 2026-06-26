import React, { useState } from 'react';
import { Eye, EyeOff, MonitorSmartphone, QrCode, HardDrive, Cloud, AlertCircle, Contrast } from 'lucide-react';

export default function GovBrSimulatedLogin() {
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
      
      // Redirect to the callback route with mock query params using hash routing
      window.location.href = "/#/callback/govbr?code=mock_code&state=mock_state";
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Top Header */}
      <header className="w-full border-b border-gray-200 px-4 md:px-8 py-3 flex justify-between items-center">
        <div>
          <img src="https://i.ibb.co/21mKxLX2/Gov-br-logo-svg.webp" alt="Gov.br" className="h-6 md:h-8" />
        </div>
        <div className="flex items-center space-x-6 text-[#1351b4] text-xs font-semibold">
          <button className="flex items-center space-x-1 hover:underline">
            <Contrast className="w-4 h-4" />
            <span className="hidden sm:inline">Alto Contraste</span>
          </button>
          <button className="flex items-center space-x-1 hover:underline">
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">VLibras</span>
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <main className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
        
        {/* Left Side (Banner) */}
        <div className="hidden md:flex md:w-[55%] relative overflow-hidden bg-white">
          <div className="absolute top-0 bottom-0 left-16 w-32 bg-[#F3E100]"></div>
          
          <div className="relative z-10 p-16 pt-24 flex flex-col items-start w-full">
            <img src="https://i.ibb.co/21mKxLX2/Gov-br-logo-svg.webp" alt="gov.br" className="h-16 mb-6" />
            <h1 className="text-3xl font-medium text-slate-800 leading-tight max-w-md">
              Uma <span className="font-extrabold">conta gov.br</span> garante a identificação de cada cidadão que acessa os serviços digitais públicos.
            </h1>
            
            <div className="mt-16 w-full max-w-md bg-gray-100 h-64 rounded-xl flex items-center justify-center border border-gray-200 shadow-sm overflow-hidden">
               {/* Simulating the image of the older lady with a smartphone */}
               <div className="w-full h-full bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-gray-400">
                  <MonitorSmartphone className="w-24 h-24 opacity-20" />
               </div>
            </div>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full md:w-[45%] flex flex-col items-center pt-8 md:pt-24 px-4 md:px-0">
          
          <div className="w-full max-w-[400px] bg-white rounded-lg p-8 shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100">
            {step === 1 ? (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-8">
                  Identifique-se no gov.br com:
                </h2>
                
                <div className="flex items-center space-x-3 text-sm text-gray-800 font-semibold mb-6">
                  <div className="w-6 h-6 bg-blue-100 text-[#1351b4] rounded flex items-center justify-center font-bold text-xs">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <span>Número do CPF</span>
                </div>

                <form onSubmit={handleCpfSubmit}>
                  <div className="mb-6">
                    <label htmlFor="cpf" className="block text-[13px] text-gray-600 mb-2">
                      Digite seu CPF para criar ou acessar sua conta gov.br
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-gray-500 font-bold text-sm">CPF</span>
                      <input
                        id="cpf"
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="Digite seu CPF"
                        className="w-full border border-gray-400 bg-[#fffbe6] rounded p-3 pl-12 text-sm focus:outline-none focus:border-[#1351b4] focus:ring-1 focus:ring-[#1351b4] transition-colors text-gray-800 font-semibold"
                        autoComplete="off"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mb-8">
                    <button
                      type="submit"
                      disabled={cpf.length === 0}
                      className="px-8 py-2.5 rounded-full bg-[#1351b4] text-white font-bold text-sm hover:bg-[#0c3882] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar
                    </button>
                  </div>
                </form>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-[13px] text-gray-700 font-bold mb-4">Outras opções de identificação:</h3>
                  <div className="space-y-4">
                    <button className="flex items-center w-full space-x-4 text-sm font-semibold text-green-700 hover:opacity-80 transition-opacity">
                      <div className="w-6 h-6 bg-green-100 text-green-700 rounded flex items-center justify-center font-bold">BR</div>
                      <span>Login com seu banco</span>
                      <span className="ml-auto text-[9px] bg-green-100 text-green-800 px-2 py-0.5 font-bold uppercase">SUA CONTA SERÁ PRATA</span>
                    </button>
                    <button className="flex items-center w-full space-x-4 text-sm font-semibold text-[#1351b4] hover:opacity-80 transition-opacity">
                      <div className="w-6 h-6 rounded flex items-center justify-center font-bold"><QrCode className="w-5 h-5" /></div>
                      <span>Login com QR code</span>
                    </button>
                    <button className="flex items-center w-full space-x-4 text-sm font-semibold text-[#1351b4] hover:opacity-80 transition-opacity">
                      <div className="w-6 h-6 rounded flex items-center justify-center font-bold"><HardDrive className="w-5 h-5" /></div>
                      <span>Seu certificado digital</span>
                    </button>
                    <button className="flex items-center w-full space-x-4 text-sm font-semibold text-[#1351b4] hover:opacity-80 transition-opacity">
                      <div className="w-6 h-6 rounded flex items-center justify-center font-bold"><Cloud className="w-5 h-5" /></div>
                      <span>Seu certificado digital em nuvem</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-6 font-sans">
                  Digite sua senha
                </h2>

                <div className="mb-6">
                  <span className="text-[13px] text-gray-600 block mb-1">CPF</span>
                  <span className="text-base font-bold text-gray-800">{cpf}</span>
                </div>
                
                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-[13px] text-gray-600 mb-1">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha"
                        className="w-full border border-gray-400 bg-[#fffbe6] rounded p-3 pr-10 text-sm focus:outline-none focus:border-[#1351b4] focus:ring-1 focus:ring-[#1351b4] transition-colors"
                        autoFocus
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-600 hover:text-[#1351b4] focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4 mb-8">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/2 py-2.5 rounded-full border border-[#1351b4] text-[#1351b4] font-bold text-sm hover:bg-blue-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={password.length === 0}
                      className="w-1/2 py-2.5 rounded-full bg-[#1351b4] text-white font-bold text-sm hover:bg-[#0c3882] transition-colors disabled:opacity-50"
                    >
                      Entrar
                    </button>
                  </div>

                  <div className="text-center">
                     <a href="#" className="text-sm font-semibold text-[#1351b4] hover:underline">Esqueci minha senha</a>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <a href="#" className="text-[13px] font-semibold text-[#1351b4] hover:underline">Ficou com dúvidas?</a>
          </div>

        </div>
      </main>
    </div>
  );
}
