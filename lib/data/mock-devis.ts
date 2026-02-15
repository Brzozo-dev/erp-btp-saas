import { Quote } from '@/types/devis';

export const mockQuotes: Quote[] = [
    {
        id: '1',
        reference: 'DEV-2026-001',
        clientId: 'c1',
        clientName: 'Mairie de Lyon',
        description: 'Rénovation Façade Nord',
        date: '2026-02-10',
        validUntil: '2026-03-10',
        status: 'SENT',
        sections: [
            {
                id: 's1',
                title: 'Lot 1: Gros Œuvre',
                items: [
                    {
                        id: 'i1',
                        description: 'Montage échafaudage',
                        unit: 'm²',
                        quantity: 150,
                        unitPriceMO: 15,
                        unitPriceMat: 5,
                        unitPriceST: 0,
                    },
                ],
            },
        ],
        globalCoefficients: { mo: 1.15, mat: 1.10, st: 1.05 },
        totalHT: 3000, // Simplified for mock
    },
    {
        id: '2',
        reference: 'DEV-2026-002',
        clientId: 'c2',
        clientName: 'Jean Dupont',
        description: 'Construction Garage',
        date: '2026-02-12',
        validUntil: '2026-03-12',
        status: 'DRAFT',
        sections: [],
        globalCoefficients: { mo: 1.15, mat: 1.10, st: 1.05 },
        totalHT: 0,
    },
    {
        id: '3',
        reference: 'DEV-2026-003',
        clientId: 'c3',
        clientName: 'Syndic Le Parc',
        description: 'Réfection Toiture Bat. A',
        date: '2026-02-14',
        validUntil: '2026-03-14',
        status: 'ACCEPTED',
        sections: [],
        globalCoefficients: { mo: 1.15, mat: 1.10, st: 1.05 },
        totalHT: 15400,
    },
];
