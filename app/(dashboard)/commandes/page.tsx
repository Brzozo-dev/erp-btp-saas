"use client";

import { useMemo } from "react";
import { FileCheck, Search, Filter, FileText } from "lucide-react";
import { mockQuotes } from "@/lib/data/mock-devis";
import { Quote } from "@/types/devis";

export default function CommandesPage() {
    // Dans cette version initiale, on filtre simplement les mockQuotes
    // Plus tard, cela viendra d'un store Zustand ou du backend
    const commandes = useMemo(() => mockQuotes.filter(q => q.status === "ACCEPTE"), []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Commandes</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestion des devis acceptés et transformés en commandes
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une commande..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Référence</th>
                                <th className="px-6 py-3 font-semibold">Client</th>
                                <th className="px-6 py-3 font-semibold">Projet</th>
                                <th className="px-6 py-3 font-semibold">Date d'acceptation</th>
                                <th className="px-6 py-3 font-semibold">Montant HT</th>
                                <th className="px-6 py-3 font-semibold text-center">Statut</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {commandes.length > 0 ? (
                                commandes.map((commande: Quote) => (
                                    <tr key={commande.id} className="bg-white hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-3 align-middle font-medium text-slate-900">
                                            {commande.reference}
                                        </td>
                                        <td className="px-6 py-3 align-middle">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                                    {commande.clientName.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-700">{commande.clientName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 align-middle text-slate-600 truncate max-w-xs">
                                            {commande.description}
                                        </td>
                                        <td className="px-6 py-3 align-middle text-slate-500">
                                            {new Date(commande.date).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-3 align-middle font-semibold text-slate-900 tabular-nums">
                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(commande.totalHT)}
                                        </td>
                                        <td className="px-6 py-3 align-middle text-center">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Confirmée
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 align-middle text-right flex items-center justify-end gap-3">
                                            <button className="text-slate-400 hover:text-emerald-600 transition-colors font-medium text-sm">
                                                Ouvrir
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm">
                                                <FileText className="w-3.5 h-3.5" /> Facturer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-lg font-medium text-slate-900 mb-1">Aucune commande trouvée</p>
                                        <p>Les devis acceptés apparaîtront ici.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
