import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Bike,
  Navigation,
  MapPin,
  Phone,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Battery,
  Wifi,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export const DriverAppView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    currentUser,
    activeTenant,
    updateDriverPosition,
  } = useApp();

  // Entregas ativas atribuídas ao entregador (ou todas as prontas/em rota se for admin testando)
  const myDeliveries = orders.filter(o =>
    ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  const completedToday = orders.filter(o =>
    o.status === 'DELIVERED' && o.type === 'DELIVERY'
  );

  const handleStartRoute = (orderId: string) => {
    updateOrderStatus(orderId, 'OUT_FOR_DELIVERY');
  };

  const handleFinishDelivery = (orderId: string) => {
    updateOrderStatus(orderId, 'DELIVERED');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-100 pb-16">
      {/* Header do App do Motoboy */}
      <div className="bg-slate-900 text-white p-5 rounded-b-3xl shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">Marcos Motoboy</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                GPS Ativo • Conectado à central
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              92%
            </span>
          </div>
        </div>

        {/* Resumo de Ganhos / Taxas do Motoboy */}
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Entregas Concluídas Hoje</span>
            <div className="text-base font-black text-white">{completedToday.length} corridas</div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-medium">Diária Acumulada</span>
            <div className="text-base font-black font-mono text-amber-400">
              R$ {(completedToday.length * 7.50).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Corridas em Aberto */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">
            Suas Entregas ({myDeliveries.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">{activeTenant.name}</span>
        </div>

        {myDeliveries.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
            <Bike className="w-12 h-12 mx-auto stroke-[1.5] text-slate-300" />
            <p className="font-bold text-sm text-slate-700">Sem corridas no momento</p>
            <p className="text-xs">Aguarde a cozinha finalizar novos pedidos para entrega.</p>
          </div>
        ) : (
          myDeliveries.map(order => {
            const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4"
              >
                {/* Header da Corrida */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono font-black text-base text-slate-900">
                      Pedido #{order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      Total: R$ {order.total.toFixed(2)} ({order.paymentMethod})
                    </span>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                    isOutForDelivery ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isOutForDelivery ? 'Em Trânsito' : 'Aguardando Saída'}
                  </span>
                </div>

                {/* Dados do Cliente e Endereço */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">
                        {order.customerAddress.street}, {order.customerAddress.number}
                      </div>
                      <div className="text-slate-500">
                        {order.customerAddress.neighborhood}
                        {order.customerAddress.complement && ` · ${order.customerAddress.complement}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 pt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.customerName} · {order.customerPhone}</span>
                  </div>
                </div>

                {/* Atalho para Google Maps / Waze Externo */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${order.customerAddress.street}, ${order.customerAddress.number}, ${order.customerAddress.neighborhood}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200"
                >
                  <Navigation className="w-3.5 h-3.5 text-slate-600" />
                  Abrir no Google Maps / Waze
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                {/* Botões de Ação do Entregador */}
                {!isOutForDelivery ? (
                  <button
                    onClick={() => handleStartRoute(order.id)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Bike className="w-4 h-4" />
                    Iniciar Rota de Entrega (Ativar GPS)
                  </button>
                ) : (
                  <button
                    onClick={() => handleFinishDelivery(order.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirmar Entrega Realizada com Sucesso
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
