import React, { useState, useRef } from 'react';
import { Patient, WorkflowStatus, PaymentStatus, Clinic, ServiceItem } from '../types';
import { Plus, Search, Filter, Calendar, DollarSign, User, AlertCircle, Edit2, Trash2, FileText, ChevronRight, CheckCircle, Printer, X } from 'lucide-react';
import PatientWorkflow from './PatientWorkflow';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';

registerLocale('pt-BR', ptBR);

interface PatientsProps {
  patients: Patient[];
  clinicsList: Clinic[];
  servicesList: ServiceItem[];
  onAddPatient: (p: Patient) => void;
  onUpdatePatient: (p: Patient) => void;
  onDeletePatient: (id: string) => void;
}

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

const Patients: React.FC<PatientsProps> = ({ patients, clinicsList, servicesList, onAddPatient, onUpdatePatient, onDeletePatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'services'>('info');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null); 
  const [guidePatient, setGuidePatient] = useState<Patient | null>(null); 
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  // Form State
  const initialFormState: Partial<Patient> = {
    name: '', clinic: '', doctorName: '', doctorPhone: '', prosthesisType: '',
    serviceValue: 0, laborCost: 0, notes: '', paymentStatus: PaymentStatus.PENDENTE,
    entryDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState<Partial<Patient>>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  // Styling Constants (Minimalist)
  const inputClassName = "w-full bg-white text-slate-900 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1";

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || 
                          (filterStatus === 'ACTIVE' ? p.isActive : !p.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleOpenForm = (patient?: Patient) => {
    setActiveModalTab('info'); 
    setShowSuccess(false); 
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
         laborCost: 0, 
         entryDate: new Date(formData.entryDate!).toISOString(),
         dueDate: new Date(formData.dueDate!).toISOString(),
         notes: formData.notes || '',
         paymentStatus: formData.paymentStatus as PaymentStatus,
       };
       onUpdatePatient(updated);
    } else {
      const newPatient: Patient = {
        id: Date.now().toString(),
        name: formData.name!,
        clinic: formData.clinic!,
        doctorName: formData.doctorName!,
        doctorPhone: formData.doctorPhone!,
        prosthesisType: formData.prosthesisType!,
        serviceValue: Number(formData.serviceValue),
        laborCost: 0,
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

    setShowSuccess(true);
    setTimeout(() => {
      setIsFormOpen(false);
      setShowSuccess(false);
    }, 1500);
  };

  const openWorkflow = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsWorkflowOpen(true);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
        const printContents = printContent.innerHTML;
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute'; iframe.style.width = '0px'; iframe.style.height = '0px'; iframe.style.border = 'none';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(`
                <html>
                <head>
                    <title>Guia de Fechamento</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                        body { font-family: 'Inter', sans-serif; background: white; padding: 20px; }
                        @media print { @page { margin: 1cm; size: A4; } body { -webkit-print-color-adjust: exact; } }
                    </style>
                </head>
                <body>
                    ${printContents}
                    <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
                </body>
                </html>
            `);
            doc.close();
            setTimeout(() => { document.body.removeChild(iframe); }, 2000);
        }
    }
  };

  const getStatusBadge = (status: WorkflowStatus) => {
    const styles = {
      [WorkflowStatus.ENTRADA]: 'bg-slate-100 text-slate-700 border-slate-200',
      [WorkflowStatus.EM_PRODUCAO]: 'bg-blue-50 text-blue-700 border-blue-100',
      [WorkflowStatus.ENVIADO_CLINICA]: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      [WorkflowStatus.RETORNO_AJUSTE]: 'bg-red-50 text-red-700 border-red-100',
      [WorkflowStatus.REENVIO_CLINICA]: 'bg-purple-50 text-purple-700 border-purple-100',
      [WorkflowStatus.CONCLUIDO]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles[status]}`}>{status}</span>;
  };

  const handleProsthesisTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const service = servicesList.find(s => s.name === value);
    
    setFormData(prev => ({
        ...prev,
        prosthesisType: value,
        serviceValue: service ? service.price : prev.serviceValue
    }));
  };

  const activeWorkflowPatient = selectedPatient 
    ? patients.find(p => p.id === selectedPatient.id) || selectedPatient 
    : null;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-bold text-slate-800">Gerenciamento de Pacientes</h2>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2 shadow-sm text-sm font-medium"
        >
          <Plus size={16} /> Novo Paciente
        </button>
      </div>

      {/* Filters - More compact */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nome, clínica ou médico..." 
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700 transition-all placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={16} />
          <select 
            className="p-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700 transition-all"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Em Aberto</option>
            <option value="COMPLETED">Concluídos</option>
          </select>
        </div>
      </div>

      {/* List - Minimalist Cards */}
      <div className="grid grid-cols-1 gap-3">
        {filteredPatients.map(patient => (
          <div key={patient.id} className="bg-white rounded-xl shadow-sm border border-slate-100 hover:border-teal-200 transition-colors overflow-hidden group">
            <div className="p-4 flex flex-col md:flex-row justify-between gap-3">
              {/* Left Info */}
              <div className="flex-1 cursor-pointer" onClick={() => openWorkflow(patient)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{patient.name}</h3>
                    {getStatusBadge(patient.currentStatus)}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-6 mt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                     <AlertCircle size={14} className="text-slate-400" />
                     <span className="font-medium text-slate-700">{patient.clinic}</span>
                  </div>
                   <div className="flex items-center gap-1.5">
                     <User size={14} className="text-slate-400" />
                     <span>{patient.doctorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <Calendar size={14} className="text-slate-400" />
                     <span>Entrada: {new Date(patient.entryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <DollarSign size={14} className="text-slate-400" />
                     <span>Valor: <span className="text-teal-600 font-semibold">R$ {patient.serviceValue.toFixed(2)}</span></span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                   Prótese: <span className="text-slate-600 font-medium">{patient.prosthesisType}</span>
                </div>
              </div>

              {/* Actions - Smaller */}
              <div className="flex md:flex-col justify-end items-end gap-1.5 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-3">
                {patient.currentStatus === WorkflowStatus.CONCLUIDO && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setGuidePatient(patient);
                        }}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition"
                        title="Emitir Guia"
                    >
                        <Printer size={16} />
                    </button>
                )}

                <button 
                  onClick={() => handleOpenForm(patient)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPatientToDelete(patient);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400">
            Nenhum paciente encontrado.
          </div>
        )}
      </div>

      {/* Patient Form Modal - Minimalist inputs */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center flex-shrink-0 bg-white rounded-t-xl">
              <h3 className="text-lg font-bold text-slate-800">{isEditing ? 'Editar Paciente' : 'Novo Paciente'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition"><Plus size={20} className="rotate-45" /></button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
                <button
                    type="button"
                    onClick={() => setActiveModalTab('info')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 border-b-2 ${
                        activeModalTab === 'info' 
                        ? 'text-teal-600 border-teal-600 bg-white' 
                        : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <User size={14} />
                    Dados
                </button>
                <button
                    type="button"
                    onClick={() => setActiveModalTab('services')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 border-b-2 ${
                        activeModalTab === 'services' 
                        ? 'text-teal-600 border-teal-600 bg-white' 
                        : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <FileText size={14} />
                    Serviços
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 bg-slate-50/30">
              <div className="space-y-5">
                
                {/* Tab 1: Dados */}
                <div className={activeModalTab === 'info' ? 'block animate-in fade-in slide-in-from-left-4 duration-300' : 'hidden'}>
                    <div className="space-y-4">
                        <div>
                            <label className={labelClassName}>Nome do Paciente</label>
                            <input required={activeModalTab === 'info'} type="text" className={inputClassName} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: João da Silva" />
                        </div>
                        
                        <div className="h-px bg-slate-200/60 my-1"></div>
                        
                        <div>
                            <label className={labelClassName}>Clínica</label>
                            <input required={activeModalTab === 'info'} type="text" list="clinic-catalog" className={inputClassName} value={formData.clinic} onChange={e => setFormData({...formData, clinic: e.target.value})} placeholder="Ex: Clínica Sorriso" />
                            <datalist id="clinic-catalog">
                                {clinicsList.map(c => (
                                    <option key={c.id} value={c.name} />
                                ))}
                            </datalist>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    <div className="mt-8 flex justify-end">
                         <button 
                            type="button" 
                            onClick={() => setActiveModalTab('services')}
                            className="flex items-center gap-2 text-teal-600 text-sm font-semibold hover:text-teal-700 px-3 py-2 rounded-lg hover:bg-teal-50 transition border border-transparent hover:border-teal-100"
                         >
                            Próximo <ChevronRight size={14} />
                         </button>
                    </div>
                </div>

                {/* Tab 2: Serviços */}
                <div className={activeModalTab === 'services' ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                {servicesList.map(s => (
                                    <option key={s.id} value={s.name}>{`R$ ${s.price.toFixed(2)}`}</option>
                                ))}
                            </datalist>
                        </div>

                         <div className="md:col-span-2">
                            <label className={labelClassName}>Valor Serviço (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">R$</span>
                                <input required={activeModalTab === 'services'} type="number" step="0.01" className={`${inputClassName} pl-8`} value={formData.serviceValue} onChange={e => setFormData({...formData, serviceValue: parseFloat(e.target.value)})} />
                            </div>
                        </div>

                        <div className="md:col-span-2 h-px bg-slate-200/60 my-0"></div>

                        <div>
                            <label className={labelClassName}>Status Pagamento</label>
                            <select className={inputClassName} value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value as PaymentStatus})}>
                                <option value={PaymentStatus.PENDENTE}>Pendente</option>
                                <option value={PaymentStatus.PAGO}>Pago</option>
                            </select>
                        </div>
                        <div></div>

                        <div>
                            <label className={labelClassName}>Data Entrada</label>
                            <div className="w-full">
                              <DatePicker
                                selected={parseDate(formData.entryDate)}
                                onChange={(date: Date | null) => {
                                  if (date) setFormData({...formData, entryDate: formatDate(date)});
                                }}
                                dateFormat="dd/MM/yyyy"
                                locale="pt-BR"
                                className={inputClassName}
                                wrapperClassName="w-full"
                                placeholderText="Selecione"
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
                                  if (date) setFormData({...formData, dueDate: formatDate(date)});
                                }}
                                dateFormat="dd/MM/yyyy"
                                locale="pt-BR"
                                className={inputClassName}
                                wrapperClassName="w-full"
                                placeholderText="Selecione"
                                portalId="root"
                                popperClassName="z-[60]"
                                required={activeModalTab === 'services'}
                              />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClassName}>Observações Gerais</label>
                            <textarea className={inputClassName} rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Detalhes técnicos..."></textarea>
                        </div>
                     </div>
                </div>
              </div>

              <div className="flex justify-end pt-5 gap-3 border-t border-slate-100 mt-5 min-h-[70px] items-center">
                 {showSuccess ? (
                   <div className="w-full flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-bottom-2 border border-emerald-100">
                     <CheckCircle size={18} className="text-emerald-500" />
                     <span className="font-bold text-sm">Salvo com sucesso!</span>
                   </div>
                 ) : (
                   <>
                     <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium">Cancelar</button>
                     <button type="submit" className="px-5 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-sm shadow-teal-200/50 transition-colors">Salvar</button>
                   </>
                 )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Excluir Paciente?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Confirma a exclusão de <strong>{patientToDelete.name}</strong>?
                </p>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <button onClick={() => setPatientToDelete(null)} className="flex-1 py-2 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors">Cancelar</button>
                <button onClick={() => { onDeletePatient(patientToDelete.id); setPatientToDelete(null); }} className="flex-1 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium shadow-sm transition-colors">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {guidePatient && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col h-[90vh]">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <Printer size={18} className="text-teal-600"/> 
                    Guia de Fechamento
                  </h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="px-3 py-1.5 bg-slate-800 text-white rounded-md hover:bg-slate-900 flex items-center gap-2 text-xs font-medium transition-colors">
                        <Printer size={14} /> Imprimir
                    </button>
                    <button onClick={() => setGuidePatient(null)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500">
                        <X size={18} />
                    </button>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
                   <div ref={printRef} className="bg-white p-10 max-w-2xl mx-auto shadow-sm min-h-[800px] flex flex-col relative text-slate-900">
                      <div className="flex items-center justify-center mb-8">
                         <div className="w-32 h-32 flex items-center justify-center">
                            <img src="https://iili.io/fYtBdqF.png" alt="Logo" className="w-full h-full object-contain"/>
                         </div>
                      </div>
                      <div className="text-center mb-8">
                          <h2 className="text-xl font-bold text-green-800 border-b-2 border-green-100 inline-block px-4 pb-1">{guidePatient.doctorName}</h2>
                          <p className="text-xs text-slate-400 mt-2">{guidePatient.clinic}</p>
                      </div>
                      <div className="mb-8 text-sm text-slate-600 leading-relaxed text-justify bg-slate-50 p-6 rounded-lg border border-slate-100">
                          <p>Declaro para devidos fins de fechamento e conferência que o serviço laboratorial referente ao paciente <strong className="text-slate-900"> {guidePatient.name} </strong> foi concluído com sucesso. O trabalho realizado consiste em <strong className="text-slate-900"> {guidePatient.prosthesisType} </strong>, entregue conforme especificações técnicas solicitadas.</p>
                      </div>
                      <div className="mb-12">
                          <table className="w-full border-collapse">
                              <thead>
                                  <tr className="border-b-2 border-slate-800">
                                      <th className="py-2 text-left text-xs font-semibold text-slate-700 italic">Paciente</th>
                                      <th className="py-2 text-left text-xs font-semibold text-slate-700 italic">Trabalho</th>
                                      <th className="py-2 text-right text-xs font-semibold text-slate-700 italic">Valor</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr className="border-b border-slate-200">
                                      <td className="py-3 text-sm text-slate-800">{guidePatient.name}</td>
                                      <td className="py-3 text-sm text-slate-600 italic">{guidePatient.prosthesisType}</td>
                                      <td className="py-3 text-right text-sm font-bold text-slate-800">{guidePatient.serviceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                  </tr>
                              </tbody>
                              <tfoot>
                                  <tr className="border-t-2 border-slate-800">
                                      <td colSpan={2} className="py-3 text-right text-xs font-bold text-slate-700 uppercase">Total:</td>
                                      <td className="py-3 text-right text-base font-black text-slate-900">{guidePatient.serviceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                  </tr>
                              </tfoot>
                          </table>
                      </div>
                      <div className="mt-auto">
                          <div className="text-xs text-slate-500 mb-6"><p>Marcos Antônio Lima Aguiar CPF: 012.271.432-65</p><p>Fone: (62) 98151-6879</p></div>
                          <div className="text-center text-[10px] text-slate-400 italic border-t border-slate-100 pt-4">"Por isso, vos digo que tudo o que pedirdes, orando, crede que o recebereis e tê-lo-eis."</div>
                      </div>
                   </div>
               </div>
            </div>
          </div>
      )}

      {/* Workflow Modal */}
      {activeWorkflowPatient && (
        <PatientWorkflow isOpen={isWorkflowOpen} patient={activeWorkflowPatient} onClose={() => setIsWorkflowOpen(false)} onUpdate={onUpdatePatient} />
      )}
    </div>
  );
};

export default Patients;