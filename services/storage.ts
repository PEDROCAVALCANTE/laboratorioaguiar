import { Patient, Expense, Clinic, ServiceItem } from '../types';

// === HELPERS LOCAIS ===
// Usados para persistência local (LocalStorage)
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
// Firebase desativado devido a erros de módulo no ambiente.
// Operando exclusivamente em modo offline via LocalStorage.
export const StorageService = {
  
  // Conexão e Configuração
  testConnection: async (): Promise<boolean> => {
    console.warn("Modo Offline: Firebase desativado.");
    return false;
  },

  setFirebaseConfig: async (configJson: string): Promise<boolean> => {
    // Stub para manter compatibilidade com a interface
    console.log("Configuração ignorada (modo offline forçado):", configJson);
    return false;
  },

  disconnectFirebase: () => {
    localStorage.removeItem('labpro_firebase_config');
    window.location.reload();
  },

  // --- PACIENTES ---
  getPatients: async (): Promise<Patient[]> => {
    return getLocal<Patient>('lab_patients');
  },

  savePatient: async (patient: Patient) => {
    const list = getLocal<Patient>('lab_patients');
    const idx = list.findIndex(p => p.id === patient.id);
    if (idx >= 0) list[idx] = patient;
    else list.push(patient);
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
    if (idx >= 0) list[idx] = expense;
    else list.push(expense);
    setLocal('lab_expenses', list);
  },

  deleteExpense: async (id: string) => {
    const list = getLocal<Expense>('lab_expenses');
    setLocal('lab_expenses', list.filter(e => e.id !== id));
  },

  // --- CLÍNICAS ---
  getClinics: async (): Promise<Clinic[]> => {
    return getLocal<Clinic>('lab_clinics');
  },

  saveClinic: async (clinic: Clinic) => {
    const list = getLocal<Clinic>('lab_clinics');
    const idx = list.findIndex(c => c.id === clinic.id);
    if (idx >= 0) list[idx] = clinic;
    else list.push(clinic);
    setLocal('lab_clinics', list);
  },

  deleteClinic: async (id: string) => {
    const list = getLocal<Clinic>('lab_clinics');
    setLocal('lab_clinics', list.filter(c => c.id !== id));
  },

  // --- SERVIÇOS ---
  getServices: async (): Promise<ServiceItem[]> => {
    return getLocal<ServiceItem>('lab_services');
  },

  saveService: async (service: ServiceItem) => {
    const list = getLocal<ServiceItem>('lab_services');
    const idx = list.findIndex(s => s.id === service.id);
    if (idx >= 0) list[idx] = service;
    else list.push(service);
    setLocal('lab_services', list);
  },

  deleteService: async (id: string) => {
    const list = getLocal<ServiceItem>('lab_services');
    setLocal('lab_services', list.filter(s => s.id !== id));
  }
};