export type ModeReglement = 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'CB' | 'BILLETS_A_ORDRE';

export interface Reglement {
    id: string;
    factureId: string; // La facture concernée
    dateReglement: string;
    montant: number;
    modeReglement: ModeReglement;
    referenceExterne?: string; // Ex: Numéro de chèque ou ID Virement
    notes?: string;
}
