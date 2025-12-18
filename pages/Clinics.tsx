import React, { useState } from 'react';
import { Clinic } from '../types';
import { Plus, Trash2, Building2, User, Phone, RotateCcw } from 'lucide-react';

interface ClinicsProps {
  clinics: Clinic[];
  onAddClinic: (clinic: Clinic) => void;
  onDeleteClinic: (id: string) => void;
  onSyncRequest?: () => void;
}

const Clinics: React.FC<ClinicsProps> = ({ clinics, onAddClinic, onDeleteClinic, onSyncRequest }) => {
  const [formData, setFormData] = useState<Partial<Clinic>>({
    name: '',
    doctorName: '',
    phone: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const inputClassName = "w-full bg-white text-slate-900 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClinic: Clinic = {
      id: Date.now().toString(),
      name: formData.name!,
      doctorName: formData.doctorName!,
      phone: formData.phone
    };
    onAddClinic(newClinic);
    setFormData({ name: '', doctorName: '', phone: '' });
  };

  const handleManualSync = () => {
    if (onSyncRequest) {
      setIsSyncing(true);
      onSyncRequest();
      setTimeout(() => setIsSyncing(false), 2000);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Banner Minimalista */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 border border-slate-200 p-5 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Clínicas Parceiras</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Gerencie o cadastro de consultórios e dentistas.</p>
            </div>
            <div className="flex items-center gap-3">
                <button 
                  onClick={handleManualSync}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                  title="Garante que todas as clínicas das imagens estejam cadastradas"
                >
                  <RotateCcw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Sincronizando...' : 'Restaurar Padrões'}
                </button>
                <div className="bg-white/80 p-2 rounded-lg shadow-sm border border-slate-100 text-teal-600 hidden sm:block">
                    <Building2 size={20} />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Add Clinic Form */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2 uppercase tracking-wide">
            <Plus size={16} className="text-teal-600" /> Nova Clínica
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClassName}>Nome da Clínica</label>
              <input required type="text" className={inputClassName} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Odonto Center" />
            </div>
            <div>
              <label className={labelClassName}>Nome do Dentista</label>
              <input required type="text" className={inputClassName} value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})} placeholder="Ex: Dr. Silva" />
            </div>
            <div>
              <label className={labelClassName}>Telefone (Opcional)</label>
              <input type="text" className={inputClassName} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Ex: (62) 99999-9999" />
            </div>
            
            <button type="submit" className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition shadow-sm shadow-teal-200 mt-2">
              Cadastrar Clínica
            </button>
          </form>
        </div>

        {/* Clinics List */}
        <div className="lg:col-span-2 space-y-3">
           {clinics.sort((a, b) => a.name.localeCompare(b.name)).map(clinic => (
             <div key={clinic.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-teal-200 transition">
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-1.5">
                   <div className="bg-slate-50 p-1.5 rounded-md text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors">
                     <Building2 size={16} />
                   </div>
                   <h4 className="font-bold text-slate-800 text-base">{clinic.name}</h4>
                 </div>
                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-xs text-slate-500 ml-1">
                   <span className="flex items-center gap-1.5"><User size={12} className="text-teal-600"/> {clinic.doctorName}</span>
                   {clinic.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-blue-600"/> {clinic.phone}</span>}
                 </div>
               </div>
               <div className="flex items-center gap-3 pl-3 border-l border-slate-100 ml-3">
                 <button 
                  onClick={() => {
                    if(confirm(`Deseja excluir a clínica ${clinic.name}?`)) onDeleteClinic(clinic.id);
                  }}
                  className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                  title="Excluir"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
             </div>
           ))}
           {clinics.length === 0 && (
             <div className="text-center py-12 text-sm text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
               <Building2 size={32} className="mx-auto mb-2 opacity-20" />
               <p>Nenhuma clínica cadastrada.</p>
               <button onClick={handleManualSync} className="text-teal-600 font-bold mt-2 hover:underline">Importar Lista Padrão</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Clinics;