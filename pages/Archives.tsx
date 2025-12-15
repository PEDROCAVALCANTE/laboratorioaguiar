import React, { useState, useMemo } from 'react';
import { Patient, WorkflowStatus, PaymentStatus } from '../types';
import { Search, Filter, ArrowUpDown, CheckCircle2, AlertCircle, FileSpreadsheet, Table } from 'lucide-react';

interface ArchivesProps {
  patients: Patient[];
}

type SortField = 'entryDate' | 'name' | 'clinic' | 'serviceValue' | 'currentStatus' | 'paymentStatus';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'SYSTEM' | 'SHEET';

const Archives: React.FC<ArchivesProps> = ({ patients }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('SYSTEM');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, COMPLETED, ACTIVE
  const [sortField, setSortField] = useState<SortField>('entryDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // URL da Planilha fornecida
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1D90dfCmsOe-NxbFLMaFFyy59fLRJybGJ0BdJpDDxktA/edit?widget=true&headers=false";

  // Helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (isoStr: string) => {
    if (!isoStr) return '-';
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  // Filtragem e Ordenação (Apenas para modo Sistema)
  const processedData = useMemo(() => {
    let data = [...patients];

    // 1. Filtro de Texto
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.clinic.toLowerCase().includes(lower) ||
        p.doctorName.toLowerCase().includes(lower) ||
        p.prosthesisType.toLowerCase().includes(lower)
      );
    }

    // 2. Filtro de Status
    if (statusFilter === 'COMPLETED') {
      data = data.filter(p => p.currentStatus === WorkflowStatus.CONCLUIDO);
    } else if (statusFilter === 'ACTIVE') {
      data = data.filter(p => p.currentStatus !== WorkflowStatus.CONCLUIDO);
    }

    // 3. Ordenação
    data.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Tratamento especial para datas e strings
      if (sortField === 'entryDate') {
        valA = new Date(a.entryDate).getTime();
        valB = new Date(b.entryDate).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [patients, searchTerm, statusFilter, sortField, sortDirection]);

  // Totais
  const totalValue = processedData.reduce((acc, curr) => acc + curr.serviceValue, 0);
  const count = processedData.length;

  // Handler de Ordenação
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />;
    return <ArrowUpDown size={12} className={`ml-1 ${sortDirection === 'asc' ? 'text-teal-600' : 'text-teal-600 rotate-180'}`} />;
  };

  const getStatusBadge = (status: WorkflowStatus) => {
    const styles = {
      [WorkflowStatus.ENTRADA]: 'bg-slate-100 text-slate-600',
      [WorkflowStatus.EM_PRODUCAO]: 'bg-yellow-50 text-yellow-700',
      [WorkflowStatus.ENVIADO_CLINICA]: 'bg-blue-50 text-blue-700',
      [WorkflowStatus.RETORNO_AJUSTE]: 'bg-red-50 text-red-700',
      [WorkflowStatus.REENVIO_CLINICA]: 'bg-purple-50 text-purple-700',
      [WorkflowStatus.CONCLUIDO]: 'bg-emerald-50 text-emerald-700',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles[status]}`}>{status}</span>;
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    return status === PaymentStatus.PAGO 
      ? <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1"><CheckCircle2 size={10}/> PAGO</span>
      : <span className="text-amber-600 font-bold text-[10px] flex items-center gap-1"><AlertCircle size={10}/> PENDENTE</span>;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      
      {/* Header Compacto com Seletor de Modo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Filter size={18} className="text-teal-600"/> Arquivo Geral
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Histórico e monitoramento de registros</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
                onClick={() => setViewMode('SYSTEM')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    viewMode === 'SYSTEM' 
                    ? 'bg-white text-teal-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <Table size={14} />
                Sistema
            </button>
            <button
                onClick={() => setViewMode('SHEET')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    viewMode === 'SHEET' 
                    ? 'bg-white text-green-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <FileSpreadsheet size={14} />
                Planilha Legada
            </button>
        </div>
      </div>

      {viewMode === 'SYSTEM' ? (
        <>
            {/* Barra de Ferramentas (Apenas Sistema) */}
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Filtrar por nome, clínica, serviço..." 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
                <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                    <button 
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === 'ALL' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Todos
                    </button>
                    <button 
                        onClick={() => setStatusFilter('COMPLETED')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Concluídos
                    </button>
                    <button 
                        onClick={() => setStatusFilter('ACTIVE')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === 'ACTIVE' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Em Aberto
                    </button>
                </div>
                
                {/* Resumo Rápido */}
                <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm ml-0 sm:ml-2">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                        <p className="text-sm font-bold text-teal-600">{formatCurrency(totalValue)}</p>
                    </div>
                </div>
            </div>

            {/* Tabela (Data Grid) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="overflow-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    <tr>
                        <th onClick={() => handleSort('entryDate')} className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors border-b border-slate-200">
                        <div className="flex items-center">Data <SortIcon field="entryDate"/></div>
                        </th>
                        <th onClick={() => handleSort('name')} className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors border-b border-slate-200">
                        <div className="flex items-center">Paciente <SortIcon field="name"/></div>
                        </th>
                        <th onClick={() => handleSort('clinic')} className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors border-b border-slate-200">
                        <div className="flex items-center">Clínica / Dentista <SortIcon field="clinic"/></div>
                        </th>
                        <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                        Serviço
                        </th>
                        <th onClick={() => handleSort('currentStatus')} className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors border-b border-slate-200 text-center">
                        <div className="flex items-center justify-center">Status <SortIcon field="currentStatus"/></div>
                        </th>
                        <th onClick={() => handleSort('paymentStatus')} className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors border-b border-slate-200 text-center">
                        <div className="flex items-center justify-center">Pagamento <SortIcon field="paymentStatus"/></div>
                        </th>
                        <th onClick={() => handleSort('serviceValue')} className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors border-b border-slate-200 text-right">
                        <div className="flex items-center justify-end">Valor <SortIcon field="serviceValue"/></div>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {processedData.map((patient) => (
                        <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">
                            {formatDate(patient.entryDate)}
                        </td>
                        <td className="px-4 py-2.5">
                            <div className="font-bold text-slate-700 text-sm group-hover:text-teal-700 transition-colors">{patient.name}</div>
                        </td>
                        <td className="px-4 py-2.5">
                            <div className="text-xs text-slate-700 font-medium">{patient.clinic}</div>
                            <div className="text-[10px] text-slate-400">{patient.doctorName}</div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-600 truncate max-w-[200px]" title={patient.prosthesisType}>
                            {patient.prosthesisType}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                            {getStatusBadge(patient.currentStatus)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                            {getPaymentBadge(patient.paymentStatus)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-700">
                            {formatCurrency(patient.serviceValue)}
                        </td>
                        </tr>
                    ))}
                    {processedData.length === 0 && (
                        <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400 italic text-sm">
                            Nenhum registro encontrado para os filtros selecionados.
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
                <div className="bg-slate-50 border-t border-slate-200 p-2 text-center text-[10px] text-slate-400">
                    Mostrando {processedData.length} registros
                </div>
            </div>
        </>
      ) : (
        /* Visualização da Planilha Google (Iframe) */
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 relative group">
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 -z-10">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FileSpreadsheet size={32} className="animate-pulse"/>
                    <span className="text-xs font-medium">Carregando Planilha Google...</span>
                </div>
            </div>
            <iframe 
                src={GOOGLE_SHEET_URL}
                className="w-full h-full border-0"
                title="Planilha de Pacientes Antigos"
                loading="lazy"
                allow="clipboard-read; clipboard-write"
            ></iframe>
        </div>
      )}
    </div>
  );
};

export default Archives;