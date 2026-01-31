'use client';

import { Building2, TrendingUp, Zap, Users, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <Building2 className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-black text-transparent">
                ERP BTP
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100">
                  Connexion
                </button>
              </Link>
              <Link href="/register">
                <button className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40">
                  <span className="relative z-10">Créer mon compte</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-blue-50 px-5 py-2 ring-2 ring-emerald-500/20">
            <Zap className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700">
              Interface ultra-moderne · Dernières technologies
            </span>
          </div>

          {/* Title */}
          <h2 className="mb-6 text-6xl font-black leading-tight text-gray-900 sm:text-7xl">
            Pilotage Économique
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Simplifié
            </span>
          </h2>

          <p className="mx-auto mb-4 max-w-2xl text-xl font-medium text-gray-600">
            Le seul ERP BTP qui se pilote avec{' '}
            <span className="font-black text-emerald-600">3 chiffres</span>
          </p>
          <p className="mb-10 text-lg text-gray-500">CA · Coûts · MBH</p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/50 transition-all hover:scale-105 hover:shadow-emerald-500/60">
                <span className="relative z-10 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Démarrer gratuitement
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </Link>
            <Link href="/demo">
              <button className="group rounded-xl border-2 border-gray-300 bg-white/80 px-8 py-4 text-lg font-bold text-gray-700 backdrop-blur-sm transition-all hover:scale-105 hover:border-gray-400 hover:bg-white">
                Voir la démo
                <ArrowRight className="ml-2 inline h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-500" />
              <span>Gratuit 30 jours</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-500" />
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-500" />
              <span>Support inclus</span>
            </div>
          </div>
        </div>

        {/* Features Cards */}
        <div className="mt-32 grid gap-8 md:grid-cols-3">
          {/* Card 1 - MBH */}
          <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 p-8 shadow-xl shadow-emerald-500/10 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />
            <div className="relative">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <TrendingUp className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="mb-3 text-2xl font-black text-gray-900">MBH en Temps Réel</h3>
              <p className="text-gray-600 leading-relaxed">
                Suivez votre Marge Brute Horaire <span className="font-bold text-emerald-600">instantanément</span> sur tous vos chantiers.
                Alertes automatiques en cas de dérive.
              </p>
            </div>
          </div>

          {/* Card 2 - Multi-utilisateurs */}
          <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-8 shadow-xl shadow-blue-500/10 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />
            <div className="relative">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <Users className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="mb-3 text-2xl font-black text-gray-900">Multi-Utilisateurs</h3>
              <p className="text-gray-600 leading-relaxed">
                Permissions avancées par rôle. <span className="font-bold text-blue-600">Collaborez efficacement</span> avec votre équipe
                sur tous vos projets.
              </p>
            </div>
          </div>

          {/* Card 3 - Dashboard */}
          <div className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50/30 p-8 shadow-xl shadow-purple-500/10 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20" />
            <div className="relative">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30">
                <Zap className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="mb-3 text-2xl font-black text-gray-900">Dashboard Personnalisable</h3>
              <p className="text-gray-600 leading-relaxed">
                Créez votre <span className="font-bold text-purple-600">tableau de bord sur mesure</span> avec des widgets drag & drop.
                Chaque utilisateur a sa vue.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 p-12 text-center shadow-2xl shadow-emerald-500/50">
          <div className="relative z-10">
            <h3 className="mb-4 text-4xl font-black text-white">
              Prêt à transformer votre gestion de chantier ?
            </h3>
            <p className="mb-8 text-lg text-emerald-50">
              Rejoignez les entreprises qui pilotent leurs chantiers en temps réel
            </p>
            <Link href="/register">
              <button className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-emerald-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
                Créer mon compte gratuitement
                <ArrowRight className="ml-2 inline h-5 w-5" />
              </button>
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-500">
          <p>© 2026 ERP BTP - Pilotage Économique Simplifié</p>
        </div>
      </footer>
    </div>
  );
}
