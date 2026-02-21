export type FactureType = 'ACOMPTE' | 'AVANCEMENT' | 'SOLDE' | 'GLOBALE';
export type FactureStatus = 'BROUILLON' | 'EMISE' | 'PAYEE_PARTIELLEMENT' | 'PAYEE' | 'ANNULEE';

export interface AcompteDeduit {
    factureAcompteId: string;
    montantDeduit: number; // Permet une déduction partielle
}

export interface Facture {
    id: string;
    reference: string; // Ex: FAC-2026-001
    devisId?: string; // Optionnel: lié à un devis accepté
    chantierId?: string; // Optionnel: lié à un chantier
    clientId: string;
    clientName: string; // Denormalized for simpler display
    type: FactureType;
    status: FactureStatus;

    dateEmission: string; // Date de création
    dateEcheance: string; // Date limite de paiement

    montantHT: number;
    montantTVA: number;
    montantTTC: number;

    // Règle de la retenue de garantie : 5% souvent appliqués
    hasRetenueGarantie?: boolean;
    tauxRetenueGarantie?: number; // Ex: 5
    montantRetenueGarantie?: number;
    dateLiberationRetenue?: string; // 1 an après la date d'émission de la facture de SOLDE
    isRetenueLiberee?: boolean;

    // Suivi des acomptes déduits (pour factures d'avancement et solde)
    acomptesDeduits?: AcompteDeduit[];
}
