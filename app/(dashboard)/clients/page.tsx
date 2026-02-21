'use client';

import { useState, useMemo } from 'react';
import { UserCog, Plus, Search, Pencil, Trash2, X, Check, MapPin } from 'lucide-react';
import { useClientStore } from '@/lib/stores/clientStore';
import { Client } from '@/types/client';

import { ClientModal, type ClientFormData } from '@/components/clients/ClientModal';

// ============================================================
// MODALE
// ============================================================

const emptyForm: ClientFormData = {
    nom: '',
    email: '',
    telephone: '',
    adresseFacturation: '',
    codePostalFacturation: '',
    villeFacturation: '',
    adresseChantier: '',
    codePostalChantier: '',
    villeChantier: '',
    notes: '',
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function ClientsPage() {
    const { clients, addClient, updateClient, deleteClient } = useClientStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [editingClient, setEditingClient] = useState<Client | undefined | null>(null);

    // Filter
    const filteredClients = useMemo(() => {
        let result = clients;
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.nom.toLowerCase().includes(q) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                c.villeFacturation.toLowerCase().includes(q)
            );
        }
        return result.sort((a, b) => a.nom.localeCompare(b.nom));
    }, [clients, searchTerm]);

    const handleSave = (data: ClientFormData) => {
        if (editingClient) {
            updateClient(editingClient.id, data);
        } else {
            addClient(data);
        }
        setEditingClient(null);
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {editingClient !== null && (
                <ClientModal
                    client={editingClient}
                    onSave={handleSave}
                    onClose={() => setEditingClient(null)}
                />
            )}

            <div className="max-w-6xl mx-auto p-8">
                {/* En-tête */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <span className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                                <UserCog className="w-6 h-6" />
                            </span>
                            Répertoire Clients
                        </h1>
                        <p className="text-gray-500 mt-1 ml-12">Gérez la base de données de vos clients et leurs adresses de facturation.</p>
                    </div>

                    <button
                        onClick={() => setEditingClient(undefined)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Nouveau Client
                    </button>
                </div>

                {/* Filtres de recherche */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email ou ville..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 h-11 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Liste des Clients */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Adresse Facturation</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredClients.map((client) => {
                                    return (
                                        <tr key={client.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                    {client.nom}
                                                </div>
                                                {client.notes && (
                                                    <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                                                        {client.notes}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 space-y-1 text-sm text-gray-600">
                                                {client.email ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-16 text-xs text-gray-400">Email:</span>
                                                        <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">{client.email}</a>
                                                    </div>
                                                ) : <span className="text-xs text-gray-400 italic">Non renseigné</span>}
                                                {client.telephone && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-16 text-xs text-gray-400">Tél:</span>
                                                        <span>{client.telephone}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {client.adresseFacturation}<br />
                                                        <span className="text-gray-500 font-normal">
                                                            {client.codePostalFacturation} {client.villeFacturation}
                                                        </span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingClient(client)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Voulez-vous vraiment supprimer ce client ?')) {
                                                                deleteClient(client.id);
                                                            }
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            Aucun client trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
