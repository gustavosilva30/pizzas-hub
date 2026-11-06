import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { PizzaSize, PizzaFlavor, PizzaCrust, ProductItem, OrderItem, Order } from '../../types/index.ts';
import { calculatePizzaPrice } from '../../utils/pizzaCalculator.ts';
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  CreditCard,
  QrCode,
  Banknote,
  AlertCircle,
  Percent,
  RotateCcw,
  History,
} from 'lucide-react';

export const CustomerCatalogView: React.FC = () => {
  const {
    activeTenant,
    sizes,
    flavors,
    crusts,
    products,
    createOrder,
    setCurrentView,
    setSelectedTrackingToken,
    coupons,
    applyCouponCode,
    orders,
  } = useApp();

  // Estados do Modal Customizador de Pizza
  const [selectedSize, setSelectedSize] = useState<PizzaSize>(sizes[2] || sizes[0]); // Padrão: Grande
  const [selectedFlavors, setSelectedFlavors] = useState<PizzaFlavor[]>([flavors[0]]);
  const [selectedCrust, setSelectedCrust] = useState<PizzaCrust>(crusts[0]);
  const [removals, setRemovals] = useState<string[]>([]);
  const [pizzaNotes, setPizzaNotes] = useState('');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Estados do Carrinho & Cupom
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; success: boolean } | null>(null);

  // Histórico de Pedidos do Cliente
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);

  // Estados do Checkout
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderType, setOrderType] = useState<'DELIVERY' | 'TAKEOUT'>('DELIVERY');
  const [customerName, setCustomerName] = useState('Mariana Castro');
  const [customerPhone, setCustomerPhone] = useState('(11) 98455-8899');
  const [street, setStreet] = useState('Rua Bela Cintra');
  const [number, setNumber] = useState('850');
  const [neighborhood, setNeighborhood] = useState('Consolação');
  const [complement, setComplement] = useState('Apto 41');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH'>('PIX');
  const [changeFor, setChangeFor] = useState('');

  // Categoria ativa de visualização
  const [activeCategory, setActiveCategory] = useState<'pizzas' | 'bebidas' | 'entradas'>('pizzas');

  // Preço calculado da pizza sendo montada
  const currentPizzaPrice = calculatePizzaPrice(
    selectedSize,
    selectedFlavors,
    selectedCrust.price > 0 ? selectedCrust : null,
    []
  );

  // Manipulação de sabores no customizador
  const handleToggleFlavor = (flavor: PizzaFlavor) => {
    const exists = selectedFlavors.some(f => f.id === flavor.id);
    if (exists) {
      if (selectedFlavors.length > 1) {
        setSelectedFlavors(selectedFlavors.filter(f => f.id !== flavor.id));
      }
    } else {
      if (selectedFlavors.length < selectedSize.maxFlavors) {
        setSelectedFlavors([...selectedFlavors, flavor]);
      } else {
        // Substitui o último sabor se atingiu o limite
        const updated = [...selectedFlavors.slice(0, selectedSize.maxFlavors - 1), flavor];
        setSelectedFlavors(updated);
      }
    }
  };

  const handleToggleRemoval = (ingredientName: string) => {
    if (removals.includes(ingredientName)) {
      setRemovals(removals.filter(r => r !== ingredientName));
    } else {
      setRemovals([...removals, ingredientName]);
    }
  };

  // Adiciona a pizza montada ao carrinho
  const handleAddPizzaToCart = () => {
    const flavorNames = selectedFlavors.map(f => f.name);
    const title = flavorNames.length === 1
      ? `Pizza ${selectedSize.name} - ${flavorNames[0]}`
      : `Pizza ${selectedSize.name} (${flavorNames.map((n, i) => `1/${flavorNames.length} ${n}`).join(' + ')})`;

    const newItem: OrderItem = {
      id: `cart-${Date.now()}`,
      type: 'PIZZA',
      title,
      sizeName: selectedSize.name,
      flavors: flavorNames,
      crustName: selectedCrust.name,
      removals: removals.length > 0 ? removals : undefined,
      notes: pizzaNotes || undefined,
      quantity: 1,
      unitPrice: currentPizzaPrice,
      totalPrice: currentPizzaPrice,
      cmvCost: Number((currentPizzaPrice * 0.32).toFixed(2)), // Custo estimado de 32%
    };

    setCartItems(prev => [...prev, newItem]);
    setIsCustomizerOpen(false);
    setIsCartOpen(true);
    setPizzaNotes('');
    setRemovals([]);
  };

  // Adiciona produto simples (refrigerante, entrada)
  const handleAddSimpleProduct = (prod: ProductItem) => {
    const existing = cartItems.find(i => i.title === prod.name);
    if (existing) {
      setCartItems(cartItems.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice } : i));
    } else {
      const newItem: OrderItem = {
        id: `cart-prod-${Date.now()}`,
        type: 'SIMPLE',
        title: prod.name,
        quantity: 1,
        unitPrice: prod.price,
        totalPrice: prod.price,
        cmvCost: Number((prod.price * 0.45).toFixed(2)),
      };
      setCartItems(prev => [...prev, newItem]);
    }
    setIsCartOpen(true);
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCartItems(prev => {
      return prev
        .map(i => {
          if (i.id === itemId) {
            const newQty = i.quantity + delta;
            return {
              ...i,
              quantity: newQty,
              totalPrice: Number((newQty * i.unitPrice).toFixed(2)),
            };
          }
          return i;
        })
        .filter(i => i.quantity > 0);
    });
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code) return;

    const res = applyCouponCode(code, cartSubtotal);
    if (res.success) {
      setAppliedCoupon(code.toUpperCase());
      setDiscountAmount(res.discount);
      setCouponFeedback({ msg: res.message, success: true });
    } else {
      setCouponFeedback({ msg: res.message, success: false });
    }
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const deliveryFee = orderType === 'DELIVERY'
    ? (cartSubtotal >= activeTenant.settings.freeDeliveryAbove ? 0 : activeTenant.settings.deliveryFee)
    : 0;
  const cartTotal = Math.max(0, Number((cartSubtotal + deliveryFee - discountAmount).toFixed(2)));

  // Finaliza Pedido
  const handleConfirmOrder = () => {
    if (cartItems.length === 0) return;

    const newOrder = createOrder({
      tenantId: activeTenant.id,
      customerName,
      customerPhone,
      customerAddress: {
        street,
        number,
        neighborhood,
        complement,
        lat: activeTenant.address.lat + (Math.random() - 0.5) * 0.02,
        lng: activeTenant.address.lng + (Math.random() - 0.5) * 0.02,
      },
      type: orderType,
      status: 'PENDING',
      items: cartItems,
      subtotal: cartSubtotal,
      deliveryFee,
      discount: discountAmount,
      total: cartTotal,
      cmvTotal: Number((cartSubtotal * 0.33).toFixed(2)),
      paymentMethod,
      paymentStatus: paymentMethod === 'PIX' ? 'PAID' : 'PENDING_ON_DELIVERY',
      changeFor: changeFor ? Number(changeFor) : undefined,
      estimatedDeliveryTime: new Date(Date.now() + 40 * 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });

    setCartItems([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponFeedback(null);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setSelectedTrackingToken(newOrder.trackingToken);
    setCurrentView('CUSTOMER_TRACKING');
  };

  // Repetir pedido anterior com 1 clique
  const handleRepeatOrder = (pastOrder: Order) => {
    const repeatedItems: OrderItem[] = pastOrder.items.map((item, idx) => ({
      ...item,
      id: `cart-repeat-${Date.now()}-${idx}`,
    }));
    setCartItems(repeatedItems);
    setIsMyOrdersOpen(false);
    setIsCartOpen(true);
  };

  // Pedidos anteriores do cliente na pizzaria atual
  const pastOrders = orders.filter(o => o.tenantId === activeTenant.id);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Banner Principal da Pizzaria Ativa */}
      <div
        className="text-white pt-8 pb-10 px-4 sm:px-6 relative overflow-hidden shadow-sm"
        style={{ backgroundColor: activeTenant.brandColor }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black tracking-tight">{activeTenant.name}</span>
              <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-0.5 rounded font-semibold">
                {activeTenant.isOpen ? 'Aberto Agora' : 'Fechado'}
              </span>
            </div>
            <p className="text-white/80 text-sm max-w-lg font-medium">{activeTenant.tagline}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 mt-3">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {activeTenant.settings.estimatedPrepTimeMinutes} - {activeTenant.settings.estimatedPrepTimeMinutes + 15} min
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                Entrega: R$ {activeTenant.settings.deliveryFee.toFixed(2)} (Grátis acima de R$ {activeTenant.settings.freeDeliveryAbove.toFixed(2)})
              </span>
              <span className="text-white/70">
                Mínimo: R$ {activeTenant.settings.minOrderValue.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMyOrdersOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold px-3.5 py-3 rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer active:scale-95"
            >
              <History className="w-4 h-4 text-white" />
              <span>Meus Pedidos ({pastOrders.length})</span>
            </button>
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold px-5 py-3 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 text-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Montar Minha Pizza
            </button>
          </div>
        </div>
      </div>

      {/* Navegação de Categorias do Cardápio */}
      <div className="sticky top-14 bg-white border-b border-slate-200 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-2 py-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('pizzas')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'pizzas'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🍕 Pizzas & Sabores
          </button>
          <button
            onClick={() => setActiveCategory('bebidas')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'bebidas'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🥤 Bebidas Geladas
          </button>
          <button
            onClick={() => setActiveCategory('entradas')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'entradas'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🥖 Entradas & Cornicione
          </button>
        </div>
      </div>

      {/* Conteúdo do Cardápio */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeCategory === 'pizzas' && (
          <div>
            {/* Card de Destaque para Montar Pizza */}
            <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent p-5 rounded-2xl border border-amber-200/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span>🍕</span> Monte sua Pizza de até 4 Sabores
                </h3>
                <p className="text-slate-600 text-xs mt-1">
                  Escolha o tamanho, combine seus sabores favoritos e adicione borda recheada artesanal.
                </p>
                <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold mt-2">
                  <Percent className="w-3.5 h-3.5" />
                  Regra da casa: {activeTenant.settings.priceRule === 'HIGHEST_VALUE' ? 'Cobrado pelo sabor de maior valor' : 'Cobrado pela média dos sabores'}
                </div>
              </div>
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all"
              >
                Personalizar Pizza
              </button>
            </div>

            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">
              Sabores Disponíveis no Cardápio
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {flavors.map(flavor => (
                <div
                  key={flavor.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{flavor.name}</h4>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {flavor.category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">{flavor.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {flavor.ingredients.map((ing, idx) => (
                        <span key={idx} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">
                      {flavor.additionalPrice > 0 ? `+ R$ ${flavor.additionalPrice.toFixed(2)} (Especial)` : 'Incluso na base'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedFlavors([flavor]);
                        setIsCustomizerOpen(true);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Escolher
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeCategory === 'bebidas' || activeCategory === 'entradas') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products
              .filter(p => p.categoryId === activeCategory)
              .map(prod => (
                <div
                  key={prod.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{prod.name}</h4>
                    <p className="text-slate-500 text-xs mt-0.5">{prod.description}</p>
                    <span className="font-extrabold text-slate-900 text-sm block mt-2 font-mono">
                      R$ {prod.price.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddSimpleProduct(prod)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs shadow-xs flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar (Quando houver itens) */}
      {cartItems.length > 0 && !isCartOpen && !isCheckoutOpen && !isCustomizerOpen && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between hover:bg-slate-800 transition-all font-bold text-sm border border-slate-800"
          >
            <div className="flex items-center gap-3">
              <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-extrabold">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
              <span>Ver Pedido</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold text-amber-400">
                R$ {cartTotal.toFixed(2)}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* MODAL 1: CUSTOMIZADOR DE PIZZA */}
      {isCustomizerOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom">
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-base">Monte sua Pizza Artesanal</h3>
                <p className="text-xs text-slate-500">Longa fermentação no forno a lenha</p>
              </div>
              <button
                onClick={() => setIsCustomizerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Customizador */}
            <div className="p-5 overflow-y-auto space-y-6">
              {/* Etapa 1: Tamanho */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 tracking-wider mb-2">
                  1. Escolha o Tamanho
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {sizes.map(sz => (
                    <button
                      key={sz.id}
                      onClick={() => {
                        setSelectedSize(sz);
                        if (selectedFlavors.length > sz.maxFlavors) {
                          setSelectedFlavors(selectedFlavors.slice(0, sz.maxFlavors));
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedSize.id === sz.id
                          ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">{sz.name}</div>
                      <div className="text-[11px] text-slate-500">Até {sz.maxFlavors} sabores</div>
                      <div className="text-xs font-mono font-extrabold text-slate-900 mt-2">
                        R$ {sz.basePrice.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Etapa 2: Sabores */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-extrabold uppercase text-slate-700 tracking-wider">
                    2. Escolha os Sabores ({selectedFlavors.length}/{selectedSize.maxFlavors})
                  </label>
                  {selectedFlavors.length > 1 && (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      Pizza Dividida ({selectedFlavors.map((_, i) => `1/${selectedFlavors.length}`).join(' + ')})
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {flavors.map(flavor => {
                    const isSelected = selectedFlavors.some(f => f.id === flavor.id);
                    return (
                      <div
                        key={flavor.id}
                        onClick={() => handleToggleFlavor(flavor)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs flex items-center gap-2">
                            {flavor.name}
                            {flavor.additionalPrice > 0 && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'}`}>
                                + R$ {flavor.additionalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {flavor.ingredients.join(', ')}
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ml-2 ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'border border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Etapa 3: Borda Recheada */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 tracking-wider mb-2">
                  3. Borda Recheada (Opcional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {crusts.map(crust => (
                    <button
                      key={crust.id}
                      onClick={() => setSelectedCrust(crust)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        selectedCrust.id === crust.id
                          ? 'border-amber-500 bg-amber-50/50 font-bold'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{crust.name}</span>
                      <span className="font-mono text-slate-700 font-bold">
                        {crust.price > 0 ? `+ R$ ${crust.price.toFixed(2)}` : 'Grátis'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Etapa 4: Remoções e Observações */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 tracking-wider mb-2">
                  4. Alguma preferência especial?
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Cebola', 'Orégano', 'Azeitonas', 'Alho'].map(ing => {
                    const isRemoved = removals.includes(ing);
                    return (
                      <button
                        key={ing}
                        onClick={() => handleToggleRemoval(ing)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                          isRemoved
                            ? 'bg-rose-50 border-rose-300 text-rose-700 line-through'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Sem {ing}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  placeholder="Ex: Massa bem fininha, pouco queijo na borda..."
                  value={pizzaNotes}
                  onChange={e => setPizzaNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Footer Modal com Preço Calculado */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500">Valor da Pizza</div>
                <div className="text-lg font-mono font-black text-slate-900">
                  R$ {currentPizzaPrice.toFixed(2)}
                </div>
              </div>

              <button
                onClick={handleAddPizzaToCart}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL 2: CARRINHO E CHECKOUT */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            {/* Header Carrinho */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-base">Seu Carrinho</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Itens do Carrinho */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-[1.5] mb-2 opacity-60" />
                  <p className="text-sm font-semibold">Seu carrinho está vazio</p>
                  <p className="text-xs mt-1">Escolha suas pizzas e bebidas favoritas</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                        {item.crustName && item.crustName !== 'Tradicional (Sem recheio na borda)' && (
                          <div className="text-[11px] text-amber-700 font-medium">{item.crustName}</div>
                        )}
                        {item.removals && item.removals.length > 0 && (
                          <div className="text-[10px] text-rose-600">Sem: {item.removals.join(', ')}</div>
                        )}
                        {item.notes && (
                          <div className="text-[10px] text-slate-500 italic">Obs: {item.notes}</div>
                        )}
                      </div>
                      <span className="font-mono font-bold text-xs text-slate-900">
                        R$ {item.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Resumo e Botão Avançar */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                {/* Campo de Cupom de Desconto */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <Percent className="w-3.5 h-3.5 text-amber-500" />
                    <span>Cupom de Desconto</span>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Ex: PRIMEIRACOMPRA"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase"
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>

                  {couponFeedback && (
                    <div className={`text-[10px] font-bold ${couponFeedback.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {couponFeedback.msg}
                    </div>
                  )}

                  {/* Cupons Sugeridos */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {coupons.slice(0, 3).map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCouponCode(c.code);
                          handleApplyCoupon(c.code);
                        }}
                        className="text-[9px] font-mono font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">R$ {cartSubtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Desconto ({appliedCoupon}):</span>
                      <span className="font-mono">- R$ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Taxa de Entrega:</span>
                    <span className="font-mono">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold">Grátis</span>
                      ) : (
                        `R$ ${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total:</span>
                    <span className="font-mono text-base text-amber-600">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Continuar para Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: CHECKOUT FINAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-slate-900 text-base">Finalizar Pedido</h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Modalidade de Entrega */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">Como deseja receber?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderType('DELIVERY')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      orderType === 'DELIVERY'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🛵 Entrega em Domicílio
                  </button>
                  <button
                    onClick={() => setOrderType('TAKEOUT')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      orderType === 'TAKEOUT'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🛍️ Retirada no Balcão
                  </button>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Seus Dados de Contato</label>
                <input
                  type="text"
                  placeholder="Nome Completo"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="text"
                  placeholder="WhatsApp com DDD (Ex: 11 98455-8899)"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Endereço (se entrega) */}
              {orderType === 'DELIVERY' && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">Endereço de Entrega</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Rua / Avenida"
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      className="col-span-2 p-2.5 border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      value={number}
                      onChange={e => setNumber(e.target.value)}
                      className="p-2.5 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={neighborhood}
                      onChange={e => setNeighborhood(e.target.value)}
                      className="p-2.5 border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Complemento (Apto, Bloco)"
                      value={complement}
                      onChange={e => setComplement(e.target.value)}
                      className="p-2.5 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Meio de Pagamento */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      paymentMethod === 'PIX' ? 'border-amber-500 bg-amber-50/50 font-bold' : 'border-slate-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>PIX Instantâneo</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      paymentMethod === 'CREDIT_CARD' ? 'border-amber-500 bg-amber-50/50 font-bold' : 'border-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>Cartão de Crédito</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('DEBIT_CARD')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      paymentMethod === 'DEBIT_CARD' ? 'border-amber-500 bg-amber-50/50 font-bold' : 'border-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-cyan-600" />
                    <span>Cartão de Débito</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      paymentMethod === 'CASH' ? 'border-amber-500 bg-amber-50/50 font-bold' : 'border-slate-200'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-amber-600" />
                    <span>Dinheiro</span>
                  </button>
                </div>

                {paymentMethod === 'CASH' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Precisa de troco para quanto? (Ex: 100)"
                      value={changeFor}
                      onChange={e => setChangeFor(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé de Confirmação */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500">Total a Pagar:</span>
                <span className="block text-base font-black font-mono text-slate-900">
                  R$ {cartTotal.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleConfirmOrder}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                Confirmar e Acompanhar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Meus Pedidos & Repetir Pedido */}
      {isMyOrdersOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm">Meus Pedidos Anteriores</h3>
              </div>
              <button
                onClick={() => setIsMyOrdersOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {pastOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold text-slate-600">Nenhum pedido anterior encontrado</p>
                  <p className="text-xs text-slate-400 mt-1">Seus pedidos realizados nesta pizzaria aparecerão aqui para você repetir com 1 clique.</p>
                </div>
              ) : (
                pastOrders.map(order => (
                  <div key={order.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">Pedido #{order.id.slice(-6)}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        R$ {order.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Itens do Pedido */}
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-600 flex justify-between">
                          <span>{item.quantity}x {item.title}</span>
                          <span className="font-mono text-slate-500">R$ {item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedTrackingToken(order.trackingToken);
                          setCurrentView('CUSTOMER_TRACKING');
                          setIsMyOrdersOpen(false);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Acompanhar Rastreio
                      </button>

                      <button
                        onClick={() => handleRepeatOrder(order)}
                        className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Pedir Novamente com 1 Clique
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
              <span className="text-[11px] text-slate-500">
                Os itens do pedido serão adicionados diretamente ao seu carrinho com os mesmos sabores e bordas.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
