import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client } from '@/types/client';

export const MOCK_CLIENTS: Client[] = [
    {
        id: 'c_1',
        nom: 'GCC PAYS DE LA LOIRE',
        adresseFacturation: '16 RUE ARAGO',
        codePostalFacturation: '44240',
        villeFacturation: 'LA CHAPELLE SUR ERDRE',
        adresseChantier: '16 RUE ARAGO',
        codePostalChantier: '44240',
        villeChantier: 'LA CHAPELLE SUR ERDRE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'c_2',
        nom: 'SILENE ISAU ESPACES VERTS',
        adresseFacturation: '12 AV ALBERT EINSTEIN',
        codePostalFacturation: '44300',
        villeFacturation: 'NANTES',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

interface ClientState {
    clients: Client[];
    addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => string;
    updateClient: (id: string, client: Partial<Client>) => void;
    deleteClient: (id: string) => void;
    getClient: (id: string) => Client | undefined;
    searchClients: (query: string) => Client[];
}

export const useClientStore = create<ClientState>()(
    persist(
        (set, get) => ({
            clients: MOCK_CLIENTS,
            addClient: (clientData) => {
                const newId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
                set((state) => ({
                    clients: [
                        ...state.clients,
                        {
                            ...clientData,
                            id: newId,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        }
                    ]
                }));
                return newId;
            },
            updateClient: (id, data) => set((state) => ({
                clients: state.clients.map(c =>
                    c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
                )
            })),
            deleteClient: (id) => set((state) => ({
                clients: state.clients.filter(c => c.id !== id)
            })),
            getClient: (id) => get().clients.find(c => c.id === id),
            searchClients: (query) => {
                if (!query.trim()) return [];
                const q = query.toLowerCase();
                return get().clients.filter(c => c.nom.toLowerCase().includes(q));
            }
        }),
        {
            name: 'antigravity-client-store'
        }
    )
);
