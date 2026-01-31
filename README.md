# ERP BTP SaaS

**Pilotage Économique Simplifié** - Le seul ERP BTP qui se pilote avec 3 chiffres : CA, Coûts, MBH

## 🚀 Technologies

- **Next.js 16.1.6** avec Turbopack
- **React 19** avec React Compiler
- **TypeScript**
- **Tailwind CSS v3**
- **Firebase** (à venir)
- **Lucide React** pour les icônes
- **Zustand** pour le state management
- **React Hook Form + Zod** pour les formulaires

## 📦 Installation

```bash
npm install
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

Interface moderne basée sur la charte graphique PragmaPlanning :
- Couleur principale : Emerald (#10b981)
- Typographie : Inter
- Effets : Glassmorphism, gradients, ombres colorées

## 📄 Pages

- **/** - Landing page moderne avec hero section
- **/login** - Page de connexion
- **/register** - Page d'inscription
- **/demo** - Démonstration (à venir)

## 🏗️ Structure

```
erp-btp-saas/
├── app/              # Pages Next.js 16 (App Router)
├── components/       # Composants réutilisables
│   └── ui/          # Composants UI (Button, Input, Card)
├── lib/             # Utilitaires et constantes
│   ├── constants.ts # Couleurs et statuts
│   └── utils.ts     # Fonctions de formatage et calculs MBH
└── public/          # Assets statiques
```

## 🎯 Fonctionnalités prévues

### Phase 1 - MVP (4 semaines)
- [x] Infrastructure Next.js + Tailwind
- [x] Design system PragmaPlanning
- [x] Landing page premium
- [x] Pages authentification
- [ ] Configuration Firebase
- [ ] Dashboard personnalisable
- [ ] Gestion clients
- [ ] Module devis
- [ ] Suivi chantiers

### Phase 2 - Avancé (4 semaines)
- [ ] Suivi dépenses mobile-first
- [ ] Facturation
- [ ] Calcul MBH temps réel
- [ ] Analytics avancés
- [ ] Contrats de maintenance

### Phase 3 - Premium (3 semaines)
- [ ] Gestion permissions avancée
- [ ] PWA mobile
- [ ] Intégrations Open Banking
- [ ] Portail client

## 📝 License

Propriétaire - © 2026 ERP BTP

## 👨‍💻 Auteur

Emmanuel BRZOZOWSKI
