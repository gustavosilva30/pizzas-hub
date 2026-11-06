import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { TopHeader } from './components/layout/TopHeader.tsx';
import { CustomerCatalogView } from './components/customer/CustomerCatalogView.tsx';
import { TrackingView } from './components/customer/TrackingView.tsx';
import { OrdersAdminView } from './components/orders/OrdersAdminView.tsx';
import { KitchenKDSView } from './components/kitchen/KitchenKDSView.tsx';
import { DriverAppView } from './components/driver/DriverAppView.tsx';
import { StockManagerView } from './components/inventory/StockManagerView.tsx';
import { FinanceManagerView } from './components/finance/FinanceManagerView.tsx';
import { WhatsAppConfigView } from './components/whatsapp/WhatsAppConfigView.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { DineInTablesView } from './components/tables/DineInTablesView.tsx';
import { MenuManagerView } from './components/menu/MenuManagerView.tsx';
import { TenantSettingsView } from './components/settings/TenantSettingsView.tsx';
import { CustomersCRMView } from './components/crm/CustomersCRMView.tsx';
import { SuperAdminSaaSView } from './components/superadmin/SuperAdminSaaSView.tsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentView, notification, dismissNotification } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Toast Notification Flutuante */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-2 flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {notification.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
            {notification.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-xs text-white">{notification.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{notification.message}</p>
          </div>
          <button
            onClick={dismissNotification}
            className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar Lateral Profissional */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Área Principal de Conteúdo */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Barra Superior Limpa (Sem scroll lateral) */}
        <TopHeader onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        {/* Viewport Central */}
        <main className="flex-1">
          {currentView === 'DASHBOARD' && <DashboardView />}
          {currentView === 'CUSTOMER_CATALOG' && <CustomerCatalogView />}
          {currentView === 'CUSTOMER_TRACKING' && <TrackingView />}
          {currentView === 'ADMIN_ORDERS' && <OrdersAdminView />}
          {currentView === 'DINE_IN_TABLES' && <DineInTablesView />}
          {currentView === 'KITCHEN_KDS' && <KitchenKDSView />}
          {currentView === 'DRIVER_APP' && <DriverAppView />}
          {currentView === 'MENU_MANAGER' && <MenuManagerView />}
          {currentView === 'STOCK_MANAGER' && <StockManagerView />}
          {currentView === 'FINANCE_MANAGER' && <FinanceManagerView />}
          {currentView === 'WHATSAPP_CONFIG' && <WhatsAppConfigView />}
          {currentView === 'TENANT_SETTINGS' && <TenantSettingsView />}
          {currentView === 'CUSTOMERS_CRM' && <CustomersCRMView />}
          {currentView === 'SUPER_ADMIN_SAAS' && <SuperAdminSaaSView />}
        </main>

        {/* Rodapé SaaS */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900">PizzaSaaS Engine</span>
              <span>·</span>
              <span>Arquitetura Multiempresa com PostgreSQL RLS & Evolution API</span>
            </div>
            <div className="text-[11px] text-slate-400">
              © 2026 Plataforma SaaS para Pizzarias. Alta disponibilidade e baixa latência.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
