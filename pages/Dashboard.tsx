import React, { useMemo } from 'react';
import { Patient, Expense, WorkflowStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Wallet, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
  Sun, Moon, Clock, ArrowRight, Building2, ShoppingCart
} from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  expenses: Expense[];
}

const COLORS = {
  [WorkflowStatus.PLANO_CERA]: '#cbd5e1', // Slate 300
  [WorkflowStatus.MOLDEIRA_INDIVIDUAL]: '#94a3b8', // Slate 400
  [WorkflowStatus.BARRA]: '#06b6d4', // Cyan 500
  [WorkflowStatus.ARMACAO]: '#f97316', // Orange 500
  [WorkflowStatus.MONTAGEM_DENTES]: '#fcd34d', // Amber 300
  [WorkflowStatus.REMONTAR_DENTES]: '#f87171', // Red 400
  [WorkflowStatus.ACRILIZAR]: '#818cf8', // Indigo 400
  [WorkflowStatus.FINALIZADO]: '#34d399', // Emerald 400
};

const Dashboard: React.FC<DashboardProps> = ({ patients, expenses }) => {

  const stats = useMemo(() => {
    const active = patients.filter(p => p.isActive).length;
    const completed = patients.filter(p => p.currentStatus === WorkflowStatus.FINALIZADO).length;
    
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

  // Kardex Data: Latest 5
  const latestPatients = useMemo(() => {
    return [...patients]
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
      .slice(0, 5);
  }, [patients]);

  const latestExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [expenses]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
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
    
    data.forEach(d => d.profit = d.revenue - d.expenses);
    return data;
  }, [patients, expenses]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(WorkflowStatus).forEach(s => counts[s] = 0);

    patients.forEach(p => {
      if (counts[p.currentStatus] !== undefined) {
        counts[p.currentStatus]++;
      }
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [patients]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Bom dia', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50' };
    if (hour >= 12 && hour < 18) return { text: 'Boa tarde', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50' };
    return { text: 'Boa noite', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' };
  };

  const greeting = getGreetingData();
  const GreetingIcon = greeting.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
         <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-teal-50 rounded-full blur-3xl opacity-60 -mr-16 -mt-16 pointer-events-none"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
               <div className="flex items-center gap-2 mb-2">
                 <div className={`p-1.5 rounded-full ${greeting.bg} ${greeting.color}`}>
                    <GreetingIcon size={14} />
                 </div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dashboard Operacional</span>
               </div>
               <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Thaynara, {greeting.text.toLowerCase()}!</h1>
               <p className="text-slate-500 mt-1.5 max-w-lg text-sm font-medium">Confira as movimentações recentes do Laboratório Aguiar.</p>
            </div>
            <div className="hidden md:block text-right">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Resumo Financeiro</span>
               <p className="text-sm font-semibold text-slate-700">Competência {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
            </div>
         </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Users size={18} />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ativos</span>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-slate-800">{stats.active}</h3>
                <span className="text-[10px] font-medium text-slate-400">pedidos</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
             <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp size={18} />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receita</span>
             </div>
             <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalRevenue)}</h3>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
             <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingDown size={18} />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Despesas</span>
             </div>
             <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalExpenses)}</h3>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg shadow-slate-200/50 group">
             <div className="flex items-center gap-3 mb-3 text-white/80">
                <div className="p-2 bg-slate-700/80 rounded-xl">
                    <Wallet size={18} />
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Saldo Líquido</span>
             </div>
             <h3 className="text-2xl font-bold text-white tracking-tight">{formatCurrency(stats.netProfit)}</h3>
          </div>
      </div>

      {/* Charts & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-base font-bold text-slate-800">Fluxo de Caixa</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Entradas vs Saídas</p>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(v) => `R$ ${v/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px'}}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="expenses" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <h3 className="text-base font-bold text-slate-800 mb-6">Status da Produção</h3>
           <div className="h-40 w-full relative flex items-center justify-center mb-6">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={4}>
                   {statusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[entry.name as WorkflowStatus] || '#e2e8f0'} />
                   ))}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute text-center">
                 <span className="block text-xl font-bold text-slate-800 leading-none">{stats.active}</span>
                 <span className="text-[8px] text-slate-400 font-bold uppercase">Ativos</span>
             </div>
           </div>
           <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                 <span className="font-semibold text-slate-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Finalizados
                 </span>
                 <span className="font-bold text-slate-800">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                 <span className="font-semibold text-slate-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Em Produção
                 </span>
                 <span className="font-bold text-slate-800">{stats.production}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Kardex: Atividade Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kardex Pacientes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Clock size={16} className="text-blue-500" /> Atividade Recente: Pacientes
                  </h3>
                  <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider flex items-center gap-1">
                      Ver Todos <ArrowRight size={10} />
                  </button>
              </div>
              <div className="divide-y divide-slate-50">
                  {latestPatients.map(p => (
                      <div key={p.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                          <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                  <Building2 size={16} />
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-slate-700">{p.name}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{p.clinic} • {new Date(p.entryDate).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-sm font-bold text-slate-800">{formatCurrency(p.serviceValue)}</p>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${p.paymentStatus === 'Pago' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                  {p.paymentStatus}
                              </span>
                          </div>
                      </div>
                  ))}
                  {latestPatients.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400 italic">Nenhum paciente registrado recentemente.</div>
                  )}
              </div>
          </div>

          {/* Kardex Despesas */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Clock size={16} className="text-red-500" /> Atividade Recente: Despesas
                  </h3>
                  <button className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider flex items-center gap-1">
                      Ver Todas <ArrowRight size={10} />
                  </button>
              </div>
              <div className="divide-y divide-slate-50">
                  {latestExpenses.map(e => (
                      <div key={e.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                          <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-all">
                                  <ShoppingCart size={16} />
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-slate-700">{e.description}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{e.category} • {new Date(e.date).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-sm font-bold text-red-600">- {formatCurrency(e.amount)}</p>
                          </div>
                      </div>
                  ))}
                  {latestExpenses.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400 italic">Nenhuma despesa registrada recentemente.</div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;