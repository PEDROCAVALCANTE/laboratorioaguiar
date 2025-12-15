import React, { useState, useEffect } from 'react';
import { Patient, WorkflowStatus, WorkflowStep } from '../types';
import { X, Save, Clock, CheckCircle2, Activity, Package, Send, RotateCcw } from 'lucide-react';

interface PatientWorkflowProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPatient: Patient) => void;
}

const PatientWorkflow: React.FC<PatientWorkflowProps> = ({ patient, isOpen, onClose, onUpdate }) => {
  const [newStatus, setNewStatus] = useState<WorkflowStatus>(patient.currentStatus);
  const [newNotes, setNewNotes] = useState('');

  // Constants (Minimalist)
  const inputClassName = "w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:bg-white hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";

  useEffect(() => {
    setNewStatus(patient.currentStatus);
  }, [patient.currentStatus]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    const isCompletedStatus = newStatus === WorkflowStatus.CONCLUIDO;
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
    onClose(); 
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.CONCLUIDO: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case WorkflowStatus.RETORNO_AJUSTE: return 'bg-red-50 text-red-800 border-red-200';
      case WorkflowStatus.EM_PRODUCAO: return 'bg-amber-50 text-amber-800 border-amber-200';
      case WorkflowStatus.ENVIADO_CLINICA: return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
        case WorkflowStatus.ENTRADA: return <Package size={12} />;
        case WorkflowStatus.EM_PRODUCAO: return <Activity size={12} />;
        case WorkflowStatus.ENVIADO_CLINICA: return <Send size={12} />;
        case WorkflowStatus.REENVIO_CLINICA: return <Send size={12} />;
        case WorkflowStatus.RETORNO_AJUSTE: return <RotateCcw size={12} />;
        case WorkflowStatus.CONCLUIDO: return <CheckCircle2 size={12} />;
        default: return <Clock size={12} />;
    }
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const historyForDisplay = [...patient.workflowHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-slate-50 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white z-20">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{patient.name}</h2>
            <p className="text-xs text-slate-500 font-medium">Fluxo de Trabalho • {patient.prosthesisType}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="p-5 space-y-6 min-h-full">
            
            {/* Status Update Control Panel (Floating Card) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative z-10">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Activity size={14} className="text-teal-600" /> Nova Movimentação
                    </h3>
                    
                    {patient.currentStatus === WorkflowStatus.CONCLUIDO ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Concluído
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                            <Clock size={10} /> Em Andamento
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                      <label className={labelClassName}>Nova Etapa</label>
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
                        placeholder="Ex: Cerâmica aplicada..."
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
                          Salvar Movimentação
                      </button>
                  </div>
                </div>
            </div>

            {/* TIMELINE */}
            <div className="pt-2 relative">
                <div className="flex items-center justify-center mb-6 relative">
                   <div className="h-px bg-slate-200 w-full absolute"></div>
                   <span className="bg-slate-50 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10 flex items-center gap-1.5">
                      <Package size={12} /> Histórico
                   </span>
                </div>
                
                <div className="relative pl-4 sm:pl-0 sm:px-4 pb-10">
                    {/* Central Line */}
                    <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-slate-300 via-slate-200 to-transparent sm:-translate-x-1/2"></div>

                    <div className="space-y-6">
                      {historyForDisplay.map((step, index) => {
                          const isLatest = index === 0;
                          const isRight = index % 2 === 0; 

                          return (
                              <div key={step.id} className={`relative flex items-center w-full group transition-all duration-300 
                                  ${isRight ? 'sm:flex-row' : 'sm:flex-row-reverse'} justify-start sm:justify-between`
                              }>
                                  
                                  {/* Mobile Connector */}
                                  <div className="absolute left-4 w-6 h-px bg-slate-200 sm:hidden top-6"></div>

                                  {/* Desktop Connector */}
                                  <div className={`hidden sm:block absolute top-6 h-px bg-slate-200 w-8 ${isRight ? 'left-1/2' : 'right-1/2'}`}></div>

                                  {/* Content Card */}
                                  <div className={`
                                      relative pl-10 sm:pl-0 w-full sm:w-[45%]
                                      ${isRight ? 'sm:text-left' : 'sm:text-right'}
                                  `}>
                                      <div className={`bg-white p-4 rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md relative group-hover:-translate-y-0.5 ${
                                          isLatest ? 'border-teal-200 ring-2 ring-teal-50/50' : 'border-slate-100'
                                      }`}>
                                          <div className={`flex flex-col ${isRight ? 'sm:items-start' : 'sm:items-end'} gap-1 mb-2`}>
                                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${getStatusColor(step.status)}`}>
                                                  {getStatusIcon(step.status)}
                                                  {step.status}
                                              </span>
                                              <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                                                  {formatDate(step.date)}
                                              </span>
                                          </div>

                                          {step.notes ? (
                                              <p className="text-xs text-slate-600 leading-relaxed">
                                                  {step.notes}
                                              </p>
                                          ) : (
                                              <p className="text-[10px] text-slate-300 italic">Sem observações.</p>
                                          )}
                                      </div>
                                  </div>

                                  {/* Center Node Dot */}
                                  <div className={`
                                      absolute w-3 h-3 rounded-full border-[2px] z-20 transition-all duration-500
                                      left-4 sm:left-1/2 -translate-x-1/2 top-4.5
                                      ${isLatest 
                                          ? 'bg-teal-500 border-white shadow-md shadow-teal-500/50 scale-125' 
                                          : 'bg-white border-slate-300 group-hover:border-teal-300 group-hover:scale-110'
                                      }
                                  `}>
                                    {isLatest && <div className="absolute inset-0 rounded-full bg-teal-500 animate-ping opacity-75"></div>}
                                  </div>

                                  <div className="hidden sm:block sm:w-[45%]"></div>
                              </div>
                          );
                      })}
                    </div>

                    {patient.workflowHistory.length === 0 && (
                        <div className="text-center text-slate-400 py-8 flex flex-col items-center">
                            <span className="italic text-xs">Nenhuma movimentação.</span>
                        </div>
                    )}

                    <div className="absolute bottom-0 left-4 sm:left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                </div>
            </div>
            </div>
        </div>

        {/* Footer info */}
        <div className="bg-white p-3 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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