'use client';

import { Building2 } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="mb-8 flex items-center justify-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500">
                        <Building2 className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">ERP BTP</h1>
                </Link>

                {/* Card d'inscription */}
                <Card>
                    <CardHeader>
                        <CardTitle>Créer mon compte</CardTitle>
                        <CardDescription>
                            Démarrez gratuitement, aucune carte bancaire requise
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Prénom"
                                    type="text"
                                    placeholder="Jean"
                                    required
                                />
                                <Input
                                    label="Nom"
                                    type="text"
                                    placeholder="Dupont"
                                    required
                                />
                            </div>

                            <Input
                                label="Email professionnel"
                                type="email"
                                placeholder="vous@entreprise.fr"
                                required
                            />

                            <Input
                                label="Nom de l'entreprise"
                                type="text"
                                placeholder="Ma Société BTP"
                                required
                            />

                            <Input
                                label="Mot de passe"
                                type="password"
                                placeholder="••••••••"
                                required
                            />

                            <Input
                                label="Confirmer le mot de passe"
                                type="password"
                                placeholder="••••••••"
                                required
                            />

                            <label className="flex items-start gap-2 text-sm">
                                <input type="checkbox" className="mt-0.5 rounded border-gray-300" required />
                                <span className="text-gray-700">
                                    J'accepte les{' '}
                                    <Link href="/terms" className="text-emerald-600 hover:text-emerald-700">
                                        conditions générales
                                    </Link>{' '}
                                    et la{' '}
                                    <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">
                                        politique de confidentialité
                                    </Link>
                                </span>
                            </label>

                            <Button type="submit" className="w-full" size="lg">
                                Créer mon compte
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-4 text-gray-500">Ou continuer avec</span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full gap-2">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            S'inscrire avec Google
                        </Button>

                        <p className="mt-6 text-center text-sm text-gray-600">
                            Vous avez déjà un compte ?{' '}
                            <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
                                Se connecter
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
