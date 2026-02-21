export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REFUSED' | 'CANCELLED';

export interface QuoteSubItem {
    id: string;
    articleId?: string; // If linked to a DB article
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    type: 'MO' | 'MAT' | 'ST';
}

export interface QuoteItem {
    id: string;
    description: string;
    unit: string;
    quantity: number;
    unitPriceMO: number;
    unitPriceMat: number;
    unitPriceST: number;
    benefice?: number; // Pourcentage de marge (ex: 15 pour 15%) spécifique à cette ligne
    subItems?: QuoteSubItem[]; // Dictates the unit prices if present
}

export interface QuoteSection {
    id: string;
    title: string;
    items: QuoteItem[];
}

export interface GlobalCoefficients {
    mo: number; // Main d'œuvre
    mat: number; // Matériaux/Fournitures
    st: number; // Sous-traitance
}

export interface Client {
    id: string;
    name: string;
    email: string;
}

export interface Quote {
    id: string;
    reference: string;
    clientId: string;
    clientName: string; // Denormalized for simpler display
    description: string;
    date: string; // ISO Date
    validUntil: string; // ISO Date
    status: QuoteStatus;
    sections: QuoteSection[];
    globalCoefficients: GlobalCoefficients;
    benefice: number; // Bénéfice global (%) du devis (figé à la création)
    totalHT: number;
}
