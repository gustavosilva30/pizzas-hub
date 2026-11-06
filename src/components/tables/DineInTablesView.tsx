import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { DineInTable, TableStatus, OrderItem } from '../../types/index.ts';
import {
  Users,
  Clock,
  Plus,
  CheckCircle2,
  Receipt,
  Utensils,
  CreditCard,
  X,
  Search,
  Filter,
  Flame,
  UserCheck,
  Percent,
  QrCode,
  Printer,
} from 'lucide-react';

export const DineInTablesView: React.FC = () => {
  const {
    activeTenant,
    tables,
    updateTableStatus,
    addTableOrder,
    closeTableComanda,
    orders,
    products,
    flavors,
    sizes,
    currentUser,
  } = useApp();

  const [selectedTable, setSelectedTable] = useState<DineInTable | null>(null);
  const [qrCodeTable, setQrCodeTable] = useState<DineInTable | null>(null);
  const [filterStatus, setFilterStatus] = useState<TableStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados do Modal da Comanda
  const [guestName, setGuestName] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState('');
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [selectedFlavorToAdd, setSelectedFlavorToAdd] = useState('');
  const [newItems, setNewItems] = useState<OrderItem[]>([]);
  const [splitPeople, setSplitPeople] = useState(2);
  const [includeServiceFee, setIncludeServiceFee] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH'>('CREDIT_CARD');

  const openTableModal = (table: DineInTable) => {
    setSelectedTable(table);
    setGuestName(table.customerName || '');
    setGuestCount(table.guestsCount || 2);
    setNotes(table.notes || '');
    setNewItems([]);
    setSplitPeople(table.guestsCount || 2);
    setIncludeServiceFee(false);
  };

  const closeTableModal = () => {
    setSelectedTable(null);
  };

  // Pedido vinculado à mesa atualmente
  const linkedOrder = selectedTable?.orderId
    ? orders.find(o => o.id === selectedTable.orderId)
    : null;

  const allItems = [...(linkedOrder?.items || []), ...newItems];
  const itemsSubtotal = allItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const serviceFee = includeServiceFee ? itemsSubtotal * 0.10 : 0;
  const currentTotal = itemsSubtotal + serviceFee;
  const perPerson = splitPeople > 0 ? currentTotal / splitPeople : currentTotal;

  const handleAddItem = (type: 'PIZZA' | 'BEVERAGE') => {
    if (type === 'BEVERAGE' && selectedProductToAdd) {
      const prod = products.find(p => p.id === selectedProductToAdd);
      if (!prod) return;
      const item: OrderItem = {
        id: `item-${Date.now()}`,
        type: 'SIMPLE',
        title: prod.name,
        quantity: 1,
        unitPrice: prod.price,
        totalPrice: prod.price,
        cmvCost: prod.price * 0.45,
      };
      setNewItems(prev => [...prev, item]);
      setSelectedProductToAdd('');
    } else if (type === 'PIZZA' && selectedFlavorToAdd) {
      const flv = flavors.find(f => f.id === selectedFlavorToAdd);
      const grandeSize = sizes.find(s => s.name.includes('Grande')) || sizes[0];
      if (!flv) return;
      const price = (grandeSize?.basePrice || 68) + flv.additionalPrice;
      const item: OrderItem = {
        id: `item-${Date.now()}`,
        type: 'PIZZA',
        title: `Pizza Grande (8 fatias) - ${flv.name}`,
        sizeName: grandeSize?.name || 'Grande (8 fatias)',
        flavors: [flv.name],
        quantity: 1,
        unitPrice: price,
        totalPrice: price,
        cmvCost: price * 0.32,
      };
      setNewItems(prev => [...prev, item]);
      setSelectedFlavorToAdd('');
    }
  };

  const handleRemoveNewItem = (index: number) => {
    setNewItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendToKitchen = () => {
    if (!selectedTable) return;
    if (newItems.length === 0) return;

    addTableOrder(selectedTable.id, newItems, currentUser.name);
    setNewItems([]);
    closeTableModal();
  };

  const handleCloseBill = () => {
    if (!selectedTable) return;
    closeTableComanda(selectedTable.id, paymentMethod, currentTotal);
    closeTableModal();
  };

  const handleSaveTableInfo = () => {
    if (!selectedTable) return;
    updateTableStatus(
      selectedTable.id,
      selectedTable.status === 'AVAILABLE' ? 'OCCUPIED' : selectedTable.status,
      guestName,
      guestCount,
      currentUser.name
    );
    closeTableModal();
  };

  const filteredTables = tables.filter(t => {
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const countAvailable = tables.filter(t => t.status === 'AVAILABLE').length;
  const countOccupied = tables.filter(t => t.status === 'OCCUPIED').length;
  const countBillRequested = tables.filter(t => t.status === 'BILL_REQUESTED').length;
  const countReserved = tables.filter(t => t.status === 'RESERVED').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Topo: Título & KPIs do Salão */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>🍽️</span> Mesas & Comandas (Salão Presencial)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Controle de atendimento em tempo real, pedidos de salão para o KDS e divisão rápida de conta.
          </p>
        </div>

        {/* Resumo Rápido */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{countAvailable} Livres</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>{countOccupied} Ocupadas</span>
          </div>
          <div className="bg-purple-50 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>{countBillRequested} Pediu Conta</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Todas as Mesas' },
            { id: 'AVAILABLE', label: `Livres (${countAvailable})` },
            { id: 'OCCUPIED', label: `Ocupadas (${countOccupied})` },
            { id: 'BILL_REQUESTED', label: `Conta (${countBillRequested})` },
            { id: 'RESERVED', label: `Reservadas (${countReserved})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id as TableStatus | 'ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar mesa ou cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTables.map(table => {
          const tableOrder = table.orderId ? orders.find(o => o.id === table.orderId) : null;
          const isOccupied = table.status === 'OCCUPIED';
          const isBill = table.status === 'BILL_REQUESTED';
          const isReserved = table.status === 'RESERVED';
          const isFree = table.status === 'AVAILABLE';

          return (
            <div
              key={table.id}
              onClick={() => openTableModal(table)}
              className={`relative bg-white rounded-2xl border transition-all cursor-pointer p-4 hover:shadow-md flex flex-col justify-between min-h-[190px] ${
                isBill
                  ? 'border-purple-300 ring-2 ring-purple-100 bg-purple-50/20'
                  : isOccupied
                  ? 'border-amber-300 shadow-xs'
                  : isReserved
                  ? 'border-blue-200 bg-blue-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Topo do Card: Número e Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                      #{table.number}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      {table.name.split('-')[1]?.trim() || table.name}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isFree
                        ? 'bg-emerald-100 text-emerald-800'
                        : isOccupied
                        ? 'bg-amber-100 text-amber-800'
                        : isBill
                        ? 'bg-purple-100 text-purple-800 animate-pulse'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isFree ? 'Livre' : isOccupied ? 'Ocupada' : isBill ? 'Pediu Conta' : 'Reservada'}
                  </span>
                </div>

                {/* Detalhes do Cliente e Garçom */}
                {table.customerName ? (
                  <div className="space-y-1 mb-3">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {table.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {table.guestsCount || 2} pessoas
                      </span>
                      {table.openedAt && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {table.openedAt}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-2 italic flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Capacidade: {table.capacity} lugares
                  </div>
                )}
              </div>

              {/* Rodapé do Card: Valor da Comanda ou Ação */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {tableOrder ? (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Consumo Atual</span>
                    <span className="text-sm font-black text-amber-600 font-mono tabular-nums">
                      R$ {tableOrder.total.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-500">
                    {isFree ? 'Clique p/ abrir mesa' : 'Sem consumo ativo'}
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setQrCodeTable(table);
                    }}
                    title="Imprimir Placa QR Code da Mesa"
                    className="p-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openTableModal(table);
                    }}
                    className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    {isFree ? 'Abrir' : 'Comanda'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal da Comanda & Fechamento de Mesa */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            {/* Topo do Modal */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center">
                  #{selectedTable.number}
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    Comanda - {selectedTable.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Atendente responsável: {currentUser.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQrCodeTable(selectedTable)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Placa QR Code
                </button>
                <button
                  onClick={closeTableModal}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Dados Básicos da Mesa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Identificação / Nome do Cliente:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Família Oliveira"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Quantidade de Pessoas:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={guestCount}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setGuestCount(v);
                      setSplitPeople(v);
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Status Rápido da Mesa */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Alterar Status:</span>
                {(['AVAILABLE', 'OCCUPIED', 'BILL_REQUESTED', 'RESERVED'] as TableStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => updateTableStatus(selectedTable.id, st, guestName, guestCount, currentUser.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTable.status === st
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'AVAILABLE' ? 'Livre' : st === 'OCCUPIED' ? 'Ocupada' : st === 'BILL_REQUESTED' ? 'Conta' : 'Reservada'}
                  </button>
                ))}
              </div>

              {/* Lançamento Rápido de Itens na Mesa */}
              <div className="border border-slate-200 p-4 rounded-2xl bg-amber-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-600" />
                    Lançar Itens na Mesa (Direto para Cozinha)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pizza Rápida */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedFlavorToAdd}
                      onChange={e => setSelectedFlavorToAdd(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-1.5 text-slate-800"
                    >
                      <option value="">Selecione uma Pizza...</option>
                      {flavors.filter(f => f.isAvailable).map(f => (
                        <option key={f.id} value={f.id}>
                          Pizza Grande - {f.name} (+R$ {f.additionalPrice.toFixed(2)})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAddItem('PIZZA')}
                      disabled={!selectedFlavorToAdd}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0"
                    >
                      + Pizza
                    </button>
                  </div>

                  {/* Bebida Rápida */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedProductToAdd}
                      onChange={e => setSelectedProductToAdd(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-1.5 text-slate-800"
                    >
                      <option value="">Selecione Bebida/Entrada...</option>
                      {products.filter(p => p.isAvailable).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (R$ {p.price.toFixed(2)})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAddItem('BEVERAGE')}
                      disabled={!selectedProductToAdd}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0"
                    >
                      + Bebida
                    </button>
                  </div>
                </div>
              </div>

              {/* Itens já lançados ou novos */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                  <span>Itens Consumidos na Mesa ({allItems.length})</span>
                  <span className="text-slate-400 font-normal">Subtotal: R$ {itemsSubtotal.toFixed(2)}</span>
                </div>

                {allItems.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    Nenhum item lançado nesta mesa ainda.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {allItems.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                            {item.quantity}x
                          </span>
                          <div>
                            <span className="font-bold text-slate-800">{item.title}</span>
                            {item.notes && <span className="text-[10px] text-amber-700 block italic">{item.notes}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900 tabular-nums">
                            R$ {item.totalPrice.toFixed(2)}
                          </span>
                          {idx >= (linkedOrder?.items.length || 0) && (
                            <button
                              onClick={() => handleRemoveNewItem(idx - (linkedOrder?.items.length || 0))}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              title="Remover item não enviado"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divisão de Conta & Calculadora */}
              {allItems.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-amber-400" />
                      Calculadora de Fechamento de Conta
                    </span>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeServiceFee}
                        onChange={e => setIncludeServiceFee(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-0"
                      />
                      <span>10% de Serviço</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Subtotal</span>
                      <span className="font-mono font-bold text-slate-200">R$ {itemsSubtotal.toFixed(2)}</span>
                    </div>
                    {includeServiceFee && (
                      <div>
                        <span className="text-[10px] text-slate-400 block">Taxa Garçom (10%)</span>
                        <span className="font-mono font-bold text-amber-400">+ R$ {serviceFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold text-amber-300">Total a Pagar</span>
                      <span className="font-mono font-black text-base text-amber-400">
                        R$ {currentTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Divisão por pessoas */}
                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Dividir conta entre:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <button
                            key={num}
                            onClick={() => setSplitPeople(num)}
                            className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${
                              splitPeople === num
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Por pessoa: </span>
                      <span className="text-xs font-mono font-extrabold text-emerald-400 tabular-nums">
                        R$ {perPerson.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Método de Pagamento para encerramento */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Forma:</span>
                    {(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          paymentMethod === m
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {m === 'CREDIT_CARD' ? 'Crédito' : m === 'DEBIT_CARD' ? 'Débito' : m === 'PIX' ? 'PIX' : 'Dinheiro'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé de Ações do Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleSaveTableInfo}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Salvar Dados da Mesa
              </button>

              <div className="flex items-center gap-2">
                {newItems.length > 0 && (
                  <button
                    onClick={handleSendToKitchen}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    Enviar Pedidos ao KDS
                  </button>
                )}

                {allItems.length > 0 && (
                  <button
                    onClick={handleCloseBill}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Encerrar & Receber (R$ {currentTotal.toFixed(2)})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Placa Display Acrílico QR Code da Mesa */}
      {qrCodeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm">Placa QR Code de Mesa (Display)</h3>
              </div>
              <button
                onClick={() => setQrCodeTable(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulação da Placa de Acrílico */}
            <div className="p-6 bg-slate-100 flex justify-center">
              <div className="bg-white rounded-2xl shadow-xl border-4 border-slate-800 p-6 w-72 text-center flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md mb-2"
                  style={{ backgroundColor: activeTenant.brandColor }}
                >
                  🍕
                </div>
                <h4 className="font-black text-slate-900 text-base">{activeTenant.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium mb-3">Autoatendimento na Mesa</p>

                <div className="bg-slate-900 text-white px-5 py-1.5 rounded-full font-black text-sm tracking-wide mb-4">
                  MESA #{qrCodeTable.number}
                </div>

                {/* QR Code SVG */}
                <div className="p-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl shadow-inner mb-3">
                  <svg className="w-40 h-40" viewBox="0 0 120 120" fill="none">
                    <rect width="120" height="120" fill="white" />
                    {/* Corners */}
                    <rect x="10" y="10" width="30" height="30" rx="4" fill="#0f172a" />
                    <rect x="16" y="16" width="18" height="18" rx="2" fill="white" />
                    <rect x="20" y="20" width="10" height="10" fill="#0f172a" />

                    <rect x="80" y="10" width="30" height="30" rx="4" fill="#0f172a" />
                    <rect x="86" y="16" width="18" height="18" rx="2" fill="white" />
                    <rect x="90" y="20" width="10" height="10" fill="#0f172a" />

                    <rect x="10" y="80" width="30" height="30" rx="4" fill="#0f172a" />
                    <rect x="16" y="86" width="18" height="18" rx="2" fill="white" />
                    <rect x="20" y="90" width="10" height="10" fill="#0f172a" />

                    {/* Data dots */}
                    <rect x="46" y="15" width="6" height="6" fill="#0f172a" />
                    <rect x="58" y="15" width="6" height="6" fill="#0f172a" />
                    <rect x="68" y="22" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="30" width="6" height="6" fill="#0f172a" />
                    <rect x="60" y="30" width="6" height="6" fill="#0f172a" />
                    <rect x="25" y="48" width="6" height="6" fill="#0f172a" />
                    <rect x="35" y="55" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="48" width="24" height="24" rx="4" fill="#f59e0b" />
                    <text x="60" y="65" textAnchor="middle" fontSize="14" fill="#0f172a" fontWeight="bold">🍕</text>
                    <rect x="80" y="48" width="6" height="6" fill="#0f172a" />
                    <rect x="92" y="55" width="6" height="6" fill="#0f172a" />
                    <rect x="85" y="70" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="80" width="6" height="6" fill="#0f172a" />
                    <rect x="60" y="88" width="6" height="6" fill="#0f172a" />
                    <rect x="75" y="82" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="100" width="6" height="6" fill="#0f172a" />
                    <rect x="68" y="102" width="6" height="6" fill="#0f172a" />
                    <rect x="85" y="98" width="6" height="6" fill="#0f172a" />
                    <rect x="100" y="85" width="6" height="6" fill="#0f172a" />
                  </svg>
                </div>

                <p className="text-xs font-bold text-slate-800 leading-tight">
                  Aponte a câmera para pedir
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 break-all">
                  pizzasaas.app/menu/{activeTenant.slug}?mesa={qrCodeTable.number}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 w-full text-[10px] text-slate-500 space-y-0.5">
                  <p><span className="font-semibold text-slate-700">Wi-Fi:</span> {activeTenant.name}-Clientes</p>
                  <p><span className="font-semibold text-slate-700">Senha:</span> pizzasabor</p>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Formato ideal: Display A6 Acrílico
              </span>
              <button
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                Imprimir Display
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
