import React, { useMemo } from 'react';
import { Patient, Expense, WorkflowStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Wallet, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, Clock } from 'lucide-react';

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
    const data = months.map(m => ({ name: m, revenue: 0, expenses: 0, profit: 0 }));

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
    
    // Calculate profit per month
    data.forEach(d => d.profit = d.revenue - d.expenses);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Intro Section - Clean */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-2">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{getGreeting()}, Thaynara!</h1>
            <p className="text-slate-500 mt-1">Aqui está o resumo do laboratório hoje.</p>
         </div>
      </div>

      {/* KPI Cards Grid - Refined */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Active Patients */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Users size={20} />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">Pacientes Ativos</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-slate-800">{stats.active}</h3>
                    <span className="text-xs font-medium text-slate-400">em andamento</span>
                </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <TrendingUp size={20} />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">Receita Bruta</span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(stats.totalRevenue)}</h3>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1 font-bold">
                        <ArrowUpRight size={14}/> +12% vs mês anterior
                    </div>
                </div>
             </div>
          </div>

          {/* Expenses */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                        <TrendingDown size={20} />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">Despesas</span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(stats.totalExpenses)}</h3>
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1 font-bold">
                        <ArrowDownRight size={14}/> Saídas registradas
                    </div>
                </div>
             </div>
          </div>

          {/* Net Profit - Highlighted */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-[0_8px_20px_-6px_rgba(30,41,59,0.3)] hover:shadow-lg transition-all relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-48 h-48 bg-slate-700/40 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-slate-600/40 transition-colors"></div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 text-white/90">
                    <div className="p-2.5 bg-slate-700/80 rounded-xl backdrop-blur-sm">
                        <Wallet size={20} />
                    </div>
                    <span className="text-sm font-semibold text-slate-300">Lucro Líquido</span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.netProfit)}</h3>
                    <p className="text-xs text-slate-400 mt-2 font-medium bg-slate-700/50 inline-block px-2 py-1 rounded-md">Margem Real do Laboratório</p>
                </div>
             </div>
          </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] border border-slate-100 lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-lg font-bold text-slate-800">Fluxo Financeiro</h3>
                <p className="text-xs text-slate-400 font-medium">Comparativo de entradas e saídas</p>
            </div>
            <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Receita</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Despesa</span>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(value) => `${value/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', fontSize: '12px', padding: '16px'}}
                />
                <Bar dataKey="revenue" name="Receita" fill="#60a5fa" radius={[6, 6, 6, 6]} maxBarSize={32} />
                <Bar dataKey="expenses" name="Despesas" fill="#e2e8f0" radius={[6, 6, 6, 6]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 mb-1">Status Operacional</h3>
           <p className="text-xs text-slate-400 font-medium mb-6">Distribuição atual de pedidos</p>
           
           <div className="h-48 w-full relative flex items-center justify-center mb-6">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={statusData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={6}
                   dataKey="value"
                   stroke="none"
                   cornerRadius={6}
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
                 <span className="block text-3xl font-bold text-slate-800">{stats.active + stats.completed}</span>
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Total</span>
             </div>
           </div>

           <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-slate-600">Finalizados</span>
                 </div>
                 <span className="font-bold text-slate-800 text-sm">{stats.completed}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <span className="text-xs font-bold text-slate-600">Em Produção</span>
                 </div>
                 <span className="font-bold text-slate-800 text-sm">{stats.production}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <span className="text-xs font-bold text-slate-600">Retorno / Ajuste</span>
                 </div>
                 <span className="font-bold text-slate-800 text-sm">{stats.rework}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;