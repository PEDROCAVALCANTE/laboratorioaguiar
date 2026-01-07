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

  const inputClassName = "w-full bg-slate-50 text-slate-900 border border-slate-200 rounded px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500/20 shadow-sm";
  const labelClassName = "block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5";
  
  const detailLabelClass = "text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 min-w-[100px]";
  const detailValueClass = "text-[12px] font-semibold text-slate-800 text-right";

  useEffect(() => { setNewStatus(patient.currentStatus); if (isOpen) setActiveTab('timeline'); }, [patient.currentStatus, isOpen]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    const isCompletedStatus = newStatus === WorkflowStatus.FINALIZADO;
    onUpdate({
      ...patient,
      currentStatus: newStatus,
      isActive: !isCompletedStatus, 
      workflowHistory: [...patient.workflowHistory, { id: Date.now().toString(), status: newStatus, date: new Date().toISOString(), notes: newNotes }]
    });
    setNewNotes('');
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.PLANO_CERA: return 'bg-slate-50 text-slate-600';
      case WorkflowStatus.MOLDEIRA_INDIVIDUAL: return 'bg-blue-50 text-blue-700';
      case WorkflowStatus.BARRA: return 'bg-cyan-50 text-cyan-700';
      case WorkflowStatus.ARMACAO: return 'bg-orange-50 text-orange-700';
      case WorkflowStatus.MONTAGEM_DENTES: return 'bg-amber-50 text-amber-700';
      case WorkflowStatus.REMONTAR_DENTES: return 'bg-red-50 text-red-700';
      case WorkflowStatus.ACRILIZAR: return 'bg-indigo-50 text-indigo-700';
      case WorkflowStatus.FINALIZADO: return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
        case WorkflowStatus.PLANO_CERA: return <Layers size={12} />;
        case WorkflowStatus.MOLDEIRA_INDIVIDUAL: return <CircleDot size={12} />;
        case WorkflowStatus.BARRA: return <Columns size={12} />;
        case WorkflowStatus.ARMACAO: return <Grid size={12} />;
        case WorkflowStatus.MONTAGEM_DENTES: return <Smile size={12} />;
        case WorkflowStatus.REMONTAR_DENTES: return <RotateCcw size={12} />;
        case WorkflowStatus.ACRILIZAR: return <FlaskConical size={12} />;
        case WorkflowStatus.FINALIZADO: return <CheckCircle2 size={12} />;
        default: return <Clock size={12} />;
    }
  };

  const flowHistory = [...patient.workflowHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-300">
        
        <div className="px-5 py-5 border-b border-slate-50 flex justify-between items-start">
          <div>
            <h2 className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{patient.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                    {patient.prosthesisType}
                </span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${getStatusColor(patient.currentStatus)}`}>
                    {patient.currentStatus}
                </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-slate-500"><X size={16} /></button>
        </div>

        <div className="flex border-b border-slate-50 bg-slate-50/20">
            <button onClick={() => setActiveTab('timeline')} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest border-b-2 ${activeTab === 'timeline' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent'}`}>Fluxo</button>
            <button onClick={() => setActiveTab('details')} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest border-b-2 ${activeTab === 'details' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent'}`}>Cadastro</button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar p-5">
            {activeTab === 'timeline' && (
                <div className="space-y-6">
                    <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
                        <label className={labelClassName}>Avançar Etapa</label>
                        <select className={`${inputClassName} font-bold mb-3`} value={newStatus} onChange={e => setNewStatus(e.target.value as WorkflowStatus)}>
                            {Object.values(WorkflowStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <textarea className={`${inputClassName} mb-3`} rows={2} placeholder="Nota da etapa..." value={newNotes} onChange={e => setNewNotes(e.target.value)} />
                        <button onClick={handleAddStep} className="w-full bg-slate-800 text-white py-2 rounded text-[11px] font-bold shadow-sm hover:bg-slate-900">Salvar Etapa</button>
                    </div>

                    <div className="relative flex flex-col items-center">
                        <div className="absolute top-0 bottom-0 w-px bg-slate-200" style={{ left: '50%' }}></div>
                        <div className="w-full space-y-3 relative z-10">
                            {flowHistory.map((step, index) => {
                                const isLatest = index === flowHistory.length - 1;
                                return (
                                    <div key={step.id} className={`bg-white border p-3 rounded-lg shadow-sm border-l-4 ${isLatest ? 'border-l-blue-500 ring-2 ring-blue-50' : 'border-l-slate-200'}`}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(step.status)}`}>
                                                {getStatusIcon(step.status)} <span>{step.status}</span>
                                            </div>
                                            <span className="text-[9px] font-mono text-slate-400">{new Date(step.date).toLocaleDateString()}</span>
                                        </div>
                                        {step.notes && <p className="text-[11px] text-slate-500 italic leading-snug">"{step.notes}"</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'details' && (
                <div className="bg-white rounded-lg border border-slate-100 overflow-hidden divide-y divide-slate-50 shadow-sm">
                    {[
                        { label: 'ID', value: patient.id.slice(-8), icon: Package },
                        { label: 'Clínica', value: patient.clinic, icon: Briefcase },
                        { label: 'Doutor', value: patient.doctorName, icon: User },
                        { label: 'Trabalho', value: patient.prosthesisType, icon: Layers },
                        { label: 'Valor', value: `R$ ${patient.serviceValue.toFixed(2)}`, icon: DollarSign },
                        { label: 'Pagto', value: patient.paymentStatus, icon: CreditCard }
                    ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center px-4 py-2.5">
                            <div className={detailLabelClass}><item.icon size={11}/> {item.label}</div>
                            <div className={detailValueClass}>{item.value}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="p-3 bg-white border-t border-slate-50 flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           <span>Entrada: {new Date(patient.entryDate).toLocaleDateString()}</span>
           <span className="text-blue-600">Entrega: {new Date(patient.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PatientWorkflow;