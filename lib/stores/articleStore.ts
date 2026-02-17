import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ArticleType = 'MOD' | 'FOURNITURE' | 'MATERIEL' | 'SOUS_TRAITANCE';

export interface Article {
    id: string;
    reference: string;
    designation: string;
    description?: string;
    unite: string;
    prixUnitaire: number;
    type: ArticleType;
}

interface ArticleState {
    articles: Article[];
    addArticle: (article: Omit<Article, 'id'>) => Article;
    updateArticle: (id: string, data: Partial<Omit<Article, 'id'>>) => void;
    updateArticlePrice: (id: string, newPrice: number) => void;
    deleteArticle: (id: string) => void;
    searchArticles: (query: string, type?: ArticleType) => Article[];
    getArticleById: (id: string) => Article | undefined;
}

let nextId = 100;
function generateId(): string {
    return 'art_' + (nextId++) + '_' + Math.random().toString(36).substr(2, 5);
}

const INITIAL_ARTICLES: Article[] = [
    // MOD
    { id: 'a-mod-1', reference: 'MOD-001', designation: 'Main d\'œuvre directe', description: 'Ouvrier paysagiste qualifié', unite: 'H', prixUnitaire: 23.50, type: 'MOD' },
    { id: 'a-mod-2', reference: 'MOD-002', designation: 'Main d\'œuvre directe (perche)', description: 'Élagueur certifié travail en hauteur', unite: 'H', prixUnitaire: 28.00, type: 'MOD' },
    { id: 'a-mod-3', reference: 'MOD-003', designation: 'Main d\'œuvre directe plantation', description: 'Ouvrier spécialisé plantation', unite: 'H', prixUnitaire: 23.50, type: 'MOD' },
    { id: 'a-mod-4', reference: 'MOD-004', designation: 'Chef d\'équipe', description: 'Chef d\'équipe paysagiste', unite: 'H', prixUnitaire: 32.00, type: 'MOD' },
    // FOURNITURE
    { id: 'a-frn-1', reference: 'FRN-001', designation: 'Arbre tige 16/18 (pépinière)', description: 'Arbre d\'alignement calibre 16/18', unite: 'U', prixUnitaire: 280.00, type: 'FOURNITURE' },
    { id: 'a-frn-2', reference: 'FRN-002', designation: 'Tuteurs, liens et protection', description: 'Kit complet tuteurage arbre', unite: 'ens', prixUnitaire: 45.00, type: 'FOURNITURE' },
    { id: 'a-frn-3', reference: 'FRN-003', designation: 'Semence gazon sport/agrément', description: 'Mélange graminées sport/agrément', unite: 'Kg', prixUnitaire: 12.00, type: 'FOURNITURE' },
    { id: 'a-frn-4', reference: 'FRN-004', designation: 'Terreau végétal + amendement', description: 'Terreau enrichi pour plantations', unite: 'M3', prixUnitaire: 65.00, type: 'FOURNITURE' },
    { id: 'a-frn-5', reference: 'FRN-005', designation: 'Panneau de chantier + consommables', description: 'Signalétique et consommables chantier', unite: 'ens', prixUnitaire: 310.20, type: 'FOURNITURE' },
    { id: 'a-frn-6', reference: 'FRN-006', designation: 'Déchets verts', description: 'Évacuation déchets verts en déchetterie', unite: 'M3', prixUnitaire: 18.00, type: 'FOURNITURE' },
    { id: 'a-frn-7', reference: 'FRN-007', designation: 'Fourniture réseau arrosage', description: 'Tuyaux, asperseurs, électrovannes', unite: 'ens', prixUnitaire: 3200.00, type: 'FOURNITURE' },
    { id: 'a-frn-8', reference: 'FRN-008', designation: 'Programmateur Hunter Pro-HC', description: 'Programmateur arrosage 12 zones', unite: 'U', prixUnitaire: 450.00, type: 'FOURNITURE' },
    { id: 'a-frn-9', reference: 'FRN-009', designation: 'Clôture heras et sabots', description: 'Échamat Kernst — protection végétation', unite: 'ens', prixUnitaire: 4250.00, type: 'FOURNITURE' },
    // MATERIEL
    { id: 'a-mat-1', reference: 'MAT-001', designation: 'Location mini-pelle 5T', description: 'Mini-pelle Kubota ou équivalent', unite: 'J', prixUnitaire: 350.00, type: 'MATERIEL' },
    { id: 'a-mat-2', reference: 'MAT-002', designation: 'Loca grue automotrice', description: 'Grue 30T automotrice avec chauffeur', unite: 'J', prixUnitaire: 1200.00, type: 'MATERIEL' },
    { id: 'a-mat-3', reference: 'MAT-003', designation: 'Location broyeur branche', description: 'Broyeur thermique ∅15cm', unite: 'J', prixUnitaire: 200.00, type: 'MATERIEL' },
    { id: 'a-mat-4', reference: 'MAT-004', designation: 'Rogneuse de souche en location', description: 'Rogneuse autoportée', unite: 'J', prixUnitaire: 250.00, type: 'MATERIEL' },
    // SOUS_TRAITANCE
    { id: 'a-st-1', reference: 'ST-001', designation: 'Évacuation déchets (benne 15m³)', description: 'Benne 15m³ avec transport', unite: 'U', prixUnitaire: 620.40, type: 'SOUS_TRAITANCE' },
    { id: 'a-st-2', reference: 'ST-002', designation: 'Sous-traitance plomberie raccordement', description: 'Raccordement arrosage réseau eau', unite: 'Ft', prixUnitaire: 1800.00, type: 'SOUS_TRAITANCE' },
];

export const useArticleStore = create<ArticleState>()(
    persist(
        (set, get) => ({
            articles: INITIAL_ARTICLES,

            addArticle: (newArticle) => {
                const article: Article = {
                    ...newArticle,
                    id: generateId(),
                };
                set((state) => ({
                    articles: [...state.articles, article],
                }));
                return article;
            },

            updateArticle: (id, data) => {
                set((state) => ({
                    articles: state.articles.map((a) =>
                        a.id === id ? { ...a, ...data } : a
                    ),
                }));
            },

            updateArticlePrice: (id, newPrice) => {
                set((state) => ({
                    articles: state.articles.map((a) =>
                        a.id === id ? { ...a, prixUnitaire: newPrice } : a
                    ),
                }));
            },

            deleteArticle: (id) => {
                set((state) => ({
                    articles: state.articles.filter((a) => a.id !== id),
                }));
            },

            searchArticles: (query, type) => {
                const lowerQuery = query.toLowerCase();
                return get().articles.filter((a) => {
                    const matchQuery =
                        !query ||
                        a.designation.toLowerCase().includes(lowerQuery) ||
                        a.reference.toLowerCase().includes(lowerQuery) ||
                        (a.description && a.description.toLowerCase().includes(lowerQuery));
                    const matchType = !type || a.type === type;
                    return matchQuery && matchType;
                });
            },

            getArticleById: (id) => {
                return get().articles.find((a) => a.id === id);
            },
        }),
        {
            name: 'article-storage-v2',
        }
    )
);

export { INITIAL_ARTICLES };
