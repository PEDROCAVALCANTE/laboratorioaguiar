
import React, { useState, useEffect } from 'react';
import { Patient, WorkflowStatus, WorkflowStep } from '../types';
import { X, Save, Clock, CheckCircle2, Activity, Package, Send, RotateCcw, ArrowDown } from 'lucide-react';

interface PatientWorkflowProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPatient: Patient) => void;
}

const PatientWorkflow: React.FC<PatientWorkflowProps> = ({ patient, isOpen, onClose, onUpdate }) => {
  const [newStatus, setNewStatus] = useState<WorkflowStatus>(patient.currentStatus);
  const [newNotes, setNewNotes] = useState('');

  // Constants
  const inputClassName = "w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:bg-white hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  // Update internal status state when patient is updated externally or saved
  useEffect(() => {
    setNewStatus(patient.currentStatus);
  }, [patient.currentStatus]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    // Verifica se o status selecionado é 'Concluído'
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
      // Garante que o paciente só fique inativo (Concluído na grade) se o status selecionado for explicitamente 'Concluído'
      isActive: !isCompletedStatus, 
      workflowHistory: [...patient.workflowHistory, newStep]
    };

    onUpdate(updatedPatient);
    setNewNotes('');
    onClose(); // Fecha o modal e volta para a grade imediatamente após salvar
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
        case WorkflowStatus.ENTRADA: return <Package size={14} />;
        case WorkflowStatus.EM_PRODUCAO: return <Activity size={14} />;
        case WorkflowStatus.ENVIADO_CLINICA: return <Send size={14} />;
        case WorkflowStatus.REENVIO_CLINICA: return <Send size={14} />;
        case WorkflowStatus.RETORNO_AJUSTE: return <RotateCcw size={14} />;
        case WorkflowStatus.CONCLUIDO: return <CheckCircle2 size={14} />;
        default: return <Clock size={14} />;
    }
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  // Sort history chronologically for the "Map" flow (Start -> End)
  // We reverse it for the display so the newest is at the top (below the new movement card)
  const historyForDisplay = [...patient.workflowHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-slate-50 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
            <p className="text-sm text-slate-500 font-medium">Fluxo de Trabalho • {patient.prosthesisType}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="p-6 space-y-8 min-h-full">
            
            {/* Status Update Control Panel (Floating Card) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative z-10">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Activity size={18} className="text-teal-600" /> Nova Movimentação
                    </h3>
                    
                    {patient.currentStatus === WorkflowStatus.CONCLUIDO ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Concluído
                        </span>
                    ) : (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 flex items-center gap-1">
                            <Clock size={12} /> Em Andamento
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-5">
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
                      <p className="text-[10px] text-slate-400 mt-1.5 italic">Selecione a próxima fase para atualizar o status do trabalho.</p>
                  </div>
                  <div>
                      <label className={labelClassName}>Observações da Etapa</label>
                      <textarea 
                        className={inputClassName}
                        rows={3}
                        placeholder="Ex: Cerâmica aplicada, aguardando glaze..."
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                      ></textarea>
                  </div>
                  
                  <div className="pt-2">
                      <button 
                          type="button"
                          onClick={handleAddStep}
                          className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3.5 rounded-xl hover:bg-slate-900 transition-all font-bold shadow-lg shadow-slate-200 hover:shadow-xl active:scale-[0.98]"
                      >
                          <Save size={18} />
                          Salvar Movimentação
                      </button>
                  </div>
                </div>
            </div>

            {/* TIMELINE */}
            <div className="pt-2 relative">
                <div className="flex items-center justify-center mb-8 relative">
                   <div className="h-px bg-slate-200 w-full absolute"></div>
                   <span className="bg-slate-50 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10 flex items-center gap-2">
                      <Package size={14} /> Histórico
                   </span>
                </div>
                
                <div className="relative pl-4 sm:pl-0 sm:px-4 pb-12">
                    {/* Central Line */}
                    {/* Mobile: Line on left (left-6). Desktop: Line in center (left-1/2) */}
                    <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-300 via-slate-200 to-transparent sm:-translate-x-1/2"></div>

                    <div className="space-y-8">
                      {historyForDisplay.map((step, index) => {
                          // index 0 is the newest because we sorted DESC
                          const isLatest = index === 0;
                          // Alternating logic for desktop
                          const isRight = index % 2 === 0; 

                          return (
                              <div key={step.id} className={`relative flex items-center w-full group transition-all duration-300 
                                  ${isRight ? 'sm:flex-row' : 'sm:flex-row-reverse'} justify-start sm:justify-between`
                              }>
                                  
                                  {/* Mobile Connector (Horizontal) */}
                                  <div className="absolute left-4 w-6 h-0.5 bg-slate-200 sm:hidden top-8"></div>

                                  {/* Desktop Connector (Horizontal) */}
                                  <div className={`hidden sm:block absolute top-8 h-0.5 bg-slate-200 w-8 ${isRight ? 'left-1/2' : 'right-1/2'}`}></div>

                                  {/* Content Card */}
                                  <div className={`
                                      relative pl-12 sm:pl-0 w-full sm:w-[45%]
                                      ${isRight ? 'sm:text-left' : 'sm:text-right'}
                                  `}>
                                      <div className={`bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md relative group-hover:-translate-y-1 ${
                                          isLatest ? 'border-teal-200 ring-4 ring-teal-50/50' : 'border-slate-100'
                                      }`}>
                                          <div className={`flex flex-col ${isRight ? 'sm:items-start' : 'sm:items-end'} gap-1 mb-3`}>
                                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${getStatusColor(step.status)}`}>
                                                  {getStatusIcon(step.status)}
                                                  {step.status}
                                              </span>
                                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                                  {formatDate(step.date)}
                                              </span>
                                          </div>

                                          {step.notes ? (
                                              <p className="text-sm text-slate-600 leading-relaxed">
                                                  {step.notes}
                                              </p>
                                          ) : (
                                              <p className="text-xs text-slate-300 italic">Sem observações registradas.</p>
                                          )}
                                      </div>
                                  </div>

                                  {/* Center Node Dot */}
                                  <div className={`
                                      absolute w-4 h-4 rounded-full border-[3px] z-20 transition-all duration-500
                                      left-4 sm:left-1/2 -translate-x-1/2 top-6
                                      ${isLatest 
                                          ? 'bg-teal-500 border-white shadow-lg shadow-teal-500/50 scale-125' 
                                          : 'bg-white border-slate-300 group-hover:border-teal-300 group-hover:scale-110'
                                      }
                                  `}>
                                    {isLatest && <div className="absolute inset-0 rounded-full bg-teal-500 animate-ping opacity-75"></div>}
                                  </div>

                                  {/* Empty Spacer for Desktop Layout Balance */}
                                  <div className="hidden sm:block sm:w-[45%]"></div>
                              </div>
                          );
                      })}
                    </div>

                    {patient.workflowHistory.length === 0 && (
                        <div className="text-center text-slate-400 py-12 flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                <Package size={20} className="text-slate-300" />
                            </div>
                            <span className="italic">Nenhuma movimentação registrada.</span>
                        </div>
                    )}

                    {/* End Marker */}
                    <div className="absolute bottom-0 left-4 sm:left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-300 rounded-full"></div>
                </div>
            </div>
            </div>
        </div>

        {/* Footer info */}
        <div className="bg-white p-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <span className="flex items-center gap-1.5 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Clock size={12} className="text-slate-400"/> 
              Entrada: <span className="text-slate-700">{new Date(patient.entryDate).toLocaleDateString()}</span>
           </span>
           <span className="flex items-center gap-1.5 font-bold bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 text-teal-700">
              <CheckCircle2 size={12}/> 
              Entrega: {new Date(patient.dueDate).toLocaleDateString()}
           </span>
        </div>
      </div>
    </div>
  );
};

export default PatientWorkflow;
