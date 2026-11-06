import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePizzaPrice,
  calculateDeductions,
  calculateNetReceivable,
  calculateDRE,
  PizzaSizeConfig,
  FlavorConfig,
  RecipeBook
} from './pizzaCalculator.ts';

test('Cálculo de preço de pizza pela regra do MAIOR VALOR com dois sabores e borda', () => {
  const size: PizzaSizeConfig = {
    id: 'size-grande',
    name: 'Grande (8 fatias)',
    slices: 8,
    maxFlavors: 2,
    basePrice: 50.00,
    priceRule: 'HIGHEST_VALUE',
  };

  const flavorTradicional: FlavorConfig = {
    id: 'flavor-calabresa',
    name: 'Calabresa Artesanal',
    additionalPrice: 0.00,
  };

  const flavorPremium: FlavorConfig = {
    id: 'flavor-camarao',
    name: 'Camarão com Catupiry',
    additionalPrice: 16.00,
  };

  const crust = {
    id: 'crust-catupiry',
    name: 'Borda Recheada Catupiry',
    price: 12.00,
  };

  const totalPrice = calculatePizzaPrice(size, [flavorTradicional, flavorPremium], crust);
  assert.equal(totalPrice, 78.00);
});

test('Cálculo de preço de pizza pela regra da MÉDIA com dois sabores', () => {
  const size: PizzaSizeConfig = {
    id: 'size-media',
    name: 'Média (6 fatias)',
    slices: 6,
    maxFlavors: 2,
    basePrice: 40.00,
    priceRule: 'AVERAGE',
  };

  const f1: FlavorConfig = { id: 'f1', name: 'Mussarela', additionalPrice: 0.00 };
  const f2: FlavorConfig = { id: 'f2', name: 'Quatro Queijos', additionalPrice: 10.00 };

  const totalPrice = calculatePizzaPrice(size, [f1, f2]);
  assert.equal(totalPrice, 45.00);
});

test('Dedução de insumos da ficha técnica (BOM) fracionada meio a meio e com remoção de cebola', () => {
  const recipeBook: RecipeBook = {
    baseDough: {
      'size-grande': [
        { ingredientId: 'ing-farinha', name: 'Farinha de Trigo Especial', unit: 'g', quantity: 350, costPerUnit: 0.006 },
        { ingredientId: 'ing-molho', name: 'Molho de Tomate Pelati', unit: 'g', quantity: 120, costPerUnit: 0.015 },
      ]
    },
    flavors: {
      'flavor-calabresa': {
        'size-grande': [
          { ingredientId: 'ing-mussarela', name: 'Queijo Mussarela', unit: 'g', quantity: 200, costPerUnit: 0.045 },
          { ingredientId: 'ing-calabresa', name: 'Calabresa Defumada Fatiada', unit: 'g', quantity: 200, costPerUnit: 0.038 },
          { ingredientId: 'ing-cebola', name: 'Cebola Fatiada', unit: 'g', quantity: 60, costPerUnit: 0.008 },
        ]
      },
      'flavor-quatro-queijos': {
        'size-grande': [
          { ingredientId: 'ing-mussarela', name: 'Queijo Mussarela', unit: 'g', quantity: 150, costPerUnit: 0.045 },
          { ingredientId: 'ing-gorgonzola', name: 'Gorgonzola', unit: 'g', quantity: 80, costPerUnit: 0.075 },
          { ingredientId: 'ing-provolone', name: 'Provolone', unit: 'g', quantity: 80, costPerUnit: 0.065 },
        ]
      }
    },
    crusts: {
      'crust-catupiry': [
        { ingredientId: 'ing-catupiry', name: 'Requeijão Catupiry Original', unit: 'g', quantity: 180, costPerUnit: 0.042 }
      ]
    },
    additions: {}
  };

  const deductions = calculateDeductions(
    recipeBook,
    'size-grande',
    ['flavor-calabresa', 'flavor-quatro-queijos'],
    'crust-catupiry',
    [],
    ['Cebola']
  );

  const farinha = deductions.find(d => d.ingredientId === 'ing-farinha');
  assert.ok(farinha);
  assert.equal(farinha.quantity, 350);

  const calabresa = deductions.find(d => d.ingredientId === 'ing-calabresa');
  assert.ok(calabresa);
  assert.equal(calabresa.quantity, 100);

  const cebola = deductions.find(d => d.ingredientId === 'ing-cebola');
  assert.equal(cebola, undefined);

  const mussarela = deductions.find(d => d.ingredientId === 'ing-mussarela');
  assert.ok(mussarela);
  assert.equal(mussarela.quantity, 175);

  const catupiry = deductions.find(d => d.ingredientId === 'ing-catupiry');
  assert.ok(catupiry);
  assert.equal(catupiry.quantity, 180);
});

test('Cálculo de taxas de cartão e DRE gerencial com CMV', () => {
  const { grossAmount, fee, netAmount } = calculateNetReceivable(100.00, 'CREDIT_CARD');
  assert.equal(grossAmount, 100.00);
  assert.equal(fee, 2.99);
  assert.equal(netAmount, 97.01);

  const mockOrders = [
    { total: 100.00, paymentMethod: 'CREDIT_CARD', cmv: 25.00, status: 'DELIVERED' },
    { total: 80.00, paymentMethod: 'PIX', cmv: 18.00, status: 'DELIVERED' },
    { total: 50.00, paymentMethod: 'CASH', cmv: 12.00, status: 'CANCELLED' },
  ];

  const dre = calculateDRE(mockOrders, 20.00);
  assert.equal(dre.grossRevenue, 180.00);
  assert.equal(dre.cmvTotal, 43.00);
  assert.ok(dre.netProfit > 0);
});
