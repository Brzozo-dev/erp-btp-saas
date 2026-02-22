'use client';

import { useParametresStore, calculerCoutHoraire, CoefficientsParDefaut } from '@/lib/stores/parametresStore';
import { Settings, RotateCcw, Info, Calculator, ArrowRight, AlertTriangle, BookText, FileText, Tags, Plus, Trash2, Briefcase, Hash } from 'lucide-react';
import { useState } from 'react';

const coeffLabels: Record<keyof CoefficientsParDefaut, { label: string; description: string; color: string; bgColor: string }> = {
    mod: {
        label: 'Main d\'œuvre directe (MOD)',
        description: 'Coefficient appliqué aux heures de main d\'œuvre pour couvrir les charges sociales, frais de structure, etc.',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-200',
    },
    fourniture: {
        label: 'Fournitures (FRN)',
        description: 'Coefficient appliqué aux achats de fournitures pour couvrir les frais d\'approvisionnement, stockage, etc.',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50 border-emerald-200',
    },
    materiel: {
        label: 'Matériel / Location (MAT)',
        description: 'Coefficient appliqué aux locations et amortissements de matériel pour couvrir l\'usure, transport, etc.',
        color: 'text-orange-700',
        bgColor: 'bg-orange-50 border-orange-200',
    },
    sousTraitance: {
        label: 'Sous-traitance (S/T)',
        description: 'Coefficient appliqué aux prestations sous-traitées pour couvrir les frais de gestion et suivi.',
        color: 'text-purple-700',
        bgColor: 'bg-purple-50 border-purple-200',
    },
};

function formatMontant(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatCoeff(val: number): string {
    return val.toFixed(2);
}

export default function ParametresPage() {
    const {
        coefficients,
        updateCoefficient,
        resetAll,
        coutHoraireMO,
        setCoutHoraireMO,
        beneficeParDefaut,
        setBeneficeParDefaut,
        calculMO,
        setCalculMO,
        devisNumeroInitial,
        devisNumeroActuel,
        setDevisNumeroInitial,
        typesTravaux,
        addTypeTravaux,
        updateTypeTravaux,
        removeTypeTravaux,
        tagCategories,
        addTagCategorie,
        removeTagCategorie,
        addTag,
        removeTag,
    } = useParametresStore();

    const coutHoraireBrut = calculerCoutHoraire(calculMO);

    const [activeTab, setActiveTab] = useState<'general' | 'compta' | 'tags'>('general');
    const [newTypeTravaux, setNewTypeTravaux] = useState('');
    const [newTagCat, setNewTagCat] = useState('');
    const [newTagInputs, setNewTagInputs] = useState<Record<string, string>>({});
    const [numeroInput, setNumeroInput] = useState<string>(String(devisNumeroInitial));
    const [numeroApplique, setNumeroApplique] = useState(false);

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            {/* En-tête */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Settings className="w-6 h-6 text-gray-700" />
                        <h1 className="text-2xl font-bold text-gray-900">Paramètres Généraux</h1>
                    </div>
                    <p className="text-gray-500">
                        Configurez les valeurs par défaut appliquées aux nouveaux devis.
                    </p>
                </div>
                <button
                    onClick={resetAll}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tout réinitialiser
                </button>
            </div>

            {/* Avertissement */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                    <p className="font-medium">Important</p>
                    <p>
                        Les modifications des paramètres <strong>n'affectent que les nouveaux documents</strong> créés par la suite.
                        Les devis et factures existants conservent les valeurs avec lesquelles ils ont été créés.
                    </p>
                </div>
            </div>

            {/* Onglets */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    Devis et Chiffrage
                </button>
                <button
                    onClick={() => setActiveTab('compta')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'compta' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <BookText className="w-4 h-4" />
                    Comptabilité et Facturation
                </button>
                <button
                    onClick={() => setActiveTab('tags')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'tags' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Tags className="w-4 h-4" />
                    Tags &amp; Travaux
                </button>
            </div>

            {activeTab === 'general' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                    {/* ============================================================ */}
                    {/* SECTION 1 : COÛT HORAIRE MAIN D'ŒUVRE */}
                    {/* ============================================================ */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-3">
                            <Calculator className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-900">Coût Horaire Main d'œuvre</h2>
                        </div>

                        {/* Calculateur */}
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3">
                                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                    <Calculator className="w-4 h-4" />
                                    Calculateur — Estimation du coût horaire
                                </h3>
                                <p className="text-blue-100 text-xs mt-0.5">
                                    Saisissez les données de l'exercice N-1 pour calculer automatiquement le coût horaire de référence
                                </p>
                            </div>

                            <div className="p-6">
                                {/* Grille des 3 inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    {/* Masse salariale */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Masse salariale productive chargée
                                            <span className="block text-xs font-normal text-gray-400 mt-0.5">Exercice N-1</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="100"
                                                min="0"
                                                value={calculMO.masseSalariale || ''}
                                                onChange={(e) => setCalculMO({ masseSalariale: parseFloat(e.target.value) || 0 })}
                                                placeholder="ex: 450 000"
                                                className="w-full h-12 pl-4 pr-10 text-lg font-semibold rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">€</span>
                                        </div>
                                    </div>

                                    {/* Heures payées */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Total heures payées
                                            <span className="block text-xs font-normal text-gray-400 mt-0.5">Exercice N-1</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="1"
                                                min="0"
                                                value={calculMO.heuresPayees || ''}
                                                onChange={(e) => setCalculMO({ heuresPayees: parseFloat(e.target.value) || 0 })}
                                                placeholder="ex: 15 600"
                                                className="w-full h-12 pl-4 pr-10 text-lg font-semibold rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">H</span>
                                        </div>
                                    </div>

                                    {/* Coefficient d'improductivité */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Coefficient d'improductivité
                                            <span className="block text-xs font-normal text-gray-400 mt-0.5">Congés, intempéries, pannes…</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max="80"
                                                value={calculMO.coeffImproductivite}
                                                onChange={(e) => setCalculMO({ coeffImproductivite: parseFloat(e.target.value) || 0 })}
                                                className="w-full h-12 pl-4 pr-10 text-lg font-semibold rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="40"
                                            step="0.5"
                                            value={calculMO.coeffImproductivite}
                                            onChange={(e) => setCalculMO({ coeffImproductivite: parseFloat(e.target.value) })}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400">
                                            <span>0%</span>
                                            <span>40%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Résultat du calculateur */}
                                {coutHoraireBrut !== null ? (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Détail du calcul */}
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Détail du calcul</p>
                                                <div className="bg-white rounded-lg p-3 text-sm space-y-1.5 font-mono text-gray-700">
                                                    <p>Heures productives = {formatMontant(calculMO.heuresPayees)} × (1 − {calculMO.coeffImproductivite}%)</p>
                                                    <p className="font-bold text-blue-800">
                                                        = {formatMontant(calculMO.heuresPayees * (1 - calculMO.coeffImproductivite / 100))} H
                                                    </p>
                                                    <div className="border-t pt-1.5 mt-1.5">
                                                        <p>Coût horaire = {formatMontant(calculMO.masseSalariale)} € / {formatMontant(calculMO.heuresPayees * (1 - calculMO.coeffImproductivite / 100))} H</p>
                                                        <p className="font-bold text-blue-800 text-base">
                                                            = {formatMontant(coutHoraireBrut)} €/H
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Appliquer comme base */}
                                            <div className="flex flex-col justify-center items-center text-center space-y-3">
                                                <p className="text-sm text-gray-600">Résultat calculé</p>
                                                <p className="text-4xl font-bold text-blue-700 tabular-nums">{formatMontant(coutHoraireBrut)} €/H</p>
                                                <button
                                                    onClick={() => setCoutHoraireMO(Math.round(coutHoraireBrut * 100) / 100)}
                                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                    Appliquer comme coût par défaut
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                                        <p className="text-sm text-gray-500">
                                            Saisissez la masse salariale et les heures payées pour obtenir le calcul automatique du coût horaire.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Coût horaire appliqué */}
                        <div className="bg-white rounded-xl border shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-gray-900 mb-1">Coût horaire moyen applicable par défaut</h3>
                                    <p className="text-sm text-gray-500">
                                        Cette valeur sera utilisée comme prix unitaire de main d'œuvre pour toutes les nouvelles lignes MOD des devis.
                                        {coutHoraireBrut !== null && (
                                            <span className="block mt-1 text-blue-600">
                                                Valeur calculée ci-dessus : {formatMontant(coutHoraireBrut)} €/H — ajustez si nécessaire.
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.50"
                                            min="0"
                                            value={coutHoraireMO}
                                            onChange={(e) => setCoutHoraireMO(parseFloat(e.target.value) || 0)}
                                            className="w-28 h-14 text-center text-2xl font-bold rounded-xl border-2 border-blue-300 bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-800"
                                        />
                                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400 font-medium">
                                            €/H
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* SECTION 2 : COEFFICIENTS DE FRAIS GÉNÉRAUX */}
                    {/* ============================================================ */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-3">
                            <Settings className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-bold text-gray-900">Coefficients de Frais Généraux</h2>
                        </div>

                        {/* Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Comment ça fonctionne ?</p>
                                <p>
                                    Ces coefficients sont appliqués par défaut à chaque nouvelle ligne de devis pour calculer le <strong>prix de vente</strong> à partir du <strong>déboursé sec</strong>.
                                    Ils peuvent être modifiés individuellement sur chaque ligne d'un devis spécifique.
                                </p>
                                <p className="mt-1">
                                    <strong>Formule :</strong> Prix de vente = Déboursé sec × Coefficient
                                </p>
                            </div>
                        </div>

                        {/* Cartes coefficients */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(Object.keys(coeffLabels) as (keyof CoefficientsParDefaut)[]).map((key) => {
                                const config = coeffLabels[key];
                                const value = coefficients[key];

                                return (
                                    <div key={key} className={`rounded-xl border p-5 ${config.bgColor} space-y-4`}>
                                        <div>
                                            <h3 className={`text-base font-bold ${config.color}`}>{config.label}</h3>
                                            <p className="text-xs text-gray-600 mt-1">{config.description}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <label className="text-sm font-medium text-gray-700 w-20">Coefficient</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="1.00"
                                                    max="3.00"
                                                    value={value}
                                                    onChange={(e) => updateCoefficient(key, parseFloat(e.target.value) || 1)}
                                                    className="w-24 h-10 text-center text-lg font-bold rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <input
                                                type="range"
                                                min="1.00"
                                                max="2.50"
                                                step="0.01"
                                                value={value}
                                                onChange={(e) => updateCoefficient(key, parseFloat(e.target.value))}
                                                className="w-full h-2 bg-white/60 rounded-lg appearance-none cursor-pointer accent-gray-700"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-500">
                                                <span>1.00</span>
                                                <span>Exemple: 100€ × {formatCoeff(value)} = {(100 * value).toFixed(0)}€</span>
                                                <span>2.50</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ========== SECTION BÉNÉFICE ========== */}
                        <div className="bg-white rounded-xl border shadow-sm p-6 mt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-gray-900 mb-1">Marge / Bénéfice Applicable (%)</h3>
                                    <p className="text-sm text-gray-500">
                                        Ce pourcentage s'ajoute au coût de revient global (après application des frais généraux) pour déterminer le prix de vente HT.
                                        Vous pourrez le modifier ligne par ligne sur vos devis.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="1"
                                            min="0"
                                            value={beneficeParDefaut}
                                            onChange={(e) => setBeneficeParDefaut(parseFloat(e.target.value) || 0)}
                                            className="w-28 h-14 text-center text-2xl font-bold rounded-xl border-2 border-emerald-300 bg-emerald-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-800"
                                        />
                                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400 font-medium">
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ============================================================ */}
                    {/* SECTION 3 : NUMÉROTATION DES DEVIS */}
                    {/* ============================================================ */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-3">
                            <Hash className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-gray-900">Numérotation des Devis</h2>
                        </div>

                        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
                            {/* Info */}
                            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
                                <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-indigo-800">
                                    <p className="font-medium mb-1">Comment ça fonctionne ?</p>
                                    <p>
                                        Définissez le <strong>numéro de départ</strong> pour vos devis. Chaque nouveau devis reçoit
                                        automatiquement le numéro suivant. Vous pouvez aussi modifier le numéro directement sur
                                        un devis, ce qui <strong>redéfinit la base</strong> de la prochaine incrémentation.
                                    </p>
                                </div>
                            </div>

                            {/* Compteur courant */}
                            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                                <div>
                                    <p className="text-sm font-semibold text-indigo-700">Prochain numéro attribué</p>
                                    <p className="text-xs text-indigo-500 mt-0.5">Sera utilisé lors de la création du prochain devis</p>
                                </div>
                                <p className="text-4xl font-bold text-indigo-700 tabular-nums font-mono">{devisNumeroActuel}</p>
                            </div>

                            {/* Saisie numéro initial */}
                            <div className="flex items-end gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Redéfinir le numéro de départ
                                        <span className="block text-xs font-normal text-gray-400 mt-0.5">
                                            Le compteur et le numéro initial seront réinitialisés à cette valeur
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={numeroInput}
                                        onChange={(e) => {
                                            setNumeroInput(e.target.value);
                                            setNumeroApplique(false);
                                        }}
                                        className="w-full h-12 px-4 text-lg font-semibold rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="ex: 100"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const n = parseInt(numeroInput, 10);
                                        if (!isNaN(n) && n >= 1) {
                                            setDevisNumeroInitial(n);
                                            setNumeroApplique(true);
                                        }
                                    }}
                                    className="flex items-center gap-2 px-5 h-12 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                    Appliquer
                                </button>
                            </div>

                            {numeroApplique && (
                                <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                                    ✓ Compteur repositionné sur {devisNumeroInitial}. Le prochain devis recevra ce numéro.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'tags' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* ============================================================ */}
                    {/* TYPES DE TRAVAUX */}
                    {/* ============================================================ */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Briefcase className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Types de Travaux</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Ces types seront proposés à la sélection lors de la création d&apos;un devis (champ obligatoire).
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            {typesTravaux.map((tt) => (
                                <div key={tt.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className="text-sm font-medium text-gray-800">{tt.label}</span>
                                    <button
                                        onClick={() => removeTypeTravaux(tt.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nouveau type (ex: Réhabilitation...)"
                                value={newTypeTravaux}
                                onChange={(e) => setNewTypeTravaux(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTypeTravaux.trim()) {
                                        addTypeTravaux(newTypeTravaux.trim());
                                        setNewTypeTravaux('');
                                    }
                                }}
                                className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            <button
                                onClick={() => {
                                    if (newTypeTravaux.trim()) {
                                        addTypeTravaux(newTypeTravaux.trim());
                                        setNewTypeTravaux('');
                                    }
                                }}
                                className="flex items-center gap-2 px-4 h-10 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter
                            </button>
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* CATÉGORIES DE TAGS */}
                    {/* ============================================================ */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Tags className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Catégories de Tags</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Organisez vos tags par catégories pour classifier vos devis (nature client, secteur, priorité...).
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5 mb-6">
                            {tagCategories.map((cat) => (
                                <div key={cat.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                                        <span className="text-sm font-bold text-gray-700">{cat.label}</span>
                                        <button
                                            onClick={() => removeTagCategorie(cat.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="p-3 flex flex-wrap gap-2">
                                        {cat.tags.map((tag) => (
                                            <div key={tag.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                                {tag.label}
                                                <button
                                                    onClick={() => removeTag(cat.id, tag.id)}
                                                    className="text-purple-500 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="text"
                                                placeholder="+ Tag..."
                                                value={newTagInputs[cat.id] || ''}
                                                onChange={(e) => setNewTagInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && (newTagInputs[cat.id] || '').trim()) {
                                                        addTag(cat.id, (newTagInputs[cat.id] || '').trim());
                                                        setNewTagInputs(prev => ({ ...prev, [cat.id]: '' }));
                                                    }
                                                }}
                                                className="h-7 px-2 text-xs rounded-full border border-purple-300 focus:ring-1 focus:ring-purple-400 outline-none w-24"
                                            />
                                            <button
                                                onClick={() => {
                                                    const v = (newTagInputs[cat.id] || '').trim();
                                                    if (v) {
                                                        addTag(cat.id, v);
                                                        setNewTagInputs(prev => ({ ...prev, [cat.id]: '' }));
                                                    }
                                                }}
                                                className="p-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nouvelle catégorie (ex: Zone géographique...)"
                                value={newTagCat}
                                onChange={(e) => setNewTagCat(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTagCat.trim()) {
                                        addTagCategorie(newTagCat.trim());
                                        setNewTagCat('');
                                    }
                                }}
                                className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <button
                                onClick={() => {
                                    if (newTagCat.trim()) {
                                        addTagCategorie(newTagCat.trim());
                                        setNewTagCat('');
                                    }
                                }}
                                className="flex items-center gap-2 px-4 h-10 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter catégorie
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
