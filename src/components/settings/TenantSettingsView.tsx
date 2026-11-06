import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Settings,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Building,
  Phone,
  Truck,
  Percent,
  Sliders,
} from 'lucide-react';

export const TenantSettingsView: React.FC = () => {
  const {
    activeTenant,
    updateTenantSettings,
    deliveryZones,
    addDeliveryZone,
    toggleDeliveryZone,
    removeDeliveryZone,
    coupons,
  } = useApp();

  // Estados dos campos de configurações
  const [deliveryFee, setDeliveryFee] = useState(activeTenant.settings.deliveryFee);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(activeTenant.settings.freeDeliveryAbove);
  const [minOrderValue, setMinOrderValue] = useState(activeTenant.settings.minOrderValue);
  const [priceRule, setPriceRule] = useState<'HIGHEST_VALUE' | 'AVERAGE'>(activeTenant.settings.priceRule);
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(activeTenant.settings.autoConfirmOrders);
  const [estimatedPrepTimeMinutes, setEstimatedPrepTimeMinutes] = useState(activeTenant.settings.estimatedPrepTimeMinutes);
  const [openingHours, setOpeningHours] = useState(activeTenant.openingHours);
  const [isOpen, setIsOpen] = useState(activeTenant.isOpen);

  // Estados para adicionar nova região de entrega
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [newFee, setNewFee] = useState(8.00);
  const [newTime, setNewTime] = useState(35);
  const [isAddingZone, setIsAddingZone] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantSettings(
      {
        deliveryFee: Number(deliveryFee),
        freeDeliveryAbove: Number(freeDeliveryAbove),
        minOrderValue: Number(minOrderValue),
        priceRule,
        autoConfirmOrders,
        estimatedPrepTimeMinutes: Number(estimatedPrepTimeMinutes),
      },
      {
        openingHours,
        isOpen,
      }
    );
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNeighborhood.trim()) return;

    addDeliveryZone({
      neighborhood: newNeighborhood.trim(),
      fee: Number(newFee),
      estimatedMinutes: Number(newTime),
      active: true,
    });

    setNewNeighborhood('');
    setNewFee(8.00);
    setNewTime(35);
    setIsAddingZone(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Topo: Título & Status da Pizzaria */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>⚙️</span> Configurações da Pizzaria & Parâmetros Comerciais
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Defina taxas de entrega por região, regras de cálculo para pizza meio a meio, horários e políticas da loja.
          </p>
        </div>

        {/* Status Aberto / Fechado com 1 clique */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600">Catálogo Online:</span>
          <button
            onClick={() => {
              const next = !isOpen;
              setIsOpen(next);
              updateTenantSettings({}, { isOpen: next });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              isOpen
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-rose-500 text-white shadow-xs'
            }`}
          >
            <span className={`w-2 h-2 rounded-full bg-white ${isOpen ? 'animate-pulse' : ''}`}></span>
            <span>{isOpen ? 'Pizzaria Aberta' : 'Pizzaria Fechada'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Regras Comerciais & Zonas de Entrega */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Regras de Preço e Parâmetros Comerciais */}
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                Regras de Cobrança & Operação
              </h3>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Alterações
              </button>
            </div>

            {/* Regra de Meio a Meio */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="text-xs font-black text-slate-900 block">
                Regra Comercial de Pizza 1/2 e 1/2:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setPriceRule('HIGHEST_VALUE')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-start gap-2.5 ${
                    priceRule === 'HIGHEST_VALUE'
                      ? 'bg-amber-500/10 border-amber-500 text-slate-900 ring-1 ring-amber-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="priceRule"
                    checked={priceRule === 'HIGHEST_VALUE'}
                    onChange={() => setPriceRule('HIGHEST_VALUE')}
                    className="mt-0.5 text-amber-600"
                  />
                  <div>
                    <span className="block font-black text-slate-900">Cobrar pelo Maior Valor</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Padrão de pizzarias tradicionais. Se escolher Calabresa (R$ 68) e Camarão (R$ 90), o preço base será R$ 90.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setPriceRule('AVERAGE')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-start gap-2.5 ${
                    priceRule === 'AVERAGE'
                      ? 'bg-amber-500/10 border-amber-500 text-slate-900 ring-1 ring-amber-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="priceRule"
                    checked={priceRule === 'AVERAGE'}
                    onChange={() => setPriceRule('AVERAGE')}
                    className="mt-0.5 text-amber-600"
                  />
                  <div>
                    <span className="block font-black text-slate-900">Cobrar pela Média dos Sabores</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Mais atrativo ao cliente. O valor será a média matemática proporcional de cada fatia/sabor selecionado.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Grid de Valores de Entrega */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Taxa Padrão de Entrega:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={deliveryFee}
                    onChange={e => setDeliveryFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Frete Grátis Acima de:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="5.00"
                    min="0"
                    value={freeDeliveryAbove}
                    onChange={e => setFreeDeliveryAbove(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pedido Mínimo:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="5.00"
                    min="0"
                    value={minOrderValue}
                    onChange={e => setMinOrderValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Tempo de Preparo & Auto-confirmação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tempo Estimado de Produção (Minutos):
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={estimatedPrepTimeMinutes}
                  onChange={e => setEstimatedPrepTimeMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Horário Exibido no Cardápio:
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={e => setOpeningHours(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </form>

          {/* Card: Bairros & Zonas de Entrega Personalizadas */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-500" />
                  Zonas de Entrega & Taxas por Bairro ({deliveryZones.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Defina taxas diferenciadas e tempos de rota de acordo com a proximidade.
                </p>
              </div>

              <button
                onClick={() => setIsAddingZone(!isAddingZone)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Bairro</span>
              </button>
            </div>

            {/* Formulário para adicionar nova zona */}
            {isAddingZone && (
              <form onSubmit={handleAddZone} className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">Cadastrar Nova Região de Atendimento:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Nome do Bairro:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Santana / Jardim São Paulo"
                      value={newNeighborhood}
                      onChange={e => setNewNeighborhood(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Taxa de Frete (R$):</label>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={newFee}
                      onChange={e => setNewFee(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Tempo Médio (min):</label>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      value={newTime}
                      onChange={e => setNewTime(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingZone(false)}
                    className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black cursor-pointer shadow-xs"
                  >
                    Salvar Região
                  </button>
                </div>
              </form>
            )}

            {/* Lista de Zonas */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {deliveryZones.map(zone => (
                <div key={zone.id} className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{zone.neighborhood}</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Previsão de entrega: ~{zone.estimatedMinutes} minutos
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black font-mono text-slate-900 tabular-nums">
                      R$ {zone.fee.toFixed(2)}
                    </span>

                    <button
                      onClick={() => toggleDeliveryZone(zone.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                        zone.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {zone.active ? 'Ativo' : 'Inativo'}
                    </button>

                    <button
                      onClick={() => removeDeliveryZone(zone.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Excluir região"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 3: Dados Cadastrais & Cupons Ativos */}
        <div className="space-y-6">
          {/* Dados da Empresa / Tenant */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Building className="w-4 h-4 text-amber-500" />
              Identificação da Pizzaria
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Nome Comercial</span>
                <span className="font-extrabold text-slate-800">{activeTenant.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">CNPJ</span>
                <span className="font-mono text-slate-700">{activeTenant.cnpj}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">WhatsApp / Telefone</span>
                <span className="font-bold text-slate-700">{activeTenant.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Endereço da Loja</span>
                <span className="text-slate-600">
                  {activeTenant.address.street}, {activeTenant.address.number} - {activeTenant.address.neighborhood}, {activeTenant.address.city}/{activeTenant.address.state}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Slogan do Cardápio</span>
                <span className="text-slate-500 italic">"{activeTenant.tagline}"</span>
              </div>
            </div>
          </div>

          {/* Cupons de Desconto Ativos */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Percent className="w-4 h-4 text-amber-500" />
              Cupons de Desconto Ativos
            </h3>

            <div className="space-y-2">
              {coupons.map(coupon => (
                <div key={coupon.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-xs text-amber-600 block">
                      {coupon.code}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {coupon.description}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {coupon.usageCount} usos
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
