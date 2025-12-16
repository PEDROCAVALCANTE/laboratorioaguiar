import React, { useState, useRef } from 'react';
import { Patient, WorkflowStatus, PaymentStatus, Clinic, ServiceItem } from '../types';
import { Plus, Search, Filter, Calendar, DollarSign, User, AlertCircle, Edit2, Trash2, FileText, ChevronRight, CheckCircle, Printer, X, Briefcase } from 'lucide-react';
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

// Helpers
const parseDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};
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

  // Minimalist Inputs
  const inputClassName = "w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all placeholder:text-slate-400";
  const labelClassName = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 ml-1";

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
    // (Logic identical to previous implementation)
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
          status: WorkflowStatus.PLANO_CERA, 
          date: new Date().toISOString(), 
          notes: 'Cadastro inicial'
        }],
        currentStatus: WorkflowStatus.PLANO_CERA,
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
                    <style>@media print { @page { margin: 1cm; size: A4; } body { -webkit-print-color-adjust: exact; } }</style>
                </head>
                <body>${printContents}<script>setTimeout(() => { window.print(); window.close(); }, 500);</script></body>
                </html>
            `);
            doc.close();
            setTimeout(() => { document.body.removeChild(iframe); }, 2000);
        }
    }
  };

  const getStatusBadge = (status: WorkflowStatus) => {
    const styles = {
      [WorkflowStatus.PLANO_CERA]: 'bg-slate-100 text-slate-600 ring-slate-200',
      [WorkflowStatus.MOLDEIRA_INDIVIDUAL]: 'bg-blue-50 text-blue-700 ring-blue-200',
      [WorkflowStatus.MONTAGEM_DENTES]: 'bg-amber-50 text-amber-700 ring-amber-200',
      [WorkflowStatus.REMONTAR_DENTES]: 'bg-red-50 text-red-700 ring-red-200',
      [WorkflowStatus.ACRILIZAR]: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
      [WorkflowStatus.FINALIZADO]: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${styles[status]}`}>
            {status}
        </span>
    );
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
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pacientes</h1>
           <p className="text-sm text-slate-500 font-light">Gerencie ordens de serviço e status</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-teal-200 flex items-center gap-2 text-sm font-semibold"
        >
          <Plus size={18} /> Novo Paciente
        </button>
      </div>

      {/* Filter Bar - Clean White Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-1.5 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, clínica ou dentista..." 
            className="w-full pl-10 pr-4 py-2.5 bg-transparent rounded-lg text-sm outline-none text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-px bg-slate-100 hidden sm:block mx-1"></div>
        <div className="flex items-center gap-2 px-2">
          <Filter className="text-slate-400" size={16} />
          <select 
            className="p-2 bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer hover:text-slate-800"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Em Aberto</option>
            <option value="COMPLETED">Finalizados</option>
          </select>
        </div>
      </div>

      {/* Patient List - Minimal Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPatients.map(patient => (
          <div 
             key={patient.id} 
             onClick={() => openWorkflow(patient)}
             className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all cursor-pointer group"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
               {/* Left: Main Info */}
               <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between md:justify-start gap-3">
                     <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{patient.name}</h3>
                     {getStatusBadge(patient.currentStatus)}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                         <Briefcase size={14} className="text-slate-300" />
                         <span className="font-medium text-slate-600">{patient.clinic}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <User size={14} className="text-slate-300" />
                         <span>{patient.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Calendar size={14} className="text-slate-300" />
                         <span>Entrada: {new Date(patient.entryDate).toLocaleDateString()}</span>
                      </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-50 mt-1 flex items-center justify-between md:justify-start gap-6">
                      <div className="text-xs text-slate-400">
                          Prótese: <span className="text-slate-700 font-medium">{patient.prosthesisType}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                          Valor: <span className="text-teal-600 font-bold">R$ {patient.serviceValue.toFixed(2)}</span>
                      </div>
                  </div>
               </div>

               {/* Right: Actions */}
               <div className="flex md:flex-col justify-end items-center gap-2 pl-0 md:pl-4 md:border-l border-slate-50">
                  {patient.currentStatus === WorkflowStatus.FINALIZADO && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); setGuidePatient(patient); }}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          title="Imprimir Guia"
                      >
                          <Printer size={18} />
                      </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenForm(patient); }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPatientToDelete(patient); }}
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
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Nenhum paciente encontrado com esses filtros.</p>
          </div>
        )}
      </div>

      {/* MODAL - Minimalist & Clean */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-slate-800">{isEditing ? 'Editar Paciente' : 'Novo Paciente'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition"><X size={20} /></button>
            </div>

            <div className="flex border-b border-slate-50">
                <button type="button" onClick={() => setActiveModalTab('info')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeModalTab === 'info' ? 'text-teal-600 border-teal-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>Dados</button>
                <button type="button" onClick={() => setActiveModalTab('services')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeModalTab === 'services' ? 'text-teal-600 border-teal-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>Serviços</button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="space-y-6">
                
                {/* Info Tab */}
                <div className={activeModalTab === 'info' ? 'block space-y-5 animate-in fade-in slide-in-from-left-2 duration-200' : 'hidden'}>
                    <div>
                        <label className={labelClassName}>Nome do Paciente</label>
                        <input required={activeModalTab === 'info'} type="text" className={inputClassName} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome completo" />
                    </div>
                    
                    <div>
                        <label className={labelClassName}>Clínica</label>
                        <input required={activeModalTab === 'info'} type="text" list="clinic-catalog" className={inputClassName} value={formData.clinic} onChange={e => setFormData({...formData, clinic: e.target.value})} placeholder="Selecione ou digite" />
                        <datalist id="clinic-catalog">{clinicsList.map(c => <option key={c.id} value={c.name} />)}</datalist>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClassName}>Dentista</label>
                            <input required={activeModalTab === 'info'} type="text" className={inputClassName} value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClassName}>Telefone</label>
                            <input required={activeModalTab === 'info'} type="text" className={inputClassName} value={formData.doctorPhone} onChange={e => setFormData({...formData, doctorPhone: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                         <button type="button" onClick={() => setActiveModalTab('services')} className="text-teal-600 text-sm font-semibold hover:bg-teal-50 px-4 py-2 rounded-lg transition flex items-center gap-1">Próximo <ChevronRight size={16} /></button>
                    </div>
                </div>

                {/* Services Tab */}
                <div className={activeModalTab === 'services' ? 'block space-y-5 animate-in fade-in slide-in-from-right-2 duration-200' : 'hidden'}>
                     <div>
                        <label className={labelClassName}>Tipo de Prótese</label>
                        <input required={activeModalTab === 'services'} type="text" list="service-catalog" className={inputClassName} value={formData.prosthesisType} onChange={handleProsthesisTypeChange} placeholder="Selecione..." />
                        <datalist id="service-catalog">{servicesList.map(s => <option key={s.id} value={s.name}>{`R$ ${s.price.toFixed(2)}`}</option>)}</datalist>
                     </div>

                     <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className={labelClassName}>Valor (R$)</label>
                            <input required={activeModalTab === 'services'} type="number" step="0.01" className={inputClassName} value={formData.serviceValue} onChange={e => setFormData({...formData, serviceValue: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label className={labelClassName}>Pagamento</label>
                            <select className={inputClassName} value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value as PaymentStatus})}>
                                <option value={PaymentStatus.PENDENTE}>Pendente</option>
                                <option value={PaymentStatus.PAGO}>Pago</option>
                            </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className={labelClassName}>Entrada</label>
                            <div className="w-full">
                              <DatePicker selected={parseDate(formData.entryDate)} onChange={(date: Date | null) => { if (date) setFormData({...formData, entryDate: formatDate(date)}); }} dateFormat="dd/MM/yyyy" locale="pt-BR" className={inputClassName} wrapperClassName="w-full" required={activeModalTab === 'services'} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClassName}>Entrega</label>
                            <div className="w-full">
                              <DatePicker selected={parseDate(formData.dueDate)} onChange={(date: Date | null) => { if (date) setFormData({...formData, dueDate: formatDate(date)}); }} dateFormat="dd/MM/yyyy" locale="pt-BR" className={inputClassName} wrapperClassName="w-full" required={activeModalTab === 'services'} />
                            </div>
                        </div>
                     </div>
                     <div>
                        <label className={labelClassName}>Observações</label>
                        <textarea className={inputClassName} rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Anotações opcionais..."></textarea>
                     </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-50 flex justify-end gap-3">
                 {showSuccess ? (
                   <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl font-medium text-sm animate-in fade-in">
                     <CheckCircle size={18} /> Salvo!
                   </div>
                 ) : (
                   <>
                     <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition">Cancelar</button>
                     <button type="submit" className="px-6 py-2.5 text-sm bg-slate-800 text-white rounded-xl hover:bg-slate-900 font-medium shadow-lg shadow-slate-200 transition-all transform active:scale-95">Salvar Paciente</button>
                   </>
                 )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95">
             <div className="text-center">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Trash2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Excluir Registro?</h3>
                <p className="text-sm text-slate-500 mt-2 mb-6">Essa ação não pode ser desfeita. O paciente <strong>{patientToDelete.name}</strong> será removido permanentemente.</p>
                <div className="flex gap-3">
                   <button onClick={() => setPatientToDelete(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition">Cancelar</button>
                   <button onClick={() => { onDeletePatient(patientToDelete.id); setPatientToDelete(null); }} className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-200 transition">Sim, Excluir</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Guide Modal (Hidden Logic reused) */}
      {guidePatient && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
             {/* ... (Print Modal Logic - Keeping structure but ensuring clean background) ... */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col h-[90vh]">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <Printer size={18} className="text-teal-600"/> Guia de Fechamento
                  </h3>
                  <div className="flex gap-2">
                     <button onClick={handlePrint} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900">Imprimir</button>
                     <button onClick={() => setGuidePatient(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
                   {/* Print Content Container */}
                   <div ref={printRef} className="bg-white p-12 max-w-2xl mx-auto shadow-sm min-h-[800px] flex flex-col relative text-slate-900">
                      <div className="flex items-center justify-center mb-10"><div className="w-40 h-32 flex items-center justify-center"><img src="https://iili.io/fYtBdqF.png" alt="Logo" className="w-full h-full object-contain"/></div></div>
                      <div className="text-center mb-10"><h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-100 inline-block px-6 pb-2">{guidePatient.doctorName}</h2><p className="text-sm text-slate-500 mt-2 font-medium">{guidePatient.clinic}</p></div>
                      <div className="mb-10 text-base text-slate-600 leading-relaxed text-justify bg-slate-50 p-8 rounded-xl border border-slate-100"><p>Declaro para devidos fins de fechamento e conferência que o serviço laboratorial referente ao paciente <strong className="text-slate-900"> {guidePatient.name} </strong> foi concluído com sucesso. O trabalho realizado consiste em <strong className="text-slate-900"> {guidePatient.prosthesisType} </strong>, entregue conforme especificações técnicas solicitadas.</p></div>
                      <div className="mb-12"><table className="w-full border-collapse"><thead><tr className="border-b-2 border-slate-800"><th className="py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Paciente</th><th className="py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Trabalho</th><th className="py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Valor</th></tr></thead><tbody><tr className="border-b border-slate-200"><td className="py-4 text-sm text-slate-800 font-medium">{guidePatient.name}</td><td className="py-4 text-sm text-slate-600">{guidePatient.prosthesisType}</td><td className="py-4 text-right text-sm font-bold text-slate-800">{guidePatient.serviceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr></tbody><tfoot><tr className="border-t-2 border-slate-800"><td colSpan={2} className="py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Total a Pagar:</td><td className="py-4 text-right text-xl font-black text-slate-900">{guidePatient.serviceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr></tfoot></table></div>
                      <div className="mt-auto"><div className="text-xs text-slate-500 mb-6 font-medium"><p>Marcos Antônio Lima Aguiar CPF: 012.271.432-65</p><p>Fone: (62) 98151-6879</p></div><div className="text-center text-[10px] text-slate-400 italic border-t border-slate-100 pt-6">"Por isso, vos digo que tudo o que pedirdes, orando, crede que o recebereis e tê-lo-eis."</div></div>
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