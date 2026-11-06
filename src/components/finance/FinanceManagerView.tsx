import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateDRE } from '../../utils/pizzaCalculator.ts';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
  Lock,
  Unlock,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
  Banknote,
  PieChart,
} from 'lucide-react';

export const FinanceManagerView: React.FC = () => {
  const {
    activeTenant,
    orders,
    activeCashRegister,
    cashRegisters,
    addCashMovement,
    openCashRegister,
    closeCashRegister,
    currentUser,
  } = useApp();

  // Estados dos modais de movimentação e fechamento
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'SANGRIA' | 'REFORCO'>('SANGRIA');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [countedCash, setCountedCash] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [openingBalanceInput, setOpeningBalanceInput] = useState('150.00');

  // Cálculo de DRE do período
  const fixedCosts = 45.00; // Custo proporcional fixo estimado do turno (energia, gás, equipe)
  const dre = calculateDRE(
    orders.map(o => ({
      total: o.total,
      paymentMethod: o.paymentMethod,
      cmv: o.cmvTotal,
      status: o.status,
    })),
    fixedCosts
  );

  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  const averageTicket = completedOrders.length > 0 ? dre.grossRevenue / completedOrders.length : 0;

  const handleMovementSubmit = () => {
    const val = parseFloat(movementAmount);
    if (val > 0 && movementReason) {
      addCashMovement(movementType, val, movementReason);
      setIsMovementModalOpen(false);
      setMovementAmount('');
      setMovementReason('');
    }
  };

  const handleCloseRegisterSubmit = () => {
    const val = parseFloat(countedCash);
    if (!isNaN(val)) {
      closeCashRegister(val, closingNotes);
      setIsCloseModalOpen(false);
    }
  };

  const handleOpenRegisterSubmit = () => {
    const val = parseFloat(openingBalanceInput);
    if (val >= 0) {
      openCashRegister(val);
      setIsOpenModalOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Gestão Financeira & Frente de Caixa (PDV)
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {activeTenant.name}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrativo de Resultado do Exercício (DRE), conciliação de taxas e controle de caixa cego.
          </p>
        </div>

        {/* Status do Caixa */}
        <div className="flex items-center gap-2">
          {activeCashRegister ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                <Unlock className="w-3.5 h-3.5" />
                Caixa Aberto por {activeCashRegister.operatorName}
              </span>
              <button
                onClick={() => setIsCloseModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Fechar Caixa
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsOpenModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              Abrir Novo Caixa
            </button>
          )}
        </div>
      </div>

      {/* Grid de Indicadores Financeiros do Turno */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Faturamento Bruto</span>
          <span className="text-xl font-extrabold font-mono text-slate-900 mt-1 block">
            R$ {dre.grossRevenue.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {completedOrders.length} pedidos entregues
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Taxas de Operadoras (Cartão)</span>
          <span className="text-xl font-extrabold font-mono text-rose-600 mt-1 block">
            - R$ {dre.gatewayFees.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Deduções automáticas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">CMV (Custo dos Insumos)</span>
          <span className="text-xl font-extrabold font-mono text-amber-600 mt-1 block">
            R$ {dre.cmvTotal.toFixed(2)}
          </span>
          <span className="text-[11px] text-amber-700 font-semibold">
            {dre.cmvPercentage}% da receita líquida
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-emerald-800 font-bold block">Lucro Líquido Estimado</span>
          <span className="text-xl font-extrabold font-mono text-emerald-700 mt-1 block">
            R$ {dre.netProfit.toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold">
            Margem de {dre.marginPercentage}%
          </span>
        </div>
      </div>

      {/* Demonstrativo DRE Gerencial Detalhado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel do Caixa Físico */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" />
              Gaveta de Caixa (PDV)
            </h3>
            {activeCashRegister && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setMovementType('SANGRIA');
                    setIsMovementModalOpen(true);
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded text-[11px] border border-rose-200"
                >
                  - Sangria
                </button>
                <button
                  onClick={() => {
                    setMovementType('REFORCO');
                    setIsMovementModalOpen(true);
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-[11px] border border-blue-200"
                >
                  + Reforço
                </button>
              </div>
            )}
          </div>

          {activeCashRegister ? (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-600">Fundo de Abertura:</span>
                <span className="font-mono font-bold text-slate-900">
                  R$ {activeCashRegister.openingBalance.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-900 text-white p-3.5 rounded-xl flex justify-between items-center">
                <span className="font-bold text-slate-300">Saldo em Caixa Esperado:</span>
                <span className="font-mono font-black text-amber-400 text-base">
                  R$ {activeCashRegister.calculatedBalance.toFixed(2)}
                </span>
              </div>

              <div className="pt-2">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block mb-2">
                  Histórico de Movimentações do Turno
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeCashRegister.movements.map(mov => (
                    <div key={mov.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{mov.reason}</div>
                        <div className="text-[10px] text-slate-500">{mov.operatorName} · {mov.timestamp}</div>
                      </div>
                      <span className={`font-mono font-bold ${mov.type === 'SANGRIA' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {mov.type === 'SANGRIA' ? '-' : '+'} R$ {mov.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Lock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-sm text-slate-700">Caixa Fechado</p>
              <p className="text-xs mt-1">Abra o caixa para iniciar os lançamentos de vendas do PDV.</p>
            </div>
          )}
        </div>

        {/* Tabela do DRE Gerencial */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              DRE Gerencial do Período (Regime de Competência)
            </h3>
            <span className="text-xs text-slate-500 font-semibold font-mono">
              Ticket Médio: R$ {averageTicket.toFixed(2)}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 font-bold text-slate-900">
              <span>(+) RECEITA OPERACIONAL BRUTA (Vendas Totais)</span>
              <span className="font-mono text-sm">R$ {dre.grossRevenue.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-1 text-rose-600 font-medium pl-4">
              <span>(-) Deduções de Taxas de Adquirência (Crédito/Débito)</span>
              <span className="font-mono">- R$ {dre.gatewayFees.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200 font-bold text-slate-800 bg-slate-50 px-2 rounded">
              <span>(=) RECEITA OPERACIONAL LÍQUIDA</span>
              <span className="font-mono text-sm">R$ {dre.netRevenue.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-1 text-amber-700 font-medium pl-4">
              <span>(-) CMV - Custo das Mercadorias Vendidas (Fichas Técnicas)</span>
              <span className="font-mono">- R$ {dre.cmvTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200 font-bold text-slate-800 bg-slate-50 px-2 rounded">
              <span>(=) LUCRO BRUTO (MARGEM DE CONTRIBUIÇÃO)</span>
              <span className="font-mono text-sm text-amber-700">R$ {dre.grossMargin.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-1 text-slate-600 font-medium pl-4">
              <span>(-) Despesas Operacionais Fixas Rateadas (Gás, Energia, Equipe)</span>
              <span className="font-mono">- R$ {dre.fixedCosts.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-3 border-t-2 border-slate-900 font-black text-slate-900 bg-emerald-50 px-3 rounded-lg text-sm">
              <span className="text-emerald-900">(=) LUCRO LÍQUIDO OPERACIONAL</span>
              <span className="font-mono text-base text-emerald-700">R$ {dre.netProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: ABERTURA DE CAIXA */}
      {isOpenModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <h3 className="font-black text-slate-900 text-base">Abertura de Caixa do Turno</h3>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Fundo de Troco Inicial (R$)</label>
              <input
                type="number"
                step="0.01"
                value={openingBalanceInput}
                onChange={e => setOpeningBalanceInput(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsOpenModalOpen(false)} className="px-4 py-2 border rounded-lg font-bold text-slate-600">
                Cancelar
              </button>
              <button onClick={handleOpenRegisterSubmit} className="px-5 py-2 bg-emerald-600 text-white font-extrabold rounded-lg">
                Iniciar Turno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SANGRIA / REFORÇO */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <h3 className="font-black text-slate-900 text-base">
              {movementType === 'SANGRIA' ? 'Registrar Sangria (Retirada)' : 'Registrar Reforço (Entrada)'}
            </h3>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 50.00"
                value={movementAmount}
                onChange={e => setMovementAmount(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Motivo / Justificativa</label>
              <input
                type="text"
                placeholder="Ex: Pagamento adiantado do motoboy ou troco extra"
                value={movementReason}
                onChange={e => setMovementReason(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsMovementModalOpen(false)} className="px-4 py-2 border rounded-lg font-bold text-slate-600">
                Cancelar
              </button>
              <button onClick={handleMovementSubmit} className="px-5 py-2 bg-slate-900 text-white font-extrabold rounded-lg">
                Confirmar Lançamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FECHAMENTO CEGO DE CAIXA */}
      {isCloseModalOpen && activeCashRegister && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <h3 className="font-black text-slate-900 text-base">Fechamento Cego de Caixa</h3>
            <p className="text-slate-500 text-xs">
              Conte o dinheiro físico e os comprovantes da gaveta e informe abaixo. O sistema fará a conferência de divergências.
            </p>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Valor Contado em Gaveta (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Digite o total físico em dinheiro"
                value={countedCash}
                onChange={e => setCountedCash(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-base font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Observações de Fechamento</label>
              <textarea
                placeholder="Alguma nota sobre troco ou sobra/falta..."
                value={closingNotes}
                onChange={e => setClosingNotes(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsCloseModalOpen(false)} className="px-4 py-2 border rounded-lg font-bold text-slate-600">
                Cancelar
              </button>
              <button onClick={handleCloseRegisterSubmit} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg">
                Encerrar Caixa e Conferir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
