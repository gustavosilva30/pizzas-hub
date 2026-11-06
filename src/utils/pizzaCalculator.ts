export interface PizzaSizeConfig {
  id: string;
  name: string;
  slices: number;
  maxFlavors: number;
  basePrice: number;
  priceRule: 'HIGHEST_VALUE' | 'AVERAGE';
}

export interface FlavorConfig {
  id: string;
  name: string;
  additionalPrice: number;
}

export interface CrustConfig {
  id: string;
  name: string;
  price: number;
  ingredientId?: string;
  quantityGrams?: number;
}

export interface AdditionConfig {
  id: string;
  name: string;
  price: number;
  ingredientId?: string;
  quantityGrams?: number;
}

export interface IngredientRecipe {
  ingredientId: string;
  name: string;
  unit: 'g' | 'ml' | 'un';
  quantity: number;
  costPerUnit: number;
}

export interface RecipeBook {
  baseDough: Record<string, IngredientRecipe[]>;
  flavors: Record<string, Record<string, IngredientRecipe[]>>;
  crusts: Record<string, IngredientRecipe[]>;
  additions: Record<string, IngredientRecipe[]>;
}

export function calculatePizzaPrice(
  size: PizzaSizeConfig,
  selectedFlavors: FlavorConfig[],
  crust?: CrustConfig | null,
  additions: AdditionConfig[] = []
): number {
  if (selectedFlavors.length === 0) {
    return size.basePrice;
  }

  let flavorPortionPrice = 0;

  if (size.priceRule === 'HIGHEST_VALUE') {
    const maxAdditional = Math.max(...selectedFlavors.map(f => f.additionalPrice));
    flavorPortionPrice = size.basePrice + maxAdditional;
  } else {
    const totalAdditional = selectedFlavors.reduce((acc, f) => acc + f.additionalPrice, 0);
    const avgAdditional = totalAdditional / selectedFlavors.length;
    flavorPortionPrice = size.basePrice + avgAdditional;
  }

  const crustPrice = crust ? crust.price : 0;
  const additionsPrice = additions.reduce((acc, a) => acc + a.price, 0);

  return Number((flavorPortionPrice + crustPrice + additionsPrice).toFixed(2));
}

export interface StockDeductionItem {
  ingredientId: string;
  name: string;
  unit: 'g' | 'ml' | 'un';
  quantity: number;
  totalCost: number;
}

export function calculateDeductions(
  recipeBook: RecipeBook,
  sizeId: string,
  selectedFlavorIds: string[],
  crustId?: string | null,
  additionIds: string[] = [],
  removals: string[] = []
): StockDeductionItem[] {
  const deductionsMap = new Map<string, StockDeductionItem>();

  const addDeduction = (item: StockDeductionItem) => {
    if (removals.some(r => item.name.toLowerCase().includes(r.toLowerCase()))) {
      return;
    }

    const existing = deductionsMap.get(item.ingredientId);
    if (existing) {
      existing.quantity += item.quantity;
      existing.totalCost += item.totalCost;
    } else {
      deductionsMap.set(item.ingredientId, { ...item });
    }
  };

  const baseDoughItems = recipeBook.baseDough[sizeId] || [];
  for (const dough of baseDoughItems) {
    addDeduction({
      ingredientId: dough.ingredientId,
      name: dough.name,
      unit: dough.unit,
      quantity: dough.quantity,
      totalCost: dough.quantity * dough.costPerUnit,
    });
  }

  if (selectedFlavorIds.length > 0) {
    const fraction = 1 / selectedFlavorIds.length;
    for (const flavorId of selectedFlavorIds) {
      const flavorSizeRecipes = recipeBook.flavors[flavorId]?.[sizeId] || [];
      for (const recipe of flavorSizeRecipes) {
        const qty = recipe.quantity * fraction;
        addDeduction({
          ingredientId: recipe.ingredientId,
          name: recipe.name,
          unit: recipe.unit,
          quantity: Number(qty.toFixed(2)),
          totalCost: Number((qty * recipe.costPerUnit).toFixed(4)),
        });
      }
    }
  }

  if (crustId && recipeBook.crusts[crustId]) {
    for (const crustRecipe of recipeBook.crusts[crustId]) {
      addDeduction({
        ingredientId: crustRecipe.ingredientId,
        name: crustRecipe.name,
        unit: crustRecipe.unit,
        quantity: crustRecipe.quantity,
        totalCost: crustRecipe.quantity * crustRecipe.costPerUnit,
      });
    }
  }

  for (const addId of additionIds) {
    const addRecipes = recipeBook.additions[addId] || [];
    for (const addRecipe of addRecipes) {
      addDeduction({
        ingredientId: addRecipe.ingredientId,
        name: addRecipe.name,
        unit: addRecipe.unit,
        quantity: addRecipe.quantity,
        totalCost: addRecipe.quantity * addRecipe.costPerUnit,
      });
    }
  }

  return Array.from(deductionsMap.values());
}

export const DEFAULT_PAYMENT_RATES: Record<string, number> = {
  CREDIT_CARD: 0.0299,
  DEBIT_CARD: 0.0149,
  PIX: 0.0000,
  CASH: 0.0000,
};

export function calculateNetReceivable(
  grossAmount: number,
  paymentMethod: string,
  customRates = DEFAULT_PAYMENT_RATES
): { grossAmount: number; fee: number; netAmount: number } {
  const rate = customRates[paymentMethod] ?? 0;
  const fee = Number((grossAmount * rate).toFixed(2));
  const netAmount = Number((grossAmount - fee).toFixed(2));
  return { grossAmount, fee, netAmount };
}

export interface DREResult {
  grossRevenue: number;
  gatewayFees: number;
  netRevenue: number;
  cmvTotal: number;
  grossMargin: number;
  fixedCosts: number;
  netProfit: number;
  cmvPercentage: number;
  marginPercentage: number;
}

export function calculateDRE(
  orders: Array<{ total: number; paymentMethod: string; cmv: number; status: string }>,
  fixedCosts: number
): DREResult {
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  
  let grossRevenue = 0;
  let gatewayFees = 0;
  let cmvTotal = 0;

  for (const order of completedOrders) {
    grossRevenue += order.total;
    const { fee } = calculateNetReceivable(order.total, order.paymentMethod);
    gatewayFees += fee;
    cmvTotal += order.cmv;
  }

  grossRevenue = Number(grossRevenue.toFixed(2));
  gatewayFees = Number(gatewayFees.toFixed(2));
  cmvTotal = Number(cmvTotal.toFixed(2));

  const netRevenue = Number((grossRevenue - gatewayFees).toFixed(2));
  const grossMargin = Number((netRevenue - cmvTotal).toFixed(2));
  const netProfit = Number((grossMargin - fixedCosts).toFixed(2));

  const cmvPercentage = netRevenue > 0 ? Number(((cmvTotal / netRevenue) * 100).toFixed(1)) : 0;
  const marginPercentage = netRevenue > 0 ? Number(((grossMargin / netRevenue) * 100).toFixed(1)) : 0;

  return {
    grossRevenue,
    gatewayFees,
    netRevenue,
    cmvTotal,
    grossMargin,
    fixedCosts,
    netProfit,
    cmvPercentage,
    marginPercentage,
  };
}
