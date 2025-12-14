
import React, { useState } from 'react';
import { ServiceItem } from '../types';
import { Plus, Trash2, ClipboardList, DollarSign } from 'lucide-react';

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

  // Styling Constants
  const inputClassName = "w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-sm font-semibold text-slate-700 mb-1.5";

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
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Banner Minimalista */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Catálogo de Serviços</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Gerencie a tabela de preços e tipos de próteses.</p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl shadow-sm border border-slate-100 text-teal-600 hidden sm:block">
                <ClipboardList size={24} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Service Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Plus size={20} className="text-teal-600" /> Novo Serviço
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClassName}>Nome do Serviço</label>
              <input required type="text" className={inputClassName} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Prótese Total" />
            </div>
            <div>
              <label className={labelClassName}>Preço Base (R$)</label>
              <div className="relative">
                 <span className="absolute left-3 top-3 text-slate-400 text-sm">R$</span>
                 <input required type="number" step="0.01" className={`${inputClassName} pl-9`} value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
              </div>
            </div>
            
            <button type="submit" className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition shadow-md shadow-teal-200 mt-2">
              Salvar Serviço
            </button>
          </form>
        </div>

        {/* Services List */}
        <div className="lg:col-span-2 space-y-4">
           {services.map(service => (
             <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-teal-200 transition">
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <h4 className="font-bold text-slate-800">{service.name}</h4>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <span className="font-bold text-teal-600 text-lg">R$ {service.price.toFixed(2)}</span>
                 <button 
                  onClick={() => {
                    if(confirm('Excluir este serviço?')) onDeleteService(service.id);
                  }}
                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Excluir"
                 >
                   <Trash2 size={18} />
                 </button>
               </div>
             </div>
           ))}
           {services.length === 0 && (
             <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
               Nenhum serviço cadastrado.
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
