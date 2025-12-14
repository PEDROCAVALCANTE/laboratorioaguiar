import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Expenses from './pages/Expenses';
import { StorageService } from './services/storage';
import { Patient, Expense } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  // Load data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [loadedPatients, loadedExpenses, connectionStatus] = await Promise.all([
          StorageService.getPatients(),
          StorageService.getExpenses(),
          StorageService.testConnection()
        ]);
        setPatients(loadedPatients);
        setExpenses(loadedExpenses);
        setIsOnline(connectionStatus);
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
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
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

  if (isLoading && patients.length === 0 && expenses.length === 0) {
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
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOnline={isOnline} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative">
        {isLoading && patients.length > 0 && (
          <div className="absolute top-4 right-8 z-50 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-teal-600 shadow-sm border border-teal-100 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            Processando...
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard patients={patients} expenses={expenses} />
          )}
          {activeTab === 'patients' && (
            <Patients 
              patients={patients} 
              onAddPatient={handleAddPatient} 
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={(id) => handleDeletePatient(id)} 
            />
          )}
          {activeTab === 'expenses' && (
            <Expenses 
              expenses={expenses} 
              onAddExpense={handleAddExpense} 
              onDeleteExpense={handleDeleteExpense}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;