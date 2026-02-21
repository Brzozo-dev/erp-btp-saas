"use client";

import { useFactureStore } from "@/lib/stores/factureStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, FileText, CheckCircle2, Clock, AlertCircle, DownloadCloud } from "lucide-react";
import { useState } from "react";
import { FactureStatus, Facture } from "@/types/facture";
import { ReglementModal } from "@/components/factures/ReglementModal";
import { genererEcrituresComptables, exportCsvEcritures } from "@/lib/utils/exportCompta";
import { telechargerXMLFacturX } from "@/lib/utils/generateFacturX";
import { telechargerPDF } from '@/lib/utils/generatePDF';

export default function FacturesPage() {
    const { factures, getResteAPayer, addReglement } = useFactureStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<FactureStatus | "ALL">("ALL");

    // Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);

    const handleOpenPayment = (facture: Facture) => {
        setSelectedFacture(facture);
        setIsPaymentModalOpen(true);
    };

    const handleSavePayment = (data: any) => {
        if (!selectedFacture) return;
        addReglement({
            ...data,
            factureId: selectedFacture.id
        });
        setIsPaymentModalOpen(false);
        setSelectedFacture(null);
    };

    const filteredFactures = factures.filter(facture => {
        const matchesSearch = facture.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            facture.clientName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || facture.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleExportCompta = () => {
        // Exporter uniquement les factures émises ou payées (pas les brouillons/annulées)
        const facturesAExporter = filteredFactures.filter(f => f.status !== 'BROUILLON' && f.status !== 'ANNULEE');
        if (facturesAExporter.length === 0) {
            alert("Aucune facture valide à exporter avec les filtres actuels.");
            return;
        }
        const ecritures = genererEcrituresComptables(facturesAExporter);
        exportCsvEcritures(ecritures);
    };

    const getStatusBadge = (status: FactureStatus) => {
        switch (status) {
            case 'BROUILLON':
                return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"><FileText className="h-3 w-3" /> Brouillon</span>;
            case 'EMISE':
                return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"><Clock className="h-3 w-3" /> Émise</span>;
            case 'PAYEE_PARTIELLEMENT':
                return <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700"><AlertCircle className="h-3 w-3" /> Partielle</span>;
            case 'PAYEE':
                return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Payée</span>;
            case 'ANNULEE':
                return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Annulée</span>;
        }
    };

    // Calcul des retenues de garantie exigibles
    const today = new Date();
    const retenuesExigibles = factures.filter(f =>
        f.hasRetenueGarantie &&
        !f.isRetenueLiberee &&
        f.dateLiberationRetenue &&
        new Date(f.dateLiberationRetenue) <= today
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Factures & Acomptes</h1>
            </div>

            {retenuesExigibles.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-800">Retenues de garantie libérables</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Vous avez {retenuesExigibles.length} facture(s) dont la retenue de garantie (généralement 1 an après réception) peut être facturée ou réclamée au client.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-amber-800">
                                {retenuesExigibles.map(f => (
                                    <li key={f.id} className="flex items-center gap-2">
                                        <span className="font-medium">• Facture {f.reference}</span>
                                        ({f.clientName}) - Montant retenu : <span className="font-bold">{f.montantRetenueGarantie?.toFixed(2)} €</span>
                                        <button className="text-xs font-medium bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors text-amber-800">
                                            Marquer comme libérée
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une facture, un client..."
                        className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-auto flex gap-3">
                    <select
                        className="w-full sm:w-auto rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as FactureStatus | "ALL")}
                    >
                        <option value="ALL">Tous les statuts</option>
                        <option value="EMISE">Émise (En attente)</option>
                        <option value="PAYEE_PARTIELLEMENT">Payée partiellement</option>
                        <option value="PAYEE">Payée</option>
                        <option value="BROUILLON">Brouillon</option>
                    </select>

                    <button
                        onClick={handleExportCompta}
                        className="flex items-center gap-2 whitespace-nowrap bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <DownloadCloud className="w-4 h-4 text-emerald-600" />
                        Export Compta
                    </button>
                </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                {filteredFactures.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Référence & Type</th>
                                    <th className="px-6 py-4 font-medium">Client</th>
                                    <th className="px-6 py-4 font-medium">Date d'émission</th>
                                    <th className="px-6 py-4 font-medium">Montant TTC</th>
                                    <th className="px-6 py-4 font-medium">Reste à payer</th>
                                    <th className="px-6 py-4 font-medium">Statut</th>
                                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredFactures.map((facture) => {
                                    const resteAPayer = getResteAPayer(facture.id);
                                    return (
                                        <tr key={facture.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{facture.reference}</div>
                                                <div className="text-xs text-gray-500 capitalize">{facture.type.toLowerCase()}</div>
                                            </td>
                                            <td className="px-6 py-4">{facture.clientName}</td>
                                            <td className="px-6 py-4">{formatDate(facture.dateEmission)}</td>
                                            <td className="px-6 py-4 font-medium">{formatCurrency(facture.montantTTC)}</td>
                                            <td className="px-6 py-4">
                                                <span className={resteAPayer > 0 && facture.status !== 'BROUILLON' ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                                                    {formatCurrency(resteAPayer)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(facture.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {resteAPayer > 0 && facture.status !== 'BROUILLON' && (
                                                    <button
                                                        onClick={() => handleOpenPayment(facture)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm mr-4"
                                                    >
                                                        Encaisser
                                                    </button>
                                                )}
                                                {facture.status !== 'BROUILLON' && facture.status !== 'ANNULEE' && (
                                                    <>
                                                        <button
                                                            onClick={() => telechargerPDF(facture)}
                                                            className="text-blue-600 hover:text-blue-900 font-medium text-sm mr-4"
                                                            title="Télécharger la Facture (PDF)"
                                                        >
                                                            PDF
                                                        </button>
                                                        <button
                                                            onClick={() => telechargerXMLFacturX(facture)}
                                                            className="text-emerald-600 hover:text-emerald-900 font-medium text-sm mr-4"
                                                            title="Télécharger la Factur-X (XML)"
                                                        >
                                                            XML Factur-X
                                                        </button>
                                                    </>
                                                )}
                                                <button className="text-gray-600 hover:text-gray-900 font-medium text-sm">
                                                    Détails
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune facture trouvée</h3>
                        <p className="text-gray-500">
                            {searchTerm || statusFilter !== "ALL"
                                ? "Modifiez vos filtres de recherche pour voir plus de résultats."
                                : "Les factures et acomptes générés apparaîtront ici."}
                        </p>
                    </div>
                )}
            </div>

            {selectedFacture && (
                <ReglementModal
                    facture={selectedFacture}
                    resteAPayer={getResteAPayer(selectedFacture.id)}
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setSelectedFacture(null);
                    }}
                    onSave={handleSavePayment}
                />
            )}
        </div>
    );
}
