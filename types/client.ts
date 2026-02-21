export interface Client {
    id: string;
    nom: string;
    email?: string;
    telephone?: string;
    adresseFacturation: string;
    codePostalFacturation: string;
    villeFacturation: string;
    adresseChantier?: string;
    codePostalChantier?: string;
    villeChantier?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
