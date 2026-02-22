export type ChantierStatus = 'EN_COURS' | 'TERMINE';

export type DepenseType = 'FOURNITURE' | 'MATERIEL' | 'SOUS_TRAITANCE';

export interface PointageHoraire {
    id: string;
    date: string; // ISO string YYYY-MM-DD
    ouvrier: string;
    heures: number;
    commentaire?: string;
}

export interface Depense {
    id: string;
    date: string; // ISO string YYYY-MM-DD
    type: DepenseType;
    montantHT: number;
    fournisseur?: string;
    reference?: string; // ex: Numéro BL, Facture
    commentaire?: string;
}

// Pour permettre la surcharge des coefs au niveau du chantier si nécessaire
export interface ChantierCoefficients {
    mod?: number;
    fourniture?: number;
    materiel?: number;
    sousTraitance?: number;
    tauxHoraireMoyen?: number;
}

export interface Chantier {
    id: string;
    nom: string;
    description?: string;
    clientId?: string;
    dateDebut: string;
    statut: ChantierStatus;

    // Devis rattachés à ce chantier (pour calculer le budget prévu)
    devisIds: string[];

    // Éléments réels pointés
    pointagesHoraires: PointageHoraire[];
    depenses: Depense[];

    // Surcharge optionnelle des paramètres globaux
    customCoefficients?: ChantierCoefficients;
}
