'use client';

import DevisForm from '@/components/devis/DevisForm';
import { mockQuotes } from '@/lib/data/mock-devis';
import { useParams } from 'next/navigation';

export default function EditDevisPage() {
    const params = useParams();
    const id = params.id as string;
    const quote = mockQuotes.find((q) => q.id === id);

    if (!quote) {
        return <div className="p-8 text-center text-gray-500">Devis introuvable</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <DevisForm initialData={quote} />
        </div>
    );
}
