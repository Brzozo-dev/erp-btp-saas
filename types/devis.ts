export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REFUSED' | 'CANCELLED';

export interface QuoteItem {
    id: string;
    description: string;
    unit: string;
    quantity: number;
    unitPriceMO: number;
    unitPriceMat: number;
    unitPriceST: number;
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
    totalHT: number;
}
