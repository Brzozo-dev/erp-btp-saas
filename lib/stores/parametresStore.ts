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

interface ComptaDefaut {
    compteClientDefaut: string;
    compteBanqueDefaut: string;
    compteVenteDefaut: string;
    compteTvaDefaut: string;
}

export interface TypeTravaux {
    id: string;
    label: string;
    couleur?: string;
    archived?: boolean;
}

export interface Tag {
    id: string;
    label: string;
    categorie: string; // id de la catégorie
    archived?: boolean;
}

export interface TagCategorie {
    id: string;
    label: string;
    tags: Tag[];
    obligatoire?: boolean;
}

interface ParametresState {
    coefficients: CoefficientsParDefaut;
    coutHoraireMO: number;             // Coût horaire moyen par défaut
    beneficeParDefaut: number;         // Pourcentage de bénéfice par défaut sur les devis (ex: 15)
    calculMO: CalculMOParams;          // Paramètres du calcul
    compta: ComptaDefaut;              // Paramètres de configuration comptable par défaut
    updateCoefficient: (type: keyof CoefficientsParDefaut, value: number) => void;
    setCoutHoraireMO: (value: number) => void;
    setCalculMO: (params: Partial<CalculMOParams>) => void;
    setBeneficeParDefaut: (value: number) => void;
    updateCompta: (key: keyof ComptaDefaut, value: string) => void;
    resetCoefficients: () => void;
    resetAll: () => void;
    // Numérotation des devis
    devisNumeroInitial: number;        // Numéro de départ configuré par l'utilisateur
    devisNumeroActuel: number;         // Prochain numéro à attribuer
    setDevisNumeroInitial: (n: number) => void; // Définit le numéro de départ ET réinitialise le compteur
    consommerProchainNumeroDevis: () => number;  // Retourne le numéro courant PUIS incrémente
    redefinirCompteurDevis: (n: number) => void; // Repositionne le compteur (modification manuelle sur un devis)
    // Types de Travaux
    typesTravaux: TypeTravaux[];
    addTypeTravaux: (label: string) => void;
    updateTypeTravaux: (id: string, label: string) => void;
    removeTypeTravaux: (id: string) => void;
    // Catégories de Tags
    tagCategories: TagCategorie[];
    addTagCategorie: (label: string) => void;
    removeTagCategorie: (id: string) => void;
    addTag: (categorieId: string, label: string) => void;
    removeTag: (categorieId: string, tagId: string) => void;
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
const BENEFICE_DEFAUT = 10; // 10% par défaut
const DEVIS_NUMERO_INITIAL_DEFAUT = 1;

const COMPTA_DEFAUT: ComptaDefaut = {
    compteClientDefaut: '411000',
    compteBanqueDefaut: '512000',
    compteVenteDefaut: '704000',
    compteTvaDefaut: '445710',
};

const TYPES_TRAVAUX_DEFAUT: TypeTravaux[] = [
    { id: 'tt_1', label: 'Rénovation' },
    { id: 'tt_2', label: 'Neuf' },
    { id: 'tt_3', label: 'Entretien' },
    { id: 'tt_4', label: 'Extension' },
    { id: 'tt_5', label: 'Aménagement extérieur' },
    { id: 'tt_6', label: 'Appel d\'offres' },
];

const TAG_CATEGORIES_DEFAUT: TagCategorie[] = [
    {
        id: 'cat_1',
        label: 'Nature Client',
        tags: [
            { id: 'tag_1', label: 'Particulier', categorie: 'cat_1' },
            { id: 'tag_2', label: 'Professionnel', categorie: 'cat_1' },
            { id: 'tag_3', label: 'Public / Collectivité', categorie: 'cat_1' },
            { id: 'tag_4', label: 'Syndic', categorie: 'cat_1' },
        ],
    },
    {
        id: 'cat_2',
        label: 'Secteur',
        tags: [
            { id: 'tag_5', label: 'Résidentiel', categorie: 'cat_2' },
            { id: 'tag_6', label: 'Tertiaire', categorie: 'cat_2' },
            { id: 'tag_7', label: 'Industriel', categorie: 'cat_2' },
        ],
    },
    {
        id: 'cat_3',
        label: 'Priorité',
        tags: [
            { id: 'tag_8', label: 'Urgence', categorie: 'cat_3' },
            { id: 'tag_9', label: 'Client VIP', categorie: 'cat_3' },
            { id: 'tag_10', label: 'Gros budget', categorie: 'cat_3' },
        ],
    },
];

export const useParametresStore = create<ParametresState>()(
    persist(
        (set, get) => ({
            coefficients: { ...COEFFICIENTS_DEFAUT },
            coutHoraireMO: COUT_HORAIRE_DEFAUT,
            beneficeParDefaut: BENEFICE_DEFAUT,
            calculMO: { ...CALCUL_MO_DEFAUT },
            compta: { ...COMPTA_DEFAUT },
            devisNumeroInitial: DEVIS_NUMERO_INITIAL_DEFAUT,
            devisNumeroActuel: DEVIS_NUMERO_INITIAL_DEFAUT,
            typesTravaux: TYPES_TRAVAUX_DEFAUT,
            tagCategories: TAG_CATEGORIES_DEFAUT,

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

            setBeneficeParDefaut: (value) => {
                set({ beneficeParDefaut: value });
            },

            updateCompta: (key, value) => {
                set((state) => ({
                    compta: { ...state.compta, [key]: value },
                }));
            },

            resetCoefficients: () => {
                set({ coefficients: { ...COEFFICIENTS_DEFAUT } });
            },

            resetAll: () => {
                set((state) => ({
                    coefficients: { ...COEFFICIENTS_DEFAUT },
                    coutHoraireMO: COUT_HORAIRE_DEFAUT,
                    beneficeParDefaut: BENEFICE_DEFAUT,
                    calculMO: { ...CALCUL_MO_DEFAUT },
                    compta: { ...COMPTA_DEFAUT },
                    devisNumeroActuel: state.devisNumeroInitial,
                }));
            },

            setDevisNumeroInitial: (n) => {
                set({ devisNumeroInitial: n, devisNumeroActuel: n });
            },

            consommerProchainNumeroDevis: () => {
                const current = get().devisNumeroActuel;
                set({ devisNumeroActuel: current + 1 });
                return current;
            },

            redefinirCompteurDevis: (n) => {
                set({ devisNumeroActuel: n });
            },

            addTypeTravaux: (label) => set((state) => ({
                typesTravaux: [...state.typesTravaux, { id: `tt_${Date.now()}`, label }]
            })),
            updateTypeTravaux: (id, label) => set((state) => ({
                typesTravaux: state.typesTravaux.map(t => t.id === id ? { ...t, label } : t)
            })),
            removeTypeTravaux: (id) => set((state) => ({
                typesTravaux: state.typesTravaux.filter(t => t.id !== id)
            })),

            addTagCategorie: (label) => set((state) => ({
                tagCategories: [...state.tagCategories, { id: `cat_${Date.now()}`, label, tags: [] }]
            })),
            removeTagCategorie: (id) => set((state) => ({
                tagCategories: state.tagCategories.filter(c => c.id !== id)
            })),
            addTag: (categorieId, label) => set((state) => ({
                tagCategories: state.tagCategories.map(cat =>
                    cat.id === categorieId
                        ? { ...cat, tags: [...cat.tags, { id: `tag_${Date.now()}`, label, categorie: categorieId }] }
                        : cat
                )
            })),
            removeTag: (categorieId, tagId) => set((state) => ({
                tagCategories: state.tagCategories.map(cat =>
                    cat.id === categorieId
                        ? { ...cat, tags: cat.tags.filter(t => t.id !== tagId) }
                        : cat
                )
            })),
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
