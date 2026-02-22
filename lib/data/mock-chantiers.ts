import { Chantier } from '@/types/chantier';

export const mockChantiers: Chantier[] = [
    {
        id: 'chantier_1',
        nom: 'Rénovation Lycée Saint-Exupéry',
        description: 'Réfection complète du bâtiment principal, incluant façade et menuiseries',
        clientId: 'c1',
        dateDebut: '2026-06-15',
        statut: 'EN_COURS',
        devisIds: ['1'], // Fait référence au mock de devis "DEV-2026-001"
        pointagesHoraires: [
            { id: 'ptg_1', date: '2026-06-16', ouvrier: 'Marc Durand', heures: 8, commentaire: 'Installation chantier' },
            { id: 'ptg_2', date: '2026-06-17', ouvrier: 'Marc Durand', heures: 7, commentaire: 'Montage échafaudage' },
            { id: 'ptg_3', date: '2026-06-17', ouvrier: 'Paul Dubois', heures: 7, commentaire: 'Aide montage' }
        ],
        depenses: [
            { id: 'dep_1', date: '2026-06-12', type: 'MATERIEL', montantHT: 450, fournisseur: 'LocaBat', reference: 'FAC-876', commentaire: 'Location échafaudage Semaine 1' },
            { id: 'dep_2', date: '2026-06-14', type: 'FOURNITURE', montantHT: 1200, fournisseur: 'Point P', reference: 'BL-99321', commentaire: 'Enduit + Peinture' }
        ]
    },
    {
        id: 'chantier_2',
        nom: 'Toiture Résidence Les Pins',
        description: 'Remplacement des tuiles et isolation des combles',
        clientId: 'c3',
        dateDebut: '2026-05-01',
        statut: 'TERMINE',
        devisIds: ['3'], // Fait référence au mock "DEV-2026-003"
        pointagesHoraires: [],
        depenses: [] // Sera rempli dynamiquement ou laissé vide pour le mock initial
    }
];
