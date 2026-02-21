'use client';

import { QuoteItem, GlobalCoefficients, QuoteSubItem } from '@/types/devis';
import Input from '@/components/ui/Input';
import { Trash, ChevronRight, ChevronDown, Box, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import QuoteSubItemRow from './QuoteSubItemRow';

interface QuoteItemRowProps {
    item: QuoteItem;
    globalCoefficients: GlobalCoefficients;
    globalBenefice: number;
    onChange: (updatedItem: QuoteItem) => void;
    onDelete: () => void;
}

export default function QuoteItemRow({ item, globalCoefficients, globalBenefice, onChange, onDelete }: QuoteItemRowProps) {

    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate selling prices based on global coefficients
    const sellingPriceMO = item.unitPriceMO * globalCoefficients.mo;
    const sellingPriceMat = item.unitPriceMat * globalCoefficients.mat;
    const sellingPriceST = item.unitPriceST * globalCoefficients.st;

    const unitSellingPrice = sellingPriceMO + sellingPriceMat + sellingPriceST;
    const totalSellingPrice = unitSellingPrice * item.quantity;

    // Recalculate Unit Prices from SubItems if they exist
    useEffect(() => {
        if (!item.subItems || item.subItems.length === 0) return;

        let mo = 0;
        let mat = 0;
        let st = 0;

        item.subItems.forEach(sub => {
            const total = sub.unitPrice * sub.quantity; // Total cost for this sub-item
            // The item unit price is per 1 unit of the ITEM. 
            // So if 1 Item needs 2 sub-items, the cost added to unitPrice is 2 * subPrice.
            // Wait, is subItem quantity "per Item unit" or "total for this line"?
            // Usually in "Composants d'ouvrage", the quantity is "Quantity required for 1 Unit of the Parent".
            // Let's assume sub.quantity is "Quantity per Parent Unit".

            const costPerParentUnit = sub.unitPrice * sub.quantity;

            if (sub.type === 'MO') mo += costPerParentUnit;
            if (sub.type === 'MAT') mat += costPerParentUnit;
            if (sub.type === 'ST') st += costPerParentUnit;
        });

        // Only update if values are different to avoid infinite loop
        if (
            Math.abs(mo - item.unitPriceMO) > 0.01 ||
            Math.abs(mat - item.unitPriceMat) > 0.01 ||
            Math.abs(st - item.unitPriceST) > 0.01
        ) {
            onChange({
                ...item,
                unitPriceMO: mo,
                unitPriceMat: mat,
                unitPriceST: st
            });
        }

    }, [item.subItems]);

    const handleChange = (field: keyof QuoteItem, value: any) => {
        onChange({ ...item, [field]: value });
    };

    const handleAddSubItem = () => {
        const newSubItem: QuoteSubItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: '',
            unit: 'u',
            quantity: 1,
            unitPrice: 0,
            type: 'MAT' // Default
        };
        const updatedSubItems = [...(item.subItems || []), newSubItem];
        onChange({ ...item, subItems: updatedSubItems });
        setIsExpanded(true);
    };

    const handleUpdateSubItem = (index: number, updatedSub: QuoteSubItem) => {
        const newSubItems = [...(item.subItems || [])];
        newSubItems[index] = updatedSub;
        onChange({ ...item, subItems: newSubItems });
    };

    const handleDeleteSubItem = (index: number) => {
        const newSubItems = (item.subItems || []).filter((_, i) => i !== index);
        onChange({ ...item, subItems: newSubItems });
    };

    return (
        <>
            <tr className={`group hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}>
                <td className="px-2 py-2 relative">
                    <div className="absolute left-0 top-3 bottom-0 flex items-start justify-center w-8">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                    <Input
                        value={item.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Description de l'ouvrage"
                        className="border-gray-200 focus:border-emerald-500 pl-8"
                    />
                </td>
                <td className="px-2 py-2 w-20">
                    <Input
                        value={item.unit}
                        onChange={(e) => handleChange('unit', e.target.value)}
                        placeholder="U"
                        className="border-gray-200 text-center"
                    />
                </td>
                <td className="px-2 py-2 w-24">
                    <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                        className="border-gray-200 text-right"
                    />
                </td>

                {/* Cost Columns - Could be hidden for some users in real app */}
                <td className="px-2 py-2 w-28">
                    <Input
                        type="number"
                        value={item.unitPriceMO}
                        onChange={(e) => handleChange('unitPriceMO', parseFloat(e.target.value) || 0)}
                        className={`border-gray-200 text-right bg-blue-50/50 ${item.subItems?.length ? 'text-gray-400' : ''}`}
                        placeholder="0"
                        readOnly={!!item.subItems?.length}
                        title={item.subItems?.length ? "Calculé via les composants" : ""}
                    />
                </td>
                <td className="px-2 py-2 w-28">
                    <Input
                        type="number"
                        value={item.unitPriceMat}
                        onChange={(e) => handleChange('unitPriceMat', parseFloat(e.target.value) || 0)}
                        className={`border-gray-200 text-right bg-orange-50/50 ${item.subItems?.length ? 'text-gray-400' : ''}`}
                        placeholder="0"
                        readOnly={!!item.subItems?.length}
                        title={item.subItems?.length ? "Calculé via les composants" : ""}
                    />
                </td>
                <td className="px-2 py-2 w-28">
                    <Input
                        type="number"
                        value={item.unitPriceST}
                        onChange={(e) => handleChange('unitPriceST', parseFloat(e.target.value) || 0)}
                        className={`border-gray-200 text-right bg-purple-50/50 ${item.subItems?.length ? 'text-gray-400' : ''}`}
                        placeholder="0"
                        readOnly={!!item.subItems?.length}
                        title={item.subItems?.length ? "Calculé via les composants" : ""}
                    />
                </td>

                {/* Calculated Columns */}
                <td className="px-4 py-2 text-right font-medium text-gray-900 w-32">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalSellingPrice)}
                </td>

                <td className="px-2 py-2 w-10 text-center">
                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={onDelete}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleAddSubItem}
                            className="text-gray-400 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Ajouter un composant"
                        >
                            <Box className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <>
                    {item.subItems?.map((subItem, index) => (
                        <QuoteSubItemRow
                            key={subItem.id}
                            subItem={subItem}
                            onChange={(updated) => handleUpdateSubItem(index, updated)}
                            onDelete={() => handleDeleteSubItem(index)}
                        />
                    ))}
                    <tr>
                        <td colSpan={10} className="px-2 py-1 bg-gray-50/30">
                            <button
                                onClick={handleAddSubItem}
                                className="ml-10 text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1 py-1"
                            >
                                <Plus className="w-3 h-3" />
                                Ajouter un composant
                            </button>
                        </td>
                    </tr>
                </>
            )}
        </>
    );
}
