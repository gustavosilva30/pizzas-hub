export type UserRole =
  | 'SUPER_ADMIN'
  | 'PIZZERIA_ADMIN'
  | 'MANAGER'
  | 'ATTENDANT'
  | 'CASHIER'
  | 'KITCHEN'
  | 'STOCK_KEEPER'
  | 'DRIVER';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  brandColor: string; // Hex color (ex: '#E11D48' ou '#EA580C')
  tagline: string;
  cnpj: string;
  phone: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    lat: number;
    lng: number;
  };
  settings: {
    deliveryFee: number;
    freeDeliveryAbove: number;
    minOrderValue: number;
    priceRule: 'HIGHEST_VALUE' | 'AVERAGE';
    autoConfirmOrders: boolean;
    estimatedPrepTimeMinutes: number;
  };
  openingHours: string;
  isOpen: boolean;
  plan?: 'STARTER' | 'PRO' | 'ENTERPRISE';
  planPrice?: number;
  subscriptionStatus?: 'ACTIVE' | 'TRIAL' | 'PAST_DUE';
  createdAt?: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  active: boolean;
}

export interface PizzaSize {
  id: string;
  tenantId: string;
  name: string;
  slices: number;
  maxFlavors: number;
  basePrice: number;
  priceRule: 'HIGHEST_VALUE' | 'AVERAGE';
}

export interface PizzaFlavor {
  id: string;
  tenantId: string;
  name: string;
  category: 'Tradicional' | 'Especial' | 'Doce' | 'Premium';
  description: string;
  additionalPrice: number;
  ingredients: string[];
  isAvailable: boolean;
}

export interface PizzaCrust {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface ProductItem {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  type: 'PIZZA' | 'SIMPLE';
  title: string;
  sizeName?: string;
  flavors?: string[];
  crustName?: string;
  removals?: string[];
  notes?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  cmvCost: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: number;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
    referencePoint?: string;
    lat: number;
    lng: number;
  };
  type: 'DELIVERY' | 'TAKEOUT' | 'DINE_IN';
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  cmvTotal: number;
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH';
  paymentStatus: 'PAID' | 'PENDING_ON_DELIVERY';
  changeFor?: number;
  driverId?: string;
  driverName?: string;
  trackingToken: string;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime: string;
  cancellationReason?: string;
  driverLocation?: {
    lat: number;
    lng: number;
    heading: number;
    speedKmH: number;
    updatedAt: string;
  };
}

export interface StockItem {
  id: string;
  tenantId: string;
  name: string;
  category: 'Massa & Grãos' | 'Laticínios' | 'Carnes & Embutidos' | 'Molhos & Vegetais' | 'Embalagens' | 'Bebidas';
  unit: 'g' | 'ml' | 'un';
  currentStock: number;
  minStock: number;
  costPerUnit: number;
  supplier: string;
  lastRestockedAt: string;
}

export interface CashMovement {
  id: string;
  type: 'OPENING' | 'SANGRIA' | 'REFORCO' | 'SALE' | 'CLOSING';
  amount: number;
  reason: string;
  operatorName: string;
  timestamp: string;
}

export interface CashRegister {
  id: string;
  tenantId: string;
  operatorId: string;
  operatorName: string;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  calculatedBalance: number;
  divergence?: number;
  movements: CashMovement[];
}

export interface WhatsAppTemplate {
  id: string;
  trigger: 'ORDER_CONFIRMED' | 'ORDER_PREPARING' | 'ORDER_OUT_FOR_DELIVERY' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED';
  title: string;
  template: string;
  enabled: boolean;
}

export interface WhatsAppInstance {
  id: string;
  tenantId: string;
  instanceName: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SCAN_QR_CODE';
  connectedNumber: string;
  batteryLevel: number;
  qrCodeMock?: string;
  templates: WhatsAppTemplate[];
  logs: Array<{
    id: string;
    phone: string;
    message: string;
    timestamp: string;
    status: 'SENT' | 'DELIVERED' | 'FAILED';
  }>;
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'BILL_REQUESTED' | 'RESERVED';

export interface DineInTable {
  id: string;
  tenantId: string;
  number: number;
  name: string;
  capacity: number;
  status: TableStatus;
  waiterName?: string;
  customerName?: string;
  guestsCount?: number;
  openedAt?: string;
  orderId?: string;
  notes?: string;
}

export interface DeliveryZone {
  id: string;
  tenantId: string;
  neighborhood: string;
  fee: number;
  estimatedMinutes: number;
  active: boolean;
}

export interface Coupon {
  id: string;
  tenantId: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderValue: number;
  description: string;
  active: boolean;
  usageCount: number;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
  };
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
  notes?: string;
}
