import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Order, OrderStatus } from '../../types/index.ts';
import {
  ChefHat,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Timer,
  CheckSquare,
  Square,
  Search,
  Volume2,
  VolumeX,
  LayoutGrid,
  Columns3,
  Printer,
  ArrowRight,
  RotateCcw,
  Bike,
  ShoppingBag,
} from 'lucide-react';

export const KitchenKDSView: React.FC = () => {
  const { orders, updateOrderStatus, activeTenant } = useApp();

  // Estados locais da cozinha
  const [viewMode, setViewMode] = useState<'KANBAN' | 'GRID'>('KANBAN');
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Rastreamento dos pedidos que estão atualmente na fase "Forno a Lenha" (sub-status de PREPARING)
  const [inOvenOrderIds, setInOvenOrderIds] = useState<Set<string>>(new Set(['ord-102']));

  // Todos os pedidos relevantes para a cozinha
  const kitchenOrders = orders.filter(o =>
    ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY'].includes(o.status)
  );

  const filteredOrders = kitchenOrders.filter(order => {
    if (!searchTerm) return true;
    return (
      order.orderNumber.toString().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Separação em colunas Kanban do KDS:
  // 1. Fila de Entrada (CONFIRMED ou PENDING)
  const queueOrders = filteredOrders.filter(
    o => o.status === 'PENDING' || o.status === 'CONFIRMED'
  );

  // 2. Bancada de Montagem (PREPARING e não está no forno)
  const prepOrders = filteredOrders.filter(
    o => o.status === 'PREPARING' && !inOvenOrderIds.has(o.id)
  );

  // 3. Forno a Lenha (PREPARING e está no forno)
  const ovenOrders = filteredOrders.filter(
    o => o.status === 'PREPARING' && inOvenOrderIds.has(o.id)
  );

  // 4. Pronto / Expedição (READY_FOR_DELIVERY)
  const readyOrders = filteredOrders.filter(
    o => o.status === 'READY_FOR_DELIVERY'
  );

  const toggleItemCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Cálculo realista de tempo decorrido
  const getElapsedMinutes = (orderNumber: number) => {
    const base = (105 - orderNumber) * 6 + 5;
    return Math.max(3, base);
  };

  // Cores dinâmicas de alerta do timer
  const getTimeAlertStyle = (minutes: number) => {
    if (minutes < 12) {
      return {
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
        label: 'No prazo',
      };
    }
    if (minutes < 22) {
      return {
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
        label: 'Atenção',
      };
    }
    return {
      badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse',
      dot: 'bg-rose-400',
      label: 'Atrasado',
    };
  };

  // Transições da máquina de estado do KDS
  const handleStartPrep = (orderId: string) => {
    updateOrderStatus(orderId, 'PREPARING');
  };

  const handleSendToOven = (orderId: string) => {
    setInOvenOrderIds(prev => new Set(prev).add(orderId));
  };

  const handleFinishFromOven = (orderId: string) => {
    setInOvenOrderIds(prev => {
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
    updateOrderStatus(orderId, 'READY_FOR_DELIVERY');
  };

  const handleDispatch = (orderId: string) => {
    updateOrderStatus(orderId, 'OUT_FOR_DELIVERY');
  };

  const handleRollback = (orderId: string, currentStage: 'PREP' | 'OVEN' | 'READY') => {
    if (currentStage === 'OVEN') {
      setInOvenOrderIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    } else if (currentStage === 'READY') {
      updateOrderStatus(orderId, 'PREPARING');
      setInOvenOrderIds(prev => new Set(prev).add(orderId));
    } else if (currentStage === 'PREP') {
      updateOrderStatus(orderId, 'CONFIRMED');
    }
  };

  // Componente de Renderização do Cartão de Comanda do KDS
  const renderKdsCard = (order: Order, stage: 'QUEUE' | 'PREP' | 'OVEN' | 'READY') => {
    const elapsed = getElapsedMinutes(order.orderNumber);
    const alert = getTimeAlertStyle(elapsed);

    return (
      <div
        key={order.id}
        className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg ${
          stage === 'OVEN'
            ? 'border-orange-500/60 bg-slate-900/95 ring-1 ring-orange-500/20'
            : stage === 'READY'
            ? 'border-emerald-500/50 bg-slate-900/95 ring-1 ring-emerald-500/20'
            : stage === 'PREP'
            ? 'border-amber-500/50 bg-slate-900/95'
            : 'border-slate-800 bg-slate-900/90'
        }`}
      >
        {/* Topo do Card de Comanda */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-black tracking-tight text-white">
              #{order.orderNumber}
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                order.type === 'DELIVERY'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}
            >
              {order.type === 'DELIVERY' ? <Bike className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
              <span>{order.type === 'DELIVERY' ? 'Delivery' : 'Balcão'}</span>
            </span>
          </div>

          {/* Badge de Tempo com Indicador de Alerta */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold ${alert.badge}`}
            title={`Tempo decorrido: ${elapsed} minutos (${alert.label})`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${alert.dot}`}></span>
            <Timer className="w-3.5 h-3.5" />
            <span>{elapsed}m</span>
          </div>
        </div>

        {/* Identificação do Cliente e Horário */}
        <div className="px-3.5 py-2 bg-slate-950/40 border-b border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300 truncate max-w-[170px]">
            {order.customerName}
          </span>
          <span className="font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {order.createdAt}
          </span>
        </div>

        {/* Corpo da Comanda: Itens com Checklist Interativo */}
        <div className="p-3.5 space-y-2.5 flex-1 overflow-y-auto max-h-80">
          {order.items.map((item, idx) => {
            const checkKey = `${order.id}-${idx}`;
            const isChecked = !!checkedItems[checkKey];

            return (
              <div
                key={idx}
                onClick={() => toggleItemCheck(checkKey)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-40'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0 text-slate-400">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    {/* Título do Item e Quantidade */}
                    <div className="flex items-baseline gap-1.5 text-xs font-bold text-white leading-snug">
                      <span className="font-mono text-amber-400 font-extrabold text-sm">{item.quantity}x</span>
                      <span className={isChecked ? 'line-through text-slate-400' : ''}>
                        {item.title}
                      </span>
                    </div>

                    {/* Divisão dos Sabores (quando pizza dividida) */}
                    {item.flavors && item.flavors.length > 1 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.flavors.map((flavor, fIdx) => (
                          <span
                            key={fIdx}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            1/{item.flavors?.length} {flavor}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Borda Recheada em Destaque Refinado */}
                    {item.crustName && item.crustName !== 'Tradicional (Sem recheio na borda)' && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded mt-0.5">
                        <span>🧀</span>
                        <span>{item.crustName}</span>
                      </div>
                    )}

                    {/* Alerta de Restrições e Remoções (SEM CEBOLA / ALERGIAS) */}
                    {item.removals && item.removals.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-rose-300 bg-rose-950/80 border border-rose-800 px-2 py-1 rounded mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>ATENÇÃO: SEM {item.removals.join(', ').toUpperCase()}</span>
                      </div>
                    )}

                    {/* Observações da Cozinha */}
                    {item.notes && (
                      <div className="text-[11px] text-yellow-300/90 bg-yellow-500/10 border border-yellow-500/20 p-1.5 rounded italic mt-1">
                        Obs: "{item.notes}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé da Comanda: Botões Contextuais de Avanço */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {stage !== 'QUEUE' && (
            <button
              onClick={() => handleRollback(order.id, stage as any)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Voltar etapa anterior"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex-1">
            {stage === 'QUEUE' && (
              <button
                onClick={() => handleStartPrep(order.id)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <ChefHat className="w-4 h-4" />
                <span>Puxar p/ Montagem</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            )}

            {stage === 'PREP' && (
              <button
                onClick={() => handleSendToOven(order.id)}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>Colocar no Forno a Lenha</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            )}

            {stage === 'OVEN' && (
              <button
                onClick={() => handleFinishFromOven(order.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Retirar do Forno & Embalar</span>
              </button>
            )}

            {stage === 'READY' && (
              <button
                onClick={() => handleDispatch(order.id)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Despachar / Entrega</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Definição das Colunas Kanban
  const kanbanColumns = [
    {
      id: 'QUEUE',
      stage: 'QUEUE' as const,
      title: '1. Fila de Espera',
      subtitle: 'Aguardando bancada',
      orders: queueOrders,
      headerBg: 'bg-slate-900 border-amber-500/40',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'PREP',
      stage: 'PREP' as const,
      title: '2. Mesa de Montagem',
      subtitle: 'Massa aberta & recheio',
      orders: prepOrders,
      headerBg: 'bg-slate-900 border-orange-500/40',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      icon: <ChefHat className="w-4 h-4 text-orange-400" />,
    },
    {
      id: 'OVEN',
      stage: 'OVEN' as const,
      title: '3. Forno a Lenha',
      subtitle: 'Assando no fogo a 450°C',
      orders: ovenOrders,
      headerBg: 'bg-slate-900 border-red-500/40',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: <Flame className="w-4 h-4 text-rose-400 animate-pulse" />,
    },
    {
      id: 'READY',
      stage: 'READY' as const,
      title: '4. Pronto p/ Expedição',
      subtitle: 'Embalado na caixa térmica',
      orders: readyOrders,
      headerBg: 'bg-slate-900 border-emerald-500/40',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Barra de Ferramentas Superior do KDS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
            <ChefHat className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                Monitor de Cozinha KDS (Kanban de Produção)
              </h1>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                {activeTenant.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Fila automatizada dividida por postos de trabalho com controle de tempo e forno a lenha.
            </p>
          </div>
        </div>

        {/* Controles: Busca, Alternador Kanban/Grid e Som */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Busca Rápida de Comanda */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar comanda # ou cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Seletor de Modo de Exibição */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'KANBAN'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Colunas Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid Geral</span>
            </button>
          </div>

          {/* Toggle de Alerta Sonoro */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Alerta sonoro ativo' : 'Alerta sonoro desativado'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Exibição em Colunas Kanban Verticais */}
      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map(col => (
            <div
              key={col.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-3 min-h-[550px]"
            >
              {/* Cabeçalho da Coluna Kanban */}
              <div className={`p-3 rounded-xl border ${col.headerBg} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  {col.icon}
                  <div>
                    <h2 className="font-extrabold text-xs text-white leading-tight">{col.title}</h2>
                    <span className="text-[10px] text-slate-400">{col.subtitle}</span>
                  </div>
                </div>

                <span
                  className={`text-xs font-mono font-black px-2 py-0.5 rounded-full border tabular-nums ${col.badgeColor}`}
                >
                  {col.orders.length}
                </span>
              </div>

              {/* Lista de Comandas na Coluna */}
              <div className="space-y-3 flex-1">
                {col.orders.length === 0 ? (
                  <div className="py-12 text-center text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
                    <p className="text-xs font-medium">Nenhuma comanda</p>
                  </div>
                ) : (
                  col.orders.map(order => renderKdsCard(order, col.stage))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Exibição em Grid Geral */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500">
              <ChefHat className="w-12 h-12 mx-auto mb-2 text-slate-700" />
              <p className="font-bold text-sm">Nenhum pedido encontrado na cozinha</p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const stage =
                order.status === 'READY_FOR_DELIVERY'
                  ? 'READY'
                  : order.status === 'PREPARING' && inOvenOrderIds.has(order.id)
                  ? 'OVEN'
                  : order.status === 'PREPARING'
                  ? 'PREP'
                  : 'QUEUE';
              return renderKdsCard(order, stage);
            })
          )}
        </div>
      )}
    </div>
  );
};
