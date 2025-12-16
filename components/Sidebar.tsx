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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'patients', label: 'Pacientes', icon: Users, color: 'text-teal-600', bgColor: 'bg-teal-50' },
    { id: 'archives', label: 'Arquivo', icon: Archive, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'expenses', label: 'Despesas', icon: TrendingDown, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { id: 'clinics', label: 'Clínicas', icon: Building2, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'services', label: 'Serviços', icon: ClipboardList, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:w-56
      `}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-3 right-3 z-10">
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X size={20} />
            </button>
        </div>

        {/* Logo Section */}
        <div className="p-4 border-b border-slate-50 flex flex-col items-center justify-center">
            <div className="w-full h-40 flex items-center justify-center">
                <img 
                src="https://iili.io/fYtBdqF.png" 
                alt="Aguiar Prótese Dentária" 
                className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300" 
                />
            </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group ${
                  isActive 
                    ? 'bg-slate-50 text-slate-800 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-white shadow-sm' : 'bg-slate-100 group-hover:bg-white group-hover:shadow-sm'}`}>
                    <Icon size={18} className={item.color} />
                </div>
                <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-50 space-y-3 bg-slate-50/30">
          {/* Status Indicator */}
          <div className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[11px] font-medium border transition-colors ${
            isOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span>{isOnline ? 'Conectado (Nuvem)' : 'Modo Local (Offline)'}</span>
            </div>
          </div>

          <div className="text-[9px] text-slate-400 text-center font-medium">
             v1.2.0 • LabPro
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;