
import React from 'react';
import { LayoutDashboard, Users, TrendingDown, WifiOff, Wifi, X, Archive, Building2, ClipboardList, LogOut, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOnline, isOpen = false, onClose, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'archives', label: 'Arquivo', icon: Archive },
    { id: 'expenses', label: 'Despesas', icon: TrendingDown },
    { id: 'clinics', label: 'Clínicas', icon: Building2 },
    { id: 'services', label: 'Serviços', icon: ClipboardList },
  ];

  // Lógica de Vencimento (Dia 16)
  const today = new Date();
  const currentDay = today.getDate();
  const dueDay = 16;
  // Ativa se faltar 2 dias (dia 14 ou 15) ou se for o próprio dia 16
  const isNearExpiration = currentDay >= (dueDay - 2) && currentDay <= dueDay;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-slate-100 shadow-sm md:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:w-56
      `}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                <X size={18} />
            </button>
        </div>

        {/* Logo Section */}
        <div className="pt-6 pb-6 px-6 flex flex-col items-center justify-center border-b border-slate-50">
            <div className="w-32 h-12 flex items-center justify-center mb-2 transition-transform hover:scale-105 duration-300">
                <img 
                src="https://iili.io/fcoadnn.png" 
                alt="Aguiar Prótese Dentária" 
                className="w-full h-full object-contain" 
                />
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Laboratório</div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-[13px] font-medium group relative ${
                  isActive 
                    ? 'bg-blue-50/50 text-blue-700' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon 
                  size={17} 
                  className={`transition-all duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={isActive ? 'font-bold' : 'font-medium'}>{item.label}</span>
                
                {isActive && <div className="absolute right-2 w-1 h-1 rounded-full bg-blue-600"></div>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 mt-auto space-y-2 bg-slate-50/50">
          
          {/* License Info */}
          <div className={`w-full flex flex-col items-center p-2 rounded-lg bg-white border border-slate-100 mb-0.5 transition-all duration-500 ${isNearExpiration ? 'animate-blink-soft border-red-200 shadow-lg shadow-red-50' : ''}`}>
             <div className="flex items-center gap-1.5 mb-0.5">
                <ShieldCheck size={11} className={isNearExpiration ? 'text-red-500' : 'text-blue-500'} />
                <span className={`text-[9px] font-bold uppercase tracking-wide ${isNearExpiration ? 'text-red-600' : 'text-slate-500'}`}>
                  {isNearExpiration ? 'Vencendo' : 'Licenciado'}
                </span>
                <span className={`text-[9px] font-bold ${isNearExpiration ? 'text-red-700' : 'text-emerald-600'}`}>R$ 89,99</span>
             </div>
             <span className={`text-[9px] font-medium ${isNearExpiration ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>Vencimento: Dia 16</span>
          </div>

          {/* Status Indicator */}
          <div className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${
            isOnline ? 'bg-emerald-50/50 border-emerald-100/50 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex rounded-full h-1.5 w-1.5 ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              <span>{isOnline ? 'Sincronizado' : 'Modo Local'}</span>
            </div>
            {isOnline ? <Wifi size={12} className="opacity-80"/> : <WifiOff size={12} className="opacity-80"/>}
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-slate-400 hover:text-red-600 transition-all"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
