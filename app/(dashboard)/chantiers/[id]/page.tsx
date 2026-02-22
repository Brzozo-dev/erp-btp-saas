"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChantierStore } from "@/lib/stores/chantierStore";
import { mockQuotes } from "@/lib/data/mock-devis";
import { useParametresStore } from "@/lib/stores/parametresStore";
import { ArrowLeft, Plus, Calculator, CheckCircle2, Clock, Wallet, BarChart2 } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PointageHoraire, Depense } from "@/types/chantier";

export default function ChantierDetailPage() {
    const params = useParams();
    const router = useRouter();
    const chantierId = params.id as string;

    const { chantiers, updateChantier, setChantierStatus, addPointage, addDepense, deletePointage, deleteDepense } = useChantierStore();
    const { coefficients, coutHoraireMO } = useParametresStore();

    const chantier = chantiers.find(c => c.id === chantierId);

    // States for Modals/Forms (simplified inline for now)
    const [showPointageForm, setShowPointageForm] = useState(false);
    const [showDepenseForm, setShowDepenseForm] = useState(false);

    // Form states
    const [newPointage, setNewPointage] = useState<Partial<PointageHoraire>>({ date: new Date().toISOString().split('T')[0], heures: 0 });
    const [newDepense, setNewDepense] = useState<Partial<Depense>>({ date: new Date().toISOString().split('T')[0], montantHT: 0, type: 'MATERIEL' });

    if (!chantier) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-slate-500 mb-4">Chantier introuvable</p>
                <Button onClick={() => router.push('/chantiers')}>Retour à la liste</Button>
            </div>
        );
    }

    // --- CALCULATIONS ---

    // 1. Budget Initial (Agrégation des devis liés)
    // On suppose que mockQuotes contient les devis. Dans la vraie vie, on filtre sur devisStore.
    const devisLies = useMemo(() => mockQuotes.filter(q => chantier.devisIds.includes(q.id)), [chantier.devisIds]);

    const budget = useMemo(() => {
        let totalVenteHT = 0;
        let totalHeuresVisees = 0;
        let totalMODVente = 0;
        let totalFournituresVente = 0;
        let totalMaterielVente = 0;
        let totalSousTraitanceVente = 0;

        devisLies.forEach(devis => {
            totalVenteHT += devis.totalHT;
            // Simplification : on estime la répartition en parcourant les sections, ou on prend un % fictif si on n'a pas les totaux ventilés
            // Pour l'instant, on va simuler une ventilation de budget en fonction du totalHT
            totalHeuresVisees += 120; // Faux chiffre pour le mock en attendant que Devis exporte les heures
            totalMODVente += devis.totalHT * 0.40;
            totalFournituresVente += devis.totalHT * 0.35;
            totalMaterielVente += devis.totalHT * 0.15;
            totalSousTraitanceVente += devis.totalHT * 0.10;
        });

        return {
            totalVenteHT,
            totalHeuresVisees,
            totalMODVente,
            totalFournituresVente,
            totalMaterielVente,
            totalSousTraitanceVente
        };
    }, [devisLies]);

    // 2. Le Réel (Pointages et Dépenses)
    const reel = useMemo(() => {
        const heuresPointees = chantier.pointagesHoraires.reduce((acc, p) => acc + p.heures, 0);

        // Coût MOD = heures pointées * (Taux horaire moyen local ou global)
        const tauxHoraire = chantier.customCoefficients?.tauxHoraireMoyen || coutHoraireMO;
        // On applique les frais généraux (coef global ou surchargé) sur la MOD
        const coeffMOD = chantier.customCoefficients?.mod || coefficients.mod;
        const coutMODReel = heuresPointees * tauxHoraire * coeffMOD;

        let coutFournituresReel = 0;
        let coutMaterielReel = 0;
        let coutSTReel = 0;

        chantier.depenses.forEach(d => {
            if (d.type === 'FOURNITURE') coutFournituresReel += d.montantHT * (chantier.customCoefficients?.fourniture || coefficients.fourniture);
            if (d.type === 'MATERIEL') coutMaterielReel += d.montantHT * (chantier.customCoefficients?.materiel || coefficients.materiel);
            if (d.type === 'SOUS_TRAITANCE') coutSTReel += d.montantHT * (chantier.customCoefficients?.sousTraitance || coefficients.sousTraitance);
        });

        const totalPrixRevient = coutMODReel + coutFournituresReel + coutMaterielReel + coutSTReel;
        const margeNette = budget.totalVenteHT - totalPrixRevient;

        return {
            heuresPointees,
            coutMODReel,
            coutFournituresReel,
            coutMaterielReel,
            coutSTReel,
            totalPrixRevient,
            margeNette
        };
    }, [chantier, coutHoraireMO, coefficients]);

    const chartData = useMemo(() => [
        {
            name: 'MOD',
            Prevu: budget.totalMODVente, // Estimation
            Reel: reel.coutMODReel,
        },
        {
            name: 'Fourniture',
            Prevu: budget.totalFournituresVente,
            Reel: reel.coutFournituresReel,
        },
        {
            name: 'Matériel',
            Prevu: budget.totalMaterielVente,
            Reel: reel.coutMaterielReel,
        },
        {
            name: 'Sous-Traitance',
            Prevu: budget.totalSousTraitanceVente,
            Reel: reel.coutSTReel,
        },
    ], [budget, reel]);

    // HANDLERS
    const handleAddPointage = () => {
        if (!newPointage.ouvrier || !newPointage.date || !newPointage.heures) return;
        addPointage(chantier.id, newPointage as PointageHoraire);
        setNewPointage({ date: new Date().toISOString().split('T')[0], heures: 0 });
        setShowPointageForm(false);
    };

    const handleAddDepense = () => {
        if (!newDepense.date || newDepense.montantHT === undefined || !newDepense.type) return;
        addDepense(chantier.id, newDepense as Depense);
        setNewDepense({ date: new Date().toISOString().split('T')[0], montantHT: 0, type: 'MATERIEL' });
        setShowDepenseForm(false);
    };

    const formatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

    return (
        <div className="space-y-6 pb-20">
            {/* Nav & Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/chantiers" className="p-2 bg-white rounded-lg shadow-sm hover:bg-slate-50 border border-slate-200 text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            {chantier.nom}
                            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${chantier.statut === 'EN_COURS' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                                {chantier.statut === 'EN_COURS' ? 'En cours' : 'Terminé'}
                            </span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">{chantier.description || "Aucune description"}</p>
                    </div>
                </div>
                {chantier.statut === 'EN_COURS' && (
                    <Button onClick={() => setChantierStatus(chantier.id, 'TERMINE')} className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Clôturer le chantier
                    </Button>
                )}
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Prix Vente (Devis)" value={formatter.format(budget.totalVenteHT)} subtitle={`${devisLies.length} devis validé(s)`} color="blue" />
                <KpiCard title="Prix Revient Calculé" value={formatter.format(reel.totalPrixRevient)} subtitle="Incluant FG" color="red" />
                <KpiCard title="Marge Nette Actuelle" value={formatter.format(reel.margeNette)} subtitle={`${((reel.margeNette / (budget.totalVenteHT || 1)) * 100).toFixed(1)}% du PV`} color="emerald" />
                <KpiCard title="Heures Pointées" value={`${reel.heuresPointees}h`} subtitle={`Sur un budget estimé de ${budget.totalHeuresVisees}h`} color="amber" />
            </div>

            {/* Graph Budget vs Réel */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                    <BarChart2 className="w-5 h-5 text-emerald-500" />
                    Comparatif Budget Prévu vs Dépenses Réelles (en € HT)
                </h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} tickFormatter={(value: any) => `${value}€`} />
                            <Tooltip
                                formatter={(value: any) => [`${value.toFixed(2)} €`, undefined]}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                            <Bar dataKey="Prevu" name="Prévu (Budget estimé)" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={60} />
                            <Bar dataKey="Reel" name="Réel (Dépensé + Pointé)" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Split layout: Actions & Lists */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* POINTAGES HORAIRES */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" /> Pointages Heures
                        </h2>
                        <Button onClick={() => setShowPointageForm(!showPointageForm)} className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 font-semibold" >
                            {showPointageForm ? 'Fermer' : <><Plus className="w-3 h-3 mr-1" /> Pointer</>}
                        </Button>
                    </div>

                    {showPointageForm && (
                        <div className="p-4 bg-indigo-50/50 border-b border-slate-100 flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Ouvrier</label>
                                    <input type="text" className="w-full text-sm border-slate-300 rounded-md py-1.5" value={newPointage.ouvrier || ''} onChange={e => setNewPointage({ ...newPointage, ouvrier: e.target.value })} placeholder="Nom de l'ouvrier" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Date</label>
                                    <input type="date" className="w-full text-sm border-slate-300 rounded-md py-1.5" value={newPointage.date || ''} onChange={e => setNewPointage({ ...newPointage, date: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Heures</label>
                                    <input type="number" min="0" step="0.5" className="w-full text-sm border-slate-300 rounded-md py-1.5" value={newPointage.heures || ''} onChange={e => setNewPointage({ ...newPointage, heures: parseFloat(e.target.value) })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Commentaire</label>
                                    <input type="text" className="w-full text-sm border-slate-300 rounded-md py-1.5" value={newPointage.commentaire || ''} onChange={e => setNewPointage({ ...newPointage, commentaire: e.target.value })} placeholder="Tâche effectuée..." />
                                </div>
                            </div>
                            <Button onClick={handleAddPointage} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-sm py-1.5">Valider le pointage</Button>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto max-h-96">
                        {chantier.pointagesHoraires.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-4 py-2 font-semibold">Date</th>
                                        <th className="px-4 py-2 font-semibold">Ouvrier</th>
                                        <th className="px-4 py-2 font-semibold text-right">Heures</th>
                                        <th className="px-4 py-2 font-semibold">Commentaire</th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {chantier.pointagesHoraires.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-2 text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 font-medium text-slate-900">{p.ouvrier}</td>
                                            <td className="px-4 py-2 text-right font-bold text-slate-700">{p.heures}h</td>
                                            <td className="px-4 py-2 text-slate-500 truncate max-w-[150px]">{p.commentaire}</td>
                                            <td className="px-4 py-2 text-right">
                                                <button onClick={() => deletePointage(chantier.id, p.id)} className="text-red-400 hover:text-red-600 text-xs">Suppr.</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm">Aucun pointage horaire enregistré.</div>
                        )}
                    </div>
                </div>

                {/* DEPENSES MATERIAL/F/ST */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-fuchsia-500" /> Achats & Dépenses
                        </h2>
                        <Button onClick={() => setShowDepenseForm(!showDepenseForm)} className="h-8 px-3 text-xs bg-fuchsia-600 hover:bg-fuchsia-700 font-semibold" >
                            {showDepenseForm ? 'Fermer' : <><Plus className="w-3 h-3 mr-1" /> Ajouter Facture/BL</>}
                        </Button>
                    </div>

                    {showDepenseForm && (
                        <div className="p-4 bg-fuchsia-50/50 border-b border-slate-100 flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Type de dépense</label>
                                    <select className="w-full text-sm border-slate-300 rounded-md py-1.5" value={newDepense.type || 'MATERIEL'} onChange={e => setNewDepense({ ...newDepense, type: e.target.value as any })}>
                                        <option value="FOURNITURE">Fournitures</option>
                                        <option value="MATERIEL">Matériel (Location/Achat)</option>
                                        <option value="SOUS_TRAITANCE">Sous-traitance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Date</label>
                                    <input type="date" className="w-full text-sm border-slate-300 rounded-md py-1.5" value={newDepense.date || ''} onChange={e => setNewDepense({ ...newDepense, date: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Montant HT (€)</label>
                                    <input type="number" min="0" step="0.01" className="w-full text-sm border-slate-300 rounded-md py-1.5" value={newDepense.montantHT || ''} onChange={e => setNewDepense({ ...newDepense, montantHT: parseFloat(e.target.value) })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Fournisseur & Réf.</label>
                                    <div className="flex gap-2">
                                        <input type="text" className="w-1/2 text-sm border-slate-300 rounded-md py-1.5" value={newDepense.fournisseur || ''} onChange={e => setNewDepense({ ...newDepense, fournisseur: e.target.value })} placeholder="Leroy Merlin..." />
                                        <input type="text" className="w-1/2 text-sm border-slate-300 rounded-md py-1.5" value={newDepense.reference || ''} onChange={e => setNewDepense({ ...newDepense, reference: e.target.value })} placeholder="Fac N°..." />
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleAddDepense} className="w-full mt-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-sm py-1.5">Enregistrer la dépense</Button>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto max-h-96">
                        {chantier.depenses.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-4 py-2 font-semibold">Date</th>
                                        <th className="px-4 py-2 font-semibold">Nature</th>
                                        <th className="px-4 py-2 font-semibold">Tiers & Réf.</th>
                                        <th className="px-4 py-2 font-semibold text-right">Montant HT</th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {chantier.depenses.map(d => (
                                        <tr key={d.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{new Date(d.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{d.type}</span>
                                            </td>
                                            <td className="px-4 py-2 text-slate-700 truncate max-w-[150px]">
                                                {d.fournisseur} <span className="text-slate-400">{d.reference}</span>
                                            </td>
                                            <td className="px-4 py-2 text-right font-bold text-slate-900">{formatter.format(d.montantHT)}</td>
                                            <td className="px-4 py-2 text-right">
                                                <button onClick={() => deleteDepense(chantier.id, d.id)} className="text-red-400 hover:text-red-600 text-xs">Suppr.</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm">Aucune dépense enregistrée.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// Composants Locaux
function KpiCard({ title, value, subtitle, color }: { title: string, value: string | number, subtitle: string, color: 'blue' | 'emerald' | 'amber' | 'red' }) {
    const colors = {
        blue: 'border-blue-200 bg-blue-50/30 text-blue-900',
        emerald: 'border-emerald-200 bg-emerald-50/30 text-emerald-900',
        amber: 'border-amber-200 bg-amber-50/30 text-amber-900',
        red: 'border-red-200 bg-red-50/30 text-red-900',
    };

    return (
        <div className={`p-5 rounded-xl border ${colors[color]} flex flex-col justify-between`}>
            <p className="text-sm font-semibold opacity-70 mb-2">{title}</p>
            <div>
                <p className="text-3xl font-black tracking-tighter tabular-nums">{value}</p>
                <p className="text-xs font-semibold mt-1 opacity-70">{subtitle}</p>
            </div>
        </div>
    );
}

function Button({ children, className = '', ...props }: any) {
    return (
        <button className={`flex items-center justify-center px-4 py-2 text-white text-sm font-semibold rounded-lg transition shadow-sm ${className || 'bg-slate-800 hover:bg-slate-900'}`} {...props}>
            {children}
        </button>
    )
}
