import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, Firestore } from "firebase/firestore";
import { Patient, Expense, Clinic, ServiceItem } from '../types';

// === CONFIGURAÇÃO DO FIREBASE (PROJETO: LAB AGUIAR) ===
const HARDCODED_CONFIG = {
  apiKey: "AIzaSyCbwzPY47O3wKHQsnt0FEwUc4ubbVo7b5g",
  authDomain: "lab-aguiar.firebaseapp.com",
  projectId: "lab-aguiar",
  storageBucket: "lab-aguiar.firebasestorage.app",
  messagingSenderId: "674986592054",
  appId: "1:674986592054:web:afdcb120b73eeb4bd25597"
};

// === CONFIGURAÇÃO DINÂMICA ===
let db: Firestore | null = null;

// Inicializa o Firebase
const initFirebase = () => {
  try {
    let config = HARDCODED_CONFIG;
    
    // Verifica se há configuração salva no localStorage que substitua a padrão (opcional)
    const savedConfig = localStorage.getItem('labpro_firebase_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.apiKey) config = parsed;
      } catch (e) {
        console.warn("Configuração salva inválida, usando padrão.");
      }
    }

    // Inicialização
    const app = initializeApp(config);
    
    // O getFirestore irá utilizar a instância 'app' inicializada acima.
    // Graças ao importmap correto, a instância de 'firebase/app' usada aqui
    // é a mesma que 'firebase/firestore' espera.
    db = getFirestore(app);
    
    console.log(`Firebase inicializado com sucesso! (Projeto: ${config.projectId})`);
    return true;

  } catch (e) {
    console.error("Erro ao inicializar Firebase:", e);
    console.warn("Entrando em modo offline (Local Storage).");
    db = null;
    return false;
  }
};

// Executa inicialização
initFirebase();

// === HELPERS LOCAIS (FALLBACK) ===
// Usados quando o Firebase não está disponível ou offline
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
export const StorageService = {
  
  // Conexão e Configuração
  testConnection: async (): Promise<boolean> => {
    return !!db;
  },

  setFirebaseConfig: async (configJson: string): Promise<boolean> => {
    try {
      const config = JSON.parse(configJson);
      // Teste básico de estrutura
      if (!config.apiKey || !config.projectId) throw new Error("Configuração inválida");
      
      // Salva e recarrega
      localStorage.setItem('labpro_firebase_config', JSON.stringify(config));
      window.location.reload();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  disconnectFirebase: () => {
    localStorage.removeItem('labpro_firebase_config');
    window.location.reload();
  },

  // --- PACIENTES ---
  getPatients: async (): Promise<Patient[]> => {
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        const patients: Patient[] = [];
        querySnapshot.forEach((doc: any) => patients.push(doc.data() as Patient));
        return patients;
      } catch (e) {
        console.error("Erro ao ler Firebase:", e);
        // Fallback silencioso para local se falhar a rede, opcional
        throw e; 
      }
    }
    return getLocal<Patient>('lab_patients');
  },

  savePatient: async (patient: Patient) => {
    if (db) {
      await setDoc(doc(db, "patients", patient.id), patient);
    } else {
      const list = getLocal<Patient>('lab_patients');
      const idx = list.findIndex(p => p.id === patient.id);
      if (idx >= 0) list[idx] = patient;
      else list.push(patient);
      setLocal('lab_patients', list);
    }
  },

  deletePatient: async (id: string) => {
    if (db) {
      await deleteDoc(doc(db, "patients", id));
    } else {
      const list = getLocal<Patient>('lab_patients');
      setLocal('lab_patients', list.filter(p => p.id !== id));
    }
  },

  // --- DESPESAS ---
  getExpenses: async (): Promise<Expense[]> => {
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, "expenses"));
        const expenses: Expense[] = [];
        querySnapshot.forEach((doc: any) => expenses.push(doc.data() as Expense));
        return expenses;
      } catch (e) { console.error(e); throw e; }
    }
    return getLocal<Expense>('lab_expenses');
  },

  saveExpense: async (expense: Expense) => {
    if (db) {
      await setDoc(doc(db, "expenses", expense.id), expense);
    } else {
      const list = getLocal<Expense>('lab_expenses');
      const idx = list.findIndex(e => e.id === expense.id);
      if (idx >= 0) list[idx] = expense;
      else list.push(expense);
      setLocal('lab_expenses', list);
    }
  },

  deleteExpense: async (id: string) => {
    if (db) {
      await deleteDoc(doc(db, "expenses", id));
    } else {
      const list = getLocal<Expense>('lab_expenses');
      setLocal('lab_expenses', list.filter(e => e.id !== id));
    }
  },

  // --- CLÍNICAS ---
  getClinics: async (): Promise<Clinic[]> => {
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, "clinics"));
        const clinics: Clinic[] = [];
        querySnapshot.forEach((doc: any) => clinics.push(doc.data() as Clinic));
        return clinics;
      } catch (e) { console.error(e); return []; }
    }
    return getLocal<Clinic>('lab_clinics');
  },

  saveClinic: async (clinic: Clinic) => {
    if (db) {
      await setDoc(doc(db, "clinics", clinic.id), clinic);
    } else {
      const list = getLocal<Clinic>('lab_clinics');
      const idx = list.findIndex(c => c.id === clinic.id);
      if (idx >= 0) list[idx] = clinic;
      else list.push(clinic);
      setLocal('lab_clinics', list);
    }
  },

  deleteClinic: async (id: string) => {
    if (db) {
      await deleteDoc(doc(db, "clinics", id));
    } else {
      const list = getLocal<Clinic>('lab_clinics');
      setLocal('lab_clinics', list.filter(c => c.id !== id));
    }
  },

  // --- SERVIÇOS ---
  getServices: async (): Promise<ServiceItem[]> => {
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const services: ServiceItem[] = [];
        querySnapshot.forEach((doc: any) => services.push(doc.data() as ServiceItem));
        return services;
      } catch (e) { console.error(e); return []; }
    }
    return getLocal<ServiceItem>('lab_services');
  },

  saveService: async (service: ServiceItem) => {
    if (db) {
      await setDoc(doc(db, "services", service.id), service);
    } else {
      const list = getLocal<ServiceItem>('lab_services');
      const idx = list.findIndex(s => s.id === service.id);
      if (idx >= 0) list[idx] = service;
      else list.push(service);
      setLocal('lab_services', list);
    }
  },

  deleteService: async (id: string) => {
    if (db) {
      await deleteDoc(doc(db, "services", id));
    } else {
      const list = getLocal<ServiceItem>('lab_services');
      setLocal('lab_services', list.filter(s => s.id !== id));
    }
  }
};