
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Expenses from './pages/Expenses';
import Clinics from './pages/Clinics';
import ServicesPage from './pages/ServicesPage';
import Archives from './pages/Archives';
import Login from './pages/Login';
import { StorageService } from './services/storage';
import { Patient, Expense, Clinic, ServiceItem } from './types';
import { Menu, ShieldCheck, Bell, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('lab_aguiar_auth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
      // Lembrete de assinatura após login
      setTimeout(() => setShowSubscriptionModal(true), 1500);
    }
    setIsAuthChecking(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('lab_aguiar_auth', 'authenticated');
    setIsAuthenticated(true);
    setTimeout(() => setShowSubscriptionModal(true), 800);
  };

  const handleLogout = () => {
    localStorage.removeItem('lab_aguiar_auth');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const connected = await StorageService.testConnection();
      setIsOnline(connected);
      const [loadedPatients, loadedExpenses, loadedClinics, loadedServices] = await Promise.all([
        StorageService.getPatients(),
        StorageService.getExpenses(),
        StorageService.getClinics(),
        StorageService.getServices()
      ]);
      setPatients(loadedPatients);
      setExpenses(loadedExpenses);
      setClinics(loadedClinics);
      setServices(loadedServices);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  const handleAddPatient = async (p: Patient) => { await StorageService.savePatient(p); fetchData(); };
  const handleUpdatePatient = async (p: Patient) => { await StorageService.savePatient(p); fetchData(); };
  const handleDeletePatient = async (id: string) => { await StorageService.deletePatient(id); fetchData(); };
  const handleAddExpense = async (e: Expense) => { await StorageService.saveExpense(e); fetchData(); };
  const handleDeleteExpense = async (id: string) => { await StorageService.deleteExpense(id); fetchData(); };
  const handleAddClinic = async (c: Clinic) => { await StorageService.saveClinic(c); fetchData(); };
  const handleDeleteClinic = async (id: string) => { await StorageService.deleteClinic(id); fetchData(); };
  const handleAddService = async (s: ServiceItem) => { await StorageService.saveService(s); fetchData(); };
  const handleDeleteService = async (id: string) => { await StorageService.deleteService(id); fetchData(); };

  if (isAuthChecking) return null;
  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#0f172a] flex font-sans overflow-hidden">
      
      {/* Subscription Alert Modal com Valor R$ 89,99 */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
            <div className="relative p-8 flex flex-col items-center text-center">
              <button 
                onClick={() => setShowSubscriptionModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-amber-50/50">
                <AlertTriangle size={40} className="text-amber-500" strokeWidth={1.5} />
              </div>

              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                Assinatura Mensal <br /> R$ 89,99
              </h3>
              
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-8 px-2">
                Olá! Para garantir que o seu laboratório continue operando com suporte total e todas as funcionalidades, pedimos a gentileza de regularizar sua mensalidade de <b>R$ 89,99</b>.
              </p>

              <div className="w-full space-y-3">
                <a 
                  href="https://nubank.com.br/cobrar/5bvnd/6989c255-415f-4969-8169-46e54bfdb849"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all transform active:scale-[0.97] text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  Pagar via PIX Agora <CheckCircle2 size={16} />
                </a>
                <button 
                  onClick={() => setShowSubscriptionModal(false)}
                  className="w-full text-slate-400 hover:text-slate-600 font-bold py-2 text-[10px] uppercase tracking-widest transition-colors"
                >
                  Lembrar mais tarde
                </button>
              </div>
            </div>
            <div className="bg-slate-50 py-3 px-8 border-t border-slate-100 flex justify-center">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Aguiar Pro System</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-slate-800 z-40 flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
            <img src="https://iili.io/fcoadnn.png" alt="Logo" className="h-7 w-auto" />
            <span className="font-bold text-white text-sm tracking-tight">Laboratório Aguiar</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg">
            <Menu size={24} />
        </button>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} 
        isOnline={isOnline} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 transition-all duration-300 overflow-y-auto h-screen relative md:ml-56 bg-[#0f172a]">
        
        {/* Desktop Custom Header */}
        <header className="hidden md:flex items-center justify-between px-10 py-5 bg-[#0f172a] border-b border-slate-800 sticky top-0 z-30">
            <div className="flex items-center gap-4">
               <h2 className="text-xl font-bold text-white tracking-tight">
                  {activeTab === 'dashboard' && 'Painel de Controle'}
                  {activeTab === 'patients' && 'Pacientes & Fluxo'}
                  {activeTab === 'archives' && 'Histórico Geral'}
                  {activeTab === 'expenses' && 'Gestão Financeira'}
                  {activeTab === 'clinics' && 'Clínicas Parceiras'}
                  {activeTab === 'services' && 'Tabela de Serviços'}
               </h2>
               <div className="h-5 w-px bg-slate-800"></div>
               <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                  <ShieldCheck size={12} />
                  Aguiar Pro
               </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-5">
                  <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                  </div>
                  <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all relative group">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0f172a] group-hover:animate-ping"></span>
                  </button>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div className="flex items-center gap-3">
                   <div className="text-right">
                      <p className="text-xs font-bold text-white leading-none">Thaynara Aguiar</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Administradora</p>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-blue-900/20 ring-2 ring-slate-800 cursor-pointer hover:bg-blue-500 transition-all">
                      TA
                   </div>
                </div>
            </div>
        </header>

        {/* Main Content Body */}
        <div className="p-5 pt-20 md:p-10 md:pt-8 max-w-7xl mx-auto space-y-8 pb-16">
          {isLoading && (
            <div className="fixed bottom-6 right-6 z-50 bg-[#1e293b] border border-slate-700 px-5 py-3 rounded-2xl text-[11px] font-bold text-blue-400 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Sincronizando...
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dashboard' && <Dashboard patients={patients} expenses={expenses} />}
            {activeTab === 'patients' && (
              <Patients 
                patients={patients} 
                onAddPatient={handleAddPatient} 
                onUpdatePatient={handleUpdatePatient}
                onDeletePatient={handleDeletePatient} 
                clinicsList={clinics}
                servicesList={services}
              />
            )}
            {activeTab === 'archives' && <Archives patients={patients} onDataUpdate={fetchData} />}
            {activeTab === 'expenses' && <Expenses expenses={expenses} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />}
            {activeTab === 'clinics' && <Clinics clinics={clinics} onAddClinic={handleAddClinic} onDeleteClinic={handleDeleteClinic} onSyncRequest={fetchData} />}
            {activeTab === 'services' && <ServicesPage services={services} onAddService={handleAddService} onDeleteService={handleDeleteService} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
