import { Facture } from '@/types/facture';
import { useParametresStore } from '@/lib/stores/parametresStore';

/**
 * Format attendu pour un export comptable classique (ex: EBP / Ciel / Sage / Cegid) :
 * Journal | Date | Code Journal | Compte | Libellé | Débit | Crédit | Numéro Pièce
 */

export interface LigneEcriture {
    journal: string; // ex: VTE (Ventes)
    date: string; // Date de la facture (ex: DD/MM/YYYY)
    compte: string; // Compte comptable (ex: 411000, 704000, 445710)
    libelle: string; // Nom du client ou libellé de vente
    piece: string; // Numéro de facture
    debit: number; // Montant TTC versé au compte client
    credit: number; // Montant HT et TVA en crédit
}

export function genererEcrituresComptables(factures: Facture[]): LigneEcriture[] {
    const comptaDefaut = useParametresStore.getState().compta;
    const ecritures: LigneEcriture[] = [];

    factures.forEach((facture) => {
        // Date format DD/MM/YYYY
        const dateFormatted = new Date(facture.dateEmission).toLocaleDateString('fr-FR');
        const journal = 'VTE';
        const numPiece = facture.reference;
        const nomClient = facture.clientName; // En pratique, on devrait lier avec le nom du client via la requête. Ici on utilise l'ID en attendant.

        // 1. Ligne Client (TTC au DEBIT)
        ecritures.push({
            journal,
            date: dateFormatted,
            compte: comptaDefaut?.compteClientDefaut || '411000',
            libelle: `Facture ${numPiece} - Client`, // Idéalement le nom du client
            piece: numPiece,
            debit: facture.montantTTC,
            credit: 0
        });

        // 2. Ligne de Vente (HT au CREDIT)
        // Dans une version plus avancée, on ventilerait par ligne de facture si elles ont des comptes différents.
        // Ici, on globalise le montant HT sur le compte Vente par défaut.
        ecritures.push({
            journal,
            date: dateFormatted,
            compte: comptaDefaut?.compteVenteDefaut || '704000',
            libelle: `Vente ${numPiece}`,
            piece: numPiece,
            debit: 0,
            credit: facture.montantHT
        });

        // 3. Ligne de TVA (Montant TVA au CREDIT)
        if (facture.montantTVA > 0) {
            ecritures.push({
                journal,
                date: dateFormatted,
                compte: comptaDefaut?.compteTvaDefaut || '445710',
                libelle: `TVA ${numPiece}`,
                piece: numPiece,
                debit: 0,
                credit: facture.montantTVA
            });
        }
    });

    return ecritures;
}

export function exportCsvEcritures(ecritures: LigneEcriture[]): void {
    // Entête CSV
    const header = ['Journal', 'Date', 'Compte', 'Libelle', 'Piece', 'Debit', 'Credit'];

    // Lignes CSV
    const rows = ecritures.map(e => [
        e.journal,
        e.date,
        e.compte,
        `"${e.libelle}"`,
        e.piece,
        e.debit.toFixed(2).replace('.', ','),
        e.credit.toFixed(2).replace('.', ',')
    ]);

    // Combiner l'entête et les lignes avec séparateur point-virgule (standard Excel FR)
    const csvContent = [
        header.join(';'),
        ...rows.map(r => r.join(';'))
    ].join('\n');

    // Téléchargement du fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `export_compta_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
