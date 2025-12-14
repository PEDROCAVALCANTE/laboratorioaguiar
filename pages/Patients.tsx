import React, { useState } from 'react';
import { Patient, WorkflowStatus, PaymentStatus } from '../types';
import { Plus, Search, Filter, Phone, Calendar, DollarSign, User, AlertCircle, Edit2, Trash2, FileText, ChevronRight } from 'lucide-react';
import PatientWorkflow from './PatientWorkflow';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';

registerLocale('pt-BR', ptBR);

interface PatientsProps {
  patients: Patient[];
  onAddPatient: (p: Patient) => void;
  onUpdatePatient: (p: Patient) => void;
  onDeletePatient: (id: string) => void;
}

const SERVICE_CATALOG = [
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

// Helper para converter string YYYY-MM-DD para Date local
const parseDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Helper para converter Date para string YYYY-MM-DD local
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const Patients: React.FC<PatientsProps> = ({ patients, onAddPatient, onUpdatePatient, onDeletePatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'services'>('info');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);

  // Form State
  const initialFormState: Partial<Patient> = {
    name: '', clinic: '', doctorName: '', doctorPhone: '', prosthesisType: '',
    serviceValue: 0, laborCost: 0, notes: '', paymentStatus: PaymentStatus.PENDENTE,
    entryDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState<Partial<Patient>>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  // Styling Constants
  const inputClassName = "w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-sm font-semibold text-slate-700 mb-1.5";

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || 
                          (filterStatus === 'ACTIVE' ? p.isActive : !p.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleOpenForm = (patient?: Patient) => {
    setActiveModalTab('info'); // Reset to first tab
    if (patient) {
      setFormData({
        ...patient,
        entryDate: patient.entryDate.split('T')[0],
        dueDate: patient.dueDate.split('T')[0]
      });
      setIsEditing(true);
    } else {
      setFormData(initialFormState);
      setIsEditing(false);
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && formData.id) {
       // Update basic info only, preserves workflow
       const original = patients.find(p => p.id === formData.id);
       if (!original) return;

       const updated: Patient = {
         ...original,
         name: formData.name!,
         clinic: formData.clinic!,
         doctorName: formData.doctorName!,
         doctorPhone: formData.doctorPhone!,
         prosthesisType: formData.prosthesisType!,
         serviceValue: Number(formData.serviceValue),
         laborCost: 0, // Removido do formulário, define como 0
         entryDate: new Date(formData.entryDate!).toISOString(),
         dueDate: new Date(formData.dueDate!).toISOString(),
         notes: formData.notes || '',
         paymentStatus: formData.paymentStatus as PaymentStatus,
       };
       onUpdatePatient(updated);
    } else {
      // Create new
      const newPatient: Patient = {
        id: Date.now().toString(),
        name: formData.name!,
        clinic: formData.clinic!,
        doctorName: formData.doctorName!,
        doctorPhone: formData.doctorPhone!,
        prosthesisType: formData.prosthesisType!,
        serviceValue: Number(formData.serviceValue),
        laborCost: 0, // Removido do formulário, define como 0
        entryDate: new Date(formData.entryDate!).toISOString(),
        dueDate: new Date(formData.dueDate!).toISOString(),
        notes: formData.notes || '',
        paymentStatus: formData.paymentStatus as PaymentStatus,
        workflowHistory: [{
          id: 'initial', 
          status: WorkflowStatus.ENTRADA, 
          date: new Date().toISOString(), 
          notes: 'Cadastro inicial'
        }],
        currentStatus: WorkflowStatus.ENTRADA,
        isActive: true
      };
      onAddPatient(newPatient);
    }
    setIsFormOpen(false);
  };

  const openWorkflow = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsWorkflowOpen(true);
  };

  const getStatusBadge = (status: WorkflowStatus) => {
    const styles = {
      [WorkflowStatus.ENTRADA]: 'bg-slate-100 text-slate-700',
      [WorkflowStatus.EM_PRODUCAO]: 'bg-blue-100 text-blue-700',
      [WorkflowStatus.ENVIADO_CLINICA]: 'bg-indigo-100 text-indigo-700',
      [WorkflowStatus.RETORNO_AJUSTE]: 'bg-red-100 text-red-700',
      [WorkflowStatus.REENVIO_CLINICA]: 'bg-purple-100 text-purple-700',
      [WorkflowStatus.CONCLUIDO]: 'bg-emerald-100 text-emerald-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status]}`}>{status}</span>;
  };

  const handleProsthesisTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const service = SERVICE_CATALOG.find(s => s.name === value);
    
    setFormData(prev => ({
        ...prev,
        prosthesisType: value,
        serviceValue: service ? service.price : prev.serviceValue
    }));
  };

  // Garante que pegamos a versão mais atualizada do paciente da lista
  const activeWorkflowPatient = selectedPatient 
    ? patients.find(p => p.id === selectedPatient.id) || selectedPatient 
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Pacientes</h2>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Novo Paciente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, clínica ou médico..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700 transition-all placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={20} />
          <select 
            className="p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700 transition-all"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Em Aberto</option>
            <option value="COMPLETED">Concluídos</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPatients.map(patient => (
          <div key={patient.id} className="bg-white rounded-xl shadow-sm border border-slate-100 hover:border-teal-200 transition-colors overflow-hidden group">
            <div className="p-5 flex flex-col md:flex-row justify-between gap-4">
              {/* Left Info */}
              <div className="flex-1 cursor-pointer" onClick={() => openWorkflow(patient)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{patient.name}</h3>
                    {getStatusBadge(patient.currentStatus)}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 mt-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                     <AlertCircle size={16} className="text-slate-400" />
                     <span className="font-medium text-slate-800">{patient.clinic}</span>
                  </div>
                   <div className="flex items-center gap-2">
                     <User size={16} className="text-slate-400" />
                     <span>{patient.doctorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar size={16} className="text-slate-400" />
                     <span>Entrada: {new Date(patient.entryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <DollarSign size={16} className="text-slate-400" />
                     <span>Serviço: <span className="text-teal-600 font-semibold">R$ {patient.serviceValue.toFixed(2)}</span></span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                   Prótese: <span className="text-slate-600 font-medium">{patient.prosthesisType}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col justify-end items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
                <button 
                  onClick={() => handleOpenForm(patient)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => onDeletePatient(patient.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Nenhum paciente encontrado.
          </div>
        )}
      </div>

      {/* Patient Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0 bg-white rounded-t-xl">
              <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Editar Paciente' : 'Novo Paciente'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition"><Plus size={24} className="rotate-45" /></button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
                <button
                    type="button"
                    onClick={() => setActiveModalTab('info')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-b-2 ${
                        activeModalTab === 'info' 
                        ? 'text-teal-600 border-teal-600 bg-white' 
                        : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <User size={18} />
                    Dados do Paciente
                </button>
                <button
                    type="button"
                    onClick={() => setActiveModalTab('services')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-b-2 ${
                        activeModalTab === 'services' 
                        ? 'text-teal-600 border-teal-600 bg-white' 
                        : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <FileText size={18} />
                    Serviços e Valores
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <div className="space-y-6">
                
                {/* Tab 1: Dados do Paciente */}
                <div className={activeModalTab === 'info' ? 'block animate-in fade-in slide-in-from-left-4 duration-300' : 'hidden'}>
                    <div className="space-y-5">
                        <div>
                            <label className={labelClassName}>Nome do Paciente</label>
                            <input required={activeModalTab === 'info'} type="text" className={inputClassName} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: João da Silva" />
                        </div>
                        
                        <div className="h-px bg-slate-200/60 my-2"></div>
                        
                        <div>
                            <label className={labelClassName}>Clínica</label>
                            <input required={activeModalTab === 'info'} type="text" className={inputClassName} value={formData.clinic} onChange={e => setFormData({...formData, clinic: e.target.value})} placeholder="Ex: Clínica Sorriso" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClassName}>Médico Responsável</label>
                                <input required={activeModalTab === 'info'} type="text" className={inputClassName} value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})} placeholder="Ex: Dr. Roberto" />
                            </div>
                            <div>
                                <label className={labelClassName}>Telefone Médico</label>
                                <input required={activeModalTab === 'info'} type="text" className={inputClassName} value={formData.doctorPhone} onChange={e => setFormData({...formData, doctorPhone: e.target.value})} placeholder="Ex: (11) 99999-9999" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-10 flex justify-end">
                         <button 
                            type="button" 
                            onClick={() => setActiveModalTab('services')}
                            className="flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-50 transition border border-transparent hover:border-teal-100"
                         >
                            Próximo: Serviços <ChevronRight size={16} />
                         </button>
                    </div>
                </div>

                {/* Tab 2: Serviços e Valores */}
                <div className={activeModalTab === 'services' ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className={labelClassName}>Tipo de Prótese</label>
                            <input 
                              required={activeModalTab === 'services'} 
                              type="text" 
                              list="service-catalog"
                              className={inputClassName} 
                              value={formData.prosthesisType} 
                              onChange={handleProsthesisTypeChange} 
                              placeholder="Selecione ou digite..." 
                            />
                            <datalist id="service-catalog">
                                {SERVICE_CATALOG.map(s => (
                                    <option key={s.name} value={s.name}>{`R$ ${s.price.toFixed(2)}`}</option>
                                ))}
                            </datalist>
                            <p className="text-xs text-slate-400 mt-1">Selecione uma opção da lista para preencher o valor automaticamente.</p>
                        </div>

                         <div className="md:col-span-2">
                            <label className={labelClassName}>Valor Serviço (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-400 text-sm">R$</span>
                                <input required={activeModalTab === 'services'} type="number" step="0.01" className={`${inputClassName} pl-9`} value={formData.serviceValue} onChange={e => setFormData({...formData, serviceValue: parseFloat(e.target.value)})} />
                            </div>
                        </div>

                        <div className="md:col-span-2 h-px bg-slate-200/60 my-1"></div>

                        <div>
                            <label className={labelClassName}>Status Pagamento</label>
                            <select className={inputClassName} value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value as PaymentStatus})}>
                                <option value={PaymentStatus.PENDENTE}>Pendente</option>
                                <option value={PaymentStatus.PAGO}>Pago</option>
                            </select>
                        </div>
                        <div>
                             {/* Spacer to align grid */}
                        </div>

                        <div>
                            <label className={labelClassName}>Data Entrada</label>
                            <div className="w-full">
                              <DatePicker
                                selected={parseDate(formData.entryDate)}
                                onChange={(date: Date | null) => {
                                  if (date) {
                                    setFormData({...formData, entryDate: formatDate(date)});
                                  }
                                }}
                                dateFormat="dd/MM/yyyy"
                                locale="pt-BR"
                                className={inputClassName}
                                wrapperClassName="w-full"
                                placeholderText="Selecione a data"
                                portalId="root"
                                popperClassName="z-[60]"
                                required={activeModalTab === 'services'}
                              />
                            </div>
                        </div>
                        <div>
                            <label className={labelClassName}>Previsão Entrega</label>
                            <div className="w-full">
                              <DatePicker
                                selected={parseDate(formData.dueDate)}
                                onChange={(date: Date | null) => {
                                  if (date) {
                                    setFormData({...formData, dueDate: formatDate(date)});
                                  }
                                }}
                                dateFormat="dd/MM/yyyy"
                                locale="pt-BR"
                                className={inputClassName}
                                wrapperClassName="w-full"
                                placeholderText="Selecione a data"
                                portalId="root"
                                popperClassName="z-[60]"
                                required={activeModalTab === 'services'}
                              />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClassName}>Observações Gerais</label>
                            <textarea className={inputClassName} rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Detalhes técnicos, cor, observações..."></textarea>
                        </div>
                     </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 gap-3 border-t border-slate-100 mt-6">
                 <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium">Cancelar</button>
                 <button type="submit" className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-md shadow-teal-200/50 transition-colors">Salvar Paciente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow Modal */}
      {activeWorkflowPatient && (
        <PatientWorkflow 
          isOpen={isWorkflowOpen} 
          patient={activeWorkflowPatient} 
          onClose={() => setIsWorkflowOpen(false)}
          onUpdate={onUpdatePatient}
        />
      )}
    </div>
  );
};

export default Patients;