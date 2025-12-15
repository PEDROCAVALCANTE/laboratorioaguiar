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
  const inputClassName = "w-full bg-white text-slate-900 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1";

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 border border-slate-200 p-5 shadow-sm">
        <div className="relative z-10 flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Catálogo de Serviços</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Gerencie a tabela de preços e tipos de próteses.</p>
            </div>
            <div className="bg-white/80 p-2 rounded-lg shadow-sm border border-slate-100 text-teal-600 hidden sm:block">
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
             <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-teal-200 transition">
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <h4 className="font-bold text-slate-800 text-sm">{service.name}</h4>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <span className="font-bold text-teal-600 text-base">R$ {service.price.toFixed(2)}</span>
                 <button 
                  onClick={() => {
                    if(confirm('Excluir este serviço?')) onDeleteService(service.id);
                  }}
                  className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                  title="Excluir"
                 >
                   <Trash2 size={16} />
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