import React, { useState, useEffect } from 'react';
import { Patient, WorkflowStatus, WorkflowStep } from '../types';
import { X, Save, Clock, CheckCircle2, AlertTriangle, ArrowRight, Check, Activity, Package, Send, RotateCcw } from 'lucide-react';

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
  const inputClassName = "w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-sm font-semibold text-slate-700 mb-1.5";

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
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
        case WorkflowStatus.ENTRADA: return <Package size={16} />;
        case WorkflowStatus.EM_PRODUCAO: return <Activity size={16} />;
        case WorkflowStatus.ENVIADO_CLINICA: return <Send size={16} />;
        case WorkflowStatus.REENVIO_CLINICA: return <Send size={16} />;
        case WorkflowStatus.RETORNO_AJUSTE: return <RotateCcw size={16} />;
        case WorkflowStatus.CONCLUIDO: return <CheckCircle2 size={16} />;
        default: return <Clock size={16} />;
    }
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  // Sort history chronologically for the "Map" flow (Start -> End)
  const sortedHistory = [...patient.workflowHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shadow-sm z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
            <p className="text-sm text-slate-500">Fluxo de Trabalho &bull; {patient.prosthesisType}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
            <div className="p-6 space-y-8">
            
            {/* Status Update Control Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm sticky top-0 z-10 ring-1 ring-slate-900/5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Activity size={16} className="text-teal-600" /> Nova Movimentação
                    </h3>
                    
                    {patient.currentStatus !== WorkflowStatus.CONCLUIDO ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 animate-pulse">
                            Em Andamento
                        </span>
                    ) : (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            Concluído
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClassName}>Nova Etapa</label>
                        <select 
                        className={inputClassName}
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as WorkflowStatus)}
                        >
                        {Object.values(WorkflowStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                        </select>
                    </div>
                    <div>
                         {/* Placeholder for future expansion or quick stats */}
                         <label className={labelClassName}>&nbsp;</label>
                         <div className="h-[42px] flex items-center text-xs text-slate-400 italic">
                            Selecione a próxima fase do trabalho.
                         </div>
                    </div>
                </div>
                <div>
                    <label className={labelClassName}>Observações da Etapa</label>
                    <textarea 
                    className={inputClassName}
                    rows={2}
                    placeholder="Ex: Cerâmica aplicada, aguardando glaze..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    ></textarea>
                </div>
                
                <div className="pt-2">
                    <button 
                        type="button"
                        onClick={handleAddStep}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-900 transition-colors font-medium shadow-md shadow-slate-200"
                    >
                        <Save size={18} />
                        Salvar Movimentação
                    </button>
                </div>
                </div>
            </div>

            {/* MIND MAP / TIMELINE */}
            <div className="pt-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-8 flex items-center justify-center gap-2 opacity-70">
                   <Package size={16} /> Mapa de Processo do Paciente
                </h3>
                
                <div className="relative min-h-[200px] px-4">
                    {/* Central Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2 rounded-full"></div>

                    {sortedHistory.map((step, index) => {
                        const isLeft = index % 2 === 0;
                        const isLast = index === sortedHistory.length - 1;

                        return (
                            <div key={step.id} className={`relative flex items-center justify-between mb-8 w-full group ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                                
                                {/* The Card Node */}
                                <div className={`w-[45%] relative ${isLeft ? 'text-right' : 'text-left'}`}>
                                    {/* Connector Line */}
                                    <div className={`absolute top-6 h-0.5 bg-slate-200 w-6 ${isLeft ? '-right-6' : '-left-6'}`}></div>
                                    
                                    <div className={`bg-white p-4 rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md relative overflow-hidden ${
                                        isLast ? 'ring-2 ring-teal-500/20 border-teal-500' : 'border-slate-100'
                                    }`}>
                                        {/* Status Header */}
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold mb-2 ${getStatusColor(step.status)}`}>
                                            {getStatusIcon(step.status)}
                                            {step.status}
                                        </div>
                                        
                                        {/* Date */}
                                        <p className="text-[10px] text-slate-400 font-mono mb-2 uppercase tracking-wide">
                                            {formatDate(step.date)}
                                        </p>

                                        {/* Notes Body */}
                                        {step.notes && (
                                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-50/50">
                                                {step.notes}
                                            </p>
                                        )}
                                        
                                        {!step.notes && (
                                            <p className="text-xs text-slate-300 italic">Sem observações.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Center Node Dot */}
                                <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-[3px] z-10 transition-all duration-500 ${
                                    isLast 
                                        ? 'bg-teal-500 border-white shadow-lg shadow-teal-500/30 scale-125' 
                                        : 'bg-white border-slate-300'
                                }`}></div>

                                {/* Empty Spacer for the other side */}
                                <div className="w-[45%]"></div>
                            </div>
                        );
                    })}

                    {patient.workflowHistory.length === 0 && (
                        <div className="text-center text-slate-400 py-10 italic">
                            Nenhum histórico iniciado.
                        </div>
                    )}
                    
                    {/* End Cap */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-200 rounded-full"></div>
                </div>
            </div>
            </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between z-10">
           <span className="flex items-center gap-1"><Clock size={12}/> Entrada: {new Date(patient.entryDate).toLocaleDateString()}</span>
           <span className="flex items-center gap-1 font-semibold text-teal-600"><CheckCircle2 size={12}/> Prev. Entrega: {new Date(patient.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PatientWorkflow;