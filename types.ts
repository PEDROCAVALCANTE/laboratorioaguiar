
export enum WorkflowStatus {
  ENTRADA = 'Entrada',
  EM_PRODUCAO = 'Em Produção',
  ENVIADO_CLINICA = 'Enviado para Clínica',
  RETORNO_AJUSTE = 'Retorno para Ajuste',
  REENVIO_CLINICA = 'Reenvio para Clínica',
  CONCLUIDO = 'Concluído'
}

export enum PaymentStatus {
  PENDENTE = 'Pendente',
  PAGO = 'Pago'
}

export interface WorkflowStep {
  id: string;
  status: WorkflowStatus;
  date: string; // ISO String
  notes: string;
}

export interface Patient {
  id: string;
  name: string;
  clinic: string;
  doctorName: string;
  doctorPhone: string;
  prosthesisType: string;
  serviceValue: number;
  laborCost: number;
  entryDate: string; // ISO String
  dueDate: string; // ISO String
  notes: string;
  paymentStatus: PaymentStatus;
  workflowHistory: WorkflowStep[];
  currentStatus: WorkflowStatus;
  isActive: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO String
  category: string; // Material, Funcionário, Aluguel, Outros
}

export interface Clinic {
  id: string;
  name: string;
  doctorName: string;
  phone?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
}

export interface DashboardStats {
  activePatients: number;
  completedPatients: number;
  inProduction: number;
  inRework: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}
