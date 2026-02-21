'use client';

import { useState, useEffect, useRef } from 'react';
import { QuoteSubItem } from '@/types/devis';
import { useArticleStore, Article } from '@/lib/stores/articleStore';
import Input from '@/components/ui/Input';
import { Trash, Plus, Search } from 'lucide-react';

interface QuoteSubItemRowProps {
    subItem: QuoteSubItem;
    onChange: (updatedSubItem: QuoteSubItem) => void;
    onDelete: () => void;
}

export default function QuoteSubItemRow({ subItem, onChange, onDelete }: QuoteSubItemRowProps) {
    const { articles, searchArticles, addArticle } = useArticleStore();
    const [searchTerm, setSearchTerm] = useState(subItem.description);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<Article[]>([]);
    const [newUnite, setNewUnite] = useState(subItem.unit || 'U');
    const [newPrix, setNewPrix] = useState<number>(subItem.unitPrice || 0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Handle outside click to close suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search effect
    useEffect(() => {
        if (searchTerm && showSuggestions) {
            const results = searchArticles(searchTerm);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, showSuggestions, searchArticles]);

    const handleSelectArticle = (article: Article) => {
        onChange({
            ...subItem,
            articleId: article.id,
            description: article.designation,
            unit: article.unite,
            unitPrice: article.prixUnitaire, // Uses the stored price
            type: article.type === 'MOD' ? 'MO' : article.type === 'SOUS_TRAITANCE' ? 'ST' : 'MAT',
        });
        setSearchTerm(article.designation);
        setShowSuggestions(false);
    };

    const handleCreateArticle = () => {
        if (!searchTerm) return;

        const newArticle = {
            reference: searchTerm.substring(0, 3).toUpperCase() + '-' + Math.floor(Math.random() * 1000),
            designation: searchTerm,
            unite: newUnite,
            prixUnitaire: newPrix,
            type: subItem.type as any, // or as ArticleType
            category: 'Divers'
        };

        addArticle(newArticle);

        onChange({
            ...subItem,
            description: searchTerm,
            unit: newUnite,
            unitPrice: newPrix,
        });

        setShowSuggestions(false);
    };

    const handleChange = (field: keyof QuoteSubItem, value: any) => {
        onChange({ ...subItem, [field]: value });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'MO': return 'text-blue-600 bg-blue-50';
            case 'MAT': return 'text-orange-600 bg-orange-50';
            case 'ST': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <tr className="group bg-gray-50/50 hover:bg-gray-100/50 text-sm">
            <td className="px-2 py-1 pl-10 relative">
                <div className="flex items-center gap-2">
                    <select
                        value={subItem.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className={`text-xs font-semibold rounded px-1 py-1 border-0 cursor-pointer ${getTypeColor(subItem.type)}`}
                    >
                        <option value="MO">MO</option>
                        <option value="MAT">MAT</option>
                        <option value="ST">ST</option>
                    </select>

                    <div className="relative flex-1" ref={wrapperRef}>
                        <Input
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                handleChange('description', e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Rechercher ou créer un composant..."
                            className="h-8 text-sm border-gray-200 focus:border-emerald-500 bg-white"
                        />

                        {showSuggestions && searchTerm && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                {suggestions.length > 0 ? (
                                    suggestions.map((article) => (
                                        <button
                                            key={article.id}
                                            onClick={() => handleSelectArticle(article)}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex justify-between items-center text-sm"
                                            type="button"
                                        >
                                            <span>{article.designation}</span>
                                            <span className="text-gray-400 text-xs">{article.prixUnitaire}€ / {article.unite}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="flex flex-col gap-2 p-3 bg-gray-50/80 border-t">
                                        <div className="text-sm font-medium text-gray-700">
                                            Créer "{searchTerm}"
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                value={newUnite}
                                                onChange={(e) => setNewUnite(e.target.value)}
                                                placeholder="Unité"
                                                className="w-20 h-8 text-sm"
                                            />
                                            <Input
                                                type="number"
                                                value={newPrix || ''}
                                                onChange={(e) => setNewPrix(parseFloat(e.target.value) || 0)}
                                                placeholder="Prix unit."
                                                className="flex-1 h-8 text-sm text-right"
                                            />
                                            <div className="flex items-center text-gray-500 text-sm">€</div>
                                        </div>
                                        <button
                                            onClick={handleCreateArticle}
                                            className="mt-1 w-full text-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded border border-transparent text-sm font-medium transition-colors"
                                            type="button"
                                        >
                                            Créer et utiliser
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-2 py-1 w-20">
                <Input
                    value={subItem.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    placeholder="U"
                    className="h-8 text-sm border-gray-200 text-center bg-white"
                />
            </td>
            <td className="px-2 py-1 w-24">
                <Input
                    type="number"
                    value={subItem.quantity}
                    onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm border-gray-200 text-right bg-white"
                />
            </td>
            {/* Price Column - Merged for simplicity or specific logic */}
            <td className="px-2 py-1 w-28">
                <Input
                    type="number"
                    value={subItem.unitPrice}
                    onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm border-gray-200 text-right bg-white"
                />
            </td>
            <td className="px-2 py-1 w-28"></td>
            <td className="px-2 py-1 w-28"></td>

            {/* Total HT */}
            <td className="px-4 py-1 text-right text-gray-600 w-32 text-sm">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(subItem.unitPrice * subItem.quantity)}
            </td>

            <td className="px-2 py-1 w-10 text-center">
                <button
                    type="button"
                    onClick={onDelete}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <Trash className="w-3 h-3" />
                </button>
            </td>
        </tr>
    );
}
