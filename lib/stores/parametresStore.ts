import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CoefficientsParDefaut {
    mod: number;       // Main d'œuvre directe
    fourniture: number; // Fournitures
    materiel: number;   // Matériel / Location
    sousTraitance: number; // Sous-traitance
}

export interface CalculMOParams {
    masseSalariale: number;     // Masse salariale productive chargée N-1
    heuresPayees: number;       // Total heures payées N-1
    coeffImproductivite: number; // Coefficient d'improductivité en %
}

interface ParametresState {
    coefficients: CoefficientsParDefaut;
    coutHoraireMO: number;             // Coût horaire moyen par défaut
    calculMO: CalculMOParams;          // Paramètres du calcul
    updateCoefficient: (type: keyof CoefficientsParDefaut, value: number) => void;
    setCoutHoraireMO: (value: number) => void;
    setCalculMO: (params: Partial<CalculMOParams>) => void;
    resetCoefficients: () => void;
    resetAll: () => void;
}

const COEFFICIENTS_DEFAUT: CoefficientsParDefaut = {
    mod: 1.15,
    fourniture: 1.10,
    materiel: 1.05,
    sousTraitance: 1.08,
};

const CALCUL_MO_DEFAUT: CalculMOParams = {
    masseSalariale: 0,
    heuresPayees: 0,
    coeffImproductivite: 15, // 15% par défaut
};

const COUT_HORAIRE_DEFAUT = 23.50;

export const useParametresStore = create<ParametresState>()(
    persist(
        (set) => ({
            coefficients: { ...COEFFICIENTS_DEFAUT },
            coutHoraireMO: COUT_HORAIRE_DEFAUT,
            calculMO: { ...CALCUL_MO_DEFAUT },

            updateCoefficient: (type, value) => {
                set((state) => ({
                    coefficients: { ...state.coefficients, [type]: value },
                }));
            },

            setCoutHoraireMO: (value) => {
                set({ coutHoraireMO: value });
            },

            setCalculMO: (params) => {
                set((state) => ({
                    calculMO: { ...state.calculMO, ...params },
                }));
            },

            resetCoefficients: () => {
                set({ coefficients: { ...COEFFICIENTS_DEFAUT } });
            },

            resetAll: () => {
                set({
                    coefficients: { ...COEFFICIENTS_DEFAUT },
                    coutHoraireMO: COUT_HORAIRE_DEFAUT,
                    calculMO: { ...CALCUL_MO_DEFAUT },
                });
            },
        }),
        {
            name: 'parametres-storage',
        }
    )
);

// Fonction utilitaire : calcul du coût horaire à partir des paramètres
export function calculerCoutHoraire(params: CalculMOParams): number | null {
    if (params.masseSalariale <= 0 || params.heuresPayees <= 0) return null;
    const heuresProductives = params.heuresPayees * (1 - params.coeffImproductivite / 100);
    if (heuresProductives <= 0) return null;
    return params.masseSalariale / heuresProductives;
}

export { COEFFICIENTS_DEFAUT, COUT_HORAIRE_DEFAUT, CALCUL_MO_DEFAUT };
