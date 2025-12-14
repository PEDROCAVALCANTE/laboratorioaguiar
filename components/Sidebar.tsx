import React, { useState } from 'react';
import { LayoutDashboard, Users, TrendingDown, Wifi, X, Database, Cloud, Save, LogOut, Building2, ClipboardList } from 'lucide-react';
import { StorageService } from '../services/storage';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOnline, isOpen = false, onClose }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [configInput, setConfigInput] = useState('');
  const [configError, setConfigError] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'expenses', label: 'Despesas', icon: TrendingDown },
    { id: 'clinics', label: 'Clínicas', icon: Building2 },
    { id: 'services', label: 'Serviços', icon: ClipboardList },
  ];

  const handleSaveConfig = async () => {
    setConfigError('');
    if (!configInput.trim()) {
      setConfigError('Por favor, insira o código JSON de configuração.');
      return;
    }
    
    const success = await StorageService.setFirebaseConfig(configInput);
    if (!success) {
      setConfigError('JSON inválido ou configuração incompleta. Verifique o formato.');
    } else {
      // O serviço irá recarregar a página em caso de sucesso
    }
  };

  const handleDisconnect = () => {
    if (confirm('Deseja desconectar do banco de dados e voltar ao modo local?')) {
      StorageService.disconnectFirebase();
    }
  };

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
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:w-64
      `}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
                <X size={24} />
            </button>
        </div>

        {/* Logo Section - Enhanced Size */}
        <div className="p-8 border-b border-slate-100 flex flex-col items-center justify-center bg-slate-50/50">
            <div className="w-full h-32 flex items-center justify-center p-2">
                <img 
                src="https://iili.io/fYtBdqF.png" 
                alt="Aguiar Prótese Dentária" 
                className="w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" 
                />
            </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-gradient-to-r from-teal-50 to-white text-teal-700 shadow-sm border border-teal-100 translate-x-1' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-teal-600' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-4 bg-slate-50/30">
          {/* Status Indicator (Clickable) */}
          <button 
            onClick={() => setShowConfig(true)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white hover:shadow-sm ${
              isOnline 
                ? 'bg-blue-50/50 border-blue-100 text-blue-600' 
                : 'bg-white border-slate-200 text-slate-500'
            }`}>
            <div className="flex items-center gap-2">
              {isOnline ? <Cloud size={14} /> : <Wifi size={14} />}
              <span>{isOnline ? 'Online (Firebase)' : 'Armazenamento Local'}</span>
            </div>
            <span className="text-[10px] opacity-70 underline">Config</span>
          </button>

          <div className="text-[9px] text-slate-400 text-center font-medium">
             v1.2.0 • Sistema LabPro
          </div>
        </div>
      </div>

      {/* Config/Help Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Database size={18} className="text-teal-600"/> 
                Conexão com Banco de Dados
              </h3>
              <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status Display */}
              <div className={`p-4 rounded-lg flex items-center gap-3 ${isOnline ? 'bg-blue-50 text-blue-800' : 'bg-emerald-50 text-emerald-800'}`}>
                {isOnline ? <Cloud size={24} /> : <Wifi size={24} />}
                <div>
                  <p className="font-bold">{isOnline ? 'Conectado ao Firebase' : 'Modo Offline / Local'}</p>
                  <p className="text-sm opacity-90">
                    {isOnline 
                      ? 'Seus dados estão sendo sincronizados com a nuvem.' 
                      : 'Dados salvos apenas neste navegador.'}
                  </p>
                </div>
              </div>

              {/* Configuration Form */}
              {!isOnline ? (
                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Configurar Conexão (Firebase)
                  </label>
                  <p className="text-xs text-slate-500">
                    Cole abaixo o objeto JSON de configuração do seu projeto Firebase (apiKey, authDomain, etc).
                  </p>
                  <textarea 
                    className="w-full h-32 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none"
                    placeholder='{ "apiKey": "AIzaSy...", "authDomain": "...", "projectId": "..." }'
                    value={configInput}
                    onChange={(e) => setConfigInput(e.target.value)}
                  />
                  {configError && <p className="text-red-500 text-xs font-semibold">{configError}</p>}
                  
                  <button 
                    onClick={handleSaveConfig}
                    className="w-full py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Save size={16} /> Salvar e Conectar
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <p className="text-sm text-slate-600">
                    Para trocar de banco de dados ou voltar ao modo local, desconecte a sessão atual.
                  </p>
                  <button 
                    onClick={handleDisconnect}
                    className="w-full py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut size={16} /> Desconectar Banco de Dados
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button 
                onClick={() => setShowConfig(false)}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                Fechar Janela
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;