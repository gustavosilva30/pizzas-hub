import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { StockItem } from '../../types/index.ts';
import {
  Package,
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowDownUp,
  Search,
  CheckCircle2,
  X,
  PieChart,
} from 'lucide-react';

export const StockManagerView: React.FC = () => {
  const { stockItems, restockItem, adjustStock, activeTenant, flavors, sizes } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal Entrada de Mercadoria
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<string>(stockItems[0]?.id || '');
  const [restockAmount, setRestockAmount] = useState<string>('5000'); // ex: 5000g = 5kg

  // Insumos críticos abaixo do estoque mínimo
  const criticalItems = stockItems.filter(s => s.currentStock <= s.minStock);

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const handleRestockSubmit = () => {
    const qty = parseFloat(restockAmount);
    if (qty > 0 && selectedStockId) {
      restockItem(selectedStockId, qty);
      setIsRestockOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Controle de Estoque & Fichas Técnicas (BOM)
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {activeTenant.name}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Baixa atômica automática a cada pizza assada com suporte a sabores meio a meio e bordas recheadas.
          </p>
        </div>

        <button
          onClick={() => setIsRestockOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Dar Entrada de Mercadoria
        </button>
      </div>

      {/* Alerta de Estoque Crítico (se houver) */}
      {criticalItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold text-xs text-rose-900">
                Atenção: {criticalItems.length} insumos estão no limite ou abaixo do estoque mínimo!
              </div>
              <div className="text-[11px] text-rose-700 mt-0.5">
                {criticalItems.map(i => `${i.name} (${i.currentStock}${i.unit})`).join(' · ')}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedStockId(criticalItems[0].id);
              setIsRestockOpen(true);
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 cursor-pointer"
          >
            Repor Agora
          </button>
        </div>
      )}

      {/* Exemplo Interativo de Ficha Técnica (BOM) */}
      <div className="bg-amber-50/50 border border-amber-200/80 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Simulador de Ficha Técnica: Pizza Grande (8 Fatias) Meio a Meio
            </h3>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-900 font-bold px-2 py-0.5 rounded">
            Dedução Atômica por Fração (1/2)
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Ao vender 1 pizza Grande meio <strong>Calabresa Artesanal</strong> e meio <strong>Quatro Queijos</strong> com <strong>Borda Catupiry</strong>, o sistema calcula e deduz instantaneamente no banco:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-amber-200">
            <span className="text-slate-500 block text-[11px]">Massa Base Grande</span>
            <span className="font-bold text-slate-900">360g Farinha + 130g Molho</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Custo: R$ 4,11</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200">
            <span className="text-slate-500 block text-[11px]">1/2 Calabresa Artesanal</span>
            <span className="font-bold text-slate-900">110g Mussarela + 100g Calabresa</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Custo: R$ 8,75</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200">
            <span className="text-slate-500 block text-[11px]">1/2 Quatro Queijos</span>
            <span className="font-bold text-slate-900">70g Mussarela + Provolone/Gorgonzola</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Custo: R$ 11,40</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200">
            <span className="text-slate-500 block text-[11px]">Borda Catupiry</span>
            <span className="font-bold text-slate-900">180g Catupiry Original</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Custo: R$ 7,56</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros da Tabela */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar insumo ou fornecedor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {['ALL', 'Massa & Grãos', 'Laticínios', 'Carnes & Embutidos', 'Molhos & Vegetais', 'Embalagens'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'Todos os Insumos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Insumos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Insumo / Ingrediente</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5 text-right">Estoque Atual</th>
                <th className="p-3.5 text-right">Estoque Mínimo</th>
                <th className="p-3.5 text-right">Custo Unitário</th>
                <th className="p-3.5">Fornecedor</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                const isCritical = item.currentStock <= item.minStock;
                const percent = Math.min(100, Math.round((item.currentStock / (item.minStock * 2)) * 100));

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      {item.name}
                      {isCritical && (
                        <span className="ml-2 text-[10px] font-extrabold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                          CRÍTICO
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600">{item.category}</td>
                    <td className="p-3.5 text-right font-mono font-black text-slate-900">
                      {item.unit === 'g' ? `${(item.currentStock / 1000).toFixed(2)} kg` : `${item.currentStock} ${item.unit}`}
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden ml-auto mt-1">
                        <div
                          className={`h-full ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-500">
                      {item.unit === 'g' ? `${(item.minStock / 1000).toFixed(2)} kg` : `${item.minStock} ${item.unit}`}
                    </td>
                    <td className="p-3.5 text-right font-mono font-semibold text-slate-700">
                      R$ {item.costPerUnit.toFixed(4)} /{item.unit}
                    </td>
                    <td className="p-3.5 text-slate-600">{item.supplier}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedStockId(item.id);
                          setIsRestockOpen(true);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded text-[11px] cursor-pointer"
                      >
                        Repor
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ENTRADA DE MERCADORIA */}
      {isRestockOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Entrada de Mercadoria / Insumo</h3>
              <button onClick={() => setIsRestockOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Selecione o Insumo</label>
              <select
                value={selectedStockId}
                onChange={e => setSelectedStockId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg font-medium"
              >
                {stockItems.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Atual: {s.currentStock} {s.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Quantidade a Adicionar</label>
              <input
                type="number"
                placeholder="Ex: 5000 (em gramas ou unidades)"
                value={restockAmount}
                onChange={e => setRestockAmount(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-sm"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Dica: Para insumos em gramas, 1kg = 1.000g. Para 1 saco de 25kg, digite 25000.
              </span>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsRestockOpen(false)}
                className="px-4 py-2 border rounded-lg font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestockSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shadow-sm"
              >
                Confirmar Entrada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
