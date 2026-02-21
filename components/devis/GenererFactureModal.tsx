import { useState } from "react";
import { X, FileText } from "lucide-react";
import { Quote } from "@/types/devis";
import { useFactureStore } from "@/lib/stores/factureStore";
import { useRouter } from "next/navigation";

interface GenererFactureModalProps {
    quote: Quote;
    isOpen: boolean;
    onClose: () => void;
}

export function GenererFactureModal({ quote, isOpen, onClose }: GenererFactureModalProps) {
    const { addFacture, getFacturesByDevis } = useFactureStore();
    const router = useRouter();

    const [type, setType] = useState<'ACOMPTE' | 'AVANCEMENT' | 'SOLDE'>('ACOMPTE');
    const [pourcentageInitial, setPourcentageInitial] = useState(30);
    const [montantFixe, setMontantFixe] = useState("");
    const [modeMontant, setModeMontant] = useState<'POURCENTAGE' | 'FIXE'>('POURCENTAGE');
    const [applyRetenue, setApplyRetenue] = useState(false);
    const [tauxRetenue, setTauxRetenue] = useState(5);

    if (!isOpen) return null;

    // Calculs pour l'aide à la saisie
    const montantBase = quote.totalHT || 0;
    const tvaRate = 0.20; // Simplifié, pourrait venir des params

    // Récupérer les acomptes existants pour ce devis
    const facturesExistantes = getFacturesByDevis(quote.id);
    const totalAcomptesExistants = facturesExistantes
        .filter(f => f.type === 'ACOMPTE')
        .reduce((sum, f) => sum + f.montantHT, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let ht = 0;

        if (type === 'ACOMPTE' || type === 'AVANCEMENT') {
            if (modeMontant === 'POURCENTAGE') {
                ht = montantBase * (pourcentageInitial / 100);
            } else {
                ht = parseFloat(montantFixe) || 0;
            }
        } else if (type === 'SOLDE') {
            // Le solde est le reste du montant HT du devis moins les acomptes déjà facturés
            ht = Math.max(0, montantBase - totalAcomptesExistants);
        }

        if (ht <= 0 && type !== 'SOLDE') return; // Sécurité

        let montantRetenueGarantie = 0;
        let dateLiberationRetenue;

        if (applyRetenue && type === 'SOLDE') {
            // La retenue se calcule généralement sur le total HT du marché
            montantRetenueGarantie = montantBase * (tauxRetenue / 100);

            const liberationDate = new Date();
            liberationDate.setFullYear(liberationDate.getFullYear() + 1);
            dateLiberationRetenue = liberationDate.toISOString();
        }

        const tva = ht * tvaRate;
        const ttc = ht + tva;

        addFacture({
            reference: "", // Sera auto-généré ou demandé plus tard
            devisId: quote.id,
            clientId: quote.clientId,
            clientName: quote.clientName,
            type: type,
            dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours par défaut
            montantHT: ht,
            montantTVA: tva,
            montantTTC: ttc,
            // Retenue de garantie (spécifique au SOLDE généralement, mais on le stocke selon le choix)
            hasRetenueGarantie: applyRetenue && type === 'SOLDE',
            tauxRetenueGarantie: applyRetenue ? tauxRetenue : undefined,
            montantRetenueGarantie: applyRetenue && type === 'SOLDE' ? montantRetenueGarantie : undefined,
            dateLiberationRetenue,
            isRetenueLiberee: applyRetenue ? false : undefined,
            // TODO: Gérer la déduction partielle des acomptes sur les factures d'avancement/solde
        });

        onClose();
        router.push('/factures');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-xl font-bold">Générer une Facture</h2>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-b text-sm">
                    Devis concerné : <span className="font-semibold">{quote.reference}</span> • Total : <span className="font-semibold">{(quote.totalHT * 1.2).toFixed(2)} € TTC</span>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Type de Facture</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="typeFacture" value="ACOMPTE" checked={type === 'ACOMPTE'} onChange={(e) => setType('ACOMPTE')} className="text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm">Acompte</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="typeFacture" value="AVANCEMENT" checked={type === 'AVANCEMENT'} onChange={(e) => setType('AVANCEMENT')} className="text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm">Avancement</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="typeFacture" value="SOLDE" checked={type === 'SOLDE'} onChange={(e) => setType('SOLDE')} className="text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm">Solde</span>
                            </label>
                        </div>
                    </div>

                    {(type === 'ACOMPTE' || type === 'AVANCEMENT') && (
                        <div className="rounded-lg border bg-gray-50 p-4 space-y-4 pt-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Mode de saisie du montant</label>
                                <div className="flex gap-4 mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="modeMontant" checked={modeMontant === 'POURCENTAGE'} onChange={() => setModeMontant('POURCENTAGE')} className="text-indigo-600" />
                                        <span className="text-sm">En pourcentage (%)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="modeMontant" checked={modeMontant === 'FIXE'} onChange={() => setModeMontant('FIXE')} className="text-indigo-600" />
                                        <span className="text-sm">Montant fixe (€ HT)</span>
                                    </label>
                                </div>
                            </div>

                            {modeMontant === 'POURCENTAGE' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pourcentage du devis HT</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number" min="1" max="100"
                                            className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            value={pourcentageInitial} onChange={(e) => setPourcentageInitial(parseInt(e.target.value))}
                                        />
                                        <span className="text-sm text-gray-500 font-medium">= {(montantBase * (pourcentageInitial / 100)).toFixed(2)} € HT</span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant facturé HT</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        value={montantFixe} onChange={(e) => setMontantFixe(e.target.value)}
                                        placeholder="Ex: 1500.00"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {type === 'SOLDE' && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-4">
                            <p className="text-sm text-emerald-800">
                                La facture de solde correspond au montant total du devis diminué des factures déjà émises.
                            </p>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Devis HT :</span>
                                    <span>{montantBase.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Acomptes facturés :</span>
                                    <span>- {totalAcomptesExistants.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2">
                                    <span>Total Solde HT :</span>
                                    <span>{Math.max(0, montantBase - totalAcomptesExistants).toFixed(2)} €</span>
                                </div>
                            </div>

                            <hr className="border-emerald-200" />

                            <div>
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-1 text-emerald-600 focus:ring-emerald-500 rounded"
                                        checked={applyRetenue}
                                        onChange={(e) => setApplyRetenue(e.target.checked)}
                                    />
                                    <span>
                                        <span className="block text-sm font-medium text-gray-900">Appliquer une retenue de garantie</span>
                                        <span className="block text-xs text-gray-500">Bloquera un pourcentage du montant pendant 1 an (date de facture + 1 an).</span>
                                    </span>
                                </label>
                            </div>

                            {applyRetenue && (
                                <div className="pl-6 pt-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Pourcentage de retenue</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number" min="0" max="100" step="0.1"
                                            className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            value={tauxRetenue} onChange={(e) => setTauxRetenue(parseFloat(e.target.value))}
                                        />
                                        <span className="text-sm text-gray-600">% du total HT (= {(montantBase * (tauxRetenue / 100)).toFixed(2)} €)</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Annuler
                        </button>
                        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                            Créer la Facture
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
