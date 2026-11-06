import React from 'react';
import { useApp, AppView } from '../../context/AppContext.tsx';
import {
  UtensilsCrossed,
  ShoppingBag,
  ChefHat,
  Bike,
  Package,
  DollarSign,
  MessageSquare,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  LayoutDashboard,
  Utensils,
  Layers,
  SlidersHorizontal,
  Users,
  Crown,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const {
    tenants,
    activeTenant,
    setActiveTenant,
    currentUser,
    setCurrentUser,
    users,
    currentView,
    setCurrentView,
    activeOrdersCount,
    newPendingOrdersCount,
    criticalStockCount,
    tables,
  } = useApp();

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setIsMobileOpen(false);
  };

  const occupiedTablesCount = tables.filter(t => t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED').length;

  const navGroups = [
    {
      title: 'Visão Geral & Gestão',
      items: [
        {
          id: 'DASHBOARD' as AppView,
          label: 'Dashboard Executivo',
          sublabel: 'KPIs, vendas e ranking',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'Operação & Vendas',
      items: [
        {
          id: 'CUSTOMER_CATALOG' as AppView,
          label: 'Catálogo Delivery',
          sublabel: 'Visão do cliente',
          icon: <ShoppingBag className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'ADMIN_ORDERS' as AppView,
          label: 'Painel Pedidos & PDV',
          sublabel: 'Gestão e balcão',
          icon: <UtensilsCrossed className="w-4 h-4 shrink-0" />,
          badge: newPendingOrdersCount || activeOrdersCount,
          badgeColor: newPendingOrdersCount > 0 ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-200',
        },
        {
          id: 'DINE_IN_TABLES' as AppView,
          label: 'Mesas & Comandas',
          sublabel: 'Salão presencial',
          icon: <Utensils className="w-4 h-4 shrink-0" />,
          badge: occupiedTablesCount > 0 ? occupiedTablesCount : undefined,
          badgeColor: 'bg-amber-500 text-slate-950',
        },
        {
          id: 'KITCHEN_KDS' as AppView,
          label: 'Cozinha (KDS)',
          sublabel: 'Monitor de produção',
          icon: <ChefHat className="w-4 h-4 shrink-0" />,
          badge: activeOrdersCount,
          badgeColor: 'bg-orange-500 text-slate-950',
        },
        {
          id: 'DRIVER_APP' as AppView,
          label: 'PWA Entregador',
          sublabel: 'Rotas & GPS ao vivo',
          icon: <Bike className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'MENU_MANAGER' as AppView,
          label: 'Gestor de Cardápio',
          sublabel: 'Pausar e editar sabores',
          icon: <Layers className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'Gestão & Backoffice',
      items: [
        {
          id: 'STOCK_MANAGER' as AppView,
          label: 'Estoque & Fichas',
          sublabel: 'Insumos e receitas BOM',
          icon: <Package className="w-4 h-4 shrink-0" />,
          badge: criticalStockCount > 0 ? criticalStockCount : undefined,
          badgeColor: 'bg-rose-600 text-white',
        },
        {
          id: 'FINANCE_MANAGER' as AppView,
          label: 'Financeiro & Caixa',
          sublabel: 'DRE, CMV e frente PDV',
          icon: <DollarSign className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'WHATSAPP_CONFIG' as AppView,
          label: 'WhatsApp Evolution',
          sublabel: 'Instâncias e automações',
          icon: <MessageSquare className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'TENANT_SETTINGS' as AppView,
          label: 'Configurações da Loja',
          sublabel: 'Zonas, frete e regras',
          icon: <SlidersHorizontal className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'CUSTOMERS_CRM' as AppView,
          label: 'Clientes & CRM',
          sublabel: 'LTV e pontos fidelidade',
          icon: <Users className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    ...(currentUser.role === 'SUPER_ADMIN' ? [{
      title: 'Plataforma SaaS Multiempresa',
      items: [
        {
          id: 'SUPER_ADMIN_SAAS' as AppView,
          label: 'Master SaaS (MRR)',
          sublabel: 'Assinaturas & Novas Lojas',
          icon: <Crown className="w-4 h-4 shrink-0 text-amber-400" />,
        },
      ],
    }] : []),
  ];

  return (
    <>
      {/* Backdrop Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Container da Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Topo: Logo & Toggle */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-black text-white text-base shadow-sm shrink-0">
              🍕
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-white text-base tracking-tight leading-tight">
                  PizzaSaaS
                </span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Multi-tenant Platform
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Seletor de Tenant (Pizzaria Ativa) */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
          {!isCollapsed ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  Pizzaria Ativa
                </span>
                <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Aberta
                </span>
              </div>
              <select
                value={activeTenant.id}
                onChange={e => {
                  const t = tenants.find(item => item.id === e.target.value);
                  if (t) setActiveTenant(t);
                }}
                className="w-full bg-slate-800 text-white text-xs font-bold rounded-lg px-2.5 py-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex justify-center" title={`Pizzaria: ${activeTenant.name}`}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: activeTenant.brandColor }}
              >
                {activeTenant.name.charAt(0)}
              </div>
            </div>
          )}
        </div>

        {/* Links de Navegação Categorizados */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {group.title}
                </div>
              )}
              {group.items.map(item => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={`${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`}>
                      {item.icon}
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 text-left truncate">
                        <div className="leading-tight">{item.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                          {item.sublabel}
                        </div>
                      </div>
                    )}

                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full tabular-nums shrink-0 ${
                          isActive
                            ? 'bg-slate-950 text-amber-400'
                            : item.badgeColor || 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Rodapé da Sidebar: Sessão do Usuário & Permissões */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Perfil Ativo
                </span>
                <span className="text-[10px] font-mono text-slate-300">RBAC</span>
              </div>
              <select
                value={currentUser.id}
                onChange={e => {
                  const u = users.find(item => item.id === e.target.value);
                  if (u) setCurrentUser(u);
                }}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex justify-center" title={`Usuário: ${currentUser.name} (${currentUser.role})`}>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
