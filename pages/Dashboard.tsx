import React, { useMemo } from 'react';
import { Patient, Expense, WorkflowStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Wallet, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  expenses: Expense[];
}

const COLORS = {
  [WorkflowStatus.PLANO_CERA]: '#cbd5e1', // Slate 300
  [WorkflowStatus.MOLDEIRA_INDIVIDUAL]: '#94a3b8', // Slate 400
  [WorkflowStatus.MONTAGEM_DENTES]: '#fcd34d', // Amber 300
  [WorkflowStatus.REMONTAR_DENTES]: '#f87171', // Red 400
  [WorkflowStatus.ACRILIZAR]: '#818cf8', // Indigo 400
  [WorkflowStatus.FINALIZADO]: '#34d399', // Emerald 400
};

const Dashboard: React.FC<DashboardProps> = ({ patients, expenses }) => {

  const stats = useMemo(() => {
    const active = patients.filter(p => p.isActive).length;
    const completed = patients.filter(p => p.currentStatus === WorkflowStatus.FINALIZADO).length;
    
    // Produção = Tudo que não é Finalizado nem Remontar
    const production = patients.filter(p => 
        p.currentStatus !== WorkflowStatus.FINALIZADO && 
        p.currentStatus !== WorkflowStatus.REMONTAR_DENTES
    ).length;
    
    const rework = patients.filter(p => p.currentStatus === WorkflowStatus.REMONTAR_DENTES).length;

    const totalRevenue = patients.reduce((acc, curr) => acc + curr.serviceValue, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    return { active, completed, production, rework, totalRevenue, totalExpenses, netProfit };
  }, [patients, expenses]);

  // Chart Data Preparation: Monthly Flow
  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    // Initialize
    const data = months.map(m => ({ name: m, revenue: 0, expenses: 0 }));

    patients.forEach(p => {
      const date = new Date(p.entryDate);
      if (date.getFullYear() === currentYear) {
        data[date.getMonth()].revenue += p.serviceValue;
      }
    });

    expenses.forEach(e => {
      const date = new Date(e.date);
      if (date.getFullYear() === currentYear) {
        data[date.getMonth()].expenses += e.amount;
      }
    });

    return data;
  }, [patients, expenses]);

  // Chart Data Preparation: Status Distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(WorkflowStatus).forEach(s => counts[s] = 0);

    patients.forEach(p => {
      if (counts[p.currentStatus] !== undefined) {
        counts[p.currentStatus]++;
      } else {
        counts[p.currentStatus] = 1;
      }
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [patients]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER TIPO BANNER - DISCRETO E PROFISSIONAL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/80 via-indigo-50/30 to-teal-50/50 border border-blue-100 p-8 shadow-sm">
         {/* Elemento decorativo de fundo */}
         <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

         <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
               <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Painel de Controle</h1>
               <p className="text-sm text-slate-500 font-medium mt-1">Visão geral do laboratório</p>
            </div>
            
            <div className="text-xs text-blue-700 font-bold bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-100 shadow-sm flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
               Atualizado em tempo real
            </div>
         </div>
      </div>

      {/* KPI Cards Grid - Minimalist & Clean */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Active Patients */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 shadow-[0_4px_12px_-3px_rgba(37,99,235,0.2)] transition-transform group-hover:scale-105">
                 <Users size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ativos</span>
            </div>
            <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{stats.active}</h3>
                  <p className="text-xs text-slate-400 mt-1">Pacientes em andamento</p>
                </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 shadow-[0_4px_12px_-3px_rgba(16,185,129,0.2)] transition-transform group-hover:scale-105">
                 <TrendingUp size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receita</span>
            </div>
             <div>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{formatCurrency(stats.totalRevenue)}</h3>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1 font-medium">
                     <ArrowUpRight size={12}/> Entrada Bruta
                  </div>
             </div>
          </div>

          {/* Expenses */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-rose-50 p-3 rounded-2xl text-rose-600 shadow-[0_4px_12px_-3px_rgba(244,63,94,0.2)] transition-transform group-hover:scale-105">
                 <TrendingDown size={22} />
              </div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Despesas</span>
            </div>
             <div>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{formatCurrency(stats.totalExpenses)}</h3>
                  <div className="flex items-center gap-1 text-rose-500 text-xs mt-1 font-medium">
                     <ArrowDownRight size={12}/> Saída Total
                  </div>
             </div>
          </div>

          {/* Net Profit */}
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-[0_8px_20px_-6px_rgba(30,41,59,0.4)] hover:shadow-lg transition-all relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-slate-600/30 transition-colors"></div>
             
             <div className="flex justify-between items-start mb-4 relative z-10">
               <div className="bg-slate-700 p-3 rounded-2xl text-white shadow-[0_4px_12px_-3px_rgba(0,0,0,0.3)]">
                  <Wallet size={22} />
               </div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Líquido</span>
             </div>
             <div className="relative z-10">
                  <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.netProfit)}</h3>
                  <p className="text-xs text-slate-400 mt-1">Lucro Real</p>
             </div>
          </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-700">Fluxo Financeiro</h3>
             <div className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-medium text-slate-500">Últimos 12 meses</div>
          </div>
          
          <div className="flex-1 w-full min-h-[16rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(value) => `R$${value/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)', fontSize: '12px', padding: '12px'}}
                />
                <Bar dataKey="revenue" name="Receita" fill="#2dd4bf" radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Bar dataKey="expenses" name="Despesas" fill="#fca5a5" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut & Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col">
           <h3 className="text-sm font-bold text-slate-700 mb-2">Status Operacional</h3>
           
           <div className="h-40 w-full relative flex items-center justify-center my-4">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={statusData}
                   cx="50%"
                   cy="50%"
                   innerRadius={45}
                   outerRadius={65}
                   paddingAngle={5}
                   dataKey="value"
                   stroke="none"
                   cornerRadius={4}
                 >
                   {statusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[entry.name as WorkflowStatus] || '#e2e8f0'} />
                   ))}
                 </Pie>
                 <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px -2px rgba(0,0,0,0.1)', fontSize: '12px'}} />
               </PieChart>
             </ResponsiveContainer>
             {/* Center Label */}
             <div className="absolute text-center pointer-events-none">
                 <span className="block text-2xl font-bold text-slate-800">{stats.active + stats.completed}</span>
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Total</span>
             </div>
           </div>

           <div className="space-y-3 mt-auto">
              <div className="flex items-center justify-between text-xs">
                 <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Finalizados
                 </span>
                 <span className="font-bold text-slate-800">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                 <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-300"></span> Em Produção
                 </span>
                 <span className="font-bold text-slate-800">{stats.production}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                 <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span> Retorno
                 </span>
                 <span className="font-bold text-slate-800">{stats.rework}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;