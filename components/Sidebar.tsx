import React, { useState } from 'react';
import { LayoutDashboard, Users, TrendingDown, Activity, Wifi, X, Database } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOnline }) => {
  const [showConfig, setShowConfig] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'expenses', label: 'Despesas', icon: TrendingDown },
  ];

  return (
    <>
      <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-teal-500 p-2 rounded-lg">
             <Activity size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">LabPro</h1>
            <p className="text-xs text-slate-400">Manager System</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          {/* Status Indicator (Clickable) */}
          <button 
            onClick={() => setShowConfig(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-slate-800 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <div className="flex items-center gap-2">
              <Wifi size={14} />
              <span>Armazenamento Local</span>
            </div>
            <span className="text-[10px] opacity-70 underline">Info</span>
          </button>

          <div className="text-xs text-slate-600 text-center">
            &copy; 2024 LabPro Manager
          </div>
        </div>
      </div>

      {/* Config/Help Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Database size={18} className="text-teal-600"/> 
                Armazenamento de Dados
              </h3>
              <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-lg flex items-center gap-3 bg-emerald-50 text-emerald-800">
                <Wifi size={24} />
                <div>
                  <p className="font-bold">Modo Local</p>
                  <p className="text-sm opacity-90">
                    Os dados estão sendo salvos no LocalStorage do seu navegador.
                  </p>
                </div>
              </div>

              <div className="text-sm text-slate-600 space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="font-semibold text-slate-800">Nota técnica:</p>
                <p>O aplicativo está pronto para receber a integração com um novo banco de dados. Edite o arquivo <code>services/storage.ts</code> para conectar sua nova API.</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button 
                onClick={() => setShowConfig(false)}
                className="text-sm text-teal-600 font-semibold hover:underline"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;