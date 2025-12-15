import React, { useMemo } from 'react';
import { Patient, Expense, WorkflowStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Wallet, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  expenses: Expense[];
}

const COLORS = {
  [WorkflowStatus.ENTRADA]: '#94a3b8', // Slate 400
  [WorkflowStatus.EM_PRODUCAO]: '#eab308', // Yellow 500
  [WorkflowStatus.ENVIADO_CLINICA]: '#3b82f6', // Blue 500
  [WorkflowStatus.RETORNO_AJUSTE]: '#ef4444', // Red 500
  [WorkflowStatus.REENVIO_CLINICA]: '#a855f7', // Purple 500
  [WorkflowStatus.CONCLUIDO]: '#10b981', // Emerald 500
};

const Dashboard: React.FC<DashboardProps> = ({ patients, expenses }) => {

  const stats = useMemo(() => {
    const active = patients.filter(p => p.isActive).length;
    const completed = patients.filter(p => p.currentStatus === WorkflowStatus.CONCLUIDO).length;
    const production = patients.filter(p => p.currentStatus === WorkflowStatus.EM_PRODUCAO).length;
    const rework = patients.filter(p => p.currentStatus === WorkflowStatus.RETORNO_AJUSTE).length;

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
      
      {/* BANNER SECTION - Reduced height and padding */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 border border-slate-200 p-5 shadow-sm">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 rounded-full bg-blue-100/40 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-teal-100/40 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Visão Geral</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Resumo financeiro e operacional</p>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-white/80 backdrop-blur px-2.5 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
                    </span>
                    Tempo Real
                </span>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* Active Patients */}
                <div className="bg-white p-4 rounded-xl shadow-sm border-t-2 border-blue-500 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Users size={60} />
                </div>
                <div className="flex justify-between items-start z-10">
                    <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Pacientes Ativos</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.active}</h3>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-md text-blue-600">
                    <Users size={16} />
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5 text-[9px] font-bold uppercase tracking-wide">
                    <span className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100">{stats.production} Produção</span>
                    <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100">{stats.rework} Retorno</span>
                </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white p-4 rounded-xl shadow-sm border-t-2 border-emerald-500 flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start">
                    <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Receita Total</p>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.totalRevenue)}</h3>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-md text-emerald-600">
                    <TrendingUp size={16} />
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium">Acumulado anual</p>
                </div>

                {/* Expenses */}
                <div className="bg-white p-4 rounded-xl shadow-sm border-t-2 border-red-500 flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start">
                    <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Despesas</p>
                    <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats.totalExpenses)}</h3>
                    </div>
                    <div className="bg-red-50 p-2 rounded-md text-red-600">
                    <TrendingDown size={16} />
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium">Custos operacionais</p>
                </div>

                {/* Net Profit */}
                <div className="bg-white p-4 rounded-xl shadow-sm border-t-2 border-indigo-500 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start z-10">
                    <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Lucro Líquido</p>
                    <h3 className={`text-2xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                        {formatCurrency(stats.netProfit)}
                    </h3>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-md text-indigo-600">
                    <Wallet size={16} />
                    </div>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-1 overflow-hidden z-10 relative">
                    <div 
                        className="bg-indigo-500 h-full rounded-full" 
                        style={{ width: `${stats.totalRevenue > 0 ? Math.max(0, (stats.netProfit / stats.totalRevenue) * 100) : 0}%` }}
                    ></div>
                </div>
                <p className="text-[9px] text-indigo-400 mt-1 text-right font-bold relative z-10">Margem Líquida</p>
                </div>
            </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 lg:col-span-2 min-w-0">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Fluxo Financeiro</h3>
            <select className="text-[10px] border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-600 outline-none">
                <option>Últimos 12 meses</option>
            </select>
          </div>
          
          <div className="h-64 w-full min-h-[16rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(value) => `R$${value/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', padding: '8px'}}
                />
                <Bar dataKey="revenue" name="Receita" fill="#14b8a6" radius={[3, 3, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expenses" name="Despesas" fill="#f87171" radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col min-w-0">
           <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Status dos Pacientes</h3>
           
           {/* Pie Chart */}
           <div className="h-40 mb-4 w-full min-h-[10rem]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={statusData}
                   cx="50%"
                   cy="50%"
                   innerRadius={45}
                   outerRadius={65}
                   paddingAngle={4}
                   dataKey="value"
                   stroke="none"
                 >
                   {statusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[entry.name as WorkflowStatus] || '#94a3b8'} />
                   ))}
                 </Pie>
                 <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                 <Legend iconSize={6} fontSize={9} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '9px'}} />
               </PieChart>
             </ResponsiveContainer>
           </div>

           <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
             <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-medium text-slate-700">Concluídos</span>
                </div>
                <span className="font-bold text-xs text-slate-800">{stats.completed}</span>
             </div>
             <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  <span className="text-xs font-medium text-slate-700">Em Produção</span>
                </div>
                <span className="font-bold text-xs text-slate-800">{stats.production}</span>
             </div>
             <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <span className="text-xs font-medium text-slate-700">Retrabalho</span>
                </div>
                <span className="font-bold text-xs text-slate-800">{stats.rework}</span>
             </div>
           </div>
           
           <div className="mt-3 pt-3 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400">Total de Pacientes</p>
              <p className="text-xl font-bold text-slate-800">{stats.active + stats.completed}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;