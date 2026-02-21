'use client';

import { QuoteSection, QuoteItem, GlobalCoefficients } from '@/types/devis';
import QuoteItemRow from './QuoteItemRow';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface QuoteSectionProps {
    section: QuoteSection;
    globalCoefficients: GlobalCoefficients;
    globalBenefice: number;
    onChange: (updatedSection: QuoteSection) => void;
    onDelete: () => void;
}

export default function QuoteSectionBlock({ section, globalCoefficients, globalBenefice, onChange, onDelete }: QuoteSectionProps) {

    const handleAddItem = () => {
        const newItem: QuoteItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: '',
            unit: 'U',
            quantity: 1,
            unitPriceMO: 0,
            unitPriceMat: 0,
            unitPriceST: 0,
        };
        onChange({
            ...section,
            items: [...section.items, newItem],
        });
    };

    const handleUpdateItem = (index: number, updatedItem: QuoteItem) => {
        const newItems = [...section.items];
        newItems[index] = updatedItem;
        onChange({ ...section, items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = section.items.filter((_, i) => i !== index);
        onChange({ ...section, items: newItems });
    };

    // Calculate Section Total
    const sectionTotal = section.items.reduce((acc, item) => {
        const itemBenefice = item.benefice !== undefined ? item.benefice : globalBenefice;
        const spMO = item.unitPriceMO * globalCoefficients.mo;
        const spMat = item.unitPriceMat * globalCoefficients.mat;
        const spST = item.unitPriceST * globalCoefficients.st;
        const itemRevient = (spMO + spMat + spST) * item.quantity;
        return acc + itemRevient * (1 + itemBenefice / 100);
    }, 0);

    return (
        <div className="bg-white rounded-lg border shadow-sm mb-6 overflow-hidden">
            {/* Section Header */}
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center group">
                <div className="flex items-center gap-2 flex-1">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <Input
                        value={section.title}
                        onChange={(e) => onChange({ ...section, title: e.target.value })}
                        className="font-semibold text-lg bg-transparent border-transparent hover:border-gray-300 focus:bg-white w-full max-w-md"
                        placeholder="Titre du Lot (ex: Gros Œuvre)"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(sectionTotal)}
                    </span>
                    <button onClick={onDelete} className="text-gray-400 hover:text-red-600 p-1">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Items Table */}
            <div className="p-4">
                <table className="w-full">
                    <thead>
                        <tr className="text-xs font-medium text-gray-500 text-left">
                            <th className="pb-2 pl-2">Description</th>
                            <th className="pb-2 w-20 text-center">Unité</th>
                            <th className="pb-2 w-24 text-right">Qté</th>
                            <th className="pb-2 w-28 text-right text-blue-600">P.U. MO (€)</th>
                            <th className="pb-2 w-28 text-right text-orange-600">P.U. Mat (€)</th>
                            <th className="pb-2 w-28 text-right text-purple-600">P.U. ST (€)</th>
                            <th className="pb-2 w-24 text-right text-emerald-600">Marge (%)</th>
                            <th className="pb-2 w-32 text-right">Total HT</th>
                            <th className="pb-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {section.items.map((item, index) => (
                            <QuoteItemRow
                                key={item.id}
                                item={item}
                                globalCoefficients={globalCoefficients}
                                globalBenefice={globalBenefice}
                                onChange={(updated) => handleUpdateItem(index, updated)}
                                onDelete={() => handleDeleteItem(index)}
                            />
                        ))}
                    </tbody>
                </table>

                <div className="mt-4">
                    <Button type="button" variant="ghost" onClick={handleAddItem} size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un ouvrage
                    </Button>
                </div>
            </div>
        </div>
    );
}
