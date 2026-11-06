import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  PieChart,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Bike,
  ChefHat,
  Package,
  Award,
  Sparkles,
  Download,
  Filter,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { activeTenant, orders, stockItems, flavors, products, setCurrentView } = useApp();

  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');

  // Multiplicadores para simulação de períodos
  const periodMultiplier = period === 'TODAY' ? 1 : period === 'WEEK' ? 6.2 : 24.5;

  // Métricas do Turno
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  const activeOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(o.status));
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED');

  const baseSales = orders.reduce((acc, o) => o.status !== 'CANCELLED' ? acc + o.total : acc, 0);
  const totalSales = Number((baseSales * periodMultiplier).toFixed(2));
  const ordersCount = Math.round(orders.length * periodMultiplier);
  const averageTicket = ordersCount > 0 ? Number((totalSales / ordersCount).toFixed(2)) : 0;
  
  // CMV estimado (Custo da Mercadoria Vendida)
  const baseCMV = orders.reduce((acc, o) => o.status !== 'CANCELLED' ? acc + o.cmvTotal : acc, 0);
  const totalCMV = Number((baseCMV * periodMultiplier).toFixed(2));
  const cmvPercentage = totalSales > 0 ? Number(((totalCMV / totalSales) * 100).toFixed(1)) : 29.5;
  const grossProfit = Number((totalSales - totalCMV).toFixed(2));

  // Dados do Gráfico de Horários de Maior Movimento (18h às 23h)
  const hourlyData = [
    { hour: '18:00', orders: 2 * periodMultiplier, revenue: 160 * periodMultiplier },
    { hour: '19:00', orders: 5 * periodMultiplier, revenue: 420 * periodMultiplier },
    { hour: '20:00', orders: 9 * periodMultiplier, revenue: 780 * periodMultiplier }, // Pico clássico
    { hour: '21:00', orders: 7 * periodMultiplier, revenue: 590 * periodMultiplier },
    { hour: '22:00', orders: 4 * periodMultiplier, revenue: 340 * periodMultiplier },
    { hour: '23:00', orders: 1 * periodMultiplier, revenue: 95 * periodMultiplier },
  ];

  const maxHourOrders = Math.max(...hourlyData.map(h => h.orders), 1);

  // Sabores Mais Vendidos com dados estruturados e percentuais
  const topFlavors = [
    {
      name: 'Calabresa Artesanal Especial',
      category: 'Tradicional',
      units: Math.round(14 * periodMultiplier),
      revenue: Number((14 * 68.00 * periodMultiplier).toFixed(2)),
      share: 34,
      trend: '+12%',
    },
    {
      name: 'Quatro Queijos Selecionados',
      category: 'Especial',
      units: Math.round(11 * periodMultiplier),
      revenue: Number((11 * 76.00 * periodMultiplier).toFixed(2)),
      share: 26,
      trend: '+8%',
    },
    {
      name: 'Frango com Catupiry Original',
      category: 'Tradicional',
      units: Math.round(8 * periodMultiplier),
      revenue: Number((8 * 72.00 * periodMultiplier).toFixed(2)),
      share: 19,
      trend: '+4%',
    },
    {
      name: 'Margherita Napolitana D.O.C.',
      category: 'Tradicional',
      units: Math.round(5 * periodMultiplier),
      revenue: Number((5 * 70.00 * periodMultiplier).toFixed(2)),
      share: 12,
      trend: '-2%',
    },
    {
      name: 'Brigadeiro Belga c/ Morangos',
      category: 'Doce',
      units: Math.round(4 * periodMultiplier),
      revenue: Number((4 * 78.00 * periodMultiplier).toFixed(2)),
      share: 9,
      trend: '+15%',
    },
  ];

  const criticalStock = stockItems.filter(s => s.currentStock <= s.minStock);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header com Filtros de Período e Resumo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Dashboard Executivo & KPIs
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {activeTenant.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de vendas, ticket médio, horários de pico e lucratividade operacional em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Período */}
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl text-xs font-bold shadow-xs">
            <button
              onClick={() => setPeriod('TODAY')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'TODAY'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoje (Turno)
            </button>
            <button
              onClick={() => setPeriod('WEEK')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'WEEK'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 7 Dias
            </button>
            <button
              onClick={() => setPeriod('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'MONTH'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mês Atual
            </button>
          </div>
        </div>
      </div>

      {/* Grid Principal de 4 KPIs Executivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Faturamento Bruto
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
              R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+14.8%</span>
              <span className="text-slate-400 font-normal">vs período anterior</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Ticket Médio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ticket Médio / Pedido
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
              R$ {averageTicket.toFixed(2)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+6.2%</span>
              <span className="text-slate-400 font-normal">Meta: R$ 75,00</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Volume de Pedidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Volume de Pedidos
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
              {ordersCount}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
              <span className="text-emerald-600 font-bold">{Math.round(ordersCount * 0.92)} entregues</span>
              <span>·</span>
              <span className="text-amber-600 font-bold">{activeOrders.length} em rota/KDS</span>
            </div>
          </div>
        </div>

        {/* KPI 4: CMV (Custo da Mercadoria Vendida) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              CMV Real (Insumos)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
              {cmvPercentage}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
              <span className="text-emerald-700 font-bold">R$ {grossProfit.toFixed(2)}</span>
              <span className="text-slate-400">margem de contribuição</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Central: Horários de Maior Movimento + Canais de Venda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Vetorial de Horários de Pico */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Horários de Maior Movimento (Pico de Pedidos)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Pico registrado às <strong className="text-slate-900">20:00 - 21:00</strong>
            </span>
          </div>

          {/* Gráfico de Barras em SVG */}
          <div className="pt-2">
            <div className="h-48 flex items-end gap-3 sm:gap-6 px-2 justify-between">
              {hourlyData.map((d, idx) => {
                const heightPercent = Math.round((d.orders / maxHourOrders) * 100);
                const isPeak = d.hour === '20:00';

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.orders} ped
                    </span>
                    <div className="w-full max-w-[48px] bg-slate-100 h-36 rounded-xl overflow-hidden flex items-end p-0.5">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 ${
                          isPeak
                            ? 'bg-amber-500 shadow-md ring-2 ring-amber-500/20'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                        style={{ height: `${Math.max(12, heightPercent)}%` }}
                      ></div>
                    </div>
                    <span className={`text-[11px] font-bold ${isPeak ? 'text-amber-600' : 'text-slate-500'}`}>
                      {d.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Concentração de 68% dos pedidos entre 19:30 e 21:30</span>
            <span className="font-semibold text-slate-700">Equipe de cozinha dimensionada</span>
          </div>
        </div>

        {/* Canais de Venda e Modalidades */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-600" />
                Origem & Modalidades
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">100% dos canais</span>
            </div>

            <div className="space-y-4 mt-4">
              {/* Delivery */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-blue-600" />
                    Delivery em Domicílio
                  </span>
                  <span className="font-mono">78%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              {/* Retirada no Balcão */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                    Retirada no Balcão (Takeout)
                  </span>
                  <span className="font-mono">18%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>

              {/* Salão / Mesas */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                  <span className="flex items-center gap-1.5">
                    <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                    Salão & Consumo Local
                  </span>
                  <span className="font-mono">4%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: '4%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1 text-xs">
            <span className="font-bold text-slate-900 block">Tempo Médio de Despacho:</span>
            <div className="flex items-center justify-between text-slate-600">
              <span>Preparo na Cozinha:</span>
              <span className="font-mono font-bold text-slate-900">28 min</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Deslocamento Motoboy:</span>
              <span className="font-mono font-bold text-slate-900">18 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Sabores Mais Vendidos + Insumos em Alerta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Sabores de Pizza Mais Vendidos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Ranking dos Sabores Mais Vendidos
            </h3>
            <span className="text-xs text-slate-500 font-medium">Por faturamento e unidades</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-3">Pos.</th>
                  <th className="p-3">Sabor da Pizza</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3 text-right">Qtd. Vendida</th>
                  <th className="p-3 text-right">Faturamento</th>
                  <th className="p-3 text-right">% Vendas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topFlavors.map((flavor, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {flavor.name}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {flavor.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-slate-900">
                      {flavor.units} pizzas
                    </td>
                    <td className="p-3 text-right font-mono font-black text-slate-900">
                      R$ {flavor.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        {flavor.share}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card Lateral: Resumo de Alertas & Atalhos Operacionais */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              Estoque Crítico do Turno
            </h3>
            <span className="text-xs text-rose-600 font-bold font-mono">
              {criticalStock.length} alertas
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {criticalStock.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-rose-950 truncate max-w-[170px]">{item.name}</div>
                  <div className="text-[10px] text-rose-700">Mínimo: {item.minStock} {item.unit}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-rose-800 text-xs block">
                    {item.currentStock} {item.unit}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-rose-600">Repor</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setCurrentView('STOCK_MANAGER')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center block"
            >
              Gerenciar Estoque Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
