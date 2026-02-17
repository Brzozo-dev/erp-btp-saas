'use client';

import { useState, useMemo } from 'react';
import { Package, Plus, Search, Pencil, Trash2, X, Check } from 'lucide-react';
import { useArticleStore, Article, ArticleType } from '@/lib/stores/articleStore';

// ============================================================
// CONFIG
// ============================================================
const typeConfig: Record<ArticleType, { label: string; abbreviation: string; color: string; bgColor: string; badgeBg: string; badgeText: string }> = {
    MOD: { label: 'Main d\'œuvre', abbreviation: 'MOD', color: 'text-blue-700', bgColor: 'bg-blue-50', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800' },
    FOURNITURE: { label: 'Fourniture', abbreviation: 'FRN', color: 'text-emerald-700', bgColor: 'bg-emerald-50', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800' },
    MATERIEL: { label: 'Matériel', abbreviation: 'MAT', color: 'text-orange-700', bgColor: 'bg-orange-50', badgeBg: 'bg-orange-100', badgeText: 'text-orange-800' },
    SOUS_TRAITANCE: { label: 'Sous-traitance', abbreviation: 'S/T', color: 'text-purple-700', bgColor: 'bg-purple-50', badgeBg: 'bg-purple-100', badgeText: 'text-purple-800' },
};

const allTypes: ArticleType[] = ['MOD', 'FOURNITURE', 'MATERIEL', 'SOUS_TRAITANCE'];

function formatMontant(value: number): string {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

// ============================================================
// MODALE
// ============================================================
interface ArticleFormData {
    reference: string;
    designation: string;
    description: string;
    unite: string;
    prixUnitaire: number;
    type: ArticleType;
}

const emptyForm: ArticleFormData = { reference: '', designation: '', description: '', unite: 'U', prixUnitaire: 0, type: 'FOURNITURE' };

function ArticleModal({
    article,
    onSave,
    onClose,
}: {
    article?: Article;
    onSave: (data: ArticleFormData) => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState<ArticleFormData>(
        article
            ? { reference: article.reference, designation: article.designation, description: article.description || '', unite: article.unite, prixUnitaire: article.prixUnitaire, type: article.type }
            : { ...emptyForm }
    );

    const isEdit = !!article;
    const canSave = form.designation.trim().length > 0 && form.unite.trim().length > 0 && form.prixUnitaire > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-white font-bold text-lg">
                        {isEdit ? 'Modifier l\'article' : 'Nouvel article'}
                    </h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                        <div className="grid grid-cols-4 gap-2">
                            {allTypes.map((t) => {
                                const cfg = typeConfig[t];
                                const selected = form.type === t;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setForm({ ...form, type: t })}
                                        className={`py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wide border-2 transition-all ${selected
                                            ? `${cfg.badgeBg} ${cfg.badgeText} border-current shadow-sm`
                                            : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {cfg.abbreviation}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Référence + Unité */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Référence</label>
                            <input
                                type="text"
                                value={form.reference}
                                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                                placeholder="ex: FRN-010"
                                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Unité *</label>
                            <select
                                value={form.unite}
                                onChange={(e) => setForm({ ...form, unite: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="H">H (Heure)</option>
                                <option value="J">J (Jour)</option>
                                <option value="U">U (Unité)</option>
                                <option value="ens">ens (Ensemble)</option>
                                <option value="Ft">Ft (Forfait)</option>
                                <option value="ml">ml (Mètre linéaire)</option>
                                <option value="m²">m² (Mètre carré)</option>
                                <option value="M3">M3 (Mètre cube)</option>
                                <option value="Kg">Kg (Kilogramme)</option>
                                <option value="T">T (Tonne)</option>
                            </select>
                        </div>
                    </div>

                    {/* Désignation */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Désignation *</label>
                        <input
                            type="text"
                            value={form.designation}
                            onChange={(e) => setForm({ ...form, designation: e.target.value })}
                            placeholder="Nom de l'article"
                            className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Description détaillée (optionnel)"
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Prix unitaire */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Prix unitaire H.T. *</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.prixUnitaire || ''}
                                onChange={(e) => setForm({ ...form, prixUnitaire: parseFloat(e.target.value) || 0 })}
                                placeholder="0,00"
                                className="w-full h-12 pl-4 pr-10 text-lg font-bold rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">€</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
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
                        {isEdit ? 'Enregistrer' : 'Créer l\'article'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// PAGE
// ============================================================
export default function ArticlesPage() {
    const { articles, addArticle, updateArticle, deleteArticle } = useArticleStore();

    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<ArticleType | 'ALL'>('ALL');
    const [modalArticle, setModalArticle] = useState<Article | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const lowerSearch = search.toLowerCase();
        return articles.filter((a) => {
            const matchSearch =
                !search ||
                a.designation.toLowerCase().includes(lowerSearch) ||
                a.reference.toLowerCase().includes(lowerSearch) ||
                (a.description && a.description.toLowerCase().includes(lowerSearch));
            const matchType = filterType === 'ALL' || a.type === filterType;
            return matchSearch && matchType;
        });
    }, [articles, search, filterType]);

    // Stats
    const stats = useMemo(() => {
        const counts: Record<string, number> = { ALL: articles.length };
        allTypes.forEach((t) => { counts[t] = articles.filter((a) => a.type === t).length; });
        return counts;
    }, [articles]);

    const handleSave = (data: ArticleFormData) => {
        if (modalArticle) {
            updateArticle(modalArticle.id, data);
        } else {
            addArticle(data);
        }
        setShowModal(false);
        setModalArticle(null);
    };

    const handleDelete = (id: string) => {
        deleteArticle(id);
        setDeleteConfirm(null);
    };

    return (
        <div className="max-w-6xl mx-auto py-8 space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Package className="w-6 h-6 text-gray-700" />
                        <h1 className="text-2xl font-bold text-gray-900">Base Articles</h1>
                    </div>
                    <p className="text-gray-500">
                        Référencez vos articles de main d'œuvre, fournitures, matériel et sous-traitance.
                    </p>
                </div>
                <button
                    onClick={() => { setModalArticle(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Nouvel article
                </button>
            </div>

            {/* Filtres type (tabs) */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => setFilterType('ALL')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'ALL'
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Tous ({stats.ALL})
                </button>
                {allTypes.map((t) => {
                    const cfg = typeConfig[t];
                    const active = filterType === t;
                    return (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active
                                ? `${cfg.badgeBg} ${cfg.badgeText} shadow-sm`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cfg.abbreviation} ({stats[t] || 0})
                        </button>
                    );
                })}

                {/* Recherche */}
                <div className="relative ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un article..."
                        className="pl-10 pr-4 h-10 w-72 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 pl-6 pr-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Réf.</th>
                            <th className="py-3 px-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Type</th>
                            <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Désignation</th>
                            <th className="py-3 px-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Unité</th>
                            <th className="py-3 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Prix H.T.</th>
                            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-400">
                                    Aucun article trouvé.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((article) => {
                                const cfg = typeConfig[article.type];
                                return (
                                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 pl-6 pr-2 text-sm font-mono text-gray-500">{article.reference}</td>
                                        <td className="py-3 px-2 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.badgeBg} ${cfg.badgeText}`}>
                                                {cfg.abbreviation}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <p className={`text-sm font-medium ${cfg.color}`}>{article.designation}</p>
                                            {article.description && (
                                                <p className="text-xs text-gray-400 mt-0.5">{article.description}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-center text-sm text-gray-600 font-medium">{article.unite}</td>
                                        <td className="py-3 px-3 text-right text-sm font-bold tabular-nums text-gray-900">
                                            {formatMontant(article.prixUnitaire)} €
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => { setModalArticle(article); setShowModal(true); }}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                {deleteConfirm === article.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDelete(article.id)}
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
                                                        onClick={() => setDeleteConfirm(article.id)}
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
                {filtered.length} article{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
                {filterType !== 'ALL' || search ? ` (${articles.length} au total)` : ''}
            </p>

            {/* Modale */}
            {showModal && (
                <ArticleModal
                    article={modalArticle || undefined}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setModalArticle(null); }}
                />
            )}
        </div>
    );
}
