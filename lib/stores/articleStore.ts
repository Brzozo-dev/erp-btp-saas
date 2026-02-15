import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Article {
    id: string;
    reference: string;
    name: string;
    unit: string;
    price: number;
    type: 'MO' | 'MAT' | 'ST';
    category?: string;
}

interface ArticleState {
    articles: Article[];
    addArticle: (article: Omit<Article, 'id'>) => void;
    searchArticles: (query: string) => Article[];
}

// Initial mock data to populate the store if empty
const INITIAL_ARTICLES: Article[] = [
    { id: 'a1', reference: 'MO-GEN', name: 'Main d\'œuvre Générale', unit: 'h', price: 45, type: 'MO', category: 'Main d\'œuvre' },
    { id: 'a2', reference: 'MO-QUAL', name: 'Main d\'œuvre Qualifiée', unit: 'h', price: 60, type: 'MO', category: 'Main d\'œuvre' },
    { id: 'm1', reference: 'MAT-CIM', name: 'Sac Ciment 35kg', unit: 'sac', price: 8.50, type: 'MAT', category: 'Maçonnerie' },
    { id: 'm2', reference: 'MAT-SAB', name: 'Sable 0/4 (Tonne)', unit: 't', price: 35, type: 'MAT', category: 'Maçonnerie' },
    { id: 'm3', reference: 'MAT-PAR', name: 'Parpaing 20x20x50', unit: 'u', price: 1.20, type: 'MAT', category: 'Maçonnerie' },
    { id: 'st1', reference: 'LOC-BEN', name: 'Location Benne 8m3', unit: 'j', price: 150, type: 'ST', category: 'Location' },
    { id: 'st2', reference: 'ST-ELEC', name: 'Forfait Électricien (Sous-traitant)', unit: 'ens', price: 500, type: 'ST', category: 'Électricité' },
];

export const useArticleStore = create<ArticleState>()(
    persist(
        (set, get) => ({
            articles: INITIAL_ARTICLES,

            addArticle: (newArticle) => {
                const article: Article = {
                    ...newArticle,
                    id: Math.random().toString(36).substr(2, 9),
                };
                set((state) => ({
                    articles: [...state.articles, article],
                }));
            },

            searchArticles: (query) => {
                const lowerQuery = query.toLowerCase();
                return get().articles.filter(
                    (a) =>
                        a.name.toLowerCase().includes(lowerQuery) ||
                        a.reference.toLowerCase().includes(lowerQuery)
                );
            },
        }),
        {
            name: 'article-storage',
        }
    )
);
