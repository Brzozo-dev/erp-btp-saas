import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Facture, FactureStatus, FactureType } from '@/types/facture';
import { Reglement } from '@/types/reglement';

interface FactureState {
    factures: Facture[];
    reglements: Reglement[];

    // Actions
    addFacture: (facture: Omit<Facture, 'id' | 'dateEmission' | 'status'>) => void;
    updateFacture: (id: string, updates: Partial<Facture>) => void;
    deleteFacture: (id: string) => void;

    addReglement: (reglement: Omit<Reglement, 'id'>) => void;

    // Computed / Helpers
    getFacturesByChantier: (chantierId: string) => Facture[];
    getFacturesByDevis: (devisId: string) => Facture[];
    getReglementsByFacture: (factureId: string) => Reglement[];
    getResteAPayer: (factureId: string) => number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);
const generateReference = (factures: Facture[]) => `FAC-26-${(factures.length + 1).toString().padStart(3, '0')}`;

export const useFactureStore = create<FactureState>()(
    persist(
        (set, get) => ({
            factures: [],
            reglements: [],

            addFacture: (factureData) => {
                set((state) => {
                    const newFacture: Facture = {
                        ...factureData,
                        id: generateId(),
                        reference: factureData.reference || generateReference(state.factures),
                        dateEmission: new Date().toISOString(),
                        status: 'EMISE',
                    };
                    return { factures: [...state.factures, newFacture] };
                });
            },

            updateFacture: (id, updates) => {
                set((state) => ({
                    factures: state.factures.map((f) => (f.id === id ? { ...f, ...updates } : f)),
                }));
            },

            deleteFacture: (id) => {
                set((state) => ({
                    factures: state.factures.filter((f) => f.id !== id),
                    reglements: state.reglements.filter((r) => r.factureId !== id),
                }));
            },

            addReglement: (reglementData) => {
                set((state) => {
                    const newReglement: Reglement = {
                        ...reglementData,
                        id: generateId(),
                    };

                    const newReglements = [...state.reglements, newReglement];

                    // Update invoice status if fully paid
                    const facture = state.factures.find(f => f.id === reglementData.factureId);
                    if (facture) {
                        const totalPaye = newReglements
                            .filter(r => r.factureId === facture.id)
                            .reduce((sum, r) => sum + r.montant, 0);

                        let newStatus: FactureStatus = facture.status;
                        if (totalPaye >= facture.montantTTC) {
                            newStatus = 'PAYEE';
                        } else if (totalPaye > 0) {
                            newStatus = 'PAYEE_PARTIELLEMENT';
                        }

                        const currentFactures = state.factures.map((f) =>
                            f.id === facture.id ? { ...f, status: newStatus } : f
                        );

                        return {
                            reglements: newReglements,
                            factures: currentFactures
                        };
                    }

                    return { reglements: newReglements };
                });
            },

            getFacturesByChantier: (chantierId) => {
                return get().factures.filter((f) => f.chantierId === chantierId);
            },

            getFacturesByDevis: (devisId) => {
                return get().factures.filter((f) => f.devisId === devisId);
            },

            getReglementsByFacture: (factureId) => {
                return get().reglements.filter((r) => r.factureId === factureId);
            },

            getResteAPayer: (factureId) => {
                const facture = get().factures.find(f => f.id === factureId);
                if (!facture) return 0;

                const totalPaye = get().reglements
                    .filter(r => r.factureId === factureId)
                    .reduce((sum, r) => sum + r.montant, 0);

                return Math.max(0, facture.montantTTC - totalPaye);
            }
        }),
        {
            name: 'factures-storage',
        }
    )
);
