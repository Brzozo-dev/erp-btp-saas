'use client';

import { useState } from 'react';
import { mockQuotes } from '@/lib/data/mock-devis';
import { Quote, QuoteStatus } from '@/types/devis';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Plus, Search, Filter } from 'lucide-react';

const statusColors: Record<QuoteStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REFUSED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-500 line-through',
};

const statusLabels: Record<QuoteStatus, string> = {
    DRAFT: 'Brouillon',
    SENT: 'Envoyé',
    ACCEPTED: 'Accepté',
    REFUSED: 'Refusé',
    CANCELLED: 'Annulé',
};

export default function DevisList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'ALL'>('ALL');

    const filteredQuotes = mockQuotes.filter((quote) => {
        const matchesSearch =
            quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || quote.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
                    <p className="text-gray-500">Gérez vos devis et propositions commerciales</p>
                </div>
                <Link href="/devis/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nouveau Devis
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un devis, un client..."
                        className="pl-10 w-full h-10 rounded-md border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        className="h-10 rounded-md border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | 'ALL')}
                    >
                        <option value="ALL">Tous les statuts</option>
                        <option value="DRAFT">Brouillon</option>
                        <option value="SENT">Envoyé</option>
                        <option value="ACCEPTED">Accepté</option>
                        <option value="REFUSED">Refusé</option>
                        <option value="CANCELLED">Annulé</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant HT</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredQuotes.map((quote) => (
                            <tr key={quote.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <Link href={`/devis/${quote.id}`} className="hover:text-emerald-600">
                                        {quote.reference}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{quote.clientName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{quote.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(quote.totalHT)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[quote.status]}`}>
                                        {statusLabels[quote.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/devis/${quote.id}`} className="text-emerald-600 hover:text-emerald-900 mr-4">
                                        Éditer
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {filteredQuotes.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    Aucun devis trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
