import React from 'react';
import { LayoutDashboard, Users, TrendingDown, WifiOff, Wifi, X, Archive, Building2, ClipboardList, LogOut, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout: () => void;
  onShowPayment?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOnline, isOpen = false, onClose, onLogout, onShowPayment }) => {
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container - Compacto w-48 / md:w-56 */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-48 bg-white border-r border-slate-100 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col
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
        <div className="pt-8 pb-6 px-4 flex flex-col items-center justify-center border-b border-slate-50">
            <div className="w-32 h-12 flex items-center justify-center mb-2 transition-transform hover:scale-105 duration-300">
                <img 
                src="https://iili.io/fcoadnn.png" 
                alt="Aguiar Prótese Dentária" 
                className="w-full h-full object-contain" 
                />
            </div>
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] text-center ml-1">Laboratório</div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 text-[12px] font-medium group relative ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon 
                  size={16} 
                  className={`transition-all duration-200 ${
                    isActive 
                      ? 'text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]' 
                      : 'text-slate-400 group-hover:text-slate-600 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
                  }`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={isActive ? 'font-bold' : 'font-medium'}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 mt-auto space-y-2.5 bg-slate-50/50 border-t border-slate-50">
          
          {/* Licenciamento Info */}
          <div 
            onClick={onShowPayment}
            className="mx-1 p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm cursor-pointer hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
               <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-blue-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Licenciado</span>
               </div>
               <span className="text-[10px] font-black text-emerald-600 group-hover:scale-110 transition-transform">R$ 89,99</span>
            </div>
            <p className="text-[8px] text-slate-400 font-bold text-center">Vencimento: Dia 10</p>
          </div>

          {/* Status Indicator */}
          <div className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
            isOnline ? 'bg-emerald-50/50 border-emerald-100/50 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-1">
              <span className={`inline-flex rounded-full h-1 w-1 ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={12} /> Sair
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;