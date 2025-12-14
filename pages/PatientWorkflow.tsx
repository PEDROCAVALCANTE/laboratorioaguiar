import React, { useState, useEffect } from 'react';
import { Patient, WorkflowStatus, WorkflowStep } from '../types';
import { X, Save, Clock, CheckCircle2, AlertTriangle, ArrowRight, Check } from 'lucide-react';

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
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      status: newStatus,
      date: new Date().toISOString(),
      notes: newNotes
    };

    const updatedPatient: Patient = {
      ...patient,
      currentStatus: newStatus,
      isActive: newStatus !== WorkflowStatus.CONCLUIDO,
      workflowHistory: [...patient.workflowHistory, newStep]
    };

    onUpdate(updatedPatient);
    setNewNotes('');
  };

  const handleQuickComplete = () => {
    if (!confirm('Deseja realmente marcar este trabalho como Concluído?')) return;

    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      status: WorkflowStatus.CONCLUIDO,
      date: new Date().toISOString(),
      notes: 'Trabalho finalizado e entregue.'
    };

    const updatedPatient: Patient = {
      ...patient,
      currentStatus: WorkflowStatus.CONCLUIDO,
      isActive: false, // Remove da lista de pendentes
      workflowHistory: [...patient.workflowHistory, newStep]
    };

    onUpdate(updatedPatient);
    onClose(); // Fecha o modal após concluir
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.CONCLUIDO: return 'bg-emerald-100 text-emerald-800';
      case WorkflowStatus.RETORNO_AJUSTE: return 'bg-red-100 text-red-800';
      case WorkflowStatus.EM_PRODUCAO: return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
            <p className="text-sm text-slate-500">Fluxo de Trabalho &bull; {patient.prosthesisType}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Status Update Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} /> Atualizar Status
                </h3>
                
                {patient.currentStatus !== WorkflowStatus.CONCLUIDO && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                        Em Andamento
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
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
                <label className={labelClassName}>Observações da Etapa</label>
                <textarea 
                  className={inputClassName}
                  rows={3}
                  placeholder="Ex: Cerâmica aplicada, aguardando glaze..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    onClick={handleAddStep}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-900 transition-colors font-medium shadow-md shadow-slate-200"
                  >
                    <Save size={18} />
                    Salvar Movimentação
                  </button>

                  {patient.currentStatus !== WorkflowStatus.CONCLUIDO && (
                      <button 
                        onClick={handleQuickComplete}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-md shadow-emerald-200"
                      >
                        <Check size={18} />
                        Finalizar e Concluir
                      </button>
                  )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
              <ArrowRight size={16} /> Histórico do Fluxo
            </h3>
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
              {[...patient.workflowHistory].reverse().map((step, index) => (
                <div key={step.id} className="relative pl-8">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                    step.status === WorkflowStatus.CONCLUIDO ? 'bg-emerald-500' : 
                    step.status === WorkflowStatus.RETORNO_AJUSTE ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  
                  <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full w-fit ${getStatusColor(step.status)}`}>
                        {step.status}
                      </span>
                      <span className="text-xs text-slate-400 mt-1 sm:mt-0">{formatDate(step.date)}</span>
                    </div>
                    {step.notes && (
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100">
                        "{step.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {patient.workflowHistory.length === 0 && (
                <p className="text-slate-400 text-sm pl-8">Nenhum histórico registrado.</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
           <span>Entrada: {new Date(patient.entryDate).toLocaleDateString()}</span>
           <span>Prev. Entrega: {new Date(patient.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PatientWorkflow;