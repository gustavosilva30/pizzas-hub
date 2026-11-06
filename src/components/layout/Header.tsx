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
  MapPin,
  Clock,
} from 'lucide-react';

export const Header: React.FC = () => {
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
  } = useApp();

  const navItems: Array<{ id: AppView; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'CUSTOMER_CATALOG', label: 'Catálogo Delivery', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'ADMIN_ORDERS', label: 'Painel Pedidos / PDV', icon: <UtensilsCrossed className="w-4 h-4" />, badge: newPendingOrdersCount || activeOrdersCount },
    { id: 'KITCHEN_KDS', label: 'Cozinha (KDS)', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'DRIVER_APP', label: 'PWA Entregador', icon: <Bike className="w-4 h-4" /> },
    { id: 'STOCK_MANAGER', label: 'Estoque & Fichas', icon: <Package className="w-4 h-4" />, badge: criticalStockCount > 0 ? criticalStockCount : undefined },
    { id: 'FINANCE_MANAGER', label: 'Financeiro & Caixa', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'WHATSAPP_CONFIG', label: 'WhatsApp Evolution', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 border-b border-slate-800/80 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center font-extrabold text-white shadow-sm">
              🍕
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                PizzaSaaS
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Multi-tenant
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/70 p-1.5 rounded-lg border border-slate-700/60">
            <Building2 className="w-4 h-4 text-slate-400 ml-1" />
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Pizzaria Ativa:</span>
            <select
              value={activeTenant.id}
              onChange={(e) => {
                const found = tenants.find(t => t.id === e.target.value);
                if (found) setActiveTenant(found);
              }}
              className="bg-slate-900 text-white text-xs font-semibold rounded px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              aria-label="Selecionar Pizzaria Ativa"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 px-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Aberta
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300">
              <span className="text-slate-400">Operando como:</span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const u = users.find(usr => usr.id === e.target.value);
                  if (u) setCurrentUser(u);
                }}
                className="bg-slate-800 text-amber-300 text-xs font-medium rounded px-2 py-1 border border-slate-700 focus:outline-none"
                aria-label="Perfil de Usuário Ativo"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 overflow-x-auto no-scrollbar gap-1 text-sm">
          <nav className="flex items-center gap-1 min-w-max">
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                        isActive
                          ? 'bg-slate-950 text-amber-400'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4 text-xs text-slate-400 min-w-max pl-4 border-l border-slate-800">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {activeTenant.address.neighborhood}, {activeTenant.address.city}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Preparo: {activeTenant.settings.estimatedPrepTimeMinutes}m
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
