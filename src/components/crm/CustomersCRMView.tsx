import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Customer } from '../../types/index.ts';
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  Gift,
  Award,
  DollarSign,
  Clock,
  MapPin,
  ExternalLink,
  Receipt,
  X,
  Phone,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const CustomersCRMView: React.FC = () => {
  const {
    activeTenant,
    customers,
    addCustomer,
    updateCustomerPoints,
    orders,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState<'ALL' | 'VIP' | 'RECURRENT' | 'NEW'>('ALL');
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);

  // Modal para cadastrar novo cliente
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      address: {
        street: newStreet.trim() || 'Rua não informada',
        number: newNumber.trim() || 'S/N',
        neighborhood: newNeighborhood.trim() || activeTenant.address.neighborhood,
      },
      notes: newNotes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewStreet('');
    setNewNumber('');
    setNewNeighborhood('');
    setNewNotes('');
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.address.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());

    const isVip = c.totalSpent >= 400;
    const isRecurrent = c.totalOrders >= 4;
    const isNew = c.totalOrders <= 1;

    if (filterSegment === 'VIP') return matchesSearch && isVip;
    if (filterSegment === 'RECURRENT') return matchesSearch && isRecurrent;
    if (filterSegment === 'NEW') return matchesSearch && isNew;
    return matchesSearch;
  });

  // Métricas do CRM
  const totalLtv = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgLtv = customers.length > 0 ? totalLtv / customers.length : 0;
  const vipCount = customers.filter(c => c.totalSpent >= 400).length;
  const totalLoyaltyPoints = customers.reduce((acc, c) => acc + c.loyaltyPoints, 0);

  // Pedidos do cliente selecionado no histórico
  const customerOrders = selectedCustomerForHistory
    ? orders.filter(o => o.customerPhone === selectedCustomerForHistory.phone || o.customerName.toLowerCase() === selectedCustomerForHistory.name.toLowerCase())
    : [];

  const handleOpenWhatsApp = (customer: Customer) => {
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá, ${customer.name}! 🍕 Aqui é da *${activeTenant.name}*.\nVocê possui *${customer.loyaltyPoints} pontos* de fidelidade acumulados no nosso clube! Com 10 pontos você ganha uma Pizza Média grátis. Deseja pedir sua pizza favorita hoje?`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Topo do CRM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>👥</span> CRM, Clientes & Clube de Fidelidade
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Acompanhe o valor de vida (LTV), histórico de pedidos, pontuação de fidelidade e contato direto via WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Cards de Métricas do CRM */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-bold">Total de Clientes</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {customers.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Na base da pizzaria</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-bold">Clientes VIP (LTV &gt; R$400)</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono">
            {vipCount}
          </div>
          <span className="text-[11px] text-purple-700 font-semibold mt-1 block">Maior frequência de compra</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-bold">LTV Médio por Cliente</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
            R$ {avgLtv.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Gasto acumulado por pessoa</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-bold">Pontos Fidelidade Ativos</span>
            <Gift className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {totalLoyaltyPoints} pts
          </div>
          <span className="text-[11px] text-rose-700 font-semibold mt-1 block">10 pts = 1 pizza grátis</span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: `Todos (${customers.length})` },
            { id: 'VIP', label: `Clientes VIP (${vipCount})` },
            { id: 'RECURRENT', label: 'Recorrentes (4+ pedidos)' },
            { id: 'NEW', label: 'Novos Clientes' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterSegment(f.id as typeof filterSegment)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterSegment === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou bairro..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Telefone WhatsApp</th>
                <th className="py-3.5 px-4">Bairro / Região</th>
                <th className="py-3.5 px-4 text-center">Pedidos</th>
                <th className="py-3.5 px-4 text-right">LTV (Total Gasto)</th>
                <th className="py-3.5 px-4">Clube de Fidelidade</th>
                <th className="py-3.5 px-4 text-center">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(customer => {
                const pointsProgress = Math.min(100, (customer.loyaltyPoints % 10) * 10);
                const hasFreePizza = customer.loyaltyPoints >= 10;

                return (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nome & Email */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 font-bold flex items-center justify-center text-xs">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block leading-tight">
                            {customer.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {customer.email || 'Sem e-mail'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Telefone */}
                    <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                      {customer.phone}
                    </td>

                    {/* Bairro */}
                    <td className="py-3 px-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {customer.address.neighborhood}
                      </span>
                    </td>

                    {/* Total de Pedidos */}
                    <td className="py-3 px-4 text-center font-bold text-slate-800 tabular-nums">
                      {customer.totalOrders}
                    </td>

                    {/* LTV */}
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 tabular-nums">
                      R$ {customer.totalSpent.toFixed(2)}
                    </td>

                    {/* Fidelidade com barra de progresso */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-black text-rose-600 flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            {customer.loyaltyPoints} pts
                          </span>
                          {hasFreePizza && (
                            <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full animate-pulse">
                              Pizza Grátis Disponível!
                            </span>
                          )}
                        </div>
                        <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full transition-all"
                            style={{ width: `${pointsProgress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenWhatsApp(customer)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Chamar no WhatsApp com mensagem de fidelidade"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => setSelectedCustomerForHistory(customer)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Ver histórico de compras do cliente"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Pedidos</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Histórico de Pedidos do Cliente */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Histórico de Pedidos</h3>
                <p className="text-xs text-slate-400">
                  {selectedCustomerForHistory.name} · {selectedCustomerForHistory.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Resumo do Cliente */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Gasto (LTV)</span>
                  <span className="font-mono font-black text-slate-900">
                    R$ {selectedCustomerForHistory.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Pontos Fidelidade</span>
                  <span className="font-black text-rose-600">
                    {selectedCustomerForHistory.loyaltyPoints} pts
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Ações de Ponto</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <button
                      onClick={() => updateCustomerPoints(selectedCustomerForHistory.id, 1)}
                      className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[10px] font-bold"
                      title="+1 ponto"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => updateCustomerPoints(selectedCustomerForHistory.id, -1)}
                      className="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[10px] font-bold"
                      title="-1 ponto"
                    >
                      -1
                    </button>
                  </div>
                </div>
              </div>

              {selectedCustomerForHistory.notes && (
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <strong>Preferência registrada:</strong> {selectedCustomerForHistory.notes}
                </div>
              )}

              {/* Lista de Pedidos */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-900 block">
                  Últimos Pedidos Realizados ({customerOrders.length})
                </span>

                {customerOrders.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 border border-dashed rounded-xl">
                    Nenhum pedido recente registrado para este número.
                  </div>
                ) : (
                  customerOrders.map(order => (
                    <div key={order.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">Pedido #{order.orderNumber}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{order.createdAt}</span>
                      </div>
                      <div className="text-slate-600 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.quantity}x {item.title}</span>
                            <span className="font-mono text-slate-800">R$ {item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-slate-900">
                        <span>Total Pago ({order.paymentMethod}):</span>
                        <span className="text-amber-600 font-mono">R$ {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Novo Cliente */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">👥</span>
                <div>
                  <h3 className="font-extrabold text-base">Novo Cliente</h3>
                  <p className="text-xs text-slate-400">Adicione um cliente à base da pizzaria</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Beatriz Albuquerque"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp / Telefone:</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">E-mail (opcional):</label>
                  <input
                    type="email"
                    placeholder="cliente@email.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Rua / Logradouro:</label>
                  <input
                    type="text"
                    placeholder="Ex: Rua Oscar Freire"
                    value={newStreet}
                    onChange={e => setNewStreet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Número:</label>
                  <input
                    type="text"
                    placeholder="120"
                    value={newNumber}
                    onChange={e => setNewNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bairro:</label>
                <input
                  type="text"
                  placeholder="Ex: Jardins"
                  value={newNeighborhood}
                  onChange={e => setNewNeighborhood(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observações / Preferências:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Sem cebola, massa crocante, prefere borda Catupiry..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl cursor-pointer shadow-xs"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
