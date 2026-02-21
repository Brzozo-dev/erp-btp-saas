'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Client } from '@/types/client';

export type ClientFormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;

const emptyForm: ClientFormData = {
    nom: '',
    email: '',
    telephone: '',
    adresseFacturation: '',
    codePostalFacturation: '',
    villeFacturation: '',
    adresseChantier: '',
    codePostalChantier: '',
    villeChantier: '',
    notes: '',
};

export function ClientModal({
    client,
    initialName,
    onSave,
    onClose,
}: {
    client?: Client;
    initialName?: string;
    onSave: (data: ClientFormData) => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState<ClientFormData>(
        client
            ? {
                nom: client.nom,
                email: client.email || '',
                telephone: client.telephone || '',
                adresseFacturation: client.adresseFacturation,
                codePostalFacturation: client.codePostalFacturation,
                villeFacturation: client.villeFacturation,
                adresseChantier: client.adresseChantier || '',
                codePostalChantier: client.codePostalChantier || '',
                villeChantier: client.villeChantier || '',
                notes: client.notes || '',
            }
            : { ...emptyForm, nom: initialName || '' }
    );

    const isEdit = !!client;
    const canSave = form.nom.trim().length > 0 && form.adresseFacturation.trim().length > 0 && form.villeFacturation.trim().length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 flex justify-between items-center shrink-0">
                    <h2 className="text-white font-bold text-lg">
                        {isEdit ? 'Modifier le client' : 'Nouveau client'}
                    </h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Infos Générales */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Informations Générales</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom / Raison sociale *</label>
                                <input
                                    type="text"
                                    value={form.nom}
                                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                                    placeholder="Nom de l'entreprise ou du particulier"
                                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="contact@exemple.com"
                                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
                                <input
                                    type="tel"
                                    value={form.telephone}
                                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                                    placeholder="06 12 34 56 78"
                                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Adresse Facturation */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Adresse de Facturation</h3>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse *</label>
                            <input
                                type="text"
                                value={form.adresseFacturation}
                                onChange={(e) => setForm({ ...form, adresseFacturation: e.target.value })}
                                placeholder="123 rue de la Paix"
                                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Code Postal *</label>
                                <input
                                    type="text"
                                    value={form.codePostalFacturation}
                                    onChange={(e) => setForm({ ...form, codePostalFacturation: e.target.value })}
                                    placeholder="75000"
                                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Ville *</label>
                                <input
                                    type="text"
                                    value={form.villeFacturation}
                                    onChange={(e) => setForm({ ...form, villeFacturation: e.target.value })}
                                    placeholder="Paris"
                                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Adresse Chantier */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-sm font-bold text-gray-900">Adresse de Chantier par défaut</h3>
                            <button
                                type="button"
                                onClick={() => setForm({
                                    ...form,
                                    adresseChantier: form.adresseFacturation,
                                    codePostalChantier: form.codePostalFacturation,
                                    villeChantier: form.villeFacturation
                                })}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                                Copier l'adresse de facturation
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse</label>
                            <input
                                type="text"
                                value={form.adresseChantier}
                                onChange={(e) => setForm({ ...form, adresseChantier: e.target.value })}
                                placeholder="Idem facturation..."
                                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Code Postal</label>
                                <input
                                    type="text"
                                    value={form.codePostalChantier}
                                    onChange={(e) => setForm({ ...form, codePostalChantier: e.target.value })}
                                    placeholder="75000"
                                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Ville</label>
                                <input
                                    type="text"
                                    value={form.villeChantier}
                                    onChange={(e) => setForm({ ...form, villeChantier: e.target.value })}
                                    placeholder="Paris"
                                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Notes internes</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Informations supplémentaires sur le client..."
                            className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-y"
                        />
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => {
                            if (canSave) onSave(form);
                        }}
                        disabled={!canSave}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${canSave
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Check className="w-4 h-4" />
                        {isEdit ? 'Enregistrer' : 'Créer le client'}
                    </button>
                </div>
            </div>
        </div>
    );
}
