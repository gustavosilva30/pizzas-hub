import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Tenant } from '../../types/index.ts';
import {
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Sparkles,
  Server,
  Layers,
  X,
  CreditCard,
  Lock,
} from 'lucide-react';

export const SuperAdminSaaSView: React.FC = () => {
  const {
    tenants,
    setActiveTenant,
    createTenant,
    setCurrentView,
    orders,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'ALL' | 'STARTER' | 'PRO' | 'ENTERPRISE'>('ALL');

  // Modal para onboarding de nova pizzaria
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCnpj, setNewCnpj] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBrandColor, setNewBrandColor] = useState('#ea580c');
  const [newStreet, setNewStreet] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [newCity, setNewCity] = useState('São Paulo');
  const [newState, setNewState] = useState('SP');
  const [newZipCode, setNewZipCode] = useState('01310-100');
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PRO' | 'ENTERPRISE'>('PRO');

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) return;

    createTenant(
      {
        name: newName.trim(),
        slug: newSlug.trim().toLowerCase(),
        cnpj: newCnpj.trim() || '00.000.000/0001-00',
        phone: newPhone.trim() || '(11) 99999-9999',
        brandColor: newBrandColor,
        street: newStreet.trim() || 'Avenida Principal',
        number: newNumber.trim() || '100',
        neighborhood: newNeighborhood.trim() || 'Centro',
        city: newCity.trim() || 'São Paulo',
        state: newState.trim() || 'SP',
        zipCode: newZipCode.trim() || '01000-000',
      },
      selectedPlan
    );

    setIsAddModalOpen(false);
    setNewName('');
    setNewSlug('');
    setNewCnpj('');
    setNewPhone('');
  };

  const handleSwitchTenant = (tenant: Tenant) => {
    setActiveTenant(tenant);
    setCurrentView('DASHBOARD');
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cnpj.includes(searchTerm) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || t.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  // Métricas Globais do SaaS
  const totalMrr = tenants.reduce((acc, t) => acc + (t.planPrice || 249), 0);
  const totalGmv = orders.reduce((acc, o) => acc + o.total, 0);
  const activeTenantsCount = tenants.filter(t => t.isOpen).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Topo: Painel Master SaaS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
              Super Admin Platform
            </span>
            <span className="text-xs text-slate-500 font-mono">Master Multi-Tenant</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>🏢</span> Gestão Geral de Pizzarias & Assinaturas SaaS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Painel do proprietário da plataforma para monitorar MRR, gerenciar planos de clientes e criar novas instâncias.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Cadastrar Nova Pizzaria no SaaS</span>
        </button>
      </div>

      {/* Cards de Métricas do SaaS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-bold">MRR (Mensalidades SaaS)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
            R$ {totalMrr.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Receita recorrente mensal ativa</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-bold">Pizzarias Clientes</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {tenants.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {activeTenantsCount} abertas hoje
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-bold">GMV Transacionado (Pedidos)</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono tabular-nums">
            R$ {totalGmv.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Volume vendido pelas pizzarias</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-bold">Status da Infraestrutura</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base font-black text-slate-900 flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>99.98% Uptime</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">PostgreSQL RLS isolado</span>
        </div>
      </div>

      {/* Planos Oferecidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            plan: 'STARTER',
            title: 'Plano Básico / Starter',
            price: 'R$ 149 / mês',
            desc: 'Ideal para pizzarias pequenas ou de bairro.',
            features: ['Catálogo Online Delivery', 'Painel de Pedidos & PDV', 'Até 300 pedidos/mês', 'Suporte por e-mail'],
          },
          {
            plan: 'PRO',
            title: 'Plano Profissional / Pro',
            price: 'R$ 249 / mês',
            badge: 'Mais Vendido',
            desc: 'Para pizzarias em crescimento com alto volume.',
            features: ['Tudo do Starter + KDS Cozinha', 'App do Entregador com GPS', 'Controle de Estoque & Fichas BOM', 'WhatsApp Evolution integrado'],
          },
          {
            plan: 'ENTERPRISE',
            title: 'Plano Forneria / Enterprise',
            price: 'R$ 399 / mês',
            desc: 'Para redes, franquias ou salões completos.',
            features: ['Tudo do Pro + Gestão de Mesas', 'Múltiplas instâncias WhatsApp', 'DRE Contábil & Fechamento Cego', 'Suporte prioritário 24/7'],
          },
        ].map((p, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-3xl border p-5 flex flex-col justify-between ${
              p.plan === 'PRO' ? 'border-amber-400 ring-2 ring-amber-100 shadow-sm' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-900">{p.title}</span>
                {p.badge && (
                  <span className="text-[9px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="text-xl font-black text-slate-900 font-mono my-2">{p.price}</div>
              <p className="text-xs text-slate-500 mb-3">{p.desc}</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {p.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de Pizzarias Cadastradas */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Pizzarias Ativas na Plataforma ({filteredTenants.length})
            </h3>
            <p className="text-xs text-slate-500">
              Cada pizzaria possui seu próprio subdomínio, banco isolado e identidade visual.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou slug..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Pizzaria</th>
                <th className="py-3 px-3">CNPJ & Contato</th>
                <th className="py-3 px-3">Localização</th>
                <th className="py-3 px-3">Plano SaaS</th>
                <th className="py-3 px-3">Mensalidade</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Acessar Ambiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs"
                        style={{ backgroundColor: t.brandColor }}
                      >
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block">{t.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {t.slug}.pizzasaas.app
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-mono text-slate-700 text-[11px]">{t.cnpj}</div>
                    <div className="text-slate-500 text-[11px]">{t.phone}</div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                    {t.address.neighborhood}, {t.address.city}/{t.address.state}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-black text-xs text-slate-900 block">
                      {t.plan || 'PRO'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Desde {t.createdAt || '2026-01-01'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-black text-emerald-600 tabular-nums">
                    R$ {(t.planPrice || 249).toFixed(2)}/mês
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Ativa
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => handleSwitchTenant(t)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                      title="Entrar na visão operacional desta pizzaria"
                    >
                      <span>Gerenciar Loja</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Onboarding de Nova Pizzaria */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">🍕</span>
                <div>
                  <h3 className="font-extrabold text-base">Nova Pizzaria no SaaS</h3>
                  <p className="text-xs text-slate-400">Criar novo ambiente isolado e subdomínio</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nome Comercial:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Forneria di Lucca"
                    value={newName}
                    onChange={e => {
                      setNewName(e.target.value);
                      if (!newSlug) {
                        setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subdomínio (Slug):</label>
                  <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2">
                    <input
                      type="text"
                      required
                      placeholder="forneria-lucca"
                      value={newSlug}
                      onChange={e => setNewSlug(e.target.value)}
                      className="w-full bg-transparent text-slate-900 font-mono text-xs focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">.pizzasaas.app</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CNPJ:</label>
                  <input
                    type="text"
                    required
                    placeholder="12.345.678/0001-90"
                    value={newCnpj}
                    onChange={e => setNewCnpj(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp de Atendimento:</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Plano & Cor da Marca */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plano de Assinatura:</label>
                  <select
                    value={selectedPlan}
                    onChange={e => setSelectedPlan(e.target.value as typeof selectedPlan)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="STARTER">Starter (R$ 149/mês)</option>
                    <option value="PRO">Pro (R$ 249/mês)</option>
                    <option value="ENTERPRISE">Enterprise (R$ 399/mês)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cor Primária da Marca:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newBrandColor}
                      onChange={e => setNewBrandColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="font-mono text-slate-600 uppercase font-bold text-xs">{newBrandColor}</span>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Rua:</label>
                  <input
                    type="text"
                    placeholder="Rua Augusta"
                    value={newStreet}
                    onChange={e => setNewStreet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Número:</label>
                  <input
                    type="text"
                    placeholder="500"
                    value={newNumber}
                    onChange={e => setNewNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bairro:</label>
                  <input
                    type="text"
                    placeholder="Consolação"
                    value={newNeighborhood}
                    onChange={e => setNewNeighborhood(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cidade / UF:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="São Paulo"
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="SP"
                      value={newState}
                      onChange={e => setNewState(e.target.value)}
                      className="w-14 bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-slate-900 text-center font-bold"
                    />
                  </div>
                </div>
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
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl cursor-pointer shadow-xs"
                >
                  Criar Pizzaria no SaaS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
