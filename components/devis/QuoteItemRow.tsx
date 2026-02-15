'use client';

import { QuoteItem, GlobalCoefficients } from '@/types/devis';
import Input from '@/components/ui/Input';
import { Trash } from 'lucide-react';

interface QuoteItemRowProps {
    item: QuoteItem;
    globalCoefficients: GlobalCoefficients;
    onChange: (updatedItem: QuoteItem) => void;
    onDelete: () => void;
}

export default function QuoteItemRow({ item, globalCoefficients, onChange, onDelete }: QuoteItemRowProps) {

    // Calculate selling prices based on global coefficients
    const sellingPriceMO = item.unitPriceMO * globalCoefficients.mo;
    const sellingPriceMat = item.unitPriceMat * globalCoefficients.mat;
    const sellingPriceST = item.unitPriceST * globalCoefficients.st;

    const unitSellingPrice = sellingPriceMO + sellingPriceMat + sellingPriceST;
    const totalSellingPrice = unitSellingPrice * item.quantity;

    const handleChange = (field: keyof QuoteItem, value: any) => {
        onChange({ ...item, [field]: value });
    };

    return (
        <tr className="group hover:bg-gray-50">
            <td className="px-2 py-2">
                <Input
                    value={item.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Description de l'ouvrage"
                    className="border-gray-200 focus:border-emerald-500"
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
                    className="border-gray-200 text-right bg-blue-50/50"
                    placeholder="0"
                />
            </td>
            <td className="px-2 py-2 w-28">
                <Input
                    type="number"
                    value={item.unitPriceMat}
                    onChange={(e) => handleChange('unitPriceMat', parseFloat(e.target.value) || 0)}
                    className="border-gray-200 text-right bg-orange-50/50"
                    placeholder="0"
                />
            </td>
            <td className="px-2 py-2 w-28">
                <Input
                    type="number"
                    value={item.unitPriceST}
                    onChange={(e) => handleChange('unitPriceST', parseFloat(e.target.value) || 0)}
                    className="border-gray-200 text-right bg-purple-50/50"
                    placeholder="0"
                />
            </td>

            {/* Calculated Columns */}
            <td className="px-4 py-2 text-right font-medium text-gray-900 w-32">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalSellingPrice)}
            </td>

            <td className="px-2 py-2 w-10 text-center">
                <button
                    type="button"
                    onClick={onDelete}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}
