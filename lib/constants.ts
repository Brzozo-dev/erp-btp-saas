export const COLORS = {
  // Couleurs utilisateur (comme PragmaPlanning)
  users: [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-yellow-600',
  ],
  
  // Couleurs système
  primary: '#10b981', // emerald-500
  secondary: '#3b82f6', // blue-500
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
} as const;

export const STATUS_COLORS = {
  // Devis
  BROUILLON: 'bg-gray-300 text-gray-800',
  EN_ATTENTE_VALIDATION: 'bg-yellow-100 text-yellow-800',
  VALIDE: 'bg-blue-100 text-blue-800',
  ENVOYE: 'bg-indigo-100 text-indigo-800',
  ACCEPTE: 'bg-emerald-100 text-emerald-800',
  REFUSE: 'bg-red-100 text-red-800',
  ANNULE: 'bg-gray-100 text-gray-600',
  
  // Chantiers
  NON_DEMARRE: 'bg-gray-200 text-gray-700',
  EN_COURS: 'bg-blue-500 text-white',
  TERMINE: 'bg-emerald-500 text-white',
  CLOTURE: 'bg-gray-500 text-white',
  
  // Factures
  PAYEE: 'bg-emerald-500 text-white',
  EN_ATTENTE: 'bg-yellow-500 text-white',
  EN_RETARD: 'bg-red-500 text-white',
} as const;

export const MBH_COLORS = {
  excellent: 'text-emerald-600 bg-emerald-50',
  good: 'text-emerald-500 bg-emerald-50',
  warning: 'text-orange-500 bg-orange-50',
  danger: 'text-red-500 bg-red-50',
} as const;
