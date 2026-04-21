import React, { useMemo } from 'react';
import { Patient, Expense, WorkflowStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Wallet, Users, TrendingUp, TrendingDown, Sun, Moon, Clock, ArrowRight, Building2, ShoppingCart
} from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  expenses: Expense[];
  onShowPayment?: () => void;
}

const COLORS = {
  [WorkflowStatus.PLANO_CERA]: '#cbd5e1', 
  [WorkflowStatus.MOLDEIRA_INDIVIDUAL]: '#94a3b8', 
  [WorkflowStatus.BARRA]: '#06b6d4', 
  [WorkflowStatus.ARMACAO]: '#f97316', 
  [WorkflowStatus.MONTAGEM_DENTES]: '#fcd34d', 
  [WorkflowStatus.REMONTAR_DENTES]: '#f87171', 
  [WorkflowStatus.ACRILIZAR]: '#818cf8', 
  [WorkflowStatus.FINALIZADO]: '#34d399', 
};

const Dashboard: React.FC<DashboardProps> = ({ patients, expenses, onShowPayment }) => {

  const stats = useMemo(() => {
    const active = patients.filter(p => p.isActive).length;
    const completed = patients.filter(p => p.currentStatus === WorkflowStatus.FINALIZADO).length;
    const totalRevenue = patients.reduce((acc, curr) => acc + curr.serviceValue, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    return { active, completed, totalRevenue, totalExpenses, netProfit };
  }, [patients, expenses]);

  const latestPatients = useMemo(() => {
    return [...patients]
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
      .slice(0, 5);
  }, [patients]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    const data = months.map(m => ({ name: m, revenue: 0, expenses: 0 }));
    patients.forEach(p => {
      const date = new Date(p.entryDate);
      if (date.getFullYear() === currentYear) data[date.getMonth()].revenue += p.serviceValue;
    });
    expenses.forEach(e => {
      const date = new Date(e.date);
      if (date.getFullYear() === currentYear) data[date.getMonth()].expenses += e.amount;
    });
    return data;
  }, [patients, expenses]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(WorkflowStatus).forEach(s => counts[s] = 0);
    patients.forEach(p => { if (counts[p.currentStatus] !== undefined) counts[p.currentStatus]++; });
    return Object.entries(counts).filter(([_, value]) => value > 0).map(([name, value]) => ({ name, value }));
  }, [patients]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Bom dia', icon: Sun, color: 'text-amber-500' };
    if (hour >= 12 && hour < 18) return { text: 'Boa tarde', icon: Sun, color: 'text-orange-500' };
    return { text: 'Boa noite', icon: Moon, color: 'text-indigo-500' };
  };

  const greeting = getGreetingData();
  const GreetingIcon = greeting.icon;

  const today = new Date();
  const day = today.getDate();
  const isNearDue = day >= 5 && day <= 10;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      
      {/* Alerta de Mensalidade */}
      {isNearDue && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-4 text-white shadow-lg shadow-amber-200 flex items-center justify-between animate-pulse">
           <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                 <ShoppingCart size={20} />
              </div>
              <div>
                 <p className="text-xs font-bold uppercase tracking-wider opacity-80">Atenção Administradora</p>
                 <h4 className="text-sm font-bold">Lembrete: Mensalidade do sistema vence dia 10</h4>
              </div>
           </div>
           <button 
             onClick={onShowPayment}
             className="bg-white text-orange-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-50 transition-colors flex items-center gap-2"
           >
              Pagar Agora <ArrowRight size={14} />
           </button>
        </div>
      )}
      
      {/* Banner Minimalista */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden relative group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50 rounded-full -ml-20 -mb-20 blur-3xl opacity-50"></div>
         
         <div className="relative flex justify-between items-center">
            <div>
               <div className="flex items-center gap-2 mb-2">
                 <div className="p-1 bg-teal-50 rounded text-teal-600">
                    <GreetingIcon size={14} />
                 </div>
                 <span className="text-[10px] font-black text-teal-600/60 uppercase tracking-[0.2em]">Aguiar Dental Lab</span>
               </div>
               <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {greeting.text}, <span className="text-teal-600">Thaynara</span>!
               </h1>
               <p className="text-xs text-slate-400 mt-1 font-medium italic">"Excelência em cada detalhe protético."</p>
            </div>
            <div className="text-right flex flex-col items-end">
               <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 mb-2">
                  <p className="text-[11px] font-black text-slate-600 capitalize">
                      {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
               </div>
               <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Sistema Operacional
               </div>
            </div>
         </div>
      </div>

      {/* KPI Grid - Compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-teal-200 transition-colors">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Users size={18} /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pedidos Ativos</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{stats.active}</h3>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
             <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl"><TrendingUp size={18} /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receita Bruto</span>
             </div>
             <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalRevenue)}</h3>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-rose-200 transition-colors">
             <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rose-50 text-rose-500 rounded-xl"><TrendingDown size={18} /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Despesas Totais</span>
             </div>
             <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalExpenses)}</h3>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-5 rounded-2xl shadow-lg shadow-teal-100 transition-transform hover:scale-[1.02] duration-300">
             <div className="flex items-center gap-3 mb-3 text-white/80">
                <div className="p-2 bg-white/20 rounded-xl"><Wallet size={18} /></div>
                <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">Saldo Líquido</span>
             </div>
             <h3 className="text-2xl font-bold text-white tracking-tight">{formatCurrency(stats.netProfit)}</h3>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm lg:col-span-2 h-72">
          <h3 className="text-xs font-bold text-slate-800 uppercase mb-4">Fluxo Mensal</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(v) => `R$${v/1000}k`} />
              <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', fontSize: '11px'}} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
           <h3 className="text-xs font-bold text-slate-800 uppercase mb-4 w-full">Distribuição</h3>
           <div className="h-32 w-full relative flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={3} dataKey="value" stroke="none">
                   {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name as WorkflowStatus] || '#e2e8f0'} />)}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute text-center">
                 <span className="block text-lg font-bold text-slate-800 leading-none">{stats.active}</span>
                 <span className="text-[8px] text-slate-400 font-bold uppercase">Ativos</span>
             </div>
           </div>
           <div className="w-full mt-4 space-y-1">
              {statusData.slice(0, 4).map(s => (
                <div key={s.name} className="flex justify-between items-center text-[10px] p-1.5 hover:bg-slate-50 rounded">
                  <span className="text-slate-500 font-medium truncate pr-2">{s.name}</span>
                  <span className="font-bold text-slate-700">{s.value}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Tabela de Atividade Curta */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" /> Últimas Entradas
              </h3>
              <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Visualizar Todos</button>
          </div>
          <div className="divide-y divide-slate-50">
              {latestPatients.map(p => (
                  <div key={p.id} className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 text-[11px] font-bold">
                              {p.name.charAt(0)}
                          </div>
                          <div>
                              <p className="text-xs font-bold text-slate-700">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.clinic} • {new Date(p.entryDate).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-xs font-bold text-slate-800">{formatCurrency(p.serviceValue)}</p>
                          <span className="text-[9px] font-bold uppercase text-blue-600">{p.currentStatus}</span>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;