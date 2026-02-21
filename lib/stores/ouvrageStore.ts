import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuoteSubItem } from '@/types/devis';

export interface OuvrageTemplate {
    id: string;
    reference: string;
    designation: string;
    unite: string;
    description?: string;
    subItems: Omit<QuoteSubItem, 'id'>[]; // Template doesn't need strict execution IDs
}

interface OuvrageState {
    ouvrages: OuvrageTemplate[];
    addOuvrage: (ouvrage: Omit<OuvrageTemplate, 'id' | 'reference'>) => OuvrageTemplate;
    updateOuvrage: (id: string, data: Partial<Omit<OuvrageTemplate, 'id'>>) => void;
    deleteOuvrage: (id: string) => void;
    searchOuvrages: (query: string) => OuvrageTemplate[];
}

let nextId = 100;
function generateId(): string {
    return 'ouv_' + (nextId++) + '_' + Math.random().toString(36).substr(2, 5);
}

const INITIAL_OUVRAGES: OuvrageTemplate[] = [
    {
        id: 'ouv_proto_1',
        reference: 'OUV-001',
        designation: 'Mur en parpaing creux 20x20x50',
        unite: 'm²',
        subItems: [
            { type: 'MAT', unit: 'U', quantity: 10, unitPrice: 1.5, description: 'Parpaing creux 20x20x50' },
            { type: 'MAT', unit: 'sac', quantity: 0.5, unitPrice: 8.5, description: 'Mortier bâtard' },
            { type: 'MO', unit: 'H', quantity: 1.2, unitPrice: 0, description: 'Pose agglos' }
        ]
    }
];

export const useOuvrageStore = create<OuvrageState>()(
    persist(
        (set, get) => ({
            ouvrages: INITIAL_OUVRAGES,

            addOuvrage: (newOuvrage) => {
                const ouvrage: OuvrageTemplate = {
                    ...newOuvrage,
                    id: generateId(),
                    reference: 'OUV-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
                };
                set((state) => ({
                    ouvrages: [...state.ouvrages, ouvrage],
                }));
                return ouvrage;
            },

            updateOuvrage: (id, data) => {
                set((state) => ({
                    ouvrages: state.ouvrages.map((o) =>
                        o.id === id ? { ...o, ...data } : o
                    ),
                }));
            },

            deleteOuvrage: (id) => {
                set((state) => ({
                    ouvrages: state.ouvrages.filter((o) => o.id !== id),
                }));
            },

            searchOuvrages: (query) => {
                const lowerQuery = query.toLowerCase();
                return get().ouvrages.filter((o) => {
                    return (
                        !query ||
                        o.designation.toLowerCase().includes(lowerQuery) ||
                        o.reference.toLowerCase().includes(lowerQuery)
                    );
                }).slice(0, 10);
            },
        }),
        {
            name: 'ouvrage-storage',
        }
    )
);
