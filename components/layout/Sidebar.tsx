"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    HardHat,
    CalendarDays,
    FileText,
    Receipt,
    FileCheck,
    UserCog,
    Settings,
    Package,
    Layers
} from "lucide-react";

const navigation = [
    { name: "Tableau de Bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chantiers", href: "/chantiers", icon: HardHat },
    { name: "Devis", href: "/devis", icon: FileText },
    { name: "Clients", href: "/clients", icon: UserCog },
    { name: "Articles", href: "/articles", icon: Package },
    { name: "Ouvrages", href: "/ouvrages", icon: Layers },
    { name: "Factures", href: "/factures", icon: Receipt },
    { name: "Paramètres", href: "/parametres", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-white">
            <div className="flex h-16 items-center justify-center border-b px-6">
                <span className="text-xl font-bold text-gray-900">ERP BTP</span>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                    <div className="text-sm">
                        <p className="font-medium text-gray-900">Utilisateur</p>
                        <p className="text-xs text-gray-500">user@example.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
