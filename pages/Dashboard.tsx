import React, { useMemo } from 'react';
import { Patient, Expense, WorkflowStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Wallet, Users, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

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
    
    // Initialize all statuses with 0 or just count existing
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
      <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Pacientes Ativos</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.active}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex gap-2 text-xs font-medium text-slate-600">
             <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{stats.production} em Produção</span>
             <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">{stats.rework} Retrabalho</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div>
              <p className="text-slate-500 text-sm font-medium">Receita Total</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.totalRevenue)}</h3>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Valor total de serviços registrados</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
           <div className="flex justify-between items-start">
             <div>
              <p className="text-slate-500 text-sm font-medium">Despesas</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">{formatCurrency(stats.totalExpenses)}</h3>
            </div>
            <div className="bg-red-100 p-2 rounded-lg text-red-600">
              <TrendingDown size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Custos operacionais acumulados</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
           <div className="flex justify-between items-start">
             <div>
              <p className="text-slate-500 text-sm font-medium">Lucro Líquido</p>
              <h3 className={`text-3xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                {formatCurrency(stats.netProfit)}
              </h3>
            </div>
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Wallet size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Margem atual</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2 min-w-0">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Fluxo Financeiro (Anual)</h3>
          <div className="h-72 w-full min-h-[18rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `R$${value/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="revenue" name="Receita" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col min-w-0">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Status dos Pacientes</h3>
           
           {/* Pie Chart */}
           <div className="h-48 mb-6 w-full min-h-[12rem]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={statusData}
                   cx="50%"
                   cy="50%"
                   innerRadius={40}
                   outerRadius={60}
                   paddingAngle={2}
                   dataKey="value"
                 >
                   {statusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[entry.name as WorkflowStatus] || '#94a3b8'} />
                   ))}
                 </Pie>
                 <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Legend iconSize={8} fontSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px'}} />
               </PieChart>
             </ResponsiveContainer>
           </div>

           <div className="space-y-4 flex-1">
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">Concluídos</span>
                </div>
                <span className="font-bold text-slate-800">{stats.completed}</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-yellow-500" />
                  <span className="text-sm font-medium text-slate-700">Em Produção</span>
                </div>
                <span className="font-bold text-slate-800">{stats.production}</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-500" />
                  <span className="text-sm font-medium text-slate-700">Retrabalho</span>
                </div>
                <span className="font-bold text-slate-800">{stats.rework}</span>
             </div>
             <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="text-center">
                  <span className="text-4xl font-bold text-slate-800 block">{stats.active + stats.completed}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Geral</span>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;