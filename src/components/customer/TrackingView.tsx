import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Bike,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Navigation,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const TrackingView: React.FC = () => {
  const {
    activeTenant,
    orders,
    selectedTrackingToken,
    setSelectedTrackingToken,
    setCurrentView,
  } = useApp();

  // Encontra o pedido atual pelo token ou o mais recente ativo
  const currentOrder = orders.find(o => o.trackingToken === selectedTrackingToken) || orders[0];

  if (!currentOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="font-extrabold text-slate-800 text-lg">Nenhum pedido encontrado para rastreamento</h3>
        <p className="text-slate-500 text-sm mt-1">Faça um pedido no catálogo para acompanhar a entrega em tempo real.</p>
        <button
          onClick={() => setCurrentView('CUSTOMER_CATALOG')}
          className="mt-6 bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-slate-800"
        >
          Voltar ao Cardápio
        </button>
      </div>
    );
  }

  // Progresso das etapas do pedido
  const statusSteps = [
    { key: 'CONFIRMED', label: 'Confirmado', icon: '📝' },
    { key: 'PREPARING', label: 'No Forno', icon: '🔥' },
    { key: 'OUT_FOR_DELIVERY', label: 'Saiu p/ Entrega', icon: '🛵' },
    { key: 'DELIVERED', label: 'Entregue', icon: '✨' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
        return 0;
      case 'PREPARING':
      case 'READY_FOR_DELIVERY':
        return 1;
      case 'OUT_FOR_DELIVERY':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const activeStepIdx = getStepIndex(currentOrder.status);

  // Cálculo da posição no mapa SVG simulado
  // Origem: Pizzaria (x: 100, y: 120), Destino: Casa do Cliente (x: 480, y: 280)
  const originX = 90;
  const originY = 80;
  const destX = 510;
  const destY = 260;

  // Se o entregador estiver em trânsito, interpola a posição do motoboy no mapa SVG
  let driverX = originX;
  let driverY = originY;

  if (currentOrder.status === 'OUT_FOR_DELIVERY') {
    driverX = 310;
    driverY = 175;
  } else if (currentOrder.status === 'DELIVERED') {
    driverX = destX;
    driverY = destY;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Botão de Retorno e Seletor de Pedido */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentView('CUSTOMER_CATALOG')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Cardápio
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Outros pedidos:</span>
          <select
            value={currentOrder.trackingToken}
            onChange={e => setSelectedTrackingToken(e.target.value)}
            className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-semibold focus:outline-none"
          >
            {orders.map(o => (
              <option key={o.id} value={o.trackingToken}>
                #{o.orderNumber} - {o.customerName} ({o.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartão de Destaque do Rastreamento */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        {/* Header do Status */}
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                Pedido #{currentOrder.orderNumber}
              </span>
              <span className="text-xs text-slate-300">
                Criado às {currentOrder.createdAt}
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              {currentOrder.status === 'OUT_FOR_DELIVERY'
                ? '🛵 O entregador está a caminho da sua casa!'
                : currentOrder.status === 'DELIVERED'
                ? '✨ Seu pedido foi entregue com sucesso!'
                : currentOrder.status === 'PREPARING'
                ? '🔥 Sua pizza está assando no forno a lenha'
                : '📝 Pedido recebido e em fila de confirmação'}
            </h2>
          </div>

          <div className="text-right sm:border-l sm:border-slate-800 sm:pl-5">
            <span className="text-xs text-slate-400 block font-medium">Previsão de Chegada</span>
            <span className="text-2xl font-black font-mono text-amber-400">
              {currentOrder.estimatedDeliveryTime}
            </span>
          </div>
        </div>

        {/* Stepper de Etapas do Pedido */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-4 gap-2">
            {statusSteps.map((step, idx) => {
              const isPastOrCurrent = idx <= activeStepIdx;
              const isCurrent = idx === activeStepIdx;
              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm mb-1.5 transition-all ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 scale-105'
                        : isPastOrCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPastOrCurrent && !isCurrent ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      isCurrent ? 'text-slate-900' : isPastOrCurrent ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAPA INTERATIVO EM TEMPO REAL (Simulação de Google Maps Platform) */}
        <div className="relative bg-slate-950 h-80 sm:h-96 w-full overflow-hidden flex items-center justify-center">
          {/* Grid de ruas estilizadas (Estilo Noturno Google Maps) */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Ruas de fundo */}
            <path d="M 0 100 Q 200 120 600 80" stroke="#1e293b" strokeWidth="12" fill="none" />
            <path d="M 0 240 Q 300 200 600 290" stroke="#1e293b" strokeWidth="10" fill="none" />
            <path d="M 120 0 L 140 400" stroke="#1e293b" strokeWidth="8" fill="none" />
            <path d="M 320 0 L 300 400" stroke="#1e293b" strokeWidth="14" fill="none" />
            <path d="M 480 0 L 500 400" stroke="#1e293b" strokeWidth="8" fill="none" />

            {/* Rota do Pedido (Trajeto traçado) */}
            <path
              d={`M ${originX} ${originY} C 180 80, 240 180, ${destX} ${destY}`}
              stroke="url(#routeGradient)"
              strokeWidth="5"
              strokeDasharray="6 4"
              fill="none"
              filter="url(#glow)"
            />

            {/* Ponto 1: Pizzaria */}
            <g transform={`translate(${originX}, ${originY})`}>
              <circle r="18" fill="#ea580c" opacity="0.3" className="animate-ping" />
              <circle r="12" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#ffffff" fontWeight="bold">🍕</text>
              <rect x="-40" y="-30" width="80" height="18" rx="4" fill="#0f172a" opacity="0.85" />
              <text x="0" y="-18" textAnchor="middle" fontSize="9" fill="#ffffff" fontWeight="bold">Pizzaria</text>
            </g>

            {/* Ponto 2: Casa do Cliente */}
            <g transform={`translate(${destX}, ${destY})`}>
              <circle r="14" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#ffffff" fontWeight="bold">🏠</text>
              <rect x="-40" y="-30" width="80" height="18" rx="4" fill="#0f172a" opacity="0.85" />
              <text x="0" y="-18" textAnchor="middle" fontSize="9" fill="#ffffff" fontWeight="bold">Seu Endereço</text>
            </g>

            {/* Ponto 3: Entregador / Motoboy em movimento */}
            {currentOrder.status === 'OUT_FOR_DELIVERY' && (
              <g transform={`translate(${driverX}, ${driverY})`} className="transition-all duration-1000">
                <circle r="22" fill="#f59e0b" opacity="0.25" className="animate-pulse" />
                <circle r="15" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
                <text x="0" y="5" textAnchor="middle" fontSize="11" fill="#000000" fontWeight="bold">🛵</text>
                <rect x="-55" y="-36" width="110" height="22" rx="6" fill="#f59e0b" />
                <text x="0" y="-22" textAnchor="middle" fontSize="10" fill="#000000" fontWeight="900">
                  {currentOrder.driverLocation?.speedKmH || 34} km/h • Em rota
                </text>
              </g>
            )}
          </svg>

          {/* Badge flutuante do Google Maps Platform simulado */}
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg flex items-center gap-2 text-white text-xs shadow-md">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Google Maps Live GPS</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
              WebSockets 12ms
            </span>
          </div>

          {/* Card Flutuante com Dados do Entregador */}
          <div className="absolute bottom-3 inset-x-3 sm:inset-x-auto sm:left-3 sm:right-3 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-xl flex items-center justify-between text-xs text-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">
                  {currentOrder.driverName || 'Marcos Entregador (Moto 04)'}
                </div>
                <div className="text-slate-500 flex items-center gap-2">
                  <span>Honda CG 160 Fan</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Entregador Verificado
                  </span>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/5511987654321?text=Olá,%20gostaria%20de%20saber%20sobre%20meu%20pedido%20%23${currentOrder.orderNumber}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Detalhes do Pedido e Endereço */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white text-xs">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Itens do seu Pedido
            </h4>
            <div className="space-y-2">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-bold text-slate-800">{item.quantity}x {item.title}</span>
                    {item.crustName && (
                      <span className="block text-[11px] text-amber-700">{item.crustName}</span>
                    )}
                    {item.notes && (
                      <span className="block text-[10px] text-slate-500 italic">Obs: {item.notes}</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    R$ {item.totalPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 flex justify-between font-bold text-sm text-slate-900">
              <span>Total Pago ({currentOrder.paymentMethod}):</span>
              <span className="font-mono text-amber-600">R$ {currentOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Endereço de Destino
            </h4>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <div className="font-bold text-slate-900">
                {currentOrder.customerAddress.street}, {currentOrder.customerAddress.number}
              </div>
              <div className="text-slate-600">
                {currentOrder.customerAddress.neighborhood}
                {currentOrder.customerAddress.complement && ` - ${currentOrder.customerAddress.complement}`}
              </div>
              <div className="text-slate-500 pt-1 border-t border-slate-200/60 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Contato: {currentOrder.customerPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
