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
    { name: "Commandes", href: "/commandes", icon: FileCheck },
    { name: "Clients", href: "/clients", icon: UserCog },
    { name: "Articles", href: "/articles", icon: Package },
    { name: "Ouvrages", href: "/ouvrages", icon: Layers },
    { name: "Factures", href: "/factures", icon: Receipt },
    { name: "Paramètres", href: "/parametres", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col" style={{ backgroundColor: '#3d2b1f', borderRight: '1px solid #2a1d15' }}>
            {/* Logo / App Name */}
            <div className="flex h-16 items-center gap-3 px-5" style={{ borderBottom: '1px solid #4d3a2b' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{ backgroundColor: '#10b981' }}>
                    <HardHat className="text-white" size={20} />
                </div>
                <div>
                    <h1 className="text-sm font-black tracking-widest leading-none text-white">
                        PragmaGestion
                    </h1>
                    <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#10b981' }}>
                        ERP BTP
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isActive
                                ? "text-white shadow-lg"
                                : "text-white/50 hover:text-white/80"
                                }`}
                            style={isActive ? { backgroundColor: '#10b981' } : {}}
                            onMouseEnter={(e) => {
                                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)';
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = '';
                            }}
                        >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer utilisateur */}
            <div className="p-4" style={{ borderTop: '1px solid #4d3a2b' }}>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black text-white"
                        style={{ backgroundColor: '#065f46' }}>
                        U
                    </div>
                    <div className="text-xs">
                        <p className="font-bold text-white leading-none">Utilisateur</p>
                        <p className="text-white/40 text-[10px] mt-0.5">Administrateur</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
