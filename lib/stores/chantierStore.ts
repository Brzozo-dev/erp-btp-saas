import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chantier, ChantierStatus, Depense, PointageHoraire, ChantierCoefficients } from '@/types/chantier';

interface ChantierState {
    chantiers: Chantier[];

    // Actions CRUD
    addChantier: (chantier: Omit<Chantier, 'id'>) => void;
    updateChantier: (id: string, chantier: Partial<Chantier>) => void;
    deleteChantier: (id: string) => void;

    // Actions sur l'état du chantier
    setChantierStatus: (id: string, statut: ChantierStatus) => void;
    lierDevis: (chantierId: string, devisId: string) => void;
    delierDevis: (chantierId: string, devisId: string) => void;

    // Actions de Frais & Temps (Le "Réel")
    addPointage: (chantierId: string, pointage: Omit<PointageHoraire, 'id'>) => void;
    deletePointage: (chantierId: string, pointageId: string) => void;

    addDepense: (chantierId: string, depense: Omit<Depense, 'id'>) => void;
    deleteDepense: (chantierId: string, depenseId: string) => void;

    // Surcharge des coefficients et taux
    updateCustomCoefficients: (chantierId: string, coeffs: ChantierCoefficients) => void;
}

// Fonction utilitaire de génération ID
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useChantierStore = create<ChantierState>()(
    persist(
        (set) => ({
            chantiers: [], // Vide initialement en prod, sera alimenté par un mock dans les pages pour l'instant

            addChantier: (chantier) => set((state) => ({
                chantiers: [...state.chantiers, { ...chantier, id: generateId('chantier') }]
            })),

            updateChantier: (id, updatedFields) => set((state) => ({
                chantiers: state.chantiers.map(c => c.id === id ? { ...c, ...updatedFields } : c)
            })),

            deleteChantier: (id) => set((state) => ({
                chantiers: state.chantiers.filter(c => c.id !== id)
            })),

            setChantierStatus: (id, statut) => set((state) => ({
                chantiers: state.chantiers.map(c => c.id === id ? { ...c, statut } : c)
            })),

            lierDevis: (chantierId, devisId) => set((state) => ({
                chantiers: state.chantiers.map(c => {
                    if (c.id === chantierId && !c.devisIds.includes(devisId)) {
                        return { ...c, devisIds: [...c.devisIds, devisId] };
                    }
                    return c;
                })
            })),

            delierDevis: (chantierId, devisId) => set((state) => ({
                chantiers: state.chantiers.map(c => c.id === chantierId ? { ...c, devisIds: c.devisIds.filter(id => id !== devisId) } : c)
            })),

            addPointage: (chantierId, pointage) => set((state) => ({
                chantiers: state.chantiers.map(c =>
                    c.id === chantierId
                        ? { ...c, pointagesHoraires: [...c.pointagesHoraires, { ...pointage, id: generateId('ptg') }] }
                        : c
                )
            })),

            deletePointage: (chantierId, pointageId) => set((state) => ({
                chantiers: state.chantiers.map(c =>
                    c.id === chantierId
                        ? { ...c, pointagesHoraires: c.pointagesHoraires.filter(p => p.id !== pointageId) }
                        : c
                )
            })),

            addDepense: (chantierId, depense) => set((state) => ({
                chantiers: state.chantiers.map(c =>
                    c.id === chantierId
                        ? { ...c, depenses: [...c.depenses, { ...depense, id: generateId('dep') }] }
                        : c
                )
            })),

            deleteDepense: (chantierId, depenseId) => set((state) => ({
                chantiers: state.chantiers.map(c =>
                    c.id === chantierId
                        ? { ...c, depenses: c.depenses.filter(d => d.id !== depenseId) }
                        : c
                )
            })),

            updateCustomCoefficients: (chantierId, coeffs) => set((state) => ({
                chantiers: state.chantiers.map(c =>
                    c.id === chantierId
                        ? { ...c, customCoefficients: { ...(c.customCoefficients || {}), ...coeffs } }
                        : c
                )
            }))
        }),
        {
            name: 'chantier-storage'
        }
    )
);
