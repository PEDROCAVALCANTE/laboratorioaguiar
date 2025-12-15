
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Expenses from './pages/Expenses';
import Clinics from './pages/Clinics';
import ServicesPage from './pages/ServicesPage';
import Archives from './pages/Archives'; // Nova importação
import { StorageService } from './services/storage';
import { Patient, Expense, Clinic, ServiceItem } from './types';
import { Menu } from 'lucide-react';

// Data seeding for first run
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

const DEFAULT_CLINICS = [
  "Odonto Centro 85", "Odonto Pedro Luduvico", "Odonto Shopping Estação", 
  "Odonto Company Portal Shopping", "Odonto Company Jataí", "Odonto Fama", 
  "Oral Desing T9", "Menezes Odontologia", "Dra. Fabyanne", "Center Implantes", 
  "Odonto Company Vila Pedroso", "Dra. Pollyanna", "Mil Sorrisos", 
  "Odonto Company Vera Cruz", "Ortho Dontic", "Interdente"
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [loadedPatients, loadedExpenses, loadedClinics, loadedServices, connectionStatus] = await Promise.all([
          StorageService.getPatients(),
          StorageService.getExpenses(),
          StorageService.getClinics(),
          StorageService.getServices(),
          StorageService.testConnection()
        ]);
        
        setPatients(loadedPatients);
        setExpenses(loadedExpenses);
        setIsOnline(connectionStatus);

        // Seeding Data Logic (Run only if empty)
        if (loadedServices.length === 0) {
            const initialServices = DEFAULT_SERVICES.map((s, idx) => ({ 
                id: `seed-${idx}`, 
                name: s.name, 
                price: s.price 
            }));
            setServices(initialServices);
        } else {
            setServices(loadedServices);
        }

        if (loadedClinics.length === 0) {
            const initialClinics = DEFAULT_CLINICS.map((c, idx) => ({
                id: `seed-${idx}`,
                name: c,
                doctorName: '', 
                phone: ''
            }));
            setClinics(initialClinics);
        } else {
            setClinics(loadedClinics);
        }

      } catch (error) {
        console.error("Failed to load data", error);
        setIsOnline(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handlers
  const handleAddPatient = async (patient: Patient) => {
    setIsLoading(true);
    try {
      await StorageService.savePatient(patient);
      const updated = await StorageService.getPatients();
      setPatients(updated);
      
      const status = await StorageService.testConnection();
      setIsOnline(status);
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Erro ao adicionar paciente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePatient = async (patient: Patient) => {
    setIsLoading(true);
    try {
      await StorageService.savePatient(patient);
      const updated = await StorageService.getPatients();
      setPatients(updated);
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("Erro ao atualizar paciente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePatient = async (id: string) => {
    setIsLoading(true);
    try {
      await StorageService.deletePatient(id);
      const updated = await StorageService.getPatients();
      setPatients(updated);
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Erro ao excluir paciente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async (expense: Expense) => {
    setIsLoading(true);
    try {
      await StorageService.saveExpense(expense);
      const updated = await StorageService.getExpenses();
      setExpenses(updated);
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Erro ao adicionar despesa.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setIsLoading(true);
    try {
      await StorageService.deleteExpense(id);
      const updated = await StorageService.getExpenses();
      setExpenses(updated);
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Erro ao excluir despesa.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClinic = async (clinic: Clinic) => {
    setIsLoading(true);
    try {
      await StorageService.saveClinic(clinic);
      const updated = await StorageService.getClinics();
      setClinics(updated);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleDeleteClinic = async (id: string) => {
    setIsLoading(true);
    try {
      await StorageService.deleteClinic(id);
      const updated = await StorageService.getClinics();
      setClinics(updated);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleAddService = async (service: ServiceItem) => {
    setIsLoading(true);
    try {
      await StorageService.saveService(service);
      const updated = await StorageService.getServices();
      setServices(updated);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleDeleteService = async (id: string) => {
    setIsLoading(true);
    try {
      await StorageService.deleteService(id);
      const updated = await StorageService.getServices();
      setServices(updated);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  if (isLoading && patients.length === 0 && expenses.length === 0 && clinics.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600 font-medium text-lg">Carregando LabPro...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
            <img src="https://iili.io/fYtBdqF.png" alt="Logo" className="h-8 w-auto object-contain" />
            <span className="font-bold text-slate-700 text-sm">Aguiar Prótese</span>
        </div>
        <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
            <Menu size={24} />
        </button>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
        }} 
        isOnline={isOnline} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen relative md:ml-64`}>
        {isLoading && (
          <div className="fixed top-20 md:top-4 right-4 md:right-8 z-50 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-teal-600 shadow-md border border-teal-100 flex items-center gap-2 animate-pulse">
            <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            Sincronizando...
          </div>
        )}

        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <Dashboard patients={patients} expenses={expenses} />
          )}
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
          {activeTab === 'archives' && (
            <Archives patients={patients} />
          )}
          {activeTab === 'expenses' && (
            <Expenses 
              expenses={expenses} 
              onAddExpense={handleAddExpense} 
              onDeleteExpense={handleDeleteExpense}
            />
          )}
          {activeTab === 'clinics' && (
             <Clinics 
                clinics={clinics} 
                onAddClinic={handleAddClinic} 
                onDeleteClinic={handleDeleteClinic} 
             />
          )}
          {activeTab === 'services' && (
             <ServicesPage 
                services={services} 
                onAddService={handleAddService} 
                onDeleteService={handleDeleteService} 
             />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
