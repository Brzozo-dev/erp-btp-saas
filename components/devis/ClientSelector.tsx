'use client';

import { useState, useRef, useEffect } from 'react';
import { useClientStore } from '@/lib/stores/clientStore';
import { UserPlus, Search, Building2, MapPin } from 'lucide-react';
import { ClientModal, ClientFormData } from '@/components/clients/ClientModal';

export function ClientSelector({
    selectedClientId,
    onChange
}: {
    selectedClientId: string | null;
    onChange: (clientId: string) => void;
}) {
    const { clients, addClient, searchClients } = useClientStore();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const results = query ? searchClients(query) : clients.slice(0, 5);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
        setQuery('');
    };

    const handleCreate = (data: ClientFormData) => {
        const newId = addClient(data);
        onChange(newId);
        setIsCreating(false);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative" ref={wrapperRef}>
            {isCreating && (
                <ClientModal
                    initialName={query}
                    onSave={handleCreate}
                    onClose={() => setIsCreating(false)}
                />
            )}

            {!isOpen && selectedClient ? (
                <div
                    onClick={() => setIsOpen(true)}
                    className="cursor-pointer group relative p-4 rounded-xl border-2 border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition-all"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-hover:text-blue-500 transition-colors">Client</h3>
                            <p className="text-sm font-bold text-gray-900">{selectedClient.nom}</p>
                            <p className="text-sm text-gray-600 truncate max-w-[200px]">{selectedClient.adresseFacturation}</p>
                            <p className="text-sm text-gray-600">{selectedClient.codePostalFacturation} {selectedClient.villeFacturation}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 p-1.5 bg-blue-100 text-blue-600 rounded-md transition-all">
                            <Search className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 border-2 rounded-xl bg-white shadow-sm border-blue-200 ring-4 ring-blue-50">
                    <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3">Sélectionner un Client</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Rechercher ou créer..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsOpen(true)}
                            className="w-full pl-9 pr-4 h-10 text-sm bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                        />
                    </div>

                    {isOpen && (
                        <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white rounded-xl shadow-xl border border-gray-100 max-h-64 overflow-y-auto z-50">
                            {results.length > 0 ? (
                                <div className="p-1.5">
                                    {results.map((client) => (
                                        <button
                                            key={client.id}
                                            onClick={() => handleSelect(client.id)}
                                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 flex items-start gap-3 transition-colors"
                                        >
                                            <div className="p-2 bg-gray-100 rounded-md shrink-0 mt-0.5">
                                                <Building2 className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm text-gray-900">{client.nom}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    {client.villeFacturation}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : query.length > 0 ? (
                                <div className="p-4 text-center">
                                    <p className="text-sm text-gray-500 mb-3">Aucun client trouvé pour "{query}"</p>
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Créer le client "{query}"
                                    </button>
                                </div>
                            ) : null}

                            {query.length === 0 && (
                                <div className="p-2 border-t border-gray-50 bg-gray-50">
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Créer un nouveau client
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
