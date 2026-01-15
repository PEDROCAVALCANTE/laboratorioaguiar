
import React, { useState } from 'react';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      if (email === 'lab@aguiar' && password === 'tay@226') {
        onLogin();
      } else {
        setError('Credenciais inválidas.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex font-sans bg-white overflow-hidden">
      {/* Lado Esquerdo - Imagem (Escondido em telas pequenas) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://iili.io/fS73kWN.png" 
          alt="Login background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px]"></div>
        <div className="absolute bottom-12 left-12 text-white z-10">
          <h1 className="text-4xl font-black tracking-tight leading-tight uppercase">
            Excelência em <br /> Prótese Dentária
          </h1>
          <p className="mt-4 text-white/80 font-medium max-w-md">
            Tecnologia e precisão para sorrisos perfeitos. Gerencie seu laboratório com a melhor ferramenta do mercado.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário Centralizado e Compacto */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50/50">
        <div className="max-w-[340px] w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
          
          {/* Logo e Saudação Centralizados */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center mb-6">
                <img 
                  src="https://iili.io/fcoadnn.png" 
                  alt="Aguiar Prótese Dentária" 
                  className="w-full h-full object-contain" 
                />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Bem-vindo(a)</h2>
            <p className="text-slate-400 text-[11px] font-bold mt-1 max-w-[240px]">Acesse sua conta para gerenciar o laboratório.</p>
          </div>

          {/* Card do Formulário Menor */}
          <div className="w-full bg-white p-6 rounded-[32px] shadow-2xl shadow-slate-200/60 border border-white/50 relative">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-xl text-[10px] flex items-center gap-2 animate-in slide-in-from-top-2">
                  <AlertCircle size={14} />
                  <span className="font-bold">{error}</span>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all placeholder:text-slate-300 font-medium"
                    placeholder="ex: lab@aguiar"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all placeholder:text-slate-300 font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.97] flex items-center justify-center gap-2 mt-4 text-[10px] uppercase tracking-widest"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Entrar no Sistema <ArrowRight size={14} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-10">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
              Pedro Micro-Saas & Aguiar Pro © {new Date().getFullYear() + 2}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
