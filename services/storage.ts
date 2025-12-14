import { Patient, Expense } from '../types';

// === HELPERS LOCAIS ===
// Funções auxiliares para manipular o LocalStorage
const getLocal = <T>(key: string): T[] => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch { return []; }
};

const setLocal = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// === SERVIÇO DE DADOS ===
// Atualmente operando apenas com LocalStorage.
// Substitua a lógica abaixo pelo seu novo banco de dados quando necessário.
export const StorageService = {
  // Simula teste de conexão
  testConnection: async (): Promise<boolean> => {
    return true; 
  },

  // --- PACIENTES ---
  getPatients: async (): Promise<Patient[]> => {
    return getLocal<Patient>('lab_patients');
  },

  savePatient: async (patient: Patient) => {
    const list = getLocal<Patient>('lab_patients');
    const idx = list.findIndex(p => p.id === patient.id);
    
    if (idx >= 0) {
      list[idx] = patient;
    } else {
      list.push(patient);
    }
    
    setLocal('lab_patients', list);
  },

  deletePatient: async (id: string) => {
    const list = getLocal<Patient>('lab_patients');
    setLocal('lab_patients', list.filter(p => p.id !== id));
  },

  // --- DESPESAS ---
  getExpenses: async (): Promise<Expense[]> => {
    return getLocal<Expense>('lab_expenses');
  },

  saveExpense: async (expense: Expense) => {
    const list = getLocal<Expense>('lab_expenses');
    const idx = list.findIndex(e => e.id === expense.id);
    
    if (idx >= 0) {
      list[idx] = expense;
    } else {
      list.push(expense);
    }
    
    setLocal('lab_expenses', list);
  },

  deleteExpense: async (id: string) => {
    const list = getLocal<Expense>('lab_expenses');
    setLocal('lab_expenses', list.filter(e => e.id !== id));
  }
};