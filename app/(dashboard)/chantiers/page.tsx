"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, HardHat, CalendarDays, Users, LayoutGrid, List } from "lucide-react";
import { useChantierStore } from "@/lib/stores/chantierStore";
import { mockChantiers } from "@/lib/data/mock-chantiers";

export default function ChantiersPage() {
    // Initialiser le store avec des mocks si vide au premier chargement
    const { chantiers, addChantier } = useChantierStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'EN_COURS' | 'TERMINE'>('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    useEffect(() => {
        // Hydratation initiale avec les mocks si c'est la première utilisation
        if (chantiers.length === 0) {
            mockChantiers.forEach(c => {
                // On omet l'ID car le store le régénère, mais dans un vrai mock ça serait gardé
                addChantier(c);
            });
        }
    }, [chantiers.length, addChantier]);

    const filteredChantiers = chantiers.filter(chantier => {
        const matchesSearch = chantier.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (chantier.description && chantier.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || chantier.statut === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Chantiers</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Suivi des budgets, pointages et rentabilité en direct
                    </p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Chantier
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un chantier..."
                        className="pl-9 w-full h-10 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                        className="h-10 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="ALL">Tous les statuts</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="TERMINE">Terminé</option>
                    </select>

                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 ml-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Vue grille"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Vue tableau"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid display */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredChantiers.map(chantier => (
                        <div key={chantier.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            <div className="p-5 border-b border-slate-100 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                        <HardHat className="w-5 h-5" />
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${chantier.statut === 'EN_COURS' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                        {chantier.statut === 'EN_COURS' ? 'En cours' : 'Terminé'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 line-clamp-1 hover:text-emerald-600 transition-colors">
                                    <Link href={`/chantiers/${chantier.id}`}>
                                        {chantier.nom}
                                    </Link>
                                </h3>
                                {chantier.description && (
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                        {chantier.description}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CalendarDays className="w-4 h-4 text-slate-400" />
                                        <span>{new Date(chantier.dateDebut).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span>{chantier.devisIds.length} devis lié(s)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
                                <div className="text-sm">
                                    <span className="text-slate-500">Heures saisies : </span>
                                    <span className="font-semibold text-slate-900">
                                        {chantier.pointagesHoraires.reduce((acc, p) => acc + p.heures, 0)}h
                                    </span>
                                </div>
                                <Link href={`/chantiers/${chantier.id}`} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                                    Suivi détaillé &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}

                    {filteredChantiers.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                            <HardHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-lg font-medium text-slate-900 mb-1">Aucun chantier trouvé</p>
                            <p>Créez un nouveau chantier pour commencer le suivi.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Table display */}
            {viewMode === 'table' && filteredChantiers.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Nom du Chantier</th>
                                    <th className="px-6 py-3 font-semibold text-center">Statut</th>
                                    <th className="px-6 py-3 font-semibold">Date de début</th>
                                    <th className="px-6 py-3 font-semibold text-center">Devis liés</th>
                                    <th className="px-6 py-3 font-semibold text-right">Heures saisies</th>
                                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredChantiers.map(chantier => (
                                    <tr key={chantier.id} className="bg-white hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-3 align-middle font-medium text-slate-900">
                                            <Link href={`/chantiers/${chantier.id}`} className="hover:text-emerald-600 transition-colors">
                                                {chantier.nom}
                                            </Link>
                                            {chantier.description && (
                                                <p className="text-xs text-slate-500 font-normal mt-0.5 line-clamp-1">{chantier.description}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 align-middle text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${chantier.statut === 'EN_COURS' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                                {chantier.statut === 'EN_COURS' ? 'En cours' : 'Terminé'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 align-middle text-slate-600">
                                            {new Date(chantier.dateDebut).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-3 align-middle text-center font-medium text-slate-700">
                                            {chantier.devisIds.length}
                                        </td>
                                        <td className="px-6 py-3 align-middle text-right font-medium text-slate-900">
                                            {chantier.pointagesHoraires.reduce((acc, p) => acc + p.heures, 0)}h
                                        </td>
                                        <td className="px-6 py-3 align-middle text-right">
                                            <Link href={`/chantiers/${chantier.id}`}>
                                                <span className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                                                    Détails
                                                </span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
}

// Composant Button mock localement par commodité pour l'implémentation
function Button({ children, className = '', ...props }: any) {
    return (
        <button className={`flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm ${className}`} {...props}>
            {children}
        </button>
    )
}
