import { useState } from "react";
import { X, Euro } from "lucide-react";
import { ModeReglement } from "@/types/reglement";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Facture } from "@/types/facture";

interface ReglementModalProps {
    facture: Facture;
    resteAPayer: number;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { dateReglement: string; montant: number; modeReglement: ModeReglement; referenceExterne?: string; notes?: string }) => void;
}

export function ReglementModal({ facture, resteAPayer, isOpen, onClose, onSave }: ReglementModalProps) {
    const [dateReglement, setDateReglement] = useState(new Date().toISOString().split('T')[0]);
    const [montant, setMontant] = useState(resteAPayer.toString());
    const [modeReglement, setModeReglement] = useState<ModeReglement>("VIREMENT");
    const [referenceExterne, setReferenceExterne] = useState("");
    const [notes, setNotes] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedMontant = parseFloat(montant);
        if (isNaN(parsedMontant) || parsedMontant <= 0) return;

        onSave({
            dateReglement: new Date(dateReglement).toISOString(),
            montant: parsedMontant,
            modeReglement,
            referenceExterne: referenceExterne.trim() || undefined,
            notes: notes.trim() || undefined
        });

        // Reset form for next time
        setDateReglement(new Date().toISOString().split('T')[0]);
        setMontant(resteAPayer.toString());
        setModeReglement("VIREMENT");
        setReferenceExterne("");
        setNotes("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold">Enregistrer un règlement</h2>
                        <p className="text-sm text-gray-500">Facture {facture.reference} - {facture.clientName}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-900">Reste à payer :</span>
                    <span className="text-lg font-bold text-indigo-700">{formatCurrency(resteAPayer)}</span>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Montant reçu</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                max={resteAPayer}
                                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={montant}
                                onChange={(e) => setMontant(e.target.value)}
                                required
                            />
                            <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Date du règlement</label>
                        <input
                            type="date"
                            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={dateReglement}
                            onChange={(e) => setDateReglement(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Mode de règlement</label>
                        <select
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={modeReglement}
                            onChange={(e) => setModeReglement(e.target.value as ModeReglement)}
                        >
                            <option value="VIREMENT">Virement bancaire</option>
                            <option value="CHEQUE">Chèque</option>
                            <option value="ESPECES">Espèces</option>
                            <option value="CB">Carte Bancaire</option>
                            <option value="BILLETS_A_ORDRE">Billets à ordre</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Référence externe (Ex: N° chèque)</label>
                        <input
                            type="text"
                            placeholder="Facultatif"
                            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={referenceExterne}
                            onChange={(e) => setReferenceExterne(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Notes facultatives</label>
                        <textarea
                            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Valider le paiement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
