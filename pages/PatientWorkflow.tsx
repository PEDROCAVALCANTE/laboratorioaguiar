import React, { useState, useEffect } from 'react';
import { Patient, WorkflowStatus, WorkflowStep, PaymentStatus } from '../types';
import { X, Save, Clock, CheckCircle2, Activity, Package, RotateCcw, FlaskConical, Smile, Layers, CircleDot, User, Briefcase, Calendar, DollarSign, FileText, Phone, CreditCard, ArrowDown, MoveDown, Flag, Columns, Grid } from 'lucide-react';

interface PatientWorkflowProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPatient: Patient) => void;
}

const PatientWorkflow: React.FC<PatientWorkflowProps> = ({ patient, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'details'>('timeline');
  const [newStatus, setNewStatus] = useState<WorkflowStatus>(patient.currentStatus);
  const [newNotes, setNewNotes] = useState('');

  // Constants (Minimalist)
  const inputClassName = "w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:bg-white hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";
  
  // Candy Cane Row Styles
  const rowBaseClass = "px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4";
  const rowWhiteClass = `${rowBaseClass} bg-white`;
  const rowStripedClass = `${rowBaseClass} bg-slate-50`;
  const detailLabelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 min-w-[120px]";
  const detailValueClass = "text-sm font-medium text-slate-800 text-right";

  useEffect(() => {
    setNewStatus(patient.currentStatus);
    // Reset tab when opening a new patient
    if (isOpen) {
      setActiveTab('timeline');
    }
  }, [patient.currentStatus, isOpen]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    const isCompletedStatus = newStatus === WorkflowStatus.FINALIZADO;
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      status: newStatus,
      date: new Date().toISOString(),
      notes: newNotes
    };
    const updatedPatient: Patient = {
      ...patient,
      currentStatus: newStatus,
      isActive: !isCompletedStatus, 
      workflowHistory: [...patient.workflowHistory, newStep]
    };
    onUpdate(updatedPatient);
    setNewNotes('');
    // Stay on timeline to see update
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.PLANO_CERA: return 'bg-slate-100 text-slate-700 border-slate-200';
      case WorkflowStatus.MOLDEIRA_INDIVIDUAL: return 'bg-blue-50 text-blue-800 border-blue-200';
      case WorkflowStatus.BARRA: return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case WorkflowStatus.ARMACAO: return 'bg-orange-50 text-orange-800 border-orange-200';
      case WorkflowStatus.MONTAGEM_DENTES: return 'bg-amber-50 text-amber-800 border-amber-200';
      case WorkflowStatus.REMONTAR_DENTES: return 'bg-red-50 text-red-800 border-red-200';
      case WorkflowStatus.ACRILIZAR: return 'bg-purple-50 text-purple-800 border-purple-200';
      case WorkflowStatus.FINALIZADO: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBorder = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.PLANO_CERA: return 'border-slate-300';
      case WorkflowStatus.MOLDEIRA_INDIVIDUAL: return 'border-blue-300';
      case WorkflowStatus.BARRA: return 'border-cyan-300';
      case WorkflowStatus.ARMACAO: return 'border-orange-300';
      case WorkflowStatus.MONTAGEM_DENTES: return 'border-amber-300';
      case WorkflowStatus.REMONTAR_DENTES: return 'border-red-300';
      case WorkflowStatus.ACRILIZAR: return 'border-purple-300';
      case WorkflowStatus.FINALIZADO: return 'border-emerald-400';
      default: return 'border-slate-300';
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
        case WorkflowStatus.PLANO_CERA: return <Layers size={14} />;
        case WorkflowStatus.MOLDEIRA_INDIVIDUAL: return <CircleDot size={14} />;
        case WorkflowStatus.BARRA: return <Columns size={14} />;
        case WorkflowStatus.ARMACAO: return <Grid size={14} />;
        case WorkflowStatus.MONTAGEM_DENTES: return <Smile size={14} />;
        case WorkflowStatus.REMONTAR_DENTES: return <RotateCcw size={14} />;
        case WorkflowStatus.ACRILIZAR: return <FlaskConical size={14} />;
        case WorkflowStatus.FINALIZADO: return <CheckCircle2 size={14} />;
        default: return <Clock size={14} />;
    }
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };
  
  const formatMoney = (val: number) => {
      return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Sort Chronologically (Oldest First) for Flowchart View
  const flowHistory = [...patient.workflowHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-start bg-white z-20 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {patient.prosthesisType}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getStatusColor(patient.currentStatus)}`}>
                    {patient.currentStatus}
                </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 shrink-0">
            <button 
                onClick={() => setActiveTab('timeline')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${
                    activeTab === 'timeline' ? 'text-blue-600 border-blue-500 bg-white' : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-100'
                }`}
            >
                <Activity size={14} /> Fluxo de Trabalho
            </button>
            <button 
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${
                    activeTab === 'details' ? 'text-blue-600 border-blue-500 bg-white' : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-100'
                }`}
            >
                <FileText size={14} /> Detalhes do Cadastro
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-50/50">
            
            {/* === TAB: FLOWCHART (TIMELINE) === */}
            {activeTab === 'timeline' && (
                <div className="p-5 space-y-8">
                    {/* Status Update Control Panel */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative z-20">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Activity size={14} className="text-teal-600" /> Atualizar Status
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className={labelClassName}>Próxima Etapa</label>
                            <select 
                                className={`${inputClassName} font-medium`}
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value as WorkflowStatus)}
                            >
                            {Object.values(WorkflowStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClassName}>Observações da Etapa</label>
                            <textarea 
                                className={inputClassName}
                                rows={2}
                                placeholder="Ex: Cor A2, anatomia detalhada..."
                                value={newNotes}
                                onChange={(e) => setNewNotes(e.target.value)}
                            ></textarea>
                        </div>
                        
                        <div className="pt-1">
                            <button 
                                type="button"
                                onClick={handleAddStep}
                                className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-900 transition-all text-sm font-bold shadow-sm active:scale-[0.98]"
                            >
                                <Save size={14} />
                                Registrar Etapa
                            </button>
                        </div>
                        </div>
                    </div>

                    {/* FLOWCHART Rendering */}
                    <div className="relative pt-4 pb-12 flex flex-col items-center">
                        
                        {/* Start Node Indicator */}
                        <div className="mb-2 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-500">
                           <div className="bg-slate-100 text-slate-400 p-2 rounded-full border border-slate-200 mb-1">
                              <Flag size={16} fill="currentColor" className="text-slate-300" />
                           </div>
                           <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Início</span>
                           <ArrowDown size={16} className="text-slate-300 mt-2" />
                        </div>

                        {/* Central Flow Line */}
                        <div className="absolute top-16 bottom-0 w-0.5 bg-slate-200/80 -z-10" style={{ left: '50%', transform: 'translateX(-50%)' }}></div>

                        <div className="w-full max-w-md space-y-2">
                            {flowHistory.map((step, index) => {
                                const isLatest = index === flowHistory.length - 1;

                                return (
                                    <div key={step.id} className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                        
                                        {/* Connector (if not first) */}
                                        {index > 0 && (
                                            <div className="h-6 w-0.5 bg-slate-300 my-1 relative">
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                    <MoveDown size={12} className="text-slate-400" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Flow Card */}
                                        <div className={`
                                            relative w-full bg-white rounded-xl p-4 transition-all duration-300
                                            border-l-[6px] shadow-sm group
                                            ${getStatusBorder(step.status)}
                                            ${isLatest 
                                                ? 'ring-4 ring-slate-100 shadow-md transform scale-[1.02] border-y border-r border-slate-200' 
                                                : 'border-y border-r border-slate-100 opacity-90 hover:opacity-100 hover:shadow-md'
                                            }
                                        `}>
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${getStatusColor(step.status)}`}>
                                                        {getStatusIcon(step.status)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {step.status}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    {formatDate(step.date)}
                                                </span>
                                            </div>

                                            {/* Body */}
                                            {step.notes && (
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                                                    <p className="text-xs text-slate-600 leading-relaxed italic">
                                                        "{step.notes}"
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Current Indicator Tag */}
                                            {isLatest && (
                                                <div className="absolute -top-3 right-4 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
                                                    <Activity size={10} /> ATUAL
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* End/Continued Indicator */}
                         {patient.currentStatus !== WorkflowStatus.FINALIZADO ? (
                            <div className="mt-2 flex flex-col items-center opacity-50">
                               <div className="h-8 w-0.5 bg-dashed bg-gradient-to-b from-slate-300 to-transparent"></div>
                               <div className="bg-slate-100 text-slate-400 p-2 rounded-full border border-slate-200 border-dashed mt-1">
                                  <Clock size={16} />
                               </div>
                               <span className="text-[10px] mt-1 font-medium text-slate-400">Aguardando...</span>
                            </div>
                         ) : (
                            <div className="mt-4 flex flex-col items-center">
                               <ArrowDown size={16} className="text-emerald-300 mb-2" />
                               <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-200 flex items-center gap-2 shadow-sm">
                                  <CheckCircle2 size={14} />
                                  <span className="text-xs font-bold uppercase tracking-wide">Fluxo Concluído</span>
                               </div>
                            </div>
                         )}

                    </div>
                </div>
            )}

            {/* === TAB: DETAILS (CANDY CANE) === */}
            {activeTab === 'details' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-white min-h-full">
                    
                    {/* ID Stripe */}
                    <div className={rowWhiteClass}>
                        <div className={detailLabelClass}><Package size={14}/> ID do Registro</div>
                        <div className="font-mono text-xs text-slate-400">{patient.id}</div>
                    </div>

                    {/* Clinic Stripe */}
                    <div className={rowStripedClass}>
                        <div className={detailLabelClass}><Briefcase size={14}/> Clínica</div>
                        <div className={detailValueClass}>{patient.clinic}</div>
                    </div>

                    {/* Doctor Stripe */}
                    <div className={rowWhiteClass}>
                         <div className={detailLabelClass}><User size={14}/> Dentista</div>
                         <div className="text-right">
                             <div className={detailValueClass}>{patient.doctorName}</div>
                             {patient.doctorPhone && <div className="text-xs text-slate-400 mt-0.5 flex items-center justify-end gap-1"><Phone size={10}/> {patient.doctorPhone}</div>}
                         </div>
                    </div>

                    {/* Prosthesis Type Stripe */}
                    <div className={rowStripedClass}>
                         <div className={detailLabelClass}><Package size={14}/> Trabalho</div>
                         <div className={detailValueClass}>{patient.prosthesisType}</div>
                    </div>

                    {/* Value Stripe */}
                    <div className={rowWhiteClass}>
                         <div className={detailLabelClass}><DollarSign size={14}/> Valor do Serviço</div>
                         <div className="text-lg font-bold text-teal-700">{formatMoney(patient.serviceValue)}</div>
                    </div>

                    {/* Payment Status Stripe */}
                    <div className={rowStripedClass}>
                         <div className={detailLabelClass}><CreditCard size={14}/> Pagamento</div>
                         <div>
                             {patient.paymentStatus === PaymentStatus.PAGO ? (
                                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                     <CheckCircle2 size={12}/> Pago
                                 </span>
                             ) : (
                                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                     <Clock size={12}/> Pendente
                                 </span>
                             )}
                         </div>
                    </div>

                    {/* Dates Stripe */}
                    <div className={rowWhiteClass}>
                         <div className={detailLabelClass}><Calendar size={14}/> Datas Importantes</div>
                         <div className="flex gap-4 text-right">
                             <div>
                                 <div className="text-[10px] text-slate-400 uppercase font-bold">Entrada</div>
                                 <div className="text-sm font-semibold text-slate-700">{new Date(patient.entryDate).toLocaleDateString('pt-BR')}</div>
                             </div>
                             <div className="w-px bg-slate-200 h-8"></div>
                             <div>
                                 <div className="text-[10px] text-slate-400 uppercase font-bold">Entrega</div>
                                 <div className="text-sm font-semibold text-slate-700">{new Date(patient.dueDate).toLocaleDateString('pt-BR')}</div>
                             </div>
                         </div>
                    </div>

                    {/* Notes Stripe */}
                    <div className="px-6 py-6 bg-slate-50 border-b border-slate-100">
                         <div className={`${detailLabelClass} mb-2`}><FileText size={14}/> Observações Gerais</div>
                         <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-600 leading-relaxed italic">
                             {patient.notes ? patient.notes : "Nenhuma observação cadastrada."}
                         </div>
                    </div>
                </div>
            )}

        </div>

        {/* Footer info (Always Visible) */}
        <div className="bg-white p-3 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <span className="flex items-center gap-1.5 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              <Clock size={10} className="text-slate-400"/> 
              Entrada: <span className="text-slate-700">{new Date(patient.entryDate).toLocaleDateString()}</span>
           </span>
           <span className="flex items-center gap-1.5 font-bold bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100 text-teal-700">
              <CheckCircle2 size={10}/> 
              Entrega: {new Date(patient.dueDate).toLocaleDateString()}
           </span>
        </div>
      </div>
    </div>
  );
};

export default PatientWorkflow;