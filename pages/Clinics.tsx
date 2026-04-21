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

  const inputClassName = "w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1";

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
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-6 shadow-sm group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Clínicas Parceiras</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-8 h-0.5 bg-teal-500 rounded-full"></div>
                   <p className="text-[10px] text-teal-600/70 font-black uppercase tracking-widest">Gestão de Canais e Consultórios</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                  onClick={handleManualSync}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:bg-white hover:border-teal-200 hover:text-teal-600 transition-all shadow-sm uppercase tracking-wider"
                  title="Garante que todas as clínicas das imagens estejam cadastradas"
                >
                  <RotateCcw size={14} className={isSyncing ? 'animate-spin text-teal-500' : ''} />
                  {isSyncing ? 'Sincronizando...' : 'Restaurar Padrões'}
                </button>
                <div className="bg-teal-500 p-2.5 rounded-xl text-white shadow-lg shadow-teal-100 transition-transform hover:scale-110 duration-300">
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
             <div key={clinic.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-teal-200 transition-all duration-300">
               <div className="flex-1">
                 <div className="flex items-center gap-4 mb-2">
                   <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                     <Building2 size={18} />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-800 text-base tracking-tight">{clinic.name}</h4>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-[11px] font-bold text-slate-400 mt-1">
                        <span className="flex items-center gap-2"><User size={12} className="text-teal-500"/> Dr(a). {clinic.doctorName}</span>
                        {clinic.phone && <span className="flex items-center gap-2"><Phone size={12} className="text-blue-500"/> {clinic.phone}</span>}
                     </div>
                   </div>
                 </div>
               </div>
               <div className="flex items-center gap-3 pl-4 border-l border-slate-50 ml-3">
                 <button 
                  onClick={() => {
                    if(confirm(`Deseja excluir a clínica ${clinic.name}?`)) onDeleteClinic(clinic.id);
                  }}
                  className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Excluir"
                 >
                   <Trash2 size={18} />
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