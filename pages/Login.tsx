
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-[340px] w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
          
          {/* Logo e Saudação Centralizados */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center mb-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                <img 
                  src="https://iili.io/fcoadnn.png" 
                  alt="Aguiar Prótese Dentária" 
                  className="w-full h-full object-contain" 
                />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-[0.1em] uppercase">Dental Lab Pro</h2>
            <p className="text-teal-600/70 text-[10px] font-black mt-1 uppercase tracking-widest">Laboratório Aguiar</p>
          </div>

          {/* Card do Formulário Menor */}
          <div className="w-full bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-3 py-2 rounded-xl text-[10px] flex items-center gap-2 animate-in slide-in-from-top-2">
                  <AlertCircle size={14} />
                  <span className="font-black uppercase">{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Usuário de Acesso</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-400 transition-all placeholder:text-slate-300 font-bold"
                    placeholder="ex: lab@aguiar"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Senha de Entrada</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-400 transition-all placeholder:text-slate-300 font-bold"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-100 transition-all transform active:scale-[0.97] flex items-center justify-center gap-3 mt-6 text-[10px] uppercase tracking-[0.2em]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Acessar Lab <ArrowRight size={14} strokeWidth={3} />
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
