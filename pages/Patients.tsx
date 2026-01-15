
import React, { useState, useRef } from 'react';
import { Patient, WorkflowStatus, PaymentStatus, Clinic, ServiceItem } from '../types';
import { 
  Plus, Search, Filter, Calendar, User, Edit2, Trash2, Printer, X, 
  Briefcase, CheckCircle, ChevronDown, ChevronUp, DollarSign, Info
} from 'lucide-react';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  const initialFormState: Partial<Patient> = {
    name: '', clinic: '', doctorName: '', doctorPhone: '', prosthesisType: '',
    serviceValue: 0, notes: '', paymentStatus: PaymentStatus.PENDENTE,
    entryDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState<Partial<Patient>>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  const inputClassName = "w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm";
  const labelClassName = "block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-0.5";

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.clinic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'ACTIVE' ? p.isActive : !p.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleOpenForm = (patient?: Patient) => {
    setActiveModalTab('info'); 
    if (patient) {
      setFormData({ ...patient, entryDate: patient.entryDate.split('T')[0], dueDate: patient.dueDate.split('T')[0] });
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
       onUpdatePatient({ ...original, ...formData, entryDate: new Date(formData.entryDate!).toISOString(), dueDate: new Date(formData.dueDate!).toISOString() } as Patient);
    } else {
      onAddPatient({
        id: Date.now().toString(),
        name: formData.name!, clinic: formData.clinic!, doctorName: formData.doctorName!, doctorPhone: formData.doctorPhone!,
        prosthesisType: formData.prosthesisType!, serviceValue: Number(formData.serviceValue), laborCost: 0,
        entryDate: new Date(formData.entryDate!).toISOString(), dueDate: new Date(formData.dueDate!).toISOString(),
        notes: formData.notes || '', paymentStatus: formData.paymentStatus as PaymentStatus,
        workflowHistory: [{ id: 'initial', status: WorkflowStatus.PLANO_CERA, date: new Date().toISOString(), notes: 'Cadastro inicial' }],
        currentStatus: WorkflowStatus.PLANO_CERA, isActive: true
      });
    }
    setShowSuccess(true);
    setTimeout(() => { setIsFormOpen(false); setShowSuccess(false); }, 1000);
  };

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status: WorkflowStatus) => {
    const styles = {
      [WorkflowStatus.PLANO_CERA]: 'bg-slate-100 text-slate-600',
      [WorkflowStatus.MOLDEIRA_INDIVIDUAL]: 'bg-blue-50 text-blue-700',
      [WorkflowStatus.BARRA]: 'bg-cyan-50 text-cyan-700',
      [WorkflowStatus.ARMACAO]: 'bg-orange-50 text-orange-700',
      [WorkflowStatus.MONTAGEM_DENTES]: 'bg-amber-50 text-amber-700',
      [WorkflowStatus.REMONTAR_DENTES]: 'bg-red-50 text-red-700',
      [WorkflowStatus.ACRILIZAR]: 'bg-indigo-50 text-indigo-700',
      [WorkflowStatus.FINALIZADO]: 'bg-emerald-50 text-emerald-700',
    };
    return <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-transparent whitespace-nowrap ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Header compact */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
           <h1 className="text-lg font-bold text-slate-800 tracking-tight">Pacientes</h1>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Controle de Fluxo e Registros</p>
        </div>
        <button 
          onClick={() => handleOpenForm()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
        >
          <Plus size={14} /> Novo Registro
        </button>
      </div>

      {/* Filter Bar compact */}
      <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou clínica..." 
            className="w-full pl-9 pr-4 py-1.5 bg-transparent rounded-lg text-[12px] outline-none text-slate-700 font-medium placeholder:text-slate-400" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="h-6 w-px bg-slate-100 hidden sm:block"></div>
        <select 
          className="p-1.5 bg-transparent text-[11px] font-bold text-slate-500 outline-none cursor-pointer hover:text-slate-700 transition-colors" 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Todos os Registros</option>
          <option value="ACTIVE">Trabalhos em Aberto</option>
          <option value="COMPLETED">Trabalhos Finalizados</option>
        </select>
      </div>

      {/* List Header (Desktop Only) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
        <div className="col-span-4">Paciente / Clínica</div>
        <div className="col-span-3">Trabalho</div>
        <div className="col-span-2 text-center">Status</div>
        <div className="col-span-1 text-right">Valor</div>
        <div className="col-span-2 text-right">Ações</div>
      </div>

      {/* Patient List */}
      <div className="grid grid-cols-1 gap-2">
        {filteredPatients.map(patient => {
          const isExpanded = expandedId === patient.id;
          return (
            <div 
              key={patient.id} 
              className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded ? 'border-blue-200 shadow-md ring-1 ring-blue-50' : 'border-slate-100 shadow-sm hover:border-slate-200'
              }`}
            >
              {/* Main Content Row */}
              <div 
                className="lg:grid lg:grid-cols-12 gap-4 items-center p-3 cursor-pointer group"
                onClick={() => { setSelectedPatient(patient); setIsWorkflowOpen(true); }}
              >
                {/* Mobile: Header with expansion toggle */}
                <div className="lg:col-span-4 flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-bold text-slate-800 group-hover:text-blue-700 truncate leading-tight transition-colors">
                      {patient.name}
                    </h3>
                    <div className="flex items-center gap-2 lg:hidden">
                       <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{patient.clinic}</span>
                       <button 
                         onClick={(e) => toggleExpand(e, patient.id)}
                         className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                       >
                         {isExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                       </button>
                    </div>
                    {/* Desktop Clinic/Dentist Subtext */}
                    <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                       <span className="truncate max-w-[150px]">{patient.clinic}</span>
                       <span className="opacity-30">•</span>
                       <span className="truncate">{patient.doctorName}</span>
                    </div>
                  </div>
                </div>

                {/* Work Info Column */}
                <div className="hidden lg:block lg:col-span-3">
                  <div className="text-[11px] font-semibold text-slate-600 truncate">{patient.prosthesisType}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 font-medium">Entrada: {new Date(patient.entryDate).toLocaleDateString()}</div>
                </div>

                {/* Status Column */}
                <div className="hidden lg:flex lg:col-span-2 justify-center">
                  {getStatusBadge(patient.currentStatus)}
                </div>

                {/* Value Column */}
                <div className="hidden lg:block lg:col-span-1 text-right">
                  <div className="text-[11px] font-bold text-slate-700">R$ {patient.serviceValue.toFixed(2)}</div>
                  <div className={`text-[9px] font-bold ${patient.paymentStatus === 'Pago' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {patient.paymentStatus}
                  </div>
                </div>

                {/* Actions Column (Desktop) */}
                <div className="hidden lg:flex lg:col-span-2 justify-end gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleOpenForm(patient); }} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit2 size={13}/></button>
                  <button onClick={(e) => { e.stopPropagation(); setPatientToDelete(patient); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir"><Trash2 size={13}/></button>
                </div>

                {/* Mobile: Compact Status/Actions Row */}
                <div className="lg:hidden flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                   <div className="flex items-center gap-2">
                     {getStatusBadge(patient.currentStatus)}
                     <span className="text-[11px] font-bold text-blue-600">R$ {patient.serviceValue.toFixed(2)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenForm(patient); }} className="p-1.5 text-slate-400"><Edit2 size={14}/></button>
                      <button onClick={(e) => { e.stopPropagation(); setPatientToDelete(patient); }} className="p-1.5 text-slate-400"><Trash2 size={14}/></button>
                   </div>
                </div>
              </div>

              {/* Expandable Mobile Detail Section */}
              {isExpanded && (
                <div className="lg:hidden bg-slate-50 p-3 border-t border-slate-100 space-y-2.5 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Clínica</span>
                      <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5"><Briefcase size={10} className="text-blue-500"/> {patient.clinic}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Dentista</span>
                      <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5"><User size={10} className="text-blue-500"/> {patient.doctorName}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Trabalho Solicitado</span>
                    <div className="text-[11px] font-bold text-slate-700 bg-white p-2 rounded border border-slate-100 shadow-sm">{patient.prosthesisType}</div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Entrada</span>
                        <div className="text-[10px] font-bold text-slate-600">{new Date(patient.entryDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Previsão</span>
                        <div className="text-[10px] font-bold text-blue-600">{new Date(patient.dueDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <button 
                       onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); setIsWorkflowOpen(true); }}
                       className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      Ver Detalhes <Info size={10}/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredPatients.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
               <Search size={20} />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nenhum registro encontrado</p>
            <button onClick={() => {setSearchTerm(''); setFilterStatus('ALL');}} className="text-blue-600 text-[11px] font-bold mt-2 hover:underline">Limpar Filtros</button>
          </div>
        )}
      </div>

      {/* MODAL (Cadastro) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">{isEditing ? 'Editar Registro' : 'Novo Registro'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-300 hover:text-slate-500 p-1 rounded transition-colors"><X size={18}/></button>
            </div>
            <div className="flex bg-slate-50/50 border-b border-slate-100">
                <button type="button" onClick={() => setActiveModalTab('info')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeModalTab === 'info' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>1. Cadastro</button>
                <button type="button" onClick={() => setActiveModalTab('services')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeModalTab === 'services' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>2. Trabalho</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               {activeModalTab === 'info' ? (
                 <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div><label className={labelClassName}>Nome do Paciente</label><input required className={inputClassName} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: João Silva"/></div>
                    <div><label className={labelClassName}>Clínica</label><input required list="clinic-list-form" className={inputClassName} value={formData.clinic} onChange={e => setFormData({...formData, clinic: e.target.value})} placeholder="Selecione..."/><datalist id="clinic-list-form">{clinicsList.map(c => <option key={c.id} value={c.name}/>)}</datalist></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelClassName}>Dentista</label><input required className={inputClassName} value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})}/></div>
                      <div><label className={labelClassName}>Fone</label><input className={inputClassName} value={formData.doctorPhone} onChange={e => setFormData({...formData, doctorPhone: e.target.value})} placeholder="(00) 00000-0000"/></div>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div><label className={labelClassName}>Serviço Solicitado</label><input required list="svc-list-form" className={inputClassName} value={formData.prosthesisType} onChange={e => setFormData({...formData, prosthesisType: e.target.value})} placeholder="Ex: Prótese Total"/><datalist id="svc-list-form">{servicesList.map(s => <option key={s.id} value={s.name}/>)}</datalist></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelClassName}>Valor Base (R$)</label><input required type="number" step="0.01" className={inputClassName} value={formData.serviceValue} onChange={e => setFormData({...formData, serviceValue: parseFloat(e.target.value)})}/></div>
                      <div><label className={labelClassName}>Status de Pagto</label><select className={inputClassName} value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value as PaymentStatus})}><option value={PaymentStatus.PENDENTE}>Pendente</option><option value={PaymentStatus.PAGO}>Pago</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelClassName}>Data de Entrada</label><input type="date" className={inputClassName} value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})}/></div>
                      <div><label className={labelClassName}>Data de Entrega</label><input type="date" className={inputClassName} value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}/></div>
                    </div>
                    <div>
                      <label className={labelClassName}>Observações</label>
                      <textarea 
                        className={`${inputClassName} resize-none`} 
                        rows={2} 
                        value={formData.notes} 
                        onChange={e => setFormData({...formData, notes: e.target.value})} 
                        placeholder="Notas adicionais sobre o trabalho..."
                      />
                    </div>
                 </div>
               )}
               <div className="pt-4 flex justify-end gap-2 border-t border-slate-50">
                  {showSuccess ? (
                    <div className="text-emerald-600 text-[11px] font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg animate-in fade-in duration-300">
                      <CheckCircle size={14}/> Dados Salvos!
                    </div>
                  ) : (
                    <>
                      <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold shadow-md shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                        {isEditing ? 'Atualizar Dados' : 'Criar Registro'}
                      </button>
                    </>
                  )}
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation (Compact) */}
      {patientToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-5 w-full max-w-xs text-center border border-slate-100 shadow-2xl animate-in zoom-in-95">
             <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={18} />
             </div>
             <h3 className="text-sm font-bold text-slate-800 mb-1">Confirmar Exclusão?</h3>
             <p className="text-[11px] text-slate-500 mb-5 leading-tight">Deseja remover permanentemente o registro de <strong>{patientToDelete.name}</strong>?</p>
             <div className="flex gap-2">
                <button onClick={() => setPatientToDelete(null)} className="flex-1 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                <button onClick={() => { onDeletePatient(patientToDelete.id); setPatientToDelete(null); }} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-[11px] font-bold hover:bg-red-600 transition-colors">Excluir</button>
             </div>
          </div>
        </div>
      )}

      {/* Workflow Drawer */}
      {selectedPatient && (
        <PatientWorkflow 
          isOpen={isWorkflowOpen} 
          patient={patients.find(p => p.id === selectedPatient.id) || selectedPatient} 
          onClose={() => setIsWorkflowOpen(false)} 
          onUpdate={onUpdatePatient} 
        />
      )}

      {/* Hidden Print Guide */}
      {guidePatient && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col h-[90vh]">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
                    <Printer size={16} className="text-blue-600"/> Guia de Fechamento
                  </h3>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => {
                          const printContents = printRef.current?.innerHTML;
                          const iframe = document.createElement('iframe');
                          iframe.style.position = 'absolute'; iframe.style.width = '0px'; iframe.style.height = '0px'; iframe.style.border = 'none';
                          document.body.appendChild(iframe);
                          const doc = iframe.contentWindow?.document;
                          if (doc) {
                              doc.open();
                              doc.write(`<html><head><title>Impressão</title><script src="https://cdn.tailwindcss.com"></script></head><body class="p-8">${printContents}</body></html>`);
                              doc.close();
                              setTimeout(() => { iframe.contentWindow?.print(); document.body.removeChild(iframe); }, 500);
                          }
                       }} 
                       className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-[10px] font-bold hover:bg-slate-900 transition-colors"
                     >
                       IMPRIMIR
                     </button>
                     <button onClick={() => setGuidePatient(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><X size={18}/></button>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                   <div ref={printRef} className="bg-white p-10 max-w-2xl mx-auto shadow-sm border border-slate-200">
                      <div className="flex justify-center mb-8"><img src="https://iili.io/fcoadnn.png" alt="Logo" className="h-20 w-auto object-contain"/></div>
                      <div className="text-center mb-8 border-b border-slate-100 pb-6"><h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest">{guidePatient.doctorName}</h2><p className="text-xs text-slate-500 font-bold">{guidePatient.clinic}</p></div>
                      <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-100"><p className="text-[13px] text-slate-600 leading-relaxed italic">Serviço referente ao paciente <strong>{guidePatient.name}</strong> concluído com sucesso. Trabalho: <strong>{guidePatient.prosthesisType}</strong>.</p></div>
                      <div className="mb-10 text-[12px]"><div className="grid grid-cols-2 gap-4 border-t border-b border-slate-800 py-3 mb-4"><span className="font-bold">Trabalho Realizado</span><span className="text-right font-bold">Valor Líquido</span></div><div className="grid grid-cols-2 gap-4 mb-4"><span>{guidePatient.prosthesisType}</span><span className="text-right font-bold text-slate-900">R$ {guidePatient.serviceValue.toFixed(2)}</span></div><div className="border-t-2 border-slate-800 pt-3 flex justify-between font-black text-sm uppercase"><span>Total a Pagar</span><span>R$ {guidePatient.serviceValue.toFixed(2)}</span></div></div>
                      <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-6">Laboratório Aguiar • Fone: (62) 98151-6879</div>
                   </div>
               </div>
            </div>
          </div>
      )}

    </div>
  );
};

export default Patients;
