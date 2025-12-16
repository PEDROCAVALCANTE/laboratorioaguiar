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
    const styles = {
      [WorkflowStatus.PLANO_CERA]: 'bg-slate-100 text-slate-600',
      [WorkflowStatus.MOLDEIRA_INDIVIDUAL]: 'bg-blue-50 text-blue-700',
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Filter size={18} className="text-teal-600"/> Arquivo Geral
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Histórico e monitoramento de registros</p>
        </div>
        
        <div className="flex items-center gap-2">
            <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-slate-800 text-white hover:bg-slate-900 shadow-sm"
                title="Faça download da planilha como CSV e importe aqui"
            >
                {isImporting ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <Upload size={14} />}
                Migrar Planilha (CSV)
            </button>

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
                        Finalizados
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