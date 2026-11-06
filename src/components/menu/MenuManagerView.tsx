import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { PizzaFlavor } from '../../types/index.ts';
import {
  UtensilsCrossed,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Save,
  X,
  Sparkles,
  Layers,
  CircleDot,
} from 'lucide-react';

export const MenuManagerView: React.FC = () => {
  const {
    activeTenant,
    flavors,
    toggleFlavorAvailability,
    addFlavor,
    updateFlavorPrice,
    crusts,
    toggleCrustAvailability,
    products,
    toggleProductAvailability,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'FLAVORS' | 'CRUSTS' | 'PRODUCTS'>('FLAVORS');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Tradicional' | 'Especial' | 'Doce' | 'Premium'>('ALL');

  // Modal para criar novo sabor
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFlavorName, setNewFlavorName] = useState('');
  const [newCategory, setNewCategory] = useState<'Tradicional' | 'Especial' | 'Doce' | 'Premium'>('Especial');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [newIngredientsStr, setNewIngredientsStr] = useState('');

  // Edição rápida de preço
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const handleCreateFlavor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlavorName.trim()) return;

    const ingredients = newIngredientsStr
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);

    addFlavor({
      name: newFlavorName.trim(),
      category: newCategory,
      description: newDescription.trim() || 'Receita especial da casa.',
      additionalPrice: Number(newPrice) || 0,
      ingredients: ingredients.length > 0 ? ingredients : ['Molho de Tomate', 'Mussarela'],
      isAvailable: true,
    });

    setIsAddModalOpen(false);
    setNewFlavorName('');
    setNewDescription('');
    setNewPrice(0);
    setNewIngredientsStr('');
  };

  const handleStartEditPrice = (flavor: PizzaFlavor) => {
    setEditingPriceId(flavor.id);
    setTempPrice(flavor.additionalPrice);
  };

  const handleSavePrice = (flavorId: string) => {
    updateFlavorPrice(flavorId, Number(tempPrice) || 0);
    setEditingPriceId(null);
  };

  const filteredFlavors = flavors.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const availableCount = flavors.filter(f => f.isAvailable).length;
  const pausedCount = flavors.filter(f => !f.isAvailable).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Topo do Gestor */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>🍕</span> Gestor de Cardápio & Sabores
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pause sabores esgotados com 1 clique, altere preços adicionais e adicione novas receitas da casa.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Sabor de Pizza</span>
        </button>
      </div>

      {/* Navegação entre Abas: Sabores, Bordas Recheadas, Bebidas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('FLAVORS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'FLAVORS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Sabores de Pizza ({flavors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CRUSTS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'CRUSTS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CircleDot className="w-3.5 h-3.5" />
          <span>Bordas Recheadas ({crusts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'PRODUCTS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Bebidas & Entradas ({products.length})</span>
        </button>
      </div>

      {/* Conteúdo da Aba Sabores */}
      {activeTab === 'FLAVORS' && (
        <div className="space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'ALL', label: 'Todos os Sabores' },
                { id: 'Tradicional', label: 'Tradicionais' },
                { id: 'Especial', label: 'Especiais' },
                { id: 'Premium', label: 'Premium' },
                { id: 'Doce', label: 'Doces' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as typeof categoryFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por sabor ou ingrediente..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Cards de Sabores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlavors.map(flavor => {
              const isEditing = editingPriceId === flavor.id;

              return (
                <div
                  key={flavor.id}
                  className={`bg-white rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    flavor.isAvailable
                      ? 'border-slate-200 shadow-xs'
                      : 'border-rose-200 bg-rose-50/20 opacity-80'
                  }`}
                >
                  <div>
                    {/* Topo do Card */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mb-1 ${
                            flavor.category === 'Tradicional'
                              ? 'bg-emerald-100 text-emerald-800'
                              : flavor.category === 'Especial'
                              ? 'bg-blue-100 text-blue-800'
                              : flavor.category === 'Premium'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {flavor.category}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 leading-snug">
                          {flavor.name}
                        </h3>
                      </div>

                      {/* Botão de Disponibilidade (Pausar / Ativar) */}
                      <button
                        onClick={() => toggleFlavorAvailability(flavor.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                          flavor.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                        }`}
                        title={flavor.isAvailable ? 'Clique para pausar (esgotado)' : 'Clique para reativar no cardápio'}
                      >
                        {flavor.isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ativo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Pausado</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                      {flavor.description}
                    </p>

                    {/* Ingredientes */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {flavor.ingredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rodapé: Valor Adicional e Ações */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Adicional ao Tamanho</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-slate-600">R$</span>
                          <input
                            type="number"
                            step="0.50"
                            min="0"
                            value={tempPrice}
                            onChange={e => setTempPrice(Number(e.target.value))}
                            className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold font-mono"
                          />
                          <button
                            onClick={() => handleSavePrice(flavor.id)}
                            className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPriceId(null)}
                            className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-black text-slate-900 font-mono">
                          {flavor.additionalPrice > 0 ? `+ R$ ${flavor.additionalPrice.toFixed(2)}` : 'Incluso'}
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <button
                        onClick={() => handleStartEditPrice(flavor)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar valor adicional do sabor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba Bordas Recheadas */}
      {activeTab === 'CRUSTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {crusts.map(crust => (
            <div
              key={crust.id}
              className={`bg-white rounded-2xl border p-4 flex flex-col justify-between ${
                crust.isAvailable ? 'border-slate-200 shadow-xs' : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">{crust.name}</h4>
                <span className="text-xs font-mono font-bold text-amber-600 block mb-3">
                  {crust.price > 0 ? `+ R$ ${crust.price.toFixed(2)}` : 'Grátis'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Status no Cardápio:</span>
                <button
                  onClick={() => toggleCrustAvailability(crust.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    crust.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {crust.isAvailable ? 'Disponível' : 'Pausada'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo da Aba Bebidas & Entradas */}
      {activeTab === 'PRODUCTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map(prod => (
            <div
              key={prod.id}
              className={`bg-white rounded-2xl border p-4 flex flex-col justify-between ${
                prod.isAvailable ? 'border-slate-200 shadow-xs' : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {prod.categoryId}
                </span>
                <h4 className="text-sm font-black text-slate-900 mb-1">{prod.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{prod.description}</p>
                <span className="text-sm font-mono font-black text-slate-900 block mb-3">
                  R$ {prod.price.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Disponibilidade:</span>
                <button
                  onClick={() => toggleProductAvailability(prod.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    prod.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {prod.isAvailable ? 'Ativo' : 'Esgotado'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Criar Novo Sabor */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">🍕</span>
                <div>
                  <h3 className="font-extrabold text-base">Novo Sabor de Pizza</h3>
                  <p className="text-xs text-slate-400">Adicione uma nova receita ao catálogo da pizzaria</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFlavor} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Sabor:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Calabresa Especial com Gorgonzola"
                  value={newFlavorName}
                  onChange={e => setNewFlavorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoria:</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as typeof newCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Tradicional">Tradicional</option>
                    <option value="Especial">Especial</option>
                    <option value="Premium">Premium</option>
                    <option value="Doce">Doce</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Adicional (+R$):</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={newPrice}
                    onChange={e => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição Comercial:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Molho rústico de tomate, queijo mussarela especial, calabresa fininha..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ingredientes (separados por vírgula):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Molho de Tomate, Mussarela, Calabresa, Gorgonzola, Cebola"
                  value={newIngredientsStr}
                  onChange={e => setNewIngredientsStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-xs"
                >
                  Criar Sabor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
