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
import { Menu, Calendar, ShieldCheck, Bell } from 'lucide-react';

// Data seeding for first run - Exact list from images
const DEFAULT_SERVICES = [
  { name: 'Protocolo de Resina / Dente Delara', price: 1200 },
  { name: 'Prótese Total', price: 280 },
  { name: 'Protocolo Provisório Sem Barra', price: 550 },
  { name: 'PPR - Montagem e Acrilização', price: 350 },
  { name: 'Prótese Flexível', price: 400 },
  { name: 'Placa de Bruxismo Acrílica', price: 200 },
  { name: 'Placa de Bruxismo Acetato', price: 100 },
  { name: 'Conserto Acrílico Simples', price: 60 },
  { name: 'Reebasamento', price: 100 },
  { name: 'Provisório', price: 60 },
  { name: 'Placa de Clareamento', price: 60 },
  { name: 'Prótese Parcial', price: 160 },
  { name: 'Prótese Total Caracterizada STG', price: 400 },
];

const DEFAULT_CLINICS_NAMES = [
  "Odonto Centro 85", 
  "Odonto Pedro Luduvico", 
  "Odonto Shopping Estação", 
  "Odonto Company Portal Shopping", 
  "Odonto Company Jataí", 
  "Odonto Fama", 
  "Oral Desing T9", 
  "Menezes Odontologia", 
  "Dra. Fabyanne", 
  "Center Implantes", 
  "Odonto Company Vila Pedroso", 
  "Dra. Pollyanna", 
  "Mil Sorrisos", 
  "Odonto Company Vera Cruz", 
  "Ortho Dontic", 
  "Interdente"
];

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

  useEffect(() => {
    const auth = localStorage.getItem('lab_aguiar_auth');
    if (auth === 'authenticated') setIsAuthenticated(true);
    setIsAuthChecking(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('lab_aguiar_auth', 'authenticated');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('lab_aguiar_auth');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const syncDefaultData = async (currentClinics: Clinic[], currentServices: ServiceItem[]) => {
    let updated = false;

    // Verificar Clínicas Faltantes
    for (const name of DEFAULT_CLINICS_NAMES) {
      if (!currentClinics.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        const newClinic: Clinic = {
          id: `seed-cln-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: name,
          doctorName: 'Dentista Responsável',
          phone: ''
        };
        await StorageService.saveClinic(newClinic);
        updated = true;
      }
    }

    // Verificar Serviços Faltantes
    if (currentServices.length === 0) {
      for (const s of DEFAULT_SERVICES) {
        const newService: ServiceItem = {
          id: `seed-svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: s.name,
          price: s.price
        };
        await StorageService.saveService(newService);
        updated = true;
      }
    }

    return updated;
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

      // Sincronização proativa de clínicas padrão
      const wasUpdated = await syncDefaultData(loadedClinics, loadedServices);
      
      if (wasUpdated) {
        const [freshClinics, freshServices] = await Promise.all([
          StorageService.getClinics(),
          StorageService.getServices()
        ]);
        setClinics(freshClinics);
        setServices(freshServices);
      } else {
        setClinics(loadedClinics);
        setServices(loadedServices);
      }

    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  // Handlers
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
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <img src="https://iili.io/fcoadnn.png" alt="Logo" className="h-5 w-auto object-contain" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Aguiar Prótese</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
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
      
      <main className={`flex-1 transition-all duration-300 overflow-y-auto h-screen relative md:ml-64 bg-slate-50`}>
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
            <div className="flex items-center gap-4">
               <h2 className="text-xl font-bold text-slate-800 tracking-tight capitalize">
                  {activeTab === 'dashboard' && 'Visão Geral'}
                  {activeTab === 'patients' && 'Gestão de Pacientes'}
                  {activeTab === 'archives' && 'Arquivo Geral'}
                  {activeTab === 'expenses' && 'Financeiro'}
                  {activeTab === 'clinics' && 'Clínicas'}
                  {activeTab === 'services' && 'Serviços'}
               </h2>
               <div className="h-5 w-px bg-slate-200"></div>
               <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  <ShieldCheck size={12} className="text-blue-500" />
                  <span>Laboratório Aguiar</span>
               </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-right hidden lg:block">
                      <p className="text-xs font-semibold text-slate-700 capitalize">
                          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>
                <div className="flex items-center gap-3 pl-2">
                   <div className="text-right hidden xl:block">
                      <p className="text-xs font-bold text-slate-800">Thaynara</p>
                      <p className="text-[10px] text-slate-500">Gerente</p>
                   </div>
                   <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold ring-4 ring-slate-100 cursor-pointer hover:bg-slate-700 transition-colors">
                      TA
                   </div>
                </div>
            </div>
        </header>

        <div className="p-4 pt-20 md:p-8 md:pt-6 max-w-7xl mx-auto space-y-8 pb-12">
          {isLoading && (
            <div className="fixed top-24 md:top-24 right-4 md:right-8 z-50 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-blue-600 shadow-lg shadow-blue-500/10 border border-blue-100 flex items-center gap-2 animate-in slide-in-from-top-2">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Sincronizando dados...
            </div>
          )}

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
      </main>
    </div>
  );
};

export default App;