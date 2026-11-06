import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tenant,
  User,
  Order,
  OrderStatus,
  StockItem,
  CashRegister,
  WhatsAppInstance,
  PizzaSize,
  PizzaFlavor,
  PizzaCrust,
  ProductItem,
  DineInTable,
  TableStatus,
  DeliveryZone,
  Coupon,
  Customer,
} from '../types/index.ts';
import {
  INITIAL_TENANTS,
  INITIAL_USERS,
  INITIAL_SIZES,
  INITIAL_FLAVORS,
  INITIAL_CRUSTS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_STOCK,
  INITIAL_CASH_REGISTERS,
  INITIAL_WHATSAPP_INSTANCES,
  INITIAL_RECIPE_BOOK,
  INITIAL_TABLES,
  INITIAL_DELIVERY_ZONES,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
} from '../data/mockDatabase.ts';
import { calculateDeductions } from '../utils/pizzaCalculator.ts';
import { playOrderChime } from '../utils/audioChime.ts';

export type AppView =
  | 'DASHBOARD'
  | 'CUSTOMER_CATALOG'
  | 'CUSTOMER_TRACKING'
  | 'ADMIN_ORDERS'
  | 'DINE_IN_TABLES'
  | 'KITCHEN_KDS'
  | 'DRIVER_APP'
  | 'MENU_MANAGER'
  | 'STOCK_MANAGER'
  | 'FINANCE_MANAGER'
  | 'CUSTOMERS_CRM'
  | 'WHATSAPP_CONFIG'
  | 'TENANT_SETTINGS'
  | 'SUPER_ADMIN_SAAS';

interface AppContextType {
  tenants: Tenant[];
  activeTenant: Tenant;
  setActiveTenant: (tenant: Tenant) => void;
  updateTenantSettings: (updatedSettings: Partial<Tenant['settings']>, updatedInfo?: Partial<Tenant>) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedTrackingToken: string | null;
  setSelectedTrackingToken: (token: string | null) => void;

  sizes: PizzaSize[];
  flavors: PizzaFlavor[];
  toggleFlavorAvailability: (flavorId: string) => void;
  addFlavor: (newFlavor: Omit<PizzaFlavor, 'id' | 'tenantId'>) => void;
  updateFlavorPrice: (flavorId: string, additionalPrice: number) => void;

  crusts: PizzaCrust[];
  toggleCrustAvailability: (crustId: string) => void;

  products: ProductItem[];
  toggleProductAvailability: (productId: string) => void;

  orders: Order[];
  activeOrdersCount: number;
  newPendingOrdersCount: number;
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'trackingToken'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, cancellationReason?: string) => void;
  assignDriver: (orderId: string, driverId: string) => void;
  updateDriverPosition: (orderId: string, lat: number, lng: number, speedKmH: number) => void;

  // Mesas & Salão
  tables: DineInTable[];
  updateTableStatus: (tableId: string, status: TableStatus, customerName?: string, guestsCount?: number, waiterName?: string) => void;
  addTableOrder: (tableId: string, items: Order['items'], waiterName: string) => void;
  closeTableComanda: (tableId: string, paymentMethod: Order['paymentMethod'], total: number) => void;

  // Zonas de Entrega
  deliveryZones: DeliveryZone[];
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'tenantId'>) => void;
  toggleDeliveryZone: (zoneId: string) => void;
  removeDeliveryZone: (zoneId: string) => void;

  // Cupons & Fidelidade
  coupons: Coupon[];
  applyCouponCode: (code: string, currentTotal: number) => { success: boolean; discount: number; message: string; coupon?: Coupon };

  // Estoque
  stockItems: StockItem[];
  criticalStockCount: number;
  adjustStock: (ingredientId: string, newQty: number, reason: string) => void;
  restockItem: (ingredientId: string, addQty: number) => void;

  // Financeiro
  activeCashRegister: CashRegister | undefined;
  cashRegisters: CashRegister[];
  addCashMovement: (type: 'SANGRIA' | 'REFORCO', amount: number, reason: string) => void;
  openCashRegister: (initialBalance: number) => void;
  closeCashRegister: (countedBalance: number, notes?: string) => void;

  // WhatsApp
  activeWhatsAppInstance: WhatsAppInstance | undefined;
  toggleWhatsAppTemplate: (templateId: string) => void;
  sendWhatsAppManualMessage: (phone: string, text: string) => void;
  simulateIncomingWebhook: () => void;

  // Clientes & CRM
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'tenantId' | 'loyaltyPoints' | 'totalOrders' | 'totalSpent' | 'lastOrderAt'>) => void;
  updateCustomerPoints: (customerId: string, addPoints: number) => void;

  // Master SaaS (Super Admin)
  createTenant: (tenantData: { name: string; slug: string; cnpj: string; phone: string; brandColor: string; street: string; number: string; neighborhood: string; city: string; state: string; zipCode: string }, plan: 'STARTER' | 'PRO' | 'ENTERPRISE') => void;

  // Áudio & Notificações
  soundEnabled: boolean;
  toggleSound: () => void;
  triggerChime: () => void;
  notification: { title: string; message: string; type: 'success' | 'info' | 'warning' } | null;
  dismissNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeTenant, setActiveTenant] = useState<Tenant>(INITIAL_TENANTS[0]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  
  const [currentView, setCurrentView] = useState<AppView>('CUSTOMER_CATALOG');
  const [selectedTrackingToken, setSelectedTrackingToken] = useState<string | null>('trk-101-live-gps');

  const [sizes] = useState<PizzaSize[]>(INITIAL_SIZES);
  const [flavors, setFlavors] = useState<PizzaFlavor[]>(INITIAL_FLAVORS);
  const [crusts, setCrusts] = useState<PizzaCrust[]>(INITIAL_CRUSTS);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [tables, setTables] = useState<DineInTable[]>(INITIAL_TABLES);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(INITIAL_DELIVERY_ZONES);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [stockItems, setStockItems] = useState<StockItem[]>(INITIAL_STOCK);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>(INITIAL_CASH_REGISTERS);
  const [whatsAppInstances, setWhatsAppInstances] = useState<WhatsAppInstance[]>(INITIAL_WHATSAPP_INSTANCES);
  const [notification, setNotification] = useState<{ title: string; message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const tenantOrders = orders.filter(o => o.tenantId === activeTenant.id);
  const activeOrdersCount = tenantOrders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
  const newPendingOrdersCount = tenantOrders.filter(o => o.status === 'PENDING').length;
  
  const activeCashRegister = cashRegisters.find(c => c.tenantId === activeTenant.id && c.status === 'OPEN');
  const activeWhatsAppInstance = whatsAppInstances.find(w => w.tenantId === activeTenant.id);
  const criticalStockCount = stockItems.filter(s => s.tenantId === activeTenant.id && s.currentStock <= s.minStock).length;

  const triggerChime = () => {
    if (soundEnabled) {
      playOrderChime();
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const showNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setNotification({ title, message, type });
  };

  const dismissNotification = () => setNotification(null);

  const updateTenantSettings = (updatedSettings: Partial<Tenant['settings']>, updatedInfo?: Partial<Tenant>) => {
    setActiveTenant(prev => ({
      ...prev,
      ...updatedInfo,
      settings: {
        ...prev.settings,
        ...updatedSettings,
      },
    }));
    showNotification('Configurações Salvas', 'Parâmetros comerciais da pizzaria atualizados com sucesso.', 'success');
  };

  // Cardápio: Pausar/Ativar Sabores
  const toggleFlavorAvailability = (flavorId: string) => {
    setFlavors(prev => prev.map(f => {
      if (f.id === flavorId) {
        const nextState = !f.isAvailable;
        showNotification(nextState ? 'Sabor Reativado' : 'Sabor Pausado', `${f.name} ${nextState ? 'agora está disponível' : 'marcado como esgotado'} no cardápio.`, nextState ? 'success' : 'warning');
        return { ...f, isAvailable: nextState };
      }
      return f;
    }));
  };

  const addFlavor = (newFlavor: Omit<PizzaFlavor, 'id' | 'tenantId'>) => {
    const id = `flavor-${Date.now()}`;
    const item: PizzaFlavor = {
      ...newFlavor,
      id,
      tenantId: activeTenant.id,
    };
    setFlavors(prev => [item, ...prev]);
    showNotification('Novo Sabor Criado', `${item.name} adicionado ao cardápio com sucesso!`, 'success');
  };

  const updateFlavorPrice = (flavorId: string, additionalPrice: number) => {
    setFlavors(prev => prev.map(f => f.id === flavorId ? { ...f, additionalPrice } : f));
    showNotification('Preço Atualizado', 'Valor adicional do sabor atualizado.', 'info');
  };

  const toggleCrustAvailability = (crustId: string) => {
    setCrusts(prev => prev.map(c => c.id === crustId ? { ...c, isAvailable: !c.isAvailable } : c));
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p));
  };

  // Mesas & Salão
  const updateTableStatus = (tableId: string, status: TableStatus, customerName?: string, guestsCount?: number, waiterName?: string) => {
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status,
          customerName: customerName !== undefined ? customerName : t.customerName,
          guestsCount: guestsCount !== undefined ? guestsCount : t.guestsCount,
          waiterName: waiterName !== undefined ? waiterName : t.waiterName,
          openedAt: status === 'OCCUPIED' && !t.openedAt ? nowStr : (status === 'AVAILABLE' ? undefined : t.openedAt),
        };
      }
      return t;
    }));
    showNotification('Mesa Atualizada', `Status da mesa alterado para ${status === 'AVAILABLE' ? 'Livre' : status === 'OCCUPIED' ? 'Ocupada' : status === 'BILL_REQUESTED' ? 'Conta Solicitada' : 'Reservada'}.`, 'info');
  };

  const addTableOrder = (tableId: string, items: Order['items'], waiterName: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const nextNumber = Math.max(...orders.map(o => o.orderNumber), 100) + 1;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const subtotal = items.reduce((acc, i) => acc + i.totalPrice, 0);
    const cmvTotal = items.reduce((acc, i) => acc + i.cmvCost, 0);

    const newOrder: Order = {
      id: `ord-table-${nextNumber}`,
      orderNumber: nextNumber,
      tenantId: activeTenant.id,
      customerName: table.customerName || `Cliente ${table.name}`,
      customerPhone: '(Salão Presencial)',
      customerAddress: {
        street: `${activeTenant.name} - ${table.name}`,
        number: `${table.number}`,
        neighborhood: 'Salão',
        lat: activeTenant.address.lat,
        lng: activeTenant.address.lng,
      },
      type: 'DINE_IN',
      status: 'PREPARING',
      items,
      subtotal,
      deliveryFee: 0,
      discount: 0,
      total: subtotal,
      cmvTotal,
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'PENDING_ON_DELIVERY',
      trackingToken: `table-${table.number}-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
      estimatedDeliveryTime: 'Na mesa em ~20m',
    };

    setOrders(prev => [newOrder, ...prev]);
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, orderId: newOrder.id, waiterName } : t));
    triggerChime();
    showNotification('Pedido de Mesa Lançado!', `Comanda enviada diretamente para a cozinha (KDS).`, 'success');
  };

  const closeTableComanda = (tableId: string, paymentMethod: Order['paymentMethod'], total: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Se tiver pedido vinculado, marca como entregue/pago
    if (table.orderId) {
      setOrders(prev => prev.map(o => o.id === table.orderId ? { ...o, status: 'DELIVERED', paymentStatus: 'PAID', paymentMethod, total } : o));
    }

    // Registra entrada no caixa
    if (activeCashRegister) {
      const newMov = {
        id: `mov-${Date.now()}`,
        type: 'SALE' as const,
        amount: total,
        reason: `Mesa #${table.number} (${table.name}) - ${paymentMethod}`,
        operatorName: currentUser.name,
        timestamp: nowStr,
      };

      setCashRegisters(prev => prev.map(cr => {
        if (cr.id === activeCashRegister.id) {
          return {
            ...cr,
            calculatedBalance: Number((cr.calculatedBalance + total).toFixed(2)),
            movements: [newMov, ...cr.movements],
          };
        }
        return cr;
      }));
    }

    // Libera a mesa
    setTables(prev => prev.map(t => t.id === tableId ? {
      ...t,
      status: 'AVAILABLE',
      orderId: undefined,
      customerName: undefined,
      guestsCount: undefined,
      openedAt: undefined,
      notes: undefined,
    } : t));

    showNotification('Mesa Fechada com Sucesso', `Mesa #${table.number} liberada. R$ ${total.toFixed(2)} registrado no caixa.`, 'success');
  };

  // Zonas de Entrega
  const addDeliveryZone = (zone: Omit<DeliveryZone, 'id' | 'tenantId'>) => {
    const newZone: DeliveryZone = {
      ...zone,
      id: `zone-${Date.now()}`,
      tenantId: activeTenant.id,
    };
    setDeliveryZones(prev => [...prev, newZone]);
    showNotification('Região Adicionada', `Bairro ${zone.neighborhood} incluído na rota com taxa de R$ ${zone.fee.toFixed(2)}.`, 'success');
  };

  const toggleDeliveryZone = (zoneId: string) => {
    setDeliveryZones(prev => prev.map(z => z.id === zoneId ? { ...z, active: !z.active } : z));
  };

  const removeDeliveryZone = (zoneId: string) => {
    setDeliveryZones(prev => prev.filter(z => z.id !== zoneId));
    showNotification('Região Removida', 'Zona de entrega excluída.', 'info');
  };

  // Cupons
  const applyCouponCode = (code: string, currentTotal: number) => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code === cleanCode && c.tenantId === activeTenant.id && c.active);

    if (!coupon) {
      return { success: false, discount: 0, message: 'Cupom inválido ou expirado.' };
    }

    if (currentTotal < coupon.minOrderValue) {
      return { success: false, discount: 0, message: `Valor mínimo para este cupom é R$ ${coupon.minOrderValue.toFixed(2)}.` };
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Number(((currentTotal * coupon.value) / 100).toFixed(2));
    } else {
      discount = Math.min(coupon.value, currentTotal);
    }

    return {
      success: true,
      discount,
      message: `Cupom ${coupon.code} aplicado com sucesso! Desconto de R$ ${discount.toFixed(2)}.`,
      coupon,
    };
  };

  // CRM & Clientes
  const addCustomer = (cust: Omit<Customer, 'id' | 'tenantId' | 'loyaltyPoints' | 'totalOrders' | 'totalSpent' | 'lastOrderAt'>) => {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      tenantId: activeTenant.id,
      loyaltyPoints: 1,
      totalOrders: 1,
      totalSpent: 0,
      lastOrderAt: 'Hoje',
    };
    setCustomers(prev => [newCust, ...prev]);
    showNotification('Cliente Cadastrado', `${newCust.name} adicionado ao CRM com sucesso!`, 'success');
  };

  const updateCustomerPoints = (customerId: string, addPoints: number) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, loyaltyPoints: Math.max(0, c.loyaltyPoints + addPoints) } : c));
    showNotification('Pontos Atualizados', 'Saldo de fidelidade do cliente ajustado.', 'info');
  };

  // Master SaaS (Super Admin)
  const createTenant = (tenantData: { name: string; slug: string; cnpj: string; phone: string; brandColor: string; street: string; number: string; neighborhood: string; city: string; state: string; zipCode: string }, plan: 'STARTER' | 'PRO' | 'ENTERPRISE') => {
    const newId = `tenant-${tenantData.slug.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    const planPrices = { STARTER: 149.00, PRO: 249.00, ENTERPRISE: 399.00 };
    const newTenant: Tenant = {
      id: newId,
      name: tenantData.name,
      slug: tenantData.slug.toLowerCase().replace(/\s+/g, '-'),
      brandColor: tenantData.brandColor || '#ea580c',
      tagline: 'Pizzaria artesanal & delivery',
      cnpj: tenantData.cnpj,
      phone: tenantData.phone,
      address: {
        street: tenantData.street,
        number: tenantData.number,
        neighborhood: tenantData.neighborhood,
        city: tenantData.city,
        state: tenantData.state,
        zipCode: tenantData.zipCode,
        lat: -23.5505,
        lng: -46.6333,
      },
      settings: {
        deliveryFee: 8.00,
        freeDeliveryAbove: 100.00,
        minOrderValue: 40.00,
        priceRule: 'HIGHEST_VALUE',
        autoConfirmOrders: false,
        estimatedPrepTimeMinutes: 35,
      },
      openingHours: 'Terça a Domingo das 18:00 às 23:30',
      isOpen: true,
      plan,
      planPrice: planPrices[plan],
      subscriptionStatus: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTenants(prev => [...prev, newTenant]);
    showNotification('Pizzaria Cadastrada no SaaS', `Ambiente criado para ${newTenant.name} (${plan}).`, 'success');
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'trackingToken'>): Order => {
    const nextNumber = Math.max(...orders.map(o => o.orderNumber), 100) + 1;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const trackingToken = `trk-${nextNumber}-${Date.now().toString(36)}`;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${nextNumber}`,
      orderNumber: nextNumber,
      createdAt: nowStr,
      updatedAt: nowStr,
      trackingToken,
      driverLocation: orderData.type === 'DELIVERY' ? {
        lat: activeTenant.address.lat,
        lng: activeTenant.address.lng,
        heading: 0,
        speedKmH: 0,
        updatedAt: nowStr,
      } : undefined,
    };

    setOrders(prev => [newOrder, ...prev]);
    triggerChime();

    // Atualiza histórico do cliente no CRM
    setCustomers(prev => {
      const existing = prev.find(c => c.phone === newOrder.customerPhone && c.tenantId === activeTenant.id);
      if (existing) {
        return prev.map(c => c.id === existing.id ? {
          ...c,
          totalOrders: c.totalOrders + 1,
          totalSpent: Number((c.totalSpent + newOrder.total).toFixed(2)),
          loyaltyPoints: c.loyaltyPoints + 1,
          lastOrderAt: 'Hoje',
        } : c);
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          tenantId: activeTenant.id,
          name: newOrder.customerName,
          phone: newOrder.customerPhone,
          address: {
            street: newOrder.customerAddress.street,
            number: newOrder.customerAddress.number,
            neighborhood: newOrder.customerAddress.neighborhood,
            complement: newOrder.customerAddress.complement,
          },
          loyaltyPoints: 1,
          totalOrders: 1,
          totalSpent: newOrder.total,
          lastOrderAt: 'Hoje',
        };
        return [newCust, ...prev];
      }
    });

    showNotification('Novo Pedido Recebido!', `Pedido #${nextNumber} de ${newOrder.customerName} (R$ ${newOrder.total.toFixed(2)})`, 'success');

    if (activeWhatsAppInstance && activeWhatsAppInstance.status === 'CONNECTED') {
      const template = activeWhatsAppInstance.templates.find(t => t.trigger === 'ORDER_CONFIRMED');
      if (template?.enabled) {
        const msg = `🍕 *${activeTenant.name}*: Olá, ${newOrder.customerName}! Seu pedido #${nextNumber} foi recebido com sucesso!`;
        setWhatsAppInstances(prev => prev.map(inst => {
          if (inst.id === activeWhatsAppInstance.id) {
            return {
              ...inst,
              logs: [{ id: `log-${Date.now()}`, phone: newOrder.customerPhone, message: msg, timestamp: nowStr, status: 'DELIVERED' }, ...inst.logs]
            };
          }
          return inst;
        }));
      }
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, cancellationReason?: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          updatedAt: nowStr,
          cancellationReason: cancellationReason || o.cancellationReason,
        };
      }
      return o;
    }));

    if (status === 'OUT_FOR_DELIVERY') {
      showNotification('Pedido em Rota de Entrega', `O motoboy iniciou a entrega do pedido #${targetOrder.orderNumber}.`, 'info');
      if (activeWhatsAppInstance?.status === 'CONNECTED') {
        const link = `https://pizzasaas.app/rastreio?token=${targetOrder.trackingToken}`;
        const msg = `🛵 *${activeTenant.name}*: Oba! O entregador já saiu com seu pedido #${targetOrder.orderNumber}! Acompanhe ao vivo: ${link}`;
        setWhatsAppInstances(prev => prev.map(inst => {
          if (inst.id === activeWhatsAppInstance.id) {
            return {
              ...inst,
              logs: [{ id: `log-${Date.now()}`, phone: targetOrder.customerPhone, message: msg, timestamp: nowStr, status: 'DELIVERED' }, ...inst.logs]
            };
          }
          return inst;
        }));
      }
    }

    if (status === 'DELIVERED') {
      showNotification('Pedido Entregue com Sucesso!', `Pedido #${targetOrder.orderNumber} finalizado. Insumos baixados no estoque.`, 'success');

      setStockItems(currentStock => {
        let updated = [...currentStock];
        for (const item of targetOrder.items) {
          if (item.type === 'PIZZA') {
            const flavorIds = flavors.filter(f => item.flavors?.includes(f.name)).map(f => f.id);
            const sizeId = sizes.find(s => s.name === item.sizeName)?.id || 'size-grande';
            const crustId = crusts.find(c => c.name === item.crustName)?.id;

            const deductions = calculateDeductions(
              INITIAL_RECIPE_BOOK,
              sizeId,
              flavorIds,
              crustId,
              [],
              item.removals || []
            );

            for (const d of deductions) {
              updated = updated.map(stock => {
                if (stock.id === d.ingredientId) {
                  return {
                    ...stock,
                    currentStock: Math.max(0, Number((stock.currentStock - d.quantity * item.quantity).toFixed(2))),
                  };
                }
                return stock;
              });
            }
          }
        }
        return updated;
      });

      if (activeCashRegister) {
        const newMov = {
          id: `mov-${Date.now()}`,
          type: 'SALE' as const,
          amount: targetOrder.total,
          reason: `Venda Pedido #${targetOrder.orderNumber} (${targetOrder.paymentMethod})`,
          operatorName: currentUser.name,
          timestamp: nowStr,
        };

        setCashRegisters(prev => prev.map(cr => {
          if (cr.id === activeCashRegister.id) {
            return {
              ...cr,
              calculatedBalance: Number((cr.calculatedBalance + targetOrder.total).toFixed(2)),
              movements: [newMov, ...cr.movements]
            };
          }
          return cr;
        }));
      }
    }
  };

  const assignDriver = (orderId: string, driverId: string) => {
    const driver = users.find(u => u.id === driverId);
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          driverId,
          driverName: driver ? driver.name : 'Entregador Designado',
          status: 'OUT_FOR_DELIVERY',
        };
      }
      return o;
    }));
    showNotification('Entregador Atribuído', `Pedido despachado para ${driver?.name || 'entregador'}.`, 'info');
  };

  const updateDriverPosition = (orderId: string, lat: number, lng: number, speedKmH: number) => {
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          driverLocation: {
            lat,
            lng,
            heading: 180,
            speedKmH,
            updatedAt: nowStr,
          }
        };
      }
      return o;
    }));
  };

  const adjustStock = (ingredientId: string, newQty: number, _reason: string) => {
    const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setStockItems(prev => prev.map(s => {
      if (s.id === ingredientId) {
        return {
          ...s,
          currentStock: newQty,
          lastRestockedAt: nowStr,
        };
      }
      return s;
    }));
    showNotification('Estoque Ajustado', 'Ajuste manual de insumo registrado no histórico.', 'info');
  };

  const restockItem = (ingredientId: string, addQty: number) => {
    const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setStockItems(prev => prev.map(s => {
      if (s.id === ingredientId) {
        return {
          ...s,
          currentStock: Number((s.currentStock + addQty).toFixed(2)),
          lastRestockedAt: nowStr,
        };
      }
      return s;
    }));
    showNotification('Entrada de Mercadoria', `+${addQty} adicionado ao estoque do insumo.`, 'success');
  };

  const addCashMovement = (type: 'SANGRIA' | 'REFORCO', amount: number, reason: string) => {
    if (!activeCashRegister) return;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const diff = type === 'SANGRIA' ? -amount : amount;

    const newMov = {
      id: `mov-${Date.now()}`,
      type,
      amount,
      reason,
      operatorName: currentUser.name,
      timestamp: nowStr,
    };

    setCashRegisters(prev => prev.map(cr => {
      if (cr.id === activeCashRegister.id) {
        return {
          ...cr,
          calculatedBalance: Number((cr.calculatedBalance + diff).toFixed(2)),
          movements: [newMov, ...cr.movements]
        };
      }
      return cr;
    }));

    showNotification(type === 'SANGRIA' ? 'Sangria Efetuada' : 'Reforço de Caixa', `R$ ${amount.toFixed(2)} registrado com sucesso.`, 'info');
  };

  const openCashRegister = (initialBalance: number) => {
    const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newRegister: CashRegister = {
      id: `cash-${Date.now()}`,
      tenantId: activeTenant.id,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      status: 'OPEN',
      openedAt: nowStr,
      openingBalance: initialBalance,
      calculatedBalance: initialBalance,
      movements: [
        {
          id: `mov-${Date.now()}`,
          type: 'OPENING',
          amount: initialBalance,
          reason: 'Fundo de troco de abertura',
          operatorName: currentUser.name,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        }
      ]
    };

    setCashRegisters(prev => [newRegister, ...prev]);
    showNotification('Caixa Aberto', `Turno iniciado com fundo de R$ ${initialBalance.toFixed(2)}.`, 'success');
  };

  const closeCashRegister = (countedBalance: number, notes?: string) => {
    if (!activeCashRegister) return;
    const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const divergence = Number((countedBalance - activeCashRegister.calculatedBalance).toFixed(2));

    setCashRegisters(prev => prev.map(cr => {
      if (cr.id === activeCashRegister.id) {
        return {
          ...cr,
          status: 'CLOSED',
          closedAt: nowStr,
          closingBalance: countedBalance,
          divergence,
          notes,
        };
      }
      return cr;
    }));

    showNotification('Caixa Fechado', `Fechamento concluído. Divergência: R$ ${divergence.toFixed(2)}.`, divergence === 0 ? 'success' : 'warning');
  };

  const toggleWhatsAppTemplate = (templateId: string) => {
    if (!activeWhatsAppInstance) return;
    setWhatsAppInstances(prev => prev.map(inst => {
      if (inst.id === activeWhatsAppInstance.id) {
        return {
          ...inst,
          templates: inst.templates.map(t => t.id === templateId ? { ...t, enabled: !t.enabled } : t)
        };
      }
      return inst;
    }));
  };

  const sendWhatsAppManualMessage = (phone: string, text: string) => {
    if (!activeWhatsAppInstance) return;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setWhatsAppInstances(prev => prev.map(inst => {
      if (inst.id === activeWhatsAppInstance.id) {
        return {
          ...inst,
          logs: [{
            id: `log-${Date.now()}`,
            phone,
            message: text,
            timestamp: nowStr,
            status: 'SENT',
          }, ...inst.logs]
        };
      }
      return inst;
    }));

    showNotification('Mensagem WhatsApp Enviada', `Disparo simulado com sucesso para ${phone}.`, 'success');
  };

  const simulateIncomingWebhook = () => {
    showNotification('Webhook Evolution API', 'Evento "messages.upsert" recebido: Mensagem de cliente sincronizada.', 'info');
  };

  useEffect(() => {
    const deliveryOrder = orders.find(o => o.status === 'OUT_FOR_DELIVERY' && o.tenantId === activeTenant.id);
    if (!deliveryOrder || !deliveryOrder.driverLocation) return;

    const interval = setInterval(() => {
      setOrders(prev => prev.map(o => {
        if (o.id === deliveryOrder.id && o.status === 'OUT_FOR_DELIVERY' && o.driverLocation) {
          const targetLat = o.customerAddress.lat;
          const targetLng = o.customerAddress.lng;
          const currentLat = o.driverLocation.lat;
          const currentLng = o.driverLocation.lng;

          const newLat = currentLat + (targetLat - currentLat) * 0.12;
          const newLng = currentLng + (targetLng - currentLng) * 0.12;

          return {
            ...o,
            driverLocation: {
              lat: newLat,
              lng: newLng,
              heading: 182,
              speedKmH: Math.floor(28 + Math.random() * 8),
              updatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            }
          };
        }
        return o;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [orders, activeTenant.id]);

  return (
    <AppContext.Provider
      value={{
        tenants,
        activeTenant,
        setActiveTenant,
        updateTenantSettings,
        currentUser,
        setCurrentUser,
        users,
        currentView,
        setCurrentView,
        selectedTrackingToken,
        setSelectedTrackingToken,
        sizes,
        flavors: flavors.filter(f => f.tenantId === activeTenant.id),
        toggleFlavorAvailability,
        addFlavor,
        updateFlavorPrice,
        crusts: crusts.filter(c => c.tenantId === activeTenant.id),
        toggleCrustAvailability,
        products: products.filter(p => p.tenantId === activeTenant.id),
        toggleProductAvailability,
        orders: tenantOrders,
        activeOrdersCount,
        newPendingOrdersCount,
        createOrder,
        updateOrderStatus,
        assignDriver,
        updateDriverPosition,
        tables: tables.filter(t => t.tenantId === activeTenant.id),
        updateTableStatus,
        addTableOrder,
        closeTableComanda,
        deliveryZones: deliveryZones.filter(z => z.tenantId === activeTenant.id),
        addDeliveryZone,
        toggleDeliveryZone,
        removeDeliveryZone,
        coupons: coupons.filter(c => c.tenantId === activeTenant.id),
        applyCouponCode,
        stockItems: stockItems.filter(s => s.tenantId === activeTenant.id),
        criticalStockCount,
        adjustStock,
        restockItem,
        activeCashRegister,
        cashRegisters: cashRegisters.filter(c => c.tenantId === activeTenant.id),
        addCashMovement,
        openCashRegister,
        closeCashRegister,
        activeWhatsAppInstance,
        toggleWhatsAppTemplate,
        sendWhatsAppManualMessage,
        simulateIncomingWebhook,
        customers: customers.filter(c => c.tenantId === activeTenant.id),
        addCustomer,
        updateCustomerPoints,
        createTenant,
        soundEnabled,
        toggleSound,
        triggerChime,
        notification,
        dismissNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider');
  return context;
};
