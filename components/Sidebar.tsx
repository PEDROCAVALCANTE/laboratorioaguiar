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

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:w-64
      `}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Logo Section */}
        <div className="pt-8 pb-8 px-8 flex flex-col items-center justify-center border-b border-slate-50/50">
            <div className="w-40 h-16 flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
                <img 
                src="https://iili.io/fcoadnn.png" 
                alt="Aguiar Prótese Dentária" 
                className="w-full h-full object-contain drop-shadow-sm" 
                />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Laboratório</div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-medium group relative ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`transition-all duration-200 drop-shadow-sm ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={isActive ? 'font-semibold' : 'font-medium'}>{item.label}</span>
                
                {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 mt-auto space-y-3 bg-slate-50/30">
          
          {/* License Info */}
          <div className="w-full flex flex-col items-center p-2.5 rounded-xl bg-white border border-slate-100 mb-1 shadow-sm">
             <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck size={12} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Licenciado</span>
                <span className="text-[10px] font-bold text-emerald-600">R$ 89,99</span>
             </div>
             <span className="text-[10px] font-medium text-slate-400">Vencimento: Dia 16</span>
          </div>

          {/* Status Indicator */}
          <div className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-semibold border transition-all ${
            isOnline ? 'bg-emerald-50/50 border-emerald-100/50 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              </span>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            {isOnline ? <Wifi size={14} className="opacity-80"/> : <WifiOff size={14} className="opacity-80"/>}
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-white hover:text-red-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
          >
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;