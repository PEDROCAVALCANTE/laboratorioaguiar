import React, { useState } from 'react';
import { ServiceItem } from '../types';
import { Plus, Trash2, ClipboardList } from 'lucide-react';

interface ServicesPageProps {
  services: ServiceItem[];
  onAddService: (service: ServiceItem) => void;
  onDeleteService: (id: string) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ services, onAddService, onDeleteService }) => {
  const [formData, setFormData] = useState<Partial<ServiceItem>>({
    name: '',
    price: 0
  });

  // Minimalist Styling
  const inputClassName = "w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newService: ServiceItem = {
      id: Date.now().toString(),
      name: formData.name!,
      price: Number(formData.price)
    };
    onAddService(newService);
    setFormData({ name: '', price: 0 });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Banner Minimalista */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-6 shadow-sm group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
        <div className="relative z-10 flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Catálogo de Serviços</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-8 h-0.5 bg-teal-500 rounded-full"></div>
                   <p className="text-[10px] text-teal-600/70 font-black uppercase tracking-widest">Tabela de Preços e Próteses</p>
                </div>
            </div>
            <div className="bg-teal-500 p-2.5 rounded-xl text-white shadow-lg shadow-teal-100 transition-transform hover:scale-110 duration-300">
                <ClipboardList size={20} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Add Service Form */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2 uppercase tracking-wide">
            <Plus size={16} className="text-teal-600" /> Novo Serviço
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClassName}>Nome do Serviço</label>
              <input required type="text" className={inputClassName} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Prótese Total" />
            </div>
            <div>
              <label className={labelClassName}>Preço Base (R$)</label>
              <div className="relative">
                 <span className="absolute left-3 top-2.5 text-slate-400 text-xs">R$</span>
                 <input required type="number" step="0.01" className={`${inputClassName} pl-8`} value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
              </div>
            </div>
            
            <button type="submit" className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition shadow-sm shadow-teal-200 mt-2">
              Salvar Serviço
            </button>
          </form>
        </div>

        {/* Services List */}
        <div className="lg:col-span-2 space-y-3">
           {services.map(service => (
             <div key={service.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-teal-200 transition-all duration-300">
               <div className="flex-1">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                   <h4 className="font-bold text-slate-700 text-sm tracking-tight">{service.name}</h4>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <span className="font-black text-teal-600 text-base">R$ {service.price.toFixed(2)}</span>
                 <button 
                  onClick={() => {
                    if(confirm('Excluir este serviço?')) onDeleteService(service.id);
                  }}
                  className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Excluir"
                 >
                   <Trash2 size={18} />
                 </button>
               </div>
             </div>
           ))}
           {services.length === 0 && (
             <div className="text-center py-8 text-sm text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
               Nenhum serviço cadastrado.
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;