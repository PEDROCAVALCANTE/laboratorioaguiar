import { Patient, Expense, Clinic, ServiceItem } from '../types';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc, Firestore } from 'firebase/firestore';

// === CONFIGURAÇÃO FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyCbwzPY47O3wKHQsnt0FEwUc4ubbVo7b5g",
  authDomain: "lab-aguiar.firebaseapp.com",
  projectId: "lab-aguiar",
  storageBucket: "lab-aguiar.firebasestorage.app",
  messagingSenderId: "674986592054",
  appId: "1:674986592054:web:afdcb120b73eeb4bd25597"
};

// Variáveis de controle
let db: Firestore | null = null;
let isConnected = false;

// Inicialização Segura
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isConnected = true;
    console.log("🔥 Firebase conectado com sucesso!");
  } else {
    console.log("⚠️ Credenciais do Firebase não configuradas. Rodando em modo Offline (Local).");
  }
} catch (error) {
  console.error("Erro ao conectar Firebase:", error);
  isConnected = false;
}

// === HELPERS LOCAIS (FALLBACK) ===
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
  
  testConnection: async (): Promise<boolean> => {
    return isConnected;
  },

  // --- PACIENTES ---
  getPatients: async (): Promise<Patient[]> => {
    if (isConnected && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'patients'));
        const cloudData = querySnapshot.docs.map(d => d.data() as Patient);
        
        // Sincronia Simples: Atualiza o cache local com o que veio da nuvem
        setLocal('lab_patients', cloudData);
        return cloudData;
      } catch (e) {
        console.warn("Offline ou erro de rede. Usando dados locais.", e);
        return getLocal<Patient>('lab_patients');
      }
    }
    return getLocal<Patient>('lab_patients');
  },

  savePatient: async (patient: Patient) => {
    // 1. Salva Local (Sempre funciona, feedback instantâneo)
    const list = getLocal<Patient>('lab_patients');
    const idx = list.findIndex(p => p.id === patient.id);
    if (idx >= 0) list[idx] = patient;
    else list.push(patient);
    setLocal('lab_patients', list);

    // 2. Salva Nuvem (Se conectado)
    if (isConnected && db) {
      try {
        await setDoc(doc(db, 'patients', patient.id), patient);
      } catch (e) { console.error("Erro ao salvar na nuvem:", e); }
    }
  },

  deletePatient: async (id: string) => {
    const list = getLocal<Patient>('lab_patients');
    setLocal('lab_patients', list.filter(p => p.id !== id));

    if (isConnected && db) {
      try {
        await deleteDoc(doc(db, 'patients', id));
      } catch (e) { console.error("Erro ao deletar na nuvem:", e); }
    }
  },

  // --- DESPESAS ---
  getExpenses: async (): Promise<Expense[]> => {
    if (isConnected && db) {
        try {
          const snapshot = await getDocs(collection(db, 'expenses'));
          const cloudData = snapshot.docs.map(d => d.data() as Expense);
          setLocal('lab_expenses', cloudData);
          return cloudData;
        } catch (e) { return getLocal<Expense>('lab_expenses'); }
    }
    return getLocal<Expense>('lab_expenses');
  },

  saveExpense: async (expense: Expense) => {
    const list = getLocal<Expense>('lab_expenses');
    const idx = list.findIndex(e => e.id === expense.id);
    if (idx >= 0) list[idx] = expense;
    else list.push(expense);
    setLocal('lab_expenses', list);

    if (isConnected && db) {
        await setDoc(doc(db, 'expenses', expense.id), expense);
    }
  },

  deleteExpense: async (id: string) => {
    const list = getLocal<Expense>('lab_expenses');
    setLocal('lab_expenses', list.filter(e => e.id !== id));

    if (isConnected && db) {
        await deleteDoc(doc(db, 'expenses', id));
    }
  },

  // --- CLÍNICAS ---
  getClinics: async (): Promise<Clinic[]> => {
    if (isConnected && db) {
        try {
          const snapshot = await getDocs(collection(db, 'clinics'));
          const cloudData = snapshot.docs.map(d => d.data() as Clinic);
          setLocal('lab_clinics', cloudData);
          return cloudData;
        } catch (e) { return getLocal<Clinic>('lab_clinics'); }
    }
    return getLocal<Clinic>('lab_clinics');
  },

  saveClinic: async (clinic: Clinic) => {
    const list = getLocal<Clinic>('lab_clinics');
    const idx = list.findIndex(c => c.id === clinic.id);
    if (idx >= 0) list[idx] = clinic;
    else list.push(clinic);
    setLocal('lab_clinics', list);

    if (isConnected && db) {
        await setDoc(doc(db, 'clinics', clinic.id), clinic);
    }
  },

  deleteClinic: async (id: string) => {
    const list = getLocal<Clinic>('lab_clinics');
    setLocal('lab_clinics', list.filter(c => c.id !== id));
    if (isConnected && db) {
        await deleteDoc(doc(db, 'clinics', id));
    }
  },

  // --- SERVIÇOS ---
  getServices: async (): Promise<ServiceItem[]> => {
    if (isConnected && db) {
        try {
          const snapshot = await getDocs(collection(db, 'services'));
          const cloudData = snapshot.docs.map(d => d.data() as ServiceItem);
          setLocal('lab_services', cloudData);
          return cloudData;
        } catch (e) { return getLocal<ServiceItem>('lab_services'); }
    }
    return getLocal<ServiceItem>('lab_services');
  },

  saveService: async (service: ServiceItem) => {
    const list = getLocal<ServiceItem>('lab_services');
    const idx = list.findIndex(s => s.id === service.id);
    if (idx >= 0) list[idx] = service;
    else list.push(service);
    setLocal('lab_services', list);

    if (isConnected && db) {
        await setDoc(doc(db, 'services', service.id), service);
    }
  },

  deleteService: async (id: string) => {
    const list = getLocal<ServiceItem>('lab_services');
    setLocal('lab_services', list.filter(s => s.id !== id));
    if (isConnected && db) {
        await deleteDoc(doc(db, 'services', id));
    }
  }
};