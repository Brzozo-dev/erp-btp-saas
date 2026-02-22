'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Quote, QuoteStatus, GlobalCoefficients, QuoteSection, QuoteItem } from '@/types/devis';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import QuoteSectionBlock from './QuoteSection';
import { ArrowLeft, Plus, Save, FileText } from 'lucide-react';
import Link from 'next/link';
import { GenererFactureModal } from './GenererFactureModal';
import { useParametresStore } from '@/lib/stores/parametresStore';

// Mock data for dropdowns
const WORK_TYPES = [
    'Rénovation',
    'Neuf',
    'Entretien',
    'Extension',
    'Aménagement extérieur',
];

const COMMERCIALS = [
    { id: 'u1', name: 'Jean Martin' },
    { id: 'u2', name: 'Sophie Dubois' },
    { id: 'u3', name: 'Marc Durand' },
];

const DEFAULT_COEFFICIENTS: GlobalCoefficients = {
    mo: 1.15,
    mat: 1.10,
    st: 1.05,
};

interface DevisFormProps {
    initialData?: Quote;
}

export default function DevisForm({ initialData }: DevisFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    const { beneficeParDefaut, consommerProchainNumeroDevis, redefinirCompteurDevis } = useParametresStore();

    // Ref guard : consommation unique du numéro à la création
    const numeroConsome = useRef(false);
    // État local : numéro entier (ex: 5)
    const [numeroDevis, setNumeroDevis] = useState<number | null>(null);

    // Construit la référence formatée DEV-YYYY-NNN
    function formatReference(num: number): string {
        const year = new Date().getFullYear();
        return `DEV-${year}-${String(num).padStart(3, '0')}`;
    }

    // Form State
    const [formData, setFormData] = useState<Partial<Quote>>(
        initialData || {
            reference: '',  // sera rempli après consommation du numéro
            clientId: '',
            clientName: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'ETUDE',
            sections: [],
            globalCoefficients: DEFAULT_COEFFICIENTS,
            benefice: beneficeParDefaut,
            totalHT: 0,
        }
    );

    // Consomme le prochain numéro une seule fois à la création d'un nouveau devis
    useEffect(() => {
        if (!initialData && !numeroConsome.current) {
            numeroConsome.current = true;
            const num = consommerProchainNumeroDevis();
            setNumeroDevis(num);
            setFormData(prev => ({ ...prev, reference: formatReference(num) }));
        } else if (initialData) {
            // En édition : extraire le numéro de la référence existante
            const parts = initialData.reference.split('-');
            const num = parseInt(parts[parts.length - 1], 10);
            setNumeroDevis(isNaN(num) ? null : num);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Calculations ---
    const totals = useMemo(() => {
        let totalHT = 0;
        let totalCost = 0;
        let totalHours = 0;

        const sections = formData.sections || [];
        const coeffs = formData.globalCoefficients || DEFAULT_COEFFICIENTS;

        sections.forEach(section => {
            section.items.forEach(item => {
                const spMO = item.unitPriceMO * coeffs.mo;
                const spMat = item.unitPriceMat * coeffs.mat;
                const spST = item.unitPriceST * coeffs.st;

                const itemBenefice = item.benefice !== undefined ? item.benefice : (formData.benefice || 0);

                // Pricing logic :
                // Cost = raw inputs (assuming they are direct costs)
                // Revient = Cost * globalCoefficients
                // Vente (Total HT) = Revient * (1 + benefice/100)

                const itemCost = (item.unitPriceMO + item.unitPriceMat + item.unitPriceST) * item.quantity;
                const itemRevient = (spMO + spMat + spST) * item.quantity;
                const itemTotalHT = itemRevient * (1 + itemBenefice / 100);

                totalHT += itemTotalHT;
                totalCost += itemCost;

                // Hours
                // If unit is 'h' or similar, we could track hours. 
                // For now, let's assume we don't track hours explicitly unless we parse 'h'.
                // Let's skip detailed MBH hours calculation for this specific MVP step to keep it simple, 
                // or just assume unitPriceMO is purely labor cost.
            });
        });

        const marginAmount = totalHT - totalCost;
        const marginPercent = totalHT > 0 ? (marginAmount / totalHT) * 100 : 0;
        const tva = totalHT * 0.20;
        const totalTTC = totalHT + tva;

        return { totalHT, totalCost, marginAmount, marginPercent, tva, totalTTC };
    }, [formData.sections, formData.globalCoefficients, formData.benefice]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        console.log('Saving quote:', { ...formData, totalHT: totals.totalHT });
        setTimeout(() => {
            setLoading(false);
            router.push('/devis');
        }, 1000);
    };

    const addSection = () => {
        const newSection: QuoteSection = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'Nouveau Lot',
            items: []
        };
        setFormData(prev => ({ ...prev, sections: [...(prev.sections || []), newSection] }));
    };

    const updateSection = (index: number, updatedSection: QuoteSection) => {
        const newSections = [...(formData.sections || [])];
        newSections[index] = updatedSection;
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const removeSection = (index: number) => {
        const newSections = (formData.sections || []).filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const statusColors: Record<QuoteStatus, string> = {
        ETUDE: 'bg-gray-100 text-gray-800',
        REMIS: 'bg-blue-100 text-blue-800',
        ACCEPTE: 'bg-green-100 text-green-800',
        REFUSE: 'bg-red-100 text-red-800',
        ANNULE: 'bg-gray-100 text-gray-500 line-through',
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
            {/* Header Actions */}
            <div className="flex justify-between items-center sticky top-0 bg-gray-50/95 backdrop-blur z-10 py-4 -mx-4 px-4 border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/devis" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {initialData ? `Édition Devis ${initialData.reference}` : 'Nouveau Devis'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {formData.clientName || 'Nouveau client'} • {formData.date}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="mr-4">
                        <select
                            value={formData.status || 'ETUDE'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as QuoteStatus })}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none ${formData.status ? statusColors[formData.status as QuoteStatus] : 'bg-gray-100'}`}
                        >
                            <option value="ETUDE">Étude</option>
                            <option value="REMIS">Remis</option>
                            <option value="ACCEPTE">Accepté</option>
                            <option value="REFUSE">Refusé</option>
                            <option value="ANNULE">Annulé</option>
                        </select>
                    </div>
                    <Button type="button" variant="outline" onClick={() => router.push('/devis')}>
                        Annuler
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                        <Save className="w-4 h-4" />
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form & Sections */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Info Card */}
                    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations Générales</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Numéro du devis */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Numéro du Devis
                                    <span className="ml-2 text-xs font-normal text-gray-400">(modifiable — redéfinit la base d&apos;incrémentation)</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={numeroDevis ?? ''}
                                        onChange={(e) => {
                                            const n = parseInt(e.target.value, 10);
                                            if (!isNaN(n) && n >= 1) {
                                                setNumeroDevis(n);
                                                setFormData(prev => ({ ...prev, reference: formatReference(n) }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (numeroDevis !== null) {
                                                // Repositionne le compteur sur num+1 pour la prochaine création
                                                redefinirCompteurDevis(numeroDevis + 1);
                                            }
                                        }}
                                        className="w-32 h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base font-semibold"
                                    />
                                    <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-md text-sm font-mono font-semibold text-indigo-700">
                                        {formData.reference || '—'}
                                    </div>
                                    <span className="text-xs text-gray-400">Référence complète</span>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Nom du Projet</label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ex: Rénovation Cuisine Mme Martin"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                                <Input
                                    value={formData.clientName}
                                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                    placeholder="Nom du client"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Affecté</label>
                                <select
                                    className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    onChange={(e) => console.log('Commercial selected', e.target.value)}
                                >
                                    <option value="">Sélectionner...</option>
                                    {COMMERCIALS.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'émission</label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valable jusqu'au</label>
                                <Input
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type de Travaux</label>
                                <select
                                    className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    onChange={(e) => console.log('Work Type selected', e.target.value)}
                                >
                                    <option value="">Sélectionner...</option>
                                    {WORK_TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                <select
                                    className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as QuoteStatus })}
                                >
                                    <option value="DRAFT">Brouillon</option>
                                    <option value="SENT">Envoyé</option>
                                    <option value="ACCEPTED">Accepté</option>
                                    <option value="REFUSED">Refusé</option>
                                    <option value="CANCELLED">Annulé</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTIONS LIST */}
                    <div className="space-y-6">
                        {formData.sections?.map((section, index) => (
                            <QuoteSectionBlock
                                key={section.id}
                                section={section}
                                globalCoefficients={formData.globalCoefficients || DEFAULT_COEFFICIENTS}
                                globalBenefice={formData.benefice || 0}
                                onChange={(updated) => updateSection(index, updated)}
                                onDelete={() => removeSection(index)}
                            />
                        ))}

                        <button
                            type="button"
                            onClick={addSection}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-500 transition-colors flex items-center justify-center font-medium"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Ajouter un Lot (Section)
                        </button>
                    </div>
                </div>

                {/* Right Column: Settings & Summary */}
                <div className="space-y-6">
                    {/* Coefficients Card */}
                    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Paramètres Financiers</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                    <span className="text-blue-700">Coef. Main d'Œuvre</span>
                                    <span className="font-bold">{formData.globalCoefficients?.mo.toFixed(2)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1.0"
                                    max="2.0"
                                    step="0.01"
                                    value={formData.globalCoefficients?.mo}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        globalCoefficients: { ...formData.globalCoefficients!, mo: parseFloat(e.target.value) }
                                    })}
                                    className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <p className="text-xs text-gray-500 mt-1">Coût par défaut × {formData.globalCoefficients?.mo.toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                    <span className="text-orange-700">Coef. Matériaux</span>
                                    <span className="font-bold">{formData.globalCoefficients?.mat.toFixed(2)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1.0"
                                    max="2.0"
                                    step="0.01"
                                    value={formData.globalCoefficients?.mat}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        globalCoefficients: { ...formData.globalCoefficients!, mat: parseFloat(e.target.value) }
                                    })}
                                    className="w-full accent-orange-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                    <span className="text-purple-700">Coef. Sous-traitance</span>
                                    <span className="font-bold">{formData.globalCoefficients?.st.toFixed(2)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1.0"
                                    max="2.0"
                                    step="0.01"
                                    value={formData.globalCoefficients?.st}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        globalCoefficients: { ...formData.globalCoefficients!, st: parseFloat(e.target.value) }
                                    })}
                                    className="w-full accent-purple-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                    <span className="text-emerald-700">Marge globale (%)</span>
                                    <span className="font-bold">{formData.benefice?.toFixed(2)} %</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formData.benefice || 0}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        benefice: parseFloat(e.target.value) || 0
                                    })}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Card */}
                    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg space-y-4 sticky top-24">
                        <h2 className="text-lg font-semibold border-b border-gray-700 pb-2">Synthèse</h2>

                        {/* Internal Metrics (Back-office view) */}
                        <div className="space-y-1 pb-4 border-b border-gray-700">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Coût de revient estimé</span>
                                <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totals.totalCost)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-emerald-400">
                                <span>Marge ({totals.marginPercent.toFixed(1)}%)</span>
                                <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totals.marginAmount)}</span>
                            </div>
                        </div>

                        {/* Client Metrics */}
                        <div className="space-y-2 text-sm pt-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total HT</span>
                                <span className="font-bold text-lg">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totals.totalHT)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">TVA (20%)</span>
                                <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totals.tva)}</span>
                            </div>
                            <div className="border-t border-gray-700 pt-3 flex justify-between items-end">
                                <span className="text-gray-300 font-medium">Total TTC</span>
                                <span className="font-bold text-2xl text-emerald-400">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totals.totalTTC)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {initialData && (
                <GenererFactureModal
                    quote={initialData}
                    isOpen={isInvoiceModalOpen}
                    onClose={() => setIsInvoiceModalOpen(false)}
                />
            )}
        </form>
    );
}
