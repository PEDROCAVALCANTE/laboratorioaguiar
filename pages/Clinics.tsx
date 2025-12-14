
import React, { useState } from 'react';
import { Clinic } from '../types';
import { Plus, Trash2, Building2, User, Phone } from 'lucide-react';

interface ClinicsProps {
  clinics: Clinic[];
  onAddClinic: (clinic: Clinic) => void;
  onDeleteClinic: (id: string) => void;
}

const Clinics: React.FC<ClinicsProps> = ({ clinics, onAddClinic, onDeleteClinic }) => {
  const [formData, setFormData] = useState<Partial<Clinic>>({
    name: '',
    doctorName: '',
    phone: ''
  });

  // Styling Constants
  const inputClassName = "w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-sm font-semibold text-slate-700 mb-1.5";

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Banner Minimalista */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Clínicas Parceiras</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Gerencie o cadastro de consultórios e dentistas.</p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl shadow-sm border border-slate-100 text-teal-600 hidden sm:block">
                <Building2 size={24} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Clinic Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Plus size={20} className="text-teal-600" /> Nova Clínica
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
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
            
            <button type="submit" className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition shadow-md shadow-teal-200 mt-2">
              Cadastrar Clínica
            </button>
          </form>
        </div>

        {/* Clinics List */}
        <div className="lg:col-span-2 space-y-4">
           {clinics.map(clinic => (
             <div key={clinic.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-teal-200 transition">
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                     <Building2 size={18} />
                   </div>
                   <h4 className="font-bold text-slate-800 text-lg">{clinic.name}</h4>
                 </div>
                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-500 ml-1">
                   <span className="flex items-center gap-2"><User size={14} className="text-teal-600"/> {clinic.doctorName}</span>
                   {clinic.phone && <span className="flex items-center gap-2"><Phone size={14} className="text-blue-600"/> {clinic.phone}</span>}
                 </div>
               </div>
               <div className="flex items-center gap-4 pl-4 border-l border-slate-100 ml-4">
                 <button 
                  onClick={() => {
                    if(confirm('Excluir esta clínica?')) onDeleteClinic(clinic.id);
                  }}
                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Excluir"
                 >
                   <Trash2 size={18} />
                 </button>
               </div>
             </div>
           ))}
           {clinics.length === 0 && (
             <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
               Nenhuma clínica cadastrada.
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Clinics;
