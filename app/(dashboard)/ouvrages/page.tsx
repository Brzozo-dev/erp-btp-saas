'use client';

import { useState, useMemo } from 'react';
import { Layers, Plus, Search, Pencil, Trash2, X, Check, Eye } from 'lucide-react';
import { useOuvrageStore, OuvrageTemplate } from '@/lib/stores/ouvrageStore';
const typeConfig: Record<'MOD' | 'FOURNITURE' | 'MATERIEL' | 'SOUS_TRAITANCE', { label: string; abbreviation: string; color: string; bgColor: string; badgeBg: string; badgeText: string }> = {
    MOD: { label: 'Main d\'œuvre', abbreviation: 'MOD', color: 'text-blue-700', bgColor: 'bg-blue-50', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800' },
    FOURNITURE: { label: 'Fourniture', abbreviation: 'FRN', color: 'text-emerald-700', bgColor: 'bg-emerald-50', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800' },
    MATERIEL: { label: 'Matériel', abbreviation: 'MAT', color: 'text-orange-700', bgColor: 'bg-orange-50', badgeBg: 'bg-orange-100', badgeText: 'text-orange-800' },
    SOUS_TRAITANCE: { label: 'Sous-traitance', abbreviation: 'S/T', color: 'text-purple-700', bgColor: 'bg-purple-50', badgeBg: 'bg-purple-100', badgeText: 'text-purple-800' },
};

function formatMontant(value: number): string {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

// ============================================================
// MODALE DE VISUALISATION/EDITION SIMPLE
// ============================================================
interface OuvrageFormData {
    reference: string;
    designation: string;
    description: string;
    unite: string;
}

function OuvrageModal({
    ouvrage,
    onSave,
    onClose,
}: {
    ouvrage: OuvrageTemplate;
    onSave: (data: OuvrageFormData) => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState<OuvrageFormData>({
        reference: ouvrage.reference,
        designation: ouvrage.designation,
        description: ouvrage.description || '',
        unite: ouvrage.unite,
    });

    const canSave = form.designation.trim().length > 0 && form.unite.trim().length > 0;

    // Calcul du coût de base de l'ouvrage (déboursé)
    const totalDebourse = ouvrage.subItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-blue-800 to-blue-700 px-6 py-4 flex justify-between items-center shrink-0">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                        <Layers className="w-5 h-5" /> Modifier l'ouvrage
                    </h2>
                    <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Infos de base */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Référence</label>
                            <input
                                type="text" value={form.reference} disabled
                                className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Générée automatiquement</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Unité *</label>
                            <input
                                type="text" value={form.unite}
                                onChange={(e) => setForm({ ...form, unite: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Désignation *</label>
                        <input
                            type="text" value={form.designation}
                            onChange={(e) => setForm({ ...form, designation: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Notes / Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Composition (Read-only pour l'instant) */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-sm font-semibold text-gray-700">Composition (Sous-détail) <span className="text-xs font-normal text-gray-500 ml-2">(Modification dans devis)</span></label>
                            <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">Coût de base : {formatMontant(totalDebourse)} €</span>
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-2">Désignation</th>
                                        <th className="px-4 py-2 text-right">Qté</th>
                                        <th className="px-4 py-2 text-center">Unité</th>
                                        <th className="px-4 py-2 text-right">P.U. Base</th>
                                        <th className="px-4 py-2 text-right">Total Base</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {ouvrage.subItems.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-gray-700 font-medium">
                                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${item.type === 'MO' ? 'bg-blue-500' : item.type === 'ST' ? 'bg-purple-500' : 'bg-orange-500'}`}></span>
                                                {item.description}
                                            </td>
                                            <td className="px-4 py-2 text-right tabular-nums text-gray-600">{formatMontant(item.quantity)}</td>
                                            <td className="px-4 py-2 text-center text-gray-500 text-xs">{item.unit}</td>
                                            <td className="px-4 py-2 text-right tabular-nums text-gray-600">{formatMontant(item.unitPrice)} €</td>
                                            <td className="px-4 py-2 text-right tabular-nums text-gray-900 font-medium">{formatMontant(item.quantity * item.unitPrice)} €</td>
                                        </tr>
                                    ))}
                                    {ouvrage.subItems.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-6 text-center text-gray-400 italic">Ouvrage vide</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 shrink-0 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => canSave && onSave(form)}
                        disabled={!canSave}
                        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// PAGE
// ============================================================
export default function OuvragesPage() {
    const { ouvrages, updateOuvrage, deleteOuvrage } = useOuvrageStore();

    const [search, setSearch] = useState('');
    const [modalOuvrage, setModalOuvrage] = useState<OuvrageTemplate | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const lowerSearch = search.toLowerCase();
        return ouvrages.filter((o) => {
            return (
                !search ||
                o.designation.toLowerCase().includes(lowerSearch) ||
                o.reference.toLowerCase().includes(lowerSearch) ||
                (o.description && o.description.toLowerCase().includes(lowerSearch))
            );
        });
    }, [ouvrages, search]);

    const handleSave = (data: OuvrageFormData) => {
        if (modalOuvrage) {
            updateOuvrage(modalOuvrage.id, data);
        }
        setModalOuvrage(null);
    };

    const handleDelete = (id: string) => {
        deleteOuvrage(id);
        setDeleteConfirm(null);
    };

    return (
        <div className="max-w-6xl mx-auto py-8 space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Layers className="w-6 h-6 text-gray-700" />
                        <h1 className="text-2xl font-bold text-gray-900">Bibliothèque d'Ouvrages</h1>
                    </div>
                    <p className="text-gray-500">
                        Gérez vos ouvrages types composés de plusieurs articles (main d'œuvre, fournitures...).<br />
                        <span className="text-sm italic text-blue-600">Note: De nouveaux ouvrages peuvent être créés directement depuis l'éditeur de devis.</span>
                    </p>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-2">
                {/* Recherche */}
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un ouvrage..."
                        className="pl-10 pr-4 h-10 w-full rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 pl-6 pr-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Réf.</th>
                            <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Désignation</th>
                            <th className="py-3 px-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Unité</th>
                            <th className="py-3 px-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Sous-lignes</th>
                            <th className="py-3 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Déboursé Base</th>
                            <th className="py-3 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-400">
                                    Aucun ouvrage trouvé.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((ouvrage) => {
                                const totalDebourse = ouvrage.subItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

                                return (
                                    <tr key={ouvrage.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 pl-6 pr-2 text-sm font-mono text-gray-500">{ouvrage.reference}</td>
                                        <td className="py-3 px-3">
                                            <p className="text-sm font-medium text-gray-900">{ouvrage.designation}</p>
                                            {ouvrage.description && (
                                                <p className="text-xs text-gray-500 mt-0.5 max-w-xl truncate line-clamp-1">{ouvrage.description}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-center text-sm text-gray-600 font-medium">{ouvrage.unite}</td>
                                        <td className="py-3 px-3 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                {ouvrage.subItems.length} comp.
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right text-sm font-semibold tabular-nums text-gray-700">
                                            {formatMontant(totalDebourse)} €
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setModalOuvrage(ouvrage)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="Voir / Modifier détails"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                {deleteConfirm === ouvrage.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDelete(ouvrage.id)}
                                                            className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                                            title="Confirmer"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                                                            title="Annuler"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(ouvrage.id)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Compteur */}
            <p className="text-xs text-gray-400 text-right">
                {filtered.length} ouvrage{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
            </p>

            {/* Modale */}
            {modalOuvrage && (
                <OuvrageModal
                    ouvrage={modalOuvrage}
                    onSave={handleSave}
                    onClose={() => setModalOuvrage(null)}
                />
            )}
        </div>
    );
}
