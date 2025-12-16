import React from 'react';
import { LayoutDashboard, Users, TrendingDown, WifiOff, Wifi, X, Archive, Building2, ClipboardList } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOnline, isOpen = false, onClose }) => {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      activeClass: 'bg-blue-50 text-blue-700',
      iconClass: 'text-blue-600',
      indicatorClass: 'bg-blue-600'
    },
    { 
      id: 'patients', 
      label: 'Pacientes', 
      icon: Users,
      activeClass: 'bg-teal-50 text-teal-700',
      iconClass: 'text-teal-600',
      indicatorClass: 'bg-teal-600'
    },
    { 
      id: 'archives', 
      label: 'Arquivo', 
      icon: Archive,
      activeClass: 'bg-violet-50 text-violet-700',
      iconClass: 'text-violet-600',
      indicatorClass: 'bg-violet-600'
    },
    { 
      id: 'expenses', 
      label: 'Despesas', 
      icon: TrendingDown,
      activeClass: 'bg-rose-50 text-rose-700',
      iconClass: 'text-rose-600',
      indicatorClass: 'bg-rose-600'
    },
    { 
      id: 'clinics', 
      label: 'Clínicas', 
      icon: Building2,
      activeClass: 'bg-indigo-50 text-indigo-700',
      iconClass: 'text-indigo-600',
      indicatorClass: 'bg-indigo-600'
    },
    { 
      id: 'services', 
      label: 'Serviços', 
      icon: ClipboardList,
      activeClass: 'bg-amber-50 text-amber-700',
      iconClass: 'text-amber-600',
      indicatorClass: 'bg-amber-600'
    },
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

      {/* Sidebar Container - White Background for Lab Cleanliness */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:w-60
      `}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-3 right-3 z-10">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
                <X size={20} />
            </button>
        </div>

        {/* Logo Section */}
        <div className="pt-8 pb-6 px-6 flex flex-col items-center justify-center">
            <div className="w-full h-24 flex items-center justify-center mb-2">
                <img 
                src="https://iili.io/fYtBdqF.png" 
                alt="Aguiar Prótese Dentária" 
                className="w-full h-full object-contain drop-shadow-sm" 
                />
            </div>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">Menu Principal</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group relative overflow-hidden ${
                  isActive 
                    ? item.activeClass 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {isActive && <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full ${item.indicatorClass}`}></div>}
                
                <Icon 
                  size={20} 
                  className={`transition-colors duration-200 ${isActive ? 'text-current' : item.iconClass} opacity-90 group-hover:opacity-100`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          {/* Status Indicator */}
          <div className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-medium border transition-colors mb-4 ${
            isOnline ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
              <span>{isOnline ? 'Sistema Online' : 'Modo Offline'}</span>
            </div>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          </div>

          <div className="text-[10px] text-slate-300 text-center font-medium border-t border-slate-50 pt-3">
             Pedro Micro-Saas
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;