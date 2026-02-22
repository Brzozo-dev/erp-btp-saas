'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, ArrowLeft, ChevronDown, ChevronRight, Check, X, Printer, FileDown, Info, Save, GripVertical, Search } from 'lucide-react';
import Link from 'next/link';
import { useParametresStore } from '@/lib/stores/parametresStore';
import { useArticleStore, Article, ArticleType } from '@/lib/stores/articleStore';
import { useOuvrageStore } from '@/lib/stores/ouvrageStore';
import { useClientStore } from '@/lib/stores/clientStore';
import { QuoteStatus } from '@/types/devis';
import { ClientSelector } from '@/components/devis/ClientSelector';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ============================================================
// TYPES
// ============================================================
type SubItemType = 'MOD' | 'FOURNITURE' | 'MATERIEL' | 'SOUS_TRAITANCE';

interface SubItem {
    id: string;
    designation: string;
    quantite: number;
    unite: string;
    prixUnitaire: number;
    type: SubItemType;
    coefficient: number;
    tauxTVA: number;
    articleId?: string; // Lien vers la base articles
    prixOriginal?: number; // Prix initial (pour détecter un changement)
}

interface Ouvrage {
    id: string;
    designation: string;
    quantite: number;
    unite: string;
    prixUnitaire: number;
    montantHT: number;
    notes?: string[];
    sousLignes: SubItem[];
}

interface Section {
    id: string;
    titre: string;
    ouvrages: Ouvrage[];
}

// ============================================================
// CODE COULEUR PAR TYPE
// ============================================================
const typeConfig: Record<SubItemType, {
    label: string;
    abbreviation: string;
    textColor: string;
    borderColor: string;
    stripeBg: string;
    dotColor: string;
    badgeBg: string;
    badgeText: string;
    storeKey: 'mod' | 'fourniture' | 'materiel' | 'sousTraitance';
}> = {
    MOD: {
        label: 'Main d\'œuvre directe',
        abbreviation: 'MOD',
        textColor: 'text-blue-700',
        borderColor: 'border-l-blue-500',
        stripeBg: 'bg-blue-50/40',
        dotColor: 'bg-blue-500',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800',
        storeKey: 'mod',
    },
    FOURNITURE: {
        label: 'Fournitures',
        abbreviation: 'FRN',
        textColor: 'text-emerald-700',
        borderColor: 'border-l-emerald-500',
        stripeBg: 'bg-emerald-50/40',
        dotColor: 'bg-emerald-500',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800',
        storeKey: 'fourniture',
    },
    MATERIEL: {
        label: 'Matériel / Location',
        abbreviation: 'MAT',
        textColor: 'text-orange-700',
        borderColor: 'border-l-orange-500',
        stripeBg: 'bg-orange-50/40',
        dotColor: 'bg-orange-500',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-800',
        storeKey: 'materiel',
    },
    SOUS_TRAITANCE: {
        label: 'Sous-traitance',
        abbreviation: 'S/T',
        textColor: 'text-purple-700',
        borderColor: 'border-l-purple-500',
        stripeBg: 'bg-purple-50/40',
        dotColor: 'bg-purple-500',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-800',
        storeKey: 'sousTraitance',
    },
};

// ============================================================
// HELPER
// ============================================================
function formatMontant(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

// ============================================================
// DONNÉES MOCK — initialisées avec les coefficients par défaut
// ============================================================
function createMockSections(defaultCoeffs: Record<string, number>): Section[] {
    const c = (type: SubItemType) => defaultCoeffs[typeConfig[type].storeKey] || 1.0;

    return [
        {
            id: 's1',
            titre: 'TRAVAUX SUR L\'EXISTANT',
            ouvrages: [
                {
                    id: 'o1',
                    designation: 'Installation de chantier, repli et récolement, propre aux travaux de paysage',
                    quantite: 1.00, unite: 'Ft', prixUnitaire: 498.20, montantHT: 498.20,
                    sousLignes: [
                        { id: 'sl1', designation: 'Main d\'œuvre directe', quantite: 8.00, unite: 'H', prixUnitaire: 23.50, type: 'MOD', coefficient: c('MOD'), tauxTVA: 20 },
                        { id: 'sl1b', designation: 'Panneau de chantier + consommables', quantite: 1.00, unite: 'ens', prixUnitaire: 310.20, type: 'FOURNITURE', coefficient: c('FOURNITURE'), tauxTVA: 20 },
                    ],
                },
                {
                    id: 'o2',
                    designation: 'Abattage de la végétation',
                    quantite: 1.00, unite: 'Ft', prixUnitaire: 2361.68, montantHT: 2361.68,
                    notes: ['6 arbres'],
                    sousLignes: [
                        { id: 'sl2', designation: 'Déchets verts', quantite: 5.00, unite: 'M3', prixUnitaire: 18.00, type: 'FOURNITURE', coefficient: c('FOURNITURE'), tauxTVA: 20 },
                        { id: 'sl3', designation: 'Location broyeur branche', quantite: 1.00, unite: 'J', prixUnitaire: 200.00, type: 'MATERIEL', coefficient: c('MATERIEL'), tauxTVA: 20 },
                        { id: 'sl4', designation: 'Main d\'œuvre directe', quantite: 32.00, unite: 'H', prixUnitaire: 23.50, type: 'MOD', coefficient: c('MOD'), tauxTVA: 20 },
                    ],
                },
                {
                    id: 'o3',
                    designation: 'Abattage et dessouchage d\'arbre',
                    quantite: 6.00, unite: 'U', prixUnitaire: 219.08, montantHT: 1314.48,
                    sousLignes: [
                        { id: 'sl5', designation: 'Rogneuse de souche en location', quantite: 1.00, unite: 'J', prixUnitaire: 250.00, type: 'MATERIEL', coefficient: c('MATERIEL'), tauxTVA: 20 },
                        { id: 'sl6', designation: 'Main d\'œuvre directe', quantite: 16.00, unite: 'H', prixUnitaire: 23.50, type: 'MOD', coefficient: c('MOD'), tauxTVA: 20 },
                    ],
                },
                {
                    id: 'o4',
                    designation: 'Transplantation de palmier',
                    quantite: 8.00, unite: 'U', prixUnitaire: 866.55, montantHT: 6932.40,
                    notes: ['aucune garantie de reprise possible', 'compris frais de grutages'],
                    sousLignes: [
                        { id: 'sl7', designation: 'Location mini-pelle 5T', quantite: 2.00, unite: 'J', prixUnitaire: 350.00, type: 'MATERIEL', coefficient: c('MATERIEL'), tauxTVA: 20 },
                        { id: 'sl8', designation: 'Loca grue automotrice', quantite: 2.00, unite: 'J', prixUnitaire: 1200.00, type: 'MATERIEL', coefficient: c('MATERIEL'), tauxTVA: 20 },
                        { id: 'sl9', designation: 'Main d\'œuvre directe', quantite: 48.00, unite: 'H', prixUnitaire: 23.50, type: 'MOD', coefficient: c('MOD'), tauxTVA: 20 },
                    ],
                },
                {
                    id: 'o5',
                    designation: 'Protection de la végétation',
                    quantite: 140.00, unite: 'ml', prixUnitaire: 56.40, montantHT: 7896.00,
                    notes: ['cloture heras et planches bois sur durée du chantier'],
                    sousLignes: [
                        { id: 'sl10', designation: 'Fournitures diverses cloture heras et sabot (echamat kernst)', quantite: 1.00, unite: 'ens', prixUnitaire: 4250.00, type: 'FOURNITURE', coefficient: c('FOURNITURE'), tauxTVA: 20 },
                        { id: 'sl11', designation: 'Main d\'œuvre directe compris dépose', quantite: 40.00, unite: 'H', prixUnitaire: 23.50, type: 'MOD', coefficient: c('MOD'), tauxTVA: 20 },
                    ],
                },
                {
                    id: 'o6',
                    designation: 'Nettoyage de terrain et évacuation',
                    quantite: 1.00, unite: 'Ft', prixUnitaire: 996.40, montantHT: 996.40,
                    sousLignes: [
                        { id: 'sl12', designation: 'Main d\'œuvre directe', quantite: 16.00, unite: 'H', prixUnitaire: 23.50, type: 'MOD', coefficient: c('MOD'), tauxTVA: 20 },
                        { id: 'sl12b', designation: 'Évacuation déchets (benne 15m³)', quantite: 1.00, unite: 'U', prixUnitaire: 620.40, type: 'SOUS_TRAITANCE', coefficient: c('SOUS_TRAITANCE'), tauxTVA: 10 },
                    ],
                },
                {
                    id: 'o7',
                    designation: 'Élagage et taille de la végétation',
                    quantite: 1.00, unite: 'Ft', prixUnitaire: 2107.28, montantHT: 2107.28,
                    sousLignes: [
                        { id: 'sl13', designation: 'Déchets verts', quantite: 5.00, unite: 'M3', prixUnitaire: 18.00, type: 'FOURNITURE', coefficient: c('FOURNITURE'), tauxTVA: 20 },
                        { id: 'sl14', designation: 'Main d\'œuvre directe (à la perche)', quantite: 32.00, unite: 'H', prixUnitaire: 23.50, type: 'MOD', coefficient: c('MOD'), tauxTVA: 20 },
                    ],
                },
            ],
        },
        {
            id: 's2',
            titre: 'PLANTATIONS ET ENGAZONNEMENT',
            ouvrages: [
                {
                    id: 'o8',
                    designation: 'Fourniture et plantation d\'arbres tige 16/18',
                    quantite: 12.00, unite: 'U', prixUnitaire: 485.00, montantHT: 5820.00,
                    sousLignes: [
                        { id: 'sl15', designation: 'Arbre tige 16/18 (pépinière)', quantite: 1.00, unite: 'U', prixUnitaire: 280.00, type: 'FOURNITURE', coefficient: c('FOURNITURE'), tauxTVA: 20 },
                        { id: 'sl16', designation: 'Tuteurs, liens et protection', quantite: 1.00, unite: 'ens', prixUnitaire: 45.00, type: 'FOURNITURE', coefficient: c('FOURNITURE'), tauxTVA: 20 },
                        { id: 'sl17', designation: 'Main d\'œuvre directe plantation', quantite: 4.00, unite: 'H', prixUnitaire: 23.50, type: 'MOD', coefficient: c('MOD'), tauxTVA: 20 },
                        { id: 'sl18', designation: 'Mini-pelle pour fosses', quantite: 0.50, unite: 'J', prixUnitaire: 350.00, type: 'MATERIEL', coefficient: c('MATERIEL'), tauxTVA: 20 },
                    ],
                },
                {
                    id: 'o9',
                    designation: 'Engazonnement par semis',
                    quantite: 850.00, unite: 'm²', prixUnitaire: 8.75, montantHT: 7437.50,
                    sousLignes: [
                        { id: 'sl19', designation: 'Semence gazon sport/agrément', quantite: 0.04, unite: 'Kg', prixUnitaire: 12.00, type: 'FOURNITURE', coefficient: c('FOURNITURE'), tauxTVA: 20 },
                        { id: 'sl20', designation: 'Terreau végétal + amendement', quantite: 0.03, unite: 'M3', prixUnitaire: 65.00, type: 'FOURNITURE', coefficient: c('FOURNITURE'), tauxTVA: 20 },
                        { id: 'sl21', designation: 'Main d\'œuvre directe', quantite: 0.05, unite: 'H', prixUnitaire: 23.50, type: 'MOD', coefficient: c('MOD'), tauxTVA: 20 },
                    ],
                },
                {
                    id: 'o10',
                    designation: 'Mise en place réseau arrosage automatique',
                    quantite: 1.00, unite: 'Ft', prixUnitaire: 8950.00, montantHT: 8950.00,
                    sousLignes: [
                        { id: 'sl22', designation: 'Fourniture réseau arrosage (tuyaux, asperseurs, électrovannes)', quantite: 1.00, unite: 'ens', prixUnitaire: 3200.00, type: 'FOURNITURE', coefficient: c('FOURNITURE'), tauxTVA: 20 },
                        { id: 'sl23', designation: 'Programmateur Hunter Pro-HC', quantite: 1.00, unite: 'U', prixUnitaire: 450.00, type: 'FOURNITURE', coefficient: c('FOURNITURE'), tauxTVA: 20 },
                        { id: 'sl24', designation: 'Sous-traitance plomberie raccordement', quantite: 1.00, unite: 'Ft', prixUnitaire: 1800.00, type: 'SOUS_TRAITANCE', coefficient: c('SOUS_TRAITANCE'), tauxTVA: 10 },
                        { id: 'sl25', designation: 'Main d\'œuvre directe', quantite: 80.00, unite: 'H', prixUnitaire: 23.50, type: 'MOD', coefficient: c('MOD'), tauxTVA: 20 },
                        { id: 'sl26', designation: 'Mini-pelle tranchées', quantite: 3.00, unite: 'J', prixUnitaire: 350.00, type: 'MATERIEL', coefficient: c('MATERIEL'), tauxTVA: 20 },
                    ],
                },
            ],
        },
    ];
}

// ============================================================
// COMPOSANTS
// ============================================================

function TypeBadge({ type }: { type: SubItemType }) {
    const config = typeConfig[type];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${config.badgeBg} ${config.badgeText}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
            {config.abbreviation}
        </span>
    );
}

// ============================================================
// AUTOCOMPLETE ARTICLES
// ============================================================
function ArticleAutocomplete({ onSelect, onCancel }: { onSelect: (article: Article) => void; onCancel: () => void }) {
    const { articles, addArticle } = useArticleStore();
    const [query, setQuery] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [newDesignation, setNewDesignation] = useState('');
    const [newType, setNewType] = useState<ArticleType>('FOURNITURE');
    const [newUnite, setNewUnite] = useState('U');
    const [newPrix, setNewPrix] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const results = useMemo(() => {
        if (!query || query.length < 1) return [];
        const lq = query.toLowerCase();
        return articles.filter(a =>
            a.designation.toLowerCase().includes(lq) ||
            a.reference.toLowerCase().includes(lq)
        ).slice(0, 8);
    }, [query, articles]);

    const handleCreate = () => {
        if (!newDesignation.trim() || newPrix <= 0) return;
        const art = addArticle({ reference: '', designation: newDesignation, unite: newUnite, prixUnitaire: newPrix, type: newType });
        onSelect(art);
    };

    return (
        <tr className="bg-yellow-50/60">
            <td colSpan={9} className="py-2 pl-12 pr-4">
                {!showCreate ? (
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text" value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Rechercher un article (désignation ou référence)..."
                                className="flex-1 h-9 px-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                        </div>
                        {results.length > 0 && (
                            <div className="absolute z-30 left-6 right-10 mt-1 bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                                {results.map(a => {
                                    const cfg = typeConfig[a.type];
                                    return (
                                        <button key={a.id} onClick={() => onSelect(a)}
                                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-sm border-b last:border-b-0">
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${cfg.badgeBg} ${cfg.badgeText}`}>{cfg.abbreviation}</span>
                                            <span className="flex-1 font-medium text-gray-800">{a.designation}</span>
                                            <span className="text-gray-400 text-xs">{a.unite}</span>
                                            <span className="font-semibold tabular-nums text-gray-700">{formatMontant(a.prixUnitaire)} €</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {query.length >= 2 && results.length === 0 && (
                            <div className="absolute z-30 left-6 right-10 mt-1 bg-white border rounded-lg shadow-lg p-3">
                                <p className="text-sm text-gray-500 mb-2">Aucun article trouvé.</p>
                                <button onClick={() => { setShowCreate(true); setNewDesignation(query); }}
                                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                                    <Plus className="w-4 h-4" /> Créer « {query} »
                                </button>
                            </div>
                        )}
                        {query.length >= 1 && results.length > 0 && (
                            <button onClick={() => { setShowCreate(true); setNewDesignation(query); }}
                                className="mt-1 ml-6 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                                <Plus className="w-3 h-3" /> Créer un nouvel article
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                        <select value={newType} onChange={e => setNewType(e.target.value as ArticleType)}
                            className="h-8 text-xs font-semibold rounded border border-gray-300 px-1">
                            <option value="MOD">MOD</option><option value="FOURNITURE">FRN</option>
                            <option value="MATERIEL">MAT</option><option value="SOUS_TRAITANCE">S/T</option>
                        </select>
                        <input type="text" value={newDesignation} onChange={e => setNewDesignation(e.target.value)}
                            placeholder="Désignation" className="flex-1 h-8 px-2 text-sm rounded border border-gray-300 min-w-[200px]" />
                        <select value={newUnite} onChange={e => setNewUnite(e.target.value)}
                            className="h-8 text-xs rounded border border-gray-300 px-1 w-16">
                            <option value="H">H</option><option value="J">J</option><option value="U">U</option>
                            <option value="ens">ens</option><option value="Ft">Ft</option><option value="ml">ml</option>
                            <option value="m²">m²</option><option value="M3">M3</option><option value="Kg">Kg</option>
                        </select>
                        <input type="number" step="0.01" min="0" value={newPrix || ''} onChange={e => setNewPrix(parseFloat(e.target.value) || 0)}
                            placeholder="P.U." className="h-8 w-24 px-2 text-sm rounded border border-gray-300 text-right" />
                        <span className="text-xs text-gray-400">€</span>
                        <button onClick={handleCreate} disabled={!newDesignation.trim() || newPrix <= 0}
                            className="h-8 px-3 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" /> Créer & ajouter
                        </button>
                        <button onClick={() => setShowCreate(false)} className="h-8 px-2 text-xs text-gray-500 hover:text-gray-700">Retour</button>
                    </div>
                )}
            </td>
        </tr>
    );
}

// ============================================================
// DIALOGUE MAJ PRIX BASE
// ============================================================
function PriceUpdateDialog({ article, oldPrice, newPrice, onConfirm, onDismiss }: {
    article: { designation: string; articleId?: string }; oldPrice: number; newPrice: number;
    onConfirm: () => void; onDismiss: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3">
                    <h3 className="text-white font-bold text-sm">Modifier le prix dans la base articles ?</h3>
                </div>
                <div className="p-5 space-y-3">
                    <p className="text-sm text-gray-700">
                        Vous avez modifié le prix unitaire de <strong>{article.designation}</strong> dans ce devis.
                    </p>
                    <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                        <div className="text-center">
                            <p className="text-xs text-gray-400">Ancien prix</p>
                            <p className="font-bold text-gray-500 line-through tabular-nums">{formatMontant(oldPrice)} €</p>
                        </div>
                        <span className="text-gray-300">→</span>
                        <div className="text-center">
                            <p className="text-xs text-gray-400">Nouveau prix</p>
                            <p className="font-bold text-blue-700 tabular-nums">{formatMontant(newPrice)} €</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Souhaitez-vous aussi mettre à jour le prix de référence dans votre base articles ?
                    </p>
                </div>
                <div className="px-5 py-3 bg-gray-50 flex justify-end gap-2">
                    <button onClick={onDismiss} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-50">Non, uniquement ce devis</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg">Oui, mettre à jour la base</button>
                </div>
            </div>
        </div>
    );
}

function SubItemRow({ item, onCoeffChange, onTvaChange, onPriceChange, onQtyChange, onDelete }: { item: SubItem; onCoeffChange: (id: string, coeff: number) => void; onTvaChange: (id: string, taux: number) => void; onPriceChange: (id: string, newPrice: number) => void; onQtyChange: (id: string, qty: number) => void; onDelete: (id: string) => void }) {
    const config = typeConfig[item.type];
    const debourse = item.quantite * item.prixUnitaire;
    const prixVente = debourse * item.coefficient;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        borderLeftWidth: '3px',
        ...(isDragging ? { position: 'relative', zIndex: 10, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' } : {})
    };

    return (
        <tr ref={setNodeRef} style={style} className={`${config.stripeBg} border-l-3 ${config.borderColor} transition-colors hover:brightness-95 group ${isDragging ? 'opacity-50 bg-white' : ''}`}>
            <td className="py-2 pl-4 pr-2">
                <div className="flex items-center gap-1.5">
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-800 p-1">
                        <GripVertical className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all" title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <TypeBadge type={item.type} />
                    <span className={`text-sm ${config.textColor}`}>{item.designation}</span>
                </div>
            </td>
            <td className="py-1 px-1 text-right">
                <input type="number" step="0.01" min="0" value={item.quantite}
                    onChange={(e) => onQtyChange(item.id, parseFloat(e.target.value) || 0)}
                    className="w-16 h-7 text-right text-sm rounded border border-gray-200 focus:ring-2 focus:ring-blue-500 tabular-nums px-1" />
            </td>
            <td className="py-2 px-2 text-center text-sm text-gray-500 font-medium">{item.unite}</td>
            <td className="py-1 px-1 text-right">
                <input type="number" step="0.01" min="0" value={item.prixUnitaire}
                    onChange={(e) => onPriceChange(item.id, parseFloat(e.target.value) || 0)}
                    className="w-20 h-7 text-right text-sm rounded border border-gray-200 focus:ring-2 focus:ring-blue-500 tabular-nums px-1" />
            </td>
            <td className="py-2 px-3 text-right text-sm text-gray-600 tabular-nums">{formatMontant(debourse)}</td>
            <td className="py-1 px-2 text-center w-20">
                <input type="number" step="0.01" min="1.00" max="3.00" value={item.coefficient}
                    onChange={(e) => onCoeffChange(item.id, parseFloat(e.target.value) || 1)}
                    className={`w-14 h-7 text-center text-xs font-bold rounded border border-gray-200 focus:ring-2 focus:ring-blue-500 ${config.stripeBg}`} />
            </td>
            <td className="py-2 px-3 text-right text-sm font-semibold tabular-nums" style={{ color: config.textColor.includes('blue') ? '#1d4ed8' : config.textColor.includes('emerald') ? '#047857' : config.textColor.includes('orange') ? '#c2410c' : '#7e22ce' }}>
                {formatMontant(prixVente)}
            </td>
            <td className="py-1 px-1 text-center w-16">
                <select value={item.tauxTVA} onChange={(e) => onTvaChange(item.id, parseInt(e.target.value))}
                    className={`w-14 h-7 text-center text-xs font-semibold rounded border border-gray-200 ${config.stripeBg} cursor-pointer`}>
                    <option value={20}>20%</option>
                    <option value={10}>10%</option>
                </select>
            </td>
        </tr>
    );
}

function OuvrageRow({ ouvrage, onCoeffChange, onTvaChange, onPriceChange, onQtyChange, onDeleteLine, onAddArticle, onDeleteOuvrage, onUpdateOuvrage }: {
    ouvrage: Ouvrage;
    onCoeffChange: (id: string, coeff: number) => void;
    onTvaChange: (id: string, taux: number) => void;
    onPriceChange: (id: string, newPrice: number) => void;
    onQtyChange: (id: string, qty: number) => void;
    onDeleteLine: (id: string) => void;
    onAddArticle: (ouvrageId: string, article: Article) => void;
    onDeleteOuvrage: (id: string) => void;
    onUpdateOuvrage: (id: string, data: Partial<Ouvrage>) => void;
}) {
    const { addOuvrage } = useOuvrageStore();
    const [expanded, setExpanded] = useState(true);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(ouvrage.designation);
    const [newNote, setNewNote] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (editingName) nameInputRef.current?.focus(); }, [editingName]);

    const saveName = () => {
        if (nameValue.trim()) onUpdateOuvrage(ouvrage.id, { designation: nameValue.trim() });
        setEditingName(false);
    };

    const addNote = () => {
        if (!newNote.trim()) return;
        onUpdateOuvrage(ouvrage.id, { notes: [...(ouvrage.notes || []), newNote.trim()] });
        setNewNote('');
        setShowNoteInput(false);
    };

    const removeNote = (index: number) => {
        const updated = [...(ouvrage.notes || [])];
        updated.splice(index, 1);
        onUpdateOuvrage(ouvrage.id, { notes: updated });
    };

    const totalDebourse = ouvrage.sousLignes.reduce((acc, sl) => acc + sl.quantite * sl.prixUnitaire, 0);
    const totalPrixVente = ouvrage.sousLignes.reduce((acc, sl) => acc + sl.quantite * sl.prixUnitaire * sl.coefficient, 0);

    const handleSaveToLibrary = (e: React.MouseEvent) => {
        e.stopPropagation();
        addOuvrage({
            designation: ouvrage.designation,
            unite: ouvrage.unite,
            description: ouvrage.notes?.join(' '),
            subItems: ouvrage.sousLignes.map(sl => ({
                description: sl.designation,
                quantity: sl.quantite,
                unit: sl.unite,
                unitPrice: sl.prixUnitaire,
                type: sl.type === 'MOD' ? 'MO' : sl.type === 'SOUS_TRAITANCE' ? 'ST' : 'MAT',
                articleId: sl.articleId
            }))
        });
        alert(`Ouvrage "${ouvrage.designation}" sauvegardé dans la bibliothèque.`);
    };

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ouvrage.id });
    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 10, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' } : {})
    };

    return (
        <tbody ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
            <tr className="bg-white hover:bg-gray-50/80 border-b border-gray-200 transition-colors group">
                <td className="py-3 pl-4 pr-2">
                    <div className="flex items-start gap-2">
                        <button {...attributes} {...listeners} className="mt-0.5 p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-800">
                            <GripVertical className="w-4 h-4" />
                        </button>
                        <button onClick={() => setExpanded(!expanded)} className="mt-0.5 p-1 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0 cursor-pointer">
                            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div className="flex-1">
                            {editingName ? (
                                <input ref={nameInputRef} type="text" value={nameValue}
                                    onChange={(e) => setNameValue(e.target.value)}
                                    onBlur={saveName}
                                    onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameValue(ouvrage.designation); setEditingName(false); } }}
                                    className="w-full text-sm font-semibold text-gray-900 border border-blue-400 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            ) : (
                                <p className="font-semibold text-gray-900 text-sm leading-snug cursor-text hover:text-blue-700 transition-colors"
                                    onClick={() => setEditingName(true)} title="Cliquer pour modifier">
                                    {ouvrage.designation}
                                </p>
                            )}
                            {ouvrage.notes && ouvrage.notes.length > 0 && (
                                <ul className="mt-1 space-y-0.5">
                                    {ouvrage.notes.map((note, i) => (
                                        <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5 group/note">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                                            {note}
                                            <button onClick={() => removeNote(i)} className="opacity-0 group-hover/note:opacity-100 text-gray-300 hover:text-red-400 ml-1">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {showNoteInput ? (
                                <div className="flex items-center gap-1 mt-1">
                                    <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') addNote(); if (e.key === 'Escape') setShowNoteInput(false); }}
                                        autoFocus placeholder="Note / descriptif..."
                                        className="text-xs border border-gray-300 rounded px-2 py-1 flex-1 max-w-[250px] focus:ring-1 focus:ring-blue-500" />
                                    <button onClick={addNote} className="text-blue-600 hover:text-blue-800"><Check className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => { setShowNoteInput(false); setNewNote(''); }} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                                </div>
                            ) : (
                                <button onClick={() => setShowNoteInput(true)}
                                    className="mt-0.5 text-[10px] text-gray-400 hover:text-blue-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="w-2.5 h-2.5" /> note
                                </button>
                            )}
                        </div>
                        <button onClick={handleSaveToLibrary}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-emerald-500 transition-all mr-1" title="Sauvegarder l'ouvrage dans la base">
                            <Save className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteOuvrage(ouvrage.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all" title="Supprimer l'ouvrage">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
                <td className="py-2.5 px-2 text-right align-top">
                    <input type="number" step="0.01" min="0" value={ouvrage.quantite}
                        onChange={(e) => onUpdateOuvrage(ouvrage.id, { quantite: parseFloat(e.target.value) || 0 })}
                        className="w-full text-right text-sm font-semibold text-gray-900 rounded border border-transparent hover:border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white bg-transparent transition-all tabular-nums py-0.5 px-1" />
                </td>
                <td className="py-2.5 px-1 text-center align-top">
                    <input type="text" value={ouvrage.unite}
                        onChange={(e) => onUpdateOuvrage(ouvrage.id, { unite: e.target.value })}
                        className="w-full text-center text-sm font-medium text-gray-600 rounded border border-transparent hover:border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white bg-transparent transition-all py-0.5 px-1 uppercase" />
                </td>
                <td className="py-3 px-3 text-right font-semibold text-sm text-gray-900 tabular-nums align-top">{formatMontant(ouvrage.prixUnitaire)}</td>
                <td className="py-3 px-3 text-right font-semibold text-sm text-gray-600 tabular-nums align-top">{formatMontant(totalDebourse)}</td>
                <td className="py-3 px-2 text-center align-top"></td>
                <td className="py-3 px-3 text-right font-bold text-sm text-gray-900 tabular-nums align-top">{formatMontant(totalPrixVente)}</td>
                <td className="py-3 px-1 text-center align-top"></td>
            </tr>

            {expanded && (
                <SortableContext items={ouvrage.sousLignes.map(sl => sl.id)} strategy={verticalListSortingStrategy}>
                    {ouvrage.sousLignes.map((sl) => (
                        <SubItemRow key={sl.id} item={sl} onCoeffChange={onCoeffChange} onTvaChange={onTvaChange} onPriceChange={onPriceChange} onQtyChange={onQtyChange} onDelete={onDeleteLine} />
                    ))}
                </SortableContext>
            )}

            {expanded && showAutocomplete && (
                <ArticleAutocomplete
                    onSelect={(article) => { onAddArticle(ouvrage.id, article); setShowAutocomplete(false); }}
                    onCancel={() => setShowAutocomplete(false)}
                />
            )}

            {expanded && (
                <tr className="bg-gray-50/50">
                    <td colSpan={9} className="py-1 pl-12">
                        <button onClick={() => setShowAutocomplete(true)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium py-0.5">
                            <Plus className="w-3 h-3" /> Ajouter une ligne
                        </button>
                    </td>
                </tr>
            )}
        </tbody>
    );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================
export default function DevisPrototypePage() {
    const { coefficients } = useParametresStore();
    const { updateArticlePrice } = useArticleStore();

    // Status
    const [status, setStatus] = useState<QuoteStatus>('REMIS');
    const statusColors: Record<QuoteStatus, string> = {
        ETUDE: 'bg-gray-100 text-gray-800',
        REMIS: 'bg-blue-100 text-blue-800',
        ACCEPTE: 'bg-green-100 text-green-800',
        REFUSE: 'bg-red-100 text-red-800',
        ANNULE: 'bg-gray-100 text-gray-500 line-through',
    };

    const [sections, setSections] = useState<Section[]>(() => createMockSections(coefficients as unknown as Record<string, number>));
    const [priceDialog, setPriceDialog] = useState<{ subItemId: string; designation: string; articleId: string; oldPrice: number; newPrice: number } | null>(null);

    const { clients } = useClientStore();
    const [selectedClientId, setSelectedClientId] = useState<string | null>('c_1');
    const selectedClient = clients.find(c => c.id === selectedClientId);

    const { typesTravaux, tagCategories } = useParametresStore();
    const [typeTravaux, setTypeTravaux] = useState<string>(typesTravaux[0]?.id || '');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [commercial, setCommercial] = useState<string>('');

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const customCollisionDetection = useCallback((args: any) => {
        if (!args.active) return closestCenter(args);

        const activeId = String(args.active.id);
        const isOuvrage = activeId.startsWith('o');

        // Filter the droppable containers to only allow matching types
        const filteredContainers = args.droppableContainers.filter((c: any) => {
            const containerId = String(c.id);
            return isOuvrage ? (containerId.startsWith('o') && !containerId.startsWith('sl')) : containerId.startsWith('sl');
        });

        return closestCenter({
            ...args,
            droppableContainers: filteredContainers,
        });
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const activeId = active.id as string;
            const overId = over.id as string;

            const isOuvrageDrop = activeId.startsWith('o') && overId.startsWith('o') && !activeId.startsWith('sl') && !overId.startsWith('sl');
            const isSubItemDrop = activeId.startsWith('sl') && overId.startsWith('sl');

            if (isOuvrageDrop) {
                setSections(prev => prev.map(s => {
                    const activeIndex = s.ouvrages.findIndex(o => o.id === activeId);
                    const overIndex = s.ouvrages.findIndex(o => o.id === overId);
                    if (activeIndex !== -1 && overIndex !== -1) {
                        return { ...s, ouvrages: arrayMove(s.ouvrages, activeIndex, overIndex) };
                    }
                    return s;
                }));
            } else if (isSubItemDrop) {
                setSections(prev => prev.map(s => ({
                    ...s,
                    ouvrages: s.ouvrages.map(o => {
                        const activeIndex = o.sousLignes.findIndex(sl => sl.id === activeId);
                        const overIndex = o.sousLignes.findIndex(sl => sl.id === overId);
                        if (activeIndex !== -1 && overIndex !== -1) {
                            return { ...o, sousLignes: arrayMove(o.sousLignes, activeIndex, overIndex) };
                        }
                        return o;
                    })
                })));
            }
        }
    }, []);

    // === Generic sub-item updater ===
    const updateSubItem = useCallback((subItemId: string, updater: (sl: SubItem) => SubItem) => {
        setSections(prev => prev.map(s => ({
            ...s,
            ouvrages: s.ouvrages.map(o => ({
                ...o,
                sousLignes: o.sousLignes.map(sl => sl.id === subItemId ? updater(sl) : sl),
            })),
        })));
    }, []);

    const handleCoeffChange = useCallback((id: string, coeff: number) => updateSubItem(id, sl => ({ ...sl, coefficient: coeff })), [updateSubItem]);
    const handleTvaChange = useCallback((id: string, taux: number) => updateSubItem(id, sl => ({ ...sl, tauxTVA: taux })), [updateSubItem]);
    const handleQtyChange = useCallback((id: string, qty: number) => updateSubItem(id, sl => ({ ...sl, quantite: qty })), [updateSubItem]);

    const handlePriceChange = useCallback((id: string, newPrice: number) => {
        // Find the sub-item to check if it has an articleId
        let found: SubItem | undefined;
        sections.forEach(s => s.ouvrages.forEach(o => o.sousLignes.forEach(sl => { if (sl.id === id) found = sl; })));
        if (found && found.articleId && found.prixOriginal !== undefined && newPrice !== found.prixOriginal) {
            setPriceDialog({ subItemId: id, designation: found.designation, articleId: found.articleId, oldPrice: found.prixOriginal, newPrice });
        }
        updateSubItem(id, sl => ({ ...sl, prixUnitaire: newPrice }));
    }, [sections, updateSubItem]);

    const handleConfirmPriceUpdate = useCallback(() => {
        if (priceDialog) {
            updateArticlePrice(priceDialog.articleId, priceDialog.newPrice);
            // Also update prixOriginal so dialog doesn't re-trigger
            updateSubItem(priceDialog.subItemId, sl => ({ ...sl, prixOriginal: priceDialog.newPrice }));
        }
        setPriceDialog(null);
    }, [priceDialog, updateArticlePrice, updateSubItem]);

    const handleDeleteLine = useCallback((subItemId: string) => {
        setSections(prev => prev.map(s => ({
            ...s,
            ouvrages: s.ouvrages.map(o => ({
                ...o,
                sousLignes: o.sousLignes.filter(sl => sl.id !== subItemId),
            })),
        })));
    }, []);

    const handleDeleteOuvrage = useCallback((ouvrageId: string) => {
        setSections(prev => prev.map(s => ({
            ...s,
            ouvrages: s.ouvrages.filter(o => o.id !== ouvrageId),
        })));
    }, []);

    const handleUpdateOuvrage = useCallback((ouvrageId: string, data: Partial<Ouvrage>) => {
        setSections(prev => prev.map(s => ({
            ...s,
            ouvrages: s.ouvrages.map(o => o.id === ouvrageId ? { ...o, ...data } : o),
        })));
    }, []);

    const handleAddArticle = useCallback((ouvrageId: string, article: Article) => {
        const c = (type: SubItemType) => (coefficients as unknown as Record<string, number>)[typeConfig[type].storeKey] || 1.0;
        const newSubItem: SubItem = {
            id: `sl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            designation: article.designation,
            quantite: 1,
            unite: article.unite,
            prixUnitaire: article.prixUnitaire,
            type: article.type as SubItemType,
            coefficient: c(article.type as SubItemType),
            tauxTVA: article.type === 'SOUS_TRAITANCE' ? 10 : 20,
            articleId: article.id,
            prixOriginal: article.prixUnitaire,
        };
        setSections(prev => prev.map(s => ({
            ...s,
            ouvrages: s.ouvrages.map(o => o.id === ouvrageId ? { ...o, sousLignes: [...o.sousLignes, newSubItem] } : o),
        })));
    }, [coefficients]);

    const handleAddOuvrage = useCallback((sectionId: string) => {
        const newOuvrage: Ouvrage = {
            id: `o_${Date.now()}`,
            designation: 'Nouvel ouvrage',
            quantite: 1, unite: 'Ft', prixUnitaire: 0, montantHT: 0,
            sousLignes: [],
        };
        setSections(prev => prev.map(s => s.id === sectionId ? { ...s, ouvrages: [...s.ouvrages, newOuvrage] } : s));
    }, []);

    const handleAddSection = useCallback(() => {
        const newSection: Section = {
            id: `s_${Date.now()}`,
            titre: 'NOUVEAU LOT',
            ouvrages: [],
        };
        setSections(prev => [...prev, newSection]);
    }, []);

    // ===== CALCULS GLOBAUX =====
    const synthese = useMemo(() => {
        let totalHeures = 0;
        const deboursesParType: Record<SubItemType, number> = { MOD: 0, FOURNITURE: 0, MATERIEL: 0, SOUS_TRAITANCE: 0 };
        const pvParType: Record<SubItemType, number> = { MOD: 0, FOURNITURE: 0, MATERIEL: 0, SOUS_TRAITANCE: 0 };
        const tvaParTaux: Record<number, number> = {};

        sections.forEach(s => s.ouvrages.forEach(o => o.sousLignes.forEach(sl => {
            const debourse = sl.quantite * sl.prixUnitaire;
            const pv = debourse * sl.coefficient;
            deboursesParType[sl.type] += debourse;
            pvParType[sl.type] += pv;
            if (sl.type === 'MOD') totalHeures += sl.quantite;
            const taux = sl.tauxTVA;
            tvaParTaux[taux] = (tvaParTaux[taux] || 0) + pv * (taux / 100);
        })));

        const totalDebourses = Object.values(deboursesParType).reduce((a, b) => a + b, 0);
        const totalPrixVente = Object.values(pvParType).reduce((a, b) => a + b, 0);
        const margeGlobale = totalPrixVente - totalDebourses;
        const mbh = totalHeures > 0 ? margeGlobale / totalHeures : 0;
        const totalTVA = Object.values(tvaParTaux).reduce((a, b) => a + b, 0);
        const totalTTC = totalPrixVente + totalTVA;

        return { totalHeures, deboursesParType, pvParType, totalDebourses, totalPrixVente, margeGlobale, mbh, tvaParTaux, totalTVA, totalTTC };
    }, [sections]);

    return (
        <DndContext sensors={sensors} collisionDetection={customCollisionDetection} onDragEnd={handleDragEnd}>
            <div className="min-h-screen bg-gray-100">
                {/* Price update dialog */}
                {priceDialog && (
                    <PriceUpdateDialog
                        article={{ designation: priceDialog.designation, articleId: priceDialog.articleId }}
                        oldPrice={priceDialog.oldPrice}
                        newPrice={priceDialog.newPrice}
                        onConfirm={handleConfirmPriceUpdate}
                        onDismiss={() => setPriceDialog(null)}
                    />
                )}
                {/* En-tête */}
                <div className="bg-white border-b shadow-sm sticky top-0 z-20">
                    <div className="w-full 2xl:max-w-[1800px] mx-auto px-6 py-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <Link href="/devis" className="mt-1 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </Link>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-xl font-bold text-gray-900">DEV-2026-047</h1>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none appearance-none ${statusColors[status]}`}
                                        >
                                            <option value="ETUDE">Étude</option>
                                            <option value="REMIS">Remis (Envoyé)</option>
                                            <option value="ACCEPTE">Accepté</option>
                                            <option value="REFUSE">Refusé</option>
                                            <option value="ANNULE">Annulé</option>
                                        </select>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        SILENE ISAU ESPACES VERTS — Aménagement paysager
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/devis/new" className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium">
                                    <Plus className="w-4 h-4" />
                                    Créer un devis
                                </Link>
                                <Link href="/parametres" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    ⚙ Paramètres
                                </Link>
                                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Printer className="w-4 h-4" />
                                    Imprimer
                                </button>
                                <button className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium">
                                    <FileDown className="w-4 h-4" />
                                    Export PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full 2xl:max-w-[1800px] mx-auto px-6 py-6">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                        {/* Colonne principale — Détail du devis */}
                        <div className="xl:col-span-3 space-y-4">

                            {/* En-tête adresse + Classification */}
                            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
                                {/* Ligne 1: Adresses */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Adresse des travaux</h3>
                                        {selectedClient ? (
                                            <>
                                                <p className="text-sm font-medium text-gray-900">{selectedClient.adresseChantier || selectedClient.adresseFacturation}</p>
                                                <p className="text-sm text-gray-600">{selectedClient.codePostalChantier || selectedClient.codePostalFacturation} {selectedClient.villeChantier || selectedClient.villeFacturation}</p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">Aucun client sélectionné</p>
                                        )}
                                    </div>
                                    <div>
                                        <ClientSelector
                                            selectedClientId={selectedClientId}
                                            onChange={setSelectedClientId}
                                        />
                                    </div>
                                </div>

                                {/* Ligne 2: Classification */}
                                <div className="border-t pt-5 grid grid-cols-3 gap-5">
                                    {/* Type de travaux */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            Type de travaux <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            value={typeTravaux}
                                            onChange={(e) => setTypeTravaux(e.target.value)}
                                            className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white"
                                        >
                                            <option value="">-- Sélectionner --</option>
                                            {typesTravaux.map((tt) => (
                                                <option key={tt.id} value={tt.id}>{tt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Commercial affecté */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Commercial affecté</label>
                                        <input
                                            type="text"
                                            value={commercial}
                                            onChange={(e) => setCommercial(e.target.value)}
                                            placeholder="Prénom Nom..."
                                            className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tags</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {tagCategories.flatMap(cat => cat.tags).map(tag => (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() => toggleTag(tag.id)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${selectedTags.includes(tag.id)
                                                        ? 'bg-purple-600 text-white shadow-sm'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                                                        }`}
                                                >
                                                    {tag.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Légende des couleurs */}
                            <div className="bg-white rounded-xl border shadow-sm px-6 py-3">
                                <div className="flex items-center gap-6 flex-wrap">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                        <Info className="w-3.5 h-3.5" /> Légende :
                                    </span>
                                    {(Object.keys(typeConfig) as SubItemType[]).map((type) => {
                                        const config = typeConfig[type];
                                        return (
                                            <div key={type} className="flex items-center gap-2">
                                                <span className={`w-3 h-3 rounded-sm ${config.dotColor}`}></span>
                                                <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sections / Lots */}
                            {sections.map((section) => {
                                const sectionDebourse = section.ouvrages.reduce((a, o) =>
                                    a + o.sousLignes.reduce((b, sl) => b + sl.quantite * sl.prixUnitaire, 0), 0);
                                const sectionPV = section.ouvrages.reduce((a, o) =>
                                    a + o.sousLignes.reduce((b, sl) => b + sl.quantite * sl.prixUnitaire * sl.coefficient, 0), 0);

                                return (
                                    <div key={section.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-3 flex justify-between items-center">
                                            <h2 className="text-white font-bold text-sm tracking-wide uppercase">
                                                {section.titre}
                                            </h2>
                                            <span className="text-emerald-400 font-bold text-sm tabular-nums">
                                                {formatMontant(sectionPV)} €
                                            </span>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                        <th className="py-2.5 pl-10 pr-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                            Désignation
                                                        </th>
                                                        <th className="py-2.5 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                                                            Quantité
                                                        </th>
                                                        <th className="py-2.5 px-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                                                            Unité
                                                        </th>
                                                        <th className="py-2.5 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                                                            P.U.
                                                        </th>
                                                        <th className="py-2.5 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                                                            Déboursé
                                                        </th>
                                                        <th className="py-2.5 px-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                                                            Coeff.
                                                        </th>
                                                        <th className="py-2.5 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                                                            P.V. H.T.
                                                        </th>
                                                        <th className="py-2.5 px-1 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                                                            TVA
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <SortableContext items={section.ouvrages.map(o => o.id)} strategy={verticalListSortingStrategy}>
                                                    {section.ouvrages.map((ouvrage) => (
                                                        <OuvrageRow key={ouvrage.id} ouvrage={ouvrage}
                                                            onCoeffChange={handleCoeffChange} onTvaChange={handleTvaChange}
                                                            onPriceChange={handlePriceChange} onQtyChange={handleQtyChange}
                                                            onDeleteLine={handleDeleteLine} onAddArticle={handleAddArticle}
                                                            onDeleteOuvrage={handleDeleteOuvrage} onUpdateOuvrage={handleUpdateOuvrage} />
                                                    ))}
                                                </SortableContext>
                                            </table>
                                        </div>
                                        {/* Add ouvrage button */}
                                        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/50">
                                            <button onClick={() => handleAddOuvrage(section.id)}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium transition-colors rounded-lg border border-dashed border-blue-300 hover:border-blue-500">
                                                <Plus className="w-4 h-4" /> Ajouter un ouvrage
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add section (lot) button */}
                            <button onClick={handleAddSection}
                                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5" /> Ajouter un lot
                            </button>
                        </div>

                        {/* ===== SIDEBAR — Synthèse globale ===== */}
                        <div className="space-y-4 sticky top-24 self-start">

                            {/* Synthèse financière globale */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-5 text-white">
                                <h3 className="text-sm font-semibold text-gray-300 mb-4 pb-2 border-b border-gray-700">
                                    Synthèse financière
                                </h3>

                                {/* Total Heures */}
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-700">
                                    <span className="text-gray-400 text-sm">Total heures</span>
                                    <span className="font-bold text-lg text-blue-400 tabular-nums">{formatMontant(synthese.totalHeures)} H</span>
                                </div>

                                {/* Déboursés par catégorie */}
                                <div className="space-y-1.5 mb-3 pb-3 border-b border-gray-700">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Déboursés secs</p>
                                    {(Object.keys(typeConfig) as SubItemType[]).map((type) => {
                                        const config = typeConfig[type];
                                        const montant = synthese.deboursesParType[type] || 0;
                                        return (
                                            <div key={type} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-sm ${config.dotColor}`}></span>
                                                    <span className="text-xs text-gray-400">{config.abbreviation}</span>
                                                </div>
                                                <span className="text-sm font-medium tabular-nums">{formatMontant(montant)} €</span>
                                            </div>
                                        );
                                    })}
                                    <div className="flex justify-between items-center pt-1 mt-1 border-t border-gray-700">
                                        <span className="text-sm font-medium text-gray-300">Total déboursés</span>
                                        <span className="font-bold text-base tabular-nums">{formatMontant(synthese.totalDebourses)} €</span>
                                    </div>
                                </div>

                                {/* Prix de revient = total déboursés (dans ce contexte simplifié) */}
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-400 text-sm">Prix de revient</span>
                                    <span className="font-bold text-base tabular-nums text-orange-300">{formatMontant(synthese.totalDebourses)} €</span>
                                </div>

                                {/* Prix de vente */}
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-700">
                                    <span className="text-gray-400 text-sm">Prix de vente H.T.</span>
                                    <span className="font-bold text-lg tabular-nums">{formatMontant(synthese.totalPrixVente)} €</span>
                                </div>

                                {/* Marge */}
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-400 text-sm">Marge globale</span>
                                    <span className="font-bold text-base text-emerald-400 tabular-nums">
                                        +{formatMontant(synthese.margeGlobale)} €
                                    </span>
                                </div>

                                {/* MBH */}
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-700">
                                    <span className="text-gray-400 text-sm">Marge Brute Horaire</span>
                                    <span className="font-bold text-lg text-emerald-400 tabular-nums">
                                        {formatMontant(synthese.mbh)} €/H
                                    </span>
                                </div>

                                {/* TVA ventilée par taux */}
                                <div className="space-y-1 mb-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">TVA</p>
                                    {Object.entries(synthese.tvaParTaux)
                                        .sort(([a], [b]) => Number(b) - Number(a))
                                        .map(([taux, montant]) => (
                                            <div key={taux} className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">TVA {taux}%</span>
                                                <span className="font-medium text-sm tabular-nums">{formatMontant(montant)} €</span>
                                            </div>
                                        ))}
                                    <div className="flex justify-between items-center pt-1 mt-1 border-t border-gray-700">
                                        <span className="text-gray-300 text-sm font-medium">Total TVA</span>
                                        <span className="font-bold text-base tabular-nums">{formatMontant(synthese.totalTVA)} €</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end pt-2 border-t border-gray-700 mt-2">
                                    <span className="text-gray-300 font-medium">Total T.T.C.</span>
                                    <span className="font-bold text-2xl text-emerald-400 tabular-nums">
                                        {formatMontant(synthese.totalTTC)} €
                                    </span>
                                </div>
                            </div>

                            {/* Formule MBH */}
                            <div className="bg-white rounded-xl border shadow-sm p-4">
                                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Formule MBH</p>
                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 font-mono">
                                    <p>MBH = (PV - Déboursés) / Heures</p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        ({formatMontant(synthese.totalPrixVente)} - {formatMontant(synthese.totalDebourses)}) / {formatMontant(synthese.totalHeures)}
                                    </p>
                                    <p className="mt-1 font-bold text-emerald-700">
                                        = {formatMontant(synthese.mbh)} €/H
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DndContext>
    );
}
