import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard, X, ExternalLink } from 'lucide-react';

interface PaymentReminderModalProps {
  onClose: () => void;
}

const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeno delay para animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
            <CreditCard size={32} />
          </div>
          
          <h2 className="text-2xl font-bold mb-1">Pagamento Pendente</h2>
          <p className="text-blue-100 text-sm">Lembrete de mensalidade do sistema</p>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="flex items-start gap-4 mb-8 bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-amber-900 font-medium mb-1">Vencimento Próximo</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Sua mensalidade vence no dia <span className="font-bold">10 de cada mês</span>. 
                Evite a suspensão dos serviços realizando o pagamento em dia.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Valor Mensal</span>
              <span className="text-slate-900 font-bold">R$ 89,99</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Status</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">Aguardando</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-100"
            >
              Lembrar Depois
            </button>
            <button 
              className="px-4 py-3.5 rounded-2xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              onClick={() => {
                // Aqui poderia abrir o link de pagamento
                window.open('https://pagamento.exemplo.com', '_blank');
              }}
            >
              Pagar Agora <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">
            Em caso de dúvidas, entre em contato com o suporte técnico.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentReminderModal;
