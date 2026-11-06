import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Order, OrderStatus } from '../../types/index.ts';
import {
  UtensilsCrossed,
  Plus,
  Printer,
  CheckCircle,
  Clock,
  Bike,
  XCircle,
  Search,
  Filter,
  DollarSign,
  User,
  Phone,
  MapPin,
  X,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const OrdersAdminView: React.FC = () => {
  const {
    activeTenant,
    orders,
    updateOrderStatus,
    assignDriver,
    users,
    createOrder,
    flavors,
    sizes,
    crusts,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Modal Novo Pedido Balcão (PDV)
  const [isNewPOSOpen, setIsNewPOSOpen] = useState(false);
  const [posCustomerName, setPosCustomerName] = useState('Cliente Balcão');
  const [posCustomerPhone, setPosCustomerPhone] = useState('(11) 90000-0000');
  const [posSizeId, setPosSizeId] = useState(sizes[2]?.id || 'size-grande');
  const [posFlavorId, setPosFlavorId] = useState(flavors[0]?.id || 'flavor-calabresa');
  const [posCrustId, setPosCrustId] = useState(crusts[0]?.id || 'crust-nenhuma');
  const [posNotes, setPosNotes] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH'>('PIX');

  // Filtra pedidos do tenant ativo
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderNumber.toString().includes(searchTerm) ||
      o.customerPhone.includes(searchTerm);

    if (!matchesSearch) return false;

    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'ACTIVE') return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(o.status);
    return o.status === selectedFilter;
  });

  const drivers = users.filter(u => u.tenantId === activeTenant.id && u.role === 'DRIVER');

  // Métricas do turno
  const todayTotalRevenue = orders.reduce((acc, o) => (o.status !== 'CANCELLED' ? acc + o.total : acc), 0);
  const activeOrdersCount = orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
  const pendingConfirmation = orders.filter(o => o.status === 'PENDING').length;

  const handleCreatePOSOrder = () => {
    const selectedSize = sizes.find(s => s.id === posSizeId) || sizes[0];
    const selectedFlavor = flavors.find(f => f.id === posFlavorId) || flavors[0];
    const selectedCrust = crusts.find(c => c.id === posCrustId) || crusts[0];

    const price = selectedSize.basePrice + selectedFlavor.additionalPrice + selectedCrust.price;

    createOrder({
      tenantId: activeTenant.id,
      customerName: posCustomerName,
      customerPhone: posCustomerPhone,
      customerAddress: {
        street: 'Retirada no Balcão',
        number: 'Loja',
        neighborhood: activeTenant.address.neighborhood,
        lat: activeTenant.address.lat,
        lng: activeTenant.address.lng,
      },
      type: 'TAKEOUT',
      status: 'CONFIRMED',
      items: [
        {
          id: `item-${Date.now()}`,
          type: 'PIZZA',
          title: `Pizza ${selectedSize.name} - ${selectedFlavor.name}`,
          sizeName: selectedSize.name,
          flavors: [selectedFlavor.name],
          crustName: selectedCrust.name,
          notes: posNotes || undefined,
          quantity: 1,
          unitPrice: price,
          totalPrice: price,
          cmvCost: Number((price * 0.32).toFixed(2)),
        }
      ],
      subtotal: price,
      deliveryFee: 0,
      discount: 0,
      total: price,
      cmvTotal: Number((price * 0.32).toFixed(2)),
      paymentMethod: posPaymentMethod,
      paymentStatus: 'PAID',
      estimatedDeliveryTime: new Date(Date.now() + 25 * 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });

    setIsNewPOSOpen(false);
    setPosNotes('');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Novo Pedido</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Confirmado</span>;
      case 'PREPARING':
        return <span className="bg-orange-100 text-orange-800 border border-orange-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Na Cozinha</span>;
      case 'READY_FOR_DELIVERY':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Aguardando Moto</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="bg-cyan-100 text-cyan-800 border border-cyan-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Em Rota de Entrega</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Entregue</span>;
      case 'CANCELLED':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">Cancelado</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner de Métricas Operacionais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Vendas do Turno</span>
          <span className="text-xl font-extrabold font-mono text-slate-900 mt-1 block">
            R$ {todayTotalRevenue.toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">Pedidos faturados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Pedidos em Aberto</span>
          <span className="text-xl font-extrabold font-mono text-amber-600 mt-1 block">
            {activeOrdersCount}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Em produção ou rota</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Aguardando Confirmação</span>
          <span className="text-xl font-extrabold font-mono text-rose-600 mt-1 block">
            {pendingConfirmation}
          </span>
          <span className="text-[11px] text-rose-600 font-medium">Atenção atendente</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Ponto de Venda</span>
            <span className="text-sm font-extrabold text-amber-400 block mt-0.5">Balcão / Telefone</span>
          </div>
          <button
            onClick={() => setIsNewPOSOpen(true)}
            className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Lançar Pedido Balcão
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Input de busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone ou número #..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Filtros de status em segmented tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'ACTIVE', label: 'Em Andamento' },
            { id: 'PENDING', label: 'Novos' },
            { id: 'PREPARING', label: 'Cozinha' },
            { id: 'OUT_FOR_DELIVERY', label: 'Em Rota' },
            { id: 'DELIVERED', label: 'Entregues' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className={`bg-white rounded-xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden ${
              order.status === 'PENDING'
                ? 'border-rose-400 ring-2 ring-rose-400/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Header do Card do Pedido */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-slate-900 text-base">
                  #{order.orderNumber}
                </span>
                <span className="text-xs text-slate-500">· {order.createdAt}</span>
              </div>
              {getStatusBadge(order.status)}
            </div>

            {/* Informações do Cliente */}
            <div className="p-4 space-y-3 flex-1 text-xs">
              <div>
                <div className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                  <span>{order.customerName}</span>
                  <span className="font-mono text-slate-900 font-black">
                    R$ {order.total.toFixed(2)}
                  </span>
                </div>
                <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.customerPhone}</span>
                </div>
                <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {order.customerAddress.street}, {order.customerAddress.number} ({order.customerAddress.neighborhood})
                  </span>
                </div>
              </div>

              {/* Lista dos Itens */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-2 rounded-lg text-slate-800">
                    <div className="font-bold">
                      {item.quantity}x {item.title}
                    </div>
                    {item.crustName && (
                      <div className="text-[11px] text-amber-700">{item.crustName}</div>
                    )}
                    {item.notes && (
                      <div className="text-[10px] text-rose-600 font-semibold italic">
                        Obs: {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Status do Entregador se estiver em entrega */}
              {order.status === 'OUT_FOR_DELIVERY' && (
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">{order.driverName}</span>
                      <span className="text-[10px] text-slate-500">Rastreamento GPS Ativo</span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2.5 py-1 rounded text-[11px]"
                  >
                    Marcar Entregue
                  </button>
                </div>
              )}
            </div>

            {/* Ações Operacionais */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setPrintOrder(order)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 bg-white"
                title="Imprimir Comanda 80mm"
              >
                <Printer className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 flex-1 justify-end">
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Confirmar Pedido
                  </button>
                )}

                {order.status === 'CONFIRMED' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs"
                  >
                    Enviar p/ Cozinha
                  </button>
                )}

                {order.status === 'PREPARING' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'READY_FOR_DELIVERY')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs"
                  >
                    Pronto na Cozinha
                  </button>
                )}

                {order.status === 'READY_FOR_DELIVERY' && (
                  <div className="flex items-center gap-1 w-full">
                    <select
                      onChange={e => {
                        if (e.target.value) assignDriver(order.id, e.target.value);
                      }}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800"
                    >
                      <option value="">Atribuir Entregador...</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {order.status === 'DELIVERED' && (
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Finalizado
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: NOVO PEDIDO BALCÃO (PDV RÁPIDO) */}
      {isNewPOSOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Lançamento de Pedido no Balcão (PDV)</h3>
              <button onClick={() => setIsNewPOSOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  value={posCustomerName}
                  onChange={e => setPosCustomerName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Telefone</label>
                <input
                  type="text"
                  value={posCustomerPhone}
                  onChange={e => setPosCustomerPhone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tamanho da Pizza</label>
              <select
                value={posSizeId}
                onChange={e => setPosSizeId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg font-medium"
              >
                {sizes.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - R$ {s.basePrice.toFixed(2)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Sabor da Pizza</label>
              <select
                value={posFlavorId}
                onChange={e => setPosFlavorId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg font-medium"
              >
                {flavors.map(f => (
                  <option key={f.id} value={f.id}>{f.name} (+ R$ {f.additionalPrice.toFixed(2)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Borda Recheada</label>
              <select
                value={posCrustId}
                onChange={e => setPosCrustId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg font-medium"
              >
                {crusts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (+ R$ {c.price.toFixed(2)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Forma de Pagamento</label>
              <div className="grid grid-cols-4 gap-2">
                {['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPosPaymentMethod(method as any)}
                    className={`py-2 px-1 border rounded-lg font-bold text-center ${
                      posPaymentMethod === method ? 'bg-slate-900 text-white' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {method === 'CREDIT_CARD' ? 'Crédito' : method === 'DEBIT_CARD' ? 'Débito' : method}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsNewPOSOpen(false)}
                className="px-4 py-2 border rounded-lg font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePOSOrder}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg shadow-sm"
              >
                Lançar Pedido Balcão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPRESSÃO TÉRMICA DE COMANDA 80MM */}
      {printOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 font-mono text-xs text-slate-900 space-y-3">
            <div className="text-center border-b border-dashed border-slate-400 pb-3">
              <div className="font-black text-sm uppercase">{activeTenant.name}</div>
              <div className="text-[10px] text-slate-600">{activeTenant.cnpj}</div>
              <div className="text-[10px] text-slate-600">{activeTenant.phone}</div>
              <div className="mt-2 text-base font-black">
                PEDIDO #{printOrder.orderNumber}
              </div>
              <div className="text-[10px] text-slate-500">
                Data: {printOrder.createdAt} | Tipo: {printOrder.type === 'DELIVERY' ? 'ENTREGA' : 'BALCÃO'}
              </div>
            </div>

            <div>
              <div className="font-bold text-[11px] mb-1">CLIENTE:</div>
              <div>{printOrder.customerName}</div>
              <div>Tel: {printOrder.customerPhone}</div>
              <div className="text-[11px] text-slate-700">
                Endereço: {printOrder.customerAddress.street}, {printOrder.customerAddress.number}
              </div>
            </div>

            <div className="border-t border-b border-dashed border-slate-400 py-2 space-y-1">
              <div className="font-bold text-[11px]">ITENS DO PEDIDO:</div>
              {printOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.quantity}x {it.title}</span>
                  <span>R$ {it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right">
              <div>Subtotal: R$ {printOrder.subtotal.toFixed(2)}</div>
              <div>Taxa Entrega: R$ {printOrder.deliveryFee.toFixed(2)}</div>
              <div className="font-black text-sm pt-1 border-t border-slate-200">
                TOTAL: R$ {printOrder.total.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-600">
                Pagamento: {printOrder.paymentMethod} ({printOrder.paymentStatus})
              </div>
            </div>

            <div className="text-center pt-3 border-t border-dashed border-slate-400 text-[10px] text-slate-500">
              *** AGRADECEMOS A PREFERÊNCIA ***
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => setPrintOrder(null)}
                className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg text-xs"
              >
                Fechar Comanda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
