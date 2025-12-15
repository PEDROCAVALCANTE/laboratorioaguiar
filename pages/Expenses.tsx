import React, { useState } from 'react';
import { Expense } from '../types';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [formData, setFormData] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    category: 'Material',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Material', 'Funcionário', 'Aluguel', 'Energia', 'Outros'];

  // Minimalist Styling
  const inputClassName = "w-full bg-white text-slate-900 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 hover:border-slate-300 shadow-sm";
  const labelClassName = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: Date.now().toString(),
      description: formData.description!,
      amount: Number(formData.amount),
      category: formData.category!,
      date: new Date(formData.date!).toISOString()
    };
    onAddExpense(newExpense);
    setFormData({ description: '', amount: 0, category: 'Material', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Controle de Despesas</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Add Expense Form */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2 uppercase tracking-wide">
            <Plus size={16} className="text-teal-600" /> Nova Despesa
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClassName}>Descrição</label>
              <input required type="text" className={inputClassName} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Gesso tipo IV" />
            </div>
            <div>
              <label className={labelClassName}>Valor (R$)</label>
              <div className="relative">
                 <span className="absolute left-3 top-2.5 text-slate-400 text-xs">R$</span>
                 <input required type="number" step="0.01" className={`${inputClassName} pl-8`} value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className={labelClassName}>Categoria</label>
              <select className={inputClassName} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClassName}>Data</label>
              <input required type="date" className={inputClassName} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <button type="submit" className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition shadow-sm shadow-red-200 mt-2">
              Registrar Saída
            </button>
          </form>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2 space-y-3">
           {expenses.slice().reverse().map(expense => (
             <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-red-200 transition">
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <h4 className="font-bold text-slate-800 text-sm">{expense.description}</h4>
                   <span className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full border border-slate-100">{expense.category}</span>
                 </div>
                 <div className="flex items-center gap-3 text-xs text-slate-500">
                   <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(expense.date).toLocaleDateString()}</span>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <span className="font-bold text-red-600 text-base">- R$ {expense.amount.toFixed(2)}</span>
                 <button 
                  onClick={() => {
                    if(confirm('Excluir esta despesa?')) onDeleteExpense(expense.id);
                  }}
                  className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition opacity-0 group-hover:opacity-100"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
             </div>
           ))}
           {expenses.length === 0 && (
             <div className="text-center py-8 text-sm text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
               Nenhuma despesa registrada.
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;