import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Menu,
  Bell,
  MapPin,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface TopHeaderProps {
  onToggleMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    activeTenant,
    currentView,
    activeOrdersCount,
    newPendingOrdersCount,
    setCurrentView,
    soundEnabled,
    toggleSound,
    triggerChime,
  } = useApp();

  const getViewTitle = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return 'Dashboard Executivo & KPIs';
      case 'CUSTOMER_CATALOG':
        return 'Catálogo Delivery Online';
      case 'CUSTOMER_TRACKING':
        return 'Rastreamento de Entrega ao Vivo';
      case 'ADMIN_ORDERS':
        return 'Painel Operacional de Pedidos & PDV';
      case 'DINE_IN_TABLES':
        return 'Mesas & Comandas de Salão';
      case 'KITCHEN_KDS':
        return 'Monitor de Produção da Cozinha (KDS)';
      case 'DRIVER_APP':
        return 'Aplicativo PWA do Entregador';
      case 'MENU_MANAGER':
        return 'Gestor de Cardápio & Sabores';
      case 'STOCK_MANAGER':
        return 'Controle de Estoque & Fichas Técnicas (BOM)';
      case 'FINANCE_MANAGER':
        return 'Gestão Financeira, DRE & Frente de Caixa';
      case 'WHATSAPP_CONFIG':
        return 'Integração WhatsApp Evolution API';
      case 'TENANT_SETTINGS':
        return 'Configurações da Pizzaria & Regras';
      case 'CUSTOMERS_CRM':
        return 'CRM de Clientes & Programa de Fidelidade';
      case 'SUPER_ADMIN_SAAS':
        return 'Master SaaS - Gestão de Assinaturas & MRR';
      default:
        return 'Painel de Gestão';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Lado Esquerdo: Botão Hamburger Mobile + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-extrabold text-slate-900 hidden sm:inline">
            {activeTenant.name}
          </span>
          <span className="text-slate-400 hidden sm:inline">/</span>
          <span className="font-bold text-amber-600 truncate max-w-xs sm:max-w-md">
            {getViewTitle()}
          </span>
        </div>
      </div>

      {/* Lado Direito: Métricas Rápidas & Atalhos */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Alerta Sonoro de Pedidos */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              toggleSound();
              if (!soundEnabled) {
                triggerChime();
              }
            }}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              soundEnabled
                ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'Som ativado (clique para silenciar ou aperte no botão ao lado para testar)' : 'Som desativado (clique para ativar som de novos pedidos)'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline text-[10px]">{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
          </button>

          {soundEnabled && (
            <button
              onClick={() => triggerChime()}
              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[10px] cursor-pointer shadow-xs transition-colors hidden sm:inline"
              title="Testar o sino de pedido da cozinha"
            >
              🔔 Testar Som
            </button>
          )}
        </div>

        {/* Indicador de Pedidos Ativos */}
        <button
          onClick={() => setCurrentView('ADMIN_ORDERS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            newPendingOrdersCount > 0
              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Ver pedidos em andamento"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>{activeOrdersCount} {activeOrdersCount === 1 ? 'Pedido Ativo' : 'Pedidos Ativos'}</span>
        </button>

        {/* Informações da Região e Tempo */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 border-l border-slate-200 pl-4">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Preparo médio: {activeTenant.settings.estimatedPrepTimeMinutes}m
          </span>
          <span className="flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {activeTenant.address.neighborhood}
          </span>
        </div>

        {/* Link Rápido para Abrir o Cardápio do Cliente */}
        {currentView !== 'CUSTOMER_CATALOG' && (
          <button
            onClick={() => setCurrentView('CUSTOMER_CATALOG')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <span>Ver Cardápio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
