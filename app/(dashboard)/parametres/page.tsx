'use client';

import { useParametresStore, calculerCoutHoraire, CoefficientsParDefaut } from '@/lib/stores/parametresStore';
import { Settings, RotateCcw, Info, Calculator, ArrowRight, AlertTriangle } from 'lucide-react';

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
        calculMO,
        setCalculMO,
    } = useParametresStore();

    // Calcul du coût horaire brut à partir des paramètres
    const coutHoraireBrut = calculerCoutHoraire(calculMO);

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-10">
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
                        Les modifications du coût horaire ou des coefficients de frais généraux <strong>n'affectent que les nouveaux devis</strong> créés par la suite.
                        Les devis existants conservent les valeurs avec lesquelles ils ont été créés.
                    </p>
                </div>
            </div>

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

            </div>
        </div>
    );
}
