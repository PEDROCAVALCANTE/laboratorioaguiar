import React, { useState, useMemo, useRef } from 'react';
import { Patient, WorkflowStatus, PaymentStatus } from '../types';
import { Search, Filter, ArrowUpDown, CheckCircle2, AlertCircle, FileSpreadsheet, Table, Upload, HelpCircle, Download } from 'lucide-react';
import { StorageService } from '../services/storage';

interface ArchivesProps {
  patients: Patient[];
  onDataUpdate?: () => void;
}

type SortField = 'entryDate' | 'name' | 'clinic' | 'serviceValue' | 'currentStatus' | 'paymentStatus';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'SYSTEM' | 'SHEET';

const Archives: React.FC<ArchivesProps> = ({ patients, onDataUpdate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('SYSTEM');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, COMPLETED, ACTIVE
  const [sortField, setSortField] = useState<SortField>('entryDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL da Planilha fornecida
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1D90dfCmsOe-NxbFLMaFFyy59fLRJybGJ0BdJpDDxktA/edit?widget=true&headers=false";

  // Helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (isoStr: string) => {
    if (!isoStr) return '-';
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  // --- LÓGICA DE IMPORTAÇÃO CSV ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const processCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        const rows = text.split('\n');
        // Assumindo que a primeira linha é o cabeçalho
        const headers = rows[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Mapeamento de índices
        const dateIdx = headers.findIndex(h => h.includes('data') || h.includes('entrada'));
        const nameIdx = headers.findIndex(h => h.includes('paciente') || h.includes('nome'));
        const clinicIdx = headers.findIndex(h => h.includes('clínica') || h.includes('clinica'));
        const doctorIdx = headers.findIndex(h => h.includes('dentista') || h.includes('doutor'));
        const serviceIdx = headers.findIndex(h => h.includes('serviço') || h.includes('trabalho') || h.includes('prótese') || h.includes('protese'));
        const valueIdx = headers.findIndex(h => h.includes('valor') || h.includes('preço') || h.includes('total'));
        const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('situação'));

        let importedCount = 0;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row.trim()) continue;

          // Regex para separar por vírgula, mas ignorar vírgulas dentro de aspas (ex: "Silva, Joao")
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));

          if (cols.length < 2) continue; // Linha inválida

          // Parsing dos dados
          const name = nameIdx > -1 ? cols[nameIdx] : 'Importado';
          const clinic = clinicIdx > -1 ? cols[clinicIdx] : '';
          const doctorName = doctorIdx > -1 ? cols[doctorIdx] : '';
          const prosthesisType = serviceIdx > -1 ? cols[serviceIdx] : 'Serviço Diverso';
          
          // Tratamento de Valor (R$ 1.200,00 -> 1200.00)
          let valStr = valueIdx > -1 ? cols[valueIdx] : '0';
          valStr = valStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
          const serviceValue = parseFloat(valStr) || 0;

          // Tratamento de Data (DD/MM/YYYY -> YYYY-MM-DD)
          let dateStr = dateIdx > -1 ? cols[dateIdx] : '';
          let isoDate = new Date().toISOString();
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              // Assumindo DD/MM/YYYY
              isoDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
            }
          }

          // Tratamento de Status
          const statusRaw = statusIdx > -1 ? cols[statusIdx].toLowerCase() : '';
          let currentStatus = WorkflowStatus.PLANO_CERA; // Padrão
          let isActive = true;

          if (statusRaw.includes('conclu') || statusRaw.includes('entregue') || statusRaw.includes('pronto') || statusRaw.includes('finalizado')) {
            currentStatus = WorkflowStatus.FINALIZADO;
            isActive = false; 
          } else if (statusRaw.includes('remontar') || statusRaw.includes('ajuste')) {
            currentStatus = WorkflowStatus.REMONTAR_DENTES;
          } else if (statusRaw.includes('acrilizar')) {
            currentStatus = WorkflowStatus.ACRILIZAR;
          } else if (statusRaw.includes('montagem')) {
            currentStatus = WorkflowStatus.MONTAGEM_DENTES;
          } else if (statusRaw.includes('moldeira')) {
            currentStatus = WorkflowStatus.MOLDEIRA_INDIVIDUAL;
          }

          const newPatient: Patient = {
            id: `import-${Date.now()}-${i}`,
            name: name || 'Sem Nome',
            clinic: clinic || 'Sem Clínica',
            doctorName: doctorName,
            doctorPhone: '',
            prosthesisType: prosthesisType,
            serviceValue: serviceValue,
            laborCost: 0,
            entryDate: isoDate,
            dueDate: new Date(new Date(isoDate).getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString(), // +7 dias
            notes: 'Importado via CSV',
            paymentStatus: PaymentStatus.PENDENTE,
            workflowHistory: [],
            currentStatus: currentStatus,
            isActive: isActive
          };

          await StorageService.savePatient(newPatient);
          importedCount++;
        }

        alert(`${importedCount} registros importados com sucesso!`);
        if (onDataUpdate) onDataUpdate();
        
      } catch (error) {
        console.error(error);
        alert('Erro ao processar o arquivo. Verifique se é um CSV válido.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
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
      data = data.filter(p => p.currentStatus === WorkflowStatus.FINALIZADO);
    } else if (statusFilter === 'ACTIVE') {
      data = data.filter(p => p.currentStatus !== WorkflowStatus.FINALIZADO);
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
    const styles: Record<string, string> = {
      [WorkflowStatus.PLANO_CERA]: 'bg-slate-100 text-slate-600',
      [WorkflowStatus.MOLDEIRA_INDIVIDUAL]: 'bg-blue-50 text-blue-700',
      [WorkflowStatus.BARRA]: 'bg-cyan-50 text-cyan-700',
      [WorkflowStatus.ARMACAO]: 'bg-orange-50 text-orange-700',
      [WorkflowStatus.MONTAGEM_DENTES]: 'bg-amber-50 text-amber-700',
      [WorkflowStatus.REMONTAR_DENTES]: 'bg-red-50 text-red-700',
      [WorkflowStatus.ACRILIZAR]: 'bg-purple-50 text-purple-700',
      [WorkflowStatus.FINALIZADO]: 'bg-emerald-50 text-emerald-700',
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
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        onChange={processCSV} 
        className="hidden" 
      />

      {/* Header Compacto com Seletor de Modo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-shrink-0 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Filter size={18} className="text-teal-500"/> Arquivo Geral
          </h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-8 h-0.5 bg-teal-500 rounded-full"></div>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Histórico & Monitoramento de Registros</p>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-3">
            <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all bg-slate-800 text-white hover:bg-slate-900 shadow-lg shadow-slate-200 uppercase tracking-wider"
                title="Faça download da planilha como CSV e importe aqui"
            >
                {isImporting ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <Upload size={14} className="text-teal-400"/>}
                Migrar Planilha (CSV)
            </button>

            <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 shadow-inner">
                <button
                    onClick={() => setViewMode('SYSTEM')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider ${
                        viewMode === 'SYSTEM' 
                        ? 'bg-white text-teal-600 shadow-sm border border-slate-100' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <Table size={14} />
                    Sistema
                </button>
                <button
                    onClick={() => setViewMode('SHEET')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider ${
                        viewMode === 'SHEET' 
                        ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <FileSpreadsheet size={14} />
                    Planilha Legada
                </button>
            </div>
        </div>
      </div>

      {viewMode === 'SYSTEM' ? (
        <>
            {/* Barra de Ferramentas (Apenas Sistema) */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="relative flex-1 group">
                <Search className="absolute left-3 top-2.5 text-slate-300 group-focus-within:text-teal-500 transition-colors" size={16} />
                <input 
                    type="text" 
                    placeholder="Filtrar por nome, clínica, serviço..." 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-100 rounded-xl text-[12px] focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700 shadow-sm font-medium placeholder:text-slate-300 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
                <div className="flex bg-white rounded-xl border border-slate-100 p-1.5 shadow-sm">
                    <button 
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === 'ALL' ? 'bg-slate-50 text-slate-800 border border-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Todos
                    </button>
                    <button 
                        onClick={() => setStatusFilter('COMPLETED')}
                        className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Finalizados
                    </button>
                    <button 
                        onClick={() => setStatusFilter('ACTIVE')}
                        className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === 'ACTIVE' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Em Aberto
                    </button>
                </div>
                
                {/* Resumo Rápido */}
                <div className="flex items-center gap-4 bg-white px-4 py-1.5 rounded-xl border border-slate-100 shadow-sm ml-0 sm:ml-2">
                    <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-tight">Receita Total</p>
                        <p className="text-sm font-black text-teal-600 tracking-tighter leading-tight">{formatCurrency(totalValue)}</p>
                    </div>
                </div>
            </div>

            {/* Tabela (Data Grid) */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="overflow-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-100">
                    <tr>
                        <th onClick={() => handleSort('entryDate')} className="px-5 py-4 font-black text-slate-400 text-[10px] uppercase tracking-[0.15em] cursor-pointer group hover:bg-white transition-colors border-r border-slate-50 last:border-r-0">
                        <div className="flex items-center">Data <SortIcon field="entryDate"/></div>
                        </th>
                        <th onClick={() => handleSort('name')} className="px-5 py-4 font-black text-slate-400 text-[10px] uppercase tracking-[0.15em] cursor-pointer group hover:bg-white transition-colors border-r border-slate-50 last:border-r-0">
                        <div className="flex items-center">Paciente <SortIcon field="name"/></div>
                        </th>
                        <th onClick={() => handleSort('clinic')} className="px-5 py-4 font-black text-slate-400 text-[10px] uppercase tracking-[0.15em] cursor-pointer group hover:bg-white transition-colors border-r border-slate-50 last:border-r-0">
                        <div className="flex items-center">Clínica / Dentista <SortIcon field="clinic"/></div>
                        </th>
                        <th className="px-5 py-4 font-black text-slate-400 text-[10px] uppercase tracking-[0.15em] border-r border-slate-50 last:border-r-0">
                        Serviço
                        </th>
                        <th onClick={() => handleSort('currentStatus')} className="px-5 py-4 font-black text-slate-400 text-[10px] uppercase tracking-[0.15em] cursor-pointer group hover:bg-white transition-colors border-r border-slate-50 last:border-r-0 text-center">
                        <div className="flex items-center justify-center">Status <SortIcon field="currentStatus"/></div>
                        </th>
                        <th onClick={() => handleSort('paymentStatus')} className="px-5 py-4 font-black text-slate-400 text-[10px] uppercase tracking-[0.15em] cursor-pointer group hover:bg-white transition-colors border-r border-slate-50 last:border-r-0 text-center">
                        <div className="flex items-center justify-center">Pagamento <SortIcon field="paymentStatus"/></div>
                        </th>
                        <th onClick={() => handleSort('serviceValue')} className="px-5 py-4 font-black text-slate-400 text-[10px] uppercase tracking-[0.15em] cursor-pointer group hover:bg-white transition-colors border-r border-slate-50 last:border-r-0 text-right">
                        <div className="flex items-center justify-end">Valor <SortIcon field="serviceValue"/></div>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {processedData.map((patient) => (
                        <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-3 text-slate-400 font-bold text-[11px]">
                            {formatDate(patient.entryDate)}
                        </td>
                        <td className="px-5 py-3">
                            <div className="font-bold text-slate-700 text-[13px] group-hover:text-teal-600 transition-colors">{patient.name}</div>
                        </td>
                        <td className="px-5 py-3">
                            <div className="text-[11px] text-slate-600 font-bold">{patient.clinic}</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{patient.doctorName}</div>
                        </td>
                        <td className="px-5 py-3 text-[11px] text-slate-500 font-medium truncate max-w-[200px]" title={patient.prosthesisType}>
                            {patient.prosthesisType}
                        </td>
                        <td className="px-5 py-3 text-center">
                            {getStatusBadge(patient.currentStatus)}
                        </td>
                        <td className="px-5 py-3 text-center">
                            {getPaymentBadge(patient.paymentStatus)}
                        </td>
                        <td className="px-5 py-3 text-right font-black text-slate-700 text-[12px] tracking-tight">
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
                    
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-[10px] max-w-xs text-center border border-yellow-100 mt-2">
                         <div className="font-bold flex items-center justify-center gap-1"><Download size={10}/> Dica:</div>
                         Para trazer estes dados para o sistema, vá em <strong>Arquivo &gt; Fazer download &gt; Valores separados por vírgula (.csv)</strong> e use o botão "Migrar Planilha" acima.
                    </div>
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