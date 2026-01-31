'use client';

import { Building2, Mail, Lock, Chrome } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="mb-8 flex items-center justify-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/30">
                        <Building2 className="h-8 w-8 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-black text-transparent">
                        ERP BTP
                    </h1>
                </Link>

                {/* Card de connexion */}
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
                    <div className="mb-6">
                        <h2 className="mb-2 text-3xl font-black text-gray-900">Connexion</h2>
                        <p className="text-gray-600">Connectez-vous à votre espace de gestion</p>
                    </div>

                    <form className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Email professionnel
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="vous@entreprise.fr"
                                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pl-11 pr-4 font-medium text-gray-900 transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pl-11 pr-4 font-medium text-gray-900 transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                                />
                                Se souvenir de moi
                            </label>
                            <Link href="/forgot-password" className="font-bold text-emerald-600 hover:text-emerald-700">
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/40"
                        >
                            <span className="relative z-10">Se connecter</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-4 font-bold text-gray-500">Ou continuer avec</span>
                        </div>
                    </div>

                    <button className="group flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-300 bg-white py-3.5 font-bold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50">
                        <Chrome className="h-5 w-5" />
                        Google
                    </button>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Pas encore de compte ?{' '}
                        <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
